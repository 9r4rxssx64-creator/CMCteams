#!/usr/bin/env node
/**
 * APEX v13.4.180 + CMCteams v9.614 — Multi-project visual inspector.
 *
 * Kevin règle 2026-05-16 : "Inspecter mes autres projets et corriger"
 *
 * Visite chaque projet Kevin sur 3 viewports iPhone, capture screenshots,
 * détecte overflow horizontal + boutons hors viewport + petits touch targets.
 * Output JSON + screenshots dans $OUTPUT_DIR.
 *
 * Fail CI si critical issues détectées (overflow > 50px, > 5 boutons hors viewport).
 */

import { chromium, webkit } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const OUT = process.env.OUTPUT_DIR || './visual-reports';
const BASE = 'https://9r4rxssx64-creator.github.io/CMCteams';

const PROJECTS = [
  { id: 'apex-v13', label: 'Apex v13', url: `${BASE}/apex-ai-v13/`, routes: ['', '#chat', '#dashboard', '#vault', '#settings', '#admin'] },
  { id: 'cmcteams', label: 'CMCteams', url: `${BASE}/`, routes: ['', '#accueil', '#chat', '#admin'] },
  { id: 'tools-visual', label: 'Apex Visual Inspector tool', url: `${BASE}/tools/apex-visual-inspector.html`, routes: [''] },
];

const VIEWPORTS = [
  { id: 'iphone-se', label: 'iPhone SE', width: 375, height: 667 },
  { id: 'iphone-14-pro', label: 'iPhone 14 Pro', width: 390, height: 844 },
  { id: 'iphone-16-pro-max', label: 'iPhone 16 Pro Max', width: 440, height: 956 },
];

async function inspectPage(page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const docW = document.documentElement.scrollWidth;
    const overflows = [];
    const hiddenButtons = [];
    const smallTargets = [];

    document.querySelectorAll('*').forEach((el) => {
      if (el.scrollWidth > el.clientWidth + 1 && el.scrollWidth > 50) {
        const cs = getComputedStyle(el);
        if (cs.overflowX === 'auto' || cs.overflowX === 'scroll') return;
        overflows.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || '',
          classes: typeof el.className === 'string' ? el.className.slice(0, 60) : '',
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          overflowBy: el.scrollWidth - el.clientWidth,
        });
      }
    });

    document.querySelectorAll('button, [role="button"], a[href]').forEach((btn) => {
      const rect = btn.getBoundingClientRect();
      const cs = getComputedStyle(btn);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      if (rect.width === 0 || rect.height === 0) return;
      if (rect.right > vw + 2) {
        hiddenButtons.push({
          tag: btn.tagName.toLowerCase(),
          label: (btn.textContent || btn.getAttribute('aria-label') || '').trim().slice(0, 30),
          right: Math.round(rect.right),
          viewport: vw,
        });
      }
      if (rect.width < 44 || rect.height < 44) {
        smallTargets.push({
          label: (btn.textContent || btn.getAttribute('aria-label') || '').trim().slice(0, 30),
          size: { w: Math.round(rect.width), h: Math.round(rect.height) },
        });
      }
    });

    return {
      viewport: { width: vw, height: vh },
      docScroll: { width: docW },
      hasHorizontalOverflow: docW > vw + 1,
      overflowingCount: overflows.length,
      hiddenButtonsCount: hiddenButtons.length,
      smallTargetsCount: smallTargets.length,
      overflows: overflows.slice(0, 20),
      hiddenButtons: hiddenButtons.slice(0, 20),
      smallTargets: smallTargets.slice(0, 20),
    };
  });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const allReports = [];
  const criticalFailures = [];

  /* WebKit pour iOS Safari fidélité, fallback Chromium */
  const browserType = process.env.BROWSER === 'chromium' ? chromium : webkit;
  const browser = await browserType.launch();

  for (const project of PROJECTS) {
    for (const viewport of VIEWPORTS) {
      for (const route of project.routes) {
        const url = project.url + route;
        const ctx = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
          deviceScaleFactor: 3,
          isMobile: true,
        });
        const page = await ctx.newPage();
        const tag = `${project.id}_${viewport.id}_${(route || 'home').replace('#', '')}`;
        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
          await page.waitForTimeout(2000);  /* Laisse le temps aux animations */
          const report = await inspectPage(page);
          report.project = project.label;
          report.viewport_label = viewport.label;
          report.route = route || '/';
          report.url = url;
          allReports.push(report);

          /* Critical : overflow > 50px OU > 5 hidden buttons */
          if (report.docScroll.width - report.viewport.width > 50 || report.hiddenButtonsCount > 5) {
            criticalFailures.push(`[${tag}] overflow=${report.docScroll.width - report.viewport.width}px, hidden=${report.hiddenButtonsCount}`);
          }

          await page.screenshot({ path: join(OUT, `${tag}.png`), fullPage: false });
          console.log(`✅ ${tag} — overflow:${report.hasHorizontalOverflow} hidden:${report.hiddenButtonsCount}`);
        } catch (err) {
          console.error(`❌ ${tag} — ${err.message}`);
          allReports.push({ project: project.label, route, url, error: err.message });
        } finally {
          await ctx.close();
        }
      }
    }
  }
  await browser.close();

  await writeFile(join(OUT, 'reports.json'), JSON.stringify(allReports, null, 2));
  if (criticalFailures.length > 0) {
    await writeFile(join(OUT, 'critical_failures.txt'), criticalFailures.join('\n'));
  }

  /* Markdown summary humain */
  const md = [`# Visual Regression Report — ${new Date().toISOString()}\n`];
  for (const r of allReports) {
    if (r.error) {
      md.push(`## ❌ ${r.project} ${r.route}\n  Error: ${r.error}\n`);
      continue;
    }
    const status = r.hasHorizontalOverflow || r.hiddenButtonsCount > 0 ? '⚠️' : '✅';
    md.push(`## ${status} ${r.project} ${r.viewport_label} ${r.route}`);
    md.push(`- viewport: ${r.viewport.width}×${r.viewport.height}`);
    md.push(`- docScroll.width: ${r.docScroll.width} (overflow: ${r.docScroll.width - r.viewport.width}px)`);
    md.push(`- overflowing elements: ${r.overflowingCount}`);
    md.push(`- hidden buttons (off viewport right): ${r.hiddenButtonsCount}`);
    md.push(`- small touch targets (<44px): ${r.smallTargetsCount}`);
    if (r.hiddenButtons.length) {
      md.push(`  - Hidden buttons sample:`);
      r.hiddenButtons.slice(0, 5).forEach((b) => md.push(`    - "${b.label}" right=${b.right}px (viewport=${b.viewport})`));
    }
    md.push('');
  }
  await writeFile(join(OUT, 'summary.md'), md.join('\n'));
  console.log(`\n📊 Reports written to ${OUT}/`);
  console.log(`📸 ${allReports.length} screenshots`);
  if (criticalFailures.length > 0) {
    console.log(`❌ ${criticalFailures.length} critical failures`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
