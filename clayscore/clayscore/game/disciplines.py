"""Disciplines de ball-trap et leurs règles (jalon 4).

Modèle volontairement générique : une `Discipline` décrit le nombre de postes,
la disposition des plateaux (simples/doublés), le nombre de cartouches et le
barème. La machine à états (`state_machine.py`) est agnostique et s'appuie
dessus.

Disciplines fournies (règles simplifiées mais fidèles à l'essentiel — voir les
notes) : Fosse Universelle (FU), Fosse Olympique (FO), DTL (Down The Line),
Parcours de chasse, Compak Sporting.

⚠️ Notes d'honnêteté : les règles officielles (FFBT/ISSF/DTL) comportent des
subtilités (ordre exact de rotation d'une planche de 6 tireurs, machines
multiples par poste, barèmes de barrage...). On implémente ici un modèle
cohérent et testable qui capture ce dont ClayScore a besoin : rotation stricte,
gel sur no-bird, doublés, barème par cartouche, fiches et stats. Les barèmes
fins sont paramétrables et pourront être affinés au besoin.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Tuple


@dataclass(frozen=True)
class Discipline:
    key: str
    label: str
    n_posts: int = 5            # nombre de postes de tir
    cartridges: int = 2         # nb de cartouches autorisées par plateau
    scoring: str = "standard"   # "standard" (cassé=1) | "dtl" (3/2/0 selon cartouche)
    # Disposition des plateaux par tour (nb de plateaux) ; None = toujours simple.
    # Ex. parcours/compak : mélange de simples et de doublés.
    layout: Optional[Tuple[int, ...]] = None

    def clays_in_turn(self, turn_index: int) -> int:
        """Nombre de plateaux du tour n° `turn_index` (0-based) pour un tireur."""
        if not self.layout:
            return 1
        return self.layout[turn_index % len(self.layout)]

    def is_double(self, turn_index: int) -> bool:
        return self.clays_in_turn(turn_index) >= 2

    def points_for(self, verdict: str, cartridge: int) -> int:
        """Points d'un plateau selon le verdict et la cartouche utilisée.

        `cartridge` = numéro de la cartouche qui a cassé (1 ou 2). Ignoré hors DTL.
        """
        if verdict != "casse":
            return 0
        if self.scoring == "dtl":
            # DTL : 3 points si cassé à la 1re cartouche, 2 à la 2e.
            return 3 if cartridge <= 1 else 2
        return 1


# Registre des disciplines disponibles.
DISCIPLINES = {
    "fosse_universelle": Discipline(
        "fosse_universelle", "Fosse Universelle (FU)", n_posts=5, cartridges=2),
    "fosse_olympique": Discipline(
        "fosse_olympique", "Fosse Olympique (FO)", n_posts=5, cartridges=2),
    "dtl": Discipline(
        "dtl", "Down The Line (DTL)", n_posts=5, cartridges=2, scoring="dtl"),
    "parcours": Discipline(
        "parcours", "Parcours de chasse", n_posts=5, cartridges=2,
        layout=(1, 2, 1, 2, 1)),      # simples et doublés alternés
    "compak": Discipline(
        "compak", "Compak Sporting", n_posts=5, cartridges=2,
        layout=(1, 1, 2, 1, 2)),
}


# Noms italiens (FITAV) des mêmes disciplines. Kevin tire à Vintimille : la
# tablette doit accepter le mot écrit sur la pancarte du stand.
# ⚠️ On n'aliase QUE ce qui existe vraiment : « elica » (ZZ) n'est pas
# implémentée, donc elle n'est volontairement pas listée ici — mieux vaut une
# erreur claire qu'un score calculé avec les mauvaises règles.
ALIASES = {
    "fossa_universale": "fosse_universelle",
    "fossa_olimpica": "fosse_olympique",
    "trap": "fosse_olympique",
    "percorso_di_caccia": "parcours",
    "percorso_caccia": "parcours",
    "compak_sporting": "compak",
}


def get_discipline(key: str) -> Discipline:
    key = ALIASES.get(key, key)
    if key not in DISCIPLINES:
        raise ValueError(
            f"Discipline inconnue : {key!r} "
            f"(dispo : {sorted(DISCIPLINES)} ; alias : {sorted(ALIASES)})")
    return DISCIPLINES[key]


def list_disciplines() -> List[Discipline]:
    return list(DISCIPLINES.values())
