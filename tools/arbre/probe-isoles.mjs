/* =============================================================================
   ARBRE — SONDE CIBLÉE « MEMBRES ISOLÉS »
   -----------------------------------------------------------------------------
   3 personnes isolées n'ont pas d'acte en ligne. Leurs AVIS DE DÉCÈS récents
   peuvent nommer la famille (= preuve de raccordement) :
   - Claude Alain DE SARZENS  † 10.05.2022 en Suisse  → hommages.ch (avis suisses)
   - Myriam MAIFFRET          † 06.10.2024 à Nice     → avis Nice-Matin / Dans Nos Cœurs / Libra Memoria
   - (bonus) Journal de Monaco 1935 : annonce de naissance de Myriam (5.03.1935)
   Réseau ouvert requis (CI). Sorties : arbre/research/isolesraw/ + ISOLES.md
============================================================================= */
import { chromium } from 'playwright';
import fs from 'fs';

const OUT = 'arbre/research/isolesraw';
fs.mkdirSync(OUT, { recursive: true });
const L = ['# 🔗 Sonde « membres isolés » — ' + new Date().toISOString().slice(0, 10), ''];
function log(s) { console.log(s); L.push(s); }

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  viewport: { width: 1440, height: 1100 }, locale: 'fr-FR',
});

async function grab(tag, url, opts) {
  opts = opts || {};
  const pg = await ctx.newPage();
  try {
    await pg.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await pg.waitForTimeout(opts.wait || 3500);
    const html = await pg.content();
    fs.writeFileSync(OUT + '/' + tag + '.html', html);
    await pg.screenshot({ path: OUT + '/' + tag + '.png', fullPage: true }).catch(() => {});
    const text = await pg.evaluate(() => document.body ? document.body.innerText : '');
    fs.writeFileSync(OUT + '/' + tag + '.txt', text.slice(0, 200000));
    const hit = opts.needle ? (text.match(opts.needle) || [])[0] : null;
    log('- **' + tag + '** : HTTP ok, ' + Math.round(html.length / 1024) + ' Ko' + (opts.needle ? (hit ? ' — 🎯 TROUVÉ « ' + hit + ' »' : ' — rien pour « ' + opts.needle + ' »') : '') + ' ([txt](isolesraw/' + tag + '.txt) · [capture](isolesraw/' + tag + '.png))');
    return text;
  } catch (e) {
    log('- **' + tag + '** : ÉCHEC — ' + e.message.slice(0, 120));
    return '';
  } finally { await pg.close(); }
}

/* ---- 1) Claude Alain DE SARZENS — avis suisses ---- */
log('## 🇨🇭 Claude Alain DE SARZENS († 10.05.2022, Suisse)');
await grab('hommages-sarzens', 'https://www.hommages.ch/recherche?q=Sarzens', { needle: /SARZENS|Sarzens/ });
await grab('hommages-desarzens', 'https://www.hommages.ch/recherche?q=Desarzens', { needle: /Claude/ });
/* moteur interne alternatif */
await grab('hommages-avis-desarzens', 'https://www.hommages.ch/avis/recherche/?search=Desarzens', { needle: /Claude/ });

/* ---- 2) Myriam MAIFFRET — avis Nice 2024 ---- */
log('');
log('## 🕯 Myriam MAIFFRET († 06.10.2024, Nice)');
await grab('dansnoscoeurs-maiffret', 'https://www.dansnoscoeurs.fr/recherche?nom=MAIFFRET', { needle: /Myriam|MAIFFRET/ });
await grab('avisdeces-nicematin-maiffret', 'https://avis-deces.nicematin.com/recherche?q=MAIFFRET', { needle: /Myriam|MAIFFRET/ });
await grab('libramemoria-maiffret', 'https://www.libramemoria.com/avis?search=MAIFFRET', { needle: /Myriam|MAIFFRET/ });
await grab('avis-deces-fr-maiffret', 'https://www.avis-deces.net/resultat-recherche-avis.php?nomdefunt=MAIFFRET', { needle: /Myriam/ });

/* ---- 3) Journal de Monaco 1935 — annonce naissance Myriam (5.03.1935) ---- */
log('');
log('## 📰 Journal de Monaco — mars 1935 (naissance Myriam 5.03.1935 + état civil MAIFFRET)');
await grab('jdm-recherche-maiffret', 'https://journaldemonaco.gouv.mc/Recherche?motclef=MAIFFRET', { needle: /MAIFFRET/, wait: 5000 });
await grab('jdm-archives-1935', 'https://journaldemonaco.gouv.mc/Journaux/1935', { needle: /1935/, wait: 5000 });

/* ---- 4) Jean Marius Victor SAUVAIGO — état civil Nice = AD06 (bloqué datacenter) : tenter Geneanet public + Filae landing ---- */
log('');
log('## 🌐 Jean Marius Victor SAUVAIGO (n. 12.07.1912 Nice) — pistes publiques');
await grab('geneanet-sauvaigo-nice', 'https://www.geneanet.org/fonds/individus/?nom=SAUVAIGO&prenom=Jean&go=1', { needle: /SAUVAIGO/ });
await grab('deces-matchid-jmv', 'https://deces.matchid.io/deces/api/v1/search?q=Jean%20Marius%20Victor%20SAUVAIGO', { needle: /SAUVAIGO/i, wait: 2500 });

await browser.close();
fs.writeFileSync('arbre/research/ISOLES.md', L.join('\n') + '\n');
console.log('\nRapport : arbre/research/ISOLES.md');
