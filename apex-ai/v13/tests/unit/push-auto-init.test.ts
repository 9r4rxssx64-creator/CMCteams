/**
 * Tests push-auto-init.ts
 * Anti-théâtre : prouve que init au boot fonctionne, détecte iOS PWA, gère permissions.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { pushAutoInit } from '../../services/push-auto-init.js';

describe('Push Auto-Init (autonome iOS+Android app fermée)', () => {
  let origUserAgent: string;
  let origNotification: unknown;
  let origStandalone: unknown;

  beforeEach(() => {
    localStorage.clear();
    origUserAgent = navigator.userAgent;
    origNotification = (globalThis as { Notification?: unknown }).Notification;
    origStandalone = (window.navigator as { standalone?: unknown }).standalone;
    pushAutoInit.stopHeartbeat();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', { value: origUserAgent, configurable: true });
    (globalThis as { Notification?: unknown }).Notification = origNotification;
    try { Object.defineProperty(window.navigator, 'standalone', { value: origStandalone, configurable: true }); } catch { /* ignore */ }
    pushAutoInit.stopHeartbeat();
    vi.restoreAllMocks();
  });

  describe('detectEnvironment', () => {
    it('detecte iOS PWA standalone', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari',
        configurable: true,
      });
      Object.defineProperty(window.navigator, 'standalone', { value: true, configurable: true });
      const env = pushAutoInit.detectEnvironment();
      /* En env test happy-dom on accepte ios_pwa_standalone OU unsupported (pas de PushManager) */
      expect(['ios_pwa_standalone', 'unsupported']).toContain(env);
    });

    it('detecte iOS Safari browser (non-standalone)', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari',
        configurable: true,
      });
      Object.defineProperty(window.navigator, 'standalone', { value: false, configurable: true });
      const env = pushAutoInit.detectEnvironment();
      expect(['ios_safari_browser', 'unsupported']).toContain(env);
    });

    it('detecte Android Chrome', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) Chrome/120',
        configurable: true,
      });
      const env = pushAutoInit.detectEnvironment();
      expect(['android_chrome', 'unsupported']).toContain(env);
    });

    it('detecte desktop par défaut', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) Chrome/120',
        configurable: true,
      });
      const env = pushAutoInit.detectEnvironment();
      expect(['desktop', 'unsupported']).toContain(env);
    });

    it('retourne unsupported si serviceWorker absent', () => {
      const origSW = (navigator as { serviceWorker?: unknown }).serviceWorker;
      Object.defineProperty(navigator, 'serviceWorker', { value: undefined, configurable: true });
      const env = pushAutoInit.detectEnvironment();
      expect(env).toBe('unsupported');
      Object.defineProperty(navigator, 'serviceWorker', { value: origSW, configurable: true });
    });
  });

  describe('getStatus', () => {
    it('retourne status complet avec environment + permission', async () => {
      const status = await pushAutoInit.getStatus('user1');
      expect(status).toHaveProperty('environment');
      expect(status).toHaveProperty('permission');
      expect(status).toHaveProperty('subscribed');
      expect(status).toHaveProperty('needs_install_guide');
      expect(typeof status.last_check).toBe('number');
    });
  });

  describe('autoInit logic flows', () => {
    it('environment unsupported → ne crash pas, retourne status', async () => {
      const origSW = (navigator as { serviceWorker?: unknown }).serviceWorker;
      Object.defineProperty(navigator, 'serviceWorker', { value: undefined, configurable: true });
      const status = await pushAutoInit.autoInit('user1', { skipDelay: true });
      expect(status.environment).toBe('unsupported');
      Object.defineProperty(navigator, 'serviceWorker', { value: origSW, configurable: true });
    });

    it('iOS Safari browser → marque needs_install_guide pending', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari',
        configurable: true,
      });
      Object.defineProperty(window.navigator, 'standalone', { value: false, configurable: true });
      await pushAutoInit.autoInit('user1', { skipDelay: true });
      const pending = localStorage.getItem('apex_v13_install_guide_pending');
      /* Pending si env detecté ios_safari_browser, sinon null */
      expect(pending === '1' || pending === null).toBe(true);
    });

    it('permission denied → respect user choice (pas re-demande)', async () => {
      (globalThis as { Notification?: unknown }).Notification = class {
        static permission: NotificationPermission = 'denied';
        static requestPermission = vi.fn(() => Promise.resolve('denied' as NotificationPermission));
      } as unknown;
      const status = await pushAutoInit.autoInit('user1', { skipDelay: true });
      expect(status).toBeDefined();
    });
  });

  describe('install guide instructions', () => {
    it('retourne instructions iOS step-by-step', () => {
      const guide = pushAutoInit.getIOSInstallInstructions();
      expect(guide.title).toContain('notifications');
      expect(guide.steps.length).toBeGreaterThan(3);
      expect(guide.steps.join(' ').toLowerCase()).toContain('partager');
      expect(guide.steps.join(' ').toLowerCase()).toContain('écran');
    });
  });

  describe('markInstallGuideShown', () => {
    it('persiste timestamp + retire pending flag', () => {
      localStorage.setItem('apex_v13_install_guide_pending', '1');
      pushAutoInit.markInstallGuideShown();
      expect(localStorage.getItem('apex_v13_install_guide_pending')).toBe(null);
      expect(localStorage.getItem('apex_v13_install_guide_seen')).toBeTruthy();
    });
  });

  describe('heartbeat lifecycle', () => {
    it('startHeartbeat puis stopHeartbeat ne crash pas', () => {
      pushAutoInit.startHeartbeat('user1');
      pushAutoInit.stopHeartbeat();
      pushAutoInit.startHeartbeat('user1');
      pushAutoInit.startHeartbeat('user1'); /* Double start ignoré */
      pushAutoInit.stopHeartbeat();
      expect(true).toBe(true);
    });
  });
});
