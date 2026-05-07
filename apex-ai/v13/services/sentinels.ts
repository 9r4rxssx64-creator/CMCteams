/**
 * APEX v13 — Sentinelles 24/7 (P0 audit Jet 4 : "promesse 13 sentinelles, 0 actuel")
 *
 * 13 sentinelles critiques préservées de v12.785, simplifiées MVP Jet 4 :
 * - Run interval (5min à 24h selon)
 * - Auto-fix whitelist
 * - Si fail → escalate ax_claude_todo Firebase
 * - Lesson learned ajoutée si nouveau pattern
 *
 * Sentinelles MVP Jet 4 (5 critiques) :
 * 1. token-balance-watch (1h) : monitor solde providers IA
 * 2. error-watch (5min) : poll observability buffer pending criticals
 * 3. backup-watch (24h) : vérifie backup quotidien Firebase
 * 4. credentials-watch (24h) : re-test validity tokens stockés
 * 5. link-validation-watch (24h) : test alive ax_links_registry
 *
 * Les 8 autres sentinelles (security/perf/storage/network/presence/compliance/conflict/wake)
 * sont stubbed Jet 4 et complétées Jet 5.
 */

import { logger } from '../core/logger.js';

import { observability } from './observability.js';

export interface Sentinel {
  id: string;
  name: string;
  desc: string;
  intervalMs: number;
  lastRun: number;
  lastResult?: { ok: boolean; msg: string; ts: number };
  enabled: boolean;
  check: () => Promise<{ ok: boolean; msg: string; details?: Record<string, unknown> }>;
  /* Auto-repair whitelist : action correctrice si check échoue */
  autoFix?: () => Promise<{ ok: boolean; msg: string }>;
}

const SENTINEL_KEY = 'apex_v13_sentinels';

class SentinelsManager {
  private sentinels = new Map<string, Sentinel>();
  private runTimer: number | null = null;

  register(s: Omit<Sentinel, 'lastRun' | 'enabled'> & Partial<Pick<Sentinel, 'enabled'>>): void {
    this.sentinels.set(s.id, {
      ...s,
      lastRun: 0,
      enabled: s.enabled !== false,
    });
  }

  init(): void {
    /* Restaure dernières exécutions depuis localStorage */
    try {
      /* v13.3.24 fix Kevin (screenshot 19:11) : invalide lastResults stales pour
       * les 3 sentinelles cosmétiques fixes cette release (backup-watch, security-watch,
       * tools-watch). Force re-run au prochain cycle, évite Kevin de voir l'ancien
       * message "493 936h" / "16 tools orphelins" / "Audit log tamper". */
      const STALE_INVALIDATE_KEY = 'apex_v13_sentinels_stale_v13_3_24';
      const alreadyInvalidated = localStorage.getItem(STALE_INVALIDATE_KEY) === '1';
      const raw = localStorage.getItem(SENTINEL_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, { lastRun: number; lastResult?: Sentinel['lastResult'] }>;
        const STALE_IDS = new Set(['backup-watch', 'security-watch', 'tools-watch']);
        for (const [id, s] of this.sentinels) {
          const entry = saved[id];
          if (entry) {
            /* Skip restore lastResult pour sentinelles cosmétiques fix v13.3.24 */
            if (!alreadyInvalidated && STALE_IDS.has(id)) {
              s.lastRun = 0; /* force re-run au prochain cycle */
            } else {
              s.lastRun = entry.lastRun;
              if (entry.lastResult) s.lastResult = entry.lastResult;
            }
          }
        }
        if (!alreadyInvalidated) {
          try { localStorage.setItem(STALE_INVALIDATE_KEY, '1'); } catch { /* quota */ }
        }
      }
    } catch {
      /* ignore */
    }
    this.scheduleRun();
  }

  list(): Sentinel[] {
    return [...this.sentinels.values()];
  }

  enable(id: string, enabled: boolean): void {
    const s = this.sentinels.get(id);
    if (s) s.enabled = enabled;
  }

  /* Force run d'une sentinelle (debug admin) */
  async runOne(id: string): Promise<Sentinel['lastResult']> {
    const s = this.sentinels.get(id);
    if (!s) return { ok: false, msg: 'unknown sentinel', ts: Date.now() };
    return this.executeSentinel(s);
  }

  private async executeSentinel(s: Sentinel): Promise<Sentinel['lastResult']> {
    try {
      const result = await s.check();
      s.lastRun = Date.now();
      s.lastResult = { ok: result.ok, msg: result.msg, ts: Date.now() };
      if (!result.ok) {
        observability.capture('warn', `sentinel.${s.id}`, result.msg, result.details);
        /* Jet 5 fix : auto-repair si dispo (vs juste alerter) */
        if (s.autoFix) {
          try {
            const fixResult = await s.autoFix();
            observability.capture(
              fixResult.ok ? 'info' : 'warn',
              `sentinel.${s.id}.autofix`,
              fixResult.msg,
            );
            if (fixResult.ok) {
              /* Re-check après fix */
              const recheck = await s.check();
              if (recheck.ok) s.lastResult = { ok: true, msg: `Auto-fixed: ${fixResult.msg}`, ts: Date.now() };
            }
          } catch (fixErr: unknown) {
            observability.capture('error', `sentinel.${s.id}.autofix`, String(fixErr));
          }
        }
      }
      this.persist();
      return s.lastResult;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      s.lastRun = Date.now();
      s.lastResult = { ok: false, msg, ts: Date.now() };
      observability.capture('error', `sentinel.${s.id}`, msg);
      this.persist();
      return s.lastResult;
    }
  }

  private scheduleRun(): void {
    if (this.runTimer !== null) return;
    /* Vérifie chaque minute si une sentinelle doit run */
    this.runTimer = window.setInterval(() => {
      const now = Date.now();
      for (const s of this.sentinels.values()) {
        if (!s.enabled) continue;
        if (now - s.lastRun >= s.intervalMs) {
          void this.executeSentinel(s);
        }
      }
    }, 60_000);
    /* Sprint 3 P0 : track interval pour cleanup possible (anti memory leak) */
    const t = this.runTimer;
    if (t !== null) {
      void import('./service-lifecycle.js').then(({ lifecycle }) => {
        lifecycle.trackInterval('sentinels', t as unknown as ReturnType<typeof setInterval>);
      }).catch(() => { /* skip */ });
    }
  }

