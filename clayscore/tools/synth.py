"""Synthétiseur de plateaux d'argile — vérité terrain connue (jalon 0).

Génère, de façon DÉTERMINISTE (graine fixée), un triplet par scénario :
    - <prefix>.mp4   : la vidéo (plateau orange sur fond varié + trajectoire
                       balistique + explosion en fragments selon le scénario)
    - <prefix>.wav   : le son synchronisé (coup(s) de feu selon le scénario)
    - <prefix>.json  : l'annotation image-par-image + événements + verdict réel

Ces triplets servent de jeu de test annoté AUTOMATIQUEMENT : puisqu'on connaît
la vérité (position exacte du plateau, instant du lancement, du coup de feu, du
bris), on peut mesurer la précision des jalons suivants (détection, audio,
verdicts) en chiffres, sans annotation manuelle.

Scénarios (cohérents avec les règles métier ClayScore) :
    casse   : le tireur fait feu, le plateau explose APRÈS le coup → CASSÉ.
    manque  : le tireur fait feu mais rate, le plateau poursuit sa trajectoire
              intacte jusqu'à sortir du cadre → MANQUÉ.
    nobird  : le plateau part déjà cassé du lanceur, AVANT tout coup de feu
              (fragments dès le lancement, aucun disque propre) → NO BIRD.

Fonds : ciel | foret | contrejour.

Usage CLI :
    python -m tools.synth --scenario casse --background ciel \
        --out data/samples/casse_ciel --seed 42
    python -m tools.synth --make-reference-set --outdir data/samples
"""
from __future__ import annotations

import argparse
import json
import math
import wave
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import cv2
import numpy as np

SCENARIOS = ("casse", "manque", "nobird")
BACKGROUNDS = ("ciel", "foret", "contrejour")

# Correspondance scénario -> verdict réel attendu (vérité terrain).
VERDICT_BY_SCENARIO = {
    "casse": "casse",
    "manque": "manque",
    "nobird": "nobird",
}


# --------------------------------------------------------------------------- #
# Paramètres de génération
# --------------------------------------------------------------------------- #
@dataclass
class SynthParams:
    scenario: str = "casse"
    background: str = "ciel"
    width: int = 640
    height: int = 480
    fps: float = 30.0
    duration_s: float = 2.5
    seed: int = 0
    sample_rate: int = 22050

    def __post_init__(self):
        if self.scenario not in SCENARIOS:
            raise ValueError(
                f"Scénario inconnu : {self.scenario!r} (attendu : {SCENARIOS})"
            )
        if self.background not in BACKGROUNDS:
            raise ValueError(
                f"Fond inconnu : {self.background!r} (attendu : {BACKGROUNDS})"
            )

    @property
    def n_frames(self) -> int:
        return int(round(self.duration_s * self.fps))


# --------------------------------------------------------------------------- #
# États image-par-image (vérité terrain)
# --------------------------------------------------------------------------- #
@dataclass
class ClayState:
    x: float
    y: float
    r: float
    visible: bool


@dataclass
class FragState:
    x: float
    y: float
    r: float
    alpha: float  # 0..1 (opacité restante)


@dataclass
class FrameState:
    i: int
    clay: Optional[ClayState]
    frags: List[FragState] = field(default_factory=list)


@dataclass
class Events:
    launch_frame: int
    gunshot_frame: Optional[int]
    break_frame: Optional[int]
    verdict: str


@dataclass
class Scenario:
    params: SynthParams
    frames: List[FrameState]
    events: Events


