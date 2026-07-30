"""Détection des coups de feu (jalon 2).

Un coup de feu = impulsion sonore : attaque très brutale (montée d'énergie
soudaine) suivie d'une décroissance rapide. On le détecte par une enveloppe
d'énergie court-terme (RMS par fenêtre) et un SEUIL ADAPTATIF basé sur la
médiane + écart absolu médian (MAD) du signal — robuste au niveau d'ambiance
(pas de seuil « en dur » qui casse dès que le fond change).

Deux points de contrainte métier :
  - Faux positifs < 1 % : l'ambiance seule ne doit JAMAIS déclencher.
  - Deux coups rapprochés (< double_window_s) = doublé / 2e cartouche.

API :
  - detect_gunshots(samples, sr, ...)          -> List[GunshotEvent]  (batch)
  - classify_shot_pattern(events, window)      -> "aucun"|"simple"|"double"
  - GunshotDetector (streaming, consomme des AudioChunk)               (temps réel)
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

import numpy as np

from ..sources.base import AudioChunk


@dataclass
class GunshotEvent:
    time_s: float       # instant du pic (secondes)
    sample_index: int   # indice d'échantillon du pic
    peak: float         # énergie (RMS) au pic
    snr: float          # rapport pic / bruit de fond


@dataclass
class GunshotConfig:
    window_s: float = 0.004        # fenêtre RMS (~4 ms)
    min_gap_s: float = 0.15        # écart mini entre 2 pics distincts
    mad_k: float = 12.0            # seuil = médiane + k*MAD
    abs_floor: float = 0.03        # énergie mini absolue pour être un tir
    min_snr: float = 6.0           # rapport pic/bruit mini


def _rms_envelope(samples: np.ndarray, sr: int, window_s: float):
    """Enveloppe d'énergie (RMS) par fenêtres non chevauchantes."""
    hop = max(1, int(round(window_s * sr)))
    n = len(samples)
    n_win = n // hop
    if n_win == 0:
        return np.zeros(0, dtype=np.float32), hop
    trimmed = samples[: n_win * hop].astype(np.float32).reshape(n_win, hop)
    env = np.sqrt(np.mean(trimmed * trimmed, axis=1) + 1e-12)
    return env.astype(np.float32), hop


def detect_gunshots(
    samples: np.ndarray,
    sr: int,
    config: Optional[GunshotConfig] = None,
) -> List[GunshotEvent]:
    """Détecte les coups de feu dans un signal mono float32 [-1, 1]."""
    cfg = config or GunshotConfig()
    env, hop = _rms_envelope(np.asarray(samples), sr, cfg.window_s)
    if env.size == 0:
        return []

    # Bruit de fond robuste : médiane + écart absolu médian (MAD).
    med = float(np.median(env))
    mad = float(np.median(np.abs(env - med))) + 1e-9
    thr = max(med + cfg.mad_k * mad, cfg.abs_floor)
    noise = max(med, 1e-6)

    # Fenêtres au-dessus du seuil.
    above = env > thr
    events: List[GunshotEvent] = []
    min_gap_win = max(1, int(round(cfg.min_gap_s / cfg.window_s)))

    i = 0
    n = len(env)
    last_peak_win = -(10 ** 9)
    while i < n:
        if not above[i]:
            i += 1
            continue
        # Étend le segment contigu au-dessus du seuil = une salve.
        j = i
        while j < n and above[j]:
            j += 1
        seg = env[i:j]
        k = int(np.argmax(seg))
        peak_win = i + k
        peak = float(seg[k])
        snr = peak / noise
        # Anti double-comptage : respecte l'écart mini entre 2 pics.
        if peak_win - last_peak_win >= min_gap_win and snr >= cfg.min_snr:
            events.append(
                GunshotEvent(
                    time_s=peak_win * hop / float(sr),
                    sample_index=peak_win * hop,
                    peak=peak,
                    snr=float(snr),
                )
            )
            last_peak_win = peak_win
        i = j
    return events


def classify_shot_pattern(
    events: List[GunshotEvent],
    double_window_s: float = 1.5,
) -> str:
    """Classe une salve de tirs : aucun / simple / double (doublé ou 2e cartouche)."""
    if not events:
        return "aucun"
    if len(events) == 1:
        return "simple"
    # Deux tirs rapprochés = double.
    first, second = events[0], events[1]
    if (second.time_s - first.time_s) <= double_window_s:
        return "double"
    return "simple"


class GunshotDetector:
    """Détecteur streaming : consomme des AudioChunk et émet des coups de feu.

    Utile pour le pipeline temps réel (jalon 5). Accumule un tampon glissant et
    relance la détection batch à chaque bloc, en dédupliquant par écart mini.
    """

    def __init__(self, sr: int, config: Optional[GunshotConfig] = None):
        self.sr = sr
        self.cfg = config or GunshotConfig()
        self._buffer = np.zeros(0, dtype=np.float32)
        self._offset = 0                 # échantillons déjà « écoulés » du tampon
        self._emitted_until = -1.0       # dernier temps émis
        self.events: List[GunshotEvent] = []
        # On garde ~3 s de contexte pour estimer le bruit de fond.
        self._keep = int(3.0 * sr)

    def push(self, chunk: AudioChunk) -> List[GunshotEvent]:
        new = np.asarray(chunk.samples, dtype=np.float32)
        self._buffer = np.concatenate([self._buffer, new])
        fresh = detect_gunshots(self._buffer, self.sr, self.cfg)
        out: List[GunshotEvent] = []
        for ev in fresh:
            abs_t = self._offset / self.sr + ev.time_s
            if abs_t > self._emitted_until + self.cfg.min_gap_s:
                abs_ev = GunshotEvent(
                    time_s=abs_t,
                    sample_index=self._offset + ev.sample_index,
                    peak=ev.peak,
                    snr=ev.snr,
                )
                out.append(abs_ev)
                self.events.append(abs_ev)
                self._emitted_until = abs_t
        # Fenêtre glissante : borne la mémoire.
        if len(self._buffer) > self._keep:
            drop = len(self._buffer) - self._keep
            self._buffer = self._buffer[drop:]
            self._offset += drop
        return out
