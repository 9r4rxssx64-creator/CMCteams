/**
 * Tests RÉELS ui/loading.ts (Kevin v13 redesign UX premium 2026-05-04).
 * Couvre : spinner, thinking, shimmer, cards, list, confetti, inlineLoading.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  spinner,
  thinking,
  shimmerLine,
  cardShimmer,
  listShimmer,
  confetti,
  inlineLoading,
  loading,
} from '../../ui/loading.js';

describe('UI Loading premium (Kevin v13 redesign UX)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('spinner()', () => {
    it('returns div with ax-spinner-premium class', () => {
      const html = spinner();
      expect(html).toContain('ax-spinner-premium');
      expect(html).toContain('role="status"');
    });

    it('size sm returns ax-spinner-premium-sm class', () => {
      expect(spinner({ size: 'sm' })).toContain('ax-spinner-premium-sm');
    });

    it('size lg returns ax-spinner-premium-lg class', () => {
      expect(spinner({ size: 'lg' })).toContain('ax-spinner-premium-lg');
    });

    it('size md (default) returns no size suffix', () => {
      const html = spinner({ size: 'md' });
      expect(html).toContain('ax-spinner-premium');
      expect(html).not.toContain('ax-spinner-premium-sm');
      expect(html).not.toContain('ax-spinner-premium-lg');
    });

    it('aria-label customizable', () => {
      expect(spinner({ ariaLabel: 'Téléchargement' })).toContain('aria-label="Téléchargement"');
    });

    it('aria-label default = Chargement', () => {
      expect(spinner()).toContain('aria-label="Chargement"');
    });

    it('aria-label is escaped (anti-XSS)', () => {
      const html = spinner({ ariaLabel: '<script>x</script>' });
      expect(html).not.toContain('<script>x</script>');
      expect(html).toContain('&lt;script&gt;');
    });
  });

  describe('thinking()', () => {
    it('returns ax-thinking with 3 dots', () => {
      const html = thinking();
      expect(html).toContain('ax-thinking');
      const dotMatches = html.match(/ax-thinking-dot/g);
      expect(dotMatches?.length).toBeGreaterThanOrEqual(3);
    });

    it('default label = "Apex réfléchit"', () => {
      expect(thinking()).toContain('Apex réfléchit');
    });

    it('custom label', () => {
      expect(thinking('Recherche')).toContain('Recherche');
    });

    it('has aria-live=polite for screen readers', () => {
      expect(thinking()).toContain('aria-live="polite"');
    });

    it('label escaped (anti-XSS)', () => {
      const html = thinking('<img src=x>');
      expect(html).not.toContain('<img src=x>');
      expect(html).toContain('&lt;img');
    });
  });

  describe('shimmerLine()', () => {
    it('default 100% width 14px height', () => {
      const html = shimmerLine();
      expect(html).toContain('ax-shimmer');
      expect(html).toContain('width:100%');
      expect(html).toContain('height:14px');
    });

    it('custom width and height', () => {
      const html = shimmerLine('60%', '12px');
      expect(html).toContain('width:60%');
      expect(html).toContain('height:12px');
    });

    it('strips dangerous chars in attr (defense)', () => {
      const html = shimmerLine('"<script>', '"<script>');
      expect(html).not.toContain('<script>');
    });
  });

  describe('cardShimmer()', () => {
    it('returns wrapped card with multiple shimmer lines', () => {
      const html = cardShimmer();
      expect(html).toContain('ax-card-elevated');
      expect(html).toContain('ax-shimmer');
      expect(html).toContain('aria-busy="true"');
      const lines = html.match(/ax-shimmer/g);
      expect(lines?.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('listShimmer()', () => {
    it('default 4 items', () => {
      const html = listShimmer();
      const matches = html.match(/border-radius:50%/g);
      expect(matches?.length).toBe(4);
    });

    it('custom count', () => {
      const html = listShimmer(7);
      const matches = html.match(/border-radius:50%/g);
      expect(matches?.length).toBe(7);
    });

    it('count clamped min 1', () => {
      const html = listShimmer(0);
      const matches = html.match(/border-radius:50%/g);
      expect(matches?.length).toBe(1);
    });

    it('count clamped max 50', () => {
      const html = listShimmer(999);
      const matches = html.match(/border-radius:50%/g);
      expect(matches?.length).toBe(50);
    });

    it('has aria-busy=true for screen readers', () => {
      expect(listShimmer(2)).toContain('aria-busy="true"');
    });
  });

  describe('confetti()', () => {
    it('appends container to document body', () => {
      confetti(10);
      const c = document.body.querySelector('.ax-confetti');
      expect(c).not.toBeNull();
    });

    it('creates N pieces inside container', () => {
      confetti(15);
      const pieces = document.body.querySelectorAll('.ax-confetti-piece');
      expect(pieces.length).toBe(15);
    });

    it('container has aria-hidden=true (decorative)', () => {
      confetti(5);
      const c = document.body.querySelector('.ax-confetti');
      expect(c?.getAttribute('aria-hidden')).toBe('true');
    });

    it('auto-cleanup after 2200ms', () => {
      confetti(5);
      expect(document.body.querySelector('.ax-confetti')).not.toBeNull();
      vi.advanceTimersByTime(2300);
      expect(document.body.querySelector('.ax-confetti')).toBeNull();
    });

    it('count clamped min 1', () => {
      confetti(0);
      const pieces = document.body.querySelectorAll('.ax-confetti-piece');
      expect(pieces.length).toBe(1);
    });

    it('count clamped max 200', () => {
      confetti(500);
      const pieces = document.body.querySelectorAll('.ax-confetti-piece');
      expect(pieces.length).toBe(200);
    });

    it('respects prefers-reduced-motion (no-op)', () => {
      const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => {
        return {
          matches: q.includes('reduce'),
          media: q,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        } as unknown as MediaQueryList;
      });
      confetti(20);
      expect(document.body.querySelector('.ax-confetti')).toBeNull();
      matchMediaSpy.mockRestore();
    });
  });

  describe('inlineLoading()', () => {
    it('replaces target innerHTML with spinner by default', () => {
      const target = document.createElement('div');
      target.innerHTML = '<p>original</p>';
      document.body.appendChild(target);
      inlineLoading(target);
      expect(target.innerHTML).toContain('ax-spinner-premium');
      expect(target.getAttribute('aria-busy')).toBe('true');
    });

    it('thinking variant inserts ax-thinking', () => {
      const target = document.createElement('div');
      document.body.appendChild(target);
      inlineLoading(target, 'thinking');
      expect(target.innerHTML).toContain('ax-thinking');
    });

    it('shimmer variant inserts cardShimmer', () => {
      const target = document.createElement('div');
      document.body.appendChild(target);
      inlineLoading(target, 'shimmer');
      expect(target.innerHTML).toContain('ax-shimmer');
    });

    it('returned stop fn restores original content', () => {
      const target = document.createElement('div');
      target.innerHTML = '<p>my content</p>';
      document.body.appendChild(target);
      const stop = inlineLoading(target);
      expect(target.innerHTML).not.toContain('<p>my content</p>');
      stop();
      expect(target.innerHTML).toContain('<p>my content</p>');
    });

    it('removes aria-busy after stop if not set originally', () => {
      const target = document.createElement('div');
      document.body.appendChild(target);
      const stop = inlineLoading(target);
      expect(target.getAttribute('aria-busy')).toBe('true');
      stop();
      expect(target.getAttribute('aria-busy')).toBeNull();
    });

    it('preserves aria-busy if set originally', () => {
      const target = document.createElement('div');
      target.setAttribute('aria-busy', 'false');
      document.body.appendChild(target);
      const stop = inlineLoading(target);
      stop();
      expect(target.getAttribute('aria-busy')).toBe('false');
    });

    it('null target returns no-op fn (safe)', () => {
      const stop = inlineLoading(null as unknown as HTMLElement);
      expect(typeof stop).toBe('function');
      expect(() => stop()).not.toThrow();
    });
  });

  describe('default export bundle', () => {
    it('exposes all helpers via loading object', () => {
      expect(loading.spinner).toBe(spinner);
      expect(loading.thinking).toBe(thinking);
      expect(loading.shimmerLine).toBe(shimmerLine);
      expect(loading.cardShimmer).toBe(cardShimmer);
      expect(loading.listShimmer).toBe(listShimmer);
      expect(loading.confetti).toBe(confetti);
      expect(loading.inlineLoading).toBe(inlineLoading);
    });
  });
});
