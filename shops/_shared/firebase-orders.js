/* KDMC Shops — helper de remontée des commandes au dashboard admin.
   Isolation : path Firebase strictement `shops_admin_v1/*`. Aucune PII
   (email, adresse, CB) n'est envoyée. Échec silencieux si réseau KO.

   v10 (chantier Firebase par rôle) — les ÉCRITURES ADMIN (produits/logos)
   attachent un id_token Firebase `role:admin` obtenu via `/__admin/fbtoken`
   (router kd-mc.com, derrière le grant admin du domaine). FAIL-OPEN TOTAL :
   si le token est indisponible (pas admin, endpoint down, secrets FB absents)
   → l'écriture part SANS `?auth=` = comportement actuel inchangé. Le verrou
   `_phase_shops_rolelock` (déployé séparément) refusera alors l'écriture anonyme,
   mais JAMAIS de régression tant qu'il n'est pas posé. Les commandes clients
   (kdmcPushOrder) et les LECTURES restent anonymes (catalogue public). */
(function(){
  var FB="https://cmcteams-c16ab-default-rtdb.europe-west1.firebasedatabase.app";
  var BASE="shops_admin_v1";
  function safe(v,max){return String(v==null?"":v).slice(0,max||120)}
  function num(v){var n=Number(v);return isFinite(n)?n:0}

  /* ── Token admin (role:admin) — fetch paresseux + cache, 100% fail-open ──────
     Récupéré UNIQUEMENT au moment d'une écriture admin (jamais au chargement de
     page). Toute erreur → chaîne vide → écriture inchangée (aucune régression). */
  var _tok=null, _tokExp=0, _tokPromise=null;
  function _fetchAdminToken(){
    var now=Date.now();
    if(_tok && now<_tokExp) return Promise.resolve(_tok);   /* cache valide */
    if(now<_tokExp && _tok==="") return Promise.resolve(""); /* échec récent : ne pas marteler */
    if(_tokPromise) return _tokPromise;                      /* dédup en vol */
    _tokPromise=fetch("/__admin/fbtoken",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:"{}"})
      .then(function(r){ return r.ok?r.json():null; })
      .then(function(j){
        _tokPromise=null;
        if(j && j.ok && j.id_token){ _tok=String(j.id_token); _tokExp=Date.now()+Math.max(60,(num(j.expires_in)||3600)-120)*1000; return _tok; }
        _tok=""; _tokExp=Date.now()+30000; return ""; /* pas admin / non configuré : cache court */
      })
      .catch(function(){ _tokPromise=null; _tok=""; _tokExp=Date.now()+30000; return ""; });
    return _tokPromise;
  }
  /* Renvoie une Promise<"?auth=<id_token>"> ou Promise<""> (jamais de rejet). */
  function _authQS(){ return _fetchAdminToken().then(function(t){ return t?("?auth="+encodeURIComponent(t)):""; }).catch(function(){ return ""; }); }
  /* Exposé pour tests + réutilisation éventuelle. */
  window.kdmcAdminAuthQS=_authQS;

  /* ── Commande client (checkout) — ANONYME (aucun auth, jamais verrouillé) ──── */
  window.kdmcPushOrder=function(d){
    if(!d||!d.shop||!d.orderId)return;
    var path=BASE+"/orders/"+encodeURIComponent(d.shop)+"/"+encodeURIComponent(d.orderId)+".json";
    var payload={
      orderId:safe(d.orderId,40),
      shop:safe(d.shop,40),
      total:num(d.total),
      method:safe(d.method,30),
      items_count:num(d.items_count),
      items_summary:safe(d.items_summary,200),
      coupon:safe(d.coupon,30),
      status:safe(d.status||"new",20),
      ts:Date.now(),
      ts_iso:new Date().toISOString()
    };
    try{
      fetch(FB+"/"+path,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),keepalive:true}).catch(function(){});
    }catch(_){}
  };
  /* Produits publiés par l'admin (catalogue Printify → boutique), visibles par TOUS.
     Path isolé shops_admin_v1/products/<shop>/<id>. Écriture = auth admin (fail-open). */
  function ppath(shop,id){return BASE+"/products/"+encodeURIComponent(shop)+(id?"/"+encodeURIComponent(id):"")+".json";}
  window.kdmcPublishProduct=function(shop,prod){
    if(!shop||!prod||!prod.id)return Promise.reject();
    return _authQS().then(function(qs){ return fetch(FB+"/"+ppath(shop,prod.id)+qs,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(prod)}); });
  };
  window.kdmcDeleteProduct=function(shop,id){
    if(!shop||!id)return Promise.reject();
    return _authQS().then(function(qs){ return fetch(FB+"/"+ppath(shop,id)+qs,{method:"DELETE"}); });
  };
  window.kdmcFetchProducts=function(shop,cb){
    fetch(FB+"/"+ppath(shop)).then(function(r){return r.ok?r.json():null}).then(function(j){
      var arr=[];if(j&&typeof j==="object"){Object.keys(j).forEach(function(k){if(j[k]&&typeof j[k]==="object")arr.push(j[k])})}
      try{cb(arr)}catch(_){}
    }).catch(function(){try{cb([])}catch(_){}});
  };
  /* Logos gérés par l'admin (bibliothèque de logos publiée). Path shops_admin_v1/logos/<shop>/<id>.
     Écriture = auth admin (fail-open). Lecture = publique (catalogue). */
  function lpath(shop,id){return BASE+"/logos/"+encodeURIComponent(shop)+(id?"/"+encodeURIComponent(id):"")+".json";}
  window.kdmcPublishLogo=function(shop,logo){if(!shop||!logo||!logo.id)return Promise.reject();return _authQS().then(function(qs){ return fetch(FB+"/"+lpath(shop,logo.id)+qs,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(logo)}); });};
  window.kdmcDeleteLogo=function(shop,id){if(!shop||!id)return Promise.reject();return _authQS().then(function(qs){ return fetch(FB+"/"+lpath(shop,id)+qs,{method:"DELETE"}); });};
  window.kdmcFetchLogos=function(shop,cb){
    fetch(FB+"/"+lpath(shop)).then(function(r){return r.ok?r.json():null}).then(function(j){
      var arr=[];if(j&&typeof j==="object"){Object.keys(j).forEach(function(k){if(j[k]&&typeof j[k]==="object")arr.push(j[k])})}
      try{cb(arr)}catch(_){}
    }).catch(function(){try{cb([])}catch(_){}});
  };
})();
