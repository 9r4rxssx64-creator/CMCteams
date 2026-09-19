/* LES MOIS DÉJÀ PASSÉS NE SONT PLUS AFFICHÉS — SAUF À L'ADMIN (historique).
 *
 * Kevin 2026-09-18 : « Enlève les mois passés dans l'app. Seulement en historique pour moi
 * l'admin. »
 *
 * CE QUE CETTE GARDE EXIGE, dans un vrai navigateur, sur les DEUX surfaces :
 *   CMCteams (index.html)
 *     1. Employé : la flèche « ‹ » ne remonte plus avant le mois en cours, et elle est
 *        visiblement inerte (pas un bouton mort qui ne réagit pas).
 *     2. Employé : s'il arrive quand même sur un mois passé (mémoire de l'appareil, lien
 *        partagé), l'app le ramène au mois en cours au premier rendu.
 *     3. Admin : rien ne change, tout l'historique reste accessible.
 *   Page Départs (tools/departs)
 *     4. La liste des mois ne propose aucun mois passé hors mode admin ; en admin, si.
 *
 *   node tests/verify-mois-passes.mjs
 */
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs';
import { fileURLToPath } from 'node:url'; import { dirname, resolve, join } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.txt':'text/plain' };
const server = http.createServer((req,res)=>{ let p=decodeURIComponent((req.url||'/').split('?')[0]); if(p.startsWith('/CMCteams/'))p=p.slice('/CMCteams'.length); if(p.endsWith('/'))p+='index.html'; const f=join(ROOT,p.replace(/^\/+/,'')); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end('nf');} res.writeHead(200,{'content-type':MIME[(f.match(/\.[a-z0-9]+$/i)||[''])[0].toLowerCase()]||'application/octet-stream'}); fs.createReadStream(f).pipe(res); });
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const BASE=`http://127.0.0.1:${server.address().port}/CMCteams`;

let OK=0, FAIL=0;
const ok=(m)=>{OK++;console.log('  ✅ '+m);};
const ko=(m)=>{FAIL++;console.log('  ❌ '+m);};

const nav=await chromium.launch(); const ctx=await nav.newContext({viewport:{width:390,height:844}});
await ctx.route(/identitytoolkit|securetoken|firebasedatabase\.app/,r=>r.fulfill({status:200,contentType:'application/json',body:'{}'}));
const errs=[];

console.log('== MOIS PASSÉS — historique réservé à l’admin ==\n');

