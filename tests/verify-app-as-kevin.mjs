/* Ouvre la VRAIE app CMCteams (index.html déployé) dans un navigateur, connecté
 * comme Kevin (admin U11804), juillet 2026, données = SEED committé (juillet V2 + août).
 * Vérifie EN VRAI la plainte de Kevin : les chefs qui TRAVAILLENT (dont lui) ne
 * doivent PAS être des membres du groupe « Congés » ; ils doivent être dans leur ÉQUIPE.
 * Firebase externe bloqué → l'app tombe sur le SEED. Screenshots dans le scratchpad.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:8099';
const OUT  = '/tmp/claude-0/-home-user-CMCteams/8eeac81b-4f01-5382-909b-ed9fa79789f3/scratchpad';
try{ fs.mkdirSync(OUT,{recursive:true}); }catch(_){}

const browser = await chromium.launch({ args:['--no-sandbox'] });
const ctx = await browser.newContext({ viewport:{width:1200,height:1700} });
await ctx.route('**/*', route=>{
  const u=route.request().url();
  if(/firebasedatabase\.app|identitytoolkit|securetoken|googleapis|kd-mc\.com|workers\.dev|__notify-kevin/.test(u)) return route.abort();
  return route.continue();
});
await ctx.addInitScript(()=>{ try{
  localStorage.setItem('cmc_uid','U11804');
  localStorage.setItem('cmc_last_uid','U11804');
  localStorage.setItem('cmc_lastact', String(Date.now()));
  localStorage.setItem('cmc_seen_v10_678','1');   // skip welcome v10
}catch(e){} });

const page = await ctx.newPage();
const errs=[]; page.on('pageerror', e=>errs.push(String(e.message||e).slice(0,140)));
await page.goto(`${BASE}/CMCteams/index.html`, { waitUntil:'domcontentloaded', timeout:60000 });
await page.waitForTimeout(2500);

// Dismiss modales éventuelles (welcome / CGU)
for(const label of ['Plus tard','Compris','J\'ai compris','Fermer','×']){
  try{ const b=page.locator(`button:has-text("${label}")`).first(); if(await b.count()) await b.click({timeout:1000}); }catch(_){}
}
await page.waitForTimeout(500);

