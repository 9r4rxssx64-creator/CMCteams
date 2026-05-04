/**
 * APEX v13 — Apex Execute (pont autonome IA → Claude Code via GitHub Actions).
 *
 * Demande Kevin 2026-05-04 :
 * "Apex doit pouvoir tout faire en autonomie totale. Mais Apex IA elle-même
 * reconnaît qu'elle ne peut pas exécuter code (juste générer plan).
 * Solution : pont autonome → quand Apex IA décide qu'il faut exécuter
 * quelque chose (modify file, run command, deploy, etc.), elle call
 * apex-execute qui pousse la tâche dans claude_todo + déclenche workflow
 * GitHub Actions qui utilise Claude Code Action pour vraiment exécuter."
 *
 * Architecture :
 * 1. Apex IA → requestExecution(task, params)
 * 2. Push payload dans ax_claude_todo (existant via claudeBridge)
 * 3. POST GitHub repository_dispatch event_type=apex-execute
 * 4. GitHub Actions workflow apex-execute.yml se déclenche
 * 5. Workflow Claude Code Action exécute vraiment + commit + push
 * 6. Apex polls résultat via GitHub Actions API + listPendingExecutions
 *
 * Sécurité (règle Kevin CLAUDE.md) :
 * - Whitelist stricte 8 tâches autorisées
 * - 4 tâches INTERDITES (delete_file, force_push, modify_user_credentials_external, send_external_email_without_consent)
 * - Audit log immutable avant + après
 * - PII redaction des params
 * - Rate-limit 50 exécutions / heure (anti-runaway)
 *
 * Anti-pattern Kevin : pas d'eval, pas de new Function, dispatch whitelist + token validation.
 */

import { logger } from '../core/logger.js';

import { auditLog } from './audit-log.js';
import { claudeBridge } from './claude-bridge.js';

/* === Types === */

/** Tâches autorisées (whitelist sécurité Kevin règle 1-clic + sécu avant autonomie). */
export type AllowedTask =
  | 'modify_file'
  | 'create_file'
  | 'run_test'
  | 'run_lint'
  | 'audit_repo'
  | 'deploy_canary'
  | 'backup_user_data'
  | 'restore_from_backup';

/** Tâches INTERDITES (règle Kevin "sécurité avant autonomie totale"). */
export type ForbiddenTask =
  | 'delete_file'
  | 'force_push'
  | 'modify_user_credentials_external'
  | 'send_external_email_without_consent';

const ALLOWED_TASKS: ReadonlySet<AllowedTask> = new Set<AllowedTask>([
  'modify_file',
  'create_file',
  'run_test',
  'run_lint',
  'audit_repo',
  'deploy_canary',
  'backup_user_data',
  'restore_from_backup',
]);

const FORBIDDEN_TASKS: ReadonlySet<string> = new Set<string>([
  'delete_file',
  'force_push',
  'modify_user_credentials_external',
  'send_external_email_without_consent',
]);

export type ExecutionStatus = 'pending' | 'dispatched' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';

export interface ExecutionParams {
  /** Pour modify_file/create_file : path relatif depuis racine repo */
  path?: string;
  /** Pour modify_file/create_file : contenu (utf-8 string) */
  content?: string;
  /** Pour modify_file : ancien contenu à remplacer (anti race) */
  old_content?: string;
  /** Pour run_test : commande test ou pattern */
  command?: string;
  /** Pour audit_repo : profondeur (shallow|deep|full) */
  depth?: 'shallow' | 'deep' | 'full';
  /** Pour deploy_canary : env cible (canary|staging|prod-readonly) */
  env?: 'canary' | 'staging' | 'prod-readonly';
  /** Pour backup_user_data / restore_from_backup */
  uid?: string;
  /** Pour restore_from_backup : timestamp snapshot */
  ts?: number;
  /** Champs custom additionnels */
  [k: string]: unknown;
}

export interface ExecutionRequest {
  id: string;
  task: AllowedTask;
  params: ExecutionParams;
  status: ExecutionStatus;
  ts_created: number;
  ts_dispatched?: number;
  ts_completed?: number;
  todo_id?: string;
  workflow_run_id?: string;
  workflow_run_url?: string;
  result?: unknown;
  error?: string;
  /* Métadonnées pour audit / orchestration */
  src: string;
  src_version?: string;
  initiated_by: string; /* 'apex_ia' | 'admin' | 'auto_sentinel' */
  duration_ms?: number;
}

