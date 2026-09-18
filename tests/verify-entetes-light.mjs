/* CE QUI EST ÉCRIT EN HAUT DE LA PAGE DÉPARTS EST VRAI — pour chaque équipe, chaque mois.
 *
 * Kevin 2026-09-18 (capture d'écran) : « En haut il y a marqué 8 chefs mais ce n'est pas une
 * équipe de chef. Corrige et vérifie toutes les infos. Jamais d'erreur nulle part et surtout
 * dans l'import et sa reproduction des données dans les app. »
 *
 * CE QUI S'EST PASSÉ : la page appelait « chefs » TOUTES les personnes d'un tableau (héritage
 * du nom de variable `CHEFS_T`), alors qu'un tableau, c'est une équipe entière — croupiers
 * compris. Sur CMC Éq.10 elle affichait donc « 8 chefs » pour 8 personnes dont aucune n'est
 * forcément chef de table, et la première colonne s'intitulait « Chef » au lieu de « Nom ».
 * Un mot faux sur un écran de travail, c'est une donnée fausse.
 *
 * CE QUE CETTE GARDE EXIGE, dans un vrai navigateur, pour CHAQUE tableau de CHAQUE mois généré :
 *   1. Le sous-titre nomme le BON mois.
 *   2. L'effectif annoncé = le nombre de lignes réellement affichées = l'effectif du PDF.
 *   3. La séquence annoncée = celle que l'app utilise vraiment pour cet effectif.
 *   4. Le mot « chef » ne sert JAMAIS à compter l'effectif (ni en-tête de colonne, ni sous-titre).
 *   5. Le libellé de l'équipe affiché = celui du PDF.
 *   6. Les noms affichés = exactement ceux du PDF, dans le même ordre.
 *
 *   node tests/verify-entetes-light.mjs
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
const page=await ctx.newPage(); const errs=[]; page.on('pageerror',e=>errs.push(String(e)));
await page.goto(BASE+'/tools/departs/index.html',{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.BOARDS&&Object.keys(BOARDS).length>0,{timeout:30000});
// admin : pour voir AUSSI les mois passés (sinon la moitié des tableaux ne serait pas testée)
await page.evaluate(()=>{ document.body.classList.add('admin'); try{fillMoSel();}catch(_){} });
await page.waitForTimeout(800);

let OK=0, FAIL=0; const pb=[];
const ko=(m)=>{FAIL++; if(pb.length<12)pb.push(m);};

const ids = Object.keys(GEN.boards);
console.log('== CE QUI EST ÉCRIT EN HAUT DE LA PAGE DÉPARTS ==\n');
console.log(`${ids.length} tableaux générés à contrôler, un par un.\n`);

for (const id of ids) {
  const attendu = GEN.boards[id];
  const vu = await page.evaluate((bid)=>{
    switchBoard(bid);
    const sub = (document.getElementById('hSub')||{}).textContent || '';
    const th  = document.querySelector('#grid thead th.cNom');
    const noms = Array.from(document.querySelectorAll('#grid tbody tr')).map(tr=>{
      const c = tr.querySelector('td.cNom'); return c ? c.textContent.replace('⭐','').trim() : null;
    }).filter(n=>n && n!=='TOTAL NR' && n!=='TOTAL ✗');
    const sel = document.getElementById('boardSel');
    const lbl = sel && sel.selectedOptions[0] ? sel.selectedOptions[0].textContent : '';
    const seqReelle = (typeof seqForSize==='function' && window.ST && ST.order)
      ? seqForSize(ST.order.filter(nm=>{ for(let d=1;d<=B.days;d++) if(isWork(ST.codes[nm][d])) return true; return false; }).length).join('·')
      : null;
    return { sub, colonne: th? th.textContent.trim() : '(absente)', noms, lbl, seqReelle, mois: (window.B||{}).month };
  }, id);

  const attNoms = attendu.people.map(p=>p.name);
  const q = `${id} (${attendu.label})`;

  // 1. le bon mois
  if (!vu.sub.startsWith(attendu.month)) ko(`${q} : sous-titre annonce « ${vu.sub.split('·')[0].trim()} » au lieu de « ${attendu.month} »`);

  // 2. l'effectif annoncé = lignes affichées = PDF
  const mEff = vu.sub.match(/·\s*(\d+)\s+(personnes?|chefs?|absents?)/);
  if (!mEff) ko(`${q} : le sous-titre n'annonce aucun effectif (« ${vu.sub} »)`);
  else {
    const n = Number(mEff[1]);
    if (n !== vu.noms.length) ko(`${q} : annonce ${n} ${mEff[2]} mais ${vu.noms.length} ligne(s) affichée(s)`);
    if (n !== attNoms.length) ko(`${q} : annonce ${n} ${mEff[2]} mais le PDF en a ${attNoms.length}`);
    // 4. jamais « chef » pour compter l'effectif
    if (/chefs?/i.test(mEff[2])) ko(`${q} : l'effectif est annoncé en « ${mEff[2]} » — une équipe n'est pas une équipe de chefs`);
  }

  // 3. séquence annoncée = séquence réellement utilisée
  if (attendu.kind !== 'abs') {
    const mSeq = vu.sub.match(/séquence\s+([0-9·]+)/);
    if (!mSeq) ko(`${q} : aucune séquence annoncée`);
    else if (vu.seqReelle && mSeq[1] !== vu.seqReelle) ko(`${q} : séquence annoncée ${mSeq[1]} ≠ séquence utilisée ${vu.seqReelle}`);
  }

  // 4 bis. en-tête de colonne
  if (/^chefs?$/i.test(vu.colonne)) ko(`${q} : la colonne des noms s'intitule « ${vu.colonne} »`);

  // 5. libellé d'équipe
  if (vu.lbl && !vu.lbl.includes(attendu.label.replace(/^.*—\s*/,''))) ko(`${q} : le sélecteur affiche « ${vu.lbl} »`);

  // 6. noms = PDF, même ordre
  if (vu.noms.join('|') !== attNoms.join('|')) ko(`${q} : noms affichés ≠ PDF\n        vus     : ${vu.noms.join(', ')}\n        attendus: ${attNoms.join(', ')}`);

  OK++;
}

console.log(`${OK} tableau(x) contrôlé(s) · ${FAIL} anomalie(s)`);
pb.forEach(x=>console.log('  ❌ '+x));
if (!FAIL) console.log('✅ mois, effectif, séquence, libellé et noms : tout ce qui est écrit est vrai.');
console.log(`\nErreurs JS : ${errs.length}`);
errs.slice(0,3).forEach(e=>console.log('   '+e));
console.log(`\n=== ${FAIL?'ÉCHEC':'OK'} ===`);
await nav.close(); server.close();
process.exit(FAIL || errs.length ? 1 : 0);
