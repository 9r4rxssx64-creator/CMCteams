/* LA RECHERCHE TROUVE LA PERSONNE ET DIT SON ÉQUIPE DU MOIS.
 *
 * Kevin 2026-09-18 : « Je cherche l'équipe à Morter dans la recherche mais il ne trouve rien.
 * Ne me montre pas son équipe. D'autres noms pareil. »
 *
 * CE QUI S'EST PASSÉ (mesuré en vrai navigateur) : la barre de recherche vit dans la BARRE DU
 * HAUT, mais la loupe appelait `dc()`, qui ne réécrit QUE `#content`. Le drapeau `_searchOpen`
 * passait bien à `true` et le champ n'apparaissait JAMAIS → il n'y avait même pas où écrire.
 * Et même champ ouvert (après un rendu complet), chaque lettre repassait par `dc()` : les
 * résultats n'étaient jamais peints. Enfin, le résultat n'affichait que « NOM (matricule) » —
 * jamais l'équipe, qui est justement ce que Kevin cherchait.
 *
 * CE QUE CETTE GARDE EXIGE, sur la vraie page :
 *   1. Un clic sur la loupe FAIT APPARAÎTRE le champ.
 *   2. Taper un nom donne un résultat, et ce résultat NOMME l'équipe du mois (celle du PDF).
 *   3. Taper ne fait pas perdre le focus ni le curseur (le champ n'est pas détruit).
 *   4. Un employé (non-admin) n'est jamais envoyé vers une vue qui lui est fermée (page blanche).
 *
 *   node tests/verify-recherche-nom.mjs
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

const nav=await chromium.launch(); const ctx=await nav.newContext({viewport:{width:390,height:844}});
await ctx.route(/identitytoolkit|securetoken|firebasedatabase\.app/,r=>r.fulfill({status:200,contentType:'application/json',body:'{}'}));
const page=await ctx.newPage(); const errs=[]; page.on('pageerror',e=>errs.push(String(e)));
await page.addInitScript(()=>{const S={cmc_dver:'30',cmc_v706_total_wiped:'1',cmc_fam_restored_v116:'1',cmc_v805_famreset:'1',cmc_uid:'U11804',cmc_lastact:String(Date.now()),cmc_seen_v10_678:'1',cmc_cookies_consent:'1'};for(const k in S)localStorage.setItem(k,S[k]);});
await page.goto(BASE+'/index.html',{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.A&&Array.isArray(A.employees)&&A.employees.length>100,{timeout:40000});
await page.waitForTimeout(3500);

let OK=0, FAIL=0;
const ok=(m)=>{OK++;console.log('  ✅ '+m);};
const ko=(m)=>{FAIL++;console.log('  ❌ '+m);};
console.log('== RECHERCHE PAR NOM — vraie page, session admin ==\n');

// Mois courant de l'app + équipes attendues (mêmes données que la page light)
const { y, m } = await page.evaluate(()=>({y:A.year,m:A.month}));
const pref = y + '-' + String(m+1).padStart(2,'0') + '-';
const equipeDe = {};
for (const k of Object.keys(GEN.boards)) {
  const b = GEN.boards[k];
  if (!k.startsWith(pref) || b.kind === 'abs') continue;
  const tid = k.slice(pref.length);
  for (const p of b.people) equipeDe[p.name.toUpperCase()] = { tid, label: b.label };
}
console.log(`Mois affiché : ${y}-${m+1} · ${Object.keys(equipeDe).length} personnes rangées dans le PDF\n`);

// ── 1. La loupe ouvre bien le champ ───────────────────────────────────────────────
const btn = await page.$('button[aria-label="Rechercher"]');
if (!btn) ko('bouton loupe absent de la barre du haut');
else {
  await btn.click(); await page.waitForTimeout(500);
  const champ = await page.$('#globalSearchIn');
  champ ? ok('un clic sur la loupe fait apparaître le champ de recherche')
        : ko('la loupe ne fait PAS apparaître le champ (la barre du haut n’est pas redessinée)');
}

// ── 2. Chercher un nom → résultat + ÉQUIPE DU MOIS ────────────────────────────────
const NOMS = ['MORTER', 'TOULET', 'DEGIOVANNI', 'CAMILLERI', 'DESARZENS'];
for (const n of NOMS) {
  const att = equipeDe[Object.keys(equipeDe).find((k)=>k.startsWith(n+' ')) || ''];
  const vu = await page.evaluate((q)=>{
    globalSearch(q);
    const el = document.getElementById('globalSearchRes');
    return { lignes:(A._searchResults||[]).filter(r=>r.cat==='\u{1F464}').map(r=>r.label), ecran: el? el.innerText : '' };
  }, n.toLowerCase());
  if (!vu.lignes.length) { ko(`« ${n} » : aucun résultat`); continue; }
  const ligne = vu.lignes[0];
  if (!att) { ok(`« ${n} » : trouvé (${ligne}) — pas dans le PDF de ce mois`); continue; }
  const nomEq = (att.label || att.tid).replace(/^.*—\s*/, '');
  if (ligne.includes(nomEq.split(' (')[0])) ok(`« ${n} » → ${ligne}`);
  else ko(`« ${n} » : l'équipe n'est pas affichée (attendu « ${nomEq} », vu « ${ligne} »)`);
  if (!vu.ecran.includes(n)) ko(`« ${n} » : le résultat n'est pas PEINT à l'écran`);
}

// ── 3. Taper ne détruit pas le champ (focus + curseur gardés) ──────────────────────
await page.focus('#globalSearchIn');
await page.type('#globalSearchIn', 'morter', { delay: 40 });
await page.waitForTimeout(400);
const etat = await page.evaluate(()=>{
  const el=document.getElementById('globalSearchIn');
  return el ? { focus: document.activeElement===el, val: el.value, caret: el.selectionStart } : null;
});
if (!etat) ko('le champ a disparu pendant la frappe');
else {
  etat.focus ? ok('le champ garde le focus pendant la frappe') : ko('le champ PERD le focus pendant la frappe');
  etat.val === 'morter' ? ok('la saisie est intacte (« morter »)') : ko('saisie abîmée : « '+etat.val+' »');
  etat.caret === 6 ? ok('le curseur reste en fin de saisie') : ko('curseur déplacé (position '+etat.caret+')');
}

// ── 4. Un employé n'est jamais envoyé sur une vue qui lui est fermée ───────────────
const FERMEES = await page.evaluate(()=>{
  A.__save = A.user; A.user = (A.employees||[]).find(e=>e.id!=='U11804') || A.user;
  globalSearch('morter');
  const acts = (A._searchResults||[]).filter(r=>r.cat==='\u{1F464}').map(r=>r.action);
  A.user = A.__save; delete A.__save;
  return acts;
});
const versEmployees = FERMEES.filter((a)=>/sv\('employees'\)/.test(a));
versEmployees.length === 0
  ? ok('un employé n’est jamais renvoyé vers la vue Employés (réservée à l’admin → page blanche)')
  : ko(versEmployees.length+' résultat(s) renvoient un employé vers une vue fermée');

console.log(`\nErreurs JS : ${errs.length}`);
errs.slice(0,3).forEach(e=>console.log('   '+e));
console.log(`\n=== ${OK} OK / ${FAIL} FAIL ===`);
await nav.close(); server.close();
process.exit(FAIL || errs.length ? 1 : 0);
