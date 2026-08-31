"""Connexion Binance via ccxt (spot). Mode testnet par défaut.

Sécurité : la clé API ne doit PAS avoir la permission de retrait. Ce module
n'appelle jamais de fonction de retrait — il ne sait que lire le marché, lire
le solde, et passer des ordres au marché (achat/vente).
"""
from __future__ import annotations

from typing import List

import ccxt


class Exchange:
    def __init__(self, cfg) -> None:
        self.cfg = cfg
        self.client = ccxt.binance({
            "apiKey": cfg.api_key,
            "secret": cfg.api_secret,
            "enableRateLimit": True,
            "options": {"defaultType": "spot"},
        })
        if cfg.testnet:
            # Bascule sur testnet.binance.vision (faux argent)
            self.client.set_sandbox_mode(True)
        self.client.load_markets()
        # Dernier prix connu par paire : sert de repli quand un ticker rate ce
        # cycle → l'équité ne s'effondre pas artificiellement (anti fausse coupure).
        self._last_px: dict = {}

    # --- Lecture marché (par paire) ---
    def fetch_ohlcv(self, symbol: str, limit: int = 200) -> List[list]:
        """Renvoie [[ts, open, high, low, close, volume], ...] bougies clôturées."""
        return self.client.fetch_ohlcv(symbol, timeframe=self.cfg.timeframe, limit=limit)

    def last_price(self, symbol: str) -> float:
        return float(self.client.fetch_ticker(symbol)["last"])

    def prices(self, symbols: List[str]) -> dict:
        """Dernier prix de chaque paire (un appel par paire, tolérant aux erreurs)."""
        out = {}
        for s in symbols:
            try:
                out[s] = self.last_price(s)
            except Exception:  # noqa: BLE001 — une paire indispo ne bloque pas les autres
                out[s] = None
        return out

    # --- Lecture solde ---
    def quote_balance(self) -> float:
        """Solde disponible dans la devise de cotation commune (ex: USDT)."""
        bal = self.client.fetch_balance()
        return float(bal.get(self.cfg.quote, {}).get("free", 0.0) or 0.0)

    def base_balance(self, symbol: str) -> float:
        """Solde disponible dans l'actif de base d'une paire (ex: BTC pour BTC/USDT)."""
        base = symbol.split("/")[0]
        bal = self.client.fetch_balance()
        return float(bal.get(base, {}).get("free", 0.0) or 0.0)

    def equity_in_quote(self, prices: dict) -> float:
        """Capital total = cash (quote) + somme(base détenue * prix) sur toutes les paires.

        Un prix manquant ce cycle (raté réseau sur un ticker) n'est PAS traité
        comme « valeur nulle » : on réutilise le DERNIER prix connu de l'actif.
        Sinon l'équité s'effondre artificiellement → fausse coupure de risque /
        liquidation de TOUT le portefeuille sur un simple hoquet réseau (bug
        argent réel). L'appelant (bot._equity_reliable) ignore en plus les
        coupures ce cycle si une position ouverte n'a aucun prix.
        """
        total = self.quote_balance()
        bal = self.client.fetch_balance()
        for sym, px in prices.items():
            if px:
                self._last_px[sym] = px          # mémorise le dernier prix connu
            else:
                px = self._last_px.get(sym)      # repli sur le dernier prix connu
            if not px:
                continue                          # jamais vu de prix → inévitable
            base = sym.split("/")[0]
            total += float(bal.get(base, {}).get("free", 0.0) or 0.0) * px
        return total

    def average_entry_from_trades(self, symbol: str, held_qty: float):
        """Coût moyen RÉEL des achats couvrant la quantité détenue (le plus récent
        d'abord), reconstruit depuis l'historique de trades du compte.

        Sert à retrouver le vrai prix d'entrée après un redéploiement Railway
        (state.json éphémère) → le mode « ne jamais vendre à perte » compare bien
        au prix réellement payé, pas au prix courant. Renvoie None si l'historique
        est indisponible/vide (l'appelant tombe alors sur le prix courant).
        """
        try:
            trades = self.client.fetch_my_trades(symbol, limit=100)
        except Exception:  # noqa: BLE001 — pas d'historique dispo → repli appelant
            return None
        buys = [
            t for t in (trades or [])
            if t.get("side") == "buy" and t.get("price") and t.get("amount")
        ]
        if not buys:
            return None
        buys.sort(key=lambda t: t.get("timestamp") or 0, reverse=True)  # récents d'abord
        need = float(held_qty)
        cost = 0.0
        got = 0.0
        for t in buys:
            if need <= 0:
                break
            take = min(float(t["amount"]), need)
            cost += take * float(t["price"])
            got += take
            need -= take
        return (cost / got) if got > 0 else None

    # --- Ordres (marché uniquement, par paire) ---
    def amount_to_precision(self, symbol: str, qty: float) -> float:
        return float(self.client.amount_to_precision(symbol, qty))

    def market_buy(self, symbol: str, qty: float) -> dict:
        qty = self.amount_to_precision(symbol, qty)
        return self.client.create_order(symbol, "market", "buy", qty)

    def market_sell(self, symbol: str, qty: float) -> dict:
        qty = self.amount_to_precision(symbol, qty)
        return self.client.create_order(symbol, "market", "sell", qty)
