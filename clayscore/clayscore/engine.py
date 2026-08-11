"""Moteur de match : relie le pipeline vision/audio à la machine à états.

En SIMULATION, chaque « lancer » génère un clip synthétique (le plateau), le
passe dans le pipeline (détection tir + verdict), et propose un verdict + un
ralenti (le clip lui-même, rejoué au ralenti par la PWA). L'humain valide ou
corrige (CASSÉ / MANQUÉ / NO BIRD) ; la rotation n'avance qu'à la validation.

En RÉEL (jalons 6-7), la source de plateaux sera remplacée par le flux caméra
continu segmenté par lancement — même interface `next_plateau()`.
"""
from __future__ import annotations

import json
import threading
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional

from .game.state_machine import Partie
from .labeling import LabeledStore
from .sources.audio_file import read_wav_mono
from .sources.video_file import FileVideoSource
from .vision.verdict import VerdictConfig, decide_verdict
from .tools_bridge import synth  # import différé/robuste (voir plus bas)


# Répartition des scénarios simulés (réaliste : surtout des cassés/manqués).
SCENARIO_WEIGHTS = [("casse", 5), ("manque", 4), ("nobird", 1)]
BACKGROUNDS = ("ciel", "foret", "contrejour")


@dataclass
class Analysis:
    plateau_id: int
    clip_url: str            # URL du ralenti (mp4) servi par le serveur
    auto_verdict: str        # verdict proposé (casse/manque/nobird/ambigu)
    best_guess: str          # meilleure hypothèse même si ambigu
    confidence: float
    ambiguous: bool
    gunshot: bool
    reasons: List[str] = field(default_factory=list)
    truth: Optional[str] = None   # vérité terrain (simulation only, pour audit)


class SimulationSource:
    """Génère des plateaux synthétiques à la demande (mode simulation)."""

    def __init__(self, clips_dir: str, seed_base: int = 1000):
        self.clips_dir = Path(clips_dir)
        self.clips_dir.mkdir(parents=True, exist_ok=True)
        self._seed = seed_base
        self._id = 0
        # Séquence pseudo-aléatoire déterministe des scénarios.
        self._bag: List[str] = []

    def _next_scenario(self) -> str:
        if not self._bag:
            bag = []
            for name, w in SCENARIO_WEIGHTS:
                bag += [name] * w
            # Mélange déterministe basé sur la graine.
            import random
            random.Random(self._seed).shuffle(bag)
            self._bag = bag
        return self._bag.pop()

    def next_plateau(self, v_cfg: Optional[VerdictConfig] = None) -> Analysis:
        self._id += 1
        self._seed += 1
        scenario = self._next_scenario()
        background = BACKGROUNDS[self._seed % len(BACKGROUNDS)]
        name = f"plateau_{self._id:04d}"
        params = synth.SynthParams(
            scenario=scenario, background=background,
            width=320, height=240, duration_s=2.5, seed=self._seed,
        )
        paths = synth.generate(params, str(self.clips_dir / name))
        # Le ralenti est lu dans un <video> par la tablette : il doit être en
        # H.264 (OpenCV écrit du FMP4, illisible en navigateur/iOS).
        try:
            from .replay import ensure_web_playable
            ensure_web_playable(paths["video"])
        except Exception:  # noqa: BLE001 - ne jamais bloquer une partie
            pass
        data, sr = read_wav_mono(paths["audio"])
        result = decide_verdict(
            FileVideoSource(paths["video"]), data, sr, v_cfg=v_cfg)
        return Analysis(
            plateau_id=self._id,
            clip_url=f"/clips/{name}.mp4",
            auto_verdict=result.verdict,
            best_guess=result.best_guess,
            confidence=round(result.confidence, 3),
            ambiguous=(result.verdict == "ambigu"),
            gunshot=result.evidence.gunshot_frame is not None,
            reasons=result.reasons,
            truth=synth.VERDICT_BY_SCENARIO[scenario],
        )


