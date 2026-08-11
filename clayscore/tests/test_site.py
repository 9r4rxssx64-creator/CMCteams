"""Un club entier : plusieurs terrains distants + club-house.

Ces tests cherchent à FAIRE ÉCHOUER le modèle, pas à le confirmer : distances
hors portée, liaison partagée saturée, parcours sans nombre de lanceurs,
retour caméra trop gourmand.
"""
import pytest

from clayscore.pods import LIAISONS, Pod
from clayscore.site import (
    LANCEURS_PAR_DISCIPLINE, PRIX, RETOUR_CAMERA, Site, Terrain)


def _pods(prefixe: str, n: int = 3):
    roles = ["stereo_a", "stereo_b", "lateral", "secours"]
    return [Pod(f"{prefixe}-{i+1}", role=roles[i % 4], liaison="ethernet",
                distance_m=30, flux="brut", alimentation="poe")
            for i in range(n)]


def _fosse(id_: str, distance: float = 300, retour: str = "apercu"):
    return Terrain(id_, "fosse_olympique", distance_club_m=distance,
                   retour_camera=retour, pods=_pods(id_))


def _bloquants(problemes):
    return [p for p in problemes if p["niveau"] == "bloquant"]


# --- nombre de lanceurs déduit de la discipline -------------------------- #
@pytest.mark.parametrize("discipline,attendu", [
    ("fosse_olympique", 15),      # 5 pédanes x 3 machines
    ("fosse_universelle", 5),     # 5 machines dans une seule fosse
    ("compak", 3),                # minimum réglementaire
])
def test_lanceurs_deduits_de_la_discipline(discipline, attendu):
    t = Terrain("T", discipline, distance_club_m=100, pods=_pods("T"))
    assert t.n_lanceurs == attendu


def test_parcours_sans_nombre_de_lanceurs_est_refuse():
    # Un parcours de chasse n'a PAS de nombre standard : inventer une valeur
    # par défaut donnerait un prévisionnel faux.
    assert LANCEURS_PAR_DISCIPLINE["parcours"] is None
    with pytest.raises(ValueError, match="parcours"):
        Terrain("P", "parcours", distance_club_m=100, pods=_pods("P"))


def test_parcours_avec_nombre_declare_passe():
    t = Terrain("P", "parcours", distance_club_m=100, n_lanceurs=8,
                pods=_pods("P"))
    assert t.n_lanceurs == 8


def test_valeurs_invalides_refusees():
    with pytest.raises(ValueError):
        Terrain("T", "petanque", distance_club_m=10, pods=_pods("T"))
    with pytest.raises(ValueError):
        Terrain("T", "fosse_olympique", distance_club_m=10,
                liaison_club="pigeon", pods=_pods("T"))
    with pytest.raises(ValueError):
        Terrain("T", "fosse_olympique", distance_club_m=10,
                retour_camera="4k", pods=_pods("T"))
    with pytest.raises(ValueError):
        Terrain("T", "fosse_olympique", distance_club_m=-1, pods=_pods("T"))
    with pytest.raises(ValueError):
        Terrain("P", "parcours", distance_club_m=10, n_lanceurs=0,
                pods=_pods("P"))


# --- ce qui remonte au club-house ---------------------------------------- #
@pytest.mark.parametrize("retour,attendu", [
    ("aucun", 0.2),      # le score seul
    ("apercu", 4.2),     # 720p
    ("hd", 12.2),        # 1080p
])
def test_debit_vers_le_club(retour, attendu):
    t = _fosse("F1", retour=retour)
    assert t.debit_vers_club_mbps() == pytest.approx(attendu)


def test_le_score_seul_reste_negligeable():
    # C'est tout l'intérêt du pod qui décide sur place : sans retour vidéo,
    # trois terrains tiennent dans moins de 1 Mbit/s.
    s = Site([_fosse(f"F{i}", retour="aucun") for i in range(3)])
    assert s.debit_club_mbps() < 1.0


# --- distances ------------------------------------------------------------ #
def test_club_trop_loin_pour_du_wifi_ordinaire():
    t = Terrain("F1", "fosse_olympique", distance_club_m=800,
                liaison_club="wifi_maille", pods=_pods("F1"))
    quoi = " ".join(p["quoi"] for p in _bloquants(t.check()))
    assert "800" in quoi


