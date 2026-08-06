/* =============================================================================
   ARBRE — AD78 (Archives des Yvelines) : acte de NAISSANCE de Guy Édouard
   DESARZENS, né le 7.03.1918 à POISSY (Kevin 2026-08-06 « recherche son acte de
   naissance, mariage »). L'acte de naissance a >100 ans → librement consultable ;
   sa MENTION MARGINALE donne le mariage (date + lieu) et l'acte nomme les parents.
   Robot d'exploration résilient : on ne connaît pas la structure exacte du site →
   à chaque étape : capture d'écran + liens visibles + images réseau interceptées.
   Sortie : arbre/research/ad78raw/ + arbre/research/AD78-POISSY.md.
   Réseau ouvert requis (runner CI). Usage : node tools/arbre/fetch-ad78-poissy.mjs
============================================================================= */
import { chromium } from 'playwright';
import fs from 'fs';

const OUT = 'arbre/research/ad78raw';
fs.mkdirSync(OUT, { recursive: true });
const L = ['# 🏛 AD78 — registres de Poissy (naissance Guy Édouard DESARZENS, 7.03.1918) — ' + new Date().toISOString().slice(0, 10), ''];
const log = s => { console.log(s); L.push(s); };

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  viewport: { width: 1500, height: 1100 }, locale: 'fr-FR',
});
const pg = await ctx.newPage();
const netImgs = [];
pg.on('response', async r => {
  try {
    const u = r.url(), ct = r.headers()['content-type'] || '';
    if (/image\/(jpeg|jp2|png|tiff)/.test(ct) && !/logo|icone|icon|sprite|bandeau/i.test(u)) {
      const b = await r.body(); if (b && b.length > 40000) netImgs.push({ u, len: b.length, b });
    }
  } catch (e) {}
});

async function step(name, url) {
  log('\n## ' + name + '\n- URL : ' + url);
  try {
    const resp = await pg.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await pg.waitForTimeout(3500);
    log('- HTTP ' + (resp ? resp.status() : '?') + ' · titre : « ' + (await pg.title()).slice(0, 90) + ' »');
    const shot = OUT + '/' + name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.png';
    await pg.screenshot({ path: shot, fullPage: false });
    log('- capture : ' + shot);
    const body = (await pg.evaluate(() => document.body.innerText.slice(0, 500))).replace(/\s+/g, ' ');
    log('- début de page : ' + body.slice(0, 220));
    if (/rejected|blocked|access denied|forbidden|captcha/i.test(body)) log('- ⛔ BLOCAGE détecté (mur anti-robot)');
    const links = await pg.evaluate(() => [...document.querySelectorAll('a')]
      .map(a => ({ t: (a.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 70), h: a.href }))
      .filter(x => x.t && /etat.?civil|registre|naissance|mariage|poissy|recherche|archives en ligne|numeris/i.test(x.t + ' ' + x.h)).slice(0, 25));
    if (links.length) { log('- liens utiles :'); links.forEach(l => log('  · [' + l.t + '](' + l.h + ')')); }
    return { ok: true, links };
  } catch (e) { log('- ✗ échec : ' + String(e.message || e).slice(0, 140)); return { ok: false, links: [] }; }
}

/* 1) Accueil + entrées connues des AD78 (archives.yvelines.fr, moteur état civil) */
const tries = [
  ['accueil', 'https://archives.yvelines.fr/'],
  ['etat-civil', 'https://archives.yvelines.fr/rubriques/etat-civil'],
  ['recherche-etat-civil', 'https://archives.yvelines.fr/s/2/etat-civil?commune=Poissy'],
  ['moteur-arko', 'https://archives.yvelines.fr/arkotheque/inventaires/ead_ir_consult.php'],
];
let found = [];
for (const [n, u] of tries) { const r = await step(n, u); found = found.concat(r.links || []); }

/* 2) Suivre les 6 liens les plus prometteurs (Poissy / état civil / naissances) */
const seen = new Set(); let i = 0;
for (const l of found) {
  if (seen.has(l.h) || i >= 6) continue; seen.add(l.h); i++;
  const r = await step('suivi-' + i, l.h);
  /* si un champ commune existe, tenter Poissy 1918 */
  try {
    const inp = pg.locator('input[name*=commune i], input[placeholder*=commune i], input[type=text]').first();
    if (await inp.count()) {
      await inp.fill('Poissy'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(3500);
      await pg.screenshot({ path: OUT + '/suivi-' + i + '-poissy.png' });
      log('- recherche « Poissy » soumise → capture suivi-' + i + '-poissy.png');
      const rows = await pg.evaluate(() => document.body.innerText.match(/[^\n]*(naissance|mariage|1918|191[0-9]|table.*decennale)[^\n]*/gi)?.slice(0, 20) || []);
      rows.forEach(r2 => log('  · ' + r2.replace(/\s+/g, ' ').slice(0, 130)));
    }
  } catch (e) {}
}

/* 3) images d'actes interceptées */
log('\n## Images réseau interceptées : ' + netImgs.length);
netImgs.slice(0, 12).forEach((im, ix) => {
  const p = OUT + '/img-' + (ix + 1) + '.jpg';
  fs.writeFileSync(p, im.b); log('- ' + p + ' (' + Math.round(im.len / 1024) + ' Ko) ← ' + im.u.slice(0, 120));
});

log('\n## Verdict');
log(netImgs.length ? '✅ Le robot ACCÈDE aux images AD78 → on peut aspirer le registre Poissy naissances 1918.'
  : '⚠️ Aucune image d\'acte interceptée — soit navigation à affiner (voir captures/liens ci-dessus), soit mur anti-robot : dans ce cas, ouverture depuis le téléphone de Kevin OU demande à la mairie de Poissy (acte >100 ans, communicable à tous).');
fs.writeFileSync('arbre/research/AD78-POISSY.md', L.join('\n') + '\n');
await browser.close();
console.log('\nRapport : arbre/research/AD78-POISSY.md');
