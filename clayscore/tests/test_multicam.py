"""Tests du jalon 6 : fusion multi-caméras, triangulation, corridors."""
from __future__ import annotations

import numpy as np
import pytest

from clayscore.calibration.corridor import CorridorCalibrator
from clayscore.vision.multicam import (
    Camera,
    Detection2D,
    MultiCameraFusion,
    associate,
    triangulate_stereo,
)
from tools import synth3d


# --- géométrie ----------------------------------------------------------- #
def test_project_triangulate_roundtrip():
    cams = synth3d.default_rig(n_cams=2)
    cam_l, cam_r = cams
    P = (0.5, 4.0, 15.0)
    ul, vl = cam_l.project(*P)
    ur, vr = cam_r.project(*P)
    rec = triangulate_stereo(cam_l, cam_r, ul, ur, vl)
    assert rec is not None
    assert np.allclose(rec, P, atol=1e-3)


def test_fusion_exact_recovers_3d():
    cams, world, tracks = synth3d.generate_multiview(seed=1, noise_px=0.0)
    tr = MultiCameraFusion(cams).fuse(tracks)
    stereo = [p for p in tr.points if p.method == "stereo"]
    assert len(stereo) > 30
    errs = [np.linalg.norm([p.X, p.Y, p.Z] - world[p.frame_index]) for p in stereo]
    assert max(errs) < 1e-3


def test_fusion_with_noise_bounded_depth_error():
    cams, world, tracks = synth3d.generate_multiview(seed=2, noise_px=0.7)
    tr = MultiCameraFusion(cams).fuse(tracks)
    zerr = [abs(p.Z - world[p.frame_index][2])
            for p in tr.points if p.method == "stereo"]
    # 3D « grossier » : erreur de profondeur moyenne raisonnable (< 1 m).
    assert np.mean(zerr) < 1.0


def test_fusion_fills_occlusion_gap():
    cams, world, tracks = synth3d.generate_multiview(
        seed=3, noise_px=0.0, drop={"cam0": (30, 45)})
    tr = MultiCameraFusion(cams).fuse(tracks)
    filled = [p for p in tr.points if p.method == "filled"]
    assert len(filled) >= 10  # le trou est comblé
    ferr = [np.linalg.norm([p.X, p.Y, p.Z] - world[p.frame_index]) for p in filled]
    assert max(ferr) < 1.0  # extrapolation cohérente


def test_three_camera_redundancy():
    cams, world, tracks = synth3d.generate_multiview(seed=4, n_cams=3)
    tr = MultiCameraFusion(cams).fuse(tracks)
    assert max(p.n_cams for p in tr.points if p.method == "stereo") == 3


def test_fusion_requires_two_cameras():
    with pytest.raises(ValueError):
        MultiCameraFusion([synth3d.default_rig(n_cams=1)[0]])


def test_associate_matches_pairs():
    # Deux plateaux à des v proches (stéréo horizontal) : appariement correct.
    left = [Detection2D(u=800, v=300), Detection2D(u=500, v=600)]
    right = [Detection2D(u=470, v=602), Detection2D(u=770, v=298)]
    pairs = associate(left, right)
    # left[0](v300) <-> right[1](v298) ; left[1](v600) <-> right[0](v602)
    assert (0, 1) in pairs and (1, 0) in pairs


def test_associate_rejects_negative_disparity():
    # Disparité négative (objet à droite dans la caméra gauche) -> pas d'appariement.
    left = [Detection2D(u=400, v=300)]
    right = [Detection2D(u=600, v=300)]
    assert associate(left, right) == []


# --- calibration des corridors ------------------------------------------ #
def test_corridor_calibration_normal_vs_anomalous():
    cal = CorridorCalibrator()
    normals = [synth3d.ballistic_3d(seed=s) for s in range(10, 20)]
    corridor = cal.calibrate(normals)

    normal = synth3d.ballistic_3d(seed=99)
    anom = synth3d.ballistic_3d(seed=99, anomalous=True)
    assert corridor.is_within(normal)
    assert not corridor.is_within(anom)
    # L'anomalie s'écarte nettement plus que la normale.
    assert corridor.deviation(anom) > 3.0 * corridor.deviation(normal)


def test_corridor_needs_two_samples():
    with pytest.raises(ValueError):
        CorridorCalibrator().calibrate([synth3d.ballistic_3d(seed=1)])


def test_corridor_works_in_2d():
    # Le corridor fonctionne aussi sur des trajectoires 2D (pixels).
    cal = CorridorCalibrator()
    base = np.stack([np.linspace(0, 100, 30), np.linspace(0, 50, 30)], axis=1)
    samples = [base + np.random.default_rng(s).normal(0, 1.0, base.shape)
               for s in range(6)]
    cor = cal.calibrate(samples)
    assert cor.is_within(base)
    off = base + np.array([40.0, 40.0])  # trajectoire décalée
    assert not cor.is_within(off)
