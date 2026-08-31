"""Export du ralenti avec habillage incrusté (verdict + trajectoire).

Sert la vidéo de démonstration : à partir des images d'un plateau, produit un
mp4 « habillé » — trajectoire du plateau, marqueur de suivi, badge de verdict
(CASSÉ vert / MANQUÉ rouge / NO BIRD orange) — prêt pour les réseaux sociaux
(option ralenti). Les surimpressions sont GRAVÉES dans la vidéo (pas besoin
d'un logiciel de montage pour l'habillage de base).

Utilisé par le serveur (bouton « exporter le ralenti ») et par tools/overlay.py.
"""
from __future__ import annotations

from pathlib import Path
from typing import List, Optional, Tuple

import cv2
import numpy as np

from .sources.base import Frame
from .vision.detector import DetectorConfig, MotionDetector

_FONT = cv2.FONT_HERSHEY_SIMPLEX


def _find_ffmpeg() -> Optional[str]:
    """Chemin d'un ffmpeg utilisable (paquet imageio-ffmpeg, ou système)."""
    try:  # binaire portable fourni par imageio-ffmpeg (recommandé)
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:  # noqa: BLE001
        pass
    import shutil
    return shutil.which("ffmpeg")


def ensure_web_playable(path: str) -> bool:
    """Convertit un mp4 en H.264 pour qu'il se lise PARTOUT.

    OpenCV écrit du MPEG-4 Part 2 (FMP4), que les navigateurs et iOS ne lisent
    pas. On transcode donc en H.264 baseline + yuv420p + faststart : lisible
    dans l'appli tablette, sur iPhone, sur PC/Mac, sans rien installer.

    Ne lève jamais : si ffmpeg est absent, le fichier d'origine est conservé
    tel quel (lisible avec VLC/QuickTime) et la fonction renvoie False.
    """
    ff = _find_ffmpeg()
    if not ff:
        return False
    src = Path(path)
    if not src.exists():
        return False
    tmp = src.with_name(src.stem + "_h264.mp4")
    import subprocess
    try:
        res = subprocess.run(
            [ff, "-y", "-loglevel", "error", "-i", str(src),
             "-c:v", "libx264", "-profile:v", "baseline", "-level", "3.0",
             "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-crf", "20",
             str(tmp)],
            capture_output=True, timeout=120)
        if res.returncode == 0 and tmp.exists() and tmp.stat().st_size > 0:
            tmp.replace(src)
            return True
        if tmp.exists():
            tmp.unlink()
    except Exception:  # noqa: BLE001 - ne jamais bloquer le jeu pour un transcodage
        if tmp.exists():
            try:
                tmp.unlink()
            except Exception:  # noqa: BLE001
                pass
    return False

# Couleurs BGR + libellés + pictogramme. Le texte accenté est rendu via Pillow
# quand disponible ; sinon repli ASCII (cv2 ne gère pas les accents).
_STYLE = {
    "casse":  ((80, 200, 80),  "CASSÉ",      "CASSE",      "check"),
    "manque": ((60, 60, 230),  "MANQUÉ",     "MANQUE",     "cross"),
    "nobird": ((40, 170, 240), "NO BIRD",    "NO BIRD",    "repeat"),
    "ambigu": ((60, 200, 240), "À VÉRIFIER", "A VERIFIER", "quest"),
}

# Police TrueType pour le texte accenté (optionnelle, repli ASCII si absente).
_FONT_TTF_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]


def _pil_font(size: int):
    """Retourne une police Pillow accentuée, ou None si indisponible."""
    try:
        from PIL import ImageFont
    except Exception:  # noqa: BLE001 - Pillow absent
        return None
    import os
    for path in _FONT_TTF_CANDIDATES:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:  # noqa: BLE001
                continue
    return None


def _put_text_unicode(img, text: str, org, size: int, color_bgr) -> bool:
    """Écrit `text` (accents OK) via Pillow. Retourne False si indisponible."""
    font = _pil_font(size)
    if font is None:
        return False
    from PIL import Image, ImageDraw
    pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(pil)
    draw.text(org, text, font=font,
              fill=(color_bgr[2], color_bgr[1], color_bgr[0]))
    img[:, :, :] = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
    return True


def _clay_centroids(images: List[np.ndarray], fps: float,
                    det_cfg: DetectorConfig
                    ) -> List[Optional[Tuple[float, float, float]]]:
    """Suit le plateau (plus gros blob orange) image par image."""
    det = MotionDetector(det_cfg)
    if not images:
        return []
    H, W = images[0].shape[:2]
    noise_min = det_cfg.noise_area_min_frac * (W * H)
    out: List[Optional[Tuple[float, float, float]]] = []
    for i, img in enumerate(images):
        dets = det.process(Frame(i, i / fps, img))
        orange = [d for d in dets
                  if d.orange_ratio >= 0.10 and d.area >= noise_min]
        best = max(orange, key=lambda d: d.area) if orange else None
        out.append((best.cx, best.cy, best.radius) if best else None)
    return out


