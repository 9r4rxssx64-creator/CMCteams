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
    for k in ("SYMBOLS", "SYMBOL"):
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

# ---- 6) Kill = solde TOUT ----
st6 = State()
st6.pos("BTC/USDT").in_position = True; st6.pos("BTC/USDT").qty = 1
st6.pos("ETH/USDT").in_position = True; st6.pos("ETH/USDT").qty = 2
fx6 = FakeEx(); fx6.bases = {"BTC": 1, "ETH": 2}
bot._flatten_all(fx6, st6, {"BTC/USDT": 100, "ETH/USDT": 100}, "kill switch")
ok(not st6.pos("BTC/USDT").in_position and not st6.pos("ETH/USDT").in_position, "kill solde toutes les paires")
ok(len([o for o in fx6.orders if o[0] == "SELL"]) == 2, "kill -> 2 ventes")

print(f"test_multi.py : {P['p']} OK / {P['f']} FAIL")
sys.exit(1 if P["f"] else 0)
