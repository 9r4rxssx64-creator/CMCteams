/**
 * APEX v13.4.130 — Auto-activation proxy Cloudflare au boot.
 *
 * Demande Kevin 2026-05-15 :
 * "Sans régression mais que ça marche en prod sans rien faire"
 *
 * Logique :
 *  1. Au boot, attend 5s (laisse vault + auth init)
 *  2. Si user courant = admin Kevin (kdmc_admin)
 *  3. ET si proxy /health répond ok + ≥ 1 provider disponible
 *  4. ET si flag `apex_v13_use_secrets_proxy` pas explicitement à 'false'
 *  5. → set flag à 'true' + log info + toast info
 *
 * Si admin Kevin a explicitement désactivé (flag='false') → respect, pas d'override.
 * Tests vitest : pas d'admin Kevin + pas de proxy live → ne s'active pas → zéro régression.
 */

import { logger } from '../core/logger.js';

const FLAG_KEY = 'apex_v13_use_secrets_proxy';
const ADMIN_UID = 'kdmc_admin';

async function isAdminKevin(): Promise<boolean> {
  try {
    const { store } = await import('../core/store.js');
    const user = store.get('user') as { id?: string } | null;
    return user?.id === ADMIN_UID;
  } catch {
    return false;
  }
}

async function isProxyHealthy(): Promise<boolean> {
  try {
    const { apexSecretsProxy } = await import('./apex-secrets-proxy-client.js');
    const r = await apexSecretsProxy.checkHealth();
    return r.ok && !!r.data && r.data.available_providers.length > 0;
  } catch {
    return false;
  }
}

async function autoEnableIfReady(): Promise<{ enabled: boolean; reason: string }> {
  /* User opt-out explicite → respect */
  try {
    const flag = localStorage.getItem(FLAG_KEY);
    if (flag === 'false' || flag === '0') {
      return { enabled: false, reason: 'opt_out_user' };
    }
    /* Déjà ON → rien à faire */
    if (flag === 'true' || flag === '1') {
      return { enabled: true, reason: 'already_enabled' };
    }
  } catch { /* localStorage indispo */ }
  /* Check admin Kevin */
  if (!(await isAdminKevin())) {
    return { enabled: false, reason: 'not_admin_kevin' };
  }
  /* Check proxy health */
  if (!(await isProxyHealthy())) {
    return { enabled: false, reason: 'proxy_not_healthy' };
  }
  /* All checks passed → activate */
  try {
    localStorage.setItem(FLAG_KEY, 'true');
  } catch {
    return { enabled: false, reason: 'localstorage_fail' };
  }
  logger.info('proxy-auto-enable', '🔒 Proxy Cloudflare activé automatiquement (admin Kevin + health OK)');
  /* Toast info non-bloquant */
  try {
    const { toast } = await import('../ui/toast.js');
    toast.info('🔒 Proxy Cloudflare activé : tes clés API restent server-side', { duration: 6000 });
  } catch { /* toast indispo en test env */ }
  return { enabled: true, reason: 'auto_enabled' };
}

function disable(): void {
  try {
    localStorage.setItem(FLAG_KEY, 'false');
    logger.info('proxy-auto-enable', 'Proxy désactivé manuellement (opt-out admin)');
  } catch { /* ignore */ }
}

function enable(): void {
  try {
    localStorage.setItem(FLAG_KEY, 'true');
    logger.info('proxy-auto-enable', 'Proxy activé manuellement');
  } catch { /* ignore */ }
}

function getStatus(): 'enabled' | 'disabled' | 'pending' {
  try {
    const flag = localStorage.getItem(FLAG_KEY);
    if (flag === 'true' || flag === '1') return 'enabled';
    if (flag === 'false' || flag === '0') return 'disabled';
    return 'pending';
  } catch {
    return 'pending';
  }
}

export const proxyAutoEnable = {
  autoEnableIfReady,
  enable,
  disable,
  getStatus,
};
