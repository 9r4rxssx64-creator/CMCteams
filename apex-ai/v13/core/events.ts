/**
 * APEX v13 — Pub/sub événementiel typé
 *
 * Bus simple pour découpler bootstrap → router → features.
 * Anti-pattern évité : pas de window.dispatchEvent (cf. règle "pas de window.* reassignment").
 */

import { logger } from './logger.js';

export interface EventMap {
  'boot:complete': { ctx: unknown; bootMs: number };
  'boot:routerReady': { ctx: unknown };
  'network:online': Record<string, never>;
  'network:offline': Record<string, never>;
  'auth:login': { uid: string; isAdmin: boolean };
  'auth:logout': Record<string, never>;
  'route:change': { from: string; to: string };
  'store:change': { key: string; value: unknown };
  'commerce:toggle': { enabled: boolean };
  [k: `custom:${string}`]: unknown;
}

type Handler<T = unknown> = (payload: T) => void;

class Events {
  private handlers = new Map<string, Set<Handler>>();

  on<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>): () => void {
    const set = this.handlers.get(event as string) ?? new Set();
    set.add(handler as Handler);
    this.handlers.set(event as string, set);
    return () => this.off(event, handler);
  }

  off<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>): void {
    this.handlers.get(event as string)?.delete(handler as Handler);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    const set = this.handlers.get(event as string);
    if (!set) return;
    for (const h of set) {
      try {
        (h as Handler<EventMap[K]>)(payload);
      } catch (err: unknown) {
        logger.error('events', `Handler crash on ${String(event)}`, { err });
      }
    }
  }

  once<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>): void {
    const off = this.on(event, (p) => {
      off();
      handler(p);
    });
  }
}

export const events = new Events();
