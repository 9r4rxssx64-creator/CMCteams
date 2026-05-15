/**
 * APEX v13 — Feature Chat (qualité ULTRA Claude.ai/ChatGPT level)
 *
 * Demande Kevin (rebuild plan) :
 * "J'insiste aussi sur la qualité du chat qui n'était vraiment pas à niveau"
 *
 * Standards :
 * - Streaming token-par-token avec animation typing fluide (CSS transition + RAF)
 * - Auto-scroll smooth `behavior:'smooth'` à chaque chunk
 * - Indicateur "Apex réfléchit..." live (équivalent Claude Code)
 * - Markdown rendering progressif (parser as-you-go)
 * - replaceChildren (pas innerHTML brutal)
 * - Aucune erreur technique brute affichée user
 * - Queue messages : Kevin peut envoyer 5 messages d'affilée, tous traités
 */

import { APP_VER } from '../../core/bootstrap.js';
import { errors } from '../../core/errors.js';
import { events } from '../../core/events.js';
import { logger } from '../../core/logger.js';
import { memory } from '../../core/memory.js';
import { store } from '../../core/store.js';
import { aiRouter, type ChatMessage } from '../../services/ai-router.js';
import { commerce } from '../../services/commerce.js';
import { cspStyleHelper } from '../../services/csp-style-helper.js';
import { isFeatureEnabled, renderDisabledNotice } from '../../services/feature-toggles.js';
import {
  parseSlashCommand,
  filterCommands,
  helpText,
  SLASH_COMMANDS,
  type SlashCommand,
} from '../../services/slash-commands.js';
import {
  generateFollowUps,
  isFollowUpsEnabled,
  type FollowUpSuggestion,
} from '../../services/suggestions.js';
import { vault } from '../../services/vault.js';
import { haptic } from '../../ui/haptic.js';
import { renderMarkdownEnriched, wireMarkdownActions } from '../../ui/markdown.js';
import { modalSheet } from '../../ui/modal-sheet.js';
import { skeleton } from '../../ui/skeleton.js';
import { toast } from '../../ui/toast.js';

/* v13.3.48 — Cap context conversation pour HTTP 400 et perf
 * Garde max 30 derniers messages user/assistant. Drop les plus anciens. */
const MAX_CONTEXT_MESSAGES = 30;

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool_card';
  text: string;
  ts: number;
  streaming?: boolean;
  /* P0 Kevin v13.1.0 : pills tool_use discrètes inline pendant streaming.
     Au lieu de cards massives, on affiche `🔧 [name]` en pill horizontal
     puis `✅ N opérations` quand done. */
  toolPills?: { name: string; status: 'running' | 'done' }[];
  toolBatchCount?: number;
  /* v13.4.11 fix Kevin "Apex n'a pas accès aux pièces jointes" — base64 + mime
   * pour reconstruire content array Anthropic au moment d'appel IA. */
  attachments?: Array<{ mime: string; base64: string; name: string }>;
}

/* v13.4.11 — Queue attachments en attente de submit (vidée après chaque user message envoyé). */
let pendingAttachments: Array<{ mime: string; base64: string; name: string }> = [];
/* v13.4.12 — Promises FileReader en cours, pour await au submit (anti race condition). */
let pendingAttachmentPromises: Array<Promise<void>> = [];

/* v13.3.53 fix Kevin "À chaque MAJ je perds mon historique de chat" :
 * AVANT : conversation = array mémoire pure, perdu à chaque reload/MAJ.
 * APRÈS : load depuis localStorage au mount + save debounce après chaque push.
 * Cap 200 messages (drop oldest), exclus tool_card et streaming partial. */
const CONV_STORAGE_KEY = 'apex_v13_conversation_active';
const CONV_MAX_PERSIST = 200;

/* v13.3.77 fix TDZ : déclarer conversation EN PREMIER (init []) puis remplir.
 * Évite "Cannot access 'conversation' before initialization" en isolation Vitest
 * (race conditions dynamic import + happy-dom + isolate). */
const conversation: DisplayMessage[] = [];
const queue: string[] = [];
let isProcessing = false;

function loadPersistedConversation(): DisplayMessage[] {
  try {
    const raw = localStorage.getItem(CONV_STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as DisplayMessage[];
    if (!Array.isArray(arr)) return [];
    /* Strip streaming flag (au cas où sauvé pendant streaming) */
    return arr.map((m) => ({ ...m, streaming: false })).filter((m) => m.text || m.role === 'tool_card');
  } catch { return []; }
}

let _saveTimeout: ReturnType<typeof setTimeout> | null = null;
let _firebaseSyncTimeout: ReturnType<typeof setTimeout> | null = null;
function persistConversation(): void {
  if (_saveTimeout) clearTimeout(_saveTimeout);
  _saveTimeout = setTimeout(() => {
    try {
      /* Exclus messages en streaming partial pour éviter snapshot incomplet */
      const toSave = conversation
        .filter((m) => !m.streaming)
        .slice(-CONV_MAX_PERSIST);
      localStorage.setItem(CONV_STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      /* Quota exceeded → trim plus agressif */
      try {
        const half = conversation.filter((m) => !m.streaming).slice(-(CONV_MAX_PERSIST / 2));
        localStorage.setItem(CONV_STORAGE_KEY, JSON.stringify(half));
      } catch { /* skip */ }
    }
  }, 500);

  /* v13.4.10 fix Kevin "continue recommence à zéro" : sync Firebase debounce 30s
   * pour survivre clear cache PWA iOS + restore au reload depuis cloud.
   * Cap derniers 30 messages text-only (pas photos base64 = trop gros Firebase).
   * Path : apex_v13_conversation_cloud (séparé de _active local pour éviter écrasement). */
  if (_firebaseSyncTimeout) clearTimeout(_firebaseSyncTimeout);
  _firebaseSyncTimeout = setTimeout(() => {
    void (async () => {
      try {
        const cloudPayload = conversation
          .filter((m) => !m.streaming && m.text && m.text.length < 8000)
          .slice(-30)
          .map((m) => ({ role: m.role, text: m.text, ts: m.ts }));
        const { firebase } = await import('../../services/firebase.js');
        await firebase.write('apex_v13_conversation_cloud', cloudPayload);
      } catch (err: unknown) {
        logger.warn('chat', 'Firebase sync conversation skipped', { err });
      }
    })();
  }, 30000);
}

/* v13.4.10 — Restore Firebase au boot SI localStorage vide (cache PWA clear iOS).
 * Async, non-bloquant : conversation locale s'affiche d'abord, restore patché après. */
async function tryFirebaseRestoreConversation(): Promise<void> {
  if (conversation.length > 0) return; /* déjà chargé local */
  try {
    const { firebase } = await import('../../services/firebase.js');
    const cloudRaw = await firebase.read('apex_v13_conversation_cloud');
    if (!Array.isArray(cloudRaw) || cloudRaw.length === 0) return;
    const restored = (cloudRaw as Array<{ role: 'user' | 'assistant'; text: string; ts: number }>)
      .filter((m) => m && typeof m.text === 'string' && m.text.length > 0)
      .map((m) => ({ ...m, streaming: false } as DisplayMessage));
    if (restored.length > 0) {
      conversation.push(...restored);
      logger.info('chat', `Conversation restored from Firebase (${restored.length} messages)`);
    }
  } catch (err: unknown) {
    logger.warn('chat', 'Firebase restore conversation skipped', { err });
  }
}

/* Init populée APRÈS const conversation (pas de TDZ : conversation déjà bound) */
{
  const persisted = loadPersistedConversation();
  if (persisted.length) {
    conversation.push(...persisted);
  }
}

/* Exposé pour tests anti-XSS Jet 7.8 (audit subagent) */
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

/**
 * Album image rendu : grille 2-3 cols mobile, 4 desktop, thumbnails visuels.
 * Kevin règle 2026-05-07 : "je veux avoir le visuel pas une liste d'écriture, album entier".
 * Exposé pour tests.
 */
export interface AlbumImage {
  url: string;
  filename: string;
}

export function renderImageAlbum(images: AlbumImage[]): string {
  if (!Array.isArray(images) || images.length === 0) return '';
  const cols = images.length === 1 ? 1 : images.length <= 4 ? 2 : 3;
  const items = images
    .map((img, i) => {
      const safeUrl = escapeHtml(img.url);
      const safeName = escapeHtml(img.filename);
      return (
        `<div class="ax-album-item" data-img-idx="${i}" ` +
        `style="aspect-ratio:1;background:#1a1a2e;border-radius:8px;overflow:hidden;` +
        `position:relative;cursor:pointer;-webkit-tap-highlight-color:transparent">` +
        `<img src="${safeUrl}" alt="${safeName}" loading="lazy" ` +
        `style="width:100%;height:100%;object-fit:cover;transition:transform 200ms cubic-bezier(0.16,1,0.3,1)">` +
        `<div class="ax-album-overlay" ` +
        `style="position:absolute;bottom:0;left:0;right:0;padding:8px;` +
        `background:linear-gradient(to top,rgba(0,0,0,0.85),transparent);` +
        `color:#fff;font-size:11px;line-height:1.3;text-overflow:ellipsis;` +
        `overflow:hidden;white-space:nowrap">${safeName}</div>` +
        `</div>`
      );
    })
    .join('');
  return (
    `<div class="ax-image-album" ` +
    `style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:8px;` +
    `margin:12px 0;border-radius:12px">${items}</div>`
  );
}

/**
 * Modal lightbox plein écran avec actions transformation (cartoon/anime/video/remove-bg/stylize).
 * Kevin demande 2026-05-07 : "transforme cette photo en cartoon ou en vidéo anime".
 * Exposé pour tests.
 */
export function openImageLightbox(rootEl: HTMLElement, img: AlbumImage): HTMLElement {
  const safeUrl = escapeHtml(img.url);
  const safeName = escapeHtml(img.filename);
  const modal = document.createElement('div');
  modal.className = 'ax-lightbox';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Visualisation image');
  modal.style.cssText =
    'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.95);' +
    'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
    'padding:env(safe-area-inset-top,20px) 16px env(safe-area-inset-bottom,20px) 16px';

  const btnStyle =
    'min-height:44px;padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);' +
    'background:rgba(20,20,35,0.7);color:#fff;font-size:13px;cursor:pointer;' +
    '-webkit-tap-highlight-color:transparent;font-weight:600;';

  modal.innerHTML =
    `<button class="ax-lb-close" aria-label="Fermer" ` +
    `style="position:absolute;top:env(safe-area-inset-top,20px);right:16px;width:44px;height:44px;` +
    `border-radius:50%;background:rgba(255,255,255,0.1);border:none;color:#fff;font-size:20px;cursor:pointer;` +
    `-webkit-tap-highlight-color:transparent;z-index:1">✕</button>` +
    `<img src="${safeUrl}" alt="${safeName}" loading="lazy" decoding="async" ` +
    `style="max-width:100%;max-height:65vh;object-fit:contain;border-radius:12px;` +
    `box-shadow:0 10px 40px rgba(0,0,0,0.5)">` +
    `<div class="ax-lb-filename" style="color:rgba(255,255,255,0.7);font-size:13px;margin-top:12px;text-align:center">${safeName}</div>` +
    `<div class="ax-lb-actions" ` +
    `style="display:flex;gap:8px;margin-top:20px;flex-wrap:wrap;justify-content:center;max-width:680px">` +
    `<button data-action="cartoon" style="${btnStyle}" title="Transformer en cartoon">🎨 Cartoon</button>` +
    `<button data-action="anime" style="${btnStyle}" title="Style anime">🤖 Anime</button>` +
    `<button data-action="video" style="${btnStyle}" title="Animer en vidéo">🎬 Animer vidéo</button>` +
    `<button data-action="remove-bg" style="${btnStyle}" title="Retirer le fond">✂️ Retirer fond</button>` +
    `<button data-action="stylize" style="${btnStyle}" title="Variation stylisée">🎭 Variations</button>` +
    `<button data-action="share" style="${btnStyle}" title="Partager">📤 Partager</button>` +
    `<button data-action="download" style="${btnStyle}" title="Télécharger">💾 Télécharger</button>` +
    `</div>` +
    `<div class="ax-lb-status" data-status ` +
    `style="margin-top:14px;color:#c9a227;font-size:12px;min-height:18px;text-align:center"></div>`;

  document.body.appendChild(modal);

  const close = (): void => {
    if (modal.parentNode) modal.parentNode.removeChild(modal);
  };

  const closeBtn = modal.querySelector<HTMLButtonElement>('.ax-lb-close');
  closeBtn?.addEventListener('click', close);

  const keyHandler = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', keyHandler);
    }
  };
  document.addEventListener('keydown', keyHandler);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  const statusEl = modal.querySelector<HTMLDivElement>('[data-status]');
  modal.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset['action'] ?? '';
      void handleLightboxAction(rootEl, img, action, statusEl, close);
    });
  });

  return modal;
}

/**
 * Handler central des actions lightbox.
 * Exposé pour tests (mockable).
 */
export async function handleLightboxAction(
  rootEl: HTMLElement,
  img: AlbumImage,
  action: string,
  statusEl: HTMLDivElement | null,
  closeFn: () => void,
): Promise<void> {
  if (action === 'share') {
    const nav = navigator as Navigator & { share?: (data: { url?: string; title?: string }) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ url: img.url, title: img.filename });
        return;
      } catch { /* user cancelled — fallback copy */ }
    }
    try {
      await navigator.clipboard.writeText(img.url);
      toast.success('Lien copié dans le presse-papiers');
    } catch {
      toast.warn('Partage non supporté par ce navigateur');
    }
    return;
  }

  if (action === 'download') {
    try {
      const a = document.createElement('a');
      a.href = img.url;
      a.download = img.filename || 'image';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Téléchargement échoué');
    }
    return;
  }

  const transformActions = ['cartoon', 'anime', 'video', 'remove-bg', 'stylize'];
  if (transformActions.includes(action)) {
    if (statusEl) statusEl.textContent = `⏳ ${action} en cours… (Replicate)`;
    let prompt: string | undefined;
    if (action === 'stylize') {
      const p = window.prompt('Style souhaité (ex: "huile sur toile renaissance") :');
      if (!p) {
        if (statusEl) statusEl.textContent = '';
        return;
      }
      prompt = p;
    }
    try {
      const { apexToolsDispatch } = await import('../../services/apex-tools-dispatch.js');
      const params: Record<string, unknown> = { url: img.url, type: action };
      if (prompt) params['prompt'] = prompt;
      const res = await apexToolsDispatch.execute('transform_image', params, 'admin');
      if (!res.ok) {
        const errMsg = res.error ?? 'transformation échouée';
        if (statusEl) statusEl.textContent = `❌ ${errMsg}`;
        toast.error(errMsg);
        return;
      }
      const result = res.result as { success?: boolean; outputUrl?: string; error?: string; cost_eur?: number };
      if (!result.success || !result.outputUrl) {
        const errMsg = result.error ?? 'aucun outputUrl';
        if (statusEl) statusEl.textContent = `❌ ${errMsg}`;
        return;
      }
      if (statusEl) {
        const cost = result.cost_eur !== undefined && result.cost_eur !== null ? ` (${result.cost_eur.toFixed(3)}€)` : '';
        statusEl.textContent = `✅ Transformé${cost}`;
      }
      pushTransformResult(rootEl, result.outputUrl, action, img.filename);
      setTimeout(closeFn, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'erreur';
      if (statusEl) statusEl.textContent = `❌ ${msg}`;
    }
    return;
  }
}

/**
 * v13.4.14 — Détection type de paste (Kevin "visuel intelligent de tout ce que je colle").
 *
 * Routing :
 * - 'credential' : pattern AX_CREDENTIAL_PATTERNS → vault auto (déjà géré)
 * - 'code'       : bloc backtick OU 3+ lignes code (function/const/import/etc.) → coffre dossier
 * - 'url'        : URL valide → preview card
 * - 'planning'   : format SBM CMCteams → bridge (déjà géré)
 * - 'text'       : fallback normal
 */
export type PasteKind = 'credential' | 'code' | 'url' | 'planning' | 'text';

export function detectPasteKind(pasted: string): PasteKind {
  const trimmed = pasted.trim();
  if (!trimmed) return 'text';
  /* 1. Backtick block multi-line (```lang ... ```) */
  if (/```[\s\S]+?```/.test(trimmed)) return 'code';
  /* 2. Patterns code (3+ lignes ou 1 ligne avec mot-clé fort) */
  const lines = trimmed.split('\n');
  if (lines.length >= 3) {
    const codeKeywords = /\b(function|const|let|var|import|export|class|def|return|async|await|public|private|interface|type)\b/;
    const hits = lines.filter((l) => codeKeywords.test(l)).length;
    if (hits >= 2) return 'code';
    /* Syntaxe JSON/YAML/HTML structuré multi-line */
    if (/^\s*[{\[]/.test(lines[0] ?? '') && /[}\]]\s*$/.test(lines[lines.length - 1] ?? '')) return 'code';
    if (/^<(\?php|!DOCTYPE|html|script|style)/i.test(lines[0] ?? '')) return 'code';
  }
  /* 3. URL pure (1 seule URL sans autre texte) */
  if (/^https?:\/\/\S+$/i.test(trimmed)) return 'url';
  /* 4. fallback */
  return 'text';
}

/**
 * v13.4.14 — Push visual card dans le chat scroll pour Kevin "visuel pas toast".
 *
 * Card format : icône type + preview tronqué + actions buttons (sauver coffre / annuler).
 * XSS-safe : utilise textContent partout (jamais innerHTML sur user input).
 */
export function pushPasteCard(
  rootEl: HTMLElement,
  type: PasteKind,
  preview: string,
  actions: Array<{ label: string; onClick: () => void; primary?: boolean }> = [],
): HTMLElement | null {
  const scroll = rootEl.querySelector<HTMLElement>('.ax-chat-scroll');
  if (!scroll) return null;
  const icon = type === 'credential' ? '🔑'
    : type === 'code' ? '💻'
    : type === 'url' ? '🔗'
    : type === 'planning' ? '📋'
    : '📄';
  const typeLabel = type === 'credential' ? 'Identifiant détecté'
    : type === 'code' ? 'Code détecté'
    : type === 'url' ? 'Lien détecté'
    : type === 'planning' ? 'Planning détecté'
    : 'Texte';
  const card = document.createElement('div');
  card.className = 'ax-msg ax-msg-user ax-paste-card ax-slide-up-fade';
  card.style.cssText = 'background:rgba(201,162,39,0.08);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:12px;margin:8px 0';

  const head = document.createElement('div');
  head.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:13px;color:#c9a227;font-weight:600;margin-bottom:8px';
  head.textContent = `${icon} ${typeLabel}`;
  card.appendChild(head);

  const previewDiv = document.createElement('pre');
  previewDiv.style.cssText = 'background:rgba(0,0,0,0.3);color:#e0e0e0;padding:8px;border-radius:6px;font-family:Consolas,Monaco,monospace;font-size:12px;max-height:120px;overflow:auto;white-space:pre-wrap;word-break:break-word;margin:0 0 8px';
  /* XSS-safe : textContent uniquement */
  previewDiv.textContent = preview.length > 500 ? `${preview.slice(0, 500)}…` : preview;
  card.appendChild(previewDiv);

  if (actions.length > 0) {
    const actionsDiv = document.createElement('div');
    actionsDiv.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
    for (const action of actions) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = action.primary ? 'ax-btn ax-btn-primary' : 'ax-btn ax-btn-outline';
      btn.textContent = action.label;
      btn.style.cssText = 'padding:6px 14px;font-size:13px;border-radius:6px;cursor:pointer';
      btn.addEventListener('click', () => {
        try { action.onClick(); }
        catch (err: unknown) { logger.warn('chat', 'paste-card action failed', { err }); }
        /* Disable buttons après clic action (évite double-trigger) */
        actionsDiv.querySelectorAll('button').forEach((b) => { (b as HTMLButtonElement).disabled = true; });
      });
      actionsDiv.appendChild(btn);
    }
    card.appendChild(actionsDiv);
  }

  scroll.appendChild(card);
  scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' });
  return card;
}

