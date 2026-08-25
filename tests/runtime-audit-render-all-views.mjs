// audit passe-2 — SMOKE DE RENDU DE TOUTES LES VUES
// Corrige l'angle mort #1 de l'auto-critique (audit/05) : ~60 vues périphériques
// sans test dédié. Charge index.html, ouvre une session ADMIN, navigue CHAQUE route
// via sv(route), et échoue si une vue : (a) lève une exception JS (pageerror),
// (b) rend le marqueur crash « ⚠ Vue temporairement indisponible » (safe-catch vMain),
// (c) rend le marqueur « 📭 Page vide » (vue admin qui ne renvoie rien = anomalie),
// (d) rend un contenu quasi vide. En admin, AUCUNE vue ne doit être « Section admin »
// (ça, c'est le comportement non-admin). Preuve runtime réelle, pas lecture.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX = resolve(__dirname, '../index.html');

// Les 94 routes du switch _vMainImpl (extraites ✅ VÉRIFIÉ le 2026-07-14).
const ROUTES = ['absences','absenceslong','accueil','admin','admincat','admintimework','adminv10','agents','agentshealth','audit','auditlog','browser','camerastudio','chat','checkintable','conflits','connexions','consumptionlevels','convention','convocs','crossteamactivity','dashboardheures','dayhistory','debug','departs','documents','employees','endshiftdash','featureflags','fiche','flags','galerie','geo','geolocation','gestionlive','heuresshift','ia','identities','import','importanom','importtests','importversions','kevininbox','knowledgebank','lessonscmc','liveroom','logingeo','mapeditor','memorypro','mes-donnees','mesdemandes','messtats','mois','monaco','monfilpit','monplanning','myplanlive','ocrhistory','online','parsercompare','parserintel','parserlearning','partage','passwords','persaudit','pit','pitdash','pithist','pitmap','pitmapview','planimp','planning','profil','qrtables','quilibre','quotidienne','retardataires','retrait','rgpd','security','sentinelhub','sim','stats','statsannuelles','statsglobal','tables','teams','telemetry','templates','timings','uploadreq','usersactivity','verify','vie-privee','voicepresets'];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e && e.message || e)));

  await page.addInitScript(() => { window.__CMC_NO_SEED = true; });
  await page.goto('file://' + INDEX, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => window.A && Array.isArray(A.employees) && typeof window.sv === 'function' && typeof window.vMain === 'function', { timeout: 20000 });
  // Session ADMIN (Kevin U11804) — c'est le tier qui doit voir TOUTES les vues.
  await page.evaluate(() => { A.user = A.employees.find((e) => e.id === 'U11804') || { id: 'U11804', name: 'DESARZENS K' }; });

  const results = [];
  for (const route of ROUTES) {
    const r = await page.evaluate((rt) => {
      const out = { route: rt, err: null, html: '', len: 0 };
      try {
        A.view = rt;
        const html = window.vMain(); // rend la vue SANS toucher au DOM réel (pur)
        out.html = String(html || '');
        out.len = out.html.length;
      } catch (e) { out.err = String(e && e.message || e); }
      return out;
    }, route);
    // classification
    const crash = /Vue temporairement indisponible/.test(r.html);
    const empty = /📭 Page vide/.test(r.html);
    const adminBlocked = /Section admin/.test(r.html); // ne doit JAMAIS arriver en admin
    const tiny = r.len < 40;
    r.status = r.err ? 'JS_ERROR' : crash ? 'CRASH_VIEW' : empty ? 'EMPTY_VIEW' : adminBlocked ? 'ADMIN_BLOCKED_AS_ADMIN' : tiny ? 'TINY' : 'OK';
    results.push(r);
  }

  const bad = results.filter((r) => r.status !== 'OK');
  const ok = results.length - bad.length;

  console.log('\n=== SMOKE RENDU — ' + ROUTES.length + ' vues (session admin) ===');
  results.forEach((r) => { if (r.status !== 'OK') console.log('  ✗ ' + r.route + ' → ' + r.status + (r.err ? ' — ' + r.err : '') + ' (len=' + r.len + ')'); });
  if (pageErrors.length) { console.log('\n  pageerror(s):'); pageErrors.forEach((e) => console.log('   ! ' + e)); }
  console.log('\n  ✓ OK: ' + ok + ' / ' + results.length + ' · ✗ à corriger: ' + bad.length + ' · pageerror: ' + pageErrors.length);

  await browser.close();
  const fail = bad.length > 0 || pageErrors.length > 0;
  console.log(fail ? '❌ RENDER SMOKE : des vues cassent' : '✅ RENDER SMOKE : toutes les vues rendent proprement');
  process.exit(fail ? 1 : 0); // BLOQUANT : une vue qui crash/vide/pageerror casse le gate
}
main().catch((e) => { console.error('FATAL:', e); process.exit(2); });
