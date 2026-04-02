# CLAUDE.md — CMCteams Codebase Guide

This file provides context for AI assistants (Claude and others) working on this repository.

---

## Project Overview

**CMCteams** is a shift-planning and team-management SPA for the BlackJack department at Casino de Monaco. It is a fully client-side app — no backend, no build step, no dependencies — delivered as a single static HTML file hosted on GitHub Pages.

- **Language:** French (all UI text, comments, and identifiers are in French)
- **Version:** v7.2 (`APP_VER = "v7.2"`, `DATA_VER = 7`)
- **Storage:** Browser `localStorage` only (no server or database)
- **Employees:** 74 staff across 5 teams

---

## Repository Structure

```
CMCteams/
├── index.html          # The entire application (HTML + CSS + JS, ~176 KB)
├── app 2.js            # Backup / working copy of the JS section (~112 KB)
├── README.md           # Minimal project description
├── CLAUDE.md           # This file
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Pages deployment (triggers on push to main)
```

**There is no build system.** `index.html` is served directly. Edits to it are immediately deployable.

---

## Architecture

### Single-File SPA Pattern

Everything lives in `index.html`:

```
<head>
  <style>  ← ~3000 lines of embedded CSS
  </style>
</head>
<body>
  <div id="app"></div>   ← root mount point
  <div id="toast"></div> ← notification overlay
  <div id="pk"></div>    ← picker overlay
  <div id="ov"></div>    ← modal overlay

  <script>  ← ~3000 lines of vanilla JS
  </script>
</body>
```

### Global State Object

All application state lives in a single global variable:

```javascript
var A = {
  user: null,          // logged-in employee object
  view: "planning",    // current view name
  year: 2026,
  month: 3,            // 1-indexed
  employees: [...],    // array of employee objects
  teams: [...],        // array of team objects
  overrides: {},       // manual planning overrides keyed by "eid-year-month-day"
  passwords: {},       // hashed passwords keyed by employee ID
  showLeg: false,      // show legend toggle
  chatMsgs: [...]      // chat message array
};
```

### Rendering Pattern

The app uses full DOM replacement (no virtual DOM):

```javascript
function render() {
  const app = document.getElementById("app");
  if (!A.user) {
    app.innerHTML = vLogin();
  } else {
    app.innerHTML = `<div id="topbar">${vTopbar()}</div>
                     <div id="content">${vMain()}</div>`;
  }
}

function dc() {  // draw content — partial re-render
  document.getElementById("content").innerHTML = vMain();
}
```

View functions are named with a `v` prefix (e.g., `vPlan`, `vStats`, `vAdmin`).

### localStorage Keys

| Key | Contents |
|-----|----------|
| `cmc_e` | Employees array |
| `cmc_t` | Teams array |
| `cmc_ov` | Overrides object |
| `cmc_pw` | Passwords object |
| `cmc_chat` | Chat messages array |
| `cmc_chef_eq` | Team chiefs map |
| `cmc_chefs_t` | Team chiefs by turn |
| `cmc_admin_pin` | Admin PIN hash |
| `cmc_lastread` | Last-read chat timestamp |

Storage helpers:

```javascript
function lg(k, fb) { /* localStorage.getItem with JSON.parse + fallback */ }
function ls(k, v)  { /* localStorage.setItem with JSON.stringify */ }
```

---

## Key Data Structures

### Employee Object

```javascript
{
  id: "U00001",           // matricule SBM (unique)
  name: "ESPAGNOL S",     // "NOM Prénom" format
  team: "1",              // "1"–"5"
  post: "BRTP+K",         // position codes (B=blackjack, R=roulette, etc.)
  chef: true,             // is team chief
  cdpShifts: ["16/3"],    // shifts eligible for CDP
  family: "bj"            // optional: "bj" | "roulette" | etc.
}
```

### Shift Codes (`CODES` constant)

| Code | Meaning |
|------|---------|
| `22/6` | 22h–6h (night) |
| `19/4` | 19h–4h |
| `16/3` | 16h–3h |
| `14/19` | 14h–19h |
| `20/5` | 20h–5h |
| `CP` | Paid leave (congé payé) |
| `M` | Sick leave (maladie) |
| `AF` | Training (formation) |
| `RRT` | Recovery/rest |
| `R` | Rest day |

### Team Colors (`TC` constant)

| Team | Color | Hex |
|------|-------|-----|
| 1 | Gold | `#c9a227` |
| 2 | Blue | `#4a72a8` |
| 3 | Green | `#3a8a50` |
| 4 | Rose | `#a84868` |
| 5 | Orange | `#c07830` |

Teams 1↔4 and 2↔5 are mirror pairs (opposite shift rotations).

---

