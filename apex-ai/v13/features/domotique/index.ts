/**
 * APEX v13 — Feature Domotique (Home Assistant + objets connectés).
 * Stub Sprint 2 — sera enrichi avec WebBLE + NFC + IR/RF universal remote.
 */

import { logger } from '../../core/logger.js';

export function render(rootEl: HTMLElement): void {
  rootEl.innerHTML = `
    <div class="ax-page" style="padding:16px;max-width:600px;margin:0 auto">
      <h1 style="margin:0 0 16px;color:#c9a227">🏠 Domotique</h1>
      <p style="color:var(--ax-text-dim)">Pilote tes objets connectés depuis Apex.</p>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px">
        <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:32px">💡</div>
          <strong style="display:block;margin-top:8px">Lumières</strong>
          <button class="ax-btn ax-btn-sm" style="margin-top:8px;width:100%">Configurer</button>
        </div>
        <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:32px">🌡️</div>
          <strong style="display:block;margin-top:8px">Thermostat</strong>
          <button class="ax-btn ax-btn-sm" style="margin-top:8px;width:100%">Configurer</button>
        </div>
        <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:32px">📺</div>
          <strong style="display:block;margin-top:8px">TV</strong>
          <button class="ax-btn ax-btn-sm" style="margin-top:8px;width:100%">Télécommande</button>
        </div>
        <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:32px">🔒</div>
          <strong style="display:block;margin-top:8px">Sécurité</strong>
          <button class="ax-btn ax-btn-sm" style="margin-top:8px;width:100%">Caméras</button>
        </div>
      </div>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `;
  logger.info('feature-domotique', 'rendered');
}
