/* GARDE — « les numéros de départ doivent être les MÊMES dans l'app et sur la page light ».
 *
 * Cause racine (ultra-review 2026-08-10) : la rotation des départs demande, pour chaque jour,
 * « cette personne est-elle à la table ? ». Cette liste de codes existait en DEUX exemplaires
 * (app + page light) qui avaient SILENCIEUSEMENT divergé :
 *   · l'app comptait DEPL / DEP / SS comme du TRAVAIL, la page light comme une ABSENCE
 *     → dès qu'un chef portait un de ces codes, TOUTE l'équipe obtenait des numéros
 *       différents entre l'app et la page (0 cas en juillet/août = piège latent, invisible).
 *   · les DEUX oubliaient CLM (arrêt longue maladie) → bug RÉEL mesuré sur août :
 *     EL MISSOURI O (BJ Éq.10) en CLM les jours 21-24 recevait quand même les numéros
 *     1,4,2,3 et faussait les numéros de ses 4 collègues (20 cellules).
 *     Une comparaison « app == light » ne peut PAS attraper ce cas : les deux se trompaient
 *     de la MÊME façon. D'où cette garde sur le CONTENU de la liste, pas seulement l'égalité.
 *
 * node tests/departs-abs-parity.test.mjs
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(ROOT, 'index.html'), 'utf8');
const light = readFileSync(join(ROOT, 'tools/departs/index.html'), 'utf8');

let pass = 0;
const fails = [];
const ok = (cond, msg) => (cond ? (pass++, true) : (fails.push(msg), false));

/* Extrait la liste DEP_ABS d'un fichier (déclarée une seule fois de chaque côté). */
function lireListe(src, quoi) {
  const m = src.match(/var DEP_ABS\s*=\s*\[([^\]]*)\]/);
  if (!m) { fails.push(`${quoi} : DEP_ABS introuvable (la liste a été renommée ou supprimée)`); return null; }
  return m[1].split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
}

const aApp = lireListe(app, 'app (index.html)');
const aLight = lireListe(light, 'page light (tools/departs/index.html)');

if (aApp && aLight) {
  /* 1. PARITÉ STRICTE — même contenu, sinon les numéros divergent entre les 2 surfaces. */
  const setA = [...aApp].sort().join('|');
  const setL = [...aLight].sort().join('|');
  const seulApp = aApp.filter((c) => !aLight.includes(c));
  const seulLight = aLight.filter((c) => !aApp.includes(c));
  ok(setA === setL,
    'les 2 listes DEP_ABS sont IDENTIQUES app ⇄ page light'
    + (setA !== setL ? ` — seulement dans l'app : [${seulApp}] · seulement dans la page : [${seulLight}]` : ''));

  /* 2. CONTENU — les cas TRANCHÉS PAR KEVIN ne doivent JAMAIS repartir en arrière.
        Règle : « rattaché à l'équipe → garde sa place ; seuls les vrais congés/arrêts la libèrent ». */
  ok(aApp.includes('CLM'),
    'CLM (arrêt longue maladie) = ABSENCE → pas de numéro de départ (bug réel août, EL MISSOURI O j21-24)');
  ok(!aApp.includes('PRT'),
    'PRT (« Prêt ») = TRAVAIL, GARDE son numéro — décision Kevin 2026-07-10 (leçon #140)');
  ['DEPL', 'DEP', 'SS'].forEach((c) => ok(!aApp.includes(c),
    `${c} (déplacement) = TRAVAIL, GARDE son numéro — décision Kevin 2026-08-10 (« B »), même logique que PRT`));
  ['RH', 'R', 'CP', 'M', 'AF'].forEach((c) => ok(aApp.includes(c),
    `${c} reste une absence (socle historique, aucune régression)`));
}

/* 3. CÂBLAGE — la rotation doit utiliser isWorkDep, PAS le isWork() global (76 usages :
      heures, couleurs, compteurs). Sinon on rechange les heures en croyant corriger les départs. */
const corps = (app.match(/function calcDepPos\([\s\S]*?\n\}/) || [''])[0];
ok(corps.length > 200, 'calcDepPos retrouvé dans l\'app');
ok(/isWorkDep\(/.test(corps),
  'calcDepPos utilise isWorkDep (test « à la table » dédié à la rotation)');
ok(!/[^p]isWork\(\(pl\[/.test(corps),
  'calcDepPos n\'utilise PLUS le isWork() global (qui pilote heures/couleurs/compteurs)');

console.log(`Parité des absences de départ : ${pass} vérification(s) OK, ${fails.length} échec(s)`);
fails.forEach((f) => console.log('  ✗ ' + f));
process.exit(fails.length ? 1 : 0);
