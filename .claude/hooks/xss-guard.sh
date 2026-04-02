#!/bin/bash
# Hook PreToolUse (Edit) — Vérifie les risques XSS dans les éditions d'index.html
# Analyse le new_string pour détecter innerHTML sans esc()

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
NEW_STR=$(echo "$INPUT" | jq -r '.tool_input.new_string // empty' 2>/dev/null)

# Ne vérifier que les éditions d'index.html
if [[ "$FILE" != *"index.html" ]]; then
  exit 0
fi

# Si le nouveau code contient innerHTML avec des variables non échappées
if echo "$NEW_STR" | grep -qE 'innerHTML.*\$\{[^}]*\}|innerHTML.*\+\s*[a-zA-Z]'; then
  # Vérifier si esc() est utilisé
  # Extraire les variables dans les template literals
  VARS=$(echo "$NEW_STR" | grep -oE '\$\{[^}]+\}' | grep -v 'esc(' | grep -v 'tc(' | grep -v 'Math\.' | grep -v '\.length' | grep -v '\.id' | grep -v 'parseInt' | grep -v 'MFR\[' | grep -v '===\|!==\|>.*?\|<.*?')

  if [ -n "$VARS" ]; then
    # Filtrer les faux positifs (nombres, constantes connues)
    SUSPECT=$(echo "$VARS" | grep -iE 'name|text|msg|chat|input|value|titre|contenu|message' || true)

    if [ -n "$SUSPECT" ]; then
      echo "⚠️ Risque XSS potentiel dans l'édition d'index.html" >&2
      echo "Variables dans innerHTML sans esc() :" >&2
      echo "$SUSPECT" >&2
      echo "Vérifier que esc() est utilisé pour : $SUSPECT" >&2
      # Ne pas bloquer, mais avertir
      exit 0
    fi
  fi
fi

exit 0
