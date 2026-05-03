import { describe, it, expect, beforeEach } from 'vitest';
import { telemetry } from '../../services/telemetry.js';

describe('telemetry deep tests Jet 7.9', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('processIncoming avec autoFix WHITELIST flushSyncQueue OK', async () => {
    telemetry.pushIncoming({
      kind: 'err',
      msg: 'test syncQueue',
      details: {},
      src: 'apex',
      v: 'v13.0.0',
      user: 'u1',
    });
    await telemetry.processIncoming();
    const buf = JSON.parse(localStorage.getItem('ax_telemetry_in') ?? '[]');
    expect(buf.every((e: { processed: boolean }) => e.processed)).toBe(true);
  });

  it('processIncoming idempotent : retraitement ne re-process pas', async () => {
    telemetry.pushIncoming({ kind: 'info', msg: 'a', details: {}, src: 'apex', v: 'v13', user: 'u' });
    await telemetry.processIncoming();
    const beforeBuf = JSON.parse(localStorage.getItem('ax_telemetry_in') ?? '[]');
    await telemetry.processIncoming();
    const afterBuf = JSON.parse(localStorage.getItem('ax_telemetry_in') ?? '[]');
    expect(afterBuf.length).toBe(beforeBuf.length); /* pas de doublon */
  });

  it('pushIncoming buffer vide initial', () => {
    /* localStorage clear, premier push */
    telemetry.pushIncoming({ kind: 'info', msg: 'first', details: {}, src: 'apex', v: 'v13', user: 'u' });
    const buf = JSON.parse(localStorage.getItem('ax_telemetry_in') ?? '[]');
    expect(buf.length).toBe(1);
  });

  it('pushIncoming multiple kinds info/warn/err', () => {
    telemetry.pushIncoming({ kind: 'info', msg: 'i', details: {}, src: 'a', v: 'v', user: 'u' });
    telemetry.pushIncoming({ kind: 'warn', msg: 'w', details: {}, src: 'a', v: 'v', user: 'u' });
    telemetry.pushIncoming({ kind: 'err', msg: 'e', details: {}, src: 'a', v: 'v', user: 'u' });
    const buf = JSON.parse(localStorage.getItem('ax_telemetry_in') ?? '[]');
    const kinds = buf.map((b: { kind: string }) => b.kind);
    expect(kinds).toContain('info');
    expect(kinds).toContain('warn');
    expect(kinds).toContain('err');
  });

  it('processIncoming events vide ne throw pas', async () => {
    await telemetry.processIncoming();
    expect(true).toBe(true);
  });

  it('telemetry buffer corrompu localStorage gracefull', async () => {
    localStorage.setItem('ax_telemetry_in', 'INVALID JSON');
    await telemetry.processIncoming();
    expect(true).toBe(true);
  });
});
