"""Détecteur YOLO (IA v2, jalon 8) — enfichable, avec repli classique.

Interface compatible avec MotionDetector : `process(frame) -> List[Detection]`.
Charge un modèle ultralytics (YOLOv8/……, ou moteur TensorRT sur Jetson) si
disponible ; sinon `build_detector` retombe proprement sur le détecteur
classique MOG2 (jalons 1-3). Le choix se fait dans la config :

    detector:
      type: classic | yolo
      weights: models/clayscore-yolo.pt   # ou .engine (TensorRT)
      conf: 0.25

Objectif : brancher l'IA quand un modèle entraîné est présent, sans jamais
casser le pipeline si le modèle/la lib manquent.
"""
from __future__ import annotations

from pathlib import Path
from typing import List, Optional

import numpy as np

from ..sources.base import Frame
from .detector import Detection, DetectorConfig, MotionDetector


def ultralytics_available() -> bool:
    try:  # pragma: no cover - dépend de l'environnement
        import ultralytics  # noqa: F401
        return True
    except Exception:  # noqa: BLE001
        return False


class YoloDetector:
    """Détecteur d'objets basé ultralytics (plateau=0, éclat=1)."""

    def __init__(self, weights: str, conf: float = 0.25):
        from ultralytics import YOLO  # import tardif  # pragma: no cover
        self.model = YOLO(weights)     # pragma: no cover
        self.conf = float(conf)        # pragma: no cover

    def process(self, frame: Frame) -> List[Detection]:  # pragma: no cover - GPU
        res = self.model.predict(frame.image, conf=self.conf, verbose=False)
        dets: List[Detection] = []
        if not res:
            return dets
        r = res[0]
        boxes = getattr(r, "boxes", None)
        if boxes is None:
            return dets
        for b in boxes:
            x1, y1, x2, y2 = [float(v) for v in b.xyxy[0].tolist()]
            cls = int(b.cls[0].item())
            w, h = (x2 - x1), (y2 - y1)
            area = max(1.0, w * h)
            dets.append(Detection(
                cx=(x1 + x2) / 2, cy=(y1 + y2) / 2, area=area,
                bbox=(int(x1), int(y1), int(w), int(h)),
                radius=float(np.sqrt(area / np.pi)),
                circularity=1.0,
                orange_ratio=1.0 if cls == 0 else 0.8,
                is_clay=(cls == 0),
            ))
        return dets


def build_detector(cfg: Optional[dict] = None,
                   det_cfg: Optional[DetectorConfig] = None):
    """Fabrique le détecteur : YOLO si demandé ET disponible, sinon classique.

    Ne lève jamais : en l'absence de modèle/lib, retombe sur MotionDetector et
    le signale via l'attribut `.fallback_reason` sur l'objet retourné.
    """
    cfg = cfg or {}
    dcfg = cfg.get("detector", {}) if isinstance(cfg, dict) else {}
    kind = str(dcfg.get("type", "classic")).lower()

    if kind == "yolo":
        weights = dcfg.get("weights", "")
        reason = None
        if not ultralytics_available():
            reason = "ultralytics non installé"
        elif not weights or not Path(weights).exists():
            reason = f"poids introuvables ({weights!r})"
        if reason is None:
            return YoloDetector(weights, float(dcfg.get("conf", 0.25)))
        # Repli propre.
        fallback = MotionDetector(det_cfg)
        setattr(fallback, "fallback_reason", reason)
        return fallback

    return MotionDetector(det_cfg)
