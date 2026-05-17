// v9.663 — Test de regression : badge version DOIT etre dynamique
// (jamais hardcode comme v9.661 ou Kevin a vu "v9.615" alors que APP_VER etait v9.660)

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
  await page.waitForFunction(() => typeof window.APP_VER === 'string', { timeout: 15000 });

  const result = await page.evaluate(() => {
    const out = { tests: [] };
    function test(label, fn) {
      try { const ok = fn(); out.tests.push({ label, ok: ok === true, error: ok === true ? null : ('expected true got ' + JSON.stringify(ok)) }); }
      catch (e) { out.tests.push({ label, ok: false, error: e.message }); }
    }

    // Le badge existe
    test('v9.663 : badge #cmc-version-badge present dans DOM', () => {
      return !!document.getElementById('cmc-version-badge');
    });

    // Le badge contient APP_VER (pas hardcode)
    test('v9.663 : badge textContent === APP_VER (dynamique, pas hardcode)', () => {
      const badge = document.getElementById('cmc-version-badge');
      if (!badge) return 'no badge';
      const txt = (badge.textContent || '').trim();
      if (txt === window.APP_VER) return true;
      // Tolerer placeholder "..." si script inline n'a pas encore tourne (rare en headless)
      if (txt === '...' || txt === '…') return 'badge still placeholder (race)';
      return 'badge=' + txt + ' vs APP_VER=' + window.APP_VER;
    });

    // Le badge n'a pas la string hardcoded "v9.615"
    test('v9.663 : badge ne contient PAS "v9.615" hardcode (regression v9.661)', () => {
      const badge = document.getElementById('cmc-version-badge');
      if (!badge) return 'no badge';
      const html = badge.outerHTML || '';
      // Le innerHTML initial doit etre "…" ou "..." (placeholder) ou APP_VER
      // Si on trouve litteralement "v9.615" dans le DOM rendu, c'est la regression
      if (html.includes('>v9.615<')) return 'HARDCODED v9.615 found in DOM';
      return true;
    });

    // L'attribut onclick existe et fait soit showReleaseNotes soit alert
    test('v9.663 : badge cliquable (showReleaseNotes ou alert)', () => {
      const badge = document.getElementById('cmc-version-badge');
      if (!badge) return 'no badge';
      const oc = badge.getAttribute('onclick') || '';
      return oc.includes('showReleaseNotes') || oc.includes('alert');
    });

    // Position bottom-left (regle Kevin "fixed bottom-left")
    test('v9.663 : badge position fixed bottom-left', () => {
      const badge = document.getElementById('cmc-version-badge');
      if (!badge) return 'no badge';
      const style = badge.getAttribute('style') || '';
      return style.includes('position:fixed') && style.includes('left:');
    });

    return out;
  });

  console.log('\n=== Test runtime v9.663 — Badge version DYNAMIQUE (regression v9.661) ===');
  let pass = 0, fail = 0;
  result.tests.forEach(t => {
    if (t.ok) { console.log('  ✓ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + (t.error ? ' — ' + t.error : '')); fail++; }
  });
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ BADGE DYNAMIQUE OK (regression bloquee)' : '❌ REGRESSION badge hardcode');
  console.log(`PASS: ${pass} · FAIL: ${fail}`);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
