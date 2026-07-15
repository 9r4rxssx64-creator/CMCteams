// gauth.js — Mint un access_token Google OAuth2 depuis un compte de service
// (FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY), SANS dépendance externe.
//
// Sert à authentifier les appels REST Firebase RTDB de l'agent KDMC : la base
// exige désormais `auth != null` → un GET non authentifié = HTTP 401 (crash).
// Un access_token de compte de service contourne les règles (accès admin).
//
// Fail-open : si les creds manquent ou si l'échange échoue → renvoie '' (l'appelant
// fait alors un appel non authentifié, comme avant — pas de throw).

import { createSign } from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE =
  "https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email";

let cachedToken = "";
let cachedExp = 0;

function b64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * @returns {Promise<string>} access_token valide (>60s), ou '' (fail-open).
 */
export async function getFirebaseAccessToken(clientEmail, privateKey) {
  try {
    if (!clientEmail || !privateKey) return "";
    // Token encore valide en cache (marge 60s) → réutiliser.
    if (cachedToken && cachedExp > Date.now() + 60_000) return cachedToken;

    // Les secrets GitHub/Vercel stockent souvent les \n littéraux → normaliser.
    // Normalisation robuste (Kevin 2026-07-15) : la clé peut arriver de Vercel/GitHub
    // avec des guillemets encadrants, des \n LITTÉRAUX (JSON) et/ou des \r (Windows).
    let key = String(privateKey).trim();
    if (
      (key.startsWith('"') && key.endsWith('"')) ||
      (key.startsWith("'") && key.endsWith("'"))
    ) {
      key = key.slice(1, -1);
    }
    key = key.replace(/\\r/g, "").replace(/\\n/g, "\n").replace(/\r/g, "");

    const now = Math.floor(Date.now() / 1000);
    const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const claims = b64url(
      JSON.stringify({
        iss: clientEmail,
        scope: SCOPE,
        aud: TOKEN_URL,
        iat: now,
        exp: now + 3600,
      }),
    );
    const signingInput = `${header}.${claims}`;
    const signer = createSign("RSA-SHA256");
    signer.update(signingInput);
    signer.end();
    const signature = b64url(signer.sign(key));
    const assertion = `${signingInput}.${signature}`;

    const body = new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    });
    const r = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    if (!r.ok) {
      console.warn(`[gauth] token exchange HTTP ${r.status}`);
      return "";
    }
    const data = await r.json();
    if (!data || !data.access_token) return "";
    cachedToken = data.access_token;
    cachedExp = Date.now() + (Number(data.expires_in) || 3600) * 1000;
    return cachedToken;
  } catch (e) {
    console.warn("[gauth] mint failed (fail-open):", e && e.message);
    return "";
  }
}
