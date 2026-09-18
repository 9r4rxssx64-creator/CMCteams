#!/usr/bin/env node
/* Vérification RÉELLE — « Centre les images auto à chaque fois » (Kevin 11.09.2026).
   ---------------------------------------------------------------------------------
   Une vignette ronde découpe la photo : si elle découpe au MILIEU de l'image, un visage
   placé en haut se fait couper. Ici, dans un Chromium réel et sur la famille SYNTHÉTIQUE
   (0 donnée réelle), on fabrique des photos dont on CONNAÎT la position du sujet, on les
   met dans l'arbre, et on vérifie que l'app vise bien le sujet :
     · visage en HAUT À GAUCHE  → le cadrage part vers le haut et vers la gauche ;
     · personne EN PIED         → le cadrage remonte vers le visage, pas le ventre ;
     · sujet DÉTOURÉ (PNG transparent, comme la photo de Gérard) → vise le sujet, pas le vide ;
     · photo déjà centrée       → on ne déplace rien (pas de cadrage « créatif ») ;
     · photo unie               → reste au centre, aucune erreur ;
     · l'ACTE scanné garde son cadrage par le haut (on ne touche pas aux documents) ;
     · et ça marche À CHAQUE FOIS : carte de l'arbre, fiche ouverte, photo AJOUTÉE après coup,
       et l'affiche imprimée (qui découpait, elle aussi, au centre géométrique).
   Usage : node tools/arbre/verify-cadrage.mjs   · sortie 1 si une vérification échoue. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fixture } from './fixture-famille.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ARBRE = path.join(ROOT, 'arbre');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml' };
const srv = await new Promise((res) => {
  const s = http.createServer((req, rsp) => {
    let f = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (f === '/' || f === '') f = '/index.html';
    const fp = path.join(ARBRE, f);
    if (!fp.startsWith(ARBRE) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { rsp.writeHead(404); rsp.end(); return; }
    rsp.writeHead(200, { 'content-type': MIME[path.extname(fp)] || 'application/octet-stream' });
    fs.createReadStream(fp).pipe(rsp);
  });
  s.listen(0, '127.0.0.1', () => res(s));
});
const base = `http://127.0.0.1:${srv.address().port}`;
async function loadPlaywright() {
  for (const n of ['playwright', 'playwright-core']) { try { return await import(n); } catch (e) { /* suivant */ } }
  if (process.env.PW_MODULE_DIR) return import(pathToFileURL(path.join(process.env.PW_MODULE_DIR, 'node_modules', 'playwright-core', 'index.mjs')).href);
  throw new Error('playwright introuvable');
}
function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const b = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  try { for (const d of fs.readdirSync(b).filter((x) => /^chromium-\d+$/.test(x)).sort().reverse()) { const c = path.join(b, d, 'chrome-linux', 'chrome'); if (fs.existsSync(c)) return c; } } catch (e) { /* rien */ }
  return undefined;
}
const fails = [];
function check(ok, label, detail) {
  console.log((ok ? '  ✅ ' : '  ❌ ') + label + (detail ? ' — ' + detail : ''));
  if (!ok) fails.push(label);
}

const fx = fixture();
/* 4 personnes de la lignée olivier reçoivent chacune une photo au sujet CONNU */
const CIBLES = { hautGauche: 'o_g2_0_0', enPied: 'o_g2_0_1', detoure: 'o_g2_0_2', centree: 'o_g1_0_0' };

