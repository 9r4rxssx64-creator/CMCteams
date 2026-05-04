/**
 * APEX v13 — Feature Sentinels (admin only).
 * Liste sentinelles 24/7 actives + status + last result.
 */

import { logger } from '../../core/logger.js';

export async function render(rootEl: HTMLElement): Promise<void> {
  const { sentinels } = await import('../../services/sentinels.js');
  const list = sentinels.list();
  rootEl.innerHTML = `
    <div class="ax-page" style="padding:16px;max-width:800px;margin:0 auto">
      <h1 style="margin:0 0 16px;color:#c9a227">🛡 Sentinelles 24/7</h1>
      <p style="color:var(--ax-text-dim);margin:0 0 16px">${list.length} watchers actifs</p>
      <div style="display:grid;gap:8px">
        ${list.map((s) => `
          <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.2);border-radius:8px;padding:12px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <strong style="color:#c9a227">${s.name}</strong>
              <p style="margin:4px 0 0;font-size:12px;color:var(--ax-text-dim)">interval: ${s.intervalMs}ms · last: ${s.lastResult ? (s.lastResult.ok ? '✅' : '⚠️') + ' ' + (s.lastResult.msg ?? '') : 'jamais'}</p>
            </div>
            <span style="font-size:11px;padding:4px 8px;border-radius:6px;background:${s.lastResult?.ok ? 'rgba(34,204,119,0.2)' : 'rgba(255,170,0,0.2)'};color:${s.lastResult?.ok ? '#22cc77' : '#ffaa00'}">
              ${s.lastResult ? (s.lastResult.ok ? 'OK' : 'WARN') : 'PENDING'}
            </span>
          </div>
        `).join('')}
      </div>
      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `;
  logger.info('feature-sentinels', `rendered ${list.length} sentinels`);
}
