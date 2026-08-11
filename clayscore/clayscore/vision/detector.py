"""Détection de mouvement + comptage des lancements (jalon 1).

Approche « classique » (sans IA, rapide sur Jetson) :
  1. Soustraction de fond MOG2 -> masque des pixels en mouvement.
  2. Nettoyage morphologique (ouverture pour le bruit, dilatation pour relier
     les fragments proches).
  3. Composantes connexes -> blobs (plateaux ou éclats) avec surface/centre.
  4. Classification simple : blob « plateau » (surface + rondeur + orange) et
     « rafale » (beaucoup de surface en mouvement dans la zone de lancement).

Un LANCEMENT = apparition d'une cible (plateau propre OU rafale d'éclats pour
un no-bird) après une période sans cible, dans la zone basse (près du lanceur).

Toutes les tailles sont exprimées en fraction de la surface d'image
=> indépendant de la résolution (fonctionne en 320x240 comme en 1440x1080).
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

import cv2
import numpy as np

from ..sources.base import Frame, VideoSource


@dataclass
class Detection:
    """Un blob détecté sur une image."""

    cx: float           # centre x
    cy: float           # centre y
    area: float         # surface en pixels
    bbox: tuple         # (x, y, w, h)
    radius: float       # rayon équivalent (sqrt(area/pi))
    circularity: float  # 4*pi*area / perimetre^2 (1 = cercle parfait)
    orange_ratio: float # fraction de pixels « orange » dans la bbox
    is_clay: bool       # blob compatible avec un plateau propre


@dataclass
class DetectorConfig:
    warmup_frames: int = 6            # trames d'apprentissage du fond
    history: int = 200                # mémoire MOG2
    var_threshold: float = 16.0       # sensibilité MOG2
    clay_area_min_frac: float = 0.00018   # surface mini d'un plateau
    clay_area_max_frac: float = 0.02      # surface maxi d'un plateau
    noise_area_min_frac: float = 0.00006  # en dessous = bruit ignoré
    circularity_min: float = 0.55     # rondeur mini pour « plateau »
    launch_zone_y_frac: float = 0.40  # cible « basse » si cy > 0.40*H
    burst_area_frac: float = 0.0009   # surface totale en zone = rafale (no-bird)
    confirm_frames: int = 2           # trames consécutives pour confirmer
    reset_gap_frames: int = 5         # trames sans cible pour réarmer


def _orange_ratio(bgr_roi: np.ndarray) -> float:
    """Fraction de pixels orange (plateau) dans une ROI BGR."""
    if bgr_roi.size == 0:
        return 0.0
    b = bgr_roi[..., 0].astype(np.int32)
    g = bgr_roi[..., 1].astype(np.int32)
    r = bgr_roi[..., 2].astype(np.int32)
    mask = (r > 140) & (g > 55) & (g < 190) & (b < 130) & (r - b > 50)
    return float(mask.mean())


class MotionDetector:
    """Détecte les blobs en mouvement image par image (MOG2 + morpho)."""

    def __init__(self, config: Optional[DetectorConfig] = None):
        self.cfg = config or DetectorConfig()
        self._bg = cv2.createBackgroundSubtractorMOG2(
            history=self.cfg.history,
            varThreshold=self.cfg.var_threshold,
            detectShadows=False,
        )
        self._kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        self._n = 0

    @property
    def n_processed(self) -> int:
        return self._n

    def process(self, frame: Frame) -> List[Detection]:
        """Renvoie les détections de cette trame (vide pendant le warmup)."""
        img = frame.image
        h, w = img.shape[:2]
        area_img = float(w * h)

        # Pendant le warmup on apprend vite le fond (learningRate élevé).
        lr = 0.5 if self._n < self.cfg.warmup_frames else -1
        fg = self._bg.apply(img, learningRate=lr)
        self._n += 1
        if self._n <= self.cfg.warmup_frames:
            return []

        # Binarisation + nettoyage.
        _, fg = cv2.threshold(fg, 127, 255, cv2.THRESH_BINARY)
        fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, self._kernel, iterations=1)
        fg = cv2.dilate(fg, self._kernel, iterations=1)

        n_labels, _labels, stats, centroids = cv2.connectedComponentsWithStats(fg)
        dets: List[Detection] = []
        noise_min = self.cfg.noise_area_min_frac * area_img
        clay_min = self.cfg.clay_area_min_frac * area_img
        clay_max = self.cfg.clay_area_max_frac * area_img

        for lbl in range(1, n_labels):
            x, y, bw, bh, area = stats[lbl]
            if area < noise_min:
                continue
            cx, cy = centroids[lbl]
            # Rondeur via le contour de la boîte englobante (approx rapide).
            perim = 2.0 * (bw + bh)
            circ = (4.0 * np.pi * area / (perim * perim)) if perim > 0 else 0.0
            roi = img[y:y + bh, x:x + bw]
            oratio = _orange_ratio(roi)
            is_clay = (
                clay_min <= area <= clay_max
                and circ >= self.cfg.circularity_min
            )
            dets.append(
                Detection(
                    cx=float(cx),
                    cy=float(cy),
                    area=float(area),
                    bbox=(int(x), int(y), int(bw), int(bh)),
                    radius=float(np.sqrt(area / np.pi)),
                    circularity=float(circ),
                    orange_ratio=float(oratio),
                    is_clay=bool(is_clay),
                )
            )
        return dets


@dataclass
class LaunchEvent:
    frame_index: int
    cx: float
    cy: float
    kind: str  # "clay" (disque propre) | "burst" (rafale d'éclats, no-bird)


class LaunchCounter:
    """Machine à états comptant les lancements à partir des détections.

    Émet un LaunchEvent quand une cible apparaît (après une période vide) dans
    la zone basse. Robuste au bruit via une confirmation sur N trames.
    """

    def __init__(self, frame_w: int, frame_h: int,
                 config: Optional[DetectorConfig] = None):
        self.cfg = config or DetectorConfig()
        self.w = frame_w
        self.h = frame_h
        self._area_img = float(frame_w * frame_h)
        self._present_streak = 0
        self._absent_streak = self.cfg.reset_gap_frames  # armé au départ
        self._armed = True
        self.events: List[LaunchEvent] = []

    def _qualifies(self, dets: List[Detection]):
        """Retourne (present, cx, cy, kind) pour la zone de lancement."""
        zone_y = self.cfg.launch_zone_y_frac * self.h
        burst_min = self.cfg.burst_area_frac * self._area_img
        # 1) plateau propre en zone basse
        clays = [d for d in dets if d.is_clay and d.cy >= zone_y]
        if clays:
            d = max(clays, key=lambda d: d.area)
            return True, d.cx, d.cy, "clay"
        # 2) rafale : surface totale en zone basse (no-bird = éclats)
        zone = [d for d in dets if d.cy >= zone_y]
        total = sum(d.area for d in zone)
        if total >= burst_min and zone:
            cx = float(np.mean([d.cx for d in zone]))
            cy = float(np.mean([d.cy for d in zone]))
            return True, cx, cy, "burst"
        return False, 0.0, 0.0, ""

    def update(self, frame_index: int, dets: List[Detection]) -> Optional[LaunchEvent]:
        present, cx, cy, kind = self._qualifies(dets)
        event: Optional[LaunchEvent] = None

        if present:
            self._present_streak += 1
            self._absent_streak = 0
            if self._armed and self._present_streak >= self.cfg.confirm_frames:
                event = LaunchEvent(frame_index=frame_index, cx=cx, cy=cy, kind=kind)
                self.events.append(event)
                self._armed = False  # attend la disparition avant un nouveau lancement
        else:
            self._absent_streak += 1
            self._present_streak = 0
            if self._absent_streak >= self.cfg.reset_gap_frames:
                self._armed = True

        return event


def count_launches(source: VideoSource,
                   config: Optional[DetectorConfig] = None) -> List[LaunchEvent]:
    """Parcourt une source vidéo entière et renvoie les lancements détectés."""
    cfg = config or DetectorConfig()
    detector = MotionDetector(cfg)
    counter: Optional[LaunchCounter] = None
    with source as src:
        for frame in src:
            if counter is None:
                counter = LaunchCounter(frame.width, frame.height, cfg)
            dets = detector.process(frame)
            counter.update(frame.index, dets)
    return counter.events if counter else []
