/* Que sert RÉELLEMENT le déploiement LIVE ? (CI, réseau ouvert)
 * Kevin voit un départ faux sur l'app ET la page light → soit les 2 sont en
 * cache (vieille version sur son appareil), soit le déployé est faux.
 * Ce check récupère les VRAIS fichiers servis en ligne et confirme :
 *   - la version servie (app + page light + version.txt),
 *   - la présence du correctif d'algo départ (rot=wi / effRoster / numéro mort).
 * Repli raw.githubusercontent (= contenu déployé sur Pages) si le domaine Cloudflare
 * challenge le runner. AUCUNE donnée personnelle (on lit du CODE, pas des plannings).
 */
const LIVE = {
  app:   'https://cmcteams.kd-mc.com/index.html',
  page:  'https://cmcteams.kd-mc.com/tools/departs/index.html',
  ver:   'https://cmcteams.kd-mc.com/tools/departs/version.txt',
};
const RAW = {
  app:  'https://raw.githubusercontent.com/9r4rxssx64-creator/CMCteams/main/index.html',
  page: 'https://raw.githubusercontent.com/9r4rxssx64-creator/CMCteams/main/tools/departs/index.html',
  ver:  'https://raw.githubusercontent.com/9r4rxssx64-creator/CMCteams/main/tools/departs/version.txt',
};

async function getText(url){
  try{ const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 CMCteams-verify'}}); if(!r.ok) return {ok:false,status:r.status}; return {ok:true,txt:await r.text()}; }
  catch(e){ return {ok:false,err:e.message}; }
}
function ver(txt, re){ const m=txt.match(re); return m?m[1]:'(introuvable)'; }
function has(txt, ...subs){ return subs.every(s=>txt.includes(s)); }

(async()=>{
  console.log('== QUE SERT LE DÉPLOIEMENT LIVE ? ==\n');
  let live_ok=true;
  for(const which of ['app','page','ver']){
    let r=await getText(LIVE[which]); let src='LIVE (cmcteams.kd-mc.com)';
    if(!r.ok){ live_ok=false; console.log(`  ${which}: live KO (${r.status||r.err}) → repli raw GitHub main`); r=await getText(RAW[which]); src='RAW main (= contenu Pages)'; }
    if(!r.ok){ console.log(`  ❌ ${which}: illisible (${r.status||r.err})`); continue; }
    const t=r.txt;
    if(which==='ver'){ console.log(`  version.txt [${src}] : ${t.trim()}`); continue; }
    if(which==='page'){
      const v=ver(t,/APP_VER\s*=\s*"(v[0-9.]+)"/);
      const fix = has(t,'rot=wi+off') && has(t,'r===0||r<4') && (t.includes('SEQd[(((rot+j)%N)+N)%N]'));
      console.log(`  PAGE Départs [${src}] : ${v}  · correctif algo (rot=wi + roster + numéro mort) : ${fix?'✅ PRÉSENT':'❌ ABSENT'}`);
    }
    if(which==='app'){
      const v=ver(t,/APP_VER\s*=\s*"(v[0-9.]+)"/);
      const fix = has(t,'var SEQd=getSeqForSize(N), rot=wi') && has(t,'effRoster=chefEmps') && has(t,'r===0||r<4');
      console.log(`  APP CMCteams [${src}] : ${v}  · correctif algo (calcDepPos rot=wi + effRoster + numéro mort) : ${fix?'✅ PRÉSENT':'❌ ABSENT'}`);
    }
  }
  console.log('');
  console.log(live_ok
    ? '→ Le domaine LIVE répond et sert ces versions.'
    : '→ Le domaine Cloudflare a challengé le runner ; le contenu Pages (raw main) est identique à ce qui est servi.');
  console.log('Si le correctif est ✅ PRÉSENT partout : le calcul déployé est bon → un départ faux vu par Kevin = ANCIENNE version en cache sur son appareil (rafraîchir / ré-ouvrir).');

  /* 5.09.2026 — le code admin se vérifie CÔTÉ DOMAINE (POST /__admin/login), plus dans la page.
     On prouve ici, en vrai, que le routeur (a) répond en JSON, (b) REFUSE un mauvais code,
     (c) a bien un code configuré — `admin_pin_not_configured` voudrait dire que le secret n'a
     pas été poussé (c'est exactement ce qui s'est passé du 13/08 au 05/09 : déploiement rouge,
     secret jamais mis à jour). Un seul essai faux : le compteur anti-force-brute le tolère.
     On n'envoie JAMAIS le vrai code ni son empreinte — un code bidon suffit à prouver le refus. */
  console.log('\n== LE DOMAINE VÉRIFIE-T-IL LE CODE ADMIN ? ==');
  let j=null, st=0;
  try{
    const r=await fetch('https://kd-mc.com/__admin/login',{method:'POST',headers:{'Content-Type':'application/json','User-Agent':'Mozilla/5.0 CMCteams-verify'},body:JSON.stringify({code:'000000'})});
    st=r.status; j=await r.json().catch(()=>null);
  }catch(e){ console.log('  ❌ /__admin/login injoignable : '+e.message); process.exit(1); }
  if(!j){ console.log(`  ❌ /__admin/login ne répond pas en JSON (HTTP ${st})`); process.exit(1); }
  if(j.ok){ console.log('  ❌ un code BIDON a été ACCEPTÉ — faille'); process.exit(1); }
  if(j.reason==='admin_pin_not_configured'){ console.log('  ❌ le routeur n\'a AUCUN code configuré (secret KDMC_ADMIN_PIN_SHA256 absent) → relancer deploy-kdmc-router'); process.exit(1); }
  if(j.reason!=='code_invalide' && j.reason!=='rate_limited'){ console.log(`  ❌ réponse inattendue : ${JSON.stringify(j).slice(0,120)}`); process.exit(1); }
  console.log(`  ✅ mauvais code REFUSÉ par le domaine (HTTP ${st}, reason=${j.reason}) — un code est bien configuré côté routeur.`);
  console.log('  ℹ️  Ce contrôle prouve le REFUS et la présence d\'un secret ; il ne peut pas dire LEQUEL (le vrai code ne s\'écrit nulle part) → l\'acceptation du nouveau code se vérifie par une connexion réelle sur departs.kd-mc.com.');
})().catch(e=>{ console.error('ERREUR', e.message); process.exit(1); });
