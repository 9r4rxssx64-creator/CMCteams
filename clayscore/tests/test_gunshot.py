"""Tests du jalon 2 : détection des coups de feu (faux positifs < 1 %)."""
from __future__ import annotations

import json

import numpy as np

from clayscore.audio.gunshot import (
    GunshotDetector,
    classify_shot_pattern,
    detect_gunshots,
)
from clayscore.sources.audio_file import FileAudioSource, read_wav_mono
from tools import bench, synth


def _clip(tmp_path, scenario, seed=1):
    p = synth.SynthParams(scenario=scenario, width=160, height=120,
                          duration_s=2.0, seed=seed)
    return synth.generate(p, str(tmp_path / f"{scenario}_{seed}"))


def test_gunshot_present_for_casse_and_manque(tmp_path):
    for scen in ("casse", "manque"):
        paths = _clip(tmp_path, scen, seed=2)
        data, sr = read_wav_mono(paths["audio"])
        shots = detect_gunshots(data, sr)
        assert len(shots) == 1, f"{scen}: {len(shots)} coups détectés"


def test_no_gunshot_for_nobird(tmp_path):
    # NO BIRD = aucun coup de feu (faux positif interdit).
    paths = _clip(tmp_path, "nobird", seed=2)
    data, sr = read_wav_mono(paths["audio"])
    assert detect_gunshots(data, sr) == []


def test_gunshot_timing_near_truth(tmp_path):
    paths = _clip(tmp_path, "casse", seed=3)
    ann = json.load(open(paths["annotation"], encoding="utf-8"))
    data, sr = read_wav_mono(paths["audio"])
    shots = detect_gunshots(data, sr)
    assert len(shots) == 1
    gt = ann["events"]["gunshot_frame"] / ann["meta"]["fps"]
    assert abs(shots[0].time_s - gt) < 0.10  # < 100 ms


def test_no_false_positive_on_pure_ambience():
    # Bruit d'ambiance seul (aucun tir) -> zéro détection.
    rng = np.random.default_rng(0)
    sr = 22050
    ambience = rng.normal(0, 0.01, sr * 2).astype(np.float32)
    assert detect_gunshots(ambience, sr) == []


def test_streaming_matches_batch(tmp_path):
    paths = _clip(tmp_path, "casse", seed=4)
    data, sr = read_wav_mono(paths["audio"])
    batch = detect_gunshots(data, sr)
    det = GunshotDetector(sr)
    with FileAudioSource(paths["audio"], chunk_size=512) as src:
        for chunk in src:
            det.push(chunk)
    assert len(det.events) == len(batch) == 1
    # Instant cohérent (à une fenêtre près).
    assert abs(det.events[0].time_s - batch[0].time_s) < 0.05


def test_classify_shot_pattern():
    sr = 22050

    def burst(sig, t):
        s = int(t * sr)
        idx = np.arange(int(0.25 * sr))
        env = np.exp(-idx / (0.045 * sr))
        sig[s:s + len(idx)] += (0.9 * env).astype(np.float32)

    # Aucun
    assert classify_shot_pattern([]) == "aucun"
    # Simple
    a = np.random.default_rng(1).normal(0, 0.005, sr * 2).astype(np.float32)
    burst(a, 0.5)
    assert classify_shot_pattern(detect_gunshots(a, sr)) == "simple"
    # Double (2 coups à 0.4 s d'écart < 1.5 s)
    b = np.random.default_rng(2).normal(0, 0.005, sr * 2).astype(np.float32)
    burst(b, 0.5)
    burst(b, 0.9)
    evs = detect_gunshots(b, sr)
    assert len(evs) == 2
    assert classify_shot_pattern(evs) == "double"


def test_gunshot_accuracy_bench():
    result = bench.bench_gunshots(seeds=(300, 301, 302))
    # Précision globale => faux positifs bien < 1 %.
    assert result.accuracy >= 0.99, result.summary() + " | " + \
        "; ".join(result.failures)
