// « Quand j'ouvre, ce n'est pas la date du jour, mauvais mois » (Kevin 2026-09-05).
// Vérifie, dans un VRAI navigateur sur les VRAIES pages servies comme en production :
//   1. CMCteams (app complète) ouvre sur le mois courant — pour CHAQUE compte (admin + employés)
//   2. la page light ouvre sur le mois courant (session neuve)
//   3. la page light, avec un tableau d'un mois PASSÉ mémorisé (le cas de Kevin), revient sur le
//      mois courant EN GARDANT LA MÊME ÉQUIPE  ← c'est le bug corrigé en v1.37 (livré en v1.38)
//   4. le mois affiché contient de vraies données (personnes, horaires, lieux)
//
// Autonome : lance son propre serveur statique qui imite l'hébergement réel — les scripts de la
// page sont en chemin ABSOLU (/CMCteams/tools/shared/planning-seed.js), donc ouvrir les fichiers
// en local (file://) ne charge AUCUNE donnée et le test serait un faux vert.
//   node tests/verify-mois-ouverture.mjs
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p.startsWith('/CMCteams/')) p = p.slice('/CMCteams'.length);
  const file = join(ROOT, p.replace(/^\/+/, ''));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('nf'); }
  const ext = (file.match(/\.[a-z0-9]+$/i) || [''])[0].toLowerCase();
  res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = process.env.CMC_BASE || `http://127.0.0.1:${server.address().port}/CMCteams`;
const APP = BASE + '/index.html';
const LIGHT = BASE + '/tools/departs/index.html';

const today = new Date();
const MFR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const MOIS_ATTENDU = MFR[today.getMonth()], AN_ATTENDU = today.getFullYear();

let fails = 0;
function assert(ok, msg) { if (ok) console.log('  ok   ' + msg); else { console.log('  FAIL ' + msg); fails++; } }

console.log("Aujourd'hui : " + today.getDate() + ' ' + MOIS_ATTENDU + ' ' + AN_ATTENDU + '\n');

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

// ─── 1) CMCteams, compte par compte ────────────────────────────────────────────
console.log('=== CMCteams (app complète) ===');
async function ouvrirApp(uid) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
  if (uid) {
    await page.addInitScript((u) => {
      try { localStorage.setItem('cmc_uid', u); localStorage.setItem('cmc_lastact', String(Date.now())); } catch (_) {}
    }, uid);
  }
  await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => window.A && Array.isArray(A.employees) && A.employees.length > 0, { timeout: 45000 });
  await page.waitForTimeout(2500);
  return { ctx, page, errs };
}

const comptes = [{ label: 'Kevin (admin)', uid: 'U11804' }];
{
  const { ctx, page } = await ouvrirApp(null);
  const autres = await page.evaluate(() => {
    const ov = (A.overrides || {})[A.year + '-' + A.month] || {};
    return A.employees.filter((e) => e.id !== 'U11804' && ov[e.id] && Object.keys(ov[e.id]).length)
      .slice(0, 3).map((e) => ({ id: e.id, name: e.name }));
  });
  autres.forEach((e) => comptes.push({ label: 'Employé ' + e.name, uid: e.id }));
  await ctx.close();
}

for (const c of comptes) {
  const { ctx, page, errs } = await ouvrirApp(c.uid);
  const st = await page.evaluate(() => {
    const key = A.year + '-' + A.month;
    const ov = (A.overrides || {})[key] || {};
    const avecPlanning = Object.keys(ov).filter((id) => ov[id] && Object.keys(ov[id]).length).length;
    return { annee: A.year, mois: A.month, connecte: (A.user && A.user.id) || null, avecPlanning };
  });
  assert(st.annee === AN_ATTENDU && st.mois === today.getMonth(),
    c.label.padEnd(28) + ' ouvre sur ' + MFR[st.mois] + ' ' + st.annee + ' (connecté=' + (st.connecte || 'non') + ')');
  if (c === comptes[0]) {
    assert(st.avecPlanning > 100, 'données réelles du mois : ' + st.avecPlanning + ' personnes avec planning');
    assert(errs.length === 0, 'aucune erreur JS (' + errs.slice(0, 1).join('') + ')');
  }
  await ctx.close();
}