const pw = await loadPlaywright();
const browser = await pw.chromium.launch({ headless: true, executablePath: chromePath() });
try {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'fr-FR' });
  await ctx.route('**/*', (r) => (r.request().url().startsWith(base) && !/\/sw\.js(\?|$)/.test(r.request().url()) ? r.continue() : r.abort()));
  await ctx.addInitScript((a) => { localStorage.setItem('arbre_trust', '1'); localStorage.setItem('arbre_codehash', a.h); localStorage.setItem('arbre_v2_text', a.db); }, { h: 'f'.repeat(64), db: JSON.stringify(fx) });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  await page.goto(base + '/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelectorAll('#stage .tnode, #stage .tmed').length > 0, null, { timeout: 30000 });

  /* Les photos sont FABRIQUÉES dans la page (donc on connaît la vérité terrain au pixel près). */
  const r = await page.evaluate(async (a) => {
    function img(w, h, dessin, transparent) {
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const cx = cv.getContext('2d');
      if (!transparent) { cx.fillStyle = '#dfe6ef'; cx.fillRect(0, 0, w, h); }   /* fond uni clair = « le mur » */
      dessin(cx);
      return cv.toDataURL(transparent ? 'image/png' : 'image/jpeg', 0.9);
    }
    const rond = (cx, x, y, r2, c) => { cx.fillStyle = c; cx.beginPath(); cx.arc(x, y, r2, 0, 7); cx.fill(); };
    /* 1. un visage sombre en HAUT À GAUCHE d'une grande photo */
    const pHautGauche = img(400, 400, (cx) => rond(cx, 90, 80, 52, '#3a2a1c'));
    /* 2. une personne EN PIED : colonne étroite et haute, tête en haut.
       La tête est ROUGE VIF pour être reconnaissable au pixel près dans la vignette de l'affiche
       (le corps, lui, est sombre) : c'est ce qui permet de dire « la tête est DANS la vignette ». */
    const pEnPied = img(300, 600, (cx) => { cx.fillStyle = '#2f3b52'; cx.fillRect(110, 150, 80, 420); rond(cx, 150, 110, 46, '#c0392b'); });
    /* 3. sujet DÉTOURÉ (fond transparent), placé à droite */
    const pDetoure = img(400, 400, (cx) => rond(cx, 300, 210, 70, '#7a4a2a'), true);
    /* 4. photo déjà centrée */
    const pCentree = img(400, 400, (cx) => rond(cx, 200, 200, 80, '#3a2a1c'));
    /* 5. photo parfaitement unie (rien à viser) */
    const pUnie = img(200, 200, () => {});

    P(a.C.hautGauche).photos = [pHautGauche];
    P(a.C.enPied).photos = [pEnPied];
    P(a.C.detoure).photos = [pDetoure];
    P(a.C.centree).photos = [pCentree];
    FAMKEY = 'o'; render();
    /* laisser les <img> se charger puis le cadrage s'appliquer */
    const attendre = (ms) => new Promise((r2) => setTimeout(r2, ms));
    await attendre(400); cadrerImages(document); await attendre(300);

    const lire = (id) => {
      const carte = document.querySelector('[data-open="' + id + '"]');
      const im = carte ? carte.querySelector('img') : null;
      const op = im ? (im.style.objectPosition || '') : '';
      const m = op.match(/([\d.]+)%\s+([\d.]+)%/);
      return { op, x: m ? +m[1] : null, y: m ? +m[2] : null, aImg: !!im };
    };
    const carte = { hg: lire(a.C.hautGauche), pied: lire(a.C.enPied), det: lire(a.C.detoure), ctr: lire(a.C.centree) };

    /* la FICHE (ce que Kevin regarde) */
    openPerson(a.C.hautGauche);
    await attendre(350);
    const ov = document.querySelector('.ov');
    const grande = ov ? ov.querySelector('.caro .slide img') : null;
    const vignette = ov ? ov.querySelector('.av img') : null;
    const fiche = { grande: grande ? grande.style.objectPosition : '', vignette: vignette ? vignette.style.objectPosition : '' };
    closeOverlay();

    /* une photo AJOUTÉE APRÈS COUP doit être cadrée toute seule (« à chaque fois ») */
    P(a.C.centree).photos = [pHautGauche];
    render();
    await attendre(500);
    const apresAjout = lire(a.C.centree);

    /* image unie : aucune erreur, on reste au centre */
    const uni = (function () { const im2 = new Image(); im2.src = pUnie; return new Promise((r2) => { im2.onload = () => r2(cadrePour(im2, pUnie)); im2.onerror = () => r2(null); }); })();

    /* L'AFFICHE imprimée : la vignette est découpée sur un canevas, elle aussi. On prend la
       personne EN PIED — c'est là que le découpage décide si la TÊTE est dans la vignette ou non
       (photo carrée = aucun découpage, donc aucune preuve). On compte les pixels ROUGES. */
    const aff = await posterThumbs({ nodes: [{ id: a.C.enPied }] }, true);
    const affSrc = aff[a.C.enPied] || '';
    const affSombre = await new Promise((r2) => {
      if (!affSrc) return r2(null);
      const im3 = new Image();
      im3.onload = function () {
        const cv = document.createElement('canvas'); cv.width = 96; cv.height = 96;
        const cx = cv.getContext('2d'); cx.drawImage(im3, 0, 0);
        const d = cx.getImageData(0, 0, 96, 96).data;
        let sx = 0, sy = 0, n = 0;
        for (let y = 0; y < 96; y++) for (let x = 0; x < 96; x++) { const k = (y * 96 + x) * 4; if (d[k] > 140 && d[k + 1] < 100 && d[k + 2] < 100) { sx += x; sy += y; n++; } }
        r2(n ? { x: sx / n / 96, y: sy / n / 96, part: n / (96 * 96) } : null);
      };
      im3.onerror = () => r2(null);
      im3.src = affSrc;
    });

    /* un ACTE scanné ne doit PAS être recadré (le haut d'un document prime) */
    const acte = document.createElement('div'); acte.className = 'actecard';
    const ai = document.createElement('img'); ai.src = pHautGauche; acte.appendChild(ai); document.body.appendChild(acte);
    cadrerImages(document); await attendre(200);
    const acteOP = ai.style.objectPosition || '';
    acte.remove();

    return { carte, fiche, apresAjout, uni: await uni, affSombre, acteOP };
  }, { C: CIBLES });

  console.log('\n🖼  Cadrage automatique des photos — ce que vise l\'app\n');
  const hg = r.carte.hg, pied = r.carte.pied, det = r.carte.det, ctr = r.carte.ctr;
  console.log('  visage en haut à gauche : ' + hg.op + '   (attendu : x < 45 %, y < 45 %)');
  console.log('  personne en pied        : ' + pied.op + '   (attendu : y < 40 % — la tête, pas le ventre)');
  console.log('  sujet détouré à droite  : ' + det.op + '   (attendu : x > 55 %)');
  console.log('  photo déjà centrée      : ' + ctr.op + '   (attendu : ≈ 50 % 50 %)');
  console.log('  photo ajoutée après coup: ' + r.apresAjout.op);
  console.log('  affiche imprimée (en pied) : tête ' + (r.affSombre ? 'VISIBLE à ' + (r.affSombre.y * 100).toFixed(0) + '% de hauteur (' + (r.affSombre.part * 100).toFixed(1) + '% de la vignette)' : 'ABSENTE de la vignette') + '\n');

  check(hg.x !== null && hg.x < 45 && hg.y < 45, 'visage en haut à gauche : le cadrage va le chercher', hg.op);
  check(pied.y !== null && pied.y < 40, 'personne en pied : on remonte vers le visage', pied.op);
  check(det.x !== null && det.x > 55, 'photo détourée (fond transparent) : on vise le sujet, pas le vide', det.op);
  check(ctr.x !== null && Math.abs(ctr.x - 50) <= 8 && Math.abs(ctr.y - 50) <= 8,
    'photo déjà centrée : on ne la déplace PAS', ctr.op);
  check(/\d/.test(r.fiche.grande) && /\d/.test(r.fiche.vignette),
    'SA FICHE aussi : la grande photo ET la vignette sont cadrées', r.fiche.grande + ' / ' + r.fiche.vignette);
  check(r.apresAjout.x !== null && r.apresAjout.x < 45 && r.apresAjout.y < 45,
    'une photo AJOUTÉE après coup est cadrée toute seule (« à chaque fois »)', r.apresAjout.op);
  check(!!r.uni && Math.abs(r.uni.x - 0.5) < 0.01 && Math.abs(r.uni.y - 0.5) < 0.01,
    'photo unie (rien à viser) : on reste au centre, sans erreur');
  check(!!r.affSombre && r.affSombre.part > 0.03 && r.affSombre.y < 0.6,
    'AFFICHE imprimée : la TÊTE est dans la vignette (avant, le découpage au centre la coupait)',
    r.affSombre ? (r.affSombre.part * 100).toFixed(1) + '% de la vignette, à ' + (r.affSombre.y * 100).toFixed(0) + '% de hauteur' : 'tête ABSENTE de la vignette');
  check(r.acteOP === '', 'un ACTE scanné n\'est PAS recadré (le haut d\'un document prime)', JSON.stringify(r.acteOP));
  check(errors.length === 0, '0 erreur JavaScript', errors.slice(0, 2).join(' | '));
} finally {
  await browser.close(); srv.close();
}
console.log(`\n=== ${fails.length ? '❌ ' + fails.length + ' échec(s)' : '✅ tout est vérifié'} ===`);
process.exit(fails.length ? 1 : 0);
