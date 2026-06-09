/* Test régression admin domaine + registre fiches (KV mock). node admin.test.mjs
   NB: request.cf (géo Cloudflare) n'existe pas sous Node → l'enrichissement géo
   est vérifié en prod, pas ici (on teste le reste : nom/CGU/hits/device/admin-gate). */
import mod from './worker.js';
const store = new Map();
const ACCOUNTS = { get: async (k) => (store.has(k) ? store.get(k) : null), put: async (k, v) => { store.set(k, v); } };
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
r = await mod.fetch(REQ({ path: '/__admin/accounts', headers: { cookie: 'kdmc_sso=' + cKevin } }), env); let j = await r.json();
ok(j.ok && j.count >= 3 && j.accounts.some((a) => a.uid === 'marie-dupont'), 'admin Kevin → voit toutes les fiches (≥3)');
r = await mod.fetch(REQ({ path: '/__sso/whoami', headers: { cookie: 'kdmc_sso=' + cKevin } }), env); j = await r.json();
ok(j.ok && j.admin === true, 'whoami Kevin → admin:true');
r = await mod.fetch(REQ({ path: '/__sso/whoami', headers: { cookie: 'kdmc_sso=' + await issue('marie-dupont', 'Marie Dupont') } }), env); j = await r.json();
ok(j.ok && j.admin === false, 'whoami client → admin:false');
r = await mod.fetch(REQ({ path: '/__admin/accounts', headers: { cookie: 'kdmc_sso=' + cKevin } }), { KDMC_SSO_SECRET: 'sec' }); j = await r.json();
ok(j.ok === true && j.kv === false, 'sans KV → fail-open (0 fiche, pas d\'erreur)');

console.log(`Admin domaine test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
