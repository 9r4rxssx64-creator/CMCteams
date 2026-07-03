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
        """Capital total = cash (quote) + somme(base détenue * prix) sur toutes les paires."""
        total = self.quote_balance()
        bal = self.client.fetch_balance()
        for sym, px in prices.items():
            if not px:
                continue
            base = sym.split("/")[0]
            total += float(bal.get(base, {}).get("free", 0.0) or 0.0) * px
        return total

    # --- Ordres (marché uniquement, par paire) ---
    def amount_to_precision(self, symbol: str, qty: float) -> float:
        return float(self.client.amount_to_precision(symbol, qty))

    def market_buy(self, symbol: str, qty: float) -> dict:
        qty = self.amount_to_precision(symbol, qty)
        return self.client.create_order(symbol, "market", "buy", qty)

    def market_sell(self, symbol: str, qty: float) -> dict:
        qty = self.amount_to_precision(symbol, qty)
        return self.client.create_order(symbol, "market", "sell", qty)
