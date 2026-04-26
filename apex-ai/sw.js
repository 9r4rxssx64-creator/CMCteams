/* Apex AI — Service Worker pro v12.312
 * Strategies de cache differenciees + offline robuste + background sync + push iPhone PWA
 *
 * Caches:
 *   <ver>-static  : assets statiques (cache-first, long TTL)
 *   <ver>-runtime : ressources dynamiques (stale-while-revalidate)
 *   <ver>-offline : page de fallback offline
 *
 * Compatible iOS Safari PWA 16.4+ (push notifications + display-mode:standalone).
 * Limitations iOS connues : pas de Background Sync API, fallback via window online.
 */

const CACHE_VERSION  = 'apex-v12.315';
const STATIC_CACHE   = CACHE_VERSION + '-static';
const RUNTIME_CACHE  = CACHE_VERSION + '-runtime';
const OFFLINE_CACHE  = CACHE_VERSION + '-offline';

/* Assets pre-caches au install (chemins relatifs au scope /apex-ai/) */
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './og-image.svg',
  './cgu.html',
  './privacy.html'
];

/* Domaines API : toujours network-first, jamais de cache long */
const API_HOSTS = [
  'firebasedatabase.app',
  'api.anthropic.com',
  'stripe.com',
  'finnhub.io',
  'exchangerate-api',
  'api.telegram.org',
  'api.emailjs.com',
  'workers.dev',
  'api.openai.com',
  'ipwho.is',
  'api.apex.sbs'
];

/* Page de fallback offline (HTML inline pour eviter dependance fichier) */
const OFFLINE_PAGE = '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>APEX — Hors ligne</title><style>body{margin:0;background:#08080f;color:#c9a227;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;text-align:center}.box{max-width:420px}h1{font-family:Georgia,serif;font-size:48px;margin:0 0 8px;letter-spacing:4px}.s{color:#6a8aff;font-size:14px;letter-spacing:2px;margin:0 0 24px}.t{color:#fff;font-size:16px;line-height:1.5;margin:0 0 24px}.b{display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;border-radius:24px;font-weight:700;font-size:14px;cursor:pointer;text-decoration:none}.b:active{transform:scale(.96)}.i{font-size:64px;margin-bottom:12px}</style></head><body><div class="box"><div class="i">📡</div><h1>APEX</h1><p class="s">HORS LIGNE</p><p class="t">Pas de reseau pour le moment. Tes donnees locales sont la, l\'app revient des le retour de la connexion.</p><a class="b" href="/CMCteams/apex-ai/">Reessayer</a></div><script>window.addEventListener("online",function(){location.reload();});</script></body></html>';

/* ================== INSTALL ================== */
self.addEventListener('install', function(e){
  e.waitUntil(Promise.all([
    /* Pre-cache statique (best-effort : un asset manquant ne bloque pas l'install) */
    caches.open(STATIC_CACHE).then(function(c){
      return Promise.all(PRECACHE_ASSETS.map(function(u){
        return c.add(u).catch(function(err){
          console.warn('SW precache miss:', u, err && err.message);
        });
      }));
    }),
    /* Page offline statique */
    caches.open(OFFLINE_CACHE).then(function(c){
      return c.put('apex-offline-fallback', new Response(OFFLINE_PAGE, {
        headers: {'Content-Type': 'text/html; charset=utf-8'}
      }));
    })
  ]).then(function(){ return self.skipWaiting(); }));
});

/* ================== ACTIVATE ================== */
self.addEventListener('activate', function(e){
  e.waitUntil(Promise.all([
    /* Cleanup auto : supprime tous les caches qui ne portent pas la version actuelle */
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){
        return k !== STATIC_CACHE && k !== RUNTIME_CACHE && k !== OFFLINE_CACHE;
      }).map(function(k){
        console.log('SW cleanup ancien cache:', k);
        return caches.delete(k);
      }));
    }),
    /* Prendre le controle de tous les onglets ouverts (pas attendre fermeture) */
    self.clients.claim()
  ]));
});

