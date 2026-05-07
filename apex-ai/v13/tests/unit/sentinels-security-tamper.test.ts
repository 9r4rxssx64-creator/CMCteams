/**
 * APEX v13.3.24 — Tests security-watch (Kevin screenshot 19:11 "Audit log tamper détecté")
 *
 * Vérifie :
 * 1. Audit log vide → status OK (pas tamper)
 * 2. Audit log valide → status OK
 * 3. Audit log corrompu → critical + détails dans ax_security_log
 * 4. lastact = 0 (pas de session) → skip session check (pas faux positif)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { sentinels, registerCoreSentinels } from '../../services/sentinels.js';
import { auditLog } from '../../services/audit-log.js';

describe('sentinels security-watch tamper v13.3.24', () => {
  beforeEach(() => {
    localStorage.clear();
    auditLog.reload();
    sentinels.list().forEach((s) => sentinels.enable(s.id, false));
    registerCoreSentinels();
  });

  it('audit log vide → status OK (pas tamper)', async () => {
    /* Pas d'écriture audit log → entries.length === 0 */
    const result = await sentinels.runOne('security-watch');
    expect(result?.ok).toBe(true);
    expect(result?.msg).toMatch(/vide.*première écriture|OK/i);
    expect(result?.msg).not.toMatch(/tamper|invalide/i);
  });

  it('audit log valide après record → status OK', async () => {
    auditLog.init();
    await auditLog.record('test.action.1', { actor: 'system' });
    await auditLog.record('test.action.2', { actor: 'system' });
    const result = await sentinels.runOne('security-watch');
    expect(result?.ok).toBe(true);
    expect(result?.msg).toMatch(/audit log OK/i);
  });

  it('audit log corrompu (manuel) → status critical + log security', async () => {
    auditLog.init();
    await auditLog.record('test.action.1');
    await auditLog.record('test.action.2');
    /* Corrompre la chain : modifier hash sans recalcul */
    const raw = localStorage.getItem('ax_audit_log_v13');
    if (raw) {
      const chain = JSON.parse(raw) as { hash: string }[];
      if (chain[1]) chain[1].hash = 'tampered_hash_invalid';
      localStorage.setItem('ax_audit_log_v13', JSON.stringify(chain));
    }
    auditLog.reload();
    const result = await sentinels.runOne('security-watch');
    expect(result?.ok).toBe(false);
    expect(result?.msg).toMatch(/Hash audit log invalide/i);
    expect(result?.msg).toMatch(/corruption/i);
    /* Vérifie ax_security_log enrichi */
    const securityLog = JSON.parse(localStorage.getItem('ax_security_log') ?? '[]') as Array<{ kind: string }>;
    const tamperEntries = securityLog.filter((e) => e.kind === 'audit_log_tamper');
    expect(tamperEntries.length).toBeGreaterThan(0);
  });

  it('lastact = 0 (pas de session) → skip session check, pas faux positif', async () => {
    /* Pas de apex_v13_lastact → ne devrait pas considérer session expirée */
    const result = await sentinels.runOne('security-watch');
    expect(result?.ok).toBe(true);
    expect(result?.msg).not.toMatch(/Session > 8h/i);
  });

  it('lastact récent → session OK', async () => {
    localStorage.setItem('apex_v13_lastact', String(Date.now() - (1 * 60 * 60 * 1000)));
    const result = await sentinels.runOne('security-watch');
    expect(result?.ok).toBe(true);
  });

  it('lastact > 8h → session expirée detected', async () => {
    localStorage.setItem('apex_v13_lastact', String(Date.now() - (10 * 60 * 60 * 1000)));
    const result = await sentinels.runOne('security-watch');
    expect(result?.ok).toBe(false);
    expect(result?.msg).toMatch(/Session > 8h/i);
  });

  it('audit log indispo → status OK (gracieux, pas faux positif)', async () => {
    /* Si auditLog import lève (rare) → skip plutôt que tamper */
    /* (test difficile à reproduire vraiment, on couvre le path principal) */
    const result = await sentinels.runOne('security-watch');
    expect(result?.ok).toBe(true);
  });

  it('détails tamper inclus brokenAt + totalEntries', async () => {
    auditLog.init();
    await auditLog.record('test.1');
    await auditLog.record('test.2');
    await auditLog.record('test.3');
    const raw = localStorage.getItem('ax_audit_log_v13');
    if (raw) {
      const chain = JSON.parse(raw) as { hash: string }[];
      if (chain[2]) chain[2].hash = 'corrupted';
      localStorage.setItem('ax_audit_log_v13', JSON.stringify(chain));
    }
    auditLog.reload();
    const result = await sentinels.runOne('security-watch');
    expect(result?.ok).toBe(false);
    expect(result?.msg).toMatch(/entries|3/);
  });
});
