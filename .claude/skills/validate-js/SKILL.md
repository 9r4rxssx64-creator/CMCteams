---
name: validate-js
description: Extrait le JavaScript d'index.html et valide la syntaxe avec Node.js. Détecte les erreurs de syntaxe avant déploiement.
disable-model-invocation: false
allowed-tools: Read Bash Grep
---

# Validation JS — CMCteams

Extrait et valide la syntaxe JavaScript contenue dans `index.html`.

## Étapes

1. Extraire le bloc `<script>...</script>` d'index.html dans un fichier temporaire :
```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const s = html.lastIndexOf('<script>'), e = html.lastIndexOf('</script>');
if(s === -1 || e === -1) { console.error('Bloc script introuvable'); process.exit(1); }
fs.writeFileSync('/tmp/cmc_test.js', html.slice(s+8, e));
console.log('JS extrait: ' + (html.slice(s+8, e).length) + ' caractères');
" && node --check /tmp/cmc_test.js
```

2. Si `node --check` échoue, analyser l'erreur :
   - Lire le fichier `/tmp/cmc_test.js` autour de la ligne indiquée
   - Identifier la cause (parenthèse manquante, guillemet non fermé, etc.)
   - Proposer un correctif précis dans `index.html`

3. Si la validation réussit, confirmer avec le nombre de lignes JS.

## Résultat attendu
- ✅ "Syntaxe JS valide — X lignes, Y caractères"
- ❌ "Erreur ligne N: [description]" + correctif proposé
