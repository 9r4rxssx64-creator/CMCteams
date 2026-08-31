"""Tests hors-ligne du mode MULTI-CRYPTOS (aucun réseau, aucune clé).
   python3 test_multi.py

Vérifie : parsing SYMBOLS, garde-fou même-devise, positions par paire,
répartition du capital (alloc), achat/vente par paire, kill = solde TOUT.
"""
from __future__ import annotations

import os
import sys
import types

# ccxt n'est pas installé en local : on le stub (exchange.py l'importe au chargement).
sys.modules.setdefault("ccxt", types.ModuleType("ccxt"))

from config import Config          # noqa: E402
from risk import RiskManager, State, Position  # noqa: E402
from strategy import Signal        # noqa: E402
import bot                          # noqa: E402

P = {"p": 0, "f": 0}
def ok(c, m):
    if c:
        P["p"] += 1
    else:
        P["f"] += 1
        print("  ✗ " + m)


def cfg_with(**env) -> Config:
    for k in ("SYMBOLS", "SYMBOL", "HOLD_UNTIL_PROFIT", "CATASTROPHE_STOP_PCT",
              "STRATEGY", "MIN_PROFIT_PCT"):
        os.environ.pop(k, None)
    base = {"BINANCE_API_KEY": "k", "BINANCE_API_SECRET": "s", "TESTNET": "true"}
    base.update(env)
    for k, v in base.items():
        os.environ[k] = v
    return Config.load()


# ---- 1) Parsing SYMBOLS ----
c = cfg_with(SYMBOLS="BTC/USDT, eth-usdt , SOLUSDT")
ok(c.symbols == ["BTC/USDT", "ETH/USDT", "SOL/USDT"], f"parse SYMBOLS -> {c.symbols}")
ok(c.symbol == "BTC/USDT" and c.quote == "USDT", "symbol/quote rétro-compat")

c1 = cfg_with(SYMBOL="ETH/USDT")
ok(c1.symbols == ["ETH/USDT"], "repli SYMBOL (singulier)")

cdef = cfg_with()
ok(cdef.symbols == ["BTC/USDT"], "défaut BTC/USDT")

# ---- 2) Garde-fou même devise de cotation ----
try:
    cfg_with(SYMBOLS="BTC/USDT, ETH/EUR")
    ok(False, "devises mixtes doivent lever")
except ValueError:
    ok(True, "devises mixtes -> ValueError")

# ---- 3) State positions par paire + roundtrip + legacy ----
st = State()
st.pos("BTC/USDT").in_position = True
st.pos("ETH/USDT")
ok("BTC/USDT" in st.positions and "ETH/USDT" in st.positions, "positions créées par paire")
d = st.to_dict()
ok(d["positions"]["BTC/USDT"]["in_position"] is True, "to_dict sérialise les positions")
# legacy single-position -> migré
import risk as riskmod
raw_legacy = {"position": {"in_position": True, "qty": 0.5, "entry_price": 100, "stop_price": 90}}
import json
with open(riskmod.STATE_PATH, "w") as fh:
    json.dump(raw_legacy, fh)
stl = State.load()
os.remove(riskmod.STATE_PATH)
ok(stl.pos("BTC/USDT").in_position is True and stl.pos("BTC/USDT").qty == 0.5, "legacy migré vers positions")

# ---- 4) Répartition du capital (alloc) ----
c4 = cfg_with(SYMBOLS="BTC/USDT,ETH/USDT,SOL/USDT,BNB/USDT", RISK_PER_TRADE_PCT="1", MAX_POSITION_PCT="40")
rm = RiskManager(c4)
q_full = rm.position_size(10000, 100, 95, alloc=1.0)
q_quart = rm.position_size(10000, 100, 95, alloc=0.25)
ok(abs(q_quart - q_full / 4) < 1e-9, "alloc=1/4 divise la taille par 4")

