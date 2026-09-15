# 🧾 Déploiements ratés — la cause exacte, écrite ici

> Ce fichier est rempli **automatiquement** par `.github/workflows/journal-deploiements.yml`
> **uniquement quand une mise en ligne échoue**. Il existe parce que l'assistant ne peut pas
> lire les journaux de la CI : le connecteur GitHub Actions a été refusé par GitHub
> (2026-09-06). Le workflow lit le journal à sa place et dépose l'essentiel ici.
>
> Rien ici quand tout va bien — c'est normal, et c'est bon signe.

## ❌ Auto-merge Claude branches into main — 15/09/2026 21:48 UTC

- **Branche** : `claude/video-review-wqnqdw` · **Commit** : `92a9eae0` · **Run** : `35026665662`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35026665662
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
##[warning]PR #3806 — merge auto refusé. Cause exacte ci-dessous.
[claude/video-review-wqnqdw 22681c805] diag: pourquoi l'auto-merge de claude/video-review-wqnqdw est refusé [skip ci]
error: failed to push some refs to 'https://github.com/9r4rxssx64-creator/CMCteams'
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 15/09/2026 21:40 UTC

- **Branche** : `claude/video-review-wqnqdw` · **Commit** : `247a1f32` · **Run** : `35026225891`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35026225891
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
##[warning]PR #3806 — merge auto refusé. Cause exacte ci-dessous.
[claude/video-review-wqnqdw 6a55fb59f] diag: pourquoi l'auto-merge de claude/video-review-wqnqdw est refusé [skip ci]
error: failed to push some refs to 'https://github.com/9r4rxssx64-creator/CMCteams'
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 15/09/2026 19:28 UTC

- **Branche** : `claude/suivi-domaine-suite` · **Commit** : `50a47337` · **Run** : `35012376556`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35012376556
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
##[warning]PR #3795 — merge auto refusé. Cause exacte ci-dessous.
[claude/suivi-domaine-suite 4a3c55547] diag: pourquoi l'auto-merge de claude/suivi-domaine-suite est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 15/09/2026 19:25 UTC

- **Branche** : `claude/security-review-4j3mct` · **Commit** : `6ad7b582` · **Run** : `35013165489`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35013165489
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

## ❌ Auto-merge Claude branches into main — 15/09/2026 19:24 UTC

- **Branche** : `claude/security-review-4j3mct` · **Commit** : `4ee4daa9` · **Run** : `35013095722`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35013095722
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

## ❌ Auto-merge Claude branches into main — 15/09/2026 19:21 UTC

- **Branche** : `claude/suivi-domaine-suite` · **Commit** : `a5a49811` · **Run** : `35012323535`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35012323535
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
##[warning]PR #3795 — merge auto refusé. Cause exacte ci-dessous.
[claude/suivi-domaine-suite 7433ac8bb] diag: pourquoi l'auto-merge de claude/suivi-domaine-suite est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 15/09/2026 19:01 UTC

- **Branche** : `claude/suivi-domaine-suite` · **Commit** : `3d66a496` · **Run** : `35010289085`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35010289085
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
##[warning]PR #3795 — merge auto refusé. Cause exacte ci-dessous.
[claude/suivi-domaine-suite 1463f88a7] diag: pourquoi l'auto-merge de claude/suivi-domaine-suite est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 15/09/2026 18:55 UTC

- **Branche** : `claude/security-review-4j3mct` · **Commit** : `2349c285` · **Run** : `35010053679`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35010053679
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

## ❌ Auto-merge Claude branches into main — 15/09/2026 18:53 UTC

- **Branche** : `claude/security-review-4j3mct` · **Commit** : `e4ab59d4` · **Run** : `35008885433`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35008885433
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

## ❌ Auto-merge Claude branches into main — 15/09/2026 17:57 UTC

- **Branche** : `claude/security-review-4j3mct` · **Commit** : `fc9f6c93` · **Run** : `35004290011`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35004290011
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

## ❌ Auto-merge Claude branches into main — 11/09/2026 21:28 UTC

- **Branche** : `claude/sarzance-family-tree-3jxi7i` · **Commit** : `bc430702` · **Run** : `34648451359`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34648451359
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
[claude/sarzance-family-tree-3jxi7i 8950cec35] diag: pourquoi l'auto-merge de claude/sarzance-family-tree-3jxi7i est refusé [skip ci]
##[error]Process completed with exit code 1.
```

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
