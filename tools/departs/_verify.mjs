import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = 'file://' + resolve(__dirname, 'index.html');
const b = await chromium.launch({ headless: true });
let pass=0, fail=0; const t=(l,ok)=>{console.log((ok?'  ✅ ':'  ❌ ')+l);ok?pass++:fail++;};
const ctx = await b.newContext(); const page = await ctx.newPage();
const errs=[]; page.on('pageerror',e=>errs.push(String(e)));
await page.goto(file,{waitUntil:'networkidle',timeout:30000}); await page.waitForTimeout(500);

const r = await page.evaluate(()=>{
  const ids=Object.keys(BOARDS);
  const months={}; ids.forEach(id=>{const b=BOARDS[id];months[b.year+'-'+b.monthIdx]=1;});
  const moSel=document.getElementById('moSel');
  const moOpts=moSel?[...moSel.options].map(o=>o.value):[];
  // no stale June board
  const hasJune = ids.some(id=>BOARDS[id].monthIdx===5);
  // connect Kevin, then test month switching
  setMe('DESARZENS K');
  setMonth('2026-7'); const aoutBID=BID, aoutLabel=B.label;       // Août
  setMonth('2026-6'); const juilBID=BID, juilLabel=B.label, juilMir=mirrorBoardId(BID); // Juillet
  // board dropdown scoped to current month (Juillet) — count
  const bs=document.getElementById('boardSel'); const scopedCount=[...bs.querySelectorAll('option')].length;
  // search across months
  const ts=document.getElementById('teamSearch'); ts.value='PUGNETTI'; fillSel();
  const searchCount=[...bs.querySelectorAll('option')].filter(o=>o.value).length;
  ts.value=''; fillSel();
  // readability: me-row name cell opaque background
  setMonth('2026-6');
  const meNom=document.querySelector('tr.me .cNom');
  const bg=meNom?getComputedStyle(meNom).backgroundColor:'';
  const opaque = /rgb\(/.test(bg) && !/rgba\([^)]*,\s*0?\.\d+\)/.test(bg);
  return { totalBoards:ids.length, months:Object.keys(months), moOpts, hasJune,
    aoutBID, aoutLabel, juilBID, juilLabel, juilMir, juilMirLabel:juilMir?BOARDS[juilMir].label:'', scopedCount, searchCount, bg, opaque, totalCount:ids.length };
});
t('aucune pageerror', errs.length===0);
t('seulement 2 mois (Août + Juillet), pas de Juin', r.months.length===2 && !r.hasJune);
t('sélecteur Mois = 2 options', r.moOpts.length===2);
t('setMonth(Août) → équipe de Kevin Éq.11', /Éq\.11\b/.test(r.aoutLabel));
t('setMonth(Juillet) → équipe de Kevin Éq.13', /Éq\.13\b/.test(r.juilLabel));
t('miroir Juillet de Kevin = Éq.2', /Éq\.2\b/.test(r.juilMirLabel));
t('liste équipes SCOPÉE au mois (< 50, pas 81)', r.scopedCount>5 && r.scopedCount<50);
t('recherche "PUGNETTI" trouve des résultats (tous mois)', r.searchCount>=1);
t('nom (me) sur fond OPAQUE → lisible', r.opaque===true);
console.log('   boards:',r.totalCount,'| mois:',r.moOpts.join(','),'| Août:',r.aoutLabel,'| Juil:',r.juilLabel,'→ miroir',r.juilMirLabel);
console.log('   scopé/mois:',r.scopedCount,'options | recherche PUGNETTI:',r.searchCount,'| me-bg:',r.bg);
await ctx.close(); await b.close();
console.log('\n'+(fail===0?'✅ DEPARTS v1.12.1 OK':'❌ KO')+'  PASS:'+pass+' FAIL:'+fail);
process.exit(fail===0?0:1);
