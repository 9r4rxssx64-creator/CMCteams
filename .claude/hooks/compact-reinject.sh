#!/bin/bash
# Hook PostCompact — Réinjecte le contexte critique après compaction du contexte
# Empêche la perte d'informations essentielles quand la conversation est compressée

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0

APP_VER=$(grep -o 'APP_VER="[^"]*"' index.html 2>/dev/null | head -1)
DATA_VER=$(grep -o 'DATA_VER=[0-9]*' index.html 2>/dev/null | head -1)
BRANCH=$(git branch --show-current 2>/dev/null)
DIRTY=$(git status --porcelain 2>/dev/null | wc -l)

cat <<CONTEXT
🔄 Contexte réinjecté après compaction :

📌 CMCteams — SPA monofichier (index.html ~300KB)
   ${APP_VER:-???} | ${DATA_VER:-???} | Branche: ${BRANCH:-?}
   Fichiers modifiés: ${DIRTY:-0}

📐 Règles ABSOLUES :
  1. Lire le code AVANT d'éditer
  2. esc() obligatoire pour innerHTML avec données utilisateur
  3. ls() après toute mutation de A.employees/teams/overrides
  4. Pas de npm/build/framework — vanilla JS uniquement
  5. UI et commentaires en FRANÇAIS
  6. Valider JS après édition : node --check
  7. Ne pas ajouter de features non demandées

📁 Structure : tout est dans index.html (HTML+CSS+JS)
   Fonctions vue : vPlan, vStats, vAdmin, vDeparts, vChat, vIA...
   État global : var A = { user, view, employees, teams, overrides... }
   Storage : lg(key, fallback) / ls(key, value)
CONTEXT

exit 0
