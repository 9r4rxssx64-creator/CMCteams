#!/usr/bin/env bash
# Vercel — faut-il construire ce push ? (sortie 0 = ignorer, 1 = construire)
#
# Pourquoi ce fichier existe : `ignoreCommand` est limitée à 256 caractères par le schéma
# Vercel, et celle-ci en faisait 647. Résultat : le vercel.json ENTIER était refusé
# (« schema validation failed »), donc AUCUNE exclusion ne s'appliquait — chaque push de
# chaque branche déclenchait un déploiement, et un mail d'échec partait chez Kevin.
# Trouvé le 6.09.2026 en lisant la vraie raison de l'échec (mêmes symptômes que la clé
# `_note` de tools/agent/vercel.json, corrigée le même jour). Garde : npm run test:vercel-conforme.
#
# Règle : la logique longue vit ICI ; vercel.json se contente de l'appeler.
# Comportement inchangé : on ignore le push si RIEN n'a bougé en dehors des chemins
# ci-dessous (documentation, CI, dossiers d'autres projets, tests, journaux…).
set -u
exec git diff HEAD^ HEAD --quiet -- . \
  ":(exclude)*.md" \
  ":(exclude).github/**" \
  ":(exclude)CHANGELOG*" \
  ":(exclude)NOTES_USER*" \
  ":(exclude)MEMO_RESUME*" \
  ":(exclude)GUIDE_IPHONE*" \
  ":(exclude)MCP_INSTALL*" \
  ":(exclude)INTEGRATION_STANDARD*" \
  ":(exclude)TODO_REMINDERS*" \
  ":(exclude)CLAUDE*.md" \
  ":(exclude)README.md" \
  ":(exclude)_PROJECTS_KDMC/**" \
  ":(exclude)SETUP_FOR_LATER/**" \
  ":(exclude)tools/agent/**" \
  ":(exclude)arbre/**" \
  ":(exclude)tools/arbre/**" \
  ":(exclude)services/**" \
  ":(exclude)tests/**" \
  ":(exclude)pipeline/**" \
  ":(exclude)audit/**" \
  ":(exclude).gitlab-ci.yml" \
  ":(exclude)tools/gitlab/**" \
  ":(exclude)tools/pipeline/**" \
  ":(exclude)vercel.json"
