"""Suivi de trajectoire par filtre de Kalman (jalon 3, réutilisé jalon 6).

Modèle « accélération constante » (le plateau subit la gravité) : l'état est
[x, y, vx, vy, ax, ay], la mesure est [x, y]. Le filtre lisse la trajectoire,
prédit la position pendant une occultation courte, et signale la perte de piste
quand la cible disparaît (ce qui distingue « sorti du cadre » de « pulvérisé »).
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Tuple

import cv2
import numpy as np


@dataclass
class TrackPoint:
    frame_index: int
    x: float
    y: float
    measured: bool  # True = mesure réelle, False = position prédite (occultation)


class KalmanClayTracker:
    """Piste un plateau ; tolère de courts trous ; détecte la perte de piste."""

    def __init__(self, fps: float, max_misses: int = 6):
        self.fps = float(fps)
        self.dt = 1.0 / float(fps)
        self.max_misses = int(max_misses)
        self.kf = cv2.KalmanFilter(6, 2)
        dt = self.dt
        # Transition accélération constante.
        self.kf.transitionMatrix = np.array(
            [
                [1, 0, dt, 0, 0.5 * dt * dt, 0],
                [0, 1, 0, dt, 0, 0.5 * dt * dt],
                [0, 0, 1, 0, dt, 0],
                [0, 0, 0, 1, 0, dt],
                [0, 0, 0, 0, 1, 0],
                [0, 0, 0, 0, 0, 1],
            ],
            dtype=np.float32,
        )
        self.kf.measurementMatrix = np.array(
            [[1, 0, 0, 0, 0, 0], [0, 1, 0, 0, 0, 0]], dtype=np.float32
        )
        # Bruit de process modéré (position stable, vitesse/accélération plus
        # libres) + forte incertitude initiale => la vitesse converge vite et
        # l'extrapolation pendant une occultation reste fidèle à la trajectoire.
        self.kf.processNoiseCov = np.diag(
            [1, 1, 10, 10, 20, 20]).astype(np.float32)
        self.kf.measurementNoiseCov = np.eye(2, dtype=np.float32) * 1.0
        self.kf.errorCovPost = np.eye(6, dtype=np.float32) * 1000.0

        self.started = False
        self.misses = 0
        self.n_measured = 0
        self.points: List[TrackPoint] = []
        self.last_measured: Optional[Tuple[float, float]] = None

    @property
    def active(self) -> bool:
        return self.started and self.misses <= self.max_misses

    def update(self, frame_index: int,
               meas: Optional[Tuple[float, float]]) -> Optional[Tuple[float, float]]:
        """Fait avancer le filtre d'une trame. `meas` = (x, y) ou None."""
        if not self.started:
            if meas is None:
                return None
            # Initialise l'état sur la première mesure.
            self.kf.statePost = np.array(
                [[meas[0]], [meas[1]], [0], [0], [0], [0]], dtype=np.float32
            )
            self.started = True

        pred = self.kf.predict()
        px, py = float(pred[0, 0]), float(pred[1, 0])

        if meas is not None:
            self.kf.correct(np.array([[meas[0]], [meas[1]]], dtype=np.float32))
            self.misses = 0
            self.n_measured += 1
            self.last_measured = (float(meas[0]), float(meas[1]))
            self.points.append(TrackPoint(frame_index, meas[0], meas[1], True))
            return meas
        else:
            self.misses += 1
            if self.active:
                self.points.append(TrackPoint(frame_index, px, py, False))
            return (px, py)


def exited_frame(pos: Optional[Tuple[float, float]], w: int, h: int,
                 margin_frac: float = 0.08) -> bool:
    """Vrai si `pos` est près d'un bord (le plateau est sorti du cadre)."""
    if pos is None:
        return False
    mx, my = margin_frac * w, margin_frac * h
    x, y = pos
    return x <= mx or x >= w - mx or y <= my or y >= h - my
