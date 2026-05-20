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
    <div class="ax-page" style="padding:16px;max-width:600px;margin:0 auto">
      <h1 style="margin:0 0 16px;color:#c9a227">⚡ Workflows</h1>
      <p class="ax-gs-226">Automatise tes tâches récurrentes (IF this THEN that).</p>

      <div class="ax-gs-130">
        <h2 style="margin:0 0 12px;font-size:16px">Workflows actifs</h2>
        <p style="color:var(--ax-text-dim);font-size:14px;margin:0">Aucun workflow configuré pour le moment.</p>
        <button class="ax-btn ax-btn-primary" style="width:100%;margin-top:12px">+ Nouveau workflow</button>
      </div>

      <div class="ax-gs-131">
        <h2 style="margin:0 0 12px;font-size:16px">Templates pré-configurés</h2>
        <div class="ax-gs-251">
          <button class="ax-btn ax-btn-sm" style="text-align:left;padding:12px">📧 Email reçu → notification</button>
          <button class="ax-btn ax-btn-sm" style="text-align:left;padding:12px">📅 Réunion calendrier → préparer doc</button>
          <button class="ax-btn ax-btn-sm" style="text-align:left;padding:12px">🌅 Lever soleil → routine matin</button>
          <button class="ax-btn ax-btn-sm" style="text-align:left;padding:12px">📍 GPS arrivé maison → lumières on</button>
        </div>
      </div>

      <p class="ax-gs-212"><a href="#chat" class="ax-gs-198">← Retour chat</a></p>
    </div>
  `;
  logger.info('feature-workflow', 'rendered');
}
