// v9.898 (Kevin 2026-09-10 « l'app a déjà septembre mais trop d'erreurs ») — Sur l'appareil de
// Kevin, septembre avait été importé par un parseur PLUS ANCIEN (équipes fausses, horaires faux).
// Le seed vérifié (tools/shared/planning-seed.js, 0 écart contre le PDF) ne s'appliquait PAS :
// « données live = priorité absolue ». Depuis v9.898, un mois live importé par un parseur plus
// ancien que celui du seed est REMPLACÉ automatiquement — ancien archivé (V1, restaurable),
// édits manuels de Kevin conservés, marqueur idempotent, écriture Firebase.
// Ce test le PROUVE dans un vrai navigateur, sur la page servie comme en production, en
// simulant l'APPAREIL DE KEVIN (localStorage déjà migré : cmc_dver=30, wipe v706 déjà fait —
// sinon le boot d'un appareil NEUF efface tout et le test serait un faux vert).
//   A. import périmé (sans version)      → remplacé + archivé V1 + manuel conservé + push Firebase
//   B. 2e ouverture                      → rien ne bouge (idempotent, pas de 2e archive)
//      + LEÇON #246 : le nettoyage de boot ne supprime PLUS les codes chef « 20/5c » etc.
//   C. import fait par un parseur récent → conservé tel quel (real import wins)
//   D. cellules déjà identiques au seed  → marqueur seul, pas d'archive, pas de toast
//   node tests/verify-seed-remplace-import-perime.mjs
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
const KEY = '2026-8'; // septembre 2026 (mois 0-indexé)

globalThis.window = {};
await import(resolve(ROOT, 'tools/shared/planning-seed.js'));
const SEED = globalThis.window.CMC_PLANNING_SEED;
const M = SEED.months[KEY];
const SIG = (r) => { const o = {}; Object.keys(r || {}).sort().forEach((id) => { const d = r[id] || {}; const ks = Object.keys(d).filter((k) => d[k]).sort(); if (ks.length) { o[id] = {}; ks.forEach((k) => { o[id][k] = d[k]; }); } }); return JSON.stringify(o); };
const CELLS = (r) => Object.keys(r || {}).reduce((s, id) => s + Object.keys(r[id] || {}).filter((k) => r[id][k]).length, 0);

let fails = 0;
const ok = (c, msg) => { console.log((c ? '  ✅ ' : '  ❌ ') + msg); if (!c) fails++; };

// ── L'« ancien import » de septembre : faux, sur l'appareil de Kevin ────────────────────────
const seedIds = Object.keys(M.ov);
const tmp = M.emps.find((e) => /^U_TMP_/.test(e.id) && M.ov[e.id]);
const OLD_ID = 'U_TMP_OLD001'; // identifiant daté posé par l'ancien import pour la même personne
const defId = seedIds.find((id) => /^U\d/.test(id));
const stale = {};
seedIds.forEach((id) => { stale[id === tmp.id ? OLD_ID : id] = Object.assign({}, M.ov[id]); });
// 12 horaires FAUX mais plausibles (un vrai code à la place d'un autre — c'est ce qu'un mauvais
// parseur produit ; un code « déchet » type ZZ9 serait, lui, jeté par le nettoyage de boot)
const altered = seedIds.slice(0, 12).map((id) => { const k = id === tmp.id ? OLD_ID : id; const d = Object.keys(stale[k])[0]; stale[k][d] = stale[k][d] === 'RH' ? '20/5' : 'RH'; return k + '/' + d; });
seedIds.slice(20, 23).forEach((id) => { delete stale[id]; });
stale.U_TMP_FANTOME = { 1: '20/5', 2: 'RH' };
const STALE_CELLS = CELLS(stale);
// Attendu après remplacement : seed (l'ancien U_TMP_OLD001 ne survit pas au boot — les employés
// hors DEF_EMP sont retirés — la personne revit sous l'identifiant du seed) + l'édit manuel.
const expected = {}; seedIds.forEach((id) => { expected[id] = Object.assign({}, M.ov[id]); });
expected[defId] = Object.assign({}, expected[defId], { 15: 'MANU' });
const CHEF_CELLS = Object.keys(expected).reduce((s, id) => s + Object.keys(expected[id]).filter((d) => /c$/.test(expected[id][d])).length, 0);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const fbWrites = [];
await ctx.route(/firebasedatabase\.app/, (route) => {
  const rq = route.request();
  if (rq.method() !== 'GET') fbWrites.push({ m: rq.method(), u: rq.url().replace(/\?.*$/, '') });
  route.fulfill({ status: 200, contentType: 'application/json', body: rq.method() === 'GET' ? 'null' : '{}' });
});

