/**
 * AUDIT LIVE — balaye TOUTES les surfaces kd-mc.com dans un vrai navigateur.
 *
 * Pourquoi : les audits « à la lecture » ne voient PAS les bugs de RUNTIME
 * (leçons #28/#54/#95/#103/#131). Le cas d'école : le worker de commande Printify
 * bloqué par CORS depuis le domaine réel — invisible au code, visible seulement
 * quand le NAVIGATEUR exécute la page et refuse la requête. Ce moteur attrape
 * exactement cette classe : requête réseau ÉCHOUÉE / bloquée / 4xx-5xx, + erreur
 * JS non catchée, + élément clé absent, + capture d'écran par surface.
 *
 * Où : GitHub Actions (le runner a le réseau OUVERT). Depuis le sandbox Claude Code
 * l'egress vers kd-mc.com est refusé par le proxy (403 CONNECT) → ce fichier NE
 * tourne PAS en local, il tourne en CI (workflow audit-live.yml). C'est LA voie
 * qui permet de « voir » réellement les sites de Kevin. (leçon #93/#126)
 *
 * Usage : node tools/smoke/audit-live.mjs [baseDomain]
 * Exit 1 si un échec BLOQUANT (page KO, exception JS, ou requête vers un host
 * du projet — worker/firebase/domaine — échouée/bloquée = la classe « CORS commande »).
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';

const BASE = (process.argv[2] || 'https://kd-mc.com').replace(/\/$/, '');
const ROOT = BASE.replace(/^https?:\/\//, '').replace(/^www\./, ''); // ex: kd-mc.com

/* Hôtes « du projet » : une requête ÉCHOUÉE/bloquée vers l'un d'eux = bug bloquant
   (revenu/fonction cassé), pas du bruit tiers fail-open. C'est le filet qui aurait
   attrapé le blocage CORS de ld-printify-order. */
const PROJECT_HOSTS = [/\.workers\.dev$/, /firebasedatabase\.app$/, /(^|\.)kd-mc\.com$/, /9r4rxssx64-creator\.github\.io$/];
const isProjectHost = (u) => { try { const h = new URL(u).hostname; return PROJECT_HOSTS.some((re) => re.test(h)); } catch { return false; } };

/* Surfaces = miroir EXACT des ROUTES du routeur (services/kdmc-router/worker.js).
   ⚠ Les APPS sont des SOUS-DOMAINES (chez-lolo.kd-mc.com), PAS des chemins
   (kd-mc.com/chez-lolo/ → 404). SEULS worldmonitor/osint sont des chemins sur
   l'accueil (kdmc-home). (bug attrapé par le 1er run live — le routeur mappe par host.)
   selKey = un élément qui PROUVE que la page a rendu (pas juste 200 vide). */
const SURFACES = [
  { url: 'https://' + ROOT + '/', name: 'accueil', selKey: 'body' },
  { url: 'https://cmcteams.' + ROOT + '/', name: 'CMCteams', selKey: 'body' },
  { url: 'https://apex-ai.' + ROOT + '/', name: 'Apex AI', selKey: 'body' },
  { url: 'https://apex-chat.' + ROOT + '/', name: 'Apex Chat', selKey: 'body' },
  { url: 'https://la-detente.' + ROOT + '/', name: 'La Détente boutique', selKey: 'body' },
  { url: 'https://chez-lolo.' + ROOT + '/', name: 'Chez Lolo boutique', selKey: 'body' },
  { url: 'https://dashboard.' + ROOT + '/', name: 'Dashboard', selKey: 'body' },
  { url: 'https://sourcing.' + ROOT + '/', name: 'Sourcing', selKey: 'body' },
  { url: 'https://coffre.' + ROOT + '/', name: 'Coffre-fort', selKey: 'body' },
  { url: 'https://departs.' + ROOT + '/', name: 'Départs', selKey: 'body' },
  { url: 'https://cmcteams-light.' + ROOT + '/', name: 'CMCteams light', selKey: 'body' },
  { url: BASE + '/worldmonitor/', name: 'World Monitor', selKey: '.leaflet-container' },
  { url: BASE + '/osint/', name: 'OSINT', selKey: '.leaflet-container' },
];

