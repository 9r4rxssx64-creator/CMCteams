#!/usr/bin/env python3
"""Vérifie les prix du dossier sur les VRAIES pages marchandes.

Pourquoi cet outil existe
-------------------------
Depuis l'environnement de développement, le pare-feu bloque tout sauf
`api.github.com` : impossible d'ouvrir une fiche produit. Les prix du dossier
venaient donc de résultats de recherche, avec la mention « à revérifier avant
de commander ». Ce n'est pas satisfaisant pour un devis.

La solution : **le runner GitHub Actions a le réseau ouvert**. Ce script y
tourne, ouvre les vraies pages, en extrait le prix, et le compare à celui
inscrit dans `clayscore/site.py`. Le résultat est un tableau lisible + un
code de sortie.

Méthode d'extraction, du plus fiable au moins fiable
----------------------------------------------------
1. **JSON-LD schema.org** (`<script type="application/ld+json">`) : la
   quasi-totalité des marchands y déclarent `offers.price`. C'est une donnée
   structurée, pas du texte deviné.
2. **balises meta** (`product:price:amount`, `og:price:amount`).
3. **regex sur le texte** : dernier recours, volontairement strict.

Si aucune méthode n'aboutit, on écrit **ÉCHEC** — jamais une valeur inventée.

Usage
-----
    python -m tools.verif_prix                 # tout vérifier
    python -m tools.verif_prix --poste camera  # un seul poste
    python -m tools.verif_prix --tolerance 15  # seuil d'alerte en %
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Dict, List, Optional

# Un vrai navigateur : sans ça, la moitié des marchands renvoient 403.
ENTETES = {
    "User-Agent": ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                   "AppleWebKit/537.36 (KHTML, like Gecko) "
                   "Chrome/126.0 Safari/537.36"),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
}

# Taux de change utilisé par le dossier. Vérifié par le même script (§ TAUX).
USD_EUR_DEFAUT = 0.866


@dataclass
class Offre:
    """Une page marchande à surveiller, pour un poste du prévisionnel."""

    poste: str            # clé dans clayscore.site.PRIX
    nom: str              # ce que Kevin lit
    url: str
    devise: str = "EUR"   # EUR | USD
    facteur: float = 1.0  # ex. 2 si la page vend l'unité et qu'on compte la paire


def offres_du_catalogue() -> List["Offre"]:
    """Les pages à contrôler viennent du CATALOGUE : une seule source de vérité.

    On ne contrôle que les liens de type « fiche » : une page de recherche n'a
    pas de prix unique à comparer.
    """
    from clayscore.fournisseurs import CATALOGUE
    return [Offre(f.poste, f"{f.vendeur} ({f.pays})", f.url,
                  devise=f.devise,
                  facteur=(1.0 / f.par_unite) if f.par_unite else 1.0)
            for f in CATALOGUE if f.lien == "fiche" and f.prix is not None]


# Anciennes offres codées en dur — conservées comme repli si le catalogue
# devenait vide, mais le catalogue fait foi.
OFFRES: List[Offre] = [
    Offre("calculateur", "Jetson Orin Nano Super — Kubii (FR)",
          "https://www.kubii.com/fr/kits-de-developpement/4457-2137-kit-de-developpement-nvidia-jetson-nano-orin-8gb-3272496319639.html"),
    Offre("calculateur", "Jetson Orin Nano Super — Gotronic (FR)",
          "https://www.gotronic.fr/art-jetson-orin-nano-8gb-devkit-46547.htm"),
    Offre("pont_directionnel", "NanoStation 5AC Loco — LDLC (FR), la PAIRE",
          "https://www.ldlc.com/fiche/PB00574095.html", facteur=2.0),
    Offre("pont_directionnel", "NanoStation 5AC Loco — Getic (FR), la PAIRE",
          "https://www.getic.fr/product/nanostation-5-ac-loco", facteur=2.0),
    Offre("camera", "Hikrobot MV-CS016-10GC — Alibaba (CN)",
          "https://www.alibaba.com/product-detail/HIKROBOT-MV-CS016-10GC-1-2-1601122368910.html",
          devise="USD"),
    Offre("batterie_30ah", "LiFePO4 12 V 30 Ah — eBay (DE)",
          "https://www.ebay.de/itm/226970219019"),
]


# --------------------------------------------------------------- extraction --
def _nombres_json(obj, cle: str) -> List[float]:
    """Cherche récursivement `cle` dans un JSON et renvoie les nombres trouvés."""
    trouves: List[float] = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k == cle:
                try:
                    trouves.append(float(str(v).replace(",", ".")))
                except (TypeError, ValueError):
                    pass
            else:
                trouves += _nombres_json(v, cle)
    elif isinstance(obj, list):
        for v in obj:
            trouves += _nombres_json(v, cle)
    return trouves


def prix_depuis_jsonld(html: str) -> Optional[float]:
    """1re méthode : la donnée structurée schema.org. La plus fiable."""
    blocs = re.findall(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html, re.S | re.I)
    prix: List[float] = []
    for bloc in blocs:
        try:
            prix += _nombres_json(json.loads(bloc.strip()), "price")
        except json.JSONDecodeError:
            continue
    valides = [p for p in prix if p > 0]
    return min(valides) if valides else None


def prix_depuis_meta(html: str) -> Optional[float]:
    """2e méthode : les balises meta de prix (Open Graph / product)."""
    m = re.search(
        r'<meta[^>]+(?:property|name)=["\'](?:product:price:amount|og:price:amount)'
        r'["\'][^>]+content=["\']([\d.,]+)["\']', html, re.I)
    if not m:
        return None
    try:
        return float(m.group(1).replace(",", "."))
    except ValueError:
        return None


def prix_depuis_texte(html: str) -> Optional[float]:
    """3e méthode, dernier recours : un montant collé à un symbole monétaire.

    Volontairement strict — mieux vaut ne rien trouver qu'un faux chiffre.
    """
    # Les gardes (?<!...) et (?!...) sont ESSENTIELLES : sans elles, « 12345 € »
    # se ferait découper en « 345 € ». Mesuré par un test.
    milliers = "[   ]"          # espace, insécable, fine insécable
    avant, apres = r"(?<![\d.,])", r"(?![\d.,])"
    montant_fr = r"\d{1,3}(?:" + milliers + r"\d{3})*(?:[.,]\d{2})?"
    montant_us = r"\d{1,3}(?:,\d{3})*(?:\.\d{2})?"
    motifs = [
        avant + "(" + montant_fr + ")" + apres + r"\s*(?:€|EUR\b)",
        r"(?:€|US\s?\$|\$)\s*" + avant + "(" + montant_us + ")" + apres,
    ]
    for motif in motifs:
        for brut in re.findall(motif, html):
            txt = re.sub(milliers, "", brut).replace(",", ".")
            # « 1.234.56 » -> on ne garde que le dernier point décimal
            if txt.count(".") > 1:
                *ent, dec = txt.split(".")
                txt = "".join(ent) + "." + dec
            try:
                v = float(txt)
            except ValueError:
                continue
            if 1.0 <= v <= 100_000.0:
                return v
    return None


def extraire_prix(html: str) -> tuple[Optional[float], str]:
    """Renvoie (prix, méthode). `méthode` dit COMMENT on l'a obtenu."""
    for methode, fn in (("json-ld", prix_depuis_jsonld),
                        ("meta", prix_depuis_meta),
                        ("texte", prix_depuis_texte)):
        v = fn(html)
        if v is not None:
            return v, methode
    return None, "aucune"


