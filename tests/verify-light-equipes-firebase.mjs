// v9.903 / light v1.44 (Kevin 2026-09-11, mesuré LIVE run 34605702050) — GARDE : quand FIREBASE porte un
// teamHistory PÉRIMÉ (ancien import faux : Kevin en « 12 », GATTI en « 3 »…), la page light affiche quand
// même les équipes DU PDF (boards générés), et l'app (admin) RÉPARE Firebase en persistant cmc_e corrigé.
// Avant : la light lisait Firebase tel quel → « ton équipe : BJ Éq.12 » pour Kevin, « Éq.3 (14/19) » avec
// GATTI/FIA/COZZI… ; l'app corrigeait en mémoire seulement → Firebase restait faux pour toujours.
// Le test app⇄light existant (departs-compare) ABORTAIT Firebase → la light tombait sur les boards générés
// → égalité trompeuse (leçon #142 bis : nourrir la surface avec ce que Kevin a VRAIMENT dans Firebase).
//   node tests/verify-light-equipes-firebase.mjs
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
const KEY = '2026-8', PREF = '2026-09-';

globalThis.window = {};
await import(resolve(ROOT, 'tools/shared/planning-seed.js'));
await import(resolve(ROOT, 'tools/departs/boards-gen.js'));
const SEED = globalThis.window.CMC_PLANNING_SEED, G = globalThis.window.DEPARTS_GEN;
const MS = SEED.months[KEY];
const APP_VER = (fs.readFileSync(join(ROOT, 'index.html'), 'utf8').match(/var\s+APP_VER\s*=\s*"(v[0-9.]+)"/) || [])[1];
const genBoards = {}; Object.entries(G.boards).forEach(([k, b]) => { if (k.startsWith(PREF) && b.kind !== 'abs') genBoards[k] = b.people.map((p) => p.name).sort(); });
const genTeamOf = {}; Object.entries(genBoards).forEach(([k, names]) => names.forEach((n) => { genTeamOf[n] = k; }));

// ── Firebase PÉRIMÉ : chaque employé reçoit l'équipe d'un AUTRE (rotation), 0 familyHistory ───────
const teamIds = [...new Set(Object.values(MS.team))];
const staleEmps = MS.emps.map((e, i) => {
  const t = MS.team[e.id]; const wrong = t ? teamIds[(teamIds.indexOf(t) + 1) % teamIds.length] : null;
  const emp = { id: e.id, name: e.name, family: 'bj', teamHistory: {}, familyHistory: {} };
  if (wrong) emp.teamHistory[KEY] = wrong;
  return emp;
});
const kevinStale = staleEmps.find((e) => e.name === 'DESARZENS K');
const snapshot = { cmc_e: staleEmps, cmc_ov: { [KEY]: MS.ov }, ['cmc_ref_' + KEY]: { year: 2026, month: 8, rows: {}, importedAt: Date.now() - 3600000, parserVersion: APP_VER, seedApplied: APP_VER } };
const puts = []; let sseCount = 0;
async function firebaseRoute(route) {
  const rq = route.request(); const u = rq.url(); const m = rq.method();
  if (/identitytoolkit|securetoken/.test(u)) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ idToken: 't', localId: 'anon', expiresIn: '3600' }) });
  if (!/firebasedatabase\.app/.test(u)) return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  if (m === 'PUT' || m === 'PATCH' || m === 'POST') { let body = null; try { body = JSON.parse(rq.postData() || 'null'); } catch (e) {} puts.push({ u, m, body, t: Date.now() }); return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }); }
  if (m !== 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  if ((rq.headers()['accept'] || '').includes('text/event-stream')) { sseCount++; return route.fulfill({ status: 200, contentType: 'text/event-stream', body: 'event: keep-alive\ndata: null\n\n' }); }
  const key = decodeURIComponent((u.match(/\/cmcteams\/([^/?]+)\.json/) || [])[1] || '');
  if (!key) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(snapshot) });
  const v = Object.prototype.hasOwnProperty.call(snapshot, key) ? snapshot[key] : null;
  return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(v) });
}

