"""Entretien du disque + non-régression des défauts trouvés à l'audit.

Le disque plein est la panne qui tombe forcément au pire moment (en pleine
compétition, à l'écriture d'un clip). Ces tests garantissent que ça n'arrive
pas, et que les correctifs de l'audit ne repartent pas.
"""
from __future__ import annotations

import re
import time
from pathlib import Path

from clayscore import maintenance

WEBAPP = Path(__file__).resolve().parents[1] / "webapp"


def _clip(d: Path, name: str, size: int, age_s: float = 0.0) -> Path:
    p = d / name
    p.write_bytes(b"\0" * size)
    if age_s:
        t = time.time() - age_s
        import os
        os.utime(p, (t, t))
    return p


# --- purge des ralentis ---------------------------------------------------- #
def test_purge_par_nombre_garde_les_plus_recents(tmp_path):
    for i in range(10):
        _clip(tmp_path, f"c{i}.mp4", 100, age_s=10 * (10 - i))  # c9 = le + récent
    res = maintenance.cleanup_clips(tmp_path, max_files=4, max_mb=999)
    assert res["deleted"] == 6
    restants = sorted(p.name for p in tmp_path.glob("*.mp4"))
    assert restants == ["c6.mp4", "c7.mp4", "c8.mp4", "c9.mp4"]


def test_purge_par_taille(tmp_path):
    for i in range(6):
        _clip(tmp_path, f"c{i}.mp4", 400 * 1024, age_s=10 * (6 - i))
    # 6 x 400 Ko = 2,4 Mo -> plafond 1 Mo n'en garde que 2.
    res = maintenance.cleanup_clips(tmp_path, max_files=999, max_mb=1)
    assert res["deleted"] == 4
    assert len(list(tmp_path.glob("*.mp4"))) == 2


def test_le_clip_en_cours_d_arbitrage_n_est_jamais_supprime(tmp_path):
    """On ne retire pas la vidéo que l'arbitre est en train de regarder."""
    for i in range(5):
        _clip(tmp_path, f"c{i}.mp4", 100, age_s=10 * (5 - i))
    maintenance.cleanup_clips(tmp_path, max_files=1, max_mb=999,
                              keep={"/clips/c0.mp4"})     # le PLUS ancien
    assert (tmp_path / "c0.mp4").exists()


def test_purge_ne_leve_jamais_meme_sur_dossier_absent(tmp_path):
    res = maintenance.cleanup_clips(tmp_path / "nexiste_pas")
    assert res["deleted"] == 0


def test_rapport_disque(tmp_path):
    _clip(tmp_path, "a.mp4", 1024 * 1024)
    r = maintenance.disk_report(tmp_path)
    assert r["clips"] == 1 and r["mb"] == 1.0


def test_purge_automatique_apres_chaque_plateau(tmp_path):
    """Le serveur doit entretenir le disque tout seul, sans intervention."""
    from fastapi.testclient import TestClient
    from clayscore.server.app import create_app

    clips = tmp_path / "clips"
    clips.mkdir()
    for i in range(700):                     # au-delà de la limite par défaut
        _clip(clips, f"vieux{i}.mp4", 10, age_s=10_000)
    app = create_app(clips_dir=str(clips), db_path=str(tmp_path / "d.sqlite"),
                     state_path=str(tmp_path / "s.json"))
    c = TestClient(app)
    c.post("/api/game/new", json={"discipline": "fosse_universelle",
                                  "shooters": ["A"], "serie": 3})
    c.post("/api/game/throw")
    assert len(list(clips.glob("*.mp4"))) <= maintenance.DEFAULT_MAX_FILES


# --- non-régression : XSS des noms de tireurs ------------------------------ #
def test_les_noms_de_tireurs_sont_echappes_dans_la_pwa():
    """Un nom comme <img onerror=...> ne doit jamais s'exécuter.

    Sans ça, n'importe qui pourrait injecter du code sur toutes les tablettes
    ET sur l'écran TV du club-house en s'inscrivant sous un faux nom.
    """
    js = (WEBAPP / "app.js").read_text(encoding="utf-8")
    assert "function esc(" in js, "L'échappement doit exister."
    # Toute interpolation d'un nom de tireur dans du HTML passe par esc().
    for m in re.finditer(r"\$\{([^}]*\bshooter\b[^}]*)\}", js):
        expr = m.group(1)
        assert "esc(" in expr or "===" in expr, (
            f"Nom de tireur inséré sans échappement : {expr!r}")


def test_le_code_d_acces_est_envoye_par_la_pwa():
    js = (WEBAPP / "app.js").read_text(encoding="utf-8")
    assert "X-ClayScore-Pin" in js


# --- non-régression : le serveur ne se bloque pas -------------------------- #
def test_les_traitements_lourds_ne_bloquent_pas_le_serveur():
    """Analyse, habillage vidéo et écriture base tournent dans un fil séparé.

    Mesuré avant correction : une 2e tablette attendait 13x plus longtemps
    pendant l'analyse d'un plateau (530 ms au lieu de 41 ms).
    """
    src = (Path(__file__).resolve().parents[1]
           / "clayscore" / "server" / "app.py").read_text(encoding="utf-8")
    for appel in ("engine().throw", "engine().commit", "engine().new_game",
                  "save_partie", "render_overlay_from_file"):
        motif = re.compile(r"offload\(\s*[\w.()]*" + re.escape(appel))
        assert motif.search(src), f"{appel} doit passer par offload()."


# --- non-régression : deux tablettes en même temps -------------------------- #
def test_deux_tablettes_ne_peuvent_pas_analyser_deux_plateaux_a_la_fois(tmp_path):
    """Si deux arbitres appuient ensemble, on n'analyse jamais 2 plateaux.

    Le second reçoit une erreur claire ; sans cette garde, deux plateaux
    seraient consommés dans le flux pour un seul lancé réel.
    """
    import threading
    from clayscore.engine import MatchEngine

    eng = MatchEngine(clips_dir=str(tmp_path / "clips"),
                      state_path=str(tmp_path / "s.json"))
    eng.new_game("fosse_universelle", ["A"], serie=5)

    res = {"ok": 0, "refus": 0}
    lock = threading.Lock()

    def tirer():
        try:
            eng.throw()
            with lock:
                res["ok"] += 1
        except RuntimeError:
            with lock:
                res["refus"] += 1

    ths = [threading.Thread(target=tirer) for _ in range(4)]
    for t in ths:
        t.start()
    for t in ths:
        t.join()

    assert res["ok"] == 1, "Un seul plateau doit être analysé."
    assert res["refus"] == 3


def test_l_etat_reste_lisible_pendant_l_analyse(tmp_path):
    """Le verrou ne doit PAS être gardé pendant l'analyse (~1 s).

    Mesuré avant correction : /state passait de 41 ms à 530 ms pendant un
    plateau — l'écran TV et la 2e tablette se figeaient.
    """
    import threading
    import time
    from clayscore.engine import MatchEngine

    eng = MatchEngine(clips_dir=str(tmp_path / "clips"),
                      state_path=str(tmp_path / "s.json"))
    eng.new_game("fosse_universelle", ["A"], serie=5)

    t = threading.Thread(target=eng.throw)
    t.start()
    time.sleep(0.05)                      # analyse en cours
    t0 = time.perf_counter()
    eng.state()                           # doit répondre tout de suite
    dt = time.perf_counter() - t0
    t.join()
    assert dt < 0.25, f"state() bloqué {dt*1000:.0f} ms pendant l'analyse."
