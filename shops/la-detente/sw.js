/* KDMC Shops — Service Worker La Détente. Cache nommé par boutique + nettoyage scopé. */
var CACHE='kdmc-la-detente-v1.12.0';
var PRE=['./','studio.html','bibliotheque.html','/CMCteams/shops/legal/cgv.html'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(PRE)}));self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE&&(k.indexOf('kdmc-la-detente-')===0||k==='kdmc-v1')}).map(function(k){return caches.delete(k)}))}));self.clients.claim()});
self.addEventListener('fetch',function(e){var u=new URL(e.request.url);if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(function(r){if(r&&r.status===200&&u.origin===location.origin){var c=r.clone();caches.open(CACHE).then(function(ca){ca.put(e.request,c)})}return r}).catch(function(){return caches.match(e.request).then(function(m){return m||caches.match('./')})}))});
