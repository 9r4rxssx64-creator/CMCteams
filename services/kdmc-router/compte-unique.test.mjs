/* COMPTE UNIQUE (Kevin 2026-08-05 : « Je ne veux pas plusieurs comptes, qu'ils
   soient tous reliés à mon compte admin »).
   Ce qu'on prouve :
   - toutes les apps de Kevin alimentent UN SEUL dossier (plus de fiche par app) ;
   - les fiches déjà éparpillées sont FUSIONNÉES automatiquement, sans rien perdre
     (connexions additionnées, historiques concaténés, appareils/lieux/apps réunis) ;
   - l'ancienne fiche devient un RENVOI et n'apparaît plus comme une personne ;
   - une AUTRE personne n'est JAMAIS absorbée dans le compte admin (le vrai risque) ;
   - un prénom seul auto-déclaré ne suffit pas à se ranger dans le dossier admin.
   node --test (depuis services/kdmc-router) */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import mod from './worker.js';

function mkEnv() {
  const store = new Map();
  return {
    store,
    env: {
      KDMC_SSO_SECRET: 'sec',
      ACCOUNTS: {
        get: async (k) => (store.has(k) ? store.get(k) : null),
        put: async (k, v) => { store.set(k, v); },
        delete: async (k) => { store.delete(k); },
      },
    },
  };
}
const issue = (env, uid, name) => mod.fetch(new Request('https://kd-mc.com/__sso/issue', {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ uid, name, cgu: true }),
}), env);
const acc = (store, uid) => JSON.parse(store.get('acc:' + uid) || 'null');

test('les apps de Kevin alimentent UN SEUL dossier (kdmc_admin)', async () => {
  const { store, env } = mkEnv();
  await issue(env, 'U11804', 'Kevin DESARZENS');       /* CMCteams */
  await issue(env, 'kdmc_admin', 'Kevin Desarzens');   /* Apex */
  await issue(env, 'lingua_7', 'kevin desarzens');     /* Lingua */
  const k = acc(store, 'kdmc_admin');
  assert.ok(k, 'le dossier canonique existe');
  /* NB : 3 visites rapprochées = 1 seule SESSION (prolongée, pas dupliquée) — c'est
     le comportement voulu. Ce qui compte ici : elles atterrissent toutes au MÊME endroit. */
  assert.ok(k.hits >= 1, 'la visite est comptée dans le dossier unique');
  assert.equal(acc(store, 'U11804'), null, 'aucune fiche séparée créée pour CMCteams');
  assert.equal(acc(store, 'lingua_7'), null, 'aucune fiche séparée créée pour Lingua');
  const idx = JSON.parse(store.get('idx:uids') || '[]');
  assert.deepEqual(idx, ['kdmc_admin'], 'UN SEUL dossier indexé pour Kevin (avant : un par app)');
});

test('les fiches DÉJÀ éparpillées sont fusionnées, sans rien perdre', async () => {
  const { store, env } = mkEnv();
  /* Ancien monde : deux fiches distinctes du même Kevin (dont une à 191 connexions). */
  store.set('idx:uids', JSON.stringify(['vieux_kevin', 'laurence-sp']));
  store.set('acc:vieux_kevin', JSON.stringify({
    uid: 'vieux_kevin', name: 'Kevin DESARZENS', hits: 191, created: 1000, last_seen: 2000,
    devices: ['mobile·iOS'], places: ['Nice, FR'],
    apps: { 'cmcteams.kd-mc.com': { first: 1000, last: 2000, sessions: 40, ms: 600000 } },
    history: [{ ts: 1500, end: 1600, app: 'cmcteams.kd-mc.com' }],
  }));
  store.set('acc:laurence-sp', JSON.stringify({ uid: 'laurence-sp', name: 'Laurence Saint-Polit', hits: 12, apps: {}, history: [] }));

  await issue(env, 'kdmc_admin', 'Kevin Desarzens'); /* déclenche la fusion auto */

  const k = acc(store, 'kdmc_admin');
  assert.ok(k.hits >= 192, 'les 191 connexions sont RÉCUPÉRÉES (+ la nouvelle), got ' + k.hits);
  assert.ok(k.history.length >= 1, 'historique repris');
  assert.ok(k.apps['cmcteams.kd-mc.com'].sessions >= 40, 'sessions par app reprises');
  assert.ok(k.apps['cmcteams.kd-mc.com'].ms >= 600000, 'temps par app repris');
  assert.ok((k.places || []).includes('Nice, FR'), 'lieux repris');
  assert.equal(k.created, 1000, 'la « 1re fois » remonte à la plus ancienne');
  assert.ok((k.aliases || []).includes('vieux_kevin'), 'ancien identifiant tracé');

  const old = acc(store, 'vieux_kevin');
  assert.equal(old.merged_into, 'kdmc_admin', 'ancienne fiche = simple renvoi');

  /* Une AUTRE personne ne doit JAMAIS être absorbée. */
  const l = acc(store, 'laurence-sp');
  assert.equal(l.hits, 12, 'Laurence intacte');
  assert.ok(!l.merged_into, 'Laurence JAMAIS fusionnée dans le compte admin');
});

test('les fiches fusionnées ne réapparaissent PAS comme des personnes', async () => {
  const { store, env } = mkEnv();
  const { createHash } = await import('node:crypto');
  const PIN = createHash('sha256').update('200807').digest('hex');
  env.KDMC_ADMIN_PIN_SHA256 = PIN;
  store.set('idx:uids', JSON.stringify(['vieux_kevin']));
  store.set('acc:vieux_kevin', JSON.stringify({ uid: 'vieux_kevin', name: 'Kevin DESARZENS', hits: 191, apps: {}, history: [] }));
  await issue(env, 'kdmc_admin', 'Kevin Desarzens');
  const r = await mod.fetch(new Request('https://kd-mc.com/__admin/domain-log', { headers: { 'x-apex-pin': PIN } }), env);
  const d = await r.json();
  const noms = d.people.map((p) => p.uid);
  assert.ok(noms.includes('kdmc_admin'), 'le dossier unique est listé');
  assert.ok(!noms.includes('vieux_kevin'), 'le doublon a disparu de la liste');
});

test('un prénom seul auto-déclaré ne se range PAS dans le dossier admin', async () => {
  const { store, env } = mkEnv();
  await issue(env, 'inconnu_1', 'Kevin');       /* prénom seul */
  await issue(env, 'inconnu_2', 'Kevin Martin'); /* homonyme */
  assert.equal(acc(store, 'kdmc_admin'), null, 'aucun dossier admin créé par un nom incomplet');
  assert.ok(acc(store, 'inconnu_1'), 'la fiche reste séparée');
  assert.ok(acc(store, 'inconnu_2'), 'un homonyme garde sa propre fiche');
});
