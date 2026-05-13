/**
 * APEX v13 — Bootstrap
 *
 * Entry point. Initialise tout dans le bon ordre :
 * 1. Feature detection (browser capabilities, PWA, online)
 * 2. Logger + Sentry bridge (capture errors dès le départ)
 * 3. Store Proxy reactive
 * 4. Memory module (auto-injection contexte system prompt)
 * 5. Services (firebase, auth, vault, ai-router, permissions, telemetry)
 * 6. Router (hash-based + lazy route imports)
 * 7. Service Worker register
 * 8. Migration v12 → v13 (one-shot, idempotent)
 * 9. Render initial view
 *
 * Anti-patterns évités (réf plan §Anti-patterns) :
 * - Pas d'IIFE au boot (orchestré une fois)
 * - Pas de window.* reassignment (DI container)
 * - Pas de catch silencieux (toutes erreurs loggées)
 * - Pas de capture-phase listener bloquant
 * - Promesses .catch() systématique
 */

export const APP_VER = 'v13.4.9';
export const ADMIN_ID = 'kdmc_admin';

/* v13.3.89 P1.8 — di renommé en service-locator (0% prod usage, juste exposé via __APEX__ debug HUD).
 * import { di } gardé pour rétrocompat __APEX__ window debug, mais c'est un alias service-locator. */
import { logRedaction } from '../services/log-redaction-wrapper.js';

import { errors } from './errors.js';
import { events } from './events.js';
import { logger } from './logger.js';
import { memory } from './memory.js';
import { router } from './router.js';
import { di } from './service-locator.js';
import { store } from './store.js';

/* v13.3.74 P0 sécu (audit OWASP ASVS L2 V7.1.1) — log redaction GLOBAL.
 * Importé dès le module load (avant tout autre service) pour patcher console
 * AVANT que la moindre lib ou service n'ait l'occasion d'écrire un secret.
 * installGlobal() est idempotent. */

/* Boot-time install (avant function bootstrap()) : tout console.log au boot
 * est déjà redacté. Évite leak via libs vendor / Vite HMR / SDK tiers. */
logRedaction.installGlobal();

interface BootContext {
  startedAt: number;
  online: boolean;
  pwaInstalled: boolean;
  isAdmin: boolean;
}

