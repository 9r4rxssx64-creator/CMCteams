/**
 * APEX v13.4.2 — Vue admin "Yury Plugins" (Kevin 2026-05-09).
 *
 * 5 plugins applicatifs équivalents Yury.ai TikTok :
 *   1. Security Review     — scan runtime vulnérabilités
 *   2. Code Review 5 Agents — review diff par 5 IA en parallèle
 *   3. Frontend Design     — génère composant UI anti-slop
 *   4. Superpowers         — 7-step methodology (brainstorm → reflect)
 *   5. GStack Roles        — 7 rôles (CEO/Designer/Engineer/QA/Release/Reviewer/Reflector)
 *
 * UX :
 *   - 5 cards (1 par plugin), bouton "Lancer" sur chacune
 *   - Résultat affiché dans modal-sheet (slide-up bottom)
 *   - Guard admin only via store.get('isAdmin')
 *   - escapeHtml partout (CSP strict)
 */

import { escapeHtml } from '../../../core/escape-html.js';
import { createCleanupScope, type CleanupScope } from '../../../core/listener-cleanup.js';
import { logger } from '../../../core/logger.js';
import { router } from '../../../core/router.js';
import { store } from '../../../core/store.js';
import { codeReviewMultiAgent, type ReviewReport } from '../../../services/code-review-multi-agent.js';
import { frontendDesign, type DesignOutput } from '../../../services/frontend-design.js';
import { gstackRoles, type PipelineResult } from '../../../services/gstack-roles.js';
import { securityReview, type ScanReport } from '../../../services/security-review.js';
import { superpowersMethodology, type SuperpowerSession } from '../../../services/superpowers-methodology.js';
import { haptic } from '../../../ui/haptic.js';
import { modalSheet } from '../../../ui/modal-sheet.js';
import { toast } from '../../../ui/toast.js';

let activeScope: CleanupScope | null = null;

export function dispose(): void {
  activeScope?.cleanup();
  activeScope = null;
}

interface PluginCard {
  id: string;
  emoji: string;
  name: string;
  description: string;
  status: 'installed' | 'configurable';
  buttonLabel: string;
}

const PLUGINS: PluginCard[] = [
  {
    id: 'security-review',
    emoji: '🔒',
    name: 'Security Review',
    description: 'Scan runtime exhaustif : secrets en clair, CSP violations, vault drift, audit integrity.',
    status: 'installed',
    buttonLabel: 'Lancer scan',
  },
  {
    id: 'code-review-5-agents',
    emoji: '👥',
    name: 'Code Review 5 Agents',
    description: '5 IA en parallèle (CLAUDE.md compliance / bugs / redondance / git history / patterns).',
    status: 'configurable',
    buttonLabel: 'Reviewer un diff',
  },
  {
    id: 'frontend-design',
    emoji: '🎨',
    name: 'Frontend Design',
    description: 'Génère un composant UI production-grade depuis prompt avec anti-slop strict.',
    status: 'configurable',
    buttonLabel: 'Générer composant',
  },
  {
    id: 'superpowers',
    emoji: '⚡',
    name: 'Superpowers',
    description: '7-step methodology : brainstorm → plan → dev → test → review → ship → reflect.',
    status: 'configurable',
    buttonLabel: 'Démarrer session',
  },
  {
    id: 'gstack-roles',
    emoji: '🏛',
    name: 'GStack Roles',
    description: '7 rôles spécialisés (CEO/Designer/Engineer/QA/Release/Reviewer/Reflector).',
    status: 'configurable',
    buttonLabel: 'Lancer pipeline',
  },
];

