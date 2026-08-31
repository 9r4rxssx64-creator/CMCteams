import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config — Apex Chat E2E tests
 *
 * Profils principaux : iPhone Safari WebKit (cible Kevin), Chromium desktop.
 * Tests dans tests/e2e/. Serveur dev statique HTTP sur 4173.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: { timeout: 8_000 },

  use: {
    // HTTPS en test = parité prod (apex-chat.kd-mc.com est HTTPS) → la CSP
    // `upgrade-insecure-requests` n'a rien à upgrader. En HTTP, WebKit upgrade
    // même localhost → tous les <script type="module"> échouent (voir
    // tests/serve-https.sh). Certificat auto-signé → ignoreHTTPSErrors.
    baseURL: 'https://localhost:4173',
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 5000,
    navigationTimeout: 15000,
  },

  projects: [
    {
      name: 'iphone-safari',
      use: { ...devices['iPhone 14 Pro'] },
    },
    {
      name: 'iphone-se',
      use: { ...devices['iPhone SE'] },
    },
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'pixel-android',
      use: { ...devices['Pixel 7'] },
    },
  ],

  webServer: {
    command: 'bash tests/serve-https.sh',
    url: 'https://localhost:4173',
    ignoreHTTPSErrors: true,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
