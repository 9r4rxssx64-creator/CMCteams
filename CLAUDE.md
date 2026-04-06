# CLAUDE.md — CMCteams Codebase Guide

Guide pour assistants IA travaillant sur ce dépôt. Mis à jour après session v8.82.

---

## Vue d'ensemble du projet

**CMCteams** est une SPA de planification de shifts et de gestion d'équipes pour le département BlackJack du Casino de Monaco. Application entièrement client-side — pas de backend, pas de build, pas de dépendances — servie comme un unique fichier HTML statique hébergé sur GitHub Pages.

- **Langue :** Français (UI, commentaires, identifiants, messages de commit)
- **Version actuelle :** `APP_VER = "v8.82"`, `DATA_VER = 29`
- **Stockage :** `localStorage` navigateur uniquement (pas de serveur ni BDD)
- **Effectif :** ~258 employés sur 10 équipes BJ + 13 équipes roulettes + 13 équipes CMC

---

## Structure du dépôt

```
CMCteams/
├── index.html          # Application entière (HTML + CSS + JS, ~310 KB)
├── sw.js               # Service Worker (cache offline — ajouté v8.78)
├── README.md           # Description minimale
├── CLAUDE.md           # Ce fichier
└── .github/
    └── workflows/
        └── deploy.yml  # Déploiement GitHub Pages (déclenché sur push main)
```

**Pas de système de build.** `index.html` est servi directement. Modifier ce fichier = déploiement immédiat après push.

---

## Architecture

### Pattern SPA monofichier

```
<head>
  <style>  ← ~3000 lignes de CSS embarqué
  </style>
</head>
<body>
  <div id="app"></div>   ← point de montage principal
  <div id="toast"></div> ← overlay de notifications
  <div id="pk"></div>    ← overlay de sélection
  <div id="ov"></div>    ← overlay modal

  <script>  ← ~5200 lignes de JS vanilla
  </script>
</body>
```

### Objet d'état global `A`

```javascript
var A = {
  user: null,          // employé connecté (objet)
  view: "planning",    // nom de la vue courante
  year: 2026,
  month: 3,            // 0-indexé (getMonth()) : avril = 3
  employees: [...],    // tableau d'objets employé (258 au total)
  teams: [...],        // tableau d'objets équipe
  overrides: {},       // données importées/modifiées, clé "annee-mois" → {eid → {jour → code}}
  passwords: {},       // mots de passe hachés, clé = id employé
  showLeg: false,
  chatMsgs: [...]
};
```

### Pattern de rendu

Remplacement DOM complet (pas de virtual DOM) :

```javascript
function render() { /* remplace tout #app */ }
function dc()     { /* re-rend seulement #content */ }
```

Les fonctions de vue ont un préfixe `v` : `vPlan`, `vStats`, `vAdmin`, etc.

---

## Principe fondamental — Import = seule source de vérité (v8.79+)

**L'import PDF est la seule source de données de planning.** Aucune donnée théorique n'est générée ni affichée sans import réel.

- `gpl()` retourne uniquement les overrides (données importées + modifications admin)
- Aucun fallback théorique (REPOS, EP, genBase) n'est utilisé dans les vues
- Sans import pour un mois → les vues affichent "Importez le planning PDF"
- `genBase()` et `cumWorkDays()` sont **supprimées** depuis v8.80 (code mort)
- `EP` et `REPOS` sont conservées uniquement pour référence documentaire / imports futurs

---

## Clés localStorage

| Clé | Contenu |
|-----|---------|
| `cmc_e` | Tableau employés |
| `cmc_t` | Tableau équipes |
| `cmc_ov` | Objet overrides (planning importé + modifs admin) |
| `cmc_pw` | Mots de passe hachés |
| `cmc_chat` | Messages de chat (max 500) |
| `cmc_chef_eq` | Map chefs d'équipe BJ (désignation admin) |
| `cmc_chefs_t` | **NON utilisé en lecture** — CHEFS_T toujours chargé depuis DEF_CHEFS_T |
| `cmc_admin_pin` | Hash du PIN admin |
| `cmc_lastread` | Timestamp dernier message chat lu |
| `cmc_ref_YYYY-M` | Métadonnées import PDF (mois) — présence = import réel effectué |
| `cmc_audit` | Journal des modifications admin (max 500 entrées) |
| `cmc_pin_fails` | Compteur échecs PIN `{count, until}` |
| `cmc_lastact` | Timestamp dernière activité (session TTL 8h) |
| `cmc_uid` | ID employé connecté (persiste entre rechargements) |
| `cmc_ci_YYYY_M` | Indices de départ personnalisés par équipe/mois |
| `cmc_comments_YYYY_M` | Commentaires journaliers sur le planning |

