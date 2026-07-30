"""Habillage d'un clip pour la vidéo de démonstration (jalon 5).

Prend un clip (mp4) + le verdict et écrit un ralenti habillé (trajectoire +
badge). Utile pour préparer les plans « double écran » de la vidéo.

Exemples :
  python -m tools.overlay --clip data/samples/casse_ciel.mp4 --verdict casse \
      --out data/out/casse_overlay.mp4 --slowmo 4
  # ou générer un clip habillé directement depuis un scénario :
  python -m tools.overlay --scenario casse --background ciel --out data/out/demo.mp4 --slowmo 4
"""
from __future__ import annotations

import argparse
from pathlib import Path
from typing import List, Optional

from clayscore.replay import render_overlay_clip, render_overlay_from_file
from clayscore.sources.audio_file import read_wav_mono
from clayscore.sources.video_file import FileVideoSource
from clayscore.vision.verdict import decide_verdict
from tools import synth


def main(argv: Optional[List[str]] = None) -> int:
    ap = argparse.ArgumentParser(description="Habillage ralenti ClayScore.")
    ap.add_argument("--clip", help="Clip mp4 à habiller.")
    ap.add_argument("--verdict", choices=["casse", "manque", "nobird", "ambigu"],
                    help="Verdict à afficher (auto-détecté si --scenario).")
    ap.add_argument("--scenario", choices=list(synth.SCENARIOS),
                    help="Génère un clip depuis ce scénario au lieu de --clip.")
    ap.add_argument("--background", choices=list(synth.BACKGROUNDS), default="ciel")
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--out", default="data/out/overlay.mp4")
    ap.add_argument("--slowmo", type=float, default=4.0)
    args = ap.parse_args(argv)

    Path(args.out).parent.mkdir(parents=True, exist_ok=True)

    if args.scenario:
        # Génère un clip + détecte le verdict, puis habille.
        params = synth.SynthParams(scenario=args.scenario,
                                   background=args.background, seed=args.seed)
        tmp = Path(args.out).with_suffix("")
        paths = synth.generate(params, str(tmp))
        data, sr = read_wav_mono(paths["audio"])
        res = decide_verdict(FileVideoSource(paths["video"]), data, sr)
        verdict = args.verdict or res.best_guess
        out = render_overlay_from_file(paths["video"], args.out, verdict,
                                       slowmo=args.slowmo)
    else:
        if not args.clip or not args.verdict:
            ap.error("--clip ET --verdict requis (ou utilisez --scenario).")
        out = render_overlay_from_file(args.clip, args.out, args.verdict,
                                       slowmo=args.slowmo)
    print(f"Ralenti habillé -> {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
