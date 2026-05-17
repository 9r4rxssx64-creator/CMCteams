// v9.670 — Test sécurité PIN admin : hashing, rate-limit, format

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
  await page.waitForFunction(() => typeof window.hashPwStrong === 'function' && typeof window.verifyPw === 'function' && typeof window.hashPwV2 === 'function', { timeout: 20000 });

  const result = await page.evaluate(() => {
    const out = { tests: [] };
    function test(label, fn) {
      try { const ok = fn(); out.tests.push({ label, ok: ok === true, error: ok === true ? null : ('expected true got ' + JSON.stringify(ok)) }); }
      catch (e) { out.tests.push({ label, ok: false, error: e.message }); }
    }

    // Test 1 : hashPwStrong produit un hash prefixé "s1:"
    test('v9.670 : hashPwStrong prefix "s1:"', () => {
      const h = window.hashPwStrong('test123');
      return typeof h === 'string' && h.startsWith('s1:');
    });

    // Test 2 : hashPwStrong deterministe (même input → même output)
    test('v9.670 : hashPwStrong deterministe', () => {
      return window.hashPwStrong('test123') === window.hashPwStrong('test123');
    });

    // Test 3 : hashPwV2 utilise sel dynamique + format v2:<salt>:<hash>
    test('v9.670 : hashPwV2 format v2:salt:hash', () => {
      const h = window.hashPwV2('mySecure');
      if (!h.startsWith('v2:')) return 'no v2 prefix: '+h.slice(0,20);
      const parts = h.split(':');
      if (parts.length !== 3) return 'parts='+parts.length;
      if (parts[1].length < 8) return 'salt too short: '+parts[1].length;
      return true;
    });

    // Test 4 : hashPwV2 avec sel different → hash different (entropy)
    test('v9.670 : hashPwV2 sels differents → hashs differents', () => {
      const h1 = window.hashPwV2('same', 'saltA');
      const h2 = window.hashPwV2('same', 'saltB');
      return h1 !== h2;
    });

    // Test 5 : hashPwV2 avec même sel + pwd → même hash (deterministic w/ salt)
    test('v9.670 : hashPwV2 deterministic avec sel fixe', () => {
      const h1 = window.hashPwV2('same', 'fixedsalt');
      const h2 = window.hashPwV2('same', 'fixedsalt');
      return h1 === h2;
    });

    // Test 6 : verifyPw matche objet v2 valide
    test('v9.670 : verifyPw matche objet hash v2', () => {
      const h = window.hashPwV2('mypwd', 'mysalt12345');
      const stored = { h: h };
      return window.verifyPw('mypwd', stored) === true;
    });

    // Test 7 : verifyPw rejette mauvais password sur objet v2
    test('v9.670 : verifyPw rejette mauvais pwd sur v2', () => {
      const h = window.hashPwV2('correct', 'salt12345678');
      return window.verifyPw('wrong', { h: h }) === false;
    });

    // Test 8 : cmc_admin_pin dans FB_LOCAL (jamais sync Firebase, regle SECU)
    test('v9.670 : cmc_admin_pin dans FB_LOCAL (jamais sync)', () => {
      return window.FB_LOCAL.indexOf('cmc_admin_pin') >= 0;
    });

    // Test 9 : cmc_pin_fails NOT dans FB_LOCAL (sync pour resister clear localStorage v9.530)
    test('v9.670 : cmc_pin_fails sync Firebase (v9.530)', () => {
      return window.FB_LOCAL.indexOf('cmc_pin_fails') < 0;
    });

    // Test 10 : verifyPw sur null/undefined retourne false sans crash
    test('v9.670 : verifyPw(null,null) === false (no crash)', () => {
      return window.verifyPw(null, null) === false && window.verifyPw(undefined, undefined) === false;
    });

    // Test 11 : hashPwStrong vide ne crash pas
    test('v9.670 : hashPwStrong("") no crash', () => {
      try {
        return typeof window.hashPwStrong('') === 'string';
      } catch (e) {
        return 'throw: ' + e.message;
      }
    });

    // Test 12 : Agent cmc-admin-pin-watch present
    test('v9.670 : agent cmc-admin-pin-watch present', () => {
      const a = (window.APP_AGENTS||[]).find(x => x.id === 'cmc-admin-pin-watch');
      return !!a && typeof a.run === 'function';
    });

    return out;
  });

  console.log('\n=== Test runtime v9.670 — Sécurité PIN admin ===');
  let pass = 0, fail = 0;
  result.tests.forEach(t => {
    if (t.ok) { console.log('  ✓ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + (t.error ? ' — ' + t.error : '')); fail++; }
  });
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ PIN SECURITY OK' : '❌ PIN SECURITY BROKEN');
  console.log(`PASS: ${pass} · FAIL: ${fail}`);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
