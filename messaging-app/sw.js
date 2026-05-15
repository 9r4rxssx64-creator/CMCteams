/**
 * Apex Chat Service Worker — v1.0.0
 *
 * 3 caches strategy (cloned from apex-ai/sw.js):
 *   - apex-chat-v1.0.0-static   : assets statiques (cache-first, long TTL)
 *   - apex-chat-v1.0.0-runtime  : ressources dynamiques (stale-while-revalidate)
 *   - apex-chat-v1.0.0-offline  : fallback offline (HTML inline)
 *
 * Sentinelle GitHub Action `sw-cache-sync.yml` rattrape automatiquement
 * le drift entre APP_VER (index.html) et CACHE_VERSION (ce fichier).
 */
const CACHE_VERSION = 'apex-chat-v1.0.5';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const OFFLINE_CACHE = `${CACHE_VERSION}-offline`;

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './cgu.html',
  './privacy.html',
  './force-update.html'
];

// API hosts — toujours network-first (jamais cachés en lecture)
const API_HOSTS = [
  'api.anthropic.com',
  'openrouter.ai',
  'generativelanguage.googleapis.com',
  'api.groq.com',
  'firebasedatabase.app',
  'workers.dev',
  'imagedelivery.net',
  'r2.cloudflarestorage.com',
  'api.openai.com',
  'api.emailjs.com'
];

const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Apex Chat — Hors ligne</title>
<style>
  body{margin:0;background:#08080f;color:#c9a227;font-family:system-ui,-apple-system,sans-serif;
       display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px}
  h1{font-size:3em;margin:0;letter-spacing:4px}
  .icon{font-size:4em;margin-bottom:20px}
  p{color:#a8a8b8;max-width:400px;line-height:1.6}
  button{background:#c9a227;color:#08080f;border:none;padding:14px 28px;border-radius:14px;
         font-weight:700;font-size:16px;margin-top:20px;cursor:pointer;min-height:48px}
  .small{font-size:0.85em;color:#666;margin-top:30px}
</style></head><body>
<div class="icon">📡</div>
<h1>HORS LIGNE</h1>
<p>Pas de connexion internet. Tes messages seront envoyés dès que la connexion revient.</p>
<button onclick="location.reload()">Réessayer</button>
<p class="small">Apex Chat — Ultra-sécurisé</p>
<script>
  // Auto-retry quand on revient online
  window.addEventListener('online', () => location.reload());
  setInterval(() => { if (navigator.onLine) location.reload(); }, 5000);
</script>
</body></html>`;

// ===== INSTALL — pré-cache des assets statiques =====
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const staticCache = await caches.open(STATIC_CACHE);
    await staticCache.addAll(STATIC_ASSETS).catch(e => console.warn('[SW] precache partial', e));
    const offlineCache = await caches.open(OFFLINE_CACHE);
    await offlineCache.put('/offline', new Response(OFFLINE_HTML, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    }));
    self.skipWaiting();
  })());
});

// ===== ACTIVATE — purge anciens caches (AGRESSIF) =====
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    // Purger TOUS les caches qui ne matchent pas la version exacte (même prefixés apex-chat)
    await Promise.all(keys.map(k => {
      if (!k.startsWith(CACHE_VERSION)) {
        console.log('[SW] Purge ancien cache:', k);
        return caches.delete(k);
      }
    }));
    // Force claim immédiat (page courante utilise le nouveau SW sans reload)
    await self.clients.claim();
    // Notifier les clients que le SW est mis à jour
    const clientList = await self.clients.matchAll({ type: 'window' });
    for (const client of clientList) {
      client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
    }
  })());
});

// ===== FETCH — stratégie 3 caches =====
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API : toujours network-first, jamais cache
  if (API_HOSTS.some(host => url.hostname.includes(host))) {
    event.respondWith(fetch(event.request).catch(() => new Response(
      JSON.stringify({ error: 'offline', message: 'Pas de connexion' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )));
    return;
  }

  // Navigation HTML : network-first avec fallback cache puis offline
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(event.request);
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(event.request, fresh.clone());
        return fresh;
      } catch (e) {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        const offlineCache = await caches.open(OFFLINE_CACHE);
        return offlineCache.match('/offline');
      }
    })());
    return;
  }

  // Assets statiques : cache-first
  if (STATIC_ASSETS.some(a => url.pathname.endsWith(a.replace('./', '')))) {
    event.respondWith((async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      try {
        const fresh = await fetch(event.request);
        const cache = await caches.open(STATIC_CACHE);
        cache.put(event.request, fresh.clone());
        return fresh;
      } catch (e) {
        return new Response('', { status: 504 });
      }
    })());
    return;
  }

  // Reste : stale-while-revalidate
  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(event.request);
    const fresh = fetch(event.request).then(resp => {
      if (resp.ok) cache.put(event.request, resp.clone());
      return resp;
    }).catch(() => null);
    return cached || (await fresh) || new Response('', { status: 504 });
  })());
});

// ===== PUSH — notifications hors-app =====
self.addEventListener('push', (event) => {
  let data = { title: 'Apex Chat', body: 'Nouveau message', icon: './icons/icon-192.svg' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) {}

  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon || './manifest.json',
    badge: data.badge || './manifest.json',
    tag: data.tag || 'apex-chat',
    renotify: !!data.renotify,
    requireInteraction: !!data.urgent,
    data: data.payload || {},
    actions: data.actions || [
      { action: 'open', title: 'Ouvrir' },
      { action: 'dismiss', title: 'Plus tard' }
    ],
    vibrate: [100, 50, 100]
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || './';
  event.waitUntil((async () => {
    const clientsArr = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientsArr) {
      if (client.url.includes('/messaging-app/')) {
        client.focus();
        if (event.notification.data?.convId) {
          client.postMessage({ type: 'open-conv', convId: event.notification.data.convId });
        }
        return;
      }
    }
    return self.clients.openWindow(targetUrl);
  })());
});

// ===== MESSAGE — communication avec l'app =====
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: CACHE_VERSION });
  }
});
