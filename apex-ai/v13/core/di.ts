/**
 * APEX v13 — Dependency Injection container léger
 *
 * Évite les globals window.* (anti-pattern v12.785 : 366 reassignments).
 * Services s'enregistrent au boot, features les résolvent à la demande.
 */

import { logger } from './logger.js';

type Factory<T> = () => T | Promise<T>;
type ServiceEntry<T> = { factory: Factory<T>; instance?: T; loading?: Promise<T> };

class DIContainer {
  private services = new Map<string, ServiceEntry<unknown>>();

  register<T>(name: string, factory: Factory<T>): void {
    if (this.services.has(name)) {
      logger.warn('di', `Service already registered: ${name}`);
      return;
    }
    this.services.set(name, { factory: factory as Factory<unknown> });
  }

  async resolve<T>(name: string): Promise<T> {
    const entry = this.services.get(name) as ServiceEntry<T> | undefined;
    if (!entry) throw new Error(`DI: service not registered: ${name}`);
    if (entry.instance !== undefined) return entry.instance;
    if (entry.loading) return entry.loading;
    const promise = Promise.resolve(entry.factory());
    entry.loading = promise;
    const instance = await promise;
    entry.instance = instance;
    delete entry.loading;
    return instance;
  }

  has(name: string): boolean {
    return this.services.has(name);
  }

  list(): string[] {
    return [...this.services.keys()];
  }
}

export const di = new DIContainer();
