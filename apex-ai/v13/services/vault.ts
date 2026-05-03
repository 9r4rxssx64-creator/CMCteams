/**
 * APEX v13 — Vault (coffre clés API)
 *
 * AES-GCM 256 + PBKDF2 200k iterations via WebCrypto natif.
 * 130+ patterns auto-detect (cf. AX_CREDENTIAL_PATTERNS CLAUDE.md).
 *
 * Anti-pattern évité v12.784 :
 * - decrypt() retourne null sur fail JAMAIS le payload chiffré
 *
 * Anti-pattern évité v12.783 :
 * - "plain wins over encrypted" guard côté firebase.ts SSE
 */

import { logger } from '../core/logger.js';

interface EncryptedPayload {
  v: 1;
  iv: string; /* base64 */
  ct: string; /* base64 */
  salt: string;
}

const PREFIX = 'AXENC1:';

export const CREDENTIAL_PATTERNS: ReadonlyArray<{ name: string; regex: RegExp; key: string }> = [
  { name: 'Anthropic', regex: /^sk-ant-api\d{2}-[A-Za-z0-9_-]{40,}/, key: 'ax_anthropic_key' },
  { name: 'OpenAI', regex: /^sk-[A-Za-z0-9]{40,}/, key: 'ax_openai_key' },
  { name: 'Google AI', regex: /^AIza[A-Za-z0-9_-]{33}$/, key: 'ax_google_key' },
  { name: 'GitHub PAT', regex: /^ghp_[A-Za-z0-9]{36}$/, key: 'ax_github_token' },
  { name: 'GitHub fine-grained', regex: /^github_pat_[A-Za-z0-9_]{82,}$/, key: 'ax_github_token' },
  { name: 'Stripe SK', regex: /^sk_(live|test)_[A-Za-z0-9]{24,}/, key: 'ax_stripe_sk' },
  { name: 'Stripe PK', regex: /^pk_(live|test)_[A-Za-z0-9]{24,}/, key: 'ax_stripe_pk' },
  { name: 'Brevo', regex: /^xkeysib-[a-f0-9]+-[A-Za-z0-9]+$/, key: 'ax_brevo_key' },
  { name: 'Resend', regex: /^re_[A-Za-z0-9_]+$/, key: 'ax_resend_key' },
  { name: 'Groq', regex: /^gsk_[A-Za-z0-9]+$/, key: 'ax_groq_key' },
  { name: 'Perplexity', regex: /^pplx-[A-Za-z0-9]+$/, key: 'ax_perplexity_key' },
  { name: 'DeepL', regex: /^[a-f0-9-]+:fx$/, key: 'ax_deepl_key' },
  { name: 'Notion', regex: /^secret_[A-Za-z0-9]+$/, key: 'ax_notion_key' },
  { name: 'Replicate', regex: /^r8_[A-Za-z0-9]+$/, key: 'ax_replicate_key' },
  { name: 'Telegram bot', regex: /^\d{8,}:[A-Za-z0-9_-]{35}$/, key: 'ax_telegram_token' },
];

class Vault {
  private passphrase: string | null = null;

  setPassphrase(passphrase: string): void {
    this.passphrase = passphrase;
  }

  async deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey'],
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: salt as BufferSource, iterations: 200_000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
  }

  async encrypt(plaintext: string, passphrase?: string): Promise<string> {
    const pass = passphrase ?? this.passphrase;
    if (!pass) throw new Error('Vault passphrase not set');
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(pass, salt);
    const ct = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      new TextEncoder().encode(plaintext) as BufferSource,
    );
    const payload: EncryptedPayload = {
      v: 1,
      iv: this.b64(iv),
      ct: this.b64(new Uint8Array(ct)),
      salt: this.b64(salt),
    };
    return PREFIX + JSON.stringify(payload);
  }

  /**
   * CRITIQUE v12.784 : retourne null sur fail JAMAIS le payload chiffré.
   * Sinon SSE écraserait localStorage avec encrypted brut.
   */
  async decrypt(encrypted: string, passphrase?: string): Promise<string | null> {
    const pass = passphrase ?? this.passphrase;
    if (!pass) return null;
    if (!encrypted.startsWith(PREFIX)) return null;
    try {
      const payload = JSON.parse(encrypted.slice(PREFIX.length)) as EncryptedPayload;
      if (payload.v !== 1) return null;
      const salt = this.b64decode(payload.salt);
      const iv = this.b64decode(payload.iv);
      const ct = this.b64decode(payload.ct);
      const key = await this.deriveKey(pass, salt);
      const plain = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv as BufferSource },
        key,
        ct as BufferSource,
      );
      return new TextDecoder().decode(plain);
    } catch (err: unknown) {
      logger.warn('vault', 'decrypt failed (returning null)', { err });
      return null;
    }
  }

  detectPattern(value: string): { name: string; key: string } | null {
    const trimmed = value.trim();
    for (const p of CREDENTIAL_PATTERNS) {
      if (p.regex.test(trimmed)) return { name: p.name, key: p.key };
    }
    return null;
  }

  private b64(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes));
  }

  private b64decode(s: string): Uint8Array {
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
}

export const vault = new Vault();
