/**
 * APEX v13.4.99 — Runtime self-diagnostic (Kevin "Autonome réel").
 *
 * Au boot, vérifie EN VRAI sur l'iPhone Kevin ce qui fonctionne :
 *   ✅ / ❌ anti-zoom inline gesturestart listener attached
 *   ✅ / ❌ vault Firebase backup path résolu (uid ou ADMIN_KEVIN_UID)
 *   ✅ / ❌ N clés Firebase backup trouvées (vraie listAll)
 *   ✅ / ❌ N clés Coffre local
 *   ✅ / ❌ Service Worker active
 *   ✅ / ❌ Firebase connected
 *   ✅ / ❌ Auto-restore boot a run
 *
 * Affiche toast "🔬 Diagnostic v13.4.99 : X/7 OK" au boot.
 * Tap sur toast → ouvre modal détail.
 *
 * Honnêteté Kevin : pas de promesse vague, état réel observable.
 */

import { logger } from '../core/logger.js';

export interface DiagnosticResult {
  ts: number;
  version: string;
  checks: ReadonlyArray<DiagnosticCheck>;
  okCount: number;
  failCount: number;
  summary: string;
}

export interface DiagnosticCheck {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
}

class ApexRuntimeDiagnostic {
  private lastResult: DiagnosticResult | null = null;

  async runAll(): Promise<DiagnosticResult> {
    const checks: DiagnosticCheck[] = [];

    /* 1. Anti-zoom inline */
    checks.push(this.checkAntiZoom());

    /* 2. Vault Firebase path */
    checks.push(this.checkVaultUid());

    /* 3. Service Worker actif */
    checks.push(await this.checkServiceWorker());

    /* 4. Firebase connecté */
    checks.push(await this.checkFirebase());

    /* 5. Vault local : nb clés */
    checks.push(this.checkVaultLocal());

    /* 6. Vault Firebase backup : nb clés */
    checks.push(await this.checkVaultFirebase());

    /* 7. Auto-restore credentials : a tourné ? */
    checks.push(this.checkAutoRestore());

    const okCount = checks.filter((c) => c.ok).length;
    const failCount = checks.length - okCount;
    const result: DiagnosticResult = {
      ts: Date.now(),
      version: '13.4.99',
      checks,
      okCount,
      failCount,
      summary: `${okCount}/${checks.length} OK · ${failCount} KO`,
    };
    this.lastResult = result;
    logger.info('runtime-diagnostic', `Diagnostic : ${result.summary}`, { checks });
    try {
      localStorage.setItem('apex_v13_runtime_diag_last', JSON.stringify(result));
    } catch { /* ignore */ }
    return result;
  }

  /** Anti-zoom : test si le listener gesturestart est bien attaché */
  private checkAntiZoom(): DiagnosticCheck {
    /* Heuristique : on lit le innerHTML de <head> pour repérer le script inline */
    try {
      const headHtml = document.head?.innerHTML ?? '';
      const hasInline = /gesturestart/.test(headHtml);
      return {
        id: 'anti-zoom',
        label: 'Anti-zoom inline Safari iOS',
        ok: hasInline,
        detail: hasInline ? 'gesturestart preventDefault dans <head>' : 'inline absent — bundle rescue.js seul',
      };
    } catch (err) {
      return { id: 'anti-zoom', label: 'Anti-zoom inline Safari iOS', ok: false, detail: `error: ${String(err)}` };
    }
  }

  /** Vault UID : path Firebase backup résolu ? */
  private checkVaultUid(): DiagnosticCheck {
    try {
      const cur = localStorage.getItem('apex_v13_uid');
      const lk = localStorage.getItem('apex_v13_last_known_uid');
      const lkName = (localStorage.getItem('apex_v13_last_known_name') ?? '').toLowerCase();
      const hasPin = !!localStorage.getItem('apex_v13_pin');
      let resolved = 'anon';
      if (cur && cur !== 'anon') resolved = cur;
      else if (lk && lk !== 'anon') resolved = lk;
      else if (lkName.includes('kevin') || lkName.includes('desarzens')) resolved = 'kdmc_admin';
      else if (hasPin) resolved = 'kdmc_admin';
      return {
        id: 'vault-uid',
        label: 'Vault Firebase backup path UID',
        ok: resolved !== 'anon',
        detail: `path: apex_vault_backup/${resolved}`,
      };
    } catch (err) {
      return { id: 'vault-uid', label: 'Vault Firebase backup path UID', ok: false, detail: `error: ${String(err)}` };
    }
  }

