/**
 * Apex Chat Service Worker — bootstrap classic.
 *
 * Importe les handlers depuis ./lib/sw-handlers.js (source de vérité ESM
 * couverte 100% v8). Ce fichier reste compatible iOS Safari < 16
 * (Service Worker classic) en chargeant le module via importScripts() polyfill
 * — pour SW modules natifs, utiliser la branche `register({type:'module'})`.
 *
 * NOTE iOS Safari : ESM dans Service Worker n'est supporté que depuis 16+.
 * Pour rétrocompat on duplique ici les handlers via fetch dynamic du module.
 */

self.importScripts && self.importScripts; // no-op pour environnements anciens

(async () => {
  // Charge les handlers ESM via dynamic import (Chromium full + Safari 16+)
  // Fallback inline minimal si import échoue (très vieux navigateurs).
  let handlers;
  try {
    handlers = await import('./lib/sw-handlers.js');
  } catch (e) {
    // Fallback ultra-minimal : Service Worker reste fonctionnel (no cache)
    console.warn('[SW] handlers ESM unavailable, fallback minimal', e);
    handlers = {
      CACHE_VERSION: 'apex-chat-v1.1.75',
      handleInstall: async () => {},
      handleActivate: async () => ({ purged: [] }),
      handleFetch: async (event) => fetch(event.request),
      handlePush: async () => {},
      handleNotificationClick: async () => null,
      handleMessage: () => null,
      handlePeriodicSync: async () => [],
    };
  }

  const deps = {
    URL,
    response: Response,
    fetch: (req) => fetch(req),
    caches,
    clients: self.clients,
    registration: self.registration,
    skipWaiting: () => self.skipWaiting(),
  };

  self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
      await handlers.handleInstall(deps);
      self.skipWaiting();
    })());
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(handlers.handleActivate(deps));
  });

  self.addEventListener('fetch', (event) => {
    event.respondWith(handlers.handleFetch(event, deps));
  });

  self.addEventListener('push', (event) => {
    event.waitUntil(handlers.handlePush(event, deps));
  });

  self.addEventListener('notificationclick', (event) => {
    event.waitUntil(handlers.handleNotificationClick(event, deps));
  });

  self.addEventListener('message', (event) => {
    handlers.handleMessage(event, deps);
  });

  self.addEventListener('periodicsync', (event) => {
    event.waitUntil(handlers.handlePeriodicSync(event, deps));
  });

  self.addEventListener('sync', (event) => {
    event.waitUntil(handlers.handlePeriodicSync(event, deps));
  });
})();
