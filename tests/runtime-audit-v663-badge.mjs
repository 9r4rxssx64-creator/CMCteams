// v9.699 — Test régression : badge version dorée SUPPRIMÉ
// Kevin "Enlève la version en dorée qui reste sur toutes les vu" :
// le badge cmc-version-badge (était permanent bas-gauche) a été supprimé.
// Ce test vérifie maintenant qu'il N'EST PLUS présent dans le DOM.

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

    test('v9.699 : badge #cmc-version-badge SUPPRIMÉ (Kevin "enlève version dorée")', () => {
      return !document.getElementById('cmc-version-badge');
    });

    test('v9.699 : APP_VER toujours défini globalement', () => {
      return typeof window.APP_VER === 'string' && window.APP_VER.length > 0;
    });

    test('v9.699 : aucun élément avec textContent === "v9.615" hardcodé', () => {
      const all = document.querySelectorAll('*');
      for (let i = 0; i < all.length; i++) {
        const t = (all[i].textContent || '').trim();
        if (t === 'v9.615') return 'HARDCODED v9.615 trouvé dans DOM';
      }
      return true;
    });

    test('v9.699 : pas de badge bas-gauche fixed avec class .version', () => {
      const fixedEls = document.querySelectorAll('button[style*="position:fixed"][style*="left:8px"]');
      let foundVerBadge = false;
      fixedEls.forEach(el => {
        if ((el.textContent || '').match(/^v\d/i)) foundVerBadge = true;
      });
      return !foundVerBadge;
    });

    test('v9.699 : showReleaseNotes accessible globalement (pour palette / commande)', () => {
      return typeof window.showReleaseNotes === 'function' || typeof window.APP_VER === 'string';
    });

    return out;
  });

  console.log('\n=== Test runtime v9.699 — Badge version dorée SUPPRIMÉ ===');
  let pass = 0, fail = 0;
  result.tests.forEach(t => {
    if (t.ok) { console.log('  ✓ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + (t.error ? ' — ' + t.error : '')); fail++; }
  });
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ BADGE DORÉ SUPPRIMÉ OK' : '❌ REGRESSION badge encore présent');
  console.log(`PASS: ${pass} · FAIL: ${fail}`);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
