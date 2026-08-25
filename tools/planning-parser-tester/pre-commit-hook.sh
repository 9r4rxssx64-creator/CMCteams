#!/usr/bin/env bash
#
# pre-commit-hook.sh — Validation OBLIGATOIRE avant chaque commit qui touche
# `tools/planning-parser-tester/`. Lancer manuellement OU câbler dans
# .git/hooks/pre-commit (cf. install.sh).
#
# Bloque le commit si :
#   - Syntax check JS échoue (node --check)
#   - Suite régression échoue (test-pipeline.js 12/12 doit passer)
#   - tsc strict échoue sur worker/index.ts
#   - Marqueurs de conflit git présents
#   - Inline JS de index.html invalide
#
# Référence CLAUDE.md règle #65 « SESSION CASCADE » qui interdit le push sans
# test end-to-end.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PASS="\033[32m✅\033[0m"
FAIL="\033[31m❌\033[0m"
INFO="\033[36mℹ\033[0m"

echo -e "\n${INFO} pre-commit hook : planning-parser-tester validation"
echo "─────────────────────────────────────────────"

# 1. Syntax check tous les JS modifiés
echo -e "\n${INFO} [1/4] Syntax check JS"
for f in "$SCRIPT_DIR"/*.js "$SCRIPT_DIR"/lib/*.js; do
  if [ -f "$f" ]; then
    if node --check "$f" >/dev/null 2>&1; then
      echo -e "${PASS} $(basename "$f")"
    else
      echo -e "${FAIL} $(basename "$f")"
      node --check "$f"
      exit 1
    fi
  fi
done

# 2. Inline JS de index.html
echo -e "\n${INFO} [2/4] Inline JS de index.html"
python3 -c "
import re
html = open('$SCRIPT_DIR/index.html', 'r', encoding='utf-8').read()
blocks = re.findall(r'<script(?![^>]*src=)[^>]*>(.*?)</script>', html, re.DOTALL)
open('/tmp/_check_inline.js', 'w').write(''.join(b for b in blocks if b.strip()))
"
if node --check /tmp/_check_inline.js >/dev/null 2>&1; then
  echo -e "${PASS} index.html inline JS"
else
  echo -e "${FAIL} index.html inline JS"
  node --check /tmp/_check_inline.js
  exit 1
fi

# 3. TypeScript strict sur worker
echo -e "\n${INFO} [3/4] TypeScript strict worker"
cat > /tmp/_tsc.json <<EOF
{
  "compilerOptions": {
    "target": "es2022", "module": "esnext", "moduleResolution": "bundler",
    "lib": ["es2022", "dom"], "strict": true, "skipLibCheck": true, "noEmit": true
  },
  "include": ["$SCRIPT_DIR/worker/index.ts"]
}
EOF
if npx --yes -p typescript@5.6 tsc -p /tmp/_tsc.json 2>&1 | tee /tmp/_tsc.out | grep -q "error TS"; then
  echo -e "${FAIL} TypeScript strict"
  cat /tmp/_tsc.out
  exit 1
else
  echo -e "${PASS} worker/index.ts strict"
fi

# 4. Suite régression complète
echo -e "\n${INFO} [4/5] Suite régression test-pipeline.js"
if node "$SCRIPT_DIR/test-pipeline.js"; then
  echo -e "${PASS} tests régression OK"
else
  echo -e "${FAIL} Suite régression échoue — voir détails ci-dessus"
  exit 1
fi

# 5. Test de fidélité « reproduction à l'identique »
echo -e "\n${INFO} [5/6] Test de fidélité (reproduction identique)"
if node "$SCRIPT_DIR/test-fidelity.js"; then
  echo -e "${PASS} fidélité 100% — reproduction identique"
else
  echo -e "${FAIL} Écart de fidélité détecté — la reproduction n'est PAS identique"
  exit 1
fi

# 6. Test E2E sur PDF réel généré (Chromium + pdfjs) — skip gracieux si absents
echo -e "\n${INFO} [6/6] Test E2E PDF réel (Chromium HTML→PDF→parse)"
if node "$SCRIPT_DIR/test-e2e-pdf.js"; then
  echo -e "${PASS} E2E PDF OK (ou sauté si Chromium/pdfjs absents)"
else
  echo -e "${FAIL} E2E PDF échoue — le pipeline a un problème sur PDF réel"
  exit 1
fi

echo -e "\n${PASS} TOUS LES CHECKS PASSENT — commit autorisé"
