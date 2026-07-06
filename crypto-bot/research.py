"""Recherche de stratégie sur DONNÉES RÉELLES Binance (bougies publiques).

Objectif : comparer honnêtement toutes les stratégies candidates sur les vraies
bougies de plusieurs cryptos et plusieurs horizons, et désigner un GAGNANT
MESURÉ (jamais estimé). À lancer depuis la CI (le sandbox local n'a pas
le réseau) : `python3 research.py`.

- Données : endpoint PUBLIC /api/v3/klines (aucune clé requise, lecture seule).
- Moteur : mêmes règles que backtest.py (stop ATR intra-bougie, frais 0.1%,
  taille de position via RiskManager, cash borné).
- Sortie : tableau par stratégie (moyenne sur tous les marchés testés) +
  détail par marché + ligne machine `WINNER=<nom>` pour le workflow.

⚠️ Passé ≠ futur. Un gagnant au backtest n'est PAS une garantie — c'est un
   filtre pour éliminer les perdantes. Validation finale = testnet.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.request

from config import Config
from risk import RiskManager
from strategy import DipUptrendStrategy, MeanReversionStrategy, Strategy

FEE = 0.001
BASE = os.getenv("KLINES_BASE", "https://api.binance.com")


def fetch_klines(symbol: str, interval: str, total: int = 3000):
    """Bougies réelles Binance (public). Renvoie (highs, lows, closes) ou None."""
    highs, lows, closes = [], [], []
    end = None
    try:
        while len(closes) < total:
            limit = min(1000, total - len(closes))
            url = (f"{BASE}/api/v3/klines?symbol={symbol}&interval={interval}"
                   f"&limit={limit}" + (f"&endTime={end}" if end else ""))
            with urllib.request.urlopen(url, timeout=20) as r:
                rows = json.loads(r.read().decode())
            if not rows:
                break
            batch_h = [float(x[2]) for x in rows]
            batch_l = [float(x[3]) for x in rows]
            batch_c = [float(x[4]) for x in rows]
            highs = batch_h + highs
            lows = batch_l + lows
            closes = batch_c + closes
            end = rows[0][0] - 1  # page précédente
            if len(rows) < limit:
                break
    except Exception as exc:  # noqa: BLE001 — cause exacte loggée, pas de crash
        print(f"⚠️ fetch {symbol} {interval} : {type(exc).__name__}: {exc}")
        return None
    if len(closes) < 300:
        print(f"⚠️ {symbol} {interval} : seulement {len(closes)} bougies — ignoré")
        return None
    return highs, lows, closes


def run_engine(strat, highs, lows, closes, risk) -> dict:
    """Moteur commun (identique en esprit à backtest.py)."""
    cash, base, entry, stop = 1000.0, 0.0, 0.0, 0.0
    peak, maxdd, trades, wins = 1000.0, 0.0, 0, 0
    start = strat.min_candles()
    for t in range(start, len(closes)):
        price = closes[t]
        in_pos = base > 0
        if in_pos and lows[t] <= stop:
            cash += base * stop * (1 - FEE)
            wins += 1 if stop > entry else 0
            trades += 1
            base = 0.0
            in_pos = False
        sig = strat.evaluate(highs[:t + 1], lows[:t + 1], closes[:t + 1], in_pos)
        if sig.action == "BUY" and sig.atr and not in_pos:
            stop = risk.compute_stop(price, sig.atr)
            qty = risk.position_size(cash + base * price, price, stop, cash=cash)
            cost = qty * price * (1 + FEE)
            if qty > 0 and cost <= cash:
                cash -= cost
                base += qty
                entry = price
        elif sig.action == "SELL" and in_pos:
            cash += base * price * (1 - FEE)
            wins += 1 if price > entry else 0
            trades += 1
            base = 0.0
        eq = cash + base * price
        peak = max(peak, eq)
        maxdd = min(maxdd, (eq - peak) / peak)
    final = cash + base * closes[-1]
    return {
        "ret": (final / 1000.0 - 1) * 100,
        "trades": trades,
        "win": (wins / trades * 100) if trades else 0.0,
        "maxdd": maxdd * 100,
        "bh": (closes[-1] / closes[start] - 1) * 100,
    }


def candidates():
    """Toutes les stratégies candidates (nom court -> instance)."""
    return {
        "ema_8_21": Strategy(8, 21, 14, 78.0, 14),
        "ema_12_26": Strategy(12, 26, 14, 70.0, 14),
        "ema_5_13": Strategy(5, 13, 14, 78.0, 14),
        "meanrev_20_2.0": MeanReversionStrategy(20, 2.0, 14, 35.0, 60.0, 14),
        "dipup_50_35_60": DipUptrendStrategy(50, 14, 35.0, 60.0, 14),
        "dipup_50_40_65": DipUptrendStrategy(50, 14, 40.0, 65.0, 14),
        "dipup_100_35_60": DipUptrendStrategy(100, 14, 35.0, 60.0, 14),
        "dipup_50_45_70": DipUptrendStrategy(50, 14, 45.0, 70.0, 14),
    }


def main() -> None:
    os.environ.setdefault("BINANCE_API_KEY", "k")
    os.environ.setdefault("BINANCE_API_SECRET", "s")
    os.environ.setdefault("SYMBOLS", "BTC/USDT")
    cfg = Config.load()
    risk = RiskManager(cfg)

    symbols = (os.getenv("RESEARCH_SYMBOLS")
               or "BTCUSDT,ETHUSDT,SOLUSDT,BNBUSDT,XRPUSDT").split(",")
    intervals = (os.getenv("RESEARCH_INTERVALS") or "5m,1h").split(",")

    markets = {}
    for s in symbols:
        for iv in intervals:
            data = fetch_klines(s.strip(), iv.strip())
            if data:
                markets[f"{s.strip()}@{iv.strip()}"] = data
    if not markets:
        print("::error::Aucune donnée réelle récupérée — voir erreurs ci-dessus.")
        sys.exit(1)
    print(f"Marchés testés : {len(markets)} → {', '.join(markets)}")

    totals = {}   # strat -> liste de résultats
    for mname, (H, L, C) in markets.items():
        print(f"\n── {mname} ({len(C)} bougies) ── buy&hold repère inclus")
        print(f"{'stratégie':<20}{'ret%':>8}{'trades':>7}{'win%':>7}{'maxDD%':>8}")
        for name, strat in candidates().items():
            r = run_engine(strat, H, L, C, risk)
            totals.setdefault(name, []).append(r)
            print(f"{name:<20}{r['ret']:>+8.2f}{r['trades']:>7}{r['win']:>7.1f}{r['maxdd']:>8.2f}")
        print(f"{'(buy & hold)':<20}{r['bh']:>+8.2f}")

    print("\n══ MOYENNE SUR TOUS LES MARCHÉS RÉELS ══")
    print(f"{'stratégie':<20}{'ret% moy':>9}{'pire ret%':>10}{'trades moy':>11}{'maxDD moy':>10}")
    board = []
    for name, rs in totals.items():
        avg = sum(r["ret"] for r in rs) / len(rs)
        worst = min(r["ret"] for r in rs)
        tr = sum(r["trades"] for r in rs) / len(rs)
        dd = sum(r["maxdd"] for r in rs) / len(rs)
        board.append((avg, worst, name))
        print(f"{name:<20}{avg:>+9.2f}{worst:>+10.2f}{tr:>11.1f}{dd:>10.2f}")

    # Gagnant = meilleure moyenne, départage par la pire perte (robustesse).
    board.sort(key=lambda x: (x[0], x[1]), reverse=True)
    print(f"\nWINNER={board[0][2]}")
    print(f"WINNER_AVG={board[0][0]:+.2f}%")


if __name__ == "__main__":
    main()
