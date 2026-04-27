# 📁 KEVIN_INVENTORY.md — Tous tes codes, fichiers, liens (auto-mis à jour)

> Mis à jour automatiquement par Claude à chaque commit important.
> Dernière mise à jour : **2026-04-27 SOIR** (post Apex v12.403 — session marathon 67+ versions)

## 🆕 SESSION 2026-04-27 SOIR — RÉCAP COMPLET (v12.376-v12.403)

**3 audits subagents indépendants** :
- **Code** (Agent Explore) : **9.2/10** production-ready
- **UX** (Agent Explore scénarios) : **6.5/10** (2 risques = false positives audit)
- **Sécurité** (Agent Explore) : **5.5/10** (OK perso Kevin, pas enterprise multi-user)

**Audit syntaxe direct** : ✅ `node --check` OK + 26/26 tests + 21 fonctions critiques 1 def chacune (pas de duplication)

### 🤖 Auto-detection credentials (LE GROS CHANTIER)

Tu colles → Apex range automatiquement. **3 façons** :
1. **Texte chat** : préfixe détecté (`gsk_`, `ghp_`, `sk-ant-`, `AIza`, `xai-`, etc.)
2. **Photo/screenshot** : paste image → OCR Tesseract.js → scan → propose
3. **Fichier upload** : si image → OCR auto

**130+ services reconnus contextuellement** : IA (12), réseaux sociaux (12), email (8), comm (12), streaming (10), music (6), cloud (5), banques FR (19), crypto (8), gaming (11), productivity (9), dev (13), shopping (9), voyage (12), casino (5), admin État (8).

### 💾 Auto-save TOTAL + historique + rollback

- Toggle `ax_auto_save_credentials` (default true) → save batch sans confirmation
- Tests live espacés 1.5s/clé + bilan + push GitHub si KO
- Historique 10 entries par clé dans `ax_cred_history_<key>`
- Si nouveau KO → modal "Restaurer ancien" → rollback vers dernier validated
- Multi-candidats : si 3 GitHub PAT détectés → "Tester 3 candidats" séquentiel

### ⚡ Failover IA cascade

Anthropic → OpenRouter → Groq → Gemini auto sur :
- Timeout (>180s)
- 5xx serveur (≥3 fois en 5 min)
- Network exhaust
- **Stuck 45s** (`_healthCheck` v12.400)

Watchdog 200s + badge "via Provider" topbar live.

### 🎨 UX Claude.ai-style

- Chatbar : "+" gauche, textarea milieu auto-grow, micro+envoi droite
- Stop = carré blanc dans cercle rouge **fixe**
- 3 dots subtils gris (au lieu cube doré clignotant)
- Mode plan/code badge centré 1.5s fade
- Modal saisie clé large 140px monospace
- FAB ↓ centre 84px du bas (anti-collision streaming)
- Anti-saut input + anti-scintille foreground 800ms

### 🔍 Vues admin nouvelles

- `?view=credlogs` → log setItem 30 + deep_clean 5
- `?view=credhistory` → 10 entries par clé avec status ACTUEL/VALIDÉ/archivé
- `?view=revocation` → helper liens directs (optionnel)

### 📨 Passerelle Claude Code (push GitHub)

- `_axPushDiagnosticToGitHub` via `ax_github_token`
- `axSendReportToClaudeCode()` push manuel rapport complet
- `axTestEachFunction()` test 50+ fonctions critiques + push si erreurs
- Diagnostic auto au boot 8s

### 📂 Fichiers MD nouveaux/modifiés

| Fichier | État | Description |
|---------|------|-------------|
| `apex-ai/index.html` | v12.403 (2.24 MB) | App principale |
| `apex-ai/sw.js` | apex-v12.403 | Cache version |
| `WHATSAPP_CLONE_PROJECT.md` | NEW | Spec projet messaging séparé |
| `APEX_CREDENTIAL_AUTO_FEATURE.md` | NEW (273 lignes) | Spec complète scan auto |
| `MEMO_RESUME.md` | UPDATED | Session 2026-04-27 soir ajoutée |



