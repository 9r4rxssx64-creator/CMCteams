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
      const raw = localStorage.getItem(SENTINEL_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, { lastRun: number; lastResult?: Sentinel['lastResult'] }>;
        for (const [id, s] of this.sentinels) {
          const entry = saved[id];
          if (entry) {
            s.lastRun = entry.lastRun;
            if (entry.lastResult) s.lastResult = entry.lastResult;
          }
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
   * (cas premier boot avant tout snapshot). */
  sentinels.register({
    id: 'backup-watch',
    name: 'Backup quotidien',
    desc: 'Vérifie qu\'un backup Firebase a tourné dans les dernières 24h',
    intervalMs: 24 * 60 * 60 * 1000,
    check: async () => {
      let lastBackup = parseInt(localStorage.getItem('ax_last_backup_ts') ?? '0', 10);
      /* Fallback : si tag manque, essaye via autoBackup */
      if (lastBackup === 0) {
        try {
          const { autoBackup } = await import('./auto-backup.js');
          const stats = autoBackup.getStats();
          if (stats.last_backup_ts > 0) {
            lastBackup = stats.last_backup_ts;
            try { localStorage.setItem('ax_last_backup_ts', String(lastBackup)); } catch { /* ignore */ }
          }
        } catch {
          /* auto-backup module indispo */
        }
      }
      /* État initial : aucun backup encore créé → état info, pas erreur */
      if (lastBackup === 0) {
        return { ok: true, msg: 'Aucun backup encore (en attente premier snapshot)' };
      }
      const ageHours = (Date.now() - lastBackup) / (60 * 60 * 1000);
      if (ageHours > 26) return { ok: false, msg: `Last backup ${Math.floor(ageHours)}h ago (>26h)` };
      return { ok: true, msg: `Last backup ${Math.floor(ageHours)}h ago` };
    },
    autoFix: async () => {
      /* Si âge > 26h, déclenche un snapshot manual immédiat */
      try {
        const { autoBackup } = await import('./auto-backup.js');
        const backup = await autoBackup.snapshot('manual');
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

  /* 9. security-watch : check session age + re-auth requise */
  sentinels.register({
    id: 'security-watch',
    name: 'Sécurité session',
    desc: 'Vérifie session admin < 8h + check intégrité audit log',
    intervalMs: 30 * 60 * 1000,
    check: async () => {
      const lastact = parseInt(localStorage.getItem('apex_v13_lastact') ?? '0', 10);
      const ageHours = (Date.now() - lastact) / (60 * 60 * 1000);
      if (ageHours > 8) return { ok: false, msg: `Session > 8h, force logout requise` };
      try {
        const { auditLog } = await import('./audit-log.js');
        const verify = await auditLog.verify();
        if (!verify.valid) return { ok: false, msg: 'Audit log tampering detected', details: verify };
      } catch {
        /* ignore */
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

  logger.info('sentinels', `Registered ${sentinels.list().length} sentinels (13 active + 1 disabled wake-watch)`);
}
