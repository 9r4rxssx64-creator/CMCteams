/**
 * APEX v13 — Multi-Key Vault (failover key-level)
 *
 * Demande Kevin 2026-05-07 :
 * "Quand j'ai 2 clés API qui reconnaît de la même famille (Anthropic, Gemini, etc.)
 *  il les stocke et les garde. Si une devient plus fonctionnelle, il enchaîne sur
 *  une autre pour test jusqu'à ce qu'il en ait une qui fonctionne. Et il garde
 *  tout ça en historique."
 *
 * Architecture :
 * - Chaque clé est une `KeyEntry` indépendante (UUID + status + métriques).
 * - Plusieurs clés/service possibles (anthropic#A, anthropic#B, anthropic#C…).
 * - Chiffrement réutilise vault.encryptAuto/decryptAuto (AES-GCM-256 + PBKDF2 200k).
 * - Stockage : `apex_v13_multi_keys` (localStorage + Firebase backup chiffré).
 * - Test endpoint = ping minimal (HEAD/GET light) → ok / latency / reason.
 * - Failover : si current fail → tryFailoverKey() switch sur la suivante par préférence.
 * - Historique : keys "invalid" ne sont JAMAIS supprimées, juste marquées (restorable).
 * - Health status global : green = au moins 1 clé ok partout, yellow = 1+ failing, red = 1+ service entièrement down.
 *
 * Règles CLAUDE.md absolues :
 * - "Anti-blocage IA, auto-déblocage total" → on essaie TOUTES les clés avant d'abandonner
 * - "JAMAIS de réponse vide" → fallback chain key → provider → mode dégradé
 * - "Historique COMPLET admin" → keys archivées, jamais perdues
 */

import { logger } from '../core/logger.js';

/* Lazy vault accessor — break circular dep multi-key-vault ↔ vault.
   vault.ts dynamic-imports multi-key-vault.ts (line ~927) ; if we keep
   the static import here, madge reports a cycle. Lazy resolution avoids
   that without changing runtime semantics (vault est singleton instancié
   au boot via core/bootstrap → vault.init()). */
type VaultModule = typeof import('./vault.js');
let _vaultRef: VaultModule['vault'] | null = null;
async function getVault(): Promise<VaultModule['vault']> {
  if (_vaultRef) return _vaultRef;
  const mod = await import('./vault.js');
  _vaultRef = mod.vault;
  return _vaultRef;
}

export type KeyStatus = 'active' | 'failing' | 'rate-limited' | 'invalid' | 'unknown';

export type HealthStatus = 'green' | 'yellow' | 'red';

export interface KeyEntry {
  id: string;
  service: string;
  encrypted: string;
  addedAt: number;
  lastTestedAt?: number;
  lastWorkedAt?: number;
  status: KeyStatus;
  failCount: number;
  successCount: number;
  alias?: string;
  preferredOrder?: number;
  /* Si invalid → on garde history mais on ne tente plus */
  invalidReason?: string;
  invalidAt?: number;
}

export interface KeyTestResult {
  ok: boolean;
  latencyMs: number;
  reason?: string;
}

export interface ServiceStats {
  total: number;
  active: number;
  failing: number;
  invalid: number;
  lastSuccess: number;
}

interface PingConfig {
  url: string;
  method: 'GET' | 'HEAD' | 'POST' | 'OPTIONS';
  buildHeaders: (apiKey: string) => Record<string, string>;
  body?: string;
  /* Statuts considérés comme "clé fonctionnelle" (ex: 200, 400 = body issue mais clé valide).
     401/403/429 par défaut → failing (sauf override). */
}

const STORAGE_KEY = 'apex_v13_multi_keys';
const MAX_FAIL_BEFORE_FAILING = 3;
const HEALTH_RECENT_TEST_MS = 24 * 60 * 60 * 1000; /* < 24h = "testé récemment" */

/**
 * Ping endpoint config par service. Permet test "léger" sans consommer le quota.
 * Si pas configuré, testKey retourne {ok:false, reason:'no test endpoint'}.
 */
