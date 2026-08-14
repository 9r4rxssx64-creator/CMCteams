/* ClayScore — Service Worker (coque hors ligne). */
const CACHE = "clayscore-v0.10.0";   /* suit la version serveur (/api/version) */
const SHELL = ["/", "/index.html", "/app.js", "/manifest.webmanifest", "/favicon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) =>
    Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  // Données live et ralentis : toujours réseau direct (jamais servis du cache).
  if (u.pathname.startsWith("/api") || u.pathname.startsWith("/ws") ||
      u.pathname.startsWith("/clips")) return;
  // Coque de l'app : cache d'abord, réseau ensuite (fonctionne hors ligne).
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((resp) => {
    if (e.request.method === "GET" && resp.ok) {
      const cp = resp.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp));
    }
    return resp;
  }).catch(() => caches.match("/"))));
});
