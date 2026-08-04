/* Page admin « Qui se connecte à mon domaine » — servie par kdmc-access GET /.
 * Autonome, mobile-first, dark. PIN admin (SHA-256) → auto-déverrouillage sur
 * appareil de confiance ensuite. Appelle GET /history (même origine). Le script
 * interne évite les template-literals pour rester dans ce backtick sans échappement. */
export const PAGE_HTML = `<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0a0f0a">
<title>Qui se connecte — kd-mc.com</title>
<style>
  :root{--bg:#080c08;--bg2:#0f150f;--card:#121a12;--bd:#1e2c1e;--gold:#c9a227;--txt:#e7f0e0;--txt2:#9db08e;--txt3:#68785e;--on:#3ad06a;--off:#57604f}
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{margin:0;background:radial-gradient(120% 80% at 50% 0,#0e160e,var(--bg));color:var(--txt);font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;min-height:100vh;padding:env(safe-area-inset-top) 0 calc(env(safe-area-inset-bottom) + 40px)}
  .wrap{max-width:760px;margin:0 auto;padding:0 14px}
  header{position:sticky;top:0;z-index:5;background:linear-gradient(180deg,var(--bg) 70%,transparent);padding:16px 0 10px;backdrop-filter:blur(8px)}
  h1{font-size:19px;margin:0;font-weight:800;letter-spacing:-.3px}
  h1 .g{color:var(--gold)}
  .sub{color:var(--txt2);font-size:12.5px;margin-top:3px}
  .row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  input,button{font:inherit}
  .search{width:100%;margin:10px 0 4px;padding:11px 13px;border-radius:11px;border:1px solid var(--bd);background:var(--bg2);color:var(--txt);font-size:16px}
  .btn{padding:10px 15px;border-radius:11px;border:1px solid var(--bd);background:var(--card);color:var(--txt);font-weight:600;cursor:pointer;min-height:44px}
  .btn.p{background:linear-gradient(135deg,#d8b23a,#9a7810);border:none;color:#0a0f0a;font-weight:800}
  .card{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:13px 14px;margin:10px 0}
  .pers{display:flex;align-items:center;gap:11px;cursor:pointer}
  .dot{width:10px;height:10px;border-radius:50%;flex:0 0 auto;box-shadow:0 0 0 3px rgba(0,0,0,.25)}
  .nm{font-weight:700;font-size:15.5px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .when{color:var(--txt3);font-size:12px;white-space:nowrap}
  .chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}
  .chip{font-size:11.5px;padding:3px 9px;border-radius:20px;background:var(--bg2);border:1px solid var(--bd);color:var(--txt2)}
  .chip.app{color:#dfe9d6;border-color:#2a3d29}
  .chip.g{color:var(--gold);border-color:#3a3216}
  .tier{font-size:10.5px;padding:2px 7px;border-radius:6px;background:#1a2416;color:var(--txt2);text-transform:uppercase;letter-spacing:.5px}
  .tl{margin-top:11px;border-top:1px solid var(--bd);padding-top:9px;display:none}
  .tl.open{display:block}
  .ev{display:flex;gap:9px;font-size:12.5px;padding:5px 0;color:var(--txt2);border-bottom:1px solid rgba(255,255,255,.03)}
  .ev .t{color:var(--txt3);white-space:nowrap;font-variant-numeric:tabular-nums}
  .ev .e{color:var(--txt);flex:1}
  .empty{text-align:center;color:var(--txt3);padding:50px 20px}
  .lock{max-width:340px;margin:16vh auto 0;text-align:center;padding:0 20px}
  .lock .em{font-size:44px}
  .pin{width:100%;margin-top:18px;padding:14px;border-radius:12px;border:1px solid var(--bd);background:var(--bg2);color:var(--txt);font-size:22px;text-align:center;letter-spacing:10px}
  .err{color:#e8736b;font-size:13px;margin-top:10px;min-height:18px}
  .badge{position:fixed;left:calc(env(safe-area-inset-left) + 8px);bottom:calc(env(safe-area-inset-bottom) + 8px);font-size:10px;color:var(--txt3);background:rgba(0,0,0,.5);padding:3px 7px;border-radius:6px;border:1px solid var(--bd);z-index:9}
  .kpi{display:flex;gap:14px;margin-top:8px}
  .kpi b{color:var(--gold)}
</style></head>
<body>
<div id="app"></div>
<div class="badge">kdmc-access v1.0</div>
<script>
(function(){
  var $=function(s,r){return (r||document).querySelector(s)};
  var app=$('#app');var KEY='kdmc_access_pinhash';var DATA=null;var TIMER=null;
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  async function sha(t){var b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,'0')}).join('')}
  function ago(ts){if(!ts)return '';var s=Math.floor((Date.now()-ts)/1000);if(s<60)return 'à l\\'instant';var m=Math.floor(s/60);if(m<60)return 'il y a '+m+' min';var h=Math.floor(m/60);if(h<24)return 'il y a '+h+' h';var d=Math.floor(h/24);return 'il y a '+d+' j'}
  function dt(ts){var d=new Date(ts);return d.toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}

  function renderLock(msg){
    app.innerHTML='<div class="lock"><div class="em">🔐</div>'
      +'<h1 style="margin-top:12px">Qui se connecte <span class="g">·</span> admin</h1>'
      +'<div class="sub">Réservé à Kevin. Entre ton code admin.</div>'
      +'<input class="pin" id="pin" type="password" inputmode="numeric" autocomplete="off" placeholder="••••••">'
      +'<div class="err" id="err">'+(msg||'')+'</div>'
      +'<button class="btn p" id="go" style="width:100%">Déverrouiller</button>'
      +'<label style="display:block;margin-top:14px;color:var(--txt3);font-size:12.5px"><input type="checkbox" id="rem" checked style="width:18px;height:18px;vertical-align:-3px"> Se souvenir de cet appareil</label></div>';
    var pin=$('#pin');pin.focus();
    var go=function(){submitPin(pin.value.trim(),$('#rem').checked)};
    $('#go').onclick=go;pin.onkeydown=function(e){if(e.key==='Enter')go()};
  }
  async function submitPin(v,remember){
    if(!v){return}
    var h=await sha(v);
    var ok=await load(h);
    if(ok&&remember){try{localStorage.setItem(KEY,h)}catch(e){}}
    else if(!ok){try{localStorage.removeItem(KEY)}catch(e){}}
  }
  async function load(hash){
    try{
      var r=await fetch('/history',{headers:{'x-apex-pin':hash}});
      if(r.status===401){renderLock('Code incorrect.');return false}
      if(!r.ok){renderLock('Souci serveur ('+r.status+'), réessaie.');return false}
      DATA=await r.json();window._pinhash=hash;renderMain();startAuto();return true;
    }catch(e){renderLock('Réseau indisponible, réessaie.');return false}
  }
  function startAuto(){if(TIMER)clearInterval(TIMER);TIMER=setInterval(function(){if(window._pinhash&&document.visibilityState==='visible')refresh()},30000)}
  async function refresh(){try{var r=await fetch('/history',{headers:{'x-apex-pin':window._pinhash}});if(r.ok){DATA=await r.json();renderMain(true)}}catch(e){}}

  var Q='';var OPEN={};
  function renderMain(keepScroll){
    var y=keepScroll?window.scrollY:0;
    var people=(DATA&&DATA.people)||[];
    var online=people.filter(function(p){return p.online}).length;
    var q=Q.toLowerCase();
    var shown=q?people.filter(function(p){return (p.name||'').toLowerCase().indexOf(q)>=0||(p.appsList||[]).join(' ').toLowerCase().indexOf(q)>=0}):people;
    var h='<header><div class="wrap"><div class="row"><div style="flex:1"><h1>Qui se connecte <span class="g">·</span> mon domaine</h1>'
      +'<div class="kpi"><span><b>'+people.length+'</b> personnes</span><span><b>'+online+'</b> en ligne</span><span><b>'+((DATA&&DATA.totalEvents)||0)+'</b> évènements</span></div></div>'
      +'<button class="btn" id="rf">↻</button></div>'
      +'<input class="search" id="q" placeholder="🔎 Rechercher une personne, une app…" value="'+esc(Q)+'"></div></header><div class="wrap" id="list">';
    if(!shown.length){h+='<div class="empty">📭 '+(q?'Aucun résultat.':'Aucune connexion enregistrée pour le moment.<br>Les apps commenceront à alimenter ce journal.')+'</div>'}
    shown.forEach(function(p){
      var dev=(p.devicesList||[]).map(function(d){return '<span class="chip">'+esc(d)+'</span>'}).join('');
      var apps=(p.appsList||[]).map(function(a){return '<span class="chip app">'+esc(a)+'</span>'}).join('');
      var tiers=Object.keys(p.tiers||{}).map(function(t){return '<span class="tier">'+esc(t)+'</span>'}).join(' ');
      var opened=OPEN[p.key];
      var tl=(p.recent||[]).map(function(e){return '<div class="ev"><span class="t">'+dt(e.ts)+'</span><span class="e">'+esc(e.event||'')+(e.app?' · '+esc(e.app):'')+(e.device?' · '+esc(e.device):'')+(e.country?' · '+esc(e.country):'')+'</span></div>'}).join('');
      h+='<div class="card"><div class="pers" data-k="'+esc(p.key)+'">'
        +'<span class="dot" style="background:'+(p.online?'var(--on)':'var(--off)')+'"></span>'
        +'<span class="nm">'+esc(p.name)+' '+tiers+'</span>'
        +'<span class="when">'+ago(p.lastSeen)+'</span></div>'
        +'<div class="chips">'+apps+dev+'<span class="chip g">'+p.count+' actions</span><span class="chip">1re fois '+dt(p.firstSeen)+'</span></div>'
        +'<div class="tl'+(opened?' open':'')+'" data-tl="'+esc(p.key)+'">'+(tl||'<div class="ev">—</div>')+'</div></div>';
    });
    h+='</div>';
    app.innerHTML=h;
    if(keepScroll)window.scrollTo(0,y);
    var qi=$('#q');qi.oninput=function(){Q=qi.value;var pos=qi.selectionStart;renderMain(true);var n=$('#q');n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}};
    $('#rf').onclick=refresh;
    Array.prototype.forEach.call(document.querySelectorAll('.pers'),function(el){el.onclick=function(){var k=el.getAttribute('data-k');OPEN[k]=!OPEN[k];var t=document.querySelector('[data-tl="'+CSS.escape(k)+'"]');if(t)t.classList.toggle('open',OPEN[k])}});
  }

  // Auto-déverrouillage si appareil de confiance (rule : reconnu auto après 1re connexion)
  var saved=null;try{saved=localStorage.getItem(KEY)}catch(e){}
  if(saved){load(saved).then(function(ok){if(!ok)renderLock('')})}else{renderLock('')}
})();
</script>
</body></html>`;
