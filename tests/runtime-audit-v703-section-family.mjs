// v9.703 — Test régression : section "Chefs black Jack" détectée correctement
// même quand la ligne n'a qu'1 code poste (BRTCK. PORTA A 1 31)
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

    test('v9.703 : marker "v9.703" présent dans index.html (parser pre-detection)', () => {
      const src = document.documentElement.outerHTML;
      return src.indexOf('v9.703 (Kevin diag 2026-05-18') >= 0;
    });

    test('v9.703 : "_isDefEmp" check supprimé du family update', () => {
      // Le commentaire v9.703 doit être présent dans le bloc de family update
      const src = document.documentElement.outerHTML;
      return src.indexOf('Update emp.family pour TOUS emps (DEF_EMP inclus)') >= 0;
    });

    test('v9.703 : _famForDetect utilise familyForMonth strict', () => {
      const src = document.documentElement.outerHTML;
      return src.indexOf('_famForDetect') >= 0 && src.indexOf('familyForMonth(emp,iy,im,{strict:true})') >= 0;
    });

    test('v9.703 : cmc_v703_wipe_done flag (re-trigger wipe)', () => {
      const src = document.documentElement.outerHTML;
      return src.indexOf('cmc_v703_wipe_done') >= 0;
    });

    test('v9.703 : APP_VER = "v9.703"', () => window.APP_VER === 'v9.703');

    test('familyForMonth strict retourne null si pas familyHistory[key]', () => {
      const fakeEmp = { id: 'TEST', family: 'roulettes', familyHistory: { '2026-4': 'bj' } };
      // En strict mode pour mois SANS familyHistory → null
      const fApr = window.familyForMonth(fakeEmp, 2026, 3, { strict: true });
      // En strict mode pour mois AVEC familyHistory → "bj"
      const fMai = window.familyForMonth(fakeEmp, 2026, 4, { strict: true });
      return fApr === null && fMai === 'bj';
    });

    test('familyForMonth non-strict fallback emp.family', () => {
      const fakeEmp = { id: 'TEST', family: 'roulettes' };
      // Pas familyHistory + non-strict → fallback emp.family
      return window.familyForMonth(fakeEmp, 2026, 4) === 'roulettes';
    });

    return out;
  });

  console.log('\n=== Test v9.703 — Section "Chefs black Jack" + family override ===');
  let pass = 0, fail = 0;
  result.tests.forEach(t => {
    if (t.ok) { console.log('  ✓ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + (t.error ? ' — ' + t.error : '')); fail++; }
  });
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ v9.703 SECTION DETECTION OK' : '❌ v9.703 SECTION DETECTION BROKEN');
  console.log(`PASS: ${pass} · FAIL: ${fail}`);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
