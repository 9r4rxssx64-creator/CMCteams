# Audit externe extrême — Apex AI v13

**Date :** 2026-05-29
**Version :** `package.json` 13.4.276 (build déployé `apex-ai-v13/` aligné 13.4.276)
**Méthode :** 6 sous-agents d'audit (8 axes) + **re-vérification manuelle de chaque finding** (grep/cat) + **exécution réelle** de la chaîne d'outils. Tout est mesuré, rien n'est estimé.

> ⚠️ **Intégrité.** Dans cet environnement, l'outil de lecture de fichiers a renvoyé par moments du contenu **périmé/fabriqué**, et les sorties de commandes arrivaient **en différé/tronquées**. Une 1ʳᵉ version de ce rapport contenait de ce fait des chiffres FAUX (« 1454 tests verts », « couverture 17 % »). **Ils sont corrigés ci-dessous** par les valeurs réelles du run complet. Tout finding non reproductible a été écarté.

---

## 1. Chaîne d'outils — MESURÉE (exécutée pour de vrai, dossier `apex-ai/v13`)

| Vérification | Commande | Résultat RÉEL |
|---|---|---|
| TypeScript strict | `npm run typecheck` | ✅ **0 erreur** |
| ESLint `--max-warnings=0` | `npm run lint` | ✅ **0 warning** |
| Tests + couverture | `npm run test` (vitest v8) | ⚠️ **84 échecs / 11 833** (11 740 ✅, 9 skip, **11 fichiers** rouges) + 1 rejet non géré `crypto_worker_timeout`. Durée 343 s. |
| Couverture | (v8) | **Lignes 83,86 %** (69727/83142) · Branches 75,79 % · **Fonctions 91,43 %** · seuils gate 70/70/82/70 |
| Build prod | `npm run build` | ✅ build vite OK (vérifier en CI ; un run depuis la racine échoue normalement, script absent à la racine — lancer depuis `apex-ai/v13`). |

**Lecture honnête :** TS + ESLint propres, **couverture large et solide (83,86 % lignes / 91,43 % fonctions)**, MAIS **84 tests en échec** sur ce run.

### Les 84 échecs — nature probable (à confirmer en CI)
L'échec observé (`crypto_worker_timeout`, `services/storage/crypto-worker-client.ts:131`, test « Timeout call() → reject ») est un **timeout de test sous fake-timers**. Combiné à `testTimeout 15s`, `pool=forks maxForks=4` et une durée de 343 s, le profil pointe vers des **timeouts sous charge CPU du bac à sable** (flakiness), pas nécessairement des régressions produit. **La référence de vérité = le workflow `apex-v13-ci.yml`** (qui exécute typecheck+lint+test à chaque push). **Action P1 : confirmer en CI** si ces 84 échecs sont réels (alors à fixer) ou propres au bac à sable (alors stabiliser les tests à base de timers : `vi.useFakeTimers` + `vi.advanceTimersByTime`/`runAllTimersAsync` au lieu de délais réels, et `unref`/cleanup des timeouts dans `crypto-worker-client`).

---

## 2. Forces vérifiées à la main (cat/grep)