const SHOT_DIR = 'audit-live-shots';
mkdirSync(SHOT_DIR, { recursive: true });

const browser = await chromium.launch();
let hardFail = 0;
const report = [];

for (const s of SURFACES) {
  const page = await browser.newPage();
  const jsErrors = [];      // exceptions JS non catchées → BLOQUANT
  const failedProject = []; // requête vers un host projet échouée/bloquée → BLOQUANT (classe CORS commande)
  const failedThird = [];   // requête tierce échouée → toléré (fail-open)
  const badStatus = [];     // 4xx/5xx sur un host projet → BLOQUANT
  const consoleErr = [];    // bruit console → rapporté, non bloquant

  page.on('pageerror', (e) => jsErrors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') consoleErr.push(m.text().slice(0, 160)); });
  page.on('requestfailed', (req) => {
    const u = req.url();
    const line = req.method() + ' ' + u.slice(0, 120) + ' [' + (req.failure()?.errorText || 'failed') + ']';
    (isProjectHost(u) ? failedProject : failedThird).push(line);
  });
  page.on('response', (resp) => {
    const st = resp.status();
    if (st >= 400 && isProjectHost(resp.url())) badStatus.push('HTTP ' + st + ' ' + resp.url().slice(0, 120));
  });

  const url = s.url;
  const res = { url, name: s.name, ok: true, notes: [] };
  try {
    const resp = await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    const status = resp ? resp.status() : 0;
    if (!resp || status >= 400) { res.ok = false; res.notes.push('page HTTP ' + status); }
    await page.waitForTimeout(5000); // laisse le JS/live faire ses appels réseau

    if (!(await page.$(s.selKey))) { res.ok = false; res.notes.push('élément clé absent: ' + s.selKey); }

    await page.screenshot({ path: SHOT_DIR + '/' + s.name.replace(/[^\w]+/g, '_') + '.png' }).catch(() => {});

    if (jsErrors.length) { res.ok = false; res.notes.push('EXCEPTION JS: ' + jsErrors.slice(0, 2).join(' | ')); }
    if (failedProject.length) { res.ok = false; res.notes.push('REQUÊTE PROJET BLOQUÉE (classe CORS/commande): ' + failedProject.slice(0, 3).join(' ; ')); }
    if (badStatus.length) { res.ok = false; res.notes.push('STATUT PROJET 4xx/5xx: ' + badStatus.slice(0, 3).join(' ; ')); }
    if (failedThird.length) res.notes.push('req. tierces échouées (toléré): ' + failedThird.length);
    if (consoleErr.length) res.notes.push('bruit console: ' + consoleErr.length + ' (ex ' + consoleErr[0] + ')');
  } catch (e) {
    res.ok = false;
    res.notes.push('EXCEPTION: ' + (e && e.message ? e.message : String(e)));
  }
  await page.close();
  if (!res.ok) hardFail++;
  report.push(res);
}

await browser.close();

writeFileSync(SHOT_DIR + '/report.json', JSON.stringify({ base: BASE, at: new Date().toISOString(), hardFail, report }, null, 2));

console.log('\n=== AUDIT LIVE ' + BASE + ' ===');
for (const r of report) {
  console.log((r.ok ? '✅' : '❌') + ' ' + r.name + '  ' + r.url);
  for (const n of r.notes) console.log('   · ' + n);
}
console.log(hardFail === 0 ? '\nAUDIT LIVE OK — toutes les surfaces rendent, 0 requête projet bloquée.' : '\nAUDIT LIVE ÉCHEC (' + hardFail + ' surface(s))');
process.exit(hardFail === 0 ? 0 : 1);
