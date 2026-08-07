/* =============================================================================
   ARBRE — ENRICHISSEMENT INSEE, PERSONNE PAR PERSONNE (Kevin 2026-08-05)
   -----------------------------------------------------------------------------
   « Vérifie chaque personne de chaque famille, mets à jour, enrichis (dates,
   lieux, actes, notes) avec ce que tu trouves. » Ce robot :
   1. Lit le seed de arbre/index.html (toutes les personnes + dates connues).
   2. Interroge le fichier INSEE des décès (deces.matchid.io) pour chacune.
   3. Match par nom + prénom + (si connue) date/année → propose une confirmation
      ou une correction (date/lieu de décès, date de naissance).
   4. Écrit arbre/research/ENRICH-INSEE.md : par personne, statut + preuve (id INSEE).
   AUCUNE invention : seulement ce que l'INSEE renvoie, avec le lien de vérif.
   Réseau ouvert requis (runner CI). Usage : node tools/arbre/enrich-insee.mjs
============================================================================= */
import fs from 'fs';

const html = fs.readFileSync('arbre/index.html', 'utf8');
const blocks = html.match(/add\(\{id:"[\s\S]*?\}\);/g) || [];
function f(b, n){ const m=b.match(new RegExp('[,{]'+n+':\\s*"((?:[^"\\\\]|\\\\.)*)"')); return m?m[1]:null; }
function dt(b, key){ const m=b.match(new RegExp(key+':\\{date:"([^"]*)"(?:,lieu:"([^"]*)")?')); return m?{date:m[1],lieu:m[2]||''}:null; }
const persons = [];
for (const b of blocks){
  const id=f(b,'id'); if(!id) continue;
  persons.push({ id, prenom:f(b,'prenom'), nom:f(b,'nom'), vivant:/vivant:true/.test(b),
    naissance:dt(b,'naissance'), deces:dt(b,'deces') });
}
const yr = s => { const m=(s||'').match(/(1[6-9]\d\d|20\d\d)/); return m?+m[1]:null; };
const norm = s => (s||'').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Z ]/g,' ').replace(/\s+/g,' ').trim();

const L = ['# 🔎 Enrichissement INSEE — personne par personne ('+new Date().toISOString().slice(0,10)+')',
  '', 'Source : fichier des décès INSEE via deces.matchid.io. Aucune donnée inventée — chaque proposition porte l\'id INSEE de vérification.', ''];
function log(s){ console.log(s); L.push(s); }

let confirmes=0, corriges=0, nouveaux=0, riens=0;

for (const p of persons){
  if (!p.prenom || !p.nom) continue;
  if (p.vivant){ continue; } // on ne cherche pas les vivants dans le fichier des décès
  const q = (p.prenom+' '+p.nom).replace(/\s+/g,' ').trim();
  let hits=[];
  try{
    const r = await fetch('https://deces.matchid.io/deces/api/v1/search?q='+encodeURIComponent(q)+'&size=12');
    const j = await r.json();
    hits = ((j||{}).response||{}).persons || [];
  }catch(e){ log('- **'+q+'** : ÉCHEC requête — '+e.message.slice(0,80)); continue; }
  if (!hits.length){ riens++; log('- **'+q+'** : 0 résultat INSEE'); continue; }

  const pn = norm(p.nom), pf = norm(p.prenom).split(' ')[0];
  const byN = p.naissance && yr(p.naissance.date), byD = p.deces && yr(p.deces.date);
  // score chaque hit
  const scored = hits.map(h=>{
    const hn=norm(h.name&&h.name.last), hf=norm((h.name&&h.name.first||[]).join(' '));
    const hby=yr(h.birth&&h.birth.date), hdy=yr(h.death&&h.death.date);
    let sc=0;
    if(hn===pn) sc+=3; else if(hn.includes(pn)||pn.includes(hn)) sc+=1;
    if(hf.split(' ').includes(pf)) sc+=2;
    if(byN&&hby&&Math.abs(byN-hby)<=1) sc+=3; else if(byN&&hby&&Math.abs(byN-hby)<=3) sc+=1;
    if(byD&&hdy&&Math.abs(byD-hdy)<=1) sc+=3;
    return {h,sc,hby,hdy,hn,hf};
  }).sort((a,b)=>b.sc-a.sc);
  const best=scored[0];
  const fmt=h=>{ const b=h.birth||{},d=h.death||{}; return (h.name.first||[]).join(' ')+' '+h.name.last+' — né '+(b.date||'?')+' à '+((b.location||{}).city||'?')+' — † '+(d.date||'?')+' à '+((d.location||{}).city||'?')+' (id '+h.id+')'; };

  if (best.sc>=6){
    // fort : confirme ou corrige
    const known = (byN?byN:'?')+'/'+(byD?byD:'?');
    const found = (best.hby||'?')+'/'+(best.hdy||'?');
    let tag='✅ CONFIRMÉ';
    if((byD&&best.hdy&&byD!==best.hdy)||(byN&&best.hby&&byN!==best.hby)){ tag='✏️ À CORRIGER'; corriges++; } else confirmes++;
    log('- **'+q+'** — '+tag+' (connu '+known+' vs INSEE '+found+')');
    log('  · '+fmt(best.h));
    if(best.h.death&&best.h.death.date) log('    → décès INSEE : '+best.h.death.date+(best.h.death.location&&best.h.death.location.city?(' à '+best.h.death.location.city):'')+' | naissance : '+((best.h.birth||{}).date||'?'));
  } else if (best.sc>=4){
    nouveaux++;
    log('- **'+q+'** — 🟡 PISTE probable (score '+best.sc+') : '+fmt(best.h));
  } else {
    riens++;
    log('- **'+q+'** — pas de correspondance fiable ('+hits.length+' homonymes, meilleur score '+best.sc+')');
  }
  await new Promise(r=>setTimeout(r,150)); // douceur API
}

L.splice(4,0,'**Bilan : '+confirmes+' confirmé(s) · '+corriges+' à corriger · '+nouveaux+' piste(s) · '+riens+' sans correspondance.**','');
fs.writeFileSync('arbre/research/ENRICH-INSEE.md', L.join('\n')+'\n');
console.log('\nRapport : arbre/research/ENRICH-INSEE.md');