export interface ExecuteOptions {
  /** Source projet (apex, cmcteams, kdmc, etc.) */
  src?: string;
  /** Version source (pour traçabilité) */
  src_version?: string;
  /** Qui a initié (apex_ia / admin / auto_sentinel) */
  initiated_by?: string;
  /** Skip GitHub dispatch (utile tests / mode offline) */
  skipDispatch?: boolean;
  /** Forcer ré-exécution même si rate-limit (admin only) */
  bypassRateLimit?: boolean;
}

export interface ExecuteResult {
  ok: boolean;
  request_id?: string;
  todo_id?: string;
  workflow_dispatched?: boolean;
  reason?: string;
}

export interface ExecuteStats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
  success_rate: number;
  avg_duration_ms: number;
  by_task: Record<string, number>;
}

/* === Constantes === */

const STORAGE_KEY = 'apex_v13_executions';
const MAX_EXECUTIONS = 200;
const RATE_LIMIT_PER_HOUR = 50;
const TIMEOUT_MS = 15 * 60 * 1000; /* 15 min : workflow CI cap */
const GITHUB_REPO_OWNER = '9r4rxssx64-creator';
const GITHUB_REPO_NAME = 'cmcteams';
const GITHUB_DISPATCH_URL = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/dispatches`;
const GITHUB_ACTIONS_RUNS_URL = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/actions/runs`;

/* === Service === */

