import { describe, it, expect, beforeEach } from 'vitest';
import { auth } from '../../services/auth.js';

describe('auth.isKevinAdmin', () => {
  it('reconnaît tous les aliases Kevin (v13.3.65 : MIN 2 tokens stricts)', () => {
    expect(auth.isKevinAdmin('Kevin DESARZENS')).toBe(true);
    expect(auth.isKevinAdmin('kevin desarzens')).toBe(true);
    expect(auth.isKevinAdmin('DESARZENS Kevin')).toBe(true);
    expect(auth.isKevinAdmin('kevin.desarzens@gmail.com')).toBe(true);
    expect(auth.isKevinAdmin('Kevin Desarzens KDMC')).toBe(true); /* 3 tokens — match */
  });

  it("ne match pas Laurent ni single-token (v13.3.65 strict 2-tokens)", () => {
    expect(auth.isKevinAdmin('Laurent')).toBe(false);
    expect(auth.isKevinAdmin('Laurence SAINT-POLIT')).toBe(false);
    expect(auth.isKevinAdmin('Kev')).toBe(false); /* token trop court */
    expect(auth.isKevinAdmin('KDMC')).toBe(false); /* v13.3.65 single-token retiré sécurité */
    expect(auth.isKevinAdmin('Kevin')).toBe(false); /* prénom seul refusé */
    expect(auth.isKevinAdmin('Desarzens')).toBe(false); /* nom seul refusé */
  });
});

describe('auth.hashPin', () => {
  it('produit un hash déterministe', async () => {
    const h1 = await auth.hashPin('123456', 'kdmc_admin');
    const h2 = await auth.hashPin('123456', 'kdmc_admin');
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(64);
  });

  it('produit un hash différent pour salt différent', async () => {
    const h1 = await auth.hashPin('123456', 'kdmc_admin');
    const h2 = await auth.hashPin('123456', 'laurence_sp');
    expect(h1).not.toBe(h2);
  });
});

describe('auth.login', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('refuse login sans nom ou pin', async () => {
    expect((await auth.login('', '123456')).ok).toBe(false);
    expect((await auth.login('Kevin', '')).ok).toBe(false);
  });

  it('refuse pin trop court', async () => {
    expect((await auth.login('Kevin DESARZENS', '12')).ok).toBe(false);
  });
});
