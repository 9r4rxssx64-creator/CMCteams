// v9.768 — Test : un emp avec 20 CP + 10 RH/R + teamHistory dans une équipe de
// TRAVAIL (BJ Éq.1 = "1") doit être REASSIGNÉ à "conges" et non rester collé à 1.
// Reproduit le bug Kevin "COURTIN F/COTTALORDA D dans BJ Éq.1" diag JUIN 2026.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, '../index.html');

async function main(){
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await ctx.newPage();
  await page.goto('file://' + INDEX_PATH, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.A === 'object' && Array.isArray(window.A.employees), { timeout: 20000 });

  await page.evaluate(() => { window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' }; });

  const result = await page.evaluate(() => {
    const out = { tests: [] };
    function test(label, fn) {
      try { const ok = fn(); out.tests.push({ label, ok: ok === true, error: ok === true ? null : ('expected true got ' + JSON.stringify(ok)) }); }
      catch (e) { out.tests.push({ label, ok: false, error: e.message }); }
    }
    const iy = 2026, im = 4, key = iy + '-' + im;

    // Setup : 5 emps actifs. 3 ont une rotation normale en équipe "1" (work team).
    // 2 (COURTIN F + COTTALORDA D) sont en CP×20 + RH/R×10 — mais pdf-column les a
    // collés à "1" (faussement, car ils n'ont pas de rotation réelle).
    const e1 = window.A.employees[0]; // travailleur normal
    const e2 = window.A.employees[1]; // travailleur normal
    const e3 = window.A.employees[2]; // travailleur normal
    const e4 = window.A.employees[3]; // COURTIN F simulé : 20 CP + 5 RH + 5 R
    const e5 = window.A.employees[4]; // COTTALORDA D simulé : 20 CP + 5 RH + 5 R
    if(!e1||!e2||!e3||!e4||!e5) return { error: 'pas assez d\'employés' };

    // Forcer la family bj sur tous (pour qu'ils tombent dans Éq.1 via pdf-column)
    [e1,e2,e3,e4,e5].forEach(e => {
      e.family = 'bj';
      e.familyHistory = e.familyHistory || {};
      e.familyHistory[key] = 'bj';
      e.teamHistory = e.teamHistory || {};
      e.teamHistory[key] = '1'; // tous initialement dans BJ Éq.1
    });

    // Cellules : e1/e2/e3 = rotation normale (travail), e4/e5 = full absence CP
    window.A.overrides = window.A.overrides || {};
    window.A.overrides[key] = window.A.overrides[key] || {};
    const buildRotation = () => {
      const r = {};
      for(let d=1; d<=31; d++){
        const cycleDay = (d-1) % 7;
        if(cycleDay === 5) r[d] = 'RH';
        else if(cycleDay === 6) r[d] = 'R';
        else r[d] = '20/5';
      }
      return r;
    };
    const buildAbsenceCP = () => {
      const r = {};
      // 20 CP (jours 1-20) + 5 RH + 5 R (jours 21-30)
      for(let d=1; d<=20; d++) r[d] = 'CP';
      for(let d=21; d<=25; d++) r[d] = 'RH';
      for(let d=26; d<=30; d++) r[d] = 'R';
      return r;
    };
    window.A.overrides[key][e1.id] = buildRotation();
    window.A.overrides[key][e2.id] = buildRotation();
    window.A.overrides[key][e3.id] = buildRotation();
    window.A.overrides[key][e4.id] = buildAbsenceCP();
    window.A.overrides[key][e5.id] = buildAbsenceCP();

    // Lancer le fallback (qui contient v9.744 + v9.764)
    test('_cmcFallbackUnassignedTeams existe', () => typeof window._cmcFallbackUnassignedTeams === 'function');
    if(typeof window._cmcFallbackUnassignedTeams !== 'function') return out;

    try {
      window._cmcFallbackUnassignedTeams(iy, im);
    } catch(e) { return { error: 'fallback err: ' + e.message }; }

    // Vérifications
    test('e1 (rotation) reste dans équipe "1"', () => e1.teamHistory[key] === '1');
    test('e2 (rotation) reste dans équipe "1"', () => e2.teamHistory[key] === '1');
    test('e3 (rotation) reste dans équipe "1"', () => e3.teamHistory[key] === '1');
    test('e4 (CP 20/20 jours non-repos) → équipe "conges"', () => e4.teamHistory[key] === 'conges');
    test('e5 (CP 20/20 jours non-repos) → équipe "conges"', () => e5.teamHistory[key] === 'conges');
    test('équipe "conges" enregistrée dans A.teams', () => !!window.A.teams.find(t => t.id === 'conges'));

    // Bonus : un emp avec 0 jour travaillé + 0 jour non-repos qualifiable (RH/R seulement)
    // doit être purgé par v9.764 (pas dans une équipe d'absence)
    const e6 = window.A.employees[5];
    if(e6){
      e6.family = 'bj';
      e6.familyHistory = e6.familyHistory || {};
      e6.familyHistory[key] = 'bj';
      e6.teamHistory = e6.teamHistory || {};
      e6.teamHistory[key] = '1';
      window.A.overrides[key][e6.id] = { 1:'RH', 2:'R', 3:'RH', 4:'R', 5:'RH', 6:'R', 7:'RH', 8:'R', 9:'RH', 10:'R' }; // seulement RH/R
      try { window._cmcFallbackUnassignedTeams(iy, im); } catch(_) {}
      test('e6 (0 travaillé + 0 CP qualifié) → teamHistory purgé', () => !(e6.teamHistory && e6.teamHistory[key]));
    }

    return out;
  });

  if(result.error){
    console.error('FATAL:', result.error);
    await browser.close();
    process.exit(2);
  }

  console.log('\n=== Test runtime v9.768 — Réassignation absence-team COURTIN F ===');
  let pass = 0, fail = 0;
  result.tests.forEach(t => {
    if (t.ok) { console.log('  ✓ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + (t.error ? ' — ' + t.error : '')); fail++; }
  });
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ v9.768 ABSENCE REASSIGN OK' : '❌ v9.768 ABSENCE REASSIGN REGRESSION');
  console.log(`PASS: ${pass} · FAIL: ${fail}`);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
