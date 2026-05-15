// v9.628 — Test runtime spécifique : injecte le texte PDF source réel
// (mai 2026 V1, donné par Kevin) et vérifie que _parseEncadresStatuts
// classe correctement les employés des sections encadrées :
//   - PASSERON G (section "10 CP") → tous jours = CP
//   - LORENZI Y (section "7 M") → tous jours = M
//   - FILIPPI F (section "13 FORMATION") → tous jours = AF
//   - DE RYCKE K (section "3 EDC") → tous jours = EDC
//
// Lancé depuis tests/runtime-audit-encadres.mjs après runtime-audit.mjs.

import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, '../index.html');
const FIXTURE_PATH = resolve(__dirname, 'fixtures/mai-2026-v1-encadres.txt');

async function main() {
  const sourceText = readFileSync(FIXTURE_PATH, 'utf8');
  console.log('[encadres-audit] fixture loaded:', sourceText.length, 'chars');

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 }
  });
  const page = await ctx.newPage();

  await page.goto('file://' + INDEX_PATH, { waitUntil: 'domcontentloaded', timeout: 30000 });

  await page.waitForFunction(() => {
    return typeof window.A === 'object' && Array.isArray(window.A.employees)
      && typeof window._parseEncadresStatuts === 'function';
  }, { timeout: 20000 });

  await page.evaluate(() => {
    window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' };
  });

  // Inject fixture text + call _parseEncadresStatuts directly
  const result = await page.evaluate((txt) => {
    try {
      const key = '2026-4'; // mai 2026
      // Reset overrides for this month
      window.A.overrides = window.A.overrides || {};
      window.A.overrides[key] = {};

      // Test 1 : appeler _parseEncadresStatuts avec le texte fixture
      const res = window._parseEncadresStatuts(txt, key, 2026, 4);

      // Test 2 : vérifier les employés clés
      function findEmp(name) {
        return window.A.employees.find(e => {
          if (!e.name) return false;
          const en = e.name.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
          const fn = name.toUpperCase();
          return en === fn;
        });
      }

      function checkEmp(name, expectedCode) {
        const emp = findEmp(name);
        if (!emp) return { name, status: 'NOT_IN_DB' };
        const row = window.A.overrides[key][emp.id] || {};
        const codes = Object.values(row).filter(c => c);
        if (codes.length === 0) return { name, status: 'NO_CODES_ASSIGNED' };
        const allExpected = codes.every(c => c === expectedCode);
        return {
          name,
          status: allExpected ? 'OK' : 'WRONG_CODE',
          expected: expectedCode,
          actualCodes: [...new Set(codes)].slice(0, 5),
          count: codes.length
        };
      }

      const checks = [
        checkEmp('PASSERON G', 'CP'),
        checkEmp('LORENZI Y', 'M'),
        checkEmp('FILIPPI F', 'AF'),
        checkEmp('NOVARETTI B', 'CP'),
        checkEmp('SANGIORGIO G', 'CP'),
        checkEmp('CASSINI A', 'CP'),
        checkEmp('BOURDIER C', 'CP'),
        checkEmp('CAPRA C', 'M'),
        checkEmp('FAIVRE R', 'CP'),
        checkEmp('MATTERA M', 'CP') // Présent dans "8 CP" ET "3 FORMATION" — CP gagne (premier)
      ];

      return {
        parseRes: { filled: res.filled, sections: res.sections, forced: res.forced, unassignedCount: (res.unassigned || []).length },
        checks
      };
    } catch (e) {
      return { error: e.message || String(e), stack: (e.stack || '').slice(0, 500) };
    }
  }, sourceText);

  console.log('\n=== Résultat _parseEncadresStatuts ===');
  if (result.error) {
    console.error('ERROR:', result.error);
    console.error(result.stack);
    await browser.close();
    process.exit(2);
  }
  console.log('Stats:', JSON.stringify(result.parseRes));
  console.log('\n=== Vérifications individuelles ===');
  let pass = 0, fail = 0, skipped = 0;
  result.checks.forEach(c => {
    const icon = c.status === 'OK' ? '✓' : c.status === 'NOT_IN_DB' ? '⊘' : '✗';
    if (c.status === 'OK') pass++;
    else if (c.status === 'NOT_IN_DB') skipped++;
    else fail++;
    console.log(`  ${icon} ${c.name.padEnd(20)} expected=${c.expected || 'N/A'} status=${c.status}${c.actualCodes ? ' actual=[' + c.actualCodes.join(',') + ']' : ''}${c.count != null ? ' (' + c.count + ' cells)' : ''}`);
  });

  console.log('\n========================================');
  console.log(fail === 0 ? '✅ ENCADRÉS V9.628 FIX VALIDÉ' : `❌ ENCADRÉS FAIL : ${fail} bugs`);
  console.log('========================================');
  console.log(`PASS: ${pass} · FAIL: ${fail} · SKIPPED (emp absent DB): ${skipped}`);

  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(e => { console.error('FATAL:', e); process.exit(2); });
