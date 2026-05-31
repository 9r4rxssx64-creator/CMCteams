// Teste DEJANOVIC dans le contexte plein V2 que Kevin a collé
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, '../index.html');

// Le rawText V2 que Kevin a collé (lit depuis fichier)
const V2_RAW_PATH = '/tmp/v2-rawtext.txt';
const v2text = readFileSync(V2_RAW_PATH, 'utf-8');

async function main(){
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('file://' + INDEX_PATH, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.A === 'object' && typeof window.doImport === 'function', { timeout: 20000 });

  const result = await page.evaluate(async (txt) => {
    window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' };
    const iy=2026,im=5,key=iy+'-'+im;
    window.A.year=iy; window.A.month=im;
    if(!window.A.overrides) window.A.overrides={};
    window.A.overrides[key]={};
    let ta = document.getElementById('impTxt');
    if(!ta){ ta=document.createElement('textarea'); ta.id='impTxt'; ta.style.display='none'; document.body.appendChild(ta); }
    ta.value=txt;
    ['impY','2026','impM','5'].forEach((v,i)=>{ if(i%2) return; let el=document.getElementById(v); if(!el){ el=document.createElement('input'); el.id=v; document.body.appendChild(el); } });
    document.getElementById('impY').value='2026';
    document.getElementById('impM').value='5';
    window._importInProgress=false;
    try { window.doImport(); } catch(e) { return { error: 'doImport: '+e.message }; }
    await new Promise(r => setTimeout(r, 2000));
    const ov=window.A.overrides[key]||{};
    const findEmp = (name) => {
      const e = window.A.employees.find(x => x.name === name);
      if(!e) return { found: false };
      const cells = ov[e.id] || {};
      const codeCount = Object.keys(cells).filter(d => cells[d]).length;
      return { found: true, id: e.id, family: e.family, codeCount, team: e.teamHistory && e.teamHistory[key] };
    };
    return {
      dejanovic: findEmp('DEJANOVIC D'),
      fautrier: findEmp('FAUTRIER M'),
      desarzens: findEmp('DESARZENS K'),
      courtin: findEmp('COURTIN F'),
      nicastro: findEmp('NICASTRO M'),
      duport: findEmp('DUPORT R'),
      inzirillo: findEmp('INZIRILLO R'),
      porasso: findEmp('PORASSO C'),
      totalEmps: window.A.employees.length,
      empsWithCells: Object.keys(ov).filter(eid => Object.keys(ov[eid]||{}).filter(d => ov[eid][d]).length > 0).length
    };
  }, v2text);

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
}
main().catch(e => { console.error('FATAL:', e.stack||e); process.exit(2); });
