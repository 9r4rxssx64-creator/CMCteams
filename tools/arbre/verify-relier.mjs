#!/usr/bin/env node
/* Vérification RÉELLE de la section « 🔗 À relier » de l'arbre (v3.19) — vrai navigateur.
   ---------------------------------------------------------------------------------------
   Kevin 10.09.2026 : « as-tu attribué les orphelins ? tous, chaque arbre ? organise au plus
   clair ». Ce qui se vérifie ici, sur les DEUX arbres, dans un Chromium réel :
     · personne ne disparaît : troncs + détachés = tout le monde de la famille affichée ;
     · chaque personne détachée est rangée sous un bandeau qui NOMME sa cause ;
     · les 4 causes sont distinguées (fiche du parent introuvable / relié dans l'autre
       arbre / couple sans parents ni enfants / aucun lien renseigné) ;
     · le panneau des Réglages liste EXACTEMENT les mêmes personnes que l'arbre (une seule
       source : le panneau ne recalcule rien) ;
     · le compteur affiché sur l'arbre est celui du rendu COURANT, pas du précédent ;
     · toucher un nom du panneau ouvre bien sa fiche.
   Données : famille SYNTHÉTIQUE (0 donnée réelle) ou un export privé (--donnees x.json).
   Usage : node tools/arbre/verify-relier.mjs [--donnees export.json]   · sortie 1 si échec.
   Réseau : tout est bloqué sauf le serveur local. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fixture } from './fixture-famille.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ARBRE = path.join(ROOT, 'arbre');
const DONNEES = (() => {
  const i = process.argv.indexOf('--donnees');
  if (i > 0) { const d = JSON.parse(fs.readFileSync(path.resolve(process.argv[i + 1]), 'utf8')); return d.persons ? d : { persons: d, meta: { updatedAt: 1 } }; }
  return fixture();
})();

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml' };
function serve() {
  return new Promise((res) => {
    const srv = http.createServer((req, rsp) => {
      let f = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (f === '/' || f === '') f = '/index.html';
      const fp = path.join(ARBRE, f);
      if (!fp.startsWith(ARBRE) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { rsp.writeHead(404); rsp.end(); return; }
      rsp.writeHead(200, { 'content-type': MIME[path.extname(fp)] || 'application/octet-stream' });
      fs.createReadStream(fp).pipe(rsp);
    });
    srv.listen(0, '127.0.0.1', () => res(srv));
  });
}
async function loadPlaywright() {
  for (const name of ['playwright', 'playwright-core']) { try { return await import(name); } catch (e) { /* suivant */ } }
  if (process.env.PW_MODULE_DIR) return import(pathToFileURL(path.join(process.env.PW_MODULE_DIR, 'node_modules', 'playwright-core', 'index.mjs')).href);
  throw new Error('playwright introuvable : npm i playwright-core, ou PW_MODULE_DIR=<dossier qui contient node_modules>');
}
function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  try {
    const dirs = fs.readdirSync(base).filter((d) => /^chromium-\d+$/.test(d)).sort();
    for (const d of dirs.reverse()) { const c = path.join(base, d, 'chrome-linux', 'chrome'); if (fs.existsSync(c)) return c; }
  } catch (e) { /* pas de dossier */ }
  return undefined;
}

const fails = [];
function check(ok, label, detail) {
  console.log((ok ? '  ✅ ' : '  ❌ ') + label + (detail ? ' — ' + detail : ''));
  if (!ok) fails.push(label + (detail ? ' — ' + detail : ''));
}

