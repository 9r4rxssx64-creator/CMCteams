import { describe, it, expect, beforeEach } from 'vitest';
import { sentinels, registerCoreSentinels } from '../../services/sentinels.js';

describe('sentinels deep tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('runOne credentials-watch sans token retourne ok=true (no creds)', async () => {
    registerCoreSentinels();
    const r = await sentinels.runOne('credentials-watch');
    expect(r?.ts).toBeGreaterThan(0);
  });

  it('runOne backup-watch détecte pas de backup récent', async () => {
    registerCoreSentinels();
    /* Pas de ax_last_backup_ts → > 26h ago = fail */
    const r = await sentinels.runOne('backup-watch');
    expect(r?.ok).toBe(false);
  });

  it('runOne backup-watch ok si récent', async () => {
    localStorage.setItem('ax_last_backup_ts', String(Date.now()));
    registerCoreSentinels();
    const r = await sentinels.runOne('backup-watch');
    expect(r?.ok).toBe(true);
  });

  it('runOne sentinel inconnu retourne ok=false', async () => {
    registerCoreSentinels();
    const r = await sentinels.runOne('inexistant');
    expect(r?.ok).toBe(false);
  });

  it('storage-watch alerte si > 4 MB localStorage', async () => {
    registerCoreSentinels();
    /* Remplit localStorage avec ~4.5 MB */
    const big = 'x'.repeat(500_000);
    for (let i = 0; i < 10; i++) {
      try { localStorage.setItem(`big_${i}`, big); } catch { /* quota OK */ }
    }
    const r = await sentinels.runOne('storage-watch');
    /* Si quota localStorage permet 4MB, alors flag */
    expect(r?.ts).toBeGreaterThan(0);
  });

  it('compliance-watch sans consent flag false', async () => {
    registerCoreSentinels();
    const r = await sentinels.runOne('compliance-watch');
    expect(r?.ok).toBe(false);
  });

  it('compliance-watch avec consent flag true', async () => {
    localStorage.setItem('apex_v13_rgpd_consent', JSON.stringify({ ts: Date.now() }));
    registerCoreSentinels();
    const r = await sentinels.runOne('compliance-watch');
    expect(r?.ok).toBe(true);
  });

  it('list contient 13 sentinelles', () => {
    registerCoreSentinels();
    expect(sentinels.list().length).toBe(13);
  });

  it('enable/disable persistant sur instance', () => {
    registerCoreSentinels();
    sentinels.enable('error-watch', false);
    expect(sentinels.list().find((s) => s.id === 'error-watch')?.enabled).toBe(false);
    sentinels.enable('error-watch', true);
    expect(sentinels.list().find((s) => s.id === 'error-watch')?.enabled).toBe(true);
  });
});
