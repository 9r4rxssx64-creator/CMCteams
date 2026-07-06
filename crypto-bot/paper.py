"""Portefeuille VIRTUEL (paper trading) — zéro compte, zéro clé, zéro clic.

Le bot lit les VRAIS prix (endpoints publics Binance, aucune clé requise) mais
les achats/ventes sont SIMULÉS dans un portefeuille en mémoire (10 000 faux
USDT au départ, frais 0,1 % appliqués comme sur le vrai marché).

Pourquoi : faire tourner un 2e bot (le « champion ») en parallèle du bot #1
sans créer de 2e compte testnet — Kevin n'a RIEN à faire. Limite honnête :
le portefeuille repart à 10 000 à chaque redéploiement (mémoire éphémère) ;
les logs 🟢 ACHAT / 🔻 VENTE restent la trace comptée par le Status.
"""
from __future__ import annotations

from exchange import Exchange

PAPER_FEE = 0.001  # 0,1 % par ordre, comme le spot Binance


class PaperExchange(Exchange):
    """Même interface que Exchange, mais soldes et ordres 100 % simulés."""

    def __init__(self, cfg, start_usdt: float = 10000.0) -> None:
        super().__init__(cfg)  # client public (clés vides OK pour les données)
        self.wallet = {cfg.quote: float(start_usdt)}

    # --- Soldes simulés ---
    def quote_balance(self) -> float:
        return float(self.wallet.get(self.cfg.quote, 0.0))

    def base_balance(self, symbol: str) -> float:
        return float(self.wallet.get(symbol.split("/")[0], 0.0))

    def equity_in_quote(self, prices: dict) -> float:
        total = self.quote_balance()
        for sym, px in prices.items():
            if not px:
                continue
            total += float(self.wallet.get(sym.split("/")[0], 0.0)) * px
        return total

    # --- Ordres simulés (remplis au dernier prix réel) ---
    def amount_to_precision(self, symbol: str, qty: float) -> float:
        return round(float(qty), 6)

    def market_buy(self, symbol: str, qty: float) -> dict:
        qty = self.amount_to_precision(symbol, qty)
        price = self.last_price(symbol)
        cost = qty * price * (1 + PAPER_FEE)
        cash = self.quote_balance()
        if cost > cash:  # jamais plus que le cash virtuel disponible
            qty = self.amount_to_precision(symbol, (cash / (1 + PAPER_FEE)) / price)
            cost = qty * price * (1 + PAPER_FEE)
        if qty <= 0:
            raise ValueError("paper: cash virtuel insuffisant")
        base = symbol.split("/")[0]
        self.wallet[self.cfg.quote] = cash - cost
        self.wallet[base] = self.wallet.get(base, 0.0) + qty
        return {"filled": qty, "average": price}

    def market_sell(self, symbol: str, qty: float) -> dict:
        base = symbol.split("/")[0]
        held = float(self.wallet.get(base, 0.0))
        qty = self.amount_to_precision(symbol, min(float(qty), held))
        if qty <= 0:
            raise ValueError("paper: rien à vendre")
        price = self.last_price(symbol)
        self.wallet[base] = held - qty
        self.wallet[self.cfg.quote] = self.quote_balance() + qty * price * (1 - PAPER_FEE)
        return {"filled": qty, "average": price}