# --------------------------------------------------------------------------- #
# Simulation physique (déterministe)
# --------------------------------------------------------------------------- #
def _make_fragments(
    rng: np.random.Generator,
    origin: Tuple[float, float],
    inherit_v: Tuple[float, float],
    birth_frame: int,
    fps: float,
    g: float,
    n: int,
) -> List[dict]:
    """Crée n fragments partant de `origin` avec une vitesse radiale + héritée."""
    frags = []
    for _ in range(n):
        ang = rng.uniform(0, 2 * math.pi)
        # Éclats rapides : ils se séparent nettement dès la 1re trame après le bris
        # (un plateau cassé projette une gerbe d'éclats bien visible).
        speed = rng.uniform(90.0, 230.0)
        vx = inherit_v[0] * 0.4 + math.cos(ang) * speed
        vy = inherit_v[1] * 0.4 + math.sin(ang) * speed
        frags.append(
            {
                "x0": origin[0],
                "y0": origin[1],
                "vx": vx,
                "vy": vy,
                "r0": rng.uniform(3.5, 7.5),
                "birth": birth_frame,
                "life": rng.uniform(0.40, 0.75),  # secondes
                "g": g,
            }
        )
    return frags


def simulate(params: SynthParams) -> Scenario:
    """Calcule la trajectoire, les événements et l'annotation (sans rendu)."""
    rng = np.random.default_rng(params.seed)
    W, H, fps = params.width, params.height, params.fps

    # Balistique en pixels/seconde (voir CLAUDE.md — apex ~milieu de cadre).
    trap = (0.12 * W, 0.88 * H)
    g = 1.2 * H
    vx = 0.60 * W
    vy = -1.23 * H
    r0 = max(6.0, 0.02 * H)  # rayon du plateau (px)

    launch_frame = int(round(0.30 * fps))

    if params.scenario == "casse":
        gunshot_frame: Optional[int] = launch_frame + int(round(0.40 * fps))
        break_frame: Optional[int] = gunshot_frame + 1  # balle quasi instantanée
    elif params.scenario == "manque":
        gunshot_frame = launch_frame + int(round(0.40 * fps))
        break_frame = None
    else:  # nobird : cassé au départ, avant tout coup de feu
        gunshot_frame = None
        break_frame = launch_frame

    def clay_pos(t: float) -> Tuple[float, float]:
        x = trap[0] + vx * t
        y = trap[1] + vy * t + 0.5 * g * t * t
        return x, y

    # Fragments : créés à l'instant de bris (break_frame).
    fragments: List[dict] = []
    if break_frame is not None:
        t_break = (break_frame - launch_frame) / fps
        bx, by = clay_pos(max(t_break, 0.0))
        vbx = vx
        vby = vy + g * max(t_break, 0.0)
        n_frag = int(rng.integers(16, 24))
        fragments = _make_fragments(
            rng, (bx, by), (vbx, vby), break_frame, fps, g, n_frag
        )

    frames: List[FrameState] = []
    for i in range(params.n_frames):
        clay: Optional[ClayState] = None
        # Le plateau existe entre le lancement et le bris (ou la sortie de cadre).
        if i >= launch_frame and (break_frame is None or i < break_frame):
            t = (i - launch_frame) / fps
            x, y = clay_pos(t)
            margin = r0 + 4
            visible = (-margin <= x <= W + margin) and (-margin <= y <= H + margin)
            if visible:
                clay = ClayState(x=x, y=y, r=r0, visible=True)

        # Fragments actifs à cette image.
        frags_now: List[FragState] = []
        for fr in fragments:
            if i < fr["birth"]:
                continue
            tf = (i - fr["birth"]) / fps
            if tf > fr["life"]:
                continue
            fx = fr["x0"] + fr["vx"] * tf
            fy = fr["y0"] + fr["vy"] * tf + 0.5 * fr["g"] * tf * tf
            alpha = max(0.0, 1.0 - tf / fr["life"])
            rr = fr["r0"] * (0.6 + 0.4 * alpha)
            frags_now.append(FragState(x=fx, y=fy, r=rr, alpha=alpha))

        frames.append(FrameState(i=i, clay=clay, frags=frags_now))

    events = Events(
        launch_frame=launch_frame,
        gunshot_frame=gunshot_frame,
        break_frame=break_frame,
        verdict=VERDICT_BY_SCENARIO[params.scenario],
    )
    return Scenario(params=params, frames=frames, events=events)


