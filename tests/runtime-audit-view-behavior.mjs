// audit passe-5 — SMOKE COMPORTEMENTAL DES VUES (angle mort passe 2 : « rendu ≠ comportement »)
// render-views prouve que les 95 vues RENDENT ; ici on prouve que leurs BOUTONS RÉAGISSENT
// sans CRASHER. Session admin, on monte CHAQUE vue (sv → dc), puis on CLIQUE chaque bouton
// de #content (hors boutons DESTRUCTIFS : effacer/supprimer/reset/logout…) et on échoue si
// un clic (a) lève une exception JS (pageerror) ou (b) vide la coquille de l'app (#content/nav
// disparus). Robuste et NON destructif : dialogs/modals/popups auto-fermés, budget borné.
// C'est un filet ANTI-CRASH comportemental — pas une preuve fonctionnelle de chaque bouton.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX = resolve(__dirname, '../index.html');

const ROUTES = ['absences','absenceslong','accueil','admin','admincat','admintimework','adminv10','agents','agentshealth','audit','auditlog','browser','camerastudio','chat','checkintable','conflits','connexions','consumptionlevels','convention','convocs','crossteamactivity','dashboardheures','dayhistory','debug','departs','documents','employees','endshiftdash','featureflags','fiche','flags','galerie','geo','geolocation','gestionlive','heuresshift','ia','identities','import','importanom','importtests','importversions','kevininbox','knowledgebank','lessonscmc','liveroom','logingeo','mapeditor','memorypro','mes-donnees','mesdemandes','messtats','mois','monaco','monfilpit','monplanning','myplanlive','ocrhistory','online','parsercompare','parserintel','parserlearning','partage','passwords','persaudit','pit','pitdash','pithist','pitmap','pitmapview','planimp','planning','profil','qrtables','quilibre','quotidienne','retardataires','retrait','rgpd','security','sentinelhub','sim','stats','statsannuelles','statsglobal','tables','teams','telemetry','templates','timings','uploadreq','usersactivity','verify','vie-privee','voicepresets'];

const DESTRUCTIVE = /effac|supprim|wipe|reset|vider|logout|d[ée]connex|purg|delete|retir|r[ée]voqu|remove|clear|quitter|d[ée]sactiv|kill|restaur|importer|appliquer|envoyer|publier/i;
const CAP_PER_VIEW = 20; // borne le temps + log si dépassé (pas de troncature silencieuse)

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e && e.message || e).slice(0, 160)));
  page.on('dialog', (d) => d.dismiss().catch(() => {}));
  page.on('popup', (p) => p.close().catch(() => {}));

  await page.addInitScript(() => { window.__CMC_NO_SEED = true; });
  await page.goto('file://' + INDEX, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => window.A && Array.isArray(A.employees) && typeof window.sv === 'function', { timeout: 20000 });
  await page.evaluate(() => { A.user = A.employees.find((e) => e.id === 'U11804') || { id: 'U11804', name: 'DESARZENS K' }; });

  // Ferme dialogs natifs + modals dynamiques (divs fixed sombres ajoutés au body) + Escape.
  const dismiss = () => page.evaluate(() => {
    document.querySelectorAll('body > div').forEach((d) => {
      const s = getComputedStyle(d);
      const bg = s.backgroundColor || '';
      const z = parseInt(s.zIndex) || 0;
      // backdrop de modal = fixed, sombre semi-transparent, z élevé, PAS la coquille app
      if (s.position === 'fixed' && z >= 900 && /rgba?\(0, ?0, ?0/.test(bg) && d.id !== 'app' && d.id !== 'ov') d.remove();
    });
    const ov = document.getElementById('ov'); if (ov) ov.style.display = 'none';
  }).catch(() => {});

  const failures = [];
  let totalClicks = 0, cappedViews = 0;

  for (const route of ROUTES) {
    try {
      await page.evaluate((rt) => { window.sv(rt); }, route);
      await page.waitForTimeout(60);
    } catch (_) { continue; }

    // boutons cliquables de la VUE (#content), hors destructifs, hors nav
    const n = await page.evaluate((destrSrc) => {
      const destr = new RegExp(destrSrc, 'i');
      const c = document.getElementById('content'); if (!c) return 0;
      const els = [...c.querySelectorAll('button, [onclick], .tab, a[href^="#"]')];
      window.__sweepBtns = els.filter((el) => {
        const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
        const t = (el.textContent || '') + ' ' + (el.getAttribute('onclick') || '') + ' ' + (el.id || '');
        return !destr.test(t);
      });
      return window.__sweepBtns.length;
    }, DESTRUCTIVE.source).catch(() => 0);

    const lim = Math.min(n, CAP_PER_VIEW);
    if (n > CAP_PER_VIEW) cappedViews++;
    for (let i = 0; i < lim; i++) {
      const before = pageErrors.length;
      // clique via le handler réel du i-ème bouton mémorisé (re-résolu à chaque fois)
      const clicked = await page.evaluate((idx) => {
        const el = (window.__sweepBtns || [])[idx];
        if (!el || !document.body.contains(el)) return false; // détaché par un re-render → skip
        try { el.click(); return true; } catch (_) { return false; }
      }, i).catch(() => false);
      if (!clicked) continue;
      totalClicks++;
      await page.waitForTimeout(70);
      await dismiss();
      // coquille toujours là ? (#content présent ET nav OU topbar présents)
      const alive = await page.evaluate(() => !!document.getElementById('content') && (!!document.getElementById('bnav') || !!document.getElementById('topbar') || !!document.querySelector('nav'))).catch(() => true);
      if (pageErrors.length > before) failures.push({ route, i, kind: 'JS_ERROR', msg: pageErrors[pageErrors.length - 1] });
      if (!alive) { failures.push({ route, i, kind: 'BLANK_SHELL' }); await page.evaluate((rt) => { try { window.sv(rt); } catch (_) {} }, route); }
    }
  }

  await browser.close();
  console.log('\n=== SMOKE COMPORTEMENTAL — ' + ROUTES.length + ' vues, ' + totalClicks + ' boutons cliqués ===');
  if (cappedViews) console.log('  ℹ️ ' + cappedViews + ' vue(s) avec >' + CAP_PER_VIEW + ' boutons → cap appliqué (log, pas de troncature silencieuse)');
  if (failures.length) failures.forEach((f) => console.log('  ✗ ' + f.route + ' bouton#' + f.i + ' → ' + f.kind + (f.msg ? ' — ' + f.msg : '')));
  const fail = failures.length > 0;
  console.log(fail ? '\n❌ COMPORTEMENT : ' + failures.length + ' bouton(s) crashent/vident la vue' : '\n✅ COMPORTEMENT : aucun bouton ne crashe ni ne vide la vue (' + totalClicks + ' cliqués)');
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('FATAL:', e); process.exit(2); });
