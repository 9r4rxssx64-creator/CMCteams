#!/usr/bin/env bash
# =============================================================================
# DÉCÈS INSEE → PARQUET PARTITIONNÉ → Cloudflare R2  (Kevin « Go tout », 2026-08-05)
# Télécharge le fichier des personnes décédées (INSEE / data.gouv, Licence Ouverte),
# le parse (format largeur fixe), nettoie, trie par (nom, prénoms), partitionne par
# 1ʳᵉ lettre du nom en Parquet ZSTD, puis pousse le tout sur R2 (public + CORS déjà
# configurés par le préflight). Écrit aussi le moteur DuckDB-WASM + l'extension parquet.
# Réseau OUVERT requis (runner CI). Idempotent : réécrase le bucket.
set -euo pipefail
BUCKET="kdmc-deces-insee"
PUBLIC="pub-1a8025a4d1634431908305a40060beda.r2.dev"
export DUCKDB_WASM_VER="1.29.0"
WORK="$(pwd)/_deces"
mkdir -p "$WORK/raw" "$WORK/parts"
cd "$WORK"

echo "== 1) Liste des ressources data.gouv (fichier des personnes décédées) =="
DS="5de8f397634f4164071119c5"   # dataset officiel INSEE « Fichier des personnes décédées »
curl -sS "https://www.data.gouv.fr/api/1/datasets/$DS/" -o dataset.json
python3 - <<'PY'
import json
d=json.load(open('dataset.json'))
res=[r for r in d.get('resources',[]) if (r.get('format','').lower() in ('txt','csv') or (r.get('title','').lower().startswith('deces')))]
urls=[]
for r in res:
    t=(r.get('title') or '').lower(); u=r.get('url') or ''
    if u and 'deces' in t and (t.endswith('.txt') or 'deces-20' in t or 'deces-19' in t or 'deces-2' in t):
        urls.append((t,u))
# dédoublonne, garde .txt annuels + mensuels récents
seen=set(); out=[]
for t,u in urls:
    if u in seen: continue
    seen.add(u); out.append(u)
open('urls.txt','w').write('\n'.join(out))
print('ressources décès retenues :', len(out))
PY
echo "  $(wc -l < urls.txt) fichiers à télécharger"

echo "== 2) Téléchargement =="
i=0; while read -r u; do [ -z "$u" ] && continue; i=$((i+1)); curl -fsSL "$u" -o "raw/f_$i.txt" || echo "  (échec $u)"; done < urls.txt
ls -la raw | tail -3; du -sh raw

echo "== 3) DuckDB : parse largeur fixe → nettoyage → tri → partition Parquet =="
pip install --quiet duckdb >/dev/null 2>&1 || true
python3 - <<'PY'
import duckdb, glob, os
con=duckdb.connect()
con.execute("PRAGMA memory_limit='5GB'"); con.execute("PRAGMA temp_directory='_tmp'")
files=[f.replace('\\','/') for f in glob.glob('raw/*.txt')]
assert files, "aucun fichier brut"
# lit chaque ligne entière (délimiteur improbable) puis découpe par positions INSEE
con.execute(f"""
CREATE VIEW src AS
SELECT l FROM read_csv({files!r}, columns={{'l':'VARCHAR'}}, delim='\x1f', header=false, quote='', escape='', ignore_errors=true);
""")
con.execute("""
CREATE TABLE d AS
WITH p AS (
  SELECT
    trim(split_part(substr(l,1,80),'*',1))                         AS nom,
    trim(replace(split_part(substr(l,1,80),'*',2),'/',' '))        AS prenoms,
    substr(l,81,1)                                                  AS sexe,
    substr(l,82,8)                                                  AS date_naissance,
    substr(l,90,5)                                                  AS code_lieu_naissance,
    trim(substr(l,95,30))                                          AS commune_naissance,
    trim(substr(l,125,30))                                         AS pays_naissance,
    substr(l,155,8)                                                 AS date_deces,
    substr(l,163,5)                                                 AS code_lieu_deces,
    trim(substr(l,168,9))                                          AS num_acte
  FROM src
  WHERE length(l)>=176
)
SELECT * FROM p
WHERE nom <> '' AND date_deces ~ '^(19[7-9]\\d|20\\d\\d)[0-1]\\d[0-3]\\d$'
""")
n=con.execute("SELECT count(*) FROM d").fetchone()[0]
print("lignes valides:", n)
os.makedirs('parts',exist_ok=True)
con.execute("""
COPY (SELECT nom,prenoms,sexe,date_naissance,code_lieu_naissance,commune_naissance,pays_naissance,
             date_deces,code_lieu_deces,num_acte,
             CASE WHEN upper(substr(nom,1,1)) BETWEEN 'A' AND 'Z' THEN upper(substr(nom,1,1)) ELSE 'AUTRE' END AS lettre
      FROM d ORDER BY nom, prenoms)
TO 'parts' (FORMAT PARQUET, PARTITION_BY (lettre), COMPRESSION ZSTD, OVERWRITE_OR_IGNORE);
""")
print("partitions écrites")
PY
echo "  taille des parts : $(du -sh parts | cut -f1)"
find parts -name '*.parquet' | head -5

