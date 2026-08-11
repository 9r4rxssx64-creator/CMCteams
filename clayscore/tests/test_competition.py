"""Niveau compétition : traçabilité, alimentation, postes de vue à distance.

Ce que vérifie ce fichier, c'est ce qu'une fédération demanderait : qu'un
score ne puisse pas être modifié sans que ça se voie, que le système ne
s'éteigne pas en cours d'épreuve, et qu'une installation impossible soit
refusée avant le terrain, pas pendant.
"""
from __future__ import annotations

import pytest

from clayscore import officiel, pods, power


# ======================= JOURNAL OFFICIEL ============================= #
def test_journal_chaine_et_verifie(tmp_path):
    j = officiel.OfficialJournal(tmp_path / "journal.jsonl")
    j.append("partie_ouverte", {"discipline": "fosse_universelle"})
    j.append("plateau_analyse", {"n": 1, "auto": "casse"})
    j.append("verdict_valide", {"n": 1, "verdict": "casse"})
    v = j.verify()
    assert v["ok"] is True and v["entrees"] == 3
    assert len(v["sceau"]) == 64


def test_journal_detecte_une_ligne_modifiee(tmp_path):
    """Le cœur de la preuve : trafiquer un score doit se voir."""
    p = tmp_path / "journal.jsonl"
    j = officiel.OfficialJournal(p)
    j.append("verdict_valide", {"n": 1, "verdict": "manque"})
    j.append("verdict_valide", {"n": 2, "verdict": "casse"})

    txt = p.read_text(encoding="utf-8").replace('"manque"', '"casse"')
    p.write_text(txt, encoding="utf-8")

    v = officiel.OfficialJournal(p).verify()
    assert v["ok"] is False
    assert "modifié" in v["raison"].lower()


def test_journal_detecte_une_ligne_supprimee(tmp_path):
    p = tmp_path / "journal.jsonl"
    j = officiel.OfficialJournal(p)
    for i in range(4):
        j.append("verdict_valide", {"n": i})
    lignes = p.read_text(encoding="utf-8").splitlines()
    del lignes[1]                                  # on efface un plateau
    p.write_text("\n".join(lignes) + "\n", encoding="utf-8")
    assert officiel.OfficialJournal(p).verify()["ok"] is False


def test_journal_survit_a_une_coupure(tmp_path):
    """Écriture immédiate : une coupure ne doit pas perdre les derniers tirs."""
    p = tmp_path / "journal.jsonl"
    j = officiel.OfficialJournal(p)
    j.append("verdict_valide", {"n": 1})
    j.append("verdict_valide", {"n": 2})
    del j                                          # simule la coupure
    relu = officiel.OfficialJournal(p)
    assert len(relu.entries) == 2 and relu.verify()["ok"]


def test_journal_refuse_un_evenement_non_prevu(tmp_path):
    j = officiel.OfficialJournal(tmp_path / "j.jsonl")
    with pytest.raises(ValueError):
        j.append("bidouille", {})


def test_reclamation_et_decision_jury_sont_tracees(tmp_path):
    j = officiel.OfficialJournal(tmp_path / "j.jsonl")
    j.append("verdict_valide", {"n": 7, "verdict": "manque"})
    j.append("reclamation", {"n": 7, "par": "Tireur 3", "motif": "éclat visible"})
    j.append("decision_jury", {"n": 7, "avant": "manque", "apres": "casse",
                               "jury": "Président de jury"})
    assert j.verify()["ok"]
    assert len(j.replay("decision_jury")) == 1


# ======================= FICHE SCELLÉE ================================ #
def test_sceau_change_si_un_score_change():
    fiche = [{"shooter": "Kevin", "casse": 24, "points": 24}]
    a = officiel.seal_scorecard(fiche, {"epreuve": "FU"}, "abc")
    assert officiel.verify_seal(a)

    fiche_trafiquee = [{"shooter": "Kevin", "casse": 25, "points": 25}]
    b = officiel.seal_scorecard(fiche_trafiquee, {"epreuve": "FU"}, "abc")
    assert a["sceau"] != b["sceau"]

    a["scorecard"] = fiche_trafiquee            # retouche après scellement
    assert officiel.verify_seal(a) is False


def test_sceau_depend_aussi_du_journal():
    fiche = [{"shooter": "A", "points": 10}]
    s1 = officiel.seal_scorecard(fiche, {}, "journal1")
    s2 = officiel.seal_scorecard(fiche, {}, "journal2")
    assert s1["sceau"] != s2["sceau"]


