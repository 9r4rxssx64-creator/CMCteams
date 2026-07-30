"""Tests du synthétiseur : cohérence physique, événements, verdicts, I/O."""
from __future__ import annotations

import json

import numpy as np
import pytest

from clayscore.sources.audio_file import FileAudioSource, read_wav_mono
from clayscore.sources.video_file import FileVideoSource
from tools import synth


def _params(scenario, background="ciel", seed=1):
    # Petites vidéos rapides pour les tests.
    return synth.SynthParams(
        scenario=scenario,
        background=background,
        width=320,
        height=240,
        fps=30.0,
        duration_s=2.0,
        seed=seed,
    )


# --- simulation (sans rendu) ---------------------------------------------- #
def test_events_casse():
    sc = synth.simulate(_params("casse"))
    ev = sc.events
    assert ev.gunshot_frame is not None
    assert ev.break_frame is not None
    # Le bris survient APRÈS le coup de feu.
    assert ev.break_frame > ev.gunshot_frame
    assert ev.verdict == "casse"


def test_events_manque():
    sc = synth.simulate(_params("manque"))
    ev = sc.events
    assert ev.gunshot_frame is not None   # le tireur a bien fait feu
    assert ev.break_frame is None         # mais rien n'est cassé
    assert ev.verdict == "manque"


def test_events_nobird():
    sc = synth.simulate(_params("nobird"))
    ev = sc.events
    assert ev.gunshot_frame is None       # aucun coup de feu
    assert ev.break_frame == ev.launch_frame  # cassé dès le lancement
    assert ev.verdict == "nobird"


def test_clay_present_before_break_absent_after():
    sc = synth.simulate(_params("casse"))
    lf, bf = sc.events.launch_frame, sc.events.break_frame
    # Le plateau est présent juste après le lancement...
    assert sc.frames[lf + 1].clay is not None
    # ...et absent après le bris (remplacé par des fragments).
    assert sc.frames[bf + 1].clay is None
    assert len(sc.frames[bf + 1].frags) > 0


def test_fragments_appear_only_at_break():
    sc = synth.simulate(_params("casse"))
    bf = sc.events.break_frame
    # Avant le bris : aucun fragment.
    assert all(len(sc.frames[i].frags) == 0 for i in range(bf))
    # Au bris et juste après : des fragments.
    assert len(sc.frames[bf].frags) > 0


def test_determinism_same_seed():
    a = synth.annotation_dict(synth.simulate(_params("casse", seed=7)))
    b = synth.annotation_dict(synth.simulate(_params("casse", seed=7)))
    assert a == b


def test_different_seed_differs():
    a = synth.annotation_dict(synth.simulate(_params("casse", seed=1)))
    b = synth.annotation_dict(synth.simulate(_params("casse", seed=2)))
    # Les fragments (aléatoires) diffèrent d'une graine à l'autre.
    assert a["frames"] != b["frames"]


def test_invalid_scenario_raises():
    with pytest.raises(ValueError):
        synth.SynthParams(scenario="inconnu")


# --- rendu + I/O ---------------------------------------------------------- #
def test_generate_writes_triplet(tmp_path):
    params = _params("casse", seed=3)
    paths = synth.generate(params, str(tmp_path / "clip"))
    for key in ("video", "audio", "annotation"):
        assert paths[key]

    # La vidéo se relit avec le bon nombre de trames et les bonnes dimensions.
    with FileVideoSource(paths["video"]) as v:
        frames = list(v)
        assert v.width == params.width
        assert v.height == params.height
        assert abs(v.fps - params.fps) < 1e-6
    assert len(frames) == params.n_frames

    # L'annotation est cohérente avec la vidéo.
    ann = json.load(open(paths["annotation"], encoding="utf-8"))
    assert ann["meta"]["n_frames"] == params.n_frames
    assert ann["verdict_truth"] == "casse"
    assert len(ann["frames"]) == params.n_frames


def test_audio_gunshot_present_for_casse(tmp_path):
    paths = synth.generate(_params("casse", seed=4), str(tmp_path / "c"))
    data, _sr = read_wav_mono(paths["audio"])
    # Un coup de feu produit un pic net (>> ambiance).
    assert np.max(np.abs(data)) > 0.3


def test_audio_no_gunshot_for_nobird(tmp_path):
    paths = synth.generate(_params("nobird", seed=5), str(tmp_path / "n"))
    data, _sr = read_wav_mono(paths["audio"])
    # NO BIRD : pas de coup de feu -> seulement l'ambiance (faible).
    assert np.max(np.abs(data)) < 0.1


def test_reference_set(tmp_path):
    manifest = synth.make_reference_set(str(tmp_path))
    assert len(manifest) == 3
    for _name, paths in manifest.items():
        assert (tmp_path / "manifest.json").exists()
        with FileVideoSource(paths["video"]) as v:
            assert len(list(v)) > 0
