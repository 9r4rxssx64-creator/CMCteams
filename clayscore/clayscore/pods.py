"""Postes de vue (pods) : filaires, ou sans fil pour couvrir de grandes surfaces.

Le problème de fond, chiffré :

    une caméra 1440x1080 en 65 images/s produit **809 Mbit/s** de vidéo brute.
    Trois caméras = **2,4 Gbit/s**. Aucune liaison sans fil ne transporte ça.

Il y a donc exactement deux façons de s'éloigner du hub :

- **POD FILAIRE** — un câble réseau par pod (jusqu'à 100 m), qui apporte aussi
  l'électricité (PoE). Simple, sûr : c'est le mode par défaut, celui d'une
  fosse.
- **POD INTELLIGENT (sans fil)** — le pod embarque son propre calculateur et
  **décide sur place**. Il n'envoie plus la vidéo, mais le verdict et un court
  ralenti : **0,17 Mbit/s en moyenne pour 25 plateaux**. Ça passe sur
  n'importe quelle liaison, y compris à plus d'un kilomètre.

C'est ce second mode qui permet un parcours de chasse, un compak éloigné ou
plusieurs terrains couverts par un seul système.

`check_link()` **refuse** une configuration physiquement impossible (vidéo
brute sur du sans-fil) plutôt que de la laisser échouer sur le terrain.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional

# Modes de liaison, avec débit utile réaliste en extérieur, vue dégagée.
LIAISONS: Dict[str, Dict] = {
    "ethernet": {"label": "Câble réseau (PoE)", "portee_m": 100,
                 "debit_mbps": 1000, "sans_fil": False},
    "wifi_local": {"label": "WiFi du hub", "portee_m": 60,
                   "debit_mbps": 200, "sans_fil": True},
    "wifi_maille": {"label": "WiFi maillé extérieur", "portee_m": 150,
                    "debit_mbps": 100, "sans_fil": True},
    "wifi_directionnel": {"label": "WiFi directionnel 5 GHz (pont)",
                          "portee_m": 3000, "debit_mbps": 100, "sans_fil": True},
    "lte": {"label": "4G/LTE", "portee_m": 100000, "debit_mbps": 20,
            "sans_fil": True},
}

# Rôles d'un poste de vue. Les quatre premiers servent à JUGER le plateau ;
# « diffusion » sert à MONTRER — le tireur, la zone de vol — sur l'écran du
# club-house. Une caméra de diffusion ne participe jamais au verdict : elle
# n'a donc pas besoin d'obturateur global ni de couleur calibrée, et elle
# compresse elle-même (caméra IP). C'est ce qui la rend 2,5x moins chère.
ROLES = ("stereo_a", "stereo_b", "lateral", "secours", "diffusion")
ROLES_ARBITRAGE = ("stereo_a", "stereo_b", "lateral", "secours")

# Ce que le pod envoie réellement sur sa liaison. À déclarer explicitement :
# supposer qu'un pod « compresse forcément parce qu'il est sans fil » est faux
# — une caméra industrielle envoie du brut, sauf matériel d'encodage dédié.
# Débits, calculés (voir l'en-tête du module).
DEBIT_BRUT_MBPS = 809.0          # caméra GigE nue : 1440x1080 Mono8 @ 65 fps
DEBIT_H264_MBPS = 12.0           # même flux, compressé (exige un encodeur au pod)
DEBIT_EDGE_MBPS = 0.2            # verdict + court ralenti, seulement quand ça tire

FLUX = {"brut": DEBIT_BRUT_MBPS, "compresse": DEBIT_H264_MBPS,
        "edge": DEBIT_EDGE_MBPS}


@dataclass
class Pod:
    """Un poste de vue."""

    id: str
    role: str = "lateral"
    liaison: str = "ethernet"
    distance_m: float = 30.0
    # "brut" (caméra nue) | "compresse" (encodeur au pod) | "edge" (le pod décide)
    flux: str = "brut"
    alimentation: str = "poe"       # poe | batterie | secteur | lanceur
    en_ligne: bool = True
    latence_ms: float = 0.0
    perte_paquets_pct: float = 0.0
    derive_horloge_ms: float = 0.0
    batterie_pct: Optional[float] = None

    def __post_init__(self) -> None:
        if self.role not in ROLES:
            raise ValueError(f"Rôle de poste inconnu : {self.role!r}.")
        if self.liaison not in LIAISONS:
            raise ValueError(f"Type de liaison inconnu : {self.liaison!r}.")
        if self.distance_m < 0:
            raise ValueError("Distance négative.")
        if self.flux not in FLUX:
            raise ValueError(
                f"Type de flux inconnu : {self.flux!r}. "
                "Attendu : brut | compresse | edge.")

    @property
    def sans_fil(self) -> bool:
        return bool(LIAISONS[self.liaison]["sans_fil"])

    @property
    def diffusion(self) -> bool:
        """Ce poste montre-t-il (écran du club) au lieu de juger ?"""
        return self.role == "diffusion"

    @property
    def edge(self) -> bool:
        """Le pod décide-t-il lui-même (au lieu d'envoyer de la vidéo) ?"""
        return self.flux == "edge"

    def debit_requis_mbps(self) -> float:
        """Ce que ce pod doit RÉELLEMENT faire passer sur sa liaison.

        Aucune hypothèse implicite : une caméra nue envoie du brut, même sur
        une liaison sans fil. C'est ce qui fait échouer les installations mal
        pensées — et ce qu'on refuse ici, avant le terrain.
        """
        return FLUX[self.flux]

    def to_dict(self) -> Dict:
        return {"id": self.id, "role": self.role, "liaison": self.liaison,
                "liaison_label": LIAISONS[self.liaison]["label"],
                "distance_m": self.distance_m, "flux": self.flux,
                "edge": self.edge,
                "sans_fil": self.sans_fil, "alimentation": self.alimentation,
                "en_ligne": self.en_ligne, "latence_ms": self.latence_ms,
                "perte_paquets_pct": self.perte_paquets_pct,
                "derive_horloge_ms": self.derive_horloge_ms,
                "batterie_pct": self.batterie_pct,
                "debit_requis_mbps": round(self.debit_requis_mbps(), 2)}


def check_link(pod: Pod) -> List[Dict]:
    """Cette installation est-elle physiquement possible ? Sinon, on le dit.

    C'est le garde-fou qui évite l'erreur coûteuse : partir sur du sans-fil en
    croyant transporter de la vidéo brute, et le découvrir sur le terrain.
    """
    infos = LIAISONS[pod.liaison]
    problemes: List[Dict] = []

    if pod.distance_m > infos["portee_m"]:
        problemes.append({
            "niveau": "bloquant",
            "quoi": f"{pod.id} : {pod.distance_m:.0f} m alors que "
                    f"« {infos['label']} » porte à ~{infos['portee_m']} m.",
            "solution": ("Passer en WiFi directionnel (pont, >1 km) "
                         if pod.distance_m <= 3000 else "Passer en 4G/LTE."),
        })

    besoin = pod.debit_requis_mbps()
    if besoin > infos["debit_mbps"]:
        problemes.append({
            "niveau": "bloquant",
            "quoi": f"{pod.id} : il faudrait {besoin:.0f} Mbit/s, la liaison "
                    f"en offre ~{infos['debit_mbps']}.",
            "solution": "Activer le mode « pod intelligent » (le pod décide sur "
                        "place et n'envoie que le verdict + un court ralenti).",
        })

    if pod.diffusion and pod.flux == "brut":
        problemes.append({
            "niveau": "important",
            "quoi": f"{pod.id} : caméra de diffusion en vidéo BRUTE "
                    f"({DEBIT_BRUT_MBPS:.0f} Mbit/s) — inutile et ruineux en "
                    "débit, elle ne sert qu'à l'affichage.",
            "solution": "Une caméra IP compresse elle-même : déclarer "
                        "flux « compresse ».",
        })

    if pod.sans_fil and pod.flux == "compresse" and not pod.diffusion:
        problemes.append({
            "niveau": "important",
            "quoi": f"{pod.id} : vidéo compressée transmise sans fil — "
                    "sensible aux coupures et à la météo, et exige un "
                    "encodeur au pod.",
            "solution": "Préférer le mode « pod intelligent » dès qu'on "
                        "s'éloigne : il ne transmet que l'essentiel.",
        })

    if pod.sans_fil and pod.alimentation == "poe":
        problemes.append({
            "niveau": "bloquant",
            "quoi": f"{pod.id} : sans fil mais alimenté par le câble réseau — "
                    "incohérent (il n'y a plus de câble).",
            "solution": "Alimenter ce pod par batterie, secteur, ou dérivation "
                        "sur le lanceur voisin.",
        })
    return problemes


@dataclass
class PodFleet:
    """L'ensemble des postes de vue d'un stand."""

    pods: List[Pod] = field(default_factory=list)

    def add(self, pod: Pod) -> None:
        if any(p.id == pod.id for p in self.pods):
            raise ValueError(f"Deux postes portent le même nom : {pod.id!r}.")
        self.pods.append(pod)

    @property
    def en_ligne(self) -> int:
        return sum(1 for p in self.pods if p.en_ligne)

    def stereo_ok(self) -> bool:
        """Faut-il deux vues appairées pour mesurer la distance ?"""
        roles = {p.role for p in self.pods if p.en_ligne}
        return "stereo_a" in roles and "stereo_b" in roles

    def debit_total_mbps(self) -> float:
        return sum(p.debit_requis_mbps() for p in self.pods if p.en_ligne)

    def check(self, derive_max_ms: float = 20.0,
              latence_max_ms: float = 150.0,
              perte_max_pct: float = 2.0) -> List[Dict]:
        """Contrôle complet de l'installation, en français, avec les solutions."""
        problemes: List[Dict] = []
        if not self.pods:
            return [{"niveau": "bloquant", "quoi": "Aucun poste de vue déclaré.",
                     "solution": "Déclarer au moins deux postes appairés."}]

        for p in self.pods:
            problemes += check_link(p)
            if not p.en_ligne:
                problemes.append({
                    "niveau": "bloquant",
                    "quoi": f"{p.id} hors ligne.",
                    "solution": "Vérifier alimentation et liaison de ce poste."})
                continue
            if p.derive_horloge_ms > derive_max_ms:
                problemes.append({
                    "niveau": "bloquant",
                    "quoi": f"{p.id} : horloge décalée de "
                            f"{p.derive_horloge_ms:.0f} ms.",
                    "solution": "Resynchroniser : un décalage fausse l'association "
                                "entre le coup de feu et l'image."})
            if p.latence_ms > latence_max_ms:
                problemes.append({
                    "niveau": "important",
                    "quoi": f"{p.id} : liaison lente ({p.latence_ms:.0f} ms).",
                    "solution": "Rapprocher, dégager la vue, ou passer en "
                                "directionnel."})
            if p.perte_paquets_pct > perte_max_pct:
                problemes.append({
                    "niveau": "important",
                    "quoi": f"{p.id} : {p.perte_paquets_pct:.1f} % de pertes.",
                    "solution": "Interférences probables : changer de canal WiFi "
                                "ou passer en directionnel."})
            if p.batterie_pct is not None and p.batterie_pct < 20:
                problemes.append({
                    "niveau": "important",
                    "quoi": f"{p.id} : batterie à {p.batterie_pct:.0f} %.",
                    "solution": "Recharger ou brancher ce poste."})

        if not self.stereo_ok():
            problemes.append({
                "niveau": "bloquant",
                "quoi": "Pas de paire appairée en service : la distance du "
                        "plateau ne peut plus être mesurée.",
                "solution": "Remettre en service un poste de la paire, ou "
                            "basculer un poste de secours."})
        return problemes

    def to_dict(self) -> Dict:
        return {"pods": [p.to_dict() for p in self.pods],
                "en_ligne": self.en_ligne, "total": len(self.pods),
                "stereo_ok": self.stereo_ok(),
                "debit_total_mbps": round(self.debit_total_mbps(), 2),
                "problemes": self.check()}


def couverture(surface_m2: float, portee_pod_m: float = 30.0) -> Dict:
    """Combien de postes pour couvrir une surface ? (ordre de grandeur)

    Approximation volontairement prudente : on compte une zone utile carrée
    par paire de postes, pas un cercle idéal — sur le terrain, le relief et la
    végétation coupent toujours plus que prévu.
    """
    if surface_m2 <= 0 or portee_pod_m <= 0:
        raise ValueError("Surface et portée doivent être positives.")
    zone = portee_pod_m ** 2
    zones = max(1, int(surface_m2 / zone + 0.999))
    return {"zones": zones, "pods": zones * 2,           # 2 vues appairées/zone
            "surface_par_zone_m2": zone,
            "note": "Estimation : à confirmer sur le terrain (relief, arbres, "
                    "axes de tir)."}
