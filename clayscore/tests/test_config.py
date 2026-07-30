"""Tests de la configuration (défauts + fusion YAML)."""
from __future__ import annotations

from clayscore.util.config import DEFAULTS, load_config


def test_defaults_when_no_path():
    cfg = load_config(None)
    assert cfg["source"]["video"]["type"] == "file"
    assert cfg["source"]["audio"]["type"] == "file"
    assert cfg["verdict"]["window_ms"] == 800


def test_defaults_when_missing_file(tmp_path):
    cfg = load_config(tmp_path / "inexistant.yaml")
    assert cfg == DEFAULTS


def test_deep_merge_override(tmp_path):
    p = tmp_path / "c.yaml"
    p.write_text(
        "source:\n"
        "  video:\n"
        "    type: webcam\n"
        "    index: 2\n",
        encoding="utf-8",
    )
    cfg = load_config(p)
    # La valeur surchargée est prise en compte...
    assert cfg["source"]["video"]["type"] == "webcam"
    assert cfg["source"]["video"]["index"] == 2
    # ...sans effacer les autres défauts (audio intact).
    assert cfg["source"]["audio"]["type"] == "file"
    assert cfg["verdict"]["window_ms"] == 800


def test_invalid_root_raises(tmp_path):
    p = tmp_path / "bad.yaml"
    p.write_text("- ceci\n- est\n- une liste\n", encoding="utf-8")
    import pytest

    with pytest.raises(ValueError):
        load_config(p)
