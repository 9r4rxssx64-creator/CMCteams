# 🤖 Bot de trading crypto — Binance (spot, full-auto)

Bot automatique **prudent par défaut** : il tourne en **testnet (faux argent)**
tant que tu ne l'autorises pas explicitement à toucher de l'argent réel.

---

## ⚠️ À lire d'abord (2 min — ça t'évite de perdre de l'argent)

1. **Personne ne peut garantir des gains.** Ce bot ne « fabrique » pas de
   l'argent. C'est un outil de **discipline** (achète/vend selon des règles,
   sans émotion, avec stop-loss). Il peut perdre.
2. **On valide TOUJOURS en testnet d'abord**, on mesure les résultats réels,
   et seulement ensuite on branche du vrai argent — sans changer le code.
3. **La clé API ne doit JAMAIS avoir la permission de retrait.** Comme ça,
   même volée, elle ne peut pas vider ton compte.
4. Le bot est **long-only** (il achète puis revend — jamais de vente à
   découvert ni de levier). C'est le profil le plus sûr.

---

## 🔒 Sécurité intégrée

| Garde-fou | Ce que ça fait |
|---|---|
| 🧪 Testnet par défaut | Impossible de trader du vrai argent par accident |
| 🛑 Kill switch | Crée un fichier `KILL` → le bot solde et s'arrête |
| 📉 Stop-loss ATR | Coupe une position qui tourne mal |
| 📅 Plafond perte/jour | Le bot se coupe si la perte du jour dépasse la limite |
| 📉 Max drawdown | Le bot se coupe si le capital baisse trop depuis son sommet |
| 🔑 Clés hors code | Les clés vivent dans `.env` (jamais committé) |
| 📒 Journal d'audit | Chaque décision est écrite dans `logs/audit.jsonl` |
| 💶 Double verrou réel | Argent réel = `TESTNET=false` **ET** drapeau `--live` |

---

## 🚀 Installation (pas à pas)

```bash
cd crypto-bot
python3 -m venv .venv && source .venv/bin/activate   # (Windows: .venv\Scripts\activate)
pip install -r requirements.txt
cp .env.example .env        # puis ouvre .env et remplis-le
```

## Étape 1 — Backtest (aucune clé nécessaire)

Mesure la stratégie sur des données de démo :

```bash
python3 backtest.py
```

Tu verras le résultat de la stratégie **comparé à “acheter et garder”**.
Si la stratégie perd nettement ici, on l'ajuste avant d'aller plus loin.

## Étape 2 — Clés TESTNET (faux argent)

1. Va sur **https://testnet.binance.vision** (connexion avec GitHub).
2. Génère une clé API de testnet.
3. Colle `BINANCE_API_KEY` et `BINANCE_API_SECRET` dans `.env`.
4. Laisse `TESTNET=true`.

```bash
python3 bot.py
```

Laisse-le tourner **plusieurs jours/semaines** et regarde `logs/audit.jsonl`.
On juge sur les **chiffres réels**, pas sur une impression.

## Étape 3 — Argent réel (seulement si le testnet est convaincant)

1. Sur **Binance réel** → API Management → crée une clé :
   - ✅ Enable Spot Trading
   - ❌ **Enable Withdrawals : NON** (jamais)
   - ✅ Restreins à ton adresse IP si tu peux
2. Mets ces clés dans `.env` et passe `TESTNET=false`.
3. Commence **petit** (tes 100–300 €). Lance avec le double verrou :

```bash
python3 bot.py --live
```

---

## 🖥️ Où le faire tourner 24/7 ?

Un bot **full-auto** doit tourner **en continu** — s'il s'éteint, il ne
surveille plus tes positions.

- **Ton PC** : possible, mais uniquement s'il reste **allumé et éveillé** (pas
  de mise en veille). Peu fiable sur le long terme.
- **Petit serveur (VPS) ~4–6 €/mois** (Hetzner, OVH, Contabo…) : **recommandé**
  pour du full-auto. Toujours allumé, tu t'y connectes quand tu veux.

Dis-moi ce que tu préfères et je te donne la commande exacte pour l'installer
en service qui redémarre tout seul.

---

## 🛑 Tout couper immédiatement (kill switch)

```bash
# Dans le dossier crypto-bot :
touch KILL            # (ou crée un fichier vide nommé "KILL")
```

Au cycle suivant, le bot **vend la position** et **s'arrête**. Pour relancer,
supprime le fichier `KILL`.

---

## ⚙️ Réglages (fichier `.env`)

Tout est expliqué dans `.env.example` : marché (`SYMBOL`), rythme, paramètres
de stratégie (EMA/RSI/ATR) et **garde-fous de risque**. Commence avec les
valeurs par défaut — on les affine avec les résultats mesurés.

---

## ❌ Ce que ce bot ne fait PAS (par choix de sécurité)

- Pas de retrait de fonds (la permission n'est jamais utilisée).
- Pas de levier, pas de futures, pas de vente à découvert.
- Pas de DeFi / Phantom / Solana (trop risqué pour démarrer).
- Aucune promesse de rendement. **On mesure, on ajuste, on avance prudemment.**
