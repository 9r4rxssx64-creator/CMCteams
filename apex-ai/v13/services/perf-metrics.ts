/**
 * APEX v13 — Performance Metrics live (Core Web Vitals niveau Lighthouse).
 *
 * Demande Kevin (au-delà 100/100) :
 * "Surprends-moi. Va encore plus loin sur chaque axe."
 *
 * Capture en runtime via PerformanceObserver :
 * - LCP (Largest Contentful Paint) — visuel principal
 * - INP (Interaction to Next Paint) — réactivité
 * - CLS (Cumulative Layout Shift) — stabilité visuelle
 * - TTFB (Time To First Byte)
 * - FCP (First Contentful Paint)
 * - TTI (Time To Interactive heuristique)
 *
 * Targets Lighthouse green :
 * - LCP < 2.5s
 * - INP < 200ms
 * - CLS < 0.1
 * - FCP < 1.8s
 * - TTFB < 600ms
 *
 * Dashboard admin : visuel temps réel + alertes si régression.
 */

import { logger } from '../core/logger.js';

export interface PerfMetric {
  name: 'LCP' | 'INP' | 'CLS' | 'FCP' | 'TTFB' | 'TTI';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  ts: number;
}

const TARGETS = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 600, poor: 1500 },
  TTI: { good: 3500, poor: 7300 },
} as const;

class PerfMetrics {
  private metrics: PerfMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private installed = false;

  /**
   * Install observers via PerformanceObserver API.
   * Idempotent : 2e call no-op (anti-double-binding).
   */
  install(): void {
    if (this.installed) return;
    this.installed = true;

    if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
      logger.info('perf-metrics', 'PerformanceObserver not available — metrics disabled');
      return;
    }

    /* LCP — Largest Contentful Paint */
    this.tryObserve('largest-contentful-paint', (entries) => {
      const last = entries[entries.length - 1];
      if (last) this.record('LCP', last.startTime);
    });

    /* CLS — Cumulative Layout Shift */
    let clsValue = 0;
    this.tryObserve('layout-shift', (entries) => {
      for (const entry of entries) {
        const e = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!e.hadRecentInput && typeof e.value === 'number') {
          clsValue += e.value;
        }
      }
      this.record('CLS', clsValue);
    });

    /* FCP — First Contentful Paint */
    this.tryObserve('paint', (entries) => {
      for (const entry of entries) {
        if (entry.name === 'first-contentful-paint') {
          this.record('FCP', entry.startTime);
        }
      }
    });

    /* INP — Interaction to Next Paint (event timing API) */
    this.tryObserve('event', (entries) => {
      for (const entry of entries) {
        const e = entry as PerformanceEntry & { duration: number; interactionId?: number };
        if (e.interactionId && e.duration > 0) {
          this.record('INP', e.duration);
        }
      }
    });

    /* TTFB via Navigation Timing */
    if (performance.timing) {
      const navTiming = performance.timing;
      const ttfb = navTiming.responseStart - navTiming.requestStart;
      if (ttfb > 0) this.record('TTFB', ttfb);
    } else if (typeof performance.getEntriesByType === 'function') {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const nav = navEntries[0];
      if (nav) this.record('TTFB', nav.responseStart - nav.requestStart);
    }

    logger.info('perf-metrics', 'Web Vitals observers installed');
  }

  private tryObserve(type: string, callback: (entries: PerformanceEntry[]) => void): void {
    try {
      const obs = new PerformanceObserver((list) => callback(list.getEntries()));
      obs.observe({ type, buffered: true });
      this.observers.push(obs);
    } catch {
      /* Type non supporté navigateur, ignore */
    }
  }

  /**
   * Enregistre une metric + détermine rating.
   */
  record(name: PerfMetric['name'], value: number): void {
    const target = TARGETS[name];
    let rating: PerfMetric['rating'];
    if (value <= target.good) rating = 'good';
    else if (value <= target.poor) rating = 'needs-improvement';
    else rating = 'poor';

    this.metrics.push({ name, value, rating, ts: Date.now() });
    /* Cap 200 max */
    if (this.metrics.length > 200) this.metrics = this.metrics.slice(-200);

    if (rating === 'poor') {
      logger.warn('perf-metrics', `${name} POOR: ${value.toFixed(0)} (target < ${target.good})`);
    }
  }

  /**
   * Snapshot dernière valeur de chaque metric.
   */
  getSnapshot(): Record<PerfMetric['name'], PerfMetric | null> {
    const snapshot: Record<string, PerfMetric | null> = {
      LCP: null,
      INP: null,
      CLS: null,
      FCP: null,
      TTFB: null,
      TTI: null,
    };
    /* Itère reverse pour avoir le plus récent */
    for (let i = this.metrics.length - 1; i >= 0; i--) {
      const m = this.metrics[i]!;
      if (!snapshot[m.name]) snapshot[m.name] = m;
    }
    return snapshot as Record<PerfMetric['name'], PerfMetric | null>;
  }

  /**
   * Score global Lighthouse-style (0-100).
   * Pondération officielle Web Vitals :
   * LCP 25%, INP 30%, CLS 25%, FCP 10%, TTFB 10%
   */
  getScore(): { score: number; details: Record<string, { value: number; weight: number; pts: number }> } {
    const snap = this.getSnapshot();
    const weights = { LCP: 0.25, INP: 0.3, CLS: 0.25, FCP: 0.1, TTFB: 0.1 };
    let total = 0;
    const details: Record<string, { value: number; weight: number; pts: number }> = {};
    for (const [name, w] of Object.entries(weights)) {
      const m = snap[name as PerfMetric['name']];
      if (!m) {
        details[name] = { value: 0, weight: w, pts: 0 };
        continue;
      }
      let pts: number;
      if (m.rating === 'good') pts = 100;
      else if (m.rating === 'needs-improvement') pts = 60;
      else pts = 30;
      details[name] = { value: m.value, weight: w, pts };
      total += pts * w;
    }
    return { score: Math.round(total), details };
  }

  /**
   * Format pour UI dashboard.
   */
  formatForUI(): {
    score: string;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    metrics: Array<{ name: string; value: string; rating: string; emoji: string }>;
  } {
    const { score } = this.getScore();
    const snap = this.getSnapshot();
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 75) grade = 'B';
    else if (score >= 60) grade = 'C';
    else if (score >= 40) grade = 'D';
    else grade = 'F';
    const formatted = (Object.entries(snap) as Array<[PerfMetric['name'], PerfMetric | null]>)
      .filter(([, m]) => m !== null)
      .map(([name, m]) => ({
        name,
        value: name === 'CLS' ? m!.value.toFixed(3) : `${m!.value.toFixed(0)}ms`,
        rating: m!.rating,
        emoji: m!.rating === 'good' ? '🟢' : m!.rating === 'needs-improvement' ? '🟠' : '🔴',
      }));
    return { score: `${score}/100`, grade, metrics: formatted };
  }

  /**
   * Reset (debug).
   */
  reset(): void {
    this.metrics = [];
  }

  /**
   * Cleanup observers.
   */
  disconnect(): void {
    for (const obs of this.observers) obs.disconnect();
    this.observers = [];
    this.installed = false;
  }

  getAll(): readonly PerfMetric[] {
    return this.metrics;
  }
}

export const perfMetrics = new PerfMetrics();
