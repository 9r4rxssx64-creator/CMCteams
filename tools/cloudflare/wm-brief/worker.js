/**
 * wm-brief — synthèse IA de l'actualité pour le panneau "Synthèse actu" de World Monitor.
 *
 * SÉCURITÉ / ISOLATION / COÛT (règles CLAUDE.md) :
 * - La clé ANTHROPIC_API_KEY reste UNIQUEMENT côté worker (secret wrangler), jamais dans la page.
 * - AUCUNE entrée utilisateur : le worker récupère lui-même les titres (GDELT + Hacker News)
 *   côté serveur → pas d'injection de prompt, pas d'abus possible.
 * - Cache edge 15 min sur une clé FIXE (indépendante de la query) → au plus ~1 appel Claude
 *   par 15 min et par colo, quel que soit le trafic ou une tentative de cache-busting.
 * - Worker DÉDIÉ (isolation max) : ne touche à aucun autre worker/secret.
 *
 * URL prod : https://wm-brief.9r4rxssx64.workers.dev  (sous-domaine du COMPTE — leçon #85)
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};
const MODEL = "claude-haiku-4-5-20251001"; // Haiku 4.5 (CLAUDE.md)
const TTL = 900; // 15 min

function json(obj, extra, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign({ "content-type": "application/json" }, CORS, extra || {}),
  });
}

export default {
  async fetch(req, env, ctx) {
    // Toute exception → JSON avec cause EXACTE (règle « détailler les erreurs partout »).
    try { return await handle(req, env, ctx); }
    catch (e) { return json({ error: "exception", detail: String((e && e.message) || e) }, null, 500); }
  },
};

async function fetchTitles() {
  const titles = [];
  // GDELT — actualité monde
  try {
    const r = await fetch("https://api.gdeltproject.org/api/v2/doc/doc?query=" +
      encodeURIComponent("(world OR breaking)") + "&mode=artlist&maxrecords=18&sort=datedesc&format=json");
    const d = await r.json();
    (d.articles || []).forEach(a => { if (a.title) titles.push(a.title); });
  } catch (e) { /* best-effort */ }
  // Hacker News — tech
  try {
    const ids = await (await fetch("https://hacker-news.firebaseio.com/v0/topstories.json")).json();
    const top = await Promise.all((ids || []).slice(0, 8).map(id =>
      fetch("https://hacker-news.firebaseio.com/v0/item/" + id + ".json").then(r => r.json()).catch(() => null)));
    top.filter(Boolean).forEach(s => { if (s.title) titles.push(s.title); });
  } catch (e) { /* best-effort */ }
  return titles;
}

async function handle(req, env, ctx) {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  const url = new URL(req.url);

  if (url.pathname === "/health") {
    return json({ ok: true, hasKey: !!env.ANTHROPIC_API_KEY, service: "wm-brief", model: MODEL });
  }
  if (url.pathname !== "/brief") return json({ error: "not_found" }, null, 404);
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "no_key", detail: "Secret ANTHROPIC_API_KEY manquant sur le worker wm-brief" }, null, 503);
  }

  // Cache edge 15 min, clé FIXE (ignore la query → borne le coût même en cache-busting).
  const cacheKey = new Request(url.origin + "/brief-v1");
  let cache = null;
  try {
    cache = caches.default;
    const hit = await cache.match(cacheKey);
    if (hit) {
      const r = new Response(hit.body, hit);
      Object.entries(CORS).forEach(([k, v]) => r.headers.set(k, v));
      return r;
    }
  } catch (e) { cache = null; }

  const titles = await fetchTitles();
  if (!titles.length) return json({ error: "no_sources", detail: "Aucun titre récupéré (GDELT + HN indisponibles)" }, null, 502);

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 320,
      system: "Tu es un analyste d'actualité. À partir des titres fournis (actualité mondiale + tech), rédige une synthèse en français : 3 à 4 puces courtes des thèmes dominants du moment. Factuel, neutre, aucune spéculation. Commence chaque puce par '• '. Pas d'introduction ni de conclusion.",
      messages: [{ role: "user", content: "Titres du moment :\n" + titles.slice(0, 26).join("\n") }],
    }),
  });
  const body = await r.text();
  let data = null;
  try { data = JSON.parse(body); } catch (pe) {
    return json({ error: "anthropic_parse", detail: "HTTP " + r.status + " " + body.slice(0, 160) }, null, 502);
  }
  if (!r.ok || !data.content || !data.content[0] || !data.content[0].text) {
    const det = (data && data.error && data.error.message) || body.slice(0, 160);
    return json({ error: "anthropic", detail: "HTTP " + r.status + " " + det }, null, 502);
  }

  const payload = { brief: data.content[0].text.trim(), sources: titles.length, ts: Date.now() };
  const resp = json(payload, { "Cache-Control": "public, max-age=" + TTL });
  if (cache) { try { ctx.waitUntil(cache.put(cacheKey, resp.clone())); } catch (e) {} }
  return resp;
}
