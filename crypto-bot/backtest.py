"""Backtest hors-ligne de la stratégie — pour MESURER avant de risquer.

Usage :
  python backtest.py                # données synthétiques (démo, reproductible)
  python backtest.py data.csv       # CSV réel : colonnes open,high,low,close

⚠️  Un bon backtest ne GARANTIT PAS le futur. C'est un filtre : une stratégie
    qui perd en backtest perdra probablement en réel. L'inverse n'est pas vrai.
"""
from __future__ import annotations

import csv
import random
import sys
from typing import List, Tuple

from config import Config
from risk import RiskManager
from strategy import Strategy

FEE = 0.001  # 0,1 % par ordre (approx. frais Binance spot)


def synthetic(n: int = 1500, seed: int = 42) -> Tuple[List[float], List[float], List[float]]:
    """Marche aléatoire avec un peu de tendance/volatilité (démo reproductible)."""
    rnd = random.Random(seed)
    price = 30000.0
    highs, lows, closes = [], [], []
    for _ in range(n):
        drift = 0.0002
        shock = rnd.gauss(0, 0.012)
        price = max(1.0, price * (1 + drift + shock))
        hi = price * (1 + abs(rnd.gauss(0, 0.004)))
        lo = price * (1 - abs(rnd.gauss(0, 0.004)))
        highs.append(hi)
        lows.append(lo)
        closes.append(price)
    return highs, lows, closes


def load_csv(path: str) -> Tuple[List[float], List[float], List[float]]:
    highs, lows, closes = [], [], []
    with open(path, newline="", encoding="utf-8") as fh:
        for row in csv.DictReader(fh):
            highs.append(float(row["high"]))
            lows.append(float(row["low"]))
            closes.append(float(row["close"]))
    return highs, lows, closes


def run(highs, lows, closes) -> dict:
    cfg = Config.load()          # pas besoin de clés API pour le backtest
    strat = Strategy(cfg.ema_fast, cfg.ema_slow, cfg.rsi_period,
                     cfg.rsi_max, cfg.atr_period)
    risk = RiskManager(cfg)

    cash = 1000.0
    base = 0.0
    entry = 0.0
    stop = 0.0
    peak = cash
    max_dd = 0.0
    trades = 0
    wins = 0
    start = strat.min_candles()

    for t in range(start, len(closes)):
        price = closes[t]
        h = highs[:t + 1]
        lo = lows[:t + 1]
        c = closes[:t + 1]
        in_pos = base > 0
        equity = cash + base * price

        # stop-loss intra-bougie
        if in_pos and lows[t] <= stop:
            proceeds = base * stop * (1 - FEE)
            cash += proceeds
            wins += 1 if stop > entry else 0
            trades += 1
            base = 0.0
            in_pos = False

        sig = strat.evaluate(h, lo, c, in_pos)
        if sig.action == "BUY" and sig.atr and not in_pos:
            stop = risk.compute_stop(price, sig.atr)
            qty = risk.position_size(equity, price, stop)
            cost = qty * price * (1 + FEE)
            if qty > 0 and cost <= cash:
                cash -= cost
                base += qty
                entry = price
        elif sig.action == "SELL" and in_pos:
            proceeds = base * price * (1 - FEE)
            cash += proceeds
            wins += 1 if price > entry else 0
            trades += 1
            base = 0.0

        equity = cash + base * price
        peak = max(peak, equity)
        if peak > 0:
            max_dd = min(max_dd, (equity - peak) / peak)

    final_price = closes[-1]
    final_equity = cash + base * final_price
    ret_pct = (final_equity / 1000.0 - 1) * 100
    bh_pct = (closes[-1] / closes[start] - 1) * 100  # buy & hold pour comparer
    return {
        "final_equity": final_equity,
        "return_pct": ret_pct,
        "buy_hold_pct": bh_pct,
        "trades": trades,
        "win_rate_pct": (wins / trades * 100) if trades else 0.0,
        "max_drawdown_pct": max_dd * 100,
        "candles": len(closes),
    }


def main() -> None:
    if len(sys.argv) > 1:
        highs, lows, closes = load_csv(sys.argv[1])
        src = sys.argv[1]
    else:
        highs, lows, closes = synthetic()
        src = "données synthétiques (démo)"

    r = run(highs, lows, closes)
    print("=" * 52)
    print(f"  BACKTEST — {src}")
    print("=" * 52)
    print(f"  Bougies analysées   : {r['candles']}")
    print(f"  Nombre de trades    : {r['trades']}")
    print(f"  Taux de réussite    : {r['win_rate_pct']:.1f} %")
    print(f"  Résultat stratégie  : {r['return_pct']:+.2f} %")
    print(f"  Buy & Hold (compar.): {r['buy_hold_pct']:+.2f} %")
    print(f"  Max drawdown        : {r['max_drawdown_pct']:.2f} %")
    print(f"  Capital final (base 1000) : {r['final_equity']:.2f}")
    print("=" * 52)
    print("  Rappel : passé ≠ futur. Valide ensuite en TESTNET.")


if __name__ == "__main__":
    main()
