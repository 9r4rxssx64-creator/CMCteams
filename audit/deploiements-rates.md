# 🧾 Déploiements ratés — la cause exacte, écrite ici

> Ce fichier est rempli **automatiquement** par `.github/workflows/journal-deploiements.yml`
> **uniquement quand une mise en ligne échoue**. Il existe parce que l'assistant ne peut pas
> lire les journaux de la CI : le connecteur GitHub Actions a été refusé par GitHub
> (2026-09-06). Le workflow lit le journal à sa place et dépose l'essentiel ici.
>
> Rien ici quand tout va bien — c'est normal, et c'est bon signe.

## ❌ Auto-merge Claude branches into main — 10/09/2026 19:28 UTC

- **Branche** : `claude/menage-verif-suppression` · **Commit** : `a143a6c7` · **Run** : `34519686249`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34519686249
- **Ce que la machine a dit** :

```
^[[36;1m  echo "::notice::Branche $BRANCH introuvable sur origin — rien à merger."^[[0m
^[[36;1m# AVANT sa vraie revue → merge trop tôt → CodeRabbit : « Review failed — PR^[[0m
^[[36;1m# buffer pour les commentaires ligne par ligne. Cap ~6 min, fail-open (on merge^[[0m
^[[36;1m# v2026-09-06 (leçon #214 « un échec invisible n'existe pas ») : les deux^[[0m
^[[36;1m# tentatives étaient suivies de `2>/dev/null` — la VRAIE cause du refus^[[0m
^[[36;1m  echo "::warning::PR #$PR — merge auto refusé. Cause exacte ci-dessous."^[[0m
^[[36;1m    echo "Ce fichier existe parce que le merge automatique a été REFUSÉ."^[[0m
^[[36;1m      commit -m "diag: pourquoi l'auto-merge de $BRANCH est refusé [skip ci]" || true^[[0m
##[warning]PR #3749 — merge auto refusé. Cause exacte ci-dessous.
[claude/menage-verif-suppression 8cf5dd26a] diag: pourquoi l'auto-merge de claude/menage-verif-suppression est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 19:26 UTC

- **Branche** : `claude/verify-cmcteams-light-data-rzlvau` · **Commit** : `4e940856` · **Run** : `34519272141`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34519272141
- **Ce que la machine a dit** :

```
^[[36;1m  echo "::notice::Branche $BRANCH introuvable sur origin — rien à merger."^[[0m
^[[36;1m# AVANT sa vraie revue → merge trop tôt → CodeRabbit : « Review failed — PR^[[0m
^[[36;1m# buffer pour les commentaires ligne par ligne. Cap ~6 min, fail-open (on merge^[[0m
^[[36;1m# v2026-09-06 (leçon #214 « un échec invisible n'existe pas ») : les deux^[[0m
^[[36;1m# tentatives étaient suivies de `2>/dev/null` — la VRAIE cause du refus^[[0m
^[[36;1m  echo "::warning::PR #$PR — merge auto refusé. Cause exacte ci-dessous."^[[0m
^[[36;1m    echo "Ce fichier existe parce que le merge automatique a été REFUSÉ."^[[0m
^[[36;1m      commit -m "diag: pourquoi l'auto-merge de $BRANCH est refusé [skip ci]" || true^[[0m
##[warning]PR #3748 — merge auto refusé. Cause exacte ci-dessous.
[claude/verify-cmcteams-light-data-rzlvau 626549097] diag: pourquoi l'auto-merge de claude/verify-cmcteams-light-data-rzlvau est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 19:26 UTC

- **Branche** : `claude/sarzance-family-tree-3jxi7i` · **Commit** : `0fa0fd4a` · **Run** : `34519029799`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34519029799
- **Ce que la machine a dit** :

```
^[[36;1m  echo "::notice::Branche $BRANCH introuvable sur origin — rien à merger."^[[0m
^[[36;1m# AVANT sa vraie revue → merge trop tôt → CodeRabbit : « Review failed — PR^[[0m
^[[36;1m# buffer pour les commentaires ligne par ligne. Cap ~6 min, fail-open (on merge^[[0m
^[[36;1m# v2026-09-06 (leçon #214 « un échec invisible n'existe pas ») : les deux^[[0m
^[[36;1m# tentatives étaient suivies de `2>/dev/null` — la VRAIE cause du refus^[[0m
^[[36;1m  echo "::warning::PR #$PR — merge auto refusé. Cause exacte ci-dessous."^[[0m
^[[36;1m    echo "Ce fichier existe parce que le merge automatique a été REFUSÉ."^[[0m
^[[36;1m      commit -m "diag: pourquoi l'auto-merge de $BRANCH est refusé [skip ci]" || true^[[0m
##[warning]PR #3730 — merge auto refusé. Cause exacte ci-dessous.
[claude/sarzance-family-tree-3jxi7i 33746b94c] diag: pourquoi l'auto-merge de claude/sarzance-family-tree-3jxi7i est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 19:26 UTC

- **Branche** : `claude/capcut-mini-versions-66tfum` · **Commit** : `b8573088` · **Run** : `34519523518`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34519523518
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 19:16 UTC

- **Branche** : `claude/apex-chat-mfa-faceid` · **Commit** : `ceaa133e` · **Run** : `34518401209`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34518401209
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 19:15 UTC

- **Branche** : `claude/verify-cmcteams-light-data-rzlvau` · **Commit** : `e981254d` · **Run** : `34518009777`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34518009777
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 19:11 UTC

- **Branche** : `claude/apex-chat-mfa-faceid` · **Commit** : `fc11cbd8` · **Run** : `34518006898`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34518006898
- **Ce que la machine a dit** :

```
^[[36;1m  echo "::notice::Branche $BRANCH introuvable sur origin — rien à merger."^[[0m
^[[36;1m# AVANT sa vraie revue → merge trop tôt → CodeRabbit : « Review failed — PR^[[0m
^[[36;1m# buffer pour les commentaires ligne par ligne. Cap ~6 min, fail-open (on merge^[[0m
^[[36;1m# v2026-09-06 (leçon #214 « un échec invisible n'existe pas ») : les deux^[[0m
^[[36;1m# tentatives étaient suivies de `2>/dev/null` — la VRAIE cause du refus^[[0m
^[[36;1m  echo "::warning::PR #$PR — merge auto refusé. Cause exacte ci-dessous."^[[0m
^[[36;1m    echo "Ce fichier existe parce que le merge automatique a été REFUSÉ."^[[0m
^[[36;1m      commit -m "diag: pourquoi l'auto-merge de $BRANCH est refusé [skip ci]" || true^[[0m
##[warning]PR #3744 — merge auto refusé. Cause exacte ci-dessous.
[claude/apex-chat-mfa-faceid feff167fa] diag: pourquoi l'auto-merge de claude/apex-chat-mfa-faceid est refusé [skip ci]
 ! [remote rejected]     HEAD -> claude/apex-chat-mfa-faceid (refusing to allow a GitHub App to create or update workflow `.github/workflows/ai-review-independent.yml` without `workflows` permission)
error: failed to push some refs to 'https://github.com/9r4rxssx64-creator/CMCteams'
##[error]Process completed with exit code 1.
```

## ❌ La Détente — Déploie le Worker de commande Printify — 10/09/2026 18:39 UTC

- **Branche** : `claude/verify-cmcteams-light-data-rzlvau` · **Commit** : `033ace14` · **Run** : `34515315632`
- **Ce qui a lâché** : deploy › Déploiement + secrets + capture URL
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34515315632
- **Ce que la machine a dit** :

```
^[[36;1mif [ -z "$URL" ]; then echo "::error::URL worker introuvable"; exit 1; fi^[[0m
  Please update to the latest version to prevent critical errors.
^[[31m✘ ^[[41;31m[^[[41;97mERROR^[[41;31m]^[[0m ^[[1mBuild failed with 1 error:^[[0m
  ^[[31m✘ ^[[41;31m[^[[41;97mERROR^[[41;31m]^[[0m ^[[1mExpected string in JSON but found "<<"^[[0m
##[error]Process completed with exit code 1.
```

## ❌ La Détente — Déploie le Worker Gemini (autonome) — 10/09/2026 18:37 UTC

- **Branche** : `claude/verify-cmcteams-light-data-rzlvau` · **Commit** : `033ace14` · **Run** : `34515315340`
- **Ce qui a lâché** : deploy › Déploiement + secret + capture URL
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34515315340
- **Ce que la machine a dit** :

```
^[[36;1mif [ -z "$URL" ]; then echo "::error::URL worker introuvable dans le log"; exit 1; fi^[[0m
  Please update to the latest version to prevent critical errors.
^[[31m✘ ^[[41;31m[^[[41;97mERROR^[[41;31m]^[[0m ^[[1mBuild failed with 1 error:^[[0m
  ^[[31m✘ ^[[41;31m[^[[41;97mERROR^[[41;31m]^[[0m ^[[1mExpected string in JSON but found "<<"^[[0m
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 18:27 UTC

- **Branche** : `claude/verify-cmcteams-light-data-rzlvau` · **Commit** : `a32595d6` · **Run** : `34513596186`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34513596186
- **Ce que la machine a dit** :

```
^[[36;1m  echo "::notice::Branche $BRANCH introuvable sur origin — rien à merger."^[[0m
^[[36;1m# AVANT sa vraie revue → merge trop tôt → CodeRabbit : « Review failed — PR^[[0m
^[[36;1m# buffer pour les commentaires ligne par ligne. Cap ~6 min, fail-open (on merge^[[0m
^[[36;1m# v2026-09-06 (leçon #214 « un échec invisible n'existe pas ») : les deux^[[0m
^[[36;1m# tentatives étaient suivies de `2>/dev/null` — la VRAIE cause du refus^[[0m
^[[36;1m  echo "::warning::PR #$PR — merge auto refusé. Cause exacte ci-dessous."^[[0m
^[[36;1m    echo "Ce fichier existe parce que le merge automatique a été REFUSÉ."^[[0m
^[[36;1m      commit -m "diag: pourquoi l'auto-merge de $BRANCH est refusé [skip ci]" || true^[[0m
##[warning]PR #3731 — merge auto refusé. Cause exacte ci-dessous.
[claude/verify-cmcteams-light-data-rzlvau 6d6d1c764] diag: pourquoi l'auto-merge de claude/verify-cmcteams-light-data-rzlvau est refusé [skip ci]
error: failed to push some refs to 'https://github.com/9r4rxssx64-creator/CMCteams'
##[error]Process completed with exit code 1.
```

## ❌ Deploy KDMC RAG (mémoire Apex) — 10/09/2026 10:15 UTC

- **Branche** : `claude/verify-cmcteams-light-data-rzlvau` · **Commit** : `46c43dfc` · **Run** : `34465020679`
- **Ce qui a lâché** : deploy › Créer l'index Vectorize (idempotent) — et DIRE s'il n'existe pas
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34465020679
- **Ce que la machine a dit** :

```
^[[36;1m# not found [code 10159] » parce que cette création échouait EN SILENCE (|| true, journal^[[0m
^[[36;1m  { grep -iE 'error|✘|failed|code|permission|authoriz|plan' /tmp/vec.log || true; } | tail -10 | while IFS= read -r L; do echo "::error::vectorize create ▸ $L"; done^[[0m
^[[36;1m  tail -8 /tmp/vecget.log | while IFS= read -r L; do echo "::error::vectorize get ▸ $L"; done^[[0m
^[[36;1m  echo "::error::L'index Vectorize apex-memory N'EXISTE PAS sur le compte et n'a pas pu être créé (voir lignes ci-dessus : droit manquant du jeton CLOUDFLARE_API_TOKEN sur Vectorize, ou plan). Le worker kdmc-rag a un binding VEC dessus → wrangler deploy refusera (code 10159). Rien n'est déployé."^[[0m
^[[31m✘ ^[[41;31m[^[[41;97mERROR^[[41;31m]^[[0m ^[[1mA request to the Cloudflare API (/accounts/<id>/vectorize/v2/indexes) failed.^[[0m
  Authentication error [code: 10000]
  To learn more about this error, visit: ^[[4mhttps://developers.cloudflare.com/api/resources/vectorize/subresources/indexes/methods/create^[[0m
##[error]vectorize create ▸ ^[[31m✘ ^[[41;31m[^[[41;97mERROR^[[41;31m]^[[0m ^[[1mA request to the Cloudflare API (/accounts/<id>/vectorize/v2/indexes) failed.^[[0m
##[error]vectorize create ▸   Authentication error [code: 10000]
##[error]vectorize create ▸   To learn more about this error, visit: ^[[4mhttps://developers.cloudflare.com/api/resources/vectorize/subresources/indexes/methods/create^[[0m
##[error]vectorize create ▸ Please ensure it has the correct permissions for this operation.
##[error]vectorize create ▸ 🔓 To see token permissions visit https://dash.cloudflare.com/profile/api-tokens
##[error]vectorize create ▸ 🎢 Membership roles in "9r4rxssx64@privaterelay.appleid.com's Account": Contact account super admin to change your permissions.
##[error]vectorize get ▸ │ Account Name                                  │ Account ID                       │
##[error]vectorize get ▸ ├───────────────────────────────────────────────┼──────────────────────────────────┤
##[error]vectorize get ▸ │ 9r4rxssx64@privaterelay.appleid.com's Account │ *** │
##[error]vectorize get ▸ └───────────────────────────────────────────────┴──────────────────────────────────┘
##[error]vectorize get ▸ 🔓 To see token permissions visit https://dash.cloudflare.com/profile/api-tokens
##[error]vectorize get ▸ 🎢 Membership roles in "9r4rxssx64@privaterelay.appleid.com's Account": Contact account super admin to change your permissions.
##[error]vectorize get ▸ - Super Administrator - All Privileges
##[error]vectorize get ▸ 🪵  Logs were written to "/home/runner/.config/.wrangler/logs/wrangler-2026-09-10_10-15-21_288.log"
##[error]L'index Vectorize apex-memory N'EXISTE PAS sur le compte et n'a pas pu être créé (voir lignes ci-dessus : droit manquant du jeton CLOUDFLARE_API_TOKEN sur Vectorize, ou plan). Le worker kdmc-rag a un binding VEC dessus → wrangler deploy refusera (code 10159). Rien n'est déployé.
##[error]Process completed with exit code 1.
```
