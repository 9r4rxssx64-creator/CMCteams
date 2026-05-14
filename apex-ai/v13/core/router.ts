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
    this.rootEl.innerHTML = `
      <div class="ax-empty">
        <h2>Souci de chargement</h2>
        <p>${this.escape(msg)}</p>
        <button class="ax-btn" onclick="location.reload()">Recharger</button>
      </div>
    `;
  }

  private escape(s: string): string {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
  }
}

export const router = new Router();
