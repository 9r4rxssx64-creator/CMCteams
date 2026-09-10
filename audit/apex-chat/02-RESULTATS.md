# Apex Chat — 02 · Résultats mesurés (attendu / obtenu / statut)

**Date d'exécution** : 2026-09-10 · **Version** : `v1.1.288`
Chaque ligne porte une **commande réellement exécutée** et sa **sortie brute**.
Rien n'est estimé. Quand je n'ai pas pu mesurer, c'est écrit 🔴 et la raison est donnée.

---

## 1. Le filet de sécurité — suite de tests

```
$ npx vitest run

 Test Files  59 passed (59)
      Tests  1115 passed (1115)
   Duration  18.13s
```

| Attendu | Obtenu | Statut |
|---|---|---|
| La suite passe entièrement | **1115 / 1115**, 59 fichiers, 0 échec | ✅ VÉRIFIÉ |
| Durée acceptable en CI | 18,13 s | ✅ VÉRIFIÉ |

## 2. Couverture réelle

```
$ npx vitest run --coverage

File               | % Stmts | % Branch | % Funcs | % Lines
All files          |   89.47 |     84.3 |   94.96 |   89.47
 lib               |     100 |      100 |     100 |     100
 workers           |   85.57 |    79.65 |   91.87 |   85.57
  api-worker.js    |   83.42 |    76.88 |    89.4 |   83.42
  ia-worker.js     |     100 |      100 |     100 |     100
  push-worker.js   |     100 |      100 |     100 |     100
  sms-worker.js    |     100 |      100 |     100 |     100
 durable-objects   |     100 |      100 |     100 |     100
 workers/lib       |     100 |      100 |     100 |     100
```

| Attendu | Obtenu | Statut |
|---|---|---|
| `lib/` à 100 % | **100 % / 100 % / 100 %** | ✅ |
| Durable Objects à 100 % | **100 %** (ConversationDO, BroadcastDO, PresenceDO) | ✅ |
| 3 workers secondaires à 100 % | **100 %** (ia, push, sms) | ✅ |
| `api-worker.js` ≥ plancher 80 % | **83,42 %** lignes · 76,88 % branches · 89,40 % fonctions | ✅ |

**Lecture honnête** : le fichier le moins couvert est aussi le plus critique (6 045 lignes :
OTP, admin, JWT, premium). Il n'est **pas exclu** de la mesure — c'est un choix explicite du
`vitest.config.js`, avec un plancher dédié. Les ~16 % non couverts sont des branches d'erreur
et des chemins de repli, pas des fonctionnalités entières ; mais je ne peux pas garantir qu'il
n'y a rien d'important dedans sans les lister une par une, ce que je n'ai pas fait.

## 3. Le P0 — la porte admin

| # | Attendu | Commande | Obtenu | Statut |
|---|---|---|---|---|
| 3.1 | Le numéro admin a quitté le fichier public | `grep -rn "336…277" index.html` | **0 ligne** | ✅ |
| 3.2 | Il ne subsiste que hors du site servi | `grep -rln "336…277" .` | `tests/unit/*` + `MEMO_KEVIN_RESTE_A_FAIRE.md` | ✅ (à nettoyer, non servi) |
| 3.3 | La garde est active en config | `grep … wrangler.toml` | `ADMIN_BYPASS_REQUIRE_MFA = "true"` (l. 140) | ✅ |
| 3.4 | Le backdoor OTP universel est fermé | `grep … wrangler.toml` | `ALLOW_TEST_OTP = "false"` (l. 149) | ✅ |
| 3.5 | Les deux gardes passent | `npx vitest run …mfa… …phone…` | **6 / 6 verts** en 1,01 s | ✅ |
| 3.6 | Le worker **déployé** refuse la requête | `curl -X POST …workers.dev/api/auth/verify-otp` | `CONNECT tunnel failed, response 403` | 🔴 **NON MESURABLE ICI** |