function renderCard(plugin: PluginCard): string {
  const statusBadge = plugin.status === 'installed'
    ? '<span style="background:rgba(34,204,119,0.15);color:#22cc77;padding:3px 10px;border-radius:10px;font-size:11px;font-weight:600;letter-spacing:0.02em">✅ Actif</span>'
    : '<span style="background:rgba(232,184,48,0.15);color:#e8b830;padding:3px 10px;border-radius:10px;font-size:11px;font-weight:600;letter-spacing:0.02em">⚙️ Config</span>';

  return `
    <article class="ax-yury-card" data-plugin-id="${escapeHtml(plugin.id)}" style="background:linear-gradient(135deg,rgba(20,20,35,0.85),rgba(14,14,28,0.65));border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:10px;transition:transform 200ms cubic-bezier(0.16,1,0.3,1)">
      <header style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:28px" aria-hidden="true">${escapeHtml(plugin.emoji)}</span>
          <h3 style="margin:0;font-size:16px;color:#fff;font-weight:700;letter-spacing:-0.015em">${escapeHtml(plugin.name)}</h3>
        </div>
        ${statusBadge}
      </header>
      <p style="margin:0;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">${escapeHtml(plugin.description)}</p>
      <button class="ax-btn ax-bounce-tap" data-launch="${escapeHtml(plugin.id)}" aria-label="Lancer ${escapeHtml(plugin.name)}" style="margin-top:6px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;padding:11px 18px;border-radius:22px;font-weight:700;cursor:pointer;font-size:13px;min-height:44px;-webkit-tap-highlight-color:transparent;transition:all 180ms cubic-bezier(0.16,1,0.3,1)">
        ${escapeHtml(plugin.buttonLabel)}
      </button>
    </article>
  `;
}

function renderPage(): string {
  const cards = PLUGINS.map(renderCard).join('');
  return `
    <div class="ax-yury-plugins" style="padding:max(20px, env(safe-area-inset-top)) 16px max(20px, env(safe-area-inset-bottom)) 16px;max-width:1100px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif">
      <header style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.06)">
        <div>
          <h1 style="margin:0;font-size:clamp(22px,5.5vw,30px);font-weight:700;background:linear-gradient(135deg,#c9a227,#e8b830);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:Georgia,serif;letter-spacing:-0.025em;line-height:1.15">🚀 Yury Plugins (équivalents Apex)</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.55);font-size:12px">5 services applicatifs natifs PWA, pas Claude Code</p>
        </div>
        <button class="ax-btn ax-bounce-tap" data-back-admin style="flex-shrink:0;padding:9px 16px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:24px;font-size:13px;font-weight:600;cursor:pointer;min-height:40px;white-space:nowrap" aria-label="Retour Admin">← Admin</button>
      </header>
      <div class="ax-yury-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">
        ${cards}
      </div>
    </div>
  `;
}

async function launchSecurityReview(): Promise<void> {
  toast.info('🔒 Scan en cours...');
  try {
    const report: ScanReport = await securityReview.runFullScan();
    const findings = report.findings.length > 0
      ? report.findings.map((f) => `
        <li style="background:rgba(255,255,255,0.03);padding:10px 12px;border-radius:10px;margin-bottom:6px">
          <strong style="color:${f.severity === 'critical' ? '#ff5566' : f.severity === 'high' ? '#ffaa44' : '#e8b830'}">[${escapeHtml(f.severity)}]</strong>
          <span>${escapeHtml(f.msg)}</span>
          ${f.fix ? `<p style="color:rgba(255,255,255,0.55);font-size:12px;margin:4px 0 0">Fix : ${escapeHtml(f.fix)}</p>` : ''}
        </li>`).join('')
      : '<li style="color:#22cc77">🟢 Aucune vulnérabilité détectée.</li>';
    modalSheet.open({
      title: `🔒 Security Review — Score ${report.score}/100`,
      content: `
        <div style="font-family:system-ui;padding:14px 4px">
          <p style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:14px">
            ${report.passedChecks}/${report.totalChecks} checks passés · ${report.findings.length} findings · ${Math.round(report.durationMs)}ms
          </p>
          <ul style="list-style:none;padding:0;margin:0;max-height:50vh;overflow-y:auto">${findings}</ul>
        </div>
      `,
      actions: [{ label: 'Fermer', variant: 'ghost', onClick: () => modalSheet.closeAll() }],
    });
  } catch (err: unknown) {
    logger.warn('yury-plugins', 'security review failed', { err });
    toast.error('Scan échoué — vérifie les logs');
  }
}

