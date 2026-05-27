/**
 * cmc-parser-proxy — Cloudflare Worker
 *
 * Last redeploy trigger : 2026-05-27T21:30Z — force re-push des secrets
 *   (Kevin a rechargé Gemini + vérifié clé Anthropic). Le workflow
 *   cmc-parser-proxy-deploy.yml détecte ce changement, pousse les secrets
 *   GitHub actuels (ANTHROPIC_API_KEY, OPEN_AI_API_KEY, MISTRAL_API_KEY,
 *   GEMINI_API_KEY, PUSH_ADMIN_TOKEN) vers le worker et redéploie.
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

function isTrustedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some((o) => origin.startsWith(o));
}

function corsHeaders(origin: string | null): HeadersInit {
  const allow = isTrustedOrigin(origin) ? (origin as string) : "null";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

/**
 * Réponse d'erreur structurée. Garantit :
 *   - error: true (drapeau)
 *   - status: code HTTP
 *   - code: identifiant machine (ex "auth_missing", "upstream_5xx", "secret_missing")
 *   - message: phrase courte user-friendly (FR, sans jargon)
 *   - detail: cause technique EXACTE (jamais perdu — règle CLAUDE.md)
 *   - step: étape métier qui a échoué
 *   - hint?: action concrète pour corriger
 *   - where?: emplacement source si exception JS
 *   - ts: timestamp
 */
function jsonErr(
  status: number,
  code: string,
  message: string,
  detail: unknown,
  step: string,
  origin?: string | null,
  extra?: Record<string, unknown>
): Response {
  const body = {
    error: true,
    status,
    code,
    message,
    detail: detail === undefined ? null : detail,
    step,
    ts: new Date().toISOString(),
    ...(extra || {}),
  };
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders(origin ?? null) },
  });
}

function describeException(e: unknown): { message: string; stack?: string; name?: string } {
  if (!e) return { message: "(exception vide)" };
  if (typeof e === "string") return { message: e };
  if (e && typeof e === "object") {
    const obj = e as { message?: unknown; stack?: unknown; name?: unknown };
    return {
      message: typeof obj.message === "string" ? obj.message : JSON.stringify(e),
      stack: typeof obj.stack === "string" ? (obj.stack.split("\n").slice(0, 4).join(" | ")) : undefined,
      name: typeof obj.name === "string" ? obj.name : undefined,
    };
  }
  return { message: String(e) };
}

/**
 * Auth en 2 modes (priorité 100% auto pour Kevin) :
 *
 *   Mode A — Origin trustée (zéro clic Kevin) :
 *     Si la requête vient d'une origine de notre allowlist
 *     (github.io / kdmc.cloud / localhost), on autorise SANS X-Auth-Token.
 *     Cela permet à l'app frontend servie depuis GitHub Pages de fonctionner
 *     out-of-the-box, sans que Kevin ait à coller le moindre token.
 *     CORS-bypass impossible depuis un navigateur tiers (browser bloque
 *     l'envoi de l'Origin spoofé).
 *
 *   Mode B — Token X-Auth-Token (pour curl / Postman / tests serveur) :
 *     Si la requête n'a pas d'origin trustée, on exige le PUSH_ADMIN_TOKEN.
 */
function checkAuth(req: Request, env: Env): { ok: boolean; reason?: string; mode?: "origin" | "token" } {
  const origin = req.headers.get("Origin");
  if (isTrustedOrigin(origin)) return { ok: true, mode: "origin" };

  const expected = env.PUSH_ADMIN_TOKEN;
  if (!expected) {
    return { ok: false, reason: "Origin non trustée ET PUSH_ADMIN_TOKEN absent côté Worker.", mode: "token" };
  }
  const headerToken =
    req.headers.get("X-Auth-Token") ||
    (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!headerToken) {
    return { ok: false, reason: `Origin "${origin || "(absente)"}" non trustée et header X-Auth-Token manquant.`, mode: "token" };
  }
  if (headerToken !== expected) return { ok: false, reason: "Token X-Auth-Token invalide.", mode: "token" };
  return { ok: true, mode: "token" };
}

/* ====================================================================
 * Provider forwarders
 * ==================================================================== */