## 🌐 LIENS RACINE

| Quoi | URL |
|------|-----|
| 🚀 **Apex AI live** | https://9r4rxssx64-creator.github.io/CMCteams/apex-ai/ |
| 🎰 **CMCteams live** | https://9r4rxssx64-creator.github.io/CMCteams/ |
| 📦 **Code source GitHub** | https://github.com/9r4rxssx64-creator/cmcteams |
| 📊 **Activité Claude** | https://github.com/9r4rxssx64-creator/cmcteams/blob/main/CLAUDE_ACTIVITY.json |
| 📒 **Mémoires Claude (règles)** | https://github.com/9r4rxssx64-creator/cmcteams/blob/main/CLAUDE.md |

---

## 🔧 OUTILS CLOUDFLARE (push notifications)

| Fichier | Description | Voir | Modifier |
|---------|-------------|------|----------|
| `apex-push-worker.js` | Le serveur qui envoie les notifs push à ton iPhone | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/tools/cloudflare/apex-push-worker.js) · [Brut](https://raw.githubusercontent.com/9r4rxssx64-creator/cmcteams/main/tools/cloudflare/apex-push-worker.js) | [Modifier](https://github.com/9r4rxssx64-creator/cmcteams/edit/main/tools/cloudflare/apex-push-worker.js) |
| `gen-vapid.html` | Page pour générer tes clés VAPID (déjà fait, voir étape ci-dessous) | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/tools/cloudflare/gen-vapid.html) · [Live](https://9r4rxssx64-creator.github.io/CMCteams/tools/cloudflare/gen-vapid.html) | [Modifier](https://github.com/9r4rxssx64-creator/cmcteams/edit/main/tools/cloudflare/gen-vapid.html) |
| `DEPLOY-PUSH-WORKER.md` | Guide pas-à-pas pour déployer le worker Cloudflare | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/tools/cloudflare/DEPLOY-PUSH-WORKER.md) · [Brut](https://raw.githubusercontent.com/9r4rxssx64-creator/cmcteams/main/tools/cloudflare/DEPLOY-PUSH-WORKER.md) | [Modifier](https://github.com/9r4rxssx64-creator/cmcteams/edit/main/tools/cloudflare/DEPLOY-PUSH-WORKER.md) |
| `deploy-worker.html` | Outil 1-clic pour déployer le worker Cloudflare | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/tools/cloudflare/deploy-worker.html) · [Live](https://9r4rxssx64-creator.github.io/CMCteams/tools/cloudflare/deploy-worker.html) |

---

## 🔑 TES CLÉS VAPID (déjà générées par moi 2026-04-25)

| Clé | Valeur | Où la mettre |
|-----|--------|--------------|
| **PUBLIC** (peut être partagée) | `BJ5XN-ZzchRPPDVO4aEkFkhUOQC8E0tScaTKFXFBDq3o8MATBdRW879hSTLCTfH5mo3S_i5JOf1E4pTDALETBsY` | ✅ Déjà intégrée dans Apex v12.207 |
| **PRIVÉE** (⚠️ ne jamais partager) | `VOaaNRpzQAo3tbwrpY3rg_docYCCKKhg1uaxuNVT4Ao` | À coller dans Cloudflare Worker → Settings → Variables → `VAPID_PRIVATE_KEY` |

---

## 📱 APPLICATIONS

### Apex AI (`apex-ai/`) — v12.242

| Fichier | Description | Lien |
|---------|-------------|------|
| `index.html` | L'app entière (~2.4 MB, code + CSS + UI) | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/apex-ai/index.html) · [Modifier](https://github.com/9r4rxssx64-creator/cmcteams/edit/main/apex-ai/index.html) |
| `sw.js` | Service Worker (cache offline + push notifs, sync auto APP_VER) | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/apex-ai/sw.js) · [Modifier](https://github.com/9r4rxssx64-creator/cmcteams/edit/main/apex-ai/sw.js) |
| `manifest.json` | Métadonnées PWA | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/apex-ai/manifest.json) |
| `cgu.html` | CGU clients | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/apex-ai/cgu.html) |
| `privacy.html` | Politique confidentialité | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/apex-ai/privacy.html) |
| `diag.html` | Diagnostic technique | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/apex-ai/diag.html) |
| `proxy-apex.js` | Proxy pour appels API | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/apex-ai/proxy-apex.js) |

