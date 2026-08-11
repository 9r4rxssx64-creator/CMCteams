#!/usr/bin/env python3
"""Génère le DEVIS COMPARATIF : qui vend quoi, à quel prix, avec le lien 1 clic.

Trois tableaux, dans cet ordre d'utilité :

1. **Le comparatif** — pour chaque pièce, les vendeurs côte à côte, le moins
   cher marqué. C'est là qu'on voit qu'un pont coûte 35 % de plus chez l'un
   que chez l'autre.
2. **Le devis par vendeur** — regroupé pour commander : un panier par
   fournisseur, avec son total. C'est ce qu'on exécute.
3. **Le récapitulatif** — HT, part chinoise, TVA à l'import, total livré.

Chaque ligne porte son **lien 1 clic** et son niveau de confiance :
✅ prix lu sur la fiche · 🟢 prix vu en recherche · 🟡 hypothèse.

    python -m tools.devis                      # config optimale, club complet
    python -m tools.devis --niveau minimum
    python -m tools.devis --etape 0            # le kit de validation seul
    python -m tools.devis --sortie docs/DEVIS_COMPARATIF.md
"""
from __future__ import annotations

import argparse
import sys
from typing import Dict, List, Optional

from clayscore.fournisseurs import (
    RELEVE, VERIFIE, Fournisseur, par_vendeur, pour_poste, retenu)
from clayscore.pods import Pod
from clayscore.site import ORIGINE, Site, Terrain, cout_import

BADGE = {VERIFIE: "✅", RELEVE: "🟢", "cible": "🟡"}
LABEL_LIEN = {"fiche": "🛒 Acheter", "recherche": "🔎 Chercher"}

# Le club de référence du dossier (cf. PREVISIONNEL_CLUB).
def club_reference() -> Site:
    def pods(prefixe: str, n: int = 3) -> List[Pod]:
        roles = ["stereo_a", "stereo_b", "lateral", "secours"]
        return [Pod(f"{prefixe}-{i+1}", role=roles[i % 4], liaison="ethernet",
                    distance_m=30, flux="brut", alimentation="poe")
                for i in range(n)]

    s = Site(nom="Club 3 terrains")
    # 2 caméras de diffusion par terrain : une sur le TIREUR, une sur la
    # ZONE DE VOL. Elles ne jugent pas — elles alimentent l'écran du bar.
    s.add(Terrain("FOSSE-1", "fosse_olympique", distance_club_m=250,
                  retour_camera="apercu", cameras_diffusion=2,
                  pods=pods("F1")))
    s.add(Terrain("FOSSE-2", "fosse_olympique", distance_club_m=280,
                  retour_camera="apercu", cameras_diffusion=2,
                  pods=pods("F2")))
    s.add(Terrain("CHASSE", "parcours", distance_club_m=700, n_lanceurs=8,
                  retour_camera="apercu", cameras_diffusion=2,
                  pods=pods("CH", 4)))
    return s


# Le kit de validation : ce qu'on achète AVANT tout le reste.
ETAPE_0: Dict[str, int] = {"calculateur": 1, "camera": 2, "objectif": 4}


def quantites(niveau: str, etape: Optional[int]) -> Dict[str, int]:
    """Combien de chaque pièce ? Soit l'étape 0, soit le club complet."""
    if etape == 0:
        return dict(ETAPE_0)
    bom = club_reference().bom(niveau)
    return {ligne["poste"]: ligne["qte"] for ligne in bom["lignes"]}


def _lien(f: Fournisseur) -> str:
    return f"[{LABEL_LIEN[f.lien]}]({f.url})"


def comparatif(qte: Dict[str, int]) -> List[str]:
    out = ["## 1. Le comparatif — qui vend le moins cher", "",
           "Un lien 🛒 mène à **la fiche du produit** (un clic, panier). "
           "Un lien 🔎 mène à **une recherche** : aucune fiche précise n'a été "
           "identifiée, il reste à choisir. On ne fait pas passer l'un pour "
           "l'autre.", ""]
    for poste in sorted(qte):
        offres = pour_poste(poste)
        if not offres:
            out += [f"### `{poste}` — ⚠️ aucun fournisseur au catalogue", ""]
            continue
        choix = retenu(poste)
        out += [f"### {poste.replace('_', ' ').capitalize()} "
                f"— {qte[poste]} à acheter", "",
                "| | Vendeur | Pays | Prix unitaire | Lien | Remarque |",
                "|:--:|---|:--:|---:|---|---|"]
        for f in offres:
            p = f.prix_eur()
            marque = "**✔**" if choix is not None and f is choix else ""
            prix = f"{p:.2f} €" if p is not None else "—"
            conf = BADGE.get(f.confiance, "🟡")
            out.append(f"| {marque} | {f.vendeur} | {f.pays} | {conf} {prix} | "
                       f"{_lien(f)} | {f.note or ''} |")
        out.append("")
    return out


