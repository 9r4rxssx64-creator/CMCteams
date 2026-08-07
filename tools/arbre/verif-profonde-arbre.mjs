/* Vérif PROFONDE de l'arbre (local) : 5 onglets, album blasons, fiches Monique/Marielle,
 * les 2 familles, recherche — 0 erreur JS attendu. Lancer depuis apex-ai/v13 (playwright y est
 * installé) avec le repo servi sur :8123 : python3 -m http.server 8123 &
 * node ../../tools/arbre/verif-profonde-arbre.mjs  (session 2026-08-07, « simule ma co ») */
import { chromium } from 'playwright';
const browser = await chromium.launch();
const errs = [];
const ctx = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
const page = await ctx.newPage();
page.on('pageerror', e => errs.push('JS: ' + e.message));
page.on('requestfailed', r => { const u = r.url(); if (!/googleapis|firebase|gstatic/.test(u)) errs.push('REQ: ' + u.slice(0, 90)); });
await page.addInitScript(() => {
  localStorage.setItem('arbre_trust', '1');
  localStorage.setItem('arbre_fam', 'o');
  sessionStorage.setItem('arbre_unlocked', '1');
});
await page.goto('http://localhost:8123/arbre/index.html', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2200);
const out = [];
const shot = async n => page.screenshot({ path: '/tmp/deep-' + n + '.png' });

// 1. version affichée
out.push(['version badge', await page.evaluate(() => (document.body.textContent.match(/v2\.\d+/) || ['?'])[0])]);

// 2. chaque onglet rend sans crash ni vue vide
for (const tab of ['Arbre', 'Personnes', 'Actes', 'Blasons', 'Réglages']) {
  await page.evaluate(t => { const b = [...document.querySelectorAll('#tabs .tab')].find(x => x.textContent.includes(t)); if (b) b.click(); }, tab);
  await page.waitForTimeout(900);
  const len = await page.evaluate(() => document.querySelector('#wrap') ? document.querySelector('#wrap').innerHTML.length : 0);
  out.push(['onglet ' + tab, len > 500 ? 'OK (' + len + ' ch)' : '❌ VIDE (' + len + ')']);
  await shot('tab-' + tab);
}

// 3. Blasons : sections réels/créés + rendu SVG
await page.evaluate(() => { const b = [...document.querySelectorAll('#tabs .tab')].find(x => x.textContent.includes('Blasons')); if (b) b.click(); });
await page.waitForTimeout(800);
const bl = await page.evaluate(() => {
  const t = document.querySelector('#wrap').textContent;
  return { reels: /attesté|réel|Réels|authentique/i.test(t), crees: /créé|Créés|dessiné/i.test(t), svg: document.querySelectorAll('#wrap svg').length };
});
out.push(['blasons', 'sections réels=' + bl.reels + ' créés=' + bl.crees + ' · ' + bl.svg + ' SVG rendus']);

// 4. fiche Monique : décès affiché, plus de badge vivant, fille Marielle listée
await page.evaluate(() => { const b = [...document.querySelectorAll('#tabs .tab')].find(x => x.textContent.includes('Personnes')); if (b) b.click(); });
await page.waitForTimeout(700);
await page.evaluate(() => openPerson('seed_monique_maiffret'));
await page.waitForTimeout(700);
const mo = await page.evaluate(() => {
  const t = (document.querySelector('.ov') || document.body).textContent;
  return { vivant: /vivant/i.test(t.slice(0, 400)), deces: /DÉCÉDÉE|décédée/i.test(t), marielle: /Marielle/.test(t) };
});
out.push(['fiche Monique', 'badge vivant=' + mo.vivant + ' · mention décès=' + mo.deces + ' · Marielle visible=' + mo.marielle]);
await shot('fiche-monique');
await page.evaluate(() => closeOverlay());

// 5. fiche Marielle existe et rattachée à Monique
await page.evaluate(() => openPerson('seed_marielle'));
await page.waitForTimeout(600);
const ma = await page.evaluate(() => { const t = (document.querySelector('.ov') || document.body).textContent; return { monique: /Monique/.test(t), ok: /Marielle/.test(t) }; });
out.push(['fiche Marielle', 'existe=' + ma.ok + ' · mère Monique visible=' + ma.monique]);
await shot('fiche-marielle');
await page.evaluate(() => closeOverlay());

// 6. les 2 familles rendent + compte de cartes
for (const fam of ['o', 'c']) {
  const n = await page.evaluate(f => { localStorage.setItem('arbre_fam', f); location.hash = ''; FAMKEY = f; render(); const L = layoutMainFamily(); return L ? L.nodes.length : 0; }, fam);
  out.push(['famille ' + fam, n + ' cartes rendues']);
}

// 7. recherche fonctionne
const sr = await page.evaluate(() => { try { openSearch('Ronan'); const t = (document.querySelector('.ov') || document.body).textContent; closeOverlay(); return /Ronan/.test(t); } catch (e) { return 'ERR ' + e.message; } });
out.push(['recherche "Ronan"', sr === true ? 'OK' : sr]);

console.log('=== VÉRIF PROFONDE ARBRE (local, v courante) ===');
out.forEach(o => console.log('  •', o[0] + ' → ' + o[1]));
console.log('Erreurs JS/réseau:', errs.length ? errs.slice(0, 8) : 'AUCUNE');
await browser.close();