# ------------------------------------------------------------------ réseau --
def telecharger(url: str, timeout: int = 25) -> tuple[Optional[str], str]:
    """Renvoie (html, détail). En cas d'échec, html vaut None et on DIT pourquoi."""
    req = urllib.request.Request(url, headers=ENTETES)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            brut = r.read()
        try:
            return brut.decode("utf-8"), "ok"
        except UnicodeDecodeError:
            return brut.decode("latin-1", errors="replace"), "ok (latin-1)"
    except urllib.error.HTTPError as e:
        return None, f"HTTP {e.code}"
    except urllib.error.URLError as e:
        return None, f"réseau : {e.reason}"
    except Exception as e:  # noqa: BLE001 - on veut le motif, pas une trace
        return None, f"{type(e).__name__}: {e}"


def tester_liens(urls: List[tuple[str, str]]) -> List[Dict]:
    """Chaque lien du dossier répond-il ? Un lien mort ne reste pas dans un devis.

    On demande la page entière (pas un HEAD) : beaucoup de marchands
    répondent 405 à un HEAD alors que la page existe.
    """
    resultats: List[Dict] = []
    for nom, url in urls:
        html, detail = telecharger(url, timeout=20)
        resultats.append({"nom": nom, "url": url, "vivant": html is not None,
                          "detail": detail})
    return resultats


def taux_usd_eur() -> tuple[float, str]:
    """Taux USD->EUR du jour, depuis la Banque centrale européenne (via un
    service public sans clé). En cas d'échec : le taux du dossier, et on le dit.
    """
    html, detail = telecharger(
        "https://api.frankfurter.app/latest?from=USD&to=EUR", timeout=15)
    if html:
        try:
            return float(json.loads(html)["rates"]["EUR"]), "frankfurter.app"
        except (json.JSONDecodeError, KeyError, TypeError, ValueError):
            pass
    return USD_EUR_DEFAUT, f"valeur du dossier (échec : {detail})"


