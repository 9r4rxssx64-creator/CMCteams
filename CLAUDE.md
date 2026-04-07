# CLAUDE.md — CMCteams Codebase Guide

Guide pour assistants IA travaillant sur ce dépôt. Mis à jour après session v9.13.

> **Règles globales** (s'appliquent à tous les projets) : voir `~/.claude/CLAUDE.md`

---

## Vue d'ensemble du projet

**CMCteams** est une SPA de planification de shifts et de gestion d'équipes pour le Casino de Monaco. Application entièrement client-side — pas de backend, pas de build, pas de dépendances — servie comme un unique fichier HTML statique hébergé sur GitHub Pages.

- **Langue :** Français (UI, commentaires, identifiants, messages de commit)
- **Version actuelle :** `APP_VER = "v9.13"`, `DATA_VER = 30`
- **Stockage :** `localStorage` navigateur + **Firebase Realtime Database** (sync temps réel)
- **Effectif :** ~258 employés sur 10 équipes BJ + 13 équipes roulettes + 13 équipes CMC

---

## Structure du dépôt

```
CMCteams/
├── index.html          # Application entière (HTML + CSS + JS, ~440 KB)
├── sw.js               # Service Worker (cache offline — ajouté v8.78)
├── README.md           # Description minimale
├── CLAUDE.md           # Ce fichier
└── .github/
    └── workflows/
        └── deploy.yml  # Déploiement GitHub Pages (déclenché sur push main)
```

---

## Architecture

### Pattern SPA monofichier

```
<head>
  <style>  ← ~3200 lignes de CSS embarqué
  </style>
</head>
<body>
  <div id="app"></div>   ← point de montage principal
  <script>  ← ~5900 lignes de JS vanilla
  </script>
</body>
```

### Objet d'état global `A`

```javascript
var A = {
  user: null,
  view: "accueil",
  year: 2026,
  month: 3,              // 0-indexé (getMonth()) : avril = 3
  employees: [...],
  teams: [...],
  overrides: {},
  passwords: {},
  reg: {},               // {uid: {nom, prenom, email, adresse, dateNaissance, usbm, poste, createdAt, updatedAt}} — A.reg
  showLeg: false,
  chatMsgs: [...],
  empQ: "", pwQ: "", pwFilt: "all",
  importSuggestions: {newEmps: [], possibleRetired: []},
  pt: null
};
```

---

## Principe fondamental — Import = seule source de vérité (v8.79+)

- `gpl()` retourne uniquement les overrides (données importées + modifications admin)
- Sans import pour un mois → les vues affichent "Importez le planning PDF"
- `genBase()` et `cumWorkDays()` sont **supprimées** depuis v8.80

---

## Firebase Realtime Database (v8.98+)

```javascript
var FB_DEFAULT = "https://cmcteams-c16ab-default-rtdb.europe-west1.firebasedatabase.app";
var FB_URL = "";   // initialisé par fbInit() — utilise FB_DEFAULT si pas de cmc_fb_url

// Clés synchronisées (partagées entre tous les appareils)
var FB_FIX = ["cmc_ov","cmc_e","cmc_t","cmc_pw","cmc_reg","cmc_chat",
              "cmc_reg_alerts","cmc_audit","cmc_presence","cmc_userlog"];
var FB_PRE = ["cmc_ref_","cmc_ci_","cmc_comments_","cmc_verif_"];

// Clés locales uniquement (non synchronisées)
var FB_LOCAL = ["cmc_uid","cmc_lastact","cmc_lastread","cmc_lastread_dm",
                "cmc_pin_fails","cmc_admin_sessions","cmc_ia_enabled",
                "cmc_ia_websearch","cmc_ia_key","cmc_fb_url"];

fbInit()           // Appelé au démarrage — charge tout + démarre SSE listener
fbWrite(k, v)      // Appelé par ls() automatiquement si clé partagée
fbLoadAll()        // Charge snapshot complet depuis Firebase
fbStartListening() // SSE EventSource sur /cmcteams.json pour mises à jour temps réel
```

**Indicateur topbar :** 🟢 connecté / 🟡 en cours de connexion

---

## Clés localStorage

| Clé | Contenu |
|-----|---------|
| `cmc_e` | Tableau employés |
| `cmc_t` | Tableau équipes |
| `cmc_ov` | Objet overrides |
| `cmc_pw` | Mots de passe hachés |
| `cmc_chat` | Messages de chat (max 500) |
| `cmc_reg` | Identités complètes {uid: {nom, prenom, email, adresse, dateNaissance, usbm, poste, createdAt, updatedAt}} |
| `cmc_admin_pin` | Hash du PIN admin |
| `cmc_admin_sessions` | Journal sécurité admin (max 200) |
| `cmc_userlog` | Historique connexions tous utilisateurs (max 500) |
| `cmc_presence` | Présence en ligne {uid: {ts, name, team}} — TTL 10min |
| `cmc_lastread` | Timestamp dernier message chat public lu |
| `cmc_lastread_dm` | Timestamp dernière lecture DMs |
| `cmc_audit` | Journal modifications admin (max 500) |
| `cmc_pin_fails` | Compteur échecs PIN {count, until} |
| `cmc_lastact` | Timestamp dernière activité (session TTL 8h) |
| `cmc_uid` | ID employé connecté |
| `cmc_ref_YYYY-M` | Métadonnées import PDF |
| `cmc_ci_YYYY_M` | Indices départ personnalisés |
| `cmc_comments_YYYY_M` | Commentaires journaliers |
| `cmc_verif_YYYY-M` | Résultat vérification import |

---

## Modules (fonctions de vue)

| Fonction | Vue | Accès |
|----------|-----|-------|
| `vLogin` / `vLoginStep*` | Authentification | Tous |
| `vAccueil` | Dashboard accueil | Tous |
| `vMonPlanning` | Planning personnel mensuel complet | Tous |
| `vMonProfil` | Fiche de renseignement (self-service) | Tous |
| `vPlan` | Grille planning équipe | Tous |
| `vDeparts` | Grille ordres de départ | Tous |
| `vChat` | Chat (DM, réponses, filtres, vider) | Tous |
| `vStats` | Dashboard statistiques | Admin |
| `vAdmin` | Panneau admin | Admin |
| `vOnline` | Présence temps réel + historique 24h | Admin |
| `vAdminSecurity` | Journal connexions admin | Admin |
| `vTeams` | Configuration équipes | Admin |
| `vEmps` | Gestion employés + éditeur identité (A.reg) | Admin |
| `vRetrait` | Employés retraités | Admin |
| `vImport` | Import PDF | Admin |
| `vPasswords` | Gestion mots de passe + vue-employé + reset | Admin |
| `vAbsences` | Suivi absences | Admin |
| `vAuditLog` | Journal modifications | Admin |
| `vIA` | Chatbot IA | Tous |
| `vEchanges` | Demandes d'échange de shifts | Tous |

---

## Impersonation admin — Vue-employé (v9.0+)

```javascript
var _viewAs = null; // null = mode normal, sinon = objet user admin sauvegardé

viewAs(id)      // Admin prend la vue d'un employé donné
viewAsBack()    // Retour au compte admin (aussi déclenché par doLogout)
```

- Bannière jaune fixe en haut de l'écran quand actif
- Bouton "← Retour admin" dans la bannière
- Le bouton ✕ (topbar) ramène l'admin au lieu de déconnecter
- Déclenché depuis vPasswords → bouton "👁 Voir" par employé

---

## Système de présence (v8.91+)

```javascript
logUserLogin(emp)        // Appelé à chaque connexion réussie
logUserLogout(uid)       // Appelé à la déconnexion
updatePresence()         // Heartbeat toutes les 2 minutes
getOnlineUsers()         // Liste utilisateurs actifs (< 5 min)
startPresenceHeartbeat() // Démarre le heartbeat (login + reprise session)
```

---

## Journal sécurité admin (v8.90+)

```javascript
logAdminSession(type, info)
// types : "success", "pin_fail", "pin_lock", "logout"
// stocké dans cmc_admin_sessions (max 200)
```

---

## Import PDF — Banque de données évolutive (v8.88+)

Après chaque import :
- `A.importSuggestions.newEmps` : noms INTROUVABLE → bouton "Créer"
- `A.importSuggestions.possibleRetired` : présents mois précédent, absents → bouton "Marquer parti"
- `createEmpFromImport(name, family)` : crée l'employé, navigue vers sa fiche
- `markAsRetired(empId, toMo)` : définit toMo + audit + dc()

---

## Identité & fiche de renseignement (A.reg)

```javascript
// Admin uniquement — modifie nom/prenom/email (v8.87+)
adminSetReg(id, field, val)

// Employé — sauvegarde sa propre fiche en un seul batch Firebase (v9.10)
empSaveProfil()
// Lit les inputs #profil_email, #profil_adresse, #profil_usbm, #profil_poste, #profil_dateNaissance
// Whitelist: var _PROFIL_FIELDS = ["email","adresse","usbm","poste","dateNaissance"]
// Nom/prénom/matricule/secteur : lecture seule pour l'employé, modifiables par admin
```

**Champs A.reg :**
| Champ | Qui peut modifier | Via |
|-------|-------------------|-----|
| `nom` | Admin | `adminSetReg` |
| `prenom` | Admin | `adminSetReg` |
| `email` | Employé + Admin | `empSaveProfil` / `adminSetReg` |
| `adresse` | Employé | `empSaveProfil` |
| `dateNaissance` | Employé | `empSaveProfil` |
| `usbm` | Employé | `empSaveProfil` |
| `poste` | Employé | `empSaveProfil` |
| `createdAt` | Système | login |
| `updatedAt` | Système | `empSaveProfil` |

**Recherche universelle** (vEmps + vPasswords) :
- Matricule SBM, `NOM Initiale`, prénom, nom complet, email

---

## Recherche — helper searchInput (v9.1+)

```javascript
// Évite la perte de focus après dc() dans les champs de recherche
searchInput(key, val, id)
// key   : clé dans A (ex: "empQ", "pwQ")
// val   : nouvelle valeur
// id    : id de l'input HTML à refocuser

// Utilisé dans :
// vEmps     → id="empQIn"
// vPasswords → id="pwQIn"
// vChat DM  → id="chatDmQIn" (via chatDmSearch)
```

---

## Navigation

```
Nav non-admin: Accueil | Mon Plan. | Profil | Équipe | Départs | Chat | Aide
Nav admin:     Accueil | Mon Plan. | Profil | Équipe | Départs | Stats | Chat | Admin | Aide
```
Onglet Échanges inséré dynamiquement si `_exchEnabled` (avant Chat).

---

## Scroll automatique

- `adjDeparts()` : scroll vers aujourd'hui dans vDeparts (getBoundingClientRect)
  - Appelé dans `dc()` et `sv('departs')` avec setTimeout(150ms)
  - Offset : `-94px` (nom sticky = 90px)
- `adjGrid()` : scroll vertical ET horizontal vers aujourd'hui dans vPlan
  - Headers vPlan ont `data-planday="{d}"`
  - Headers vDeparts ont `data-depday="{d}"`
- `sv('accueil'|'departs'|'monplanning')` : réinitialise au mois courant

---

## Tri des équipes

- **vPlan** : famille BJ → Roulettes → CMC, puis numéro croissant (1,2,3...10, r1...r13, c1...c13)
- **vDeparts** : même ordre (admin), ou [myTeam, mirrorTeam] (non-admin)
- **vPlan non-admin** : "Ma section" (mon équipe + miroir) toujours en tête, reste en dessous

---

## Chat étendu (v8.83+)

```javascript
// Format message
{text, uid, name, team, ts, to?, toName?, replyTo?: {ts,name,text}, del?: true}

// Fonctions
chatSetDm(id, name)    chatCancelDm()    chatPickDm()
chatSetReply(ts)       chatCancelReply()
chatDelMsg(ts)         // Admin : supprime un message (soft delete)
chatFilterSet(f)       // Admin : "all"|"pub"|"dm"
// Admin : bouton "🗑 Vider" dans l'en-tête du chat pour effacer tous les messages
```

---

## Reset compte employé (v9.0+)

`doResetPwDirect(uid)` — efface **mot de passe + A.reg** (identité complète).
L'employé devra se réinscrire à la prochaine connexion. Avec confirmation dialog.

---

## Changement de matricule (adminChangeEmpId)

Migre automatiquement : `A.employees`, `A.passwords`, `A.reg`, `A.overrides`,
et toutes les clés `cmc_ref_YYYY-M` (années 2025–2028) pour éviter les faux
"absent du PDF" après changement d'ID.

---

## Sécurité

- `esc(s)` : toujours sur les données utilisateur avant innerHTML
- `e.message` dans les handlers d'erreur : `.replace(/</g,"&lt;")` obligatoire (pas d'accès à `esc` dans `window.onerror`)
- Session TTL 8h (`cmc_lastact`)
- Rate-limiting PIN : 5 échecs → verrouillage progressif [30s, 2min, 10min, 1h, 24h]
- Seul `AID = "U11804"` (DESARZENS K) peut modifier les données
- Toutes les fonctions destructrices (`doResetPwDirect`, `adminSetPw`, etc.) doivent avoir le guard `if(!A.user||A.user.id!==AID)return;`
- Hash mots de passe : `hashPwStrong()` pour nouveaux comptes (10 000 rounds + sel), `verifyPw()` pour vérification (backward-compat legacy DJB2)
- Journal sécurité admin : toutes les connexions/échecs/déconnexions
- `cmc_admin_pin` dans `FB_LOCAL` (ne jamais synchroniser vers Firebase)
- Proxy IA optionnel : `cmc_ia_proxy` dans FB_LOCAL, bouton 🔗 dans vIA pour l'admin

