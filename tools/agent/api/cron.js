// Endpoint HTTP pour Vercel Cron / manual trigger
// Protégé par un secret admin (pour éviter les appels non autorisés)
// v1.1 — intégration Sentry Node SDK pour monitoring

import { loadConfig } from "../lib/config.js";
import { initSentry } from "../lib/sentry.js";

const cfg = loadConfig();
const Sentry = initSentry(cfg);

// L'import de runAgentCycle est fait APRÈS initSentry pour bénéficier du tracing
const { runAgentCycle } = await import("../index.js");

export default async function handler(req, res) {
  // Vérification secret
  const authSecret = req.headers["authorization"]?.replace("Bearer ", "") || req.query?.secret;
  if (cfg.AGENT_SECRET && authSecret !== cfg.AGENT_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Détecter le cron path pour le trigger
  const trigger = req.query?.trigger || req.headers["x-cron-trigger"] || "vercel-cron";

  try {
    const report = await runAgentCycle({ trigger, verbose: false });
    res.status(200).json(report);
  } catch (err) {
    // Sentry : capture l'erreur API avec tags
    Sentry.withScope((scope) => {
      scope.setTag("endpoint", "api/cron");
      scope.setTag("trigger", trigger);
      scope.setContext("http", { method: req.method, url: req.url });
      Sentry.captureException(err);
    });
    try { await Sentry.flush(2000); } catch (_) {}
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}
