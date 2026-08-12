"""Le point d'entrée du serveur : `python -m clayscore.server`.

Ces 42 lignes n'étaient **couvertes par aucun test** (mesuré : 0 %). C'est
pourtant le seul chemin par lequel le produit démarre : s'il casse, il ne
reste rien — ni score, ni écran, ni tablette. Une faute de frappe dans la
configuration suffisait, et personne ne l'aurait su avant le stand.

On ne lance évidemment pas un vrai serveur ici : on vérifie que l'application
se **construit** correctement, que ce qui s'affiche à l'écran est utile à
quelqu'un qui n'est pas informaticien, et que `uvicorn` est appelé avec le bon
port — sans jamais l'exécuter.
"""
from __future__ import annotations

import sys

import pytest

from clayscore.server.__main__ import build_app, main


# --------------------------------------------------------- construction ----
def test_l_application_se_construit_sans_configuration():
    """Sans fichier de configuration, on doit obtenir un serveur utilisable."""
    app, net, cfg = build_app(None)
    assert app is not None
    assert net.port > 0, "un port valide est indispensable"
    assert isinstance(cfg, dict)


def test_la_configuration_du_club_est_vraiment_appliquee(tmp_path):
    """Ce qui est écrit dans config.yaml doit se retrouver dans le serveur."""
    cfg = tmp_path / "club.yaml"
    cfg.write_text(
        "network:\n"
        "  port: 8123\n"
        "alimentation:\n"
        "  sources: [batterie, secteur]\n"
        "  batterie_v: 12\n"
        "  batterie_ah: 30\n"
        "postes:\n"
        "  - id: F1-1\n"
        "    role: stereo_a\n"
        "    liaison: ethernet\n"
        "    distance_m: 30\n"
        "    flux: brut\n"
        "    alimentation: poe\n",
        encoding="utf-8")

    app, net, _ = build_app(str(cfg))

    assert net.port == 8123
    assert app.state.sources == ["batterie", "secteur"]
    assert app.state.battery.capacite_ah == 30
    assert len(app.state.fleet.pods) == 1, "le poste de vue déclaré est ignoré"
    assert app.state.fleet.pods[0].id == "F1-1"


def test_un_poste_de_vue_impossible_est_refuse_avant_le_stand(tmp_path):
    """Une caméra en vidéo brute par WiFi ne peut pas marcher : il faut le DIRE.

    C'est tout l'intérêt du contrôle au démarrage — 809 Mbit/s ne passent pas
    dans une liaison sans fil. Mieux vaut l'apprendre au garage qu'au concours.
    """
    cfg = tmp_path / "impossible.yaml"
    cfg.write_text(
        "postes:\n"
        "  - id: CH-1\n"
        "    role: stereo_a\n"
        "    liaison: wifi_maille\n"
        "    distance_m: 400\n"
        "    flux: brut\n"
        "    alimentation: batterie\n",
        encoding="utf-8")

    app, _, _ = build_app(str(cfg))
    problemes = app.state.fleet.check()

    assert problemes, "une vidéo brute par WiFi devrait être refusée"
    for p in problemes:
        assert p["solution"], "un problème signalé sans solution ne sert à rien"


# ------------------------------------------------------- démarrage réel ----
class _UvicornEspion:
    """Remplace uvicorn : on veut savoir COMMENT il est appelé, pas le lancer."""

    def __init__(self):
        self.appels = []

    def run(self, app, **kw):
        self.appels.append((app, kw))


@pytest.fixture
def uvicorn_espion(monkeypatch):
    espion = _UvicornEspion()
    monkeypatch.setattr("clayscore.server.__main__.uvicorn", espion)
    return espion


def test_le_serveur_demarre_sur_le_port_de_la_configuration(
        monkeypatch, uvicorn_espion, capsys):
    monkeypatch.setattr(sys, "argv", ["clayscore.server"])
    main()

    assert len(uvicorn_espion.appels) == 1, "le serveur n'a pas démarré"
    _, kw = uvicorn_espion.appels[0]
    assert kw["host"] == "0.0.0.0"
    assert kw["port"] > 0


def test_l_option_port_a_le_dernier_mot(monkeypatch, uvicorn_espion):
    """`--port 9999` doit gagner sur la configuration : c'est un dépannage."""
    monkeypatch.setattr(sys, "argv", ["clayscore.server", "--port", "9999"])
    main()
    assert uvicorn_espion.appels[0][1]["port"] == 9999


def test_ce_qui_s_affiche_est_lisible_par_quelqu_un_qui_n_est_pas_informaticien(
        monkeypatch, uvicorn_espion, capsys):
    """L'écran de démarrage doit donner l'ADRESSE à ouvrir sur la tablette.

    Sans elle, l'utilisateur a un serveur qui tourne et aucune idée de quoi
    en faire. C'est la seule information réellement indispensable.
    """
    monkeypatch.setattr(sys, "argv", ["clayscore.server"])
    main()
    sortie = capsys.readouterr().out

    assert "réseau" in sortie.lower()
    assert "http://" in sortie, "aucune adresse à ouvrir n'est affichée"
    assert "tablette" in sortie.lower()
    # Pas de vocabulaire d'informaticien à l'écran de démarrage.
    for jargon in ("Traceback", "Exception", "DEBUG", "stacktrace"):
        assert jargon not in sortie


def test_le_mode_rechargement_ne_sert_qu_au_developpement(
        monkeypatch, uvicorn_espion):
    """`--reload` passe une CHAÎNE à uvicorn (obligatoire pour recharger)."""
    monkeypatch.setattr(sys, "argv", ["clayscore.server", "--reload"])
    main()
    app_passee, kw = uvicorn_espion.appels[0]
    assert isinstance(app_passee, str), (
        "en mode rechargement, uvicorn exige le chemin de l'application")
    assert kw.get("reload") is True