---

## Échanges de shifts (v9.9+)

```javascript
demanderEchange(year, month, day)   // Employé : soumet une demande depuis vMonPlanning
adminRepondreEchange(exId, action, adminNote, partnerUid, partnerDay)
// action = "rejected" | "rh" (accorde repos RH) | "swap" (échange codes)
adminSupprimerEchange(exId)         // Supprime une demande de l'historique

var _exchEnabled                    // true par défaut, persisté dans cmc_exchanges_enabled
setEchangesEnabled(v)               // Toggle admin dans vAdmin
```

- Demande visible depuis **Mon Planning** : bouton 🔄 sur jours de travail non passés
- Vue admin : candidats au swap = collègues qui travaillent le même jour (même équipe)
- Toutes mutations sync Firebase via `fbWrite("cmc_exchanges", A.exchanges)`
- Audit complet : `_audit("exchange_rejected"|"exchange_rh"|"exchange_swap", ...)`

## Queue offline (v9.9+)

```javascript
_syncQueue               // {key: {v, ts}} — persisté dans cmc_sync_queue
_syncQueueAdd(k, v)      // Ajoute une entrée, affiche badge ⏳ dans topbar
_syncQueueRemove(k)      // Retire une entrée après sync réussie
flushSyncQueue()         // Rejoue toutes les écritures en attente
```

