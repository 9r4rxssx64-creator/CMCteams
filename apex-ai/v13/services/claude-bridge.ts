/**
 * APEX v13 — Claude Bridge (relais bidirectionnel Apex ↔ Claude Code).
 *
 * Demande Kevin 2026-05-04 : "Bridge API vers Claude conversationnel"
 *
 * Architecture concertation bidirectionnelle (CLAUDE.md règle permanente) :
 *
 * APEX → Claude Code (escalade) :
 * - ax_claude_todo Firebase RTDB array
 * - GitHub Action cron 2h poll → ouvre issue si critical pending > 30min
 * - Prochaine session Claude Code lit todos → fix → ax_handoff_journal
 *
 * Claude Code → APEX (réponse) :
 * - ax_handoff_journal Firebase RTDB array (réponses Claude Code)
 * - Apex SSE listener applique les fixes/réponses
 * - Affiche dans vClaudeHandoff admin
 *
 * Cross-app (CMCteams, KDMC, etc.) :
 * - Tous projets partagent ax_claude_todo + ax_handoff_journal via FB_FIX
 * - Apex orchestre comme central
 */

import { logger } from '../core/logger.js';

import { auditLog } from './audit-log.js';

export type TodoType =
  | 'self_audit_escalation'
  | 'add_credential_pattern'
  | 'fix_bug'
  | 'add_feature'
  | 'investigate'
  | 'add_test'
  | 'security_finding'
  | 'performance_issue'
  | 'ux_improvement';

export type TodoStatus = 'pending' | 'in_progress' | 'resolved' | 'wontfix';

export interface ClaudeTodo {
  id: string;
  type: TodoType;
  src: string; /* 'apex' | 'cmcteams' | 'kdmc' | etc. */
  src_version?: string;
  title: string;
  description: string;
  context?: Record<string, unknown>;
  severity: 'critical' | 'high' | 'medium' | 'low';
  ts: number;
  status: TodoStatus;
  resolved_ts?: number;
  resolved_by?: string;
  fix_summary?: string;
  fix_commit_sha?: string;
}

export interface HandoffEntry {
  id: string;
  todo_id: string;
  ts: number;
  by: string; /* 'claude-code' | 'apex' | ... */
  action: 'acknowledged' | 'investigated' | 'fixed' | 'wontfix' | 'needs_input';
  notes: string;
  commit_sha?: string;
  files_changed?: string[];
}

const TODO_KEY = 'ax_claude_todo';
const HANDOFF_KEY = 'ax_handoff_journal';
const MAX_TODOS = 100;
const MAX_HANDOFF = 200;

class ClaudeBridge {
  /**
   * Apex → Claude Code : push une todo.
   */
  async pushTodo(todo: Omit<ClaudeTodo, 'id' | 'ts' | 'status'>): Promise<ClaudeTodo> {
    const newTodo: ClaudeTodo = {
      id: `todo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      ts: Date.now(),
      status: 'pending',
      ...todo,
    };
    const todos = this.listTodos();
    todos.push(newTodo);
    if (todos.length > MAX_TODOS) {
      /* Trim resolved oldest first */
      todos.sort((a, b) => {
        if (a.status === 'resolved' && b.status !== 'resolved') return -1;
        if (b.status === 'resolved' && a.status !== 'resolved') return 1;
        return a.ts - b.ts;
      });
      todos.splice(0, todos.length - MAX_TODOS);
    }
    try {
      localStorage.setItem(TODO_KEY, JSON.stringify(todos));
    } catch (err: unknown) {
      logger.warn('claude-bridge', 'pushTodo persist failed', { err });
    }
    void auditLog.record('claude_bridge.todo_pushed', {
      details: { id: newTodo.id, type: newTodo.type, severity: newTodo.severity },
    });
    logger.info('claude-bridge', `Todo pushed ${newTodo.id} (${newTodo.severity}): ${newTodo.title}`);
    return newTodo;
  }

  /**
   * Liste todos avec filtres.
   */
  listTodos(filters?: { status?: TodoStatus; severity?: ClaudeTodo['severity']; src?: string; limit?: number }): ClaudeTodo[] {
    try {
      let todos = JSON.parse(localStorage.getItem(TODO_KEY) ?? '[]') as ClaudeTodo[];
      if (filters?.status) todos = todos.filter((t) => t.status === filters.status);
      if (filters?.severity) todos = todos.filter((t) => t.severity === filters.severity);
      if (filters?.src) todos = todos.filter((t) => t.src === filters.src);
      todos.sort((a, b) => b.ts - a.ts);
      if (filters?.limit) todos = todos.slice(0, filters.limit);
      return todos;
    } catch {
      return [];
    }
  }

  /**
   * Marquer todo résolu (appelé par Claude Code après fix).
   */
  resolveTodo(todoId: string, resolvedBy: string, fixSummary: string, commitSha?: string): boolean {
    const todos = this.listTodos();
    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return false;
    todo.status = 'resolved';
    todo.resolved_ts = Date.now();
    todo.resolved_by = resolvedBy;
    todo.fix_summary = fixSummary;
    if (commitSha) todo.fix_commit_sha = commitSha;
    try {
      localStorage.setItem(TODO_KEY, JSON.stringify(todos));
    } catch (err: unknown) {
      logger.warn('claude-bridge', 'resolveTodo persist failed', { err });
    }
    void this.pushHandoff({
      todo_id: todoId,
      by: resolvedBy,
      action: 'fixed',
      notes: fixSummary,
      ...(commitSha && { commit_sha: commitSha }),
    });
    return true;
  }

  /**
   * Claude Code → Apex : push handoff entry (réponse/log).
   */
  async pushHandoff(entry: Omit<HandoffEntry, 'id' | 'ts'>): Promise<HandoffEntry> {
    const newEntry: HandoffEntry = {
      id: `handoff_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      ts: Date.now(),
      ...entry,
    };
    const journal = this.listHandoff();
    journal.push(newEntry);
    if (journal.length > MAX_HANDOFF) {
      journal.splice(0, journal.length - MAX_HANDOFF);
    }
    try {
      localStorage.setItem(HANDOFF_KEY, JSON.stringify(journal));
    } catch (err: unknown) {
      logger.warn('claude-bridge', 'pushHandoff persist failed', { err });
    }
    void auditLog.record('claude_bridge.handoff_pushed', {
      details: { id: newEntry.id, by: newEntry.by, action: newEntry.action },
    });
    return newEntry;
  }

