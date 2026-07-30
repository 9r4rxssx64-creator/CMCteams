"""Source vidéo lisant une webcam USB via OpenCV.

Sert de repli de développement quand aucune caméra GigE n'est disponible.
L'horodatage est basé sur l'horloge murale (flux live, non rejouable).
"""
from __future__ import annotations

import time
from typing import Optional

import cv2

from .base import Frame, VideoSource


class WebcamVideoSource(VideoSource):
    """Capture en direct depuis une webcam (index de périphérique)."""

    def __init__(
        self,
        index: int = 0,
        width: int = 1280,
        height: int = 720,
        fps: float = 30.0,
    ):
        self.index = int(index)
        self._req_width = int(width)
        self._req_height = int(height)
        self._req_fps = float(fps)
        self._cap: Optional[cv2.VideoCapture] = None
        self._start: Optional[float] = None
        self._index = 0

    def open(self) -> "WebcamVideoSource":
        cap = cv2.VideoCapture(self.index)
        if not cap.isOpened():
            raise RuntimeError(
                f"Impossible d'ouvrir la webcam d'index {self.index}."
            )
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, self._req_width)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self._req_height)
        cap.set(cv2.CAP_PROP_FPS, self._req_fps)
        self._cap = cap
        self._start = time.monotonic()
        self._index = 0
        return self

    @property
    def fps(self) -> float:
        if self._cap is None:
            return self._req_fps
        fps = self._cap.get(cv2.CAP_PROP_FPS)
        return float(fps) if fps and fps > 0 else self._req_fps

    @property
    def width(self) -> int:
        if self._cap is None:
            return self._req_width
        return int(self._cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or self._req_width

    @property
    def height(self) -> int:
        if self._cap is None:
            return self._req_height
        return int(self._cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or self._req_height

    def read(self) -> Optional[Frame]:
        if self._cap is None or self._start is None:
            raise RuntimeError("Source non ouverte — appelez open() d'abord.")
        ok, image = self._cap.read()
        if not ok:
            return None
        frame = Frame(
            index=self._index,
            timestamp=time.monotonic() - self._start,
            image=image,
        )
        self._index += 1
        return frame

    def close(self) -> None:
        if self._cap is not None:
            self._cap.release()
            self._cap = None