# ---------------------------------------------------------------- rapport --
def verifier(offres: List[Offre], prix_dossier: Dict[str, float],
             tolerance_pct: float, taux: float) -> List[Dict]:
    lignes: List[Dict] = []
    for o in offres:
        html, detail = telecharger(o.url)
        if html is None:
            lignes.append({"offre": o, "prix": None, "methode": "-",
                           "detail": detail, "ecart_pct": None})
            continue
        brut, methode = extraire_prix(html)
        if brut is None:
            lignes.append({"offre": o, "prix": None, "methode": methode,
                           "detail": "page lue, prix introuvable",
                           "ecart_pct": None})
            continue
        eur = brut * (taux if o.devise == "USD" else 1.0) * o.facteur
        ref = prix_dossier.get(o.poste)
        ecart = None if not ref else round(100.0 * (eur - ref) / ref, 1)
        lignes.append({"offre": o, "prix": round(eur, 2), "methode": methode,
                       "detail": detail, "ecart_pct": ecart,
                       "alerte": ecart is not None and abs(ecart) > tolerance_pct})
    return lignes


def rendre_markdown(lignes: List[Dict], prix_dossier: Dict[str, float],
                    taux: float, source_taux: str, tolerance: float) -> str:
    out = ["# ClayScore — vérification des prix sur les vraies pages", "",
           f"Taux USD→EUR utilisé : **{taux:.4f}** ({source_taux})  ",
           f"Seuil d'alerte : **±{tolerance:.0f} %**", "",
           "| Poste | Offre | Dossier | Relevé | Écart | Méthode | État |",
           "|---|---|---:|---:|---:|---|---|"]
    for ligne in lignes:
        o: Offre = ligne["offre"]
        ref = prix_dossier.get(o.poste)
        if ligne["prix"] is None:
            etat = f"⚠️ {ligne['detail']}"
            releve = ecart = "—"
        else:
            releve = f"{ligne['prix']:.2f} €"
            ecart = "—" if ligne["ecart_pct"] is None else f"{ligne['ecart_pct']:+.1f} %"
            etat = "🔴 à corriger" if ligne.get("alerte") else "✅ cohérent"
        out.append(f"| `{o.poste}` | {o.nom} | "
                   f"{('%.2f €' % ref) if ref else '—'} | {releve} | {ecart} | "
                   f"{ligne['methode']} | {etat} |")
    lus = [x for x in lignes if x["prix"] is not None]
    alertes = [x for x in lus if x.get("alerte")]
    out += ["", f"**{len(lus)}/{len(lignes)} pages lues**, "
                f"**{len(alertes)} écart(s)** au-delà du seuil.", "",
            "> Une page non lue n'est PAS une erreur du dossier : beaucoup de "
            "marchands refusent les robots. Le prix reste alors celui du "
            "dossier, avec sa date.", ""]
    return "\n".join(out)


def rendre_liens(resultats: List[Dict]) -> str:
    morts = [r for r in resultats if not r["vivant"]]
    out = ["", "## Liens du dossier", "",
           f"**{len(resultats) - len(morts)}/{len(resultats)} liens répondent.**",
           "", "| État | Lien | Détail |", "|:--:|---|---|"]
    for r in sorted(resultats, key=lambda x: x["vivant"]):
        etat = "✅" if r["vivant"] else "🔴"
        out.append(f"| {etat} | [{r['nom']}]({r['url']}) | {r['detail']} |")
    out += ["", "> Un « HTTP 403 » signifie que le marchand refuse les robots, "
            "**pas** que le lien est mort : il s'ouvre normalement dans un "
            "navigateur. Un « HTTP 404 » est en revanche un vrai lien cassé, "
            "à corriger.", ""]
    return "\n".join(out)


def main(argv: Optional[List[str]] = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--poste", help="ne vérifier qu'un poste")
    ap.add_argument("--tolerance", type=float, default=12.0,
                    help="écart toléré en %% (défaut : 12)")
    ap.add_argument("--sortie", help="écrire le rapport markdown dans ce fichier")
    ap.add_argument("--strict", action="store_true",
                    help="code de sortie 1 si un écart dépasse le seuil")
    args = ap.parse_args(argv)

    from clayscore.site import PRIX

    catalogue = offres_du_catalogue() or OFFRES
    offres = [o for o in catalogue if not args.poste or o.poste == args.poste]
    if not offres:
        print(f"Aucune offre pour le poste {args.poste!r}.", file=sys.stderr)
        return 2

    taux, source = taux_usd_eur()
    lignes = verifier(offres, PRIX, args.tolerance, taux)
    rapport = rendre_markdown(lignes, PRIX, taux, source, args.tolerance)

    if not args.poste:
        from clayscore.fournisseurs import liens_a_tester
        liens = tester_liens([(f"{f.vendeur}", f.url) for f in liens_a_tester()])
        rapport += rendre_liens(liens)
        if args.strict and any(
                r["detail"].startswith("HTTP 404") for r in liens):
            print(rapport)
            if args.sortie:
                with open(args.sortie, "w", encoding="utf-8") as f:
                    f.write(rapport)
            return 1
    print(rapport)
    if args.sortie:
        with open(args.sortie, "w", encoding="utf-8") as f:
            f.write(rapport)
    if args.strict and any(x.get("alerte") for x in lignes):
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
