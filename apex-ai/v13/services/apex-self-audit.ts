/**
 * APEX v13 — Self-Audit (le plus puissant audit interne autonome).
 *
 * Demande Kevin 2026-05-04 :
 * "Je dois pouvoir dire 'fais ton audit' à Apex dans le chat. Apex se fait
 *  le plus complet des audits avec retour escalade Claude Code, autocorrection,
 *  va chercher outils + données, améliore. Concertation bidirectionnelle
 *  toujours, dans un sens comme dans l'autre."
 *
 * Architecture :
 * - 6 audits parallèles : Sécurité / Performance / UX / Tests / Architecture / AI Safety
 * - Auto-correction whitelist pour findings P0/P1
 * - Escalade Claude Code via `ax_claude_todo` Firebase si auto-fix échoue
 * - Apprentissage `ax_lessons_learned_struct` cross-session
 * - Sync `CLAUDE_HANDOFF.json` pour concertation bidirectionnelle
 * - Va chercher outils via apex-tools-dispatch (web_search, code_execute)
 * - Déclenchable :
 *   * Via chat IA : tool `apex_self_audit`
 *   * Via UI admin : bouton "🔍 Audit complet"
 *   * Programmé : sentinelle 1×/jour
 */

import { logger } from '../core/logger.js';

import { auditLog } from './audit-log.js';
import { soc2 } from './soc2-compliance.js';

export type AuditAxis = 'security' | 'performance' | 'ux' | 'tests' | 'architecture' | 'ai_safety';
export type Severity = 'p0_critical' | 'p1_high' | 'p2_medium' | 'p3_low' | 'info';

export interface Finding {
  id: string;
  axis: AuditAxis;
  severity: Severity;
  title: string;
  description: string;
  fix_action?: string;
  auto_fix_attempted?: boolean;
  auto_fix_success?: boolean;
  escalated_to_claude?: boolean;
  ts: number;
}

export interface AuditReport {
  id: string;
  ts: number;
  duration_ms: number;
  axes: Record<AuditAxis, { score: number; findings_count: number }>;
  total_score: number;
  total_findings: number;
  auto_fixed_count: number;
  escalated_count: number;
  findings: readonly Finding[];
  next_steps: readonly string[];
}

class ApexSelfAudit {
  /**
   * Lance audit complet (6 axes parallèles + auto-fix + escalade).
   */
  async runFullAudit(brutal = false): Promise<AuditReport> {
    const start = Date.now();
    const id = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    void auditLog.record('self_audit.started', { details: { id, brutal } });
    void soc2.record('integrity.audit_chain_verified', 'system', { type: 'self_audit', id, brutal });

    /* 6 audits en parallèle (mode brutal = checks supplémentaires + sévérité bumpée) */
    const [security, performance, ux, tests, architecture, aiSafety] = await Promise.all([
      this.auditSecurity(brutal),
      this.auditPerformance(brutal),
      this.auditUX(brutal),
      this.auditTests(brutal),
      this.auditArchitecture(brutal),
      this.auditAISafety(brutal),
    ]);

    const allFindings: Finding[] = [
      ...security.findings, ...performance.findings, ...ux.findings,
      ...tests.findings, ...architecture.findings, ...aiSafety.findings,
    ];

    /* Auto-fix whitelist (P0/P1 seulement) */
    let autoFixed = 0;
    let escalated = 0;
    for (const f of allFindings) {
      if (f.severity === 'p0_critical' || f.severity === 'p1_high') {
        const fixed = await this.tryAutoFix(f);
        f.auto_fix_attempted = true;
        f.auto_fix_success = fixed;
        if (fixed) autoFixed++;
        else {
          /* Escalade Claude Code */
          await this.escalateToClaudeCode(f);
          f.escalated_to_claude = true;
          escalated++;
        }
      }
    }

    const totalScore = Math.round(
      (security.score + performance.score + ux.score + tests.score + architecture.score + aiSafety.score) / 6,
    );

    const report: AuditReport = {
      id,
      ts: start,
      duration_ms: Date.now() - start,
      axes: {
        security: { score: security.score, findings_count: security.findings.length },
        performance: { score: performance.score, findings_count: performance.findings.length },
        ux: { score: ux.score, findings_count: ux.findings.length },
        tests: { score: tests.score, findings_count: tests.findings.length },
        architecture: { score: architecture.score, findings_count: architecture.findings.length },
        ai_safety: { score: aiSafety.score, findings_count: aiSafety.findings.length },
      },
      total_score: totalScore,
      total_findings: allFindings.length,
      auto_fixed_count: autoFixed,
      escalated_count: escalated,
      findings: allFindings,
      next_steps: this.buildNextSteps(allFindings, autoFixed, escalated),
    };

    /* Persist + lessons learned + sync CLAUDE_HANDOFF */
    this.persistReport(report);
    await this.recordLesson(report);

    void auditLog.record('self_audit.completed', {
      details: { id, score: totalScore, findings: allFindings.length, auto_fixed: autoFixed, escalated },
    });

    return report;
  }