- `fbWrite` ajoute à la queue après 3 échecs (retry 2s/4s/6s)
- Auto-flush au retour online (`window.addEventListener("online", ...)`)
- Badge ⏳ cliquable dans la topbar pour forcer la sync

## Notifications navigateur (v9.9+)

```javascript
requestNotifPermission()            // Demande permission Notification API
sendNotif(title, body, opts)        // Envoie si permission accordée ET app en arrière-plan
_checkPlanningChanged(newOv)        // Déclenché par fbApplyData("cmc_ov", ...)
_checkNewChat(msgs)                 // Déclenché par fbApplyData("cmc_chat", ...)
```

- Ne s'affiche pas si `document.visibilityState === "visible"` (toast suffit)
- Bouton d'activation dans le panneau admin (vAdmin)

---

## Erreurs connues à NE PAS reproduire

1. `table-layout:fixed` dans un conteneur scrollable ❌
2. `overflow:hidden` sur parent d'un enfant scrollable (mobile WebKit) ❌
3. Fallbacks théoriques REPOS/genBase dans les vues ❌
4. `syncChefsT()` — supprimée v8.80, ne pas réintroduire ❌
5. Charger SEED_APR2026 inconditionnellement ❌
6. Push directement sur `main` sans branche feature ❌
7. Modifier des données sans vérifier `A.user.id === AID` ❌
8. `innerHTML` sans `esc()` ❌
9. `oninput` appelant `dc()` directement sans restaurer le focus → utiliser `searchInput()` ❌
10. `overflow-y:hidden` sur parent de colonne sticky (iOS Safari) ❌
11. `width:100%` sur table dans conteneur scrollable → étire les colonnes, codes loin des noms → utiliser `width:auto` ❌
12. Mettre à jour `cmc_notif_ts` sans envoyer de notification → marque les messages comme vus sans notifier ❌
13. `base=0` dans calcDepPos/vDeparts → tous les employés au même rang → utiliser index `ei` ou `chefNames.indexOf` ❌
14. Onglets nav admin > 8 → Admin poussé hors écran sur iPhone → Stats accessible depuis panneau Admin ❌
15. Notifs iOS Safari navigateur : `typeof Notification === "undefined"` (toujours) → ne fonctionne qu'en PWA (écran d'accueil) ❌
16. A.user/_viewAs non rafraîchis après remplacement de A.employees par Firebase SSE → références obsolètes ❌
17. Modifier plusieurs fonctions dans un même commit sans vérifier chaque flux → régressions ❌
18. `max-width` sur `<td>` en table-layout:auto ignoré par les browsers → utiliser un `<div class="nw">` wrapper à l'intérieur du td ❌
19. `chatSetReply(ts)` sans auto-activer `_chatDm` sur un DM → la réponse part en public au lieu de revenir en privé ❌
20. Utiliser une variable locale d'une autre fonction vue (ex: `myPl` de `vMonPlanning` dans `vAccueil`) → ReferenceError en production ❌