# --------------------------------------------------------------------------- #
# Rendu vidéo
# --------------------------------------------------------------------------- #
def _make_background(params: SynthParams, rng: np.random.Generator) -> np.ndarray:
    """Génère un fond statique BGR selon le type demandé."""
    W, H = params.width, params.height
    img = np.zeros((H, W, 3), dtype=np.float32)
    yy = np.linspace(0.0, 1.0, H).reshape(H, 1)

    if params.background == "ciel":
        # Dégradé bleu (haut) vers bleu clair (bas), quelques nuages diffus.
        top = np.array([200, 130, 70], dtype=np.float32)     # BGR bleu
        bot = np.array([235, 200, 150], dtype=np.float32)    # bleu pâle
        img[:] = top * (1 - yy[..., None]) + bot * yy[..., None]
        for _ in range(rng.integers(3, 6)):
            cx = int(rng.uniform(0, W))
            cy = int(rng.uniform(0, H * 0.6))
            ax = int(rng.uniform(W * 0.08, W * 0.22))
            ay = int(rng.uniform(H * 0.03, H * 0.08))
            cloud = np.zeros((H, W, 3), dtype=np.float32)
            cv2.ellipse(cloud, (cx, cy), (ax, ay), 0, 0, 360, (250, 250, 250), -1)
            cloud = cv2.GaussianBlur(cloud, (0, 0), sigmaX=ax * 0.4)
            img = np.clip(img + cloud * 0.5, 0, 255)

    elif params.background == "foret":
        # Vert texturé + quelques troncs sombres verticaux.
        base = np.array([40, 90, 40], dtype=np.float32)  # BGR vert
        img[:] = base
        noise = rng.normal(0, 22, (H, W, 1)).astype(np.float32)
        img = np.clip(img + noise, 0, 255)
        for _ in range(rng.integers(4, 8)):
            tx = int(rng.uniform(0, W))
            tw = int(rng.uniform(W * 0.01, W * 0.03))
            cv2.rectangle(img, (tx, 0), (tx + tw, H), (25, 45, 60), -1)
        img = cv2.GaussianBlur(img, (3, 3), 0)

    else:  # contrejour : haut lumineux (éblouissement), bas sombre, faible contraste
        top = np.array([245, 240, 235], dtype=np.float32)
        bot = np.array([60, 55, 50], dtype=np.float32)
        img[:] = top * (1 - yy[..., None]) + bot * yy[..., None]

    return np.clip(img, 0, 255).astype(np.uint8)


