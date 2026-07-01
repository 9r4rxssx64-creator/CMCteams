/* Test régression admin domaine + registre fiches (KV mock). node admin.test.mjs
   NB: request.cf (géo Cloudflare) n'existe pas sous Node → l'enrichissement géo
   est vérifié en prod, pas ici (on teste le reste : nom/CGU/hits/device/admin-gate).
   GATE FAIL-CLOSED (leçons #98/#99) : sans hash de PIN configuré, /__admin/* est
   FERMÉ (le nom auto-asserté ne donne JAMAIS l'accès). L'accès exige un grant signé
   prouvé via /__admin/login. */
import mod from './worker.js';
import { createHash } from 'crypto';
const store = new Map();
const ACCOUNTS = { get: async (k) => (store.has(k) ? store.get(k) : null), put: async (k, v) => { store.set(k, v); }, delete: async (k) => { store.delete(k); } };
const env = { KDMC_SSO_SECRET: 'sec', ACCOUNTS };
const REQ = (o) => new Request('https://kd-mc.com' + o.path, { method: o.method || 'GET', headers: o.headers || {}, body: o.body });
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('  ✗ ' + m)); };
const issue = async (uid, name) => { const r = await mod.fetch(REQ({ path: '/__sso/issue', method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ uid, name, cgu: true }) }), env); return (r.headers.get('set-cookie').match(/kdmc_sso=([^;]+)/) || [])[1]; };

const cKevin = await issue('kdmc_admin', 'Kevin Desarzens');
await issue('laurence-sp', 'Laurence Saint-Polit');
await issue('marie-dupont', 'Marie Dupont');

const fiche = JSON.parse(store.get('acc:marie-dupont'));
ok(fiche.name === 'Marie Dupont' && fiche.cgu_at > 0 && fiche.hits >= 1 && fiche.last_device, 'fiche client enrichie (nom+CGU+hits+device)');

let r = await mod.fetch(REQ({ path: '/__admin/accounts' }), env);
ok(r.status === 403, 'admin accounts sans session → 403');
r = await mod.fetch(REQ({ path: '/__admin/accounts', headers: { cookie: 'kdmc_sso=' + await issue('laurence-sp', 'Laurence Saint-Polit') } }), env);
ok(r.status === 403, 'admin accounts session NON-admin → 403');
/* FAIL-CLOSED : sans hash PIN, même un token "nom-admin" n'ouvre RIEN. */
r = await mod.fetch(REQ({ path: '/__admin/accounts', headers: { cookie: 'kdmc_sso=' + cKevin } }), env);
ok(r.status === 403, 'FAIL-CLOSED : sans hash PIN, token nom-admin → 403 (plus de fail-open par nom)');

/* whoami : le flag admin EXIGE verified (Face ID). Un uid admin AUTO-DÉCLARÉ
   (cKevin = issue, non vérifié) → admin:false (leçon #99). L'admin réel ne vient
   que d'un passkey vérifié (webauthn.test.mjs). */
r = await mod.fetch(REQ({ path: '/__sso/whoami', headers: { cookie: 'kdmc_sso=' + cKevin } }), env); let j = await r.json();
ok(j.ok && j.verified === false && j.admin === false, 'whoami Kevin auto-déclaré (non vérifié) → admin:false');
r = await mod.fetch(REQ({ path: '/__sso/whoami', headers: { cookie: 'kdmc_sso=' + await issue('marie-dupont', 'Marie Dupont') } }), env); j = await r.json();
ok(j.ok && j.admin === false, 'whoami client → admin:false');

