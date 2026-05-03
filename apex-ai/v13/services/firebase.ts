/**
 * APEX v13 — Firebase service
 *
 * Schémas préservés à l'identique de v12.785 :
 * - /cmcteams/*  : JAMAIS touché
 * - /apex/users/<uid>/vault/*
 * - /apex/users/<uid>/persistent_memory/*
 * - /apex/telemetry_in/*
 * - /apex/lessons_learned/*
 * - /apex/claude_todo/*
 *
 * SSE EventSource pour sync temps réel + queue offline.
 *
 * Anti-patterns évités :
 * - Pas d'écrasement localStorage avec null venant de Firebase (plain wins guard)
 * - FB_LOCAL strict pour user/uid/voice_print
 */

import { logger } from '../core/logger.js';
import { events } from '../core/events.js';

const FB_DEFAULT = 'https://kdmc-clients-default-rtdb.firebaseio.com';

export const FB_FIX: readonly string[] = [
  'apex_v13_facts',
  'apex_v13_lessons',
  'ax_telemetry_in',
  'ax_claude_todo',
  'ax_lessons_learned_struct',
  'ax_persistent_memory',
  'ax_links_registry',
  'ax_audit',
];

export const FB_LOCAL: readonly string[] = [
  'apex_v13_user',
  'apex_v13_uid',
  'apex_v13_lastact',
  'ax_voice_print_',
  'apex_v13_pin',
  'apex_v13_session',
];

class Firebase {
  private url = FB_DEFAULT;
  private connected = false;
  private sse: EventSource | null = null;
  private queue: Array<{ key: string; value: unknown; ts: number }> = [];

  async init(): Promise<void> {
    try {
      const stored = localStorage.getItem('apex_v13_fb_url');
      if (stored) this.url = stored;
    } catch {
      /* ignore */
    }

    /* Test ping */
    try {
      const ping = await fetch(`${this.url}/.json?shallow=true`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      this.connected = ping.ok;
      logger.info('firebase', `Connected: ${this.connected}`, { url: this.url });
    } catch (err: unknown) {
      logger.warn('firebase', 'Ping failed (offline mode)', { err });
      this.connected = false;
    }

    if (this.connected) this.startSSE();
    this.flushQueue();
  }

  isConnected(): boolean {
    return this.connected;
  }

  shouldSync(key: string): boolean {
    return FB_FIX.includes(key);
  }

  isLocalOnly(key: string): boolean {
    return FB_LOCAL.some((prefix) => key === prefix || key.startsWith(prefix));
  }

  async write(key: string, value: unknown): Promise<void> {
    if (this.isLocalOnly(key)) return;
    if (!this.shouldSync(key)) return;
    if (!this.connected) {
      this.queue.push({ key, value, ts: Date.now() });
      return;
    }
    try {
      const res = await fetch(`${this.url}/apex/${encodeURIComponent(key)}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err: unknown) {
      logger.warn('firebase', `Write failed for ${key} (queued)`, { err });
      this.queue.push({ key, value, ts: Date.now() });
    }
  }

  async read<T>(key: string): Promise<T | null> {
    if (!this.connected) return null;
    try {
      const res = await fetch(`${this.url}/apex/${encodeURIComponent(key)}.json`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch (err: unknown) {
      logger.warn('firebase', `Read failed for ${key}`, { err });
      return null;
    }
  }

  private startSSE(): void {
    if (this.sse) this.sse.close();
    try {
      this.sse = new EventSource(`${this.url}/apex.json`);
      this.sse.addEventListener('put', (event) => {
        try {
          const data = JSON.parse((event as MessageEvent).data) as { path: string; data: unknown };
          this.applyRemoteChange(data.path, data.data);
        } catch (err: unknown) {
          logger.warn('firebase', 'SSE parse error', { err });
        }
      });
      this.sse.onerror = () => {
        this.connected = false;
        events.emit('network:offline', {});
        setTimeout(() => this.startSSE(), 5000);
      };
      this.sse.onopen = () => {
        this.connected = true;
        events.emit('network:online', {});
        this.flushQueue();
      };
    } catch (err: unknown) {
      logger.error('firebase', 'SSE start failed', { err });
    }
  }

  /**
   * Anti-pattern v12 corrigé : si Firebase retourne null mais valeur locale existe,
   * NE PAS écraser. Source de vérité = local non-null > Firebase null.
   */
  private applyRemoteChange(path: string, data: unknown): void {
    const key = path.replace(/^\//, '').split('/')[0];
    if (!key) return;
    if (this.isLocalOnly(key)) return;
    if (data === null) {
      const existing = localStorage.getItem(key);
      if (existing) {
        logger.debug('firebase', `Skip null overwrite for ${key} (plain wins)`);
        return;
      }
    }
    try {
      localStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
    } catch (err: unknown) {
      logger.warn('firebase', `applyRemoteChange persist failed for ${key}`, { err });
    }
  }

  private flushQueue(): void {
    if (!this.connected || !this.queue.length) return;
    const batch = this.queue.slice();
    this.queue = [];
    for (const item of batch) {
      void this.write(item.key, item.value);
    }
  }
}

export const firebase = new Firebase();
