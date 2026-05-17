/**
 * Test régression v13.4.98 — Vault Firebase backup multi-uid restore.
 *
 * Kevin "Coffre tjs perd memoire" → cause racine : reinstall PWA wipe
 * localStorage 'apex_v13_uid' → getUid()='anon' → backup unreachable.
 *
 * Fix : getUid() fallback ADMIN_KEVIN_UID si pin admin présent OU last_known_name
 * contient Kevin. getAllKnownUids() retourne ALL uids pour scan exhaustif.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '../..');

describe('v13.4.98 vault-firebase-backup multi-uid fallback', () => {
  const src = readFileSync(resolve(ROOT, 'services/vault-firebase-backup.ts'), 'utf-8');

  it("getUid() fallback ADMIN_KEVIN_UID si pin admin présent", () => {
    expect(src).toContain("const ADMIN_KEVIN_UID = 'kdmc_admin'");
    expect(src).toContain("apex_v13_pin");
    expect(src).toMatch(/return ADMIN_KEVIN_UID/);
  });

  it("getUid() fallback last_known_name si contient kevin/desarzens", () => {
    expect(src).toContain('lastKnownName');
    expect(src).toMatch(/lastKnownName\.includes\('kevin'\)/);
    expect(src).toMatch(/lastKnownName\.includes\('desarzens'\)/);
  });

  it("getAllKnownUids() retourne array avec ADMIN_KEVIN_UID toujours", () => {
    expect(src).toContain('function getAllKnownUids()');
    expect(src).toContain("set.add(ADMIN_KEVIN_UID)");
  });

  it("fetch() scanne tous les uids (boucle for of allUids)", () => {
    expect(src).toMatch(/for \(const uid of allUids\)/);
  });

  it("listAll() merge backups depuis tous les uids (dedupe par key)", () => {
    expect(src).toContain('seenByKey');
    expect(src).toContain('getAllKnownUids');
  });
});

describe('v13.4.98 index.html anti-zoom INLINE', () => {
  const html = readFileSync(resolve(ROOT, 'index.html'), 'utf-8');

  it("script inline gesturestart/gesturechange/gestureend dans <head>", () => {
    /* Le script inline doit être AVANT le bundle JS bootstrap */
    expect(html).toMatch(/gesturestart[\s\S]*gesturechange[\s\S]*gestureend/);
    /* Doit être nonce-protégé pour CSP strict */
    expect(html).toMatch(/<script\s+nonce="APEX_BOOT_NONCE">[\s\S]*gesturestart/);
  });

  it("anti-zoom inline AVANT bootstrap.js module", () => {
    const gestureIdx = html.indexOf('gesturestart');
    const bootstrapIdx = html.indexOf('bootstrap.js');
    expect(gestureIdx).toBeGreaterThan(0);
    expect(bootstrapIdx).toBeGreaterThan(gestureIdx); /* gesture handler AVANT bootstrap */
  });

  it("touchend double-tap detection (<300ms)", () => {
    expect(html).toMatch(/lastTouchEnd[\s\S]*300/);
  });
});
