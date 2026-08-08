/* LIRE-WEB — lire des pages publiques de généalogie avec un VRAI navigateur (Chromium).
 *
 * Pourquoi : Geneanet & co renvoient 403 aux fetchers simples (urllib, jina) — un vrai
 * navigateur passe souvent. Usage recherche d'ancêtres (Kevin 8.08.2026 : « remonte
 * avant Jean-Baptiste Maiffret 1815 »). Lecture seule, pages publiques uniquement.
 *
 * Usage : node tools/arbre/lire-web.mjs "<motclé>" <url1> [url2…]
 * Sort : titre + HTTP + extraits de texte autour du motclé + liens contenant le motclé.
 */
import { chromium } from 'playwright';

const motcle = (process.argv[2] || process.env.MOTCLE || 'MAIFFRET').toLowerCase();
/* URLs par variable d'environnement (les & et ; des URLs cassent l'interpolation shell) */
const urls = (process.env.URLS || process.argv.slice(3).join(' ')).split(/\s+/).filter(Boolean);
if (!urls.length) { console.error('aucune URL'); process.exit(2); }

const browser = await chromium.launch({ args: ['--disable-blink-features=AutomationControlled'] });
const ctx = await browser.newContext({
  viewport: { width: 1366, height: 900 },
  locale: 'fr-FR',
  ignoreHTTPSErrors: true, /* certains sites d'archives publics ont un certificat expiré */
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
});
/* Si la page porte un FORMULAIRE de recherche et que le motclé est absent du texte,
   on remplit le premier champ texte avec le motclé et on soumet (bases d'archives). */
async function remplirRecherche(page, k) {
  return page.evaluate((mot) => {
    const inp = [...document.querySelectorAll('form input[type="text"],form input[type="search"],form input:not([type])')]
      .find(i => i.offsetParent !== null);
    if (!inp) return null;
    const desc = 'champ ' + (inp.name || inp.id || '?') + ' du formulaire ' + (inp.form.action || '?');
    inp.value = mot;
    if (inp.form.requestSubmit) inp.form.requestSubmit(); else inp.form.submit();
    return desc;
  }, k);
}
for (const url of urls) {
  console.log('\n' + '='.repeat(72) + '\n### ' + url);
  const page = await ctx.newPage();
  try {
    const rep = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await page.waitForTimeout(6000);
    const r = await page.evaluate((k) => {
      const txt = (document.body && document.body.innerText) || '';
      const low = txt.toLowerCase();
      const ext = [];
      let i = 0, n = 0;
      while (n < 14 && (i = low.indexOf(k, i)) >= 0) {
        const seg = txt.slice(Math.max(0, i - 260), i + 320).replace(/\s+/g, ' ').trim();
        if (!ext.some(e => e === seg)) { ext.push(seg); n++; }
        i += k.length + 200;
      }
      const liens = [...document.querySelectorAll('a[href]')]
        .filter(a => (a.href + ' ' + a.textContent).toLowerCase().includes(k))
        .slice(0, 20).map(a => (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90) + ' → ' + a.href);
      return { titre: document.title, ext, liens, taille: txt.length };
    }, motcle);
    console.log('HTTP ' + (rep ? rep.status() : '?') + ' · « ' + r.titre + ' » · ' + r.taille + ' caractères de texte');
    if (r.ext.length) { console.log('--- ' + r.ext.length + ' EXTRAIT(S) autour de « ' + motcle + ' » ---'); r.ext.forEach(e => console.log('  • ' + e)); }
    else {
      console.log('(motclé absent du texte visible)');
      const soumis = await remplirRecherche(page, motcle).catch(() => null);
      if (soumis) {
        console.log('→ formulaire soumis (' + soumis + '), lecture du résultat…');
        await page.waitForTimeout(7000);
        const r2 = await page.evaluate((k) => {
          const txt = (document.body && document.body.innerText) || '';
          const low = txt.toLowerCase(); const ext = []; let i = 0, n = 0;
          while (n < 14 && (i = low.indexOf(k, i)) >= 0) { const seg = txt.slice(Math.max(0, i - 260), i + 320).replace(/\s+/g, ' ').trim(); if (!ext.includes(seg)) { ext.push(seg); n++; } i += k.length + 200; }
          return { url: location.href, ext, taille: txt.length };
        }, motcle);
        console.log('   page résultat : ' + r2.url + ' · ' + r2.taille + ' caractères');
        if (r2.ext.length) { console.log('--- ' + r2.ext.length + ' EXTRAIT(S) après recherche ---'); r2.ext.forEach(e => console.log('  • ' + e)); }
        else console.log('   (toujours aucun extrait)');
      }
    }
    if (r.liens.length) { console.log('--- LIENS ---'); r.liens.forEach(l => console.log('  ↪ ' + l)); }
  } catch (e) {
    console.log('❌ ' + e.message.split('\n')[0]);
  }
  await page.close();
}
await browser.close();