/* ================== HELPERS ================== */
function isApiRequest(url){
  for (var i=0;i<API_HOSTS.length;i++){
    if (url.indexOf(API_HOSTS[i]) >= 0) return true;
  }
  return false;
}

function isStaticAsset(req){
  var url = req.url;
  if (req.mode === 'navigate') return false; /* HTML => network-first pour MAJ rapide */
  if (/\.(svg|png|jpg|jpeg|gif|webp|ico)(\?|$)/i.test(url)) return true;
  if (/\bmanifest\.json(\?|$)/i.test(url)) return true;
  if (/\bog-image\.svg(\?|$)/i.test(url)) return true;
  if (/\.(woff2?|ttf|otf|eot)(\?|$)/i.test(url)) return true;
  return false;
}

function isStaleWhileRevalidate(req){
  var url = req.url;
  /* CSS / JS modules / fonts externes => SWR (frais en arriere-plan) */
  if (/\.(css|js|mjs)(\?|$)/i.test(url)) return true;
  if (/fonts\.(googleapis|gstatic)\.com/.test(url)) return true;
  if (/cdn\.jsdelivr\.net|unpkg\.com/.test(url)) return true;
  return false;
}

/* Cache-first : retourne cache si dispo, sinon network + cache */
function cacheFirst(req){
  return caches.match(req).then(function(cached){
    if (cached) return cached;
    return fetch(req).then(function(resp){
      if (resp && resp.status === 200 && resp.type !== 'opaque'){
        var clone = resp.clone();
        caches.open(STATIC_CACHE).then(function(c){
          c.put(req, clone).catch(function(){});
        });
      }
      return resp;
    });
  });
}

/* Network-first : essaie le reseau, fallback cache si offline */
function networkFirst(req, timeoutMs){
  timeoutMs = timeoutMs || 5000;
  return new Promise(function(resolve, reject){
    var done = false;
    var timer = setTimeout(function(){
      if (done) return;
      done = true;
      caches.match(req).then(function(cached){
        if (cached) resolve(cached);
        else reject(new Error('Network timeout'));
      });
    }, timeoutMs);

    fetch(req).then(function(resp){
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (resp && resp.status === 200 && resp.type !== 'opaque'){
        var clone = resp.clone();
        caches.open(RUNTIME_CACHE).then(function(c){
          c.put(req, clone).catch(function(){});
        });
      }
      resolve(resp);
    }).catch(function(err){
      if (done) return;
      done = true;
      clearTimeout(timer);
      caches.match(req).then(function(cached){
        if (cached) resolve(cached);
        else reject(err);
      });
    });
  });
}

/* Stale-while-revalidate : retourne cache immediatement, refresh en arriere-plan */
function staleWhileRevalidate(req){
  return caches.open(RUNTIME_CACHE).then(function(c){
    return c.match(req).then(function(cached){
      var fetchPromise = fetch(req).then(function(resp){
        if (resp && resp.status === 200 && resp.type !== 'opaque'){
          c.put(req, resp.clone()).catch(function(){});
        }
        return resp;
      }).catch(function(){ return cached; });
      return cached || fetchPromise;
    });
  });
}

