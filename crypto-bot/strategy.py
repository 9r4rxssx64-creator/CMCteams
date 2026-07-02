"""Stratégie de départ : croisement d'EMA + filtre RSI + stop ATR.

Spot uniquement, LONG-ONLY (on achète puis on revend — jamais de vente à
découvert ni de levier). C'est le profil le plus prudent pour débuter.

⚠️  Ce n'est PAS une machine à billets : c'est un template raisonnable et
    lisible. On l'affine avec les résultats MESURÉS (backtest + testnet),
    jamais sur une intuition.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

from indicators import atr, ema, rsi


@dataclass
class Signal:
    action: str            # "BUY", "SELL" ou "HOLD"
    price: float           # dernier prix de clôture
    atr: Optional[float]   # volatilité courante (pour dimensionner le stop)
    reason: str            # explication lisible (va dans le journal d'audit)


class Strategy:
    def __init__(self, ema_fast: int, ema_slow: int, rsi_period: int,
                 rsi_max: float, atr_period: int) -> None:
        self.ema_fast = ema_fast
        self.ema_slow = ema_slow
        self.rsi_period = rsi_period
        self.rsi_max = rsi_max
        self.atr_period = atr_period

    def min_candles(self) -> int:
        return max(self.ema_slow, self.rsi_period, self.atr_period) + 2

    def evaluate(self, highs: List[float], lows: List[float],
                 closes: List[float], in_position: bool) -> Signal:
        """Décide BUY / SELL / HOLD à partir des dernières bougies CLÔTURÉES."""
        price = closes[-1]
        if len(closes) < self.min_candles():
            return Signal("HOLD", price, None, "pas assez de bougies")

        ef = ema(closes, self.ema_fast)
        es = ema(closes, self.ema_slow)
        r = rsi(closes, self.rsi_period)
        a = atr(highs, lows, closes, self.atr_period)

        ef_now, ef_prev = ef[-1], ef[-2]
        es_now, es_prev = es[-1], es[-2]
        rsi_now = r[-1]
        atr_now = a[-1]

        if None in (ef_now, ef_prev, es_now, es_prev, rsi_now):
            return Signal("HOLD", price, atr_now, "indicateurs incomplets")

        crossed_up = ef_prev <= es_prev and ef_now > es_now
        crossed_down = ef_prev >= es_prev and ef_now < es_now

        if not in_position:
            if crossed_up and rsi_now < self.rsi_max:
                return Signal(
                    "BUY", price, atr_now,
                    f"EMA{self.ema_fast} croise au-dessus EMA{self.ema_slow}, "
                    f"RSI={rsi_now:.1f} < {self.rsi_max}",
                )
            if crossed_up:
                return Signal("HOLD", price, atr_now,
                              f"croisement haussier mais RSI={rsi_now:.1f} trop haut")
            return Signal("HOLD", price, atr_now, "pas de signal d'achat")

        # En position : on sort au croisement baissier (le stop-loss ATR est
        # géré séparément par le gestionnaire de risque).
        if crossed_down:
            return Signal(
                "SELL", price, atr_now,
                f"EMA{self.ema_fast} croise sous EMA{self.ema_slow} — sortie",
            )
        return Signal("HOLD", price, atr_now, "position conservée")
