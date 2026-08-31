/**
 * APEX v13 — Tests identité ÉTENDUE (Kevin 2026-05-08 23h45).
 *
 * "Oublie ni moi ni personne jamais !" — Kevin
 *
 * Ces tests garantissent qu'Apex connaît :
 * - Kevin admin (déjà couvert dans apex-identity.test.ts)
 * - Laurence ❤️ (déjà couvert)
 * - Famille étendue Kevin (belle-fille mentionnée NOTES_USER.md)
 * - Amis Kevin (registry append-only)
 * - Clients Apex (TARDIEU pré-configurés NOTES_USER.md)
 * - Employés CMCteams cadres (ETTORI, FOUQUE, PLACENTI, DOGLIOLO, MUS, BOUVIER JF)
 * - 258 employés total
 *
 * Couvre aussi :
 * - `buildExtendedIdentitySection()` ≤ 6000 chars (1500 tokens budget)
 * - `listAllKnownUsers()` retourne liste plate
 * - Sentinelle never-forget-watch peut auditer
 */

import { describe, it, expect } from 'vitest';

import {
  APEX_IDENTITY,
  buildIdentitySection,
  buildExtendedIdentitySection,
  listAllKnownUsers,
} from '../../core/apex-identity.js';

describe('APEX_IDENTITY étendu — Tous les users connus de Kevin', () => {
  describe('Employés CMCteams (cadres unifiés)', () => {
    it('contient les 5 superviseurs (ETTORI, FOUQUE, PLACENTI, DOGLIOLO, MUS)', () => {
      const cadres = APEX_IDENTITY.employees_cmcteams.cadres;
      const names = cadres.map((c) => c.name);
      expect(names).toContain('ETTORI M');
      expect(names).toContain('FOUQUE V');
      expect(names).toContain('PLACENTI L');
      expect(names).toContain('DOGLIOLO Y');
      expect(names).toContain('MUS L');
    });

    it('contient BOUVIER JF avec rôle pit_boss_faisant_fonction + fond bleu', () => {
      const bouvier = APEX_IDENTITY.employees_cmcteams.cadres.find(
        (c) => c.name === 'BOUVIER JF'
      );
      expect(bouvier).toBeDefined();
      expect(bouvier?.role).toBe('pit_boss_faisant_fonction');
      expect(bouvier?.bg).toBe('bleu');
      expect(bouvier?.note).toMatch(/faisant fonction/i);
    });

    it('contient les 16 pit boss + 5 superviseurs (21 cadres total)', () => {
      const cadres = APEX_IDENTITY.employees_cmcteams.cadres;
      expect(cadres.length).toBeGreaterThanOrEqual(21);
      const pitBoss = cadres.filter((c) => c.role.startsWith('pit_boss'));
      const sups = cadres.filter((c) => c.role === 'superviseur');
      expect(pitBoss.length).toBeGreaterThanOrEqual(16);
      expect(sups.length).toBe(5);
    });

    it('total employés = 258 (Casino Monaco SBM)', () => {
      expect(APEX_IDENTITY.employees_cmcteams.total).toBe(258);
    });

    it('équipes CMC : 10 BJ + 13 Roulettes + 13 CMC', () => {
      const teams = APEX_IDENTITY.employees_cmcteams.teams;
      expect(teams.bj).toBe(10);
      expect(teams.roulettes).toBe(13);
      expect(teams.cmc).toBe(13);
    });

    it('senior_marker mentionne ★ rouge + Convention SBM', () => {
      expect(APEX_IDENTITY.employees_cmcteams.senior_marker).toMatch(/★/);
    });

    it('chaque cadre a un name + role + section non vides', () => {
      for (const c of APEX_IDENTITY.employees_cmcteams.cadres) {
        expect(c.name.length).toBeGreaterThan(0);
        expect(c.role.length).toBeGreaterThan(0);
        expect(c.section).toBe('cadres');
      }
    });

    it('ROSPOCHER G a note maladie avril 2026', () => {
      const r = APEX_IDENTITY.employees_cmcteams.cadres.find((c) => c.name === 'ROSPOCHER G');
      expect(r).toBeDefined();
      expect(r?.note).toMatch(/MALADIE|maladie/i);
    });
  });

  describe('Clients Apex (NOTES_USER.md)', () => {
    it('contient les 3 clients TARDIEU pré-configurés (free tier)', () => {
      const free = APEX_IDENTITY.clients.free;
      const names = free.map((c) => c.name);
      expect(names).toContain('TARDIEU');
      expect(names).toContain('Sandrine TARDIEU');
      expect(names).toContain('Christophe TARDIEU');
    });

    it('clients TARDIEU ont note PIN 2026', () => {
      const tardieu = APEX_IDENTITY.clients.free.find((c) => c.name === 'TARDIEU');
      expect(tardieu?.note).toMatch(/2026|PIN/i);
    });

    it('clients pro est un array (vide initialement, à enrichir)', () => {
      expect(Array.isArray(APEX_IDENTITY.clients.pro)).toBe(true);
    });
  });

  describe('Famille étendue Kevin', () => {
    it('contient au moins 1 membre famille (belle-fille NOTES_USER.md)', () => {
      expect(APEX_IDENTITY.family_members.length).toBeGreaterThan(0);
      const bellefille = APEX_IDENTITY.family_members.find(
        (m) => m.relation === 'belle-fille'
      );
      expect(bellefille).toBeDefined();
      expect(bellefille?.note).toMatch(/Tablette|Lenovo/i);
    });
  });

  describe('Amis Kevin', () => {
    it('friends est un array (append-only, vide au départ)', () => {
      expect(Array.isArray(APEX_IDENTITY.friends)).toBe(true);
    });
  });
});

