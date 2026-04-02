#!/bin/bash
# Hook PostToolUse (Edit|Write) — Vérifie index.html après édition
# Valide la syntaxe JS et la structure HTML

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

# Ne vérifier que si c'est index.html qui a été modifié
if [[ "$FILE" != *"index.html" ]]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0

# 1. Extraire et valider le JS
node -e "
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const s = html.lastIndexOf('<script>'), e = html.lastIndexOf('</script>');
if(s === -1 || e === -1) { console.error('ERREUR: Bloc <script> introuvable'); process.exit(1); }
const js = html.slice(s+8, e);
fs.writeFileSync('/tmp/cmc_hook_verify.js', js);
" 2>/dev/null

if ! node --check /tmp/cmc_hook_verify.js 2>/tmp/cmc_hook_err.txt; then
  ERR=$(cat /tmp/cmc_hook_err.txt)
  echo "❌ SYNTAXE JS INVALIDE après édition d'index.html !" >&2
  echo "$ERR" >&2
  echo "Corriger immédiatement avant de continuer." >&2
  # PostToolUse ne peut pas bloquer, mais le feedback va à Claude
  exit 1
fi

# 2. Vérifier la structure HTML
CHECKS=8
FAILS=0

check_pattern() {
  if ! grep -qF "$1" index.html 2>/dev/null; then
    echo "❌ Pattern manquant: $1" >&2
    FAILS=$((FAILS + 1))
  fi
}

check_pattern 'id="app"'
check_pattern 'id="toast"'
check_pattern 'id="ov"'
check_pattern 'var AID'
check_pattern 'var DATA_VER'
check_pattern 'var APP_VER'
check_pattern 'function esc('
check_pattern 'function render('

# 3. Vérifier pas de conflits git
if grep -q '<<<<<<\|>>>>>>' index.html 2>/dev/null; then
  echo "❌ Marqueurs de conflit git détectés dans index.html !" >&2
  FAILS=$((FAILS + 1))
fi

# 4. Vérifier la taille
SIZE=$(wc -c < index.html)
if [ "$SIZE" -lt 200000 ]; then
  echo "⚠️ index.html fait seulement $((SIZE / 1024)) KB — données possiblement manquantes" >&2
  FAILS=$((FAILS + 1))
fi

if [ "$FAILS" -gt 0 ]; then
  echo "⚠️ $FAILS problème(s) détecté(s) sur $CHECKS vérifications après édition d'index.html" >&2
  exit 1
fi

JS_LINES=$(wc -l < /tmp/cmc_hook_verify.js)
echo "✅ index.html vérifié : syntaxe JS OK ($JS_LINES lignes), structure intacte, $((SIZE / 1024)) KB"
exit 0
