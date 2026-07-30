"""Source audio pour micro USB réel via `sounddevice` (matériel réel).

⚠️ En simulation, `sounddevice` (et PortAudio) peuvent être absents. Ce module
se charge sans erreur ; `open()` lève une RuntimeError explicite si la lib
manque. Passage au matériel = config `source.audio.type: mic`.

Installation matériel :
    sudo apt install libportaudio2
    pip install sounddevice
"""
from __future__ import annotations

import queue
from typing import Optional

import numpy as np

from .base import AudioChunk, AudioSource


class MicAudioSource(AudioSource):
    """Capture live depuis un micro (index de périphérique)."""

    def __init__(
        self,
        device: Optional[int] = None,
        sample_rate: int = 44100,
        chunk_size: int = 1024,
    ):
        self.device = device
        self._sr = int(sample_rate)
        self._chunk_size = int(chunk_size)
        self._stream = None
        self._queue: "queue.Queue[np.ndarray]" = queue.Queue()
        self._index = 0
        self._start_sample = 0

    def open(self) -> "MicAudioSource":  # pragma: no cover - matériel réel
        try:
            import sounddevice as sd
        except Exception as exc:  # noqa: BLE001
            raise RuntimeError(
                "sounddevice (PortAudio) est indisponible.\n"
                "En simulation, utilisez `source.audio.type: file`.\n"
                "Sur le matériel : sudo apt install libportaudio2 && "
                "pip install sounddevice"
            ) from exc

        def _callback(indata, frames, time_info, status):  # noqa: ANN001
            self._queue.put(indata[:, 0].copy())

        self._stream = sd.InputStream(
            device=self.device,
            channels=1,
            samplerate=self._sr,
            blocksize=self._chunk_size,
            dtype="float32",
            callback=_callback,
        )
        self._stream.start()
        self._index = 0
        self._start_sample = 0
        return self

    @property
    def sample_rate(self) -> int:
        return self._sr

    @property
    def chunk_size(self) -> int:
        return self._chunk_size

    def read(self) -> Optional[AudioChunk]:  # pragma: no cover - matériel réel
        if self._stream is None:
            raise RuntimeError("Source non ouverte — appelez open() d'abord.")
        samples = self._queue.get()
        chunk = AudioChunk(
            index=self._index,
            start_time=self._start_sample / float(self._sr),
            samples=samples.astype(np.float32),
            sample_rate=self._sr,
        )
        self._index += 1
        self._start_sample += len(samples)
        return chunk

    def close(self) -> None:  # pragma: no cover - matériel réel
        if self._stream is not None:
            self._stream.stop()
            self._stream.close()
            self._stream = None
