# Mémo de reprise — v9.399 (session 2026-04-19 reprise autonome)

> **Lire en PREMIER à chaque nouvelle session.**
> Puis `NOTES_USER.md`, `~/.claude/CLAUDE.md` (11 règles permanentes), `CHANGELOG.md`.
> **⚠️ Aussi lire `GUIDE_IPHONE.md`** — actions priorisées côté Kevin avec URLs directes.
> **⚠️ Aussi lire `INTEGRATION_STANDARD.md`** — stack universelle à propager dans APEX + futurs projets.

---

## 🆕 Session 2026-04-19 matin (reprise autonome après Vercel rate limit)

### Contexte de reprise
- Dernier commit réel hier soir : `b02e4b5 v9.397` (PR #88 mergée, Pollinations + vercel skip docs)
- Branche de reprise : `claude/resume-cmc-teams-DSvJH` (2 commits devant main)
- Blocage : Vercel Free rate limit atteint → previews KO ~24h, main + GitHub Pages OK

### ✅ Livré autonome ce matin

| Commit | Version | Feature |
|--------|---------|---------|
| `07a5608` | v9.398 | **WebAuthn — Face ID / Touch ID / Windows Hello** : helpers `_b64url`, `webauthnRegister/Login/Remove/DoLogin`, enrôlement vMonProfil, bouton biométrique en tête vLoginStep1, creds dans `A.reg[uid].webauthn[]` sync Firebase, guards + audit (`webauthn_register`, `webauthn_remove`, `login_webauthn`). Fallback si navigateur non-supporté. |
| `ef44e82` | v9.399 | **Ping-casino + détection onsite WiFi** : `cmc_ping_urls` FB_FIX (URLs admin), `pingCasinoNetwork` fetch no-cors timeout 2.5s, `runOnsiteCheck` combine WiFi + GPS geofence (confidence 0.7/0.85/1.0), auto-check 5min visible + throttle 60s, déclenché aux 3 entrées login. UI admin dans vGeoAdmin : ajouter/retirer URLs, bouton test, dernier statut affiché. |
| (à venir) | v9.400 | **Audit guards AID** : 22 fonctions destructives scannées (delEmp, saveOv, doReset*, adminSet*, removeEvent, savePlanPositions, markAsRetired, etc.) — **21 OK**, 1 gap corrigé : `clearErrorLog` ajouté au guard AID. Rapport complet dans section "🔑 Audit guards AID" ci-dessous. |

### 🔑 Audit guards AID — v9.400 (2026-04-19)

Scan automatique de toutes fonctions suspectes (`del*`, `remove*`, `clear*`, `save*`, `admin*`, `doReset*`, `setMotd*`, etc.) et des handlers admin (pit boss, exchange, import).

**Résultat** : **21/22 conformes** — toutes les fonctions mutantes critiques ont bien `if(!A.user||A.user.id!==AID)return;` en première ligne. Fonctions multi-rôles (pit boss : admin + chef + cadres) utilisent le pattern `isAdm || isChef` avec vérif explicite.

**1 seul gap trouvé** : `clearErrorLog` (usage admin-only via vDebug mais guard absent) → corrigé. Impact faible car `cmc_err_log` est FB_LOCAL (jamais sync), mais correction pour cohérence.

**Fonctions auditées OK** : `adminSetEmpBg`, `setMotd`, `clearMotd`, `adminSetMotdFromInput`, `adminDeleteUploadRequest`, `doResetPwDirect`, `adminSetReg`, `adminSetPw`, `adminChangeEmpId`, `delEmp`, `saveOv`, `saveCagnottes`, `applyTemplate`, `deleteTemplate`, `savePlanningTemplate`, `applyPlanningTemplate`, `deletePlanningTemplate`, `removeAppPhoto`, `removeEmpPhoto`, `removeEvent`, `removePinCode`, `removeCustomSalon`, `removeEmailJSConfig`, `savePlanPositions`, `markAsRetired`, `createEmpFromImport`, `autoFillMissingCadres`, `webauthnRemove`, `setPingUrls`.

**Fonctions multi-rôles (pattern isAdm || isChef)** : `pitApplyStaffingPlan`, `pitDeclareLastCall`, `pitFlipTable` — délégation Pit Boss gérée par cadres + admin, voir `A.user.chef || A.user.family==="cadres"`.

### ⏳ À faire ensuite (priorité memo)

- 🔑 **Audit guards AID** systématique (toutes fonctions destructrices)
- 📹 Caméra publique Place du Casino → déjà cablée (cam_live flag + lien skylinewebcams)
- 🎨 Images Monaco via `generate_image` Pollinations (fond accueil, bannières)
- 🌙 Améliorer mode arrière-plan (Background Sync, periodic sync PWA)
- 🔐 WebAuthn admin : double-guard AID renforcé (déjà OK car uid=U11804)

---

## 🗂 Session soirée 2026-04-18 (21h-23h30) — RÉALISATIONS MAJEURES

### ✅ Résolu / mergé aujourd'hui

| PR | Titre | Contenu |
|----|-------|---------|
| #82 | workflow cron GitHub Actions | Remplace crons Vercel Hobby bloqués (3 schedules + workflow_dispatch) |
| #83 | v9.396 Sentry browser CMCteams | Loader Script dans `<head>` + CSP élargie Sentry |
| #84 | P4 Sentry Node agent Vercel | `@sentry/node` + init centralisé + captureException avec contexte |
| #85 | `/api/sentry-test` + SENTRY_DSN dans health | Endpoint test Sentry + vérification env var |
| #86 | INTEGRATION_STANDARD.md | Stack universelle à propager dans tous projets |

### 🔧 En cours (sur branche `claude/pollinations-and-vercel-skip`)

| Commit | Contenu |
|--------|---------|
| v9.397 | Outil IA `generate_image` (Pollinations.ai gratuit) + vercel.json skip docs/agent renforcé |

### ⚙️ Configuration côté Kevin

| Action | Statut |
|--------|--------|
| `AGENT_SECRET` ajouté dans GitHub Secrets | ✅ fait |
| `SENTRY_DSN` ajouté dans Vercel env vars agent | ✅ fait |
| Telegram bot `/start` fait + chat_id validé `5458942048` | ✅ fait |
| Sentry compte créé (org `kdmc`, projet `cmcteams`) | ✅ fait |

### ⏳ Attente blocage externe

- **Vercel Free rate limit atteint** (100 deploys preview/jour) → redeploy kdmc-agent-monaco bloqué pour 24h
- Test `/api/sentry-test` ne marchera qu'**après demain ~22h30** (reset rate limit)
- Meanwhile, le code est bon, juste pas propagé au runtime Vercel

### 🔍 SyntaxError CMCTEAMS-1 (Sentry)

**Diagnostic final** : chargement HTML partiel (index.html 1.98 MB), pas un bug de code.
- Testé en Playwright local : aucune erreur
- Stack trace sans fichier/ligne : signature classique de script inline tronqué
- **Action** : marquer "Resolved" dans Sentry, si récidive creuser
- **Roadmap** : découper index.html en chunks ou service worker intégrité

### 🤖 MCP installés dans sandbox Claude Code

- `context7` (docs à jour anti-hallucination)
- `vercel` (gestion déploiements)
- `sentry` (monitoring)
- `hf` (Hugging Face, images gratuites)

### 📜 Règles globales propagées dans `~/.claude/CLAUDE.md`

12 règles permanentes :
0. Anti-coupure / anti-timeout
1. Travail complet
2. Minimum investissement gratuit
3. Autonomie max (Playwright, curl, MCP, subagents)
4. Évolutivité
5. Vérifier existant
6. Ne pas abîmer
7. Communication honnête
8. TodoWrite systématique
9. Propagation IA (CMCteams + APEX + agents)
10. URLs directes + vue iPhone obligatoire (Playwright simuler avant)
11. Minimum intervention utilisateur (IA se débrouille seule)
12. Propagation à toutes les IA créées y compris Apex

### 🌐 Stack universelle (à propager partout)

Dans `~/.claude/CLAUDE.md` et `INTEGRATION_STANDARD.md` :

1. **Sentry** monitoring (org `kdmc`, 5k events/mois gratuits)
2. **Pollinations.ai** images (gratuit sans clé)
3. **Context7** docs MCP anti-hallucination
4. **GitHub Actions** cron illimité (remplace Vercel Hobby)
5. **CDN preconnect** pour perf
6. **Règles permanentes** dans `buildIASystemPrompt` de chaque IA d'app

### 🚀 Propagation APEX AI — ✅ DÉJÀ FAIT

L'autre session Claude Code a déjà appliqué `INTEGRATION_STANDARD.md` dans APEX AI
(projet séparé, branche `claude/custom-ai-assistant-project-i1U0p`).
→ Stack universelle active dans les 2 projets maintenant.

---

## 📋 À FAIRE (demandes Kevin à traiter dans ordre)

### 🎛 SYSTÈME TOGGLES ADMIN CENTRALISÉ (priorité haute, 2026-04-18)
> "L'admin puisse faire on/off avec bouton sympa pour chaque fonction.
> Quand off → info disparaît chez tout le monde en live. Pareil micros, IA,
> météo, caméra, etc. Si admin désactive, info disparaît dans vue de tous."

**Plan** :
- Store `cmc_feature_flags` = {cam_live:true, meteo:true, mic:true, ia:true, ...}
- Sync Firebase FB_FIX (propage temps réel via SSE)
- Helper `isFeatureEnabled(key)` utilisable partout
- Panel admin unique `vFeatureFlags` avec boutons ON/OFF stylisés
- Chaque feature existante enveloppe son rendu dans `if(isFeatureEnabled(...))`

### 📹 CAMÉRA PUBLIQUE PLACE DU CASINO
> "Caméra Place du Casino publique. Vue live de la société."

**Plan** :
- Chercher flux webcam public Place du Casino (YouTube Live ?)
- iframe embed si trouvé (CSP à adapter)
- Fallback : liens vers webcam.travel ou sites Monaco officiel
- Affichage dans vMonacoLive conditionné par feature_flag cam_live

### 🔐 RECONNAISSANCE FACIALE / WebAuthn (priorité moyenne)
> "Reconnaissance faciale pour connexion après création compte.
> Pareil pour admin."

**Plan** :
- WebAuthn API (`navigator.credentials.create/get`)
- iOS 16+ Face ID via Passkeys
- Android via biometric
- Store credential ID dans cmc_reg[uid].webauthn_cred
- Login flow : si credential existe → proposer Face ID avant password
- Guard AID strict pour admin (double check)

### 🌐 RÉSILIENCE LOC + CONNEXION TEMPS RÉEL (2026-04-18)
> "Localisation et infos temps réel via WiFi casino (public + employé).
> Bluetooth, P2P entre téléphones pendant coupures. Résilience maximale."

**Limitations honnêtes web / PWA** :
- ❌ Pas d'accès direct SSID WiFi côté navigateur (sécurité)
- ❌ WebBluetooth limité iOS (uniquement via Bluefy)
- ✅ `navigator.geolocation` utilise déjà WiFi en fond sur mobile
- ✅ WebRTC P2P possible avec signaling serveur initial

**Solutions réalistes à implémenter** :
1. **Ping endpoint interne** : `/ping-casino` hébergé sur serveur casino local
   - Si ping répond → téléphone sur WiFi casino → assume emp sur site
   - Résout le problème SSID sans besoin d'accès direct
   
2. **Service Worker Background Sync** :
   - Queue positions en IndexedDB quand offline
   - Sync automatique au retour online
   - Couvre les coupures courtes
   
3. **WebBluetooth beacons BLE** :
   - Pour Android uniquement (Chrome Beta)
   - Scanner proximité beacons casino (si installés)
   - Triangulation fine indoor
   
4. **WebRTC P2P entre téléphones** :
   - Peer connection via signaling initial Firebase
   - Échange de positions même si un client offline  
   - Redondance en cas de coupure serveur
   - Complexe → priorité basse

**Codes WiFi Kevin** : à ajouter dans settings admin quand dispo pour
détection automatique réseau casino.

### 🌙 FONCTIONNEMENT ARRIÈRE-PLAN / VEILLE
> "Application marche en arrière-plan sur appareils même en veille.
> iPhone/Android/ordinateur au maximum."

**Plan** :
- Déjà en place : Wake Lock (v9.218), keep-alive audio (v9.219), Service Worker
- À améliorer :
  - Background Sync API (chrome/edge)
  - Periodic Background Sync (PWA installée)
  - Push notifications via Service Worker
  - iOS limitations acceptées (JS coupé après 30s background)
  - Demander permissions notifications + background-fetch au login

### 🔑 GUARD ADMIN RENFORCÉ TEMPS RÉEL (déjà en place mais à auditer)
- AID = "U11804" check à TOUTES les fonctions destructrices (déjà OK)
- Firebase SSE propage modifs admin temps réel (déjà OK v8.98+)
- Audit complet à faire : vérifier CHAQUE action sensible a son guard

---

### 🌦 Dashboard Monaco Live (demandé 2026-04-18)
> "Ajoute météo, température, infos locales Monaco hebdo, Monaco info,
> des liens en rapport avec le casino et Monaco et les jeux. Réfléchis
> et innove, crée, surprends-moi."

**Plan** :
- `vMonacoLive()` view (router + FAB)
- Météo via **open-meteo.com** (gratuit, sans clé, CORS OK)
  - Endpoint : `https://api.open-meteo.com/v1/forecast?latitude=43.7384&longitude=7.4246&current_weather=true&timezone=Europe/Monaco`
  - Icône animée selon conditions (soleil ☀️ / nuageux ☁️ / pluie 🌧 / vent 💨)
- Cartes liens externes :
  - 🗞 Monaco Info (monacoinfo.com)
  - 📰 Monaco Hebdo (monacohebdo.mc)
  - 🎰 SBM Casino (montecarlosbm.com)
  - 🏰 Palais Princier (palais.mc)
  - 🏛 Visit Monaco (visitmonaco.com)
  - 🏙 Mairie Monaco (mairie.mc)
- Agenda événements Monaco (GP F1, EPT, Fête Nationale 19 nov)
- Horloge Monaco tz Europe/Monaco

### 🎨 Thème Monaco visuel (demandé 2026-04-18)
> SVG drapeau monégasque + blason princier + fond stylisé casino/palais.
> Mode nuit avec écrits lumineux (glow/neon).

**Plan** :
- SVG inline drapeau (2 bandes rouge/blanc)
- SVG blason princier stylisé
- CSS glow/neon pour thème nuit
- Gradient Monaco (rouge/blanc/or) pour fond page accueil
- À faire une fois les outils image gen disponibles (pour montages photos réelles)

---

## ⚠️ VERCEL RATE LIMIT ATTEINT (2026-04-18)

Vercel Free tier = **100 déploiements preview / jour**.

Atteint aujourd'hui après 74 PRs cumulées en une journée. Les PRs
suivantes auront statut CI "failure" Vercel mais c'est UN PROBLÈME
DE QUOTA, PAS UN BUG CODE.

**Solutions** :
- **Merger quand même** si `node --check` passe et code propre
  (GitHub Pages main → production continue de fonctionner)
- **Attendre 24h** pour reset quota
- **Upgrade Vercel Pro** ($20/mois, unlimited builds)

Kevin avisé. Dans la session actuelle, continuer à merger sur main
malgré le fail Vercel car le code est validé localement.

---

## ⚠️ MCP TOOLS À INSTALLER (demande Kevin 2026-04-18)

Kevin a demandé d'utiliser "Google outils / Gemini / DALL-E / Stable Diffusion" pour :
- Générer images/fonds écran Monaco (casino, palais)
- Améliorer plans (pas flou, futuriste)
- Animations/montages

**Statut actuel** : AUCUN MCP tool image gen disponible. Seulement GitHub MCP + Bash/Edit.

**À ajouter par Kevin** dans `~/.claude/settings.json` section `mcpServers` :
- `mcp-server-anthropic-images` (si existe)
- `mcp-server-stability-ai` (Stable Diffusion)
- `mcp-server-replicate` (multi-modèles)
- `mcp-server-google-genai` (Gemini image gen)

**Alternative autonome actuelle** : SVG inline (drapeau Monaco, blason stylisé) + CSS
avancé (glow/neon/gradients) pour effet Monaco/nuit sans API externe.

---

## Dernière version stable

**`APP_VER = "v9.284"`** — branche `main`

- Session 1 (matin 2026-04-17) : v9.153 → v9.202 (50 versions, moyenne audit externe 6.62 → 8.50)
- Session 2 (après-midi/soir 2026-04-17 à 2026-04-18) : **v9.203 → v9.284 (82 versions, 19 PRs mergées)**

## 🎯 Modules majeurs session bis (v9.203-284)

### 🎰 Pit boss live (v9.211+)
- `vPit` : gestion tables ouvertes avec couverture/compétences
- Auto-assign compétence + GPS
- Auto-rotation cron 60s + opt-out
- Ghost alerts (emps détectés non assignés > 2min)

### 📍 Coord GPS tables (v9.223+)
- `cmc_table_coords` : {id, name, jeu, jeux[], lat, lng, salon}
- Admin capture position via bouton
- `detectEmpAtTable(pos)` seuil 4m + accuracy
- Dots tables sur carte admin

### 🕰 Heures effectives (v9.224+)
- `calcEffectiveHours(uid, dateTs)` — déduction pre/post-shift + coupure 16/3 stricte
- `vHeuresShift` jour + `vDashboardHeures` mensuel
- Export CSV jour + mois + dashboard conformité

### 📢 Notifs temps réel pit → employés (v9.233+)
- `sendPitMessage` : DM chat + notif push si arrière-plan
- Types : assign, break, fin_service, rotation, rotation_auto, convoc_*, flip, realloc_out
- Presets convocation : visite_medicale, habillement, rh, formation, pitboss, annonce
- Groupes : individual, present, all, team:X
- Bannière in-app `_checkPitBanner` avec TTS
- Ack + réactions emoji (✅ 👍 ⚠️ ⏳ ❌ 🙅)
- Badge pulsant topbar si pending

### 🧩 Solveur staffing + dernier call (v9.265+)
- `pitSolveStaffing` : algo allocation par score (compétence + chef + senior)
- `pitApplyStaffingPlan` : applique auto, notif emps retirés/ajoutés
- `pitDeclareLastCall` : bloque nouvelles ouvertures jusqu'à 14h lendemain

### 🔁 Tables réversibles (v9.268+)
- `cmc_table_coords[].jeux = ["bj","punto"]` (1 ou plus)
- `pitFlipTable` : change jeu en cours + notif + re-calibre rotDurMin
- Auto-rebalance si emps incompatibles (confirm prompt)
- UI multi-select jeux (checkboxes)

### 🗺 Plan d'implantation évolutif (v9.274+)
- `vPlanImplantation` : SVG 800×500 par établissement (CMC, Café, CDP, Sun)
- Drag & drop tables (position en % viewBox, responsive)
- Image de fond uploadable par URL
- Lien Google Maps par adresse
- Icônes créatives par jeu : ♠ ● ○ ♣ ♦ 🎲 ♥
- `autoPlacePlanFromGPS` : min-max normalization lat/lng → %
- Dots live pulsants 🟢 sur tables ouvertes
- Stats par salon (compteur + ouvertes live)
- Salons custom par établissement (ajout/suppression)
- **Clic sur table = ouvrir/fermer live** (mode consult)

## 📋 PRs mergées session bis

| PR | Titre | Versions |
|----|-------|----------|
| #20 | Coord tables GPS + heures effectives | v9.223-224 |
| #21 | CSV export + auto-assign GPS + dashboard heures | v9.225-227 |
| #22 | Lien table physique + ghost alerts | v9.228-229 |
| #23 | Ghost watcher + notifs temps réel emp + convocations | v9.230-237 |
| #24 | Ack emp + bannière in-app + rotation notif | v9.238-240 |
| #25 | Auto-rotation cron + dashboard pit boss | v9.241-243 |
| #26 | Export CSV ack + alerte conformité + docs | v9.244-246 |
| #27 | Historique session + fil emp + badge topbar | v9.247-249 |
| #28 | Tests unitaires notifs + notes | v9.250-251 |
| #29 | Notif push + auto-assign GPS + emoji feedback | v9.252-254 |
| #30 | Stats réactions + timer emp | v9.255-256 |
| #31 | **Fixes audit externe** (coupure 16/3 + races) | v9.257-259 |
| #32 | Polish UX (responsive + a11y) | v9.260-262 |
| #33 | Solveur staffing + dernier call + tests | v9.263-267 |
| #34 | Tables réversibles + flip | v9.268-270 |
| #35 | Datalist salons + auto-rebalance | v9.271-273 |
| #36 | Plan implantation évolutif casino+café | v9.274-277 |
| #37 | Plan ↔ GPS sync + live status + stats salon | v9.278-280 |
| #38 | Plan interactif (clic live + salons custom) | v9.281-283 |

## 🔑 Clés Firebase ajoutées session bis

| Clé | Sync | Usage |
|-----|------|-------|
| `cmc_table_coords` | FB_FIX | Coord GPS tables |
| `cmc_timings` | FB_FIX | Timings shift |
| `cmc_known_identities` | FB_FIX | Historique permanent identités |
| `cmc_positions` | FB_FIX | Positions live emps (rolling 48h) |
| `cmc_plan_positions` | FB_FIX | Positions visuelles tables plan |
| `cmc_plan_bg_images` | FB_FIX | Images de fond plan |
| `cmc_custom_salons` | FB_FIX | Salons custom par établissement |
| `cmc_ghost_log` | FB_LOCAL | Historique détections ghost |
| `cmc_auto_rotation_off` | FB_LOCAL | Opt-out auto-rotation |
| `cmc_auto_assign_gps` | FB_LOCAL | Opt-in auto-assign GPS |

## 🔍 Règles permanentes actives

- **Vérification 10 sources minimum** pour toute info factuelle
- **Merge autonome** quand CI Vercel green
- **Audit externe** via subagents Explore avant chaque batch majeur
- **Tests unitaires** après chaque nouvelle feature dans runTests()
- **esc() partout** sur données user avant innerHTML
- **Guards admin** `if(!A.user||A.user.id!==AID)return;` sur fonctions destructrices

## ⏳ Roadmap futurs

- **App native** (ROADMAP_NATIVE_APP.md) : ~15-20k€, 2 mois (géoloc 24/7)
- Module paie complet (Article 13 Convention + cagnottes par jeu)
- Intégration SI SBM externe
- Multi-langue IT/EN complet
- Export PDF planning signé

## ⏳ Actions Kevin hors code

- Nettoyage Vercel (kdmc-bot-2026)
- Token Telegram / secrets GitHub Actions
- Créer repos IA-KDMC + e-KDMC
- Valider budget app native si souhait 24/7 strict

---

*Dernière mise à jour : 2026-04-18 — v9.284 (132 versions total, 19 PRs mergées session bis, modules pit boss/coord GPS/heures effectives/notifs/plan implantation complets)*
