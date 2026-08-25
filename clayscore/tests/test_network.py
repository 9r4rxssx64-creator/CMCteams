"""Réseau : autonome, branché au réseau d'un club, et code d'accès.

Ces tests couvrent la demande « système complet autonome ET branchable au
réseau » : les deux modes, la bascule automatique, l'isolation des caméras et
la protection des écritures sur réseau partagé.
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from clayscore import network
from clayscore.server.app import create_app


# --- configuration --------------------------------------------------------- #
def test_modes_valides_et_invalides():
    for m in ("auto", "autonome", "reseau"):
        assert network.NetworkConfig(mode=m).mode == m
    with pytest.raises(ValueError):
        network.NetworkConfig(mode="wifi")           # faute de frappe refusée


def test_cle_inconnue_refusee():
    """Une clé mal orthographiée doit échouer, pas être ignorée en silence."""
    with pytest.raises(ValueError):
        network.NetworkConfig.from_dict({"mod": "autonome"})


def test_port_invalide_refuse():
    with pytest.raises(ValueError):
        network.NetworkConfig(port=0)
    with pytest.raises(ValueError):
        network.NetworkConfig(port=99999)


# --- résolution du mode ---------------------------------------------------- #
def test_mode_auto_bascule_selon_le_reseau_disponible():
    cfg = network.NetworkConfig(mode="auto")
    # Un réseau existe (club équipé) -> on le rejoint.
    assert network.resolve_mode(cfg, uplink=True) == "reseau"
    # Aucun réseau (stand en pleine nature) -> le hub crée le sien.
    assert network.resolve_mode(cfg, uplink=False) == "autonome"


def test_mode_force_ignore_la_detection():
    """Un mode explicite doit être respecté, même si un réseau existe."""
    assert network.resolve_mode(
        network.NetworkConfig(mode="autonome"), uplink=True) == "autonome"
    assert network.resolve_mode(
        network.NetworkConfig(mode="reseau"), uplink=False) == "reseau"


# --- état affiché sur la tablette ------------------------------------------ #
def test_status_donne_une_adresse_a_taper():
    cfg = network.NetworkConfig(mode="autonome", hostname="clayscore", port=8000)
    st = network.status(cfg, uplink=False, ip="192.168.50.1")
    assert st.connected is True
    assert "http://192.168.50.1:8000" in st.urls
    # Nom .local : évite de taper une IP sur la tablette.
    assert "http://clayscore.local:8000" in st.urls
    assert st.to_dict()["mode"] == "autonome"


def test_status_sans_adresse_est_signale():
    cfg = network.NetworkConfig(mode="reseau")
    st = network.status(cfg, uplink=True, ip=None)
    assert st.connected is False
    problemes = network.check_install(cfg, st)
    assert any(p["niveau"] == "bloquant" for p in problemes)


# --- isolation des caméras ------------------------------------------------- #
def test_cameras_isolees_detectees():
    cfg = network.NetworkConfig(camera_subnet="192.168.10.0/24")
    assert network.cameras_isolated(cfg, addrs="inet 192.168.10.1/24 scope global eth0")
    # Caméras sur le réseau du club = mauvaise installation.
    assert not network.cameras_isolated(cfg, addrs="inet 10.0.0.42/24 scope global eth0")


def test_probleme_signale_si_cameras_non_isolees():
    cfg = network.NetworkConfig(mode="reseau", access_pin="1234")
    st = network.status(cfg, uplink=True, ip="10.0.0.5")
    st.cameras_isolated = False
    assert any("caméras" in p["quoi"].lower()
               for p in network.check_install(cfg, st))


# --- code d'accès ---------------------------------------------------------- #
def test_pin_exige_des_qu_il_est_defini():
    cfg = network.NetworkConfig(access_pin="4242")
    assert network.require_pin(cfg, "reseau") is True
    assert network.require_pin(cfg, "autonome") is True   # jamais d'exception


def test_sans_pin_rien_n_est_exige_mais_c_est_signale():
    cfg = network.NetworkConfig(mode="reseau")
    assert network.require_pin(cfg, "reseau") is False
    st = network.status(cfg, uplink=True, ip="10.0.0.5")
    assert any("code d'accès" in p["quoi"].lower()
               for p in network.check_install(cfg, st))


# --- commande d'application ------------------------------------------------ #
def test_commande_appliquee_contient_le_mode_et_les_interfaces():
    cfg = network.NetworkConfig(mode="autonome", hotspot_ssid="StandBT",
                                hotspot_password="motdepasse")
    cmd = network.apply_command(cfg)
    assert "--mode" in cmd and "autonome" in cmd
    assert "StandBT" in cmd and "motdepasse" in cmd
    assert cmd[0].endswith("network.sh")


def test_commande_reseau_ne_fuit_pas_le_mot_de_passe_wifi():
    """En mode réseau, le hotspot n'est pas lancé : pas de mot de passe passé."""
    cfg = network.NetworkConfig(mode="reseau", hotspot_password="secret123")
    assert "secret123" not in network.apply_command(cfg)


# --- API ------------------------------------------------------------------- #
def _client(tmp_path, **net_kw):
    net = network.NetworkConfig(**net_kw)
    app = create_app(clips_dir=str(tmp_path / "clips"),
                     db_path=str(tmp_path / "db.sqlite"),
                     state_path=str(tmp_path / "state.json"), net=net)
    return TestClient(app)


def test_api_network_expose_l_adresse_et_les_problemes(tmp_path):
    c = _client(tmp_path, mode="autonome", hotspot_ssid="ClayScore")
    r = c.get("/api/network")
    assert r.status_code == 200
    data = r.json()
    assert data["mode"] == "autonome"
    assert data["hotspot_ssid"] == "ClayScore"
    assert isinstance(data["problemes"], list)


def test_api_version_et_sante(tmp_path):
    c = _client(tmp_path)
    assert c.get("/api/version").json()["version"]
    h = c.get("/api/health").json()
    assert h["ok"] is True and "disque" in h and "reseau" in h


def test_ecriture_refusee_sans_code_puis_acceptee_avec(tmp_path):
    """Cœur de la sécurité : sur réseau partagé, pas de score modifiable."""
    c = _client(tmp_path, mode="reseau", access_pin="2468")
    payload = {"discipline": "fosse_universelle", "shooters": ["A"], "serie": 3}

    assert c.post("/api/game/new", json=payload).status_code == 401
    assert c.post("/api/game/new", json=payload,
                  headers={"X-ClayScore-Pin": "0000"}).status_code == 401
    ok = c.post("/api/game/new", json=payload,
                headers={"X-ClayScore-Pin": "2468"})
    assert ok.status_code == 200

    # La lecture reste libre (écran TV du club-house, spectateurs).
    assert c.get("/api/game/state").status_code == 200
    assert c.get("/api/history").status_code == 200


def test_sans_code_configure_tout_reste_ouvert(tmp_path):
    """Sans code défini, on ne bloque pas un club en pleine compétition."""
    c = _client(tmp_path, mode="reseau")
    r = c.post("/api/game/new",
               json={"discipline": "fosse_universelle", "shooters": ["A"], "serie": 3})
    assert r.status_code == 200


def test_historique_borne_meme_si_on_demande_un_milliard(tmp_path):
    c = _client(tmp_path)
    assert c.get("/api/history?limit=1000000000").status_code == 200
