// v9.729 — Test runtime : tailles d'équipes après détection par colonne PDF.
//
// Bug Kevin 2026-05-22 : « beaucoup d'équipe a 1-2 personne ». Cause : PDF.js
// fragmente une rangée d'employés en 2 lignes (ligne A = codes-poste seuls,
// ligne B = noms seuls). _extractEntries n'extrayait rien → colonnes
// sous-remplies → équipes de 1-2 personnes (ex équipe chefs BJ = 2 au lieu de 5).
//
// Fix v9.729 : _mergePosteNameLines() ré-interleave les paires A+B avant parsing.
//
// Ce test importe le VRAI texte PDF SBM mai 2026 V1 fourni par Kevin
// (tests/fixtures/mai-2026-v1-full.txt) et vérifie que les équipes BJ et
// roulettes ne sont plus fragmentées (aucune ≤2 employés).

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

async function main() {
  const txt = fs.readFileSync(resolve(ROOT, 'tests/fixtures/mai-2026-v1-full.txt'), 'utf8');
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto('file://' + resolve(ROOT, 'index.html'),
    { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(
    () => typeof window.A === 'object' && typeof window._cmcDetectTeamsByPdfColumn === 'function',
    { timeout: 20000 });

  const r = await page.evaluate((txt) => {
    window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' };
    window._cmcDetectTeamsByPdfColumn(txt, 2026, 4);
    const key = '2026-4', tc = {};
    window.A.employees.forEach(e => {
      const t = e.teamHistory && e.teamHistory[key];
      if (t) {
        if (!tc[t]) tc[t] = { n: 0, fam: null };
        tc[t].n++;
        tc[t].fam = (e.familyHistory && e.familyHistory[key]) || tc[t].fam;
      }
    });
    return tc;
  }, txt);

  await browser.close();

  const tests = [];
  function check(label, ok, detail) { tests.push({ label, ok: !!ok, detail: detail || '' }); }

  const entries = Object.entries(r);
  // BJ : teamId numérique pur ; roulettes : préfixe r ; cmc : préfixe c
  const bj = entries.filter(([id]) => /^\d+$/.test(id));
  const roul = entries.filter(([id]) => /^r\d+$/.test(id));
  const cmc = entries.filter(([id]) => /^c\d+$/.test(id));

  check('équipes détectées', entries.length >= 20, entries.length + ' équipes');
  check('chefs BJ : 6 équipes', bj.length === 6, bj.map(([k, v]) => k + ':' + v.n).join(' '));
  // Le bug : équipes chefs BJ fragmentées à 1-2. Après fix → toutes ≥ 3.
  const bjSmall = bj.filter(([, v]) => v.n <= 2);
  check('chefs BJ : aucune équipe ≤2 emps', bjSmall.length === 0,
    bjSmall.length ? bjSmall.map(([k, v]) => k + ':' + v.n).join(' ') : 'toutes ≥3');
  // Roulettes : aucune équipe ≤2 (sauf cas légitime — ici toutes pleines).
  const roulSmall = roul.filter(([, v]) => v.n <= 2);
  check('roulettes : aucune équipe ≤2 emps', roulSmall.length === 0,
    roulSmall.length ? roulSmall.map(([k, v]) => k + ':' + v.n).join(' ') : 'toutes ≥3');
  // Tailles BJ/roulettes plausibles (3-8) — pas de team ballonnée par bloc non fermé.
  const oversize = bj.concat(roul).filter(([, v]) => v.n > 8);
  check('chefs BJ + roulettes : aucune équipe >8 emps', oversize.length === 0,
    oversize.length ? oversize.map(([k, v]) => k + ':' + v.n).join(' ') : 'toutes ≤8');
  // L'équipe chefs BJ "2" (la colonne 19/4'c) doit être pleine (le bug la donnait à 2).
  const t2 = r['2'];
  check('équipe chefs BJ "2" remplie (≥4)', t2 && t2.n >= 4, t2 ? ('2:' + t2.n) : 'absente');

  console.log('=== AUDIT TAILLES ÉQUIPES — mai 2026 V1 (texte réel Kevin) ===');
  tests.forEach(t => console.log((t.ok ? '  ✓ ' : '  ✗ ') + t.label + ' — ' + t.detail));
  const pass = tests.filter(t => t.ok).length;
  console.log('PASS: ' + pass + ' · FAIL: ' + (tests.length - pass));
  if (pass === tests.length) { console.log('✅ TAILLES ÉQUIPES OK'); process.exit(0); }
  console.log('❌ FRAGMENTATION ÉQUIPES DÉTECTÉE'); process.exit(1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
