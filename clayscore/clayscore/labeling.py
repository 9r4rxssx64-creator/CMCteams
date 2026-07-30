"""Collecte des cas arbitrés par l'humain -> data/labeled/ (jalon 8).

Quand un verdict AMBIGU est tranché par l'humain (ou corrigé), sa décision
devient la vérité : on archive le plateau (une image clé + métadonnées) sous
data/labeled/<verdict>/, pour enrichir l'entraînement futur de l'IA v2.

Ces échantillons complètent le dataset synthétique auto-annoté (tools/dataset).
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import List, Optional

import numpy as np

try:
    import cv2
except Exception:  # noqa: BLE001 - cv2 optionnel pour la simple écriture JSON
    cv2 = None

VALID = ("casse", "manque", "nobird")


class LabeledStore:
    """Archive des plateaux étiquetés par l'humain."""

    def __init__(self, root: str = "data/labeled"):
        self.root = Path(root)

    def count(self, verdict: Optional[str] = None) -> int:
        if verdict:
            d = self.root / verdict
            return len(list(d.glob("sample_*"))) if d.exists() else 0
        return sum(self.count(v) for v in VALID)

    def add_sample(
        self,
        verdict: str,
        image: Optional[np.ndarray] = None,
        clip_url: Optional[str] = None,
        auto_verdict: Optional[str] = None,
        confidence: Optional[float] = None,
        meta: Optional[dict] = None,
    ) -> str:
        """Archive un échantillon. Retourne le dossier créé."""
        if verdict not in VALID:
            raise ValueError(f"Verdict invalide : {verdict!r}")
        vdir = self.root / verdict
        vdir.mkdir(parents=True, exist_ok=True)
        idx = len(list(vdir.glob("sample_*")))
        sdir = vdir / f"sample_{idx:05d}"
        sdir.mkdir(parents=True, exist_ok=True)

        if image is not None and cv2 is not None:
            cv2.imwrite(str(sdir / "frame.jpg"), image)

        payload = {
            "verdict": verdict,
            "auto_verdict": auto_verdict,
            "confidence": confidence,
            "clip_url": clip_url,
            "meta": meta or {},
        }
        (sdir / "label.json").write_text(
            json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        return str(sdir)

    def list_samples(self) -> List[dict]:
        out: List[dict] = []
        for v in VALID:
            for sdir in sorted((self.root / v).glob("sample_*")) \
                    if (self.root / v).exists() else []:
                try:
                    out.append(json.loads((sdir / "label.json").read_text()))
                except Exception:  # noqa: BLE001
                    pass
        return out
