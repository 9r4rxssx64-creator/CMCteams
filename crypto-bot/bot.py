"""Boucle principale du bot (full-auto, spot, long-only).

Ordre de priorité à CHAQUE cycle :
  1. Kill switch (fichier KILL) -> on solde la position et on s'arrête
  2. Coupures de risque (perte du jour / drawdown) -> on solde et on s'arrête
  3. Stop-loss ATR -> on vend
  4. Signal de la stratégie -> achat / vente

Sécurité : par défaut TESTNET (faux argent). Pour l'argent réel il faut
À LA FOIS TESTNET=false dans .env ET le drapeau --live sur la ligne de commande.
"""
from __future__ import annotations

import sys
import time

import audit
from config import Config
from exchange import Exchange
from risk import RiskManager, State
from strategy import Strategy


def _closed_candles(ohlcv: list) -> tuple[list, list, list]:
    """Écarte la dernière bougie (encore en formation) et renvoie H/L/C."""
    rows = ohlcv[:-1] if len(ohlcv) > 1 else ohlcv
    highs = [float(r[2]) for r in rows]
    lows = [float(r[3]) for r in rows]
    closes = [float(r[4]) for r in rows]
    return highs, lows, closes


def _flatten(ex: Exchange, state: State, price: float, reason: str) -> None:
    """Vend toute la position en cours (sortie de sécurité)."""
    if not state.position.in_position:
        return
    qty = min(state.position.qty, ex.base_balance())
    try:
        if qty > 0:
            ex.market_sell(qty)
        audit.log("SELL", reason=reason, qty=qty, price=price)
        audit.console(f"🔻 VENTE ({reason}) qty={qty} @ {price}")
    except Exception as exc:  # noqa: BLE001
        audit.log("ERROR", where="flatten", detail=str(exc))
        audit.console(f"⚠️ Erreur vente : {exc}")
    state.position = type(state.position)()  # reset


def run(live: bool) -> None:
    cfg = Config.load()
    cfg.require_keys()

    if not cfg.testnet and not live:
        raise SystemExit(
            "⛔ TESTNET=false mais drapeau --live absent. "
            "Pour trader du VRAI argent : ajoute --live. "
            "(Tant que tu n'as pas validé en testnet, laisse TESTNET=true.)"
        )

    mode = "🧪 TESTNET (faux argent)" if cfg.testnet else "💶 ARGENT RÉEL"
    ex = Exchange(cfg)
    strat = Strategy(cfg.ema_fast, cfg.ema_slow, cfg.rsi_period,
                     cfg.rsi_max, cfg.atr_period)
    risk = RiskManager(cfg)
    state = State.load()

    audit.log("START", mode=mode, symbol=cfg.symbol, timeframe=cfg.timeframe)
    audit.console(f"Démarrage — {mode} — {cfg.symbol} {cfg.timeframe}")
    audit.console("Kill switch : crée un fichier nommé 'KILL' dans ce dossier "
                  "pour tout couper.")

    while True:
        try:
            _cycle(ex, strat, risk, state, cfg)
        except KeyboardInterrupt:
            audit.console("Arrêt manuel (Ctrl+C).")
            audit.log("STOP", reason="manuel")
            break
        except Exception as exc:  # noqa: BLE001 — on ne veut jamais crasher la boucle
            audit.log("ERROR", where="cycle", detail=str(exc))
            audit.console(f"⚠️ Erreur cycle : {exc}")
        state.save()
        time.sleep(cfg.loop_seconds)


def _cycle(ex: Exchange, strat: Strategy, risk: RiskManager,
           state: State, cfg: Config) -> None:
    price = ex.last_price()
    equity = ex.equity_in_quote(price)

    # 1) Kill switch
    if RiskManager.kill_requested():
        _flatten(ex, state, price, "kill switch")
        state.halted = True
        state.halt_reason = "kill switch"
        state.save()
        audit.log("KILL", price=price)
        audit.console("🛑 KILL détecté — position soldée, arrêt.")
        raise SystemExit(0)

    # Suivi capital + coupures de risque
    risk.mark_equity(state, equity)
    halted, reason = risk.check_halts(state, equity)
    if halted:
        _flatten(ex, state, price, reason)
        state.halted = True
        state.halt_reason = reason
        audit.log("HALT", reason=reason, equity=equity)
        audit.console(f"🛑 Coupure risque : {reason}. Efface state.json pour relancer.")
        raise SystemExit(0)

    # 2) Stop-loss ATR (si en position)
    if state.position.in_position and price <= state.position.stop_price:
        _flatten(ex, state, price, f"stop-loss @ {state.position.stop_price:.2f}")
        return

    # 3) Signal stratégie
    ohlcv = ex.fetch_ohlcv(limit=max(200, strat.min_candles() + 5))
    highs, lows, closes = _closed_candles(ohlcv)
    sig = strat.evaluate(highs, lows, closes, state.position.in_position)
    audit.console(f"{sig.action} | prix={price:.2f} | equity={equity:.2f} | {sig.reason}")

    if sig.action == "BUY" and sig.atr:
        stop = risk.compute_stop(price, sig.atr)
        qty = risk.position_size(equity, price, stop)
        if qty <= 0:
            audit.log("SKIP_BUY", reason="taille nulle (risque/plafond/min ordre)",
                      price=price)
            return
        order = ex.market_buy(qty)
        filled = float(order.get("filled") or qty)
        avg = float(order.get("average") or price)
        state.position.in_position = True
        state.position.entry_price = avg
        state.position.qty = filled
        state.position.stop_price = stop
        audit.log("BUY", qty=filled, price=avg, stop=stop, reason=sig.reason)
        audit.console(f"🟢 ACHAT qty={filled} @ {avg:.2f} (stop {stop:.2f})")

    elif sig.action == "SELL" and state.position.in_position:
        _flatten(ex, state, price, sig.reason)


def _live_flag() -> bool:
    """Double verrou argent réel : drapeau --live OU variable BOT_LIVE=true
    (cette dernière pour les hébergeurs cloud sans ligne de commande)."""
    if "--live" in sys.argv:
        return True
    import os
    return os.getenv("BOT_LIVE", "").strip().lower() in ("1", "true", "yes", "oui", "on")


if __name__ == "__main__":
    run(live=_live_flag())