Helpers de stockage :
```javascript
function lg(k, fb) { /* localStorage.getItem avec JSON.parse + fallback */ }
function ls(k, v)  { /* localStorage.setItem avec JSON.stringify */ }
```

---

## Structures de données clés

### Objet employé

```javascript
{
  id: "U00001",               // matricule SBM (unique)
  name: "ESPAGNOL S",         // "NOM Initiale" — doit correspondre exactement à EP{} et DEF_CHEFS_T
  team: "1",                  // "1"–"10" BJ, "r1"–"r13" roulettes, "c1"–"c13" CMC
  post: "BRTP+K",             // codes de poste
  chef: true,                 // chef de partie (flag RH)
  cdpShifts: ["16/3"],        // shifts éligibles CDP (obsolète — voir EP[].d)
  family: "bj",               // "bj" | "roulettes" | "cmc"
  toMo: 1,                    // OPTIONNEL : inactif à partir de moOff(y,m) >= toMo
  fromMo: 2                   // OPTIONNEL : actif à partir de moOff(y,m) >= fromMo
}
```

### Codes de shift (`CODES`)

| Code | Signification | isWork |
|------|--------------|--------|
| `22/6` | 22h–6h (nuit) | ✅ |
| `19/4` | 19h–4h | ✅ |
| `16/3` | 16h–3h | ✅ |
| `14/19` | 14h–19h | ✅ |
| `20/5` | 20h–5h | ✅ |
| `16/22` | 16h–22h | ✅ |
| `20/5*` `16/3*` etc. | Shift CDP (chef de partie) | ✅ |
| `CP` | Congé payé | ❌ |
| `M` | Maladie | ❌ |
| `AF` | Formation | ❌ |
| `RRT` | Récupération | ❌ |
| `RH` | Repos hebdomadaire | ❌ |
| `R` | Repos | ❌ |
| `HC` | Heures complémentaires | ✅ |
| `PRT` | Prêt (autre équipe) | ✅ |

```javascript
var isWork = function(c) {
  return c && c!=="RH" && c!=="R" && c!=="CP" && c!=="M" && c!=="AF" && c!=="RRT";
};
```

### Couleurs d'équipe (`TC`)

| Équipe | Couleur | Hex |
|--------|---------|-----|
| 1 | Or | `#c9a227` |
| 2 | Bleu | `#4a72a8` |
| 3 | Vert | `#3a8a50` |
| 4 | Rose | `#a84868` |
| 5 | Orange | `#c07830` |

Équipes miroirs BJ : 1↔6, 2↔7, 3↔8, 4↔9, 5↔10.

---

## Système de planning

### `moOff(y, m)` — offset de mois

```javascript
function moOff(y, m) { return (y - 2026) * 12 + (m - 2); }
// m = A.month = Date.getMonth() (0-indexé)
// Avril 2026 (m=3) → mo = 1
// Mars 2026 (m=2)  → mo = 0  (mois de référence)
```

### `gpl()` — getter principal du planning (v8.53+)

**Import seule source de vérité — aucun fallback théorique :**

```javascript
function gpl() {
  var key = "" + A.year + "-" + A.month;
  var ov = A.overrides[key] || {};
  var result = {};
  var activeEmps = A.employees.filter(function(emp) { return isEmpActive(emp, A.year, A.month); });
  activeEmps.forEach(function(emp) { result[emp.id] = {}; });
  // Appliquer uniquement les overrides (données PDF importées + modifs admin)
  Object.keys(ov).forEach(function(eid) {
    if (!result[eid]) result[eid] = {};
    Object.keys(ov[eid]).forEach(function(d) { var v = ov[eid][d]; if (v) result[eid][d] = v; });
  });
  return result;
}
```

### `hasImportedData(y, m)` — détection import

```javascript
function hasImportedData(y, m) {
  var key = "" + y + "-" + m;
  return !!lg("cmc_ref_" + key, null) || /* overrides non vides */;
}
```