def _draw_symbol(img, kind: str, cx: int, cy: int, s: int) -> None:
    """Petit pictogramme du verdict (check/cross/repeat/quest)."""
    white = (255, 255, 255)
    if kind == "check":
        cv2.line(img, (cx - s, cy), (cx - s // 3, cy + s), white, 3, cv2.LINE_AA)
        cv2.line(img, (cx - s // 3, cy + s), (cx + s, cy - s), white, 3, cv2.LINE_AA)
    elif kind == "cross":
        cv2.line(img, (cx - s, cy - s), (cx + s, cy + s), white, 3, cv2.LINE_AA)
        cv2.line(img, (cx - s, cy + s), (cx + s, cy - s), white, 3, cv2.LINE_AA)
    elif kind == "repeat":
        cv2.circle(img, (cx, cy), s, white, 3, cv2.LINE_AA)
        cv2.line(img, (cx + s, cy), (cx + s - 5, cy - 6), white, 3, cv2.LINE_AA)
        cv2.line(img, (cx + s, cy), (cx + s + 5, cy - 6), white, 3, cv2.LINE_AA)
    else:  # quest
        cv2.putText(img, "?", (cx - s // 2, cy + s), _FONT, 1.0, white, 3, cv2.LINE_AA)


def _draw_badge(img, verdict: str) -> None:
    color, label_uni, label_ascii, sym = _STYLE.get(verdict, _STYLE["ambigu"])
    H, W = img.shape[:2]
    scale = max(0.7, W / 640.0)
    (tw, th), _ = cv2.getTextSize(label_ascii, _FONT, scale, 2)
    pad = int(14 * scale)
    sym_w = int(46 * scale)
    bw = tw + 2 * pad + sym_w
    bh = th + 2 * pad
    x = (W - bw) // 2
    y = int(12 * scale)
    overlay = img.copy()
    cv2.rectangle(overlay, (x, y), (x + bw, y + bh), color, -1)
    cv2.addWeighted(overlay, 0.85, img, 0.15, 0, img)
    _draw_symbol(img, sym, x + pad + sym_w // 2, y + bh // 2, int(10 * scale))
    # Texte accenté (Pillow) si possible, sinon repli ASCII (cv2).
    ok = _put_text_unicode(img, label_uni,
                           (x + pad + sym_w, y + int(pad * 0.4)),
                           int(30 * scale), (255, 255, 255))
    if not ok:
        cv2.putText(img, label_ascii, (x + pad + sym_w, y + pad + th),
                    _FONT, scale, (255, 255, 255), 2, cv2.LINE_AA)


def render_overlay_clip(
    images: List[np.ndarray],
    out_path: str,
    fps: float,
    verdict: str,
    reveal_frame: Optional[int] = None,
    slowmo: float = 1.0,
    det_cfg: Optional[DetectorConfig] = None,
    watermark: str = "ClayScore",
) -> str:
    """Écrit un mp4 habillé (trajectoire + marqueur + badge de verdict).

    `reveal_frame` : trame où le badge apparaît (défaut ~60 %). `slowmo` : > 1
    ralentit la lecture (fps de sortie = fps / slowmo).
    """
    if not images:
        raise ValueError("Aucune image à habiller.")
    det_cfg = det_cfg or DetectorConfig()
    H, W = images[0].shape[:2]
    centroids = _clay_centroids(images, fps, det_cfg)
    reveal = reveal_frame if reveal_frame is not None else int(len(images) * 0.6)

    out_fps = max(1.0, fps / max(slowmo, 1e-6))
    writer = cv2.VideoWriter(str(out_path), cv2.VideoWriter_fourcc(  # type: ignore[attr-defined]  # absent des stubs cv2, présent à l'exécution
            *"mp4v"),
                             out_fps, (W, H))
    if not writer.isOpened():
        raise RuntimeError(f"VideoWriter impossible pour {out_path}")

    traj: List[Tuple[int, int]] = []
    try:
        for i, img in enumerate(images):
            frame = img.copy()
            c = centroids[i]
            if c is not None:
                traj.append((int(c[0]), int(c[1])))
            if len(traj) >= 2:
                cv2.polylines(frame, [np.array(traj, np.int32)], False,
                              (0, 240, 240), 2, cv2.LINE_AA)
            if c is not None:
                cv2.circle(frame, (int(c[0]), int(c[1])), int(c[2]) + 5,
                           (255, 255, 0), 2, cv2.LINE_AA)
            if watermark:
                cv2.putText(frame, watermark, (8, H - 10), _FONT,
                            0.5 * max(1.0, W / 640.0), (255, 255, 255), 1, cv2.LINE_AA)
            if i >= reveal:
                _draw_badge(frame, verdict)
            writer.write(frame)
    finally:
        writer.release()
    # Rend le clip lisible partout (navigateur, iPhone) si ffmpeg est présent.
    ensure_web_playable(str(out_path))
    return str(out_path)


def render_overlay_from_file(
    video_path: str,
    out_path: str,
    verdict: str,
    reveal_frame: Optional[int] = None,
    slowmo: float = 1.0,
) -> str:
    """Variante lisant un clip mp4 déjà enregistré (ralenti du serveur)."""
    from .sources.video_file import FileVideoSource
    with FileVideoSource(video_path) as src:
        fps = src.fps
        images = [f.image for f in src]
    return render_overlay_clip(images, out_path, fps, verdict,
                               reveal_frame=reveal_frame, slowmo=slowmo)
