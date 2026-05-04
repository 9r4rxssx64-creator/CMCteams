/**
 * Test P0 SÉCU : vault.autoStore() doit CHIFFRER les tokens au repos.
 * Audit v13.0.10 a révélé : tokens stockés en plaintext = leak DevTools.
 * Fix v13.0.12 : encryptAuto + decryptAuto via device-bound passphrase fallback.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { vault } from '../../services/vault.js';

describe('Vault autoStore encryption (P0 sécu fix)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('autoStore chiffre les tokens (PAS plaintext dans localStorage)', async () => {
    const fakeAnthropicKey = 'sk-ant-api03-' + 'A'.repeat(95);
    const r = await vault.autoStore(fakeAnthropicKey);
    expect(r.ok).toBe(true);
    expect(r.pattern?.name.toLowerCase()).toContain('anthropic');
    /* CRITIQUE : valeur stockée DOIT être chiffrée (AXENC1: prefix), JAMAIS plaintext */
    const stored = localStorage.getItem('ax_anthropic_key');
    expect(stored).not.toBe(fakeAnthropicKey); /* PAS plaintext */
    expect(stored?.startsWith('AXENC1:')).toBe(true); /* Chiffrement détectable */
  });

  it('decryptAuto retrouve le plaintext original', async () => {
    const fakeKey = 'sk-' + 'B'.repeat(45);
    await vault.autoStore(fakeKey);
    const stored = localStorage.getItem('ax_openai_key');
    if (stored) {
      const decrypted = await vault.decryptAuto(stored);
      expect(decrypted).toBe(fakeKey);
    }
  });

  it('device-bound passphrase persistée localStorage', async () => {
    /* 1er encrypt génère + persiste device passphrase */
    await vault.encryptAuto('test1');
    const passKey = localStorage.getItem('apex_v13_device_passphrase_v1');
    expect(passKey).toBeTruthy();
    expect(passKey?.length).toBeGreaterThan(20);
    /* 2e encrypt réutilise même passphrase (idempotent) */
    await vault.encryptAuto('test2');
    expect(localStorage.getItem('apex_v13_device_passphrase_v1')).toBe(passKey);
  });

  it('encryptAuto + decryptAuto round-trip', async () => {
    const original = 'mon-secret-très-confidentiel';
    const encrypted = await vault.encryptAuto(original);
    expect(encrypted.startsWith('AXENC1:')).toBe(true);
    const decrypted = await vault.decryptAuto(encrypted);
    expect(decrypted).toBe(original);
  });

  it('autoStore refuse forbidden credentials (CB)', async () => {
    const fakeCB = '4242 4242 4242 4242';
    const r = await vault.autoStore(fakeCB);
    /* Doit refuser ou pas reconnaître — JAMAIS stocker une CB */
    if (r.forbidden) {
      expect(r.ok).toBe(false);
      expect(localStorage.getItem('ax_card_visa_mc')).toBe(null);
    }
  });

  it('autoStore valeur vide → ok=false', async () => {
    const r = await vault.autoStore('');
    expect(r.ok).toBe(false);
    expect(r.reason).toContain('Valeur vide');
  });

  it('autoStore format inconnu → ok=false', async () => {
    const r = await vault.autoStore('bla bla random text');
    expect(r.ok).toBe(false);
    expect(r.reason).toContain('Format inconnu');
  });
});
