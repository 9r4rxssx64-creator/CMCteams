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

⚠️ Les prix sont de deux natures, jamais mélangées : **RELEVÉ** (offre publique
réellement trouvée, avec sa source et sa date) et **cible** (hypothèse de
planification issue de `docs/BUDGET_BOM.md`, non confirmée). Voir `SOURCE_PRIX`.
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

# Prix (€). Deux natures très différentes, et on ne les confond pas :
#
#   RELEVÉ = un prix public réellement trouvé (référence + source + date).
#   cible  = une hypothèse de planification héritée de docs/BUDGET_BOM.md,
#            jamais confirmée chez un fournisseur.
#
# `SOURCE_PRIX` documente CHAQUE ligne, et un test vérifie qu'aucun prix
# n'existe sans provenance : c'est ce qui empêche un chiffre inventé de se
# glisser dans un devis.
#
# Conversion utilisée : 1 USD = 0,866 € (1 EUR = 1,1542 USD, 11 août 2026).
USD_EUR = 0.866

PRIX: Dict[str, float] = {
    "camera": 139.0,             # RELEVÉ
    "objectif": 36.0,            # RELEVÉ
    "filtre": 15.0,              # cible
    "caisson": 15.0,             # cible
    "trepied": 15.0,             # cible
    "calculateur": 307.0,        # RELEVÉ (prix UE réel, pas le tarif officiel)
    "ssd": 40.0,                 # cible
    "switch_poe": 60.0,          # cible
    "micro": 25.0,               # cible
    "batterie_30ah": 46.0,       # RELEVÉ
    "chargeur": 25.0,            # cible
    "cablage": 50.0,             # cible
    "pont_directionnel": 98.0,   # RELEVÉ — la PAIRE, achetée en UE
    "routeur": 40.0,             # cible
    "ecran_club": 250.0,         # cible — NOUVEAU
    "mini_pc_club": 200.0,       # cible — NOUVEAU
}

SOURCE_PRIX: Dict[str, str] = {
    "camera": "RELEVÉ — Hikrobot MV-CS016-10GC : la référence EXACTE (GigE, "
              "COULEUR, global shutter, 1440x1080, 65,2 img/s). 160 USD par "
              "5-19 pièces sur Alibaba, août 2026 -> 139 €. Achat CHINE : "
              "l'équivalent de marque européenne (Basler acA1440-73gc) est à "
              "429-493 USD, soit 2,7x plus cher pour +8 img/s.",
    "objectif": "RELEVÉ — jeu d'objectifs monture C 5 MP (5/8/12/16/25 mm) à "
                "~41,84 USD pièce sur eBay -> 36 €. Prendre du F1.4 : c'est la "
                "façon la moins chère d'acheter de la lumière pour les fins de "
                "journée. Achat CHINE (fabricants AICO / Hangzhou Ai Ke).",
    "filtre": "cible BUDGET_BOM — passe-bande 850 nm / polarisant.",
    "caisson": "cible BUDGET_BOM — boîtier aluminium IP66.",
    "trepied": "cible BUDGET_BOM — fixation rigide.",
    "calculateur": "RELEVÉ — NVIDIA Jetson Orin Nano Super Developer Kit. "
                   "Tarif officiel 249 USD (216 €) mais prix RÉEL en Europe "
                   "307,14 € (idealo.fr, revendeurs Kubii/Gotronic/RS). C'est "
                   "ce prix-là qui est retenu : 216 € + TVA + douane ferait "
                   "~277 € pour un import, sans garantie ni SAV. Achat UE.",
    "ssd": "cible BUDGET_BOM — NVMe 500 Go.",
    "switch_poe": "cible BUDGET_BOM. Un TP-Link TL-SG1005P (4 ports PoE, 65 W) "
                  "est listé à 30,83 £ chez un revendeur britannique : la "
                  "cible de 60 € est donc prudente.",
    "micro": "cible BUDGET_BOM — micro USB omnidirectionnel.",
    "batterie_30ah": "RELEVÉ — LiFePO4 12 V 30 Ah avec BMS, à partir de 46 € "
                     "TTC (eBay Allemagne, juillet 2026). La cible du "
                     "BUDGET_BOM était de 130 € : nettement surévaluée.",
    "chargeur": "cible BUDGET_BOM — chargeur LiFePO4 dédié.",
    "cablage": "cible BUDGET_BOM — Cat6 extérieur, presse-étoupes, fusibles.",
    "pont_directionnel": "RELEVÉ — Ubiquiti NanoStation 5AC Loco, 450+ Mbit/s, "
                         "portée >10 km. 49 € l'unité en France (idealo, "
                         "Getic 50,62 €, LDLC 64,95 €) -> la PAIRE 98 €. "
                         "Achat UE : même prix qu'en import une fois la TVA "
                         "ajoutée, mais livré tout de suite.",
    "routeur": "cible BUDGET_BOM — routeur WiFi local.",
    "ecran_club": "cible — écran/TV du club-house. NOUVEAU, aucun prix relevé.",
    "mini_pc_club": "cible — mini-PC du club-house. NOUVEAU, aucun prix relevé.",
}

# D'où vient le meilleur prix, poste par poste. « retenu » n'est PAS toujours
# le moins cher affiché : pour un import, il faut ajouter TVA (20 %) + frais de
# douane, et accepter l'absence de garantie locale. Le bon choix est donc
# MIXTE — et c'est le résultat de la comparaison, pas un a priori.
TVA = 0.20

