#!/usr/bin/env node
/* Vérification RÉELLE (vrai navigateur Chromium) — l'arbre v3.16 sans données dans le fichier public.
   Un petit serveur local sert arbre/ ET simule le domaine (/__arbre/*, /__admin/login) avec une
   famille SYNTHÉTIQUE (tools/arbre/fixture-famille.mjs) — 0 donnée réelle, 0 appel extérieur.
   Scénarios :
     1. nouvel appareil : mauvais code → « Code incorrect » ; bon code → le domaine renvoie l'arbre → l'app entre
        et affiche toutes les personnes ; l'appareil mémorise l'empreinte et le trust ;
     2. réouverture : entre directement (reconnu auto), sans redemander le domaine ;
     3. Outils : état « publié » lu sur le domaine ; « Publier » demande le code admin, le prouve au domaine
        (/__admin/login), puis envoie l'arbre (PUT /__arbre/seed) — le code n'est jamais mémorisé ;
     4. domaine MUET (autre hébergement / hors ligne) : un appareil qui connaît déjà l'empreinte entre avec le
        bon code (repli local), et refuse le mauvais ;
     5. domaine sans arbre publié + appareil vierge : message clair, on reste à la porte ;
     6. changement de code : prouvé au domaine (ancien → nouveau), mémorisé localement ;
     7. le fichier servi ne contient ni personne, ni empreinte ; 0 erreur JS sur tout le parcours.
   Usage : node tools/arbre/verify-domaine.mjs      (sortie 1 si une vérification échoue) */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fixture } from './fixture-famille.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ARBRE = path.join(ROOT, 'arbre');
const sha = (s) => createHash('sha256').update(s).digest('hex');
const CODE = 'famille-test', ADMIN = '424242';
const FX = fixture();
const N = Object.keys(FX.persons).length;

/* ---- domaine simulé ---- */
const mock = { mode: 'ok', codehash: sha('arbre::' + CODE), seed: FX, hits: { unlock: 0, status: 0, login: 0, put: 0, code: 0 }, lastPut: null, lastCode: null };
function readBody(req) { return new Promise((res) => { let b = ''; req.on('data', (c) => { b += c; }); req.on('end', () => { try { res(JSON.parse(b || '{}')); } catch { res({}); } }); }); }
function J(rsp, o, status) { rsp.writeHead(status || 200, { 'content-type': 'application/json', 'cache-control': 'no-store' }); rsp.end(JSON.stringify(o)); }
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png' };
function serve() {
  return new Promise((res) => {
    const srv = http.createServer(async (req, rsp) => {
      const u = new URL(req.url, 'http://x');
      if (u.pathname.startsWith('/__arbre/') || u.pathname === '/__admin/login') {
        if (mock.mode === 'down') { rsp.writeHead(404, { 'content-type': 'text/html' }); rsp.end('<h1>404</h1>'); return; }
        const b = req.method === 'GET' ? {} : await readBody(req);
        if (u.pathname === '/__arbre/status') { mock.hits.status++; return J(rsp, { ok: true, code: mock.mode !== 'unpublished', seed: mock.mode !== 'unpublished', count: N, savedAt: Date.now() - 60000 }); }
        if (u.pathname === '/__arbre/unlock') {
          mock.hits.unlock++;
          if (mock.mode === 'unpublished') return J(rsp, { ok: false, reason: 'code_non_publie' });
          if (String(b.hash || '').toLowerCase() !== mock.codehash) return J(rsp, { ok: false, reason: 'code_invalide' });
          return J(rsp, { ok: true, seed: mock.seed, savedAt: Date.now() });
        }
        if (u.pathname === '/__admin/login') { mock.hits.login++; return J(rsp, b.code === ADMIN ? { ok: true, grant: 'grant.test' } : { ok: false, reason: 'code_invalide' }); }
        if (u.pathname === '/__arbre/seed' && req.method === 'PUT') {
          mock.hits.put++;
          if (req.headers['x-kdmc-admin'] !== 'grant.test') return J(rsp, { ok: false, reason: 'need_admin_code' }, 403);
          mock.lastPut = b; return J(rsp, { ok: true, count: Object.keys(b.persons || {}).length, savedAt: Date.now() });
        }
        if (u.pathname === '/__arbre/code') {
          mock.hits.code++;
          if (String(b.old || '') !== mock.codehash) return J(rsp, { ok: false, reason: 'code_invalide' });
          mock.lastCode = b; mock.codehash = String(b.new); return J(rsp, { ok: true });
        }
        return J(rsp, { ok: false, reason: 'not_found' }, 404);
      }
      let f = decodeURIComponent(u.pathname); if (f === '/' || f === '') f = '/index.html';
      const fp = path.join(ARBRE, f);
      if (!fp.startsWith(ARBRE) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { rsp.writeHead(404); rsp.end(); return; }
      rsp.writeHead(200, { 'content-type': MIME[path.extname(fp)] || 'application/octet-stream' });
      fs.createReadStream(fp).pipe(rsp);
    });
    srv.listen(0, '127.0.0.1', () => res(srv));
  });
}
async function loadPlaywright() {
  for (const name of ['playwright', 'playwright-core']) { try { return await import(name); } catch (e) { /* suivant */ } }
  if (process.env.PW_MODULE_DIR) return import(pathToFileURL(path.join(process.env.PW_MODULE_DIR, 'node_modules', 'playwright-core', 'index.mjs')).href);
  throw new Error('playwright introuvable : npm i playwright-core, ou PW_MODULE_DIR=<dossier qui contient node_modules>');
}
function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  try { const dirs = fs.readdirSync(base).filter((d) => /^chromium-\d+$/.test(d)).sort(); for (const d of dirs.reverse()) { const c = path.join(base, d, 'chrome-linux', 'chrome'); if (fs.existsSync(c)) return c; } } catch (e) { /* */ }
  return undefined;
}

