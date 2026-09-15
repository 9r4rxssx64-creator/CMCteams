// v9.902 / light v1.43 (Kevin 2026-09-11 « Où l'app n'est pas à jour. light 42 ? Vérifie Maj forcé pour
// tous et tout ») — GARDE EN VRAI NAVIGATEUR : la MISE À JOUR FORCÉE se fait TOUTE SEULE, sans clic,
// pour TOUT LE MONDE (session anonyme, pas admin), sur LES DEUX surfaces, même quand le serveur pose
// des en-têtes de cache (GitHub Pages = max-age=600) et que le Service Worker contrôle la page.
//   CMCteams : 1) SW actif + nouvelle version servie → retour premier plan → rechargement automatique
//                 sur ?_force_upd_ (URL que le SW laisse passer) → APP_VER neuve + cache SW renommé ;
//              2) au démarrage (1,5 s) la nouvelle version est détectée sans aucune action ;
//              3) version identique → AUCUN rechargement (pas de scintillement) ;
//              4) serveur qui sert encore l'ANCIENNE page (cache amont) → au plus 3 essais, jamais
//                 une boucle de rechargement infinie (règle « throttle », l'app ne saute pas).
//   Light    : mêmes 4 contrôles via version.txt (boot 4 s + focus).
//   Statique : sonde en cache:"reload", sondage toutes les 60 s, sw.js CACHE = APP_VER, light
//              badge = APP_VER = version.txt.
//   node tests/verify-maj-forcee-reelle.mjs
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = {
  app: fs.readFileSync(join(ROOT, 'index.html'), 'utf8'),
  sw: fs.readFileSync(join(ROOT, 'sw.js'), 'utf8'),
  light: fs.readFileSync(join(ROOT, 'tools/departs/index.html'), 'utf8'),
  ver: fs.readFileSync(join(ROOT, 'tools/departs/version.txt'), 'utf8').trim(),
};
const APP_VER = (SRC.app.match(/var\s+APP_VER\s*=\s*"(v[0-9.]+)"/) || [])[1];
const LIGHT_VER = (SRC.light.match(/var\s+APP_VER\s*=\s*"(v[0-9.]+)"/) || [])[1];
const SW_CACHE = (SRC.sw.match(/const\s+CACHE\s*=\s*'cmcteams-(v[0-9.]+)'/) || [])[1];

let fails = 0;
const ok = (c, msg, detail) => { console.log((c ? '  ✅ ' : '  ❌ ') + msg + (detail ? ' — ' + detail : '')); if (!c) fails++; };

