// Régression v1.20 — GATE 1ère connexion CMCteams light (Kevin 2026-07-01 « J'ai partagé la
// PWA CMCteams light. Les personnes se connectent sans rien valider. Rien n'est demandé.
// Cgu, fiche, rien »). Prouve : (1) 1ʳᵉ ouverture SANS identité → overlay bloquant affiché ;
// (2) refus si nom/prénom manquants ou CGU non cochée ; (3) validation → identité + CGU
// stockées + accès (overlay caché) + fiche loggée Firebase ; (4) retour = reconnu auto
// (pas de gate). Mock Firebase pour capturer le log d'accès.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pageUrl = 'file://' + resolve(root, 'tools/departs/index.html');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const browser = await chromium.launch({ headless: true });
try {
  const ctx = await browser.newContext();
  await ctx.route(/identitytoolkit\.googleapis\.com\/.*signUp.*/, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ idToken: 'TESTTOK', expiresIn: '3600', localId: 'anon' }) }));
  const accessPuts = [];
  await ctx.route(/cmcteams-c16ab-default-rtdb\.europe-west1\.firebasedatabase\.app\/cmcteams\/.*\.json.*/, route => {
    const req = route.request(), url = req.url();
    const m = url.match(/\/cmc_dep_access\/([^.?]+)\.json/);
    if (req.method() === 'PUT' && m) { let b = null; try { b = JSON.parse(req.postData() || 'null'); } catch (_) {} accessPuts.push({ key: decodeURIComponent(m[1]), body: b }); return route.fulfill({ status: 200, contentType: 'application/json', body: req.postData() || 'null' }); }
    route.fulfill({ status: 200, contentType: 'application/json', body: 'null' });
  });

  const page = await ctx.newPage();
  const perr = [];
  page.on('pageerror', e => perr.push(e.message));
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window._depSubmitGate === 'function' && document.getElementById('depGate'), { timeout: 15000 });

  const gateVisible = () => page.evaluate(() => { const g = document.getElementById('depGate'); return !!g && getComputedStyle(g).display !== 'none'; });

  ok(await gateVisible(), '1ʳᵉ ouverture : overlay de connexion AFFICHÉ (rien n\'est visible sans valider)');

  // refus : champs vides
  await page.evaluate(() => _depSubmitGate());
  ok(await gateVisible(), 'refus si prénom/nom vides (overlay reste)');
  const err1 = await page.evaluate(() => (document.getElementById('gateErr') || {}).textContent || '');
  ok(/prénom.*nom|nom/i.test(err1), 'message d\'erreur prénom+nom exigés');

  // refus : nom+prénom OK mais CGU non cochée
  await page.evaluate(() => { document.getElementById('gatePrenom').value = 'Kevin'; document.getElementById('gateNom').value = 'DESARZENS'; _depSubmitGate(); });
  ok(await gateVisible(), 'refus si CGU non cochée (overlay reste)');
  const err2 = await page.evaluate(() => (document.getElementById('gateErr') || {}).textContent || '');
  ok(/condition|coche|cgu/i.test(err2), 'message d\'erreur CGU à cocher');

  // validation complète
  await page.evaluate(() => { document.getElementById('gateCgu').checked = true; _depSubmitGate(); });
  await page.waitForTimeout(300);
  ok(!(await gateVisible()), 'après validation (nom+prénom+CGU) : overlay CACHÉ → accès aux départs');
  const stored = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('cmc_dep_identity') || 'null'); } catch (_) { return null; } });
  ok(!!(stored && stored.cgu === true && stored.nom === 'DESARZENS' && stored.prenom === 'Kevin'), 'identité + CGU stockées localement');
  ok(accessPuts.length >= 1 && accessPuts[0].body && accessPuts[0].body.nom === 'DESARZENS', 'fiche d\'accès loggée dans Firebase (admin voit qui consulte)');

  // retour (nouvelle page, même localStorage) → reconnu auto, pas de gate
  const page2 = await ctx.newPage();
  await page2.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page2.waitForFunction(() => typeof window._depHasIdentity === 'function', { timeout: 15000 });
  await page2.waitForTimeout(300);
  const gate2 = await page2.evaluate(() => { const g = document.getElementById('depGate'); return !!g && getComputedStyle(g).display !== 'none'; });
  ok(!gate2, 'retour sur la page : reconnu auto (aucun gate redemandé)');

  ok(perr.length === 0, 'aucune erreur page (' + perr.join(' | ') + ')');
  await ctx.close();
} finally { await browser.close(); }

console.log('\nDÉPARTS-GATE (1ère connexion CGU + fiche) : ' + pass + ' OK / ' + fail + ' KO');
process.exit(fail ? 1 : 0);
