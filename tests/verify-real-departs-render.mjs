/* VÉRIFICATION RÉELLE (Kevin 2026-07-09 « Vérifie tout réel à la place / à ma place ») :
 * charge la VRAIE page light des départs (tools/departs/index.html + boards-gen.js déployés)
 * dans un vrai navigateur headless, affiche CHAQUE équipe, lit les numéros de départ
 * RÉELLEMENT PEINTS à l'écran (les <span class='dep'> du DOM, pas un calcul de mon côté),
 * et vérifie la règle EXACTE de Kevin sur TOUTES les équipes / CHAQUE personne :
 *   « 1er cycle 1-6-4-2 → 2e cycle 6-4-2-3 → 3e cycle 4-2-3-5 … » = chaque jour de travail
 *   consécutif, à effectif constant, la rotation glisse d'EXACTEMENT +1 dans la suite SEQ_N.
 * + dump détaillé de l'équipe de Kevin (DESARZENS K).
 * Serveur HTTP EMBARQUÉ dans le process (lesson #65 : pas de python externe tué en fin de Bash).
 */
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, extname } from 'node:path';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'tools', 'departs');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.txt': 'text/plain', '.css': 'text/css' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p === '/' || p === '') p = '/index.html';
  try {
    const body = readFileSync(join(DIR, p));
    res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end('404'); }
});

const SEQS = { 1: [1], 2: [1, 2], 3: [1, 3, 2], 4: [1, 4, 2, 3], 5: [1, 4, 2, 3, 5], 6: [1, 6, 4, 2, 3, 5], 7: [1, 6, 4, 2, 7, 3, 5] };

await new Promise(r => server.listen(0, '127.0.0.1', r));
const PORT = server.address().port;
const browser = await chromium.launch();
const page = await browser.newPage();
const jsErrors = [];
page.on('pageerror', e => jsErrors.push(String(e)));
await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'networkidle' });

// Liste des boards de TRAVAIL (kind != abs) réellement chargés par la page.
const boards = await page.evaluate(() => Object.keys(window.BOARDS)
  .filter(id => window.BOARDS[id].kind !== 'abs')
  .map(id => ({ id, label: window.BOARDS[id].label, days: window.BOARDS[id].days })));

let fails = [];
let totalTeams = 0, totalChecks = 0;
let kevinDump = null;

