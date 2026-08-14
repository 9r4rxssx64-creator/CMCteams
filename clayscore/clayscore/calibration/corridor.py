"""Calibration automatique des corridors de vol (jalon 6).

Sur des « plateaux d'essai » (lancements normaux depuis un poste/une machine),
on apprend le corridor de vol attendu : une trajectoire de référence + une
enveloppe de tolérance. Ensuite, tout lancement dont la trajectoire s'écarte
trop du corridor est signalé comme ANORMAL — indice de NO BIRD (plateau parti
cassé/de travers), conformément aux règles ClayScore.

Les trajectoires sont des tableaux (N, 2) ou (N, 3) de points (pixels ou 3D).
La comparaison se fait le long d'une abscisse curviligne normalisée (0..1)
pour être robuste aux durées/vitesses variables.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Sequence

import numpy as np


def _resample(track: np.ndarray, n: int) -> np.ndarray:
    """Ré-échantillonne une trajectoire sur `n` points le long de son parcours."""
    track = np.asarray(track, dtype=float)
    if len(track) == 0:
        return np.zeros((n, track.shape[1] if track.ndim == 2 else 2))
    if len(track) == 1:
        return np.repeat(track, n, axis=0)
    # Abscisse curviligne cumulée.
    deltas = np.linalg.norm(np.diff(track, axis=0), axis=1)
    s = np.concatenate([[0.0], np.cumsum(deltas)])
    if s[-1] <= 1e-9:
        return np.repeat(track[:1], n, axis=0)
    s /= s[-1]
    u = np.linspace(0.0, 1.0, n)
    return np.stack([np.interp(u, s, track[:, d]) for d in range(track.shape[1])],
                    axis=1)


@dataclass
class Corridor:
    reference: np.ndarray   # (n, D) trajectoire de référence (moyenne)
    envelope: np.ndarray    # (n,) écart-type par point (rayon de tolérance)
    n_samples: int          # nb de plateaux d'essai utilisés
    dims: int

    def deviation(self, track: Sequence) -> float:
        """Écart normalisé max d'une trajectoire au corridor (0 = sur l'axe)."""
        rs = _resample(np.asarray(track, dtype=float), len(self.reference))
        dist = np.linalg.norm(rs - self.reference, axis=1)
        tol = np.maximum(self.envelope, 1e-6)
        return float(np.max(dist / tol))

    def is_within(self, track: Sequence, k: float = 3.0) -> bool:
        """Vrai si la trajectoire reste dans k écarts-types du corridor."""
        return self.deviation(track) <= k


class CorridorCalibrator:
    """Apprend un corridor par poste/machine à partir de plateaux d'essai."""

    def __init__(self, resample_n: int = 40, min_envelope_frac: float = 0.02):
        self.resample_n = int(resample_n)
        self.min_envelope_frac = float(min_envelope_frac)

    def calibrate(self, tracks: List[Sequence]) -> Corridor:
        if len(tracks) < 2:
            raise ValueError(
                "Au moins 2 plateaux d'essai sont nécessaires pour calibrer.")
        resampled = np.stack([_resample(np.asarray(t, dtype=float),
                                        self.resample_n) for t in tracks])
        reference = resampled.mean(axis=0)
        # Écart-type par point (norme sur les dimensions).
        dev = np.linalg.norm(resampled - reference, axis=2)  # (S, n)
        # Largeur du couloir = dispersion entre les essais, point par point.
        # (Il y avait ici « + dev.mean(axis=0) * 0.0 » : un terme multiplié par
        # zéro, donc rigoureusement sans effet, qui donnait juste à lire que la
        # moyenne comptait pour quelque chose. Elle ne comptait pas.)
        envelope = dev.std(axis=0)
        # Plancher d'enveloppe pour éviter des tolérances nulles (bruit).
        scale = np.linalg.norm(reference.max(axis=0) - reference.min(axis=0))
        floor = max(float(self.min_envelope_frac * scale), 1e-3)
        envelope = np.maximum(envelope, floor)
        return Corridor(reference=reference, envelope=envelope,
                        n_samples=len(tracks), dims=reference.shape[1])
