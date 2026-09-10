// v9.742 (Kevin 2026-05-26 RÈGLE ABSOLUE) :
// "Tout le monde a un planning sans exception du moment que son nom est écrit dans le planning."
//
// Pour chaque emp dont le nom apparaît dans le texte source PDF avec une période
// `from to` valide, on EXIGE Object.keys(A.overrides[key][emp.id]).length > 0.
//
// Sentinelle anti-régression : si un nom du PDF a 0 cellule → FAIL → bloque CI.

import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, '../index.html');
const FIXTURE_PATH = resolve(__dirname, 'fixtures/mai-2026-v1-real.txt');

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
// Hors ligne : la page (file://) ne parle ni à Firebase ni à quiconque — sinon, sur un runner
// avec réseau (GitLab), la synchro peut arriver au milieu de l'import et fausser la mesure.
// Le sandbox Claude Code n'a pas de réseau et passait 280/0 ; le runner GitLab, 255/27.
await ctx.route(/^https?:\/\//, (r) => r.abort());
const page = await ctx.newPage();
await page.goto('file://' + INDEX_PATH, { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForFunction(() => typeof window.A === 'object' && Array.isArray(window.A.employees) && typeof window.doImport === 'function');
await page.waitForTimeout(800);

const txt = readFileSync(FIXTURE_PATH, 'utf-8');

// Extrait tous les noms `SURNAME INIT from to` du texte source.
// Regex large pour matcher tous les formats : `BRTP+. NAME I 1 31`, `.BRTP NAME I 4 8`, etc.
const nameRe = /(?:[\.\w+]{2,12}\s+)?([A-Z][A-Z][A-Z\s\-']{0,30}[A-Z])\s+([A-Z]{1,3})\s*\*?\s+(\d{1,2})\s+(\d{1,2})/g;
const pdfNames = new Set();
let m;
while ((m = nameRe.exec(txt)) !== null) {
  const from = parseInt(m[3]), to = parseInt(m[4]);
  if (from >= 1 && from <= 31 && to >= from && to <= 31) {
    pdfNames.add((m[1] + ' ' + m[2]).trim());
  }
}

const result = await page.evaluate(async (txt) => {
  const adminEmp = window.A.employees.find(e => e.id === window.AID);
  window.A.user = adminEmp;
  window.A.year = 2026; window.A.month = 4;

  const txtArea = document.createElement('textarea');
  txtArea.id = 'impTxt'; txtArea.value = txt; txtArea.style.display='none';
  document.body.appendChild(txtArea);
  const yEl = document.createElement('input'); yEl.id='impY'; yEl.value='2026'; yEl.style.display='none'; document.body.appendChild(yEl);
  const mEl = document.createElement('input'); mEl.id='impM'; mEl.value='4'; mEl.style.display='none'; document.body.appendChild(mEl);

  window._lastImportText = txt;
  try { window.doImport(); } catch (e) { return { error: 'doImport: ' + e.message }; }
  // Attente STABLE, pas 3 s fixes : l'import est asynchrone et un runner lent (GitLab, job
  // 16332450700 : 27 noms à 0 cellule) n'a pas fini en 3 s. On attend que le nombre de
  // cellules importées cesse de bouger pendant 2 s (plafond 60 s).
  await new Promise((done) => {
    const count = () => { const o = (window.A.overrides && window.A.overrides['2026-4']) || {}; let n = 0; for (const id in o) n += Object.keys(o[id] || {}).length; return n; };
    let last = -1, stableSince = Date.now(); const t0 = Date.now();
    const tick = () => { const n = count(); if (n !== last) { last = n; stableSince = Date.now(); }
      if ((n > 0 && Date.now() - stableSince >= 2000) || Date.now() - t0 > 60000) return done(); setTimeout(tick, 250); };
    setTimeout(tick, 1000);
  });

  const key = '2026-4';
  const ov = window.A.overrides[key] || {};
  const empByName = new Map();
  window.A.employees.forEach(e => empByName.set(e.name, e));
  const cells = (name) => {
    const emp = empByName.get(name);
    if (!emp) return null;
    return Object.keys(ov[emp.id] || {}).filter(d => !!ov[emp.id][d]).length;
  };
  return { empByName: Array.from(empByName.keys()), cells };
}, txt);

console.log('=== TEST RÈGLE KEVIN 2026-05-26 ===');
console.log('Noms extraits du PDF mai 2026 V1 :', pdfNames.size);

let pass = 0, fail = 0, skipped = 0;
const failedNames = [];

for (const name of pdfNames) {
  // Le test utilise eval côté browser → on doit re-évaluer cells
  const cells = await page.evaluate((n) => {
    const emp = window.A.employees.find(e => e.name === n);
    if (!emp) return -1; // not in DB
    if (typeof window.isEmpActive === 'function' && !window.isEmpActive(emp, 2026, 4)) return -2; // inactive ce mois
    const ov = (window.A.overrides && window.A.overrides['2026-4']) || {};
    return Object.keys(ov[emp.id] || {}).filter(d => !!ov[emp.id][d]).length;
  }, name);

  if (cells === -1 || cells === -2) { skipped++; continue; } // not in DB OU inactif
  if (cells > 0) pass++;
  else { fail++; failedNames.push(name); }
}

console.log(`\n📊 PASS: ${pass} · FAIL: ${fail} · SKIPPED (nom PDF absent DB): ${skipped}`);

if (fail > 0) {
  console.log('\n❌ EMPLOYÉS DONT LE NOM EST DANS LE PDF MAIS 0 CELLULE ATTRIBUÉE :');
  failedNames.forEach(n => console.log('  - ' + n));
  console.log('\nRègle absolue Kevin 2026-05-26 violée. Voir CLAUDE.md.');
  await browser.close();
  process.exit(1);
}

console.log('\n✅ RÈGLE KEVIN respectée : tous les noms du PDF ont ≥1 cellule.');
await browser.close();
process.exit(0);
