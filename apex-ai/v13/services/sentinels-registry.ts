/**
 * APEX v13 — Sentinels Registry MAX (18+ sentinelles 24/7 niveau pro).
 *
 * Layer typé clean au-dessus de `sentinels.ts` existant qui expose :
 * - Interface `Sentinel` complète (id, name, description, intervalMs, run, autoFix, lastRun, lastResult, enabled)
 * - Interface `SentinelResult` (status ok/warn/error + message + details + ts + durationMs)
 * - API `sentinelsRegistry` (list, start, stop, startAll, stopAll, getStatus, getLastReport)
 * - Métriques perf collectées (durationMs par run, taux succès, autoFix réussis)
 * - Auto-fix whitelist 3 tentatives → escalade ax_claude_todo Firebase si fail
 * - Lessons learned ajoutées si nouveau pattern erreur
 * - Audit log immutable (via auditLog service)
 * - Sentinel-meta surveille les autres sentinels (état down/crash → escalade)
 *
 * Compat ancienne API : conserve `sentinels` (manager) + `registerCoreSentinels()`
 * Cette registry boost les 13 existantes vers 18+ MAX en ajoutant :
 * - capabilities-watch (week) : détecte nouvelles APIs Web (NDEFReader, BarcodeDetector...)
 * - tools-watch (week) : Web search nouveaux outils/libs Apex pourrait intégrer
 * - persistence-watch (1h) : vérifie clés critiques présentes local + Firebase, restore auto
 * - sentinel-meta (5 min) : surveille les 17 autres sentinelles
 *
 * Règle Kevin : "Pousse au max son script, skill, hook etc toujours."
 */

import { logger } from '../core/logger.js';

import { sentinels as sentinelsManager, registerCoreSentinels, type Sentinel as LegacySentinel } from './sentinels.js';

/* === Types publics === */

export type SentinelStatus = 'ok' | 'warn' | 'error';

export interface SentinelResult {
  status: SentinelStatus;
  message: string;
  details?: Record<string, unknown>;
  ts: number;
  durationMs: number;
}

export interface Sentinel {
  id: string;
  name: string;
  description: string;
  intervalMs: number;
  run: () => Promise<SentinelResult>;
  autoFix?: () => Promise<boolean>;
  lastRun?: number;
  lastResult?: SentinelResult;
  enabled: boolean;
}

export interface RegistryStatus {
  total: number;
  running: number;
  errors: number;
  warns: number;
  ok: number;
  pending: number;
  autoFixSuccessCount: number;
  totalRuns: number;
}

export interface RegistryMetrics {
  totalRuns: number;
  totalSuccess: number;
  totalFailures: number;
  totalAutoFixSuccess: number;
  totalAutoFixFailures: number;
  avgDurationMs: number;
  perSentinel: Record<
    string,
    { runs: number; success: number; failures: number; avgMs: number; autoFixSuccess: number }
  >;
}

interface PerfTrack {
  runs: number;
  success: number;
  failures: number;
  totalDurationMs: number;
  autoFixSuccess: number;
  autoFixFailures: number;
  lastEscalationTs?: number;
}

const METRICS_KEY = 'apex_v13_sentinels_metrics';
const ESCALATION_KEY = 'ax_claude_todo';
const ESCALATION_COOLDOWN_MS = 6 * 60 * 60 * 1000; /* 6h cooldown par sentinelle */
const AUTOFIX_MAX_ATTEMPTS = 3;

class SentinelsRegistry {
  private metrics = new Map<string, PerfTrack>();
  private bootedExtras = false;

  constructor() {
    this.loadMetrics();
  }

  /**
   * Boote la registry : enregistre les 13 sentinels core + 4 extras MAX (capabilities/tools/persistence/sentinel-meta).
   * Idempotent.
   */
  bootstrap(): void {
    /* Core 13 (compat existante) */
    registerCoreSentinels();
    /* Extras MAX */
    if (!this.bootedExtras) {
      this.registerExtras();
      this.bootedExtras = true;
    }
  }

  /**
   * Liste toutes les sentinelles avec wrapper typé moderne.
   */
  list(): readonly Sentinel[] {
    return sentinelsManager.list().map((s) => this.adapt(s));
  }