  /** Service Worker actif ? */
  private async checkServiceWorker(): Promise<DiagnosticCheck> {
    try {
      if (!('serviceWorker' in navigator)) {
        return { id: 'sw', label: 'Service Worker', ok: false, detail: 'API absente (navigateur trop ancien)' };
      }
      const regs = await navigator.serviceWorker.getRegistrations();
      const activeReg = regs.find((r) => !!r.active);
      return {
        id: 'sw',
        label: 'Service Worker',
        ok: !!activeReg,
        detail: activeReg
          ? `actif (${regs.length} reg, scope: ${activeReg.scope.replace(location.origin, '')})`
          : `${regs.length} registrations mais aucune active`,
      };
    } catch (err) {
      return { id: 'sw', label: 'Service Worker', ok: false, detail: `error: ${String(err)}` };
    }
  }

  /** Firebase connecté ? */
  private async checkFirebase(): Promise<DiagnosticCheck> {
    try {
      const mod = await import('./firebase.js').catch(() => null);
      if (!mod) return { id: 'firebase', label: 'Firebase', ok: false, detail: 'module non chargé' };
      const connected = mod.firebase?.isConnected?.() ?? false;
      return {
        id: 'firebase',
        label: 'Firebase Realtime DB',
        ok: connected,
        detail: connected ? 'connecté' : 'offline ou non-init',
      };
    } catch (err) {
      return { id: 'firebase', label: 'Firebase Realtime DB', ok: false, detail: `error: ${String(err)}` };
    }
  }

  /** Vault local : combien de clés ax_*_key */
  private checkVaultLocal(): DiagnosticCheck {
    try {
      const multikeyRaw = localStorage.getItem('apex_v13_multi_keys');
      let count = 0;
      if (multikeyRaw) {
        const parsed: unknown = JSON.parse(multikeyRaw);
        if (Array.isArray(parsed)) count = parsed.length;
      }
      /* Fallback legacy : ax_*_key keys */
      let legacyCount = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && /^ax_.+_key$/.test(k)) legacyCount += 1;
      }
      const total = count + legacyCount;
      return {
        id: 'vault-local',
        label: 'Coffre local',
        ok: total > 0,
        detail: `${total} clé(s) (${count} multikey + ${legacyCount} legacy)`,
      };
    } catch (err) {
      return { id: 'vault-local', label: 'Coffre local', ok: false, detail: `error: ${String(err)}` };
    }
  }

  /** Vault Firebase backup : combien de clés disponibles */
  private async checkVaultFirebase(): Promise<DiagnosticCheck> {
    try {
      const mod = await import('./vault-firebase-backup.js').catch(() => null);
      if (!mod) {
        return { id: 'vault-fb', label: 'Coffre Firebase backup', ok: false, detail: 'module non chargé' };
      }
      const all = await mod.vaultFirebaseBackup.listAll();
      return {
        id: 'vault-fb',
        label: 'Coffre Firebase backup',
        ok: all.length > 0,
        detail: `${all.length} clé(s) disponibles dans Firebase`,
      };
    } catch (err) {
      return { id: 'vault-fb', label: 'Coffre Firebase backup', ok: false, detail: `error: ${String(err)}` };
    }
  }

  /** Auto-restore credentials : a tourné depuis ce boot ? */
  private checkAutoRestore(): DiagnosticCheck {
    try {
      /* Heuristique : auto-restore log l'exécution dans apex_v13_audit avec category=auto-restore */
      const auditRaw = localStorage.getItem('apex_v13_audit');
      const ran = !!auditRaw && /auto[-_]restore/i.test(auditRaw);
      return {
        id: 'auto-restore',
        label: 'Auto-restore boot',
        ok: ran,
        detail: ran ? 'a tourné (audit log présent)' : 'aucune trace audit — peut-être pas encore exécuté',
      };
    } catch (err) {
      return { id: 'auto-restore', label: 'Auto-restore boot', ok: false, detail: `error: ${String(err)}` };
    }
  }

  getLast(): DiagnosticResult | null {
    return this.lastResult;
  }
}

export const apexRuntimeDiagnostic = new ApexRuntimeDiagnostic();
