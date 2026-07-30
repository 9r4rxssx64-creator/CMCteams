"""Interfaces d'abstraction des sources (vidéo et audio).

Objectif du jalon 0 : la MÊME interface expose une caméra GigE réelle
(Aravis), une webcam USB ou un fichier vidéo. Toute la logique métier
(détection, suivi, verdicts, partie) consomme uniquement ces interfaces.
Passer au matériel réel = changer la configuration, PAS le code.

Conventions :
- Les images sont en BGR uint8 de forme (H, W, 3) — convention OpenCV.
- Les échantillons audio sont en float32 mono dans [-1, 1].
- `read()` renvoie `None` quand le flux est terminé (fichier lu jusqu'au bout).
- Toutes les sources sont itérables et utilisables comme context manager.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Iterator, Optional

import numpy as np


@dataclass
class Frame:
    """Une trame vidéo horodatée."""

    index: int          # numéro de trame (0-based)
    timestamp: float    # horodatage en secondes depuis le début du flux
    image: np.ndarray   # image BGR uint8 de forme (H, W, 3)

    @property
    def height(self) -> int:
        return int(self.image.shape[0])

    @property
    def width(self) -> int:
        return int(self.image.shape[1])


@dataclass
class AudioChunk:
    """Un bloc d'échantillons audio horodaté (mono)."""

    index: int              # numéro de bloc (0-based)
    start_time: float       # horodatage du 1er échantillon, en secondes
    samples: np.ndarray     # float32 mono dans [-1, 1], forme (N,)
    sample_rate: int        # fréquence d'échantillonnage (Hz)

    @property
    def duration(self) -> float:
        """Durée du bloc en secondes."""
        return len(self.samples) / float(self.sample_rate)


class VideoSource(ABC):
    """Source vidéo abstraite.

    Itérable : `for frame in source: ...` s'arrête à la fin du flux.
    Context manager : `with build_video_source(cfg) as src: ...`.
    """

    # --- métadonnées ---
    @property
    @abstractmethod
    def fps(self) -> float:
        """Cadence en images/seconde."""

    @property
    @abstractmethod
    def width(self) -> int:
        """Largeur des images en pixels."""

    @property
    @abstractmethod
    def height(self) -> int:
        """Hauteur des images en pixels."""

    # --- cycle de vie ---
    @abstractmethod
    def open(self) -> "VideoSource":
        """Ouvre la source. Retourne self pour le chaînage."""

    @abstractmethod
    def read(self) -> Optional[Frame]:
        """Lit la trame suivante, ou None si le flux est terminé."""

    @abstractmethod
    def close(self) -> None:
        """Libère les ressources (fichier, périphérique, caméra)."""

    # --- confort ---
    def __iter__(self) -> Iterator[Frame]:
        while True:
            frame = self.read()
            if frame is None:
                break
            yield frame

    def __enter__(self) -> "VideoSource":
        return self.open()

    def __exit__(self, *exc) -> bool:
        self.close()
        return False


class AudioSource(ABC):
    """Source audio abstraite (micro réel ou fichier .wav).

    Fournit des blocs d'échantillons de taille fixe (`chunk_size`).
    """

    @property
    @abstractmethod
    def sample_rate(self) -> int:
        """Fréquence d'échantillonnage en Hz."""

    @property
    @abstractmethod
    def chunk_size(self) -> int:
        """Nombre d'échantillons par bloc renvoyé par `read()`."""

    @abstractmethod
    def open(self) -> "AudioSource":
        """Ouvre la source. Retourne self pour le chaînage."""

    @abstractmethod
    def read(self) -> Optional[AudioChunk]:
        """Lit le bloc suivant, ou None si le flux est terminé."""

    @abstractmethod
    def close(self) -> None:
        """Libère les ressources."""

    def __iter__(self) -> Iterator[AudioChunk]:
        while True:
            chunk = self.read()
            if chunk is None:
                break
            yield chunk

    def __enter__(self) -> "AudioSource":
        return self.open()

    def __exit__(self, *exc) -> bool:
        self.close()
        return False
