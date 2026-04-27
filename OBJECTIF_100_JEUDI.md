# 🎯 OBJECTIF 100/100 — JEUDI 2026-04-30

> Plan consolidé Apex AI + CMCteams pour atteindre 100/100 sur tous axes (ou au plus proche).
>
> **Aujourd'hui** : lundi 2026-04-27 nuit (v12.425)
> **Deadline** : jeudi 2026-04-30 (3 jours = 72h)
> **État de départ** (audit pro 5 agents) : SECU 51, PERF 51, UX 62, CODE 52, RGPD 54, AI Act 65 — moyenne ~55/100
> **Cible** : 100/100 partout, ou réaliste honnête 85-95/100 selon axe

---

## 📊 Tableau de bord progression cible

| Axe | Actuel | Jeudi | Effort | Méthode |
|-----|--------|-------|--------|---------|
| **Sécurité** | 51 | 95+ | 30h | SRI + WebAuthn + AES-GCM stable + DPA |
| **Performance** | 51 | 90+ | 25h | Module split + Brotli + cleanup intervals + LCP <2.5s |
| **UX/A11y** | 62 | 95+ | 18h | ARIA massif + WCAG AA full + Dynamic Type + i18n |
| **Code Quality** | 52 | 88+ | 35h | Refactor _callClaudeAPI + tests Jest 60%+ + SafeCatch |
| **RGPD** | 54 | 95+ | 12h | Firebase deletion + DPIA + DPA + DPO + consent flow |
| **AI Act** | 65 | 95+ | 5h | Disclosure agents + tech doc + transparency banner |
| **Functional UX** | 78 | 100 | 8h | E2E flows polish + multi-device sync hardening |

**Total effort estimé** : ~133h compressé sur 3 jours = ~44h/jour avec **parallélisation 4-6 subagents**.

---

## 🌅 MARDI 2026-04-28 (Jour 1) — SECU + PERF + AUTO

### ☑ v12.427 — Acquisition autonome clés manquantes (Kevin priority)
- Browser embed mapping 20+ services (Groq, Anthropic, OpenAI, Gemini, Cloudflare, Stripe, GitHub, Brave, etc.)
- Watch clipboard auto au visibility change
- Auto-classify + auto-stocke dans bon champ + auto-test live
- Guide step-by-step ultra-simple (12-year-old level)
- Recovery link automatique sur 401/402/429/5xx (déjà v12.412, étendre)
- Memory `ax_acquisition_history` cross-session
- **Effort : 10h**

### ☑ v12.428 — SRI hashes sur tous CDN
- Calcul SHA-384 hash de chaque CDN externe (DOMPurify, Tesseract, Pyodide, Sentry, Stripe, Chart.js, jspdf, lz-string, qrcode, mqtt, web-llm, pdf.js, highlight.js, meyda)
- Ajout `integrity="sha384-xxx"` + `crossorigin="anonymous"` (déjà v12.422)
- Test loading + fallback si CDN compromis
- **Effort : 3h**

### ☑ v12.429 — WebAuthn registration + authentication FULL
- `axBiometricRegister()` : `navigator.credentials.create` avec `userVerification:"required"`, `residentKey:"required"`
- `axBiometricAuth()` : `navigator.credentials.get` avec challenge nonce serveur
- Storage credential ID chiffré dans localStorage
- Fallback PIN si WebAuthn refused
- Vue admin `vBiometricStatus` : voir si enrollée + bouton "Re-enroll"
- **Effort : 12h** (subagent dédié)

### ☑ v12.430 — Code splitting partiel (lazy CDN load on-demand)
- Tesseract.js : load seulement quand `axSmartCamera` ou `axOcrPdf` invoquée
- Pyodide : load seulement si user demande Python eval
- web-llm Gemma : load seulement mode offline activé
- Defer Sentry boot 5s (non-critique au boot)
- Defer Firebase SSE init 100ms (déjà v12.416)
- LCP cible <2.5s sur iPhone 12 4G
- **Effort : 8h**

**Total Jour 1 : 33h = 5 streams parallèles ~6.5h chacun**

---

## 🌞 MERCREDI 2026-04-29 (Jour 2) — UX + CODE QUALITY

### ☑ v12.431 — ARIA labels massif WCAG 2.1 AA
- Audit 0.5% → 100% des composants interactifs
- `<label for>` associations sur tous les inputs (vSafebox, vProfil, vContactAdmin)
- `aria-labelledby` + `aria-describedby` sur tous les modals
- `aria-modal="true"` sur tous les dialogs
- `tabindex="0"` sur tous les `.ax-tab` + custom buttons
- `<nav>`, `<main>`, `<footer>` landmarks (VoiceOver)
- `role="status"` aria-live polite (déjà v12.422 toast region)
- Test VoiceOver iOS + TalkBack Android
- **Effort : 12h** (subagent dédié)

