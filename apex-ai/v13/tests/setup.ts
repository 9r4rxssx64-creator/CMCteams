/**
 * Vitest setup — polyfills crypto.subtle pour happy-dom (qui ne l'a pas par défaut).
 * + fake-indexeddb pour tester transactions IDB (mcp-memory-stub, vault, multi-key-vault).
 *
 * v13.3.46 (fix régression 48 tests) : reset IDBFactory entre tests.
 * fake-indexeddb/auto installe un singleton qui persiste entre tests → casse l'isolation
 * (persistent-memory-store, mcp-memory-stub, credentials-audit lisaient la state d'un test
 * précédent via IDB shadow). Solution : recréer IDBFactory frais en beforeEach global.
 */
import 'fake-indexeddb/auto';
import { IDBFactory as FakeIDBFactory } from 'fake-indexeddb';
import { webcrypto } from 'node:crypto';
import { beforeEach } from 'vitest';

if (!globalThis.crypto || !globalThis.crypto.subtle) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: false,
    configurable: true,
  });
}

beforeEach(() => {
  /* Reset localStorage entre tests pour isolation stricte */
  try {
    localStorage.clear();
  } catch {
    /* ignore */
  }
  /* Reset IndexedDB entre tests : fake-indexeddb persiste les bases entre tests par défaut.
     On instantie une nouvelle IDBFactory pour wiper toutes les DB → isolation stricte. */
  try {
    const fresh = new FakeIDBFactory();
    Object.defineProperty(globalThis, 'indexedDB', {
      value: fresh,
      writable: true,
      configurable: true,
    });
  } catch {
    /* ignore */
  }
});
