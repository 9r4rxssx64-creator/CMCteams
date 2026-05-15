// v9.630 — Test runtime E2E parser tableau positionnel Pit Boss V2.
// Kevin a partagé le texte PDF source mai 2026 V2 Pit Boss qui révèle que
// chaque pit boss a un horaire DIFFÉRENT (offset dans rotation commune) :
//   - JANEL JM    : 22/6, 16/20, 12h30/19, RH, R, ...
//   - GARELLI C   : 16/20, 12h30/19, RH, R, 22/6, ...
//   - PETIT J     : 12h30/19, RH, R, 22/6, ...
//   - HERVE A     : RH, R, 22/6, 19/4', 16/20, ...
//   - LANDAU J    : RH, R, RRT, 19/4', 15/19, ...
//   - PELAZZA F   : R, PK, PK, RH, PK, ...
//   - BOUVIER JF  : 12h30/19', RH, R, 19/4:, 16/20, ... + CP au mi-mois
//
// Mais l'app affiche TOUS les pit boss avec MÊME horaire. Bug parser confirmé.
// Ce test injecte le texte fixture + appelle doImport() + assert horaires variés.

import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, '../index.html');
const FIXTURE_PATH = resolve(__dirname, 'fixtures/mai-2026-v2-pitboss.txt');

