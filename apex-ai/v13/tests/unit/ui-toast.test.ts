/**
 * Tests RÉELS ui/toast.ts (path A composant UI).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { toast } from '../../ui/toast.js';

describe('UI Toast notifications (Jet 8 path A)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('show()', () => {
    it('create container + toast element dans body', () => {
      toast.show('Hello world', 'info');
      const container = document.body.querySelector('.ax-toast-container');
      expect(container).not.toBeNull();
      expect(container?.querySelectorAll('.ax-toast').length).toBe(1);
    });

    it('container a role=status + aria-live=polite (a11y)', () => {
      toast.show('A11y check');
      const c = document.body.querySelector('.ax-toast-container');
      expect(c?.getAttribute('role')).toBe('status');
      expect(c?.getAttribute('aria-live')).toBe('polite');
    });

    it('toast contient message via textContent (anti-XSS)', () => {
      toast.show('<script>alert(1)</script>', 'info');
      const t = document.body.querySelector('.ax-toast .ax-toast-text');
      /* textContent = échappe les < > */
      expect(t?.textContent).toBe('<script>alert(1)</script>');
      expect(t?.innerHTML).toContain('&lt;script&gt;');
      expect(document.body.innerHTML).not.toContain('<script>alert(1)</script>');
    });

    it('niveau success → class ax-toast-success + icon ✓', () => {
      toast.show('Saved!', 'success');
      const t = document.body.querySelector('.ax-toast');
      expect(t?.classList.contains('ax-toast-success')).toBe(true);
      const icon = t?.querySelector('.ax-toast-icon');
      expect(icon?.textContent).toContain('✓');
    });

    it('niveau error → class ax-toast-error + icon ✕', () => {
      toast.show('Oops', 'error');
      const t = document.body.querySelector('.ax-toast');
      expect(t?.classList.contains('ax-toast-error')).toBe(true);
      const icon = t?.querySelector('.ax-toast-icon');
      expect(icon?.textContent).toContain('✕');
    });

    it('shortcut info/success/warn/error → bon niveau', () => {
      toast.info('I');
      toast.success('S');
      toast.warn('W');
      toast.error('E');
      const toasts = document.body.querySelectorAll('.ax-toast');
      expect(toasts[0]?.classList.contains('ax-toast-info')).toBe(true);
      expect(toasts[1]?.classList.contains('ax-toast-success')).toBe(true);
      expect(toasts[2]?.classList.contains('ax-toast-warn')).toBe(true);
      expect(toasts[3]?.classList.contains('ax-toast-error')).toBe(true);
    });

    it('id retourné est unique entre 2 calls', () => {
      const id1 = toast.show('A');
      const id2 = toast.show('B');
      expect(id1).not.toBe(id2);
    });
  });

  describe('dismiss + auto-dismiss', () => {
    it('dismiss() retire toast après 300ms transition', () => {
      const id = toast.show('temp');
      expect(document.body.querySelector(`#${id}`)).not.toBeNull();
      toast.dismiss(id);
      vi.advanceTimersByTime(310);
      expect(document.body.querySelector(`#${id}`)).toBeNull();
    });

    it('auto-dismiss après 3s par défaut', () => {
      const id = toast.show('auto');
      expect(document.body.querySelector(`#${id}`)).not.toBeNull();
      vi.advanceTimersByTime(3000 + 350);
      expect(document.body.querySelector(`#${id}`)).toBeNull();
    });

    it('duration 0 → pas d\'auto-dismiss', () => {
      const id = toast.show('persist', 'info', { duration: 0 });
      vi.advanceTimersByTime(10000);
      expect(document.body.querySelector(`#${id}`)).not.toBeNull();
    });

    it('duration custom 1000ms → dismiss après 1s', () => {
      const id = toast.show('custom', 'info', { duration: 1000 });
      vi.advanceTimersByTime(500);
      expect(document.body.querySelector(`#${id}`)).not.toBeNull();
      vi.advanceTimersByTime(800);
      expect(document.body.querySelector(`#${id}`)).toBeNull();
    });

    it('dismissAll vide tout', () => {
      toast.show('A');
      toast.show('B');
      toast.show('C');
      expect(document.body.querySelectorAll('.ax-toast').length).toBe(3);
      toast.dismissAll();
      vi.advanceTimersByTime(310);
      expect(document.body.querySelectorAll('.ax-toast').length).toBe(0);
    });
  });

  describe('Click to dismiss', () => {
    it('click sur toast déclenche dismiss', () => {
      const id = toast.show('clickable');
      const t = document.body.querySelector(`#${id}`) as HTMLElement;
      t.click();
      vi.advanceTimersByTime(310);
      expect(document.body.querySelector(`#${id}`)).toBeNull();
    });
  });
});
