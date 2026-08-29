#!/bin/bash
# Faire renaitre UN worker sur le nouveau compte Cloudflare (Desarzens-Kevin).
# - cree les espaces KV / seaux R2 manquants, adapte la config, deploie.
# - refuse honnetement les workers a Durable Objects / Vectorize (migration a part).
# Usage: bash tools/gitlab/deployer-worker.sh services/<dossier>
set -euo pipefail
DIR="$1"; NOM=$(grep -m1 '^name' "$DIR/wrangler.toml" | cut -d'"' -f2)
echo "== $NOM =="
if grep -qE "durable_objects|vectorize" "$DIR/wrangler.toml"; then
  echo "   SKIP : ce worker utilise Durable Objects/Vectorize -> migration dediee plus tard"; exit 0
fi
TOML="$DIR/.wrangler-nouveau.toml"   # DANS le dossier : wrangler resout main= par rapport a la config
KVLISTE=$(node tools/gitlab/preparer-toml.mjs "$DIR" "$TOML")
# R2 : les seaux sont references par NOM -> les creer s'ils manquent
grep -oE 'bucket_name\s*=\s*"[^"]+"' "$DIR/wrangler.toml" | cut -d'"' -f2 | sort -u | while read -r B; do
  SORTIE=$(npx --yes wrangler@3 r2 bucket create "$B" 2>&1) && echo "   seau R2 cree: $B" || {
    echo "$SORTIE" | grep -qi "already exists" && echo "   seau R2 deja la: $B" || { echo "   ECHEC creation seau $B — message complet :"; echo "$SORTIE"; exit 1; }
  }
done
# KV : creer et injecter les nouveaux ids
if [ -n "$KVLISTE" ]; then
  while IFS=$'\t' read -r BINDING ANCIEN; do
    SORTIE=$(npx --yes wrangler@3 kv:namespace create "$BINDING" 2>&1 || true)
    ID=$(echo "$SORTIE" | grep -oE 'id = "[a-f0-9]{32}"' | head -1 | cut -d'"' -f2)
    if [ -z "$ID" ]; then # existe peut-etre deja -> le retrouver
      ID=$(npx --yes wrangler@3 kv:namespace list | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);const m=j.find(n=>n.title.endsWith('$BINDING'));console.log(m?m.id:'')})")
    fi
    [ -n "$ID" ] || { echo "   ECHEC creation KV $BINDING"; exit 1; }
    sed -i "s/@@${BINDING}@@/${ID}/" "$TOML"
    echo "   KV $BINDING -> $ID (neuf, vide — les donnees restent dans l'ancien compte)"
  done <<< "$KVLISTE"
fi
( cd "$DIR" && npx --yes wrangler@3 deploy --config .wrangler-nouveau.toml )
rm -f "$TOML"
echo "   OK $NOM vivant -> https://${NOM}.desarzens-kevin.workers.dev"
