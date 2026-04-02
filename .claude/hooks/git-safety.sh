#!/bin/bash
# Hook PreToolUse (Bash) — Sécurité git pour CMCteams
# Bloque les opérations git dangereuses et vérifie avant commit/push

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)

# Ne traiter que les commandes git
if ! echo "$COMMAND" | grep -q 'git '; then
  exit 0
fi

# === BLOQUAGES CRITIQUES ===

# Bloquer push --force sur main
if echo "$COMMAND" | grep -qE 'git\s+push\s+.*--force.*\s+.*main|git\s+push\s+-f.*\s+.*main'; then
  echo "🛑 BLOQUÉ : push --force sur main interdit. Cela peut détruire l'historique de production." >&2
  exit 2
fi

# Bloquer reset --hard sans confirmation
if echo "$COMMAND" | grep -qE 'git\s+reset\s+--hard'; then
  echo "🛑 BLOQUÉ : git reset --hard peut détruire du travail non commité. Utiliser git stash ou git checkout -- <fichier> à la place." >&2
  exit 2
fi

# Bloquer clean -f (suppression fichiers non suivis)
if echo "$COMMAND" | grep -qE 'git\s+clean\s+-[a-zA-Z]*f'; then
  echo "🛑 BLOQUÉ : git clean -f supprime des fichiers définitivement. Vérifier d'abord avec git clean -n." >&2
  exit 2
fi

# Bloquer branch -D (suppression force)
if echo "$COMMAND" | grep -qE 'git\s+branch\s+-D\s+main'; then
  echo "🛑 BLOQUÉ : suppression de la branche main interdite." >&2
  exit 2
fi

# === AVERTISSEMENTS (pas de blocage) ===

# Avertir sur commit sans avoir validé le JS
if echo "$COMMAND" | grep -qE 'git\s+commit'; then
  cd "$CLAUDE_PROJECT_DIR" 2>/dev/null
  # Vérifier si index.html est dans les fichiers stagés
  if git diff --cached --name-only 2>/dev/null | grep -q 'index.html'; then
    # Valider le JS rapidement
    node -e "
    const fs = require('fs');
    const html = fs.readFileSync('index.html', 'utf8');
    const s = html.lastIndexOf('<script>'), e = html.lastIndexOf('</script>');
    if(s === -1 || e === -1) process.exit(1);
    fs.writeFileSync('/tmp/cmc_precommit.js', html.slice(s+8, e));
    " 2>/dev/null && node --check /tmp/cmc_precommit.js 2>/dev/null

    if [ $? -ne 0 ]; then
      echo "🛑 BLOQUÉ : index.html contient une erreur de syntaxe JS. Corriger avant de commit." >&2
      exit 2
    fi
  fi
fi

# Avertir sur push vers main directement
if echo "$COMMAND" | grep -qE 'git\s+push\s+.*\s+main\b|git\s+push\s+-u\s+origin\s+main'; then
  echo "⚠️ Attention : push direct sur main déclenche le déploiement GitHub Pages." >&2
  # Ne pas bloquer, juste avertir
fi

exit 0
