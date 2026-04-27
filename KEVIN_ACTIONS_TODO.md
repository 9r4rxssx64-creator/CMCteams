# KEVIN_ACTIONS_TODO.md — Tâches restantes par priorité

> Mis à jour **2026-04-27 nuit** (Apex **v12.370** + CMCteams v9.559)
> Session marathon : v12.336 → v12.370 (chat refondu, bulles live, Mode Dev ajoutés)

---

## 🚨 PRIORITÉ ABSOLUE (à faire maintenant si tu veux IA gratuite)

### 1️⃣ Groq ⭐ RECOMMANDÉ (Llama 3.3 70B, vraiment gratuit, ultra rapide)

- **Lien clé** : https://console.groq.com/keys
- **Procédure** : login Google ou GitHub → "Create API Key" → copier `gsk_...`
- **Coller dans Apex** : Coffre → champ `🟢 Groq` (`ax_groq_key`) → ✏️
- **Bénéfice** : ~30 req/min, généreux, modèle qualité GPT-4o-mini
- **Statut intégration** : ✅ champ Coffre présent | ❌ pas encore d'appel `_callGroqAPI` (à coder v12.371)
- **Action après collage** : aucune — clic bulle → test live → vert si OK

### 2️⃣ OpenRouter (déjà 100% intégré dans Apex avec failover auto)

- **Lien clé** : https://openrouter.ai/keys
- **Procédure** : login → "Create Key" → copier `sk-or-...`
- **Coller dans Apex** : Coffre → champ `🌐 OpenRouter` (`ax_openrouter_key`) → ✏️
- **Bénéfice** : modèles gratuits taggés `:free` (Llama, Gemini, Mistral)
- **Statut intégration** : ✅✅✅ failover automatique si Anthropic timeout / 5xx
- **Action après collage** : aucune — failover déclenche tout seul

### 3️⃣ Google Gemini (gratuit avec quota généreux)

- **Lien clé** : https://aistudio.google.com/apikey
- **Procédure** : login Google → "Create API key" → copier `AIza...`
- **Coller dans Apex** : Coffre → champ `🌈 Google Gemini` (`ax_gemini_key`) → ✏️
- **Bénéfice** : Gemini 2.0 Flash / 15 req/min / 1500 req/jour
- **Statut intégration** : ✅ champ Coffre + bulle live test | ❌ pas d'appel direct `_callGeminiAPI` (failover via OpenRouter pour l'instant)

### 4️⃣ Mistral La Plateforme (free tier)

- **Lien clé** : https://console.mistral.ai/api-keys/
- **Procédure** : login → "Create new key" → copier
- **Coller dans Apex** : Coffre → champ `🇫🇷 Mistral` (`ax_mistral_key`) → ✏️
- **Bénéfice** : Mistral Small gratuit limité, modèle français qualité
- **Statut intégration** : ✅ champ Coffre | ❌ pas d'appel direct (failover OpenRouter)

### 5️⃣ Hugging Face Inference (gratuit limité)

- **Lien clé** : https://huggingface.co/settings/tokens
- **Procédure** : login → "New token" type `Read` → copier `hf_...`
- **Coller dans Apex** : Coffre → champ `🤗 Hugging Face` (`ax_huggingface_key`) → ✏️
- **Bénéfice** : Inference API multi-modèles open source
- **Statut intégration** : ✅ champ Coffre | ❌ pas d'appel direct

---

## ✅ DÉJÀ FAIT (toi ou moi) — pas de réaction nécessaire

### Côté Kevin (collé dans Coffre)

- [ ] Anthropic `ax_api_key` `sk-ant-...` — ⚠️ vérifie bulle vert/rouge avec test live
- [ ] OpenRouter `ax_openrouter_key` — vérifie bulle
- [ ] GitHub token `ax_github_token` — vérifie bulle

### Côté Claude Code (automatisé v12.366-370)

