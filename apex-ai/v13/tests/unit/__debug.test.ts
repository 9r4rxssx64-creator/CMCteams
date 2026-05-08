import { describe, it, expect, beforeEach } from 'vitest';
import { sentinels, registerCoreSentinels } from '../../services/sentinels.js';

describe('debug', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('debug global health', async () => {
    registerCoreSentinels();
    const r = await sentinels.runOne('global-health-watch');
    console.log('result:', r);
    console.log('log raw:', localStorage.getItem('ax_global_health_log'));
    expect(r?.ts).toBeGreaterThan(0);
  });
});