const fails = [];
function check(ok, label, detail) { console.log((ok ? '  ✅ ' : '  ❌ ') + label + (detail ? ' — ' + detail : '')); if (!ok) fails.push(label); }
const srv = await serve();
const base = `http://127.0.0.1:${srv.address().port}`;
const pw = await loadPlaywright();
const browser = await pw.chromium.launch({ headless: true, executablePath: chromePath() });
const errors = [];
async function newPage(init) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'fr-FR' });
  /* sw.js bloqué : sans service worker, aucune rechargement « controllerchange » ne coupe une vérification */
  await ctx.route('**/*', (route) => (route.request().url().startsWith(base) && !/\/sw\.js(\?|$)/.test(route.request().url()) ? route.continue() : route.abort()));
  if (init) await ctx.addInitScript(init.fn, init.arg);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  await page.goto(base + '/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.APP_VER === 'string' && document.querySelector('#gate'), null, { timeout: 20000 });
  return { ctx, page };
}
const gateVisible = (page) => page.evaluate(() => !document.querySelector('#gate').classList.contains('hidden'));
const appVisible = (page) => page.evaluate(() => !document.querySelector('#app').classList.contains('hidden'));
async function typeCode(page, code) { await page.fill('#gateCode', code); await page.click('#gateBtn'); }
async function waitToast(page, frag) { await page.waitForFunction((f) => { const t = document.querySelector('#toast'); return t && t.classList.contains('on') && t.textContent.includes(f); }, frag, { timeout: 8000 }); return page.evaluate(() => document.querySelector('#toast').textContent); }
async function waitApp(page) { await page.waitForFunction(() => !document.querySelector('#app').classList.contains('hidden') && document.querySelectorAll('#stage .tnode, #stage .tmed').length > 0, null, { timeout: 20000 }); }