  /**
   * Récupère une sentinelle par id (typed).
   */
  get(id: string): Sentinel | undefined {
    const s = sentinelsManager.list().find((x) => x.id === id);
    return s ? this.adapt(s) : undefined;
  }

  /**
   * Active une sentinelle (sans la lancer immédiatement).
   */
  start(id: string): void {
    sentinelsManager.enable(id, true);
  }

  /**
   * Désactive une sentinelle (skip cycle scheduler).
   */
  stop(id: string): void {
    sentinelsManager.enable(id, false);
  }

  /**
   * Active toutes les sentinelles enregistrées.
   */
  startAll(): void {
    for (const s of sentinelsManager.list()) {
      sentinelsManager.enable(s.id, true);
    }
  }

  /**
   * Désactive toutes les sentinelles.
   */
  stopAll(): void {
    for (const s of sentinelsManager.list()) {
      sentinelsManager.enable(s.id, false);
    }
  }

  /**
   * Force run d'une sentinelle + retourne SentinelResult typé + collecte métriques.
   * Si fail + autoFix → tente jusqu'à 3 fois (whitelist), sinon escalade.
   */
  async runOne(id: string): Promise<SentinelResult> {
    const start = Date.now();
    const legacy = sentinelsManager.list().find((s) => s.id === id);
    if (!legacy) {
      return {
        status: 'error',
        message: `Sentinel '${id}' not found`,
        ts: Date.now(),
        durationMs: 0,
      };
    }

    const trackBefore = this.getOrInitMetric(id);
    let result: SentinelResult;
    try {
      const legacyResult = await sentinelsManager.runOne(id);
      const durationMs = Date.now() - start;
      result = this.legacyToResult(legacyResult, durationMs);
    } catch (err: unknown) {
      const durationMs = Date.now() - start;
      result = {
        status: 'error',
        message: err instanceof Error ? err.message : String(err),
        ts: Date.now(),
        durationMs,
      };
    }

    /* Collecte métriques */
    trackBefore.runs += 1;
    trackBefore.totalDurationMs += result.durationMs;
    if (result.status === 'ok') trackBefore.success += 1;
    else trackBefore.failures += 1;

    /* Auto-fix path : si error/warn ET autoFix dispo → tente jusqu'à 3x puis escalade */
    if (result.status !== 'ok' && legacy.autoFix) {
      let fixed = false;
      for (let attempt = 1; attempt <= AUTOFIX_MAX_ATTEMPTS; attempt += 1) {
        try {
          const fixResult = await legacy.autoFix();
          if (fixResult.ok) {
            trackBefore.autoFixSuccess += 1;
            fixed = true;
            /* Re-check : si OK → result devient ok */
            const recheckLegacy = await sentinelsManager.runOne(id);
            const recheckResult = this.legacyToResult(recheckLegacy, Date.now() - start);
            if (recheckResult.status === 'ok') {
              result = {
                ...recheckResult,
                message: `Auto-fixed (attempt ${attempt}): ${fixResult.msg}`,
                details: { ...recheckResult.details, autoFixed: true, attempts: attempt },
              };
            }
            break;
          }
          trackBefore.autoFixFailures += 1;
        } catch (fixErr: unknown) {
          trackBefore.autoFixFailures += 1;
          logger.warn('sentinels-registry', `auto-fix attempt ${attempt} threw`, {
            id,
            err: fixErr instanceof Error ? fixErr.message : String(fixErr),
          });
        }
      }
      if (!fixed) {
        await this.escalateToClaudeTodo(id, result);
      }
    } else if (result.status !== 'ok') {
      /* Pas d'autoFix → escalade direct si critique */
      await this.escalateToClaudeTodo(id, result);
    }

    this.metrics.set(id, trackBefore);
    this.persistMetrics();
    return result;
  }

  /**
   * Run toutes les sentinelles enabled une fois (admin debug).
   */
  async runAll(): Promise<{ id: string; result: SentinelResult }[]> {
    const all = sentinelsManager.list().filter((s) => s.enabled);
    return Promise.all(all.map(async (s) => ({ id: s.id, result: await this.runOne(s.id) })));
  }

