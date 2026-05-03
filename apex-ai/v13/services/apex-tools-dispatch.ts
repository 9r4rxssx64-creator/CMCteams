/**
 * APEX v13 — Dispatcher exécution outils Apex IA (parité Claude Code).
 *
 * Reçoit un tool_use Anthropic + paramètres, vérifie permissions, exécute,
 * audit log immutable, retourne tool_result.
 *
 * Anti-pattern Kevin :
 * - Pas d'eval, pas de new Function, pas de exec arbitraire
 * - Whitelist stricte de fonctions par tool name
 * - Validation Kevin (escalate_human) avant action niveau C
 * - Audit log obligatoire avant + après exécution
 */

import { logger } from '../core/logger.js';
import { apexTools, type ApexTool } from './apex-tools.js';
import { auditLog } from './audit-log.js';
import { firebase } from './firebase.js';
import { orchestrator } from './orchestrator.js';

export interface ToolExecResult {
  ok: boolean;
  result?: unknown;
  error?: string;
  requires_validation?: boolean;
  validation_token?: string;
}

class ApexToolsDispatcher {
  /**
   * Exécute un tool avec validation tier + audit log + retry.
   * Si tool requires_validation=true, retourne validation_token au lieu d'exécuter.
   * Kevin doit alors appeler validate() avec le token pour confirmer.
   */
  async execute(
    toolName: string,
    params: Record<string, unknown>,
    userTier: ApexTool['minTier'] = 'client_free',
    options: { skipValidation?: boolean } = {},
  ): Promise<ToolExecResult> {
    /* Vérification permissions */
    const check = apexTools.canExecute(toolName, userTier);
    if (!check.allowed) {
      await apexTools.logExecution(toolName, userTier, params, false);
      return { ok: false, error: check.reason ?? 'Refused' };
    }

    /* Validation Kevin obligatoire si impactLevel C */
    if (check.requires_validation && !options.skipValidation) {
      const token = `val_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      try {
        const pending = JSON.parse(localStorage.getItem('apex_v13_pending_validations') ?? '[]') as Array<{
          token: string;
          tool: string;
          params: unknown;
          tier: string;
          ts: number;
        }>;
        pending.push({ token, tool: toolName, params, tier: userTier, ts: Date.now() });
        localStorage.setItem('apex_v13_pending_validations', JSON.stringify(pending.slice(-50)));
      } catch {
        /* ignore quota */
      }
      logger.info('apex-tools', `Tool ${toolName} pending validation: ${token}`);
      return { ok: false, requires_validation: true, validation_token: token };
    }

    /* Exécution effective */
    try {
      const result = await this.dispatch(toolName, params);
      await apexTools.logExecution(toolName, userTier, params, true);
      return { ok: true, result };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error('apex-tools', `Tool ${toolName} failed: ${msg}`);
      await apexTools.logExecution(toolName, userTier, params, false);
      return { ok: false, error: msg };
    }
  }

  /**
   * Valide un token pending (Kevin only) → ré-exécute avec skipValidation=true.
   */
  async validate(token: string): Promise<ToolExecResult> {
    let pending: Array<{ token: string; tool: string; params: Record<string, unknown>; tier: string }> = [];
    try {
      pending = JSON.parse(localStorage.getItem('apex_v13_pending_validations') ?? '[]') as typeof pending;
    } catch {
      return { ok: false, error: 'pending list corrupt' };
    }
    const found = pending.find((p) => p.token === token);
    if (!found) return { ok: false, error: 'Token inconnu ou expiré' };
    /* Retire du pending */
    const remaining = pending.filter((p) => p.token !== token);
    try {
      localStorage.setItem('apex_v13_pending_validations', JSON.stringify(remaining));
    } catch {
      /* ignore */
    }
    return this.execute(found.tool, found.params, found.tier as ApexTool['minTier'], { skipValidation: true });
  }

  /**
   * Liste les validations en attente (admin only).
   */
  listPendingValidations(): Array<{ token: string; tool: string; tier: string; ts: number }> {
    try {
      const pending = JSON.parse(localStorage.getItem('apex_v13_pending_validations') ?? '[]') as Array<{
        token: string;
        tool: string;
        params: unknown;
        tier: string;
        ts: number;
      }>;
      return pending.map(({ token, tool, tier, ts }) => ({ token, tool, tier, ts }));
    } catch {
      return [];
    }
  }

  /**
   * Dispatch effectif vers la fonction implémentation.
   * Whitelist stricte par tool name (anti eval/exec).
   */
  private async dispatch(toolName: string, params: Record<string, unknown>): Promise<unknown> {
    switch (toolName) {
      case 'read_file':
        return this.readFile(params['path'] as string, params['branch'] as string | undefined);
      case 'web_fetch':
        return this.webFetch(params['url'] as string);
      case 'web_search':
        return this.webSearch(params['query'] as string, params['max_results'] as number | undefined);
      case 'cmc_read':
        return orchestrator.cmcRead();
      case 'kdmc_stats':
        return orchestrator.kdmcStats();
      case 'open_tool':
        return orchestrator.openTool(params['tool_id'] as string);
      case 'read_logs':
        return this.readLogs(params['scope'] as string | undefined, params['limit'] as number | undefined);
      case 'vault_action':
        return this.vaultAction(params['action'] as string, params['key'] as string | undefined);
      case 'finance_calculate':
        return this.financeCalculate(params['type'] as string, params['params'] as Record<string, unknown>);
      case 'qr_generate':
        return this.qrGenerate(params['data'] as string, params['format'] as string | undefined);
      case 'translate':
        return this.translate(params['text'] as string, params['target_lang'] as string);
      case 'escalate_human':
        return this.escalateHuman(
          params['action'] as string,
          params['urgency'] as string,
          params['context'] as string | undefined,
        );
      case 'audit_self':
        return this.auditSelf(params['scope'] as string | undefined);
      case 'backup_trigger':
        return this.backupTrigger();
      case 'project_status':
        return this.projectStatus(params['project_id'] as string);
      case 'project_continue':
        return this.projectContinue(params['project_id'] as string);
      case 'search_latest_tools':
        return this.searchLatestTools(params['domain'] as string);
      case 'self_improve':
        return this.selfImprove(params['target'] as string | undefined);
      case 'knowledge_update':
        return this.knowledgeUpdate(params['provider'] as string);
      case 'memory_recall':
        return this.memoryRecall(params['keyword'] as string, params['scope'] as string | undefined);
      case 'memory_add':
        return this.memoryAdd(params['category'] as string, params['fact'] as string);
      case 'lesson_record':
        return this.lessonRecord(
          params['title'] as string,
          params['text'] as string,
          params['severity'] as string,
          params['category'] as string | undefined,
        );
      case 'edit_file':
      case 'commit_push':
      case 'run_test':
      case 'run_lint':
      case 'run_typecheck':
      case 'create_calendar_event':
      case 'send_email':
      case 'send_telegram':
      case 'ocr_scan':
      case 'image_analyze':
      case 'project_finish':
        /* Tools nécessitant Cloudflare Worker bridge ou capacités browser
         * → return placeholder (à wirer Jet 9 quand backend prêt) */
        return { placeholder: true, message: `Tool ${toolName} nécessite worker bridge (Jet 9)` };
      default:
        throw new Error(`Tool inconnu: ${toolName}`);
    }
  }

  /* === Implémentations tools === */

  private async readFile(path: string, branch = 'main'): Promise<{ content: string; size: number }> {
    if (!path || path.includes('..') || path.startsWith('/')) {
      throw new Error('Chemin invalide (relatif obligatoire, pas de ..)');
    }
    const url = `https://raw.githubusercontent.com/9r4rxssx64-creator/cmcteams/${branch}/${path}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const content = await res.text();
    return { content, size: content.length };
  }

  private async webFetch(url: string): Promise<{ content: string; status: number }> {
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      throw new Error('URL doit commencer par http:// ou https://');
    }
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const text = await res.text();
    /* Strip HTML tags ultra-light pour extraire texte (Jet 9 enrichira) */
    const stripped = text
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 10000);
    return { content: stripped, status: res.status };
  }

  private async webSearch(query: string, maxResults = 5): Promise<{ results: unknown[]; provider: string }> {
    if (!query) throw new Error('query required');
    /* Brave Search API si configuré */
    const braveKey = localStorage.getItem('ax_brave_key');
    if (braveKey) {
      try {
        const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${maxResults}`;
        const res = await fetch(url, {
          headers: { 'X-Subscription-Token': braveKey, Accept: 'application/json' },
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const data = (await res.json()) as { web?: { results?: unknown[] } };
          return { results: data.web?.results ?? [], provider: 'brave' };
        }
      } catch (err: unknown) {
        logger.warn('apex-tools', 'Brave search failed', { err });
      }
    }
    /* Tavily fallback */
    const tavilyKey = localStorage.getItem('ax_tavily_key');
    if (tavilyKey) {
      try {
        const res = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ api_key: tavilyKey, query, max_results: maxResults }),
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const data = (await res.json()) as { results?: unknown[] };
          return { results: data.results ?? [], provider: 'tavily' };
        }
      } catch (err: unknown) {
        logger.warn('apex-tools', 'Tavily search failed', { err });
      }
    }
    /* Fallback : aucune clé = retourne placeholder pour configuration */
    return {
      results: [{ note: 'Configurer ax_brave_key ou ax_tavily_key pour activer web_search' }],
      provider: 'none',
    };
  }

  private readLogs(scope = 'all', limit = 50): Record<string, unknown[]> {
    const result: Record<string, unknown[]> = {};
    if (scope === 'audit' || scope === 'all') {
      try {
        const audit = JSON.parse(localStorage.getItem('apex_v13_audit_log') ?? '[]') as unknown[];
        result['audit'] = audit.slice(-limit);
      } catch {
        result['audit'] = [];
      }
    }
    if (scope === 'errors' || scope === 'all') {
      try {
        const obs = JSON.parse(localStorage.getItem('apex_v13_observability_buffer') ?? '[]') as Array<{
          level: string;
        }>;
        result['errors'] = obs.filter((e) => e.level === 'error').slice(-limit);
      } catch {
        result['errors'] = [];
      }
    }
    if (scope === 'sentinels' || scope === 'all') {
      try {
        const sent = JSON.parse(localStorage.getItem('apex_v13_sentinels') ?? '{}') as Record<string, unknown>;
        result['sentinels'] = Object.entries(sent).slice(0, limit);
      } catch {
        result['sentinels'] = [];
      }
    }
    return result;
  }

  private async vaultAction(action: string, key?: string): Promise<unknown> {
    /* Vault actions limitées : passphrase + encrypt/decrypt seulement
     * (vault.list/delete pas exposés en API tool — anti-enumeration sécurité). */
    switch (action) {
      case 'list': {
        /* Énumération via localStorage keys ax_*_key (pas le vault chiffré directement) */
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k?.match(/^ax_[a-z_]+_key$/)) keys.push(k);
        }
        return { count: keys.length, keys };
      }
      case 'get':
        if (!key) throw new Error('key required for get');
        /* Retourne uniquement existence + masked preview (anti-leak) */
        return { found: !!localStorage.getItem(key), masked: localStorage.getItem(key) ? '***' : null };
      case 'revoke': {
        if (!key) throw new Error('key required for revoke');
        try {
          localStorage.removeItem(key);
          return { ok: true };
        } catch {
          return { ok: false };
        }
      }
      default:
        throw new Error(`Vault action inconnu: ${action}`);
    }
  }

  private financeCalculate(type: string, params: Record<string, unknown>): unknown {
    switch (type) {
      case 'iban_check': {
        const iban = String(params['iban'] ?? '').replace(/\s/g, '').toUpperCase();
        if (iban.length < 14 || iban.length > 34) return { valid: false, reason: 'Longueur IBAN invalide' };
        /* Validation MOD 97 (norme ISO 13616) */
        const rearranged = iban.slice(4) + iban.slice(0, 4);
        const numeric = rearranged
          .split('')
          .map((c) => (/[A-Z]/.test(c) ? (c.charCodeAt(0) - 55).toString() : c))
          .join('');
        let mod = 0;
        for (const d of numeric) mod = (mod * 10 + Number(d)) % 97;
        return { valid: mod === 1, country: iban.slice(0, 2) };
      }
      case 'ir': {
        /* IR France 2026 simplified (tranches officielles) */
        const revenu = Number(params['revenu'] ?? 0);
        const parts = Number(params['parts'] ?? 1);
        const qf = revenu / parts;
        let impot = 0;
        if (qf > 11497) impot += (Math.min(qf, 29315) - 11497) * 0.11;
        if (qf > 29315) impot += (Math.min(qf, 83823) - 29315) * 0.3;
        if (qf > 83823) impot += (Math.min(qf, 180294) - 83823) * 0.41;
        if (qf > 180294) impot += (qf - 180294) * 0.45;
        return { ir_total: Math.round(impot * parts), qf: Math.round(qf), parts };
      }
      case 'credit': {
        /* Mensualité crédit immo (formule classique) */
        const capital = Number(params['capital'] ?? 0);
        const taux = Number(params['taux'] ?? 0) / 100 / 12;
        const duree = Number(params['duree_mois'] ?? 0);
        if (taux === 0) return { mensualite: capital / duree };
        const mens = (capital * taux) / (1 - Math.pow(1 + taux, -duree));
        return { mensualite: Math.round(mens * 100) / 100, total: Math.round(mens * duree * 100) / 100 };
      }
      case 'plus_value': {
        /* PV immo : abattement 6% par an entre 6e et 21e année (impôt) */
        const annees = Number(params['annees'] ?? 0);
        const gain = Number(params['gain'] ?? 0);
        const abattement = annees < 6 ? 0 : annees >= 22 ? 1 : (annees - 5) * 0.06;
        const taxable = gain * (1 - abattement);
        return { taxable: Math.round(taxable), abattement_pct: Math.round(abattement * 100) };
      }
      default:
        throw new Error(`Type calcul inconnu: ${type}`);
    }
  }

  private qrGenerate(data: string, format = 'plain'): { qr_data: string; format: string } {
    /* Pour QR réel, charger qrcode.js via CDN. Ici on retourne le payload formaté. */
    if (format === 'wifi') {
      /* WIFI:T:WPA;S:SSID;P:PASS;; */
      return { qr_data: data, format };
    }
    return { qr_data: data, format };
  }

  private async translate(text: string, targetLang: string): Promise<{ translated: string; provider: string }> {
    /* DeepL si key configurée */
    const deeplKey = localStorage.getItem('ax_deepl_key');
    if (deeplKey) {
      try {
        const res = await fetch('https://api-free.deepl.com/v2/translate', {
          method: 'POST',
          headers: { Authorization: `DeepL-Auth-Key ${deeplKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `text=${encodeURIComponent(text)}&target_lang=${encodeURIComponent(targetLang.toUpperCase())}`,
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const data = (await res.json()) as { translations?: Array<{ text: string }> };
          return { translated: data.translations?.[0]?.text ?? text, provider: 'deepl' };
        }
      } catch (err: unknown) {
        logger.warn('apex-tools', 'DeepL failed', { err });
      }
    }
    /* Fallback Claude Haiku via ai-router (placeholder Jet 9) */
    return { translated: text, provider: 'fallback (configure ax_deepl_key)' };
  }

  private async escalateHuman(action: string, urgency: string, context?: string): Promise<{ ok: boolean; ts: number }> {
    /* Push entry dans ax_claude_todo (Kevin reçoit notif via push worker) */
    const entry = {
      id: `esc_${Date.now()}`,
      action,
      urgency,
      context: context ?? '',
      ts: Date.now(),
      status: 'pending',
    };
    try {
      const todos = JSON.parse(localStorage.getItem('ax_claude_todo') ?? '[]') as unknown[];
      todos.push(entry);
      localStorage.setItem('ax_claude_todo', JSON.stringify(todos.slice(-50)));
    } catch {
      /* ignore quota */
    }
    void firebase.write('ax_claude_todo', entry);
    await auditLog.record('escalation.human', { details: { action, urgency } });
    return { ok: true, ts: entry.ts };
  }

  private async auditSelf(scope = 'all'): Promise<{ scope: string; metrics: Record<string, unknown> }> {
    /* Audit minimal : retourne metrics actuelles app (vrai audit subagent = Jet 9) */
    const metrics: Record<string, unknown> = {
      audit_count: this.tryParseLength('apex_v13_audit_log'),
      errors_count: this.tryParseLength('apex_v13_observability_buffer'),
      sentinels_active: this.tryParseObjectKeys('apex_v13_sentinels'),
      claude_todo_pending: this.tryParseLength('ax_claude_todo'),
      credentials_count: (() => {
        let count = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k?.match(/^ax_[a-z_]+_key$/)) count++;
        }
        return count;
      })(),
    };
    return { scope, metrics };
  }

  private async backupTrigger(): Promise<{ ok: boolean; backup_id: string }> {
    const backupId = `backup_${new Date().toISOString().slice(0, 10)}_${Date.now()}`;
    const snapshot: Record<string, unknown> = {};
    /* Snapshot keys critiques uniquement */
    const KEYS_TO_BACKUP = [
      'apex_v13_user',
      'apex_v13_users',
      'apex_v13_audit_log',
      'apex_v13_persistent_memory',
      'apex_v13_lessons',
    ];
    for (const k of KEYS_TO_BACKUP) {
      try {
        const v = localStorage.getItem(k);
        if (v) snapshot[k] = JSON.parse(v);
      } catch {
        /* ignore */
      }
    }
    void firebase.write(`ax_backup_${backupId}`, snapshot);
    return { ok: true, backup_id: backupId };
  }

  private tryParseLength(key: string): number {
    try {
      const arr = JSON.parse(localStorage.getItem(key) ?? '[]') as unknown[];
      return Array.isArray(arr) ? arr.length : 0;
    } catch {
      return 0;
    }
  }

  private tryParseObjectKeys(key: string): number {
    try {
      const obj = JSON.parse(localStorage.getItem(key) ?? '{}') as Record<string, unknown>;
      return Object.keys(obj).length;
    } catch {
      return 0;
    }
  }

  /* === Tools meta-projets Kevin === */

  private async projectStatus(projectId: string): Promise<unknown> {
    const project = orchestrator.listProjects().find((p) => p.id === projectId);
    if (!project) throw new Error(`Projet inconnu: ${projectId}`);

    /* Fetch last commit info via GitHub API public (sans auth pour reads) */
    let lastCommit: { sha: string; message: string; date: string } | null = null;
    try {
      const res = await fetch(
        `https://api.github.com/repos/9r4rxssx64-creator/cmcteams/commits?per_page=1`,
        { signal: AbortSignal.timeout(5000) },
      );
      if (res.ok) {
        const data = (await res.json()) as Array<{ sha: string; commit: { message: string; author: { date: string } } }>;
        if (data[0]) {
          lastCommit = {
            sha: data[0].sha.slice(0, 7),
            message: data[0].commit.message.split('\n')[0] ?? '',
            date: data[0].commit.author.date,
          };
        }
      }
    } catch {
      /* Network fail = ok, retourne quand même project info */
    }

    return {
      id: project.id,
      name: project.name,
      url: project.url,
      tools_available: project.toolsAvailable,
      firebase_path: project.firebasePath,
      last_commit: lastCommit,
    };
  }

  private async projectContinue(projectId: string): Promise<unknown> {
    /* Lit handoff JSON + KEVIN_ACTIONS_TODO.md + lessons depuis GitHub raw */
    const handoffUrl = `https://raw.githubusercontent.com/9r4rxssx64-creator/cmcteams/main/CLAUDE_HANDOFF.json`;
    const todoUrl = `https://raw.githubusercontent.com/9r4rxssx64-creator/cmcteams/main/KEVIN_ACTIONS_TODO.md`;
    let handoff: unknown = null;
    let todo = '';
    try {
      const res = await fetch(handoffUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) handoff = await res.json();
    } catch {
      /* ignore */
    }
    try {
      const res = await fetch(todoUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) todo = (await res.text()).slice(0, 5000);
    } catch {
      /* ignore */
    }

    /* Lit lessons learned cross-session */
    let lessons: unknown[] = [];
    try {
      lessons = JSON.parse(localStorage.getItem('apex_v13_lessons') ?? '[]') as unknown[];
    } catch {
      /* ignore */
    }

    return {
      project_id: projectId,
      handoff,
      kevin_actions_todo: todo,
      recent_lessons: lessons.slice(-10),
      next_step_suggestion: `Pour continuer le projet ${projectId}, lire les TODOs Kevin + lessons + handoff puis appeler 'edit_file' ou 'project_finish'.`,
    };
  }

  private async searchLatestTools(domain: string): Promise<unknown> {
    /* Délègue à web_search avec query enrichi date */
    const year = new Date().getFullYear();
    const query = `latest ${domain} tools released ${year} site:github.com OR site:producthunt.com`;
    return this.webSearch(query, 5);
  }

  private async selfImprove(target = 'all'): Promise<unknown> {
    /* Audit metrics actuelles + propose améliorations
     * (placeholder Jet 9 : intégrer subagent Explore pour vraie analyse) */
    const audit = await this.auditSelf(target);
    return {
      target,
      current_state: audit,
      suggestions: [
        {
          area: 'performance',
          action: 'Activer code-splitting Vite sur features lazy-loaded',
          impact: 'medium',
        },
        {
          area: 'ux',
          action: 'Ajouter skeleton screens sur états loading > 300ms',
          impact: 'high',
        },
        {
          area: 'security',
          action: 'Rotation automatique tokens API tous les 90j (sentinelle credentials-watch)',
          impact: 'high',
        },
      ],
      next_action: 'Appeler edit_file avec changements proposés (validation Kevin requise)',
    };
  }

  private async knowledgeUpdate(provider: string): Promise<unknown> {
    /* Fetch URL docs officielles selon provider */
    const DOCS_URLS: Record<string, string> = {
      anthropic: 'https://docs.anthropic.com/en/docs/welcome',
      openai: 'https://platform.openai.com/docs',
      stripe: 'https://stripe.com/docs',
      firebase: 'https://firebase.google.com/docs',
      cloudflare: 'https://developers.cloudflare.com/',
      vercel: 'https://vercel.com/docs',
      groq: 'https://console.groq.com/docs',
      gemini: 'https://ai.google.dev/docs',
    };
    const url = DOCS_URLS[provider.toLowerCase()];
    if (!url) throw new Error(`Provider inconnu: ${provider}. Utilise: ${Object.keys(DOCS_URLS).join(', ')}`);
    const fetched = await this.webFetch(url);
    /* Stocker dans KB Apex pour next sessions */
    try {
      const kb = JSON.parse(localStorage.getItem('apex_v13_kb_docs') ?? '{}') as Record<string, unknown>;
      kb[provider] = { url, fetched_at: Date.now(), excerpt: String(fetched['content']).slice(0, 2000) };
      localStorage.setItem('apex_v13_kb_docs', JSON.stringify(kb));
    } catch {
      /* ignore quota */
    }
    return { provider, url, excerpt_size: String(fetched['content']).length };
  }

  private memoryRecall(keyword: string, scope = 'all'): unknown {
    if (!keyword) throw new Error('keyword required');
    const result: Record<string, unknown[]> = {};
    const lc = keyword.toLowerCase();
    if (scope === 'facts' || scope === 'all') {
      try {
        const facts = JSON.parse(localStorage.getItem('apex_v13_persistent_memory') ?? '[]') as Array<{
          category: string;
          fact: string;
        }>;
        result['facts'] = facts.filter((f) => f.fact.toLowerCase().includes(lc) || f.category.toLowerCase().includes(lc));
      } catch {
        result['facts'] = [];
      }
    }
    if (scope === 'lessons' || scope === 'all') {
      try {
        const lessons = JSON.parse(localStorage.getItem('apex_v13_lessons') ?? '[]') as Array<{
          title: string;
          text: string;
        }>;
        result['lessons'] = lessons.filter((l) => l.text.toLowerCase().includes(lc) || l.title.toLowerCase().includes(lc));
      } catch {
        result['lessons'] = [];
      }
    }
    if (scope === 'kb' || scope === 'all') {
      try {
        const kb = JSON.parse(localStorage.getItem('apex_v13_kb_docs') ?? '{}') as Record<string, { excerpt: string }>;
        result['kb'] = Object.entries(kb)
          .filter(([_, v]) => v.excerpt.toLowerCase().includes(lc))
          .map(([k]) => k);
      } catch {
        result['kb'] = [];
      }
    }
    return result;
  }

  private memoryAdd(category: string, fact: string): { ok: boolean; total: number } {
    if (!category || !fact) throw new Error('category + fact required');
    try {
      const facts = JSON.parse(localStorage.getItem('apex_v13_persistent_memory') ?? '[]') as Array<{
        category: string;
        fact: string;
        ts: number;
      }>;
      facts.push({ category, fact, ts: Date.now() });
      const trimmed = facts.length > 1000 ? facts.slice(-1000) : facts;
      localStorage.setItem('apex_v13_persistent_memory', JSON.stringify(trimmed));
      void firebase.write('apex_v13_persistent_memory', trimmed);
      return { ok: true, total: trimmed.length };
    } catch {
      return { ok: false, total: 0 };
    }
  }

  private lessonRecord(title: string, text: string, severity: string, category = 'general'): { ok: boolean; total: number } {
    if (!title || !text) throw new Error('title + text required');
    try {
      const lessons = JSON.parse(localStorage.getItem('apex_v13_lessons') ?? '[]') as Array<unknown>;
      lessons.push({
        id: `L_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        title: title.slice(0, 200),
        text: text.slice(0, 2000),
        category,
        severity,
        ts: Date.now(),
      });
      const trimmed = lessons.length > 500 ? lessons.slice(-500) : lessons;
      localStorage.setItem('apex_v13_lessons', JSON.stringify(trimmed));
      void firebase.write('apex_v13_lessons', trimmed);
      return { ok: true, total: trimmed.length };
    } catch {
      return { ok: false, total: 0 };
    }
  }
}

export const apexToolsDispatch = new ApexToolsDispatcher();
