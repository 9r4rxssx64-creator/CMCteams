/**
 * Tests bundle-budget-check — audit Kevin v13.1.0.
 * Vérifie la fonction runBudgetCheck sans builds réels.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { runBudgetCheck } from '../../scripts/bundle-budget-check.js';

describe('bundle-budget-check', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'apex-budget-'));
  });

  afterEach(() => {
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      /* skip */
    }
  });

  it('reports empty + violations when dist missing', () => {
    const r = runBudgetCheck(join(tmpDir, 'no-such-dir'));
    expect(r.ok).toBe(false);
    expect(r.violations.length).toBeGreaterThan(0);
  });

  it('passes when bundle small enough', () => {
    /* Crée fichier entry minimal — quelques bytes ⇒ gzip très petit ⇒ ok */
    mkdirSync(join(tmpDir, 'core'), { recursive: true });
    writeFileSync(join(tmpDir, 'core', 'bootstrap-abc.js'), 'export default 1;');
    const r = runBudgetCheck(tmpDir);
    expect(r.ok).toBe(true);
    expect(r.reports.length).toBe(1);
    expect(r.reports[0]?.category).toBe('entry');
  });

  it('flags chunk over 80 KB gzip budget', () => {
    mkdirSync(join(tmpDir, 'chunks'), { recursive: true });
    /* Crée 250 KB de contenu non-compressible (random pattern) */
    let content = '';
    for (let i = 0; i < 250_000; i++) {
      content += String.fromCharCode(33 + (i * 7919) % 90);
    }
    writeFileSync(join(tmpDir, 'chunks', 'huge-chunk.js'), content);
    const r = runBudgetCheck(tmpDir);
    expect(r.ok).toBe(false);
    expect(r.violations.some((v) => v.includes('huge-chunk'))).toBe(true);
  });

  it('categorizes css as asset', () => {
    mkdirSync(join(tmpDir, 'assets', 'css'), { recursive: true });
    writeFileSync(join(tmpDir, 'assets', 'css', 'main-abc.css'), 'body{margin:0;}');
    const r = runBudgetCheck(tmpDir);
    expect(r.reports[0]?.category).toBe('asset');
  });
});
