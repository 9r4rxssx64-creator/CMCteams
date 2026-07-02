# 📱 Faire tourner le bot 24/7 SANS ordinateur (tout depuis l'iPhone)

Le bot tourne sur un petit serveur cloud (**Railway**, ~5 €/mois). Toute
l'installation se fait depuis **Safari sur ton iPhone** — aucun ordinateur,
aucun terminal.

⚠️ Rappel : on démarre en **TESTNET (faux argent)**. Zéro risque.

---

## Étape A — Ta clé testnet (2 min)

1. Ouvre **https://testnet.binance.vision**
2. « Log In with GitHub » (ton compte GitHub habituel)
3. Bouton **« Generate HMAC_SHA256 Key »**
4. **Copie l'API Key et le Secret** dans tes notes (le secret ne s'affiche
   qu'une seule fois)

## Étape B — Créer le serveur (5 min, une seule fois)

1. Ouvre **https://railway.app** → « Login » → **Login with GitHub**
2. Bouton **« New Project »** → **« Deploy from GitHub repo »**
3. Choisis le dépôt **CMCteams**
4. Dans les réglages du service :
   - **Branch** : `claude/crypto-trading-bot-irrfu6` (ou `main` après merge)
   - **Root Directory** : `crypto-bot`
   (Railway détecte le Dockerfile tout seul)

## Étape C — Coller tes clés (2 min)

Dans le service Railway → onglet **« Variables »** → ajoute :

| Nom | Valeur |
|---|---|
| `BINANCE_API_KEY` | ta clé du testnet |
| `BINANCE_API_SECRET` | ton secret du testnet |
| `TESTNET` | `true` |

Puis **« Deploy »**. C'est tout — le bot tourne 24/7.

## Étape D — Suivre le bot depuis l'iPhone

- Onglet **« Deployments » → « View Logs »** : tu vois en direct ce que le
  bot décide (HOLD / ACHAT / VENTE, prix, capital, raison).
- L'app **Railway** existe aussi sur l'App Store si tu préfères.

## 🛑 Tout couper depuis l'iPhone (kill switch cloud)

Dans Railway → ton service → bouton **« ⋯ » → « Remove »** (ou
**Settings → Sleep**) : le serveur s'arrête → le bot ne trade plus.
En testnet il n'y a rien à solder ; en réel, tu peux aussi simplement
supprimer la clé API dans Binance → le bot ne peut plus rien faire.

## 💶 Passage à l'argent réel (plus tard, seulement si le testnet convainc)

1. On regarde ENSEMBLE les résultats mesurés du testnet.
2. Tu crées une clé sur le vrai Binance (Spot ✅, Retraits ❌ JAMAIS).
3. Dans Railway → Variables : tu remplaces les clés + `TESTNET` → `false`,
   et tu ajoutes `BOT_LIVE=true`.
4. Le bot redémarre en réel avec tes 100–300 €, garde-fous actifs.
