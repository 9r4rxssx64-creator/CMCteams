"""Source vidéo lisant un fichier (.mp4, .avi, ...) via OpenCV.

Utilisée en mode simulation : rejoue une vidéo enregistrée ou synthétique
exactement comme le ferait une caméra réelle.
"""
from __future__ import annotations

from typing import Optional

import cv2

from .base import Frame, VideoSource


class FileVideoSource(VideoSource):
    """Rejoue un fichier vidéo trame par trame."""

    def __init__(self, path: str, loop: bool = False):
        self.path = str(path)
        self.loop = bool(loop)          # si True, reboucle indéfiniment
        self._cap: Optional[cv2.VideoCapture] = None
        self._index = 0
        self._fps = 0.0
        self._width = 0
        self._height = 0

    def open(self) -> "FileVideoSource":
        cap = cv2.VideoCapture(self.path)
        if not cap.isOpened():
            raise FileNotFoundError(
                f"Impossible d'ouvrir la vidéo : {self.path}"
            )
        self._cap = cap
        # OpenCV renvoie parfois 0 fps sur certains conteneurs → repli à 30.
        fps = cap.get(cv2.CAP_PROP_FPS)
        self._fps = float(fps) if fps and fps > 0 else 30.0
        self._width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self._height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        self._index = 0
        return self

    @property
    def fps(self) -> float:
        return self._fps

    @property
    def width(self) -> int:
        return self._width

    @property
    def height(self) -> int:
        return self._height

    def read(self) -> Optional[Frame]:
        if self._cap is None:
            raise RuntimeError("Source non ouverte — appelez open() d'abord.")
        ok, image = self._cap.read()
        if not ok:
            if self.loop and self._index > 0:
                # Reboucle : on rembobine au début.
                self._cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                self._index = 0
                ok, image = self._cap.read()
                if not ok:
                    return None
            else:
                return None
        frame = Frame(
            index=self._index,
            timestamp=self._index / self._fps,
            image=image,
        )
        self._index += 1
        return frame

    def close(self) -> None:
        if self._cap is not None:
            self._cap.release()
            self._cap = None
