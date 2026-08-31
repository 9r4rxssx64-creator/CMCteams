// Trace COURTIN F + COTTALORDA D : où finissent-ils après import ?
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
  await p.waitForFunction(()=>typeof window.doImport==='function',{timeout:20000});
  const capture = JSON.parse(readFileSync(CAPTURE_PATH,'utf-8'));
  const passA = capture.result.passes['0'];
  const rawText = capture.rawText;

  const out = await p.evaluate(async ({pages,rawText})=>{
    window.A.user = { id:'U11804', name:'Kevin DESARZENS' };
    const iy=2026,im=5,key=iy+'-'+im;
    window.A.year=iy; window.A.month=im;
    if(!window.A.overrides) window.A.overrides={};
    window.A.overrides[key]={};
    window._cmcPdfGeometry={pages,textRaw:rawText};
    window._lastImportText=rawText;
    let ta=document.getElementById('impTxt');
    if(!ta){ta=document.createElement('textarea');ta.id='impTxt';ta.style.display='none';document.body.appendChild(ta);}
    ta.value=rawText;
    ['impY','2026','impM','5'].forEach((v,i)=>{if(i%2)return;let el=document.getElementById(v);if(!el){el=document.createElement('input');el.id=v;document.body.appendChild(el);}});
    document.getElementById('impY').value='2026';
    document.getElementById('impM').value='5';
    window._importInProgress=false;
    window.doImport();
    await new Promise(r=>setTimeout(r,500));

    const targets = ['COURTIN F','COTTALORDA D','NICASTRO M','SOSSO G','COSTE W','GATTI B'];
    return targets.map(name => {
      const e = window.A.employees.find(x => x.name === name);
      if(!e) return { name, NOT_FOUND:true };
      const row = (window.A.overrides[key]||{})[e.id] || {};
      const cells = [];
      for(let d=1;d<=30;d++) cells.push(row[d] !== undefined && row[d] !== null ? String(row[d]) : '_');
      // Count work codes
      const ABS = new Set(['RH','R','CP','M','MAL','AF','AT','PAT','ABI','SS','CFL','CRH','CDP','EDC','RRT','PRT','DEPL','DEP','CL']);
      let workCount=0, cpCount=0, totalNonRest=0;
      cells.forEach(c => {
        if(!c||c==='_') return;
        const u = c.toUpperCase().replace(/[C'"*:]+$/g,"");
        if(u==='RH'||u==='R') return;
        totalNonRest++;
        if(u==='CP') cpCount++;
        else if(!ABS.has(u)) workCount++;
      });
      return {
        name,
        family: e.family||'?',
        teamHistory: e.teamHistory ? Object.assign({}, e.teamHistory) : null,
        teamForKey: e.teamHistory && e.teamHistory[key] || '(aucune)',
        cellCount: cells.filter(c => c !== '_').length,
        workCount, cpCount, totalNonRest,
        cells: cells.join('|').slice(0, 200)
      };
    });
  },{pages:passA.pages,rawText});

  out.forEach(o => console.log(JSON.stringify(o, null, 2)));
  await b.close();
}
main().catch(e=>{console.error('FATAL:',e.stack);process.exit(2);});
