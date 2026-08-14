"""Tests du jalon 1 : détection/comptage des lancements (précision ≥ 99 %)."""
from __future__ import annotations

import cv2
import numpy as np

from clayscore.sources.video_file import FileVideoSource
from clayscore.vision.detector import (
    DetectorConfig,
    MotionDetector,
    count_launches,
)
from tools import bench, synth


def _make_clip(tmp_path, scenario, background="ciel", seed=1,
               w=240, h=180, dur=2.0):
    p = synth.SynthParams(scenario=scenario, background=background,
                          width=w, height=h, duration_s=dur, seed=seed)
    return synth.generate(p, str(tmp_path / f"{scenario}_{seed}"))


def test_one_launch_per_scenario(tmp_path):
    # Chaque clip synthétique contient exactement UN plateau lancé.
    for scen in synth.SCENARIOS:
        paths = _make_clip(tmp_path, scen, seed=3)
        evs = count_launches(FileVideoSource(paths["video"]))
        assert len(evs) == 1, f"{scen}: {len(evs)} lancements détectés"


def test_launch_frame_near_truth(tmp_path):
    import json
    paths = _make_clip(tmp_path, "manque", seed=4)
    ann = json.load(open(paths["annotation"], encoding="utf-8"))
    evs = count_launches(FileVideoSource(paths["video"]))
    assert len(evs) == 1
    lag = evs[0].frame_index - ann["events"]["launch_frame"]
    # Détection dans les quelques trames suivant le lancement réel.
    assert 0 <= lag <= 6, f"décalage de détection = {lag} trames"


def test_no_launch_on_static_background(tmp_path):
    # Garde anti faux-positif : un fond statique ne doit produire AUCUN lancement.
    import numpy as np

    params = synth.SynthParams(width=240, height=180, seed=1)
    bg = synth._make_background(params, np.random.default_rng(1))
    # Léger bruit capteur par trame (comme dans les vrais clips), fond immobile.
    rng = np.random.default_rng(2)
    frames = []
    for _ in range(40):
        noise = rng.normal(0, 3.0, bg.shape).astype(np.float32)
        frames.append(np.clip(bg.astype(np.float32) + noise, 0, 255).astype(np.uint8))
    path = str(tmp_path / "empty.mp4")
    synth.write_video(path, frames, params.fps)
    evs = count_launches(FileVideoSource(path))
    assert len(evs) == 0, f"{len(evs)} faux lancements sur fond statique"


def test_detector_warmup_emits_nothing(tmp_path):
    paths = _make_clip(tmp_path, "casse", seed=6)
    det = MotionDetector(DetectorConfig(warmup_frames=6))
    with FileVideoSource(paths["video"]) as src:
        for i, frame in enumerate(src):
            dets = det.process(frame)
            if i < 6:
                assert dets == [], "le détecteur ne doit rien émettre en warmup"
            else:
                break


def test_launch_accuracy_bench():
    # Banc chiffré : précision du comptage sur une grille de clips synthétiques.
    result = bench.bench_launches(seeds=(200, 201, 202))
    assert result.accuracy >= 0.99, result.summary() + " | " + \
        "; ".join(result.failures)


# --- caméra COULEUR obligatoire (mesuré : mono = 9/27 au lieu de 27/27) --- #
def test_image_monochrome_est_bloquante():
    from clayscore.vision.detector import qualite_image
    # Image grise réaliste (bruit + dégradé), répliquée en 3 canaux : c'est
    # exactement ce que renvoie une caméra monochrome.
    rng = np.random.default_rng(7)
    gris = np.clip(np.linspace(60, 190, 320).astype(np.uint8)[None, :]
                   .repeat(240, 0).astype(np.int16)
                   + rng.integers(-4, 5, (240, 320)), 0, 255).astype(np.uint8)
    mono = cv2.cvtColor(gris, cv2.COLOR_GRAY2BGR)

    q = qualite_image(mono)
    assert q["couleur_ok"] is False
    assert q["saturation"] == 0.0
    bloquants = [p for p in q["problemes"] if p["niveau"] == "bloquant"]
    assert bloquants, "une caméra monochrome doit BLOQUER, pas passer en silence"
    assert "couleur" in bloquants[0]["quoi"].lower()
    assert "COULEUR" in bloquants[0]["solution"]


def test_image_couleur_passe_le_controle_couleur():
    from clayscore.vision.detector import qualite_image
    img = np.zeros((240, 320, 3), np.uint8)
    img[:] = (40, 110, 200)                      # BGR : un orange franc
    q = qualite_image(img)
    assert q["couleur_ok"] is True
    assert q["saturation"] > 5.0
    assert not [p for p in q["problemes"]
                if p["niveau"] == "bloquant" and "couleur" in p["quoi"].lower()]


def test_scene_terne_mais_en_couleur_n_est_pas_prise_pour_du_monochrome():
    # Garde-fou anti faux positif : une journée grise reste de la couleur.
    # Mesuré : le pire cas couleur du banc (contre-jour) sature à ~18,9,
    # le seuil est à 5 — il reste de la marge.
    from clayscore.vision.detector import qualite_image
    img = np.zeros((240, 320, 3), np.uint8)
    img[:] = (120, 128, 134)                     # gris légèrement chaud
    assert qualite_image(img)["couleur_ok"] is True
