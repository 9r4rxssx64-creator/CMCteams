/* Test régression /__bot/* (tableau de bord crypto-bot, bot.kd-mc.com).
   node bot.test.mjs
   - Gate FAIL-CLOSED : même grant admin que /__admin (leçons #98/#99).
   - Railway GraphQL mocké (backboard.railway.com) — aucune requête réseau réelle.
   - Erreurs : la cause exacte doit remonter dans `detail` (règle #97). */
import mod from './worker.js';
import { createHash, createHmac } from 'crypto';

/* Forge un jeton SSO (même format que worker.ssoSign) pour tester le Face ID. */
const b64u = (b) => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
function signSso(secret, uid, verified) {
  const p = b64u(JSON.stringify({ u: uid, n: uid, c: 1, v: verified ? 1 : 0, iat: Date.now(), exp: Date.now() + 1e9 }));
  return p + '.' + b64u(createHmac('sha256', secret).update(p).digest());
}

const store = new Map();
const ACCOUNTS = { get: async (k) => (store.has(k) ? store.get(k) : null), put: async (k, v) => { store.set(k, v); }, delete: async (k) => { store.delete(k); } };
const sha = (s) => createHash('sha256').update(s).digest('hex');
const CODE = '200807';
const envBase = { KDMC_SSO_SECRET: 'sec', KDMC_ADMIN_PIN_SHA256: sha(CODE), ACCOUNTS };

const REQ = (o) => new Request('https://bot.kd-mc.com' + o.path, { method: o.method || 'GET', headers: o.headers || {}, body: o.body });
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('  ✗ ' + m)); };

/* ---- Mock Railway GraphQL (le worker appelle backboard.railway.com via fetch) ---- */
const gqlCalls = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const u = typeof input === 'string' ? input : input.url;
  if (u.includes('backboard.railway.com')) {
    const q = JSON.parse(init.body).query;
    gqlCalls.push(q);
    const j = (d) => new Response(JSON.stringify(d), { headers: { 'content-type': 'application/json' } });
    if (q.includes('projectToken')) return j({ data: { projectToken: { projectId: 'P1', environmentId: 'E1' } } });
    if (q.includes('project(id')) return j({ data: { project: { name: 'CMCteams', services: { edges: [{ node: { id: 'S0', name: 'CMCteams' } }, { node: { id: 'S1', name: 'crypto-bot' } }, { node: { id: 'S2', name: 'crypto-bot-p1' } }] } } } });
    if (q.includes('deployments(')) return j({ data: { deployments: { edges: [{ node: { id: 'D1', status: 'SUCCESS', createdAt: '2026-07-03T00:00:00Z' } }] } } });
    /* /__bot/fleet lit limit: 1000 (avec trades) ; /__bot/status lit limit: 80 (ligne HOLD). */
    if (q.includes('deploymentLogs') && q.includes('limit: 1000')) return j({ data: { deploymentLogs: [
      { message: '🟢 BTC/USDT ACHAT qty=0.5 @ 100.00 (stop 90.00)' },
      { message: '🔻 BTC/USDT VENTE (signal) qty=0.5 @ 110.00' },
      { message: 'HOLD | prix=61500.00 | equity=10005.00 | pas de signal' },
    ] } });
    if (q.includes('deploymentLogs')) return j({ data: { deploymentLogs: [{ timestamp: '2026-07-03T00:01:00Z', message: 'HOLD | prix=61500.00 | equity=71500.00 | pas de signal' }] } });
    if (q.includes('variables(')) return j({ data: { variables: { SYMBOLS: 'BTC/USDT,ETH/USDT', TIMEFRAME: '15m', RISK_PER_TRADE_PCT: '1', MAX_POSITION_PCT: '25', TESTNET: 'true' } } });
    if (q.includes('variableUpsert')) return j({ data: { variableUpsert: true } });
    if (q.includes('serviceInstanceRedeploy')) return j({ data: { serviceInstanceRedeploy: true } });
    return j({ errors: [{ message: 'query inconnue (mock)' }] });
  }
  return realFetch(input, init);
};

/* 1) Sans grant → 403 need_admin_code (fail-closed) */
let r = await mod.fetch(REQ({ path: '/__bot/status' }), envBase);
ok(r.status === 403 && (await r.json()).reason === 'need_admin_code', '/__bot sans grant → 403 need_admin_code');

