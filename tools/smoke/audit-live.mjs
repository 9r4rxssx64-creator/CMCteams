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
import { connecte, masque } from './session-kevin.mjs';

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
  { url: 'https://arbre.' + ROOT + '/', name: 'Arbre généalogique', selKey: '#gate', deep: async (page) => {
      // Déverrouille (code famille MAIFFRET déjà par défaut) et VÉRIFIE que l'arbre rend
      // vraiment des cartes — un arbre vide (bug d'agencement) échoue ici. (bug « tjs pas d'arbre » v2.4)
      //
      // FAUX POSITIF corrigé le 2026-08-07 : on comptait `.tnode`, la classe du SEUL style
      // « clair ». L'app rend par défaut le style parchemin, dont les cartes portent `.tmed`
      // → le contrôle criait « arbre vide » alors que 81 cartes s'affichaient (reproduit en
      // local : `_RENDERSTYLE==='med'`, 81 `.tmed`, 0 erreur JS). Un contrôle lié à un nom de
      // classe cosmétique casse au moindre changement de style. On compte donc ce qui prouve
      // vraiment le rendu, indépendamment du style : les cartes cliquables de la scène
      // (`#stage [data-open]`), présentes dans TOUS les styles.
      try { await page.evaluate(() => { sessionStorage.setItem('arbre_unlocked','1'); localStorage.setItem('arbre_trust','1'); }); } catch {}
      await page.reload({ waitUntil: 'load' }).catch(()=>{});
      await page.waitForTimeout(4500);
      const r = await page.evaluate(() => ({
        ver: (document.querySelector('#ver')||{}).textContent||'',
        cartes: document.querySelectorAll('#stage [data-open]').length,
        style: (typeof window._RENDERSTYLE !== 'undefined') ? String(window._RENDERSTYLE) : '?',
        gate: !!(document.querySelector('#gate') && !document.querySelector('#gate').classList.contains('hidden')),
      }));
      if (r.gate) return { ok:false, note:'reste bloqué sur le code (gate)' };
      if (r.cartes < 1) return { ok:false, note:'AUCUNE carte rendue — arbre vide ('+r.ver+', style '+r.style+')' };
      return { ok:true, note: r.cartes+' cartes · style '+r.style+' · '+r.ver };
    } },
  { url: 'https://lingua.' + ROOT + '/', name: 'KDMC Lingua', selKey: '.brand', deep: async (page) => {
      // App d'apprentissage : écran comptes (anonyme) → créer un compte → vérifier
      // 6 langues + arbre de leçons rendus + onglets. Un écran vide ou <6 langues échoue.
      // ⚠️ clics DOM (el.click() via evaluate) et JAMAIS page.click : la mascotte Bee
      // (compagnon + bulle) recouvre les éléments → l'« actionnabilité » Playwright
      // attend 30 s et échoue alors que l'app marche (vécu run 31225690078).
      const tap = (sel) => page.$eval(sel, (el) => el.click()).then(() => true).catch(() => false);
      try {
        await page.waitForTimeout(1200);
        if (!(await page.$('.acc-card.add'))) return { ok:false, note:'écran comptes absent' };
        await tap('.acc-card.add'); await page.waitForTimeout(600);
        await page.fill('#acName', 'Audit'); await tap('.modal .btn-main'); await page.waitForTimeout(700);
        const langs = await page.$$eval('.course-card', els => els.length).catch(() => 0);
        if (langs < 6) return { ok:false, note:'langues attendues ≥6, vues ' + langs };
        await tap('.course-card'); await page.waitForTimeout(700);
        const units = await page.$$eval('.unit', els => els.length).catch(() => 0);
        const tabs = await page.$$eval('.tab', els => els.length).catch(() => 0);
        const hearts = (await page.textContent('.tb-stat.hearts').catch(() => '')).replace(/\s/g, '');
        if (units < 1) return { ok:false, note:'aucune unité rendue' };
        // 📖 Histoires de la ruche (v2.32.0) : carte accueil présente + liste des 6 histoires
        let stories = 0;
        if (await tap('.stories-card')) { await page.waitForTimeout(600);
          stories = await page.$$eval('.story-item', els => els.length).catch(() => 0); }
        if (stories < 6) return { ok:false, note:'histoires attendues 6, vues ' + stories };
        return { ok:true, note: langs + ' langues · ' + units + ' unités · ' + tabs + ' onglets · ' + stories + ' histoires 📖 · vies ' + hearts };
      } catch (e) { return { ok:false, note:'exception deep: ' + String(e).slice(0,80) }; }
    } },
  { url: 'https://studio.' + ROOT + '/', name: 'Créa Studio', selKey: '#bnav', deep: async (page) => {
      // Studio créa : l'app rend sa nav complète (Bee est la mascotte de LINGUA, pas du studio —
      // Kevin 2026-08-07 ; aucune mascotte attendue ici).
      try {
        await page.waitForTimeout(1500);
        const nav = await page.$$eval('#bnav button', els => els.length).catch(() => 0);
        if (nav < 6) return { ok:false, note:'nav attendue ≥6 boutons, vus ' + nav };
        return { ok:true, note: nav + ' studios rendus' };
      } catch (e) { return { ok:false, note:'exception deep: ' + String(e).slice(0,80) }; }
    } },
  { url: BASE + '/worldmonitor/', name: 'World Monitor', selKey: '.leaflet-container' },
  { url: BASE + '/osint/', name: 'OSINT', selKey: '.leaflet-container' },
];

