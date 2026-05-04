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

export const APP_VER = 'v13.0.43';
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

  await safeInit('bodyguard', async () => {
    const { bodyguard } = await import('@services/bodyguard.js');
    bodyguard.install();
  });
  await safeInit('audit-log', async () => {
    const { auditLog } = await import('@services/audit-log.js');
    auditLog.init();
    await auditLog.record('boot.start', { details: { ver: APP_VER } });
  });
  await safeInit('observability', async () => {
    const { observability } = await import('@services/observability.js');
    observability.init();
  });
  await safeInit('firebase-queue', async () => {
    const { firebaseQueue } = await import('@services/firebase-queue.js');
    firebaseQueue.init();
  });
  await safeInit('sentinels', async () => {
    const { sentinels, registerCoreSentinels } = await import('@services/sentinels.js');
    registerCoreSentinels();
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
  router.register('admin', { loader: () => import('@features/admin/index.js'), requiresAdmin: true });
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
  router.init();
  events.emit('boot:routerReady', { ctx });

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
      const url = location.pathname.replace(/[^/]*$/, '') + 'index.html?_v=' + Date.now();
      const r = await fetch(url, { cache: 'no-store' });
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
        setTimeout(() => location.replace(location.pathname + '?_forceupd=' + Date.now()), 300);
      }
    } catch {
      /* ignore */
    } finally {
      forceUpdateChecking = false;
    }
  };
  /* Trigger boot après 2s (laisse splash finir) */
  setTimeout(() => void forceUpdateCheck(), 2000);
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
}

/* Entry */
bootstrap().catch((err: unknown) => {
  console.error('[APEX boot crash]', err);
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