### Modules pro Apex (intégrés dans index.html)

| Module | Version | Contenu |
|--------|---------|---------|
| 🍳 **Cuisine Pro** | v12.238 | 10 recettes classiques FR + 22 cuissons + conversions + 14 allergènes INCO + calories |
| 🩺 **Medical Pro** | v12.237 | IMC + métabolisme + médicaments OTC + urgences SAMU + vaccins |
| 💰 **Finance Pro** | v12.235 | IR FR 2026 + crédit immo + PV immo + PV mobilier + Monaco fiscal |
| ⚖ **Légal Pro** | v12.X | 18+ codes français + jurisprudence Cass/CE/CJUE/CEDH + Monaco |
| 🌐 **Traducteur Pro** | v12.233 | 30 langues + cache + Claude Haiku + STT/TTS + interprète temps réel |
| 🔧 **Pack Pro** | v12.229 | Conversions universelles + béton + lune + météo gratuit + dates pro |
| 💖 **Vue Laurence** | v12.226-227 | Bulles emoji flottantes + wallpaper + diaporama + commandes vocales |
| 🛡 **SECU AUTH** | v12.240-241 | PIN per-user isolé + nom+prénom+pass obligatoires partout |
| 💾 **Triple persistence** | v12.223 | localStorage + IndexedDB + Firebase + auto-restore |

### CMCteams (`/`) — v9.522

| Fichier | Description | Lien |
|---------|-------------|------|
| `index.html` | L'app casino (2.3 MB) | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/index.html) · [Modifier](https://github.com/9r4rxssx64-creator/cmcteams/edit/main/index.html) |
| `sw.js` | Service Worker | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/sw.js) |
| `manifest.json` | Métadonnées PWA | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/manifest.json) |
| `firebase-rules.json` | Règles sécurité Firebase | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/firebase-rules.json) |

### Modules pro CMCteams (intégrés)

| Module | Version | Contenu |
|--------|---------|---------|
| 📖 **Convention SBM** | v9.29+ | Convention 1er avril 2015 + Note 1993 codes paie |
| 🛡 **Triple persistence** | v9.519 | localStorage + IndexedDB + Firebase |
| 🎰 **Parser auto-learn** | v9.521-522 (WIP) | Apprend nouveaux codes PDF automatiquement |
| 👥 **Admin profil cross-app** | v9.520 | Synchro avec Apex via FB_FIX `ax_admin_profile` |

---

## 🤖 BACKEND (Railway / FastAPI)

