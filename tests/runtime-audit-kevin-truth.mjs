// v9.655 — Test de validation contre la VÉRITÉ TERRAIN de Kevin (mai/juin 2026)
// Charge index.html, simule import via setup overrides directes,
// puis vérifie que mon algo détecte exactement les équipes confirmées par Kevin.

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, '../index.html');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto('file://' + INDEX_PATH, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.A === 'object' && typeof window._cmcDetectTeamsByRestPattern === 'function' && typeof window.familyForMonth === 'function', { timeout: 20000 });
  await page.evaluate(() => { window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' }; });

  const result = await page.evaluate(() => {
    const out = { tests: [] };
    function test(label, fn) {
      try { const ok = fn(); out.tests.push({ label, ok: ok === true, error: ok === true ? null : ('expected true got ' + JSON.stringify(ok)) }); }
      catch (e) { out.tests.push({ label, ok: false, error: e.message }); }
    }

    // ─── Setup mai 2026 V1 avec données Kevin confirmées ───
    const key = '2026-4';
    window.A.year = 2026; window.A.month = 4;
    window.A.overrides = window.A.overrides || {};
    window.A.overrides[key] = {};
    window.A.employees.forEach(e => { 
      if (e.teamHistory) delete e.teamHistory[key];
      if (e.familyHistory) delete e.familyHistory[key];
    });

    // Helper : trouve un emp par nom (case insensitive normalize)
    function findEmp(name) {
      const norm = name.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();
      return window.A.employees.find(e => {
        const en = (e.name||'').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();
        return en === norm;
      });
    }

    // Filter aux emps existant dans DEF_EMP (sinon le parser réel les créerait)
    // Équipe A roulettes : BARONE+4 (RH days [5,11,17,23,29], code 20/5 jour 1)
    const teamARequest = ['BARONE E', 'AUREGLIA R', 'PARIZIA K', 'GANCIA G', 'DAGIONI M'];
    const teamA = teamARequest.filter(findEmp);
    const teamASkipped = teamARequest.filter(n => !findEmp(n));
    const cyclePattern = ['20/5','19/4','16/22','14/19','RH','R','22/6\'','19/4""','16/3','14/19\'','RH','R','20/5','19/4','16/22','14/19','RH','R','22/6\'','19/4""','16/3','14/19\'','RH','R','20/5','19/4','16/22','14/19','RH','R','22/6\''];
    teamA.forEach(n => {
      const e = findEmp(n); if (!e) return;
      const r = {};
      cyclePattern.forEach((c,i) => r[i+1] = c);
      window.A.overrides[key][e.id] = r;
    });

    // Miroir A' : BASILE+5 (RH days [5,11,17,23,29], code 22/6' jour 1)
    const mirrorARequest = ['BASILE F', 'RINALDI S', 'SIRIO J', 'MALENFANT PJ', 'MILLET T', 'MARCHI T'];
    const mirrorA = mirrorARequest.filter(findEmp);
    const mirrorASkipped = mirrorARequest.filter(n => !findEmp(n));
    const cycleMirror = ['22/6\'','19/4""','16/3','14/19\'','RH','R','20/5','19/4','16/22','14/19','RH','R','22/6\'','19/4""','16/3','14/19\'','RH','R','20/5','19/4','16/22','14/19','RH','R','22/6\'','19/4""','16/3','14/19\'','RH','R','20/5'];
    mirrorA.forEach(n => {
      const e = findEmp(n); if (!e) return;
      const r = {};
      cycleMirror.forEach((c,i) => r[i+1] = c);
      window.A.overrides[key][e.id] = r;
    });

    out.skipped = {teamA: teamASkipped, mirrorA: mirrorASkipped, totalUsed: teamA.length + mirrorA.length};

    // Run algo
    const res = window._cmcDetectTeamsByRestPattern(2026, 4);

    test('v9.655 : algo retourne ok=true', () => res && res.ok === true);
    test('v9.655 : détecte 2 équipes (A et A miroir)', () => res && res.report && res.report.teams === 2);
    test('v9.655 : assigne tous les emps trouvés dans DEF_EMP', () => res && res.report && res.report.empsAssigned === (teamA.length + mirrorA.length));
    test('v9.655 : 1 paire miroir détectée', () => res && res.report && res.report.mirrors === 1);
    test('v9.655 : cycle 6 détecté', () => res && res.report && res.report.cycles.indexOf(6) >= 0);
    test('v9.655 : 2 emps team A (premiers présents) ont même teamId', () => {
      // Use first 2 team A emps that exist in DEF_EMP (skip absents like AUREGLIA si absent)
      const present = teamA.map(findEmp).filter(Boolean);
      if (present.length < 2) return 'not enough present';
      return present[0].teamHistory[key] === present[1].teamHistory[key];
    });
    test('v9.655 : BARONE et BASILE équipes différentes (équipe vs miroir)', () => {
      const a = findEmp('BARONE E'), b = findEmp('BASILE F');
      return a && b && a.teamHistory && b.teamHistory
        && a.teamHistory[key] !== b.teamHistory[key];
    });
    test('v9.655 : emps team A trouvés ont même teamId', () => {
      const ids = teamA.map(n => { const e = findEmp(n); return e && e.teamHistory && e.teamHistory[key]; });
      return ids.length >= 2 && ids.every(id => id === ids[0]) && ids[0] != null;
    });
    test('v9.655 : emps miroir A trouvés ont même teamId', () => {
      const ids = mirrorA.map(n => { const e = findEmp(n); return e && e.teamHistory && e.teamHistory[key]; });
      return ids.length >= 2 && ids.every(id => id === ids[0]) && ids[0] != null;
    });
    test('v9.655 : cmc_team_mirror_<key> contient le mapping', () => {
      const m = JSON.parse(localStorage.getItem('cmc_team_mirror_'+key) || '{}');
      const a = findEmp('BARONE E'), b = findEmp('BASILE F');
      if (!a || !b || !a.teamHistory || !b.teamHistory) return false;
      return m[a.teamHistory[key]] === b.teamHistory[key]
          && m[b.teamHistory[key]] === a.teamHistory[key];
    });

    return out;
  });

  console.log('\n=== Test runtime v9.655 — vérité terrain Kevin mai V1 ===');
  if (result.error) { console.error('FATAL:', result.error); await browser.close(); process.exit(2); }
  let pass = 0, fail = 0;
  result.tests.forEach(t => {
    if (t.ok) { console.log('  ✓ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + (t.error ? ' — ' + t.error : '')); fail++; }
  });
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ VÉRITÉ TERRAIN Kevin OK' : '❌ REGRESSION sur données terrain');
  console.log(`PASS: ${pass} · FAIL: ${fail}`);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
