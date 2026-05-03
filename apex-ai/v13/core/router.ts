/**
 * APEX v13 — Hash router avec lazy route imports
 *
 * Routes définies via register(). Chaque route = import() dynamique pour code-splitting.
 * Hash-based pour compatibilité GitHub Pages (pas de history fallback nécessaire).
 *
 * Anti-pattern évité : pas de switch K.view géant 90+ cases (v12.785 monolithe).
 */

import { logger } from './logger.js';
import { events } from './events.js';
import { store } from './store.js';
import { errors } from './errors.js';

type RouteLoader = () => Promise<{ render: (root: HTMLElement) => void | Promise<void> }>;

interface RouteDef {
  loader: RouteLoader;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
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

    try {
      const mod = await route.loader();
      await mod.render(this.rootEl);
    } catch (err: unknown) {
      errors.capture(err, { source: 'manual' });
      this.renderError(errors.toUserMessage(err));
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
    this.rootEl.innerHTML = `
      <div class="ax-empty">
        <h2>Accès réservé</h2>
        <p>Cette section est réservée à l'admin.</p>
        <button class="ax-btn" onclick="location.hash='#chat'">Retour</button>
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
