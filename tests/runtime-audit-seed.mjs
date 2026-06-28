// v9.824 — vérifie le SEED de planning partagé (tools/shared/planning-seed.js) :
//  - appliqué au boot pour les mois VIDES (affichage), employés + cellules + familles + miroir
//  - JAMAIS appliqué si window.__CMC_NO_SEED (harness d'import)
//  - n'ÉCRASE JAMAIS des données live (hasLive)
// NB : en file://, le <script src="/CMCteams/..."> ne se charge pas → on injecte
// le contenu du seed via addInitScript pour exercer le VRAI chemin de boot.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
const __dirname = dirname(fileURLToPath(import.meta.url));

const seedJs = readFileSync(resolve(__dirname, '../tools/shared/planning-seed.js'), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

async function boot(browser, { noSeed }) {
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  // injecte le seed AVANT tout script de page (= comme le <script src> en prod)
  await page.addInitScript(seedJs);
  if (noSeed) await page.addInitScript(() => { window.__CMC_NO_SEED = true; });
  await page.goto('file://' + resolve(__dirname, '../index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => window.A && Array.isArray(A.employees), { timeout: 20000 });
  return { page, errs };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  console.log('SEED v9.824 — application au boot');

  // A — boot AVEC seed (mois vides) → doit remplir 2026-7 et 2026-6
  {
    const { page, errs } = await boot(browser, { noSeed: false });
    const r = await page.evaluate(() => {
      const cnt = k => { const o = (A.overrides || {})[k] || {}; return Object.keys(o).filter(id => o[id] && Object.keys(o[id]).length > 0).length; };
      const cells = k => { const o = (A.overrides || {})[k] || {}; return Object.keys(o).reduce((s, id) => s + Object.keys(o[id] || {}).length, 0); };
      const famCnt = k => A.employees.filter(e => e && e.familyHistory && e.familyHistory[k]).length;
      let mir = {}; try { mir = JSON.parse(localStorage.getItem('cmc_team_mirror_2026-6') || '{}'); } catch (_) {}
      return { seedLoaded: !!window.CMC_PLANNING_SEED, e7: cnt('2026-7'), c7: cells('2026-7'), e6: cnt('2026-6'), c6: cells('2026-6'), fam6: famCnt('2026-6'), mir: Object.keys(mir).length };
    });
    ok(r.seedLoaded, 'seed injecté (window.CMC_PLANNING_SEED présent)');
    ok(r.e7 > 50 && r.c7 > 1000, 'Août 2026-7 rempli (' + r.e7 + ' emps, ' + r.c7 + ' cellules)');
    ok(r.e6 > 50 && r.c6 > 1000, 'Juillet 2026-6 rempli (' + r.e6 + ' emps, ' + r.c6 + ' cellules)');
    ok(r.fam6 > 50, 'familyHistory posée sur les emps (' + r.fam6 + ')');
    ok(r.mir > 0, 'miroir 2026-6 restauré (' + r.mir + ' entrées)');
    ok(errs.length === 0, 'aucune erreur page (' + errs.length + ')');
    await page.context().close();
  }

  // B — boot AVEC __CMC_NO_SEED → ne doit RIEN remplir
  {
    const { page } = await boot(browser, { noSeed: true });
    const r = await page.evaluate(() => {
      const cnt = k => { const o = (A.overrides || {})[k] || {}; return Object.keys(o).filter(id => o[id] && Object.keys(o[id]).length > 0).length; };
      return { e7: cnt('2026-7'), e6: cnt('2026-6') };
    });
    ok(r.e7 === 0 && r.e6 === 0, '__CMC_NO_SEED → seed désactivé (Août ' + r.e7 + ', Juillet ' + r.e6 + ')');
    await page.context().close();
  }

  // C — n'écrase pas des données live (hasLive)
  {
    const { page } = await boot(browser, { noSeed: false });
    const r = await page.evaluate(() => {
      A.overrides['2026-7'] = { U_LIVE: { 1: 'XX' } }; // donnée live sentinelle
      const applied = _cmcApplyPlanningSeed();
      const o = A.overrides['2026-7'] || {};
      return { applied, kept: !!(o.U_LIVE && o.U_LIVE[1] === 'XX'), nIds: Object.keys(o).length };
    });
    ok(r.kept && r.nIds === 1, 'données live préservées, seed ne ré-écrit pas (ids=' + r.nIds + ')');
    await page.context().close();
  }

  await browser.close();
  console.log('\nSEED : ' + pass + ' OK / ' + fail + ' KO');
  if (fail) process.exit(1);
}
main().catch(e => { console.error(e); process.exit(1); });
