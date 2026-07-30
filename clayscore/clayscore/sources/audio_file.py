"""Source audio lisant un fichier .wav via la bibliothèque standard `wave`.

Aucune dépendance externe (pas de scipy) : conversion PCM -> float32 mono
faite à la main. Sert en simulation à rejouer un son enregistré/synthétique
comme le ferait le micro USB réel.
"""
from __future__ import annotations

import wave
from typing import Optional

import numpy as np

from .base import AudioChunk, AudioSource


def read_wav_mono(path: str) -> tuple[np.ndarray, int]:
    """Lit un .wav et renvoie (samples float32 mono dans [-1,1], sample_rate)."""
    with wave.open(str(path), "rb") as wf:
        n_channels = wf.getnchannels()
        sampwidth = wf.getsampwidth()
        sample_rate = wf.getframerate()
        n_frames = wf.getnframes()
        raw = wf.readframes(n_frames)

    if sampwidth == 1:
        # PCM 8 bits non signé (0..255) centré sur 128.
        data = np.frombuffer(raw, dtype=np.uint8).astype(np.float32)
        data = (data - 128.0) / 128.0
    elif sampwidth == 2:
        data = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    elif sampwidth == 4:
        data = np.frombuffer(raw, dtype=np.int32).astype(np.float32) / 2147483648.0
    else:
        raise ValueError(f"Largeur d'échantillon non gérée : {sampwidth} octets")

    if n_channels > 1:
        # Repli en mono par moyenne des canaux.
        data = data.reshape(-1, n_channels).mean(axis=1)
    return data.astype(np.float32), int(sample_rate)


class FileAudioSource(AudioSource):
    """Rejoue un fichier .wav par blocs d'échantillons."""

    def __init__(self, path: str, chunk_size: int = 1024):
        self.path = str(path)
        self._chunk_size = int(chunk_size)
        self._data: Optional[np.ndarray] = None
        self._sr = 0
        self._pos = 0
        self._index = 0

    def open(self) -> "FileAudioSource":
        self._data, self._sr = read_wav_mono(self.path)
        self._pos = 0
        self._index = 0
        return self

    @property
    def sample_rate(self) -> int:
        return self._sr

    @property
    def chunk_size(self) -> int:
        return self._chunk_size

    def read(self) -> Optional[AudioChunk]:
        if self._data is None:
            raise RuntimeError("Source non ouverte — appelez open() d'abord.")
        if self._pos >= len(self._data):
            return None
        end = min(self._pos + self._chunk_size, len(self._data))
        samples = self._data[self._pos:end]
        chunk = AudioChunk(
            index=self._index,
            start_time=self._pos / float(self._sr),
            samples=samples.copy(),
            sample_rate=self._sr,
        )
        self._pos = end
        self._index += 1
        return chunk

    def close(self) -> None:
        self._data = None
