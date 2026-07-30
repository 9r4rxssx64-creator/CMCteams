"""Vision : détection, suivi, verdicts."""

from .detector import (
    Detection,
    DetectorConfig,
    LaunchCounter,
    LaunchEvent,
    MotionDetector,
    count_launches,
)
from .multicam import (
    Camera,
    Detection2D,
    MultiCameraFusion,
    Point3D,
    Track3D,
    associate,
    triangulate_stereo,
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
    "Camera",
    "Detection2D",
    "MultiCameraFusion",
    "Point3D",
    "Track3D",
    "associate",
    "triangulate_stereo",
    "VerdictConfig",
    "VerdictEvidence",
    "VerdictResult",
    "decide_from_evidence",
    "decide_verdict",
]