## Application Modules (View Functions)

| Function | Purpose |
|----------|---------|
| `vLogin` / `vLoginStep*` | Authentication flow |
| `vPlan` | Monthly planning grid (main view) |
| `vDeparts` | Departures / shift assignment |
| `vStats` | Statistics dashboard |
| `vChat` | Team chat |
| `vAdmin` | Admin panel entry |
| `vTeams` | Team configuration |
| `vEmps` | Employee management |
| `vImport` | PDF data import |
| `vIA` | AI chatbot (French) |
| `vAbsences` | Leave / absence tracking |

---

## Development Conventions

### Language
- **All UI strings, comments, variable names, and commit messages should be in French** unless the change is purely structural/technical.

### Naming
- View functions: `v` prefix (`vPlan`, `vStats`)
- Storage read/write: `lg(key, fallback)` / `ls(key, value)`
- Global state: `A.fieldName`
- Abbreviated identifiers are common: `emp`, `eid`, `eq` (équipe), `mois`, `ann`

### DOM & XSS Safety
- Always escape user-supplied content with `esc()` before injecting into `innerHTML`
- Do not use `eval()` or unsanitized template literals with user data

### Adding a New View
1. Create a `vMyView()` function that returns an HTML string
2. Add a case to the `vMain()` switch on `A.view`
3. Add navigation entry in `vTopbar()` if needed
4. Set `A.view = "myView"` and call `dc()` to navigate

### Modifying Employee/Team Data
- Always save after mutations: `ls("cmc_e", A.employees)` / `ls("cmc_t", A.teams)`
- Respect `DATA_VER = 7`; bump it and add a migration block in the startup init if the schema changes

### No Build Step
- Never introduce a build tool, bundler, or package manager unless explicitly requested
- Edit `index.html` directly; changes are immediately deployable

---

## Testing & Deployment

### Manual Testing
- Open `index.html` in a browser locally (no server required)
- Use browser DevTools → Application → localStorage to inspect/clear state
- Admin PIN and test accounts can be reset via the admin panel

### Deployment
- Push to `main` branch → GitHub Actions deploys to GitHub Pages automatically
- Workflow file: `.github/workflows/deploy.yml`
- Cache-busting is handled by `APP_VER` and `no-cache` meta headers

---

## Git Workflow

- **Main branch:** `main` (deploys to GitHub Pages)
- **Feature branches:** `claude/<description>` pattern used for AI-assisted work
- Commit messages should be concise and descriptive; version bumps follow `vX.Y: <description>` format (e.g., `v7.2: Import 3 formats PDF`)

---

## Security Notes

- Authentication is basic (simple hash, not cryptographic) — this is an internal intranet tool
- Admin PIN is hashed but not strongly secured
- All data is client-side; there is no server-side validation
- The `esc()` utility must be used for any user-provided content rendered via `innerHTML`

---

## Claude Code Skills & Agents

### Skills utilitaires (invocation manuelle `/nom`)
| Skill | Commande | Description |
|-------|----------|-------------|
| `validate-js` | `/validate-js` | Valide la syntaxe JS d'index.html |
| `find-employee` | `/find-employee NOM` | Recherche un employé par nom/ID |
| `audit-seed` | `/audit-seed` | Audit complet des données SEED |
| `bump-version` | `/bump-version patch` | Incrémente APP_VER / DATA_VER |
| `check-xss` | `/check-xss` | Détecte les failles XSS |
| `sync-backup` | `/sync-backup` | Synchronise app 2.js avec index.html |
| `planning-summary` | `/planning-summary avril 2026` | Résumé planning mensuel |
| `quality-gate` | `/quality-gate` | Vérification complète avant push |
| `self-audit` | `/self-audit` | Auto-évaluation de la session |

### Agents de vérification automatique (invocation auto par Claude)
| Agent | Quand | Rôle |
|-------|-------|------|
| `verify-after-edit` | Après chaque édition d'index.html | Valide syntaxe, structure, constantes |
| `review-before-commit` | Avant chaque commit | Revue qualité, sécurité, conventions |
| `method-guard` | En continu | Vérifie les bonnes pratiques du projet |

### Workflow recommandé
1. Éditer index.html → `verify-after-edit` s'exécute
2. Avant commit → `review-before-commit` analyse le diff
3. Avant push → `/quality-gate` vérifie tout
4. En fin de session → `/self-audit` évalue le travail

---

## Constants Reference

```javascript
var AID      = "U11804";   // Admin user ID (DESARZENS K)
var DATA_VER = 7;          // localStorage schema version
var APP_VER  = "v7.2";     // Display version
var MFR      = ["Janvier", "Février", ...];  // French month names (1-indexed, [0] unused)
```
