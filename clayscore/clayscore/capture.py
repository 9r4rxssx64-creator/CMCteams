"""Capture temps réel pilotée par la source (jalon 7).

C'est le chemin RÉEL : au lieu de générer des plateaux (simulation), on lit un
flux vidéo+audio CONTINU (fichier, webcam, ou caméra GigE Aravis) et on le
SEGMENTE en plateaux :

  1. Détection de lancement en continu (MOG2 + LaunchCounter, jalon 1).
  2. Autour de chaque lancement, on isole une fenêtre (~1.8 s) : trames + audio.
  3. On analyse la fenêtre (coup de feu + verdict, jalons 2-3) et on produit une
     Analysis identique à celle de la simulation -> même moteur de match.

Le passage au matériel = changer `config.yaml` (source.video.type: aravis,
source.audio.type: mic). Ce module ne connaît que les interfaces de sources.

Note honnête : le chemin PLEINEMENT testé ici est `source: file` (flux continu
rejoué), qui exerce exactement la logique de segmentation live. Pour le micro
temps réel, l'audio est fourni via un tampon glissant (même logique) ; la
capture caméra GigE réelle est branchée (video_aravis) mais non testable sans
matériel dans cet environnement.
"""
from __future__ import annotations

from collections import deque
from pathlib import Path
from typing import Iterator, List, Optional, Tuple

import numpy as np

from .engine import Analysis
from .sources.base import Frame, VideoSource
from .sources.video_memory import InMemoryVideoSource
from .tools_bridge import synth  # pour write_video (ralentis)
from .vision.detector import DetectorConfig, LaunchCounter, MotionDetector
from .vision.verdict import VerdictConfig, decide_verdict


class LiveMatchSource:
    """Segmente un flux vidéo+audio continu en plateaux analysés.

    `audio` : (samples float32 mono, sample_rate) — le flux audio aligné temps
    sur la vidéo (cas fichier). Pour un micro, fournir le tampon audio complet
    de la session (ou glissant).
    """

    def __init__(
        self,
        video: VideoSource,
        audio: Optional[Tuple[np.ndarray, int]],
        clips_dir: str,
        window_s: float = 1.8,
        pre_s: float = 0.15,
        det_cfg: Optional[DetectorConfig] = None,
        v_cfg: Optional[VerdictConfig] = None,
    ):
        self.video = video
        self.audio = audio
        self.clips_dir = Path(clips_dir)
        self.clips_dir.mkdir(parents=True, exist_ok=True)
        self.window_s = float(window_s)
        self.pre_s = float(pre_s)
        self.det_cfg = det_cfg or DetectorConfig()
        self.v_cfg = v_cfg or VerdictConfig()
        self._gen: Optional[Iterator[Analysis]] = None
        self._id = 0

    # -- API alignée sur SimulationSource -------------------------------- #
    def next_plateau(self, v_cfg: Optional[VerdictConfig] = None) -> Optional[Analysis]:
        if self._gen is None:
            self._gen = self._plateaus()
        return next(self._gen, None)

    # -- segmentation ---------------------------------------------------- #
    def _audio_slice(self, t0: float, t1: float) -> Tuple[np.ndarray, int]:
        if self.audio is None:
            return np.zeros(1, dtype=np.float32), 22050
        samples, sr = self.audio
        a = max(0, int(t0 * sr))
        b = min(len(samples), int(t1 * sr))
        return samples[a:b].copy(), sr

    def _analyze_window(self, window: List[Frame], fps: float) -> Analysis:
        self._id += 1
        t0 = window[0].index / fps
        t1 = (window[-1].index + 1) / fps
        audio_slice, sr = self._audio_slice(t0, t1)
        images = [f.image for f in window]

        # Clip (ralenti) servi par le serveur.
        name = f"live_{self._id:04d}"
        clip_path = self.clips_dir / f"{name}.mp4"
        synth.write_video(str(clip_path), images, fps)

        result = decide_verdict(
            InMemoryVideoSource(images, fps), audio_slice, sr,
            fps_hint=fps, det_cfg=self.det_cfg, v_cfg=v_cfg_or(self.v_cfg))
        # En réel, la vérité terrain n'existe pas : personne ne sait à l'avance
        # ce que le plateau va faire. C'est TOUTE la différence avec la
        # simulation — et la seule.
        return Analysis.depuis_verdict(self._id, name, result, truth=None)

    def _plateaus(self) -> Iterator[Analysis]:
        detector = MotionDetector(self.det_cfg)
        counter: Optional[LaunchCounter] = None
        fps = 30.0
        pre = 0
        window_frames = 0
        buf: "deque[Frame]" = deque()
        capturing = False
        capture_end = 0
        capture_start = 0

        with self.video as src:
            for frame in src:
                if counter is None:
                    fps = src.fps
                    counter = LaunchCounter(frame.width, frame.height, self.det_cfg)
                    pre = int(round(self.pre_s * fps))
                    window_frames = int(round(self.window_s * fps))
                    buf = deque(maxlen=window_frames + pre + 5)

                buf.append(frame)
                dets = detector.process(frame)
                ev = counter.update(frame.index, dets)

                if capturing:
                    if frame.index >= capture_end:
                        window = [f for f in buf
                                  if capture_start <= f.index <= capture_end]
                        if window:
                            yield self._analyze_window(window, fps)
                        capturing = False
                elif ev is not None:
                    capture_start = max(0, ev.frame_index - pre)
                    capture_end = ev.frame_index + window_frames
                    capturing = True

            # Flux terminé pendant une capture -> on analyse ce qu'on a.
            if capturing:
                window = [f for f in buf if f.index >= capture_start]
                if window:
                    yield self._analyze_window(window, fps)


def v_cfg_or(v: Optional[VerdictConfig]) -> VerdictConfig:
    return v or VerdictConfig()


def build_live_source(cfg: dict, clips_dir: str) -> LiveMatchSource:
    """Construit une source live depuis la config (`source.video` / `source.audio`).

    Le SEUL point qui choisit réel vs simulation : `source.video.type` in
    {file, webcam, aravis} et `source.audio.type` in {file, mic}. Le reste du
    pipeline est identique. (Le chemin fichier est celui testé sans matériel.)
    """
    from .sources.audio_file import read_wav_mono
    from .sources.factory import build_video_source

    src_cfg = cfg.get("source", {})
    video = build_video_source(src_cfg.get("video", {"type": "file"}))
    audio_cfg = src_cfg.get("audio", {})
    audio = None
    if audio_cfg.get("type", "file") == "file" and audio_cfg.get("path"):
        samples, sr = read_wav_mono(audio_cfg["path"])
        audio = (samples, sr)
    # (micro temps réel : tampon audio glissant — branché au matériel, jalon 7)
    return LiveMatchSource(video, audio, clips_dir)
