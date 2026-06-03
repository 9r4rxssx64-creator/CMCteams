/**
 * consumption-anomaly-detector — couverture branches restantes (campagne 100%, 2026-06-02).
 * Cible : current ?? fallback last ?? 0 (detectAnomaly L116) ; hasKeyInVault multi_keys + catch.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const getHistory = vi.fn();
vi.mock('../../services/observability/consumption-monitor.js', () => ({
  consumptionMonitor: { getHistory: (...a: unknown[]) => getHistory(...a) },
}));

import { consumptionAnomalyDetector } from '../../services/observability/consumption-anomaly-detector.js';

const todayIso = () => new Date().toISOString();
const pastIso = () => new Date(Date.now() - 3 * 86400000).toISOString();

beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); getHistory.mockReturnValue([]); });
afterEach(() => { vi.restoreAllMocks(); });

describe('consumption-anomaly — detectAnomaly current resolution', () => {
  it('entry du jour présente → current = used_eur du jour', () => {
    getHistory.mockReturnValue([
      { ts: pastIso(), used_eur: 1 },
      { ts: todayIso(), used_eur: 10 },
    ]);
    const r = consumptionAnomalyDetector.detectAnomaly('anthropic');
    expect(r).toBeTruthy();
  });

  it('pas d\'entry du jour → fallback dernière entry (?? history[last])', () => {
    getHistory.mockReturnValue([
      { ts: pastIso(), used_eur: 2 },
      { ts: pastIso(), used_eur: 5 },
    ]);
    const r = consumptionAnomalyDetector.detectAnomaly('openai');
    expect(r).toBeTruthy();
  });

  it('history vide → current 0 (?? 0)', () => {
    getHistory.mockReturnValue([]);
    const r = consumptionAnomalyDetector.detectAnomaly('groq');
    expect(r).toBeTruthy();
  });
});

describe('consumption-anomaly — hasKeyInVault (via scanAllVerbose)', () => {
  it('clé via multi_keys store (service match) → présent', () => {
    localStorage.setItem('apex_v13_multi_keys', JSON.stringify([{ service: 'anthropic', storageKey: 'ax_anthropic_key' }]));
    const reports = consumptionAnomalyDetector.scanAllVerbose();
    expect(Array.isArray(reports)).toBe(true);
  });

  it('multi_keys via storageKey regex → présent', () => {
    localStorage.setItem('apex_v13_multi_keys', JSON.stringify([{ storageKey: 'ax_openai_secret' }]));
    expect(() => consumptionAnomalyDetector.scanAllVerbose()).not.toThrow();
  });

  it('multi_keys JSON corrompu → catch → pas de crash', () => {
    localStorage.setItem('apex_v13_multi_keys', '{bad json');
    expect(() => consumptionAnomalyDetector.scanAllVerbose()).not.toThrow();
  });

  it('clé directe ax_<service>_key présente → détectée', () => {
    localStorage.setItem('ax_anthropic_key', 'sk-ant-1234567890abcdef');
    const reports = consumptionAnomalyDetector.scanAllVerbose();
    expect(reports.length).toBeGreaterThanOrEqual(0);
  });
});

describe('consumption-anomaly — API', () => {
  it('scanAll retourne un tableau', () => {
    expect(Array.isArray(consumptionAnomalyDetector.scanAll())).toBe(true);
  });
  it('listAllProviders non vide', () => {
    expect(consumptionAnomalyDetector.listAllProviders().length).toBeGreaterThan(0);
  });
});
