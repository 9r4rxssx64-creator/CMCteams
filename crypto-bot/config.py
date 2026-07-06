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
    # Choix de stratégie + politique de sortie
    strategy: str            # "ema" (tendance) ou "meanrev" (retour à la moyenne)
    hold_until_profit: bool  # True = ne JAMAIS vendre à perte, attendre la remontée
    min_profit_pct: float    # marge mini au-dessus du prix d'entrée pour vendre (%)
    mr_period: int           # période SMA/écart-type (mean reversion)
    mr_std_mult: float       # largeur des bandes (k·écart-type)
    mr_rsi_buy: float        # RSI sous lequel on achète le creux
    mr_rsi_sell: float       # RSI au-dessus duquel on prend le profit
    catastrophe_stop_pct: float  # même en "ne pas vendre à perte", on coupe si -X% (0 = jamais)
    du_trend_period: int     # EMA de tendance de fond (stratégie dipup)
    du_rsi_buy: float        # RSI sous lequel on achète le creux (dipup)
    du_rsi_sell: float       # RSI au-dessus duquel on encaisse le rebond (dipup)
    paper: bool              # True = portefeuille VIRTUEL (aucune clé requise)
    bot_name: str            # étiquette du bot dans les logs (flotte multi-bots)

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
            strategy=os.getenv("STRATEGY", "ema"),
            hold_until_profit=_b("HOLD_UNTIL_PROFIT", False),
            min_profit_pct=_f("MIN_PROFIT_PCT", 0.3),
            mr_period=_i("MR_PERIOD", 20),
            mr_std_mult=_f("MR_STD_MULT", 2.0),
            mr_rsi_buy=_f("MR_RSI_BUY", 35.0),
            mr_rsi_sell=_f("MR_RSI_SELL", 60.0),
            catastrophe_stop_pct=_f("CATASTROPHE_STOP_PCT", 0.0),
            du_trend_period=_i("DU_TREND_PERIOD", 50),
            du_rsi_buy=_f("DU_RSI_BUY", 35.0),
            du_rsi_sell=_f("DU_RSI_SELL", 60.0),
            paper=_b("PAPER", False),
            bot_name=os.getenv("BOT_NAME", "bot"),
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
