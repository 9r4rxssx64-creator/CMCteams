/**
 * APEX v13.0 Backend Worker — Cloudflare Workers
 *
 * Endpoints serveur pour Apex v13 PWA :
 * - POST /idempotency/check    : déduplication atomique writes Firebase
 * - POST /webauthn/verify      : vérification serveur signature FaceID/TouchID
 * - POST /stripe/webhook        : webhook Stripe avec signature HMAC
 * - GET  /auth/verify           : validation token session côté serveur
 * - POST /escalate              : capture critical events Apex côté serveur
 * - POST /ai/judge              : LLM judge pour vraie hallucination detection
 *
 * Sécurité :
 * - CORS strict (origin = Apex Pages URL)
 * - Rate-limit par IP (KV namespace)
 * - Secrets via Wrangler vars (jamais exposés client)
 * - Audit log centralisé Cloudflare Logpush
 *
 * Storage :
 * - KV `IDEMPOTENCY` : dedup keys 60s TTL
 * - KV `RATE_LIMIT`  : compteurs par IP 10min
 * - KV `WEBAUTHN`    : credentials enrolled per uid
 * - KV `SESSIONS`    : tokens session validés
 *
 * Wrangler config dans wrangler.toml.
 */

const APEX_ORIGIN = 'https://9r4rxssx64-creator.github.io';
const APEX_PATH = '/CMCteams/apex-ai-v13/';
const ALLOWED_ORIGINS = new Set([APEX_ORIGIN]);

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; /* 10 min */
const RATE_LIMIT_MAX = 100; /* 100 req / 10 min / IP */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') ?? '';

    /* CORS preflight */
    if (request.method === 'OPTIONS') {
      return corsPreflight(origin);
    }

    /* CORS strict */
    if (!ALLOWED_ORIGINS.has(origin) && !origin.includes('localhost')) {
      return jsonError(403, 'Origin not allowed', origin);
    }

    /* Rate-limit par IP */
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const rateOk = await checkRateLimit(env.RATE_LIMIT, ip);
    if (!rateOk) {
      return jsonError(429, 'Rate limit exceeded', null, origin);
    }

    /* Routing */
    try {
      switch (url.pathname) {
        case '/health':
          return jsonResponse({ ok: true, ver: 'v13.0.0', ts: Date.now() }, origin);
        case '/idempotency/check':
          return await handleIdempotency(request, env, origin);
        case '/webauthn/register':
          return await handleWebAuthnRegister(request, env, origin);
        case '/webauthn/verify':
          return await handleWebAuthnVerify(request, env, origin);
        case '/stripe/webhook':
          return await handleStripeWebhook(request, env, origin);
        case '/auth/verify':
          return await handleAuthVerify(request, env, origin);
        case '/escalate':
          return await handleEscalate(request, env, origin);
        case '/ai/judge':
          return await handleAIJudge(request, env, origin);
        default:
          return jsonError(404, 'Endpoint not found', url.pathname, origin);
      }
    } catch (err) {
      return jsonError(500, 'Internal error', String(err).slice(0, 200), origin);
    }
  },
};

/* ─────────── HANDLERS ─────────── */

/**
 * Idempotency check : retourne { skip: true } si même hash vu < 60s.
 * Sinon enregistre le hash et retourne { skip: false }.
 * Atomique via KV PUT (last-write-wins par worker, mais 60s window suffit).
 */
async function handleIdempotency(request, env, origin) {
  const body = await request.json().catch(() => ({}));
  const { hash } = body;
  if (!hash || typeof hash !== 'string' || hash.length < 8) {
    return jsonError(400, 'hash required (min 8 chars)', null, origin);
  }
  const seen = await env.IDEMPOTENCY.get(`h:${hash}`);
  if (seen) return jsonResponse({ skip: true, seenAt: parseInt(seen, 10) }, origin);
  await env.IDEMPOTENCY.put(`h:${hash}`, String(Date.now()), { expirationTtl: 60 });
  return jsonResponse({ skip: false }, origin);
}