/**
 * v13.4.14 — Sauve un snippet code dans le coffre dossier "Codes & snippets".
 *
 * Clé localStorage : apex_v13_code_<timestamp>_<id>
 * Permet listing via UI vault future (préfix apex_v13_code_*).
 * Pour l'instant : stocké en clair (Kevin règle "codes = pas crypto" mais classés).
 */
export async function saveCodeSnippet(code: string, lang?: string): Promise<{ ok: boolean; key?: string }> {
  try {
    const ts = Date.now();
    const id = Math.random().toString(36).slice(2, 8);
    const key = `apex_v13_code_${ts}_${id}`;
    const entry = {
      code,
      lang: lang ?? 'unknown',
      created: ts,
      lines: code.split('\n').length,
      size: code.length,
    };
    /* Stocke en JSON */
    localStorage.setItem(key, JSON.stringify(entry));
    /* Index pour listing rapide */
    const indexKey = 'apex_v13_code_snippets_index';
    let idx: string[] = [];
    try {
      const raw = localStorage.getItem(indexKey);
      if (raw) idx = JSON.parse(raw) as string[];
    } catch { idx = []; }
    idx.unshift(key);
    if (idx.length > 100) idx = idx.slice(0, 100); /* Cap 100 snippets */
    localStorage.setItem(indexKey, JSON.stringify(idx));
    return { ok: true, key };
  } catch (err: unknown) {
    logger.warn('chat', 'saveCodeSnippet failed', { err });
    return { ok: false };
  }
}

/**
 * v13.4.16 — Liste les snippets code sauvés dans le coffre (paste intelligent).
 *
 * Retourne les entries triées par date desc, max 100 (cap saveCodeSnippet).
 * XSS-safe : valeurs JSON parsées, jamais innerHTML.
 */
export function listCodeSnippets(): Array<{
  key: string;
  code: string;
  lang: string;
  created: number;
  lines: number;
  size: number;
}> {
  try {
    const idxRaw = localStorage.getItem('apex_v13_code_snippets_index');
    if (!idxRaw) return [];
    const idx = JSON.parse(idxRaw) as string[];
    const result: Array<{ key: string; code: string; lang: string; created: number; lines: number; size: number }> = [];
    for (const key of idx) {
      const raw = localStorage.getItem(key);
      if (!raw) continue; /* Entry orpheline (cleanup quota) */
      try {
        const entry = JSON.parse(raw) as { code: string; lang: string; created: number; lines: number; size: number };
        result.push({ key, ...entry });
      } catch { /* Entry corrompue, skip */ }
    }
    return result;
  } catch (err: unknown) {
    logger.warn('chat', 'listCodeSnippets failed', { err });
    return [];
  }
}

/**
 * v13.4.16 — Supprime un snippet du coffre (Kevin clique 🗑 dans la liste).
 */
export function deleteCodeSnippet(key: string): boolean {
  try {
    if (!key.startsWith('apex_v13_code_')) return false; /* Sécurité : pas d'arbitrary delete */
    localStorage.removeItem(key);
    /* Update index */
    const idxRaw = localStorage.getItem('apex_v13_code_snippets_index');
    if (idxRaw) {
      const idx = (JSON.parse(idxRaw) as string[]).filter((k) => k !== key);
      localStorage.setItem('apex_v13_code_snippets_index', JSON.stringify(idx));
    }
    return true;
  } catch (err: unknown) {
    logger.warn('chat', 'deleteCodeSnippet failed', { err, key });
    return false;
  }
}

/**
 * v13.4.13 — Helper exporté : transforme conversation DisplayMessage → ChatMessage
 * format Anthropic API.
 *
 * Extraite de processQueue() ligne ~932 pour testabilité réelle (les tests
 * vitest appellent maintenant CETTE fonction, pas une réplique mentale).
 *
 * Règles :
 * - Filtre tool_card (pas envoyés à l'API)
 * - Cap MAX_CONTEXT_MESSAGES (v13.3.48 — perf + HTTP 400)
 * - Si message user a attachments image → content array Anthropic vision format
 * - PDF/non-image attachments ignorés silencieusement (Anthropic vision = image/* only)
 * - Messages assistant : toujours content string (les attachments leaked sont ignorés)
 */
export function buildMessagesForApi(
  conversation: Array<{
    role: 'user' | 'assistant' | 'tool_card';
    text: string;
    streaming?: boolean;
    attachments?: Array<{ mime: string; base64: string; name: string }>;
  }>,
  excludeMsg?: { role: string },
  maxContext = 30,
): Array<{ role: 'user' | 'assistant' | 'system'; content: string | Array<{ type: string; [k: string]: unknown }> }> {
  return conversation
    .filter((m) => !m.streaming || m === excludeMsg)
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-maxContext)
    .filter((m) => m !== excludeMsg)
    .map((m) => {
      if (m.role === 'user' && m.attachments && m.attachments.length > 0) {
        const contentArr: Array<{ type: string; [k: string]: unknown }> = [];
        for (const att of m.attachments) {
          if (att.mime.startsWith('image/')) {
            const dataOnly = att.base64.replace(/^data:[^;]+;base64,/, '');
            contentArr.push({
              type: 'image',
              source: { type: 'base64', media_type: att.mime, data: dataOnly },
            });
          }
        }
        if (m.text) contentArr.push({ type: 'text', text: m.text });
        return { role: m.role as 'user' | 'assistant', content: contentArr };
      }
      return { role: m.role as 'user' | 'assistant', content: m.text };
    });
}

/**
 * Push résultat transformation comme bulle Apex avec image générée.
 * Exposé pour tests.
 */