def test_le_pont_directionnel_couvre_la_distance():
    t = _fosse("F1", distance=800)
    assert _bloquants(t.check()) == []


def test_au_dela_du_pont_il_reste_la_4g():
    t = Terrain("F1", "fosse_olympique", distance_club_m=5000,
                liaison_club="wifi_directionnel", pods=_pods("F1"))
    solutions = " ".join(p["solution"] for p in _bloquants(t.check()))
    assert "4G" in solutions or "LTE" in solutions


# --- débit ---------------------------------------------------------------- #
def test_liaison_trop_faible_pour_le_retour_camera(monkeypatch):
    # Garde-fou générique : on simule une liaison lente pour prouver qu'il
    # déclenche, sans dépendre des débits actuels du catalogue.
    monkeypatch.setitem(LIAISONS, "lente",
                        {"label": "Liaison lente", "portee_m": 5000,
                         "debit_mbps": 5, "sans_fil": True})
    t = Terrain("F1", "fosse_olympique", distance_club_m=100,
                liaison_club="lente", retour_camera="hd", pods=_pods("F1"))
    probs = _bloquants(t.check())
    assert any("12" in p["quoi"] for p in probs)
    assert any("apercu" in p["solution"] for p in probs)


def test_liaison_partagee_saturee_par_plusieurs_terrains():
    # Une 4G est PARTAGÉE : 3 terrains en HD ne tiennent pas dedans, alors que
    # chacun pris isolément passerait. C'est l'erreur qu'on veut attraper.
    s = Site([Terrain(f"F{i}", "fosse_olympique", distance_club_m=200,
                      liaison_club="lte", retour_camera="hd",
                      pods=_pods(f"F{i}")) for i in range(3)])
    for t in s.terrains:                      # chacun seul : ça passe
        assert _bloquants(t.check()) == []
    quoi = " ".join(p["quoi"] for p in _bloquants(s.check()))
    assert "partagent" in quoi


def test_ponts_directionnels_dedies_ne_se_partagent_pas():
    s = Site([_fosse(f"F{i}", retour="hd") for i in range(3)])
    assert not any("partagent" in p["quoi"] for p in s.check())


def test_un_pont_par_terrain_est_signale():
    s = Site([_fosse(f"F{i}") for i in range(3)])
    avis = [p for p in s.check() if "point-à-point" in p["quoi"]]
    assert len(avis) == 1
    assert avis[0]["niveau"] == "important"    # pas bloquant : c'est du budget


def test_un_seul_terrain_ne_declenche_pas_l_avertissement_ponts():
    s = Site([_fosse("F1")])
    assert not any("point-à-point" in p["quoi"] for p in s.check())


# --- garde-fous du site --------------------------------------------------- #
def test_site_vide_est_bloquant():
    assert _bloquants(Site().check())


def test_deux_terrains_meme_nom_refuses():
    s = Site()
    s.add(_fosse("F1"))
    with pytest.raises(ValueError, match="même nom"):
        s.add(_fosse("F1"))


def test_terrain_sans_poste_de_vue_est_bloquant():
    t = Terrain("F1", "fosse_olympique", distance_club_m=100, pods=[])
    assert _bloquants(t.check())


def test_terrain_sans_paire_stereo_est_bloquant():
    t = Terrain("F1", "fosse_olympique", distance_club_m=100,
                pods=[Pod("F1-1", role="lateral")])
    quoi = " ".join(p["quoi"] for p in _bloquants(t.check()))
    assert "appairée" in quoi


# --- prévisionnel matériel ------------------------------------------------ #
def test_bom_compte_le_materiel_du_club():
    s = Site([_fosse("FO-1"), _fosse("FO-2"),
              Terrain("CHASSE", "parcours", distance_club_m=900,
                      n_lanceurs=8, pods=_pods("CH", 4))],
             nom="Club")
    bom = s.bom("minimum")
    lignes = {ligne["poste"]: ligne for ligne in bom["lignes"]}

    assert bom["n_terrains"] == 3
    assert bom["n_pods"] == 3 + 3 + 4
    assert lignes["camera"]["qte"] == 10          # 1 par poste de vue
    assert lignes["objectif"]["qte"] == 10        # 1 focale par poste
    assert lignes["calculateur"]["qte"] == 3      # 1 par terrain
    assert lignes["pont_directionnel"]["qte"] == 3
    assert lignes["ecran_club"]["qte"] == 1
    assert bom["n_lanceurs"] == 15 + 15 + 8


