/* Garde du tableau de bord Commerce (kd-mc.com/admin/commerce.html, 17.09.2026).
   Trois choses qui, si elles cassent, rendent le tableau FAUX sans erreur visible :
     1. le JSON statique diverge de ses sources (catalogue, scripts, programmation)
     2. la liste des workflows lançables n'est plus la même côté caisse et côté page
     3. la logique de rendu ment (un « ROUGE » affiché vert, une vente comptée deux fois,
        un admin non vérifié qui passerait) — testée hors navigateur sur la logique pure.
   Prouvé discriminant : voir les sabotages en fin de fichier (commentaires). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { construit, texte, principal, SORTIE, WORKFLOWS_ATTENDUS } from '../tools/produits/tableau-de-bord.mjs';
import { __test as caisse } from '../services/kdmc-vente/worker.js';

const require = createRequire(import.meta.url);
const C = require('../kdmc-home/admin/commerce.js');
const data = JSON.parse(readFileSync(SORTIE, 'utf8'));

test('commerce-data.json est exactement ce que les sources produisent (garde --verifier)', () => {
  assert.equal(readFileSync(SORTIE, 'utf8'), texte(construit()), 'lance : node tools/produits/tableau-de-bord.mjs');
  assert.equal(principal(['--verifier']), 0);
});

test('chaque produit de la caisse est dans le tableau, au MÊME prix (sinon le CA par produit est faux)', () => {
  const ids = data.produits.map((p) => p.id);
  for (const [id, p] of Object.entries(caisse.PRODUITS)) {
    const t = data.produits.find((x) => x.id === id);
    assert.ok(t, 'produit de la caisse absent du tableau : ' + id);
    assert.equal(t.prix, p.prix, 'prix différent pour ' + id);
  }
  assert.equal(new Set(ids).size, ids.length, 'produit en double');
});

test('les workflows lançables sont les MÊMES côté caisse (liste fermée) et côté page', () => {
  const caisseIds = Object.keys(caisse.WORKFLOWS).sort();
  assert.deepEqual(Object.keys(data.workflows).sort(), caisseIds);
  assert.deepEqual([...WORKFLOWS_ATTENDUS].sort(), caisseIds);
  for (const id of caisseIds) {
    const champsPage = Object.keys(data.workflows[id].inputs || {});
    assert.deepEqual(champsPage.sort(), [...caisse.WORKFLOWS[id].champs].sort(), 'champs différents pour ' + id);
  }
});

test('chaque vidéo programmée pointe sur un script existant, un MP4 de la release et un post Metricool unique', () => {
  const posts = data.videos.filter((v) => v.post).map((v) => v.post);
  assert.equal(new Set(posts).size, posts.length, 'un même post pour deux vidéos');
  for (const v of data.videos) {
    assert.match(v.mp4, /releases\/download\/pub-videos\/[a-z]+-\d{2}\.mp4$/);
    assert.ok(caisse.PRODUITS[v.produit], 'vidéo pour un produit inconnu de la caisse : ' + v.id);
    if (v.date) assert.match(v.date, /^2026-\d{2}-\d{2}T\d{2}:00:00\+02:00$/, 'créneau non entier (Europe/Paris) : ' + v.id);
  }
});

test('le marché cite ses sources et marque ce qui n\'est pas mesuré ; jamais de promesse de rendement', () => {
  const m = data.marche;
  assert.ok(m.releves.length >= 4);
  for (const r of m.releves) { assert.match(r.url, /^https:\/\//); assert.ok(r.faits.length >= 1); }
  assert.ok(m.conclusion.some((c) => c.includes('🔴 Non mesuré')));
  const tout = JSON.stringify(m);
  assert.ok(!/garanti|rendement assuré|tu gagneras/i.test(tout));
});

/* ── Logique pure de la page ─────────────────────────────────────────────── */
test('etatRun : rouge reste rouge, GitHub muet donne sa cause, jamais un vert par défaut', () => {
  assert.equal(C.etatRun(null).cls, '');
  assert.equal(C.etatRun({ erreur: 'HTTP 403' }).cls, 'warn');
  assert.equal(C.etatRun({ status: 'completed', conclusion: 'failure', maj: new Date().toISOString() }).cls, 'err');
  assert.equal(C.etatRun({ status: 'completed', conclusion: 'success', maj: new Date().toISOString() }).cls, 'ok');
  assert.equal(C.etatRun({ status: 'in_progress' }).label, 'en cours…');
});

test('etatLivraison / etatContenu : un 404 est rouge, « non vérifié » n\'est pas vert', () => {
  assert.equal(C.etatLivraison(null).cls, '');
  assert.equal(C.etatLivraison(200).cls, 'ok');
  assert.equal(C.etatLivraison(404).cls, 'err');
  assert.equal(C.etatContenu(7, { n: 7 }).cls, 'ok');
  assert.equal(C.etatContenu(7, { n: 3 }).cls, 'warn');
  assert.equal(C.etatContenu(7, null).cls, 'err');
  assert.equal(C.etatContenu(null, null).label, 'contenu non lu');
});

