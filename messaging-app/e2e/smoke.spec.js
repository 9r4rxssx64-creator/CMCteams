// Smoke tests — vérifie que la prod Apex Chat est saine.
// Volontairement non-destructifs : pas de login réel ni de modif state serveur.

import { test, expect } from '@playwright/test';

test.describe('Apex Chat prod smoke tests', () => {

  test('home page charge en < 10s, status 200, version v1.1.X', async ({ page }) => {
    const response = await page.goto('/');
    expect(response.status()).toBe(200);
    // titre enrichi v1.1.170
    await expect(page).toHaveTitle(/Apex Chat/i);
    // version visible dans la topbar ou le splash
    const html = await page.content();
    const versionMatch = html.match(/v1\.1\.(\d+)/);
    expect(versionMatch, 'version v1.1.X introuvable dans le HTML').toBeTruthy();
    const minor = parseInt(versionMatch[1], 10);
    expect(minor, `version trop ancienne : v1.1.${minor}`).toBeGreaterThanOrEqual(160);
  });

  test('SEO meta complets (canonical, OG, Twitter, JSON-LD)', async ({ page }) => {
    await page.goto('/');
    // Canonical
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain('messaging-app');
    // robots indexable
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots).toMatch(/index/);
    // Open Graph
    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
    expect(ogType).toBeTruthy();
    const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content');
    expect(ogLocale).toBe('fr_FR');
    // Twitter Card
    const twCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    expect(twCard).toBe('summary_large_image');
    // JSON-LD WebApplication
    const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
    const json = JSON.parse(ld);
    expect(json['@type']).toBe('WebApplication');
    expect(json.name).toBe('Apex Chat');
  });

  test('robots.txt, sitemap.xml, manifest.json accessibles', async ({ request, baseURL }) => {
    const robots = await request.get(baseURL + 'robots.txt');
    expect(robots.status()).toBe(200);
    const robotsText = await robots.text();
    expect(robotsText).toContain('Sitemap:');

    const sitemap = await request.get(baseURL + 'sitemap.xml');
    expect(sitemap.status()).toBe(200);
    const sitemapText = await sitemap.text();
    expect(sitemapText).toContain('<urlset');
    expect(sitemapText).toContain('lastmod');

    const manifest = await request.get(baseURL + 'manifest.json');
    expect(manifest.status()).toBe(200);
    const m = await manifest.json();
    expect(m.name).toMatch(/Apex Chat/i);
    expect(m.display).toBe('standalone');
  });

  test('cgu.html et privacy.html ont SEO complet', async ({ page, baseURL }) => {
    for (const path of ['cgu.html', 'privacy.html']) {
      const r = await page.goto(baseURL + path);
      expect(r.status(), `${path} doit retourner 200`).toBe(200);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical, `${path} canonical manquant`).toContain(path);
      const desc = await page.locator('meta[name="description"]').getAttribute('content');
      expect(desc, `${path} description vide`).toBeTruthy();
      expect(desc.length).toBeGreaterThan(50);
    }
  });

  test('Service Worker enregistré', async ({ page }) => {
    await page.goto('/');
    // attendre que SW soit installé (peut prendre ~3s)
    const swState = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return 'unsupported';
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        return reg ? (reg.active ? 'active' : 'pending') : 'none';
      } catch (e) { return 'error:' + e.message; }
    });
    // 'pending' acceptable au 1er load — SW vient juste d'être installé
    expect(['active', 'pending'], `SW state: ${swState}`).toContain(swState);
  });

  test('aucune erreur JS console au boot', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForTimeout(3000);
    // Filtrer les warnings non-bloquants connus (CSP, FB SSE, etc.)
    const blocking = errors.filter(e =>
      !/CSP|Content Security|favicon|workers\.dev|Failed to fetch.*api/i.test(e)
    );
    if (blocking.length) console.log('Erreurs JS :', blocking);
    expect(blocking, 'erreurs JS bloquantes au boot').toHaveLength(0);
  });

  test('Worker API /api/admin/force-update-ts répond JSON public', async ({ request }) => {
    const url = 'https://apex-chat-api.9r4rxssx64.workers.dev/api/admin/force-update-ts';
    const r = await request.get(url);
    expect(r.status(), `force-update-ts HTTP status`).toBe(200);
    const data = await r.json();
    expect(data.ok).toBe(true);
    expect(typeof data.ts).toBe('number');
  });

  test('Worker API /api/auth/check-phone refuse phone invalide proprement', async ({ request }) => {
    const url = 'https://apex-chat-api.9r4rxssx64.workers.dev/api/auth/check-phone';
    const r = await request.post(url, { data: { phone: 'abc' } });
    expect([400, 422]).toContain(r.status());
    const data = await r.json();
    expect(data.message || data.error).toBeTruthy();
  });

});
