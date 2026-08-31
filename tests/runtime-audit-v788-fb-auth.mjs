// v9.788 — Test fonctionnel réel (Playwright) : plumbing auth Firebase (Chantier 2 Phase A).
// Vérifie : _fbAuthQS gating, fail-open SANS clé (no-op, token reste null), token attaché
// quand clé+réponse OK (fetch mocké), et cmcSaveFbApiKey persiste la clé.
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
  await page.waitForFunction(() => typeof window.cmcFbAnonAuth === 'function' && typeof window._fbAuthQS === 'function', { timeout: 20000 });

  const result = await page.evaluate(async () => {
    const out = { tests: [] };
    function test(label, ok){ out.tests.push({ label, ok: ok === true, error: ok === true ? null : ('got ' + JSON.stringify(ok)) }); }

    // t1 — sans token : _fbAuthQS() vide (comportement actuel inchangé)
    window._fbAuthToken = null;
    test('_fbAuthQS() vide sans token (fail-open)', window._fbAuthQS() === '');

    // t2 — avec token : ?auth=
    window._fbAuthToken = 'TKN123';
    test('_fbAuthQS() = ?auth=<token> avec token', window._fbAuthQS() === '?auth=TKN123');
    window._fbAuthToken = null;

    // t3 — cmcFbAnonAuth SANS clé → no-op, token reste null (fail-open)
    try { localStorage.removeItem('cmc_fb_apikey'); } catch(e){}
    const r3 = await new Promise(res => { try { window.cmcFbAnonAuth(function(ok){ res(ok); }); } catch(e){ res('throw:'+e.message); } });
    test('cmcFbAnonAuth sans clé → cb(false)', r3 === false);
    test('token reste null sans clé', window._fbAuthToken === null);

    // t4 — avec clé + fetch mocké OK → token attaché
    const origFetch = window.fetch;
    window.fetch = function(url, opts){
      if (String(url).indexOf('identitytoolkit') >= 0) {
        return Promise.resolve({ ok: true, json: function(){ return Promise.resolve({ idToken: 'IDTOKEN_OK', expiresIn: '3600' }); } });
      }
      return origFetch(url, opts);
    };
    try { localStorage.setItem('cmc_fb_apikey', 'AIzaTEST_FAKE'); } catch(e){}
    const r4 = await new Promise(res => { try { window.cmcFbAnonAuth(function(ok){ res(ok); }); } catch(e){ res('throw:'+e.message); } });
    test('cmcFbAnonAuth avec clé+réponse OK → cb(true)', r4 === true);
    test('token attaché après auth OK', window._fbAuthToken === 'IDTOKEN_OK');
    test('_fbAuthQS() reflète le token obtenu', window._fbAuthQS() === '?auth=IDTOKEN_OK');
    // cleanup
    try { if (window._fbAuthTimer) clearTimeout(window._fbAuthTimer); } catch(e){}
    window.fetch = origFetch;
    window._fbAuthToken = null;
    try { localStorage.removeItem('cmc_fb_apikey'); } catch(e){}

    // t5 — cmcSaveFbApiKey persiste la clé (DOM)
    window.A.user = { id: 'U11804', name: 'Kevin' };
    let inp = document.getElementById('fbApiKeyIn');
    if (!inp) { inp = document.createElement('input'); inp.id = 'fbApiKeyIn'; document.body.appendChild(inp); }
    inp.value = 'AIzaSAVED_FAKE';
    window.fetch = function(){ return Promise.resolve({ ok: false, json: function(){ return Promise.resolve({}); } }); };
    try { window.cmcSaveFbApiKey(); } catch(e){}
    window.fetch = origFetch;
    test('cmcSaveFbApiKey persiste cmc_fb_apikey', localStorage.getItem('cmc_fb_apikey') === 'AIzaSAVED_FAKE');
    try { localStorage.removeItem('cmc_fb_apikey'); window._fbAuthToken = null; if (window._fbAuthTimer) clearTimeout(window._fbAuthTimer); } catch(e){}

    return out;
  });

  await browser.close();
  let pass = 0, fail = 0;
  console.log('\n=== Test runtime v9.788 — plumbing auth Firebase (Phase A) ===\n');
  for (const t of result.tests) {
    if (t.ok) { console.log('  ✓ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + '  [' + t.error + ']'); fail++; }
  }
  console.log('\n========================================');
  console.log((fail === 0 ? '✅' : '❌') + ' v9.788 AUTH PLUMBING — PASS: ' + pass + ' · FAIL: ' + fail);
  console.log('========================================');
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
