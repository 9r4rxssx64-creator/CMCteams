# CLAUDE.md — CMCteams Codebase Guide

Guide pour assistants IA travaillant sur ce dépôt. Mis à jour après session v9.68.

---

## 🧰 Outils & réflexes expert (ajouté v9.68)

> Boîte à outils personnelle pour éviter les erreurs et travailler plus vite. À consulter en début de session.

### Outils d'analyse rapide

| Besoin | Outil à utiliser | Pourquoi |
|--------|-----------------|----------|
| Recherche keyword ciblée | `Grep` | Instantané, ne pollue pas le contexte |
| Fichier par nom/pattern | `Glob` | Plus rapide que `find` |
| Lecture partielle d'un gros fichier | `Read offset+limit` | Évite "token limit exceeded" sur index.html (1.1 MB) |
| Exploration ouverte multi-étapes | Subagent `Explore` | Délègue la lourdeur, rapport condensé |
| Plan avant gros chantier | Subagent `Plan` | Évite de refactorer à l'aveugle |
| **Audit parallèle** | **N subagents `Explore` en parallèle** sur zones distinctes | 4× plus rapide, contexte principal préservé |

### Outils d'écriture précise

| Action | Outil | Piège à éviter |
|--------|-------|---------------|
| Changer N lignes existantes | `Edit` (pas `Write`) | Un `Write` complet écrase tout |
| Rename global | `Edit replace_all:true` | Pas Bash+sed |
| Nouveau fichier | `Write` | Vérifier qu'il n'existe pas déjà avec `Glob` |
| Lot de modifs liées | Plusieurs `Edit` séquentiels | Pas un méga `Edit` fragile |

### Outils de validation systématique (à lancer APRÈS chaque batch)

```bash
# Syntaxe JS (OBLIGATOIRE avant commit — attrape 95% des erreurs)
node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');const s=h.lastIndexOf('<script>'),e=h.lastIndexOf('</script>');fs.writeFileSync('/tmp/t.js',h.slice(s+8,e));" && node --check /tmp/t.js && echo "✅ OK"

# Taille fichier (dérive suspecte si > 1.3 MB)
wc -c index.html

# XSS potentiels non échappés
grep -n 'innerHTML' index.html | grep -v 'esc(' | head -20

# Marqueurs de conflit oubliés
grep -c "^<<<<<<\|^======\|^>>>>>>" index.html CLAUDE.md

# Diff pour détecter régressions
git diff --stat HEAD
```

### Outils vidéo (ajouté v9.68 — `tools/video/`)

```bash
node tools/video/make-demo.js              # Pipeline complet MP4
node tools/video/make-demo.js --fast       # Durées réduites
node tools/video/make-demo.js --skip-capture # Sans Puppeteer
```

### Réflexes anti-erreur

