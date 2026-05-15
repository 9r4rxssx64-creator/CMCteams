/**
 * APEX v13 — Never Forget Watch (Kevin 2026-05-08 23h45 ABSOLUE).
 *
 * "Oublie ni moi ni personne jamais !" — Kevin
 *
 * Sentinelle horaire qui audite que Apex se souvient de TOUT le monde :
 * - Kevin admin (kdmc_admin)
 * - Laurence ❤️ (laurence_sp, tier laurence)
 * - Famille étendue (belle-fille, etc.)
 * - Amis Kevin (registry append-only)
 * - Clients TARDIEU (free tier)
 * - Cadres CMCteams (21 cadres unifiés : 16 pit boss + 5 superviseurs)
 * - 258 employés CMC total
 * - 7 projets actifs Kevin
 *
 * Comportement :
 * - Run 1×/h (cron interne)
 * - Vérifie que `buildIdentitySection()` contient tous les marqueurs critiques
 * - Vérifie que `listAllKnownUsers()` retourne >= 25 users
 * - Vérifie que `buildExtendedIdentitySection()` reste sous budget 6000 chars
 * - Si Kevin login mais Apex ne reconnaît pas son nom → escalade ax_claude_todo CRITIQUE
 * - Stockage `ax_never_forget_audit_log` (cap 100 entries FIFO)
 *
 * Tests d'intégrité :
 * 1. Identity section contient "Kevin DESARZENS" + "Laurence Saint-Polit" + "❤️"
 * 2. Identity section contient au moins 1 cadre CMC (ETTORI / FOUQUE / BOUVIER JF)
 * 3. Identity section contient mention 258 employés
 * 4. listAllKnownUsers() >= 25
 * 5. APEX_IDENTITY.employees_cmcteams.cadres.length >= 21
 *
 * Si un test échoue → severity 'critical' + escalade Claude Code via ax_claude_todo.
 */

import {
  APEX_IDENTITY,
  buildIdentitySection,
  buildExtendedIdentitySection,
  listAllKnownUsers,
} from '../core/apex-identity.js';
import { logger } from '../core/logger.js';

const AUDIT_LOG_KEY = 'ax_never_forget_audit_log';
const AUDIT_LOG_CAP = 100;
const CLAUDE_TODO_KEY = 'ax_claude_todo';
const CLAUDE_TODO_CAP = 50;

export type AuditSeverity = 'ok' | 'warn' | 'critical';

export interface AuditCheck {
  id: string;
  description: string;
  passed: boolean;
  severity: AuditSeverity;
  details?: string;
}

export interface NeverForgetAuditResult {
  ts: number;
  duration_ms: number;
  checks: AuditCheck[];
  passed_count: number;
  failed_count: number;
  critical_count: number;
  overall_severity: AuditSeverity;
  identity_compact_size: number;
  identity_extended_size: number;
  total_known_users: number;
}

class NeverForgetWatch {
  private lastRun: NeverForgetAuditResult | null = null;

