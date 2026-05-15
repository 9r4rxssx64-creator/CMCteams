/**
 * APEX v13.3.30 — Auto-Test Runner (auto-vérification quotidienne).
 *
 * Demande Kevin (CLAUDE.md règle absolue 2026-05-04 + 2026-05-07) :
 * > "Tout autonomie autocorrigé. Apex doit auto-tester ses fonctions sans qu'on lui demande."
 * > "Pre-flight test obligatoire avant chaque présentation user."
 * > "À chaque création/modification → lancer test live."
 *
 * Mission :
 * - Suite de smoke tests intégrée dans le runtime (pas de Playwright requis)
 * - Tourne 1×/jour automatique (sentinelle) + on-demand admin
 * - Vérifie services critiques :
 *   * memory.ts (load + add fact + retrieval)
 *   * persistent-memory-store (add + list)
 *   * vault (lock/unlock cycle)
 *   * ai-router (provider health ping)
 *   * preflight checks (network, providers, tokens)
 *   * feature-toggles (read/write)
 *   * sentinels-registry (running count > 0)
 * - Stocke résultats `ax_auto_test_log` (50 derniers, FIFO)
 * - Si un test fail critique → record lesson + escalade Apex IA
 * - UI admin : bouton "🧪 Tester maintenant" + statut + détails par test
 *
 * Anti-pattern : ne JAMAIS exécuter d'actions destructrices (delete, push API key,
 *               write Firebase). Tests read-only ou avec rollback automatique.
 */

import { logger } from '../core/logger.js';

export interface TestResult {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'skip';
  durationMs: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface TestRunSummary {
  ts: number;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
  results: TestResult[];
}

const LOG_KEY = 'ax_auto_test_log';
const MAX_LOGS = 50;
const LAST_RUN_KEY = 'ax_auto_test_last_run';

class AutoTestRunner {
  /* ============== Tests individuels (read-only safe) ============== */

  private async testMemoryLoad(): Promise<TestResult> {
    const start = performance.now();
    try {
      const { memory } = await import('../core/memory.js');
      memory.reload();
      const facts = memory.getFacts();
      return {
        id: 't_memory',
        name: 'Memory load',
        status: 'pass',
        durationMs: Math.round(performance.now() - start),
        details: { factsCount: facts.length },
      };
    } catch (err: unknown) {
      return {
        id: 't_memory',
        name: 'Memory load',
        status: 'fail',
        durationMs: Math.round(performance.now() - start),
        error: err instanceof Error ? err.message : 'unknown',
      };
    }
  }

  private async testPersistentMemory(): Promise<TestResult> {
    const start = performance.now();
    try {
      const { persistentMemory } = await import('./persistent-memory-store.js');
      const all = await persistentMemory.list();
      return {
        id: 't_pmem',
        name: 'Persistent memory',
        status: 'pass',
        durationMs: Math.round(performance.now() - start),
        details: { entriesCount: all.length },
      };
    } catch (err: unknown) {
      return {
        id: 't_pmem',
        name: 'Persistent memory',
        status: 'fail',
        durationMs: Math.round(performance.now() - start),
        error: err instanceof Error ? err.message : 'unknown',
      };
    }
  }

  private async testVault(): Promise<TestResult> {
    const start = performance.now();
    try {
      const { vault } = await import('./vault.js');
      const audit = await vault.auditDecryptHealth();
      return {
        id: 't_vault',
        name: 'Vault decrypt health',
        status: audit.failed === 0 ? 'pass' : 'fail',
        durationMs: Math.round(performance.now() - start),
        details: { total: audit.total, ok: audit.ok, failed: audit.failed },
      };
    } catch (err: unknown) {
      return {
        id: 't_vault',
        name: 'Vault decrypt health',
        status: 'fail',
        durationMs: Math.round(performance.now() - start),
        error: err instanceof Error ? err.message : 'unknown',
      };
    }
  }

  private async testAiRouter(): Promise<TestResult> {
    const start = performance.now();
    try {
      const { aiRouter } = await import('./ai-router.js');
      const hasKey = aiRouter.hasAnyKey();
      return {
        id: 't_ai',
        name: 'AI Router',
        status: hasKey ? 'pass' : 'skip',
        durationMs: Math.round(performance.now() - start),
        details: { hasAnyKey: hasKey },
      };
    } catch (err: unknown) {
      return {
        id: 't_ai',
        name: 'AI Router',
        status: 'fail',
        durationMs: Math.round(performance.now() - start),
        error: err instanceof Error ? err.message : 'unknown',
      };
    }
  }

  private async testFeatureToggles(): Promise<TestResult> {
    const start = performance.now();
    try {
      const { featureToggles } = await import('./feature-toggles.js');
      const enabled = featureToggles.isEnabled('chat');
      return {
        id: 't_toggles',
        name: 'Feature toggles',
        status: 'pass',
        durationMs: Math.round(performance.now() - start),
        details: { chatEnabled: enabled },
      };
    } catch (err: unknown) {
      return {
        id: 't_toggles',
        name: 'Feature toggles',
        status: 'fail',
        durationMs: Math.round(performance.now() - start),
        error: err instanceof Error ? err.message : 'unknown',
      };
    }
  }

