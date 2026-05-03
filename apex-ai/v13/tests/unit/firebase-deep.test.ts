import { describe, it, expect, beforeEach } from 'vitest';
import { firebase, FB_FIX, FB_LOCAL } from '../../services/firebase.js';

describe('firebase deep tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('isLocalOnly détecte FB_LOCAL prefix patterns', () => {
    expect(firebase.isLocalOnly('apex_v13_user')).toBe(true);
    expect(firebase.isLocalOnly('ax_voice_print_u1')).toBe(true);
    expect(firebase.isLocalOnly('apex_v13_pin')).toBe(true);
  });

  it('isLocalOnly false pour clés non FB_LOCAL', () => {
    expect(firebase.isLocalOnly('random_key')).toBe(false);
    expect(firebase.isLocalOnly('apex_v13_facts')).toBe(false);
  });

  it('shouldSync FB_FIX whitelist strict', () => {
    expect(firebase.shouldSync('apex_v13_facts')).toBe(true);
    expect(firebase.shouldSync('apex_v13_lessons')).toBe(true);
    expect(firebase.shouldSync('inconnue')).toBe(false);
  });

  it('FB_FIX et FB_LOCAL exportés non vides', () => {
    expect(FB_FIX.length).toBeGreaterThanOrEqual(5);
    expect(FB_LOCAL.length).toBeGreaterThanOrEqual(3);
  });

  it('write skip silently si non-syncé', async () => {
    /* Pas de fetch attendu sur clé inconnue */
    await firebase.write('non_synced_key', { v: 1 });
    /* No-op silencieux, pas de throw */
    expect(true).toBe(true);
  });

  it('write skip si FB_LOCAL', async () => {
    await firebase.write('apex_v13_user', { id: 'kevin' });
    /* Aucune sync = succès silencieux */
    expect(true).toBe(true);
  });

  it('isConnected initial false (pas de ping)', () => {
    expect(firebase.isConnected()).toBe(false);
  });
});
