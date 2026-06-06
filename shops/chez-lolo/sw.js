/* KDMC Shops — Service Worker Chez Lolo. MAJ auto forcée : network-first pour les
   pages (toujours la dernière version en ligne), cache-first pour les assets, fallback offline. */
var CACHE='kdmc-chez-lolo-v2.0.4';
var PRE=['./','studio.html','bibliotheque.html','/CMCteams/shops/legal/cgv.html'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(PRE).catch(function(){})}));self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE&&(k.indexOf('kdmc-chez-lolo-')===0||k==='kdmc-v1')}).map(function(k){return caches.delete(k)}))}));self.clients.claim()});
self.addEventListener('message',function(e){if(e.data==='skipWaiting')self.skipWaiting()});
/* 🔔 Notifications push (alertes commande) */
self.addEventListener('push',function(e){
  var d={title:'Chez Lolo',body:'Nouvelle activité',url:'./index.html'};
  try{if(e.data)d=Object.assign(d,e.data.json());}catch(_){try{d.body=e.data.text();}catch(__){}}
  e.waitUntil(self.registration.showNotification(d.title,{body:d.body,icon:'img/og.png',badge:'img/og.png',tag:d.tag||'ld',data:{url:d.url||'./index.html'},vibrate:[80,40,80],requireInteraction:true}));
});
self.addEventListener('notificationclick',function(e){
  e.notification.close();
  var u=(e.notification.data&&e.notification.data.url)||'./index.html';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(cl){for(var i=0;i<cl.length;i++){if(cl[i].url.indexOf('chez-lolo')>=0&&'focus'in cl[i])return cl[i].focus();}if(self.clients.openWindow)return self.clients.openWindow(u);}));
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
