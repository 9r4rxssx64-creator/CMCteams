/* PREUVE app == light, cellule par cellule, sur TOUS les boards (Kevin « aucune
 * erreur des 2 côtés n'est toléré »). Charge la VRAIE page light (tools/departs)
 * et la VRAIE app (index.html, connecté Kevin admin), et compare pour CHAQUE
 * board / CHAQUE chef / CHAQUE jour : le NUMÉRO DE DÉPART calculé par compute()
 * (light) vs calcDepPos() (app). Vérifie aussi le libellé du miroir de Kevin.
 * Firebase/domaine bloqués → les 2 tombent sur les boards committés = même source.
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..'); // repo root
const MONTHS = [{ y: 2026, m: 6, pre: '2026-07-' }, { y: 2026, m: 7, pre: '2026-08-' }];
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
// Serveur statique : /CMCteams/<x> et /<x> → <repo>/<x> (les scripts sont en chemin ABSOLU /CMCteams/… lesson #102)
const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p.startsWith('/CMCteams/')) p = p.slice('/CMCteams'.length);
  const file = join(ROOT, p.replace(/^\/+/, ''));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('nf'); }
  const ext = (file.match(/\.[a-z0-9]+$/i) || [''])[0].toLowerCase();
  res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = process.env.BASE_URL || `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1200, height: 1600 } });
await ctx.route('**/*', route => {
  const u = route.request().url();
  if (/firebasedatabase\.app|identitytoolkit|securetoken|googleapis|kd-mc\.com|workers\.dev|__notify-kevin/.test(u)) return route.abort();
  return route.continue();
});

