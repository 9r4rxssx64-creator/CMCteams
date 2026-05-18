// E2E import flow test : wipe → import mai V2 → verify avril empty + mai correct
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import fs from 'fs';
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
    // 1. Setup : wipe + simulate mai V2 import
    if(typeof cmcWipeAllPlanningMemory==='function')cmcWipeAllPlanningMemory(true);
    
    test('après wipe : A.overrides est vide', () => {
      return Object.keys(window.A.overrides || {}).length === 0;
    });
    
    test('après wipe : aucun emp n\'a teamHistory', () => {
      return window.A.employees.every(e => !e.teamHistory || Object.keys(e.teamHistory).length === 0);
    });
    
    // 2. Simuler import mai V2 : populate A.overrides['2026-4'] + teamHistory
    const e1 = window.A.employees[0], e2 = window.A.employees[1], e3 = window.A.employees[2];
    window.A.overrides['2026-4'] = {};
    window.A.overrides['2026-4'][e1.id] = { 1: 'BRT', 2: 'BRT', 3: 'RH', 4: 'BRT', 5: 'BRT', 6: 'BRT', 7: 'RH', 8: 'BRT', 9: 'BRT', 10: 'BRT', 11: 'RH', 12: 'BRT' };
    window.A.overrides['2026-4'][e2.id] = { 1: 'BRT', 2: 'BRT', 3: 'RH', 4: 'BRT', 5: 'BRT', 6: 'BRT', 7: 'RH', 8: 'BRT', 9: 'BRT', 10: 'BRT', 11: 'RH', 12: 'BRT' };
    e1.teamHistory = { '2026-4': 'r3' };
    e2.teamHistory = { '2026-4': 'r3' };
    e1.team = 'r5'; // DEF_EMP différent — pour vérifier que vPlan utilise teamHistory et PAS emp.team
    e2.team = 'r5';
    
    test('teamForMonth MAI (2026-4) renvoie r3 (teamHistory)', () => {
      return window.teamForMonth(e1, 2026, 4) === 'r3';
    });
    
    test('teamForMonth AVRIL (2026-3) renvoie "?" — pas de mémoire', () => {
      return window.teamForMonth(e1, 2026, 3) === '?';
    });
    
    test('teamForMonth JUIN (2026-5) renvoie "?" — pas de carryover', () => {
      return window.teamForMonth(e1, 2026, 5) === '?';
    });
    
    // 3. Test vPlan MAI : doit afficher r3, pas r5
    window.A.year = 2026; window.A.month = 4; // Mai
    const htmlMai = (typeof window.vPlan === 'function') ? window.vPlan() : '';
    test('vPlan MAI : pas d\'empty state (data présent)', () => {
      return htmlMai.indexOf('Aucun planning pour mai')<0;
    });
    
    test('vPlan MAI : NE contient PAS emp.team r5 (DEF_EMP)', () => {
      // Vérifie que le rendering n'utilise pas la team statique DEF_EMP
      // Check: aucun élément avec "Éq.r5" ou "Eq.r5" visible
      if(htmlMai.indexOf('"Éq.r5"')>=0 || htmlMai.indexOf('Eq.r5')>=0) return 'team r5 (DEF_EMP) appears in May render';
      return true;
    });
    
    // 4. Test vPlan AVRIL : doit montrer empty state
    window.A.year = 2026; window.A.month = 3; // Avril
    const htmlAvril = (typeof window.vPlan === 'function') ? window.vPlan() : '';
    test('vPlan AVRIL : montre empty state "Aucun planning"', () => {
      return htmlAvril.indexOf('Aucun planning')>=0;
    });
    
    test('vPlan AVRIL : ne montre pas d\'équipe r5 (DEF_EMP fantôme)', () => {
      if(htmlAvril.indexOf('Éq.r5')>=0 || htmlAvril.indexOf('Eq.r5')>=0) return 'team r5 ghost in April';
      return true;
    });
    
    // 5. Test vPlan JUIN : doit montrer empty state (pas d'overrides)
    window.A.year = 2026; window.A.month = 5; // Juin
    const htmlJuin = (typeof window.vPlan === 'function') ? window.vPlan() : '';
    test('vPlan JUIN : montre empty state (pas de carryover de mai)', () => {
      return htmlJuin.indexOf('Aucun planning')>=0;
    });
    
    // 6. Family override depuis section PDF (v9.700)
    test('SECTION_TO_FAMILY mapping cohérent', () => {
      const src = document.documentElement.outerHTML;
      // v9.700 mapping: Roulettes→roulettes, Chefs BJ→bj, Employés CMC→cmc, Aménagement→cmc, Formation→bj
      if(src.indexOf('"Roulettes":"roulettes"')<0 && src.indexOf("'Roulettes':'roulettes'")<0)
        return 'SECTION_TO_FAMILY Roulettes mapping missing';
      return true;
    });
    
    // 7. _cmcDetectTeamsByRestPattern toujours exposé
    test('_cmcDetectTeamsByRestPattern fonction exposée', () => {
      return typeof window._cmcDetectTeamsByRestPattern === 'function';
    });
    
    return out;
  });

  console.log('\n=== Test E2E import flow v9.702 — Wipe → Import mai V2 → Avril vide ===');
  let pass = 0, fail = 0;
  result.tests.forEach(t => {
    if (t.ok) { console.log('  ✓ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + (t.error ? ' — ' + t.error : '')); fail++; }
  });
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ IMPORT E2E v9.702 OK' : '❌ IMPORT E2E v9.702 BROKEN');
  console.log(`PASS: ${pass} · FAIL: ${fail}`);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
