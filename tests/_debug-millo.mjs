// Tracer comment MILLO W récupère "16/3"'" au lieu de "16/3*"
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
    ['impY','2026','impM','5'].forEach((v,i)=>{ if(i%2) return; let el = document.getElementById(v); if(!el){ el = document.createElement('input'); el.id=v; document.body.appendChild(el); } });
    document.getElementById('impY').value = '2026';
    document.getElementById('impM').value = '5';

    const MILLO = window.A.employees.find(e => e.name === 'MILLO W');
    if(!MILLO) return { error: 'MILLO W not found' };

    // Trace every assignment to MILLO W's overrides row
    const traces = [];
    window.A.overrides[key] = new Proxy(window.A.overrides[key], {
      set(t, prop, value){
        if(prop === MILLO.id){
          let stack = ''; try { throw new Error('s'); } catch(e){ stack = e.stack || ''; }
          const lines = stack.split('\n').slice(2, 6).join(' | ').slice(0, 400);
          traces.push({ ev: 'row_replace', value: JSON.stringify(value).slice(0, 200), stack: lines });
          t[prop] = new Proxy(value || {}, {
            set(rt, rprop, rval){
              let stk = ''; try { throw new Error('s'); } catch(e){ stk = e.stack || ''; }
              const sl = stk.split('\n').slice(2, 6).join(' | ').slice(0, 400);
              traces.push({ ev: 'cell_set', day: rprop, value: String(rval), stack: sl });
              rt[rprop] = rval;
              return true;
            }
          });
        } else {
          t[prop] = value;
        }
        return true;
      }
    });

    window._importInProgress = false;
    window.doImport();
    await new Promise(r => setTimeout(r, 500));

    const ov = window.A.overrides[key] || {};
    const final = ov[MILLO.id] || {};
    return { traces: traces.slice(0, 80), final: Object.assign({}, final), id: MILLO.id };
  }, { pages: passA.pages, rawText });

  if(out.error){ console.error('ERR:', out.error); return; }
  console.log('=== MILLO W final state ===');
  console.log('j22 =', JSON.stringify(out.final[22]));
  console.log('j26 =', JSON.stringify(out.final[26]));
  console.log('\n=== ALL traces ===');
  out.traces.forEach((t, i) => {
    console.log('['+i+'] ' + t.ev + (t.day ? ' j'+t.day : '') + ' = ' + JSON.stringify(t.value).slice(0,80));
    if(t.ev === 'row_replace' || t.day === '22' || t.day === '26'){
      console.log('     stack: ' + t.stack);
    }
  });

  await browser.close();
}
main().catch(e => { console.error('FATAL:', e.stack || e); process.exit(2); });