// ── 1) LIGHT : numéros par board via compute() ──
const lp = await ctx.newPage();
const lerr = []; lp.on('pageerror', e => lerr.push(String(e.message || e).slice(0, 120)));
await lp.goto(`${BASE}/CMCteams/tools/departs/index.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await lp.waitForTimeout(1500);
const light = await lp.evaluate(() => {
  const out = { boards: {}, mirror: {}, labels: {} };
  const ids = Object.keys(BOARDS).filter(id => BOARDS[id] && BOARDS[id].people && BOARDS[id].people.length && BOARDS[id].kind !== 'abs');
  ids.forEach(id => {
    try {
      switchBoard(id);
      const R = compute();
      const cells = {};
      Object.keys(R.deps).forEach(nm => { Object.keys(R.deps[nm]).forEach(d => { cells[nm + '@' + d] = R.deps[nm][d]; }); });
      out.boards[id] = cells;
      out.labels[id] = BOARDS[id].label;
      if (typeof DEP_MIRROR !== 'undefined' && DEP_MIRROR[id]) out.mirror[id] = DEP_MIRROR[id];
    } catch (e) { out.boards[id] = { __err: String(e.message).slice(0, 80) }; }
  });
  return out;
});

// ── 2) APP : numéros par board via calcDepPos() (connecté Kevin) ──
const ap = await ctx.newPage();
const aerr = []; ap.on('pageerror', e => aerr.push(String(e.message || e).slice(0, 120)));
await ap.addInitScript(() => { try { localStorage.setItem('cmc_uid', 'U11804'); localStorage.setItem('cmc_last_uid', 'U11804'); localStorage.setItem('cmc_lastact', String(Date.now())); localStorage.setItem('cmc_seen_v10_678', '1'); } catch (e) {} });
await ap.goto(`${BASE}/CMCteams/index.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await ap.waitForTimeout(2500);
for (const lbl of ['Plus tard', 'Compris', 'Fermer', '×']) { try { const b = ap.locator(`button:has-text("${lbl}")`).first(); if (await b.count()) await b.click({ timeout: 800 }); } catch (_) {} }

const appVer = await ap.evaluate(() => (typeof APP_VER !== 'undefined' ? APP_VER : '?'));
const appData = {};
const appMirror = {}, appLabels = {}, kevinInfo = {};
for (const M of MONTHS) {
  const res = await ap.evaluate(({ y, m, pre }) => {
    const r = { boards: {}, mirror: {}, labels: {}, kevin: null };
    try { A.year = y; A.month = m; } catch (_) {}
    try { if (typeof _cmcApplyPlanningSeed === 'function') _cmcApplyPlanningSeed(); } catch (_) {}
    try { if (typeof _cmcSyncChefsTFromBoards === 'function') _cmcSyncChefsTFromBoards(y, m); } catch (e) { r.syncErr = String(e.message).slice(0, 80); }
    const G = window.DEPARTS_GEN;
    const ids = G && G.boards ? Object.keys(G.boards).filter(id => id.indexOf(pre) === 0 && G.boards[id].people && G.boards[id].people.length && G.boards[id].kind !== 'abs') : [];
    ids.forEach(id => {
      const cells = {};
      const chefs = (CHEFS_T[id] || []);
      const days = (typeof getDays === 'function') ? getDays(y, m) : 31;
      chefs.forEach(nm => { for (let d = 1; d <= days; d++) { let v = null; try { v = calcDepPos(nm, id, d); } catch (_) {} if (v != null) cells[nm + '@' + d] = v; } });
      r.boards[id] = cells;
      try { r.labels[id] = (typeof gt === 'function' && gt(id)) ? gt(id).name : id; } catch (_) { r.labels[id] = id; }
      try { const mir = _cmcMirrorTeam(id, y, m); const mid = mir && typeof mir === 'object' ? mir.id : mir; if (mid) r.mirror[id] = mid; } catch (_) {}
    });
    // Kevin : équipe + miroir résolus comme dans vDeparts
    try {
      const e = (A.employees || []).find(x => x && x.id === 'U11804');
      if (e) {
        let myTeam = (typeof teamForMonth === 'function' && teamForMonth(e, y, m)) || (e.teamHistory && e.teamHistory[y + '-' + m]) || null;
        let mirO = myTeam ? _cmcMirrorTeam(myTeam, y, m) : null;
        let mir = mirO && typeof mirO === 'object' ? mirO.id : mirO;
        r.kevin = { team: myTeam, teamLabel: myTeam && typeof gt === 'function' && gt(myTeam) ? gt(myTeam).name : myTeam, mirror: mir, mirrorLabel: mir && typeof gt === 'function' && gt(mir) ? gt(mir).name : mir };
      }
    } catch (_) {}
    return r;
  }, M);
  Object.assign(appData, res.boards);
  Object.assign(appMirror, res.mirror);
  Object.assign(appLabels, res.labels);
  kevinInfo[M.pre] = res.kevin;
}

// ── 3) DIFF ──
let cellsCompared = 0, mism = [], missingApp = [], missingLight = [];
Object.keys(light.boards).forEach(id => {
  const L = light.boards[id]; if (L.__err) { mism.push(`${id}: light err ${L.__err}`); return; }
  const Ap = appData[id];
  if (!Ap) { missingApp.push(id); return; }
  const keys = new Set([...Object.keys(L), ...Object.keys(Ap)]);
  keys.forEach(k => {
    cellsCompared++;
    if (L[k] !== Ap[k]) mism.push(`${id} ${k}: light=${L[k]} app=${Ap[k]}`);
  });
});
Object.keys(appData).forEach(id => { if (!light.boards[id]) missingLight.push(id); });

console.log(`== COMPARAISON app (v${appVer.replace(/^v/, '')}) ⇄ light — numéros de départ, TOUS les boards ==\n`);
console.log(`Boards light: ${Object.keys(light.boards).length} · Boards app: ${Object.keys(appData).length}`);
console.log(`Cellules comparées: ${cellsCompared}`);
console.log(`Écarts de NUMÉRO: ${mism.length}`);
if (mism.length) mism.slice(0, 20).forEach(x => console.log('   ❌ ' + x));
if (missingApp.length) console.log(`Boards light sans équivalent app: ${missingApp.length} → ${missingApp.slice(0, 8).join(', ')}`);
if (missingLight.length) console.log(`Boards app sans équivalent light: ${missingLight.length} → ${missingLight.slice(0, 8).join(', ')}`);

// mirror label check (Kevin)
console.log('\n-- Kevin (U11804) équipe + miroir --');
for (const pre of Object.keys(kevinInfo)) {
  const k = kevinInfo[pre];
  if (!k) { console.log(`  ${pre}: (introuvable)`); continue; }
  const lightMir = light.mirror[k.team] || null;
  const lightMirLabel = lightMir && light.labels[lightMir] ? light.labels[lightMir] : lightMir;
  const ok = (k.mirror || null) === (lightMir || null);
  console.log(`  ${pre}: équipe ${k.teamLabel} [${k.team}] · miroir app=${k.mirrorLabel || '∅'} [${k.mirror || '∅'}] · miroir light=${lightMirLabel || '∅'} [${lightMir || '∅'}]  ${ok ? '✅' : '❌ MISMATCH'}`);
}

// mirror map full diff
let mirDiff = [];
new Set([...Object.keys(light.mirror), ...Object.keys(appMirror)]).forEach(id => {
  if ((light.mirror[id] || null) !== (appMirror[id] || null)) mirDiff.push(`${id}: light=${light.mirror[id] || '∅'} app=${appMirror[id] || '∅'}`);
});
console.log(`\nÉcarts de MIROIR (map complète): ${mirDiff.length}`);
mirDiff.slice(0, 20).forEach(x => console.log('   ❌ ' + x));

console.log('\nerreurs JS light:', lerr.length ? lerr.slice(0, 3) : '(aucune)');
console.log('erreurs JS app  :', aerr.length ? aerr.slice(0, 3) : '(aucune)');
const clean = mism.length === 0 && mirDiff.length === 0 && missingApp.length === 0 && missingLight.length === 0 && lerr.length === 0 && aerr.length === 0;
console.log('\n' + (clean ? '✅ APP == LIGHT partout (numéros + miroirs), 0 écart, 0 erreur JS.' : '❌ DES ÉCARTS SUBSISTENT — à corriger.'));
await browser.close();
server.close();
process.exit(clean ? 0 : 1);