async function launchCodeReview(): Promise<void> {
  const diff = window.prompt('Colle le diff à reviewer (ou laisse vide pour démo) :', '');
  if (diff === null) return;
  toast.info('👥 Lancement des 5 agents...');
  try {
    const report: ReviewReport = await codeReviewMultiAgent.review({
      diff: diff || '+const test = "demo";\n-const old = "removed";',
    });
    const agentsList = report.agents.map((a) => `
      <li style="background:rgba(255,255,255,0.03);padding:10px 12px;border-radius:10px;margin-bottom:6px">
        <strong>[${escapeHtml(a.role)}]</strong> · ${escapeHtml(a.provider)} · confidence ${a.confidence}/100
        <p style="color:rgba(255,255,255,0.55);font-size:12px;margin:4px 0 0">${a.findings.length} finding(s)</p>
      </li>`).join('');
    modalSheet.open({
      title: `👥 Code Review — Score ${report.finalScore}/100`,
      content: `
        <div style="font-family:system-ui;padding:14px 4px">
          <p style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:14px">
            ${report.totalFindings} findings · ${report.criticalFindings} critical · ${Math.round(report.durationMs)}ms
          </p>
          <h3 style="font-size:13px;color:#e8b830;text-transform:uppercase;margin:0 0 8px">Agents</h3>
          <ul style="list-style:none;padding:0;margin:0 0 14px">${agentsList}</ul>
          <h3 style="font-size:13px;color:#e8b830;text-transform:uppercase;margin:0 0 8px">Consensus</h3>
          <pre style="background:rgba(0,0,0,0.4);color:rgba(255,255,255,0.85);padding:12px;border-radius:10px;font-size:12px;white-space:pre-wrap;max-height:30vh;overflow-y:auto">${escapeHtml(report.consensus)}</pre>
        </div>
      `,
      actions: [{ label: 'Fermer', variant: 'ghost', onClick: () => modalSheet.closeAll() }],
    });
  } catch (err: unknown) {
    logger.warn('yury-plugins', 'code review failed', { err });
    toast.error('Review échouée — vérifie clés IA');
  }
}

