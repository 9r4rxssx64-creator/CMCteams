/* Garde de la fabrique de produits (tools/produits) — hors ligne, dans test:ci.
   Ce qui coûte de l'argent si c'est faux : un prix du catalogue ≠ prix vérifié par
   la caisse (paiement jamais reconnu), deux produits au même prix (confondus par
   le webhook), un module refusé qui finit quand même en base, une page en retard
   sur le catalogue, du contenu payant dans un fichier public. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import * as F from '../tools/produits/fabrique.mjs';
import * as P from '../tools/produits/pages.mjs';
import { __test as VENTE } from '../services/kdmc-vente/worker.js';

const CAT = F.lireCatalogue();
const DIR = new URL('../shops/kit-ia/', import.meta.url);
const INDEX = readFileSync(new URL('index.html', DIR), 'utf8');
const JS = readFileSync(new URL('kit.js', DIR), 'utf8');
const WF = readFileSync(new URL('../.github/workflows/produit-fabrique.yml', import.meta.url), 'utf8');

/* Un module conforme, fabriqué à la main : sert d'étalon ET de base aux sabotages. */
function bon(p, i = 1) {
  const m = p.modules[i];
  const consigne = (t) => '<h3>' + t + '</h3>\n<pre class="consigne">Tu es mon assistant pour [mon métier]. Écris [ce que je veux] pour [qui], ton [ton], en [longueur]. Format : [format].</pre>\n<div class="exemple">Voici un exemple de résultat obtenu, écrit en français avec des accents : réponse courte, précise, polie, prête à être relue puis envoyée depuis le téléphone. Elle tient en cinq lignes et ne contient aucune donnée personnelle.</div>';
  const phrase = 'Tu ouvres ton assistant, tu colles la consigne, tu remplaces les crochets par tes informations réelles, tu relis la réponse et tu l\'envoies. ';
  const remplissage = Array.from({ length: 22 }, () => phrase + 'Cette étape prend une minute et t\'évite une heure de rédaction pénible, même quand tu es fatigué le soir, même depuis le métro. ').join('');
  return '<h2>Module ' + (i + 1) + ' — ' + m.titre + '</h2>\n<p class="promesse">À la fin, tu sais faire ce que promet ce module en moins de cinq minutes, depuis ton téléphone.</p>\n<p>' + remplissage + '</p>\n<ol><li>Étape une, tu ouvres l\'application.</li><li>Étape deux, tu colles la consigne.</li><li>Étape trois, tu relis.</li><li>Étape quatre, tu envoies.</li></ol>\n'
    + consigne('Premier résultat obtenu') + '\n' + consigne('Deuxième résultat obtenu') + '\n'
    + (p.exemplesMin ? Array.from({ length: p.exemplesMin }, (_, k) => '<div class="exemple">Variante numéro ' + (k + 1) + ' : merci pour ta visite, à très bientôt, nous étions ravis de t\'accueillir et nous espérons te revoir prochainement dans notre établissement.</div>').join('\n') + '\n' : '')
    + '<div class="attention"><ul><li>Jamais de nom réel ni de numéro de carte.</li><li>Relis avant d\'envoyer.</li><li>L\'IA peut inventer un chiffre.</li></ul></div>\n<div class="check"><p>☐ J\'ai relu ☐ J\'ai remplacé les crochets ☐ J\'ai vérifié les faits ☐ J\'ai envoyé</p></div>';
}

