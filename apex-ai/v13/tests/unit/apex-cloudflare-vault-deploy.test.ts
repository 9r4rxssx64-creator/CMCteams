/**
 * Tests apex-cloudflare-vault-deploy v13.4.143 (Kevin "100/100 réel").
 *
 * Module : services/apex-cloudflare-vault-deploy.ts (400 lines, ~360 stmts, était 14%).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../core/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), debug: vi.fn(), error: vi.fn() },
}));

const { mockVault, mockApexVaultImport } = vi.hoisted(() => ({
  mockVault: { readKey: vi.fn() },
  mockApexVaultImport: { importFromJson: vi.fn() },
}));

vi.mock('../../services/vault.js', () => ({ vault: mockVault }));
vi.mock('../../services/apex-vault-import.js', () => ({ apexVaultImport: mockApexVaultImport }));

import { apexCloudflareVaultDeploy } from '../../services/apex-cloudflare-vault-deploy.js';

describe('apex-cloudflare-vault-deploy (v13.4.143 coverage)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockVault.readKey.mockResolvedValue('');
    mockApexVaultImport.importFromJson.mockResolvedValue({ ok: true, restored: 0 });
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('readCloudflareToken', () => {
    it('retourne null si aucun token dans vault', async () => {
      const t = await apexCloudflareVaultDeploy.readCloudflareToken();
      expect(t).toBeNull();
    });

    it('retourne token si présent', async () => {
      mockVault.readKey.mockImplementation(async (k: string) => {
        if (k === 'ax_cloudflare_token') return 'cf_test_token_xxxxxx';
        return '';
      });
      const t = await apexCloudflareVaultDeploy.readCloudflareToken();
      expect(t).toBe('cf_test_token_xxxxxx');
    });

    it('teste fallback storage keys', async () => {
      mockVault.readKey.mockImplementation(async (k: string) => {
        if (k === 'ax_cloudflare_auth_token') return 'token_via_alt_key';
        return '';
      });
      const t = await apexCloudflareVaultDeploy.readCloudflareToken();
      expect(t).toBe('token_via_alt_key');
    });
  });

  describe('hashPin', () => {
    it('retourne hash SHA-256 hex 64 chars', async () => {
      const hash = await apexCloudflareVaultDeploy.hashPin('123456');
      expect(hash).toBeTypeOf('string');
      expect(hash.length).toBe(64);
      expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
    });

    it('hash déterministe (même pin = même hash)', async () => {
      const h1 = await apexCloudflareVaultDeploy.hashPin('200807');
      const h2 = await apexCloudflareVaultDeploy.hashPin('200807');
      expect(h1).toBe(h2);
    });

    it('hash différent pour pin différent', async () => {
      const h1 = await apexCloudflareVaultDeploy.hashPin('111111');
      const h2 = await apexCloudflareVaultDeploy.hashPin('222222');
      expect(h1).not.toBe(h2);
    });
  });

  describe('initInfra', () => {
    it('retourne erreur si pas de token', async () => {
      const r = await apexCloudflareVaultDeploy.initInfra();
      expect(r.ok).toBe(false);
      expect(r.error).toBe('no_cloudflare_token_in_vault');
    });

    it('retourne erreur si pas account_id récupérable', async () => {
      mockVault.readKey.mockImplementation(async (k: string) => {
        if (k === 'ax_cloudflare_token') return 'cf_xxx_long_enough_token_xxxxxx';
        return '';
      });
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 401 }));
      const r = await apexCloudflareVaultDeploy.initInfra();
      expect(r.ok).toBe(false);
      expect(r.error).toBe('no_cloudflare_account_found');
    });

    it('crée KV namespace si absent', async () => {
      mockVault.readKey.mockImplementation(async (k: string) => {
        if (k === 'ax_cloudflare_token') return 'cf_xxx_long_enough_token_xxxxxx';
        return '';
      });
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ result: [{ id: 'acct_123', name: 'Kevin' }] }), { status: 200 }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ result: [] }), { status: 200 }),
        ) /* findKv empty */
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ result: { id: 'ns_new', title: 'apex-vault-kevin' } }), { status: 200 }),
        ); /* create */
      const r = await apexCloudflareVaultDeploy.initInfra();
      expect(r.ok).toBe(true);
      expect(r.account_id).toBe('acct_123');
      expect(r.namespace_id).toBe('ns_new');
    });

    it('utilise KV existant si trouvé', async () => {
      mockVault.readKey.mockImplementation(async (k: string) => {
        if (k === 'ax_cloudflare_token') return 'cf_xxx_long_enough_token_xxxxxx';
        return '';
      });
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ result: [{ id: 'acct_456' }] }), { status: 200 }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ result: [{ id: 'ns_existing', title: 'apex-vault-kevin' }] }), { status: 200 }),
        );
      const r = await apexCloudflareVaultDeploy.initInfra();
      expect(r.ok).toBe(true);
      expect(r.namespace_id).toBe('ns_existing');
    });
  });

  describe('runDiagnostic', () => {
    it('détecte token absent', async () => {
      const d = await apexCloudflareVaultDeploy.runDiagnostic();
      expect(d.token_present).toBe(false);
      expect(d.token_valid).toBe(false);
      expect(d.error_reason).toContain('Coffre');
    });

    it('détecte token invalide 401', async () => {
      mockVault.readKey.mockImplementation(async (k: string) => {
        if (k === 'ax_cloudflare_token') return 'cf_invalid_token_xxxxxxxx';
        return '';
      });
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 401 }));
      const d = await apexCloudflareVaultDeploy.runDiagnostic();
      expect(d.token_present).toBe(true);
      expect(d.token_valid).toBe(false);
      expect(d.http_status).toBe(401);
    });

    it('détecte token valide + account', async () => {
      mockVault.readKey.mockImplementation(async (k: string) => {
        if (k === 'ax_cloudflare_token') return 'cf_valid_token_xxxxxxxx';
        return '';
      });
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response('{}', { status: 200 })) /* verify */
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ result: [{ id: 'acct_x' }] }), { status: 200 }),
        ) /* accounts */
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ result: { name: 'Kevin Account' } }), { status: 200 }),
        ) /* account detail */
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ result: [] }), { status: 200 }),
        ) /* kv namespaces */
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ result: [] }), { status: 200 }),
        ); /* workers */
      const d = await apexCloudflareVaultDeploy.runDiagnostic();
      expect(d.token_valid).toBe(true);
      expect(d.account_id).toBe('acct_x');
      expect(d.kv_permission).toBe(true);
    });

    it('détecte KV permission 403', async () => {
      mockVault.readKey.mockImplementation(async (k: string) => {
        if (k === 'ax_cloudflare_token') return 'cf_partial_token_xxxxxxxx';
        return '';
      });
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response('{}', { status: 200 })) /* verify */
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ result: [{ id: 'acct_y' }] }), { status: 200 }),
        ) /* accounts */
        .mockResolvedValueOnce(new Response('{}', { status: 200 })) /* account detail */
        .mockResolvedValueOnce(new Response('', { status: 403 })); /* kv 403 */
      const d = await apexCloudflareVaultDeploy.runDiagnostic();
      expect(d.kv_permission).toBe(false);
      expect(d.error_reason).toContain('permission');
    });
  });

  describe('pushBackup', () => {
    it('retourne erreur si pas de token', async () => {
      const r = await apexCloudflareVaultDeploy.pushBackup();
      expect(r.ok).toBe(false);
      expect(r.error).toBe('no_cloudflare_token');
    });

    it('retourne erreur si pas de PIN admin', async () => {
      mockVault.readKey.mockImplementation(async (k: string) => {
        if (k === 'ax_cloudflare_token') return 'cf_token_long_enough_xxxxxxxx';
        return '';
      });
      localStorage.setItem('apex_v13_cf_account_id', 'acct');
      localStorage.setItem('apex_v13_cf_namespace_id', 'ns');
      const r = await apexCloudflareVaultDeploy.pushBackup();
      expect(r.ok).toBe(false);
      expect(r.error).toBe('no_pin_admin_set');
    });
  });

  describe('pullBackup', () => {
    it('retourne erreur si pas de token', async () => {
      const r = await apexCloudflareVaultDeploy.pullBackup();
      expect(r.ok).toBe(false);
      expect(r.error).toBe('no_cloudflare_token');
    });

    it('retourne erreur si pas de PIN admin', async () => {
      mockVault.readKey.mockImplementation(async (k: string) => {
        if (k === 'ax_cloudflare_token') return 'cf_token_long_enough_xxxxxxxx';
        return '';
      });
      localStorage.setItem('apex_v13_cf_account_id', 'acct');
      localStorage.setItem('apex_v13_cf_namespace_id', 'ns');
      const r = await apexCloudflareVaultDeploy.pullBackup();
      expect(r.ok).toBe(false);
      expect(r.error).toBe('no_pin_admin_set');
    });
  });
});
