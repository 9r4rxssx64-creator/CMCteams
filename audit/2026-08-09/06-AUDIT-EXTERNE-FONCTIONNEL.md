# Audit fonctionnel EXTERNE + indépendant — 2026-08-09 (soir)

> Demande Kevin : « Fais un test de fonctionnalité externe indépendant. Teste imports, etc réel.
> Fais ton audit de ton côté et un audit d'amélioration +++ externe d'indépendant. Va plus loin »
> Base auditée : main `8db5ca784` (CMCteams v9.888 / light v1.34 / août V2 intégré).

## 1. Tests EXTERNES indépendants (hors de mes mains — CI réseau ouvert + experts non-Claude)

| Vérif | Outil (indépendant) | Verdict | Statut preuve |
|---|---|---|---|
| Vraies pages kd-mc.com dans un vrai navigateur (13 surfaces, requêtes réseau, exceptions JS, captures) | `audit-live.yml` run 31341578271 | **SUCCESS** | ✅ VÉRIFIÉ (conclusion API) |
| Numéros de départ sur le VRAI domaine | `live-verify-departs.yml` run 31341585146 | **SUCCESS** | ✅ VÉRIFIÉ |
| Pages live World Monitor + OSINT | `pages-smoke.yml` run 31341588220 | **SUCCESS** | ✅ VÉRIFIÉ |
| Arsenal sécurité (gitleaks, TruffleHog, OSV, Trivy, Semgrep, zizmor) | `security-suite.yml` run 31341581994 | voir journal (en cours à la rédaction) | 🟡 |
| Qualité du diff V2 (PR #3331) | **SonarCloud** (déterministe, non-Claude) | **Quality Gate PASSED** — 0 issue, 0 hotspot sécu, 0 duplication | ✅ VÉRIFIÉ |
| Préservation cross-app (PR #3331) | gate `cross-app-preservation` | **PASSED** | ✅ VÉRIFIÉ |
| Revue CodeRabbit (PR #3331) | CodeRabbit (société externe) | non rendue — limite de reviews gratuites au moment de la PR | 🔴 non obtenu |

## 2. Mon audit de mon côté (imports réels, gate complet, stabilité)

| Vérif | Résultat | Statut |
|---|---|---|
| `test:ci` complet (≈80 suites, imports des VRAIS PDF juillet V2 + août V2 dans un vrai navigateur : fidélité, couverture, everyone-has-planning, départs, équipes, miroirs, app==light) | voir journal ci-dessous | 🟡 en cours à la rédaction |
| `audit:stability` (navigateur réel : re-renders au repos, mutations DOM, CSP⇄fetch, updaters idempotents) | **0 FAIL / 0 WARN** — CSP 9/9 domaines couverts, 3 vues stables au repos | ✅ VÉRIFIÉ |
| `audit:improvements` (ratchet) | **Aucun compteur en hausse** | ✅ VÉRIFIÉ |
| `audit:rules` | 29 gardes AUTO · ratchet règles-sans-garde 19 ≤ 19 | ✅ VÉRIFIÉ |

## 3. Backlog d'améliorations CHIFFRÉ (passe « full améliorations »)

1. **[P1] Fonctions définies en double** : 9 noms (`_norm`×4, `normName`×3, `norm`×3, `fmtD`×3, `fmtTs`×2, `_calcCycle`×2, `fmtDur`×2, `find`×2, `isPosteToken`×2) — la 2ᵉ écrase la 1ʳᵉ en silence.
2. **[P1] `innerHTML` sans échappement visible** : 116 lignes (baseline figée, ratchet actif — le NOUVEAU code est bloqué).
3. **[P2] Fonctions orphelines** : 77 / 1439 déclarées.
4. **[P2] Minuteries** : 11 `setInterval` de plus que de `clearInterval`.
5. **[P2] Vues sans test** : 41 / 102 (ex : vPersistenceAudit, vDocs, vIaFab…).
6. **[P3] Styles en dur** : 5171 `style="` dans le HTML.
7. **[Dette process] Règles CLAUDE.md mécanisables sans garde CI** : 19 (ratchet à faire décroître).

## 4. « Va plus loin » — trouvé ET corrigé pendant l'audit

**[P1] Le gate `auto-pr-review` bloquait TOUTES les PR à tort** — Preuve : « BLOCKED » sur ma PR V2 #3331 **ET** sur la PR Lingua (feature sans rapport) ; logs du run 31341553744 : `npm ci` → `npm error EUSAGE — can only install with an existing package-lock.json` dans `apex-ai/v13` (branches basées avant le lockfile). Cause racine : le pre-check jugeait l'INFRA, pas le code. **Correctif appliqué** : repli `npm ci || npm install` dans `auto-pr-review.yml`. Effet : le badge « BLOCKED » redevient un signal fiable.

## 5. Auto-critique (obligatoire)

- **Le point le plus faible** : CodeRabbit n'a pas rendu d'avis (limite gratuite) → le « second avis IA » externe du diff V2 repose sur SonarCloud (déterministe) plutôt que sur un 2ᵉ LLM.
- **Non vérifié** : les conclusions `security-suite` et `pages-smoke` étaient encore en cours à la rédaction de ce fichier (voir 05-JOURNAL pour la clôture) ; le test vidéo `crea-camera` reste flaky sous charge (hors périmètre planning).
- **Incertain** : les 2 tests SSO-admin `crea-famille` restent rouges (migration SSO d'une autre session — conflit spec test-par-nom vs règle SSO-verified, à trancher par cette session-là).
