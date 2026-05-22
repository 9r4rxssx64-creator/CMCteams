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
  const src = readFileSync(resolve(ROOT, 'services/vault/vault-firebase-backup.ts'), 'utf-8');

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

/* v13.4.265 — describe 'anti-zoom INLINE' RÉÉCRIT : v13.4.248 a VOLONTAIREMENT
 * retiré le script inline gesturestart (zoom utilisateur réactivé pour
 * l'accessibilité — Apple HIG). Les anciens tests vérifiaient la présence du
 * bloqueur de zoom → obsolètes. On vérifie maintenant l'intention v13.4.248. */
describe('v13.4.248 index.html — zoom accessibilité réactivé', () => {
  const html = readFileSync(resolve(ROOT, 'index.html'), 'utf-8');

  it("viewport autorise le pinch-zoom (maximum-scale >= 5, pas user-scalable=no)", () => {
    expect(html).toMatch(/maximum-scale=5/);
    expect(html).not.toMatch(/user-scalable=no/);
  });

  it("pas de script inline gesturestart bloquant le zoom (retiré v13.4.248)", () => {
    expect(html).not.toMatch(/gesturestart[\s\S]*preventDefault/);
  });
});
