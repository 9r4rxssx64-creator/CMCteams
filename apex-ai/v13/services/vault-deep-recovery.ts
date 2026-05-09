/**
 * APEX v13 — Vault Deep Recovery (Kevin 2026-05-09 P0).
 *
 * Kevin a recollé les MÊMES clés API 10-20 fois alors qu'elles devraient
 * être en triple persistence (localStorage + IDB + Firebase). Si elles sont
 * encore "perdues" → c'est qu'on a des bugs subtils dans la pipeline :
 *   - Clés mal classées : pasted en `ax_anthropic_key` mais valeur GitHub PAT
 *     → readKey retourne du Anthropic invalide → app croit "pas configuré"
 *   - Clés présentes en IDB shadow mais pas en localStorage → lecture en
 *     hot path retournait vide
 *   - Profil Kevin contient son numéro WhatsApp mais `ax_kevin_whatsapp_phone`
 *     n'est jamais wiré → tool whatsapp_send_message demande à chaque fois
 *
 * Ce service tourne au boot (deferredInits) et expose 3 méthodes :
 *   - scanAndRestoreAll() : balaye TOUS les storages (localStorage, IDB shadow,
 *     Firebase backup) et restore les clés manquantes en local. Combine
 *     l'auto-restore-credentials existant avec un scan plus exhaustif.
 *   - reclassifyMisplacedKeys() : pour chaque clé chiffrée, decrypt + ré-applique
 *     detectCredential(plaintext). Si la valeur correspond à un AUTRE service
 *     que sa storageKey actuelle → backup + déplace vers le bon emplacement.
 *   - autoWireWhatsApp() : récupère le numéro depuis ax_user.phone /
 *     kevin_profile / ax_kevin_phone. S'il existe et matche regex E.164 valide
 *     → set ax_kevin_whatsapp_phone (idempotent : skip si déjà set).
 *
 * Sécurité :
 *   - Backup ANCIEN avant move (clé `apex_v13_recovery_backup_<storageKey>_<ts>`,
 *     auto-purge > 30j via cleanup interval).
 *   - Audit log immutable `vault.deep_recovery` à chaque action.
 *   - Whitelist storage_key (ax_* / apex_v13_*) : ne touche pas aux autres origins.
 *
 * Wired :
 *   - core/bootstrap.ts deferredInits après auto-restore-credentials.
 *   - tests/unit/vault-deep-recovery.test.ts pour régression.
 *
 * v13.3.96 (Kevin règle 2026-05-08 ABSOLUE "Autonomie totale toujours partout"
 * + règle "RIEN PERDRE + SYNTHÈSE + SAUVEGARDE TEMPS RÉEL").
 */

import { logger } from '../core/logger.js';

import { autoRestoreCredentials } from './auto-restore-credentials.js';
import { detectCredential, CREDENTIAL_PATTERNS } from './credential-patterns.js';

/* ============================================================
   Types publics
   ============================================================ */

export interface DeepRecoveryReport {
  /** Timestamp run. */
  ts: number;
  /** Combien de clés restaurées depuis IDB / Firebase / alias / pattern_match. */
  restored: number;
  /** Combien de clés mal classées re-déplacées vers leur vraie storageKey. */
  reclassified: number;
  /** True si on a wiré ax_kevin_whatsapp_phone depuis profil. */
  whatsappWired: boolean;
  /** Détails par étape (pour logs / tests). */
  details: {
    autoRestore: { restored: number; failed: number };
    reclassification: Array<{ from: string; to: string; ok: boolean; reason?: string }>;
    whatsapp?: { source: string; phone_redacted: string };
    errors: string[];
  };
}

/* ============================================================
   Helpers
   ============================================================ */

const RECOVERY_BACKUP_PREFIX = 'apex_v13_recovery_backup_';
const RECOVERY_BACKUP_TTL_MS = 30 * 24 * 60 * 60 * 1000; /* 30 jours */
const RUN_THROTTLE_KEY = 'apex_v13_deep_recovery_last_ts';
const RUN_THROTTLE_MS = 5 * 60 * 1000; /* 5min : protège boot loop */

