/* UN EMPLOYÉ ÉCRIT À KEVIN, KEVIN EST ALERTÉ, KEVIN RÉPOND, L'EMPLOYÉ LIT LA RÉPONSE.
 *
 * Kevin 2026-09-18 : « Vérifie aussi que les employés puissent m'envoyer des messages comme
 * c'était prévu, que j'aie une alerte, que je puisse leur répondre. Si besoin, passer par
 * Apex Chat, l'intégrer. Vérifie et va plus loin. »
 *
 * CE QUI MANQUAIT (mesuré) : le message partait bien (boîte admin + miroir lu par Apex), mais
 * il n'emportait PAS de clé de conversation (`dkey`). Or le bouton « Répondre » de la boîte
 * admin ne s'affiche QUE s'il y en a une → Kevin ne pouvait PAS répondre à un message venu de
 * l'app (seulement à ceux de la page Départs). Et même s'il avait répondu, l'app n'affichait
 * la réponse NULLE PART : l'employé écrivait dans le vide.
 *
 * CE QUE CETTE GARDE EXIGE, sur la vraie page :
 *   1. Un employé envoie → le message arrive dans la boîte admin ET dans le miroir Apex.
 *   2. Le message porte une clé de conversation (sinon pas de réponse possible).
 *   3. Kevin voit le bouton « Répondre » sur ce message.
 *   4. Kevin répond → la réponse est rangée sous la MÊME clé et envoyée au cloud.
 *   5. L'employé voit la réponse dans son fil, et il est alerté quand elle arrive.
 *   6. Un AUTRE employé ne voit NI le message NI la réponse.
 *
 *   node tests/verify-messages-kevin.mjs
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
await page.addInitScript(()=>{const S={cmc_dver:'30',cmc_v706_total_wiped:'1',cmc_fam_restored_v116:'1',cmc_v805_famreset:'1',cmc_uid:'U00072',cmc_lastact:String(Date.now()),cmc_seen_v10_678:'1',cmc_cookies_consent:'1'};for(const k in S)localStorage.setItem(k,S[k]);});
await page.goto(BASE+'/index.html',{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.A&&Array.isArray(A.employees)&&A.employees.length>100,{timeout:40000});
// les équipes du mois arrivent APRÈS les employés (application du seed) : on les attend,
// sinon on mesurerait « pas d'équipe ce mois » alors que la page n'a pas fini de se remplir.
// On attend que la synchro des tableaux du PDF ait donné SON équipe à l'expéditeur
// précisément : « plus de 50 personnes rangées » ne garantit pas que ce soit LUI (mesuré,
// échec intermittent). Même piège que la garde équipe/miroir.
await page.waitForFunction((id)=>{try{const e=A.employees.find(x=>x.id===id);return e&&empTeamNow(e)!=='?';}catch(_){return false;}},'U00072',{timeout:60000});

let OK=0, FAIL=0;
const ok=(m,d)=>{OK++;console.log('  ✅ '+m+(d?' — '+d:''));};
const ko=(m,d)=>{FAIL++;console.log('  ❌ '+m+(d?' — '+d:''));};

const EMP='U00072', AUTRE='U00062', TXT='Bonjour Kevin, un souci avec mon planning de septembre.';

console.log('\n1. L’employé écrit à Kevin\n');
const r1 = await page.evaluate(({emp,txt})=>{
  localStorage.removeItem('cmc_kevin_inbox'); localStorage.removeItem('ax_cmc_kevin_inbox');
  localStorage.removeItem('cmc_dep_reply'); localStorage.removeItem('cmc_kevin_reply_seen');
  A.user=A.employees.find(e=>e.id===emp);
  A.reg[emp]=Object.assign({},A.reg[emp]||{},{nom:'ROSSI',prenom:'Jean'});
  let envois=0; const orig=window.fbWrite; window.fbWrite=function(k){ if(k==='cmc_kevin_inbox'||k==='ax_cmc_kevin_inbox')envois++; return orig.apply(this,arguments); };
  const parti=cmcSendToKevin(txt);
  window.fbWrite=orig;
  const box=JSON.parse(localStorage.getItem('cmc_kevin_inbox')||'[]');
  const miroir=JSON.parse(localStorage.getItem('ax_cmc_kevin_inbox')||'[]');
  return {parti, box:box.length, miroir:miroir.length, dkey:(box[0]||{}).dkey||'', equipe:(box[0]||{}).team||'', attendue:empTeamNow(A.user)||'', figee:A.user.team||'', envois};
}, {emp:EMP, txt:TXT});

if(r1.parti && r1.box===1) ok('le message part et arrive dans la boîte de Kevin');
else ko('message non arrivé', JSON.stringify(r1));
if(r1.miroir===1) ok('copié dans le miroir que lit Apex (ax_cmc_kevin_inbox)');
else ko('miroir Apex vide');
if(r1.envois>=2) ok('envoyé au cloud pour arriver sur l’iPhone de Kevin', r1.envois+' envoi(s)');
else ko('pas envoyé au cloud', String(r1.envois));
if(r1.dkey==='ROSSI_JEAN') ok('le message porte sa clé de conversation', r1.dkey);
else ko('clé de conversation absente ou fausse — Kevin ne pourra pas répondre', JSON.stringify(r1.dkey));
if(r1.equipe===r1.attendue && r1.equipe!=='?') ok('l’équipe jointe est celle DU MOIS (pas la fiche figée)', r1.equipe+' — fiche figée : '+r1.figee);
else ko('l’équipe jointe n’est pas celle du mois', JSON.stringify(r1));

console.log('\n2. Kevin est alerté, voit le message et peut répondre\n');
const r2 = await page.evaluate(()=>{
  A.user=A.employees.find(e=>e.id==='U11804');
  const h=vKevinInbox();
  // l'alerte : _checkKevinInbox est ce que la synchro appelle quand un message arrive
  let alerte=''; const origToast=window.toast; window.toast=function(m){alerte=String(m||'');};
  localStorage.removeItem('cmc_kevin_notif_ts');
  A.view='accueil';
  _checkKevinInbox(JSON.parse(localStorage.getItem('cmc_kevin_inbox')||'[]'));
  window.toast=origToast;
  return {repondre:h.indexOf('Répondre')>=0, voitTexte:h.indexOf('planning de septembre')>=0, alerte};
});
if(r2.voitTexte) ok('Kevin voit le message dans sa boîte');
else ko('message absent de la boîte de Kevin');
if(r2.repondre) ok('le bouton « Répondre » est là');
else ko('pas de bouton « Répondre » — Kevin ne peut pas répondre');
if(/ROSSI|planning/.test(r2.alerte)) ok('Kevin est alerté à l’arrivée du message', r2.alerte.slice(0,50));
else ko('aucune alerte à l’arrivée', JSON.stringify(r2.alerte));

console.log('\n3. Kevin répond, l’employé lit la réponse\n');
const REP='Je regarde ça tout de suite, je te réponds ce soir.';
const r3 = await page.evaluate((rep)=>{
  A.user=A.employees.find(e=>e.id==='U11804');
  let envoiRep=0; const orig=window.fbWrite; window.fbWrite=function(k){ if(k==='cmc_dep_reply')envoiRep++; return orig.apply(this,arguments); };
  const parti=cmcReplyToDep('ROSSI_JEAN',rep);
  window.fbWrite=orig;
  const all=JSON.parse(localStorage.getItem('cmc_dep_reply')||'{}');
  return {parti, rangee:(all['ROSSI_JEAN']||[]).length, envoiRep};
}, REP);
if(r3.parti && r3.rangee===1) ok('la réponse est rangée sous la conversation de l’employé');
else ko('réponse non rangée', JSON.stringify(r3));
if(r3.envoiRep>0) ok('la réponse part au cloud');
else ko('réponse jamais envoyée au cloud');

const r4 = await page.evaluate((emp)=>{
  A.user=A.employees.find(e=>e.id===emp);
  const fil=cmcMonFilKevin();
  // l'alerte côté employé quand la réponse arrive
  let alerte=''; const origToast=window.toast; window.toast=function(m){alerte=String(m||'');};
  localStorage.removeItem('cmc_kevin_reply_seen');
  Object.defineProperty(document,'visibilityState',{get:()=>'visible',configurable:true});
  _checkKevinReply(JSON.parse(localStorage.getItem('cmc_dep_reply')||'{}'));
  window.toast=origToast;
  // le fil dans la fenêtre « Écrire à Kevin »
  document.querySelectorAll('#cmcContactKevin').forEach(n=>n.remove());
  cmcOpenContactKevin();
  const vu=(document.getElementById('cmcContactKevin')||{}).innerHTML||'';
  return {n:fil.length, deKevin:fil.filter(m=>!m.moi).length, alerte,
          filVisible:vu.indexOf('ce soir')>=0, moiVisible:vu.indexOf('planning de septembre')>=0};
}, EMP);
if(r4.n===2 && r4.deKevin===1) ok('le fil de l’employé contient son message ET la réponse');
else ko('fil incomplet', JSON.stringify(r4));
if(r4.filVisible && r4.moiVisible) ok('la conversation s’affiche dans sa fenêtre « Écrire à Kevin »');
else ko('la réponse ne s’affiche nulle part pour l’employé', JSON.stringify(r4));
if(/Kevin/.test(r4.alerte)) ok('l’employé est alerté quand Kevin répond', r4.alerte.slice(0,50));
else ko('aucune alerte pour l’employé', JSON.stringify(r4.alerte));

console.log('\n4. Personne d’autre ne lit cette conversation\n');
const r5 = await page.evaluate((autre)=>{
  A.user=A.employees.find(e=>e.id===autre)||A.employees[5];
  A.reg[A.user.id]=Object.assign({},A.reg[A.user.id]||{},{nom:'LANDAU',prenom:'Bruno'});
  const fil=cmcMonFilKevin();
  document.querySelectorAll('#cmcContactKevin').forEach(n=>n.remove());
  cmcOpenContactKevin();
  const vu=(document.getElementById('cmcContactKevin')||{}).innerHTML||'';
  return {n:fil.length, voitMsg:vu.indexOf('planning de septembre')>=0, voitRep:vu.indexOf('ce soir')>=0};
}, AUTRE);
if(r5.n===0 && !r5.voitMsg && !r5.voitRep) ok('un autre employé ne voit ni le message ni la réponse');
else ko('FUITE : un autre employé voit la conversation', JSON.stringify(r5));

console.log(`\n${OK} OK · ${FAIL} FAIL · erreurs JS : ${errs.length}`);
errs.slice(0,3).forEach(e=>console.log('   '+e));
console.log(`\n=== ${FAIL||errs.length?'ÉCHEC':'OK'} ===`);
await nav.close(); server.close();
process.exit(FAIL||errs.length?1:0);