- Présence de `cmc_ref_{y}-{m}` = import PDF réel effectué
- Utilisé pour conditionner l'affichage (vDeparts, vAccueil, vStats)

### `isEmpActive(emp, y, m)` — filtre les employés actifs

```javascript
function isEmpActive(emp, y, m) {
  var mo = moOff(y, m);
  if (emp.toMo !== undefined && mo >= emp.toMo) return false;
  if (emp.fromMo !== undefined && mo < emp.fromMo) return false;
  return true;
}
```

### `REPOS` — jours de repos par équipe BJ

Utilisé **uniquement** pour référence — plus utilisé dans les calculs depuis v8.79 :

```javascript
var REPOS = {
  "1": [5,6,11,12,17,18,23,24,29,30],
  "2": [3,4,9,10,15,16,21,22,27,28],
  // ...équipes 3–10
};
```

---

## Ordre de départ (`DEF_CHEFS_T` / `CHEFS_T`)

**`DEF_CHEFS_T`** est la liste de tous les membres de chaque équipe dans l'ordre de rotation de départ.

```javascript
var DEF_CHEFS_T = {
  "1": ["LANDAU B", "MILLO W", "SIRIO J", ...],   // BJ Éq.1 — 7 membres
  "7": ["BATTAGLIA D", "NIGIONI J", "GALLIS J", "FARRUGIA VALERI S", "MALGHERINI T"],
  // ...toutes les équipes BJ, roulettes, CMC
};
```

**Règles critiques :**
- Les noms dans `DEF_CHEFS_T` doivent correspondre **exactement** à `emp.name` dans `DEF_EMP`
- `CHEFS_T` est toujours rechargé depuis `DEF_CHEFS_T` au démarrage (jamais depuis localStorage)
- `syncChefsT()` a été **supprimée** (v8.80) — elle avait un bug retirant les non-chefs

**`SEQS`** — séquences de rotation par taille d'équipe :

```javascript
var SEQS = {
  5: [1,4,2,3,5],
  6: [1,6,4,2,3,5],
  7: [1,6,4,2,7,3,5],
  // ...
};
```

**`calcDepPos(empName, tid, day)`** — position de départ d'un employé un jour donné :
- Retourne `null` si aucune donnée importée (pas de fallback REPOS)
- Algorithme : `(wi%4 + floor(wi/4) + base) % sl` → `SEQ[rotIdx]`

---

## Sécurité et sessions

### `esc()` — protection XSS

**Toujours** utiliser `esc()` avant d'injecter du contenu utilisateur dans `innerHTML` :
```javascript
function esc(s) {
  return String(s||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;")
    .replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;");
}
```

### Session TTL (8 heures)

```javascript
var SESSION_TTL = 8 * 60 * 60 * 1000;
// Au démarrage : si (Date.now() - cmc_lastact) > SESSION_TTL → déconnexion automatique
```

### Rate-limiting PIN admin

```javascript
// cmc_pin_fails = { count: 0, until: 0 }
// Après 5 échecs : verrouillage progressif [30s, 2min, 10min, 1h, 24h]
```

### Mots de passe

- Stockés hashés uniquement `{h: hashPw(pw)}` — aucun mot de passe en clair
- Migration automatique si l'ancien format (string) est détecté

---

## `SEED_APR2026` — données de démarrage (v8.30)

Planning pré-calculé pour avril 2026. **Chargé uniquement si aucun import PDF réel n'existe** :

```javascript
var _refObj = JSON.parse(localStorage.getItem("cmc_ref_2026-3") || "null");
var _hasRealImport = _refObj && !_refObj.synthetic && _refObj.rows && Object.keys(_refObj.rows).length > 0;
if (!_hasRealImport) {
  A.overrides["2026-3"] = JSON.parse(JSON.stringify(SEED_APR2026));
}
```

**⚠️ Ne pas charger le SEED inconditionnellement** — cela écraserait un import PDF réel.

Le bouton admin "Recharger planning Avril 2026" a été **supprimé** (v8.80) — l'import est la seule source.

---

## Journal d'audit (v8.29)

Chaque modification manuelle admin via `saveOv()` est tracée dans `cmc_audit` (max 500 entrées) :
```javascript
{ ts, adminId, eid, name, year, month, day, old, new }
```

