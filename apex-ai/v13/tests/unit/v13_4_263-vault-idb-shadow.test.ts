/**
 * Tests v13.4.263 — multi-key-vault IndexedDB shadow (Kevin "le coffre se perd
 * toujours").
 *
 * Bug : multi-key-vault.persist() ne faisait QUE localStorage + Firebase.
 * Quand Firebase KO + iOS Safari évince le localStorage → perte totale.
 *
 * Fix v13.4.263 : couche IndexedDB shadow (apex_v13_vault_shadow / store 'keys'
 * / clé 'apex_v13_multi_keys_shadow'). hydrateFromIdb() restaure le coffre
 * depuis l'IDB si le localStorage est vide.
 *
 * Ces tests verrouillent : persist écrit l'IDB, hydrateFromIdb restaure quand
 * localStorage évincé, idempotent si localStorage déjà peuplé.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { multiKeyVault } from '../../services/vault/multi-key-vault.js';

const STORAGE_KEY = 'apex_v13_multi_keys';

describe('v13.4.263 — multi-key-vault IndexedDB shadow', () => {
  beforeEach(() => {
    multiKeyVault.resetAll();
    localStorage.clear();
  });

  afterEach(() => {
    multiKeyVault.resetAll();
    localStorage.clear();
  });

  it('addKey persiste dans localStorage ET IndexedDB shadow', async () => {
    await multiKeyVault.addKey('anthropic', 'sk-ant-api03-shadowtest1');
    /* localStorage a la clé */
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();
    /* Simule éviction iOS Safari : localStorage vidé, IDB intact */
    localStorage.clear();
    multiKeyVault.resetAll();
    /* hydrateFromIdb doit retrouver les données depuis l'IDB shadow */
    const r = await multiKeyVault.hydrateFromIdb();
    expect(r.restored).toBe(true);
    expect(r.count).toBeGreaterThanOrEqual(1);
    /* localStorage est restauré */
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();
    /* Les clés sont de nouveau listables */
    expect(multiKeyVault.listAll(true).length).toBeGreaterThanOrEqual(1);
  });

  it('hydrateFromIdb est idempotent si localStorage déjà peuplé', async () => {
    await multiKeyVault.addKey('openai', 'sk-' + 'A1b2C3d4'.repeat(6));
    /* localStorage a des données → hydrate ne doit rien restaurer */
    const r = await multiKeyVault.hydrateFromIdb();
    expect(r.restored).toBe(false);
    expect(r.count).toBe(0);
  });

  it('hydrateFromIdb no-op si IDB shadow vide (rien à restaurer)', async () => {
    /* Aucun addKey → IDB shadow vide */
    localStorage.clear();
    multiKeyVault.resetAll();
    const r = await multiKeyVault.hydrateFromIdb();
    expect(r.restored).toBe(false);
    expect(r.count).toBe(0);
  });

  it('hydrateFromIdb restaure plusieurs services', async () => {
    await multiKeyVault.addKey('anthropic', 'sk-ant-api03-multi1');
    await multiKeyVault.addKey('groq', 'gsk_' + 'a'.repeat(48));
    await multiKeyVault.addKey('xai', 'xai-' + 'b'.repeat(48));
    /* Éviction simulée */
    localStorage.clear();
    multiKeyVault.resetAll();
    const r = await multiKeyVault.hydrateFromIdb();
    expect(r.restored).toBe(true);
    expect(r.count).toBeGreaterThanOrEqual(3);
    const services = new Set(multiKeyVault.listAll(true).map((k) => k.service));
    expect(services.size).toBeGreaterThanOrEqual(3);
  });

  it('hydrateFromIdb émet event apex:vault-hydrated', async () => {
    await multiKeyVault.addKey('anthropic', 'sk-ant-api03-evt1');
    localStorage.clear();
    multiKeyVault.resetAll();
    let eventCount = 0;
    let detailCount = 0;
    const handler = (e: Event): void => {
      eventCount++;
      detailCount = (e as CustomEvent<{ count: number }>).detail.count;
    };
    window.addEventListener('apex:vault-hydrated', handler);
    await multiKeyVault.hydrateFromIdb();
    window.removeEventListener('apex:vault-hydrated', handler);
    expect(eventCount).toBe(1);
    expect(detailCount).toBeGreaterThanOrEqual(1);
  });
});
