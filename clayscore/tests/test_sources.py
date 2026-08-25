"""Tests de la couche d'abstraction des sources (vidéo/audio + fabriques)."""
from __future__ import annotations

import numpy as np
import pytest

from clayscore.sources import build_audio_source, build_video_source
from clayscore.sources.audio_file import FileAudioSource
from clayscore.sources.base import AudioChunk, Frame
from clayscore.sources.video_aravis import AravisVideoSource, _try_import_aravis
from clayscore.sources.video_file import FileVideoSource
from tools import synth


@pytest.fixture(scope="module")
def clip(tmp_path_factory):
    """Un petit clip synthétique partagé par les tests de sources."""
    d = tmp_path_factory.mktemp("clip")
    params = synth.SynthParams(width=160, height=120, duration_s=1.0, seed=9)
    return synth.generate(params, str(d / "s"))


# --- vidéo ---------------------------------------------------------------- #
def test_file_video_iterates(clip):
    with FileVideoSource(clip["video"]) as src:
        frames = list(src)
    assert len(frames) > 0
    f0 = frames[0]
    assert isinstance(f0, Frame)
    assert f0.image.shape == (120, 160, 3)
    assert f0.image.dtype == np.uint8
    # Index et horodatage strictement croissants.
    assert [f.index for f in frames] == list(range(len(frames)))
    assert frames[1].timestamp > frames[0].timestamp


def test_file_video_read_returns_none_at_end(clip):
    src = FileVideoSource(clip["video"]).open()
    try:
        while src.read() is not None:
            pass
        assert src.read() is None  # rester None une fois épuisé
    finally:
        src.close()


def test_file_video_missing_file_raises():
    with pytest.raises(FileNotFoundError):
        FileVideoSource("/chemin/inexistant_xyz.mp4").open()


def test_file_video_loop(clip):
    src = FileVideoSource(clip["video"], loop=True).open()
    try:
        # En mode boucle, on peut lire plus de trames que le fichier n'en contient.
        with FileVideoSource(clip["video"]) as tmp:
            n = len(list(tmp))
        seen = [src.read() for _ in range(n + 3)]
        assert all(f is not None for f in seen)
    finally:
        src.close()


# --- audio ---------------------------------------------------------------- #
def test_file_audio_iterates(clip):
    with FileAudioSource(clip["audio"], chunk_size=256) as src:
        chunks = list(src)
    assert len(chunks) > 0
    c0 = chunks[0]
    assert isinstance(c0, AudioChunk)
    assert c0.samples.dtype == np.float32
    assert -1.0 <= float(c0.samples.min()) and float(c0.samples.max()) <= 1.0
    assert c0.sample_rate == 22050


def test_audio_reconstruction_length(clip):
    with FileAudioSource(clip["audio"], chunk_size=333) as src:
        total = sum(len(c.samples) for c in src)
    # ~1 s à 22050 Hz.
    assert abs(total - 22050) < 400


# --- fabriques ------------------------------------------------------------ #
def test_factory_builds_file_sources(clip):
    v = build_video_source({"type": "file", "path": clip["video"]})
    assert isinstance(v, FileVideoSource)
    a = build_audio_source({"type": "file", "path": clip["audio"]})
    assert isinstance(a, FileAudioSource)


def test_factory_unknown_types_raise():
    with pytest.raises(ValueError):
        build_video_source({"type": "hologramme"})
    with pytest.raises(ValueError):
        build_audio_source({"type": "telepathie"})


def test_factory_builds_aravis_stub():
    # La fabrique construit l'objet même sans matériel (l'erreur vient d'open()).
    v = build_video_source({"type": "aravis", "width": 1440, "height": 1080})
    assert isinstance(v, AravisVideoSource)
    assert v.width == 1440 and v.height == 1080


def test_aravis_open_raises_cleanly_without_hardware():
    # En simulation, Aravis est absent : open() doit lever une erreur explicite,
    # pas planter de façon opaque.
    if _try_import_aravis() is not None:  # pragma: no cover - dépend du matériel
        pytest.skip("Aravis est installé sur cette machine.")
    with pytest.raises(RuntimeError, match="Aravis"):
        AravisVideoSource().open()
