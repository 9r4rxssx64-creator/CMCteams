/**
 * cmc-parser-proxy — Cloudflare Worker
 *
 * Proxy sécurisé qui relay les requêtes du frontend `planning-parser-tester`
 * vers les APIs Vision IA (Anthropic / OpenAI / Mistral / Gemini), en injectant
 * les clés API stockées comme secrets Cloudflare (eux-mêmes alimentés par les
 * secrets GitHub via le workflow `.github/workflows/cmc-parser-proxy-deploy.yml`).
 *
 * RÈGLE SÉCURITÉ : les clés API ne quittent JAMAIS le Worker. Le frontend n'a
 * jamais connaissance des clés — il appelle `/v1/<provider>` avec un token
 * d'auth (PUSH_ADMIN_TOKEN, déjà existant côté repo).
 *
 * Endpoints :
 *   POST /v1/anthropic   → forward vers https://api.anthropic.com/v1/messages
 *   POST /v1/openai      → forward vers https://api.openai.com/v1/chat/completions
 *   POST /v1/mistral     → forward vers https://api.mistral.ai/v1/ocr
 *   POST /v1/gemini      → forward vers Google AI Studio (Generative Language API)
 *   GET  /healthz        → status (ne révèle pas si les clés sont set)
 *   GET  /providers      → liste providers configurés (auth requise)
 *
 * Auth : header `X-Auth-Token` ou `Authorization: Bearer ...` = PUSH_ADMIN_TOKEN.
 * CORS : autorise localhost + GitHub Pages.
 */

export interface Env {
  ANTHROPIC_API_KEY?: string;
  OPEN_AI_API_KEY?: string; // ⚠️ underscore (convention Kevin, CLAUDE.md règle 7)
  MISTRAL_API_KEY?: string;
  GEMINI_API_KEY?: string;
  PUSH_ADMIN_TOKEN?: string; // token partagé pour auth frontend → worker
}

const ALLOWED_ORIGINS = [
  "http://localhost",
  "http://127.0.0.1",
  "https://9r4rxssx64-creator.github.io",
  "https://kdmc.cloud",
];

function corsHeaders(origin: string | null): HeadersInit {
  const allow =
    origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o)) ? origin : "null";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function jsonErr(status: number, message: string, detail?: unknown, origin?: string | null) {
  return new Response(JSON.stringify({ error: true, status, message, detail }), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders(origin ?? null) },
  });
}

function checkAuth(req: Request, env: Env): { ok: boolean; reason?: string } {
  const expected = env.PUSH_ADMIN_TOKEN;
  if (!expected) return { ok: false, reason: "PUSH_ADMIN_TOKEN non configuré côté Worker" };
  const headerToken =
    req.headers.get("X-Auth-Token") ||
    (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!headerToken) return { ok: false, reason: "Header X-Auth-Token manquant" };
  if (headerToken !== expected) return { ok: false, reason: "Token invalide" };
  return { ok: true };
}

/* ====================================================================
 * Provider forwarders
 * ==================================================================== */

async function forwardAnthropic(body: ArrayBuffer, env: Env): Promise<Response> {
  if (!env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: true, message: "ANTHROPIC_API_KEY absent du Worker" }),
      { status: 503, headers: { "content-type": "application/json" } }
    );
  }
  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body,
  });
  return upstream;
}

async function forwardOpenAI(body: ArrayBuffer, env: Env): Promise<Response> {
  if (!env.OPEN_AI_API_KEY) {
    return new Response(
      JSON.stringify({ error: true, message: "OPEN_AI_API_KEY absent du Worker" }),
      { status: 503, headers: { "content-type": "application/json" } }
    );
  }
  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPEN_AI_API_KEY}`,
      "content-type": "application/json",
    },
    body,
  });
  return upstream;
}

async function forwardMistral(body: ArrayBuffer, env: Env): Promise<Response> {
  if (!env.MISTRAL_API_KEY) {
    return new Response(
      JSON.stringify({ error: true, message: "MISTRAL_API_KEY absent du Worker" }),
      { status: 503, headers: { "content-type": "application/json" } }
    );
  }
  // Mistral OCR endpoint (peut évoluer — vérifier https://docs.mistral.ai/)
  const upstream = await fetch("https://api.mistral.ai/v1/ocr", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.MISTRAL_API_KEY}`,
      "content-type": "application/json",
    },
    body,
  });
  return upstream;
}

