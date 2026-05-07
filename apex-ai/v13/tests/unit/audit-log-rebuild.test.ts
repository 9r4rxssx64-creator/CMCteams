/**
 * v13.3.36 (Kevin 2026-05-07 — security-watch P0 alerte) :
 *
 * Tests pour `auditLog.rebuildChainFrom(N)` + `autoRepair()`.
 * Use case : sentinelle security-watch détecte tampering sur entry #7,
 * Kevin clique "🔧 Réparer chain audit" → autoRepair() recalcule
 * tous les hashes à partir du break.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { auditLog } from '../../services/audit-log.js';

describe('audit-log rebuildChainFrom + autoRepair (Kevin v13.3.36 P0)', () => {
  beforeEach(() => {
    localStorage.clear();
    auditLog.reload();
  });

  it('rebuildChainFrom(0) sur chain vide → ok=false (rien à rebuild)', async () => {
    const r = await auditLog.rebuildChainFrom(0);
    expect(r.ok).toBe(false);
    expect(r.rebuilt).toBe(0);
  });

  it('rebuildChainFrom index hors borne → ok=false', async () => {
    await auditLog.record('a');
    const r = await auditLog.rebuildChainFrom(99);
    expect(r.ok).toBe(false);
    expect(r.rebuilt).toBe(0);
  });

  it('rebuildChainFrom(0) sur chain valide → recalcule tout sans casser verify', async () => {
    for (let i = 0; i < 5; i++) await auditLog.record(`evt.${i}`);
    const before = auditLog.getEntries().length;
    const r = await auditLog.rebuildChainFrom(0);
    expect(r.ok).toBe(true);
    expect(r.rebuilt).toBe(5);
    /* Trace 'audit.chain_rebuilt' ajoutée → +1 entry */
    expect(auditLog.getEntries().length).toBe(before + 1);
    const verif = await auditLog.verify();
    expect(verif.valid).toBe(true);
  });

  it('rebuildChainFrom répare chain corrompue (tamper entry #2)', async () => {
    for (let i = 0; i < 5; i++) await auditLog.record(`evt.${i}`);
    /* Tamper entry #2 directement dans localStorage */
    const raw = JSON.parse(localStorage.getItem('ax_audit_log_v13') ?? '[]');
    raw[2].action = 'TAMPERED';
    localStorage.setItem('ax_audit_log_v13', JSON.stringify(raw));
    auditLog.reload();
    /* Pré-condition : verify détecte le break */
    const before = await auditLog.verify();
    expect(before.valid).toBe(false);
    expect(before.brokenAt).toBe(2);
    /* Rebuild from #2 → chain redevient valide */
    const r = await auditLog.rebuildChainFrom(2);
    expect(r.ok).toBe(true);
    expect(r.rebuilt).toBeGreaterThan(0);
    const after = await auditLog.verify();
    expect(after.valid).toBe(true);
  });

  it('rebuildChainFrom préserve les entries avant l index (rebuild conservatif)', async () => {
    for (let i = 0; i < 5; i++) await auditLog.record(`keep.${i}`, { actor: 'kevin' });
    const beforeChain = [...auditLog.getEntries()];
    /* Tamper #3 et rebuild from #3 */
    const raw = JSON.parse(localStorage.getItem('ax_audit_log_v13') ?? '[]');
    raw[3].action = 'TAMPERED';
    localStorage.setItem('ax_audit_log_v13', JSON.stringify(raw));
    auditLog.reload();
    await auditLog.rebuildChainFrom(3);
    const afterChain = auditLog.getEntries();
    /* Entries 0..2 inchangées (mêmes hashs car rebuild commence à 3) */
    for (let i = 0; i < 3; i++) {
      expect(afterChain[i]?.hash).toBe(beforeChain[i]?.hash);
      expect(afterChain[i]?.action).toBe(beforeChain[i]?.action);
    }
  });

  it('autoRepair sur chain valide → no-op (rebuilt=0)', async () => {
    for (let i = 0; i < 3; i++) await auditLog.record(`a.${i}`);
    const r = await auditLog.autoRepair();
    expect(r.ok).toBe(true);
    expect(r.rebuilt).toBe(0);
    expect(r.brokenAt).toBeUndefined();
  });

  it('autoRepair sur chain cassée → trouve break + rebuild', async () => {
    for (let i = 0; i < 6; i++) await auditLog.record(`x.${i}`);
    /* Tamper entry #4 */
    const raw = JSON.parse(localStorage.getItem('ax_audit_log_v13') ?? '[]');
    raw[4].action = 'tampered';
    localStorage.setItem('ax_audit_log_v13', JSON.stringify(raw));
    auditLog.reload();
    const r = await auditLog.autoRepair();
    expect(r.ok).toBe(true);
    expect(r.brokenAt).toBe(4);
    expect(r.rebuilt).toBeGreaterThan(0);
    const verif = await auditLog.verify();
    expect(verif.valid).toBe(true);
  });

  it('findBrokenIndex retourne -1 si chain saine', async () => {
    await auditLog.record('a');
    expect(await auditLog.findBrokenIndex()).toBe(-1);
  });

  it('findBrokenIndex retourne l index brisé sinon', async () => {
    for (let i = 0; i < 4; i++) await auditLog.record(`b.${i}`);
    const raw = JSON.parse(localStorage.getItem('ax_audit_log_v13') ?? '[]');
    raw[1].action = 'tampered';
    localStorage.setItem('ax_audit_log_v13', JSON.stringify(raw));
    auditLog.reload();
    expect(await auditLog.findBrokenIndex()).toBe(1);
  });

  it('rebuildChainFrom ajoute entry trace audit.chain_rebuilt', async () => {
    for (let i = 0; i < 3; i++) await auditLog.record(`t.${i}`);
    await auditLog.rebuildChainFrom(0);
    const traces = auditLog.getEntries({ action: 'audit.chain_rebuilt' });
    expect(traces.length).toBeGreaterThan(0);
    expect(traces[0]?.actor).toBe('system');
  });
});
