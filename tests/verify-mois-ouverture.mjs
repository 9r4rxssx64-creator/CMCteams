// « Quand j'ouvre, ce n'est pas la date du jour, mauvais mois » (Kevin 2026-09-05).
// Vérifie, dans un VRAI navigateur sur les VRAIES pages servies comme en production :
//   1. CMCteams (app complète) ouvre sur le mois courant — pour CHAQUE compte (admin + employés)
//   2. la page light ouvre sur le mois courant (session neuve)
//   3. la page light, avec un tableau d'un mois PASSÉ mémorisé (le cas de Kevin), revient sur le
//      mois courant EN GARDANT LA MÊME ÉQUIPE  ← c'est le bug corrigé en v1.37 (livré en v1.38)
//   4. le mois affiché contient de vraies données (personnes, horaires, lieux)
//
// Autonome : lance son propre serveur statique qui imite l'hébergement réel — les scripts de la
// page sont en chemin ABSOLU (/CMCteams/tools/shared/planning-seed.js), donc ouvrir les fichiers
// en local (file://) ne charge AUCUNE donnée et le test serait un faux vert.
//   node tests/verify-mois-ouverture.mjs
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p.startsWith('/CMCteams/')) p = p.slice('/CMCteams'.length);
  const file = join(ROOT, p.replace(/^\/+/, ''));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('nf'); }
  const ext = (file.match(/\.[a-z0-9]+$/i) || [''])[0].toLowerCase();
  res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = process.env.CMC_BASE || `http://127.0.0.1:${server.address().port}/CMCteams`;
const APP = BASE + '/index.html';
const LIGHT = BASE + '/tools/departs/index.html';

const today = new Date();
const MFR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const MOIS_ATTENDU = MFR[today.getMonth()], AN_ATTENDU = today.getFullYear();

let fails = 0;
function assert(ok, msg) { if (ok) console.log('  ok   ' + msg); else { console.log('  FAIL ' + msg); fails++; } }

console.log("Aujourd'hui : " + today.getDate() + ' ' + MOIS_ATTENDU + ' ' + AN_ATTENDU + '\n');

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

// ─── 1) CMCteams, compte par compte ────────────────────────────────────────────
console.log('=== CMCteams (app complète) ===');
async function ouvrirApp(uid) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
  if (uid) {
    await page.addInitScript((u) => {
      try { localStorage.setItem('cmc_uid', u); localStorage.setItem('cmc_lastact', String(Date.now())); } catch (_) {}
    }, uid);
  }
  await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => window.A && Array.isArray(A.employees) && A.employees.length > 0, { timeout: 45000 });
  await page.waitForTimeout(2500);
  return { ctx, page, errs };
}

const comptes = [{ label: 'Kevin (admin)', uid: 'U11804' }];
{
  const { ctx, page } = await ouvrirApp(null);
  const autres = await page.evaluate(() => {
    const ov = (A.overrides || {})[A.year + '-' + A.month] || {};
    return A.employees.filter((e) => e.id !== 'U11804' && ov[e.id] && Object.keys(ov[e.id]).length)
      .slice(0, 3).map((e) => ({ id: e.id, name: e.name }));
  });
  autres.forEach((e) => comptes.push({ label: 'Employé ' + e.name, uid: e.id }));
  await ctx.close();
}

for (const c of comptes) {
  const { ctx, page, errs } = await ouvrirApp(c.uid);
  const st = await page.evaluate(() => {
    const key = A.year + '-' + A.month;
    const ov = (A.overrides || {})[key] || {};
    const avecPlanning = Object.keys(ov).filter((id) => ov[id] && Object.keys(ov[id]).length).length;
    return { annee: A.year, mois: A.month, connecte: (A.user && A.user.id) || null, avecPlanning };
  });
  assert(st.annee === AN_ATTENDU && st.mois === today.getMonth(),
    c.label.padEnd(28) + ' ouvre sur ' + MFR[st.mois] + ' ' + st.annee + ' (connecté=' + (st.connecte || 'non') + ')');
  if (c === comptes[0]) {
    assert(st.avecPlanning > 100, 'données réelles du mois : ' + st.avecPlanning + ' personnes avec planning');
    assert(errs.length === 0, 'aucune erreur JS (' + errs.slice(0, 1).join('') + ')');
  }
  await ctx.close();
}

