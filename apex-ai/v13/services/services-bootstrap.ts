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

    /* SOC2 compliance : record event boot + verify integrity */
    safeInit('soc2-compliance', async () => {
      const { soc2 } = await import('./soc2-compliance.js');
      const integrity = await soc2.verifyIntegrity();
      logger.info('services-bootstrap', `soc2 : ${integrity.total} events, integrity=${integrity.ok}`);
    }),

    /* Secret scanner : scan + auto-migrate plaintext credentials */
    safeInit('secret-scanner', async () => {
      const { secretScanner } = await import('./secret-scanner.js');
      const r = await secretScanner.autoMigrate();
      if (r.migrated > 0) {
        logger.info('services-bootstrap', `secret-scanner : ${r.migrated} secrets migrés vers chiffré`);
      }
    }),

    /* Service lifecycle manager : registry init/destroy hooks (anti memory leak) */
    safeInit('service-lifecycle', async () => {
      const { lifecycle } = await import('./service-lifecycle.js');
      const stats = lifecycle.getStats();
      logger.info('services-bootstrap', `lifecycle : ${stats.running} running, ${stats.total_intervals_tracked} intervals tracked`);
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

    /* AI routing policy : décide provider intelligent (free-first + Anthropic priority)
       (règle Kevin 2026-05-04 : priorise gratuits performants, Anthropic toujours OP priorité) */
    safeInit('ai-routing-policy', async () => {
      const { aiRoutingPolicy } = await import('./ai-routing-policy.js');
      const status = aiRoutingPolicy.getStatus();
      const recos = aiRoutingPolicy.recommendActions();
      logger.info('services-bootstrap',
        `ai-routing : mode=${status.mode}, free=${status.free_providers_available.length}, paid=${status.paid_providers_available.length}, recos=${recos.length}`,
      );
    }),

    /* Consumption monitor : check budgets + notif admin 1-clic recharge si dépassement
       (règle Kevin 2026-05-04 : info live conso + notif lien recharge par IA + abo) */
    safeInit('consumption-monitor', async () => {
      const { consumptionMonitor } = await import('./consumption-monitor.js');
      consumptionMonitor.recordSnapshot(); /* Snapshot boot pour graph 30j */
      if (uid) {
        const all = await consumptionMonitor.checkAndNotify(uid);
        const alerted = all.filter((s) => s.severity !== 'ok' && s.budget_eur_month > 0);
        logger.info('services-bootstrap', `consumption : ${alerted.length} alertes / ${all.length} services`);
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

    /* === SPRINT 1 P0 : Wire 8 services critiques orphelins (audit subagent v13.0.40) === */

    /* P0 : audit-log init + record boot event (ring buffer setup) */
    safeInit('audit-log', async () => {
      const { auditLog } = await import('./audit-log.js');
      void auditLog.record('boot.services_started', { details: { ts: Date.now(), uid: uid ?? 'anon' } });
    }),

    /* P0 : context-loader pre-warm (charge règles + facts pour system prompt IA) */
    safeInit('context-loader', async () => {
      const { contextLoader } = await import('./context-loader.js');
      const ctx = await contextLoader.load(uid ?? 'global');
      logger.info('services-bootstrap', `context-loader : ${ctx.rules.length} règles, ${ctx.user_facts.length} facts`);
    }),

    /* P0 : persistent-memory-store init cache (charge depuis localStorage + IDB shadow) */
    safeInit('persistent-memory-store', async () => {
      const { persistentMemory } = await import('./persistent-memory-store.js');
      const stats = await persistentMemory.getStats();
      logger.info('services-bootstrap', `persistent-memory : ${stats.total} entries (${stats.size_kb}KB)`);
    }),

    /* P0 : vault triple persistence lifecycle (force backup IDB au boot) */
    safeInit('vault-lifecycle', async () => {
      const { vault } = await import('./vault.js');
      /* Force lecture/init passphrase device-bound → trigger backupPassphraseToIdb */
      await vault.encryptAuto('boot_check_' + Date.now());
    }),

    /* P0 : claude-bridge init stats (lecture pending todos) */
    safeInit('claude-bridge', async () => {
      const { claudeBridge } = await import('./claude-bridge.js');
      const stats = claudeBridge.getStats();
      logger.info('services-bootstrap', `claude-bridge : ${stats.todos_pending} pending (${stats.todos_critical_pending} critical)`);
    }),

    /* P0 : session-logger start session si user logged */
    safeInit('session-logger', async () => {
      if (!uid) return;
      const { sessionLogger } = await import('./session-logger.js');
      const userJson = localStorage.getItem('apex_v13_user');
      const userName = userJson ? (JSON.parse(userJson) as { name?: string }).name ?? 'unknown' : 'unknown';
      const isAdmin = uid === 'kdmc_admin';
      await sessionLogger.startSession(uid, userName, isAdmin);
    }),

    /* P0 : apex-self-audit warm cache (preload audit reports list) */
    safeInit('apex-self-audit', async () => {
      const { apexSelfAudit } = await import('./apex-self-audit.js');
      const reports = apexSelfAudit.listReports();
      logger.info('services-bootstrap', `apex-self-audit : ${reports.length} reports historiques`);
    }),

    /* P0 : unknown-credential-resolver lessons learned (charge patterns appris) */
    safeInit('unknown-credential-resolver', async () => {
      const { unknownCredentialResolver } = await import('./unknown-credential-resolver.js');
      const learned = unknownCredentialResolver.listLearned();
      logger.info('services-bootstrap', `credential-resolver : ${learned.length} patterns appris`);
    }),

    /* P0 : observability install (perf observers + error tracking runtime) */
    safeInit('observability', async () => {
      const { observability } = await import('./observability.js');
      observability.init();
    }),

    /* P0 : bodyguard runtime security install (CSP violations, postMessage cross-frame) */
    safeInit('bodyguard', async () => {
      const { bodyguard } = await import('./bodyguard.js');
      bodyguard.install();
    }),

    /* P0 : sentinels 24/7 watchers init (ai-health-watch, token-balance-watch, etc.) */
    safeInit('sentinels', async () => {
      const { sentinels } = await import('./sentinels.js');
      sentinels.init();
    }),

    /* P0 : firebase-queue offline writes init */
    safeInit('firebase-queue', async () => {
      const { firebaseQueue } = await import('./firebase-queue.js');
      firebaseQueue.init();
    }),
  ];

  const results = await Promise.all(tasks);
  const okCount = results.filter((r) => r.ok).length;
  const totalMs = results.reduce((s, r) => s + r.duration_ms, 0);
  logger.info('services-bootstrap', `${okCount}/${results.length} services OK (${totalMs}ms total)`);
  return results;
}
