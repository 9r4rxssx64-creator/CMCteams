"""Fusion multi-caméras + association 3D grossière (jalon 6).

Cible matériel : 3 caméras GigE (2 mono + 1 couleur). En géométrie stéréo
horizontale (caméras alignées sur X), la profondeur se déduit de la disparité :

    Z = f * b / (u_gauche - u_droite)        (b = base, f = focale en pixels)

Ce module fournit :
  - Camera (sténopé simplifié, sans rotation) : projection monde -> pixels.
  - triangulate_stereo : (u,v) sur 2 caméras -> point 3D grossier.
  - associate : apparie les détections d'une même trame entre 2 caméras
    (stéréo horizontale => les correspondants ont un v proche).
  - MultiCameraFusion : combine les pistes 2D en une piste 3D, comble les trous
    (occultation dans une caméra) par extrapolation, et mesure la redondance.

« Grossier » assumé : pas de rectification ni de distorsion ; suffisant pour le
suivi de trajectoire et l'écart au corridor (cf. calibration).
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Sequence, Tuple

import numpy as np


@dataclass(frozen=True)
class Camera:
    cam_id: str
    x: float          # position horizontale (mètres) — base stéréo sur X
    focal: float      # focale en pixels
    cx: float         # point principal u
    cy: float         # point principal v
    width: int
    height: int
    y: float = 0.0    # hauteur caméra (m)
    z: float = 0.0    # recul caméra (m)

    def project(self, X: float, Y: float, Z: float) -> Optional[Tuple[float, float]]:
        """Projette un point monde (X,Y,Z) en pixels (u,v), ou None si derrière."""
        depth = Z - self.z
        if depth <= 1e-6:
            return None
        u = self.cx + self.focal * (X - self.x) / depth
        v = self.cy - self.focal * (Y - self.y) / depth
        return (u, v)


def triangulate_stereo(cam_l: Camera, cam_r: Camera,
                       u_l: float, u_r: float, v: float
                       ) -> Optional[Tuple[float, float, float]]:
    """Point 3D à partir de (u_l), (u_r) et v (caméra gauche), stéréo horizontal.

    `cam_l` doit être à gauche de `cam_r` (cam_l.x < cam_r.x).
    """
    baseline = cam_r.x - cam_l.x
    disparity = u_l - u_r
    if abs(disparity) < 1e-6 or baseline <= 0:
        return None
    Z = cam_l.focal * baseline / disparity + cam_l.z
    depth = Z - cam_l.z
    X = cam_l.x + (u_l - cam_l.cx) * depth / cam_l.focal
    Y = cam_l.y - (v - cam_l.cy) * depth / cam_l.focal
    return (float(X), float(Y), float(Z))


@dataclass
class Detection2D:
    u: float
    v: float


def associate(dets_l: Sequence[Detection2D], dets_r: Sequence[Detection2D],
              v_tol: float = 12.0) -> List[Tuple[int, int]]:
    """Apparie les détections gauche/droite (stéréo horizontal : v proche).

    Retourne la liste des paires d'indices (i_gauche, j_droite), gloutonne par
    plus petit écart vertical, disparité positive uniquement.
    """
    pairs: List[Tuple[int, int]] = []
    used_r = set()
    candidates = []
    for i, dl in enumerate(dets_l):
        for j, dr in enumerate(dets_r):
            dv = abs(dl.v - dr.v)
            disparity = dl.u - dr.u
            if dv <= v_tol and disparity > 0:
                candidates.append((dv, i, j))
    candidates.sort()
    used_l = set()
    for dv, i, j in candidates:
        if i in used_l or j in used_r:
            continue
        pairs.append((i, j))
        used_l.add(i)
        used_r.add(j)
    return pairs


@dataclass
class Point3D:
    frame_index: int
    X: float
    Y: float
    Z: float
    n_cams: int          # nb de caméras ayant contribué
    method: str          # "stereo" | "filled" (comblé par extrapolation)


@dataclass
class Track3D:
    points: List[Point3D] = field(default_factory=list)

    @property
    def n_stereo(self) -> int:
        return sum(1 for p in self.points if p.method == "stereo")

    def as_array(self) -> np.ndarray:
        return np.array([[p.X, p.Y, p.Z] for p in self.points], dtype=float)


class MultiCameraFusion:
    """Fusionne des pistes 2D (par caméra) en une piste 3D robuste.

    `cameras` : liste ordonnée gauche->droite ; les deux premières servent de
    paire stéréo principale, les suivantes ajoutent de la redondance (moyenne).
    Les pistes 2D sont des dict {frame_index: Detection2D} par caméra.
    """

    def __init__(self, cameras: List[Camera]):
        if len(cameras) < 2:
            raise ValueError("La fusion nécessite au moins 2 caméras.")
        self.cameras = sorted(cameras, key=lambda c: c.x)

    def fuse(self, tracks_2d: Dict[str, Dict[int, Detection2D]]) -> Track3D:
        cam_l, cam_r = self.cameras[0], self.cameras[1]
        tl = tracks_2d.get(cam_l.cam_id, {})
        tr = tracks_2d.get(cam_r.cam_id, {})
        frames = sorted(set(tl) | set(tr))
        pts: List[Point3D] = []

        for f in frames:
            dl = tl.get(f)
            dr = tr.get(f)
            if dl is not None and dr is not None:
                P = triangulate_stereo(cam_l, cam_r, dl.u, dr.u, dl.v)
                if P is None:
                    continue
                n = 2
                # Redondance : caméras supplémentaires cohérentes (>= appariées).
                for cam in self.cameras[2:]:
                    if f in tracks_2d.get(cam.cam_id, {}):
                        n += 1
                pts.append(Point3D(f, P[0], P[1], P[2], n, "stereo"))

        # Comble les trous d'occultation par interpolation/extrapolation linéaire.
        return self._fill_gaps(Track3D(pts), frames)

    def _fill_gaps(self, track: Track3D, all_frames: List[int]) -> Track3D:
        if len(track.points) < 2:
            return track
        stereo = {p.frame_index: p for p in track.points}
        known_f = sorted(stereo)
        arr = np.array([[stereo[f].X, stereo[f].Y, stereo[f].Z] for f in known_f])
        out: List[Point3D] = list(track.points)
        for f in all_frames:
            if f in stereo:
                continue
            # Interpolation si entouré, extrapolation sinon.
            xi = np.interp(f, known_f, arr[:, 0])
            yi = np.interp(f, known_f, arr[:, 1])
            zi = np.interp(f, known_f, arr[:, 2])
            out.append(Point3D(f, float(xi), float(yi), float(zi), 1, "filled"))
        out.sort(key=lambda p: p.frame_index)
        return Track3D(out)