// ─── 2 & 3) page light ─────────────────────────────────────────────────────────
console.log('\n=== Page light (Départs) ===');
async function ouvrirLight(boardMemorise) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
  if (boardMemorise) {
    await page.addInitScript((b) => { try { localStorage.setItem('cmc_dep_board', b); } catch (_) {} }, boardMemorise);
  }
  await page.goto(LIGHT, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  const st = await page.evaluate(() => {
    const eq = (l) => { const p = String(l || '').split(' — '); return (p[1] || '').replace(/\s*\([^)]*\)\s*$/, '').trim(); };
    return {
      bid: typeof BID !== 'undefined' ? BID : null,
      label: (typeof B !== 'undefined' && B) ? B.label : null,
      equipe: (typeof B !== 'undefined' && B) ? eq(B.label) : null,
      personnes: (typeof B !== 'undefined' && B && B.people) ? B.people.length : 0,
      memorise: (function () { try { return localStorage.getItem('cmc_dep_board'); } catch (_) { return null; } })(),
    };
  });
  return { ctx, page, st, errs };
}

// (2) session neuve
{
  const { ctx, st, errs } = await ouvrirLight(null);
  assert(!!st.label && st.label.indexOf(MOIS_ATTENDU + ' ' + AN_ATTENDU) === 0,
    'session neuve → ouvre sur « ' + st.label + ' »');
  assert(st.personnes > 0, 'le tableau contient de vraies personnes (' + st.personnes + ')');
  assert(errs.length === 0, 'aucune erreur JS (' + errs.slice(0, 1).join('') + ')');
  await ctx.close();
}

// (3) LE CAS DE KEVIN : un tableau d'un mois passé est mémorisé sur le téléphone
{
  // on choisit un vrai tableau d'un mois antérieur dont l'équipe existe encore ce mois-ci
  const { ctx: c0, page: p0 } = await ouvrirLight(null);
  const cible = await p0.evaluate((moisCourant) => {
    const eq = (l) => { const p = String(l || '').split(' — '); return (p[1] || '').replace(/\s*\([^)]*\)\s*$/, '').trim(); };
    const ids = Object.keys(BOARDS).filter((k) => BOARDS[k] && BOARDS[k].kind !== 'abs');
    const rang = (k) => BOARDS[k].year * 12 + BOARDS[k].monthIdx;
    const max = Math.max(...ids.map(rang));
    const recentes = new Set(ids.filter((k) => rang(k) === max).map((k) => eq(BOARDS[k].label)));
    const vieux = ids.filter((k) => rang(k) < max && recentes.has(eq(BOARDS[k].label)));
    return vieux.length ? { id: vieux[0], equipe: eq(BOARDS[vieux[0]].label), label: BOARDS[vieux[0]].label } : null;
  }, today.getMonth());
  await c0.close();

  if (!cible) { assert(false, 'impossible de trouver un tableau de mois passé pour le test'); }
  else {
    console.log('  (simulation : le téléphone a mémorisé « ' + cible.label + ' »)');
    const { ctx, st } = await ouvrirLight(cible.id);
    assert(!!st.label && st.label.indexOf(MOIS_ATTENDU + ' ' + AN_ATTENDU) === 0,
      'tableau d\'un mois passé mémorisé → revient sur ' + MOIS_ATTENDU + ' (affiché : « ' + st.label + ' »)');
    assert(st.equipe === cible.equipe,
      'la MÊME équipe est conservée (' + cible.equipe + ' → ' + st.equipe + ')');
    assert(st.memorise === st.bid, 'la mémoire du téléphone est remise à jour (plus de blocage)');
    assert(st.personnes > 0, 'le tableau affiché contient de vraies personnes (' + st.personnes + ')');
    await ctx.close();
  }
}

console.log('\n' + (fails ? '❌ ' + fails + ' contrôle(s) en échec' : '✅ tout ouvre sur le mois courant, données réelles'));
await browser.close();
server.close();
process.exitCode = fails ? 1 : 0;
