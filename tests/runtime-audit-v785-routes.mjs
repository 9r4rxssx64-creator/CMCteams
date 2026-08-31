// v9.785 — Test fonctionnel réel (Playwright) : les 3 dernières routes mortes sont
// désormais câblées sur de VRAIES vues (architecture : zéro route morte restante).
//  - crossteamactivity → vCrossTeamActivity() (nouvelle vue réelle, stats chat)
//  - parserintel       → vParserIntelligence() = vParserLearning() (vue existante)
//  - parsercompare     → vParserCompare() = vImportVersions() (vue existante)
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

  const result = await page.evaluate(() => {
    const out = { tests: [] };
    function test(label, fn){
      try { const ok = fn(); out.tests.push({ label, ok: ok === true, error: ok === true ? null : ('got ' + JSON.stringify(ok)) }); }
      catch (e) { out.tests.push({ label, ok: false, error: e.message }); }
    }
    const STUB1 = 'en cours de développement';
    const STUB2 = 'Vue temporairement indisponible';

    test('vCrossTeamActivity définie', () => typeof window.vCrossTeamActivity === 'function');
    test('vParserIntelligence définie', () => typeof window.vParserIntelligence === 'function');
    test('vParserCompare définie', () => typeof window.vParserCompare === 'function');

    window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' };

    test('admin : crossteamactivity rend la vraie vue (pas le stub)', () => {
      window.A.view = 'crossteamactivity';
      const h = window.vMain();
      return typeof h === 'string' && h.length > 50 && h.indexOf('Activité cross-team') >= 0 && h.indexOf(STUB1) < 0;
    });
    test('admin : parserintel rend une vraie vue (pas le stub)', () => {
      window.A.view = 'parserintel';
      const h = window.vMain();
      return typeof h === 'string' && h.length > 50 && h.indexOf(STUB2) < 0;
    });
    test('admin : parsercompare rend une vraie vue (pas le stub)', () => {
      window.A.view = 'parsercompare';
      const h = window.vMain();
      return typeof h === 'string' && h.length > 50 && h.indexOf(STUB2) < 0;
    });

    // non-admin : routes admin renvoient le garde admin (pas la vue)
    test('non-admin : crossteamactivity NE rend PAS la vue admin', () => {
      window.A.user = { id: 'U00001', name: 'Employe' };
      window.A.view = 'crossteamactivity';
      const h = window.vMain();
      return typeof h === 'string' && h.indexOf('Top contributeurs') < 0;
    });

    return out;
  });

  await browser.close();

  let pass = 0, fail = 0;
  console.log('\n=== Test runtime v9.785 — routes cross-team / parser (vraies vues) ===\n');
  for (const t of result.tests) {
    if (t.ok) { console.log('  ✓ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + '  [' + t.error + ']'); fail++; }
  }
  console.log('\n========================================');
  console.log((fail === 0 ? '✅' : '❌') + ' v9.785 ROUTES RÉELLES — PASS: ' + pass + ' · FAIL: ' + fail);
  console.log('========================================');
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
