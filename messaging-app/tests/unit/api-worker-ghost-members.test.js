/**
 * Tests api-worker.js — cleanupGhostMembers (v1.1.197)
 * Retire des conversations les membres supprimés/fusionnés (ex: vieux
 * user_laurence) tant qu'il reste ≥1 membre réel. Ne laisse jamais une conv
 * sans membre réel.
 */
import { describe, it, expect } from 'vitest';
import { cleanupGhostMembers } from '../../workers/api-worker.js';

function makeDB(state) {
  return {
    prepare(sql) {
      return {
        _a: [],
        bind(...a) { this._a = a; return this; },
        async first() {
          if (sql.includes('SELECT COUNT(*) AS c FROM conversation_members')) {
            const convId = this._a[0];
            const c = state.members.filter(m => {
              if (m.conv_id !== convId) return false;
              const u = state.users.find(x => x.id === m.user_id);
              return u && u.status !== 'deleted' && !u.merged_into;
            }).length;
            return { c };
          }
          return null;
        },
        async all() {
          if (sql.includes("u.status = 'deleted' OR u.merged_into IS NOT NULL")) {
            return {
              results: state.members.filter(m => {
                const u = state.users.find(x => x.id === m.user_id);
                return u && (u.status === 'deleted' || u.merged_into);
              }).map(m => ({ conv_id: m.conv_id, user_id: m.user_id })),
            };
          }
          return { results: [] };
        },
        async run() {
          if (sql.includes('DELETE FROM conversation_members WHERE conv_id=? AND user_id=?')) {
            const [conv, uid] = this._a;
            state.members = state.members.filter(m => !(m.conv_id === conv && m.user_id === uid));
          }
          return { success: true };
        },
      };
    },
  };
}

describe('cleanupGhostMembers (v1.1.197)', () => {
  it('retire le membre fusionné quand un membre réel reste', async () => {
    const state = {
      users: [
        { id: 'kdmc_admin', status: 'active', merged_into: null },
        { id: 'lolo', status: 'active', merged_into: null },
        { id: 'user_laurence', status: 'deleted', merged_into: 'lolo' }, // fantôme
      ],
      members: [
        { conv_id: 'c1', user_id: 'kdmc_admin' },
        { conv_id: 'c1', user_id: 'lolo' },
        { conv_id: 'c1', user_id: 'user_laurence' },
      ],
    };
    const removed = await cleanupGhostMembers(makeDB(state));
    expect(removed).toBe(1);
    expect(state.members.some(m => m.user_id === 'user_laurence')).toBe(false);
    expect(state.members.filter(m => m.conv_id === 'c1').length).toBe(2);
  });

  it('ne retire PAS le fantôme s\'il est le dernier membre (préserve la conv)', async () => {
    const state = {
      users: [{ id: 'ghost', status: 'deleted', merged_into: 'real' }, { id: 'real', status: 'active', merged_into: null }],
      members: [{ conv_id: 'solo', user_id: 'ghost' }], // seul membre = fantôme, 0 réel
    };
    const removed = await cleanupGhostMembers(makeDB(state));
    expect(removed).toBe(0);
    expect(state.members.length).toBe(1);
  });
});
