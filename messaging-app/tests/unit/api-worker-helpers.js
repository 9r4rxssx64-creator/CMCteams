/**
 * Helpers partagés pour tests api-worker.js
 * Mocks Cloudflare bindings : D1, KV, R2, Queues, AI, DO namespace, JWT.
 */
import { vi } from 'vitest';

export const SECRET = 'jwt-test-secret';

/** Crée une "stmt" D1 qui répond selon la SQL via dispatch table */
export function makeStmt(sql, dispatch = {}) {
  const stmt = {
    sql,
    _args: [],
    bind(...args) { this._args = args; return this; },
    async first() {
      const fn = dispatch.first;
      if (typeof fn === 'function') return fn(sql, this._args);
      return fn ?? null;
    },
    async all() {
      const fn = dispatch.all;
      if (typeof fn === 'function') return fn(sql, this._args);
      return fn ?? { results: [] };
    },
    async run() {
      const fn = dispatch.run;
      if (typeof fn === 'function') return fn(sql, this._args);
      return fn ?? { success: true, meta: { changes: 1 } };
    },
  };
  return stmt;
}

/** D1 mock générique avec dispatch SQL → handlers */
export function makeDB(handlers = {}) {
  return {
    _calls: [],
    prepare: vi.fn(function (sql) {
      this._calls.push(sql);
      const dispatch = {};
      // Recherche dans handlers : la 1ère key qui matche en includes()
      for (const [pattern, h] of Object.entries(handlers)) {
        if (sql.includes(pattern)) {
          Object.assign(dispatch, typeof h === 'function' ? { first: h } : h);
          break;
        }
      }
      return makeStmt(sql, dispatch);
    }),
    batch: vi.fn(async (stmts) => ({ success: true, count: stmts.length })),
  };
}

export function makeKV(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    _store: store,
    get: vi.fn(async (k, type) => {
      const v = store.get(k);
      if (v === undefined) return null;
      return type === 'json' && typeof v === 'string' ? JSON.parse(v) : v;
    }),
    put: vi.fn(async (k, v) => { store.set(k, v); }),
    delete: vi.fn(async (k) => store.delete(k)),
    list: vi.fn(async () => ({ keys: [...store.keys()].map((name) => ({ name })) })),
  };
}

export function makeR2() {
  const store = new Map();
  return {
    _store: store,
    put: vi.fn(async (k, v) => { store.set(k, v); }),
    get: vi.fn(async (k) => store.has(k) ? { body: store.get(k), text: async () => store.get(k) } : null),
    head: vi.fn(async (k) => store.has(k) ? { size: store.get(k).length } : null),
    list: vi.fn(async () => ({ objects: [...store.keys()].map((key) => ({ key })) })),
    delete: vi.fn(async (k) => store.delete(k)),
  };
}

export function makeQueue() {
  const sent = [];
  return { _sent: sent, send: vi.fn(async (msg) => { sent.push(msg); }) };
}

export function makeDONamespace() {
  return {
    idFromName: vi.fn((name) => ({ toString: () => 'do-' + name })),
    idFromString: vi.fn((s) => ({ toString: () => s })),
    newUniqueId: vi.fn(() => ({ toString: () => 'do-' + crypto.randomUUID() })),
    get: vi.fn(() => ({
      fetch: vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })),
    })),
  };
}

export const ENV = (overrides = {}) => ({
  JWT_SIGN_KEY: SECRET,
  APEX_CHAT_ADMIN_TOKEN: 'admin-secret',
  APEX_CHAT_ADMIN_PHONE_E164: '+33672280277',
  APEX_CHAT_DB: makeDB(),
  APEX_CHAT_CACHE: makeKV(),
  APEX_CHAT_MEDIA: makeR2(),
  TELEMETRY_QUEUE: makeQueue(),
  PUSH_QUEUE: makeQueue(),
  CONVERSATION_DO: makeDONamespace(),
  BROADCAST_DO: makeDONamespace(),
  PRESENCE_DO: makeDONamespace(),
  ANTHROPIC_API_KEY: 'a',
  GROQ_API_KEY: 'g',
  ...overrides,
});

/** Génère un JWT valide signé avec SECRET */
export async function makeJWT(payload, secret = SECRET) {
  const enc = new TextEncoder();
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${header}.${payloadB64}`));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${header}.${payloadB64}.${sigB64}`;
}

/** Crée une Request avec body JSON et headers Auth si fourni */
export function makeRequest({ method = 'GET', path = '/', body, token, extraHeaders = {} } = {}) {
  const headers = { 'Content-Type': 'application/json', ...extraHeaders };
  if (token) headers.Authorization = 'Bearer ' + token;
  return new Request('https://api.apex/' + path.replace(/^\//, ''), {
    method,
    headers,
    body: body !== undefined && method !== 'GET' && method !== 'OPTIONS' ? JSON.stringify(body) : undefined,
  });
}
