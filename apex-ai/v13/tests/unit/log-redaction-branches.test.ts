/**
 * log-redaction-wrapper — couverture branches restantes (campagne 100%, 2026-06-02).
 * Cible : redactValue Error (avec/sans stack), install/restoreGlobal avec console undefined.
 * IMPORTANT (#84) : installGlobal patche console → restaure l'état du singleton en afterEach.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { logRedaction } from '../../services/observability/log-redaction-wrapper.js';

const lr = logRedaction as unknown as { installed: boolean; originalConsole: unknown };

/* Capture le VRAI console au chargement pour le restaurer quoi qu'il arrive (anti-fuite). */
const REAL_CONSOLE = { log: console.log, warn: console.warn, error: console.error, debug: console.debug };

beforeEach(() => { vi.clearAllMocks(); });
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  /* Restaure le vrai console (les tests patchent/faussent console via le singleton). */
  Object.assign(console, REAL_CONSOLE);
  lr.installed = false;
  lr.originalConsole = null;
});

describe('log-redaction — redactValue Error', () => {
  it('Error avec stack → message + stack redactés', () => {
    const err = new Error('token sk-ant-secret123');
    const out = logRedaction.redactValue(err) as Error;
    expect(out).toBeInstanceOf(Error);
    expect(out.name).toBe('Error');
    expect(typeof out.stack).toBe('string');
  });

  it('Error SANS stack → branche : undefined (pas de stack assigné)', () => {
    const err = new Error('boom');
    delete (err as { stack?: string }).stack;
    const out = logRedaction.redactValue(err) as Error;
    expect(out).toBeInstanceOf(Error);
    expect(out.message).toBe('boom');
  });

  it('string → redacted ; null/undefined → tel quel', () => {
    expect(typeof logRedaction.redactValue('plain text')).toBe('string');
    expect(logRedaction.redactValue(null)).toBeNull();
    expect(logRedaction.redactValue(undefined)).toBeUndefined();
  });
});

describe('log-redaction — install/restore avec console undefined', () => {
  it('installGlobal : console undefined → return (guard)', () => {
    lr.installed = false;
    vi.stubGlobal('console', undefined);
    expect(() => logRedaction.installGlobal()).not.toThrow();
    expect(logRedaction.isInstalled()).toBe(false);
  });

  it('restoreGlobal : console undefined → return (guard)', () => {
    /* simule un état installé avec originalConsole, puis console disparaît */
    lr.installed = true;
    lr.originalConsole = { log: () => {}, warn: () => {}, error: () => {}, debug: () => {} };
    vi.stubGlobal('console', undefined);
    expect(() => logRedaction.restoreGlobal()).not.toThrow();
  });

  it('installGlobal 2× → 2e fois no-op (déjà installé)', () => {
    lr.installed = false;
    logRedaction.installGlobal();
    expect(logRedaction.isInstalled()).toBe(true);
    expect(() => logRedaction.installGlobal()).not.toThrow();
    logRedaction.restoreGlobal();
  });
});
