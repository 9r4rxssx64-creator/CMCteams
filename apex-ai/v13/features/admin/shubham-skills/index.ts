/**
 * APEX v13.4.3 — Vue admin "Shubham Skills" (Kevin 2026-05-09).
 *
 * 5 services applicatifs équivalents Shubham Sharma TikTok :
 *   1. HyperFrames        — anim HTML/CSS/JS multi-frames
 *   2. Agent Browser      — analyse URL + actions structurées
 *   3. Marketing Psy      — copy avec triggers Cialdini
 *   4. Impeccable Design  — 23 commandes design fluency
 *   5. iOS Simulator      — preview iPhone wrapped iframe
 *
 * UX :
 *   - 5 cards (1 par skill), bouton "Lancer" avec input prompt
 *   - Résultat affiché dans modal-sheet
 *   - Guard admin only via store.get('isAdmin')
 *   - escapeHtml partout (CSP strict)
 */

import { escapeHtml } from '../../../core/escape-html.js';
import { createCleanupScope, type CleanupScope } from '../../../core/listener-cleanup.js';
import { logger } from '../../../core/logger.js';
import { router } from '../../../core/router.js';
import { store } from '../../../core/store.js';
import { agentBrowser, type AgentBrowserResult } from '../../../services/agent-browser.js';
import { hyperframes, type HyperFrameComposition } from '../../../services/hyperframes.js';
import { impeccableDesign, type ImpeccableResult } from '../../../services/impeccable-design.js';
import { iosSimulator } from '../../../services/ios-simulator.js';
import { marketingPsy, type MarketingOutput, type CialdiniTrigger } from '../../../services/marketing-psy.js';
import { haptic } from '../../../ui/haptic.js';
import { modalSheet } from '../../../ui/modal-sheet.js';
import { toast } from '../../../ui/toast.js';

let activeScope: CleanupScope | null = null;

export function dispose(): void {
  activeScope?.cleanup();
  activeScope = null;
}

interface SkillCard {
  id: string;
  emoji: string;
  name: string;
  description: string;
  buttonLabel: string;
}

const SKILLS: SkillCard[] = [
  {
    id: 'hyperframes',
    emoji: '🎞',
    name: 'HyperFrames',
    description: 'Compose une animation HTML/CSS/JS multi-frames depuis un prompt. Preview dans iframe sandbox.',
    buttonLabel: 'Composer',
  },
  {
    id: 'agent-browser',
    emoji: '🌐',
    name: 'Agent Browser',
    description: 'Analyse une URL + objectif, retourne actions structurées (click/fill/extract).',
    buttonLabel: 'Analyser URL',
  },
  {
    id: 'marketing-psy',
    emoji: '🧠',
    name: 'Marketing Psy',
    description: 'Génère copies marketing avec triggers Cialdini (scarcity/social-proof/authority/...).',
    buttonLabel: 'Générer copy',
  },
  {
    id: 'impeccable-design',
    emoji: '✨',
    name: 'Impeccable Design',
    description: '23 commandes design fluency (make-it-pop / tighten-spacing / improve-typography / ...).',
    buttonLabel: 'Polir un design',
  },
  {
    id: 'ios-simulator',
    emoji: '📱',
    name: 'iOS Simulator',
    description: 'Preview HTML/URL dans frame iPhone 15 Pro simulé (visuel only, pas runtime iOS).',
    buttonLabel: 'Lancer preview',
  },
];

function renderCard(skill: SkillCard): string {
  return `
    <article class="ax-shubham-card" data-skill-id="${escapeHtml(skill.id)}" style="background:linear-gradient(135deg,rgba(20,20,35,0.85),rgba(14,14,28,0.65));border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:10px;transition:transform 200ms cubic-bezier(0.16,1,0.3,1)">
      <header style="display:flex;align-items:center;gap:10px">
        <span style="font-size:28px" aria-hidden="true">${escapeHtml(skill.emoji)}</span>
        <h3 style="margin:0;font-size:16px;color:#fff;font-weight:700;letter-spacing:-0.015em">${escapeHtml(skill.name)}</h3>
      </header>
      <p style="margin:0;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">${escapeHtml(skill.description)}</p>
      <button class="ax-btn ax-bounce-tap" data-launch="${escapeHtml(skill.id)}" aria-label="Lancer ${escapeHtml(skill.name)}" style="margin-top:6px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;padding:11px 18px;border-radius:22px;font-weight:700;cursor:pointer;font-size:13px;min-height:44px;-webkit-tap-highlight-color:transparent;transition:all 180ms cubic-bezier(0.16,1,0.3,1)">
        ${escapeHtml(skill.buttonLabel)}
      </button>
    </article>
  `;
}

