var CACHE='kdmc-v1';
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(['./','/CMCteams/shops/legal/cgv.html'])}));self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}));self.clients.claim()});
self.addEventListener('fetch',function(e){if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(function(r){return r||fetch(e.request).then(function(res){if(res.ok){var c=res.clone();caches.open(CACHE).then(function(ca){ca.put(e.request,c)})}return res}).catch(function(){return caches.match('./')})}))});