def test_sceau_court_lisible_a_l_oeil():
    s = officiel.seal_scorecard([{"a": 1}], {}, "x")
    assert len(s["sceau_court"]) == 12 and s["sceau_court"].isupper()


# ======================= GO / NO-GO ==================================== #
def _params(**over):
    base = dict(mode="concours", pin_actif=True, cameras_isolees=True,
                pods_ok=3, pods_total=3, alimentation_ok=True, autonomie_h=10.0,
                disque_libre_mo=5000, journal_ok=True, horloge_synchro=True)
    base.update(over)
    return base


def test_go_quand_tout_est_bon():
    assert officiel.pre_competition_check(**_params()).go is True


@pytest.mark.parametrize("defaut", [
    {"mode": "entrainement"},
    {"pin_actif": False},
    {"cameras_isolees": False},
    {"pods_ok": 2},
    {"alimentation_ok": False},
    {"autonomie_h": 3.0},
    {"disque_libre_mo": 100},
    {"journal_ok": False},
])
def test_nogo_des_qu_un_point_bloquant_manque(defaut):
    r = officiel.pre_competition_check(**_params(**defaut))
    assert r.go is False
    assert r.to_dict()["bloquants"], "Le point en défaut doit être nommé."


def test_horloge_desynchro_avertit_sans_bloquer():
    r = officiel.pre_competition_check(**_params(horloge_synchro=False))
    assert r.go is True
    assert r.to_dict()["avertissements"]


def test_chaque_probleme_donne_sa_solution():
    r = officiel.pre_competition_check(**_params(mode="entrainement",
                                                 pin_actif=False))
    for item in r.to_dict()["bloquants"]:
        assert item["solution"], "Un problème sans solution n'aide personne."


# ======================= ALIMENTATION ================================= #
def test_bilan_electrique_additionne_le_reel():
    c = power.consommation({"hub": 1, "camera": 3, "switch_poe": 1,
                            "routeur": 1, "ssd": 1, "micro": 1})
    assert c == 38.0


def test_element_oublie_leve_une_erreur():
    """Un poste inconnu doit échouer, pas être silencieusement ignoré."""
    with pytest.raises(ValueError):
        power.consommation({"projecteur": 1})


def test_autonomie_batterie_30ah():
    a = power.autonomie_h(power.Battery(capacite_ah=30), 38.0)
    assert 8.0 <= a <= 8.2                      # 360 Wh x 0,85 / 38 W


def test_secteur_ou_lanceur_rend_l_autonomie_illimitee():
    for src in ("secteur", "lanceur"):
        st = power.status(sources_presentes=[src],
                          batterie=power.Battery(charge_pct=50), conso_w=38)
        assert st.sur_batterie is False
        assert st.autonomie_h is None
        assert st.to_dict()["autonomie_h"] is None


def test_perte_du_secteur_ne_coupe_pas_mais_alerte():
    """La batterie est toujours en ligne : pas de coupure, mais on prévient."""
    st = power.status(sources_presentes=[], batterie=power.Battery(charge_pct=100),
                      conso_w=38)
    assert st.sur_batterie is True and st.source == "batterie"
    assert st.autonomie_h and st.autonomie_h > 8


def test_autonomie_insuffisante_est_bloquante():
    st = power.status(sources_presentes=[],
                      batterie=power.Battery(capacite_ah=7, charge_pct=100),
                      conso_w=38, duree_epreuve_h=8)
    assert any(a["niveau"] == "bloquant" for a in st.alertes)


def test_derivation_lanceur_rappelle_l_isolation():
    st = power.status(sources_presentes=["lanceur"], batterie=power.Battery(),
                      conso_w=38)
    assert any("isolé" in a["solution"] for a in st.alertes)


def test_source_inconnue_refusee():
    with pytest.raises(ValueError):
        power.status(sources_presentes=["panneau_solaire_bidon"],
                     batterie=power.Battery(), conso_w=38)


def test_estimation_signalee_comme_telle():
    """Ne jamais faire passer un calcul pour une mesure."""
    st = power.status(sources_presentes=[], batterie=power.Battery(), conso_w=38)
    assert st.mesure == "estimation"
    assert any("non mesurée" in a["quoi"] for a in st.alertes)


def test_dimensionnement_batterie():
    d = power.dimensionner(conso_w=38, duree_h=8)
    assert d["ah_recommandes"] in (50, 100)     # 38 W x 8 h + marges
    d2 = power.dimensionner(conso_w=10, duree_h=8)   # un pod seul
    assert d2["ah_recommandes"] <= 20


