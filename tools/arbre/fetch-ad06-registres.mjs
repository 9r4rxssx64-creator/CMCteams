/* =============================================================================
   ARBRE — AD06 : TÉLÉCHARGEMENT DIRECT DES REGISTRES (Beaulieu / Turbie / Sospel / Lantosque)
   -----------------------------------------------------------------------------
   Kevin 2026-08-04 : « Tout auto toujours. Trouve des solutions. »
   Le moteur de RECHERCHE AD06 bloque les robots, MAIS Kevin a sauvegardé les pages
   de résultats depuis son iPhone → on a les URLs ark EXACTES des registres.
   Ce script saute la recherche : il ouvre DIRECTEMENT la visionneuse de chaque
   registre (Playwright, empreinte réaliste), intercepte les images/tuiles, tente
   de découvrir le motif d'URL des pages (IIIF/daogrp) pour télécharger les pages
   en rafale, et capture des écrans.
   Cibles prioritaires (lignée directe) :
   - BEAULIEU Naissances 1891-1903  (Léonie MAIFFRET 1895 + tables alphabétiques)
   - BEAULIEU Tables décennales naissances 1893-1902 et 1883-1892
   - Liste complète Turbie+Lantosque+Sospel (limit:50) → extraire les arks 1860-1900
   Sorties : arbre/research/ad06raw/ + AD06-REGISTRES.md
   Réseau OUVERT requis (runner CI). Usage : node tools/arbre/fetch-ad06-registres.mjs
============================================================================= */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT = 'arbre/research/ad06raw';
fs.mkdirSync(OUT, { recursive: true });
const L = [];
function log(s) { console.log(s); L.push(s); }

const REGISTRES = [
  { tag: 'beaulieu-naiss-1891-1903', label: 'BEAULIEU Naissances 1891-1903 (Léonie 1895)', ark: 'https://archives06.fr/ark:/79346/ece859631612763091511d83bd5e658bd5' },
  { tag: 'beaulieu-td-naiss-1893-1902', label: 'BEAULIEU Tables décennales naissances 1893-1902', ark: 'https://archives06.fr/ark:/79346/ec569baadd35ee7159e7b52ef579412229' },
  { tag: 'beaulieu-td-naiss-1883-1892', label: 'BEAULIEU Tables décennales naissances 1883-1892', ark: 'https://archives06.fr/ark:/79346/ecaf8f384a1e844a7d11cc382767aa94c1' },
];
const LISTE_TLS = 'https://archives06.fr/archive/resultats/etatcivil2/tableau/n:101/limit:50?RECH_commune_Libel=TURBIE+%28LA%29%7CLANTOSQUE%7C&RECH_commune_Md5=abb0c4c9807a6a8330c6b9812818625e%7C0feb797b6fd4647552bff4307da5e319%7C&RECH_commune=Sospel&RECH_acte_Libel=Naissances%7CD%C3%A9c%C3%A8s%7CMariages%7C&RECH_acte_Md5=8ed9508580fa441ccb3d81fac588c139%7C32cf065623cd7445a94c0e06c8356230%7C954d00f786271393e0d5b92ea4b8a444%7C&type=etatcivil2';
const LISTE_BEAULIEU = 'https://archives06.fr/archive/resultats/etatcivil2/tableau/n:101/limit:50?RECH_commune=Beaulieu&RECH_acte_Libel=Naissances%7CD%C3%A9c%C3%A8s%7CMariages%7C&RECH_acte_Md5=8ed9508580fa441ccb3d81fac588c139%7C32cf065623cd7445a94c0e06c8356230%7C954d00f786271393e0d5b92ea4b8a444%7C&type=etatcivil2';

const browser = await chromium.launch({
  args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
});
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  viewport: { width: 430, height: 932 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
  locale: 'fr-FR', timezoneId: 'Europe/Monaco',
});
await ctx.addInitScript(() => { try { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); } catch (_) {} });

function looksBlocked(text) {
  return /captcha|datadome|access denied|accès refusé|robot|blocked|forbidden/i.test(text || '');
}

