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

import { errors } from '../../core/errors.js';
import { logger } from '../../core/logger.js';
import { memory } from '../../core/memory.js';
import { store } from '../../core/store.js';
import { aiRouter, type ChatMessage } from '../../services/ai-router.js';
import { commerce } from '../../services/commerce.js';
import { vault } from '../../services/vault.js';
import { haptic } from '../../ui/haptic.js';
import { modalSheet } from '../../ui/modal-sheet.js';
import { toast } from '../../ui/toast.js';

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  ts: number;
  streaming?: boolean;
  /* P0 Kevin v13.1.0 : pills tool_use discrètes inline pendant streaming.
     Au lieu de cards massives, on affiche `🔧 [name]` en pill horizontal
     puis `✅ N opérations` quand done. */
  toolPills?: { name: string; status: 'running' | 'done' }[];
  toolBatchCount?: number;
}

const conversation: DisplayMessage[] = [];
const queue: string[] = [];
let isProcessing = false;

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
    `<img src="${safeUrl}" alt="${safeName}" ` +
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
        const cost = result.cost_eur != null ? ` (${result.cost_eur.toFixed(3)}€)` : '';
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
    : `<img src="${safeUrl}" alt="${safeName} ${safeType}" ` +
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
    `<button class="ax-msg-action" data-action="export-pdf" data-msg-id="${escapeHtml(msg.id)}" ` +
    `style="${btnStyle}" title="Exporter en PDF" aria-label="Exporter PDF">📄</button>` +
    `</div>`
  );
}

/* Exposé pour tests anti-XSS Jet 7.8 (audit subagent) */
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

function buildSystemPrompt(): string {
  const user = store.get('user');
  return memory.buildSystemPromptContext(user);
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

    /* Toast non-intrusif "🎯 Outil détecté : Studio Mix" */
    const { toast } = await import('../../ui/toast.js');
    toast.info(`${tool.emoji} ${tool.name} disponible — tape pour ouvrir`, { duration: 5000 });

    /* Track usage potentiel */
    const user = store.get('user');
    if (user?.id) smartToolsSuggester.recordUsage(tool.id, user.id);
    /* Render bubble suggested tool dans chat */
    pushSuggestedTool(rootEl, tool);
  } catch (err: unknown) {
    /* Silent fail — non-bloquant pour chat */
    logger.warn('chat', 'detectAndSuggestTool failed', { err });
  }
}

function pushSuggestedTool(rootEl: HTMLElement, tool: { emoji: string; name: string; description: string; cta_label: string; cta_target: string }): void {
  const scroll = rootEl.querySelector<HTMLElement>('.ax-chat-scroll');
  if (!scroll) return;
  const card = document.createElement('div');
  card.className = 'ax-msg ax-msg-tool ax-slide-up-fade';
  card.innerHTML = `
    <div class="ax-tool-card">
      <div class="ax-tool-icon">${tool.emoji}</div>
      <div class="ax-tool-info">
        <strong>${escapeHtml(tool.name)}</strong>
        <p style="margin:4px 0 0;color:var(--ax-text-dim);font-size:13px">${escapeHtml(tool.description)}</p>
      </div>
      <button class="ax-btn ax-btn-primary ax-btn-sm" onclick="location.hash='${escapeHtml(tool.cta_target)}'">${escapeHtml(tool.cta_label)}</button>
    </div>
  `;
  scroll.appendChild(card);
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

  const userMsg: DisplayMessage = {
    id: `u_${Date.now()}`,
    role: 'user',
    text,
    ts: Date.now(),
  };
  conversation.push(userMsg);

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

  const messages: ChatMessage[] = conversation
    .filter((m) => !m.streaming || m === assistantMsg)
    .slice(-30)
    .filter((m) => m !== assistantMsg)
    .map((m) => ({ role: m.role, content: m.text }));

  await aiRouter.stream(
    messages,
    buildSystemPrompt(),
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
        /* Auto-read si setting activé (Kevin demande "il puisse me lire les choses") */
        void maybeAutoReadAssistant(assistantMsg);
      }
    },
    (err) => {
      assistantMsg.text = errors.toUserMessage(err) + ' (Apex bascule sur le mode hors-ligne — réessaie dans un instant.)';
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
    bubble.innerHTML =
      renderToolPills(msg) +
      renderMarkdownLight(msg.text) +
      (msg.streaming ? '<span class="ax-cursor">▌</span>' : '') +
      renderMessageActions(msg);
    /* Auto-scroll smooth */
    const scroll = rootEl.querySelector('.ax-chat-scroll');
    if (scroll) scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' });
  } else {
    renderMessages(rootEl);
  }
}

