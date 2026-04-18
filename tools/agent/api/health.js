// Endpoint de test sans auth — juste pour vérifier que l'agent est déployé correctement
// URL : /api/health
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    agent: "kdmc-bot-2026",
    timestamp: new Date().toISOString(),
    message: "Agent KDMC en ligne. Utilise /api/cron?secret=...&trigger=manual pour lancer les tâches.",
    env_check: {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? "set (" + process.env.ANTHROPIC_API_KEY.slice(0, 8) + "...)" : "MISSING",
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ? "set" : "MISSING",
      TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID ? "set (" + process.env.TELEGRAM_CHAT_ID + ")" : "MISSING",
      AGENT_SECRET: process.env.AGENT_SECRET ? "set (" + process.env.AGENT_SECRET.length + " chars)" : "NOT SET (auth disabled)",
      SENTRY_DSN: process.env.SENTRY_DSN ? "set (monitoring active)" : "MISSING (Sentry Node SDK disabled — add in Vercel env vars)",
      SENTRY_ENVIRONMENT: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
    }
  });
}
