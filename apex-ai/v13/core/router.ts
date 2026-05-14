/**
 * APEX v13 — Hash router avec lazy route imports
 *
 * Routes définies via register(). Chaque route = import() dynamique pour code-splitting.
 * Hash-based pour compatibilité GitHub Pages (pas de history fallback nécessaire).
 *
 * Anti-pattern évité : pas de switch K.view géant 90+ cases (v12.785 monolithe).
 */

import { skeleton, type SkeletonType } from '../ui/skeleton.js';

import { errors } from './errors.js';
import { events } from './events.js';
import { logger } from './logger.js';
import { store } from './store.js';

type RouteLoader = () => Promise<{ render: (root: HTMLElement) => void | Promise<void> }>;

interface RouteDef {
  loader: RouteLoader;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  /**
   * v13.3.74 a11y/UX fix : skeleton à afficher pendant le lazy import.
   * Améliore le perçu de chargement avant que `render()` injecte le contenu réel.
   */
  skeleton?: SkeletonType;
}

class Router {
  private routes = new Map<string, RouteDef>();
  private currentRoute = '';
  private rootEl: HTMLElement | null = null;
  private initialized = false;

  register(name: string, def: RouteDef): void {
    this.routes.set(name, def);
  }

  init(): void {
    if (this.initialized) return;
    this.initialized = true;
    this.rootEl = document.getElementById('apex-root');
    window.addEventListener('hashchange', () => void this.dispatch());
  }

  navigate(route: string): void {
    if (location.hash === `#${route}`) {
      void this.dispatch();
      return;
    }
    location.hash = `#${route}`;
    /* hashchange listener prend le relais */
  }

