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
 * Normalise une clé privée arrivant de Vercel/GitHub et RÉPARE les formats
 * courants qui cassent OpenSSL (Kevin 2026-07-15, leçon : la clé sur Vercel
 * arrive SANS l'armure -----BEGIN/END----- = corps base64 nu → DECODER unsupported).
 *
 * Renvoie une LISTE de candidats PEM à essayer dans l'ordre (le 1er qui signe
 * ET mint un token gagne → self-healing quel que soit le format de stockage).
 * @returns {{name:string, key:string}[]}
 */
export function pemCandidates(raw) {
  let s = String(raw || "").trim();
  // Guillemets encadrants (secret collé avec quotes JSON) → retirer.
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1);
  }
  // \n / \r LITTÉRAUX (JSON) → vrais caractères ; retirer les \r Windows.
  s = s.replace(/\\r/g, "").replace(/\\n/g, "\n").replace(/\r/g, "");

  const out = [];
  // 1) Tel quel — cas normal (PEM déjà armuré). Non-régression.
  out.push({ name: "asis", key: s });

  // 2) base64(PEM entier) : certains stockent le PEM ré-encodé base64.
  try {
    const dec = Buffer.from(s.replace(/\s+/g, ""), "base64").toString("utf8");
    if (dec.includes("BEGIN") && dec.includes("PRIVATE KEY")) {
      out.push({ name: "b64pem", key: dec });
    }
  } catch (_) {
    /* ignore */
  }

  // 3) Corps base64 nu (armure retirée) → re-wrap 64 col + armure PKCS#8/PKCS#1.
  if (!s.includes("BEGIN")) {
    const body = s.replace(/[^A-Za-z0-9+/=]/g, "");
    if (body.length > 100) {
      const wrapped = (body.match(/.{1,64}/g) || []).join("\n");
      out.push({
        name: "rewrap-pkcs8",
        key: `-----BEGIN PRIVATE KEY-----\n${wrapped}\n-----END PRIVATE KEY-----\n`,
      });
      out.push({
        name: "rewrap-pkcs1",
        key: `-----BEGIN RSA PRIVATE KEY-----\n${wrapped}\n-----END RSA PRIVATE KEY-----\n`,
      });
    }
  }
  return out;
}

// Signe l'assertion JWT avec une clé candidate. Renvoie l'assertion ou null (sign KO).
function signAssertion(clientEmail, key) {
  try {
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
    return `${signingInput}.${b64url(signer.sign(key))}`;
  } catch (_) {
    return null;
  }
}

/**
 * @returns {Promise<string>} access_token valide (>60s), ou '' (fail-open).
 */
export async function getFirebaseAccessToken(clientEmail, privateKey) {
  try {
    if (!clientEmail || !privateKey) return "";
    // Token encore valide en cache (marge 60s) → réutiliser.
    if (cachedToken && cachedExp > Date.now() + 60_000) return cachedToken;

    // Essaie chaque format de clé jusqu'à ce qu'un mint réussisse (self-healing).
    for (const cand of pemCandidates(privateKey)) {
      const assertion = signAssertion(clientEmail, cand.key);
      if (!assertion) continue; // ce format ne signe pas → suivant
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
        console.warn(`[gauth] token exchange HTTP ${r.status} (variant ${cand.name})`);
        continue; // signature acceptée localement mais Google refuse → autre format
      }
      const data = await r.json();
      if (data && data.access_token) {
        cachedToken = data.access_token;
        cachedExp = Date.now() + (Number(data.expires_in) || 3600) * 1000;
        return cachedToken;
      }
    }
    return "";
  } catch (e) {
    console.warn("[gauth] mint failed (fail-open):", e && e.message);
    return "";
  }
}
