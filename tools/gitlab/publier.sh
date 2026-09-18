#!/bin/bash
# Publier LE SITE (pas le dépôt) sur Cloudflare Pages — projet kdmc-site.
set -euo pipefail

# ═════════════════════════════════════════════════════════════════════════════
# RÉÉCRIT LE 15.09.2026 — Kevin : « passe tout en privé, que personne ne puisse
# voir mon code ». En le préparant, j'ai mesuré ce que ce script envoyait :
#
#   AVANT : `tar cf … .` = LE DÉPÔT ENTIER moins une douzaine d'exclusions.
#           Partaient donc en ligne, sur une adresse publique :
#             services/       2 049 fichiers  (le code de TOUS les workers)
#             apex-ai/       37 498 fichiers  (tout le source TypeScript d'Apex)
#             .github/          193 fichiers  (les automatisations)
#             tests/            188 fichiers
#
#   Autrement dit : mettre le dépôt GitHub en privé n'aurait RIEN caché, parce
#   que le même code était publié ici. Deux portes, on n'en fermait qu'une.
#
#   APRÈS : on envoie le MÊME paquet trié que la publication GitHub — les
#           applications, et rien d'autre. Un seul fabricant de paquet pour les
#           deux chemins : deux recettes séparées finissent toujours par
#           diverger, et c'est la divergence qui fait fuiter.
#
# Ce script reste le chemin de SECOURS (si GitHub est indisponible). Le chemin
# normal est .github/workflows/publier-site-prive.yml.
# ═════════════════════════════════════════════════════════════════════════════

RACINE="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$RACINE"

node services/kdmc-router/prepare-secours.mjs --pages
PAQUET="services/kdmc-router/pages-upload"
test -d "$PAQUET" || { echo "ERREUR : paquet absent"; exit 1; }

# ── Garde AVANT envoi : publier est irréversible ─────────────────────────────
# Ce qui est parti a été servi. On contrôle donc ici, pas après.
fuite=0
md=$(find "$PAQUET" -name '*.md' | wc -l)
[ "$md" -eq 0 ] || { echo "ERREUR : $md document(s) Markdown dans le paquet"; fuite=1; }
for interdit in services tests .github .git pipeline audit apex-ai; do
  [ ! -e "$PAQUET/$interdit" ] || { echo "ERREUR : $interdit ne doit jamais être publié"; fuite=1; }
done
maps=$(find "$PAQUET" -name '*.map' | wc -l)
[ "$maps" -eq 0 ] || { echo "ERREUR : $maps carte(s) de code source (.map)"; fuite=1; }
[ "$fuite" -eq 0 ] || { echo "PUBLICATION ANNULÉE — le paquet contient ce qui doit rester privé."; exit 1; }

echo "fichiers a publier : $(find "$PAQUET" -type f | wc -l)"

npx --yes wrangler@3 pages project create kdmc-site --production-branch=main 2>/dev/null \
  || echo "(projet kdmc-site deja present)"
npx --yes wrangler@3 pages deploy "$PAQUET" --project-name=kdmc-site --branch=main --commit-dirty=true
echo "OK site publie -> https://kdmc-site.pages.dev"

# Vérification réelle : les 26 adresses répondent-elles depuis le site publié ?
# Un « deploy OK » qui sert des pages vides n'est pas une réussite (leçon #95).
sleep 10
node tools/audit/sonde-site-publie.mjs https://kdmc-site.pages.dev --racine