| Domaine | Fait | Comment |
|---------|------|---------|
| **Refonte chat UI** | v12.368 | Style Claude.ai : "+" gauche, textarea milieu, micro+envoi droite |
| **Stop sans clignotement** | v12.368 | Carré rouge fixe, plus de pulse |
| **3 dots subtils** | v12.368 | Au lieu cube doré qui pulse |
| **Mode plan/code auto** | v12.368 | Économie tokens : Haiku pour Q&A courte, Sonnet pour analyse |
| **Bulles credentials LIVE** | v12.369 | Rouge=KO, jaune=untested, vert=testé OK 24h |
| **Click bulle = retest live** | v12.369 | Endpoints réels (Anthropic /messages, OpenAI /models, etc.) |
| **Boot test 5s après login** | v12.369 | Auto-test 4 clés critiques |
| **Mode Dev / Claude Code** | v12.370 | Vue dédiée admin pour me joindre via clé Anthropic |
| **Apex auto-tests** | v12.370 | 5 questions test 1×/jour, escalade si <60% |
| **CGU plus jamais redemandées** | v12.367 | ax_perms_onboarded retiré du wipe + ax_cgu_ scope local |
| **Historique chat à la reco** | v12.367 | Restore K.conversations + K.messages au login |
| **3 P0 audit Stripe-level** | v12.367 | Timeouts fetch + .catch() partout |
| **CACHE_VERSION sync APP_VER** | Règle CLAUDE.md #9 | Sentinelle GitHub Action `sw-cache-sync.yml` |

---

## 🟡 IMPORTANT (à faire dans les jours qui viennent)

### 🔔 Notifications push iPhone (2 min, GRATUIT)

- **Pourquoi pas auto** : iOS exige ton consentement explicite
- **Procédure** :
  1. Apex installé sur écran d'accueil (PWA, pas Safari onglet)
  2. Apex → Réglages → bouton **🔔 Activer notifications**
  3. iOS : "Autoriser ?" → **Autoriser**
- **Effet** : push même app fermée

### ⚡ Cloudflare Push Worker (5 min, GRATUIT, OPTIONNEL)

- **Pourquoi pas auto** : ton compte Cloudflare = tes credentials
- **Outil 1-clic** : https://9r4rxssx64-creator.github.io/CMCteams/tools/cloudflare/deploy-worker.html
- **Procédure** : Token Cloudflare → outil → "Charger comptes" → "Déployer"
- **Coller URL worker** : Coffre → `ax_push_worker_url`

### 💳 Choix grille tarifs (en attente)

3 options présentées hier soir (A réalistes / B limites resserrées / C hybride) — à choisir tranquillement.

---

## 🎨 CHOIX ÉDITORIAUX (toi seul peux décider)

| Ce qu'il faut décider | Où le coller |
|-----------------------|--------------|
| PayPal.me username | Coffre → `ax_paypal_me` |
| Revolut Revtag (@kdmc) | Coffre → `ax_revolut_tag` |
| IBAN + nom titulaire | Coffre → `ax_iban` + `ax_iban_nom` |
| BTC / ETH / USDC adresses publiques | Coffre → champs correspondants |
| PIN admin si tu veux changer (200807 par défaut) | Réglages → Sécurité |

---

## 🛠️ TÂCHES QUI VIENNENT POUR MOI (Claude Code) — v12.371+

| Priorité | Tâche | Pourquoi |
|----------|-------|----------|
| **P0** | Coder `_callGroqAPI` + `_callGeminiAPI` | Faire utiliser tes nouvelles clés gratuites pour économie |
| **P0** | Routing IA tier-light bascule auto Groq/Gemini si Anthropic quota | Plus jamais bloqué + économie |
| **P1** | Streaming sans re-render (vrai fix sautillement) | Fluidité Claude.ai |
| **P1** | Gemma local → bouton dans Coffre (au lieu Settings) | Si KO le retire de la vue principale |
| **P1** | 91 catch vides → `_axSafeCatch("ctx",e)` | Fiabilité runtime |
| **P2** | Test boot path : `_axForceHealCredentials` + `fbStartListening` | Couvrir les paths critiques sans test |
| **P2** | Pre-commit `catch(_){}` detection | Anti-régression v12.365 try/catch |

---

## 📌 NOTES PERMANENTES

- **Test mental** avant chaque changement : *"Si Kevin essaie ça dans 2 min, est-ce que ça marche ?"*
- **Règle absolue** (CLAUDE.md #9) : tout fix de bug bumpe APP_VER **ET** CACHE_VERSION sw.js dans le **même commit**
- **Anti-microcommits** : MAX 1-3 versions/jour. Si plus → audit complet
- **Validation pre-commit identique** : `python3 join blocks SANS séparateur` + `node --check`

---

## 🔗 LIENS UTILES (référence rapide)

- **Apex** (live) : https://9r4rxssx64-creator.github.io/CMCteams/apex-ai/
- **Repo GitHub** : https://github.com/9r4rxssx64-creator/cmcteams
- **Branche actuelle** : `claude/fix-apex-ai-bugs-adHfF`
- **Anthropic billing** : https://console.anthropic.com/settings/billing
- **Anthropic console** : https://console.anthropic.com/settings/keys

---

> Si tu vois autre chose qui te demande une action manuelle non listée → screenshot-moi, je trouve l'automation.