# ---- 5) Achat / vente par paire (faux exchange + strat stubbée) ----
class FakeEx:
    def __init__(self, cash=10000.0):
        self.orders = []
        self.bases = {}  # base -> qty détenue
        self.cash = cash  # USDT libre disponible pour acheter
    def prices(self, syms):
        return {s: 100.0 for s in syms}
    def equity_in_quote(self, prices):
        return 10000.0
    def quote_balance(self):
        return self.cash
    def last_price(self, symbol):
        return 100.0
    def fetch_ohlcv(self, symbol, limit=200):
        return [[0, 100, 101, 99, 100, 1]] * 30
    def base_balance(self, symbol):
        return self.bases.get(symbol.split("/")[0], 0.0)
    def market_buy(self, symbol, qty):
        self.orders.append(("BUY", symbol, qty))
        self.bases[symbol.split("/")[0]] = qty
        return {"filled": qty, "average": 100.0}
    def market_sell(self, symbol, qty):
        self.orders.append(("SELL", symbol, qty))
        self.bases[symbol.split("/")[0]] = 0.0
        return {"filled": qty, "average": 100.0}

class StubStrat:
    def __init__(self, action):
        self.action = action
    def min_candles(self):
        return 10
    def evaluate(self, h, l, c, in_pos):
        if self.action == "BUY" and not in_pos:
            return Signal("BUY", 100.0, 2.0, "stub buy")
        if self.action == "SELL" and in_pos:
            return Signal("SELL", 100.0, 2.0, "stub sell")
        return Signal("HOLD", 100.0, 2.0, "stub hold")

os.environ.pop("BOT_KILL", None)
c5 = cfg_with(SYMBOLS="BTC/USDT,ETH/USDT")
rm5 = RiskManager(c5)
st5 = State()
fx = FakeEx()
alloc5 = 1.0 / len(c5.symbols)
# BUY sur les 2 paires
bot._cycle_symbol(fx, StubStrat("BUY"), rm5, st5, "BTC/USDT", 100.0, 10000.0, alloc5, c5)
bot._cycle_symbol(fx, StubStrat("BUY"), rm5, st5, "ETH/USDT", 100.0, 10000.0, alloc5, c5)
ok(st5.pos("BTC/USDT").in_position and st5.pos("ETH/USDT").in_position, "achat ouvre une position par paire")
ok(len([o for o in fx.orders if o[0] == "BUY"]) == 2, "2 ordres d'achat (un par paire)")
# SELL sur BTC uniquement
bot._cycle_symbol(fx, StubStrat("SELL"), rm5, st5, "BTC/USDT", 100.0, 10000.0, alloc5, c5)
ok(not st5.pos("BTC/USDT").in_position and st5.pos("ETH/USDT").in_position, "vente ferme UNE paire, l'autre reste")

# ---- 5b) Borne cash : un achat n'excède jamais le cash libre (anti « insufficient balance ») ----
fx_low = FakeEx(cash=5.0)  # 5 USDT libres < ordre minimum (11) -> aucun achat
st_low = State()
bot._cycle_symbol(fx_low, StubStrat("BUY"), rm5, st_low, "BTC/USDT", 100.0, 10000.0, alloc5, c5)
ok(not st_low.pos("BTC/USDT").in_position, "cash libre insuffisant -> pas d'achat (pas de refus exchange)")
ok(len(fx_low.orders) == 0, "cash libre insuffisant -> aucun ordre envoyé")

fx_cap = FakeEx(cash=50.0)  # assez pour un petit ordre : qty bornée à ~50/100 = 0.5 max
st_cap = State()
bot._cycle_symbol(fx_cap, StubStrat("BUY"), rm5, st_cap, "BTC/USDT", 100.0, 10000.0, alloc5, c5)
bought = [o for o in fx_cap.orders if o[0] == "BUY"]
ok(len(bought) == 1 and bought[0][2] * 100.0 <= 50.0 + 1e-6,
   f"achat borné au cash libre (notional <= 50) -> {bought}")

