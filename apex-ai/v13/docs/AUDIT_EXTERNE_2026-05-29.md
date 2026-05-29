# Audit externe extrême — Apex AI v13 (2026-05-29)

**Version :** package.json 13.4.276 · build déployé `apex-ai-v13/` aligné · sw `apex-v13.4.277` (1 patch d'avance).
**Méthode :** 6 sous-agents indépendants (8 axes) + exécution RÉELLE de la chaîne d'outils + re-vérification manuelle. Tout est **mesuré**, rien estimé. Les faux positifs (dus à un outil de lecture renvoyant par moments du contenu périmé dans le bac à sable) ont été écartés après re-vérif.

## Score global pondéré ≈ **15,5/20**
| Axe | Score | |
|---|---|---|
| Architecture | **18/20** | 44/44 features câblées, 84 routes 0 doublon, déploiement propre |
| Sécurité | **12/20** | ⛔ règles Firebase ouvertes (P0) + proxy sans auth |
| Tests / Qualité | **17/20** | TS exemplaire, 12 `any` en source, 8/8 familles critiques testées… mais 84 tests rouges |
| Fonctionnel / E2E | **17/20** | 0 bouton mort, failover IA, persistance OK ; FaceID non câblé au login |
| UX / A11y | **15/20** | Lighthouse mobile 0,99 · a11y 0,93 · axe 0 violation ; viewport bloque zoom |
| Performance | **16/20** | LCP 1,5s, CLS 0 ; TTI 4,4s à améliorer |

---

## 🔴 P0 — à traiter en priorité absolue

### P0-1 — Règles Firebase OUVERTES (lecture/écriture publiques, sans auth)
- `firebase-rules.json:16-18` et `firebase-rules-apex.json` (`cmcteams`, `apex`, `shops_admin_v1/orders`) ont `.read:true` + `.write:true` **sans aucune auth**.
- **Impact réel :** n'importe qui sur Internet peut LIRE et MODIFIER les plannings des 258 employés, le pipeline `ax_claude_todo`, la télémétrie, et les backups vault (chiffrés mais exfiltrables). C'est l'anti-pattern interdit par CLAUDE.md (« 🟡 CMCteams Firebase rules à durcir »).
- Le bloc durci `_phase5_after_worker` (scopé `auth.uid` / `auth.token.role`) est **déjà écrit mais NON déployé**.
- **Fix prudent (peut casser la prod si bâclé — cf. CLAUDE.md) :** déployer d'abord l'auth worker Phase 5, migrer l'app vers Firebase Auth, PUIS activer les règles scopées. Intérim minimal : passer les `true` à `auth != null`. **À faire dans un chantier dédié, pas à l'aveugle.**

---

## 🟠 P1 — majeurs

### P1-1 — 84 tests RÉELLEMENT en échec (11 fichiers / 11 833 tests)
Caractérisation mesurée : **80 AssertionError** (pas des timeouts — `test_timed_out=0`), + 3 `crypto_worker_timeout`. Concentration nette :
- `apex-tools-dispatch-fetch-mocks.test.ts` : **40** échecs
- `apex-tools-dispatch-knowledge.test.ts` : **18**
- `apex-github-write.test.ts` : **8/8**
- `apex-tools.test.ts` : **7**
- `v13_4_98-vault-multi-uid-restore` : 3 · `services-auto-backup` : 3 · `agent-system`, `apex-self-audit-deep`, `rules-injection-watch`, `services-apex-plugins-marketplace` : 2 chacun · 6 autres : 1.
- **Diagnostic :** la concentration sur `apex-tools-dispatch` (≈73/84) pointe une **cause racine commune** dans la couche dispatch/mocks fetch (pattern « mêmes erreurs = cause unique en amont », leçon #65), pas 84 bugs distincts.
- **CI = vérité :** `apex-v13-ci.yml` exécute typecheck+lint+test à chaque push → **le main est probablement rouge**. À traiter en P1.
- **Fix :** identifier le commit/mock fautif dans `apex-tools-dispatch*`, corriger la cause unique, re-valider `npm run test`.

### P1-2 — `proxy-apex.js` : abus de facturation possible
- `apex-ai/proxy-apex.js` : **aucun rate-limit** (malgré commentaire contraire), **aucun header d'auth**, et `origin===""` **bypasse** le contrôle CORS.
- **Fix :** header `x-apex-token` (SHA-256 vs secret), rate-limit par IP (KV/Durable Object), rejeter `origin===""`.

### P1-3 — FaceID/WebAuthn NON câblé au login utilisateur (règle absolue Kevin)
- `services/auth/webauthn.ts` est complet mais utilisé **seulement** pour les re-auth admin. `features/landing/index.ts` = 0 réf FaceID ; onboarding = 0 enroll. → la règle « 1ʳᵉ connexion PIN, ensuite FaceID auto » n'est pas déployée (pattern erreur #28).
- **Fix :** enroll opt-in après le 1ᵉʳ login + bouton « Déverrouiller FaceID » sur la landing, fallback PIN.

### P1-4 — XSS : sanitize non garanti hors chat
- 302 `.innerHTML=` mesurés, 6 fichiers seulement branchent DOMPurify. Le **chat est assaini** (`renderMarkdown`→`sanitizeHtml`, vérifié), mais les chemins à données externes **vision-recognition / browser / knowledge-bank / notes** ne sont pas garantis.
- **Fix :** router ces sites via `ui/dom.ts setHTML()` / `sanitizeHtml`.

### P1-5 — Monolithes
- `features/chat/index.ts` **3730 l**, `services/sentinels/sentinels.ts` **2748 l** (10 fichiers > 1500 l). → découper par responsabilité.

---

## 🟡 P2 — mineurs (mesurés)
- **A11y viewport** : `maximum-scale=5` fait échouer le check meta-viewport Lighthouse (WCAG 1.4.4). Retirer `maximum-scale` → `width=device-width,initial-scale=1,viewport-fit=cover`. (⚠️ historiquement Kevin a combattu le zoom intempestif #56 — à valider avec lui.)
- **5 touch targets < 44px** : icônes chat 36px (`features/chat/index.ts`), `.ax-tool-dismiss` 28px → `min-height:44px`.
- **236 hex hardcodés** hors `tokens.css` (or #c9a227 ×72, #e8b830 ×19) → `var(--ax-gold*)`.
- **8 inputs sans label + 11 boutons sans aria-label** (notes/calendar/crypto/archive/plugins).
- **Skeletons définis non câblés** dans les features lazy.
- **2 `console.*` parasites** hors logger : `core/bootstrap.ts`, `services/integrations/auto-discover-links.ts`.
- **78/256 services sans test homonyme** (gros : `voice.ts` 1417 l, `personal-assistant.ts` 1438 l, `sentinels-registry.ts`, `direct-connectors-registry.ts`).
- **sw CACHE_VERSION** `apex-v13.4.277` vs APP_VER `13.4.276` (drift d'1 patch ; sentinelle sw-cache-sync rattrape).
- **`business-intelligence.ts`** : métriques hardcodées (avg_session 12, retention 65) → mensongères si affichées.
- **~17 fuites d'erreur brute** `toast(...err.message...)` dans 12 features périphériques → harmoniser via `errors.toUserMessage()`.
- TTI mobile 4,4 s · `madge --circular` non exposé en script npm.

---

## ✅ Forces vérifiées (mesurées)
- **0 secret en dur** ; 0 `eval`/`new Function` ; secrets jamais en clair (localStorage/console).
- **Auth robuste** : PBKDF2 200k, PIN per-user (bug #37 corrigé), comparaison timing-safe, anti-énumération, rate-limit progressif device-bound.
- **Vault** AES-GCM-256 + PBKDF2 200k ; bug #58 (storage_key/storageKey) absent, roundtrip testé.
- **CSP scripts** : nonce dynamique, **pas** d'`unsafe-inline`/`unsafe-eval` sur script-src ; object-src/frame-ancestors `none`.
- **Architecture** : 44/44 features câblées, 84 routes 0 doublon, **déploiement via `auto-deploy-apex-v13-build.yml` qui copie `dist/*`** (pas la source, conforme #54) + `tsc --noEmit` bloquant ; `apex-ai-v13/index.html` = 0 `APEX_BOOT_NONCE` littéral.
- **TS exemplaire** : strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` ; `no-explicit-any:'error'` ; **12 `any` en source seulement**.
- **Tests** : 11 740 verts, couverture lignes 83,86 % / fonctions 91,43 %, seuils gate 70/70/82/70 `reportOnFailure`, 8/8 familles critiques testées.
- **E2E** : 0 bouton mort, 0 vue blanche, failover IA (Anthropic→OpenRouter→Groq→Gemini→local), « je n'ai pas compris »/« pas d'API » bannis, persistance chat+settings au reload, auto-login + trust device.
- **UX** : Lighthouse mobile **0,99** / a11y **0,93** / axe **0 violation** / CLS **0** / LCP **1,5 s** ; badge version câblé au boot (bottom-left, safe-area).

---

## Plan d'action priorisé
1. **P0 Firebase** (chantier dédié, prudent) : Phase 5 auth worker → règles scopées `auth.uid`.
2. **P1 tests** : trouver la cause unique `apex-tools-dispatch*` → fixer → CI verte.
3. **P1 proxy** : auth + rate-limit + rejet `origin===""`.
4. **P1 FaceID** : câbler enroll + déverrouillage sur la landing.
5. **P1 XSS** : router vision/browser/knowledge/notes via `setHTML`.
6. **P2** : viewport a11y (valider Kevin), touch targets 44px, aria-labels, tokens couleurs, console→logger.

> Aucune correction de code appliquée à l'aveugle cette session : l'outil de lecture renvoyait du contenu périmé par intermittence → risque de régression sur une app commercialisée (règle « JAMAIS RÉGRESSER »). Le P0 Firebase est explicitement « peut casser la prod si mal fait » (CLAUDE.md) → chantier dédié, pas un flip aveugle. Chaque fix se re-valide par `npm run typecheck && lint && test && build` depuis `apex-ai/v13`.

---

## Annexe — diagnostics précis (ajout post-audit perf)

### A. Cause racine des 84 tests rouges = gating de TIER (très haute confiance)
Les messages d'échec mesurés sont dominés par :
- **118×** `expected false to be true` et **4+4×** `expected 'Tier insuffisant' to contain 'invalide'/'query'/'path'/'404'`.
- Logs dispatch observés : `apex-tools Tool exec: weather (client_free) → FAIL`, idem `read_file`, `finance_calculate`, `scrape_url`, `web_fetch`, `market_data`… **en tier `client_free`**.

➡️ La couche `services/apex-tools-dispatch*` **rejette ces outils pour le tier `client_free` avec le message « Tier insuffisant »**, alors que les tests attendent le résultat métier (erreur `404`/`invalide`/`path`, ou succès). **Une seule cause** explique ≈73/84 échecs : un changement de politique de tier (gating durci) **non répercuté dans les tests**, OU une régression du gating.

**À trancher (NE PAS corriger à l'aveugle) :**
- Si le durcissement de tier est **voulu** → mettre à jour les tests dispatch pour exécuter en tier admin/pro (faible risque produit).
- Si c'est une **régression** (client_free devrait accéder à ces outils) → corriger le gating — mais **attention sécurité** : ne pas ouvrir des outils admin à `client_free`. Décision produit requise.
- Méthode : `git log -p services/apex-tools-dispatch*` autour du dernier changement de tier + lire `apex-tools-registry` (champ tier par outil).

### B. P0 perf — `apex-ai/sw.js` figé à `apex-v12.785`
- `apex-ai/sw.js:13` → `CACHE_VERSION='apex-v12.785'` alors que l'app = `v13.4.277`. `PRECACHE_ASSETS` liste des `./modules/*.js` v12 **inexistants** en v13.
- C'est le bug « MAJ qui ne passe pas » (erreur #39 + règle ABSOLUE `CACHE_VERSION='apex-'+APP_VER`). Reliquat v12 ; le SW actif v13 est `apex-ai-v13/sw.js` (`apex-v13.4.277`), mais tout ancien install PWA scope `/apex-ai/` peut encore servir du cache v12.
- **Fix :** soit supprimer `apex-ai/sw.js` (archive v12), soit le resynchroniser ; et confirmer que la sentinelle `sw-cache-sync` couvre bien les 3 sw.js.

### C. Compléments perf (mesurés, pas de fuite massive)
- Bundle sain : 726 KB gzip / 190 chunks, aucun > 100 KB raw, dompurify/fuse tree-shakés ; **pas** de SDK firebase monolithique (REST/SSE custom ~2 KB). Boot `requestIdleCallback` + `deferredInits`.
- Timers : pas de fuite massive (2 `setInterval` sans clear), MAIS autonomous-watch/layout-inspector/SW-update non pausés sur `visibilitychange=hidden` → réveil CPU/batterie iPhone en arrière-plan (P1 léger).
- Listeners 82 `addEventListener` vs 24 `removeEventListener` → registre de cleanup conseillé.
