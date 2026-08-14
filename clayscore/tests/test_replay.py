"""Tests de l'export ralenti habillé (verdict + trajectoire incrustés)."""
from __future__ import annotations

import cv2
import numpy as np
import pytest
from fastapi.testclient import TestClient

from clayscore.replay import render_overlay_clip, render_overlay_from_file
from clayscore.server.app import create_app
from clayscore.sources.video_file import FileVideoSource
from tools import synth


def _clip(tmp_path, scenario="casse", seed=1):
    p = synth.SynthParams(scenario=scenario, width=320, height=240,
                          duration_s=2.0, seed=seed)
    return synth.generate(p, str(tmp_path / "c"))


def test_overlay_from_file_produces_video(tmp_path):
    paths = _clip(tmp_path, "casse")
    out = str(tmp_path / "ov.mp4")
    render_overlay_from_file(paths["video"], out, "casse", slowmo=4.0)
    with FileVideoSource(out) as v:
        ov = [f.image for f in v]
        assert v.fps == pytest.approx(30.0 / 4.0)  # ralenti x4
    with FileVideoSource(paths["video"]) as v:
        src = [f.image for f in v]
    assert len(ov) == len(src) > 0
    # Le badge (haut) et la trajectoire modifient l'image tardive.
    late = len(ov) - 3
    assert np.abs(ov[late][:40].astype(int) - src[late][:40].astype(int)).mean() > 5


def test_overlay_all_verdicts(tmp_path):
    paths = _clip(tmp_path, "casse")
    with FileVideoSource(paths["video"]) as v:
        imgs = [f.image for f in v]
        fps = v.fps
    for verdict in ("casse", "manque", "nobird", "ambigu"):
        out = str(tmp_path / f"{verdict}.mp4")
        render_overlay_clip(imgs, out, fps, verdict, reveal_frame=5)
        with FileVideoSource(out) as v:
            assert len(list(v)) == len(imgs)


def test_overlay_empty_raises(tmp_path):
    with pytest.raises(ValueError):
        render_overlay_clip([], str(tmp_path / "x.mp4"), 30.0, "casse")


def test_overlay_is_web_playable(tmp_path):
    """Le ralenti doit être en H.264 : sinon illisible en navigateur / sur iPhone."""
    from clayscore.replay import _find_ffmpeg

    paths = _clip(tmp_path, "casse")
    out = str(tmp_path / "web.mp4")
    render_overlay_from_file(paths["video"], out, "casse", slowmo=4.0)
    cap = cv2.VideoCapture(out)
    fourcc = int(cap.get(cv2.CAP_PROP_FOURCC))
    codec = "".join(chr((fourcc >> 8 * i) & 0xFF) for i in range(4))
    cap.release()
    if _find_ffmpeg():
        assert codec.lower() == "h264", f"codec {codec!r} illisible en navigateur"
    else:  # sans ffmpeg : repli assumé (lisible VLC/QuickTime), pas un échec
        pytest.skip("ffmpeg absent : repli FMP4 assumé")


def test_ensure_web_playable_is_safe_on_missing_file(tmp_path):
    from clayscore.replay import ensure_web_playable
    # Ne doit jamais lever, même sur un fichier absent.
    assert ensure_web_playable(str(tmp_path / "absent.mp4")) is False


def test_server_overlay_endpoint(tmp_path):
    app = create_app(clips_dir=str(tmp_path / "clips"),
                     db_path=str(tmp_path / "db.sqlite"),
                     state_path=str(tmp_path / "state.json"))
    with TestClient(app) as c:
        c.post("/api/game/new", json={"shooters": ["A"], "serie": 3})
        c.post("/api/game/throw")                 # plateau en attente
        r = c.post("/api/game/overlay")
        assert r.status_code == 200
        url = r.json()["clip_url"]
        assert url.endswith("_overlay.mp4")
        clip = c.get(url)
        assert clip.status_code == 200
        assert clip.headers["content-type"] == "video/mp4"
        assert len(clip.content) > 100


def test_server_overlay_without_pending_errors(tmp_path):
    app = create_app(clips_dir=str(tmp_path / "clips"),
                     db_path=str(tmp_path / "db.sqlite"),
                     state_path=str(tmp_path / "state.json"))
    with TestClient(app) as c:
        c.post("/api/game/new", json={"shooters": ["A"], "serie": 3})
        assert c.post("/api/game/overlay").status_code == 400
