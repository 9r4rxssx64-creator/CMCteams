# 🧾 Déploiements ratés — la cause exacte, écrite ici

> Ce fichier est rempli **automatiquement** par `.github/workflows/journal-deploiements.yml`
> **uniquement quand une mise en ligne échoue**. Il existe parce que l'assistant ne peut pas
> lire les journaux de la CI : le connecteur GitHub Actions a été refusé par GitHub
> (2026-09-06). Le workflow lit le journal à sa place et dépose l'essentiel ici.
>
> Rien ici quand tout va bien — c'est normal, et c'est bon signe.

## ❌ Deploy KDMC Uptime (surveillance domaine) — 16/09/2026 23:25 UTC

- **Branche** : `claude/persona-personnage-javis-hqd55e` · **Commit** : `5590ce8f` · **Run** : `35162092047`
- **Ce qui a lâché** : deploy › Smoke test réel (leçon
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35162092047
- **Ce que la machine a dit** :

```
^[[36;1mgrep -q '"ok": true' /tmp/h.json || { echo "::error::/health invalide : $(cat /tmp/h.json)"; exit 1; }^[[0m
^[[36;1mecho "--- /run sans clé doit être refusé (garde) ---"^[[0m
^[[36;1m[ "$CODE" = "401" ] || { echo "::error::POST /run sans clé a répondu $CODE au lieu de 401 — /run est PUBLIC"; exit 1; }^[[0m
^[[36;1m[ "$CODE" = "405" ] || { echo "::error::GET /run a répondu $CODE au lieu de 405"; exit 1; }^[[0m
^[[36;1mgrep -q '"results"' /tmp/run.json || { echo "::error::/run invalide : $(head -c 800 /tmp/run.json)"; exit 1; }^[[0m
^[[36;1m  if(!hasToken){ console.log('::notice::push : pas de jeton → non testé (fail-open)'); process.exit(0); }^[[0m
^[[36;1m  console.log('::error::push NON envoyé : HTTP ' + p.code + ' ' + (p.why||'')); process.exit(1);^[[0m
^[[36;1mgrep -q '"ts"' /tmp/state.json || { echo "::error::/ ne rend pas l'état du passage qui vient d'avoir lieu — persistance cassée"; exit 1; }^[[0m
--- /run sans clé doit être refusé (garde) ---
    "why": "error code: 1042\n"
##[error]push NON envoyé : HTTP 404 error code: 1042
##[error]Process completed with exit code 1.
```

## ❌ Deploy KDMC Uptime (surveillance domaine) — 16/09/2026 23:23 UTC

- **Branche** : `claude/persona-personnage-javis-hqd55e` · **Commit** : `41023d67` · **Run** : `35161992763`
- **Ce qui a lâché** : deploy › Smoke test réel (leçon
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35161992763
- **Ce que la machine a dit** :

```
^[[36;1mgrep -q '"ok": true' /tmp/h.json || { echo "::error::/health invalide : $(cat /tmp/h.json)"; exit 1; }^[[0m
^[[36;1mecho "--- /run sans clé doit être refusé (garde) ---"^[[0m
^[[36;1m[ "$CODE" = "401" ] || { echo "::error::POST /run sans clé a répondu $CODE au lieu de 401 — /run est PUBLIC"; exit 1; }^[[0m
^[[36;1m[ "$CODE" = "405" ] || { echo "::error::GET /run a répondu $CODE au lieu de 405"; exit 1; }^[[0m
^[[36;1mgrep -q '"results"' /tmp/run.json || { echo "::error::/run invalide : $(head -c 800 /tmp/run.json)"; exit 1; }^[[0m
^[[36;1m  if(!hasToken){ console.log('::notice::push : pas de jeton → non testé (fail-open)'); process.exit(0); }^[[0m
^[[36;1m  console.log('::error::push NON envoyé : HTTP ' + p.code + ' ' + (p.why||'')); process.exit(1);^[[0m
^[[36;1mgrep -q '"ts"' /tmp/state.json || { echo "::error::/ ne rend pas l'état du passage qui vient d'avoir lieu — persistance cassée"; exit 1; }^[[0m
--- /run sans clé doit être refusé (garde) ---
    "why": "error code: 1042\n"
##[error]push NON envoyé : HTTP 404 error code: 1042
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 16/09/2026 22:25 UTC

- **Branche** : `claude/video-review-wqnqdw` · **Commit** : `0aa098d3` · **Run** : `35157474307`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35157474307
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

## ❌ Auto-merge Claude branches into main — 16/09/2026 22:16 UTC

- **Branche** : `claude/video-review-wqnqdw` · **Commit** : `ae13542e` · **Run** : `35155879915`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35155879915
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
##[warning]PR #3826 — merge auto refusé. Cause exacte ci-dessous.
[claude/video-review-wqnqdw b75824d24] diag: pourquoi l'auto-merge de claude/video-review-wqnqdw est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 16/09/2026 22:08 UTC

- **Branche** : `claude/video-review-wqnqdw` · **Commit** : `be906588` · **Run** : `35155521373`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35155521373
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
##[warning]PR #3826 — merge auto refusé. Cause exacte ci-dessous.
[claude/video-review-wqnqdw c99267488] diag: pourquoi l'auto-merge de claude/video-review-wqnqdw est refusé [skip ci]
error: failed to push some refs to 'https://github.com/9r4rxssx64-creator/CMCteams'
##[error]Process completed with exit code 1.
```

## ❌ Deploy KDMC Uptime (surveillance domaine) — 16/09/2026 22:02 UTC

- **Branche** : `claude/video-review-wqnqdw` · **Commit** : `be906588` · **Run** : `35155521388`
- **Ce qui a lâché** : deploy › Smoke test réel (leçon
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35155521388
- **Ce que la machine a dit** :

```
^[[36;1mgrep -q '"ok": true' /tmp/h.json || { echo "::error::/health invalide : $(cat /tmp/h.json)"; exit 1; }^[[0m
^[[36;1mecho "--- /run sans clé doit être refusé (garde) ---"^[[0m
^[[36;1m[ "$CODE" = "401" ] || { echo "::error::POST /run sans clé a répondu $CODE au lieu de 401 — /run est PUBLIC"; exit 1; }^[[0m
^[[36;1m[ "$CODE" = "405" ] || { echo "::error::GET /run a répondu $CODE au lieu de 405"; exit 1; }^[[0m
^[[36;1mgrep -q '"results"' /tmp/run.json || { echo "::error::/run invalide : $(head -c 800 /tmp/run.json)"; exit 1; }^[[0m
^[[36;1m  if(!hasToken){ console.log('::notice::push : pas de jeton → non testé (fail-open)'); process.exit(0); }^[[0m
^[[36;1m  console.log('::error::push NON envoyé : HTTP ' + p.code + ' ' + (p.why||'')); process.exit(1);^[[0m
^[[36;1mgrep -q '"ts"' /tmp/state.json || { echo "::error::/ ne rend pas l'état du passage qui vient d'avoir lieu — persistance cassée"; exit 1; }^[[0m
--- /run sans clé doit être refusé (garde) ---
    "why": "error code: 1042\n"
##[error]push NON envoyé : HTTP 404 error code: 1042
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 16/09/2026 21:36 UTC

- **Branche** : `claude/persona-personnage-javis-hqd55e` · **Commit** : `5ddd3cd0` · **Run** : `35152639948`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35152639948
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
##[warning]PR #3823 — merge auto refusé. Cause exacte ci-dessous.
[claude/persona-personnage-javis-hqd55e 0e688f0dc] diag: pourquoi l'auto-merge de claude/persona-personnage-javis-hqd55e est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 16/09/2026 21:17 UTC

- **Branche** : `claude/video-review-wqnqdw` · **Commit** : `0cdda164` · **Run** : `35151284266`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35151284266
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

## ❌ Auto-merge Claude branches into main — 16/09/2026 17:26 UTC

- **Branche** : `claude/video-review-wqnqdw` · **Commit** : `2efb2ed7` · **Run** : `35127914959`
- **Ce qui a lâché** : auto-merge › Rattraper main avant la PR (journaux fusionnés en union, jamais bloqués)
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35127914959
- **Ce que la machine a dit** :

```
^[[36;1m    echo "::warning::main rattrapé localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
^[[36;1m      || echo "::warning::rattrapage fait localement mais push refusé (la session a poussé entre-temps ?) — la PR tentera quand même."^[[0m
##[error]Process completed with exit code 128.
```

## ❌ Auto-merge Claude branches into main — 15/09/2026 22:57 UTC

- **Branche** : `claude/video-review-wqnqdw` · **Commit** : `0a59c9f5` · **Run** : `35032874548`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35032874548
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
[claude/video-review-wqnqdw 9e72353cb] diag: pourquoi l'auto-merge de claude/video-review-wqnqdw est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Deploy KDMC Uptime (surveillance domaine) — 15/09/2026 22:51 UTC

- **Branche** : `claude/video-review-wqnqdw` · **Commit** : `0a59c9f5` · **Run** : `35032874384`
- **Ce qui a lâché** : deploy › Smoke test réel (leçon
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35032874384
- **Ce que la machine a dit** :

```
^[[36;1mgrep -q '"ok": true' /tmp/h.json || { echo "::error::/health invalide : $(cat /tmp/h.json)"; exit 1; }^[[0m
^[[36;1mecho "--- /run sans clé doit être refusé (garde) ---"^[[0m
^[[36;1m[ "$CODE" = "401" ] || { echo "::error::POST /run sans clé a répondu $CODE au lieu de 401 — /run est PUBLIC"; exit 1; }^[[0m
^[[36;1m[ "$CODE" = "405" ] || { echo "::error::GET /run a répondu $CODE au lieu de 405"; exit 1; }^[[0m
^[[36;1mgrep -q '"results"' /tmp/run.json || { echo "::error::/run invalide : $(head -c 800 /tmp/run.json)"; exit 1; }^[[0m
^[[36;1m  if(!hasToken){ console.log('::notice::push : pas de jeton → non testé (fail-open)'); process.exit(0); }^[[0m
^[[36;1m  console.log('::error::push NON envoyé : HTTP ' + p.code + ' ' + (p.why||'')); process.exit(1);^[[0m
^[[36;1mgrep -q '"ts"' /tmp/state.json || { echo "::error::/ ne rend pas l'état du passage qui vient d'avoir lieu — persistance cassée"; exit 1; }^[[0m
--- /run sans clé doit être refusé (garde) ---
    "why": "error code: 1042\n"
##[error]push NON envoyé : HTTP 404 error code: 1042
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 15/09/2026 22:46 UTC

- **Branche** : `claude/video-review-wqnqdw` · **Commit** : `3fec9d9d` · **Run** : `35032034986`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35032034986
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
[claude/video-review-wqnqdw 185fdeaf3] diag: pourquoi l'auto-merge de claude/video-review-wqnqdw est refusé [skip ci]
##[error]Process completed with exit code 1.
```

## ❌ Auto-merge Claude branches into main — 15/09/2026 21:56 UTC

- **Branche** : `claude/video-review-wqnqdw` · **Commit** : `e697f89f` · **Run** : `35027265732`
- **Ce qui a lâché** : auto-merge › Create & merge PR into main
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/35027265732
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
[claude/video-review-wqnqdw af55d98fa] diag: pourquoi l'auto-merge de claude/video-review-wqnqdw est refusé [skip ci]
##[error]Process completed with exit code 1.
```

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
