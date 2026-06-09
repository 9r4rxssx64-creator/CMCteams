// ════════════════════════════════════════════════════════════════════════
//  E2E PUSH/NOTIF — chaîne d'affichage réelle (Chromium)
//  Kevin (2026-06-09) : « Tu as testé aussi les notifs ? » → on couvre la
//  partie automatisable : permission accordée → Service Worker → showNotification
//  → la notif est bien créée (getNotifications). Sur la PROD déployée.
//
//  Limite assumée : APNs (Apple) / FCM (Google) RÉELS = vrai device requis
//  (cf. diag.html in-app : boutons « Tester ma notif / micro / caméra »).
//  WebKit-iPhone (CI Linux) ne supporte pas getNotifications de façon fiable →
//  ce test tourne sur Chromium.
// ════════════════════════════════════════════════════════════════════════
import { test, expect } from '@playwright/test';

test.describe('Notifications — chaîne SW → showNotification (Chromium)', () => {
  test('permission accordée → le Service Worker affiche une notification', async ({ browser, browserName }) => {
    test.skip(browserName !== 'chromium', 'getNotifications fiable uniquement sur Chromium CI');
    const ctx = await browser.newContext({
      permissions: ['notifications'],
      baseURL: process.env.APEX_CHAT_URL || 'https://9r4rxssx64-creator.github.io/CMCteams/messaging-app/',
    });
    const page = await ctx.newPage();
    try {
      await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 45000 });

      const result = await page.evaluate(async () => {
        if (!('serviceWorker' in navigator)) return { ok: false, why: 'no-serviceWorker' };
        // attend l'activation du SW (max 12s) sans bloquer indéfiniment
        const reg = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((r) => setTimeout(() => r(null), 12000)),
        ]).catch(() => null) || await navigator.serviceWorker.getRegistration();
        if (!reg) return { ok: false, why: 'no-registration' };
        if (typeof reg.showNotification !== 'function') return { ok: false, why: 'no-showNotification' };
        try {
          await reg.showNotification('E2E test', { body: 'hello', tag: 'apex-e2e' });
          const notifs = await reg.getNotifications({ tag: 'apex-e2e' });
          const n = notifs.length;
          notifs.forEach((x) => x.close());
          return { ok: true, count: n };
        } catch (e) {
          return { ok: false, why: (e && e.name) + ': ' + (e && e.message) };
        }
      });

      expect(result.ok, 'showNotification a échoué : ' + (result.why || '')).toBe(true);
      expect(result.count, 'aucune notification affichée').toBeGreaterThanOrEqual(1);
    } finally {
      await ctx.close();
    }
  });

  test('Permissions API : notifications accordables (Notification.permission)', async ({ browser }) => {
    const ctx = await browser.newContext({
      permissions: ['notifications'],
      baseURL: process.env.APEX_CHAT_URL || 'https://9r4rxssx64-creator.github.io/CMCteams/messaging-app/',
    });
    const page = await ctx.newPage();
    try {
      await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 45000 });
      const perm = await page.evaluate(() => (('Notification' in window) ? Notification.permission : 'unsupported'));
      expect(perm, 'permission notifications').toBe('granted');
    } finally {
      await ctx.close();
    }
  });
});
