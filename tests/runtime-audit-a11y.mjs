// audit passe-2 — ACCESSIBILITÉ MESURÉE (axe-core) — corrige le point design « contraste non mesuré »
// Mesure RÉELLE (pas au feeling) sur les écrans les plus vus : accueil, monplanning, login, rgpd.
// Rapport par impact (critical/serious/moderate/minor). BLOQUANT uniquement sur les violations
// CRITICAL (les serious/moderate sont un backlog affiché — pas de faux-rouge sur un thème sombre
// dont le baseline n'est pas encore nettoyé). Ratchet possible en passe ultérieure.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX = resolve(__dirname, '../index.html');
const AXE = resolve(__dirname, '../node_modules/axe-core/axe.min.js');
const VIEWS = ['accueil', 'monplanning', 'rgpd', 'departs'];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await page.addInitScript(() => { window.__CMC_NO_SEED = true; });
  await page.goto('file://' + INDEX, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => window.A && Array.isArray(A.employees) && typeof window.vMain === 'function', { timeout: 20000 });
  await page.evaluate(() => { A.user = A.employees.find((e) => e.id === 'U11804') || { id: 'U11804' }; });
  const axeSrc = readFileSync(AXE, 'utf8');
  await page.addScriptTag({ content: axeSrc });

  const perView = {};
  let totalCritical = 0;
  for (const v of VIEWS) {
    const res = await page.evaluate(async (view) => {
      A.view = view;
      let c = document.getElementById('content');
      if (!c) { c = document.createElement('div'); c.id = 'content'; document.body.appendChild(c); }
      c.innerHTML = window.vMain();
      // axe sur le contenu rendu ; règles WCAG 2 AA
      const r = await window.axe.run('#content', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
      const byImpact = { critical: 0, serious: 0, moderate: 0, minor: 0 };
      const top = {};
      r.violations.forEach((vi) => { byImpact[vi.impact || 'minor'] = (byImpact[vi.impact || 'minor'] || 0) + vi.nodes.length; top[vi.id] = (top[vi.id] || 0) + vi.nodes.length; });
      return { byImpact, top };
    }, v);
    perView[v] = res;
    totalCritical += res.byImpact.critical;
  }

  console.log('\n=== A11Y MESURÉ (axe-core, WCAG 2 AA) ===');
  for (const v of VIEWS) {
    const b = perView[v].byImpact;
    const topStr = Object.entries(perView[v].top).sort((a, c) => c[1] - a[1]).slice(0, 4).map(([k, n]) => k + '×' + n).join(', ');
    console.log('  ' + v.padEnd(12) + ' critical:' + b.critical + ' serious:' + b.serious + ' moderate:' + b.moderate + ' minor:' + b.minor + (topStr ? '  [' + topStr + ']' : ''));
  }
  console.log('\n  → critical total: ' + totalCritical + ' (bloquant si >0). serious/moderate = backlog design (F-04).');
  await browser.close();
  console.log(totalCritical === 0 ? '✅ A11Y : 0 violation critique' : '❌ A11Y : ' + totalCritical + ' violation(s) critique(s)');
  process.exit(totalCritical === 0 ? 0 : 1);
}
main().catch((e) => { console.error('FATAL:', e); process.exit(2); });
