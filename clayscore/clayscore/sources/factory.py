"""Fabriques de sources : construisent la bonne source depuis la config.

C'est le SEUL point où l'on choisit réel vs simulation. Le reste du code
ne connaît que les interfaces `VideoSource` / `AudioSource`.

Exemple de config (voir config/config.yaml) :

    source:
      video:
        type: file           # file | webcam | aravis
        path: data/samples/casse_ciel.mp4
      audio:
        type: file           # file | mic
        path: data/samples/casse_ciel.wav
"""
from __future__ import annotations

from typing import Any, Mapping

from .audio_file import FileAudioSource
from .audio_mic import MicAudioSource
from .base import AudioSource, VideoSource
from .video_aravis import AravisVideoSource
from .video_file import FileVideoSource
from .video_webcam import WebcamVideoSource


def build_video_source(cfg: Mapping[str, Any]) -> VideoSource:
    """Construit une source vidéo depuis un mapping `source.video`."""
    kind = str(cfg.get("type", "file")).lower()
    if kind == "file":
        return FileVideoSource(
            path=cfg["path"],
            loop=bool(cfg.get("loop", False)),
        )
    if kind == "webcam":
        return WebcamVideoSource(
            index=int(cfg.get("index", 0)),
            width=int(cfg.get("width", 1280)),
            height=int(cfg.get("height", 720)),
            fps=float(cfg.get("fps", 30.0)),
        )
    if kind == "aravis":
        return AravisVideoSource(
            camera_id=cfg.get("camera_id"),
            width=int(cfg.get("width", 1440)),
            height=int(cfg.get("height", 1080)),
            fps=float(cfg.get("fps", 50.0)),
            # COULEUR par défaut : le verdict reconnaît le plateau à son
            # orange (mesuré 27/27 en couleur, 9/27 en monochrome).
            pixel_format=str(cfg.get("pixel_format", "RGB8")),
            n_buffers=int(cfg.get("n_buffers", 20)),
            autoriser_mono=bool(cfg.get("autoriser_mono", False)),
        )
    raise ValueError(
        f"Type de source vidéo inconnu : {kind!r} "
        "(attendu : file | webcam | aravis)"
    )


def build_audio_source(cfg: Mapping[str, Any]) -> AudioSource:
    """Construit une source audio depuis un mapping `source.audio`."""
    kind = str(cfg.get("type", "file")).lower()
    if kind == "file":
        return FileAudioSource(
            path=cfg["path"],
            chunk_size=int(cfg.get("chunk_size", 1024)),
        )
    if kind == "mic":
        return MicAudioSource(
            device=cfg.get("device"),
            sample_rate=int(cfg.get("sample_rate", 44100)),
            chunk_size=int(cfg.get("chunk_size", 1024)),
        )
    raise ValueError(
        f"Type de source audio inconnu : {kind!r} (attendu : file | mic)"
    )
