/* =============================================================================
   ARBRE — TÉLÉCHARGEMENT DES IMAGES D'ACTES (Monaco Arkothèque)
   -----------------------------------------------------------------------------
   Le robot research-registres.mjs a trouvé les LIGNES de résultats (actes MAIFFRET,
   SAUVAIGO, MOLINARIO à Monaco) mais pas les IMAGES scannées. Or l'acte de
   naissance porte les noms des PARENTS → c'est la preuve pour raccorder les
   membres isolés (ex : François MAIFFRET n°71/1912).

   Ce script rejoue la recherche comme un humain (Playwright), clique chaque
   « Visualiser », ouvre la visionneuse Arkothèque et sauvegarde :
   - une capture PNG pleine page de chaque image d'acte (zoom max possible)
   - l'URL réseau de l'image si interceptable (jpg/tile)
   dans arbre/research/actesimg/  +  un rapport ACTES-IMAGES.md.

   Réseau OUVERT requis (runner CI — l'agent Claude a l'egress bloqué).
   Usage : node tools/arbre/fetch-actes-images.mjs
============================================================================= */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT = 'arbre/research/actesimg';
fs.mkdirSync(OUT, { recursive: true });
const L = [];
function log(s) { console.log(s); L.push(s); }

/* Cibles : (base, nom recherché, filtre de ligne → dossier de sortie)
   On capture TOUTES les lignes de chaque nom — chaque acte peut prouver un lien. */
const NOMS = ['MAIFFRET', 'SAUVAIGO', 'MOLINARIO', 'PACHIAUDI', 'BRUNO', 'VIRGILI', 'DENTAU', 'VAN DEN BOSCH', 'DESARZENS', 'DE SARZENS'];
const MAXROWS = 12; /* plafond par nom (BRUNO est très courant à Monaco) */
const TARGETS = [
  { tag: 'mc1900', base: 'https://archives.mairie.mc/r/5/base-de-registres-a-partir-de-1900/', noms: NOMS },
  { tag: 'mcav1900', base: 'https://archives.mairie.mc/a/5/rechercher-par-acte-indexe/', noms: NOMS },
];

function slug(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 90); }

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  viewport: { width: 1600, height: 1200 },
  locale: 'fr-FR',
});

let totalImgs = 0;