/* ---- Gate admin (hash du PIN présent) : le nom auto-asserté ne suffit pas ---- */
const CODE = '200807';
const HASH = createHash('sha256').update(CODE).digest('hex');
const envH = { KDMC_SSO_SECRET: 'sec', KDMC_ADMIN_PIN_SHA256: HASH, ACCOUNTS };
r = await mod.fetch(REQ({ path: '/__admin/accounts', headers: { cookie: 'kdmc_sso=' + cKevin } }), envH); j = await r.json();
ok(r.status === 403 && j.reason === 'need_admin_code', 'token nom-admin SANS code → 403 need_admin_code (trou fermé)');
r = await mod.fetch(REQ({ path: '/__admin/login', method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: '000000' }) }), envH); j = await r.json();
ok(j.ok === false && j.reason === 'code_invalide', 'login admin mauvais code → refusé');
r = await mod.fetch(REQ({ path: '/__admin/login', method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: CODE }) }), envH); j = await r.json();
ok(j.ok === true && typeof j.grant === 'string' && j.grant.indexOf('.') > 0, 'login admin bon code → grant signé');
const grant = j.grant;
r = await mod.fetch(REQ({ path: '/__admin/accounts', headers: { 'x-kdmc-admin': grant } }), envH); j = await r.json();
ok(j.ok === true && j.count >= 3 && j.accounts.some((a) => a.uid === 'marie-dupont'), 'grant via header x-kdmc-admin → voit toutes les fiches (≥3)');
r = await mod.fetch(REQ({ path: '/__admin/accounts', headers: { cookie: 'kdmc_admin=' + grant } }), envH); j = await r.json();
ok(j.ok === true, 'grant via cookie kdmc_admin → accès fiches OK');
r = await mod.fetch(REQ({ path: '/__admin/accounts', headers: { 'x-kdmc-admin': grant.slice(0, -2) + 'XY' } }), envH);
ok(r.status === 403, 'grant falsifié → 403');
r = await mod.fetch(REQ({ path: '/__admin/accounts' }), envH);
ok(r.status === 403, 'aucun grant → 403 (même avec hash configuré)');
/* sans KV mais AVEC preuve admin valide → fail-open (0 fiche, pas d'erreur). */
r = await mod.fetch(REQ({ path: '/__admin/accounts', headers: { 'x-kdmc-admin': grant } }), { KDMC_SSO_SECRET: 'sec', KDMC_ADMIN_PIN_SHA256: HASH }); j = await r.json();
ok(j.ok === true && j.kv === false, 'sans KV → fail-open (0 fiche, pas d\'erreur)');
/* sans secret du tout → fermé. */
r = await mod.fetch(REQ({ path: '/__admin/accounts', headers: { 'x-kdmc-admin': grant } }), { ACCOUNTS });
ok(r.status === 403, 'sans secret → 403 (fermé)');

/* ---- Rate-limit serveur du code admin (anti brute-force) ---- */
const store2 = new Map();
const ACC2 = { get: async (k) => (store2.has(k) ? store2.get(k) : null), put: async (k, v) => { store2.set(k, v); }, delete: async (k) => { store2.delete(k); } };
const envR = { KDMC_SSO_SECRET: 'sec', KDMC_ADMIN_PIN_SHA256: HASH, ACCOUNTS: ACC2 };
const badLogin = () => mod.fetch(REQ({ path: '/__admin/login', method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: '999999' }) }), envR);
for (let i = 0; i < 5; i++) { j = await (await badLogin()).json(); }
ok(j.reason === 'code_invalide', '5 codes faux → encore code_invalide (pas encore bloqué)');
j = await (await badLogin()).json();
ok(j.reason === 'rate_limited' && j.wait > 0, '6e tentative → rate_limited (lockout serveur)');
j = await (await mod.fetch(REQ({ path: '/__admin/login', method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: CODE }) }), envR)).json();
ok(j.reason === 'rate_limited', 'lockout actif → même le BON code est bloqué');
/* fail-open : sans KV, pas de blocage (jamais de lockout si KV KO) */
const envNoKv = { KDMC_SSO_SECRET: 'sec', KDMC_ADMIN_PIN_SHA256: HASH };
for (let i = 0; i < 8; i++) { await mod.fetch(REQ({ path: '/__admin/login', method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: '999999' }) }), envNoKv); }
j = await (await mod.fetch(REQ({ path: '/__admin/login', method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: CODE }) }), envNoKv)).json();
ok(j.ok === true && typeof j.grant === 'string', 'sans KV → fail-open : bon code accepté même après 8 échecs (jamais de lockout)');

console.log(`Admin domaine test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