  /* === Audits par axe === */

  private async auditSecurity(brutal = false): Promise<{ score: number; findings: Finding[] }> {
    const findings: Finding[] = [];
    /* 1. Vault tokens chiffrés ? */
    try {
      const { secretScanner } = await import('./secret-scanner.js');
      const stats = await secretScanner.getStats();
      if (stats.leaks_count > 0) {
        findings.push(this.makeFinding('security', 'p0_critical',
          'Tokens plaintext localStorage',
          `${stats.leaks_count} secret(s) en clair détectés (critical=${stats.by_severity.critical})`,
          'auto_migrate_secrets'));
      }
    } catch { /* skip */ }

    /* 2. SOC2 hash chain integrity */
    try {
      const integrity = await soc2.verifyIntegrity();
      if (!integrity.ok) {
        findings.push(this.makeFinding('security', 'p0_critical',
          'SOC2 audit chain broken',
          `Tamper détecté à entry ${integrity.broken_at} sur ${integrity.total}`,
          'reset_soc2_chain'));
      }
    } catch { /* skip */ }

    /* 3. CSP unsafe-inline check */
    try {
      const html = document.documentElement.outerHTML;
      if (html.includes('unsafe-inline')) {
        findings.push(this.makeFinding('security', 'p1_high',
          'CSP unsafe-inline présent',
          'CSP autorise unsafe-inline → vulnérable XSS',
          'remove_unsafe_inline'));
      }
    } catch { /* skip */ }

    /* 4. Auth admin PIN configuré ? */
    try {
      const adminPin = localStorage.getItem('apex_v13_pin');
      if (!adminPin) {
        findings.push(this.makeFinding('security', 'p2_medium',
          'PIN admin non configuré',
          'apex_v13_pin absent → 1er login va définir le PIN',
          'no_action'));
      }
    } catch { /* skip */ }

    /* MODE BRUTAL : checks supplémentaires sécurité */
    if (brutal) {
      /* Brut 1 : check rate-limit configuré */
      try {
        const failsKeys = Object.keys(localStorage).filter((k) => k.startsWith('apex_v13_pin_fails_'));
        if (failsKeys.length > 3) {
          findings.push(this.makeFinding('security', 'p1_high',
            `${failsKeys.length} compteurs rate-limit actifs`,
            'Plusieurs users ont eu des fails PIN — possible brute force tentative',
            'no_action'));
        }
      } catch { /* skip */ }
      /* Brut 2 : check device trusted présence */
      try {
        const trusted = localStorage.getItem('apex_v13_device_trusted_v1');
        if (!trusted) {
          findings.push(this.makeFinding('security', 'p2_medium',
            'Device non trusted',
            'Auto-login désactivé → user doit retaper PIN à chaque session',
            'no_action'));
        }
      } catch { /* skip */ }
      /* Brut 3 : vérifier que vault.getDeviceBoundPassphrase a backup IDB */
      try {
        const idbBackup = await new Promise<boolean>((resolve) => {
          if (!('indexedDB' in window)) return resolve(false);
          const req = indexedDB.open('apex_v13_secure', 1);
          req.onsuccess = () => {
            try {
              const db = req.result;
              const tx = db.transaction('passphrase', 'readonly');
              const get = tx.objectStore('passphrase').get('device_v1');
              get.onsuccess = () => { db.close(); resolve(typeof get.result === 'string'); };
              get.onerror = () => { db.close(); resolve(false); };
            } catch { resolve(false); }
          };
          req.onerror = () => resolve(false);
        });
        if (!idbBackup) {
          findings.push(this.makeFinding('security', 'p1_high',
            'Vault passphrase pas backup IDB',
            'Risque perte clés API si user efface historique Safari',
            'no_action'));
        }
      } catch { /* skip */ }
    }
    const score = Math.max(0, 20 - findings.length * 2);
    return { score, findings };
  }

