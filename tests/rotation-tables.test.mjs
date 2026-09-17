/* ROTATION AUX TABLES — test du moteur de temps de table (v9.904).
 *
 * Kevin 2026-09-15 : « il manque encore la rotation aux tables à terminer et tester ».
 *
 * On charge la VRAIE application dans un vrai navigateur et on interroge le moteur
 * avec des situations construites à la main. Les fonctions testées sont pures
 * (rotationEtat / rotationDebutTour / rotationLimiteMin / rotationMaxLegalMin),
 * donc chaque scénario est exact et reproductible.
 *
 * AUCUNE donnée réelle de personnel : les employés sont fabriqués dans le test.
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const INDEX = resolve(dirname(fileURLToPath(import.meta.url)), '../index.html');
const MIN = 60000;
const echecs = [], ok = [];
const verifie = (nom, cond, detail = '') => cond ? ok.push(nom) : echecs.push(`${nom}${detail ? ' — ' + detail : ''}`);

const nav = await chromium.launch();
const page = await (await nav.newContext({ viewport: { width: 390, height: 844 } })).newPage();
const erreursJS = [];
page.on('pageerror', (e) => erreursJS.push(String(e && e.message || e)));
await page.addInitScript(() => { window.__CMC_NO_SEED = true; });
await page.goto('file://' + INDEX, { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForFunction(() => typeof window.rotationEtat === 'function' && typeof window.ROTATION === 'object', { timeout: 20000 });

const r = await page.evaluate((MIN) => {
  /* Deux employés fabriqués : un standard, un 55+. On les injecte dans A.employees
     pour que empById()/isSenior() les reconnaissent, sans toucher aux vraies fiches. */
  let res_empByIdOk = false;
  const STD = { id: 'ZZ_STD', name: 'TEST STANDARD', team: 'bj1', family: 'bj', senior: false };
  const SEN = { id: 'ZZ_SEN', name: 'TEST SENIOR', team: 'bj1', family: 'bj', senior: true };
  A.employees = (A.employees || []).filter((e) => e.id !== STD.id && e.id !== SEN.id).concat([STD, SEN]);
  /* empById() lit un index mémorisé (_empsById), pas A.employees : on le reconstruit,
     sinon le test croirait tester un 55+ alors que la fiche serait introuvable. */
  if (typeof _rebuildIndexes === 'function') _rebuildIndexes();
  else A.employees.forEach((e) => { window._empsById && (window._empsById[e.id] = e); });
  res_empByIdOk = !!(empById('ZZ_SEN') && isSenior(empById('ZZ_SEN')));

  const now = Date.now();
  const live = (evs, tables, statuts) => ({ date: 'x', startedAt: now - 5 * 60 * MIN, tables, statuts: statuts || {}, events: evs, pitBossId: 'PB' });
  const T1 = { 'T1': { empIds: ['ZZ_STD', 'ZZ_SEN'], jeu: 'bj' } };
  const res = { empByIdOk: res_empByIdOk };

  res.rotationConstante = { std: ROTATION.standard.maxWork, senior: ROTATION.senior.maxWork, consent: ROTATION.senior.maxWorkConsent };

  /* 1. Limites : viennent-elles de ROTATION, et le 55+ est-il bien plafonné ? */
  res.limiteStd    = rotationMaxLegalMin(STD);
  res.limiteSen    = rotationMaxLegalMin(SEN);
  res.limiteSenAcc = rotationMaxLegalMin(Object.assign({}, SEN, { consentSenior: true }));
  res.limiteInconnu = rotationMaxLegalMin(null);   // attendu 40 : l'inconnu penche du côté strict

  /* 2. Le réglage du pit boss : raccourcir OK, allonger au-delà du légal NON. */
  res.ovCourt = rotationLimiteMin(SEN, { rotOverrideMin: 20 });   // attendu 20
  res.ovLong  = rotationLimiteMin(SEN, { rotOverrideMin: 120 });  // attendu 40, pas 120
  res.ovStd   = rotationLimiteMin(STD, { rotOverrideMin: 120 });  // attendu 60, pas 120

  /* 3. LE BUG HISTORIQUE : 3 h à table, aucun autre événement. */
  const l3h = live([{ ts: now - 180 * MIN, type: 'assignEmp', uid: 'ZZ_STD', tid: 'T1' }], { 'T1': { empIds: ['ZZ_STD'], jeu: 'bj' } });
  const e3h = rotationEtat(l3h, now);
  res.troisHeures = e3h.length ? { depuis: e3h[0].depuisMin, limite: e3h[0].limiteMin, etat: e3h[0].etat } : null;

  /* 4. Une pause remet le compteur à zéro (setStatut s:"break", ce que l'app écrit vraiment). */
  const lPause = live([
    { ts: now - 180 * MIN, type: 'assignEmp', uid: 'ZZ_STD', tid: 'T1' },
    { ts: now - 100 * MIN, type: 'setStatut', uid: 'ZZ_STD', s: 'break' },
    { ts: now - 30 * MIN,  type: 'assignEmp', uid: 'ZZ_STD', tid: 'T1' },
  ], { 'T1': { empIds: ['ZZ_STD'], jeu: 'bj' } });
  const ePause = rotationEtat(lPause, now);
  res.apresPause = ePause.length ? { depuis: ePause[0].depuisMin, etat: ePause[0].etat } : null;

  /* 5. Changer de table SANS pause ne remet PAS le compteur : c'est du travail consécutif. */
  const lDeuxTables = live([
    { ts: now - 90 * MIN, type: 'assignEmp', uid: 'ZZ_STD', tid: 'T1' },
    { ts: now - 40 * MIN, type: 'assignEmp', uid: 'ZZ_STD', tid: 'T2' },
  ], { 'T2': { empIds: ['ZZ_STD'], jeu: 'bj' } });
  const eDeux = rotationEtat(lDeuxTables, now);
  res.deuxTables = eDeux.length ? { depuis: eDeux[0].depuisMin, etat: eDeux[0].etat } : null;

  /* 6. Le 55+ dépasse à 40 min là où le standard est encore bon. */
  const l45 = live([
    { ts: now - 45 * MIN, type: 'assignEmp', uid: 'ZZ_STD', tid: 'T1' },
    { ts: now - 45 * MIN, type: 'assignEmp', uid: 'ZZ_SEN', tid: 'T1' },
  ], T1);
  const e45 = rotationEtat(l45, now);
  res.a45min = e45.map((x) => ({ uid: x.uid, senior: x.senior, limite: x.limiteMin, etat: x.etat }));

  /* 7. Quelqu'un DÉJÀ en pause ne doit pas être compté comme en table. */
  const lEnPause = live([{ ts: now - 200 * MIN, type: 'assignEmp', uid: 'ZZ_STD', tid: 'T1' }],
                        { 'T1': { empIds: ['ZZ_STD'], jeu: 'bj' } }, { 'ZZ_STD': { s: 'break', since: now - 10 * MIN } });
  res.enPauseCompte = rotationEtat(lEnPause, now).length;

  /* 8. Table fermée : plus personne en table. */
  const lFermee = live([{ ts: now - 200 * MIN, type: 'assignEmp', uid: 'ZZ_STD', tid: 'T1' }],
                       { 'T1': { empIds: ['ZZ_STD'], jeu: 'bj', closedAt: now - 5 * MIN } });
  res.tableFermeeCompte = rotationEtat(lFermee, now).length;

  /* 9. Retiré de la table (removeEmp) : le compteur repart de zéro. */
  const lRetire = live([
    { ts: now - 200 * MIN, type: 'assignEmp', uid: 'ZZ_STD', tid: 'T1' },
    { ts: now - 120 * MIN, type: 'removeEmp', uid: 'ZZ_STD', tid: 'T1' },
    { ts: now - 10 * MIN,  type: 'assignEmp', uid: 'ZZ_STD', tid: 'T1' },
  ], { 'T1': { empIds: ['ZZ_STD'], jeu: 'bj' } });
  const eRet = rotationEtat(lRetire, now);
  res.apresRetrait = eRet.length ? eRet[0].depuisMin : null;

  /* 10. « Bientôt » : 5 minutes avant la limite. */
  const lBientot = live([{ ts: now - 57 * MIN, type: 'assignEmp', uid: 'ZZ_STD', tid: 'T1' }], { 'T1': { empIds: ['ZZ_STD'], jeu: 'bj' } });
  const eB = rotationEtat(lBientot, now);
  res.bientot = eB.length ? eB[0].etat : null;

  /* 11. Tri : le plus long en tête. */
  const lTri = live([
    { ts: now - 20 * MIN, type: 'assignEmp', uid: 'ZZ_STD', tid: 'T1' },
    { ts: now - 90 * MIN, type: 'assignEmp', uid: 'ZZ_SEN', tid: 'T1' },
  ], T1);
  res.premierDuTri = rotationEtat(lTri, now)[0].uid;

  /* 12. Entrées vides : le moteur ne doit jamais lever d'exception. */
  try { res.robuste = rotationEtat(null).length === 0 && rotationEtat({}).length === 0 && rotationDebutTour(null, 'x') === null; }
  catch (e) { res.robuste = 'EXCEPTION: ' + e.message; }

  /* 13. La sentinelle « Gardien des pauses » alerte-t-elle ENFIN ? */
  A.user = { id: 'U11804', name: 'TEST ADMIN' };
  A.live = l3h;
  window._agentPauseGuardian();
  const rap = ((window.lg && lg('cmc_agent_reports', {})) || {}).pause || [];
  res.sentinelle = rap.length ? { statut: rap[rap.length - 1].status, msg: rap[rap.length - 1].msg } : null;

  return res;
}, MIN);

