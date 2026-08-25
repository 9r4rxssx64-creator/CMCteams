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
from strategy import Strategy, make_strategy


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


def _equity_reliable(prices: dict, state: State) -> bool:
    """L'équité est fiable si CHAQUE position OUVERTE a un prix ce cycle.

    Si une position ouverte n'a pas de prix (raté réseau sur son ticker),
    l'équité est sous-évaluée → on NE déclenche PAS de coupure de risque /
    liquidation sur des données incomplètes (un simple hoquet réseau ne doit
    jamais solder le compte). Aucune position ouverte → juste du cash → fiable.
    """
    return all(
        prices.get(sym) for sym, p in state.positions.items() if p.in_position
    )


def _reconcile_positions(ex: Exchange, strat: Strategy, risk: RiskManager,
                         state: State, cfg: Config) -> None:
    """Adopte les cryptos DÉJÀ détenues sur le compte comme positions gérées.

    Sur Railway, state.json est éphémère (remis à zéro à chaque déploiement) :
    sans ça, le bot « oublie » les cryptos qu'il détient, ne les revend jamais
    (la vente n'agit que si in_position=True) et bloque tout le cash → plus aucun
    achat possible. On repart donc de la RÉALITÉ du compte : toute crypto détenue
    au-dessus de l'ordre minimum devient une position ouverte, avec un stop ATR
    protecteur, pour que le bot puisse la revendre et libérer du cash.
    """
    for symbol in cfg.symbols:
        try:
            pos = state.pos(symbol)
            if pos.in_position:
                continue
            held = ex.base_balance(symbol)
            price = ex.last_price(symbol)
            if held <= 0 or price <= 0 or held * price < cfg.min_order_usdt:
                continue
            ohlcv = ex.fetch_ohlcv(symbol, limit=max(200, strat.min_candles() + 5))
            highs, lows, closes = _closed_candles(ohlcv)
            sig = strat.evaluate(highs, lows, closes, True)
            stop = risk.compute_stop(price, sig.atr) if sig.atr else price * 0.9
            pos.in_position = True
            # Prix d'entrée RÉEL reconstruit depuis l'historique de trades du compte
            # (coût moyen des achats couvrant la quantité détenue). Sans ça
            # (state.json éphémère sur Railway) on remettait l'entrée au prix
            # COURANT → en mode « ne jamais vendre à perte » le bot pouvait vendre
            # dès un petit rebond au-dessus du prix courant, donc EN DESSOUS du vrai
            # prix d'achat = vente à perte. Repli sur le prix courant SEULEMENT si
            # l'historique est indisponible (dernier recours, comportement d'avant).
            est_entry = None
            _entry_fn = getattr(ex, "average_entry_from_trades", None)
            if _entry_fn:
                try:
                    est_entry = _entry_fn(symbol, held)
                except Exception:  # noqa: BLE001
                    est_entry = None
            pos.entry_price = est_entry if (est_entry and est_entry > 0) else price
            pos.qty = held
            pos.stop_price = stop
            _basis = ("coût réel historique" if (est_entry and est_entry > 0)
                      else "prix courant (historique indispo)")
            audit.log("RECONCILE", symbol=symbol, qty=held, price=price, stop=stop,
                      entry=pos.entry_price, entry_basis=_basis)
            audit.console(
                f"🔄 {symbol} position reprise du compte : qty={held} @ entrée ~{pos.entry_price:.2f} "
                f"({_basis}, stop {stop:.2f}) — gérée/revendue normalement")
        except Exception as exc:  # noqa: BLE001 — la reprise d'une paire ne bloque pas les autres
            audit.log("ERROR", where="reconcile", symbol=symbol, detail=str(exc))
            audit.console(f"⚠️ {symbol} reprise impossible : {exc}")


