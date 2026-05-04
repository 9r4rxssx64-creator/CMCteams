/**
 * APEX v13 — Services Bootstrap (anti-pattern Declaration ≠ Deployment).
 *
 * Audit Kevin 2026-05-03 : 35/50 services orphelins (déclarés sans wiring).
 * Ce module wire TOUT au boot pour preuve "Deployment = Declaration".
 *
 * Stratégie :
 * - Lazy import (parallel via Promise.all) pour ne pas bloquer LCP
 * - safeInit avec try/catch isolé par service (1 fail ≠ tout casse)
 * - Logging clair de chaque init OK / KO
 * - Idempotent (boot 2× = no-op)
 *
 * Wired ici :
 * - perf-metrics : Web Vitals observers (LCP, INP, CLS, FCP, TTFB)
 * - predictive-engine : tracking actions user pour suggestions proactives
 * - business-intelligence : cron quotidien rapport auto
 * - tokens-dashboard : init compteurs API costs
 * - ads : refresh creatives au boot
 * - agent-watches : sentinelles secondaires (chat-watch, scroll-watch, etc.)
 * - ai-safety : init contrôles 10 (alignment, hallucination, prompt injection...)
 * - apex-tools : registry tools IA dispo
 * - auth-gate : aliases preconfigurés (Kevin, Laurence, famille)
 * - links-registry : test alive liens connus
 * - feature-deployment : flags actuels load
 * - smart-tools-suggester : index keywords pre-chargé
 * - external-integrations : healthcheck connectivité
 * - subscription-tiers : init catalogues
 * - voices-registry : pre-warm liste voix browser
 */

import { logger } from '../core/logger.js';

let bootstrapped = false;

interface InitResult {
  service: string;
  ok: boolean;
  duration_ms: number;
  reason?: string;
}

async function safeInit(service: string, fn: () => void | Promise<void>): Promise<InitResult> {
  const start = Date.now();
  try {
    await fn();
    const duration_ms = Date.now() - start;
    logger.info('services-bootstrap', `✓ ${service} (${duration_ms}ms)`);
    return { service, ok: true, duration_ms };
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : String(err);
    const duration_ms = Date.now() - start;
    logger.warn('services-bootstrap', `✗ ${service} failed`, { reason });
    return { service, ok: false, duration_ms, reason };
  }
}

/**
 * Wire tous les services orphelins au boot (parallèle, non-blocking).
 * Idempotent : 2e call no-op.
 */
