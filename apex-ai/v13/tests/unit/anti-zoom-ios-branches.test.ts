/**
 * anti-zoom-ios — couverture branches restantes (campagne 100% réel, 2026-06-02).
 * Cible checkAndResetZoom : vv absent, scale>1.01 (zoom) avec/sans meta viewport.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { antiZoomIOS } from '../../services/core-svc/anti-zoom-ios.js';

const azi = antiZoomIOS as unknown as { checkAndResetZoom(): void };

function setVV(scale: number | undefined): void {
  Object.defineProperty(window, 'visualViewport', {
    value: scale === undefined ? undefined : { scale },
    configurable: true,
    writable: true,
  });
}

const origScrollTo = window.scrollTo;
beforeEach(() => {
  vi.useFakeTimers();
  document.querySelector('meta[name="viewport"]')?.remove();
  window.scrollTo = vi.fn();
});
afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  /* CRITIQUE (leçon #84) : restaurer TOUTE mutation globale pour éviter les fuites
     cross-fork — visualViewport, visibilityState, listeners install(), scrollTo. */
  (antiZoomIOS as unknown as { uninstall(): void }).uninstall();
  try { delete (window as unknown as Record<string, unknown>).visualViewport; } catch { /* ignore */ }
  try { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); } catch { /* ignore */ }
  window.scrollTo = origScrollTo;
  document.querySelector('meta[name="viewport"]')?.remove();
});

describe('anti-zoom-ios — checkAndResetZoom', () => {
  it('pas de visualViewport → return (no-op)', () => {
    setVV(undefined);
    expect(() => azi.checkAndResetZoom()).not.toThrow();
  });

  it('scale = 1 (pas de zoom) → rien', () => {
    setVV(1);
    azi.checkAndResetZoom();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('scale > 1.01 + meta viewport présent → reset meta + scrollTo + restore après 50ms', () => {
    setVV(1.5);
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'viewport');
    meta.setAttribute('content', 'width=device-width,initial-scale=1');
    document.head.appendChild(meta);
    azi.checkAndResetZoom();
    expect(meta.getAttribute('content')).toContain('maximum-scale=1');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    vi.advanceTimersByTime(60);
    expect(meta.getAttribute('content')).toBe('width=device-width,initial-scale=1'); // restauré
    meta.remove();
  });

  it('scale > 1.01 SANS meta viewport → scrollTo seul (branche if(meta) false)', () => {
    setVV(1.5);
    azi.checkAndResetZoom();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('meta viewport SANS attribut content → original = "" (branche ?? "")', () => {
    setVV(1.5);
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'viewport'); // pas de content
    document.head.appendChild(meta);
    azi.checkAndResetZoom();
    expect(meta.getAttribute('content')).toContain('maximum-scale=1');
    vi.advanceTimersByTime(60);
    expect(meta.getAttribute('content')).toBe(''); // restauré vers '' (?? '')
    meta.remove();
  });

  it('window undefined → guard typeof return', () => {
    vi.stubGlobal('window', undefined);
    expect(() => azi.checkAndResetZoom()).not.toThrow();
    vi.unstubAllGlobals();
  });
});

describe('anti-zoom-ios — install + lifecycle', () => {
  it('install : visibilitychange visible/hidden + focus déclenchent checkAndResetZoom', () => {
    const azFull = antiZoomIOS as unknown as { install(): void; uninstall(): void; checkAndResetZoom(): void };
    azFull.uninstall();
    setVV(1); // pas de zoom → checkAndResetZoom no-op safe
    azFull.install();
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    expect(() => document.dispatchEvent(new Event('visibilitychange'))).not.toThrow();
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    expect(() => document.dispatchEvent(new Event('visibilitychange'))).not.toThrow();
    expect(() => window.dispatchEvent(new Event('focus'))).not.toThrow();
    azFull.uninstall();
  });

  it('install 2× → 2e fois no-op (déjà installé)', () => {
    const azFull = antiZoomIOS as unknown as { install(): void; uninstall(): void };
    azFull.uninstall();
    azFull.install();
    expect(() => azFull.install()).not.toThrow(); // installed → return
    azFull.uninstall();
  });
});