/* ================== FETCH ================== */
self.addEventListener('fetch', function(e){
  var req = e.request;
  if (req.method !== 'GET') return;

  var url = req.url;

  /* APIs : laisser passer (network-only, le code app gere lui-meme retry/queue) */
  if (isApiRequest(url)) return;

  /* Schemes non-http (data:, blob:, chrome-extension:) : ignorer */
  if (!url.startsWith('http')) return;

  /* Navigation HTML : network-first 5s + fallback offline page */
  if (req.mode === 'navigate'){
    e.respondWith(
      networkFirst(req, 5000).catch(function(){
        return caches.match('apex-offline-fallback').then(function(fb){
          return fb || new Response(OFFLINE_PAGE, {
            headers: {'Content-Type': 'text/html; charset=utf-8'}
          });
        });
      })
    );
    return;
  }

  /* Assets statiques : cache-first (rapide) */
  if (isStaticAsset(req)){
    e.respondWith(cacheFirst(req).catch(function(){
      return caches.match(req);
    }));
    return;
  }

  /* CSS/JS/fonts : stale-while-revalidate (equilibre) */
  if (isStaleWhileRevalidate(req)){
    e.respondWith(staleWhileRevalidate(req));
    return;
  }

  /* Default : network-first avec fallback cache */
  e.respondWith(networkFirst(req, 4000).catch(function(){
    return caches.match(req).then(function(cached){
      if (cached) return cached;
      /* Pour les images manquantes : retourner SVG transparent 1x1 */
      if (req.destination === 'image'){
        return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>', {
          headers: {'Content-Type': 'image/svg+xml'}
        });
      }
      return new Response('', {status: 504, statusText: 'Offline'});
    });
  }));
});

/* ================== MESSAGES (skipWaiting + sync queue + keepalive) ================== */
self.addEventListener('message', function(e){
  if (!e.data) return;

  /* Force activation nouvelle version */
  if (e.data === 'skipWaiting'){
    self.skipWaiting();
    return;
  }

  /* Replay queue offline : POST/PUT differes (Firebase uniquement pour l'instant) */
  if (e.data.type === 'SYNC_QUEUE'){
    var queue = e.data.queue || {};
    var fbUrl = e.data.fbUrl;
    if (!fbUrl) return;
    Object.keys(queue).forEach(function(k){
      var item = queue[k];
      if (!item || typeof item.v === 'undefined') return;
      fetch(fbUrl + '/apex/' + encodeURIComponent(k) + '.json', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(item.v)
      }).then(function(r){
        /* Notifier les clients du succes pour qu'ils retirent de la queue locale */
        if (r.ok){
          self.clients.matchAll().then(function(list){
            list.forEach(function(c){
              c.postMessage({type: 'SYNC_QUEUE_OK', key: k});
            });
          });
        }
      }).catch(function(){
        /* Echec silencieux : la queue locale gardera l'item */
      });
    });
    return;
  }

  /* Heartbeat anti-iOS pour garder le SW reveille */
  if (e.data.type === 'keepalive'){
    /* No-op : le simple fait de recevoir un message reactive le SW iOS */
    return;
  }

  /* Cleanup manuel du cache (admin) */
  if (e.data.type === 'CLEAR_CACHE'){
    e.waitUntil(
      caches.keys().then(function(keys){
        return Promise.all(keys.map(function(k){ return caches.delete(k); }));
      }).then(function(){
        self.clients.matchAll().then(function(list){
          list.forEach(function(c){ c.postMessage({type: 'CACHE_CLEARED'}); });
        });
      })
    );
    return;
  }
});

/* ================== BACKGROUND SYNC (Chrome/Android) ================== */
/* iOS Safari ne supporte pas Background Sync : fallback cote app via window.online */
self.addEventListener('sync', function(e){
  if (e.tag === 'apex-sync-queue'){
    e.waitUntil(
      self.clients.matchAll().then(function(list){
        list.forEach(function(c){
          c.postMessage({type: 'BG_SYNC_FLUSH'});
        });
      })
    );
  }
});

/* ================== PUSH NOTIFICATIONS (iOS 16.4+ PWA + Android Chrome) ================== */
/* Payload attendu :
 * {
 *   title: "Sentinelle critique",
 *   body: "Erreur 1500ms detectee sur dashboard",
 *   icon: "data:image/svg+xml,...",  // icone notification
 *   badge: "data:image/svg+xml,...", // petit badge mono iOS
 *   tag: "ax-sentinel",              // group/replace
 *   url: "/CMCteams/apex-ai/#sentinelshealth",  // deeplink view
 *   view: "sentinelshealth",         // alternative deeplink view name
 *   category: "sentinel",            // pour stats / filtrage
 *   urgent: true,                    // requireInteraction
 *   silent: false,
 *   vibrate: [120,60,120],
 *   actions: [{action:"see",title:"Voir details"},{action:"dismiss",title:"Ignorer"}]
 * }
 */