# ======================= POSTES DE VUE ================================ #
def test_video_brute_en_sans_fil_est_refusee():
    """Le garde-fou principal : 809 Mbit/s ne passent pas en WiFi."""
    p = pods.Pod("P1", role="stereo_a", liaison="wifi_local",
                 distance_m=40, flux="brut", alimentation="batterie")
    pbs = pods.check_link(p)
    assert any(x["niveau"] == "bloquant" for x in pbs)
    assert any("intelligent" in x["solution"] for x in pbs)


def test_pod_intelligent_passe_partout():
    p = pods.Pod("P1", role="stereo_a", liaison="wifi_directionnel",
                 distance_m=800, flux="edge", alimentation="batterie")
    assert pods.check_link(p) == []
    assert p.debit_requis_mbps() == pods.DEBIT_EDGE_MBPS


def test_distance_superieure_a_la_portee_est_refusee():
    p = pods.Pod("P1", liaison="wifi_local", distance_m=500, flux="edge",
                 alimentation="batterie")
    pbs = pods.check_link(p)
    assert any("porte à" in x["quoi"] for x in pbs)


def test_sans_fil_alimente_par_le_cable_est_incoherent():
    p = pods.Pod("P1", liaison="wifi_maille", distance_m=100, flux="edge",
                 alimentation="poe")
    assert any("incohérent" in x["quoi"] for x in pods.check_link(p))


def test_pod_filaire_par_defaut_ne_pose_aucun_probleme():
    assert pods.check_link(pods.Pod("P1", liaison="ethernet",
                                    distance_m=80)) == []


def test_flotte_exige_une_paire_appairee():
    f = pods.PodFleet()
    f.add(pods.Pod("A", role="stereo_a"))
    f.add(pods.Pod("B", role="lateral"))
    assert f.stereo_ok() is False
    assert any("appairée" in p["quoi"] for p in f.check())


def test_perte_d_un_poste_de_la_paire_est_bloquante():
    f = pods.PodFleet()
    f.add(pods.Pod("A", role="stereo_a"))
    f.add(pods.Pod("B", role="stereo_b", en_ligne=False))
    pbs = f.check()
    assert any(p["niveau"] == "bloquant" for p in pbs)


def test_deux_postes_de_meme_nom_refuses():
    f = pods.PodFleet()
    f.add(pods.Pod("A"))
    with pytest.raises(ValueError):
        f.add(pods.Pod("A"))


def test_horloge_decalee_est_bloquante():
    """Un décalage fausse l'association coup de feu / image."""
    f = pods.PodFleet()
    f.add(pods.Pod("A", role="stereo_a", derive_horloge_ms=120))
    f.add(pods.Pod("B", role="stereo_b"))
    assert any("horloge" in p["quoi"].lower() and p["niveau"] == "bloquant"
               for p in f.check())


def test_liaison_degradee_avertit():
    f = pods.PodFleet()
    f.add(pods.Pod("A", role="stereo_a", liaison="wifi_directionnel",
                   distance_m=500, flux="edge", alimentation="batterie",
                   latence_ms=300, perte_paquets_pct=5))
    f.add(pods.Pod("B", role="stereo_b", liaison="wifi_directionnel",
                   distance_m=500, flux="edge", alimentation="batterie"))
    quoi = " ".join(p["quoi"] for p in f.check())
    assert "lente" in quoi and "pertes" in quoi


def test_batterie_faible_d_un_poste_remonte():
    f = pods.PodFleet()
    f.add(pods.Pod("A", role="stereo_a", alimentation="batterie",
                   batterie_pct=10, liaison="ethernet"))
    f.add(pods.Pod("B", role="stereo_b"))
    assert any("batterie" in p["quoi"].lower() for p in f.check())


def test_debit_total_reste_raisonnable_en_intelligent():
    f = pods.PodFleet()
    for i, role in enumerate(("stereo_a", "stereo_b", "lateral")):
        f.add(pods.Pod(f"P{i}", role=role, liaison="wifi_directionnel",
                       distance_m=600, flux="edge", alimentation="batterie"))
    assert f.debit_total_mbps() < 1.0            # contre 2400 en vidéo brute
    assert f.check() == []


def test_couverture_grande_surface():
    c = pods.couverture(surface_m2=10000, portee_pod_m=50)   # 1 hectare
    assert c["zones"] == 4 and c["pods"] == 8
    assert "confirmer" in c["note"]