// ── Serveur : versions MUTABLES (on simule un déploiement) + cache HTTP comme GitHub Pages ────────
const state = { cmcVer: APP_VER, lightVer: LIGHT_VER, cmcStale: null, lightStale: null, hits: [] };
const server = http.createServer((req, res) => {
  const url = req.url || '/';
  const q = url.includes('?') ? url.slice(url.indexOf('?')) : '';
  let p = decodeURIComponent(url.split('?')[0]);
  if (p.startsWith('/CMCteams/')) p = p.slice('/CMCteams'.length);
  if (p === '/') p = '/index.html';
  if (p === '/tools/departs/' || p === '/tools/departs') p = '/tools/departs/index.html';
  state.hits.push({ p, q, t: Date.now() });
  const probe = /[?&]_v=/.test(q);                       // la sonde (bypass cache) voit toujours le NEUF
  const send = (body, type) => { res.writeHead(200, { 'content-type': type, 'cache-control': 'public, max-age=600' }); res.end(body); };
  if (p === '/index.html') {
    const v = (state.cmcStale && !probe) ? state.cmcStale : state.cmcVer;
    return send(SRC.app.replace(/var\s+APP_VER\s*=\s*"v[0-9.]+"/, 'var APP_VER="' + v + '"'), 'text/html; charset=utf-8');
  }
  if (p === '/sw.js') return send(SRC.sw.replace(/const\s+CACHE\s*=\s*'cmcteams-v[0-9.]+'/, "const CACHE='cmcteams-" + state.cmcVer + "'"), 'application/javascript');
  if (p === '/tools/departs/index.html') {
    const v = state.lightStale || state.lightVer;
    return send(SRC.light.replace(/var\s+APP_VER\s*=\s*"v[0-9.]+"/, 'var APP_VER="' + v + '"'), 'text/html; charset=utf-8');
  }
  if (p === '/tools/departs/version.txt') { res.writeHead(200, { 'content-type': 'text/plain', 'cache-control': 'no-cache' }); return res.end(state.lightVer + '\n'); }
  const file = join(ROOT, p.replace(/^\/+/, ''));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('nf'); }
  const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain' };
  res.writeHead(200, { 'content-type': MIME[(file.match(/\.[a-z0-9]+$/i) || [''])[0].toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/CMCteams`;
const APP = BASE + '/index.html', LIGHT = BASE + '/tools/departs/index.html';
// rechargements = navigations du cadre principal observées par le navigateur depuis `since`
// (les requêtes serveur ne suffisent pas : le SW pré-cache './' et '/index.html' à chaque installation)
const reloadsOf = (page, since) => page.navs.filter((n) => n.t >= since).length;

const browser = await chromium.launch({ headless: true });
async function fresh() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/firebasedatabase\.app|identitytoolkit|kd-mc\.com|workers\.dev/, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: route.request().method() === 'GET' ? 'null' : '{}' }));
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(e.message));
  page.errs = errs; page.navs = [];
  page.on('framenavigated', (f) => { if (f === page.mainFrame()) page.navs.push({ u: f.url(), t: Date.now() }); });
  return { ctx, page };
}
const waitUrl = (page, re, ms) => page.waitForURL(re, { timeout: ms }).then(() => true).catch(() => false);

console.log(`Dépôt : CMCteams ${APP_VER} (sw.js ${SW_CACHE}) · light ${LIGHT_VER} (version.txt ${SRC.ver})`);

// ── Statique ──────────────────────────────────────────────────────────────────────────────────────
console.log('\n0. Ce que le code promet');
ok(SW_CACHE === APP_VER, 'sw.js CACHE = APP_VER (même version, sinon le SW sert l\'ancienne app)', `${SW_CACHE} vs ${APP_VER}`);
ok(LIGHT_VER === SRC.ver, 'light : APP_VER = version.txt', `${LIGHT_VER} vs ${SRC.ver}`);
ok((SRC.light.match(/id="ver"[^>]*>(v[0-9.]+)</) || [])[1] === LIGHT_VER, 'light : badge statique = APP_VER (verif-live-rapport le compare)');
const iife = SRC.app.slice(SRC.app.indexOf('function _cmcBootForceUpdateCheck'), SRC.app.indexOf('function _cmcBootForceUpdateCheck') + 4000);
ok(/index\.html\?_v="\+Date\.now\(\)"?[^;]*\n?[^;]*cache:"reload"/.test(iife) || /fetch\(url,\{cache:"reload"\}\)/.test(iife), 'CMCteams : la sonde utilise cache:"reload" (règle MAJ AUTO : no-store seul passe encore par le SW)');
ok(/setInterval\(function\(\)\{[\s\S]{0,400}?\},60000\)/.test(iife), 'CMCteams : sondage toutes les 60 s (règle), pas 90 s');
ok(/\?_force_upd_"\+Date\.now\(\)/.test(iife) || /forceRefresh\(\)/.test(iife), 'CMCteams : rechargement sur ?_force_upd_ (URL que sw.js laisse passer)');
ok(!/A\.user|AID/.test(iife), 'CMCteams : aucune condition admin/utilisateur dans la vérification (= pour tout le monde)');
ok(/cache:"reload"/.test(SRC.light.slice(SRC.light.indexOf('function _chkUpd'), SRC.light.indexOf('function _chkUpd') + 1500)), 'light : sonde version.txt en cache:"reload"');

// ── CMCteams 1 : SW actif, nouvelle version → retour premier plan → MAJ seule ────────────────────
console.log('\n1. CMCteams — Service Worker actif, nouvelle version publiée, l\'app revient au premier plan');
{
  const { ctx, page } = await fresh();
  await page.goto(APP, { waitUntil: 'load', timeout: 60000 });
  // 1re visite : le SW s'installe, prend le contrôle (clients.claim) et l'app se recharge d'elle-même
  // (controllerchange → reload) ; on attend cet état « contrôlé » comme sur l'iPhone de Kevin.
  const ctrl = await page.waitForFunction(() => !!(navigator.serviceWorker && navigator.serviceWorker.controller), null, { timeout: 15000 }).then(() => true).catch(() => false);
  await page.waitForTimeout(2500);
  ok(reloadsOf(page, 0) === 1, '1re ouverture : le SW s\'installe SANS faire sauter l\'app (0 rechargement)', (reloadsOf(page, 0) - 1) + ' rechargement(s)');
  ok(ctrl, 'la page est contrôlée par le Service Worker (comme la PWA sur iPhone)');
  const keys0 = await page.evaluate(() => caches.keys());
  ok(keys0.includes('cmcteams-' + APP_VER), 'cache SW nommé cmcteams-' + APP_VER, keys0.join(','));
  state.cmcVer = 'v9.999';                                            // ← déploiement
  const t0 = Date.now();
  await page.evaluate(() => { localStorage.removeItem('cmc_last_force_update_check'); window.dispatchEvent(new Event('focus')); });
  const v = await page.waitForFunction(() => typeof APP_VER === 'string' && APP_VER === 'v9.999', null, { timeout: 20000 }).then(() => true).catch(() => false);
  ok(v, 'retour premier plan → l\'app se recharge SEULE et tourne en v9.999 (≤ 20 s, 0 clic)', 'chemin : ' + (/_force_upd_/.test(page.url()) ? 'sonde APP_VER → ?_force_upd_' : 'nouveau SW → reload') + ' · ' + page.url().replace(BASE, ''));
  ok(state.hits.some((h) => h.p === '/index.html' && /[?&]_v=/.test(h.q) && h.t >= t0), 'la sonde ?_v= est bien arrivée au SERVEUR (pas servie par le cache du SW)');
  ok(reloadsOf(page, t0) === 1, 'UN seul rechargement pour passer à la nouvelle version (l\'app ne saute pas deux fois)', reloadsOf(page, t0) + ' rechargement(s)');
  await page.evaluate(() => navigator.serviceWorker.ready).catch(() => null);
  await page.waitForTimeout(2500);
  const keys1 = await page.evaluate(() => caches.keys());
  ok(keys1.includes('cmcteams-v9.999') && !keys1.includes('cmcteams-' + APP_VER), 'nouveau SW installé : cache cmcteams-v9.999, ancien cache supprimé', keys1.join(','));
  ok(page.errs.length === 0, '0 erreur JS pendant la mise à jour', page.errs.slice(0, 2).join(' | '));
  await ctx.close();
}

// ── CMCteams 2 : au démarrage, anonyme (pas connecté) ────────────────────────────────────────────
console.log('\n2. CMCteams — ouverture de l\'app (pas connecté) alors qu\'une nouvelle version vient d\'être publiée');
{
  state.cmcVer = APP_VER;
  const { ctx, page } = await fresh();
  await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
  state.cmcVer = 'v9.998';                                            // publiée juste après le chargement
  const v = await page.waitForFunction(() => typeof APP_VER === 'string' && APP_VER === 'v9.998', null, { timeout: 20000 }).then(() => true).catch(() => false);
  ok(v, 'au démarrage (sonde à 1,5 s), sans être connecté → l\'app se recharge seule et tourne en v9.998', 'chemin : ' + (/_force_upd_/.test(page.url()) ? 'sonde APP_VER → ?_force_upd_' : 'nouveau SW → reload'));
  await ctx.close();
}

// ── CMCteams 3 : version identique → aucun rechargement ──────────────────────────────────────────
console.log('\n3. CMCteams — version identique : l\'app ne recharge PAS (pas de scintillement)');
{
  state.cmcVer = APP_VER;
  const { ctx, page } = await fresh();
  await page.goto(APP, { waitUntil: 'load', timeout: 60000 });
  const t0 = Date.now();
  await page.evaluate(() => { localStorage.removeItem('cmc_last_force_update_check'); window.dispatchEvent(new Event('focus')); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForTimeout(5000);
  ok(!/_force_upd_|_forceupd/.test(page.url()) && reloadsOf(page, t0) === 0, 'boot + focus + visibility en 5 s : 0 rechargement', reloadsOf(page, t0) + ' · ' + page.url().replace(BASE, ''));
  await ctx.close();
}

// ── CMCteams 4 : serveur qui sert encore l'ANCIENNE page → pas de boucle infinie ─────────────────
console.log('\n4. CMCteams — la sonde voit v9.997 mais la page servie reste ' + APP_VER + ' (cache amont) : pas de boucle');
{
  state.cmcVer = 'v9.997'; state.cmcStale = APP_VER;
  const { ctx, page } = await fresh();
  const t0 = Date.now();
  await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(20000);
  const n = reloadsOf(page, t0) - 1;
  ok(n >= 1 && n <= 3, 'en 20 s : entre 1 et 3 rechargements, puis l\'app se stabilise (pas une boucle toutes les 2 s)', n + ' rechargement(s)');
  const tries = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('cmc_upd_tries') || 'null'); } catch (e) { return null; } });
  ok(tries && tries.v === 'v9.997' && tries.n >= 3, 'compteur d\'essais posé (cmc_upd_tries), le badge version reste la MAJ manuelle', JSON.stringify(tries));
  state.cmcStale = null; state.cmcVer = APP_VER;
  await ctx.close();
}

// ── Light 1 : focus ───────────────────────────────────────────────────────────────────────────────
console.log('\n5. Light — nouvelle version publiée (version.txt), la page revient au premier plan');
{
  const { ctx, page } = await fresh();
  await page.goto(LIGHT, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1200);
  state.lightVer = 'v1.99';
  await page.evaluate(() => { window._depUpdTs = 0; window.dispatchEvent(new Event('focus')); });
  const nav = await waitUrl(page, /_force_upd_/, 15000);
  ok(nav, 'retour premier plan → rechargement automatique sur ?_force_upd_ (≤ 15 s, 0 clic)', page.url().replace(BASE, ''));
  const v = await page.waitForFunction(() => typeof APP_VER === 'string' && APP_VER === 'v1.99' && document.getElementById('ver') && document.getElementById('ver').textContent === 'v1.99', null, { timeout: 20000 }).then(() => true).catch(() => false);
  ok(v, 'la page tourne en v1.99 et le badge affiche v1.99');
  ok(page.errs.length === 0, '0 erreur JS', page.errs.slice(0, 2).join(' | '));
  await ctx.close();
}

// ── Light 2 : boot ────────────────────────────────────────────────────────────────────────────────
console.log('\n6. Light — ouverture de la page alors qu\'une nouvelle version vient d\'être publiée');
{
  state.lightVer = LIGHT_VER;
  const { ctx, page } = await fresh();
  await page.goto(LIGHT, { waitUntil: 'domcontentloaded', timeout: 60000 });
  state.lightVer = 'v1.98';
  const nav = await waitUrl(page, /_force_upd_/, 12000);
  ok(nav, 'au démarrage (sonde à 4 s) → rechargement automatique');
  const v = await page.waitForFunction(() => typeof APP_VER === 'string' && APP_VER === 'v1.98', null, { timeout: 20000 }).then(() => true).catch(() => false);
  ok(v, 'la page tourne en v1.98');
  await ctx.close();
}

// ── Light 3 : identique ───────────────────────────────────────────────────────────────────────────
console.log('\n7. Light — version identique : 0 rechargement');
{
  state.lightVer = LIGHT_VER;
  const { ctx, page } = await fresh();
  await page.goto(LIGHT, { waitUntil: 'load', timeout: 60000 });
  const t0 = Date.now();
  await page.evaluate(() => { window._depUpdTs = 0; window.dispatchEvent(new Event('focus')); });
  await page.waitForTimeout(6000);
  ok(!/_force_upd_/.test(page.url()) && reloadsOf(page, t0) === 0, 'boot + focus en 6 s : 0 rechargement');
  await ctx.close();
}

// ── Light 4 : version.txt neuf mais page servie ancienne → pas de boucle ─────────────────────────
console.log('\n8. Light — version.txt dit v1.97 mais la page servie reste ' + LIGHT_VER + ' : pas de boucle');
{
  state.lightVer = 'v1.97'; state.lightStale = LIGHT_VER;
  const { ctx, page } = await fresh();
  const t0 = Date.now();
  await page.goto(LIGHT, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(25000);
  const n = reloadsOf(page, t0) - 1;
  ok(n >= 1 && n <= 3, 'en 25 s : entre 1 et 3 rechargements, puis la page se stabilise', n + ' rechargement(s)');
  state.lightStale = null; state.lightVer = LIGHT_VER;
  await ctx.close();
}

await browser.close(); server.close();
console.log(fails ? `\n❌ ${fails} contrôle(s) en échec` : '\n✅ MAJ forcée prouvée en vrai navigateur sur les deux surfaces, pour tout le monde');
process.exit(fails ? 1 : 0);
