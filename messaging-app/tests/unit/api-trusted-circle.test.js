/**
 * Tests api-worker.js — cercle de confiance (v1.1.216)
 * Kevin « trouve une solution pour faire à ma place » : Laurence + famille/amis
 * configurés se connectent SANS SMS. SEULS les numéros explicitement configurés
 * par Kevin passent (pas un backdoor universel). Kevin = bypass admin séparé.
 */
import { describe, it, expect } from 'vitest';
import { _trustedCircleSet, _isTrustedCircle } from '../../workers/api-worker.js';

describe('cercle de confiance (v1.1.216)', () => {
  it('inclut LAURENCE_PHONE_E164 + TRUSTED_CIRCLE_PHONES, exclut Kevin', () => {
    const env = {
      KEVIN_PHONE_E164: '+33672280277',
      LAURENCE_PHONE_E164: '+33611111111',
      TRUSTED_CIRCLE_PHONES: '+33622222222, +33633333333',
    };
    const set = _trustedCircleSet(env);
    expect(set.has('+33611111111')).toBe(true);
    expect(set.has('+33622222222')).toBe(true);
    expect(set.has('+33633333333')).toBe(true);
    expect(set.has('+33672280277')).toBe(false); // Kevin = admin séparé
  });

  it('_isTrustedCircle matche le format national (0X) ↔ international (+33X)', () => {
    const env = { LAURENCE_PHONE_E164: '+33611111111' };
    expect(_isTrustedCircle('+33611111111', env)).toBe(true);
    expect(_isTrustedCircle('0611111111', env)).toBe(true);   // normPhone 0X→+33X
    expect(_isTrustedCircle('+33699999999', env)).toBe(false);
  });

  it('env vide → AUCUN numéro de confiance (pas de backdoor universel)', () => {
    expect(_trustedCircleSet({}).size).toBe(0);
    expect(_isTrustedCircle('+33611111111', {})).toBe(false);
    expect(_isTrustedCircle('+33611111111', undefined)).toBe(false);
  });

  it('Kevin seul configuré → cercle vide (il a son propre bypass admin)', () => {
    const set = _trustedCircleSet({ KEVIN_PHONE_E164: '+33672280277' });
    expect(set.size).toBe(0);
  });
});
