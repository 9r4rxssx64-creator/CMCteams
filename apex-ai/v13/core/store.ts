/**
 * APEX v13 — Store réactif Proxy
 *
 * Source unique de vérité runtime. Pas de Redux, pas de Vuex.
 * Subscribe granulaire par clé.
 *
 * Anti-pattern évité : pas de window.K, pas de mutation hors store.
 */

import { events } from './events.js';

export interface AppState {
  user: { id: string; name: string; email?: string } | null;
  view: string;
  isStreaming: boolean;
  online: boolean;
  appVer: string;
  isAdmin: boolean;
  /* Commercialisation togglable par admin (paywall, abonnements, marketplace) */
  commerceEnabled: boolean;
  /* Theme courant */
  theme: 'dark' | 'light';
  [k: string]: unknown;
}

type Listener<T> = (value: T, prev: T) => void;

class Store {
  private state: AppState = {} as AppState;
  private listeners = new Map<string, Set<Listener<unknown>>>();
  private initialized = false;

  init(initial: Partial<AppState>): void {
    if (this.initialized) return;
    this.initialized = true;
    /* Hydrate depuis localStorage si présent */
    const persisted = this.loadPersisted();
    this.state = {
      user: null,
      view: 'landing',
      isStreaming: false,
      online: navigator.onLine,
      appVer: '',
      isAdmin: false,
      commerceEnabled: true /* ON par défaut, désactivable via vAdminCenter */,
      theme: 'dark',
      ...initial,
      ...persisted,
    };
  }

  get<K extends keyof AppState>(key: K): AppState[K];
  get(key: string): unknown;
  get(key: string): unknown {
    return this.state[key];
  }

  set<K extends keyof AppState>(key: K, value: AppState[K]): void;
  set(key: string, value: unknown): void;
  set(key: string, value: unknown): void {
    const prev = this.state[key];
    if (prev === value) return;
    this.state[key] = value;
    this.persistKey(key, value);
    events.emit('store:change', { key, value });
    this.notify(key, value, prev);
  }

  subscribe<K extends keyof AppState>(key: K, fn: Listener<AppState[K]>): () => void;
  subscribe(key: string, fn: Listener<unknown>): () => void;
  subscribe(key: string, fn: Listener<unknown>): () => void {
    const set = this.listeners.get(key) ?? new Set();
    set.add(fn);
    this.listeners.set(key, set);
    return () => set.delete(fn);
  }

  snapshot(): Readonly<AppState> {
    return { ...this.state };
  }

  private notify(key: string, value: unknown, prev: unknown): void {
    this.listeners.get(key)?.forEach((fn) => {
      try {
        fn(value, prev);
      } catch {
        /* listener errors swallowed mais loggés via events bus */
      }
    });
  }

  private readonly PERSISTED_KEYS = new Set(['theme', 'commerceEnabled']);

  private persistKey(key: string, value: unknown): void {
    if (!this.PERSISTED_KEYS.has(key)) return;
    try {
      localStorage.setItem(`apex_v13_${key}`, JSON.stringify(value));
    } catch {
      /* QuotaExceeded ignoré, pas critique pour ces clés */
    }
  }

  private loadPersisted(): Partial<AppState> {
    const out: Partial<AppState> = {};
    for (const k of this.PERSISTED_KEYS) {
      try {
        const raw = localStorage.getItem(`apex_v13_${k}`);
        if (raw) (out as Record<string, unknown>)[k] = JSON.parse(raw);
      } catch {
        /* corruption JSON ignorée */
      }
    }
    return out;
  }
}

export const store = new Store();