def run(live: bool) -> None:
    cfg = Config.load()
    if not cfg.paper:
        cfg.require_keys()  # le mode papier n'a besoin d'AUCUNE clé

    if not cfg.testnet and not live and not cfg.paper:
        raise SystemExit(
            "⛔ TESTNET=false mais argent réel non confirmé. "
            "Pour trader du VRAI argent : --live OU BOT_LIVE=true. "
            "(Tant que tu n'as pas validé en testnet, laisse TESTNET=true.)"
        )

    if cfg.paper:
        from paper import PaperExchange
        mode = f"📝 PAPIER [{cfg.bot_name}] (simulation, portefeuille virtuel 10000 USDT)"
        ex = PaperExchange(cfg)
    else:
        mode = "🧪 TESTNET (faux argent)" if cfg.testnet else "💶 ARGENT RÉEL"
        ex = Exchange(cfg)
    strat = make_strategy(cfg)
    risk = RiskManager(cfg)
    state = State.load()
    alloc = 1.0 / max(1, len(cfg.symbols))  # part de capital par paire

    audit.log("START", mode=mode, symbols=cfg.symbols, timeframe=cfg.timeframe,
              strategy=cfg.strategy, hold_until_profit=cfg.hold_until_profit)
    audit.console(f"Démarrage — {mode} — {', '.join(cfg.symbols)} — {cfg.timeframe} "
                  f"— stratégie={cfg.strategy}"
                  + (" — 🟢 NE VEND JAMAIS À PERTE (attend la remontée)"
                     if cfg.hold_until_profit else ""))
    audit.console("Kill switch : BOT_KILL=1 (Railway) ou fichier 'KILL' pour tout couper.")

    # Repart de la réalité du compte (state.json éphémère sur Railway) : adopte
    # les cryptos déjà détenues comme positions gérées → elles seront revendues
    # et libéreront du cash pour de nouveaux achats.
    _reconcile_positions(ex, strat, risk, state, cfg)
    state.save()

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

    # 2) Coupures de risque (sur le capital TOTAL) — seulement si l'équité est
    #    fiable ce cycle (sinon un prix manquant sous-évalue l'équité et
    #    déclencherait une fausse coupure/liquidation).
    risk.mark_equity(state, equity)
    if _equity_reliable(prices, state):
        halted, reason = risk.check_halts(state, equity)
    else:
        halted, reason = False, ""
        audit.log("EQUITY_UNRELIABLE", equity=round(equity, 2))
        audit.console(
            "… équité incomplète (prix manquant sur une position ouverte) — "
            "coupures de risque ignorées ce cycle")
    pause_buys = False
    if halted:
        if cfg.hold_until_profit:
            # « Ne pas vendre à perte » : on NE solde PAS (ça réaliserait la perte).
            # On arrête seulement d'OUVRIR de nouvelles positions ; on garde les
            # positions ouvertes jusqu'à ce qu'elles remontent en profit.
            pause_buys = True
            audit.log("PAUSE_BUYS", reason=reason, equity=equity)
            audit.console(f"⏸️ {reason} → j'arrête d'acheter, je GARDE les positions (attente remontée).")
        else:
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
            _cycle_symbol(ex, strat, risk, state, symbol, price, equity, alloc, cfg, pause_buys)
        except Exception as exc:  # noqa: BLE001 — une paire ne bloque pas les autres
            audit.log("ERROR", where="cycle_symbol", symbol=symbol, detail=str(exc))
            audit.console(f"⚠️ {symbol} erreur : {exc}")


def _cycle_symbol(ex: Exchange, strat, risk: RiskManager, state: State,
                  symbol: str, price: float, equity: float, alloc: float,
                  cfg: Config, pause_buys: bool = False) -> None:
    pos = state.pos(symbol)

    # Stop-loss ATR — désactivé si « ne pas vendre à perte » (on n'accepte JAMAIS
    # de réaliser une petite perte : on attend la remontée).
    if pos.in_position and price <= pos.stop_price and not cfg.hold_until_profit:
        _flatten_symbol(ex, state, symbol, price, f"stop-loss @ {pos.stop_price:.2f}")
        return

    # Frein CATASTROPHE — même en « ne pas vendre à perte », on coupe si la position
    # s'effondre au-delà de -X % (évite de rester bloqué sur un actif qui plonge).
    if (pos.in_position and cfg.hold_until_profit and cfg.catastrophe_stop_pct > 0
            and pos.entry_price > 0
            and price <= pos.entry_price * (1 - cfg.catastrophe_stop_pct / 100.0)):
        _flatten_symbol(ex, state, symbol, price,
                        f"frein catastrophe -{cfg.catastrophe_stop_pct:.0f}% (protection)")
        return

    ohlcv = ex.fetch_ohlcv(symbol, limit=max(200, strat.min_candles() + 5))
    highs, lows, closes = _closed_candles(ohlcv)
    sig = strat.evaluate(highs, lows, closes, pos.in_position)
    # Format lisible par le tableau de bord : "<SYM> <ACTION> | prix= | equity="
    audit.console(f"{symbol} {sig.action} | prix={price:.2f} | equity={equity:.2f} | {sig.reason}")

    if sig.action == "BUY" and sig.atr and not pause_buys:
        stop = risk.compute_stop(price, sig.atr)
        cash = ex.quote_balance()  # USDT LIBRE réellement disponible pour acheter
        qty = risk.position_size(equity, price, stop, alloc=alloc, cash=cash)
        if qty <= 0:
            reason = ("cash libre insuffisant" if cash < cfg.min_order_usdt
                      else "taille nulle (risque/plafond/min ordre)")
            audit.log("SKIP_BUY", symbol=symbol, reason=reason, cash=round(cash, 2))
            audit.console(f"… {symbol} achat ignoré : {reason} (USDT libre={cash:.2f})")
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
        # « Ne pas vendre à perte » : on ne vend QUE si le prix est au-dessus du
        # prix d'entrée (+ marge mini). Sinon on garde et on attend la remontée.
        if cfg.hold_until_profit:
            min_sell = pos.entry_price * (1 + cfg.min_profit_pct / 100.0)
            if price < min_sell:
                audit.console(
                    f"⏳ {symbol} pas de vente à perte : prix {price:.2f} < entrée+marge "
                    f"{min_sell:.2f} — on attend la remontée")
                return
        _flatten_symbol(ex, state, symbol, price, sig.reason)


def _live_flag() -> bool:
    """Double verrou argent réel : drapeau --live OU variable BOT_LIVE=true."""
    if "--live" in sys.argv:
        return True
    return os.getenv("BOT_LIVE", "").strip().lower() in ("1", "true", "yes", "oui", "on")


if __name__ == "__main__":
    run(live=_live_flag())
