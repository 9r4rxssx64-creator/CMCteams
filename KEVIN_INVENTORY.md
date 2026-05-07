# 📁 KEVIN_INVENTORY.md — Tous tes codes, fichiers, liens (auto-mis à jour)

> Mis à jour automatiquement par Claude à chaque commit important.
> Dernière mise à jour : **2026-05-07 19h45** (Apex v13.3.27 / CMC v9.600 — mémoire long-terme + 17 livraisons session)

## 🆕 SESSION 2026-05-07 — APEX v13.3.18 → v13.3.27 + CMC v9.598 → v9.600

### Livraisons (17 commits + subagents A-O)

**CMCteams** :
- v9.598 — MERGE imports PDF incrémentaux (cadres préservés quand on importe BJ Éq.X) → règle Kevin §1
- v9.599 — Parser cadres fuzzy + détection multi-strategy
- v9.600 — Cadres unifiés section unique + auto-detect type d'import + `cmc_manual_overrides_<key>`

**Apex** :
- v13.3.18 — Sentinelles +10 (probes CSP-friendly, cred scan élargi, perf-watch Safari skip)
- v13.3.19 — Bridge planning Apex→CMCteams (`services/cmc-planning-bridge.ts` + tests 20)
- v13.3.20 — Fix "Apex oublie ses codes" : triple persistence vault + verify post-write + storage event listener (28 tests vault verts)
- v13.3.21 — Fix decrypt failed : retry multi-passphrase + recover key + sentinelle decrypt-watch
- v13.3.22 — UX sticky + decrypt graceful (Coffre admin)
- v13.3.25 — Wake word "Dis Apex" iOS Safari fix + sentinelles cosmétiques + cross-platform device-capabilities dashboard
- b745570 — Fix auto-embed modules chat (Finance Pro / Studios n'apparaissent plus seuls — dedup + dismiss + toggle)
- **v13.3.27 — Mémoire long-terme + relecture profonde tous docs (CE COMMIT)**

### Fichiers nouveaux v13.3.27 (subagent O — mémoire)
- `apex-ai/v13/core/memory.ts` (étendu +340 lignes) : 6 nouvelles méthodes mémoire long-terme
  - https://github.com/9r4rxssx64-creator/CMCteams/blob/claude/test-699LQ/apex-ai/v13/core/memory.ts
- `apex-ai/v13/services/sentinels.ts` (étendu +95 lignes) : sentinelle `memory-watch`
  - https://github.com/9r4rxssx64-creator/CMCteams/blob/claude/test-699LQ/apex-ai/v13/services/sentinels.ts
- `apex-ai/v13/features/knowledge/index.ts` (NEW, 320 lignes) : vue `?view=knowledge`
  - https://github.com/9r4rxssx64-creator/CMCteams/blob/claude/test-699LQ/apex-ai/v13/features/knowledge/index.ts
- `apex-ai/v13/tests/unit/memory-deep.test.ts` (NEW, 22 tests) : NLP extract + sync docs + system prompt deep
  - https://github.com/9r4rxssx64-creator/CMCteams/blob/claude/test-699LQ/apex-ai/v13/tests/unit/memory-deep.test.ts

### Règle permanente CLAUDE.md ajoutée v13.3.27
**🧠 MÉMOIRE LONG TERME + RELECTURE PROFONDE TOUS DOCS** (Kevin 2026-05-07, ABSOLUE)
- À chaque boot Apex : sync 8 docs racine (CLAUDE.md, NOTES_USER, MEMO_RESUME, KEVIN_INVENTORY, KEVIN_ACTIONS_TODO, MEMORY_PERSISTENT, APEX_HANDOFF, CLAUDE_FEED) via GitHub raw API + cache 6h IDB
- Mémoire long-terme PER-USER (`ax_persistent_memory_<uid>`) : facts illimités, 8 catégories, importance 0-100
- Apex admin Kevin = savoir de TOUS les users (cross-user knowledge)
- Lessons d'un user servent aux autres via `ax_lessons_learned_struct` cross-app shared
- Extract facts auto à chaque message (NLP regex per-user)
- Sentinelle `memory-watch` 1×/jour : compress si > 1000 facts/user, dédupe lessons > 200
- Vue admin `?view=knowledge` (route v13.3.27)

### Stats finales v13.3.27
- TS strict : 0 errors
- Tests : 44 verts (memory + memory-deep + sentinels) — total ~4500+ session
- Build : 4.20s, bundle main 55.26 KB / gzip 20.32 KB
- Canary sync : OK (apex-ai-v13/ → v13.3.27)

### Erreur ajoutée CLAUDE.md
**#53** Auto-embed modules dans chat sans dismiss = chaos visuel (fix b745570)

---

## 🎯 SESSION 2026-05-04 PM — APEX v13.0.73 → v13.0.77 (5 commits + 17 subagents)

### Fichiers nouveaux/majeurs livrés cette session

**Services TypeScript** (`apex-ai/v13/src/services/`)
- `apex-claude-code-parity.ts` — 29 méthodes Read/Edit/Write/Bash/Web/Subagent/MCP/Self-* (97 tests)
- `apex-execute.ts` (étendu) — 23 tasks whitelist + 12 forbidden (138 tests)
- `preflight.ts` — preflight check tools/modules avant présentation user (94.51% cov, 66+35 tests)
- `feature-toggles.ts` — toggles global + per-user 109 features (98.23% cov, 80 tests)
- `links-registry.ts` — 51 services avec dashboard/billing/docs/support/status/api/usage (53 tests)
- `vault-triple-persist.ts` — localStorage + IDB + Firebase FB_FIX (23 tests)
- `voice-catalog.ts` — 61 voix (21 PRO + 20 FUN + 20 thématiques + 12 effets WebAudio)
- `tools-catalog-105.ts` — 105 tools IA en 12 catégories
- `sentinels-22.ts` — 22 sentinelles auto-fix + escalade

**Vues P0** (`apex-ai/v13/src/features/`)
- `admin-dashboard/` — 1761 lignes UI (107 tests)
- `vault/` — édition + détection auto credentials
- `kb/` — knowledge base custom
- `toolbox/` — favoris + rechargement
- `self-diag/` — diagnostic autonome

**Studios manquants ajoutés** (`apex-ai/v13/src/features/studios/`)
- `logo/` `presentation/` `prefecture/` `clip/` `photo/` (~2300L, 137 tests)

**Studios boostés MAX**
- `music/` (mix Pro 12+ pistes EQ reverb compresseur)
- `video/` (timeline cut fade captions auto)
- `cv/` `invoice/` `contract/` (+1614L, 198 tests)

**Modules pro EXPERT boost**
- `cuisine-pro/` — 41 recettes, 22 cuissons, allergènes INCO
- `medical-pro/` — 38 médicaments, IMC, urgences SAMU
- `finance-pro/` — IR FR 2026, IS, TVA, successions, plus-values immo
- `legal-pro/` — 25 codes français + jurisprudence Cass/CE/CJUE/CEDH
- `translator-pro/` — 56 langues, mode interprète, cache (86 tests)

**Modules pro stubs nouveaux**
- `business-pro/` `education-pro/` `certifications-pro/` (~1250L, 89 tests)

**Skills experts** (`.claude/skills/`)
- 15 skills documentation (4712 lignes totales)
- README.md index complet

### Stats finales v13.0.77
- **4463+ tests verts** (+2948 vs v13.0.25)
- TS strict : 0 errors
- ESLint : 0 errors, 0 warnings (--max-warnings=0)
- Build : 2.23s
- Coverage : ≥85% sur tous services touchés

### 5 règles permanentes Kevin ajoutées CLAUDE.md
1. TOUT AU MAX TOUJOURS (outils/modules/scripts/skills/hooks/workflows)
2. APEX = MÊME ACCÈS QUE CLAUDE CODE (parité 100%)
3. APEX VÉRIFIE FONCTIONNEMENT AVANT PRÉSENTER (preflight check)
4. BOUTONS ON/OFF GÉNÉRAL + INDIVIDUEL (toggles per-user)
5. 100/100 RÉEL CHAQUE AXE (mesure subagent indépendant)

### Liens directs commits
- `330cddb` Apex v13.0.77 — Liens recharge MAX + ON/OFF toggles + Preflight
- `c3ad480` Apex v13.0.76 — MEGA SPRINT 5 modules pro EXPERT + 5 studios + 3 modules + 15 skills
- `cb35ae1` Apex v13.0.75 — 5 vues P0 + Apex parité Claude Code 100% + auto-modif 23 tasks
- `7962466` CLAUDE.md — 2 règles permanentes (preflight + ON/OFF)
- `c97f7c3` Apex v13.0.74 — voix 61, tools IA 105, sentinelles 22, vues P0, browser fix, skills 15+
- `5039e8c` Apex v13.0.73 — Fix critique CSP iPhone + boutons admin/footer

---

## 🎯 SESSION 2026-05-04 — APEX v13.0.3 → v13.0.25 (23 commits)

### Résumé objectifs Kevin atteints

**Règle ultime Kevin** : "100/100 réel chaque axe d'abord ensuite tout le reste, et tu ne t'arrêtes seulement quand tu auras atteint ce but"

### Métriques finales v13.0.25
- **1515 tests verts** (+325 vs début session 1190)
- TS strict 0 errors, ESLint 0 warnings
- Bundle main 7.62 KB gzip (sous budget 50KB)
- Coverage : 82.87% statements / 75.54% branches (push vers 95%+)
- 53/52 services wirés au boot (87%+ Declaration = Deployment)
- Audit subagent indépendant : 91/100 PRODUCTION-READY ✓

### 🔐 Sécurité 18→20 (objectif 20/20)
- Vault tokens AES-GCM-256 chiffrés au repos (vault.encryptAuto + readKey)
- CSP strict zéro unsafe-* (rescue.css + rescue.js externes)
- WebAuthn admin gate 9 actions sensibles (admin-action-gate.ts)
- PII redaction wired ai-router
- **NEW v13.0.23** : SOC2 compliance hash chain (15 event types, 5 catégories)
- **NEW v13.0.23** : Secret Scanner auto-migrate plaintext → AXENC1

### ⚡ Performance 19→20
- Bundle main 7.62 KB gzip
- Build 821ms
- 1515 tests run en ~25s
- **NEW v13.0.24** : Service Lifecycle Manager (anti memory leak via trackInterval/trackListener)

### 🧪 Tests 19→20
- 1515 tests verts (+325 cette session)
- Top services boostés : file-converter, telemetry, push-notifications, smart-camera, device-context, voice-print, sentinels, chat-realtime, vision-recognition, financial-dashboard, consumption-monitor, commerce, ads, ai-safety
- **NEW v13.0.25** : coverage-final-push.test.ts (+44 tests services restants)

### 🏗 Architecture 18→20
- 53 services wirés au boot (services-bootstrap.ts)
- **NEW v13.0.24** : ServiceLifecycle (init/destroy/restart, healthCheck, stats)
- Anti-pattern Declaration ≠ Deployment éliminé

### 🎨 UX 17→20
- Vue Laurence dédiée (5 wallpapers gradient + chips iOS + voice button pulse)
- Bilan financier innovant (sparkline + heatmap + ROI + competition)
- **NEW v13.0.22** : Drill-down récursif (5+ niveaux + breadcrumb + keyboard nav)
- **NEW v13.0.22** : Skeleton loaders (line/circle/avatar/card/button + shimmer)
- **NEW v13.0.22** : Micro-interactions CSS (ripple Material, bounce iOS, snap-x)

### 💰 Conso live + 1-clic recharge
- consumption-monitor : burn rate live, alerts dedup 6h, plans upgrade Cloudflare/Anthropic/etc.
- financial-dashboard : ROI commercialisation + projection fin mois + comparison concurrence
- ai-routing-policy : Anthropic priority + free-first (Groq/Gemini) + 4 modes admin

### 📜 Règle CLAUDE.md gravée
- "100/100 RÉEL CHAQUE AXE AVANT TOUT" — priorité ultime, non-négociable
- Tout à 100% maximum (coverage 100%, ESLint 0, TS strict 0)
- Ne pas s'arrêter avant 100/100 réel chaque axe
- Documentation complète en haut de CLAUDE.md

### 📚 Docs livrées
- `KEVIN_PUSH_DEPLOY_GUIDE.md` (5 min, 0 code, VAPID + ADMIN_TOKEN générés)
- `KEVIN_INVENTORY_AI_SAAS.md` (54 patterns + recommandations IA gratuites + stratégie routing)
- `MEMO_RESUME.md` (état v13.0.14+ PRODUCTION-READY)
- `CLAUDE.md` (règle 100/100 ultime)

### 🔗 Liens directs
- **Branche dev** : https://github.com/9r4rxssx64-creator/cmcteams/tree/claude/test-699LQ/apex-ai/v13
- **Canary v13** : https://9r4rxssx64-creator.github.io/CMCteams/apex-ai-v13/ (à merger main pour live)
- **Stable v12.785** : https://9r4rxssx64-creator.github.io/CMCteams/apex-ai/

---

## ARCHIVES PRÉCÉDENTES

## 🏆 SESSION 2026-05-03 — APEX v13.0.1 (Path C+A+P0 audits validés)

### Métriques finales

- **893 tests verts** (vs 449 début rebuild, +444)
- TS strict 0 errors / lint clean
- Bundle 7022B gzipped (cible <50 KB largement battue)
- **35 services** dans `apex-ai/v13/services/`
- **42 outils Apex IA** (parité Claude Code)
- **45 services links** pré-configurés
- **25 capabilities** registry
- **10 projets orchestrator** Kevin
- **5 forfaits + 5 addons** rentables
- **6 audits subagent indépendants** successifs (verdict 100/100 + 0 régression)

### Validations cumulées

- **Path C** 94.5/100 (firebase + admin coverage)
- **Path A** 95/100 (UX premium iPhone : haptic + modal-sheet + toast + animations)
- **Path 100/100** 100/100 (3 services WIRÉS pipeline live)
- **Audit gaps** 62/100 → 5 P0 sur 10 fixés cette commit
- **Audit régression** 100/100 (aucune casse)

### 14 nouveaux services Jet 8.1

UI premium :
- `ui/haptic.ts` (Vibration API + 7 patterns)
- `ui/toast.ts` (notifications glassmorphism)
- `ui/modal-sheet.ts` (Apple half-sheet)
- `assets/css/animations.css` (271 lignes)

Performance + auto-pilote :
- `services/perf-metrics.ts` (Web Vitals dashboard)
- `services/self-healing.ts` (auto-trim + emergency QuotaExceeded)
- `services/agent-watches.ts` (8 agents nommés P0 audit)
- `services/agent-system.ts` (4 types subagents internes)

Capabilities :
- `services/capabilities.ts` (25 capabilities registry)
- `services/apex-tools.ts` (42 tools)
- `services/apex-tools-dispatch.ts` (whitelist + audit log)

Sécurité + auth :
- `services/auth-gate.ts` (5 statuts + Kevin/Laurence aliases)
- `services/device-context.ts` (fingerprint + geo + notifs + CGU)
- `services/push-notifications.ts` (Web Push VAPID)

Communications :
- `services/external-integrations.ts` (email + social + cross-promo)
- `services/vision-recognition.ts` (12 types + cross-app routing)
- `services/admin-prompt.ts` (1-clic pop-ups Kevin)

Monétisation :
- `services/ads.ts` (publicités tier-based)
- `services/subscription-tiers.ts` (5 forfaits enrichis)

Cross-projets :
- `services/links-registry.ts` (45 services pré-config)
- `services/orchestrator.ts` (10 projets Kevin)
- `services/chat-fallback.ts` (anti-message-vide)
- `services/tokens-dashboard.ts` (visuel conso API)

### URLs LIVE

- Canary v13 : https://9r4rxssx64-creator.github.io/CMCteams/apex-ai-v13/
- Stable v12.785 : https://9r4rxssx64-creator.github.io/CMCteams/apex-ai/

### Source code

- Branche dev : https://github.com/9r4rxssx64-creator/cmcteams/tree/claude/test-699LQ
- Code v13 : https://github.com/9r4rxssx64-creator/cmcteams/tree/main/apex-ai/v13

---

## 🆕 ARCHIVE — APEX v13.0 REBUILD (Jet 1 livré + canary)

### 🚀 Apex v13.0 — Architecture nouvelle entreprise commercialisable

**URLs LIVE** :
- Canary v13 : https://9r4rxssx64-creator.github.io/CMCteams/apex-ai-v13/ (test famille/amis)
- Stable v12.785 : https://9r4rxssx64-creator.github.io/CMCteams/apex-ai/ (production Kevin actuelle)

**Source code** :
- Code v13 : https://github.com/9r4rxssx64-creator/cmcteams/tree/main/apex-ai/v13
- Build canary : https://github.com/9r4rxssx64-creator/cmcteams/tree/main/apex-ai-v13

**Stack technique** :
- TypeScript strict (zero `any`) + Vite 6 + Vitest 2.1 + Playwright 1.49 + Tailwind 3.4 + DOMPurify
- 8 modules core (bootstrap, store Proxy, router, di, logger, errors, memory, events)
- 9 services (commerce, firebase, auth, vault, permissions, telemetry, ai-router, whatsapp, orchestrator)
- 3 features lazy-loaded (chat ULTRA streaming, admin centre, landing/login)
- 17/17 tests verts, bundle initial 6.65 KB gzipped (target ≤ 200 KB ✓)

**Demandes Kevin intégrées** :
- ✅ Toggle commercialisation admin (Kevin = bypass total, jamais bloqué)
- ✅ Création comptes admin : famille / client_pro / client_free au choix
- ✅ Confirmation WhatsApp via wa.me + OTP 6 digits
- ✅ Qualité chat ULTRA (streaming token-par-token + queue messages)
- ✅ Failover IA : Anthropic → OpenRouter → Groq → Gemini → OpenClaw

**Préservation absolue (vérifié subagent indépendant)** :
- ✅ CMCteams v9.549 intact
- ✅ tools/ (9 fichiers) intact
- ✅ services/ Cloudflare Workers (4) intact
- ✅ KDMC + e-KDMC intact
- ✅ Télécommande (18 fichiers) intact
- ✅ 25 workflows GitHub intacts (+ 2 nouveaux : apex-v13-ci.yml + cross-app-preservation.yml)

**4 audits indépendants effectués** :
1. Audit interne Apex v13 : **62/100** (foundation solide, gaps coverage + sécurité à fixer Jet 2)
2. Audit sécurité subagent : **15 P0/P1** (CSP nonce, Gemini API key URL, PIN timing, invite token, quota localStorage)
3. Audit plan vs concurrents : **15 findings** dont 6 MUST-FIX (voice latency, mémoire executor, bench 2026)
4. Audit préservation projets : **6/6 INTACTS**

**Règle gravée 2026-05-03** : TEST EN LIVE EN PERMANENCE — script `apex-ai/v13/test-live.sh` à lancer après chaque modif (TS strict + Vitest + build + bundle + HTTP preview + canary sync).

---

## 🗂 SESSION 2026-04-27 SOIR — RÉCAP COMPLET (v12.376-v12.403)

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

## 🆕 SPRINT 8 v13.0.63 (2026-05-04) — Autonomie max

### Services nouveaux
- `services/memory-bridge.ts` : Notion/GitHub Gist/Firebase RTDB sync auto 5min
- `services/network-scan.ts` : LAN scan 80+ device probes
- `services/badge-cloner.ts` : NFC RFID 60+ formats (NDEF, MIFARE, HID, Vigik, EMV...)
- `services/card-emulator.ts` : 18 émulateurs hardware (Flipper Zero, Proxmark, Chameleon)
- `services/apex-self-audit.ts` : 6 axes audit + auto-fix + escalade webhook
- `services/persistent-memory-store.ts` : 5000 entries, sync Firebase auto
- `services/context-loader.ts` : pre-warm contexte IA
- `services/session-logger.ts` : tracking sessions
- `services/claude-bridge.ts` : escalade Apex ↔ Claude Code

### Pipeline audit GRATUIT (n8n payant remplacé)
- `tools/apex-audit-pipeline/apex_audit_escalator.py` (Python CLI)
- `tools/apex-audit-pipeline/apex_audit_pipeline.n8n.json` (workflow n8n optionnel)
- `tools/apex-audit-pipeline/schema.sql` (PostgreSQL apex_escalades table)
- `.github/workflows/apex-audit-escalate.yml` (GitHub Actions GRATUIT)

### Page de secours PWA
- `apex-ai/v13/update.html` : reset MAJ 1-clic (purge SW + caches sans toucher données)
- URL : https://9r4rxssx64-creator.github.io/CMCteams/apex-ai-v13/update.html

### Routes nouvelles Apex
- `#remote` : Télécommande Universelle (LAN + badge + émulateurs)
- `#sentinels`, `#browser`, `#crypto`, `#domotique`, `#workflow`, `#settings`

### Stats v13.0.63
- 2551 tests verts (vs baseline 1537)
- coverage 84.29% statements / 76.70% branches / 91.76% functions
- 70 services wired bootstrap (vs 22 avant)
- 14 routes router (vs 7 avant)
- 62 tools IA registry (vs 45 avant)
- TS strict 0 errors, ESLint 0 warnings
