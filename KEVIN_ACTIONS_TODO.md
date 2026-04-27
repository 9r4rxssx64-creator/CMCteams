# KEVIN_ACTIONS_TODO.md — Tâches restantes par priorité

> Mis à jour **2026-04-27 nuit2** (Apex **v12.424** + CMCteams v9.560)
> Session marathon : v12.402 → v12.424 (audit pro 5 agents + 30 fixes + hotfix encryption)

---

## 🔐 v12.425 — RÉACTIVER ENCRYPTION FIREBASE EN AUTONOMIE TOTALE (Kevin: "il doit tout faire seul")

> **Contexte** : v12.415 chiffrement AES-GCM Firebase pour clés API sensibles. Masterkey dérivée PIN admin = instable cross-device. Hotfix v12.423 désactive encryption push.
>
> **Demande Kevin** : Garder le principe **MAIS** Apex doit tout faire **automatiquement, sans intervention humaine**. Pas de modal "saisis passphrase". Auto-config silencieux.

### Plan v12.425 - AUTONOMIE TOTALE

1. **Génération masterkey AUTO au premier boot admin** :
   - 32 bytes random via `crypto.getRandomValues`
   - Stockage chiffré par PIN admin dans `ax_vault_master_v2` (localStorage)
   - Backup Firebase chiffré (clé chiffrée par PIN, déchiffrable depuis tout device avec même PIN admin)
   - Aucune saisie utilisateur requise

2. **Cross-device sync auto** :
   - Au boot d'un nouveau device : check si `ax_vault_master_v2` présent local
   - Sinon → pull depuis Firebase (nécessite PIN admin déjà entré)
   - Décrypt avec PIN → utilise masterkey
   - Si PIN différent : modal **automatique** propose "Saisir PIN précédent pour migrer ?" sinon reset clés

3. **Wrapper fbWrite/SSE handler** : encryption auto sans intervention

4. **Auto-repair silencieux** :
   - Boot scan détecte `__AXENC1__` blobs corrompus
   - Tente décryption avec masterkey courante
   - Si fail → essai migration depuis ancienne masterkey ax_vault_master_v1
   - Si fail total → toast "Cle X ressaisir" + auto-link Coffre

5. **Auto-detection clés mal placées** (déjà v12.401-411) maintenu :
   - `_axScanTextContextual` détecte si clé `gsk_...` dans champ Grok
   - `_axDiscoverServiceForUnknown` propose target field automatiquement
   - User n'a qu'à valider en 1 tap (ou auto si confidence > 0.95)

6. **Aucune action humaine requise** sauf cas de PIN reset critique

### Fichiers à modifier
- `apex-ai/index.html` : auto-init masterkey au login admin
- `apex-ai/index.html` : wrappers encryption transparents
- `apex-ai/index.html` : recovery flow silencieux

### Estimation
- 8h dev + tests cross-device (2 iPhones avec PIN identique vs différent)
- Bump APP_VER v12.425 + sw.js sync

---

## 🌍 v12.426 — CORS PROXY POUR FLUX RSS ACTUALITÉS (mineur)

> Erreur "chargement flux Monaco Info" visible v12.424. CORS bloque RSS depuis PWA.

Solution :
- `https://api.rss2json.com/v1/api.json?rss_url=...` (gratuit, CORS-friendly)
- Ou Cloudflare Worker custom proxy
- Effort : 30min

---

## 📝 NOTES DEBRIEF SESSION 2026-04-27 NUIT2

### Audit pro 5 agents (Stripe/FAANG-grade) - scores réels

| Axe | Score | vs benchmark | Top P0 |
|-----|-------|--------------|--------|
| Sécurité | 51/100 | Stripe 92+ | API keys plaintext, custom PIN KDF FNV1a, 0 SRI CDN |
| Performance | 51/100 | Claude.ai 89 | LCP 5.2-6.8s, TTI 8.2s, monolithe 2.3MB |
| UX/A11y | 62/100 | Apple 99 | 0% Dynamic Type, 0.5% ARIA, no reduced-motion |
| Code | 52/100 | Stripe 88 | SQALE D, 504 catch silencieux, CC 45 _callClaudeAPI |
| RGPD | 54/100 | EU 95+ | Firebase deletion JAMAIS (Art. 17 €20M risk) |
| AI Act | 65/100 | EU 95+ | Disclosure agents auto manquante |
| Functional | 78/100 | Linear 95+ | OK fonctionnel mais data lifecycle broken |

### v12.424 fixes appliqués
- DOMPurify 3.0.6 → 3.0.9 (bypasses fixed)
- crossorigin+referrerpolicy sur tous CDN
- Reduced-motion + Dynamic Type clamp + focus-visible WCAG AA
- aria-live toast region (VoiceOver/TalkBack)
- Send button debounce 300ms anti-spam
- Cookie consent banner first-login (Art. 6-7 RGPD)
- Voiceprint disclosure helper Art. 9 biométrie
- Boot cleanup agressif si quota > 70% (35 logs caps stricts)

### Bugs vécus + corrigés
- **v12.422 cassait Apex** : caused encryption AES-GCM v12.415 illisible cross-device → hotfix v12.423
- **Stockage iPhone plein** : 18 versions cumulees logs → boot cleanup v12.424
- **Apostrophe FR innerHTML** : J'accepte cassait JS parser → "Accepter" sans apostrophe (erreur connue #48)

### Auto-détection v12.401-411 marche très bien (Kevin valide)
- Apex détecte clé Groq dans champ xAI Grok → propose move
- Apex détecte api_key format inhabituel → test live + suggère
- Apex propose recharge Groq quand quota épuisé
- Apex bascule auto Anthropic quand Groq KO

### Reste pour 95+/100 partout (~500h sur 12 semaines + 2 sem legal)
- Refactor _callClaudeAPI CC 45→12 (20h)
- Module split monolithe 2.3 MB → bundles lazy (50h)
- WebAuthn registration/auth full (12h)
- Firebase Auth migration vs custom PIN (5j)
- E2E encryption client-side AES-256 avant Firebase push (3j)
- Tests Jest unit/integration/E2E coverage 60%+ (50h)
- Refactor 504 catch silencieux → _axSafeCatch logged (12h)
- DPIA documentation RGPD Art. 35 (5j)
- DPA signé avec Firebase/Google (5j legal)
- DPO appointment (consultant externe)
- Firebase deletion réelle Art. 17 droit oubli (2j)
- Replace 179 innerHTML → DOMPurify systématique (16h)
- ARIA labels massif WCAG 2.1 AA tous composants (1.5j)

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