let fails = 0;
const ok = (c, msg, detail) => { console.log((c ? '  ✅ ' : '  ❌ ') + msg + (detail ? ' — ' + detail : '')); if (!c) fails++; };
console.log(`Firebase simulé PÉRIMÉ : ${staleEmps.length} employés, teamHistory ${KEY} tous FAUX (Kevin → « ${kevinStale.teamHistory[KEY]} », attendu ${genTeamOf['DESARZENS K']}), cellules = seed`);
const browser = await chromium.launch({ headless: true });

// ── 1. LIGHT ──────────────────────────────────────────────────────────────────────────────────────
console.log('\n1. Page light nourrie par ce Firebase périmé');
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/firebasedatabase\.app|identitytoolkit|securetoken|kd-mc\.com|workers\.dev/, firebaseRoute);
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', (e) => errs.push(e.message));
  await page.addInitScript(() => { localStorage.setItem('cmc_dep_me', 'DESARZENS K'); });
  await page.goto(BASE + '/tools/departs/index.html', { waitUntil: 'load', timeout: 60000 });
  const live = await page.waitForFunction((k) => window._depLiveMonths && window._depLiveMonths[k], KEY, { timeout: 20000 }).then(() => true).catch(() => false);
  ok(live, 'les données LIVE Firebase (septembre) sont bien appliquées par la page (live gagne, comme chez Kevin)');
  await page.waitForTimeout(800);
  const st = await page.evaluate((PREF) => {
    const out = {}; Object.keys(BOARDS).forEach((k) => { const b = BOARDS[k]; if (k.startsWith(PREF) && b.kind !== 'abs') out[k] = { label: b.label, fam: b.fam, names: b.people.map((p) => p.name).sort() }; });
    return { boards: out, me: (typeof _depBoardOfMeLatest === 'function') ? _depBoardOfMeLatest() : null, sel: (document.getElementById('sel') || {}).value || null, txt: document.body.innerText.slice(0, 4000) };
  }, PREF);
  const keys = Object.keys(st.boards);
  ok(!keys.some((k) => /^\d{4}-\d{2}-\d{4}-\d{2}-/.test(k)), 'aucun identifiant de board doublé (« 2026-09-2026-09-3 »)', keys.filter((k) => /^\d{4}-\d{2}-\d{4}-\d{2}-/.test(k)).join(','));
  const missing = Object.keys(genBoards).filter((k) => !st.boards[k]); const extra = keys.filter((k) => !genBoards[k]);
  ok(!missing.length && !extra.length, `les ${Object.keys(genBoards).length} équipes de septembre sont celles du PDF (ni manquante, ni inventée)`, `manque ${missing.join(',') || '—'} · en trop ${extra.join(',') || '—'}`);
  let wrong = 0; const wrongD = []; Object.keys(genBoards).forEach((k) => { const b = st.boards[k]; if (!b || b.names.join('|') !== genBoards[k].join('|')) { wrong++; wrongD.push(k + ' +[' + (b ? b.names.filter((n) => !genBoards[k].includes(n)).join(',') : '?') + '] -[' + genBoards[k].filter((n) => !b || !b.names.includes(n)).join(',') + ']'); } });
  ok(wrong === 0, 'chaque équipe contient EXACTEMENT les personnes du PDF (Firebase périmé ignoré)', wrong + ' équipe(s) fausse(s) ' + wrongD.slice(0, 4).join(' · '));
  const k3 = genTeamOf['DESARZENS K'];
  ok(st.me === k3, 'ton équipe (Kevin) = ' + k3, 'obtenu ' + st.me);
  ok(st.boards[k3] && /BJ Éq\.3/.test(st.boards[k3].label) && st.boards[k3].fam === G.boards[k3].fam, 'libellé + famille du board de Kevin = ceux du PDF', st.boards[k3] && st.boards[k3].label);
  ok(!/Éq\.12 \(16\/22\)/.test(st.txt), 'la page ne dit plus « ton équipe : BJ Éq.12 (16/22) »');
  ok(errs.length === 0, '0 erreur JS', errs.slice(0, 2).join(' | '));
  await ctx.close();
}

