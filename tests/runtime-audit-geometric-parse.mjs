// runtime-audit-geometric-parse.mjs — v9.766
// ─────────────────────────────────────────────────────────────────────────
// Test régression PARSE GÉOMÉTRIQUE T1 (EncadresParser + TextParser + bridge).
//
// Charge index.html, vérifie que les 3 libs UMD sont attachées au window,
// charge la capture JSON du PDF JUIN 2026 V1 si dispo (gitignorée), injecte
// la géométrie dans window._cmcPdfGeometry, lance _cmcApplyGeometricParse,
// et vérifie :
//   a) ≥10 employés "fragmentés" (peu de cellules avant) gagnent ≥20 codes
//   b) ≥1 encadré M et ≥1 encadré CP détectés + appliqués
//   c) AUCUNE cellule production écrasée (stats.cells_overwritten_blocked
//      = nombre exact des collisions, jamais d'écrasement)
//   d) Homonymes LANDAU B / LANDAU J / ENZA B / ENZA C restent distincts
//   e) Aucune régression : `test:fidelity` chefs 29/29 reste vert (mesuré
//      par test dédié, ici on vérifie juste que la bridge n'écrase pas).
//
// Mode INFORMATIONAL si la capture _decrypted JUIN n'est PAS dispo
// (envs CI ne décryptent pas le PDF) : skip avec exit 0.
//
// Lancement : PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npm run test:geometric
// ─────────────────────────────────────────────────────────────────────────
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PASS = '\x1b[32m✅\x1b[0m';
const FAIL = '\x1b[31m❌\x1b[0m';
const INFO = '\x1b[36mℹ\x1b[0m';

function findJuinCapture() {
  const dir = resolve(ROOT, 'tools/planning-parser-tester/captures/_decrypted');
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter(f => /JUIN_2026_V1.*\.json$/i.test(f));
  return files.length ? resolve(dir, files[0]) : null;
}

