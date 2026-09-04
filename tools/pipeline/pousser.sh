#!/bin/bash
# POUSSER SUR GITLAB — sans jamais écrire le jeton sur le disque.
# ---------------------------------------------------------------------------
# Pourquoi ce script existe (vécu le 2-3.09.2026) :
#
#  1. GitHub est suspendu. Toutes les sessions poussent sur GitLab.
#  2. Le jeton NE DOIT JAMAIS être enregistré (pas de `git remote add` avec le
#     jeton dedans, pas de credential helper) — règle de sécurité de Kevin,
#     ETAT-INFRA.md fait n°7. On l'écrit donc dans l'URL, au moment du push.
#  3. Mais un push par URL en clair NE MET PAS À JOUR le repère local
#     `refs/remotes/origin/<branche>` — le contrôle de fin de tour croit alors
#     qu'il reste des commits à pousser, et réclame un push déjà fait, en
#     boucle. Ce script remet le repère à jour APRÈS un push réussi : c'est
#     vrai, GitLab a bien le commit, on vient de l'y mettre.
#
# Usage :
#   GITLAB_TOKEN=glpat-xxx ./tools/pipeline/pousser.sh              # sa branche
#   GITLAB_TOKEN=glpat-xxx ./tools/pipeline/pousser.sh main         # vers main
#
# Le jeton n'est lu que dans l'environnement, jamais stocké, jamais affiché
# (toute sortie est filtrée avant d'être montrée).
set -uo pipefail

DEPOT="gitlab.com/kdmc-group/Kdmc-project.git"
BRANCHE_LOCALE="$(git branch --show-current)"
CIBLE="${1:-$BRANCHE_LOCALE}"

if [[ -z "${GITLAB_TOKEN:-}" ]]; then
  echo "✗ GITLAB_TOKEN manquant." >&2
  echo "  Relance :  GITLAB_TOKEN=glpat-… $0 ${1:-}" >&2
  exit 1
fi
if [[ -z "$BRANCHE_LOCALE" ]]; then
  echo "✗ Tête détachée : pas de branche courante." >&2
  exit 1
fi

# Le filtre masque le jeton dans TOUTE sortie, y compris les messages d'erreur
# de git qui réaffichent l'URL complète.
masquer() { sed -E 's#//[^@/]*@#//***@#g'; }

echo "→ push  ${BRANCHE_LOCALE}  →  GitLab ${CIBLE}"
if ! git push "https://oauth2:${GITLAB_TOKEN}@${DEPOT}" \
       "HEAD:refs/heads/${CIBLE}" 2>&1 | masquer; then
  echo "✗ push refusé — le repère local n'est PAS touché (il reste honnête)." >&2
  exit 1
fi

# Push accepté : GitLab a bien ce commit, on peut le dire au repère local.
if [[ "$CIBLE" == "$BRANCHE_LOCALE" ]]; then
  git update-ref "refs/remotes/origin/${CIBLE}" HEAD
  echo "✓ poussé, et repère local origin/${CIBLE} remis à $(git rev-parse --short HEAD)"
else
  git update-ref "refs/remotes/origin/${CIBLE}" HEAD
  echo "✓ poussé sur ${CIBLE} (repère origin/${CIBLE} mis à jour)"
fi