# ---- 5c) Reconciliation : une crypto déjà détenue devient une position gérée ----
c5c = cfg_with(SYMBOLS="BTC/USDT,ETH/USDT")
rm5c = RiskManager(c5c)
st_rec = State()
fx_rec = FakeEx()
fx_rec.bases = {"BTC": 1.0}  # le compte détient 1 BTC, mais state ne le sait pas
bot._reconcile_positions(fx_rec, StubStrat("HOLD"), rm5c, st_rec, c5c)
ok(st_rec.pos("BTC/USDT").in_position and st_rec.pos("BTC/USDT").qty == 1.0,
   "crypto détenue reprise comme position (sera revendue -> libère du cash)")
ok(st_rec.pos("BTC/USDT").stop_price > 0, "position reprise reçoit un stop protecteur")
ok(not st_rec.pos("ETH/USDT").in_position, "paire non détenue -> pas de position fantôme")

# ---- 5d) « Ne pas vendre à perte » : garde tant qu'on n'est pas en profit ----
c_hold = cfg_with(SYMBOLS="BTC/USDT", HOLD_UNTIL_PROFIT="true")
ok(c_hold.hold_until_profit is True, "HOLD_UNTIL_PROFIT lu depuis l'env")
rm_h = RiskManager(c_hold)
st_h = State()
ph = st_h.pos("BTC/USDT")
ph.in_position = True; ph.entry_price = 100.0; ph.qty = 1.0; ph.stop_price = 0.0
fxh = FakeEx(); fxh.bases = {"BTC": 1.0}
# Signal SELL mais prix 95 < entrée 100 -> on NE vend PAS (attente remontée)
bot._cycle_symbol(fxh, StubStrat("SELL"), rm_h, st_h, "BTC/USDT", 95.0, 10000.0, alloc5, c_hold)
ok(st_h.pos("BTC/USDT").in_position, "ne vend pas à perte : position conservée")
ok(len([o for o in fxh.orders if o[0] == "SELL"]) == 0, "aucune vente à perte envoyée")
# Prix 101 > entrée + marge -> on prend le profit
bot._cycle_symbol(fxh, StubStrat("SELL"), rm_h, st_h, "BTC/USDT", 101.0, 10000.0, alloc5, c_hold)
ok(not st_h.pos("BTC/USDT").in_position, "vend une fois en profit (101 > 100.3)")

# ---- 5e) Frein catastrophe : coupe même en mode « ne pas vendre à perte » ----
c_cat = cfg_with(SYMBOLS="BTC/USDT", HOLD_UNTIL_PROFIT="true", CATASTROPHE_STOP_PCT="20")
rm_cat = RiskManager(c_cat)
st_cat = State()
pc = st_cat.pos("BTC/USDT")
pc.in_position = True; pc.entry_price = 100.0; pc.qty = 1.0; pc.stop_price = 0.0
fxcat = FakeEx(); fxcat.bases = {"BTC": 1.0}
bot._cycle_symbol(fxcat, StubStrat("HOLD"), rm_cat, st_cat, "BTC/USDT", 79.0, 10000.0, alloc5, c_cat)
ok(not st_cat.pos("BTC/USDT").in_position, "frein catastrophe -20% coupe (79 <= 80)")
# À -10% seulement, on garde (pas encore catastrophe)
st_cat2 = State(); p2 = st_cat2.pos("BTC/USDT")
p2.in_position = True; p2.entry_price = 100.0; p2.qty = 1.0; p2.stop_price = 0.0
fxcat2 = FakeEx(); fxcat2.bases = {"BTC": 1.0}
bot._cycle_symbol(fxcat2, StubStrat("HOLD"), rm_cat, st_cat2, "BTC/USDT", 90.0, 10000.0, alloc5, c_cat)
ok(st_cat2.pos("BTC/USDT").in_position, "-10% : on garde (pas de vente à perte)")

# ---- 5f) pause_buys : le garde-fou pause les achats sans vendre ----
c_pb = cfg_with(SYMBOLS="BTC/USDT", HOLD_UNTIL_PROFIT="true")
st_pb = State(); fxpb = FakeEx()
bot._cycle_symbol(fxpb, StubStrat("BUY"), RiskManager(c_pb), st_pb, "BTC/USDT", 100.0, 10000.0, alloc5, c_pb, True)
ok(not st_pb.pos("BTC/USDT").in_position, "pause_buys=True : aucun achat ouvert")
ok(len(fxpb.orders) == 0, "pause_buys=True : aucun ordre")

