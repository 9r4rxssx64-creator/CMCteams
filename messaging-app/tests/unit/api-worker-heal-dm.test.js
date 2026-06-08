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
import worker, { autoHealPerson } from '../../workers/api-worker.js';
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
      if (sql.includes('SELECT * FROM users WHERE id=?')) {
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
      // candidats auto-heal (même fin de numéro OU placeholder)
      if (sql.includes('phone LIKE') && sql.includes('WHERE id != ?')) {
        const [kid, tail] = this._args;
        const res = state.users.filter(u => u.id !== kid && u.status !== 'deleted' && !u.is_admin &&
          ((tail && String(u.phone || '').replace(/\D/g, '').slice(-8) === tail) || u.source === 'core_pair'));
        return { results: res };
      }
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
      // DM d'un user (+ nb messages) — variantes avec/sans espaces
      if ((sql.includes("c.type = 'dm'") || sql.includes("c.type='dm'")) && sql.includes('m.user_id')) {
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
      if (sql.includes('INSERT OR IGNORE INTO conversation_members') && sql.includes('SELECT ?, user_id')) {
        // re-point des membres d'une conv dup → conv gardée
        const [keepConv, dupConv] = this._args;
        for (const m of state.members.filter(x => x.conv_id === dupConv)) {
          if (!state.members.some(x => x.conv_id === keepConv && x.user_id === m.user_id)) {
            state.members.push({ conv_id: keepConv, user_id: m.user_id, role: m.role });
          }
        }
        return { success: true, meta: { changes: 1 } };
      }
      if (sql.includes('INSERT OR IGNORE INTO conversation_members') && sql.includes('SELECT conv_id')) {
        // re-point memberships d'un compte dup → peer (sans doublon de PK)
        const [peerId, dupId] = this._args;
        for (const m of state.members.filter(x => x.user_id === dupId)) {
          if (!state.members.some(x => x.conv_id === m.conv_id && x.user_id === peerId)) {
            state.members.push({ conv_id: m.conv_id, user_id: peerId, role: m.role });
          }
        }
        return { success: true, meta: { changes: 1 } };
      }
      if (sql.includes('INSERT OR IGNORE INTO conversation_members')) {
        const [conv_id, user_id, role] = this._args;
        if (!state.members.some(m => m.conv_id === conv_id && m.user_id === user_id)) {
          state.members.push({ conv_id, user_id, role });
        }
        return { success: true, meta: { changes: 1 } };
      }
      if (sql.includes('UPDATE messages SET sender_id=?')) {
        const [to, from] = this._args;
        let n = 0;
        for (const m of state.messages) if (m.sender_id === from) { m.sender_id = to; n++; }
        return { success: true, meta: { changes: n } };
      }
      if (sql.includes('DELETE FROM conversation_members WHERE user_id=?')) {
        const id = this._args[0];
        state.members = state.members.filter(m => m.user_id !== id);
        return { success: true, meta: { changes: 1 } };
      }
      if (sql.includes("UPDATE users SET status='deleted'")) {
        const id = this._args[1];
        const u = state.users.find(x => x.id === id); if (u) u.status = 'deleted';
        return { success: true, meta: { changes: 1 } };
      }
      if (sql.includes('UPDATE users SET') && sql.includes('WHERE id=?')) {
        // UPDATE users SET a=?, b=? WHERE id=? — applique les champs au compte gardé
        const m = sql.match(/SET (.+) WHERE id=\?/s);
        const fields = m ? m[1].split(',').map(s => s.trim().replace(/=\?$/, '')) : [];
        const id = this._args[this._args.length - 1];
        const u = state.users.find(x => x.id === id);
        if (u) fields.forEach((f, i) => { u[f] = this._args[i]; });
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
      { id: 'kevin', pseudo: 'kevin', real_name: 'Kevin DESARZENS', phone: '+33111', source: 'core_pair', is_admin: 1, last_seen: now, status: 'active' },
      { id: 'laur_real', pseudo: 'laurence', real_name: 'Laurence SAINT-POLIT', phone: '+33222', source: 'apex-chat-direct', is_admin: 0, last_seen: now, status: 'active' },
      { id: 'laurence_saint_polit', pseudo: 'lolo', real_name: 'Laurence SAINT-POLIT', phone: '+33999', source: 'core_pair', is_admin: 0, last_seen: now - 99999, status: 'active' },
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

  it('groupe auto 3 comptes Laurence en 1 (garde le vrai, soft-delete les autres)', async () => {
    const st = baseState();
    // 3e compte Laurence en double (autre numéro / inscription OTP séparée)
    st.users.push({ id: 'laur_dup2', pseudo: 'laurence2', real_name: 'Laurence SAINT-POLIT', phone: '+33333', source: 'apex-chat-direct', is_admin: 0, last_seen: Date.now() - 5000, status: 'active', last_geo_label: 'Monaco', last_device_label: 'iPhone' });
    // DM actif avec le placeholder, + messages envoyés par les comptes en double
    st.conversations.push({ id: 'cPh', type: 'dm', created_at: 1, archived_at: null });
    st.members.push({ conv_id: 'cPh', user_id: 'kevin' }, { conv_id: 'cPh', user_id: 'laurence_saint_polit' });
    st.messages.push({ conv_id: 'cPh', ts: 10, sender_id: 'laurence_saint_polit' }, { conv_id: 'cPh', ts: 11, sender_id: 'laur_dup2' });
    const env = ENV({ APEX_CHAT_DB: statefulDB(st) });

    // dry_run : voit les 3 comptes (1 gardé, 2 retirés)
    const dry = await call(env, { peer_query: 'laurence' });
    expect(dry.accounts.keep.id).toBe('laur_real');
    expect(dry.accounts.remove.map(r => r.id).sort()).toEqual(['laur_dup2', 'laurence_saint_polit'].sort());

    // apply : fusionne les comptes
    const r = await call(env, { peer_query: 'laurence', apply: true });
    expect(r.ok).toBe(true);
    // messages des doublons ré-attribués au vrai compte
    expect(st.messages.every(m => m.sender_id === 'laur_real')).toBe(true);
    // doublons soft-deleted (réversible), le vrai compte reste actif
    expect(st.users.find(u => u.id === 'laurence_saint_polit').status).toBe('deleted');
    expect(st.users.find(u => u.id === 'laur_dup2').status).toBe('deleted');
    expect(st.users.find(u => u.id === 'laur_real').status).toBe('active');
    // jamais le compte admin (Kevin)
    expect(st.users.find(u => u.id === 'kevin').status).toBe('active');
    // les infos (localisation, device) sont GROUPÉES sur le compte gardé
    const kept = st.users.find(u => u.id === 'laur_real');
    expect(kept.last_geo_label).toBe('Monaco');
    expect(kept.last_device_label).toBe('iPhone');
  });

  it('AUTO au login : groupe seul même numéro (format différent) + placeholder', async () => {
    const st = baseState();
    // doublon = MÊME numéro que laur_real (+33222) mais format national « 0622... »
    st.users.push({ id: 'laur_nat', pseudo: 'lau', real_name: 'Laurence SAINT-POLIT', phone: '0622', source: 'apex-chat-direct', is_admin: 0, last_seen: Date.now() - 1000, status: 'active' });
    // place laur_real avec un numéro dont la fin matche « 0622 » → on aligne les fins
    st.users.find(u => u.id === 'laur_real').phone = '+33600000622';
    st.users.find(u => u.id === 'laur_nat').phone = '0600000622';     // même fin 00000622
    // un DM placeholder (côté Kevin) + un message du doublon
    st.conversations.push({ id: 'cPh', type: 'dm', created_at: 1, archived_at: null });
    st.members.push({ conv_id: 'cPh', user_id: 'kevin' }, { conv_id: 'cPh', user_id: 'laurence_saint_polit' });
    st.messages.push({ conv_id: 'cPh', ts: 9, sender_id: 'laurence_saint_polit' }, { conv_id: 'cPh', ts: 10, sender_id: 'laur_nat' });
    const env = ENV({ APEX_CHAT_DB: statefulDB(st) });

    // Laurence se connecte (son vrai compte) → réparation AUTO, zéro clic
    const summary = await autoHealPerson(env, st.users.find(u => u.id === 'laur_real'));
    expect(summary.merged).toBeGreaterThanOrEqual(2);   // le national + le placeholder
    // doublons soft-deleted, vrai compte gardé
    expect(st.users.find(u => u.id === 'laur_nat').status).toBe('deleted');
    expect(st.users.find(u => u.id === 'laurence_saint_polit').status).toBe('deleted');
    expect(st.users.find(u => u.id === 'laur_real').status).toBe('active');
    // messages ré-attribués au vrai compte + le placeholder (membre du DM de Kevin)
    // est remplacé par le vrai compte → Kevin parlera au bon compte
    expect(st.messages.every(m => m.sender_id === 'laur_real')).toBe(true);
    expect(st.members.some(m => m.conv_id === 'cPh' && m.user_id === 'laur_real')).toBe(true);
  });

  it('signale l\'absence de DM serveur', async () => {
    const env = ENV({ APEX_CHAT_DB: statefulDB(baseState()) });
    const r = await call(env, { peer_user_id: 'laur_real' });
    expect(r.ok).toBe(true);
    expect(r.cause).toBe('no_dm');
  });
});