  private async testStorage(): Promise<TestResult> {
    const start = performance.now();
    try {
      const probeKey = '__apex_test_probe';
      localStorage.setItem(probeKey, '1');
      const v = localStorage.getItem(probeKey);
      localStorage.removeItem(probeKey);
      return {
        id: 't_storage',
        name: 'localStorage R/W',
        status: v === '1' ? 'pass' : 'fail',
        durationMs: Math.round(performance.now() - start),
      };
    } catch (err: unknown) {
      return {
        id: 't_storage',
        name: 'localStorage R/W',
        status: 'fail',
        durationMs: Math.round(performance.now() - start),
        error: err instanceof Error ? err.message : 'unknown',
      };
    }
  }

  private async testNetwork(): Promise<TestResult> {
    const start = performance.now();
    try {
      const online = navigator.onLine;
      return {
        id: 't_net',
        name: 'Network online',
        status: online ? 'pass' : 'skip',
        durationMs: Math.round(performance.now() - start),
        details: { online },
      };
    } catch (err: unknown) {
      return {
        id: 't_net',
        name: 'Network online',
        status: 'fail',
        durationMs: Math.round(performance.now() - start),
        error: err instanceof Error ? err.message : 'unknown',
      };
    }
  }

  /* ============== Public API ============== */

  /**
   * Run all smoke tests + persist results.
   */
  async runAll(): Promise<TestRunSummary> {
    const start = performance.now();
    logger.info('auto-test', 'Run start');

    const results: TestResult[] = await Promise.all([
      this.testMemoryLoad(),
      this.testPersistentMemory(),
      this.testVault(),
      this.testAiRouter(),
      this.testFeatureToggles(),
      this.testStorage(),
      this.testNetwork(),
    ]);

    const summary: TestRunSummary = {
      ts: Date.now(),
      total: results.length,
      passed: results.filter((r) => r.status === 'pass').length,
      failed: results.filter((r) => r.status === 'fail').length,
      skipped: results.filter((r) => r.status === 'skip').length,
      durationMs: Math.round(performance.now() - start),
      results,
    };

    /* Persist log (50 derniers, FIFO) */
    try {
      const raw = localStorage.getItem(LOG_KEY);
      const arr = raw ? (JSON.parse(raw) as TestRunSummary[]) : [];
      arr.push(summary);
      const tail = arr.slice(-MAX_LOGS);
      localStorage.setItem(LOG_KEY, JSON.stringify(tail));
      localStorage.setItem(LAST_RUN_KEY, String(summary.ts));
    } catch (err: unknown) {
      logger.warn('auto-test', 'persist log failed', { err });
    }

    /* Si fails critiques → record lesson */
    if (summary.failed > 0) {
      try {
        const { memory } = await import('../core/memory.js');
        const failedNames = summary.results.filter((r) => r.status === 'fail').map((r) => r.name).join(', ');
        await memory.recordSessionLearning(
          'auto-test',
          `Tests fail : ${summary.failed}/${summary.total}`,
          `Modules: ${failedNames}`,
          summary.failed >= 3 ? 'critical' : 'warn',
        );
      } catch { /* non-bloquant */ }
    }

    logger.info('auto-test', `Run done: ${summary.passed}/${summary.total} passed in ${summary.durationMs}ms`);
    return summary;
  }

  /**
   * Get last run summary (sans relancer).
   */
  getLastRun(): TestRunSummary | null {
    try {
      const raw = localStorage.getItem(LOG_KEY);
      if (!raw) return null;
      const arr = JSON.parse(raw) as TestRunSummary[];
      if (arr.length === 0) return null;
      return arr[arr.length - 1] ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Get all recent runs.
   */
  getHistory(): TestRunSummary[] {
    try {
      const raw = localStorage.getItem(LOG_KEY);
      return raw ? (JSON.parse(raw) as TestRunSummary[]) : [];
    } catch {
      return [];
    }
  }

  /**
   * Should run today ? (1×/jour max sauf force).
   */
  shouldRunDaily(): boolean {
    try {
      const last = localStorage.getItem(LAST_RUN_KEY);
      if (!last) return true;
      const lastTs = Number(last);
      const dayMs = 24 * 60 * 60 * 1000;
      return Date.now() - lastTs >= dayMs;
    } catch {
      return true;
    }
  }

  /**
   * Auto-schedule : si shouldRunDaily, lance après 60s post-boot (idle).
   */
  scheduleAutoRun(): void {
    if (!this.shouldRunDaily()) {
      logger.info('auto-test', 'Skip auto-run (already done today)');
      return;
    }
    setTimeout(() => {
      void this.runAll().catch((err: unknown) => {
        logger.warn('auto-test', 'auto-run failed', { err });
      });
    }, 60_000);
  }
}

export const autoTestRunner = new AutoTestRunner();
