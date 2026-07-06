"""Indicateurs techniques en Python pur (aucune dépendance lourde).

Toutes les fonctions renvoient une liste de la même longueur que l'entrée ;
les valeurs non calculables (début de série) valent None.
"""
from __future__ import annotations

from typing import List, Optional


def ema(values: List[float], period: int) -> List[Optional[float]]:
    """Moyenne mobile exponentielle. Amorcée par une SMA sur `period`."""
    out: List[Optional[float]] = [None] * len(values)
    if period <= 0 or len(values) < period:
        return out
    k = 2.0 / (period + 1)
    seed = sum(values[:period]) / period
    out[period - 1] = seed
    prev = seed
    for i in range(period, len(values)):
        prev = values[i] * k + prev * (1 - k)
        out[i] = prev
    return out


def rsi(values: List[float], period: int = 14) -> List[Optional[float]]:
    """RSI de Wilder (0-100)."""
    out: List[Optional[float]] = [None] * len(values)
    if period <= 0 or len(values) <= period:
        return out
    gains = 0.0
    losses = 0.0
    for i in range(1, period + 1):
        delta = values[i] - values[i - 1]
        gains += max(delta, 0.0)
        losses += max(-delta, 0.0)
    avg_gain = gains / period
    avg_loss = losses / period
    out[period] = _rsi_from(avg_gain, avg_loss)
    for i in range(period + 1, len(values)):
        delta = values[i] - values[i - 1]
        gain = max(delta, 0.0)
        loss = max(-delta, 0.0)
        avg_gain = (avg_gain * (period - 1) + gain) / period
        avg_loss = (avg_loss * (period - 1) + loss) / period
        out[i] = _rsi_from(avg_gain, avg_loss)
    return out


def _rsi_from(avg_gain: float, avg_loss: float) -> float:
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return 100.0 - (100.0 / (1.0 + rs))


def sma(values: List[float], period: int) -> List[Optional[float]]:
    """Moyenne mobile simple sur `period` (None tant qu'il manque des points)."""
    out: List[Optional[float]] = [None] * len(values)
    if period <= 0 or len(values) < period:
        return out
    s = sum(values[:period])
    out[period - 1] = s / period
    for i in range(period, len(values)):
        s += values[i] - values[i - period]
        out[i] = s / period
    return out


def rolling_std(values: List[float], period: int) -> List[Optional[float]]:
    """Écart-type mobile (population) sur `period` — sert aux bandes de Bollinger."""
    out: List[Optional[float]] = [None] * len(values)
    if period <= 0 or len(values) < period:
        return out
    for i in range(period - 1, len(values)):
        window = values[i - period + 1:i + 1]
        m = sum(window) / period
        var = sum((x - m) ** 2 for x in window) / period
        out[i] = var ** 0.5
    return out


def atr(highs: List[float], lows: List[float], closes: List[float],
        period: int = 14) -> List[Optional[float]]:
    """Average True Range de Wilder — mesure de volatilité, sert au stop-loss."""
    n = len(closes)
    out: List[Optional[float]] = [None] * n
    if n <= period:
        return out
    trs: List[float] = [0.0] * n
    for i in range(1, n):
        tr = max(
            highs[i] - lows[i],
            abs(highs[i] - closes[i - 1]),
            abs(lows[i] - closes[i - 1]),
        )
        trs[i] = tr
    # Amorçage : moyenne simple des TR sur `period`
    first = sum(trs[1:period + 1]) / period
    out[period] = first
    prev = first
    for i in range(period + 1, n):
        prev = (prev * (period - 1) + trs[i]) / period
        out[i] = prev
    return out
