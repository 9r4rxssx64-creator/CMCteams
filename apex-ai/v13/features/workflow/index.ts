/**
 * APEX v13 — Feature Workflow (automation IFTTT-like).
 * Stub Sprint 2 — sera enrichi avec triggers + actions chain.
 */

import { logger } from '../../core/logger.js';
import { store } from '../../core/store.js';
import { guardFeatureEnabled } from '../../services/auth/feature-guard.js';

export function render(rootEl: HTMLElement): void {
  /* Wire admin feature toggle (Kevin règle 2026-05-04 — ON/OFF tout). */
  const uid = (store.get('user') as { id?: string } | null)?.id ?? 'anon';
  if (!guardFeatureEnabled('module.workflow', rootEl, uid)) return;
  rootEl.innerHTML = `
    <div class="ax-page ax-gs-368">
      <h1 class="ax-gs-369">⚡ Workflows</h1>
      <p class="ax-gs-226">Automatise tes tâches récurrentes (IF this THEN that).</p>

      <div class="ax-gs-130">
        <h2 class="ax-gs-370">Workflows actifs</h2>
        <p style="color:var(--ax-text-dim);font-size:14px;margin:0">Aucun workflow configuré pour le moment.</p>
        <button class="ax-btn ax-btn-primary" style="width:100%;margin-top:12px">+ Nouveau workflow</button>
      </div>

      <div class="ax-gs-131">
        <h2 class="ax-gs-370">Templates pré-configurés</h2>
        <div class="ax-gs-251">
          <button class="ax-btn ax-btn-sm ax-gs-487">📧 Email reçu → notification</button>
          <button class="ax-btn ax-btn-sm ax-gs-487">📅 Réunion calendrier → préparer doc</button>
          <button class="ax-btn ax-btn-sm ax-gs-487">🌅 Lever soleil → routine matin</button>
          <button class="ax-btn ax-btn-sm ax-gs-487">📍 GPS arrivé maison → lumières on</button>
        </div>
      </div>

      <p class="ax-gs-212"><a href="#chat" class="ax-gs-198">← Retour chat</a></p>
    </div>
  `;
  logger.info('feature-workflow', 'rendered');
}
