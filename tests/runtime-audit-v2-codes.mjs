// Régression V2 JUIN (Kevin "il manque les familles, malades, formation") :
// vérifie que le parser applique correctement les codes statut V2 sur les lignes
// chefs inline — maladie (M), formation (AF), déplacement (DEPL), CP partiel —
// et qu'un homonyme à initiale distincte absent du roster est CRÉÉ (LAVAGNA J,
// alors que LAVAGNA E/Y existent) au lieu d'être ignoré (règle #1).
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
    let ta = document.getElementById('impTxt'); if (!ta) { ta = document.createElement('textarea'); ta.id = 'impTxt'; document.body.appendChild(ta); } ta.value = txt;
    [['impY', '2026'], ['impM', '5']].forEach(([id, v]) => { let e = document.getElementById(id); if (!e) { e = document.createElement('input'); e.id = id; document.body.appendChild(e); } e.value = v; });
    window._lastImportText = txt; let fatal = null;
    try { window.doImport(); } catch (e) { fatal = e.message; }
    const ov = window.A.overrides['2026-5'] || {};
    const get = n => { const e = window.A.employees.find(x => x.name === n); if (!e) return null; const row = ov[e.id] || {}; return { id: e.id, cells: Object.keys(row).filter(d => row[d]).length, d: row }; };
    return { fatal, fautrier: get('FAUTRIER M'), desarzens: get('DESARZENS K'), lavagna: get('LAVAGNA J'), testa: get('TESTA G') };
  }, txt);

  console.log('\n=== RÉGRESSION V2 — codes statut (M/AF/DEPL/CP) + homonyme distinct ===');
  if (r.fatal) { console.error('FATAL doImport:', r.fatal); await browser.close(); process.exit(2); }
  let pass = 0, fail = 0;
  const check = (cond, label) => { if (cond) { console.log('  ✅ ' + label); pass++; } else { console.error('  ❌ ' + label); fail++; } };

  check(r.fautrier && r.fautrier.cells >= 28 && r.fautrier.d[1] === 'M', 'FAUTRIER M : maladie (M) appliquée j1 + rotation (' + (r.fautrier && r.fautrier.cells) + ' cells)');
  check(r.desarzens && r.desarzens.d[1] === 'CP' && r.desarzens.d[15] === 'CP', 'DESARZENS K : CP partiel j1-15');
  check(r.lavagna && /^U_TMP_/.test(r.lavagna.id) && r.lavagna.d[1] === 'AF' && r.lavagna.d[7] === 'DEPL', 'LAVAGNA J : homonyme distinct CRÉÉ + AF(j1) + DEPL(j7)');
  check(r.testa && r.testa.cells === 30 && Object.keys(r.testa.d).every(d => r.testa.d[d] === 'M'), 'TESTA G : maladie (M) tout le mois (30 j)');

  await browser.close();
  console.log('\nPASS: ' + pass + ' · FAIL: ' + fail);
  console.log(fail === 0 ? '✅ V2 CODES OK' : '❌ V2 CODES FAIL');
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
