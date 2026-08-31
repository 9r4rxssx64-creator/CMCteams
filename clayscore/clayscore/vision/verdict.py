"""Décision du verdict : CASSÉ / MANQUÉ / NO BIRD / AMBIGU (jalon 3).

Fusionne la vidéo (suivi du plateau + éparpillement des éclats) et l'audio
(instant du coup de feu) sur une fenêtre d'analyse d'environ 800 ms après le
tir, suivant les règles métier ClayScore :

  - Éclats multiples + disparition du plateau APRÈS le tir      -> CASSÉ
  - Trajectoire balistique continue (plateau qui sort du cadre) -> MANQUÉ
  - Éclats détectés AVANT tout coup de feu (parti cassé)        -> NO BIRD
  - Confiance < seuil                                           -> AMBIGU
    (l'UI présente le ralenti, l'humain tranche ; sa décision devient la vérité)

`decide_from_evidence` est une fonction PURE et testable (routage de l'ambigu
vérifiable sans vidéo). `decide_verdict` exécute tout le pipeline sur une source.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional, Tuple

import numpy as np

from ..audio.gunshot import GunshotConfig, detect_gunshots
from ..sources.base import VideoSource
from .detector import DetectorConfig, MotionDetector
from .tracker import KalmanClayTracker, exited_frame

VERDICTS = ("casse", "manque", "nobird", "ambigu")


@dataclass
class VerdictConfig:
    window_ms: float = 800.0            # fenêtre d'analyse après le tir
    confidence_threshold: float = 0.6   # sous ce seuil -> AMBIGU
    scatter_min_blobs: int = 3          # éparpillement FORT (>=3 éclats orange)
    weak_scatter_blobs: int = 2         # éparpillement FAIBLE (>=2), utile sans tir
    orange_min_ratio: float = 0.10      # blob « orange » (plateau/éclat) si >= ce ratio
    scatter_spread_frac: float = 0.06   # étendue mini des éclats (frac de min(W,H)) :
    #   une VRAIE explosion s'étale ; un plateau simplement scindé par le
    #   détecteur reste compact => pas de faux éparpillement.
    gunshot_tolerance_frames: int = 2   # marge autour de l'instant du tir
    vanish_tight_ms: float = 350.0      # disparition en vol = bris SEULEMENT si
    #                                     proche du tir (la balle est ~instantanée)


@dataclass
class VerdictEvidence:
    fps: float
    width: int
    height: int
    launch_frame: Optional[int]
    gunshot_frame: Optional[int]       # depuis l'audio (ou None)
    scatter_frame: Optional[int]       # 1re trame d'éparpillement FORT (>=3 orange)
    weak_scatter_frame: Optional[int]  # 1re trame d'éparpillement FAIBLE (>=2 orange)
    max_scatter_blobs: int
    n_clay_frames: int                 # nb de trames où un plateau propre est suivi
    last_clay_frame: Optional[int]     # dernière trame où le plateau est suivi
    last_clay_pos: Optional[Tuple[float, float]]
    clay_exited: bool                  # dernier point du plateau près d'un bord
    clay_vanished_midair: bool         # plateau disparu EN VOL (pas au bord)
    n_frames: int = 0


@dataclass
class VerdictResult:
    verdict: str                       # casse | manque | nobird | ambigu
    confidence: float
    best_guess: str                    # verdict brut avant arbitrage d'ambiguïté
    evidence: VerdictEvidence
    reasons: List[str] = field(default_factory=list)


def _raw_decision(ev: VerdictEvidence, cfg: VerdictConfig) -> Tuple[str, float, List[str]]:
    """Décision brute + confiance à partir des indices (avant seuil d'ambiguïté)."""
    reasons: List[str] = []
    window_frames = int(round(cfg.window_ms / 1000.0 * ev.fps))
    tight_frames = int(round(cfg.vanish_tight_ms / 1000.0 * ev.fps))
    tol = cfg.gunshot_tolerance_frames
    Gf = ev.gunshot_frame
    Sf = ev.scatter_frame                 # éparpillement fort (>=3 orange)
    Wf = ev.weak_scatter_frame            # éparpillement faible (>=2 orange)

    # Force de l'éparpillement -> confiance sur un bris.
    scatter_strength = min(1.0, max(0.0, (ev.max_scatter_blobs - 2) / 8.0))

    # Disparition en vol (plateau pulvérisé) : n'est un indice de bris que si
    # elle survient PRÈS du tir (la balle est quasi instantanée).
    vanish_frame = (ev.last_clay_frame + 1) if (
        ev.clay_vanished_midair and ev.last_clay_frame is not None) else None

    # -------------------- Aucun coup de feu détecté --------------------
    if Gf is None:
        # Éclats (même faibles) ou disparition en vol AVANT tout tir -> NO BIRD.
        early = Wf if Wf is not None else vanish_frame
        if early is not None:
            reasons.append(
                f"éclats/disparition (trame {early}) SANS aucun coup de feu "
                "-> parti cassé (no bird)")
            return "nobird", min(1.0, 0.82 + 0.18 * scatter_strength), reasons
        # Peu de plateau propre et de l'activité au lancement, mais rien de net.
        if ev.launch_frame is not None and ev.n_clay_frames < 0.25 * max(1, ev.n_frames):
            reasons.append("activité au lancement sans plateau net ni tir -> no bird")
            return "nobird", 0.55, reasons
        reasons.append("ni tir ni bris -> indéterminé")
        return "nobird", 0.35, reasons

    # -------------------- Un coup de feu a été détecté --------------------
    # Bris = éparpillement fort (fenêtre 800 ms) OU disparition en vol serrée au tir.
    break_frame: Optional[int] = Sf
    if vanish_frame is not None and (Gf - tol) <= vanish_frame <= (Gf + tight_frames):
        break_frame = vanish_frame if break_frame is None else min(break_frame, vanish_frame)

    if break_frame is None:
        reasons.append("tir détecté, plateau intact (poursuit sa trajectoire)")
        conf = 0.9 if ev.clay_exited else 0.72
        if ev.n_clay_frames >= 3:
            conf = min(1.0, conf + 0.05)
        return "manque", conf, reasons

    detail = (f"bris (trame {break_frame})"
              + (f", jusqu'à {ev.max_scatter_blobs} éclats" if Sf is not None else
                 ", disparition en vol"))

    if break_frame < Gf - tol:
        reasons.append(f"{detail} AVANT le tir (trame {Gf}) -> parti cassé (no bird)")
        return "nobird", min(1.0, 0.82 + 0.18 * scatter_strength), reasons

    if break_frame <= Gf + window_frames:
        reasons.append(f"{detail} dans la fenêtre après le tir (trame {Gf}) -> cassé")
        conf = 0.68 + 0.32 * scatter_strength
        if ev.clay_vanished_midair:
            conf = min(1.0, conf + 0.08)
        return "casse", conf, reasons

    # Bris bien au-delà de la fenêtre : le plateau a quitté la scène après le tir.
    reasons.append(f"{detail} hors fenêtre après le tir (trame {Gf}) -> raté")
    return "manque", 0.7, reasons


def decide_from_evidence(ev: VerdictEvidence,
                         cfg: Optional[VerdictConfig] = None) -> VerdictResult:
    """Fonction PURE : indices -> verdict (avec routage de l'ambiguïté)."""
    cfg = cfg or VerdictConfig()
    guess, conf, reasons = _raw_decision(ev, cfg)
    if conf < cfg.confidence_threshold:
        reasons.append(
            f"confiance {conf:.2f} < seuil {cfg.confidence_threshold:.2f} "
            "-> arbitrage humain")
        return VerdictResult("ambigu", conf, guess, ev, reasons)
    return VerdictResult(guess, conf, guess, ev, reasons)


def _collect_evidence(source: VideoSource, gunshot_frame: Optional[int],
                      det_cfg: DetectorConfig,
                      v_cfg: VerdictConfig) -> VerdictEvidence:
    """Parcourt la vidéo : suit le plateau, repère l'éparpillement des éclats."""
    detector = MotionDetector(det_cfg)
    tracker: Optional[KalmanClayTracker] = None
    fps = 30.0
    w = h = 0
    area_img = 1.0
    launch_frame: Optional[int] = None
    scatter_frame: Optional[int] = None
    weak_scatter_frame: Optional[int] = None
    max_scatter_blobs = 0
    n_clay_frames = 0
    last_clay_frame: Optional[int] = None
    n_frames = 0

    with source as src:
        for frame in src:
            if tracker is None:
                fps = src.fps
                w, h = frame.width, frame.height
                area_img = float(w * h)
                tracker = KalmanClayTracker(fps)
            n_frames = frame.index + 1
            dets = detector.process(frame)
            if dets and launch_frame is None:
                launch_frame = frame.index

            # Blobs ORANGE (plateau ou éclats). On suit le plateau via le plus
            # gros blob orange, pas via `is_clay` (trop strict : un plateau qui
            # passe devant un nuage perd sa rondeur mais reste orange).
            noise_min = det_cfg.noise_area_min_frac * area_img
            orange = [
                d for d in dets
                if d.orange_ratio >= v_cfg.orange_min_ratio and d.area >= noise_min
            ]
            best = max(orange, key=lambda d: d.area) if orange else None
            meas = (best.cx, best.cy) if best is not None else None
            tracker.update(frame.index, meas)
            if best is not None:
                n_clay_frames += 1
                last_clay_frame = frame.index

            # Éparpillement d'éclats = plusieurs blobs ORANGE séparés simultanés.
            # (En vol normal il n'y a qu'UN blob orange : le plateau. Le bruit du
            #  capteur est gris, jamais orange -> pas de faux éparpillement.)
            n_orange = len(orange)
            # Étendue spatiale des éclats orange (diagonale de leur boîte).
            spread = 0.0
            if n_orange >= 2:
                xs = [d.cx for d in orange]
                ys = [d.cy for d in orange]
                spread = float(np.hypot(max(xs) - min(xs), max(ys) - min(ys)))
            spread_min = v_cfg.scatter_spread_frac * min(w, h)
            spread_ok = spread >= spread_min

            if n_orange >= v_cfg.weak_scatter_blobs and spread_ok \
                    and weak_scatter_frame is None:
                weak_scatter_frame = frame.index
            if n_orange >= v_cfg.scatter_min_blobs and spread_ok:
                if scatter_frame is None:
                    scatter_frame = frame.index
                max_scatter_blobs = max(max_scatter_blobs, n_orange)

    clay_exited = exited_frame(tracker.last_measured, w, h) if tracker else False
    # Disparu EN VOL = suivi un moment, dernier point PAS au bord, et il reste
    # des trames après (le plateau n'est simplement plus là).
    clay_vanished_midair = bool(
        last_clay_frame is not None
        and n_clay_frames >= 2
        and not clay_exited
        and last_clay_frame <= n_frames - 3
    )
    return VerdictEvidence(
        fps=fps,
        width=w,
        height=h,
        launch_frame=launch_frame,
        gunshot_frame=gunshot_frame,
        scatter_frame=scatter_frame,
        weak_scatter_frame=weak_scatter_frame,
        max_scatter_blobs=max_scatter_blobs,
        n_clay_frames=n_clay_frames,
        last_clay_frame=last_clay_frame,
        last_clay_pos=tracker.last_measured if tracker else None,
        clay_exited=clay_exited,
        clay_vanished_midair=clay_vanished_midair,
        n_frames=n_frames,
    )


def decide_verdict(
    source: VideoSource,
    audio_samples: np.ndarray,
    sample_rate: int,
    fps_hint: float = 30.0,
    det_cfg: Optional[DetectorConfig] = None,
    v_cfg: Optional[VerdictConfig] = None,
    gun_cfg: Optional[GunshotConfig] = None,
) -> VerdictResult:
    """Pipeline complet : vidéo + audio -> verdict.

    `fps_hint` sert à convertir l'instant du coup de feu (secondes) en n° de
    trame avant de parcourir la vidéo (qui fournit ensuite les fps réels).
    """
    det_cfg = det_cfg or DetectorConfig()
    v_cfg = v_cfg or VerdictConfig()

    shots = detect_gunshots(audio_samples, sample_rate, gun_cfg)
    gunshot_frame = (
        int(round(shots[0].time_s * fps_hint)) if shots else None
    )
    ev = _collect_evidence(source, gunshot_frame, det_cfg, v_cfg)
    # Recale l'instant du tir avec les fps réels de la vidéo si besoin.
    if shots and abs(ev.fps - fps_hint) > 1e-6:
        ev.gunshot_frame = int(round(shots[0].time_s * ev.fps))
    return decide_from_evidence(ev, v_cfg)
