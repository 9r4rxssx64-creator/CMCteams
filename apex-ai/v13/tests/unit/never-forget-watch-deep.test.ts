/**
 * APEX v13 — Tests deep never-forget-watch.ts (push 67% → 95%+).
 *
 * Cible runOnce (9 checks), verifyLoginUserKnown, getLastRun, getLog,
 * reset, escalations (claudeCode + unknownLogin), notifyAdmin via toast.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../core/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), debug: vi.fn(), error: vi.fn() },
}));

const buildIdentitySectionMock = vi.fn();
const buildExtendedIdentitySectionMock = vi.fn();
const listAllKnownUsersMock = vi.fn();

vi.mock('../../core/apex-identity.js', () => ({
  APEX_IDENTITY: {
    employees_cmcteams: { cadres: [] as string[] },
    projects: [] as unknown[],
  },
  buildIdentitySection: () => buildIdentitySectionMock(),
  buildExtendedIdentitySection: () => buildExtendedIdentitySectionMock(),
  listAllKnownUsers: () => listAllKnownUsersMock(),
}));

import { APEX_IDENTITY } from '../../core/apex-identity.js';
import { neverForgetWatch } from '../../services/never-forget-watch.js';

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  neverForgetWatch.reset();
  /* Set défauts sains : full passing identity */
  buildIdentitySectionMock.mockReturnValue(
    'Identity: Kevin DESARZENS, Laurence Saint-Polit ❤️, 258 employés CMC',
  );
  buildExtendedIdentitySectionMock.mockReturnValue(
    'Extended: ETTORI M, FOUQUE V, BOUVIER JF, et autres cadres',
  );
  listAllKnownUsersMock.mockReturnValue(
    Array.from({ length: 30 }, (_, i) => ({ id: `u${i}`, name: `User ${i}` })),
  );
  (APEX_IDENTITY as unknown as { employees_cmcteams: { cadres: string[] } }).employees_cmcteams.cadres =
    Array.from({ length: 25 }, (_, i) => `cadre${i}`);
  (APEX_IDENTITY as unknown as { projects: unknown[] }).projects =
    Array.from({ length: 7 }, (_, i) => ({ id: i }));
});

afterEach(() => {
  localStorage.clear();
});

describe('never-forget-watch — runOnce all green', () => {
  it('toutes checks pass → severity=ok', () => {
    const r = neverForgetWatch.runOnce();
    expect(r.overall_severity).toBe('ok');
    expect(r.failed_count).toBe(0);
    expect(r.critical_count).toBe(0);
    expect(r.passed_count).toBeGreaterThan(0);
  });

  it('lastRun stocké après runOnce', () => {
    neverForgetWatch.runOnce();
    expect(neverForgetWatch.getLastRun()).not.toBeNull();
  });

  it('runOnce persiste audit log', () => {
    neverForgetWatch.runOnce();
    expect(localStorage.getItem('ax_never_forget_audit_log')).not.toBeNull();
  });
});

describe('never-forget-watch — runOnce identity fails', () => {
  it('Kevin absent → check kevin_present fail + severity critical', () => {
    buildIdentitySectionMock.mockReturnValue('Identity: Laurence Saint-Polit ❤️, 258 employés');
    const r = neverForgetWatch.runOnce();
    expect(r.overall_severity).toBe('critical');
    expect(r.critical_count).toBeGreaterThan(0);
    expect(r.checks.find((c) => c.id === 'kevin_present')?.passed).toBe(false);
  });

  it('Laurence absente → check laurence_present fail', () => {
    buildIdentitySectionMock.mockReturnValue('Identity: Kevin DESARZENS, 258 employés');
    const r = neverForgetWatch.runOnce();
    expect(r.checks.find((c) => c.id === 'laurence_present')?.passed).toBe(false);
    expect(r.overall_severity).toBe('critical');
  });

  it('Laurence sans ❤️ → fail', () => {
    buildIdentitySectionMock.mockReturnValue(
      'Identity: Kevin DESARZENS, Laurence Saint-Polit (sans coeur), 258 employés',
    );
    const r = neverForgetWatch.runOnce();
    expect(r.checks.find((c) => c.id === 'laurence_present')?.passed).toBe(false);
  });

  it('258 absent → warn', () => {
    buildIdentitySectionMock.mockReturnValue(
      'Identity: Kevin DESARZENS, Laurence Saint-Polit ❤️',
    );
    const r = neverForgetWatch.runOnce();
    expect(r.checks.find((c) => c.id === 'cmc_total_present')?.passed).toBe(false);
  });

  it('cadres absents → warn + details listent manquants', () => {
    buildExtendedIdentitySectionMock.mockReturnValue('Extended: ETTORI M et FOUQUE V');
    const r = neverForgetWatch.runOnce();
    const cadres = r.checks.find((c) => c.id === 'cadres_cmc_present');
    expect(cadres?.passed).toBe(false);
    expect(cadres?.details).toContain('BOUVIER JF');
  });
});

