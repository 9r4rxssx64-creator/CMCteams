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
    # Une position ouverte PAR PAIRE (clé = symbole ex "BTC/USDT")
    positions: dict = field(default_factory=dict)
    equity_peak: float = 0.0
    day: str = ""
    day_start_equity: float = 0.0
    halted: bool = False
    halt_reason: str = ""

    def pos(self, symbol: str) -> Position:
        """Position de la paire (créée vide si absente)."""
        p = self.positions.get(symbol)
        if p is None:
            p = Position()
            self.positions[symbol] = p
        return p

    def to_dict(self) -> dict:
        return {
            "positions": {k: asdict(v) for k, v in self.positions.items()},
            "equity_peak": self.equity_peak,
            "day": self.day,
            "day_start_equity": self.day_start_equity,
            "halted": self.halted,
            "halt_reason": self.halt_reason,
        }

    @staticmethod
    def load() -> "State":
        if not os.path.exists(STATE_PATH):
            return State()
        try:
            with open(STATE_PATH, encoding="utf-8") as fh:
                raw = json.load(fh)
            positions = {}
            for k, v in (raw.get("positions") or {}).items():
                positions[k] = Position(**v)
            # Rétro-compat : ancien format à position unique (single-symbol)
            if not positions and raw.get("position"):
                positions["BTC/USDT"] = Position(**raw["position"])
            return State(
                positions=positions,
                equity_peak=raw.get("equity_peak", 0.0),
                day=raw.get("day", ""),
                day_start_equity=raw.get("day_start_equity", 0.0),
                halted=raw.get("halted", False),
                halt_reason=raw.get("halt_reason", ""),
            )
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

    def position_size(self, equity: float, price: float, stop_price: float,
                      alloc: float = 1.0, cash: float | None = None) -> float:
        """Renvoie une quantité (en actif de base) respectant tous les plafonds.

        `alloc` (0-1) répartit le capital entre les paires en multi-cryptos :
        avec 4 paires, alloc=1/4 → risque ET plafond de position divisés par 4,
        donc l'exposition TOTALE reste bornée par les mêmes garde-fous.

        `cash` (optionnel) = liquidités RÉELLEMENT disponibles dans la devise de
        cotation (USDT libre). On ne peut jamais acheter pour plus que ce cash :
        sinon l'exchange refuse l'ordre (« insufficient balance ») et AUCUN trade
        ne passe. On garde une petite marge (2 %) pour les frais/le slippage.
        """
        stop_dist = price - stop_price
        if stop_dist <= 0 or price <= 0 or equity <= 0 or alloc <= 0:
            return 0.0
        # 1) risque : on ne perd que (risk_per_trade_pct * alloc) du capital si le stop saute
        risk_amount = equity * (self.cfg.risk_per_trade_pct / 100.0) * alloc
        qty_by_risk = risk_amount / stop_dist
        # 2) plafond de taille de position (part allouée à cette paire)
        max_notional = equity * (self.cfg.max_position_pct / 100.0) * alloc
        qty_by_cap = max_notional / price
        qty = min(qty_by_risk, qty_by_cap)
        # 3) borne dure : jamais plus que le cash libre disponible (évite le refus
        #    « insufficient balance » qui bloquait tous les achats).
        if cash is not None and cash > 0:
            qty = min(qty, (cash * 0.98) / price)
        # 4) respect de l'ordre minimum de l'exchange
        if qty * price < self.cfg.min_order_usdt:
            return 0.0
        return qty