### ☑ v12.432 — Replace 179 `innerHTML` → DOMPurify systématique
- Wrapper helper `axSafeHtml(str)` qui retourne string sanitized via DOMPurify v3.0.9
- Replace tous les `el.innerHTML = userText` par `el.innerHTML = axSafeHtml(userText)`
- Strict via test : aucune injection `<script>`, `<iframe>`, `on*=`, `javascript:`
- Pre-commit hook : grep `innerHTML` non précédé de `axSafeHtml/esc/_sanitize` → fail
- **Effort : 16h** (subagent dédié)

### ☑ v12.433 — Refactor `_callClaudeAPI` CC 45 → 12
- Décomposer en 5 sous-fonctions :
  - `_apiValidateInputs(sysPrompt, msgs)` (validation)
  - `_apiBuildPayload(messages, model, tools)` (payload construction)
  - `_apiResolveProvider(opts)` (sélection Anthropic/OpenRouter/Groq/Gemini)
  - `_apiSendRequest(url, opts)` (fetch avec retry/timeout)
  - `_apiHandleResponse(response, depth)` (streaming + tool use)
- Tests unitaires Jest pour chaque sous-fonction
- **Effort : 20h** (subagent dédié — délégué)

### ☑ v12.434 — Tests Jest 60%+ coverage paths critiques
- Setup Jest + jsdom + Babel transpile
- Tests E2E paths critiques :
  - axLogin (PIN normal + admin)
  - axSendMessage + streaming
  - axEncryptSecret/Decrypt round-trip
  - fbWrite + SSE handler
  - Vault add/edit/delete + Firebase real deletion (RGPD Art. 17)
  - Vault encryption v2 cross-device
  - axDetectIntent (42+ patterns)
  - axCredTestLive tous services
- Test runner CI GitHub Actions
- **Effort : 50h** (3 subagents parallèles)

### ☑ v12.435 — `_axSafeCatch` appliqué 504 silent catches
- Wrapper helper `_axSafeCatch(ctx, err, opts)` :
  - Log dans `ax_silent_log` (cap 50)
  - Push Sentry si severity high
  - Console.warn (post-redact via wrapper v12.414)
  - Telemetry vers `ax_telemetry_in` si erreur récurrente
- Replace tous les `catch(_){}` par `catch(e){_axSafeCatch("context", e);}`
- Pre-commit hook : grep `catch\(_\)\{\}` → warn
- **Effort : 12h** (subagent dédié)

**Total Jour 2 : 110h = 6 subagents parallèles ~18h chacun**

---

## 🌃 JEUDI 2026-04-30 (Jour 3) — RGPD + COMPLIANCE + AUDIT FINAL

### ☑ v12.436 — Firebase deletion RÉELLE (RGPD Art. 17)
- `axDeleteAccount()` étendu :
  - localStorage purge (déjà OK)
  - IndexedDB purge complet
  - **Firebase delete via `fbWrite(k, null)` pour TOUTES les paths user**
  - Sentry user reset
  - Sessions tokens revoke
  - Audit trail confirmation `ax_account_deleted_<uid>`
- Modal "Supprimer compte définitivement" avec triple confirmation
- Backup auto avant suppression (téléchargement JSON RGPD Art. 20)
- **Effort : 8h**

### ☑ v12.437 — DPIA + DPA + DPO documentation
- DPIA template (Privacy Impact Assessment) RGPD Art. 35 :
  - Cartographie traitements
  - Bases légales par catégorie données
  - Risques identifiés + mitigations
  - Avis DPO
  - Mesures sécurité Art. 32
- DPA Firebase/Google : signer template Google Cloud DPA standard
- DPO appointment : note préliminaire (consultant externe à recruter)
- Privacy.html étendu : voiceprints MFCC mention explicite
- **Effort : 6h**

### ☑ v12.438 — AI Act EU compliance disclosure
- Banner top "✨ Powered by AI - Tu interagis avec un système IA"
- Section "Comment Apex prend des décisions" dans Privacy
- Liste 42+ intents auto-execution disclosed
- Documentation technique publique (apex-ai/docs/ai-act-compliance.md)
- Marquage "Limited Risk AI System" dans manifest
- **Effort : 4h**

### ☑ v12.439 — Cookie consent banner robuste
- Renforcer v12.422 banner :
  - Granular : Storage / Sentry analytics / Firebase / IA processing
  - Toggles individuels avec OK/Refuse par catégorie
  - Lien "Modifier mes préférences" dans Settings
  - Re-prompt après 12 mois (RGPD)
  - Audit log `ax_consent_history_<uid>`
