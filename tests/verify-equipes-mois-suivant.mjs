#!/usr/bin/env node
/* ============================================================================
 * GARDE — « le mois SUIVANT a-t-il ses équipes ? »
 * ----------------------------------------------------------------------------
 * Kevin 2026-09-19 : « Fais CMCteams et light à jour en priorité, des personnes
 * s'en servent pour le travail. »
 *
 * CE QUI EST ARRIVÉ (mesuré sur le vrai domaine, connecté, le 19.09) :
 *   septembre : 290 plannings, 247 équipes
 *   OCTOBRE   : 281 plannings,   0 ÉQUIPE
 * Un employé ouvrait octobre — le mois qu'on consulte pour s'organiser — et ne
 * voyait ni son équipe, ni son équipe miroir. Les cellules étaient pourtant
 * justes : c'est l'appartenance aux équipes qui manquait.
 *
 * CAUSE RACINE : quand les cellules live sont DÉJÀ identiques au seed (le cas
 * normal dès qu'un mois a été posé une fois), l'app marquait le mois « traité »
 * et n'appliquait que la famille, l'école et le miroir — jamais les ÉQUIPES du
 * seed. Pour le mois AFFICHÉ ça ne se voyait pas : la détection d'équipes tourne
 * au boot sur ce mois-là. Pour le mois SUIVANT, rien ne tourne.
 *
 * Aucun test ne regardait le mois suivant : ils vérifiaient tous le mois affiché.
 *
 * CE QUE CETTE GARDE FAIT : elle ouvre la vraie page dans un vrai navigateur,
 * avec l'état exact d'un appareil en service (les deux derniers mois du seed,
 * posés par un parseur plus ancien, cellules identiques au PDF), et exige que
 * CHAQUE personne ayant un planning ait AUSSI une équipe — pour les DEUX mois.
 *
 *   npm run test:equipes-mois-suivant
 * ========================================================================== */

import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json' };
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
const APP = `http://127.0.0.1:${server.address().port}/CMCteams/index.html`;

globalThis.window = {};
await import(resolve(ROOT, 'tools/shared/planning-seed.js'));
const SEED = globalThis.window.CMC_PLANNING_SEED;

/* Les DEUX derniers mois du seed : le mois en cours et celui d'après. On les
   dérive du fichier, jamais en dur — sinon la garde périme toute seule. */
const MOIS = Object.keys(SEED.months).sort((a, b) => (+a.split('-')[0] * 12 + +a.split('-')[1]) - (+b.split('-')[0] * 12 + +b.split('-')[1])).slice(-2);
if (MOIS.length < 2) { console.error('❌ moins de 2 mois dans le seed — je ne conclus rien'); process.exit(2); }
const [COURANT, SUIVANT] = MOIS;
const NOMS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const nomDe = (k) => NOMS[+k.split('-')[1]] + ' ' + k.split('-')[0];

let fails = 0;
const ok = (c, msg) => { console.log((c ? '  ✅ ' : '  ❌ ') + msg); if (!c) fails++; };

console.log('== Le mois suivant a-t-il ses équipes ? ==\n');
console.log(`  mois affiché : ${nomDe(COURANT)}   ·   mois suivant : ${nomDe(SUIVANT)}\n`);

/* L'état d'un appareil en service : les cellules du PDF déjà posées, marquées
   par un parseur PLUS ANCIEN (c'est ce qu'on a mesuré en production). */
const ov = {};
for (const k of MOIS) { ov[k] = {}; for (const id of Object.keys(SEED.months[k].ov)) ov[k][id] = Object.assign({}, SEED.months[k].ov[id]); }
const VIEUX = 'v9.900';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/firebasedatabase\.app/, (route) => route.fulfill({
  status: 200, contentType: 'application/json', body: route.request().method() === 'GET' ? 'null' : '{}',
}));
const page = await ctx.newPage();
const erreurs = [];
page.on('pageerror', (e) => erreurs.push(String(e.message).slice(0, 120)));

const plant = {
  cmc_dver: '30', cmc_v706_total_wiped: '1', cmc_fam_restored_v116: '1',
  cmc_uid: 'U11804', cmc_lastact: String(Date.now()), cmc_ov: ov,
};
for (const k of MOIS) {
  const [y, m] = k.split('-').map(Number);
  plant['cmc_ref_' + k] = { year: y, month: m, parserVersion: VIEUX, seedApplied: VIEUX, importedAt: Date.now() - 864e5, rows: {} };
}
await page.addInitScript((p) => { for (const k of Object.keys(p)) localStorage.setItem(k, typeof p[k] === 'string' ? p[k] : JSON.stringify(p[k])); }, plant);
await page.goto(APP, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => window.A && Array.isArray(A.employees) && window.CMC_PLANNING_SEED, { timeout: 30000 });
await page.waitForTimeout(4000);

const r = await page.evaluate((MOIS) => {
  const out = { appVer: window.APP_VER, parser: CMC_PLANNING_SEED.parser, mois: {} };
  for (const key of MOIS) {
    const [y, m] = key.split('-').map(Number);
    const avecPlanning = A.employees.filter((e) => e && e.id && Object.keys((A.overrides[key] || {})[e.id] || {}).length > 0);
    out.mois[key] = {
      planning: avecPlanning.length,
      equipe: avecPlanning.filter((e) => teamForMonth(e, y, m, { strict: true })).length,
      miroir: !!(function () { try { return JSON.parse(localStorage.getItem('cmc_team_mirror_' + key)); } catch (_) { return null; } })(),
      sansEquipe: avecPlanning.filter((e) => !teamForMonth(e, y, m, { strict: true })).slice(0, 5).map((e) => e.name || e.id),
    };
  }
  return out;
}, MOIS);

console.log(`  app ${r.appVer} · seed ${r.parser}\n`);
for (const k of MOIS) {
  const m = r.mois[k];
  console.log(`  ${nomDe(k).padEnd(18)} ${String(m.planning).padStart(3)} avec planning · ${String(m.equipe).padStart(3)} avec équipe`);
}
console.log();

for (const k of MOIS) {
  const m = r.mois[k];
  const quoi = k === SUIVANT ? 'MOIS SUIVANT' : 'mois affiché';
  ok(m.planning > 200, `${quoi} (${nomDe(k)}) : le planning est là (${m.planning} personnes)`);
  ok(m.equipe === m.planning,
    `${quoi} (${nomDe(k)}) : CHAQUE personne a son équipe (${m.equipe}/${m.planning})`
    + (m.equipe !== m.planning ? `\n       sans équipe : ${m.sansEquipe.join(', ')}…` : ''));
  ok(m.miroir, `${quoi} (${nomDe(k)}) : l'équipe miroir est posée`);
}
ok(erreurs.length === 0, `0 erreur JS${erreurs.length ? ' — ' + erreurs[0] : ''}`);

await browser.close(); server.close();
console.log(`\n=== ${fails ? fails + ' FAIL' : 'tout est bon'} ===`);
if (fails) {
  console.log('\nUn employé qui ouvre le mois suivant ne verrait ni son équipe ni son équipe miroir.');
  console.log('Regarder _cmcSeedPoseEquipes dans index.html (les équipes du seed doivent être posées');
  console.log('même quand les cellules live sont déjà identiques au PDF).');
}
process.exit(fails ? 1 : 0);