self.addEventListener('push', function(e){
  if (!e.data) return;
  var data = {};
  try { data = e.data.json(); } catch(_){ data = {body: e.data.text()}; }

  var title = data.title || 'APEX AI';
  var defaultIcon = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 192 192%27%3E%3Crect width=%27192%27 height=%27192%27 rx=%2736%27 fill=%27%2308080f%27/%3E%3Ctext x=%2796%27 y=%27110%27 text-anchor=%27middle%27 font-size=%2780%27 fill=%27%23c9a227%27%3E%E2%9C%A6%3C/text%3E%3C/svg%3E';
  /* Build deeplink URL : prefere data.url, sinon construit depuis data.view */
  var deepUrl = data.url || ('/CMCteams/apex-ai/' + (data.view ? '#' + encodeURIComponent(data.view) : ''));
  var options = {
    body: data.body || '',
    icon: data.icon || defaultIcon,
    badge: data.badge || defaultIcon,
    tag: data.tag || 'apex-notif',
    /* On stocke un objet pour pouvoir router actions + analytics */
    data: {
      url: deepUrl,
      view: data.view || null,
      category: data.category || 'general',
      ts: Date.now(),
      payload: data.payload || null
    },
    vibrate: data.vibrate || [120, 60, 120],
    requireInteraction: !!data.urgent,
    silent: !!data.silent,
    actions: Array.isArray(data.actions) ? data.actions.slice(0,2) : [],
    timestamp: Date.now()
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var d = e.notification.data || {};
  var targetUrl = (typeof d === 'string') ? d : (d.url || '/CMCteams/apex-ai/');
  var action = e.action || 'open';

  /* Ignorer = juste fermer la notif, pas d'ouverture */
  if (action === 'dismiss' || action === 'ignore'){
    return;
  }

  e.waitUntil(
    self.clients.matchAll({type: 'window', includeUncontrolled: true}).then(function(list){
      for (var i=0;i<list.length;i++){
        var c = list[i];
        if (c.url && c.url.indexOf('/apex-ai/') >= 0 && 'focus' in c){
          c.postMessage({
            type: 'NOTIF_CLICK',
            url: targetUrl,
            action: action,
            view: (d && d.view) || null,
            category: (d && d.category) || 'general',
            payload: (d && d.payload) || null
          });
          return c.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});

/* Notif fermee sans clic (analytics) */
self.addEventListener('notificationclose', function(e){
  var d = e.notification.data || {};
  self.clients.matchAll({type:'window', includeUncontrolled:true}).then(function(list){
    list.forEach(function(c){
      c.postMessage({type:'NOTIF_CLOSE', category:(d&&d.category)||'general', view:(d&&d.view)||null});
    });
  });
});

/* Subscription expiree : prevenir le client pour re-subscribe */
self.addEventListener('pushsubscriptionchange', function(e){
  e.waitUntil(
    self.clients.matchAll({type:'window', includeUncontrolled:true}).then(function(list){
      list.forEach(function(c){
        c.postMessage({type:'PUSH_SUB_CHANGE'});
      });
    })
  );
});

/* ================== PERIODIC SYNC (experimental Chrome) ================== */
self.addEventListener('periodicsync', function(e){
  if (e.tag === 'apex-refresh'){
    e.waitUntil(
      fetch('./index.html').then(function(resp){
        if (resp && resp.ok){
          return caches.open(STATIC_CACHE).then(function(c){
            return c.put('./index.html', resp);
          });
        }
      }).catch(function(){})
    );
  }
});