ORIGINE: Dict[str, Dict] = {
    "camera": {"retenu": "chine", "chine": 139.0, "ue": 372.0,
               "pourquoi": "Hikrobot 139 € contre 372 € pour l'équivalent "
                           "Basler : 2,7x. Même en ajoutant TVA et douane "
                           "(~172 €), la Chine reste largement devant."},
    "objectif": {"retenu": "chine", "chine": 36.0, "ue": None,
                 "pourquoi": "Aucun prix public UE relevé ; à commander avec "
                             "les caméras, chez le même vendeur."},
    "calculateur": {"retenu": "ue", "chine": None, "ue": 307.0,
                    "pourquoi": "Tarif officiel 216 €, mais 277 € une fois TVA "
                                "et douane ajoutées — pour 30 € de plus, l'UE "
                                "apporte garantie, SAV et zéro risque de "
                                "contrefaçon sur une pièce critique."},
    "pont_directionnel": {"retenu": "ue", "chine": None, "ue": 98.0,
                          "pourquoi": "49 € l'unité en France : l'import ne "
                                      "ferait rien gagner après TVA."},
    "batterie_30ah": {"retenu": "ue", "chine": None, "ue": 46.0,
                      "pourquoi": "Lourd : le transport annule l'écart. Et une "
                                  "batterie lithium en colis express hors UE "
                                  "pose un problème réglementaire."},
}


def cout_import(prix_chine: float) -> float:
    """Ce qu'un prix chinois coûte VRAIMENT une fois arrivé : + TVA (20 %).

    Les frais de dossier du transporteur s'ajoutent PAR COLIS, pas par article :
    ils sont comptés une seule fois, au niveau du devis, pas ici.
    """
    return round(prix_chine * (1 + TVA), 2)


POSTES_NOUVEAUX = ("ecran_club", "mini_pc_club")


def prix_releve(poste: str) -> bool:
    """Ce prix vient-il d'une offre réellement trouvée, ou d'une hypothèse ?"""
    return SOURCE_PRIX[poste].startswith("RELEVÉ")


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
    def bom(self, niveau: str = "optimal") -> Dict:
        """Prévisionnel matériel du club entier.

        `niveau` :
          - "minimum" : juste ce qu'il faut pour que ça marche.
          - "optimal" : ce qu'il faut pour que ça marche DANS TOUS LES CAS —
            un poste de vue de SECOURS par terrain (le rôle existe déjà dans
            le logiciel : une caméra qui tombe pendant une épreuve ne l'arrête
            plus), et DEUX jeux d'objectifs (8 mm pour voir large en fosse
            olympique et sur parcours, 12 mm pour la précision en fosse
            universelle) — le choix se fait alors sur le terrain, pas au
            moment de la commande.
        """
        if niveau not in ("minimum", "optimal"):
            raise ValueError(
                f"Niveau inconnu : {niveau!r} (attendu : minimum | optimal).")
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

        n_terrains = len(self.terrains)
        n_pods = sum(len(t.pods) for t in self.terrains)
        # En « optimal », un poste de SECOURS par terrain.
        secours = n_terrains if niveau == "optimal" else 0
        n_pods_total = n_pods + secours
        # ... et deux focales par poste (8 mm ET 12 mm) au lieu d'une.
        objectifs_par_pod = 2 if niveau == "optimal" else 1

        for poste in ("camera", "filtre", "caisson", "trepied"):
            ajoute(poste, n_pods_total,
                   "1 par poste de vue"
                   + (f" (dont {secours} de secours)" if secours else ""))
        ajoute("objectif", n_pods_total * objectifs_par_pod,
               "8 mm ET 12 mm par poste : le choix se fait sur le terrain"
               if objectifs_par_pod == 2 else "1 par poste de vue")

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

        for ligne in lignes:
            ligne["prix_releve"] = prix_releve(ligne["poste"])
            ligne["source_prix"] = SOURCE_PRIX[ligne["poste"]]

        total = round(sum(ligne["total"] for ligne in lignes), 2)
        releves = round(sum(ligne["total"] for ligne in lignes
                            if ligne["prix_releve"]), 2)
        cibles = round(total - releves, 2)
        nouveau = round(sum(ligne["total"] for ligne in lignes
                            if ligne["nouveau"]), 2)
        return {
            "niveau": niveau,
            "lignes": lignes,
            "total": total,
            "total_postes_nouveaux": nouveau,
            "n_terrains": n_terrains,
            "n_pods": n_pods,
            "n_pods_factures": n_pods_total,
            "pods_secours": secours,
            "n_lanceurs": self.n_lanceurs,
            "releves": releves,
            "cibles": cibles,
            "avertissement": "Aucun de ces prix n'est un devis. Les lignes "
                             "RELEVÉ viennent d'une offre publique datée (voir "
                             "SOURCE_PRIX), les autres restent des hypothèses "
                             "de planification. Douane et TVA non comprises "
                             "sur les commandes hors UE.",
        }

    def to_dict(self) -> Dict:
        return {
            "nom": self.nom,
            "terrains": [t.to_dict() for t in self.terrains],
            "n_terrains": len(self.terrains),
            "n_lanceurs": self.n_lanceurs,
            "debit_club_mbps": round(self.debit_club_mbps(), 2),
            "problemes": self.check(),
            "bom": self.bom("optimal"),
            "bom_minimum": self.bom("minimum"),
        }
