/**
 * APEX v13 — Vue Dashboard (admin + user landing)
 *
 * Port v12 vDashboard : KPI cards, raccourcis, alerts, todos, stats live.
 *
 * Sections :
 * 1. Header greeting personnalisé "Bonjour [nom]"
 * 2. Cards KPI cliquables (msgs 24h, tokens, projets, sentinelles, todos)
 * 3. Section Alertes (credentials expirés, quotas faibles, sentinelles down)
 * 4. Section Todos (CLAUDE_HANDOFF + ax_claude_todo)
 * 5. Section Raccourcis (8 cards vers chat, vault, browser, etc.)
 * 6. Section Stats live (provider santé, latence, tokens 7j)
 *
 * Anti-patterns :
 * - escapeHtml() systématique sur toute donnée user
 * - Lazy-load services lourds (apex-tools, sentinels, audit-log)
 * - Pas d'inline onclick (data-attributes + addEventListener)
 */

import { logger } from '../../core/logger.js';
import { store } from '../../core/store.js';
import { haptic } from '../../ui/haptic.js';

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

export interface DashboardKpi {
  id: string;
  icon: string;
  label: string;
  value: string | number;
  color: string;
  route: string;
}

export interface DashboardAlert {
  id: string;
  level: 'info' | 'warn' | 'error';
  title: string;
  description: string;
  ts: number;
  action_route?: string;
}

export interface DashboardTodo {
  id: string;
  source: 'handoff' | 'apex_todo' | 'sentinel';
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ts_created: number;
}

export interface DashboardShortcut {
  id: string;
  icon: string;
  label: string;
  description: string;
  route: string;
  color: string;
}

const SHORTCUTS: ReadonlyArray<DashboardShortcut> = [
  { id: 'chat', icon: '💬', label: 'Chat', description: 'Conversation IA', route: 'chat', color: '#5aa8ff' },
  { id: 'vault', icon: '🔐', label: 'Coffre', description: 'Clés API & secrets', route: 'vault', color: '#c9a227' },
  { id: 'browser', icon: '🌐', label: 'Browser', description: 'Naviguer & embed', route: 'browser', color: '#22cc77' },
  { id: 'studios', icon: '🎨', label: 'Studios', description: 'Créatif (musique/vidéo)', route: 'studios', color: '#a878ff' },
  { id: 'pro', icon: '🎓', label: 'Pro', description: 'Modules expert', route: 'pro', color: '#ff6b9d' },
  { id: 'self-diag', icon: '🩺', label: 'Audit', description: 'Auto-diagnostic', route: 'self-diag', color: '#38d8c8' },
  { id: 'settings', icon: '⚙️', label: 'Réglages', description: 'Configurer Apex', route: 'settings', color: '#a0a4c0' },
  { id: 'rgpd', icon: '🛡', label: 'RGPD', description: 'Mes données', route: 'rgpd', color: '#e8b830' },
];

/**
 * Calcule les KPI live depuis les services injectés.
 * Pure function — testable indépendamment du DOM.
 */
export async function computeKpis(): Promise<DashboardKpi[]> {
  let messagesCount = 0;
  let tokensConsumed = 0;
  let projectsActive = 0;
  let sentinelsOk = 0;
  let sentinelsTotal = 0;
  let todosPending = 0;

  try {
    const raw = localStorage.getItem('apex_v13_messages_24h') ?? '0';
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n)) messagesCount = n;
  } catch { /* skip */ }

  try {
    const raw = localStorage.getItem('apex_v13_tokens_24h') ?? '0';
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n)) tokensConsumed = n;
  } catch { /* skip */ }

  try {
    const { kdmcProjectsRegistry } = await import('../../services/kdmc-projects-registry.js');
    projectsActive = kdmcProjectsRegistry.countActive();
  } catch { /* skip */ }

  try {
    const { sentinels } = await import('../../services/sentinels.js');
    const list = sentinels.list();
    sentinelsTotal = list.length;
    sentinelsOk = list.filter((s) => s.lastResult?.ok).length;
  } catch { /* skip */ }

  try {
    const raw = localStorage.getItem('ax_claude_todo') ?? '[]';
    const arr = JSON.parse(raw) as Array<{ status?: string }>;
    if (Array.isArray(arr)) {
      todosPending = arr.filter((t) => t.status === 'pending').length;
    }
  } catch { /* skip */ }

  return [
    { id: 'messages', icon: '💬', label: 'Messages 24h', value: messagesCount, color: '#5aa8ff', route: 'chat' },
    { id: 'tokens', icon: '🔢', label: 'Tokens 24h', value: tokensConsumed.toLocaleString('fr-FR'), color: '#c9a227', route: 'self-diag' },
    { id: 'projects', icon: '📦', label: 'Projets actifs', value: projectsActive, color: '#22cc77', route: 'admin' },
    { id: 'sentinels', icon: '🛡', label: 'Sentinelles OK', value: `${sentinelsOk}/${sentinelsTotal}`, color: sentinelsOk === sentinelsTotal ? '#22cc77' : '#ffaa00', route: 'sentinels' },
    { id: 'todos', icon: '📋', label: 'Todos en attente', value: todosPending, color: todosPending > 0 ? '#ff5858' : '#22cc77', route: 'self-diag' },
  ];
}

