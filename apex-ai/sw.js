const CACHE='apex-ai-v1.0';
const ASSETS=['./','./index.html'];

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}));
  self.skipWaiting();
});

self.addEventListener('activate',function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){
        return caches.delete(k);
      }));
    }).then(function(){return self.clients.claim();})
  );
});

self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  var url=e.request.url;
  if(url.indexOf('firebasedatabase.app')>=0||url.indexOf('api.anthropic.com')>=0||url.indexOf('stripe.com')>=0)return;
  e.respondWith(
    fetch(e.request).then(function(resp){
      if(resp&&resp.status===200){
        var clone=resp.clone();
        caches.open(CACHE).then(function(c){c.put(e.request,clone);});
      }
      return resp;
    }).catch(function(){return caches.match(e.request);})
  );
});

self.addEventListener('message',function(e){
  if(e.data==='skipWaiting')self.skipWaiting();
});