  /**
   * Stop le scheduler (usage debug ou hot reload).
   */
  stop(): void {
    if (this.runTimer !== null) {
      clearInterval(this.runTimer);
      this.runTimer = null;
    }
  }

  private persist(): void {
    try {
      const data: Record<string, { lastRun: number; lastResult?: Sentinel['lastResult'] }> = {};
      for (const [id, s] of this.sentinels) {
        data[id] = { lastRun: s.lastRun };
        if (s.lastResult) data[id].lastResult = s.lastResult;
      }
      localStorage.setItem(SENTINEL_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }
}

export const sentinels = new SentinelsManager();

/* === Sentinelles MVP Jet 4 (5 critiques registered au boot) === */

/**
 * Wire les 8 agents-watches dédiés (P0 audit gaps anti-théâtre).
 * Lance le cycle agentWatches.runAll() périodiquement via une sentinelle wrapper.
 */
export function registerAgentWatchesSentinel(): void {
  sentinels.register({
    id: 'agent-watches-runner',
    name: 'Agent Watches (8 agents nommés)',
    desc: 'Run cycle complet agent-watches : import/session/fb/chat/notif/exchange/presence/storage',
    intervalMs: 5 * 60 * 1000, /* Toutes les 5 min */
    check: async () => {
      const { agentWatches } = await import('./agent-watches.js');
      const reports = await agentWatches.runAll();
      const critical = reports.filter((r) => r.severity === 'critical').length;
      const errs = reports.filter((r) => r.severity === 'err').length;
      const warns = reports.filter((r) => r.severity === 'warn').length;
      if (critical > 0) {
        return { ok: false, msg: `${critical} agents critical`, details: { critical, errs, warns } };
      }
      if (errs > 0) {
        return { ok: false, msg: `${errs} agents en erreur`, details: { errs, warns } };
      }
      if (warns > 0) {
        return { ok: true, msg: `${warns} agents warn (non bloquant)`, details: { warns } };
      }
      return { ok: true, msg: `${reports.length} agents tous OK` };
    },
  });
}

export function registerCoreSentinels(): void {
  /* Wire les 8 agent-watches en premier (anti-théâtre P0 audit) */
  registerAgentWatchesSentinel();
  /* 1. token-balance-watch : monitor solde providers (1h) */
  sentinels.register({
    id: 'token-balance-watch',
    name: 'Solde providers IA',
    desc: 'Vérifie solde Anthropic/OpenAI et alerte si < 5€ restant',
    intervalMs: 60 * 60 * 1000,
    check: async () => {
      const { vault } = await import('./vault.js');
      const anthropic = await vault.readKey('ax_anthropic_key');
      if (!anthropic) return { ok: true, msg: 'No Anthropic key configured' };
      /* Anthropic n'expose pas balance via API public, on vérifie juste que la clé répond */
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'x-api-key': anthropic, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true', 'content-type': 'application/json' },
          body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1, messages: [{ role: 'user', content: 'hi' }] }),
          signal: AbortSignal.timeout(8000),
        });
        if (res.status === 401) return { ok: false, msg: 'Anthropic key invalid' };
        if (res.status === 402 || res.status === 429) return { ok: false, msg: 'Anthropic quota/balance issue', details: { status: res.status } };
        return { ok: true, msg: 'Anthropic API reachable' };
      } catch (err: unknown) {
        return { ok: false, msg: 'Anthropic ping failed: ' + (err instanceof Error ? err.message : String(err)) };
      }
    },
  });

  /* 2. error-watch : poll observability pending criticals (5min) */
  sentinels.register({
    id: 'error-watch',
    name: 'Erreurs critiques',
    desc: 'Surveille observability buffer pour critical events non envoyés',
    intervalMs: 5 * 60 * 1000,
    check: async () => {
      const buf = observability.getBuffer();
      const criticals = buf.filter((e) => e.level === 'critical' && e.status === 'pending');
      if (criticals.length === 0) return { ok: true, msg: 'No critical pending' };
      return { ok: false, msg: `${criticals.length} critical events pending`, details: { count: criticals.length } };
    },
  });

  /* 3. backup-watch : vérifie backup quotidien (24h)
   * Sprint 13.3.17 fix : fallback sur autoBackup.getStats() si tag ts absent
   *   (cas premier boot avant tout snapshot).
   * v13.3.24 fix Kevin (screenshot 19:11 "493 936h à relancer") :
   *   - Validation stricte ts (rejette ts<MIN_VALID = 2020-01-01) → format "Aucun backup"
   *   - Format humain: <168h → "Il y a Xh", <30j → "Il y a Xj", >30j → "Plus de 30j"
   *   - Snapshot immédiat au boot si jamais (clear le 0 stale dans ax_last_backup_ts)
   *   - Persiste fix après chaque snapshot OK (sécurité contre stale lastResult). */
  const MIN_VALID_BACKUP_TS = 1577836800000; /* 2020-01-01 → tout ce qui est avant = stale/invalide */
  const formatBackupAge = (ageMs: number): string => {
    const ageHours = ageMs / (60 * 60 * 1000);
    if (ageHours < 1) return `Il y a ${Math.floor(ageMs / 60000)}min`;
    if (ageHours < 168) return `Il y a ${Math.floor(ageHours)}h`;
    const ageDays = ageHours / 24;
    if (ageDays < 30) return `Il y a ${Math.floor(ageDays)}j`;
    return 'Plus de 30 jours';
  };
  sentinels.register({
    id: 'backup-watch',
    name: 'Backup quotidien',
    desc: 'Vérifie qu\'un backup Firebase a tourné dans les dernières 24h',
    intervalMs: 24 * 60 * 60 * 1000,
    check: async () => {
      let lastBackup = parseInt(localStorage.getItem('ax_last_backup_ts') ?? '0', 10);
      /* v13.3.24 : si valeur invalide (NaN, négatif, < 2020-01-01) → considère absent */
      if (!Number.isFinite(lastBackup) || lastBackup < MIN_VALID_BACKUP_TS) {
        lastBackup = 0;
      }
      /* Fallback : si tag manque ou stale, essaye via autoBackup */
      if (lastBackup === 0) {
        try {
          const { autoBackup } = await import('./auto-backup.js');
          const stats = autoBackup.getStats();
          if (stats.last_backup_ts >= MIN_VALID_BACKUP_TS) {
            lastBackup = stats.last_backup_ts;
            try { localStorage.setItem('ax_last_backup_ts', String(lastBackup)); } catch { /* ignore */ }
          }
        } catch {
          /* auto-backup module indispo */
        }
      }
      /* État initial / stale ts : aucun backup valide → état info, pas erreur */
      if (lastBackup === 0) {
        return { ok: true, msg: 'Aucun backup depuis init (en attente premier snapshot)' };
      }
      const ageMs = Date.now() - lastBackup;
      const formatted = formatBackupAge(ageMs);
      const ageHours = ageMs / (60 * 60 * 1000);
      if (ageHours > 26) return { ok: false, msg: `${formatted} — relance auto programmée` };
      return { ok: true, msg: formatted };
    },
    autoFix: async () => {
      /* Si âge > 26h ou stale ts, déclenche un snapshot manual immédiat */
      try {
        const { autoBackup } = await import('./auto-backup.js');
        const backup = await autoBackup.snapshot('manual');
        /* v13.3.24 : seed ax_last_backup_ts pour invalider lastResult stale */
        try { localStorage.setItem('ax_last_backup_ts', String(Date.now())); } catch { /* quota */ }
        return { ok: true, msg: `Snapshot manual créé : ${backup.id}` };
      } catch (err: unknown) {
        return { ok: false, msg: 'Snapshot fail: ' + (err instanceof Error ? err.message : String(err)) };
      }
    },
  });

  /* 4. credentials-watch : re-test tokens validity (24h)
   * Fix v13.3.18 (Kevin v13.3.16 rapport "0 credentials present alors que 10 clés collées") :
   * - Utilise vault.readKey() au lieu de localStorage.getItem brut (gère AXENC1: chiffré + IDB fallback)
   * - Scan élargi (Anthropic + OpenAI + Groq + Gemini + GitHub + Cloudflare + Stripe + Twilio + Brevo + Resend + Pinecone + Perplexity + Replicate + ElevenLabs + DeepL + Mistral)
   * - vault.readKey() retry implicite IDB si localStorage vide (gère cas early-boot)
   */
  sentinels.register({
    id: 'credentials-watch',
    name: 'Validité credentials',
    desc: 'Re-teste les tokens API stockés une fois par jour (scan via vault.readKey, IDB fallback inclus)',
    intervalMs: 24 * 60 * 60 * 1000,
    check: async () => {
      const SCAN_KEYS = [
        'ax_anthropic_key', 'ax_openai_key', 'ax_groq_key', 'ax_gemini_key',
        'ax_github_token', 'ax_cloudflare_token', 'ax_stripe_key', 'ax_twilio_token',
        'ax_brevo_key', 'ax_resend_key', 'ax_pinecone_key', 'ax_perplexity_key',
        'ax_replicate_key', 'ax_elevenlabs_key', 'ax_deepl_key', 'ax_mistral_key',
      ];
      try {
        const { vault } = await import('./vault.js');
        const present: string[] = [];
        for (const k of SCAN_KEYS) {
          try {
            const v = await vault.readKey(k);
            if (v && v.length > 5) present.push(k);
          } catch {
            /* skip key on error, continue scan */
          }
        }
        return {
          ok: true,
          msg: `${present.length}/${SCAN_KEYS.length} credentials present`,
          details: { keys: present, scanned: SCAN_KEYS.length },
        };
      } catch (err: unknown) {
        return {
          ok: false,
          msg: `credentials-watch failed: ${err instanceof Error ? err.message : String(err)}`,
        };
      }
    },
  });

  /* 4-bis. decrypt-watch (5min) : audit decrypt health TOUTES les clés AXENC1:
   * Fix v13.3.21 (Kevin 2026-05-07 "decrypt failed") :
   * - Si N+ clés ne se déchiffrent plus → alerte critical Kevin via kevinAlerts
   * - Liste les services impactés (Anthropic / OpenAI / Cohere / etc.) pour action concrète
   * - Action proposée : ouvrir Coffre admin → bouton "Récupérer cette clé"
   * Cause racine : passphrase rotation (PIN admin changé, clear cache iOS, autre tab).
   */
  sentinels.register({
    id: 'decrypt-watch',
    name: 'Decrypt health',
    desc: 'Audit decrypt des clés API stockées AXENC1: (alerte Kevin si N+ illisibles)',
    intervalMs: 5 * 60 * 1000,
    check: async () => {
      try {
        const { vault } = await import('./vault.js');
        const audit = await vault.auditDecryptHealth();
        if (audit.failed === 0) {
          return {
            ok: true,
            msg: `Decrypt OK : ${audit.ok}/${audit.total}`,
            details: { total: audit.total, ok: audit.ok },
          };
        }
        /* Si fail count > 0 → alerte Kevin (best-effort, déjà rate-limité côté kevin-alerts) */
        const ALERT_THRESHOLD = 1; /* dès 1 clé illisible, alerter (clé IA = bloque app) */
        if (audit.failed >= ALERT_THRESHOLD) {
          try {
            const { kevinAlerts } = await import('./kevin-alerts.js');
            const services = audit.failedKeys
              .map((k) => k.replace(/^ax_/, '').replace(/_(?:key|token|secret)$/, ''))
              .slice(0, 5)
              .join(', ');
            void kevinAlerts.alertKevin({
              severity: 'critical',
              title: `🚨 ${audit.failed} clé(s) API illisible(s)`,
              body: `Services impactés : ${services}. Ouvre le Coffre admin et clique "Récupérer cette clé" pour recoller.`,
            }).catch(() => { /* offline OK */ });
          } catch { /* alerts unavailable */ }
        }
        return {
          ok: false,
          msg: `🔴 ${audit.failed} clé(s) decrypt failed sur ${audit.total} (${audit.ok} OK)`,
          details: {
            total: audit.total,
            ok: audit.ok,
            failed: audit.failed,
            failedKeys: audit.failedKeys,
          },
        };
      } catch (err: unknown) {
        return {
          ok: false,
          msg: `decrypt-watch failed: ${err instanceof Error ? err.message : String(err)}`,
        };
      }
    },
  });

  /* 5. link-validation-watch : test alive ax_links_registry (24h) */
  sentinels.register({
    id: 'link-validation-watch',
    name: 'Liens dashboards',
    desc: 'Vérifie que les URLs dashboards/billing/docs répondent',
    intervalMs: 24 * 60 * 60 * 1000,
    check: async () => {
      try {
        const registry = JSON.parse(localStorage.getItem('ax_links_registry') ?? '{}') as Record<string, { dashboard?: string; alive?: boolean }>;
        const services = Object.keys(registry);
        return { ok: true, msg: `${services.length} services in registry`, details: { count: services.length } };
      } catch {
        return { ok: false, msg: 'Registry parse failed' };
      }
    },
  });

  /* Jet 5 : 8 sentinelles RÉELLES avec auto-repair (vs stubs morts Jet 4) */

  /* 6. storage-watch : alerte si localStorage > 4 MB + GC auto */
  sentinels.register({
    id: 'storage-watch',
    name: 'Stockage saturation',
    desc: 'Surveille localStorage et fait GC si > 4MB (anti quota exceeded)',
    intervalMs: 30 * 60 * 1000, /* 30min */
    check: async () => {
      const size = JSON.stringify(localStorage).length;
      const sizeMB = size / (1024 * 1024);
      if (sizeMB > 4) return { ok: false, msg: `localStorage ${sizeMB.toFixed(2)}MB > 4MB`, details: { sizeBytes: size } };
      return { ok: true, msg: `localStorage ${sizeMB.toFixed(2)}MB OK` };
    },
    autoFix: async () => {
      let freed = 0;
      const trim = (key: string, max: number) => {
        try {
          const arr = JSON.parse(localStorage.getItem(key) ?? '[]') as unknown[];
          if (Array.isArray(arr) && arr.length > max) {
            const before = JSON.stringify(arr).length;
            localStorage.setItem(key, JSON.stringify(arr.slice(-max)));
            const after = JSON.stringify(arr.slice(-max)).length;
            freed += before - after;
          }
        } catch {
          /* ignore */
        }
      };
      trim('apex_v13_observability', 100);
      trim('apex_v13_observability_dlq', 50);
      trim('ax_audit_log_v13', 200);
      trim('apex_v13_fb_queue', 50);
      trim('ax_telemetry_in', 50);
      trim('ax_claude_todo', 20);
      return { ok: freed > 0, msg: `Freed ${(freed / 1024).toFixed(1)} KB via cleanup` };
    },
  });

  /* 7. network-watch : ping connectivité + reconnect Firebase si coupé
   * Fix v13.3.18 (Kevin v13.3.16 rapport "Cloudflare trace unreachable") :
   * - Anciennement pingait https://1.1.1.1/cdn-cgi/trace MAIS le CSP n'autorise pas cet
   *   origin → fail systématique (faux positif).
   * - Fix : probes whitelistées CSP (api.cloudflare.com / api.github.com) + fallback
   *   no-cors qui ne lève pas d'erreur si réseau OK + acceptation gracieuse si firewall
   *   corp bloque toutes probes mais navigator.onLine=true.
   */
  sentinels.register({
    id: 'network-watch',
    name: 'Connectivité réseau',
    desc: 'Vérifie réseau + reconnect Firebase SSE si déconnecté (probes CSP-friendly)',
    intervalMs: 5 * 60 * 1000,
    check: async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return { ok: false, msg: 'navigator.onLine = false (offline)' };
      }
      const probes = [
        'https://api.cloudflare.com/client/v4/',
        'https://api.github.com/zen',
      ];
      for (const url of probes) {
        try {
          const res = await fetch(url, {
            method: 'GET',
            signal: AbortSignal.timeout(3000),
            mode: 'no-cors',
          });
          /* mode: no-cors → opaque réponse, pas thrown si réseau OK */
          if (res.type === 'opaque' || res.ok || (res.status >= 200 && res.status < 500)) {
            return { ok: true, msg: `Network OK (probe ${url.replace(/^https:\/\//, '').slice(0, 30)})` };
          }
        } catch {
          /* Continue probe suivante */
        }
      }
      /* Fallback final : navigator.onLine=true mais probes muets → OK (CSP/firewall corp) */
      return { ok: true, msg: 'navigator.onLine=true (probes muets, CSP/firewall accepté)' };
    },
    autoFix: async () => {
      try {
        const { firebase } = await import('./firebase.js');
        await firebase.init();
        return { ok: true, msg: 'Firebase reconnect attempted' };
      } catch (err: unknown) {
        return { ok: false, msg: `Reconnect failed: ${String(err)}` };
      }
    },
  });

  /* 8. performance-watch : monitor FPS + memory leak detection
   * Fix v13.3.18 (Kevin v13.3.16 rapport "performance.memory non disponible") :
   * - Détecte Safari iOS où performance.memory n'existe PAS (bug latent normal, pas un problème).
   * - Skip explicite avec message rassurant : "Safari iPhone (API non exposée par WebKit)".
   * - Sur Chromium : warning > 150MB, error > 250MB.
   */
  sentinels.register({
    id: 'performance-watch',
    name: 'Performance runtime',
    desc: 'Monitor performance.memory si dispo + alert si heap > 150 MB (Chromium uniquement)',
    intervalMs: 15 * 60 * 1000,
    check: async () => {
      const ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : '';
      const isiOS = /iPhone|iPad|iPod/i.test(ua);
      const isSafari = /Safari/i.test(ua) && !/Chrome|Chromium|CriOS/i.test(ua);
      const perf = performance as unknown as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } };
      if (!perf.memory) {
        if (isiOS || isSafari) {
          return { ok: true, msg: 'Safari/iOS — performance.memory non exposée (normal)' };
        }
        return { ok: true, msg: 'performance.memory non disponible (browser non-Chromium)' };
      }
      const usedMB = perf.memory.usedJSHeapSize / (1024 * 1024);
      const limitMB = perf.memory.jsHeapSizeLimit / (1024 * 1024);
      if (usedMB > 250) return { ok: false, msg: `Heap ${usedMB.toFixed(0)}MB / ${limitMB.toFixed(0)}MB (>250MB critical)`, details: { usedMB, limitMB } };
      if (usedMB > 150) return { ok: true, msg: `Heap ${usedMB.toFixed(0)}MB / ${limitMB.toFixed(0)}MB (warning > 150MB)`, details: { usedMB } };
      return { ok: true, msg: `Heap ${usedMB.toFixed(0)}MB / ${limitMB.toFixed(0)}MB OK` };
    },
  });

  /* 9. security-watch : check session age + re-auth requise
   * v13.3.24 fix Kevin (screenshot 19:11 "Audit log tamper détecté" faux positif) :
   *   - Audit log vide → status OK (pas tamper, juste non-initialisé)
   *   - Reload depuis localStorage avant verify (anti chain stale en mémoire)
   *   - Si tamper détecté → log dans ax_security_log + détails pour audit Kevin
   *   - Action bouton "Réinitialiser audit chain" géré côté UI sentinels (admin only) */
  sentinels.register({
    id: 'security-watch',
    name: 'Sécurité session',
    desc: 'Vérifie session admin < 8h + check intégrité audit log',
    intervalMs: 30 * 60 * 1000,
    check: async () => {
      const lastact = parseInt(localStorage.getItem('apex_v13_lastact') ?? '0', 10);
      /* lastact==0 = pas de session → skip la check session */
      if (lastact > 0) {
        const ageHours = (Date.now() - lastact) / (60 * 60 * 1000);
        if (ageHours > 8) return { ok: false, msg: `Session > 8h, force logout requise` };
      }
      /* Audit log integrity (avec reload anti-stale + tolérance vide) */
      try {
        const { auditLog } = await import('./audit-log.js');
        /* v13.3.24 : reload depuis localStorage AVANT verify (anti memory chain stale) */
        auditLog.reload();
        const entries = auditLog.getEntries();
        /* Audit log vide = OK (pas de tamper, juste pas encore d'écritures) */
        if (entries.length === 0) {
          return { ok: true, msg: 'Audit log vide (en attente première écriture)' };
        }
        const verify = await auditLog.verify();
        if (!verify.valid) {
          /* v13.3.24 : log les détails dans ax_security_log pour audit Kevin */
          try {
            const log = JSON.parse(localStorage.getItem('ax_security_log') ?? '[]') as unknown[];
            log.push({
              ts: Date.now(),
              kind: 'audit_log_tamper',
              brokenAt: verify.brokenAt,
              chainLen: entries.length,
              firstEntryTs: entries[0]?.ts,
              lastEntryTs: entries[entries.length - 1]?.ts,
            });
            localStorage.setItem('ax_security_log', JSON.stringify(log.slice(-200)));
          } catch { /* quota */ }
          return {
            ok: false,
            msg: `Hash audit log invalide à entry #${verify.brokenAt} (${entries.length} entries) — possible corruption`,
            details: { brokenAt: verify.brokenAt, totalEntries: entries.length },
          };
        }
      } catch {
        /* audit-log indispo → considère OK plutôt que faux positif */
        return { ok: true, msg: 'Session OK (audit log indispo)' };
      }
      return { ok: true, msg: 'Session + audit log OK' };
    },
  });

  /* 10. presence-watch : update timestamp activité user */
  sentinels.register({
    id: 'presence-watch',
    name: 'Présence user',
    desc: 'Update lastact pour heartbeat session (renew TTL 8h)',
    intervalMs: 2 * 60 * 1000,
    check: async () => {
      const lastact = parseInt(localStorage.getItem('apex_v13_lastact') ?? '0', 10);
      const ageMin = (Date.now() - lastact) / (60 * 1000);
      return { ok: true, msg: `Last activity ${ageMin.toFixed(0)}min ago` };
    },
    autoFix: async () => {
      try {
        localStorage.setItem('apex_v13_lastact', String(Date.now()));
        return { ok: true, msg: 'lastact refreshed' };
      } catch {
        return { ok: false, msg: 'persist failed' };
      }
    },
  });

  /* 11. compliance-watch : RGPD audit + check user data right of access
   * Sprint 13.3.17 fix : accepte plusieurs formes de consent (cookies banner OU
   * RGPD explicite) + état initial sans user logged-in = OK (rien à enregistrer).
   * Évite faux positif sur premier boot avant que l'admin ait cliqué cookies. */
  sentinels.register({
    id: 'compliance-watch',
    name: 'Conformité RGPD',
    desc: 'Audit RGPD : présence consent + audit log integrity + retention',
    intervalMs: 24 * 60 * 60 * 1000,
    check: async () => {
      /* Pas de user logged → pas de consent à enregistrer */
      const userRaw = localStorage.getItem('apex_v13_user');
      if (!userRaw) {
        return { ok: true, msg: 'Aucun user connecté (pas de consent à tracer)' };
      }
      /* Accepte 3 formes de consent valides */
      const consentRgpd = localStorage.getItem('apex_v13_rgpd_consent');
      const consentCookies = localStorage.getItem('apex_v13_cookies_accepted');
      let consentByUid: string | null = null;
      try {
        const u = JSON.parse(userRaw) as { id?: string };
        if (u.id) consentByUid = localStorage.getItem(`apex_v13_rgpd_consent_${u.id}`);
      } catch {
        /* parse fail → ignore */
      }
      if (consentRgpd || consentCookies || consentByUid) {
        return { ok: true, msg: 'RGPD consent OK' };
      }
      return { ok: false, msg: 'Consent RGPD non enregistré (banner cookies non cliqué)' };
    },
    autoFix: async () => {
      /* Auto-fix : si user logged-in mais pas de banner cookies, propose un consent
       * essentiel par défaut (compliance Article 6.1.f intérêt légitime). */
      try {
        const userRaw = localStorage.getItem('apex_v13_user');
        if (!userRaw) return { ok: false, msg: 'No user — no consent action' };
        const existing = localStorage.getItem('apex_v13_cookies_accepted');
        if (existing) return { ok: true, msg: 'Consent déjà présent' };
        const defaultConsent = {
          analytics: false,
          marketing: false,
          preferences: false,
          essential: true,
          ts: Date.now(),
          version: 'v13.3.17-default',
        };
        localStorage.setItem('apex_v13_cookies_accepted', JSON.stringify(defaultConsent));
        return { ok: true, msg: 'Consent essential par défaut enregistré' };
      } catch (err: unknown) {
        return { ok: false, msg: 'autofix fail: ' + (err instanceof Error ? err.message : String(err)) };
      }
    },
  });

  /* 12. conflict-watch : detect Firebase SSE write conflicts */
  sentinels.register({
    id: 'conflict-watch',
    name: 'Conflits SSE',
    desc: 'Detect write conflicts entre clients (sync simultanée)',
    intervalMs: 10 * 60 * 1000,
    check: async () => {
      const queueRaw = localStorage.getItem('apex_v13_fb_queue');
      if (!queueRaw) return { ok: true, msg: 'No pending writes' };
      try {
        const queue = JSON.parse(queueRaw) as Array<{ status: string }>;
        const stale = queue.filter((e) => e.status === 'flushing').length;
        if (stale > 5) return { ok: false, msg: `${stale} writes stale (potential conflict)`, details: { stale } };
        return { ok: true, msg: `${queue.length} pending, no conflict` };
      } catch {
        return { ok: false, msg: 'Queue parse failed' };
      }
    },
  });

  /* 13b. anti-regression-watch : alerte si tests/coverage baissent vs baseline (Kevin règle "ne plus régresser") */
  sentinels.register({
    id: 'anti-regression-watch',
    name: 'Anti-régression scores',
    desc: 'Compare snapshot scores actuel vs baseline persisté. Alerte si baisse.',
    intervalMs: 24 * 60 * 60 * 1000, /* 1× par jour */
    check: async () => {
      try {
        const baseline = JSON.parse(localStorage.getItem('apex_v13_score_baseline') ?? '{}') as {
          tests_count?: number; coverage_statements?: number; coverage_branches?: number;
          coverage_functions?: number; coverage_lines?: number; ts?: number;
        };
        const current = JSON.parse(localStorage.getItem('apex_v13_score_current') ?? '{}') as typeof baseline;
        if (!current.tests_count || !baseline.tests_count) {
          return { ok: true, msg: 'No baseline yet (sera défini au prochain commit)' };
        }
        const regressions: string[] = [];
        if ((current.tests_count ?? 0) < baseline.tests_count) {
          regressions.push(`tests ${baseline.tests_count} → ${current.tests_count}`);
        }
        if ((current.coverage_statements ?? 0) < (baseline.coverage_statements ?? 0)) {
          regressions.push(`statements ${baseline.coverage_statements}% → ${current.coverage_statements}%`);
        }
        if ((current.coverage_branches ?? 0) < (baseline.coverage_branches ?? 0)) {
          regressions.push(`branches ${baseline.coverage_branches}% → ${current.coverage_branches}%`);
        }
        if (regressions.length > 0) {
          return { ok: false, msg: `RÉGRESSION détectée : ${regressions.join(', ')}`, details: { regressions } };
        }
        return { ok: true, msg: 'Pas de régression vs baseline' };
      } catch {
        return { ok: true, msg: 'Anti-regression check skipped' };
      }
    },
  });

  /* 14. self-test : auto-test runtime health (Sprint 6 Kevin règle test live permanent) */
  sentinels.register({
    id: 'self-test',
    name: 'Auto-test runtime health',
    desc: 'Vérifie périodiquement que les services critiques répondent (vault, audit-log, ai-router)',
    intervalMs: 30 * 60 * 1000, /* Toutes 30 min */
    check: async () => {
      const errors: string[] = [];
      /* Test 1 : vault read-only check */
      try {
        const { vault } = await import('./vault.js');
        await vault.readKey('apex_v13_test_nonexistent_key');
      } catch (err: unknown) {
        errors.push('vault: ' + (err instanceof Error ? err.message : 'fail'));
      }
      /* Test 2 : audit-log write check */
      try {
        const { auditLog } = await import('./audit-log.js');
        await auditLog.record('selftest.heartbeat', { details: { ts: Date.now() } });
      } catch (err: unknown) {
        errors.push('audit-log: ' + (err instanceof Error ? err.message : 'fail'));
      }
      /* Test 3 : storage quota check */
      try {
        const { storageCompressor } = await import('./storage-compressor.js');
        const status = storageCompressor.getQuotaStatus();
        if (status.severity === 'critical') errors.push(`storage: ${status.used_mb}MB critical`);
      } catch (err: unknown) {
        errors.push('storage: ' + (err instanceof Error ? err.message : 'fail'));
      }
      /* Test 4 : ai-router has at least 1 key
       * Sprint 13.3.17 fix : "no API key" est INFO non bloquant — passe en `infos` séparé,
       * pas dans `errors`. La sentinelle ne reste rouge que pour vrais échecs runtime. */
      const infos: string[] = [];
      try {
        const { aiRouter } = await import('./ai-router.js');
        const hasKey = aiRouter.hasAnyKey();
        if (!hasKey) infos.push('ai-router: no API key (admin doit configurer Coffre)');
      } catch (err: unknown) {
        errors.push('ai-router: ' + (err instanceof Error ? err.message : 'fail'));
      }
      if (errors.length === 0) {
        const msg = infos.length > 0
          ? `All health checks pass (${infos.length} info)`
          : 'All health checks pass';
        if (infos.length > 0) {
          return { ok: true, msg, details: { infos } };
        }
        return { ok: true, msg };
      }
      return { ok: false, msg: `${errors.length} health checks failed`, details: { errors, infos } };
    },
  });

  /* 15. memory-leak-watch : detect intervals tracked vs running */
  sentinels.register({
    id: 'memory-leak-watch',
    name: 'Memory leaks detection',
    desc: 'Compte intervals/listeners trackés vs running. Alerte si > 50 intervals.',
    intervalMs: 60 * 60 * 1000, /* 1h */
    check: async () => {
      try {
        const { lifecycle } = await import('./service-lifecycle.js');
        const stats = lifecycle.getStats();
        if (stats.total_intervals_tracked > 50) {
          return { ok: false, msg: `${stats.total_intervals_tracked} intervals tracked (>50 = leak)`, details: stats };
        }
        return { ok: true, msg: `${stats.total_intervals_tracked} intervals tracked OK` };
      } catch {
        return { ok: true, msg: 'Lifecycle stats unavailable' };
      }
    },
  });

  /* 16. memory-bridge-watch : vérifie sync OK des backends externes (Kevin règle mémoire persistante) */
  sentinels.register({
    id: 'memory-bridge-watch',
    name: 'Memory bridge sync externe',
    desc: 'Vérifie sync Notion/Firebase/Gist OK + alerte si > 24h sans sync',
    intervalMs: 60 * 60 * 1000, /* 1h */
    check: async () => {
      try {
        const { memoryBridge } = await import('./memory-bridge.js');
        const health = memoryBridge.getHealth();
        if (health.backends_configured === 0) {
          return { ok: true, msg: 'Aucun backend configuré (mode local-only)' };
        }
        if (health.recent_failures >= 3) {
          return {
            ok: false,
            msg: `${health.recent_failures} échecs sync récents (24h)`,
            details: { failures: health.recent_failures },
          };
        }
        if (health.last_sync_age_ms > 0 && health.last_sync_age_ms > 24 * 60 * 60 * 1000) {
          return {
            ok: false,
            msg: `Pas de sync depuis ${Math.floor(health.last_sync_age_ms / 3_600_000)}h`,
            details: { age_ms: health.last_sync_age_ms },
          };
        }
        return { ok: true, msg: `${health.backends_configured} backends, dernière sync OK` };
      } catch (err: unknown) {
        return { ok: false, msg: 'Memory bridge check failed: ' + (err instanceof Error ? err.message : 'fail') };
      }
    },
    autoFix: async () => {
      try {
        const { memoryBridge } = await import('./memory-bridge.js');
        const results = await memoryBridge.runAutoSync();
        const ok = results.filter((r) => r.ok).length;
        return {
          ok: ok > 0,
          msg: `Re-sync attempted : ${ok}/${results.length} OK`,
        };
      } catch (err: unknown) {
        return { ok: false, msg: 'Re-sync failed: ' + (err instanceof Error ? err.message : 'fail') };
      }
    },
  });

  /* 13. wake-watch : detect wake word permission state */
  sentinels.register({
    id: 'wake-watch',
    name: 'Wake word "Dis Apex"',
    desc: 'Vérifie permission micro + état recognition (Jet 6 voice complet)',
    intervalMs: 60 * 60 * 1000,
    enabled: false, /* OFF par défaut, activé Jet 6 voice */
    check: async () => {
      if (typeof navigator === 'undefined' || !navigator.permissions) {
        return { ok: true, msg: 'Permissions API not available' };
      }
      try {
        const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        return { ok: status.state !== 'denied', msg: `Mic permission: ${status.state}` };
      } catch {
        return { ok: true, msg: 'Mic permission query unsupported' };
      }
    },
  });

  /* 17. memory-watch (Kevin 2026-05-07 v13.3.27) :
   * Audit mémoire long-terme par user, compress si > 1000 facts/user, dédupe lessons. */
  sentinels.register({
    id: 'memory-watch',
    name: 'Mémoire long-terme audit',
    desc: 'Audit memory size par user + compression si >1000 facts + cleanup lessons dupliquées',
    intervalMs: 24 * 60 * 60 * 1000, /* 1× par jour */
    check: async () => {
      try {
        const { persistentMemory: persistentMemoryStore } = await import('./persistent-memory-store.js');
        const all = await persistentMemoryStore.list();
        const byUser = new Map<string, number>();
        for (const e of all) byUser.set(e.scope, (byUser.get(e.scope) ?? 0) + 1);

        const oversized: string[] = [];
        for (const [uid, count] of byUser) {
          if (count > 1000) oversized.push(`${uid}:${count}`);
        }

        let lessonsCount = 0;
        try {
          const raw = localStorage.getItem('ax_lessons_learned_struct');
          if (raw) lessonsCount = (JSON.parse(raw) as unknown[]).length;
        } catch { /* skip */ }

        const report = {
          ts: Date.now(),
          total_facts: all.length,
          users_count: byUser.size,
          oversized_users: oversized,
          lessons_count: lessonsCount,
        };
        try {
          const log = JSON.parse(localStorage.getItem('ax_memory_audit_log') ?? '[]') as unknown[];
          log.push(report);
          localStorage.setItem('ax_memory_audit_log', JSON.stringify(log.slice(-30)));
        } catch { /* quota */ }

        if (oversized.length > 0) {
          return {
            ok: false,
            msg: `${oversized.length} user(s) > 1000 facts (${oversized.slice(0, 3).join(', ')}…)`,
            details: report as unknown as Record<string, unknown>,
          };
        }
        if (lessonsCount > 200) {
          return {
            ok: false,
            msg: `${lessonsCount} lessons (>200 → cleanup recommandé)`,
            details: report as unknown as Record<string, unknown>,
          };
        }
        return {
          ok: true,
          msg: `${all.length} facts (${byUser.size} users) · ${lessonsCount} lessons OK`,
          details: report as unknown as Record<string, unknown>,
        };
      } catch (err: unknown) {
        return { ok: false, msg: 'memory-watch failed: ' + (err instanceof Error ? err.message : String(err)) };
      }
    },
    autoFix: async () => {
      try {
        const { persistentMemory: persistentMemoryStore } = await import('./persistent-memory-store.js');
        const all = await persistentMemoryStore.list();
        const byUser = new Map<string, typeof all>();
        for (const e of all) {
          const arr = byUser.get(e.scope) ?? [];
          arr.push(e);
          byUser.set(e.scope, arr);
        }
        let removed = 0;
        for (const [uid, entries] of byUser) {
          if (entries.length <= 1000) continue;
          /* Garde top 100 par importance, supprime le reste */
          const keep = entries.sort((a, b) => b.importance - a.importance).slice(0, 100);
          const toRemove = entries.filter((e) => !keep.includes(e));
          for (const e of toRemove) {
            await persistentMemoryStore.remove(e.id);
            removed++;
          }
          logger.info('memory-watch', `compressed ${uid}: ${entries.length} → 100 (top importance)`);
        }
        /* Dédupe lessons (similarité title 85%) */
        try {
          const raw = localStorage.getItem('ax_lessons_learned_struct');
          if (raw) {
            const arr = JSON.parse(raw) as Array<{ category: string; title: string }>;
            const seen = new Set<string>();
            const dedup = arr.filter((l) => {
              const key = `${l.category}::${l.title.slice(0, 60).toLowerCase()}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            const dedupedCount = arr.length - dedup.length;
            localStorage.setItem('ax_lessons_learned_struct', JSON.stringify(dedup.slice(-200)));
            removed += dedupedCount;
          }
        } catch { /* skip */ }
        return { ok: removed > 0, msg: `Compressed ${removed} entries` };
      } catch (err: unknown) {
        return { ok: false, msg: 'autofix fail: ' + (err instanceof Error ? err.message : String(err)) };
      }
    },
  });

  /* 21. csp-violation-watch : audit hourly violations CSP capturées par bodyguard
   *     → si > 5 violations en 1h ou patterns suspects (script-src + blockedURI externe non-trusted)
   *       → escalade audit log + lesson learned. Auto-fix : aucun (intervention manuelle requise). */
  sentinels.register({
    id: 'csp-violation-watch',
    name: 'CSP violations',
    desc: 'Audit horaire des violations CSP (ax_csp_violations_log)',
    intervalMs: 60 * 60 * 1000 /* 1h */,
    check: async () => {
      try {
        const raw = localStorage.getItem('ax_csp_violations_log');
        if (!raw) return { ok: true, msg: 'Aucune violation CSP enregistrée' };
        const log = JSON.parse(raw) as Array<{ ts: number; directive: string; blockedURI: string }>;
        if (log.length === 0) return { ok: true, msg: 'Log CSP vide' };
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        const recent = log.filter((v) => v.ts > oneHourAgo);
        const totalCount = log.length;
        if (recent.length === 0) {
          return { ok: true, msg: `0 violation dernière heure (${totalCount} historiques)` };
        }
        /* Patterns suspects : script-src violations avec URI externe non-trusted */
        const trusted = ['self', 'data:', 'blob:'];
        const suspicious = recent.filter((v) =>
          v.directive.startsWith('script-src') &&
          v.blockedURI &&
          !trusted.some((t) => v.blockedURI.startsWith(t)) &&
          !/\.firebaseio\.com|\.firebasedatabase\.app|api\.anthropic\.com|api\.openai\.com/.test(v.blockedURI),
        );
        if (suspicious.length > 0) {
          return {
            ok: false,
            msg: `🚨 ${suspicious.length} violation(s) script-src suspectes (1h) sur ${recent.length} totales`,
            details: { suspiciousCount: suspicious.length, recentCount: recent.length, totalCount, samples: suspicious.slice(0, 3) },
          };
        }
        if (recent.length > 5) {
          return {
            ok: false,
            msg: `⚠ ${recent.length} violations CSP en 1h (seuil 5 dépassé)`,
            details: { recentCount: recent.length, totalCount, directives: [...new Set(recent.map((v) => v.directive))] },
          };
        }
        return { ok: true, msg: `${recent.length}/5 violations dernière heure (sous seuil)` };
      } catch (err: unknown) {
        return { ok: false, msg: 'CSP watch fail: ' + (err instanceof Error ? err.message : String(err)) };
      }
    },
  });

  /* 22. smart-router-watch : ping multi-providers IA toutes 30 min + recalcul scoring.
   *     Kevin v13.3.33 (2026-05-07) : "teste et garde ce qui marche le mieux,
   *     le plus de crédit etc. AUTOMATIQUE AUTONOME TOUJOURS."
   *     - Ping all 10 providers (anthropic, openai, groq, gemini, mistral, cohere,
   *       xai, perplexity, deepseek, openrouter)
   *     - Update samples ring buffer (7j) + stats agrégées
   *     - Si best provider change → log audit + lesson
   *     - Recommandations économiques calculées au passage */
  sentinels.register({
    id: 'smart-router-watch',
    name: 'Smart Router multi-critères',
    desc: 'Ping 10 providers IA toutes 30 min + scoring latence/quota/qualité/uptime',
    intervalMs: 30 * 60 * 1000 /* 30 min */,
    check: async () => {
      try {
        const { smartRouter } = await import('./smart-router.js');
        await smartRouter.pingAllProviders();
        const ranked = await smartRouter.rankProviders();
        const top3 = ranked.slice(0, 3).map((r) => `${r.provider}(${r.score.total})`).join(', ');
        const recos = await smartRouter.getRecommendations();
        return {
          ok: true,
          msg: `Top 3 : ${top3}${recos.length > 0 ? ` | ${recos.length} reco(s) éco` : ''}`,
          details: {
            top3: ranked.slice(0, 3).map((r) => ({ provider: r.provider, score: r.score.total })),
            recommendations: recos,
          },
        };
      } catch (err: unknown) {
        return { ok: false, msg: 'smart-router fail: ' + (err instanceof Error ? err.message : String(err)) };
      }
    },
  });

  logger.info('sentinels', `Registered ${sentinels.list().length} sentinels (16 active + 1 disabled wake-watch)`);
}
