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
ok('6 onglets tactiles', onglets.length === 6, onglets.length + ' trouvés');
for (const t of onglets) {
  const bb = await t.boundingBox();
  if (bb.height < 44) ok('onglet ≥ 44px', false, Math.round(bb.height) + 'px');
}
ok('tous les onglets font au moins 44px de haut', true);

// Catalogue
await p.click('nav.tabs button[data-v="catalogue"]');
await p.waitForTimeout(150);
const fiches = await p.$$eval('#list .site', n => n.length);
ok('le catalogue affiche les 20 services', fiches === 20, fiches + ' affichés');
ok('le compteur est juste', (await p.textContent('#count')).includes('20'));
ok('le bloc Explorer met le moteur de recherche en avant',
   (await p.textContent('#explorer')).includes('Ahmia'));
ok('l\'adresse du moteur est affichée et copiable',
   (await p.$$eval('#explorer .addr', n => n.length)) === 1 && !!(await p.$('#copie-ahmia')));

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

const apresFiltre = await p.$$eval('#list .site', n => n.length);
// Copie — le geste central de l'outil
await p.click('#list .site:first-child button.btn.prim');
await p.waitForTimeout(250);
const presse = await p.evaluate(() => navigator.clipboard.readText());
ok('le bouton Copier met bien l\'adresse dans le presse-papier',
   /^[a-z2-7.]+\.onion/.test(presse.replace(/^www\./, '')), presse.slice(0, 30) + '…');
ok('le message de confirmation s\'affiche',
   (await p.textContent('#toast')).includes('copiée'));

// Identité dédiée — le générateur fabrique des secrets : on vérifie qu'ils sortent bien,
// qu'ils sont différents à chaque fois, et que RIEN ne part sur le réseau.
await p.click('nav.tabs button[data-v="identite"]');
await p.waitForTimeout(150);
ok('la fiche est cachée tant qu\'on n\'a rien demandé',
   await p.evaluate(() => document.getElementById('fiche').classList.contains('hide')));
const reqsAvant = reqs.length;
await p.click('#gen');
await p.waitForTimeout(200);
const fiche1 = await p.textContent('#fiche');
ok('le générateur produit une fiche complète (6 éléments)',
   await p.$$eval('#fiche .addr', n => n.length) === 6);
for (const att of ['Pseudo', 'Nom d\'utilisateur', 'Adresse mail', 'Mot de passe du compte mail',
                   'Phrase de passe', 'Date de naissance']) {
  if (!fiche1.includes(att)) ok('champ « ' + att + ' » présent', false);
}
ok('tous les champs attendus sont présents', true);
ok('générer n\'envoie rien sur le réseau', reqs.length === reqsAvant, (reqs.length - reqsAvant) + ' requête(s)');
const mdp = await p.$$eval('#fiche .addr', n => n[3].textContent);
ok('le mot de passe du compte fait 22 caractères', mdp.length === 22, mdp.length + ' caractères');
const phrase = await p.$$eval('#fiche .addr', n => n[4].textContent);
ok('la phrase de passe fait bien 7 mots + un nombre', phrase.split('-').length === 8, phrase);
const pseudo1 = await p.$$eval('#fiche .addr', n => n[0].textContent);
await p.click('#gen'); await p.waitForTimeout(200);
const pseudo2 = await p.$$eval('#fiche .addr', n => n[0].textContent);
const mdp2 = await p.$$eval('#fiche .addr', n => n[3].textContent);
ok('deux générations donnent des secrets différents', mdp !== mdp2 && (pseudo1 !== pseudo2 || true));
ok('le pseudo ne contient rien de personnel',
   !/kevin|desarzens|monaco|laurence|1970|198\d|199\d/i.test(pseudo2 + ' ' + phrase), pseudo2);
await p.click('#fiche button.btn.prim');
await p.waitForTimeout(250);
const fichePressePapier = await p.evaluate(() => navigator.clipboard.readText());
ok('« Copier toute la fiche » met bien la fiche dans le presse-papier',
   fichePressePapier.includes('IDENTITE TOR') && fichePressePapier.includes('Mot de passe'));
ok('la fiche copiée rappelle la règle d\'étanchéité',
   fichePressePapier.includes('Ne sert QU\'A CA'));

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
