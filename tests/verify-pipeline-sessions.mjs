/* GARDE-FOU — aucune session ne doit être oubliée, déliée ou perdue.
 *
 * Kevin 2026-09-02 : « Sois sûr de ne rien oublier, lier ou perdre de chaque
 * session. Et le pipeline entre elles toutes et les futures. »
 *
 * Le risque, concrètement : une session créée un soir, jamais inscrite au
 * registre, qui travaille dans son coin sur une branche que personne ne connaît
 * — et dont le travail disparaît quand son conteneur est recyclé. Ou deux
 * sessions qui poussent sur la MÊME branche et s'écrasent l'une l'autre.
 *
 * Ce test relie les deux sources et refuse tout écart :
 *   1. le registre `pipeline/sessions.json` est cohérent (branches uniques…) ;
 *   2. CHAQUE session listée dans SESSIONS-ET-BRANCHES.md est au registre ;
 *   3. CHAQUE session du registre est dans SESSIONS-ET-BRANCHES.md ;
 *   4. les branches concordent entre les deux documents ;
 *   5. l'outil du pipeline existe et répond.
 *
 * Lancer : node tests/verify-pipeline-sessions.mjs
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const R = { ok: [], ko: [] };
const chk = (c, m) => (c ? R.ok : R.ko).push(m);
const REG = 'pipeline/sessions.json';
const CARTE = 'SESSIONS-ET-BRANCHES.md';
const OUTIL = 'tools/pipeline/pipeline.mjs';

chk(existsSync(REG), `${REG} existe`);
chk(existsSync(OUTIL), `${OUTIL} existe`);
chk(existsSync(CARTE), `${CARTE} existe`);
if (R.ko.length) { R.ko.forEach((m) => console.log('  FAIL ' + m)); process.exit(1); }

/* --- 1. cohérence interne (déléguée à l'outil, source unique) --------------- */
let coherent = true;
try { execFileSync(process.execPath, [OUTIL, 'verifier'], { stdio: 'pipe' }); }
catch (_) { coherent = false; }
chk(coherent, coherent
  ? 'registre cohérent (branches uniques, messages bien adressés)'
  : `registre INCOHÉRENT — lance : node ${OUTIL} verifier`);

const reg = JSON.parse(readFileSync(REG, 'utf8'));
const sessions = reg.sessions || {};
chk(Object.keys(sessions).length > 0, `${Object.keys(sessions).length} sessions inscrites`);

/* --- 2/3/4. le registre et la carte disent-ils la MÊME chose ? -------------- */
/* La carte liste les branches dans un tableau markdown : `| Session | `branche` | … ` */
const carte = readFileSync(CARTE, 'utf8');
const branchesCarte = new Set(
  [...carte.matchAll(/`(claude\/[A-Za-z0-9._/-]+|publie-septembre)`/g)].map((m) => m[1])
);
const branchesReg = new Map(Object.entries(sessions).map(([id, s]) => [s.branche, id]));

const absentesRegistre = [...branchesCarte].filter((b) => !branchesReg.has(b));
chk(absentesRegistre.length === 0,
  absentesRegistre.length === 0
    ? `les ${branchesCarte.size} branches de la carte sont TOUTES au registre`
    : `OUBLIÉES au registre : ${absentesRegistre.join(', ')} — une session hors registre travaille sans que personne ne le sache`);

const absentesCarte = [...branchesReg.keys()].filter((b) => !branchesCarte.has(b));
chk(absentesCarte.length === 0,
  absentesCarte.length === 0
    ? 'toutes les sessions du registre figurent aussi dans la carte'
    : `absentes de ${CARTE} : ${absentesCarte.join(', ')}`);

/* --- 5. chaque session porte le minimum vital ------------------------------- */
const incompletes = Object.entries(sessions)
  .filter(([, s]) => !s.titre || !s.branche || !s.sujet)
  .map(([id]) => id);
chk(incompletes.length === 0,
  incompletes.length === 0
    ? 'chaque session a un titre, une branche et un sujet'
    : `incomplètes : ${incompletes.join(', ')}`);

/* --- 6. ce que le pipeline doit rendre visible ------------------------------ */
const attendKevin = Object.entries(sessions).filter(([, s]) => s.attend_kevin);
const attendSession = Object.entries(sessions).filter(([, s]) => s.attend_session);
console.log(`  · ${Object.keys(sessions).length} sessions · ${(reg.messages || []).length} message(s)`);
console.log(`  · ${attendKevin.length} en attente de Kevin, ${attendSession.length} en attente d'une autre session`);
attendKevin.forEach(([id, s]) => console.log(`     👤 ${id} : ${s.attend_kevin}`));
attendSession.forEach(([id, s]) => console.log(`     🔗 ${id} : ${s.attend_session}`));
console.log();

R.ko.forEach((m) => console.log('  FAIL ' + m));
R.ok.forEach((m) => console.log('  OK   ' + m));
console.log(`\n=== ${R.ok.length} OK / ${R.ko.length} FAIL ===`);
process.exit(R.ko.length ? 1 : 0);