// ── 2. APP (admin) ────────────────────────────────────────────────────────────────────────────────
console.log('\n2. App CMCteams (Kevin admin) nourrie par ce Firebase périmé → répare Firebase');
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/firebasedatabase\.app|identitytoolkit|securetoken|kd-mc\.com|workers\.dev/, firebaseRoute);
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', (e) => errs.push(e.message));
  const DEVICE = { cmc_dver: '30', cmc_v706_total_wiped: '1', cmc_fam_restored_v116: '1', cmc_v805_famreset: '1', cmc_uid: 'U11804', cmc_lastact: String(Date.now()), cmc_seen_v10_678: '1', cmc_cookies_consent: '1' };
  await page.addInitScript((d) => { Object.keys(d).forEach((k) => localStorage.setItem(k, d[k])); }, DEVICE);
  const t0 = Date.now();
  await page.goto(BASE + '/index.html', { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.A && Array.isArray(A.employees) && typeof dc === 'function', { timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { A.year = 2026; A.month = 8; A.view = 'departs'; dc(); });
  const deadline = Date.now() + 20000; let put = null;
  while (Date.now() < deadline && !put) { put = puts.find((p) => /\/cmc_e\.json/.test(p.u) && Array.isArray(p.body) && p.t >= t0); if (!put) await page.waitForTimeout(500); }
  ok(!!put, 'l\'app ÉCRIT cmc_e dans Firebase (≤ 20 s après le boot) pour réparer les équipes', put ? put.m + ' ' + put.body.length + ' employés' : 'aucune écriture');
  if (put) {
    const byName = {}; put.body.forEach((e) => { byName[e.name] = e; });
    let bad = 0, checked = 0; Object.keys(genTeamOf).forEach((n) => { const e = byName[n]; if (!e) return; checked++; if (((e.teamHistory || {})[KEY] || '') !== genTeamOf[n]) bad++; });
    ok(bad === 0 && checked >= 200, `le cmc_e écrit porte l'équipe du PDF pour chaque personne (${checked} vérifiées)`, bad + ' faux');
    ok(byName['DESARZENS K'] && byName['DESARZENS K'].teamHistory[KEY] === genTeamOf['DESARZENS K'] && byName['DESARZENS K'].familyHistory[KEY] === 'bj', 'Kevin persisté en ' + genTeamOf['DESARZENS K'] + ' / bj');
    const cells = put.body.some((e) => e.codes || e.ov); ok(!cells, 'aucune cellule de planning dans cmc_e (reproduction fidèle : les codes ne bougent pas)');
  }
  await page.waitForTimeout(Math.max(1000, t0 + 14000 - Date.now()));   // 14 s après le boot : les 4 écritures historiques du boot sont passées
  const all = puts.filter((p) => /\/cmc_e\.json/.test(p.u));
  const last = all[all.length - 1];
  ok(all.length <= 8, 'pas de rafale d\'écritures cmc_e (ancien code : 4 au boot, ici 1 de plus par mois corrigé)', all.length + ' au total · à ' + all.map((p) => ((p.t - t0) / 1000).toFixed(1) + ' s').join(', ') + ' · SSE (re)connexions : ' + sseCount);
  ok(last && Date.now() - last.t >= 4000, 'les écritures s\'arrêtent (rien depuis ≥ 4 s : pas de boucle SSE→écriture)', last ? Math.round((Date.now() - last.t) / 1000) + ' s depuis la dernière' : '—');
  if (last) { const kv = (last.body || []).find((e) => e.name === 'DESARZENS K'); ok(kv && kv.teamHistory[KEY] === genTeamOf['DESARZENS K'], 'la DERNIÈRE écriture est la bonne (Firebase finit juste)'); }
  ok(errs.length === 0, '0 erreur JS', errs.slice(0, 2).join(' | '));
  await ctx.close();
}

await browser.close(); server.close();
console.log(fails ? `\n❌ ${fails} contrôle(s) en échec` : '\n✅ Firebase périmé : la light montre le PDF, l\'app répare Firebase');
process.exit(fails ? 1 : 0);
