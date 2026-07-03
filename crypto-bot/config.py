"""Chargement et validation de la configuration depuis le fichier .env.

Aucune clé n'est écrite en dur : tout vient de l'environnement (.env),
conformément à la règle de sécurité « clés jamais dans le code ».
"""
from __future__ import annotations

import os
from dataclasses import dataclass

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:  # dotenv absent : on lit quand même os.environ
    pass


def _f(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, default))
    except (TypeError, ValueError):
        return float(default)


def _i(name: str, default: int) -> int:
    try:
        return int(float(os.getenv(name, default)))
    except (TypeError, ValueError):
        return int(default)


def _b(name: str, default: bool) -> bool:
    val = os.getenv(name)
    if val is None:
        return default
    return val.strip().lower() in ("1", "true", "yes", "oui", "on")


def _symbols() -> list:
    """Liste de paires depuis SYMBOLS (séparées par virgule) ; repli SYMBOL ; défaut BTC/USDT.
    Normalise en MAJUSCULES avec un slash (ex "eth-usdt" -> "ETH/USDT")."""
    raw = os.getenv("SYMBOLS") or os.getenv("SYMBOL") or "BTC/USDT"
    out, seen = [], set()
    for part in raw.replace(";", ",").split(","):
        s = part.strip().upper().replace("-", "/").replace("_", "/")
        if not s:
            continue
        if "/" not in s and s.endswith("USDT"):
            s = s[:-4] + "/USDT"
        if "/" in s and s not in seen:
            seen.add(s)
            out.append(s)
    return out or ["BTC/USDT"]


@dataclass
class Config:
    api_key: str
    api_secret: str
    testnet: bool
    symbols: list  # liste de paires ex ["BTC/USDT", "ETH/USDT"] — Kevin choisit
    timeframe: str
    loop_seconds: int
    ema_fast: int
    ema_slow: int
    rsi_period: int
    rsi_max: float
    atr_period: int
    atr_stop_mult: float
    risk_per_trade_pct: float
    max_position_pct: float
    daily_loss_cap_pct: float
    max_drawdown_pct: float
    min_order_usdt: float

    @staticmethod
    def load() -> "Config":
        cfg = Config(
            api_key=os.getenv("BINANCE_API_KEY", ""),
            api_secret=os.getenv("BINANCE_API_SECRET", ""),
            testnet=_b("TESTNET", True),
            symbols=_symbols(),
            timeframe=os.getenv("TIMEFRAME", "15m"),
            loop_seconds=_i("LOOP_SECONDS", 60),
            ema_fast=_i("EMA_FAST", 9),
            ema_slow=_i("EMA_SLOW", 21),
            rsi_period=_i("RSI_PERIOD", 14),
            rsi_max=_f("RSI_MAX", 70.0),
            atr_period=_i("ATR_PERIOD", 14),
            atr_stop_mult=_f("ATR_STOP_MULT", 2.0),
            risk_per_trade_pct=_f("RISK_PER_TRADE_PCT", 1.0),
            max_position_pct=_f("MAX_POSITION_PCT", 25.0),
            daily_loss_cap_pct=_f("DAILY_LOSS_CAP_PCT", 3.0),
            max_drawdown_pct=_f("MAX_DRAWDOWN_PCT", 15.0),
            min_order_usdt=_f("MIN_ORDER_USDT", 11.0),
        )
        cfg.validate()
        return cfg

    @property
    def symbol(self) -> str:
        """Rétro-compat : première paire (backtest, precision, etc.)."""
        return self.symbols[0]

    @property
    def quote(self) -> str:
        """Devise de cotation commune (ex USDT)."""
        return self.symbols[0].split("/")[1]

    def validate(self) -> None:
        if not self.symbols:
            raise ValueError("Aucune paire à trader (SYMBOLS vide)")
        quotes = {s.split("/")[1] for s in self.symbols if "/" in s}
        if len(quotes) != 1:
            raise ValueError(
                "Toutes les paires doivent partager la même devise de cotation "
                f"(ex tout en /USDT). Vu : {sorted(quotes)}"
            )
        if self.ema_fast >= self.ema_slow:
            raise ValueError("EMA_FAST doit être < EMA_SLOW")
        if not (0 < self.risk_per_trade_pct <= 100):
            raise ValueError("RISK_PER_TRADE_PCT doit être entre 0 et 100")
        if not (0 < self.max_position_pct <= 100):
            raise ValueError("MAX_POSITION_PCT doit être entre 0 et 100")
        if self.atr_stop_mult <= 0:
            raise ValueError("ATR_STOP_MULT doit être > 0")

    def require_keys(self) -> None:
        """À appeler avant de trader en direct (pas nécessaire pour le backtest)."""
        if not self.api_key or not self.api_secret:
            raise SystemExit(
                "❌ Clés API manquantes. Copie .env.example en .env et remplis "
                "BINANCE_API_KEY / BINANCE_API_SECRET."
            )