function renderPage(): string {
  const cards = SKILLS.map(renderCard).join('');
  return `
    <div class="ax-shubham-skills" style="padding:max(20px, env(safe-area-inset-top)) 16px max(20px, env(safe-area-inset-bottom)) 16px;max-width:1100px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif">
      <header style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.06)">
        <div>
          <h1 style="margin:0;font-size:clamp(22px,5.5vw,30px);font-weight:700;background:linear-gradient(135deg,#c9a227,#e8b830);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:Georgia,serif;letter-spacing:-0.025em;line-height:1.15">🎬 Shubham Skills (équivalents Apex)</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.55);font-size:12px">5 services TikTok IRL — natifs PWA, pas Claude Code</p>
        </div>
        <button class="ax-btn ax-bounce-tap" data-back-admin style="flex-shrink:0;padding:9px 16px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:24px;font-size:13px;font-weight:600;cursor:pointer;min-height:40px;white-space:nowrap" aria-label="Retour Admin">← Admin</button>
      </header>
      <div class="ax-shubham-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">
        ${cards}
      </div>
    </div>
  `;
}

async function launchHyperFrames(): Promise<void> {
  const prompt = window.prompt('Décris l\'animation à composer :', 'Logo APEX qui pulse en doré sur fond noir');
  if (!prompt) return;
  toast.info('🎞 Composition en cours...');
  try {
    const comp: HyperFrameComposition = await hyperframes.compose(prompt);
    const srcdoc = hyperframes.buildPreviewSrcdoc(comp);
    const safeSrcdoc = srcdoc.replace(/"/g, '&quot;').replace(/</g, '&lt;');
    modalSheet.open({
      title: `🎞 HyperFrames — ${comp.frames} frames`,
      content: `
        <div style="font-family:system-ui;padding:14px 4px">
          <p style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:10px">
            ${comp.frames} frames · ${Math.round(comp.duration)}ms · généré en ${comp.durationMs}ms
          </p>
          <iframe sandbox="allow-scripts" srcdoc="${safeSrcdoc}" style="width:100%;height:300px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;background:#0e0e1c" aria-label="Aperçu animation"></iframe>
        </div>
      `,
      actions: [{ label: 'Fermer', variant: 'ghost', onClick: () => modalSheet.closeAll() }],
    });
  } catch (err: unknown) {
    logger.warn('shubham-skills', 'hyperframes failed', { err });
    toast.error('Composition échouée');
  }
}

async function launchAgentBrowser(): Promise<void> {
  const url = window.prompt('URL à analyser :', 'https://example.com');
  if (!url) return;
  const goal = window.prompt('Objectif :', 'Trouver le formulaire de contact');
  if (!goal) return;
  toast.info('🌐 Analyse en cours...');
  try {
    const r: AgentBrowserResult = await agentBrowser.analyze(url, goal);
    const actionsList = r.actions.map((a) => `
      <li style="background:rgba(255,255,255,0.03);padding:10px 12px;border-radius:10px;margin-bottom:6px">
        <strong style="color:#e8b830">[${escapeHtml(a.type)}]</strong>
        ${a.selector ? `<code style="background:rgba(0,0,0,0.4);padding:2px 6px;border-radius:4px;font-size:11px;margin-left:6px">${escapeHtml(a.selector)}</code>` : ''}
        ${a.value ? `<span style="color:rgba(255,255,255,0.65);font-size:12px;margin-left:6px">→ ${escapeHtml(a.value)}</span>` : ''}
        <p style="color:rgba(255,255,255,0.55);font-size:12px;margin:4px 0 0">${escapeHtml(a.description ?? '')}</p>
      </li>`).join('');
    modalSheet.open({
      title: `🌐 Agent Browser — ${r.actions.length} actions`,
      content: `
        <div style="font-family:system-ui;padding:14px 4px">
          <p style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:10px">
            ${r.fetchOk ? '✅ DOM récupéré' : '⚠️ CORS bloqué — fallback'} · ${r.domSize} chars · ${r.durationMs}ms
          </p>
          <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:8px 0 14px;font-style:italic">${escapeHtml(r.summary)}</p>
          <ul style="list-style:none;padding:0;margin:0;max-height:50vh;overflow-y:auto">${actionsList}</ul>
        </div>
      `,
      actions: [{ label: 'Fermer', variant: 'ghost', onClick: () => modalSheet.closeAll() }],
    });
  } catch (err: unknown) {
    logger.warn('shubham-skills', 'agent-browser failed', { err });
    toast.error('Analyse échouée');
  }
}

async function launchMarketingPsy(): Promise<void> {
  const product = window.prompt('Produit :', 'Apex AI');
  if (!product) return;
  const audience = window.prompt('Audience :', 'Développeurs freelance');
  if (!audience) return;
  const triggers = marketingPsy.listTriggers();
  const triggerList = triggers.map((t, i) => `${i + 1}. ${t.id}`).join('\n');
  const triggerIdx = window.prompt(`Trigger Cialdini ? (1-${triggers.length})\n\n${triggerList}`, '6');
  const idx = parseInt(triggerIdx ?? '6', 10) - 1;
  const trigger: CialdiniTrigger = triggers[idx]?.id ?? 'social-proof';
  toast.info('🧠 Génération copy...');
  try {
    const out: MarketingOutput = await marketingPsy.generate({ product, audience, trigger });
    modalSheet.open({
      title: `🧠 Marketing Psy — ${out.trigger}`,
      content: `
        <div style="font-family:system-ui;padding:14px 4px">
          <p style="color:rgba(255,255,255,0.55);font-size:11px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.05em">Copy générée</p>
          <pre style="background:rgba(232,184,48,0.08);color:#fff;padding:14px;border-radius:10px;font-size:14px;white-space:pre-wrap;border-left:3px solid #e8b830">${escapeHtml(out.copy)}</pre>
          <p style="color:rgba(255,255,255,0.55);font-size:11px;margin:14px 0 6px;text-transform:uppercase;letter-spacing:0.05em">Pourquoi ça marche</p>
          <p style="color:rgba(255,255,255,0.85);font-size:13px;line-height:1.5">${escapeHtml(out.rationale)}</p>
        </div>
      `,
      actions: [
        { label: 'Copier', variant: 'primary', onClick: () => { void navigator.clipboard?.writeText(out.copy); toast.success('Copy copiée'); } },
        { label: 'Fermer', variant: 'ghost', onClick: () => modalSheet.closeAll() },
      ],
    });
  } catch (err: unknown) {
    logger.warn('shubham-skills', 'marketing-psy failed', { err });
    toast.error('Génération échouée');
  }
}

async function launchImpeccableDesign(): Promise<void> {
  const cmds = impeccableDesign.listCommands();
  const cmdList = cmds.slice(0, 23).map((c, i) => `${i + 1}. ${c.id}`).join('\n');
  const cmdIdx = window.prompt(`Commande ? (1-23)\n\n${cmdList}`, '1');
  const idx = parseInt(cmdIdx ?? '1', 10) - 1;
  const cmd = cmds[idx]?.id ?? 'make-it-pop';
  const design = window.prompt('Design actuel (HTML/CSS) :', '<button>CTA</button>');
  if (!design) return;
  toast.info('✨ Polissage en cours...');
  try {
    const r: ImpeccableResult = await impeccableDesign.applyCommand(cmd, design);
    const changesList = r.changes.map((c) => `
      <li style="background:rgba(255,255,255,0.03);padding:10px 12px;border-radius:10px;margin-bottom:6px;font-size:12px">
        <strong style="color:#e8b830">[${escapeHtml(c.type)}]</strong>
        <p style="margin:4px 0 0;color:rgba(255,99,99,0.85)">avant : ${escapeHtml(c.before)}</p>
        <p style="margin:2px 0 0;color:rgba(34,204,119,0.85)">après : ${escapeHtml(c.after)}</p>
      </li>`).join('');
    modalSheet.open({
      title: `✨ Impeccable Design — ${r.command}`,
      content: `
        <div style="font-family:system-ui;padding:14px 4px">
          <p style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:10px">
            ${r.changes.length} changement(s) · ${r.durationMs}ms
          </p>
          <h3 style="font-size:13px;color:#e8b830;text-transform:uppercase;margin:0 0 8px">Design révisé</h3>
          <pre style="background:rgba(0,0,0,0.4);color:rgba(255,255,255,0.85);padding:12px;border-radius:10px;font-size:12px;white-space:pre-wrap;max-height:30vh;overflow-y:auto">${escapeHtml(r.revisedDesign)}</pre>
          <h3 style="font-size:13px;color:#e8b830;text-transform:uppercase;margin:14px 0 8px">Changements</h3>
          <ul style="list-style:none;padding:0;margin:0;max-height:30vh;overflow-y:auto">${changesList}</ul>
        </div>
      `,
      actions: [{ label: 'Fermer', variant: 'ghost', onClick: () => modalSheet.closeAll() }],
    });
  } catch (err: unknown) {
    logger.warn('shubham-skills', 'impeccable-design failed', { err });
    toast.error('Polissage échoué');
  }
}

async function launchIOSSimulator(): Promise<void> {
  const html = window.prompt('HTML à preview iPhone :', '<h1 style="color:#c9a227;font-family:Georgia">Hello Apex</h1>');
  if (!html) return;
  try {
    await iosSimulator.openPreview(html);
  } catch (err: unknown) {
    logger.warn('shubham-skills', 'ios-simulator failed', { err });
    toast.error('Preview échouée');
  }
}

function attachHandlers(rootEl: HTMLElement): void {
  if (!activeScope) return;

  rootEl.querySelectorAll<HTMLButtonElement>('[data-launch]').forEach((btn) => {
    activeScope!.bind(btn, 'click', () => {
      haptic.tap();
      const id = btn.dataset['launch'] ?? '';
      switch (id) {
        case 'hyperframes': void launchHyperFrames(); break;
        case 'agent-browser': void launchAgentBrowser(); break;
        case 'marketing-psy': void launchMarketingPsy(); break;
        case 'impeccable-design': void launchImpeccableDesign(); break;
        case 'ios-simulator': void launchIOSSimulator(); break;
        default: toast.warn(`Skill ${id} non implémenté`);
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
  activeScope?.cleanup();
  activeScope = createCleanupScope('admin-shubham-skills');

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
