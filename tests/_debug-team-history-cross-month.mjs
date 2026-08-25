// Vérifie si teamHistory garde des données d'autres mois (mai/avril) en parallèle du mois courant.
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

    // Inspecte teamHistory pour TOUS les emps : combien ont des entrées pour AUTRES mois ?
    const stats = { withOtherMonths: 0, samples: [] };
    window.A.employees.forEach(e=>{
      if(!e.teamHistory) return;
      const keys=Object.keys(e.teamHistory);
      const otherKeys=keys.filter(k=>k!==key);
      if(otherKeys.length>0){
        stats.withOtherMonths++;
        if(stats.samples.length<15){
          stats.samples.push({
            name:e.name,
            keys:keys,
            currentMonth:e.teamHistory[key]||'(null)',
            otherMonths:otherKeys.map(k=>k+':'+e.teamHistory[k]).join(', ')
          });
        }
      }
    });

    // Inspecte aussi familyHistory similaire
    const famStats = { withOtherMonths: 0, samples: [] };
    window.A.employees.forEach(e=>{
      if(!e.familyHistory) return;
      const keys=Object.keys(e.familyHistory);
      const otherKeys=keys.filter(k=>k!==key);
      if(otherKeys.length>0){
        famStats.withOtherMonths++;
        if(famStats.samples.length<10){
          famStats.samples.push({
            name:e.name,
            keys:keys,
            currentMonth:e.familyHistory[key]||'(null)',
            otherMonths:otherKeys.map(k=>k+':'+e.familyHistory[k]).join(', ')
          });
        }
      }
    });

    return { team: stats, family: famStats, total: window.A.employees.length };
  },{pages:passA.pages,rawText});

  console.log('Total emps: ' + out.total);
  console.log('\n=== teamHistory contient autres mois ===');
  console.log('Emps concernés: ' + out.team.withOtherMonths);
  out.team.samples.forEach(s=>{
    console.log('  ' + s.name.padEnd(22) + ' currentMonth=' + s.currentMonth.padEnd(10) + ' autres=[' + s.otherMonths + ']');
  });
  console.log('\n=== familyHistory contient autres mois ===');
  console.log('Emps concernés: ' + out.family.withOtherMonths);
  out.family.samples.forEach(s=>{
    console.log('  ' + s.name.padEnd(22) + ' currentMonth=' + s.currentMonth.padEnd(10) + ' autres=[' + s.otherMonths + ']');
  });
  await b.close();
}
main().catch(e=>{console.error('FATAL:',e.stack);process.exit(2);});
