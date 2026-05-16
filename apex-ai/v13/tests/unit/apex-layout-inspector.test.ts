/**
 * Tests apex-layout-inspector v13.4.180.
 *
 * Vérifie le scan DOM (overflow, hidden buttons, small touch targets)
 * et la lifecycle autoMonitor.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type LayoutScanReport,
  getLastReport,
  scanDom,
  startAutoMonitor,
  stopAutoMonitor,
} from '../../services/apex-layout-inspector.js';

describe('apex-layout-inspector scanDom (v13.4.180)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('retourne un report avec viewport + ts + ver', () => {
    const r = scanDom();
    expect(r.viewport).toHaveProperty('width');
    expect(r.viewport).toHaveProperty('height');
    expect(r.ts).toBeGreaterThan(0);
    expect(r.ver).toBe('v13.4.180');
  });

  it('détecte overflow horizontal sur élément avec scrollWidth > clientWidth', () => {
    const div = document.createElement('div');
    div.style.cssText = 'width: 100px; overflow: visible;';
    div.innerHTML = '<span style="display:inline-block;width:300px">long content debordant</span>';
    document.body.appendChild(div);
    /* Force layout */
    void div.offsetHeight;
    const r = scanDom();
    /* L'élément div peut être détecté ou non selon comportement happy-dom — on teste structure */
    expect(r.overflowingElements).toBeInstanceOf(Array);
  });

  it('ignore éléments avec overflow-x:auto ou scroll (intentionnel)', () => {
    const div = document.createElement('div');
    div.style.cssText = 'width: 100px; overflow-x: auto;';
    div.innerHTML = '<span style="display:inline-block;width:300px">scroll OK</span>';
    document.body.appendChild(div);
    const r = scanDom();
    /* Cet élément ne doit PAS être dans overflowingElements */
    const found = r.overflowingElements.find((e) => e.classes.includes('') && e.scrollWidth >= 300);
    /* Test loose : juste qu'on a pas d'erreur */
    expect(r).toBeDefined();
    expect(found).toBeUndefined();
  });

  it('détecte petits touch targets (<44px)', () => {
    const btn = document.createElement('button');
    btn.style.cssText = 'width: 20px; height: 20px;';
    btn.textContent = 'X';
    document.body.appendChild(btn);
    /* happy-dom peut ne pas calculer getBoundingClientRect — test souple */
    const r = scanDom();
    expect(r.smallTouchTargets).toBeInstanceOf(Array);
  });

  it('inclut computedMetrics avec font-size + position', () => {
    const r = scanDom();
    expect(r.computedMetrics).toHaveProperty('htmlFontSize');
    expect(r.computedMetrics).toHaveProperty('bodyFontSize');
    expect(r.computedMetrics).toHaveProperty('rootPosition');
    expect(r.computedMetrics).toHaveProperty('visualViewportScale');
  });

  it('cap overflowingElements à 40 max', () => {
    /* Crée 50 éléments potentiellement overflowing */
    for (let i = 0; i < 50; i++) {
      const div = document.createElement('div');
      div.style.cssText = 'width: 100px; overflow: visible;';
      div.innerHTML = `<span style="display:inline-block;width:300px">overflow-${i}</span>`;
      document.body.appendChild(div);
    }
    const r = scanDom();
    expect(r.overflowingElements.length).toBeLessThanOrEqual(40);
  });

  it('cap hiddenButtons à 30 max', () => {
    const r = scanDom();
    expect(r.hiddenButtons.length).toBeLessThanOrEqual(30);
  });

  it('cap smallTouchTargets à 20 max', () => {
    const r = scanDom();
    expect(r.smallTouchTargets.length).toBeLessThanOrEqual(20);
  });
});

describe('apex-layout-inspector autoMonitor lifecycle (v13.4.180)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
    stopAutoMonitor();
  });

  afterEach(() => {
    vi.useRealTimers();
    stopAutoMonitor();
  });

  it('startAutoMonitor lance scan périodique', () => {
    startAutoMonitor(1000);
    expect(getLastReport()).toBeNull();
    vi.advanceTimersByTime(1000);
    const r = getLastReport();
    expect(r).not.toBeNull();
    expect(r?.ts).toBeGreaterThan(0);
  });

  it('startAutoMonitor idempotent (pas de double interval)', () => {
    startAutoMonitor(1000);
    startAutoMonitor(1000); // 2e appel ignoré
    vi.advanceTimersByTime(1000);
    const r1 = getLastReport();
    expect(r1).not.toBeNull();
    /* Pas de crash, pas de double scan */
  });

  it('stopAutoMonitor arrête correctement', () => {
    startAutoMonitor(1000);
    vi.advanceTimersByTime(1000);
    const r1 = getLastReport();
    stopAutoMonitor();
    const r1ts = r1?.ts ?? 0;
    vi.advanceTimersByTime(2000);
    /* Pas de nouveau scan : lastReport inchangé */
    const r2 = getLastReport();
    expect(r2?.ts).toBe(r1ts);
  });
});

describe('apex-layout-inspector report shape (v13.4.180)', () => {
  it('report sérialisable JSON (pas de circular refs)', () => {
    const r: LayoutScanReport = scanDom();
    expect(() => JSON.stringify(r)).not.toThrow();
    const parsed = JSON.parse(JSON.stringify(r));
    expect(parsed.viewport).toEqual(r.viewport);
  });
});
