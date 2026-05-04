/**
 * Tests apex-knowledge-base.ts (RAG GitHub API).
 *
 * Mock fetch GitHub API + vault.readKey pour tests offline.
 * Couvre : searchCode, getFile, listFiles, getRecentCommits, getOpenIssues,
 * searchPullRequests, getReadme, getProjectMetadata, repos config, cache, index.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { apexKnowledgeBase } from '../../services/apex-knowledge-base.js';
import { vault } from '../../services/vault.js';

const SAMPLE_FILE_CONTENT_B64 = btoa('Hello from CMCteams\nLine 2');

describe('apex-knowledge-base service', () => {
  beforeEach(() => {
    localStorage.clear();
    apexKnowledgeBase.clearCache();
    vi.restoreAllMocks();
    vi.spyOn(vault, 'readKey').mockResolvedValue('ghp_fake_token_for_tests_only');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('repos configuration', () => {
    it('default repo si rien configuré', () => {
      const repos = apexKnowledgeBase.listRepos();
      expect(repos).toEqual(['9r4rxssx64-creator/CMCteams']);
    });

    it('addRepo accepte format owner/repo valide', () => {
      const r = apexKnowledgeBase.addRepo('kevin/MyProject');
      expect(r.ok).toBe(true);
      expect(apexKnowledgeBase.listRepos()).toContain('kevin/MyProject');
    });

    it('addRepo refuse format invalide', () => {
      const r = apexKnowledgeBase.addRepo('not-a-valid-format');
      expect(r.ok).toBe(false);
      expect(r.reason).toContain('Format');
    });

    it('addRepo idempotent (no duplicate)', () => {
      apexKnowledgeBase.addRepo('foo/bar');
      apexKnowledgeBase.addRepo('foo/bar');
      const list = apexKnowledgeBase.listRepos().filter((x) => x === 'foo/bar');
      expect(list.length).toBe(1);
    });

    it('removeRepo retire de la liste', () => {
      apexKnowledgeBase.addRepo('foo/bar');
      apexKnowledgeBase.removeRepo('foo/bar');
      expect(apexKnowledgeBase.listRepos()).not.toContain('foo/bar');
    });
  });

  describe('searchCode', () => {
    it('searchCode retourne résultats parsés depuis GitHub API', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
        items: [
          {
            path: 'apex-ai/v13/core/store.ts',
            url: 'https://api.github.com/...',
            html_url: 'https://github.com/9r4rxssx64-creator/CMCteams/blob/main/apex-ai/v13/core/store.ts',
            score: 1.2,
            repository: { full_name: '9r4rxssx64-creator/CMCteams' },
          },
        ],
      }), { status: 200 }));

      const r = await apexKnowledgeBase.searchCode('store');
      expect(r.length).toBe(1);
      expect(r[0]?.path).toContain('store.ts');
      expect(r[0]?.score).toBe(1.2);
    });

    it('searchCode 403 → array vide (rate limit)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('rate limited', { status: 403 }));
      const r = await apexKnowledgeBase.searchCode('test');
      expect(r).toEqual([]);
    });

    it('searchCode utilise cache 1h', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ items: [] }), { status: 200 }));
      await apexKnowledgeBase.searchCode('cached');
      await apexKnowledgeBase.searchCode('cached');
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('searchCode bump index local pour fichiers consultés', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
        items: [{ path: 'README.md', url: '', html_url: '', score: 1, repository: { full_name: 'foo/bar' } }],
      }), { status: 200 }));
      await apexKnowledgeBase.searchCode('readme');
      const stats = apexKnowledgeBase.getStats();
      expect(stats.index_entries).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getFile', () => {
    it('getFile décode base64 → string UTF-8', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
        type: 'file',
        content: SAMPLE_FILE_CONTENT_B64,
        size: 26,
        sha: 'abc123',
        encoding: 'base64',
      }), { status: 200 }));

      const f = await apexKnowledgeBase.getFile('README.md');
      expect(f).not.toBeNull();
      expect(f?.content).toContain('Hello from CMCteams');
      expect(f?.sha).toBe('abc123');
    });

    it('getFile retourne null si type !== file', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
        type: 'dir',
      }), { status: 200 }));
      const f = await apexKnowledgeBase.getFile('some-dir');
      expect(f).toBeNull();
    });

    it('getFile 404 → null', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('not found', { status: 404 }));
      const f = await apexKnowledgeBase.getFile('does-not-exist.ts');
      expect(f).toBeNull();
    });
  });

  describe('listFiles', () => {
    it('listFiles retourne array d\'entries', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify([
        { path: 'a.ts', type: 'file', size: 100, sha: 's1' },
        { path: 'sub', type: 'dir', size: 0, sha: 's2' },
      ]), { status: 200 }));

      const list = await apexKnowledgeBase.listFiles('apex-ai/v13/core');
      expect(list.length).toBe(2);
      expect(list[0]?.type).toBe('file');
      expect(list[1]?.type).toBe('dir');
    });

    it('listFiles directory vide → racine repo', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));
      await apexKnowledgeBase.listFiles('');
      const calledUrl = fetchSpy.mock.calls[0]?.[0] as string;
      expect(calledUrl).toContain('/contents');
      expect(calledUrl).not.toContain('/contents/');
    });
  });

  describe('getRecentCommits', () => {
    it('getRecentCommits retourne commits parsés', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify([
        {
          sha: 'sha1',
          html_url: 'https://github.com/.../commit/sha1',
          commit: {
            message: 'feat: add knowledge-base',
            author: { name: 'Kevin', date: '2026-05-04T12:00:00Z' },
          },
        },
      ]), { status: 200 }));

      const commits = await apexKnowledgeBase.getRecentCommits(5);
      expect(commits.length).toBe(1);
      expect(commits[0]?.sha).toBe('sha1');
      expect(commits[0]?.message).toContain('knowledge-base');
      expect(commits[0]?.date).toBeGreaterThan(0);
    });

    it('getRecentCommits limit clamp [1..100]', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));
      await apexKnowledgeBase.getRecentCommits(99999);
      const url = fetchSpy.mock.calls[0]?.[0] as string;
      expect(url).toContain('per_page=100');
    });
  });

  describe('getOpenIssues', () => {
    it('getOpenIssues filtre out PRs (qui ont pull_request key)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify([
        { number: 1, title: 'Bug X', body: '...', state: 'open', user: { login: 'kevin' }, labels: [{ name: 'bug' }], html_url: 'u1', created_at: '2026-05-04T10:00:00Z' },
        { number: 2, title: 'PR Y', pull_request: {}, state: 'open', user: { login: 'kevin' }, labels: [], html_url: 'u2', created_at: '2026-05-04T11:00:00Z' },
      ]), { status: 200 }));

      const issues = await apexKnowledgeBase.getOpenIssues();
      expect(issues.length).toBe(1);
      expect(issues[0]?.title).toBe('Bug X');
      expect(issues[0]?.labels).toContain('bug');
    });
  });

  describe('searchPullRequests', () => {
    it('searchPullRequests détecte merged via merged_at', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify([
        { number: 10, title: 'Add feature', state: 'closed', merged_at: '2026-05-03T12:00:00Z', user: { login: 'kevin' }, head: { ref: 'feature/x' }, html_url: 'pr10', created_at: '2026-05-02T12:00:00Z' },
      ]), { status: 200 }));

      const prs = await apexKnowledgeBase.searchPullRequests('all');
      expect(prs.length).toBe(1);
      expect(prs[0]?.state).toBe('merged');
    });
  });

  describe('getReadme', () => {
    it('getReadme décode base64', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
        content: btoa('# CMCteams\nProject readme'),
      }), { status: 200 }));

      const readme = await apexKnowledgeBase.getReadme();
      expect(readme).toContain('CMCteams');
    });
  });

  describe('getProjectMetadata', () => {
    it('getProjectMetadata parse repo info', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
        name: 'CMCteams',
        full_name: '9r4rxssx64-creator/CMCteams',
        description: 'Casino Monaco apps',
        language: 'TypeScript',
        stargazers_count: 5,
        size: 1234,
        updated_at: '2026-05-04T12:00:00Z',
      }), { status: 200 }));

      const meta = await apexKnowledgeBase.getProjectMetadata();
      expect(meta?.name).toBe('CMCteams');
      expect(meta?.language).toBe('TypeScript');
      expect(meta?.stars).toBe(5);
    });
  });

  describe('formatForSystemPrompt', () => {
    it('retourne string formaté avec repos configurés', () => {
      const out = apexKnowledgeBase.formatForSystemPrompt();
      expect(out).toContain('Base de connaissances');
      expect(out).toContain('CMCteams');
      expect(out).toContain('search_repo_code');
    });

    it('inclut top fichiers consultés si index non vide', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
        items: [{ path: 'apex-ai/v13/core/store.ts', url: '', html_url: '', score: 1, repository: { full_name: 'foo/bar' } }],
      }), { status: 200 }));
      await apexKnowledgeBase.searchCode('q');
      const out = apexKnowledgeBase.formatForSystemPrompt();
      expect(out).toContain('store.ts');
    });
  });

  describe('clearCache + getStats', () => {
    it('clearCache retourne nombre vidé', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ items: [] }), { status: 200 }));
      await apexKnowledgeBase.searchCode('x');
      const r = apexKnowledgeBase.clearCache();
      expect(r.cleared).toBeGreaterThanOrEqual(1);
    });

    it('getStats retourne snapshot', () => {
      const stats = apexKnowledgeBase.getStats();
      expect(stats.repos).toBeGreaterThan(0);
      expect(typeof stats.cache_entries).toBe('number');
    });

    it('getStats has_token reflète localStorage', () => {
      localStorage.setItem('ax_github_token', 'ghp_real_token_xxxxxxxxxx');
      const stats = apexKnowledgeBase.getStats();
      expect(stats.has_token).toBe(true);
    });
  });

  describe('init idempotent', () => {
    it('init() call multiple no-op', () => {
      apexKnowledgeBase.init();
      apexKnowledgeBase.init();
      apexKnowledgeBase.init();
      /* No throw, OK */
      expect(true).toBe(true);
    });
  });
});
