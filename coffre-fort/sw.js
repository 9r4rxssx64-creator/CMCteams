/* Coffre-fort perso — Service Worker. Network-first (MAJ auto), fallback cache offline. */
var CACHE_VERSION = 'coffre-v1.0.0';
var CORE = ['./','index.html','config.json','manifest.json'];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_VERSION).then(function(c){ return c.addAll(CORE).catch(function(){}); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==CACHE_VERSION; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var req=e.request;
  if(req.method!=='GET') return;
  var url=req.url;
  /* skip version-check / force-update URLs (network direct) */
  if(url.indexOf('?_v=')>=0 || url.indexOf('?_h=')>=0 || url.indexOf('_force')>=0) return;
  /* ne jamais cacher Firebase / worker R2 (données chiffrées dynamiques) */
  if(url.indexOf('firebasedatabase.app')>=0 || url.indexOf('workers.dev')>=0 || url.indexOf('/v1/chunk')>=0) return;
  e.respondWith(
    fetch(req).then(function(resp){
      if(resp && resp.ok && (url.indexOf(self.location.origin)===0)){
        var copy=resp.clone(); caches.open(CACHE_VERSION).then(function(c){ c.put(req, copy).catch(function(){}); });
      }
      return resp;
    }).catch(function(){ return caches.match(req).then(function(m){ return m || caches.match('index.html'); }); })
  );
});
