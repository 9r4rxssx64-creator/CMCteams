/* =============================================================================
   ARBRE — VAGUE 5 : L'ÉCHO DE BEAUSOLEIL (Gallica) + CIMETIÈRES DE MONACO
   -----------------------------------------------------------------------------
   1. Gallica : trouver l'ark du périodique « L'Écho de Beausoleil et de
      Monte-Carlo » puis chercher DEDANS (arkPress) : MAIFFRET, CIAIS, SAUVAIGO,
      MOLINARIO — l'état civil local y était publié (famille d'Emmanuel à
      Beausoleil/Monte-Carlo 1905-1935).
   2. Cimetières de Monaco : registre des défunts en ligne (Mairie) — Paula
      MAIFFRET † Monaco 1994, Marie Anne DENTAU † 1911, etc. → emplacement de
      tombe (photo possible ensuite).
   3. Journal de Monaco : soumettre le VRAI formulaire de recherche (Playwright),
      pas l'URL motclef (0 résultat au run précédent).
   4. Presse suisse : format de requête Veridian correct (txIN=...).
   Sorties : arbre/research/echoraw/ + ECHO-CIMETIERES.md
============================================================================= */
import { chromium } from 'playwright';
import fs from 'fs';

const OUT = 'arbre/research/echoraw';
fs.mkdirSync(OUT, { recursive: true });
const L = ['# 📰 Vague 5 — L\'Écho de Beausoleil + cimetières Monaco (' + new Date().toISOString().slice(0, 10) + ')', ''];
function log(s) { console.log(s); L.push(s); }

/* ============ 1) Gallica — ark du périodique puis recherche DEDANS ============ */
log('## 📰 L\'Écho de Beausoleil et de Monte-Carlo (Gallica) — recherche DANS le journal');
let ark = '';
try {
  const q = '(gallica all "Écho de Beausoleil Monte-Carlo") and (dc.type all "periodique")';
  const r = await fetch('https://gallica.bnf.fr/SRU?operation=searchRetrieve&version=1.2&query=' + encodeURIComponent(q) + '&maximumRecords=5');
  const xml = await r.text();
  fs.writeFileSync(OUT + '/gallica-ark-lookup.xml', xml);
  const m = xml.match(/ark:\/12148\/(cb\d+[a-z]?)/);
  if (m) { ark = m[1]; log('- ark du périodique : **' + ark + '**'); }
  else log('- ark introuvable dans la réponse SRU (voir gallica-ark-lookup.xml)');
} catch (e) { log('- ÉCHEC lookup ark : ' + e.message.slice(0, 100)); }
if (ark) {
  for (const nom of ['MAIFFRET', 'CIAIS', 'SAUVAIGO', 'MOLINARIO', 'DENTAU']) {
    try {
      const q2 = '(gallica all "' + nom + '") and (arkPress all "' + ark + '_date")';
      const r2 = await fetch('https://gallica.bnf.fr/SRU?operation=searchRetrieve&version=1.2&query=' + encodeURIComponent(q2) + '&maximumRecords=15');
      const xml2 = await r2.text();
      fs.writeFileSync(OUT + '/echo-' + nom + '.xml', xml2);
      const n = (xml2.match(/numberOfRecords>(\d+)/) || [])[1] || '0';
      const dates = [...xml2.matchAll(/<dc:date>([^<]+)<\/dc:date>/g)].map(x => x[1]).slice(0, 15);
      const arks = [...xml2.matchAll(/ark:\/12148\/(bpt6k\d+[a-z]?)/g)].map(x => x[1]).slice(0, 15);
      log('- **' + nom + '** dans L\'Écho : ' + n + ' numéro(s)' + (dates.length ? ' — dates : ' + dates.join(', ') : ''));
      arks.slice(0, 8).forEach((a, i) => log('  · https://gallica.bnf.fr/ark:/12148/' + a + (dates[i] ? ' (' + dates[i] + ')' : '')));
    } catch (e) { log('- **' + nom + '** : ÉCHEC — ' + e.message.slice(0, 90)); }
  }
}