---

## Recherche d'outils (ToolSearch)

**À chaque session**, avant toute interaction GitHub ou MCP :

1. Les outils MCP sont listés dans les messages `<system-reminder>` comme "deferred tools"
2. Utiliser `ToolSearch` pour charger leur schéma avant de les appeler :
   ```
   ToolSearch("select:mcp__github__create_pull_request")
   ToolSearch("github")
   ToolSearch("select:AskUserQuestion,TodoWrite")
   ```

**Outils MCP courants dans ce projet :**

| Outil | Usage |
|-------|-------|
| `mcp__github__push_files` | Pousser des fichiers vers GitHub |
| `mcp__github__create_pull_request` | Créer une PR |
| `mcp__github__add_issue_comment` | Commenter une issue |
| `mcp__github__get_file_contents` | Lire un fichier sur GitHub |
| `mcp__github__list_branches` | Lister les branches |
| `mcp__github__search_code` | Chercher du code dans le repo |
| `mcp__github__pull_request_read` | Lire une PR |
| `mcp__github__subscribe_pr_activity` | S'abonner aux événements PR |

---

## Workflow Git

- **Branche principale :** `main` (déploie GitHub Pages)
- **Branche feature :** `claude/<description>`
- Messages de commit : format `vX.Y: description`

---

