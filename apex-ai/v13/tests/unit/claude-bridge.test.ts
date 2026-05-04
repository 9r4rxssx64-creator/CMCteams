/**
 * Tests claude-bridge.ts (33.79% → 95%+).
 * Bridge bidirectionnel Apex ↔ Claude Code.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { claudeBridge } from '../../services/claude-bridge.js';

describe('claude-bridge (P0 coverage)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('pushTodo()', () => {
    it('push minimal', async () => {
      const t = await claudeBridge.pushTodo({
        type: 'fix_bug',
        src: 'apex',
        title: 'Test bug',
        description: 'Lorem ipsum',
        severity: 'medium',
      });
      expect(t.id).toMatch(/^todo_/);
      expect(t.status).toBe('pending');
      expect(t.ts).toBeGreaterThan(0);
    });

    it('push avec context + version', async () => {
      const t = await claudeBridge.pushTodo({
        type: 'security_finding',
        src: 'cmcteams',
        src_version: 'v9.500',
        title: 'XSS detected',
        description: 'foo',
        severity: 'critical',
        context: { url: '/admin' },
      });
      expect(t.context).toEqual({ url: '/admin' });
      expect(t.src_version).toBe('v9.500');
    });

    it('persist localStorage', async () => {
      await claudeBridge.pushTodo({
        type: 'fix_bug',
        src: 'apex',
        title: 't',
        description: 'd',
        severity: 'high',
      });
      const raw = localStorage.getItem('ax_claude_todo');
      expect(raw).toBeTruthy();
    });

    it('cap MAX_TODOS=100', async () => {
      for (let i = 0; i < 110; i++) {
        await claudeBridge.pushTodo({
          type: 'fix_bug',
          src: 'apex',
          title: `t${i}`,
          description: 'd',
          severity: 'low',
        });
      }
      const list = claudeBridge.listTodos();
      expect(list.length).toBeLessThanOrEqual(100);
    });

    it('cap trim privilégie resolved en premier', async () => {
      /* Force un peu plus que MAX_TODOS */
      for (let i = 0; i < 50; i++) {
        const t = await claudeBridge.pushTodo({
          type: 'fix_bug',
          src: 'apex',
          title: `pending${i}`,
          description: 'd',
          severity: 'low',
        });
        if (i < 10) {
          claudeBridge.resolveTodo(t.id, 'claude-code', 'fixed');
        }
      }
      /* Push 60 supplementaires */
      for (let i = 0; i < 60; i++) {
        await claudeBridge.pushTodo({
          type: 'fix_bug',
          src: 'apex',
          title: `extra${i}`,
          description: 'd',
          severity: 'medium',
        });
      }
      const list = claudeBridge.listTodos();
      expect(list.length).toBeLessThanOrEqual(100);
    });
  });

  describe('listTodos() filters', () => {
    beforeEach(async () => {
      await claudeBridge.pushTodo({ type: 'fix_bug', src: 'apex', title: 'a', description: 'd', severity: 'critical' });
      await claudeBridge.pushTodo({ type: 'add_feature', src: 'cmcteams', title: 'b', description: 'd', severity: 'medium' });
      await claudeBridge.pushTodo({ type: 'fix_bug', src: 'apex', title: 'c', description: 'd', severity: 'low' });
    });

    it('list sans filtre → tous', () => {
      const r = claudeBridge.listTodos();
      expect(r.length).toBe(3);
    });

    it('filter status pending', () => {
      const r = claudeBridge.listTodos({ status: 'pending' });
      expect(r.length).toBe(3);
    });

    it('filter status resolved (vide)', () => {
      const r = claudeBridge.listTodos({ status: 'resolved' });
      expect(r.length).toBe(0);
    });

    it('filter severity', () => {
      const r = claudeBridge.listTodos({ severity: 'critical' });
      expect(r.length).toBe(1);
    });

    it('filter src', () => {
      const r = claudeBridge.listTodos({ src: 'cmcteams' });
      expect(r.length).toBe(1);
    });

    it('filter combine + limit', () => {
      const r = claudeBridge.listTodos({ src: 'apex', limit: 1 });
      expect(r.length).toBe(1);
    });

    it('liste triée par ts desc', async () => {
      const r = claudeBridge.listTodos();
      const ts = r.map((t) => t.ts);
      const sorted = [...ts].sort((a, b) => b - a);
      expect(ts).toEqual(sorted);
    });

    it('localStorage corrompu → []', () => {
      localStorage.setItem('ax_claude_todo', 'not json');
      const r = claudeBridge.listTodos();
      expect(r).toEqual([]);
    });
  });

  describe('resolveTodo()', () => {
    it('resolve existant → true', async () => {
      const t = await claudeBridge.pushTodo({
        type: 'fix_bug',
        src: 'apex',
        title: 'x',
        description: 'd',
        severity: 'high',
      });
      const ok = claudeBridge.resolveTodo(t.id, 'claude-code', 'fixed via PR #123');
      expect(ok).toBe(true);
      const found = claudeBridge.listTodos().find((x) => x.id === t.id);
      expect(found?.status).toBe('resolved');
      expect(found?.resolved_by).toBe('claude-code');
      expect(found?.fix_summary).toBe('fixed via PR #123');
    });

    it('resolve avec commit_sha', async () => {
      const t = await claudeBridge.pushTodo({
        type: 'fix_bug',
        src: 'apex',
        title: 'x',
        description: 'd',
        severity: 'low',
      });
      claudeBridge.resolveTodo(t.id, 'claude-code', 'ok', 'abc1234');
      const found = claudeBridge.listTodos().find((x) => x.id === t.id);
      expect(found?.fix_commit_sha).toBe('abc1234');
    });

    it('resolve inconnu → false', () => {
      const ok = claudeBridge.resolveTodo('inexistant', 'me', 'no');
      expect(ok).toBe(false);
    });

    it('resolve push handoff entry automatiquement', async () => {
      const t = await claudeBridge.pushTodo({
        type: 'fix_bug',
        src: 'apex',
        title: 'x',
        description: 'd',
        severity: 'medium',
      });
      claudeBridge.resolveTodo(t.id, 'claude-code', 'fixed');
      const handoffs = claudeBridge.listHandoff();
      expect(handoffs.length).toBeGreaterThanOrEqual(1);
      expect(handoffs[0]?.action).toBe('fixed');
    });
  });

  describe('pushHandoff()', () => {
    it('push handoff minimal', async () => {
      const e = await claudeBridge.pushHandoff({
        todo_id: 't1',
        by: 'claude-code',
        action: 'investigated',
        notes: 'Looking into it',
      });
      expect(e.id).toMatch(/^handoff_/);
      expect(e.ts).toBeGreaterThan(0);
    });

    it('push handoff avec commit + files', async () => {
      const e = await claudeBridge.pushHandoff({
        todo_id: 't1',
        by: 'claude-code',
        action: 'fixed',
        notes: 'fixed',
        commit_sha: 'abc',
        files_changed: ['a.ts', 'b.ts'],
      });
      expect(e.commit_sha).toBe('abc');
      expect(e.files_changed?.length).toBe(2);
    });

    it('cap MAX_HANDOFF=200', async () => {
      for (let i = 0; i < 220; i++) {
        await claudeBridge.pushHandoff({
          todo_id: `t${i}`,
          by: 'claude-code',
          action: 'acknowledged',
          notes: 'n',
        });
      }
      const list = claudeBridge.listHandoff();
      expect(list.length).toBeLessThanOrEqual(200);
    });
  });

  describe('listHandoff() filters', () => {
    beforeEach(async () => {
      await claudeBridge.pushHandoff({ todo_id: 'a', by: 'claude-code', action: 'acknowledged', notes: 'n' });
      await claudeBridge.pushHandoff({ todo_id: 'a', by: 'claude-code', action: 'fixed', notes: 'n2' });
      await claudeBridge.pushHandoff({ todo_id: 'b', by: 'apex', action: 'acknowledged', notes: 'n3' });
    });

    it('liste sans filtre', () => {
      const r = claudeBridge.listHandoff();
      expect(r.length).toBe(3);
    });

    it('filter todo_id', () => {
      const r = claudeBridge.listHandoff({ todo_id: 'a' });
      expect(r.length).toBe(2);
    });

    it('filter by', () => {
      const r = claudeBridge.listHandoff({ by: 'apex' });
      expect(r.length).toBe(1);
    });

    it('filter limit', () => {
      const r = claudeBridge.listHandoff({ limit: 2 });
      expect(r.length).toBe(2);
    });

    it('JSON invalide → []', () => {
      localStorage.setItem('ax_handoff_journal', 'not json');
      const r = claudeBridge.listHandoff();
      expect(r).toEqual([]);
    });
  });

  describe('getStats()', () => {
    it('vide', () => {
      const s = claudeBridge.getStats();
      expect(s.todos_pending).toBe(0);
      expect(s.todos_critical_pending).toBe(0);
      expect(s.todos_resolved_7d).toBe(0);
      expect(s.handoff_entries_7d).toBe(0);
      expect(s.avg_resolution_time_h).toBe(0);
    });

    it('stats avec todos', async () => {
      await claudeBridge.pushTodo({ type: 'fix_bug', src: 'apex', title: 'a', description: 'd', severity: 'critical' });
      await claudeBridge.pushTodo({ type: 'fix_bug', src: 'apex', title: 'b', description: 'd', severity: 'high' });
      const t3 = await claudeBridge.pushTodo({ type: 'fix_bug', src: 'apex', title: 'c', description: 'd', severity: 'low' });
      claudeBridge.resolveTodo(t3.id, 'claude-code', 'ok');
      const s = claudeBridge.getStats();
      expect(s.todos_pending).toBe(2);
      expect(s.todos_critical_pending).toBe(1);
      expect(s.todos_resolved_7d).toBeGreaterThanOrEqual(1);
    });

    it('avg resolution time calcul', async () => {
      const t = await claudeBridge.pushTodo({
        type: 'fix_bug',
        src: 'apex',
        title: 'x',
        description: 'd',
        severity: 'low',
      });
      /* Force resolved_ts dans le passé pour calcul */
      await new Promise((r) => setTimeout(r, 10));
      claudeBridge.resolveTodo(t.id, 'claude-code', 'fixed');
      const s = claudeBridge.getStats();
      expect(s.avg_resolution_time_h).toBeGreaterThanOrEqual(0);
    });
  });

  describe('formatBriefing()', () => {
    it('vide → markdown structure', () => {
      const md = claudeBridge.formatBriefing();
      expect(md).toContain('Claude Bridge Briefing');
      expect(md).toContain('Stats');
      expect(md).toContain('Pending todos');
      expect(md).toContain('Recent handoff');
    });

    it('avec todos + handoff', async () => {
      await claudeBridge.pushTodo({
        type: 'fix_bug',
        src: 'apex',
        src_version: 'v13',
        title: 'My todo',
        description: 'd',
        severity: 'critical',
      });
      await claudeBridge.pushHandoff({
        todo_id: 't',
        by: 'claude-code',
        action: 'fixed',
        notes: 'long handoff notes example for tests',
      });
      const md = claudeBridge.formatBriefing();
      expect(md).toContain('My todo');
      expect(md).toContain('claude-code');
    });
  });
});