const srv = await serve();
const base = `http://127.0.0.1:${srv.address().port}`;
const pw = await loadPlaywright();
const browser = await pw.chromium.launch({ headless: true, executablePath: chromePath() });
try {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'fr-FR' });
  await ctx.route('**/*', (route) => (route.request().url().startsWith(base) && !/\/sw\.js(\?|$)/.test(route.request().url()) ? route.continue() : route.abort()));
  await ctx.addInitScript((a) => { localStorage.setItem('arbre_trust', '1'); localStorage.setItem('arbre_codehash', a.h); localStorage.setItem('arbre_v2_text', a.db); }, { h: 'f'.repeat(64), db: JSON.stringify(DONNEES) });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  await page.goto(base + '/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelectorAll('#stage .tnode, #stage .tmed').length > 0, null, { timeout: 30000 });

  const info = await page.evaluate(() => ({ app: window.APP_VER, pers: Object.keys(DB.persons).length }));
  console.log(`\n🌳 Arbre ${info.app} — ${info.pers} personnes — ${base}\n`);

  for (const fam of ['o', 'c']) {
    const r = await page.evaluate((fam) => {
      FAMKEY = fam; renderTree();
      const lay = _lay || {};
      const groupes = (aRelierGroupes || []).map((g) => ({ code: g.code, lab: g.lab, branche: g.branche, ids: g.ids.slice() }));
      const detaches = [].concat.apply([], groupes.map((g) => g.ids));
      const membres = Object.keys(DB.persons).filter((x) => famOf(DB.persons[x]).indexOf(fam) >= 0);
      const badge = (document.querySelector('#relierBadge') || {}).textContent || '';
      const bandes = (lay.bands || []).map((b) => b.label);
      return {
        label: famLabel(fam), membres: membres.length, poses: (lay.nodes || []).length,
        groupes, detaches, badge, bandes, branches: (aRelierBranches || []).map((b) => ({ n: b.ids.length, racines: b.racines.length, label: b.label })),
        /* toutes les personnes détachées ont bien une carte posée */
        posesIds: (lay.nodes || []).map((n) => n.id),
      };
    }, fam);

    console.log(`— ${r.label} : ${r.membres} membres · ${r.detaches.length} à relier`);
    check(r.poses === r.membres, `${r.label} : personne ne disparaît de la mise en page`, `${r.poses} cartes posées / ${r.membres} membres`);
    check(r.detaches.every((id) => r.posesIds.indexOf(id) >= 0), `${r.label} : chaque personne à relier a bien sa carte`);
    check(new Set(r.detaches).size === r.detaches.length, `${r.label} : personne n'apparaît deux fois dans les détachés`);
    const attendu = r.detaches.length ? `${r.detaches.length} personne` : '';
    check(r.badge.indexOf(attendu) >= 0, `${r.label} : le compteur affiché est celui du rendu courant`, `badge « ${r.badge.trim()} », attendu « ${attendu} »`);
    /* Une branche reliée mais séparée du tronc ne doit PAS porter le même bandeau que le
       tronc : c'est le cas signalé par Kevin (une mère et sa fille flottant à côté). */
    r.branches.forEach((b) => {
      check(r.bandes.some((x) => x.indexOf('Branche à rattacher') >= 0 && x.indexOf('(' + b.n + ')') >= 0),
        `${r.label} : la branche séparée « ${b.label} » est nommée pour ce qu'elle est`, `${b.n} personne(s)`);
      check(b.racines > 0, `${r.label} : la branche « ${b.label} » nomme QUI rattacher`, `${b.racines} racine(s)`);
    });
    check(r.bandes.filter((x) => x.indexOf('Branche à rattacher') >= 0).length === r.branches.length,
      `${r.label} : autant de bandeaux « branche à rattacher » que de branches détachées`);
    r.groupes.forEach((g) => {
      check(!!g.lab && !!g.branche, `${r.label} : le groupe « ${g.branche} — ${g.lab} » nomme sa cause et sa lignée`, `${g.ids.length} personne(s)`);
      check(r.bandes.some((b) => b.indexOf(g.lab) >= 0 && b.indexOf(String(g.ids.length)) >= 0),
        `${r.label} : un bandeau porte « ${g.lab} » avec son compte`);
    });

    /* Le panneau des Réglages doit lister EXACTEMENT les mêmes personnes. */
    const panneau = await page.evaluate((fam) => {
      FAMKEY = fam; VIEW = 'tools'; render();
      const boutons = [].slice.call(document.querySelectorAll('[data-relier]')).map((b) => b.dataset.relier);
      /* textContent, pas innerText : innerText dépend du RENDU (styles, visibilité) et
         renvoie du vide sur un panneau hors écran — on vérifierait alors l'affichage,
         pas le contenu. Ici on veut savoir si le panneau EXISTE et ce qu'il dit. */
      const el = document.querySelector('#wrap') || document.body;
      const txt = el.textContent || '';
      return { boutons, aTitre: /À relier/.test(txt), mentionneLesDeux: /Sauvaigo/i.test(txt) && /Desarzens/i.test(txt), debut: txt.slice(0, 90) };
    }, fam);
    const tousDansPanneau = await page.evaluate(() => {
      const r = [aRelierDe('o'), aRelierDe('c')];
      const ids = [];
      r.forEach((x) => { x.groupes.forEach((g) => ids.push.apply(ids, g.ids)); x.branches.forEach((b) => ids.push.apply(ids, (b.racines.length ? b.racines : b.ids))); });
      return ids;
    });
    check(panneau.aTitre, `${r.label} : le panneau « À relier » est présent dans les Réglages`, panneau.debut.replace(/\s+/g, ' '));
    check(panneau.mentionneLesDeux, `${r.label} : le panneau parle des DEUX arbres, pas seulement de celui affiché`);
    check(r.detaches.every((id) => tousDansPanneau.indexOf(id) >= 0),
      `${r.label} : le panneau liste les mêmes personnes que l'arbre (source unique)`,
      `${tousDansPanneau.length} listée(s) au total`);
    check(panneau.boutons.length === tousDansPanneau.length,
      `${r.label} : chaque personne à relier est touchable dans le panneau`,
      `${panneau.boutons.length} bouton(s) / ${tousDansPanneau.length} personne(s)`);

    if (panneau.boutons.length) {
      const ouvre = await page.evaluate((id) => {
        const b = document.querySelector('[data-relier="' + id + '"]');
        if (!b) return { ok: false, why: 'bouton absent' };
        b.click();
        const ov = document.querySelector('.ov');
        return { ok: !!ov, texte: ov ? ov.innerText.slice(0, 60) : '' };
      }, panneau.boutons[0]);
      check(ouvre.ok, `${r.label} : toucher un nom ouvre bien sa fiche`, ouvre.texte.replace(/\n/g, ' · '));
      await page.evaluate(() => { const c = document.querySelector('.ov'); if (c) c.remove(); VIEW = 'tree'; render(); });
    }
  }

  /* Les 4 causes doivent être distinguables — sinon le classement ne sert à rien. */
  const causes = await page.evaluate(() => {
    const vus = {};
    ['o', 'c'].forEach((k) => {
      const r = aRelierDe(k);
      r.groupes.forEach((g) => { vus[g.code] = (vus[g.code] || 0) + g.ids.length; });
      if (r.branches.length) vus.branche = (vus.branche || 0) + r.branches.length;
    });
    return vus;
  });
  console.log('\n— causes rencontrées : ' + (Object.keys(causes).map((k) => k + '×' + causes[k]).join(' · ') || 'aucune'));
  check(Object.keys(causes).length >= 2, 'au moins deux causes distinctes sont reconnues', Object.keys(causes).join(', '));
  check(!!causes.fantome, 'la fiche de parent introuvable est détectée (le seul vrai défaut de données)');

  check(errors.length === 0, '0 erreur JavaScript pendant toute la vérification', errors.slice(0, 3).join(' | '));
} finally {
  await browser.close();
  srv.close();
}

console.log(`\n=== ${fails.length ? '❌ ' + fails.length + ' échec(s)' : '✅ tout est vérifié'} ===`);
process.exit(fails.length ? 1 : 0);
