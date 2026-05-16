/**
 * APEX v13.4.182 — Vue admin "📊 Apex Audits Live" (Kevin "Rapport historique
 * auto dans admin").
 *
 * Affiche l'historique persistant des audits Apex :
 * - Layout scans (overflow horizontal, boutons cachés, touch targets <44px)
 * - Functional tests (boutons OK/no_response/errors + auto-fix appliqués)
 *
 * Source : services/apex-reports-history.ts (localStorage cap 50/type).
 * Auto-persist : startAutoMonitor() chaque 30s persist SI bug détecté +
 *                bouton Settings persist toujours.
 */

import { store } from '../../../core/store.js';
import {
  type FunctionalHistoryEntry,
  type LayoutHistoryEntry,
  reportsHistory,
} from '../../../services/apex-reports-history.js';

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );
}

function formatTs(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function renderLayoutEntry(e: LayoutHistoryEntry): string {
  const okEmoji = !e.hasHorizontalOverflow && e.hiddenButtonsCount === 0 ? '✅' : '⚠️';
  const hiddenList = e.topHiddenButtons.length
    ? `<ul style="margin:4px 0 0 18px;padding:0;font-size:11px;color:#ffaa66">${e.topHiddenButtons
        .map((b) => `<li>"${escapeHtml(b.label)}" → ${escapeHtml(b.reason)}</li>`)
        .join('')}</ul>`
    : '';
  const overflowList = e.topOverflows.length
    ? `<ul style="margin:4px 0 0 18px;padding:0;font-size:11px;color:#ff5b5b">${e.topOverflows
        .map((o) => `<li>${escapeHtml(o.selector)} (+${o.overflowBy}px)</li>`)
        .join('')}</ul>`
    : '';
  return `
    <div style="background:rgba(180,90,200,0.06);border:1px solid rgba(180,90,200,0.25);border-radius:8px;padding:10px;margin-bottom:8px;font-size:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
        <span><b>${okEmoji} Layout scan</b> · ${escapeHtml(e.view)}</span>
        <span style="color:rgba(255,255,255,0.5);font-size:11px;font-family:monospace">${formatTs(e.ts)} · ${escapeHtml(e.appVer)}</span>
      </div>
      <div style="margin-top:4px;color:rgba(255,255,255,0.85)">
        Overflow horizontal : <b style="color:${e.hasHorizontalOverflow ? '#ff5b5b' : '#22cc77'}">${e.hasHorizontalOverflow ? 'OUI' : 'NON'}</b>
        · Cachés : <b style="color:${e.hiddenButtonsCount ? '#ffaa66' : '#22cc77'}">${e.hiddenButtonsCount}</b>
        · Touch&lt;44px : ${e.smallTouchTargetsCount}
        · Éléments overflow : ${e.overflowingCount}
      </div>
      ${hiddenList}
      ${overflowList}
    </div>
  `;
}

function renderFunctionalEntry(e: FunctionalHistoryEntry): string {
  const pct = Math.round(e.okRate * 100);
  const okEmoji = pct >= 80 ? '✅' : pct >= 50 ? '⚠️' : '❌';
  const bugsList = e.bugSamples.length
    ? `<ul style="margin:4px 0 0 18px;padding:0;font-size:11px;color:#ffaa66">${e.bugSamples
        .map((b) => `<li>"${escapeHtml(b.label)}" → ${escapeHtml(b.status)}</li>`)
        .join('')}</ul>`
    : '';
  const fixesList = e.fixesApplied.length
    ? `<div style="margin-top:4px;color:#c9a227">🔧 Auto-fix : ${e.fixesApplied.map((f) => escapeHtml(f)).join(', ')}${
        e.improvement !== 0 ? ` (+${Math.round(e.improvement * 100)}%)` : ''
      }</div>`
    : '';
  const escalated = e.escalated
    ? '<div style="margin-top:4px;color:#ff5b5b">⚠ Escaladé Claude Code (ax_claude_todo)</div>'
    : '';
  return `
    <div style="background:rgba(106,138,255,0.06);border:1px solid rgba(106,138,255,0.25);border-radius:8px;padding:10px;margin-bottom:8px;font-size:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
        <span><b>${okEmoji} Test fonctionnel</b> · ${escapeHtml(e.view)}</span>
        <span style="color:rgba(255,255,255,0.5);font-size:11px;font-family:monospace">${formatTs(e.ts)} · ${escapeHtml(e.appVer)}</span>
      </div>
      <div style="margin-top:4px;color:rgba(255,255,255,0.85)">
        Testés : <b>${e.tested}</b>/${e.totalButtons}
        · OK : <b style="color:#22cc77">${e.ok} (${pct}%)</b>
        · No-response : <b style="color:#ffaa66">${e.noResponse}</b>
        · Erreurs : <b style="color:#ff5b5b">${e.errors}</b>
        · Skippés : ${e.skipped}
      </div>
      ${fixesList}
      ${escalated}
      ${bugsList}
    </div>
  `;
}

export function render(rootEl: HTMLElement): void {
  const isAdmin = store.get('isAdmin') === true;
  if (!isAdmin) {
    rootEl.innerHTML = `<div style="padding:24px;text-align:center;color:#94a3b8">🔒 Réservé admin Kevin</div>`;
    return;
  }

  const stats = reportsHistory.getStats();
  const layoutHistory = reportsHistory.getLayoutHistory().slice().reverse();
  const functionalHistory = reportsHistory.getFunctionalHistory().slice().reverse();

  const lastLayout = stats.lastLayoutTs ? formatTs(stats.lastLayoutTs) : 'jamais';
  const lastFunctional = stats.lastFunctionalTs ? formatTs(stats.lastFunctionalTs) : 'jamais';

  rootEl.innerHTML = `
    <div class="ax-admin ax-page" style="padding:14px;max-width:920px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">
        <h1 style="margin:0;color:#c9a227;font-size:20px">📊 Apex Audits Live</h1>
        <button class="ax-btn" data-nav-route="admin" style="padding:6px 12px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.85);border:1px solid rgba(255,255,255,0.15);border-radius:20px;cursor:pointer;font-size:12px;min-height:36px">← Admin</button>
      </header>

      <section style="background:rgba(15,23,42,0.7);border:1px solid rgba(106,138,255,0.25);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px;font-size:14px;color:#8bb4ff">Vue d'ensemble</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;font-size:12px">
          <div>📐 Layout scans : <b>${stats.layoutCount}</b><br><span style="color:rgba(255,255,255,0.5);font-size:11px">dernier : ${lastLayout}</span></div>
          <div>🧪 Tests fonctionnels : <b>${stats.functionalCount}</b><br><span style="color:rgba(255,255,255,0.5);font-size:11px">dernier : ${lastFunctional}</span></div>
          <div>🐛 Bugs 24h : <b style="color:${stats.recentBugs ? '#ff5b5b' : '#22cc77'}">${stats.recentBugs}</b></div>
          <div>📤 Escaladés Claude Code 24h : <b style="color:${stats.recentEscalations ? '#ffaa66' : '#22cc77'}">${stats.recentEscalations}</b></div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
          <button id="ax-audits-run-functional" class="ax-btn" style="padding:8px 14px;background:rgba(106,138,255,0.15);color:#8bb4ff;border:1px solid rgba(106,138,255,0.35);border-radius:8px;cursor:pointer;font-size:12px;min-height:40px">🧪 Lancer test fonctionnel maintenant</button>
          <button id="ax-audits-run-layout" class="ax-btn" style="padding:8px 14px;background:rgba(180,90,200,0.15);color:#c97aff;border:1px solid rgba(180,90,200,0.35);border-radius:8px;cursor:pointer;font-size:12px;min-height:40px">📐 Scan layout maintenant</button>
          <button id="ax-audits-clear" class="ax-btn" style="padding:8px 14px;background:rgba(255,91,91,0.12);color:#ff5b5b;border:1px solid rgba(255,91,91,0.3);border-radius:8px;cursor:pointer;font-size:12px;min-height:40px">🗑 Vider historique</button>
        </div>
      </section>

      <section style="margin-bottom:16px">
        <h2 style="margin:0 0 10px;font-size:14px;color:#8bb4ff">🧪 Tests fonctionnels (${functionalHistory.length})</h2>
        ${functionalHistory.length === 0 ? '<div style="color:rgba(255,255,255,0.5);font-size:12px;padding:14px;text-align:center">Aucun test fonctionnel encore. Lance via Settings ou bouton ci-dessus.</div>' : functionalHistory.map(renderFunctionalEntry).join('')}
      </section>

      <section>
        <h2 style="margin:0 0 10px;font-size:14px;color:#c97aff">📐 Layout scans (${layoutHistory.length})</h2>
        ${layoutHistory.length === 0 ? '<div style="color:rgba(255,255,255,0.5);font-size:12px;padding:14px;text-align:center">Aucun bug layout détecté. Auto-monitor tourne chaque 30s.</div>' : layoutHistory.map(renderLayoutEntry).join('')}
      </section>
    </div>
  `;

  /* Wire boutons actions */
  rootEl.querySelector<HTMLButtonElement>('#ax-audits-run-functional')?.addEventListener('click', () => {
    void (async () => {
      const btn = rootEl.querySelector<HTMLButtonElement>('#ax-audits-run-functional');
      if (btn) btn.disabled = true;
      try {
        const { apexFunctionalTester } = await import('../../../services/apex-functional-tester.js');
        const out = await apexFunctionalTester.testAndAutoFix({ maxButtons: 30 });
        reportsHistory.recordFunctional(out.before, out.fixes, out.after, out.improvement);
        render(rootEl);
      } catch { /* ignore */ }
      if (btn) btn.disabled = false;
    })();
  });

  rootEl.querySelector<HTMLButtonElement>('#ax-audits-run-layout')?.addEventListener('click', () => {
    void (async () => {
      try {
        const { apexLayoutInspector } = await import('../../../services/apex-layout-inspector.js');
        const r = apexLayoutInspector.scanDom();
        reportsHistory.recordLayout(r);
        render(rootEl);
      } catch { /* ignore */ }
    })();
  });

  rootEl.querySelector<HTMLButtonElement>('#ax-audits-clear')?.addEventListener('click', () => {
    if (confirm('Vider tout l\'historique des audits ?')) {
      reportsHistory.clearHistory();
      render(rootEl);
    }
  });
}
