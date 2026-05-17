// v9.671 — Test pipeline cross-app CMCteams ↔ Apex (telemetry + handoff)
// Verifie que les helpers de communication avec Apex existent + sync FB.

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
  await page.waitForFunction(() => typeof window.FB_FIX !== 'undefined' && typeof window.A === 'object', { timeout: 20000 });

  const result = await page.evaluate(() => {
    const out = { tests: [] };
    function test(label, fn) {
      try { const ok = fn(); out.tests.push({ label, ok: ok === true, error: ok === true ? null : ('expected true got ' + JSON.stringify(ok)) }); }
      catch (e) { out.tests.push({ label, ok: false, error: e.message }); }
    }

    // Test 1 : FB_FIX existe (clés shared cross-app)
    test('v9.671 : FB_FIX defined comme array non-vide', () => {
      return Array.isArray(window.FB_FIX) && window.FB_FIX.length > 5;
    });

    // Test 2 : ax_telemetry_in dans FB_FIX (CMCteams remonte erreurs vers Apex)
    test('v9.671 : ax_telemetry_in dans FB_FIX (CMC → Apex bridge)', () => {
      return window.FB_FIX.indexOf('ax_telemetry_in') >= 0;
    });

    // Test 3 : ax_claude_todo dans FB_FIX (Apex → Claude Code escalation)
    test('v9.671 : ax_claude_todo dans FB_FIX (escalade Claude Code)', () => {
      return window.FB_FIX.indexOf('ax_claude_todo') >= 0;
    });

    // Test 4 : ax_lessons_learned (lessons partagées Apex ↔ CMC)
    test('v9.671 : ax_lessons_learned (cross-app shared)', () => {
      // Peut etre dans FB_FIX ou shared via Firebase indépendamment
      const inFB = window.FB_FIX.indexOf('ax_lessons_learned') >= 0;
      const inMem = typeof window.cmcMemoryAdd === 'function' || typeof window.ax_lessons_learned !== 'undefined';
      return inFB || inMem;
    });

    // Test 5 : _pushTelemetryToApex existe (helper centralise)
    test('v9.671 : _pushTelemetryToApex existe', () => {
      return typeof window._pushTelemetryToApex === 'function';
    });

    // Test 6 : _pushTelemetryToApex ne crash pas
    test('v9.671 : _pushTelemetryToApex sans throw', () => {
      try {
        window._pushTelemetryToApex('test_id', 'info', 'message test');
        return true;
      } catch (e) {
        return 'throw: ' + e.message;
      }
    });

    // Test 7 : Buffer ax_telemetry_in écrit après push
    test('v9.671 : ax_telemetry_in buffer ecrit', () => {
      const before = JSON.parse(localStorage.getItem('ax_telemetry_in')||'[]');
      window._pushTelemetryToApex('cmc_test', 'warn', 'test message v9.671');
      const after = JSON.parse(localStorage.getItem('ax_telemetry_in')||'[]');
      return after.length > before.length;
    });

    // Test 8 : Entry telemetry contient src="cmcteams" + v=APP_VER + ts
    test('v9.671 : entry telemetry valide (src+v+ts)', () => {
      window._pushTelemetryToApex('cmc_test2', 'info', 'check entry');
      const buf = JSON.parse(localStorage.getItem('ax_telemetry_in')||'[]');
      const last = buf[buf.length - 1];
      if (!last) return 'no entry';
      if (last.src !== 'cmcteams') return 'src='+last.src;
      if (!last.v) return 'no version';
      if (!last.ts || last.ts < Date.now() - 60000) return 'ts stale';
      return true;
    });

    // Test 9 : Buffer cap (max 200 entries pour eviter localStorage explosion)
    test('v9.671 : telemetry buffer respecte cap (max 200)', () => {
      const buf = JSON.parse(localStorage.getItem('ax_telemetry_in')||'[]');
      return buf.length <= 200;
    });

    // Test 10 : cmcMemoryAdd existe (shared memory cross-app)
    test('v9.671 : cmcMemoryAdd existe (memory bridge)', () => {
      return typeof window.cmcMemoryAdd === 'function';
    });

    // Test 11 : cmcMemoryGet existe + retourne array
    test('v9.671 : cmcMemoryGet retourne array', () => {
      if (typeof window.cmcMemoryGet !== 'function') return 'cmcMemoryGet missing';
      const r = window.cmcMemoryGet();
      return Array.isArray(r);
    });

    return out;
  });

  console.log('\n=== Test runtime v9.671 — Cross-app Apex handoff ===');
  let pass = 0, fail = 0;
  result.tests.forEach(t => {
    if (t.ok) { console.log('  ✓ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + (t.error ? ' — ' + t.error : '')); fail++; }
  });
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ APEX HANDOFF OK' : '❌ HANDOFF BROKEN');
  console.log(`PASS: ${pass} · FAIL: ${fail}`);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
