"""Un CLUB ENTIER : plusieurs terrains éloignés + un club-house.

Le module `pods` répond à « comment couvrir UN terrain ». Celui-ci répond à la
question du dessus : **plusieurs terrains distants, et tout qui remonte au
club-house** (scores affichés + retour caméra), sans jamais tirer de câble
entre les terrains.

Le raisonnement, chiffré :

1. **Sur un terrain**, les caméras sont câblées (PoE) et envoient de la vidéo
   brute : 809 Mbit/s chacune. C'est court (< 100 m) et ça reste local.
2. **Le calculateur du terrain décide sur place.** Ce qui part vers le
   club-house n'est plus de la vidéo brute, mais :
   - le **score / verdict** : ~0,2 Mbit/s,
   - un **retour caméra compressé**, optionnel : 4 Mbit/s (aperçu) ou
     12 Mbit/s (HD).
3. **Donc un terrain tient largement dans une liaison sans fil** (~12 Mbit/s
   contre 100 disponibles sur un pont directionnel), et trois terrains aussi —
   à condition que chaque terrain ait **son propre pont** (un pont
   directionnel est point-à-point, pas partagé).

Ce module refuse une configuration impossible AVANT la commande du matériel,
et sort le prévisionnel (matériel + coût) du club complet.

⚠️ Les prix sont ceux de `docs/BUDGET_BOM.md` : des **cibles de planification**
non vérifiées auprès des fournisseurs, pas des devis.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional

from .pods import LIAISONS, DEBIT_EDGE_MBPS, Pod, PodFleet

# --------------------------------------------------------------------------
# Ce qu'il y a réellement sur un terrain, par discipline.
#
# Sources : règlements FITAV (voir docs/GUIDE_ITALIE_FITAV.md).
#   - Fosse Olympique : 5 pédanes, 3 machines par pédane = 15 machines.
#   - Fosse Universelle : 5 machines dans une seule fosse.
#   - Compak Sporting : 5 pédanes, minimum 3 machines par ligne.
#   - Parcours de chasse : nombre de machines VARIABLE selon le tracé
#     -> aucune valeur par défaut honnête, il faut la déclarer.
# --------------------------------------------------------------------------
LANCEURS_PAR_DISCIPLINE: Dict[str, Optional[int]] = {
    "fosse_olympique": 15,
    "fosse_universelle": 5,
    "compak": 3,            # minimum réglementaire ; souvent plus
    "parcours": None,       # variable : à déclarer terrain par terrain
}

# Retour vidéo vers le club-house (par terrain), en Mbit/s.
RETOUR_CAMERA: Dict[str, float] = {
    "aucun": 0.0,      # seul le score remonte
    "apercu": 4.0,     # 720p H.264 : voir ce qui se passe
    "hd": 12.0,        # 1080p H.264 : ralenti exploitable à l'écran
}

# Prix cibles (€), repris de docs/BUDGET_BOM.md.
# Les postes marqués NOUVEAU n'existaient pas dans le BOM d'un kit unique :
# ils apparaissent seulement quand on équipe un club entier. Prix à confirmer.
PRIX: Dict[str, float] = {
    "camera": 180.0,
    "objectif": 35.0,
    "filtre": 15.0,
    "caisson": 15.0,
    "trepied": 15.0,
    "calculateur": 280.0,        # Jetson Orin Nano
    "ssd": 40.0,
    "switch_poe": 60.0,
    "micro": 25.0,
    "batterie_30ah": 130.0,
    "chargeur": 25.0,
    "cablage": 50.0,
    "pont_directionnel": 120.0,  # la PAIRE (une extrémité de chaque côté)
    "routeur": 40.0,
    "ecran_club": 250.0,         # NOUVEAU — écran d'affichage du club-house
    "mini_pc_club": 200.0,       # NOUVEAU — agrège les 3 terrains, pilote l'écran
}

POSTES_NOUVEAUX = ("ecran_club", "mini_pc_club")


@dataclass
class Terrain:
    """Un spot de lancement : une fosse, un compak, ou une zone de parcours."""

    id: str
    discipline: str
    distance_club_m: float
    liaison_club: str = "wifi_directionnel"
    retour_camera: str = "apercu"
    n_lanceurs: Optional[int] = None
    pods: List[Pod] = field(default_factory=list)

    def __post_init__(self) -> None:
        if self.discipline not in LANCEURS_PAR_DISCIPLINE:
            raise ValueError(
                f"Discipline de terrain inconnue : {self.discipline!r} "
                f"(dispo : {sorted(LANCEURS_PAR_DISCIPLINE)}).")
        if self.liaison_club not in LIAISONS:
            raise ValueError(f"Liaison inconnue : {self.liaison_club!r}.")
        if self.retour_camera not in RETOUR_CAMERA:
            raise ValueError(
                f"Retour caméra inconnu : {self.retour_camera!r} "
                f"(attendu : {sorted(RETOUR_CAMERA)}).")
        if self.distance_club_m < 0:
            raise ValueError("Distance négative.")
        if self.n_lanceurs is None:
            self.n_lanceurs = LANCEURS_PAR_DISCIPLINE[self.discipline]
        if self.n_lanceurs is None:
            raise ValueError(
                f"{self.id} : un parcours de chasse n'a pas de nombre de "
                "lanceurs standard — il faut le déclarer (n_lanceurs=...).")
        if self.n_lanceurs <= 0:
            raise ValueError(f"{self.id} : nombre de lanceurs invalide.")

    @property
    def fleet(self) -> PodFleet:
        return PodFleet(list(self.pods))

    def debit_vers_club_mbps(self) -> float:
        """Ce qui remonte au club-house : le score, plus le retour vidéo."""
        return DEBIT_EDGE_MBPS + RETOUR_CAMERA[self.retour_camera]

    def check(self) -> List[Dict]:
        """Ce terrain tient-il debout, et sa remontée au club passe-t-elle ?"""
        problemes: List[Dict] = list(self.fleet.check())
        infos = LIAISONS[self.liaison_club]

        if self.distance_club_m > infos["portee_m"]:
            problemes.append({
                "niveau": "bloquant",
                "quoi": f"{self.id} : le club-house est à "
                        f"{self.distance_club_m:.0f} m alors que "
                        f"« {infos['label']} » porte à ~{infos['portee_m']} m.",
                "solution": ("Pont WiFi directionnel 5 GHz (>1 km, vue dégagée)."
                             if self.distance_club_m <= 3000
                             else "Passer en 4G/LTE pour ce terrain."),
            })

        besoin = self.debit_vers_club_mbps()
        if besoin > infos["debit_mbps"]:
            problemes.append({
                "niveau": "bloquant",
                "quoi": f"{self.id} : la remontée demande {besoin:.1f} Mbit/s, "
                        f"la liaison en offre ~{infos['debit_mbps']}.",
                "solution": "Baisser le retour caméra (hd -> apercu -> aucun) : "
                            "le score, lui, ne pèse que 0,2 Mbit/s.",
            })

        if not self.pods:
            problemes.append({
                "niveau": "bloquant",
                "quoi": f"{self.id} : aucun poste de vue déclaré.",
                "solution": "Déclarer au moins une paire appairée sur ce terrain.",
            })
        return problemes

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "discipline": self.discipline,
            "n_lanceurs": self.n_lanceurs,
            "distance_club_m": self.distance_club_m,
            "liaison_club": self.liaison_club,
            "liaison_label": LIAISONS[self.liaison_club]["label"],
            "retour_camera": self.retour_camera,
            "debit_vers_club_mbps": round(self.debit_vers_club_mbps(), 2),
            "pods": len(self.pods),
            "problemes": self.check(),
        }


@dataclass
class Site:
    """Le club complet : N terrains distants + le club-house."""

    terrains: List[Terrain] = field(default_factory=list)
    nom: str = "Club"

    def add(self, terrain: Terrain) -> None:
        if any(t.id == terrain.id for t in self.terrains):
            raise ValueError(f"Deux terrains portent le même nom : {terrain.id!r}.")
        self.terrains.append(terrain)

    @property
    def n_lanceurs(self) -> int:
        return sum(int(t.n_lanceurs or 0) for t in self.terrains)

    def debit_club_mbps(self) -> float:
        """Tout ce qui arrive au club-house, tous terrains confondus."""
        return sum(t.debit_vers_club_mbps() for t in self.terrains)

    def check(self) -> List[Dict]:
        problemes: List[Dict] = []
        if not self.terrains:
            return [{"niveau": "bloquant", "quoi": "Aucun terrain déclaré.",
                     "solution": "Déclarer au moins un spot de lancement."}]

        for t in self.terrains:
            problemes += t.check()

        # Un pont directionnel est POINT-À-POINT : il en faut un par terrain.
        # C'est l'erreur classique — croire qu'un seul pont dessert tout le club.
        ponts = [t for t in self.terrains
                 if t.liaison_club == "wifi_directionnel"]
        if len(ponts) > 1:
            problemes.append({
                "niveau": "important",
                "quoi": f"{len(ponts)} terrains en pont directionnel : un pont "
                        "est point-à-point, il en faut un par terrain, sur des "
                        "canaux 5 GHz différents.",
                "solution": "Prévoir 1 paire de ponts par terrain et espacer les "
                            "canaux, ou poser une antenne sectorielle au club.",
            })

        # Liaisons PARTAGÉES (maillé, 4G, WiFi du hub) : plusieurs terrains
        # se répartissent le MÊME débit. Un pont directionnel, lui, est dédié.
        partages: Dict[str, float] = {}
        for t in self.terrains:
            if t.liaison_club == "wifi_directionnel":
                continue
            partages[t.liaison_club] = (
                partages.get(t.liaison_club, 0.0) + t.debit_vers_club_mbps())
        for liaison, besoin in sorted(partages.items()):
            capacite = LIAISONS[liaison]["debit_mbps"]
            if besoin > capacite:
                problemes.append({
                    "niveau": "bloquant",
                    "quoi": f"Les terrains en « {LIAISONS[liaison]['label']} » "
                            f"partagent la même liaison et demandent "
                            f"{besoin:.1f} Mbit/s pour ~{capacite} disponibles.",
                    "solution": "Passer ces terrains en ponts directionnels "
                                "dédiés, ou couper leur retour caméra.",
                })

        # Le club-house agrège tout : au-delà du Gigabit, il faudrait mieux.
        total = self.debit_club_mbps()
        if total > 1000:
            problemes.append({
                "niveau": "bloquant",
                "quoi": f"Le club-house reçoit {total:.0f} Mbit/s au total.",
                "solution": "Réduire les retours caméra, ou passer le "
                            "club-house en 2,5 Gbit/s.",
            })
        return problemes

    # ---------------------------------------------------------------- BOM --
    def bom(self) -> Dict:
        """Prévisionnel matériel du club entier : quantités et coût cible."""
        lignes: List[Dict] = []

        def ajoute(poste: str, qte: int, note: str = "") -> None:
            if qte <= 0:
                return
            lignes.append({
                "poste": poste, "qte": qte,
                "prix_unitaire": PRIX[poste],
                "total": round(PRIX[poste] * qte, 2),
                "nouveau": poste in POSTES_NOUVEAUX,
                "note": note,
            })

        n_pods = sum(len(t.pods) for t in self.terrains)
        n_terrains = len(self.terrains)

        # Par poste de vue.
        for poste in ("camera", "objectif", "filtre", "caisson", "trepied"):
            ajoute(poste, n_pods, "1 par poste de vue")

        # Par terrain : un calculateur qui décide sur place, et son réseau local.
        for poste in ("calculateur", "ssd", "switch_poe", "micro",
                      "batterie_30ah", "chargeur", "cablage"):
            ajoute(poste, n_terrains, "1 par terrain")

        # Liaisons vers le club-house.
        ajoute("pont_directionnel",
               sum(1 for t in self.terrains
                   if t.liaison_club == "wifi_directionnel"),
               "1 paire par terrain (point-à-point)")

        # Le club-house lui-même.
        ajoute("routeur", 1, "réseau du club-house")
        ajoute("mini_pc_club", 1, "agrège les terrains, pilote l'écran")
        ajoute("ecran_club", 1, "affichage des scores et du retour caméra")

        total = round(sum(ligne["total"] for ligne in lignes), 2)
        nouveau = round(sum(ligne["total"] for ligne in lignes
                            if ligne["nouveau"]), 2)
        return {
            "lignes": lignes,
            "total": total,
            "total_postes_nouveaux": nouveau,
            "n_terrains": n_terrains,
            "n_pods": n_pods,
            "n_lanceurs": self.n_lanceurs,
            "avertissement": "Prix cibles de docs/BUDGET_BOM.md — hypothèses de "
                             "planification, pas des devis. Douane et TVA non "
                             "comprises sur les commandes hors UE.",
        }

    def to_dict(self) -> Dict:
        return {
            "nom": self.nom,
            "terrains": [t.to_dict() for t in self.terrains],
            "n_terrains": len(self.terrains),
            "n_lanceurs": self.n_lanceurs,
            "debit_club_mbps": round(self.debit_club_mbps(), 2),
            "problemes": self.check(),
            "bom": self.bom(),
        }
