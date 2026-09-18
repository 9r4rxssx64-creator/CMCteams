/* ANCIENNETÉ ET MATRICULE : l'employé les renseigne LUI-MÊME, et ça s'enregistre.
 *
 * Kevin 2026-09-18 : « Je veux que tu rajoutes à la connexion et dans les fiches des personnes,
 * qu'ils puissent entrer leur année d'entrée dans la SBM, dans les jeux, donc leur ancienneté,
 * et leur numéro matricule SBM, pour enrichir la banque de données au fur et à mesure. »
 *
 * CHOIX ASSUMÉ : on range l'année dans les MÊMES champs que l'admin remplit déjà
 * (dateEntreeSbm / dateEntreeJeux, au 1er janvier). Créer « anneeSbm » à côté aurait donné deux
 * vérités qui finissent par se contredire (leçon #142).
 *
 * CE QUE CETTE GARDE EXIGE, sur la vraie page, connecté comme un VRAI employé :
 *   1. Les trois champs existent dans la fiche (année SBM, année jeux, matricule).
 *   2. Taper une année l'enregistre TOUTE SEULE (localStorage + envoi Firebase) au bon endroit.
 *   3. L'ancienneté s'affiche en années, juste sous le champ.
 *   4. Une année absurde (1800, 2999, « abc ») ne détruit PAS ce qui était déjà enregistré.
 *   5. Le matricule corrigé est gardé.
 *   6. La 1re connexion propose bien les trois champs.
 *   7. L'admin voit le matricule déclaré quand il diffère du compte.
 *
 *   node tests/verify-anciennete-fiche.mjs
 */
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs';
import { fileURLToPath } from 'node:url'; import { dirname, resolve, join } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.txt':'text/plain' };
const server = http.createServer((req,res)=>{ let p=decodeURIComponent((req.url||'/').split('?')[0]); if(p.startsWith('/CMCteams/'))p=p.slice('/CMCteams'.length); if(p.endsWith('/'))p+='index.html'; const f=join(ROOT,p.replace(/^\/+/,'')); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end('nf');} res.writeHead(200,{'content-type':MIME[(f.match(/\.[a-z0-9]+$/i)||[''])[0].toLowerCase()]||'application/octet-stream'}); fs.createReadStream(f).pipe(res); });
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const BASE=`http://127.0.0.1:${server.address().port}/CMCteams`;

const nav=await chromium.launch(); const ctx=await nav.newContext({viewport:{width:390,height:844}});
await ctx.route(/identitytoolkit|securetoken|firebasedatabase\.app/,r=>r.fulfill({status:200,contentType:'application/json',body:'{}'}));
const page=await ctx.newPage(); const errs=[]; page.on('pageerror',e=>errs.push(String(e)));

let OK=0, FAIL=0;
const ok=(m,d)=>{OK++;console.log('  ✅ '+m+(d?' — '+d:''));};
const ko=(m,d)=>{FAIL++;console.log('  ❌ '+m+(d?' — '+d:''));};

