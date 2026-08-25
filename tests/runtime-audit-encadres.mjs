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

// 2 fixtures : mai 2026 + juin 2026 (donné par Kevin)
const FIXTURES = [
  { path: 'fixtures/mai-2026-v1-encadres.txt', year: 2026, month: 4, label: 'Mai 2026',
    checks: [
      ['PASSERON G', 'CP'],
      ['NOVARETTI B', 'CP'],
      ['LORENZI Y', 'M'],
      ['FILIPPI F', 'AF'],
      ['SANGIORGIO G', 'CP'],
      ['CASSINI A', 'CP'],
      ['BOURDIER C', 'CP'],
      ['CAPRA C', 'M'],
      ['FAIVRE R', 'CP'],
      ['MATTERA M', 'CP']
    ]
  },
  { path: 'fixtures/juin-2026-v1-encadres.txt', year: 2026, month: 5, label: 'Juin 2026',
    checks: [
      ['SOSSO G', 'CP'],
      ['COURTIN F', 'CP'],
      ['COTTALORDA D', 'CP'],
      ['TOMATIS P', 'CP'],
      ['COSTE W', 'CP'],
      ['PORASSO C', 'CP'],
      ['CERETTI R', 'CP'],
      ['LORENZI Y', 'M'],
      ['SANNA O', 'M'],
      ['GALLIS F', 'M'],
      ['ARDISSON S', 'M'],
      ['MOREL F', 'AF'],
      ['VIGNA M', 'AF'],
      ['GAZAGNE F', 'AF'],
      ['LANDAU B', 'CP'],
      ['PUGNETTI S', 'CP'],
      ['GATTI B', 'CP'],
      ['CAPRA C', 'M'],
      ['ROBIN M', 'M']
    ]
  }
];

async function main() {
  // Charger les 2 fixtures
  console.log('[encadres-audit] loading fixtures...');

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto('file://' + INDEX_PATH, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => {
    return typeof window.A === 'object' && Array.isArray(window.A.employees)
      && typeof window._parseEncadresStatuts === 'function';
  }, { timeout: 20000 });
  await page.evaluate(() => { window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' }; });

  let totalPass = 0, totalFail = 0, totalSkipped = 0;

  for (const fix of FIXTURES) {
    const sourceText = readFileSync(resolve(__dirname, fix.path), 'utf8');
    console.log(`\n=== ${fix.label} (${sourceText.length} chars, ${fix.checks.length} checks) ===`);

    const result = await page.evaluate(({ txt, year, month, checks }) => {
      try {
        const key = year + '-' + month;
        window.A.overrides = window.A.overrides || {};
        window.A.overrides[key] = {};
        const res = window._parseEncadresStatuts(txt, key, year, month);

        function findEmp(name) {
          return window.A.employees.find(e => {
            if (!e.name) return false;
            const en = e.name.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
            return en === name.toUpperCase();
          });
        }

        return {
          parseRes: { filled: res.filled, sections: res.sections, forced: res.forced, unassignedCount: (res.unassigned || []).length },
          checks: checks.map(([name, expectedCode]) => {
            const emp = findEmp(name);
            if (!emp) return { name, status: 'NOT_IN_DB' };
            const row = window.A.overrides[key][emp.id] || {};
            const codes = Object.values(row).filter(c => c);
            if (codes.length === 0) return { name, status: 'NO_CODES_ASSIGNED', expected: expectedCode };
            const allExpected = codes.every(c => c === expectedCode);
            return {
              name,
              status: allExpected ? 'OK' : 'WRONG_CODE',
              expected: expectedCode,
              actualCodes: [...new Set(codes)].slice(0, 5),
              count: codes.length
            };
          })
        };
      } catch (e) { return { error: e.message || String(e), stack: (e.stack || '').slice(0, 500) }; }
    }, { txt: sourceText, year: fix.year, month: fix.month, checks: fix.checks });

    if (result.error) {
      console.error('ERROR:', result.error, '\n', result.stack);
      await browser.close();
      process.exit(2);
    }
    console.log('Stats:', JSON.stringify(result.parseRes));
    result.checks.forEach(c => {
      const icon = c.status === 'OK' ? '✓' : c.status === 'NOT_IN_DB' ? '⊘' : '✗';
      if (c.status === 'OK') totalPass++;
      else if (c.status === 'NOT_IN_DB') totalSkipped++;
      else totalFail++;
      console.log(`  ${icon} ${c.name.padEnd(20)} expected=${c.expected || 'N/A'} status=${c.status}${c.actualCodes ? ' actual=[' + c.actualCodes.join(',') + ']' : ''}${c.count != null ? ' (' + c.count + ' cells)' : ''}`);
    });
  }

  console.log('\n========================================');
  console.log(totalFail === 0 ? '✅ ENCADRÉS V9.628 FIX VALIDÉ' : `❌ ENCADRÉS FAIL : ${totalFail} bugs`);
  console.log('========================================');
  console.log(`PASS: ${totalPass} · FAIL: ${totalFail} · SKIPPED (emp absent DB): ${totalSkipped}`);

  await browser.close();
  process.exit(totalFail === 0 ? 0 : 1);
}

main().catch(e => { console.error('FATAL:', e); process.exit(2); });