**Sur 3.6** : le 403 vient de la politique de sortie réseau de cette session, pas du service.
`curl -sS "$HTTPS_PROXY/__agentproxy/status"` ne montre **aucun** `recentRelayFailures` — c'est
donc bien un refus de politique, et la règle est de le **signaler, pas de le contourner**. Le
chemin légitime existe et a le réseau ouvert : Actions → `apex-chat-e2e.yml`.

## 4. Les quatre autres findings

| Finding | Attendu | Obtenu | Statut |
|---|---|---|---|
| P1 — admin par le nom | Le repli hors-ligne ne donne plus l'admin | `no-client-side-admin-by-name.test.js` : **3/3** | ✅ v1.1.285 |
| P2 — jeton dans l'URL du WebSocket | Ticket à usage unique, rejeu refusé | `ws-ticket-usage-unique.test.js` : **6/6** | ✅ v1.1.286 |
| P2c — jeton dans l'URL des médias | Ticket à portée limitée, ignoré ailleurs | `media-ticket-portee-limitee.test.js` : **6/6** | ✅ v1.1.288 |
| P2 — CORS ouvert à tous | Liste blanche, `Vary` cumulé, 101 intact | `cors-origines-autorisees.test.js` : **5/5**, `cors.js` **100 %** | ✅ v1.1.287 |

## 5. Inventaire — écarts entre ce que disent les docs et ce que dit le code

| Vérification | Attendu | Obtenu | Statut |
|---|---|---|---|
| Version cohérente | `package.json` == `index.html` | **1.1.288 == 1.1.288** | ✅ (l'écart signalé le 05/09 est résorbé) |
| Dépendances de production | 0 | **0** (`"dependencies": {}`) | ✅ |
| Secrets en dur | 0 hors tests | **0** | ✅ |
| README | à jour | annonce une « Phase 1 en cours » alors que tout existe | ❌ **périmé** |
| `MEMO_KEVIN_RESTE_A_FAIRE.md` | à jour | **285 versions de retard**, contient encore le numéro admin | ❌ **périmé** |

## 6. Ce qui n'a **pas** pu être exécuté — et pourquoi

| Passe exigée par le protocole | Bloquant mesuré | Comment la lancer |
|---|---|---|
| **LIVE réelle** (vraies pages, vrai navigateur) | Egress refusé (`403 connect_rejected`) sur `workers.dev` et `kd-mc.com` | Actions → `apex-chat-e2e.yml`, `audit-live.yml` |
| **Second avis indépendant (non-Claude)** | Idem — je n'ai pas déclenché le workflow dans cette passe | Actions → `ai-review-independent.yml` (Qodo/GPT, clé déjà en secret) |
| **Scan sécu outillé** (gitleaks, Semgrep, OSV, Trivy, zizmor) | Idem | Actions → `security-suite.yml`, `strix-scan.yml` |
| **E2E Playwright** (19 scénarios) | Navigateurs non installés dans cette session ; la passe unitaire ne les couvre pas | Actions → `apex-chat-e2e.yml` |

**Conséquence à dire clairement** : cet audit est **statique + tests unitaires**. Il prouve que
*le code du dépôt* est correct. Il ne prouve pas que *le service en ligne* l'est. Les deux
énoncés sont différents et je ne les confonds pas.

---

## Synthèse chiffrée

| Indicateur | Valeur mesurée |
|---|---|
| Tests | **1115 / 1115** verts, 59 fichiers |
| Couverture globale | **89,47 %** lignes · 84,30 % branches · 94,96 % fonctions |
| Findings d'audit ouverts | **0 / 5** (les 5 sont corrigés et prouvés) |
| Fonctions cartographiées | **78** (F01–F78) |
| Fonctions sans aucun test | **2** (F18 sentinelles, F19 chronologie — vues admin en lecture seule) |
| Routes API | **64** dont **20 d'administration** |
| Secrets dans le dépôt | **0** |
| Passes obligatoires non exécutées | **4** (live, second avis, scan outillé, e2e navigateur) |
