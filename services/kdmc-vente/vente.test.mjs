/* Preuve hors-ligne du worker de vente : aucun réseau, aucun compte PayPal.
   On simule PayPal ET le SSO, et on vérifie ce qui coûte de l'argent quand
   c'est faux : livrer sans paiement, livrer deux fois, perdre une vente. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { __test } from './worker.js';

/* ── Faux KV (même contrat que Cloudflare : get/put/delete/list) ─────────── */
function fauxKV() {
  const m = new Map();
  return {
    _m: m,
    async get(k) { return m.has(k) ? m.get(k) : null; },
    async put(k, v) { m.set(k, v); },
    async delete(k) { m.delete(k); },
    async list({ prefix = '', limit = 1000 } = {}) {
      return { keys: [...m.keys()].filter((k) => k.startsWith(prefix)).slice(0, limit).map((name) => ({ name })) };
    },
  };
}

/* ── Faux PayPal + faux SSO ──────────────────────────────────────────────── */
function monteFetch({ transactions = [], signature = 'SUCCESS', tokenOk = true, panne = false, sso = null }) {
  const vrai = globalThis.fetch;
  globalThis.fetch = async (u, opt = {}) => {
    const url = String(u);
    if (panne && url.includes('paypal')) throw new Error('reseau coupe');
    if (url.includes('/v1/oauth2/token')) {
      return tokenOk
        ? new Response(JSON.stringify({ access_token: 'T' }), { status: 200 })
        : new Response('nope', { status: 401 });
    }
    if (url.includes('/v1/notifications/verify-webhook-signature')) {
      return new Response(JSON.stringify({ verification_status: signature }), { status: 200 });
    }
    if (url.includes('/v1/reporting/transactions')) {
      return new Response(JSON.stringify({ transaction_details: transactions }), { status: 200 });
    }
    if (url.includes('__sso/whoami')) {
      if (!sso) return new Response(JSON.stringify({ ok: false }), { status: 200 });
      return new Response(JSON.stringify(sso), { status: 200 });
    }
    throw new Error('appel imprévu: ' + url);
  };
  return () => { globalThis.fetch = vrai; };
}

const ENV_COMPLET = { PAYPAL_CLIENT_ID: 'id', PAYPAL_SECRET: 's', PAYPAL_WEBHOOK_ID: 'w' };
const tx = (email, valeur, devise = 'EUR', id = 'TX1') => ({
  transaction_info: { transaction_id: id, transaction_amount: { value: String(valeur), currency_code: devise }, transaction_initiation_date: '2026-09-16T10:00:00Z' },
  payer_info: { email_address: email },
});

function req(chemin, { methode = 'GET', corps = null, entetes = {} } = {}) {
  return new Request('https://kdmc-vente.workers.dev' + chemin, {
    method: methode,
    headers: { 'content-type': 'application/json', ...entetes },
    body: corps ? JSON.stringify(corps) : undefined,
  });
}
const lis = (r) => r.json();

/* ── Catalogue : invariants ──────────────────────────────────────────────── */
test('deux produits ne partagent JAMAIS le même prix (le webhook les confondrait)', () => {
  const vus = new Set();
  for (const [id, p] of Object.entries(__test.PRODUITS)) {
    const cle = p.devise + ':' + p.prix;
    assert.ok(!vus.has(cle), `prix en double (${cle}) — le webhook ne saurait pas quoi livrer pour ${id}`);
    vus.add(cle);
  }
});

