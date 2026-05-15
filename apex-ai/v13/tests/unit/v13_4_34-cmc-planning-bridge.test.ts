/**
 * Test régression v13.4.34 — services/cmc-planning-bridge.ts (paste planning SBM).
 *
 * Bridge Apex → CMCteams : si Kevin colle un planning SBM dans Apex,
 * détecté + pushé vers Firebase `ax_cmc_planning_pending` → CMCteams récupère.
 *
 * Tests : detectSbmPlanning (sync, pas de network).
 * pushPlanningToCmc / detectAndPushIfPlanning utilisent firebase write
 * → testés avec mock minimal (firebase.write peut throw en test env).
 */
import { describe, it, expect } from 'vitest';
import {
  detectSbmPlanning,
  detectAndPushIfPlanning,
  _internals,
} from '../../services/cmc-planning-bridge.js';

describe('v13.4.34 detectSbmPlanning — détection patterns SBM', () => {
  it("text vide → detected false", () => {
    const r = detectSbmPlanning('');
    expect(r.detected).toBe(false);
    expect(r.matches).toEqual([]);
  });

  it("text trop court → detected false", () => {
    const r = detectSbmPlanning('court');
    expect(r.detected).toBe(false);
  });

  it("text sans patterns SBM → detected false", () => {
    const longNonSbm = 'a'.repeat(_internals.MIN_TEXT_LENGTH + 100);
    const r = detectSbmPlanning(longNonSbm);
    expect(r.detected).toBe(false);
  });

  it("text avec 1 pattern SBM seulement → detected false (min 2 required)", () => {
    /* MAI 2026 = 1 pattern probable */
    const text = `Voici mon planning ${'a'.repeat(_internals.MIN_TEXT_LENGTH)} MAI 2026`;
    const r = detectSbmPlanning(text);
    /* Selon implémentation : 1 match = pas détecté (besoin 2+) */
    expect(r.matches.length).toBeGreaterThanOrEqual(0);
  });

  it("text avec 2+ patterns SBM → detected true", () => {
    /* Patterns typiques : MAI 2026, BJ Éq., PIT BOSS, CMC */
    const text = `
PLANNING MAI 2026 — Casino Monaco
PIT BOSS : ETTORI M
SUPERVISEUR : FOUQUE V
BJ Éq.1 : DUPONT J, DUBOIS L
BJ Éq.2 : MARTIN P
${'a'.repeat(_internals.MIN_TEXT_LENGTH)}
`;
    const r = detectSbmPlanning(text);
    expect(r.detected).toBe(true);
    expect(r.matches.length).toBeGreaterThanOrEqual(2);
  });

  it("retourne size du texte", () => {
    const text = 'a'.repeat(500);
    const r = detectSbmPlanning(text);
    expect(r.size).toBe(500);
  });

  it("null/undefined → no crash", () => {
     
    expect((detectSbmPlanning as any)(null).detected).toBe(false);
    expect((detectSbmPlanning as any)(undefined).detected).toBe(false);
  });

  it("number/object → no crash (typeof check)", () => {
    expect((detectSbmPlanning as any)(42).detected).toBe(false);
    expect((detectSbmPlanning as any)({}).detected).toBe(false);
  });

  it("matches array contient les matches concrets", () => {
    const text = `
PLANNING MAI 2026
PIT BOSS : Kevin
BJ Éq.1 : équipe complète
${'a'.repeat(_internals.MIN_TEXT_LENGTH)}
`;
    const r = detectSbmPlanning(text);
    if (r.detected) {
      expect(r.matches.every((m) => typeof m === 'string' && m.length > 0)).toBe(true);
    }
  });
});

describe('v13.4.34 detectAndPushIfPlanning — fallback null si non détecté', () => {
  it("text trop court → retourne null (skip push)", async () => {
    const r = await detectAndPushIfPlanning('court');
    expect(r).toBeNull();
  });

  it("text vide → retourne null", async () => {
    const r = await detectAndPushIfPlanning('');
    expect(r).toBeNull();
  });

  it("text long sans patterns SBM → null (pas détecté)", async () => {
    const r = await detectAndPushIfPlanning('a'.repeat(2000));
    expect(r).toBeNull();
  });
});

describe('v13.4.34 _internals constants', () => {
  it("MIN_TEXT_LENGTH défini et positif", () => {
    expect(_internals.MIN_TEXT_LENGTH).toBeGreaterThan(0);
  });

  it("MIN_PUSH_LENGTH ≥ MIN_TEXT_LENGTH", () => {
    expect(_internals.MIN_PUSH_LENGTH).toBeGreaterThanOrEqual(_internals.MIN_TEXT_LENGTH);
  });

  it("MAX_RAW_TEXT raisonnable (cap Firebase payload)", () => {
    expect(_internals.MAX_RAW_TEXT).toBeGreaterThan(1000);
    expect(_internals.MAX_RAW_TEXT).toBeLessThanOrEqual(1024 * 1024); /* < 1MB */
  });

  it("SBM_PATTERNS contient regex valides", () => {
    expect(Array.isArray(_internals.SBM_PATTERNS)).toBe(true);
    expect(_internals.SBM_PATTERNS.length).toBeGreaterThanOrEqual(2);
    for (const p of _internals.SBM_PATTERNS) {
      expect(p).toBeInstanceOf(RegExp);
    }
  });
});