async function launchFrontendDesign(): Promise<void> {
  const prompt = window.prompt('Décris le composant UI à générer :', 'Bouton CTA premium avec hover doux');
  if (!prompt) return;
  toast.info('🎨 Génération en cours...');
  try {
    const output: DesignOutput = await frontendDesign.generate({ prompt, framework: 'vanilla' });
    const srcdoc = frontendDesign.buildPreviewSrcdoc(output);
    /* Encode srcdoc pour attribut HTML */
    const safeSrcdoc = srcdoc.replace(/"/g, '&quot;').replace(/</g, '&lt;');
    modalSheet.open({
      title: `🎨 Frontend Design — ${output.framework}`,
      content: `
        <div style="font-family:system-ui;padding:14px 4px">
          <p style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:10px">
            Généré en ${Math.round(output.durationMs)}ms · framework ${escapeHtml(output.framework)}
          </p>
          <iframe sandbox="allow-scripts" srcdoc="${safeSrcdoc}" style="width:100%;height:300px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;background:#fff" aria-label="Aperçu du composant généré"></iframe>
          <details style="margin-top:14px">
            <summary style="cursor:pointer;color:#e8b830;font-weight:600">Voir le code</summary>
            <pre style="background:rgba(0,0,0,0.4);color:rgba(255,255,255,0.85);padding:12px;border-radius:10px;font-size:11px;white-space:pre-wrap;max-height:30vh;overflow:auto;margin-top:8px"><strong>HTML:</strong>\n${escapeHtml(output.html)}\n\n<strong>CSS:</strong>\n${escapeHtml(output.css)}\n\n<strong>JS:</strong>\n${escapeHtml(output.js)}</pre>
          </details>
        </div>
      `,
      actions: [{ label: 'Fermer', variant: 'ghost', onClick: () => modalSheet.closeAll() }],
    });
  } catch (err: unknown) {
    logger.warn('yury-plugins', 'frontend design failed', { err });
    toast.error('Génération échouée');
  }
}

async function launchSuperpowers(): Promise<void> {
  const taskName = window.prompt('Nom de la tâche pour la session Superpowers :', 'Refactor auth flow');
  if (!taskName) return;
  const sessionId = superpowersMethodology.start(taskName);
  toast.info(`⚡ Session ${sessionId} démarrée — avancement step 1/7...`);
  try {
    const stepOutput = await superpowersMethodology.advance(sessionId);
    const session: SuperpowerSession | null = superpowersMethodology.getState(sessionId);
    modalSheet.open({
      title: `⚡ Superpowers — ${escapeHtml(taskName)}`,
      content: `
        <div style="font-family:system-ui;padding:14px 4px">
          <p style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:10px">
            Session ${escapeHtml(sessionId)} · step actuel : <strong>${escapeHtml(session?.currentStep ?? '-')}</strong>
          </p>
          <h3 style="font-size:13px;color:#e8b830;text-transform:uppercase;margin:0 0 8px">Output ${escapeHtml(stepOutput?.step ?? '?')}</h3>
          <pre style="background:rgba(0,0,0,0.4);color:rgba(255,255,255,0.85);padding:12px;border-radius:10px;font-size:12px;white-space:pre-wrap;max-height:40vh;overflow-y:auto">${escapeHtml(stepOutput?.output ?? '(pas de sortie)')}</pre>
          <p style="color:rgba(255,255,255,0.55);font-size:12px;margin-top:10px">
            Re-lance la vue pour avancer au step suivant.
          </p>
        </div>
      `,
      actions: [{ label: 'Fermer', variant: 'ghost', onClick: () => modalSheet.closeAll() }],
    });
  } catch (err: unknown) {
    logger.warn('yury-plugins', 'superpowers advance failed', { err });
    toast.error('Step échoué');
  }
}

async function launchGStackRoles(): Promise<void> {
  const task = window.prompt('Tâche pour le pipeline GStack 7 rôles :', 'Implémenter dark mode toggle');
  if (!task) return;
  toast.info('🏛 Pipeline 7 rôles en cours (peut prendre 30-60s)...');
  try {
    const result: PipelineResult = await gstackRoles.runFullPipeline(task);
    const rolesList = result.roles.map((r) => `
      <li style="background:rgba(255,255,255,0.03);padding:10px 12px;border-radius:10px;margin-bottom:6px">
        <strong style="color:${r.ok ? '#22cc77' : '#ff5566'}">[${escapeHtml(r.role)}]</strong>
        ${r.ok ? '✅' : '❌'} · ${Math.round(r.durationMs)}ms
        <p style="color:rgba(255,255,255,0.55);font-size:12px;margin:4px 0 0">${escapeHtml(r.output.slice(0, 200))}...</p>
      </li>`).join('');
    modalSheet.open({
      title: `🏛 GStack Pipeline — ${result.roles.filter((r) => r.ok).length}/7 OK`,
      content: `
        <div style="font-family:system-ui;padding:14px 4px">
          <p style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:14px">
            ${Math.round(result.totalDurationMs / 1000)}s total
          </p>
          <ul style="list-style:none;padding:0;margin:0 0 14px;max-height:50vh;overflow-y:auto">${rolesList}</ul>
        </div>
      `,
      actions: [{ label: 'Fermer', variant: 'ghost', onClick: () => modalSheet.closeAll() }],
    });
  } catch (err: unknown) {
    logger.warn('yury-plugins', 'gstack pipeline failed', { err });
    toast.error('Pipeline échoué');
  }
}

function attachHandlers(rootEl: HTMLElement): void {
  if (!activeScope) return;

  rootEl.querySelectorAll<HTMLButtonElement>('[data-launch]').forEach((btn) => {
    activeScope!.bind(btn, 'click', () => {
      haptic.tap();
      const id = btn.dataset['launch'] ?? '';
      switch (id) {
        case 'security-review': void launchSecurityReview(); break;
        case 'code-review-5-agents': void launchCodeReview(); break;
        case 'frontend-design': void launchFrontendDesign(); break;
        case 'superpowers': void launchSuperpowers(); break;
        case 'gstack-roles': void launchGStackRoles(); break;
        default: toast.warn(`Plugin ${id} non implémenté`);
      }
    });
  });

  const backBtn = rootEl.querySelector<HTMLButtonElement>('[data-back-admin]');
  if (backBtn) {
    activeScope.bind(backBtn, 'click', () => {
      haptic.tap();
      router.navigate('admin');
    });
  }
}

export function render(rootEl: HTMLElement): void {
  /* Cleanup ancien scope avant re-render */
  activeScope?.cleanup();
  activeScope = createCleanupScope('admin-yury-plugins');

  const isAdmin = store.get('isAdmin');
  if (!isAdmin) {
    rootEl.innerHTML = `
      <div class="ax-empty" style="padding:40px 20px;text-align:center;color:rgba(255,255,255,0.6)">
        <h2>Accès réservé</h2>
        <p>Cette section est réservée à l'admin Kevin.</p>
      </div>
    `;
    return;
  }

  rootEl.innerHTML = renderPage();
  attachHandlers(rootEl);
}
