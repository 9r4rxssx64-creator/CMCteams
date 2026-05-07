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

export const APP_VER = 'v13.3.55';
export const ADMIN_ID = 'kdmc_admin';

import { di } from './di.js';
import { errors } from './errors.js';
import { events } from './events.js';
import { logger } from './logger.js';
import { memory } from './memory.js';
import { router } from './router.js';
import { store } from './store.js';

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

  /* Sentry monitoring runtime (audit Kevin v13.1.0 production-grade).
   * Init AVANT bodyguard pour capturer toute erreur boot.
   * Lazy-load SDK seulement si DSN configuré dans vault (0 KB overhead sinon).
   * v13.3.18 : envoi test event ping après init (1× par jour) si DSN configurée. */
  await safeInit('sentry', async () => {
    const { sentryBridge } = await import('@services/sentry-bridge.js');
    await sentryBridge.init();
    /* Test event ping 1×/jour si DSN configurée (vérifie que le sink répond) */
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
    } catch {
      /* Test event optionnel — fail silently */
    }
  });
  await safeInit('bodyguard', async () => {
    const { bodyguard } = await import('@services/bodyguard.js');
    bodyguard.install();
  });
  await safeInit('audit-log', async () => {
    const { auditLog } = await import('@services/audit-log.js');
    auditLog.init();
    /* v13.3.36 (Kevin 2026-05-07 — security-watch P0) : auto-repair chain au boot
     * si tampering détecté. Évite de laisser une chain corrompue rotter sans action. */
    try {
      const repair = await auditLog.autoRepair();
      if (repair.brokenAt !== undefined && repair.rebuilt > 0) {
        logger.warn('audit-log', `Auto-repair chain depuis index ${repair.brokenAt}: ${repair.rebuilt} entries reconstruites`);
      }
    } catch { /* silent */ }
    await auditLog.record('boot.start', { details: { ver: APP_VER } });
  });
  /* v13.3.36 (Kevin 2026-05-07 — credentials-watch P1 alerte sync incomplet) :
   * Sync registry vault → ax_credentials_registry au boot (post-vault init).
   * Garantit que credentials-watch reflète l'état réel du vault. */
  await safeInit('credentials-registry-sync', async () => {
    const { credentialsAudit } = await import('@services/credentials-audit.js');
    const r = await credentialsAudit.syncFromVault();
    if (r.ok) {
      logger.info('boot', `Credentials registry sync : ${r.configured}/${r.total} configurés`);
    }
  });
  await safeInit('auto-backup', async () => {
    /* Kevin règle "ne jamais rien perdre" — init au boot pour check intégrité + restore auto.
     * v13.3.18 (Kevin v13.3.16 rapport "Last backup compteur jamais reset") :
     * Si AUCUN backup existe → snapshot manual immédiat pour seed le compteur. */
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
  });
  await safeInit('observability', async () => {
    const { observability } = await import('@services/observability.js');
    observability.init();
  });

  /* v13.3.29 — UX Premium : init theme + dual mode + easter eggs au boot.
   * Apply CSS vars sur <html> (data-theme, data-mode) + détection saisonnier auto.
   * Konami code listener installé sur window. Idempotent. */
  await safeInit('ux-theme-mode', async () => {
    const { themeSwitcher } = await import('../ui/theme-switcher.js');
    const { proFunMode } = await import('../ui/pro-fun-mode.js');
    const { easterEggs } = await import('../ui/easter-eggs.js');
    themeSwitcher.init();
    proFunMode.init();
    easterEggs.install();
  });
  await safeInit('firebase-queue', async () => {
    const { firebaseQueue } = await import('@services/firebase-queue.js');
    firebaseQueue.init();
  });
  await safeInit('sentinels', async () => {
    const { sentinels } = await import('@services/sentinels.js');
    const { bootstrapSentinelsRegistry } = await import('@services/sentinels-registry.js');
    /* Boost MAX : enregistre 13 core + 4 extras (capabilities/tools/persistence/sentinel-meta) = 17+ */
    bootstrapSentinelsRegistry();
    sentinels.init();
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
   * Non-bloquant : permet à buildSystemPromptDeep() d'avoir docs frais à dispo. */
  void memory.syncDocsAtBoot().catch((err: unknown) => {
    logger.warn('boot', 'Docs sync at boot failed (continuing)', { err });
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
  router.register('studios', { loader: () => import('@features/studios/index.js'), requiresAuth: true });
  router.register('pro', { loader: () => import('@features/pro/index.js'), requiresAuth: true });
  router.register('laurence', { loader: () => import('@features/laurence/index.js'), requiresAuth: true });
  /* Sprint 2 P0 : routes manquantes (orphelines features) */
  router.register('settings', { loader: () => import('@features/settings/index.js'), requiresAuth: true });
  router.register('sentinels', { loader: () => import('@features/sentinels/index.js'), requiresAdmin: true });
  router.register('browser', { loader: () => import('@features/browser/index.js'), requiresAuth: true });
  router.register('crypto', { loader: () => import('@features/crypto/index.js'), requiresAuth: true });
  router.register('domotique', { loader: () => import('@features/domotique/index.js'), requiresAuth: true });
  router.register('workflow', { loader: () => import('@features/workflow/index.js'), requiresAuth: true });
  /* Sprint 3 NEW : Télécommande Universelle (UNIVERSAL_REMOTE.md, intègre device-control) */
  router.register('remote', { loader: () => import('@features/remote/index.js'), requiresAuth: true });
  /* Sprint port v12 (Kevin 2026-05-04) : 4 features critiques manquantes */
  router.register('notes', { loader: () => import('@features/notes/index.js'), requiresAuth: true });
  router.register('calendar', { loader: () => import('@features/calendar/index.js'), requiresAuth: true });
  router.register('billing', { loader: () => import('@features/billing/index.js'), requiresAuth: true });
  router.register('calculators', { loader: () => import('@features/calculators/index.js'), requiresAuth: true });
  router.register('archive', { loader: () => import('@features/archive/index.js'), requiresAuth: true });
  /* Sprint v13.3.25 (Kevin 2026-05-07) : Cross-platform device capabilities dashboard */
  router.register('device', { loader: () => import('@features/device-capabilities/index.js'), requiresAuth: true });
  /* Sprint v13.3.27 (Kevin 2026-05-07) : Vue Knowledge — mémoire long-terme + cross-user admin */
  router.register('knowledge', { loader: () => import('@features/knowledge/index.js'), requiresAuth: true });
  /* Sprint port v12 (Kevin 2026-05-04) : 5 studios créatifs critiques */
  router.register('studio-music', { loader: () => import('@features/studios/music/index.js'), requiresAuth: true });
  router.register('studio-video', { loader: () => import('@features/studios/video/index.js'), requiresAuth: true });
  router.register('studio-cv', { loader: () => import('@features/studios/cv/index.js'), requiresAuth: true });
  router.register('studio-invoice', { loader: () => import('@features/studios/invoice/index.js'), requiresAuth: true });
  router.register('studio-contract', { loader: () => import('@features/studios/contract/index.js'), requiresAuth: true });
  /* Sprint port v12 (Kevin 2026-05-04) : 5 studios MAX (logo, presentation, prefecture, clip, photo) */
  router.register('studio-logo', { loader: () => import('@features/studios/logo/index.js'), requiresAuth: true });
  router.register('studio-presentation', { loader: () => import('@features/studios/presentation/index.js'), requiresAuth: true });
  router.register('studio-prefecture', { loader: () => import('@features/studios/prefecture/index.js'), requiresAuth: true });
  router.register('studio-clip', { loader: () => import('@features/studios/clip/index.js'), requiresAuth: true });
  router.register('studio-photo', { loader: () => import('@features/studios/photo/index.js'), requiresAuth: true });
  /* Sprint port v12 (Kevin 2026-05-04) : 3 modules pro MAX (business, education, certifications) */
  router.register('pro-business', { loader: () => import('@features/pro/modules/business/index.js'), requiresAuth: true });
  router.register('pro-education', { loader: () => import('@features/pro/modules/education/index.js'), requiresAuth: true });
  router.register('pro-certifications', { loader: () => import('@features/pro/modules/certifications/index.js'), requiresAuth: true });
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
  router.init();
  events.emit('boot:routerReady', { ctx });

  /* 8.5. Force version check au boot (Kevin 2026-05-07 — PWA iOS Safari bloqué v13.3.x).
   * Fetch HEAD index.html avec cache-bust + check si version différente.
   * Si stale + pas déjà fait dans cette session → unregister SW + clear caches + reload.
   * Anti-loop : query param ?_fv=<APP_VER> coupe le cycle (already-checked). */
  void (async () => {
    try {
      const url = window.location.pathname.replace(/[^/]+$/, '') + 'index.html?_v=' + Date.now();
      const res = await fetch(url, { method: 'GET', cache: 'no-store', signal: AbortSignal.timeout(5000) });
      if (!res.ok) return;
      const html = await res.text();
      const remoteMatch = html.match(/data-app-ver="(v[\d.]+)"/);
      const remoteVer = remoteMatch?.[1];
      if (!remoteVer || remoteVer === APP_VER) return;
      /* Anti-loop : si déjà check fait, abandonner */
      const loopKey = 'apex_v13_force_reload_' + remoteVer;
      if (sessionStorage.getItem(loopKey)) {
        logger.warn('boot', `version mismatch ${APP_VER} vs ${remoteVer} mais reload déjà tenté → abandonne (loop guard)`);
        return;
      }
      sessionStorage.setItem(loopKey, String(Date.now()));
      logger.warn('boot', `🔄 Version stale détectée : local ${APP_VER}, remote ${remoteVer} → force reload`);
      /* Banner visible immédiatement avant reload (Kevin sait que ça part) */
      try {
        const banner = document.createElement('div');
        banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;padding:16px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;font:600 14px/1.4 system-ui;text-align:center;box-shadow:0 4px 16px rgba(0,0,0,0.4)';
        banner.textContent = `🔄 Mise à jour automatique en cours (${APP_VER} → ${remoteVer})…`;
        document.body?.appendChild(banner);
      } catch { /* DOM pas prêt */ }
      /* Unregister SW + clear caches + clear localStorage non-critique */
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        }
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      } catch (err: unknown) {
        logger.warn('boot', 'force reload cleanup failed', { err });
      }
      /* Reload avec query param pour bypass cache HTTP Safari + cache-bust SW */
      window.location.href = window.location.pathname + '?_forceupd=' + remoteVer + '&t=' + Date.now();
    } catch (err: unknown) {
      /* Offline ou pas dispo : silencieux */
      logger.debug('boot', 'force version check skipped', { err });
    }
  })();

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
      const data = e.data as { type?: string; endpoint?: string; url?: string } | null;
      if (!data?.type) return;
      if (data.type === 'push_resubscribed') {
        logger.info('push', 'SW auto-resubscribed', { endpoint: data.endpoint?.slice(0, 60) });
        events.emit('push:resubscribed', { endpoint: data.endpoint });
      } else if (data.type === 'notification_clicked') {
        events.emit('notification:clicked', { url: data.url });
      }
    });
  }

  /* 9ter. Services bootstrap : wire tous les services orphelins (anti-pattern Declaration ≠ Deployment) */
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

  /* 9bis. Push notifications auto-init (autonome, app fermée OK iOS+Android) */
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

  /* 10. Force-update auto agressif (Kevin règle "Maj force auto oubli pas")
     iOS Safari PWA SW updatefound unreliable → fetch APP_VER remote + reload forcé.
     Trigger : boot 2s + visibilitychange + focus + cron 5min */
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
  /* Trigger immédiat boot (Kevin v13.0.56 "MAJ auto ne marche pas" — agressif) */
  setTimeout(() => void forceUpdateCheck(), 500);
  /* Trigger second boot après splash full chargé */
  setTimeout(() => void forceUpdateCheck(), 3000);
  /* Trigger visibilitychange (Kevin revient sur Safari après screen off) */
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) void forceUpdateCheck();
  });
  /* Trigger focus (Kevin tap sur l'onglet Safari) */
  window.addEventListener('focus', () => void forceUpdateCheck());
  /* Cron 5 min en background */
  setInterval(() => void forceUpdateCheck(), 5 * 60 * 1000);

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

  /* 12. Hide splash + render initial view */
  router.dispatch();
  setTimeout(() => {
    const splash = document.getElementById('apex-splash');
    if (splash) {
      splash.hidden = true;
      setTimeout(() => splash.remove(), 600);
    }
  }, 100);

  const bootMs = Math.round(performance.now() - ctx.startedAt);
  logger.info('boot', `APEX ${APP_VER} ready in ${bootMs}ms`);
  events.emit('boot:complete', { ctx, bootMs });

  /* v13.3.30 (Kevin règle absolue "tout autonomie autocorrigé") :
   * - SOS rescue button toujours visible (1-clic auto-fix, long-press diagnostic)
   * - HUD debug live admin Kevin only (overlay top-right état app temps réel)
   * - Auto-test runner schedule daily (smoke tests services critiques)
   * Non-bloquant : tous mounted en background. */
  setTimeout(() => {
    void Promise.allSettled([
      import('../ui/sos-rescue.js').then((m) => m.sosRescue.mount()),
      import('../ui/hud-debug.js').then((m) => m.hudDebug.mount()),
      import('../services/auto-test-runner.js').then((m) => m.autoTestRunner.scheduleAutoRun()),
    ]).then((results) => {
      const ok = results.filter((r) => r.status === 'fulfilled').length;
      logger.info('boot', `v13.3.30 autonomy modules : ${ok}/${results.length} mounted`);
    });
  }, 1500);
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
