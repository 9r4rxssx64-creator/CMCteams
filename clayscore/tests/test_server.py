"""Tests du jalon 5 : serveur FastAPI + WebSocket + ralentis + PWA."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from clayscore.server.app import create_app


@pytest.fixture()
def client(tmp_path):
    app = create_app(clips_dir=str(tmp_path / "clips"),
                     db_path=str(tmp_path / "test.db"),
                     state_path=str(tmp_path / "state.json"))
    with TestClient(app) as c:
        yield c


def test_disciplines(client):
    r = client.get("/api/disciplines")
    assert r.status_code == 200
    keys = {d["key"] for d in r.json()}
    assert {"fosse_universelle", "dtl", "parcours", "compak"} <= keys


def test_new_game_and_state(client):
    r = client.post("/api/game/new", json={
        "discipline": "fosse_universelle",
        "shooters": ["Kevin", "Laurence"], "serie": 3})
    assert r.status_code == 200
    st = r.json()
    assert st["active"] and st["current_shooter"] == "Kevin"
    assert st["current_post"] == 1

    st2 = client.get("/api/game/state").json()
    assert st2["current_shooter"] == "Kevin"


def test_throw_returns_analysis_and_clip_is_served(client):
    client.post("/api/game/new", json={"shooters": ["A"], "serie": 3})
    r = client.post("/api/game/throw")
    assert r.status_code == 200
    an = r.json()["analysis"]
    assert an["auto_verdict"] in ("casse", "manque", "nobird", "ambigu")
    assert an["clip_url"].startswith("/clips/")
    # Le ralenti (mp4) est réellement servi.
    clip = client.get(an["clip_url"])
    assert clip.status_code == 200
    assert clip.headers["content-type"] == "video/mp4"
    assert len(clip.content) > 100


def test_throw_before_new_game_errors(client):
    assert client.post("/api/game/throw").status_code == 400


def test_full_game_via_api(client):
    client.post("/api/game/new", json={"shooters": ["A"], "serie": 2})
    finished = False
    for _ in range(20):
        st = client.get("/api/game/state").json()
        if st["finished"]:
            finished = True
            break
        client.post("/api/game/throw")          # analyse (génère le ralenti)
        client.post("/api/game/verdict", json={"verdict": "casse"})  # arbitrage humain
    assert finished
    st = client.get("/api/game/state").json()
    assert st["scorecard"][0]["clays"] == 2
    assert st["scorecard"][0]["casse"] == 2


def test_verdict_advances_rotation(client):
    client.post("/api/game/new", json={"shooters": ["A", "B"], "serie": 2})
    client.post("/api/game/throw")
    client.post("/api/game/verdict", json={"verdict": "casse"})
    st = client.get("/api/game/state").json()
    assert st["current_shooter"] == "B"


def test_nobird_keeps_shooter(client):
    client.post("/api/game/new", json={"shooters": ["A", "B"], "serie": 2})
    client.post("/api/game/throw")
    client.post("/api/game/verdict", json={"verdict": "nobird"})
    st = client.get("/api/game/state").json()
    assert st["current_shooter"] == "A"  # gelé sur A


def test_finish_saves_and_history(client):
    client.post("/api/game/new", json={"shooters": ["A"], "serie": 1})
    client.post("/api/game/throw")
    client.post("/api/game/verdict", json={"verdict": "casse"})
    r = client.post("/api/game/finish")
    assert r.status_code == 200
    pid = r.json()["saved_id"]
    hist = client.get("/api/history").json()
    assert any(p["id"] == pid for p in hist)
    detail = client.get(f"/api/history/{pid}").json()
    assert detail["scorecard"][0]["casse"] == 1


def test_csv_export(client):
    client.post("/api/game/new", json={"shooters": ["A"], "serie": 1})
    client.post("/api/game/throw")
    client.post("/api/game/verdict", json={"verdict": "casse"})
    txt = client.get("/api/game/csv").text
    assert "tireur" in txt and "A" in txt


def test_dtl_scoring_via_api(client):
    client.post("/api/game/new", json={
        "discipline": "dtl", "shooters": ["A"], "serie": 1})
    client.post("/api/game/throw")
    client.post("/api/game/verdict", json={"verdict": "casse", "cartridge": 1})
    st = client.get("/api/game/state").json()
    assert st["scorecard"][0]["points"] == 3  # DTL 1re cartouche = 3 pts


def test_websocket_receives_state(client):
    with client.websocket_connect("/ws") as ws:
        first = ws.receive_json()
        assert first["type"] == "state"
        # Une action HTTP déclenche un broadcast.
        client.post("/api/game/new", json={"shooters": ["A"], "serie": 2})
        msg = ws.receive_json()
        assert msg["type"] == "state"
        assert msg["state"]["active"]


def test_pwa_served(client):
    r = client.get("/")
    assert r.status_code == 200
    assert "ClayScore" in r.text
    assert client.get("/app.js").status_code == 200
    assert client.get("/manifest.webmanifest").status_code == 200
    assert client.get("/sw.js").status_code == 200


def test_multi_lanceurs_via_api(client):
    r = client.post("/api/game/new", json={
        "shooters": ["A"], "serie": 4, "machines": ["Trap 1", "Trap 2"]})
    st = r.json()
    assert st["machines"] == ["Trap 1", "Trap 2"]
    assert st["current_machine"] == "Trap 1"


def test_mode_concours_desactive_lauto_validation(client):
    # Même si auto_mode est demandé, le mode concours l'interdit :
    # chaque plateau doit être arbitré (traçabilité officielle).
    st = client.post("/api/game/new", json={
        "shooters": ["A"], "serie": 3,
        "auto_mode": True, "mode": "concours"}).json()
    assert st["official"] is True
    assert st["auto_mode"] is False
    r = client.post("/api/game/throw").json()
    assert r["committed"] is None          # rien n'a été validé tout seul
    assert r["state"]["pending"] is not None


def test_mode_entrainement_autorise_lauto(client):
    st = client.post("/api/game/new", json={
        "shooters": ["A"], "serie": 3, "auto_mode": True}).json()
    assert st["auto_mode"] is True and st["official"] is False


def test_mode_invalide_rejete(client):
    r = client.post("/api/game/new", json={"shooters": ["A"], "mode": "apero"})
    assert r.status_code == 400