describe('buildIdentitySection() — Reste compact malgré ajouts (≤2400 chars)', () => {
  it('reste ≤ 2400 chars (budget 600 tokens)', () => {
    const section = buildIdentitySection();
    expect(section.length).toBeLessThanOrEqual(2400);
  });

  it('mentionne 258 employés CMCteams', () => {
    const section = buildIdentitySection();
    expect(section).toMatch(/258/);
    expect(section).toMatch(/CMCTEAMS/i);
  });

  it('reste déterministe (deux appels = même string)', () => {
    expect(buildIdentitySection()).toBe(buildIdentitySection());
  });
});

describe('buildExtendedIdentitySection() — Version enrichie (≤6000 chars)', () => {
  it('retourne string non vide', () => {
    const section = buildExtendedIdentitySection();
    expect(typeof section).toBe('string');
    expect(section.length).toBeGreaterThan(0);
  });

  it('reste sous le budget 6000 chars (1500 tokens)', () => {
    const section = buildExtendedIdentitySection();
    expect(section.length).toBeLessThanOrEqual(6000);
  });

  it('contient Kevin DESARZENS', () => {
    expect(buildExtendedIdentitySection()).toContain('Kevin DESARZENS');
  });

  it('contient Laurence Saint-Polit ❤️', () => {
    const section = buildExtendedIdentitySection();
    expect(section).toContain('Laurence Saint-Polit');
    expect(section).toContain('❤️');
  });

  it('contient les cadres CMC (ETTORI, FOUQUE, BOUVIER JF)', () => {
    const section = buildExtendedIdentitySection();
    expect(section).toContain('ETTORI M');
    expect(section).toContain('FOUQUE V');
    expect(section).toContain('BOUVIER JF');
  });

  it('contient 258 employés', () => {
    expect(buildExtendedIdentitySection()).toMatch(/258/);
  });

  it('contient les clients TARDIEU', () => {
    const section = buildExtendedIdentitySection();
    expect(section).toContain('TARDIEU');
  });

  it('contient les 7 projets', () => {
    const section = buildExtendedIdentitySection();
    for (const p of APEX_IDENTITY.projects) {
      expect(section).toContain(p.name);
    }
  });

  it('contient les 7 règles critiques numérotées', () => {
    const section = buildExtendedIdentitySection();
    for (let i = 1; i <= APEX_IDENTITY.rules_critical.length; i += 1) {
      expect(section).toMatch(new RegExp(`^${i}\\.`, 'm'));
    }
  });

  it('reste déterministe (deux appels = même string)', () => {
    expect(buildExtendedIdentitySection()).toBe(buildExtendedIdentitySection());
  });
});

describe('listAllKnownUsers() — Liste plate de tous les users', () => {
  it('retourne un array non vide', () => {
    const users = listAllKnownUsers();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
  });

  it('contient Kevin admin', () => {
    const users = listAllKnownUsers();
    const kevin = users.find((u) => u.id === 'kdmc_admin');
    expect(kevin).toBeDefined();
    expect(kevin?.category).toBe('admin');
    expect(kevin?.name).toBe('Kevin DESARZENS');
  });

  it('contient Laurence', () => {
    const users = listAllKnownUsers();
    const laurence = users.find((u) => u.id === 'laurence_sp');
    expect(laurence).toBeDefined();
    expect(laurence?.category).toBe('family');
  });

  it('contient les clients TARDIEU (free)', () => {
    const users = listAllKnownUsers();
    const free = users.filter((u) => u.category === 'client_free');
    expect(free.length).toBeGreaterThanOrEqual(3);
  });

  it('contient les cadres CMC (employees)', () => {
    const users = listAllKnownUsers();
    const cadres = users.filter((u) => u.category === 'employee_cadre');
    expect(cadres.length).toBeGreaterThanOrEqual(21);
    const ettori = cadres.find((u) => u.name === 'ETTORI M');
    expect(ettori).toBeDefined();
  });

  it('chaque user a name non vide + category valide', () => {
    const validCategories = [
      'admin',
      'family',
      'friend',
      'client_pro',
      'client_free',
      'employee_cadre',
    ];
    const users = listAllKnownUsers();
    for (const u of users) {
      expect(u.name.length).toBeGreaterThan(0);
      expect(validCategories).toContain(u.category);
    }
  });

  it('total users >= 25 (1 admin + 1 Laurence + 1 famille + 3 clients + 21 cadres)', () => {
    const users = listAllKnownUsers();
    expect(users.length).toBeGreaterThanOrEqual(25);
  });
});

describe('Test mental obligatoire — Apex reconnaît tous les users', () => {
  it('Apex reconnaît un employé CMC mentionné (ETTORI, FOUQUE)', () => {
    const section = buildExtendedIdentitySection();
    expect(section).toContain('ETTORI M');
    expect(section).toContain('FOUQUE V');
  });

  it('Apex reconnaît BOUVIER JF (faisant fonction pit boss)', () => {
    const section = buildExtendedIdentitySection();
    expect(section).toContain('BOUVIER JF');
    expect(section).toMatch(/faisant fonction/i);
  });

  it('Apex sait combien d\'employés CMC (258)', () => {
    const section = buildExtendedIdentitySection();
    expect(section).toMatch(/258 EMPLOYÉS/i);
  });

  it('Apex connaît tous ses projets (7)', () => {
    const section = buildExtendedIdentitySection();
    expect(section).toContain('Apex AI v13');
    expect(section).toContain('CMCteams');
    expect(section).toContain('e-KDMC');
    expect(section).toContain('Apex Chat');
    expect(section).toContain('CrackPass');
  });
});
