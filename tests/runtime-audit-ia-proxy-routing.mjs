// audit passe-4 — PREUVE RUNTIME du ROUTAGE IA (F-C1, angle mort passe 3)
// Le garde statique (test:ia-key-privacy) prouve que la clé ne QUITTE pas le device via
// Firebase. Ici on prouve au RUNTIME l'autre propriété : proxy configuré ⇒ la requête IA
// va au PROXY (jamais directe vers api.anthropic.com) et n'emporte PAS x-api-key. On pilote
// _cmcAiHandleIssue (handler admin qui construit la requête avec le pattern isProxy PARTAGÉ
// par les ~6 sites d'appel IA), en interceptant window.fetch (aucun vrai réseau, egress bloqué).
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX = resolve(__dirname, '../index.html');
const fails = [];

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await (await browser.newContext()).newPage();
  await page.addInitScript(() => { window.__CMC_NO_SEED = true; });
  await page.goto('file://' + INDEX, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => window.A && Array.isArray(A.employees) && typeof window._cmcAiHandleIssue === 'function', { timeout: 20000 });

  const run = async (proxy) => page.evaluate(async (proxyUrl) => {
    // état admin + IA activée + clé + (option) proxy
    A.user = A.employees.find((e) => e.id === 'U11804') || { id: 'U11804' };
    localStorage.setItem('cmc_ia_enabled', '1');
    localStorage.setItem('cmc_ia_key', 'sk-ant-api03-TESTONLY-donotuse');
    if (proxyUrl) localStorage.setItem('cmc_ia_proxy', proxyUrl); else localStorage.removeItem('cmc_ia_proxy');
    // capture fetch (sans réseau réel), renvoie une réponse Anthropic-shaped valide
    const cap = { url: null, headers: null };
    const realFetch = window.fetch;
    window.fetch = (u, o) => {
      cap.url = String(u); cap.headers = (o && o.headers) || {};
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ content: [{ text: '{"diagnostic":"x","action":"logOnly"}' }] }) });
    };
    try {
      const sid = 'route-test-' + (proxyUrl ? 'proxy' : 'direct') + '-' + Math.floor(performance.now());
      window._cmcAiHandleIssue(sid, 'warn', 'finding de test routage');
      for (let i = 0; i < 40 && cap.url === null; i++) await new Promise((r) => setTimeout(r, 25));
    } finally { window.fetch = realFetch; }
    const hk = Object.keys(cap.headers || {}).map((k) => k.toLowerCase());
    return { url: cap.url, hasXApiKey: hk.includes('x-api-key'), hasDangerous: hk.includes('anthropic-dangerous-direct-browser-access') };
  }, proxy);

  // 1) PROXY CONFIGURÉ → route vers le proxy, PAS de x-api-key, PAS de header "direct browser"
  const PROXY = 'https://cmc-proxy.example.workers.dev/relay';
  const withProxy = await run(PROXY);
  if (!withProxy.url) fails.push('proxy: aucune requête capturée (handler non déclenché ?)');
  else {
    if (withProxy.url.indexOf('api.anthropic.com') >= 0) fails.push('proxy: la requête va DIRECTEMENT vers api.anthropic.com malgré un proxy configuré → ' + withProxy.url);
    if (withProxy.url.indexOf('cmc-proxy.example.workers.dev') < 0) fails.push('proxy: la requête ne va pas vers le proxy → ' + withProxy.url);
    if (withProxy.hasXApiKey) fails.push('proxy: x-api-key envoyé alors qu\'un proxy est configuré (fuite de clé vers le transport)');
    if (withProxy.hasDangerous) fails.push('proxy: header anthropic-dangerous-direct-browser-access présent avec un proxy');
  }
  // 2) SANS PROXY → repli direct assumé (x-api-key vers Anthropic) — on DOCUMENTE (pas un échec)
  const noProxy = await run('');
  const fallbackOk = noProxy.url && noProxy.url.indexOf('api.anthropic.com') >= 0 && noProxy.hasXApiKey;

  await browser.close();
  console.log('\n=== ROUTAGE IA RUNTIME (F-C1) ===');
  console.log('  proxy configuré → url=' + (withProxy.url || 'null') + '  x-api-key=' + withProxy.hasXApiKey + '  dangerous=' + withProxy.hasDangerous);
  console.log('  sans proxy      → url=' + (noProxy.url || 'null') + '  x-api-key=' + noProxy.hasXApiKey + '  (repli direct assumé, documenté)');
  if (fails.length) { fails.forEach((f) => console.log('  ✗ ' + f)); console.log('\n❌ ROUTAGE IA : la clé peut fuir vers un tiers malgré le proxy.'); process.exit(1); }
  console.log('  ✓ proxy configuré : requête vers le proxy, aucun x-api-key, aucun appel direct Anthropic');
  console.log('  ' + (fallbackOk ? '✓' : 'ℹ️') + ' sans proxy : repli direct assumé (design accepté device admin)');
  console.log('✅ ROUTAGE IA : proxy configuré ⇒ clé jamais envoyée à un tiers');
  process.exit(0);
}
main().catch((e) => { console.error('FATAL:', e); process.exit(2); });