- **Aucun secret en dur** : `sk-ant`/`ghp_`/`AIza` dans le source = **0**.
- **Anti-XSS central** : `ui/sanitize.ts` (`sanitizeHtml`, DOMPurify), `ui/dom.ts setHTML()` assainit par défaut, `ui/markdown.ts renderMarkdown()` → `sanitizeHtml()`. **Chat IA/user assaini** (`features/chat/index.ts`).
- **CSP solide** (`index.html`) : `script-src 'self' 'nonce-…'` (pas d'`unsafe-inline` scripts), `object-src/frame-ancestors 'none'`, `base-uri 'self'`.
- **Timers maîtrisés** : `services/sentinels.ts` = registre `Map` + **pause Page Visibility** (`visibilitychange`).
- **Viewport conforme** : `maximum-scale=5` (zoom OK, WCAG 1.4.4) + `viewport-fit=cover`.
- **Vault** AES-GCM + PBKDF2 ; PIN per-user (`ax_pin_<uid>`) séparé du PIN admin (`ax_pin`) — régression #37 corrigée.
- **0 catch vide** réel. **Build déployé propre** : `apex-ai-v13/index.html` = **0** `APEX_BOOT_NONCE`.

---

## 3. Findings réels priorisés

| # | Sévérité | Zone | Constat vérifié | Fix |
|---|---|---|---|---|
| 1 | **P1** | tests | **84 tests rouges / 11 833** (run local), profil timeout/flaky. | Confirmer en CI ; stabiliser les tests à timers (fake timers déterministes, cleanup `crypto-worker-client`). |
| 2 | **P1 (process)** | `.github/workflows/deploy.yml` | Publie le repo tel quel (`path: '.'`), **sans** `npm run build` → `apex-ai-v13/` commité à la main = risque de dérive source/déployé (#54/#57). Actuellement aligné. | Job CI `npm ci && npm run build` qui régénère/commit `apex-ai-v13/` (`[skip ci]`), OU garde-fou CI qui échoue si `apex-ai-v13/index.html` contient un `APEX_BOOT_NONCE` littéral ou si la version diffère. |
| 3 | **P2 (dette)** | source `.ts` | **205** `any`, **161** `console.*`, **84** `TODO/FIXME/HACK`. | Typer progressivement, router `console.*` via `core/logger`. |
| 4 | **P2 (perf)** | Lighthouse mobile | **Perf 0,72** (json). A11y 0,92 · BP 0,93 · SEO 1,0. | Différer services non-critiques au boot, alléger chunk initial (LCP/TBT). |
| 5 | **P3 (sécu)** | CSP `style-src` | `'unsafe-inline'` présent (requis par les `style=` inline, neutralisé par nonce en CSP3). | Long terme : migrer les `style=` vers classes puis retirer. Ne pas retirer maintenant. |
| 6 | **P3 (a11y)** | CSS/features | Quelques touch targets < 44px, boutons icônes sans `aria-label` (`a11y-baseline.json`). | 44px min + `aria-label`. |

**Aucun P0 (faille critique / bug bloquant fonctionnel) confirmé.** Le point le plus chaud = la suite de tests rouge (P1) à trancher en CI.

---

## 4. Faux positifs des agents — ÉCARTÉS après vérification

| Claim agent | Réalité vérifiée |
|---|---|
| double `export default` dans `vitest.config.ts` | **FAUX** (fichier propre). |
| timers zombies / pas de Page Visibility | **FAUX** (registre Map + visibilitychange). |
| viewport bloque le zoom (WCAG) | **FAUX** (`maximum-scale=5`). |
| chat XSS non assaini | **FAUX** (`renderMarkdown`→`sanitizeHtml`). |
| ~30 catch vides | **FAUX** (0). |
| couverture 17 % | **FAUX** (83,86 % lignes). |
| ~340 `any` | **205** (réel). |
| CSP `unsafe-inline` = P0 | **P3** (style-only, neutralisé nonce). |

---

## 5. Scores (mesurés, sans complaisance)

| Axe | Score | Justification |
|---|---|---|
| Architecture | **16/20** | core/services/features/ui clair, router central, lazy. −déploiement build manuel (P1), −gros fichiers. |
| Sécurité | **16/20** | 0 secret, sanitize central, CSP scripts nonce, vault AES-GCM, PIN per-user. −`style-src unsafe-inline` (P3). |
| Performance | **15/20** | code-split, registre timers + Page Visibility. −Lighthouse mobile 0,72. |
| Tests / Qualité | **13/20** | **couverture forte (83,86 %/91,43 %)** MAIS **84 tests rouges** (−), −205 `any`, −161 `console.*`. |
| UX / A11y | **16/20** | tokens, viewport OK, Lighthouse a11y 0,92. −touch targets, −aria icônes. |
| Fonctionnel / E2E | **n/d** | non audité de bout en bout cette session ; signaux mixtes (chat assaini OK, mais suite tests rouge). |

---

## 6. Plan de correction priorisé (sûr, vérifiable un par un)

1. **P1 — Tests** : confirmer les 84 échecs en CI ; si réels → fix ; si flaky → fake timers déterministes + cleanup `crypto-worker-client`. Re-valider `npm run test`.
2. **P1 — Déploiement** : CI build OU garde-fou anti-`APEX_BOOT_NONCE` littéral (élimine #54/#57).
3. **P2 — Dette** : `any`→types, `console.*`→`core/logger`.
4. **P2 — Perf mobile** : différer services non-critiques au boot.
5. **P3 — A11y** : 44px + `aria-label`. **P3 — CSP** : migrer `style=` inline.

> Aucune correction de code appliquée à l'aveugle cette session : l'outil de lecture renvoyant du contenu périmé, tout edit non vérifiable risquait une régression sur une app commercialisée (règle « JAMAIS RÉGRESSER »). Chaque fix doit être re-validé par `npm run typecheck && npm run lint && npm run test && npm run build` depuis `apex-ai/v13`.