---

## Gestion des employés partants / entrants

```javascript
// Employé partant — inactif à partir d'avril 2026 (mo=1)
{ id:"U00074", name:"LEMONNIER PH", team:"5", ..., toMo: 1 }

// Employé entrant — actif à partir de mai 2026 (mo=2)
{ id:"U00XXX", name:"NOUVEAU N", team:"3", ..., fromMo: 2 }
```

L'employé reste dans `A.employees` (historique) mais n'apparaît plus dans le planning au-delà de `toMo`.

---

## Modules de l'application (fonctions de vue)

| Fonction | Rôle |
|----------|------|
| `vLogin` / `vLoginStep*` | Flux d'authentification (matricule → mot de passe) |
| `vAccueil` | Accueil personnalisé : shift du jour, départs, prochains jours, solde CP/RRT |
| `vPlan` | Grille planning mensuel (vue principale) |
| `vDeparts` | Grille des ordres de départ par équipe |
| `vStats` | Dashboard statistiques avec navigation mois et groupes |
| `vChat` | Chat d'équipe (max 500 messages) |
| `vAdmin` | Panneau admin |
| `vTeams` | Configuration des équipes et chefs désignés |
| `vEmps` | Gestion des employés (ajout/modif/désactivation) |
| `vRetrait` | Onglet admin — employés retraités/partants |
| `vImport` | Import de données PDF |
| `vPasswords` | Gestion des mots de passe (filtres : inscrits/non-inscrits/inactifs) |
| `vAbsences` | Suivi congés/absences |
| `vIA` | Chatbot IA (en français) |
| `vAuditLog` | Journal des modifications admin |

Ordre d'affichage : `FAMS_ORDER = ["bj", "roulettes", "cmc"]` — BJ en premier partout.

---

## Conventions de développement

### Langue
- **Tout le texte UI, les commentaires, les noms de variables et les messages de commit doivent être en français.**

### Nommage
- Vues : préfixe `v` (`vPlan`, `vStats`)
- Stockage : `lg(clé, fallback)` / `ls(clé, valeur)`
- État global : `A.nomDuChamp`
- Identifiants courts courants : `emp`, `eid`, `eq` (équipe), `mois`, `ann`

### Sécurité DOM
- Toujours `esc()` avant injection dans `innerHTML`
- Pas de `eval()` ni de template literals non échappés avec des données utilisateur

### Ajouter une nouvelle vue
1. Créer `vMaVue()` retournant une string HTML
2. Ajouter un `case` dans le `switch` de `vMain()` sur `A.view`
3. Ajouter une entrée de navigation dans `vTopbar()` si besoin
4. Naviguer : `A.view = "maVue"; dc();`

### Modifier les données employés/équipes
- Toujours sauvegarder après mutation : `ls("cmc_e", A.employees)` / `ls("cmc_t", A.teams)`
- `DATA_VER = 29` ; l'incrémenter + ajouter un bloc de migration au démarrage si le schéma change

### Pas de build
- Ne jamais introduire un outil de build, bundler ou gestionnaire de paquets
- Modifier `index.html` directement

---

## Tests et déploiement

### Tests manuels
- Ouvrir `index.html` dans un navigateur (pas de serveur requis)
- DevTools → Application → localStorage pour inspecter/vider l'état
- Tester après `hardReset()` : télécharge un backup JSON automatiquement puis vide localStorage
- Connexion admin : matricule `U11804` (DESARZENS K)
- Connexion test : matricule `U00071` (PORTA A, équipe 10 BJ)

### Déploiement
- Push sur `main` → GitHub Actions déploie sur GitHub Pages automatiquement
- Workflow : `.github/workflows/deploy.yml`
- Cache-busting via `APP_VER` et métadonnées `no-cache`

---

## Workflow Git

- **Branche principale :** `main` (déploie sur GitHub Pages)
- **Branches de feature :** pattern `claude/<description>` pour le travail assisté IA
- Messages de commit : format `vX.Y: <description>` (ex : `v8.80: Fix grilles départs + nettoyage code mort`)

---

## Historique des versions (v8.27 → v8.80)