echo "== 4) Moteur DuckDB-WASM + extension parquet (self-host) =="
mkdir -p engine/ext/v1.1.1/wasm_mvp
BASE="https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@${DUCKDB_WASM_VER}/dist"
curl -fsSL "$BASE/duckdb-mvp.wasm" -o engine/duckdb-mvp.wasm
curl -fsSL "$BASE/duckdb-browser-mvp.worker.js" -o engine/duckdb-browser-mvp.worker.js
# extension parquet officielle (version alignée au wasm mvp)
curl -fsSL "https://extensions.duckdb.org/v1.1.1/wasm_mvp/parquet.duckdb_extension.wasm" \
  -o engine/ext/v1.1.1/wasm_mvp/parquet.duckdb_extension.wasm || echo "  (extension parquet : à vérifier version)"
ls -la engine engine/ext/v1.1.1/wasm_mvp

echo "== 5) Upload R2 (partitions + moteur) =="
put(){ npx --yes wrangler@3 r2 object put "$BUCKET/$2" --file="$1" ${3:+--content-type=$3} >/dev/null 2>&1 && echo "  ↑ $2" || echo "  ✘ $2"; }
# moteur
put engine/duckdb-mvp.wasm "engine/duckdb-mvp.wasm" application/wasm
put engine/duckdb-browser-mvp.worker.js "engine/duckdb-browser-mvp.worker.js" text/javascript
put engine/ext/v1.1.1/wasm_mvp/parquet.duckdb_extension.wasm "engine/ext/v1.1.1/wasm_mvp/parquet.duckdb_extension.wasm" application/wasm
# partitions
while IFS= read -r f; do rel="${f#parts/}"; put "$f" "parts/$rel" application/octet-stream; done < <(find parts -name '*.parquet')

echo "== 6) Config publique + manifeste des partitions =="
# liste réelle des fichiers parquet écrits (paths relatifs à parts/), + nb lignes total
python3 - "$PUBLIC" <<'PY' > config.json
import sys, glob, os, json, re
pub=sys.argv[1]
files=sorted(glob.glob('parts/**/*.parquet', recursive=True))
manifest={}
for f in files:
    rel=f[len('parts/'):]                      # ex: lettre=A/data_0.parquet
    m=re.search(r'lettre=([^/]+)', rel)
    k=m.group(1) if m else 'AUTRE'
    manifest.setdefault(k,[]).append('parts/'+rel)
import datetime
print(json.dumps({
  "base":"https://"+pub, "engine":"https://"+pub+"/engine",
  "duckdb_wasm":os.environ.get("DUCKDB_WASM_VER",""),
  "source":"INSEE / data.gouv — Licence Ouverte 2.0",
  "built":datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
  "letters":sorted(manifest.keys()),
  "parts":manifest
}, ensure_ascii=False, indent=2))
PY
cat config.json | head -40
put config.json "config.json" application/json
echo "OK — données + moteur + manifeste sur https://$PUBLIC/  (config.json)"