- **Effort : 4h**

### ☑ v12.440 — Audit final 5 agents validation 100/100
- Re-lancer les 5 audits experts (SECU, PERF, UX, CODE, RGPD)
- Mesurer scores réels post-fixes
- Si gap → ultime fix urgent
- Rapport consolidé à Kevin
- **Effort : 4h** (parallel subagents)

### ☑ v12.441 — Tests E2E sur 2 iPhones réels (Kevin valide)
- Test 1 iPhone Kevin : login admin + chat + envoi + voice + biometric
- Test iPad si dispo : cross-device sync vault encryption v2
- Test 1 nouvel iPhone (vide) : recovery via PIN
- Test offline + retry queue + replay
- Validation Lighthouse Mobile sur device
- **Effort : 4h**

**Total Jour 3 : 30h = focus final + audit + validation**

---

## 🎯 Synthèse capacités à livrer Jeudi 2026-04-30 EOD

### Apex AI v12.441 doit avoir :

**Sécurité** :
- ✅ Encryption AES-GCM Firebase autonome cross-device (v12.425)
- ✅ WebAuthn UV=required complete
- ✅ SRI sur tous CDN
- ✅ Console anti-leak credentials (v12.414)
- ✅ DOMPurify systématique (v12.432)
- ✅ Audit log immutable + telemetry

**Performance** :
- ✅ LCP <2.5s, TTI <3s sur iPhone 12 4G
- ✅ Code splitting (Tesseract/Pyodide lazy)
- ✅ Memory leaks fixed (v12.416 + v12.435)
- ✅ Boot cleanup quota auto (v12.424)
- ✅ Firebase SSE buffer cap

**UX/A11y** :
- ✅ WCAG 2.1 AA full compliance
- ✅ Dynamic Type clamp (v12.422)
- ✅ Reduced-motion (v12.422)
- ✅ ARIA 100% composants (v12.431)
- ✅ Touch 44px Apple HIG
- ✅ Focus visible + aria-live

**Code Quality** :
- ✅ `_callClaudeAPI` CC <12 (v12.433)
- ✅ Tests Jest 60%+ coverage (v12.434)
- ✅ `_axSafeCatch` partout (v12.435)
- ✅ axStorage wrapper (v12.417)

**RGPD/AI Act** :
- ✅ Firebase deletion réelle Art. 17 (v12.436)
- ✅ DPIA documentation (v12.437)
- ✅ Cookie consent granular (v12.439)
- ✅ AI Act disclosure (v12.438)
- ✅ Voiceprint Art. 9 disclosure (v12.422)

**Autonomie Apex** :
- ✅ Sait où va quoi (v12.401-411)
- ✅ Cherche et prend (v12.427)
- ✅ Self-heal cascade (v12.376/377/378)
- ✅ Recovery link auto (v12.412)
- ✅ Persistence-watch + watchdog (v12.419)

---

## ⚠️ Honnêteté Kevin : 100/100 ABSOLU vs 95+/100 réaliste

**100/100 absolu** = Stripe/Apple Pay grade. Effort réaliste : 12 semaines + 2 sem legal (DPO, lawyer, audit tiers).

**95+/100 réaliste en 3 jours** : possible avec parallélisation 6 subagents + focus extrême + accepting some trade-offs (ex: tests Jest 50% au lieu 60%, DPO appointment lettre intent au lieu signé).

**Recommandation** :
- **Mardi-mercredi** : pousser fort sur SECU/PERF/UX/CODE → réaliste 92-96/100
- **Jeudi** : RGPD + audit final + validation E2E
- Si gap résiduel < 5pt sur tel axe → assumé honnêtement à Kevin, plan post-jeudi pour combler

**Pas de fake 100/100 via tests qui passent automatiquement**. Honnêteté absolue.

---

## 📋 Méthode de travail

1. **Chaque version** : 1 Python script `/tmp/apply_v12_X.py` idempotent + markers
2. **Pre-commit** obligatoire : node --check + 26+ tests OK
3. **sw.js CACHE_VERSION sync** automatique à chaque bump
4. **Subagents en parallèle** : 4-6 à la fois pour différents axes
5. **Validation rigoureuse** après chaque commit (grep + diff + test mental iPhone)
6. **Push direct main** (ou branch feature mergeable) : déploiement GitHub Pages auto
7. **CLAUDE.md + KEVIN_ACTIONS_TODO + MEMO_RESUME** mis à jour à chaque batch
8. **Notif Kevin** push critical fixes + final report

---

**Démarrage planning** : mardi matin 2026-04-28 dès première session.