  /**
   * Run audit complet 1× : 9 checks d'intégrité identité.
   * Idempotent + non-bloquant.
   */
  runOnce(): NeverForgetAuditResult {
    const start = Date.now();
    const checks: AuditCheck[] = [];

    let compactSection = '';
    let extendedSection = '';
    let knownUsers: ReturnType<typeof listAllKnownUsers> = [];

    /* === Génération sections === */
    try {
      compactSection = buildIdentitySection();
    } catch (err: unknown) {
      checks.push({
        id: 'identity_compact_buildable',
        description: 'buildIdentitySection() s\'exécute sans erreur',
        passed: false,
        severity: 'critical',
        details: 'Exception : ' + String(err),
      });
    }

    try {
      extendedSection = buildExtendedIdentitySection();
    } catch (err: unknown) {
      checks.push({
        id: 'identity_extended_buildable',
        description: 'buildExtendedIdentitySection() s\'exécute sans erreur',
        passed: false,
        severity: 'critical',
        details: 'Exception : ' + String(err),
      });
    }

    try {
      knownUsers = listAllKnownUsers();
    } catch (err: unknown) {
      checks.push({
        id: 'known_users_listable',
        description: 'listAllKnownUsers() s\'exécute sans erreur',
        passed: false,
        severity: 'critical',
        details: 'Exception : ' + String(err),
      });
    }

    /* === Check 1 : Identity contient Kevin === */
    checks.push({
      id: 'kevin_present',
      description: 'Identity section contient "Kevin DESARZENS"',
      passed: compactSection.includes('Kevin DESARZENS'),
      severity: 'critical',
    });

    /* === Check 2 : Identity contient Laurence ❤️ === */
    checks.push({
      id: 'laurence_present',
      description: 'Identity section contient "Laurence Saint-Polit" + ❤️',
      passed:
        compactSection.includes('Laurence Saint-Polit') && compactSection.includes('❤️'),
      severity: 'critical',
    });

    /* === Check 3 : Identity mentionne 258 employés CMC === */
    checks.push({
      id: 'cmc_total_present',
      description: 'Identity section mentionne "258" employés CMC',
      passed: compactSection.includes('258'),
      severity: 'warn',
    });

    /* === Check 4 : Extended contient cadres CMC critiques === */
    const cadresCritiques = ['ETTORI M', 'FOUQUE V', 'BOUVIER JF'];
    const cadresFound = cadresCritiques.filter((c) => extendedSection.includes(c));
    const cadresCheck: AuditCheck = {
      id: 'cadres_cmc_present',
      description: 'Extended section contient ETTORI M + FOUQUE V + BOUVIER JF',
      passed: cadresFound.length === cadresCritiques.length,
      severity: 'warn',
    };
    if (cadresFound.length !== cadresCritiques.length) {
      cadresCheck.details = `Manquants: ${cadresCritiques
        .filter((c) => !cadresFound.includes(c))
        .join(', ')}`;
    }
    checks.push(cadresCheck);

    /* === Check 5 : listAllKnownUsers() >= 25 === */
    checks.push({
      id: 'known_users_count',
      description: 'listAllKnownUsers() retourne >= 25 users',
      passed: knownUsers.length >= 25,
      severity: 'warn',
      details: `Count: ${knownUsers.length}`,
    });

    /* === Check 6 : Cadres CMC >= 21 === */
    const cadresCount = APEX_IDENTITY.employees_cmcteams.cadres.length;
    checks.push({
      id: 'cadres_count',
      description: 'APEX_IDENTITY.employees_cmcteams.cadres.length >= 21',
      passed: cadresCount >= 21,
      severity: 'warn',
      details: `Count: ${cadresCount}`,
    });

    /* === Check 7 : Identity compact <= 2400 chars (budget) === */
    checks.push({
      id: 'compact_budget',
      description: 'buildIdentitySection() <= 2400 chars (600 tokens budget)',
      passed: compactSection.length > 0 && compactSection.length <= 2400,
      severity: 'warn',
      details: `Size: ${compactSection.length} chars`,
    });

    /* === Check 8 : Extended <= 6000 chars (budget) === */
    checks.push({
      id: 'extended_budget',
      description: 'buildExtendedIdentitySection() <= 6000 chars (1500 tokens budget)',
      passed: extendedSection.length > 0 && extendedSection.length <= 6000,
      severity: 'warn',
      details: `Size: ${extendedSection.length} chars`,
    });

    /* === Check 9 : 7 projets connus === */
    checks.push({
      id: 'projects_count',
      description: 'APEX_IDENTITY.projects.length === 7',
      passed: APEX_IDENTITY.projects.length === 7,
      severity: 'warn',
      details: `Count: ${APEX_IDENTITY.projects.length}`,
    });

    /* === Synthèse === */
    const passed = checks.filter((c) => c.passed).length;
    const failed = checks.filter((c) => !c.passed).length;
    const critical = checks.filter((c) => !c.passed && c.severity === 'critical').length;

    let overall: AuditSeverity = 'ok';
    if (critical > 0) overall = 'critical';
    else if (failed > 0) overall = 'warn';

    const result: NeverForgetAuditResult = {
      ts: Date.now(),
      duration_ms: Date.now() - start,
      checks,
      passed_count: passed,
      failed_count: failed,
      critical_count: critical,
      overall_severity: overall,
      identity_compact_size: compactSection.length,
      identity_extended_size: extendedSection.length,
      total_known_users: knownUsers.length,
    };

    this.lastRun = result;

    /* Persist log + escalade si critical */
    this.appendLog(result);
    if (critical > 0) {
      this.escalateClaudeCode(result);
      this.notifyAdmin(result);
    } else if (failed > 0) {
      this.notifyAdmin(result);
    }

    logger.info(
      'never-forget-watch',
      `audit done : ${passed}/${checks.length} pass, ${critical} critical, severity=${overall}`
    );
    return result;
  }

  /**
   * Vérifie que le user qui se connecte est bien reconnu dans l'identité.
   * Appelé après login pour détection oubli grave.
   *
   * @returns true si reconnu, false si Apex a oublié ce user.
   */
  verifyLoginUserKnown(uid: string, name: string): boolean {
    try {
      const known = listAllKnownUsers();
      const matchById = known.find((u) => u.id === uid);
      if (matchById) return true;
      const nameLower = name.toLowerCase().trim();
      const matchByName = known.find(
        (u) =>
          u.name.toLowerCase() === nameLower ||
          u.name.toLowerCase().includes(nameLower) ||
          nameLower.includes(u.name.toLowerCase())
      );
      if (matchByName) return true;
      /* Pas trouvé → log + escalade critique */
      this.escalateUnknownLogin(uid, name);
      return false;
    } catch (err: unknown) {
      logger.warn('never-forget-watch', 'verifyLoginUserKnown error', { err });
      return false;
    }
  }

