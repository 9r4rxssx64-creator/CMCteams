const CACHE='kdmc-v12.51';
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
  if(url.indexOf('firebasedatabase.app')>=0||url.indexOf('api.anthropic.com')>=0||url.indexOf('stripe.com')>=0||url.indexOf('finnhub.io')>=0||url.indexOf('exchangerate-api')>=0||url.indexOf('api.telegram.org')>=0||url.indexOf('api.emailjs.com')>=0||url.indexOf('workers.dev')>=0)return;
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
  if(e.data&&e.data.type==='SYNC_QUEUE'){
    var queue=e.data.queue||{};
    Object.keys(queue).forEach(function(k){
      var item=queue[k];
      if(!item||!item.v)return;
      var fbUrl=e.data.fbUrl;
      if(!fbUrl)return;
      fetch(fbUrl+'/apex/'+encodeURIComponent(k)+'.json',{
        method:'PUT',headers:{'Content-Type':'application/json'},
        body:JSON.stringify(item.v)
      }).catch(function(){});
    });
  }
});

self.addEventListener('push',function(e){
  if(!e.data)return;
  var data=e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title||'KDMC',{
      body:data.body||'',
      icon:data.icon||'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 96 96%27%3E%3Crect width=%2796%27 height=%2796%27 rx=%2720%27 fill=%27%2308080f%27/%3E%3Ctext x=%2748%27 y=%2766%27 text-anchor=%27middle%27 font-size=%2740%27 fill=%27%23c9a227%27%3E%E2%9C%A6%3C/text%3E%3C/svg%3E',
      badge:data.badge||undefined,
      tag:data.tag||'kdmc',
      data:data.url||'/'
    })
  );
});

self.addEventListener('notificationclick',function(e){
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window'}).then(function(list){
      for(var i=0;i<list.length;i++){
        if(list[i].url&&list[i].focus)return list[i].focus();
      }
      return clients.openWindow(e.notification.data||'/');
    })
  );
});