| Fichier | Description | Lien |
|---------|-------------|------|
| `tools/backend/` | Dossier backend FastAPI complet | [Explorer](https://github.com/9r4rxssx64-creator/cmcteams/tree/main/tools/backend) |
| `tools/backend/main.py` | Point d'entrée FastAPI | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/tools/backend/main.py) |
| `tools/backend/routes/` | Routes API (services, webhooks, etc.) | [Explorer](https://github.com/9r4rxssx64-creator/cmcteams/tree/main/tools/backend/routes) |

---

## 🛠 OUTILS 1-CLIC (HTML autonomes)

| Outil | URL Live | Description |
|-------|----------|-------------|
| 🚀 **Deploy Worker** | https://9r4rxssx64-creator.github.io/CMCteams/tools/cloudflare/deploy-worker.html | Déployer le worker Cloudflare en 1 clic |
| 🔑 **Gen VAPID** | https://9r4rxssx64-creator.github.io/CMCteams/tools/cloudflare/gen-vapid.html | Générer les clés push VAPID |
| 📷 **Album Laurence** | https://9r4rxssx64-creator.github.io/CMCteams/tools/album-laurence.html | Upload photos diaporama Laurence (compression auto + push Firebase) |
| ⚖ **Calc Conventions SBM** | https://9r4rxssx64-creator.github.io/CMCteams/tools/calc-conventions.html | Calculer congés familiaux (Art. 18) + indemnité retraite (Art. 26) Convention SBM |
| 💳 **Gen Bulletin Paie** | https://9r4rxssx64-creator.github.io/CMCteams/tools/gen-bulletin-paie.html | Fiche paie indicative Casino Monaco (8 postes, cotisations CCSS+CARTI, export PDF) |
| 📝 **Décodeur Codes Planning** | https://9r4rxssx64-creator.github.io/CMCteams/tools/codes-decoder.html | Tous les codes planning (CP, RTR, 22/6, etc.) avec recherche + filtres + apprentissage |
| 📅 **Planning Week-end** | https://9r4rxssx64-creator.github.io/CMCteams/tools/planning-weekend.html | Visualiseur rapide qui bosse sam/dim (parser texte + partage SMS pit boss) |

### Liens GitHub des nouveaux outils

| Outil | View | Raw | Edit |
|-------|------|-----|------|
| `calc-conventions.html` | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/tools/calc-conventions.html) | [Brut](https://raw.githubusercontent.com/9r4rxssx64-creator/cmcteams/main/tools/calc-conventions.html) | [Modifier](https://github.com/9r4rxssx64-creator/cmcteams/edit/main/tools/calc-conventions.html) |
| `gen-bulletin-paie.html` | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/tools/gen-bulletin-paie.html) | [Brut](https://raw.githubusercontent.com/9r4rxssx64-creator/cmcteams/main/tools/gen-bulletin-paie.html) | [Modifier](https://github.com/9r4rxssx64-creator/cmcteams/edit/main/tools/gen-bulletin-paie.html) |
| `codes-decoder.html` | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/tools/codes-decoder.html) | [Brut](https://raw.githubusercontent.com/9r4rxssx64-creator/cmcteams/main/tools/codes-decoder.html) | [Modifier](https://github.com/9r4rxssx64-creator/cmcteams/edit/main/tools/codes-decoder.html) |
| `planning-weekend.html` | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/tools/planning-weekend.html) | [Brut](https://raw.githubusercontent.com/9r4rxssx64-creator/cmcteams/main/tools/planning-weekend.html) | [Modifier](https://github.com/9r4rxssx64-creator/cmcteams/edit/main/tools/planning-weekend.html) |

---

## 🤖 SENTINELLES GITHUB ACTIONS

Workflows automatiques qui surveillent et corrigent en arrière-plan :

| Workflow | Quand | Description |
|----------|-------|-------------|
| `deploy.yml` | Push main | Déploiement GitHub Pages auto |
| `sw-cache-sync.yml` | Push apex-ai/ | **Sync auto sw.js CACHE_VERSION ↔ index.html APP_VER** (rattrape les drifts → plus besoin de force-refresh) |
| `agent-cron.yml` | Cron périodique | Tâches background (health-check, conflicts, burnout, backup, weekly-report) |
| `auto-backup.yml` | Daily | Backup auto des données |
| `firebase-backup.yml` | Daily | Backup Firebase quotidien |
| `claude-todo-watcher.yml` | Cron 2h | Poll `ax_claude_todo` Firebase → ouvre issue + alerte si critique |
| `auto-deploy-vercel.yml` | Push | Déploiement Vercel parallèle |
| `deploy-push-worker.yml` | Manuel | Déploiement worker push Cloudflare |
| `codeql-analysis.yml` | Push + weekly | Analyse sécurité statique |
| `tests.yml` | Push + PR | Suite de tests automatisés |

[Voir tous les workflows](https://github.com/9r4rxssx64-creator/cmcteams/tree/main/.github/workflows)

---

## 📋 DOCUMENTATIONS & RÈGLES

| Fichier | Description | Lien |
|---------|-------------|------|
| `CLAUDE.md` | Toutes mes règles permanentes (que j'apprends de toi) | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/CLAUDE.md) |
| `KEVIN_ACTIONS_TODO.md` | Tes tâches prioritaires | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/KEVIN_ACTIONS_TODO.md) |
| `KEVIN_INVENTORY.md` | Ce fichier (auto-mis à jour) | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/KEVIN_INVENTORY.md) |
| `MEMO_RESUME.md` | Bilan de session (lu à chaque reprise) | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/MEMO_RESUME.md) |
| `MEMO_KEVIN_ACTIONS.md` | Actions Kevin restantes | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/MEMO_KEVIN_ACTIONS.md) |
| `CHANGELOG.md` | Historique des versions | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/CHANGELOG.md) |
| `CLAUDE_ACTIVITY.json` | Mes commits récents (lus par Apex/CMC) | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/CLAUDE_ACTIVITY.json) |
| `BILAN_PRO.md` | Architecture vs template pro, scoring, roadmap | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/BILAN_PRO.md) |
| `NOTES_USER.md` | Infos métier Kevin (couleurs, tables, salons, …) | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/NOTES_USER.md) |
| `SENTINELS.md` | Doc des sentinelles | [Voir](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/SENTINELS.md) |

