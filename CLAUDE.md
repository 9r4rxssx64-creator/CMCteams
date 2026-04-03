# CLAUDE.md — CMCteams Codebase Guide

Guide pour assistants IA travaillant sur ce dépôt. Mis à jour après session v8.30.

---

## Vue d'ensemble du projet

**CMCteams** est une SPA de planification de shifts et de gestion d'équipes pour le département BlackJack du Casino de Monaco. Application entièrement client-side — pas de backend, pas de build, pas de dépendances — servie comme un unique fichier HTML statique hébergé sur GitHub Pages.

- **Langue :** Français (UI, commentaires, identifiants, messages de commit)
- **Version actuelle :** `APP_VER = "v8.30"`, `DATA_VER = 28`
- **Stockage :** `localStorage` navigateur uniquement (pas de serveur ni BDD)
- **Effectif :** ~74 employés sur 5 équipes BJ + équipes roulettes + CMC

---

## Structure du dépôt

```
CMCteams/
├── index.html          # Application entière (HTML + CSS + JS, ~310 KB)
├── app 2.js            # Copie de travail / backup de la section JS (~112 KB)
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

  <script>  ← ~6000+ lignes de JS vanilla
  </script>
</body>
```

### Objet d'état global `A`

```javascript
var A = {
  user: null,          // employé connecté (objet)
  view: "planning",    // nom de la vue courante
  year: 2026,
  month: 3,            // 1-indexé (avril = 3 dans le système interne car mois offset)
  employees: [...],    // tableau d'objets employé
  teams: [...],        // tableau d'objets équipe
  overrides: {},       // modifications manuelles, clé "annee-mois" → {eid → {jour → code}}
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

## Clés localStorage

| Clé | Contenu |
|-----|---------|
| `cmc_e` | Tableau employés |
| `cmc_t` | Tableau équipes |
| `cmc_ov` | Objet overrides (planning manuel) |
| `cmc_pw` | Mots de passe hachés |
| `cmc_chat` | Messages de chat |
| `cmc_chef_eq` | Map chefs d'équipe |
| `cmc_chefs_t` | Chefs par tour |
| `cmc_admin_pin` | Hash du PIN admin |
| `cmc_lastread` | Timestamp dernier message chat lu |
| `cmc_ref_YYYY-M` | Données de référence import PDF (mois) |
| `cmc_audit` | Journal des modifications admin (max 500 entrées) |
| `cmc_pin_fails` | Compteur échecs PIN `{count, until}` |
| `cmc_lastact` | Timestamp dernière activité (session TTL) |
| `cmc_uid` | ID employé connecté (persiste entre rechargements) |

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
  name: "ESPAGNOL S",         // "NOM Prénom" — doit correspondre exactement à EP{}
  team: "1",                  // "1"–"5" pour BJ, autres pour roulettes/CMC
  post: "BRTP+K",             // codes de poste
  chef: true,                 // chef d'équipe
  cdpShifts: ["16/3"],        // shifts éligibles CDP (obsolète — voir EP[].d)
  family: "bj",               // "bj" | "roulettes" | "cmc"
  toMo: 1                     // OPTIONNEL : mois de départ (moOff exclusif). Ex: toMo:1 = inactif dès avril 2026
}
```

### Codes de shift (`CODES`)

| Code | Signification |
|------|--------------|
| `22/6` | 22h–6h (nuit) |
| `19/4` | 19h–4h |
| `16/3` | 16h–3h |
| `14/19` | 14h–19h |
| `20/5` | 20h–5h |
| `16/22` | 16h–22h |
| `CP` | Congé payé |
| `M` | Maladie |
| `AF` | Formation |
| `RRT` | Récupération |
| `RH` | Repos hebdomadaire (1er jour du binôme repos) |
| `R` | Repos (2e jour du binôme repos) |

Les codes CDP sont les codes de shift avec `*` : `20/5*`, `16/3*`, etc. (définis dans `CDP_MAP`).

### Couleurs d'équipe (`TC`)

| Équipe | Couleur | Hex |
|--------|---------|-----|
| 1 | Or | `#c9a227` |
| 2 | Bleu | `#4a72a8` |
| 3 | Vert | `#3a8a50` |
| 4 | Rose | `#a84868` |
| 5 | Orange | `#c07830` |

Équipes miroirs : 1↔4 et 2↔5 (rotations opposées).

---

## Système de génération de planning (`genBase`)

### Constantes critiques

```javascript
var AID      = "U11804";   // Admin = DESARZENS K (équipe 5)
var DATA_VER = 28;         // Version schéma localStorage
var APP_VER  = "v8.30";    // Version affichée
```

### `moOff(y, m)` — offset de mois

```javascript
function moOff(y, m) { return (y - 2026) * 12 + (m - 2); }
// Avril 2026 (m=3) → mo = 1
// Mars 2026 (m=2)  → mo = 0  (mois de référence)
```