async function forwardGemini(body: ArrayBuffer, env: Env, url: URL): Promise<Response> {
  if (!env.GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({ error: true, message: "GEMINI_API_KEY absent du Worker" }),
      { status: 503, headers: { "content-type": "application/json" } }
    );
  }
  // Le frontend passe le modèle dans ?model=gemini-2.5-pro
  const model = url.searchParams.get("model") || "gemini-2.5-pro";
  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    }
  );
  return upstream;
}

/* ====================================================================
 * Router
 * ==================================================================== */

const PROVIDERS = ["anthropic", "openai", "mistral", "gemini"] as const;
type Provider = (typeof PROVIDERS)[number];

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = req.headers.get("Origin");
    const url = new URL(req.url);

    // CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Health check (pas d'auth — ne révèle aucun secret)
    if (url.pathname === "/healthz" && req.method === "GET") {
      return new Response(
        JSON.stringify({
          ok: true,
          service: "cmc-parser-proxy",
          providers_available: PROVIDERS.filter((p) => {
            switch (p) {
              case "anthropic": return !!env.ANTHROPIC_API_KEY;
              case "openai": return !!env.OPEN_AI_API_KEY;
              case "mistral": return !!env.MISTRAL_API_KEY;
              case "gemini": return !!env.GEMINI_API_KEY;
            }
          }),
          ts: Date.now(),
        }),
        { status: 200, headers: { "content-type": "application/json", ...corsHeaders(origin) } }
      );
    }

    // Auth pour le reste
    const auth = checkAuth(req, env);
    if (!auth.ok) return jsonErr(401, "Unauthorized", auth.reason, origin);

    // Liste des providers configurés (auth requise — donne plus d'info que /healthz)
    if (url.pathname === "/providers" && req.method === "GET") {
      return new Response(
        JSON.stringify({
          anthropic: { configured: !!env.ANTHROPIC_API_KEY },
          openai: { configured: !!env.OPEN_AI_API_KEY, key_name: "OPEN_AI_API_KEY" },
          mistral: { configured: !!env.MISTRAL_API_KEY },
          gemini: { configured: !!env.GEMINI_API_KEY },
        }),
        { status: 200, headers: { "content-type": "application/json", ...corsHeaders(origin) } }
      );
    }

    // Forward provider
    const match = url.pathname.match(/^\/v1\/(anthropic|openai|mistral|gemini)\/?$/);
    if (match && req.method === "POST") {
      const provider = match[1] as Provider;
      try {
        const body = await req.arrayBuffer();
        let upstream: Response;
        switch (provider) {
          case "anthropic": upstream = await forwardAnthropic(body, env); break;
          case "openai":    upstream = await forwardOpenAI(body, env); break;
          case "mistral":   upstream = await forwardMistral(body, env); break;
          case "gemini":    upstream = await forwardGemini(body, env, url); break;
        }
        // Re-attache les headers CORS sur la réponse upstream
        const out = new Response(upstream.body, {
          status: upstream.status,
          statusText: upstream.statusText,
          headers: upstream.headers,
        });
        const ch = corsHeaders(origin);
        for (const [k, v] of Object.entries(ch)) out.headers.set(k, v as string);
        return out;
      } catch (e: any) {
        return jsonErr(502, "Upstream fetch failed", e?.message || String(e), origin);
      }
    }

    return jsonErr(404, "Route inconnue", { pathname: url.pathname, method: req.method }, origin);
  },
};