test('un code se dicte au téléphone sans ambiguïté (pas de 0/O ni 1/I/L)', () => {
  for (const c of '01OIL') assert.ok(!__test.ALPHABET.includes(c), `${c} est ambigu à l'oral`);
  const c = __test.nouveauCode();
  assert.match(c, /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  assert.notEqual(__test.nouveauCode(), c, 'deux codes de suite ne doivent pas être identiques');
});

test('la tolérance de montant accepte le centime d\'arrondi, pas un euro', () => {
  assert.equal(__test.memeMontant(39.0, 39), true);
  assert.equal(__test.memeMontant(38.99, 39), true);
  assert.equal(__test.memeMontant(38.0, 39), false);
  assert.equal(__test.memeMontant(1, 39), false);
});

/* ── /health dit la vérité ───────────────────────────────────────────────── */
test('/health avoue quand PayPal n\'est PAS configuré (jamais de faux vert)', async () => {
  const j = await lis(await worker.fetch(req('/health'), { VENTES: fauxKV() }));
  assert.equal(j.paypal_recherche, false);
  assert.equal(j.paypal_webhook, false);
  const j2 = await lis(await worker.fetch(req('/health'), { VENTES: fauxKV(), ...ENV_COMPLET }));
  assert.equal(j2.paypal_recherche, true);
  assert.equal(j2.paypal_webhook, true);
});

/* ── Webhook : le cœur de la sécurité ────────────────────────────────────── */
test('WEBHOOK NON SIGNÉ → RIEN n\'est délivré (sinon n\'importe qui se sert)', async () => {
  const kv = fauxKV();
  const stop = monteFetch({ signature: 'FAILURE' });
  const j = await lis(await worker.fetch(
    req('/webhook/paypal', { methode: 'POST', corps: { event_type: 'PAYMENT.CAPTURE.COMPLETED', resource: { id: 'X', amount: { value: '39.00', currency_code: 'EUR' } } } }),
    { VENTES: kv, ...ENV_COMPLET }));
  stop();
  assert.equal(j.ignore, true);
  assert.equal([...kv._m.keys()].filter((k) => k.startsWith('code:')).length, 0, 'aucun code ne doit exister');
});

test('WEBHOOK sans PAYPAL_WEBHOOK_ID → ignoré (pas de confiance aveugle)', async () => {
  const kv = fauxKV();
  const stop = monteFetch({});
  const j = await lis(await worker.fetch(
    req('/webhook/paypal', { methode: 'POST', corps: { event_type: 'PAYMENT.CAPTURE.COMPLETED', resource: { id: 'X', amount: { value: '39.00', currency_code: 'EUR' } } } }),
    { VENTES: kv }));
  stop();
  assert.equal(j.ignore, true);
  assert.equal(j.step, 'webhook_config');
  assert.equal([...kv._m.keys()].filter((k) => k.startsWith('code:')).length, 0);
});

test('webhook signé + montant connu → livre le bon produit', async () => {
  const kv = fauxKV();
  const stop = monteFetch({ signature: 'SUCCESS' });
  const j = await lis(await worker.fetch(
    req('/webhook/paypal', { methode: 'POST', corps: { event_type: 'PAYMENT.CAPTURE.COMPLETED', resource: { id: 'TXA', amount: { value: '39.00', currency_code: 'EUR' }, payer: { email_address: 'A@Test.com' } } } }),
    { VENTES: kv, ...ENV_COMPLET }));
  stop();
  assert.equal(j.ok, true);
  assert.equal(j.produit, 'croupier-pro');
  assert.equal([...kv._m.keys()].filter((k) => k.startsWith('code:')).length, 1);
});

test('ANTI-REJEU : la même transaction ne délivre qu\'UNE fois (même code rendu)', async () => {
  const kv = fauxKV();
  const stop = monteFetch({ signature: 'SUCCESS' });
  const env = { VENTES: kv, ...ENV_COMPLET };
  const corps = { event_type: 'PAYMENT.CAPTURE.COMPLETED', resource: { id: 'TXREPLAY', amount: { value: '39.00', currency_code: 'EUR' } } };
  await worker.fetch(req('/webhook/paypal', { methode: 'POST', corps }), env);
  const j2 = await lis(await worker.fetch(req('/webhook/paypal', { methode: 'POST', corps }), env));
  stop();
  assert.equal(j2.deja_delivre, true);
  assert.equal([...kv._m.keys()].filter((k) => k.startsWith('code:')).length, 1, 'un 2e code = un client qui partage son reçu avec dix amis');
});

test('webhook d\'un montant inconnu → mis en file, jamais livré au hasard', async () => {
  const kv = fauxKV();
  const stop = monteFetch({ signature: 'SUCCESS' });
  const j = await lis(await worker.fetch(
    req('/webhook/paypal', { methode: 'POST', corps: { event_type: 'PAYMENT.CAPTURE.COMPLETED', resource: { id: 'TXZ', amount: { value: '7.50', currency_code: 'EUR' } } } }),
    { VENTES: kv, ...ENV_COMPLET }));
  stop();
  assert.equal(j.en_attente, true);
  assert.equal([...kv._m.keys()].filter((k) => k.startsWith('code:')).length, 0);
  assert.equal([...kv._m.keys()].filter((k) => k.startsWith('demande:')).length, 1);
});

/* ── Réclamation client ──────────────────────────────────────────────────── */
test('réclamation avec un vrai paiement du bon montant → code immédiat', async () => {
  const kv = fauxKV();
  const stop = monteFetch({ transactions: [tx('client@mail.com', '39.00')] });
  const j = await lis(await worker.fetch(
    req('/reclamer', { methode: 'POST', corps: { produit: 'croupier-pro', email: 'Client@Mail.com' } }),
    { VENTES: kv, ...ENV_COMPLET }));
  stop();
  assert.equal(j.verifie, true);
  assert.match(j.code, /^[A-Z2-9]{4}-/);
  assert.equal(j.livre, __test.PRODUITS['croupier-pro'].livre);
});

test('paiement du MAUVAIS montant → jamais livré, mis en file, message honnête', async () => {
  const kv = fauxKV();
  const stop = monteFetch({ transactions: [tx('client@mail.com', '1.00')] });
  const j = await lis(await worker.fetch(
    req('/reclamer', { methode: 'POST', corps: { produit: 'croupier-pro', email: 'client@mail.com' } }),
    { VENTES: kv, ...ENV_COMPLET }));
  stop();
  assert.equal(j.verifie, false);
  assert.equal(j.en_attente, true);
  assert.match(j.detail, /pas du bon montant/);
  assert.equal([...kv._m.keys()].filter((k) => k.startsWith('code:')).length, 0);
});

test('aucun paiement à ce nom → file, et on explique le délai PayPal (~3 h)', async () => {
  const kv = fauxKV();
  const stop = monteFetch({ transactions: [] });
  const j = await lis(await worker.fetch(
    req('/reclamer', { methode: 'POST', corps: { produit: 'croupier-pro', email: 'inconnu@mail.com' } }),
    { VENTES: kv, ...ENV_COMPLET }));
  stop();
  assert.equal(j.en_attente, true);
  assert.match(j.detail, /3 h/);
});

test('PANNE PayPal → la vente n\'est PAS perdue, elle tombe en file manuelle', async () => {
  const kv = fauxKV();
  const stop = monteFetch({ panne: true });
  const j = await lis(await worker.fetch(
    req('/reclamer', { methode: 'POST', corps: { produit: 'croupier-pro', email: 'client@mail.com' } }),
    { VENTES: kv, ...ENV_COMPLET }));
  stop();
  assert.equal(j.ok, true);
  assert.equal(j.en_attente, true);
  assert.equal([...kv._m.keys()].filter((k) => k.startsWith('demande:')).length, 1);
});

test('SANS secret PayPal, le worker encaisse quand même (tout en file)', async () => {
  const kv = fauxKV();
  const stop = monteFetch({});
  const j = await lis(await worker.fetch(
    req('/reclamer', { methode: 'POST', corps: { produit: 'croupier-pro', email: 'client@mail.com' } }),
    { VENTES: kv }));
  stop();
  assert.equal(j.ok, true);
  assert.equal(j.en_attente, true);
  assert.equal(j.step, 'reclam_manuel');
});

test('Revolut → file manuelle (aucune API personnelle n\'existe côté Revolut)', async () => {
  const kv = fauxKV();
  const stop = monteFetch({ transactions: [tx('client@mail.com', '39.00')] });
  const j = await lis(await worker.fetch(
    req('/reclamer', { methode: 'POST', corps: { produit: 'croupier-pro', email: 'client@mail.com', methode: 'revolut', reference: 'REF42' } }),
    { VENTES: kv, ...ENV_COMPLET }));
  stop();
  assert.equal(j.en_attente, true);
  assert.equal([...kv._m.keys()].filter((k) => k.startsWith('code:')).length, 0);
});

test('e-mail incomplet refusé, produit inconnu refusé', async () => {
  const env = { VENTES: fauxKV(), ...ENV_COMPLET };
  const a = await worker.fetch(req('/reclamer', { methode: 'POST', corps: { produit: 'croupier-pro', email: 'pasunmail' } }), env);
  assert.equal(a.status, 400);
  const b = await worker.fetch(req('/reclamer', { methode: 'POST', corps: { produit: 'nexistepas', email: 'a@b.co' } }), env);
  assert.equal(b.status, 404);
});

test('balayage d\'e-mails bloqué au 11e essai dans l\'heure', async () => {
  const kv = fauxKV();
  const stop = monteFetch({ transactions: [] });
  const env = { VENTES: kv, ...ENV_COMPLET };
  let bloque = null;
  for (let i = 0; i < 12; i++) {
    const r = await worker.fetch(req('/reclamer', { methode: 'POST', corps: { produit: 'croupier-pro', email: `a${i}@mail.com` }, entetes: { 'CF-Connecting-IP': '1.2.3.4' } }), env);
    if (r.status === 429) { bloque = i; break; }
  }
  stop();
  assert.equal(bloque, 10, 'doit bloquer au 11e essai (index 10)');
});

/* ── Accès ───────────────────────────────────────────────────────────────── */
test('un code valide ouvre le produit, un code inventé ne l\'ouvre pas', async () => {
  const kv = fauxKV();
  const stop = monteFetch({ transactions: [tx('c@m.com', '39.00')] });
  const env = { VENTES: kv, ...ENV_COMPLET };
  const { code } = await lis(await worker.fetch(req('/reclamer', { methode: 'POST', corps: { produit: 'croupier-pro', email: 'c@m.com' } }), env));
  const ok = await lis(await worker.fetch(req('/acces?c=' + code), env));
  assert.equal(ok.ok, true);
  assert.equal(ok.produit, 'croupier-pro');
  const ko = await worker.fetch(req('/acces?c=AAAA-BBBB-CCCC-DDDD'), env);
  stop();
  assert.equal(ko.status, 404);
});

/* ── Admin ───────────────────────────────────────────────────────────────── */
test('/admin/file sans pass SSO → 401', async () => {
  const stop = monteFetch({});
  const r = await worker.fetch(req('/admin/file'), { VENTES: fauxKV() });
  stop();
  assert.equal(r.status, 401);
});

test('LEÇON #99 : un admin NON vérifié (sans Face ID) est refusé', async () => {
  const stop = monteFetch({ sso: { ok: true, admin: true, verified: false, name: 'Kevin' } });
  const r = await worker.fetch(req('/admin/file', { entetes: { Authorization: 'Bearer x' } }), { VENTES: fauxKV() });
  stop();
  assert.equal(r.status, 403);
});

test('Kevin vérifié valide une demande en 1 clic : code créé, demande retirée', async () => {
  const kv = fauxKV();
  const stopA = monteFetch({});
  await worker.fetch(req('/reclamer', { methode: 'POST', corps: { produit: 'croupier-pro', email: 'c@m.com', methode: 'revolut' } }), { VENTES: kv });
  stopA();
  const stopB = monteFetch({ sso: { ok: true, admin: true, verified: true, name: 'Kevin DESARZENS' } });
  const env = { VENTES: kv };
  const file = await lis(await worker.fetch(req('/admin/file', { entetes: { Authorization: 'Bearer x' } }), env));
  assert.equal(file.demandes.length, 1);
  const v = await lis(await worker.fetch(req('/admin/valider', { methode: 'POST', corps: { demande: file.demandes[0].id }, entetes: { Authorization: 'Bearer x' } }), env));
  const apres = await lis(await worker.fetch(req('/admin/file', { entetes: { Authorization: 'Bearer x' } }), env));
  stopB();
  assert.equal(v.ok, true);
  assert.match(v.code, /^[A-Z2-9]{4}-/);
  assert.equal(apres.demandes.length, 0, 'la demande validée doit disparaître de la file');
});

test('refuser une demande ne délivre rien', async () => {
  const kv = fauxKV();
  const stopA = monteFetch({});
  await worker.fetch(req('/reclamer', { methode: 'POST', corps: { produit: 'croupier-pro', email: 'c@m.com', methode: 'revolut' } }), { VENTES: kv });
  stopA();
  const stopB = monteFetch({ sso: { ok: true, admin: true, verified: true, name: 'Kevin' } });
  const env = { VENTES: kv };
  const file = await lis(await worker.fetch(req('/admin/file', { entetes: { Authorization: 'Bearer x' } }), env));
  const v = await lis(await worker.fetch(req('/admin/valider', { methode: 'POST', corps: { demande: file.demandes[0].id, refuser: true }, entetes: { Authorization: 'Bearer x' } }), env));
  stopB();
  assert.equal(v.refuse, true);
  assert.equal([...kv._m.keys()].filter((k) => k.startsWith('code:')).length, 0);
});

test('route inconnue → 404 avec la route exacte dans le diagnostic', async () => {
  const j = await lis(await worker.fetch(req('/nimporte-quoi'), { VENTES: fauxKV() }));
  assert.equal(j.ok, false);
  assert.match(j.detail, /nimporte-quoi/);
});

/* ── /contenu : le seul endroit qui délivre le payant ────────────────────── */
test('/contenu sans code, ou avec un code inventé, ne donne RIEN', async () => {
  const env = { VENTES: fauxKV() };
  assert.equal((await worker.fetch(req('/contenu'), env)).status, 400);
  assert.equal((await worker.fetch(req('/contenu?c=AAAA-BBBB-CCCC-DDDD'), env)).status, 404);
});

test('/contenu avec un code payé rend exactement ce que le produit débloque', async () => {
  const kv = fauxKV();
  const stop = monteFetch({ transactions: [tx('c@m.com', '39.00')] });
  const env = { VENTES: kv, ...ENV_COMPLET };
  const { code } = await lis(await worker.fetch(req('/reclamer', { methode: 'POST', corps: { produit: 'croupier-pro', email: 'c@m.com' } }), env));
  const j = await lis(await worker.fetch(req('/contenu?c=' + code), env));
  stop();
  assert.equal(j.ok, true);
  assert.deepEqual(j.debloque, __test.PRODUITS['croupier-pro'].contenu);
});

test('chaque produit déclare ce qu\'il débloque (sinon on vend du vide)', () => {
  for (const [id, p] of Object.entries(__test.PRODUITS)) {
    assert.ok(Array.isArray(p.contenu) && p.contenu.length > 0, `${id} ne débloque rien`);
    assert.match(p.livre, /^https:\/\/[a-z-]+\.kd-mc\.com\//, `${id} : adresse de livraison invalide (${p.livre})`);
  }
});