async function main() {
  const sourceText = readFileSync(FIXTURE_PATH, 'utf8');
  console.log('[pitboss-audit] fixture loaded:', sourceText.length, 'chars');

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto('file://' + INDEX_PATH, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => {
    return typeof window.A === 'object' && Array.isArray(window.A.employees)
      && typeof window.doImport === 'function';
  }, { timeout: 20000 });

  // Force admin Kevin
  await page.evaluate(() => { window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' }; });

  const result = await page.evaluate((txt) => {
    try {
      const key = '2026-4'; // mai 2026
      window.A.year = 2026;
      window.A.month = 4;
      // Reset overrides
      window.A.overrides = window.A.overrides || {};
      window.A.overrides[key] = {};
      window._cmcStayWithDuplicates = true; // override safety v9.625 pour voir le vrai bug parser

      // Setup textarea avec texte source
      window._lastImportText = txt;

      // Mock dom elements pour doImport
      const setupInput = (id, value) => {
        let el = document.getElementById(id);
        if (!el) {
          el = document.createElement('input');
          el.id = id;
          document.body.appendChild(el);
        }
        el.value = String(value);
      };
      setupInput('impY', '2026');
      setupInput('impM', '4');

      // Setup textarea
      let ta = document.getElementById('impTxt');
      if (!ta) {
        ta = document.createElement('textarea');
        ta.id = 'impTxt';
        document.body.appendChild(ta);
      }
      ta.value = txt;

      // Setup impRes div
      let res = document.getElementById('impRes');
      if (!res) {
        res = document.createElement('div');
        res.id = 'impRes';
        document.body.appendChild(res);
      }

      // Call doImport synchronously (no Firebase write in test, no toast spam)
      window.toast = function(){}; // silence toasts

      try {
        window.doImport();
      } catch (e) {
        return { phase: 'doImport_call', error: e.message };
      }

      // Lecture des horaires pour chaque pit boss
      function findEmpByName(name) {
        return window.A.employees.find(e => {
          if (!e.name) return false;
          const en = e.name.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
          return en === name.toUpperCase();
        });
      }

      function getScheduleString(empName) {
        const emp = findEmpByName(empName);
        if (!emp) return null;
        const row = window.A.overrides[key][emp.id] || {};
        const codes = [];
        for (let d = 1; d <= 31; d++) codes.push(row[d] || '_');
        return codes.join('|');
      }

      const cadres = [
        'JANEL JM', 'GARELLI C', 'PETIT J', 'HERVE A', 'LANDAU J',
        'PELAZZA F', 'CORNUTELLO A', 'DI COLANGELO F', 'CAMPI H', 'EMMERICH JC',
        'LONG JP', 'ENZA C', 'ETTORI M', 'FOUQUE V', 'PENNACINO JP',
        'BOUVIER JF', 'JONIAUX S', 'DOGLIOLO Y', 'MUS L', 'ROSPOCHER G'
      ];

      const schedules = cadres.map(name => ({
        name,
        sched: getScheduleString(name),
        firstFiveDays: (function(){
          const emp = findEmpByName(name);
          if (!emp) return null;
          const row = window.A.overrides[key][emp.id] || {};
          return [1,2,3,4,5].map(d => row[d] || '_').join(' ');
        })(),
        inDB: !!findEmpByName(name)
      }));

      return {
        phase: 'complete',
        schedules,
        totalEmpsWithCodes: Object.keys(window.A.overrides[key] || {}).filter(eid => Object.keys(window.A.overrides[key][eid] || {}).length > 0).length
      };
    } catch (e) {
      return { phase: 'error', error: e.message || String(e), stack: (e.stack || '').slice(0, 500) };
    }
  }, sourceText);

  console.log('\n=== Résultat doImport sur fixture pit boss V2 ===');
  if (result.error) {
    console.error(`[${result.phase}] ERROR:`, result.error);
    if (result.stack) console.error(result.stack);
    await browser.close();
    process.exit(2);
  }

  console.log(`Total employés avec codes: ${result.totalEmpsWithCodes}`);
  console.log('\n=== Horaires des Pit Boss (5 premiers jours) ===');
  result.schedules.forEach(s => {
    if (!s.inDB) {
      console.log(`  ⊘ ${s.name.padEnd(20)} NOT_IN_DB`);
      return;
    }
    if (!s.sched || s.sched === Array(31).fill('_').join('|')) {
      console.log(`  ⚠ ${s.name.padEnd(20)} NO_CODES`);
      return;
    }
    console.log(`  • ${s.name.padEnd(20)} jours 1-5: ${s.firstFiveDays}`);
  });

  // Vérifier que les schedules ne sont PAS tous identiques (le bug Kevin)
  const inDB = result.schedules.filter(s => s.inDB && s.sched);
  const uniqueSchedules = new Set(inDB.map(s => s.sched));
  console.log(`\n=== Diversité horaires ===`);
  console.log(`Pit boss avec horaires: ${inDB.length}`);
  console.log(`Schedules distincts: ${uniqueSchedules.size}`);
  if (inDB.length >= 5 && uniqueSchedules.size === 1) {
    console.log('🚨 BUG CONFIRMÉ : TOUS les pit boss ont LE MÊME HORAIRE');
  } else if (uniqueSchedules.size < inDB.length / 2) {
    console.log(`⚠ ${uniqueSchedules.size}/${inDB.length} schedules distincts seulement (peu de diversité)`);
  } else {
    console.log(`✓ Diversité OK (${uniqueSchedules.size}/${inDB.length})`);
  }

  // Vérifier specs précises selon texte PDF
  const expectedFirstCodes = {
    'JANEL JM': '22/6',
    'GARELLI C': '16/20',
    'PETIT J': '12h30/19',
    'HERVE A': 'RH',
    'LANDAU J': 'RH'
  };
  console.log(`\n=== Vérification jour 1 vs PDF source ===`);
  let pass = 0, fail = 0;
  Object.entries(expectedFirstCodes).forEach(([name, expected]) => {
    const s = result.schedules.find(x => x.name === name);
    if (!s || !s.inDB) { console.log(`  ⊘ ${name} NOT_IN_DB`); return; }
    const actualDay1 = (s.firstFiveDays || '').split(' ')[0];
    if (actualDay1 === expected) {
      console.log(`  ✓ ${name} jour 1 = ${actualDay1} (attendu ${expected})`);
      pass++;
    } else {
      console.log(`  ✗ ${name} jour 1 = "${actualDay1}" (attendu "${expected}")`);
      fail++;
    }
  });

  console.log('\n========================================');
  console.log(fail === 0 && pass >= 1 ? '✅ PARSER PIT BOSS V2 OK' : '❌ PARSER PIT BOSS V2 BUG CONFIRMÉ');
  console.log(`PASS: ${pass} · FAIL: ${fail}`);
  console.log('========================================');

  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(e => { console.error('FATAL:', e); process.exit(2); });