try {
  console.log(`\n🌳 Arbre — vérification « données hors du fichier public » — ${base} — famille synthétique de ${N} personnes`);

  /* 7a. le fichier servi ne contient rien de personnel */
  const html = fs.readFileSync(path.join(ARBRE, 'index.html'), 'utf8');
  check(!/DEFAULT_CODEHASH|function buildSeed|SEED_VERSION/.test(html), 'index.html : 0 empreinte, 0 seed');
  check(!/id:"seed_[a-z0-9_]+",\s*prenom:/.test(html) && !/naissance:\{date:"/.test(html), 'index.html : aucune personne écrite en dur');

  /* 1. nouvel appareil */
  let { ctx, page } = await newPage(null);
  check(await gateVisible(page) && !(await appVisible(page)), '1. appareil vierge : la porte est affichée');
  await typeCode(page, 'mauvais-code');
  check((await waitToast(page, 'Code incorrect')).includes('Code incorrect') && (await gateVisible(page)), '1. mauvais code → « Code incorrect », on reste à la porte');
  await typeCode(page, CODE);
  await waitApp(page);
  const st1 = await page.evaluate(() => ({ n: Object.keys(DB.persons).length, ch: localStorage.getItem('arbre_codehash'), trust: localStorage.getItem('arbre_trust'), cards: document.querySelectorAll('#stage .tnode, #stage .tmed').length }));
  check(st1.n === N, `1. bon code → l'arbre arrive du domaine : ${st1.n}/${N} personnes`);
  check(st1.ch === mock.codehash && st1.trust === '1', '1. empreinte + trust mémorisés sur l\'appareil (reconnu auto ensuite)');
  check(st1.cards > 0, `1. l'arbre est dessiné (${st1.cards} cartes)`);
  check(mock.hits.unlock === 2, `1. le domaine a été interrogé 2 fois (1 refus + 1 ok) : ${mock.hits.unlock}`);

  /* 2. réouverture = reconnu auto, sans le domaine */
  const before = mock.hits.unlock;
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitApp(page);
  const st2 = await page.evaluate(() => Object.keys(DB.persons).length);
  check(st2 === N && mock.hits.unlock === before, `2. réouverture : entre direct avec ${st2} personnes, 0 appel unlock`);

  /* 3. Outils : état + publication admin */
  await page.click('#tabs .tab[data-view="tools"]');
  await page.waitForFunction(() => { const e = document.querySelector('#domStatus'); return e && /pers\./.test(e.textContent); }, null, { timeout: 8000 });
  const dom = await page.evaluate(() => document.querySelector('#domStatus').textContent);
  check(/🟢/.test(dom) && dom.includes(String(N)), `3. Outils lit l'état du domaine : « ${dom} »`);
  page.once('dialog', (d) => d.accept('000000'));
  await page.click('#btnPublish');
  check((await waitToast(page, 'refusé')).includes('Code admin refusé') && mock.hits.put === 0, '3. mauvais code admin → refusé par le domaine, rien envoyé');
  page.once('dialog', (d) => d.accept(ADMIN));
  await page.click('#btnPublish');
  const tp = await waitToast(page, 'publié');
  check(tp.includes(String(N)) && mock.lastPut && Object.keys(mock.lastPut.persons).length === N && mock.lastPut.codehash === mock.codehash, `3. bon code admin → PUT /__arbre/seed reçu : ${mock.lastPut && Object.keys(mock.lastPut.persons).length} personnes + empreinte`);
  const keys = Object.keys(mock.lastPut.persons[Object.keys(mock.lastPut.persons)[0]]);
  check(!keys.includes('photos') && !keys.includes('docs'), '3. publication = texte seulement (ni photos ni documents)');
  check(await page.evaluate(() => !Object.keys(localStorage).some((k) => /admin|pin|code_admin/i.test(k))), '3. le code admin n\'est mémorisé nulle part');

  /* 6. changement de code : prouvé au domaine */
  const oldHash = mock.codehash; const NEW = 'nouveau-code-test';
  page.on('dialog', (d) => d.accept(NEW));
  await page.evaluate(() => changeCode());
  await waitToast(page, 'Code changé');
  const st6 = await page.evaluate(() => localStorage.getItem('arbre_codehash'));
  check(mock.lastCode && mock.lastCode.old === oldHash && mock.lastCode.new === sha('arbre::' + NEW) && st6 === sha('arbre::' + NEW), '6. changement de code : ancien prouvé, nouveau enregistré (domaine + appareil)');
  await ctx.close();

  /* 4. domaine muet : repli local pour un appareil qui a déjà l'arbre + l'empreinte */
  mock.mode = 'down';
  ({ ctx, page } = await newPage({ fn: (a) => { localStorage.setItem('arbre_codehash', a.h); localStorage.setItem('arbre_v2_text', a.db); }, arg: { h: sha('arbre::' + CODE), db: JSON.stringify(FX) } }));
  check(await gateVisible(page), '4. domaine muet, appareil connu mais déverrouillé (🔒) : la porte s\'affiche');
  await typeCode(page, 'mauvais-code');
  check((await waitToast(page, 'Hors ligne')).includes('Hors ligne'), '4. mauvais code + domaine muet → « Hors ligne : impossible de vérifier »');
  await typeCode(page, CODE);
  await waitApp(page);
  check((await page.evaluate(() => Object.keys(DB.persons).length)) === N, `4. bon code + domaine muet → repli local, l'arbre s'ouvre (${N} personnes)`);
  await ctx.close();

  /* 5. domaine sans arbre publié, appareil vierge */
  mock.mode = 'unpublished';
  ({ ctx, page } = await newPage(null));
  await typeCode(page, CODE);
  check((await waitToast(page, 'pas encore publié')).includes('pas encore publié') && (await gateVisible(page)), '5. rien de publié + appareil vierge → message clair, on reste à la porte');
  await ctx.close();

  check(errors.length === 0, '7. 0 erreur JavaScript sur tout le parcours', errors.length ? errors.slice(0, 3).join(' | ') : '');
} finally {
  await browser.close();
  srv.close();
}
console.log(fails.length ? `\n❌ verify-domaine : ${fails.length} échec(s)` : `\n✅ verify-domaine : tout est vert (${N} personnes synthétiques, 0 donnée réelle)`);
process.exit(fails.length ? 1 : 0);
