// v9.901 (Kevin 2026-09-11 « Toutes les équipes sont mélangées. Relis tes documents, savoir comment
// ça marche et Corige et vérifie réel ») — GARDE : sur l'APPAREIL DE KEVIN (septembre LIVE et à jour,
// employés Firebase SANS familyHistory du mois, teamHistory périmé, familles/équipes DEF_EMP figées
// toutes fausses), chaque vue affiche l'ÉQUIPE et la FAMILLE DU MOIS (= seed = PDF), jamais les
// valeurs d'origine figées. Mesuré avant le fix sur les vraies données de Kevin (run voir 34601813763) :
// 56/247 personnes en équipe affichées sous la famille d'origine ; vue Employés : « Mon équipe » vide
// (A.user.team figé), cartes « Roul. Éq.7 » pour un membre de BJ Éq.3, 55-61 personnes/mois dans la
// mauvaise section ; Départs : équipes rangées dans le dossier famille du premier membre.
//   A. modèle : familyForMonth / teamForMonth = équipe du board + sa famille, pour TOUS
//   B. vue Employés : « Mon équipe » = membres de l'équipe de Kevin ce mois ; miroir ; chaque carte
//      porte l'équipe du mois ET sa famille, dans la section de cette famille
//   C. vue Départs : chaque équipe sous le dossier de SA famille
//   D. vue Planning : chaque bloc d'équipe sous la famille de l'équipe ; puces = effectifs du mois
//   node tests/verify-equipes-mois-affichees.mjs
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
  res.writeHead(200, { 'content-type': MIME[(file.match(/\.[a-z0-9]+$/i) || [''])[0].toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const APP = `http://127.0.0.1:${server.address().port}/CMCteams/index.html`;
const KEY = '2026-8', Y = 2026, M = 8, PREF = '2026-09-';

globalThis.window = {};
await import(resolve(ROOT, 'tools/shared/planning-seed.js'));
await import(resolve(ROOT, 'tools/departs/boards-gen.js'));
const SEED = globalThis.window.CMC_PLANNING_SEED, G = globalThis.window.DEPARTS_GEN;
const MS = SEED.months[KEY];
const nameOf = Object.fromEntries((MS.emps || []).map((e) => [e.id, e.name]));
const seedTeamByName = {}, seedFamByName = {};
Object.entries(MS.team).forEach(([id, t]) => { seedTeamByName[nameOf[id] || id] = t; });
Object.entries(MS.fam || {}).forEach(([id, f]) => { seedFamByName[nameOf[id] || id] = f; });
const boardFam = {}; Object.entries(G.boards).forEach(([k, b]) => { if (k.startsWith(PREF) && b.kind !== 'abs') boardFam[k.slice(PREF.length)] = b.fam; });
const WORK = Object.keys(seedTeamByName).filter((n) => boardFam[seedTeamByName[n]]);
const KEVIN_TEAM = seedTeamByName['DESARZENS K'], MIRROR_TEAM = MS.mirror[KEVIN_TEAM];
const teamMembers = (t) => Object.keys(seedTeamByName).filter((n) => seedTeamByName[n] === t).sort();
const FAM_OF_SECTION = { 'JEUX AMÉRICAINS': 'bj', 'JEUX EUROPÉEN': 'roulettes', 'BACCARA': 'baccara', 'GROUPE OUVERT': 'cmc', 'CADRES': 'cadres' };
const FAM_OF_LABEL = { 'Jeux américains': 'bj', 'Jeux européen': 'roulettes', 'Baccara': 'baccara', 'Groupe ouvert': 'cmc', 'Cadres': 'cadres' };

let fails = 0;
const ok = (c, msg) => { console.log((c ? '  ✅ ' : '  ❌ ') + msg); if (!c) fails++; };

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/firebasedatabase\.app/, (route) => { const rq = route.request(); route.fulfill({ status: 200, contentType: 'application/json', body: rq.method() === 'GET' ? 'null' : '{}' }); });
const DEVICE = { cmc_dver: '30', cmc_v706_total_wiped: '1', cmc_fam_restored_v116: '1', cmc_v805_famreset: '1', cmc_uid: 'U11804', cmc_lastact: String(Date.now()), cmc_seen_v10_678: '1', cmc_cookies_consent: '1' };
const page = await ctx.newPage();
const errs = []; page.on('pageerror', (e) => errs.push(e.message));
await page.addInitScript((d) => { Object.keys(d).forEach((k) => localStorage.setItem(k, d[k])); }, DEVICE);
await page.goto(APP, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => window.A && Array.isArray(A.employees) && window.CMC_PLANNING_SEED && typeof dc === 'function', { timeout: 30000 });
await page.waitForTimeout(2500);

// ── 1er passage : fabriquer l'état de l'APPAREIL DE KEVIN, puis recharger ─────────────────────
const planted = await page.evaluate(([KEY, ov, parser]) => {
  const fams = ['bj', 'roulettes', 'cmc'];
  let n = 0;
  A.employees.forEach((e, i) => {
    if (!e || /^P\d/.test(e.id)) return;
    if (e.familyHistory) delete e.familyHistory[KEY];
    if (e.ecoleRoulette) delete e.ecoleRoulette[KEY];
    if (!e.teamHistory) e.teamHistory = {};
    e.teamHistory[KEY] = i % 2 ? '1' : 'r4';            // équipe PÉRIMÉE (ancien import faux)
    e.family = fams[i % 3];                              // famille d'origine DEF_EMP brouillée
    e.team = i % 2 ? 'c9' : '12';                        // équipe DEF_EMP brouillée
    n++;
  });
  ls('cmc_e', A.employees);
  const allOv = lg('cmc_ov', {}) || {}; allOv[KEY] = ov; ls('cmc_ov', allOv);          // septembre LIVE = cellules du seed
  ls('cmc_ref_' + KEY, { year: 2026, month: 8, rows: {}, importedAt: Date.now() - 86400000, parserVersion: parser, seedApplied: parser });
  localStorage.removeItem('cmc_team_mirror_' + KEY);
  localStorage.removeItem('cmc_admin_view_state');
  return n;
}, [KEY, MS.ov, SEED.parser]);
console.log('Appareil de Kevin simulé : ' + planted + ' employés brouillés (famille/équipe figées fausses, teamHistory périmé, 0 familyHistory), septembre live à jour.');
await page.reload({ waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => window.A && Array.isArray(A.employees) && typeof dc === 'function', { timeout: 30000 });
await page.waitForTimeout(3000);
await page.evaluate(([Y, M]) => { A.year = Y; A.month = M; A.view = 'employees'; dc(); }, [Y, M]);
await page.waitForTimeout(1800);

// ── A. modèle ─────────────────────────────────────────────────────────────────────────────────
const model = await page.evaluate(([KEY, Y, M]) => A.employees.filter((e) => e && !/^P\d/.test(e.id)).map((e) => ({ n: e.name, tm: teamForMonth(e, Y, M, { strict: true }), fm: familyForMonth(e, Y, M), live: !!(A.overrides[KEY] && A.overrides[KEY][e.id]) })), [KEY, Y, M]);
const byName = {}; model.forEach((x) => { byName[x.n] = byName[x.n] || x; });
let teamOk = 0, famOk = 0; const teamBad = [], famBad = [];
WORK.forEach((n) => { const x = byName[n]; const t = seedTeamByName[n]; if (x && x.tm === PREF + t) teamOk++; else teamBad.push(n + ' attendu ' + t + ' obtenu ' + (x && x.tm)); if (x && x.fm === boardFam[t]) famOk++; else famBad.push(n + ' attendu ' + boardFam[t] + ' obtenu ' + (x && x.fm)); });
console.log('\nA. Modèle (septembre live, appareil de Kevin)');
ok(teamOk === WORK.length, `équipe du mois = board pour ${teamOk}/${WORK.length} personnes en équipe de travail` + (teamBad.length ? ' — ' + teamBad.slice(0, 5).join(' | ') : ''));
ok(famOk === WORK.length, `famille du mois = famille de l'équipe pour ${famOk}/${WORK.length}` + (famBad.length ? ' — ' + famBad.slice(0, 5).join(' | ') : ''));
const absFamBad = Object.keys(seedFamByName).filter((n) => !boardFam[seedTeamByName[n]] && byName[n] && byName[n].fm !== seedFamByName[n]);
ok(absFamBad.length === 0, `famille du mois = section du PDF pour les absents/hors équipe (${absFamBad.length} écart)` + (absFamBad.length ? ' — ' + absFamBad.slice(0, 5).map((n) => n + ' ' + seedFamByName[n] + '→' + byName[n].fm).join(' | ') : ''));

// ── B. vue Employés ───────────────────────────────────────────────────────────────────────────
const emps = await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const s = _adminViewState(); ['primary', 'mirror', 'fam:bj', 'fam:roulettes', 'fam:baccara', 'fam:cmc', 'fam:cadres', 'noteam:nopresence'].forEach((k) => { s[k] = true; }); _setAdminViewState(s); dc(); await sleep(800);
  return document.getElementById('content').innerText;
});
const L = emps.split('\n').map((l) => l.trim());
const cards = []; let section = null;
for (let i = 0; i < L.length; i++) {
  const h = L[i].replace(/^[^A-ZÉ]+/, '').toUpperCase();
  // un en-tête de section est suivi (à 1 ou 2 lignes) de son compteur numérique — une ligne de
  // carte « 🃏 Jeux américains » (suivie de ⚠️ / ›) n'en est pas un
  if (/^(MON ÉQUIPE|ÉQUIPE MIROIR|JEUX AMÉRICAINS|JEUX EUROPÉEN|BACCARA|GROUPE OUVERT|CADRES|PAS DE PLANNING CE MOIS)$/.test(h) && (/^\d+$/.test(L[i + 1] || '') || /^\d+$/.test(L[i + 2] || ''))) { section = h; continue; }
  if (/^(U\d{5}|U_TMP_\S+|P\d{5})$/.test(L[i]) && i > 0 && section) {
    const name = L[i - 1].replace(/\s*(ADMIN.*)?\s*⏳?\s*$/, '').replace(/ ✓$/, '').replace(/\s+(CHEF|★)\s*$/g, '').replace(/\s+(CHEF|★)\s*$/g, '').trim();
    cards.push({ name, id: L[i], team: L[i + 2] || '', famLabel: (L[i + 4] || '').replace(/^\S+\s/, ''), section });
  }
}
console.log('\nB. Vue Employés (admin, toutes sections ouvertes) — ' + cards.length + ' cartes');
const mine = cards.filter((c) => c.section === 'MON ÉQUIPE').map((c) => c.name).sort();
ok(JSON.stringify(mine) === JSON.stringify(teamMembers(KEVIN_TEAM)), `« Mon équipe » = BJ Éq.${KEVIN_TEAM} du PDF : ${mine.join(', ') || '(vide)'}`);
const mir = cards.filter((c) => c.section === 'ÉQUIPE MIROIR').map((c) => c.name).sort();
ok(JSON.stringify(mir) === JSON.stringify(teamMembers(MIRROR_TEAM)), `« Équipe miroir » = Éq.${MIRROR_TEAM} du PDF : ${mir.length} membres`);
const badCard = [], badSection = [];
cards.forEach((c) => {
  const t = seedTeamByName[c.name]; if (!t || !boardFam[t]) return;
  const label = (G.boards[PREF + t] || {}).label || '';
  if (c.team !== label) badCard.push(c.name + ' carte=« ' + c.team + ' » attendu « ' + label + ' »');
  const famCard = FAM_OF_LABEL[c.famLabel];
  const famSec = c.section === 'MON ÉQUIPE' || c.section === 'ÉQUIPE MIROIR' ? boardFam[t] : FAM_OF_SECTION[c.section];
  if (famCard !== boardFam[t] || famSec !== boardFam[t]) badSection.push(c.name + ' section=' + c.section + ' famille carte=' + c.famLabel + ' attendu ' + boardFam[t]);
});
const seen = cards.filter((c) => boardFam[seedTeamByName[c.name]]).length;
if (process.env.DEBUG_EQ) { console.log('  cartes hors seed :', cards.filter((c) => !seedTeamByName[c.name]).map((c) => c.name + '/' + c.id + '/' + c.section).slice(0, 40).join(' ; ')); console.log('  miroir :', mir.join(', '), ' attendu :', teamMembers(MIRROR_TEAM).join(', ')); }
ok(seen === WORK.length, `${seen}/${WORK.length} personnes en équipe de travail retrouvées sur les cartes`);
ok(badCard.length === 0, `chaque carte porte l'équipe DU MOIS (${badCard.length} écart)` + (badCard.length ? ' — ' + badCard.slice(0, 4).join(' | ') : ''));
ok(badSection.length === 0, `chaque carte est dans la section de la famille de son équipe (${badSection.length} écart)` + (badSection.length ? ' — ' + badSection.slice(0, 4).join(' | ') : ''));

// ── C. vue Départs ────────────────────────────────────────────────────────────────────────────
const dep = await page.evaluate(async () => { const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); A.view = 'departs'; dc(); await sleep(1500); ['bj', 'roulettes', 'baccara', 'cmc', 'cadres'].forEach((f) => { window._depFamOpen[f] = true; }); dc(); await sleep(600); return document.getElementById('content').innerText; });
let fam = null; const depBad = new Set(); let depTeams = new Set();
dep.split('\n').forEach((l) => {
  const h = l.trim().replace(/^[^A-ZÉ]+/, '').toUpperCase().replace(/\s+\d+$/, '');
  if (FAM_OF_SECTION[h]) { fam = FAM_OF_SECTION[h]; return; }
  const mm = l.match(/— (BJ|Roul\.|CMC) Éq\.(\d+)/);
  if (mm && fam) { const f2 = mm[1] === 'BJ' ? 'bj' : mm[1] === 'CMC' ? 'cmc' : 'roulettes'; depTeams.add(mm[1] + mm[2]); if (f2 !== fam) depBad.add(l.trim() + ' → dossier ' + fam); }
});
console.log('\nC. Vue Départs (dossiers famille ouverts) — ' + depTeams.size + ' équipes');
ok(depTeams.size >= 30, `${depTeams.size} équipes de travail affichées (≥ 30 attendu)`);
ok(depBad.size === 0, `chaque équipe est sous le dossier de SA famille (${depBad.size} écart)` + (depBad.size ? ' — ' + [...depBad].slice(0, 4).join(' | ') : ''));

