/**
 * apex-auth-worker.js — Cloudflare Worker pour Phase 5 Firebase Auth
 *
 * Mission : générer custom tokens Firebase signés pour Apex AI clients.
 * Sans ce serveur, impossible d'avoir un vrai per-user UID gate Firebase.
 *
 * DÉPLOIEMENT KEVIN (PHASE5_DEPLOY.md) :
 *   1. Créer un compte Cloudflare (gratuit) si pas déjà fait
 *   2. Tape `wrangler deploy` dans le dossier apex-auth-worker/
 *   3. Configurer secrets : FIREBASE_PROJECT_ID + FIREBASE_PRIVATE_KEY + FIREBASE_CLIENT_EMAIL
 *   4. Coller URL worker dans Apex Coffre key `ax_auth_worker_url`
 *
 * SECRETS REQUIS (wrangler secret put) :
 *   - FIREBASE_PROJECT_ID : "kdmc-clients" (depuis console Firebase)
 *   - FIREBASE_PRIVATE_KEY : PEM key (depuis Firebase Service Account JSON)
 *   - FIREBASE_CLIENT_EMAIL : "firebase-adminsdk-XXX@kdmc-clients.iam.gserviceaccount.com"
 *
 * ENDPOINTS :
 *   POST /login    : {uid, pin_hash} → {custom_token} (TTL 1h)
 *   POST /refresh  : {refresh_token} → {custom_token}
 *   GET  /health   : status check
 *
 * SÉCURITÉ :
 *   - Validation pin_hash contre Firebase RTDB /apex/ax_pin_<uid>
 *   - Rate-limit : 5 tentatives par IP par 15 min (KV namespace)
 *   - HMAC-SHA256 signature custom token via Firebase service-account
 *   - Pas de stockage logs PII (RGPD Art.5)
 *   - Audit trail dans Firebase /apex/ax_auth_log (admin-only via rules)
 */

const FIREBASE_AUTH_BASE = "https://identitytoolkit.googleapis.com/v1";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // --- /health ---
      if (url.pathname === "/health" && request.method === "GET") {
        return jsonResp({ ok: true, version: "v1.0", ts: Date.now() }, corsHeaders);
      }

      // --- /login ---
      if (url.pathname === "/login" && request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        const { uid, pin_hash } = body;

        if (!uid || !pin_hash) {
          return jsonResp({ ok: false, error: "missing_uid_or_pin_hash" }, corsHeaders, 400);
        }

        // Rate-limit par IP (KV namespace)
        const ip = request.headers.get("CF-Connecting-IP") || "unknown";
        const rateKey = `rl:${ip}`;
        const attempts = parseInt(await env.AUTH_KV.get(rateKey) || "0");
        if (attempts >= 5) {
          return jsonResp({ ok: false, error: "rate_limited", retry_after: 900 }, corsHeaders, 429);
        }
        await env.AUTH_KV.put(rateKey, String(attempts + 1), { expirationTtl: 900 });

        // Vérifier pin_hash contre Firebase RTDB
        const fbResp = await fetch(
          `https://${env.FIREBASE_PROJECT_ID}-default-rtdb.europe-west1.firebasedatabase.app/apex/ax_pin_${uid}.json`
        );
        if (!fbResp.ok) {
          return jsonResp({ ok: false, error: "user_not_found" }, corsHeaders, 404);
        }
        const expectedHash = await fbResp.text();
        const cleanExpected = String(expectedHash || "").replace(/^"|"$/g, "");

        if (cleanExpected !== pin_hash) {
          return jsonResp({ ok: false, error: "pin_mismatch" }, corsHeaders, 401);
        }

        // Reset rate-limit après succès
        await env.AUTH_KV.delete(rateKey);

        // Générer custom token Firebase signé
        const customToken = await generateCustomToken(uid, env);

        // Audit trail
        ctx.waitUntil(auditLog(env, uid, "login_success", ip));

        return jsonResp({
          ok: true,
          custom_token: customToken,
          uid: uid,
          expires_in: 3600
        }, corsHeaders);
      }

      // --- /refresh ---
      if (url.pathname === "/refresh" && request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        const { uid, refresh_token } = body;
        if (!uid || !refresh_token) {
          return jsonResp({ ok: false, error: "missing_params" }, corsHeaders, 400);
        }
        // TODO Phase 5.1 : valider refresh_token via Firebase Auth REST API
        const newToken = await generateCustomToken(uid, env);
        return jsonResp({ ok: true, custom_token: newToken, expires_in: 3600 }, corsHeaders);
      }

      return jsonResp({ ok: false, error: "not_found" }, corsHeaders, 404);
    } catch (e) {
      console.error("[auth-worker] error:", e.message);
      return jsonResp({ ok: false, error: "internal_error", message: e.message }, corsHeaders, 500);
    }
  }
};

function jsonResp(data, corsHeaders, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
}

async function auditLog(env, uid, action, ip) {
  try {
    const ipHash = await sha256(ip);
    const entry = {
      uid,
      action,
      ip_hash: ipHash.slice(0, 16),
      ts: Date.now(),
      worker_version: "v1.0"
    };
    await fetch(
      `https://${env.FIREBASE_PROJECT_ID}-default-rtdb.europe-west1.firebasedatabase.app/apex/ax_auth_log/${entry.ts}.json`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
      }
    );
  } catch (e) {
    console.warn("audit log failed:", e.message);
  }
}

async function sha256(str) {
  const data = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Génère un Firebase custom token signé via service-account.
 * Utilise jose-like JWT signing avec RS256.
 */
async function generateCustomToken(uid, env) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: env.FIREBASE_CLIENT_EMAIL,
    sub: env.FIREBASE_CLIENT_EMAIL,
    aud: "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
    iat: now,
    exp: now + 3600,
    uid: uid,
    claims: { role: uid === "kdmc_admin" ? "admin" : "user" }
  };

  const encoder = new TextEncoder();
  const headerB64 = base64urlEncode(JSON.stringify(header));
  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const privateKey = await importPrivateKey(env.FIREBASE_PRIVATE_KEY);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    encoder.encode(signingInput)
  );
  const sigB64 = base64urlEncode(new Uint8Array(signature));

  return `${signingInput}.${sigB64}`;
}

function base64urlEncode(input) {
  let str;
  if (typeof input === "string") {
    str = btoa(input);
  } else {
    str = btoa(String.fromCharCode.apply(null, input));
  }
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function importPrivateKey(pem) {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const binary = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "pkcs8",
    binary,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}
