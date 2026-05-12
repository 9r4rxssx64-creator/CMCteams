/**
 * APEX v13.4.6 — Indicateur version permanent (Kevin "plus de visuel de version").
 *
 * Affiche un badge discret en bas à droite avec la version courante.
 * Kevin peut vérifier d'un coup d'œil quelle version d'Apex il utilise.
 *
 * Clic = toast détaillé (version, dernière vérification MAJ, statut SW).
 */

import { APP_VER } from '../core/bootstrap.js';
import { logger } from '../core/logger.js';

const BADGE_ID = 'apex-version-badge';
const STYLE_ID = 'apex-version-badge-style';

export function installVersionBadge(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(BADGE_ID)) return;

  /* Style premium discret */
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${BADGE_ID} {
        position: fixed;
        bottom: max(8px, env(safe-area-inset-bottom, 8px));
        right: 8px;
        z-index: 9998;
        padding: 4px 8px;
        background: linear-gradient(135deg, rgba(232, 184, 48, 0.15), rgba(232, 184, 48, 0.08));
        border: 1px solid rgba(232, 184, 48, 0.35);
        color: rgba(232, 184, 48, 0.85);
        font-size: 10px;
        font-family: 'SF Mono', Menlo, monospace;
        font-weight: 600;
        border-radius: 10px;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
        opacity: 0.6;
        transition: opacity 200ms ease;
        pointer-events: auto;
        line-height: 1;
        letter-spacing: 0.02em;
      }
      #${BADGE_ID}:hover, #${BADGE_ID}:active {
        opacity: 1;
      }
      @media (max-width: 480px) {
        #${BADGE_ID} {
          font-size: 9px;
          padding: 3px 6px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const badge = document.createElement('button');
  badge.id = BADGE_ID;
  badge.type = 'button';
  badge.textContent = APP_VER;
  badge.title = `Apex AI ${APP_VER} · clic pour détails`;
  badge.setAttribute('aria-label', `Version Apex ${APP_VER}`);
  badge.addEventListener('click', () => {
    void showVersionDetails();
  });
  document.body.appendChild(badge);
  logger.info('version-badge', `installé visible : ${APP_VER}`);
}

async function showVersionDetails(): Promise<void> {
  try {
    const { toast } = await import('./toast.js');
    const swReg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
    const swState = swReg?.active?.state ?? 'aucun';
    const lastCheck = parseInt(localStorage.getItem('apex_v13_last_visibility_update_check') ?? '0', 10);
    const lastCheckStr = lastCheck > 0 ? new Date(lastCheck).toLocaleTimeString('fr-FR') : 'jamais';
    toast.info(
      `Apex ${APP_VER} · SW: ${swState} · Dernier check MAJ: ${lastCheckStr}`,
      { duration: 6000 },
    );
  } catch (err: unknown) {
    logger.warn('version-badge', 'showVersionDetails failed', { err });
  }
}

/** Affiche un toast boot "Apex vX.Y.Z chargé" pour confirmer à Kevin la version active. */
export function showBootToast(): void {
  if (typeof document === 'undefined') return;
  /* Throttle 1×/heure (anti-spam à chaque reload) */
  try {
    const lastBoot = parseInt(localStorage.getItem('apex_v13_boot_toast_last') ?? '0', 10);
    if (Date.now() - lastBoot < 60 * 60 * 1000) return;
    localStorage.setItem('apex_v13_boot_toast_last', String(Date.now()));
  } catch { /* ignore */ }

  void import('./toast.js').then(({ toast }) => {
    toast.success(`✅ Apex ${APP_VER} chargé`, { duration: 3000 });
  }).catch(() => { /* ignore */ });
}
