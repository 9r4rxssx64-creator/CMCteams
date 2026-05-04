/**
 * APEX v13 — Feature Sentinels (admin only).
 * Liste sentinelles 24/7 actives + status + last result + auto-run buttons.
 * Boost MAX (2026-05-04) : utilise sentinels-registry typé + métriques perf affichées.
 */

import { logger } from '../../core/logger.js';

export async function render(rootEl: HTMLElement): Promise<void> {
  const { sentinels } = await import('../../services/sentinels.js');
  const { sentinelsRegistry, bootstrapSentinelsRegistry } = await import('../../services/sentinels-registry.js');
  /* Idempotent — booste vers 18+ sentinelles si pas déjà fait */
  bootstrapSentinelsRegistry();
  const list = sentinels.list();
  const status = sentinelsRegistry.getStatus();
  const metrics = sentinelsRegistry.getMetrics();
  const okCount = list.filter((s) => s.lastResult?.ok).length;
  const warnCount = list.filter((s) => s.lastResult && !s.lastResult.ok).length;
  const pendingCount = list.filter((s) => !s.lastResult).length;

  rootEl.innerHTML = `
    <div class="ax-page" style="padding:16px;max-width:900px;margin:0 auto">
      <h1 style="margin:0 0 8px;color:#c9a227">🛡 Sentinelles 24/7</h1>
      <p style="color:var(--ax-text-dim);margin:0 0 12px;font-size:14px">
        ${list.length} watchers (${status.running} active) ·
        <span style="color:#22cc77">✅ ${okCount} OK</span> ·
        <span style="color:#ffaa00">⚠️ ${warnCount} WARN</span> ·
        <span style="color:#888">⏳ ${pendingCount} PENDING</span>
      </p>
      <p style="color:var(--ax-text-dim);margin:0 0 12px;font-size:12px">
        📊 Métriques : ${metrics.totalRuns} runs · avg ${metrics.avgDurationMs}ms · auto-fix ${metrics.totalAutoFixSuccess}✅ / ${metrics.totalAutoFixFailures}❌
      </p>

      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
        <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-sent-run-all">▶️ Run all maintenant</button>
        <button class="ax-btn ax-btn-secondary ax-btn-sm" id="ax-sent-refresh">🔄 Rafraîchir</button>
      </div>

      <table style="width:100%;border-collapse:collapse;background:rgba(20,20,35,0.5);border-radius:12px;overflow:hidden">
        <thead>
          <tr style="background:rgba(201,162,39,0.1)">
            <th style="padding:10px;text-align:left;font-size:12px;color:#c9a227;border-bottom:1px solid rgba(201,162,39,0.3)">Sentinel</th>
            <th style="padding:10px;text-align:left;font-size:12px;color:#c9a227;border-bottom:1px solid rgba(201,162,39,0.3)">Interval</th>
            <th style="padding:10px;text-align:left;font-size:12px;color:#c9a227;border-bottom:1px solid rgba(201,162,39,0.3)">Last result</th>
            <th style="padding:10px;text-align:right;font-size:12px;color:#c9a227;border-bottom:1px solid rgba(201,162,39,0.3)">Action</th>
          </tr>
        </thead>
        <tbody>
          ${list.map((s) => {
            const intervalLabel = s.intervalMs >= 3600000 ? `${Math.round(s.intervalMs / 3600000)}h`
              : s.intervalMs >= 60000 ? `${Math.round(s.intervalMs / 60000)}min`
              : `${Math.round(s.intervalMs / 1000)}s`;
            const status = s.lastResult ? (s.lastResult.ok ? '✅' : '⚠️') : '⏳';
            const msg = s.lastResult?.msg ?? 'Pas encore exécuté';
            const ageMin = s.lastResult ? Math.round((Date.now() - s.lastResult.ts) / 60000) : null;
            return `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                <td style="padding:10px;font-size:13px">
                  <strong>${escapeHtml(s.name)}</strong>
                  <div style="font-size:11px;color:var(--ax-text-dim)">${escapeHtml(s.desc)}</div>
                </td>
                <td style="padding:10px;font-size:12px;color:var(--ax-text-dim)">${intervalLabel}</td>
                <td style="padding:10px;font-size:12px">
                  ${status} <span style="color:${s.lastResult?.ok ? '#22cc77' : s.lastResult ? '#ffaa00' : '#888'}">${escapeHtml(msg.slice(0, 60))}</span>
                  ${ageMin !== null ? `<div style="font-size:10px;color:#888">il y a ${ageMin}min</div>` : ''}
                </td>
                <td style="padding:10px;text-align:right">
                  <button class="ax-btn ax-btn-sm ax-sent-run" data-sent-id="${s.id}" style="padding:4px 10px;font-size:11px">▶️</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `;

  /* Wire run all */
  rootEl.querySelector<HTMLButtonElement>('#ax-sent-run-all')?.addEventListener('click', () => {
    void (async () => {
      const { toast } = await import('../../ui/toast.js');
      toast.info(`Exécution de ${list.length} sentinelles...`);
      await Promise.all(list.map((s) => sentinels.runOne(s.id)));
      toast.success('✅ Tous les sentinelles re-exécutés');
      await render(rootEl); /* Refresh */
    })();
  });

  /* Wire refresh */
  rootEl.querySelector<HTMLButtonElement>('#ax-sent-refresh')?.addEventListener('click', () => {
    void render(rootEl);
  });

  /* Wire run individual */
  rootEl.querySelectorAll<HTMLButtonElement>('.ax-sent-run').forEach((btn) => {
    btn.addEventListener('click', () => {
      void (async () => {
        const id = btn.dataset['sentId'];
        if (!id) return;
        const { toast } = await import('../../ui/toast.js');
        const r = await sentinels.runOne(id);
        toast[r?.ok ? 'success' : 'warn'](`${id}: ${r?.msg ?? 'KO'}`);
        await render(rootEl);
      })();
    });
  });

  logger.info('feature-sentinels', `rendered ${list.length} sentinels (${okCount}OK / ${warnCount}WARN)`);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}
