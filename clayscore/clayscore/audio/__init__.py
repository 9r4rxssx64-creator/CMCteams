"""Audio : détection des coups de feu."""

from .gunshot import (
    GunshotConfig,
    GunshotDetector,
    GunshotEvent,
    classify_shot_pattern,
    detect_gunshots,
)

__all__ = [
    "GunshotEvent",
    "GunshotConfig",
    "GunshotDetector",
    "detect_gunshots",
    "classify_shot_pattern",
]