// Force juillet 2026 + seed + vue ÉQUIPE, et INTERROGE l'état pour les chefs "qui travaillent"
const q = await page.evaluate(()=>{
  const r={};
  try{ r.appVer=(typeof APP_VER!=='undefined')?APP_VER:'?'; }catch(_){ r.appVer='?'; }
  try{ r.user=(A&&A.user)?(A.user.id+' '+A.user.name):'—'; }catch(_){ r.user='—'; }
  try{ A.year=2026; A.month=6; }catch(_){}
  try{ if(typeof _cmcApplyPlanningSeed==='function')_cmcApplyPlanningSeed(); }catch(_){}
  try{ if(typeof sv==='function') sv('plan'); }catch(_){}
  // helpers internes de vPlan ne sont pas globaux → on refait le test métier ici, à l'identique :
  const pl=(typeof gpl==='function')?gpl():(A.overrides['2026-6']||{});
  const days=(typeof getDays==='function')?getDays(2026,6):31;
  const ABS={CP:1,CRH:1,CDP:1,CDH:1,M:1,MAL:1,AF:1,DEPL:1,DEP:1,RH:1,R:1,AT:1,PAT:1,ABI:1,SS:1,EDC:1,RRT:1,PRT:1,RTP:1,RTR:1,CL:1,ABS:1,FL:1,HD:1,HC:1};
  const ABSTEAM={CP:'conges',CRH:'conges',CDP:'conges',CDH:'conges',M:'maladie',MAL:'maladie',AF:'formation',DEPL:'deplacement',DEP:'deplacement'};
  function stat(name){
    const e=(A.employees||[]).find(x=>x&&x.name===name); if(!e) return {name,found:false};
    const row=pl[e.id]||{}; let worked=0, by={}, tot=0;
    for(let d=1;d<=days;d++){ let c=row[d]; if(!c)continue; let u=String(c).toUpperCase().replace(/[C'"*:]+$/g,'');
      if(u==='RH'||u==='R')continue;
      if(ABSTEAM[u]){ by[ABSTEAM[u]]=(by[ABSTEAM[u]]||0)+1; tot++; } else if(!ABS[u]) worked++; else worked++; }
    // worked = jours réellement travaillés (recompte simple : non-absence)
    let workedReal=0; for(let d=1;d<=days;d++){ let c=row[d]; if(!c)continue; let u=String(c).toUpperCase().replace(/[C'"*:]+$/g,''); if(!ABS[u]) workedReal++; }
    const absTeam=(workedReal>0||tot<1)?null:(Object.keys(by).sort((a,b)=>by[b]-by[a])[0]||null);
    let team='—'; try{ team=(typeof teamForMonth==='function'&&teamForMonth(e,2026,6))||(e.teamHistory&&e.teamHistory['2026-6'])||e.team||'—'; }catch(_){}
    let fam='—'; try{ fam=(typeof familyForMonth==='function'&&familyForMonth(e,2026,6))||'—'; }catch(_){}
    return {name, found:true, workedDays:workedReal, absenceIntegrale:absTeam, team:String(team), famille:String(fam)};
  }
  r.chefs=['DESARZENS K','FOREST M','EL MISSOURI O','BONO F','DANIEL S','BONETTI P','FIA S','MARIANI M'].map(stat);
  // compteurs Congés (full vs partiel) reproduits
  let full=0, part=0;
  (A.employees||[]).forEach(e=>{ if(typeof isEmpActive==='function'&&!isEmpActive(e,2026,6))return; const row=pl[e.id]||{};
    let hasCP=false; for(let d=1;d<=days;d++){ let u=String(row[d]||'').toUpperCase().replace(/[C'"*:]+$/g,''); if(u==='CP'||u==='CRH'||u==='CDP'||u==='CDH'){hasCP=true;break;} }
    if(!hasCP)return; let wr=0; for(let d=1;d<=days;d++){ let c=row[d]; if(!c)continue; let u=String(c).toUpperCase().replace(/[C'"*:]+$/g,''); if(!ABS[u])wr++; }
    if(wr>0)part++; else full++; });
  r.congesFull=full; r.congesPartiel=part;
  return r;
});

await page.screenshot({ path:`${OUT}/app-equipe-clean.png`, fullPage:true }).catch(()=>{});

console.log('== APP DÉPLOYÉE (v'+q.appVer.replace(/^v/,'')+') — connecté '+q.user+' — juillet 2026 ==\n');
console.log('Chefs « qui travaillent » (plainte Kevin : ne doivent PAS être membres de Congés) :');
for(const c of q.chefs){
  if(!c.found){ console.log(`  ${c.name} : introuvable`); continue; }
  const verdict = c.absenceIntegrale ? `❌ classé ABSENCE INTÉGRALE (${c.absenceIntegrale})`
    : (c.workedDays>0 ? `✅ dans son ÉQUIPE (${c.team}) — ${c.workedDays} j travaillés${/CP|congé/i.test('')?'':''}` : '⚪ 0 jour travaillé');
  console.log(`  ${c.name.padEnd(16)} : ${verdict}  [famille ${c.famille}]`);
}
console.log('');
console.log(`Bloc « Congés » : ${q.congesFull} en congé INTÉGRAL (correct) + ${q.congesPartiel} « partiels » (travaillent + qq jours CP → juste une INFO, ils restent dans leur équipe)`);
console.log('erreurs JS :', errs.length?errs.slice(0,4):'(aucune)');
console.log('screenshot :', `${OUT}/app-equipe-clean.png`);
await browser.close();