describe('never-forget-watch — runOnce budget checks', () => {
  it('compact section trop grosse (>2400 chars) → check compact_budget fail', () => {
    buildIdentitySectionMock.mockReturnValue(
      'Kevin DESARZENS Laurence Saint-Polit ❤️ 258 ' + 'X'.repeat(3000),
    );
    const r = neverForgetWatch.runOnce();
    expect(r.checks.find((c) => c.id === 'compact_budget')?.passed).toBe(false);
  });

  it('extended section trop grosse (>6000 chars) → fail', () => {
    buildExtendedIdentitySectionMock.mockReturnValue(
      'ETTORI M FOUQUE V BOUVIER JF ' + 'X'.repeat(7000),
    );
    const r = neverForgetWatch.runOnce();
    expect(r.checks.find((c) => c.id === 'extended_budget')?.passed).toBe(false);
  });

  it('compact section vide → fail (size 0)', () => {
    buildIdentitySectionMock.mockReturnValue('');
    const r = neverForgetWatch.runOnce();
    expect(r.checks.find((c) => c.id === 'compact_budget')?.passed).toBe(false);
  });
});

describe('never-forget-watch — runOnce count checks', () => {
  it('< 25 known users → warn known_users_count', () => {
    listAllKnownUsersMock.mockReturnValue(
      Array.from({ length: 10 }, (_, i) => ({ id: `u${i}`, name: `U${i}` })),
    );
    const r = neverForgetWatch.runOnce();
    expect(r.checks.find((c) => c.id === 'known_users_count')?.passed).toBe(false);
  });

  it('< 21 cadres → warn', () => {
    (APEX_IDENTITY as unknown as { employees_cmcteams: { cadres: string[] } }).employees_cmcteams.cadres = Array.from({ length: 10 }, (_, i) => `c${i}`);
    const r = neverForgetWatch.runOnce();
    expect(r.checks.find((c) => c.id === 'cadres_count')?.passed).toBe(false);
  });

  it('projets != 7 → warn', () => {
    (APEX_IDENTITY as unknown as { projects: unknown[] }).projects = [{ id: 1 }, { id: 2 }];
    const r = neverForgetWatch.runOnce();
    expect(r.checks.find((c) => c.id === 'projects_count')?.passed).toBe(false);
  });
});

describe('never-forget-watch — runOnce exception handling', () => {
  it('buildIdentitySection throw → check identity_compact_buildable fail critical', () => {
    buildIdentitySectionMock.mockImplementationOnce(() => {
      throw new Error('Boom');
    });
    const r = neverForgetWatch.runOnce();
    expect(r.checks.find((c) => c.id === 'identity_compact_buildable')?.passed).toBe(false);
    expect(r.overall_severity).toBe('critical');
  });

  it('buildExtended throw → identity_extended_buildable critical', () => {
    buildExtendedIdentitySectionMock.mockImplementationOnce(() => {
      throw new Error('X');
    });
    const r = neverForgetWatch.runOnce();
    expect(r.checks.find((c) => c.id === 'identity_extended_buildable')?.passed).toBe(false);
  });

  it('listAllKnownUsers throw → known_users_listable critical', () => {
    listAllKnownUsersMock.mockImplementationOnce(() => {
      throw new Error('Y');
    });
    const r = neverForgetWatch.runOnce();
    expect(r.checks.find((c) => c.id === 'known_users_listable')?.passed).toBe(false);
  });
});