class ApexExecuteService {
  /**
   * Demande d'exécution autonome via Claude Code Action.
   * Path principal de l'API publique.
   */
  async requestExecution(
    task: AllowedTask | string,
    params: ExecutionParams = {},
    options: ExecuteOptions = {},
  ): Promise<ExecuteResult> {
    /* 1. Validation whitelist : tâche dans ALLOWED, pas dans FORBIDDEN */
    if (FORBIDDEN_TASKS.has(task)) {
      void auditLog.record('apex_execute.forbidden_task_blocked', {
        details: { task, params: this.redactParams(params) },
      });
      logger.warn('apex-execute', `Forbidden task blocked: ${task}`);
      return { ok: false, reason: `Tâche interdite par règle Kevin sécurité : ${task}` };
    }
    if (!ALLOWED_TASKS.has(task as AllowedTask)) {
      void auditLog.record('apex_execute.unknown_task_blocked', { details: { task } });
      logger.warn('apex-execute', `Unknown task blocked: ${task}`);
      return { ok: false, reason: `Tâche inconnue : ${task}` };
    }

    /* 2. Validation params spécifiques par tâche */
    const validation = this.validateParams(task as AllowedTask, params);
    if (!validation.ok) {
      return { ok: false, reason: validation.reason ?? 'Params invalides' };
    }

    /* 3. Rate-limit (anti runaway) */
    if (!options.bypassRateLimit && this.isRateLimited()) {
      void auditLog.record('apex_execute.rate_limited', { details: { task } });
      return { ok: false, reason: `Rate limit atteint (max ${RATE_LIMIT_PER_HOUR}/h). Attendre.` };
    }

    /* 4. Création requête */
    const req: ExecutionRequest = {
      id: `exec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      task: task as AllowedTask,
      params: this.cloneParams(params),
      status: 'pending',
      ts_created: Date.now(),
      src: options.src ?? 'apex',
      ...(options.src_version && { src_version: options.src_version }),
      initiated_by: options.initiated_by ?? 'apex_ia',
    };

    /* 5. Push todo dans claude_todo (traçabilité bidirectionnelle) */
    try {
      const todo = await claudeBridge.pushTodo({
        type: this.mapTaskToTodoType(task as AllowedTask),
        src: req.src,
        ...(req.src_version && { src_version: req.src_version }),
        title: `[apex-execute] ${task}`,
        description: this.formatDescription(task as AllowedTask, params),
        severity: this.severityForTask(task as AllowedTask),
        context: { task, params: this.redactParams(params), exec_id: req.id },
      });
      req.todo_id = todo.id;
    } catch (err: unknown) {
      logger.warn('apex-execute', 'pushTodo failed (non-fatal)', { err });
    }

    /* 6. Persist request avant dispatch (récupération possible si crash) */
    this.persistRequest(req);

    /* 7. Audit log avant dispatch (immutable) */
    void auditLog.record('apex_execute.requested', {
      details: { id: req.id, task, src: req.src, initiated_by: req.initiated_by },
    });

    /* 8. Dispatch GitHub Actions (sauf si options.skipDispatch=true pour tests/offline) */
    let dispatched = false;
    if (!options.skipDispatch) {
      const dispatchResult = await this.dispatchWorkflow(req);
      dispatched = dispatchResult.ok;
      if (dispatched) {
        req.status = 'dispatched';
        req.ts_dispatched = Date.now();
        this.persistRequest(req);
      } else {
        if (dispatchResult.reason) req.error = dispatchResult.reason;
        /* On garde pending pour retry manuel possible — pas failed direct */
        this.persistRequest(req);
      }
    }

    logger.info('apex-execute', `Request created ${req.id} (task=${task}, dispatched=${dispatched})`);

    const result: ExecuteResult = {
      ok: true,
      request_id: req.id,
      workflow_dispatched: dispatched,
    };
    if (req.todo_id) result.todo_id = req.todo_id;
    return result;
  }

  /**
   * Liste exécutions en cours / récentes (admin only via UI).
   */
  listPendingExecutions(filters?: {
    status?: ExecutionStatus;
    task?: AllowedTask;
    src?: string;
    limit?: number;
  }): ExecutionRequest[] {
    const all = this.loadAll();
    let filtered = all;
    if (filters?.status) filtered = filtered.filter((r) => r.status === filters.status);
    if (filters?.task) filtered = filtered.filter((r) => r.task === filters.task);
    if (filters?.src) filtered = filtered.filter((r) => r.src === filters.src);
    filtered.sort((a, b) => b.ts_created - a.ts_created);
    if (filters?.limit && filters.limit > 0) filtered = filtered.slice(0, filters.limit);
    return filtered;
  }

  /**
   * Poll résultat d'une exécution.
   * Retourne status local. Si dispatched + workflow_run_id → tente API GitHub.
   */
  async pollResult(taskId: string): Promise<ExecutionRequest | null> {
    const all = this.loadAll();
    const req = all.find((r) => r.id === taskId);
    if (!req) return null;

    /* Détection timeout : pending/dispatched/running > TIMEOUT_MS */
    if (
      (req.status === 'pending' || req.status === 'dispatched' || req.status === 'running') &&
      Date.now() - req.ts_created > TIMEOUT_MS
    ) {
      req.status = 'timeout';
      req.ts_completed = Date.now();
      req.error = `Timeout après ${Math.round(TIMEOUT_MS / 60000)} min`;
      req.duration_ms = req.ts_completed - req.ts_created;
      this.persistRequest(req);
      return req;
    }

    /* Si workflow_run_id présent → check GitHub API status */
    if (req.workflow_run_id && (req.status === 'dispatched' || req.status === 'running')) {
      const updated = await this.fetchWorkflowStatus(req);
      if (updated) return updated;
    }

    return req;
  }

  /**
   * Annule une exécution pending/dispatched.
   * Si workflow déjà running on garde tel quel (la CI va terminer normalement).
   */
  cancelExecution(taskId: string): boolean {
    const all = this.loadAll();
    const req = all.find((r) => r.id === taskId);
    if (!req) return false;
    if (req.status === 'completed' || req.status === 'failed' || req.status === 'cancelled' || req.status === 'timeout') {
      return false; /* Déjà terminé */
    }
    req.status = 'cancelled';
    req.ts_completed = Date.now();
    req.duration_ms = req.ts_completed - req.ts_created;
    this.persistRequest(req);

    /* Auto-resolve todo associée (si claudeBridge dispo) */
    if (req.todo_id) {
      try {
        claudeBridge.resolveTodo(req.todo_id, 'apex_execute', 'cancelled by user/admin');
      } catch {
        /* skip */
      }
    }

    void auditLog.record('apex_execute.cancelled', { details: { id: taskId } });
    logger.info('apex-execute', `Cancelled ${taskId}`);
    return true;
  }

  /**
   * Marquer terminé (appelé par GitHub Action callback ou polling).
   * Public pour permettre tests + integration backend.
   */
  markCompleted(taskId: string, result: unknown, error?: string): boolean {
    const all = this.loadAll();
    const req = all.find((r) => r.id === taskId);
    if (!req) return false;
    req.status = error ? 'failed' : 'completed';
    req.ts_completed = Date.now();
    req.duration_ms = req.ts_completed - req.ts_created;
    if (error) req.error = error;
    else req.result = result;
    this.persistRequest(req);
    if (req.todo_id) {
      try {
        claudeBridge.resolveTodo(req.todo_id, 'github-actions', error ?? `task ${req.task} OK`);
      } catch {
        /* skip */
      }
    }
    void auditLog.record('apex_execute.completed', {
      details: { id: taskId, ok: !error, duration_ms: req.duration_ms },
    });
    return true;
  }

  /**
   * Stats d'utilisation : success rate, avg duration, breakdown par task.
   */
  getStats(): ExecuteStats {
    const all = this.loadAll();
    const total = all.length;
    const pending = all.filter((r) => r.status === 'pending' || r.status === 'dispatched').length;
    const running = all.filter((r) => r.status === 'running').length;
    const completed = all.filter((r) => r.status === 'completed').length;
    const failed = all.filter((r) => r.status === 'failed' || r.status === 'timeout').length;
    const cancelled = all.filter((r) => r.status === 'cancelled').length;
    const finished = completed + failed;
    const successRate = finished > 0 ? Math.round((completed / finished) * 1000) / 10 : 0;
    const durations = all
      .filter((r) => r.duration_ms !== undefined && r.status === 'completed')
      .map((r) => r.duration_ms ?? 0);
    const avgDurationMs =
      durations.length > 0 ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : 0;
    const byTask: Record<string, number> = {};
    for (const r of all) {
      byTask[r.task] = (byTask[r.task] ?? 0) + 1;
    }
    return {
      total,
      pending,
      running,
      completed,
      failed,
      cancelled,
      success_rate: successRate,
      avg_duration_ms: avgDurationMs,
      by_task: byTask,
    };
  }

  /**
   * Liste les tâches autorisées (pour UI / docs / IA system prompt).
   */
  listAllowedTasks(): readonly AllowedTask[] {
    return Array.from(ALLOWED_TASKS);
  }

  /**
   * Liste les tâches INTERDITES (pour UI / docs / sécu transparency).
   */
  listForbiddenTasks(): readonly string[] {
    return Array.from(FORBIDDEN_TASKS);
  }

  /**
   * Purge exécutions terminées > 7 jours (lifecycle cleanup).
   */
  purgeOld(maxAgeMs: number = 7 * 24 * 3600 * 1000): number {
    const all = this.loadAll();
    const cutoff = Date.now() - maxAgeMs;
    const kept = all.filter(
      (r) =>
        !(
          (r.status === 'completed' || r.status === 'failed' || r.status === 'cancelled' || r.status === 'timeout') &&
          (r.ts_completed ?? r.ts_created) < cutoff
        ),
    );
    const purged = all.length - kept.length;
    if (purged > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(kept));
      } catch {
        /* quota — skip */
      }
      logger.info('apex-execute', `purged ${purged} old executions`);
    }
    return purged;
  }

  /* === Privé : validation / dispatch / persist === */

  private validateParams(task: AllowedTask, params: ExecutionParams): { ok: boolean; reason?: string } {
    switch (task) {
      case 'modify_file':
      case 'create_file': {
        const path = String(params['path'] ?? '');
        if (!path) return { ok: false, reason: 'path requis' };
        /* Anti path traversal */
        if (path.includes('..') || path.startsWith('/') || path.startsWith('\\')) {
          return { ok: false, reason: 'path invalide (relatif obligatoire, pas de ..)' };
        }
        /* Restriction zones autorisées (anti modif système) */
        const banned = ['.github/workflows/apex-execute.yml', 'package-lock.json', 'node_modules'];
        if (banned.some((b) => path.includes(b))) {
          return { ok: false, reason: `path protégé : ${path}` };
        }
        if (typeof params['content'] !== 'string') {
          return { ok: false, reason: 'content (string) requis' };
        }
        /* Cap content size 1 MB pour éviter abus */
        if ((params['content'] as string).length > 1024 * 1024) {
          return { ok: false, reason: 'content > 1 MB refusé' };
        }
        return { ok: true };
      }
      case 'run_test':
      case 'run_lint':
        return { ok: true };
      case 'audit_repo': {
        const depth = params['depth'];
        if (depth && !['shallow', 'deep', 'full'].includes(String(depth))) {
          return { ok: false, reason: 'depth doit être shallow|deep|full' };
        }
        return { ok: true };
      }
      case 'deploy_canary': {
        const env = params['env'];
        if (!env || !['canary', 'staging', 'prod-readonly'].includes(String(env))) {
          return { ok: false, reason: 'env requis (canary|staging|prod-readonly)' };
        }
        return { ok: true };
      }
      case 'backup_user_data':
      case 'restore_from_backup': {
        const uid = params['uid'];
        if (!uid || typeof uid !== 'string') {
          return { ok: false, reason: 'uid requis' };
        }
        if (task === 'restore_from_backup' && !params['ts']) {
          return { ok: false, reason: 'ts (timestamp snapshot) requis pour restore' };
        }
        return { ok: true };
      }
      default:
        return { ok: false, reason: 'tâche inconnue' };
    }
  }

  private mapTaskToTodoType(task: AllowedTask): 'fix_bug' | 'add_feature' | 'investigate' | 'add_test' | 'security_finding' | 'performance_issue' {
    switch (task) {
      case 'modify_file':
      case 'create_file':
        return 'fix_bug';
      case 'run_test':
      case 'run_lint':
        return 'add_test';
      case 'audit_repo':
        return 'investigate';
      case 'deploy_canary':
        return 'add_feature';
      case 'backup_user_data':
      case 'restore_from_backup':
        return 'fix_bug';
      default:
        return 'investigate';
    }
  }

  private severityForTask(task: AllowedTask): 'critical' | 'high' | 'medium' | 'low' {
    switch (task) {
      case 'restore_from_backup':
      case 'deploy_canary':
        return 'high';
      case 'modify_file':
      case 'create_file':
      case 'backup_user_data':
        return 'medium';
      default:
        return 'low';
    }
  }

  private formatDescription(task: AllowedTask, params: ExecutionParams): string {
    const parts: string[] = [`Task: ${task}`];
    if (params['path']) parts.push(`Path: ${String(params['path'])}`);
    if (params['env']) parts.push(`Env: ${String(params['env'])}`);
    if (params['depth']) parts.push(`Depth: ${String(params['depth'])}`);
    if (params['command']) parts.push(`Cmd: ${String(params['command']).slice(0, 100)}`);
    if (params['uid']) parts.push(`UID: ${String(params['uid'])}`);
    return parts.join('\n');
  }

  /**
   * Redaction PII pour audit log (cap content size, masque secrets éventuels).
   */
  private redactParams(params: ExecutionParams): Record<string, unknown> {
    const safe: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(params)) {
      if (k === 'content' && typeof v === 'string') {
        safe[k] = v.length > 200 ? v.slice(0, 200) + `...[${v.length - 200} chars truncated]` : v;
      } else if (k === 'old_content' && typeof v === 'string') {
        safe[k] = v.length > 200 ? v.slice(0, 200) + '...' : v;
      } else if (typeof v === 'string' && /^(sk-|pk_|xkeysib-|ghp_|gho_|github_pat_)/.test(v)) {
        safe[k] = `[REDACTED ${v.slice(0, 6)}***]`;
      } else {
        safe[k] = v;
      }
    }
    return safe;
  }

  private cloneParams(params: ExecutionParams): ExecutionParams {
    try {
      return JSON.parse(JSON.stringify(params)) as ExecutionParams;
    } catch {
      return { ...params };
    }
  }

  /**
   * Rate limit : max RATE_LIMIT_PER_HOUR exécutions / heure rolling.
   */
  private isRateLimited(): boolean {
    const all = this.loadAll();
    const oneHourAgo = Date.now() - 3600 * 1000;
    const recent = all.filter((r) => r.ts_created >= oneHourAgo);
    return recent.length >= RATE_LIMIT_PER_HOUR;
  }

  /**
   * Persist (avec cap MAX_EXECUTIONS, trim oldest finished first).
   */
  private persistRequest(req: ExecutionRequest): void {
    const all = this.loadAll();
    const idx = all.findIndex((r) => r.id === req.id);
    if (idx >= 0) {
      all[idx] = req;
    } else {
      all.push(req);
    }
    if (all.length > MAX_EXECUTIONS) {
      /* Trim : terminés en premier, puis vieux pending */
      all.sort((a, b) => {
        const aFinished = ['completed', 'failed', 'cancelled', 'timeout'].includes(a.status) ? 1 : 0;
        const bFinished = ['completed', 'failed', 'cancelled', 'timeout'].includes(b.status) ? 1 : 0;
        if (aFinished !== bFinished) return bFinished - aFinished;
        return a.ts_created - b.ts_created;
      });
      all.splice(0, all.length - MAX_EXECUTIONS);
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (err: unknown) {
      logger.warn('apex-execute', 'persist failed (quota?)', { err });
    }
  }

  private loadAll(): ExecutionRequest[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed as ExecutionRequest[];
    } catch {
      return [];
    }
  }

  /**
   * Dispatch GitHub Actions repository_dispatch event.
   * Nécessite GitHub PAT scopé (repo) stocké dans Vault.
   */
  private async dispatchWorkflow(req: ExecutionRequest): Promise<{ ok: boolean; reason?: string }> {
    const token = this.getGitHubToken();
    if (!token) {
      return { ok: false, reason: 'GitHub token absent (vault key ax_github_token requis)' };
    }
    const payload = {
      event_type: 'apex-execute',
      client_payload: {
        exec_id: req.id,
        task: req.task,
        params: this.redactParams(req.params),
        src: req.src,
        src_version: req.src_version,
        ts: req.ts_created,
      },
    };
    try {
      const res = await fetch(GITHUB_DISPATCH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });
      if (res.status === 204) {
        /* Dispatch OK, GitHub n'a pas de run_id avant que le job ne démarre.
           On laisse fetchWorkflowStatus le retrouver via timestamp. */
        void auditLog.record('apex_execute.dispatched', {
          details: { id: req.id, task: req.task },
        });
        return { ok: true };
      }
      const text = await res.text().catch(() => '');
      return { ok: false, reason: `GitHub dispatch HTTP ${res.status}: ${text.slice(0, 100)}` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { ok: false, reason: `Network error: ${msg}` };
    }
  }

  /**
   * Recherche workflow run associé à exec_id (par recherche timestamp + event).
   */
  private async fetchWorkflowStatus(req: ExecutionRequest): Promise<ExecutionRequest | null> {
    const token = this.getGitHubToken();
    if (!token) return null;
    try {
      const url = `${GITHUB_ACTIONS_RUNS_URL}?event=repository_dispatch&per_page=20`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { workflow_runs?: Array<{ id: number; status: string; conclusion: string | null; html_url: string; created_at: string; name: string }> };
      const runs = data.workflow_runs ?? [];
      /* Match approximatif : run créé après ts_dispatched */
      const candidate = runs.find((r) => {
        if (!r.name?.toLowerCase().includes('apex')) return false;
        const created = Date.parse(r.created_at);
        return created >= (req.ts_dispatched ?? req.ts_created);
      });
      if (!candidate) return req;
      req.workflow_run_id = String(candidate.id);
      req.workflow_run_url = candidate.html_url;
      if (candidate.status === 'completed') {
        if (candidate.conclusion === 'success') {
          req.status = 'completed';
          req.result = { conclusion: 'success', url: candidate.html_url };
        } else {
          req.status = 'failed';
          req.error = `Workflow ${candidate.conclusion}`;
        }
        req.ts_completed = Date.now();
        req.duration_ms = req.ts_completed - req.ts_created;
      } else if (candidate.status === 'in_progress' || candidate.status === 'queued') {
        req.status = 'running';
      }
      this.persistRequest(req);
      return req;
    } catch {
      return null;
    }
  }

  /**
   * Récupère token GitHub depuis Vault (ou localStorage en fallback dev).
   */
  private getGitHubToken(): string | null {
    try {
      const direct = localStorage.getItem('ax_github_token');
      if (direct) return direct;
      const fromVault = localStorage.getItem('apex_v13_vault_ax_github_token');
      if (fromVault) return fromVault;
      return null;
    } catch {
      return null;
    }
  }
}

export const apexExecute = new ApexExecuteService();