// ─── 2 & 3) page light ─────────────────────────────────────────────────────────
console.log('\n=== Page light (Départs) ===');
async function ouvrirLight(boardMemorise, moiMemorise) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
  await page.addInitScript(([b, m]) => {
    try { if (b) localStorage.setItem('cmc_dep_board', b); if (m) localStorage.setItem('cmc_dep_me', m); } catch (_) {}
  }, [boardMemorise, moiMemorise]);
  await page.goto(LIGHT, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  const st = await page.evaluate((moi) => {
    const eq = (l) => { const p = String(l || '').split(' — '); return (p[1] || '').replace(/\s*\([^)]*\)\s*$/, '').trim(); };
    const rang = (id) => (BOARDS[id] ? BOARDS[id].year * 12 + BOARDS[id].monthIdx : -1);
    const recent = Math.max(...Object.keys(BOARDS).filter((k) => BOARDS[k] && BOARDS[k].kind !== 'abs').map(rang));
    const mid = (typeof mirrorBoardId === 'function') ? mirrorBoardId(BID) : null;   // vraie fonction de la page
    return {
      bid: typeof BID !== 'undefined' ? BID : null,
      label: (typeof B !== 'undefined' && B) ? B.label : null,
      equipe: (typeof B !== 'undefined' && B) ? eq(B.label) : null,
      personnes: (typeof B !== 'undefined' && B && B.people) ? B.people.length : 0,
      memorise: (function () { try { return localStorage.getItem('cmc_dep_board'); } catch (_) { return null; } })(),
      // le tableau affiché contient-il bien la personne connectée ?
      jySuis: !!(moi && typeof B !== 'undefined' && B && (B.people || []).some((p) => p.name === moi)),
      // le miroir : libellé, mois, effectif, et réciprocité (miroir du miroir == moi)
      miroir: mid && BOARDS[mid] ? BOARDS[mid].label : null,
      miroirMoisCourant: mid ? rang(mid) === recent : null,
      miroirPersonnes: mid && BOARDS[mid] ? (BOARDS[mid].people || []).length : 0,
      miroirReciproque: mid ? mirrorBoardId(mid) === BID : null,
      // bouton « 🔁 Équipe miroir » réellement visible quand un miroir existe
      boutonMiroir: (function () { const b = document.getElementById('mirBtn'); return b ? b.style.display !== 'none' : false; })(),
    };
  }, moiMemorise || null);
  return { ctx, page, st, errs };
}

// (2) session neuve
{
  const { ctx, st, errs } = await ouvrirLight(null);
  assert(!!st.label && st.label.indexOf(MOIS_ATTENDU + ' ' + AN_ATTENDU) === 0,
    'session neuve → ouvre sur « ' + st.label + ' »');
  assert(st.personnes > 0, 'le tableau contient de vraies personnes (' + st.personnes + ')');
  assert(errs.length === 0, 'aucune erreur JS (' + errs.slice(0, 1).join('') + ')');
  await ctx.close();
}

// (3) LE CAS DE KEVIN : un tableau d'un mois passé est mémorisé sur le téléphone
{
  // on choisit un vrai tableau d'un mois antérieur dont l'équipe existe encore ce mois-ci
  const { ctx: c0, page: p0 } = await ouvrirLight(null);
  const cible = await p0.evaluate((moisCourant) => {
    const eq = (l) => { const p = String(l || '').split(' — '); return (p[1] || '').replace(/\s*\([^)]*\)\s*$/, '').trim(); };
    const ids = Object.keys(BOARDS).filter((k) => BOARDS[k] && BOARDS[k].kind !== 'abs');
    const rang = (k) => BOARDS[k].year * 12 + BOARDS[k].monthIdx;
    const max = Math.max(...ids.map(rang));
    const recentes = new Set(ids.filter((k) => rang(k) === max).map((k) => eq(BOARDS[k].label)));
    const vieux = ids.filter((k) => rang(k) < max && recentes.has(eq(BOARDS[k].label)));
    return vieux.length ? { id: vieux[0], equipe: eq(BOARDS[vieux[0]].label), label: BOARDS[vieux[0]].label } : null;
  }, today.getMonth());
  await c0.close();

  if (!cible) { assert(false, 'impossible de trouver un tableau de mois passé pour le test'); }
  else {
    console.log('  (simulation : personne connectée, le téléphone a mémorisé « ' + cible.label + ' »)');
    const { ctx, st } = await ouvrirLight(cible.id);
    assert(!!st.label && st.label.indexOf(MOIS_ATTENDU + ' ' + AN_ATTENDU) === 0,
      'tableau d\'un mois passé mémorisé → revient sur ' + MOIS_ATTENDU + ' (affiché : « ' + st.label + ' »)');
    assert(st.equipe === cible.equipe,
      'la MÊME équipe est conservée (' + cible.equipe + ' → ' + st.equipe + ')');
    assert(st.memorise === st.bid, 'la mémoire du téléphone est remise à jour (plus de blocage)');
    assert(st.personnes > 0, 'le tableau affiché contient de vraies personnes (' + st.personnes + ')');
    await ctx.close();
  }
}

