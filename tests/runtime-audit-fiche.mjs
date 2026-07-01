// v9.841 (Kevin 2026-07-01 « l'historique remonte dans chaque fiche perso avec toutes
// les infos possibles » + « Oubli pas la map, position live, historique, travail,
// question, effectué demandé »). Vérifie la FICHE PERSO COMPLÈTE (admin) : cmcOpenFiche
// ouvre la vue ; vFichePerso agrège identité + travail du mois + position/présence + map
// + historique connexions + demandes + messages ; guard admin ; route vMain « fiche » ;
// pas de doublon _cmcRelTime (leçon #108). Câblé test:ci.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
const __dirname = dirname(fileURLToPath(import.meta.url));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

// leçon #108 — aucune fonction définie 2× (la 2e déclaration écrase la 1re)
const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
const dupRel = (html.match(/function _cmcRelTime\(/g) || []).length;
ok(dupRel === 1, '_cmcRelTime défini une seule fois (leçon #108, mesuré ' + dupRel + ')');
const dupFiche = (html.match(/function vFichePerso\(/g) || []).length;
ok(dupFiche === 1, 'vFichePerso défini une seule fois (mesuré ' + dupFiche + ')');

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
await page.addInitScript(() => { window.__CMC_NO_SEED = true; });
await page.goto('file://' + resolve(__dirname, '../index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForFunction(() => typeof window.vFichePerso === 'function' && typeof window.cmcOpenFiche === 'function' && window.A && Array.isArray(A.employees), { timeout: 20000 });

// prépare un employé avec des données dans TOUTES les sources
const uid = await page.evaluate(() => {
  const emp = A.employees.find(e => e.id !== 'U11804') || A.employees[0];
  const uid = emp.id;
  A.year = 2026; A.month = 6; const key = A.year + '-' + A.month;
  A.reg = A.reg || {}; A.reg[uid] = { nom: 'DUPONT', prenom: 'Jean', email: 'jean@ex.mc', poste: 'Croupier' };
  A.overrides = A.overrides || {}; A.overrides[key] = A.overrides[key] || {};
  A.overrides[key][uid] = { 1: '20/5', 2: '20/5', 3: 'RH', 4: 'CP' }; // 2 travail, 1 repos, 1 absence
  localStorage.setItem('cmc_userlog', JSON.stringify([{ uid, name: emp.name, ts: Date.now() - 3600000, browser: 'Safari', os: 'iOS', city: 'Monaco', country: 'MC', type: 'login', geo: { lat: 43.7, lng: 7.4, acc: 20 } }]));
  localStorage.setItem('cmc_positions', JSON.stringify({ [uid]: [{ lat: 43.7384, lng: 7.4246, acc: 15, ts: Date.now() - 120000 }] }));
  localStorage.setItem('cmc_kevin_inbox', JSON.stringify([{ from: uid, name: emp.name, text: 'Question sur mon planning', ts: Date.now() - 60000, status: 'new' }]));
  A.exchanges = [{ uid, status: 'pending', ts: Date.now() - 200000 }];
  return uid;
});

// 1) guard admin : non-admin → refusé
ok(await page.evaluate((u) => { A.user = A.employees.find(e => e.id !== 'U11804'); return /réservé/i.test(vFichePerso(u)); }, uid), 'vFichePerso refusé pour non-admin');

// 2) admin → rend TOUTES les sections
const h = await page.evaluate((u) => { A.user = A.employees.find(e => e.id === 'U11804'); return vFichePerso(u); }, uid);
ok(/👤 Identité/.test(h), 'section Identité présente');
ok(/DUPONT|Jean|jean@ex\.mc|Croupier/.test(h), 'infos identité (nom/email/poste) affichées');
ok(/🎰 Travail/.test(h), 'section Travail présente');
ok(/>2<\/b>\s*travaillés|<b>2<\/b> travaillés/.test(h), '2 jours travaillés comptés');
ok(/repos/.test(h) && /absences/.test(h), 'compteurs repos + absences présents');
ok(/📍 Position/.test(h), 'section Position & présence présente');
ok(/maps\.google\.com\/\?q=43\.7384,7\.4246/.test(h), 'lien Google Maps de la dernière position');
ok(/A\.view='pitmap'|A\.view=\\?'pitmap'/.test(h) || /pitmap/.test(h), 'bouton map des tables (pitmap)');
ok(/🕓 Historique connexions/.test(h), 'section Historique connexions présente');
ok(/Safari|iOS|Monaco/.test(h), 'détail connexion (appareil/lieu) affiché');
ok(/🔄 Demandes/.test(h), 'section Demandes (effectué/demandé) présente');
ok(/💬 Questions/.test(h) && /Question sur mon planning/.test(h), 'section Questions/messages + texte affiché');

// 3) cmcOpenFiche → bascule la vue sur « fiche »
ok(await page.evaluate((u) => { A.user = A.employees.find(e => e.id === 'U11804'); cmcOpenFiche(u); return A.view === 'fiche' && window._ficheUid === u; }, uid), 'cmcOpenFiche bascule A.view=fiche + _ficheUid');

// 4) route vMain « fiche » → renvoie vFichePerso pour l'admin, vide pour non-admin
ok(await page.evaluate((u) => { A.user = A.employees.find(e => e.id === 'U11804'); A.view = 'fiche'; window._ficheUid = u; return /📇 Fiche complète/.test(vMain()); }, uid), 'route vMain « fiche » rend la fiche (admin)');
ok(await page.evaluate((u) => { A.user = A.employees.find(e => e.id !== 'U11804'); A.view = 'fiche'; window._ficheUid = u; const out = vMain(); return !/📇 Fiche complète/.test(out) && !/Question sur mon planning/.test(out); }, uid), 'route vMain « fiche » ne rend AUCUNE fiche pour non-admin (guard)');

// 5) uid introuvable → message d'erreur propre (pas de crash)
ok(await page.evaluate(() => { A.user = A.employees.find(e => e.id === 'U11804'); return /introuvable/i.test(vFichePerso('U_INEXISTANT_XYZ')); }), 'uid introuvable → message propre (pas de crash)');

// 6) la vue EXISTANTE « Activité par utilisateur » lie vers la fiche complète (pas de doublon parallèle)
ok(await page.evaluate(() => { A.user = A.employees.find(e => e.id === 'U11804'); return /cmcOpenFiche\(/.test(vUsersActivity()) && /Ouvrir la fiche compl/.test(vUsersActivity()); }), 'vUsersActivity relie vers la fiche complète (cmcOpenFiche)');

// 7) cmcOpenFiche mémorise la vue d'origine → « ← Retour » y revient
ok(await page.evaluate((u) => { A.user = A.employees.find(e => e.id === 'U11804'); A.view = 'usersactivity'; cmcOpenFiche(u); return window._ficheBack === 'usersactivity' && /_ficheBack/.test(vFichePerso(u)); }, uid), 'cmcOpenFiche mémorise l\'origine + Retour y revient');

await browser.close();
console.log('\nFICHE PERSO : ' + pass + ' OK / ' + fail + ' KO');
process.exit(fail ? 1 : 0);