def _draw_clay(img: np.ndarray, clay: ClayState) -> None:
    """Dessine un plateau (disque orange avec liseré sombre + reflet)."""
    c = (int(round(clay.x)), int(round(clay.y)))
    r = int(round(clay.r))
    if r < 1:
        return
    cv2.circle(img, c, r + 1, (20, 40, 90), -1)        # liseré sombre
    cv2.circle(img, c, r, (30, 120, 235), -1)          # orange (BGR)
    hi = (c[0] - r // 3, c[1] - r // 3)
    cv2.circle(img, hi, max(1, r // 4), (120, 190, 255), -1)  # reflet


def _draw_fragments(img: np.ndarray, frags: List[FragState]) -> None:
    """Dessine les fragments (petits éclats orange, fondu par alpha)."""
    for fr in frags:
        c = (int(round(fr.x)), int(round(fr.y)))
        r = max(1, int(round(fr.r)))
        color = np.array([30, 110, 220], dtype=np.float32)
        x0, x1 = max(0, c[0] - r), min(img.shape[1], c[0] + r + 1)
        y0, y1 = max(0, c[1] - r), min(img.shape[0], c[1] + r + 1)
        if x0 >= x1 or y0 >= y1:
            continue
        roi = img[y0:y1, x0:x1].astype(np.float32)
        blended = roi * (1 - fr.alpha) + color * fr.alpha
        img[y0:y1, x0:x1] = np.clip(blended, 0, 255).astype(np.uint8)


def render_frames(scenario: Scenario) -> List[np.ndarray]:
    """Produit la liste des images BGR (avec bruit capteur léger)."""
    params = scenario.params
    rng = np.random.default_rng(params.seed + 777)
    bg = _make_background(params, np.random.default_rng(params.seed + 1))
    images: List[np.ndarray] = []
    for st in scenario.frames:
        img = bg.copy()
        # Bruit capteur léger (rend la détection réaliste, n'affecte pas la vérité).
        noise = rng.normal(0, 3.0, img.shape).astype(np.float32)
        img = np.clip(img.astype(np.float32) + noise, 0, 255).astype(np.uint8)
        if st.clay is not None:
            _draw_clay(img, st.clay)
        if st.frags:
            _draw_fragments(img, st.frags)
        images.append(img)
    return images


# --------------------------------------------------------------------------- #
# Rendu audio
# --------------------------------------------------------------------------- #
def render_audio(scenario: Scenario) -> np.ndarray:
    """Produit le signal mono float32 [-1,1] synchronisé avec la vidéo."""
    params = scenario.params
    sr = params.sample_rate
    n = int(round(params.duration_s * sr))
    rng = np.random.default_rng(params.seed + 55)

    # Ambiance : léger souffle.
    audio = rng.normal(0, 0.008, n).astype(np.float32)

    def add_gunshot(center_frame: int) -> None:
        t0 = center_frame / params.fps
        s0 = int(t0 * sr)
        dur = int(0.30 * sr)
        idx = np.arange(dur)
        tt = idx / sr
        # Claquement : bruit blanc à attaque rapide, décroissance exponentielle.
        crack = rng.normal(0, 1.0, dur).astype(np.float32) * np.exp(-tt / 0.045)
        # Détonation grave : sinus ~110 Hz amorti.
        thump = 0.5 * np.sin(2 * math.pi * 110 * tt) * np.exp(-tt / 0.10)
        burst = 0.9 * crack + thump
        e = min(s0 + dur, n)
        if s0 < n:
            audio[s0:e] += burst[: e - s0]

    if scenario.events.gunshot_frame is not None:
        add_gunshot(scenario.events.gunshot_frame)

    return np.clip(audio, -1.0, 1.0).astype(np.float32)


# --------------------------------------------------------------------------- #
# Écriture des fichiers
# --------------------------------------------------------------------------- #
def write_video(path: str, images: List[np.ndarray], fps: float) -> None:
    if not images:
        raise ValueError("Aucune image à écrire.")
    h, w = images[0].shape[:2]
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(str(path), fourcc, fps, (w, h))
    if not writer.isOpened():
        raise RuntimeError(f"Impossible d'ouvrir le VideoWriter pour {path}")
    try:
        for img in images:
            writer.write(img)
    finally:
        writer.release()


def write_wav(path: str, audio: np.ndarray, sample_rate: int) -> None:
    pcm = np.clip(audio, -1.0, 1.0)
    pcm = (pcm * 32767.0).astype(np.int16)
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(pcm.tobytes())


def annotation_dict(scenario: Scenario) -> Dict:
    """Sérialise la vérité terrain en dictionnaire JSON-compatible."""
    p = scenario.params
    ev = scenario.events
    frames = []
    for st in scenario.frames:
        clay = None
        if st.clay is not None:
            clay = {
                "x": round(st.clay.x, 2),
                "y": round(st.clay.y, 2),
                "r": round(st.clay.r, 2),
                "visible": st.clay.visible,
            }
        frames.append(
            {
                "i": st.i,
                "clay": clay,
                "n_frags": len(st.frags),
                "frags": [
                    {"x": round(f.x, 1), "y": round(f.y, 1),
                     "r": round(f.r, 1), "alpha": round(f.alpha, 3)}
                    for f in st.frags
                ],
            }
        )
    return {
        "meta": {
            "scenario": p.scenario,
            "background": p.background,
            "width": p.width,
            "height": p.height,
            "fps": p.fps,
            "duration_s": p.duration_s,
            "n_frames": p.n_frames,
            "sample_rate": p.sample_rate,
            "seed": p.seed,
        },
        "events": {
            "launch_frame": ev.launch_frame,
            "gunshot_frame": ev.gunshot_frame,
            "break_frame": ev.break_frame,
        },
        "verdict_truth": ev.verdict,
        "frames": frames,
    }


def write_annotation(path: str, scenario: Scenario) -> None:
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(annotation_dict(scenario), fh, ensure_ascii=False, indent=2)


# --------------------------------------------------------------------------- #
# Orchestration
# --------------------------------------------------------------------------- #
def generate(params: SynthParams, out_prefix: str) -> Dict[str, str]:
    """Génère le triplet (mp4 + wav + json) pour un scénario donné.

    Retourne les chemins écrits.
    """
    out = Path(out_prefix)
    out.parent.mkdir(parents=True, exist_ok=True)
    scenario = simulate(params)
    images = render_frames(scenario)
    audio = render_audio(scenario)

    mp4 = f"{out}.mp4"
    wav = f"{out}.wav"
    js = f"{out}.json"
    write_video(mp4, images, params.fps)
    write_wav(wav, audio, params.sample_rate)
    write_annotation(js, scenario)
    return {"video": mp4, "audio": wav, "annotation": js}


# Les 3 clips de référence du jalon 0 (un par scénario, fonds variés).
REFERENCE_SET = [
    ("casse", "ciel", 42),
    ("manque", "foret", 43),
    ("nobird", "contrejour", 44),
]


def make_reference_set(outdir: str) -> Dict[str, Dict[str, str]]:
    """Génère les 3 vidéos synthétiques de référence + un manifeste."""
    outdir_p = Path(outdir)
    outdir_p.mkdir(parents=True, exist_ok=True)
    manifest: Dict[str, Dict[str, str]] = {}
    for scenario, background, seed in REFERENCE_SET:
        name = f"{scenario}_{background}"
        params = SynthParams(scenario=scenario, background=background, seed=seed)
        paths = generate(params, str(outdir_p / name))
        manifest[name] = paths
    with open(outdir_p / "manifest.json", "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, ensure_ascii=False, indent=2)
    return manifest


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="Synthétiseur de plateaux d'argile (vérité terrain)."
    )
    p.add_argument("--scenario", choices=SCENARIOS, default="casse")
    p.add_argument("--background", choices=BACKGROUNDS, default="ciel")
    p.add_argument("--out", default="data/samples/sortie",
                   help="Préfixe de sortie (sans extension).")
    p.add_argument("--width", type=int, default=640)
    p.add_argument("--height", type=int, default=480)
    p.add_argument("--fps", type=float, default=30.0)
    p.add_argument("--duration", type=float, default=2.5)
    p.add_argument("--seed", type=int, default=0)
    p.add_argument("--make-reference-set", action="store_true",
                   help="Génère les 3 clips de référence dans --outdir.")
    p.add_argument("--outdir", default="data/samples")
    return p


def main(argv: Optional[List[str]] = None) -> int:
    args = _build_parser().parse_args(argv)
    if args.make_reference_set:
        manifest = make_reference_set(args.outdir)
        print(f"{len(manifest)} clips de référence générés dans {args.outdir} :")
        for name, paths in manifest.items():
            print(f"  - {name}: {paths['video']}")
        return 0

    params = SynthParams(
        scenario=args.scenario,
        background=args.background,
        width=args.width,
        height=args.height,
        fps=args.fps,
        duration_s=args.duration,
        seed=args.seed,
    )
    paths = generate(params, args.out)
    print("Généré :")
    for k, v in paths.items():
        print(f"  {k}: {v}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