// ─── 4) « MIROIR AUSSI POUR CHAQUE » (Kevin 2026-09-05) ────────────────────────
// Chacun CHANGE D'ÉQUIPE CHAQUE MOIS. Reporter le NUMÉRO d'équipe du mois passé posait la
// personne sur une équipe qui n'est pas la sienne — donc sur le mauvais MIROIR (mesuré avant
// v1.39 : Kevin affiché BJ Éq.7 / miroir BJ Éq.4, alors qu'il est en BJ Éq.6 / miroir BJ Éq.10).
// Ici on ouvre la VRAIE page, connecté, avec le tableau du mois PASSÉ mémorisé.
console.log('\n=== Mon équipe ET mon miroir, compte par compte (page light) ===');
{
  const { ctx: c0, page: p0 } = await ouvrirLight(null);
  const comptesLight = await p0.evaluate(() => {
    const rang = (k) => BOARDS[k].year * 12 + BOARDS[k].monthIdx;
    const ids = Object.keys(BOARDS).filter((k) => BOARDS[k] && BOARDS[k].kind !== 'abs');
    const recent = Math.max(...ids.map(rang));
    const anciens = ids.filter((k) => rang(k) < recent);
    const out = [];
    // on prend des personnes présentes le mois PASSÉ *et* ce mois-ci, réparties sur des équipes
    // différentes, dont Kevin s'il y est.
    const dejaVu = new Set();
    const candidats = [];
    anciens.forEach((k) => (BOARDS[k].people || []).forEach((p) => candidats.push({ nom: p.name, vieuxBid: k })));
    candidats.sort((a, b) => (a.nom === 'DESARZENS K' ? -1 : b.nom === 'DESARZENS K' ? 1 : 0));
    for (const c of candidats) {
      const now = ids.filter((k) => rang(k) === recent).find((k) => (BOARDS[k].people || []).some((p) => p.name === c.nom));
      if (!now || dejaVu.has(now)) continue;
      dejaVu.add(now);
      const mid = mirrorBoardId(now);
      out.push({
        nom: c.nom, vieuxBid: c.vieuxBid, vieuxLabel: BOARDS[c.vieuxBid].label,
        bonBoard: now, bonLabel: BOARDS[now].label,
        bonMiroir: mid && BOARDS[mid] ? BOARDS[mid].label : null,
      });
      if (out.length >= 6) break;
    }
    return out;
  });
  await c0.close();

  assert(comptesLight.length >= 3, comptesLight.length + ' comptes réels testés (personnes présentes le mois passé ET ce mois-ci)');
  for (const c of comptesLight) {
    const { ctx, st } = await ouvrirLight(c.vieuxBid, c.nom);
    const qui = (c.nom + (c.nom === 'DESARZENS K' ? ' (Kevin)' : '')).padEnd(22);
    assert(st.label === c.bonLabel,
      qui + ' → SON équipe de ' + MOIS_ATTENDU + ' : « ' + st.label + ' » (mémorisé : ' + c.vieuxLabel + ')');
    assert(st.jySuis, qui + ' figure bien dans le tableau affiché');
    if (c.bonMiroir) {
      assert(st.miroir === c.bonMiroir, qui + ' → SON miroir : « ' + st.miroir + ' »');
      assert(st.miroirMoisCourant === true, qui + ' miroir sur le mois courant');
      assert(st.miroirPersonnes > 0, qui + ' miroir non vide (' + st.miroirPersonnes + ' personnes)');
      assert(st.miroirReciproque === true, qui + ' miroir réciproque (le miroir du miroir, c\'est moi)');
      assert(st.boutonMiroir === true, qui + ' bouton « 🔁 Équipe miroir » visible');
    } else {
      assert(st.miroir === null, qui + ' n\'a pas d\'équipe miroir ce mois-ci (aucune autre équipe n\'a ses repos) — affiché sans miroir');
    }
    await ctx.close();
  }
}