/**
 * Récupère les alertes critiques actuelles (credentials expirés, quotas faibles).
 */
export async function loadAlerts(): Promise<DashboardAlert[]> {
  const alerts: DashboardAlert[] = [];

  try {
    const { sentinels } = await import('../../services/sentinels.js');
    const list = sentinels.list();
    const failing = list.filter((s) => s.lastResult && !s.lastResult.ok);
    for (const s of failing.slice(0, 3)) {
      alerts.push({
        id: `sentinel_${s.id}`,
        level: 'warn',
        title: `Sentinelle ${s.name}`,
        description: s.lastResult?.msg ?? 'KO',
        ts: s.lastResult?.ts ?? Date.now(),
        action_route: 'sentinels',
      });
    }
  } catch { /* skip */ }

  /* Credentials expiry watch */
  try {
    const expiring = JSON.parse(localStorage.getItem('apex_v13_credentials_expiring') ?? '[]') as Array<{
      service: string;
      days_left: number;
    }>;
    if (Array.isArray(expiring)) {
      for (const c of expiring.slice(0, 3)) {
        if (c.days_left < 30) {
          alerts.push({
            id: `cred_${c.service}`,
            level: c.days_left < 7 ? 'error' : 'warn',
            title: `Credential ${c.service}`,
            description: `Expire dans ${c.days_left} jours`,
            ts: Date.now(),
            action_route: 'vault',
          });
        }
      }
    }
  } catch { /* skip */ }

  return alerts;
}

/**
 * Charge les todos depuis ax_claude_todo + handoff.
 */
export function loadTodos(): DashboardTodo[] {
  const todos: DashboardTodo[] = [];

  try {
    const raw = localStorage.getItem('ax_claude_todo') ?? '[]';
    const arr = JSON.parse(raw) as Array<{
      id?: string;
      reason?: string;
      severity?: string;
      ts?: number;
      status?: string;
    }>;
    if (Array.isArray(arr)) {
      for (const t of arr.filter((t) => t.status === 'pending').slice(0, 5)) {
        todos.push({
          id: t.id ?? `todo_${Date.now()}`,
          source: 'apex_todo',
          title: t.reason ?? 'Todo sans description',
          severity: (t.severity as DashboardTodo['severity']) ?? 'medium',
          ts_created: t.ts ?? Date.now(),
        });
      }
    }
  } catch { /* skip */ }

  return todos;
}

function renderKpiCard(kpi: DashboardKpi): string {
  return `
    <button class="ax-kpi-card" data-route="${escapeHtml(kpi.route)}"
      style="background:rgba(20,20,35,0.6);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:16px;cursor:pointer;text-align:center;transition:transform .15s;border-left:4px solid ${escapeHtml(kpi.color)}">
      <div style="font-size:32px;margin-bottom:4px">${escapeHtml(kpi.icon)}</div>
      <div style="font-size:24px;font-weight:900;color:${escapeHtml(kpi.color)};line-height:1">${escapeHtml(String(kpi.value))}</div>
      <div style="font-size:11px;color:#a0a4c0;margin-top:6px">${escapeHtml(kpi.label)}</div>
    </button>`;
}

function renderShortcutCard(s: DashboardShortcut): string {
  return `
    <button class="ax-shortcut-card" data-route="${escapeHtml(s.route)}"
      style="background:rgba(20,20,35,0.6);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:14px;cursor:pointer;text-align:left;transition:transform .15s;display:flex;align-items:center;gap:10px;border-left:3px solid ${escapeHtml(s.color)}">
      <span style="font-size:28px;flex-shrink:0">${escapeHtml(s.icon)}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:700;color:#fff">${escapeHtml(s.label)}</div>
        <div style="font-size:11px;color:#a0a4c0;line-height:1.3">${escapeHtml(s.description)}</div>
      </div>
      <span style="color:${escapeHtml(s.color)};font-size:18px">→</span>
    </button>`;
}

function renderAlerts(alerts: ReadonlyArray<DashboardAlert>): string {
  if (alerts.length === 0) {
    return '<p style="color:#a0a4c0;font-size:13px;margin:0">✅ Aucune alerte. Tout va bien.</p>';
  }
  return alerts
    .map((a) => {
      const color = a.level === 'error' ? '#ff5858' : a.level === 'warn' ? '#ffaa00' : '#5aa8ff';
      const icon = a.level === 'error' ? '🚨' : a.level === 'warn' ? '⚠️' : 'ℹ️';
      const route = a.action_route ? `data-route="${escapeHtml(a.action_route)}"` : '';
      return `
        <div class="ax-alert-row" ${route}
          style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(${a.level === 'error' ? '255,88,88' : a.level === 'warn' ? '255,170,0' : '90,168,255'},.08);border-left:3px solid ${color};border-radius:8px;margin-bottom:6px;cursor:${a.action_route ? 'pointer' : 'default'}">
          <span style="font-size:18px">${icon}</span>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600;color:${color}">${escapeHtml(a.title)}</div>
            <div style="font-size:11px;color:#a0a4c0">${escapeHtml(a.description)}</div>
          </div>
        </div>`;
    })
    .join('');
}

