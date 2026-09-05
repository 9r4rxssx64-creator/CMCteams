# 02 — RÉSULTATS (attendu / obtenu / statut, sorties réelles)

| Contrôle | Attendu | Obtenu | Statut |
|---|---|---|---|
| Couverture routeur ⇄ sonde | 26/26 | `tests/uptime-couverture.test.mjs` : 6 OK / 0 FAIL ; sabotages : route commentée → vert, `Object.assign(ROUTES…)` → rouge | ✅ |
| Déploiement kdmc-uptime | vert + worker modifié | run 33979141313 **success 42 s** ; Cloudflare `modified_on` 16:51:43 ; annotations `Uploaded`, `Deployed`, `Current Version ID: 01950403…` | ✅ |
| Premier relevé réel (32 cibles) | tout vert | **26/32 OK** — 6 en panne : apex-secrets-proxy, kdmc-ais, kdmc-live, kdmc-rag, apex-v13-backend, apex-auth-worker (tous des workers) | 🟡 cause par cible lue au prochain smoke (annotations ajoutées) |
| Cron de la sonde | posé | `Workers Free limit of 5 cron triggers per account` (run 33978540250) → `crons = []`, réveil par kdmc-outlook (Service Binding) | ✅ contourné |
| Déploiement kdmc-rag | vert | run 33979141283 : `Authentication error [code: 10000]` sur `/vectorize/v2/indexes` → **droit Vectorize absent du jeton** | 🔴 action Kevin (1 clic) |
| PR #3652 | fusionnée | `main` 5c8a300 ; bloquée avant par `main` lui-même (7 × TS1117 dans `apex-plugins-catalog.ts`, réparé dans la PR) | ✅ |
| tsc `apex-ai/v13` | 0 erreur | `npx tsc --noEmit` → exit 0 | ✅ |
| `audit:improvements` (ratchet) | 0 hausse | 0 hausse ; `views_untested` 41 → 40 | ✅ |
| `audit:stability` | 0 FAIL | 0 FAIL 0 WARN (render 0, mutations topbar 24/12/0 sur 6 s) | ✅ |
| Gardes CI sur la branche | verts | pipefail, actions-conformes, destinations, no-pin-leak, depot-public-sain, secret-jamais-persiste, pipeline-sessions, docs-frais, no-conflicts | ✅ |
| Outlook `worker.test.mjs` | 6/6 | 6 pass / 0 fail | ✅ |
| SonarCloud PR #3652 | A | **C** : wrangler non épinglé + scripts d'installation → `wrangler@4 --ignore-scripts` | ✅ corrigé (à re-mesurer par Sonar) |
| Semgrep PR #3652 | 0 | « vulnerable patterns found » — détail illisible depuis la session | 🔴 non trié |
| audit-live (vrai navigateur) | 0 bloquant sur 28 surfaces | déclenché par le push 4c4a469 — résultat dans `05-JOURNAL.md` | ⏳ |