  /**
   * Liste handoff entries (admin journal).
   */
  listHandoff(filters?: { todo_id?: string; by?: string; limit?: number }): HandoffEntry[] {
    try {
      let journal = JSON.parse(localStorage.getItem(HANDOFF_KEY) ?? '[]') as HandoffEntry[];
      if (filters?.todo_id) journal = journal.filter((e) => e.todo_id === filters.todo_id);
      if (filters?.by) journal = journal.filter((e) => e.by === filters.by);
      journal.sort((a, b) => b.ts - a.ts);
      if (filters?.limit) journal = journal.slice(0, filters.limit);
      return journal;
    } catch {
      return [];
    }
  }

  /**
   * Stats : todos pending, resolved, escaladés cette semaine.
   */
  getStats(): {
    todos_pending: number;
    todos_critical_pending: number;
    todos_resolved_7d: number;
    handoff_entries_7d: number;
    avg_resolution_time_h: number;
  } {
    const todos = this.listTodos();
    const journal = this.listHandoff();
    const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const pendingTodos = todos.filter((t) => t.status === 'pending');
    const resolvedRecent = todos.filter((t) => t.status === 'resolved' && (t.resolved_ts ?? 0) >= sevenDaysAgo);
    const totalResolutionMs = resolvedRecent.reduce((acc, t) => acc + ((t.resolved_ts ?? 0) - t.ts), 0);
    return {
      todos_pending: pendingTodos.length,
      todos_critical_pending: pendingTodos.filter((t) => t.severity === 'critical').length,
      todos_resolved_7d: resolvedRecent.length,
      handoff_entries_7d: journal.filter((e) => e.ts >= sevenDaysAgo).length,
      avg_resolution_time_h: resolvedRecent.length > 0 ? Math.round(totalResolutionMs / resolvedRecent.length / 3600000 * 10) / 10 : 0,
    };
  }

  /**
   * Format markdown briefing pour Claude Code (next session reads).
   */
  formatBriefing(): string {
    const pending = this.listTodos({ status: 'pending', limit: 20 });
    const recentHandoff = this.listHandoff({ limit: 10 });
    const stats = this.getStats();
    const lines: string[] = [
      '# 🤝 Claude Bridge Briefing',
      '',
      '## Stats',
      `- Pending: ${stats.todos_pending} (critical: ${stats.todos_critical_pending})`,
      `- Resolved 7d: ${stats.todos_resolved_7d}`,
      `- Avg resolution: ${stats.avg_resolution_time_h}h`,
      '',
      '## Pending todos (top 20)',
    ];
    for (const t of pending) {
      lines.push(`- [${t.severity}][${t.type}] ${t.title} (${t.src} ${t.src_version ?? ''})`);
    }
    lines.push('');
    lines.push('## Recent handoff (10)');
    for (const e of recentHandoff) {
      lines.push(`- ${new Date(e.ts).toISOString().slice(0, 10)} ${e.by} → ${e.action}: ${e.notes.slice(0, 80)}`);
    }
    return lines.join('\n');
  }
}

export const claudeBridge = new ClaudeBridge();
