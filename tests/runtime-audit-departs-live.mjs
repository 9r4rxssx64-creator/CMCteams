// Régression v1.14 — SYNCHRO APP→PAGE cross-device (Kevin 2026-06-29 « les deux côtés
// s'actualisent auto, aussi entre appareils »). Prouve que la page Départs construit les
// boards depuis FIREBASE (cmc_e/cmc_ov/cmc_ov_meta/mirror) même SANS localStorage — donc
// sur un appareil où l'app n'a jamais tourné. Mock des réponses Firebase + Identity Toolkit.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const pageUrl = 'file://' + resolve(root, 'tools/departs/index.html');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

// État app simulé côté "cloud" (Firebase) — 1 équipe BJ + 1 roulettes en juillet 2026.
const EMPS = [
  { id: 'C1', name: 'CLOUD CHEF', family: 'bj', teamHistory: { '2026-6': '1' }, familyHistory: { '2026-6': 'bj' } },
  { id: 'C2', name: 'CLOUD DEUX', family: 'bj', teamHistory: { '2026-6': '1' }, familyHistory: { '2026-6': 'bj' } },
  { id: 'R1', name: 'CLOUD ROUL', family: 'roulettes', teamHistory: { '2026-6': 'r1' }, familyHistory: { '2026-6': 'roulettes' } }
];
const OV = { '2026-6': {
  C1: { 1: '20/5c', 2: '19/4c', 3: 'RH', 4: 'R', 5: '19/3c' },
  C2: { 1: '20/5', 2: '19/4', 3: 'RH', 4: 'R', 5: '20/5' },
  R1: { 1: '22/6', 2: '22/6', 3: 'RH', 4: 'R', 5: '22/6' }
}};
const META = { '2026-6': { C1: { 5: { bg: 'CONV' } } } };
const MIRROR = { '1': 'r1' };

const browser = await chromium.launch({ headless: true });
try {
  const ctx = await browser.newContext();
  // Mock Identity Toolkit (auth anonyme) → idToken
  await ctx.route(/identitytoolkit\.googleapis\.com\/.*signUp.*/, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ idToken: 'TESTTOK', expiresIn: '3600', localId: 'anon' }) }));
  // Mock Firebase RTDB REST (les GET .json) — exige ?auth=TESTTOK (prouve l'auth threadée)
  let authedHit = false;
  const putBodies = [];
  await ctx.route(/cmcteams-c16ab-default-rtdb\.europe-west1\.firebasedatabase\.app\/cmcteams\/.*\.json.*/, route => {
    const req = route.request(), url = req.url();
    if (url.indexOf('auth=TESTTOK') >= 0) authedHit = true;
    if (req.method() === 'PUT' && /\/cmc_ov\.json/.test(url)) {
      try { putBodies.push(JSON.parse(req.postData() || 'null')); } catch (_) { putBodies.push(null); }
      return route.fulfill({ status: 200, contentType: 'application/json', body: req.postData() || 'null' });
    }
    let body = 'null';
    if (/\/cmc_e\.json/.test(url)) body = JSON.stringify(EMPS);
    else if (/\/cmc_ov\.json/.test(url)) body = JSON.stringify(OV);
    else if (/\/cmc_ov_meta\.json/.test(url)) body = JSON.stringify(META);
    else if (/\/cmc_team_mirror_2026-6\.json/.test(url)) body = JSON.stringify(MIRROR);
    route.fulfill({ status: 200, contentType: 'application/json', body });
  });

  const page = await ctx.newPage();
  const perr = [];
  page.on('pageerror', e => perr.push(e.message));
  // AUCUN localStorage app (appareil neuf) — la donnée vient UNIQUEMENT de Firebase.
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  // attend que le pull Firebase ait construit un mois live
  await page.waitForFunction(() => window._depLiveMonths && window._depLiveMonths['2026-6'], { timeout: 15000 }).catch(() => {});

  const r = await page.evaluate(() => {
    const ids = Object.keys(BOARDS);
    const bj = ids.find(id => id === '2026-07-1');
    const roul = ids.find(id => id === '2026-07-r1');
    const b = bj ? BOARDS[bj] : null;
    return {
      live: Object.keys(window._depLiveMonths || {}),
      bjBoard: !!bj, roulBoard: !!roul,
      bjMembers: b ? b.people.map(p => p.name) : [],
      mirrorLink: (typeof DEP_MIRROR === 'object') ? (DEP_MIRROR['2026-07-1'] || null) : null
    };
  });

  console.log('PAGE (cross-device, sans localStorage, données via Firebase) :');
  console.log('  moisLive=' + JSON.stringify(r.live) + ' bj=' + r.bjBoard + ' roul=' + r.roulBoard + ' membresBJ=' + JSON.stringify(r.bjMembers) + ' miroir(1→)=' + r.mirrorLink);
  ok(perr.length === 0, 'aucune erreur page (' + perr.join(' | ') + ')');
  ok(authedHit, 'lecture Firebase authentifiée (?auth= threadé)');
  ok(r.live.indexOf('2026-6') >= 0, 'mois juillet 2026 construit depuis Firebase (live)');
  ok(r.bjBoard, 'board BJ Éq.1 présent (depuis le cloud)');
  ok(r.roulBoard, 'board Roulettes r1 présent (depuis le cloud)');
  ok(r.bjMembers.indexOf('CLOUD CHEF') >= 0 && r.bjMembers.indexOf('CLOUD DEUX') >= 0, 'membres BJ corrects depuis le cloud');
  ok(r.mirrorLink === '2026-07-r1', 'lien miroir reconstruit depuis Firebase (1 → r1)');

  // ===== Phase 2 : page→app — une cellule corrigée sur la page remonte dans cmc_ov =====
  // Édit légitime (mois présent) : doit PUT l'OBJET ENTIER avec la cellule modifiée.
  await page.evaluate(() => window._depSyncCell('C1', '2026-6', 2, 'CP'));
  await page.waitForTimeout(400);
  // Édit sur un mois ABSENT du planning app : anti-clobber → AUCUN PUT.
  await page.evaluate(() => window._depSyncCell('ZZ', '2099-0', 1, 'X'));
  await page.waitForTimeout(300);

  const lastPut = putBodies[putBodies.length - 1] || null;
  ok(putBodies.length === 1, 'exactement 1 écriture cmc_ov (édit légitime ; mois absent ignoré) — anti-clobber (' + putBodies.length + ')');
  ok(!!(lastPut && lastPut['2026-6']), 'le PUT contient bien le mois 2026-6 (objet ENTIER, pas partiel)');
  ok(!!(lastPut && lastPut['2026-6'] && lastPut['2026-6'].C1 && lastPut['2026-6'].C1['2'] === 'CP'), 'cellule C1 jour 2 = CP dans le cmc_ov écrit');
  ok(!!(lastPut && lastPut['2026-6'] && lastPut['2026-6'].C2 && lastPut['2026-6'].C2['1'] === '20/5'), 'les autres employés/cellules sont PRÉSERVÉS (C2 intact)');
  ok(!!(lastPut && lastPut['2026-6'] && lastPut['2026-6'].C1 && lastPut['2026-6'].C1['1'] === '20/5c'), 'les autres jours du même employé préservés (C1 j1 intact)');
  await ctx.close();
} finally { await browser.close(); }

console.log('\nDÉPARTS-LIVE (app→page cross-device) : ' + pass + ' OK / ' + fail + ' KO');
process.exit(fail ? 1 : 0);