| Version | Date | Changements clés |
|---------|------|-----------------|
| v8.27 | avr 2026 | `esc()` XSS complet, suppression MDP en clair, `hardReset` avec backup |
| v8.28 | avr 2026 | Export CSV planning, rate-limiting PIN, session 8h, alerte quota localStorage |
| v8.29 | avr 2026 | Multi-mois localStorage, jauge stockage, journal d'audit, `vStats` refait |
| v8.30 | avr 2026 | LEMONNIER PH `toMo:1`, EP équipe 5 sync `i=2`, SEED protégé contre écrasement |
| v8.53 | avr 2026 | `gpl()` import-only (suppression genBase du getter) |
| v8.74 | avr 2026 | vDeparts : tous les membres actifs dans la rotation |
| v8.75 | avr 2026 | `vRetrait` admin, fix persistance overrides au rechargement |
| v8.76 | avr 2026 | `vPasswords` : filtres inscrits/non-inscrits/inactifs |
| v8.77 | avr 2026 | Quick wins UX, fix `esc()` prévisualisation import, chat 500 msgs, 7 prochains jours |
| v8.78 | avr 2026 | Fix départs post-import, solde CP/RRT, export ICS, commentaires vPlan, SW offline |
| v8.79 | avr 2026 | Import = seule source de vérité — suppression tous les fallbacks théoriques REPOS |
| v8.80 | avr 2026 | Fix grilles départs (table-layout:fixed), fix DEF_CHEF_EQ, suppression code mort |
| v8.81 | avr 2026 | vPlan non-admin : équipe+miroir en priorité ; vDeparts non-admin : miroir visible |
| v8.82 | avr 2026 | Fix scroll mobile vDeparts (overflow:hidden → visible sur parent) ; workflow .claude/ |

---

## Référence des constantes

```javascript
var AID      = "U11804";   // Admin = DESARZENS K (équipe 5)
var DATA_VER = 29;         // Version schéma localStorage (incrémenter si schéma change)
var APP_VER  = "v8.82";    // Version affichée dans l'interface
var MFR      = ["Janvier","Février","Mars","Avril","Mai","Juin",
                "Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
// MFR[A.month] → nom du mois courant (A.month = 0-indexé comme Date.getMonth())
```

---

## État au 6 avril 2026 (v8.82)

### Problèmes connus / à surveiller

1. **`SEED_APR2026`** : toujours présent dans le code (~100 lignes). Ne charge que si pas d'import réel. Peut être supprimé une fois le planning avril v2 importé définitivement.
2. **`EP` et `REPOS`** : conservés dans le code pour référence et imports futurs, mais **non utilisés** dans les calculs de planning.
3. **`hashPw()`** : hash simple (non cryptographique) — acceptable pour outil intranet.
4. **`reloadSeed()`** : fonction encore présente mais bouton admin retiré (v8.80).

### Architecture des données — flux d'import PDF

```
PDF brut
  → vImport (parseur JS)
  → A.overrides["2026-3"][eid][jour] = code
  → ls("cmc_ov", A.overrides)
  → ls("cmc_ref_2026-3", { importedAt, rows, ... })
  → gpl() lit A.overrides
  → toutes les vues utilisent gpl()
```

---

## Erreurs à ne pas faire — Liste définitive

> Erreurs réelles commises et corrigées au fil des sessions. À relire avant toute modification.

### 1. `table-layout:fixed` dans les grilles scrollables ❌

**Contexte :** Les grilles de départ (`vDeparts`) utilisent `overflow-x:auto` pour scroller sur mobile.  
**Erreur :** Ajouter `table-layout:fixed` + `width:100%` sur le `<table>` — ignore `min-width` sur les colonnes, compresse les cellules à ~13px, rend les grilles illisibles.  
**Fix :** `table-layout` ne doit jamais être `fixed` dans un conteneur scrollable. Utiliser `min-width:100%` sur le tableau, et des div wrapper (ex: `width:90px`) pour les colonnes de noms.

### 2. `overflow:hidden` sur un parent contenant un enfant scrollable ❌

**Contexte :** Le div parent des grilles de départ avait `overflow:hidden` pour clipper le border-radius.  
**Erreur :** Sur mobile WebKit, `overflow:hidden` sur un parent intercepte les gestes tactiles et empêche le `overflow-x:auto` de l'enfant de défiler — l'écran "bloque".  
**Fix :** Retirer `overflow:hidden` du parent. Appliquer `border-radius` + `overflow-y:hidden` directement sur le div scrollable enfant.

