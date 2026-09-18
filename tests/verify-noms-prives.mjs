/* QUI PEUT VOIR LES NOMS ? — mesuré, pas supposé.
 *
 * Kevin 2026-09-18 : « Tu as vérifié aussi la sécurité des informations, sur le code, GitHub,
 * GitLab, tout ça — que tout soit bien sécurisé, que personne ne puisse tout voir, les noms de
 * chaque personne, CMCteams et light. »
 *
 * CE QUI A ÉTÉ MESURÉ :
 *   · CMCteams : un visiteur non connecté ne voit que l'écran de connexion. ✅
 *   · Page Départs : l'écran d'identification s'affichait par-dessus un tableau DÉJÀ CONSTRUIT —
 *     les noms de l'équipe étaient dans la page pour n'importe quel visiteur. ❌ corrigé en v1.48.
 *   · Aucun e-mail, téléphone, adresse ni date de naissance d'employé n'est dans le code servi :
 *     ces informations vivent dans Firebase, derrière l'authentification. ✅
 *
 * LIMITE DITE HONNÊTEMENT (ce test ne prétend pas le contraire) : les noms et les plannings
 * sont dans un fichier de données PUBLIC (tools/departs/boards-gen.js). Cacher le tableau
 * arrête le curieux, pas quelqu'un qui connaît l'adresse du fichier. Le vrai verrou serait de
 * servir ce fichier derrière la reconnaissance du domaine.
 *
 *   node tests/verify-noms-prives.mjs
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
const ok=(m,d)=>{OK++;console.log('  ✅ '+m+(d?' — '+d:''));};
const ko=(m,d)=>{FAIL++;console.log('  ❌ '+m+(d?' — '+d:''));};

// ── 1. Le code servi ne contient AUCUNE coordonnée d'employé ────────────────
console.log('\n1. Ce qu’un inconnu peut lire dans le code publié\n');
const FICHIERS=['index.html','tools/shared/planning-seed.js','tools/departs/boards-gen.js','tools/departs/index.html'];
const MOTIFS=[
  ['adresse e-mail d’employé', /[a-zA-Z0-9._%-]+@(?:sbm\.mc|gmail\.com|hotmail\.[a-z]+|orange\.fr|free\.fr)/g, (v)=>/prenom\.nom@sbm\.mc/i.test(v)||/desarzens\.kevin@gmail\.com/i.test(v)],
  ['date de naissance', /"?dateNaissance"?\s*[:=]\s*"\d{4}-\d{2}-\d{2}"/g, ()=>false],
  ['adresse postale', /"adresse"\s*:\s*"[^"]{10,}"/g, ()=>false],
  ['numéro de téléphone personnel', /\+33\s?[1-9](?:[\s.-]?\d{2}){4}/g, ()=>false],
];
let fuites=0;
for(const f of FICHIERS){
  const txt=fs.readFileSync(join(ROOT,f),'utf8');
  for(const [nom,re,toleré] of MOTIFS){
    const trouves=[...new Set(txt.match(re)||[])].filter(v=>!toleré(v));
    if(trouves.length){ fuites++; ko(`${f} : ${trouves.length} ${nom}(s) en clair`, trouves.slice(0,2).join(', ')); }
  }
}
if(!fuites) ok('aucun e-mail, téléphone, adresse ou date de naissance d’employé dans le code servi');

// ── 2. Un visiteur non identifié ne voit aucun nom ──────────────────────────
console.log('\n2. Ce qu’un visiteur non identifié voit à l’écran\n');
const nav=await chromium.launch(); const ctx=await nav.newContext({viewport:{width:390,height:844}});
await ctx.route(/identitytoolkit|securetoken|firebasedatabase\.app/,r=>r.fulfill({status:200,contentType:'application/json',body:'{}'}));

const app=await ctx.newPage(); const errs=[]; app.on('pageerror',e=>errs.push('app: '+e));
await app.goto(BASE+'/index.html',{waitUntil:'domcontentloaded'});
await app.waitForTimeout(4000);
const vuApp=await app.evaluate(()=>{const t=document.body.innerText||'';return {noms:/MORTER|DESARZENS K|CAMILLERI|MAGARA/.test(t), debut:t.slice(0,60).replace(/\n/g,' ')};});
vuApp.noms ? ko('CMCteams : des noms sont visibles sans être connecté') : ok('CMCteams : rien d’autre que l’écran de connexion');
await app.close();

const light=await ctx.newPage(); light.on('pageerror',e=>errs.push('light: '+e));
await light.goto(BASE+'/tools/departs/index.html',{waitUntil:'domcontentloaded'});
await light.waitForTimeout(4000);
const vuLight=await light.evaluate(()=>{
  const cel=[...document.querySelectorAll('td.cNom')].map(td=>(td.textContent||'').trim()).filter(Boolean);
  return {cellules:cel.length, exemples:cel.slice(0,3), texteNoms:/MAGAGNIN|FABRE SOCCAL|PASTOR|CAMPI/.test(document.body.innerText||'')};
});
(vuLight.cellules===0 && !vuLight.texteNoms)
  ? ok('page Départs : aucun nom dans la page tant qu’on ne s’est pas identifié')
  : ko(`page Départs : ${vuLight.cellules} nom(s) présents avant identification`, vuLight.exemples.join(', '));

// ── 3. Une fois identifié, le tableau revient (pas de régression) ───────────
console.log('\n3. Une fois identifié, tout revient normalement\n');
await light.evaluate(()=>{ localStorage.setItem('cmc_dep_identity',JSON.stringify({nom:'ROSSI',prenom:'Jean',cgu:true})); });
await light.reload({waitUntil:'domcontentloaded'});
await light.waitForTimeout(4000);
const apres=await light.evaluate(()=>[...document.querySelectorAll('td.cNom')].map(td=>(td.textContent||'').trim()).filter(Boolean).length);
apres>0 ? ok(`page Départs : le tableau revient une fois identifié (${apres} noms)`)
        : ko('page Départs : le tableau ne revient PAS après identification — régression');
await light.close();

console.log(`\n${OK} OK · ${FAIL} FAIL · erreurs JS : ${errs.length}`);
errs.slice(0,3).forEach(e=>console.log('   '+e));
console.log('\nLimite connue : les noms et plannings restent dans un fichier de données public');
console.log('(tools/departs/boards-gen.js). Ce test ne prétend pas le contraire.');
console.log(`\n=== ${FAIL||errs.length?'ÉCHEC':'OK'} ===`);
await nav.close(); server.close();
process.exit(FAIL||errs.length?1:0);
