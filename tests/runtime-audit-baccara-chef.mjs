// Régression v9.850 — CHEF BACCARA → planning CHEFS (Kevin 2026-07-02 « EHRET G,
// BATTAGLIA D sont chef baccara → devraient être dans les plannings chefs, pas en équipe
// carte »). Un employé dont emp.family DEF_EMP = « baccara » (Punto Banco, pas de section
// propre) et dont les codes du mois sont majoritairement CHEF (suffixe 'c') doit tomber
// en famille bj (chefs) au repli, PAS cmc (cartes). Un croupier baccara (codes sans 'c')
// reste cmc. Vérifie familyForMonth ET _cmcDeriveFamily (rendu + détection d'équipes).
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newContext().then(c => c.newPage());
  const perr = []; page.on('pageerror', e => perr.push(e.message));
  await page.addInitScript(() => { window.__CMC_NO_SEED = true; });
  await page.goto('file://' + resolve(root, 'index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.familyForMonth === 'function' && typeof window._cmcDeriveFamily === 'function' && window.A, { timeout: 20000 });

  const r = await page.evaluate(() => {
    const key = '2026-6';
    const chefCodes = { 1: 'CP', 16: '20/5c', 17: '19/4c', 18: '16/22c', 19: 'RH', 20: 'R', 21: '22/6c', 22: '19/4\'c', 23: '16/3c' };      // majorité 'c' = chef
    const croupCodes = { 1: '20/5', 2: '19/4', 3: '16/22', 4: 'RH', 5: 'R', 6: '22/6', 7: '19/4', 8: '16/3' };                                // pas de 'c' = croupier
    A.employees = [
      { id: 'B1', name: 'EHRET GTEST', family: 'baccara' },   // baccara + chef → doit être bj
      { id: 'B2', name: 'CROUP BTEST', family: 'baccara' },   // baccara + croupier → doit rester cmc
      { id: 'B3', name: 'RCHEF TEST', family: 'roulettes' }   // chef de roulette → reste roulettes (pas touché)
    ];
    A.overrides = { [key]: { B1: chefCodes, B2: croupCodes, B3: { 1: '20/5c', 2: '19/4c', 3: 'RH', 4: 'R', 5: '16/22c' } } };
    A.year = 2026; A.month = 6;
    const ffm = id => familyForMonth(A.employees.find(e => e.id === id), 2026, 6);
    const der = id => { const e = A.employees.find(x => x.id === id); return _cmcDeriveFamily(e, A.overrides[key][id], key); };
    return { b1f: ffm('B1'), b2f: ffm('B2'), b3f: ffm('B3'), b1d: der('B1'), b2d: der('B2'), b3d: der('B3') };
  });

  ok(perr.length === 0, 'aucune erreur page (' + perr.join(' | ') + ')');
  ok(r.b1f === 'bj', 'chef baccara (codes c) → familyForMonth = bj (planning chefs), pas cartes — ' + r.b1f);
  ok(r.b1d === 'bj', 'chef baccara → _cmcDeriveFamily = bj (détection équipes chefs) — ' + r.b1d);
  ok(r.b2f === 'cmc', 'croupier baccara (codes sans c) → familyForMonth = cmc (cartes) — ' + r.b2f);
  ok(r.b2d === 'cmc', 'croupier baccara → _cmcDeriveFamily = cmc — ' + r.b2d);
  ok(r.b3f === 'roulettes', 'chef de roulette (emp.family roulettes) reste roulettes — ' + r.b3f);
  ok(r.b3d === 'roulettes', 'chef de roulette _cmcDeriveFamily reste roulettes — ' + r.b3d);

  await page.context().close();
} finally { await browser.close(); }

console.log('\nBACCARA-CHEF : ' + pass + ' OK / ' + fail + ' KO');
process.exit(fail ? 1 : 0);