test('catalogue : ids, prix uniques dans TOUTE la caisse, 7 modules, module 1 gratuit, briefs présents', () => {
  assert.ok(CAT.produits.length >= 4);
  const prix = Object.values(VENTE.PRODUITS).map((v) => v.prix);
  assert.equal(new Set(prix).size, prix.length, 'deux produits partagent un prix : le webhook PayPal les confondrait');
  for (const p of CAT.produits) {
    const v = VENTE.PRODUITS[p.id];
    assert.ok(v, p.id + ' absent de la caisse (services/kdmc-vente/worker.js PRODUITS)');
    assert.equal(v.prix, p.prix, p.id + ' : le catalogue dit ' + p.prix + ' €, la caisse vérifie ' + v.prix + ' €');
    assert.equal(v.nom, p.nom, p.id + ' : nom différent entre catalogue et caisse');
    assert.equal(v.livre, 'https://kit.kd-mc.com/lire.html?produit=' + p.id, p.id + ' : le lecteur doit recevoir le produit');
    assert.deepEqual(v.contenu, [p.id]);
    assert.equal(p.modules.length, 7, p.id + ' : 7 modules attendus');
    assert.equal(p.modules.filter((m) => m.gratuit).length, 1, p.id + ' : exactement un module gratuit');
    assert.ok(p.modules[0].gratuit, p.id + ' : le module gratuit est le premier (celui de l\'aperçu)');
    for (const m of p.modules) { assert.ok(m.titre && m.brief && m.brief.length > 60, p.id + ' : brief trop court pour « ' + m.titre + ' »'); assert.ok(!/<pre class="consigne">/.test(m.brief)); }
    assert.match(p.slug, /^[a-z]+$/); assert.ok(p.promesse && p.phrase && p.cible);
  }
  assert.equal(new Set(CAT.produits.map((p) => p.slug)).size, CAT.produits.length, 'slugs en double');
  assert.equal(new Set(CAT.produits.map((p) => p.id)).size, CAT.produits.length, 'ids en double');
});

test('contrôle de vérité : l\'étalon passe, chaque sabotage est refusé (porte discriminante)', () => {
  for (const p of CAT.produits) {
    const html = bon(p);
    const v = F.valideModule(html, { produit: p, index: 1, module: p.modules[1] });
    assert.ok(v.ok, p.id + ' : étalon refusé — ' + v.erreurs.join(' ; '));
    assert.equal(v.titre, p.modules[1].titre);
  }
  const p = CAT.produits[0]; const ctx = { produit: p, index: 1, module: p.modules[1] };
  const sab = [
    ['mauvais numéro de module', bon(p).replace('<h2>Module 2 —', '<h2>Module 5 —'), /commencer par/],
    ['promesse absente', bon(p).replace('<p class="promesse">', '<p>'), /promesse/],
    ['mot « prompt »', bon(p).replace('tu colles la consigne', 'tu colles le prompt'), /prompt/],
    ['une seule consigne', bon(p).replace(/<h3>Deuxième[\s\S]*?<\/div>/, ''), /au moins 2 consigne/],
    ['trou laissé', bon(p).replace('Étape trois, tu relis.', 'Étape trois, [À COMPLÉTER].'), /À COMPLÉTER/],
    ['lien glissé', bon(p).replace('<p class="promesse">', '<p class="promesse"><a href="x">'), /interdit/],
    ['taux légal sans renvoi', bon(p).replace('Étape quatre, tu envoies.', 'La TVA est à 20 % dans ce cas.'), /service-public/],
    ['promesse de rendement', bon(p).replace('Étape quatre, tu envoies.', 'Un rendement garanti de ce placement.'), /rendement/],
    ['sans accents', bon(p).replace(/[àâäéèêëîïôöùûüçœ]/gi, 'e'), /accents/],
    ['deux blocs attention', bon(p).replace('<div class="check">', '<div class="attention"></div><div class="check">'), /attention/],
  ];
  for (const [nom, html, motif] of sab) {
    const v = F.valideModule(html, ctx);
    assert.ok(!v.ok, 'sabotage « ' + nom + ' » accepté : la porte ne discrimine pas');
    assert.ok(v.erreurs.some((e) => motif.test(e)), nom + ' : refusé pour la mauvaise raison — ' + v.erreurs.join(' ; '));
  }
  /* avis-ia promet des variantes : sans elles, refus */
  const avis = CAT.produits.find((x) => x.id === 'avis-ia');
  const sansVariantes = bon(avis).replace(/<div class="exemple">Variante[\s\S]*?<\/div>\n/g, '');
  assert.ok(!F.valideModule(sansVariantes, { produit: avis, index: 1, module: avis.modules[1] }).ok, 'avis-ia : un module sans ses variantes doit être refusé');
});

