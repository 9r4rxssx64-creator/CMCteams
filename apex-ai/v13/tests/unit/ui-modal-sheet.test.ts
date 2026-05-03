/**
 * Tests RÉELS ui/modal-sheet.ts (path A composant UI).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { modalSheet } from '../../ui/modal-sheet.js';

describe('UI Modal half-sheet (Jet 8 path A)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    modalSheet.closeAll();
    vi.useRealTimers();
  });

  describe('open()', () => {
    it('crée overlay + sheet dans body', () => {
      modalSheet.open({ title: 'Test', content: '<p>Hello</p>' });
      const overlay = document.body.querySelector('.ax-sheet-overlay');
      const sheet = overlay?.querySelector('.ax-sheet');
      expect(overlay).not.toBeNull();
      expect(sheet).not.toBeNull();
    });

    it('overlay role=dialog + aria-modal=true (a11y)', () => {
      modalSheet.open({ title: 'A11y', content: 'x' });
      const overlay = document.body.querySelector('.ax-sheet-overlay');
      expect(overlay?.getAttribute('role')).toBe('dialog');
      expect(overlay?.getAttribute('aria-modal')).toBe('true');
      expect(overlay?.getAttribute('aria-label')).toBe('A11y');
    });

    it('title rendered dans header + handle drag visible', () => {
      modalSheet.open({ title: 'Mon titre', content: 'x' });
      const titleEl = document.body.querySelector('.ax-sheet-title');
      expect(titleEl?.textContent).toBe('Mon titre');
      expect(document.body.querySelector('.ax-sheet-handle')).not.toBeNull();
    });

    it('title XSS escape (anti-injection)', () => {
      modalSheet.open({ title: '<script>alert(1)</script>', content: 'x' });
      const titleEl = document.body.querySelector('.ax-sheet-title');
      expect(titleEl?.innerHTML).toContain('&lt;script&gt;');
      expect(titleEl?.innerHTML).not.toContain('<script>alert(1)</script>');
    });

    it('content custom HTML injecté tel quel (assumed safe par caller)', () => {
      modalSheet.open({ title: 'X', content: '<div class="custom">My content</div>' });
      const body = document.body.querySelector('.ax-sheet-body');
      expect(body?.querySelector('.custom')?.textContent).toBe('My content');
    });

    it('actions render boutons cliquables avec onClick', () => {
      const onClick = vi.fn();
      modalSheet.open({
        title: 'X',
        content: 'x',
        actions: [
          { label: 'OK', variant: 'primary', onClick },
          { label: 'Annuler', variant: 'ghost', onClick: () => undefined },
        ],
      });
      const buttons = document.body.querySelectorAll<HTMLButtonElement>('.ax-sheet-actions .ax-btn');
      expect(buttons.length).toBe(2);
      expect(buttons[0]?.textContent?.trim()).toContain('OK');
      expect(buttons[0]?.classList.contains('ax-btn-primary')).toBe(true);
      buttons[0]?.click();
      expect(onClick).toHaveBeenCalled();
    });

    it('returns handle avec close() qui retire après transition', () => {
      const sheet = modalSheet.open({ title: 'X', content: 'x' });
      expect(document.body.querySelector('.ax-sheet-overlay')).not.toBeNull();
      sheet.close();
      vi.advanceTimersByTime(310);
      expect(document.body.querySelector('.ax-sheet-overlay')).toBeNull();
    });
  });

  describe('Dismiss interactions', () => {
    it('click backdrop overlay → close', () => {
      const sheet = modalSheet.open({ title: 'X', content: 'x' });
      const overlay = sheet.el;
      overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      vi.advanceTimersByTime(310);
      expect(document.body.querySelector('.ax-sheet-overlay')).toBeNull();
    });

    it('click bouton close button → close', () => {
      const sheet = modalSheet.open({ title: 'X', content: 'x' });
      const closeBtn = sheet.el.querySelector<HTMLElement>('.ax-sheet-close');
      closeBtn?.click();
      vi.advanceTimersByTime(310);
      expect(document.body.querySelector('.ax-sheet-overlay')).toBeNull();
    });

    it('Escape key → close', () => {
      modalSheet.open({ title: 'X', content: 'x' });
      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      document.dispatchEvent(event);
      vi.advanceTimersByTime(310);
      expect(document.body.querySelector('.ax-sheet-overlay')).toBeNull();
    });

    it('dismissable=false → pas de close button + pas de click backdrop close', () => {
      const sheet = modalSheet.open({ title: 'Forced', content: 'x', dismissable: false });
      expect(sheet.el.querySelector('.ax-sheet-close')).toBeNull();
      sheet.el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      vi.advanceTimersByTime(310);
      /* Toujours présent car dismissable=false bloque le close */
      expect(document.body.querySelector('.ax-sheet-overlay')).not.toBeNull();
    });
  });

  describe('Multiple sheets', () => {
    it('open 2nd sheet ferme le 1er (1 sheet à la fois)', () => {
      modalSheet.open({ title: 'A', content: 'x' });
      modalSheet.open({ title: 'B', content: 'y' });
      vi.advanceTimersByTime(350);
      const visibleTitles = Array.from(document.body.querySelectorAll('.ax-sheet-title')).map(
        (e) => e.textContent,
      );
      /* B est seul visible */
      expect(visibleTitles).toContain('B');
      expect(visibleTitles.length).toBe(1);
    });

    it('closeAll vide tous les overlays (cleanup brut)', () => {
      modalSheet.open({ title: 'A', content: 'x' });
      modalSheet.closeAll();
      expect(document.body.querySelectorAll('.ax-sheet-overlay').length).toBe(0);
    });
  });
});
