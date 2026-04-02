---
name: sync-backup
description: Synchronise le fichier backup 'app 2.js' avec le JavaScript extrait d'index.html. Compare et met à jour le backup.
disable-model-invocation: true
allowed-tools: Read Bash Write
---

# Sync Backup — CMCteams

Synchronise le fichier de backup `app 2.js` avec le JS contenu dans `index.html`.

## Étapes

1. **Extraire le JS** d'index.html :
```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const s = html.lastIndexOf('<script>'), e = html.lastIndexOf('</script>');
fs.writeFileSync('/tmp/cmc_current.js', html.slice(s+8, e));
console.log('Extrait: ' + html.slice(s+8, e).split('\n').length + ' lignes');
"
```

2. **Comparer** avec `app 2.js` :
```bash
diff /tmp/cmc_current.js "app 2.js" | head -50
```

3. **Afficher le résumé** :
   - Nombre de lignes ajoutées/supprimées/modifiées
   - Si les fichiers sont identiques → rien à faire

4. **Demander confirmation** avant de mettre à jour `app 2.js`

5. **Si confirmé**, écrire le contenu extrait dans `app 2.js`

## Important
- Ce skill est `disable-model-invocation: true` → invocation manuelle uniquement via `/sync-backup`
- Toujours demander confirmation avant d'écraser le backup
- Le backup sert de référence pour comparer les évolutions
