#!/bin/bash
# APEX/CMCteams — SessionStart hook (mode ASYNC)
# Optimise le démarrage de session Claude Code : installe les dépendances
# des projets actifs du monorepo pour que tests / lint / build / typecheck
# soient prêts — quelle que soit la branche.
#
# Mode ASYNC (Kevin 2026-05-22) : la session démarre IMMÉDIATEMENT, le hook
# tourne en arrière-plan. La 1re ligne stdout DOIT être le JSON {"async":true}.
# Idempotent : si node_modules existe déjà → skip (rapide). Non-interactif.
# Non-bloquant par projet : l'échec d'un projet n'abat pas le hook.
echo '{"async": true, "asyncTimeout": 300000}'

set -uo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-/home/user/CMCteams}"

# Installe les deps d'un projet npm si absentes (idempotent).
install_project() {
  local dir="$1" label="$2"
  [ -f "$dir/package.json" ] || return 0
  if [ -d "$dir/node_modules" ]; then
    echo "[hook] ${label} : deps déjà présentes ✓"
    return 0
  fi
  echo "[hook] ${label} : installation des dépendances…"
  ( cd "$dir" && PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install --no-audit --no-fund 2>&1 | tail -2 ) \
    || echo "[hook] ${label} : install échouée — la session continue (dégradé)"
}

# Projets actifs du monorepo (build/lint/test réels) :
install_project "$ROOT"               "CMCteams (racine)"
install_project "$ROOT/apex-ai/v13"   "Apex v13"
install_project "$ROOT/messaging-app" "Apex Chat (messaging-app)"

# Vérifie Chromium/Playwright pour les tests E2E (déjà fourni par l'env web).
if node -e "const v=require('playwright/package.json').version;process.exit(v.startsWith('1.5')?0:1)" 2>/dev/null; then
  echo "[hook] Playwright + Chromium prêts pour les tests E2E ✓"
fi

echo "[hook] environnement prêt — tests / lint / build / typecheck disponibles"
