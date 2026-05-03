import { describe, it, expect, beforeEach } from 'vitest';
import { sentinels, registerCoreSentinels } from '../../services/sentinels.js';

describe('sentinels', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('register core 13 sentinels', () => {
    registerCoreSentinels();
    const list = sentinels.list();
    expect(list.length).toBeGreaterThanOrEqual(13);
    const ids = list.map((s) => s.id);
    expect(ids).toContain('token-balance-watch');
    expect(ids).toContain('error-watch');
    expect(ids).toContain('backup-watch');
    expect(ids).toContain('credentials-watch');
    expect(ids).toContain('link-validation-watch');
  });
  it('5 sentinels actives + 8 stubs disabled', () => {
    registerCoreSentinels();
    const list = sentinels.list();
    const active = list.filter((s) => s.enabled);
    const disabled = list.filter((s) => !s.enabled);
    expect(active.length).toBe(5);
    expect(disabled.length).toBe(8);
  });
  it('runOne sentinel executes check', async () => {
    registerCoreSentinels();
    const result = await sentinels.runOne('credentials-watch');
    expect(result?.ts).toBeGreaterThan(0);
    expect(typeof result?.msg).toBe('string');
  });
  it('enable/disable toggle', () => {
    registerCoreSentinels();
    sentinels.enable('error-watch', false);
    const s = sentinels.list().find((x) => x.id === 'error-watch');
    expect(s?.enabled).toBe(false);
  });
});
