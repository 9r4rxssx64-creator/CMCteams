#!/usr/bin/env node
/* ============================================================================
 * GARDE — « CHAQUE mois a-t-il ses équipes, sur CHAQUE type d'appareil ? »
 * ----------------------------------------------------------------------------
 * Kevin 2026-09-19 : « Fais CMCteams et light à jour en priorité, des personnes
 * s'en servent pour le travail. »
 *
 * CE QUI EST ARRIVÉ (mesuré sur le vrai domaine, connecté) :
 *   septembre : 290 plannings, 247 équipes
 *   OCTOBRE   : 281 plannings,   0 ÉQUIPE
 * Un employé ouvrait octobre — le mois qu'on consulte pour s'organiser — et ne
 * voyait ni son équipe, ni son équipe miroir. Les horaires étaient pourtant justes.
 *
 * DEUX TROUS, trouvés l'un après l'autre :
 *   1. quand les cellules live sont DÉJÀ identiques au planning vérifié, l'app
 *      marquait le mois « traité » sans poser équipe ni miroir ;
 *   2. pire, sur un appareil SANS données locales — le cas le PLUS COURANT — les
 *      équipes n'étaient posées nulle part : juillet, août et octobre à 0.
 * Dans les deux cas, seul LE MOIS AFFICHÉ était rattrapé par la détection du
 * démarrage. D'où « ça a l'air de marcher » en ouvrant l'app.
 *
 * Le premier correctif n'a fermé que le trou n°1 — et cette garde, qui ne testait
 * alors qu'un seul état d'appareil et deux mois, est passée au vert. C'est
 * pourquoi elle vérifie désormais TOUS les mois du planning vérifié, sur LES DEUX
 * états d'appareil.
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

/* TOUS les mois du planning vérifié, dérivés du fichier — jamais écrits en dur,
   sinon la garde périme toute seule au mois suivant. */
const MOIS = Object.keys(SEED.months)
  .sort((a, b) => (+a.split('-')[0] * 12 + +a.split('-')[1]) - (+b.split('-')[0] * 12 + +b.split('-')[1]));
if (MOIS.length < 2) { console.error('MESURE IMPOSSIBLE : moins de 2 mois dans le planning verifie'); process.exit(2); }
const NOMS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const nomDe = (k) => NOMS[+k.split('-')[1]] + ' ' + k.split('-')[0];

let fails = 0;
const ok = (c, msg) => { console.log((c ? '  OK   ' : '  ECHEC ') + msg); if (!c) fails++; };

console.log('== Chaque mois a-t-il ses equipes, sur chaque type d\'appareil ? ==\n');
console.log(`  ${MOIS.length} mois : ${MOIS.map(nomDe).join(' - ')}`);

/* DEUX états d'appareil, parce que le trou n'était PAS le même dans chacun.
   A. sans données locales : un employé qui ouvre l'app, ou une session avant
      l'arrivée de Firebase. Le cas le plus courant, et le plus cassé.
   B. avec des données posées par un parseur plus ancien : l'appareil de
      quelqu'un qui se sert de l'app depuis un moment. */
const ETATS = [
  { nom: 'appareil SANS donnees locales (cas le plus courant)', avecDonnees: false },
  { nom: 'appareil AVEC donnees d\'un parseur ancien', avecDonnees: true },
];

const browser = await chromium.launch({ headless: true });
const resultats = {};
for (const etat of ETATS) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/firebasedatabase\.app/, (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: route.request().method() === 'GET' ? 'null' : '{}',
  }));
  const page = await ctx.newPage();
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push(String(e.message).slice(0, 120)));

  const plant = {
    cmc_dver: '30', cmc_v706_total_wiped: '1', cmc_fam_restored_v116: '1',
    cmc_uid: 'U11804', cmc_lastact: String(Date.now()),
  };
  if (etat.avecDonnees) {
    const ov = {};
    for (const k of MOIS) { ov[k] = {}; for (const id of Object.keys(SEED.months[k].ov)) ov[k][id] = Object.assign({}, SEED.months[k].ov[id]); }
    plant.cmc_ov = ov;
    for (const k of MOIS) {
      const [y, m] = k.split('-').map(Number);
      plant['cmc_ref_' + k] = { year: y, month: m, parserVersion: 'v9.900', seedApplied: 'v9.900', importedAt: Date.now() - 864e5, rows: {} };
    }
  }
  await page.addInitScript((p) => { for (const k of Object.keys(p)) localStorage.setItem(k, typeof p[k] === 'string' ? p[k] : JSON.stringify(p[k])); }, plant);
  await page.goto(APP, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.A && Array.isArray(A.employees) && window.CMC_PLANNING_SEED, { timeout: 30000 });
  await page.waitForTimeout(4500);

  const r = await page.evaluate((MOIS) => {
    const out = { appVer: window.APP_VER, parser: CMC_PLANNING_SEED.parser, mois: {} };
    for (const key of MOIS) {
      const [y, m] = key.split('-').map(Number);
      const avec = A.employees.filter((e) => e && e.id && Object.keys((A.overrides[key] || {})[e.id] || {}).length > 0);
      out.mois[key] = {
        planning: avec.length,
        equipe: avec.filter((e) => teamForMonth(e, y, m, { strict: true })).length,
        miroir: !!(function () { try { return JSON.parse(localStorage.getItem('cmc_team_mirror_' + key)); } catch (_) { return null; } })(),
        sansEquipe: avec.filter((e) => !teamForMonth(e, y, m, { strict: true })).slice(0, 4).map((e) => e.name || e.id),
      };
    }
    return out;
  }, MOIS);
  r.erreurs = erreurs;
  resultats[etat.nom] = r;
  await ctx.close();
}
await browser.close();
server.close();

for (const etat of ETATS) {
  const r = resultats[etat.nom];
  console.log(`\n> ${etat.nom}  (app ${r.appVer} - planning verifie ${r.parser})`);
  for (const k of MOIS) {
    const m = r.mois[k];
    console.log(`  ${nomDe(k).padEnd(18)} ${String(m.planning).padStart(3)} avec planning - ${String(m.equipe).padStart(3)} avec equipe`);
  }
  console.log();
  for (const k of MOIS) {
    const m = r.mois[k];
    ok(m.planning > 200, `${nomDe(k)} : le planning est la (${m.planning} personnes)`);
    ok(m.equipe === m.planning,
      `${nomDe(k)} : CHAQUE personne a son equipe (${m.equipe}/${m.planning})`
      + (m.equipe !== m.planning ? `\n       sans equipe : ${m.sansEquipe.join(', ')}...` : ''));
    ok(m.miroir, `${nomDe(k)} : l'equipe miroir est posee`);
  }
  ok(r.erreurs.length === 0, `0 erreur JS${r.erreurs.length ? ' - ' + r.erreurs[0] : ''}`);
}

console.log(`\n=== ${fails ? fails + ' ECHEC(S)' : 'tout est bon'} ===`);
if (fails) {
  console.log('\nUn employe qui ouvre ce mois ne verrait ni son equipe ni son equipe miroir.');
  console.log('Regarder _cmcSeedPoseEquipes dans index.html : les equipes du planning verifie');
  console.log('doivent etre posees pour TOUS les mois, quel que soit l\'etat de l\'appareil.');
}
process.exit(fails ? 1 : 0);