// ─── 5) TOUT LE MONDE : équipe + miroir du mois courant (fonctions réelles de la page) ──
{
  const { ctx, page } = await ouvrirLight(null);
  const bilan = await page.evaluate(() => {
    const rang = (k) => (BOARDS[k] ? BOARDS[k].year * 12 + BOARDS[k].monthIdx : -1);
    const ids = Object.keys(BOARDS).filter((k) => BOARDS[k] && BOARDS[k].kind !== 'abs');
    const recent = Math.max(...ids.map(rang));
    const duMois = ids.filter((k) => rang(k) === recent);
    // repos majoritaires d'une équipe = sa signature ; deux équipes miroir la partagent
    const repos = (id) => {
      const b = BOARDS[id], P = b.people || [], out = [];
      for (let d = 1; d <= b.days; d++) {
        let r = 0, t = 0;
        P.forEach((p) => { const c = (p.codes[d] || '').trim(); if (!c) return; t++; if (c === 'RH' || c === 'R') r++; });
        if (t && r / t > 0.5) out.push(d);
      }
      return out.join(',');
    };
    const ko = [], sansMiroirLegitime = [], sansMiroirSuspect = [];
    let personnes = 0;
    duMois.forEach((id) => {
      personnes += (BOARDS[id].people || []).length;
      const mid = mirrorBoardId(id);                       // vraie fonction de la page
      if (!mid || !BOARDS[mid]) {
        const jumeaux = duMois.filter((o) => o !== id && repos(o) === repos(id));
        (jumeaux.length ? sansMiroirSuspect : sansMiroirLegitime).push(BOARDS[id].label);
        return;
      }
      if (rang(mid) !== recent) ko.push({ b: BOARDS[id].label, m: BOARDS[mid].label, quoi: 'miroir sur un AUTRE mois' });
      else if (!(BOARDS[mid].people || []).length) ko.push({ b: BOARDS[id].label, m: BOARDS[mid].label, quoi: 'miroir vide' });
      else if (mirrorBoardId(mid) !== id) ko.push({ b: BOARDS[id].label, m: BOARDS[mid].label, quoi: 'miroir non réciproque' });
    });
    return { equipes: duMois.length, personnes, ko, sansMiroirLegitime, sansMiroirSuspect };
  });
  assert(bilan.ko.length === 0,
    bilan.equipes + ' équipes / ' + bilan.personnes + ' personnes : miroir sur le bon mois, non vide, réciproque'
      + (bilan.ko.length ? ' — ' + JSON.stringify(bilan.ko.slice(0, 3)) : ''));
  assert(bilan.sansMiroirSuspect.length === 0,
    'aucune équipe privée de miroir alors qu\'une autre a les mêmes repos'
      + (bilan.sansMiroirSuspect.length ? ' — ' + bilan.sansMiroirSuspect.join(', ') : ''));
  if (bilan.sansMiroirLegitime.length) {
    console.log('  (info : ' + bilan.sansMiroirLegitime.length + ' équipe(s) sans miroir ce mois-ci, repos uniques : '
      + bilan.sansMiroirLegitime.join(', ') + ')');
  }
  await ctx.close();
}

