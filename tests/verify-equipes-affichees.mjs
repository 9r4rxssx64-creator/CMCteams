/* L'ÉQUIPE AFFICHÉE EST CELLE DU MOIS — jamais `emp.team` (DEF_EMP figé).
 *
 * Kevin 2026-09-17 : « Il manque TOULET et DEGIOVANNI dans l'équipe 11. Vérifie tout pour
 * tout le monde, équipes, horaires, lieux, etc. »
 *
 * CE QUI S'EST PASSÉ (mesuré) : `emp.team` de DEF_EMP n'est PAS l'équipe courante — c'est un
 * découpage figé par tranches de matricules (U00236-U00245 = « c11 »…). Les vues qui listaient
 * ou étiquetaient une équipe avec `emp.team` montraient donc un effectif d'un autre temps :
 *   CMC Éq.11 affichée = ADELHEIM, BANTI, CAMILLERI, DE REGIBUS, DELAUNAY, DI LUCA, GILETTA,
 *                        MARTIRE, MORANA, MORTER   → sans TOULET ni DEGIOVANNI ;
 *   CMC Éq.11 du PDF   = ABBAS, BINI, COTTON, DJORDJEVIC, MALGHERINI, MATTONI, SOURMAILLE, SUBTIL.
 * 36/36 équipes fausses pour septembre 2026. La règle « emp.team n'est JAMAIS l'équipe courante »
 * existait déjà (CLAUDE.md, leçon #262) mais AUCUNE garde ne la faisait respecter.
 *
 * CE QUE FAIT CETTE GARDE, en vrai navigateur, sur les 4 mois couverts :
 *   1. EFFECTIFS : pour chaque équipe du PDF (boards générés = mêmes données que la page light),
 *      l'app doit associer EXACTEMENT les mêmes personnes, via `teamForMonth`.
 *   2. CAUSE RACINE : chaque `emp.team` est remplacé par un accesseur qui enregistre la pile
 *      d'appel. On rend les vues principales et on EXIGE qu'aucune lecture ne vienne d'une vue.
 *      Seules restent permises : la sérialisation (persistance) et les marqueurs de RÔLE
 *      (`pit15` / `sup`), qui ne sont pas des équipes de rotation.
 *
 *   node tests/verify-equipes-affichees.mjs
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
await import(resolve(ROOT, 'tools/departs/boards-gen.js'));
const GEN = globalThis.window.DEPARTS_GEN;
const MOIS = [
  { y: 2026, m: 8, pref: '2026-09-', label: 'Septembre 2026' },
  { y: 2026, m: 9, pref: '2026-10-', label: 'Octobre 2026' },
  { y: 2026, m: 7, pref: '2026-08-', label: 'Août 2026' },
  { y: 2026, m: 6, pref: '2026-07-', label: 'Juillet 2026' },
];
// Lectures de emp.team TOLÉRÉES : persistance (sérialisation) et marqueurs de RÔLE.
const TOLERE = /JSON\.stringify|cmcIsCadreUnified|cmcIsPitBoss|cmcIsSuperviseur|isUserFloating|_rebuildIndexes/;
const VUES = ['accueil', 'planning', 'departs', 'monplanning', 'profil', 'employees', 'teams', 'absences', 'stats', 'chat', 'passwords', 'online', 'retrait', 'pit', 'quiestlibre', 'retardataires'];

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/identitytoolkit|securetoken|firebasedatabase\.app/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
const page = await ctx.newPage();
const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
await page.addInitScript(() => {
  const S = { cmc_dver: '30', cmc_v706_total_wiped: '1', cmc_fam_restored_v116: '1', cmc_v805_famreset: '1', cmc_uid: 'U11804', cmc_lastact: String(Date.now()), cmc_seen_v10_678: '1', cmc_cookies_consent: '1' };
  for (const k in S) localStorage.setItem(k, S[k]);
});
await page.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.A && Array.isArray(A.employees) && A.employees.length > 100, { timeout: 40000 });
await page.waitForTimeout(3000);

let FAIL = 0;
console.log('== ÉQUIPE DU MOIS AFFICHÉE — app CMCteams en vrai navigateur ==\n');

// ── 1. Effectifs : app == PDF, mois par mois ─────────────────────────────────────────
for (const M of MOIS) {
  const attendu = {};
  for (const k of Object.keys(GEN.boards)) {
    if (!k.startsWith(M.pref) || GEN.boards[k].kind === 'abs') continue;
    attendu[k.slice(M.pref.length)] = GEN.boards[k].people.map((p) => p.name.toUpperCase()).sort();
  }
  await page.evaluate(({ y, m }) => { A.year = y; A.month = m; if (typeof dc === 'function') dc(); }, M);
  await page.waitForTimeout(1200);
  const vu = await page.evaluate(({ y, m }) => {
    const o = {};
    (A.employees || []).forEach((e) => { const t = empTeamNow(e, y, m); if (t && t !== '?') (o[t] = o[t] || []).push((e.name || '').toUpperCase()); });
    Object.keys(o).forEach((t) => o[t].sort());
    return o;
  }, M);
  const pb = [];
  for (const t of Object.keys(attendu)) {
    const got = vu[t] || [];
    const manque = attendu[t].filter((n) => !got.includes(n));
    const enTrop = got.filter((n) => !attendu[t].includes(n));
    if (manque.length || enTrop.length) pb.push(`${t} : manque [${manque.join(', ')}] · en trop [${enTrop.join(', ')}]`);
  }
  console.log(`${M.label} : ${Object.keys(attendu).length} équipes, ${Object.values(attendu).reduce((s, l) => s + l.length, 0)} personnes — ${pb.length ? '❌ ' + pb.length + ' équipe(s) fausse(s)' : '✅ effectifs conformes au PDF'}`);
  pb.slice(0, 8).forEach((x) => console.log('     ' + x));
  if (pb.length) FAIL++;
}

// ── 2. Cause racine : plus AUCUNE vue ne lit emp.team ────────────────────────────────
await page.evaluate(() => {
  A.year = 2026; A.month = 8;
  window.__reads = {};
  (A.employees || []).forEach((e) => {
    const v = e.team; delete e.team;
    Object.defineProperty(e, 'team', {
      configurable: true, enumerable: true,
      get() { const st = (new Error()).stack || ''; const k = (st.split('\n')[2] || '').trim(); const vue = window.__vue || '?'; (window.__reads[vue] = window.__reads[vue] || {})[k] = (window.__reads[vue][k] || 0) + 1; return v; },
      set() {},
    });
  });
});
for (const v of VUES) {
  await page.evaluate((vv) => {
    window.__vue = vv;
    try { sv(vv); } catch (e) {}
    // DÉPLIER : beaucoup de vues ne calculent leurs effectifs que section OUVERTE. Sans ça,
    // la garde ne verrait rien (un test qui ne vérifie rien passe toujours — leçon #103).
    try {
      if (vv === 'teams') { window._teamsFamOpen = window._teamsFamOpen || {}; ['bj', 'roulettes', 'cmc', 'baccara', 'cadres', 'autre'].forEach((f) => { window._teamsFamOpen[f] = true; }); dc(); }
      if (vv === 'planning' && window._planFamOpen) { Object.keys(_planFamOpen).forEach((f) => { _planFamOpen[f] = true; }); if (window._planAbsOpen) Object.keys(_planAbsOpen).forEach((f) => { _planAbsOpen[f] = true; }); dc(); }
      if (vv === 'employees' && typeof _adminViewState === 'function') { const st = _adminViewState(); ['primary', 'mirror', 'fam:bj', 'fam:roulettes', 'fam:baccara', 'fam:cmc', 'fam:cadres', 'noteam:nopresence'].forEach((k) => { st[k] = true; }); _setAdminViewState(st); dc(); }
    } catch (e) {}
  }, v);
  await page.waitForTimeout(700);
}
const reads = await page.evaluate(() => window.__reads);
const fautifs = [];
for (const v of Object.keys(reads)) for (const [pile, n] of Object.entries(reads[v])) if (!TOLERE.test(pile)) fautifs.push(`vue « ${v} » : ${n} lecture(s) de emp.team — ${pile.replace(/https?:\/\/[^/]+/, '')}`);
console.log('\nLectures de emp.team hors persistance/rôle : ' + (fautifs.length ? '❌ ' + fautifs.length : '✅ aucune'));
fautifs.slice(0, 12).forEach((x) => console.log('     ' + x));
if (fautifs.length) FAIL++;
if (errs.length) { console.log('❌ erreurs JS : ' + errs.length); errs.slice(0, 3).forEach((e) => console.log('     ' + e.slice(0, 160))); FAIL++; }
else console.log('Erreurs JS : ✅ 0');

await nav.close(); server.close();
console.log('\n' + (FAIL ? `❌ ÉQUIPES AFFICHÉES : ${FAIL} contrôle(s) en défaut` : '✅ ÉQUIPES AFFICHÉES : l\'équipe du mois partout, effectifs = PDF sur 4 mois'));
process.exit(FAIL ? 1 : 0);