await nav.close();

const R = r.rotationConstante;
verifie('ROTATION reste la source unique (standard 60 / senior 40 / accord 60)', R.std === 60 && R.senior === 40 && R.consent === 60, JSON.stringify(R));
verifie('limite standard = 60', r.limiteStd === 60, String(r.limiteStd));
verifie('limite 55+ = 40', r.limiteSen === 40, String(r.limiteSen));
verifie('limite 55+ avec accord écrit = 60', r.limiteSenAcc === 60, String(r.limiteSenAcc));
verifie('fiche introuvable → limite la plus STRICTE (40), pas la plus permissive', r.limiteInconnu === 40, String(r.limiteInconnu));
verifie('le test teste bien un vrai 55+ (index employés reconstruit)', r.empByIdOk === true, String(r.empByIdOk));
verifie('le pit boss peut RACCOURCIR un tour (20 min)', r.ovCourt === 20, String(r.ovCourt));
verifie('le pit boss ne peut PAS mettre un 55+ à 120 min → plafonné à 40', r.ovLong === 40, String(r.ovLong));
verifie('ni un standard à 120 min → plafonné à 60', r.ovStd === 60, String(r.ovStd));
verifie('3 h à table sans pause = DÉPASSÉ (le bug historique)', r.troisHeures && r.troisHeures.etat === 'depasse' && r.troisHeures.depuis >= 179, JSON.stringify(r.troisHeures));
verifie('une pause remet le compteur à zéro', r.apresPause && r.apresPause.depuis <= 31 && r.apresPause.etat === 'ok', JSON.stringify(r.apresPause));
verifie('changer de table SANS pause ne remet PAS le compteur (90 min cumulées)', r.deuxTables && r.deuxTables.depuis >= 89 && r.deuxTables.etat === 'depasse', JSON.stringify(r.deuxTables));
const sen45 = (r.a45min || []).find((x) => x.senior), std45 = (r.a45min || []).find((x) => !x.senior);
verifie('à 45 min : le 55+ a dépassé (limite 40)', sen45 && sen45.etat === 'depasse' && sen45.limite === 40, JSON.stringify(sen45));
verifie('à 45 min : le standard est encore bon (limite 60)', std45 && std45.etat === 'ok' && std45.limite === 60, JSON.stringify(std45));
verifie('une personne en pause n\'est pas comptée en table', r.enPauseCompte === 0, String(r.enPauseCompte));
verifie('une table fermée ne compte personne', r.tableFermeeCompte === 0, String(r.tableFermeeCompte));
verifie('retiré puis remis : compteur reparti (≈10 min)', r.apresRetrait !== null && r.apresRetrait <= 11, String(r.apresRetrait));
verifie('à 3 min de la limite → « bientôt »', r.bientot === 'bientot', String(r.bientot));
verifie('le plus long temps de table est en tête', r.premierDuTri === 'ZZ_SEN', String(r.premierDuTri));
verifie('robuste aux entrées vides (aucune exception)', r.robuste === true, String(r.robuste));
verifie('le Gardien des pauses ALERTE enfin', r.sentinelle && r.sentinelle.statut === 'warn', JSON.stringify(r.sentinelle));
verifie('aucune erreur JS au chargement de l\'app', erreursJS.length === 0, erreursJS[0] || '');

console.log(`ROTATION AUX TABLES — ${ok.length} contrôle(s) OK, ${echecs.length} échec(s)`);
if (echecs.length) { for (const e of echecs) console.error('  ✗ ' + e); process.exit(1); }
console.log('  limites depuis ROTATION · plafond légal · pause · changement de table · 55+ · table fermée · tri · robustesse · sentinelle');
