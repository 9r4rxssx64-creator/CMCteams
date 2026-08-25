// Debug ciblé CAISSON JC + LANTERI E : tracer à quelle étape ils reçoivent "CP".
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, '../index.html');
const CAPTURE_PATH = resolve(__dirname, '../tools/planning-parser-tester/captures/_decrypted/1779981740200___JUIN_2026_V1.pdf.json');

async function main(){
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('file://' + INDEX_PATH, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.A === 'object' && typeof window.doImport === 'function', { timeout: 20000 });

  const capture = JSON.parse(readFileSync(CAPTURE_PATH, 'utf-8'));
  const passA = capture.result.passes['0'];
  const rawText = capture.rawText;

  const out = await page.evaluate(async ({ pages, rawText }) => {
    const r = {};
    window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' };
    const iy = 2026, im = 5, key = iy + '-' + im;
    window.A.year = iy; window.A.month = im;

    // Find CAISSON JC and LANTERI E in DEF_EMP
    function findEmps(){
      const targets = ['CAISSON JC', 'LANTERI E', 'CAISSON K'];
      return targets.map(name => {
        const e = window.A.employees.find(x => x.name === name);
        return e ? { name: e.name, id: e.id, family: e.family } : { name, NOT_IN_DEF_EMP: true };
      });
    }

    r.emps_in_def_emp = findEmps();

    // Reset
    if(!window.A.overrides) window.A.overrides = {};
    window.A.overrides[key] = {};
    window._cmcPdfGeometry = { pages, textRaw: rawText };
    window._lastImportText = rawText;

    // Setup inputs
    let ta = document.getElementById('impTxt');
    if(!ta){ ta = document.createElement('textarea'); ta.id = 'impTxt'; ta.style.display='none'; document.body.appendChild(ta); }
    ta.value = rawText;
    ['impY','2026','impM','5'].forEach((v,i)=>{
      if(i%2) return;
      let el = document.getElementById(v); if(!el){ el = document.createElement('input'); el.id=v; document.body.appendChild(el); }
    });
    document.getElementById('impY').value = '2026';
    document.getElementById('impM').value = '5';

    // Patch _postValidateImport pour intercepter
    const origPV = window._postValidateImport;
    let stateAfterParseText = null;
    let stateAfterGeo = null;
    let stateAfterValidated = null;
    let stateAfterFallback = null;
    function snap(label){
      const snap = {};
      for(const t of ['CAISSON JC', 'LANTERI E', 'CAISSON K']){
        const e = window.A.employees.find(x => x.name === t);
        if(!e) continue;
        const row = (window.A.overrides[key] || {})[e.id] || {};
        snap[t] = { count: Object.keys(row).length, days1to5: [row[1],row[2],row[3],row[4],row[5]], days25to30: [row[25],row[26],row[27],row[28],row[29],row[30]] };
      }
      return snap;
    }
    window._postValidateImport = function(iy2, im2, ok, err, errLines){
      stateAfterParseText = snap('after_parseText');
      // Now call the original which runs geometric + validated + fallback
      try {
        // Manually do each step and snap
        const ov = window.A.overrides[key] || {};
        // 1. geo
        if(typeof window._cmcApplyGeometricParse === 'function' && window._cmcPdfGeometry && window.TextParser && window.EncadresParser){
          window._cmcApplyGeometricParse(iy2, im2);
        }
        stateAfterGeo = snap('after_geo');
        // 2. pdf-column + validated
        try { if(window._lastImportText && typeof window._cmcDetectTeamsByPdfColumn === 'function') window._cmcDetectTeamsByPdfColumn(window._lastImportText, iy2, im2); } catch(_){}
        if(typeof window._cmcApplyValidatedTeams === 'function' && window.TeamDetector){
          window._cmcApplyValidatedTeams(iy2, im2);
        }
        stateAfterValidated = snap('after_validated');
        // 3. rest pattern
        try { window._cmcDetectTeamsByRestPattern(iy2, im2); } catch(_){}
        // 4. fallback
        try { window._cmcFallbackUnassignedTeams(iy2, im2); } catch(_){}
        stateAfterFallback = snap('after_fallback');
      } catch(e){ r.err = e.message; }
    };

    try { window._importInProgress = false; window.doImport(); } catch(e){ r.err = e.message; }
    await new Promise(res => setTimeout(res, 300));

    r.after_parseText = stateAfterParseText;
    r.after_geo = stateAfterGeo;
    r.after_validated = stateAfterValidated;
    r.after_fallback = stateAfterFallback;
    r.final = snap('final');

    // Lookup raw text lines containing CAISSON
    r.rawText_lines = [];
    rawText.split('\n').forEach((line, i) => {
      if(line.includes('CAISSON')) r.rawText_lines.push('L' + i + ': ' + line.slice(0, 250));
    });
    return r;
  }, { pages: passA.pages, rawText });

  console.log('=== Emps in DEF_EMP ===');
  console.log(JSON.stringify(out.emps_in_def_emp, null, 2));
  console.log('\n=== Rawtext lignes contenant CAISSON ===');
  (out.rawText_lines || []).forEach(l => console.log('  ' + l));
  console.log('\n=== APRÈS parser texte (doImport) ===');
  console.log(JSON.stringify(out.after_parseText, null, 2));
  console.log('\n=== APRÈS géométrique ===');
  console.log(JSON.stringify(out.after_geo, null, 2));
  console.log('\n=== APRÈS validated detector ===');
  console.log(JSON.stringify(out.after_validated, null, 2));
  console.log('\n=== APRÈS fallback (final) ===');
  console.log(JSON.stringify(out.after_fallback, null, 2));

  await browser.close();
}
main().catch(e => { console.error('FATAL:', e.stack || e); process.exit(2); });
