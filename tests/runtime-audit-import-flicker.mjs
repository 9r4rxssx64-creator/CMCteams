// Régression v9.761 (Kevin "il me parle de cadre ?!" + "l'app saute énormément
// sur la page import") : un import chefs/employés (sans planning cadre — 2e PDF
// séparé) ne doit (a) JAMAIS toaster à propos des cadres, (b) ne déclencher qu'un
// nombre minimal de rebuilds dc() (pas de cascade auto-fill cadres).
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1024, height: 768 } })).newPage();
  await page.goto('file://' + resolve(ROOT, 'index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.A === 'object' && Array.isArray(window.A.employees) && typeof window.doImport === 'function', { timeout: 20000 });

  const txt = fs.readFileSync(resolve(ROOT, 'tests/fixtures/v2-codes-sample.txt'), 'utf8');

  const r = await page.evaluate((txt) => {
    window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' };
    window.A.overrides = window.A.overrides || {}; window.A.overrides['2026-5'] = {};
    let dcN = 0; const _dc = window.dc; window.dc = function () { dcN++; return _dc.apply(this, arguments); };
    const toasts = []; const _t = window.toast; window.toast = function (m) { toasts.push(String(m)); return _t && _t.apply(this, arguments); };
    let ta = document.getElementById('impTxt'); if (!ta) { ta = document.createElement('textarea'); ta.id = 'impTxt'; document.body.appendChild(ta); } ta.value = txt;
    [['impY', '2026'], ['impM', '5']].forEach(([id, v]) => { let e = document.getElementById(id); if (!e) { e = document.createElement('input'); e.id = id; document.body.appendChild(e); } e.value = v; });
    window._lastImportText = txt; let fatal = null;
    try { window.doImport(); } catch (e) { fatal = e.message; }
    return { fatal, dcCount: dcN, cadreToasts: toasts.filter(t => /cadre/i.test(t)) };
  }, txt);

  console.log('\n=== RÉGRESSION v9.761 — flicker + "parle de cadre" sur import chefs/employés ===');
  if (r.fatal) { console.error('FATAL doImport:', r.fatal); await browser.close(); process.exit(2); }
  let pass = 0, fail = 0;
  const check = (c, l) => { if (c) { console.log('  ✅ ' + l); pass++; } else { console.error('  ❌ ' + l); fail++; } };
  check(r.cadreToasts.length === 0, 'aucun toast "cadre" (auto-fill cadre ne se déclenche plus) — vu: ' + JSON.stringify(r.cadreToasts));
  check(r.dcCount <= 2, 'dc() rebuilds ≤ 2 pendant import (pas de cascade) — mesuré: ' + r.dcCount);
  await browser.close();
  console.log('\nPASS: ' + pass + ' · FAIL: ' + fail);
  console.log(fail === 0 ? '✅ IMPORT FLICKER/CADRE OK' : '❌ FAIL');
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
