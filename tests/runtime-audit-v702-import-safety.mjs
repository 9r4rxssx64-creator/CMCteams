// v9.702 — Test SAFETY de l'import : anticipation des 2 race conditions critiques
// 1. SSE strip cmc_e + cache de détection invalidé → vues restent fonctionnelles
// 2. Wipe-lock auto-cleared par fbWrite local cmc_ov → import ne se fait pas wiper
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
  await page.evaluate(() => { window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' }; });

  const result = await page.evaluate(() => {
    const out = { tests: [] };
    function test(label, fn) {
      try { const ok = fn(); out.tests.push({ label, ok: ok === true, error: ok === true ? null : ('expected true got ' + JSON.stringify(ok)) }); }
      catch (e) { out.tests.push({ label, ok: false, error: e.message }); }
    }

    // ── RACE CONDITION #1 : SSE strip vs detection cache ──
    test('v9.702 fbApplyData cmc_e invalide _cmcLastDetectCacheKey', () => {
      // Setup : un cache key actif
      window._cmcLastDetectCacheKey = "2026-4|99";
      // Trigger SSE strip via fbApplyData
      const empsCopy = JSON.parse(JSON.stringify(window.A.employees.slice(0, 5)));
      if(typeof fbApplyData !== 'function') return 'fbApplyData not exposed';
      try { fbApplyData('cmc_e', empsCopy); } catch(e) {}
      // After SSE strip, cache key must be null to force re-detection
      return window._cmcLastDetectCacheKey === null;
    });

    // ── RACE CONDITION #2 : Wipe-lock vs user import ──
    test('v9.702 fbWrite cmc_ov non-vide efface wipe-lock', () => {
      // Setup : pose un wipe-lock (comme après wipe v9.702)
      const fakeLockTs = Date.now();
      try { localStorage.setItem('cmc_wipe_lock_ts', String(fakeLockTs)); } catch(_) {}
      // Verify lock is in place
      if(parseInt(localStorage.getItem('cmc_wipe_lock_ts')||'0') !== fakeLockTs)
        return 'lock setup failed';
      // Simulate local fbWrite of non-empty cmc_ov (user import)
      if(typeof fbWrite !== 'function') return 'fbWrite not exposed';
      // FB_URL might be null in test env, but the lock-clear code runs BEFORE the fetch
      // so we can test it. Force FB_URL to a fake value to enter the function body.
      const wasFbUrl = window.FB_URL;
      window.FB_URL = window.FB_URL || 'https://fake.test/'; // ensure fbShouldSync passes
      try { fbWrite('cmc_ov', { '2026-4': { 'U001': { 1: 'BRT' } } }); } catch(_) {}
      window.FB_URL = wasFbUrl;
      // Lock should be cleared
      return localStorage.getItem('cmc_wipe_lock_ts') === null;
    });

    test('v9.702 fbWrite cmc_ov VIDE ne touche PAS le wipe-lock', () => {
      // Setup
      const fakeLockTs = Date.now();
      try { localStorage.setItem('cmc_wipe_lock_ts', String(fakeLockTs)); } catch(_) {}
      const wasFbUrl = window.FB_URL;
      window.FB_URL = window.FB_URL || 'https://fake.test/';
      try { fbWrite('cmc_ov', {}); } catch(_) {} // empty = wipe re-push, should NOT clear lock
      window.FB_URL = wasFbUrl;
      // Lock should STILL be present (wipe re-push doesn't clear it)
      const stillLocked = localStorage.getItem('cmc_wipe_lock_ts') !== null;
      // Cleanup
      try { localStorage.removeItem('cmc_wipe_lock_ts'); } catch(_) {}
      return stillLocked;
    });

    test('v9.702 fbWrite autre clé ne touche pas le wipe-lock', () => {
      const fakeLockTs = Date.now();
      try { localStorage.setItem('cmc_wipe_lock_ts', String(fakeLockTs)); } catch(_) {}
      const wasFbUrl = window.FB_URL;
      window.FB_URL = window.FB_URL || 'https://fake.test/';
      try { fbWrite('cmc_chat', [{ts:1, text:'hi'}]); } catch(_) {}
      window.FB_URL = wasFbUrl;
      const stillLocked = localStorage.getItem('cmc_wipe_lock_ts') !== null;
      try { localStorage.removeItem('cmc_wipe_lock_ts'); } catch(_) {}
      return stillLocked;
    });

    // ── Smoke test : tout l'import flow encore fonctionnel ──
    test('cmcStructuredParser toujours exposé', () => typeof window.cmcStructuredParser === 'function' || typeof window.doImport === 'function');
    test('_cmcDetectTeamsByRestPattern toujours exposé', () => typeof window._cmcDetectTeamsByRestPattern === 'function');
    test('_stripPersistedTeamFamHistory toujours exposé', () => typeof window._stripPersistedTeamFamHistory === 'function');
    test('cmcWipeAllPlanningMemory toujours exposé', () => typeof window.cmcWipeAllPlanningMemory === 'function');
    test('teamForMonth strict (avril → "?")', () => {
      const fakeEmp = { id: 'TEST', team: 'r5', teamHistory: { '2026-4': 'r3' } };
      return window.teamForMonth(fakeEmp, 2026, 3) === '?';
    });

    return out;
  });

  console.log('\n=== Test v9.702 — Anticipation race conditions import ===');
  let pass = 0, fail = 0;
  result.tests.forEach(t => {
    if (t.ok) { console.log('  ✓ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + (t.error ? ' — ' + t.error : '')); fail++; }
  });
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ IMPORT SAFETY v9.702 OK' : '❌ IMPORT SAFETY v9.702 BROKEN');
  console.log(`PASS: ${pass} · FAIL: ${fail}`);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
