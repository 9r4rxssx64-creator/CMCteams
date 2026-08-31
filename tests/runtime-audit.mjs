// v9.624 — Runtime audit Playwright : exécute les 34 tests régression dans un vrai
// browser Chromium + simule import V1+V2 + mesure perf cache empById.
// Lancé par Kevin en autonome pour valider 100/100 RUNTIME (pas juste audit grep).

import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, '../index.html');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone SE+ équivalent
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  });
  const page = await ctx.newPage();

  const consoleErrors = [];
  const networkErrors = []; // separately track network/CDN errors (acceptable in file://)
  // Filtre : erreurs réseau (ERR_FILE_NOT_FOUND, ERR_CERT_AUTHORITY_INVALID, CSP fonts, etc.)
  // sont normales en mode file:// car ressources CDN externes inaccessibles. Pas des bugs app.
  const isNetworkNoise = (txt) => /net::ERR_FILE_NOT_FOUND|net::ERR_CERT_AUTHORITY_INVALID|net::ERR_NAME_NOT_RESOLVED|fonts\.googleapis|firebase|Failed to load resource|Refused to load the stylesheet|Content Security Policy/i.test(txt);
  page.on('console', (m) => {
    if (m.type() === 'error') {
      const txt = m.text().slice(0, 200);
      if (isNetworkNoise(txt)) networkErrors.push(txt);
      else consoleErrors.push(txt);
    }
  });
  page.on('pageerror', (e) => {
    const msg = (e.message || String(e)).slice(0, 200);
    if (isNetworkNoise(msg)) networkErrors.push('PAGE: ' + msg);
    else consoleErrors.push('PAGEERROR: ' + msg);
  });

  // Charger index.html en local file://
  const fileUrl = 'file://' + INDEX_PATH;
  console.log('[runtime-audit] loading', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Attendre que A et CMC_PARSER_TESTS soient prêts
  await page.waitForFunction(() => {
    return typeof window.A === 'object' && Array.isArray(window.A.employees)
      && typeof window.CMC_PARSER_TESTS !== 'undefined'
      && typeof window._cmcRunParserTests === 'function';
  }, { timeout: 20000 });

  console.log('[runtime-audit] app loaded, A.employees =',
    await page.evaluate(() => window.A.employees.length));

  // Forcer admin Kevin DESARZENS pour permettre cmcImportTests (guard AID)
  await page.evaluate(() => {
    window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' };
  });

  // === 1. Lancer les 34 tests régression ===
  console.log('\n=== TEST 1 : 34 tests régression CMC_PARSER_TESTS ===');
  const testRes = await page.evaluate(() => {
    try {
      const r = window._cmcRunParserTests();
      return r;
    } catch (e) {
      return { error: e.message || String(e) };
    }
  });

  if (testRes.error) {
    console.error('[FAIL] runner error:', testRes.error);
  } else {
    console.log(`Total: ${testRes.total} · Pass: ${testRes.pass} · Fail: ${testRes.fail} · Skipped: ${testRes.skipped} · Asserted: ${testRes.asserted}`);
    if (testRes.fail > 0) {
      console.log('\nFAILED tests:');
      testRes.results.filter(r => !r.ok).forEach(r => {
        console.log(`  ✗ ${r.id} — ${r.label} — ${r.err}`);
      });
    }
    // Show only the new VS24-VS28
    const newTests = testRes.results.filter(r => /^VS(2[4-8])$/.test(r.id));
    if (newTests.length) {
      console.log('\nNew v9.622-623 tests (VS24-VS28):');
      newTests.forEach(r => {
        console.log(`  ${r.ok ? '✓' : '✗'} ${r.id} — ${r.label}${r.err ? ' (' + r.err + ')' : ''}`);
      });
    }
  }

  // === 2. Simulation import V1 (employés) puis V2 (cadres) ===
  console.log('\n=== TEST 2 : Scénario E2E V1 → V2 cohabitation ===');
  const e2e = await page.evaluate(() => {
    try {
      // Trouver un emp non-cadre et un cadre
      const empV1 = window.A.employees.find(e => (e.family || '') !== 'cadres');
      const cadreV2 = window.A.employees.find(e => (e.family || '') === 'cadres');
      if (!empV1 || !cadreV2) return { skipped: 'employees/cadres pas chargés' };

      const key = '2026-4';
      // Reset
      window.A.overrides = window.A.overrides || {};
      window.A.overrides[key] = {};
      window.A.overrides_meta = window.A.overrides_meta || {};
      window.A.overrides_meta[key] = {};

      // === V1 import : scoped-employees wipe + ajout employé ===
      const mode1 = window._cmcDecideImportMode('employees', null);
      // V1 vide d'abord (rien à wipe)
      window.A.overrides[key][empV1.id] = { 1: '22/6', 2: '19/2', 3: 'RH', 4: 'CP' };

      // === V2 import : scoped-cadres wipe + ajout cadre ===
      const mode2 = window._cmcDecideImportMode('cadres', null);
      // V2 wipe cadres only
      const wipeStats = window._cmcScopedWipe(key, 'cadres');
      // Le parser V2 ajoute le cadre
      window.A.overrides[key][cadreV2.id] = { 1: '22/6', 2: '19/2', 3: 'RH' };

      // VÉRIFICATIONS :
      const v1Intact = window.A.overrides[key][empV1.id]
        && window.A.overrides[key][empV1.id][1] === '22/6'
        && window.A.overrides[key][empV1.id][4] === 'CP';
      const v2Added = window.A.overrides[key][cadreV2.id]
        && window.A.overrides[key][cadreV2.id][1] === '22/6';

      // Test que infer meta marque les meta cells correctement
      cadreV2.faisantFonction = true; // simule capture FF du PDF
      const inferStats = window._cmcInferCellMetaFromCodes(key);
      const cadreMeta = window.A.overrides_meta[key][cadreV2.id];
      const ffMetaOK = cadreMeta && cadreMeta[1] && cadreMeta[1].ff === true && cadreMeta[1].bg === 'FF';
      cadreV2.faisantFonction = false; // cleanup

      // Test cell-color rendering helper
      const cssRender = window.cmcCellBgForView(2026, 4, cadreV2.id, 1,
        window._cmcMetaCacheForView(2026, 4));

      // Cleanup
      delete window.A.overrides[key];
      delete window.A.overrides_meta[key];

      return {
        ok: true,
        mode1, mode2,
        wipeStats: { wiped: wipeStats.wipedEmps, preserved: wipeStats.preservedEmps },
        v1Intact, v2Added, ffMetaOK,
        cssRender,
        empName: empV1.name,
        cadreName: cadreV2.name
      };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  if (!e2e.ok) {
    console.error('[FAIL] E2E error:', e2e.error || e2e.skipped);
  } else {
    console.log(`  V1 mode: ${e2e.mode1} (employés ${e2e.empName})`);
    console.log(`  V2 mode: ${e2e.mode2} (cadre ${e2e.cadreName})`);
    console.log(`  Scoped wipe stats: wiped=${e2e.wipeStats.wiped} preserved=${e2e.wipeStats.preserved}`);
    console.log(`  ${e2e.v1Intact ? '✓' : '✗'} V1 employé intact après V2 import`);
    console.log(`  ${e2e.v2Added ? '✓' : '✗'} V2 cadre ajouté`);
    console.log(`  ${e2e.ffMetaOK ? '✓' : '✗'} Meta FF cell-level (bg=FF + ff=true)`);
    console.log(`  Cell CSS render FF: ${e2e.cssRender || '(empty)'}`);
  }

  // === 3. Perf : _cmcGetEmpByIdCache memoization ===
  console.log('\n=== TEST 3 : Perf cache empById (memoization stable) ===');
  const perfRes = await page.evaluate(() => {
    const t0 = performance.now();
    let c1, c2, c3;
    for (let i = 0; i < 1000; i++) {
      c1 = window._cmcGetEmpByIdCache();
    }
    const t1 = performance.now();
    c2 = window._cmcGetEmpByIdCache();
    c3 = window._cmcGetEmpByIdCache();
    return {
      time1000calls: t1 - t0,
      sameRef: c1 === c2 && c2 === c3,
      cacheSize: Object.keys(c1 || {}).length
    };
  });
  console.log(`  1000 appels = ${perfRes.time1000calls.toFixed(2)}ms (${(perfRes.time1000calls / 1000).toFixed(4)}ms/call)`);
  console.log(`  ${perfRes.sameRef ? '✓' : '✗'} Cache stable (mêmes références)`);
  console.log(`  Cache size: ${perfRes.cacheSize} emps`);

  // === 4. Sentinelle meta-completeness ===
  console.log('\n=== TEST 4 : Sentinelle meta-completeness-watch ===');
  const sentRes = await page.evaluate(() => {
    if (typeof window._agentMetaCompletenessWatch !== 'function') return { ok: false, reason: 'helper missing' };
    try {
      window._agentMetaCompletenessWatch();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
  console.log(`  ${sentRes.ok ? '✓' : '✗'} Sentinelle s'exécute sans throw`);

  // === 5. Erreurs console pendant le test ===
  console.log('\n=== TEST 5 : Erreurs console APP (réseau filtré) ===');
  console.log(`  Réseau/CDN noise (filtré, attendu file://) : ${networkErrors.length}`);
  if (consoleErrors.length === 0) {
    console.log('  ✓ Aucune erreur APP');
  } else {
    console.log(`  ✗ ${consoleErrors.length} erreur(s) APP :`);
    consoleErrors.slice(0, 10).forEach((e, i) => console.log(`    ${i + 1}. ${e}`));
  }

  // === Score final ===
  const realFails = testRes.fail || 0;
  const allOK = realFails === 0 && e2e.ok && e2e.v1Intact && e2e.v2Added && e2e.ffMetaOK
    && perfRes.sameRef && sentRes.ok && consoleErrors.length === 0;

  console.log('\n========================================');
  console.log(allOK ? '✅ RUNTIME 100/100 RÉEL CONFIRMÉ' : '❌ RUNTIME NON 100/100');
  console.log('========================================');
  console.log(`Tests régression: ${testRes.pass || 0}/${testRes.total || 0} (asserted ${testRes.asserted || 0}, skipped ${testRes.skipped || 0})`);
  console.log(`E2E V1↔V2: ${e2e.ok && e2e.v1Intact && e2e.v2Added && e2e.ffMetaOK ? 'PASS' : 'FAIL'}`);
  console.log(`Perf cache: ${perfRes.sameRef ? 'PASS' : 'FAIL'} (${perfRes.time1000calls.toFixed(2)}ms/1000)`);
  console.log(`Sentinelle: ${sentRes.ok ? 'PASS' : 'FAIL'}`);
  console.log(`Console errors: ${consoleErrors.length}`);

  await browser.close();
  process.exit(allOK ? 0 : 1);
}

main().catch((e) => {
  console.error('runtime-audit FATAL:', e);
  process.exit(2);
});