1. **Avant de modifier une fonction** → la lire intégralement avec `Read`, pas juste ses extraits `Grep`
2. **Avant de toucher `index.html`** → checker `wc -c` avant/après (dérive = regression)
3. **Avant un rebase** → checklist post-rebase (règle #21 dans "Erreurs connues")
4. **Avant un commit** → 4 commandes de validation ci-dessus
5. **Si `prompt too long`** → utiliser subagent `Explore` pour la partie lourde, ou `Read offset+limit`
6. **Si un `Edit` échoue** → relire le fichier (il a pu être modifié par un linter entre-temps)
7. **Demande multi-étape** → TodoWrite immédiat, pas "je le ferai après"
8. **Nouveau module complexe** → subagent `Explore` pour audit indépendant une fois fini

### Stratégies qui ont marché

- **Parallélisme tool calls** : lancer 3-5 `Grep`/`Read`/`Bash` non dépendants dans un seul message → gain de vitesse énorme
- **Background bash (`run_in_background`)** pour les commandes longues (`npm install`, génération vidéo, apt), continuer en parallèle
- **Subagents en parallèle** pour auditer 4 zones du code simultanément → contexte principal reste propre
- **CHANGELOG.md séparé** : garder CLAUDE.md < 45 KB, sinon "prompt too long" récurrent

### Pièges connus (à ne JAMAIS refaire)

- ❌ Relancer 5× la même commande qui échoue sans diagnostiquer
- ❌ Écraser index.html avec `Write` pour "un petit changement" → toujours `Edit`
- ❌ Bash avec `;` dans un filtergraph ffmpeg non quoté → shell interprète
- ❌ Oublier `esc()` sur données user avant `innerHTML`
- ❌ Commit sans syntax check JS → casse l'app en production
- ❌ Remettre tout l'historique versions dans CLAUDE.md (déporter dans CHANGELOG.md)

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
6. **Taguer la demande** avec `[CATÉGORIE]` dans le `TodoWrite.content` : `[CHAT]`, `[PLANNING]`, `[IA]`, `[SÉCU]`, `[IMPORT]`, `[ADMIN]`, `[UX]`, `[PERF]`, `[DOC]`, `[META]` — pour pouvoir regrouper/prioriser
7. **Quand l'utilisateur envoie un message long avec plusieurs points** : décomposer en N todos distincts, un par point, même si c'est une question (marquer `[QUESTION]` et y répondre)
8. **Avant toute réponse finale** : relire la todo list et confirmer à l'utilisateur ce qui est fait/pending

Les `<system-reminder>` qui mentionnent "The user sent a new message while you were working" sont le signal OBLIGATOIRE de mettre à jour la roadmap avant de continuer.

**Anti-pattern à éviter** : enchaîner plusieurs actions sans mettre à jour la todo → oubli garanti quand le contexte se remplit. La todo est ton MÉMOIRE EXTERNE, utilise-la même pour les petits items.

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
- **Version actuelle :** `APP_VER = "v9.70"`, `DATA_VER = 30`
- **Stockage :** `localStorage` navigateur + **Firebase Realtime Database** (sync temps réel)
- **Effectif :** ~258 employés sur 10 équipes BJ + 13 équipes roulettes + 13 équipes CMC
- **Taille fichier :** ~1.10 MB (HTML + CSS + JS) — v9.67
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

## Historique versions récentes

> 📖 **Historique complet** dans `CHANGELOG.md` à la racine du dépôt (v8.83 → v9.67 archivé).

| Version | Changements |
|---------|-------------|
| **v9.70** | **Fixes responsive mobile complets**. Tests multi-devices Puppeteer (5 profils : iPhone SE, iPhone 14 Pro, Galaxy S22, Pixel 7, iPad Air). Fix nav bas #bnav : scroll-x interne, labels cachés < 420px (ne garde que les emojis), compact sur petits écrans. Fix overflow accueil (raccourcis `max-width:100vw`). Fix toolbars vIA, vChat header, vMonPlanning header : `flex-wrap:wrap`. Ajout `html,body{overflow-x:hidden;max-width:100vw}` en safety net. Résultat : **70 PASS / 0 FAIL** sur 5 devices (avant : 55 PASS / 25 WARN overflow). iPhone SE 375px entièrement fonctionnel. |
| **v9.69** | **Audit expert 4 subagents parallèles + corrections**. Fix P1 : `cmc_motd` maintenant géré dans `fbApplyData` (accepte null=effacé, validation type objet). Fix P2 : auteur MOTD supprimé affiche "(supprimé)" au lieu de "undefined" ; bandeau MOTD gagne `word-break:break-word` + `overflow-wrap:anywhere` pour textes longs sans espaces. Section **"Outils & réflexes expert"** ajoutée dans CLAUDE.md (boîte à outils, commandes de validation, pièges à éviter). |
| **v9.68** | **Message du jour admin + sync Firebase**. Store `A.motd={text,ts,author}` dans FB_FIX (`cmc_motd`). Fonctions `setMotd`/`clearMotd`/`adminSetMotdFromInput` (guard AID, max 500 car., audit `motd_set`/`motd_clear`). UI admin : textarea + boutons Publier/Effacer. UI employé : bandeau doré 📢 en haut de `vAccueil` (pre-wrap, date/heure). |
| **v9.67** | **Version majeure 35+ fonctionnalités**. Splash screen, Firebase différé, auto-save fiches, CODE_HOURS complet, solde CP, dashboard RH + courbe 12 mois SVG, TTS/STT, compte visiteur U007, thèmes (Casino/Clair/Nuit), export PDF, templates planning, multi-langues FR/EN/IT, swipe mois, admin réorganisé 7 catégories, PWA installable, mode présentation. IA locale enrichie (36 outils). AUDIT 23/23 PASS. |
| **v9.66** | Lisibilité (ratio WCAG AA), tokens CSS typography+blur centralisés, titres serif Garamond. |
| **v9.65** | Cadre légal monégasque (Loi 1.103, OS 8.929, AM 88-384) + vConvention onglet Loi + 2 outils IA supplémentaires. |
| **v9.64** | JEUX_SBM Formation 2016 (6 jeux détaillés : BJ, RA, Craps, PB, THU, TCP) + vConvention Jeux enrichi + 2 outils IA. |
| **v9.63** | Tool use IA custom — 26 outils (21 lecture + 5 admin). IA_TOOLS[] + _iaExecuteTool + guard AID sur les 5 admin. |
| **v9.62** | Multi-axe : bulles chat transparentes + fix iOS zoom + CSP élargie + upload modéré + PLANS_CMC/CDP + galerie 75 photos salons + 15 tests unitaires. |

---

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
var APP_VER  = "v9.68";
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
