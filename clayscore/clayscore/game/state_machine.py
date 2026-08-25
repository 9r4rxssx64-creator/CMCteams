"""Machine à états d'une partie de ball-trap (jalon 4).

Invariants métier (testés exhaustivement) :
  - La rotation n'avance JAMAIS sans un verdict validé (cassé/manqué).
  - NO BIRD => rotation GELÉE : même tireur, même poste, on rejoue le plateau
    (pour un doublé, on rejoue le doublé entier).
  - Un doublé = 2 plateaux => 2 verdicts avant de valider le tour.
  - Fiche par tireur, stats par poste et par machine, export CSV.

Le verdict fourni est déjà arbitré (cassé/manqué/no-bird). L'ambiguïté est
résolue en amont (par l'humain via l'UI, jalon 5) : ici on n'accepte que les
trois verdicts définitifs.
"""
from __future__ import annotations

import csv
import io
from dataclasses import dataclass, field
from typing import Dict, List, Optional

from .disciplines import Discipline, get_discipline

FINAL_VERDICTS = ("casse", "manque", "nobird")


@dataclass
class ClayResult:
    shooter_idx: int
    shooter: str
    clay_no: int          # n° du plateau pour ce tireur (1-based, hors no-bird)
    post: int
    machine: str
    in_double: bool
    verdict: str          # casse | manque
    cartridge: int        # cartouche qui a cassé (1/2), sinon nb tiré
    points: int
    nobird_replays: int   # nb de no-bird rejoués avant que ce tour aboutisse


@dataclass
class Outcome:
    kind: str             # "nobird" | "need_more" | "turn_complete" | "finished"
    shooter: str
    post: int
    message: str
    committed: List[ClayResult] = field(default_factory=list)


