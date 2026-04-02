#!/bin/bash
# Hook Stop — Vérifie l'état du travail avant de terminer la session
# Avertit si des changements ne sont pas commités ou poussés

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0

WARNINGS=""

# 1. Vérifier les fichiers modifiés non commités
DIRTY=$(git status --porcelain 2>/dev/null | wc -l)
if [ "$DIRTY" -gt 0 ]; then
  WARNINGS="${WARNINGS}\n⚠️ $DIRTY fichier(s) modifié(s) non commité(s) :"
  WARNINGS="${WARNINGS}\n$(git status --short 2>/dev/null)"
fi

# 2. Vérifier les commits non poussés
BRANCH=$(git branch --show-current 2>/dev/null)
UNPUSHED=$(git log origin/$BRANCH..$BRANCH --oneline 2>/dev/null | wc -l)
if [ "$UNPUSHED" -gt 0 ]; then
  WARNINGS="${WARNINGS}\n⚠️ $UNPUSHED commit(s) non poussé(s) sur $BRANCH :"
  WARNINGS="${WARNINGS}\n$(git log origin/$BRANCH..$BRANCH --oneline 2>/dev/null)"
fi

# 3. Si index.html est modifié, vérifier la syntaxe JS
if git status --porcelain 2>/dev/null | grep -q 'index.html'; then
  node -e "
  const fs = require('fs');
  const html = fs.readFileSync('index.html', 'utf8');
  const s = html.lastIndexOf('<script>'), e = html.lastIndexOf('</script>');
  fs.writeFileSync('/tmp/cmc_stop.js', html.slice(s+8, e));
  " 2>/dev/null && node --check /tmp/cmc_stop.js 2>/dev/null

  if [ $? -ne 0 ]; then
    WARNINGS="${WARNINGS}\n❌ index.html a une ERREUR DE SYNTAXE JS non corrigée !"
  fi
fi

if [ -n "$WARNINGS" ]; then
  echo -e "📋 Rappel avant fin de session :$WARNINGS" >&2
  # Ne pas bloquer la fin de session, juste avertir
fi

exit 0
