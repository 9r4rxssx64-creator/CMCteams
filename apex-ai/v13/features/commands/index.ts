/**
 * APEX v13 — Feature Commandes (mémo dédié des commandes slash du chat)
 *
 * Demande Kevin : mémo dédié, dans Apex, de toutes les commandes `/`.
 * Source unique de vérité : SLASH_COMMANDS → la vue est toujours à jour,
 * aucune duplication. Les commandes de navigation sont cliquables.
 */

import { escapeHtml } from '../../core/escape-html.js';
import { router } from '../../core/router.js';
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
    + `${SLASH_COMMANDS.length} commandes. <strong>Tape directement sur une commande pour la lancer.</strong> `
    + `(Tu peux aussi taper <code>/</code> dans le chat.)</p>`;

  for (const cat of CAT_ORDER) {
    const cmds = groups.get(cat);
    if (!cmds || cmds.length === 0) continue;
    html += `<h2 style="font-size:15px;margin:18px 0 8px">${escapeHtml(cat)} `
      + `<span style="color:var(--ax-text-dim);font-weight:400">(${cmds.length})</span></h2>`;
    for (const c of cmds) {
      const usage = c.argsHint ? ` <span style="color:var(--ax-text-dim)">${escapeHtml(c.argsHint)}</span>` : '';
      /* Kevin 2026-06-08 « je clique direct sur une fonction et ça la lance » :
       * route → navigation ; action → prefill du chat + lancement. TOUT cliquable. */
      const clickable = c.route
        ? ` data-cmd-route="${escapeHtml(c.route)}" role="button" tabindex="0"`
        : ` data-cmd-run="${escapeHtml(c.name)}" role="button" tabindex="0"`;
      const cursor = 'cursor:pointer';
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
      /* Navigation via router (location.hash) — store.set('view') ne navigue PAS
       * (le router dispatch sur hashchange). Corrige la nav route + action. */
      const route = el?.closest('[data-cmd-route]')?.getAttribute('data-cmd-route');
      if (route) { router.navigate(route); return; }
      /* Commande d'action : prefill « /cmd » + espace → Kevin complète la
       * cible/args puis envoie lui-même (pas d'auto-submit). */
      const name = el?.closest('[data-cmd-run]')?.getAttribute('data-cmd-run');
      if (name) {
        try { localStorage.setItem('apex_v13_chat_prefill', '/' + name + ' '); } catch { /* ignore */ }
        router.navigate('chat');
      }
    });
  }
}
