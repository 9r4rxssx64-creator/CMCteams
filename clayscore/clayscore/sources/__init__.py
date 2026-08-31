"""Couche d'abstraction des sources vidéo/audio (réel ou simulation)."""

from .base import AudioChunk, AudioSource, Frame, VideoSource
from .factory import build_audio_source, build_video_source

__all__ = [
    "Frame",
    "AudioChunk",
    "VideoSource",
    "AudioSource",
    "build_video_source",
    "build_audio_source",
]
