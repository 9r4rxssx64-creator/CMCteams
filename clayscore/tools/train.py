"""Entraînement IA v2 (YOLO) + export TensorRT pour Jetson (jalon 8).

Pipeline complet et RÉEL :
  1. (option) construit un dataset YOLO auto-annoté depuis le synthétiseur.
  2. entraîne un modèle ultralytics (YOLOv8n par défaut) sur ce dataset.
  3. (option) exporte en TensorRT (.engine) pour l'inférence rapide sur Jetson.

⚠️ L'entraînement et l'export TensorRT exigent ultralytics + un GPU (et, pour
TensorRT, un Jetson/TensorRT). Ce script NE PLANTE PAS sans ces prérequis : il
affiche la marche à suivre. Utilisez --dry-run pour voir le plan sans rien
installer. Sur le Jetson : `pip install ultralytics` puis lancez sans --dry-run.
"""
from __future__ import annotations

import argparse
from pathlib import Path
from typing import List, Optional


def _plan(args) -> str:
    steps = [
        f"1. Dataset : {'construction depuis le synthétiseur' if args.build_dataset else args.data}",
        f"2. Entraînement : YOLO({args.weights}) sur {args.data}/data.yaml, "
        f"epochs={args.epochs}, imgsz={args.imgsz}",
    ]
    if args.export_tensorrt:
        steps.append("3. Export TensorRT (.engine) pour Jetson Orin Nano")
    return "\n".join(steps)


def main(argv: Optional[List[str]] = None) -> int:
    ap = argparse.ArgumentParser(description="Entraînement IA v2 ClayScore (YOLO).")
    ap.add_argument("--data", default="data/yolo",
                    help="Dossier dataset YOLO (contenant data.yaml).")
    ap.add_argument("--build-dataset", action="store_true",
                    help="Construit d'abord le dataset synthétique.")
    ap.add_argument("--weights", default="yolov8n.pt")
    ap.add_argument("--epochs", type=int, default=50)
    ap.add_argument("--imgsz", type=int, default=640)
    ap.add_argument("--export-tensorrt", action="store_true")
    ap.add_argument("--out-weights", default="models/clayscore-yolo.pt")
    ap.add_argument("--dry-run", action="store_true",
                    help="Affiche le plan sans entraîner.")
    args = ap.parse_args(argv)

    print("=== Plan d'entraînement IA v2 ===")
    print(_plan(args))

    if args.dry_run:
        print("\n(--dry-run : rien n'a été exécuté.)")
        return 0

    # Vérifie ultralytics AVANT tout (échec propre, pas de crash).
    try:
        from ultralytics import YOLO  # pragma: no cover - dépend GPU/env
    except Exception:  # noqa: BLE001
        print("\n⚠️ ultralytics n'est pas installé dans cet environnement.")
        print("   Sur le Jetson (ou une machine GPU) :")
        print("     pip install ultralytics")
        print("     python -m tools.train --build-dataset --export-tensorrt")
        return 0

    if args.build_dataset:  # pragma: no cover - chemin GPU
        from tools.dataset import export_yolo_dataset
        info = export_yolo_dataset(args.data)
        print(f"Dataset : {info['images']} images -> {info['data_yaml']}")

    data_yaml = Path(args.data) / "data.yaml"  # pragma: no cover
    model = YOLO(args.weights)                 # pragma: no cover
    model.train(data=str(data_yaml), epochs=args.epochs, imgsz=args.imgsz)  # pragma: no cover
    Path(args.out_weights).parent.mkdir(parents=True, exist_ok=True)  # pragma: no cover
    model.save(args.out_weights)               # pragma: no cover
    print(f"Modèle entraîné -> {args.out_weights}")  # pragma: no cover

    if args.export_tensorrt:                   # pragma: no cover
        print("Export TensorRT (.engine)…")
        model.export(format="engine")
    return 0  # pragma: no cover


if __name__ == "__main__":
    raise SystemExit(main())
