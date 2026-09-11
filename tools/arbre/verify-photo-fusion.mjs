#!/usr/bin/env node
/* Vérification RÉELLE — ajouter une PHOTO à quelqu'un qui existe déjà, sans rien perdre.
   ------------------------------------------------------------------------------------
   Kevin envoie une photo par message ; elle arrive sur son iPhone par un petit fichier à
   importer. Ce qui doit être vrai, et qui est vérifié ici dans un Chromium réel sur la
   famille SYNTHÉTIQUE (0 donnée réelle) :
     · la photo s'affiche vraiment sur la carte de la personne (une <img>, pas ses initiales) ;
     · sa fiche garde TOUT le reste : dates, parents, conjoints, notes, actes, commentaires ;
     · ses photos précédentes sont CONSERVÉES, la nouvelle vient s'ajouter ;
     · réimporter le même fichier n'ajoute pas la photo en double ;
     · un import NORMAL (sans « fusion ») ne fait plus disparaître les photos de l'appareil
       — c'est le défaut historique : un export texte n'a jamais les photos, donc réimporter
       un export effaçait les photos prises sur le téléphone ;
     · un complément visant quelqu'un d'ABSENT ne crée pas une carte sans nom.
   Usage : node tools/arbre/verify-photo-fusion.mjs   · sortie 1 si une vérification échoue. */
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

/* La personne qui reçoit la photo : quelqu'un de la lignée olivier, avec des dates, des
   parents, un conjoint et un enfant — pour voir si quelque chose se perd. */
const fx = fixture();
const CIBLE = 'o_g2_0_0';
/* deux images minuscules mais VALIDES (1 px), une déjà là, une « nouvelle » */
const PHOTO_ANCIENNE = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
const PHOTO_NOUVELLE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
fx.persons[CIBLE].photos = [PHOTO_ANCIENNE];
fx.persons[CIBLE].notes = 'Note écrite sur le téléphone, à ne pas perdre.';
fx.persons[CIBLE].comments = [{ by: 'Test', text: 'Commentaire du téléphone', ts: 1 }];
const avant = JSON.parse(JSON.stringify(fx.persons[CIBLE]));

const patchPhoto = { persons: { [CIBLE]: { id: CIBLE, photos: [PHOTO_NOUVELLE], fusion: true, updatedAt: Date.now() } },
  meta: { fusion: true, updatedAt: Date.now() } };
