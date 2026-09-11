# 🧾 Déploiements ratés — la cause exacte, écrite ici

> Ce fichier est rempli **automatiquement** par `.github/workflows/journal-deploiements.yml`
> **uniquement quand une mise en ligne échoue**. Il existe parce que l'assistant ne peut pas
> lire les journaux de la CI : le connecteur GitHub Actions a été refusé par GitHub
> (2026-09-06). Le workflow lit le journal à sa place et dépose l'essentiel ici.
>
> Rien ici quand tout va bien — c'est normal, et c'est bon signe.

## ❌ Auto-merge Claude branches into main — 11/09/2026 21:21 UTC

- **Branche** : `claude/sarzance-family-tree-3jxi7i` · **Commit** : `4fc658c8` · **Run** : `34648349830`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34648349830
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
[claude/sarzance-family-tree-3jxi7i 4ad59d0e6] diag: pourquoi l'auto-merge de claude/sarzance-family-tree-3jxi7i est refusé [skip ci]
error: failed to push some refs to 'https://github.com/9r4rxssx64-creator/CMCteams'
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 11/09/2026 11:33 UTC

- **Branche** : `claude/apex-chat-suite-2210` · **Commit** : `af3aaa78` · **Run** : `34594043469`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34594043469
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
pull request create failed: GraphQL: Head sha can't be blank, Base sha can't be blank, No commits between main and claude/apex-chat-suite-2210, Head ref must be a branch (createPullRequest)
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 11/09/2026 10:21 UTC

- **Branche** : `claude/apex-chat-suite-2210` · **Commit** : `39b2d744` · **Run** : `34588152576`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34588152576
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
##[warning]PR #3767 — merge auto refusé. Cause exacte ci-dessous.
[claude/apex-chat-suite-2210 632d03018] diag: pourquoi l'auto-merge de claude/apex-chat-suite-2210 est refusé [skip ci]
error: failed to push some refs to 'https://github.com/9r4rxssx64-creator/CMCteams'
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 22:22 UTC

- **Branche** : `claude/verify-cmcteams-light-data-rzlvau` · **Commit** : `4491f54c` · **Run** : `34535801571`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34535801571
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
pull request create failed: GraphQL: Something went wrong while executing your query on 2026-09-10T22:15:31Z. Please include `3841:3839AF:3FF8C2:CF54E3:6AA32C02` when reporting this issue.
##[warning]PR #3765 — merge auto refusé. Cause exacte ci-dessous.
[claude/verify-cmcteams-light-data-rzlvau 2111b6405] diag: pourquoi l'auto-merge de claude/verify-cmcteams-light-data-rzlvau est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 20:45 UTC

- **Branche** : `claude/apex-chat-mfa-faceid` · **Commit** : `535f032a` · **Run** : `34527969098`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34527969098
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 20:43 UTC

- **Branche** : `claude/apex-chat-mfa-faceid` · **Commit** : `a0cc590c` · **Run** : `34527629976`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34527629976
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 20:33 UTC

- **Branche** : `claude/sarzance-family-tree-3jxi7i` · **Commit** : `5471d769` · **Run** : `34526883722`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34526883722
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 20:32 UTC

- **Branche** : `claude/apex-chat-mfa-faceid` · **Commit** : `b96dac1b` · **Run** : `34526845652`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34526845652
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 20:30 UTC

- **Branche** : `claude/sarzance-family-tree-3jxi7i` · **Commit** : `3b2a3d11` · **Run** : `34526003566`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34526003566
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
[claude/sarzance-family-tree-3jxi7i d7e4feff6] diag: pourquoi l'auto-merge de claude/sarzance-family-tree-3jxi7i est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 20:27 UTC

- **Branche** : `claude/apex-chat-mfa-faceid` · **Commit** : `dae78cb7` · **Run** : `34525737963`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34525737963
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
[claude/apex-chat-mfa-faceid 1252d87e8] diag: pourquoi l'auto-merge de claude/apex-chat-mfa-faceid est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 20:04 UTC

- **Branche** : `claude/cuisine-lire-etapes` · **Commit** : `44496bcc` · **Run** : `34522938137`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34522938137
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
##[warning]PR #3757 — merge auto refusé. Cause exacte ci-dessous.
[claude/cuisine-lire-etapes 7d601c26e] diag: pourquoi l'auto-merge de claude/cuisine-lire-etapes est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 19:57 UTC

- **Branche** : `claude/capcut-mini-versions-66tfum` · **Commit** : `d8d60b78` · **Run** : `34522051573`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34522051573
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
##[warning]PR #3754 — merge auto refusé. Cause exacte ci-dessous.
[claude/capcut-mini-versions-66tfum c301e9606] diag: pourquoi l'auto-merge de claude/capcut-mini-versions-66tfum est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 19:55 UTC

- **Branche** : `claude/sarzance-family-tree-3jxi7i` · **Commit** : `955fe815` · **Run** : `34522053827`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34522053827
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
[claude/sarzance-family-tree-3jxi7i acaef0aed] diag: pourquoi l'auto-merge de claude/sarzance-family-tree-3jxi7i est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 19:50 UTC

- **Branche** : `claude/capcut-mini-versions-66tfum` · **Commit** : `70ec50cc` · **Run** : `34521850842`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34521850842
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
##[warning]PR #3754 — merge auto refusé. Cause exacte ci-dessous.
[claude/capcut-mini-versions-66tfum 37f3f6aba] diag: pourquoi l'auto-merge de claude/capcut-mini-versions-66tfum est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 19:48 UTC

- **Branche** : `claude/sarzance-family-tree-3jxi7i` · **Commit** : `b9edbd92` · **Run** : `34521530102`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34521530102
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
[claude/sarzance-family-tree-3jxi7i 7c5344f78] diag: pourquoi l'auto-merge de claude/sarzance-family-tree-3jxi7i est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 19:35 UTC

- **Branche** : `claude/verify-cmcteams-light-data-rzlvau` · **Commit** : `6e319039` · **Run** : `34520025402`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34520025402
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
[claude/verify-cmcteams-light-data-rzlvau e2f3a2028] diag: pourquoi l'auto-merge de claude/verify-cmcteams-light-data-rzlvau est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 19:34 UTC

- **Branche** : `claude/sarzance-family-tree-3jxi7i` · **Commit** : `5f416d45` · **Run** : `34519910731`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34519910731
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
[claude/sarzance-family-tree-3jxi7i b9783fa49] diag: pourquoi l'auto-merge de claude/sarzance-family-tree-3jxi7i est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 19:30 UTC

- **Branche** : `claude/apex-chat-mfa-faceid` · **Commit** : `732bf446` · **Run** : `34520637731`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34520637731
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

## ❌ Auto-merge Claude branches into main — 10/09/2026 19:29 UTC

- **Branche** : `claude/suivi-domaine-suite` · **Commit** : `8d17bec6` · **Run** : `34520038634`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34520038634
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

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