// ── Connecté comme un employé ordinaire (PAS l'admin) ───────────────────────
const EMP='U00062'; // LANDAU B
await page.addInitScript((uid)=>{const S={cmc_dver:'30',cmc_v706_total_wiped:'1',cmc_fam_restored_v116:'1',cmc_v805_famreset:'1',cmc_uid:uid,cmc_lastact:String(Date.now()),cmc_seen_v10_678:'1',cmc_cookies_consent:'1'};for(const k in S)localStorage.setItem(k,S[k]);}, EMP);
await page.goto(BASE+'/index.html',{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.A&&Array.isArray(A.employees)&&A.employees.length>100,{timeout:40000});

console.log('\n1. La fiche de l’employé (connecté comme '+EMP+')\n');
await page.evaluate(()=>{ sv('profil'); });
await page.waitForTimeout(400);

const champs = await page.evaluate(()=>['profil_anneeSbm','profil_anneeJeux','profil_matricule'].map(id=>!!document.getElementById(id)));
if(champs.every(Boolean)) ok('les 3 champs sont là (année SBM, année jeux, matricule)');
else ko('champ(s) manquant(s)', JSON.stringify(champs));

// 2. Taper une année → enregistré tout seul
const CUR = new Date().getFullYear();
const AN_SBM = String(CUR-11), AN_JEUX = String(CUR-8);
const r1 = await page.evaluate(async ({a,b,uid})=>{
  let fbCalls=0; const orig=window.fbWrite; window.fbWrite=function(k,v){ if(k==='cmc_reg')fbCalls++; return orig.apply(this,arguments); };
  const s1=document.getElementById('profil_anneeSbm'); s1.value=a; s1.dispatchEvent(new Event('input',{bubbles:true}));
  const s2=document.getElementById('profil_anneeJeux'); s2.value=b; s2.dispatchEvent(new Event('input',{bubbles:true}));
  await new Promise(r=>setTimeout(r,1200));
  const stock=JSON.parse(localStorage.getItem('cmc_reg')||'{}')[uid]||{};
  window.fbWrite=orig;
  return {memoire:{sbm:A.reg[uid].dateEntreeSbm, jeux:A.reg[uid].dateEntreeJeux},
          disque:{sbm:stock.dateEntreeSbm, jeux:stock.dateEntreeJeux},
          fbCalls,
          ancSbm:(document.getElementById('profil_ancSbm')||{}).textContent||'',
          ancJeux:(document.getElementById('profil_ancJeux')||{}).textContent||''};
}, {a:AN_SBM,b:AN_JEUX,uid:EMP});

if(r1.memoire.sbm===AN_SBM+'-01-01' && r1.memoire.jeux===AN_JEUX+'-01-01') ok('les années sont rangées au bon endroit', r1.memoire.sbm+' / '+r1.memoire.jeux);
else ko('mauvais rangement', JSON.stringify(r1.memoire));

if(r1.disque.sbm===AN_SBM+'-01-01') ok('enregistré sur l’appareil sans rien valider');
else ko('rien enregistré sur l’appareil', JSON.stringify(r1.disque));

if(r1.fbCalls>0) ok('envoyé au cloud (Firebase) pour que l’admin le voie', r1.fbCalls+' envoi(s)');
else ko('jamais envoyé au cloud');

if(/11\s*ans/.test(r1.ancSbm)) ok('l’ancienneté s’affiche sous le champ', r1.ancSbm.trim());
else ko('ancienneté SBM non affichée', JSON.stringify(r1.ancSbm));
if(/8\s*ans/.test(r1.ancJeux)) ok('l’ancienneté jeux s’affiche', r1.ancJeux.trim());
else ko('ancienneté jeux non affichée', JSON.stringify(r1.ancJeux));

// 3. Saisie absurde → ne détruit rien
const r2 = await page.evaluate(async (uid)=>{
  const out=[];
  for(const mauvais of ['1800', String(new Date().getFullYear()+5), 'abc']){
    const el=document.getElementById('profil_anneeSbm'); el.value=mauvais; el.dispatchEvent(new Event('input',{bubbles:true}));
    await new Promise(r=>setTimeout(r,900));
    out.push({mauvais, garde:A.reg[uid].dateEntreeSbm});
  }
  return out;
}, EMP);
const intact = r2.every(x=>x.garde===AN_SBM+'-01-01');
if(intact) ok('une année absurde (1800, futur, « abc ») n’efface pas ce qui était juste');
else ko('une saisie absurde a détruit la donnée', JSON.stringify(r2));

// 4. Matricule corrigé
const r3 = await page.evaluate(async (uid)=>{
  const el=document.getElementById('profil_matricule'); el.value='U09999'; el.dispatchEvent(new Event('input',{bubbles:true}));
  await new Promise(r=>setTimeout(r,900));
  return {mem:A.reg[uid].matricule, disque:(JSON.parse(localStorage.getItem('cmc_reg')||'{}')[uid]||{}).matricule};
}, EMP);
if(r3.mem==='U09999' && r3.disque==='U09999') ok('le matricule corrigé est gardé', r3.mem);
else ko('matricule non gardé', JSON.stringify(r3));

// 5. Première connexion : les 3 champs sont proposés
console.log('\n2. La première connexion\n');
const r4 = await page.evaluate(()=>{
  window.loginUid='U00072'; window._loginNom=''; window._loginPrenom=''; window._loginMat='';
  const h=vLoginRegister();
  return {sbm:h.indexOf('id="rAnSbm"')>=0, jeux:h.indexOf('id="rAnJeux"')>=0, mat:h.indexOf('id="rMat"')>=0,
          matCache:h.indexOf('id="rMat" type="hidden"')>=0};
});
if(r4.sbm&&r4.jeux) ok('l’inscription demande les deux années');
else ko('années absentes de l’inscription', JSON.stringify(r4));
if(r4.mat&&!r4.matCache) ok('l’inscription demande le matricule SBM (plus caché)');
else ko('matricule caché ou absent à l’inscription', JSON.stringify(r4));

// 6. Admin : voit le matricule déclaré quand il diffère
console.log('\n3. Ce que voit l’admin\n');
const r5 = await page.evaluate((uid)=>{
  A.user=A.employees.find(e=>e.id==='U11804')||A.user;
  A.reg[uid]=A.reg[uid]||{}; A.reg[uid].matricule='U09999';
  A.empQ='LANDAU';                 // la liste est repliée par défaut : on filtre pour faire apparaître la fiche
  window.editEmpId=uid;            // la fiche complète n'est rendue que dépliée
  const h=vEmps();
  return {affiche:h.indexOf('Matricule déclaré par l’employé')>=0 || h.indexOf('Matricule déclaré')>=0, contient:h.indexOf('U09999')>=0};
}, EMP);
if(r5.affiche&&r5.contient) ok('l’admin voit « matricule déclaré » et la valeur');
else ko('l’admin ne voit pas l’écart de matricule', JSON.stringify(r5));

console.log(`\n${OK} OK · ${FAIL} FAIL · erreurs JS : ${errs.length}`);
errs.slice(0,3).forEach(e=>console.log('   '+e));
console.log(`\n=== ${FAIL||errs.length?'ÉCHEC':'OK'} ===`);
await nav.close(); server.close();
process.exit(FAIL||errs.length?1:0);
