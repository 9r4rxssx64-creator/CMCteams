// v9.665 — Test de regression : _cmcScopedWipe critique V1/V2 cohabitation
// Garantit que import V1 (employees) n'efface PAS les cadres V2 et inversement.

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
  await page.waitForFunction(() => typeof window.A === 'object' && typeof window._cmcScopedWipe === 'function' && typeof window._cmcDecideImportMode === 'function', { timeout: 20000 });
  await page.evaluate(() => { window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' }; });

  const result = await page.evaluate(() => {
    const out = { tests: [] };
    function test(label, fn) {
      try { const ok = fn(); out.tests.push({ label, ok: ok === true, error: ok === true ? null : ('expected true got ' + JSON.stringify(ok)) }); }
      catch (e) { out.tests.push({ label, ok: false, error: e.message }); }
    }

    // Setup : mois 2026-06 (juin) — 1 employé + 1 cadre avec données
    const key = '2026-5';
    window.A.year = 2026; window.A.month = 5;

    // Trouver 1 employé non-cadre et 1 cadre actifs
    const empNonCadre = window.A.employees.find(e => (e.family||'') !== 'cadres');
    const empCadre = window.A.employees.find(e => (e.family||'') === 'cadres');
    if (!empNonCadre || !empCadre) {
      out.tests.push({ label: 'setup', ok: false, error: 'missing emp or cadre in DEF_EMP' });
      return out;
    }

    window.A.overrides = window.A.overrides || {};
    window.A.overrides[key] = {
      [empNonCadre.id]: { 1: '22/6', 2: '19/4', 3: 'RH' },
      [empCadre.id]:    { 1: '20/5', 2: '16/3', 3: 'R' },
    };

    // Test 1 : scope="employees" wipe les emps non-cadres, garde cadres
    test('v9.665 : scope=employees wipe NON-cadres uniquement', () => {
      // Reset state
      window.A.overrides[key] = {
        [empNonCadre.id]: { 1: '22/6', 2: '19/4' },
        [empCadre.id]:    { 1: '20/5', 2: '16/3' },
      };
      const r = window._cmcScopedWipe(key, 'employees');
      const ov = window.A.overrides[key];
      // Emp non-cadre doit etre wipe
      if (ov[empNonCadre.id]) return 'emp non-cadre PAS wipe: '+JSON.stringify(ov[empNonCadre.id]);
      // Cadre doit etre preserve
      if (!ov[empCadre.id] || !ov[empCadre.id][1]) return 'cadre PERDU: '+JSON.stringify(ov[empCadre.id]);
      // Counters
      if (r.wipedEmps !== 1) return 'wipedEmps='+r.wipedEmps+' (expected 1)';
      if (r.preservedEmps !== 1) return 'preservedEmps='+r.preservedEmps+' (expected 1)';
      return true;
    });

    // Test 2 : scope="cadres" wipe les cadres, garde emps
    test('v9.665 : scope=cadres wipe CADRES uniquement', () => {
      window.A.overrides[key] = {
        [empNonCadre.id]: { 1: '22/6', 2: '19/4' },
        [empCadre.id]:    { 1: '20/5', 2: '16/3' },
      };
      const r = window._cmcScopedWipe(key, 'cadres');
      const ov = window.A.overrides[key];
      if (!ov[empNonCadre.id] || !ov[empNonCadre.id][1]) return 'emp non-cadre PERDU';
      if (ov[empCadre.id]) return 'cadre PAS wipe';
      if (r.wipedEmps !== 1) return 'wipedEmps='+r.wipedEmps;
      if (r.preservedEmps !== 1) return 'preservedEmps='+r.preservedEmps;
      return true;
    });

    // Test 3 : scope="complete" wipe TOUT
    test('v9.665 : scope=complete wipe TOUT', () => {
      window.A.overrides[key] = {
        [empNonCadre.id]: { 1: '22/6' },
        [empCadre.id]:    { 1: '20/5' },
      };
      const r = window._cmcScopedWipe(key, 'complete');
      const ov = window.A.overrides[key];
      if (ov[empNonCadre.id]) return 'emp non-cadre PAS wipe';
      if (ov[empCadre.id]) return 'cadre PAS wipe';
      if (r.wipedEmps !== 2) return 'wipedEmps='+r.wipedEmps;
      return true;
    });

    // Test 4 : scope null/unknown = no-op (securite)
    test('v9.665 : scope=unknown = no-op (securite)', () => {
      window.A.overrides[key] = {
        [empNonCadre.id]: { 1: '22/6' },
        [empCadre.id]:    { 1: '20/5' },
      };
      const r = window._cmcScopedWipe(key, 'unknown_scope_xyz');
      const ov = window.A.overrides[key];
      // Rien ne doit etre efface
      if (!ov[empNonCadre.id]) return 'emp non-cadre wipe alors que scope unknown';
      if (!ov[empCadre.id]) return 'cadre wipe alors que scope unknown';
      if (r.wipedEmps !== 0) return 'wipedEmps='+r.wipedEmps+' (expected 0 safety)';
      return true;
    });

    // Test 5 : _cmcDecideImportMode V1 → scoped-employees
    test('v9.665 : decideImportMode V1 → scoped-employees', () => {
      return window._cmcDecideImportMode('employees', null) === 'scoped-employees';
    });

    // Test 6 : _cmcDecideImportMode V2 → scoped-cadres
    test('v9.665 : decideImportMode V2 → scoped-cadres', () => {
      return window._cmcDecideImportMode('cadres', null) === 'scoped-cadres';
    });

    // Test 7 : _cmcDecideImportMode complete → replace-all
    test('v9.665 : decideImportMode complete → replace-all', () => {
      return window._cmcDecideImportMode('complete', null) === 'replace-all';
    });

    // Test 8 : user override "replace" force replace-all
    test('v9.665 : user override replace force replace-all', () => {
      return window._cmcDecideImportMode('employees', 'replace') === 'replace-all';
    });

    // Test 9 : user override "merge" force merge
    test('v9.665 : user override merge force merge', () => {
      return window._cmcDecideImportMode('cadres', 'merge') === 'merge';
    });

    // Test 10 : unknown import type → replace-all (v9.643 Kevin "ecrase auto")
    // v9.643 a change le default unknown : avant "merge" (securite), maintenant
    // "replace-all" (Kevin veut que nouveau PDF gagne TOUJOURS sur ancien).
    test('v9.665 : unknown import type → replace-all (v9.643 Kevin ecrase auto)', () => {
      return window._cmcDecideImportMode('unknown_type', null) === 'replace-all';
    });

    return out;
  });

  console.log('\n=== Test runtime v9.665 — _cmcScopedWipe + _cmcDecideImportMode ===');
  let pass = 0, fail = 0;
  result.tests.forEach(t => {
    if (t.ok) { console.log('  ✓ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + (t.error ? ' — ' + t.error : '')); fail++; }
  });
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ SCOPED WIPE V1/V2 OK' : '❌ REGRESSION scoped wipe');
  console.log(`PASS: ${pass} · FAIL: ${fail}`);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