/** Regex E.164 permissif (accepte +33, 0033, 06, 07, +377, +1, +44, etc.). */
const PHONE_E164_LIKE = /^(?:\+|00)?\d{10,15}$/;

/**
 * Sources possibles pour récupérer le téléphone Kevin (ordre de priorité).
 * Première trouvée wins.
 */
const KEVIN_PHONE_SOURCES: ReadonlyArray<{ key: string; field?: string }> = [
  { key: 'ax_user', field: 'phone' },
  { key: 'ax_user', field: 'whatsapp' },
  { key: 'ax_user_profile', field: 'phone' },
  { key: 'ax_user_profile', field: 'whatsapp' },
  { key: 'kevin_profile', field: 'phone' },
  { key: 'ax_kevin_phone' },
  { key: 'ax_admin_phone' },
];

/**
 * Normalise un numéro téléphone vers format prêt à stocker
 * dans `ax_kevin_whatsapp_phone` (juste trim + remove espaces).
 * Retourne null si invalide.
 */
function normalizePhone(raw: string): string | null {
  if (typeof raw !== 'string') return null;
  const cleaned = raw.replace(/[\s.()-]+/g, '').trim();
  if (!cleaned) return null;
  if (!PHONE_E164_LIKE.test(cleaned)) return null;
  return cleaned;
}

/** Redact phone for logs (keeps prefix + last 2 chars). */
function redactPhone(phone: string): string {
  if (phone.length < 6) return '***';
  return `${phone.slice(0, 3)}***${phone.slice(-2)}`;
}

/* ============================================================
   Service
   ============================================================ */

class VaultDeepRecovery {
  /**
   * Méthode principale au boot.
   * Combine :
   *   1. autoRestoreCredentials.restoreAutomatically() (alias / IDB / Firebase)
   *   2. reclassifyMisplacedKeys() (re-detect tous les vault keys)
   *   3. autoWireWhatsApp() (depuis profil)
   *
   * Idempotent : throttle 5min via localStorage marker (anti-loop boot).
   */
  async scanAndRestoreAll(): Promise<DeepRecoveryReport> {
    const ts = Date.now();
    const report: DeepRecoveryReport = {
      ts,
      restored: 0,
      reclassified: 0,
      whatsappWired: false,
      details: {
        autoRestore: { restored: 0, failed: 0 },
        reclassification: [],
        errors: [],
      },
    };

    /* Throttle anti-loop boot */
    try {
      const last = parseInt(localStorage.getItem(RUN_THROTTLE_KEY) ?? '0', 10);
      if (last > 0 && ts - last < RUN_THROTTLE_MS) {
        logger.debug('vault-deep-recovery', 'skipped (throttle 5min)');
        return report;
      }
      localStorage.setItem(RUN_THROTTLE_KEY, String(ts));
    } catch { /* quota — continue */ }

    /* 1. Auto-restore standard (alias + IDB + Firebase) */
    try {
      const r = await autoRestoreCredentials.restoreAutomatically();
      report.details.autoRestore = { restored: r.restored, failed: r.failed };
      report.restored = r.restored;
    } catch (err: unknown) {
      report.details.errors.push(`autoRestore: ${err instanceof Error ? err.message : String(err)}`);
    }

    /* 2. Re-classement (deep) */
    try {
      const reclass = await this.reclassifyMisplacedKeys();
      report.reclassified = reclass.moved;
      report.details.reclassification = reclass.details;
    } catch (err: unknown) {
      report.details.errors.push(`reclassify: ${err instanceof Error ? err.message : String(err)}`);
    }

    /* 3. WhatsApp auto-wire */
    try {
      const wa = await this.autoWireWhatsApp();
      if (wa.wired && wa.source) {
        report.whatsappWired = true;
        report.details.whatsapp = {
          source: wa.source,
          phone_redacted: wa.phone ? redactPhone(wa.phone) : '***',
        };
      }
    } catch (err: unknown) {
      report.details.errors.push(`whatsapp: ${err instanceof Error ? err.message : String(err)}`);
    }

    /* Audit log si action prise */
    if (report.restored > 0 || report.reclassified > 0 || report.whatsappWired) {
      try {
        const { auditLog } = await import('./audit-log.js');
        await auditLog.record('vault.deep_recovery', {
          details: {
            restored: report.restored,
            reclassified: report.reclassified,
            whatsapp_wired: report.whatsappWired,
            ts,
          },
        });
      } catch { /* silent — audit best-effort */ }
    }

    /* Auto-cleanup vieux backups (best-effort) */
    void this.purgeOldBackups();

    if (report.restored > 0 || report.reclassified > 0 || report.whatsappWired) {
      logger.info(
        'vault-deep-recovery',
        `restored=${report.restored} reclassified=${report.reclassified} whatsapp=${report.whatsappWired}`,
      );
    }

    return report;
  }

