#!/bin/bash
# Publier tout le site sur Cloudflare Pages (projet kdmc-site).
# Le contenu est place a la racine ET sous /CMCteams/ : github.io servait tout
# derriere ce prefixe, et les apps (index.html notamment) chargent des chemins
# absolus /CMCteams/... — sans la copie, ces chargements tombent dans le vide.
set -euo pipefail
# ⚠️ CE DÉPÔT EST PRIVÉ, LE SITE PUBLIÉ EST PUBLIC.
# Tout ce qui n'est pas destiné à des inconnus doit être exclu ICI, sinon la
# publication le met en ligne. Ajouté le 5.09.2026 en synchronisant les deux
# dépôts : les documents ci-dessous ne vivent que sur GitLab (privé) précisément
# parce qu'ils nomment des personnes vivantes de la famille ou portent des
# identifiants de compte. Les publier annulerait la raison de les y garder.
# NB : arbre/research/actesimg/ N'EST PAS exclu — l'app arbre s'en sert
# réellement à l'exécution (19 références dans arbre/index.html, vérifié).
#
# MESURÉ le 5.09 avant d'élargir : AUCUNE page ne charge un fichier .md depuis
# le site. Les seuls renvois vers des .md dans le code sont des adresses
# ABSOLUES vers github.com / raw.githubusercontent.com (c'est ainsi qu'Apex
# relit ses documents), et aucun service worker n'en met en cache. D'où
# `--exclude='*.md'` : la règle se maintient toute seule, un document ajouté
# demain est exclu sans qu'on pense à l'écrire ici. Les noms qui suivent
# restent listés pour les cas qui ne sont PAS des Markdown.
tar cf /tmp/site.tar --exclude=.git --exclude=.gitlab-ci.yml --exclude='*.patch' \
  --exclude='*.md' \
  --exclude='patrimoine' \
  --exclude='patrimoine-resultats' \
  --exclude='pipeline' \
  --exclude='audit' \
  --exclude='memo' \
  --exclude='CLAUDE_HANDOFF.json' \
  --exclude='actes.json' \
  .
mkdir -p /tmp/_deploy/CMCteams
tar xf /tmp/site.tar -C /tmp/_deploy
tar xf /tmp/site.tar -C /tmp/_deploy/CMCteams
find /tmp/_deploy -type f -size +24M -print -delete   # limite 25 Mo/fichier chez Pages
echo "fichiers a publier : $(find /tmp/_deploy -type f | wc -l)"
npx --yes wrangler@3 pages project create kdmc-site --production-branch=main 2>/dev/null \
  || echo "(projet kdmc-site deja present)"
npx --yes wrangler@3 pages deploy /tmp/_deploy --project-name=kdmc-site --branch=main --commit-dirty=true
echo "OK site publie -> https://kdmc-site.pages.dev"
