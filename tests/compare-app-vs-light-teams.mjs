/* PREUVE app == light pour l'AFFICHAGE des ÉQUIPES (Kevin 2026-07-08 « l'affichage,
 * les horaires, les départs, les équipes ne vont pas du tout »). En plus des NUMÉROS
 * de départ (compare-app-vs-light-departs), on vérifie ici l'APPARTENANCE : chaque
 * équipe de travail affichée par l'app (teamHistory[key]) doit contenir EXACTEMENT les
 * mêmes employés que le board validé (= page light), juillet ET août. Sinon les départs
 * (boards) et le tableau d'équipes (détection) se contredisent — le bug v9.860→862.
 * Serveur statique embarqué (mappe /CMCteams/<x> → repo, chemins absolus lesson #102).
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MONTHS = [{ y: 2026, m: 6, pre: '2026-07-' }, { y: 2026, m: 7, pre: '2026-08-' }];
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
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;
const G = JSON.parse(fs.readFileSync(join(ROOT, 'tools/departs/boards-gen.js'), 'utf8').replace(/^[^=]*=/, '').replace(/;\s*$/, ''));

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 430, height: 2200 } });
await ctx.route('**/*', route => { const u = route.request().url(); if (/firebasedatabase|identitytoolkit|securetoken|googleapis|kd-mc\.com|workers\.dev|__notify/.test(u)) return route.abort(); return route.continue(); });
await ctx.addInitScript(() => { try { localStorage.setItem('cmc_uid', 'U11804'); localStorage.setItem('cmc_last_uid', 'U11804'); localStorage.setItem('cmc_lastact', String(Date.now())); localStorage.setItem('cmc_seen_v10_678', '1'); } catch (e) {} });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
await p.goto(`${BASE}/CMCteams/index.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForTimeout(2500);
const appVer = await p.evaluate(() => (typeof APP_VER !== 'undefined' ? APP_VER : '?'));

let totalFail = 0;
console.log(`== AFFICHAGE ÉQUIPES app (v${appVer.replace(/^v/, '')}) == boards (page light) ==`);
for (const M of MONTHS) {
  await p.evaluate(({ y, m }) => { A.year = y; A.month = m; try { _cmcApplyPlanningSeed(); } catch (e) {} A.view = 'plan'; try { dc(); } catch (e) {} }, M);
  await p.waitForTimeout(3500);
  const res = await p.evaluate(({ y, m }) => {
    const key = y + '-' + m; const grp = {};
    (A.employees || []).forEach(e => { const t = e && e.teamHistory && e.teamHistory[key]; if (t) { (grp[t] = grp[t] || []).push(e.name); } });
    const pl = (typeof gpl === 'function') ? gpl() : (A.overrides[key] || {}); const days = getDays(y, m);
    const ABS = { CP: 'conges', CRH: 'conges', CDP: 'conges', CDH: 'conges', M: 'maladie', MAL: 'maladie', AF: 'formation', DEPL: 'deplacement', DEP: 'deplacement' };
    let conges = 0; (A.employees || []).forEach(e => { const row = pl[e.id] || {}; let worked = 0, by = {}, tot = 0; for (let d = 1; d <= days; d++) { let c = row[d]; if (!c) continue; let u = String(c).toUpperCase().replace(/[C'"*:]+$/g, ''); if (u === 'RH' || u === 'R') continue; if (ABS[u]) { by[ABS[u]] = (by[ABS[u]] || 0) + 1; tot++; } else worked++; } if (worked > 0 || tot < 1) return; let best = null, bn = 0; Object.keys(by).forEach(t => { if (by[t] > bn) { bn = by[t]; best = t; } }); if (best === 'conges') conges++; });
    const e = (A.employees || []).find(x => x && x.id === 'U11804');
    return { grp, conges, kevinTeam: e && e.teamHistory ? e.teamHistory[key] : null };
  }, M);
  const boardTeams = Object.keys(G.boards).filter(id => id.indexOf(M.pre) === 0 && G.boards[id].kind !== 'abs');
  const fails = [];
  boardTeams.forEach(id => {
    const want = (G.boards[id].people || []).map(x => x.name).sort();
    const got = (res.grp[id] || []).slice().sort();
    if (JSON.stringify(want) !== JSON.stringify(got)) fails.push(`${id}: board=${want.length} app=${got.length}`);
  });
  const congesWant = G.boards[M.pre + 'conges'] ? G.boards[M.pre + 'conges'].people.length : 0;
  const kevinBoard = G.boards[res.kevinTeam];
  const kevinOK = kevinBoard && kevinBoard.kind !== 'abs';
  console.log(`\n  ${M.pre} : ${boardTeams.length} équipes · écarts d'appartenance: ${fails.length}${fails.length ? ' → ' + fails.slice(0, 6).join(' | ') : ''}`);
  console.log(`    Congés app=${res.conges} board=${congesWant} ${res.conges === congesWant ? '✅' : '⚠️'}`);
  console.log(`    Kevin équipe: ${res.kevinTeam} ${kevinOK ? '(' + kevinBoard.people.length + ' chefs) ✅' : '❌'}`);
  totalFail += fails.length + (kevinOK ? 0 : 1);
}
console.log('\n  erreurs JS:', errs.length ? errs.slice(0, 4) : '(aucune)');
const clean = totalFail === 0 && errs.length === 0;
console.log('\n' + (clean ? '✅ AFFICHAGE ÉQUIPES == boards (page light), 0 écart d\'appartenance, 0 erreur JS.' : '❌ ÉCARTS D\'AFFICHAGE — à corriger.'));
await browser.close();
server.close();
process.exit(clean ? 0 : 1);