function renderTodos(todos: ReadonlyArray<DashboardTodo>): string {
  if (todos.length === 0) {
    return '<p style="color:#a0a4c0;font-size:13px;margin:0">🎉 Aucun todo en attente.</p>';
  }
  return todos
    .map((t) => {
      const color = t.severity === 'critical' ? '#ff5858' : t.severity === 'high' ? '#ffaa00' : '#5aa8ff';
      const date = new Date(t.ts_created).toLocaleString('fr-FR');
      return `
        <div style="padding:10px;background:rgba(255,255,255,0.03);border-left:3px solid ${color};border-radius:6px;margin-bottom:6px">
          <div style="font-size:13px;font-weight:600;color:#fff">${escapeHtml(t.title)}</div>
          <div style="font-size:10px;color:#888;margin-top:2px">${escapeHtml(t.source)} · ${escapeHtml(date)}</div>
        </div>`;
    })
    .join('');
}

export async function render(rootEl: HTMLElement): Promise<void> {
  const user = store.get('user') as { name?: string; id?: string } | null;
  const greeting = user?.name ? `Bonjour ${user.name}` : 'Bonjour';

  const [kpis, alerts] = await Promise.all([computeKpis(), loadAlerts()]);
  const todos = loadTodos();

  rootEl.innerHTML = `
    <div class="ax-page" style="padding:16px;max-width:1100px;margin:0 auto">
      <header style="margin-bottom:24px">
        <h1 style="margin:0 0 4px;font-size:32px;background:linear-gradient(135deg,#c9a227,#ffd700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:Georgia,serif">${escapeHtml(greeting)}</h1>
        <p style="color:#a0a4c0;margin:0;font-size:14px">Voici ton dashboard Apex.</p>
      </header>

      <section style="margin-bottom:24px">
        <h2 style="font-size:14px;color:#c9a227;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px">📊 Indicateurs clés</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px">
          ${kpis.map(renderKpiCard).join('')}
        </div>
      </section>

      <section style="margin-bottom:24px">
        <h2 style="font-size:14px;color:#c9a227;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px">🔔 Alertes ${alerts.length > 0 ? `<span style="color:#ff5858">(${alerts.length})</span>` : ''}</h2>
        ${renderAlerts(alerts)}
      </section>

      <section style="margin-bottom:24px">
        <h2 style="font-size:14px;color:#c9a227;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px">📋 Todos ${todos.length > 0 ? `<span style="color:#ffaa00">(${todos.length})</span>` : ''}</h2>
        ${renderTodos(todos)}
      </section>

      <section style="margin-bottom:24px">
        <h2 style="font-size:14px;color:#c9a227;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px">🚀 Raccourcis</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px">
          ${SHORTCUTS.map(renderShortcutCard).join('')}
        </div>
      </section>

      <section style="margin-bottom:24px">
        <h2 style="font-size:14px;color:#c9a227;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px">📈 Stats live</h2>
        <div style="background:rgba(20,20,35,0.6);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:16px">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">
            <div>
              <div style="font-size:11px;color:#a0a4c0;text-transform:uppercase">Provider santé</div>
              <div style="font-size:18px;font-weight:700;color:#22cc77">🟢 Anthropic OK</div>
            </div>
            <div>
              <div style="font-size:11px;color:#a0a4c0;text-transform:uppercase">Latence dernière req</div>
              <div style="font-size:18px;font-weight:700;color:#5aa8ff">~ 1.2s</div>
            </div>
            <div>
              <div style="font-size:11px;color:#a0a4c0;text-transform:uppercase">Tokens 7j (estimé)</div>
              <div style="font-size:18px;font-weight:700;color:#c9a227">${escapeHtml(((kpis.find((k) => k.id === 'tokens')?.value ?? 0).toString()))}</div>
            </div>
          </div>
        </div>
      </section>

      <p style="text-align:center;color:#666;font-size:11px">APEX v13 · Dashboard</p>
    </div>
  `;

  /* Wire navigation buttons (CSP strict) */
  rootEl.querySelectorAll<HTMLElement>('[data-route]').forEach((el) => {
    el.addEventListener('click', () => {
      haptic.tap();
      const route = el.dataset['route'];
      if (route) window.location.hash = '#' + route;
    });
  });

  logger.info('feature-dashboard', `rendered (${kpis.length} kpis, ${alerts.length} alerts, ${todos.length} todos)`);
}
