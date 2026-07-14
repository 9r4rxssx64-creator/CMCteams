"""Analyse expert des cryptos tradées par les bots — VRAIES données Binance.

Photo technique multi-horizons (1h / 4h / 1j) par crypto :
- prix, variation 24 h et 7 jours (mesurées sur les bougies, jamais estimées)
- notation façon TradingView (votes EMA 10/20/50/100/200 + RSI Wilder + MACD
  + Stochastique + CCI + Momentum) → Achat fort / Achat / Neutre / Vente / Vente forte
- volatilité (ATR14 en % du prix), support / résistance récents (30 jours)

Source : data-api.binance.vision (miroir public SANS clé — api.binance.com
renvoie HTTP 451 géo-bloqué depuis les runners GitHub US).
Aucune promesse de gains : c'est une photo du moment, pas une prédiction.

Usage : python3 crypto-bot/analysis.py [SYMBOLES]
  SYMBOLES optionnel, ex "BTC/USDT,ETH/USDT" — défaut : les 8 du bot principal.
Sortie : tableau lisible + lignes machine `ANALYSIS|coin|...` pour le récap.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.request

BASE = os.getenv("KLINES_BASE", "https://data-api.binance.vision")
DEFAULT_SYMBOLS = "BTC/USDT,ETH/USDT,SOL/USDT,BNB/USDT,XRP/USDT,ADA/USDT,DOGE/USDT,AVAX/USDT"


def fetch(symbol: str, interval: str, limit: int = 250):
    pair = symbol.replace("/", "")
    url = f"{BASE}/api/v3/klines?symbol={pair}&interval={interval}&limit={limit}"
    with urllib.request.urlopen(url, timeout=20) as r:
        k = json.load(r)
    highs = [float(x[2]) for x in k]
    lows = [float(x[3]) for x in k]
    closes = [float(x[4]) for x in k]
    return highs, lows, closes


def ema_series(v, p):
    k = 2 / (p + 1)
    out, e = [], v[0]
    for i, x in enumerate(v):
        e = x * k + e * (1 - k) if i else v[0]
        out.append(e)
    return out


def rsi_wilder(c, p=14):
    if len(c) < p + 2:
        return None
    g = l = 0.0
    for i in range(1, p + 1):
        d = c[i] - c[i - 1]
        g += max(d, 0)
        l += max(-d, 0)
    g /= p
    l /= p
    for i in range(p + 1, len(c)):
        d = c[i] - c[i - 1]
        g = (g * (p - 1) + max(d, 0)) / p
        l = (l * (p - 1) + max(-d, 0)) / p
    return 100.0 if l == 0 else 100 - 100 / (1 + g / l)


def stoch(h, l, c, p=14, dp=3):
    if len(c) < p + dp:
        return None
    ks = []
    for j in range(len(c) - dp, len(c)):
        hh, ll = max(h[j - p + 1: j + 1]), min(l[j - p + 1: j + 1])
        ks.append(50.0 if hh == ll else (c[j] - ll) / (hh - ll) * 100)
    return ks[-1], sum(ks) / len(ks)


def cci(h, l, c, p=20):
    if len(c) < p:
        return None
    tp = [(h[i] + l[i] + c[i]) / 3 for i in range(len(c))]
    win = tp[-p:]
    sma = sum(win) / p
    dev = sum(abs(x - sma) for x in win) / p
    return 0.0 if dev == 0 else (tp[-1] - sma) / (0.015 * dev)


def atr_pct(h, l, c, p=14):
    if len(c) < p + 1:
        return None
    trs = []
    for i in range(len(c) - p, len(c)):
        trs.append(max(h[i] - l[i], abs(h[i] - c[i - 1]), abs(l[i] - c[i - 1])))
    return (sum(trs) / p) / c[-1] * 100


def rating(h, l, c):
    """Même méthode que le worker /__bot/analysis (votes MM + oscillateurs)."""
    price = c[-1]
    ma_buy = ma_sell = osc_buy = osc_sell = osc_neu = 0
    for p in (10, 20, 50, 100, 200):
        if len(c) >= p:
            e = ema_series(c, p)[-1]
            if price > e:
                ma_buy += 1
            else:
                ma_sell += 1
    r = rsi_wilder(c)
    if r is not None:
        if r < 30:
            osc_buy += 1
        elif r > 70:
            osc_sell += 1
        else:
            osc_neu += 1
    e12, e26 = ema_series(c, 12), ema_series(c, 26)
    macd_s = [a - b for a, b in zip(e12, e26)]
    sig = ema_series(macd_s, 9)
    macd_up = macd_s[-1] > sig[-1]
    if macd_up:
        osc_buy += 1
    else:
        osc_sell += 1
    st = stoch(h, l, c)
    if st:
        k, d = st
        if k < 20 and k > d:
            osc_buy += 1
        elif k > 80 and k < d:
            osc_sell += 1
        else:
            osc_neu += 1
    cc = cci(h, l, c)
    if cc is not None:
        if cc < -100:
            osc_buy += 1
        elif cc > 100:
            osc_sell += 1
        else:
            osc_neu += 1
    mom = price - c[-11] if len(c) > 10 else 0
    if mom > 0:
        osc_buy += 1
    elif mom < 0:
        osc_sell += 1
    buy, sell = ma_buy + osc_buy, ma_sell + osc_sell
    total = buy + sell + osc_neu
    score = (buy - sell) / total if total else 0.0
    label = ("Achat fort" if score >= 0.5 else "Achat" if score >= 0.1
             else "Neutre" if score > -0.1 else "Vente" if score > -0.5 else "Vente forte")
    return {"score": round(score, 2), "label": label, "rsi": None if r is None else round(r, 1),
            "ma_buy": ma_buy, "ma_sell": ma_sell, "macd_up": macd_up}


def main():
    # argv[1] peut être une chaîne VIDE (workflow_dispatch sans input) → repli défaut
    raw = (sys.argv[1] if len(sys.argv) > 1 else "").strip() or DEFAULT_SYMBOLS
    symbols = [s.strip().upper() for s in raw.split(",") if s.strip()]
    print(f"══ ANALYSE EXPERT — {len(symbols)} cryptos, vraies bougies Binance ({BASE}) ══\n")
    for sym in symbols:
        try:
            h1, l1, c1 = fetch(sym, "1h", 250)
            h4, l4, c4 = fetch(sym, "4h", 250)
            hd, ld, cd = fetch(sym, "1d", 200)
        except Exception as e:  # cause exacte, jamais avalée
            print(f"{sym}: INDISPONIBLE — {type(e).__name__}: {e}")
            print(f"ANALYSIS|{sym}|ERR|{type(e).__name__}")
            continue
        price = c1[-1]
        chg24 = (c1[-1] / c1[-25] - 1) * 100 if len(c1) > 25 else None
        chg7d = (c1[-1] / c1[-169] - 1) * 100 if len(c1) > 169 else None
        r1, r4, rd = rating(h1, l1, c1), rating(h4, l4, c4), rating(hd, ld, cd)
        vol = atr_pct(hd, ld, cd)
        sup, res = min(ld[-30:]), max(hd[-30:])
        print(f"── {sym} : {price:,.4f} $ ──")
        c24 = "n/d" if chg24 is None else f"{chg24:+.2f}%"
        c7 = "n/d" if chg7d is None else f"{chg7d:+.2f}%"
        print(f"   24h {c24} · 7j {c7} · volatilité(ATR14 1j) {vol:.2f}%/j")
        print(f"   1h : {r1['label']} (score {r1['score']:+.2f}, RSI {r1['rsi']}, MM {r1['ma_buy']}↑/{r1['ma_sell']}↓, MACD {'↑' if r1['macd_up'] else '↓'})")
        print(f"   4h : {r4['label']} (score {r4['score']:+.2f}, RSI {r4['rsi']})")
        print(f"   1j : {rd['label']} (score {rd['score']:+.2f}, RSI {rd['rsi']})")
        print(f"   support 30j {sup:,.4f} $ · résistance 30j {res:,.4f} $ · position dans le range {((price - sup) / (res - sup) * 100) if res > sup else 0:.0f}%")
        print(f"ANALYSIS|{sym}|{price}|{'' if chg24 is None else round(chg24,2)}|{'' if chg7d is None else round(chg7d,2)}|{r1['label']}|{r1['score']}|{r4['label']}|{r4['score']}|{rd['label']}|{rd['score']}|{r1['rsi']}|{rd['rsi']}|{round(vol,2) if vol else ''}|{sup}|{res}\n")


if __name__ == "__main__":
    main()
