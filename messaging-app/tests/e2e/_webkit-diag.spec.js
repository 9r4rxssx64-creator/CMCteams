// DIAGNOSTIC TEMPORAIRE (à supprimer après analyse) — pourquoi les modules ESM
// ne s'exécutent pas sous WebKit en CI. Capture : requêtes échouées, statut des
// scripts, erreurs console/page, et typeof des globals exposés par modules.
// Hypothèse : `upgrade-insecure-requests` (CSP) fait passer les sous-ressources
// http://localhost → https:// sous WebKit (pas d'exception localhost comme
// Chromium) → les <script type="module"> échouent. On lève une erreur avec le
// JSON pour le lire dans le log CI (sur chromium ET webkit, pour comparer).

import { test } from '@playwright/test';

test('DIAG boot modules ESM (surface le diagnostic dans le log CI)', async ({ page, browserName }) => {
  const failed = [];
  const jsResponses = [];
  const consoleErrors = [];
  const pageErrors = [];

  page.on('requestfailed', (r) => {
    const u = r.url();
    if (/localhost:4173/.test(u)) failed.push({ url: u, failure: r.failure()?.errorText || '?' });
  });
  page.on('response', (r) => {
    const u = r.url();
    if (/\/(lib|crypto)\S*\.js/.test(u) || /crypto\.js/.test(u)) {
      jsResponses.push({ url: u.replace(/^https?:\/\/localhost:4173/, ''), status: r.status(), ct: r.headers()['content-type'] || '' });
    }
  });
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => pageErrors.push(String(e.message || e).slice(0, 200)));

  await page.goto('./', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(3000);

  const globals = await page.evaluate(() => ({
    K: typeof window.K,
    ApexCrypto: typeof window.ApexCrypto,
    ApexSearch: typeof window.ApexSearch,
    ApexGallery: typeof window.ApexGallery,
    ApexPrivacy: typeof window.ApexPrivacy,
    ApexGif: typeof window.ApexGif,
    readyState: document.readyState,
    loc: location.href,
  }));

  const diag = { browserName, globals, jsResponses, failed, consoleErrors, pageErrors };
  // Toujours lever → visible dans get_job_logs (chromium = tout chargé, webkit = échec).
  throw new Error('WEBKIT_DIAG ' + JSON.stringify(diag));
});