describe('never-forget-watch — verifyLoginUserKnown', () => {
  it('uid existe → true', () => {
    listAllKnownUsersMock.mockReturnValue([
      { id: 'kdmc_admin', name: 'Kevin DESARZENS' },
      { id: 'laurence_sp', name: 'Laurence Saint-Polit' },
    ]);
    expect(neverForgetWatch.verifyLoginUserKnown('kdmc_admin', 'Kevin')).toBe(true);
  });

  it('uid manquant mais nom match exact → true', () => {
    listAllKnownUsersMock.mockReturnValue([
      { id: 'k1', name: 'Kevin DESARZENS' },
    ]);
    expect(neverForgetWatch.verifyLoginUserKnown('nope', 'Kevin DESARZENS')).toBe(true);
  });

  it('nom partial match (substring) → true', () => {
    listAllKnownUsersMock.mockReturnValue([{ id: 'k1', name: 'Kevin DESARZENS' }]);
    expect(neverForgetWatch.verifyLoginUserKnown('nope', 'Kevin')).toBe(true);
  });

  it('inconnu → false + escalade unknown_login dans ax_claude_todo', () => {
    listAllKnownUsersMock.mockReturnValue([{ id: 'k', name: 'Kevin' }]);
    expect(neverForgetWatch.verifyLoginUserKnown('xyz', 'Alien Person')).toBe(false);
    const todos = JSON.parse(localStorage.getItem('ax_claude_todo') ?? '[]');
    expect(todos.some((t: { id: string }) => t.id?.startsWith('unknown_login_'))).toBe(true);
  });

  it('listAllKnownUsers throw → false sans crash', () => {
    listAllKnownUsersMock.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    expect(neverForgetWatch.verifyLoginUserKnown('x', 'Y')).toBe(false);
  });
});

describe('never-forget-watch — getLog', () => {
  it('vide → []', () => {
    expect(neverForgetWatch.getLog()).toHaveLength(0);
  });

  it('après runOnce → log non vide', () => {
    neverForgetWatch.runOnce();
    expect(neverForgetWatch.getLog().length).toBeGreaterThan(0);
  });

  it('JSON corrompu → []', () => {
    localStorage.setItem('ax_never_forget_audit_log', 'not json');
    expect(neverForgetWatch.getLog()).toHaveLength(0);
  });

  it('non array → []', () => {
    localStorage.setItem('ax_never_forget_audit_log', '{"not":"array"}');
    expect(neverForgetWatch.getLog()).toHaveLength(0);
  });

  it('log cap 100 entries', () => {
    /* Pre-fill avec 110 entries */
    const big = Array.from({ length: 110 }, (_, i) => ({ ts: i }));
    localStorage.setItem('ax_never_forget_audit_log', JSON.stringify(big));
    neverForgetWatch.runOnce();
    const log = neverForgetWatch.getLog();
    expect(log.length).toBeLessThanOrEqual(100);
  });
});

describe('never-forget-watch — escalation Claude Code', () => {
  it('critical → todo ajouté avec source=never-forget-watch', () => {
    buildIdentitySectionMock.mockReturnValue('vide sans Kevin');
    neverForgetWatch.runOnce();
    const todos = JSON.parse(localStorage.getItem('ax_claude_todo') ?? '[]');
    const todo = todos.find((t: { id?: string }) => t.id?.startsWith('never_forget_'));
    expect(todo).toBeDefined();
    expect(todo.context.source).toBe('never-forget-watch');
    expect(todo.severity).toBe('critical');
  });

  it('todo cap 50 entries', () => {
    /* Pre-fill avec 55 todos */
    const big = Array.from({ length: 55 }, (_, i) => ({ id: `t${i}` }));
    localStorage.setItem('ax_claude_todo', JSON.stringify(big));
    buildIdentitySectionMock.mockReturnValue('vide');
    neverForgetWatch.runOnce();
    const todos = JSON.parse(localStorage.getItem('ax_claude_todo') ?? '[]');
    expect(todos.length).toBeLessThanOrEqual(50);
  });
});

describe('never-forget-watch — notifyAdmin via toast', () => {
  it('si window.toast disponible → toast appelé sur fail', () => {
    const toastSpy = vi.fn();
    (globalThis as unknown as { toast: typeof toastSpy }).toast = toastSpy;
    buildIdentitySectionMock.mockReturnValue('vide');
    neverForgetWatch.runOnce();
    expect(toastSpy).toHaveBeenCalled();
    delete (globalThis as unknown as { toast?: typeof toastSpy }).toast;
  });

  it('toast pas dispo → pas de throw', () => {
    delete (globalThis as unknown as { toast?: unknown }).toast;
    buildIdentitySectionMock.mockReturnValue('vide');
    expect(() => neverForgetWatch.runOnce()).not.toThrow();
  });
});

describe('never-forget-watch — reset', () => {
  it('reset clear lastRun + log', () => {
    neverForgetWatch.runOnce();
    expect(neverForgetWatch.getLastRun()).not.toBeNull();
    neverForgetWatch.reset();
    expect(neverForgetWatch.getLastRun()).toBeNull();
    expect(localStorage.getItem('ax_never_forget_audit_log')).toBeNull();
  });
});