  /**
   * Snapshot lastRun (lecture seule).
   */
  getLastRun(): NeverForgetAuditResult | null {
    return this.lastRun ? { ...this.lastRun } : null;
  }

  /**
   * Lit log historique (FIFO cap 100).
   */
  getLog(): readonly NeverForgetAuditResult[] {
    try {
      const raw = localStorage.getItem(AUDIT_LOG_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) return parsed as NeverForgetAuditResult[];
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Reset state + log (tests + admin).
   */
  reset(): void {
    this.lastRun = null;
    try {
      localStorage.removeItem(AUDIT_LOG_KEY);
    } catch {
      /* skip */
    }
  }

  /* === Internals === */

  private appendLog(result: NeverForgetAuditResult): void {
    try {
      const raw = localStorage.getItem(AUDIT_LOG_KEY);
      const arr: NeverForgetAuditResult[] = raw
        ? (JSON.parse(raw) as NeverForgetAuditResult[])
        : [];
      arr.push(result);
      const trimmed = arr.length > AUDIT_LOG_CAP ? arr.slice(-AUDIT_LOG_CAP) : arr;
      localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(trimmed));
    } catch (err: unknown) {
      logger.warn('never-forget-watch', 'appendLog fail', { err });
    }
  }

  private notifyAdmin(result: NeverForgetAuditResult): void {
    try {
      const w = globalThis as unknown as {
        toast?: (m: string, kind?: string) => void;
      };
      if (typeof w.toast !== 'function') return;
      const failed = result.checks.filter((c) => !c.passed);
      const failedNames = failed.map((c) => c.id).slice(0, 3).join(', ');
      const icon = result.overall_severity === 'critical' ? '🚨' : '⚠️';
      const msg = `${icon} Never-forget audit : ${result.failed_count} échec(s) (${failedNames})`;
      w.toast(msg, result.overall_severity === 'critical' ? 'err' : 'warn');
    } catch {
      /* skip */
    }
  }

  private escalateClaudeCode(result: NeverForgetAuditResult): void {
    try {
      const raw = localStorage.getItem(CLAUDE_TODO_KEY);
      const arr: Array<Record<string, unknown>> = raw
        ? (JSON.parse(raw) as Array<Record<string, unknown>>)
        : [];
      const failed = result.checks.filter((c) => !c.passed);
      arr.push({
        id: 'never_forget_' + Date.now(),
        context: {
          source: 'never-forget-watch',
          failed_checks: failed.map((c) => ({
            id: c.id,
            description: c.description,
            severity: c.severity,
            details: c.details,
          })),
          identity_compact_size: result.identity_compact_size,
          identity_extended_size: result.identity_extended_size,
          total_known_users: result.total_known_users,
        },
        reason: 'Apex risque d\'oublier qui est Kevin/Laurence/employés CMC',
        severity: 'critical',
        src: 'apex',
        ts: Date.now(),
        status: 'pending',
      });
      const trimmed = arr.length > CLAUDE_TODO_CAP ? arr.slice(-CLAUDE_TODO_CAP) : arr;
      localStorage.setItem(CLAUDE_TODO_KEY, JSON.stringify(trimmed));
      logger.warn(
        'never-forget-watch',
        'CRITICAL escalade Claude Code : Apex oublie identité',
        { failed_count: result.failed_count }
      );
    } catch (err: unknown) {
      logger.warn('never-forget-watch', 'escalateClaudeCode fail', { err });
    }
  }

  private escalateUnknownLogin(uid: string, name: string): void {
    try {
      const raw = localStorage.getItem(CLAUDE_TODO_KEY);
      const arr: Array<Record<string, unknown>> = raw
        ? (JSON.parse(raw) as Array<Record<string, unknown>>)
        : [];
      arr.push({
        id: 'unknown_login_' + Date.now(),
        context: {
          source: 'never-forget-watch',
          login_uid: uid,
          login_name: name,
          message: 'User logged in mais Apex ne le reconnaît pas dans APEX_IDENTITY',
        },
        reason: `Apex doit ajouter ${name} (${uid}) à APEX_IDENTITY (clients/family/friends)`,
        severity: 'critical',
        src: 'apex',
        ts: Date.now(),
        status: 'pending',
      });
      const trimmed = arr.length > CLAUDE_TODO_CAP ? arr.slice(-CLAUDE_TODO_CAP) : arr;
      localStorage.setItem(CLAUDE_TODO_KEY, JSON.stringify(trimmed));
      logger.warn(
        'never-forget-watch',
        `Login user inconnu — escalade : ${name} (${uid})`,
      );
    } catch (err: unknown) {
      logger.warn('never-forget-watch', 'escalateUnknownLogin fail', { err });
    }
  }
}

export const neverForgetWatch = new NeverForgetWatch();