/* ============ helpers Playwright ============ */
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  viewport: { width: 1440, height: 1100 }, locale: 'fr-FR',
});
async function grab(tag, url, needle, wait) {
  const pg = await ctx.newPage();
  try {
    await pg.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await pg.waitForTimeout(wait || 3500);
    const html = await pg.content();
    fs.writeFileSync(OUT + '/' + tag + '.html', html);
    await pg.screenshot({ path: OUT + '/' + tag + '.png', fullPage: false }).catch(() => {});
    const text = await pg.evaluate(() => document.body ? document.body.innerText : '');
    fs.writeFileSync(OUT + '/' + tag + '.txt', text.slice(0, 150000));
    const hits = needle ? (text.match(needle) || []).length : 0;
    log('- **' + tag + '** : ok — ' + hits + ' mention(s) ([txt](echoraw/' + tag + '.txt) · [capture](echoraw/' + tag + '.png))');
    return { pg: null, text };
  } catch (e) { log('- **' + tag + '** : ÉCHEC — ' + e.message.slice(0, 110)); return { pg: null, text: '' }; }
  finally { await pg.close(); }
}

/* ============ 2) Cimetières de Monaco ============ */
log('');
log('## 🪦 Cimetières de Monaco — registre des défunts (Paula MAIFFRET † 1994, DENTAU † 1911…)');
await grab('mairie-cimetiere', 'https://www.mairie.mc/cimetiere', /cimeti/i);
await grab('mairie-cimetiere2', 'https://mairie.mc/services/cimetiere', /cimeti|défunt/i);
await grab('mairie-recherche-defunt', 'https://www.mairie.mc/recherche?q=cimeti%C3%A8re+d%C3%A9funt', /défunt|cimeti/i);
/* moteur de recherche du site de la Mairie pour trouver la bonne page */
const home = await grab('mairie-home', 'https://www.mairie.mc/', /cimeti/i);
const cimLinks = (home.text.match(/https?:\/\/\S*cimeti\S*/gi) || []).slice(0, 5);
for (let i = 0; i < cimLinks.length; i++) await grab('mairie-cim-lien' + (i + 1), cimLinks[i], /défunt|recherche|concession/i);

/* ============ 3) Journal de Monaco — VRAI formulaire ============ */
log('');
log('## 📰 Journal de Monaco — recherche via le vrai formulaire');
for (const nom of ['Maiffret', 'Sauvaigo', 'Ciais']) {
  const pg = await ctx.newPage();
  try {
    await pg.goto('https://journaldemonaco.gouv.mc/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await pg.waitForTimeout(3000);
    const done = await pg.evaluate(function (n) {
      var inp = document.querySelector('input[type=search], input[name*=motclef i], input[name*=search i], input[name*=recherche i], #motclef, .search input[type=text]');
      if (!inp) return 'pas de champ';
      inp.value = n;
      var f = inp.form; if (f) { f.submit(); return 'ok'; }
      inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      return 'enter';
    }, nom);
    await pg.waitForLoadState('domcontentloaded').catch(() => {});
    await pg.waitForTimeout(4000);
    const text = await pg.evaluate(() => document.body.innerText);
    fs.writeFileSync(OUT + '/jdm-form-' + nom + '.txt', text.slice(0, 120000));
    await pg.screenshot({ path: OUT + '/jdm-form-' + nom + '.png' }).catch(() => {});
    const hits = (text.match(new RegExp(nom, 'gi')) || []).length;
    log('- **JdM ' + nom + '** (' + done + ') : ' + hits + ' mention(s) ([txt](echoraw/jdm-form-' + nom + '.txt))');
  } catch (e) { log('- **JdM ' + nom + '** : ÉCHEC — ' + e.message.slice(0, 100)); }
  await pg.close();
}

/* ============ 4) Presse suisse — format Veridian correct ============ */
log('');
log('## 🇨🇭 Presse suisse (e-newspaperarchives.ch) — format corrigé');
await grab('ch-desarzens-v2', 'https://www.e-newspaperarchives.ch/?a=q&hs=1&r=1&results=1&txIN=Desarzens&dafdq=&dafmq=&dafyq=&datdq=&datmq=&datyq=&puq=&txq=&ssnip=txt&e=-------en-20--1--img-txIN--------', /Desarzens/i, 7000);
await grab('ch-sarzens-v2', 'https://www.e-newspaperarchives.ch/?a=q&hs=1&r=1&results=1&txIN=%22de+Sarzens%22&e=-------fr-20--1--img-txIN--------', /Sarzens/i, 7000);

await browser.close();
fs.writeFileSync('arbre/research/ECHO-CIMETIERES.md', L.join('\n') + '\n');
console.log('\nRapport : arbre/research/ECHO-CIMETIERES.md');
