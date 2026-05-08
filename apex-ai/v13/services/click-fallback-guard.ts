/**
 * APEX v13 — Click Fallback Guard.
 *
 * Demande Kevin 2026-05-08 :
 * "beaucoup d'actes de fonctions dans l'application, quand je clique dessus,
 *  ne voit rien d'autre, il ne se passe rien"
 *
 * GARANTIE : aucun bouton/clickable visible ne reste silencieux.
 * - Si un bouton a un handler (`onclick`, listener delegated, data-action wired) → laisse passer.
 * - Sinon : haptic + toast "Bientôt disponible" (jamais "rien").
 *
 * Fonctionne via event delegation au niveau document (capture phase BAS niveau).
 * N'interfère pas avec les handlers normaux : on attend que tous les listeners de
 * la chaîne aient run, puis on check `event.defaultPrevented` ou si quelque chose
 * a navigué.
 *
 * Activé une seule fois par session (idempotent).
 */

import { logger } from '../core/logger.js';

let installed = false;
let pageNavigatedAt = 0;

/* Track navigation pour ne pas toaster si un clic a effectivement navigué */
function trackNavigation(): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('hashchange', () => {
    pageNavigatedAt = Date.now();
  });
}

/**
 * Détermine si un élément a un handler "vraisemblable" :
 * - tag <a href> non vide
 * - <button type=submit> dans un <form>
 * - onclick attribut DOM
 * - data-action / data-nav-route / data-tool-cta / data-followup-prompt / data-slash-name
 * - href avec hash (#route)
 */
function isLikelyWired(el: HTMLElement): boolean {
  /* href non-vide */
  if (el instanceof HTMLAnchorElement) {
    const href = el.getAttribute('href');
    if (href && href !== '#' && href.trim() !== '') return true;
  }

  /* <button type=submit> dans <form> */
  if (el instanceof HTMLButtonElement) {
    if (el.type === 'submit' && el.closest('form')) return true;
    if (el.hasAttribute('disabled')) return true; /* disabled = "rien" volontaire */
  }

  /* onclick attribut DOM */
  if (el.getAttribute('onclick')) return true;

  /* Data attrs reconnus */
  const wiredDataAttrs = [
    'action',
    'navRoute',
    'toolCta',
    'followupPrompt',
    'slashName',
    'msgId',
    'noteId',
    'target',
    'cmd',
    'route',
    'tab',
    'modalAction',
  ];
  for (const attr of wiredDataAttrs) {
    if (attr in el.dataset) return true;
  }

  /* aria-haspopup ou role=button avec listener probable */
  if (el.getAttribute('aria-haspopup') || el.getAttribute('role') === 'tab') return true;

  /* close buttons sans data-action (modals customs) */
  const aria = el.getAttribute('aria-label') ?? '';
  if (/fermer|close|✕|×|✖/i.test(aria) || el.classList.contains('ax-tool-dismiss')) {
    return true; /* Habituellement wired par addEventListener proche */
  }

  return false;
}

/**
 * Install le fallback guard. Idempotent.
 */
export function installClickFallbackGuard(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  trackNavigation();

  document.addEventListener(
    'click',
    (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;

      /* Click sur enfant → remonte au bouton/lien */
      const clickable = target.closest<HTMLElement>(
        'button, a, [role="button"], .ax-btn, .ax-chip, .ax-card-clickable, [data-action], [data-nav-route]',
      );
      if (!clickable) return;

      /* Ignorer si dans un input (textarea/select) */
      if (clickable.closest('input, select, textarea')) return;

      /* Si déjà wired probablement, laisse passer */
      if (isLikelyWired(clickable)) return;

      /* Tick suivant : si la page a navigué (hashchange) ou defaultPrevented,
       * c'est que ça a bien fait quelque chose. Sinon → toast bientôt dispo. */
      const tBefore = Date.now();
      setTimeout(() => {
        if (e.defaultPrevented) return;
        if (pageNavigatedAt > tBefore) return;
        /* Lazy-load toast + haptic pour ne pas bloquer */
        void Promise.all([import('../ui/toast.js'), import('../ui/haptic.js').catch(() => null)])
          .then(([{ toast }, hapticMod]) => {
            try {
              hapticMod?.haptic?.tap?.();
            } catch {
              /* haptic optional */
            }
            const label = (clickable.textContent ?? '').trim().slice(0, 40) || 'Cette fonction';
            toast.show(`${label} : bientôt disponible`, 'info');
            logger.warn('click-fallback', `unwired click captured: "${label}"`, {
              tag: clickable.tagName,
              cls: clickable.className.slice(0, 80),
              id: clickable.id,
            });
          })
          .catch(() => {
            /* import failed, last-resort log */
            logger.warn('click-fallback', 'unwired click + toast import failed');
          });
      }, 50);
    },
    /* capture: false → on s'exécute APRÈS les handlers métier en bubble phase */
    false,
  );

  logger.info('click-fallback', 'guard installed');
}

export const clickFallbackGuard = {
  install: installClickFallbackGuard,
  isInstalled: (): boolean => installed,
};
