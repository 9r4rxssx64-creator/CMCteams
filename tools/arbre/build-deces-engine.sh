#!/usr/bin/env bash
# =============================================================================
# MOTEUR DuckDB-WASM (MVP) → R2  (Kevin « Go tout », 2026-08-05)
# Le paquet npm @duckdb/duckdb-wasm importe 'apache-arrow' en bare-specifier :
# inutilisable tel quel dans un navigateur sans bundler. On le bundle avec esbuild
# (arrow inliné) → duckdb-bundle.mjs autonome. On récupère aussi le wasm MVP, le
# worker MVP et l'extension parquet, et on pousse tout sur engine/ du bucket R2.
# Rapide (~1 min). Indépendant du build des données (579 Mo).
set -euo pipefail
BUCKET="kdmc-deces-insee"
V="1.29.0"
WORK="$(pwd)/_engine"; rm -rf "$WORK"; mkdir -p "$WORK/engine/ext/v1.1.1/wasm_mvp"; cd "$WORK"

echo "== 1) Bundle du JS principal (esbuild, arrow inliné) =="
npm init -y >/dev/null 2>&1
npm install --silent "@duckdb/duckdb-wasm@${V}" apache-arrow esbuild >/dev/null 2>&1
printf "export * as duckdb from '@duckdb/duckdb-wasm';\n" > entry.mjs
npx --yes esbuild entry.mjs --bundle --format=esm --outfile=engine/duckdb-bundle.mjs --log-level=error
echo "  bundle: $(du -h engine/duckdb-bundle.mjs | cut -f1)"

echo "== 2) wasm MVP + worker MVP (depuis node_modules, pas de CDN) =="
DIST="node_modules/@duckdb/duckdb-wasm/dist"
cp "$DIST/duckdb-mvp.wasm" engine/duckdb-mvp.wasm
cp "$DIST/duckdb-browser-mvp.worker.js" engine/duckdb-browser-mvp.worker.js
echo "  wasm: $(du -h engine/duckdb-mvp.wasm | cut -f1) · worker: $(du -h engine/duckdb-browser-mvp.worker.js | cut -f1)"

echo "== 3) Extension parquet (self-host, alignée wasm_mvp) =="
curl -fsSL "https://extensions.duckdb.org/v1.1.1/wasm_mvp/parquet.duckdb_extension.wasm" \
  -o engine/ext/v1.1.1/wasm_mvp/parquet.duckdb_extension.wasm \
  && echo "  extension parquet OK ($(du -h engine/ext/v1.1.1/wasm_mvp/parquet.duckdb_extension.wasm | cut -f1))" \
  || echo "  ⚠ extension parquet : échec (à vérifier version DuckDB)"

echo "== 4) Upload engine/ sur R2 =="
put(){ npx --yes wrangler@3 r2 object put "$BUCKET/$2" --file="$1" ${3:+--content-type=$3} >/dev/null 2>&1 && echo "  ↑ $2" || echo "  ✘ $2"; }
put engine/duckdb-bundle.mjs                                  "engine/duckdb-bundle.mjs"                                  text/javascript
put engine/duckdb-mvp.wasm                                    "engine/duckdb-mvp.wasm"                                    application/wasm
put engine/duckdb-browser-mvp.worker.js                      "engine/duckdb-browser-mvp.worker.js"                      text/javascript
put engine/ext/v1.1.1/wasm_mvp/parquet.duckdb_extension.wasm "engine/ext/v1.1.1/wasm_mvp/parquet.duckdb_extension.wasm" application/wasm
echo "OK — moteur sur https://pub-1a8025a4d1634431908305a40060beda.r2.dev/engine/"