test('consigne de rédaction : dit le lecteur, la promesse, le titre exact du module, la vérité absolue, jamais le mot prompt', () => {
  const p = CAT.produits[3];
  const c = F.consigneModule({ produit: p, index: 2, module: p.modules[2], titresFaits: ['Un', 'Deux'] });
  assert.ok(c.includes('<h2>Module 3 — ' + p.modules[2].titre + '</h2>'));
  assert.ok(c.includes(p.cible) && c.includes(p.promesse) && c.includes(p.modules[2].brief));
  assert.ok(c.includes('« Un »') && c.includes('« Deux »'));
  assert.match(c, /VÉRITÉ ABSOLUE/); assert.match(c, /service-public\.fr/); assert.match(c, /promesse de rendement/);
  assert.ok(!/\bprompts?\b(?!\s*»)/i.test(c.replace(/jamais « prompt »/, '')), 'la consigne ne doit employer « prompt » que pour l\'interdire');
});

/* Faux réseau : D1 (REST) + Anthropic, pour dérouler principal() sans rien toucher. */
function fauxReseau({ enBase = [], reponses = [] }) {
  const inserts = []; let appelsIA = 0;
  globalThis.fetch = async (url, opt) => {
    const u = String(url);
    if (u.includes('/d1/database/')) {
      const { sql, params } = JSON.parse(opt.body);
      if (/^SELECT/i.test(sql)) return new Response(JSON.stringify({ success: true, result: [{ results: enBase.filter((l) => l.produit === params[0]) }] }), { status: 200 });
      if (/^INSERT/i.test(sql)) { inserts.push(params); return new Response(JSON.stringify({ success: true, result: [{ results: [] }] }), { status: 200 }); }
      throw new Error('SQL inattendu : ' + sql);
    }
    if (u.includes('api.anthropic.com')) {
      const html = reponses[Math.min(appelsIA, reponses.length - 1)]; appelsIA++;
      return new Response(JSON.stringify({ content: [{ type: 'text', text: '```html\n' + html + '\n```' }] }), { status: 200 });
    }
    throw new Error('réseau inattendu : ' + u);
  };
  return { inserts, ia: () => appelsIA };
}
const ENV = { CLOUDFLARE_API_TOKEN: 't', CLOUDFLARE_ACCOUNT_ID: 'a', ANTHROPIC_API_KEY: 'k' };

test('déroulé à blanc : lit la base, n\'appelle JAMAIS l\'IA, n\'écrit rien, finit par PRODUIT SIMULÉ', async () => {
  const p = CAT.produits[2];
  const r = fauxReseau({ enBase: [{ produit: p.id, id: 'm1', ordre: 1, titre: p.modules[0].titre, gratuit: 1, taille: 3000 }] });
  const log = [];
  const res = await F.principal({ ...ENV, PRODUIT: p.id, DRY_RUN: 'true' }, (l) => log.push(l));
  assert.equal(r.ia(), 0); assert.equal(r.inserts.length, 0);
  assert.equal(res.simule, 6, 'm1 est déjà en base : 6 modules restent à écrire');
  assert.match(log.at(-1), /^PRODUIT SIMULÉ avis-ia : 6/);
  assert.ok(log.some((l) => /En base : 1\/7/.test(l)));
});

