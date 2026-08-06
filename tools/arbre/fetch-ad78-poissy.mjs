/* =============================================================================
   ARBRE — AD78 v2 : registre POISSY naissances 1918 (Guy Édouard DESARZENS, 7.03.1918)
   La v1 a PROUVÉ : AD78 ne bloque pas les robots + API images /image/{doc}/{page}.
   La v2 cible le moteur « Registres paroissiaux et d'état civil » : commune Poissy,
   période 1918, ouvre le(s) registre(s), aspire les premières pages (mars 1918 est
   tôt dans l'année) + le permalien. Résilient : dump du formulaire + captures à
   chaque étape pour affiner au besoin. Sortie : ad78raw/ + AD78-POISSY.md.
   Réseau ouvert requis (runner CI). Usage : node tools/arbre/fetch-ad78-poissy.mjs
============================================================================= */
import { chromium } from 'playwright';
import fs from 'fs';

const OUT = 'arbre/research/ad78raw';
fs.mkdirSync(OUT, { recursive: true });
const L = ['# 🏛 AD78 v2 — Poissy naissances 1918 (acte Guy Édouard DESARZENS) — ' + new Date().toISOString().slice(0, 10), ''];
const log = s => { console.log(s); L.push(s); };

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  viewport: { width: 1500, height: 1100 }, locale: 'fr-FR',
});
const pg = await ctx.newPage();
const imgs = [];
pg.on('response', async r => {
  try {
    const u = r.url();
    if (/\/image\/\d+\/\d+/.test(u) && /jpg|jpeg/.test((r.headers()['content-type'] || '') + u)) {
      const b = await r.body(); if (b && b.length > 50000) imgs.push({ u, b });
    }
  } catch (e) {}
});
async function shot(n) { const p = OUT + '/' + n + '.png'; await pg.screenshot({ path: p }); log('- capture : ' + p); }
async function killCookies() {
  for (const t of ['Tout accepter', 'Accepter', 'J\'accepte', 'OK']) {
    try { const b = pg.getByRole('button', { name: t }).first(); if (await b.count()) { await b.click({ timeout: 1500 }); await pg.waitForTimeout(500); return; } } catch (e) {}
  }
}

log('## 1) Page « Registres paroissiaux et d\'état civil »');
await pg.goto('https://archives.yvelines.fr/rechercher/archives-en-ligne/registres-paroissiaux-et-detat-civil', { waitUntil: 'domcontentloaded', timeout: 45000 });
await pg.waitForTimeout(3000); await killCookies(); await shot('v2-01-page');

/* Dump du formulaire (pour affiner si besoin) */
const form = await pg.evaluate(() => [...document.querySelectorAll('input,select,button')].map(e => ({
  tag: e.tagName, type: e.type || '', name: e.name || '', id: e.id || '', ph: e.placeholder || '',
  txt: (e.innerText || e.value || '').trim().slice(0, 40),
  opts: e.tagName === 'SELECT' ? [...e.options].map(o => o.text.trim().slice(0, 30)).slice(0, 15) : undefined,
})).filter(x => x.type !== 'hidden').slice(0, 40));
log('- formulaire : ' + JSON.stringify(form).slice(0, 1800));

log('\n## 2) Recherche Poissy / 1918');
try {
  /* commune : input texte ou autocomplete */
  const commune = pg.locator('input[name*=commune i], input[id*=commune i], input[placeholder*=commune i], input[type=text]').first();
  await commune.fill('Poissy'); await pg.waitForTimeout(1800);
  const sug = pg.locator('li,option,.autocomplete li, .ui-menu-item').filter({ hasText: /^Poissy/i }).first();
  if (await sug.count()) { await sug.click(); log('- suggestion « Poissy » cliquée'); }
  /* type d'acte + années si présents */
  for (const sel of await pg.locator('select').all()) {
    const opts = await sel.evaluate(e => [...e.options].map(o => o.text));
    const hit = opts.find(o => /naissance/i.test(o)); if (hit) { await sel.selectOption({ label: hit }); log('- type d\'acte : ' + hit); }
  }
  for (const [selr, val] of [[ 'input[name*=debut i], input[id*=debut i], input[placeholder*=début i]', '1918'], ['input[name*=fin i], input[id*=fin i], input[placeholder*=fin i]', '1918']]) {
    const e = pg.locator(selr).first(); if (await e.count()) { await e.fill(val); log('- année : ' + val); }
  }
  await shot('v2-02-form-rempli');
  const go = pg.getByRole('button', { name: /rechercher|valider|ok/i }).first();
  if (await go.count()) await go.click(); else await pg.keyboard.press('Enter');
  await pg.waitForTimeout(4500); await shot('v2-03-resultats');
} catch (e) { log('- ⚠ formulaire : ' + String(e.message || e).slice(0, 120)); }

/* 3) Résultats : lignes contenant Poissy + 191x */
const rows = await pg.evaluate(() => [...document.querySelectorAll('a,tr,li,div[class*=result i]')]
  .map(e => ({ t: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 140), h: e.href || (e.querySelector && e.querySelector('a') ? e.querySelector('a').href : '') }))
  .filter(x => x.t && /poissy/i.test(x.t) && /19[01][0-9]|naissance|NMD/i.test(x.t)).slice(0, 20));
log('\n## 3) Résultats Poissy : ' + rows.length);
rows.forEach(r => log('  · ' + r.t + (r.h ? ' → ' + r.h : '')));

/* 4) Ouvrir le meilleur résultat (couvre 1918) puis feuilleter les 1res pages (mars = début d'année) */
const best = rows.find(r => r.h && /1918|191[0-9]/.test(r.t)) || rows.find(r => r.h);
if (best) {
  log('\n## 4) Ouverture : ' + best.t);
  try {
    await pg.goto(best.h, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await pg.waitForTimeout(5000); await killCookies(); await shot('v2-04-registre');
    log('- permalien : ' + pg.url());
    /* avancer ~10 vues (l'acte du 7 mars est dans les premières pages de l'année) */
    for (let i = 0; i < 10; i++) {
      const nxt = pg.locator('[title*=suivante i], [aria-label*=suivante i], .next, [class*=next i]').first();
      if (await nxt.count()) { await nxt.click({ timeout: 2000 }).catch(() => {}); await pg.waitForTimeout(1600); } else break;
    }
    await shot('v2-05-feuilletage');
  } catch (e) { log('- ✗ ouverture : ' + String(e.message || e).slice(0, 120)); }
} else log('\n## 4) Aucun résultat exploitable — voir captures + dump du formulaire pour affiner.');

/* 5) Sauver les images d'actes interceptées */
log('\n## 5) Pages de registre interceptées : ' + imgs.length);
imgs.slice(0, 15).forEach((im, ix) => {
  const p = OUT + '/poissy-1918-p' + String(ix + 1).padStart(2, '0') + '.jpg';
  fs.writeFileSync(p, im.b); log('- ' + p + ' (' + Math.round(im.b.length / 1024) + ' Ko) ← ' + im.u.slice(0, 130));
});
log('\n## Verdict');
log(imgs.length ? '✅ Pages du registre récupérées — chercher l\'acte du 7.03.1918 (parents + mention de mariage en marge).'
  : '🟡 Pas encore de pages : lire v2-01/02/03 (formulaire + résultats) pour affiner la navigation au prochain passage.');
fs.writeFileSync('arbre/research/AD78-POISSY.md', L.join('\n') + '\n');
await browser.close();
console.log('\nRapport : arbre/research/AD78-POISSY.md');
