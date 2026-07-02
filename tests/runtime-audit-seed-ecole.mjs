// Régression v9.849 — le SEED (tools/shared/planning-seed.js) porte le marqueur école
// roulette Europe (ecole[]) et l'app le rend STICKY : sur un mois SANS données live,
// le seed applique famille=roulettes + marqueur ecoleRoulette pour les cartes KE, et
// ces employés RESTENT roulettes après la détection différée + le wipe familyHistory
// one-shot (cmc_v805_famreset). Prouve que « import direct dans l'app » (via seed)
// fonctionne sans ré-import manuel, pour Juillet ET Août.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SEED_JS = readFileSync(resolve(root, 'tools/shared/planning-seed.js'), 'utf8');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newContext({ viewport: { width: 390, height: 844 } }).then(c => c.newPage());
  const perr = []; page.on('pageerror', e => perr.push(e.message));
  // sous file:// le <script src="/CMCteams/…"> ne résout pas → on injecte le seed nous-mêmes.
  await page.addInitScript(SEED_JS);
  await page.goto('file://' + resolve(root, 'index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => window.CMC_PLANNING_SEED && window.A && Array.isArray(A.employees) && typeof window._cmcApplyPlanningSeed === 'function', { timeout: 20000 });

  const check = await page.evaluate(async () => {
    const res = {};
    for (const [key, label, targets, controls] of [
      ['2026-6', 'Juillet', ['BARILARO A', 'SANTINI K', 'SERRA N', 'ELENA C', 'CABALLERO PA'], ['SONDOORKHAN N', 'MARTINI M']],
      ['2026-7', 'Août', null, null]
    ]) {
      // s'assure que le mois n'a PAS de données live puis applique le seed
      A.overrides = A.overrides || {}; delete A.overrides[key];
      A.employees.forEach(e => { if (e.familyHistory) delete e.familyHistory[key]; if (e.teamHistory) delete e.teamHistory[key]; if (e.ecoleRoulette) delete e.ecoleRoulette[key]; });
      try { localStorage.removeItem('cmc_v805_famreset'); } catch (_) {}
      window.__CMC_NO_SEED = false;
      _cmcApplyPlanningSeed();
      // force la chaîne différée COMPLÈTE (wipe one-shot inclus) comme au boot réel
      const y = 2026, m = parseInt(key.split('-')[1]);
      try { if (typeof _cmcDetectTeamsByRestPattern === 'function') _cmcDetectTeamsByRestPattern(y, m); } catch (_) {}
      const seed = window.CMC_PLANNING_SEED.months[key];
      const famOf = nm => { const e = A.employees.find(x => (x.name || '').toUpperCase().trim() === nm.toUpperCase().trim()); return e ? ((e.familyHistory && e.familyHistory[key]) || e.family || '?') : 'ABSENT'; };
      // simule le wipe one-shot déféré (le vrai boot le fait) puis re-vérifie
      if (!localStorage.getItem('cmc_v805_famreset')) {
        A.employees.forEach(_e => { if (_e && _e.familyHistory) { for (const _fk in _e.familyHistory) { if (_e.ecoleRoulette && _e.ecoleRoulette[_fk]) _e.familyHistory[_fk] = 'roulettes'; else delete _e.familyHistory[_fk]; } } });
        localStorage.setItem('cmc_v805_famreset', '1');
      }
      const ecoleIds = seed.ecole || [];
      const stillRoul = ecoleIds.filter(id => { const e = A.employees.find(x => x.id === id); return e && (e.familyHistory && e.familyHistory[key]) === 'roulettes'; }).length;
      res[key] = { label, nEcole: ecoleIds.length, stillRoul, targets: targets ? targets.map(t => [t, famOf(t)]) : null, controls: controls ? controls.map(t => [t, famOf(t)]) : null };
    }
    return res;
  });

  ok(perr.length === 0, 'aucune erreur page (' + perr.join(' | ') + ')');
  for (const key of ['2026-6', '2026-7']) {
    const r = check[key];
    ok(r.nEcole > 0, r.label + ' : le seed porte des écoliers KE (' + r.nEcole + ')');
    ok(r.stillRoul === r.nEcole, r.label + ' : ' + r.stillRoul + '/' + r.nEcole + ' école RESTENT roulettes après wipe (sticky)');
    if (r.targets) r.targets.forEach(([t, f]) => ok(f === 'roulettes', '  ' + t + ' → ' + f));
    if (r.controls) r.controls.forEach(([t, f]) => ok(/cmc|baccara/.test(f), '  contrôle ' + t + ' → ' + f + ' (reste carte)'));
  }
  await page.context().close();
} finally { await browser.close(); }

console.log('\nSEED-ÉCOLE : ' + pass + ' OK / ' + fail + ' KO');
process.exit(fail ? 1 : 0);
