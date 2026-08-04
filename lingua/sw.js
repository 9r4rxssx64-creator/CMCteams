/* KDMC Lingua — Service Worker (cache app shell pour usage hors-ligne) */
var CACHE = "lingua-v2.1.0";
var ASSETS = ["./","./index.html","./app.js","./data.js","./manifest.webmanifest","./icon.svg"];

self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var req=e.request;
  if(req.method!=="GET") return;
  // Laisse passer la synthèse vocale et autres schémas non-http
  if(req.url.indexOf("http")!==0) return;
  e.respondWith(
    caches.match(req).then(function(cached){
      var net=fetch(req).then(function(r){
        if(r && r.status===200 && r.type==="basic"){ var cp=r.clone(); caches.open(CACHE).then(function(c){ c.put(req,cp); }); }
        return r;
      }).catch(function(){ return cached; });
      return cached || net;
    })
  );
});
