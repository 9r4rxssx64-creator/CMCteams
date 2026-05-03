import { describe, it, expect, beforeEach } from 'vitest';
import { observability } from '../../services/observability.js';

describe('observability', () => {
  beforeEach(() => {
    localStorage.clear();
    observability.init();
  });
  it('capture event in buffer', () => {
    observability.capture('warn', 'test', 'message test');
    const buf = observability.getBuffer();
    expect(buf.length).toBeGreaterThan(0);
    expect(buf[buf.length - 1]?.msg).toBe('message test');
  });
  it('guard wraps fn errors without silencing', async () => {
    const result = await observability.guard('test.scope', async () => {
      throw new Error('boom');
    }, 'fallback');
    expect(result).toBe('fallback');
    const buf = observability.getBuffer();
    expect(buf.some((e) => e.msg === 'boom')).toBe(true);
  });
  it('guard returns value on success', async () => {
    const result = await observability.guard('test.ok', async () => 42);
    expect(result).toBe(42);
  });
  it('persiste buffer dans localStorage', () => {
    observability.capture('info', 'persist', 'msg');
    const raw = localStorage.getItem('apex_v13_observability');
    expect(raw).toBeTruthy();
  });
});