  async dispatch(): Promise<void> {
    if (!this.rootEl) {
      logger.warn('router', 'dispatch called before init');
      return;
    }
    const target = location.hash.replace(/^#\/?/, '') || this.defaultRoute();
    const route = this.routes.get(target);
    if (!route) {
      logger.warn('router', `Unknown route: ${target} → fallback`);
      this.renderNotFound(target);
      return;
    }

    /* Auth guards */
    const isAuthed = store.get('user') !== null;
    const isAdmin = store.get('isAdmin');
    if (route.requiresAuth && !isAuthed) {
      this.navigate('login');
      return;
    }
    if (route.requiresAdmin && !isAdmin) {
      this.renderForbidden();
      return;
    }

    const previous = this.currentRoute;
    this.currentRoute = target;
    events.emit('route:change', { from: previous, to: target });
    store.set('view', target);

    /* v13.3.74 UX fix — skeleton pendant lazy import (feature-list par défaut) */
    let disposeSkeleton: (() => void) | null = null;
    try {
      if (route.skeleton) {
        disposeSkeleton = skeleton(this.rootEl, route.skeleton);
      }
      const mod = await route.loader();
      /* render() est responsable de remplacer le skeleton via innerHTML */
      await mod.render(this.rootEl);
    } catch (err: unknown) {
      /* v13.4.79 (Kevin 2026-05-14 22:04 "Souci de chargement" iPhone PWA) :
       * "Importing a module script failed" = race condition iOS Safari SW
       * transition. Le SW v13.4.78 fraîchement activé n'a pas encore les
       * chunks en cache → first fetch network peut fail si latence. Retry
       * UNE fois après 800ms (laisse SW finir l'install) avant d'afficher
       * l'erreur. Si retry réussit → user ne voit rien (silent recovery). */
      const errMsg = err instanceof Error ? err.message : String(err);
      const isModuleLoadError = /import.*module.*script|failed.*fetch.*dynamically.*imported|Loading.*chunk.*failed|Failed.*to.*fetch.*dynamically.*imported.*module/i.test(errMsg);
      if (isModuleLoadError) {
        logger.warn('router', `Module load failed for ${target}, retry in 800ms`, { errMsg });
        await new Promise((r) => setTimeout(r, 800));
        try {
          const mod2 = await route.loader();
          await mod2.render(this.rootEl);
          logger.info('router', `Module load retry success for ${target}`);
          return;
        } catch (err2: unknown) {
          logger.warn('router', `Module load retry failed for ${target}`, { err2 });
          errors.capture(err2, { source: 'manual' });
          this.renderError(errors.toUserMessage(err2));
          return;
        }
      }
      errors.capture(err, { source: 'manual' });
      this.renderError(errors.toUserMessage(err));
    } finally {
      disposeSkeleton?.();
    }
  }

  private defaultRoute(): string {
    return store.get('user') ? 'chat' : 'landing';
  }

  private renderNotFound(target: string): void {
    if (!this.rootEl) return;
    this.rootEl.innerHTML = `
      <div class="ax-empty">
        <h2>Page introuvable</h2>
        <p>Route "${this.escape(target)}" inconnue.</p>
        <button class="ax-btn" onclick="location.hash='#chat'">Retour</button>
      </div>
    `;
  }

  private renderForbidden(): void {
    if (!this.rootEl) return;
    /* v13.4.38 Kevin screenshot bug : "Accès réservé" sans action utile.
     * Kevin admin doit pouvoir se logger directement depuis cette page. */
    const isAuthed = store.get('user') !== null;
    const loginButton = isAuthed
      ? '' /* Déjà loggué = pas admin réel, juste afficher Retour */
      : '<button class="ax-btn ax-btn-primary" onclick="location.hash=\'#login\'" style="margin-right:8px">Se connecter admin</button>';
    this.rootEl.innerHTML = `
      <div class="ax-empty" style="padding:24px;text-align:center">
        <h2>Accès réservé</h2>
        <p>Cette section est réservée à l'admin.</p>
        <p style="font-size:14px;color:var(--ax-muted);margin-top:8px">${isAuthed ? 'Tu es connecté mais sans droits admin.' : 'Connecte-toi avec ton compte admin pour accéder à cette section.'}</p>
        <div style="margin-top:16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          ${loginButton}
          <button class="ax-btn" onclick="location.hash='#chat'">Retour au chat</button>
        </div>
      </div>
    `;
  }

  private renderError(msg: string): void {
    if (!this.rootEl) return;
    /* v13.4.79 Kevin "Souci de chargement / Importing a module script failed" :
     * Le simple location.reload() ne suffit pas si le SW cache un index.html
     * obsolète OU si le SW transition v13.4.77→78 n'a pas terminé. Le bouton
     * "Recharger" fait maintenant un HARD-RESET : unregister SW + clear caches
     * + reload no-cache. Garantit recovery même iOS Safari PWA sticky.
     * CSP-safe : pas d'inline onclick (utilise addEventListener post-render). */
    this.rootEl.innerHTML = `
      <div class="ax-empty" style="padding:24px;text-align:center">
        <h2>Souci de chargement</h2>
        <p>${this.escape(msg)}</p>
        <p style="font-size:13px;color:var(--ax-muted);margin-top:8px">Le premier bouton réinitialise complètement le cache pour repartir propre.</p>
        <div style="margin-top:16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          <button class="ax-btn ax-btn-primary" id="ax-router-hard-reset" type="button">🔄 Recharger (hard reset)</button>
          <button class="ax-btn" id="ax-router-soft-reload" type="button">Reload simple</button>
        </div>
      </div>
    `;
    const hardBtn = this.rootEl.querySelector('#ax-router-hard-reset');
    if (hardBtn) {
      hardBtn.addEventListener('click', () => {
        void (async (): Promise<void> => {
          try {
            if (navigator.serviceWorker) {
              const regs = await navigator.serviceWorker.getRegistrations();
              await Promise.all(regs.map((r) => r.unregister().catch(() => false)));
            }
            if (window.caches) {
              const keys = await caches.keys();
              await Promise.all(keys.map((k) => caches.delete(k).catch(() => false)));
            }
          } catch { /* noop */ }
          location.replace(location.pathname + '?_v=' + Date.now() + (location.hash || '#chat'));
        })();
      });
    }
    const softBtn = this.rootEl.querySelector('#ax-router-soft-reload');
    if (softBtn) {
      softBtn.addEventListener('click', () => location.reload());
    }
  }

  private escape(s: string): string {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
  }
}

export const router = new Router();
