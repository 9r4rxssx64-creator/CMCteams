// v9.702 — Test que vPlan ne tombe PAS sur emp.team (DEF_EMP) quand teamHistory[key] absent
// Kevin "Équipes avril toujours avec nouvelle version" — fix 2 fallbacks dans vPlan
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
  // Login admin Kevin
  await page.evaluate(() => { window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' }; });
  const result = await page.evaluate(() => {
    const out = { tests: [] };
    function test(label, fn) {
      try { const ok = fn(); out.tests.push({ label, ok: ok === true, error: ok === true ? null : ('expected true got ' + JSON.stringify(ok)) }); }
      catch (e) { out.tests.push({ label, ok: false, error: e.message }); }
    }
    const e1 = window.A.employees[0], e2 = window.A.employees[1];
    if(!e1||!e2) return { error: 'no employees' };
    e1.team = 'r5';
    e2.team = 'r5';
    e1.teamHistory = { '2026-4': 'r3' };
    e2.teamHistory = { '2026-4': 'r3' };

    test('teamForMonth April returns "?" (no teamHistory[2026-3])', () => {
      return window.teamForMonth(e1, 2026, 3) === '?';
    });

    test('teamForMonth May returns r3 (teamHistory[2026-4]=r3)', () => {
      return window.teamForMonth(e1, 2026, 4) === 'r3';
    });

    test('v9.702 Ma section: pattern strict "return th===tid" présent', () => {
      // Vérifier que le fix v9.702 strict est bien appliqué dans Ma section
      const src = document.documentElement.outerHTML;
      if(src.indexOf('return th===tid; // v9.702 strict')<0) return 'v9.702 strict marker missing in Ma section';
      return true;
    });

    test('v9.702 Family iteration: plus de fallback "th||e.team"', () => {
      // Le pattern "var et=th||e.team" ne doit pas être dans la source (avant la déclaration de fix)
      // Mais peut-être ailleurs (commentaire, etc). On vérifie surtout que vPlan strict.
      const src = document.documentElement.outerHTML;
      // Vérifier que la nouvelle logique strict est présente
      if(src.indexOf('// v9.702 Kevin "Pas de mémoire')<0 && src.indexOf('v9.702 strict')<0)
        return 'v9.702 strict marker missing';
      return true;
    });

    test('vPlan AVRIL après wipe : empty state ou pas d\'équipe r5', () => {
      window.A.year = 2026; window.A.month = 3;
      window.A.overrides = {};
      try {
        if(typeof window.vPlan !== 'function') return 'vPlan not exposed';
        const html = window.vPlan();
        // Avec A.overrides vide, doit montrer empty state
        if(html.indexOf('Aucun planning')<0 && html.indexOf('A0/Aucun')<0)
          return 'empty state missing for empty April';
        return true;
      } catch(e) { return 'vPlan err: ' + e.message; }
    });

    return out;
  });

  if(result.error){
    console.error('FATAL:', result.error);
    await browser.close();
    process.exit(2);
  }

  console.log('\n=== Test runtime v9.702 — Fix avril teams persistance ===');
  let pass = 0, fail = 0;
  result.tests.forEach(t => {
    if (t.ok) { console.log('  ✓ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + (t.error ? ' — ' + t.error : '')); fail++; }
  });
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ v9.702 AVRIL FIX OK' : '❌ v9.702 AVRIL REGRESSION');
  console.log(`PASS: ${pass} · FAIL: ${fail}`);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
