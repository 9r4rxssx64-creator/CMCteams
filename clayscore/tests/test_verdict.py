"""Tests du jalon 3 : verdicts cassé/manqué/no-bird + routage des ambigus."""
from __future__ import annotations

import numpy as np

from clayscore.sources.audio_file import read_wav_mono
from clayscore.sources.video_file import FileVideoSource
from clayscore.vision.tracker import KalmanClayTracker, exited_frame
from clayscore.vision.verdict import (
    VerdictConfig,
    VerdictEvidence,
    decide_from_evidence,
    decide_verdict,
)
from tools import bench, synth


def _clip(tmp_path, scenario, bg="ciel", seed=1):
    p = synth.SynthParams(scenario=scenario, background=bg,
                          width=240, height=180, duration_s=2.0, seed=seed)
    return synth.generate(p, str(tmp_path / f"{scenario}_{bg}_{seed}"))


def _verdict_of(paths):
    data, sr = read_wav_mono(paths["audio"])
    return decide_verdict(FileVideoSource(paths["video"]), data, sr)


# --- verdicts de bout en bout ------------------------------------------- #
def test_verdict_casse(tmp_path):
    r = _verdict_of(_clip(tmp_path, "casse", seed=30))
    assert r.verdict == "casse"
    assert r.confidence >= 0.6


def test_verdict_manque(tmp_path):
    r = _verdict_of(_clip(tmp_path, "manque", seed=31))
    assert r.verdict == "manque"
    assert r.confidence >= 0.6


def test_verdict_nobird(tmp_path):
    r = _verdict_of(_clip(tmp_path, "nobird", seed=32))
    assert r.verdict == "nobird"
    assert r.confidence >= 0.6


# --- routage de l'ambiguïté (fonction pure) ----------------------------- #
def _evidence(**kw):
    base = dict(
        fps=30.0, width=240, height=180, launch_frame=9, gunshot_frame=21,
        scatter_frame=None, weak_scatter_frame=None, max_scatter_blobs=0,
        n_clay_frames=10, last_clay_frame=20, last_clay_pos=(120.0, 90.0),
        clay_exited=False, clay_vanished_midair=False, n_frames=60,
    )
    base.update(kw)
    return VerdictEvidence(**base)


def test_ambiguous_routed_to_human():
    # Bris hors fenêtre, sans éclat net -> confiance faible -> AMBIGU.
    ev = _evidence(gunshot_frame=21, scatter_frame=None,
                   clay_vanished_midair=False, clay_exited=False,
                   n_clay_frames=1, n_frames=60, launch_frame=9)
    # Force un cas de confiance faible via le chemin "ni tir clair".
    ev.gunshot_frame = None
    ev.launch_frame = None
    r = decide_from_evidence(ev)
    assert r.verdict == "ambigu"
    assert r.best_guess in ("casse", "manque", "nobird")


def test_high_confidence_not_ambiguous():
    ev = _evidence(scatter_frame=22, max_scatter_blobs=8, gunshot_frame=21,
                   clay_vanished_midair=True)
    r = decide_from_evidence(ev)
    assert r.verdict == "casse"
    assert r.confidence >= 0.6


def test_nobird_before_gunshot_pure():
    ev = _evidence(scatter_frame=10, weak_scatter_frame=10, max_scatter_blobs=6,
                   gunshot_frame=21)
    r = decide_from_evidence(ev)
    assert r.verdict == "nobird"


def test_threshold_controls_routing():
    ev = _evidence(gunshot_frame=21, scatter_frame=None, clay_exited=True,
                   n_clay_frames=5)  # -> manque conf ~0.9
    # Seuil très haut : même un cas net devient "ambigu".
    r = decide_from_evidence(ev, VerdictConfig(confidence_threshold=0.99))
    assert r.verdict == "ambigu"
    assert r.best_guess == "manque"


# --- tracker Kalman ------------------------------------------------------ #
def test_kalman_predicts_during_gap():
    tr = KalmanClayTracker(fps=30.0)
    # Trajectoire rectiligne : x augmente de 10 px/trame (dernière mesure x=70).
    for i in range(8):
        tr.update(i, (10.0 * i, 50.0))
    # Trou (occultation) : prédiction sans mesure -> doit EXTRAPOLER vers l'avant.
    pred = tr.update(8, None)
    assert pred is not None
    assert tr.active
    assert pred[0] > 70.0            # avance au-delà de la dernière mesure
    assert 70.0 < pred[0] < 95.0     # extrapolation cohérente (~80)
    assert abs(pred[1] - 50.0) < 5.0  # y quasi constant


def test_track_lost_after_max_misses():
    tr = KalmanClayTracker(fps=30.0, max_misses=3)
    for i in range(4):
        tr.update(i, (10.0 * i, 50.0))
    for i in range(4, 4 + 5):
        tr.update(i, None)
    assert not tr.active  # piste perdue au-delà de max_misses


def test_exited_frame_helper():
    assert exited_frame((5.0, 90.0), 240, 180) is True     # bord gauche
    assert exited_frame((120.0, 90.0), 240, 180) is False  # centre
    assert exited_frame(None, 240, 180) is False


# --- banc chiffré -------------------------------------------------------- #
def test_verdict_accuracy_bench():
    result = bench.bench_verdicts(seeds=(400, 401, 402, 403))
    assert result.accuracy >= 0.98, result.summary() + " | " + \
        "; ".join(result.failures)
