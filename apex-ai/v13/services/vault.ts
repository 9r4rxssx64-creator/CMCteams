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

  /**
   * Génère une passphrase device-bound stable (fallback si user n'a pas set la sienne).
   * NB : moins sécurisé qu'une passphrase user explicite, mais > plaintext.
   * À upgrader vers vraie passphrase user dès que possible (modal Vault).
   */
  private async getDeviceBoundPassphrase(): Promise<string> {
    const KEY = 'apex_v13_device_passphrase_v1';
    /* Sprint 9 v13.0.72 FIX ROOT BUG (Kevin "il a encore oublié ma clé") :
       Au lieu de random device-bound (perdu si clear cache iOS), dérive de PIN admin déterministe.
       PIN admin = stable cross-device (Kevin se souvient toujours).
       Décrypt Firebase backup MARCHE même après clear cache total iPhone. */
    try {
      const adminPinHash = localStorage.getItem('apex_v13_pin');
      if (adminPinHash) {
        /* PBKDF2 derive depuis PIN hash (déterministe, identique sur tous devices) */
        const enc = new TextEncoder();
        const baseKey = await crypto.subtle.importKey(
          'raw', enc.encode(adminPinHash + '_apex_vault_salt_v1'),
          { name: 'PBKDF2' }, false, ['deriveBits'],
        );
        const derived = await crypto.subtle.deriveBits(
          { name: 'PBKDF2', salt: enc.encode('apex_v13_kdmc_admin'), iterations: 100_000, hash: 'SHA-256' },
          baseKey, 256,
        );
        const derivedB64 = btoa(String.fromCharCode(...new Uint8Array(derived)));
        /* Persist localStorage + IDB pour cache (re-derive sur boot suivant) */
        try { localStorage.setItem(KEY, derivedB64); } catch { /* quota */ }
        void this.backupPassphraseToIdb(derivedB64);
        return derivedB64;
      }
    } catch { /* fallback random ci-dessous */ }
    const cached = localStorage.getItem(KEY);
    if (cached) {
      /* Backup en IDB pour résilience clear Safari */
      void this.backupPassphraseToIdb(cached);
      return cached;
    }
    /* Tente restore depuis IDB (survit clear localStorage Safari) */
    try {
      const fromIdb = await this.restorePassphraseFromIdb();
      if (fromIdb) {
        try {
          localStorage.setItem(KEY, fromIdb);
        } catch { /* quota */ }
        return fromIdb;
      }
    } catch { /* ignore */ }
    /* Génère + persiste device-bound (256 bits aléatoires base64) — fallback si pas PIN */
    const random = crypto.getRandomValues(new Uint8Array(32));
    const pass = btoa(String.fromCharCode(...random));
    try {
      localStorage.setItem(KEY, pass);
    } catch {
      /* Quota plein, fallback en mémoire seulement */
    }
    /* Backup IDB pour survivre clear Safari */
    void this.backupPassphraseToIdb(pass);
    return pass;
  }

  private async backupPassphraseToIdb(pass: string): Promise<void> {
    try {
      if (!('indexedDB' in window)) return;
      await new Promise<void>((resolve, reject) => {
        const req = indexedDB.open('apex_v13_secure', 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains('passphrase')) db.createObjectStore('passphrase');
        };
        req.onsuccess = () => {
          const db = req.result;
          try {
            const tx = db.transaction('passphrase', 'readwrite');
            const store = tx.objectStore('passphrase');
            store.put(pass, 'device_v1');
            tx.oncomplete = () => { db.close(); resolve(); };
            tx.onerror = () => { db.close(); reject(tx.error); };
          } catch (e) { db.close(); reject(e); }
        };
        req.onerror = () => reject(req.error);
      });
    } catch { /* ignore */ }
  }

  private async restorePassphraseFromIdb(): Promise<string | null> {
    try {
      if (!('indexedDB' in window)) return null;
      return await new Promise<string | null>((resolve) => {
        const req = indexedDB.open('apex_v13_secure', 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains('passphrase')) db.createObjectStore('passphrase');
        };
        req.onsuccess = () => {
          const db = req.result;
          try {
            const tx = db.transaction('passphrase', 'readonly');
            const store = tx.objectStore('passphrase');
            const getReq = store.get('device_v1');
            getReq.onsuccess = () => {
              db.close();
              resolve(typeof getReq.result === 'string' ? getReq.result : null);
            };
            getReq.onerror = () => { db.close(); resolve(null); };
          } catch { db.close(); resolve(null); }
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  /**
   * Encrypt avec fallback auto device-bound passphrase si user n'a pas set la sienne.
   * Garantit chiffrement TOUJOURS (vs encrypt() qui throw sans passphrase).
   */
  async encryptAuto(plaintext: string): Promise<string> {
    const pass = this.passphrase ?? (await this.getDeviceBoundPassphrase());
    return this.encrypt(plaintext, pass);
  }

  /**
   * Decrypt avec fallback device-bound (essaie passphrase user puis device-bound).
   */
  async decryptAuto(encrypted: string): Promise<string | null> {
    if (this.passphrase) {
      const r = await this.decrypt(encrypted, this.passphrase);
      if (r !== null) return r;
    }
    const devicePass = await this.getDeviceBoundPassphrase();
    return this.decrypt(encrypted, devicePass);
  }

  /**
   * UNIVERSAL READER : lit localStorage + déchiffre AXENC1: si présent.
   * SOURCE UNIQUE pour tout call site qui veut lire une clé API.
   * Anti-pattern v13.0.12 : call sites lisaient raw → recevaient AXENC1: chiffré.
   * Fix v13.0.16 : tous les services migrent vers vault.readKey().
   */
  async readKey(storageKey: string): Promise<string> {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return '';
      if (raw.startsWith(PREFIX)) {
        const decrypted = await this.decryptAuto(raw);
        return decrypted ?? '';
      }
      return raw;
    } catch {
      return '';
    }
  }

  /**
   * Masque une clé pour affichage UI (préserve début + fin pour identification).
   * Toujours appliqué APRÈS readKey() — jamais sur AXENC1: brut.
   * Exemple : "sk-ant-api03-AbCd...x9z2" → "sk-an***...x9z2"
   */
  maskKey(plaintext: string): string {
    if (!plaintext) return '';
    if (plaintext.length <= 8) return '***';
    return plaintext.slice(0, 5) + '***' + plaintext.slice(-4);
  }

  /**
   * Lit + masque en une opération (helper UI).
   */
  async readMasked(storageKey: string): Promise<string> {
    const plain = await this.readKey(storageKey);
    return this.maskKey(plain);
  }

  /**
   * Status brut sans déchiffrement (sync, rapide pour UI status).
   * Retourne 'configured' / 'empty' / 'encrypted' / 'plaintext_legacy'
   */
  getKeyStatus(storageKey: string): 'configured' | 'empty' | 'encrypted' | 'plaintext_legacy' {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return 'empty';
      if (raw.startsWith(PREFIX)) return 'encrypted';
      return 'plaintext_legacy'; /* À migrer vers chiffré */
    } catch {
      return 'empty';
    }
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
    let detected = detectCredential(trimmed);
    /* Si format inconnu : tente résolution autonome via heuristiques + web search (Kevin règle "tout autonome") */
    if (!detected) {
      try {
        const { unknownCredentialResolver } = await import('./unknown-credential-resolver.js');
        const resolved = await unknownCredentialResolver.tryIdentify(trimmed);
        if (resolved) {
          /* Crée pattern synthétique pour traiter comme credential standard */
          detected = {
            name: resolved.service,
            regex: new RegExp(resolved.pattern_learned ?? '.+'),
            storageKey: resolved.storage_key,
            category: 'ai',
            dashboard: resolved.dashboard_url,
            ...(resolved.billing_url && { billing: resolved.billing_url }),
          } as CredentialPattern;
          /* Apprentissage : ajoute pattern + escalade Claude Code */
          await unknownCredentialResolver.learn(trimmed, resolved);
          logger.info('vault', `autoStore : format inconnu résolu autonome → ${resolved.service} (${resolved.confidence})`);
        }
      } catch (err: unknown) {
        logger.warn('vault', 'unknown-resolver failed', { err });
      }
    }
    if (!detected) return { ok: false, reason: 'Format inconnu — pattern non reconnu' };
    if (detected.category === 'forbidden') {
      logger.warn('vault', `Forbidden credential detected: ${detected.name} — REFUSED`);
      return { ok: false, forbidden: true, pattern: detected, reason: detected.name + ' — JAMAIS stocké' };
    }
    /* P0 SÉCU CRITIQUE : chiffrement systématique au repos (audit v13.0.10).
       Avant : localStorage en plaintext = clés visibles DevTools.
       Après : AES-GCM 256 + PBKDF2 200k via encryptAuto (passphrase user OU device-bound). */
    try {
      const encrypted = await this.encryptAuto(trimmed);
      localStorage.setItem(detected.storageKey, encrypted);
      /* Sprint 8 v13.0.61 P0 BUG FIX : push Firebase backup chiffré pour SURVIVRE clear cache iPhone
         (Kevin règle "ne plus jamais perdre clé API"). FB_FIX whitelist déjà inclut storageKey. */
      void import('./firebase.js').then(async ({ firebase, FB_FIX }) => {
        if (FB_FIX.includes(detected.storageKey)) {
          await firebase.write(detected.storageKey, encrypted).catch(() => { /* offline OK, queue flush */ });
          logger.info('vault', `🔐 ${detected.storageKey} backup Firebase OK (survit clear cache)`);
        }
      }).catch(() => { /* offline OK */ });
    } catch (err: unknown) {
      logger.error('vault', 'autoStore encrypt+persist failed', { err });
      return { ok: false, reason: 'Chiffrement ou stockage échoué' };
    }
    /* Auto-link legacy : enrichit ax_links_registry old format */
    this.autoLink(detected);
    /* WIRE links-registry : autoCreate avec HEAD verification + sentinelle re-test
     * (règle CLAUDE.md absolue Kevin 2026-05-01 : axLinksAutoCreate). */
    void this.autoCreateLink(detected);
    /* Auto-test si endpoint dispo (best-effort, non bloquant) */
    let valid: boolean | undefined;
    if (detected.testEndpoint) {
      valid = await this.autoTest(detected, trimmed).catch(() => undefined);
    }
    logger.info('vault', `Stored ${detected.name} → ${detected.storageKey}`, { valid });
    return { ok: true, pattern: detected, ...(valid !== undefined && { valid }) };
  }

  /**
   * Wire links-registry pour auto-création + auto-vérification HEAD
   * (extraction service name depuis pattern.name).
   */
  private async autoCreateLink(pattern: CredentialPattern): Promise<void> {
    try {
      /* Service name depuis pattern.name : "Anthropic API" → "anthropic" */
      const serviceName = pattern.name.toLowerCase().split(' ')[0] ?? '';
      if (!serviceName) return;
      const { linksRegistry } = await import('./links-registry.js');
      await linksRegistry.autoCreate(serviceName);
    } catch (err: unknown) {
      logger.warn('vault', 'autoCreateLink failed', { err });
    }
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
        headers['anthropic-dangerous-direct-browser-access'] = 'true';
        headers['content-type'] = 'application/json';
      } else if (pattern.name === 'Google AI') {
        headers['x-goog-api-key'] = value;
      } else if (pattern.name.startsWith('Telegram')) {
        /* Token déjà dans URL via PLACEHOLDER */
      } else {
        headers['authorization'] = `Bearer ${value}`;
      }
      /* Anthropic /v1/messages POST exige body minimal pour valider la clé */
      let body: string | undefined;
      if (pattern.name.startsWith('Anthropic') && pattern.testMethod === 'POST') {
        body = JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hi' }],
        });
      }
      const fetchOpts: RequestInit = {
        method: pattern.testMethod ?? 'GET',
        headers,
        signal: AbortSignal.timeout(8000),
      };
      if (body) fetchOpts.body = body;
      const res = await fetch(url, fetchOpts);
      /* 200 = OK, 400 = malformed body OK (clé valide), 401 = clé invalide, 4xx autre = OK clé répond */
      if (res.status === 401 || res.status === 403) return false;
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
