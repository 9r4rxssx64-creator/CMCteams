/**
 * APEX v13 — Force Update Banner.
 *
 * Demande Kevin 2026-05-08 21h00 :
 * "Apex ne veut pas se mettre à jour comme tu avais prévu. J'ai fermé plusieurs
 *  fois l'app, j'ai du bureau, je l'ai réouvert, refermé, réouverte. J'ai
 *  effacé l'historique dans réglages de la iPhone, mais ça ne fonctionne
 *  toujours pas."
 *
 * iOS Safari PWA cache SW est notoirement collant. Solution : détecter au
 * boot si version distante > version locale, afficher banner ROUGE non-
 * dismissible avec **bouton 1-clic** qui :
 *
 * 1. Unregister TOUS les service workers
 * 2. Clear TOUS les caches (caches.delete pour chacun)
 * 3. Clear localStorage clés cache (pas vault, pas user)
 * 4. window.location.replace avec query param `?_force_upd_<ts>` pour
 *    bust le cache HTTP
 *
 * Auto-detect : fetch de `index.html` distant + parse `data-app-ver=` →
 * compare à `APP_VER` constant local. Si différent → banner.
 *
 * Périodicité : check au boot + toutes les 10 min en background.
 */

import { APP_VER } from '../core/bootstrap.js';
import { logger } from '../core/logger.js';

const BANNER_ID = 'apex-force-update-banner';
const STYLE_ID = 'apex-force-update-style';
const REMOTE_URL = './index.html';
const CHECK_INTERVAL_MS = 10 * 60 * 1000; /* 10 min */
const RECENT_CHECK_KEY = 'apex_v13_last_version_check_ts';

interface VersionCheckResult {
  remote_ver: string | null;
  local_ver: string;
  is_stale: boolean;
}

class ForceUpdateBanner {
  private installed = false;
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  /** Install au boot. Idempotent. */
  install(): void {
    if (this.installed || typeof document === 'undefined') return;
    this.installed = true;
    /* Check immédiat (3s après boot pour ne pas bloquer LCP) */
    setTimeout(() => void this.checkAndMaybeShow(), 3000);
    /* Check récurrent */
    this.intervalHandle = setInterval(() => void this.checkAndMaybeShow(), CHECK_INTERVAL_MS);
    logger.info('force-update', 'banner installed');
  }

  /** Stop listener (cleanup). */
  uninstall(): void {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
    this.intervalHandle = null;
    this.removeBanner();
    this.installed = false;
  }