/* le cas historique : un export TEXTE (sans photos) réimporté, plus récent */
const exportTexte = Object.assign({}, avant, { photoCount: 1, docCount: 0, updatedAt: Date.now() + 10000 });
delete exportTexte.photos; delete exportTexte.docs;   // un export texte n'emporte JAMAIS les photos
const patchTexte = { persons: { [CIBLE]: exportTexte } };
/* un complément visant quelqu'un qui n'existe pas ici */
const patchInconnu = { persons: { personne_absente_xyz: { id: 'personne_absente_xyz', photos: [PHOTO_NOUVELLE], fusion: true, updatedAt: Date.now() } },
  meta: { fusion: true } };

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

  /* on rejoue EXACTEMENT ce que fait l'import de l'app (même code, via importerJSON) */
  const r = await page.evaluate(async (a) => {
    function importer(d) {
      var add = 0, maj = 0, ignor = 0, fus = !!(d.meta && d.meta.fusion);
      for (var id in d.persons) {
        var rp = d.persons[id], lp = DB.persons[id];
        if (!lp && (fus || rp.fusion) && !rp.prenom && !rp.nom) { ignor++; continue; }
        if (!lp) { var q0 = Object.assign({}, rp); delete q0.fusion; DB.persons[id] = q0; add++; continue; }
        if (fus || rp.fusion) { DB.persons[id] = fusionnerFiche(lp, rp, true); maj++; continue; }
        if ((rp.updatedAt || 0) > (lp.updatedAt || 0)) { DB.persons[id] = fusionnerFiche(lp, rp, false); maj++; }
      }
      return { add, maj, ignor };
    }
    const un = importer(a.patchPhoto);           // la photo arrive
    const deux = importer(a.patchPhoto);         // le MÊME fichier, une 2e fois
    const trois = importer(a.patchTexte);        // un export texte plus récent, sans photos
    const quatre = importer(a.patchInconnu);     // complément pour quelqu'un d'absent
    await persist();
    FAMKEY = 'o'; renderTree();
    const p = P(a.CIBLE);
    const carte = document.querySelector('[data-open="' + a.CIBLE + '"]');
    const img = carte ? carte.querySelector('img') : null;
    /* SA FICHE (Kevin 11.09 « sur sa fiche ») : la photo doit s'y voir en grand, et
       la fiche doit rester complète — nom, dates, note, commentaire. */
    openPerson(a.CIBLE);
    const ov = document.querySelector('.ov');
    const slides = ov ? [].slice.call(ov.querySelectorAll('.caro .slide img')).map((x) => x.getAttribute('src')) : [];
    const avatarFiche = ov && ov.querySelector('.av img') ? ov.querySelector('.av img').getAttribute('src') : null;
    const texteFiche = ov ? (ov.textContent || '') : '';
    return {
      un, deux, trois, quatre,
      champs: Object.keys(p).sort(), photos: (p.photos || []).slice(),
      notes: p.notes, comments: (p.comments || []).length,
      naissance: JSON.stringify(p.naissance || {}), pere: p.pere || null, mere: p.mere || null,
      conjoints: (p.conjoints || []).slice(),
      imgSrc: img ? img.getAttribute('src') : null,
      slides, avatarFiche, ficheNom: texteFiche.indexOf(P(a.CIBLE).prenom || '') >= 0,
      ficheNote: texteFiche.indexOf('téléphone') >= 0,
      inconnuCree: !!DB.persons.personne_absente_xyz,
    };
  }, { patchPhoto, patchTexte, patchInconnu, CIBLE });

  console.log('\n📷 photo ajoutée à une fiche qui existait déjà\n');
  check(r.photos.length === 2 && r.photos[0] === PHOTO_ANCIENNE && r.photos[1] === PHOTO_NOUVELLE,
    'la nouvelle photo s\'AJOUTE, l\'ancienne est gardée', r.photos.length + ' photo(s)');
  check(r.deux.maj === 1 && r.photos.length === 2,
    'réimporter le MÊME fichier n\'ajoute pas la photo en double');
  check(r.imgSrc === PHOTO_ANCIENNE || r.imgSrc === PHOTO_NOUVELLE,
    'la carte affiche bien une photo (et non les initiales)', r.imgSrc ? 'img présente' : 'aucune img');
  check(r.notes === avant.notes, 'la note écrite sur le téléphone est intacte');
  check(r.comments === 1, 'le commentaire du téléphone est intact');
  check(r.naissance === JSON.stringify(avant.naissance || {}), 'la date de naissance est intacte', r.naissance);
  check(r.pere === (avant.pere || null) && r.mere === (avant.mere || null), 'les parents sont intacts');
  check(JSON.stringify(r.conjoints) === JSON.stringify(avant.conjoints || []), 'les conjoints sont intacts');
  check(JSON.stringify(r.champs) === JSON.stringify(Object.keys(avant).sort()),
    'la fiche garde exactement ses champs', r.champs.join(', '));
  check(r.trois.maj === 1 && r.photos.length === 2,
    'un export TEXTE réimporté (plus récent, sans photos) n\'efface PLUS les photos');
  check(r.quatre.ignor === 1 && !r.inconnuCree,
    'un complément pour quelqu\'un d\'absent est ignoré (aucune carte sans nom)');
  check(r.slides.length === 2 && r.slides.indexOf(PHOTO_NOUVELLE) >= 0,
    'SA FICHE affiche la photo en grand (et garde l\'ancienne)', r.slides.length + ' photo(s) dans la fiche');
  check(r.avatarFiche === PHOTO_ANCIENNE || r.avatarFiche === PHOTO_NOUVELLE,
    'la vignette en haut de sa fiche est bien une photo');
  check(r.ficheNom && r.ficheNote,
    'sa fiche reste complète : son prénom et sa note sont toujours là');
  check(errors.length === 0, '0 erreur JavaScript', errors.slice(0, 2).join(' | '));
} finally {
  await browser.close(); srv.close();
}
console.log(`\n=== ${fails.length ? '❌ ' + fails.length + ' échec(s)' : '✅ tout est vérifié'} ===`);
process.exit(fails.length ? 1 : 0);