// ─── 6) CMCteams (app) : mon équipe ET mon miroir, compte par compte ───────────
console.log('\n=== Mon équipe ET mon miroir, compte par compte (CMCteams) ===');
{
  const { ctx, page } = await ouvrirApp(null);
  // L'app résout les équipes du mois PARESSEUSEMENT, au rendu de la vue Départs
  // (détection par jours de repos). Sans ce rendu, teamForMonth répond « ? » pour tout le
  // monde et le contrôle serait un faux vert : on ne testerait rien.
  await page.evaluate(() => { try { sv('departs'); } catch (_) {} });
  await page.waitForTimeout(3000);
  const res = await page.evaluate(() => {
    const y = A.year, m = A.month;
    const avec = A.employees.filter((e) => typeof teamForMonth === 'function' && (teamForMonth(e, y, m) || null) && teamForMonth(e, y, m) !== '?');
    const ech = [A.employees.find((e) => e.id === 'U11804')].filter(Boolean)
      .concat(avec.filter((e) => e.id !== 'U11804').slice(0, 4));
    const lignes = ech.map((e) => {
      const tid = teamForMonth(e, y, m);
      const mir = tid ? _cmcMirrorTeam(tid, y, m) : null;
      const mirId = mir && mir.id ? mir.id : null;
      const retour = mirId ? _cmcMirrorTeam(mirId, y, m) : null;
      const membres = mirId ? A.employees.filter((x) => teamForMonth(x, y, m) === mirId).length : 0;
      const lib = (id) => { try { const t = gt(id); return (t && (t.label || t.name)) || id; } catch (_) { return id; } };
      return { nom: e.name, id: e.id, equipe: tid || null, equipeLib: tid ? lib(tid) : null,
               miroir: mirId, miroirLib: mirId ? lib(mirId) : null,
               reciproque: retour && retour.id ? retour.id === tid : null, membres };
    });
    return { avecEquipe: avec.length, lignes, prefixeMois: y + '-' + String(m + 1).padStart(2, '0') };
  });
  assert(res.avecEquipe > 100, res.avecEquipe + ' personnes ont une équipe pour ' + MOIS_ATTENDU + ' (données réelles)');
  assert(res.lignes.length >= 3, res.lignes.length + ' comptes testés en détail');
  res.lignes.forEach((l) => {
    const qui = (l.nom + (l.id === 'U11804' ? ' (Kevin)' : '')).padEnd(24);
    assert(!!l.equipe && l.equipe !== '?', qui + ' a une équipe pour ' + MOIS_ATTENDU + ' : ' + l.equipeLib);
    // l'identifiant d'équipe porte le mois : il doit être celui du mois courant, pas celui d'avant
    assert(String(l.equipe).indexOf(res.prefixeMois) === 0, qui + ' équipe bien datée de ' + MOIS_ATTENDU);
    if (l.miroir) {
      assert(String(l.miroir).indexOf(res.prefixeMois) === 0, qui + ' miroir daté de ' + MOIS_ATTENDU + ' : ' + l.miroirLib);
      assert(l.membres > 0, qui + ' miroir non vide (' + l.membres + ' personnes)');
      assert(l.reciproque === true, qui + ' miroir réciproque (' + l.equipeLib + ' ⇄ ' + l.miroirLib + ')');
    } else {
      console.log('  info  ' + qui + ' pas de miroir ce mois-ci pour ' + l.equipeLib + ' (repos uniques)');
    }
  });
  // même personne, mêmes réponses des deux côtés : CMCteams et light ne doivent jamais diverger
  {
    const kevApp = res.lignes.find((l) => l.id === 'U11804');
    const { ctx: cL, st: stL } = await ouvrirLight(null, 'DESARZENS K');
    if (kevApp) {
      assert(stL.label === kevApp.equipeLib,
        'Kevin : MÊME équipe des deux côtés (app « ' + kevApp.equipeLib + ' » ⇄ light « ' + stL.label + ' »)');
      assert(stL.miroir === kevApp.miroirLib,
        'Kevin : MÊME miroir des deux côtés (app « ' + kevApp.miroirLib + ' » ⇄ light « ' + stL.miroir + ' »)');
    }
    await cL.close();
  }
  await ctx.close();
}

console.log('\n' + (fails ? '❌ ' + fails + ' contrôle(s) en échec' : '✅ mois courant, MON équipe et MON miroir, données réelles'));
await browser.close();
server.close();
process.exitCode = fails ? 1 : 0;