// ───────────────────────── CMCteams ─────────────────────────
const page=await ctx.newPage(); page.on('pageerror',e=>errs.push('app: '+e));
await page.addInitScript(()=>{const S={cmc_dver:'30',cmc_v706_total_wiped:'1',cmc_fam_restored_v116:'1',cmc_v805_famreset:'1',cmc_uid:'U11804',cmc_lastact:String(Date.now()),cmc_seen_v10_678:'1',cmc_cookies_consent:'1'};for(const k in S)localStorage.setItem(k,S[k]);});
await page.goto(BASE+'/index.html',{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.A&&Array.isArray(A.employees)&&A.employees.length>100,{timeout:40000});
await page.waitForTimeout(3000);

// 3. Admin : l'historique reste ouvert
const adm = await page.evaluate(()=>{
  const n=new Date(); A.year=n.getFullYear(); A.month=n.getMonth(); dc();
  const avant=A.year+'-'+A.month; prevM();
  return { avant, apres:A.year+'-'+A.month, autorise: typeof cmcHistoriqueAutorise==='function' && cmcHistoriqueAutorise() };
});
adm.autorise ? ok('admin reconnu comme ayant droit à l’historique') : ko('admin PAS reconnu (cmcHistoriqueAutorise faux)');
adm.avant !== adm.apres ? ok(`admin : la flèche remonte bien dans le passé (${adm.avant} → ${adm.apres})`)
                        : ko('admin : la flèche ne remonte plus — régression, il perd son historique');

// 1. + 2. Employé
const emp = await page.evaluate(()=>{
  const n=new Date();
  A.__save=A.user;
  A.user=(A.employees||[]).find(e=>e.id!=='U11804')||A.user;
  try{ if(typeof _viewAs!=='undefined') window.__va=_viewAs, _viewAs=null; }catch(_){}
  A.view='planning';
  A.year=n.getFullYear(); A.month=n.getMonth(); dc();
  const avant=A.year+'-'+A.month;
  prevM();
  const apresFleche=A.year+'-'+A.month;
  // flèche visiblement inerte ?
  const fleches=Array.from(document.querySelectorAll('[onclick="prevM()"]'));
  const inerte = fleches.length>0 && fleches.every(el=>el.getAttribute('data-moisbloque')==='1');
  // atterrissage forcé sur un mois passé → doit être ramené
  A.month = n.getMonth()===0 ? 11 : n.getMonth()-1;
  A.year  = n.getMonth()===0 ? n.getFullYear()-1 : n.getFullYear();
  dc();
  const apresClamp=A.year+'-'+A.month;
  // L'AUTRE SENS : masquer le passe ne doit PAS enfermer l'employe sur le mois
  // courant. Son planning du mois suivant, deja importe, doit rester atteignable.
  A.year=n.getFullYear(); A.month=n.getMonth(); dc();
  nextM();
  const apresAvance=A.year+'-'+A.month;
  const nbSuivant=(A.overrides&&A.overrides[apresAvance])?Object.keys(A.overrides[apresAvance]).length:0;
  const res={ avant, apresFleche, apresClamp, inerte, nbFleches:fleches.length, attendu:n.getFullYear()+'-'+n.getMonth(), apresAvance, nbSuivant };
  A.user=A.__save; delete A.__save;
  try{ if(typeof _viewAs!=='undefined') _viewAs=window.__va; }catch(_){}
  return res;
});
emp.apresFleche === emp.avant ? ok('employé : la flèche « ‹ » ne remonte plus avant le mois en cours')
                              : ko(`employé : il est remonté dans le passé (${emp.avant} → ${emp.apresFleche})`);
emp.inerte ? ok('employé : la flèche est visiblement inerte (pas un bouton mort)')
           : ko(`employé : la flèche reste active à l’écran (bouton mort) — ${emp.nbFleches} flèche(s) vue(s)`);
emp.apresClamp === emp.attendu ? ok('employé posé sur un mois passé → ramené au mois en cours')
                               : ko(`employé resté sur un mois passé (${emp.apresClamp}, attendu ${emp.attendu})`);
// Symétrie : le mois SUIVANT (déjà importé) doit rester atteignable — sinon on a
// « nettoyé » le passé en privant tout le monde du planning à venir.
if (!emp.nbSuivant && emp.apresAvance === emp.avant) console.log('  ·  (aucun mois suivant importé — rien à atteindre)');
else emp.apresAvance !== emp.avant && emp.nbSuivant > 0
  ? ok(`employé : la flèche « › » atteint bien le mois suivant (${emp.apresAvance}, ${emp.nbSuivant} personnes)`)
  : ko(`employé enfermé sur le mois courant : « › » donne ${emp.apresAvance} avec ${emp.nbSuivant} personne(s) — il perd son planning à venir`);
await page.close();

// ───────────────────────── Page Départs (light) ─────────────────────────
const p2=await ctx.newPage(); p2.on('pageerror',e=>errs.push('light: '+e));
await p2.goto(BASE+'/tools/departs/index.html',{waitUntil:'domcontentloaded'});
await p2.waitForTimeout(2500);
const dep = await p2.evaluate(()=>{
  const lire=()=>Array.from(document.querySelectorAll('#moSel option')).map(o=>o.value).filter(Boolean);
  const n=new Date(), cur=n.getFullYear()*12+n.getMonth();
  const passe=(v)=>{const [y,m]=v.split('-').map(Number); return (y*12+m)<cur;};
  document.body.classList.remove('admin'); try{fillMoSel();}catch(_){}
  const sansAdmin=lire();
  document.body.classList.add('admin'); try{fillMoSel();}catch(_){}
  const avecAdmin=lire();
  document.body.classList.remove('admin'); try{fillMoSel();}catch(_){}
  // L'AUTRE MOITIE DE LA REGLE : « le mois courant ET les mois futurs importes ».
  // Ne verifier que « aucun mois passe » laisserait passer un filtre trop large qui
  // emporterait aussi octobre — la liste serait propre et l'employe n'aurait plus
  // son planning a venir (lecon #142 : une garde qui ne regarde qu'un sens).
  const attendus=(window.DEP_GEN_MONTHS||[])
    .filter(m=>(m.year*12+m.monthIdx)>=cur)
    .map(m=>m.year+'-'+m.monthIdx);
  const manquants=attendus.filter(v=>sansAdmin.indexOf(v)<0);
  return { sansAdmin, avecAdmin, passesSansAdmin:sansAdmin.filter(passe), passesAvecAdmin:avecAdmin.filter(passe), attendus, manquants };
});
if (!dep.avecAdmin.length) ko('page Départs : aucune liste de mois (test impossible)');
else {
  dep.passesSansAdmin.length === 0
    ? ok(`page Départs : ${dep.sansAdmin.length} mois proposé(s) hors admin, aucun passé`)
    : ko(`page Départs : ${dep.passesSansAdmin.length} mois passé(s) encore proposés hors admin (${dep.passesSansAdmin.join(', ')})`);
  if (!dep.attendus.length) console.log('  ·  (aucun mois courant/futur généré — rien à exiger)');
  else dep.manquants.length === 0
    ? ok(`page Départs : les ${dep.attendus.length} mois à venir/en cours restent proposés à l’employé (${dep.attendus.join(', ')})`)
    : ko(`page Départs : ${dep.manquants.length} mois NON passé(s) retiré(s) à l’employé (${dep.manquants.join(', ')}) — il perd son planning à venir`);
  if (dep.passesAvecAdmin.length) ok(`page Départs : l’admin retrouve l’historique (${dep.passesAvecAdmin.length} mois passé(s))`);
  else console.log('  ·  (aucun mois passé dans les données générées — rien à retrouver côté admin)');
}
// Même exigence que dans l'app : arriver sur un mois passé (mémoire de l'appareil, lien
// partagé) doit ramener au mois en cours. Sans ça, la liste est propre mais la page
// affiche quand même le planning d'un mois révolu.
const depClamp = await p2.evaluate(() => {
  const n = new Date(), cur = n.getFullYear()*12 + n.getMonth();
  const passe = (window.DEP_GEN_MONTHS || []).filter(m => (m.year*12+m.monthIdx) < cur);
  if (!passe.length) return { saute: true };
  document.body.classList.remove('admin');
  window.CURMO = passe[0].year + '-' + passe[0].monthIdx;
  try { fillMoSel(); } catch(_) {}
  const [y, mi] = String(window.CURMO).split('-').map(Number);
  return { pose: passe[0].year + '-' + passe[0].monthIdx, apres: window.CURMO, encorePasse: (y*12+mi) < cur };
});
if (depClamp.saute) console.log('  ·  (aucun mois passé généré — rien à ramener)');
else depClamp.encorePasse
  ? ko(`page Départs : posée sur ${depClamp.pose}, elle y reste (mois passé affiché à un employé)`)
  : ok(`page Départs : posée sur un mois passé (${depClamp.pose}) → ramenée sur ${depClamp.apres}`);
await p2.close();

console.log(`\nErreurs JS : ${errs.length}`);
errs.slice(0,3).forEach(e=>console.log('   '+e));

// ── v9.908 : les mois passés quittent VRAIMENT l'appareil de l'employé, et les mois
//    FUTURS importés restent accessibles à tout le monde (Kevin 2026-09-18).
console.log('\n4. Ce qui reste dans la banque de données');
const p3 = await ctx.newPage(); p3.on('pageerror', e=>errs.push('banque: '+e));
await p3.addInitScript(()=>{const S={cmc_dver:'30',cmc_v706_total_wiped:'1',cmc_fam_restored_v116:'1',cmc_v805_famreset:'1',cmc_uid:'U11804',cmc_lastact:String(Date.now()),cmc_seen_v10_678:'1',cmc_cookies_consent:'1'};for(const k in S)localStorage.setItem(k,S[k]);});
await p3.goto(BASE+'/index.html',{waitUntil:'domcontentloaded'});
await p3.waitForFunction(()=>window.A&&Array.isArray(A.employees)&&A.employees.length>100,{timeout:40000});
const banque = await p3.evaluate(() => {
  const N = new Date(), cur = N.getFullYear()*12 + N.getMonth();
  const passe = (N.getMonth()===0) ? (N.getFullYear()-1)+'-11' : N.getFullYear()+'-'+(N.getMonth()-1);
  const futur = (N.getMonth()===11) ? (N.getFullYear()+1)+'-0' : N.getFullYear()+'-'+(N.getMonth()+1);
  const emp = A.employees.find(e => e.id !== 'U11804');
  // on plante volontairement un mois passé dans la banque, comme le ferait une vieille synchro
  A.overrides[passe] = A.overrides[passe] || { [emp.id]: { 1: 'RH', 2: '20/5' } };
  if (!emp.teamHistory) emp.teamHistory = {};
  emp.teamHistory[passe] = '9';
  localStorage.setItem('cmc_team_mirror_' + passe, JSON.stringify({ '1': '7' }));

  // 1) chez l'ADMIN : rien ne doit disparaître
  A.user = A.employees.find(e => e.id === 'U11804');
  cmcEffaceMoisPassesEmploye();
  const adminGarde = !!A.overrides[passe] && !!emp.teamHistory[passe];

  // 2) chez l'EMPLOYÉ : tout doit partir — et RIEN ne doit être envoyé au cloud
  A.user = emp;
  let versCloud = 0; const orig = window.fbWrite;
  window.fbWrite = function(){ versCloud++; return orig.apply(this, arguments); };
  cmcEffaceMoisPassesEmploye();
  window.fbWrite = orig;

  const futurDispo = !!(window.CMC_PLANNING_SEED && CMC_PLANNING_SEED.months && CMC_PLANNING_SEED.months[futur]);
  return {
    passe, futur, adminGarde,
    planningParti: !A.overrides[passe],
    equipePartie: !emp.teamHistory[passe],
    cleMoisPartie: localStorage.getItem('cmc_team_mirror_' + passe) === null,
    versCloud,
    futurConnu: futurDispo,
    futurAtteignable: (function(){ const p = futur.split('-'); return !cmcEstMoisPasse(+p[0], +p[1]); })()
  };
});
banque.adminGarde ? ok(`admin : son historique reste intact (${banque.passe} toujours là)`)
                  : ko('admin : son historique a été effacé — c’est exactement ce qu’il ne veut pas');
banque.planningParti ? ok(`employé : le planning du mois passé a quitté son appareil (${banque.passe})`)
                     : ko('employé : le planning du mois passé est encore sur son appareil');
banque.equipePartie ? ok('employé : son équipe de ce mois passé est effacée aussi')
                    : ko('employé : l’équipe du mois passé reste enregistrée');
banque.cleMoisPartie ? ok('employé : les clés de travail de ce mois sont effacées')
                     : ko('employé : des clés du mois passé traînent encore');
banque.versCloud === 0 ? ok('employé : RIEN n’est envoyé au cloud (il n’efface pas l’historique de Kevin)')
                       : ko(`employé : ${banque.versCloud} écriture(s) vers le cloud — danger pour l’historique de Kevin`);
banque.futurAtteignable ? ok(`mois futur toujours accessible à tout le monde (${banque.futur})`)
                        : ko(`le mois futur ${banque.futur} est refusé alors qu'il doit rester accessible`);
await p3.close();

// ── v9.913 : UN MOIS PASSÉ NE REVIENT PAS PAR LA PORTE DE DERRIÈRE (Kevin 2026-09-19).
//    MESURÉ EN PRODUCTION, connecté en tant qu'employé : son appareil gardait les équipes de
//    juillet et d'août. L'effacement faisait bien son travail, puis le planning vérifié —
//    qui parcourt TOUS ses mois — les reposait aussitôt. Deux mécanismes qui se battaient.
//    Ici on rejoue exactement ça : on efface, on relance le planning vérifié (au démarrage
//    PUIS à l'arrivée du cloud), et on exige que rien ne revienne chez l'employé — tout en
//    exigeant que ça revienne bien chez l'admin (sinon la garde ne prouverait rien).
console.log('\n5. Le planning vérifié ne fait pas revenir les mois passés');
const p4 = await ctx.newPage(); p4.on('pageerror', e=>errs.push('retour: '+e));
await p4.addInitScript(()=>{const S={cmc_dver:'30',cmc_v706_total_wiped:'1',cmc_fam_restored_v116:'1',cmc_v805_famreset:'1',cmc_uid:'U11804',cmc_lastact:String(Date.now()),cmc_seen_v10_678:'1',cmc_cookies_consent:'1'};for(const k in S)localStorage.setItem(k,S[k]);});
await p4.goto(BASE+'/index.html',{waitUntil:'domcontentloaded'});
await p4.waitForFunction(()=>window.A&&Array.isArray(A.employees)&&A.employees.length>100,{timeout:40000});
await p4.waitForTimeout(2000);

const prep = await p4.evaluate(() => {
  const N = new Date();
  const pm = (N.getMonth()===0) ? (N.getFullYear()-1)+'-11' : N.getFullYear()+'-'+(N.getMonth()-1);
  const emp = A.employees.find(e => e.id !== 'U11804');
  // On POSE un mois passé dans le planning vérifié : la garde reste vraie l'an prochain,
  // quand les mois réellement embarqués auront changé (pas de test qui s'endort).
  window.CMC_PLANNING_SEED.months[pm] = {
    emps: [{ id: emp.id, name: emp.name, family: emp.family || 'bj' }],
    ov:   { [emp.id]: { 1: 'RH', 2: '20/5' } },
    team: { [emp.id]: '9' },
    fam:  { [emp.id]: 'bj' },
    mirror: { '9': '7' }
  };
  const net = () => { delete A.overrides[pm]; if (emp.teamHistory) delete emp.teamHistory[pm]; localStorage.removeItem('cmc_team_mirror_' + pm); };
  window.__net = net; window.__pm = pm; window.__empId = emp.id;
  net();
  // EMPLOYÉ : démarrage
  A.user = emp; try{ if(typeof _viewAs!=='undefined') _viewAs = null; }catch(_){}
  _cmcApplyPlanningSeed();
  const lire = () => ({
    planning: !!A.overrides[pm],
    equipe:   !!(emp.teamHistory && emp.teamHistory[pm]),
    cleMois:  localStorage.getItem('cmc_team_mirror_' + pm) !== null
  });
  const auDemarrage = lire();
  // EMPLOYÉ : arrivée du cloud (c'est ce chemin-là qui reposait les équipes en production)
  _cmcSeedCompleteApresFirebase();
  return { pm, auDemarrage };
});
await p4.waitForTimeout(1200);
const suite = await p4.evaluate(() => {
  const pm = window.__pm, emp = A.employees.find(e => e.id === window.__empId);
  const lire = () => ({
    planning: !!A.overrides[pm],
    equipe:   !!(emp.teamHistory && emp.teamHistory[pm]),
    cleMois:  localStorage.getItem('cmc_team_mirror_' + pm) !== null
  });
  const apresCloud = lire();
  // ADMIN : le même planning vérifié DOIT reposer le mois passé (sinon la garde ne prouve rien)
  window.__net();
  A.user = A.employees.find(e => e.id === 'U11804');
  _cmcApplyPlanningSeed();
  const admin = lire();
  // « VOIR COMME » : c'est l'appareil de Kevin, son historique ne doit pas partir
  window.__net();
  A.user = emp; try{ if(typeof _viewAs!=='undefined') _viewAs = { id:'U11804', name:'DESARZENS K' }; }catch(_){}
  _cmcApplyPlanningSeed();
  const voirComme = lire();
  try{ if(typeof _viewAs!=='undefined') _viewAs = null; }catch(_){}
  return { apresCloud, admin, voirComme };
});
const mp = prep.pm;
(!prep.auDemarrage.planning && !prep.auDemarrage.equipe && !prep.auDemarrage.cleMois)
  ? ok(`employé, au démarrage : le mois passé ${mp} n'est pas reposé (ni planning, ni équipe, ni clé)`)
  : ko(`employé, au démarrage : ${mp} est revenu (planning=${prep.auDemarrage.planning}, équipe=${prep.auDemarrage.equipe}, clé=${prep.auDemarrage.cleMois})`);
(!suite.apresCloud.planning && !suite.apresCloud.equipe && !suite.apresCloud.cleMois)
  ? ok(`employé, à l'arrivée du cloud : ${mp} ne revient toujours pas (le cas mesuré en production)`)
  : ko(`employé : ${mp} est revenu après le cloud (planning=${suite.apresCloud.planning}, équipe=${suite.apresCloud.equipe}, clé=${suite.apresCloud.cleMois})`);
(suite.admin.planning && suite.admin.equipe)
  ? ok(`admin : le même planning vérifié lui repose bien ${mp} (la garde sait faire la différence)`)
  : ko(`admin : ${mp} ne lui est PAS reposé — il perd son historique`);
(suite.voirComme.planning && suite.voirComme.equipe)
  ? ok('« voir comme un employé » : l\'appareil de Kevin garde son historique')
  : ko('« voir comme » : l\'historique de Kevin a disparu de son propre appareil');
await p4.close();

console.log(`\n=== ${OK} OK / ${FAIL} FAIL ===`);
await nav.close(); server.close();
process.exit(FAIL || errs.length ? 1 : 0);
