/* LE LIEU DE CHAQUE CELLULE — Casino de Monte-Carlo ou Café de Paris — identique des deux côtés.
 *
 * Kevin 2026-09-17 : « Vérifie tout pour tout le monde, équipes, horaires, LIEUX, etc. »
 *
 * Le lieu n'est écrit nulle part : il se DÉDUIT du code. La nomenclature SBM (Kevin 2026-06-28)
 * dit que le suffixe « * » (orange dans le PDF) = Café de Paris, tout autre travail = CMC, et
 * un repos/congé n'a pas de lieu. CMCteams le calcule dans `getCodeLieu`, la page Départs le
 * peint dans `codeStyle`. Deux implémentations = deux vérités possibles : mesuré, « CDP »
 * (congé de départ) partait au Café de Paris côté light et en congé côté app. Aucun « CDP »
 * dans les mois importés → piège dormant, invisible pour un test d'égalité de cellules.
 *
 * Cette garde compare les DEUX implémentations, dans un vrai navigateur, sur :
 *   • tous les codes réellement présents dans les 4 mois (source : le seed = le PDF),
 *   • plus une liste de codes-pièges (CDP, CDH, CRH, DEPL, PRT, 18/2*, 19/4*…).
 * Et elle vérifie que l'ensemble des cellules « Café de Paris » est EXACTEMENT celui des
 * cellules dont le code porte « * » dans le PDF.
 *
 *   node tests/verify-lieux-parite.mjs
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p.startsWith('/CMCteams/')) p = p.slice('/CMCteams'.length);
  if (p.endsWith('/')) p += 'index.html';
  const file = join(ROOT, p.replace(/^\/+/, ''));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('nf'); }
  res.writeHead(200, { 'content-type': MIME[(file.match(/\.[a-z0-9]+$/i) || [''])[0].toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/CMCteams`;

globalThis.window = {};
await import(resolve(ROOT, 'tools/shared/planning-seed.js'));
const SEED = globalThis.window.CMC_PLANNING_SEED.months;
const codes = new Set();
let cellulesEtoile = 0, cellules = 0;
for (const k of Object.keys(SEED)) for (const id of Object.keys(SEED[k].ov)) for (const d of Object.keys(SEED[k].ov[id])) {
  const c = SEED[k].ov[id][d]; if (!c) continue; codes.add(c); cellules++; if (/\*/.test(c)) cellulesEtoile++;
}
// codes-pièges : jamais vus dans ces 4 mois, mais possibles demain
['CDP', 'CDH', 'CRH', 'CPS', 'CPM', 'DEPL', 'DEP', 'DELDS', 'PRT', 'RRT', 'SS', 'CLM', 'EDC', '19/4*', '22/6*', '14/19*', 'PK', '15/20', '19/6'].forEach((c) => codes.add(c));
const LISTE = [...codes].sort();

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/identitytoolkit|securetoken|firebasedatabase\.app/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));

// ── app : getCodeLieu ────────────────────────────────────────────────────────────────
const pApp = await ctx.newPage();
await pApp.addInitScript(() => { const S = { cmc_dver: '30', cmc_uid: 'U11804', cmc_lastact: String(Date.now()), cmc_seen_v10_678: '1', cmc_cookies_consent: '1' }; for (const k in S) localStorage.setItem(k, S[k]); });
await pApp.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });
await pApp.waitForFunction(() => typeof window.getCodeLieu === 'function', { timeout: 40000 });
const lieuApp = await pApp.evaluate((l) => { const o = {}; l.forEach((c) => { o[c] = getCodeLieu(c, null); }); return o; }, LISTE);

// ── light : codeStyle (la couleur EST le lieu : orange = Café de Paris) ──────────────
const pLight = await ctx.newPage();
await pLight.goto(BASE + '/tools/departs/index.html', { waitUntil: 'domcontentloaded' });
await pLight.waitForFunction(() => typeof window.codeStyle === 'function', { timeout: 40000 });
const styleLight = await pLight.evaluate((l) => { const o = {}; l.forEach((c) => { const s = codeStyle(c); o[c] = s ? s.bg : null; }); return o; }, LISTE);

const CDP_BG = '#ffc488';
const pb = [];
for (const c of LISTE) {
  const appCDP = /caf[ée] de paris/i.test(String(lieuApp[c] || ''));
  const lightCDP = String(styleLight[c] || '').toLowerCase() === CDP_BG;
  if (appCDP !== lightCDP) pb.push(`${c} : CMCteams « ${lieuApp[c] || '(sans lieu)'} » · light ${lightCDP ? 'Café de Paris (orange)' : 'pas Café de Paris'}`);
  // la marque du PDF, et rien d'autre
  if (appCDP !== /\*/.test(c)) pb.push(`${c} : le lieu Café de Paris ne doit venir QUE du suffixe « * » du PDF (app dit « ${lieuApp[c]} »)`);
}
console.log('== LIEUX (CMC / Café de Paris) — CMCteams et page Départs ==\n');
console.log(`${LISTE.length} codes comparés (dont ${[...codes].filter((c) => /\*/.test(c)).length} marqués « * ») · ${cellules} cellules du seed, ${cellulesEtoile} au Café de Paris`);
console.log(pb.length ? `❌ ${pb.length} divergence(s)` : '✅ même lieu des deux côtés pour chaque code, et « Café de Paris » = exactement le suffixe « * » du PDF');
pb.slice(0, 15).forEach((x) => console.log('   ' + x));
await nav.close(); server.close();
process.exit(pb.length ? 1 : 0);
