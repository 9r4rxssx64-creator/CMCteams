/* « SIMULER MA CONNEXION » — garde-fou de la couche session (Kevin 2026-08-06).
 *
 * Ce que ce test protège, dans l'ordre d'importance :
 *  1. SÉCURITÉ  — périmètre verrouillé sur kd-mc.com ; aucun secret en dur ; le code admin
 *     n'est jamais restitué en clair (masqué).
 *  2. JUSTESSE  — les marques de session sont celles que les apps écrivent VRAIMENT
 *     (relues dans leur code) : si une app change sa clé, le test le dit ici au lieu de nous
 *     laisser croire qu'on est connecté alors qu'on regarde un écran de login.
 *  3. NON-RÉGRESSION — l'audit live reste ANONYME par défaut (opt-in KDMC_AS_KEVIN=1).
 *
 * node tests/session-kevin.test.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marquesPour, masque, ADMIN } from '../tools/smoke/session-kevin.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0;
const fails = [];
const ok = (c, m) => (c ? pass++ : fails.push(m));

/* ── 1. Sécurité ─────────────────────────────────────────────────────────── */
const src = readFileSync(join(ROOT, 'tools/smoke/session-kevin.mjs'), 'utf8');
ok(!/\b\d{6}\b/.test(src.replace(/U11804/g, '')), 'aucun code à 6 chiffres en dur dans le module');
ok(/process\.env/.test(readFileSync(join(ROOT, 'tools/smoke/audit-live.mjs'), 'utf8')),
  'le code admin vient d\'une variable d\'environnement (secret CI), pas du dépôt');
ok(/DOMAINE\s*=\s*'kd-mc\.com'/.test(src), 'périmètre déclaré : kd-mc.com uniquement');
ok(/Périmètre/.test(src) && /throw new Error/.test(src), 'toute autre cible est REFUSÉE (throw)');

const m = masque('0123456789abcdef');
ok(!m.includes('123456789abc'), 'un hash n\'est jamais restitué en clair');
ok(masque('') === '(absent)', 'valeur absente signalée clairement');

/* ── 2. Justesse : les marques correspondent au code réel des apps ────────── */
const cmc = marquesPour('cmcteams.kd-mc.com');
ok(cmc.local.cmc_uid === ADMIN.uid, 'CMCteams : cmc_uid = U11804');
ok(!!cmc.local.cmc_lastact, 'CMCteams : cmc_lastact posé (sinon la session est jugée expirée)');
const idx = readFileSync(join(ROOT, 'index.html'), 'utf8');
ok(idx.includes('cmc_lastact'), 'CMCteams utilise bien cmc_lastact (vérifié dans l\'app)');
ok(idx.includes('"U11804"') || idx.includes("'U11804'"), 'U11804 est bien l\'identifiant admin de CMCteams');

const apex = marquesPour('apex-ai.kd-mc.com');
ok(JSON.parse(apex.local.apex_v13_user).id === ADMIN.apexUid, 'Apex : apex_v13_user = kdmc_admin');
const auth = readFileSync(join(ROOT, 'apex-ai/v13/services/auth/auth.ts'), 'utf8');
ok(auth.includes('apex_v13_user'), 'Apex écrit bien apex_v13_user (vérifié dans l\'app)');
ok(auth.includes('apex_v13_last_known_uid'), 'Apex écrit bien apex_v13_last_known_uid');

const adm = marquesPour('admin.kd-mc.com', { pinHash: 'abc123' });
ok(adm.local.kdmc_access_pinhash === 'abc123', 'Admin : la clé attendue est kdmc_access_pinhash');
const pageJs = readFileSync(join(ROOT, 'services/kdmc-access/page.js'), 'utf8');
ok(pageJs.includes("kdmc_access_pinhash"), 'la page admin lit bien kdmc_access_pinhash (vérifié)');
ok(Object.keys(marquesPour('admin.kd-mc.com').local).length === 0,
  'sans code fourni, on ne fabrique RIEN (la page restera verrouillée — honnête)');

const arbre = marquesPour('arbre.kd-mc.com');
ok(arbre.local.arbre_trust === '1', 'Arbre : arbre_trust (règle « reconnu auto après 1re connexion »)');

ok(Object.keys(marquesPour('la-detente.kd-mc.com').local).length === 0,
  'une boutique publique ne reçoit aucune fausse session');

/* ── 3. Non-régression : l'audit reste anonyme par défaut ─────────────────── */
const live = readFileSync(join(ROOT, 'tools/smoke/audit-live.mjs'), 'utf8');
ok(/KDMC_AS_KEVIN\s*===\s*'1'/.test(live), 'mode connecté = OPT-IN explicite (KDMC_AS_KEVIN=1)');
ok(/if \(AS_KEVIN\)/.test(live), 'sans le drapeau, aucune session n\'est injectée');
ok(existsSync(join(ROOT, '.github/workflows/audit-live.yml')), 'l\'audit anonyme existe toujours');

console.log(`Session Kevin : ${pass} vérifications OK, ${fails.length} échec(s)`);
fails.forEach((f) => console.log('  ✗ ' + f));
process.exit(fails.length ? 1 : 0);
