const CACHE='cmcteams-v9.67f';
const ASSETS=['./','/index.html'];

// Install : pré-cache + force activation immédiate
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}));
  self.skipWaiting(); // Active immédiatement (pas attendre fermeture onglets)
});

// Activate : supprimer TOUS les anciens caches + prendre le contrôle
self.addEventListener('activate',function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){
        console.log('SW: suppression ancien cache',k);
        return caches.delete(k);
      }));
    }).then(function(){
      return self.clients.claim(); // Prend le contrôle de tous les onglets
    })
  );
});

// Fetch : network-first pour l'app (toujours la dernière version)
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET') return;
  var url=e.request.url;

  // Firebase/API : pas de cache (données temps réel)
  if(url.indexOf('firebasedatabase.app')>=0||url.indexOf('api.anthropic.com')>=0||url.indexOf('api.emailjs.com')>=0||url.indexOf('ipwho.is')>=0){
    return;
  }

  // App : network-first (toujours chercher la dernière version, cache en fallback offline)
  e.respondWith(
    fetch(e.request).then(function(resp){
      if(resp&&resp.status===200){
        var clone=resp.clone();
        caches.open(CACHE).then(function(c){c.put(e.request,clone);});
      }
      return resp;
    }).catch(function(){
      return caches.match(e.request);
    })
  );
});

// Message : force update depuis l'app
self.addEventListener('message',function(e){
  if(e.data==='skipWaiting') self.skipWaiting();
});