class MatchEngine:
    """État global d'un match (une ligne de tir) + pipeline de simulation."""

    def __init__(self, clips_dir: str = "data/clips", source=None,
                 state_path: Optional[str] = None,
                 labeled_dir: Optional[str] = None):
        self._lock = threading.Lock()
        # `source` : objet exposant next_plateau() (SimulationSource par défaut,
        # ou LiveMatchSource en mode réel/fichier continu — jalon 7).
        self.sim = source if source is not None else SimulationSource(clips_dir)
        self.partie: Optional[Partie] = None
        self.pending: Optional[Analysis] = None
        self.auto_mode = False   # si True : valide seul les verdicts sûrs
        # Reprise d'état après crash (watchdog) : on journalise chaque verdict.
        self.state_path = state_path
        self._cfg: Optional[Dict] = None
        self._log: List[Dict] = []
        # Collecte des cas arbitrés par l'humain -> data/labeled/ (IA v2).
        self._labeled = LabeledStore(labeled_dir) if labeled_dir else None

    # --- cycle de vie du match --------------------------------------- #
    def new_game(self, discipline: str, shooters: List[str],
                 serie: int = 25, cartouches: Optional[int] = None,
                 auto_mode: bool = False) -> Dict:
        with self._lock:
            self.partie = Partie(discipline, shooters, serie, cartouches)
            self.pending = None
            self.auto_mode = bool(auto_mode)
            self._cfg = {"discipline": discipline, "shooters": shooters,
                         "serie": serie, "cartouches": cartouches,
                         "auto_mode": bool(auto_mode)}
            self._log = []
            self._persist()
            return self._state_locked()

    def _require(self) -> Partie:
        if self.partie is None:
            raise RuntimeError("Aucune partie en cours — appelez new_game().")
        return self.partie

    def throw(self) -> Dict:
        """Analyse le prochain plateau (sans valider si arbitrage requis)."""
        with self._lock:
            p = self._require()
            if p.finished:
                raise RuntimeError("La partie est terminée.")
            analysis = self.sim.next_plateau()
            if analysis is None:
                raise RuntimeError("Plus de plateaux disponibles dans le flux.")
            self.pending = analysis
            committed = None
            # Auto-validation seulement si activée ET verdict sûr (non ambigu).
            if self.auto_mode and not analysis.ambiguous:
                committed = self._commit_locked(analysis.best_guess, 1)
            return {
                "analysis": analysis.__dict__,
                "committed": committed,
                "state": self._state_locked(),
            }

    def commit(self, verdict: Optional[str] = None, cartridge: int = 1) -> Dict:
        """Valide un verdict (celui de l'humain, ou l'auto si `verdict` None)."""
        with self._lock:
            p = self._require()
            if self.pending is None and verdict is None:
                raise RuntimeError("Aucun plateau à valider.")
            pending = self.pending
            v = verdict if verdict is not None else (
                pending.best_guess if pending else "manque")
            # Archive les cas arbitrés par l'humain (ambigu, ou correction de
            # l'auto) -> data/labeled/ pour l'entraînement futur de l'IA v2.
            if self._labeled is not None and pending is not None:
                overridden = verdict is not None and verdict != pending.best_guess
                if pending.ambiguous or overridden:
                    try:
                        self._labeled.add_sample(
                            v, clip_url=pending.clip_url,
                            auto_verdict=pending.auto_verdict,
                            confidence=pending.confidence,
                            meta={"plateau_id": pending.plateau_id})
                    except Exception:  # noqa: BLE001 - ne jamais bloquer le jeu
                        pass
            outcome = self._commit_locked(v, cartridge)
            return {"outcome": outcome, "state": self._state_locked()}

    def _commit_locked(self, verdict: str, cartridge: int) -> Dict:
        p = self._require()
        out = p.submit_verdict(verdict, cartridge)
        self.pending = None
        self._log.append({"verdict": verdict, "cartridge": cartridge})
        self._persist()
        return {
            "kind": out.kind,
            "shooter": out.shooter,
            "post": out.post,
            "message": out.message,
        }

    # --- reprise d'état (watchdog / crash) --------------------------- #
    def _persist(self) -> None:
        if not self.state_path or self._cfg is None:
            return
        try:
            Path(self.state_path).parent.mkdir(parents=True, exist_ok=True)
            data = {"cfg": self._cfg, "log": self._log,
                    "finished": bool(self.partie and self.partie.finished)}
            with open(self.state_path, "w", encoding="utf-8") as fh:
                json.dump(data, fh, ensure_ascii=False)
        except Exception:  # noqa: BLE001 - la persistance ne doit jamais planter le jeu
            pass

    def restore_from_disk(self) -> bool:
        """Rejoue le journal pour reconstruire un match interrompu. True si repris."""
        if not self.state_path or not Path(self.state_path).exists():
            return False
        try:
            with open(self.state_path, "r", encoding="utf-8") as fh:
                data = json.load(fh)
        except Exception:  # noqa: BLE001
            return False
        cfg = data.get("cfg")
        if not cfg or data.get("finished"):
            return False
        with self._lock:
            self.partie = Partie(cfg["discipline"], cfg["shooters"],
                                 cfg["serie"], cfg["cartouches"])
            self.auto_mode = bool(cfg.get("auto_mode"))
            self._cfg = cfg
            self._log = []
            # Rejoue chaque verdict validé (no-bird compris) -> état exact.
            for entry in data.get("log", []):
                self.partie.submit_verdict(entry["verdict"], entry["cartridge"])
                self._log.append(entry)
            self.pending = None
            return True

    # --- lecture ------------------------------------------------------ #
    def state(self) -> Dict:
        with self._lock:
            return self._state_locked()

    def _state_locked(self) -> Dict:
        if self.partie is None:
            return {"active": False}
        st = self.partie.state()
        st["active"] = True
        st["auto_mode"] = self.auto_mode
        st["pending"] = self.pending.__dict__ if self.pending else None
        return st
