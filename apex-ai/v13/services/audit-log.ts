/**
 * APEX v13 — Audit log immutable (P1 audit + RGPD compliance preparation)
 *
 * Toutes les actions sensibles sont loggées avec :
 * - timestamp (ms)
 * - actor (user.id ou "system")
 * - action (ex: "auth.login.success", "vault.store", "admin.toggleCommerce")
 * - target (objet impacté)
 * - hash (SHA-256 chaîné — anti tampering basique)
 *
 * Logs gardés en localStorage (max 1000) + sync Firebase si admin (FB_FIX).
 * Hash chain : chaque entry contient hash(prev_hash + content), modification = casse chain.
 */

import { logger } from '../core/logger.js';

export interface AuditEntry {
  ts: number;
  actor: string;
  action: string;
  target?: string;
  details?: Record<string, unknown>;
  prevHash: string;
  hash: string;
}

const STORAGE_KEY = 'ax_audit_log_v13';
const MAX_ENTRIES = 1000;

class AuditLog {
  private chain: AuditEntry[] = [];
  private initialized = false;

  init(): void {
    if (this.initialized) return;
    this.initialized = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.chain = JSON.parse(raw) as AuditEntry[];
    } catch {
      /* ignore */
    }
  }

  async record(action: string, opts: { actor?: string; target?: string; details?: Record<string, unknown> } = {}): Promise<void> {
    if (!this.initialized) this.init();
    const prevHash = this.chain.length ? this.chain[this.chain.length - 1]!.hash : '0';
    const entry: AuditEntry = {
      ts: Date.now(),
      actor: opts.actor ?? 'system',
      action,
      ...(opts.target && { target: opts.target }),
      ...(opts.details && { details: opts.details }),
      prevHash,
      hash: '',
    };
    entry.hash = await this.computeHash(entry);
    this.chain.push(entry);
    if (this.chain.length > MAX_ENTRIES) this.chain = this.chain.slice(-MAX_ENTRIES);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.chain));
    } catch (err: unknown) {
      logger.warn('audit-log', 'persist failed', { err });
    }
  }

  async verify(): Promise<{ valid: boolean; brokenAt?: number }> {
    if (!this.initialized) this.init();
    let prevHash = '0';
    for (let i = 0; i < this.chain.length; i++) {
      const entry = this.chain[i]!;
      if (entry.prevHash !== prevHash) return { valid: false, brokenAt: i };
      const expected = await this.computeHash({ ...entry, hash: '' });
      if (entry.hash !== expected) return { valid: false, brokenAt: i };
      prevHash = entry.hash;
    }
    return { valid: true };
  }

  getEntries(filter?: { actor?: string; action?: string }): readonly AuditEntry[] {
    if (!filter) return this.chain;
    return this.chain.filter((e) => {
      if (filter.actor && e.actor !== filter.actor) return false;
      if (filter.action && !e.action.startsWith(filter.action)) return false;
      return true;
    });
  }

  private async computeHash(entry: Omit<AuditEntry, 'hash'> & { hash: string }): Promise<string> {
    const data = JSON.stringify({ ...entry, hash: '' });
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
}

export const auditLog = new AuditLog();
