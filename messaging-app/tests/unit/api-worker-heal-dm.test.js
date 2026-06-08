/**
 * Tests api-worker.js — POST /api/admin/heal-dm (v1.1.176)
 *
 * Bug réparé : « les deux sont connectés mais aucun message ne passe » =
 * Kevin et le correspondant ne sont PAS dans le même convId (DM en double OU
 * DM pointant sur un placeholder au lieu du vrai compte OTP). Le WS étant par
 * conversation, chacun parle dans un Durable Object différent → silence total.
 *
 * On vérifie : diagnostic (cause exacte), dry_run sans mutation, puis apply
 * (additif/non destructif : ajoute membres, re-pointe messages, archive doublon).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import worker from '../../workers/api-worker.js';
import { ENV, makeRequest, makeJWT } from './api-worker-helpers.js';

beforeEach(() => {
  vi.restoreAllMocks();
  globalThis.fetch = vi.fn(async () => new Response('{"ok":true}'));
});

/** D1 stateful minimal couvrant les requêtes de handleHealDm. */
function statefulDB(state) {
  const stmt = (sql) => ({
    sql, _args: [],
    bind(...a) { this._args = a; return this; },
    async first() {
      // getAuthUser : user non banni
      if (sql.includes('SELECT last_force_logout_at')) {
        const u = state.users.find(x => x.id === this._args[0]);
        return u ? { last_force_logout_at: null, is_banned: 0, status: 'active' } : null;
      }
      if (sql.includes('SELECT id, pseudo, real_name, phone FROM users WHERE id=?')) {
        return state.users.find(x => x.id === this._args[0]) || null;
      }
      if (sql.includes('FROM users WHERE id=?') && sql.includes('source')) {
        return state.users.find(x => x.id === this._args[0]) || null;
      }
      if (sql.includes('FROM users WHERE phone=?')) {
        return state.users.find(x => x.phone === this._args[0]) || null;
      }
      if (sql.includes('COUNT(*) AS c FROM conversation_members')) {
        const c = state.members.filter(m => m.conv_id === this._args[0]).length;
        return { c };
      }
      if (sql.includes('MAX(ts) AS t FROM messages')) {
        const ts = state.messages.filter(m => m.conv_id === this._args[0]).map(m => m.ts);
        return { t: ts.length ? Math.max(...ts) : null };
      }
      return null;
    },
    async all() {
      // recherche peer par LIKE
      if (sql.includes('LOWER(pseudo) LIKE')) {
        const kevinId = this._args[0];
        const like = String(this._args[1] || '').replace(/%/g, '').toLowerCase();
        const res = state.users.filter(u =>
          u.id !== kevinId &&
          ((u.pseudo || '').toLowerCase().includes(like) || (u.real_name || '').toLowerCase().includes(like)))
          .sort((a, b) => (a.source === 'core_pair' ? 1 : 0) - (b.source === 'core_pair' ? 1 : 0)
            || (b.last_seen || 0) - (a.last_seen || 0));
        return { results: res };
      }
      // DM de Kevin (+ nb messages)
      if (sql.includes("WHERE c.type = 'dm'") && sql.includes('m.user_id = ?')) {
        const kevinId = this._args[0];
        const convIds = state.members.filter(m => m.user_id === kevinId).map(m => m.conv_id);
        const res = state.conversations
          .filter(c => c.type === 'dm' && convIds.includes(c.id))
          .map(c => ({
            id: c.id, archived_at: c.archived_at || null, created_at: c.created_at,
            msgs: state.messages.filter(m => m.conv_id === c.id).length,
          }));
        return { results: res };
      }
      // membres d'une conv
      if (sql.includes('SELECT user_id FROM conversation_members WHERE conv_id=?')) {
        return { results: state.members.filter(m => m.conv_id === this._args[0]).map(m => ({ user_id: m.user_id })) };
      }
      return { results: [] };
    },
    async run() {
      if (sql.includes('INSERT OR IGNORE INTO conversation_members')) {
        const [conv_id, user_id, role] = this._args;
        if (!state.members.some(m => m.conv_id === conv_id && m.user_id === user_id)) {
          state.members.push({ conv_id, user_id, role });
        }
        return { success: true, meta: { changes: 1 } };
      }
      if (sql.includes('UPDATE messages SET conv_id=?')) {
        const [to, from] = this._args;
        let n = 0;
        for (const m of state.messages) if (m.conv_id === from) { m.conv_id = to; n++; }
        return { success: true, meta: { changes: n } };
      }
      if (sql.includes('UPDATE conversations SET archived_at=? WHERE id=?')) {
        const [ts, id] = this._args;
        const c = state.conversations.find(x => x.id === id); if (c) c.archived_at = ts;
        return { success: true, meta: { changes: 1 } };
      }
      if (sql.includes('UPDATE conversations SET member_count=?')) {
        const id = this._args[2];
        const c = state.conversations.find(x => x.id === id); if (c) c.archived_at = null;
        return { success: true, meta: { changes: 1 } };
      }
      // auditLog & co. : no-op succès
      return { success: true, meta: { changes: 0 } };
    },
  });
  return { _state: state, prepare: vi.fn((sql) => stmt(sql)), batch: vi.fn(async () => ({ success: true })) };
}

