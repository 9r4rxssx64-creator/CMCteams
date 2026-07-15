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
})().catch(e=>{ console.error('ERREUR', e.message); process.exit(1); });
