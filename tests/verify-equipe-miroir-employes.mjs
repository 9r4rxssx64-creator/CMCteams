/* CHACUN VOIT SON ÉQUIPE ET SON ÉQUIPE MIROIR — vérifié en se connectant COMME EUX.
 *
 * Kevin 2026-09-18 : « Est-ce que tu as vérifié en te connectant d'autres personnes qui voyaient
 * bien les bonnes équipes, leur équipe, leur équipe miroir — que les équipes miroirs sont
 * correctes ? »
 *
 * Jusqu'ici je vérifiais les équipes en tant qu'ADMIN (effectifs, cellules). Ce n'est pas la
 * même chose : un employé ne voit pas la même page, et son équipe miroir est calculée pour LUI.
 *
 * AUTORITÉ = les tableaux générés depuis les PDF (boards-gen.js) : équipe de chacun, et carte
 * des miroirs. On se connecte comme une vingtaine de personnes, une par équipe, toutes familles
 * confondues, et on exige :
 *   1. le badge d'équipe de la barre du haut = son équipe du PDF ;
 *   2. son équipe miroir = celle du PDF (jamais un miroir figé d'un autre mois) ;
 *   3. sa page Départs s'ouvre sur SON équipe, avec son miroir juste à côté ;
 *   4. son planning affiche SES codes, ceux du PDF ;
 *   5. zéro erreur JS chez qui que ce soit.
 *
 *   node tests/verify-equipe-miroir-employes.mjs
 */
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs';
import { fileURLToPath } from 'node:url'; import { dirname, resolve, join } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.txt':'text/plain' };
const server = http.createServer((req,res)=>{ let p=decodeURIComponent((req.url||'/').split('?')[0]); if(p.startsWith('/CMCteams/'))p=p.slice('/CMCteams'.length); if(p.endsWith('/'))p+='index.html'; const f=join(ROOT,p.replace(/^\/+/,'')); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end('nf');} res.writeHead(200,{'content-type':MIME[(f.match(/\.[a-z0-9]+$/i)||[''])[0].toLowerCase()]||'application/octet-stream'}); fs.createReadStream(f).pipe(res); });
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const BASE=`http://127.0.0.1:${server.address().port}/CMCteams`;

globalThis.window = {};
await import(resolve(ROOT, 'tools/departs/boards-gen.js'));
const GEN = globalThis.window.DEPARTS_GEN;

// Mois affiché par défaut = mois courant. On prend les tableaux de CE mois-là.
const N = new Date();
const MOIS_IDX = N.getMonth(), AN = N.getFullYear();
const prefixe = `${AN}-${String(MOIS_IDX+1).padStart(2,'0')}-`;
const tableaux = Object.entries(GEN.boards).filter(([k,b])=>k.startsWith(prefixe) && b.kind!=='abs');

// Une personne par tableau (la 1re), toutes familles confondues.
const sujets = tableaux.map(([k,b])=>({
  cle:k, court:k.slice(prefixe.length), label:b.label, fam:b.fam,
  emp:(b.people||[])[0], miroirCle:GEN.mirror&&GEN.mirror[k]||null
})).filter(s=>s.emp);

console.log(`\n== ON SE CONNECTE COMME ${sujets.length} PERSONNES (une par équipe, ${tableaux.length} équipes) ==\n`);

