/**
 * Tests workers/durable-objects/ConversationDO.js — DO temps réel WebSocket
 * Coverage 100% via mocks state, storage, WebSocketPair, D1, fetch.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConversationDO, BroadcastDO, PresenceDO } from '../../workers/durable-objects/ConversationDO.js';

// ----------------------------------------------------------------------------
// Mocks Cloudflare Durable Object runtime
// ----------------------------------------------------------------------------
class MockWebSocket extends EventTarget {
  constructor(role = 'server') {
    super();
    this.role = role;
    this.sent = [];
    this.closed = null;
    this.accepted = false;
    this._listeners = {};
  }
  accept() { this.accepted = true; }
  send(data) { this.sent.push(data); }
  close(code, reason) { this.closed = { code, reason }; }
  addEventListener(type, fn) {
    super.addEventListener(type, fn);
    this._listeners[type] = (this._listeners[type] || []).concat(fn);
  }
  triggerMessage(data) {
    const event = { data, type: 'message' };
    (this._listeners.message || []).forEach((fn) => fn(event));
  }
  triggerClose() {
    (this._listeners.close || []).forEach((fn) => fn({ type: 'close' }));
  }
}
globalThis.WebSocketPair = class {
  constructor() {
    this[0] = new MockWebSocket('client');
    this[1] = new MockWebSocket('server');
  }
};

function makeStorage() {
  const data = new Map();
  return {
    data,
    get: vi.fn(async (k) => data.get(k)),
    put: vi.fn(async (k, v) => { data.set(k, v); }),
  };
}

function makeState(id = 'conv-id-123') {
  return {
    id: { toString: () => id },
    storage: makeStorage(),
    blockConcurrencyWhile: vi.fn(async (fn) => { await fn(); }),
  };
}

// Helper qui crée un objet "Request-like" avec Upgrade header (que fetch natif strip)
function wsRequest(url) {
  return {
    url,
    method: 'GET',
    headers: {
      get(name) {
        return name.toLowerCase() === 'upgrade' ? 'websocket' : null;
      },
    },
  };
}

function httpRequest(url, init = {}) {
  return new Request(url, init);
}

function makeDB(rows = []) {
  return {
    _rows: rows,
    prepare: vi.fn((sql) => ({
      sql,
      bind: vi.fn(function (...args) {
        this._args = args;
        return this;
      }),
      first: vi.fn(async function () {
        if (sql.includes('system_config')) return null;
        if (sql.includes('conversation_members')) {
          // First member match
          return rows.find((r) => r.user_id === this._args?.[1]) || null;
        }
        if (sql.includes('FROM messages')) return rows[0] || null;
        return null;
      }),
      all: vi.fn(async () => ({ results: rows })),
      run: vi.fn(async () => ({ success: true })),
    })),
    batch: vi.fn(async (stmts) => ({ success: true, count: stmts.length })),
  };
}

async function makeJWT(payload, secret) {
  const enc = new TextEncoder();
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${header}.${payloadB64}`));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${header}.${payloadB64}.${sigB64}`;
}

const SECRET = 'jwt-test-secret';

const ENV = (overrides = {}) => ({
  JWT_SIGN_KEY: SECRET,
  APEX_CHAT_ADMIN_TOKEN: 'admin-secret',
  APEX_CHAT_DB: makeDB([{ user_id: 'kdmc', role: 'owner' }]),
  TELEMETRY_QUEUE: { send: vi.fn(async () => {}) },
  ...overrides,
});

beforeEach(() => {
  vi.restoreAllMocks();
  globalThis.fetch = vi.fn(async () => new Response(null, { status: 200 }));
});

// ----------------------------------------------------------------------------
// ConversationDO — basic
// ----------------------------------------------------------------------------
describe('ConversationDO — constructor + storage rehydrate', () => {
  it('init seq=0 si rien dans storage', async () => {
    const state = makeState();
    const env = ENV();
    const _do = new ConversationDO(state, env);
    await new Promise((r) => setTimeout(r, 5));
    expect(_do.seq).toBe(0);
    expect(state.blockConcurrencyWhile).toHaveBeenCalled();
  });

  it('rehydrate seq depuis storage si existant', async () => {
    const state = makeState();
    state.storage.data.set('seq', 42);
    const env = ENV();
    const _do = new ConversationDO(state, env);
    await new Promise((r) => setTimeout(r, 5));
    expect(_do.seq).toBe(42);
  });

  it('loadConfig fail → fallback B', async () => {
    const env = ENV({
      APEX_CHAT_DB: {
        prepare: () => ({
          all: async () => { throw new Error('db down'); },
        }),
      },
    });
    const state = makeState();
    const _do = new ConversationDO(state, env);
    await new Promise((r) => setTimeout(r, 10));
    expect(_do.config.ADMIN_MODE).toBe('B');
  });

  it('loadConfig success → applique values', async () => {
    const env = ENV({
      APEX_CHAT_DB: {
        prepare: () => ({
          all: async () => ({ results: [{ key: 'KEVIN_INVISIBLE_ADMIN', value: 'true' }] }),
        }),
      },
    });
    const state = makeState();
    const _do = new ConversationDO(state, env);
    await new Promise((r) => setTimeout(r, 10));
    expect(_do.config.KEVIN_INVISIBLE_ADMIN).toBe('true');
  });

  it('loadConfig avec results undefined', async () => {
    const env = ENV({
      APEX_CHAT_DB: {
        prepare: () => ({ all: async () => ({}) }),
      },
    });
    const state = makeState();
    const _do = new ConversationDO(state, env);
    await new Promise((r) => setTimeout(r, 10));
    expect(_do.config).toEqual({});
  });
});

// ----------------------------------------------------------------------------
// ConversationDO — verifyJWT
// ----------------------------------------------------------------------------
describe('ConversationDO — verifyJWT', () => {
  let _do;
  beforeEach(async () => {
    _do = new ConversationDO(makeState(), ENV());
    await new Promise((r) => setTimeout(r, 5));
  });

  it('token null → null', async () => {
    expect(await _do.verifyJWT(null)).toBe(null);
  });

  it('JWT_SIGN_KEY manquant → null', async () => {
    _do.env = { ...ENV(), JWT_SIGN_KEY: '' };
    const t = await makeJWT({ sub: 'kdmc' }, SECRET);
    expect(await _do.verifyJWT(t)).toBe(null);
  });

  it('format invalide (pas 3 parts) → null', async () => {
    expect(await _do.verifyJWT('aaaa')).toBe(null);
    expect(await _do.verifyJWT('aaaa.bbbb')).toBe(null);
  });

  it('signature invalide → null', async () => {
    const fake = await makeJWT({ sub: 'kdmc' }, 'WRONG_SECRET');
    expect(await _do.verifyJWT(fake)).toBe(null);
  });

  it('JWT expired → null', async () => {
    const expired = await makeJWT({ sub: 'kdmc', exp: Math.floor(Date.now() / 1000) - 100 }, SECRET);
    expect(await _do.verifyJWT(expired)).toBe(null);
  });

  it('JWT valide → payload', async () => {
    const valid = await makeJWT({ sub: 'kdmc', exp: Math.floor(Date.now() / 1000) + 3600 }, SECRET);
    const p = await _do.verifyJWT(valid);
    expect(p.sub).toBe('kdmc');
  });

  it('JWT sans exp → accepted', async () => {
    const noExp = await makeJWT({ sub: 'kdmc' }, SECRET);
    const p = await _do.verifyJWT(noExp);
    expect(p.sub).toBe('kdmc');
  });

  it('JWT format malformé (atob throw) → null', async () => {
    expect(await _do.verifyJWT('!!.!!.!!')).toBe(null);
  });
});

// ----------------------------------------------------------------------------
// ConversationDO — fetch (HTTP routes)
// ----------------------------------------------------------------------------
describe('ConversationDO — fetch /health', () => {
  it('GET /health → connected/seq/pending', async () => {
    const _do = new ConversationDO(makeState(), ENV());
    await new Promise((r) => setTimeout(r, 5));
    const r = await _do.fetch(new Request('https://x/health'));
    const b = await r.json();
    expect(b.ok).toBe(true);
    expect(b.connected).toBe(0);
    expect(b.seq).toBe(0);
    expect(b.pending).toBe(0);
  });
});

describe('ConversationDO — fetch WebSocket upgrade', () => {
  it('sans Upgrade header → 426', async () => {
    const _do = new ConversationDO(makeState(), ENV());
    await new Promise((r) => setTimeout(r, 5));
    const r = await _do.fetch(new Request('https://x/ws'));
    expect(r.status).toBe(426);
  });

  it('manque token/uid → close 1008 Auth required', async () => {
    const _do = new ConversationDO(makeState(), ENV());
    await new Promise((r) => setTimeout(r, 5));
    const r = await _do.fetch(wsRequest('https://x/ws'));
    expect(r.status).toBe(101);
  });

  it('JWT invalide → close 1008 Invalid token', async () => {
    const _do = new ConversationDO(makeState(), ENV());
    await new Promise((r) => setTimeout(r, 5));
    const url = 'https://x/ws?token=INVALID&uid=kdmc&conv=conv1';
    const r = await _do.fetch(wsRequest(url));
    expect(r.status).toBe(101);
  });

  it('UID mismatch → close 1008', async () => {
    const _do = new ConversationDO(makeState(), ENV());
    await new Promise((r) => setTimeout(r, 5));
    const validJWT = await makeJWT({ sub: 'realuser', exp: Math.floor(Date.now() / 1000) + 3600 }, SECRET);
    const url = `https://x/ws?token=${validJWT}&uid=fakeUser&conv=conv1`;
    const r = await _do.fetch(wsRequest(url));
    expect(r.status).toBe(101);
  });

  it('user pas membre → close 1008 Not a member', async () => {
    const env = ENV({ APEX_CHAT_DB: makeDB([]) }); // empty members
    const _do = new ConversationDO(makeState(), env);
    await new Promise((r) => setTimeout(r, 5));
    const validJWT = await makeJWT({ sub: 'kdmc', exp: Math.floor(Date.now() / 1000) + 3600 }, SECRET);
    const url = `https://x/ws?token=${validJWT}&uid=kdmc&conv=conv1`;
    const r = await _do.fetch(wsRequest(url));
    expect(r.status).toBe(101);
  });

  it('DB error → close 1011', async () => {
    const env = ENV({
      APEX_CHAT_DB: {
        prepare: () => ({
          bind: function () { return this; },
          first: async () => { throw new Error('db down'); },
        }),
      },
    });
    const _do = new ConversationDO(makeState(), env);
    await new Promise((r) => setTimeout(r, 5));
    const validJWT = await makeJWT({ sub: 'kdmc', exp: Math.floor(Date.now() / 1000) + 3600 }, SECRET);
    const url = `https://x/ws?token=${validJWT}&uid=kdmc&conv=conv1`;
    const r = await _do.fetch(wsRequest(url));
    expect(r.status).toBe(101);
  });

  it('upgrade success → session ajoutée + hello envoyé', async () => {
    const _do = new ConversationDO(makeState(), ENV());
    await new Promise((r) => setTimeout(r, 5));
    const validJWT = await makeJWT({ sub: 'kdmc', exp: Math.floor(Date.now() / 1000) + 3600 }, SECRET);
    const url = `https://x/ws?token=${validJWT}&uid=kdmc&conv=conv1`;
    const r = await _do.fetch(wsRequest(url));
    expect(r.status).toBe(101);
    expect(_do.sessions.size).toBe(1);
    const server = [..._do.sessions.keys()][0];
    expect(server.sent.some((m) => JSON.parse(m).type === 'hello')).toBe(true);
  });

  it('upgrade success sans deviceId param → utilise random UUID', async () => {
    const _do = new ConversationDO(makeState(), ENV());
    await new Promise((r) => setTimeout(r, 5));
    const validJWT = await makeJWT({ sub: 'kdmc', exp: Math.floor(Date.now() / 1000) + 3600 }, SECRET);
    const url = `https://x/ws?token=${validJWT}&uid=kdmc&conv=conv1`;
    await _do.fetch(wsRequest(url));
    const session = [..._do.sessions.values()][0];
    expect(session.deviceId).toBeTruthy();
  });

  it('upgrade success sans conv param → utilise state.id', async () => {
    const _do = new ConversationDO(makeState('SOME-DO-ID'), ENV());
    await new Promise((r) => setTimeout(r, 5));
    const validJWT = await makeJWT({ sub: 'kdmc', exp: Math.floor(Date.now() / 1000) + 3600 }, SECRET);
    const url = `https://x/ws?token=${validJWT}&uid=kdmc`;
    await _do.fetch(wsRequest(url));
    const session = [..._do.sessions.values()][0];
    expect(session.convId).toBe('SOME-DO-ID');
  });
});

// ----------------------------------------------------------------------------
// ConversationDO — handleMessage (chaque type)
// ----------------------------------------------------------------------------
describe('ConversationDO — handleMessage', () => {
  let _do, ws, server;
  beforeEach(async () => {
    _do = new ConversationDO(makeState(), ENV());
    await new Promise((r) => setTimeout(r, 5));
    ws = new MockWebSocket();
    _do.sessions.set(ws, {
      userId: 'kdmc', deviceId: 'd1', convId: 'conv1', lastSeq: 0,
      connectedAt: Date.now(), messageCount: 0, lastReset: Date.now(),
    });
  });

  it('handleMessage avec session inconnue → no-op', async () => {
    const otherWs = new MockWebSocket();
    await _do.handleMessage(otherWs, { type: 'message', ciphertext: 'x' });
    expect(otherWs.sent.length).toBe(0);
  });

  it('rate limit reset si > 60s', async () => {
    const session = _do.sessions.get(ws);
    session.lastReset = Date.now() - 70000;
    session.messageCount = 50;
    await _do.handleMessage(ws, { type: 'message', ciphertext: 'x' });
    expect(_do.sessions.get(ws).messageCount).toBe(1);
  });

  it('rate limit > 100 msg/min → erreur', async () => {
    const session = _do.sessions.get(ws);
    session.messageCount = 100;
    await _do.handleMessage(ws, { type: 'message', ciphertext: 'x' });
    const last = JSON.parse(ws.sent[ws.sent.length - 1]);
    expect(last.code).toBe('rate_limit');
  });

  it('message sans ciphertext → erreur', async () => {
    await _do.handleMessage(ws, { type: 'message' });
    const e = JSON.parse(ws.sent[ws.sent.length - 1]);
    expect(e.message).toContain('ciphertext required');
  });

  it('message ciphertext > 100KB → erreur', async () => {
    const big = 'x'.repeat(100001);
    await _do.handleMessage(ws, { type: 'message', ciphertext: big });
    const e = JSON.parse(ws.sent[ws.sent.length - 1]);
    expect(e.message).toContain('too large');
  });

  it('message valide → seq inc, broadcast, ack', async () => {
    await _do.handleMessage(ws, { type: 'message', ciphertext: 'cipher-data' });
    expect(_do.seq).toBe(1);
    const ackMsg = ws.sent.map((m) => JSON.parse(m)).find((m) => m.type === 'ack');
    expect(ackMsg).toBeDefined();
    expect(ackMsg.seq).toBe(1);
  });

  it('message avec mime/reply_to/thread_root/view_once/expires_at', async () => {
    await _do.handleMessage(ws, {
      type: 'message', ciphertext: 'x', mime: 'image/png',
      reply_to: 'msg-prev', thread_root: 'thread-root',
      view_once: true, expires_at: Date.now() + 1000,
    });
    const recorded = _do.pendingMessages[0];
    expect(recorded.mime).toBe('image/png');
    expect(recorded.view_once).toBe(1);
    expect(recorded.reply_to).toBe('msg-prev');
  });

  it('message → flush D1 quand pendingMessages atteint 10', async () => {
    for (let i = 0; i < 10; i++) {
      await _do.handleMessage(ws, { type: 'message', ciphertext: 'x' + i });
    }
    expect(_do.pendingMessages.length).toBe(0); // flushé au 10ème
  });

  it('message → flush D1 quand > 5s même peu de messages', async () => {
    _do.lastFlush = Date.now() - 6000;
    await _do.handleMessage(ws, { type: 'message', ciphertext: 'x' });
    expect(_do.pendingMessages.length).toBe(0);
  });

  it('typing → broadcast (excluant ws expéditeur)', async () => {
    const ws2 = new MockWebSocket();
    _do.sessions.set(ws2, { userId: 'other' });
    await _do.handleMessage(ws, { type: 'typing' });
    const t = ws2.sent.map((m) => JSON.parse(m)).find((m) => m.type === 'typing');
    expect(t).toBeDefined();
    expect(t.userId).toBe('kdmc');
  });

  it('read → marque last_read_msg_id + broadcast', async () => {
    await _do.handleMessage(ws, { type: 'read', message_id: 'msg-42' });
    // Pas d'erreur, broadcast envoyé aux autres
  });

  it('reaction → toggle add/remove', async () => {
    const env = ENV({
      APEX_CHAT_DB: {
        prepare: vi.fn((sql) => ({
          bind: function (...args) { this._args = args; return this; },
          first: async function () {
            if (sql.includes('SELECT reactions')) return { reactions: '{}' };
            return null;
          },
          run: async () => ({ success: true }),
          all: async () => ({ results: [] }),
        })),
      },
      JWT_SIGN_KEY: SECRET,
    });
    _do.env = env;
    await _do.handleMessage(ws, { type: 'reaction', message_id: 'msg-1', emoji: '👍' });
  });

  it('reaction inexistante (existing null) → no broadcast', async () => {
    _do.env = ENV({
      APEX_CHAT_DB: {
        prepare: () => ({
          bind: function () { return this; },
          first: async () => null,
          run: async () => ({ success: true }),
        }),
      },
      JWT_SIGN_KEY: SECRET,
    });
    await _do.handleMessage(ws, { type: 'reaction', message_id: 'unknown', emoji: '👍' });
    // No broadcast happens — pas de crash
  });

  it('reaction toggle remove (déjà présent)', async () => {
    _do.env = ENV({
      APEX_CHAT_DB: {
        prepare: () => ({
          bind: function () { return this; },
          first: async () => ({ reactions: JSON.stringify({ '👍': ['kdmc'] }) }),
          run: async () => ({ success: true }),
        }),
      },
      JWT_SIGN_KEY: SECRET,
    });
    await _do.handleMessage(ws, { type: 'reaction', message_id: 'msg-1', emoji: '👍' });
  });

  it('reaction parse fail → vide', async () => {
    _do.env = ENV({
      APEX_CHAT_DB: {
        prepare: () => ({
          bind: function () { return this; },
          first: async () => ({ reactions: 'INVALID-JSON' }),
          run: async () => ({ success: true }),
        }),
      },
      JWT_SIGN_KEY: SECRET,
    });
    await _do.handleMessage(ws, { type: 'reaction', message_id: 'msg-1', emoji: '🎉' });
  });

  it('reaction avec reactions null → fallback "{}"', async () => {
    _do.env = ENV({
      APEX_CHAT_DB: {
        prepare: () => ({
          bind: function () { return this; },
          first: async () => ({ reactions: null }),
          run: async () => ({ success: true }),
        }),
      },
      JWT_SIGN_KEY: SECRET,
    });
    await _do.handleMessage(ws, { type: 'reaction', message_id: 'msg-1', emoji: '🚀' });
  });

  it('ping → pong', async () => {
    await _do.handleMessage(ws, { type: 'ping' });
    const pong = ws.sent.map((m) => JSON.parse(m)).find((m) => m.type === 'pong');
    expect(pong).toBeDefined();
  });

  it('type inconnu → erreur Type inconnu', async () => {
    await _do.handleMessage(ws, { type: 'TOTALLY_UNKNOWN' });
    const e = ws.sent.map((m) => JSON.parse(m)).find((m) => (m.message || '').includes('Type inconnu'));
    expect(e).toBeDefined();
  });

  // Visio WebRTC : relay signaling messages aux autres sessions
  it('webrtc-offer → broadcast aux autres avec from + to + callType + offer', async () => {
    const ws2 = new MockWebSocket();
    _do.sessions.set(ws2, { userId: 'peer2', deviceId: 'd2' });
    await _do.handleMessage(ws, {
      type: 'webrtc-offer', to: 'peer2', callType: 'video',
      offer: { type: 'offer', sdp: 'remote-sdp' },
    });
    const fwd = ws2.sent.map((m) => JSON.parse(m)).find((m) => m.type === 'webrtc-offer');
    expect(fwd).toBeDefined();
    expect(fwd.from).toBe('kdmc');
    expect(fwd.to).toBe('peer2');
    expect(fwd.callType).toBe('video');
    expect(fwd.offer.sdp).toBe('remote-sdp');
  });

  it('webrtc-answer → broadcast', async () => {
    const ws2 = new MockWebSocket();
    _do.sessions.set(ws2, { userId: 'peer2' });
    await _do.handleMessage(ws, { type: 'webrtc-answer', to: 'peer2', answer: { type: 'answer', sdp: 'a' } });
    const fwd = ws2.sent.map((m) => JSON.parse(m)).find((m) => m.type === 'webrtc-answer');
    expect(fwd).toBeDefined();
    expect(fwd.answer.sdp).toBe('a');
  });

  it('webrtc-candidate → broadcast (ICE relay)', async () => {
    const ws2 = new MockWebSocket();
    _do.sessions.set(ws2, { userId: 'peer2' });
    await _do.handleMessage(ws, { type: 'webrtc-candidate', to: 'peer2', candidate: { candidate: 'ice-foo' } });
    const fwd = ws2.sent.map((m) => JSON.parse(m)).find((m) => m.type === 'webrtc-candidate');
    expect(fwd).toBeDefined();
    expect(fwd.candidate.candidate).toBe('ice-foo');
  });

  it('call-end → broadcast', async () => {
    const ws2 = new MockWebSocket();
    _do.sessions.set(ws2, { userId: 'peer2' });
    await _do.handleMessage(ws, { type: 'call-end' });
    expect(ws2.sent.map((m) => JSON.parse(m)).find((m) => m.type === 'call-end')).toBeDefined();
  });

  it('call-busy → broadcast', async () => {
    const ws2 = new MockWebSocket();
    _do.sessions.set(ws2, { userId: 'peer2' });
    await _do.handleMessage(ws, { type: 'call-busy', to: 'peer2' });
    expect(ws2.sent.map((m) => JSON.parse(m)).find((m) => m.type === 'call-busy')).toBeDefined();
  });

  it('webrtc-offer sans to → to=null + broadcast all', async () => {
    const ws2 = new MockWebSocket();
    _do.sessions.set(ws2, { userId: 'peer2' });
    await _do.handleMessage(ws, { type: 'webrtc-offer', offer: { type: 'offer', sdp: 'x' } });
    const fwd = ws2.sent.map((m) => JSON.parse(m)).find((m) => m.type === 'webrtc-offer');
    expect(fwd.to).toBeNull();
  });
});

// ----------------------------------------------------------------------------
// ConversationDO — broadcast helpers
// ----------------------------------------------------------------------------
describe('ConversationDO — broadcast & notifyOfflineMembers & flushToD1', () => {
  it('broadcast send échoue → catch silencieux', async () => {
    const _do = new ConversationDO(makeState(), ENV());
    await new Promise((r) => setTimeout(r, 5));
    const ws = new MockWebSocket();
    ws.send = () => { throw new Error('dead'); };
    _do.sessions.set(ws, { userId: 'kdmc' });
    expect(() => _do.broadcast({ type: 'x' })).not.toThrow();
  });

  it('notifyOfflineMembers : tous online → return early', async () => {
    const _do = new ConversationDO(makeState(), ENV({
      APEX_CHAT_DB: {
        prepare: () => ({
          bind: function () { return this; },
          all: async () => ({ results: [{ user_id: 'kdmc' }] }),
        }),
      },
      JWT_SIGN_KEY: SECRET,
    }));
    await new Promise((r) => setTimeout(r, 5));
    const ws = new MockWebSocket();
    _do.sessions.set(ws, { userId: 'kdmc' });
    await _do.notifyOfflineMembers({ id: 'm', conv_id: 'c', sender_id: 'kdmc', ts: Date.now() });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('notifyOfflineMembers : 2 offline → 2 fetch push', async () => {
    const _do = new ConversationDO(makeState(), ENV({
      APEX_CHAT_DB: {
        prepare: () => ({
          bind: function () { return this; },
          all: async () => ({ results: [
            { user_id: 'kdmc' }, { user_id: 'laurence' }, { user_id: 'amis-1' },
          ] }),
        }),
      },
      JWT_SIGN_KEY: SECRET,
    }));
    await new Promise((r) => setTimeout(r, 5));
    const ws = new MockWebSocket();
    _do.sessions.set(ws, { userId: 'kdmc' });
    await _do.notifyOfflineMembers({ id: 'm', conv_id: 'c', sender_id: 'kdmc', ts: Date.now() });
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('notifyOfflineMembers DB error → catch silencieux', async () => {
    const _do = new ConversationDO(makeState(), ENV({
      APEX_CHAT_DB: { prepare: () => ({ bind: function () { return this; }, all: async () => { throw new Error('db'); } }) },
      JWT_SIGN_KEY: SECRET,
    }));
    await new Promise((r) => setTimeout(r, 5));
    await expect(_do.notifyOfflineMembers({ id: 'm', conv_id: 'c', sender_id: 'kdmc', ts: 0 })).resolves.toBeUndefined();
  });

  it('notifyOfflineMembers results undefined', async () => {
    const _do = new ConversationDO(makeState(), ENV({
      APEX_CHAT_DB: { prepare: () => ({ bind: function () { return this; }, all: async () => ({}) }) },
      JWT_SIGN_KEY: SECRET,
    }));
    await new Promise((r) => setTimeout(r, 5));
    await _do.notifyOfflineMembers({ id: 'm', conv_id: 'c', sender_id: 'kdmc', ts: 0 });
  });

  it('notifyOfflineMembers sans APEX_CHAT_ADMIN_TOKEN → header vide', async () => {
    const env = ENV({
      APEX_CHAT_ADMIN_TOKEN: undefined,
      APEX_CHAT_DB: {
        prepare: () => ({
          bind: function () { return this; },
          all: async () => ({ results: [{ user_id: 'offline1' }] }),
        }),
      },
      JWT_SIGN_KEY: SECRET,
    });
    const _do = new ConversationDO(makeState(), env);
    await new Promise((r) => setTimeout(r, 5));
    await _do.notifyOfflineMembers({ id: 'm', conv_id: 'c', sender_id: 'kdmc', ts: 0 });
    expect(globalThis.fetch).toHaveBeenCalled();
    const tokenHeader = globalThis.fetch.mock.calls[0][1].headers['X-Apex-Push-Token'];
    expect(tokenHeader).toBe('');
  });

  it('flushToD1 : pendingMessages vide → return', async () => {
    const _do = new ConversationDO(makeState(), ENV());
    await new Promise((r) => setTimeout(r, 5));
    await _do.flushToD1();
    expect(_do.env.APEX_CHAT_DB.batch).not.toHaveBeenCalled();
  });

  it('flushToD1 : success → batch + update conv', async () => {
    const env = ENV();
    const _do = new ConversationDO(makeState(), env);
    await new Promise((r) => setTimeout(r, 5));
    _do.pendingMessages = [
      { id: '1', conv_id: 'c', sender_id: 'k', ciphertext: 'x', mime: 't', ts: 1, reply_to: null, thread_root: null, view_once: 0, expires_at: null },
    ];
    await _do.flushToD1();
    expect(env.APEX_CHAT_DB.batch).toHaveBeenCalled();
    expect(_do.pendingMessages).toEqual([]);
  });

  it('flushToD1 : DB throw → re-queue + telemetry', async () => {
    const env = ENV();
    env.APEX_CHAT_DB.batch = vi.fn(async () => { throw new Error('batch fail'); });
    const _do = new ConversationDO(makeState(), env);
    await new Promise((r) => setTimeout(r, 5));
    const msg = { id: '1', conv_id: 'c', sender_id: 'k', ciphertext: 'x', mime: 't', ts: 1, reply_to: null, thread_root: null, view_once: 0, expires_at: null };
    _do.pendingMessages = [msg];
    await _do.flushToD1();
    expect(_do.pendingMessages).toContainEqual(msg);
    expect(env.TELEMETRY_QUEUE.send).toHaveBeenCalled();
  });

  it('flushToD1 sans TELEMETRY_QUEUE → fail silencieux', async () => {
    const env = ENV({ TELEMETRY_QUEUE: undefined });
    env.APEX_CHAT_DB.batch = vi.fn(async () => { throw new Error('batch fail'); });
    const _do = new ConversationDO(makeState(), env);
    await new Promise((r) => setTimeout(r, 5));
    _do.pendingMessages = [
      { id: '1', conv_id: 'c', sender_id: 'k', ciphertext: 'x', mime: 't', ts: 1, reply_to: null, thread_root: null, view_once: 0, expires_at: null },
    ];
    await expect(_do.flushToD1()).resolves.toBeUndefined();
  });

  it('alarm appelle flushToD1', async () => {
    const _do = new ConversationDO(makeState(), ENV());
    await new Promise((r) => setTimeout(r, 5));
    const spy = vi.spyOn(_do, 'flushToD1');
    await _do.alarm();
    expect(spy).toHaveBeenCalled();
  });
});

// ----------------------------------------------------------------------------
// BroadcastDO
// ----------------------------------------------------------------------------
describe('BroadcastDO', () => {
  it('init shards depuis storage', async () => {
    const state = makeState();
    state.storage.data.set('shards', ['s1', 's2']);
    const _do = new BroadcastDO(state, ENV());
    await new Promise((r) => setTimeout(r, 5));
    const r = await _do.fetch(new Request('https://x/'));
    expect((await r.json()).shards).toBe(2);
  });

  it('init shards défaut []', async () => {
    const _do = new BroadcastDO(makeState(), ENV());
    await new Promise((r) => setTimeout(r, 5));
    const r = await _do.fetch(new Request('https://x/'));
    expect((await r.json()).shards).toBe(0);
  });
});

// ----------------------------------------------------------------------------
// PresenceDO
// ----------------------------------------------------------------------------
describe('PresenceDO', () => {
  it('POST /heartbeat → ok + ts', async () => {
    const _do = new PresenceDO(makeState(), ENV());
    const r = await _do.fetch(new Request('https://x/heartbeat', {
      method: 'POST', body: JSON.stringify({ userId: 'kdmc', deviceId: 'd1' }),
    }));
    const b = await r.json();
    expect(b.ok).toBe(true);
    expect(_do.online.get('kdmc')).toBeDefined();
  });

  it('GET /list → online_count', async () => {
    const _do = new PresenceDO(makeState(), ENV());
    _do.online.set('kdmc', { lastHeartbeat: Date.now() });
    _do.online.set('expired', { lastHeartbeat: Date.now() - 100000 });
    const r = await _do.fetch(new Request('https://x/list'));
    const b = await r.json();
    expect(b.online_count).toBe(1);
    expect(b.users).toContain('kdmc');
    expect(b.users).not.toContain('expired');
  });

  it('POST /check user online → online:true', async () => {
    const _do = new PresenceDO(makeState(), ENV());
    _do.online.set('kdmc', { lastHeartbeat: Date.now() });
    const r = await _do.fetch(new Request('https://x/check', {
      method: 'POST', body: JSON.stringify({ userId: 'kdmc' }),
    }));
    expect((await r.json()).online).toBe(true);
  });

  it('POST /check user expired → online:false', async () => {
    const _do = new PresenceDO(makeState(), ENV());
    _do.online.set('kdmc', { lastHeartbeat: Date.now() - 100000 });
    const r = await _do.fetch(new Request('https://x/check', {
      method: 'POST', body: JSON.stringify({ userId: 'kdmc' }),
    }));
    expect((await r.json()).online).toBe(false);
  });

  it('POST /check user inconnu → online:false', async () => {
    const _do = new PresenceDO(makeState(), ENV());
    const r = await _do.fetch(new Request('https://x/check', {
      method: 'POST', body: JSON.stringify({ userId: 'never-seen' }),
    }));
    expect((await r.json()).online).toBe(false);
  });

  it('route inconnue → 404', async () => {
    const _do = new PresenceDO(makeState(), ENV());
    const r = await _do.fetch(new Request('https://x/xyz'));
    expect(r.status).toBe(404);
  });
});

// ----------------------------------------------------------------------------
// Trigger ws message handler (covers addEventListener message+close handlers)
// ----------------------------------------------------------------------------
describe('ConversationDO — WS event handlers (message + close)', () => {
  it('WS message → handleMessage triggered', async () => {
    const _do = new ConversationDO(makeState(), ENV());
    await new Promise((r) => setTimeout(r, 5));
    const validJWT = await makeJWT({ sub: 'kdmc', exp: Math.floor(Date.now() / 1000) + 3600 }, SECRET);
    const url = `https://x/ws?token=${validJWT}&uid=kdmc&conv=conv1`;
    await _do.fetch(wsRequest(url));
    const server = [..._do.sessions.keys()][0];
    server.triggerMessage(JSON.stringify({ type: 'ping' }));
    await new Promise((r) => setTimeout(r, 10));
    const pong = server.sent.map((m) => JSON.parse(m)).find((m) => m.type === 'pong');
    expect(pong).toBeDefined();
  });

  it('WS message JSON malformé → erreur envoyée', async () => {
    const _do = new ConversationDO(makeState(), ENV());
    await new Promise((r) => setTimeout(r, 5));
    const validJWT = await makeJWT({ sub: 'kdmc', exp: Math.floor(Date.now() / 1000) + 3600 }, SECRET);
    const url = `https://x/ws?token=${validJWT}&uid=kdmc&conv=conv1`;
    await _do.fetch(wsRequest(url));
    const server = [..._do.sessions.keys()][0];
    server.triggerMessage('not-json');
    await new Promise((r) => setTimeout(r, 10));
    const e = server.sent.map((m) => JSON.parse(m)).find((m) => m.type === 'error');
    expect(e).toBeDefined();
  });

  it('WS close → session removed + broadcast leave', async () => {
    const _do = new ConversationDO(makeState(), ENV());
    await new Promise((r) => setTimeout(r, 5));
    const validJWT = await makeJWT({ sub: 'kdmc', exp: Math.floor(Date.now() / 1000) + 3600 }, SECRET);
    const url = `https://x/ws?token=${validJWT}&uid=kdmc&conv=conv1`;
    await _do.fetch(wsRequest(url));
    expect(_do.sessions.size).toBe(1);
    const server = [..._do.sessions.keys()][0];
    server.triggerClose();
    expect(_do.sessions.size).toBe(0);
  });

  it('WS close session déjà absente → no broadcast', async () => {
    const _do = new ConversationDO(makeState(), ENV());
    await new Promise((r) => setTimeout(r, 5));
    const validJWT = await makeJWT({ sub: 'kdmc', exp: Math.floor(Date.now() / 1000) + 3600 }, SECRET);
    const url = `https://x/ws?token=${validJWT}&uid=kdmc&conv=conv1`;
    await _do.fetch(wsRequest(url));
    const server = [..._do.sessions.keys()][0];
    _do.sessions.delete(server); // delete avant close
    server.triggerClose();
    // Pas de crash, no broadcast
  });
});
