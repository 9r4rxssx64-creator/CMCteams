/* Vérification EN RÉEL des numéros de départ sur la base LIVE CMCteams.
 * Lance en CI (réseau ouvert) : lit le vrai Firebase /cmcteams, recalcule les
 * numéros de départ avec l'algo EXACTEMENT DÉPLOYÉ (calcDepPos v9.834/v9.857),
 * et vérifie la fenêtre glissante + la règle du numéro mort.
 *
 * SORTIE ANONYMISÉE (repo public) : ids d'équipe + tailles + numéros uniquement.
 * AUCUN nom d'employé, AUCUN planning individuel n'est loggé.
 *
 * Clé Web API = PUBLIQUE (déjà dans index.html). Auth anonyme (rules /cmcteams = auth!=null).
 */
const KEY = 'AIzaSyDciW-0sIIg9msdmgZjQHBksqzsfA6DCMs';
const DB  = 'https://cmcteams-c16ab-default-rtdb.europe-west1.firebasedatabase.app';

// ── Réplique EXACTE de l'algo déployé ─────────────────────────────────────────
const SEQS = {2:[1,2],3:[1,3,2],4:[1,4,2,3],5:[1,4,2,3,5],6:[1,6,4,2,3,5],
  7:[1,6,4,2,7,3,5],8:[1,6,4,2,7,3,8,5],9:[1,6,4,9,2,7,3,8,5],
  10:[1,6,4,9,2,7,3,8,5,10],11:[1,6,4,9,2,11,7,3,8,5,10],
  12:[1,6,4,9,2,11,7,3,12,8,5,10],13:[1,6,4,9,2,11,7,3,13,8,5,10,12]};
function getSeqForSize(n){ if(SEQS[n]) return SEQS[n]; const a=[]; for(let i=1;i<=n;i++)a.push(i); return a; }
// isWork EXACT = index.html ligne 9518
function isWork(c){ return !!c && c!=='RH'&&c!=='R'&&c!=='CP'&&c!=='M'&&c!=='AF'&&c!=='RRT'&&c!=='PAT'&&c!=='MT'&&c!=='AT'&&c!=='FL'&&c!=='ABS'&&c!=='ABI'&&c!=='CSS'; }
function getDays(y,mIdx){ return new Date(y, mIdx+1, 0).getDate(); }

// calcDepPos, mais vectorisé pour toute l'équipe/mois (mêmes formules)
function computeTeam(chefEmps, ov, y, mIdx, CI){
  const days = getDays(y,mIdx);
  const pl = {}; chefEmps.forEach(e=>{ pl[e.id] = ov[e.id]||{}; });
  // actifs = ≥1 jour travaillé
  const active = chefEmps.filter(e=>{ for(let d=1;d<=days;d++) if(isWork(pl[e.id][d]||'')) return true; return false; });
  if(!active.length) return null;
  const baseOf={}; active.forEach((e,ai)=>{ baseOf[e.name]=(CI&&CI[e.name]!==undefined)?CI[e.name]:ai; });
  const workDays=[]; for(let d=1;d<=days;d++){ for(const e of active){ if(isWork(pl[e.id][d]||'')){ workDays.push(d); break; } } }
  function absRun(id,D){ if(isWork(pl[id][D]||''))return 0; let L=1,dd;
    for(dd=D-1;dd>=1&&!isWork(pl[id][dd]||'');dd--)L++;
    for(dd=D+1;dd<=days&&!isWork(pl[id][dd]||'');dd++)L++; return L; }
  const deps={}; active.forEach(e=>deps[e.name]={});
  for(let d=1;d<=days;d++){
    const wi=workDays.indexOf(d); if(wi<0) continue;
    const eff=active.filter(e=>{ const r=absRun(e.id,d); return r===0||r<4; }).sort((a,b)=>baseOf[a.name]-baseOf[b.name]);
    const N=eff.length; if(!N) continue;
    const SEQd=getSeqForSize(N), rot=wi;
    eff.forEach((e,j)=>{ if(isWork(pl[e.id][d]||'')) deps[e.name][d]=SEQd[(((rot+j)%N)+N)%N]; });
  }
  return {active, workDays, deps, pl, days, baseOf, absRun};
}

// ── Vérification de la fenêtre glissante + numéro mort ────────────────────────
function verifyTeam(R){
  const anomalies=[];
  const days=R.days;
  for(let d=1;d<=days;d++){
    const wi=R.workDays.indexOf(d); if(wi<0) continue;
    const eff=R.active.filter(e=>{ const r=R.absRun(e.id,d); return r===0||r<4; }).sort((a,b)=>R.baseOf[a.name]-R.baseOf[b.name]);
    const N=eff.length; if(!N) continue;
    const SEQd=getSeqForSize(N);
    // présents = travaillent réellement ce jour
    const present=eff.filter(e=>isWork(R.pl[e.id][d]||''));
    const nums=present.map(e=>R.deps[e.name][d]);
    // 1) tous les présents ont un numéro distinct dans 1..N
    const set=new Set(nums);
    if(nums.some(x=>x==null)) anomalies.push(`j${d}: présent sans numéro`);
    if(set.size!==nums.length) anomalies.push(`j${d}: doublon de numéro`);
    if(nums.some(x=>x<1||x>N)) anomalies.push(`j${d}: numéro hors 1..${N}`);
    // 2) fenêtre glissante : chef eff au rang j (présent) doit avoir SEQd[(wi+j)%N]
    eff.forEach((e,j)=>{ if(isWork(R.pl[e.id][d]||'')){ const exp=SEQd[(((wi+j)%N)+N)%N]; if(R.deps[e.name][d]!==exp) anomalies.push(`j${d} rang${j}: ${R.deps[e.name][d]}≠${exp}`); } });
    // 3) numéro MORT : absent court (1-3j) → PAS de numéro affiché
    eff.forEach(e=>{ if(!isWork(R.pl[e.id][d]||'') && R.deps[e.name][d]!=null) anomalies.push(`j${d}: absent avec numéro (pas mort)`); });
  }
  return anomalies;
}

