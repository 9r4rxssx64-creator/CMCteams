import { describe, it, expect } from 'vitest';
import { detectCredential, CREDENTIAL_PATTERNS } from '../../services/credential-patterns.js';

describe('credential-patterns', () => {
  it('catalogue ≥ 40 patterns', () => {
    expect(CREDENTIAL_PATTERNS.length).toBeGreaterThanOrEqual(40);
  });
  it('détecte Anthropic', () => {
    const p = detectCredential('sk-ant-api03-' + 'A'.repeat(50));
    expect(p?.name).toBe('Anthropic');
    expect(p?.storageKey).toBe('ax_anthropic_key');
    expect(p?.dashboard).toContain('console.anthropic.com');
  });
  it('détecte Stripe', () => {
    const p = detectCredential('sk_test_' + 'B'.repeat(30));
    expect(p?.name).toBe('Stripe Secret Key');
    expect(p?.category).toBe('finance');
  });
  it('détecte Telegram bot', () => {
    const p = detectCredential('12345678:AAEhBP9iq-A_yLUyuqZxnfLwL3JT8lE2JwQ');
    expect(p?.name).toBe('Telegram Bot Token');
  });
  it('CRITIQUE refuse carte bancaire (forbidden)', () => {
    const p = detectCredential('4532 1234 5678 9010');
    expect(p?.category).toBe('forbidden');
    expect(p?.storageKey).toBe('__FORBIDDEN_CB__');
  });
  it('CRITIQUE refuse seed phrase 12 mots', () => {
    const seed = 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12';
    const p = detectCredential(seed);
    expect(p?.category).toBe('forbidden');
  });
  it('retourne null sur valeur quelconque', () => {
    expect(detectCredential('hello world')).toBeNull();
  });
});
