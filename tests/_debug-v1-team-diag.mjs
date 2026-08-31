import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';

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

  const diag = await page.evaluate(async ({ pages, rawText }) => {
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
    document.getElementById('impY').value='2026'; document.getElementById('impM').value='5';
    window._importInProgress = false;
    window.doImport();
    await new Promise(r => setTimeout(r, 1500));
    if(typeof window.cmcExportTeamsDetectionDiag !== 'function'){
      return { error: 'pas de cmcExportTeamsDetectionDiag' };
    }
    // Hook toast pour capturer raison
    let toastMsg = null;
    const _oldToast = window.toast;
    window.toast = function(m,t){ toastMsg = m; if(_oldToast) try{_oldToast(m,t);}catch(_){} };
    window.cmcExportTeamsDetectionDiag();
    window.toast = _oldToast;
    // The function shows report in a modal textarea, extract it
    await new Promise(r => setTimeout(r, 300));
    const _ta = document.querySelector('[id^="cmcTeamsDiag_"] textarea');
    const report = _ta ? _ta.value : null;
    const ov = window.A.overrides[key] || {};
    return {
      ovKeysCount: Object.keys(ov).length,
      sampleEmpIds: Object.keys(ov).slice(0, 5),
      toastMsg: toastMsg,
      reportLen: report ? report.length : 0,
      report: report
    };
  }, { pages: passA.pages, rawText });

  if(diag && diag.error){ console.error('ERR:', diag.error); return; }
  console.log('OV keys count:', diag.ovKeysCount);
  console.log('Report length:', diag.reportLen);
  if(diag.report){
    writeFileSync('/tmp/team-diag-v1.txt', diag.report);
    console.log('Écrit dans /tmp/team-diag-v1.txt');
  } else {
    console.log('Pas de report extrait (modal pas trouvée). Toast:', diag.toastMsg);
  }
  await browser.close();
}
main().catch(e => { console.error('FATAL:', e.stack || e); process.exit(2); });
