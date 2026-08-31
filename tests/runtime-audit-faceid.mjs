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

  // ── v9.838 : RECONNU AUTO — cmc_last_uid + saut direct à Face ID (sans retaper le matricule) ──
  // stubs : appareil compatible + U11804 (admin) enrôlé
  await page.evaluate(() => {
    window.webauthnSupported = () => true;
    window.webauthnCredsOf = (uid) => (uid === 'U11804' ? [{ id: 'fake', uid }] : []);
  });
  // 7) dernier user connu + Face ID enrôlé → vLogin saute à l'écran Face ID (loginStep=1)
  const jump = await page.evaluate(() => {
    localStorage.setItem('cmc_last_uid', 'U11804');
    loginStep = 0; window._cmcFidPrepped = false; loginUid = '';
    const html = vLogin();
    return { step: loginStep, uid: loginUid, hasFaceBtn: /Face\s*ID/.test(html), hasRetour: /Retour|Back|Indietro/.test(html) };
  });
  ok(jump.step === 1, 'dernier user + Face ID enrôlé → saut direct à l\'écran Face ID (loginStep=1)');
  ok(jump.uid === 'U11804', 'loginUid pré-rempli = dernier user (U11804, pas de re-saisie)');
  ok(jump.hasFaceBtn, 'bouton Face ID affiché');
  ok(jump.hasRetour, 'repli « ← Retour » présent (jamais de lockout)');

  // 8) dernier user connu mais PAS enrôlé → reste au formulaire (loginStep=0), pas de saut
  const noJump = await page.evaluate(() => {
    localStorage.setItem('cmc_last_uid', 'U00071'); // employé sans creds
    loginStep = 0; window._cmcFidPrepped = false;
    vLogin();
    return loginStep;
  });
  ok(noJump === 0, 'dernier user SANS Face ID → reste au formulaire (pas de saut)');

  // 9) appareil non compatible → pas de saut (fail-open)
  const noSupport = await page.evaluate(() => {
    window.webauthnSupported = () => false;
    localStorage.setItem('cmc_last_uid', 'U11804');
    loginStep = 0; window._cmcFidPrepped = false;
    vLogin();
    return loginStep;
  });
  ok(noSupport === 0, 'appareil non compatible → pas de saut (fail-open)');

  // 10) cmc_last_uid dans FB_LOCAL (jamais synchronisé Firebase — anti-impersonation, lesson #40)
  ok(await page.evaluate(() => Array.isArray(FB_LOCAL) && FB_LOCAL.indexOf('cmc_last_uid') >= 0), 'cmc_last_uid dans FB_LOCAL (jamais sync Firebase)');

  await browser.close();
  console.log('\nFACE ID (niveau B) : ' + pass + ' OK / ' + fail + ' KO');
  if (fail) process.exit(1);
}
main().catch(e => { console.error(e); process.exit(1); });
