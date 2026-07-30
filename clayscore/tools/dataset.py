"""Export d'un dataset YOLO auto-annoté (jalon 8).

Le synthétiseur connaît la vérité terrain (position/rayon du plateau et des
éclats image par image) : on l'utilise pour générer des images + labels YOLO
SANS annotation manuelle. Deux classes :

    0 = plateau (clay)
    1 = éclat (fragment)

Structure produite (format ultralytics) :
    <out>/images/{train,val}/*.jpg
    <out>/labels/{train,val}/*.txt      (une ligne "cls cx cy w h" normalisée)
    <out>/data.yaml

Les cas ambigus arbitrés par l'humain (data/labeled/) viennent COMPLÉTER ce
dataset synthétique pour l'entraînement futur (voir clayscore/labeling.py).
"""
from __future__ import annotations

import argparse
from pathlib import Path
from typing import List, Optional, Tuple

import cv2

from tools import synth

CLASS_CLAY = 0
CLASS_FRAG = 1
CLASS_NAMES = ["plateau", "eclat"]


def _bbox_norm(x: float, y: float, r: float, W: int, H: int):
    """Boîte YOLO normalisée (cx,cy,w,h) depuis un centre + rayon."""
    w = min(1.0, (2.0 * r) / W)
    h = min(1.0, (2.0 * r) / H)
    cx = min(1.0, max(0.0, x / W))
    cy = min(1.0, max(0.0, y / H))
    return cx, cy, w, h


def _labels_for_frame(state, W: int, H: int) -> List[str]:
    lines: List[str] = []
    if state.clay is not None:
        cx, cy, w, h = _bbox_norm(state.clay.x, state.clay.y, state.clay.r, W, H)
        lines.append(f"{CLASS_CLAY} {cx:.6f} {cy:.6f} {w:.6f} {h:.6f}")
    for fr in state.frags:
        if fr.alpha < 0.2:
            continue  # éclat trop estompé pour être un exemple fiable
        cx, cy, w, h = _bbox_norm(fr.x, fr.y, max(fr.r, 1.5), W, H)
        lines.append(f"{CLASS_FRAG} {cx:.6f} {cy:.6f} {w:.6f} {h:.6f}")
    return lines


def export_yolo_dataset(
    out_dir: str,
    specs: Optional[List[Tuple[str, int]]] = None,
    width: int = 320,
    height: int = 240,
    val_frac: float = 0.2,
    every: int = 1,
) -> dict:
    """Génère un dataset YOLO depuis des scénarios synthétiques.

    `specs` : liste de (scénario, graine). `every` : sous-échantillonnage des
    trames. Retourne un récapitulatif (nb d'images, chemin data.yaml).
    """
    if specs is None:
        specs = [(s, 600 + i) for i, s in enumerate(
            ["casse", "manque", "nobird"] * 3)]
    out = Path(out_dir)
    for sub in ("images/train", "images/val", "labels/train", "labels/val"):
        (out / sub).mkdir(parents=True, exist_ok=True)

    n_img = 0
    n_obj = 0
    for si, (scenario, seed) in enumerate(specs):
        params = synth.SynthParams(scenario=scenario, width=width,
                                   height=height, duration_s=2.0, seed=seed)
        sc = synth.simulate(params)
        images = synth.render_frames(sc)
        for st, img in zip(sc.frames, images):
            if st.i % every != 0:
                continue
            # Répartition déterministe train/val.
            split = "val" if ((si * 1000 + st.i) % 100) < int(val_frac * 100) else "train"
            stem = f"s{si:03d}_f{st.i:03d}"
            cv2.imwrite(str(out / f"images/{split}/{stem}.jpg"), img)
            lines = _labels_for_frame(st, width, height)
            n_obj += len(lines)
            (out / f"labels/{split}/{stem}.txt").write_text(
                "\n".join(lines), encoding="utf-8")
            n_img += 1

    data_yaml = out / "data.yaml"
    data_yaml.write_text(
        f"path: {out.resolve()}\n"
        "train: images/train\n"
        "val: images/val\n"
        f"nc: {len(CLASS_NAMES)}\n"
        f"names: {CLASS_NAMES}\n",
        encoding="utf-8")
    return {"images": n_img, "objects": n_obj, "data_yaml": str(data_yaml),
            "out": str(out)}


def main(argv: Optional[List[str]] = None) -> int:
    ap = argparse.ArgumentParser(description="Export dataset YOLO ClayScore.")
    ap.add_argument("--out", default="data/yolo")
    ap.add_argument("--width", type=int, default=320)
    ap.add_argument("--height", type=int, default=240)
    ap.add_argument("--every", type=int, default=2,
                    help="1 trame sur N (réduit la redondance temporelle).")
    args = ap.parse_args(argv)
    info = export_yolo_dataset(args.out, width=args.width, height=args.height,
                               every=args.every)
    print(f"Dataset YOLO : {info['images']} images, {info['objects']} objets "
          f"-> {info['data_yaml']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