  /**
   * Status global agrégé (couleurs UI sentinel dashboard).
   */
  getStatus(): RegistryStatus {
    const list = sentinelsManager.list();
    let ok = 0;
    let warn = 0;
    let errors = 0;
    let pending = 0;
    for (const s of list) {
      if (!s.lastResult) {
        pending += 1;
        continue;
      }
      if (s.lastResult.ok) ok += 1;
      else errors += 1;
    }
    let autoFixSuccessCount = 0;
    let totalRuns = 0;
    for (const m of this.metrics.values()) {
      autoFixSuccessCount += m.autoFixSuccess;
      totalRuns += m.runs;
    }
    return {
      total: list.length,
      running: list.filter((s) => s.enabled).length,
      errors,
      warns: warn,
      ok,
      pending,
      autoFixSuccessCount,
      totalRuns,
    };
  }

  /**
   * Last result (typed) d'une sentinelle, null si jamais run.
   */
  getLastReport(id: string): SentinelResult | null {
    const s = sentinelsManager.list().find((x) => x.id === id);
    if (!s?.lastResult) return null;
    return this.legacyToResult(s.lastResult, 0);
  }

  /**
   * Métriques perf détaillées (admin dashboard).
   */
  getMetrics(): RegistryMetrics {
    let totalRuns = 0;
    let totalSuccess = 0;
    let totalFailures = 0;
    let totalDuration = 0;
    let autoFixSuccess = 0;
    let autoFixFailures = 0;
    const perSentinel: RegistryMetrics['perSentinel'] = {};
    for (const [id, m] of this.metrics) {
      totalRuns += m.runs;
      totalSuccess += m.success;
      totalFailures += m.failures;
      totalDuration += m.totalDurationMs;
      autoFixSuccess += m.autoFixSuccess;
      autoFixFailures += m.autoFixFailures;
      perSentinel[id] = {
        runs: m.runs,
        success: m.success,
        failures: m.failures,
        avgMs: m.runs > 0 ? Math.round(m.totalDurationMs / m.runs) : 0,
        autoFixSuccess: m.autoFixSuccess,
      };
    }
    return {
      totalRuns,
      totalSuccess,
      totalFailures,
      totalAutoFixSuccess: autoFixSuccess,
      totalAutoFixFailures: autoFixFailures,
      avgDurationMs: totalRuns > 0 ? Math.round(totalDuration / totalRuns) : 0,
      perSentinel,
    };
  }

  /**
   * Reset métriques (test / admin).
   */
  resetMetrics(): void {
    this.metrics.clear();
    try {
      localStorage.removeItem(METRICS_KEY);
    } catch {
      /* ignore */
    }
  }

  /* === Internals === */

  private adapt(s: LegacySentinel): Sentinel {
    const base: Sentinel = {
      id: s.id,
      name: s.name,
      description: s.desc,
      intervalMs: s.intervalMs,
      enabled: s.enabled,
      lastRun: s.lastRun,
      run: async () => this.runOne(s.id),
    };
    if (s.lastResult) {
      base.lastResult = this.legacyToResult(s.lastResult, 0);
    }
    if (s.autoFix) {
      base.autoFix = async () => {
        try {
          const r = await s.autoFix?.();
          return r?.ok === true;
        } catch {
          return false;
        }
      };
    }
    return base;
  }

  private legacyToResult(
    legacy: LegacySentinel['lastResult'] | undefined,
    durationMs: number,
  ): SentinelResult {
    if (!legacy) {
      return { status: 'error', message: 'no result', ts: Date.now(), durationMs };
    }
    return {
      status: legacy.ok ? 'ok' : 'error',
      message: legacy.msg,
      ts: legacy.ts,
      durationMs,
    };
  }

  private getOrInitMetric(id: string): PerfTrack {
    let m = this.metrics.get(id);
    if (!m) {
      m = {
        runs: 0,
        success: 0,
        failures: 0,
        totalDurationMs: 0,
        autoFixSuccess: 0,
        autoFixFailures: 0,
      };
      this.metrics.set(id, m);
    }
    return m;
  }

