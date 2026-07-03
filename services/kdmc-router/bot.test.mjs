/* Test régression /__bot/* (tableau de bord crypto-bot, bot.kd-mc.com).
   node bot.test.mjs
   - Gate FAIL-CLOSED : même grant admin que /__admin (leçons #98/#99).
   - Railway GraphQL mocké (backboard.railway.com) — aucune requête réseau réelle.
   - Erreurs : la cause exacte doit remonter dans `detail` (règle #97). */
import mod from './worker.js';
import { createHash } from 'crypto';

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
    if (q.includes('project(id')) return j({ data: { project: { name: 'CMCteams', services: { edges: [{ node: { id: 'S0', name: 'CMCteams' } }, { node: { id: 'S1', name: 'crypto-bot' } }] } } } });
    if (q.includes('deployments(')) return j({ data: { deployments: { edges: [{ node: { id: 'D1', status: 'SUCCESS', createdAt: '2026-07-03T00:00:00Z' } }] } } });
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

/* 11) Route inconnue → not_found */
r = await mod.fetch(REQ({ path: '/__bot/xyz', headers: H }), env);
ok((await r.json()).reason === 'not_found', 'route inconnue → not_found');

globalThis.fetch = realFetch;
console.log(`bot.test.mjs : ${pass} OK / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
