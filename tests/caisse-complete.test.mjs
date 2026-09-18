/* Garde de la CHAÎNE DE VENTE — dans test:ci.
   Kevin 2026-09-18 : « si quelqu'un veut acheter, payer, s'il y a un service il faut
   le rendre… tout est prévu jusqu'à l'encaissement ? »
   Réponse mesurée ce jour-là : NON. Les trous trouvés, que cette garde ferme :
     · le bouton ouvrait paypal.me dans un AUTRE onglet — rien ne ramenait l'acheteur,
       rien côté serveur ne savait qu'il avait voulu acheter ;
     · le produit était DEVINÉ par le montant (d'où des prix tous différents) ;
     · aucune CGV, aucune mention légale, aucune adresse de contact sur les pages
       de vente — une vente à distance sans identité de vendeur n'est pas légale ;
     · aucune preuve du consentement à la livraison immédiate (texte en FAQ, rien d'enregistré). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const RACINE = fileURLToPath(new URL('../', import.meta.url));
const lit = (p) => readFileSync(join(RACINE, p), 'utf8');
const worker = lit('services/kdmc-vente/worker.js');
const kitjs = lit('shops/kit-ia/kit.js');
const VENTE = ['index', 'bureau', 'etudiant', 'avis', 'immo'];

test('la caisse crée la commande CÔTÉ SERVEUR et capture elle-même', () => {
  assert.match(worker, /p === '\/caisse\/commande' && req\.method === 'POST'/, 'route de commande absente');
  assert.match(worker, /p === '\/caisse\/capture' && req\.method === 'POST'/, 'route de capture absente');
  assert.match(worker, /v2\/checkout\/orders/, 'Orders v2 non utilisé');
  /* Le produit ne doit plus être deviné : il voyage dans custom_id. */
  assert.match(worker, /custom_id: produitId \+ '\|' \+ ref/, 'le produit ne voyage pas dans custom_id');
  /* Le montant vient de NOTRE catalogue, jamais du navigateur. */
  assert.match(worker, /value: produit\.prix\.toFixed\(2\)/, 'le montant ne vient pas du catalogue serveur');
  assert.ok(!/amount[^\n]*b\.(montant|prix)/.test(worker), 'un montant venu du navigateur est utilisé');
});

/* Celui-ci EXÉCUTE la règle au lieu de la lire : une garde qui cherche un bout de
   texte ne voit pas qu'on l'a neutralisée (mesuré — `if (false && …)` passait au vert). */
test('la capture refuse tout ce qui ne correspond pas à la commande', async () => {
  const { controleCapture } = await import('../services/kdmc-vente/worker.js');
  const produit = { prix: 47, devise: 'EUR' };
  const cmd = { produit: 'kit-ia' };
  const bon = { statut: 'COMPLETED', produitId: 'kit-ia', devise: 'EUR', montant: 47 };
  assert.equal(controleCapture(cmd, bon, produit).ok, true, 'un paiement correct doit passer');
  const cas = [
    ['pas encore payé', { ...bon, statut: 'PENDING' }, 'non_paye'],
    ['produit différent', { ...bon, produitId: 'immo-ia' }, 'incoherent'],
    ['devise différente', { ...bon, devise: 'USD' }, 'incoherent'],
    ['montant plus bas', { ...bon, montant: 1 }, 'incoherent'],
    ['montant à zéro', { ...bon, montant: 0 }, 'incoherent'],
    ['produit absent', { ...bon, produitId: null }, 'incoherent'],
  ];
  for (const [quoi, cap, raison] of cas) {
    const r = controleCapture(cmd, cap, produit);
    assert.equal(r.ok, false, quoi + ' : la livraison serait acceptée !');
    assert.equal(r.raison, raison, quoi + ' : mauvaise raison (' + r.raison + ')');
  }
  /* Tolérance VOULUE d'un centime (arrondis PayPal) : 46,99 € passe, et c'est
     assumé. Ce qui ne doit jamais passer, c'est un écart qui coûte de l'argent. */
  assert.equal(controleCapture(cmd, { ...bon, montant: 46.99 }, produit).ok, true, 'la tolérance d\'un centime a disparu');
  assert.equal(controleCapture(cmd, { ...bon, montant: 46.5 }, produit).ok, false, '50 centimes de moins acceptés');
  assert.equal(controleCapture(cmd, { ...bon, montant: 17 }, produit).ok, false, 'le prix d\'un autre produit accepté');
});

