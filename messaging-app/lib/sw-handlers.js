/**
 * Apex Chat — Service Worker handlers (ESM, testable v8 coverage)
 *
 * Source de vérité unique des handlers SW. Le fichier `sw.js` à la racine
 * importe ce module via dynamic import (Service Workers modules supportés
 * sur Chrome/Edge ; iOS Safari fallback : sw.js inline les handlers — voir
 * `tools/sync-sw.mjs` pour régénérer si modification ici).
 *
 * Stratégie cache :
 *   - STATIC_CACHE   : pré-cache assets statiques (cache-first)
 *   - RUNTIME_CACHE  : navigation HTML + autres (stale-while-revalidate)
 *   - OFFLINE_CACHE  : fallback HTML hors-ligne
 */

export const CACHE_VERSION = 'apex-chat-v1.1.11';
export const STATIC_CACHE = `${CACHE_VERSION}-static`;
export const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
export const OFFLINE_CACHE = `${CACHE_VERSION}-offline`;

export const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './cgu.html',
  './privacy.html',
  './force-update.html',
];

// API hosts — toujours network-first (jamais cachés en lecture)
export const API_HOSTS = [
  'api.anthropic.com',
  'openrouter.ai',
  'generativelanguage.googleapis.com',
  'api.groq.com',
  'firebasedatabase.app',
  'workers.dev',
  'imagedelivery.net',
  'r2.cloudflarestorage.com',
  'api.openai.com',
  'api.emailjs.com',
];

export const OFFLINE_HTML = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Apex Chat — Hors ligne</title></head><body style="font:16px sans-serif;text-align:center;padding:40px"><h1>📡 HORS LIGNE</h1><p>Pas de connexion. Réessaie quand le réseau revient.</p><button onclick="location.reload()">Réessayer</button></body></html>`;

// ----------------------------------------------------------------------------
//  Install : pré-cache + cache offline HTML
// ----------------------------------------------------------------------------
export async function handleInstall({ caches, response }) {
  const staticCache = await caches.open(STATIC_CACHE);
  await staticCache.addAll(STATIC_ASSETS).catch(() => {});
  const offlineCache = await caches.open(OFFLINE_CACHE);
  await offlineCache.put(
    '/offline',
    new response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }),
  );
}

// ----------------------------------------------------------------------------
//  Activate : purge anciens caches qui ne matchent pas la version courante
// ----------------------------------------------------------------------------
export async function handleActivate({ caches, clients }) {
  const keys = await caches.keys();
  const purged = [];
  for (const k of keys) {
    if (!k.startsWith(CACHE_VERSION)) {
      await caches.delete(k);
      purged.push(k);
    }
  }
  await clients.claim();
  const list = await clients.matchAll({ type: 'window' });
  for (const c of list) c.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
  return { purged };
}

// ----------------------------------------------------------------------------
//  Fetch : route selon URL pathname/hostname
// ----------------------------------------------------------------------------
export function isApiHost(url) {
  return API_HOSTS.some((host) => url.hostname.includes(host));
}

export function isStaticAsset(url) {
  // Vérifie si url.pathname matche un asset statique connu.
  // Exclut explicitement './' (qui devient '' après replace et matcherait tout).
  const path = url.pathname;
  return STATIC_ASSETS.some((a) => {
    const stripped = a.replace('./', '');
    if (!stripped) return path === '/' || path.endsWith('/index.html');
    return path.endsWith('/' + stripped) || path === '/' + stripped;
  });
}

export async function handleFetchApi(request, { fetch, response }) {
  try {
    return await fetch(request);
  } catch {
    return new response(
      JSON.stringify({ error: 'offline', message: 'Pas de connexion' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

export async function handleFetchNavigation(request, { fetch, caches, response }) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offlineCache = await caches.open(OFFLINE_CACHE);
    return offlineCache.match('/offline');
  }
}

export async function handleFetchStatic(request, { fetch, caches, response }) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    return new response('', { status: 504 });
  }
}

export async function handleFetchSWR(request, { fetch, caches, response }) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const freshPromise = fetch(request)
    .then((resp) => {
      if (resp.ok) cache.put(request, resp.clone());
      return resp;
    })
    .catch(() => null);
  return cached || (await freshPromise) || new response('', { status: 504 });
}

export async function handleFetch(event, deps) {
  const url = new deps.URL(event.request.url);
  if (isApiHost(url)) return handleFetchApi(event.request, deps);
  if (event.request.mode === 'navigate') return handleFetchNavigation(event.request, deps);
  if (isStaticAsset(url)) return handleFetchStatic(event.request, deps);
  return handleFetchSWR(event.request, deps);
}

// ----------------------------------------------------------------------------
//  Push : affiche notification système
// ----------------------------------------------------------------------------
export async function handlePush(event, { registration }) {
  let data = { title: 'Apex Chat', body: 'Nouveau message', icon: './icons/icon-192.svg' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // Payload non-JSON ou absent → fallback default ci-dessus
  }

  return registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon || './manifest.json',
    badge: data.badge || './manifest.json',
    tag: data.tag || 'apex-chat',
    renotify: !!data.renotify,
    requireInteraction: !!data.urgent,
    data: data.payload || {},
    actions: data.actions || [
      { action: 'open', title: 'Ouvrir' },
      { action: 'dismiss', title: 'Plus tard' },
    ],
    vibrate: [100, 50, 100],
  });
}

// ----------------------------------------------------------------------------
//  Notification click : focus tab existante ou ouvrir
// ----------------------------------------------------------------------------
export async function handleNotificationClick(event, { clients }) {
  event.notification.close();
  if (event.action === 'dismiss') return null;

  const targetUrl = event.notification.data?.url || './';
  const list = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of list) {
    if (client.url.includes('/messaging-app/')) {
      client.focus();
      if (event.notification.data?.convId) {
        client.postMessage({ type: 'open-conv', convId: event.notification.data.convId });
      }
      return client;
    }
  }
  return clients.openWindow(targetUrl);
}

// ----------------------------------------------------------------------------
//  Message (depuis l'app) : SKIP_WAITING ou GET_VERSION
// ----------------------------------------------------------------------------
export function handleMessage(event, { skipWaiting }) {
  if (event.data?.type === 'SKIP_WAITING') {
    skipWaiting();
    return { type: 'skip-waiting' };
  }
  if (event.data?.type === 'GET_VERSION') {
    event.ports?.[0]?.postMessage({ version: CACHE_VERSION });
    return { type: 'version', version: CACHE_VERSION };
  }
  return null;
}

// ----------------------------------------------------------------------------
//  Periodic sync / Background sync : ping clients
// ----------------------------------------------------------------------------
export async function handlePeriodicSync(event, { clients }) {
  if (event.tag !== 'apex-chat-heartbeat') return [];
  const list = await clients.matchAll({ type: 'window' });
  for (const c of list) c.postMessage({ type: 'PERIODIC_HEARTBEAT' });
  return list;
}