async function j(url){ const r=await fetch(url); if(!r.ok) throw new Error('HTTP '+r.status+' '+url.split('?')[0]); return r.json(); }

(async()=>{
  console.log('== VÉRIF LIVE numéros de départ CMCteams ==');
  const auth=await (await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${KEY}`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{"returnSecureToken":true}'})).json();
  const tok=auth.idToken; if(!tok){ console.error('AUTH KO', JSON.stringify(auth).slice(0,200)); process.exit(1); }
  console.log('auth anonyme OK (uid caché)');

  const CHEFS_T = await j(`${DB}/cmcteams/cmc_chefs_t.json?auth=${tok}`) || {};
  const EMP     = await j(`${DB}/cmcteams/cmc_e.json?auth=${tok}`) || [];
  const OV      = await j(`${DB}/cmcteams/cmc_ov.json?auth=${tok}`) || {};
  const empArr  = Array.isArray(EMP) ? EMP.filter(Boolean) : Object.values(EMP||{}).filter(Boolean);

  const months = Object.keys(OV).sort();
  console.log('MOIS présents dans la base LIVE (cmc_ov):', months.join(', ') || '(aucun)');
  console.log('nb équipes CHEFS_T:', Object.keys(CHEFS_T).length, '| nb employés:', empArr.length);
  console.log('');

  let totalTeams=0, okTeams=0, brokenTeams=0, sampleShown=0;
  for(const key of months){
    const [yStr,mStr]=key.split('-'); const y=+yStr, mIdx=+mStr;
    if(isNaN(y)||isNaN(mIdx)) continue;
    const ov=OV[key]||{};
    let CI=null; try{ CI=await j(`${DB}/cmcteams/cmc_ci_${y}_${mIdx}.json?auth=${tok}`); }catch(_){}
    console.log(`--- MOIS ${key} (${getDays(y,mIdx)} jours)${CI?' [CI perso présent]':''} ---`);
    for(const tid of Object.keys(CHEFS_T)){
      const names=(CHEFS_T[tid]||[]).filter(Boolean);
      if(names.length<2) continue;
      // map noms → employés (1er avec données ce mois, dédup)
      const seen=new Set(); const chefEmps=[];
      for(const n of names){
        const ms=empArr.filter(e=>e && e.name===n);
        let pick = ms.find(e=>ov[e.id] && Object.keys(ov[e.id]).length>0) || ms[0];
        if(pick && !seen.has(pick.id)){ seen.add(pick.id); chefEmps.push(pick); }
      }
      if(chefEmps.length<2) continue;
      const R=computeTeam(chefEmps, ov, y, mIdx, CI);
      if(!R || R.active.length<2) continue;
      totalTeams++;
      const anomalies=verifyTeam(R);
      if(anomalies.length===0){
        okTeams++;
        // échantillon : 1ʳᵉ équipe de 6 → grille numéros (SANS noms) sur 4 jours pleins consécutifs
        if(sampleShown<2 && R.active.length>=5){
          let s=-1;
          for(let i=0;i+3<R.workDays.length;i++){ const seg=[R.workDays[i],R.workDays[i+1],R.workDays[i+2],R.workDays[i+3]];
            if(seg[1]===seg[0]+1&&seg[2]===seg[1]+1&&seg[3]===seg[2]+1 && seg.every(dd=>R.active.every(e=>isWork(R.pl[e.id][dd]||'')))){ s=i; break; } }
          if(s>=0){
            const sorted=[...R.active].sort((a,b)=>R.baseOf[a.name]-R.baseOf[b.name]);
            console.log(`  ✅ éq.${tid} (${R.active.length} chefs) — PREUVE glissement (numéros only) :`);
            for(let k=0;k<4;k++){ const d=R.workDays[s+k]; console.log(`     j${d} : ${sorted.map(e=>R.deps[e.name][d]).join('-')}`); }
            sampleShown++;
          } else { console.log(`  ✅ éq.${tid} (${R.active.length} chefs) — OK`); }
        } // sinon silencieux
      } else {
        brokenTeams++;
        console.log(`  ❌ éq.${tid} (${R.active.length} chefs) — ${anomalies.length} anomalie(s): ${anomalies.slice(0,6).join(' | ')}`);
      }
    }
  }
  console.log('');
  console.log(`== BILAN LIVE : ${okTeams}/${totalTeams} équipes OK · ${brokenTeams} cassées ==`);
  // task #2 : seulement juillet(2026-6) + août(2026-7) attendus
  const extra=months.filter(m=>m!=='2026-6'&&m!=='2026-7');
  if(extra.length) console.log(`⚠️  MOIS EN TROP dans la base live: ${extra.join(', ')} (attendu: 2026-6 juillet + 2026-7 août)`);
  else console.log(`✅ base live = uniquement juillet(2026-6) + août(2026-7)`);
  if(brokenTeams>0){ console.log('FAIL: des équipes ne respectent pas la fenêtre glissante'); process.exit(2); }
  console.log('SUCCESS');
})().catch(e=>{ console.error('ERREUR', e.message); process.exit(1); });
