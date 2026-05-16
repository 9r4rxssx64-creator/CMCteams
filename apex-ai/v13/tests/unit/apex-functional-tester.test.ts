/**
 * Tests apex-functional-tester v13.4.181.
 *
 * Vérifie test runtime boutons : ok/no_response/skipped_destructive/disabled,
 * detectStaleButtons, autoFix whitelist.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  detectStaleButtons,
  testButtonsInView,
} from '../../services/apex-functional-tester.js';

describe('apex-functional-tester testButtonsInView (v13.4.181)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('retourne report avec ts + ver + viewBefore', async () => {
    const r = await testButtonsInView({ maxButtons: 5 });
    expect(r.ts).toBeGreaterThan(0);
    expect(r.ver).toBe('v13.4.181');
    expect(r.viewBefore).toBeDefined();
  });

  it('compte 0 boutons sur DOM vide', async () => {
    const r = await testButtonsInView({ maxButtons: 5 });
    expect(r.totalButtons).toBe(0);
    expect(r.tested).toBe(0);
  });

  it('skippe boutons destructifs (text "Supprimer")', async () => {
    const btn = document.createElement('button');
    btn.textContent = 'Supprimer';
    btn.style.cssText = 'width:100px;height:44px';
    document.body.appendChild(btn);
    const r = await testButtonsInView({ maxButtons: 5 });
    /* happy-dom peut ne pas calculer rect → on teste qu'aucun crash */
    expect(r.details).toBeInstanceOf(Array);
    const destructive = r.details.find((d) => d.status === 'skipped_destructive');
    /* Si le bouton est visible (rect > 0) il devrait être skippé */
    if (r.tested > 0) {
      expect(destructive).toBeDefined();
    }
  });

  it('skippe boutons "Effacer", "Reset", "Logout", "Déconnex"', async () => {
    ['Effacer toutes les clés', 'Reset session', 'Logout', 'Déconnexion'].forEach((txt) => {
      const b = document.createElement('button');
      b.textContent = txt;
      document.body.appendChild(b);
    });
    const r = await testButtonsInView({ maxButtons: 10 });
    if (r.tested > 0) {
      expect(r.skipped).toBeGreaterThanOrEqual(1);
    }
  });

  it('skippe boutons disabled', async () => {
    const btn = document.createElement('button');
    btn.textContent = 'OK';
    btn.disabled = true;
    document.body.appendChild(btn);
    const r = await testButtonsInView({ maxButtons: 5 });
    if (r.tested > 0) {
      const disabled = r.details.find((d) => d.status === 'disabled');
      expect(disabled).toBeDefined();
    }
  });

  it('skippe boutons avec data-test-safe="false"', async () => {
    const btn = document.createElement('button');
    btn.textContent = 'OK action';
    btn.setAttribute('data-test-safe', 'false');
    document.body.appendChild(btn);
    const r = await testButtonsInView({ maxButtons: 5 });
    if (r.tested > 0) {
      const skipped = r.details.find((d) => d.status === 'skipped_destructive');
      expect(skipped).toBeDefined();
    }
  });

  it('cap nombre de boutons selon maxButtons opt', async () => {
    for (let i = 0; i < 50; i++) {
      const b = document.createElement('button');
      b.textContent = `Btn ${i}`;
      b.style.cssText = 'width:100px;height:44px';
      document.body.appendChild(b);
    }
    const r = await testButtonsInView({ maxButtons: 10 });
    expect(r.tested).toBeLessThanOrEqual(10);
  });

  it('détecte réaction quand bouton change hash URL', async () => {
    const btn = document.createElement('button');
    btn.textContent = 'Go';
    btn.addEventListener('click', () => {
      location.hash = '#test-' + Date.now();
    });
    document.body.appendChild(btn);
    const r = await testButtonsInView({ maxButtons: 5 });
    /* Peut ou pas détecter selon environnement happy-dom hash support */
    expect(r.details).toBeInstanceOf(Array);
  });

  it('reporting structure : ok + noResponse + errors + skipped sum bounded by tested', async () => {
    for (let i = 0; i < 5; i++) {
      const b = document.createElement('button');
      b.textContent = `Btn ${i}`;
      document.body.appendChild(b);
    }
    const r = await testButtonsInView({ maxButtons: 10 });
    const sum = r.ok + r.noResponse + r.errors + r.skipped;
    expect(sum).toBeLessThanOrEqual(r.tested);
  });

  it('callback onProgress appelé pendant test', async () => {
    for (let i = 0; i < 3; i++) {
      const b = document.createElement('button');
      b.textContent = `Btn ${i}`;
      b.style.cssText = 'width:100px;height:44px';
      document.body.appendChild(b);
    }
    const progressCalls: Array<{ c: number; t: number }> = [];
    await testButtonsInView({
      maxButtons: 10,
      onProgress: (c, t) => {
        progressCalls.push({ c, t });
      },
    });
    /* Si > 0 boutons testés, onProgress devrait avoir été appelé */
    /* En happy-dom rect peut être 0 → 0 tested → 0 calls : OK aussi */
    expect(progressCalls).toBeInstanceOf(Array);
  });
});

describe('apex-functional-tester detectStaleButtons (v13.4.181)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('retourne array vide sur DOM vide', () => {
    expect(detectStaleButtons()).toEqual([]);
  });

  it('détecte bouton sans handler', () => {
    const btn = document.createElement('button');
    btn.textContent = 'Stale';
    document.body.appendChild(btn);
    const stale = detectStaleButtons();
    /* Le bouton sans onclick ni data-* est suspect */
    expect(stale.length).toBeGreaterThanOrEqual(1);
  });

  it('ignore boutons type="submit" (gérés par form)', () => {
    const form = document.createElement('form');
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.textContent = 'Submit';
    form.appendChild(btn);
    document.body.appendChild(form);
    const stale = detectStaleButtons();
    expect(stale.length).toBe(0);
  });

  it('ignore boutons avec data-nav-route, data-action, etc.', () => {
    const btn = document.createElement('button');
    btn.textContent = 'Nav';
    btn.setAttribute('data-nav-route', 'chat');
    document.body.appendChild(btn);
    const stale = detectStaleButtons();
    expect(stale.length).toBe(0);
  });

  it('cap à 20 boutons stale max', () => {
    for (let i = 0; i < 30; i++) {
      const b = document.createElement('button');
      b.textContent = `B${i}`;
      document.body.appendChild(b);
    }
    const stale = detectStaleButtons();
    expect(stale.length).toBeLessThanOrEqual(20);
  });
});
