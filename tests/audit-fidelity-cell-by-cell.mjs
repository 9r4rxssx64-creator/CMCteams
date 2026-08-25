// Audit fidélité cell-par-cell sur la capture JUIN_2026_V1 réelle de Kevin.
// Mesure : (1) Parseur production vs Parseur géométrique standalone — désaccords
// cellule par cellule. (2) Noms PDF non-matchés. (3) Cellules collisions.
// (4) Coverage par famille. Rapport JSON + texte lisible.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, '../index.html');
const CAPTURE_PATH = resolve(__dirname, '../tools/planning-parser-tester/captures/_decrypted/1779981740200___JUIN_2026_V1.pdf.json');
const REPORT_PATH = resolve(__dirname, '../tests/_audit-fidelity-juin-report.txt');

async function main(){
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('file://' + INDEX_PATH, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.A === 'object' && Array.isArray(window.A.employees) && typeof window.TextParser === 'object', { timeout: 20000 });

  const capture = JSON.parse(readFileSync(CAPTURE_PATH, 'utf-8'));
  const passA = capture.result.passes['0'];
  const rawText = capture.rawText;

  const out = await page.evaluate(({ pages, rawText }) => {
    const r = { errors: [], warnings: [], stats: {}, samples: {} };

    window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' };
    const iy = 2026, im = 5, key = iy + '-' + im;
    window.A.year = iy; window.A.month = im;
    window._cmcPdfGeometry = { pages, textRaw: rawText };
    window._lastImportText = rawText;
    if(!window.A.overrides) window.A.overrides = {};
    window.A.overrides[key] = {};

    // PIPELINE COMPLET
    let geoRes = null;
    try { geoRes = window._cmcApplyGeometricParse(iy, im); } catch(e){ r.errors.push('geo: ' + e.message); }
    try { window._cmcDetectTeamsByPdfColumn(rawText, iy, im); } catch(e){ r.errors.push('pdfcol: ' + e.message); }
    try { window._cmcApplyValidatedTeams(iy, im); } catch(e){ r.errors.push('vt: ' + e.message); }
    try { window._cmcDetectTeamsByRestPattern(iy, im); } catch(e){}
    try { window._cmcFallbackUnassignedTeams(iy, im); } catch(e){ r.errors.push('fb: ' + e.message); }

    r.stats.geo = geoRes && geoRes.stats ? geoRes.stats : null;

    // STEP 1 — Parse standalone via TextParser.parseFromPdfJs (référence géométrique pure)
    let standalone = null;
    try {
      standalone = window.TextParser.parseFromPdfJs({ pages, textRaw: rawText });
    } catch(e){ r.errors.push('standalone: ' + e.message); }
    const standaloneEmps = (standalone && standalone.ok && standalone.employees) ? standalone.employees : [];

    // STEP 2 — Build standalone index by normalized name (with initial) for matching
    function normName(s){
      try { return window.EncadresParser.normName(s); } catch(_){}
      return String(s||'').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').trim();
    }
    const standaloneByName = {};
    standaloneEmps.forEach(s => {
      if(!s || !s.name) return;
      const n = normName(s.name);
      if(!standaloneByName[n]) standaloneByName[n] = [];
      standaloneByName[n].push(s);
    });

    // STEP 3 — For each emp with data in production overrides, compare cells with standalone
    const ov = window.A.overrides[key];
    const empsWithData = window.A.employees.filter(e => ov[e.id] && Object.keys(ov[e.id]).length > 0);

    const compareResults = {
      empsCompared: 0,
      empsMatchedStandalone: 0,
      empsNotInStandalone: 0,
      cellsTotalProd: 0,
      cellsTotalStandalone: 0,
      cellsAgree: 0,
      cellsProdOnly: 0,        // cellule en prod, absente du standalone
      cellsStandaloneOnly: 0,  // cellule en standalone, absente de prod
      cellsDisagree: 0,        // les 2 ont une cellule mais codes différents
      disagreeSamples: [],
      prodOnlySamples: [],
      standaloneOnlySamples: [],
      empsNotMatchedSamples: []
    };

    empsWithData.forEach(emp => {
      compareResults.empsCompared++;
      const n = normName(emp.name);
      const stdCandidates = standaloneByName[n] || [];
      // Resolve homonyms by initial
      let std = null;
      if(stdCandidates.length === 1) std = stdCandidates[0];
      else if(stdCandidates.length > 1){
        const tokens = String(emp.name).trim().split(/\s+/);
        const lastTok = tokens[tokens.length-1];
        const matched = stdCandidates.filter(s => {
          const st = String(s.name).trim().split(/\s+/);
          return st[st.length-1] === lastTok;
        });
        if(matched.length === 1) std = matched[0];
      }
      if(!std){
        compareResults.empsNotInStandalone++;
        if(compareResults.empsNotMatchedSamples.length < 30){
          compareResults.empsNotMatchedSamples.push(emp.name + ' (id=' + emp.id + ')');
        }
        return;
      }
      compareResults.empsMatchedStandalone++;
      const prodRow = ov[emp.id] || {};
      const stdRow = std.days || {};
      for(let d=1; d<=31; d++){
        const ds = String(d);
        const pc = prodRow[ds];
        const sc = stdRow[ds];
        if(pc) compareResults.cellsTotalProd++;
        if(sc) compareResults.cellsTotalStandalone++;
        if(!pc && !sc) continue;
        if(pc && sc){
          if(String(pc) === String(sc)) compareResults.cellsAgree++;
          else {
            compareResults.cellsDisagree++;
            if(compareResults.disagreeSamples.length < 50){
              compareResults.disagreeSamples.push({
                emp: emp.name, day: d, prod: String(pc), standalone: String(sc)
              });
            }
          }
        } else if(pc && !sc){
          compareResults.cellsProdOnly++;
          if(compareResults.prodOnlySamples.length < 30){
            compareResults.prodOnlySamples.push({ emp: emp.name, day: d, prod: String(pc) });
          }
        } else {
          compareResults.cellsStandaloneOnly++;
          if(compareResults.standaloneOnlySamples.length < 30){
            compareResults.standaloneOnlySamples.push({ emp: emp.name, day: d, standalone: String(sc) });
          }
        }
      }
    });

    // STEP 4 — Standalone emps NOT in production (= unmatched names in geo parser)
    const prodNamesNorm = new Set(empsWithData.map(e => normName(e.name)));
    const standaloneNotInProd = [];
    Object.keys(standaloneByName).forEach(n => {
      if(!prodNamesNorm.has(n)){
        standaloneByName[n].forEach(s => standaloneNotInProd.push(s.name));
      }
    });
    compareResults.standaloneNotInProd = standaloneNotInProd.length;
    compareResults.standaloneNotInProdSamples = standaloneNotInProd.slice(0, 30);

    r.compareResults = compareResults;

    // STEP 5 — Coverage by family
    const FAMS = ['bj', 'roulettes', 'cmc', 'cadres', 'amenage'];
    const covByFam = {};
    FAMS.forEach(f => {
      const total = window.A.employees.filter(e => (e.family || 'bj') === f).length;
      const withData = window.A.employees.filter(e => (e.family || 'bj') === f && ov[e.id] && Object.keys(ov[e.id]).length > 0).length;
      covByFam[f] = { total, withData, pct: total ? Math.round(100*withData/total) : 0 };
    });
    r.coverageByFamily = covByFam;

    return r;
  }, { pages: passA.pages, rawText });

  // Build report
  const lines = [];
  lines.push('=== AUDIT FIDÉLITÉ CELL-PAR-CELL — capture JUIN_2026_V1 (Kevin) ===');
  lines.push('Date: ' + new Date().toISOString());
  lines.push('');
  lines.push('--- ERREURS PIPELINE ---');
  if(out.errors.length) out.errors.forEach(e => lines.push('  ✗ ' + e));
  else lines.push('  (aucune)');
  lines.push('');
  lines.push('--- STATS GEOMETRIC PARSE ---');
  lines.push(JSON.stringify(out.stats.geo, null, 2));
  lines.push('');
  lines.push('--- COMPARAISON PROD vs STANDALONE GÉOMÉTRIQUE ---');
  const c = out.compareResults;
  lines.push('  emps comparés (avec data en prod) : ' + c.empsCompared);
  lines.push('  emps matched dans standalone     : ' + c.empsMatchedStandalone);
  lines.push('  emps PROD pas dans standalone    : ' + c.empsNotInStandalone);
  lines.push('  cellules totales en PROD         : ' + c.cellsTotalProd);
  lines.push('  cellules totales en STANDALONE   : ' + c.cellsTotalStandalone);
  lines.push('  cellules AGREE (identiques)      : ' + c.cellsAgree);
  lines.push('  cellules DÉSACCORD               : ' + c.cellsDisagree);
  lines.push('  cellules PROD-ONLY (manquantes côté standalone) : ' + c.cellsProdOnly);
  lines.push('  cellules STANDALONE-ONLY (jamais appliquées en prod) : ' + c.cellsStandaloneOnly);
  lines.push('  standalone emps PAS dans prod    : ' + c.standaloneNotInProd);
  const agreeRate = c.cellsTotalProd ? Math.round(100*c.cellsAgree/c.cellsTotalProd) : 0;
  lines.push('  >>> taux accord cellules PROD : ' + agreeRate + '% ' + (agreeRate === 100 ? '✅' : '✗'));

  if(c.disagreeSamples && c.disagreeSamples.length){
    lines.push('');
    lines.push('--- ÉCHANTILLON DÉSACCORDS (max 50) ---');
    c.disagreeSamples.forEach(s => {
      lines.push('  ✗ ' + s.emp.padEnd(28) + ' jour ' + String(s.day).padStart(2) + ' : prod="' + s.prod + '" vs std="' + s.standalone + '"');
    });
  }
  if(c.prodOnlySamples && c.prodOnlySamples.length){
    lines.push('');
    lines.push('--- CELLULES PROD-ONLY (prod a écrit, standalone géométrique non) ---');
    c.prodOnlySamples.forEach(s => {
      lines.push('  ⚠ ' + s.emp.padEnd(28) + ' jour ' + String(s.day).padStart(2) + ' : "' + s.prod + '"');
    });
  }
  if(c.standaloneOnlySamples && c.standaloneOnlySamples.length){
    lines.push('');
    lines.push('--- CELLULES STANDALONE-ONLY (perdues côté prod) ---');
    c.standaloneOnlySamples.forEach(s => {
      lines.push('  ⚠ ' + s.emp.padEnd(28) + ' jour ' + String(s.day).padStart(2) + ' : "' + s.standalone + '"');
    });
  }
  if(c.empsNotMatchedSamples && c.empsNotMatchedSamples.length){
    lines.push('');
    lines.push('--- EMPS PROD AVEC DATA MAIS PAS DANS STANDALONE (parser géométrique ne les voit pas) ---');
    c.empsNotMatchedSamples.forEach(n => lines.push('  • ' + n));
  }
  if(c.standaloneNotInProdSamples && c.standaloneNotInProdSamples.length){
    lines.push('');
    lines.push('--- STANDALONE EMPS PAS DANS PROD (noms PDF que la prod n\'a pas matchés) ---');
    c.standaloneNotInProdSamples.forEach(n => lines.push('  • ' + n));
  }
  lines.push('');
  lines.push('--- COVERAGE PAR FAMILLE ---');
  Object.keys(out.coverageByFamily).forEach(f => {
    const cf = out.coverageByFamily[f];
    lines.push('  ' + f.padEnd(12) + ' : ' + cf.withData + '/' + cf.total + ' (' + cf.pct + '%)');
  });

  const report = lines.join('\n');
  console.log(report);
  writeFileSync(REPORT_PATH, report);
  console.log('\n→ Rapport sauvé : ' + REPORT_PATH);

  await browser.close();
  // Exit 0 si reproduction 100%, sinon 1
  const ok = c.cellsDisagree === 0 && c.cellsProdOnly === 0 && c.cellsStandaloneOnly === 0;
  process.exit(ok ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e.stack || e); process.exit(2); });
