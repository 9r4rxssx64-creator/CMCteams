/**
 * APEX v13 — Feature Commandes (mémo dédié des commandes slash du chat)
 *
 * Demande Kevin : mémo dédié, dans Apex, de toutes les commandes `/`.
 * Source unique de vérité : SLASH_COMMANDS → la vue est toujours à jour,
 * aucune duplication. Les commandes de navigation sont cliquables.
 */

import { escapeHtml } from '../../core/escape-html.js';
import { store } from '../../core/store.js';
import { SLASH_COMMANDS, type SlashCommand } from '../../services/admin/slash-commands.js';

/** Catégorie d'affichage dérivée (pas de champ data → 0 duplication). */
function categoryOf(c: SlashCommand): string {
  if (c.route && c.route.startsWith('studio-')) return '🎨 Studios créatifs';
  if (c.route) return '🧭 Navigation';
  if (['ultrareview', 'diag', 'test'].includes(c.name)) return '🔍 Audit & diagnostic';
  if (['plan', 'ooda', 'loop', 'autonomous', 'resume'].includes(c.name)) return '🤖 Autonomie & planification';
  return '💬 Chat & conversation';
}

const CAT_ORDER = [
  '💬 Chat & conversation',
  '🔍 Audit & diagnostic',
  '🤖 Autonomie & planification',
  '🧭 Navigation',
  '🎨 Studios créatifs',
];

export function render(rootEl: HTMLElement): void {
  const groups = new Map<string, SlashCommand[]>();
  for (const c of SLASH_COMMANDS) {
    const cat = categoryOf(c);
    const arr = groups.get(cat) ?? [];
    arr.push(c);
    groups.set(cat, arr);
  }

  let html = '<div style="max-width:720px;margin:0 auto;padding:16px">'
    + '<h1 style="color:var(--ax-gold);font-size:22px;margin:0 0 4px">📒 Commandes Apex</h1>'
    + `<p style="color:var(--ax-text-dim);font-size:13px;margin:0 0 18px">`
    + `${SLASH_COMMANDS.length} commandes. Tape <code>/</code> dans le chat pour les utiliser. `
    + `Les commandes 🧭/🎨 sont cliquables ici.</p>`;

  for (const cat of CAT_ORDER) {
    const cmds = groups.get(cat);
    if (!cmds || cmds.length === 0) continue;
    html += `<h2 style="font-size:15px;margin:18px 0 8px">${escapeHtml(cat)} `
      + `<span style="color:var(--ax-text-dim);font-weight:400">(${cmds.length})</span></h2>`;
    for (const c of cmds) {
      const usage = c.argsHint ? ` <span style="color:var(--ax-text-dim)">${escapeHtml(c.argsHint)}</span>` : '';
      const clickable = c.route ? ` data-cmd-route="${escapeHtml(c.route)}" role="button" tabindex="0"` : '';
      const cursor = c.route ? 'cursor:pointer' : '';
      html += `<div${clickable} style="display:flex;gap:8px;align-items:baseline;`
        + `padding:8px 10px;margin-bottom:4px;background:rgba(255,255,255,0.03);`
        + `border-radius:8px;min-height:40px;${cursor}">`
        + `<span style="font-size:15px">${c.emoji}</span>`
        + `<div style="flex:1;min-width:0">`
        + `<code style="color:var(--ax-gold);font-size:13px">/${escapeHtml(c.name)}</code>${usage}`
        + `<div style="color:var(--ax-text-dim);font-size:12px;margin-top:2px">${escapeHtml(c.description)}</div>`
        + '</div></div>';
    }
  }
  html += '</div>';
  rootEl.innerHTML = html;

  /* Navigation au clic pour les commandes à route. Listener délégué unique
   * (garde dataset → idempotent même si render() est rappelé sur le même nœud). */
  if (!rootEl.dataset['cmdMemoBound']) {
    rootEl.dataset['cmdMemoBound'] = '1';
    rootEl.addEventListener('click', (e) => {
      const el = e.target as HTMLElement | null;
      const row = el?.closest('[data-cmd-route]');
      const route = row?.getAttribute('data-cmd-route');
      if (route) store.set('view', route);
    });
  }
}
