"""Source vidéo en mémoire (liste d'images) — utilitaire runtime.

Sert à ré-analyser une fenêtre de trames déjà capturées (segmentation d'un
plateau à partir d'un flux continu, jalon 7) avec la même interface VideoSource
que le reste du code.
"""
from __future__ import annotations

from typing import List, Optional

import numpy as np

from .base import Frame, VideoSource


class InMemoryVideoSource(VideoSource):
    """Rejoue une liste d'images BGR (ré-indexées à partir de 0)."""

    def __init__(self, images: List[np.ndarray], fps: float):
        self._images = images
        self._fps = float(fps)
        self._i = 0

    def open(self) -> "InMemoryVideoSource":
        self._i = 0
        return self

    @property
    def fps(self) -> float:
        return self._fps

    @property
    def width(self) -> int:
        return int(self._images[0].shape[1]) if self._images else 0

    @property
    def height(self) -> int:
        return int(self._images[0].shape[0]) if self._images else 0

    def read(self) -> Optional[Frame]:
        if self._i >= len(self._images):
            return None
        frame = Frame(index=self._i, timestamp=self._i / self._fps,
                      image=self._images[self._i])
        self._i += 1
        return frame

    def close(self) -> None:
        self._i = 0
