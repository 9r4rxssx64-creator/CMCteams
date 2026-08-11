"""Alimentation : batterie, secteur, ou dérivation sur les lanceurs.

Un système d'arbitrage ne doit **jamais** s'éteindre au milieu d'une épreuve.
La réponse professionnelle n'est pas « une grosse batterie » : c'est de
**toujours passer par la batterie**, et de la recharger avec la source
disponible.

    SECTEUR 230 V ─┐
                   ├─► CHARGEUR ─► BATTERIE ─► TOUT LE SYSTÈME
    LANCEUR 12 V ──┘                  ▲
                                      └── la batterie alimente en permanence

Conséquence : le basculement d'une source à l'autre — ou leur perte totale —
**ne provoque aucune coupure**, puisque rien n'est jamais alimenté
directement par la source. C'est le principe d'une alimentation sans
interruption (ASI/UPS), transposé en 12 V continu.

⚠️ **Dérivation sur un lanceur** : à ne faire qu'avec un convertisseur
**isolé galvaniquement** et un fusible propre. Un lanceur est une machine
dangereuse ; rien de ce qu'on ajoute ne doit pouvoir perturber son
fonctionnement ni sa sécurité. Voir `docs/GUIDE_ALIMENTATION.md`.

Ce module **mesure et décide** ; il ne pilote aucun matériel. Les valeurs
viennent soit d'un capteur (INA219/INA226 sur le bus 12 V), soit d'une saisie
manuelle, soit d'une estimation — et la provenance est **toujours indiquée**,
pour ne jamais faire passer une estimation pour une mesure.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional

SOURCES = ("secteur", "lanceur", "batterie", "aucune")

# Rendement réel d'une chaîne 12 V (pertes chargeur + câbles + convertisseurs).
RENDEMENT = 0.85

# Consommations de référence (W), mesurables au wattmètre à la mise en service.
CONSO_DEFAUT = {
    "hub": 15.0,          # Jetson Orin Nano en mode 15 W
    "camera": 3.0,        # par caméra GigE alimentée en PoE
    "switch_poe": 5.0,
    "routeur": 5.0,
    "ssd": 3.0,
    "micro": 1.0,
    "pod_edge": 10.0,     # pod intelligent autonome (calcul + caméra + liaison)
    "liaison_sansfil": 5.0,
}


@dataclass
class Battery:
    tension_v: float = 12.0
    capacite_ah: float = 30.0
    charge_pct: float = 100.0
    chimie: str = "LiFePO4"

    def wh_restants(self) -> float:
        return self.tension_v * self.capacite_ah * max(0.0, min(100.0, self.charge_pct)) / 100.0


@dataclass
class PowerStatus:
    source: str                  # source qui alimente/recharge actuellement
    sur_batterie: bool           # vrai si plus aucune source externe
    conso_w: float
    autonomie_h: Optional[float]  # None = illimitée (source externe présente)
    charge_pct: float
    mesure: str                  # "capteur" | "estimation" | "saisie"
    alertes: List[Dict]

    def to_dict(self) -> Dict:
        return {
            "source": self.source,
            "sur_batterie": self.sur_batterie,
            "conso_w": round(self.conso_w, 1),
            "autonomie_h": (None if self.autonomie_h is None
                            else round(self.autonomie_h, 1)),
            "charge_pct": round(self.charge_pct, 1),
            "mesure": self.mesure,
            "alertes": list(self.alertes),
        }


def consommation(elements: Optional[Dict[str, int]] = None,
                 table: Optional[Dict[str, float]] = None) -> float:
    """Consommation totale, en additionnant les éléments réellement présents.

    `elements` : {"hub": 1, "camera": 3, ...}. Un élément inconnu lève une
    erreur plutôt que d'être ignoré : un poste oublié fausserait l'autonomie.
    """
    t = dict(table or CONSO_DEFAUT)
    els = elements if elements is not None else {
        "hub": 1, "camera": 3, "switch_poe": 1, "routeur": 1, "ssd": 1, "micro": 1}
    total = 0.0
    for nom, n in els.items():
        if nom not in t:
            raise ValueError(
                f"Élément inconnu dans le bilan électrique : {nom!r}. "
                "Ajoutez sa consommation plutôt que de l'oublier.")
        if n < 0:
            raise ValueError("Quantité négative dans le bilan électrique.")
        total += t[nom] * n
    return total


def autonomie_h(batterie: Battery, conso_w: float,
                rendement: float = RENDEMENT) -> float:
    """Heures restantes sur batterie seule."""
    if conso_w <= 0:
        raise ValueError("Consommation nulle ou négative : bilan impossible.")
    return batterie.wh_restants() * rendement / conso_w


def status(*, sources_presentes: List[str], batterie: Battery,
           conso_w: float, mesure: str = "estimation",
           duree_epreuve_h: float = 8.0) -> PowerStatus:
    """État de l'alimentation, avec les alertes utiles à l'arbitre.

    `sources_presentes` : ce qui est réellement branché ("secteur", "lanceur").
    La batterie est toujours en ligne : elle n'est pas une « source » de plus,
    c'est le tampon qui garantit l'absence de coupure.
    """
    externes = [s for s in sources_presentes if s in ("secteur", "lanceur")]
    inconnues = [s for s in sources_presentes if s not in SOURCES]
    if inconnues:
        raise ValueError(f"Source d'alimentation inconnue : {inconnues}")

    sur_batterie = not externes
    source = externes[0] if externes else ("batterie" if batterie.charge_pct > 0
                                           else "aucune")
    auto = autonomie_h(batterie, conso_w) if sur_batterie else None

    alertes: List[Dict] = []
    if sur_batterie:
        alertes.append({
            "niveau": "info",
            "quoi": "Fonctionnement sur batterie (aucune source externe).",
            "solution": "Brancher le secteur ou dériver sur le lanceur pour "
                        "recharger sans interrompre l'épreuve.",
        })
        if auto is not None and auto < duree_epreuve_h:
            alertes.append({
                "niveau": "bloquant",
                "quoi": f"Autonomie {auto:.1f} h < durée d'épreuve "
                        f"{duree_epreuve_h:.0f} h.",
                "solution": "Brancher une source, ou remplacer la batterie "
                            "avant le début de l'épreuve.",
            })
        elif batterie.charge_pct < 30:
            alertes.append({
                "niveau": "important",
                "quoi": f"Batterie à {batterie.charge_pct:.0f} %.",
                "solution": "Recharger dès que possible.",
            })
    if "lanceur" in externes:
        alertes.append({
            "niveau": "important",
            "quoi": "Alimentation dérivée d'un lanceur.",
            "solution": "Vérifier la présence du convertisseur isolé et du "
                        "fusible dédié — rien ne doit perturber la machine.",
        })
    if mesure != "capteur":
        alertes.append({
            "niveau": "conseil",
            "quoi": "Autonomie calculée, non mesurée.",
            "solution": "Installer un capteur de courant (INA226) pour une "
                        "valeur réelle, ou vérifier au wattmètre.",
        })
    return PowerStatus(source=source, sur_batterie=sur_batterie, conso_w=conso_w,
                       autonomie_h=auto, charge_pct=batterie.charge_pct,
                       mesure=mesure, alertes=alertes)


def dimensionner(conso_w: float, duree_h: float, tension_v: float = 12.0,
                 marge: float = 1.3) -> Dict:
    """Quelle batterie faut-il pour tenir `duree_h` ? (avec marge de sécurité)

    La marge de 30 % couvre le vieillissement, le froid et le fait qu'on ne
    vide jamais complètement une batterie.
    """
    if duree_h <= 0 or conso_w <= 0:
        raise ValueError("Durée et consommation doivent être positives.")
    wh = conso_w * duree_h / RENDEMENT * marge
    ah = wh / tension_v
    # Capacités réellement vendues.
    for std in (7, 12, 20, 30, 50, 100):
        if std >= ah:
            recommande = std
            break
    else:
        recommande = int(ah) + 1
    return {"wh_necessaires": round(wh, 1), "ah_theoriques": round(ah, 1),
            "ah_recommandes": recommande,
            "detail": f"{conso_w:.0f} W pendant {duree_h:.0f} h, "
                      f"rendement {int(RENDEMENT*100)} %, marge {int((marge-1)*100)} %"}