const LIVE = {
  ok: true, quand: '2026-09-17T16:00:00.000Z', admin: 'Kevin DESARZENS',
  produits: Object.entries(caisse.PRODUITS).map(([id, p]) => ({ id, prix: p.prix, livre_http: id === 'croupier-entretien' ? 404 : 200 })),
  ventes: { n: 2, ca: 106, parProduit: { 'kit-ia': { n: 1, ca: 47 }, 'club-ia': { n: 1, ca: 59 } }, parSource: { 'paypal-webhook': { n: 2, ca: 106 } }, parMois: { '2026-09': { n: 2, ca: 106 } }, dernieres: [{ produit: 'club-ia', email: 'p***@x.fr', ts_iso: '2026-09-17T10:00:00Z', source: 'paypal-webhook' }], tronque: false },
  file: { n: 1, demandes: [{ id: 'd1', produit: 'avis-ia', email: 'z@x.fr', methode: 'revolut', etat: 'en_attente', ts_iso: '2026-09-17T09:00:00Z' }] },
  club: { actifs: 3, expirent14j: 1, relances: 0, abonnes_total: 5 }, contenu: { 'immo-ia': { n: 7, gratuits: 1 } }, base_detail: null,
  config: { paypal_webhook: false, paypal_recherche: false, email_code: true, contenu_prive: true, commandes: false },
  workflows: Object.keys(caisse.WORKFLOWS).map((id) => ({ id, run: id === 'audit-live.yml' ? { status: 'completed', conclusion: 'failure', maj: new Date().toISOString(), url: 'https://github.com/x' } : { erreur: 'HTTP 403' } })),
};

test('kpis : CA et ventes viennent de la caisse, la file est orange, l\'audit rouge est rouge, une livraison 404 est comptée KO', () => {
  const k = C.kpis(data, LIVE);
  const par = Object.fromEntries(k.map((x) => [x.l, x]));
  assert.equal(par['Chiffre d\'affaires'].v, '106 €');
  assert.equal(par['À valider (file)'].cls, 'warn');
  assert.equal(par['Audit live'].cls, 'err');
  assert.equal(par['Livraisons'].v, '1 KO');
  assert.equal(par['Commandes'].v, 'liens', 'sans jeton, les boutons se présentent comme des liens');
  assert.equal(par['Vidéos programmées'].v, data.videos.filter((v) => v.post).length + '/' + data.videos.length);
  const sans = C.kpis(data, null);
  assert.equal(sans.find((x) => x.l === 'Chiffre d\'affaires').v, '—', 'caisse injoignable → tiret, pas 0 €');
});

test('moisBarres : toujours 6 mois, les mois vides valent 0 (le vide se voit)', () => {
  const b = C.moisBarres({ '2026-09': { n: 2, ca: 106 } }, 6, '2026-09-17T12:00:00Z');
  assert.equal(b.length, 6);
  assert.equal(b[5].k, '2026-09'); assert.equal(b[5].ca, 106); assert.equal(b[0].ca, 0);
});

test('rendu : la page contient les boutons Livrer/Refuser pour la file, Lancer seulement avec jeton, et échappe le HTML', () => {
  const h = C.rendu(data, LIVE, null);
  assert.ok(h.includes('data-valider="d1"') && h.includes('data-refuser="d1"'));
  assert.ok(!h.includes('data-lancer='), 'sans jeton, aucun bouton Lancer');
  assert.ok(h.includes('Lancer sur GitHub'));
  const avec = C.rendu(data, { ...LIVE, config: { ...LIVE.config, commandes: true } }, null);
  assert.equal((avec.match(/data-lancer=/g) || []).length, Object.keys(caisse.WORKFLOWS).length);
  const pirate = C.rendu(data, { ...LIVE, file: { n: 1, demandes: [{ id: '<img src=x onerror=alert(1)>', produit: 'avis-ia', email: '<b>x</b>' }] } }, null);
  assert.ok(!pirate.includes('<img src=x'), 'donnée client non échappée dans la page admin');
  const ko = C.rendu(data, null, 'HTTP 502');
  assert.ok(ko.includes('injoignable') && ko.includes('HTTP 502'), 'la cause de la panne doit être écrite');
});

/* Sabotages faits le 17.09 pour prouver que la garde mord :
   - retirer 'audit-live.yml' de WORKFLOWS_ATTENDUS → test « MÊMES côté caisse » échoue
   - changer prix immo-ia à 66 dans commerce-data.json → 2 échecs (verifier + prix)
   - retirer le esc() de sectionFile → test « échappe le HTML » échoue */
