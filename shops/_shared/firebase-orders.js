/* KDMC Shops — helper de remontée des commandes au dashboard admin.
   Isolation : path Firebase strictement `shops_admin_v1/*`. Aucune PII
   (email, adresse, CB) n'est envoyée. Échec silencieux si réseau KO. */
(function(){
  var FB="https://cmcteams-c16ab-default-rtdb.europe-west1.firebasedatabase.app";
  var BASE="shops_admin_v1";
  function safe(v,max){return String(v==null?"":v).slice(0,max||120)}
  function num(v){var n=Number(v);return isFinite(n)?n:0}
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
     Path isolé shops_admin_v1/products/<shop>/<id>. */
  function ppath(shop,id){return BASE+"/products/"+encodeURIComponent(shop)+(id?"/"+encodeURIComponent(id):"")+".json";}
  window.kdmcPublishProduct=function(shop,prod){
    if(!shop||!prod||!prod.id)return Promise.reject();
    return fetch(FB+"/"+ppath(shop,prod.id),{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(prod)});
  };
  window.kdmcDeleteProduct=function(shop,id){
    if(!shop||!id)return Promise.reject();
    return fetch(FB+"/"+ppath(shop,id),{method:"DELETE"});
  };
  window.kdmcFetchProducts=function(shop,cb){
    fetch(FB+"/"+ppath(shop)).then(function(r){return r.ok?r.json():null}).then(function(j){
      var arr=[];if(j&&typeof j==="object"){Object.keys(j).forEach(function(k){if(j[k]&&typeof j[k]==="object")arr.push(j[k])})}
      try{cb(arr)}catch(_){}
    }).catch(function(){try{cb([])}catch(_){}});
  };
})();
