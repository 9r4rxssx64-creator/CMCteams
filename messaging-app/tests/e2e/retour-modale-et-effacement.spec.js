// E2E navigateur RÉEL — deux points levés par le second avis indépendant (Qodo, PR #3890, 17/09/2026).
//
// 1. Historique des modales : fermer une modale par son bouton ✕ doit AUSSI retirer l'entrée
//    d'historique posée à l'ouverture. Sinon le geste Retour suivant « ne fait rien » (il consomme
//    une entrée morte) et la modale suivante ne crée plus la sienne (state.modal encore vrai).
// 2. Suppression de compte : les bases IndexedDB locales doivent être RÉELLEMENT supprimées
//    (connexion fermée, suppression attendue) avant le rechargement, pas seulement « lancées ».
//
// Prouvé discriminant : avec l'ancien _closeModal (innerHTML='' seul) → `stateAfterClose` reste
// vrai et `pushed2` est faux (2 échecs) ; avec l'ancien deleteDatabase non attendu → la base est
// encore listée au retour de la fonction.
import { test, expect } from '@playwright/test';

test.describe('Apex Chat — retour arrière et effacement local (navigateur réel)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForFunction(() => window.K && window.K._showModal && window.K._closeModal, { timeout: 15000 });
  });

  test('fermer une modale au bouton retire son entrée d\'historique ; la suivante en recrée une ; Retour la ferme', async ({ page }) => {
    const r = await page.evaluate(async () => {
      const wait = (ms) => new Promise((res) => setTimeout(res, ms));
      const K = window.K;
      const host = document.querySelector('#modal-host');
      K._showModal('Première', '<p>a</p>');
      await wait(60);                                   // le MutationObserver pousse l'entrée
      const pushed = !!(history.state && history.state.modal);
      document.querySelector('.modal-close').click();   // fermeture par le bouton ✕
      await wait(200);                                  // history.back() asynchrone → popstate
      const stateAfterClose = !!(history.state && history.state.modal);
      const hostEmptyAfterClose = !host.innerHTML;
      K._showModal('Seconde', '<p>b</p>');
      await wait(60);
      const pushed2 = !!(history.state && history.state.modal);
      history.back();                                   // le geste Retour du téléphone
      await wait(200);
      const closedByBack = !host.innerHTML;
      const stateAfterBack = !!(history.state && history.state.modal);
      return { pushed, stateAfterClose, hostEmptyAfterClose, pushed2, closedByBack, stateAfterBack, view: K.view };
    });
    expect(r.pushed, 'ouvrir une modale pousse une entrée').toBe(true);
    expect(r.hostEmptyAfterClose, 'le bouton ✕ ferme la modale').toBe(true);
    expect(r.stateAfterClose, 'le bouton ✕ retire aussi l\'entrée d\'historique').toBe(false);
    expect(r.pushed2, 'la modale suivante recrée son entrée').toBe(true);
    expect(r.closedByBack, 'le geste Retour ferme la modale suivante').toBe(true);
    expect(r.stateAfterBack).toBe(false);
  });

  test('suppression de compte : la base IndexedDB locale est réellement supprimée avant le rechargement', async ({ page }) => {
    await page.route('**/api/users/me', (route) => {
      if (route.request().method() === 'DELETE') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, deleted: true }) });
      return route.continue();
    });
    const r = await page.evaluate(async () => {
      const K = window.K;
      // une base ouverte et remplie, comme en usage réel (connexion tenue par l'app)
      await new Promise((res, rej) => { const rq = indexedDB.open('apex_chat_idb', 1); rq.onupgradeneeded = () => { const db = rq.result; if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv'); }; rq.onsuccess = () => { rq.result.close(); res(); }; rq.onerror = () => rej(rq.error); });
      const before = (await indexedDB.databases()).map((d) => d.name);
      K.token = 'tok-test';
      const inp = document.createElement('input'); inp.id = 'del-confirm'; inp.value = 'SUPPRIMER'; document.body.appendChild(inp);
      const origReplace = location.replace.bind(location);
      let reloadAsked = false; try { location.replace = () => { reloadAsked = true; }; } catch (_) {}
      await K._deleteMyAccountGo();
      const after = (await indexedDB.databases()).map((d) => d.name);
      try { location.replace = origReplace; } catch (_) {}
      return { before, after };
    });
    expect(r.before).toContain('apex_chat_idb');
    expect(r.after, 'plus aucune base locale au retour de la fonction').not.toContain('apex_chat_idb');
  });

  // Mesuré le 17/09 (Firebase injoignable) : 3 636 requêtes en 2 min, parce que l'échec de l'envoi
  // repassait par _safeCatch → _logTelemetry → _escalateToApex. Ancien code → ce test compte des
  // centaines de requêtes ; nouveau → au plus 3 (puis pause 5 min).
  test('télémétrie : Firebase injoignable ne déclenche plus une tempête de requêtes', async ({ page }) => {
    let hits = 0;
    await page.route('**/ax_telemetry_in.json', (route) => { hits++; route.abort('connectionrefused'); });
    // 5 erreurs applicatives d'affilée (chacune tentait un envoi ; l'ancien code en relançait sans fin)
    await page.evaluate(async () => { for (let i = 0; i < 5; i++) { window._safeCatch('test-tempete', new Error('boom ' + i)); await new Promise((r) => setTimeout(r, 150)); } });
    await page.waitForTimeout(2500);
    expect(hits, 'requêtes Firebase après 5 erreurs : 3 tentatives puis silence').toBeLessThanOrEqual(3);
    const gate = await page.evaluate(() => ({ paused: window.K._telemetryGate.pausedUntil > Date.now() }));
    expect(gate.paused, 'après 3 échecs consécutifs, pause 5 min').toBe(true);
  });
});
