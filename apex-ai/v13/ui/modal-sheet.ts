/**
 * APEX v13 — Modal Apple half-sheet (iOS-inspired bottom sheet).
 *
 * Slide-up depuis le bas, drag-to-dismiss, backdrop tap-to-close.
 * Touch-friendly mobile-first iPhone PWA.
 *
 * Usage :
 *   const sheet = modalSheet.open({
 *     title: 'Confirmer',
 *     content: '<p>Es-tu sûr ?</p>',
 *     actions: [
 *       { label: 'Annuler', variant: 'ghost', onClick: () => sheet.close() },
 *       { label: 'OK', variant: 'primary', onClick: () => doSomething() },
 *     ],
 *   });
 */

import { haptic } from './haptic.js';

interface SheetAction {
  label: string;
  variant?: 'primary' | 'ghost' | 'danger';
  onClick: () => void;
}

interface SheetOptions {
  title?: string;
  content: string;
  actions?: SheetAction[];
  dismissable?: boolean;
}

interface SheetHandle {
  el: HTMLElement;
  close: () => void;
}

class ModalSheet {
  private idCounter = 0;
  private active: SheetHandle | null = null;

  open(opts: SheetOptions): SheetHandle {
    /* Close existing si actif (1 sheet à la fois) */
    if (this.active) this.active.close();

    const id = `ax-sheet-${++this.idCounter}-${Date.now()}`;
    const overlay = document.createElement('div');
    overlay.className = 'ax-sheet-overlay';
    overlay.id = id;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    if (opts.title) overlay.setAttribute('aria-label', opts.title);

    const sheet = document.createElement('div');
    sheet.className = 'ax-sheet';
    const titleHTML = opts.title
      ? `<div class="ax-sheet-header">
          <h2 class="ax-sheet-title">${this.escapeHtml(opts.title)}</h2>
          ${opts.dismissable !== false ? '<button class="ax-sheet-close" aria-label="Fermer">×</button>' : ''}
        </div>`
      : '';
    const actionsHTML =
      opts.actions && opts.actions.length > 0
        ? `<div class="ax-sheet-actions">${opts.actions
            .map(
              (a, i) => `
              <button class="ax-btn ax-btn-${a.variant ?? 'ghost'}" data-action-idx="${i}">
                ${this.escapeHtml(a.label)}
              </button>`,
            )
            .join('')}</div>`
        : '';

    sheet.innerHTML = `
      <div class="ax-sheet-handle"></div>
      ${titleHTML}
      <div class="ax-sheet-body">${opts.content}</div>
      ${actionsHTML}
    `;
    overlay.appendChild(sheet);
    document.body.appendChild(overlay);

    /* Trigger entrance */
    requestAnimationFrame(() => {
      overlay.classList.add('ax-sheet-visible');
      sheet.classList.add('ax-sheet-up');
    });

    haptic.medium();

    /* Close handlers */
    const close = (): void => {
      overlay.classList.remove('ax-sheet-visible');
      sheet.classList.remove('ax-sheet-up');
      sheet.classList.add('ax-sheet-down');
      setTimeout(() => {
        overlay.remove();
        if (this.active && this.active.el === overlay) this.active = null;
      }, 300);
    };

    if (opts.dismissable !== false) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          haptic.tap();
          close();
        }
      });
      sheet.querySelector('.ax-sheet-close')?.addEventListener('click', () => {
        haptic.tap();
        close();
      });
      /* Escape key */
      const handleKey = (e: KeyboardEvent): void => {
        if (e.key === 'Escape') {
          close();
          document.removeEventListener('keydown', handleKey);
        }
      };
      document.addEventListener('keydown', handleKey);
    }

    /* Action handlers */
    if (opts.actions) {
      sheet.querySelectorAll<HTMLButtonElement>('[data-action-idx]').forEach((btn) => {
        const idx = Number(btn.dataset['actionIdx']);
        const action = opts.actions?.[idx];
        if (!action) return;
        btn.addEventListener('click', () => {
          haptic.tap();
          action.onClick();
        });
      });
    }

    const handle: SheetHandle = { el: overlay, close };
    this.active = handle;
    return handle;
  }

  closeAll(): void {
    if (this.active) {
      this.active.close();
      this.active = null;
    }
    document.querySelectorAll<HTMLElement>('.ax-sheet-overlay').forEach((el) => el.remove());
  }

  private escapeHtml(s: string): string {
    return s.replace(
      /[&<>"']/g,
      (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
    );
  }
}

export const modalSheet = new ModalSheet();