/* Grant admin via /__admin/login (preuve du code) */
r = await mod.fetch(REQ({ path: '/__admin/login', method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: CODE }) }), envBase);
const grant = (await r.json()).grant;
ok(!!grant, 'login admin → grant signé');
const H = { 'x-kdmc-admin': grant };

/* 2) Grant OK mais RAILWAY_TOKEN absent → cause exacte, pas de crash */
r = await mod.fetch(REQ({ path: '/__bot/status', headers: H }), envBase);
let j = await r.json();
ok(j.ok === false && j.reason === 'railway_token_absent', 'sans RAILWAY_TOKEN → railway_token_absent (cause exacte)');

/* 3) Statut complet avec token (Railway mocké) */
const env = { ...envBase, RAILWAY_TOKEN: 'rw_test' };
r = await mod.fetch(REQ({ path: '/__bot/status', headers: H }), env);
j = await r.json();
ok(j.ok === true && j.status === 'SUCCESS' && j.project === 'CMCteams', 'status → ok + SUCCESS + projet CMCteams');
ok(Array.isArray(j.logs) && j.logs.length === 1 && j.logs[0].m.includes('prix=61500.00'), 'status → logs runtime relayés');

/* 4) Kill : variableUpsert BOT_KILL=1 + redeploy */
gqlCalls.length = 0;
r = await mod.fetch(REQ({ path: '/__bot/kill', method: 'POST', headers: H }), env);
j = await r.json();
ok(j.ok === true && j.action === 'kill', 'kill → ok');
ok(gqlCalls.some((q) => q.includes('variableUpsert') && q.includes('BOT_KILL') && q.includes('"1"')), 'kill → variableUpsert BOT_KILL=1 envoyé');
ok(gqlCalls.some((q) => q.includes('serviceInstanceRedeploy')), 'kill → redeploy envoyé');

/* 5) Start : BOT_KILL=0 */
gqlCalls.length = 0;
r = await mod.fetch(REQ({ path: '/__bot/start', method: 'POST', headers: H }), env);
j = await r.json();
ok(j.ok === true && gqlCalls.some((q) => q.includes('BOT_KILL') && q.includes('"0"')), 'start → BOT_KILL=0 + ok');

/* 6) Kill SANS grant → 403 (les mutations ne partent jamais) */
gqlCalls.length = 0;
r = await mod.fetch(REQ({ path: '/__bot/kill', method: 'POST' }), env);
ok(r.status === 403 && gqlCalls.length === 0, 'kill sans grant → 403, zéro appel Railway');

/* 7) Config GET → réglages actuels + testnet */
r = await mod.fetch(REQ({ path: '/__bot/config', headers: H }), env);
j = await r.json();
ok(j.ok === true && j.config.SYMBOLS === 'BTC/USDT,ETH/USDT' && j.testnet === true, 'config GET → réglages + testnet');

/* 8) Config POST valide → upsert normalisé (eth-usdt → ETH/USDT) + redeploy */
gqlCalls.length = 0;
r = await mod.fetch(REQ({ path: '/__bot/config', method: 'POST', headers: { ...H, 'content-type': 'application/json' }, body: JSON.stringify({ symbols: ['btc-usdt', 'ETH/USDT', 'SOLUSDT'], timeframe: '1h', risk: 1.5, maxpos: 30 }) }), env);
j = await r.json();
ok(j.ok === true && j.set.SYMBOLS === 'BTC/USDT,ETH/USDT,SOL/USDT', 'config POST normalise + accepte');
ok(j.set.TIMEFRAME === '1h' && j.set.RISK_PER_TRADE_PCT === '1.5', 'config POST applique timeframe + risk');
ok(gqlCalls.some((q) => q.includes('serviceInstanceRedeploy')), 'config POST → redeploy');

/* 9) Config POST invalide → cause exacte, aucun upsert */
gqlCalls.length = 0;
r = await mod.fetch(REQ({ path: '/__bot/config', method: 'POST', headers: { ...H, 'content-type': 'application/json' }, body: JSON.stringify({ symbols: ['BTC/EUR'], risk: 99 }) }), env);
j = await r.json();
ok(j.ok === false && j.reason === 'reglage_invalide' && /USDT|BTC\/EUR/.test(j.detail), 'config POST invalide (devise ≠ USDT) → cause exacte');
ok(!gqlCalls.some((q) => q.includes('variableUpsert')), 'config invalide → aucun upsert Railway');