---

## 📊 RAPPORTS D'AUDIT (tools/audit/)

| Audit | Date | Lien |
|-------|------|------|
| `bug-audit-2026-04-25.md` | 2026-04-25 | Audit bug hunter expert Apex |
| `cmc-bug-audit-2026-04-25.md` | 2026-04-25 | Audit bug hunter expert CMCteams |
| `regression-2026-04-25.md` | 2026-04-25 | Régression session (36 features testées) |
| `tech-scout-2026.md` | 2026 | Scout APIs cutting-edge iPhone iOS 17/18 |
| `ux-audit-2026-04-25.md` | 2026-04-25 | Audit UX |

---

## 📊 ACCÈS RAPIDE PAR USAGE

### Si tu veux modifier l'application Apex
→ [Modifier index.html](https://github.com/9r4rxssx64-creator/cmcteams/edit/main/apex-ai/index.html)

### Si tu veux modifier l'application CMCteams
→ [Modifier index.html](https://github.com/9r4rxssx64-creator/cmcteams/edit/main/index.html)

### Si tu veux voir l'historique de mes commits
→ [Tous les commits](https://github.com/9r4rxssx64-creator/cmcteams/commits/main)

### Si tu veux annuler un commit récent
→ [Liste commits](https://github.com/9r4rxssx64-creator/cmcteams/commits/main) → choisis → "Revert"

### Si tu veux signaler un bug
→ [Créer une issue](https://github.com/9r4rxssx64-creator/cmcteams/issues/new)

---

## 🔑 IDENTIFIANTS CLOUDFLARE (confirmés)

| Quoi | Valeur |
|---|---|
| Account ID | `ffaca6f306a953f82834db0970f300f0` |
| Email Cloudflare | `Desarzens.kevin@gmail.com` |
| Worker URL | https://apex-push-worker.desarzens-kevin.workers.dev |
| Health endpoint | https://apex-push-worker.desarzens-kevin.workers.dev/health |
| Workers dashboard | https://dash.cloudflare.com/ffaca6f306a953f82834db0970f300f0/workers/services/view/apex-push-worker/production |

---

## 💳 PAIEMENTS (handles confirmés Kevin)

| Service | Valeur | Lien public |
|---|---|---|
| 💎 Revolut Revtag | `@kdmc` | https://revolut.me/kdmc |
| 🅿 PayPal.me | _(à coller)_ | _(paypal.me/...)_ |
| ₿ Bitcoin | _(à coller dans Coffre)_ | — |
| 🏦 IBAN | _(privé, dans Coffre)_ | — |

---

> Ce fichier est régénéré automatiquement à chaque commit important par Claude.
> Si tu vois un fichier important manquant, dis-le-moi et j'enrichis le système.