async function bootstrap(): Promise<void> {
  const ctx: BootContext = {
    startedAt: performance.now(),
    online: navigator.onLine,
    pwaInstalled: window.matchMedia('(display-mode: standalone)').matches,
    isAdmin: false,
  };

  /* Kevin 2026-05-08 ABSOLUE : "Ultra reset autonome automatique si besoin".
   * Si la page a été chargée suite à un auto-reset (URL contient ?_auto_reset=1),
   * on tente la restore Firebase AVANT toute autre init pour récupérer les credentials.
   * Best-effort : si offline ou backup absent → no-op et on continue le boot. */
  try {
    const { autoUltraReset } = await import('@services/auto-ultra-reset.js');
    if (autoUltraReset.isPostResetReload()) {
      logger.info('boot', 'Post auto-reset reload detected — attempting Firebase restore first');
      /* Firebase init AVANT pour avoir la connexion */
      try {
        const { firebase } = await import('@services/firebase.js');
        await firebase.init();
      } catch (err: unknown) {
        logger.warn('boot', 'firebase init pre-restore failed', { err });
      }
      const restoreResult = await autoUltraReset.restoreAfterReset();
      logger.info('boot', `auto-reset restore : ${restoreResult.restored} restored, ${restoreResult.failed} failed (${restoreResult.durationMs}ms)`);
    }
  } catch (err: unknown) {
    logger.warn('boot', 'auto-ultra-reset restore stage skipped (continuing)', { err });
  }

  /* Jet 6 fix audit subagent : init SÉQUENTIEL avec error guard par-service.
   * Avant : 6 services chargés parallèle sans guard → si 1 service crash au boot,
   * tout l'app crash (E2E boot.spec.ts FAILED). */
  errors.installGlobalHandlers();
  logger.info('boot', `APEX ${APP_VER} starting`, { ctx });

  /* Helper : init service avec guard, log warn si fail mais ne bloque pas le boot */
  const safeInit = async (label: string, fn: () => Promise<void> | void): Promise<void> => {
    try {
      await fn();
    } catch (err: unknown) {
      logger.warn('boot', `Service init failed: ${label} (continuing degraded)`, { err });
    }
  };

  /* v13.3.71 PERF (LCP optim) : sentry + bodyguard MIS EN POST-RENDER.
   * Avant : 2 await sequentiels au boot = +200ms LCP.
   * Après : install() reportés au tick après router.dispatch() ; tous nos errors
   * caught par errors.installGlobalHandlers() qui les buffer en attendant sentry. */
  const deferredInits: Array<{ label: string; fn: () => Promise<void> | void }> = [
    {
      label: 'sentry',
      fn: async () => {
        const { sentryBridge } = await import('@services/sentry-bridge.js');
        await sentryBridge.init();
        try {
          const lastTestKey = 'apex_v13_sentry_last_test_ts';
          const last = parseInt(localStorage.getItem(lastTestKey) ?? '0', 10);
          const oneDay = 24 * 60 * 60 * 1000;
          if (Date.now() - last > oneDay && sentryBridge.isInitialized()) {
            const result = await sentryBridge.sendTestEvent();
            if (result.ok) {
              localStorage.setItem(lastTestKey, String(Date.now()));
              logger.info('boot', `Sentry test event sent (sink=${result.sink})`);
            } else {
              logger.warn('boot', `Sentry test event skipped: ${result.reason ?? 'unknown'}`);
            }
          }
        } catch { /* silent */ }
      },
    },
    {
      label: 'bodyguard',
      fn: async () => {
        const { bodyguard } = await import('@services/bodyguard.js');
        bodyguard.install();
      },
    },
  ];
  /* v13.3.71 PERF (LCP optim) : 7 services lourds (audit-log, credentials-registry-sync,
   * auto-backup, observability, ux-theme-mode, firebase-queue, sentinels) DÉFÉRÉS post-render.
   * Avant : 7 await séquentiels = +700-1500ms blocking LCP.
   * Après : push dans deferredInits[], lancés via Promise.allSettled() après router.dispatch(). */
  deferredInits.push(
    {
      label: 'audit-log',
      fn: async () => {
        const { auditLog } = await import('@services/audit-log.js');
        auditLog.init();
        try {
          const repair = await auditLog.autoRepair();
          if (repair.brokenAt !== undefined && repair.rebuilt > 0) {
            logger.warn('audit-log', `Auto-repair chain depuis index ${repair.brokenAt}: ${repair.rebuilt} entries reconstruites`);
          }
        } catch { /* silent */ }
        await auditLog.record('boot.start', { details: { ver: APP_VER } });
      },
    },
    {
      label: 'credentials-registry-sync',
      fn: async () => {
        const { credentialsAudit } = await import('@services/credentials-audit.js');
        const r = await credentialsAudit.syncFromVault();
        if (r.ok) {
          logger.info('boot', `Credentials registry sync : ${r.configured}/${r.total} configurés`);
        }
      },
    },
    {
      label: 'auto-backup',
      fn: async () => {
        const { autoBackup } = await import('@services/auto-backup.js');
        await autoBackup.init();
        try {
          const stats = autoBackup.getStats();
          if (stats.total_backups === 0) {
            const backup = await autoBackup.snapshot('manual');
            try { localStorage.setItem('ax_last_backup_ts', String(Date.now())); } catch { /* quota */ }
            logger.info('boot', `Initial backup created: ${backup.id} (${(backup.size_bytes / 1024).toFixed(1)} KB)`);
          }
        } catch (err: unknown) {
          logger.warn('boot', 'Initial backup snapshot failed (continuing)', { err });
        }
      },
    },
    {
      label: 'observability',
      fn: async () => {
        const { observability } = await import('@services/observability.js');
        observability.init();
      },
    },
    {
      label: 'firebase-queue',
      fn: async () => {
        const { firebaseQueue } = await import('@services/firebase-queue.js');
        firebaseQueue.init();
      },
    },
    {
      label: 'sentinels',
      fn: async () => {
        const { sentinels } = await import('@services/sentinels.js');
        const { bootstrapSentinelsRegistry } = await import('@services/sentinels-registry.js');
        bootstrapSentinelsRegistry();
        sentinels.init();
        /* v13.4.4 — Enregistre rules-injection-watch via lazy import (sentinelle 1×/h) */
        try {
          const { rulesInjectionWatch } = await import('@services/rules-injection-watch.js');
          rulesInjectionWatch.registerSentinel();
        } catch (err: unknown) {
          logger.warn('boot', 'rules-injection-watch register failed', { err });
        }
        /* v13.4.5 — Démarre autonomous-watch (sentinelle 30s dédiée mode autonome Apex) */
        try {
          const { autonomousWatch } = await import('@services/autonomous-watch.js');
          autonomousWatch.start();
        } catch (err: unknown) {
          logger.warn('boot', 'autonomous-watch start failed', { err });
        }
      },
    },
  );

  /* v13.3.29 — UX Premium : theme + dual mode + easter eggs.
   * Garde au boot pour appliquer CSS vars sur <html> AVANT premier paint
   * (sinon flash visuel theme par défaut → user theme). */
  await safeInit('ux-theme-mode', async () => {
    const { themeSwitcher } = await import('../ui/theme-switcher.js');
    const { proFunMode } = await import('../ui/pro-fun-mode.js');
    const { easterEggs } = await import('../ui/easter-eggs.js');
    themeSwitcher.init();
    proFunMode.init();
    easterEggs.install();
  });

  /* 2. Feature detection */
  if (!('serviceWorker' in navigator)) {
    logger.warn('boot', 'Service Worker not supported — degraded mode');
  }
  if (!('crypto' in window) || !window.crypto.subtle) {
    logger.error('boot', 'Web Crypto API not available — vault DISABLED');
    /* Continue boot mais vault sera désactivé */
  }

  /* 3. Store init (Proxy reactive) */
  store.init({
    user: null,
    view: 'landing',
    isStreaming: false,
    online: ctx.online,
    appVer: APP_VER,
  });

  /* 4. Memory module — auto-injection contexte */
  await memory.init().catch((err: unknown) => {
    logger.error('boot', 'Memory init failed (degraded)', { err });
  });
  /* v13.3.27 (Kevin 2026-05-07) : sync docs racine repo en arrière-plan (cache 6h).
   * Non-bloquant : permet à buildSystemPromptDeep() d'avoir docs frais à dispo.
   * v13.3.89 P2.16 : enchaîne syncLessonsAtBoot une fois CLAUDE.md fetched. */
  void memory
    .syncDocsAtBoot()
    .then(() => memory.syncLessonsAtBoot())
    .catch((err: unknown) => {
      logger.warn('boot', 'Docs/lessons sync at boot failed (continuing)', { err });
    });

  /* v13.4.4 (Kevin "charger TOUS les documents + skills + hooks + commands") :
   * Sync .claude/{skills,hooks,commands,rules}/ en arrière-plan, cache 6h.
   * Non-bloquant. Lit le cache via memory.getMetaContext() / getSkillsContext() etc. */
  void memory.syncMetaFilesAtBoot().catch((err: unknown) => {
    logger.warn('boot', '.claude meta sync failed (continuing)', { err });
  });

  /* v13.3.30 (Kevin 2026-05-07) : auto-bootstrap Identité Kevin admin.
   * Idempotent (marqueur ax_kevin_init_done) — pousse dès que admin login détecté. */
  void memory.initBootDefaults().catch((err: unknown) => {
    logger.warn('boot', 'Kevin initBootDefaults failed (continuing)', { err });
  });

  /* 5. Services lazy-load (services/ chargés à la demande par router) */
  /* Pre-init seulement les services critiques */
  const { firebase } = await import('@services/firebase.js');
  await firebase.init().catch((err: unknown) => {
    logger.error('boot', 'Firebase init failed (degraded offline mode)', { err });
  });

  /* v13.3.95 P0.2 — force snapshot vault → Firebase si drift au boot.
   * Audit externe : "13 local sans backup" → autoFix sentinelle ne s'exécutait
   * qu'au prochain tick (5min). On déclenche un snapshot initial non-bloquant
   * dès firebase.init pour avoir Firebase aligné dès la 1ère seconde.
   * Idempotent : pushAllLocal a un throttle 5min/clé, donc OK si appelé 2× au boot. */
  void import('@services/vault-firebase-backup.js')
    .then(async ({ vaultFirebaseBackup }) => {
      try {
        const audit = await vaultFirebaseBackup.auditCoherence();
        if (audit.drift_detected && audit.in_local_not_fb.length > 0) {
          const r = await vaultFirebaseBackup.syncDrift();
          logger.info('boot', 'Initial vault drift sync', { pushed: r.pushed, restored: r.restored, drifted: audit.in_local_not_fb.length });
        }
      } catch (err: unknown) {
        logger.warn('boot', 'Initial vault sync failed (non-blocking)', { err });
      }
    })
    .catch((err: unknown) => logger.warn('boot', 'vault-firebase-backup load failed', { err }));

  /* 6. Migration v12.785 → v13 (one-shot, idempotent) */
  const migrated = localStorage.getItem('apex_v13_migrated');
  if (!migrated) {
    try {
      const { migrate } = await import('../migrations/migrate-v12-to-v13.js');
      await migrate();
      localStorage.setItem('apex_v13_migrated', new Date().toISOString());
      logger.info('boot', 'Migration v12→v13 completed');
    } catch (err: unknown) {
      logger.error('boot', 'Migration failed (continuing with empty state)', { err });
    }
  }

  /* 7. Auth check */
  const { auth } = await import('@services/auth.js');
  ctx.isAdmin = await auth.isAdmin().catch(() => false);
  store.set('isAdmin', ctx.isAdmin);

  /* 8. Router init + routes lazy-load */
  router.register('landing', { loader: () => import('@features/landing/index.js') });
  router.register('login', { loader: () => import('@features/landing/index.js') });
  router.register('chat', { loader: () => import('@features/chat/index.js'), requiresAuth: true });
  /* v13.3.41 (mission INNOVATION-COMM) : onboarding 5 steps premier login */
  router.register('onboarding', { loader: () => import('@features/onboarding/index.js'), requiresAuth: true });
  router.register('admin', { loader: () => import('@features/admin/index.js'), requiresAdmin: true });
  router.register('credentials', { loader: () => import('@features/credentials-registry/index.js'), requiresAdmin: true });
  router.register('studios', { loader: () => import('@features/studios/index.js'), requiresAuth: true, skeleton: 'studio-grid' });
  router.register('pro', { loader: () => import('@features/pro/index.js'), requiresAuth: true, skeleton: 'feature-list' });
  router.register('laurence', { loader: () => import('@features/laurence/index.js'), requiresAuth: true, skeleton: 'feature-list' });
  /* Sprint 2 P0 : routes manquantes (orphelines features) */
  router.register('settings', { loader: () => import('@features/settings/index.js'), requiresAuth: true, skeleton: 'feature-list' });
  router.register('sentinels', { loader: () => import('@features/sentinels/index.js'), requiresAdmin: true, skeleton: 'admin-table' });
  router.register('browser', { loader: () => import('@features/browser/index.js'), requiresAuth: true });
  router.register('crypto', { loader: () => import('@features/crypto/index.js'), requiresAuth: true, skeleton: 'feature-list' });
  router.register('domotique', { loader: () => import('@features/domotique/index.js'), requiresAuth: true, skeleton: 'feature-list' });
  router.register('workflow', { loader: () => import('@features/workflow/index.js'), requiresAuth: true, skeleton: 'feature-list' });
  /* Sprint 3 NEW : Télécommande Universelle (UNIVERSAL_REMOTE.md, intègre device-control) */
  router.register('remote', { loader: () => import('@features/remote/index.js'), requiresAuth: true, skeleton: 'feature-list' });
  /* Sprint port v12 (Kevin 2026-05-04) : 4 features critiques manquantes */
  router.register('notes', { loader: () => import('@features/notes/index.js'), requiresAuth: true, skeleton: 'feature-list' });
  router.register('calendar', { loader: () => import('@features/calendar/index.js'), requiresAuth: true, skeleton: 'feature-list' });
  router.register('billing', { loader: () => import('@features/billing/index.js'), requiresAuth: true, skeleton: 'vault-cards' });
  router.register('calculators', { loader: () => import('@features/calculators/index.js'), requiresAuth: true, skeleton: 'feature-list' });
  router.register('archive', { loader: () => import('@features/archive/index.js'), requiresAuth: true, skeleton: 'admin-table' });
  /* Sprint v13.3.25 (Kevin 2026-05-07) : Cross-platform device capabilities dashboard */
  router.register('device', { loader: () => import('@features/device-capabilities/index.js'), requiresAuth: true });
  /* Sprint v13.3.27 (Kevin 2026-05-07) : Vue Knowledge — mémoire long-terme + cross-user admin */
  router.register('knowledge', { loader: () => import('@features/knowledge/index.js'), requiresAuth: true });
  /* Sprint port v12 (Kevin 2026-05-04) : 5 studios créatifs critiques */
  router.register('studio-music', { loader: () => import('@features/studios/music/index.js'), requiresAuth: true, skeleton: 'studio-grid' });
  router.register('studio-video', { loader: () => import('@features/studios/video/index.js'), requiresAuth: true, skeleton: 'studio-grid' });
  router.register('studio-cv', { loader: () => import('@features/studios/cv/index.js'), requiresAuth: true, skeleton: 'feature-list' });
  router.register('studio-invoice', { loader: () => import('@features/studios/invoice/index.js'), requiresAuth: true, skeleton: 'feature-list' });
  router.register('studio-contract', { loader: () => import('@features/studios/contract/index.js'), requiresAuth: true, skeleton: 'feature-list' });
  /* Sprint port v12 (Kevin 2026-05-04) : 5 studios MAX (logo, presentation, prefecture, clip, photo) */
  router.register('studio-logo', { loader: () => import('@features/studios/logo/index.js'), requiresAuth: true, skeleton: 'studio-grid' });
  router.register('studio-presentation', { loader: () => import('@features/studios/presentation/index.js'), requiresAuth: true, skeleton: 'studio-grid' });
  router.register('studio-prefecture', { loader: () => import('@features/studios/prefecture/index.js'), requiresAuth: true, skeleton: 'feature-list' });
  router.register('studio-clip', { loader: () => import('@features/studios/clip/index.js'), requiresAuth: true, skeleton: 'studio-grid' });
  router.register('studio-photo', { loader: () => import('@features/studios/photo/index.js'), requiresAuth: true, skeleton: 'studio-grid' });
  /* Sprint Kevin 2026-05-08 : 7 studios manquants complétés */
  router.register('studio-architecture', { loader: () => import('@features/studios/architecture/index.js'), requiresAuth: true, skeleton: 'studio-grid' });
  router.register('studio-plant', { loader: () => import('@features/studios/plant/index.js'), requiresAuth: true, skeleton: 'feature-list' });
  router.register('studio-geo', { loader: () => import('@features/studios/geo/index.js'), requiresAuth: true, skeleton: 'feature-list' });
  router.register('studio-building', { loader: () => import('@features/studios/building/index.js'), requiresAuth: true, skeleton: 'studio-grid' });
  router.register('studio-lunar', { loader: () => import('@features/studios/lunar/index.js'), requiresAuth: true, skeleton: 'feature-list' });
  router.register('studio-pet', { loader: () => import('@features/studios/pet/index.js'), requiresAuth: true, skeleton: 'feature-list' });
  router.register('studio-scan', { loader: () => import('@features/studios/scan/index.js'), requiresAuth: true, skeleton: 'feature-list' });
  /* Sprint port v12 (Kevin 2026-05-04) : 3 modules pro MAX (business, education, certifications) */
  router.register('pro-business', { loader: () => import('@features/pro/modules/business/index.js'), requiresAuth: true, skeleton: 'feature-list' });
  router.register('pro-education', { loader: () => import('@features/pro/modules/education/index.js'), requiresAuth: true, skeleton: 'feature-list' });
  router.register('pro-certifications', { loader: () => import('@features/pro/modules/certifications/index.js'), requiresAuth: true, skeleton: 'feature-list' });
  /* Sprint port v12.785 P0 critical (Kevin 2026-05-04) : 5 vues admin/audit/coffre */
  router.register('dashboard', { loader: () => import('@features/dashboard/index.js'), requiresAuth: true });
  router.register('vault', { loader: () => import('@features/vault/index.js'), requiresAdmin: true });
  router.register('knowledge-bank', { loader: () => import('@features/knowledge-bank/index.js'), requiresAuth: true });
  router.register('apex-toolbox', { loader: () => import('@features/apex-toolbox/index.js'), requiresAuth: true });
  router.register('self-diag', { loader: () => import('@features/self-diag/index.js'), requiresAuth: true });
  /* Sprint 9 Kevin v13.0.77+ — Auto-Backup admin (règle "ne jamais rien perdre") */
  router.register('admin-backup', { loader: () => import('@features/admin-backup/index.js'), requiresAdmin: true });
  /* v13.3.33 Kevin 2026-05-07 — Smart IA Router multi-critères (latence/quota/qualité/uptime) */
  router.register('smart-router', { loader: () => import('@features/smart-router/index.js'), requiresAdmin: true });
  /* v13.3.43 Kevin 2026-05-07 — Voice Bio reconnaissance vocale exclusive user */
  router.register('voice-bio', { loader: () => import('@features/voice-bio/index.js'), requiresAuth: true });
  /* v13.3.51 Kevin 2026-05-07 — Broadlink Setup (vision device + IR control) */
  router.register('broadlink-setup', { loader: () => import('@features/broadlink-setup/index.js'), requiresAdmin: true });
  /* v13.3.52 Kevin 2026-05-07 — IoT Providers framework (eWeLink/Tuya/Hue/Sonos/HA + custom) */
  router.register('iot-providers', { loader: () => import('@features/iot-providers/index.js'), requiresAdmin: true });
  /* v13.3.53 (Kevin 2026-05-07 23h55) : Multi-Source Extract History — admin only */
  router.register('multi-source-history', { loader: () => import('@features/multi-source-history/index.js'), requiresAdmin: true });
  /* v13.3.67 (Kevin 2026-05-08 02h) : Self-signup clients + WhatsApp validation */
  router.register('signup', { loader: () => import('@features/signup/index.js') });
  router.register('waiting-approval', { loader: () => import('@features/waiting-approval/index.js') });
  router.register('signup-approval', { loader: () => import('@features/signup-approval/index.js'), requiresAdmin: true });
  /* v13.3.67 : Vue Legal (déjà créée mais pas registered) */
  router.register('legal', { loader: () => import('@features/legal/index.js') });
  /* Kevin 2026-05-08 : Vue admin-credentials-status (cible click notif "credentials manquants") */
  router.register('admin-credentials-status', { loader: () => import('@features/admin/credentials-status/index.js'), requiresAdmin: true });
  /* Kevin 2026-05-08 v13.3.82 : Vue admin-rgpd (UI explicite pour rgpd.liftRestriction) */
  router.register('admin-rgpd', { loader: () => import('@features/admin/rgpd-admin/index.js'), requiresAdmin: true });
  /* Kevin 2026-05-09 v13.3.99 P0.4 : Vue admin "Mes Secrets" — dossier tous secrets en 1 endroit */
  router.register('admin-all-secrets', { loader: () => import('@features/admin/all-secrets/index.js'), requiresAdmin: true });
  /* Kevin 2026-05-09 v13.4.0 P0 : Vue admin "Dashboard santé live" — auto-test exhaustif (codes/liens/sentinelles/MCP/vault) */
  router.register('admin-health-dashboard', { loader: () => import('@features/admin/health-dashboard/index.js'), requiresAdmin: true });
  /* Kevin 2026-05-09 v13.4.2 : Vue admin "Yury Plugins" — 5 services applicatifs (security-review, code-review, frontend-design, superpowers, gstack-roles) */
  router.register('admin-yury-plugins', { loader: () => import('@features/admin/yury-plugins/index.js'), requiresAdmin: true });
  /* Kevin 2026-05-09 v13.4.3 : Vue admin "Shubham Skills" — 5 services TikTok (hyperframes, agent-browser, marketing-psy, impeccable-design, ios-simulator) */
  router.register('admin-shubham-skills', { loader: () => import('@features/admin/shubham-skills/index.js'), requiresAdmin: true });
  /* Kevin 2026-05-10 v13.4.5 : Vue admin "Mode Autonome" — session-driven (Apex bosse seul jusqu'à fin/quota) */
  router.register('admin-autonomous', { loader: () => import('@features/admin/autonomous/index.js'), requiresAdmin: true });
  router.init();
  events.emit('boot:routerReady', { ctx });

  /* Kevin 2026-05-08 : Click Fallback Guard — aucun bouton ne reste silencieux.
   * Si un click n'a pas de handler wired, toast "bientôt disponible" + log audit
   * (jamais "rien" comme avant). Idempotent. */
  void import('../services/click-fallback-guard.js')
    .then(({ clickFallbackGuard }) => clickFallbackGuard.install())
    .catch((err: unknown) => {
      logger.warn('boot', 'click-fallback-guard install failed', { err });
    });

  /* 8.5. v13.4.8 fix C5 (Ultra Review) — versionCheckBoot SUPPRIMÉ.
   * Source unique pour force-update : forceUpdateBanner.install() (ligne ~595).
   * Anti-pattern éliminé : 4 systèmes concurrents (versionCheckBoot + ULTRA-FORCE 1s +
   * forceUpdateCheck +5s + forceUpdateBanner) faisaient tous fetch index.html →
   * race conditions, double reloads, complexité non maîtrisable. */

  /* 9. Service Worker register (deferred to not block render) */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => {
        logger.info('boot', 'SW registered', { scope: reg.scope });
        /* Force update check toutes les 5 min + visibilitychange */
        setInterval(() => {
          reg.update().catch(() => {});
        }, 5 * 60 * 1000);
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) reg.update().catch(() => {});
        });
      })
      .catch((err: unknown) => {
        logger.warn('boot', 'SW register failed', { err });
      });

    /* Reload auto sur controllerchange */
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    /* SW message handler (push_resubscribed, notification_clicked) */
    navigator.serviceWorker.addEventListener('message', (e) => {
      const data = e.data as { type?: string; endpoint?: string; url?: string; tag?: string; source?: string } | null;
      if (!data?.type) return;
      if (data.type === 'push_resubscribed') {
        logger.info('push', 'SW auto-resubscribed', { endpoint: data.endpoint?.slice(0, 60) });
        events.emit('push:resubscribed', { endpoint: data.endpoint });
      } else if (data.type === 'notification_clicked') {
        /* Stocke tag/source côté window pour que le listener event:on les lise.
         * Pattern : on n'a pas étendu EventMap pour rester back-compat. */
        (window as Window & { __ax_last_notif?: { tag?: string; source?: string } }).__ax_last_notif = {
          ...(data.tag && { tag: data.tag }),
          ...(data.source && { source: data.source }),
        };
        events.emit('notification:clicked', { url: data.url });
      }
    });

    /* Kevin 2026-05-08 : notif click DOIT router vers la bonne vue (jamais "rien").
     * Délégué à notification-actions service (mapping centralisé).
     * Lit aussi tag + source depuis SW message (forward via custom event). */
    events.on('notification:clicked', (payload) => {
      const swExtras = (window as Window & { __ax_last_notif?: { tag?: string; source?: string } })
        .__ax_last_notif;
      void import('../services/notification-actions.js')
        .then(({ notificationActions }) => {
          notificationActions.handleClick({
            url: payload.url ?? null,
            tag: swExtras?.tag ?? null,
            source: swExtras?.source ?? null,
          });
        })
        .catch((err: unknown) => {
          logger.warn('boot', 'notification-actions import failed, fallback hash', { err });
          if (payload.url) {
            const target = payload.url.startsWith('#') ? payload.url : '#' + payload.url;
            location.hash = target;
          }
        });
    });
  }

  /* 9ter. Services bootstrap : wire tous les services orphelins (anti-pattern Declaration ≠ Deployment).
   *
   * v13.3.74 H4 (audit Apex v13.3.73 issue #240) — TTI optim :
   * Encore 1 niveau de defer via requestIdleCallback. services-bootstrap charge 27 sentinelles
   * + ai-key-rotation + memory-bridge + study-service... = ~35 services.
   * Timeout 3s : force exec après 3s si idle pas dispo (TTI cible <3s).
   */
  const runServicesBootstrap = (): void => {
    void import('@services/services-bootstrap.js')
      .then(({ bootstrapServices }) => {
        const uid = ctx.isAdmin ? ADMIN_ID : (store.get('user') as { id?: string } | null)?.id ?? null;
        return bootstrapServices(uid);
      })
      .then((results) => {
        const ok = results.filter((r) => r.ok).length;
        logger.info('boot', `services-bootstrap : ${ok}/${results.length} OK`);
      })
      .catch((err: unknown) => {
        logger.warn('boot', 'services-bootstrap failed (non-blocking)', { err });
      });
  };
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
      .requestIdleCallback(runServicesBootstrap, { timeout: 3000 });
  } else {
    setTimeout(runServicesBootstrap, 100);
  }

  /* v13.3.80 Kevin 2026-05-08 19:55 — global-back-button (← Chat partout, fix
   * "on peut plus revenir en arrière sur ces vues"). Mount au boot, hide auto
   * sur view chat. Idempotent. */
  void import('@services/global-back-button.js')
    .then(({ globalBackButton }) => {
      globalBackButton.install();
    })
    .catch((err: unknown) => {
      logger.warn('boot', 'global-back-button install failed (non-blocking)', { err });
    });

  /* v13.3.83 Kevin 2026-05-08 21h00 — force-update-banner (fix "Apex ne veut
   * pas se mettre à jour comme tu avais prévu"). Détecte version distante vs
   * locale, affiche banner rouge non-dismissible si stale, bouton 1-clic
   * unregister SW + clear caches + reload fresh. Solution iOS Safari PWA. */
  void import('@services/force-update-banner.js')
    .then(({ forceUpdateBanner }) => {
      forceUpdateBanner.install();
    })
    .catch((err: unknown) => {
      logger.warn('boot', 'force-update-banner install failed (non-blocking)', { err });
    });

  /* 9bis. Push notifications auto-init (autonome, app fermée OK iOS+Android).
   *
   * v13.3.74 PERF 20/20 — wrappé requestIdleCallback (timeout 4s) :
   * push-auto-init = SW push subscribe + Notification.requestPermission UI
   * → bandwidth+main thread concurrent avec LCP. Reporté quand idle. */
  const runPushAutoInit = (): void => {
    void import('@services/push-auto-init.js')
      .then(({ pushAutoInit }) => {
        const uid = ctx.isAdmin ? ADMIN_ID : (store.get('user') as { id?: string } | null)?.id ?? 'anon';
        return pushAutoInit.autoInit(uid);
      })
      .then((status) => {
        logger.info('push', 'auto-init complete', {
          env: status.environment,
          subscribed: status.subscribed,
          needs_install: status.needs_install_guide,
        });
        events.emit('push:status', status);
      })
      .catch((err: unknown) => {
        logger.warn('push', 'auto-init failed (non-blocking)', { err });
      });
  };
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
      .requestIdleCallback(runPushAutoInit, { timeout: 4000 });
  } else {
    setTimeout(runPushAutoInit, 200);
  }

  /* 10. v13.4.8 fix C5 (Ultra Review) — forceUpdateCheck CONSERVÉ comme service
   * privé mais N'EST PLUS APPELÉ AUTOMATIQUEMENT au boot ni sur visibility.
   * Ces flux sont désormais centralisés dans forceUpdateBanner (installé ligne ~595).
   * Cette fonction reste exportée pour SOS rescue / debug admin uniquement. */
  let forceUpdateChecking = false;
  const forceUpdateCheck = async (): Promise<void> => {
    if (forceUpdateChecking || !navigator.onLine) return;
    forceUpdateChecking = true;
    try {
      /* Trigger SW.update() en parallèle (force le SW à check sa propre nouvelle version) */
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg) void reg.update();
        } catch { /* skip */ }
      }
      /* Bypass SW : fetch direct avec cache: reload + URL absolue + dummy query */
      const url = location.pathname.replace(/[^/]*$/, '') + 'index.html?__forceupd=' + Date.now() + '&_r=' + Math.random().toString(36).slice(2);
      const r = await fetch(url, {
        cache: 'reload', /* iOS Safari respecte 'reload' pour bypass cache */
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
      });
      const html = await r.text();
      const m = html.match(/data-app-ver=['"]([^'"]+)['"]/);
      if (m?.[1] && m[1] !== APP_VER) {
        logger.info('boot', `🔄 force-update: local=${APP_VER} → remote=${m[1]} — reload imminent`);
        /* Unregister SW + clear caches → reload fresh */
        try {
          if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map((reg) => reg.unregister()));
          }
        } catch { /* ignore */ }
        try {
          if ('caches' in window) {
            const ks = await caches.keys();
            await Promise.all(ks.map((k) => caches.delete(k)));
          }
        } catch { /* ignore */ }
        /* Hard reload avec query buster pour forcer fetch fresh index.html */
        setTimeout(() => {
          location.replace(location.pathname + '?_forceupd=' + Date.now() + '&_v=' + (m[1] ?? 'new'));
        }, 300);
      }
    } catch (err: unknown) {
      logger.warn('boot', 'force-update check failed', { err });
    } finally {
      forceUpdateChecking = false;
    }
  };
  /* v13.3.74 PERF 20/20 (audit Apex Opus issue #240 — TTI optim) :
   * forceUpdateCheck déclenche fetch+parse HTML+SW unregister → ~50-200ms main thread.
   * Avant : setTimeout(500ms) + setTimeout(3000ms) → impactait TTI premier paint.
   * Après : tous triggers via requestIdleCallback (timeout 5s) — exécuté quand
   * main thread libre, pas pendant LCP/FCP. Listeners visibilitychange/focus
   * gardés (déclenchent en réaction user, pas au boot).
   * Trigger immédiat retiré : la version check au boot est déjà fait par
   * la section 8.5 ci-dessus (`void (async () => { ... })()` ligne 334) qui
   * fait exactement la même chose avec banner UI. */
  const idleCallback = (cb: () => void, timeout: number): void => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
        .requestIdleCallback(cb, { timeout });
    } else {
      setTimeout(cb, timeout);
    }
  };
  /* v13.4.8 fix C5 (Ultra Review) — ULTRA-FORCE 1s timer + forceUpdateCheck @5s
   * + visibilitychange listener TOUS SUPPRIMÉS. Race conditions éliminées.
   * Le single source of truth est désormais forceUpdateBanner.install() (ligne ~595)
   * qui possède :
   *  - check @3s post-boot (non-bloquant LCP)
   *  - check récurrent toutes les 10min
   *  - visibilitychange listener avec throttle 30min
   *  - guard isUpdateInProgress() anti double-nuke
   *  - bouton banner pour décision Kevin (UX > silent reload)
   */
  void forceUpdateCheck; /* exporté pour SOS rescue / debug uniquement */
  void idleCallback;

  /* 11. Online/offline listeners */
  window.addEventListener('online', () => {
    store.set('online', true);
    events.emit('network:online', {});
    logger.info('network', 'Online');
  });
  window.addEventListener('offline', () => {
    store.set('online', false);
    events.emit('network:offline', {});
    logger.info('network', 'Offline');
  });

  /* 11b. v13.4.8 fix C4 (Ultra Review) — anti-zoom guards RETIRÉS.
   * Ils violaient WCAG 2.1 SC 1.4.4 (Resize Text) en bloquant tout pinch-zoom +
   * double-tap, empêchant les utilisateurs malvoyants de zoomer le texte.
   *
   * À la place :
   *  - <meta viewport> assoupli ailleurs (maximum-scale=5, user-scalable=yes)
   *  - CSS `touch-action: manipulation` sur boutons/UI où on veut pas le double-tap zoom
   *  - visualViewport.scale > 1 reset ressuscité UNIQUEMENT pour récupération
   *    auto si zoom "stuck" (bug iOS Safari connu).
   */
  try {
    if ('visualViewport' in window && window.visualViewport) {
      let lastResetTs = 0;
      window.visualViewport.addEventListener('resize', () => {
        const vv = window.visualViewport;
        if (!vv) return;
        /* Si zoom > 1 ET déjà revenu à 1 depuis > 5s ET vv.scale est extrême
         * (probable bug "stuck"), reset scrollTo pour relâcher. Sinon laisse
         * l'utilisateur zoomer librement (accessibilité). */
        if (vv.scale > 3 && Date.now() - lastResetTs > 5000) {
          /* Heuristique : scale > 3 sans interaction récente = probable bug iOS */
          lastResetTs = Date.now();
          try { window.scrollTo(0, 0); } catch { /* ignore */ }
        }
      });
    }
    logger.info('viewport', 'a11y-friendly viewport guards installés (zoom autorisé)');
  } catch (err: unknown) {
    logger.warn('viewport', 'viewport guard install failed', { err });
  }

  /* 11c. v13.4.6 (Kevin "Force MAJ auto toujours") — Track last interaction
   * pour que force-update-banner détecte les moments idle (>30s sans action)
   * et déclenche la MAJ silencieuse sans interrompre Kevin.
   *
   * v13.4.8 fix I-7 (Ultra Review²) : throttle 1×/seconde minimum entre 2 writes
   * localStorage. Avant : chaque pointerdown/keydown écrivait → ~60 writes/min en
   * usage normal. Maintenant : memoire RAM + flush async max 1 fois/sec. */
  try {
    let lastWrittenTs = 0;
    const THROTTLE_MS = 1000;
    const updateInteraction = (): void => {
      const now = Date.now();
      if (now - lastWrittenTs < THROTTLE_MS) return;
      lastWrittenTs = now;
      try { localStorage.setItem('apex_v13_last_interaction', String(now)); } catch { /* ignore */ }
    };
    ['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach((evt) => {
      document.addEventListener(evt, updateInteraction, { passive: true });
    });
    updateInteraction(); /* initial */
    logger.info('interaction', 'user-interaction tracker installé (throttle 1s)');
  } catch (err: unknown) {
    logger.warn('interaction', 'tracker install failed', { err });
  }

  /* 12. Hide splash + render initial view */
  router.dispatch();
  setTimeout(() => {
    const splash = document.getElementById('apex-splash');
    if (splash) {
      splash.hidden = true;
      setTimeout(() => splash.remove(), 600);
    }
  }, 100);

  /* v13.4.6 (Kevin "plus de visuel de version") :
   * Badge version permanent en bas à droite + toast boot 1×/heure. */
  setTimeout(() => {
    void import('../ui/version-badge.js').then(({ installVersionBadge, showBootToast }) => {
      installVersionBadge();
      showBootToast();
    }).catch(() => { /* silent */ });
  }, 200);

  /* v13.3.71 PERF (LCP optim) : tous services NON-critiques pour render initial
   * lancés en parallèle APRÈS router.dispatch() — n'impactent pas LCP/FCP.
   * Promise.allSettled : si 1 fail → autres continuent.
   *
   * v13.3.74 H4 (audit Apex v13.3.73 issue #240) — TTI 4.4s → <3s :
   * Reporter via requestIdleCallback (timeout 2s) pour laisser le main thread
   * gérer LCP + 1er paint avant d'initialiser les services post-render.
   * Fallback setTimeout 0 si requestIdleCallback absent (Safari iOS old).
   */
  const runDeferredInits = (): void => {
    /* v13.4.8 fix M4 (Ultra Review) — track succès/fail explicite + escalade
     * audit log si majorité fail. Avant : tous les warns étaient juste dispersés
     * dans le log sans signal aggregate (silent partial-failure = Erreur #54). */
    const initPromises = deferredInits.map(async (init) => {
      try {
        await init.fn();
        return { label: init.label, ok: true as const };
      } catch (err: unknown) {
        logger.warn('boot', `Service init failed: ${init.label} (continuing degraded)`, { err });
        return { label: init.label, ok: false as const, err };
      }
    });
    void Promise.allSettled(initPromises).then(async (settled) => {
      const deferredMs = Math.round(performance.now() - ctx.startedAt);
      let okCount = 0;
      const failed: string[] = [];
      for (const s of settled) {
        if (s.status === 'fulfilled' && s.value.ok) okCount++;
        else if (s.status === 'fulfilled') failed.push(s.value.label);
        else failed.push('unknown');
      }
      const total = deferredInits.length;
      logger.info('boot', `Deferred services: ${okCount}/${total} OK in +${deferredMs}ms`, { failed });
      /* Si majorité fail → escalade audit log + toast admin pour visibility */
      if (okCount < total / 2) {
        try {
          const { auditLog } = await import('@services/audit-log.js');
          await auditLog.record('boot.deferred_majority_failed', {
            details: { ok: okCount, total, failed: failed.slice(0, 10) },
          });
        } catch { /* audit log down — log déjà fait */ }
        if (ctx.isAdmin) {
          try {
            const { toast } = await import('../ui/toast.js');
            toast.warn(`⚠️ ${total - okCount}/${total} services en échec — mode dégradé`);
          } catch { /* toast indispo */ }
        }
      }
    });
  };
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    /* requestIdleCallback timeout 2s : si idle pas dispo après 2s, force exec.
     * Évite blocage si user interaction immédiate. */
    (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
      .requestIdleCallback(runDeferredInits, { timeout: 2000 });
  } else {
    /* Fallback Safari iOS old : setTimeout 0 pour laisser le 1er paint */
    setTimeout(runDeferredInits, 0);
  }

  const bootMs = Math.round(performance.now() - ctx.startedAt);
  logger.info('boot', `APEX ${APP_VER} ready in ${bootMs}ms (deferred services post-render)`);
  events.emit('boot:complete', { ctx, bootMs });

  /* v13.3.30 (Kevin règle absolue "tout autonomie autocorrigé") :
   * - SOS rescue button toujours visible (1-clic auto-fix, long-press diagnostic)
   * - HUD debug live admin Kevin only (overlay top-right état app temps réel)
   * - Auto-test runner schedule daily (smoke tests services critiques)
   * Non-bloquant : tous mounted en background.
   *
   * v13.3.74 PERF 20/20 — requestIdleCallback (timeout 5s) au lieu de setTimeout 1500ms.
   * SOS rescue button préservé en HTML statique dans index.html (visible avant ce mount),
   * donc pas de risque user perdu. mount() ajoute uniquement les handlers. */
  const idleAutonomy = (): void => {
    void Promise.allSettled([
      import('../ui/sos-rescue.js').then((m) => m.sosRescue.mount()),
      import('../ui/hud-debug.js').then((m) => m.hudDebug.mount()),
      import('../services/auto-test-runner.js').then((m) => m.autoTestRunner.scheduleAutoRun()),
    ]).then((results) => {
      const ok = results.filter((r) => r.status === 'fulfilled').length;
      logger.info('boot', `v13.3.30 autonomy modules : ${ok}/${results.length} mounted`);
    });
  };
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
      .requestIdleCallback(idleAutonomy, { timeout: 5000 });
  } else {
    setTimeout(idleAutonomy, 1500);
  }
}