class Partie:
    """Déroule une partie complète, plateau par plateau."""

    def __init__(
        self,
        discipline: Discipline | str,
        shooters: List[str],
        serie: int = 25,
        cartouches: Optional[int] = None,
        machines: Optional[List[str]] = None,
        mode: str = "entrainement",
    ):
        self.discipline = (
            discipline if isinstance(discipline, Discipline)
            else get_discipline(discipline)
        )
        if not (1 <= len(shooters) <= 6):
            raise ValueError("Une partie compte de 1 à 6 tireurs.")
        if serie <= 0:
            raise ValueError("La série doit être > 0.")
        self.shooters = list(shooters)
        self.serie = int(serie)
        self.cartouches = int(cartouches or self.discipline.cartridges)

        # MULTI-LANCEURS : liste des machines actives (ex. ["Trap 1", "Trap 2"]).
        # Par défaut, un lanceur par poste. Le lanceur du tour est attribué
        # automatiquement (tourniquet) et suivi dans les statistiques.
        if machines is None:
            # Défaut : un lanceur par poste.
            self.machines = [f"Lanceur {i + 1}"
                             for i in range(self.discipline.n_posts)]
        else:
            # Liste explicite : elle ne doit pas être vide (erreur de saisie).
            self.machines = [str(m) for m in machines]
            if not self.machines:
                raise ValueError("Il faut au moins un lanceur actif.")

        # MODE CONCOURS : chaque plateau est arbitré (aucune validation
        # automatique), et la fiche est marquée officielle.
        if mode not in ("entrainement", "concours"):
            raise ValueError(
                f"Mode inconnu : {mode!r} (attendu : entrainement | concours)")
        self.mode = mode

        n = len(self.shooters)
        self.clays_done = [0] * n
        self.turn_count = [0] * n
        self.nobird_count = [0] * n
        self.results: List[ClayResult] = []
        self.events: List[dict] = []
        self.finished = False

        self._order = list(range(n))
        self._ptr = 0
        self._provisional: List[dict] = []
        self._replays_this_turn = 0
        self._goto_first_unfinished()

    # ------------------------------------------------------------------ #
    # État courant (pour l'UI)
    # ------------------------------------------------------------------ #
    @property
    def current_shooter_idx(self) -> Optional[int]:
        return None if self.finished else self._order[self._ptr]

    @property
    def current_shooter(self) -> Optional[str]:
        i = self.current_shooter_idx
        return None if i is None else self.shooters[i]

    @property
    def current_post(self) -> Optional[int]:
        i = self.current_shooter_idx
        if i is None:
            return None
        return (self.turn_count[i] % self.discipline.n_posts) + 1

    @property
    def current_machine(self) -> Optional[str]:
        """Lanceur qui envoie le plateau du tour courant (attribué au poste)."""
        post = self.current_post
        if post is None:
            return None
        return self.machines[(post - 1) % len(self.machines)]

    def _remaining(self, shooter_idx: int) -> int:
        return self.serie - self.clays_done[shooter_idx]

    @property
    def current_turn_size(self) -> int:
        """Nombre de plateaux du tour courant (1 ou 2), borné par le reste."""
        i = self.current_shooter_idx
        if i is None:
            return 0
        want = self.discipline.clays_in_turn(self.turn_count[i])
        return max(1, min(want, self._remaining(i)))

    @property
    def current_is_double(self) -> bool:
        return self.current_turn_size >= 2

    @property
    def current_clay_in_turn(self) -> int:
        """N° du plateau attendu dans le tour courant (1-based)."""
        return len(self._provisional) + 1

    # ------------------------------------------------------------------ #
    # Progression
    # ------------------------------------------------------------------ #
    def _goto_first_unfinished(self) -> None:
        for step in range(len(self._order)):
            ptr = (self._ptr + step) % len(self._order)
            if self._remaining(self._order[ptr]) > 0:
                self._ptr = ptr
                self._provisional = []
                self._replays_this_turn = 0
                return
        self.finished = True

    def _advance_after_turn(self) -> None:
        n = len(self._order)
        for step in range(1, n + 1):
            ptr = (self._ptr + step) % n
            if self._remaining(self._order[ptr]) > 0:
                self._ptr = ptr
                self._provisional = []
                self._replays_this_turn = 0
                return
        self.finished = True

    def submit_verdict(
        self,
        verdict: str,
        cartridge: int = 1,
        machine: Optional[str] = None,
    ) -> Outcome:
        """Soumet le verdict d'UN plateau et fait avancer la partie."""
        if self.finished:
            raise RuntimeError("La partie est terminée.")
        if verdict not in FINAL_VERDICTS:
            raise ValueError(
                f"Verdict invalide : {verdict!r} (attendu {FINAL_VERDICTS})")
        if not (1 <= cartridge <= self.cartouches):
            raise ValueError(
                f"Cartouche invalide : {cartridge} (1..{self.cartouches})")

        s = self.current_shooter_idx
        post = self.current_post
        assert s is not None and post is not None
        shooter = self.shooters[s]
        # Lanceur : celui explicitement fourni, sinon celui attribué au poste.
        mach = machine or self.current_machine or f"P{post}"

        # --- NO BIRD : gel, on rejoue le tour (même tireur, même poste) ---
        if verdict == "nobird":
            self.nobird_count[s] += 1
            self._replays_this_turn += 1
            self._provisional = []  # rejoue le tour entier (doublé compris)
            self.events.append({
                "type": "nobird", "shooter": shooter, "post": post})
            return Outcome("nobird", shooter, post,
                           f"NO BIRD — on rejoue (poste {post}, {shooter}).")

        # --- Plateau compté (cassé/manqué) : provisoire jusqu'à fin du tour ---
        turn_size = self.current_turn_size
        self._provisional.append({
            "verdict": verdict, "cartridge": cartridge,
            "post": post, "machine": mach, "in_double": turn_size >= 2,
        })

        if len(self._provisional) < turn_size:
            return Outcome(
                "need_more", shooter, post,
                f"Doublé : plateau {len(self._provisional)}/{turn_size} enregistré.")

        # Tour complet : on valide définitivement tous les plateaux du tour.
        committed: List[ClayResult] = []
        for prov in self._provisional:
            self.clays_done[s] += 1
            pts = self.discipline.points_for(prov["verdict"], prov["cartridge"])
            res = ClayResult(
                shooter_idx=s, shooter=shooter, clay_no=self.clays_done[s],
                post=prov["post"], machine=prov["machine"],
                in_double=prov["in_double"], verdict=prov["verdict"],
                cartridge=prov["cartridge"], points=pts,
                nobird_replays=self._replays_this_turn,
            )
            self.results.append(res)
            committed.append(res)
        self.turn_count[s] += 1
        self.events.append({
            "type": "turn", "shooter": shooter, "post": post,
            "clays": len(committed),
            "verdicts": [c.verdict for c in committed]})
        self._advance_after_turn()

        if self.finished:
            return Outcome("finished", shooter, post,
                           "Partie terminée.", committed)
        return Outcome("turn_complete", shooter, post,
                       "Tour validé.", committed)

    # ------------------------------------------------------------------ #
    # Résultats / statistiques
    # ------------------------------------------------------------------ #
    def scorecard(self) -> List[Dict]:
        """Fiche par tireur : plateaux, cassés, manqués, no-bird, points, %."""
        cards = []
        for i, name in enumerate(self.shooters):
            rs = [r for r in self.results if r.shooter_idx == i]
            casse = sum(1 for r in rs if r.verdict == "casse")
            manque = sum(1 for r in rs if r.verdict == "manque")
            pts = sum(r.points for r in rs)
            clays = len(rs)
            cards.append({
                "shooter": name,
                "clays": clays,
                "casse": casse,
                "manque": manque,
                "nobird": self.nobird_count[i],
                "points": pts,
                "pct": round(100.0 * casse / clays, 1) if clays else 0.0,
            })
        return cards

    def _stats_by(self, key: str) -> Dict[str, Dict]:
        out: Dict[str, Dict] = {}
        for r in self.results:
            k = str(getattr(r, key))
            d = out.setdefault(k, {"clays": 0, "casse": 0, "manque": 0})
            d["clays"] += 1
            d["casse"] += 1 if r.verdict == "casse" else 0
            d["manque"] += 1 if r.verdict == "manque" else 0
        for d in out.values():
            d["pct"] = round(100.0 * d["casse"] / d["clays"], 1) if d["clays"] else 0.0
        return out

    def stats_by_post(self) -> Dict[str, Dict]:
        return self._stats_by("post")

    def stats_by_machine(self) -> Dict[str, Dict]:
        return self._stats_by("machine")

    def to_csv(self) -> str:
        """Exporte la fiche des tireurs en CSV."""
        buf = io.StringIO()
        w = csv.writer(buf)
        w.writerow(["tireur", "plateaux", "casses", "manques",
                    "nobird", "points", "pourcentage"])
        for c in self.scorecard():
            w.writerow([c["shooter"], c["clays"], c["casse"], c["manque"],
                        c["nobird"], c["points"], c["pct"]])
        return buf.getvalue()

    def state(self) -> Dict:
        """Instantané pour l'UI temps réel."""
        return {
            "discipline": self.discipline.key,
            "finished": self.finished,
            "serie": self.serie,
            "cartouches": self.cartouches,
            "mode": self.mode,
            "official": self.mode == "concours",
            "machines": list(self.machines),
            "current_machine": self.current_machine,
            "current_shooter": self.current_shooter,
            "current_post": self.current_post,
            "current_turn_size": self.current_turn_size,
            "current_clay_in_turn": self.current_clay_in_turn if not self.finished else 0,
            "is_double": self.current_is_double if not self.finished else False,
            "scorecard": self.scorecard(),
        }
