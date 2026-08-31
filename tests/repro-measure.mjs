// Mesure ciblée : reproduit l'import réel (géométrie PDF réelle) et imprime
// les chiffres décisifs pour trancher v9.819 (régression ?) vs v9.816.
// Usage : node tests/repro-measure.mjs   (depuis la racine projet)
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const text = readFileSync(resolve(__dirname, 'fixtures/juillet-2026-v1.txt'), 'utf8');
  const geo = JSON.parse(readFileSync(resolve(__dirname, 'fixtures/juillet-2026-v1.geo.json'), 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + resolve(__dirname, '../index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.doImport === 'function' && window.A && Array.isArray(A.employees), { timeout: 20000 });
  await page.evaluate(() => { A.user = A.employees.find(e => e.id === 'U11804'); A.year = 2026; A.month = 6; A.overrides = A.overrides || {}; delete A.overrides['2026-6']; });
  const out = await page.evaluate(async ({ text, geo }) => {
    window._cmcPdfGeometry = geo; window._lastImportText = text;
    window.doImport(); await new Promise(r => setTimeout(r, 2000));
    const key = '2026-6', ov = A.overrides[key] || {};
    const ids = Object.keys(ov);
    let totalCells = 0; ids.forEach(id => totalCells += Object.keys(ov[id]).length);
    const cnt = {}; ids.forEach(id => { const c = ov[id]; Object.keys(c).forEach(d => { cnt[c[d]] = (cnt[c[d]] || 0) + 1; }); });
    const cp = cnt.CP || 0, m = cnt.M || 0;
    const look = nm => {
      const e = A.employees.find(x => x.name && x.name.toUpperCase().indexOf(nm) >= 0);
      if (!e) return nm + ':ABSENT_ROSTER';
      const c = ov[e.id] || {}; const ks = Object.keys(c).map(Number).sort((a, b) => a - b);
      const tally = {}; ks.forEach(d => tally[c[d]] = (tally[c[d]] || 0) + 1);
      return nm + ' n=' + ks.length + ' j1=' + (c[1] || '∅') + ' ' + JSON.stringify(tally);
    };
    return {
      empsWithCells: ids.length, totalCells, cp, m,
      RINALDI: look('RINALDI'), GAZAGNE: look('GAZAGNE'), DESARZENS: look('DESARZENS K'),
      GARRO: look('GARRO'), MIRANDA: look('MIRANDA'),
      // quelques roulettiers/cartes au hasard pour voir s'ils gardent leur grille
      sample: ['NICASTRO', 'JANEL', 'TOMATIS', 'HAREL', 'COSTAGLIOLI'].map(look)
    };
  }, { text, geo });
  console.log('VER', await page.evaluate(() => (window.APP_VER || (typeof APP_VER !== 'undefined' ? APP_VER : '?'))));
  console.log('pageerrors:', errs.length, errs.slice(0, 3));
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
}
main().catch(e => { console.error(e); process.exit(1); });
