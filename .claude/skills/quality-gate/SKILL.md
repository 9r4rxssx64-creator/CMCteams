---
name: quality-gate
description: Porte de qualité finale avant push. Exécute toutes les vérifications en séquence — syntaxe, structure, données, sécurité, diff. Bloque le push si un problème est détecté.
disable-model-invocation: true
allowed-tools: Read Bash Grep
---

# Quality Gate — Vérification complète avant push

**Invocation** : `/quality-gate` — à exécuter avant tout `git push`

## Pipeline de vérification

Exécuter TOUTES les étapes dans l'ordre. Arrêter au premier échec critique (❌).

### Étape 1 — Syntaxe JS
```bash
node -e "
const fs=require('fs'),html=fs.readFileSync('index.html','utf8');
const s=html.lastIndexOf('<script>'),e=html.lastIndexOf('</script>');
fs.writeFileSync('/tmp/cmc_qg.js',html.slice(s+8,e));
console.log('JS: '+html.slice(s+8,e).split('\n').length+' lignes');
" && node --check /tmp/cmc_qg.js && echo "PASS" || echo "FAIL"
```

### Étape 2 — Structure HTML
Vérifier dans index.html :
- `<div id="app">` existe
- `<div id="toast">` existe
- `<div id="ov">` existe
- Un seul `<script>` et un seul `</script>`
- Fin du fichier : `</html>`

### Étape 3 — Constantes critiques
Grep dans index.html pour confirmer l'existence de :
- `var AID=` ou `var AID =`
- `var DATA_VER=`
- `var APP_VER=`
- `function esc(`
- `function render(`
- `function dc(`
- `function gpl(`
- `var DEF_EMP=` ou `var DEF_EMP =`

### Étape 4 — Pas de conflits git
```bash
grep -c '<<<<<<\|>>>>>>\|======' index.html || true
```
Si count > 0 → ❌ BLOQUANT

### Étape 5 — Pas de debug oublié
```bash
grep -n 'console\.log\|debugger\b' /tmp/cmc_qg.js | head -20
```
⚠️ Warning si trouvé (pas bloquant sauf si dans du code de production)

### Étape 6 — Taille du fichier
```bash
wc -c index.html
```
- < 200 KB → ❌ BLOQUANT (données probablement manquantes)
- 200-350 KB → ✅ Normal
- > 350 KB → ⚠️ Warning (vérifier qu'il n'y a pas de données dupliquées)

### Étape 7 — Diff review
```bash
git diff --stat HEAD~1
```
Analyser les changements :
- Plus de 500 lignes modifiées → ⚠️ Changement important, revue manuelle recommandée
- Fichiers inattendus modifiés → ⚠️ Vérifier

## Rapport final

```
╔══════════════════════════════════════╗
║       QUALITY GATE — CMCteams       ║
╠══════════════════════════════════════╣
║ 1. Syntaxe JS      : ✅/❌          ║
║ 2. Structure HTML   : ✅/❌          ║
║ 3. Constantes       : ✅/❌          ║
║ 4. Conflits git     : ✅/❌          ║
║ 5. Debug oublié     : ✅/⚠️          ║
║ 6. Taille fichier   : ✅/⚠️/❌       ║
║ 7. Diff review      : ✅/⚠️          ║
╠══════════════════════════════════════╣
║ VERDICT : ✅ PUSH AUTORISÉ          ║
║      ou : ❌ PUSH BLOQUÉ            ║
╚══════════════════════════════════════╝
```

Si un seul ❌ → **NE PAS PUSH**. Corriger d'abord.
Si seulement des ⚠️ → push autorisé mais signaler les warnings.