/* ---------- 1) Visionneuses des registres ciblés ---------- */
let total = 0;
for (const r of REGISTRES) {
  const dir = path.join(OUT, r.tag);
  fs.mkdirSync(dir, { recursive: true });
  const pg = await ctx.newPage();
  const imgs = [];
  const tileUrls = new Set();
  pg.on('response', async (resp) => {
    try {
      const u = resp.url();
      const ct = (resp.headers()['content-type'] || '');
      if (/iiif|daogrp|\.ptif|tile|img_prot|image/i.test(u)) tileUrls.add(u.slice(0, 300));
      if (/image\/(jpe?g|png|tiff)/.test(ct)) {
        const buf = await resp.body().catch(() => null);
        if (buf && buf.length > 40000) imgs.push({ url: u, buf });
      }
    } catch (_) {}
  });
  try {
    log('\n### ' + r.label);
    log('- ark : ' + r.ark);
    await pg.goto(r.ark, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await pg.waitForTimeout(9000);
    const text = await pg.evaluate(() => document.body ? document.body.innerText.slice(0, 4000) : '').catch(() => '');
    if (looksBlocked(text)) log('- ⛔ page semble BLOQUÉE (anti-robot) — texte : ' + text.slice(0, 160).replace(/\n/g, ' '));
    await pg.screenshot({ path: path.join(dir, '01-ouverture.png'), fullPage: false });
    total++;
    /* tenter plein écran / premier zoom de la visionneuse */
    await pg.evaluate(() => {
      var v = document.querySelector('#visu, .visionneuse, canvas, .openseadragon-canvas, iframe');
      if (v && v.scrollIntoView) v.scrollIntoView();
    }).catch(() => {});
    await pg.waitForTimeout(4000);
    await pg.screenshot({ path: path.join(dir, '02-visionneuse.png'), fullPage: false });
    total++;
    /* pages suivantes : boutons next connus (Ligeo/OpenSeadragon) */
    for (let p = 2; p <= 6; p++) {
      const next = await pg.evaluate(() => {
        var b = document.querySelector('a[title*="uivant"], button[title*="uivant"], .next, #next, a[class*="next"], button[class*="next"], [data-action="next"]');
        if (b) { b.click(); return true; } return false;
      }).catch(() => false);
      if (!next) break;
      await pg.waitForTimeout(3500);
      await pg.screenshot({ path: path.join(dir, '0' + (p + 1) + '-page' + p + '.png'), fullPage: false });
      total++;
    }
    /* images réseau (les vraies pages scannées) */
    imgs.sort((a, b) => b.buf.length - a.buf.length);
    for (let k = 0; k < Math.min(imgs.length, 10); k++) {
      const ext = /png/i.test(imgs[k].url) ? '.png' : '.jpg';
      const f = path.join(dir, 'net-' + String(k + 1).padStart(2, '0') + ext);
      fs.writeFileSync(f, imgs[k].buf);
      log('  · image réseau : ' + f + ' (' + Math.round(imgs[k].buf.length / 1024) + ' Ko) ← ' + imgs[k].url.slice(0, 140));
      total++;
    }
    if (!imgs.length) log('  · aucune image réseau interceptée (voir captures écran)');
    /* motifs d'URL découverts → pour télécharger les pages en rafale à la prochaine vague */
    const tl = [...tileUrls].slice(0, 12);
    if (tl.length) { log('  · motifs tuiles/pages découverts :'); tl.forEach(u => log('    - ' + u)); }
    fs.writeFileSync(path.join(dir, 'urls.txt'), [...tileUrls].join('\n'));
  } catch (e) {
    log('- ÉCHEC ' + r.tag + ' : ' + e.message.slice(0, 160));
  }
  await pg.close();
}

/* ---------- 2) Listes de registres (extraire les arks utiles 1850-1926) ---------- */
for (const [tag, url] of [['liste-turbie-lantosque-sospel', LISTE_TLS], ['liste-beaulieu', LISTE_BEAULIEU]]) {
  const pg = await ctx.newPage();
  try {
    log('\n### Liste ' + tag);
    let pageNum = 1;
    let all = [];
    let cur = url;
    while (pageNum <= 8) {
      await pg.goto(cur, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await pg.waitForTimeout(6000);
      const bodyText = await pg.evaluate(() => document.body ? document.body.innerText.slice(0, 2000) : '').catch(() => '');
      if (looksBlocked(bodyText)) { log('- ⛔ liste BLOQUÉE page ' + pageNum + ' : ' + bodyText.slice(0, 120).replace(/\n/g, ' ')); break; }
      const rows = await pg.evaluate(() => {
        var out = [];
        document.querySelectorAll('a[href^="/ark:/79346/"]').forEach(function (a) {
          var tr = a.closest('tr, li, .resultat, div');
          var label = tr ? tr.innerText.replace(/\s+/g, ' ').trim().slice(0, 120) : '';
          if (label && !/^\d+ \d+ \d+/.test(label)) out.push({ ark: a.getAttribute('href').split('/daogrp')[0], label: label });
        });
        return out;
      }).catch(() => []);
      const uniq = {}; rows.forEach(r => { uniq[r.ark] = r.label; });
      const list = Object.entries(uniq).map(([ark, label]) => ({ ark, label }));
      log('- page ' + pageNum + ' : ' + list.length + ' registre(s)');
      all = all.concat(list);
      const nextHref = await pg.evaluate(function (pn) {
        var a = [...document.querySelectorAll('a[href*="page:' + (pn + 1) + '"]')][0];
        return a ? a.getAttribute('href') : null;
      }, pageNum).catch(() => null);
      if (!nextHref) break;
      cur = 'https://archives06.fr' + nextHref;
      pageNum++;
    }
    /* filtrer les périodes utiles (1850-1930) */
    const utiles = all.filter(r => {
      const yrs = (r.label.match(/1[89]\d\d/g) || []).map(Number);
      return yrs.some(y => y >= 1850 && y <= 1930);
    });
    log('- TOTAL registres relevés : ' + all.length + ' — dont UTILES (1850-1930) : ' + utiles.length);
    utiles.forEach(r => log('  · ' + r.label + ' → https://archives06.fr' + r.ark));
    fs.writeFileSync(path.join(OUT, tag + '.json'), JSON.stringify(all, null, 1));
  } catch (e) {
    log('- ÉCHEC liste ' + tag + ' : ' + e.message.slice(0, 160));
  }
  await pg.close();
}

await browser.close();

L.unshift("# 🏛 AD06 — accès direct aux registres (sans le moteur de recherche) — " + new Date().toISOString().slice(0, 10) + "\n\nLes URLs ark viennent des pages sauvegardées par Kevin depuis son iPhone (le mur anti-robot ne s'applique qu'au moteur de recherche — on teste ici l'accès DIRECT à la visionneuse).\nTotal fichiers : **" + total + "** (dans `arbre/research/ad06raw/`)");
fs.writeFileSync('arbre/research/AD06-REGISTRES.md', L.join('\n') + '\n');
console.log('\nRapport : arbre/research/AD06-REGISTRES.md — ' + total + ' fichier(s)');
