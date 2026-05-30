// Instrumentation : intercepter chaque écriture vers A.overrides[key][CAISSON_JC.id]
// pour tracer EXACTEMENT quelle étape écrit "CP" sur lui.
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

    const CAISSON_JC = window.A.employees.find(e => e.name === 'CAISSON JC');
    const LANTERI_E = window.A.employees.find(e => e.name === 'LANTERI E');
    const target_ids = new Set([CAISSON_JC.id, LANTERI_E.id]);

    // Wrap A.overrides[key] entirely — log writes to specific emp ids OR replacement of their row object
    const traces = [];
    const trackIds = { [CAISSON_JC.id]: 'CAISSON JC', [LANTERI_E.id]: 'LANTERI E' };
    function snap(stack){
      const lines = stack.split('\n').slice(2, 8);
      return lines.join(' | ').slice(0, 500);
    }
    function makeRowProxy(label, target){
      return new Proxy(target || {}, {
        set(t, prop, value){
          let stack = ''; try { throw new Error('s'); } catch(e){ stack = e.stack || ''; }
          traces.push({ ev: 'cell_set', emp: label, day: prop, value: String(value), stack: snap(stack) });
          t[prop] = value;
          return true;
        }
      });
    }
    // Replace the per-emp row with a Proxy after each whole-object set
    window.A.overrides[key] = new Proxy(window.A.overrides[key], {
      set(t, prop, value){
        let stack = ''; try { throw new Error('s'); } catch(e){ stack = e.stack || ''; }
        if(trackIds[prop]){
          const sample = (value && typeof value === 'object') ? JSON.stringify(value).slice(0, 200) : String(value);
          traces.push({ ev: 'row_replace', emp: trackIds[prop], value: sample, stack: snap(stack) });
          t[prop] = makeRowProxy(trackIds[prop], value);
        } else {
          t[prop] = value;
        }
        return true;
      }
    });

    window._importInProgress = false;
    window.doImport();
    await new Promise(r => setTimeout(r, 800));

    return { traces, finalCJC: Object.assign({}, window.A.overrides[key][CAISSON_JC.id]), finalLE: Object.assign({}, window.A.overrides[key][LANTERI_E.id]) };
  }, { pages: passA.pages, rawText });

  console.log('=== TRACES écritures CAISSON JC + LANTERI E (chronologique) ===');
  console.log('Total traces:', out.traces.length);
  console.log('');
  // Group by phases (stack snippets)
  const phases = {};
  out.traces.forEach((t, i) => {
    // Extract a phase signature from stack
    const m = t.stack.match(/at ([\w$_]+)/g);
    const fn = m ? m.slice(0,3).join(' < ') : 'unknown';
    if(!phases[fn]) phases[fn] = [];
    phases[fn].push(t);
  });
  Object.keys(phases).forEach(fn => {
    console.log('--- PHASE: ' + fn + ' (' + phases[fn].length + ' writes) ---');
    phases[fn].slice(0,5).forEach(t => {
      console.log('  ' + t.emp + ' j' + t.day + ' = ' + JSON.stringify(t.value));
    });
    if(phases[fn].length > 5) console.log('  ... +' + (phases[fn].length - 5) + ' autres');
    console.log('');
  });
  console.log('=== FINAL ===');
  console.log('CAISSON JC :', JSON.stringify(out.finalCJC));
  console.log('LANTERI E  :', JSON.stringify(out.finalLE));

  await browser.close();
}
main().catch(e => { console.error('FATAL:', e.stack || e); process.exit(2); });
