// Reproduit le diag JUIN de Kevin : import MIXTE (1 ligne tab → sep="\t" global)
// + ligne chef FAUTRIER space-séparée + DEJANOVIC absent du roster.
// Vérifie : FAUTRIER (U00059, dans DEF_EMP) reçoit ses 30 codes ; DEJANOVIC
// (absent) est créé inline + reçoit ses codes. Aucune régression.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const FAUTRIER = "BRTP+K 5 FAUTRIER M 1 30 20/5c 19/4c 16/22c 14/19c RH 19/4'c 22/6c 20/5'c 16/3c 14/19'c RH R 20/5c 19/4c 16/22c 14/19c RH R 22/6c 19/4'c 16/3c 14/19'c RH R 20/5c 19/4c 16/22c 14/19c RH R";
const DEJANOVIC = "BRTP+E 5 DEJANOVIC D 1 30 20/5c 19/4c 16/22c 14/19c RH 19/4'c 22/6c 20/5'c 16/3c 14/19'c RH R 20/5c 19/4c 16/22c 14/19c RH R 22/6c 19/4'c 16/3c 14/19'c RH R 20/5c 19/4c 16/22c 14/19c RH R";
// 1 ligne TAB pour forcer hasTabs → sep="\t" global (comme le copier-coller réel de Kevin)
const TABLINE = "Chefs black Jack\tColonne2\tColonne3";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1024, height: 768 } })).newPage();
  await page.goto('file://' + resolve(ROOT, 'index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.A === 'object' && Array.isArray(window.A.employees) && typeof window.doImport === 'function', { timeout: 20000 });

  const txt = [TABLINE, FAUTRIER, DEJANOVIC].join("\n");

  const r = await page.evaluate((txt) => {
    window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' };
    if (!window.A.overrides) window.A.overrides = {};
    window.A.overrides['2026-5'] = {};
    let ta = document.getElementById('impTxt');
    if (!ta) { ta = document.createElement('textarea'); ta.id = 'impTxt'; document.body.appendChild(ta); }
    ta.value = txt;
    [['impY', '2026'], ['impM', '5']].forEach(([id, v]) => {
      let e = document.getElementById(id);
      if (!e) { e = document.createElement('input'); e.id = id; document.body.appendChild(e); }
      e.value = v;
    });
    window._lastImportText = txt;
    let fatal = null;
    try { window.doImport(); } catch (e) { fatal = e.message; }
    const ov = (window.A.overrides && window.A.overrides['2026-5']) || {};
    const fa = window.A.employees.find(e => e.name === 'FAUTRIER M');
    const dj = window.A.employees.find(e => e.name === 'DEJANOVIC D');
    const cellCount = id => id && ov[id] ? Object.keys(ov[id]).filter(d => ov[id][d]).length : 0;
    return {
      fatal,
      fautrier: { exists: !!fa, id: fa && fa.id, cells: cellCount(fa && fa.id), day1: fa && ov[fa.id] ? ov[fa.id][1] : null, day5: fa && ov[fa.id] ? ov[fa.id][5] : null },
      dejanovic: { exists: !!dj, id: dj && dj.id, created: !!(dj && /^U_TMP_/.test(dj.id)), cells: cellCount(dj && dj.id), day1: dj && ov[dj.id] ? ov[dj.id][1] : null }
    };
  }, txt);

  console.log('\n=== TEST FAUTRIER (mixte tab/space) + DEJANOVIC (absent) ===');
  if (r.fatal) { console.error('FATAL doImport:', r.fatal); await browser.close(); process.exit(2); }
  console.log('FAUTRIER  :', JSON.stringify(r.fautrier));
  console.log('DEJANOVIC :', JSON.stringify(r.dejanovic));

  let ok = true;
  if (!(r.fautrier.exists && r.fautrier.cells >= 28 && r.fautrier.day1 === '20/5c')) { console.error('❌ FAUTRIER mal parsé (attendu ~30 cellules, j1=20/5c)'); ok = false; }
  else console.log('✅ FAUTRIER : ' + r.fautrier.cells + ' cellules, j1=' + r.fautrier.day1);
  if (!(r.dejanovic.exists && r.dejanovic.created && r.dejanovic.cells >= 28 && r.dejanovic.day1 === '20/5c')) { console.error('❌ DEJANOVIC pas créé/sans cellules'); ok = false; }
  else console.log('✅ DEJANOVIC : créé ' + r.dejanovic.id + ', ' + r.dejanovic.cells + ' cellules');

  await browser.close();
  console.log(ok ? '\n✅ PASS' : '\n❌ FAIL');
  process.exit(ok ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
