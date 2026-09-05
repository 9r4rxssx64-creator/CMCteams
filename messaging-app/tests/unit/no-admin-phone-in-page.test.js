// Garde anti-régression SÉCU (v1.1.282) — audit 2026-09-05, faille P0.
//
// Le numéro admin de Kevin était écrit EN CLAIR dans index.html (servi à chaque
// visiteur). Or ce numéro + le code '000000' suffisaient à obtenir un jeton
// admin de 30 jours côté Worker → n'importe qui lisant le code source de la page
// devenait admin (accès aux vrais noms, téléphones, GPS de tous les membres).
//
// Ce test ÉCHOUE si un vrai numéro de téléphone admin réapparaît dans la page.
// Il ne teste PAS les exemples génériques (+33612345678) volontairement laissés
// dans les textes d'aide.
//
// Prouvé discriminant : remettre '+33672280277' dans index.html → ce test échoue.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX = join(__dirname, '..', '..', 'index.html');

describe('Sécurité — aucun numéro admin en clair dans la page publique', () => {
  const html = readFileSync(INDEX, 'utf8');

  it("le vrai numéro admin de Kevin n'apparaît nulle part dans index.html", () => {
    // Le numéro exact qui a fuité (sous toutes ses formes courantes).
    const fuites = ['+33672280277', '0672280277', '33672280277', '672280277'];
    const trouve = fuites.filter((n) => html.includes(n));
    expect(trouve, `Numéro admin en clair dans index.html : ${trouve.join(', ')}`).toEqual([]);
  });

  it("la reconnaissance admin côté client ne compare plus un numéro codé en dur", () => {
    // Aucune comparaison de type `=== '+33...'` ne doit rester : le serveur
    // (secret KEVIN_PHONE_E164) est seul juge, la page reconnaît par le NOM.
    expect(/===\s*['"]\+?33\d{9,}['"]/.test(html)).toBe(false);
  });
});