function baseState() {
  const now = Date.now();
  return {
    users: [
      { id: 'kevin', pseudo: 'kevin', real_name: 'Kevin DESARZENS', phone: '+33111', source: 'core_pair', is_admin: 1, last_seen: now },
      { id: 'laur_real', pseudo: 'laurence', real_name: 'Laurence SAINT-POLIT', phone: '+33222', source: 'apex-chat-direct', is_admin: 0, last_seen: now },
      { id: 'laurence_saint_polit', pseudo: 'lolo', real_name: 'Laurence SAINT-POLIT', phone: '+33999', source: 'core_pair', is_admin: 0, last_seen: now - 99999 },
    ],
    conversations: [],
    members: [],
    messages: [],
  };
}

async function call(env, body) {
  const token = await makeJWT({ sub: 'kevin', is_admin: true, iat: Math.floor(Date.now() / 1000) });
  const req = makeRequest({ method: 'POST', path: '/api/admin/heal-dm', body, token });
  const res = await worker.fetch(req, env);
  return res.json();
}

describe('POST /api/admin/heal-dm', () => {
  it('refuse un non-admin (403)', async () => {
    const env = ENV({ APEX_CHAT_DB: statefulDB(baseState()) });
    const token = await makeJWT({ sub: 'laur_real', is_admin: false, iat: Math.floor(Date.now() / 1000) });
    const req = makeRequest({ method: 'POST', path: '/api/admin/heal-dm', body: {}, token });
    const res = await worker.fetch(req, env);
    expect(res.status).toBe(403);
  });

  it('diagnostique « correspondant pas membre » sans muter (dry_run)', async () => {
    const st = baseState();
    // 1 seul DM actif : Kevin + placeholder (le vrai compte de Laurence n'y est pas)
    st.conversations.push({ id: 'cPh', type: 'dm', created_at: 1, archived_at: null });
    st.members.push({ conv_id: 'cPh', user_id: 'kevin' }, { conv_id: 'cPh', user_id: 'laurence_saint_polit' });
    st.messages.push({ conv_id: 'cPh', ts: 10 }, { conv_id: 'cPh', ts: 20 });
    const env = ENV({ APEX_CHAT_DB: statefulDB(st) });

    const r = await call(env, { peer_query: 'laurence' }); // dry_run par défaut
    expect(r.ok).toBe(true);
    expect(r.dry_run).toBe(true);
    expect(r.peer.id).toBe('laur_real');           // a choisi le VRAI compte
    expect(r.cause).toBe('peer_not_member');
    expect(r.canonical_conv_id).toBe('cPh');
    expect(r.plan.some(p => p.action === 'add_member' && p.user === 'laur_real')).toBe(true);
    // aucune mutation en dry_run
    expect(st.members.some(m => m.conv_id === 'cPh' && m.user_id === 'laur_real')).toBe(false);
  });

  it('applique : ajoute le vrai correspondant comme membre', async () => {
    const st = baseState();
    st.conversations.push({ id: 'cPh', type: 'dm', created_at: 1, archived_at: null });
    st.members.push({ conv_id: 'cPh', user_id: 'kevin' }, { conv_id: 'cPh', user_id: 'laurence_saint_polit' });
    st.messages.push({ conv_id: 'cPh', ts: 10 });
    const env = ENV({ APEX_CHAT_DB: statefulDB(st) });

    const r = await call(env, { peer_query: 'laurence', apply: true });
    expect(r.ok).toBe(true);
    expect(r.apply).toBe(true);
    expect(st.members.some(m => m.conv_id === 'cPh' && m.user_id === 'laur_real')).toBe(true);
  });

  it('fusionne 2 DM en double dans la conversation la plus fournie', async () => {
    const st = baseState();
    // canonique : Kevin + vrai Laurence, 5 messages
    st.conversations.push({ id: 'cMain', type: 'dm', created_at: 1, archived_at: null });
    st.members.push({ conv_id: 'cMain', user_id: 'kevin' }, { conv_id: 'cMain', user_id: 'laur_real' });
    for (let i = 0; i < 5; i++) st.messages.push({ conv_id: 'cMain', ts: 100 + i });
    // doublon : Kevin + vrai Laurence aussi, 2 messages (créé en double)
    st.conversations.push({ id: 'cDup', type: 'dm', created_at: 2, archived_at: null });
    st.members.push({ conv_id: 'cDup', user_id: 'kevin' }, { conv_id: 'cDup', user_id: 'laur_real' });
    st.messages.push({ conv_id: 'cDup', ts: 200 }, { conv_id: 'cDup', ts: 201 });
    const env = ENV({ APEX_CHAT_DB: statefulDB(st) });

    const dry = await call(env, { peer_user_id: 'laur_real' });
    expect(dry.cause).toBe('duplicate_dm');
    expect(dry.canonical_conv_id).toBe('cMain');   // 5 > 2 messages

    const r = await call(env, { peer_user_id: 'laur_real', apply: true });
    expect(r.ok).toBe(true);
    // messages du doublon re-pointés vers la canonique
    expect(st.messages.filter(m => m.conv_id === 'cMain').length).toBe(7);
    expect(st.messages.filter(m => m.conv_id === 'cDup').length).toBe(0);
    // doublon archivé (non destructif)
    expect(st.conversations.find(c => c.id === 'cDup').archived_at).toBeTruthy();
  });

  it('signale l\'absence de DM serveur', async () => {
    const env = ENV({ APEX_CHAT_DB: statefulDB(baseState()) });
    const r = await call(env, { peer_user_id: 'laur_real' });
    expect(r.ok).toBe(true);
    expect(r.cause).toBe('no_dm');
  });
});
