/* INTÉGRITÉ DÉPARTS — Kevin 2026-07-10 « l'algo respecté pour tout le monde, chaque personne
 * de chaque équipe, pareil pour les horaires ».
 * Charge la VRAIE page light et, pour CHAQUE équipe / CHAQUE jour, vérifie :
 *  (1) 0 DOUBLON : deux personnes présentes n'ont jamais le même numéro de départ le même jour ;
 *  (2) ∈ SÉQUENCE : chaque numéro rendu appartient à une SEQ_N valide (table complète 2-13,
 *      miroir exact de index.html — les grandes équipes CMC 8-13 pers sont donc VRAIMENT vérifiées,
 *      alors qu'elles étaient silencieusement sautées quand la table s'arrêtait à 7) ;
 *  (3) HORAIRES : un numéro de départ n'apparaît QUE sur un jour de travail. « Travail » = le MÊME
 *      isWork() que la page (PRT « Prêt » COMPTE comme travail — décision Kevin 2026-07-10 « garde
 *      son numéro » ; RRT/RH/R/CP/M/absences ne comptent pas → jamais de numéro dessus).
 * Serveur HTTP EMBARQUÉ (lesson #65). Complète verify-real-departs-render.mjs (qui teste le
 * GLISSEMENT +1) : ici on teste la PERMUTATION propre + les horaires.
 */
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, extname } from 'node:path';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'tools', 'departs');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.txt': 'text/plain', '.css': 'text/css' };
// Miroir EXACT de SEQS dans index.html (2-13).
const SEQS = { 1: [1], 2: [1, 2], 3: [1, 3, 2], 4: [1, 4, 2, 3], 5: [1, 4, 2, 3, 5], 6: [1, 6, 4, 2, 3, 5], 7: [1, 6, 4, 2, 7, 3, 5], 8: [1, 6, 4, 2, 7, 3, 8, 5], 9: [1, 6, 4, 9, 2, 7, 3, 8, 5], 10: [1, 6, 4, 9, 2, 7, 3, 8, 5, 10], 11: [1, 6, 4, 9, 2, 11, 7, 3, 8, 5, 10], 12: [1, 6, 4, 9, 2, 11, 7, 3, 12, 8, 5, 10], 13: [1, 6, 4, 9, 2, 11, 7, 3, 13, 8, 5, 10, 12] };
// isWork() IDENTIQUE à tools/departs/index.html (PRT compte comme travail — Kevin « garde son numéro »).
const NONWORK = ['RH', 'R', 'CP', 'M', 'AF', 'RRT', 'PAT', 'MT', 'AT', 'FL', 'ABS', 'ABI', 'CSS', 'DEPL', 'DEP', 'SS'];
const isWork = c => !!c && NONWORK.indexOf(c) < 0;

const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p === '/' || p === '') p = '/index.html';
  try { const body = readFileSync(join(DIR, p)); res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end('404'); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const PORT = server.address().port;
const browser = await chromium.launch();
const ctx = await browser.newContext();
  // Hors ligne SAUF le serveur local qui sert la page : sur un runner AVEC réseau,
  // `networkidle` n'arrive JAMAIS (la page rappelle Firebase en boucle) → timeout 30 s
  // et un rouge qui n'a rien à voir avec le rendu (leçon #220).
  await ctx.route(/^https?:\/\//, (r) => (/^https?:\/\/(127\.0\.0\.1|localhost)[:\/]/.test(r.request().url()) ? r.continue() : r.abort()));
const page = await ctx.newPage();
const jsErrors = [];
page.on('pageerror', e => jsErrors.push(String(e)));
await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'load' });

const boards = await page.evaluate(() => Object.keys(window.BOARDS)
  .filter(id => window.BOARDS[id].kind !== 'abs')
  .map(id => ({ id, label: window.BOARDS[id].label })));

let fails = [], teams = 0, dayChecks = 0, horaireChecks = 0, people = 0;
const seqSizes = Object.keys(SEQS).map(Number).sort((a, b) => a - b);

for (const bd of boards) {
  teams++;
  const g = await page.evaluate((id) => {
    window.BID = id; load(); render();
    const rows = [...document.querySelectorAll('tbody tr')]; const days = window.B.days; const out = [];
    for (const tr of rows) {
      const tds = [...tr.children]; const name = tds[0].textContent.replace(/^⭐\s*/, '').trim(); const cells = [];
      for (let d = 1; d <= days; d++) {
        const td = tds[d]; const de = td ? td.querySelector('span.dep') : null; const dep = de ? parseInt(de.textContent, 10) : null;
        let code = td ? td.textContent : ''; if (de) code = code.replace(de.textContent, ''); code = code.replace(/·/g, '').trim();
        cells.push({ code, dep });
      }
      out.push({ name, cells });
    }
    return { days, people: out };
  }, bd.id);

  const active = g.people.filter(p => p.cells.some(c => isWork(c.code)));
  people += active.length;
  for (let d = 0; d < g.days; d++) {
    // (3) HORAIRES : un numéro ⇒ jour de travail (isWork, PRT inclus)
    for (const p of active) {
      const c = p.cells[d].code, dep = p.cells[d].dep;
      horaireChecks++;
      if (dep != null && !isWork(c)) fails.push(`${bd.label} | ${p.name} J${d + 1} : numéro de départ ${dep} sur un jour NON travaillé (${c || 'vide'})`);
    }
    const present = active.filter(p => p.cells[d].dep != null);
    if (!present.length) continue;
    dayChecks++;
    const deps = present.map(p => p.cells[d].dep).sort((a, b) => a - b);
    // (1) 0 doublon
    const dup = deps.filter((v, i) => i > 0 && v === deps[i - 1]);
    if (dup.length) fails.push(`${bd.label} J${d + 1} : DOUBLON numéro ${[...new Set(dup)].join(',')} (${present.map(p => p.name + '=' + p.cells[d].dep).join(', ')})`);
    // (2) ∈ SEQ_N : N = plus petite taille connue qui contient le max ET ≥ nb présents
    const maxDep = Math.max(...deps);
    const N = seqSizes.find(s => s >= present.length && SEQS[s].includes(maxDep));
    if (!N) { fails.push(`${bd.label} J${d + 1} : numéro max ${maxDep} hors de toute SEQ connue (présents=${present.length})`); continue; }
    const seqN = SEQS[N];
    const outOf = deps.filter(x => !seqN.includes(x));
    if (outOf.length) fails.push(`${bd.label} J${d + 1} : numéro(s) ${outOf.join(',')} hors SEQ_${N}=[${seqN}]`);
  }
}

console.log('== INTÉGRITÉ DÉPARTS — page light réelle (v' + (await page.evaluate(() => (typeof APP_VER !== 'undefined' ? APP_VER : '?'))) + ') ==');
console.log(`  Équipes: ${teams} · personnes actives: ${people} · jours-équipe: ${dayChecks} · contrôles horaires: ${horaireChecks}`);
console.log(`  Erreurs JS: ${jsErrors.length ? jsErrors.join(' | ') : 'aucune'}`);
if (fails.length) {
  console.log('❌ VIOLATIONS (' + fails.length + ') :');
  fails.slice(0, 40).forEach(f => console.log('   ❌ ' + f));
  await browser.close(); server.close(); process.exit(1);
}
console.log('✅ Chaque personne de chaque équipe : 0 doublon, numéros ∈ séquence (toutes tailles 2-13), départ uniquement sur jour travaillé (PRT = travail). Horaires respectés.');
if (jsErrors.length) { await browser.close(); server.close(); process.exit(1); }
await browser.close(); server.close(); process.exit(0);
