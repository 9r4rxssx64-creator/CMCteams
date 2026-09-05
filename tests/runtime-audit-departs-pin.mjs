// Régression v1.37 — VERROU ADMIN de la page Départs (CMCteams light).
//
// TROUVÉ LE 2026-09-05 : la page embarquait `PIN_SHA256="cbb0…"`, l'empreinte sha256 du code
// admin, et comparait le code SUR PLACE. Le dépôt est PUBLIC et l'empreinte d'un code à 6
// chiffres se casse en une seconde (un million d'essais) → c'était publier le code.
// Depuis v1.37 le code part à POST /__admin/login (routeur kd-mc.com : secret Cloudflare,
// essais limités, journalisés) et la page OBÉIT au verdict. Ce test prouve les trois points :
//   (1) plus AUCUNE empreinte de code dans la page servie ;
//   (2) le code tapé est ENVOYÉ au domaine (jamais comparé dans la page) ;
//   (3) mauvais code → refus ; bon code → admin ; empreinte 64-hex → envoyée telle quelle (hash).
// Servi en HTTP local (pas file://) : la CSP de la page n'autorise que 'self' → c'est aussi le
// vrai chemin (sur departs.kd-mc.com, /__admin/login est relatif = 'self').
//
//   node tests/runtime-audit-departs-pin.mjs
import http from 'node:http';
import fs from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ADMIN_CODE = process.env.KDMC_ADMIN_CODE || '200807'; // code de TEST côté « faux routeur » (jamais le vrai)
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain' };

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const server = http.createServer((req, res) => {
  const p = decodeURIComponent((req.url || '/').split('?')[0]);
  const file = join(ROOT, p.replace(/^\/+/, ''));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('nf'); }
  const ext = (file.match(/\.[a-z0-9]+$/i) || [''])[0].toLowerCase();
  res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
try {
  const ctx = await browser.newContext();
  // Gate identité + CGU déjà passée (on teste le verrou admin, pas la 1ʳᵉ connexion).
  await ctx.addInitScript(() => {
    if (!localStorage.getItem('cmc_dep_identity'))
      localStorage.setItem('cmc_dep_identity', JSON.stringify({ nom: 'TEST', prenom: 'Kevin', cgu: true }));
  });
  // Le domaine ne reconnaît PAS Kevin par Face ID ici → pas d'admin automatique par SSO.
  await ctx.route(/\/__sso\/whoami/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":false}' }));
  // Firebase et identitytoolkit muets (aucune écriture réelle).
  await ctx.route(/identitytoolkit\.googleapis\.com/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"T","expiresIn":"3600","localId":"anon"}' }));
  await ctx.route(/firebasedatabase\.app/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: 'null' }));
  // Le FAUX routeur : il rend le verdict, comme le vrai /__admin/login (code OU hash).
  const logins = [];
  await ctx.route(/\/__admin\/login$/, (r) => {
    let b = {}; try { b = JSON.parse(r.request().postData() || '{}'); } catch { /* vide */ }
    logins.push(b);
    const good = String(b.code || '') === ADMIN_CODE || /^[0-9a-f]{64}$/.test(String(b.hash || ''));
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(good ? { ok: true, grant: 'G' } : { ok: false, reason: 'code_invalide' }) });
  });

  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
  await page.goto(BASE + '/tools/departs/index.html', { waitUntil: 'load' });
  await page.waitForTimeout(400);

  /* (1) plus d'empreinte dans la page */
  const src = await page.content();
  ok(!/PIN[A-Za-z0-9_]*SHA[A-Za-z0-9_]*\s*=\s*["'][0-9a-f]{64}["']/i.test(src), 'aucune empreinte de code embarquée dans la page servie');
  ok(!/\bsha256\s*\(/.test(await page.evaluate(() => String(window.checkPin))), 'checkPin ne hache ni ne compare rien sur place');
  ok(await page.evaluate(() => !document.body.classList.contains('admin')), 'au chargement : lecture seule (le SSO n\'a pas reconnu Kevin)');

  /* (2)+(3) mauvais code → envoyé, refusé */
  await page.click('#lockBtn');
  await page.waitForSelector('#pinModal.on'); await page.waitForTimeout(150); // la page vide le champ 60 ms après l'ouverture
  await page.fill('#pinIn', '000000');
  await page.click('#pinModal .btn.prim');
  await page.waitForFunction(() => /incorrect/i.test(document.getElementById('toast').textContent || ''), { timeout: 5000 });
  ok(logins.length === 1 && logins[0].code === '000000' && !('hash' in logins[0]), 'le code tapé est ENVOYÉ à /__admin/login (jamais comparé dans la page)');
  ok(await page.evaluate(() => !document.body.classList.contains('admin')), 'mauvais code → toujours en lecture seule');

  /* bon code → admin */
  await page.fill('#pinIn', ADMIN_CODE);
  await page.click('#pinModal .btn.prim');
  await page.waitForFunction(() => document.body.classList.contains('admin'), { timeout: 5000 });
  ok(logins.length === 2, 'deuxième essai envoyé au domaine');
  ok(await page.evaluate(() => document.getElementById('lockBtn').textContent.indexOf('Quitter') >= 0), 'bon code (verdict serveur ok) → mode admin');

  /* empreinte 64-hex → envoyée comme hash (même règle que Finances, leçon #95) */
  await page.click('#lockBtn'); // quitte admin
  await page.waitForFunction(() => !document.body.classList.contains('admin'));
  await page.click('#lockBtn');
  await page.waitForSelector('#pinModal.on'); await page.waitForTimeout(150); // la page vide le champ 60 ms après l'ouverture
  await page.fill('#pinIn', 'A'.repeat(64).toLowerCase().replace(/a/g, 'f'));
  await page.click('#pinModal .btn.prim');
  await page.waitForFunction(() => document.body.classList.contains('admin'), { timeout: 5000 });
  ok(logins.length === 3 && typeof logins[2].hash === 'string' && logins[2].hash.length === 64 && !('code' in logins[2]), 'une empreinte 64-hex part dans le champ hash, pas code');

  ok(errs.length === 0, 'aucune erreur page (' + errs.join(' | ').slice(0, 120) + ')');
} finally {
  await browser.close();
  server.close();
}
console.log(`\nDÉPARTS-PIN (verrou vérifié par le domaine) : ${pass} OK / ${fail} KO`);
process.exit(fail ? 1 : 0);
