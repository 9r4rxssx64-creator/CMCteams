"""Bancs de mesure de précision (chiffrés) sur jeux synthétiques.

Puisque le synthétiseur connaît la vérité terrain, on mesure objectivement :
  - jalon 1 : précision du comptage des lancements
  - jalon 2 : précision de la détection des coups de feu
  - jalon 3 : précision des verdicts (cassé/manqué/no-bird)

Usage :
    python -m tools.bench --launches
    python -m tools.bench --gunshots
    python -m tools.bench --verdicts
    python -m tools.bench --all
"""
from __future__ import annotations

import argparse
import os
import tempfile
from dataclasses import dataclass
from itertools import product
from typing import List, Optional, Tuple

from tools import synth


@dataclass
class BenchResult:
    name: str
    correct: int
    total: int
    failures: List[str]

    @property
    def accuracy(self) -> float:
        return self.correct / self.total if self.total else 0.0

    def summary(self) -> str:
        return (f"{self.name}: {self.correct}/{self.total} = "
                f"{self.accuracy:.3f}")


def _grid(seeds: Tuple[int, ...]) -> List[Tuple[str, str, int]]:
    return [
        (scen, bg, seed)
        for scen, bg, seed in product(synth.SCENARIOS, synth.BACKGROUNDS, seeds)
    ]


def bench_launches(seeds: Tuple[int, ...] = (100, 101, 102),
                   width: int = 240, height: int = 180) -> BenchResult:
    from clayscore.sources.video_file import FileVideoSource
    from clayscore.vision.detector import count_launches

    correct, failures = 0, []
    with tempfile.TemporaryDirectory() as tmp:
        cases = _grid(seeds)
        for scen, bg, seed in cases:
            p = synth.SynthParams(scenario=scen, background=bg,
                                  width=width, height=height,
                                  duration_s=2.0, seed=seed)
            paths = synth.generate(p, os.path.join(tmp, f"{scen}_{bg}_{seed}"))
            evs = count_launches(FileVideoSource(paths["video"]))
            if len(evs) == 1:
                correct += 1
            else:
                failures.append(f"{scen}/{bg}/{seed}: {len(evs)} lancements")
        return BenchResult("launches", correct, len(cases), failures)


def bench_gunshots(seeds: Tuple[int, ...] = (100, 101, 102)) -> BenchResult:
    """Un coup de feu attendu pour casse/manque, zéro pour nobird."""
    from clayscore.audio.gunshot import detect_gunshots
    from clayscore.sources.audio_file import read_wav_mono

    correct, failures = 0, []
    with tempfile.TemporaryDirectory() as tmp:
        cases = _grid(seeds)
        for scen, bg, seed in cases:
            p = synth.SynthParams(scenario=scen, background=bg,
                                  width=160, height=120, duration_s=2.0, seed=seed)
            paths = synth.generate(p, os.path.join(tmp, f"{scen}_{bg}_{seed}"))
            data, sr = read_wav_mono(paths["audio"])
            shots = detect_gunshots(data, sr)
            expected = 0 if scen == "nobird" else 1
            if len(shots) == expected:
                correct += 1
            else:
                failures.append(
                    f"{scen}/{bg}/{seed}: {len(shots)} coups (attendu {expected})")
        return BenchResult("gunshots", correct, len(cases), failures)


def bench_verdicts(seeds: Tuple[int, ...] = (100, 101, 102)) -> BenchResult:
    from clayscore.sources.audio_file import read_wav_mono
    from clayscore.sources.video_file import FileVideoSource
    from clayscore.vision.verdict import decide_verdict

    correct, failures = 0, []
    with tempfile.TemporaryDirectory() as tmp:
        cases = _grid(seeds)
        for scen, bg, seed in cases:
            p = synth.SynthParams(scenario=scen, background=bg,
                                  width=240, height=180, duration_s=2.0, seed=seed)
            paths = synth.generate(p, os.path.join(tmp, f"{scen}_{bg}_{seed}"))
            data, sr = read_wav_mono(paths["audio"])
            result = decide_verdict(FileVideoSource(paths["video"]), data, sr)
            truth = synth.VERDICT_BY_SCENARIO[scen]
            if result.verdict == truth:
                correct += 1
            else:
                failures.append(
                    f"{scen}/{bg}/{seed}: {result.verdict} (attendu {truth}, "
                    f"conf={result.confidence:.2f})")
        return BenchResult("verdicts", correct, len(cases), failures)


def _print(result: BenchResult) -> None:
    print(result.summary())
    for f in result.failures[:20]:
        print("   ✗", f)


def main(argv: Optional[List[str]] = None) -> int:
    ap = argparse.ArgumentParser(description="Bancs de précision ClayScore.")
    ap.add_argument("--launches", action="store_true")
    ap.add_argument("--gunshots", action="store_true")
    ap.add_argument("--verdicts", action="store_true")
    ap.add_argument("--all", action="store_true")
    args = ap.parse_args(argv)
    run_all = args.all or not (args.launches or args.gunshots or args.verdicts)

    if args.launches or run_all:
        _print(bench_launches())
    if args.gunshots or run_all:
        _print(bench_gunshots())
    if args.verdicts or run_all:
        _print(bench_verdicts())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
