/**
 * APEX v13.4.261 — Vault & Cloudflare diagnostic (one-shot read-only).
 *
 * Kevin 2026-05-23 : « Problème Cloudflare, pas de mémoire coffre ».
 *
 * Pattern Zoom Inspector (CLAUDE.md erreur #56) : un outil de diagnostic
 * visible vaut mieux que dix patchs aveugles. Lecture seule, faible risque,
 * révèle la cause exacte à Kevin pour qu'il sache quoi faire ensuite.
 *
 * Couvre les 2 symptômes que Kevin voit ensemble :
 *  - « pas de mémoire coffre » → localStorage / IDB / Firebase backup
 *  - « Cloudflare » → worker proxy IA (apex-secrets-proxy)
 *
 * NE modifie rien. NE supprime rien. NE force aucun fetch destructif.
 */

import { logger } from '../../core/logger.js';
import { firebase, type FirebaseConnectionState } from '../storage/firebase.js';

const ENC_PREFIX = 'AXENC1:';

export interface VaultLayerLocal {
  total: number;
  encrypted: number;
  plaintext: number;
  /** Aperçu des 10 premières clés (storageKey seulement, jamais la valeur). */
  sample: string[];
}

export interface VaultLayerFirebase {
  connected: boolean;
  state: FirebaseConnectionState;
  backup_count: number;
  /** Aperçu des 10 premières clés présentes côté Firebase. */
  sample: string[];
  drift_detected: boolean;
  in_local_not_fb: string[];
  in_fb_not_local: string[];
}

export interface CloudflareProxyState {
  url: string;
  reachable: boolean;
  latency_ms: number;
  /** HTTP status si réponse reçue, 0 sinon. */
  http_status: number;
  /** Providers exposés par le worker (vide si KO). */
  providers: string[];
  error?: string;
}

export interface VaultDiagnosticReport {
  ts: number;
  uid: string;
  uid_fallbacks: string[];
  local: VaultLayerLocal;
  firebase: VaultLayerFirebase;
  cloudflare_proxy: CloudflareProxyState;
  /** Verdict humain en 1 ligne. */
  summary: string;
  /** Actions concrètes recommandées (ordre de priorité). */
  recommendations: string[];
}

function safeLocalKeys(): string[] {
  const out: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (!(k.startsWith('ax_') || k.startsWith('apex_v13_'))) continue;
      if (!(k.endsWith('_key') || k.endsWith('_token') || k.endsWith('_secret'))) continue;
      out.push(k);
    }
  } catch {
    /* localStorage indispo → tableau vide */
  }
  return out;
}

function inspectLocal(): VaultLayerLocal {
  const keys = safeLocalKeys();
  let encrypted = 0;
  let plaintext = 0;
  for (const k of keys) {
    try {
      const v = localStorage.getItem(k);
      if (!v) continue;
      if (v.startsWith(ENC_PREFIX)) encrypted += 1;
      else plaintext += 1;
    } catch {
      /* skip */
    }
  }
  return {
    total: keys.length,
    encrypted,
    plaintext,
    sample: keys.slice(0, 10),
  };
}

async function inspectFirebase(): Promise<VaultLayerFirebase> {
  const state = firebase.getConnectionState();
  const connected = firebase.isConnected();
  /* Si pas connecté → on ne pingue pas Firebase, on retourne lecture locale. */
  if (!connected) {
    return {
      connected: false,
      state,
      backup_count: 0,
      sample: [],
      drift_detected: false,
      in_local_not_fb: [],
      in_fb_not_local: [],
    };
  }
  /* Lazy import pour éviter circular deps (vault-firebase-backup importe storage). */
  try {
    const { vaultFirebaseBackup } = await import('../vault/vault-firebase-backup.js');
    const audit = await vaultFirebaseBackup.auditCoherence();
    const backups = await vaultFirebaseBackup.listAll();
    return {
      connected: true,
      state,
      backup_count: audit.fb_count,
      sample: backups.slice(0, 10).map((b) => b.key),
      drift_detected: audit.drift_detected,
      in_local_not_fb: audit.in_local_not_fb.slice(0, 20),
      in_fb_not_local: audit.in_fb_not_local.slice(0, 20),
    };
  } catch (err: unknown) {
    logger.warn('vault-diag', 'firebase audit failed', { err });
    return {
      connected: true,
      state,
      backup_count: 0,
      sample: [],
      drift_detected: false,
      in_local_not_fb: [],
      in_fb_not_local: [],
    };
  }
}