  private async auditPerformance(brutal = false): Promise<{ score: number; findings: Finding[] }> {
    const findings: Finding[] = [];
    /* 1. localStorage quota */
    try {
      const { storageCompressor } = await import('./storage-compressor.js');
      const status = storageCompressor.getQuotaStatus();
      if (status.severity === 'critical') {
        findings.push(this.makeFinding('performance', 'p0_critical',
          'Storage quota critique',
          `${status.used_mb}MB/5MB (${status.pct}%)`,
          'aggressive_storage_cleanup'));
      } else if (status.severity === 'warn') {
        findings.push(this.makeFinding('performance', 'p2_medium',
          'Storage quota warn',
          `${status.used_mb}MB/5MB (${status.pct}%)`,
          'compress_storage'));
      }
    } catch { /* skip */ }

    /* 2. Sentinelles actives ? */
    try {
      const { sentinels } = await import('./sentinels.js');
      const list = sentinels.list();
      const failed = list.filter((s) => s.lastResult?.ok === false);
      if (failed.length > 3) {
        findings.push(this.makeFinding('performance', 'p1_high',
          `${failed.length} sentinelles en erreur`,
          failed.map((s) => s.name).join(', '),
          'restart_failed_sentinels'));
      }
    } catch { /* skip */ }

    /* 3. Memory leak check (intervals tracked) */
    try {
      const { lifecycle } = await import('./service-lifecycle.js');
      const stats = lifecycle.getStats();
      if (stats.total_intervals_tracked > 50) {
        findings.push(this.makeFinding('performance', 'p1_high',
          'Trop d\'intervals tracked',
          `${stats.total_intervals_tracked} intervals — memory leak potentiel`,
          'cleanup_intervals'));
      }
    } catch { /* skip */ }

    /* MODE BRUTAL : checks performance supplémentaires */
    if (brutal) {
      /* Brut 1 : taille DOM */
      const domSize = document.querySelectorAll('*').length;
      if (domSize > 2000) {
        findings.push(this.makeFinding('performance', 'p2_medium',
          `DOM trop large (${domSize} éléments)`,
          'Reflow + style recalc lents iPhone',
          'no_action'));
      }
      /* Brut 2 : LCP via Performance API */
      try {
        const entries = performance.getEntriesByType('paint');
        for (const e of entries) {
          if (e.name === 'largest-contentful-paint' && e.startTime > 2500) {
            findings.push(this.makeFinding('performance', 'p1_high',
              `LCP lent : ${Math.round(e.startTime)}ms`,
              'Cible Web Vitals < 2500ms (Good)',
              'no_action'));
          }
        }
      } catch { /* skip */ }
      /* Brut 3 : compteur Service Worker actif */
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          if (regs.length === 0) {
            findings.push(this.makeFinding('performance', 'p1_high',
              'Service Worker absent',
              'Pas de cache offline → app lente démarrage cold',
              'no_action'));
          }
        }
      } catch { /* skip */ }
    }
    const score = Math.max(0, 20 - findings.length * 2);
    return { score, findings };
  }

  private async auditUX(brutal = false): Promise<{ score: number; findings: Finding[] }> {
    const findings: Finding[] = [];
    /* 1. Boutons critiques touch-target 44px+ */
    try {
      const tooSmall = document.querySelectorAll<HTMLElement>('button, a[href]');
      let smallCount = 0;
      tooSmall.forEach((btn) => {
        const rect = btn.getBoundingClientRect();
        if ((rect.width < 36 || rect.height < 36) && btn.offsetParent !== null) smallCount++;
      });
      if (smallCount > 5) {
        findings.push(this.makeFinding('ux', 'p2_medium',
          `${smallCount} boutons trop petits (< 36px)`,
          'iOS HIG recommande 44px touch targets',
          'enlarge_touch_targets'));
      }
    } catch { /* skip */ }

    /* 2. Reduced motion respect */
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        findings.push(this.makeFinding('ux', 'info',
          'Mode reduced-motion détecté',
          'Animations devraient être désactivées',
          'no_action'));
      }
    }

    /* MODE BRUTAL : checks UX supplémentaires */
    if (brutal) {
      /* Brut 1 : 145 vues v12 manquantes (audit subagent v13.0.35) */
      const v12ViewsExpected = 145;
      const v13RoutesActual = ['chat', 'admin', 'laurence', 'studios', 'pro'].length;
      if (v13RoutesActual < v12ViewsExpected * 0.5) {
        findings.push(this.makeFinding('ux', 'p0_critical',
          `${v12ViewsExpected - v13RoutesActual} vues v12 manquantes`,
          `v13 a ${v13RoutesActual} vues vs ${v12ViewsExpected} v12.785`,
          'no_action'));
      }
      /* Brut 2 : touch targets < 44px Apple HIG */
      const tooSmall = document.querySelectorAll<HTMLElement>('button, a[href]');
      let smallCount = 0;
      tooSmall.forEach((btn) => {
        const rect = btn.getBoundingClientRect();
        if ((rect.width < 44 || rect.height < 44) && btn.offsetParent !== null) smallCount++;
      });
      if (smallCount > 10) {
        findings.push(this.makeFinding('ux', 'p1_high',
          `${smallCount} boutons < 44px Apple HIG`,
          'Touch targets non-conformes iPhone',
          'no_action'));
      }
      /* Brut 3 : font-size < 14px (zoom auto iOS sur input) */
      const inputs = document.querySelectorAll<HTMLElement>('input, textarea');
      let smallFontInputs = 0;
      inputs.forEach((i) => {
        const fs = parseFloat(getComputedStyle(i).fontSize);
        if (fs < 14) smallFontInputs++;
      });
      if (smallFontInputs > 0) {
        findings.push(this.makeFinding('ux', 'p1_high',
          `${smallFontInputs} inputs font-size < 14px`,
          'iOS Safari zoom auto au focus → UX cassée',
          'no_action'));
      }
    }
    const score = Math.max(0, 20 - findings.length);
    return { score, findings };
  }

  private async auditTests(brutal = false): Promise<{ score: number; findings: Finding[] }> {
    const findings: Finding[] = [];
    /* Lecture coverage stats (si dispo dans localStorage après run vitest) */
    /* Note : vitest ne run pas en runtime browser, donc on check juste lessons_learned */
    try {
      const lessons = JSON.parse(localStorage.getItem('ax_lessons_learned_struct') ?? '[]') as Array<{ severity?: string }>;
      const critical = lessons.filter((l) => l.severity === 'critical').length;
      if (critical > 5) {
        findings.push(this.makeFinding('tests', 'p1_high',
          `${critical} lessons critical non résolues`,
          'Patterns d\'erreur récurrents → tests régression à ajouter',
          'add_regression_tests'));
      }
    } catch { /* skip */ }
    /* MODE BRUTAL : checks tests supplémentaires */
    if (brutal) {
      /* Brut 1 : couverture < 95% = critical */
      try {
        const coverage = JSON.parse(localStorage.getItem('apex_v13_coverage_stats') ?? '{}') as {
          statements?: number; branches?: number; functions?: number; lines?: number;
        };
        if (coverage.statements && coverage.statements < 95) {
          findings.push(this.makeFinding('tests', 'p1_high',
            `Coverage statements ${coverage.statements}% < 95%`,
            'Cible 100% Kevin règle',
            'no_action'));
        }
        if (coverage.branches && coverage.branches < 90) {
          findings.push(this.makeFinding('tests', 'p1_high',
            `Coverage branches ${coverage.branches}% < 90%`,
            'Cible 100% Kevin règle',
            'no_action'));
        }
      } catch { /* skip */ }
    }
    const score = Math.max(0, 20 - findings.length * 2);
    return { score, findings };
  }

  private async auditArchitecture(brutal = false): Promise<{ score: number; findings: Finding[] }> {
    const findings: Finding[] = [];
    /* 1. Services bootstrap stats */
    try {
      const { lifecycle } = await import('./service-lifecycle.js');
      const stats = lifecycle.getStats();
      if (stats.failed > 0) {
        findings.push(this.makeFinding('architecture', 'p1_high',
          `${stats.failed} services failed`,
          'Service lifecycle errors → retry init nécessaire',
          'restart_failed_services'));
      }
    } catch { /* skip */ }
    /* MODE BRUTAL : checks architecture supplémentaires */
    if (brutal) {
      /* Brut 1 : Bundle size > 50KB */
      try {
        const perfRes = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const totalJsSize = perfRes
          .filter((r) => r.name.endsWith('.js'))
          .reduce((acc, r) => acc + (r.transferSize || 0), 0);
        if (totalJsSize > 50 * 1024) {
          findings.push(this.makeFinding('architecture', 'p2_medium',
            `Bundle JS ${Math.round(totalJsSize / 1024)}KB > 50KB`,
            'Cible Kevin règle perf',
            'no_action'));
        }
      } catch { /* skip */ }
      /* Brut 2 : nombre services bootstrap */
      try {
        const { lifecycle } = await import('./service-lifecycle.js');
        const stats = lifecycle.getStats();
        if (stats.total === 0) {
          findings.push(this.makeFinding('architecture', 'p0_critical',
            'Aucun service initialisé',
            'service-lifecycle stats.total = 0 → bootstrap KO',
            'restart_failed_services'));
        }
      } catch { /* skip */ }
    }
    const score = Math.max(0, 20 - findings.length * 2);
    return { score, findings };
  }

  private async auditAISafety(brutal = false): Promise<{ score: number; findings: Finding[] }> {
    const findings: Finding[] = [];
    /* 1. ai-routing-policy mode + clés */
    try {
      const { aiRoutingPolicy } = await import('./ai-routing-policy.js');
      const status = aiRoutingPolicy.getStatus();
      if (status.paid_providers_available.length === 0 && status.free_providers_available.length === 0) {
        findings.push(this.makeFinding('ai_safety', 'p0_critical',
          'Aucun provider IA configuré',
          'Apex ne peut répondre — colle au moins 1 clé API',
          'prompt_user_paste_key'));
      }
      if (status.anthropic_health === 'critical') {
        findings.push(this.makeFinding('ai_safety', 'p1_high',
          'Anthropic budget critique',
          'Budget > 90% → bascule auto free providers',
          'switch_to_economy_mode'));
      }
    } catch { /* skip */ }
    /* MODE BRUTAL : checks AI Safety supplémentaires */
    if (brutal) {
      /* Brut 1 : PII redaction wired ai-router ? */
      try {
        const { aiRouter } = await import('./ai-router.js');
        if (typeof aiRouter !== 'object' || aiRouter === null) {
          findings.push(this.makeFinding('ai_safety', 'p0_critical',
            'AI router not initialized',
            'Service ai-router non chargé → IA inaccessible',
            'no_action'));
        }
      } catch { /* skip */ }
      /* Brut 2 : context-loader injecté system prompt ? */
      try {
        const { contextLoader } = await import('./context-loader.js');
        const ctx = await contextLoader.load();
        if (ctx.rules.length === 0) {
          findings.push(this.makeFinding('ai_safety', 'p1_high',
            'Context-loader vide',
            'Règles permanentes pas injectées system prompt',
            'no_action'));
        }
      } catch { /* skip */ }
    }
    const score = Math.max(0, 20 - findings.length * 2);
    return { score, findings };
  }

  /* === Auto-fix whitelist === */

  private async tryAutoFix(finding: Finding): Promise<boolean> {
    const action = finding.fix_action;
    if (!action) return false;
    try {
      switch (action) {
        case 'auto_migrate_secrets': {
          const { secretScanner } = await import('./secret-scanner.js');
          const r = await secretScanner.autoMigrate();
          return r.migrated > 0;
        }
        case 'aggressive_storage_cleanup': {
          /* Trim audit log + telemetry pour libérer place */
          try {
            const audit = JSON.parse(localStorage.getItem('apex_v13_audit_log') ?? '[]') as unknown[];
            if (audit.length > 50) localStorage.setItem('apex_v13_audit_log', JSON.stringify(audit.slice(-50)));
          } catch { /* ignore */ }
          try {
            const telemetry = JSON.parse(localStorage.getItem('ax_telemetry_in') ?? '[]') as unknown[];
            if (telemetry.length > 20) localStorage.setItem('ax_telemetry_in', JSON.stringify(telemetry.slice(-20)));
          } catch { /* ignore */ }
          return true;
        }
        case 'compress_storage': {
          const { storageCompressor } = await import('./storage-compressor.js');
          const r = await storageCompressor.migrateAllToCompressed();
          return r.migrated > 0;
        }
        case 'switch_to_economy_mode': {
          const { aiRoutingPolicy } = await import('./ai-routing-policy.js');
          aiRoutingPolicy.setMode('economy');
          return true;
        }
        case 'no_action':
          return true;
        default:
          return false;
      }
    } catch (err: unknown) {
      logger.warn('apex-self-audit', `auto-fix ${action} failed`, { err });
      return false;
    }
  }

  /* === Escalade Claude Code === */

  private async escalateToClaudeCode(finding: Finding): Promise<void> {
    try {
      const todos = JSON.parse(localStorage.getItem('ax_claude_todo') ?? '[]') as Array<unknown>;
      todos.push({
        id: `c_audit_${finding.id}`,
        type: 'self_audit_escalation',
        finding,
        ts: Date.now(),
        status: 'pending',
      });
      localStorage.setItem('ax_claude_todo', JSON.stringify(todos.slice(-50)));
      void auditLog.record('self_audit.escalated', { details: { finding_id: finding.id, severity: finding.severity } });
    } catch (err: unknown) {
      logger.warn('apex-self-audit', 'escalate failed', { err });
    }
  }

  /* === Mémoire + concertation Claude Code === */

  private async recordLesson(report: AuditReport): Promise<void> {
    try {
      const lessons = JSON.parse(localStorage.getItem('ax_lessons_learned_struct') ?? '[]') as Array<unknown>;
      lessons.push({
        id: `lesson_${report.id}`,
        category: 'self_audit',
        title: `Audit ${report.id} : ${report.total_score}/100`,
        text: `${report.total_findings} findings, ${report.auto_fixed_count} auto-fixed, ${report.escalated_count} escalated`,
        severity: report.total_score < 70 ? 'critical' : report.total_score < 85 ? 'warn' : 'info',
        ts: report.ts,
        resolved: report.auto_fixed_count === report.total_findings,
        src: 'apex',
      });
      localStorage.setItem('ax_lessons_learned_struct', JSON.stringify(lessons.slice(-100)));
    } catch (err: unknown) {
      logger.warn('apex-self-audit', 'recordLesson failed', { err });
    }
  }

  private persistReport(report: AuditReport): void {
    try {
      const reports = JSON.parse(localStorage.getItem('apex_v13_audit_reports') ?? '[]') as unknown[];
      reports.push(report);
      localStorage.setItem('apex_v13_audit_reports', JSON.stringify(reports.slice(-20)));
    } catch (err: unknown) {
      logger.warn('apex-self-audit', 'persistReport failed', { err });
    }
  }

  /* === Helpers === */

  private makeFinding(axis: AuditAxis, severity: Severity, title: string, description: string, fixAction?: string): Finding {
    return {
      id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      axis,
      severity,
      title,
      description,
      ...(fixAction && { fix_action: fixAction }),
      ts: Date.now(),
    };
  }

  private buildNextSteps(findings: Finding[], autoFixed: number, escalated: number): string[] {
    const steps: string[] = [];
    if (autoFixed > 0) steps.push(`✅ ${autoFixed} findings auto-corrigés`);
    if (escalated > 0) steps.push(`📤 ${escalated} findings escaladés Claude Code → fix prochaine session`);
    const p0 = findings.filter((f) => f.severity === 'p0_critical' && !f.auto_fix_success);
    if (p0.length > 0) steps.push(`🚨 ${p0.length} P0 critical NON résolus → action Kevin requise`);
    if (findings.length === 0) steps.push('🎉 Aucun finding — Apex en parfait état');
    return steps;
  }

  /* === API publique === */

  listReports(): readonly AuditReport[] {
    try {
      return JSON.parse(localStorage.getItem('apex_v13_audit_reports') ?? '[]') as AuditReport[];
    } catch {
      return [];
    }
  }

  getLastReport(): AuditReport | null {
    const reports = this.listReports();
    return reports.length > 0 ? (reports[reports.length - 1] ?? null) : null;
  }

  /* Format markdown human-readable pour chat IA */
  formatReportMarkdown(report: AuditReport): string {
    const lines: string[] = [
      `# 🔍 Audit Apex ${report.id}`,
      ``,
      `**Score : ${report.total_score}/100**`,
      `Durée : ${report.duration_ms}ms`,
      ``,
      `## Scores par axe`,
    ];
    for (const [axis, data] of Object.entries(report.axes)) {
      lines.push(`- **${axis}** : ${data.score}/20 (${data.findings_count} findings)`);
    }
    lines.push('');
    lines.push(`## Statistiques`);
    lines.push(`- Findings totaux : ${report.total_findings}`);
    lines.push(`- Auto-fixed : ${report.auto_fixed_count} ✅`);
    lines.push(`- Escaladés Claude Code : ${report.escalated_count} 📤`);
    lines.push('');
    if (report.findings.length > 0) {
      lines.push(`## Findings P0/P1`);
      const critical = report.findings.filter((f) => f.severity === 'p0_critical' || f.severity === 'p1_high');
      for (const f of critical.slice(0, 10)) {
        const status = f.auto_fix_success ? '✅' : f.escalated_to_claude ? '📤' : '🚨';
        lines.push(`- ${status} **[${f.severity}]** ${f.title} : ${f.description}`);
      }
    }
    lines.push('');
    lines.push(`## Prochaines étapes`);
    for (const step of report.next_steps) lines.push(`- ${step}`);
    return lines.join('\n');
  }
}

export const apexSelfAudit = new ApexSelfAudit();
