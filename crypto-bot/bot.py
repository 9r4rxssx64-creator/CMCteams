"""Boucle principale du bot (full-auto, spot, long-only, MULTI-CRYPTOS).

Kevin choisit les paires (SYMBOLS) et les gros réglages ; le bot gère le reste.
Le capital est réparti entre les paires : avec N paires, chaque paire reçoit
1/N du risque et du plafond de position → l'exposition TOTALE reste bornée par
les mêmes garde-fous (perte/jour, drawdown) qu'en mono-crypto.

Ordre de priorité à CHAQUE cycle :
  1. Kill switch (fichier KILL ou BOT_KILL=1) -> on solde TOUT et on s'arrête
  2. Coupures de risque (perte du jour / drawdown, sur le capital TOTAL) -> solde tout
  3. Par paire : stop-loss ATR -> vente ; puis signal stratégie -> achat / vente

Sécurité : par défaut TESTNET (faux argent). Argent réel = TESTNET=false ET (--live OU BOT_LIVE=true).
"""
from __future__ import annotations

import os
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


def _flatten_symbol(ex: Exchange, state: State, symbol: str, price: float, reason: str) -> None:
    """Vend toute la position d'UNE paire (sortie de sécurité)."""
    pos = state.pos(symbol)
    if not pos.in_position:
        return
    try:
        qty = min(pos.qty, ex.base_balance(symbol))
        if qty > 0:
            ex.market_sell(symbol, qty)
        audit.log("SELL", symbol=symbol, reason=reason, qty=qty, price=price)
        audit.console(f"🔻 {symbol} VENTE ({reason}) qty={qty} @ {price}")
    except Exception as exc:  # noqa: BLE001
        audit.log("ERROR", where="flatten", symbol=symbol, detail=str(exc))
        audit.console(f"⚠️ {symbol} erreur vente : {exc}")
    state.positions[symbol] = type(pos)()  # reset


def _flatten_all(ex: Exchange, state: State, prices: dict, reason: str) -> None:
    for sym in list(state.positions.keys()):
        px = prices.get(sym) or 0.0
        _flatten_symbol(ex, state, sym, px, reason)


def run(live: bool) -> None:
    cfg = Config.load()
    cfg.require_keys()

    if not cfg.testnet and not live:
        raise SystemExit(
            "⛔ TESTNET=false mais argent réel non confirmé. "
            "Pour trader du VRAI argent : --live OU BOT_LIVE=true. "
            "(Tant que tu n'as pas validé en testnet, laisse TESTNET=true.)"
        )

    mode = "🧪 TESTNET (faux argent)" if cfg.testnet else "💶 ARGENT RÉEL"
    ex = Exchange(cfg)
    strat = Strategy(cfg.ema_fast, cfg.ema_slow, cfg.rsi_period, cfg.rsi_max, cfg.atr_period)
    risk = RiskManager(cfg)
    state = State.load()
    alloc = 1.0 / max(1, len(cfg.symbols))  # part de capital par paire

    audit.log("START", mode=mode, symbols=cfg.symbols, timeframe=cfg.timeframe)
    audit.console(f"Démarrage — {mode} — {', '.join(cfg.symbols)} — {cfg.timeframe}")
    audit.console("Kill switch : BOT_KILL=1 (Railway) ou fichier 'KILL' pour tout couper.")

    while True:
        try:
            _cycle(ex, strat, risk, state, cfg, alloc)
        except SystemExit:
            raise
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
           state: State, cfg: Config, alloc: float) -> None:
    prices = ex.prices(cfg.symbols)
    equity = ex.equity_in_quote(prices)

    # 1) Kill switch (global)
    if RiskManager.kill_requested():
        _flatten_all(ex, state, prices, "kill switch")
        state.halted = True
        state.halt_reason = "kill switch"
        state.save()
        audit.log("KILL", equity=equity)
        audit.console("🛑 KILL détecté — tout soldé, arrêt.")
        raise SystemExit(0)

    # 2) Coupures de risque (sur le capital TOTAL)
    risk.mark_equity(state, equity)
    halted, reason = risk.check_halts(state, equity)
    if halted:
        _flatten_all(ex, state, prices, reason)
        state.halted = True
        state.halt_reason = reason
        audit.log("HALT", reason=reason, equity=equity)
        audit.console(f"🛑 Coupure risque : {reason}. Efface state.json / relance pour repartir.")
        raise SystemExit(0)

    # 3) Chaque paire, indépendamment
    for symbol in cfg.symbols:
        price = prices.get(symbol)
        if not price:
            audit.console(f"… {symbol} prix indisponible, ignoré ce cycle")
            continue
        try:
            _cycle_symbol(ex, strat, risk, state, symbol, price, equity, alloc)
        except Exception as exc:  # noqa: BLE001 — une paire ne bloque pas les autres
            audit.log("ERROR", where="cycle_symbol", symbol=symbol, detail=str(exc))
            audit.console(f"⚠️ {symbol} erreur : {exc}")


def _cycle_symbol(ex: Exchange, strat: Strategy, risk: RiskManager, state: State,
                  symbol: str, price: float, equity: float, alloc: float) -> None:
    pos = state.pos(symbol)

    # Stop-loss ATR
    if pos.in_position and price <= pos.stop_price:
        _flatten_symbol(ex, state, symbol, price, f"stop-loss @ {pos.stop_price:.2f}")
        return

    ohlcv = ex.fetch_ohlcv(symbol, limit=max(200, strat.min_candles() + 5))
    highs, lows, closes = _closed_candles(ohlcv)
    sig = strat.evaluate(highs, lows, closes, pos.in_position)
    # Format lisible par le tableau de bord : "<SYM> <ACTION> | prix= | equity="
    audit.console(f"{symbol} {sig.action} | prix={price:.2f} | equity={equity:.2f} | {sig.reason}")

    if sig.action == "BUY" and sig.atr:
        stop = risk.compute_stop(price, sig.atr)
        qty = risk.position_size(equity, price, stop, alloc=alloc)
        if qty <= 0:
            audit.log("SKIP_BUY", symbol=symbol, reason="taille nulle (risque/plafond/min ordre)")
            return
        order = ex.market_buy(symbol, qty)
        filled = float(order.get("filled") or qty)
        avg = float(order.get("average") or price)
        pos.in_position = True
        pos.entry_price = avg
        pos.qty = filled
        pos.stop_price = stop
        audit.log("BUY", symbol=symbol, qty=filled, price=avg, stop=stop, reason=sig.reason)
        audit.console(f"🟢 {symbol} ACHAT qty={filled} @ {avg:.2f} (stop {stop:.2f})")

    elif sig.action == "SELL" and pos.in_position:
        _flatten_symbol(ex, state, symbol, price, sig.reason)


def _live_flag() -> bool:
    """Double verrou argent réel : drapeau --live OU variable BOT_LIVE=true."""
    if "--live" in sys.argv:
        return True
    return os.getenv("BOT_LIVE", "").strip().lower() in ("1", "true", "yes", "oui", "on")


if __name__ == "__main__":
    run(live=_live_flag())
