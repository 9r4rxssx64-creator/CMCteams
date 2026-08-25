/**
 * kdmc-rag — mémoire intelligente (RAG) d'Apex : embeddings Workers AI + Vectorize.
 * Modèle : services/kdmc-live (SANS Durable Object — leçons #132/#133, plan FREE OK).
 *
 * Les embeddings tournent DANS le worker (@cf/baai/bge-m3, multilingue → FR) → AUCUNE
 * clé externe. Les vecteurs sont stockés dans Vectorize (compte Cloudflare de Kevin).
 *
 *   OPTIONS         → préflight CORS
 *   GET  /health    → {ok, hasVec, hasAI, model, dims, ts}
 *   POST /upsert    → {items:[{id,text,meta?}]} → embed + stocke → {upserted, debug}
 *   POST /query     → {text, topK?} → embed + recherche → {matches:[{id,score,text,meta}], debug}
 *   POST /forget    → {ids:[...]} → supprime → {deleted}
 *
 * SÉCURITÉ (règles CLAUDE.md) :
 * - AUTH obligatoire (mémoire perso) : header x-apex-pin = SHA-256 du PIN admin, comparé
 *   à env.APEX_ADMIN_PIN_SHA256. Tolère header==secret OU sha256(header)==secret (leçon #95).
 * - Anti open-proxy : CORS whitelist Origins (kd-mc.com / *.kd-mc.com / github.io / localhost).
 * - FAIL-OPEN CÔTÉ CLIENT : si le worker/Vectorize manque, le client Apex renvoie vide →
 *   Apex fonctionne comme aujourd'hui (0 régression). Le worker, lui, renvoie une erreur
 *   JSON claire (jamais un secret). Toujours un OBJET {…, debug} (leçon #133).
 *
 * URL prod : https://kdmc-rag.9r4rxssx64.workers.dev  (sous-domaine du COMPTE — leçon #85)
 */

const EMBED_MODEL = "@cf/baai/bge-m3"; // multilingue (FR), 1024 dims
const EMBED_DIMS = 1024;

const ORIGIN_OK = [
  /^https?:\/\/kd-mc\.com$/i,
  /^https?:\/\/[a-z0-9-]+\.kd-mc\.com$/i,
  /^https?:\/\/9r4rxssx64-creator\.github\.io$/i,
  /^https?:\/\/localhost(:\d+)?$/i,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/i,
];

function cors(origin) {
  const allow = origin && ORIGIN_OK.some((re) => re.test(origin)) ? origin : "null";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, x-apex-pin",
    "Access-Control-Max-Age": "86400",
  };
}

function json(obj, status, origin) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8", ...cors(origin) },
  });
}

async function sha256Hex(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* Auth : header x-apex-pin doit valoir le SHA du PIN admin, OU son SHA (double-hash toléré). */
async function authOk(req, env) {
  const secret = env.APEX_ADMIN_PIN_SHA256 || "";
  if (!secret) return false; // pas de secret configuré → refuse (fail-closed côté auth)
  const h = req.headers.get("x-apex-pin") || "";
  if (!h) return false;
  if (h === secret) return true;
  try { return (await sha256Hex(h)) === secret; } catch { return false; }
}

async function embed(env, texts) {
  const r = await env.AI.run(EMBED_MODEL, { text: texts });
  // { shape:[n,dims], data:[[...],...] }
  return (r && r.data) || [];
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    try {
      const url = new URL(request.url);
      const path = url.pathname.replace(/\/+$/, "") || "/";

      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });

      if (path === "/health" || path === "/") {
        return json({ ok: true, hasVec: !!env.VEC, hasAI: !!env.AI, model: EMBED_MODEL, dims: EMBED_DIMS, mode: "no-do", ts: Date.now() }, 200, origin);
      }

      // toutes les routes de données exigent l'auth
      if (!(await authOk(request, env))) {
        return json({ ok: false, error: "unauthorized", debug: { hint: "x-apex-pin manquant/incorrect" } }, 401, origin);
      }
      if (!env.AI || !env.VEC) {
        return json({ ok: false, error: "bindings_missing", debug: { hasAI: !!env.AI, hasVec: !!env.VEC } }, 503, origin);
      }

      if (path === "/upsert" && request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        const items = Array.isArray(body.items) ? body.items.slice(0, 100) : [];
        const clean = items.filter((it) => it && typeof it.text === "string" && it.text.trim());
        if (!clean.length) return json({ ok: true, upserted: 0, debug: { note: "aucun item valide" } }, 200, origin);
        const vecs = await embed(env, clean.map((it) => String(it.text).slice(0, 4000)));
        const rows = clean.map((it, i) => ({
          id: String(it.id || crypto.randomUUID()),
          values: vecs[i],
          metadata: { text: String(it.text).slice(0, 4000), ...(it.meta && typeof it.meta === "object" ? it.meta : {}) },
        })).filter((r) => Array.isArray(r.values) && r.values.length === EMBED_DIMS);
        if (!rows.length) return json({ ok: false, error: "embed_failed", debug: { got: vecs.length } }, 502, origin);
        await env.VEC.upsert(rows);
        return json({ ok: true, upserted: rows.length, debug: {} }, 200, origin);
      }

      if (path === "/query" && request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        const text = typeof body.text === "string" ? body.text.trim() : "";
        const topK = Math.max(1, Math.min(20, Number(body.topK) || 5));
        if (!text) return json({ ok: true, matches: [], debug: { note: "text vide" } }, 200, origin);
        const vecs = await embed(env, [text.slice(0, 4000)]);
        if (!vecs[0]) return json({ ok: false, error: "embed_failed", matches: [], debug: {} }, 502, origin);
        const res = await env.VEC.query(vecs[0], { topK, returnMetadata: true });
        const matches = ((res && res.matches) || []).map((m) => ({
          id: m.id, score: m.score,
          text: (m.metadata && m.metadata.text) || "",
          meta: m.metadata || {},
        }));
        return json({ ok: true, matches, debug: { count: matches.length } }, 200, origin);
      }

      if (path === "/forget" && request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        const ids = Array.isArray(body.ids) ? body.ids.map(String).slice(0, 100) : [];
        if (!ids.length) return json({ ok: true, deleted: 0 }, 200, origin);
        await env.VEC.deleteByIds(ids);
        return json({ ok: true, deleted: ids.length }, 200, origin);
      }

      return json({ ok: false, error: "not_found", debug: { path } }, 404, origin);
    } catch (e) {
      // fail-open JSON (jamais un secret) — leçon #133
      return json({ ok: false, error: "worker_error", debug: { message: String((e && e.message) || e).slice(0, 200) } }, 200, origin);
    }
  },
};