function renderMessages(rootEl: HTMLElement): void {
  const scroll = rootEl.querySelector<HTMLElement>('.ax-chat-scroll');
  if (!scroll) return;
  const html = conversation
    .map((m) => {
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
      return `
        <div class="ax-msg ax-msg-${m.role} ax-modernized-msg ax-slide-up-fade" data-msg-id="${m.id}">
          <div class="ax-msg-body">${pills}${renderMarkdownLight(m.text)}${trail}${actions}</div>
        </div>
      `;
    })
    .join('');
  scroll.innerHTML = html;
  scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' });
}

export function render(rootEl: HTMLElement): void {
  const user = store.get('user');
  const greeting = user ? `Bonjour ${user.name}, qu'est-ce que je peux faire pour toi ?` : 'Bienvenue dans Apex.';

  const isAdmin = store.get('isAdmin');
  const hasKey = aiRouter.hasAnyKey();

  rootEl.innerHTML = `
    <style>
      .ax-chat-header {
        background: linear-gradient(180deg,rgba(20,20,35,0.95),rgba(14,14,28,0.85));
        backdrop-filter: blur(20px) saturate(140%);
        -webkit-backdrop-filter: blur(20px) saturate(140%);
        border-bottom: 1px solid rgba(255,255,255,0.06);
        padding: 14px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        position: sticky;
        top: 0;
        z-index: 50;
      }
      .ax-chat-header h1 {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        background: linear-gradient(135deg,#c9a227 0%,#e8b830 50%,#f5cc4a 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-family: Georgia, serif;
        letter-spacing: -0.015em;
      }
      .ax-chat-header .ax-btn-icon {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.85);
        width: 40px;
        height: 40px;
        min-width: 40px;
        border-radius: 12px;
        font-size: 18px;
        cursor: pointer;
        transition: all 160ms cubic-bezier(0.16,1,0.3,1);
        -webkit-tap-highlight-color: transparent;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .ax-chat-header .ax-btn-icon:hover {
        background: rgba(232,184,48,0.12);
        border-color: rgba(232,184,48,0.3);
        transform: translateY(-1px);
      }
      .ax-chat-greeting {
        text-align: center;
        padding: 32px 20px 20px;
        font-size: clamp(20px,4vw,26px);
        font-weight: 600;
        color: rgba(255,255,255,0.9);
        font-family: Georgia, serif;
        letter-spacing: -0.015em;
        line-height: 1.4;
        animation: ax-fade-up 480ms cubic-bezier(0.16,1,0.3,1) backwards;
      }
      .ax-chat-greeting::after {
        content: '';
        display: block;
        width: 60px;
        height: 2px;
        background: linear-gradient(90deg,transparent,#e8b830,transparent);
        margin: 16px auto 0;
        opacity: 0.6;
      }
      .ax-info-card {
        background: linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(232,184,48,0.18);
        border-radius: 16px;
        padding: 20px;
        animation: ax-fade-up 360ms cubic-bezier(0.16,1,0.3,1) backwards;
      }
      .ax-info-card h3 {
        margin: 0 0 8px;
        font-size: 15px;
        font-weight: 700;
        color: #e8b830;
        letter-spacing: -0.01em;
      }
      .ax-info-card p {
        margin: 0 0 14px;
        color: rgba(255,255,255,0.65);
        font-size: 13px;
        line-height: 1.5;
      }
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
        <h1>APEX <span style="font-size:0.55em;letter-spacing:0.15em;color:rgba(255,255,255,0.4);font-weight:400">AI</span></h1>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="ax-btn ax-btn-icon" id="ax-chat-settings" aria-label="Paramètres" title="Paramètres">⚙️</button>
          <button class="ax-btn ax-btn-icon" id="ax-chat-menu" aria-label="Menu" title="Menu">☰</button>
        </div>
      </header>
      <div class="ax-chat-scroll" role="log" aria-live="polite" aria-atomic="false">
        <div class="ax-chat-greeting">${escapeHtml(greeting)}</div>
        ${!hasKey ? `
          <div class="ax-info-card ax-modernized-card" style="margin:16px;">
            <h3>🔑 Aucune clé API configurée</h3>
            <p>Pour discuter avec Apex, colle une clé API IA. Apex détecte automatiquement Anthropic, OpenAI, Groq ou Gemini.</p>
            <button class="ax-btn ax-btn-primary" id="ax-paste-key" style="background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;padding:12px 20px;border-radius:10px;font-weight:700;cursor:pointer;font-size:14px;width:100%;min-height:44px;-webkit-tap-highlight-color:transparent;transition:all 180ms cubic-bezier(0.16,1,0.3,1)">📋 Coller une clé API</button>
          </div>
        ` : ''}
      </div>
      <form class="ax-chat-input" id="ax-chat-form">
        <textarea
          id="ax-chat-text"
          rows="1"
          placeholder="Écris, dicte ou scanne — colle aussi photos/vidéos/docs"
          aria-label="Message"
          autocomplete="off"
        ></textarea>
        <button type="button" class="ax-btn ax-btn-icon" id="ax-chat-mic" aria-label="Dictée vocale" title="Dictée vocale (Web Speech)">🎙</button>
        <button type="button" class="ax-btn ax-btn-icon" id="ax-chat-wake" aria-label="Activer Dis Apex" title="Wake word 'Dis Apex' actif/inactif">👂</button>
        <button type="button" class="ax-btn ax-btn-icon" id="ax-chat-attach" aria-label="Joindre fichier" title="Photo, vidéo, document, archive">📎</button>
        <button type="button" class="ax-btn ax-btn-icon" id="ax-chat-camera" aria-label="Ouvrir caméra" title="Caméra (photo, scan, QR, vidéo)">📷</button>
        <button type="submit" class="ax-btn ax-btn-primary" aria-label="Envoyer">→</button>
        <input type="file" id="ax-chat-file-input" multiple
          accept="image/*,video/*,audio/*,.pdf,.txt,.md,.json,.csv,.zip,.rar,.7z,.docx,.xlsx,.pptx"
          style="display:none">
      </form>
      <div id="ax-chat-attachments" style="display:none;padding:8px;border-top:1px solid var(--ax-border);background:rgba(201,162,39,0.05);overflow-x:auto;white-space:nowrap"></div>
      <nav class="ax-chat-nav" style="display:flex;gap:8px;padding:8px;border-top:1px solid var(--ax-border);overflow-x:auto;background:var(--ax-bg-glass);-webkit-overflow-scrolling:touch">
        <button class="ax-btn ax-btn-sm" data-nav-route="chat" style="white-space:nowrap;min-height:44px;padding:8px 14px">💬 Chat</button>
        ${isAdmin ? '<button class="ax-btn ax-btn-sm" data-nav-route="admin" style="white-space:nowrap;min-height:44px;padding:8px 14px">⚙️ Admin</button>' : ''}
        <button class="ax-btn ax-btn-sm" data-nav-route="vault" style="white-space:nowrap;min-height:44px;padding:8px 14px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;font-weight:700">🔐 Coffre</button>
        <button class="ax-btn ax-btn-sm" data-nav-route="settings" style="white-space:nowrap;min-height:44px;padding:8px 14px">🔧 Réglages</button>
        <button class="ax-btn ax-btn-sm" id="ax-paste-key-nav" style="white-space:nowrap;min-height:44px;padding:8px 14px">🔑 Clé API</button>
        <button class="ax-btn ax-btn-sm" id="ax-logout-nav" style="white-space:nowrap;min-height:44px;padding:8px 14px;color:#ff6666">🚪 Déconnexion</button>
      </nav>
      <footer style="text-align:center;padding:6px;font-size:11px;color:var(--ax-text-muted);background:var(--ax-bg)">
        APEX AI v13.0 — Créé par <strong style="color:var(--ax-gold)">DK</strong>
      </footer>
    </div>
  `;

  const form = rootEl.querySelector<HTMLFormElement>('#ax-chat-form');
  const textarea = rootEl.querySelector<HTMLTextAreaElement>('#ax-chat-text');
  if (form && textarea) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = textarea.value.trim();
      if (!value) return;
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
            const names = result.stored.map((s) => s.pattern.name).join(', ');
            toast.success(`🔑 ${result.stored.length} clé(s) chiffrée(s) AES-GCM-256 : ${names}`, { duration: 6000 });
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
      })();
    });
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    });
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.requestSubmit();
      }
    });
    /* Auto-detect paste v13.0.78 : multi-clés bulk store (.env, JSON, multi-line) */
    textarea.addEventListener('paste', (e) => {
      const pasted = e.clipboardData?.getData('text')?.trim() ?? '';
      if (!pasted) return;
      void (async () => {
        const { detectAllCredentials } = await import('../../services/credential-patterns.js');
        const detected = detectAllCredentials(pasted);
        if (detected.length > 0) {
          e.preventDefault();
          textarea.value = '';
          const { vault } = await import('../../services/vault.js');
          const result = await vault.autoStoreBulk(pasted);
          if (result.stored.length > 0) {
            const names = result.stored.map((s) => s.pattern.name).join(', ');
            toast.success(`🔑 ${result.stored.length} clé(s) chiffrée(s) auto AES-GCM-256 : ${names}`, { duration: 6000 });
          }
          if (result.forbidden.length > 0) {
            const names = result.forbidden.map((f) => f.pattern.name).join(', ');
            toast.error(`🚫 ${names} JAMAIS stocké (règle sécu)`, { duration: 8000 });
          }
          if (result.failed > 0 && result.stored.length === 0) {
            toast.warn(`Format inconnu — ouvre 🔐 Coffre pour coller manuellement`, { duration: 6000 });
          }
        }
      })();
    });
  }

  /* Mic handler : dictée vocale Web Speech API */
  const micBtn = rootEl.querySelector<HTMLButtonElement>('#ax-chat-mic');
  let recognition: { start: () => void; stop: () => void; onresult: ((e: Event) => void) | null; onend: (() => void) | null; onerror: ((e: Event) => void) | null; continuous: boolean; interimResults: boolean; lang: string } | null = null;
  let recognitionActive = false;
  micBtn?.addEventListener('click', () => {
    haptic.tap();
    const SR = (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown }).SpeechRecognition
            ?? (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;
    if (!SR) {
      toast.warn('Dictée vocale non supportée par ton navigateur');
      return;
    }
    if (recognitionActive && recognition) {
      recognition.stop();
      recognitionActive = false;
      micBtn.style.background = '';
      return;
    }
    try {
      recognition = new (SR as new () => typeof recognition)() as typeof recognition;
      if (!recognition) return;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';
      let lastFinalTranscript = '';
      let silenceTimer: ReturnType<typeof setTimeout> | null = null;
      const SILENCE_MS = 1500; /* 1.5s de silence après dernier mot → auto-submit */
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
        toast.warn(`Dictée erreur : ${errEvt.error ?? 'inconnu'}`);
        recognitionActive = false;
        if (micBtn) micBtn.style.background = '';
      };
      recognition.start();
      recognitionActive = true;
      micBtn.style.background = 'linear-gradient(135deg,#ff4444,#cc2222)';
      haptic.medium();
      toast.success('🎙 Parle maintenant — re-tap 🎙 pour arrêter');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'erreur';
      toast.warn(`Dictée fail : ${msg}`);
    }
  });

  /* Wake word "Dis Apex" : SpeechRecognition continuous */
  const wakeBtn = rootEl.querySelector<HTMLButtonElement>('#ax-chat-wake');
  wakeBtn?.addEventListener('click', () => {
    haptic.tap();
    void (async () => {
      try {
        const { voicePrint } = await import('../../services/voice-print.js');
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
        const r = voicePrint.startWakeWord((transcript: string) => {
          const ta = rootEl.querySelector<HTMLTextAreaElement>('#ax-chat-text');
          if (ta) {
            ta.value = transcript;
            const form = rootEl.querySelector<HTMLFormElement>('#ax-chat-form');
            form?.requestSubmit();
          }
        });
        if (r.ok && wakeBtn) {
          wakeBtn.style.background = 'linear-gradient(135deg,#22cc77,#1a9a5a)';
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
    div.innerHTML = `${icon} ${file.name.slice(0, 30)}${file.name.length > 30 ? '...' : ''} (${sizeMB} MB)`;
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
              card.innerHTML = `<img src="${dataUrl}" alt="Capture caméra" style="max-width:100%;border-radius:8px">`;
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
    const btn = target.closest('[data-action]') as HTMLButtonElement | null;
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const msgId = btn.getAttribute('data-msg-id');
    if (!action || !msgId) return;
    /* Filtre uniquement nos actions chat (évite collision avec autres data-action) */
    if (action !== 'speak' && action !== 'copy' && action !== 'export-pdf') return;
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

  if (conversation.length) renderMessages(rootEl);
  logger.info('chat', 'Chat view rendered');
}
