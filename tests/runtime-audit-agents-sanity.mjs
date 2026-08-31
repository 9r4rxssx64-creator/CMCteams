// v9.666 — Test sanity : TOUS les 33 agents peuvent tourner sans crash
// Detecte les agents qui throw silencieusement, references manquantes, etc.

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, '../index.html');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto('file://' + INDEX_PATH, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.APP_AGENTS !== 'undefined' && typeof window.cmcAgentsForceAll === 'function', { timeout: 20000 });
  await page.evaluate(() => { window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' }; });

  const result = await page.evaluate(() => {
    const out = { tests: [], agents: [] };
    function test(label, fn) {
      try { const ok = fn(); out.tests.push({ label, ok: ok === true, error: ok === true ? null : ('expected true got ' + JSON.stringify(ok)) }); }
      catch (e) { out.tests.push({ label, ok: false, error: e.message }); }
    }

    // Test 1 : APP_AGENTS defined avec >= 30 agents (CLAUDE.md mentionne 33)
    test('v9.666 : APP_AGENTS contient >= 30 agents', () => {
      return window.APP_AGENTS && window.APP_AGENTS.length >= 30;
    });

    // Test 2 : Chaque agent a structure valide
    test('v9.666 : chaque agent a {id, label, icon, interval, run}', () => {
      const missing = window.APP_AGENTS.filter(a => !a.id || !a.label || !a.icon || !a.interval || typeof a.run !== 'function');
      if (missing.length) return missing.map(a => a.id||'???').join(',') + ' invalides';
      return true;
    });

    // Test 3 : Chaque agent .run() est une fonction window-accessible
    test('v9.666 : chaque agent.run est appelable', () => {
      const broken = window.APP_AGENTS.filter(a => typeof a.run !== 'function');
      if (broken.length) return broken.map(a => a.id).join(',');
      return true;
    });

    // Test 4 : cmcAgentsForceAll() execute TOUS les agents sans throw global
    test('v9.666 : cmcAgentsForceAll() ne crash pas', () => {
      // Faux DOM hint pour ne pas afficher modal
      const docInsertOrig = document.body.insertAdjacentHTML.bind(document.body);
      const insertedHtml = [];
      document.body.insertAdjacentHTML = function(pos, html) { insertedHtml.push(html.slice(0,80)); };
      try {
        window.cmcAgentsForceAll();
        document.body.insertAdjacentHTML = docInsertOrig;
        // Si on arrive ici sans throw, OK
        if (!insertedHtml.length) return 'aucun modal inserted (signe d\'echec)';
        return true;
      } catch (e) {
        document.body.insertAdjacentHTML = docInsertOrig;
        return 'EXCEPTION: ' + e.message;
      }
    });

    // Test 5 : Pour chaque agent, .run() ne throw pas
    window.APP_AGENTS.forEach(a => {
      try {
        window._agentRunning = window._agentRunning || {};
        window._agentRunning[a.id] = false;
        a.run();
        out.agents.push({ id: a.id, label: a.label, ok: true });
      } catch (e) {
        out.agents.push({ id: a.id, label: a.label, ok: false, error: e.message });
      }
    });

    test('v9.666 : TOUS les agents.run() executent sans throw', () => {
      const failed = out.agents.filter(a => !a.ok);
      if (failed.length) return failed.map(a => a.id+':'+(a.error||'?').slice(0,40)).join(' | ');
      return true;
    });

    // Test 6 : agentLastReport retourne quelque chose pour les agents exécutés
    test('v9.666 : >= 25 agents ont produit un rapport après run', () => {
      const withReport = window.APP_AGENTS.filter(a => typeof window.agentLastReport === 'function' && window.agentLastReport(a.id));
      // Pas tous les agents font systematiquement un rapport (certains short-circuit early return)
      if (withReport.length < 25) return 'only '+withReport.length+'/'+window.APP_AGENTS.length+' ont reporte';
      return true;
    });

    return out;
  });

  console.log('\n=== Test runtime v9.666 — Sanity 33 agents ===');
  let pass = 0, fail = 0;
  result.tests.forEach(t => {
    if (t.ok) { console.log('  ✓ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + (t.error ? ' — ' + t.error : '')); fail++; }
  });
  console.log('\nAgents individuels :');
  const okCount = result.agents.filter(a => a.ok).length;
  const failedAgents = result.agents.filter(a => !a.ok);
  console.log('  ✓ ' + okCount + '/' + result.agents.length + ' agents ne throw pas');
  if (failedAgents.length) {
    console.log('  ✗ ' + failedAgents.length + ' agents crash:');
    failedAgents.forEach(a => console.log('    - ' + a.id + ': ' + (a.error||'').slice(0,80)));
  }
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ AGENTS SANITY OK' : '❌ AGENTS BROKEN');
  console.log(`PASS: ${pass} · FAIL: ${fail}`);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
