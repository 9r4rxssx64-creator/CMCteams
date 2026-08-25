// v9.784 — Test fonctionnel réel (Playwright) :
//  (1) ROUTE pitmap/pitmapview câblée sur la vraie carte vMapEditor pour l'admin
//      (le bouton "Tables Live (carte)" ne tombe plus sur un stub), fallback non-admin.
//  (2) DÉTENTE v9.783 Règle 2 : une absence (CP) intercalée brise la série de jours
//      consécutifs → plus de faux positif "max_jours_consec" ; un VRAI bloc de 8 jours
//      travaillés consécutifs reste détecté (la règle marche toujours).
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, '../index.html');

async function main(){
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await ctx.newPage();
  await page.goto('file://' + INDEX_PATH, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.A === 'object' && Array.isArray(window.A.employees), { timeout: 20000 });

  const result = await page.evaluate(() => {
    const out = { tests: [] };
    function test(label, fn){
      try { const ok = fn(); out.tests.push({ label, ok: ok === true, error: ok === true ? null : ('got ' + JSON.stringify(ok)) }); }
      catch (e) { out.tests.push({ label, ok: false, error: e.message }); }
    }

    // ---- (1) ROUTE pitmap → vMapEditor (admin) ----
    test('vMapEditor existe', () => typeof window.vMapEditor === 'function');
    test('admin : route pitmap rend la vraie carte (pas le stub "en cours de développement")', () => {
      window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' };
      window.A.view = 'pitmap';
      const html = window.vMain();
      return typeof html === 'string' && html.length > 50
        && html.indexOf('en cours de développement') < 0
        && (html.indexOf('Monte-Carlo') >= 0 || html.indexOf('casino') >= 0 || html.indexOf('Café de Paris') >= 0 || html.indexOf('mapEditor') >= 0 || html.indexOf('Carte') >= 0);
    });
    test('non-admin : route pitmap NE rend PAS l\'éditeur de carte (fallback)', () => {
      window.A.user = { id: 'U00001', name: 'Employe Test' };
      window.A.view = 'pitmap';
      const html = window.vMain();
      // L'éditeur admin (zones/onglets casinos) ne doit pas s'afficher pour un non-admin.
      return typeof html === 'string' && html.indexOf('Café de Paris') < 0;
    });

    // ---- (2) DÉTENTE Règle 2 : absence intercalée ne crée plus de faux 7j consécutifs ----
    if (typeof window.detectRepoConflicts === 'function') {
      window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' };
      const iy = 2026, im = 4, key = iy + '-' + im;
      window.A.overrides = window.A.overrides || {};
      const empBridge = window.A.employees[0];
      const empReal = window.A.employees[1];
      if (empBridge && empReal) {
        // emp BRIDGE : 6 jours travail + 1 CP + 6 jours travail (la CP coupe la série)
        const ovB = {};
        for (let d = 1; d <= 6; d++) ovB[d] = '20/5';
        ovB[7] = 'CP';
        for (let d = 8; d <= 13; d++) ovB[d] = '20/5';
        for (let d = 14; d <= 20; d++) ovB[d] = (d % 2 ? 'RH' : 'R');
        // emp REAL : 8 jours travail consécutifs VRAIS (doit toujours être détecté)
        const ovR = {};
        for (let d = 1; d <= 8; d++) ovR[d] = '20/5';
        for (let d = 9; d <= 16; d++) ovR[d] = (d % 2 ? 'RH' : 'R');
        window.A.overrides[key] = window.A.overrides[key] || {};
        window.A.overrides[key][empBridge.id] = ovB;
        window.A.overrides[key][empReal.id] = ovR;
        // forcer actifs ce mois (isEmpActive : fromMo/toMo undefined => actif)
        [empBridge, empReal].forEach(e => { delete e.fromMo; delete e.toMo; e.visitor = false; });
        // invalider les caches (gpl + detectRepoConflicts recalcule via sig overrides)
        if (typeof window.gplInvalidate === 'function') window.gplInvalidate(iy, im);
        const conflicts = window.detectRepoConflicts(iy, im) || [];
        const bridgeConsec = conflicts.filter(c => c.emp && c.emp.id === empBridge.id && c.type === 'max_jours_consec');
        const realConsec = conflicts.filter(c => c.emp && c.emp.id === empReal.id && c.type === 'max_jours_consec');
        test('détente : CP intercalée NE crée PAS de faux "max_jours_consec" (6+6)', () => bridgeConsec.length === 0);
        test('non-régression : 8 jours travaillés VRAIS sont toujours détectés', () => realConsec.length === 1);
      } else {
        test('setup détente (emps dispo)', () => false);
      }
    } else {
      test('detectRepoConflicts existe', () => false);
    }

    return out;
  });

  await browser.close();

  let pass = 0, fail = 0;
  console.log('\n=== Test runtime v9.784 — routes pitmap + détente Règle 2 ===\n');
  for (const t of result.tests) {
    if (t.ok) { console.log('  ✓ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + '  [' + t.error + ']'); fail++; }
  }
  console.log('\n========================================');
  console.log((fail === 0 ? '✅' : '❌') + ' v9.784 ROUTES + DÉTENTE — PASS: ' + pass + ' · FAIL: ' + fail);
  console.log('========================================');
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
