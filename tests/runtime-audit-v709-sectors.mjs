// v9.709 — Test registre secteurs (extension future)
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
  await page.waitForFunction(() => typeof window.CMC_SECTORS === 'object', { timeout: 20000 });

  const result = await page.evaluate(() => {
    const out = { tests: [] };
    function test(label, fn) {
      try { const ok = fn(); out.tests.push({ label, ok: ok === true, error: ok === true ? null : ('expected true got ' + JSON.stringify(ok)) }); }
      catch (e) { out.tests.push({ label, ok: false, error: e.message }); }
    }

    test('CMC_SECTORS exposé globalement', () => typeof window.CMC_SECTORS === 'object');
    test('5 secteurs définis (bj/roulettes/cmc/baccara/cadres)', () => {
      const k = Object.keys(window.CMC_SECTORS);
      return k.length === 5 && k.includes('bj') && k.includes('roulettes') && k.includes('cmc') && k.includes('baccara') && k.includes('cadres');
    });
    test('Chaque secteur a id, label, icon, sectionRegex, wipeScope', () => {
      return Object.values(window.CMC_SECTORS).every(s => s.id && s.label && s.icon && s.sectionRegex && s.wipeScope);
    });
    test('cmcSectorById("bj") retourne secteur BJ', () => {
      const s = window.cmcSectorById('bj');
      return s && s.label.includes('Black Jack');
    });
    test('cmcListSectors retourne array de 5', () => {
      const list = window.cmcListSectors();
      return Array.isArray(list) && list.length === 5;
    });
    test('Section regex BJ match "Chefs black Jack"', () => {
      return window.CMC_SECTORS.bj.sectionRegex.test('Chefs black Jack');
    });
    test('Section regex Roulettes match "Roulettes"', () => {
      return window.CMC_SECTORS.roulettes.sectionRegex.test('Roulettes');
    });
    test('Section regex CMC match "Employés cartes CMC"', () => {
      return window.CMC_SECTORS.cmc.sectionRegex.test('Employés cartes CMC');
    });
    test('Section regex Cadres match "Pit Boss"', () => {
      return window.CMC_SECTORS.cadres.sectionRegex.test('Pit Boss');
    });
    test('cadres isCadre=true, autres isCadre=false', () => {
      return window.CMC_SECTORS.cadres.isCadre === true 
        && window.CMC_SECTORS.bj.isCadre === false
        && window.CMC_SECTORS.cmc.isCadre === false;
    });
    test('cadres wipeScope="cadres" distinct des autres', () => {
      return window.CMC_SECTORS.cadres.wipeScope === 'cadres' && window.CMC_SECTORS.bj.wipeScope === 'employees';
    });
    test('cellCodeMarker spécifique par secteur (BJ=c, CMC=", roulettes=null)', () => {
      return window.CMC_SECTORS.bj.cellCodeMarker === 'c' 
        && window.CMC_SECTORS.cmc.cellCodeMarker === '"' 
        && window.CMC_SECTORS.roulettes.cellCodeMarker === null;
    });

    return out;
  });

  console.log('\n=== Test v9.709 — Registre secteurs CMC_SECTORS ===');
  let pass = 0, fail = 0;
  result.tests.forEach(t => {
    if (t.ok) { console.log('  ✓ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + (t.error ? ' — ' + t.error : '')); fail++; }
  });
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ REGISTRE SECTEURS v9.709 OK' : '❌ REGISTRE SECTEURS v9.709 BROKEN');
  console.log(`PASS: ${pass} · FAIL: ${fail}`);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