/* 10) Config POST sans grant → 403 */
r = await mod.fetch(REQ({ path: '/__bot/config', method: 'POST', body: '{}' }), env);
ok(r.status === 403, 'config POST sans grant → 403');

/* 11) Grant admin MACHINE (agent de contrôle GitHub) : adminGrant(secret) doit être
   accepté par /__bot/status exactement comme un login admin (même ssoSign). */
import { adminGrant } from './worker.js';
const machineTok = await adminGrant('sec');
r = await mod.fetch(REQ({ path: '/__bot/status', headers: { 'x-kdmc-admin': machineTok } }), env);
j = await r.json();
ok(j.ok === true && j.status === 'SUCCESS', 'grant machine (adminGrant) accepté par /__bot/status');
const badTok = await adminGrant('MAUVAIS_SECRET');
r = await mod.fetch(REQ({ path: '/__bot/status', headers: { 'x-kdmc-admin': badTok } }), env);
ok(r.status === 403, 'grant signé avec un mauvais secret → 403 (forge rejetée)');

/* 12) FACE ID : session SSO VÉRIFIÉE d'un uid admin (via x-kdmc-sso) → accès accordé
   SANS le code (déverrouillage Face ID depuis bot.kd-mc.com). */
r = await mod.fetch(REQ({ path: '/__bot/status', headers: { 'x-kdmc-sso': signSso('sec', 'kevin-desarzens', true) } }), env);
j = await r.json();
ok(j.ok === true && j.status === 'SUCCESS', 'Face ID vérifié + uid admin → /__bot/status accordé');

/* 13) SÉCU : session NON vérifiée (nom auto-déclaré, pas de Face ID) → refusée (leçon #99). */
r = await mod.fetch(REQ({ path: '/__bot/status', headers: { 'x-kdmc-sso': signSso('sec', 'kevin-desarzens', false) } }), env);
ok(r.status === 403, 'SSO non vérifié (sans Face ID) → 403');

/* 14) SÉCU : session vérifiée mais uid NON admin → refusée. */
r = await mod.fetch(REQ({ path: '/__bot/status', headers: { 'x-kdmc-sso': signSso('sec', 'un-inconnu', true) } }), env);
ok(r.status === 403, 'Face ID vérifié mais uid non-admin → 403');

/* 15) SÉCU : jeton SSO signé avec un mauvais secret → refusé (forge). */
r = await mod.fetch(REQ({ path: '/__bot/status', headers: { 'x-kdmc-sso': signSso('MAUVAIS', 'kevin-desarzens', true) } }), env);
ok(r.status === 403, 'SSO forgé (mauvais secret) → 403');

/* 16) Route inconnue → not_found */
r = await mod.fetch(REQ({ path: '/__bot/xyz', headers: H }), env);
ok((await r.json()).reason === 'not_found', 'route inconnue → not_found');

/* 17) FLOTTE sans grant → 403 (fail-closed, comme le reste de /__bot) */
r = await mod.fetch(REQ({ path: '/__bot/fleet' }), env);
ok(r.status === 403, '/__bot/fleet sans grant → 403');

/* 18) FLOTTE avec grant : 6 entrées, trades FIFO comptés, absents honnêtes */
r = await mod.fetch(REQ({ path: '/__bot/fleet', headers: H }), env);
j = await r.json();
ok(j.ok === true && Array.isArray(j.bots) && j.bots.length === 6, 'fleet → 6 bots listés');
const alive = (j.bots || []).filter((b) => b.status === 'SUCCESS');
const absent = (j.bots || []).filter((b) => b.status === 'absent');
ok(alive.length === 2 && absent.length === 4, 'fleet → 2 déployés (crypto-bot, p1) + 4 absents (honnête)');
ok(alive.every((b) => b.buys === 1 && b.sells === 1 && b.wins === 1 && b.losses === 0), 'fleet → trades FIFO comptés (1 achat, 1 vente gagnante)');
ok(alive.every((b) => b.net === 5 && b.equity === 10005), 'fleet → net FIFO = 0.5×(110−100) = 5 $ + équité extraite');
ok(j.bots[0].net === 5 && j.bots[5].status === 'absent', 'fleet → trié par net, absents en dernier');

globalThis.fetch = realFetch;
console.log(`bot.test.mjs : ${pass} OK / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
