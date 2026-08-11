"""Le catalogue des fournisseurs : QUI vend QUOI, à QUEL prix, à QUELLE adresse.

Source unique de vérité pour trois choses qui divergeaient avant :
  - le **devis comparatif** (`tools/devis.py`),
  - le **contrôle des prix** sur les vraies pages (`tools/verif_prix.py`),
  - les **liens 1 clic** des documents.

Deux natures de liens, jamais confondues :

  **fiche**     = une page produit précise. Un clic → le bon article, prêt à
                  mettre au panier. C'est ce qu'on veut partout où c'est
                  possible.
  **recherche** = une page de résultats. Un clic → la bonne recherche, mais
                  il reste à choisir. Utilisé UNIQUEMENT quand aucune fiche
                  n'a pu être identifiée — jamais pour faire illusion.

Chaque lien est **testé automatiquement** par le workflow
`clayscore-verif-prix` : un lien mort est signalé, pas laissé dans un devis.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional

# Niveaux de confiance du prix (cf. `site.SOURCE_PRIX`).
VERIFIE = "verifie"    # fiche produit ouverte, prix lu dessus
RELEVE = "releve"      # vu dans une recherche datée
CIBLE = "cible"        # hypothèse de planification


@dataclass(frozen=True)
class Fournisseur:
    """Une offre concrète : un vendeur, un article, un prix, un lien."""

    poste: str                 # clé dans site.PRIX
    vendeur: str
    pays: str                  # FR | DE | UE | CN | US
    url: str
    lien: str = "fiche"        # fiche | recherche
    prix: Optional[float] = None   # € TTC ; None = prix non connu
    devise: str = "EUR"        # EUR | USD
    confiance: str = CIBLE
    par_unite: float = 1.0     # combien d'unités du poste couvre 1 article
    note: str = ""

    def __post_init__(self) -> None:
        if self.lien not in ("fiche", "recherche"):
            raise ValueError(f"Type de lien inconnu : {self.lien!r}.")
        if self.confiance not in (VERIFIE, RELEVE, CIBLE):
            raise ValueError(f"Confiance inconnue : {self.confiance!r}.")
        if not self.url.startswith("https://"):
            raise ValueError(f"{self.vendeur} : lien non sécurisé ({self.url}).")
        if self.devise not in ("EUR", "USD"):
            raise ValueError(f"Devise inconnue : {self.devise!r}.")
        if self.par_unite <= 0:
            raise ValueError("par_unite doit être positif.")
        if self.prix is not None and self.prix <= 0:
            raise ValueError(f"{self.vendeur} : prix invalide.")

    def prix_eur(self, usd_eur: float = 0.8666) -> Optional[float]:
        """Prix ramené à UNE unité du poste, en euros."""
        if self.prix is None:
            return None
        brut = self.prix * (usd_eur if self.devise == "USD" else 1.0)
        return round(brut / self.par_unite, 2)


# --------------------------------------------------------------------------
# LE CATALOGUE. Les prix VERIFIE ont été lus sur la fiche par le workflow
# `clayscore-verif-prix` le 11/08/2026. Les RELEVE viennent d'une recherche
# datée. Les CIBLE sont des hypothèses — leur lien est une recherche, et on
# le dit.
# --------------------------------------------------------------------------
CATALOGUE: List[Fournisseur] = [
    # --- caméra : la pièce décisive ------------------------------------- #
    Fournisseur(
        "camera", "Alibaba — Hikrobot MV-CS016-10GC", "CN",
        "https://www.alibaba.com/product-detail/HIKROBOT-MV-CS016-10GC-1-2-1601122368910.html",
        prix=160.0, devise="USD", confiance=RELEVE,
        note="160 USD par 5-19 pièces · 157 par 20-99 · GigE + COULEUR + "
             "global shutter, 65,2 img/s. Prix affiché en JavaScript : non "
             "lisible automatiquement."),
    Fournisseur(
        "camera", "AliExpress — Hikrobot MV-CS016-10GC", "CN",
        "https://www.aliexpress.com/item/1005009578278144.html",
        confiance=CIBLE,
        note="Même référence, à l'unité : utile pour commander 1 ou 2 caméras "
             "à l'étape 0 sans passer par un minimum de commande."),
    Fournisseur(
        "camera", "Basler acA1440-73gc (équivalent UE)", "UE",
        "https://www.baslerweb.com/en/shop/aca1440-73gc/",
        prix=429.0, devise="USD", confiance=RELEVE,
        note="Comparatif : 2,7x le prix du Hikrobot pour +8 img/s dont on n'a "
             "pas besoin. Écarté."),

    # --- caméra de diffusion : montrer, pas juger ------------------------ #
    Fournisseur(
        "camera_diffusion", "LDLC — caméra IP PoE Reolink (IP67, RTSP)", "FR",
        "https://www.ldlc.com/en/computing/networking/ip-camera/c4305/+fb-C999953630+fc1062-1.html",
        lien="recherche", prix=59.0, confiance=RELEVE,
        note="À partir de 59 €. Prendre un modèle **PoE** (même câble et même "
             "switch que les caméras d'arbitrage) et **RTSP** (c'est ce flux "
             "que l'écran du club affiche)."),
    Fournisseur(
        "camera_diffusion", "Reolink — boutique officielle", "UE",
        "https://store.reolink.com/poe-ip-cameras/",
        lien="recherche", confiance=CIBLE,
        note="Repli : gamme complète, IP67, flux RTSP documenté."),

    # --- optique --------------------------------------------------------- #
    Fournisseur(
        "objectif", "AliExpress — objectifs monture C 5 MP (8 et 12 mm)", "CN",
        "https://fr.aliexpress.com/w/wholesale-8mm-12mm-c-mount-machine-vision-lens-f1.4.html",
        lien="recherche", prix=36.0, confiance=RELEVE,
        note="Prendre du F1.4. Commander AVEC les caméras (même vendeur = un "
             "seul dédouanement)."),

    # --- calculateur ----------------------------------------------------- #
    Fournisseur(
        "calculateur", "Gotronic — Jetson Orin Nano Super", "FR",
        "https://www.gotronic.fr/art-jetson-orin-nano-8gb-devkit-46547.htm",
        prix=392.5, confiance=VERIFIE,
        note="LE MOINS CHER vérifié. Retenu."),
    Fournisseur(
        "calculateur", "Kubii — Jetson Orin Nano Super", "FR",
        "https://www.kubii.com/fr/kits-de-developpement/4457-2137-kit-de-developpement-nvidia-jetson-nano-orin-8gb-3272496319639.html",
        prix=465.0, confiance=VERIFIE,
        note="+18 % par rapport à Gotronic pour le même produit."),
    Fournisseur(
        "calculateur", "RS France — Jetson Orin Nano Super", "FR",
        "https://fr.rs-online.com/web/p/modules-de-developpement-pour-processeurs/2647384",
        confiance=CIBLE,
        note="Distributeur officiel : utile si Gotronic est en rupture."),

    # --- liaison longue distance ----------------------------------------- #
    Fournisseur(
        "pont_directionnel", "Getic — NanoStation 5AC Loco", "FR",
        "https://www.getic.fr/product/nanostation-5-ac-loco",
        prix=48.04, confiance=VERIFIE, par_unite=0.5,
        note="LE MOINS CHER vérifié. Il en faut DEUX par terrain (un de "
             "chaque côté du pont). Retenu."),
    Fournisseur(
        "pont_directionnel", "LDLC — NanoStation 5AC Loco", "FR",
        "https://www.ldlc.com/fiche/PB00574095.html",
        prix=64.95, confiance=VERIFIE, par_unite=0.5,
        note="+35 % que Getic pour le produit identique. Écarté."),

    # --- énergie --------------------------------------------------------- #
    Fournisseur(
        "batterie_30ah", "eBay DE — LiFePO4 12 V 30 Ah avec BMS", "DE",
        "https://www.ebay.de/itm/226970219019",
        prix=46.0, confiance=RELEVE,
        note="eBay refuse les robots (HTTP 403) : prix non revérifiable "
             "automatiquement."),
    Fournisseur(
        "batterie_30ah", "Amazon — LiFePO4 12 V 30 Ah", "FR",
        "https://www.amazon.fr/s?k=batterie+LiFePO4+12V+30Ah+BMS",
        lien="recherche", confiance=CIBLE,
        note="Repli si l'annonce eBay a disparu."),
    Fournisseur(
        "chargeur", "Amazon — chargeur LiFePO4 12 V dédié", "FR",
        "https://www.amazon.fr/s?k=chargeur+batterie+LiFePO4+12V",
        lien="recherche", prix=25.0, confiance=CIBLE,
        note="⚠️ un chargeur plomb abîme une LiFePO4 : prendre un modèle dédié."),

    # --- réseau local du terrain ----------------------------------------- #
    Fournisseur(
        "switch_poe", "Linovision — switch PoE 5 ports, entrée DC 12-48 V", "UE",
        "https://linovision.com/products/5-ports-full-gigabit-poe-switch-with-dc12v-dc24v-dc48v-input",
        prix=60.0, confiance=CIBLE,
        note="⚠️ ENTRÉE CONTINUE indispensable : se branche direct sur la "
             "batterie, sans onduleur. À 12 V d'entrée, budget PoE ~60 W."),
    Fournisseur(
        "switch_poe", "Amazon — switch PoE entrée DC 12-48 V", "FR",
        "https://www.amazon.fr/s?k=switch+PoE+5+ports+entree+DC+12V+48V",
        lien="recherche", confiance=CIBLE),
    Fournisseur(
        "routeur", "Amazon — routeur voyage GL.iNet", "FR",
        "https://www.amazon.fr/s?k=GL.iNet+routeur+voyage",
        lien="recherche", prix=40.0, confiance=CIBLE),

    # --- petites pièces --------------------------------------------------- #
    Fournisseur(
        "filtre", "AliExpress — filtre passe-bande 850 nm / polarisant", "CN",
        "https://fr.aliexpress.com/w/wholesale-850nm-bandpass-filter-lens.html",
        lien="recherche", prix=15.0, confiance=CIBLE),
    Fournisseur(
        "caisson", "Amazon — boîtier étanche IP66 aluminium", "FR",
        "https://www.amazon.fr/s?k=boitier+etanche+IP66+aluminium",
        lien="recherche", prix=15.0, confiance=CIBLE),
    Fournisseur(
        "trepied", "Amazon — trépied photo lourd", "FR",
        "https://www.amazon.fr/s?k=trepied+photo+lourd+charge+5kg",
        lien="recherche", prix=15.0, confiance=CIBLE),
    Fournisseur(
        "ssd", "LDLC — SSD M.2 NVMe 500 Go", "FR",
        "https://www.ldlc.com/recherche/ssd%20m.2%20nvme%20500%20go/",
        lien="recherche", prix=40.0, confiance=CIBLE),
    Fournisseur(
        "micro", "Amazon — micro USB omnidirectionnel", "FR",
        "https://www.amazon.fr/s?k=micro+USB+omnidirectionnel+conference",
        lien="recherche", prix=25.0, confiance=CIBLE),
    Fournisseur(
        "cablage", "Amazon — câble Ethernet extérieur Cat6", "FR",
        "https://www.amazon.fr/s?k=cable+ethernet+exterieur+cat6+30m",
        lien="recherche", prix=50.0, confiance=CIBLE,
        note="Lot : câble + presse-étoupes + porte-fusibles."),

    # --- club-house ------------------------------------------------------- #
    Fournisseur(
        "mini_pc_club", "LDLC — mini-PC Intel N100", "FR",
        "https://www.ldlc.com/recherche/mini%20pc%20n100/",
        lien="recherche", prix=200.0, confiance=CIBLE,
        note="Regarder D'ABORD ce que le club a déjà : un vieux PC suffit."),
    Fournisseur(
        "ecran_club", "LDLC — écran / TV 32-43 pouces", "FR",
        "https://www.ldlc.com/recherche/tv%2032%20pouces/",
        lien="recherche", prix=250.0, confiance=CIBLE,
        note="Regarder D'ABORD la TV du bar : elle fait souvent l'affaire."),
]


def pour_poste(poste: str) -> List[Fournisseur]:
    """Toutes les offres connues pour un poste, de la moins chère à la plus chère.

    Les offres sans prix passent en dernier : ce sont des replis, pas des choix.
    """
    offres = [f for f in CATALOGUE if f.poste == poste]
    return sorted(offres, key=lambda f: (f.prix_eur() is None, f.prix_eur() or 0))


def retenu(poste: str) -> Optional[Fournisseur]:
    """L'offre retenue : la moins chère parmi celles dont le prix est connu."""
    avec_prix = [f for f in pour_poste(poste) if f.prix_eur() is not None]
    return avec_prix[0] if avec_prix else None


def par_vendeur() -> Dict[str, List[Fournisseur]]:
    """Les offres retenues, regroupées par vendeur — c'est ça, un devis."""
    groupes: Dict[str, List[Fournisseur]] = {}
    postes = sorted({f.poste for f in CATALOGUE})
    for poste in postes:
        choix = retenu(poste)
        if choix is not None:
            groupes.setdefault(choix.vendeur, []).append(choix)
    return groupes


def liens_a_tester() -> List[Fournisseur]:
    """Tous les liens du catalogue : chacun doit répondre, sinon on le sait."""
    return list(CATALOGUE)
