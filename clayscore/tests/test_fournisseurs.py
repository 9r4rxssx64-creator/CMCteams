"""Le catalogue des fournisseurs et le devis comparatif.

Ce qui doit être garanti : un lien 1 clic par ligne, aucun lien inventé qui
prétendrait être une fiche produit, et un devis dont les totaux collent au
prévisionnel.
"""
import re

import pytest

from clayscore.fournisseurs import (
    CATALOGUE, RELEVE, VERIFIE, Fournisseur, par_vendeur, pour_poste, retenu)
from clayscore.site import PRIX
from tools.devis import ETAPE_0, generer, quantites


# --- intégrité du catalogue ---------------------------------------------- #
def test_chaque_offre_a_un_lien_https_et_un_poste_connu():
    assert CATALOGUE, "catalogue vide"
    for f in CATALOGUE:
        assert f.poste in PRIX, f"{f.vendeur} : poste inconnu {f.poste!r}"
        assert f.url.startswith("https://"), f"{f.vendeur} : lien non sécurisé"
        assert f.lien in ("fiche", "recherche")


def test_un_lien_de_recherche_n_est_jamais_presente_comme_une_fiche():
    # C'est la règle : on ne fait pas passer une page de résultats pour une
    # fiche produit. Les URL de recherche sont reconnaissables.
    marqueurs = ("/s?k=", "/recherche/", "/w/wholesale", "?search", "/search")
    for f in CATALOGUE:
        ressemble_a_une_recherche = any(m in f.url for m in marqueurs)
        if ressemble_a_une_recherche:
            assert f.lien == "recherche", (
                f"{f.vendeur} : URL de recherche déclarée comme fiche")


def test_valeurs_invalides_refusees():
    for mauvais in (
        dict(lien="magique"), dict(confiance="peut-etre"),
        dict(devise="BTC"), dict(par_unite=0), dict(prix=0.0),
    ):
        with pytest.raises(ValueError):
            Fournisseur("camera", "X", "FR", "https://ok.fr", **mauvais)
    with pytest.raises(ValueError):        # lien non sécurisé
        Fournisseur("camera", "X", "FR", "http://pas-securise.fr")


# --- choix du fournisseur ------------------------------------------------- #
def test_le_moins_cher_est_retenu_et_les_sans_prix_passent_en_dernier():
    offres = pour_poste("calculateur")
    prix = [f.prix_eur() for f in offres]
    connus = [p for p in prix if p is not None]
    assert connus == sorted(connus)
    assert prix[-1] is None                      # RS France : prix inconnu
    assert retenu("calculateur").vendeur.startswith("Gotronic")
    assert retenu("calculateur").prix_eur() == 392.5


def test_le_pont_se_vend_a_l_unite_mais_se_budgete_par_paire():
    # Getic vend 48,04 € l'unité ; il en faut DEUX -> 96,08 € la paire.
    getic = retenu("pont_directionnel")
    assert getic.prix == 48.04 and getic.par_unite == 0.5
    assert getic.prix_eur() == 96.08


def test_le_prix_retenu_colle_au_previsionnel():
    # Garde-fou : le devis et le prévisionnel ne doivent jamais diverger.
    for poste, attendu in PRIX.items():
        choix = retenu(poste)
        if choix is None:
            continue
        assert abs(choix.prix_eur() - attendu) < 0.51, (
            f"{poste} : devis {choix.prix_eur()} € vs prévisionnel {attendu} €")


def test_tous_les_postes_du_previsionnel_ont_au_moins_un_fournisseur():
    sans = {p for p in PRIX if not pour_poste(p)}
    assert not sans, f"postes sans fournisseur ni lien : {sans}"


def test_le_devis_regroupe_par_vendeur():
    groupes = par_vendeur()
    assert groupes
    for vendeur, offres in groupes.items():
        assert offres
        assert all(f.vendeur == vendeur for f in offres)


# --- le document produit -------------------------------------------------- #
def test_le_devis_contient_un_lien_cliquable_par_ligne():
    md = generer("optimal")
    # On ne regarde que les tableaux d'articles (pas le récapitulatif final).
    corps = md.split("## 3. Récapitulatif")[0]
    lignes_produit = [ln for ln in corps.split("\n")
                      if ln.startswith("| ") and "€" in ln
                      and "Sous-total" not in ln]
    assert lignes_produit
    for ln in lignes_produit:
        assert re.search(r"\[.+?\]\(https://", ln), f"ligne sans lien : {ln[:80]}"


def test_le_devis_distingue_acheter_et_chercher():
    md = generer("optimal")
    assert "🛒 Acheter" in md and "🔎 Chercher" in md
    assert "On ne fait pas passer l'un pour l'autre" in md


def test_le_devis_affiche_les_trois_niveaux_de_confiance():
    md = generer("optimal")
    for badge in ("✅", "🟢", "🟡"):
        assert badge in md


def test_le_devis_dit_qu_il_n_engage_personne():
    md = generer("optimal")
    assert "n'engage aucun vendeur" in md
    assert "frais de port" in md


def test_le_kit_de_validation_est_beaucoup_moins_cher_que_le_club():
    etape0 = generer("optimal", etape=0)
    club = generer("optimal")
    def total(md):
        m = re.search(r"\*\*TOTAL LIVRÉ\*\* \| \*\*([\d\s.,]+) €", md)
        return float(m.group(1).replace(" ", "").replace(",", "."))
    assert total(etape0) < total(club) / 5


def test_les_quantites_de_l_etape_0_sont_celles_du_kit():
    assert quantites("optimal", etape=0) == ETAPE_0
    assert quantites("optimal", etape=None)["camera"] == 13   # 10 + 3 secours


def test_le_comparatif_marque_le_moins_cher():
    md = generer("optimal")
    # Gotronic (392,50 €) doit être coché, pas Kubii (465 €).
    ligne_gotronic = next(ln for ln in md.split("\n")
                          if "Gotronic" in ln and "392" in ln)
    ligne_kubii = next(ln for ln in md.split("\n")
                       if "Kubii" in ln and "465" in ln)
    assert ligne_gotronic.startswith("| **✔**")
    assert not ligne_kubii.startswith("| **✔**")


def test_confiance_verifiee_pour_ce_qui_a_ete_lu_sur_la_fiche():
    assert retenu("calculateur").confiance == VERIFIE
    assert retenu("pont_directionnel").confiance == VERIFIE
    assert retenu("camera").confiance == RELEVE     # prix en JavaScript