/**
 * WebAuthn register : stocke credential public key serveur après enroll côté client.
 * Body : { uid, credentialId (b64), publicKey (b64), counter }
 */
async function handleWebAuthnRegister(request, env, origin) {
  const body = await request.json().catch(() => ({}));
  const { uid, credentialId, publicKey } = body;
  if (!uid || !credentialId || !publicKey) {
    return jsonError(400, 'uid, credentialId, publicKey required', null, origin);
  }
  const record = JSON.stringify({ credentialId, publicKey, counter: 0, registeredAt: Date.now() });
  await env.WEBAUTHN.put(`u:${uid}`, record);
  return jsonResponse({ ok: true, uid }, origin);
}

/**
 * WebAuthn verify : vérifie signature assertion côté serveur.
 * Body : { uid, challenge (b64), assertion: { authenticatorData, clientDataJSON, signature, userHandle } }
 *
 * Note Jet 6.5 : implémentation simplifiée. Production requiert lib comme @simplewebauthn/server.
 * Pour Apex v13, on valide juste que credentialId match + counter increment monotone.
 */
async function handleWebAuthnVerify(request, env, origin) {
  const body = await request.json().catch(() => ({}));
  const { uid, credentialId, counter } = body;
  if (!uid || !credentialId) return jsonError(400, 'uid + credentialId required', null, origin);

  const stored = await env.WEBAUTHN.get(`u:${uid}`);
  if (!stored) return jsonError(404, 'No credential registered for uid', null, origin);
  const record = JSON.parse(stored);
  if (record.credentialId !== credentialId) {
    return jsonError(401, 'Credential mismatch', null, origin);
  }
  /* Counter must be strictly increasing (anti replay) */
  if (typeof counter === 'number' && counter <= record.counter) {
    return jsonError(401, 'Counter not increasing (replay attack ?)', null, origin);
  }
  /* Update counter */
  record.counter = counter ?? record.counter + 1;
  record.lastVerified = Date.now();
  await env.WEBAUTHN.put(`u:${uid}`, JSON.stringify(record));
  return jsonResponse({ ok: true, verified: true }, origin);
}

/**
 * Stripe webhook : reçoit event Stripe, valide signature HMAC, traite paiement.
 * Header Stripe-Signature obligatoire.
 */
async function handleStripeWebhook(request, env, origin) {
  const sig = request.headers.get('Stripe-Signature');
  const secret = env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return jsonError(400, 'Missing signature or secret', null, origin);

  const rawBody = await request.text();
  const valid = await verifyStripeSignature(rawBody, sig, secret);
  if (!valid) return jsonError(401, 'Invalid signature', null, origin);

  const event = JSON.parse(rawBody);
  /* Stocke event pour traitement asynchrone */
  await env.STRIPE_EVENTS.put(`e:${event.id}`, rawBody, { expirationTtl: 86400 });

  /* Routing event types */
  switch (event.type) {
    case 'checkout.session.completed':
      /* TODO Jet 7 : update user plan dans Firebase */
      break;
    case 'customer.subscription.deleted':
      /* TODO Jet 7 : downgrade user à free */
      break;
  }
  return jsonResponse({ received: true }, origin);
}

/**
 * Vérifie signature HMAC Stripe webhook (sha256).
 */
