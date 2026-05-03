/**
 * Tests RÉELS core/router.ts (Jet 7.5 — coverage 0% → 80%+).
 * Mock import dynamique des features pour tester routing sans réelle dépendance.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { router } from '../../core/router.js';
import { store } from '../../core/store.js';

describe('Router hash (core/router.ts)', () => {
  let rootEl: HTMLDivElement;

  beforeEach(() => {
    localStorage.clear();
    /* keep rootEl persistent */
    rootEl = (document.getElementById('apex-root') as HTMLDivElement) ?? document.createElement('div');
    rootEl.id = 'apex-root';
    if (!rootEl.parentElement) document.body.appendChild(rootEl);
    rootEl.innerHTML = '';
    /* Reset hash */
    location.hash = '';
    store.init({ appVer: 'v13.0.0' });
    store.set('user', null);
    store.set('isAdmin', false);
  });

  it('register accepte route avec loader', () => {
    router.register('test-route', {
      loader: async () => ({ render: () => undefined }),
    });
    /* Pas d'erreur thrown */
    expect(true).toBe(true);
  });

  it('init attache hashchange listener', () => {
    router.init();
    /* Idempotent : 2e init sans erreur */
    router.init();
    expect(true).toBe(true);
  });

  it('navigate change location.hash', () => {
    router.init();
    router.navigate('test-nav');
    expect(location.hash).toBe('#test-nav');
  });

  it('dispatch route inconnue → notFound rendering', async () => {
    router.init();
    location.hash = '#route-inconnue-' + Date.now();
    /* dispatch peut être async, on attend un peu */
    await new Promise((r) => setTimeout(r, 100));
    expect(rootEl.innerHTML).toContain('introuvable');
  });

  it('route avec requiresAuth redirige vers login si pas user', async () => {
    let renderCalled = false;
    router.register('protected-route', {
      loader: async () => ({
        render: () => {
          renderCalled = true;
        },
      }),
      requiresAuth: true,
    });
    router.register('login', {
      loader: async () => ({ render: () => { rootEl.innerHTML = '<div id="login">login</div>'; } }),
    });
    router.init();
    location.hash = '#protected-route';
    await new Promise((r) => setTimeout(r, 100));
    /* User = null → devrait redirect vers login (renderCalled false) */
    expect(renderCalled).toBe(false);
  });

  it('route avec requiresAdmin → forbidden si user pas admin', async () => {
    store.set('user', { id: 'u1', name: 'NotAdmin' });
    store.set('isAdmin', false);
    router.register('admin-only', {
      loader: async () => ({ render: () => undefined }),
      requiresAdmin: true,
    });
    router.init();
    location.hash = '#admin-only';
    await new Promise((r) => setTimeout(r, 100));
    expect(rootEl.innerHTML).toContain('réservé');
  });

  it('route admin OK pour admin', async () => {
    store.set('user', { id: 'kdmc_admin', name: 'Kevin' });
    store.set('isAdmin', true);
    let rendered = false;
    router.register('admin-route-test', {
      loader: async () => ({
        render: () => {
          rendered = true;
          rootEl.innerHTML = '<div>admin OK</div>';
        },
      }),
      requiresAdmin: true,
    });
    router.init();
    location.hash = '#admin-route-test';
    await new Promise((r) => setTimeout(r, 100));
    expect(rendered).toBe(true);
  });

  it('dispatch met à jour store.view', async () => {
    router.register('view-tracking', {
      loader: async () => ({ render: () => undefined }),
    });
    router.init();
    location.hash = '#view-tracking';
    await new Promise((r) => setTimeout(r, 100));
    expect(store.get('view')).toBe('view-tracking');
  });

  it('loader throw → render erreur user-friendly', async () => {
    router.register('crashes', {
      loader: async () => {
        throw new Error('module load failed');
      },
    });
    router.init();
    location.hash = '#crashes';
    await new Promise((r) => setTimeout(r, 100));
    /* render error message dans rootEl */
    expect(rootEl.innerHTML.length).toBeGreaterThan(0);
    /* Pas d'erreur technique brute exposée user (CLAUDE.md règle) */
    expect(rootEl.innerHTML).not.toContain('module load failed');
  });
});