/* « Vérifier en réel EN TANT QUE Kevin » (Kevin 2026-08-06). OPT-IN : sans KDMC_AS_KEVIN=1
   l'audit reste strictement ANONYME — comportement historique inchangé. Le code admin ne
   vient QUE d'un secret CI et n'est jamais journalisé (masque()). */
const AS_KEVIN = process.env.KDMC_AS_KEVIN === '1';
const PIN_HASH = (process.env.KDMC_ADMIN_PIN_SHA256 || '').trim();
if (AS_KEVIN) console.log('Mode CONNECTÉ (Kevin) — code admin : ' + masque(PIN_HASH));

const SHOT_DIR = 'audit-live-shots';
mkdirSync(SHOT_DIR, { recursive: true });

const browser = await chromium.launch();
let hardFail = 0;
const report = [];

for (const s of SURFACES) {
  const page = await browser.newPage();
  const jsErrors = [];      // exceptions JS non catchées → BLOQUANT
  const failedProject = []; // requête projet BLOQUÉE (ERR_FAILED/CORS) → BLOQUANT (classe commande)
  const failedTol = [];     // requête échouée tolérée (tierce OU ERR_ABORTED app) → non bloquant
  const badStatus = [];     // 404/5xx sur un host projet → BLOQUANT (route/asset cassé)
  const authGated = [];     // 401/403 sur données projet → TOLÉRÉ : l'audit est ANONYME, donc
                            // toute donnée protégée par auth renvoie 401/403 par SÉCURITÉ (c'est
                            // le comportement voulu, pas un bug). Ne pas crier au loup (leçon #83/#106).
  const consoleErr = [];    // bruit console → rapporté, non bloquant

  page.on('pageerror', (e) => jsErrors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') consoleErr.push(m.text().slice(0, 160)); });
  page.on('requestfailed', (req) => {
    const u = req.url();
    const errText = req.failure()?.errorText || 'failed';
    const line = req.method() + ' ' + u.slice(0, 120) + ' [' + errText + ']';
    // ERR_ABORTED = requête annulée par l'app elle-même (navigation, retry auth, write non-authentifié)
    // = bruit. ERR_FAILED/BLOCKED = la CLASSE bug (blocage CORS commande, ressource refusée) → bloquant.
    if (isProjectHost(u) && !/ERR_ABORTED/i.test(errText)) failedProject.push(line);
    else failedTol.push(line);
  });
  page.on('response', (resp) => {
    const st = resp.status();
    if (!isProjectHost(resp.url())) return;
    if (st === 401 || st === 403) authGated.push('HTTP ' + st + ' ' + resp.url().slice(0, 100)); // toléré (auth)
    else if (st === 404 || st >= 500) badStatus.push('HTTP ' + st + ' ' + resp.url().slice(0, 120)); // bloquant
  });

  const url = s.url;
  const res = { url, name: s.name, ok: true, notes: [] };
  try {
    if (AS_KEVIN) {
      const m = await connecte(page, url, { pinHash: PIN_HASH });
      if (m && m.note) res.notes.push('connexion : ' + m.note);
    }
    const resp = await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    const status = resp ? resp.status() : 0;
    if (!resp || status >= 400) { res.ok = false; res.notes.push('page HTTP ' + status); }
    await page.waitForTimeout(5000); // laisse le JS/live faire ses appels réseau

    if (!(await page.$(s.selKey))) { res.ok = false; res.notes.push('élément clé absent: ' + s.selKey); }

    if (s.deep) { try { const d = await s.deep(page); res.notes.push('deep: ' + d.note); if (!d.ok) res.ok = false; } catch (e) { res.ok = false; res.notes.push('deep KO: ' + (e && e.message ? e.message : e)); } }

    await page.screenshot({ path: SHOT_DIR + '/' + s.name.replace(/[^\w]+/g, '_') + '.png' }).catch(() => {});

    if (jsErrors.length) { res.ok = false; res.notes.push('EXCEPTION JS: ' + jsErrors.slice(0, 2).join(' | ')); }
    if (failedProject.length) { res.ok = false; res.notes.push('REQUÊTE PROJET BLOQUÉE (classe CORS/commande): ' + failedProject.slice(0, 3).join(' ; ')); }
    if (badStatus.length) { res.ok = false; res.notes.push('STATUT PROJET 404/5xx (route/asset cassé): ' + badStatus.slice(0, 3).join(' ; ')); }
    if (authGated.length) res.notes.push('401/403 données (toléré — audit anonyme, sécurité normale): ' + authGated.length);
    if (failedTol.length) res.notes.push('req. échouées tolérées (tierce/aborted): ' + failedTol.length);
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