const PING_CONFIGS: Record<string, PingConfig> = {
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    method: 'POST',
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'hi' }],
    }),
    buildHeaders: (apiKey) => ({
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    }),
  },
  openai: {
    url: 'https://api.openai.com/v1/models',
    method: 'GET',
    buildHeaders: (apiKey) => ({ authorization: `Bearer ${apiKey}` }),
  },
  groq: {
    url: 'https://api.groq.com/openai/v1/models',
    method: 'GET',
    buildHeaders: (apiKey) => ({ authorization: `Bearer ${apiKey}` }),
  },
  google: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models',
    method: 'GET',
    buildHeaders: (apiKey) => ({ 'x-goog-api-key': apiKey }),
  },
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models',
    method: 'GET',
    buildHeaders: (apiKey) => ({ 'x-goog-api-key': apiKey }),
  },
  openrouter: {
    url: 'https://openrouter.ai/api/v1/models',
    method: 'GET',
    buildHeaders: (apiKey) => ({ authorization: `Bearer ${apiKey}` }),
  },
  perplexity: {
    url: 'https://api.perplexity.ai/chat/completions',
    method: 'POST',
    body: JSON.stringify({ model: 'sonar', messages: [{ role: 'user', content: 'hi' }], max_tokens: 1 }),
    buildHeaders: (apiKey) => ({ authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' }),
  },
  mistral: {
    url: 'https://api.mistral.ai/v1/models',
    method: 'GET',
    buildHeaders: (apiKey) => ({ authorization: `Bearer ${apiKey}` }),
  },
  cohere: {
    url: 'https://api.cohere.ai/v1/models',
    method: 'GET',
    buildHeaders: (apiKey) => ({ authorization: `Bearer ${apiKey}` }),
  },
  deepseek: {
    url: 'https://api.deepseek.com/v1/models',
    method: 'GET',
    buildHeaders: (apiKey) => ({ authorization: `Bearer ${apiKey}` }),
  },
  /* v13.4.113 (Kevin "no test endpoint configured" persiste pour github_pat_classic) :
   * Multi-key-vault.testKey utilise PING_CONFIGS, pas apex-credential-tester.
   * Mon fix v13.4.106 était dans le mauvais fichier. Ajout direct ici. */
  github: {
    url: 'https://api.github.com/user',
    method: 'GET',
    buildHeaders: (apiKey) => ({
      authorization: `Bearer ${apiKey}`,
      accept: 'application/vnd.github+json',
    }),
  },
  github_pat_classic: {
    url: 'https://api.github.com/user',
    method: 'GET',
    buildHeaders: (apiKey) => ({
      authorization: `Bearer ${apiKey}`,
      accept: 'application/vnd.github+json',
    }),
  },
  github_pat_finegrained: {
    url: 'https://api.github.com/user',
    method: 'GET',
    buildHeaders: (apiKey) => ({
      authorization: `Bearer ${apiKey}`,
      accept: 'application/vnd.github+json',
    }),
  },
  xai: {
    url: 'https://api.x.ai/v1/models',
    method: 'GET',
    buildHeaders: (apiKey) => ({ authorization: `Bearer ${apiKey}` }),
  },
  pinecone: {
    url: 'https://api.pinecone.io/indexes',
    method: 'GET',
    buildHeaders: (apiKey) => ({ 'Api-Key': apiKey }),
  },
  tavily: {
    url: 'https://api.tavily.com/search',
    method: 'POST',
    body: JSON.stringify({ query: 'ping', max_results: 1 }),
    buildHeaders: (apiKey) => ({ authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' }),
  },
  together: {
    url: 'https://api.together.xyz/v1/models',
    method: 'GET',
    buildHeaders: (apiKey) => ({ authorization: `Bearer ${apiKey}` }),
  },
  finnhub: {
    url: 'https://finnhub.io/api/v1/quote?symbol=AAPL',
    method: 'GET',
    buildHeaders: (apiKey) => ({ 'X-Finnhub-Token': apiKey }),
  },
  cloudflare: {
    url: 'https://api.cloudflare.com/client/v4/user/tokens/verify',
    method: 'GET',
    buildHeaders: (apiKey) => ({ authorization: `Bearer ${apiKey}` }),
  },
  vercel: {
    url: 'https://api.vercel.com/v2/user',
    method: 'GET',
    buildHeaders: (apiKey) => ({ authorization: `Bearer ${apiKey}` }),
  },
  stripe: {
    url: 'https://api.stripe.com/v1/balance',
    method: 'GET',
    buildHeaders: (apiKey) => ({ authorization: `Bearer ${apiKey}` }),
  },
  resend: {
    url: 'https://api.resend.com/domains',
    method: 'GET',
    buildHeaders: (apiKey) => ({ authorization: `Bearer ${apiKey}` }),
  },
  brevo: {
    url: 'https://api.brevo.com/v3/account',
    method: 'GET',
    buildHeaders: (apiKey) => ({ 'api-key': apiKey }),
  },
  elevenlabs: {
    url: 'https://api.elevenlabs.io/v1/user',
    method: 'GET',
    buildHeaders: (apiKey) => ({ 'xi-api-key': apiKey }),
  },
  notion: {
    url: 'https://api.notion.com/v1/users/me',
    method: 'GET',
    buildHeaders: (apiKey) => ({ authorization: `Bearer ${apiKey}`, 'Notion-Version': '2022-06-28' }),
  },
};

/**
 * Génère un ID UUID v4 (sans dépendance externe).
 */
function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  /* Fallback safe random (test env happy-dom). */
  return (
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).slice(2, 10) +
    '-' +
    Math.random().toString(36).slice(2, 10)
  );
}

class MultiKeyVault {
  private cache: KeyEntry[] | null = null;

  /**
   * Charge l'index complet depuis localStorage (lazy + cache mémoire).
   */
  private load(): KeyEntry[] {
    if (this.cache !== null) return this.cache;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.cache = [];
        return this.cache;
      }
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        this.cache = [];
        return this.cache;
      }
      this.cache = (parsed as KeyEntry[]).filter(
        (e) => e && typeof e === 'object' && typeof e.id === 'string' && typeof e.service === 'string',
      );
      return this.cache;
    } catch (err: unknown) {
      logger.warn('multi-key-vault', 'load failed (corrupt storage?)', { err });
      this.cache = [];
      return this.cache;
    }
  }

  /**
   * Persiste l'index. Backup Firebase chiffré best-effort (non bloquant).
   */
  private async persist(): Promise<void> {
    const data = this.cache ?? [];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err: unknown) {
      logger.warn('multi-key-vault', 'persist localStorage failed', { err });
    }
    /* Firebase backup chiffré (les `encrypted` champs sont déjà AXENC1: chiffrés,
       donc OK de pousser en clair la liste — chaque entrée reste opaque). */
    try {
      const { firebase, FB_FIX } = await import('./firebase.js');
      if (FB_FIX.includes(STORAGE_KEY)) {
        await firebase.write(STORAGE_KEY, data);
      }
    } catch (err: unknown) {
      logger.debug('multi-key-vault', 'firebase backup skipped (offline ok)', { err });
    }
  }

  /**
   * Ajoute une nouvelle clé pour un service (sans écraser les autres).
   * Si une clé identique (même plaintext) existe déjà → retourne celle-ci sans dup.
   */
  async addKey(
    service: string,
    plaintextValue: string,
    opts?: { alias?: string; preferredOrder?: number },
  ): Promise<KeyEntry> {
    if (!service || !plaintextValue) {
      throw new Error('addKey: service and plaintextValue required');
    }
    const list = this.load();
    /* Dédupe : si plaintext identique déjà présent → retourne entry existante */
    for (const existing of list) {
      if (existing.service !== service) continue;
      const existingPlain = await (await getVault()).decryptAuto(existing.encrypted).catch(() => null);
      if (existingPlain === plaintextValue) {
        /* Re-active si invalide (Kevin a re-collé une clé qu'on avait marquée morte) */
        if (existing.status === 'invalid' || existing.status === 'failing') {
          existing.status = 'unknown';
          existing.failCount = 0;
          delete existing.invalidReason;
          delete existing.invalidAt;
          await this.persist();
        }
        return { ...existing };
      }
    }
    const encrypted = await (await getVault()).encryptAuto(plaintextValue);
    const entry: KeyEntry = {
      id: uuid(),
      service,
      encrypted,
      addedAt: Date.now(),
      status: 'unknown',
      failCount: 0,
      successCount: 0,
      ...(opts?.alias !== undefined && { alias: opts.alias }),
      ...(opts?.preferredOrder !== undefined && { preferredOrder: opts.preferredOrder }),
    };
    list.push(entry);
    this.cache = list;
    await this.persist();
    logger.info('multi-key-vault', `addKey ${service} (id=${entry.id.slice(0, 8)})`, {
      alias: entry.alias,
      total_for_service: this.listKeys(service).length,
    });
    return { ...entry };
  }

  /**
   * Liste les clés non-invalides pour un service, triées par préférence (active > unknown > rate-limited > failing).
   * Les entrées "invalid" sont en historique (filtrées ici par défaut).
   */
  listKeys(service: string, includeInvalid = false): KeyEntry[] {
    const all = this.load().filter((k) => k.service === service);
    const filtered = includeInvalid ? all : all.filter((k) => k.status !== 'invalid');
    return [...filtered].sort((a, b) => {
      /* preferredOrder explicite gagne (plus petit = priorité) */
      if (a.preferredOrder !== undefined && b.preferredOrder !== undefined) {
        return a.preferredOrder - b.preferredOrder;
      }
      if (a.preferredOrder !== undefined) return -1;
      if (b.preferredOrder !== undefined) return 1;
      /* Sinon : status rank, puis lastWorkedAt récent en priorité */
      const rank = (s: KeyStatus): number => {
        switch (s) {
          case 'active':
            return 0;
          case 'unknown':
            return 1;
          case 'rate-limited':
            return 2;
          case 'failing':
            return 3;
          case 'invalid':
            return 4;
        }
      };
      const ra = rank(a.status);
      const rb = rank(b.status);
      if (ra !== rb) return ra - rb;
      return (b.lastWorkedAt ?? 0) - (a.lastWorkedAt ?? 0);
    });
  }

  /**
   * Liste TOUTES les clés (tous services, incl. invalides) — pour UI admin globale.
   */
  listAll(includeInvalid = true): KeyEntry[] {
    const all = this.load();
    return includeInvalid ? [...all] : all.filter((k) => k.status !== 'invalid');
  }

  /**
   * v13.3.54 — Dédoublication automatique (Kevin "je ne peux pas effacer les doublons api anthropic").
   *
   * Détecte clés multiples du même service avec :
   * - Même encryptedValue (vraies copies — supprime toutes sauf 1)
   * - Status invalid + une autre du même service active → supprime invalide
   * - Plusieurs actives même service → garde la plus récemment testée/ajoutée
   *
   * Returns : { dedupedCount, kept }
   */
  dedupAuto(opts?: { dryRun?: boolean }): { dedupedCount: number; kept: { service: string; id: string }[] } {
    const all = this.load();
    const dryRun = opts?.dryRun ?? false;
    const byServiceValue = new Map<string, KeyEntry[]>(); /* group by service + encryptedValue (true duplicates) */
    const byService = new Map<string, KeyEntry[]>(); /* group by service (decide best) */

    for (const entry of all) {
      const groupKey = `${entry.service}::${entry.encrypted}`;
      const arr = byServiceValue.get(groupKey) ?? [];
      arr.push(entry);
      byServiceValue.set(groupKey, arr);

      const svcArr = byService.get(entry.service) ?? [];
      svcArr.push(entry);
      byService.set(entry.service, svcArr);
    }

    const toRemove = new Set<string>();
    const kept: { service: string; id: string }[] = [];

    /* Phase 1 : exact duplicates (same encryptedValue) → keep most recent */
    for (const [, group] of byServiceValue) {
      if (group.length <= 1) continue;
      group.sort((a, b) => (b.lastTestedAt ?? b.addedAt) - (a.lastTestedAt ?? a.addedAt));
      kept.push({ service: group[0]!.service, id: group[0]!.id });
      for (let i = 1; i < group.length; i++) toRemove.add(group[i]!.id);
    }

    /* Phase 2 : same service, multiple active + invalid → remove invalids */
    for (const [, group] of byService) {
      if (group.length <= 1) continue;
      const actives = group.filter((g) => g.status !== 'invalid');
      const invalids = group.filter((g) => g.status === 'invalid');
      if (actives.length >= 1 && invalids.length > 0) {
        for (const inv of invalids) toRemove.add(inv.id);
      }
    }

    if (dryRun) {
      return { dedupedCount: toRemove.size, kept };
    }

    if (toRemove.size > 0) {
      for (const id of toRemove) {
        try {
          this.removeKey(id);
        } catch (err: unknown) {
          logger.warn('multi-key-vault', 'dedupAuto removeKey failed', { id, err });
        }
      }
      logger.info('multi-key-vault', `🧹 dedupAuto removed ${toRemove.size} duplicate keys`);
    }

    return { dedupedCount: toRemove.size, kept };
  }

  /**
   * Récupère LA clé courante (la meilleure dispo) pour un service.
   * Retourne {keyId, plaintext} ou null si aucune clé utilisable.
   */
  async getCurrentKey(service: string): Promise<{ keyId: string; plaintext: string } | null> {
    const candidates = this.listKeys(service).filter(
      (k) => k.status === 'active' || k.status === 'unknown' || k.status === 'rate-limited',
    );
    if (candidates.length === 0) {
      /* fallback : tente même les "failing" (mieux que rien) */
      const fallback = this.listKeys(service).filter((k) => k.status === 'failing');
      if (fallback.length === 0) return null;
      const first = fallback[0];
      if (!first) return null;
      const plain = await (await getVault()).decryptAuto(first.encrypted);
      if (plain === null) return null;
      return { keyId: first.id, plaintext: plain };
    }
    const best = candidates[0];
    if (!best) return null;
    const plain = await (await getVault()).decryptAuto(best.encrypted);
    if (plain === null) {
      logger.warn('multi-key-vault', 'getCurrentKey decrypt failed', { keyId: best.id });
      return null;
    }
    return { keyId: best.id, plaintext: plain };
  }

  /**
   * Test une clé spécifique. Met à jour status + métriques.
   * Retourne {ok, latencyMs, reason}.
   */
  async testKey(keyId: string): Promise<KeyTestResult> {
    const list = this.load();
    const entry = list.find((k) => k.id === keyId);
    if (!entry) return { ok: false, latencyMs: 0, reason: 'key not found' };
    const config = PING_CONFIGS[entry.service];
    if (!config) {
      /* Pas de ping endpoint configuré : on ne peut pas tester, on conserve unknown */
      entry.lastTestedAt = Date.now();
      await this.persist();
      return { ok: false, latencyMs: 0, reason: 'no test endpoint configured' };
    }
    /* v13.3.21 (Kevin "decrypt failed" 2026-05-07) :
     * Use decryptDetailed pour distinguer decrypt_failed (recoverable) de bad_format (corruption).
     * Si decrypt_failed → status 'failing' (pas 'invalid' définitif) pour permettre retry après recover. */
    const detailed = await (await getVault()).decryptDetailed(entry.encrypted);
    if (!detailed.ok) {
      const reason = detailed.reason ?? 'decrypt_failed';
      if (reason === 'decrypt_failed') {
        /* RECOVERABLE : Kevin peut recoller la clé via UI "Récupérer".
         * Status = 'failing' (pas 'invalid') pour ne pas archiver définitivement. */
        this.markEntryStatus(entry, 'failing', 'decrypt_failed (passphrase rotation?) — recolle pour récupérer');
        await this.persist();
        return { ok: false, latencyMs: 0, reason: 'decrypt_failed' };
      }
      /* bad_format ou no_passphrase → invalid (corruption ou edge case rare) */
      this.markEntryStatus(entry, 'invalid', reason);
      await this.persist();
      return { ok: false, latencyMs: 0, reason };
    }
    const plain = detailed.plaintext as string;
    const start = Date.now();
    try {
      const init: RequestInit = {
        method: config.method,
        headers: config.buildHeaders(plain),
        signal: AbortSignal.timeout(8000),
      };
      if (config.body !== undefined) init.body = config.body;
      const res = await fetch(config.url, init);
      const latency = Date.now() - start;
      const status = res.status;
      entry.lastTestedAt = Date.now();
      if (status === 401 || status === 403) {
        this.markEntryStatus(entry, 'invalid', `HTTP ${status}`);
        await this.persist();
        return { ok: false, latencyMs: latency, reason: `HTTP ${status}` };
      }
      if (status === 429) {
        this.markEntryStatus(entry, 'rate-limited', 'HTTP 429');
        await this.persist();
        return { ok: false, latencyMs: latency, reason: 'rate-limited' };
      }
      if (status >= 500) {
        this.bumpFailCount(entry, `HTTP ${status}`);
        await this.persist();
        return { ok: false, latencyMs: latency, reason: `HTTP ${status}` };
      }
      /* 2xx, 4xx (≠ 401/403/429) = clé fonctionnelle (l'API a accepté l'auth) */
      entry.status = 'active';
      entry.failCount = 0;
      entry.successCount += 1;
      entry.lastWorkedAt = Date.now();
      await this.persist();
      return { ok: true, latencyMs: latency };
    } catch (err: unknown) {
      const latency = Date.now() - start;
      const e = err instanceof Error ? err : new Error(String(err));
      const reason = e.name === 'AbortError' ? 'timeout' : e.message;
      entry.lastTestedAt = Date.now();
      this.bumpFailCount(entry, reason);
      await this.persist();
      return { ok: false, latencyMs: latency, reason };
    }
  }

  /**
   * Failover : si current key fail, switch sur la prochaine candidate.
   * Marque la précédente "failing" et tente la suivante. Retourne la nouvelle clé ou null.
   */
  async tryFailoverKey(
    service: string,
    currentKeyId: string,
    error: string,
  ): Promise<{ keyId: string; plaintext: string } | null> {
    const list = this.load();
    const current = list.find((k) => k.id === currentKeyId);
    if (current) {
      this.bumpFailCount(current, error);
      /* Si erreur explicite auth → invalide direct */
      if (/401|403|invalid.api.key|unauthor/i.test(error)) {
        this.markEntryStatus(current, 'invalid', error);
      } else if (/429|rate.limit|quota/i.test(error)) {
        this.markEntryStatus(current, 'rate-limited', error);
      }
      await this.persist();
    }
    /* Cherche prochaine clé du même service hors current */
    const candidates = this.listKeys(service).filter(
      (k) => k.id !== currentKeyId && (k.status === 'active' || k.status === 'unknown' || k.status === 'rate-limited'),
    );
    if (candidates.length === 0) {
      /* Dernier recours : essaie une "failing" hors current */
      const fb = this.listKeys(service).filter((k) => k.id !== currentKeyId && k.status === 'failing');
      if (fb.length === 0) return null;
      const first = fb[0];
      if (!first) return null;
      const plain = await (await getVault()).decryptAuto(first.encrypted);
      if (plain === null) return null;
      logger.info('multi-key-vault', `failover ${service} → failing fallback ${first.id.slice(0, 8)}`);
      return { keyId: first.id, plaintext: plain };
    }
    const next = candidates[0];
    if (!next) return null;
    const plain = await (await getVault()).decryptAuto(next.encrypted);
    if (plain === null) return null;
    logger.info('multi-key-vault', `failover ${service} → switched to ${next.id.slice(0, 8)}`);
    return { keyId: next.id, plaintext: plain };
  }

  /**
   * Stats agrégées par service.
   */
  getStats(service: string): ServiceStats {
    const all = this.load().filter((k) => k.service === service);
    const stats: ServiceStats = {
      total: all.length,
      active: 0,
      failing: 0,
      invalid: 0,
      lastSuccess: 0,
    };
    for (const k of all) {
      if (k.status === 'active') stats.active += 1;
      else if (k.status === 'failing') stats.failing += 1;
      else if (k.status === 'invalid') stats.invalid += 1;
      if ((k.lastWorkedAt ?? 0) > stats.lastSuccess) stats.lastSuccess = k.lastWorkedAt ?? 0;
    }
    return stats;
  }

  /**
   * Liste services dont TOUTES les clés sont down (failing/invalid) — déclenche lumière rouge.
   */
  getServicesDown(): string[] {
    const list = this.load();
    const services = new Set<string>();
    for (const k of list) services.add(k.service);
    const down: string[] = [];
    for (const s of services) {
      const keys = list.filter((k) => k.service === s);
      if (keys.length === 0) continue;
      const allBad = keys.every((k) => k.status === 'failing' || k.status === 'invalid');
      if (allBad) down.push(s);
    }
    return down;
  }

  /**
   * Liste les services qui ont au moins une clé failing/invalid mais aussi au moins une OK.
   * Sert à la lumière jaune.
   */
  getServicesPartial(): string[] {
    const list = this.load();
    const services = new Set<string>();
    for (const k of list) services.add(k.service);
    const partial: string[] = [];
    for (const s of services) {
      const keys = list.filter((k) => k.service === s);
      const hasGood = keys.some((k) => k.status === 'active' || k.status === 'unknown');
      const hasBad = keys.some(
        (k) => k.status === 'failing' || k.status === 'invalid' || k.status === 'rate-limited',
      );
      if (hasGood && hasBad) partial.push(s);
    }
    return partial;
  }

  /**
   * Statut santé global pour lumière dashboard.
   * - green : aucun service down + aucun service partial
   * - yellow : ≥ 1 service partial (1+ failing mais autre OK)
   * - red : ≥ 1 service entier down
   */
  getHealthStatus(): HealthStatus {
    if (this.load().length === 0) return 'green'; /* aucune clé = pas de panne */
    const down = this.getServicesDown();
    if (down.length > 0) return 'red';
    const partial = this.getServicesPartial();
    if (partial.length > 0) return 'yellow';
    return 'green';
  }

  /**
   * Re-test toutes les clés failing/unknown (sentinelle 30 min).
   * - skip celles testées < 5 min
   * - skip "invalid" (history figée)
   * - swap auto si une "failing" redevient "active" → log info
   */
  async healthCheckAll(): Promise<{ tested: number; recovered: number; stillDown: number }> {
    const list = this.load();
    const now = Date.now();
    let tested = 0;
    let recovered = 0;
    let stillDown = 0;
    for (const entry of list) {
      if (entry.status === 'invalid') continue;
      if (entry.lastTestedAt !== undefined && now - entry.lastTestedAt < 5 * 60 * 1000) continue;
      const before = entry.status;
      const result = await this.testKey(entry.id);
      tested += 1;
      if (result.ok && (before === 'failing' || before === 'rate-limited')) {
        recovered += 1;
        logger.info('multi-key-vault', `🔄 ${entry.service}#${entry.id.slice(0, 8)} recovered`);
      }
      if (!result.ok && entry.status === 'failing') {
        /* 'invalid' déjà filtré ligne 534 (continue) */
        stillDown += 1;
      }
    }
    return { tested, recovered, stillDown };
  }

  /**
   * Marque une clé invalide explicitement (admin force) → archive history.
   */
  markInvalid(keyId: string, reason: string): void {
    const list = this.load();
    const entry = list.find((k) => k.id === keyId);
    if (!entry) return;
    this.markEntryStatus(entry, 'invalid', reason);
    void this.persist();
  }

  /**
   * Restore une clé depuis history (admin re-vérifie). Status redevient unknown.
   */
  restoreKey(keyId: string): void {
    const list = this.load();
    const entry = list.find((k) => k.id === keyId);
    if (!entry) return;
    entry.status = 'unknown';
    entry.failCount = 0;
    delete entry.invalidReason;
    delete entry.invalidAt;
    void this.persist();
  }

  /**
   * Supprime définitivement une clé (admin). Préfère markInvalid (garde history).
   *
   * v13.3.51 fix Kevin "j'ai déjà fait poubelle plusieurs fois mais il se remet" :
   * Marque la storage_key dans `ax_credentials_deleted` whitelist pour empêcher
   * vault.startCredentialsWatch() poll 30s de restaurer depuis IDB shadow.
   * Aussi : removeItem localStorage + delete IDB shadow + Firebase null pour
   * propagation triple persistence.
   */
  removeKey(keyId: string): void {
    const list = this.load();
    const entry = list.find((k) => k.id === keyId);
    const keep = list.filter((k) => k.id !== keyId);
    this.cache = keep;
    void this.persist();

    if (!entry) return;

    /* Marque la storage_key comme volontairement supprimée */
    try {
      const storageKey = `ax_${entry.service ?? 'unknown'}_key`;
      const deleted = JSON.parse(localStorage.getItem('ax_credentials_deleted') ?? '[]') as string[];
      if (Array.isArray(deleted) && !deleted.includes(storageKey)) {
        deleted.push(storageKey);
        if (deleted.length > 200) deleted.shift(); /* cap FIFO */
        localStorage.setItem('ax_credentials_deleted', JSON.stringify(deleted));
      }
      /* Triple cleanup : localStorage + IDB shadow + Firebase null */
      localStorage.removeItem(storageKey);
      void import('./vault.js').then(({ vault }) => {
        try { void (vault as { _deleteFromIdb?: (k: string) => Promise<void> })._deleteFromIdb?.(storageKey); } catch { /* ignore */ }
      }).catch(() => { /* ignore */ });
      void import('./firebase.js').then(({ firebase }) => {
        try { void firebase.write(storageKey, null); } catch { /* ignore */ }
      }).catch(() => { /* ignore */ });
    } catch { /* ignore */ }
  }

  /**
   * Renomme alias.
   */
  setAlias(keyId: string, alias: string): void {
    const entry = this.load().find((k) => k.id === keyId);
    if (!entry) return;
    entry.alias = alias;
    void this.persist();
  }

  /**
   * Définit ordre préférentiel (plus petit = priorité). undefined = retour auto.
   */
  setPreferredOrder(keyId: string, order: number | undefined): void {
    const entry = this.load().find((k) => k.id === keyId);
    if (!entry) return;
    if (order === undefined) delete entry.preferredOrder;
    else entry.preferredOrder = order;
    void this.persist();
  }

  /**
   * Export complet (encrypted intact). Pour migration / backup user.
   */
  exportAllEncrypted(): string {
    return JSON.stringify(this.load());
  }

  /**
   * Import depuis backup. Merge non destructif (skip si id déjà présent).
   */
  importEncrypted(data: string): { imported: number } {
    let parsed: unknown;
    try {
      parsed = JSON.parse(data);
    } catch {
      return { imported: 0 };
    }
    if (!Array.isArray(parsed)) return { imported: 0 };
    const list = this.load();
    const existingIds = new Set(list.map((k) => k.id));
    let imported = 0;
    for (const item of parsed as KeyEntry[]) {
      if (!item || typeof item !== 'object') continue;
      if (typeof item.id !== 'string' || typeof item.service !== 'string') continue;
      if (typeof item.encrypted !== 'string') continue;
      if (existingIds.has(item.id)) continue;
      list.push(item);
      imported += 1;
    }
    this.cache = list;
    void this.persist();
    logger.info('multi-key-vault', `imported ${imported} keys`);
    return { imported };
  }

  /**
   * Reset complet (tests). Vide localStorage + cache.
   */
  resetAll(): void {
    this.cache = [];
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  /**
   * Force re-load depuis localStorage (utile pour tests + sync cross-tab).
   * Ignore le cache mémoire. À utiliser après injection externe de localStorage.
   */
  reloadFromStorage(): void {
    this.cache = null;
    this.load();
  }

  /**
   * v13.3.21 (Kevin fix "decrypt failed") :
   * Liste les clés dont le decrypt a échoué (failing avec invalidReason "decrypt_failed").
   * Utilisé par UI "Récupérer cette clé" + sentinelle decrypt-watch.
   */
  listDecryptFailed(): KeyEntry[] {
    return this.load().filter((k) => {
      if (k.status !== 'failing') return false;
      const reason = k.invalidReason ?? '';
      return /decrypt_failed|decrypt failed|passphrase rotation/i.test(reason);
    });
  }

  /**
   * v13.3.21 (Kevin fix "decrypt failed") :
   * Récupération clé : Kevin recolle plaintext, on re-chiffre avec passphrase courante,
   * on remplace l'ancien encrypted, on remet status à 'unknown' pour re-test.
   */
  async recoverKey(keyId: string, plaintextValue: string): Promise<{ ok: boolean; reason?: string }> {
    if (!plaintextValue || !plaintextValue.trim()) {
      return { ok: false, reason: 'Valeur vide' };
    }
    const list = this.load();
    const entry = list.find((k) => k.id === keyId);
    if (!entry) return { ok: false, reason: 'Clé non trouvée' };
    try {
      entry.encrypted = await (await getVault()).encryptAuto(plaintextValue.trim());
      entry.status = 'unknown';
      entry.failCount = 0;
      delete entry.invalidReason;
      delete entry.invalidAt;
      await this.persist();
      logger.info('multi-key-vault', `✅ recoverKey ${entry.service}#${entry.id.slice(0, 8)} (re-chiffré + reset status)`);
      return { ok: true };
    } catch (err: unknown) {
      logger.error('multi-key-vault', 'recoverKey failed', { err, keyId });
      return { ok: false, reason: String(err).slice(0, 200) };
    }
  }

  /**
   * Liste tous les services connus (clés présentes au moins 1).
   */
  getKnownServices(): string[] {
    const services = new Set<string>();
    for (const k of this.load()) services.add(k.service);
    return Array.from(services).sort();
  }

  /**
   * UI helper : couleur lumière par service (vert/jaune/rouge/gris).
   */
  getServiceLight(service: string): 'green' | 'yellow' | 'red' | 'gray' {
    const keys = this.load().filter((k) => k.service === service);
    if (keys.length === 0) return 'gray';
    const hasActive = keys.some(
      (k) => k.status === 'active' && (Date.now() - (k.lastTestedAt ?? 0)) < HEALTH_RECENT_TEST_MS,
    );
    const hasUsable = keys.some((k) => k.status === 'active' || k.status === 'unknown');
    const allBad = keys.every((k) => k.status === 'failing' || k.status === 'invalid');
    const allRateLimited = keys.every((k) => k.status === 'rate-limited');
    if (allBad) return 'red';
    if (allRateLimited) return 'yellow';
    if (hasActive) return 'green';
    if (hasUsable) {
      /* Si au moins 1 failing/rate-limited mais d'autres OK → jaune */
      const hasBad = keys.some(
        (k) => k.status === 'failing' || k.status === 'invalid' || k.status === 'rate-limited',
      );
      return hasBad ? 'yellow' : 'gray';
    }
    return 'gray';
  }

  /* === Internals === */

  private bumpFailCount(entry: KeyEntry, reason: string): void {
    entry.failCount += 1;
    entry.lastTestedAt = Date.now();
    if (entry.failCount >= MAX_FAIL_BEFORE_FAILING && entry.status !== 'invalid') {
      this.markEntryStatus(entry, 'failing', reason);
    } else if (entry.status === 'active' || entry.status === 'unknown') {
      /* Sub-threshold : on garde 'unknown' tant qu'on n'a pas atteint 3 fails */
      entry.status = 'unknown';
    }
  }

  private markEntryStatus(entry: KeyEntry, status: KeyStatus, reason: string): void {
    entry.status = status;
    if (status === 'invalid') {
      entry.invalidReason = reason;
      entry.invalidAt = Date.now();
    }
  }
}

export const multiKeyVault = new MultiKeyVault();
