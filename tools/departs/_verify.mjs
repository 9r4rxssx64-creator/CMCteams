import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = 'file://' + resolve(__dirname, 'index.html');
const b = await chromium.launch({ headless: true });
let pass=0, fail=0; const t=(l,ok)=>{console.log((ok?'  ✅ ':'  ❌ ')+l);ok?pass++:fail++;};

// 1) load default
let ctx = await b.newContext(); let page = await ctx.newPage();
const errs=[]; page.on('pageerror',e=>errs.push(String(e)));
await page.goto(file,{waitUntil:'networkidle',timeout:30000});
await page.waitForTimeout(500);
const r = await page.evaluate(()=>{
  const gen = window.DEPARTS_GEN;
  const ids = Object.keys(BOARDS);
  const aout = ids.filter(id=>BOARDS[id].monthIdx===7);
  const juil = ids.filter(id=>BOARDS[id].monthIdx===6);
  const def = (typeof BID!=='undefined')?BID:null;
  // duplicates? old hardcoded juillet ids like 2026-07-bj1 should be gone
  const oldJuil = ids.filter(id=>/^2026-07-(bj1|roul1|roul2|abs)$/.test(id));
  // mirror of Kevin's juillet team
  const kJuil = ids.find(id=>id.indexOf('2026-07')===0 && BOARDS[id].people.some(p=>/DESARZENS K/.test(p.name)));
  const kMir = kJuil? mirrorBoardId(kJuil):null;
  // setMe by matricule
  let meByIdName=null; try{ setMe('U11804'); meByIdName=ME; }catch(e){ meByIdName='ERR:'+e.message; }
  const curBoardLabel = (typeof B!=='undefined'&&B)?B.label:'(none)';
  return { genBoards:Object.keys(gen.boards).length, genMonths:gen.months.map(m=>m.label),
    aout:aout.length, juil:juil.length, oldJuil:oldJuil.length, def, defLabel:BOARDS[def]?BOARDS[def].label:'?',
    kJuil, kMir, kMirLabel:kMir?BOARDS[kMir].label:'(aucun)', meByIdName, curBoardLabel };
});
t('aucune pageerror', errs.length===0);
t('boards générés mergés (>70)', r.genBoards>70);
t('mois générés = Août + Juillet', r.genMonths.length===2);
t('boards Août présents', r.aout>30);
t('boards Juillet présents', r.juil>30);
t('anciens boards Juillet hardcodés supprimés (0 doublon)', r.oldJuil===0);
t('défaut = Août (mois le plus récent)', /Août/.test(r.defLabel));
t('équipe Juillet de Kevin trouvée', !!r.kJuil);
t('miroir Juillet de Kevin résolu (Éq.2)', /Éq\.2\b/.test(r.kMirLabel));
t('setMe("U11804") → DESARZENS K', r.meByIdName==='DESARZENS K');
console.log('   defaut:',r.defLabel,'| Kevin juil:',r.kJuil,'→ miroir:',r.kMirLabel);
await ctx.close();

// 2) deep-link ?me=U11804 → opens on Kevin's board
ctx = await b.newContext(); page = await ctx.newPage();
const errs2=[]; page.on('pageerror',e=>errs2.push(String(e)));
await page.goto(file+'?me=U11804',{waitUntil:'networkidle',timeout:30000});
await page.waitForTimeout(400);
const r2 = await page.evaluate(()=>({ me:ME, board:(typeof B!=='undefined'&&B)?B.label:'?', hasKevin:(B&&B.people||[]).some(p=>/DESARZENS K/.test(p.name)) }));
t('?me=U11804 : ME = DESARZENS K', r2.me==='DESARZENS K');
t('?me=U11804 : ouvre sur l\'équipe de Kevin', r2.hasKevin===true);
console.log('   deep-link board:',r2.board,'| me:',r2.me, errs2.length?('· err '+errs2[0]):'');
await ctx.close();

await b.close();
console.log('\n'+(fail===0?'✅ DEPARTS OK':'❌ KO')+'  PASS:'+pass+' FAIL:'+fail);
process.exit(fail===0?0:1);
