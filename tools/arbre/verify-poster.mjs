#!/usr/bin/env node
/* Vérification RÉELLE du poster grand format de l'arbre (v3.15) — vrai navigateur (Chromium), pas grep.
   Charge arbre/index.html depuis un petit serveur local, entre dans l'app (trust persistant),
   construit le poster pour chaque famille × style × papier, puis :
     · le SVG est bien formé (DOMParser, 0 parsererror) et porte la taille papier en mm ;
     · chaque personne de la mise en page a sa carte/médaillon dans le SVG (0 oubli) ;
     · la mosaïque A4 compte le bon nombre de feuilles ;
     · rendu PDF réel (Playwright page.pdf, taille CSS de la page respectée) → octets > 0 ;
     · capture d'écran de la feuille « Poster » en viewport iPhone.
   Usage : node tools/arbre/verify-poster.mjs [--out /tmp/arbre-poster] [--donnees export-prive.json]
   Sortie 1 si une vérification échoue. Réseau : aucun appel extérieur (tout est bloqué). */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fixture } from './fixture-famille.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ARBRE = path.join(ROOT, 'arbre');
const OUT = (() => { const i = process.argv.indexOf('--out'); return i > 0 ? process.argv[i + 1] : (process.env.POSTER_OUT || '/tmp/arbre-poster'); })();
fs.mkdirSync(OUT, { recursive: true });
const DONNEES = (() => { const i = process.argv.indexOf('--donnees'); if (i > 0) { const d = JSON.parse(fs.readFileSync(path.resolve(process.argv[i + 1]), 'utf8')); return { persons: d.persons || d, meta: d.meta || { updatedAt: Date.now() } }; } return fixture(); })();

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.txt': 'text/plain' };
function serve() {
  return new Promise((res) => {
    const srv = http.createServer((req, rsp) => {
      let f = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (f === '/' || f === '') f = '/index.html';
      const fp = path.join(ARBRE, f);
      if (!fp.startsWith(ARBRE) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { rsp.writeHead(404); rsp.end(); return; }
      rsp.writeHead(200, { 'content-type': MIME[path.extname(fp)] || 'application/octet-stream' });
      fs.createReadStream(fp).pipe(rsp);
    });
    srv.listen(0, '127.0.0.1', () => res(srv));
  });
}
async function loadPlaywright() {
  for (const name of ['playwright', 'playwright-core']) { try { return await import(name); } catch (e) { /* suivant */ } }
  if (process.env.PW_MODULE_DIR) return import(pathToFileURL(path.join(process.env.PW_MODULE_DIR, 'node_modules', 'playwright-core', 'index.mjs')).href);
  throw new Error('playwright introuvable : npm i playwright-core, ou PW_MODULE_DIR=<dossier qui contient node_modules>');
}
function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  try {
    const dirs = fs.readdirSync(base).filter((d) => /^chromium-\d+$/.test(d)).sort();
    for (const d of dirs.reverse()) { const c = path.join(base, d, 'chrome-linux', 'chrome'); if (fs.existsSync(c)) return c; }
  } catch (e) { /* pas de dossier */ }
  return undefined; // Playwright complet : navigateur géré par lui
}

const fails = [];
function check(ok, label, detail) { const line = (ok ? '  ✅ ' : '  ❌ ') + label + (detail ? ' — ' + detail : ''); console.log(line); if (!ok) fails.push(label); }

