# 🧾 Déploiements ratés — la cause exacte, écrite ici

> Ce fichier est rempli **automatiquement** par `.github/workflows/journal-deploiements.yml`
> **uniquement quand une mise en ligne échoue**. Il existe parce que l'assistant ne peut pas
> lire les journaux de la CI : le connecteur GitHub Actions a été refusé par GitHub
> (2026-09-06). Le workflow lit le journal à sa place et dépose l'essentiel ici.
>
> Rien ici quand tout va bien — c'est normal, et c'est bon signe.

## ❌ Auto-merge Claude branches into main — 19/09/2026 16:25 UTC

- **Branche** : `claude/verify-cmcteams-light-data-rzlvau` · **Commit** : `c2fbdab1` · **Run** : `35454721961`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35454721961
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
pull request create failed: GraphQL: Head sha can't be blank, Base sha can't be blank, No commits between main and claude/verify-cmcteams-light-data-rzlvau, Head ref must be a branch (createPullRequest)
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 19/09/2026 16:10 UTC

- **Branche** : `claude/verify-cmcteams-light-data-rzlvau` · **Commit** : `f2982971` · **Run** : `35453945593`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35453945593
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
pull request create failed: GraphQL: Head sha can't be blank, Base sha can't be blank, No commits between main and claude/verify-cmcteams-light-data-rzlvau, Head ref must be a branch (createPullRequest)
##[error]Process completed with exit code 1.
```

## ❌ KDMC — Déploie le routeur de domaine kd-mc.com (autonome) — 19/09/2026 14:24 UTC

- **Branche** : `claude/verify-cmcteams-light-data-rzlvau` · **Commit** : `f0a8d662` · **Run** : `35448582758`
- **Ce qui a lâché** : deploy › Le domaine sert-il vraiment les 31 adresses ? (bloquant)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35448582758
- **Ce que la machine a dit** :

```
=== 32 servies / 0 en échec ===
##[error]Process completed with exit code 1.
```

## ❌ KDMC — Publie le site sur Cloudflare Pages (pour que le dépôt puisse être PRIVÉ) — 19/09/2026 14:24 UTC

- **Branche** : `claude/verify-cmcteams-light-data-rzlvau` · **Commit** : `f0a8d662` · **Run** : `35448582768`
- **Ce qui a lâché** : publier › Vérifier l'adresse STABLE (celle qu'attend le routeur)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35448582768
- **Ce que la machine a dit** :

```
^[[36;1m  echo "::error::l'adresse STABLE $STABLE ne répond pas (HTTP $code) — NE PAS basculer le routeur dessus"^[[0m
^[[36;1m  echo "::error::l'adresse stable $STABLE ne sert pas toutes les adresses — bascule interdite"^[[0m
^[[36;1m  head -25 sonde-stable.log | while IFS= read -r l; do echo "::error::$l"; done^[[0m
=== 32 servies / 0 en échec ===
##[error]l'adresse stable https://kdmc-site-bj5.pages.dev ne sert pas toutes les adresses — bascule interdite
##[error]Sonde de 32 adresses sur https://kdmc-site-bj5.pages.dev (servi à la racine)
##[error]adresse                        HTTP   contenu
##[error]────────────────────────────────────────────────
##[error]✅ kd-mc.com                    200    23432 car.
##[error]✅ www.kd-mc.com                200    23432 car.
##[error]✅ cmcteams.kd-mc.com           200  3382632 car.
##[error]✅ apex-ai.kd-mc.com            200    23571 car.
##[error]✅ apex-chat.kd-mc.com          200   855110 car.
##[error]✅ la-detente.kd-mc.com         200     5786 car.
##[error]✅ chez-lolo.kd-mc.com          200   109823 car.
##[error]✅ dashboard.kd-mc.com          200    41865 car.
##[error]✅ sourcing.kd-mc.com           200    12559 car.
##[error]✅ coffre.kd-mc.com             200    53666 car.
##[error]✅ departs.kd-mc.com            200   174389 car.
##[error]✅ cmcteams-light.kd-mc.com     200   174389 car.
##[error]✅ bot.kd-mc.com                200    32155 car.
##[error]✅ beatbot.kd-mc.com            200   156883 car.
##[error]✅ autorisations.kd-mc.com      200    40283 car.
##[error]✅ arbre.kd-mc.com              200   315106 car.
##[error]✅ lingua.kd-mc.com             200    70275 car.
##[error]✅ studio.kd-mc.com             200   419944 car.
##[error]✅ cuisine.kd-mc.com            200   310280 car.
##[error]✅ cocina.kd-mc.com             200   310280 car.
##[error]✅ cujina.kd-mc.com             200   310280 car.
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 19/09/2026 02:15 UTC

- **Branche** : `claude/verify-cmcteams-light-data-rzlvau` · **Commit** : `95d153ca` · **Run** : `35414890314`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35414890314
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

## ❌ KDMC — Déploie le routeur de domaine kd-mc.com (autonome) — 19/09/2026 01:57 UTC

- **Branche** : `claude/verify-cmcteams-light-data-rzlvau` · **Commit** : `2c79008a` · **Run** : `35414149149`
- **Ce qui a lâché** : deploy › D'où viennent vraiment les pages ? (bloquant)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35414149149
- **Ce que la machine a dit** :

```
^[[36;1m  echo "::error::le domaine sert encore package.json → les pages viennent TOUJOURS du dépôt brut, pas de $ATTENDU. Bascule NON effective."^[[0m
##[error]le domaine sert encore package.json → les pages viennent TOUJOURS du dépôt brut, pas de https://kdmc-site-bj5.pages.dev. Bascule NON effective.
##[error]Process completed with exit code 1.
```

## ❌ KDMC — Déploie le routeur de domaine kd-mc.com (autonome) — 19/09/2026 01:55 UTC

- **Branche** : `claude/verify-cmcteams-light-data-rzlvau` · **Commit** : `b9d29fa9` · **Run** : `35414037774`
- **Ce qui a lâché** : deploy › D'où viennent vraiment les pages ? (bloquant)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35414037774
- **Ce que la machine a dit** :

```
^[[36;1m  echo "::error::le domaine sert encore package.json → les pages viennent TOUJOURS du dépôt brut, pas de $ATTENDU. Bascule NON effective."^[[0m
##[error]le domaine sert encore package.json → les pages viennent TOUJOURS du dépôt brut, pas de https://kdmc-site-bj5.pages.dev. Bascule NON effective.
##[error]Process completed with exit code 1.
```

## ❌ KDMC — Déploie le routeur de domaine kd-mc.com (autonome) — 19/09/2026 01:52 UTC

- **Branche** : `claude/verify-cmcteams-light-data-rzlvau` · **Commit** : `f470c432` · **Run** : `35413919081`
- **Ce qui a lâché** : deploy › D'où viennent vraiment les pages ? (bloquant)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35413919081
- **Ce que la machine a dit** :

```
^[[36;1m  echo "::error::le domaine sert encore package.json → les pages viennent TOUJOURS du dépôt brut, pas de $ATTENDU. Bascule NON effective."^[[0m
##[error]le domaine sert encore package.json → les pages viennent TOUJOURS du dépôt brut, pas de https://kdmc-site-bj5.pages.dev. Bascule NON effective.
##[error]Process completed with exit code 1.
```

## ❌ KDMC — Déploie le routeur de domaine kd-mc.com (autonome) — 19/09/2026 01:49 UTC

- **Branche** : `claude/verify-cmcteams-light-data-rzlvau` · **Commit** : `554ff1c1` · **Run** : `35413750989`
- **Ce qui a lâché** : deploy › D'où viennent vraiment les pages ? (bloquant)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35413750989
- **Ce que la machine a dit** :

```
^[[36;1m  echo "::error::le domaine sert encore package.json → les pages viennent TOUJOURS du dépôt brut, pas de $ATTENDU. Bascule NON effective."^[[0m
##[error]le domaine sert encore package.json → les pages viennent TOUJOURS du dépôt brut, pas de https://kdmc-site-bj5.pages.dev. Bascule NON effective.
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 18/09/2026 21:00 UTC

- **Branche** : `claude/suivi-domaine-suite` · **Commit** : `c17fd06b` · **Run** : `35393318295`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35393318295
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
##[warning]PR #3917 — merge auto refusé. Cause exacte ci-dessous.
GraphQL: refusing to allow a GitHub App to create or update workflow `.github/workflows/publier-site-prive.yml` without `workflows` permission (mergePullRequest)
[claude/suivi-domaine-suite 09172dde4] diag: pourquoi l'auto-merge de claude/suivi-domaine-suite est refusé [skip ci]
 ! [remote rejected]     HEAD -> claude/suivi-domaine-suite (refusing to allow a GitHub App to create or update workflow `.github/workflows/publier-site-prive.yml` without `workflows` permission)
error: failed to push some refs to 'https://github.com/9r4rxssx64-creator/CMCteams'
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 18/09/2026 20:53 UTC

- **Branche** : `claude/suivi-domaine-suite` · **Commit** : `d7a760b3` · **Run** : `35393219931`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35393219931
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
##[warning]PR #3917 — merge auto refusé. Cause exacte ci-dessous.
GraphQL: refusing to allow a GitHub App to create or update workflow `.github/workflows/publier-site-prive.yml` without `workflows` permission (mergePullRequest)
[claude/suivi-domaine-suite e40eb0e6f] diag: pourquoi l'auto-merge de claude/suivi-domaine-suite est refusé [skip ci]
error: failed to push some refs to 'https://github.com/9r4rxssx64-creator/CMCteams'
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 18/09/2026 19:37 UTC

- **Branche** : `claude/suivi-domaine-suite` · **Commit** : `bb509e89` · **Run** : `35385639515`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35385639515
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
##[warning]PR #3917 — merge auto refusé. Cause exacte ci-dessous.
GraphQL: refusing to allow a GitHub App to create or update workflow `.github/workflows/publier-site-prive.yml` without `workflows` permission (mergePullRequest)
[claude/suivi-domaine-suite 7979e9b2a] diag: pourquoi l'auto-merge de claude/suivi-domaine-suite est refusé [skip ci]
 ! [remote rejected]     HEAD -> claude/suivi-domaine-suite (refusing to allow a GitHub App to create or update workflow `.github/workflows/publier-site-prive.yml` without `workflows` permission)
error: failed to push some refs to 'https://github.com/9r4rxssx64-creator/CMCteams'
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 18/09/2026 19:30 UTC

- **Branche** : `claude/suivi-domaine-suite` · **Commit** : `4b29267d` · **Run** : `35385553650`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35385553650
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
##[warning]PR #3917 — merge auto refusé. Cause exacte ci-dessous.
GraphQL: refusing to allow a GitHub App to create or update workflow `.github/workflows/publier-site-prive.yml` without `workflows` permission (mergePullRequest)
[claude/suivi-domaine-suite 932f8cb2e] diag: pourquoi l'auto-merge de claude/suivi-domaine-suite est refusé [skip ci]
error: failed to push some refs to 'https://github.com/9r4rxssx64-creator/CMCteams'
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 18/09/2026 14:36 UTC

- **Branche** : `claude/video-review-wqnqdw` · **Commit** : `723a8f7b` · **Run** : `35356910724`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35356910724
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
pull request create failed: GraphQL: Head sha can't be blank, Base sha can't be blank, No commits between main and claude/video-review-wqnqdw, Head ref must be a branch (createPullRequest)
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 18/09/2026 13:56 UTC

- **Branche** : `claude/verify-cmcteams-light-data-rzlvau` · **Commit** : `f79701f6` · **Run** : `35352550588`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35352550588
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
pull request create failed: GraphQL: Head sha can't be blank, Base sha can't be blank, No commits between main and claude/verify-cmcteams-light-data-rzlvau, Head ref must be a branch (createPullRequest)
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 18/09/2026 01:06 UTC

- **Branche** : `claude/verify-cmcteams-light-data-rzlvau` · **Commit** : `68373cdc` · **Run** : `35293454319`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35293454319
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
##[warning]PR #3903 — merge auto refusé. Cause exacte ci-dessous.
[claude/verify-cmcteams-light-data-rzlvau c9095e82e] diag: pourquoi l'auto-merge de claude/verify-cmcteams-light-data-rzlvau est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 17/09/2026 19:09 UTC

- **Branche** : `claude/video-review-wqnqdw` · **Commit** : `07c8d023` · **Run** : `35261990263`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35261990263
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
##[warning]PR #3898 — merge auto refusé. Cause exacte ci-dessous.
[claude/video-review-wqnqdw de175e992] diag: pourquoi l'auto-merge de claude/video-review-wqnqdw est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 17/09/2026 18:31 UTC

- **Branche** : `claude/audit-apex-chat-commercial-1709` · **Commit** : `3745d17e` · **Run** : `35258314096`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35258314096
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

## ❌ Auto-merge Claude branches into main — 17/09/2026 18:13 UTC

- **Branche** : `claude/audit-apex-chat-commercial-1709` · **Commit** : `14ef3cb5` · **Run** : `35256809139`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35256809139
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

## ❌ Auto-merge Claude branches into main — 17/09/2026 18:06 UTC

- **Branche** : `claude/work-summary-ai-alternatives-cj6s29` · **Commit** : `2a0e8b66` · **Run** : `35255911215`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35255911215
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

## ❌ Auto-merge Claude branches into main — 17/09/2026 17:50 UTC

- **Branche** : `claude/pub-auto-2026-38` · **Commit** : `714443b9` · **Run** : `35254591113`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35254591113
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

## ❌ Auto-merge Claude branches into main — 17/09/2026 17:49 UTC

- **Branche** : `claude/video-review-wqnqdw` · **Commit** : `47487203` · **Run** : `35254556170`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35254556170
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

## ❌ Auto-merge Claude branches into main — 17/09/2026 16:18 UTC

- **Branche** : `claude/video-review-wqnqdw` · **Commit** : `859ad3bc` · **Run** : `35244481440`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35244481440
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
##[warning]PR #3883 — merge auto refusé. Cause exacte ci-dessous.
[claude/video-review-wqnqdw e08637a29] diag: pourquoi l'auto-merge de claude/video-review-wqnqdw est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 17/09/2026 16:11 UTC

- **Branche** : `claude/video-review-wqnqdw` · **Commit** : `67e967c2` · **Run** : `35244247728`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35244247728
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
##[warning]PR #3883 — merge auto refusé. Cause exacte ci-dessous.
[claude/video-review-wqnqdw eaab5f3a3] diag: pourquoi l'auto-merge de claude/video-review-wqnqdw est refusé [skip ci]
error: failed to push some refs to 'https://github.com/9r4rxssx64-creator/CMCteams'
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 17/09/2026 16:09 UTC

- **Branche** : `claude/persona-personnage-javis-hqd55e` · **Commit** : `8402dc77` · **Run** : `35243585180`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35243585180
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```
