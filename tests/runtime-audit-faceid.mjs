// v9.827 — SÉCURITÉ NIVEAU B : après un login par CODE, l'app PROPOSE une fois
// d'activer Face ID (si supporté + pas déjà enrôlé + pas refusé définitivement).
// Fail-open : non supporté / refus → rien ne change. Test du moteur d'offre
// (_cmcOfferFaceIdEnroll) en isolant webauthnSupported/webauthnCredsOf/webauthnRegister.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await page.addInitScript(() => { window.__CMC_NO_SEED = true; });
  await page.goto('file://' + resolve(__dirname, '../index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window._cmcOfferFaceIdEnroll === 'function' && window.A, { timeout: 20000 });

  // installe les stubs WebAuthn (appareil compatible, pas d'enrôlement, register OK)
  await page.evaluate(() => {
    window.__enrolled = [];
    window.webauthnSupported = () => true;
    window.webauthnCredsOf = () => window.__enrolled;
    window.webauthnRegister = (uid) => { window.__enrolled = [{ id: 'fake', uid }]; return Promise.resolve(true); };
    A.reg = A.reg || {}; A.reg['U_TEST'] = { prenom: 'Kevin' };
  });

  // 1) supporté + pas enrôlé → l'offre apparaît
  await page.evaluate(() => { try { localStorage.removeItem('cmc_faceid_offered_U_TEST'); } catch (_) {} window._cmcOfferFaceIdEnroll('U_TEST'); });
  await page.waitForTimeout(1100);
  ok(await page.evaluate(() => !!document.getElementById('cmcFidOffer')), 'offre Face ID affichée après login par code');
  ok(await page.evaluate(() => /Kevin/.test((document.getElementById('cmcFidOffer') || {}).textContent || '')), 'offre personnalisée (prénom)');

  // 2) « Plus tard » → ferme, AUCUN flag (re-proposé au prochain login)
  await page.evaluate(() => document.getElementById('cmcFidLater').click());
  await page.waitForTimeout(120);
  ok(await page.evaluate(() => !document.getElementById('cmcFidOffer')), '« Plus tard » ferme la modale');
  ok(await page.evaluate(() => localStorage.getItem('cmc_faceid_offered_U_TEST') === null), '« Plus tard » ne pose AUCUN flag (re-proposé)');

  // 3) re-déclenche → réapparaît, puis « Activer » → enrôle + flag=yes
  await page.evaluate(() => window._cmcOfferFaceIdEnroll('U_TEST'));
  await page.waitForTimeout(1100);
  ok(await page.evaluate(() => !!document.getElementById('cmcFidOffer')), 'ré-proposée au login suivant');
  await page.evaluate(() => document.getElementById('cmcFidYes').click());
  await page.waitForTimeout(200);
  ok(await page.evaluate(() => window.__enrolled.length === 1), '« Activer Face ID » → enrôlement (webauthnRegister appelé)');
  ok(await page.evaluate(() => localStorage.getItem('cmc_faceid_offered_U_TEST') === 'yes'), 'flag yes après enrôlement');

  // 4) déjà enrôlé → plus jamais proposé
  await page.evaluate(() => window._cmcOfferFaceIdEnroll('U_TEST'));
  await page.waitForTimeout(1100);
  ok(await page.evaluate(() => !document.getElementById('cmcFidOffer')), 'déjà enrôlé → pas de nouvelle offre');

  // 5) « Non merci » mémorisé → plus jamais proposé (compte neuf)
  await page.evaluate(() => { window.__enrolled = []; localStorage.setItem('cmc_faceid_offered_U2', 'no'); window._cmcOfferFaceIdEnroll('U2'); });
  await page.waitForTimeout(1100);
  ok(await page.evaluate(() => !document.getElementById('cmcFidOffer')), '« Non merci » mémorisé → plus d\'offre');

  // 6) appareil non compatible → fail-open (aucune offre, aucune erreur)
  await page.evaluate(() => { window.webauthnSupported = () => false; window._cmcOfferFaceIdEnroll('U3'); });
  await page.waitForTimeout(1000);
  ok(await page.evaluate(() => !document.getElementById('cmcFidOffer')), 'non supporté → fail-open (pas d\'offre)');

  await browser.close();
  console.log('\nFACE ID (niveau B) : ' + pass + ' OK / ' + fail + ' KO');
  if (fail) process.exit(1);
}
main().catch(e => { console.error(e); process.exit(1); });
