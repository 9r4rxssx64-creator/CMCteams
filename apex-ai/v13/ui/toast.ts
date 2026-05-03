/**
 * APEX v13 — Toast notifications (Apple-inspired sliding from top).
 *
 * Usage:
 *   import { toast } from '@ui/toast.js';
 *   toast.show('Sauvegardé', 'success');
 *   toast.error('Réseau coupé');
 *
 * Stack vertical, auto-dismiss 3s (ou cliquable pour fermer immédiat).
 * Touch-friendly 44px min, swipe-to-dismiss.
 */

import { haptic } from './haptic.js';

type ToastLevel = 'info' | 'success' | 'warn' | 'error';

interface ToastOptions {
  duration?: number;
  haptic?: boolean;
}

class Toast {
  private container: HTMLElement | null = null;
  private idCounter = 0;

  private getContainer(): HTMLElement {
    if (this.container && document.body.contains(this.container)) return this.container;
    const el = document.createElement('div');
    el.className = 'ax-toast-container';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    document.body.appendChild(el);
    this.container = el;
    return el;
  }

  show(message: string, level: ToastLevel = 'info', opts: ToastOptions = {}): string {
    const id = `toast-${++this.idCounter}-${Date.now()}`;
    const duration = opts.duration ?? 3000;
    const useHaptic = opts.haptic ?? true;

    const el = document.createElement('div');
    el.className = `ax-toast ax-toast-${level}`;
    el.id = id;
    el.setAttribute('role', 'alert');

    const icon = this.getIcon(level);
    el.innerHTML = `
      <span class="ax-toast-icon">${icon}</span>
      <span class="ax-toast-text"></span>
      <button class="ax-toast-close" aria-label="Fermer">×</button>
    `;
    /* Set text safely (no innerHTML for user message) */
    const textEl = el.querySelector<HTMLElement>('.ax-toast-text');
    if (textEl) textEl.textContent = message;

    /* Click anywhere to dismiss */
    el.addEventListener('click', () => this.dismiss(id));

    this.getContainer().appendChild(el);

    /* Trigger entrance animation */
    requestAnimationFrame(() => {
      el.classList.add('ax-toast-visible');
    });

    /* Haptic feedback */
    if (useHaptic) {
      if (level === 'success') haptic.success();
      else if (level === 'warn') haptic.warning();
      else if (level === 'error') haptic.error();
      else haptic.tap();
    }

    /* Auto-dismiss */
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }

    return id;
  }

  dismiss(id: string): void {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('ax-toast-visible');
    el.classList.add('ax-toast-leaving');
    setTimeout(() => {
      el.remove();
    }, 300);
  }

  dismissAll(): void {
    const c = this.container;
    if (!c) return;
    c.querySelectorAll<HTMLElement>('.ax-toast').forEach((el) => {
      this.dismiss(el.id);
    });
  }

  /* Shortcuts */
  info(message: string, opts?: ToastOptions): string {
    return this.show(message, 'info', opts);
  }

  success(message: string, opts?: ToastOptions): string {
    return this.show(message, 'success', opts);
  }

  warn(message: string, opts?: ToastOptions): string {
    return this.show(message, 'warn', opts);
  }

  error(message: string, opts?: ToastOptions): string {
    return this.show(message, 'error', opts);
  }

  private getIcon(level: ToastLevel): string {
    switch (level) {
      case 'success':
        return '✓';
      case 'warn':
        return '!';
      case 'error':
        return '✕';
      case 'info':
      default:
        return 'i';
    }
  }
}

export const toast = new Toast();
