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
// build-marker 2026-07-15b : force un build frais après le sync des env vars
// FIREBASE_* sur Vercel (un redeploy-clone réutilise l'ancien snapshot d'env ;
// seul un build depuis la source capte les vars à jour).
import { getFirebaseAccessToken } from "../lib/gauth.js";

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
      // 200 = auth Firebase OK (cause racine du crash 401 réparée).
      // 401 = toujours KO (compte de service absent/invalide) → l'agent ne peut
      //        pas lire l'état ; le flood Telegram reste supprimé (anti-spam).
      verdict: r.ok
        ? "OK — auth Firebase fonctionne (plus de crash 401)"
        : `HTTP ${r.status} — auth Firebase KO (compte de service manquant/invalide)`,
    };
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