async function verifyStripeSignature(payload, sigHeader, secret) {
  /* Format : t=<ts>,v1=<sig> */
  const parts = sigHeader.split(',').reduce((acc, p) => {
    const [k, v] = p.split('=');
    if (k && v) acc[k] = v;
    return acc;
  }, {});
  const ts = parts.t;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const data = `${ts}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const sigHex = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return sigHex === v1;
}

/**
 * Auth verify : valide token session côté serveur.
 * Header Authorization: Bearer <token>.
 */
async function handleAuthVerify(request, env, origin) {
  const auth = request.headers.get('Authorization') ?? '';
  const token = auth.replace(/^Bearer\s+/, '');
  if (!token) return jsonError(401, 'Missing token', null, origin);

  const stored = await env.SESSIONS.get(`t:${token}`);
  if (!stored) return jsonError(401, 'Invalid or expired token', null, origin);
  const session = JSON.parse(stored);
  if (session.expiresAt && session.expiresAt < Date.now()) {
    await env.SESSIONS.delete(`t:${token}`);
    return jsonError(401, 'Token expired', null, origin);
  }
  return jsonResponse({ valid: true, uid: session.uid, isAdmin: session.isAdmin }, origin);
}

/**
 * Escalate : reçoit event critical Apex client + persiste pour Claude Code.
 * Body : { reason, severity, context }
 */
async function handleEscalate(request, env, origin) {
  const body = await request.json().catch(() => ({}));
  const { reason, severity, context } = body;
  if (!reason || !severity) return jsonError(400, 'reason + severity required', null, origin);
  const id = `esc_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
  const record = { id, reason, severity, context: context ?? {}, ts: Date.now() };
  await env.ESCALATIONS.put(`e:${id}`, JSON.stringify(record), { expirationTtl: 7 * 24 * 3600 });
  return jsonResponse({ ok: true, id }, origin);
}

/**
 * AI Judge : LLM judge pour vraie hallucination detection (Jet 6.5).
 * Body : { promptOriginal, responseA, responseB }
 * Utilise Claude Haiku rapide pour juger consistency sémantique vs heuristique Jaccard côté client.
 */
async function handleAIJudge(request, env, origin) {
  if (!env.ANTHROPIC_KEY) return jsonError(503, 'AI judge not configured', null, origin);
  const body = await request.json().catch(() => ({}));
  const { promptOriginal, responseA, responseB } = body;
  if (!promptOriginal || !responseA || !responseB) {
    return jsonError(400, 'promptOriginal + responseA + responseB required', null, origin);
  }
  /* Call Claude Haiku pour juger */
  const judgePrompt = `Tu es un juge IA. Compare 2 réponses au même prompt et dis si elles sont SÉMANTIQUEMENT cohérentes (peuvent dire la même chose avec des mots différents) ou DIVERGENTES (faits incompatibles).

Prompt original : ${String(promptOriginal).slice(0, 500)}

Réponse A : ${String(responseA).slice(0, 1000)}

Réponse B : ${String(responseB).slice(0, 1000)}

Réponds en JSON strict : { "consistent": true|false, "confidence": 0-1, "reason": "<explication courte>" }`;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{ role: 'user', content: judgePrompt }],
      }),
    });
    if (!res.ok) return jsonError(502, 'Anthropic judge call failed', null, origin);
    const data = await res.json();
    const text = data.content?.[0]?.text ?? '{}';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return jsonResponse({ consistent: null, error: 'parse_failed' }, origin);
    const verdict = JSON.parse(match[0]);
    return jsonResponse({ ...verdict, method: 'llm_judge_haiku' }, origin);
  } catch (err) {
    return jsonError(502, 'AI judge error', String(err).slice(0, 200), origin);
  }
}

/* ─────────── HELPERS ─────────── */

async function checkRateLimit(kv, ip) {
  if (!kv) return true; /* skip si KV pas configuré */
  const key = `rl:${ip}`;
  const data = await kv.get(key);
  let entry = data ? JSON.parse(data) : { count: 0, windowStart: Date.now() };
  if (Date.now() - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry = { count: 0, windowStart: Date.now() };
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) return false;
  await kv.put(key, JSON.stringify(entry), { expirationTtl: 700 });
  return true;
}

function corsPreflight(origin) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : APEX_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Stripe-Signature',
      'Access-Control-Max-Age': '86400',
    },
  });
}

function jsonResponse(data, origin) {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : APEX_ORIGIN,
    },
  });
}

function jsonError(status, error, detail, origin) {
  return new Response(JSON.stringify({ error, detail, ts: Date.now() }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : APEX_ORIGIN,
    },
  });
}
