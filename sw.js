const CACHE='cmcteams-v9.67d';
const ASSETS=['./','/index.html'];

// Install : pré-cache l'app
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}));
  self.skipWaiting();
});

// Activate : nettoyer les anciens caches
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }));
  self.clients.claim();
});

// Fetch : stale-while-revalidate pour l'app, network-first pour Firebase
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET') return;
  var url=e.request.url;

  // Firebase/API : network only (pas de cache pour les données temps réel)
  if(url.indexOf('firebasedatabase.app')>=0||url.indexOf('api.anthropic.com')>=0||url.indexOf('api.emailjs.com')>=0||url.indexOf('ipwho.is')>=0){
    return;
  }

  // App : stale-while-revalidate (affiche le cache immédiatement, met à jour en arrière-plan)
  e.respondWith(
    caches.open(CACHE).then(function(cache){
      return cache.match(e.request).then(function(cached){
        var fetchPromise=fetch(e.request).then(function(resp){
          if(resp&&resp.status===200){
            cache.put(e.request,resp.clone());
          }
          return resp;
        }).catch(function(){return cached;});
        return cached||fetchPromise;
      });
    })
  );
});