// Appareil de Kevin : déjà migré (sinon le boot d'un appareil neuf efface les mois : wipe v706).
const DEVICE = { cmc_dver: '30', cmc_v706_total_wiped: '1', cmc_fam_restored_v116: '1' };
async function openPage(plant) {
  const page = await ctx.newPage();
  await page.addInitScript((plant) => { Object.keys(plant).forEach((k) => { if (plant[k] === null) localStorage.removeItem(k); else localStorage.setItem(k, typeof plant[k] === 'string' ? plant[k] : JSON.stringify(plant[k])); }); }, Object.assign({}, DEVICE, plant || {}));
  const logs = [];
  page.on('console', (m) => logs.push(m.text()));
  page.on('pageerror', (e) => logs.push('PAGEERROR ' + e.message));
  await page.goto(APP, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.A && Array.isArray(A.employees) && window.CMC_PLANNING_SEED && typeof _cmcApplyPlanningSeed === 'function', { timeout: 30000 });
  await page.waitForTimeout(2500); // boot différé (seed, détection, toasts)
  return { page, logs };
}
const READ = ({ KEY }) => {
  const SIG = (r) => { const o = {}; Object.keys(r || {}).sort().forEach((id) => { const d = r[id] || {}; const ks = Object.keys(d).filter((k) => d[k]).sort(); if (ks.length) { o[id] = {}; ks.forEach((k) => { o[id][k] = d[k]; }); } }); return JSON.stringify(o); };
  const cur = A.overrides[KEY] || {};
  let lsOv = null; try { lsOv = lg('cmc_ov', null); } catch (_) {}
  const ref = lg('cmc_ref_' + KEY, null);
  return {
    sig: SIG(cur), sigLs: lsOv && lsOv[KEY] ? SIG(lsOv[KEY]) : null,
    chef: Object.keys(cur).reduce((s, id) => s + Object.keys(cur[id]).filter((d) => /c$/.test(cur[id][d])).length, 0),
    hist: lg('cmc_history_' + KEY + '_versioned', []).map((h) => ({ v: h.version, cells: h.cellsCount })),
    ref: ref && { seedApplied: ref.seedApplied, parserVersion: ref.parserVersion, archivedAs: ref.archivedAs, version: ref.version, replacedAt: ref.replacedAt },
    replaced: window._cmcSeedReplaced || [],
    parser: CMC_PLANNING_SEED.parser, appVer: window.APP_VER,
  };
};

console.log('▶ Appareil de Kevin simulé : ancien import de septembre = ' + STALE_CELLS + ' cellules (12 faussées, 3 personnes manquantes, 1 inventée, ' + tmp.name + ' sous ' + OLD_ID + ')');
const PLANT_STALE = {
  cmc_ov: { [KEY]: stale },
  ['cmc_ref_' + KEY]: { year: 2026, month: 8, rows: {}, importedAt: Date.now() - 86400000, version: 2 }, // ancien : pas de parserVersion
  ['cmc_manual_overrides_' + KEY]: { [defId]: { 15: { code: 'MANU', ts: Date.now(), by: 'U11804' } } },
  ['cmc_history_' + KEY + '_versioned']: null,
};

// ── A. ouverture → remplacement ───────────────────────────────────────────────────────────
console.log('▶ A. ouverture : le seed vérifié remplace l\'import périmé');
fbWrites.length = 0;
const a = await openPage(PLANT_STALE);
const RA = await a.page.evaluate(READ, { KEY });
const RA2 = await a.page.evaluate(({ KEY, name, OLD_ID, defId, tmpId }) => {
  const cur = A.overrides[KEY] || {};
  const e = A.employees.filter((x) => x.name === name).map((x) => x.id);
  const d = A.employees.find((x) => x.id === defId), t = A.employees.find((x) => x.id === tmpId);
  return { manu: cur[defId] && cur[defId][15], fantome: !!cur.U_TMP_FANTOME, oldCells: !!cur[OLD_ID], sameName: e, teamDef: d && d.teamHistory && d.teamHistory[KEY], teamTmp: t && t.teamHistory && t.teamHistory[KEY], oct: !!(A.overrides['2026-9'] && Object.keys(A.overrides['2026-9']).length), octRef: lg('cmc_ref_2026-9', null) };
}, { KEY, name: tmp.name, OLD_ID, defId, tmpId: tmp.id });
ok(/^v\d+\.\d+$/.test(RA.parser || '') && RA.parser === RA.appVer, 'le seed porte la version de son parseur = celle de l\'app : ' + RA.parser);
ok(RA.sig === SIG(expected), 'cellules de septembre = seed vérifié + édit manuel conservé');
ok(RA2.manu === 'MANU', 'édit manuel de Kevin (jour 15) ré-appliqué');
ok(!RA2.fantome && !RA2.oldCells, 'personne inventée et identifiant daté de l\'ancien import : plus aucune cellule');
ok(RA2.sameName.length === 1 && RA2.sameName[0] === tmp.id, tmp.name + ' existe une seule fois (' + RA2.sameName.join(',') + ')');
ok(RA.hist.length === 1 && RA.hist[0].v === 'V1' && RA.hist[0].cells === STALE_CELLS, 'ancien import archivé en V1 = ' + STALE_CELLS + ' cellules (' + JSON.stringify(RA.hist) + ')');
ok(RA.ref && RA.ref.seedApplied === RA.parser && RA.ref.parserVersion === RA.parser && RA.ref.archivedAs === 'V1' && RA.ref.version === 2, 'marqueur cmc_ref_ posé (seedApplied=' + (RA.ref && RA.ref.seedApplied) + ', archivedAs=' + (RA.ref && RA.ref.archivedAs) + ', badge V2 conservé)');
ok(RA.sigLs === SIG(expected), 'localStorage cmc_ov persisté avec la version vérifiée');
ok(RA2.teamDef === M.team[defId] && RA2.teamTmp === M.team[tmp.id], 'équipes du mois = celles du PDF (' + RA2.teamDef + ' / ' + RA2.teamTmp + ')');
ok(RA.replaced.length === 1 && RA.replaced[0].key === KEY && RA.replaced[0].manual === 1 && RA.replaced[0].oldCells === STALE_CELLS, 'un seul remplacement tracé : ' + JSON.stringify(RA.replaced));
ok(RA2.oct && !RA2.octRef, 'octobre (sans données live) reste appliqué en affichage seul, sans marqueur');
ok(fbWrites.some((w) => w.m === 'PUT' && /cmc_ov\.json$/.test(w.u)) && fbWrites.some((w) => w.m === 'PUT' && new RegExp('cmc_ref_' + KEY + '\\.json$').test(w.u)), 'écriture Firebase : cmc_ov + cmc_ref_ (' + fbWrites.length + ' écritures)');
ok(a.logs.some((l) => /\[v9\.898 seed\] Planning Septembre 2026 remplacé/.test(l)), 'journal : « Planning Septembre 2026 remplacé par la version vérifiée »');
ok(!a.logs.some((l) => /^PAGEERROR/.test(l)), '0 erreur JS ' + a.logs.filter((l) => /^PAGEERROR/.test(l)).slice(0, 2).join(' | '));
await a.page.close();

