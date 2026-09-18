// GARDE — AUCUNE ÉQUIPE INVENTÉE (CMCteams v9.905, 2026-09-18)
//
// Plusieurs passes de l'app « devinent » les équipes d'après les jours de repos (utile pour
// les mois SANS PDF) et numérotent à la suite : 1, 2, 3… Sur un mois QUI A son PDF, elles
// pouvaient ranger quelqu'un dans un numéro qui n'existe nulle part — mesuré : VERZELLO O,
// que le PDF d'octobre met en CONGÉS, se retrouvait en « Éq.21 ».
//
// Cette garde ouvre l'app dans un vrai navigateur, affiche les 4 mois, et exige que CHAQUE
// personne rangée dans une équipe le soit dans un tableau qui existe VRAIMENT dans le PDF de
// ce mois-là (équipe de travail OU groupe d'absence), et qu'elle figure bien dedans.
import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
const ROOT = process.cwd();
const TYPES={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css'};
const server=createServer((req,res)=>{
  let p=decodeURIComponent(req.url.split('?')[0]).replace(/^\/CMCteams/,'');
  if(p==='/'||p==='')p='/index.html';
  const f=join(ROOT,p);
  if(existsSync(f)&&!f.includes('..')){res.writeHead(200,{'Content-Type':TYPES[extname(f)]||'text/plain'});res.end(readFileSync(f));}
  else{res.writeHead(404);res.end('');}
});
await new Promise(r=>server.listen(8124,r));
const b=await chromium.launch(); const ctx=await b.newContext();
await ctx.route('**/*firebase*/**',r=>r.fulfill({status:200,body:'{}'}));
await ctx.route('**/identitytoolkit**',r=>r.fulfill({status:200,body:'{}'}));
const p=await ctx.newPage();
await p.addInitScript(()=>{['cmc_dver:30','cmc_v706_total_wiped:1','cmc_fam_restored_v116:1','cmc_v805_famreset:1','cmc_uid:U11804','cmc_seen_v10_678:1','cmc_cookies_consent:1'].forEach(x=>{const [k,v]=x.split(':');localStorage.setItem(k,v);});localStorage.setItem('cmc_lastact',String(Date.now()));});
await p.goto('http://localhost:8124/CMCteams/index.html',{waitUntil:'load'});
await p.waitForFunction(()=>window.A&&Array.isArray(A.employees)&&typeof dc==='function',{timeout:30000});
await p.waitForTimeout(2500);
let total=0, ko=0;
for (const [y,m,lab] of [[2026,9,'octobre'],[2026,8,'septembre'],[2026,7,'août'],[2026,6,'juillet']]) {
  await p.evaluate(({y,m})=>{ A.year=y;A.month=m; try{_cmcApplyPlanningSeed();}catch(e){} A.view='plan'; try{dc();}catch(e){} },{y,m});
  await p.waitForTimeout(3500);
  const r=await p.evaluate(({y,m})=>{
    const key=y+'-'+m, pre=y+'-'+String(m+1).padStart(2,'0')+'-';
    const boards={}; Object.keys(window.DEPARTS_GEN.boards).forEach(bk=>{ if(bk.indexOf(pre)===0){ boards[bk.slice(pre.length)]=(window.DEPARTS_GEN.boards[bk].people||[]).map(x=>x.name); } });
    const bad=[];
    (A.employees||[]).forEach(e=>{
      const t=e&&e.teamHistory&&e.teamHistory[key]; if(!t)return;
      if(!boards[t]) { bad.push(e.id+'/'+e.name+' → équipe inconnue '+t); return; }
      if(boards[t].indexOf(e.name)<0) bad.push(e.id+'/'+e.name+' → rangé en '+t+' mais absent de ce tableau');
    });
    return {bad, n:(A.employees||[]).filter(e=>e&&e.teamHistory&&e.teamHistory[key]).length};
  },{y,m});
  total+=r.n; ko+=r.bad.length;
  console.log(`${lab.padEnd(10)} : ${r.n} personnes rangées · ${r.bad.length} en trop`);
  r.bad.slice(0,6).forEach(x=>console.log('   ❌ '+x));
}
console.log(`\n${total} rangements vérifiés · ${ko} incohérent(s)`);
console.log(ko ? '\n❌ des personnes sont rangées dans une équipe qui n\'existe pas dans le PDF' : "\n✅ aucune équipe inventée : chaque personne est dans un tableau qui existe vraiment");
await b.close(); server.close();
process.exit(ko?1:0);