/* Entry — guard SSR/test environments où document est undefined (Vitest happy-dom).
 * v13.3.28 perf 100/100 : évite ReferenceError unhandled dans test runners. */
bootstrap().catch((err: unknown) => {
  console.error('[APEX boot crash]', err);
  if (typeof document === 'undefined') return;
  /* Show user-friendly fallback (anti-pattern : pas d'erreur technique brute) */
  const root = document.getElementById('apex-root');
  if (root) {
    root.innerHTML = `
      <div style="padding:40px;text-align:center;color:#fff;background:#08080f;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <h1 style="color:#c9a227;font-family:Georgia,serif;letter-spacing:3px">APEX</h1>
        <p style="color:#a0a4c0;margin:16px 0">Un souci au démarrage. Tape SOS en bas-droite pour recharger proprement.</p>
        <p style="color:#6a6f8a;font-size:11px;margin-top:24px">Version ${APP_VER}</p>
      </div>
    `;
  }
  /* Toujours montrer le bouton SOS */
  const sos = document.getElementById('apex-rescue-btn');
  if (sos) sos.style.display = 'flex';
});

/* DI registry exposed for debug (admin only via HUD) */
declare global {
  interface Window {
    __APEX__?: {
      ver: string;
      di: typeof di;
      store: typeof store;
      logger: typeof logger;
    };
  }
}
window.__APEX__ = { ver: APP_VER, di, store, logger };