async function inspectCloudflareProxy(): Promise<CloudflareProxyState> {
  let url = '';
  try {
    const mod = await import('../integrations/apex-secrets-proxy-client.js');
    url = mod.apexSecretsProxy.getWorkerUrl();
    const t0 = Date.now();
    const r = await fetch(`${url}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(6000),
    });
    const latency = Date.now() - t0;
    if (!r.ok) {
      return {
        url,
        reachable: false,
        latency_ms: latency,
        http_status: r.status,
        providers: [],
        error: `HTTP ${r.status}`,
      };
    }
    type HealthResp = { available_providers?: string[]; total?: number };
    const data = (await r.json().catch(() => ({}))) as HealthResp;
    return {
      url,
      reachable: true,
      latency_ms: latency,
      http_status: r.status,
      providers: Array.isArray(data.available_providers) ? data.available_providers : [],
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      url: url || 'https://apex-secrets-proxy.desarzens-kevin.workers.dev',
      reachable: false,
      latency_ms: 0,
      http_status: 0,
      providers: [],
      error: msg.slice(0, 120),
    };
  }
}

function collectUidContext(): { uid: string; fallbacks: string[] } {
  try {
    const cur = localStorage.getItem('apex_v13_uid') ?? 'anon';
    const fallbacks: string[] = [];
    const last = localStorage.getItem('apex_v13_last_known_uid');
    if (last && last !== cur) fallbacks.push(last);
    if (localStorage.getItem('apex_v13_pin') && cur !== 'kdmc_admin') fallbacks.push('kdmc_admin');
    return { uid: cur, fallbacks };
  } catch {
    return { uid: 'anon', fallbacks: [] };
  }
}

function buildSummary(report: Omit<VaultDiagnosticReport, 'summary' | 'recommendations'>): string {
  const { local, firebase: fb, cloudflare_proxy: cf } = report;
  const parts: string[] = [];
  parts.push(`💾 Local : ${local.total} clés (${local.encrypted} chiffrées${local.plaintext ? `, ${local.plaintext} ⚠ plaintext` : ''})`);
  if (fb.connected) {
    parts.push(`☁ Firebase ${fb.state} : ${fb.backup_count} backup(s)`);
  } else {
    parts.push(`☁ Firebase ${fb.state} (hors-ligne)`);
  }
  if (cf.reachable) {
    parts.push(`🌐 Cloudflare proxy OK (${cf.latency_ms}ms, ${cf.providers.length} providers)`);
  } else {
    parts.push(`🌐 Cloudflare proxy KO (${cf.error ?? 'unreachable'})`);
  }
  return parts.join(' · ');
}

function buildRecommendations(
  report: Omit<VaultDiagnosticReport, 'summary' | 'recommendations'>,
): string[] {
  const recs: string[] = [];
  const { local, firebase: fb, cloudflare_proxy: cf } = report;

  if (local.total === 0 && fb.backup_count > 0) {
    recs.push(
      `Le coffre local est vide mais ${fb.backup_count} clé(s) sont en backup Firebase. Clique « 🔓 Restaurer depuis Firebase ».`,
    );
  }
  if (local.total === 0 && fb.backup_count === 0 && !fb.connected) {
    recs.push(
      'Coffre local vide ET Firebase déconnecté. Vérifie ta connexion réseau puis relance le diagnostic.',
    );
  }
  if (local.total === 0 && fb.backup_count === 0 && fb.connected) {
    recs.push(
      'Aucune clé trouvée nulle part (local + Firebase). Re-colle tes clés une par une dans le champ « Auto-détection rapide ».',
    );
  }
  if (local.plaintext > 0) {
    recs.push(
      `⚠ ${local.plaintext} clé(s) en clair dans localStorage. Supprime-les et re-saisis-les (chiffrement automatique AES-GCM).`,
    );
  }
  if (fb.drift_detected) {
    if (fb.in_local_not_fb.length > 0) {
      recs.push(
        `${fb.in_local_not_fb.length} clé(s) locales pas encore backupées vers Firebase. Elles seront pushées au prochain throttle (5 min).`,
      );
    }
    if (fb.in_fb_not_local.length > 0) {
      recs.push(
        `${fb.in_fb_not_local.length} clé(s) en backup Firebase pas en local. Clique « 🔓 Restaurer depuis Firebase » pour les rapatrier.`,
      );
    }
  }
  if (!cf.reachable) {
    if (cf.http_status === 401 || cf.http_status === 403) {
      recs.push(
        `Worker Cloudflare proxy refuse l'auth (HTTP ${cf.http_status}). Re-saisis ton PIN admin Apex dans Réglages.`,
      );
    } else if (cf.http_status === 404 || cf.http_status === 0) {
      recs.push(
        `Worker Cloudflare proxy injoignable (${cf.error ?? 'pas de réponse'}). L'IA passera en failover automatique (OpenRouter/Groq/Gemini) tant que c'est down.`,
      );
    } else {
      recs.push(
        `Worker Cloudflare proxy en erreur (HTTP ${cf.http_status}). Failover IA actif.`,
      );
    }
  }
  if (recs.length === 0) {
    recs.push('Tout est cohérent. Aucune action requise.');
  }
  return recs;
}

export async function runVaultDiagnostic(): Promise<VaultDiagnosticReport> {
  const ts = Date.now();
  const uidCtx = collectUidContext();
  /* Local : synchrone, rapide. Firebase + Cloudflare : parallèles. */
  const local = inspectLocal();
  const [fbLayer, cfLayer] = await Promise.all([inspectFirebase(), inspectCloudflareProxy()]);
  const partial = {
    ts,
    uid: uidCtx.uid,
    uid_fallbacks: uidCtx.fallbacks,
    local,
    firebase: fbLayer,
    cloudflare_proxy: cfLayer,
  };
  const summary = buildSummary(partial);
  const recommendations = buildRecommendations(partial);
  logger.info('vault-diag', `${summary}`, {
    local: local.total,
    fb: fbLayer.backup_count,
    cf_ok: cfLayer.reachable,
  });
  return { ...partial, summary, recommendations };
}

export const vaultDiagnostic = {
  run: runVaultDiagnostic,
};
