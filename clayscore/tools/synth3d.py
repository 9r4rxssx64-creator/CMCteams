"""Générateur multi-vues synthétique (jalon 6).

Crée une trajectoire balistique 3D (monde, en mètres) et la projette dans un
banc stéréo de caméras -> pistes 2D par caméra + vérité terrain 3D. Sert à
mesurer objectivement la triangulation, la fusion multi-caméras et la
calibration des corridors (aucun matériel requis).
"""
from __future__ import annotations

from typing import Dict, List, Optional, Tuple

import numpy as np

from clayscore.vision.multicam import Camera, Detection2D

G = 9.81  # gravité (m/s^2)


def default_rig(width: int = 1440, height: int = 1080,
                focal: float = 1400.0, baseline: float = 0.35,
                n_cams: int = 2) -> List[Camera]:
    """Banc de caméras alignées horizontalement (base = `baseline` m)."""
    cx, cy = width / 2.0, height / 2.0
    xs = np.linspace(-baseline / 2, baseline / 2, n_cams)
    return [Camera(f"cam{i}", x=float(xs[i]), focal=focal, cx=cx, cy=cy,
                   width=width, height=height) for i in range(n_cams)]


def ballistic_3d(seed: int = 0, fps: float = 50.0, duration: float = 1.6,
                 anomalous: bool = False) -> np.ndarray:
    """Trajectoire monde (N,3). `anomalous` = vol de travers (indice no-bird)."""
    rng = np.random.default_rng(seed)
    X0, Y0, Z0 = 0.0, 1.5, 8.0
    vX = rng.uniform(-0.5, 0.5)
    vY = rng.uniform(8.5, 9.5)
    vZ = rng.uniform(9.5, 10.5)
    n = int(round(fps * duration))
    t = np.arange(n) / fps
    X = X0 + vX * t
    Y = Y0 + vY * t - 0.5 * G * t * t
    Z = Z0 + vZ * t
    if anomalous:
        # Départ de travers + oscillation latérale (plateau parti cassé).
        X = X + 3.0 * np.sin(6.0 * t) + 2.5 * t
        Y = Y - 1.5 * t
    return np.stack([X, Y, Z], axis=1)


def project_track(cameras: List[Camera], world: np.ndarray,
                  noise_px: float = 0.0, seed: int = 0,
                  drop: Optional[Dict[str, Tuple[int, int]]] = None
                  ) -> Dict[str, Dict[int, Detection2D]]:
    """Projette une trajectoire 3D dans chaque caméra -> pistes 2D {frame: det}.

    `noise_px` : bruit gaussien pixel. `drop` : {cam_id: (f0, f1)} occultation.
    """
    rng = np.random.default_rng(seed + 999)
    out: Dict[str, Dict[int, Detection2D]] = {c.cam_id: {} for c in cameras}
    for cam in cameras:
        gap = drop.get(cam.cam_id) if drop else None
        for f in range(len(world)):
            if gap and gap[0] <= f < gap[1]:
                continue  # occultation dans cette caméra
            X, Y, Z = world[f]
            uv = cam.project(float(X), float(Y), float(Z))
            if uv is None:
                continue
            u, v = uv
            if noise_px > 0:
                u += rng.normal(0, noise_px)
                v += rng.normal(0, noise_px)
            if 0 <= u < cam.width and 0 <= v < cam.height:
                out[cam.cam_id][f] = Detection2D(u=float(u), v=float(v))
    return out


def generate_multiview(seed: int = 0, n_cams: int = 2, noise_px: float = 0.0,
                       drop: Optional[Dict[str, Tuple[int, int]]] = None,
                       anomalous: bool = False):
    """Retourne (cameras, world_truth (N,3), tracks_2d)."""
    cams = default_rig(n_cams=n_cams)
    world = ballistic_3d(seed=seed, anomalous=anomalous)
    tracks = project_track(cams, world, noise_px=noise_px, seed=seed, drop=drop)
    return cams, world, tracks
