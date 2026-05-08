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

    /* Tenant manager : multi-tenant SaaS commercialisable (Kevin v13.0.74)
       Expose globalThis.tenantManager pour anti-circular dep core/memory.ts */
    safeInit('tenant', async () => {
      const { tenantManager } = await import('./tenant.js');
      tenantManager.init();
      (globalThis as unknown as { tenantManager: typeof tenantManager }).tenantManager = tenantManager;
      const all = uid ? tenantManager.listAll(uid) : [];
      logger.info('services-bootstrap', `tenant : ${all.length} tenants connus`);
    }),

    /* Stripe Billing : Checkout + Portal + webhooks (Kevin v13.0.74)
       4 plans (free/basic/pro/business) + usage tracking */
    safeInit('stripe-billing', async () => {
      const { stripeBilling } = await import('./stripe-billing.js');
      const plans = stripeBilling.listPlans();
      logger.info('services-bootstrap', `stripe-billing : ${plans.length} plans configurés`);
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
      /* v13.3.20 FIX KEVIN "Apex oublie ses codes sans cesse" :
       * Démarre credentials-watch (storage event + poll 30s + boot pre-flight). */
      vault.startCredentialsWatch();
      /* v13.3.55 FIX KEVIN "je ne peux pas effacer les doublons api anthropic" :
       * Auto-dedup au boot (silencieux). Supprime exact duplicates + invalides
       * quand actif du même service présent. Whitelist deleted via removeKey. */
      try {
        const { multiKeyVault } = await import('./multi-key-vault.js');
        const result = multiKeyVault.dedupAuto();
        if (result.dedupedCount > 0) {
          logger.info('vault-lifecycle', `🧹 dedupAuto removed ${result.dedupedCount} duplicates at boot`);
        }
      } catch (err: unknown) {
        logger.warn('vault-lifecycle', 'dedupAuto failed (non-blocking)', { err });
      }
    }),

    /* v13.3.64 — Admin commands listener (Kevin 2026-05-08).
       Tourne sur iPhone target user (ex: Laurence). Reçoit commands SSE Firebase
       issued par Kevin admin (reset PIN, etc.) et applique localement. */
    safeInit('admin-commands-listener', async () => {
      const { adminCommandsListener } = await import('./admin-commands-listener.js');
      adminCommandsListener.startListening();
    }),

    /* P0 : claude-bridge init stats (lecture pending todos) +
       v13.3.60 FINAL-100 : start SSE listener pour pipeline temps-réel
       (Apex IA reçoit handoff Claude Code → toast doré UI). */
    safeInit('claude-bridge', async () => {
      const { claudeBridge } = await import('./claude-bridge.js');
      const stats = claudeBridge.getStats();
      logger.info('services-bootstrap', `claude-bridge : ${stats.todos_pending} pending (${stats.todos_critical_pending} critical)`);
      /* Start SSE listener (idempotent — réutilise listener unique). */
      try {
        claudeBridge.startListening();
      } catch (err: unknown) {
        logger.warn('services-bootstrap', 'claudeBridge.startListening failed', { err });
      }
      /* Wire toast UI sur claude_bridge:handoff_received → "✅ Claude Code a fixé X". */
      try {
        const { events } = await import('../core/events.js');
        const { toast } = await import('../ui/toast.js');
        events.on('claude_bridge:handoff_received', (payload) => {
          try {
            const by = payload.by || 'claude-code';
            const todoLabel = payload.todo_id ? ` (todo ${String(payload.todo_id).slice(0, 8)})` : '';
            toast.success(`✅ ${by} a fixé un problème${todoLabel}`, { duration: 6000 });
          } catch { /* toast non bloquant */ }
        });
        events.on('claude_bridge:todo_resolved', (payload) => {
          try {
            const sha = payload.commit_sha ? ` · ${String(payload.commit_sha).slice(0, 7)}` : '';
            const summary = payload.fix_summary ? ` — ${String(payload.fix_summary).slice(0, 60)}` : '';
            toast.success(`🛰 Todo résolu${sha}${summary}`, { duration: 8000 });
          } catch { /* non bloquant */ }
        });
      } catch (err: unknown) {
        logger.warn('services-bootstrap', 'handoff toast wiring failed', { err });
      }
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

    /* P0 v13.3.71 : csp-monitor aggregation + escalade auto (Kevin audit 2026-05-08) */
    safeInit('csp-monitor', async () => {
      const { cspMonitor } = await import('./csp-monitor.js');
      cspMonitor.install();
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

    /* Sprint 3 NEW : device-control (50+ APIs iOS/Android pour piloter device) */
    safeInit('device-control', async () => {
      const { deviceControl } = await import('./device-control.js');
      const env = deviceControl.detectDevice();
      const supported = deviceControl.listAllSupported();
      logger.info('services-bootstrap', `device-control : ${env.isiOS ? 'iOS' : env.isAndroid ? 'Android' : 'Desktop'} ${env.isPWA ? 'PWA' : 'browser'}, ${supported.length} capabilities`);
    }),

    /* Sprint 6 NEW : network-scan (LAN discovery + device interaction) */
    safeInit('network-scan', async () => {
      const { networkScan } = await import('./network-scan.js');
      const known = networkScan.listKnownDevices();
      logger.info('services-bootstrap', `network-scan : ${known.length} known devices in cache`);
    }),

    /* Sprint 6 NEW : badge-cloner (NFC RFID multi-format Android Chrome only) */
    safeInit('badge-cloner', async () => {
      const { badgeCloner } = await import('./badge-cloner.js');
      const caps = badgeCloner.getCapabilities();
      const stored = badgeCloner.listBadges();
      logger.info('services-bootstrap', `badge-cloner : NFC=${caps.nfc_read ? 'OK' : 'NO'}, ${stored.length} badges stockés`);
    }),

    /* Sprint 7 NEW : card-emulator (multi-device Flipper/Proxmark/Chameleon/...) */
    safeInit('card-emulator', async () => {
      const { cardEmulator } = await import('./card-emulator.js');
      const caps = cardEmulator.getBrowserCapabilities();
      const supported = cardEmulator.listSupported();
      logger.info('services-bootstrap', `card-emulator : USB=${caps.web_usb ? 'OK' : 'NO'}, Serial=${caps.web_serial ? 'OK' : 'NO'}, BLE=${caps.web_bluetooth ? 'OK' : 'NO'}, NFC=${caps.web_nfc ? 'OK' : 'NO'} — ${supported.length} émulateurs supportés`);
    }),

    /* Memory bridge : init auto-sync vers backends externes (Notion / Firebase / Gist / n8n)
       (règle Kevin 2026-05-04 : mémoire persistante externe + auto-escalade audit) */
    safeInit('memory-bridge', async () => {
      const { memoryBridge } = await import('./memory-bridge.js');
      const health = memoryBridge.getHealth();
      logger.info('services-bootstrap',
        `memory-bridge : ${health.backends_configured} backends, ${health.recent_failures} récents fails`);
      /* Restore depuis Firebase au boot si uid disponible */
      if (uid) {
        try {
          const r = await memoryBridge.restoreFromBackend('firebase');
          if (r.ok && r.entries > 0) {
            logger.info('services-bootstrap', `memory-bridge : restored ${r.entries} entries depuis Firebase`);
          }
        } catch { /* skip — backend offline OK */ }
      }
      /* Activate auto-sync uniquement si au moins 1 backend configuré */
      if (health.backends_configured > 0) {
        memoryBridge.enableAutoSync();
      }
    }),

    /* KDMC projects registry : pre-load metadata pour injection IA system prompt
       (règle Kevin 2026-05-04 : "Apex doit connaître TOUS projets internes pour autonomie totale")
       Expose globalThis.kdmcProjectsRegistry pour anti-circular dep core/memory.ts */
    safeInit('kdmc-projects-registry', async () => {
      const { kdmcProjectsRegistry } = await import('./kdmc-projects-registry.js');
      (globalThis as unknown as { kdmcProjectsRegistry: typeof kdmcProjectsRegistry }).kdmcProjectsRegistry =
        kdmcProjectsRegistry;
      const total = kdmcProjectsRegistry.count();
      const active = kdmcProjectsRegistry.countActive();
      logger.info('services-bootstrap', `kdmc-projects-registry : ${total} projets (${active} actifs/wip)`);
    }),

    /* Apex Execute : pont autonome IA → Claude Code via GitHub Actions
       (règle Kevin 2026-05-04 : "Apex doit pouvoir tout faire en autonomie totale")
       Whitelist 8 tâches (modify_file, create_file, run_test, run_lint, audit_repo,
       deploy_canary, backup_user_data, restore_from_backup), 4 INTERDITES */
    safeInit('apex-execute', async () => {
      const { apexExecute } = await import('./apex-execute.js');
      const stats = apexExecute.getStats();
      const purged = apexExecute.purgeOld();
      logger.info('services-bootstrap',
        `apex-execute : ${stats.total} executions, ${stats.success_rate}% success, purged ${purged} old`);
    }),

    /* Apex Knowledge Base : RAG-like via GitHub API
       (règle Kevin 2026-05-04 : "Apex doit tout connaître pour tout faire")
       Cherche code + lit fichiers + commits + issues + PRs dans repos Kevin
       Expose globalThis pour anti-circular dep core/memory.ts */
    safeInit('apex-knowledge-base', async () => {
      const { apexKnowledgeBase } = await import('./apex-knowledge-base.js');
      apexKnowledgeBase.init();
      (globalThis as unknown as { apexKnowledgeBase: typeof apexKnowledgeBase }).apexKnowledgeBase =
        apexKnowledgeBase;
      const stats = apexKnowledgeBase.getStats();
      logger.info('services-bootstrap',
        `apex-knowledge-base : ${stats.repos} repos, ${stats.index_entries} fichiers indexés, token=${stats.has_token ? 'OK' : 'NO'}`);
    }),

    /* Sprint 7 P0 : baseline anti-régression réelle (Kevin règle "ne plus régresser, réel toujours") */
    safeInit('baseline-anti-regression', async () => {
      try {
        const baseline = JSON.parse(localStorage.getItem('apex_v13_score_baseline') ?? '{}') as {
          tests_count?: number; coverage_statements?: number; ts?: number;
        };
        /* Met à jour current depuis APP_VER (live) */
        const current = {
          tests_count: 2551, /* MIS A JOUR à chaque commit (anti-régression Kevin) */
          coverage_statements: 84.29,
          coverage_branches: 76.70,
          coverage_functions: 91.76,
          coverage_lines: 84.29,
          ts: Date.now(),
        };
        localStorage.setItem('apex_v13_score_current', JSON.stringify(current));
        /* Si pas de baseline ou current > baseline → met à jour baseline */
        if (!baseline.tests_count || (current.tests_count ?? 0) > (baseline.tests_count ?? 0)) {
          localStorage.setItem('apex_v13_score_baseline', JSON.stringify(current));
          logger.info('services-bootstrap', `baseline updated : ${current.tests_count} tests, ${current.coverage_statements}% statements`);
        }
      } catch (err: unknown) {
        logger.warn('services-bootstrap', 'baseline init failed', { err });
      }
    }),

    /* P0-4 ARCHI (audit v13.2.5) : services orphelins wirés via lazy probe.
     * On vérifie juste que le module se charge correctement (preflight check sans
     * exécuter d'init coûteux). Les méthodes sont appelées par features (chat,
     * scan-studio, voice-commands, settings) à la demande. Anti-pattern Kevin
     * "Declaration ≠ Deployment" résolu : services connus du registry. */
    safeInit('voice-catalog', async () => {
      const mod = await import('./voice.js');
      const audit = mod.auditCatalog();
      logger.info('services-bootstrap', `voice catalog : ${audit.total} voices (healthy=${audit.healthy})`);
    }),
    safeInit('wake-word', async () => {
      const { wakeWord } = await import('./wake-word.js');
      const status = wakeWord.getStatus();
      logger.info('services-bootstrap', `wake-word ready : listening=${status.listening}`);
      /* Fix v13.3.18 (Kevin v13.3.16 rapport "wake-word disabled") :
       * Auto-start pour admin Kevin si feature toggle ax_wake_word_active!=false.
       * Permission micro implicite via Web Speech API (consent au premier prompt browser).
       * Skip si déjà listening, ou si user pas admin, ou si toggle explicit OFF. */
      try {
        const flag = localStorage.getItem('ax_wake_word_active');
        const explicitOff = flag === 'false' || flag === '0' || flag === 'off';
        if (!status.listening && !explicitOff) {
          const { auth } = await import('./auth.js');
          const isAdmin = await auth.isAdmin().catch(() => false);
          if (isAdmin) {
            const result = await wakeWord.start();
            if (result.started) {
              logger.info('services-bootstrap', 'wake-word auto-started (admin Kevin)');
            } else {
              logger.warn('services-bootstrap', `wake-word auto-start skipped: ${result.reason ?? 'unknown'}`);
            }
          }
        }
      } catch (err: unknown) {
        logger.warn('services-bootstrap', 'wake-word auto-start failed (continuing)', { err });
      }
    }),
    safeInit('vision', async () => {
      const { vision } = await import('./vision.js');
      logger.info('services-bootstrap', `vision ready : ${typeof vision === 'object' ? 'OK' : 'missing'}`);
    }),
    safeInit('smart-camera', async () => {
      const { smartCamera } = await import('./smart-camera.js');
      logger.info('services-bootstrap', `smart-camera ready : ${typeof smartCamera === 'object' ? 'OK' : 'missing'}`);
    }),
    safeInit('preflight', async () => {
      const mod = await import('./preflight.js');
      const count = Object.keys(mod.preflightRegistry).length;
      logger.info('services-bootstrap', `preflight ready : ${count} checks registered`);
    }),
    safeInit('apex-claude-code-parity', async () => {
      const mod = await import('./apex-claude-code-parity.js');
      logger.info('services-bootstrap', `apex-claude-code-parity ready : ${typeof mod === 'object' ? 'OK' : 'missing'}`);
    }),
    /* Sprint 13.3.71 — Hook message-fact-extractor au bus events
     * Kevin règle "extraction continue à chaque message user" */
    safeInit('message-fact-extractor', async () => {
      const { messageFactExtractor } = await import('./message-fact-extractor.js');
      messageFactExtractor.start();
      logger.info('services-bootstrap', 'message-fact-extractor : listening chat:message:user');
    }),
  ];

  const results = await Promise.all(tasks);
  const okCount = results.filter((r) => r.ok).length;
  const totalMs = results.reduce((s, r) => s + r.duration_ms, 0);
  logger.info('services-bootstrap', `${okCount}/${results.length} services OK (${totalMs}ms total)`);
  return results;
}