for (const bd of boards) {
  totalTeams++;
  // Afficher CETTE équipe (comme un clic utilisateur), puis lire le DOM rendu.
  const grid = await page.evaluate((id) => {
    window.BID = id; load(); render();
    const rows = [...document.querySelectorAll('tbody tr')];
    const days = window.B.days;
    const people = [];
    for (const tr of rows) {
      const tds = [...tr.children];
      const name = tds[0].textContent.replace(/^⭐\s*/, '').trim();
      const cells = [];
      for (let d = 1; d <= days; d++) {
        const td = tds[d];
        const depEl = td ? td.querySelector('span.dep') : null;
        const dep = depEl ? parseInt(depEl.textContent, 10) : null;
        // code = texte de la cellule sans le numéro de départ
        let code = td ? td.textContent : '';
        if (depEl) code = code.replace(depEl.textContent, '');
        code = code.replace(/·/g, '').trim();
        cells.push({ code, dep });
      }
      people.push({ name, cells });
    }
    return { days, people, off: (window.ST && window.ST.off) || 0 };
  }, bd.id);

  // roster ACTIF (>=1 jour travaillé) — ordre = ordre des lignes (= base de rotation par défaut)
  const isWork = c => c && !/^(RH|R|CP|M|AF|RRT|RTP|PRT|SS|DEPL|DEP|MT|AT|CL|ABS|ABI|CSS|EDC|PAT|CDP|CDH|CFL|CRH|CDH)$/i.test(c) && c !== '';
  const active = grid.people.filter(p => p.cells.some(c => isWork(c.code)));
  const roster = active.map(p => p.name);
  const N0 = roster.length;

  // workDays = union des jours où au moins un chef actif travaille
  const workDays = [];
  for (let d = 0; d < grid.days; d++) {
    if (active.some(p => isWork(p.cells[d].code))) workDays.push(d);
  }

  // Sauver le dump de l'équipe de Kevin
  if (roster.includes('DESARZENS K') && !kevinDump) {
    kevinDump = { board: bd, grid, roster, workDays: workDays.map(d => d + 1) };
  }

  // seqN d'un jour = plus petite taille S telle que tous les dep rendus ∈ SEQS[S]
  const seqNof = d => {
    const ds = active.map(p => p.cells[d].dep).filter(x => x != null);
    if (!ds.length) return null;
    for (const s of Object.keys(SEQS).map(Number).sort((a, b) => a - b)) if (ds.every(x => SEQS[s].includes(x))) return s;
    return null;
  };
  // VÉRIF RÈGLE KEVIN (v9.865) : la fenêtre GLISSE de +1 à CHAQUE CYCLE de repos ET de +1 par jour
  // DANS le cycle. Cycles = ceux de L'ÉQUIPE (trous dans workDays). Le glissement +1 n'est garanti
  // que si le GROUPE présent est identique les 2 jours (sinon un congé change N + les rangs).
  const teamCycleStart = new Set();
  for (let i = 0; i < workDays.length; i++) { if (i === 0 || workDays[i] - workDays[i - 1] > 1) teamCycleStart.add(workDays[i]); }
  const starts = [...teamCycleStart].sort((a, b) => a - b);
  const presentSet = d => active.filter(p => p.cells[d].dep != null).map(p => p.name).sort().join('|');
  for (const p of active) {
    // (a) jours d'ÉQUIPE calendairement adjacents, MÊME groupe présent → index SEQ +1
    for (let i = 1; i < workDays.length; i++) {
      const d0 = workDays[i - 1], d1 = workDays[i];
      if (d1 - d0 !== 1) continue;
      if (p.cells[d0].dep == null || p.cells[d1].dep == null) continue;
      if (presentSet(d0) !== presentSet(d1)) continue;
      const s = seqNof(d0); if (s == null || seqNof(d1) !== s) continue;
      const SEQ = SEQS[s]; const ia = SEQ.indexOf(p.cells[d0].dep), ib = SEQ.indexOf(p.cells[d1].dep);
      if (ia < 0 || ib < 0) continue; totalChecks++;
      if (ib !== (ia + 1) % s) fails.push(`${bd.label} | ${p.name} : DANS cycle j${d0 + 1}=${p.cells[d0].dep} → j${d1 + 1}=${p.cells[d1].dep} (jour ≠ +1)`);
    }
    // (b) 1er jour de 2 cycles d'équipe consécutifs, MÊME groupe présent → index SEQ +1
    for (let ci = 1; ci < starts.length; ci++) {
      const d0 = starts[ci - 1], d1 = starts[ci];
      if (p.cells[d0].dep == null || p.cells[d1].dep == null) continue;
      if (presentSet(d0) !== presentSet(d1)) continue;
      const s = seqNof(d0); if (s == null || seqNof(d1) !== s) continue;
      const SEQ = SEQS[s]; const ia = SEQ.indexOf(p.cells[d0].dep), ib = SEQ.indexOf(p.cells[d1].dep);
      if (ia < 0 || ib < 0) continue; totalChecks++;
      if (ib !== (ia + 1) % s) fails.push(`${bd.label} | ${p.name} : ENTRE cycles j${d0 + 1}=${p.cells[d0].dep} → j${d1 + 1}=${p.cells[d1].dep} (début de cycle ≠ +1)`);
    }
  }
}

// ---- RAPPORT ----
console.log('== VÉRIFICATION RÉELLE — page light des départs (vrai navigateur) ==');
const ver = await page.evaluate(() => (typeof APP_VER !== 'undefined' ? APP_VER : '?'));
console.log(`  Version page chargée : ${ver}`);
console.log(`  Équipes de travail vérifiées : ${totalTeams} · glissements +1 contrôlés : ${totalChecks}`);
console.log(`  Erreurs JS pendant le rendu : ${jsErrors.length ? jsErrors.join(' | ') : 'aucune'}`);

if (kevinDump) {
  const { board, grid, roster, workDays } = kevinDump;
  console.log(`\n== ÉQUIPE DE KEVIN — ${board.label} ==`);
  console.log('  Chefs (ordre) : ' + roster.join(', '));
  const SEQ = SEQS[roster.length] || [];
  console.log('  SEQ_' + roster.length + ' = [' + SEQ.join(',') + ']  off=' + grid.off);
  // Afficher les 4 premiers jours de travail, par chef (la "fenêtre glissante")
  const wd4 = workDays.slice(0, 4);
  console.log('  Fenêtre glissante (4 premiers jours de travail : J' + wd4.join(' J') + ') :');
  for (const nm of roster) {
    const p = grid.people.find(x => x.name === nm);
    const seq = wd4.map(d => { const c = p.cells[d - 1]; return c.dep != null ? c.dep : (c.code || '·'); });
    console.log('    ' + nm.padEnd(14) + ' : ' + seq.join('-'));
  }
}

console.log('');
if (fails.length) {
  console.log('❌ ANOMALIES DE GLISSEMENT (' + fails.length + ') :');
  fails.slice(0, 40).forEach(f => console.log('   ❌ ' + f));
  await browser.close(); server.close();
  process.exit(1);
}
console.log('✅ TOUTES les équipes suivent la règle : chaque cycle glisse d\'exactement +1 (aucune anomalie).');
if (jsErrors.length) { await browser.close(); server.close(); process.exit(1); }
await browser.close(); server.close();
process.exit(0);