# ---- 5g) Fabrique de stratégie (STRATEGY=ema|meanrev) ----
from strategy import make_strategy, MeanReversionStrategy  # noqa: E402
ok(isinstance(make_strategy(cfg_with(STRATEGY="meanrev")), MeanReversionStrategy),
   "STRATEGY=meanrev -> MeanReversionStrategy")
ok(type(make_strategy(cfg_with(STRATEGY="ema"))).__name__ == "Strategy",
   "STRATEGY=ema -> Strategy EMA")

# ---- 5h) Indicateurs sma / rolling_std ----
from indicators import sma, rolling_std  # noqa: E402
ok(sma([2, 4, 6], 3)[-1] == 4.0, "sma calcule la moyenne")
ok(rolling_std([2, 2, 2], 3)[-1] == 0.0, "rolling_std nul sur série constante")

# ---- 5i) Mode PAPIER : portefeuille virtuel (aucune clé requise) ----
c_pap = cfg_with(SYMBOLS="BTC/USDT", PAPER="true", BOT_NAME="p1")
ok(c_pap.paper is True and c_pap.bot_name == "p1", "PAPER + BOT_NAME lus depuis l'env")
from paper import PaperExchange  # noqa: E402
pe = PaperExchange.__new__(PaperExchange)  # sans réseau (pas de load_markets)
pe.cfg = c_pap
pe.wallet = {"USDT": 1000.0}
pe.last_price = lambda s: 100.0
pe._last_px = {}  # normalement posé par __init__ (ici on court-circuite le réseau)
o = pe.market_buy("BTC/USDT", 2.0)
ok(o["filled"] == 2.0 and abs(pe.wallet["USDT"] - (1000 - 2 * 100 * 1.001)) < 1e-6,
   "achat papier débite le cash + frais 0.1%")
ok(pe.base_balance("BTC/USDT") == 2.0, "achat papier crédite la crypto")
o2 = pe.market_buy("BTC/USDT", 100.0)  # bien plus que le cash restant
ok(o2["filled"] * 100 * 1.001 <= 1000 - 2 * 100 * 1.001 + 1e-6,
   "achat papier borné au cash virtuel")
q_before = pe.quote_balance()
o3 = pe.market_sell("BTC/USDT", 999.0)  # plus que détenu -> vend tout
ok(pe.base_balance("BTC/USDT") == 0.0 and pe.quote_balance() > q_before,
   "vente papier borne à la quantité détenue + crédite le cash")
try:
    pe.market_sell("BTC/USDT", 1.0)
    ok(False, "vendre sans rien détenir doit lever")
except ValueError:
    ok(True, "vente papier sans position -> erreur claire")
ok(abs(pe.equity_in_quote({"BTC/USDT": 100.0}) - pe.quote_balance()) < 1e-9,
   "équité papier = cash quand plus de crypto")

# ---- 5j) STRATEGY=dipup -> DipUptrendStrategy ----
from strategy import DipUptrendStrategy  # noqa: E402
ok(isinstance(make_strategy(cfg_with(STRATEGY="dipup")), DipUptrendStrategy),
   "STRATEGY=dipup -> DipUptrendStrategy")

# ---- 6) Kill = solde TOUT ----
st6 = State()
st6.pos("BTC/USDT").in_position = True; st6.pos("BTC/USDT").qty = 1
st6.pos("ETH/USDT").in_position = True; st6.pos("ETH/USDT").qty = 2
fx6 = FakeEx(); fx6.bases = {"BTC": 1, "ETH": 2}
bot._flatten_all(fx6, st6, {"BTC/USDT": 100, "ETH/USDT": 100}, "kill switch")
ok(not st6.pos("BTC/USDT").in_position and not st6.pos("ETH/USDT").in_position, "kill solde toutes les paires")
ok(len([o for o in fx6.orders if o[0] == "SELL"]) == 2, "kill -> 2 ventes")

