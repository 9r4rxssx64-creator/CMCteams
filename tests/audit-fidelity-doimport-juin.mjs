// Audit fidélité — appelle le vrai `doImport()` de prod avec le rawText
// + injection géométrie (mime ce que ferait handleFileImport en réel).
// Compare ensuite A.overrides cellule-par-cellule avec le parseur standalone.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, '../index.html');
const CAPTURE_PATH = resolve(__dirname, '../tools/planning-parser-tester/captures/_decrypted/1779981740200___JUIN_2026_V1.pdf.json');
const REPORT_PATH = resolve(__dirname, '../tests/_audit-fidelity-doimport-juin.txt');

async function main(){
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('file://' + INDEX_PATH, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.A === 'object' && Array.isArray(window.A.employees) && typeof window.TextParser === 'object' && typeof window.doImport === 'function', { timeout: 20000 });

  const capture = JSON.parse(readFileSync(CAPTURE_PATH, 'utf-8'));
  const passA = capture.result.passes['0'];
  const rawText = capture.rawText;

  const out = await page.evaluate(async ({ pages, rawText }) => {
    const r = { errors: [], stats: {}, before: {}, after: {} };

    window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' };
    const iy = 2026, im = 5, key = iy + '-' + im;
    window.A.year = iy; window.A.month = im;

    // State avant import
    r.before.empsTotal = window.A.employees.length;
    r.before.ovKeysCount = window.A.overrides && window.A.overrides[key] ? Object.keys(window.A.overrides[key]).length : 0;

    // Setup les inputs comme handleFileImport le ferait
    // 1. textarea impTxt avec rawText
    let ta = document.getElementById('impTxt');
    if(!ta){ ta = document.createElement('textarea'); ta.id = 'impTxt'; ta.style.display='none'; document.body.appendChild(ta); }
    ta.value = rawText;

    // 2. selectors impY / impM
    ['impY','2026','impM','5'].forEach((v,i)=>{
      if(i%2) return;
      let el = document.getElementById(v); if(!el){ el = document.createElement('input'); el.id=v; document.body.appendChild(el); }
    });
    document.getElementById('impY').value = '2026';
    document.getElementById('impM').value = '5';

    // 3. injection géométrie (comme _doExtractPdfLines aurait fait)
    window._cmcPdfGeometry = { pages, textRaw: rawText };
    window._lastImportText = rawText;

    // 4. reset overrides pour ce mois (clean import)
    if(!window.A.overrides) window.A.overrides = {};
    window.A.overrides[key] = {};

    // 5. lancer doImport() (le vrai)
    try {
      window._importInProgress = false;
      window.doImport();
    } catch(e){ r.errors.push('doImport: ' + e.message); }

    // doImport est synchrone mais déclenche _postValidateImport en fin. Attendre.
    await new Promise(res => setTimeout(res, 200));

    // State après import
    const ov = window.A.overrides[key] || {};
    r.after.empsTotal = window.A.employees.length;
    r.after.ovKeysCount = Object.keys(ov).length;
    r.after.empsCreatedInline = r.after.empsTotal - r.before.empsTotal;

    // Compare avec standalone géométrique
    let standalone = null;
    try { standalone = window.TextParser.parseFromPdfJs({ pages, textRaw: rawText }); }
    catch(e){ r.errors.push('standalone: ' + e.message); }
    const standaloneEmps = (standalone && standalone.ok && standalone.employees) ? standalone.employees : [];

    function normName(s){
      try { return window.EncadresParser.normName(s); } catch(_){}
      return String(s||'').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').trim();
    }
    const standaloneByName = {};
    standaloneEmps.forEach(s => {
      if(!s || !s.name) return;
      const n = normName(s.name);
      (standaloneByName[n] = standaloneByName[n] || []).push(s);
    });

    const empsWithData = window.A.employees.filter(e => ov[e.id] && Object.keys(ov[e.id]).length > 0);

    const cmp = {
      empsCompared: 0,
      empsMatchedStandalone: 0,
      empsNotInStandalone: 0,
      cellsTotalProd: 0,
      cellsTotalStandalone: 0,
      cellsAgree: 0,
      cellsProdOnly: 0,
      cellsStandaloneOnly: 0,
      cellsDisagree: 0,
      disagreeSamples: [],
      prodOnlyByEmp: {},
      stdOnlyByEmp: {},
      empsNotMatchedSamples: []
    };

    empsWithData.forEach(emp => {
      cmp.empsCompared++;
      const n = normName(emp.name);
      const cands = standaloneByName[n] || [];
      let std = null;
      if(cands.length === 1) std = cands[0];
      else if(cands.length > 1){
        const tokens = String(emp.name).trim().split(/\s+/);
        const last = tokens[tokens.length-1];
        const m = cands.filter(s => {
          const st = String(s.name).trim().split(/\s+/);
          return st[st.length-1] === last;
        });
        if(m.length === 1) std = m[0];
      }
      if(!std){
        cmp.empsNotInStandalone++;
        if(cmp.empsNotMatchedSamples.length < 30){
          cmp.empsNotMatchedSamples.push(emp.name + ' (' + emp.id + ')');
        }
        return;
      }
      cmp.empsMatchedStandalone++;
      const prodRow = ov[emp.id] || {};
      const stdRow = std.days || {};
      for(let d=1; d<=31; d++){
        const ds = String(d);
        const pc = prodRow[ds];
        const sc = stdRow[ds];
        if(pc) cmp.cellsTotalProd++;
        if(sc) cmp.cellsTotalStandalone++;
        if(!pc && !sc) continue;
        if(pc && sc){
          if(String(pc) === String(sc)) cmp.cellsAgree++;
          else {
            cmp.cellsDisagree++;
            if(cmp.disagreeSamples.length < 50){
              cmp.disagreeSamples.push({ emp: emp.name, day: d, prod: String(pc), std: String(sc) });
            }
          }
        } else if(pc && !sc){
          cmp.cellsProdOnly++;
          (cmp.prodOnlyByEmp[emp.name] = cmp.prodOnlyByEmp[emp.name] || []).push({ d, code: String(pc) });
        } else {
          cmp.cellsStandaloneOnly++;
          (cmp.stdOnlyByEmp[emp.name] = cmp.stdOnlyByEmp[emp.name] || []).push({ d, code: String(sc) });
        }
      }
    });

    // Standalone emps PAS en prod (= noms PDF perdus)
    const prodNames = new Set(empsWithData.map(e => normName(e.name)));
    const stdNotInProd = [];
    Object.keys(standaloneByName).forEach(n => {
      if(!prodNames.has(n)){
        standaloneByName[n].forEach(s => stdNotInProd.push(s.name));
      }
    });
    cmp.standaloneNotInProd = stdNotInProd.length;
    cmp.standaloneNotInProdSamples = stdNotInProd.slice(0, 50);

    r.compare = cmp;

    // Coverage par famille
    const FAMS = ['bj','roulettes','cmc','cadres','amenage'];
    r.coverage = {};
    FAMS.forEach(f => {
      const total = window.A.employees.filter(e => (e.family || 'bj') === f).length;
      const withData = window.A.employees.filter(e => (e.family || 'bj') === f && ov[e.id] && Object.keys(ov[e.id]).length > 0).length;
      r.coverage[f] = { total, withData, pct: total ? Math.round(100*withData/total) : 0 };
    });

    return r;
  }, { pages: passA.pages, rawText });

  const lines = [];
  lines.push('=== AUDIT FIDÉLITÉ — pipeline doImport() COMPLET — capture JUIN_2026_V1 ===');
  lines.push('Date: ' + new Date().toISOString());
  lines.push('');
  if(out.errors.length){
    lines.push('--- ERREURS PIPELINE ---');
    out.errors.forEach(e => lines.push('  ✗ ' + e));
    lines.push('');
  }
  lines.push('--- STATE ---');
  lines.push('  emps total avant import : ' + out.before.empsTotal);
  lines.push('  emps total après import : ' + out.after.empsTotal);
  lines.push('  emps créés inline       : ' + out.after.empsCreatedInline);
  lines.push('  emps avec data dans ov  : ' + out.after.ovKeysCount);
  lines.push('');
  lines.push('--- COMPARAISON PROD vs STANDALONE GÉOMÉTRIQUE ---');
  const c = out.compare;
  lines.push('  emps comparés (avec data en prod) : ' + c.empsCompared);
  lines.push('  emps matched dans standalone      : ' + c.empsMatchedStandalone);
  lines.push('  emps PROD pas dans standalone     : ' + c.empsNotInStandalone);
  lines.push('  cellules totales PROD             : ' + c.cellsTotalProd);
  lines.push('  cellules totales STANDALONE       : ' + c.cellsTotalStandalone);
  lines.push('  cellules IDENTIQUES (agree)       : ' + c.cellsAgree);
  lines.push('  cellules DÉSACCORD (codes ≠)      : ' + c.cellsDisagree);
  lines.push('  cellules PROD-ONLY                : ' + c.cellsProdOnly);
  lines.push('  cellules STANDALONE-ONLY (perdues côté prod): ' + c.cellsStandaloneOnly);
  lines.push('  standalone emps PAS dans prod     : ' + c.standaloneNotInProd);
  const agreeRate = c.cellsTotalProd ? Math.round(1000*c.cellsAgree/c.cellsTotalProd)/10 : 0;
  const fidStrict = (c.cellsDisagree === 0 && c.cellsStandaloneOnly === 0 && c.standaloneNotInProd === 0);
  lines.push('');
  lines.push('  >>> taux accord cellules PROD : ' + agreeRate + '%');
  lines.push('  >>> fidélité STRICTE (0 désaccord, 0 cellule/nom perdu) : ' + (fidStrict ? '✅ 100/100' : '✗ NON'));

  if(c.disagreeSamples.length){
    lines.push('');
    lines.push('--- DÉSACCORDS (codes différents pour même emp+jour, max 50) ---');
    c.disagreeSamples.forEach(s => {
      lines.push('  ✗ ' + s.emp.padEnd(28) + ' jour ' + String(s.day).padStart(2) + ' : prod="' + s.prod + '" std="' + s.std + '"');
    });
  }
  if(c.standaloneNotInProdSamples.length){
    lines.push('');
    lines.push('--- NOMS DU PDF PAS DANS PROD (parser géométrique les voit, prod non) ---');
    lines.push('  /!\\ Ces emps SONT dans ton PDF mais leur planning N\'EST PAS appliqué.');
    c.standaloneNotInProdSamples.forEach(n => lines.push('  • ' + n));
  }
  if(c.empsNotMatchedSamples.length){
    lines.push('');
    lines.push('--- EMPS PROD AVEC DATA MAIS PAS DANS STANDALONE (prod a des cellules venues d\'ailleurs) ---');
    c.empsNotMatchedSamples.forEach(n => lines.push('  • ' + n));
  }
  // Sample cells PROD-ONLY (limit)
  const prodOnlyKeys = Object.keys(c.prodOnlyByEmp || {});
  if(prodOnlyKeys.length){
    lines.push('');
    lines.push('--- CELLULES PROD-ONLY (groupées par emp, max 10 emps) ---');
    prodOnlyKeys.slice(0, 10).forEach(n => {
      const arr = c.prodOnlyByEmp[n];
      lines.push('  ' + n.padEnd(28) + ' ' + arr.length + ' cellules : ' + arr.slice(0,5).map(x => 'j'+x.d+'="'+x.code+'"').join(', ') + (arr.length>5 ? ', …' : ''));
    });
    if(prodOnlyKeys.length > 10) lines.push('  … et ' + (prodOnlyKeys.length-10) + ' autres emps');
  }
  // Sample STANDALONE-ONLY
  const stdOnlyKeys = Object.keys(c.stdOnlyByEmp || {});
  if(stdOnlyKeys.length){
    lines.push('');
    lines.push('--- CELLULES STANDALONE-ONLY (le PDF a un code, la prod n\'a rien écrit) ---');
    stdOnlyKeys.slice(0, 10).forEach(n => {
      const arr = c.stdOnlyByEmp[n];
      lines.push('  ' + n.padEnd(28) + ' ' + arr.length + ' cellules : ' + arr.slice(0,5).map(x => 'j'+x.d+'="'+x.code+'"').join(', ') + (arr.length>5 ? ', …' : ''));
    });
    if(stdOnlyKeys.length > 10) lines.push('  … et ' + (stdOnlyKeys.length-10) + ' autres emps');
  }
  lines.push('');
  lines.push('--- COVERAGE PAR FAMILLE ---');
  Object.keys(out.coverage).forEach(f => {
    const cf = out.coverage[f];
    lines.push('  ' + f.padEnd(12) + ' : ' + cf.withData + '/' + cf.total + ' (' + cf.pct + '%)');
  });

  const report = lines.join('\n');
  console.log(report);
  writeFileSync(REPORT_PATH, report);
  console.log('\n→ Rapport : ' + REPORT_PATH);
  await browser.close();
  const ok = c.cellsDisagree === 0 && c.cellsStandaloneOnly === 0 && c.standaloneNotInProd === 0;
  process.exit(ok ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e.stack || e); process.exit(2); });
