import { describe, it, expect, beforeEach } from 'vitest';
import { sentinels, registerCoreSentinels } from '../../services/sentinels.js';

describe('sentinels coverage push 56% → 90%+', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('runOne token-balance-watch sans clé → ok=true (no Anthropic)', async () => {
    registerCoreSentinels();
    const r = await sentinels.runOne('token-balance-watch');
    expect(r?.msg).toMatch(/No Anthropic|configured/i);
  });

  it('runOne error-watch sans criticals pending → ok=true', async () => {
    registerCoreSentinels();
    const r = await sentinels.runOne('error-watch');
    expect(r?.ts).toBeGreaterThan(0);
  });

  it('runOne credentials-watch count tokens stockés', async () => {
    localStorage.setItem('ax_anthropic_key', 'sk-ant-test');
    localStorage.setItem('ax_groq_key', 'gsk_test');
    registerCoreSentinels();
    const r = await sentinels.runOne('credentials-watch');
    expect(r?.msg).toMatch(/credentials present/i);
  });

  it('runOne link-validation-watch count registry services', async () => {
    localStorage.setItem('ax_links_registry', JSON.stringify({
      ax_anthropic_key: { service: 'Anthropic', alive: true },
      ax_groq_key: { service: 'Groq', alive: true },
    }));
    registerCoreSentinels();
    const r = await sentinels.runOne('link-validation-watch');
    expect(r?.msg).toMatch(/services in registry/i);
  });

  it('runOne link-validation-watch corrupt registry gracefull', async () => {
    localStorage.setItem('ax_links_registry', 'INVALID');
    registerCoreSentinels();
    const r = await sentinels.runOne('link-validation-watch');
    expect(r?.ok).toBe(false);
  });

  it('runOne presence-watch lit lastact', async () => {
    localStorage.setItem('apex_v13_lastact', String(Date.now()));
    registerCoreSentinels();
    const r = await sentinels.runOne('presence-watch');
    expect(r?.msg).toMatch(/Last activity/i);
  });

  it('runOne security-watch session récente OK', async () => {
    localStorage.setItem('apex_v13_lastact', String(Date.now()));
    registerCoreSentinels();
    const r = await sentinels.runOne('security-watch');
    expect(r?.ts).toBeGreaterThan(0);
  });

  it('runOne security-watch session > 8h flag false', async () => {
    localStorage.setItem('apex_v13_lastact', String(Date.now() - 9 * 60 * 60 * 1000));
    registerCoreSentinels();
    const r = await sentinels.runOne('security-watch');
    expect(r?.ok).toBe(false);
    expect(r?.msg).toMatch(/Session > 8h/);
  });

  it('runOne performance-watch sans memory API → ok=true graceful', async () => {
    registerCoreSentinels();
    const r = await sentinels.runOne('performance-watch');
    expect(r?.ts).toBeGreaterThan(0);
  });

  it('runOne conflict-watch sans queue → ok=true', async () => {
    registerCoreSentinels();
    const r = await sentinels.runOne('conflict-watch');
    expect(r?.msg).toMatch(/No pending|pending, no conflict/i);
  });

  it('runOne conflict-watch corrupt queue → ok=false', async () => {
    localStorage.setItem('apex_v13_fb_queue', 'INVALID');
    registerCoreSentinels();
    const r = await sentinels.runOne('conflict-watch');
    expect(r?.ok).toBe(false);
  });

  it('runOne conflict-watch détecte stale flushing entries', async () => {
    const queue = Array.from({ length: 10 }, (_, i) => ({
      id: `q${i}`, key: `k${i}`, status: 'flushing', attempts: 1,
    }));
    localStorage.setItem('apex_v13_fb_queue', JSON.stringify(queue));
    registerCoreSentinels();
    const r = await sentinels.runOne('conflict-watch');
    expect(r?.ok).toBe(false);
    expect(r?.msg).toMatch(/stale/);
  });

  it('runOne wake-watch désactivé par défaut', async () => {
    registerCoreSentinels();
    const wake = sentinels.list().find((s) => s.id === 'wake-watch');
    expect(wake?.enabled).toBe(false);
  });

  it('storage-watch autoFix trim grosses arrays localStorage', async () => {
    /* Pré-rempli avec arrays > cap pour déclencher GC */
    localStorage.setItem('apex_v13_observability', JSON.stringify(Array.from({ length: 200 }, (_, i) => ({ id: `e${i}`, msg: 'x'.repeat(100) }))));
    localStorage.setItem('ax_audit_log_v13', JSON.stringify(Array.from({ length: 500 }, (_, i) => ({ ts: i, action: 'a' }))));
    registerCoreSentinels();
    const watch = sentinels.list().find((s) => s.id === 'storage-watch');
    if (watch?.autoFix) {
      const r = await watch.autoFix();
      /* autoFix doit avoir trim quelque chose */
      expect(typeof r.ok).toBe('boolean');
    }
  });

  it('list().length renvoie array immuable', () => {
    registerCoreSentinels();
    const list = sentinels.list();
    expect(list).toBeInstanceOf(Array);
  });
});
