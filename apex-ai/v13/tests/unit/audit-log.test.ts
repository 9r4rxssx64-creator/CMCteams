import { describe, it, expect, beforeEach } from 'vitest';
import { auditLog } from '../../services/audit-log.js';

describe('audit-log', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('record + verify hash chain', async () => {
    await auditLog.record('test.event1', { actor: 'user1' });
    await auditLog.record('test.event2', { actor: 'user2' });
    const result = await auditLog.verify();
    expect(result.valid).toBe(true);
  });
  it('detect tampering', async () => {
    await auditLog.record('test.evt', { actor: 'user1' });
    await auditLog.record('test.evt', { actor: 'user2' });
    /* Tamper localStorage */
    const raw = JSON.parse(localStorage.getItem('ax_audit_log_v13') ?? '[]');
    raw[0].action = 'tampered';
    localStorage.setItem('ax_audit_log_v13', JSON.stringify(raw));
    auditLog.reload(); /* force re-load chain depuis localStorage */
    const result = await auditLog.verify();
    expect(result.valid).toBe(false);
    expect(result.brokenAt).toBe(0);
  });
  it('filter par actor', async () => {
    await auditLog.record('a.b', { actor: 'kevin' });
    await auditLog.record('c.d', { actor: 'autre' });
    const filtered = auditLog.getEntries({ actor: 'kevin' });
    expect(filtered.length).toBeGreaterThanOrEqual(1);
  });
});
