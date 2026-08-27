#!/bin/bash
# Publier tout le site sur Cloudflare Pages (projet kdmc-site).
# Appelé par .gitlab-ci.yml (image node:20). ACCOUNT_ID vient du job précédent.
set -euo pipefail
mkdir -p /tmp/_site
tar cf - --exclude=.git --exclude=.gitlab-ci.yml --exclude='*.patch' . | tar xf - -C /tmp/_site
find /tmp/_site -type f -size +24M -print -delete   # limite 25 Mo/fichier chez Pages
echo "fichiers a publier : $(find /tmp/_site -type f | wc -l)"
npx --yes wrangler@3 pages project create kdmc-site --production-branch=main 2>/dev/null \
  || echo "(projet kdmc-site deja present)"
npx --yes wrangler@3 pages deploy /tmp/_site --project-name=kdmc-site --branch=main --commit-dirty=true
echo "OK site publie -> https://kdmc-site.pages.dev"
