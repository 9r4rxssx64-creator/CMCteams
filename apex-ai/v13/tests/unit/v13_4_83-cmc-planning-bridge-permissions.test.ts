/**
 * Test régression v13.4.83 — cmc-planning-bridge permission tier-aware
 * "vérifie tout en détail pour tout le monde" (Kevin 2026-05-14 23:10).
 *
 * Patterns SBM enrichis (PDF Pit Boss / titre PLANNING / téléphones internes /
 * légendes CCDP+POKER) + permission guard admin-only sur pushPlanningToCmc.
 *
 * Vérifie pour TOUS les tiers : admin Kevin / laurence / family / client_pro
 * / client_free → seul Kevin admin peut push planning vers CMC.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  detectSbmPlanning,
  pushPlanningToCmc,
  detectAndPushIfPlanning,
  _internals,
} from '../../services/cmc-planning-bridge.js';
import { store } from '../../core/store.js';

const REAL_SBM_PIT_BOSS_TEXT = `
3 PLANNING PIT BOSS Pit Boss 15 mai 2026
62224/62056 JANEL JM 1 31 22/6 16/20 12h30/19 RH R 22/6 19/4' 15/19 RH R
62224/62056 GARELLI C * 1 31 16/20 12h30/19 RH R 22/6 19/4: 15/19 RH R
62224/62056 PETIT J 1 31 12h30/19 RH R 22/6 19/4' 15/19 RH R
SUPERVISEUR
62224/62056 ETTORI M. 1 31 19/4: 15/19 RH R 22/6: 19/4: 16/20 12h30/19
LEGENDE 19/4 CCDP 22/6 CMC 16/20 CMC 15/20 POKER NO LIMIT
`;

const FAKE_NON_PLANNING_TEXT = `
Bonjour Apex, peux-tu me donner la météo ?
Je voudrais savoir si la pluie est prévue cette semaine pour notre voyage.
Aussi, peux-tu vérifier l'agenda du mois prochain pour Laurence ?
`;

describe('v13.4.83 cmc-planning-bridge — detectSbmPlanning patterns enrichis', () => {
  it("Texte vide → detected=false", () => {
    expect(detectSbmPlanning('').detected).toBe(false);
  });

  it("Texte trop court (< 200 chars) → detected=false", () => {
    expect(detectSbmPlanning('PIT BOSS mai 2026').detected).toBe(false);
  });

  it("Texte non-planning long → detected=false (pas de patterns)", () => {
    const long = FAKE_NON_PLANNING_TEXT.repeat(20);
    expect(detectSbmPlanning(long).detected).toBe(false);
  });

  it("PDF SBM Pit Boss réel (screenshot Kevin) → detected=true", () => {
    const r = detectSbmPlanning(REAL_SBM_PIT_BOSS_TEXT.repeat(3));
    expect(r.detected).toBe(true);
    expect(r.matches.length).toBeGreaterThanOrEqual(2);
  });

  it("Pattern 'PLANNING PIT BOSS' (titre PDF) matche", () => {
    const tx = ('PLANNING PIT BOSS mai 2026 ' + 'x'.repeat(300));
    const r = detectSbmPlanning(tx);
    expect(r.matches.some((m) => /PLANNING/i.test(m))).toBe(true);
  });

  it("Pattern téléphones internes '62224/62056' matche", () => {
    const tx = ('mai 2026 62224/62056 JANEL JM 22/6 RH R ' + 'x'.repeat(300));
    const r = detectSbmPlanning(tx);
    expect(r.matches.some((m) => /62224/.test(m))).toBe(true);
  });

  it("Pattern 'CCDP' légende matche", () => {
    const tx = ('mai 2026 19/4 CCDP 22/6 CMC ' + 'x'.repeat(300));
    const r = detectSbmPlanning(tx);
    expect(r.matches.some((m) => /CCDP/i.test(m))).toBe(true);
  });

  it("Pattern 'POKER NO LIMIT' matche", () => {
    const tx = ('mai 2026 15/20 POKER NO LIMIT ' + 'x'.repeat(300));
    const r = detectSbmPlanning(tx);
    expect(r.matches.some((m) => /POKER\s+NO\s+LIMIT/i.test(m))).toBe(true);
  });
});

describe('v13.4.83 cmc-planning-bridge — pushPlanningToCmc permission tier guard', () => {
  beforeEach(() => {
    store.set('user', null);
    store.set('isAdmin', false);
  });

  it("Sans user (anonymous) → push refusé 'admin_only_cmc_push'", async () => {
    const r = await pushPlanningToCmc(REAL_SBM_PIT_BOSS_TEXT.repeat(2), 'chat');
    expect(r.ok).toBe(false);
    expect(r.error).toBe('admin_only_cmc_push');
  });

  it("Laurence loggée (non-admin) → push REFUSÉ", async () => {
    store.set('user', { id: 'laurence_sp', name: 'Laurence', email: '' });
    store.set('isAdmin', false);
    const r = await pushPlanningToCmc(REAL_SBM_PIT_BOSS_TEXT.repeat(2), 'chat');
    expect(r.ok).toBe(false);
    expect(r.error).toBe('admin_only_cmc_push');
  });

  it("Client_free → push REFUSÉ", async () => {
    store.set('user', { id: 'client_free_001', name: 'Anonymous', email: '' });
    store.set('isAdmin', false);
    const r = await pushPlanningToCmc(REAL_SBM_PIT_BOSS_TEXT.repeat(2), 'paste');
    expect(r.ok).toBe(false);
    expect(r.error).toBe('admin_only_cmc_push');
  });

  it("Client_pro → push REFUSÉ (pas leur business)", async () => {
    store.set('user', { id: 'client_pro_xyz', name: 'Pro Client', email: '' });
    store.set('isAdmin', false);
    const r = await pushPlanningToCmc(REAL_SBM_PIT_BOSS_TEXT.repeat(2), 'voice');
    expect(r.ok).toBe(false);
    expect(r.error).toBe('admin_only_cmc_push');
  });

  it("Family member → push REFUSÉ (Kevin admin only)", async () => {
    store.set('user', { id: 'family_member', name: 'Famille', email: '' });
    store.set('isAdmin', false);
    const r = await pushPlanningToCmc(REAL_SBM_PIT_BOSS_TEXT.repeat(2), 'chat');
    expect(r.ok).toBe(false);
    expect(r.error).toBe('admin_only_cmc_push');
  });
});

describe('v13.4.83 cmc-planning-bridge — détection sans push (read-only)', () => {
  beforeEach(() => {
    store.set('user', null);
    store.set('isAdmin', false);
  });

  it("detectSbmPlanning fonctionne SANS guard (lecture/info seule)", () => {
    /* La détection seule n'a pas de permission — c'est juste de l'analyse de
     * texte. Seul le push effectif a un guard. Confidentialité OK. */
    const r = detectSbmPlanning(REAL_SBM_PIT_BOSS_TEXT.repeat(3));
    expect(r.detected).toBe(true);
    expect(r.matches.length).toBeGreaterThan(0);
  });

  it("detectAndPushIfPlanning non-admin → null OR push.ok=false", async () => {
    /* Soit détecte rien (trop court), soit détecte mais push refusé. */
    const result = await detectAndPushIfPlanning(REAL_SBM_PIT_BOSS_TEXT.repeat(3), 'chat');
    if (result !== null) {
      expect(result.push.ok).toBe(false);
      expect(result.push.error).toBe('admin_only_cmc_push');
    }
  });
});

describe('v13.4.83 cmc-planning-bridge — internals exposés', () => {
  it("Constantes exposées : MIN_TEXT_LENGTH, MIN_PUSH_LENGTH, MAX_RAW_TEXT, SBM_PATTERNS", () => {
    expect(_internals.MIN_TEXT_LENGTH).toBe(200);
    expect(_internals.MIN_PUSH_LENGTH).toBe(1000);
    expect(_internals.MAX_RAW_TEXT).toBe(50_000);
    expect(Array.isArray(_internals.SBM_PATTERNS)).toBe(true);
    expect(_internals.SBM_PATTERNS.length).toBeGreaterThanOrEqual(7); /* 4 originaux + 3 enrichis v13.4.83 */
  });

  it("Au moins 7 patterns SBM enregistrés (4 originaux + 3 enrichis)", () => {
    expect(_internals.SBM_PATTERNS.length).toBeGreaterThanOrEqual(7);
  });
});
