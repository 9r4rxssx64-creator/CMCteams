// Endpoint de test sans auth — vérifie que l'agent est déployé ET que l'auth
// Firebase (compte de service) fonctionne réellement.
// URL : /api/health
//
// Sonde Firebase (Kevin 2026-07-15 « tjs opérationnel ? » + captures crash 401) :
// on tente une VRAIE lecture RTDB authentifiée (shallow, minuscule) via le même
// gauth que l'agent → distingue « cause racine réparée » (200) de « seul le spam
// supprimé » (401 = compte de service absent/invalide sur Vercel).
// Aucune valeur secrète n'est exposée : uniquement des booléens + le status HTTP.
//
// build-marker 2026-07-15c : diag de mint granulaire (raison EXACTE du token_minted
// false) + gauth durci. Aucune valeur secrète exposée (longueurs/booléens/erreur
// Google seulement).
import { createSign } from "node:crypto";
import { getFirebaseAccessToken } from "../lib/gauth.js";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE =
  "https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email";
function b64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Mint diagnostique : rejoue l'échange JWT→access_token en rapportant CHAQUE étape
// (format de clé, signature, corps d'erreur Google). Ne renvoie jamais la clé ni
// le token — uniquement des métadonnées de diagnostic.
async function diagMint(clientEmail, privateKeyRaw) {
  const d = {};
  try {
    let key = String(privateKeyRaw || "").trim();
    if (
      (key.startsWith('"') && key.endsWith('"')) ||
      (key.startsWith("'") && key.endsWith("'"))
    ) {
      key = key.slice(1, -1);
    }
    key = key.replace(/\\r/g, "").replace(/\\n/g, "\n").replace(/\r/g, "");
    d.key_len = key.length;
    d.key_has_begin = key.includes("BEGIN PRIVATE KEY");
    d.key_lines = key.split("\n").length;
    d.email_present = !!clientEmail;
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
    let assertion;
    try {
      const signer = createSign("RSA-SHA256");
      signer.update(signingInput);
      signer.end();
      assertion = `${signingInput}.${b64url(signer.sign(key))}`;
      d.sign_ok = true;
    } catch (se) {
      d.sign_ok = false;
      d.sign_error = String((se && se.message) || se).slice(0, 160);
      return d; // clé invalide → inutile d'appeler Google
    }
    const r = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }).toString(),
    });
    d.token_http = r.status;
    if (!r.ok) {
      // corps d'erreur Google = { error, error_description } → nomme la cause.
      d.token_error = (await r.text()).slice(0, 200);
    } else {
      d.token_ok = true;
    }
  } catch (e) {
    d.diag_error = String((e && e.message) || e).slice(0, 160);
  }
  return d;
}

export default async function handler(req, res) {
  const hasClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
  const hasPrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;
  const FB_URL =
    process.env.FB_URL ||
    "https://cmcteams-c16ab-default-rtdb.europe-west1.firebasedatabase.app";

  let firebase = { probe: "skipped" };
  try {
    const token = await getFirebaseAccessToken(
      process.env.FIREBASE_CLIENT_EMAIL || "",
      process.env.FIREBASE_PRIVATE_KEY || "",
    );
    // shallow=true → réponse minuscule (clés de 1er niveau en booléens).
    const qs = token
      ? `?shallow=true&access_token=${encodeURIComponent(token)}`
      : "?shallow=true";
    const r = await fetch(`${FB_URL}/cmcteams.json${qs}`);
    firebase = {
      token_minted: !!token,
      read_status: r.status,
      read_ok: r.ok,
      verdict: r.ok
        ? "OK — auth Firebase fonctionne (plus de crash 401)"
        : `HTTP ${r.status} — auth Firebase KO (compte de service manquant/invalide)`,
    };
    // Si le mint a échoué mais les creds sont présents → diag granulaire.
    if (!token && hasClientEmail && hasPrivateKey) {
      firebase.mint_diag = await diagMint(
        process.env.FIREBASE_CLIENT_EMAIL,
        process.env.FIREBASE_PRIVATE_KEY,
      );
    }
  } catch (e) {
    firebase = { probe: "error", error: String((e && e.message) || e) };
  }

  res.status(200).json({
    ok: true,
    agent: "kdmc-bot-2026",
    timestamp: new Date().toISOString(),
    message:
      "Agent KDMC en ligne. Utilise /api/cron?secret=...&trigger=manual pour lancer les tâches.",
    env_check: {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
        ? "set (" + process.env.ANTHROPIC_API_KEY.slice(0, 8) + "...)"
        : "MISSING",
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ? "set" : "MISSING",
      TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID
        ? "set (" + process.env.TELEGRAM_CHAT_ID + ")"
        : "MISSING",
      AGENT_SECRET: process.env.AGENT_SECRET
        ? "set (" + process.env.AGENT_SECRET.length + " chars)"
        : "NOT SET (auth disabled)",
      FIREBASE_CLIENT_EMAIL: hasClientEmail ? "set" : "MISSING",
      FIREBASE_PRIVATE_KEY: hasPrivateKey ? "set" : "MISSING",
    },
    firebase,
  });
}