// Limites strictes pour protéger le quota API Kevin (bug #16 + #17).
const MAX_BODY_BYTES = 32 * 1024 * 1024;  // 32 MB = limite Anthropic doc + Mistral
const UPSTREAM_TIMEOUT_MS = 75_000;        // 75s, > timeout frontend (45s) + marge

// Rate-limit in-memory pour /test/* (bug #18). Cloudflare Workers ne persiste
// pas l'état entre invocations → ce limit est best-effort par instance worker
// (mais avec cold start fréquent, ça limite déjà bien l'abus). Pour vraie
// protection production : Cloudflare KV ou Durable Object.
const testRateLimit: Map<string, number[]> = new Map();
const TEST_RATE_LIMIT_PER_MIN = 6;

function checkTestRateLimit(ip: string): { ok: boolean; remaining: number } {
  const now = Date.now();
  const minute = 60_000;
  const arr = testRateLimit.get(ip) || [];
  const recent = arr.filter((t) => now - t < minute);
  if (recent.length >= TEST_RATE_LIMIT_PER_MIN) {
    return { ok: false, remaining: 0 };
  }
  recent.push(now);
  testRateLimit.set(ip, recent);
  // GC : si la map dépasse 1000 IPs, vide les plus anciennes
  if (testRateLimit.size > 1000) {
    const oldest = Array.from(testRateLimit.entries()).sort((a, b) => Math.max(...a[1]) - Math.max(...b[1])).slice(0, 500);
    for (const [k] of oldest) testRateLimit.delete(k);
  }
  return { ok: true, remaining: TEST_RATE_LIMIT_PER_MIN - recent.length };
}

/**
 * Wrap commun pour tous les forwarders : vérifie secret + appelle upstream +
 * gère les erreurs réseau et upstream avec retour structuré clair.
 */
