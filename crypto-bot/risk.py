"""Gestionnaire de risque + état persistant + kill switch.

Garde-fous (ta règle « bouton ON/OFF + kill switch » et « stop-loss ») :
  - taille de position calculée sur le risque réel (distance au stop)
  - plafond de position (% max du capital)
  - plafond de perte journalière -> coupe le bot
  - max drawdown depuis le sommet -> coupe le bot
  - fichier KILL présent -> coupe tout immédiatement
"""
from __future__ import annotations

import json
import os
from dataclasses import asdict, dataclass, field
from datetime import date

STATE_PATH = os.path.join(os.path.dirname(__file__), "state.json")
KILL_PATH = os.path.join(os.path.dirname(__file__), "KILL")


@dataclass
class Position:
    in_position: bool = False
    entry_price: float = 0.0
    qty: float = 0.0
    stop_price: float = 0.0


@dataclass
class State:
    position: Position = field(default_factory=Position)
    equity_peak: float = 0.0
    day: str = ""
    day_start_equity: float = 0.0
    halted: bool = False
    halt_reason: str = ""

    def to_dict(self) -> dict:
        d = asdict(self)
        return d

    @staticmethod
    def load() -> "State":
        if not os.path.exists(STATE_PATH):
            return State()
        try:
            with open(STATE_PATH, encoding="utf-8") as fh:
                raw = json.load(fh)
            pos = Position(**raw.get("position", {}))
            st = State(
                position=pos,
                equity_peak=raw.get("equity_peak", 0.0),
                day=raw.get("day", ""),
                day_start_equity=raw.get("day_start_equity", 0.0),
                halted=raw.get("halted", False),
                halt_reason=raw.get("halt_reason", ""),
            )
            return st
        except Exception:
            return State()

    def save(self) -> None:
        with open(STATE_PATH, "w", encoding="utf-8") as fh:
            json.dump(self.to_dict(), fh, ensure_ascii=False, indent=2)


class RiskManager:
    def __init__(self, cfg) -> None:
        self.cfg = cfg

    # --- Kill switch ---
    @staticmethod
    def kill_requested() -> bool:
        """Fichier KILL (local) OU variable BOT_KILL=1 (cloud, réglable
        depuis le dashboard Railway sur iPhone)."""
        if os.path.exists(KILL_PATH):
            return True
        return os.getenv("BOT_KILL", "").strip().lower() in ("1", "true", "yes", "oui", "on")

    # --- Suivi capital (sommet + démarrage de journée) ---
    def mark_equity(self, state: State, equity: float) -> None:
        today = date.today().isoformat()
        if state.day != today:
            state.day = today
            state.day_start_equity = equity
        if equity > state.equity_peak:
            state.equity_peak = equity
        if state.day_start_equity <= 0:
            state.day_start_equity = equity
        if state.equity_peak <= 0:
            state.equity_peak = equity

    # --- Contrôles de coupure ---
    def check_halts(self, state: State, equity: float) -> tuple[bool, str]:
        if state.day_start_equity > 0:
            day_pnl_pct = (equity - state.day_start_equity) / state.day_start_equity * 100
            if day_pnl_pct <= -abs(self.cfg.daily_loss_cap_pct):
                return True, (f"plafond de perte journalière atteint "
                              f"({day_pnl_pct:.2f}% <= -{self.cfg.daily_loss_cap_pct}%)")
        if state.equity_peak > 0:
            dd_pct = (equity - state.equity_peak) / state.equity_peak * 100
            if dd_pct <= -abs(self.cfg.max_drawdown_pct):
                return True, (f"max drawdown atteint "
                              f"({dd_pct:.2f}% <= -{self.cfg.max_drawdown_pct}%)")
        return False, ""

    # --- Dimensionnement de la position ---
    def compute_stop(self, entry_price: float, atr_value: float) -> float:
        return max(0.0, entry_price - atr_value * self.cfg.atr_stop_mult)

    def position_size(self, equity: float, price: float, stop_price: float) -> float:
        """Renvoie une quantité (en actif de base) respectant tous les plafonds."""
        stop_dist = price - stop_price
        if stop_dist <= 0 or price <= 0 or equity <= 0:
            return 0.0
        # 1) risque : on ne perd que risk_per_trade_pct du capital si le stop saute
        risk_amount = equity * (self.cfg.risk_per_trade_pct / 100.0)
        qty_by_risk = risk_amount / stop_dist
        # 2) plafond de taille de position
        max_notional = equity * (self.cfg.max_position_pct / 100.0)
        qty_by_cap = max_notional / price
        qty = min(qty_by_risk, qty_by_cap)
        # 3) respect de l'ordre minimum de l'exchange
        if qty * price < self.cfg.min_order_usdt:
            return 0.0
        return qty
