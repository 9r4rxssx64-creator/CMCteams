#!/bin/bash
# Hook SessionStart — Injecte le contexte critique du projet CMCteams
# Se déclenche au démarrage de session et après compaction

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0

# Version actuelle
APP_VER=$(grep -o 'APP_VER="[^"]*"' index.html 2>/dev/null | head -1)
DATA_VER=$(grep -o 'DATA_VER=[0-9]*' index.html 2>/dev/null | head -1)
LINES=$(wc -l < index.html 2>/dev/null)
SIZE=$(wc -c < index.html 2>/dev/null)
BRANCH=$(git branch --show-current 2>/dev/null)
DIRTY=$(git status --porcelain 2>/dev/null | wc -l)

cat <<CONTEXT
🎰 CMCteams — Contexte projet
  ${APP_VER:-APP_VER=???} | ${DATA_VER:-DATA_VER=???}
  index.html: ${LINES:-?} lignes, $((${SIZE:-0} / 1024)) KB
  Branche: ${BRANCH:-?} | Fichiers modifiés: ${DIRTY:-0}

⚠️ Rappels critiques :
  - Toujours lire index.html AVANT de l'éditer
  - Utiliser esc() pour tout innerHTML avec données utilisateur
  - Sauvegarder localStorage après mutation (ls("cmc_e", A.employees), etc.)
  - Pas de framework/build/npm — SPA monofichier vanilla JS
  - UI et commentaires en FRANÇAIS
  - Valider la syntaxe JS après chaque édition : node --check
CONTEXT

exit 0