def test_flux_compresse_exige_un_encodeur_et_avertit():
    """Compresser n'est pas gratuit : il faut du matériel au pod. On le dit."""
    p = pods.Pod("P1", liaison="wifi_directionnel", distance_m=500,
                 flux="compresse", alimentation="batterie")
    pbs = pods.check_link(p)
    assert any("encodeur" in x["quoi"] for x in pbs)


def test_aucune_hypothese_implicite_sur_le_flux():
    """Une caméra nue envoie du BRUT, même sur une liaison sans fil.

    Supposer l'inverse était une erreur du premier modèle : elle laissait
    passer une installation impossible.
    """
    filaire = pods.Pod("A", liaison="ethernet", flux="brut")
    sansfil = pods.Pod("B", liaison="wifi_local", flux="brut",
                       alimentation="batterie")
    assert filaire.debit_requis_mbps() == sansfil.debit_requis_mbps()
    assert sansfil.debit_requis_mbps() == pods.DEBIT_BRUT_MBPS


def test_role_et_liaison_inconnus_refuses():
    with pytest.raises(ValueError):
        pods.Pod("A", role="drone")
    with pytest.raises(ValueError):
        pods.Pod("A", liaison="pigeon_voyageur")
    with pytest.raises(ValueError):
        pods.Pod("A", flux="telepathie")


# ======================= API COMPÉTITION =============================== #
def _client(tmp_path, **net_kw):
    from fastapi.testclient import TestClient
    from clayscore import network as net_mod
    from clayscore.server.app import create_app
    net = net_mod.NetworkConfig(**net_kw)
    app = create_app(clips_dir=str(tmp_path / "clips"),
                     db_path=str(tmp_path / "db.sqlite"),
                     state_path=str(tmp_path / "state.json"), net=net)
    return TestClient(app), app


def test_api_journal_trace_la_partie_et_les_verdicts(tmp_path):
    c, app = _client(tmp_path)
    c.post("/api/game/new", json={"discipline": "fosse_universelle",
                                  "shooters": ["A"], "serie": 3,
                                  "mode": "concours"})
    c.post("/api/game/throw")
    c.post("/api/game/verdict", json={"verdict": "casse", "cartridge": 1})

    r = c.get("/api/officiel/journal").json()
    assert r["verification"]["ok"] is True
    types = [e.type for e in app.state.journal.entries]
    assert "partie_ouverte" in types
    assert any(t.startswith("verdict_") for t in types)


def test_api_distingue_verdict_accepte_et_correction_humaine(tmp_path):
    """Un jury doit pouvoir relire QUI a corrigé QUOI."""
    c, app = _client(tmp_path)
    c.post("/api/game/new", json={"discipline": "fosse_universelle",
                                  "shooters": ["A"], "serie": 5,
                                  "mode": "concours"})
    c.post("/api/game/throw")
    auto = c.get("/api/game/state").json()["pending"]["auto_verdict"]
    contraire = "manque" if auto != "manque" else "casse"
    c.post("/api/game/verdict", json={"verdict": contraire, "cartridge": 1})

    types = [e.type for e in app.state.journal.entries]
    assert "verdict_corrige" in types
    corr = [e for e in app.state.journal.entries if e.type == "verdict_corrige"][0]
    assert corr.data["auto"] == auto and corr.data["verdict"] == contraire


def test_api_controle_avant_epreuve_dit_go_ou_non(tmp_path):
    c, _ = _client(tmp_path, mode="reseau", access_pin="1234")
    r = c.get("/api/officiel/controle").json()
    assert "go" in r and "alimentation" in r and "postes" in r
    # Aucune partie en mode concours ouverte -> NO-GO annoncé clairement.
    assert r["go"] is False
    assert any(b["cle"] == "mode" for b in r["bloquants"])


def test_api_fiche_scellee_et_verifiable(tmp_path):
    c, _ = _client(tmp_path)
    c.post("/api/game/new", json={"discipline": "fosse_universelle",
                                  "shooters": ["Kevin"], "serie": 3,
                                  "mode": "concours"})
    fiche = c.get("/api/officiel/fiche").json()
    assert officiel.verify_seal(fiche)
    fiche["scorecard"][0]["points"] = 999          # tentative de retouche
    assert officiel.verify_seal(fiche) is False


def test_api_alimentation_et_postes(tmp_path):
    c, _ = _client(tmp_path)
    a = c.get("/api/alimentation").json()
    assert a["conso_w"] > 0 and "mesure" in a
    p = c.get("/api/postes").json()
    assert "pods" in p and "problemes" in p