def devis_par_vendeur(qte: Dict[str, int]) -> tuple[List[str], float, float]:
    """Le panier à exécuter, vendeur par vendeur. Renvoie (lignes, HT, part CN)."""
    out = ["## 2. Le devis — un panier par vendeur", "",
           "C'est ce qu'on exécute. Grouper chez un même vendeur évite de "
           "payer plusieurs fois les frais de port — et, pour la Chine, "
           "plusieurs dédouanements.", ""]
    total_ht = 0.0
    total_cn = 0.0
    groupes = par_vendeur()
    for vendeur in sorted(groupes):
        lignes = [f for f in groupes[vendeur] if qte.get(f.poste)]
        if not lignes:
            continue
        sous_total = 0.0
        out += [f"### {vendeur}", "",
                "| Pièce | Qté | P.U. | Total | Lien |",
                "|---|---:|---:|---:|---|"]
        for f in lignes:
            n = qte[f.poste]
            pu = f.prix_eur() or 0.0
            ligne_total = round(pu * n, 2)
            sous_total += ligne_total
            out.append(f"| {f.poste.replace('_', ' ')} | {n} | {pu:.2f} € | "
                       f"{ligne_total:.2f} € | {_lien(f)} |")
            total_ht += ligne_total
            if ORIGINE.get(f.poste, {}).get("retenu") == "chine" or f.pays == "CN":
                total_cn += ligne_total
        out += [f"| **Sous-total {vendeur}** | | | **{sous_total:.2f} €** | |", ""]
    return out, round(total_ht, 2), round(total_cn, 2)


def recapitulatif(total_ht: float, total_cn: float, niveau: str,
                  etape: Optional[int]) -> List[str]:
    total_ue = round(total_ht - total_cn, 2)
    livre = round(cout_import(total_cn) + total_ue, 2)
    quoi = "Kit de validation (étape 0)" if etape == 0 else \
        f"Club 3 terrains + club-house — configuration {niveau}"
    return ["## 3. Récapitulatif", "",
            "| | Montant |", "|---|---:|",
            f"| **{quoi}** | |",
            f"| Total HT | **{total_ht:.2f} €** |",
            f"| dont 🇨🇳 Chine | {total_cn:.2f} € |",
            f"| dont 🇪🇺 Europe | {total_ue:.2f} € |",
            f"| TVA 20 % sur la part chinoise | +{cout_import(total_cn) - total_cn:.2f} € |",
            f"| **TOTAL LIVRÉ** | **{livre:.2f} €** |", "",
            "> ⚠️ **Ce devis n'engage aucun vendeur.** Il est construit à partir "
            "de prix publics, dont certains lus sur la fiche (✅) et d'autres "
            "vus en recherche (🟢) ou estimés (🟡). Les **frais de port** et "
            "les **frais de dossier de douane** (15-30 € par colis) ne sont "
            "PAS compris. Sur 13 caméras, demander le palier « 20-99 pièces » "
            "au vendeur : c'est 3 € de moins par pièce.", ""]


def generer(niveau: str = "optimal", etape: Optional[int] = None) -> str:
    qte = quantites(niveau, etape)
    titre = ("# ClayScore — Devis comparatif" +
             (" · kit de validation (étape 0)" if etape == 0
              else f" · club complet ({niveau})"))
    entete = [
        titre, "",
        "**Tous les liens sont cliquables et testés automatiquement** par le "
        "workflow `clayscore-verif-prix` : un lien mort est signalé, pas laissé "
        "dans un devis.", "",
        "Confiance du prix : **✅ lu sur la fiche produit** · "
        "**🟢 vu en recherche datée** · **🟡 hypothèse à confirmer**.", "",
        "---", ""]
    lignes_devis, ht, cn = devis_par_vendeur(qte)
    corps = comparatif(qte) + ["---", ""] + lignes_devis + ["---", ""]
    return "\n".join(entete + corps + recapitulatif(ht, cn, niveau, etape))


def main(argv: Optional[List[str]] = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--niveau", default="optimal",
                    choices=("minimum", "optimal"))
    ap.add_argument("--etape", type=int, choices=(0,),
                    help="0 = uniquement le kit de validation")
    ap.add_argument("--sortie", help="fichier markdown à écrire")
    args = ap.parse_args(argv)

    md = generer(args.niveau, args.etape)
    if args.sortie:
        with open(args.sortie, "w", encoding="utf-8") as f:
            f.write(md + "\n")
        print(f"écrit : {args.sortie}", file=sys.stderr)
    else:
        print(md)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