  /**
   * Re-classement : décrypte chaque clé du vault, ré-applique detectCredential.
   * Si la valeur matche un AUTRE service que sa storageKey actuelle :
   *   - Backup de l'ancienne valeur sous `apex_v13_recovery_backup_<key>_<ts>`
   *   - Déplace vers la bonne storageKey via vault.setKey
   *   - Supprime l'ancienne entrée
   *
   * Ne touche PAS aux clés où detect retourne null (on ne casse pas si une valeur
   * a un format custom — Kevin peut avoir mis un secret manuel).
   */
  async reclassifyMisplacedKeys(): Promise<{
    moved: number;
    skipped: number;
    details: Array<{ from: string; to: string; ok: boolean; reason?: string }>;
  }> {
    const moved: Array<{ from: string; to: string; ok: boolean; reason?: string }> = [];
    let skipped = 0;
    const validStorageKeys = new Set(CREDENTIAL_PATTERNS.map((p) => p.storageKey));

    /* Itère localStorage : on cherche les vault keys (ax_*_key, ax_*_token, _secret) */
    const candidates: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        if (!k.startsWith('ax_')) continue;
        if (!validStorageKeys.has(k)) continue;
        candidates.push(k);
      }
    } catch (err: unknown) {
      moved.push({ from: '*', to: '*', ok: false, reason: `localStorage iter failed: ${String(err).slice(0, 80)}` });
      return { moved: 0, skipped: 0, details: moved };
    }

    /* Lazy import vault pour éviter cycle */
    const { vault } = await import('./vault.js');

    for (const currentKey of candidates) {
      let plaintext = '';
      try {
        plaintext = await vault.readKey(currentKey);
      } catch {
        skipped++;
        continue;
      }
      if (!plaintext) {
        skipped++;
        continue;
      }
      /* Détecte le vrai service de cette valeur */
      const detected = detectCredential(plaintext);
      if (!detected) {
        /* Valeur custom / non-pattern → on laisse */
        skipped++;
        continue;
      }
      if (detected.storageKey === currentKey) {
        /* Bien classée → skip */
        skipped++;
        continue;
      }

      /* MAL CLASSÉE : ex Cohere mal classé contient en fait un xAI Bearer */
      logger.warn(
        'vault-deep-recovery',
        `Key ${currentKey} contient en fait un ${detected.name} → migrate vers ${detected.storageKey}`,
      );

      /* 1. Backup ancien ciphertext */
      try {
        const oldCipher = localStorage.getItem(currentKey);
        if (oldCipher) {
          const backupKey = `${RECOVERY_BACKUP_PREFIX}${currentKey}_${Date.now()}`;
          localStorage.setItem(backupKey, oldCipher);
        }
      } catch { /* quota — non bloquant */ }

      /* 2. Vérifier que la cible n'est pas déjà occupée par une valeur valide */
      const targetExisting = await vault.readKey(detected.storageKey).catch(() => '');
      if (targetExisting && detectCredential(targetExisting)?.storageKey === detected.storageKey) {
        /* La cible a déjà une bonne valeur → on garde les deux : backup + clear current */
        try {
          localStorage.removeItem(currentKey);
        } catch { /* ignore */ }
        moved.push({ from: currentKey, to: detected.storageKey, ok: true, reason: 'target_already_valid_kept_both' });
        continue;
      }

      /* 3. Set sur la bonne cible (triple persistence via vault) */
      const setResult = await vault.setKey(detected.storageKey, plaintext);
      if (!setResult.ok) {
        moved.push({ from: currentKey, to: detected.storageKey, ok: false, reason: 'setKey_failed' });
        continue;
      }

      /* 4. Clear ancien (uniquement si setKey OK) */
      try {
        localStorage.removeItem(currentKey);
      } catch { /* ignore */ }

      moved.push({ from: currentKey, to: detected.storageKey, ok: true });
    }

    const movedCount = moved.filter((m) => m.ok && m.from !== '*').length;
    return { moved: movedCount, skipped, details: moved };
  }

  /**
   * Wire automatique du numéro WhatsApp Kevin depuis ses profils.
   * Idempotent : skip si `ax_kevin_whatsapp_phone` déjà set & valid.
   */
  async autoWireWhatsApp(): Promise<{ wired: boolean; source?: string; phone?: string }> {
    /* Skip si déjà set & valide */
    try {
      const existing = localStorage.getItem('ax_kevin_whatsapp_phone');
      if (existing) {
        /* Si chiffré, lire via vault */
        let plain = existing;
        if (existing.startsWith('AXENC1:')) {
          try {
            const { vault } = await import('./vault.js');
            plain = await vault.readKey('ax_kevin_whatsapp_phone');
          } catch {
            plain = '';
          }
        }
        if (plain && normalizePhone(plain)) {
          return { wired: false }; /* déjà OK, pas besoin */
        }
      }
    } catch { /* continue */ }

    /* Cherche dans les sources de profil */
    for (const src of KEVIN_PHONE_SOURCES) {
      let raw: string | null = null;
      try {
        raw = localStorage.getItem(src.key);
      } catch { continue; }
      if (!raw) continue;

      let candidate = '';
      if (src.field) {
        /* JSON object expected */
        try {
          const obj = JSON.parse(raw) as Record<string, unknown>;
          const v = obj[src.field];
          if (typeof v === 'string') candidate = v;
        } catch {
          /* pas un JSON, peut-être string brute */
          candidate = raw;
        }
      } else {
        candidate = raw;
      }

      const normalized = normalizePhone(candidate);
      if (!normalized) continue;

      /* Trouvé valid → wire via vault.setKey (chiffré + triple persisté) */
      try {
        const { vault } = await import('./vault.js');
        const r = await vault.setKey('ax_kevin_whatsapp_phone', normalized);
        if (r.ok) {
          logger.info(
            'vault-deep-recovery',
            `WhatsApp phone wired from ${src.key}${src.field ? `.${src.field}` : ''} (${redactPhone(normalized)})`,
          );
          return { wired: true, source: `${src.key}${src.field ? `.${src.field}` : ''}`, phone: normalized };
        }
      } catch (err: unknown) {
        logger.warn('vault-deep-recovery', 'WhatsApp setKey failed', { err });
      }
    }

    return { wired: false };
  }

  /**
   * Cleanup des backups > 30 jours.
   * Best-effort : on n'attend pas la fin pour autres opérations.
   */
  private async purgeOldBackups(): Promise<void> {
    const now = Date.now();
    const toDelete: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        if (!k.startsWith(RECOVERY_BACKUP_PREFIX)) continue;
        /* Format : apex_v13_recovery_backup_<storageKey>_<ts> — extract last numeric chunk */
        const lastUnderscore = k.lastIndexOf('_');
        if (lastUnderscore < 0) continue;
        const tsStr = k.slice(lastUnderscore + 1);
        const ts = parseInt(tsStr, 10);
        if (Number.isNaN(ts)) continue;
        if (now - ts > RECOVERY_BACKUP_TTL_MS) toDelete.push(k);
      }
      for (const k of toDelete) {
        try { localStorage.removeItem(k); } catch { /* ignore */ }
      }
    } catch { /* iter fail — silent */ }
  }
}

export const vaultDeepRecovery = new VaultDeepRecovery();

/* Export helpers pour tests */
export const __test_helpers = {
  normalizePhone,
  redactPhone,
  RECOVERY_BACKUP_PREFIX,
  RUN_THROTTLE_KEY,
};