### 3. Fallbacks théoriques REPOS dans les vues ❌

**Contexte :** Principe fondamental depuis v8.79 : **import = seule source de vérité**.  
**Erreur :** Ajouter un fallback `REPOS[tid]` ou `genBase()` dans vDeparts, calcDepPos, bandeau aujourd'hui — génère des données fantômes si pas d'import.  
**Fix :** Toutes les vues doivent retourner null/vide si pas de données importées. Jamais de données théoriques en affichage.

### 4. `syncChefsT()` — la fonction bugguée (supprimée v8.80) ❌

**Contexte :** `syncChefsT()` retirait les membres non-`chef:true` de la rotation après chaque import.  
**Erreur :** Ne pas réintroduire cette fonction. `CHEFS_T` est initialisé depuis `DEF_CHEFS_T` qui contient **tous** les membres de rotation (pas seulement les chefs désignés).  
**Fix :** `CHEFS_T` est reset depuis `DEF_CHEFS_T` au démarrage. Ne jamais filtrer par `chef:true` dans la rotation.

### 5. `DEF_CHEF_EQ` avec des mauvais noms ❌

**Contexte :** `DEF_CHEF_EQ` mappe les équipes à leurs chefs désignés par défaut.  
**Erreur :** Mettre des noms d'employés dans la mauvaise équipe (ex: PODGORNY B est en roulettes r4, pas en BJ éq.2).  
**Fix actuel :** `{"1":"ESPAGNOL S","2":"CIOCO S","3":"BELTRANDI N","4":"PALMARO M","5":"PUGNETTI S"}` — vérifier avec `A.employees` avant de modifier.

### 6. Charger SEED inconditionnellement ❌

**Contexte :** `SEED_APR2026` est un planning pré-calculé d'urgence pour avril 2026.  
**Erreur :** Charger le SEED sans vérifier qu'il n'y a pas d'import réel — écrase le vrai planning PDF importé.  
**Fix :** Toujours vérifier `_hasRealImport` avant de charger le SEED. Ne charger le SEED que si `cmc_ref_2026-3` est absent ou `synthetic:true`.

### 7. `genBase()` / `cumWorkDays()` — fonctions supprimées ❌

**Contexte :** Ces fonctions généraient le planning théorique depuis les profils EP.  
**Erreur :** Réintroduire ces fonctions ou les appeler — elles ne fonctionnent plus (supprimées v8.80, code mort).  
**Fix :** Le planning est 100% issu de `A.overrides`. `gpl()` lit uniquement les overrides.

### 8. Oublier `esc()` avant `innerHTML` ❌

**Contexte :** L'application injecte des noms d'employés, messages de chat, etc. dans `innerHTML`.  
**Erreur :** Injecter `emp.name` ou contenu utilisateur sans `esc()` — XSS possible sur intranet.  
**Fix :** Systématiquement `esc(emp.name)`, `esc(msg.text)`, etc. avant toute injection DOM.

### 9. Horaires différents dans une même équipe — ce n'est pas forcément une erreur ✅

**Contexte :** Les membres de l'équipe de rotation (CHEFS_T) peuvent avoir des séquences EP différentes.  
**Explication :** En particulier les équipes d'inspection (chefs de partie BJ équipes 6-10) ont des profils EP individuels — chacun suit sa propre rotation de shifts. Deux membres du même groupe peuvent légitimement avoir des shifts différents le même jour.  
**Action correcte :** Avant de "corriger" un shift, vérifier d'abord dans les données importées si c'est réel. Si l'import est erroné, corriger manuellement via admin.

### 10. Push sur `main` sans passer par une branche feature ❌

**Contexte :** `main` déploie automatiquement sur GitHub Pages.  
**Erreur :** Pusher du code non testé directement sur `main` — déploiement immédiat en production.  
**Fix :** Toujours développer sur `claude/<description>`, tester, puis merger sur `main`.

---

## Workflow automatique — suivi des modifications

Un hook Claude Code est configuré dans `.claude/settings.json` pour journaliser automatiquement chaque commit git dans `.claude_journal.md`.

Format du journal :
```
- **[YYYY-MM-DD HH:MM]** `hash` — message du commit
```

Consulter `.claude_journal.md` pour l'historique complet des modifications de la session.
