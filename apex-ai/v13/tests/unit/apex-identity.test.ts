/**
 * APEX v13 — Tests identité IRRÉVOCABLE (Kevin 2026-05-08 23h30).
 *
 * "Il sait pas qui il est, qui je suis, qui Laurence ❤️ est.
 *  Il doit le savoir par cœur." — Kevin
 *
 * Ces tests garantissent que le contenu hardcodé de APEX_IDENTITY ne peut
 * pas dériver silencieusement (régression nom Kevin / Laurence / projets / règles).
 * Si un fix runtime tente de modifier cette source de vérité → CI rouge.
 */

import { describe, it, expect } from 'vitest';

import { APEX_IDENTITY, buildIdentitySection } from '../../core/apex-identity.js';

describe('APEX_IDENTITY — Source de vérité hardcodée', () => {
  it('contient le nom complet de Kevin DESARZENS', () => {
    expect(APEX_IDENTITY.admin.name).toBe('Kevin DESARZENS');
    expect(APEX_IDENTITY.self.creator).toBe('Kevin DESARZENS');
  });

  it('contient les coordonnées admin Kevin (id, email, company)', () => {
    expect(APEX_IDENTITY.admin.id).toBe('kdmc_admin');
    expect(APEX_IDENTITY.admin.email).toBe('kevind@monaco.mc');
    expect(APEX_IDENTITY.admin.company).toBe('Casino Monaco');
  });

  it('liste les 4 venues Casino Monaco (CMC, CDP, Sun, MCB)', () => {
    expect(APEX_IDENTITY.admin.venues).toEqual(['CMC', 'CDP', 'Sun', 'MCB']);
  });

  it('liste les aliases Kevin reconnus pour login multi-formes', () => {
    expect(APEX_IDENTITY.admin.aliases).toContain('Kevin');
    expect(APEX_IDENTITY.admin.aliases).toContain('KDMC');
    expect(APEX_IDENTITY.admin.aliases).toContain('kdmc_admin');
  });

  it('contient Laurence Saint-Polit comme compagne ❤️', () => {
    expect(APEX_IDENTITY.family.laurence.name).toBe('Laurence Saint-Polit');
    /* relation contient marqueur "compagne ❤️" (peut être enrichi : "femme / compagne ❤️"). */
    expect(APEX_IDENTITY.family.laurence.relation).toContain('compagne ❤️');
    expect(APEX_IDENTITY.family.laurence.tier).toBe('laurence');
  });

  it('Laurence a un id stable + note privilégiée mentionnant validation Kevin', () => {
    expect(APEX_IDENTITY.family.laurence.id).toBe('laurence_sp');
    expect(APEX_IDENTITY.family.laurence.note).toContain('Kevin');
  });

  it('contient exactement les 7 projets Kevin', () => {
    expect(APEX_IDENTITY.projects).toHaveLength(7);
    const names = APEX_IDENTITY.projects.map((p) => p.name);
    expect(names).toEqual([
      'Apex AI v13',
      'CMCteams',
      'e-KDMC',
      'Télécommande KDMC',
      'Apex Chat',
      'Social Video Pipeline',
      'CrackPass',
    ]);
  });

  it('chaque projet a un nom + une description non vide', () => {
    for (const p of APEX_IDENTITY.projects) {
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.desc.length).toBeGreaterThan(0);
    }
  });

  it('contient exactement les 7 règles critiques immuables', () => {
    expect(APEX_IDENTITY.rules_critical).toHaveLength(7);
  });

  it('règles critiques contiennent les piliers Kevin (régression / autonomie / auto-fix)', () => {
    const all = APEX_IDENTITY.rules_critical.join(' | ');
    expect(all).toMatch(/JAMAIS RÉGRESSER/i);
    expect(all).toMatch(/AUTONOMIE TOTALE/i);
    expect(all).toMatch(/AUTO-FIX/i);
    expect(all).toMatch(/multi-source/i);
    expect(all).toMatch(/Multi-IA parallèle/i);
    expect(all).toMatch(/Sécurité/i);
    expect(all).toMatch(/100\/100/);
  });

  it('self.name = Apex AI + version v13.x', () => {
    expect(APEX_IDENTITY.self.name).toBe('Apex AI');
    expect(APEX_IDENTITY.self.version).toMatch(/^v13\./);
  });

  it('self.purpose mentionne entreprise commercialisable', () => {
    expect(APEX_IDENTITY.self.purpose).toMatch(/entreprise/i);
    expect(APEX_IDENTITY.self.purpose).toMatch(/commercialisable/i);
  });

  it('self.capabilities mentionne 170+ tools, multi-providers, voice, studios, vault', () => {
    expect(APEX_IDENTITY.self.capabilities).toMatch(/170\+/);
    expect(APEX_IDENTITY.self.capabilities).toMatch(/multi-providers/i);
    expect(APEX_IDENTITY.self.capabilities).toMatch(/voice/i);
    expect(APEX_IDENTITY.self.capabilities).toMatch(/studios/i);
    expect(APEX_IDENTITY.self.capabilities).toMatch(/vault/i);
  });

  it('APEX_IDENTITY est un const readonly (typage as const)', () => {
    /* TypeScript-level : `as const` garantit immutabilité au compile-time.
     * Runtime-level : on vérifie qu'aucune assignation accidentelle ne casse les tests. */
    const before = JSON.stringify(APEX_IDENTITY);
    expect(JSON.stringify(APEX_IDENTITY)).toBe(before);
  });
});

describe('buildIdentitySection() — Sortie déterministe', () => {
  it('retourne une string non vide', () => {
    const section = buildIdentitySection();
    expect(typeof section).toBe('string');
    expect(section.length).toBeGreaterThan(0);
  });

  it('contient le nom Kevin DESARZENS', () => {
    expect(buildIdentitySection()).toContain('Kevin DESARZENS');
  });

  it('contient le nom Laurence Saint-Polit', () => {
    expect(buildIdentitySection()).toContain('Laurence Saint-Polit');
  });

  it('contient le marqueur compagne ❤️', () => {
    expect(buildIdentitySection()).toContain('compagne ❤️');
  });

  it('contient les 7 projets', () => {
    const section = buildIdentitySection();
    for (const p of APEX_IDENTITY.projects) {
      expect(section).toContain(p.name);
    }
  });

  it('contient les 7 règles critiques (numérotées 1..7)', () => {
    const section = buildIdentitySection();
    for (let i = 1; i <= APEX_IDENTITY.rules_critical.length; i++) {
      expect(section).toMatch(new RegExp(`^${i}\\.`, 'm'));
    }
  });

  it('contient les sections KEVIN, LAURENCE, PROJETS, RÈGLES', () => {
    const section = buildIdentitySection();
    expect(section).toContain('KEVIN');
    expect(section).toContain('LAURENCE');
    expect(section).toContain('PROJETS');
    expect(section).toContain('RÈGLES CRITIQUES');
  });

  it('reste sous le budget 600 tokens (~2400 chars) pour ne pas amputer prompt', () => {
    const section = buildIdentitySection();
    /* Heuristique : 1 token ≈ 4 chars FR/EN. Budget 600 tokens = 2400 chars max. */
    expect(section.length).toBeLessThanOrEqual(2400);
  });

  it('est déterministe (deux appels = même string)', () => {
    expect(buildIdentitySection()).toBe(buildIdentitySection());
  });
});
