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

import { events } from '../core/events.js';
import { logger } from '../core/logger.js';

const FB_DEFAULT = 'https://kdmc-clients-default-rtdb.firebaseio.com';

export const FB_FIX: readonly string[] = [
  'apex_v13_facts',
  'apex_v13_lessons',
  'ax_telemetry_in',
  'ax_claude_todo',
  /* Pipeline temps-réel Apex↔Claude Code (Kevin 2026-05-07 v13.3.26) */
  'ax_handoff_journal',
  'ax_claude_alerts',
  /* Bridge Apex → CMCteams planning autonome (Kevin 2026-05-07 v9.601) */
  'ax_cmc_planning_pending',
  'ax_lessons_learned_struct',
  'ax_persistent_memory',
  'ax_links_registry',
  'ax_audit',
  /* Sprint 8 v13.0.63 : ajout ax_persistent_memory + apex_v13_persistent_memory pour sync auto cloud */
  'apex_v13_persistent_memory',
  /* Sprint 8 : backup vault keys chiffrées (survit clear cache iPhone) */
  'apex_v13_anthropic_key',
  'apex_v13_openai_key',
  'apex_v13_groq_key',
  'apex_v13_gemini_key',
  'apex_v13_openrouter_key',
  /* === v13.0.20+ FIX KEVIN "clés API pas en mémoire" — whitelist élargie === */
  /* AI providers */
  'ax_anthropic_key',
  'ax_openai_key',
  'ax_groq_key',
  'ax_google_key',
  'ax_gemini_key',
  'ax_openrouter_key',
  'ax_perplexity_key',
  'ax_mistral_key',
  'ax_cohere_key',
  'ax_deepseek_key',
  'ax_xai_key',
  'ax_togetherai_key',
  'ax_fireworks_key',
  'ax_huggingface_key',
  'ax_replicate_key',
  'ax_elevenlabs_key',
  'ax_deepl_key',
  /* Vector DB / Storage */
  'ax_pinecone_key',
  'ax_weaviate_key',
  'ax_supabase_key',
  /* Payments / Finance */
  'ax_stripe_key',
  'ax_stripe_sk',
  'ax_stripe_pk',
  'ax_paypal_token',
  'ax_revolut_key',
  'ax_wise_key',
  'ax_shopify_key',
  /* DevOps / Hosting */
  'ax_github_token',
  'ax_cloudflare_token',
  'ax_vercel_token',
  'ax_netlify_token',
  'ax_npm_token',
  'ax_sentry_key',
  /* Communications */
  'ax_twilio_key',
  'ax_sendgrid_key',
  'ax_mailchimp_key',
  'ax_brevo_key',
  'ax_resend_key',
  'ax_telegram_token',
  'ax_telegram_chat_id', /* P2 audit fix : backup Firebase pour reinstall PWA */
  'ax_whatsapp_token',
  'ax_discord_webhook_url', /* P1 audit fix : align kevin-alerts.ts naming (was ax_discord_webhook) */
  'ax_slack_token',
  /* Productivity / SaaS */
  'ax_notion_key',
  'ax_airtable_pat',
  'ax_linear_key',
  'ax_figma_token',
  'ax_asana_token',
  'ax_trello_token',
  'ax_zapier_key',
  'ax_make_key',
  'ax_posthog_key',
  /* Sprint 9 v13.1.x : multi-key vault (failover key-level Kevin règle 2026-05-07) */
  'apex_v13_multi_keys',
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
  /* P0 fix audit Cure53/NCC : tracker tous les listeners SSE pour removeEventListener au disconnect.
     EventSource.close() seul ne suffit pas — les listeners persistent en mémoire si on
     redémarre l'EventSource via startSSE() (memory leak documenté Mozilla). */
  private sseListeners: Array<{ type: string; listener: EventListener }> = [];

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
    /* Sprint 8 : restore vault keys depuis Firebase si localStorage vide
       (Kevin règle "ne plus perdre clé API après clear cache iPhone") */
    if (this.connected) void this.restoreVaultKeysFromFirebase();
  }

  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Sprint 8 : Restore clés API chiffrées depuis Firebase vers localStorage si manquantes.
   * Survit "Effacer historique Safari" complet iPhone.
   *
   * v13.3.20 FIX KEVIN "Apex oublie ses codes sans cesse" (2026-05-07) :
   * - Délègue à vault.restoreFromFirebase qui VALIDE la décryption avant overwrite.
   * - Hydrate aussi IDB shadow (triple persistence règle Kevin v9.519).
   * - Skip valeurs corrompues (decrypt fail) au lieu de les écrire en localStorage.
   */
  private async restoreVaultKeysFromFirebase(): Promise<void> {
    const VAULT_KEYS = FB_FIX.filter((k) => k.endsWith('_key') || k.endsWith('_token'));
    let restored = 0;
    let skipped = 0;
    let vaultMod: typeof import('./vault.js') | null = null;
    try {
      vaultMod = await import('./vault.js');
    } catch { /* offline OK, fallback raw write below */ }
    for (const key of VAULT_KEYS) {
      try {
        if (localStorage.getItem(key)) continue; /* Déjà présent local */
        const url = `${this.url}/apex/${key}.json`;
        const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (!r.ok) continue;
        const value = await r.json() as unknown;
        if (typeof value !== 'string' || value.length === 0) continue;
        /* Délégation vault si dispo (validate decrypt + hydrate IDB) */
        if (vaultMod) {
          const ok = await vaultMod.vault.restoreFromFirebase(key, value);
          if (ok) restored++;
          else skipped++;
        } else {
          localStorage.setItem(key, value);
          restored++;
        }
      } catch { /* skip */ }
    }
    if (restored > 0) {
      logger.info('firebase', `🔄 ${restored} clés API restorées depuis Firebase backup (skipped: ${skipped})`);
    }
  }

  shouldSync(key: string): boolean {
    return FB_FIX.includes(key);
  }

  isLocalOnly(key: string): boolean {
    return FB_LOCAL.some((prefix) => key === prefix || key.startsWith(prefix));
  }

  async write(key: string, value: unknown, opts?: { idempotencyKey?: string }): Promise<void> {
    if (this.isLocalOnly(key)) return;
    if (!this.shouldSync(key)) return;
    if (!this.connected) {
      this.queue.push({ key, value, ts: Date.now() });
      return;
    }
    /* Jet 5 fix : idempotency hash IMMUTABLE sha256(key+value) — survie post-crash.
     * Si caller fournit idempotencyKey explicite → respect, sinon hash déterministe. */
    const idempotencyKey = opts?.idempotencyKey ?? (await this.hashIdempotency(key, value));
    if (this.recentlyWritten(idempotencyKey)) {
      logger.debug('firebase', `Idempotent skip ${key}`);
      return;
    }
    try {
      const res = await fetch(`${this.url}/apex/${encodeURIComponent(key)}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': idempotencyKey },
        body: JSON.stringify(value),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.recordWrite(idempotencyKey);
    } catch (err: unknown) {
      logger.warn('firebase', `Write failed for ${key} (queued)`, { err });
      this.queue.push({ key, value, ts: Date.now() });
    }
  }

  /* P0 fix Jet 5 audit subagent : recentWrites PERSISTÉ localStorage
   * (vs Map en mémoire seule = perte post-crash → double-write).
   * Hash déterministe sha256(key + JSON.stringify(value)) immutable entre reloads. */
  private recentWrites = new Map<string, number>();
  private recentWritesLoaded = false;

  private loadRecentWrites(): void {
    if (this.recentWritesLoaded) return;
    this.recentWritesLoaded = true;
    try {
      const raw = localStorage.getItem('apex_v13_idempotency');
      if (raw) {
        const obj = JSON.parse(raw) as Record<string, number>;
        const cutoff = Date.now() - 60_000;
        for (const [k, ts] of Object.entries(obj)) {
          if (ts >= cutoff) this.recentWrites.set(k, ts);
        }
      }
    } catch {
      /* ignore corruption */
    }
  }

  private persistRecentWrites(): void {
    try {
      const obj: Record<string, number> = {};
      for (const [k, ts] of this.recentWrites) obj[k] = ts;
      localStorage.setItem('apex_v13_idempotency', JSON.stringify(obj));
    } catch {
      /* ignore quota */
    }
  }

  /**
   * Hash idempotency déterministe (Jet 6 fix audit P0-2 : try/catch crypto.subtle).
   * Si crypto.subtle indisponible (iframe sandbox, SW reload, vieux browser) → fallback DJB2 32-bit.
   * DJB2 ≠ cryptographique mais déterministe sur (key, value) = OK pour idempotency 60s window.
   */
  private async hashIdempotency(key: string, value: unknown): Promise<string> {
    const data = key + ':' + JSON.stringify(value);
    try {
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
        return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
      }
    } catch (err: unknown) {
      logger.warn('firebase', 'crypto.subtle failed, fallback DJB2', { err });
    }
    /* Fallback DJB2 hash (deterministic, 32-bit) */
    let hash = 5381;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) + hash + data.charCodeAt(i)) | 0;
    }
    return 'djb2_' + (hash >>> 0).toString(16).padStart(8, '0') + '_' + data.length.toString(16);
  }

  private recentlyWritten(key: string): boolean {
    this.loadRecentWrites();
    const ts = this.recentWrites.get(key);
    if (!ts) return false;
    if (Date.now() - ts > 60_000) {
      this.recentWrites.delete(key);
      this.persistRecentWrites();
      return false;
    }
    return true;
  }

  private recordWrite(key: string): void {
    this.recentWrites.set(key, Date.now());
    /* GC entries > 60s */
    if (this.recentWrites.size > 200) {
      const cutoff = Date.now() - 60_000;
      for (const [k, ts] of this.recentWrites) {
        if (ts < cutoff) this.recentWrites.delete(k);
      }
    }
    this.persistRecentWrites();
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
    /* Cleanup tout SSE précédent (close + remove listeners) avant d'en recréer un nouveau */
    this.cleanupSSE();
    try {
      this.sse = new EventSource(`${this.url}/apex.json`);
      const putListener: EventListener = (event) => {
        try {
          const data = JSON.parse((event as MessageEvent).data) as { path: string; data: unknown };
          this.applyRemoteChange(data.path, data.data);
        } catch (err: unknown) {
          logger.warn('firebase', 'SSE parse error', { err });
        }
      };
      this.sse.addEventListener('put', putListener);
      /* Track le listener pour pouvoir l'enlever proprement au disconnect/restart. */
      this.sseListeners.push({ type: 'put', listener: putListener });

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
   * Cleanup interne SSE : remove explicite des listeners trackés + close + reset handlers + reset state.
   * Utilisé par startSSE() (avant nouveau EventSource) et disconnect() (cleanup public).
   */
  private cleanupSSE(): void {
    if (this.sse) {
      for (const { type, listener } of this.sseListeners) {
        try { this.sse.removeEventListener(type, listener); } catch { /* ignore */ }
      }
      try { this.sse.onerror = null; } catch { /* ignore */ }
      try { this.sse.onopen = null; } catch { /* ignore */ }
      try { this.sse.close(); } catch { /* ignore */ }
      this.sse = null;
    }
    this.sseListeners = [];
  }

  /**
   * Disconnect public — appelable au logout / shutdown / page unload.
   * Idempotent. Garantit qu'aucun listener SSE n'est laissé orphelin.
   */
  disconnect(): void {
    this.cleanupSSE();
    this.connected = false;
  }

  /**
   * Audit helper : compte les listeners SSE actuellement attachés.
   * Exposé pour tests + debug.
   */
  getActiveSSEListenerCount(): number {
    return this.sseListeners.length;
  }

  /**
   * Anti-pattern v12 corrigé : si Firebase retourne null mais valeur locale existe,
   * NE PAS écraser. Source de vérité = local non-null > Firebase null.
   *
   * v13.3.20 FIX KEVIN "Apex oublie ses codes" (2026-05-07) :
   * - Si valeur Firebase = AXENC1: chiffré ET vault key (ax_*_key/_token), valider
   *   décryption AVANT d'écraser local. Si decrypt fail → garder local (plain wins).
   * - "plain wins over encrypted-corrupt" guard renforcé (Kevin règle triple persistence).
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
    /* v13.3.20 : si vault key reçue chiffrée, valider decrypt avant overwrite local.
     * Évite que SSE écrase une clé locale valide par une corruption Firebase. */
    const isVaultKey = key.endsWith('_key') || key.endsWith('_token');
    if (isVaultKey && typeof data === 'string' && data.startsWith('AXENC1:')) {
      const existing = localStorage.getItem(key);
      if (existing && existing !== data) {
        /* On a déjà une valeur locale différente — on délègue à vault.restoreFromFirebase
         * qui valide le décrypt avant écrasement (anti-corruption Firebase). */
        void import('./vault.js').then(({ vault }) => {
          void vault.restoreFromFirebase(key, data).catch(() => {
            logger.debug('firebase', `Vault key ${key} restore from FB skipped (decrypt fail or invalid)`);
          });
        }).catch(() => { /* offline OK */ });
        return;
      }
    }
    try {
      localStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
    } catch (err: unknown) {
      logger.warn('firebase', `applyRemoteChange persist failed for ${key}`, { err });
    }
    /* Pipeline temps-réel Kevin 2026-05-07 : émet event pour que les services
     * (claude-bridge, cmc-planning-bridge) puissent réagir aux changements distants. */
    try {
      events.emit('firebase:remote_change', { key, data });
    } catch { /* ignore listener errors */ }
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