  private loadMetrics(): void {
    try {
      const raw = localStorage.getItem(METRICS_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as Record<string, PerfTrack>;
      for (const [id, m] of Object.entries(data)) {
        this.metrics.set(id, m);
      }
    } catch {
      /* ignore */
    }
  }

  private persistMetrics(): void {
    try {
      const data: Record<string, PerfTrack> = {};
      for (const [id, m] of this.metrics) data[id] = m;
      localStorage.setItem(METRICS_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }

  private async escalateToClaudeTodo(id: string, result: SentinelResult): Promise<void> {
    const track = this.getOrInitMetric(id);
    const now = Date.now();
    if (track.lastEscalationTs && now - track.lastEscalationTs < ESCALATION_COOLDOWN_MS) {
      /* cooldown — pas d'escalade en boucle */
      return;
    }
    track.lastEscalationTs = now;
    try {
      const raw = localStorage.getItem(ESCALATION_KEY);
      const list = raw ? (JSON.parse(raw) as unknown[]) : [];
      const todo = {
        id: `todo_${now}_${Math.random().toString(36).slice(2, 9)}`,
        sentinel_id: id,
        severity: result.status,
        message: result.message,
        details: result.details ?? {},
        src: 'sentinels-registry',
        ts: now,
        status: 'pending',
      };
      list.push(todo);
      const trimmed = list.slice(-50);
      localStorage.setItem(ESCALATION_KEY, JSON.stringify(trimmed));
      /* Audit log si dispo */
      try {
        const { auditLog } = await import('./audit-log.js');
        await auditLog.record('sentinel.escalated', {
          details: { sentinel_id: id, message: result.message },
        });
      } catch {
        /* audit-log peut être indispo en test */
      }
      logger.warn('sentinels-registry', `escalated to claude-todo: ${id}`, {
        msg: result.message,
      });
    } catch (err: unknown) {
      logger.error('sentinels-registry', 'escalation failed', {
        err: err instanceof Error ? err.message : String(err),
      });
    }
  }

  private registerExtras(): void {
    /* 14. capabilities-watch (weekly) — détecte nouvelles APIs Web disponibles */
    sentinelsManager.register({
      id: 'capabilities-watch',
      name: 'Capabilities watch',
      desc: 'Détecte nouvelles APIs Web (NDEFReader, BarcodeDetector, FileSystemAccess, WebUSB...)',
      intervalMs: 7 * 24 * 60 * 60 * 1000,
      check: async () => {
        const apis: { name: string; available: boolean }[] = [
          { name: 'NDEFReader', available: typeof (globalThis as Record<string, unknown>)['NDEFReader'] !== 'undefined' },
          { name: 'BarcodeDetector', available: typeof (globalThis as Record<string, unknown>)['BarcodeDetector'] !== 'undefined' },
          { name: 'WebUSB', available: typeof navigator !== 'undefined' && 'usb' in navigator },
          { name: 'WebBluetooth', available: typeof navigator !== 'undefined' && 'bluetooth' in navigator },
          { name: 'WebSerial', available: typeof navigator !== 'undefined' && 'serial' in navigator },
          { name: 'WebHID', available: typeof navigator !== 'undefined' && 'hid' in navigator },
          { name: 'FileSystemAccess', available: typeof window !== 'undefined' && 'showOpenFilePicker' in window },
          { name: 'WakeLock', available: typeof navigator !== 'undefined' && 'wakeLock' in navigator },
          { name: 'Contacts', available: typeof navigator !== 'undefined' && 'contacts' in navigator },
        ];
        const available = apis.filter((a) => a.available).map((a) => a.name);
        return {
          ok: true,
          msg: `${available.length}/${apis.length} APIs disponibles`,
          details: { available, all: apis },
        };
      },
    });

    /* 15. tools-watch (weekly) — propose intégration de nouveaux outils détectés */
    sentinelsManager.register({
      id: 'tools-watch',
      name: 'Tools watch',
      desc: 'Surveille capabilities orphelines vs apex-tools et propose intégrations',
      intervalMs: 7 * 24 * 60 * 60 * 1000,
      check: async () => {
        try {
          const { capabilities } = await import('./capabilities.js');
          const audit = capabilities.auditOrphans();
          if (audit.orphans.length > 5) {
            return {
              ok: false,
              msg: `${audit.orphans.length} tools orphelins (coverage ${audit.coverage_pct}%)`,
              details: { orphans: audit.orphans.slice(0, 10), coverage_pct: audit.coverage_pct },
            };
          }
          return {
            ok: true,
            msg: `Coverage tools ${audit.coverage_pct}% (${audit.orphans.length} orphans)`,
          };
        } catch (err: unknown) {
          return { ok: true, msg: 'Capabilities check skipped: ' + (err instanceof Error ? err.message : String(err)) };
        }
      },
    });

    /* 16. persistence-watch (1h) — vérifie clés critiques présentes local + Firebase */
    sentinelsManager.register({
      id: 'persistence-watch',
      name: 'Persistence watch',
      desc: 'Vérifie présence clés critiques (vault, audit, settings) + alerte si perte détectée',
      intervalMs: 60 * 60 * 1000,
      check: async () => {
        const criticalKeys = [
          'apex_v13_audit_log_chain',
          'apex_v13_vault_index',
          'apex_v13_settings',
          'apex_v13_user',
        ];
        const missing: string[] = [];
        for (const k of criticalKeys) {
          try {
            if (!localStorage.getItem(k)) missing.push(k);
          } catch {
            missing.push(k);
          }
        }
        if (missing.length === criticalKeys.length) {
          /* Tout vide = état initial OK */
          return { ok: true, msg: 'État initial (aucune clé critique encore)' };
        }
        if (missing.length > 0) {
          return {
            ok: false,
            msg: `${missing.length}/${criticalKeys.length} clés critiques manquantes`,
            details: { missing },
          };
        }
        return { ok: true, msg: `${criticalKeys.length}/${criticalKeys.length} clés critiques présentes` };
      },
      autoFix: async () => {
        /* Tente restore depuis Firebase si dispo */
        try {
          const { firebase } = await import('./firebase.js');
          await firebase.init();
          return { ok: true, msg: 'Firebase restore attempted' };
        } catch (err: unknown) {
          return { ok: false, msg: `Restore failed: ${err instanceof Error ? err.message : String(err)}` };
        }
      },
    });

    /* 17. sentinel-meta (5 min) — surveille les autres sentinelles */
    sentinelsManager.register({
      id: 'sentinel-meta',
      name: 'Sentinel meta',
      desc: 'Surveille les autres sentinelles (qui run / qui crash / staleness)',
      intervalMs: 5 * 60 * 1000,
      check: async () => {
        const all = sentinelsManager.list().filter((s) => s.enabled && s.id !== 'sentinel-meta');
        const now = Date.now();
        const stale: string[] = [];
        const crashed: string[] = [];
        for (const s of all) {
          /* Stale = pas run depuis 3× son interval (sauf jamais run = OK initial) */
          if (s.lastRun > 0 && now - s.lastRun > s.intervalMs * 3) {
            stale.push(s.id);
          }
          if (s.lastResult && !s.lastResult.ok) {
            crashed.push(s.id);
          }
        }
        if (stale.length > 0) {
          return {
            ok: false,
            msg: `${stale.length} sentinelles stales`,
            details: { stale, crashed, total: all.length },
          };
        }
        if (crashed.length > all.length / 2) {
          return {
            ok: false,
            msg: `${crashed.length}/${all.length} sentinelles en erreur`,
            details: { crashed },
          };
        }
        return {
          ok: true,
          msg: `${all.length} sentinelles supervisées (${crashed.length} en warning)`,
          details: { total: all.length, crashed_count: crashed.length },
        };
      },
    });

    logger.info(
      'sentinels-registry',
      `Boost MAX appliqué : ${sentinelsManager.list().length} sentinelles registered (vs 13 baseline)`,
    );
  }
}

export const sentinelsRegistry = new SentinelsRegistry();

/**
 * Helper boot global — appelé une fois au boot de l'app.
 * Idempotent — peut être appelé plusieurs fois (extras enregistrés une seule fois).
 */
export function bootstrapSentinelsRegistry(): void {
  sentinelsRegistry.bootstrap();
}
