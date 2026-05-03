import { describe, it, expect, beforeEach } from 'vitest';
import { rgpd } from '../../services/rgpd.js';

describe('rgpd', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('Art. 15 export retourne data structurée', async () => {
    localStorage.setItem('apex_v13_user', JSON.stringify({ id: 'u1', name: 'Test' }));
    localStorage.setItem('apex_v13_facts', JSON.stringify([{ id: 'f1', text: 'fact1' }]));
    const exp = await rgpd.exportUserData('u1');
    expect(exp.uid).toBe('u1');
    expect(exp.format).toBe('json');
    expect(exp.data.persistent_memory).toBeDefined();
  });
  it('Art. 17 delete sans confirmation refuse', async () => {
    const r = await rgpd.deleteUserData('u1', false);
    expect(r.ok).toBe(false);
    expect(r.deletedKeys).toEqual([]);
  });
  it('Art. 17 delete avec confirmation efface', async () => {
    localStorage.setItem('apex_v13_user', JSON.stringify({ id: 'u1' }));
    localStorage.setItem('apex_v13_pin_u1', 'hash');
    const r = await rgpd.deleteUserData('u1', true);
    expect(r.ok).toBe(true);
    expect(r.deletedKeys.length).toBeGreaterThan(0);
  });
  it('Art. 21 opt-out training', () => {
    rgpd.optOutAITraining('u1', true);
    expect(rgpd.isOptedOut('u1')).toBe(true);
    rgpd.optOutAITraining('u1', false);
    expect(rgpd.isOptedOut('u1')).toBe(false);
  });
  it('Art. 30 registre traitements ≥ 5 activités', () => {
    const reg = rgpd.getProcessingRegistry();
    expect(reg.length).toBeGreaterThanOrEqual(5);
    expect(reg.some((r) => r.finalite.includes('Authentification'))).toBe(true);
  });
  it('consent record + check', () => {
    rgpd.recordConsent('u1', { aiTraining: true, analytics: false, thirdParty: true });
    expect(rgpd.hasConsent('u1')).toBe(true);
  });
});
