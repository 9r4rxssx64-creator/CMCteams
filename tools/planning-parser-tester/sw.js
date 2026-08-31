/**
 * Service Worker minimal — network-first pour tools/planning-parser-tester/
 *
 * Objectif : empêcher Safari iOS PWA de servir des versions cached du JS et
 * de l'HTML, sans pour autant casser le mode offline (fallback cache).
 *
 * NB : pas de pré-cache statique. On garde uniquement le dernier fetch en
 * cache opportuniste comme fallback réseau. Les requêtes vers /v1/* du proxy
 * Cloudflare et les APIs externes ne sont JAMAIS interceptées.
 */

const APP_SCOPE = "/CMCteams/tools/planning-parser-tester/";
const CACHE_NAME = "ppt-fallback-v1";

self.addEventListener("install", (event) => {
  // skipWaiting → la nouvelle version prend le pas immédiatement, sans
  // attendre que l'utilisateur ferme tous les onglets.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Purge les anciens caches versionnés
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      // Prend le contrôle de toutes les pages ouvertes immédiatement
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // N'intercepte QUE les requêtes vers l'app (pas les proxies / APIs)
  if (!url.pathname.startsWith(APP_SCOPE)) return;
  if (event.request.method !== "GET") return;

  // Network-first : toujours essayer le réseau d'abord.
  // Fallback cache uniquement si offline.
  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(event.request, { cache: "no-store" });
        // Mémorise la version fraîche pour usage offline
        if (fresh && fresh.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, fresh.clone()).catch(() => {});
        }
        return fresh;
      } catch (e) {
        // Offline → fallback cache
        const cached = await caches.match(event.request);
        if (cached) return cached;
        throw e;
      }
    })()
  );
});