async function forwardProvider(
  providerName: "anthropic" | "openai" | "mistral" | "gemini",
  body: ArrayBuffer,
  env: Env,
  url: URL,
  origin: string | null
): Promise<Response> {
  // Bug #16 fix : limite stricte de body (protège quota API).
  if (body.byteLength > MAX_BODY_BYTES) {
    return jsonErr(
      413,
      "payload_too_large",
      `Corps de requête trop volumineux (${(body.byteLength / 1024 / 1024).toFixed(1)} MB).`,
      `Limite ${MAX_BODY_BYTES} octets = ${MAX_BODY_BYTES / 1024 / 1024} MB. Anthropic + Mistral acceptent au plus 32 MB.`,
      `forwardProvider:${providerName}:size_check`,
      origin,
      { provider: providerName, body_size_bytes: body.byteLength, max_bytes: MAX_BODY_BYTES, hint: "Compresser le PDF avant envoi, ou rasteriser à résolution moindre." }
    );
  }
  // 1) Vérification secret
  const secretMap = {
    anthropic: env.ANTHROPIC_API_KEY,
    openai: env.OPEN_AI_API_KEY,
    mistral: env.MISTRAL_API_KEY,
    gemini: env.GEMINI_API_KEY,
  };
  const secretNameMap = {
    anthropic: "ANTHROPIC_API_KEY",
    openai: "OPEN_AI_API_KEY (avec underscore — convention Kevin)",
    mistral: "MISTRAL_API_KEY",
    gemini: "GEMINI_API_KEY",
  };
  const apiKey = secretMap[providerName];
  if (!apiKey) {
    return jsonErr(
      503,
      "secret_missing",
      `Le provider ${providerName} n'est pas configuré sur le Worker.`,
      `Secret Worker manquant : ${secretNameMap[providerName]}. Re-déclencher le workflow cmc-parser-proxy-deploy.yml après avoir confirmé que le secret GitHub correspondant est présent.`,
      `forwardProvider:${providerName}:secret_check`,
      origin,
      { provider: providerName, secret_name: secretNameMap[providerName] }
    );
  }

  // 2) Construction de la requête upstream
  let upstreamUrl: string;
  const upstreamHeaders: Record<string, string> = { "content-type": "application/json" };
  switch (providerName) {
    case "anthropic":
      upstreamUrl = "https://api.anthropic.com/v1/messages";
      upstreamHeaders["x-api-key"] = apiKey;
      upstreamHeaders["anthropic-version"] = "2023-06-01";
      break;
    case "openai":
      upstreamUrl = "https://api.openai.com/v1/chat/completions";
      upstreamHeaders["authorization"] = `Bearer ${apiKey}`;
      break;
    case "mistral":
      upstreamUrl = "https://api.mistral.ai/v1/ocr";
      upstreamHeaders["authorization"] = `Bearer ${apiKey}`;
      break;
    case "gemini": {
      const model = url.searchParams.get("model") || "gemini-2.5-pro";
      upstreamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
      break;
    }
  }

  // 3) Appel upstream — capture les erreurs réseau distinctement des erreurs HTTP
  //    Bug #17 fix : timeout dur via AbortController. Anthropic peut mettre
  //    jusqu'à 60s sur les gros prompts ; on alloue 75s pour avoir une marge,
  //    et le frontend (45s) timeout en premier proprement.
  let upstream: Response;
  const abortCtrl = new AbortController();
  const timeoutHandle = setTimeout(() => abortCtrl.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    upstream = await fetch(upstreamUrl, { method: "POST", headers: upstreamHeaders, body, signal: abortCtrl.signal });
  } catch (e) {
    const desc = describeException(e);
    const isAbort = desc.name === "AbortError" || desc.message.toLowerCase().includes("abort");
    return jsonErr(
      isAbort ? 504 : 502,
      isAbort ? "upstream_timeout" : "upstream_unreachable",
      isAbort
        ? `${providerName} n'a pas répondu dans le délai (${UPSTREAM_TIMEOUT_MS / 1000}s).`
        : `Impossible de joindre ${providerName} (réseau ou DNS).`,
      desc.message,
      `forwardProvider:${providerName}:${isAbort ? "timeout" : "fetch"}`,
      origin,
      {
        provider: providerName,
        upstream_url_host: new URL(upstreamUrl).host,
        timeout_ms: UPSTREAM_TIMEOUT_MS,
        exception_name: desc.name,
        where: desc.stack,
        hint: isAbort
          ? "Le provider a pris trop longtemps. Réessayer plus tard ou avec un PDF plus petit."
          : "Vérifier la connectivité Cloudflare → provider.",
      }
    );
  } finally {
    clearTimeout(timeoutHandle);
  }

  // 4) Si upstream renvoie un code d'erreur, on enrichit la réponse plutôt que de la pipe nue
  if (!upstream.ok) {
    const text = await upstream.text();
    let parsed: unknown = text;
    try { parsed = JSON.parse(text); } catch (_) { /* garde texte brut */ }
    const upstreamMessage =
      (parsed as any)?.error?.message ||
      (parsed as any)?.message ||
      (typeof parsed === "string" ? parsed.slice(0, 400) : JSON.stringify(parsed).slice(0, 400));
    // Hint spécifique pour 401 Anthropic — diagnostic exact secret GitHub vs Apex
    let hint401 = "";
    if (upstream.status === 401 && providerName === "anthropic") {
      hint401 = "Si la même clé fonctionne dans Apex AI : le secret GitHub " +
                "ANTHROPIC_API_KEY contient probablement une AUTRE clé (vieille / révoquée). " +
                "Récupérer la clé active depuis Apex (Coffre → ax_anthropic_key) ou " +
                "https://console.anthropic.com/settings/keys, la coller dans " +
                "https://github.com/9r4rxssx64-creator/CMCteams/settings/secrets/actions/ANTHROPIC_API_KEY, " +
                "puis re-déclencher le workflow cmc-parser-proxy-deploy.yml.";
    }
    return jsonErr(
      upstream.status === 401 || upstream.status === 403 ? upstream.status : (upstream.status >= 500 ? 502 : upstream.status),
      upstream.status === 401 ? "upstream_unauthorized"
        : upstream.status === 429 ? "upstream_rate_limited"
        : upstream.status === 400 ? "upstream_bad_request"
        : upstream.status >= 500 ? "upstream_5xx"
        : "upstream_error",
      upstream.status === 401 ? `${providerName} refuse la clé API (401).`
        : upstream.status === 429 ? `${providerName} a renvoyé 429 — limite forfait atteinte.`
        : upstream.status === 400 ? `${providerName} a refusé la requête (400 Bad Request).`
        : upstream.status >= 500 ? `${providerName} est en erreur côté serveur (${upstream.status}).`
        : `${providerName} a renvoyé HTTP ${upstream.status}.`,
      upstreamMessage,
      `forwardProvider:${providerName}:upstream_${upstream.status}`,
      origin,
      { provider: providerName, http_status: upstream.status, upstream_body: parsed, ...(hint401 ? { hint: hint401 } : {}) }
    );
  }

  // 5) Succès — pipe la réponse upstream avec CORS attachés
  const out = new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: upstream.headers,
  });
  const ch = corsHeaders(origin);
  for (const [k, v] of Object.entries(ch)) out.headers.set(k, v as string);
  return out;
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

    // Exemptions auth :
    //   /healthz  → déjà géré plus haut (pas d'auth)
    //   /test/*   → diagnostic public Kevin (mini-call 8 tokens, coût ~$0.0001/call,
    //               négligeable même si abusé). Permet à Kevin de hit l'URL
    //               directement depuis Safari iOS pour valider sa clé sans
    //               passer par l'app (qui peut être en cache).
    const isPublicTest = url.pathname.startsWith("/test/") && req.method === "GET";
    if (!isPublicTest) {
      const auth = checkAuth(req, env);
      if (!auth.ok) {
        return jsonErr(
          401,
          "auth_missing",
          "Authentification requise pour accéder à ce proxy.",
          auth.reason || "Header X-Auth-Token absent ou invalide.",
          "router:auth_check",
          origin,
          { hint: "Renseigner le champ PUSH_ADMIN_TOKEN dans l'app (bloc « 0. Proxy Vision IA »)." }
        );
      }
    }

    // Liste des providers configurés (auth requise — donne plus d'info que /healthz)
    if (url.pathname === "/providers" && req.method === "GET") {
      return new Response(
        JSON.stringify({
          anthropic: { configured: !!env.ANTHROPIC_API_KEY, secret_name: "ANTHROPIC_API_KEY" },
          openai: { configured: !!env.OPEN_AI_API_KEY, secret_name: "OPEN_AI_API_KEY" },
          mistral: { configured: !!env.MISTRAL_API_KEY, secret_name: "MISTRAL_API_KEY" },
          gemini: { configured: !!env.GEMINI_API_KEY, secret_name: "GEMINI_API_KEY" },
        }),
        { status: 200, headers: { "content-type": "application/json", ...corsHeaders(origin) } }
      );
    }

    // Endpoint de diagnostic LIVE : teste la clé de chaque provider avec un
    // mini-call (1 token) et retourne soit "OK" soit la vraie erreur upstream.
    // Permet à Kevin de vérifier que sa clé Anthropic est valide SANS recharger
    // toute l'app frontend (utile vu le cache Safari iOS).
    // Exemple : GET /test/anthropic → {ok: true, model: "claude-sonnet-4-6"}
    //          ou {ok: false, http_status: 401, message: "invalid x-api-key"}
    const testMatch = url.pathname.match(/^\/test\/(anthropic|openai|mistral|gemini)\/?$/);
    if (testMatch && req.method === "GET") {
      const providerName = testMatch[1] as Provider;
      // Bug #18 fix : rate-limit best-effort par IP source (6 calls/min).
      const clientIp = req.headers.get("CF-Connecting-IP") || req.headers.get("X-Forwarded-For") || "unknown";
      const rl = checkTestRateLimit(clientIp);
      if (!rl.ok) {
        return jsonErr(
          429,
          "test_rate_limited",
          "Trop d'appels au endpoint de diagnostic /test/* depuis cette IP.",
          `Limite : ${TEST_RATE_LIMIT_PER_MIN} calls/minute. Attendre 60s.`,
          `test:${providerName}:rate_limit`,
          origin,
          { ip: clientIp.replace(/:\d+$/, ":***"), limit: TEST_RATE_LIMIT_PER_MIN, hint: "Endpoint réservé au diagnostic ponctuel Kevin. Pour usage programmatique, utiliser /v1/* avec X-Auth-Token." }
        );
      }
      const requestedModel = url.searchParams.get("model") || "";
      try {
        let testBody: unknown;
        let endpoint: string;
        let headers: Record<string, string> = { "content-type": "application/json" };
        const apiKey = ({
          anthropic: env.ANTHROPIC_API_KEY,
          openai: env.OPEN_AI_API_KEY,
          mistral: env.MISTRAL_API_KEY,
          gemini: env.GEMINI_API_KEY,
        } as Record<Provider, string | undefined>)[providerName];

        if (!apiKey) {
          return jsonErr(503, "secret_missing",
            `Secret ${providerName} absent du Worker.`,
            "Re-trigger le workflow après avoir ajouté/mis à jour le secret GitHub.",
            `test:${providerName}:secret`, origin, { provider: providerName });
        }

        switch (providerName) {
          case "anthropic":
            endpoint = "https://api.anthropic.com/v1/messages";
            headers["x-api-key"] = apiKey;
            headers["anthropic-version"] = "2023-06-01";
            testBody = {
              model: requestedModel || "claude-sonnet-4-6",
              max_tokens: 8,
              messages: [{ role: "user", content: "ping" }],
            };
            break;
          case "openai":
            endpoint = "https://api.openai.com/v1/chat/completions";
            headers["authorization"] = `Bearer ${apiKey}`;
            testBody = {
              model: requestedModel || "gpt-4o-mini",
              max_tokens: 8,
              messages: [{ role: "user", content: "ping" }],
            };
            break;
          case "mistral":
            endpoint = "https://api.mistral.ai/v1/chat/completions";
            headers["authorization"] = `Bearer ${apiKey}`;
            testBody = {
              model: requestedModel || "mistral-small-latest",
              max_tokens: 8,
              messages: [{ role: "user", content: "ping" }],
            };
            break;
          case "gemini":
            endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${requestedModel || "gemini-2.5-flash"}:generateContent?key=${apiKey}`;
            testBody = {
              contents: [{ role: "user", parts: [{ text: "ping" }] }],
              generationConfig: { maxOutputTokens: 8 },
            };
            break;
        }

        const r = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(testBody),
        });
        const text = await r.text();
        let parsed: unknown = text;
        try { parsed = JSON.parse(text); } catch (_) { /* keep text */ }

        const ok = r.ok;
        const upstreamMsg =
          (parsed as any)?.error?.message ||
          (parsed as any)?.message ||
          (typeof parsed === "string" ? parsed.slice(0, 300) : JSON.stringify(parsed).slice(0, 300));

        return new Response(JSON.stringify({
          ok,
          provider: providerName,
          model_tested: (testBody as any).model || requestedModel || null,
          http_status: r.status,
          message: ok ? `${providerName} accepte la clé et le modèle.` : `${providerName} a renvoyé HTTP ${r.status} — ${upstreamMsg}`,
          upstream_body: parsed,
          ts: new Date().toISOString(),
        }, null, 2), {
          status: ok ? 200 : (r.status === 401 || r.status === 403 ? r.status : (r.status >= 500 ? 502 : r.status)),
          headers: { "content-type": "application/json", ...corsHeaders(origin) }
        });
      } catch (e) {
        const desc = describeException(e);
        return jsonErr(502, "test_exception",
          `Exception pendant le test ${providerName}.`,
          desc.message, `test:${providerName}:exception`,
          origin, { exception_name: desc.name, where: desc.stack });
      }
    }

    // Forward provider
    const match = url.pathname.match(/^\/v1\/(anthropic|openai|mistral|gemini)\/?$/);
    if (match && req.method === "POST") {
      const provider = match[1] as Provider;
      let body: ArrayBuffer;
      try {
        body = await req.arrayBuffer();
      } catch (e) {
        const desc = describeException(e);
        return jsonErr(
          400,
          "request_body_read_failed",
          "Impossible de lire le corps de la requête.",
          desc.message,
          `router:read_body:${provider}`,
          origin,
          { exception_name: desc.name, where: desc.stack }
        );
      }
      try {
        return await forwardProvider(provider, body, env, url, origin);
      } catch (e) {
        const desc = describeException(e);
        return jsonErr(
          500,
          "internal_error",
          `Erreur interne du proxy pendant l'appel ${provider}.`,
          desc.message,
          `router:forward:${provider}`,
          origin,
          { exception_name: desc.name, where: desc.stack }
        );
      }
    }

    return jsonErr(
      404,
      "route_unknown",
      "Route inconnue sur ce proxy.",
      `Path ${url.pathname} method ${req.method} ne correspond à aucun endpoint.`,
      "router:no_match",
      origin,
      { available_endpoints: ["GET /healthz", "GET /providers", "POST /v1/{anthropic|openai|mistral|gemini}"] }
    );
  },
};