def test_bom_total_est_la_somme_exacte_des_lignes():
    s = Site([_fosse("F1"), _fosse("F2")])
    bom = s.bom()
    attendu = sum(PRIX[ligne["poste"]] * ligne["qte"] for ligne in bom["lignes"])
    assert bom["total"] == pytest.approx(attendu)
    assert bom["total"] > 0


def test_bom_signale_les_postes_qui_n_existaient_pas_dans_le_kit_seul():
    bom = Site([_fosse("F1")]).bom()
    nouveaux = {ligne["poste"] for ligne in bom["lignes"] if ligne["nouveau"]}
    assert nouveaux == {"ecran_club", "mini_pc_club"}
    assert bom["total_postes_nouveaux"] > 0
    assert "devis" in bom["avertissement"]


def test_bom_ne_facture_pas_de_pont_pour_un_terrain_cable():
    s = Site([Terrain("F1", "fosse_olympique", distance_club_m=50,
                      liaison_club="ethernet", pods=_pods("F1"))])
    postes = {ligne["poste"] for ligne in s.bom()["lignes"]}
    assert "pont_directionnel" not in postes


def test_plus_de_terrains_coute_plus_cher():
    petit = Site([_fosse("F1")]).bom()["total"]
    grand = Site([_fosse("F1"), _fosse("F2"), _fosse("F3")]).bom()["total"]
    assert grand > petit


# --- sérialisation (ce que l'appli affichera) ----------------------------- #
def test_to_dict_expose_tout_ce_qu_il_faut_a_l_ecran():
    s = Site([_fosse("FO-1"), _fosse("FO-2"),
              Terrain("CHASSE", "parcours", distance_club_m=900,
                      n_lanceurs=8, retour_camera="aucun", pods=_pods("CH"))],
             nom="TAV")
    d = s.to_dict()
    assert d["nom"] == "TAV"
    assert d["n_terrains"] == 3
    assert d["n_lanceurs"] == 38
    assert d["debit_club_mbps"] == pytest.approx(4.2 + 4.2 + 0.2)
    assert {t["id"] for t in d["terrains"]} == {"FO-1", "FO-2", "CHASSE"}
    assert d["bom"]["total"] > 0
    assert _bloquants(d["problemes"]) == []


def test_le_catalogue_des_retours_reste_ordonne():
    assert RETOUR_CAMERA["aucun"] < RETOUR_CAMERA["apercu"] < RETOUR_CAMERA["hd"]


# --- provenance des prix : rien d'inventé sans source --------------------- #
def test_chaque_prix_a_une_provenance():
    # Le garde-fou : impossible d'ajouter un prix sans dire d'où il vient.
    from clayscore.site import SOURCE_PRIX
    assert set(PRIX) == set(SOURCE_PRIX)
    for poste, source in SOURCE_PRIX.items():
        assert len(source) > 30, f"{poste} : provenance trop vague"


def test_les_prix_releves_sont_distingues_des_hypotheses():
    from clayscore.site import prix_releve
    releves = {p for p in PRIX if prix_releve(p)}
    # Ceux-là ont une offre publique datée derrière eux.
    assert releves == {"camera", "objectif", "calculateur", "batterie_30ah",
                       "pont_directionnel"}
    # Les postes inventés pour le club-house n'en font PAS partie.
    assert not any(prix_releve(p) for p in ("ecran_club", "mini_pc_club"))


def test_trois_niveaux_de_confiance_sur_les_prix():
    from clayscore.site import niveau_prix
    # VÉRIFIÉ = la fiche produit a été ouverte par le workflow de contrôle.
    assert niveau_prix("calculateur") == "verifie"
    assert niveau_prix("pont_directionnel") == "verifie"
    # RELEVÉ = vu dans une recherche, fiche jamais ouverte.
    assert niveau_prix("camera") == "releve"
    # cible = hypothèse de planification.
    assert niveau_prix("ecran_club") == "cible"


