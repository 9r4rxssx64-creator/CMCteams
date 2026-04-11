# CLAUDE.md — CMCteams Codebase Guide

Guide pour assistants IA travaillant sur ce dépôt. Mis à jour après session v9.58.

> 📌 **Reprise de session** : voir `MEMO_RESUME.md` à la racine pour savoir où j'en suis.

> **Règles globales** (méthodologie expert, tous projets) : `~/.claude/CLAUDE.md`

> **Règles globales** (s'appliquent à tous les projets) : voir `~/.claude/CLAUDE.md`

---

## ⚠️ RÈGLE ABSOLUE — Méthode de travail (non-négociable)

**L'utilisateur ne doit JAMAIS avoir à rappeler une demande oubliée.** Cette règle prime sur tout le reste.

### 1. Feuille de route systématique (TodoWrite obligatoire)

À CHAQUE nouvelle demande de l'utilisateur — même au milieu d'une autre tâche — tu DOIS :

1. **Interrompre mentalement** la tâche courante (pas physiquement — finir le tool call en cours)
2. **Ajouter immédiatement** la nouvelle demande à la feuille de route via `TodoWrite`
3. **Reprendre** la tâche courante OU basculer sur la nouvelle si elle est plus prioritaire
4. **Jamais** répondre "OK je le ferai après" sans l'avoir écrit dans la todo list
5. **Jamais** clôturer une session sans avoir vérifié que tous les items sont `completed`

Les `<system-reminder>` qui mentionnent "The user sent a new message while you were working" sont le signal OBLIGATOIRE de mettre à jour la roadmap avant de continuer.

### 2. Vérification systématique après CHAQUE modification

Avant de dire "c'est fait", tu DOIS :

1. **Syntax check JS** : `node --check` sur le bloc script extrait
2. **Re-lire** les lignes modifiées pour confirmer le résultat
3. **Tracer le flux** : la modif casse-t-elle une autre fonction ? (utiliser la matrice d'impact Phase 0)
4. **Vérifier le rendu** : le HTML généré est-il bien formé ? Les styles inline cohérents ?
5. **Vérifier les guards** : `esc()` présent ? `A.user.id===AID` pour les actions admin ?
6. **Mobile-first** : la modif fonctionne-t-elle à 375px ? iOS safe-areas respectées ?

### 3. Auto-audit et corrections continues

Après une série de modifications, tu DOIS :

1. **Lancer un audit** (soit manuellement avec Grep/Read, soit via un subagent Explore)
2. **Chercher activement** ce qui pourrait ne pas marcher — ne pas attendre que l'utilisateur trouve les bugs
3. **Appliquer les corrections** sans demander l'autorisation pour les bugs évidents
4. **Bumper la version** à chaque batch cohérent de corrections
5. **Commit + push** avec un message descriptif

### 4. Se faire vérifier par un subagent

Pour les modifications importantes (nouveau module, refactoring, fix complexe), tu DOIS utiliser un subagent `Explore` pour un second regard :

```
Agent({
  description: "Audit indépendant v9.XX",
  subagent_type: "Explore",
  prompt: "Audit la fonction XXX dans /home/user/CMCteams/index.html lignes A-B.
           Vérifie : (1) bugs de logique, (2) XSS, (3) edge cases non gérés,
           (4) cohérence avec le reste du code. Rapport court."
})
```

### 5. Amélioration continue

- **Jamais se satisfaire** d'un "113/114 OK" — toujours chercher le 1 manquant
- **Anticiper** les demandes implicites (ex: si on ajoute un upload photo, l'utilisateur voudra sûrement aussi la supprimer → ajouter les deux)
- **Rigueur > vitesse** : mieux vaut 1 commit bien fait que 5 commits de "fix" qui se corrigent mutuellement

### 6. Communication honnête

- **Ne jamais dire "j'ai tout fait"** si tu n'as pas vérifié
- **Lister explicitement** ce qui n'est pas fait et pourquoi
- **Demander** plutôt que deviner quand c'est ambigu
- **Reconnaître** les erreurs sans excuse ni justification

### 7. Mémoire et référence aux demandes passées

- **Relire les conversations passées** en cas de doute avant d'agir
- **Consulter ce CLAUDE.md** comme source de vérité à chaque session
- **Ne jamais répéter une erreur** documentée dans "Erreurs connues à NE PAS reproduire"
- Si une demande ancienne semble oubliée, **revenir la chercher** dans l'historique au lieu de demander à l'utilisateur
- Les demandes récurrentes de l'utilisateur (ex: "revois le thème", "mets des vraies photos") doivent être **tracées dans une todo persistante** jusqu'à résolution complète

### 8. Anticipation des bugs futurs

Avant de livrer, se poser les questions :

- Que se passe-t-il si `A.user` est null au moment de l'appel ?
- Que se passe-t-il si Firebase n'est pas connecté ?
- Que se passe-t-il si localStorage est plein (QuotaExceededError) ?
- Que se passe-t-il sur iOS Safari en mode PWA vs navigateur ?
- Que se passe-t-il si l'employé a été supprimé mais ses messages chat existent encore ?
- Que se passe-t-il si deux admins modifient la même donnée en même temps (conflit SSE) ?
- Que se passe-t-il si l'import PDF rate à mi-parcours ?
- Que se passe-t-il sur viewport 375px (iPhone SE) ?

Chaque edge case non géré = bug futur.

### 9. Mise à jour CLAUDE.md après chaque session

À la fin de chaque batch de modifications cohérent, tu DOIS :

1. Bumper `APP_VER` dans l'en-tête du CLAUDE.md
2. Ajouter une ligne dans le tableau "Historique versions"
3. Documenter les nouvelles constantes/fonctions dans les sections appropriées
4. Mettre à jour la liste "Erreurs connues" si une erreur a été identifiée
5. Commit le CLAUDE.md dans le même push que le code

**Le CLAUDE.md est la mémoire persistante inter-sessions. Sans mise à jour, les prochaines sessions répéteront les mêmes erreurs.**

### 10. Agir en expert — pas en simple exécutant

Le rôle n'est pas de cocher mécaniquement une liste mais :

- **Challenger** les demandes floues : "Tu veux X ou Y ?"
- **Proposer** des améliorations que l'utilisateur n'a pas envisagées
- **Refuser** (poliment) les demandes qui cassent un principe fondamental du projet
- **Expliquer** les trade-offs quand une solution a des coûts cachés
- **Ne pas attendre** l'autorisation pour les fixes évidents
- **Rigueur technique** : valider à chaque étape, ne jamais supposer

---

## Vue d'ensemble du projet

**CMCteams** est une SPA de planification de shifts et de gestion d'équipes pour le Casino de Monaco. Application entièrement client-side — pas de backend, pas de build, pas de dépendances — servie comme un unique fichier HTML statique hébergé sur GitHub Pages.

- **Langue :** Français (UI, commentaires, identifiants, messages de commit)
- **Version actuelle :** `APP_VER = "v9.67"`, `DATA_VER = 30`
- **Stockage :** `localStorage` navigateur + **Firebase Realtime Database** (sync temps réel)
- **Effectif :** ~258 employés sur 10 équipes BJ + 13 équipes roulettes + 13 équipes CMC
- **Taille fichier :** ~620 KB (HTML + CSS + JS)
- **Conventions intégrées :** Convention Collective Jeux de Table SBM (1er avril 2015) + Note DRH 2021 (congés familiaux) + Règles des 8 jeux de table (Blackjack, Roulette anglaise/européenne, Punto Banco, Punto High Roller, Texas Hold'em, Poker Cash Game, Craps)

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
21. **Git rebase sans vérification post-rebase** : un rebase peut perdre silencieusement des modifications (règles detectRepoConflicts, blocs HTML dans vDocs, validation post-import). **OBLIGATION** : après TOUT rebase, vérifier avec `grep` que CHAQUE feature ajoutée est encore présente dans le fichier. Liste de contrôle post-rebase : `grep -c "mot_clé_unique_feature"` pour chaque ajout ❌
22. Données SEED incorrectes sans validation : SEED_APR2026 avait des horaires de travail au lieu de CP/AF pour REVOLLON. **OBLIGATION** : toute donnée SEED doit être vérifiée par `detectRepoConflicts()` — la règle 4 (horaire_dans_absence) attrape ce type d'erreur automatiquement ❌
23. Audit "simple" au lieu d'audit "général expert" : un audit qui vérifie seulement la syntaxe JS n'est PAS un audit expert. **OBLIGATION** : utiliser la checklist complète (21 points : 8 flux utilisateur + 5 flux admin + 5 sécurité + 3 données) à CHAQUE audit final ❌

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

## Historique versions (v8.83 → v9.32)

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
| v9.14 | Workflow expert CLAUDE.md, fix crash .touches[0], guards admin (removePinCode, savePinCode, auditDelEmp, auditRenameEmp), XSS picker, PIN hashPwStrong, strip .clear Firebase, font-size 11px min, touch targets 44px, import _importSkipped |
| v9.15 | Audit complet + corrections 10 fixes, refactoring vPlan (table-layout:fixed + colgroup puis revert auto), initAxisLock factorisé, bloc infos connexion admin |
| v9.16 | Refonte chat (bulles gradient, avatars, SVG Casino en fond), suppression module échanges, Casino Live placeholder, anniversaires, fêtes dynamiques (Pâques calculé), logo SBM SVG |
| v9.17 | Améliorations UX : cartes premium, raccourcis carousel horizontal accueil, badges statut employé, login progression |
| v9.18 | Statistiques annuelles avec archive, ROLES (12 postes hiérarchiques), Chefs Cartes (label famille) |
| v9.19 | Stats complètes : calcStats (mois/année/carrière) + heures, vMesStats employé, vStatsAnnuelles admin, CODE_HOURS override 16/3=9h coupure |
| v9.20 | vStatsGlobal (effectifs par lieu/rôle/famille), VENUES (6 lieux), archivage par employé |
| v9.21 | Fix doublons inscription reg_alerts, import avec fusion (plus de table rase), synthèse vImportVerif |
| v9.22 | teamForMonth (teamHistory par mois), stats fiche admin, bloc stats accueil, mode visiteur SBM |
| v9.23 | OTP vérification email (genVerifCode/checkVerifCode/adminValidateCode, cmc_verif_codes FB_FIX), EmailJS optionnel, connexion multi-critères (email/mat/nom+prénom) |
| v9.24 | Audit complet (4 agents) + 4 corrections UX P0/P1 (font-size, touch targets 44px, axis-lock seuil 10px, touch-action:pan-x pan-y) |
| v9.25 | 7 améliorations expert : backup/restore JSON, IA prompts enrichis, réactions emoji chat, login autocomplete datalist, badge sync Firebase, runTests framework (16 tests unitaires) |
| v9.26 | Bulk actions admin : mode sélection + 6 actions groupées (équipe, rôle, lieu, reset MDP, export CSV, supprimer) avec confirmation double |
| v9.27 | Fix bug doublon PORTA (dédup avec migration données), fix nav PWA iOS (viewport-fit=cover, safe-area-inset, translateZ(0), touch-action), outil detectDuplicates |
| v9.28 | Compétences corrigées (P=Punto Banco, P+=Punto HR, K=Poker Cash Game), dateEntreeSbm + dateEntreeJeux (admin RH + affichage carrière profil) |
| v9.29 | Convention collective SBM intégrée : CONVENTION (29 articles), BULLETIN_CODES, grilles salaires, vConvention (4 onglets), prompt IA enrichi |
| v9.30 | Fix calcDepPos désynchro avec vDeparts (bug PORTA étape 2), USBM→USM label, ROLES enrichi (chef américain au lieu de chef cartes), fusion vEmps/vPasswords (bouton raccourci), XSS setCI, contraste WCAG .sec-sub |
| v9.31 | Note DRH 2021 congés familiaux : extension PACS/union libre, règles d'application (prise obligatoire, R/RH, décompte ouvrés, si absence), UI enrichi vConvention, prompt IA mis à jour |
| v9.32 | Règles des 8 jeux de table (JEUX), onglet Jeux dans vConvention (accordéon détails), graphique SVG heures/mois dans stats (renderStatsCard), recherche chat avec barre toggle, animation msgIn (fade+translate nouveaux messages) |
| v9.33 | Audit post-v9.32 : JEUX injecté dans buildIASystemPrompt, fix layout chat header (double margin-left:auto), suppression helpers morts getJeu/getJeuByComp |
| v9.34 | Upload photos perso (chatBg/accueilBg/loginBg/planningBg) via file input admin + base64 resize 800x800, banque documents multi-format (vDocs : photos/PDF/DOC/XLS, 6 catégories, preview lightbox, filtres), fix topbar safe-area-inset-top iOS notch, fix vChat height 100dvh |
| v9.35 | Helper empAvatarHtml (img si photo sinon lettre), upload photo self-service (vMonProfil), upload photo admin (vEmps édition), avatars photo partout (topbar/chat/accueil/profil/emps), planningBg appliqué vPlan/vDeparts via classes body.has-*-bg |
| v9.36 | Audit v9.35 + 3 corrections : vIA height 100vh→100dvh, planning bg sans ::after (direct sur .bg-planning via background-attachment:fixed), data URLs quotées défense XSS (empAvatar/chatBg/vDocs/vMonProfil/vEmps/CSS vars) |
| v9.37 | **Glass morphism total + dossier partagé** : suppression silhouettes SVG par défaut (.bg-casino::before / .bg-palace::before), photos user appliquées sur body via CSS vars (--cmc-accueil-bg, --cmc-planning-bg actif en vPlan/vDeparts), cards/topbar/nav semi-transparents avec backdrop-filter:blur, encadrés vPlan/vDeparts/vPartage/vDocs transparents, family headers enrichis avec icônes (🃏♦️♠️) et gradient, bulles chat plus translucides, **chat carousel multi-images** (chatBg + chatBg2 + chatBg3 avec animation CSS 30s), **champ `shared` sur docs** + `toggleDocShared` + `uploadDocShared`, vDocs avec 3 onglets (Tous/Privés/Partagés) + boutons upload séparés (privé vs partagé), **nouvelle vue vPartage** accessible à TOUS les employés (read-only, docs shared seulement), helper _renderDocCard réutilisé, catégories docs enrichies (+Procédures +Plans du Casino = 8 dossiers), quick link "👥 Dossier partagé" dans accueil |
| v9.38 | Audit post-v9.37 : 3 fixes XSS défensifs sur data URLs dans CSS/attributs. Nouveau helper `_safeUrl()` qui encode `"`, `\`, `'`, `(`, `)` en `%XX`. Appliqué à 10 endroits : empAvatarHtml, vDocs thumbnails, previewDoc img/iframe src, render() CSS vars (loginBg/accueilBg/planningBg), vMonProfil photo 80x80, vEmps édition 64x64, vAdmin photos 52x52, chat-bg-layer carousel. Fix clignotement chat avec 1 seule photo (classe `.multi` requise pour l'animation). |
| v9.39 | **5 FIX CRITIQUES** + améliorations visuelles. (1) **BUG fonds d'écran invisibles** : `<div id="app" style="background:#1a3020">` inline masquait le body → changé en `transparent`. (2) **FAMILIES renommées** : roulettes→"Jeux européen" / bj→"Jeux américains" / nouveau **baccara**→"Baccara" / cmc→"Groupe ouvert" + mise à jour de tous les hardcodes (FAMS_ORDER, FAM_ICONS, FAM_LABELS, FAMS vPasswords, audit reports, IA prompt, stats global). (3) **calcStats robuste** : normalisation code (`String().trim().toUpperCase().replace(/[*']/g,"")`), nouvelle catégorie `st.autre` pour codes inconnus, support codes SBM (FL, AT, MT, ABS, etc.). (4) **vPasswords affiche mdp en clair** si stocké dans `clear` : bloc inline avec reveal 👁️, copier 📋, et input nouveau + bouton "Définir". (5) **Limites upload** : DOC_MAX_SIZE 5→25 MB, DOC_TOTAL_WARN 30→200 MB, photos 5-8→15 MB, resize app 800→1600, resize docs 1200→2000. **Améliorations visuelles** : opacity body overlay réduite (.55/.62 vs .82/.88) pour voir vraiment la photo, nouvelles animations (`pageIn`, `cardPop`, `pulseDot`, `floatUp`), hover lift sur `.card` (+translateY -2px), bouton gold gradient animé, scrollbars discrètes. |
| v9.40 | Hot-patch audit v9.39 — 2 bugs logiques mineurs corrigés. (1) `calcStats` ligne 4673 : retiré "CP" du test `base==="FL"\|\|base==="CP"\|\|...` (déjà traité plus haut, jamais atteint pour CP brut, code confus). (2) PDF import étoile → senior : ne force plus `family="roulettes"` ni `chef=true` (ligne 7424). Avant, toute étoile dans le PDF forçait l'employé en famille roulettes + chef, ce qui est incompatible avec la nouvelle famille Baccara. Maintenant l'étoile marque uniquement `senior=true` et laisse family/chef intacts. |
| v9.41 | **Compression automatique des images** au téléchargement. `_resizeImage(file,maxW,maxH,quality,cb,budgetBytes)` devient progressive : 6 tentatives en cascade (100% → 85% → 70% → 55% → 40% → 30% de maxW, qualité .85→.60) jusqu'à rentrer dans le budget. Si canvas.toDataURL throw (iOS OOM), fallback automatique vers tentative plus petite. Callback reçoit maintenant 3e argument `info={w,h,q,size}` pour logging. Budgets appliqués : photos app 800 KB, avatars employé 60 KB (300×300), docs images 90% de DOC_MAX_SIZE (22.5 MB effectif). `uploadDoc` étendu : accepte aussi .ppt/.pptx/.zip, messages d'erreur non-images avec taille réelle et limite, compteur `okCount` pour upload multi-fichiers résilient. Limite fichier brut remontée à 50 MB (la compression fera le reste pour les images). |
| v9.42 | **Groupe contractuel SBM (ouvert/fermé) + fix race condition viewAs**. (1) Nouvelle constante `GROUPES` : "ouvert" (polyvalent, mobilité jeux, prime 150€) / "ferme" (noyau historique pré-1993, retraite étendue, prime 280€). Champ `emp.groupe` optionnel sur chaque employé. (2) Picker dans vEmps édition avec description. (3) Badge visuel 🔓/🔒 dans la liste employés. (4) Affichage dans vMonProfil section Carrière avec explication. (5) Prompt IA enrichi avec statuts contractuels et règles métier (un groupe ouvert peut tourner sur plusieurs familles, baccara ne peut pas travailler aux roulettes européennes). (6) **Fix race condition `fbApplyData`** : en mode viewAs, si l'employé visualisé est supprimé pendant sync Firebase, retour automatique au compte admin avec toast d'alerte. |
| v9.43 | **Badges visuels senior + groupe fermé** — uniformisés dans toute l'app. (1) `empLabelHtml` : ★ doré avec text-shadow glow (#ffce3a) pour senior 55+, badge "F" marron (🔒 background) pour groupe fermé. Les deux badges apparaissent automatiquement partout où cette fonction est appelée (planning, départs, chat, listes). (2) `empAvatarHtml` enrichi : pastille étoile dorée dégradée en coin haut-droit (senior) + pastille verrou marron en coin bas-droit (groupe fermé) + bordure spéciale dorée/marron autour de l'avatar + glow box-shadow assorti. Le wrapper relatif n'est créé que si au moins un badge est présent (compat flex layout). (3) Checkbox "55+ ans" dans vEmps édition passe du rouge au doré. (4) Liste vEmps : badge F (🔒) ajouté à côté du badge senior. |
| v9.44 | **Topbar compact + chat plus lisible**. (1) **Topbar refactoré** : titre "CMC Teams v9.44" sur une ligne avec ellipsis, sous-titre "Casino de Monaco" plus petit (11px au lieu de 12px, letter-spacing 1.5px au lieu de 3px), badge ADM compact (3 lettres), nom/ID user retirés (avatar suffit), bouton sync condensé en dot 10px avec tooltip. Tout tient maintenant sur une ligne même sur iPhone SE 375px. (2) **Bulles chat éclaircies** : `.msg-me` passe à gradient doré vif (rgba 220,170,40,.85 → 180,130,20,.78) avec texte sombre #0a1408 pour contraste max. `.msg-ot` devient blanc laiteux (rgba 245,250,240,.96 → 225,238,220,.93) avec texte sombre #0a1a0c. `.msg-dm` violet éclairci (rgba 170,130,230,.88) avec texte blanc. Lisibilité parfaite sur tout fond de photo. (3) **Règles CSS adaptatives** : `.msg-ot .msg-ts`, `.msg-ot .msg-name`, `.msg-ot .msg-reply-q`, `.msg-ot .chat-act-btn` forcés en couleurs sombres sur bulles claires. (4) **Filtres chat visibles** : boutons Tous/Publics/Privés passent de color #4a6840 (invisible) à #d8e8c8 + background rgba(0,0,0,.35) + border rgba(201,162,39,.3) + backdrop-filter blur. État actif en #ffdc40. Bouton Vider 🗑 rouge visible. Bouton recherche 🔍 avec background + bordure. (5) **Header Chat Casino** : couleur passe de #c9a227 à #ffdc40 + text-shadow. "X messages • Casino de Monte-Carlo" passe de rgba(.25) à rgba(.75) + text-shadow. (6) **Chat datesep** : "— Aujourd'hui —" encapsulé dans pilule background rgba(0,0,0,.35) + blur pour lisibilité sur fond photo. |
| v9.45 | **Session expert 3 rôles** — ajouts massifs en une session. **Rôle Planning** : (1) `duplicateMonthFromPrev()` duplique le planning du mois M-1 vers le mois courant avec confirmation. (2) `detectRepoConflicts(y,m)` détecte 3 types d'alertes (repos insuffisant, 7+ jours consécutifs, données manquantes) avec 3 niveaux (critical/high/info). (3) `vRepoConflicts()` nouvelle vue admin groupée par sévérité avec bouton "Voir" vers fiche employé. (4) **Dashboard RH** dans vAccueil admin : 6 KPIs jour courant (en service, repos, congés, malades, formation, actifs) + bandeau alerte conflits cliquable. Helper `_hrKpi()`. (5) `calcStats` enrichi avec `nuits`, `coupures`, `weekEnds` pour équilibrage shifts difficiles. (6) `renderStatsCard` affiche nouveau bloc "🌙 Shifts difficiles". (7) 2 nouvelles entrées admin items + route `conflits` dans vMain. **Rôle Designer** : (1) `:root` tokens CSS complets (palette Monaco, --sp-0 à --sp-10 spacing, --r-sm à --r-full radius, --sh shadows, --t timings, --fs typography scale). (2) Classes utility `.h1/.h2/.h3/.h4`, `.txt-sm/.txt-xs/.txt-mono/.txt-upper`. (3) Badge system `.badge` + variantes gold/green/red/blue/violet/muted. (4) Empty states `.empty/.empty-icon/.empty-title/.empty-sub/.empty-cta`. (5) Skeleton loading `.skel/.skel-line/.skel-circle` avec animation shimmer. **Rôle IT (sécurité)** : (1) **Meta CSP restrictive** (default-src self, script-src +cdnjs, img-src data:, connect-src firebase/anthropic/emailjs, object-src none, base-uri self, form-action none). (2) PDF.js `crossorigin="anonymous"` + `referrerpolicy="no-referrer"`. (3) Metas complémentaires : color-scheme dark, format-detection, robots noindex, referrer no-referrer, description. (4) **Error boundary renforcé** : fonction `_showErr` centralisée avec `_escHtml`, compteur `_errCount` max 3 avant reload auto, log dans `cmc_last_err` (5 derniers), bouton "Reset complet" qui vide localStorage, `role="alert"` + `aria-live="assertive"`, `<details>` pour stack trace, aria-labels sur boutons. (5) **`unhandledrejection` handler** global pour catch Promise rejections non gérées. |
| v9.46 | Hot-patch audit v9.45 — 3 mineurs + 1 UX corrigés. (1) **Cache memoization `detectRepoConflicts`** : évite ~23K ops/render en cachant le résultat par clé `(y,m,emp_count,JSON_signature_length)`. La signature JSON change à toute modification des overrides → auto-invalidation sans tracking explicite. (2) **`gpl(y,m)` accepte params optionnels** : refactor propre au lieu de l'IIFE qui mutait temporairement `A.year`/`A.month` (race condition potentielle). Backward compat : `gpl()` sans args utilise toujours A.year/A.month. (3) **`vRepoConflicts` guard** : si non-admin → `sv("accueil")` au lieu de retourner page vide silencieuse. (4) **Vérifié** : pas de conflit CSS avec les nouvelles classes `.h1/.h2/.h3/.h4` — aucun élément existant ne les utilisait. Audit passe à **SAFE_TO_RELEASE clean**. |
| v9.47 | **Pas à pas batch 1 — 3 outils planning expert**. (1) **`renderEmpHistory(empId)`** : nouveau bloc "📜 Historique des modifications" dans la fiche employé édition admin. Affiche les 30 dernières entrées de `cmc_audit` filtrées par `eid`, avec labels humains (emp_create→"➕ Créé", pw_set→"🔐 MDP", etc.), date format FR, old→new change visible. Scroll interne max-height 240px. (2) **`exportPlanningCSV` enrichi pour la paie** : passe de 6 colonnes + jours à **20 colonnes + jours** — Matricule / Nom / Équipe / Famille / Groupe contractuel / Rôle / Jours / Jours_Travail / Heures_Total / Jours_Repos / RH / R / CP / M / AF / RRT / HC / CDP / Nuits / Coupures / Week_Ends / Autre. Toast indique le nombre de colonnes. Échappement CSV-safe (wrap + guillemets doublés). Audit log ajouté. Nom de fichier : `planning-paie-{mois}-{année}.csv`. (3) **`vQuiEstLibre()`** : nouvelle vue admin "🔵 Qui est libre ?" avec sélecteur de jour (mini-calendrier cliquable + boutons ◀ ▶), 6 KPIs (en service/repos/congés/malades/formation/non défini), liste détaillée des employés hors service groupée par catégorie avec avatar + équipe + code, détails collapsible des employés en service, empty state si tout le monde bosse. Route `quilibre` dans vMain. Entrée admin "😴 Qui est libre ? (par jour)". |
| v9.48 | **Pas à pas batch 2 — Designer refinements & accessibilité**. (1) **Focus-visible accessibilité** : outline or (#ffdc40) avec glow uniquement au clavier (pas au clic souris) — respecte `:focus-visible` standard. Inputs/selects/textareas avec outline + box-shadow assortis. (2) **Skip link** `.skip-link` caché par défaut, visible au premier tab pour navigation clavier. (3) **`prefers-reduced-motion`** : désactive toutes les animations/transitions si l'utilisateur a activé le mode réduction mouvements (iOS/macOS accessibility). Inclut le carousel chat. (4) **`.sr-only`** classe utility pour labels screen reader uniquement (WCAG). (5) **Transitions fluides entre vues** : `#content` a maintenant une animation `contentFade` de 0.28s à chaque changement de vue (opacity + translateY). (6) **Tablet breakpoint 768px** : contenu centré avec `max-width:900px`, padding `.page` augmenté à 24px 28px, nav centrée. (7) **Desktop breakpoint 1024px** : max-width 1100px. (8) **Safe-area iOS renforcé** : `#content` a maintenant `padding-left/right:max(0,env(safe-area-inset-left/right))` via `@supports`. |
| v9.49 | **Pas à pas batch 3 — Lisibilité priorité + IT sécurité/perf**. Demande utilisateur : "Malgré que je veuille de la transparence pour les photos la priorité est aux informations. Bien visible." (1) **Cards opacité renforcée** : `.card` passe de rgba(.55,.62) à rgba(.82,.88) + backdrop-filter blur(14px) + shadow plus fort. Lecture des infos largement prioritaire sur la photo de fond qui reste visible par transparence. (2) **Topbar** : bg rgba(.85)→(.92), border or .35→.45. **Nav bas** : idem (.88→.94). (3) **Sec-title & sec-sub** : ajout text-shadow 0 1px 3px rgba(0,0,0,.6) pour lisibilité max sur fond photo. (4) **Tables planning/départs** : headers `.sth/.dth/.stth` passent de bg #223a26 opaque à rgba(18,32,22,.96) avec text-shadow. Border or passe de .3 à .4. Noms employés (`.ntd`) en rgba(16,30,20,.95). (5) **Aria-label** sur bouton logout topbar. (6) **Lazy-load PDF.js** : nouveau `loadPdfJs()` qui charge le script cdnjs UNIQUEMENT quand l'admin importe un PDF (avant, 500 KB chargés au démarrage pour tous). Gain perf chargement initial ~500 KB. `_extractPdfLines` refactorisé pour appeler `loadPdfJs().then(_doExtractPdfLines)`. Message toast "⏳ Chargement de PDF.js…". |
| v9.50-v9.57 | Batchs intermédiaires : département Jeux de table + fonds perso par employé (v9.50), diaporama fond d'écran (v9.51), fix cadena/œil vEmps + BACCARA import (v9.52), Phase 2 experts templates/solde CP/retardataires (v9.53), calendrier d'affluence Casino (v9.54), export ICS par équipe + toast ARIA (v9.55), hot-patch audit import BACCARA regex + apostrophes (v9.56), hot-patch XSS vAuditLog + guard calcLeaveBalance (v9.57). Voir git log pour le détail complet des commits. |
| **v9.58** | **Accès par employé + hot-fix scintillement import**. (1) **Store `A.access`** `{uid: {mode, blocked}}` sync Firebase via `cmc_access` (FB_FIX). Modes : `auto` (détection automatique) / `general` (force vue générale) / `personal` (force vue perso). Features blocables : `monPlanning`, `echanges`, `ics`. (2) **Helpers** : `getUserAccess()`, `isUserFloating(u,y,m)` (détecte user flottant via : override admin → team invalide/absente → u.visitor → pas dans le planning importé), `isFeatureBlocked(uid,feat)`, `setUserAccess(uid,mode,blocked)` (guard AID + audit log `access_change`). (3) **Fix critique `vDeparts`** : pour un non-admin avec `team="?"`, `show` était vide → page blanche. Désormais `show = (isAdm \|\| _isFloating) ? _depPri.concat(_depRest) : _depPri.slice()` + bandeau "Vue générale". (4) **Adaptations vues** : `vMonPlanning` (carte bienvenue + boutons vers vue générale si flottant, message "Accès restreint" si `monPlanning` bloqué, masquage bouton ICS si bloqué), `vAccueil` (masque "Mon Service" si flottant — utilise `_isFloating` au lieu de `u.visitor\|\|u.team==="?"`), `vPlan` (bandeau "Vue générale" + `utid=null` si team invalide). (5) **Modale admin `🔐 Accès`** : `renderAccessModal()` (radio modes + checkboxes features) injecté via `accessModalWrap` dans `render()`/`dc()`. Bouton dans `vPasswords` + badge 🔐 sur cartes avec accès personnalisé. (6) **`dcDebounced()` via requestAnimationFrame** : batch les `dc()` en rafale lors du SSE Firebase (fin du scintillement CSS `fadeIn` qui se rejouait à chaque update). Utilisé dans `fbApplyData` et storage listener. (7) **`_importInProgress` + `_importPending` + `_flushImportPending()`** : pendant `doImport()`, les `fbWrite()` sont bufferisés (1 entrée par clé, dernière valeur gagnante) et flushés une seule fois en fin d'import. Élimine les ~200 allers-retours SSE pendant l'import + les écritures concurrentes qui déstabilisaient le parsing. |
| **v9.59** | **Fix fond perso cas par cas + flèche retour globale + ajout Three Card Poker**. (1) **Bug fond perso** : `_collectBgPhotos()` ajoutait le fond perso employé ET les fonds globaux → diaporama mélangé. Fix : si l'employé a un `customBg` dans `A.reg[uid].customBg`, `return photos` immédiat → l'employé voit UNIQUEMENT son fond, pas de rotation avec les globaux. (2) **Flèche retour globale** : nouveau stack `_viewHistory` + fonction `goBack()`. `sv(v)` push la vue courante dans l'historique avant de changer (sauf si `_goingBack=true`). Flèche ← ajoutée dans `vTopbar()` à gauche du titre, visible seulement si `A.view!=="accueil"` et `_viewHistory.length>0`. Permet de quitter n'importe quelle page vers la précédente, plus besoin de forcer retour admin. Limite à 30 entrées pour éviter leak mémoire. (3) **Three Card Poker** ajouté à `JEUX.tcp` avec code compétence `3`, catégorie poker, règles résumées + mises Ante/Play/Pair Plus + paiements Ante Bonus et Pair Plus. |
| **v9.60** | **Partage par dossier + fix mdp clair perdu au sync + logs connexion enrichis**. (1) **Partage par catégorie** : nouveau store `A.docCatShared = {catId: bool}` sync Firebase via `cmc_doc_cats_shared` (FB_FIX). Helper `isDocShared(d)` = `!!d.shared \|\| !!A.docCatShared[d.cat]`. `toggleDocCatShared(catId)` avec guard AID + audit log `doc_cat_shared_toggle`. Nouveau panneau vDocs "Partage par dossier" avec un bouton toggle 🔒/👥 par catégorie (8 catégories : photos, règlements, procédures, contrats, notes, formations, plans, autres). vPartage inclut maintenant TOUS les docs des catégories partagées (pas seulement ceux avec `shared: true`). (2) **Fix mdp en clair perdu au sync Firebase** : `fbWrite("cmc_pw", ...)` strip le champ `clear` avant envoi Firebase (bien pour sécu), mais `fbApplyData("cmc_pw", vc)` faisait `A.passwords=vc` → écrasait le `clear` local après chaque resync → vPasswords n'affichait plus les mdp. Fix : merge dans fbApplyData qui préserve `clear` local si existant et absent dans la version Firebase. (3) **Logs connexion enrichis v9.60** : `logUserLogin` détecte maintenant **browser** (Chrome/Edge/Firefox/Safari/Opera) et **OS** (iOS/Android/Windows/macOS/Linux) depuis UA, et récupère **géolocalisation** via `https://ipwho.is/` (HTTPS gratuit sans clé) — ajoute city, region, country, isp. Fallback sur `api.ipify.org` si ipwho.is échoue. CSP `connect-src` étendue avec `https://ipwho.is` et `https://api.ipify.org`. Affichage vOnline enrichi avec 📍 lieu, 📡 ISP, 💻 navigateur+OS, 🕐 timezone. |
| **v9.61** | **Hot-fix audit indépendant v9.58→v9.60**. Subagent Explore audit a trouvé 2 P0 + 1 P2 : (1) **P0 critique `fbApplyData("cmc_pw")` merge `clear` incorrect** : si admin change mdp via un autre appareil, Firebase envoie `{h:nouveau}` sans `clear`, le merge préservait l'ancien `clear` local → vPasswords affichait l'ancien mdp alors que le vrai est le nouveau. **Fix** : ne préserver `clear` que si le hash distant est identique au hash local (`loc.h === _merged[uid].h`). Sinon, abandonner le clear local (obsolète). (2) **P0 mineur `_dcPending` stuck après exception import** : en cas d'erreur pendant import + rafale SSE concurrente, `_dcPending` pouvait rester à `true` → dc() ne se rejouait plus. **Fix** : reset `_dcPending=false` dans le catch de `doImport` + `setTimeout(dc, 0)` de sécurité. (3) **P2 timeout explicite 5s sur `ipwho.is`** via `AbortController` : sans timeout, fetch pouvait bloquer ~90s avant fallback `ipify`, échouant la condition `Date.now()-last.ts<60000`. Fallback aussi timeouté à 5s. |
| **v9.65** | **Cadre légal monégasque + améliorations IA**. (1) Constantes `LOI_1103` (23 articles en 5 sections : monopole SBM, agrément personnel, interdictions, sanctions pénales, contrôle), `OS_8929` (21 jeux autorisés dont Roulette Monte-Carlo 39 cases), `AM_88_384` (5 chapitres, 21 amendements : mises, jetons, cartes neuves, commissaire, redistribution slots 85%, recettes). Helper `searchLoi(query)`. (2) vConvention nouvel onglet "⚖️ Loi" avec 3 sous-onglets : Loi 1.103 (articles par section), OS 8.929 (grille 21 jeux autorisés), AM 88-384 (chapitres + articles + liste amendements). (3) 2 outils IA supplémentaires : `search_legislation` + `get_authorized_games`. Total outils IA : 30 (25 lecture + 5 admin). (4) Prompts IA enrichis : 16 suggestions contextuelles couvrant planning, stats, jeux, lieux, convention, loi, repos, solde CP. (5) buildIASystemPrompt enrichi : bloc cadre légal (Loi 1.103 résumé + OS 8.929 nb jeux + AM 88-384 points clés). |
| **v9.64** | **JEUX_SBM (règles Formation SBM 2016) + vConvention Jeux enrichi + 2 outils IA supplémentaires**. (1) Constante `JEUX_SBM` : 6 jeux détaillés (BJ, RA, Craps, PB, THU, TCP) avec sections pédagogiques complètes, tableaux de tirage (Punto Banco), rapports de paiement (Roulette), paiements Trips/Blind (THU), paiements Ante Bonus/Pair Plus (TCP), lexique poker, procédures croupier TCP (7 sections : tables avec/sans sabot, déroulement main, change, floorman, fausse donne, ordre paiements), hippodrome + annonces (Roulette). Source : 6 documents Formation Jeux SBM mars-nov 2016. Helper `searchJeuxSBM(query)`. (2) vConvention onglet Jeux enrichi : toggle "⚡ Express" (JEUX résumé) / "🎓 Formation SBM" (JEUX_SBM détaillé). Si un jeu a des données SBM, les 2 onglets sont affichés. Le mode SBM montre les sections, rapports, tableaux, lexique, procédures avec mise en forme riche. (3) 2 nouveaux outils IA : `get_game_rules_sbm` (règles complètes Formation SBM d'un jeu) + `search_game_rules` (recherche par mot-clé dans les règles SBM). Total outils IA : 28 (23 lecture + 5 admin). |
| **v9.63** | **Tool use IA custom — 26 outils (21 lecture + 5 admin)**. L'IA Claude API intégrée peut interroger et agir sur TOUTE l'app en temps réel. Constante `IA_TOOLS[]` (26 outils avec JSON schema). Fonction `_iaExecuteTool(name, input)` exécute localement. `callClaudeIA._doFetch` enrichi : route les tool_use custom vers l'exécuteur local + Anthropic web_search. Prompt système enrichi bloc "TES OUTILS" listant les 26 capacités + règles (toujours utiliser, jamais deviner). **Outils lecture (21)** : get_planning, search_employees, get_employee_info, get_stats, get_today_status, find_game_rooms, search_convention, get_team_roster, get_conflicts, get_upload_requests, get_who_is_free, get_leave_balance, get_all_teams, get_audit_log, get_online_users, get_monthly_summary, get_game_rules, get_salary_grid, get_absences, get_rotation_rules, get_documents. **Outils admin (5, guard AID)** : set_planning_code, set_employee_team, admin_set_employee_field, admin_validate_upload, admin_reject_upload. Chaque tool call loggé via `_audit("ia_tool", ...)`. Sécurité : non-admin reçoivent "⛔ INTERDIT" si tentative de modification. |
| **v9.62** | **Grosse version multi-axe : IA enrichie + sécurité + galerie salons + upload modéré + plans architecturaux + iOS fix + bulles chat**. (1) **Bulles chat quasi-transparentes** : fond rgba .09-.22 au lieu de .85-.96 + backdrop-filter blur 18px + text-shadow puissant (0 1px 2px rgba(0,0,0,.9)) + font-weight 600-800 + couleurs nom distinctives (moi doré #ffdc40 / autre vert #a0e080 / DM violet #d0a0ff). Photo de fond visible sans sacrifier la lisibilité. Boutons action chat toujours visibles (pas hover-only, fond rgba(0,0,0,.28) + border), date separator amélioré. (2) **Fix iOS auto-zoom** : `@media (pointer:coarse)` force font-size 16px sur tous les inputs des devices tactiles. Chat-bar .inp et chatSearchIn passés à 16px. Résout le zoom auto iOS Safari. (3) **CSP élargie** : img-src autorise `asset.montecarlosbm.com`, `commons.wikimedia.org`, `upload.wikimedia.org` pour la galerie photos. (4) **Upload modéré complet** : employés soumettent via `employeeProposeUpload()` dans vPartage → demande status "pending" → alerte admin (notif navigateur + toast + badge compteur vAdmin) → admin valide `adminValidateUpload()` (crée doc réel) ou rejette `adminRejectUpload()` (avec raison). Toggle global `setUploadEnabled()` on/off. Store `A.uploadRequests` + `A.uploadEnabled` sync Firebase (FB_FIX). Vue `vUploadRequests()` (compteurs + cards pending/archive + boutons). Route `uploadreq`. Audit complet (upload_request/approved/rejected/toggle). (5) **PLANS_CMC + PLANS_CDP** : constantes architecturales complètes. CMC : 9 salles (Renaissance, Atrium, Europe, Amériques, Blanche, Médecin, Touzet, Super Privés) + 6 annexes + historique + architectes + dress codes. CDP : 4 zones (principale, Electronic Gaming, 2 terrasses) + chiffres (640 machines, 18 postes roulette élec, jackpot 1M€) + niveaux bâtiment. Helper `findSallesPourJeu(jid, etab)`. (6) **buildIASystemPrompt enrichi** : injection PLANS complets (CMC + CDP + différences clés) + règles upload modéré + règles modification (admin-only) + alerte pending uploads. `max_tokens` 1024→4096. (7) **vConvention nouvel onglet "🏛️ Lieux"** : 3 sous-onglets CMC (9 salles extensibles), CDP (4 zones + chiffres + niveaux), Comparer (tableau side-by-side). (8) **Galerie 75 photos salons** : constante `SALON_PHOTOS` (75 photos SBM officiel + Wikimedia CC + archives Rijksmuseum/LOC), helpers URL `_wcUrl/_sbmUrl/_sbm2Url/_sbm3Url/_sbm4Url`, vue `vGalerie()` (grille responsive 240px, filtres étab/source/salon, recherche texte, lazy loading, lightbox clavier ← → Esc, compteur, fallback erreur). Route `galerie`. Raccourci accueil. (9) **15 tests unitaires ajoutés** : isUploadEnabled, countPendingUploads, findSallesPourJeu, SALON_PHOTOS catalogue, PLANS_CMC/CDP, _safeUrl, isDocShared, empLabel senior, esc null-safe. |
| v9.67 | **Version majeure — 35+ fonctionnalités ajoutées en une session**. CORRECTIONS : fix email OTP (toast honnête + config EmailJS), fix REVOLLON (CP j16-26 + AF j27-30), fix IA (type:custom supprimé + calcStats scope + 6 nouveaux outils = 36 total), fix clignotement (anti-boucle dc + _fbInitialLoad), fix transparence (48 backgrounds opaques → semi-transparents + fix flash), fix iOS zoom (double protection), fix import (matching renforcé + validation post-import 5 règles). SÉCURITÉ : TTL heartbeat 2min, fbApplyData validation type, delEmp nettoyage complet, rate-limiting mots de passe, indicateur force mdp inscription. FONCTIONNALITÉS : splash screen, Firebase différé, auto-save fiches (onblur 9 champs), admin édite tous champs, CODE_HOURS complet, calendrier enrichi (couleurs + horaires clairs), solde CP (barre progression accueil + planning), notifications précises (jour + ancien→nouveau), dashboard RH (absentéisme + présence + CP/équipe + courbe 12 mois SVG), TTS lecture vocale, micro dictée (STT), compte visiteur U007, compteur connexions/vues, likes documents, mode offline (SW stale-while-revalidate), thèmes visuels (Casino/Clair/Nuit), export PDF planning, modèles planning (templates), multi-langues FR/EN/IT, recherche universelle (topbar), swipe mois (geste tactile), animations micro-interactions, admin réorganisé (7 catégories), PWA installable (manifest.json + icône), demandes employés (congé/échange/modification), mode présentation (plein écran), donut SVG stats, favoris collègues, cartes intelligentes accueil, timer shift live, raccourcis clavier, IA locale enrichie (jeux/convention/congés/rotation/lieux), ressources intégrées vDocs, script anti-régression (.github/scripts/verify-build.sh). AUDIT : 23/23 PASS. |

---

## Convention Collective Jeux de Table SBM (référence officielle)

> 📖 Document de référence intégré depuis v9.29 — consultable via `CONVENTION` et `BULLETIN_CODES` dans le code.
> Source : Convention Collective du 1er avril 2015 + Note 6 janvier 1993 (B. Lées).
> À utiliser pour répondre aux questions employés (chat, IA) et pour la gestion RH.

### Articles clés (voir `CONVENTION.articles`)

| Article | Sujet | Règle principale |
|---------|-------|------------------|
| **4** | Recrutement | Âge minimum **21 ans** |
| **5** | Écoles de jeux | 5 écoles premium sur 9 ans, min 1 an entre deux |
| **6** | Contrat | Contrat initial **12 mois**, essai **3 mois**, CDI à 18 mois |
| **10** | Carrière employés | Niveaux 1-7 selon jeux validés (Niv 7 = Expert tous jeux) |
| **11** | Promotions | Expert → Chef → Inspecteur → Sous-dir → Directeur |
| **13** | Rémunération | 3 parties : fixe (+200€/niveau) + %CA + %cagnottes. Min garanti 10,85 mois |
| **17.4** | Congés | **2 mois/an** : 1 mois été (1 mai-31 oct) + 1 mois hiver, 4 sem consécutives min |
| **17.5** | Repos hebdo | Min 1j, normalement 2j consécutifs, min 10j/6 sem. Majoration 50% si >4j supprimés |
| **17.6** | Forte affluence | Juillet-août, 16 déc-15 janv, Grand Prix, Pâques. Planning publié vendredi <12h |
| **17.8** | Pauses | **55+ et femmes enceintes : pause toutes 40 min** (au lieu de 60) |
| **18** | Congés familiaux | Mariage 4j · Naissance 3j · Décès proche 3j · Mariage enfant 2j · Décès beau-parent 1j |
| **23** | Maladie | Indemnisation 85% (min 91%), max **1095 jours** |
| **26** | Retraite | 10 ans=½ mois · 15 ans=1 mois · 20 ans=1,5 mois · 30 ans=2 mois. Groupe fermé=3 mois |
| **35** | Effectifs | Chefs de table = **25-30%** de l'effectif employés |

### Codes d'activité bulletins paie (voir `BULLETIN_CODES`)

Source : Note SBM du 6 janvier 1993 (Bernard Lées, DAJS).

| Catégorie | Codes principaux |
|-----------|------------------|
| **Présence/Repos** | P, RH, RTP, RTR, RRT, RHS, DP |
| **Congés Payés** | CP, CRH, CPS, CPM, CDP, CDH |
| **Fêtes Légales** | FL, CFL, FTP, FTR, RFT |
| **À la masse** | FCP, FCS, FRH, FFL |
| **Absences** | M, AT, MT, ABS, ABI, ABP, AF, CL, CEO, CSC, CSS |
| **Sanctions** | PNE, AMP, MPC, MPP |
| **Autres** | PAT, PRT, HC |

### Grilles de rémunération (Annexe 1 — nouveaux entrants)

| Niveau | Poste | Salaire/mois | %CA | %Cag |
|--------|-------|--------------|-----|------|
| 1 | Employé 1 jeu | 2 300 € | 0,003% | 0,06% |
| 7 | Expert (tous jeux) | 6 113 € | 0,012% | 0,24% |
| 9/1 | Sous-chef table | 6 460 € | 0,0135% | 0,27% |
| 11/1 | Chef de table | 7 000 € | 0,015% | 0,30% |

Cadres (Annexe 2) : Inspecteur 8 295-8 710 €, Sous-directeur 10 452 €.

### Accès dans l'app
- Vue `vConvention` (tous employés) — onglet 📖 Convention depuis l'Accueil
- 4 tabs : Articles / Codes paie / Grilles / Recherche
- Référence injectée dans le contexte IA (`buildIASystemPrompt`) → Claude peut citer les articles
- Helper `conventionSearch(q)`, `conventionCongeJours(evt)`, `bulletinCodeLabel(code)`, `bulletinAllCodes()`

### Utilisation par Claude Code (moi-même)
Quand tu me demandes une info RH, congés, promotion, salaire, etc. → je dois chercher dans ces données en priorité avant de répondre.

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
var APP_VER  = "v9.14";
var SESSION_TTL = 8 * 60 * 60 * 1000; // 8h
var FB_DEFAULT = "https://cmcteams-c16ab-default-rtdb.europe-west1.firebasedatabase.app";
```

---

## Workflow expert — Développement CMCteams

> Procédure obligatoire pour chaque modification. Conçu pour une SPA monofichier casino avec 258 employés, sync Firebase temps réel, et contraintes mobiles.

### Phase 0 — Prise de contexte (avant tout code)

1. **Lire le CLAUDE.md** : vérifier APP_VER, DATA_VER, erreurs connues (#1–#20)
2. **Identifier la demande** : UI ? Logique métier ? Import ? Sécurité ? Firebase ?
3. **Cartographier l'impact** : quelles fonctions/vues sont touchées ?

```
Matrice d'impact rapide :
┌─────────────────┬──────────────────────────────────────────────┐
│ Zone modifiée   │ Vues à vérifier                              │
├─────────────────┼──────────────────────────────────────────────┤
│ A.employees     │ vEmps, vPlan, vDeparts, vAccueil, vStats     │
│ A.overrides     │ vPlan, vDeparts, vMonPlanning, vAccueil       │
│ A.reg           │ vMonProfil, vEmps, vPasswords                 │
│ A.passwords     │ vPasswords, vLogin                            │
│ A.chatMsgs      │ vChat                                        │
│ A.exchanges     │ vEchanges, vMonPlanning                       │
│ CHEFS_T / CI    │ vDeparts, calcDepPos                          │
│ CSS / Layout    │ vPlan, vDeparts, vMonPlanning (mobile!)       │
│ Firebase sync   │ fbWrite, fbApplyData, SSE listener            │
│ Navigation      │ render(), dc(), sv(), topbar                  │
│ Import PDF      │ doImport, vImport, importSuggestions           │
│ Sécurité        │ vLogin, admin guards, esc(), hashPwStrong()   │
└─────────────────┴──────────────────────────────────────────────┘
```

### Phase 1 — Analyse du code existant

1. **Lire les fonctions concernées** en entier (pas de modification à l'aveugle)
2. **Tracer le flux de données** : d'où vient la donnée → où elle est affichée
3. **Vérifier les dépendances** : `dc()` re-rend tout → un changement dans `vDeparts` peut affecter le scroll `adjDeparts()`
4. **Chercher les patterns similaires** : si on modifie une colonne dans vDeparts, vérifier vPlan aussi

### Phase 2 — Codage (règles strictes)

#### Sécurité (non-négociable)
- [ ] `esc()` sur TOUTE donnée utilisateur avant `innerHTML`
- [ ] Guard `if(!A.user||A.user.id!==AID)return;` sur fonctions admin destructrices
- [ ] `e.message.replace(/</g,"&lt;")` dans les handlers d'erreur (pas d'accès à `esc`)
- [ ] Pas de données sensibles en clair (clé API, PIN, mots de passe)

#### Layout & CSS
- [ ] Jamais `table-layout:fixed` dans un conteneur scrollable (#1)
- [ ] Jamais `overflow:hidden` sur parent d'enfant scrollable (#2)
- [ ] Jamais `overflow-y:hidden` sur parent de colonne sticky (#10)
- [ ] Jamais `width:100%` sur table scrollable → `width:auto` (#11)
- [ ] Jamais `max-width` sur `<td>` → wrapper `<div class="nw">` (#18)
- [ ] Tester scroll horizontal (vPlan/vDeparts) sur viewport 375px (iPhone SE)

#### Données & État
- [ ] `gpl()` = seule source de vérité (pas de fallback genBase) (#3)
- [ ] Ne jamais utiliser `base=0` dans calcDepPos → utiliser `ei` (#13)
- [ ] Rafraîchir `A.user`/`_viewAs` après remplacement `A.employees` par SSE (#16)
- [ ] Ne jamais utiliser une variable locale d'une autre vue (#20)
- [ ] `searchInput()` pour les champs de recherche (pas `oninput→dc()`) (#9)

#### Firebase
- [ ] Clés `FB_LOCAL` ne doivent JAMAIS être synchronisées
- [ ] `fbApplyData` doit cloner en profondeur (pas de référence partagée)
- [ ] `fbWrite` avec retry + queue offline en cas d'échec

#### Navigation & UX
- [ ] Max 8 onglets nav (mobile) (#14)
- [ ] `chatSetReply` doit auto-activer `_chatDm` pour les DM (#19)
- [ ] Notifications : vérifier `typeof Notification !== "undefined"` (iOS) (#15)

### Phase 3 — Validation (OBLIGATOIRE avant CHAQUE commit)

> ⚠️ **RÈGLE ABSOLUE** : Ne JAMAIS pousser sans avoir vérifié soi-même.
> Après CHAQUE modification, AVANT de commit :
> 1. Valider la syntaxe JS
> 2. Vérifier que la modification n'a PAS cassé les fonctions existantes
> 3. Simuler le rendu HTML généré pour les vues affectées
> 4. Comparer avec l'état précédent (git diff) pour détecter les régressions
> 5. Si modification CSS/layout : calculer les dimensions (largeurs colonnes vs contenu)
> 6. Ne JAMAIS enchaîner plusieurs commits de "fix" sans vérification — c'est signe de travail bâclé

```bash
# 1. Syntaxe JS (obligatoire avant commit)
node -e "
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const s=html.lastIndexOf('<script>'),e=html.lastIndexOf('</script>');
fs.writeFileSync('/tmp/test.js',html.slice(s+8,e));
" && node --check /tmp/test.js && echo "✅ JS OK"

# 2. Taille fichier (surveillance dérive)
wc -c index.html  # Attendu : ~440-540 KB

# 3. Recherche oublis sécurité
grep -n 'innerHTML' index.html | grep -v 'esc(' | head -20

# 4. Diff avec état précédent (vérifier régressions)
git diff --stat HEAD

# 5. Si modif layout : vérifier que les vues non-modifiées restent intactes
# Comparer les fonctions vPlan/vDeparts/vMonPlanning avec le dernier commit stable
```

### Règle anti-régression

> **INTERDIT** de modifier une vue (vPlan, vDeparts, etc.) sans vérifier que les AUTRES vues
> ne sont pas affectées. Utiliser la matrice d'impact Phase 0.
> Si un changement CSS affecte `.sth`, `.ntd`, `.ctd`, `.dth` → vérifier vPlan ET vDeparts.
> Si un changement touche `A.employees` → vérifier vEmps, vPlan, vDeparts, vAccueil, vStats.
> Un commit qui casse une fonction existante = travail à refaire entièrement.

#### Checklist de validation par type de changement

| Type | Vérifications |
|------|--------------|
| **UI/CSS** | Scroll OK ? Sticky OK ? Mobile 375px ? Noms lisibles ? |
| **Logique métier** | Rotation correcte ? Senior ★ respecté ? Tous les 258 emp ? |
| **Import** | Compétences BRTPECK ? newEmps/possibleRetired détectés ? |
| **Firebase** | fbWrite appelé ? SSE listener reçoit ? Queue offline ? |
| **Sécurité** | esc() partout ? Guards admin ? XSS dans erreurs ? |
| **Chat** | DM privé reste privé ? Reply correct ? Filtres admin ? |

### Phase 4 — Versionnement & Commit

1. **Bumper `APP_VER`** : format `vX.Y` (X = majeur, Y = incrémental)
   - Nouveau module/vue → bump X
   - Fix/amélioration → bump Y
2. **Ne PAS bumper `DATA_VER`** sauf si schéma `DEF_EMP`/`DEF_TEAMS` change
3. **Commit** : `vX.Y: description en français`
4. **Mettre à jour CLAUDE.md** : historique versions + constantes si changement

### Phase 5 — Déploiement

```
Branche feature → commit → push → PR (si demandé) → merge main → GitHub Pages auto
```

- Jamais de push direct sur `main`
- Un commit = un changement cohérent (pas de méga-commits multi-fonctions — erreur #17)
- Vérifier le déploiement GitHub Pages après merge

### Phase 5b — Vérification post-rebase/merge (OBLIGATOIRE — erreur #21)

> ⚠️ Un rebase peut PERDRE SILENCIEUSEMENT du code. Après TOUT rebase ou merge avec conflits :

```bash
# 1. Zéro marqueurs de conflit
grep -c "^<<<<<<\|^======\|^>>>>>>" index.html CLAUDE.md sw.js

# 2. Syntaxe JS valide
node -e "..." && node --check /tmp/test.js

# 3. Vérifier CHAQUE feature ajoutée dans cette session
grep -c "mot_cle_unique_1" index.html  # Doit être > 0
grep -c "mot_cle_unique_2" index.html  # Doit être > 0
# ... pour CHAQUE ajout

# 4. Les 5 règles detectRepoConflicts
grep -o "horaire_dans_absence\|absence_longue\|repos_insuffisant\|max_jours_consec\|donnees_manquantes" index.html | sort -u | wc -l
# Doit retourner 5

# 5. Validation post-import
grep -c "_postConflicts" index.html  # Doit être > 0

# Si un grep retourne 0 → le code a été perdu → restaurer AVANT de push
```

---

### Arbres de décision rapides

#### "Où modifier ?" — Localisation du code

```
Demande concerne...
├── L'apparence → CSS embarqué (<style>) ou style inline dans la vue
├── Une vue spécifique → fonction vNomDeLaVue()
├── Le planning → gpl(), overrides, CODES
├── Les départs → vDeparts(), calcDepPos(), CHEFS_T, CI
├── L'import PDF → doImport(), parseur texte/PDF.js
├── Firebase → fbInit/fbWrite/fbApplyData/fbStartListening
├── Login/sécurité → vLogin*, hashPwStrong, verifyPw, guards AID
├── Un employé → A.employees, DEF_EMP, A.reg
└── Le chat → vChat(), chatSetDm/Reply/Del, _chatDm/_chatReply
```

#### "Faut-il bumper DATA_VER ?"

```
Modification de DEF_EMP (ajout/retrait employé) → OUI
Modification de DEF_TEAMS (ajout/retrait équipe) → OUI
Changement de schéma A.employees (nouveau champ) → OUI
Tout le reste (CSS, logique, vues, Firebase) → NON
```

#### "Cette modification casse-t-elle le mobile ?"

```
Colonne > 130px dans une table scrollable → RISQUE
Position sticky + overflow sur parent → RISQUE (iOS Safari)
Plus de 8 onglets nav → CASSE (#14)
Font-size < 11px → illisible sur mobile
Touch target < 44px → difficile à toucher
```