# ---- 7) Équité fiable : pas de coupure/liquidation sur prix manquant ----
st_rel = State()
st_rel.pos("BTC/USDT").in_position = True
st_rel.pos("ETH/USDT").in_position = True
ok(bot._equity_reliable({"BTC/USDT": 100.0, "ETH/USDT": 200.0}, st_rel),
   "toutes positions ouvertes ont un prix -> équité fiable")
ok(not bot._equity_reliable({"BTC/USDT": 100.0, "ETH/USDT": None}, st_rel),
   "prix manquant sur une position ouverte -> équité NON fiable (pas de coupure)")
st_rel2 = State()  # aucune position
ok(bot._equity_reliable({"BTC/USDT": None}, st_rel2),
   "aucune position ouverte -> fiable (juste du cash)")
st_rel3 = State()
st_rel3.pos("BTC/USDT").in_position = True
st_rel3.pos("ETH/USDT")  # ETH connue mais plate (pas de position)
ok(bot._equity_reliable({"BTC/USDT": 100.0, "ETH/USDT": None}, st_rel3),
   "prix manquant sur une paire NON tenue -> reste fiable")

# ---- 8) Reconcile : prix d'entrée = coût réel de l'historique (anti vente à perte) ----
c8 = cfg_with(SYMBOLS="BTC/USDT")
st8 = State(); fx8 = FakeEx(); fx8.bases = {"BTC": 1.0}
fx8.average_entry_from_trades = lambda sym, qty: 120.0  # vrai coût 120 > prix courant 100
bot._reconcile_positions(fx8, StubStrat("HOLD"), RiskManager(c8), st8, c8)
ok(abs(st8.pos("BTC/USDT").entry_price - 120.0) < 1e-9,
   "reconcile: entrée = coût réel historique (120), pas le prix courant (100)")
st8b = State(); fx8b = FakeEx(); fx8b.bases = {"BTC": 1.0}
fx8b.average_entry_from_trades = lambda sym, qty: None  # historique indispo
bot._reconcile_positions(fx8b, StubStrat("HOLD"), RiskManager(c8), st8b, c8)
ok(abs(st8b.pos("BTC/USDT").entry_price - 100.0) < 1e-9,
   "reconcile: historique indispo -> repli sur prix courant (100)")
st8c = State(); fx8c = FakeEx(); fx8c.bases = {"BTC": 1.0}  # FakeEx SANS la méthode
bot._reconcile_positions(fx8c, StubStrat("HOLD"), RiskManager(c8), st8c, c8)
ok(abs(st8c.pos("BTC/USDT").entry_price - 100.0) < 1e-9,
   "reconcile: exchange sans historique -> repli prix courant (pas d'erreur)")

# ---- 9) equity_in_quote : prix manquant réutilise le dernier prix connu ----
from exchange import Exchange  # noqa: E402
class PxEx(Exchange):  # noqa: E402 — sonde le repli last_px sans réseau
    def __init__(self):
        self._last_px = {}
        self._bal = {"BTC": {"free": 2.0}}
    def quote_balance(self):
        return 1000.0
    def fetch_balance(self):  # override du client réseau
        return self._bal
    @property
    def client(self):
        return self
px = PxEx()
e1 = Exchange.equity_in_quote(px, {"BTC/USDT": 100.0})  # 1000 + 2*100 = 1200
ok(abs(e1 - 1200.0) < 1e-9, "equity_in_quote: prix présent -> 1200")
e2 = Exchange.equity_in_quote(px, {"BTC/USDT": None})   # prix manquant -> dernier connu 100
ok(abs(e2 - 1200.0) < 1e-9,
   "equity_in_quote: prix manquant réutilise le dernier prix connu (pas d'effondrement)")

print(f"test_multi.py : {P['p']} OK / {P['f']} FAIL")
sys.exit(1 if P["f"] else 0)
