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

    # --- Lecture marché ---
    def fetch_ohlcv(self, limit: int = 200) -> List[list]:
        """Renvoie [[ts, open, high, low, close, volume], ...] bougies clôturées."""
        return self.client.fetch_ohlcv(
            self.cfg.symbol, timeframe=self.cfg.timeframe, limit=limit
        )

    def last_price(self) -> float:
        return float(self.client.fetch_ticker(self.cfg.symbol)["last"])

    # --- Lecture solde ---
    def quote_balance(self) -> float:
        """Solde disponible dans la devise de cotation (ex: USDT)."""
        quote = self.cfg.symbol.split("/")[1]
        bal = self.client.fetch_balance()
        return float(bal.get(quote, {}).get("free", 0.0) or 0.0)

    def base_balance(self) -> float:
        """Solde disponible dans l'actif de base (ex: BTC)."""
        base = self.cfg.symbol.split("/")[0]
        bal = self.client.fetch_balance()
        return float(bal.get(base, {}).get("free", 0.0) or 0.0)

    def equity_in_quote(self, price: float) -> float:
        """Capital total estimé en devise de cotation (quote + base*prix)."""
        return self.quote_balance() + self.base_balance() * price

    # --- Ordres (marché uniquement) ---
    def amount_to_precision(self, qty: float) -> float:
        return float(self.client.amount_to_precision(self.cfg.symbol, qty))

    def market_buy(self, qty: float) -> dict:
        qty = self.amount_to_precision(qty)
        return self.client.create_order(self.cfg.symbol, "market", "buy", qty)

    def market_sell(self, qty: float) -> dict:
        qty = self.amount_to_precision(qty)
        return self.client.create_order(self.cfg.symbol, "market", "sell", qty)