### `REPOS` — jours de repos par équipe (positions dans le cycle de 30 jours)

```javascript
var REPOS = {
  "1": [5,6,11,12,17,18,23,24,29,30],
  "2": [3,4,9,10,15,16,21,22,27,28],
  "3": [1,2,7,8,13,14,19,20,25,26],
  "4": [2,3,8,9,14,15,20,21,26,27],
  "5": [4,5,10,11,16,17,22,23,28,29],
  // équipes 6–10 miroirs de 1–5
};
```

### `EP` — profils de shift par employé

```javascript
var EP = {
  "NOM Prénom": {
    s: ["20/5","19/4","16/3","14/19"],  // séquence de shifts (ordre de rotation)
    d: ["20/5","16/3"],                  // shifts éligibles CDP (→ affichés avec *)
    i: 2                                 // offset de départ dans la séquence
  },
  // ...
};
```

**⚠️ Important :** Le champ `name` de l'employé dans `A.employees` doit correspondre **exactement** à la clé dans `EP`. Si un employé n'est pas dans `EP`, il n'a pas de planning théorique généré.

### `cumWorkDays(teamId, mo)` — jours ouvrés cumulés avant le mois `mo`

Compte les jours réels (non-repos) pour une équipe depuis mars 2026.
- `mo=0` → 0 (mars 2026 = mois de référence)
- `mo=1` → jours travaillés en mars 2026 (typiquement 21 pour équipe 5)

**⚠️ Risque connu :** Utilise des cycles de 30 jours. Les mois de 31 jours peuvent donner +1 jour ouvré pour certaines équipes (équipes 3 et 8 principalement). Non corrigé.

### Formule de calcul `genBase`

```javascript
// Pour chaque employé avec profil EP :
var si0 = (((prof.i + cumWorkDays(emp.team, mo)) % sl) + sl) % sl;
// si0 = index de départ dans la séquence pour le 1er jour ouvré du mois
```

**Simulation équipe 5, avril 2026 (mo=1) :**
- `cumWorkDays("5", 1)` = 21 (jours en mars 2026)
- `si0 = (2 + 21) % 4 = 23 % 4 = 3`
- Séquence `["20/5","19/4","16/3","14/19"]`, si0=3 → D01 commence à index 3 = `14/19`
- D01: `14/19`, D02: `20/5`, D03: `19/4`, D04: RH, D05: R, D06: `16/3`, ...

### `gpl()` — getter principal du planning

Combine `genBase` (base théorique) + overrides (imports PDF / modifications manuelles) :
```javascript
function gpl() {
  // 1. genBase() pour tous les employés avec profil EP
  // 2. Overrides écrasent le théorique jour par jour
  // → Permet import partiel : jours non importés = théorique, jours importés = réel
}
```

### `isEmpActive(emp, y, m)` — filtre les employés actifs

```javascript
function isEmpActive(emp, y, m) {
  var mo = moOff(y, m);
  if (emp.toMo !== undefined && mo >= emp.toMo) return false;
  return true;
}
// toMo:1 → inactif dès avril 2026 (mo=1)
```

---

