/**
 * wm-quotes — mini worker Cloudflare pour le panneau Bourse de World Monitor.
 *
 * SÉCURITÉ / ISOLATION (règles CLAUDE.md) :
 * - La clé FINNHUB_API_KEY reste UNIQUEMENT côté worker (secret wrangler),
 *   jamais dans la page publique.
 * - Lecture seule, liste de symboles FIGÉE (aucune entrée utilisateur → pas d'abus).
 * - Cache edge 60s → max ~6 appels Finnhub/min (quota gratuit 60/min largement OK).
 * - Worker DÉDIÉ (isolation max) : ne touche à aucun autre worker/secret Apex.
 *
 * URL prod : https://wm-quotes.9r4rxssx64.workers.dev  (sous-domaine du COMPTE — leçon #85)
 */

const SYMS = [
  ["S&P 500 (SPY)", "SPY"],
  ["Nasdaq (QQQ)", "QQQ"],
  ["Apple", "AAPL"],
  ["Nvidia", "NVDA"],
  ["Tesla", "TSLA"],
  ["France (EWQ)", "EWQ"],
];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

function json(obj, extra, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign({ "content-type": "application/json" }, CORS, extra || {}),
  });
}

export default {
  async fetch(req, env, ctx) {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    const url = new URL(req.url);

    if (url.pathname === "/health") {
      return json({ ok: true, hasKey: !!env.FINNHUB_API_KEY, service: "wm-quotes" });
    }
    if (url.pathname !== "/quotes") return json({ error: "not_found" }, null, 404);
    if (!env.FINNHUB_API_KEY) {
      // Erreur DÉTAILLÉE (règle « cause exacte ») — jamais un échec muet.
      return json({ error: "no_key", detail: "Secret FINNHUB_API_KEY manquant sur le worker wm-quotes" }, null, 503);
    }

    // Cache edge 60s : tout le monde partage la même réponse.
    const cacheKey = new Request(url.origin + "/quotes-v1");
    const cache = caches.default;
    const hit = await cache.match(cacheKey);
    if (hit) {
      const r = new Response(hit.body, hit);
      Object.entries(CORS).forEach(([k, v]) => r.headers.set(k, v));
      return r;
    }

    const results = await Promise.all(
      SYMS.map(async ([label, sym]) => {
        try {
          const r = await fetch(
            "https://finnhub.io/api/v1/quote?symbol=" + sym + "&token=" + env.FINNHUB_API_KEY,
            { cf: { cacheTtl: 55 } }
          );
          const q = await r.json();
          if (q && typeof q.c === "number" && q.c > 0) {
            return { label, sym, price: q.c, changePct: typeof q.dp === "number" ? q.dp : null };
          }
          return null;
        } catch (e) {
          return null;
        }
      })
    );

    const quotes = results.filter(Boolean);
    const resp = json({ quotes, ts: Date.now() }, { "Cache-Control": "public, max-age=60" });
    ctx.waitUntil(cache.put(cacheKey, resp.clone()));
    return resp;
  },
};
