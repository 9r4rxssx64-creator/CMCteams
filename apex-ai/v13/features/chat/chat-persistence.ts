/**
 * APEX v13.4.172 — Chat conversation persistence (extrait de chat/index.ts).
 *
 * Refactor minutieux Kevin "expert sans régression" :
 * - loadPersisted : pure read localStorage
 * - persistConversation : debounce 500ms localStorage + debounce 30s Firebase
 * - tryFirebaseRestoreConversation : restore depuis cloud si local vide
 *
 * Le module garde son propre state (timeouts) pour éviter pollution chat/index.ts.
 * conversation array passé par référence (mutation in-place possible).
 *
 * Re-exportées depuis chat/index.ts (façade backward-compat).
 *
 * v13.4.10 fix Kevin "continue recommence à zéro" : sync Firebase pour survivre
 * clear cache PWA iOS + restore au reload depuis cloud.
 */

import { logger } from '../../core/logger.js';

const CONV_STORAGE_KEY = 'apex_v13_conversation_active';
const FIREBASE_PATH = 'apex_v13_conversation_cloud';
const CONV_MAX_PERSIST = 200;
const LOCAL_DEBOUNCE_MS = 500;
const FIREBASE_DEBOUNCE_MS = 30_000;
const FIREBASE_MAX_TEXT_LEN = 8_000;
const FIREBASE_MAX_MESSAGES = 30;

/** Minimal type pour persistance (compatible DisplayMessage de chat/index.ts). */
export interface PersistedMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool_card';
  text: string;
  ts: number;
  streaming?: boolean;
  toolPills?: { name: string; status: 'running' | 'done' }[];
  toolBatchCount?: number;
  attachments?: Array<{ mime: string; base64: string; name: string }>;
}

let _saveTimeout: ReturnType<typeof setTimeout> | null = null;
let _firebaseSyncTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Charge la conversation persistée depuis localStorage.
 * Strip streaming flag + filtre messages vides.
 * Retourne [] si pas de data ou JSON invalide.
 */
export function loadPersistedConversation(): PersistedMessage[] {
  try {
    const raw = localStorage.getItem(CONV_STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as PersistedMessage[];
    if (!Array.isArray(arr)) return [];
    return arr
      .map((m) => ({ ...m, streaming: false }))
      .filter((m) => m.text || m.role === 'tool_card');
  } catch {
    return [];
  }
}

/**
 * Persiste la conversation (debounce 500ms localStorage + 30s Firebase).
 * Idempotent : reset les timers à chaque appel.
 *
 * @param conversation - Array passé par référence (lu, jamais muté ici)
 */
export function persistConversation(conversation: readonly PersistedMessage[]): void {
  if (_saveTimeout) clearTimeout(_saveTimeout);
  _saveTimeout = setTimeout(() => {
    try {
      const toSave = conversation
        .filter((m) => !m.streaming)
        .slice(-CONV_MAX_PERSIST);
      localStorage.setItem(CONV_STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      /* Quota exceeded → trim plus agressif */
      try {
        const half = conversation
          .filter((m) => !m.streaming)
          .slice(-(CONV_MAX_PERSIST / 2));
        localStorage.setItem(CONV_STORAGE_KEY, JSON.stringify(half));
      } catch {
        /* skip */
      }
    }
  }, LOCAL_DEBOUNCE_MS);

  if (_firebaseSyncTimeout) clearTimeout(_firebaseSyncTimeout);
  _firebaseSyncTimeout = setTimeout(() => {
    void (async () => {
      try {
        const cloudPayload = conversation
          .filter((m) => !m.streaming && m.text && m.text.length < FIREBASE_MAX_TEXT_LEN)
          .slice(-FIREBASE_MAX_MESSAGES)
          .map((m) => ({ role: m.role, text: m.text, ts: m.ts }));
        const { firebase } = await import('../../services/firebase.js');
        await firebase.write(FIREBASE_PATH, cloudPayload);
      } catch (err: unknown) {
        logger.warn('chat-persistence', 'Firebase sync skipped', { err });
      }
    })();
  }, FIREBASE_DEBOUNCE_MS);
}

/**
 * Restore Firebase au boot SI conversation locale vide (cache PWA clear iOS).
 * Async, non-bloquant. Push directement dans l'array passé par référence.
 *
 * @param conversation - Array muté in-place (push messages restaurés)
 */
export async function tryFirebaseRestoreConversation(
  conversation: PersistedMessage[],
): Promise<void> {
  if (conversation.length > 0) return; /* déjà chargé local */
  try {
    const { firebase } = await import('../../services/firebase.js');
    const cloudRaw = await firebase.read(FIREBASE_PATH);
    if (!Array.isArray(cloudRaw) || cloudRaw.length === 0) return;
    const restored: PersistedMessage[] = (cloudRaw as Array<{ id?: string; role: 'user' | 'assistant'; text: string; ts: number }>)
      .filter((m) => m && typeof m.text === 'string' && m.text.length > 0)
      .map((m) => ({
        id: m.id ?? `restored_${m.ts}_${Math.random().toString(36).slice(2, 8)}`,
        role: m.role,
        text: m.text,
        ts: m.ts,
        streaming: false,
      }));
    if (restored.length > 0) {
      conversation.push(...restored);
      logger.info('chat-persistence', `Restored ${restored.length} msgs from Firebase`);
    }
  } catch (err: unknown) {
    logger.warn('chat-persistence', 'Firebase restore skipped', { err });
  }
}

/** Reset internal timeouts (utile en tests pour cleanup). */
export function _resetPersistenceTimeoutsForTests(): void {
  if (_saveTimeout) clearTimeout(_saveTimeout);
  if (_firebaseSyncTimeout) clearTimeout(_firebaseSyncTimeout);
  _saveTimeout = null;
  _firebaseSyncTimeout = null;
}