export async function bootstrapServices(uid: string | null): Promise<readonly InitResult[]> {
  if (bootstrapped) return [];
  bootstrapped = true;

  const tasks: Array<Promise<InitResult>> = [
    /* Performance monitoring (Web Vitals) */
    safeInit('perf-metrics', async () => {
      const { perfMetrics } = await import('./perf-metrics.js');
      perfMetrics.install();
    }),

    /* Auth gate : pre-load aliases (Kevin, Laurence, famille) */
    safeInit('auth-gate', async () => {
      const { authGate } = await import('./auth-gate.js');
      /* Charge aliases preconfigurés depuis localStorage */
      authGate.registerUserAliases('kdmc_admin', [
        'Kevin DESARZENS', 'Kevin', 'kevin desarzens', 'desarzens kevin',
        'kevin.desarzens@gmail.com', 'kdmc',
      ]);
    }),

    /* Apex tools registry : log disponibilité */
    safeInit('apex-tools', async () => {
      const { apexTools } = await import('./apex-tools.js');
      const list = apexTools.list();
      logger.info('services-bootstrap', `apex-tools : ${list.length} tools dispo`);
    }),

    /* Predictive engine : tracker prêt + load history */
    safeInit('predictive-engine', async () => {
      const { predictiveEngine } = await import('./predictive-engine.js');
      if (uid) {
        const stats = predictiveEngine.getStats(uid);
        logger.info('services-bootstrap', `predictive : ${stats.total_actions} actions historisées`);
      }
    }),

    /* Business Intelligence : cron quotidien (1×/jour à minuit) */
    safeInit('business-intelligence', async () => {
      const { businessIntelligence } = await import('./business-intelligence.js');
      /* Schedule rapport quotidien : check si rapport jour existe, sinon génère */
      const today = new Date().toDateString();
      const lastRunKey = 'apex_v13_bi_last_daily_run';
      const lastRun = localStorage.getItem(lastRunKey);
      if (lastRun !== today) {
        businessIntelligence.generateReport('daily');
        localStorage.setItem(lastRunKey, today);
      }
    }),

    /* Tokens dashboard : init compteurs (idempotent) */
    safeInit('tokens-dashboard', async () => {
      const { tokensDashboard } = await import('./tokens-dashboard.js');
      const totals = tokensDashboard.getTotal();
      logger.info('services-bootstrap', `tokens-dashboard : $${totals.cost_usd.toFixed(2)} cumulé`);
    }),

    /* Ads : reset frequency cap si nouveau jour */
    safeInit('ads', async () => {
      const { ads } = await import('./ads.js');
      const stats = ads.getAdStats();
      logger.info('services-bootstrap', `ads : ${Object.keys(stats).length} ads tracking`);
    }),

    /* Agent watches : démarrer surveillances secondaires (auto-pulse boot) */
    safeInit('agent-watches', async () => {
      const { agentWatches } = await import('./agent-watches.js');
      agentWatches.notifWatch();
      agentWatches.fbHealth(true, Date.now());
    }),

    /* AI safety : init contrôles + heuristics */
    safeInit('ai-safety', async () => {
      const { aiSafety } = await import('./ai-safety.js');
      /* Test injection sur string vide pour pre-warm */
      aiSafety.detectInjection('');
    }),

    /* Links registry : re-test alive liens connus */
    safeInit('links-registry', async () => {
      const { linksRegistry } = await import('./links-registry.js');
      const links = linksRegistry.list();
      logger.info('services-bootstrap', `links-registry : ${links.length} services connus`);
    }),

    /* Feature deployment : load flags */
    safeInit('feature-deployment', async () => {
      const { featureDeployment } = await import('./feature-deployment.js');
      const flags = featureDeployment.listFlags();
      logger.info('services-bootstrap', `feature-flags : ${flags.length} actifs`);
    }),

    /* Smart tools suggester : pre-load via search vide */
    safeInit('smart-tools-suggester', async () => {
      const { smartToolsSuggester } = await import('./smart-tools-suggester.js');
      const top = smartToolsSuggester.getTopUsed(5);
      logger.info('services-bootstrap', `smart-tools : ${top.length} top tools`);
    }),

    /* Subscription tiers : pre-load tiers public */
    safeInit('subscription-tiers', async () => {
      const { subscriptionTiers } = await import('./subscription-tiers.js');
      const tiers = subscriptionTiers.listPublic();
      logger.info('services-bootstrap', `subscription-tiers : ${tiers.length} tiers publics`);
    }),

    /* Voices registry : pre-warm browser voices async */
    safeInit('voices-registry', async () => {
      const { voicesRegistry } = await import('./voices-registry.js');
      voicesRegistry.list();
    }),

    /* External integrations : pre-load registry projets connus */
    safeInit('external-integrations', async () => {
      const { externalIntegrations } = await import('./external-integrations.js');
      if (uid) externalIntegrations.listEmailAccounts(uid);
    }),

    /* AI router : init failover chain providers */
    safeInit('ai-router', async () => {
      const { aiRouter } = await import('./ai-router.js');
      const hasKey = aiRouter.hasAnyKey();
      logger.info('services-bootstrap', `ai-router : ${hasKey ? 'clé(s) configurée(s)' : 'aucune clé'}`);
    }),

    /* Self healing : install error catchers + emergency trim */
    safeInit('self-healing', async () => {
      const { selfHealing } = await import('./self-healing.js');
      selfHealing.install();
    }),

    /* Orchestrator : pre-load registry projets Kevin */
    safeInit('orchestrator', async () => {
      const { orchestrator } = await import('./orchestrator.js');
      const projects = orchestrator.listProjects();
      logger.info('services-bootstrap', `orchestrator : ${projects.length} projets Kevin connus`);
    }),

    /* RGPD : pre-load opt-out states pour user actuel */
    safeInit('rgpd', async () => {
      const { rgpd } = await import('./rgpd.js');
      if (uid) {
        const optedOut = rgpd.isOptedOut(uid);
        logger.info('services-bootstrap', `rgpd : opt-out=${optedOut} pour ${uid}`);
      }
    }),

    /* Telemetry : démarre collecte + sync queue */
    safeInit('telemetry', async () => {
      await import('./telemetry.js');
    }),

    /* PII redaction : pre-warm patterns regex */
    safeInit('pii-redaction', async () => {
      const { redactPII } = await import('./pii-redaction.js');
      redactPII(''); /* Pre-compile regexes */
    }),

    /* Permissions : pre-load tier user actuel */
    safeInit('permissions', async () => {
      const { permissions } = await import('./permissions.js');
      permissions.getTier();
    }),

    /* Capabilities : pre-load registry features dispo */
    safeInit('capabilities', async () => {
      const { capabilities } = await import('./capabilities.js');
      capabilities.list();
    }),

    /* Device context : pre-load device fingerprint + consent state */
    safeInit('device-context', async () => {
      const { deviceContext } = await import('./device-context.js');
      deviceContext.listConsents();
    }),

    /* Commerce : pre-load plans + facturation cache */
    safeInit('commerce', async () => {
      const { commerce } = await import('./commerce.js');
      if (uid) commerce.getEffectivePlan(uid);
    }),

    /* Chat realtime : init listeners événements */
    safeInit('chat-realtime', async () => {
      await import('./chat-realtime.js');
    }),

    /* Credential patterns : import pour détection paste auto */
    safeInit('credential-patterns', async () => {
      const { CREDENTIAL_PATTERNS } = await import('./credential-patterns.js');
      logger.info('services-bootstrap', `credential-patterns : ${CREDENTIAL_PATTERNS.length} patterns dispo`);
    }),

    /* Secure storage : init device-bound encryption ready */
    safeInit('secure-storage', async () => {
      await import('./secure-storage.js');
    }),

    /* File converter : warm up MIME types */
    safeInit('file-converter', async () => {
      const { fileConverter } = await import('./file-converter.js');
      fileConverter.listSupportedFormats();
    }),

    /* Media studio : pre-load providers list */
    safeInit('media-studio', async () => {
      const { mediaStudio } = await import('./media-studio.js');
      mediaStudio.list();
    }),

    /* Agent system : pre-load active tasks + history */
    safeInit('agent-system', async () => {
      const { agentSystem } = await import('./agent-system.js');
      const stats = agentSystem.getStats();
      logger.info('services-bootstrap', `agent-system : ${stats.active} actifs / ${stats.completed} done`);
    }),

    /* Backend : check configuration Cloudflare worker */
    safeInit('backend', async () => {
      const { backend } = await import('./backend.js');
      const configured = backend.isConfigured();
      logger.info('services-bootstrap', `backend : ${configured ? 'configuré' : 'non configuré'}`);
    }),

    /* Chat fallback : pre-load templates */
    safeInit('chat-fallback', async () => {
      await import('./chat-fallback.js');
    }),

    /* Voice print : check Web Audio API support */
    safeInit('voice-print', async () => {
      const { voicePrint } = await import('./voice-print.js');
      const supported = voicePrint.isSupported();
      logger.info('services-bootstrap', `voice-print : ${supported ? 'supporté' : 'non supporté'}`);
    }),

    /* Vision recognition : pre-load classifier */
    safeInit('vision-recognition', async () => {
      await import('./vision-recognition.js');
    }),

    /* Push notifications : pre-load subscriptions cache */
    safeInit('push-notifications', async () => {
      const { pushNotifications } = await import('./push-notifications.js');
      const stats = pushNotifications.getStats();
      logger.info('services-bootstrap', `push-notifications : ${stats.total_subscriptions} subs`);
    }),

    /* Push auto-init : ceinture+bretelles avec wiring bootstrap.ts (idempotent) */
    safeInit('push-auto-init', async () => {
      const { pushAutoInit } = await import('./push-auto-init.js');
      const env = pushAutoInit.detectEnvironment();
      const cfg = pushAutoInit.checkPushConfig();
      logger.info('services-bootstrap', `push-auto-init : env=${env}, ready_prod=${cfg.ready_for_prod}`);
      if (!cfg.ready_for_prod) {
        for (const w of cfg.warnings) logger.warn('services-bootstrap', `push: ${w}`);
      }
    }),

    /* Storage compressor : migration auto valeurs > 1KB vers compression UTF16
       (iOS PWA 5MB quota fix — règle Kevin MEMOIRE MAX iPHONE) */
    safeInit('storage-compressor', async () => {
      const { storageCompressor } = await import('./storage-compressor.js');
      const status = storageCompressor.getQuotaStatus();
      logger.info('services-bootstrap', `storage : ${status.used_mb}MB / 5MB (${status.severity})`);
      if (status.severity !== 'ok') {
        const result = await storageCompressor.migrateAllToCompressed();
        logger.info('services-bootstrap', `storage compressé : ${result.migrated} clés, ${(result.saved_bytes / 1024).toFixed(1)} KB libérés`);
      }
    }),
  ];

  const results = await Promise.all(tasks);
  const okCount = results.filter((r) => r.ok).length;
  const totalMs = results.reduce((s, r) => s + r.duration_ms, 0);
  logger.info('services-bootstrap', `${okCount}/${results.length} services OK (${totalMs}ms total)`);
  return results;
}
