#!/usr/bin/env bash
# Le jugement d'outils EXTÉRIEURS sur ClayScore, en une commande.
#
# Aucun de ces analyseurs n'est une IA : ce sont des outils déterministes,
# écrits par d'autres, qui n'ont aucune raison de nous ménager. C'est
# exactement pour ça qu'ils valent quelque chose — ils ont trouvé, du premier
# coup, un `shell=True` en sévérité HAUTE et 8 annotations de type fausses que
# ni la relecture ni les 344 tests ne voyaient.
#
#   bash tools/audit_externe.sh          # tout
#   bash tools/audit_externe.sh --gate   # seulement ce qui doit BLOQUER
#
# Installation : pip install -e ".[audit]"
set -uo pipefail
cd "$(dirname "$0")/.."

GATE=0
[[ "${1:-}" == "--gate" ]] && GATE=1
ECHECS=0

titre() { printf '\n\033[1m── %s ──\033[0m\n' "$1"; }
verdict() {  # $1 = nom, $2 = code retour, $3 = bloquant(1)/informatif(0)
  if [[ $2 -eq 0 ]]; then printf '   ✅ %s\n' "$1"
  elif [[ $3 -eq 1 ]]; then printf '   ❌ %s\n' "$1"; ECHECS=$((ECHECS+1))
  else printf '   ⚠️  %s (informatif)\n' "$1"; fi
}

titre "ruff — style et erreurs évidentes"
ruff check . ; verdict "ruff" $? 1

titre "mypy — les types disent-ils la vérité ?"
python3 -m mypy clayscore tools --ignore-missing-imports ; verdict "mypy" $? 1

titre "bandit — failles de sécurité (on bloque sur HAUTE)"
python3 -m bandit -r clayscore tools -q -lll ; verdict "bandit (haute)" $? 1

titre "pip-audit — failles connues des dépendances"
python3 -m pip_audit -r requirements.txt --progress-spinner off ; verdict "pip-audit" $? 1

titre "pytest — le comportement"
python3 -m pytest -q ; verdict "tests" $? 1

if [[ $GATE -eq 0 ]]; then
  titre "vulture — code mort (informatif)"
  python3 -m vulture clayscore tools --min-confidence 80 ; verdict "vulture" $? 0
  titre "radon — les fonctions les plus touffues (informatif)"
  python3 -m radon cc clayscore tools -a -nc ; verdict "radon" $? 0
  titre "couverture des tests"
  python3 -m pytest -q --cov=clayscore --cov-report=term | tail -3
fi

printf '\n'
if [[ $ECHECS -eq 0 ]]; then
  printf '\033[1;32m✅ Les relecteurs extérieurs ne trouvent rien de bloquant.\033[0m\n'
else
  printf '\033[1;31m❌ %d contrôle(s) bloquant(s) en échec — à corriger avant de livrer.\033[0m\n' "$ECHECS"
fi
exit $ECHECS