for (const t of TARGETS) {
  for (const nom of t.noms) {
    const pg = await ctx.newPage();
    /* URLs d'images interceptées pendant la visionneuse */
    const netImgs = [];
    pg.on('response', async (r) => {
      try {
        const u = r.url();
        const ct = (r.headers()['content-type'] || '');
        if ((/image\/(jpe?g|png|tiff)/.test(ct) || /\.(jpe?g|png|tif)/i.test(u)) && /arkotheque|visionneuse|iip|fcgi|image/i.test(u)) {
          const buf = await r.body().catch(() => null);
          if (buf && buf.length > 20000) netImgs.push({ url: u, buf });
        }
      } catch (_) {}
    });
    try {
      log('\n### ' + t.tag + ' — ' + nom);
      await pg.goto(t.base, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await pg.waitForTimeout(1500);
      const submitted = await pg.evaluate(function (nomV) {
        var inp = document.querySelector('#form_rech_12') || document.querySelector('#r_nom') || document.querySelector('input.yui-ac-input');
        if (!inp) return 'pas de champ nom';
        inp.value = nomV;
        document.querySelectorAll('input[type=checkbox][name^=form_rech_type_acte]').forEach(function (c) { c.checked = true; });
        if (typeof Valider === 'function') { Valider('rechercher', ''); return 'ok'; }
        var f = inp.form; if (f) { f.submit(); return 'ok-form'; }
        return 'pas de Valider ni form';
      }, nom);
      if (submitted !== 'ok' && submitted !== 'ok-form') { log('- recherche impossible : ' + submitted); await pg.close(); continue; }
      await pg.waitForLoadState('domcontentloaded');
      await pg.waitForTimeout(2500);

      /* Lister les lignes + liens Visualiser (href javascript:ArkVisuImage('...')) */
      const rows = await pg.evaluate(function () {
        var out = [];
        var trs = document.querySelectorAll('tr');
        trs.forEach(function (tr) {
          var a = tr.querySelector('a[href*="ArkVisuImage"], a[title*="Visualiser"], a[href*="visionneuse"]');
          if (!a) return;
          var label = tr.innerText.replace(/\s+/g, ' ').trim().slice(0, 160);
          var m = (a.getAttribute('href') || '').match(/ArkVisuImage\('([^']+)'/);
          out.push({ label: label, visu: m ? m[1] : null });
        });
        return out;
      });
      log('- ' + rows.length + ' acte(s) avec Visualiser' + (rows.length > MAXROWS ? ' (plafonné à ' + MAXROWS + ')' : ''));
      if (rows.length > MAXROWS) rows.length = MAXROWS;
      if (!rows.length) { await pg.close(); continue; }

      /* Ouvrir chaque visionneuse dans la MÊME session (cookie requis) */
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row.visu) { log('  · sans URL visionneuse : ' + row.label); continue; }
        const dir = path.join(OUT, t.tag + '-' + nom);
        fs.mkdirSync(dir, { recursive: true });
        const baseName = String(i + 1).padStart(2, '0') + '-' + slug(row.label);
        netImgs.length = 0;
        const vp = await ctx.newPage();
        const vpImgs = [];
        vp.on('response', async (r) => {
          try {
            const u = r.url();
            const ct = (r.headers()['content-type'] || '');
            if (/image\/(jpe?g|png|tiff)/.test(ct) || /\.(jpe?g|png|tif)(\?|$)/i.test(u)) {
              const buf = await r.body().catch(() => null);
              if (buf && buf.length > 20000) vpImgs.push({ url: u, buf });
            }
          } catch (_) {}
        });
        try {
          await vp.goto('https://archives.mairie.mc' + row.visu, { waitUntil: 'domcontentloaded', timeout: 45000 });
          await vp.waitForTimeout(4000);
          /* La visionneuse Arkothèque charge l'image en grand — tenter le plein écran/zoom */
          await vp.evaluate(function () {
            var img = document.querySelector('#image_visu, .visionneuse img, canvas');
            if (img && img.scrollIntoView) img.scrollIntoView();
          }).catch(() => {});
          await vp.waitForTimeout(2000);
          /* 1) captures réseau (la vraie image scannée, pleine résolution) */
          let saved = 0;
          vpImgs.sort((a, b) => b.buf.length - a.buf.length);
          for (let k = 0; k < Math.min(vpImgs.length, 4); k++) {
            const ext = /png/i.test(vpImgs[k].url) ? '.png' : '.jpg';
            const f = path.join(dir, baseName + '-net' + (k + 1) + ext);
            fs.writeFileSync(f, vpImgs[k].buf);
            log('  · image réseau : ' + f + ' (' + Math.round(vpImgs[k].buf.length / 1024) + ' Ko) ← ' + vpImgs[k].url.slice(0, 120));
            saved++; totalImgs++;
          }
          /* 2) capture d'écran de secours (toujours) */
          const shot = path.join(dir, baseName + '-ecran.png');
          await vp.screenshot({ path: shot, fullPage: true });
          log('  · capture écran : ' + shot + (saved ? '' : ' (seule — aucune image réseau interceptée)'));
          totalImgs++;
          /* S'il y a plusieurs pages (ex mariage 3-4 images) : bouton suivant */
          for (let pnum = 2; pnum <= 4; pnum++) {
            const hasNext = await vp.evaluate(function () {
              var b = document.querySelector('a[title*="suivante"], a[href*="suivant"], .btn_next, #btn_next, a[onclick*="suivant"]');
              if (b) { b.click(); return true; } return false;
            }).catch(() => false);
            if (!hasNext) break;
            await vp.waitForTimeout(3500);
            const shotN = path.join(dir, baseName + '-ecran-p' + pnum + '.png');
            await vp.screenshot({ path: shotN, fullPage: true });
            log('  · page ' + pnum + ' : ' + shotN);
            totalImgs++;
          }
        } catch (e) {
          log('  · ÉCHEC visionneuse ' + row.label + ' : ' + e.message.slice(0, 140));
        }
        await vp.close();
      }
    } catch (e) {
      log('- ÉCHEC ' + t.tag + '/' + nom + ' : ' + e.message.slice(0, 160));
    }
    await pg.close();
  }
}

await browser.close();

L.unshift('# 📜 Images d\'actes récupérées (Monaco Arkothèque) — ' + new Date().toISOString().slice(0, 10) + '\n\nTotal fichiers : **' + totalImgs + '** (dans `arbre/research/actesimg/`)\n\nBut : lire les noms des PARENTS sur chaque acte de naissance/mariage pour raccorder les membres isolés de l\'arbre avec PREUVE (jamais d\'invention).');
fs.writeFileSync('arbre/research/ACTES-IMAGES.md', L.join('\n') + '\n');
console.log('\nRapport : arbre/research/ACTES-IMAGES.md — ' + totalImgs + ' fichier(s)');