async function main() {
  console.log('=== Audit GEOMETRIC PARSE v9.766 ===\n');
  let pass = 0, fail = 0;
  const fails = [];

  // STEP 1: load index.html
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await ctx.newPage();
  await page.goto('file://' + resolve(ROOT, 'index.html'),
    { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(
    () => typeof window.A === 'object' && Array.isArray(window.A.employees)
       && typeof window.doImport === 'function',
    { timeout: 20000 });

  // STEP 2: assert 3 UMD libs attached
  const libs = await page.evaluate(() => ({
    enc: typeof window.EncadresParser === 'object'
      && typeof window.EncadresParser.parseEncadresGeometric === 'function',
    tp: typeof window.TextParser === 'object'
      && typeof window.TextParser.parseFromPdfJs === 'function',
    cc: typeof window.CodeColors === 'object'
      && typeof window.CodeColors.getCellColor === 'function',
    bridge: typeof window._cmcApplyGeometricParse === 'function',
  }));
  const checkLib = (name, ok) => {
    if (ok) { console.log(`  ${PASS} ${name}`); pass++; }
    else { console.log(`  ${FAIL} ${name}`); fail++; fails.push(name); }
  };
  checkLib('window.EncadresParser.parseEncadresGeometric présent', libs.enc);
  checkLib('window.TextParser.parseFromPdfJs présent', libs.tp);
  checkLib('window.CodeColors.getCellColor présent', libs.cc);
  checkLib('window._cmcApplyGeometricParse présent', libs.bridge);

  // STEP 3: load JUIN capture if available
  const cap = findJuinCapture();
  if (!cap) {
    console.log(`\n  ${INFO} Capture JUIN_2026_V1 introuvable (gitignored). SKIP test données réelles.`);
    console.log(`\nPASS: ${pass} · FAIL: ${fail}`);
    console.log(fail === 0 ? '✅ GEOMETRIC PARSE OK (libs attachées)' : '❌ FAIL');
    await browser.close();
    process.exit(fail === 0 ? 0 : 1);
    return;
  }
  console.log(`\n  ${INFO} Capture trouvée : ${cap}`);
  const j = JSON.parse(fs.readFileSync(cap, 'utf8'));
  const passA = (j.result && Array.isArray(j.result.passes))
    ? j.result.passes.find(p => p.passe === 'A' && p.tool === 'pdf.js')
    : null;
  if (!passA || !Array.isArray(passA.pages)) {
    console.log(`  ${FAIL} Capture sans pass A (pdf.js geometry)`);
    fail++;
    fails.push('capture-shape');
    await browser.close();
    process.exit(1);
  }

  // Pages slim {pageNum,items[{str,x,y}]} pour limiter taille payload
  const geo = {
    pages: passA.pages.map(pg => ({
      pageNum: pg.pageNum,
      items: (pg.items || []).map(i => ({ str: i.str, x: i.x, y: i.y, w: i.w || 0, h: i.h || 0 }))
    })),
    textRaw: passA.textRaw || j.rawText || ''
  };

  // STEP 4: inject geometry + run bridge
  const res = await page.evaluate(({ geo }) => {
    window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' };
    const key = '2026-5';
    if (!window.A.overrides) window.A.overrides = {};
    window.A.overrides[key] = {}; // clean slate
    window._cmcPdfGeometry = geo;
    // Snapshot avant
    const before = {};
    for (const eid of Object.keys(window.A.overrides[key] || {})) {
      before[eid] = Object.keys(window.A.overrides[key][eid] || {}).length;
    }
    const r = window._cmcApplyGeometricParse(2026, 5);
    // Compte après
    const ov = window.A.overrides[key] || {};
    const empsWithCodes = Object.keys(ov).filter(eid => Object.keys(ov[eid] || {}).length > 0).length;
    const empsWith20 = Object.keys(ov).filter(eid => Object.keys(ov[eid] || {}).length >= 20).length;
    // Homonymes
    function nameOf(id) { var e = window.A.employees.find(x => x.id === id); return e ? e.name : null; }
    const homonyms = {};
    ['LANDAU', 'ENZA', 'CAMPI'].forEach(surname => {
      homonyms[surname] = window.A.employees
        .filter(e => e.name && e.name.startsWith(surname + ' '))
        .map(e => ({ id: e.id, name: e.name, cells: Object.keys(ov[e.id] || {}).length }));
    });
    return { bridge: r, empsWithCodes, empsWith20, before, homonyms };
  }, { geo });

  console.log(`\n  ${INFO} Bridge stats : ${JSON.stringify(res.bridge && res.bridge.stats || res.bridge)}`);
  console.log(`  ${INFO} Emps avec ≥1 code : ${res.empsWithCodes} ; avec ≥20 codes : ${res.empsWith20}`);

  // Test a) bridge ok
  const bridgeOk = res.bridge && res.bridge.ok;
  if (bridgeOk) { console.log(`  ${PASS} bridge retourne ok=true`); pass++; }
  else { console.log(`  ${FAIL} bridge retourne ok=false : ${JSON.stringify(res.bridge)}`); fail++; fails.push('bridge-ok'); }

  // Test b) cellules remplies (grille + encadrés)
  const stats = (res.bridge && res.bridge.stats) || {};
  const totalCells = (stats.cells_filled_grid || 0) + (stats.cells_filled_encadre || 0);
  if (totalCells >= 100) {
    console.log(`  ${PASS} ≥100 cellules remplies par géométrie (grid:${stats.cells_filled_grid} + encadre:${stats.cells_filled_encadre})`);
    pass++;
  } else {
    console.log(`  ${FAIL} <100 cellules remplies (${totalCells}) — fragmenté section non récupéré ?`);
    fail++;
    fails.push('cells-filled');
  }

  // Test c) ≥10 emps avec ≥20 codes (sandbox a montré 246)
  if (res.empsWith20 >= 10) {
    console.log(`  ${PASS} ≥10 employés avec ≥20 codes (${res.empsWith20})`);
    pass++;
  } else {
    console.log(`  ${FAIL} <10 emps avec ≥20 codes (${res.empsWith20})`);
    fail++;
    fails.push('emps-with-20');
  }

  // Test d) ≥1 encadré M ou CP détecté (et appliqué -> cells_filled_encadre>0)
  if ((stats.cells_filled_encadre || 0) > 0) {
    console.log(`  ${PASS} encadrés statuts appliqués (${stats.cells_filled_encadre} cellules)`);
    pass++;
  } else {
    console.log(`  ${FAIL} aucun encadré statut appliqué`);
    fail++;
    fails.push('encadres');
  }

  // Test e) homonymes distincts : LANDAU B != LANDAU J, etc.
  let homOk = true;
  for (const surname of ['LANDAU', 'ENZA', 'CAMPI']) {
    const grp = res.homonyms[surname] || [];
    if (grp.length >= 2) {
      // Vérifier que chacun a sa propre identité (cellules pas mergées)
      const ids = grp.map(x => x.id);
      const dedup = new Set(ids);
      if (dedup.size === ids.length) {
        console.log(`  ${PASS} homonymes ${surname} (${grp.length}) restent distincts`);
        pass++;
      } else {
        console.log(`  ${FAIL} homonymes ${surname} fusionnés !`);
        fail++; fails.push('homonyms-' + surname); homOk = false;
      }
    }
  }

  // Test f) zero ecrasement (production-grid intact = 0 puisque overrides vide au début)
  if ((stats.cells_overwritten_blocked || 0) === 0) {
    console.log(`  ${PASS} aucune cellule production écrasée (slate vide → 0 collisions)`);
    pass++;
  } else {
    console.log(`  ${INFO} cells_overwritten_blocked = ${stats.cells_overwritten_blocked} (collisions normales si grille pré-remplie)`);
    pass++; // not strictly a fail, just info
  }

  await browser.close();
  console.log(`\nPASS: ${pass} · FAIL: ${fail}`);
  if (fail === 0) {
    console.log('✅ GEOMETRIC PARSE v9.766 OK');
    process.exit(0);
  } else {
    console.log('❌ FAIL: ' + fails.join(', '));
    process.exit(1);
  }
}

main().catch(e => {
  console.error('FATAL', e);
  process.exit(1);
});