export function pushTransformResult(
  rootEl: HTMLElement,
  outputUrl: string,
  transformType: string,
  sourceFilename: string,
): void {
  const scroll = rootEl.querySelector<HTMLElement>('.ax-chat-scroll');
  if (!scroll) return;
  const safeUrl = escapeHtml(outputUrl);
  const safeName = escapeHtml(sourceFilename);
  const safeType = escapeHtml(transformType);
  const isVideo = transformType === 'video' || /\.(mp4|webm|mov)(\?|$)/i.test(outputUrl);
  const media = isVideo
    ? `<video src="${safeUrl}" controls autoplay loop playsinline ` +
      `style="max-width:100%;max-height:70vh;border-radius:12px;display:block">` +
      `Ton navigateur ne supporte pas la vidéo HTML5.</video>`
    : `<img src="${safeUrl}" alt="${safeName} ${safeType}" loading="lazy" decoding="async" ` +
      `style="max-width:100%;max-height:70vh;object-fit:contain;border-radius:12px;display:block">`;

  const card = document.createElement('div');
  card.className = 'ax-msg ax-msg-assistant ax-slide-up-fade ax-transform-result';
  card.dataset['transformType'] = transformType;
  card.innerHTML =
    `<div class="ax-msg-body">` +
    `<p style="margin:0 0 8px;color:#c9a227;font-size:12px;font-weight:600">` +
    `${getTransformEmoji(transformType)} ${safeType} appliqué sur ${safeName}</p>` +
    media +
    `<div class="ax-transform-actions" style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">` +
    `<button data-tr-action="download" data-tr-url="${safeUrl}" ` +
    `style="min-height:36px;padding:6px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);` +
    `background:rgba(20,20,35,0.7);color:#fff;font-size:12px;cursor:pointer">💾 Télécharger</button>` +
    `<button data-tr-action="share" data-tr-url="${safeUrl}" ` +
    `style="min-height:36px;padding:6px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);` +
    `background:rgba(20,20,35,0.7);color:#fff;font-size:12px;cursor:pointer">📤 Partager</button>` +
    `</div>` +
    `</div>`;
  scroll.appendChild(card);
  scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' });

  card.querySelectorAll<HTMLButtonElement>('[data-tr-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const trAction = btn.dataset['trAction'] ?? '';
      const trUrl = btn.dataset['trUrl'] ?? '';
      if (trAction === 'download') {
        const a = document.createElement('a');
        a.href = trUrl;
        a.download = `apex-${transformType}-${Date.now()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else if (trAction === 'share') {
        const nav = navigator as Navigator & { share?: (d: { url?: string }) => Promise<void> };
        if (nav.share) {
          void nav.share({ url: trUrl }).catch(() => { /* cancelled */ });
        } else {
          void navigator.clipboard?.writeText(trUrl);
        }
      }
    });
  });
}

function getTransformEmoji(type: string): string {
  const map: Record<string, string> = {
    cartoon: '🎨',
    anime: '🤖',
    video: '🎬',
    'remove-bg': '✂️',
    stylize: '🎭',
  };
  return map[type] ?? '🖼️';
}

/**
 * Génère le HTML des boutons d'action sur un message assistant non-streaming.
 * - 🔊 Speak (lecture vocale via voice service)
 * - 📋 Copy (clipboard)
 * - 📄 Export PDF (lazy-load jsPDF)
 *
 * Exposé pour tests.
 */
export function renderMessageActions(msg: DisplayMessage): string {
  if (msg.role !== 'assistant' || msg.streaming) return '';
  if (!msg.text || msg.text.length === 0) return '';
  const btnStyle =
    'width:32px;height:32px;border-radius:50%;background:rgba(201,162,39,0.1);' +
    'border:1px solid rgba(201,162,39,0.3);cursor:pointer;display:inline-flex;' +
    'align-items:center;justify-content:center;font-size:14px;color:var(--ax-gold);' +
    'transition:all 200ms;opacity:0.7;-webkit-tap-highlight-color:transparent;padding:0;';
  return (
    `<div class="ax-msg-actions" style="display:flex;gap:6px;margin-top:8px;justify-content:flex-end;flex-wrap:wrap">` +
    `<button class="ax-msg-action" data-action="speak" data-msg-id="${escapeHtml(msg.id)}" ` +
    `style="${btnStyle}" title="Lire la réponse à voix haute" aria-label="Lire la réponse">🔊</button>` +
    `<button class="ax-msg-action" data-action="copy" data-msg-id="${escapeHtml(msg.id)}" ` +
    `style="${btnStyle}" title="Copier dans presse-papiers" aria-label="Copier le texte">📋</button>` +
    `<button class="ax-msg-action" data-action="regen" data-msg-id="${escapeHtml(msg.id)}" ` +
    `style="${btnStyle}" title="Régénérer une autre réponse" aria-label="Régénérer">🔄</button>` +
    `<button class="ax-msg-action" data-action="export-pdf" data-msg-id="${escapeHtml(msg.id)}" ` +
    `style="${btnStyle}" title="Exporter en PDF" aria-label="Exporter PDF">📄</button>` +
    `</div>`
  );
}

/* Exposé pour tests anti-XSS Jet 7.8 (audit subagent)
 * v13.3.48 — Pendant streaming : version "light" (rapide, paragraphes simples)
 * Hors streaming : delegate vers renderMarkdownEnriched (tables, code+copy, headings) */
export function renderMarkdownLight(text: string): string {
  /* Markdown ultra-léger pour streaming progressif (gras, italique, code inline, code block) */
  let html = escapeHtml(text);
  html = html.replace(/```([\s\S]*?)```/g, (_, code: string) => `<pre class="ax-code"><code>${code}</code></pre>`);
  html = html.replace(/`([^`\n]+)`/g, '<code class="ax-code-inline">$1</code>');
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  html = html.replace(/\n/g, '<br>');
  return html;
}

/**
 * v13.3.51 — Auto-analyse device sur upload image (Kevin 2026-05-07).
 *
 * Quand Kevin colle photo compte Broadlink ou écran Smart TV → Apex doit RÉAGIR
 * automatiquement, pas ignorer. Pipeline :
 * 1. Vision Claude analyse l'image (auto-detect type)
 * 2. Si broadlink_account → propose setupBroadlink (modal 1-clic)
 * 3. Si smart_tv → stocke device + propose pilotage via Broadlink existant
 *
 * Non-bloquant : retourne silencieusement si pas device, ou erreur API.
 */
async function autoAnalyzeDeviceImage(file: File, rootEl: HTMLElement): Promise<void> {
  if (!file.type.startsWith('image/')) return;
  /* Skip si pas de clé Anthropic (vision indispo) */
  try {
    const key = localStorage.getItem('ax_anthropic_key') ?? '';
    if (!key) return;
  } catch { return; }
  try {
    const { visionDeviceAnalyze } = await import('../../services/vision-device-analyze.js');
    /* Toast info "🔍 Apex analyse l'image..." */
    toast.info('🔍 Apex analyse ton image...', { duration: 3000 });
    const result = await visionDeviceAnalyze.autoDetectAndAnalyze({ imageBlob: file });
    logger.info('chat', 'autoAnalyzeDeviceImage', {
      type: result.type,
      confidence: result.generic.confidence,
    });
    if (result.type === 'broadlink_account' && result.broadlink && result.broadlink.confidence >= 0.5) {
      await proposeBroadlinkSetup(result.broadlink, rootEl);
    } else if (result.type === 'smart_tv' && result.smartTv && result.smartTv.confidence >= 0.5) {
      await proposeSmartTVSetup(result.smartTv, rootEl);
    } else if (result.generic.confidence >= 0.5) {
      /* Generic device detected mais pas un type qu'on sait piloter */
      toast.info(
        `📱 Image analysée : ${result.generic.type}. Pas encore d'intégration directe — Apex peut t'aider à configurer manuellement.`,
        { duration: 5000 },
      );
    }
  } catch (err: unknown) {
    logger.warn('chat', 'autoAnalyzeDeviceImage failed', { err });
  }
}

/**
 * Propose configuration Broadlink 1-clic après extraction vision.
 */
async function proposeBroadlinkSetup(
  result: import('../../services/vision-device-analyze.js').BroadlinkAccountAnalysis,
  rootEl: HTMLElement,
): Promise<void> {
  const hasToken = !!result.token;
  const devicesCount = result.devices?.length ?? 0;
  const summary = hasToken
    ? `✅ Token détecté + ${devicesCount} device(s)`
    : `📋 ${devicesCount} device(s) détecté(s) (token non visible)`;
  const sheet = modalSheet.open({
    title: '🔌 Compte Broadlink détecté',
    content:
      `<div style="padding:8px 0;color:var(--ax-text)">` +
      `<p style="margin:0 0 12px"><strong>Apex a reconnu un compte Broadlink dans ton image.</strong></p>` +
      `<p style="margin:0 0 12px;color:var(--ax-text-muted);font-size:14px">${escapeHtml(summary)}</p>` +
      (result.email ? `<p style="margin:0 0 8px;font-size:14px">📧 <strong>Email</strong> : ${escapeHtml(result.email)}</p>` : '') +
      (devicesCount > 0
        ? `<p style="margin:0 0 8px;font-size:14px">📱 <strong>Devices</strong> :</p>` +
          `<ul style="margin:0 0 12px;padding-left:20px;font-size:13px;color:var(--ax-text-muted)">` +
          (result.devices ?? []).slice(0, 5).map((d) => `<li>${escapeHtml(d.name ?? d.id ?? '?')}${d.mac ? ` <code>${escapeHtml(d.mac)}</code>` : ''}</li>`).join('') +
          `</ul>`
        : '') +
      `<div style="display:flex;flex-direction:column;gap:8px;margin-top:16px">` +
      (hasToken
        ? `<button class="ax-btn ax-btn-primary" id="ax-bl-setup-token" style="width:100%;padding:14px;font-weight:700">⚡ Configurer Broadlink (1-clic)</button>`
        : `<button class="ax-btn ax-btn-primary" id="ax-bl-login" style="width:100%;padding:14px;font-weight:700">🔑 Me connecter à Broadlink</button>`) +
      `<button class="ax-btn" id="ax-bl-open-setup" style="width:100%;padding:12px">⚙️ Ouvrir vue Configuration Broadlink</button>` +
      `<button class="ax-btn" id="ax-bl-cancel" style="width:100%;padding:10px;color:var(--ax-text-muted)">Annuler</button>` +
      `</div>` +
      `</div>`,
  });
  void rootEl; /* anti unused-warn */
  setTimeout(() => {
    document.querySelector<HTMLButtonElement>('#ax-bl-setup-token')?.addEventListener('click', () => {
      void (async () => {
        if (!result.token) return;
        const { broadlinkBridge } = await import('../../services/broadlink-bridge.js');
        const r = await broadlinkBridge.setToken(result.token, result.email);
        if (r.ok) {
          toast.success('✅ Token Broadlink configuré + chiffré dans Coffre');
          location.hash = '#/broadlink-setup';
        } else {
          toast.error('Échec setup token');
        }
        sheet.close();
      })();
    });
    document.querySelector<HTMLButtonElement>('#ax-bl-login')?.addEventListener('click', () => {
      sheet.close();
      location.hash = '#/broadlink-setup';
    });
    document.querySelector<HTMLButtonElement>('#ax-bl-open-setup')?.addEventListener('click', () => {
      sheet.close();
      location.hash = '#/broadlink-setup';
    });
    document.querySelector<HTMLButtonElement>('#ax-bl-cancel')?.addEventListener('click', () => sheet.close());
  }, 60);
}

/**
 * Propose configuration Smart TV (stocke device + propose pilotage via Broadlink).
 */
async function proposeSmartTVSetup(
  result: import('../../services/vision-device-analyze.js').SmartTVAnalysis,
  rootEl: HTMLElement,
): Promise<void> {
  void rootEl;
  /* Persist Smart TV info dans ax_smart_devices_external */
  try {
    const raw = localStorage.getItem('ax_smart_devices_external') ?? '[]';
    const list = JSON.parse(raw) as Array<Record<string, string>>;
    const entry: Record<string, string> = {
      type: 'smart_tv',
      added_ts: String(Date.now()),
    };
    if (result.brand) entry['brand'] = result.brand;
    if (result.model) entry['model'] = result.model;
    if (result.mac) entry['mac'] = result.mac;
    if (result.ip) entry['ip'] = result.ip;
    if (result.ssid) entry['ssid'] = result.ssid;
    list.push(entry);
    localStorage.setItem('ax_smart_devices_external', JSON.stringify(list.slice(-50)));
  } catch { /* quota */ }

  const summary = [
    result.brand && `🏷 ${result.brand}`,
    result.model && `📺 ${result.model}`,
    result.mac && `🆔 ${result.mac}`,
    result.ip && `🌐 ${result.ip}`,
  ].filter(Boolean).join(' · ');

  const sheet = modalSheet.open({
    title: '📺 Smart TV détectée',
    content:
      `<div style="padding:8px 0;color:var(--ax-text)">` +
      `<p style="margin:0 0 12px"><strong>Apex a reconnu une Smart TV dans ton image.</strong></p>` +
      `<p style="margin:0 0 12px;color:var(--ax-text-muted);font-size:14px">${escapeHtml(summary || 'Infos limitées')}</p>` +
      `<p style="margin:0 0 12px;font-size:13px;color:var(--ax-text-muted)">Pour la piloter, Apex utilise ton hub Broadlink (RM Pro / RM Mini). Si pas configuré, configure d'abord ton compte Broadlink.</p>` +
      `<div style="display:flex;flex-direction:column;gap:8px;margin-top:16px">` +
      `<button class="ax-btn ax-btn-primary" id="ax-tv-setup-bl" style="width:100%;padding:14px;font-weight:700">🔌 Configurer Broadlink pour piloter</button>` +
      `<button class="ax-btn" id="ax-tv-saved" style="width:100%;padding:12px">💾 OK, infos TV sauvegardées</button>` +
      `</div>` +
      `</div>`,
  });
  setTimeout(() => {
    document.querySelector<HTMLButtonElement>('#ax-tv-setup-bl')?.addEventListener('click', () => {
      sheet.close();
      location.hash = '#/broadlink-setup';
    });
    document.querySelector<HTMLButtonElement>('#ax-tv-saved')?.addEventListener('click', () => {
      toast.success('💾 Infos TV sauvegardées dans ax_smart_devices_external');
      sheet.close();
    });
  }, 60);
}

/**
 * Render follow-up chips (3 suggestions cliquables après chaque réponse Apex).
 * v13.3.48 — Demande Kevin "chat niveau Claude.ai/ChatGPT".
 * Exposé pour tests.
 */
export function renderFollowUps(suggestions: FollowUpSuggestion[]): string {
  if (!suggestions || suggestions.length === 0) return '';
  const chipStyle =
    'display:inline-flex;align-items:center;gap:6px;padding:8px 12px;' +
    'background:rgba(232,184,48,0.08);border:1px solid rgba(232,184,48,0.25);' +
    'border-radius:18px;font-size:12.5px;color:rgba(255,255,255,0.85);' +
    'cursor:pointer;transition:all 160ms cubic-bezier(0.16,1,0.3,1);' +
    '-webkit-tap-highlight-color:transparent;min-height:36px;line-height:1.2;';
  const chips = suggestions
    .map(
      (s) =>
        `<button class="ax-followup-chip" data-followup-prompt="${escapeHtml(s.prompt)}" ` +
        `style="${chipStyle}" aria-label="Suggestion : ${escapeHtml(s.label)}">` +
        `<span aria-hidden="true">${escapeHtml(s.emoji)}</span>` +
        `<span>${escapeHtml(s.label)}</span></button>`,
    )
    .join('');
  return (
    `<div class="ax-followups" style="display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 4px;` +
    `padding-top:8px;border-top:1px dashed rgba(232,184,48,0.15)">` +
    `<span style="font-size:11px;color:rgba(255,255,255,0.45);width:100%;margin-bottom:2px">` +
    `💡 Pour aller plus loin :</span>${chips}</div>`
  );
}

/**
 * Render le panneau d'autocomplete pour slash commands.
 * Exposé pour tests.
 */
export function renderSlashAutocomplete(prefix: string): string {
  const cmds = filterCommands(prefix);
  if (cmds.length === 0) return '';
  const items = cmds
    .map(
      (c: SlashCommand) =>
        `<button class="ax-slash-item" data-slash-name="${escapeHtml(c.name)}" ` +
        `style="display:flex;width:100%;text-align:left;padding:8px 12px;background:transparent;` +
        `border:none;color:#fff;cursor:pointer;align-items:center;gap:10px;` +
        `font-size:13px;border-radius:6px;-webkit-tap-highlight-color:transparent">` +
        `<span style="width:22px;text-align:center" aria-hidden="true">${escapeHtml(c.emoji)}</span>` +
        `<span style="font-weight:600;color:#e8b830">/${escapeHtml(c.name)}</span>` +
        `<span style="color:rgba(255,255,255,0.5);font-size:11.5px;flex:1">${escapeHtml(c.description)}</span>` +
        `</button>`,
    )
    .join('');
  return (
    `<div class="ax-slash-autocomplete" style="position:absolute;bottom:100%;left:0;right:0;` +
    `background:rgba(20,20,35,0.97);backdrop-filter:blur(16px);border:1px solid rgba(232,184,48,0.2);` +
    `border-radius:10px;padding:6px;margin-bottom:6px;max-height:240px;overflow-y:auto;` +
    `box-shadow:0 8px 24px rgba(0,0,0,0.4);z-index:100">${items}</div>`
  );
}

function buildSystemPrompt(): string {
  const user = store.get('user');
  return memory.buildSystemPromptContext(user);
}

/**
 * v13.3.30 (Kevin règle "mémoire long terme + relecture profonde tous docs")
 *
 * Build le system prompt DEEP version pour CHAQUE turn IA — injecte docs + facts +
 * lessons + cross-user knowledge si admin. Async + cap budget tokens.
 *
 * Si fail (timeout, parse err) → fallback sur version sync.
 */
async function buildSystemPromptDeep(): Promise<string> {
  try {
    const user = store.get('user') as { id: string; name: string } | null;
    /* v13.4.7 fix Kevin "Apex redemande action admin" : timeout 1500ms → 3000ms.
     * Avec timeout 1500ms, sur iPhone Safari PWA réseau lent, deep prompt timeout
     * trop souvent → fallback minimal sans contexte profond → IA hallucine
     * "es-tu admin ?". 3000ms = budget plus safe. */
    return await Promise.race([
      memory.buildSystemPromptDeep(user),
      new Promise<string>((_, rej) => setTimeout(() => rej(new Error('deep prompt timeout')), 3000)),
    ]);
  } catch (err: unknown) {
    logger.warn('chat', 'buildSystemPromptDeep fallback (sync)', { err });
    return buildSystemPrompt();
  }
}

/**
 * v13.3.30 (Kevin règle "extract facts à chaque message user")
 *
 * Auto-extract facts critiques du message user → push persistent_memory_<uid>.
 * Détecte aussi mots-clés règles permanentes ("automatise", "100/100", "max")
 * et record l'auto-rappel dans lessons.
 *
 * Non-bloquant : tourne en arrière-plan, ne ralentit pas le streaming IA.
 */
async function autoExtractAndLearn(text: string): Promise<void> {
  if (!text || text.length < 5) return;
  try {
    const user = store.get('user') as { id: string; name: string } | null;
    const userId = user?.id ?? 'anon';
    /* 1. Extract facts → persistent_memory_<uid> */
    const result = await memory.extractFactsFromMessage(text, userId);
    if (result.extracted > 0) {
      logger.info('chat.extract', `${result.extracted} facts extracted from user message`, {
        categories: result.facts.map((f) => f.category),
      });
    }

    /* 2. Détection mots-clés règles permanentes — log auto-rappel
     *    Si Kevin dit "automatise", "100/100", "tout au max", ce sont des règles
     *    absolues CLAUDE.md → injecte un trigger dans lessons pour next session. */
    const ruleTriggers = [
      { kw: /\b(automatise|autonomie|tout seul)\b/i, rule: 'Automatise tout en autonomie (jamais demander si Apex peut faire)' },
      { kw: /\b100\s*\/\s*100|tout.{0,10}max(imum)?\b/i, rule: '100/100 réel chaque axe — jamais demi-mesure, niveau expert pro 200€/h' },
      { kw: /\b(rappelle.toi|n'oublie pas|note (le|ça))\b/i, rule: 'Mémoire permanente — Kevin rappelle une règle à graver' },
    ];
    for (const trig of ruleTriggers) {
      if (trig.kw.test(text)) {
        await memory.recordSessionLearning(
          'rule-reminder',
          `Kevin rappel : ${trig.rule}`,
          `Message user : ${text.slice(0, 200)}`,
          'info',
        );
      }
    }
  } catch (err: unknown) {
    logger.warn('chat', 'autoExtractAndLearn failed', { err });
  }
}

/**
 * Détecte intent dans message user → propose meilleur outil sur bureau
 * (Kevin règle CLAUDE.md : "outils auto-apparents par contexte").
 */
async function detectAndSuggestTool(text: string, rootEl: HTMLElement): Promise<void> {
  try {
    const { apexToolsDispatch } = await import('../../services/apex-tools-dispatch.js');
    const intentRes = await apexToolsDispatch.execute('detect_intent', { text }, 'admin');
    if (!intentRes.ok || !intentRes.result) return;
    const intent = (intentRes.result as { intent?: string; confidence?: number }).intent;
    const confidence = (intentRes.result as { confidence?: number }).confidence ?? 0;
    if (!intent || intent === 'unknown' || confidence < 0.7) return;

    /* Kevin règle "1-clic ouverture URL" : si intent = open_url → trigger directement modal pop-up
       avec lien direct cliquable (pas window.open auto sans confirmation) */
    if (intent === 'open_url' || intent === 'open_browser') {
      /* Extract URL ou domain depuis text */
      const urlMatch = text.match(/(https?:\/\/[^\s]+)/i);
      const domainMatch = text.match(/\b([a-z0-9-]+\.(com|fr|io|net|org|app|dev|ai|co))\b/i);
      const url = urlMatch?.[1] ?? domainMatch?.[1] ?? 'https://www.google.com';
      void apexToolsDispatch.execute('open_url', { url }, 'admin');
      return;
    }

    const { smartToolsSuggester } = await import('../../services/smart-tools-suggester.js');
    const tool = smartToolsSuggester.suggestForIntent(intent);
    if (!tool) return;

    /* Kevin 2026-05-07 : "modules apparaissent tout seuls" → toggle opt-out + dedup
     * Toggle Réglages : ax_settings.tools_auto_embed (default true).
     * Si false → toast seulement, pas de card dans chat. */
    let autoEmbed = true;
    try {
      const settings = JSON.parse(localStorage.getItem('ax_settings') ?? '{}') as Record<string, unknown>;
      if (settings['tools_auto_embed'] === false) autoEmbed = false;
    } catch { /* default true */ }

    /* Dedup : ne pas re-pousser le même tool déjà visible dans les 10 derniers msgs. */
    const recentToolIds = conversation.slice(-10).filter(m => m.role === 'tool_card').map(m => (m as DisplayMessage & { toolId?: string }).toolId);
    if (recentToolIds.includes(tool.id)) return;

    /* Toast non-intrusif "🎯 Outil détecté : Studio Mix" — TOUJOURS affiché */
    const { toast } = await import('../../ui/toast.js');
    toast.info(`${tool.emoji} ${tool.name} disponible — tape pour ouvrir`, { duration: 5000 });

    /* Track usage potentiel */
    const user = store.get('user');
    if (user?.id) smartToolsSuggester.recordUsage(tool.id, user.id);

    /* Card dans chat : seulement si toggle ON (default true) */
    if (autoEmbed) pushSuggestedTool(rootEl, tool);
  } catch (err: unknown) {
    /* Silent fail — non-bloquant pour chat */
    logger.warn('chat', 'detectAndSuggestTool failed', { err });
  }
}

function pushSuggestedTool(rootEl: HTMLElement, tool: { id: string; emoji: string; name: string; description: string; cta_label: string; cta_target: string }): void {
  const scroll = rootEl.querySelector<HTMLElement>('.ax-chat-scroll');
  if (!scroll) return;
  const cardId = `tool_${tool.id}_${Date.now()}`;
  const card = document.createElement('div');
  card.className = 'ax-msg ax-msg-tool ax-slide-up-fade';
  card.id = cardId;
  card.innerHTML = `
    <div class="ax-tool-card" style="position:relative;padding-right:52px">
      <button class="ax-tool-dismiss" aria-label="Fermer" title="Ne plus suggérer dans cette conversation" style="position:absolute;top:6px;right:6px;width:44px;height:44px;min-width:44px;min-height:44px;border:0;background:rgba(255,255,255,0.08);color:var(--ax-text-dim);border-radius:50%;cursor:pointer;font-size:16px;line-height:1;display:inline-flex;align-items:center;justify-content:center">✕</button>
      <div class="ax-tool-icon">${tool.emoji}</div>
      <div class="ax-tool-info">
        <strong>${escapeHtml(tool.name)}</strong>
        <p style="margin:4px 0 0;color:var(--ax-text-dim);font-size:13px">${escapeHtml(tool.description)}</p>
      </div>
      <button class="ax-btn ax-btn-primary ax-btn-sm" data-tool-cta="${escapeHtml(tool.cta_target)}">${escapeHtml(tool.cta_label)}</button>
    </div>
  `;
  scroll.appendChild(card);
  /* Track dans conversation pour dedup (role 'tool_card' → exclu API IA) */
  conversation.push({ id: cardId, role: 'tool_card', text: tool.name, ts: Date.now(), toolId: tool.id } as DisplayMessage & { toolId: string });
  /* Wire dismiss + CTA */
  card.querySelector<HTMLButtonElement>('.ax-tool-dismiss')?.addEventListener('click', () => {
    card.classList.add('ax-fade-out');
    setTimeout(() => card.remove(), 180);
  });
  card.querySelector<HTMLButtonElement>('[data-tool-cta]')?.addEventListener('click', (e) => {
    const target = (e.currentTarget as HTMLElement).getAttribute('data-tool-cta');
    if (target) location.hash = target;
  });
  scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' });
}

async function processQueue(rootEl: HTMLElement): Promise<void> {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;
  const text = queue.shift();
  if (text === undefined) {
    isProcessing = false;
    return;
  }

  const user = store.get('user');
  const consume = commerce.consumeMessage(user?.id ?? null);
  if (!consume.allowed) {
    pushAssistantMessage(rootEl, "Tu as atteint ta limite quotidienne. Passe en plan supérieur ou réessaie demain.");
    isProcessing = false;
    return;
  }

  /* WIRE smart-tools-suggester : detect intent + propose outil sur bureau
   * (Kevin demande explicite : "musique → studio mix sur bureau") */
  void detectAndSuggestTool(text, rootEl);

  /* v13.3.30 — Auto-extract facts + auto-rappel règles (non-bloquant)
   * Wire de extractFactsFromMessage Kevin règle absolue mémoire long terme. */
  void autoExtractAndLearn(text);

  /* Sprint 13.3.71 — emit chat:message:user pour message-fact-extractor + autres listeners.
   * Kevin règle absolue "extraction continue à chaque message user". */
  try {
    const u = store.get('user') as { id: string } | null;
    events.emit('chat:message:user', {
      uid: u?.id ?? 'anon',
      text,
      ts: Date.now(),
    });
  } catch (err: unknown) {
    logger.warn('chat', 'chat:message:user emit failed', { err });
  }

  /* v13.4.11/12 fix Kevin "Apex aveugle aux pièces jointes" :
   * Attendre que tous les FileReader en cours soient terminés (anti race),
   * puis prend snapshot pendingAttachments + vide queue. Le message porte
   * ses attachments, la queue est vide pour le prochain message. */
  if (pendingAttachmentPromises.length > 0) {
    try { await Promise.all(pendingAttachmentPromises); }
    catch (err: unknown) { logger.warn('chat', 'await pending attachments fail', { err }); }
  }
  const takenAttachments = pendingAttachments.length > 0 ? [...pendingAttachments] : undefined;
  pendingAttachments = [];
  /* v13.4.12 — Reset UI : masquer la div attachments et la vider visuellement
   * (chips encore visibles sinon = confusion utilisateur). */
  const attDivClear = rootEl.querySelector<HTMLDivElement>('#ax-chat-attachments');
  if (attDivClear) {
    attDivClear.innerHTML = '';
    attDivClear.style.display = 'none';
  }
  const fileInputClear = rootEl.querySelector<HTMLInputElement>('#ax-chat-file-input');
  if (fileInputClear) fileInputClear.value = '';

  const userMsg: DisplayMessage = {
    id: `u_${Date.now()}`,
    role: 'user',
    text,
    ts: Date.now(),
    ...(takenAttachments ? { attachments: takenAttachments } : {}),
  };
  conversation.push(userMsg);
  persistConversation();

  const assistantMsg: DisplayMessage = {
    id: `a_${Date.now()}`,
    role: 'assistant',
    text: '',
    ts: Date.now(),
    streaming: true,
  };
  conversation.push(assistantMsg);
  store.set('isStreaming', true);
  renderMessages(rootEl);

  /* v13.4.13 — utilise buildMessagesForApi helper exporté (testable réel). */
  const messages = buildMessagesForApi(
    conversation,
    assistantMsg,
    MAX_CONTEXT_MESSAGES,
  ) as ChatMessage[];

  /* v13.3.30 — Deep prompt avec docs + facts + lessons (Kevin règle mémoire long terme) */
  const sysPrompt = await buildSystemPromptDeep();
  await aiRouter.stream(
    messages,
    sysPrompt,
    (chunk) => {
      /* P0 Kevin v13.1.0 : tool_use pills discrètes inline (pas card massive) */
      if (chunk.type === 'tool_use_start' && chunk.toolName) {
        if (!assistantMsg.toolPills) assistantMsg.toolPills = [];
        assistantMsg.toolPills.push({ name: chunk.toolName, status: 'running' });
        updateAssistantBubble(rootEl, assistantMsg);
        return;
      }
      if (chunk.type === 'tool_use_done') {
        /* Marque toutes les pills running comme done (batch terminé) */
        if (assistantMsg.toolPills) {
          for (const pill of assistantMsg.toolPills) {
            if (pill.status === 'running') pill.status = 'done';
          }
        }
        assistantMsg.toolBatchCount = (assistantMsg.toolBatchCount ?? 0) + (chunk.toolCount ?? 0);
        updateAssistantBubble(rootEl, assistantMsg);
        return;
      }
      if (chunk.text) {
        assistantMsg.text += chunk.text;
        updateAssistantBubble(rootEl, assistantMsg);
      }
      if (chunk.done) {
        delete assistantMsg.streaming;
        store.set('isStreaming', false);
        renderMessages(rootEl);
        /* v13.3.53 : persist conversation après streaming complet (Kevin "perds chat à chaque MAJ") */
        persistConversation();
        /* Auto-read si setting activé (Kevin demande "il puisse me lire les choses") */
        void maybeAutoReadAssistant(assistantMsg);
      }
    },
    (err) => {
      const userMsg = errors.toUserMessage(err);
      const errMsg = err instanceof Error ? err.message : String(err);
      const recoverable = /timeout|abort|fetch failed|network|5\d{2}|rate.?limit|429/i.test(errMsg);
      logger.warn('chat', 'AI stream error', { errMsg, recoverable, userText: text.slice(0, 80) });
      /* Auto-retry 1× après 3s si erreur récupérable ET pas de texte déjà streamé (Kevin règle "ZÉRO blocage user") */
      if (recoverable && !assistantMsg.text) {
        assistantMsg.text = `${userMsg} ⏳ Retry auto dans 3s…`;
        renderMessages(rootEl);
        setTimeout(() => {
          /* Cleanup placeholder + re-queue user message */
          const idx = conversation.indexOf(assistantMsg);
          if (idx >= 0) conversation.splice(idx, 1);
          delete assistantMsg.streaming;
          store.set('isStreaming', false);
          queue.unshift(text);
          isProcessing = false;
          void processQueue(rootEl);
        }, 3000);
        return;
      }
      /* Erreur non récupérable OU réponse partielle déjà reçue → message clair.
       *
       * v13.3.75 (Kevin urgent "réponse partielle préservée" alors que tools réussissent) :
       * Si tools ont été appelés (toolBatchCount > 0) mais pas de texte final →
       * proposer relance plutôt que message générique frustrant. */
      const hadTools = (assistantMsg.toolBatchCount ?? 0) > 0;
      const hasText = !!assistantMsg.text && assistantMsg.text.trim().length > 30;
      let finalMsg: string;
      if (hadTools && !hasText) {
        finalMsg = `🛠 ${assistantMsg.toolBatchCount} outil(s) exécuté(s) ✅ mais la réponse texte n'a pas terminé. Tape "continue" ou relance ta question pour la suite.`;
      } else if (hasText) {
        finalMsg = `${assistantMsg.text}\n\n---\n⚠ ${userMsg} (réponse partielle préservée)`;
      } else {
        finalMsg = userMsg;
      }
      assistantMsg.text = finalMsg;
      delete assistantMsg.streaming;
      store.set('isStreaming', false);
      renderMessages(rootEl);
    },
  );

  isProcessing = false;
  if (queue.length) void processQueue(rootEl);
}

function pushAssistantMessage(rootEl: HTMLElement, text: string): void {
  conversation.push({ id: `a_${Date.now()}`, role: 'assistant', text, ts: Date.now() });
  renderMessages(rootEl);
}

/**
 * v13.3.79 (Kevin 2026-05-08 18:00) — Détecte commandes wake-word texte
 * ("dis apex", "ok apex", "hey apex" tapées en texte) et active le wake word
 * voice mode. PAS de roundtrip IA, PAS de "Plan A/B/C".
 *
 * Patterns acceptés (case-insensitive, trim) :
 *   - "dis apex", "dit apex", "di apex"
 *   - "ok apex", "okay apex"
 *   - "hey apex", "hello apex"
 *
 * Variants doivent matcher EXACTEMENT (pas substring) pour éviter de
 * trigger sur "dis apex où est mon dossier" qui est une vraie question.
 *
 * Retourne true si traité, false sinon.
 */
export function handleWakeWordTextTrigger(_rootEl: HTMLElement, text: string): boolean {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return false;
  const WAKE_PATTERNS = [
    'dis apex',
    'dit apex',
    'di apex',
    'ok apex',
    'okay apex',
    'hey apex',
    'hello apex',
  ];
  if (!WAKE_PATTERNS.includes(normalized)) return false;

  haptic.tap();
  /* Activate wake word voice mode (lazy import — services/wake-word charge SpeechRecognition iOS) */
  void (async () => {
    try {
      const { wakeWord } = await import('../../services/wake-word.js');
      const r = await wakeWord.start();
      if (r.started) {
        toast.success('🎙 Wake word activé — parle, je t\'écoute', { duration: 4000 });
      } else {
        const reason = r.reason ?? 'wake-word indisponible';
        toast.warn(`🎙 ${reason}`, { duration: 5000 });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn('chat', 'wake-word text trigger failed', { err: msg });
      toast.warn('🎙 Wake word indisponible sur ce navigateur', { duration: 4000 });
    }
  })();
  return true;
}

/**
 * v13.3.48 — Handler slash commands (Kevin "chat niveau Claude.ai/ChatGPT").
 * Retourne true si le message a été traité comme commande, false sinon.
 */
export function handleSlashCommand(rootEl: HTMLElement, text: string): boolean {
  /* v13.4.5 — Alias `/auto` et `/autonome` redirigés vers `/autonomous` (Kevin "mode autonome"). */
  const aliasMap: Record<string, string> = { auto: 'autonomous', autonome: 'autonomous' };
  const normalizedText = (() => {
    if (!text || !text.trim().startsWith('/')) return text;
    const body = text.trim().slice(1);
    const sp = body.indexOf(' ');
    const cmdName = (sp === -1 ? body : body.slice(0, sp)).toLowerCase();
    if (aliasMap[cmdName]) {
      const rest = sp === -1 ? '' : body.slice(sp);
      return '/' + aliasMap[cmdName] + rest;
    }
    return text;
  })();
  const parsed = parseSlashCommand(normalizedText);
  if (!parsed.isSlash) return false;
  haptic.tap();
  if (parsed.unknown) {
    /* Inconnue : montre help auto */
    pushAssistantMessage(rootEl, helpText());
    return true;
  }
  const cmd = parsed.command;
  if (!cmd) return false;
  const args = parsed.args ?? '';
  switch (cmd.name) {
    case 'help':
      pushAssistantMessage(rootEl, helpText());
      return true;
    case 'clear':
      conversation.length = 0;
      renderMessages(rootEl);
      toast.success('🧹 Conversation effacée');
      return true;
    case 'voice': {
      const wasEnabled = isAutoReadEnabled();
      setAutoReadEnabled(!wasEnabled);
      toast.info(wasEnabled ? '🔇 Lecture vocale désactivée' : '🔊 Lecture vocale activée');
      return true;
    }
    case 'export':
      void exportConversationMarkdown();
      return true;
    case 'snippets': {
      /* v13.4.16 — Liste snippets sauvés via paste intelligent v13.4.14 */
      const snippets = listCodeSnippets();
      if (snippets.length === 0) {
        pushAssistantMessage(rootEl, "💻 Aucun snippet sauvé.\n\nQuand tu colles du code dans le chat, Apex propose 💾 Sauver dans Coffre. Les snippets apparaîtront ici avec `/snippets`.");
        return true;
      }
      /* Format markdown listing : titre + chaque snippet (head + nombre lignes + lang) */
      const lines: string[] = [`💻 **${snippets.length} snippet${snippets.length > 1 ? 's' : ''} sauvé${snippets.length > 1 ? 's' : ''}** :\n`];
      for (let i = 0; i < snippets.length; i++) {
        const s = snippets[i];
        if (!s) continue;
        const date = new Date(s.created).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
        const preview = s.code.slice(0, 80).replace(/\n/g, ' ');
        lines.push(`${i + 1}. **${s.lang}** · ${s.lines} ligne${s.lines > 1 ? 's' : ''} · ${date}`);
        lines.push(`   \`${preview}${s.code.length > 80 ? '…' : ''}\``);
        lines.push('');
      }
      lines.push('_Note : pour voir un snippet complet, ouvre 🔐 Coffre (UI listing à venir v13.4.17+)._');
      pushAssistantMessage(rootEl, lines.join('\n'));
      return true;
    }
    case 'settings':
      try {
        store.set('view', 'settings');
      } catch {
        /* fallback : toast */
        toast.info('Va dans Réglages depuis le menu');
      }
      return true;
    case 'regen':
      void regenerateLastAssistant(rootEl);
      return true;
    case 'search':
      if (!args) {
        pushAssistantMessage(rootEl, 'Usage : `/search <mot-clé>`');
        return true;
      }
      void searchInConversation(rootEl, args);
      return true;
    case 'copy': {
      const last = [...conversation].reverse().find((m) => m.role === 'assistant' && !m.streaming);
      if (last) {
        void navigator.clipboard?.writeText(last.text);
        toast.success('📋 Dernière réponse copiée');
      } else {
        toast.warn('Aucune réponse Apex à copier');
      }
      return true;
    }
    case 'version':
      pushAssistantMessage(rootEl, `**Apex AI** version \`${APP_VER}\` — Créé par DK`);
      return true;
    case 'fork':
      forkConversation(rootEl);
      return true;
    /* v13.4.3 — IA IRL TikTok */
    case 'loop':
      void handleLoopCommand(rootEl, args);
      return true;
    case 'plan':
      if (!args) {
        pushAssistantMessage(rootEl, 'Usage : `/plan <objectif>` — génère un plan structuré.');
        return true;
      }
      void handlePlanCommand(rootEl, args);
      return true;
    case 'rules':
      void handleRulesCommand(rootEl, args);
      return true;
    /* v13.4.5 — Mode autonome Apex */
    case 'autonomous':
      void handleAutonomousCommand(rootEl, args);
      return true;
    default:
      return false;
  }
}

/* v13.4.3 — Slash command /loop */
async function handleLoopCommand(rootEl: HTMLElement, args: string): Promise<void> {
  try {
    const { autonomousLoop } = await import('../../services/autonomous-loop.js');
    autonomousLoop.start();
    const sub = (args || '').trim().toLowerCase();
    if (sub === '' || sub === 'list') {
      const snap = autonomousLoop.list();
      const lines = snap.tasks.map((t, i) =>
        `- **${i + 1}.** [${t.status}] ${t.task.slice(0, 80)}${t.retries > 0 ? ` _(retries: ${t.retries})_` : ''}`,
      );
      const body = lines.length === 0 ? '_Queue vide._' : lines.join('\n');
      const status = snap.paused ? '⏸ Pausé' : (snap.intervalActive ? '▶ Actif' : '⏹ Arrêté');
      pushAssistantMessage(rootEl, `### Loop autonome (${status}, ${snap.tasks.length}/50)\n\n${body}`);
      return;
    }
    if (sub === 'pause' || sub === 'resume') {
      if (sub === 'pause') autonomousLoop.pause();
      else autonomousLoop.resume();
      pushAssistantMessage(rootEl, `🔁 Loop ${sub === 'pause' ? 'pausé' : 'repris'}.`);
      return;
    }
    if (sub === 'clear') {
      autonomousLoop.clear();
      pushAssistantMessage(rootEl, '🧹 Queue loop effacée.');
      return;
    }
    /* sinon = nouvelle task */
    const entry = autonomousLoop.add(args);
    pushAssistantMessage(rootEl, `🔁 Tâche ajoutée à la queue : **${entry.task}**\n\nID : \`${entry.id}\`. Tape \`/loop list\` pour voir la queue.`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    pushAssistantMessage(rootEl, `⚠️ Erreur loop : ${msg}`);
  }
}

/* v13.4.3 — Slash command /plan */
async function handlePlanCommand(rootEl: HTMLElement, objective: string): Promise<void> {
  pushAssistantMessage(rootEl, '🗺 Génération du plan en cours…');
  try {
    const { planMode } = await import('../../services/plan-mode.js');
    const plan = await planMode.generate(objective);
    const stepsTxt = plan.steps
      .map((s, i) => `${i + 1}. **[${s.risk}]** ${s.title}${s.files.length ? ` — _${s.files.join(', ')}_` : ''}`)
      .join('\n');
    const md = `### 🗺 Plan généré (${plan.steps.length} steps, ${plan.durationMs}ms)\n\n**Objectif :** ${plan.objective}\n\n**Résumé :** ${plan.summary || '_(non précisé)_'}\n\n${stepsTxt}\n\n_Pour exécuter, tape ton message suivant — le plan sera passé en context. Pour annuler : \`planMode.revoke()\` console._`;
    pushAssistantMessage(rootEl, md);
    /* v13.4.3 affichage modal preview avec bouton Exécuter */
    try {
      const { modalSheet: ms } = await import('../../ui/modal-sheet.js');
      ms.open({
        title: '🗺 Plan validé ?',
        content: `<div style="font-family:system-ui;padding:12px"><p style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:10px">${escapeHtml(plan.summary || plan.objective)}</p><pre style="background:rgba(0,0,0,0.4);color:rgba(255,255,255,0.85);padding:12px;border-radius:10px;font-size:12px;white-space:pre-wrap;max-height:40vh;overflow-y:auto">${escapeHtml(stepsTxt)}</pre></div>`,
        actions: [
          { label: 'Annuler', variant: 'ghost', onClick: () => { planMode.revoke(); ms.closeAll(); } },
          { label: '✅ Plan validé', variant: 'primary', onClick: () => ms.closeAll() },
        ],
      });
    } catch { /* modal optional */ }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    pushAssistantMessage(rootEl, `⚠️ Erreur plan : ${msg}`);
  }
}

/* v13.4.3 — Slash command /rules */
async function handleRulesCommand(rootEl: HTMLElement, args: string): Promise<void> {
  try {
    const { rulesEngine } = await import('../../services/rules-engine.js');
    const k = (args || '').trim();
    const rules = k ? rulesEngine.filter(k) : rulesEngine.top(10);
    const md = rulesEngine.renderMarkdown(rules);
    pushAssistantMessage(rootEl, md);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    pushAssistantMessage(rootEl, `⚠️ Erreur rules : ${msg}`);
  }
}

/* v13.4.5 — Slash command /autonomous (mode autonome session-driven) */
async function handleAutonomousCommand(rootEl: HTMLElement, args: string): Promise<void> {
  try {
    const { apexAutonomousMode } = await import('../../services/apex-autonomous-mode.js');
    const { autonomousWatch } = await import('../../services/autonomous-watch.js');
    autonomousWatch.start();
    const sub = (args || '').trim();
    const subLower = sub.toLowerCase();

    if (subLower === 'status' || subLower === 'list' || subLower === '') {
      const s = apexAutonomousMode.getActiveSession();
      if (!s) {
        const history = apexAutonomousMode.getHistory(3);
        const histLines = history.length
          ? history
              .map(
                (h, i) =>
                  `${i + 1}. **${h.status}** — ${h.initialObjective.slice(0, 80)} (${h.iterations} iter, ${h.tokensConsumed} tokens)`,
              )
              .join('\n')
          : '_Aucune session passée._';
        pushAssistantMessage(
          rootEl,
          `### 🤖 Mode Autonome\n\n**État :** Inactif.\n\nLance avec \`/autonomous <objectif>\`.\n\n#### Dernières sessions\n${histLines}`,
        );
        return;
      }
      const queue = s.taskQueue.length;
      const done = s.tasksCompleted.filter((t) => t.status === 'done').length;
      const fail = s.tasksCompleted.filter((t) => t.status === 'failed').length;
      const ageMin = Math.round((Date.now() - s.startedAt) / 60000);
      const recentLogs = s.logs.slice(-5).map((l) => `- ${l.level === 'error' ? '❌' : l.level === 'warn' ? '⚠️' : '✅'} ${l.msg.slice(0, 100)}`).join('\n');
      pushAssistantMessage(
        rootEl,
        `### 🤖 Mode Autonome — ${s.status.toUpperCase()}\n\n` +
          `**Objectif :** ${s.initialObjective.slice(0, 200)}\n\n` +
          `- ⏱ Démarré il y a ${ageMin} min\n` +
          `- 🔁 Itérations : ${s.iterations}\n` +
          `- ✅ Tâches faites : ${done} (${fail} fails)\n` +
          `- 📋 Queue : ${queue}\n` +
          `- 📊 Tokens : ${s.tokensConsumed}\n\n` +
          `#### Logs récents\n${recentLogs || '_(aucun)_'}\n\n` +
          `_Stop : \`/autonomous stop\`_`,
      );
      return;
    }

    if (subLower === 'stop' || subLower === 'kill') {
      apexAutonomousMode.stop(undefined, 'slash-stop');
      pushAssistantMessage(rootEl, '🛑 Mode autonome arrêté.');
      return;
    }
    if (subLower === 'pause') {
      apexAutonomousMode.pause();
      pushAssistantMessage(rootEl, '⏸ Mode autonome pausé. Reprends avec `/autonomous resume`.');
      return;
    }
    if (subLower === 'resume') {
      apexAutonomousMode.resume();
      pushAssistantMessage(rootEl, '▶️ Mode autonome repris.');
      return;
    }

    /* Nouvelle session */
    const session = await apexAutonomousMode.start(sub);
    pushAssistantMessage(
      rootEl,
      `🤖 **Mode autonome activé.**\n\n` +
        `**Objectif :** ${session.initialObjective.slice(0, 300)}\n\n` +
        `Je prends le relais — tu peux fermer l'app, je continue jusqu'à fin ou épuisement forfait Anthropic. ` +
        `Tu seras notifié sur Telegram quand quota épuisé.\n\n` +
        `Suivi : \`/autonomous status\`. Arrêt : \`/autonomous stop\`.`,
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    pushAssistantMessage(rootEl, `⚠️ Erreur mode autonome : ${msg}`);
  }
}

/**
 * v13.3.48 — Régénère la dernière réponse assistant en re-soumettant le dernier message user.
 */
async function regenerateLastAssistant(rootEl: HTMLElement): Promise<void> {
  /* Trouve la dernière paire user → assistant */
  let lastUserText = '';
  for (let i = conversation.length - 1; i >= 0; i--) {
    const m = conversation[i];
    if (m && m.role === 'user') {
      lastUserText = m.text;
      break;
    }
  }
  if (!lastUserText) {
    toast.warn('Aucune question précédente à régénérer');
    return;
  }
  /* Remove la dernière réponse assistant */
  for (let i = conversation.length - 1; i >= 0; i--) {
    const m = conversation[i];
    if (m && m.role === 'assistant') {
      conversation.splice(i, 1);
      break;
    }
  }
  /* Remove le user message correspondant aussi (re-poussé par processQueue) */
  for (let i = conversation.length - 1; i >= 0; i--) {
    const m = conversation[i];
    if (m && m.role === 'user' && m.text === lastUserText) {
      conversation.splice(i, 1);
      break;
    }
  }
  renderMessages(rootEl);
  queue.push(lastUserText);
  void processQueue(rootEl);
  toast.info('🔄 Régénération en cours…');
}

/**
 * v13.3.48 — Cherche un mot-clé dans la conversation et affiche les résultats.
 */
async function searchInConversation(rootEl: HTMLElement, keyword: string): Promise<void> {
  const k = keyword.toLowerCase();
  const matches = conversation
    .filter((m) => m.text.toLowerCase().includes(k))
    .map((m, idx) => {
      const role = m.role === 'user' ? '👤 Toi' : '🤖 Apex';
      const snippet = m.text.length > 200 ? m.text.slice(0, 200) + '…' : m.text;
      return `**${idx + 1}. ${role}** : ${snippet}`;
    });
  if (matches.length === 0) {
    pushAssistantMessage(rootEl, `🔎 Aucun résultat pour "${keyword}"`);
  } else {
    pushAssistantMessage(rootEl, `🔎 **${matches.length} résultat(s) pour "${keyword}"** :\n\n${matches.join('\n\n')}`);
  }
}

/**
 * v13.3.48 — Export conversation au format Markdown.
 */
async function exportConversationMarkdown(): Promise<void> {
  if (conversation.length === 0) {
    toast.warn('Aucune conversation à exporter');
    return;
  }
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const header = `# Conversation Apex — ${new Date().toLocaleString('fr-FR')}\n\nVersion : ${APP_VER}\n\n---\n\n`;
  const body = conversation
    .filter((m) => m.role !== 'tool_card')
    .map((m) => {
      const role = m.role === 'user' ? '## 👤 Toi' : '## 🤖 Apex';
      return `${role}\n\n${m.text}`;
    })
    .join('\n\n---\n\n');
  const md = header + body;
  try {
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apex-conversation-${ts}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success('📄 Conversation exportée en Markdown');
  } catch {
    /* Fallback clipboard */
    void navigator.clipboard?.writeText(md);
    toast.info('📋 Conversation copiée dans le presse-papiers');
  }
}

/**
 * v13.3.48 — Affiche le panneau autocomplete au-dessus de la barre de saisie.
 */
function showSlashAutocomplete(rootEl: HTMLElement, prefix: string): void {
  const form = rootEl.querySelector<HTMLFormElement>('#ax-chat-form');
  if (!form) return;
  let panel = rootEl.querySelector<HTMLElement>('.ax-slash-autocomplete-wrap');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'ax-slash-autocomplete-wrap';
    panel.style.cssText = 'position:relative';
    form.parentNode?.insertBefore(panel, form);
  }
  panel.innerHTML = renderSlashAutocomplete(prefix);
  /* Wire clicks */
  panel.querySelectorAll<HTMLElement>('.ax-slash-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.dataset['slashName'];
      if (!name) return;
      const ta = rootEl.querySelector<HTMLTextAreaElement>('#ax-chat-text');
      if (ta) {
        ta.value = `/${name}`;
        ta.focus();
        /* Si command sans args attendus, soumettre direct */
        const cmd = SLASH_COMMANDS.find((c) => c.name === name);
        if (cmd && !cmd.requiresArgs) {
          rootEl.querySelector<HTMLFormElement>('#ax-chat-form')?.requestSubmit();
        }
      }
      hideSlashAutocomplete(rootEl);
    });
  });
}

function hideSlashAutocomplete(rootEl: HTMLElement): void {
  const panel = rootEl.querySelector('.ax-slash-autocomplete-wrap');
  if (panel) panel.remove();
}

/**
 * v13.3.48 — Fork conversation (démarre une nouvelle session, garde la précédente en historique).
 */
function forkConversation(rootEl: HTMLElement): void {
  /* Save copy à l'historique sessions (best effort, localStorage) */
  try {
    const KEY = 'apex_v13_chat_sessions';
    const raw = localStorage.getItem(KEY);
    const sessions: { ts: number; messages: DisplayMessage[] }[] = raw
      ? (JSON.parse(raw) as { ts: number; messages: DisplayMessage[] }[])
      : [];
    sessions.push({ ts: Date.now(), messages: [...conversation] });
    /* Cap 10 sessions max */
    while (sessions.length > 10) sessions.shift();
    localStorage.setItem(KEY, JSON.stringify(sessions));
  } catch {
    /* ignore */
  }
  conversation.length = 0;
  renderMessages(rootEl);
  toast.success('🌿 Nouvelle conversation démarrée');
}

/* Storage keys pour préférences voice chat (Kevin règle : auto-read toggle) */
const AUTO_READ_KEY = 'apex_v13_chat_auto_read';

/**
 * Lit la préférence "auto-read" (lecture automatique des réponses assistant).
 * Exposé pour tests.
 */
export function isAutoReadEnabled(): boolean {
  try {
    return localStorage.getItem(AUTO_READ_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Active/désactive auto-read.
 */
export function setAutoReadEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(AUTO_READ_KEY, enabled ? '1' : '0');
  } catch {
    /* ignore quota errors */
  }
}

/**
 * Handler pour bouton 🔊 — lecture vocale d'un message assistant.
 * Toggle play/pause si déjà en cours.
 * Lazy-load voice service.
 */
async function handleSpeakAction(btn: HTMLButtonElement, msg: DisplayMessage): Promise<void> {
  haptic.tap();
  /* Toggle stop si déjà playing */
  if (btn.classList.contains('ax-playing')) {
    try {
      const { stopAll } = await import('../../services/voice.js');
      stopAll();
    } catch {
      /* ignore — reset UI quoi qu'il arrive */
    }
    btn.classList.remove('ax-playing');
    btn.textContent = '🔊';
    return;
  }
  /* Stop tout autre playback en cours (un seul à la fois) */
  try {
    const { stopAll, speak, getActiveVoice } = await import('../../services/voice.js');
    stopAll();
    /* Reset autres boutons playing */
    document.querySelectorAll<HTMLButtonElement>('.ax-msg-action.ax-playing').forEach((b) => {
      b.classList.remove('ax-playing');
      b.textContent = '🔊';
    });
    btn.classList.add('ax-playing');
    btn.textContent = '⏸';
    const voiceId = getActiveVoice();
    const result = await speak(msg.text, voiceId);
    if (!result.ok) {
      toast.warn(`Lecture impossible : ${result.reason ?? 'erreur'}`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'erreur';
    toast.warn(`Lecture vocale échouée : ${message}`);
  } finally {
    /* Reset UI après speak (sync ou fail) */
    btn.classList.remove('ax-playing');
    btn.textContent = '🔊';
  }
}

/**
 * Handler pour bouton 📋 — copie texte dans presse-papiers.
 */
async function handleCopyAction(msg: DisplayMessage): Promise<void> {
  haptic.tap();
  try {
    if (!navigator.clipboard?.writeText) {
      toast.warn('Presse-papiers non supporté par ton navigateur');
      return;
    }
    await navigator.clipboard.writeText(msg.text);
    haptic.success();
    toast.success('Copié dans presse-papiers');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'erreur';
    toast.warn(`Copie échouée : ${message}`);
  }
}

/**
 * Handler pour bouton 📄 — export PDF (lazy-load jsPDF).
 */
async function handleExportPdfAction(msg: DisplayMessage): Promise<void> {
  haptic.tap();
  try {
    /* Lazy-load jsPDF via CDN. Dynamic import URL → bypass type-checking via variable. */
    const cdnUrl: string = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/+esm';
    const mod = (await import(/* @vite-ignore */ cdnUrl)) as {
      jsPDF?: new () => unknown;
      default?: { jsPDF?: new () => unknown } | (new () => unknown);
    };
    const defaultExport = mod.default;
    const JsPDFCtor: unknown =
      mod.jsPDF ??
      (typeof defaultExport === 'function'
        ? defaultExport
        : (defaultExport as { jsPDF?: new () => unknown } | undefined)?.jsPDF);
    if (typeof JsPDFCtor !== 'function') {
      toast.warn('Export PDF indisponible');
      return;
    }
    const Ctor = JsPDFCtor as new () => {
      splitTextToSize: (t: string, w: number) => string[];
      text: (lines: string | string[], x: number, y: number) => void;
      addPage: () => void;
      save: (name: string) => void;
      internal: { pageSize: { getHeight: () => number; getWidth: () => number } };
    };
    const doc = new Ctor();
    const pageHeight = doc.internal.pageSize.getHeight();
    const lines = doc.splitTextToSize(msg.text, 180);
    let cursorY = 20;
    const lineHeight = 7;
    for (const line of lines) {
      if (cursorY > pageHeight - 20) {
        doc.addPage();
        cursorY = 20;
      }
      doc.text(line, 15, cursorY);
      cursorY += lineHeight;
    }
    doc.save(`apex-${Date.now()}.pdf`);
    haptic.success();
    toast.success('PDF téléchargé');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'erreur';
    toast.warn(`Export PDF échoué : ${message}`);
  }
}

/**
 * Auto-read : si setting activé, lit le dernier message assistant
 * dès la fin du streaming. Lazy-load voice service.
 * Exposé pour tests.
 */
export async function maybeAutoReadAssistant(msg: DisplayMessage): Promise<void> {
  if (msg.role !== 'assistant' || msg.streaming) return;
  if (!msg.text || msg.text.length === 0) return;
  if (!isAutoReadEnabled()) return;
  try {
    const { speak, getActiveVoice, stopAll } = await import('../../services/voice.js');
    stopAll();
    const voiceId = getActiveVoice();
    await speak(msg.text, voiceId);
  } catch (err: unknown) {
    /* Silent fail — auto-read est best-effort */
    logger.warn('chat', 'auto-read failed', { err });
  }
}

/**
 * Génère le HTML des pills tool_use pour un message.
 * Pill discret horizontal `🔧 [name]` quand running, `▶ N opérations` quand done.
 * Style inline minimal (Kevin règle : "pas de card massive").
 *
 * Exposé pour tests (anti-XSS + render).
 */
export function renderToolPills(msg: DisplayMessage): string {
  if (!msg.toolPills || msg.toolPills.length === 0) return '';
  const allDone = msg.toolPills.every((p) => p.status === 'done');
  const pillStyle =
    'padding:4px 8px;background:rgba(201,162,39,0.1);border-radius:8px;' +
    'font-size:11px;color:var(--ax-gold);display:inline-block;margin:4px 4px 4px 0;';
  /* Si tout terminé → résumé compact "▶ N opérations" repliable */
  if (allDone) {
    const count = msg.toolBatchCount ?? msg.toolPills.length;
    const labels = msg.toolPills.map((p) => escapeHtml(p.name)).join(', ');
    return (
      `<details class="ax-tool-pills" style="margin:4px 0;">` +
      `<summary style="${pillStyle}cursor:pointer;">▶ ${count} opération${count > 1 ? 's' : ''}</summary>` +
      `<div style="font-size:11px;color:#888;padding:4px 8px;">${labels}</div>` +
      `</details>`
    );
  }
  /* En cours : pills inline `🔧 [name]` */
  return msg.toolPills
    .map((p) => {
      const icon = p.status === 'running' ? '🔧' : '✅';
      return `<span class="ax-tool-pill" style="${pillStyle}">${icon} ${escapeHtml(p.name)}</span>`;
    })
    .join('');
}

function updateAssistantBubble(rootEl: HTMLElement, msg: DisplayMessage): void {
  const bubble = rootEl.querySelector(`[data-msg-id="${msg.id}"] .ax-msg-body`);
  if (bubble) {
    /* Pendant streaming → markdown light pour vitesse / hors → enrichi */
    const md = msg.streaming ? renderMarkdownLight(msg.text) : renderMarkdownEnriched(msg.text);
    bubble.innerHTML =
      renderToolPills(msg) +
      md +
      (msg.streaming ? '<span class="ax-cursor">▌</span>' : '') +
      renderMessageActions(msg);
    /* Smart scroll : ne force PAS si user a scrollé manuellement vers le haut */
    smartAutoScroll(rootEl);
  } else {
    renderMessages(rootEl);
  }
}

/**
 * Smart auto-scroll v13.3.48 — ne force pas si user a scrollé volontairement haut.
 * Considère "user scrollé" si distance bottom > 200px.
 */
function smartAutoScroll(rootEl: HTMLElement): void {
  const scroll = rootEl.querySelector<HTMLElement>('.ax-chat-scroll');
  if (!scroll) return;
  const distFromBottom = scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight;
  if (distFromBottom < 200) {
    scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' });
  }
  /* v13.3.72 Kevin (style Claude Code): show/hide scroll-to-bottom FAB */
  const fab = rootEl.querySelector<HTMLElement>('#ax-scroll-bottom');
  if (fab) {
    if (distFromBottom > 240) fab.classList.add('visible');
    else fab.classList.remove('visible');
  }
}

/**
 * v13.3.72 Kevin: wire scroll-to-bottom FAB (apparaît si user scrollé > 240px depuis bottom).
 */
function wireScrollToBottomFab(rootEl: HTMLElement): void {
  const scroll = rootEl.querySelector<HTMLElement>('.ax-chat-scroll');
  const fab = rootEl.querySelector<HTMLElement>('#ax-scroll-bottom');
  if (!scroll || !fab) return;
  const updateFabVisibility = (): void => {
    const dist = scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight;
    if (dist > 240) fab.classList.add('visible');
    else fab.classList.remove('visible');
  };
  scroll.addEventListener('scroll', updateFabVisibility, { passive: true });
  fab.addEventListener('click', () => {
    scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' });
    fab.classList.remove('visible');
  });
}

function renderMessages(rootEl: HTMLElement): void {
  const scroll = rootEl.querySelector<HTMLElement>('.ax-chat-scroll');
  if (!scroll) return;
  /* v13.3.48 — Identifier le DERNIER assistant message non-streaming pour follow-ups */
  let lastAssistantNonStreamingIdx = -1;
  for (let i = conversation.length - 1; i >= 0; i--) {
    const m = conversation[i];
    if (m && m.role === 'assistant' && !m.streaming && m.text.trim().length > 0) {
      lastAssistantNonStreamingIdx = i;
      break;
    }
  }
  const html = conversation
    .map((m, idx) => {
      /* Streaming indicator amélioré : typing dots animés si pas encore de texte, sinon cursor blink */
      let trail = '';
      if (m.streaming) {
        if (m.text.length === 0) {
          trail = `
            <span class="ax-typing" aria-label="Apex réfléchit">
              <span class="ax-typing-dot"></span>
              <span class="ax-typing-dot"></span>
              <span class="ax-typing-dot"></span>
            </span>
          `;
        } else {
          trail = '<span class="ax-cursor">▌</span>';
        }
      }
      const pills = renderToolPills(m);
      const actions = renderMessageActions(m);
      /* v13.3.48 — Follow-up chips uniquement sur DERNIER message assistant terminé */
      let followUps = '';
      if (idx === lastAssistantNonStreamingIdx && isFollowUpsEnabled()) {
        const lastUser = [...conversation].reverse().find((mm) => mm && mm.role === 'user')?.text;
        followUps = renderFollowUps(generateFollowUps(m.text, lastUser));
      }
      /* Pendant streaming : markdown light, hors : enrichi */
      const md = m.streaming ? renderMarkdownLight(m.text) : renderMarkdownEnriched(m.text);
      return `
        <div class="ax-msg ax-msg-${m.role} ax-modernized-msg ax-slide-up-fade" data-msg-id="${m.id}">
          <div class="ax-msg-body">${pills}${md}${trail}${actions}${followUps}</div>
        </div>
      `;
    })
    .join('');
  scroll.innerHTML = html;
  /* Smart scroll : ne force pas si user a scrollé volontairement haut */
  smartAutoScroll(rootEl);
  /* Wire markdown actions (copy code blocks) — idempotent */
  wireMarkdownActions(scroll);
}

export function render(rootEl: HTMLElement): void {
  /* v13.4.13 fix memory leak Kevin : si Kevin upload photo puis quitte chat
   * sans submit, base64 reste en mémoire. Reset queues au remount = clean state.
   * Trade-off documenté : Kevin perd ses attachments en attente s'il navigue
   * ailleurs puis revient — acceptable car action explicite de navigation. */
  pendingAttachments = [];
  pendingAttachmentPromises = [];

  const user = store.get('user');
  /* Feature toggle module.chat (Kevin règle ON/OFF général + per-user, 2026-05-04).
     Si désactivée pour ce user, afficher notice. Admin Kevin bypass via per-user override. */
  if (!isFeatureEnabled('module.chat', user?.id)) {
    rootEl.innerHTML = renderDisabledNotice('module.chat');
    return;
  }

  /* v13.4.10 fix Kevin "continue recommence à zéro" : restore Firebase conversation
   * si localStorage vide (cache PWA clear iOS). Async non-bloquant, re-render après. */
  if (conversation.length === 0) {
    void tryFirebaseRestoreConversation().then(() => {
      if (conversation.length > 0) {
        try {
          renderMessages(rootEl);
        } catch { /* skip */ }
      }
    });
  }

  /* v13.4.45 fix Kevin "Apex doit toujours terminer son travail sans s'arrêter" :
   * Wire stream-partial-saver getResumeCandidate au boot. Si Apex avait une réponse
   * en cours interrompue (crash, background-kill iOS, network drop), proposer reprise. */
  void (async () => {
    try {
      const { streamPartialSaver } = await import('../../services/stream-partial-saver.js');
      const candidate = streamPartialSaver.getResumeCandidate();
      if (candidate && candidate.partial_text) {
        /* Push message partial dans conversation comme "assistant interrompu" */
        const restoredMsg: DisplayMessage = {
          id: `a_resume_${Date.now()}`,
          role: 'assistant',
          text: candidate.partial_text + '\n\n_[💡 Réponse interrompue. Tape "continue" pour reprendre.]_',
          ts: candidate.ts_last_chunk,
        };
        conversation.push(restoredMsg);
        renderMessages(rootEl);
        logger.info('chat', `📡 Stream partial resume : ${candidate.partial_text.length} chars depuis ${candidate.provider}`);
        /* Marque comme déjà restoré (évite double-restore au prochain mount) */
        streamPartialSaver.discard();
      }
    } catch (err: unknown) {
      logger.debug('chat', 'stream resume check failed (no resume candidate)', { err });
    }
  })();
  const greeting = user ? `Bonjour ${user.name}, qu'est-ce que je peux faire pour toi ?` : 'Bienvenue dans Apex.';

  const isAdmin = store.get('isAdmin');
  const hasKey = aiRouter.hasAnyKey();

  rootEl.innerHTML = cspStyleHelper.withNonce(`
    <style>
      /* v13.3.80 Kevin 2026-05-08 19:55: bandeau ULTRA-MIN — max visibilité chat */
      .ax-chat-header {
        background: linear-gradient(180deg,rgba(20,20,35,0.95),rgba(14,14,28,0.85));
        backdrop-filter: blur(20px) saturate(140%);
        -webkit-backdrop-filter: blur(20px) saturate(140%);
        border-bottom: 1px solid rgba(255,255,255,0.06);
        padding: 2px 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 4px;
        position: sticky;
        top: 0;
        z-index: 50;
        padding-top: max(2px, env(safe-area-inset-top, 0px));
        min-height: 26px;
      }
      .ax-chat-header h1 {
        margin: 0;
        font-size: 12px;
        font-weight: 700;
        background: linear-gradient(135deg,#c9a227 0%,#e8b830 50%,#f5cc4a 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-family: Georgia, serif;
        letter-spacing: 0.8px;
        line-height: 1;
      }
      .ax-chat-header .ax-btn-icon {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.85);
        width: 24px;
        height: 24px;
        min-width: 24px;
        border-radius: 7px;
        font-size: 11px;
        cursor: pointer;
        transition: background 160ms;
        -webkit-tap-highlight-color: transparent;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .ax-chat-header .ax-btn-icon:hover {
        background: rgba(232,184,48,0.12);
        border-color: rgba(232,184,48,0.3);
      }
      .ax-chat-greeting {
        text-align: center;
        padding: 6px 14px 4px;
        font-size: 12px;
        font-weight: 500;
        color: rgba(255,255,255,0.78);
        font-family: Georgia, serif;
        line-height: 1.25;
        animation: ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) backwards;
      }
      .ax-chat-greeting::after {
        content: '';
        display: block;
        width: 24px;
        height: 1px;
        background: linear-gradient(90deg,transparent,#e8b830,transparent);
        margin: 4px auto 0;
        opacity: 0.5;
      }
      .ax-info-card {
        background: linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(232,184,48,0.18);
        border-radius: 12px;
        padding: 12px 14px;
        animation: ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) backwards;
      }
      .ax-info-card h3 {
        margin: 0 0 6px;
        font-size: 14px;
        font-weight: 700;
        color: #e8b830;
        letter-spacing: -0.01em;
      }
      .ax-info-card p {
        margin: 0 0 10px;
        color: rgba(255,255,255,0.65);
        font-size: 12.5px;
        line-height: 1.45;
      }
      /* Bouton scroll-to-bottom flottant style Claude Code (v13.3.72) */
      .ax-scroll-bottom-fab {
        position: absolute;
        right: 14px;
        bottom: 96px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(20,20,35,0.85);
        border: 1px solid rgba(232,184,48,0.35);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        color: #e8b830;
        font-size: 16px;
        cursor: pointer;
        opacity: 0;
        transform: translateY(8px) scale(0.92);
        pointer-events: none;
        transition: all 180ms cubic-bezier(0.16,1,0.3,1);
        z-index: 40;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      }
      .ax-scroll-bottom-fab.visible {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      .ax-scroll-bottom-fab:hover { background: rgba(232,184,48,0.15); }
      @keyframes ax-fade-up {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .ax-msg.ax-modernized-msg {
        animation: ax-fade-up 240ms cubic-bezier(0.16,1,0.3,1);
      }
      @media (prefers-reduced-motion: reduce) {
        .ax-chat-greeting, .ax-info-card, .ax-modernized-msg { animation: none !important; }
      }
    </style>
    <div class="ax-chat ax-modernized-card">
      <header class="ax-chat-header">
        <h1 id="ax-chat-logo" title="Long-press 3s pour Diagnostic admin" style="cursor:pointer;-webkit-tap-highlight-color:transparent">APEX</h1>
        <div style="display:flex;gap:4px;align-items:center">
          <button class="ax-btn ax-btn-icon" id="ax-chat-clear" aria-label="Effacer chat" title="Effacer le chat (conversation courante)">🗑</button>
          <button class="ax-btn ax-btn-icon" id="ax-chat-menu" aria-label="Menu" title="Menu">☰</button>
        </div>
      </header>
      <div style="position:relative;flex:1;display:flex;flex-direction:column;min-height:0">
      <div class="ax-chat-scroll" role="log" aria-live="polite" aria-atomic="false">
        ${conversation.length === 0 ? `<div class="ax-chat-greeting">${escapeHtml(greeting)}</div>` : ''}
        ${!hasKey ? `
          <div class="ax-info-card ax-modernized-card" style="margin:4px 8px;padding:8px 10px">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <span style="font-size:12px;color:#e8b830;font-weight:600">🔑 Pas de clé API</span>
              <button class="ax-btn ax-btn-primary" id="ax-paste-key" style="background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;padding:5px 12px;border-radius:8px;font-weight:700;cursor:pointer;font-size:12px;min-height:32px;-webkit-tap-highlight-color:transparent">📋 Coller</button>
              <span style="font-size:11px;color:rgba(255,255,255,0.5)">Anthropic / OpenAI / Groq / Gemini</span>
            </div>
          </div>
        ` : ''}
        ${conversation.length === 0 && hasKey ? `
          <div class="ax-chat-chips" role="group" aria-label="Suggestions rapides">
            <button type="button" class="ax-chat-chip" data-chip-text="Aide-moi à mixer une musique">🎚 Mixe une musique</button>
            <button type="button" class="ax-chat-chip" data-chip-text="Plan ma semaine">📅 Plan ma semaine</button>
            <button type="button" class="ax-chat-chip" data-chip-text="/web ">🔍 Cherche sur le web</button>
            <button type="button" class="ax-chat-chip" data-chip-text="Lance un audit complet">💼 Audit pro</button>
          </div>
        ` : ''}
      </div>
      <button type="button" class="ax-scroll-bottom-fab" id="ax-scroll-bottom" aria-label="Aller en bas" title="Aller en bas">↓</button>
      </div>
      <form class="ax-chat-input" id="ax-chat-form">
        <textarea
          id="ax-chat-text"
          rows="1"
          placeholder="Demande, dicte ou colle…"
          aria-label="Message"
          autocomplete="off"
        ></textarea>
        <button type="button" class="ax-btn ax-btn-icon ax-icon-compact" id="ax-chat-mic" aria-label="Dictée vocale" title="Dictée vocale (Web Speech)">🎙</button>
        <button type="button" class="ax-btn ax-btn-icon ax-icon-compact" id="ax-chat-wake" aria-label="Activer Dis Apex" title="Wake word 'Dis Apex' actif/inactif">👂</button>
        <button type="button" class="ax-btn ax-btn-icon ax-icon-compact" id="ax-chat-attach" aria-label="Joindre fichier" title="Photo, vidéo, document, archive">📎</button>
        <button type="button" class="ax-btn ax-btn-icon ax-icon-compact" id="ax-chat-camera" aria-label="Ouvrir caméra" title="Caméra (photo, scan, QR, vidéo)" style="display:none">📷</button>
        <button type="submit" class="ax-btn ax-btn-primary ax-chat-send" aria-label="Envoyer">↑</button>
        <input type="file" id="ax-chat-file-input" aria-label="Joindre fichiers au message" multiple
          accept="image/*,video/*,audio/*,.pdf,.txt,.md,.json,.csv,.zip,.rar,.7z,.docx,.xlsx,.pptx"
          style="display:none">
      </form>
      <div id="ax-chat-attachments" style="display:none;padding:8px;border-top:1px solid var(--ax-border);background:rgba(201,162,39,0.05);overflow-x:auto;white-space:nowrap"></div>
      <nav class="ax-chat-nav" style="display:flex;gap:3px;padding:3px 4px;border-top:1px solid var(--ax-border);overflow-x:auto;background:var(--ax-bg-glass);-webkit-overflow-scrolling:touch">
        <button class="ax-btn ax-btn-sm" data-nav-route="chat" style="white-space:nowrap;min-height:30px;padding:4px 8px;font-size:11px">💬 Chat</button>
        <button class="ax-btn ax-btn-sm" data-nav-route="dashboard" style="white-space:nowrap;min-height:30px;padding:4px 8px;font-size:11px">📊 Dashboard</button>
        ${isAdmin ? '<button class="ax-btn ax-btn-sm" data-nav-route="admin" style="white-space:nowrap;min-height:30px;padding:4px 8px;font-size:11px">⚙️ Admin</button>' : ''}
        <button class="ax-btn ax-btn-sm" data-nav-route="vault" style="white-space:nowrap;min-height:30px;padding:4px 8px;font-size:11px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;font-weight:700">🔐 Coffre</button>
        <button class="ax-btn ax-btn-sm" data-nav-route="settings" style="white-space:nowrap;min-height:30px;padding:4px 8px;font-size:11px">🔧 Réglages</button>
        <button class="ax-btn ax-btn-sm" id="ax-paste-key-nav" style="white-space:nowrap;min-height:30px;padding:4px 8px;font-size:11px">🔑 Clé</button>
        <button class="ax-btn ax-btn-sm" id="ax-logout-nav" style="white-space:nowrap;min-height:30px;padding:4px 8px;font-size:11px;color:#ff6666">🚪 Déco</button>
      </nav>
      <footer style="text-align:center;padding:0 6px calc(env(safe-area-inset-bottom,0px));font-size:8px;color:var(--ax-text-muted);background:var(--ax-bg);flex-shrink:0;letter-spacing:0.2px;opacity:0.25;line-height:1;height:auto" title="${APP_VER} · DK">
        <span style="display:inline-block;width:4px;height:4px;border-radius:50%;background:#22c55e;vertical-align:middle"></span>
      </footer>
    </div>
  `);

  /* v13.3.72 Kevin: wire scroll-to-bottom FAB style Claude Code */
  wireScrollToBottomFab(rootEl);

  /* v13.4.3 Kevin 2026-05-09 — Suggestion chips (état vide) :
   * 4 chips cliquables qui injectent un texte préformé dans la textarea + focus.
   * Pas de submit auto — Kevin garde la main pour éditer/envoyer. */
  rootEl.querySelectorAll<HTMLButtonElement>('.ax-chat-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const ta = rootEl.querySelector<HTMLTextAreaElement>('#ax-chat-text');
      if (!ta) return;
      const text = chip.dataset['chipText'] ?? '';
      ta.value = text;
      ta.focus();
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
      /* Place caret à la fin pour les chips type "/web " (espace final). */
      const len = text.length;
      try { ta.setSelectionRange(len, len); } catch { /* best-effort */ }
      haptic.tap();
    });
  });

  const form = rootEl.querySelector<HTMLFormElement>('#ax-chat-form');
  const textarea = rootEl.querySelector<HTMLTextAreaElement>('#ax-chat-text');
  if (form && textarea) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = textarea.value.trim();
      if (!value) return;
      /* v13.3.79 (Kevin 2026-05-08) — Wake word texte trigger AVANT slash :
       * "dis apex" / "ok apex" / "hey apex" tapés → activate voice mode,
       * PAS d'appel IA et PAS de "Plan A/B/C". */
      if (handleWakeWordTextTrigger(rootEl, value)) {
        textarea.value = '';
        textarea.style.height = 'auto';
        hideSlashAutocomplete(rootEl);
        return;
      }
      /* v13.3.48 — Slash commands d'abord (gratuit, instantané, pas d'appel IA) */
      if (handleSlashCommand(rootEl, value)) {
        textarea.value = '';
        textarea.style.height = 'auto';
        hideSlashAutocomplete(rootEl);
        return;
      }
      /* P0 SÉCU v13.0.78 Kevin "il s'affole pas reconnu" :
       * Bulk detect → store toutes clés trouvées (multi-line, .env, JSON OK) */
      void (async () => {
        const { detectAllCredentials } = await import('../../services/credential-patterns.js');
        const detected = detectAllCredentials(value);
        if (detected.length > 0) {
          textarea.value = '';
          textarea.style.height = 'auto';
          const { vault } = await import('../../services/vault.js');
          const result = await vault.autoStoreBulk(value);
          if (result.stored.length > 0) {
            /* v13.3.75 (Kevin screenshot): dedup les noms si Kevin colle plusieurs clés
             * du même provider (ex: 2× Anthropic) → "Anthropic ×2" au lieu de
             * "Anthropic, Anthropic". */
            const counts = new Map<string, number>();
            for (const s of result.stored) {
              counts.set(s.pattern.name, (counts.get(s.pattern.name) ?? 0) + 1);
            }
            const names = [...counts.entries()]
              .map(([name, count]) => count > 1 ? `${name} ×${count}` : name)
              .join(', ');
            toast.success(`🔑 ${result.stored.length} clé(s) chiffrée(s) AES-GCM-256 : ${names}`, { duration: 6000 });
            /* v13.4.102 — Vérification asynchrone push Firebase via vault-firebase-backup.
             * Pas attendre dans le toast principal (UX rapide), mais checker 4s après. */
            void (async () => {
              try {
                await new Promise((r) => setTimeout(r, 4000));
                const { vaultFirebaseBackup } = await import('../../services/vault-firebase-backup.js');
                const fbList = await vaultFirebaseBackup.listAll();
                const fbKeys = new Set(fbList.map((e) => e.key));
                const storedKeys = result.stored.map((s) => `ax_${s.pattern.name.toLowerCase().replace(/\s+/g, '_')}_key`);
                const fbOk = storedKeys.filter((k) => fbKeys.has(k)).length;
                if (fbOk === storedKeys.length) {
                  toast.info(`💾 Firebase backup OK : ${fbOk}/${storedKeys.length} clés sauvegardées cross-device.`, { duration: 5000 });
                } else if (fbOk === 0) {
                  toast.warn(`🚨 Firebase backup KO : 0/${storedKeys.length} sauvegardées. Tes clés sont local-only — RISQUE perte au reinstall PWA.`, { duration: 10000 });
                } else {
                  toast.warn(`⚠️ Firebase backup partiel : ${fbOk}/${storedKeys.length}`, { duration: 7000 });
                }
              } catch { /* silent */ }
            })();
          }
          if (result.forbidden.length > 0) {
            const names = result.forbidden.map((f) => f.pattern.name).join(', ');
            toast.error(`🚫 ${names} JAMAIS stocké (sécu Kevin)`, { duration: 8000 });
          }
          if (result.failed > 0 && result.stored.length === 0) {
            toast.warn(`⚠️ ${result.failed} format inconnu — ouvre 🔐 Coffre pour coller manuellement`, { duration: 8000 });
          }
          return;
        }
        /* Pas de clé → message normal */
        textarea.value = '';
        textarea.style.height = 'auto';
        queue.push(value);
        void processQueue(rootEl);
        /* v13.3.19 — Bridge Apex → CMCteams (règle Kevin 2026-05-07 §8) :
         * détecte planning SBM collé dans le chat → push Firebase pour
         * que CMCteams (admin Kevin) propose un import 1-clic. */
        void (async () => {
          try {
            const { detectAndPushIfPlanning } = await import('../../services/cmc-planning-bridge.js');
            const r = await detectAndPushIfPlanning(value, 'chat');
            if (r && r.push.ok && r.push.id) {
              toast.info(`📋 Planning détecté → envoyé à CMCteams (id: ${r.push.id})`, { duration: 5000 });
            }
          } catch { /* non-bloquant */ }
        })();
      })();
    });
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      /* v13.3.48 — Slash autocomplete */
      const v = textarea.value;
      if (v.startsWith('/') && !v.includes('\n')) {
        showSlashAutocomplete(rootEl, v.slice(1));
      } else {
        hideSlashAutocomplete(rootEl);
      }
    });
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.requestSubmit();
      }
    });
    /* Auto-detect paste v13.3.9 fix Kevin "rien ne colle" :
     * v13.0.78 utilisait e.preventDefault() dans async IIFE = trop tard,
     * cassait le paste normal. Maintenant : laisse le paste happen,
     * détecte en background, si credential trouvé → clear async + store.
     *
     * v13.4.103 (Kevin "messages dupliqués 10x dans chat") :
     * Guard dataset.pasteWired pour ne wirer qu'UNE FOIS par textarea.
     * Avant : chaque re-render du chat ajoutait un nouveau listener →
     * un paste déclenchait N callbacks → N paste cards identiques.
     * Maintenant : 1 listener max par textarea. */
    if (textarea.dataset['pasteWired'] !== '1') {
      textarea.dataset['pasteWired'] = '1';
    textarea.addEventListener('paste', (e) => {
      const pasted = e.clipboardData?.getData('text')?.trim() ?? '';
      if (!pasted) return;
      /* PAS de preventDefault — le paste passe normalement (texte normal OK). */

      /* v13.4.14 — Détection type de paste (Kevin "visuel intelligent").
       * Code/URL → carte visuelle dans le chat avec actions buttons. */
      const kind = detectPasteKind(pasted);
      if (kind === 'code') {
        /* Extract language hint from ```lang ... ``` si présent */
        const m = pasted.match(/^```(\w+)?\n([\s\S]+?)\n```$/);
        const codeContent = m ? (m[2] ?? pasted) : pasted;
        const lang = m && m[1] ? m[1] : undefined;
        pushPasteCard(rootEl, 'code', codeContent, [
          {
            label: '💾 Sauver dans Coffre (Codes)',
            primary: true,
            onClick: () => {
              void (async () => {
                const r = await saveCodeSnippet(codeContent, lang);
                if (r.ok) {
                  /* Efface du textarea (déjà collé) ET supprime card */
                  textarea.value = '';
                  toast.success(`💾 Code sauvé dans Coffre (${codeContent.split('\n').length} lignes)`, { duration: 4000 });
                } else {
                  toast.error('Sauvegarde échouée', { duration: 3000 });
                }
              })();
            },
          },
          {
            label: '💬 Garder dans le chat',
            onClick: () => { /* no-op : laisse dans textarea pour envoi normal */ },
          },
        ]);
      } else if (kind === 'url') {
        pushPasteCard(rootEl, 'url', pasted, [
          {
            label: '🌐 Envoyer à l\'IA',
            primary: true,
            onClick: () => { /* laisse dans textarea, Kevin soumet normalement */ },
          },
        ]);
      }

      /* v13.3.19 — Bridge Apex → CMCteams sur paste (règle Kevin 2026-05-07 §8) */
      void (async () => {
        try {
          const { detectAndPushIfPlanning } = await import('../../services/cmc-planning-bridge.js');
          const r = await detectAndPushIfPlanning(pasted, 'paste');
          if (r && r.push.ok && r.push.id) {
            toast.info(`📋 Planning détecté → envoyé à CMCteams (id: ${r.push.id})`, { duration: 5000 });
          }
        } catch { /* non-bloquant */ }
      })();
      /* v13.4.96 — Paste Extractor universel (Kevin "TP réseaux sites n'apparaissent pas").
       * Complète detectAllCredentials + multi-source-analyze :
       * extrait URLs+social_handle+email+IBAN+phone+SIRET+VAT+BTC+ETH. */
      void (async () => {
        try {
          const { apexPasteExtractor } = await import('../../services/apex-paste-extractor.js');
          const r = apexPasteExtractor.extract(pasted);
          if (r.ok && r.total > 0) {
            /* Catégoriser pour affichage toast */
            const byType: Record<string, number> = {};
            for (const item of r.items) {
              byType[item.type] = (byType[item.type] ?? 0) + 1;
            }
            const summary = Object.entries(byType)
              .map(([t, n]) => `${n} ${t}`)
              .join(', ');
            if (r.stored) {
              toast.success(`🗂 ${r.total} éléments extraits : ${summary}`, { duration: 6000 });
            } else {
              toast.info(`🗂 ${r.total} éléments détectés (login admin pour stocker) : ${summary}`, { duration: 5000 });
            }
          }
        } catch { /* non-bloquant */ }
      })();
      void (async () => {
        const { detectAllCredentials } = await import('../../services/credential-patterns.js');
        const detected = detectAllCredentials(pasted);
        if (detected.length === 0) {
          /* v13.3.53 — Texte sans credential MAIS peut contenir URLs/emails/IPs : multi-source */
          if (/(https?:\/\/|@|\d+\.\d+\.\d+\.\d+|[0-9A-F]{2}[:-][0-9A-F]{2})/i.test(pasted) && pasted.length > 20) {
            try {
              const { multiSourceAnalyze } = await import('../../services/multi-source-analyze.js');
              const result = await multiSourceAnalyze.analyzeText(pasted);
              if (result.extracted_count > 0) {
                const r = await multiSourceAnalyze.installAll(result, { test: false });
                if (r.installed > 0) {
                  toast.info(`🔗 ${r.installed} élément(s) extrait(s) (URLs/emails/IPs)`, { duration: 5000 });
                }
              }
            } catch { /* non-bloquant */ }
          }
          return; /* Texte normal, on laisse */
        }
        /* Credential détecté : clear textarea (efface valeur visible) + chiffre */
        textarea.value = '';
        const { vault } = await import('../../services/vault.js');
        const result = await vault.autoStoreBulk(pasted);
        if (result.stored.length > 0) {
          /* v13.3.75 dedup names (cf. fix toast 1703) */
          const counts = new Map<string, number>();
          for (const s of result.stored) {
            counts.set(s.pattern.name, (counts.get(s.pattern.name) ?? 0) + 1);
          }
          const names = [...counts.entries()]
            .map(([name, count]) => count > 1 ? `${name} ×${count}` : name)
            .join(', ');
          toast.success(`🔑 ${result.stored.length} clé(s) chiffrée(s) auto AES-GCM-256 : ${names}`, { duration: 6000 });
        }
        if (result.forbidden.length > 0) {
          const names = result.forbidden.map((f) => f.pattern.name).join(', ');
          toast.error(`🚫 ${names} JAMAIS stocké (règle sécu)`, { duration: 8000 });
        }
        if (result.failed > 0 && result.stored.length === 0) {
          toast.warn(`Format inconnu — ouvre 🔐 Coffre pour coller manuellement`, { duration: 6000 });
        }
        /* v13.3.53 — Multi-source pour extraire AUSSI URLs/sites/emails de la même paste */
        try {
          const { multiSourceAnalyze } = await import('../../services/multi-source-analyze.js');
          const msResult = await multiSourceAnalyze.analyzeText(pasted);
          const sites = msResult.items.filter((it) => it.type === 'site');
          if (sites.length > 0) {
            await multiSourceAnalyze.installAll({ ...msResult, items: sites }, { test: false });
          }
        } catch { /* non-bloquant */ }
      })();
    });
    } /* v13.4.103 fermeture if (textarea.dataset['pasteWired'] !== '1') */
  }

  /* Mic handler : dictée vocale Web Speech API
   * Fix v13.3.23 (Kevin bug 19:10) :
   *  - 'aborted' et 'no-speech' = lifecycle iOS Safari, NE PAS afficher en erreur
   *  - Detection iOS : continuous=false + restart auto via onend
   *  - Permission micro check préalable + modal settings si denied
   *  - Log structuré ax_voice_log pour diagnostic admin */
  const micBtn = rootEl.querySelector<HTMLButtonElement>('#ax-chat-mic');
  let recognition: {
    start: () => void;
    stop: () => void;
    onresult: ((e: Event) => void) | null;
    onend: (() => void) | null;
    onerror: ((e: Event) => void) | null;
    onstart: ((e: Event) => void) | null;
    continuous: boolean;
    interimResults: boolean;
    lang: string;
  } | null = null;
  let recognitionActive = false;
  let dictationNoSpeechRetries = 0;
  const DICTATION_MAX_NO_SPEECH = 20;
  micBtn?.addEventListener('click', () => {
    haptic.tap();
    /* v13.3.81 Kevin 20:10 "le micro et dis apex ne fonctionnent plus" :
     * feedback IMMÉDIAT pour confirmer que le click est reçu (avant même les
     * checks async). Sans ce toast, Kevin ne sait pas si le bouton réagit. */
    toast.info('🎙 Activation dictée…', { duration: 1500 });
    const SR = (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown }).SpeechRecognition
            ?? (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;
    if (!SR) {
      toast.warn('Dictée vocale non supportée par ce navigateur (Safari iOS PWA limité). Utilise Chrome ou Safari classique.', { duration: 7000 });
      return;
    }
    if (recognitionActive && recognition) {
      recognition.stop();
      recognitionActive = false;
      micBtn.style.background = '';
      toast.info('Dictée arrêtée');
      return;
    }

    /* Pre-check permission micro (anti-blocage silencieux) */
    void (async () => {
      try {
        const { checkMicrophonePermission } = await import('../../services/voice-print.js');
        const perm = await checkMicrophonePermission();
        if (perm === 'denied') {
          toast.warn('🚫 Micro refusé après mise à jour. Réglages iOS > Safari (ou Apex) > Microphone → Autoriser, puis recharge.', {
            duration: 9000,
          });
          return;
        }
        if (perm === 'prompt') {
          toast.info('🎙 iOS va te demander la permission micro…', { duration: 3000 });
        }
        startDictation();
      } catch (err: unknown) {
        /* fallback : tente quand même + log raison */
        const reason = err instanceof Error ? err.message : 'unknown';
        toast.info(`🎙 Tentative directe (perm check : ${reason.slice(0, 30)})`);
        startDictation();
      }
    })();

    function pushDictationLog(evt: string, detail?: string): void {
      try {
        const KEY = 'ax_voice_log';
        const raw = localStorage.getItem(KEY);
        const arr: Array<{ ts: number; evt: string; src: string; detail?: string }> = raw
          ? (JSON.parse(raw) as Array<{ ts: number; evt: string; src: string; detail?: string }>)
          : [];
        const entry: { ts: number; evt: string; src: string; detail?: string } = { ts: Date.now(), evt, src: 'dictation' };
        if (detail !== undefined) entry.detail = detail;
        arr.push(entry);
        while (arr.length > 100) arr.shift();
        localStorage.setItem(KEY, JSON.stringify(arr));
      } catch {
        /* ignore */
      }
    }

    function isiOSSafari(): boolean {
      const ua = navigator.userAgent || '';
      if (/iPhone|iPad|iPod/.test(ua)) return true;
      return navigator.platform === 'MacIntel' && (navigator.maxTouchPoints ?? 0) > 1;
    }

    function startDictation(): void {
      try {
        recognition = new (SR as new () => typeof recognition)() as typeof recognition;
        if (!recognition) return;
        const isiOS = isiOSSafari();
        /* iOS Safari : continuous=true instable → false + restart via onend
         * Desktop Chrome/Firefox : continuous=false suffit pour 1 phrase dictée */
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'fr-FR';
        let lastFinalTranscript = '';
        let silenceTimer: ReturnType<typeof setTimeout> | null = null;
        const SILENCE_MS = 1500; /* 1.5s de silence après dernier mot → auto-submit */
        dictationNoSpeechRetries = 0;

        recognition.onstart = () => {
          pushDictationLog('start', isiOS ? 'iOS' : 'desktop');
        };

        recognition.onresult = (e: Event) => {
          const evt = e as Event & {
            results: { [key: number]: { [key: number]: { transcript: string }; isFinal: boolean } };
            resultIndex: number;
          };
          let transcript = '';
          let hasFinal = false;
          for (let i = evt.resultIndex; i < (evt.results as unknown as { length: number }).length; i++) {
            const result = evt.results[i];
            if (result?.[0]) {
              transcript += result[0].transcript;
              if (result.isFinal) hasFinal = true;
            }
          }
          const ta = rootEl.querySelector<HTMLTextAreaElement>('#ax-chat-text');
          if (ta) ta.value = transcript;
          /* Reset compteur dès qu'on capte du son */
          dictationNoSpeechRetries = 0;
          pushDictationLog(hasFinal ? 'result' : 'interim', transcript.slice(0, 80));
          if (hasFinal) {
            lastFinalTranscript = transcript;
            /* Reset silence timer à chaque mot final */
            if (silenceTimer) clearTimeout(silenceTimer);
            silenceTimer = setTimeout(() => {
              /* Auto-submit après silence Kevin règle "envoie la question automatiquement" */
              if (lastFinalTranscript.trim().length > 0 && recognitionActive) {
                try { recognition?.stop(); } catch { /* ignore */ }
                const form = rootEl.querySelector<HTMLFormElement>('#ax-chat-form');
                form?.requestSubmit();
              }
            }, SILENCE_MS);
          }
        };
        recognition.onend = () => {
          pushDictationLog('end');
          recognitionActive = false;
          if (micBtn) micBtn.style.background = '';
          if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }
          /* Si dictée stoppée et texte final non-envoyé, auto-submit */
          const ta = rootEl.querySelector<HTMLTextAreaElement>('#ax-chat-text');
          if (lastFinalTranscript.trim().length > 0 && ta && ta.value.trim() === lastFinalTranscript.trim()) {
            const form = rootEl.querySelector<HTMLFormElement>('#ax-chat-form');
            form?.requestSubmit();
          }
        };
        recognition.onerror = (e: Event) => {
          const errEvt = e as Event & { error?: string };
          const err = errEvt.error ?? 'inconnu';
          pushDictationLog('error', err);
          /* Erreurs lifecycle normal iOS Safari → silencieuses (PAS de toast) */
          if (err === 'aborted') {
            /* Aborted : auto-stop iOS après silence ou re-tap user → silencieux */
            return;
          }
          if (err === 'no-speech') {
            dictationNoSpeechRetries++;
            if (dictationNoSpeechRetries < DICTATION_MAX_NO_SPEECH) {
              /* Pas affiché — onend va relancer ou stop normal */
              return;
            }
            /* Trop de no-speech : message gentil */
            toast.warn('🤫 Pas entendu — réessaye en parlant plus fort', { duration: 4000 });
            recognitionActive = false;
            if (micBtn) micBtn.style.background = '';
            return;
          }
          /* Permission denied : guide settings iOS */
          if (err === 'not-allowed' || err === 'service-not-allowed') {
            toast.warn('🚫 Micro refusé — Réglages iOS > Safari > Microphone', { duration: 7000 });
            recognitionActive = false;
            if (micBtn) micBtn.style.background = '';
            return;
          }
          /* Autres erreurs (audio-capture, network, language-not-supported) : afficher */
          toast.warn(`Dictée erreur : ${err}`);
          recognitionActive = false;
          if (micBtn) micBtn.style.background = '';
        };
        recognition.start();
        recognitionActive = true;
        if (micBtn) micBtn.style.background = 'linear-gradient(135deg,#ff4444,#cc2222)';
        haptic.medium();
        toast.success('🎙 Parle maintenant — re-tap 🎙 pour arrêter');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'erreur';
        pushDictationLog('error', `start: ${msg}`);
        toast.warn(`Dictée fail : ${msg}`);
      }
    }
  });

  /* Wake word "Dis Apex" : SpeechRecognition continuous (fix v13.3.23 Kevin bug 19:10)
   * - Vérifie permission micro avant start (modal settings si denied)
   * - Affiche transcript live dans textarea (preview avant détection wake)
   * - Erreurs 'aborted'/'no-speech' silencieuses (lifecycle iOS) */
  const wakeBtn = rootEl.querySelector<HTMLButtonElement>('#ax-chat-wake');
  wakeBtn?.addEventListener('click', () => {
    haptic.tap();
    void (async () => {
      try {
        const { voicePrint, checkMicrophonePermission } = await import('../../services/voice-print.js');
        if (!voicePrint.isSupported()) {
          toast.warn('Wake word non supporté par ton navigateur');
          return;
        }
        if (voicePrint.isListening()) {
          voicePrint.stopWakeWord();
          if (wakeBtn) wakeBtn.style.background = '';
          toast.success('Wake word arrêté');
          return;
        }
        /* Pre-check permission micro */
        const perm = await checkMicrophonePermission();
        if (perm === 'denied') {
          toast.warn('🚫 Micro refusé — autorise dans Réglages iOS > Apex > Microphone', {
            duration: 7000,
          });
          return;
        }
        /* Optionnel : feedback live de la transcription dans le textarea (user voit que ça marche) */
        voicePrint.onWakeInterim((transcript: string, isFinal: boolean) => {
          const ta = rootEl.querySelector<HTMLTextAreaElement>('#ax-chat-text');
          if (ta && transcript && ta.dataset['wakeInterim'] === '1') {
            ta.placeholder = isFinal
              ? `🎙 ${transcript.slice(0, 60)}`
              : `🎙 ${transcript.slice(0, 60)}…`;
          }
        });
        const r = voicePrint.startWakeWord((transcript: string) => {
          const ta = rootEl.querySelector<HTMLTextAreaElement>('#ax-chat-text');
          if (ta) {
            ta.value = transcript;
            ta.placeholder = '';
            const form = rootEl.querySelector<HTMLFormElement>('#ax-chat-form');
            form?.requestSubmit();
          }
        });
        if (r.ok && wakeBtn) {
          wakeBtn.style.background = 'linear-gradient(135deg,#22cc77,#1a9a5a)';
          const ta = rootEl.querySelector<HTMLTextAreaElement>('#ax-chat-text');
          if (ta) ta.dataset['wakeInterim'] = '1';
          toast.success('👂 "Dis Apex" actif — parle quand tu veux');
        } else {
          toast.warn(`Wake word fail : ${r.reason ?? 'inconnu'}`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'erreur';
        toast.warn(`Wake word erreur : ${msg}`);
      }
    })();
  });

  /* File attach : input file + drag-drop + paste image clipboard */
  const attachBtn = rootEl.querySelector<HTMLButtonElement>('#ax-chat-attach');
  const fileInput = rootEl.querySelector<HTMLInputElement>('#ax-chat-file-input');
  const attachmentsDiv = rootEl.querySelector<HTMLDivElement>('#ax-chat-attachments');
  attachBtn?.addEventListener('click', () => {
    haptic.tap();
    fileInput?.click();
  });

  const renderAttachment = (file: File): void => {
    if (!attachmentsDiv) return;
    attachmentsDiv.style.display = 'block';
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    const icon = file.type.startsWith('image/') ? '🖼️'
      : file.type.startsWith('video/') ? '🎬'
      : file.type.startsWith('audio/') ? '🎵'
      : file.type.includes('pdf') ? '📄'
      : file.type.includes('zip') || file.type.includes('rar') || file.type.includes('7z') ? '📦'
      : '📎';
    const div = document.createElement('div');
    div.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:6px 10px;background:rgba(201,162,39,0.1);border:1px solid rgba(201,162,39,0.3);border-radius:6px;margin-right:6px;font-size:12px;color:#c9a227';
    /* P0 SECU XSS : escape file.name (vient de file picker = source externe) — textContent OK */
    const truncName = file.name.length > 30 ? `${file.name.slice(0, 30)}...` : file.name;
    const labelSpan = document.createElement('span');
    labelSpan.textContent = `${icon} ${truncName} (${sizeMB} MB)`;
    div.appendChild(labelSpan);
    /* v13.4.12 — Bouton ✕ remove : retire de pendingAttachments + supprime chip.
     * Si Kevin attache par erreur, peut annuler avant submit. */
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.setAttribute('aria-label', `Retirer ${truncName}`);
    removeBtn.style.cssText = 'background:transparent;border:none;color:#c9a227;cursor:pointer;font-size:14px;padding:0 2px;line-height:1';
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      /* Retire de pendingAttachments par match name+mime (cas réaliste : noms uniques) */
      pendingAttachments = pendingAttachments.filter((a) => !(a.name === file.name && a.mime === file.type));
      div.remove();
      /* Si plus aucune chip → masquer la div */
      if (attachmentsDiv.children.length === 0) attachmentsDiv.style.display = 'none';
      haptic.tap();
    });
    div.appendChild(removeBtn);
    attachmentsDiv.appendChild(div);
  };

  /**
   * Album rendu visuel : push grille d'images dans chat scroll + click → lightbox.
   * Kevin règle 2026-05-07 : "je veux le visuel pas une liste d'écriture".
   */
  const pushAlbumToChat = (images: AlbumImage[]): void => {
    const scroll = rootEl.querySelector<HTMLElement>('.ax-chat-scroll');
    if (!scroll || images.length === 0) return;
    const card = document.createElement('div');
    card.className = 'ax-msg ax-msg-user ax-slide-up-fade';
    card.innerHTML = `<div class="ax-msg-body">${renderImageAlbum(images)}</div>`;
    scroll.appendChild(card);
    scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' });
    /* Wire click sur chaque thumbnail → lightbox */
    card.querySelectorAll<HTMLElement>('.ax-album-item').forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const idxStr = thumb.dataset['imgIdx'] ?? '0';
        const idx = parseInt(idxStr, 10);
        const img = images[idx];
        if (img) openImageLightbox(rootEl, img);
      });
    });
  };

  fileInput?.addEventListener('change', () => {
    const files = Array.from(fileInput.files ?? []);
    if (files.length === 0) return;
    haptic.success();
    /* Collecte images pour rendre album visuel (Kevin "visuel pas liste") */
    const albumImages: AlbumImage[] = [];
    for (const file of files) {
      renderAttachment(file);
      if (file.type.startsWith('image/')) {
        try {
          const url = URL.createObjectURL(file);
          albumImages.push({ url, filename: file.name });
        } catch { /* ignore createObjectURL fail */ }
        /* v13.4.11/12 fix Kevin "Apex aveugle aux pièces jointes" :
         * Lire base64 et push dans pendingAttachments — l'IA recevra l'image
         * dans son context array Anthropic au prochain submit.
         * v13.4.12 : trackée dans pendingAttachmentPromises pour await submit
         * (anti race condition si Kevin submit avant que FileReader termine). */
        const readPromise = (async () => {
          try {
            const b64 = await new Promise<string>((resolve, reject) => {
              const r = new FileReader();
              r.onload = () => resolve(r.result as string);
              r.onerror = () => reject(new Error('FileReader error'));
              r.readAsDataURL(file);
            });
            /* Cap 5MB par image (limite Anthropic + perf) */
            if (file.size > 5 * 1024 * 1024) {
              toast.warn(`📷 ${file.name} > 5MB, IA ne le verra pas (display only)`, { duration: 5000 });
            } else {
              pendingAttachments.push({ mime: file.type, base64: b64, name: file.name });
            }
          } catch (err: unknown) {
            logger.warn('chat', 'pendingAttachments push failed', { err, file: file.name });
          }
        })();
        pendingAttachmentPromises.push(readPromise);
        /* Auto-cleanup quand terminée : retire du tableau pour éviter accumulation */
        void readPromise.finally(() => {
          pendingAttachmentPromises = pendingAttachmentPromises.filter((p) => p !== readPromise);
        });
        /* v13.3.51 — Auto-vision device sur upload image */
        void autoAnalyzeDeviceImage(file, rootEl);
        /* v13.3.53 — Multi-Source EXHAUSTIVE extraction (Kevin règle 2026-05-07 23h55) :
         * "1 source peut contenir N éléments — extraire TOUT + étudier + tester + installer".
         * Image upload → Claude Vision → credentials/URLs/IPs/MACs/device IDs → vault + linksRegistry. */
        void (async () => {
          try {
            const reader = new FileReader();
            reader.onload = async () => {
              const dataUrl = reader.result as string;
              const { multiSourceAnalyze } = await import('../../services/multi-source-analyze.js');
              toast.info('🔍 Analyse multi-source en cours...', { duration: 3000 });
              const result = await multiSourceAnalyze.analyzeImage(dataUrl);
              if (result.extracted_count === 0) return;
              const installRes = await multiSourceAnalyze.installAll(result, { test: true });
              const safe = result.extracted_count - result.items.filter((it) => it.forbidden).length;
              const msg = `✅ ${installRes.installed}/${safe} installés · ${installRes.tested_ok} testés OK${installRes.failed.length ? ` · ${installRes.failed.length} fail` : ''}`;
              toast.success(msg, { duration: 8000 });
            };
            reader.readAsDataURL(file);
          } catch (err) {
            logger.warn('chat', 'multi-source analyze image failed', { err });
          }
        })();
      }
      void (async () => {
        try {
          const { fileConverter } = await import('../../services/file-converter.js');
          const r = await fileConverter.ingest(file, 'admin');
          if (r.ok) toast.success(`✅ ${file.name} ingéré`);
          else toast.warn(`Ingest fail : ${r.reason ?? file.name}`);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'erreur';
          toast.warn(`File error : ${msg}`);
        }
      })();
    }
    if (albumImages.length > 0) pushAlbumToChat(albumImages);
    fileInput.value = '';
  });

  /* Drag & drop sur zone chat */
  const chatBody = rootEl.querySelector<HTMLElement>('.ax-chat-body, #ax-chat-form');
  if (chatBody) {
    chatBody.addEventListener('dragover', (e) => {
      e.preventDefault();
      chatBody.style.background = 'rgba(201,162,39,0.1)';
    });
    chatBody.addEventListener('dragleave', () => {
      chatBody.style.background = '';
    });
    chatBody.addEventListener('drop', (e) => {
      e.preventDefault();
      chatBody.style.background = '';
      const dropEvent = e as DragEvent;
      const files = Array.from(dropEvent.dataTransfer?.files ?? []);
      for (const file of files) {
        renderAttachment(file);
        if (file.type.startsWith('image/')) {
          /* v13.3.51 — Auto-vision device sur drop image */
          void autoAnalyzeDeviceImage(file, rootEl);
        }
        void (async () => {
          try {
            const { fileConverter } = await import('../../services/file-converter.js');
            await fileConverter.ingest(file, 'admin');
            toast.success(`📎 ${file.name} ajouté`);
          } catch { /* ignore */ }
        })();
      }
    });
  }

  /* Paste image/file depuis clipboard (Ctrl+V image) */
  const ta2 = rootEl.querySelector<HTMLTextAreaElement>('#ax-chat-text');
  ta2?.addEventListener('paste', (e: ClipboardEvent) => {
    const items = e.clipboardData?.items ?? [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item) continue;
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          renderAttachment(file);
          if (file.type.startsWith('image/')) {
            /* v13.3.51 — Auto-vision device sur paste clipboard image (Kevin "rien fait") */
            void autoAnalyzeDeviceImage(file, rootEl);
          }
          void (async () => {
            try {
              const { fileConverter } = await import('../../services/file-converter.js');
              await fileConverter.ingest(file, 'admin');
              toast.success(`📋 ${file.name || 'media collé'} ajouté`);
            } catch { /* ignore */ }
          })();
        }
      }
    }
  });

  /* Camera handler (P0 audit gap : wire smart-camera réel) */
  const cameraBtn = rootEl.querySelector<HTMLButtonElement>('#ax-chat-camera');
  cameraBtn?.addEventListener('click', () => {
    haptic.tap();
    void (async () => {
      try {
        const { smartCamera } = await import('../../services/smart-camera.js');
        const { adminPrompt } = await import('../../services/admin-prompt.js');
        const mode = await adminPrompt.askChoice('📷 Caméra', 'Choisis le mode :', [
          { id: 'single', label: 'Photo simple', emoji: '📷', variant: 'primary' },
          { id: 'burst', label: 'Rafale (5 photos)', emoji: '⚡', variant: 'ghost' },
          { id: 'qr_live', label: 'Scanner QR/Code-barre', emoji: '⬛', variant: 'ghost' },
          { id: 'video_record', label: 'Enregistrer vidéo (30s)', emoji: '🎬', variant: 'ghost' },
        ]);
        if (!mode) return;
        if (mode === 'single') {
          const r = await smartCamera.captureSingle();
          if (!r.ok) {
            toast.error(r.reason ?? 'Capture échouée');
            return;
          }
          /* Affiche photo dans chat (data URL) */
          const dataUrl = r.dataUrls?.[0];
          if (dataUrl) {
            const scroll = rootEl.querySelector<HTMLElement>('.ax-chat-scroll');
            if (scroll) {
              const card = document.createElement('div');
              card.className = 'ax-msg ax-msg-user ax-slide-up-fade';
              /* P1 SECU XSS (audit v13.2.7) : dataUrl peut être malveillant
               * (ex: javascript: scheme via Web Capture exotique). Construire
               * via createElement + .src pour bloquer les schemes dangereux. */
              const img = document.createElement('img');
              img.alt = 'Capture caméra';
              img.style.maxWidth = '100%';
              img.style.borderRadius = '8px';
              /* Validation explicite scheme data:image/ uniquement */
              if (typeof dataUrl === 'string' && /^data:image\/[a-z+]+;base64,/i.test(dataUrl)) {
                img.src = dataUrl;
              } else if (typeof dataUrl === 'string' && /^https?:/.test(dataUrl)) {
                img.src = dataUrl;
              }
              card.appendChild(img);
              scroll.appendChild(card);
              scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' });
            }
            toast.success('Photo capturée');
          }
        } else if (mode === 'burst') {
          const r = await smartCamera.captureBurst(5, 200);
          toast.info(r.ok ? `${r.count} photos capturées` : (r.reason ?? 'Échec'));
        } else if (mode === 'qr_live') {
          await smartCamera.scanQrLive(
            (codes) => {
              for (const code of codes) toast.success(`📦 ${code.format}: ${code.rawValue.slice(0, 80)}`);
            },
            { durationMs: 15_000 },
          );
        } else if (mode === 'video_record') {
          const start = await smartCamera.startVideoRecord(30_000);
          if (!start.ok) {
            toast.error(start.reason ?? 'Recording impossible');
            return;
          }
          toast.info('🔴 Enregistrement 30s...');
          setTimeout(() => {
            void smartCamera.stopVideoRecord().then((stop) => {
              if (stop.ok) toast.success(`Vidéo ${Math.round((stop.blob?.size ?? 0) / 1024)}KB`);
            });
          }, 30_000);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Erreur caméra');
      }
    })();
  });

  /* v13.4.1 Kevin "SOS pas pertinent permanent" : long-press 3s logo APEX → Diagnostic admin.
   * Remplace le SOS visible permanent. Admin only ; sinon ne fait rien. */
  const logoEl = rootEl.querySelector<HTMLHeadingElement>('#ax-chat-logo');
  if (logoEl) {
    let pressTimer: number | null = null;
    const startPress = (): void => {
      if (pressTimer !== null) return;
      pressTimer = window.setTimeout(async () => {
        pressTimer = null;
        const isAdminUser = store.get('isAdmin');
        if (!isAdminUser) return; /* discret : long-press silencieux pour non-admin */
        haptic.tap();
        try {
          const { router } = await import('../../core/router.js');
          router.navigate('admin-health-dashboard');
        } catch {
          /* fallback : ouvrir diagnostic SOS direct si dashboard non chargeable */
          try {
            const { sosRescue } = await import('../../ui/sos-rescue.js');
            sosRescue.openDiagnosticDirect();
          } catch { /* ignore */ }
        }
      }, 3000);
    };
    const cancelPress = (): void => {
      if (pressTimer !== null) {
        window.clearTimeout(pressTimer);
        pressTimer = null;
      }
    };
    logoEl.addEventListener('mousedown', startPress);
    logoEl.addEventListener('mouseup', cancelPress);
    logoEl.addEventListener('mouseleave', cancelPress);
    logoEl.addEventListener('touchstart', startPress, { passive: true });
    logoEl.addEventListener('touchend', cancelPress);
    logoEl.addEventListener('touchcancel', cancelPress);
  }

  /* Menu hamburger ☰ : drawer modal avec navigation rapide
   * Fix Kevin v13.0.40 "le bouton paramètres et les trois traits ne fonctionnent pas" */
  const menuBtn = rootEl.querySelector<HTMLButtonElement>('#ax-chat-menu');
  menuBtn?.addEventListener('click', () => {
    haptic.tap();
    const isAdminUser = store.get('isAdmin');
    const sheet = modalSheet.open({
      title: '☰ Menu',
      content: `
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="ax-btn ax-btn-primary" data-menu-nav="chat" style="width:100%;text-align:left;padding:14px">💬 Chat</button>
          ${isAdminUser ? '<button class="ax-btn ax-btn-primary" data-menu-nav="admin" style="width:100%;text-align:left;padding:14px">👑 Centre Admin</button>' : ''}
          <button class="ax-btn ax-btn-primary" data-menu-nav="studios" style="width:100%;text-align:left;padding:14px">🎨 Studios</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="studio-music" style="width:100%;text-align:left;padding:14px">🎚 Mix Musique</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="studio-video" style="width:100%;text-align:left;padding:14px">🎬 Vidéo</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="studio-cv" style="width:100%;text-align:left;padding:14px">📄 CV</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="studio-invoice" style="width:100%;text-align:left;padding:14px">🧾 Facture</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="studio-contract" style="width:100%;text-align:left;padding:14px">📋 Contrat</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="pro" style="width:100%;text-align:left;padding:14px">💼 Pro</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="remote" style="width:100%;text-align:left;padding:14px">📡 Télécommande</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="browser" style="width:100%;text-align:left;padding:14px">🌐 Browser</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="domotique" style="width:100%;text-align:left;padding:14px">🏠 Domotique</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="workflow" style="width:100%;text-align:left;padding:14px">⚡ Workflows</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="crypto" style="width:100%;text-align:left;padding:14px">₿ Crypto</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="notes" style="width:100%;text-align:left;padding:14px">📝 Bloc-notes</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="calendar" style="width:100%;text-align:left;padding:14px">📅 Calendrier</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="calculators" style="width:100%;text-align:left;padding:14px">🧮 Calculatrices</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="archive" style="width:100%;text-align:left;padding:14px">🗄 Archive</button>
          ${isAdminUser ? '<button class="ax-btn ax-btn-primary" data-menu-nav="billing" style="width:100%;text-align:left;padding:14px">💳 Comptes &amp; Factures</button>' : ''}
          ${isAdminUser ? '<button class="ax-btn ax-btn-primary" data-menu-nav="sentinels" style="width:100%;text-align:left;padding:14px">🛡 Sentinelles</button>' : ''}
          <button class="ax-btn ax-btn-primary" data-menu-nav="settings" style="width:100%;text-align:left;padding:14px">⚙️ Réglages</button>
          <button class="ax-btn" data-menu-action="paste-key" style="width:100%;text-align:left;padding:14px">🔑 Coller une clé API</button>
          <button class="ax-btn" data-menu-action="logout" style="width:100%;text-align:left;padding:14px;color:#ff6666">🚪 Déconnexion</button>
        </div>
      `,
      actions: [
        { label: 'Fermer', variant: 'ghost', onClick: () => sheet.close() },
      ],
    });
    /* Wire boutons du drawer après render */
    setTimeout(() => {
      document.querySelectorAll<HTMLButtonElement>('[data-menu-nav]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const target = btn.dataset['menuNav'] ?? '';
          haptic.tap();
          sheet.close();
          if (target) location.hash = `#${target}`;
        });
      });
      document.querySelectorAll<HTMLButtonElement>('[data-menu-action]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const action = btn.dataset['menuAction'] ?? '';
          haptic.tap();
          sheet.close();
          if (action === 'paste-key') {
            /* Trigger paste flow réutilisant la modal existante */
            rootEl.querySelector<HTMLButtonElement>('#ax-paste-key-nav')?.click();
          } else if (action === 'logout') {
            rootEl.querySelector<HTMLButtonElement>('#ax-logout-nav')?.click();
          }
        });
      });
    }, 50);
  });

  /* v13.3.78 Kevin: bouton 🗑 effacer chat (conversation courante) */
  const clearBtn = rootEl.querySelector<HTMLButtonElement>('#ax-chat-clear');
  clearBtn?.addEventListener('click', () => {
    haptic.tap();
    if (!confirm('🗑 Effacer le chat actuel ?\n\nLes messages sont supprimés localement. La conversation persistante (Firebase) reste intacte.')) return;
    /* Clear conversation in-memory + UI */
    conversation.length = 0;
    /* Clear persisted local */
    try {
      const uid = (store.get('user') as { id?: string } | null)?.id ?? 'anon';
      localStorage.removeItem(`apex_v13_chat_messages_${uid}`);
      localStorage.removeItem(`apex_v13_chat_pending_${uid}`);
    } catch { /* ignore quota */ }
    renderMessages(rootEl);
    void import('../../ui/toast.js').then(({ toast }) => {
      toast.success('🗑 Chat effacé', { duration: 2500 });
    });
  });

  /* Bouton Paramètres ⚙️ : ouvre modal settings (clés API + mode routing + reco)
   * Fix Kevin v13.0.40 "rien ne se passe quand on tape sur paramètres" */
  const settingsBtn = rootEl.querySelector<HTMLButtonElement>('#ax-chat-settings');
  if (!settingsBtn) {
    /* Fallback : event delegation si bouton pas wired (ex: re-render) */
    rootEl.addEventListener('click', (e) => {
      const t = e.target as HTMLElement;
      if (t.closest('#ax-chat-settings')) {
        location.hash = '#settings';
      }
    });
  }
  settingsBtn?.addEventListener('click', () => {
    haptic.tap();
    void (async () => {
      try {
        const { aiRoutingPolicy } = await import('../../services/ai-routing-policy.js');
        const status = aiRoutingPolicy.getStatus();
        const recos = aiRoutingPolicy.recommendActions();
        const recosHtml = recos.length
          ? recos
              .map(
                (r) => `
              <li style="margin:4px 0">
                <span style="color:${r.priority === 'high' ? '#ff6666' : r.priority === 'medium' ? '#ffaa00' : '#a0a4c0'}">●</span>
                ${escapeHtml(r.action)}
                ${r.url ? ` <a href="${escapeHtml(r.url)}" target="_blank" rel="noopener" style="color:#c9a227">→</a>` : ''}
              </li>
            `,
              )
              .join('')
          : '<li style="color:#22cc77">✅ Tout est configuré au mieux</li>';
        const sheet = modalSheet.open({
          title: '⚙️ Paramètres',
          content: `
            <div style="display:flex;flex-direction:column;gap:14px">
              <div>
                <h4 style="margin:0 0 6px;color:#c9a227">Routing IA</h4>
                <label style="display:block;margin:6px 0">
                  Mode :
                  <select id="ax-settings-mode" style="margin-left:8px;padding:6px;background:#1a1a2e;color:#fff;border:1px solid #c9a227;border-radius:4px">
                    <option value="auto" ${status.mode === 'auto' ? 'selected' : ''}>Auto (intelligent)</option>
                    <option value="economy" ${status.mode === 'economy' ? 'selected' : ''}>Économie (gratuit d'abord)</option>
                    <option value="premium" ${status.mode === 'premium' ? 'selected' : ''}>Premium (Anthropic toujours)</option>
                  </select>
                </label>
                <p style="margin:6px 0;color:#a0a4c0;font-size:12px">
                  Anthropic : <span style="color:${status.anthropic_health === 'ok' ? '#22cc77' : status.anthropic_health === 'warn' ? '#ffaa00' : '#ff6666'}">${status.anthropic_health}</span>
                  · Gratuits dispo : ${status.free_providers_available.length}
                  · Payants dispo : ${status.paid_providers_available.length}
                </p>
              </div>
              <div>
                <h4 style="margin:0 0 6px;color:#c9a227">Clés API</h4>
                <button type="button" class="ax-btn ax-btn-primary" id="ax-settings-paste-key" style="width:100%">🔑 Coller une clé API</button>
              </div>
              <div>
                <h4 style="margin:0 0 6px;color:#c9a227">Recommandations</h4>
                <ul style="margin:0;padding-left:18px;font-size:13px">${recosHtml}</ul>
              </div>
            </div>
          `,
          actions: [
            { label: 'Fermer', variant: 'ghost', onClick: () => sheet.close() },
          ],
        });
        /* Wire mode select + paste-key trigger */
        setTimeout(() => {
          const modeSelect = document.getElementById('ax-settings-mode') as HTMLSelectElement | null;
          modeSelect?.addEventListener('change', () => {
            const newMode = modeSelect.value as 'auto' | 'economy' | 'premium' | 'forced';
            aiRoutingPolicy.setMode(newMode);
            toast.success(`Mode routing : ${newMode}`);
            haptic.medium();
          });
          const pasteBtn = document.getElementById('ax-settings-paste-key') as HTMLButtonElement | null;
          pasteBtn?.addEventListener('click', () => {
            sheet.close();
            rootEl.querySelector<HTMLButtonElement>('#ax-paste-key-nav')?.click();
          });
        }, 50);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'erreur';
        toast.error(`Paramètres indisponibles : ${msg}`);
      }
    })();
  });

  /* Paste API key handler avec auto-detect 130+ patterns + auto-test + auto-link
   * Path A repensé : modal-sheet half-bottom au lieu de prompt/alert bloquants */
  const attachPasteKey = (sel: string) => {
    const btn = rootEl.querySelector<HTMLButtonElement>(sel);
    btn?.addEventListener('click', () => {
      haptic.tap();
      const sheet = modalSheet.open({
        title: '🔑 Coller ta clé API',
        content: `
          <p style="margin:0 0 12px;color:var(--ax-text-dim)">
            Apex détecte automatiquement le service (Anthropic, OpenAI, Stripe, GitHub, etc.) et la range au bon endroit.
          </p>
          <button type="button" id="ax-paste-clipboard-btn"
            style="width:100%;padding:12px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;margin-bottom:12px;-webkit-tap-highlight-color:transparent">
            📋 Coller automatiquement depuis presse-papiers
          </button>
          <textarea id="ax-paste-input" rows="4"
            placeholder="Ou colle ici manuellement (long press → Coller)"
            style="width:100%;padding:14px;background:#1a1a2e;border:2px solid #c9a227;border-radius:10px;color:#ffffff !important;-webkit-text-fill-color:#ffffff;font-family:'Courier New',monospace;font-size:14px;line-height:1.5;box-sizing:border-box;resize:vertical;min-height:90px"
            autofocus spellcheck="false" autocomplete="off"
            autocapitalize="off" autocorrect="off"
            inputmode="text"></textarea>
          <div id="ax-paste-preview" style="margin-top:8px;padding:8px;background:rgba(201,162,39,0.08);border-radius:6px;font-size:12px;color:#c9a227;display:none">
            <span id="ax-paste-detection"></span>
          </div>
          <p class="ax-muted" style="margin-top:8px">130+ patterns reconnus · 0 stockage des données interdites (CB, seed)</p>
        `,
        actions: [
          {
            label: 'Annuler',
            variant: 'ghost',
            onClick: () => {
              haptic.tap();
              sheet.close();
            },
          },
          {
            label: 'Coller + ranger',
            variant: 'primary',
            onClick: () => {
              const input = document.getElementById('ax-paste-input') as HTMLTextAreaElement | null;
              const value = input?.value.trim() ?? '';
              if (!value) {
                toast.warn('⚠️ Textarea vide — utilise "📋 Coller automatiquement" ou long press dans le rectangle blanc');
                return;
              }
              sheet.close();
              void (async () => {
                const result = await vault.autoStore(value);
                if (result.forbidden) {
                  haptic.error();
                  toast.error(`${result.pattern?.name} : Apex ne stocke jamais ce type de donnée pour ta sécurité.`, { duration: 6000 });
                  return;
                }
                if (!result.ok) {
                  haptic.warning();
                  toast.warn('Format non reconnu : ' + (result.reason ?? 'inconnu') + ` (taille ${value.length} chars, début: "${value.slice(0, 12)}...")`, { duration: 8000 });
                  return;
                }
                haptic.success();
                const validMsg = result.valid === true ? ' ✅ validée' : result.valid === false ? ' ⚠️ ping échoué' : '';
                toast.success(`${result.pattern?.name} rangée${validMsg}`);
                void render(rootEl);
              })();
            },
          },
        ],
      });
      /* Wire bouton "📋 Coller automatiquement" via Clipboard API */
      setTimeout(() => {
        const clipboardBtn = document.getElementById('ax-paste-clipboard-btn') as HTMLButtonElement | null;
        const input = document.getElementById('ax-paste-input') as HTMLTextAreaElement | null;
        const preview = document.getElementById('ax-paste-preview') as HTMLDivElement | null;
        const detectionEl = document.getElementById('ax-paste-detection') as HTMLSpanElement | null;
        clipboardBtn?.addEventListener('click', async () => {
          haptic.tap();
          try {
            if (!navigator.clipboard?.readText) {
              toast.warn('Clipboard API non supportée. Long press dans le textarea → Coller manuellement.');
              return;
            }
            const text = await navigator.clipboard.readText();
            const trimmed = text.trim();
            if (!trimmed) {
              toast.warn('Presse-papiers vide. Copie d\'abord ta clé puis tap ce bouton.');
              return;
            }
            if (input) input.value = trimmed;
            /* Auto-detect immédiat pour preview */
            const { detectCredential } = await import('../../services/credential-patterns.js');
            const detected = detectCredential(trimmed);
            if (preview && detectionEl) {
              if (detected) {
                detectionEl.textContent = `✅ Détecté : ${detected.name} (${trimmed.length} chars)`;
                preview.style.display = 'block';
                preview.style.background = 'rgba(34,204,119,0.1)';
                preview.style.color = '#22cc77';
              } else {
                detectionEl.textContent = `⚠️ Format inconnu (${trimmed.length} chars, début "${trimmed.slice(0, 15)}...")`;
                preview.style.display = 'block';
                preview.style.background = 'rgba(255,170,0,0.1)';
                preview.style.color = '#ffaa00';
              }
            }
            toast.success('Clé collée — vérifie + tap "Coller + ranger"');
            haptic.medium();
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'erreur';
            toast.warn(`Permission presse-papiers refusée. Long press dans le textarea blanc → Coller. (${msg})`);
          }
        });
        /* Live detection au paste/input dans textarea */
        input?.addEventListener('input', async () => {
          const value = input.value.trim();
          if (!value || !preview || !detectionEl) {
            if (preview) preview.style.display = 'none';
            return;
          }
          const { detectCredential } = await import('../../services/credential-patterns.js');
          const detected = detectCredential(value);
          if (detected) {
            detectionEl.textContent = `✅ Détecté : ${detected.name} (${value.length} chars)`;
            preview.style.display = 'block';
            preview.style.background = 'rgba(34,204,119,0.1)';
            preview.style.color = '#22cc77';
          } else {
            detectionEl.textContent = `⚠️ Format inconnu (${value.length} chars)`;
            preview.style.display = 'block';
            preview.style.background = 'rgba(255,170,0,0.1)';
            preview.style.color = '#ffaa00';
          }
        });
      }, 100);
    });
  };
  attachPasteKey('#ax-paste-key');
  attachPasteKey('#ax-paste-key-nav');

  /* Sprint 8 v13.0.69 P0 BUG FIX (Kevin "boutons header/footer marchent pas") :
     Event delegation global pour [data-nav-route="..."] qui replace onclick CSP-blocked.
     iOS Safari + CSP strict bloquent inline onclick. Solution : addEventListener listener
     unique sur rootEl qui catch tous boutons quand cliqués (avant ET après re-render). */
  rootEl.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const navBtn = target.closest('[data-nav-route]') as HTMLElement | null;
    if (navBtn) {
      const route = navBtn.dataset['navRoute'];
      if (route) {
        haptic.tap();
        location.hash = '#' + route;
      }
    }
  });

  /* Kevin v13 : event delegation pour boutons d'action sur messages assistant
     (🔊 Lecture vocale, 📋 Copy, 📄 Export PDF). Demande explicite Kevin :
     "bouton haut-parleur pour écouter au lieu de lire, choisir les voix". */
  rootEl.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    /* v13.3.48 — Follow-up chip click → re-soumet le prompt */
    const followBtn = target.closest<HTMLElement>('.ax-followup-chip');
    if (followBtn) {
      const prompt = followBtn.getAttribute('data-followup-prompt');
      if (prompt) {
        haptic.tap();
        const ta = rootEl.querySelector<HTMLTextAreaElement>('#ax-chat-text');
        if (ta) {
          ta.value = prompt;
          rootEl.querySelector<HTMLFormElement>('#ax-chat-form')?.requestSubmit();
        }
      }
      return;
    }

    const btn = target.closest('[data-action]') as HTMLButtonElement | null;
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const msgId = btn.getAttribute('data-msg-id');
    if (!action || !msgId) return;
    /* Filtre uniquement nos actions chat (évite collision avec autres data-action) */
    if (action !== 'speak' && action !== 'copy' && action !== 'export-pdf' && action !== 'regen') return;
    const msg = conversation.find((m) => m.id === msgId);
    if (!msg) return;

    if (action === 'speak') {
      void handleSpeakAction(btn, msg);
      return;
    }
    if (action === 'copy') {
      void handleCopyAction(msg);
      return;
    }
    if (action === 'export-pdf') {
      void handleExportPdfAction(msg);
      return;
    }
    if (action === 'regen') {
      haptic.tap();
      void regenerateLastAssistant(rootEl);
      return;
    }
  });

  rootEl.querySelector<HTMLButtonElement>('#ax-logout-nav')?.addEventListener('click', () => {
    haptic.tap();
    const sheet = modalSheet.open({
      title: 'Déconnexion ?',
      content: '<p>Tes données restent sauvegardées (Coffre, conversations, profil).</p>',
      actions: [
        { label: 'Annuler', variant: 'ghost', onClick: () => sheet.close() },
        {
          label: 'Déconnecter',
          variant: 'danger',
          onClick: () => {
            haptic.medium();
            sheet.close();
            void import('../../services/auth.js').then((m) => {
              m.auth.logout();
              toast.info('Déconnecté');
              location.hash = '#landing';
            });
          },
        },
      ],
    });
  });

  /* v13.3.77 fix TDZ : guard contre accès `conversation` avant init module
   * (race condition Vitest isolate + services-bootstrap router.dispatch peut
   * appeler render() durant module loading, avant que le const conversation soit bound). */
  try {
    if (conversation.length) {
      renderMessages(rootEl);
    }
  } catch (e) {
    /* TDZ pendant module init — pas critique, renderMessages peut attendre next tick */
    if (!(e instanceof ReferenceError)) throw e;
    logger.warn('chat', 'conversation TDZ skipped (module init race)');
  }
  /* H3 audit fix v13.3.74 — skeleton helper exposé pour features lazy.
   * Wire opt-in via `data-ax-skeleton-host` element (modules lazy-loaded l'utilisent
   * pour placeholder pendant fetch). Idempotent : pas exécuté si pas de host. */
  const skelHost = rootEl.querySelector<HTMLElement>('[data-ax-skeleton-host="chat"]');
  if (skelHost) {
    skeleton(skelHost, 'chat-message');
  }
  logger.info('chat', 'Chat view rendered');
}
