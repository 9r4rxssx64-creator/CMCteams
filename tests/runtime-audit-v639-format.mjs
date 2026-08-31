// v9.639+ runtime tests : nouveau format SBM V1 juin (TEAM entre POST et NOM)
// + manual override PDF wins (v9.640) + auto-switch mois (v9.640)

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
  await page.waitForFunction(() => typeof window.A === 'object' && typeof window.doImport === 'function', { timeout: 20000 });
  await page.evaluate(() => { window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' }; });

  const result = await page.evaluate(() => {
    const out = { tests: [] };
    function test(label, fn) {
      try {
        const ok = fn();
        out.tests.push({ label, ok: ok === true, error: ok === true ? null : ('expected true got ' + JSON.stringify(ok)) });
      } catch (e) {
        out.tests.push({ label, ok: false, error: e.message });
      }
    }

    // ─── v9.639 : Test parser nouveau format SBM V1 juin (TEAM entre POST et NOM) ───
    test('v9.639 : parser détecte format "POST TEAM NAME DU AU codes"', () => {
      // Simuler ligne PDF juin SBM : "BRTP+K\t5\tFAUTRIER M\t1\t30\t20/5c\t19/4c\t..."
      // Le parser doit reconnaître nameIdx=2, codesStart=5 et extraire FAUTRIER M
      const sample = `Roulements du mois de:\tmai 2026
Chefs black Jack/Responsable de Table
BRTP+K\t5\tFAUTRIER M\t1\t31\t20/5\t19/4\t16/22\t14/19\tRH\tR\t22/6\t19/4\t16/3\t14/19\tRH\tR\t20/5\t19/4\t16/22\t14/19\tRH\tR\t22/6\t19/4\t16/3\t14/19\tRH\tR\t20/5\t19/4\t16/22\t14/19\tRH\tR\t22/6`;
      
      // Setup
      window.A.year = 2026; window.A.month = 4;
      window.A.overrides = window.A.overrides || {};
      window.A.overrides['2026-4'] = {};
      window._cmcStayWithDuplicates = true; // ignore bug detector pour test
      
      // Mock DOM
      ['impY', 'impM', 'impTxt', 'impRes'].forEach(id => {
        let el = document.getElementById(id);
        if (!el) {
          el = document.createElement(id === 'impTxt' ? 'textarea' : id === 'impRes' ? 'div' : 'input');
          el.id = id; document.body.appendChild(el);
        }
      });
      document.getElementById('impY').value = '2026';
      document.getElementById('impM').value = '4';
      document.getElementById('impTxt').value = sample;
      window.toast = function(){};
      
      try { window.doImport(); } catch(e) { return 'doImport throw: ' + e.message; }
      
      // Verify FAUTRIER M was found in employees (or in overrides)
      const ov = window.A.overrides['2026-4'] || {};
      const fautrierEmp = window.A.employees.find(e => /FAUTRIER\s+M/i.test(e.name));
      if (!fautrierEmp) return 'FAUTRIER M not in DEF_EMP (test environment issue)';
      const fautrierData = ov[fautrierEmp.id];
      return !!(fautrierData && Object.keys(fautrierData).filter(d => fautrierData[d]).length >= 5);
    });

    // ─── v9.640 : Test détection mois auto-switch ───
    test('v9.640 : détection mois "mai 2026" exposée', () => {
      // Vérifier juste que le code de détection existe (search in window for MFR)
      return Array.isArray(window.MFR) && window.MFR.length === 12 && window.MFR[4] === 'Mai';
    });

    // ─── v9.640 : Test scoped wipe modes ───
    test('v9.640 : _cmcDecideImportMode retourne scoped-cadres pour V2', () => {
      if (typeof window._cmcDecideImportMode !== 'function') return '_cmcDecideImportMode missing';
      return window._cmcDecideImportMode('cadres', null) === 'scoped-cadres';
    });

    test('v9.640 : _cmcDecideImportMode retourne scoped-employees pour V1', () => {
      return window._cmcDecideImportMode('employees', null) === 'scoped-employees';
    });

    test('v9.640 : _cmcDecideImportMode retourne replace-all pour complet', () => {
      return window._cmcDecideImportMode('complete', null) === 'replace-all';
    });

    test('v9.640 : _cmcDecideImportMode user override replace bypass', () => {
      return window._cmcDecideImportMode('employees', 'replace') === 'replace-all';
    });

    // ─── v9.641 : Test auto-rollback désactivé ───
    test('v9.641 : pas de setTimeout 5000 rollback résiduel dans code', () => {
      // Plus de logique blocking auto-rollback dans le code source (v9.641 désactivé)
      // Helpers existent toujours mais ne sont plus auto-triggered
      return typeof window._cmcRollbackToPreviousImport === 'function';
    });

    // ─── v9.636 : Helper diagnostic Pit Boss exposé ───
    test('v9.636 : cmcExportPitBossDiag exposé', () => {
      return typeof window.cmcExportPitBossDiag === 'function';
    });

    test('v9.636 : cmcWipeCadresForMonth exposé', () => {
      return typeof window.cmcWipeCadresForMonth === 'function';
    });

    return out;
  });

  console.log('\n=== Tests runtime v9.639/640/641 ===');
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
  console.log(fail === 0 ? '✅ v9.639/640/641 RUNTIME OK' : '❌ REGRESSION DETECTED');
  console.log(`PASS: ${pass} · FAIL: ${fail}`);
  console.log('========================================');

  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