// ── B. 2e ouverture (localStorage = résultat de A) → idempotent + codes chef intacts ────────
console.log('▶ B. 2e ouverture : rien ne bouge, et le nettoyage de boot ne mange plus les codes chef (leçon #246)');
const b = await openPage({});
const RB = await b.page.evaluate(READ, { KEY });
ok(RB.sig === SIG(expected) && RB.sigLs === SIG(expected), 'cellules identiques en mémoire ET en localStorage');
ok(RB.chef === CHEF_CELLS, 'codes chef « …c » conservés au boot : ' + RB.chef + '/' + CHEF_CELLS + ' (avant v9.898 : 0, supprimés comme « invalides »)');
ok(!b.logs.some((l) => /Code invalide supprimé/.test(l)), 'aucun « Code invalide supprimé » au boot');
ok(RB.hist.length === 1 && RB.replaced.length === 0 && !b.logs.some((l) => /remplacé par la version vérifiée/.test(l)), 'idempotent : 1 seule archive, 0 remplacement, pas de 2e message');
await b.page.close();

// ── C. import RÉCENT (parseur ≥ seed) → conservé ─────────────────────────────────────────
console.log('▶ C. import fait par un parseur au moins aussi récent : conservé (real import wins)');
const c = await openPage(Object.assign({}, PLANT_STALE, { ['cmc_ref_' + KEY]: { year: 2026, month: 8, rows: {}, importedAt: Date.now(), version: 3, parserVersion: RA.appVer }, ['cmc_manual_overrides_' + KEY]: null }));
const RC = await c.page.evaluate(READ, { KEY });
const staleAfterBoot = Object.assign({}, stale); // l'ancien import : le boot dérive les codes, n'en supprime aucun (sauf déchets)
ok(RC.sig === SIG(staleAfterBoot) && RC.hist.length === 0 && !RC.ref.seedApplied && RC.replaced.length === 0, 'import récent intact (0 archive, pas de marqueur seed)');
await c.page.close();

// ── D. cellules déjà identiques, import sans version → marqueur seul ─────────────────────
console.log('▶ D. cellules déjà identiques au seed : marqueur seul, ni archive ni message');
const d = await openPage({ cmc_ov: { [KEY]: M.ov }, ['cmc_ref_' + KEY]: { year: 2026, month: 8, rows: {}, importedAt: Date.now(), version: 2 }, ['cmc_manual_overrides_' + KEY]: null, ['cmc_history_' + KEY + '_versioned']: null });
const RD = await d.page.evaluate(READ, { KEY });
ok(RD.hist.length === 0 && RD.ref.seedApplied === RD.parser && !RD.ref.replacedAt && RD.replaced.length === 0 && RD.sig === SIG(M.ov), 'marqueur posé sans archive ni remplacement, cellules intactes');
ok(!d.logs.some((l) => /remplacé par la version vérifiée/.test(l)), 'aucun message (silencieux)');
await d.page.close();

await browser.close(); server.close();
console.log(fails ? `\n❌ ${fails} échec(s)` : '\n✅ seed vérifié remplace un import périmé : A/B/C/D prouvés');
process.exit(fails ? 1 : 0);
