// v9.787 — Test fonctionnel réel (Playwright) : la clé IA (secret Anthropic) ne doit
// PLUS être poussée vers Firebase (DB ouverte). On intercepte le fetch PUT de
// _adminCfgBackup et on vérifie l'absence de iaKey / du secret dans le body.
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
  await page.waitForFunction(() => typeof window.A === 'object' && typeof window._adminCfgBackup === 'function', { timeout: 20000 });

  const result = await page.evaluate(() => {
    const out = { tests: [] };
    function test(label, fn){
      try { const ok = fn(); out.tests.push({ label, ok: ok === true, error: ok === true ? null : ('got ' + JSON.stringify(ok)) }); }
      catch (e) { out.tests.push({ label, ok: false, error: e.message }); }
    }
    window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' };
    window.iaApiKey = 'sk-ant-SECRET-TEST-ZZZ';
    if (!window.FB_URL) window.FB_URL = 'https://test-cmc.firebasedatabase.app';

    let capturedBody = null;
    const origFetch = window.fetch;
    window.fetch = function(url, opts){
      if (String(url).indexOf('cmc_admin_cfg') >= 0 && opts && opts.method === 'PUT') capturedBody = String(opts.body || '');
      return Promise.resolve({ ok: true, json: function(){ return Promise.resolve({}); } });
    };
    try { window._adminCfgBackup(); } catch(e) {}
    window.fetch = origFetch;

    test('_adminCfgBackup a bien émis un PUT cmc_admin_cfg', () => capturedBody !== null);
    test('le body NE contient PAS le champ iaKey', () => capturedBody !== null && capturedBody.indexOf('iaKey') < 0);
    test('le body NE contient PAS le secret Anthropic', () => capturedBody !== null && capturedBody.indexOf('SECRET-TEST') < 0);
    // sanity : le backup contient toujours les champs non-sensibles
    test('le body contient toujours les champs config non-sensibles (theme/lang/iaProxy)', () => capturedBody !== null && (capturedBody.indexOf('theme') >= 0 || capturedBody.indexOf('lang') >= 0 || capturedBody.indexOf('iaProxy') >= 0));

    return out;
  });

  await browser.close();

  let pass = 0, fail = 0;
  console.log('\n=== Test runtime v9.787 — clé IA jamais poussée vers Firebase ===\n');
  for (const t of result.tests) {
    if (t.ok) { console.log('  ✓ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + '  [' + t.error + ']'); fail++; }
  }
  console.log('\n========================================');
  console.log((fail === 0 ? '✅' : '❌') + ' v9.787 SECRET LEAK FIX — PASS: ' + pass + ' · FAIL: ' + fail);
  console.log('========================================');
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
