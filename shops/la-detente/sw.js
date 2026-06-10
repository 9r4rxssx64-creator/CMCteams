/* KDMC Shops — Service Worker La Détente. MAJ auto forcée : network-first pour les
   pages (toujours la dernière version en ligne), cache-first pour les assets, fallback offline. */
var CACHE='kdmc-la-detente-v1.53.1';
var PRE=['./','studio.html','bibliotheque.html','/CMCteams/shops/legal/cgv.html'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(PRE).catch(function(){})}));self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE&&(k.indexOf('kdmc-la-detente-')===0||k==='kdmc-v1')}).map(function(k){return caches.delete(k)}))}));self.clients.claim()});
self.addEventListener('message',function(e){if(e.data==='skipWaiting')self.skipWaiting()});
/* 🔔 Notifications push (alertes commande) */
self.addEventListener('push',function(e){
  var d={title:'La Détente',body:'Nouvelle activité',url:'./index.html'};
  try{if(e.data)d=Object.assign(d,e.data.json());}catch(_){try{d.body=e.data.text();}catch(__){}}
  /* 1-tap = valider/payer la commande dans Printify (d.url) ; bouton « Boutique » = admin (d.admin_url) */
  e.waitUntil(self.registration.showNotification(d.title,{body:d.body,icon:'img/og.png',badge:'img/og.png',tag:d.tag||'ld',data:{url:d.url||'./index.html',admin_url:d.admin_url||'./index.html'},actions:Array.isArray(d.actions)?d.actions:[],vibrate:[80,40,80],requireInteraction:true}));
});
self.addEventListener('notificationclick',function(e){
  e.notification.close();
  var dd=e.notification.data||{};
  var u=(e.action==='admin'&&dd.admin_url)?dd.admin_url:(dd.url||'./index.html');
  /* lien externe (Printify) ou admin avec ?ld_admin=1 → ouvrir directement */
  e.waitUntil(self.clients.openWindow?self.clients.openWindow(u):Promise.resolve());
});
self.addEventListener('fetch',function(e){
  var req=e.request; if(req.method!=='GET')return;
  var isNav=req.mode==='navigate'||(req.headers.get('accept')||'').indexOf('text/html')>=0;
  if(isNav){
    e.respondWith(fetch(req).then(function(res){if(res&&res.status===200){var c=res.clone();caches.open(CACHE).then(function(ca){ca.put(req,c)})}return res}).catch(function(){return caches.match(req).then(function(m){return m||caches.match('./')})}));
  }else{
    e.respondWith(caches.match(req).then(function(r){return r||fetch(req).then(function(res){if(res&&res.status===200){var c=res.clone();caches.open(CACHE).then(function(ca){ca.put(req,c)})}return res})}));
  }
});
