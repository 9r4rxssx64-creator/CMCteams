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
import { detectCredential, type CredentialPattern } from './credential-patterns.js';

interface EncryptedPayload {
  v: 1;
  iv: string; /* base64 */
  ct: string; /* base64 */
  salt: string;
}

const PREFIX = 'AXENC1:';

/* Backward-compat alias pour tests + features existantes (15 patterns minimum) */
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

  /* Détection complète via 130+ patterns + warning si forbidden */
  detectFull(value: string): CredentialPattern | null {
    return detectCredential(value);
  }

  /* Backward-compat 15 patterns simples */
  detectPattern(value: string): { name: string; key: string } | null {
    const detected = detectCredential(value);
    if (!detected || detected.category === 'forbidden') return null;
    return { name: detected.name, key: detected.storageKey };
  }

  /**
   * Auto-store credential détecté + auto-test si endpoint dispo + auto-link dashboard.
   * Retourne le résultat structuré pour UI feedback.
   */
  async autoStore(value: string): Promise<{
    ok: boolean;
    pattern?: CredentialPattern;
    valid?: boolean;
    forbidden?: boolean;
    reason?: string;
  }> {
    const trimmed = value.trim();
    if (!trimmed) return { ok: false, reason: 'Valeur vide' };
    const detected = detectCredential(trimmed);
    if (!detected) return { ok: false, reason: 'Format inconnu — pattern non reconnu' };
    if (detected.category === 'forbidden') {
      logger.warn('vault', `Forbidden credential detected: ${detected.name} — REFUSED`);
      return { ok: false, forbidden: true, pattern: detected, reason: detected.name + ' — JAMAIS stocké' };
    }
    try {
      localStorage.setItem(detected.storageKey, trimmed);
    } catch (err: unknown) {
      logger.error('vault', 'autoStore persist failed', { err });
      return { ok: false, reason: 'Stockage saturé' };
    }
    /* Auto-link : enrichit ax_links_registry */
    this.autoLink(detected);
    /* Auto-test si endpoint dispo (best-effort, non bloquant) */
    let valid: boolean | undefined;
    if (detected.testEndpoint) {
      valid = await this.autoTest(detected, trimmed).catch(() => undefined);
    }
    logger.info('vault', `Stored ${detected.name} → ${detected.storageKey}`, { valid });
    return { ok: true, pattern: detected, ...(valid !== undefined && { valid }) };
  }

  private autoLink(pattern: CredentialPattern): void {
    try {
      const registry = JSON.parse(localStorage.getItem('ax_links_registry') ?? '{}') as Record<
        string,
        Record<string, unknown>
      >;
      registry[pattern.storageKey] = {
        service: pattern.name,
        category: pattern.category,
        ...(pattern.dashboard && { dashboard: pattern.dashboard }),
        ...(pattern.billing && { billing: pattern.billing }),
        ...(pattern.docs && { docs: pattern.docs }),
        ...(pattern.support && { support: pattern.support }),
        last_added: Date.now(),
        alive: true,
      };
      localStorage.setItem('ax_links_registry', JSON.stringify(registry));
    } catch (err: unknown) {
      logger.warn('vault', 'autoLink failed', { err });
    }
  }

  private async autoTest(pattern: CredentialPattern, value: string): Promise<boolean> {
    if (!pattern.testEndpoint) return false;
    try {
      const url = pattern.testEndpoint.replace('PLACEHOLDER', value);
      const headers: Record<string, string> = {};
      if (pattern.name.startsWith('Anthropic')) {
        headers['x-api-key'] = value;
        headers['anthropic-version'] = '2023-06-01';
      } else if (pattern.name === 'Google AI') {
        headers['x-goog-api-key'] = value;
      } else if (pattern.name.startsWith('Telegram')) {
        /* Token déjà dans URL via PLACEHOLDER */
      } else {
        headers['authorization'] = `Bearer ${value}`;
      }
      const res = await fetch(url, {
        method: pattern.testMethod ?? 'GET',
        headers,
        signal: AbortSignal.timeout(8000),
      });
      /* 200 ou 401 sans param valide = endpoint répond */
      return res.status < 500;
    } catch {
      return false;
    }
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
