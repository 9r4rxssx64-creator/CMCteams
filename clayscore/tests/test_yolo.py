"""Tests du jalon 8 : dataset YOLO, détecteur enfichable, entraînement, labeling."""
from __future__ import annotations

from pathlib import Path

import numpy as np
import pytest

from clayscore.labeling import LabeledStore
from clayscore.vision.detector import MotionDetector
from clayscore.vision.yolo_detector import build_detector, ultralytics_available
from tools import dataset, train


# --- export dataset YOLO ------------------------------------------------- #
def test_export_yolo_dataset_structure(tmp_path):
    info = dataset.export_yolo_dataset(
        str(tmp_path / "yolo"),
        specs=[("casse", 601), ("manque", 602), ("nobird", 603)],
        width=160, height=120, every=3)
    out = tmp_path / "yolo"
    assert (out / "data.yaml").exists()
    imgs = list((out / "images" / "train").glob("*.jpg")) \
        + list((out / "images" / "val").glob("*.jpg"))
    lbls = list((out / "labels" / "train").glob("*.txt")) \
        + list((out / "labels" / "val").glob("*.txt"))
    assert len(imgs) == info["images"] > 0
    assert len(lbls) == len(imgs)          # une étiquette par image
    assert info["objects"] > 0


def test_yolo_labels_normalized_and_classes(tmp_path):
    out = tmp_path / "yolo"
    dataset.export_yolo_dataset(str(out), specs=[("casse", 610)],
                                width=160, height=120, every=2)
    txts = list((out / "labels" / "train").glob("*.txt")) \
        + list((out / "labels" / "val").glob("*.txt"))
    seen_class = set()
    checked = 0
    for t in txts:
        for line in t.read_text().splitlines():
            if not line.strip():
                continue
            parts = line.split()
            cls = int(parts[0])
            vals = [float(x) for x in parts[1:]]
            assert cls in (0, 1)
            assert all(0.0 <= v <= 1.0 for v in vals)
            seen_class.add(cls)
            checked += 1
    assert checked > 0
    assert 0 in seen_class  # au moins des plateaux annotés


# --- détecteur enfichable + repli --------------------------------------- #
def test_build_detector_classic_default():
    d = build_detector({"detector": {"type": "classic"}})
    assert isinstance(d, MotionDetector)


def test_build_detector_yolo_fallback_without_model():
    d = build_detector({"detector": {"type": "yolo", "weights": "/inexistant.pt"}})
    # Sans lib/poids -> repli propre sur le détecteur classique + raison.
    assert isinstance(d, MotionDetector)
    assert getattr(d, "fallback_reason", None) is not None


def test_build_detector_no_config():
    assert isinstance(build_detector(), MotionDetector)


def test_ultralytics_available_is_bool():
    assert isinstance(ultralytics_available(), bool)


@pytest.mark.skipif(not ultralytics_available(),
                    reason="ultralytics absent (attendu en simulation)")
def test_yolo_detector_real(tmp_path):  # pragma: no cover - dépend GPU
    from clayscore.vision.yolo_detector import YoloDetector
    det = YoloDetector("yolov8n.pt")
    assert det is not None


# --- script d'entraînement (guardé) ------------------------------------- #
def test_train_dry_run():
    assert train.main(["--dry-run", "--build-dataset", "--export-tensorrt"]) == 0


@pytest.mark.skipif(ultralytics_available(),
                    reason="ultralytics présent : le chemin d'échec ne s'applique pas")
def test_train_graceful_without_ultralytics():
    # Sans ultralytics, le script explique et sort proprement (pas de crash).
    assert train.main([]) == 0


# --- collecte des cas arbitrés (data/labeled) --------------------------- #
def test_labeled_store_add_and_list(tmp_path):
    store = LabeledStore(str(tmp_path / "labeled"))
    assert store.count() == 0
    img = np.zeros((120, 160, 3), dtype=np.uint8)
    path = store.add_sample("casse", image=img, clip_url="/clips/a.mp4",
                            auto_verdict="ambigu", confidence=0.55)
    assert path and Path(path).exists(), "L'image arbitrée doit être écrite."
    assert (tmp_path / "labeled" / "casse").exists()
    assert store.count("casse") == 1 and store.count() == 1
    samples = store.list_samples()
    assert samples[0]["verdict"] == "casse"
    assert samples[0]["auto_verdict"] == "ambigu"
    assert "frame.jpg" in [p.name for p in (tmp_path / "labeled" / "casse").rglob("*.jpg")][0]


def test_labeled_store_rejects_bad_verdict(tmp_path):
    store = LabeledStore(str(tmp_path / "labeled"))
    with pytest.raises(ValueError):
        store.add_sample("explosé")


def test_engine_records_human_arbitration(tmp_path):
    # Un cas ambigu tranché par l'humain est archivé dans data/labeled/.
    from clayscore.engine import Analysis, MatchEngine
    eng = MatchEngine(clips_dir=str(tmp_path / "c"),
                      labeled_dir=str(tmp_path / "labeled"))
    eng.new_game("fosse_universelle", ["A"], serie=3)
    # Simule un plateau ambigu proposé par le pipeline.
    eng.pending = Analysis(
        plateau_id=1, clip_url="/clips/p1.mp4", auto_verdict="ambigu",
        best_guess="casse", confidence=0.5, ambiguous=True, gunshot=True)
    eng.commit("manque")  # l'humain tranche
    assert eng._labeled.count() == 1
    sample = eng._labeled.list_samples()[0]
    assert sample["verdict"] == "manque"
    assert sample["auto_verdict"] == "ambigu"
