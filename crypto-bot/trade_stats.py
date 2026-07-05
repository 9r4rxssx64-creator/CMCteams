"""Compte les trades ACHAT/VENTE dans les logs Railway (JSON dans /tmp/logs.json)
et calcule le gain/perte NET réalisé (appariement entrée→sortie par paire, FIFO).

Sort des lignes KEY='value' (à `source` dans le shell du workflow) :
  BUYS, SELLS, WINS, LOSSES, NET, OPEN, FIRST, LAST, NLINES

Seules les lignes `console` du bot sont visibles côté Railway :
  🟢 SYM ACHAT qty=Q @ PRIX (stop S)
  🔻 SYM VENTE (raison) qty=Q @ PRIX
Le NET est le P&L RÉALISÉ des positions bouclées (≠ variation d'équité, qui bouge
aussi avec les prix des soldes testnet). Honnête : ne couvre que la fenêtre de logs
disponible (FIRST→LAST).
"""
import json
import re

try:
    rows = json.load(open('/tmp/logs.json'))
except Exception:
    rows = []

rows = sorted(rows, key=lambda r: r.get('timestamp') or '')
buy_re = re.compile(r'🟢\s+(\S+)\s+ACHAT\s+qty=([\d.]+)\s+@\s+([\d.]+)')
sell_re = re.compile(r'🔻\s+(\S+)\s+VENTE\s+\(([^)]*)\)\s+qty=([\d.]+)\s+@\s+([\d.]+)')

op = {}                      # symbole -> lots ouverts [[qty, prix], ...]
buys = sells = wins = losses = 0
net = 0.0
first = last = None

for r in rows:
    msg = r.get('message') or ''
    b = buy_re.search(msg)
    s = sell_re.search(msg)
    if b or s:
        if first is None:
            first = r.get('timestamp')
        last = r.get('timestamp')
    if b:
        op.setdefault(b.group(1), []).append([float(b.group(2)), float(b.group(3))])
        buys += 1
    elif s:
        sym = s.group(1)
        qty = float(s.group(3))
        px = float(s.group(4))
        sells += 1
        lots = op.get(sym, [])
        rem = qty
        pnl = 0.0
        while rem > 1e-12 and lots:
            lot = lots[0]
            take = min(rem, lot[0])
            pnl += (px - lot[1]) * take
            lot[0] -= take
            rem -= take
            if lot[0] <= 1e-12:
                lots.pop(0)
        net += pnl
        if pnl >= 0:
            wins += 1
        else:
            losses += 1

still = sum(len(v) for v in op.values())


def q(x):
    return "'" + str('-' if x is None else x).replace("'", "") + "'"


for k, v in [
    ('BUYS', buys), ('SELLS', sells), ('WINS', wins), ('LOSSES', losses),
    ('NET', round(net, 2)), ('OPEN', still),
    ('FIRST', first), ('LAST', last), ('NLINES', len(rows)),
]:
    print(k + '=' + q(v))
