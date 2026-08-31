// Debug ciblé CAISSON JC — pipeline NORMAL (sans patch) pour mesurer le bug réel.
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
    ['impY','2026','impM','5'].forEach((v,i)=>{
      if(i%2) return;
      let el = document.getElementById(v); if(!el){ el = document.createElement('input'); el.id=v; document.body.appendChild(el); }
    });
    document.getElementById('impY').value = '2026';
    document.getElementById('impM').value = '5';
    // Pipeline NORMAL — pas de patch
    window._importInProgress = false;
    window.doImport();
    await new Promise(r => setTimeout(r, 500));
    const ov = window.A.overrides[key] || {};
    function snapEmp(name){
      const e = window.A.employees.find(x => x.name === name);
      if(!e) return { NOT_FOUND: true };
      const row = ov[e.id] || {};
      const all = [];
      for(let d=1; d<=30; d++) all.push((row[d] !== undefined && row[d] !== null) ? String(row[d]) : '_');
      return { id: e.id, count: Object.keys(row).length, days: all.join(' | ') };
    }
    return {
      CAISSON_JC: snapEmp('CAISSON JC'),
      LANTERI_E: snapEmp('LANTERI E'),
      CAISSON_K: snapEmp('CAISSON K'),
      MILLO_W: snapEmp('MILLO W'),
      MATTONE_F: snapEmp('MATTONE F'),
      SANNA_O: snapEmp('SANNA O'),
      LEMONNIER_PH: snapEmp('LEMONNIER PH')
    };
  }, { pages: passA.pages, rawText });

  console.log('=== Pipeline NORMAL doImport() — snapshot final ===');
  Object.keys(out).forEach(k => {
    console.log('\n' + k + ' :');
    console.log('  ' + JSON.stringify(out[k]));
  });

  await browser.close();
}
main().catch(e => { console.error('FATAL:', e.stack || e); process.exit(2); });