test('le consentement à la livraison immédiate est exigé ET enregistré horodaté', () => {
  assert.match(worker, /b\.consentement === true/, 'la commande part sans consentement');
  assert.match(worker, /export const CONSENTEMENT = /, 'le texte du consentement n\'est pas une constante');
  assert.match(worker, /consentement: \{ donne: true, texte: CONSENTEMENT, ts_iso:/, 'le consentement n\'est pas horodaté avec la commande');
  for (const f of VENTE) {
    const h = lit('shops/kit-ia/' + f + '.html');
    assert.match(h, /data-caisse-consentement/, f + '.html : pas de case de consentement');
  }
  assert.match(kitjs, /!coche \|\| !coche\.checked/, 'la page laisse payer sans cocher');
});

test('un justificatif d\'achat numéroté est produit, et il ne bloque jamais la livraison', () => {
  assert.match(worker, /async function ecritRecu/, 'aucun reçu produit');
  assert.match(worker, /'KDMC-' \+ an \+ '-'/, 'le reçu n\'est pas numéroté');
  assert.match(worker, /catch \(_\) \{ return null; \}\s+\/\/ best-effort/, 'un reçu qui rate pourrait bloquer une livraison payée');
  assert.match(worker, /p === '\/recu'/, 'le reçu n\'est pas relisable');
});

test('chaque page de vente a un bouton de caisse ET un repli si PayPal est coupé', () => {
  for (const f of VENTE) {
    const h = lit('shops/kit-ia/' + f + '.html');
    assert.match(h, /<button class="btn btn-primaire"[^>]*data-caisse[^>]*data-produit="[a-z-]+"/, f + '.html : pas de bouton de caisse');
    assert.match(h, /data-secours="https:\/\/paypal\.me\//, f + '.html : aucun repli si la caisse est coupée');
    assert.match(h, /data-caisse-email/, f + '.html : on peut payer sans donner d\'e-mail → accès non livrable');
  }
  assert.match(kitjs, /data-secours/, 'kit.js n\'utilise pas le repli');
  assert.match(worker, /error: 'caisse_absente'/, 'le worker ne dit pas quand la caisse n\'est pas configurée');
});

test('l\'acheteur est RAMENÉ sur le site après le paiement', () => {
  assert.ok(existsSync(join(RACINE, 'shops/kit-ia/merci.html')), 'pas de page de retour');
  assert.match(worker, /return_url: RETOUR \+ '\?ref=' \+ ref/, 'PayPal ne renvoie nulle part');
  assert.match(worker, /cancel_url: RETOUR/, 'un paiement annulé ne ramène nulle part');
  const m = lit('shops/kit-ia/merci.js');
  assert.match(m, /\/caisse\/capture/, 'la page de retour ne capture pas');
  /* Le pire cas : il a payé et ça rate. Il doit repartir avec un chemin, jamais une page morte. */
  assert.match(m, /function echoue\(/, 'aucun chemin de secours');
  const h = lit('shops/kit-ia/merci.html');
  assert.match(h, /index\.html#recuperer/, 'la page de retour ne propose pas la récupération');
  assert.match(h, /mailto:kevind@monaco\.mc/, 'aucun contact humain en cas d\'échec');
  /* Le code doit s'afficher À L'ÉCRAN : l'e-mail a déjà échoué une fois (16.09). */
  assert.match(h, /id="code"/, 'le code ne s\'affiche pas à l\'écran');
  assert.match(m, /n'a pas pu envoyer l'e-mail/, 'la page ment quand l\'e-mail échoue');
});

test('les pages légales existent, disent qui vend, et sont liées depuis TOUTES les pages', () => {
  const cgv = lit('shops/kit-ia/cgv.html');
  const men = lit('shops/kit-ia/mentions.html');
  assert.match(cgv, /Kevin DESARZENS/, 'les CGV ne nomment pas le vendeur');
  assert.match(cgv, /kevind@monaco\.mc/, 'les CGV ne donnent pas de contact');
  assert.match(cgv, /rétractation/i, 'les CGV ne parlent pas de rétractation');
  assert.match(cgv, /[Rr]emboursement/, 'les CGV ne parlent pas de remboursement');
  assert.match(men, /Kevin DESARZENS/, 'les mentions ne nomment pas l\'éditeur');
  assert.match(men, /GitHub|Cloudflare/, 'les mentions ne nomment pas l\'hébergeur');
  for (const f of VENTE.concat(['lire', 'merci'])) {
    const h = lit('shops/kit-ia/' + f + '.html');
    assert.match(h, /href="cgv\.html"/, f + '.html ne lie pas les conditions de vente');
    assert.match(h, /href="mentions\.html"|href="mailto:kevind@monaco\.mc"/, f + '.html ne donne aucun contact');
  }
});

test('deux produits ne peuvent pas avoir le même prix (le webhook les distinguerait mal)', () => {
  const prix = [...worker.matchAll(/prix: (\d+), devise: '([A-Z]{3})'/g)].map((m) => m[1] + m[2]);
  assert.equal(new Set(prix).size, prix.length, 'deux produits au même prix : ' + prix.join(', '));
});