## Sécurité et sessions (v8.27–v8.28)

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
var SESSION_TTL = 8 * 60 * 60 * 1000; // 8h en ms
function touchSession() { if(A.user) localStorage.setItem("cmc_lastact", String(Date.now())); }
// Au démarrage : si (Date.now() - cmc_lastact) > SESSION_TTL → déconnexion automatique
```

### Rate-limiting PIN admin

```javascript
// cmc_pin_fails = { count: 0, until: 0 }
// Après 5 échecs : verrouillage progressif [30s, 2min, 10min, 1h, 24h]
```

### Mots de passe

- Stockés hashés uniquement `{h: hashPw(pw)}` — plus de mot de passe en clair
- Migration automatique si l'ancien format (string) est détecté

---

## `SEED_APR2026` et protection des imports (v8.30)

`SEED_APR2026` est un planning pré-calculé pour avril 2026, chargé **uniquement** si aucun vrai import PDF n'existe pour ce mois :

```javascript
// Au démarrage, après migration DATA_VER :
var _refObj = JSON.parse(localStorage.getItem("cmc_ref_2026-3") || "null");
var _hasRealImport = _refObj && !_refObj.synthetic && _refObj.rows && Object.keys(_refObj.rows).length > 0;
if (!_hasRealImport) {
  A.overrides["2026-3"] = JSON.parse(JSON.stringify(SEED_APR2026));
  ls("cmc_ov", A.overrides);
}
```

**⚠️ Ne pas charger le SEED inconditionnellement** — cela écraserait les imports PDF réels.

---

## Journal d'audit (v8.29)

Chaque modification manuelle admin via `saveOv()` est tracée dans `cmc_audit` (max 500 entrées) :
```javascript
{ ts, adminId, eid, name, year, month, day, old, new }
```

---

## Gestion des employés partants

Pour désactiver un employé à partir d'un certain mois, ajouter `toMo` à son objet :
```javascript
{ id:"U00074", name:"LEMONNIER PH", team:"5", ..., toMo: 1 }
// toMo:1 = moOff(2026,3) = inactif dès avril 2026
```
L'employé reste dans `A.employees` (historique) mais n'apparaît plus dans le planning.

---

## Modules de l'application (fonctions de vue)

| Fonction | Rôle |
|----------|------|
| `vLogin` / `vLoginStep*` | Flux d'authentification |
| `vPlan` | Grille planning mensuel (vue principale) |
| `vDeparts` | Affectation des départs / shifts |
| `vStats` | Dashboard statistiques (v8.29 : navigation + groupes équipes) |
| `vChat` | Chat d'équipe |
| `vAdmin` | Panneau admin |
| `vTeams` | Configuration des équipes |
| `vEmps` | Gestion des employés |
| `vImport` | Import de données PDF |
| `vIA` | Chatbot IA (en français) |
| `vAbsences` | Suivi congés/absences |

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
- `DATA_VER = 28` ; l'incrémenter + ajouter un bloc de migration au démarrage si le schéma change

### Pas de build
- Ne jamais introduire un outil de build, bundler ou gestionnaire de paquets
- Modifier `index.html` directement

---

## Tests et déploiement

### Tests manuels
- Ouvrir `index.html` dans un navigateur (pas de serveur requis)
- DevTools → Application → localStorage pour inspecter/vider l'état
- Tester après `hardReset()` : télécharge un backup JSON automatiquement puis vide localStorage

### Déploiement
- Push sur `main` → GitHub Actions déploie sur GitHub Pages automatiquement
- Workflow : `.github/workflows/deploy.yml`
- Cache-busting via `APP_VER` et métadonnées `no-cache`

---

## Workflow Git

- **Branche principale :** `main` (déploie sur GitHub Pages)
- **Branches de feature :** pattern `claude/<description>` pour le travail assisté IA
- Messages de commit : format `vX.Y: <description>` (ex : `v8.30: Fix EP équipe 5, retrait LEMONNIER, protection SEED`)

---

## État au moment de la rédaction (v8.30 — 3 avril 2026)

### Ce qui a été livré dans cette session (v8.27–v8.30)

| Version | Changements |
|---------|-------------|
| v8.27 | `esc()` XSS complet, suppression mots de passe en clair, `gpl()` import partiel, `hardReset` avec backup, rapport import complet |
| v8.28 | Export CSV planning, rate-limiting PIN, session 8h auto-expiry, alerte quota localStorage |
| v8.29 | Gestion multi-mois localStorage, jauge stockage, journal d'audit modifications, `vStats` refait avec navigation et groupes |
| v8.30 | LEMONNIER PH retiré équipe 5 (`toMo:1`), profils EP équipe 5 synchronisés (`i=2`), SEED protégé contre écrasement imports |

### Problèmes connus / à faire

1. **`cumWorkDays()` cycle 30 jours** : les mois de 31 jours peuvent donner +1 jour ouvré pour équipes 3 et 8. Non corrigé (risqué).
2. **Autres équipes BJ (1–4, 6–10)** : profils EP non audités pour des désynchronisations similaires à l'équipe 5.
3. **Import PDF** : la correction `gpl()` gère les imports partiels, mais la qualité de l'extraction dépend du format PDF. À tester en production avec le vrai PDF d'avril.
4. **`hashPw()`** : hash simple (non cryptographique) — acceptable pour outil intranet.

### Simulation équipe 5 avril 2026 (validée)

```
i=2, si0=(2+21)%4=3, séquence ["20/5","19/4","16/3","14/19"]
PUGNETTI S:   D01:14/19  D02:20/5   D03:19/4  D04:RH  D05:R  D06:16/3  ...
DESARZENS K:  D01:14/19  D02:20/5*  D03:19/4  D04:RH  D05:R  D06:16/3* ...
MARIOTTINI J: D01:14/19  D02:20/5   D03:19/4  D04:RH  D05:R  D06:16/3  ...
DESSI F:      D01:14/19  D02:20/5*  D03:19/4  D04:RH  D05:R  D06:16/3* ...
✅ Même shift de base sur chaque jour ouvré
✅ 3 avril = 19/4 (confirmé par DESARZENS K)
```

---

## Référence des constantes

```javascript
var AID      = "U11804";   // Admin = DESARZENS K
var DATA_VER = 28;         // Version schéma localStorage (incrémenter si schéma change)
var APP_VER  = "v8.30";    // Version affichée dans l'interface
var MFR      = ["Janvier","Février","Mars","Avril","Mai","Juin",
                "Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
// MFR[0] inutilisé (tableau 1-indexé)
```
