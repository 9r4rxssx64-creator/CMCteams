import { test } from '@playwright/test';

test('app boot complet preview', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`CONSOLE: ${m.text()}`);
  });
  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(3000);
  const splashHidden = await page.evaluate(() => {
    const s = document.getElementById('apex-splash');
    return s ? (s.hidden || s.style.opacity === '0' || getComputedStyle(s).opacity === '0') : true;
  });
  const rootContent = await page.evaluate(() => document.getElementById('apex-root')?.innerHTML.length ?? 0);
  console.log('===SPLASH_HIDDEN:', splashHidden);
  console.log('===ROOT_CONTENT_LEN:', rootContent);
  console.log('===ERRORS_COUNT:', errors.length);
  errors.forEach((e) => console.log('  →', e));
});