  /** Check version distante vs locale. */
  async checkVersion(): Promise<VersionCheckResult> {
    try {
      const res = await fetch(`${REMOTE_URL}?_v=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) {
        logger.warn('force-update', `version check fetch failed: ${res.status}`);
        return { remote_ver: null, local_ver: APP_VER, is_stale: false };
      }
      const html = await res.text();
      const match = html.match(/data-app-ver="([^"]+)"/);
      const remote_ver = match?.[1] ?? null;
      const is_stale = remote_ver !== null && remote_ver !== APP_VER;
      try {
        localStorage.setItem(RECENT_CHECK_KEY, String(Date.now()));
      } catch { /* quota */ }
      return { remote_ver, local_ver: APP_VER, is_stale };
    } catch (err: unknown) {
      logger.warn('force-update', 'version check failed', { err });
      return { remote_ver: null, local_ver: APP_VER, is_stale: false };
    }
  }

  private async checkAndMaybeShow(): Promise<void> {
    const r = await this.checkVersion();
    if (r.is_stale && r.remote_ver) {
      this.showBanner(r.remote_ver);
    } else {
      this.removeBanner();
    }
  }

  private showBanner(remoteVer: string): void {
    if (document.getElementById(BANNER_ID)) return;
    this.injectStyle();
    const banner = document.createElement('div');
    banner.id = BANNER_ID;
    banner.setAttribute('role', 'alert');
    banner.setAttribute('aria-live', 'assertive');
    banner.innerHTML = `
      <div class="apex-fu-content">
        <div class="apex-fu-icon">🔄</div>
        <div class="apex-fu-text">
          <strong>Nouvelle version Apex disponible</strong>
          <span class="apex-fu-versions">Local: ${APP_VER} → Remote: ${remoteVer}</span>
        </div>
        <button class="apex-fu-btn" id="${BANNER_ID}-btn" type="button">
          🔄 Forcer mise à jour
        </button>
      </div>
    `;
    document.body.appendChild(banner);
    const btn = document.getElementById(`${BANNER_ID}-btn`);
    btn?.addEventListener('click', () => {
      void this.forceUpdate();
    });
    logger.info('force-update', `banner shown (local=${APP_VER}, remote=${remoteVer})`);
  }

  private removeBanner(): void {
    const banner = document.getElementById(BANNER_ID);
    if (banner) banner.remove();
  }

  private injectStyle(): void {
    if (document.getElementById(STYLE_ID)) return;
    const css = `
      #${BANNER_ID} {
        position: fixed;
        top: max(env(safe-area-inset-top, 8px), 8px);
        left: max(env(safe-area-inset-left, 8px), 8px);
        right: max(env(safe-area-inset-right, 8px), 8px);
        z-index: 999998;
        background: linear-gradient(135deg, #d32f2f, #b71c1c);
        color: #fff;
        border-radius: 12px;
        padding: 10px 12px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        animation: apex-fu-slide 280ms cubic-bezier(0.16, 1, 0.3, 1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      }
      @keyframes apex-fu-slide {
        from { opacity: 0; transform: translateY(-12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .apex-fu-content {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .apex-fu-icon {
        font-size: 20px;
        animation: apex-fu-spin 1.6s linear infinite;
      }
      @keyframes apex-fu-spin {
        from { transform: rotate(0); }
        to   { transform: rotate(360deg); }
      }
      .apex-fu-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .apex-fu-text strong {
        font-size: 13px;
        font-weight: 700;
      }
      .apex-fu-versions {
        font-size: 11px;
        opacity: 0.85;
        font-family: ui-monospace, 'SF Mono', monospace;
      }
      .apex-fu-btn {
        background: #fff;
        color: #b71c1c;
        border: none;
        border-radius: 8px;
        padding: 10px 14px;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        min-height: 44px;
        -webkit-tap-highlight-color: transparent;
        transition: transform 120ms;
      }
      .apex-fu-btn:active { transform: scale(0.96); }
      @media (prefers-reduced-motion: reduce) {
        #${BANNER_ID}, .apex-fu-icon { animation: none !important; }
        .apex-fu-btn:active { transform: none !important; }
      }
    `;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  /**
   * NUCLEAR option — force update immédiat.
   * iOS Safari PWA-aware : unregister SW, clear caches, clear cache-related
   * localStorage, reload avec query param fresh.
   */
  async forceUpdate(): Promise<void> {
    logger.info('force-update', 'NUCLEAR force-update triggered by Kevin');
    /* v13.4.6 — Pré-snapshot OBLIGATOIRE avant toute purge (Kevin "ne jamais
     * rien perdre"). Si PRESERVE_PREFIXES rate qqc, on peut tout restaurer
     * via autoBackup.restoreLatest() au prochain boot. */
    try {
      const { autoBackup } = await import('./auto-backup.js');
      const backup = await autoBackup.snapshot('pre-rollback');
      logger.info('force-update', `pre-update snapshot OK : ${backup.id} (${backup.size_bytes}b)`);
    } catch (err: unknown) {
      logger.warn('force-update', 'pre-update snapshot failed (non bloquant)', { err });
    }
    /* Étape 1 : unregister tous les Service Workers */
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister().catch(() => undefined)));
        logger.info('force-update', `${regs.length} SW unregistered`);
      } catch (err: unknown) {
        logger.warn('force-update', 'SW unregister failed', { err });
      }
    }
    /* Étape 2 : clear tous les Cache Storage */
    if (typeof caches !== 'undefined') {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k).catch(() => false)));
        logger.info('force-update', `${keys.length} caches cleared`);
      } catch (err: unknown) {
        logger.warn('force-update', 'caches clear failed', { err });
      }
    }
    /* Étape 3 : clear localStorage clés CACHE uniquement (pas vault/user) */
    try {
      /* v13.3.93 P0 CRITIQUE Kevin "j'ai collé toutes les clés une après l'autre
       * et rien ne fonctionne" — TROUVÉ : le PRESERVE_PREFIXES v13.3.92 utilisait
       * `apex_v13_pin_` (avec underscore final) MAIS la vraie clé du PIN hash est
       * `apex_v13_pin` (SANS underscore). Donc startsWith ne matchait pas →
       * PIN hash effacé → getDeviceBoundPassphrase() régénérait random différent
       * → ANCIENNE clé chiffrée avec ancien PIN devenait indéchiffrable.
       * Fix : enlever les underscores de fin pour matcher BOTH 'apex_v13_pin'
       * ET 'apex_v13_pin_xxx'. */
      const PRESERVE_PREFIXES = [
        'apex_v13_vault',
        'apex_v13_user',
        'apex_v13_users',
        'apex_v13_uid',
        'apex_v13_pin',
        'apex_v13_multi_keys',          /* v13.4.6 FIX CRITIQUE — VRAIE clé du coffre (était 'multikey_vault' faux) */
        'apex_v13_multikey_vault',       /* legacy fallback (v13.3.x avant rename) */
        'apex_v13_passphrase_history',
        'apex_v13_persistent_memory',
        'apex_v13_credentials',
        'apex_v13_device_obf',
        'apex_v13_device_passphrase',
        'apex_v13_device_trusted',
        'apex_v13_backup_index',         /* v13.4.6 FIX — index des snapshots */
        'apex_v13_backup_',              /* v13.4.6 FIX — chaque snapshot ax_backup_xxx */
        'apex_v13_last_known_name',      /* v13.4.6 FIX — reconnaissance Kevin */
        'apex_v13_last_known_uid',
        'apex_v13_lastact',
        'apex_v13_lessons',
        'apex_v13_kb',
        'apex_v13_audit',
        'apex_v13_xp',
        'apex_v13_streak',
        'apex_v13_attachments',          /* v13.4.6 FIX — pièces jointes session */
        'ax_v13_attachments',
        'ax_pin',
        'ax_user',
        'ax_uid',
        'ax_persistent_memory',
        'ax_anthropic',
        'ax_openai',
        'ax_groq',
        'ax_gemini',
        'ax_google',
        'ax_openrouter',
        'ax_mistral',
        'ax_cohere',
        'ax_deepseek',
        'ax_perplexity',
        'ax_xai',
        'ax_huggingface',
        'ax_hf_',
        'ax_replicate',
        'ax_stripe',
        'ax_brevo',
        'ax_resend',
        'ax_telegram',
        'ax_discord',
        'ax_github',
        'ax_gitlab',
        'ax_cloudflare',
        'ax_notion',
        'ax_airtable',
        'ax_dropbox',
        'ax_spotify',
        'ax_pinata',
        'ax_pinecone',
        'ax_qdrant',
        'ax_weaviate',
        'ax_brave',
        'ax_tavily',
        'ax_deepl',
        'ax_finnhub',
        'ax_coingecko',
        'ax_coinmarketcap',
        'ax_etherscan',
        'ax_openweathermap',
        'ax_owm',
        'ax_opencage',
        'ax_mapbox',
        'ax_unsplash',
        'ax_pixabay',
        'ax_pexels',
        'ax_elevenlabs',
        'ax_newsapi',
        'ax_credentials_deleted',
        'ax_shared_api_key',
        'ax_api_key',
      ];
      const toDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        const isPreserved = PRESERVE_PREFIXES.some((p) => key.startsWith(p));
        if (!isPreserved && (key.includes('cache') || key.includes('sw_') || key.includes('app_ver'))) {
          toDelete.push(key);
        }
      }
      toDelete.forEach((k) => localStorage.removeItem(k));
      logger.info('force-update', `${toDelete.length} cache localStorage keys cleared (vault/user preserved)`);
    } catch (err: unknown) {
      logger.warn('force-update', 'localStorage clear failed', { err });
    }
    /* Étape 4 : reload avec query param fresh */
    const fresh = `${location.pathname}?_force_upd=${Date.now()}${location.hash}`;
    location.replace(fresh);
  }
}

export const forceUpdateBanner = new ForceUpdateBanner();