test('déroulé réel : un module refusé 3 fois n\'est PAS écrit, les bons le sont, gratuit=1 seulement pour m1, sortie INCOMPLET', async () => {
  const p = CAT.produits[0];
  const mauvais = bon(p).replace('<p class="promesse">', '<p>');
  /* m1 et m2 bons, m3 mauvais ×3, puis bons */
  const suite = [bon(p, 0), bon(p, 1), mauvais, mauvais, mauvais, bon(p, 3), bon(p, 4), bon(p, 5), bon(p, 6)];
  const r = fauxReseau({ enBase: [], reponses: suite });
  const log = [];
  const exitAvant = process.exitCode;
  const res = await F.principal({ ...ENV, PRODUIT: p.id, DRY_RUN: 'false' }, (l) => log.push(l));
  process.exitCode = exitAvant;
  assert.equal(r.ia(), 9, '7 modules + 2 relances = 9 appels (3 essais sur m3)');
  assert.equal(r.inserts.length, 6, 'm3 refusé → 6 écritures, jamais 7');
  assert.deepEqual(res.rates, ['m3']);
  assert.equal(r.inserts[0][0], p.id); assert.equal(r.inserts[0][1], 'm1'); assert.equal(r.inserts[0][5], 1, 'm1 gratuit');
  assert.ok(r.inserts.slice(1).every((i) => i[5] === 0), 'seul m1 est gratuit');
  assert.ok(r.inserts.every((i) => /^<h2>Module \d+ — /.test(i[4])), 'le HTML écrit est le fragment contrôlé');
  assert.match(log.at(-1), /^PRODUIT INCOMPLET bureau-ia : 6\/7/);
  /* Relance : seul m3 manque → 1 appel, 1 écriture, PUBLIÉ */
  const enBase = r.inserts.map((i) => ({ produit: i[0], id: i[1], ordre: i[2], titre: i[3], gratuit: i[5], taille: i[4].length }));
  const r2 = fauxReseau({ enBase, reponses: [bon(p, 2)] });
  const log2 = [];
  await F.principal({ ...ENV, PRODUIT: p.id, DRY_RUN: 'false' }, (l) => log2.push(l));
  assert.equal(r2.ia(), 1); assert.equal(r2.inserts.length, 1); assert.equal(r2.inserts[0][1], 'm3');
  assert.match(log2.at(-1), /^PRODUIT PUBLIÉ bureau-ia : 7\/7/);
  /* Complet : rien à faire, 0 appel */
  const r3 = fauxReseau({ enBase: enBase.concat([{ produit: p.id, id: 'm3', ordre: 3, titre: 'x', gratuit: 0, taille: 1 }]) });
  const log3 = [];
  await F.principal({ ...ENV, PRODUIT: p.id, DRY_RUN: 'false' }, (l) => log3.push(l));
  assert.equal(r3.ia(), 0); assert.match(log3.at(-1), /^PRODUIT COMPLET/);
});

