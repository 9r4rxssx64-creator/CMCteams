// Régression v1.19 — ROTATION PARTAGÉE cross-device (CMCteams light) (Kevin 2026-07-01
// « Ils n'ont pas les mêmes départs que moi ; doit se mettre à jour partout si je modifie »).
// AVANT : l'ancrage (off), la base de départ (ci) et les marques NR/5e (nr/cq) étaient des
// préférences LOCALES → chaque appareil calculait une rotation différente. Ce test prouve :
//  (A) une modif admin/chef PUSH la config partagée vers Firebase (cmc_dep_cfg/<board>) ;
//  (B) un AUTRE appareil PULL cette config et l'applique (off + NR/5e) → même rotation.
// Mock Firebase RTDB + Identity Toolkit (comme runtime-audit-departs-live).
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const pageUrl = 'file://' + resolve(root, 'tools/departs/index.html');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const browser = await chromium.launch({ headless: true });
try {
  const ctx = await browser.newContext();
  await ctx.route(/identitytoolkit\.googleapis\.com\/.*signUp.*/, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ idToken: 'TESTTOK', expiresIn: '3600', localId: 'anon' }) }));

  const cfgPuts = [];           // corps des PUT vers cmc_dep_cfg/<board>
  let CFG_NODE = {};            // ce que renvoie GET cmc_dep_cfg.json (device B)
  await ctx.route(/cmcteams-c16ab-default-rtdb\.europe-west1\.firebasedatabase\.app\/cmcteams\/.*\.json.*/, route => {
    const req = route.request(), url = req.url();
    // PUT config partagée
    const mPut = url.match(/\/cmc_dep_cfg\/([^.?]+)\.json/);
    if (req.method() === 'PUT' && mPut) {
      let body = null; try { body = JSON.parse(req.postData() || 'null'); } catch (_) {}
      cfgPuts.push({ board: decodeURIComponent(mPut[1]), body });
      return route.fulfill({ status: 200, contentType: 'application/json', body: req.postData() || 'null' });
    }
    // GET cmc_dep_cfg (device B lit la config partagée)
    if (req.method() === 'GET' && /\/cmc_dep_cfg\.json/.test(url)) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CFG_NODE) });
    }
    // tout le reste (cmc_e/cmc_ov/…) → null : la page retombe sur ses boards committés (offline)
    route.fulfill({ status: 200, contentType: 'application/json', body: 'null' });
  });

  const page = await ctx.newPage();
  const perr = [];
  page.on('pageerror', e => perr.push(e.message));
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.compute === 'function' && window.B && window.ST && window.ST.order && ST.order.length >= 2, { timeout: 15000 });

  // ── (A) PUSH : un édit admin (ancrage + NR) synchronise cmc_dep_cfg ──
  const info = await page.evaluate(() => {
    const bkey = B.key, nm = ST.order[0];
    ST.off = 3;                    // simule un ancrage
    ST.nr[nm] = '✗✗';    // simule 2 non-retours
    ST.ci = { [nm]: 0 };
    save();                        // → localStorage + push cmc_dep_cfg (debounce 500ms)
    return { bkey, nm };
  });
  await page.waitForTimeout(800);  // laisse le debounce PUT partir

  const put = cfgPuts.find(p => p.board === info.bkey);
  ok(perr.length === 0, 'aucune erreur page (' + perr.join(' | ') + ')');
  ok(!!put, 'PUSH : un PUT vers cmc_dep_cfg/' + info.bkey + ' a bien eu lieu après l’édit');
  ok(!!(put && put.body && put.body.off === 3), 'PUSH : off (ancrage) synchronisé (off=3)');
  ok(!!(put && put.body && put.body.nr && put.body.nr[info.nm] === '✗✗'), 'PUSH : marques NR synchronisées');
  ok(!!(put && put.body && put.body.ci), 'PUSH : base de départ (ci) synchronisée');

  // ── (B) PULL : un AUTRE appareil reçoit la config et l'applique ──
  await page.evaluate(({ bkey, nm }) => {
    // efface l'état local (appareil neuf) puis recharge le board
    try { localStorage.removeItem(bkey); } catch (_) {}
    load();
  }, info);
  const before = await page.evaluate(() => ({ off: ST.off, nr: JSON.stringify(ST.nr) }));
  // le "cloud" contient une config partagée pour ce board (device B la lira via GET cmc_dep_cfg)
  CFG_NODE = { [info.bkey]: { off: 4, ci: { [info.nm]: 1 }, nr: { [info.nm]: '✗' }, cq: {}, ts: 1 } };
  await page.evaluate(() => { if (window._depPullCfg) window._depPullCfg(); });
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => ({ off: ST.off, nr: ST.nr ? (ST.nr[Object.keys(ST.nr)[0]] || '') : '' }));

  console.log('PULL device B : off ' + before.off + '→' + after.off + ' , NR="' + after.nr + '"');
  ok(after.off === 4, 'PULL : l’ancrage partagé (off=4) est appliqué sur l’autre appareil');
  ok(after.nr === '✗', 'PULL : la marque NR partagée est appliquée sur l’autre appareil');

  await ctx.close();
} finally { await browser.close(); }

console.log('\nDÉPARTS-CFG (rotation partagée cross-device) : ' + pass + ' OK / ' + fail + ' KO');
process.exit(fail ? 1 : 0);