## Historique versions (v8.83 → v9.9)

| Version | Changements |
|---------|-------------|
| v8.83 | Chat DMs, réponses, suppression admin, filtres, séparateurs date |
| v8.84 | adjDeparts avec getBoundingClientRect, reset _chatDm à navigation |
| v8.85 | Workflow Claude Code (.claude/settings.json) |
| v8.86 | Import niveau 4.5 prénom A.reg, guards bigram homonymes |
| v8.87 | Éditeur identité admin (prénom/nom/email), recherche universelle étendue |
| v8.88 | Banque données évolutive : détection nouveaux/départs à l'import |
| v8.89 | vMonPlanning (planning personnel), récap import par catégorie |
| v8.90 | Journal sécurité admin, logAdminSession, vAdminSecurity |
| v8.91 | Présence temps réel (vOnline), historique connexions, horloge topbar, CSS animations |
| v8.92 | adjGrid scroll vers aujourd'hui (vPlan), tri équipes croissant, data-planday |
| v8.93 | Fix couleur rgba vMonPlanning, CLAUDE.md ToolSearch |
| v8.94 | Bouton admin désactiver/activer IA Claude |
| v8.95 | Recherche internet (web_search), mode local toujours actif |
| v8.96 | Login par nom+prénom (matricule optionnel), adminChangeEmpId, adminResetAllPw |
| v8.97 | findEmpByName() — recherche prénom complet, préfixe STOCKÉ = préfixe SAISI |
| v8.98 | Firebase Realtime Database (sync temps réel tous appareils), FB_DEFAULT hardcodé |
| v8.99 | Fix step1 matricule ignoré, nettoyage DEF_EMP doublons, vMonPlanning message sync |
| v9.0 | viewAs/viewAsBack (vue-employé admin), reset chat, reset compte complet (pw+reg) |
| v9.1 | Fix recherche : searchInput() helper, inputs empQIn/pwQIn ne perdent plus le focus |
| v9.2 | Admin voit son équipe+miroir en tête dans vPlan et vDeparts, sticky solides |
| v9.3 | Section headers sticky vPlan, overflow-x:clip body, gm() fallback DEF_TEAMS, requestAnimationFrame scroll |
| v9.4 | Zoom activé (max-scale=5), vDeparts tous les jours du mois, logUserLogin enrichi (IP/UA/écran/timezone), logIAInteraction (cmc_ia_log Firebase), adminSetPw, fiches employés nom/prénom/🔒 |
| v9.5 | Audit sécurité : XSS corrigés (3 handlers d'erreur), guard doResetPwDirect, hashPwStrong() 10k rounds backward-compat, proxy IA (iaSetProxy/cmc_ia_proxy), cmc_admin_pin dans FB_LOCAL, fallback base=0 cohérent vDeparts↔calcDepPos, adjMonPlanning scroll aujourd'hui, colonne nom 100-130px |
| v9.6 | Fix noms collés aux horaires, adjDeparts scroll indépendant par grille, col noms 72px |
| v9.7 | Import avec confirmation si corrections manuelles, touchSession dans heartbeat, fbWrite retry + syncQueue, améliorations vMonPlanning/vAccueil/topbar, compteur employés vPlan |
| v9.8 | fbApplyData clone profond, tc() validation hex couleur, retraités détectés à l'import, title noms complets, toast queue anti-collision, line-height planning |
| v9.9 | Queue offline (sync auto retour online, badge ⏳), notifications navigateur (planning modifié, nouveaux messages), échanges de shifts (demande depuis vMonPlanning, vue admin RH/refus/swap, audit complet, sync Firebase) |
| v9.10 | Fiche de renseignement (onglet Profil 👤) : employé remplit adresse/naissance/USBM/poste, batch Firebase unique, whitelist champs sécurisée. ROTATION 55+ corrigé : mêmes patterns standard, max 40min par défaut / 60min avec accord. Admin voit la fiche dans vEmps. |
| v9.11 | Audit complet + corrections : compétences import BRTPECK (toutes familles), rotation départs base=ei, A.user/_viewAs refresh post-SSE, vPlan table width:auto colonnes 62/28px, chat utilisateurs en ligne (DM rapide), notifs iOS guide PWA, nav admin 8 onglets (Stats→Admin panel), _checkNewChat toast si visible hors-chat, PWA meta (title+theme-color), SW cache v9.11 |
| v9.12 | Fix ReferenceError myPl dans vAccueil (→ variable code), fix largeur colonne noms vPlan (wrapper div .nw 90px — max-width ignoré par browsers sur td en auto-layout) |
| v9.13 | Fix chat DM reply : chatSetReply auto-active _chatDm → réponse privée bien routée. Nettoyage code mort (chatSetDmEmp, commentaires genBase obsolètes) |

---

## Règles de rotation Casino de Monaco

> ⚠️ Règle opérationnelle à respecter dans tous les calculs de planning

### Tous les employés (standard)
- Patterns autorisés : **20/20** · **40/20** · **60/20** (travail/pause en minutes)
- Maximum **60 minutes de travail consécutif** en toutes circonstances

### Employés 55+ (★ rouge)
- Identifiés par `emp.senior = true` (ou `emp.family==="roulettes" && emp.chef` en rétro-compatibilité)
- Affichés avec `★` rouge dans le planning, vDeparts, vEmps
- **Même patterns que les autres (20/20, 40/20, 60/20)**
- **Par défaut : maximum 40 min de travail consécutif** → pause 20 min obligatoire
- **Avec accord de l'employé : jusqu'à 60 min autorisé** (même règle que standard)

### Exception
- **Roulette européenne** (compétence `E`) : règles de rotation différentes (à préciser)

### Constante dans le code
```javascript
var ROTATION = {
  senior:   {maxWork: 40, maxWorkConsent: 60, pause: 20, patterns: [20, 40, 60]},
  standard: {maxWork: 60, pause: 20, patterns: [20, 40, 60]},
  exceptionComp: "E"  // roulette européenne
};
function isSenior(emp)      // true si emp.senior || (roulettes && chef)
function empLabelHtml(emp)  // nom + ★ rouge si senior (pour innerHTML)
function empLabel(emp)      // nom + ★ texte (pour title="")
```

---

## Constantes

```javascript
var AID      = "U11804";   // Admin = DESARZENS K
var DATA_VER = 30;
var APP_VER  = "v9.13";
var SESSION_TTL = 8 * 60 * 60 * 1000; // 8h
var FB_DEFAULT = "https://cmcteams-c16ab-default-rtdb.europe-west1.firebasedatabase.app";
```
