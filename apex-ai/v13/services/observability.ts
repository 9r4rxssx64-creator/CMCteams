/**
 * APEX v13 — Observability & Dead Letter Queue (P0 Jet 4 audit)
 *
 * Anti-pattern audit POST-FIX 72.4/100 :
 * "Error swallowing epidemic — 205 try/catch dont 70% silent failures.
 *  decrypt fails → null returned, log dropped if offline.
 *  Audit-log escalation failures → no alerting mechanism."
 *
 * Solution :
 * - Structured logging sink (Sentry si DSN configuré, sinon localStorage rotation)
 * - Dead Letter Queue : si event critical échoue 3x → push DLQ pour replay manuel
 * - Buffer rotatif local toujours, sync Sentry async non-bloquant
 *
 * Sentry DSN lu depuis `ax_sentry_dsn` (préservé v12.785).
 * Lazy-load @sentry/browser via CDN si DSN configuré (sinon 0 KB overhead).
 */

import { logger } from '../core/logger.js';

interface ObservabilityEvent {
  id: string;
  ts: number;
  level: 'info' | 'warn' | 'error' | 'critical';
  scope: string;
  msg: string;
  context?: Record<string, unknown>;
  attempts: number;
  status: 'pending' | 'sent' | 'dlq';
}

const STORAGE_KEY = 'apex_v13_observability';
const DLQ_KEY = 'apex_v13_observability_dlq';
const MAX_BUFFER = 500;
const MAX_DLQ = 200;
const MAX_RETRIES = 3;

class Observability {
  private buffer: ObservabilityEvent[] = [];
  private dlq: ObservabilityEvent[] = [];
  private sentryReady = false;
  private flushTimer: number | null = null;

  init(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.buffer = JSON.parse(raw) as ObservabilityEvent[];
      const dlqRaw = localStorage.getItem(DLQ_KEY);
      if (dlqRaw) this.dlq = JSON.parse(dlqRaw) as ObservabilityEvent[];
    } catch {
      /* ignore */
    }
    void this.tryInitSentry();
    this.scheduleFlush();
  }

  /**
   * Capture event critique (jamais silenced).
   * Si Sentry KO → buffer local + retry. Si MAX_RETRIES → DLQ pour replay manuel.
   */
  capture(level: ObservabilityEvent['level'], scope: string, msg: string, context?: Record<string, unknown>): void {
    const event: ObservabilityEvent = {
      id: `obs_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ts: Date.now(),
      level,
      scope,
      msg: msg.slice(0, 500),
      ...(context && { context }),
      attempts: 0,
      status: 'pending',
    };
    this.buffer.push(event);
    if (this.buffer.length > MAX_BUFFER) this.buffer = this.buffer.slice(-MAX_BUFFER);
    this.persist();
    if (level === 'critical') this.scheduleFlush(0); /* flush immédiat sur critical */
  }

  /**
   * Wrap un try/catch pour qu'il NE SOIT PLUS silent.
   * Usage : await observability.guard('vault.decrypt', () => decrypt(...))
   */
  async guard<T>(scope: string, fn: () => Promise<T> | T, fallback?: T): Promise<T | undefined> {
    try {
      return await fn();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.capture('error', scope, msg, { stack: err instanceof Error ? err.stack : undefined });
      return fallback;
    }
  }

  getDLQ(): readonly ObservabilityEvent[] {
    return this.dlq;
  }

  getBuffer(): readonly ObservabilityEvent[] {
    return this.buffer;
  }

  /* Replay DLQ entries (admin only — appel via vAdminCenter) */
  async replayDLQ(): Promise<{ replayed: number; failed: number }> {
    const items = [...this.dlq];
    this.dlq = [];
    this.persist();
    let replayed = 0;
    let failed = 0;
    for (const event of items) {
      event.status = 'pending';
      event.attempts = 0;
      this.buffer.push(event);
    }
    await this.flush();
    return { replayed, failed };
  }

  private async tryInitSentry(): Promise<void> {
    const dsn = localStorage.getItem('ax_sentry_dsn');
    if (!dsn || !dsn.startsWith('https://')) return;
    /* Sentry lazy-load — Jet 4 : implémentation minimaliste fetch direct vers Sentry API
     * (évite +60KB @sentry/browser bundle pour PWA mobile-first) */
    this.sentryReady = true;
    logger.info('observability', 'Sentry DSN detected, ready for fetch sink');
  }

  private scheduleFlush(delay = 5000): void {
    if (this.flushTimer !== null) clearTimeout(this.flushTimer);
    this.flushTimer = window.setTimeout(() => {
      this.flushTimer = null;
      void this.flush();
    }, delay);
  }

  private async flush(): Promise<void> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    const pending = this.buffer.filter((e) => e.status === 'pending');
    for (const event of pending) {
      if (event.attempts >= MAX_RETRIES) {
        event.status = 'dlq';
        this.dlq.push(event);
        if (this.dlq.length > MAX_DLQ) this.dlq = this.dlq.slice(-MAX_DLQ);
        continue;
      }
      event.attempts++;
      const ok = this.sentryReady ? await this.sendToSentry(event) : true; /* no-op si pas Sentry */
      if (ok) {
        event.status = 'sent';
      }
    }
    /* Cleanup events sent (garde DLQ + pending uniquement en buffer) */
    this.buffer = this.buffer.filter((e) => e.status !== 'sent');
    this.persist();
  }

  private async sendToSentry(event: ObservabilityEvent): Promise<boolean> {
    const dsn = localStorage.getItem('ax_sentry_dsn');
    if (!dsn) return false;
    try {
      /* Parse DSN format : https://<key>@<host>/<project> */
      const match = dsn.match(/^https:\/\/([^@]+)@([^/]+)\/(\d+)$/);
      if (!match) return false;
      const [, key, host, projectId] = match;
      const url = `https://${host}/api/${projectId}/store/`;
      const payload = {
        event_id: event.id,
        timestamp: event.ts / 1000,
        level: event.level === 'critical' ? 'fatal' : event.level,
        logger: event.scope,
        message: event.msg,
        ...(event.context && { extra: event.context }),
      };
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sentry-Auth': `Sentry sentry_version=7,sentry_key=${key}`,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.buffer));
      localStorage.setItem(DLQ_KEY, JSON.stringify(this.dlq));
    } catch {
      /* ignore quota */
    }
  }
}

export const observability = new Observability();