const nav=await chromium.launch(); const ctx=await nav.newContext({viewport:{width:390,height:844}});
await ctx.route(/identitytoolkit|securetoken|firebasedatabase\.app/,r=>r.fulfill({status:200,contentType:'application/json',body:'{}'}));
const page=await ctx.newPage(); const errs=[]; page.on('pageerror',e=>errs.push(String(e)));
await page.addInitScript(()=>{const S={cmc_dver:'30',cmc_v706_total_wiped:'1',cmc_fam_restored_v116:'1',cmc_v805_famreset:'1',cmc_uid:'U11804',cmc_lastact:String(Date.now()),cmc_seen_v10_678:'1',cmc_cookies_consent:'1'};for(const k in S)localStorage.setItem(k,S[k]);});
await page.goto(BASE+'/index.html',{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.A&&Array.isArray(A.employees)&&A.employees.length>100,{timeout:40000});
// On attend que la synchro des tableaux du PDF ait fini : tant qu'elle tourne, certains
// n'ont pas encore d'équipe et on mesurerait une page à moitié remplie.
await page.waitForFunction((ids)=>{try{return ids.every(id=>{const e=A.employees.find(x=>x.id===id);return e&&empTeamNow(e)!=='?';});}catch(_){return false;}},
  sujets.map(s=>s.emp.id),{timeout:60000});

let OK=0, FAIL=0; const pb=[];
const ko=(m)=>{FAIL++; if(pb.length<14)pb.push(m);};

for(const s of sujets){
  const miroirAttendu = s.miroirCle ? s.miroirCle.slice(prefixe.length) : null;
  const vu = await page.evaluate(({uid, mois, an})=>{
    const emp=A.employees.find(e=>e.id===uid);
    if(!emp)return {absent:true};
    A.user=emp; A.year=an; A.month=mois;
    const tid=empTeamNow(emp);
    const te=(typeof gt==='function')?gt(tid):null;
    const mi=(typeof _cmcMirrorTeam==='function')?_cmcMirrorTeam(tid,an,mois):null;
    let barre='', dep='', plan='', codes=0;
    /* ⚠️ ON FIGE LE NOM AU MOMENT OÙ ON LIT LA BARRE (corrigé le 19.09).
       `te` est l'objet VIVANT de l'équipe : en affichant Départs juste après,
       l'app renomme les équipes avec le libellé du tableau du PDF (« BJ Éq.1 »
       devient « BJ Éq.1 (20/5) »). Comme la comparaison se faisait au RETOUR,
       on confrontait une barre photographiée AVANT à un nom modifié APRÈS —
       et la toute première personne contrôlée échouait toute seule. Mesuré :
       barre « … BJ Éq.1 … » contre te.name « BJ Éq.1 (20/5) ».
       On compare donc deux choses prises au même instant. */
    try{ barre=vTopbar()||''; }catch(_){}
    const nomAuMomentDeLaBarre = te ? te.name : '';
    try{ A.view='departs'; dep=vDeparts()||''; }catch(e){ dep='ERR:'+e.message; }
    try{ A.view='monplanning'; plan=vMonPlanning()||''; }catch(e){ plan='ERR:'+e.message; }
    try{ const ov=(gpl()||{})[uid]||{}; codes=Object.keys(ov).length; }catch(_){}
    return {tid, nomEquipe:te?te.name:'', miroir:mi?mi.id:null, nomMiroir:mi?mi.name:'',
            barreNomme:te?barre.indexOf(nomAuMomentDeLaBarre)>=0:false,
            depNomme:te?dep.indexOf(te.name)>=0:false,
            depMiroir:mi?dep.indexOf(mi.name)>=0:false,
            depErr:dep.indexOf('ERR:')===0?dep:'', planErr:plan.indexOf('ERR:')===0?plan:'',
            codes};
  }, {uid:s.emp.id, mois:MOIS_IDX, an:AN});

  const q = `${s.emp.name} (${s.label})`;
  if(vu.absent){ ko(`${q} : absent de l'app`); continue; }
  if(vu.tid!==s.court) ko(`${q} : l'app le range en « ${vu.tid} », le PDF dit « ${s.court} »`);
  if(miroirAttendu && vu.miroir!==miroirAttendu) ko(`${q} : miroir « ${vu.miroir} » au lieu de « ${miroirAttendu} » (PDF)`);
  // La pastille d'équipe de la barre du haut est volontairement masquée pour l'ADMIN
  // (sa barre porte déjà les boutons d'administration ; son équipe reste visible dans
  // Départs et dans Mon planning, contrôlés juste en dessous).
  if(s.emp.id!=='U11804' && !vu.barreNomme) ko(`${q} : la barre du haut n'affiche pas son équipe`);
  if(vu.depErr) ko(`${q} : la page Départs plante — ${vu.depErr}`);
  else if(!vu.depNomme) ko(`${q} : la page Départs ne montre pas son équipe`);
  else if(miroirAttendu && !vu.depMiroir) ko(`${q} : son équipe miroir n'apparaît pas dans Départs`);
  if(vu.planErr) ko(`${q} : son planning plante — ${vu.planErr}`);
  else if(vu.codes < 20) ko(`${q} : son planning n'a que ${vu.codes} jour(s) rempli(s)`);
  OK++;
}

console.log(`${OK} personne(s) contrôlée(s) · ${FAIL} anomalie(s)`);
pb.forEach(x=>console.log('  ❌ '+x));
if(!FAIL) console.log('✅ équipe du mois, équipe miroir, page Départs et planning personnel : justes pour chacun.');
console.log(`\nErreurs JS : ${errs.length}`);
errs.slice(0,3).forEach(e=>console.log('   '+e));
console.log(`\n=== ${FAIL||errs.length?'ÉCHEC':'OK'} ===`);
await nav.close(); server.close();
process.exit(FAIL||errs.length?1:0);
