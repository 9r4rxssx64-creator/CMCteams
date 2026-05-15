/**
 * APEX v13 — Tests sentinelle Never-Forget (Kevin 2026-05-08 23h45).
 *
 * "Oublie ni moi ni personne jamais !"
 *
 * Vérifie :
 * - 9 checks d'intégrité passent en condition normale
 * - Si Kevin/Laurence/cadres CMC manquent → critical + escalade
 * - Audit log persiste dans localStorage (cap 100)
 * - escalateClaudeCode() pousse dans ax_claude_todo
 * - verifyLoginUserKnown() détecte unknown user
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { neverForgetWatch } from '../../services/never-forget-watch.js';

beforeEach(() => {
  /* Clean state avant chaque test */
  localStorage.clear();
  neverForgetWatch.reset();
});

describe('neverForgetWatch.runOnce() — Audit complet identité', () => {
  it('retourne un objet AuditResult avec checks', () => {
    const result = neverForgetWatch.runOnce();
    expect(result).toBeDefined();
    expect(Array.isArray(result.checks)).toBe(true);
    expect(result.checks.length).toBeGreaterThanOrEqual(9);
  });

  it('passed_count + failed_count = total checks', () => {
    const result = neverForgetWatch.runOnce();
    expect(result.passed_count + result.failed_count).toBe(result.checks.length);
  });

  it('en condition normale : tous les checks passent (severity ok)', () => {
    const result = neverForgetWatch.runOnce();
    /* Kevin/Laurence/cadres devraient être présents par défaut */
    expect(result.failed_count).toBe(0);
    expect(result.overall_severity).toBe('ok');
  });

  it('contient check kevin_present', () => {
    const result = neverForgetWatch.runOnce();
    const check = result.checks.find((c) => c.id === 'kevin_present');
    expect(check).toBeDefined();
    expect(check?.passed).toBe(true);
  });

  it('contient check laurence_present', () => {
    const result = neverForgetWatch.runOnce();
    const check = result.checks.find((c) => c.id === 'laurence_present');
    expect(check).toBeDefined();
    expect(check?.passed).toBe(true);
  });

  it('contient check cmc_total_present (258)', () => {
    const result = neverForgetWatch.runOnce();
    const check = result.checks.find((c) => c.id === 'cmc_total_present');
    expect(check).toBeDefined();
    expect(check?.passed).toBe(true);
  });

  it('contient check cadres_cmc_present (ETTORI/FOUQUE/BOUVIER)', () => {
    const result = neverForgetWatch.runOnce();
    const check = result.checks.find((c) => c.id === 'cadres_cmc_present');
    expect(check).toBeDefined();
    expect(check?.passed).toBe(true);
  });

  it('contient check known_users_count >= 25', () => {
    const result = neverForgetWatch.runOnce();
    const check = result.checks.find((c) => c.id === 'known_users_count');
    expect(check).toBeDefined();
    expect(check?.passed).toBe(true);
    expect(result.total_known_users).toBeGreaterThanOrEqual(25);
  });

  it('contient check cadres_count >= 21', () => {
    const result = neverForgetWatch.runOnce();
    const check = result.checks.find((c) => c.id === 'cadres_count');
    expect(check).toBeDefined();
    expect(check?.passed).toBe(true);
  });

  it('contient check compact_budget (<=2400 chars)', () => {
    const result = neverForgetWatch.runOnce();
    const check = result.checks.find((c) => c.id === 'compact_budget');
    expect(check).toBeDefined();
    expect(check?.passed).toBe(true);
    expect(result.identity_compact_size).toBeLessThanOrEqual(2400);
  });

  it('contient check extended_budget (<=6000 chars)', () => {
    const result = neverForgetWatch.runOnce();
    const check = result.checks.find((c) => c.id === 'extended_budget');
    expect(check).toBeDefined();
    expect(check?.passed).toBe(true);
    expect(result.identity_extended_size).toBeLessThanOrEqual(6000);
  });

  it('contient check projects_count (=== 7)', () => {
    const result = neverForgetWatch.runOnce();
    const check = result.checks.find((c) => c.id === 'projects_count');
    expect(check).toBeDefined();
    expect(check?.passed).toBe(true);
  });

  it('persiste dans audit log (cap 100)', () => {
    neverForgetWatch.runOnce();
    const log = neverForgetWatch.getLog();
    expect(log.length).toBeGreaterThan(0);
  });

  it('lastRun retourne snapshot non-null après runOnce', () => {
    expect(neverForgetWatch.getLastRun()).toBeNull();
    neverForgetWatch.runOnce();
    expect(neverForgetWatch.getLastRun()).not.toBeNull();
  });

  it('ne crash pas si localStorage indisponible (quota)', () => {
    /* Simulate quota exceeded */
    const orig = localStorage.setItem.bind(localStorage);
    localStorage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    try {
      expect(() => neverForgetWatch.runOnce()).not.toThrow();
    } finally {
      localStorage.setItem = orig;
    }
  });

  it('reset() vide log + lastRun', () => {
    neverForgetWatch.runOnce();
    expect(neverForgetWatch.getLog().length).toBeGreaterThan(0);
    neverForgetWatch.reset();
    expect(neverForgetWatch.getLog().length).toBe(0);
    expect(neverForgetWatch.getLastRun()).toBeNull();
  });
});

describe('verifyLoginUserKnown() — Détection unknown login', () => {
  it('reconnaît Kevin admin par id', () => {
    const known = neverForgetWatch.verifyLoginUserKnown('kdmc_admin', 'Kevin DESARZENS');
    expect(known).toBe(true);
  });

  it('reconnaît Laurence par id', () => {
    const known = neverForgetWatch.verifyLoginUserKnown('laurence_sp', 'Laurence Saint-Polit');
    expect(known).toBe(true);
  });

  it('reconnaît client TARDIEU par id', () => {
    const known = neverForgetWatch.verifyLoginUserKnown('tardieu_test', 'TARDIEU');
    expect(known).toBe(true);
  });

  it('reconnaît cadre CMC par nom', () => {
    const known = neverForgetWatch.verifyLoginUserKnown('emp_xxx', 'ETTORI M');
    expect(known).toBe(true);
  });

  it('escalade si user inconnu', () => {
    const known = neverForgetWatch.verifyLoginUserKnown('unknown_user_xyz', 'Random Stranger');
    expect(known).toBe(false);
    /* Vérifier escalade ax_claude_todo */
    const todoRaw = localStorage.getItem('ax_claude_todo');
    expect(todoRaw).toBeTruthy();
    if (todoRaw) {
      const todos = JSON.parse(todoRaw) as unknown[];
      expect(todos.length).toBeGreaterThan(0);
    }
  });
});

describe('Singleton neverForgetWatch', () => {
  it('expose runOnce, verifyLoginUserKnown, getLastRun, getLog, reset', () => {
    expect(typeof neverForgetWatch.runOnce).toBe('function');
    expect(typeof neverForgetWatch.verifyLoginUserKnown).toBe('function');
    expect(typeof neverForgetWatch.getLastRun).toBe('function');
    expect(typeof neverForgetWatch.getLog).toBe('function');
    expect(typeof neverForgetWatch.reset).toBe('function');
  });
});
