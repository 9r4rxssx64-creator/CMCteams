---
name: verify-after-edit
description: Agent de vérification automatique après chaque modification d'index.html. Valide syntaxe JS, structure HTML, et intégrité des données critiques. DOIT être invoqué après toute édition d'index.html.
user-invocable: false
allowed-tools: Read Bash Grep
---

# Agent de Vérification Post-Édition

**INVOCATION AUTOMATIQUE** : Cet agent DOIT être exécuté après chaque modification d'index.html.

## Checklist de vérification (dans cet ordre)

### 1. Syntaxe JavaScript ✅/❌
```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const s = html.lastIndexOf('<script>'), e = html.lastIndexOf('</script>');
if(s===-1||e===-1){console.error('ERREUR: Bloc <script> introuvable');process.exit(1);}
fs.writeFileSync('/tmp/cmc_verify.js', html.slice(s+8, e));
" && node --check /tmp/cmc_verify.js
```
Si échec → **STOP IMMÉDIAT**. Corriger l'erreur avant de continuer.

### 2. Structure HTML intacte
Vérifier que ces éléments existent toujours dans index.html :
- `<!DOCTYPE html>` en ligne 1
- `<html lang="fr">`
- `<div id="app"></div>`
- `<div id="toast"></div>`
- `<div id="pk"></div>`
- `<div id="ov"></div>`
- Un seul bloc `<script>...</script>`
- Le fichier se termine par `</html>`

### 3. Constantes critiques préservées
Vérifier que ces déclarations existent :
- `var AID` (admin ID)
- `var DATA_VER` (version schema)
- `var APP_VER` (version app)
- `var DEF_EMP` (employés par défaut)
- `var SEED_APR2026` (planning seedé)
- `function esc(` (protection XSS)
- `function render(` (rendu principal)
- `function dc(` (rendu partiel)

### 4. Pas de régressions évidentes
- Le fichier fait plus de 3500 lignes (sinon données tronquées)
- Le fichier fait plus de 280 KB (sinon contenu manquant)
- Pas de `<<<<<<` ou `>>>>>>` (conflits git non résolus)
- Pas de `undefined` ou `TODO` dans les constantes critiques

### 5. Résultat
```
🔍 Vérification post-édition
  [✅/❌] Syntaxe JS valide
  [✅/❌] Structure HTML intacte
  [✅/❌] Constantes critiques OK
  [✅/❌] Pas de régressions
```

Si TOUT est ✅ → continuer le travail.
Si un ❌ → signaler immédiatement et corriger avant de poursuivre.
