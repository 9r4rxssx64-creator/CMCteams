// v9.719 — Test runtime : détection équipes par COLONNE PDF
// Vérifie que _cmcDetectTeamsByPdfColumn lit correctement la structure du PDF
// (en-têtes de rotation + curseur de colonnes) et affecte le bon teamId/famille.
// Kevin : la méthode par jours de repos (_cmcDetectTeamsByRestPattern) est peu
// fiable → cette nouvelle méthode lit les colonnes directement.
//
// Scénario : section Roulettes, 1 bloc à 6 colonnes (5/5/6/5/4/4 = 29 places).
// On entrelace des lignes de longueur variable + des entrées statut « en trop »
// (au-delà des 6 colonnes de rotation) pour valider que le curseur les ignore.
// Cibles : col1 = BARONE E, AUREGLIA R, PARIZIA K, GANCIA G, DAGIONI M (5)
//          col2 = AUBERT P, HAREL H, SBARATTO S, CARDONA P, LANTERI MINET P (5)

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, '../index.html');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto('file://' + INDEX_PATH, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(
    () => typeof window.A === 'object' && Array.isArray(window.A.employees)
      && typeof window._cmcDetectTeamsByPdfColumn === 'function',
    { timeout: 20000 }
  );

  await page.evaluate(() => { window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' }; });

  const result = await page.evaluate(() => {
    const out = { tests: [] };
    function test(label, fn) {
      try {
        const ok = fn();
        out.tests.push({ label, ok: ok === true, error: ok === true ? null : ('got ' + JSON.stringify(ok)) });
      } catch (e) {
        out.tests.push({ label, ok: false, error: e.message });
      }
    }

    const TAB = '\t';
    // 6 colonnes — capacité 5/5/6/5/4/4 = 29
    const COL1 = ['BARONE E', 'AUREGLIA R', 'PARIZIA K', 'GANCIA G', 'DAGIONI M'];        // count 5
    const COL2 = ['AUBERT P', 'HAREL H', 'SBARATTO S', 'CARDONA P', 'LANTERI MINET P'];   // count 5
    const COL3 = ['COL3 A', 'COL3 B', 'COL3 C', 'COL3 D', 'COL3 E', 'COL3 F'];            // count 6
    const COL4 = ['COL4 A', 'COL4 B', 'COL4 C', 'COL4 D', 'COL4 E'];                      // count 5
    const COL5 = ['COL5 A', 'COL5 B', 'COL5 C', 'COL5 D'];                                // count 4
    const COL6 = ['COL6 A', 'COL6 B', 'COL6 C', 'COL6 D'];                                // count 4
    const COLS = [COL1, COL2, COL3, COL4, COL5, COL6];
    const COUNTS = [5, 5, 6, 5, 4, 4];
    const ALL = [].concat.apply([], COLS);

    // Injecter ces employés (famille roulettes)
    const origLen = window.A.employees.length;
    const injected = [];
    ALL.forEach((nm, i) => {
      const norm = nm.toUpperCase();
      const exists = window.A.employees.some(e => (e.name || '').toUpperCase() === norm);
      if (!exists) {
        const emp = { id: 'TST719_' + i, name: nm, team: '?', chef: false, cdpShifts: [], family: 'roulettes' };
        window.A.employees.push(emp);
        injected.push(emp);
      }
    });

    // En-tête de rotation : 5 20/5 | 5 19/4 | 6 16/22 | 5 14/19 | 4 RH | 4 R
    // + un quadruplet absence « 7 M du au » qui doit être ignoré (header stoppe avant)
    const header = [
      '5', '20/5', 'du', 'au',
      '5', '19/4', 'du', 'au',
      '6', '16/22', 'du', 'au',
      '5', '14/19', 'du', 'au',
      '4', 'RH', 'du', 'au',
      '4', 'R', 'du', 'au',
      '7', 'M', 'du', 'au'
    ].join(TAB);

    // Postes variés pour réalisme
    const POSTES = ['BRTP+E', 'BRTP+E.', 'BRE', 'BTP+K', '.BRTCP+KE', 'BRTCPK.', 'BT', 'B'];
    function entry(name, pi) { return POSTES[pi % POSTES.length] + TAB + name; }

    // Construction du bloc : on remplit colonne par colonne en lignes entrelacées.
    // Le curseur affecte l'entrée i de chaque ligne à la i-ème colonne OUVERTE.
    // On simule des lignes de longueur variable : certaines lignes ne couvrent
    // qu'une partie des colonnes encore ouvertes.
    const lines = [];
    lines.push('Roulettes');
    lines.push(header);

    // Stratégie : 6 lignes « pleines » remplissant les 6 colonnes en parallèle,
    // sauf que COL3 a 6 membres → après les 5 premières lignes COL1/2/4 (count 5)
    // et COL5/6 (count 4) ferment, et la 6e ligne ne porte plus que COL3.
    // On ajoute aussi des entrées STATUT en trop à certaines lignes.
    for (let row = 0; row < 6; row++) {
      const ents = [];
      for (let c = 0; c < COLS.length; c++) {
        if (row < COLS[c].length) {
          ents.push(entry(COLS[c][row], c + row));
        }
      }
      // entrées statut « en trop » sur les lignes 0 et 4 — placées APRÈS toutes
      // les entrées de rotation de la ligne → doivent être ignorées par le curseur
      if (row === 0) ents.push(entry('STATUT UN', 7), entry('STATUT DEUX', 1));
      if (row === 4) ents.push(entry('STATUT TROIS', 2));
      // ligne 2 : on omet volontairement COL5/COL6 (longueur variable)
      lines.push(ents.join(TAB));
    }

    const sampleText = lines.join('\n');
    const res = window._cmcDetectTeamsByPdfColumn(sampleText, 2026, 4);

    test('fonction exposée sur window', () => typeof window._cmcDetectTeamsByPdfColumn === 'function');
    test('retourne ok:true', () => res && res.ok === true);
    test('au moins 10 emps assignés', () => res && res.teamsAssigned >= 10);
    test('au moins 6 colonnes détectées', () => res && res.columns >= 6);

    function teamOf(nm) {
      const e = window.A.employees.find(x => (x.name || '').toUpperCase() === nm.toUpperCase());
      return e && e.teamHistory ? e.teamHistory['2026-4'] : null;
    }
    function famOf(nm) {
      const e = window.A.employees.find(x => (x.name || '').toUpperCase() === nm.toUpperCase());
      return e && e.familyHistory ? e.familyHistory['2026-4'] : null;
    }

    const t1 = teamOf('BARONE E');
    test('BARONE E a un teamId', () => !!t1);
    test('COL1 (5 emps) ont tous le MÊME teamId que BARONE E', () => {
      return COL1.every(nm => teamOf(nm) === t1);
    });
    const t2 = teamOf('AUBERT P');
    test('AUBERT P a un teamId DIFFÉRENT de BARONE E', () => !!t2 && t2 !== t1);
    test('COL2 (5 emps) ont tous le MÊME teamId que AUBERT P', () => {
      return COL2.every(nm => teamOf(nm) === t2);
    });
    test('famille roulettes affectée (teamId commence par "r")', () => {
      return /^r\d+/.test(String(t1)) && /^r\d+/.test(String(t2));
    });
    test('familyHistory = roulettes', () => famOf('BARONE E') === 'roulettes' && famOf('AUBERT P') === 'roulettes');
    test('aucun emp statut ("STATUT UN") n\'a reçu de teamId', () => {
      const e = window.A.employees.find(x => (x.name || '').toUpperCase() === 'STATUT UN');
      return !e; // jamais créé donc jamais matché → STATUT bien ignoré
    });

    // Cleanup
    injected.forEach(emp => {
      const idx = window.A.employees.indexOf(emp);
      if (idx >= 0) window.A.employees.splice(idx, 1);
    });
    test('cleanup employés injectés OK', () => window.A.employees.length === origLen);

    return out;
  });

  console.log('\n=== Test runtime v9.719 — détection équipes par colonne PDF ===');
  if (result.error) {
    console.error('FATAL:', result.error);
    await browser.close();
    process.exit(2);
  }
  let pass = 0, fail = 0;
  result.tests.forEach(t => {
    if (t.ok) { console.log('  ✓ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + (t.error ? ' — ' + t.error : '')); fail++; }
  });
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ v9.719 détection colonne PDF OK' : '❌ v9.719 détection colonne PDF ÉCHEC');
  console.log(`PASS: ${pass} · FAIL: ${fail}`);
  console.log('========================================');

  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
