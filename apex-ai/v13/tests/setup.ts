/**
 * Vitest setup — polyfills crypto.subtle pour happy-dom (qui ne l'a pas par défaut).
 * + fake-indexeddb pour tester transactions IDB (mcp-memory-stub, vault, multi-key-vault).
 */
import 'fake-indexeddb/auto';
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
});
