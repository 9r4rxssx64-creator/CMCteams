/* Preuve NAVIGATEUR RÉEL de « Tor en clair » (tools/tor/index.html) — Kevin 2026-09-15.
 * Un test statique dit que le texte est là ; celui-ci prouve que la PAGE MARCHE sur
 * l'écran de Kevin : Chromium réel, iPhone SE 375px, 0 erreur JS, 0 requête sortante,
 * onglets, recherche, filtre, bouton Copier (presse-papier réellement lu), quiz.
 * Lancer : npm run tor:verif   (exige Playwright — CI, pas le bac à sable)
 */
import { chromium } from 'playwright';
const PAGE = new URL('../tools/tor/index.html', import.meta.url).href;
let ko = 0;
const ok = (n, c, det='') => { console.log((c ? '  ✓ ' : '  ✗ ') + n + (det ? ' — ' + det : '')); if (!c) ko++; };

const b = await chromium.launch({ headless: true });
// iPhone SE — le plus petit écran réel de Kevin
const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
  permissions: ['clipboard-read', 'clipboard-write'] });
const p = await ctx.newPage();
const erreurs = [], reqs = [];
p.on('pageerror', e => erreurs.push(e.message));
p.on('console', m => { if (m.type() === 'error') erreurs.push('console: ' + m.text()); });
p.on('request', r => { if (!r.url().startsWith('file://')) reqs.push(r.url()); });
await p.goto(PAGE, { waitUntil: 'networkidle' });

ok('la page se charge sans aucune erreur JS', erreurs.length === 0, erreurs.join(' | '));
ok('aucune requête réseau sortante (rien n\'appelle personne)', reqs.length === 0, reqs.join(' | '));
ok('pas de défilement horizontal sur iPhone SE (375px)',
   await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
   'scrollWidth=' + await p.evaluate(() => document.documentElement.scrollWidth));

// Onglets
const onglets = await p.$$('nav.tabs button');
ok('5 onglets tactiles', onglets.length === 5, onglets.length + ' trouvés');
for (const t of onglets) {
  const bb = await t.boundingBox();
  if (bb.height < 44) ok('onglet ≥ 44px', false, Math.round(bb.height) + 'px');
}
ok('tous les onglets font au moins 44px de haut', true);

// Catalogue
await p.click('nav.tabs button[data-v="catalogue"]');
await p.waitForTimeout(150);
const fiches = await p.$$eval('#list .site', n => n.length);
ok('le catalogue affiche les 19 services', fiches === 19, fiches + ' affichés');
ok('le compteur est juste', (await p.textContent('#count')).includes('19'));

// Recherche
await p.fill('#q', 'presse');
await p.waitForTimeout(120);
const apres = await p.$$eval('#list .site', n => n.length);
ok('la recherche filtre (« presse » → moins de fiches)', apres > 0 && apres < 19, apres + ' fiches');
await p.fill('#q', 'zzzz');
await p.waitForTimeout(120);
ok('recherche sans résultat → message clair, pas une page vide',
   (await p.textContent('#list')).includes('Rien ici'));
await p.fill('#q', '');
await p.waitForTimeout(120);

// Filtre par catégorie
await p.click('.chip:nth-child(2)');
await p.waitForTimeout(120);
const cat = await p.$$eval('#list .site', n => n.length);
ok('le filtre par catégorie marche', cat > 0 && cat < 19, cat + ' fiches');
await p.click('.chip:nth-child(1)');
await p.waitForTimeout(120);

// Copie — le geste central de l'outil
await p.click('#list .site:first-child button.btn.prim');
await p.waitForTimeout(250);
const presse = await p.evaluate(() => navigator.clipboard.readText());
ok('le bouton Copier met bien l\'adresse dans le presse-papier',
   /^[a-z2-7.]+\.onion/.test(presse.replace(/^www\./, '')), presse.slice(0, 30) + '…');
ok('le message de confirmation s\'affiche',
   (await p.textContent('#toast')).includes('copiée'));

// Quiz
await p.click('nav.tabs button[data-v="quiz"]');
await p.waitForTimeout(150);
ok('le quiz affiche 6 questions', await p.$$eval('#quiz .q', n => n.length) === 6);
await p.click('#quiz .q:first-child .opt:nth-child(3)'); // la bonne réponse (index 1 → 3e enfant)
await p.waitForTimeout(150);
ok('répondre affiche l\'explication', (await p.$$eval('#quiz .exp', n => n.length)) === 1);
ok('le score s\'affiche', (await p.textContent('#score')).includes('1 / 1'));

// Sécurité + mémoire d'onglet
await p.click('nav.tabs button[data-v="secu"]');
await p.waitForTimeout(120);
ok('la page Sécurité affiche les 8 règles', await p.$$eval('#v-secu li', n => n.length) >= 8);
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(200);
ok('l\'app rouvre sur le dernier onglet consulté',
   await p.evaluate(() => document.querySelector('#v-secu').classList.contains('hide') === false));

await p.screenshot({ path: process.argv[2] || 'tor-iphone.png', fullPage: false });
await b.close();
console.log('\n' + (ko ? '❌ ' + ko + ' échec(s)' : '✅ Tout passe — vérifié dans un vrai Chromium, écran iPhone SE'));
process.exit(ko ? 1 : 0);
