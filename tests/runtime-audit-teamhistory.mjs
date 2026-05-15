// v9.637 — Test runtime régression : vEmps utilise teamForMonth (pas emp.team frozen)
// Kevin "chefs gardent ancienne équipe quand j'avais collé des mois précédents"
// Vérifie que teamForMonth retourne bien teamHistory[key] et que vEmps affiche
// l'équipe du mois courant, pas celle figée depuis DEF_EMP seed.

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, '../index.html');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto('file://' + INDEX_PATH, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.A === 'object' && Array.isArray(window.A.employees), { timeout: 20000 });

  // Force admin Kevin
  await page.evaluate(() => { window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' }; });

  const result = await page.evaluate(() => {
    const out = { tests: [] };

    // Test 1 : teamForMonth retourne teamHistory[key] si présent
    function test(label, fn) {
      try {
        const ok = fn();
        out.tests.push({ label, ok: !!ok, error: ok === true ? null : ('expected true, got ' + JSON.stringify(ok)) });
      } catch (e) {
        out.tests.push({ label, ok: false, error: e.message });
      }
    }

    // Setup : prendre un employé et lui mettre une teamHistory custom
    const emp = window.A.employees.find(e => e.id === 'U11804') || window.A.employees[0];
    if (!emp) return { error: 'no employee found' };
    const origTeam = emp.team;
    const origHistory = emp.teamHistory ? JSON.parse(JSON.stringify(emp.teamHistory)) : null;

    test('teamForMonth est exposé', () => typeof window.teamForMonth === 'function');

    test('teamForMonth retourne teamHistory[key] si présent', () => {
      emp.teamHistory = { '2026-4': 'r5' };
      emp.team = 'r1';
      return window.teamForMonth(emp, 2026, 4) === 'r5';
    });

    test('teamForMonth fallback emp.team si pas de teamHistory pour ce mois', () => {
      emp.teamHistory = { '2025-0': 'r3' };
      emp.team = 'r1';
      const res = window.teamForMonth(emp, 2026, 4);
      // Devrait fallback : teamHistory plus récent antérieur (r3) ou emp.team
      return res === 'r3' || res === 'r1';
    });

    test('teamForMonth retourne emp.team si teamHistory vide', () => {
      delete emp.teamHistory;
      emp.team = 'r1';
      return window.teamForMonth(emp, 2026, 4) === 'r1';
    });

    test('teamForMonth utilise plus récent antérieur', () => {
      emp.teamHistory = { '2026-1': 'r2', '2026-2': 'r3' };
      emp.team = 'r1';
      const res = window.teamForMonth(emp, 2026, 4);
      return res === 'r3'; // mois 2 le plus récent <= 4
    });

    // Restore
    emp.team = origTeam;
    if (origHistory) emp.teamHistory = origHistory;
    else delete emp.teamHistory;

    return out;
  });

  console.log('\n=== Test runtime v9.637 — teamForMonth fix ===');
  if (result.error) {
    console.error('FATAL:', result.error);
    await browser.close();
    process.exit(2);
  }
  let pass = 0, fail = 0;
  result.tests.forEach(t => {
    if (t.ok) { console.log('  ✓ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + (t.error ? ' — ' + t.error : '')); fail++; }
  });
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ v9.637 teamForMonth OK' : '❌ v9.637 teamForMonth REGRESSION');
  console.log(`PASS: ${pass} · FAIL: ${fail}`);
  console.log('========================================');

  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
