# KEVIN_ACTIONS_TODO.md — Reste vraiment irréductible

> Mis à jour 2026-04-26 (Apex v12.334 + CMCteams v9.559) — j'ai automatisé tout ce que je pouvais automatiser.

## 🆕 NOUVEAUX DOSSIERS PRÊTS À LIRE (2026-04-26)

| Fichier | Contenu | Action Kevin |
|---------|---------|--------------|
| `EVALUATION_APEX_2026-04-26.md` | Note externe pro 8.2/10, points forts/faibles, valuation 1.2-2.5M€ | Lire 5 min |
| `EVALUATION_CMCTEAMS_2026-04-26.md` | Audit CMC 7.9/10, valuation 800k-1.8M€ | Lire 3 min |
| `BILAN_COMPETENCES_APEX.md` | Inventaire complet 55+ tools, 12 studios, scores par axe | Lire 5 min |
| `FORFAITS_RECOMMANDES.md` | Grille tarifaire optimisée (Pro 19.99€ recommandé vs 4.99€ actuel) | Décider pricing |



---

## ✅ DÉJÀ AUTOMATISÉ (tu n'as plus rien à faire)

| Avant (manuel) | Maintenant (auto) |
|---|---|
| Force-reload PWA | Auto-refresh 60s + visibility + focus → MAJ silencieuse |
| Re-saisir clés perdues | Sync Firebase auto + auto-restore au boot si vides |
| Tester mes clés API | Auto-test à chaque OK + bouton "Tester toutes" |
| Backup quotidien | Sentinelle backup-watch (auto chaque nuit) |
| Vérifier doublons profils | Auto-merge à chaque login admin |
| Detect login suspect | Sentinelle security-watch (alerte push) |
| Générer clés VAPID | Faites par moi (commit `c8c6ca8`) |
| Déployer Worker Cloudflare | Outil 1-clic : https://9r4rxssx64-creator.github.io/CMCteams/tools/cloudflare/deploy-worker.html |

---

## 🚨 STRICTEMENT IMPOSSIBLE POUR MOI (3 tâches max)

### #1 — Inscription compte Google Gemini (3 min, GRATUIT)
**Pourquoi je peux pas** : tu dois utiliser TES credentials Google (privés).
**Lien direct** : https://aistudio.google.com/apikey
**Procédure** : login Google → "Create API key" → copier `AIza...` → Apex Coffre → ligne `🌈 Google Gemini` → ✏️ → coller.
**Bénéfice** : 1500 requêtes/jour gratuites.

### #2 — Activer notifications push iPhone (2 min, GRATUIT)
**Pourquoi je peux pas** : iOS exige ton consentement explicite.
**Procédure** :
1. Apex installé sur écran d'accueil (PWA) — pas Safari onglet
2. Ouvre Apex → Réglages → bouton "🔔 Activer notifications"
3. iOS demande "Autoriser ?" → tape **Autoriser**
4. ✅ Tu recevras les push même app fermée

### #3 — (Optionnel) Déployer Cloudflare Push Worker (5 min, GRATUIT)
**Pourquoi je peux pas seul** : ton compte Cloudflare (tes credentials).
**Outil 1-clic** : https://9r4rxssx64-creator.github.io/CMCteams/tools/cloudflare/deploy-worker.html
**Procédure** :
1. Crée un Token API Cloudflare ([lien](https://dash.cloudflare.com/profile/api-tokens))
2. Colle dans l'outil → "Charger comptes" → "Déployer"
3. Code installé. Push fonctionnels.

---

## 💰 PAIEMENTS (quand tu le souhaites, optionnel)

| Service | Lien recharge | Quand utile |
|---|---|---|
| Anthropic Claude | https://console.anthropic.com/settings/billing | Si solde < $5 |
| OpenAI | https://platform.openai.com/account/billing | Si tu veux GPT-4 |
| DeepSeek | https://platform.deepseek.com/sign_up | Code expert $5 |

---

## 🎨 CHOIX ÉDITORIAUX (toi seul peux décider)

- **PayPal.me username** : choisis ton handle (paypal.me/TON_NOM)
- **Revolut Revtag** : ton @ Revolut
- **Adresses crypto** : tes adresses publiques BTC/ETH/USDC

Coffre Apex → catégorie 💳 Paiement → coller dans les champs correspondants.

---

> Tout le reste de ton ancienne TODO list a été automatisé.
> Si tu vois encore quelque chose qui te demande une action manuelle dans Apex/CMCteams,
> screenshot-moi → je trouve une automation.
