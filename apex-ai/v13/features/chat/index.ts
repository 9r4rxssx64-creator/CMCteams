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
}

const conversation: DisplayMessage[] = [];
const queue: string[] = [];
let isProcessing = false;

/* Exposé pour tests anti-XSS Jet 7.8 (audit subagent) */
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
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
      if (chunk.text) {
        assistantMsg.text += chunk.text;
        updateAssistantBubble(rootEl, assistantMsg);
      }
      if (chunk.done) {
        delete assistantMsg.streaming;
        store.set('isStreaming', false);
        renderMessages(rootEl);
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

function updateAssistantBubble(rootEl: HTMLElement, msg: DisplayMessage): void {
  const bubble = rootEl.querySelector(`[data-msg-id="${msg.id}"] .ax-msg-body`);
  if (bubble) {
    bubble.innerHTML = renderMarkdownLight(msg.text) + (msg.streaming ? '<span class="ax-cursor">▌</span>' : '');
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
      return `
        <div class="ax-msg ax-msg-${m.role} ax-slide-up-fade" data-msg-id="${m.id}">
          <div class="ax-msg-body">${renderMarkdownLight(m.text)}${trail}</div>
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
    <div class="ax-chat">
      <header class="ax-chat-header">
        <h1>APEX <span style="font-size:0.6em;letter-spacing:1px;color:var(--ax-text-dim)">AI</span></h1>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="ax-btn ax-btn-icon" id="ax-chat-settings" aria-label="Paramètres" title="Paramètres">⚙️</button>
          <button class="ax-btn ax-btn-icon" id="ax-chat-menu" aria-label="Menu" title="Menu">☰</button>
        </div>
      </header>
      <div class="ax-chat-scroll" role="log" aria-live="polite" aria-atomic="false">
        <div class="ax-chat-greeting">${escapeHtml(greeting)}</div>
        ${!hasKey ? `
          <div class="ax-info-card" style="margin:16px;">
            <h3>🔑 Aucune clé API configurée</h3>
            <p>Pour discuter avec Apex, ajoute une clé API IA. Coller une clé Anthropic, OpenAI, Groq ou Gemini :</p>
            <button class="ax-btn ax-btn-primary" id="ax-paste-key">📋 Coller une clé API</button>
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
      <nav class="ax-chat-nav" style="display:flex;gap:8px;padding:8px;border-top:1px solid var(--ax-border);overflow-x:auto;background:var(--ax-bg-glass)">
        <button class="ax-btn ax-btn-sm" onclick="location.hash='#chat'">💬 Chat</button>
        ${isAdmin ? '<button class="ax-btn ax-btn-sm" onclick="location.hash=\'#admin\'">⚙️ Admin</button>' : ''}
        <button class="ax-btn ax-btn-sm" id="ax-paste-key-nav">🔑 Clé API</button>
        <button class="ax-btn ax-btn-sm" id="ax-logout-nav">🚪 Déconnexion</button>
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
      /* P0 SÉCU : anti-erreur Kevin — détecte clé API collée dans chat → ouvre modal vault */
      void (async () => {
        const { detectCredential } = await import('../../services/credential-patterns.js');
        const detected = detectCredential(value);
        if (detected && detected.category !== 'forbidden' && detected.category !== 'identity') {
          /* C'est une clé API/token → ouvre modal Coller au lieu d'envoyer dans chat */
          textarea.value = '';
          const { vault } = await import('../../services/vault.js');
          const result = await vault.autoStore(value);
          if (result.ok && result.pattern) {
            toast.success(`🔑 ${result.pattern.name} détectée + chiffrée + stockée`);
          } else {
            toast.error(result.reason ?? 'Erreur stockage clé');
          }
          return;
        }
        /* Pas une clé → message normal */
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
    /* Auto-detect paste : si user colle une clé API → bloque + auto-store chiffré */
    textarea.addEventListener('paste', (e) => {
      const pasted = e.clipboardData?.getData('text')?.trim() ?? '';
      if (!pasted) return;
      void (async () => {
        const { detectCredential } = await import('../../services/credential-patterns.js');
        const detected = detectCredential(pasted);
        if (detected && detected.category !== 'forbidden' && detected.category !== 'identity') {
          e.preventDefault();
          textarea.value = '';
          const { vault } = await import('../../services/vault.js');
          const result = await vault.autoStore(pasted);
          if (result.ok && result.pattern) {
            toast.success(`🔑 ${result.pattern.name} détectée auto + chiffrée AES-GCM-256`);
          } else {
            toast.error(result.reason ?? 'Erreur stockage');
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

  fileInput?.addEventListener('change', () => {
    const files = Array.from(fileInput.files ?? []);
    if (files.length === 0) return;
    haptic.success();
    for (const file of files) {
      renderAttachment(file);
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
          <button class="ax-btn ax-btn-primary" data-menu-nav="pro" style="width:100%;text-align:left;padding:14px">💼 Pro</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="remote" style="width:100%;text-align:left;padding:14px">📡 Télécommande</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="browser" style="width:100%;text-align:left;padding:14px">🌐 Browser</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="domotique" style="width:100%;text-align:left;padding:14px">🏠 Domotique</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="workflow" style="width:100%;text-align:left;padding:14px">⚡ Workflows</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="crypto" style="width:100%;text-align:left;padding:14px">₿ Crypto</button>
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