test('pages de vente : à jour sur le catalogue, CSP identique à la page mère, prix = caisse, lien de paiement au montant, aucun contenu payant', () => {
  assert.deepEqual(P.ecarts(), [], 'pages en retard → node tools/produits/pages.mjs');
  const csp = INDEX.match(/Content-Security-Policy" content="([^"]+)"/)[1];
  for (const p of CAT.produits) {
    const html = readFileSync(new URL(p.slug + '.html', DIR), 'utf8');
    assert.equal(html.match(/Content-Security-Policy" content="([^"]+)"/)[1], csp, p.slug + ' : CSP divergente');
    assert.ok(html.includes('<body data-produit="' + p.id + '">'));
    assert.ok(html.includes('"price":"' + VENTE.PRODUITS[p.id].prix + '"'));
    for (const b of ['payer-paypal', 'payer-revolut']) {
      const l = html.match(new RegExp('id="' + b + '" href="([^"]+)"[^>]*>([^<]+)<'));
      assert.ok(l, p.slug + ' : ' + b + ' absent');
      assert.ok(l[2].includes(p.prix + ' €') && l[1].toLowerCase().includes(p.prix + 'eur'), p.slug + ' : ' + b + ' ne porte pas ' + p.prix + ' EUR');
    }
    assert.ok(html.includes('<option value="' + p.id + '">'), p.slug + ' : formulaire de récupération sans le produit');
    assert.ok(html.includes('lire.html?produit=' + p.id));
    assert.ok(!/<pre class="consigne">/.test(html) && !/[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}/.test(html));
    assert.ok(INDEX.includes('href="' + p.slug + '.html"'), 'la page mère doit mener à ' + p.slug + '.html');
    assert.ok(INDEX.includes('<option value="' + p.id + '">'), 'menu de récupération de la page mère sans ' + p.id);
  }
  const orphelines = readdirSync(DIR).filter((f) => /^[a-z]+\.html$/.test(f) && !['index.html', 'lire.html'].includes(f) && !CAT.produits.some((p) => p.slug + '.html' === f));
  assert.deepEqual(orphelines, [], 'page produit sans fiche au catalogue');
});

test('lecteur : le produit vient de ?produit=, sinon du data-produit, sinon kit-ia ; jamais une valeur arbitraire', () => {
  const fn = new Function('window', 'document', 'localStorage', 'location', JS + '\nreturn globalThis.__kit;');
  const k = fn({}, undefined, undefined, undefined);
  assert.equal(k.produitDepuisUrl('?produit=avis-ia', ''), 'avis-ia');
  assert.equal(k.produitDepuisUrl('?c=AAAA&produit=immo-ia', ''), 'immo-ia');
  assert.equal(k.produitDepuisUrl('', 'bureau-ia'), 'bureau-ia');
  assert.equal(k.produitDepuisUrl('', ''), 'kit-ia');
  assert.equal(k.produitDepuisUrl('?produit=<script>', 'x y'), 'kit-ia', 'une valeur bizarre retombe sur le kit');
  assert.equal(k.lienLecteur('AAAA-BBBB-CCCC-DDDD'), 'lire.html?c=AAAA-BBBB-CCCC-DDDD', 'sans produit, le lien reste celui du kit');
});

test('workflow : bouton seulement (aucun cron), pipefail, essai à blanc par défaut, chaque produit du catalogue proposé, preuve exigée dans le journal', () => {
  assert.ok(!/^\s*schedule:/m.test(WF), 'cron interdit sur GitHub (règle absolue)');
  assert.match(WF, /workflow_dispatch/); assert.match(WF, /bash -eo pipefail/);
  assert.match(WF, /default: "true"/);
  for (const p of CAT.produits) assert.ok(WF.includes('"' + p.id + '"'), p.id + ' absent du menu du workflow');
  assert.match(WF, /PRODUIT \(PUBLIÉ\|COMPLET\)/); assert.match(WF, /tests\/produits-fabrique\.test\.mjs/);
  assert.ok(!/upload-artifact/.test(WF), 'le contenu payant ne doit jamais sortir en artifact');
});

/* ── Vrai navigateur : une page de niche + son lecteur (375 px, Chromium) ── */
import { chromium } from 'playwright';
import http from 'node:http';
import { extname, join } from 'node:path';

function serveurLocal(racine) {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css' };
  const s = http.createServer((req, res) => {
    const f = join(racine, decodeURIComponent(req.url.split('?')[0]));
    try { res.writeHead(200, { 'content-type': types[extname(f)] || 'application/octet-stream' }); res.end(readFileSync(f)); }
    catch (_) { res.writeHead(404); res.end('non trouvé'); }
  });
  return new Promise((ok) => s.listen(0, '127.0.0.1', () => ok({ s, port: s.address().port })));
}
const M1 = { id: 'm1', ordre: 1, titre: 'Pourquoi répondre', gratuit: true, html: '<h2>Module 1 — Pourquoi répondre</h2><p class="promesse">Promesse.</p><h3>Test</h3><pre class="consigne">Tu es [métier].</pre><div class="exemple">Résultat</div>' };
const M2 = { id: 'm2', ordre: 2, titre: 'Cinq étoiles', gratuit: false, html: '<h2>Module 2</h2><pre class="consigne">SECRET-PAYANT</pre>' };
const SOMM = [{ id: 'm1', ordre: 1, titre: M1.titre, gratuit: true, source: 'avis-ia' }, { id: 'm2', ordre: 2, titre: M2.titre, gratuit: false, source: 'avis-ia' }];

test('vrai navigateur — avis.html : 44 px, 375 px, récupération → code mémorisé SOUS SA PROPRE CLÉ, lien vers le lecteur du bon produit ; lire.html?produit=avis-ia demande le bon aperçu', async () => {
  const { s, port } = await serveurLocal(DIR.pathname);
  const nav = await chromium.launch({ headless: true });
  try {
    const page = await nav.newPage({ viewport: { width: 375, height: 812 } });
    const soucis = []; const appels = [];
    page.on('pageerror', (e) => soucis.push('exception: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/404|ERR_CERT/.test(m.text())) soucis.push('console: ' + m.text()); });
    await page.route('https://kdmc-vente.9r4rxssx64.workers.dev/**', (route) => {
      const u = new URL(route.request().url()); appels.push(u.pathname + u.search);
      const rep = (obj, status) => route.fulfill({ status: status || 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(obj) });
      if (u.pathname === '/apercu') {
        const id = u.searchParams.get('produit');
        return id === 'avis-ia' ? rep({ ok: true, produit: id, nom: VENTE.PRODUITS[id].nom, prix: 17, modules: [M1], sommaire: SOMM }) : rep({ ok: false, error: 'produit' }, 404);
      }
      if (u.pathname === '/lire') {
        return u.searchParams.get('c') === 'AVIS-AVIS-AVIS-AVIS'
          ? rep({ ok: true, produit: 'avis-ia', modules: [M1, M2], sommaire: SOMM })
          : rep({ ok: false, error: 'invalide', detail: 'code inconnu ou expiré' }, 404);
      }
      if (u.pathname === '/reclamer') { const b = route.request().postDataJSON(); return rep({ ok: true, verifie: true, code: b.produit === 'avis-ia' ? 'AVIS-AVIS-AVIS-AVIS' : 'XXXX-XXXX-XXXX-XXXX', livre: VENTE.PRODUITS[b.produit].livre, email_envoye: false }); }
      return rep({ ok: false, error: 'not_found' }, 404);
    });
    await page.goto('http://127.0.0.1:' + port + '/avis.html', { waitUntil: 'networkidle' });
    assert.equal(await page.evaluate(() => typeof window.__kit), 'object', 'kit.js n\'a pas tourné');
    const petites = await page.evaluate(() => [...document.querySelectorAll('input,select,button,a,summary')].filter((e) => e.offsetParent !== null).map((e) => ({ t: e.tagName + '#' + e.id, h: Math.round(e.getBoundingClientRect().height) })).filter((x) => x.h < 44));
    assert.deepEqual(petites, [], 'cibles tactiles sous 44 px');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), false, 'débordement horizontal');
    assert.equal(await page.textContent('.prix-mini'), '17 €');
    await page.fill('#email', 'client@exemple.fr');
    await page.click('#valider');
    await page.waitForSelector('#resultat.ok');
    assert.equal(await page.textContent('#resultat code'), 'AVIS-AVIS-AVIS-AVIS');
    assert.ok(appels.some((a) => a === '/reclamer'), 'la réclamation part au worker');
    assert.equal(await page.getAttribute('#resultat a', 'href'), 'lire.html?produit=avis-ia&c=AVIS-AVIS-AVIS-AVIS', 'le lien « Ouvrir mon kit » doit porter le produit');
    assert.equal(await page.evaluate(() => localStorage.getItem('kit_avis_ia_code')), 'AVIS-AVIS-AVIS-AVIS', 'code mémorisé sous la clé du produit');
    assert.equal(await page.evaluate(() => localStorage.getItem('kit_ia_code')), null, 'le code d\'une niche ne doit JAMAIS écraser celui du kit (isolation)');
    /* Le lecteur du produit, avec le code mémorisé : s'ouvre complet tout seul */
    await page.goto('http://127.0.0.1:' + port + '/lire.html?produit=avis-ia', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.getElementById('titre').textContent === 'Ton kit complet');
    assert.ok(appels.some((a) => a === '/lire?c=AVIS-AVIS-AVIS-AVIS'), 'le code mémorisé sous la clé du produit doit ouvrir le lecteur : ' + appels.join(' '));
    /* Sans code : l'aperçu DU produit, jamais celui du kit */
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://127.0.0.1:' + port + '/lire.html?produit=avis-ia', { waitUntil: 'networkidle' });
    await page.waitForSelector('#module h2');
    assert.ok(appels.some((a) => a === '/apercu?produit=avis-ia'), 'le lecteur doit demander l\'aperçu DU produit, pas celui du kit : ' + appels.join(' '));
    assert.ok(!appels.some((a) => a === '/apercu?produit=kit-ia'));
    assert.equal(await page.textContent('#module h2'), 'Module 1 — Pourquoi répondre');
    assert.match(await page.textContent('#sur a'), /^40 réponses aux avis clients, prêtes à adapter$/, 'le fil d\'Ariane dit le nom du produit');
    assert.ok(!(await page.content()).includes('SECRET-PAYANT'));
    assert.deepEqual(soucis, []);
  } finally { await nav.close(); s.close(); }
});
