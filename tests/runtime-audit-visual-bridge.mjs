// v9.667 — Test bridge visuel planning : cmcAttachVisualPlanning + injection
// du contexte dans buildIASystemPrompt pour qu'Apex IA reconnaisse l'image.

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
  await page.waitForFunction(() => typeof window.cmcAttachVisualPlanning === 'function' && typeof window.buildIASystemPrompt === 'function', { timeout: 20000 });
  await page.evaluate(() => { window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' }; });

  const result = await page.evaluate(() => {
    const out = { tests: [] };
    function test(label, fn) {
      try { const ok = fn(); out.tests.push({ label, ok: ok === true, error: ok === true ? null : ('expected true got ' + JSON.stringify(ok)) }); }
      catch (e) { out.tests.push({ label, ok: false, error: e.message }); }
    }

    // Test 1 : cmcAttachVisualPlanning existe et est admin-only
    test('v9.667 : cmcAttachVisualPlanning est admin-only', () => {
      // Simuler non-admin
      const savedUser = window.A.user;
      window.A.user = { id: 'fake_user', name: 'Pas Kevin' };
      let warned = false;
      const toastOrig = window.toast;
      window.toast = function(msg, type) { if (type === 'err') warned = true; };
      // Appel sans inputEl valid
      window.cmcAttachVisualPlanning(null);
      window.toast = toastOrig;
      window.A.user = savedUser;
      return warned;
    });

    // Test 2 : cmcRequestApexVision existe et est admin-only
    test('v9.667 : cmcRequestApexVision est admin-only', () => {
      if (typeof window.cmcRequestApexVision !== 'function') return 'cmcRequestApexVision missing';
      const savedUser = window.A.user;
      window.A.user = { id: 'fake_user', name: 'Pas Kevin' };
      let warned = false;
      const toastOrig = window.toast;
      window.toast = function(msg, type) { if (type === 'err') warned = true; };
      window.cmcRequestApexVision();
      window.toast = toastOrig;
      window.A.user = savedUser;
      return warned;
    });

    // Test 3 : Sans visuel, buildIASystemPrompt mentionne "aucun visuel"
    test('v9.667 : prompt IA dit "aucun visuel" si pas attache', () => {
      // Setup : mois sans visuel
      window.A.year = 2027; window.A.month = 0; // janvier 2027 jamais utilise
      const key = window.A.year + '-' + window.A.month;
      try { localStorage.removeItem('cmc_visual_planning_' + key); } catch (_){}
      const prompt = window.buildIASystemPrompt();
      const hasNo = prompt.toLowerCase().includes('aucun visuel');
      return hasNo;
    });

    // Test 4 : Avec visuel, buildIASystemPrompt mentionne "VISUEL PLANNING ATTACHE"
    test('v9.667 : prompt IA confirme image attachee si dataUrl present', () => {
      window.A.year = 2027; window.A.month = 0;
      const key = window.A.year + '-' + window.A.month;
      const fakeMeta = {
        ts: Date.now(),
        name: 'test-planning.jpg',
        mime: 'image/jpeg',
        size: 12345,
        dataUrl: 'data:image/jpeg;base64,/9j/4AAQ',
        key: key, year: 2027, month: 0,
      };
      localStorage.setItem('cmc_visual_planning_' + key, JSON.stringify(fakeMeta));
      const prompt = window.buildIASystemPrompt();
      const hasYes = prompt.includes('VISUEL PLANNING ATTACHE') && prompt.includes('test-planning.jpg');
      // Cleanup
      localStorage.removeItem('cmc_visual_planning_' + key);
      return hasYes;
    });

    // Test 5 : FB_PRE contient cmc_visual_planning_ (sync cross-device)
    test('v9.667 : FB_PRE inclut cmc_visual_planning_ (sync Firebase)', () => {
      if (typeof window.FB_PRE === 'undefined') return 'FB_PRE undefined';
      return window.FB_PRE.indexOf('cmc_visual_planning_') >= 0;
    });

    // Test 6 : FB_PRE contient cmc_apex_vision_request_ + result
    test('v9.667 : FB_PRE inclut cmc_apex_vision_request_ + _result', () => {
      const r = window.FB_PRE.indexOf('cmc_apex_vision_request_') >= 0;
      const v = window.FB_PRE.indexOf('cmc_apex_vision_result_') >= 0;
      if (!r) return 'request prefix missing';
      if (!v) return 'result prefix missing';
      return true;
    });

    return out;
  });

  console.log('\n=== Test runtime v9.667 — Bridge visuel planning ===');
  let pass = 0, fail = 0;
  result.tests.forEach(t => {
    if (t.ok) { console.log('  ✓ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + (t.error ? ' — ' + t.error : '')); fail++; }
  });
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ BRIDGE VISUEL APEX OK' : '❌ BRIDGE CASSE');
  console.log(`PASS: ${pass} · FAIL: ${fail}`);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