const srv = await serve();
const base = `http://127.0.0.1:${srv.address().port}`;
const pw = await loadPlaywright();
const browser = await pw.chromium.launch({ headless: true, executablePath: chromePath() });
try {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'fr-FR' });
  /* sw.js bloqué : sans service worker, aucune rechargement « controllerchange » ne coupe une vérification */
  await ctx.route('**/*', (route) => (route.request().url().startsWith(base) && !/\/sw\.js(\?|$)/.test(route.request().url()) ? route.continue() : route.abort()));
  /* v3.16 : le fichier ne contient plus personne → on charge une famille SYNTHÉTIQUE (0 donnée réelle),
     ou un export privé de l'app (--donnees mon-export.json, jamais commité). */
  await ctx.addInitScript((a) => { localStorage.setItem('arbre_trust', '1'); localStorage.setItem('arbre_codehash', a.h); localStorage.setItem('arbre_v2_text', a.db); }, { h: 'f'.repeat(64), db: JSON.stringify(DONNEES) });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  await page.goto(base + '/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelectorAll('#stage .tnode, #stage .tmed').length > 0, null, { timeout: 30000 });
  const ver = await page.evaluate(() => ({ app: window.APP_VER, pers: Object.keys(DB.persons).length }));
  console.log(`\n🌳 Arbre ${ver.app} — ${ver.pers} personnes chargées — ${base}`);

  const combos = [];
  for (const fam of ['o', 'c']) for (const style of ['plan', 'arbre']) for (const paper of ['A4', 'A1', 'A0', 'L200']) combos.push({ fam, style, paper });
  const pdfSample = [];
  for (const c of combos) {
    const r = await page.evaluate(async (c) => {
      const pr = await posterBuild({ fam: c.fam, style: c.style, paper: c.paper, photos: true });
      const doc = new DOMParser().parseFromString(pr.svg, 'image/svg+xml');
      const perr = doc.querySelector('parsererror');
      const root = doc.documentElement;
      const lay = posterLayout(c.fam);
      const marker = c.style === 'plan' ? 'url(#pcard)' : 'url(#pav)';
      const t = posterTilesSVG(pr);
      const tileDoc = new DOMParser().parseFromString(t.pages[0], 'image/svg+xml');
      const asm = new DOMParser().parseFromString(posterAssemblySVG(pr, t), 'image/svg+xml');
      return {
        parseError: perr ? perr.textContent.slice(0, 200) : null,
        width: root.getAttribute('width'), height: root.getAttribute('height'), viewBox: root.getAttribute('viewBox'),
        nodesLayout: lay.nodes.length, nodesSvg: (pr.svg.match(new RegExp(marker.replace(/[()#]/g, '\\$&'), 'g')) || []).length,
        persons: pr.n, gens: pr.gens, orient: pr.pp.orient, mmPerPx: pr.pp.mmPerPx,
        tiles: t.cols * t.rows, cols: t.cols, rows: t.rows, tileParse: !!tileDoc.querySelector('parsererror'), asmParse: !!asm.querySelector('parsererror'),
        bytes: pr.svg.length, hasTitle: pr.svg.indexOf(pr.title) >= 0, hasLegend: pr.svg.indexOf('LÉGENDE') >= 0,
      };
    }, c);
    const tag = `${c.fam === 'c' ? 'Desarzens' : 'Sauvaigo·Maiffret'} · ${c.style} · ${c.paper}`;
    check(!r.parseError, `${tag} : SVG bien formé`, r.parseError || `${(r.bytes / 1024).toFixed(0)} Ko`);
    check(/mm$/.test(r.width) && /mm$/.test(r.height), `${tag} : taille papier en mm`, `${r.width} × ${r.height} (${r.orient})`);
    // en style plan, chaque carte porte exactement 1 fond url(#pcard) ; en style arbre, chaque médaillon 1 url(#pav) (+ initiales sans photo, même compte)
    const expected = c.style === 'plan' ? r.nodesLayout : r.nodesLayout;
    check(r.nodesSvg === expected, `${tag} : ${r.nodesLayout} personnes → ${r.nodesSvg} dans le SVG`, r.nodesSvg === expected ? `0 oubli · ${r.gens} générations` : 'ÉCART');
    check(!r.tileParse && !r.asmParse && r.tiles >= 1, `${tag} : mosaïque A4 = ${r.tiles} feuilles (${r.cols} × ${r.rows}) + plan de montage`);
    check(r.hasTitle && r.hasLegend, `${tag} : titre + légende présents`);
    if (c.style === 'plan' && c.paper === 'A1') pdfSample.push({ ...c, orient: r.orient, tiles: r.tiles });
  }

  // Rendu PDF réel : le poster A1 (page CSS = taille du poster) puis la mosaïque A4
  for (const c of pdfSample) {
    const dims = await page.evaluate(async (c) => {
      const pr = await posterBuild({ fam: c.fam, style: c.style, paper: c.paper, photos: true });
      const box = document.getElementById('printArea') || Object.assign(document.body.appendChild(document.createElement('div')), { id: 'printArea' });
      box.innerHTML = '<div class="poster-page">' + pr.svg + '</div>';
      document.body.classList.add('printing');
      return { wmm: pr.pp.wmm, hmm: pr.pp.hmm };
    }, c);
    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({ width: dims.wmm + 'mm', height: dims.hmm + 'mm', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
    const f = path.join(OUT, `poster-${c.fam}-${c.paper}.pdf`); fs.writeFileSync(f, pdf);
    const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    check(pdf.length > 20000 && pages === 1, `PDF ${c.paper} ${c.orient} (${dims.wmm}×${dims.hmm} mm) rendu`, `${(pdf.length / 1024).toFixed(0)} Ko · ${pages} page · ${f}`);

    const nTiles = await page.evaluate(async (c) => {
      const pr = await posterBuild({ fam: c.fam, style: c.style, paper: c.paper, photos: true });
      const t = posterTilesSVG(pr);
      const pages = [posterAssemblySVG(pr, t)].concat(t.pages);
      document.getElementById('printArea').innerHTML = pages.map((p) => '<div class="poster-page">' + p + '</div>').join('');
      return pages.length;
    }, c);
    const pdf2 = await page.pdf({ format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
    const f2 = path.join(OUT, `mosaique-${c.fam}-${c.paper}.pdf`); fs.writeFileSync(f2, pdf2);
    const pages2 = (pdf2.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    check(pages2 === nTiles, `Mosaïque A4 : ${nTiles} pages attendues (1 plan + ${c.tiles} feuilles)`, `${pages2} pages dans le PDF · ${(pdf2.length / 1024).toFixed(0)} Ko · ${f2}`);
    await page.evaluate(() => { document.body.classList.remove('printing'); document.getElementById('printArea').innerHTML = ''; });
    await page.emulateMedia({ media: 'screen' });
  }

  // La feuille « Poster » telle que Kevin la voit sur iPhone
  await page.evaluate(() => openPoster());
  await page.waitForFunction(() => document.querySelector('#posterPrev svg') && !/Calcul/.test(document.querySelector('#poInfo').textContent), null, { timeout: 30000 });
  const info = await page.evaluate(() => document.querySelector('#poInfo').innerText.replace(/\s+/g, ' ').trim());
  const shot = path.join(OUT, 'feuille-poster-iphone.png');
  await page.screenshot({ path: shot, fullPage: false });
  check(/Lisibilité/.test(info) && /Mosaïque/.test(info), 'Feuille Poster : infos de lisibilité + mosaïque affichées', info.slice(0, 160));
  const btns = await page.evaluate(() => ['#poPrint', '#poTiles', '#poSvg', '#poPng'].map((s) => !!document.querySelector(s)));
  check(btns.every(Boolean), '4 boutons de sortie présents (PDF, mosaïque, SVG, image HD)', shot);
  // les chips changent bien l'aperçu (A0 → info « A0 »)
  await page.click('[data-popaper="A0"]');
  await page.waitForFunction(() => /A0/.test(document.querySelector('#poInfo').textContent) && !/Calcul/.test(document.querySelector('#poInfo').textContent), null, { timeout: 30000 });
  check(true, 'Chip A0 → aperçu et infos recalculés');
  const shot2 = path.join(OUT, 'feuille-poster-A0.png'); await page.screenshot({ path: shot2, fullPage: true });
  // le bouton 🖨 de la vue arbre existe
  await page.evaluate(() => closeOverlay());
  check(await page.$('.zoomBtns [data-z="print"]') !== null, 'Bouton 🖨 dans la vue Arbre (boutons de zoom)');
  check(errors.length === 0, 'Aucune erreur JavaScript pendant toute la vérification', errors.slice(0, 3).join(' | '));
} finally {
  await browser.close();
  srv.close();
}
console.log(fails.length ? `\n❌ ${fails.length} échec(s)` : `\n✅ Poster grand format : tout vérifié en vrai navigateur (captures + PDF dans ${OUT})`);
process.exit(fails.length ? 1 : 0);