def test_le_bom_isole_ce_qui_est_reellement_verifie():
    bom = Site([_fosse("F1"), _fosse("F2")]).bom()
    assert 0 < bom["verifies"] <= bom["releves"] <= bom["total"]


def test_le_bom_dit_quelle_part_du_total_est_reellement_relevee():
    bom = Site([_fosse("F1"), _fosse("F2")]).bom()
    assert bom["releves"] + bom["cibles"] == pytest.approx(bom["total"])
    assert bom["releves"] > 0 and bom["cibles"] > 0
    assert "devis" in bom["avertissement"]
    for ligne in bom["lignes"]:
        assert "source_prix" in ligne
        assert isinstance(ligne["prix_releve"], bool)


# --- niveau minimum vs optimal ------------------------------------------- #
def _club():
    return Site([_fosse("FO-1"), _fosse("FO-2"),
                 Terrain("CHASSE", "parcours", distance_club_m=700,
                         n_lanceurs=8, pods=_pods("CH", 4))], nom="Club")


def test_le_niveau_optimal_ajoute_un_secours_par_terrain():
    mini = _club().bom("minimum")
    opti = _club().bom("optimal")
    assert mini["pods_secours"] == 0
    assert opti["pods_secours"] == 3            # 1 par terrain
    assert opti["n_pods_factures"] == mini["n_pods_factures"] + 3
    lignes = {ligne["poste"]: ligne for ligne in opti["lignes"]}
    assert lignes["camera"]["qte"] == 13
    assert "secours" in lignes["camera"]["note"]


def test_le_niveau_optimal_prend_les_deux_focales():
    opti = _club().bom("optimal")
    lignes = {ligne["poste"]: ligne for ligne in opti["lignes"]}
    # 13 postes x 2 focales (8 mm ET 12 mm) : on choisit sur le terrain.
    assert lignes["objectif"]["qte"] == 26
    assert "8 mm" in lignes["objectif"]["note"]


def test_optimal_coute_plus_cher_que_minimum_et_on_sait_de_combien():
    mini, opti = _club().bom("minimum"), _club().bom("optimal")
    assert opti["total"] > mini["total"]
    # L'écart doit rester raisonnable : c'est une assurance, pas un doublement.
    assert (opti["total"] - mini["total"]) / mini["total"] < 0.35


def test_le_defaut_est_l_optimal():
    # Kevin a demandé « l'optimal tout de suite » : c'est le défaut.
    assert _club().bom()["niveau"] == "optimal"
    d = _club().to_dict()
    assert d["bom"]["niveau"] == "optimal"
    assert d["bom_minimum"]["niveau"] == "minimum"


def test_niveau_inconnu_refuse():
    with pytest.raises(ValueError, match="minimum"):
        _club().bom("luxe")


# --- approvisionnement Chine / UE ---------------------------------------- #
def test_chaque_origine_est_justifiee_et_coherente():
    from clayscore.site import ORIGINE
    for poste, o in ORIGINE.items():
        assert o["retenu"] in ("chine", "ue")
        assert o[o["retenu"]] is not None, f"{poste} : prix retenu manquant"
        assert PRIX[poste] == o[o["retenu"]], f"{poste} : PRIX ≠ origine retenue"
        assert len(o["pourquoi"]) > 40, f"{poste} : justification trop vague"


def test_la_camera_vient_de_chine_et_le_calculateur_d_europe():
    from clayscore.site import ORIGINE
    # Le résultat n'est pas « tout de Chine » : c'est un choix MIXTE, mesuré.
    assert ORIGINE["camera"]["retenu"] == "chine"
    assert ORIGINE["calculateur"]["retenu"] == "ue"
    assert ORIGINE["pont_directionnel"]["retenu"] == "ue"


def test_un_import_coute_la_tva_en_plus():
    from clayscore.site import cout_import
    assert cout_import(100.0) == 120.0
    # La caméra reste gagnante même importée taxée.
    from clayscore.site import ORIGINE
    assert cout_import(ORIGINE["camera"]["chine"]) < ORIGINE["camera"]["ue"]
