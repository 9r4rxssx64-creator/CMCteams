#!/bin/bash
# Publier tout le site sur Cloudflare Pages (projet kdmc-site).
# Le contenu est place a la racine ET sous /CMCteams/ : github.io servait tout
# derriere ce prefixe, et les apps (index.html notamment) chargent des chemins
# absolus /CMCteams/... — sans la copie, ces chargements tombent dans le vide.
set -euo pipefail
tar cf /tmp/site.tar --exclude=.git --exclude=.gitlab-ci.yml --exclude='*.patch' .
mkdir -p /tmp/_deploy/CMCteams
tar xf /tmp/site.tar -C /tmp/_deploy
tar xf /tmp/site.tar -C /tmp/_deploy/CMCteams
find /tmp/_deploy -type f -size +24M -print -delete   # limite 25 Mo/fichier chez Pages
echo "fichiers a publier : $(find /tmp/_deploy -type f | wc -l)"
npx --yes wrangler@3 pages project create kdmc-site --production-branch=main 2>/dev/null \
  || echo "(projet kdmc-site deja present)"
npx --yes wrangler@3 pages deploy /tmp/_deploy --project-name=kdmc-site --branch=main --commit-dirty=true
echo "OK site publie -> https://kdmc-site.pages.dev"
