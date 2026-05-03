import { describe, it, expect, beforeEach } from 'vitest';
import { commerce } from '../../services/commerce.js';
import { store } from '../../core/store.js';

describe('commerce', () => {
  beforeEach(() => {
    localStorage.clear();
    store.init({ appVer: 'v13.0.0' });
    store.set('isAdmin', false);
  });

  it("Kevin admin a toujours plan 'admin' (bypass)", () => {
    store.set('isAdmin', true);
    expect(commerce.getEffectivePlan('kdmc_admin')).toBe('admin');
  });

  it('si commerce OFF, tout le monde a plan admin (mode test)', () => {
    commerce.setEnabled(false);
    expect(commerce.getEffectivePlan('any-uid')).toBe('admin');
  });

  it('si commerce ON, user free par défaut', () => {
    commerce.setEnabled(true);
    expect(commerce.getEffectivePlan('client_xyz')).toBe('free');
  });

  it('admin ne consomme jamais de quota', () => {
    store.set('isAdmin', true);
    const r = commerce.consumeMessage('kdmc_admin');
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(-1);
  });
});