// ── D. vue Planning ───────────────────────────────────────────────────────────────────────────
const plan = await page.evaluate(async () => { const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); A.view = 'planning'; dc(); await sleep(1500); Object.keys(window._planFamOpen || {}).forEach((f) => { _planFamOpen[f] = true; }); dc(); await sleep(800); return document.getElementById('content').innerText; });
fam = null; const planBad = new Set(); const planTeams = new Set(); let inAutres = false;
plan.split('\n').forEach((l) => {
  const t = l.trim();
  if (/^AUTRES ÉQUIPES$/i.test(t.replace(/^[^A-ZÉ]+/, ''))) { inAutres = true; return; }
  const h = t.replace(/^[^A-ZÉ]+/, '').toUpperCase().replace(/\s+[·\d].*$/, '').trim();
  if (inAutres && FAM_OF_SECTION[h]) { fam = FAM_OF_SECTION[h]; return; }
  const mm = t.match(/— (BJ|Roul\.|CMC) Éq\.(\d+)/);
  if (mm && inAutres && fam) { const f2 = mm[1] === 'BJ' ? 'bj' : mm[1] === 'CMC' ? 'cmc' : 'roulettes'; planTeams.add(mm[1] + mm[2]); if (f2 !== fam) planBad.add(t + ' → famille ' + fam); }
});
const chips = {}; (plan.match(/(Amér\.|Europ\.|Ouvert|Bac\.)\n(\d+)/g) || []).forEach((c) => { const [a, b] = c.split('\n'); chips[a] = +b; });
const actives = await page.evaluate(([Y, M]) => { const c = {}; A.employees.forEach((e) => { if (!isEmpActive(e, Y, M)) return; let f = familyForMonth(e, Y, M) || 'bj'; if (f === 'baccara') f = 'cmc'; c[f] = (c[f] || 0) + 1; }); return c; }, [Y, M]);
const famCount = (f) => actives[f] || 0;
console.log('\nD. Vue Planning (familles ouvertes) — ' + planTeams.size + ' équipes hors « Ma section », puces ' + JSON.stringify(chips));
ok(planTeams.size >= 30, `${planTeams.size} équipes de travail affichées (≥ 30 attendu)`);
ok(planBad.size === 0, `chaque bloc d'équipe est sous la famille de l'équipe (${planBad.size} écart)` + (planBad.size ? ' — ' + [...planBad].slice(0, 4).join(' | ') : ''));
ok(chips['Amér.'] === famCount('bj') && chips['Europ.'] === famCount('roulettes'), `puces = effectifs de la famille DU MOIS (Amér. ${chips['Amér.']} vs ${famCount('bj')}, Europ. ${chips['Europ.']} vs ${famCount('roulettes')})`);
ok(!chips['Bac.'], `plus de puce « Bac. » figée (famille d'origine, pas une section du PDF)`);

ok(errs.length === 0, `0 erreur JS (${errs.length})` + (errs.length ? ' — ' + errs[0] : ''));
await browser.close(); server.close();
console.log(fails ? `\n❌ ${fails} contrôle(s) en échec` : '\n✅ équipes et familles DU MOIS partout, sur un appareil comme celui de Kevin');
process.exit(fails ? 1 : 0);
