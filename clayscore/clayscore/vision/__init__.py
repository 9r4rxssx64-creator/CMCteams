"""Vision : détection, suivi, verdicts."""

from .detector import (
    Detection,
    DetectorConfig,
    LaunchCounter,
    LaunchEvent,
    MotionDetector,
    count_launches,
)
from .tracker import KalmanClayTracker, TrackPoint, exited_frame
from .verdict import (
    VerdictConfig,
    VerdictEvidence,
    VerdictResult,
    decide_from_evidence,
    decide_verdict,
)

__all__ = [
    "Detection",
    "DetectorConfig",
    "MotionDetector",
    "LaunchCounter",
    "LaunchEvent",
    "count_launches",
    "KalmanClayTracker",
    "TrackPoint",
    "exited_frame",
    "VerdictConfig",
    "VerdictEvidence",
    "VerdictResult",
    "decide_from_evidence",
    "decide_verdict",
]
