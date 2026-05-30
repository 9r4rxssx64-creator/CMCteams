// Vérifier la classification par famille de TOUS les emps en absence après import
// JUIN_2026_V1 réel — avant/après le fix v9.771.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, '../index.html');
const CAPTURE_PATH = resolve(__dirname, '../tools/planning-parser-tester/captures/_decrypted/1779981740200___JUIN_2026_V1.pdf.json');

async function main(){
  const b = await chromium.launch({ headless:true });
  const p = await (await b.newContext()).newPage();
  await p.goto('file://'+INDEX_PATH,{waitUntil:'domcontentloaded',timeout:30000});
  await p.waitForFunction(()=> typeof window.doImport==='function',{timeout:20000});
  const capture = JSON.parse(readFileSync(CAPTURE_PATH,'utf-8'));
  const passA = capture.result.passes['0'];
  const rawText = capture.rawText;

  const out = await p.evaluate(async ({ pages, rawText }) => {
    window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' };
    const iy = 2026, im = 5, key = iy + '-' + im;
    window.A.year = iy; window.A.month = im;
    if(!window.A.overrides) window.A.overrides = {};
    window.A.overrides[key] = {};
    window._cmcPdfGeometry = { pages, textRaw: rawText };
    window._lastImportText = rawText;
    let ta = document.getElementById('impTxt');
    if(!ta){ ta = document.createElement('textarea'); ta.id = 'impTxt'; ta.style.display='none'; document.body.appendChild(ta); }
    ta.value = rawText;
    ['impY','2026','impM','5'].forEach((v,i)=>{ if(i%2) return; let el = document.getElementById(v); if(!el){ el = document.createElement('input'); el.id=v; document.body.appendChild(el); } });
    document.getElementById('impY').value = '2026';
    document.getElementById('impM').value = '5';

    window._importInProgress = false;
    window.doImport();
    await new Promise(r => setTimeout(r, 500));

    // Get all emps in absence sections
    const ABS_TEAMS = ['formation','maladie','conges','deplacement','amenage'];
    const sections = {};
    window.A.employees.forEach(e => {
      const t = e.teamHistory && e.teamHistory[key];
      if(!t || !ABS_TEAMS.includes(t)) return;
      if(!sections[t]) sections[t] = [];
      sections[t].push({
        name: e.name,
        defFam: e.family || '?',
        histFam: (e.familyHistory && e.familyHistory[key]) || '?',
        pdfSec: (e._pdfSection && e._pdfSection[key]) || '?'
      });
    });
    return { sections, totalEmps: window.A.employees.length };
  }, { pages: passA.pages, rawText });

  console.log('=== Sections d\'absence — comparaison DEF_EMP family vs familyHistory ===');
  Object.keys(out.sections).forEach(s => {
    console.log('\n--- ' + s + ' (' + out.sections[s].length + ' emps) ---');
    out.sections[s].forEach(e => {
      const final = e.pdfSec !== '?' ? e.pdfSec : (e.histFam !== '?' ? e.histFam : e.defFam);
      console.log('  ' + e.name.padEnd(25) + ' DEF_EMP=' + e.defFam.padEnd(10) + ' histFam=' + String(e.histFam).padEnd(10) + ' pdfSec=' + String(e.pdfSec).padEnd(10) + ' → AFFICHÉ=' + final);
    });
  });
  await b.close();
}
main().catch(e => { console.error('FATAL:', e.stack); process.exit(2); });
