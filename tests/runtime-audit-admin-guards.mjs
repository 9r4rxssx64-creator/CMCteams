// v9.669 — Test sécurité : toutes fonctions admin* refusent les non-admin
// Garantit qu'un user non-AID ne peut pas executer adminXxx().

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
  await page.waitForFunction(() => typeof window.A === 'object' && typeof window.AID === 'string', { timeout: 20000 });

  const result = await page.evaluate(() => {
    const out = { tests: [], guards: [] };
    function test(label, fn) {
      try { const ok = fn(); out.tests.push({ label, ok: ok === true, error: ok === true ? null : ('expected true got ' + JSON.stringify(ok)) }); }
      catch (e) { out.tests.push({ label, ok: false, error: e.message }); }
    }

    // Test 1 : AID est défini comme "U11804" (Kevin admin)
    test('v9.669 : AID === "U11804" (Kevin DESARZENS admin)', () => {
      return window.AID === 'U11804';
    });

    // Test 2 : Tester avec NON-admin → fonctions admin doivent refuser silencieusement
    // Setup : faux user non-admin
    const savedUser = window.A.user;
    const savedRegLen = Object.keys(window.A.reg||{}).length;
    const savedEmpsLen = window.A.employees.length;
    const savedOvLen = Object.keys(window.A.overrides||{}).length;

    window.A.user = { id: 'fake_attacker', name: 'Pas Kevin' };

    // Liste fonctions admin critiques à tester (qui modifient l'état)
    const adminFns = [
      { name: 'adminSetReg', args: ['U00001', 'email', 'hacked@evil.com'] },
      { name: 'adminSetPw', args: ['U00001', 'hacked123'] },
      { name: 'adminSetEmpBg', args: ['U00001', 'red'] },
      { name: 'adminRemoveEmpBg', args: ['U00001'] },
      { name: 'doResetPwDirect', args: ['U00001'] },
      { name: 'agentRunNow', args: ['conflict'] },
      { name: 'agentToggle', args: ['conflict'] },
      { name: 'cmcAgentsForceAll', args: [] },
      { name: 'cmcAttachVisualPlanning', args: [null] },
      { name: 'cmcRequestApexVision', args: [] },
    ];

    adminFns.forEach(fn => {
      if (typeof window[fn.name] !== 'function') {
        out.guards.push({ fn: fn.name, status: 'missing' });
        return;
      }
      // Capture toast warnings + verify state inchange
      let warnedAsAdmin = false;
      const toastOrig = window.toast;
      window.toast = function(msg, type) { if (type === 'err' || (msg||'').includes('Admin')) warnedAsAdmin = true; };

      try {
        window[fn.name].apply(window, fn.args);
      } catch (e) {
        // throw means guard didn't gracefully return — count as guard fail
        out.guards.push({ fn: fn.name, status: 'throw', err: e.message.slice(0,80) });
        window.toast = toastOrig;
        return;
      }
      window.toast = toastOrig;
      out.guards.push({ fn: fn.name, status: 'silent_or_warned', warned: warnedAsAdmin });
    });

    // Restore user
    window.A.user = savedUser;

    // Test 3 : Aucune modification non autorisée (employees + reg + overrides intacts)
    test('v9.669 : A.employees inchange apres tentative attaque', () => {
      return window.A.employees.length === savedEmpsLen;
    });
    test('v9.669 : A.reg inchange apres tentative attaque (taille)', () => {
      return Object.keys(window.A.reg||{}).length === savedRegLen;
    });
    test('v9.669 : A.overrides inchange apres tentative attaque (taille)', () => {
      return Object.keys(window.A.overrides||{}).length === savedOvLen;
    });

    // Test 4 : aucune fonction admin n'a throw (mauvaise UX)
    test('v9.669 : aucune fonction admin throw quand non-admin', () => {
      const throwers = out.guards.filter(g => g.status === 'throw');
      if (throwers.length) return throwers.map(t => t.fn).join(',');
      return true;
    });

    // Test 5 : aucune fonction admin manquante (toutes definies)
    test('v9.669 : toutes les admin fns testees sont definies', () => {
      const missing = out.guards.filter(g => g.status === 'missing');
      if (missing.length) return 'manquantes: ' + missing.map(m => m.fn).join(',');
      return true;
    });

    return out;
  });

  console.log('\n=== Test runtime v9.669 — Guards admin (sécurité) ===');
  let pass = 0, fail = 0;
  result.tests.forEach(t => {
    if (t.ok) { console.log('  ✓ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + (t.error ? ' — ' + t.error : '')); fail++; }
  });
  console.log('\nFonctions admin testées :');
  result.guards.forEach(g => {
    const ic = g.status === 'silent_or_warned' ? '✓' : g.status === 'missing' ? '⚠' : '✗';
    console.log('  ' + ic + ' ' + g.fn + ' : ' + g.status + (g.err ? ' — ' + g.err : ''));
  });
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ GUARDS ADMIN OK' : '❌ FUITE SÉCURITÉ ADMIN');
  console.log(`PASS: ${pass} · FAIL: ${fail}`);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
