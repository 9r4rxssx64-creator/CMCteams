#!/usr/bin/env node
/**
 * Résolveur d'imports statique — vérifie que chaque import relatif et chaque
 * import alias (@services @core @ui @features @workers @modules) pointe vers
 * un fichier réellement présent. Substitut de `tsc` pour valider un
 * refactoring de pur déplacement (aucune erreur de type possible — seules les
 * erreurs "module introuvable" peuvent apparaître, et c'est ce qu'on teste).
 *
 * Exit 1 si au moins un import casse.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['node_modules', 'dist', '.git', 'coverage', 'playwright-report']);
const ALIASES = {
  '@core/': 'core/', '@services/': 'services/', '@modules/': 'modules/',
  '@features/': 'features/', '@ui/': 'ui/', '@workers/': 'workers/',
};

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(p); }
    else if (e.name.endsWith('.ts') || e.name.endsWith('.tsx')) files.push(p);
  }
})(ROOT);

function exists(base) {
  const cands = [];
  if (base.endsWith('.js')) cands.push(base.replace(/\.js$/, '.ts'), base.replace(/\.js$/, '.tsx'));
  cands.push(base, base + '.ts', base + '.tsx', base + '.js', base + '.d.ts',
    path.join(base, 'index.ts'), path.join(base, 'index.tsx'));
  for (const c of cands) { try { if (fs.statSync(c).isFile()) return true; } catch { /* noop */ } }
  return false;
}

const IMPORT_RE = /\b(?:from|import)\s*\(?\s*(['"])([^'"\n]+)\1/g;
const broken = [];
let checked = 0;

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  let m;
  IMPORT_RE.lastIndex = 0;
  while ((m = IMPORT_RE.exec(src))) {
    const spec = m[2];
    let abs = null;
    if (spec.startsWith('./') || spec.startsWith('../')) {
      abs = path.resolve(path.dirname(f), spec);
    } else {
      for (const [a, dir] of Object.entries(ALIASES)) {
        if (spec.startsWith(a)) { abs = path.join(ROOT, dir, spec.slice(a.length)); break; }
      }
    }
    if (!abs) continue; // import de package npm — hors scope
    checked++;
    if (!exists(abs)) {
      broken.push({ file: path.relative(ROOT, f), spec });
    }
  }
}

console.log('Imports internes vérifiés: ' + checked + ' dans ' + files.length + ' fichiers');
if (broken.length) {
  console.error('\n❌ ' + broken.length + ' import(s) cassé(s) :');
  for (const b of broken) console.error('  ' + b.file + '  ->  ' + b.spec);
  process.exit(1);
}
console.log('✅ Tous les imports internes résolvent.');
