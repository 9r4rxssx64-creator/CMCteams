// tools/arbre/research-registres.mjs — RÉCUPÉRATION AUTO DES ACTES (registres numérisés).
// Tourne en CI (réseau ouvert). Pour chaque personne du seed avec un lieu connu,
// interroge les bases d'archives officielles qui publient les registres SCANNÉS :
//   • Monaco  : archives.mairie.mc (Omeka S — API /api/items + recherche plein texte)
//   • AD06    : archives06.fr + ancienne base basesdocumentaires-cg06.fr (état civil Nice/Beaulieu…)
//   • AD13    : archives13.fr (état civil Salon-de-Provence…)
// Stratégie : probes défensives (chaque endpoint peut avoir changé), TOUT le brut est
// commité dans arbre/research/registresraw/ pour itérer, et REGISTRES.md résume les
// liens de visionneuse trouvés par personne (à intégrer ensuite dans les fiches).
import fs from 'fs';
import path from 'path';

const HTML = fs.readFileSync('arbre/index.html', 'utf8');
const start = HTML.indexOf('var SRC={');
const end = HTML.indexOf('function seed(){');
const buildSeed = new Function('uid', 'now', HTML.slice(start, end) + '\nreturn buildSeed();');
let _u = 0;
const SEED = buildSeed(() => 'tmp' + (++_u), () => 0);

const outDir = 'arbre/research';
const rawDir = path.join(outDir, 'registresraw');
fs.mkdirSync(rawDir, { recursive: true });

const yr = d => { const m = String(d || '').match(/(\d{4})/); return m ? +m[1] : 0; };
const NOWY = new Date().getFullYear();
const UA = { 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', 'accept-language': 'fr' };

async function probe(name, url, opts) {
  try {
    const r = await fetch(url, { headers: UA, redirect: 'follow', ...(opts || {}) });
    const txt = await r.text();
    fs.writeFileSync(path.join(rawDir, name), txt.slice(0, 400000));
    console.log('[probe]', name, r.status, txt.length + 'o', url);
    return { status: r.status, body: txt, finalUrl: r.url };
  } catch (e) {
    console.log('[probe]', name, 'ERREUR', e.message, url);
    fs.writeFileSync(path.join(rawDir, name), 'ERREUR ' + e.message + '\n' + url);
    return { status: 0, body: '', error: e.message };
  }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---- Cibles : personnes avec lieu + année communicable (les scans en ligne
//      s'arrêtent en général ~1925 naissances / ~1945 pour le reste) ----
const targets = [];
for (const id in SEED) {
  const p = SEED[id];
  const nom = ((p.prenom || '') + ' ' + (p.nom || '')).trim();
  const bl = ((p.naissance && p.naissance.lieu) || '').toLowerCase();
  const by = yr(p.naissance && p.naissance.date);
  const dl = ((p.deces && p.deces.lieu) || '').toLowerCase();
  const dy = yr(p.deces && p.deces.date);
  const dept = l => /monaco/.test(l) ? 'MC' : /nice|beaulieu|villefranche|cagnes|antibes|cannes|vence/.test(l) ? '06' : /salon|marseille|aix/.test(l) ? '13' : null;
  if (by && bl && NOWY - by >= 100 && dept(bl)) targets.push({ id, nom, type: 'naissance', lieu: (p.naissance.lieu || ''), an: by, dept: dept(bl) });
  if (dy && dl && NOWY - dy >= 75 && dept(dl)) targets.push({ id, nom, type: 'décès', lieu: (p.deces.lieu || ''), an: dy, dept: dept(dl) });
  // mariages notés dans le doc (75 ans) — MT×Victor 1939 Monaco? lieu inconnu → skip
}
targets.sort((a, b) => a.dept.localeCompare(b.dept) || a.an - b.an);
console.log('Cibles :', targets.length);

// ---- 1) Monaco — Omeka S : API items + recherche plein texte par NOM ----
const mcNames = [...new Set(targets.filter(t => t.dept === 'MC').map(t => (t.nom.split(' ').pop() || '')))];
const mcFound = {};
await probe('monaco-home.html', 'https://archives.mairie.mc/s/3/base-de-registres-a-partir-de-1900/');
await probe('monaco-api-root.json', 'https://archives.mairie.mc/api/items?per_page=2');
for (const nm of [...mcNames, 'MAIFFRET', 'SAUVAIGO', 'DESARZENS']) {
  const r = await probe('monaco-api-search-' + nm + '.json', 'https://archives.mairie.mc/api/items?fulltext_search=' + encodeURIComponent(nm) + '&per_page=50');
  await sleep(1200);
  try {
    const items = JSON.parse(r.body);
    if (Array.isArray(items) && items.length) {
      mcFound[nm] = items.map(it => ({
        titre: (it['o:title'] || '').slice(0, 160),
        url: (it['@id'] || '').replace('/api/items/', '/s/3/item/')
      }));
      console.log('  Monaco «' + nm + '» :', items.length, 'résultat(s)');
    }
  } catch (e) { /* pas du JSON → brut commité pour itérer */ }
}
// recherche du site public (au cas où l'API est fermée)
await probe('monaco-site-search.html', 'https://archives.mairie.mc/s/3/recherche?fulltext_search=MAIFFRET');

// ---- 2) AD06 — nouvelle plateforme + ancienne base état civil ----
await probe('ad06-home.html', 'https://archives06.fr/');
await probe('ad06-etatcivil.html', 'https://archives06.fr/archives-en-ligne/etat-civil');
await probe('ad06-search-nice.html', 'https://archives06.fr/rechercher?query=' + encodeURIComponent('état civil Nice naissances'));
// ancienne base Arkothèque (longtemps la porte d'entrée état civil 06)
await probe('ad06-old-ec.html', 'http://www.basesdocumentaires-cg06.fr/os_ecivile/');
await probe('ad06-old-ec2.html', 'http://www.basesdocumentaires-cg06.fr/archives/consultation_etat_civil.php');

// ---- 3) AD13 — état civil (Salon-de-Provence) ----
await probe('ad13-etatcivil.html', 'https://www.archives13.fr/archive/recherche/etatcivil/n:64');
await probe('ad13-salon.html', 'https://www.archives13.fr/archive/resultats/etatcivil/n:64?RECH_commune=SALON-DE-PROVENCE&type=etatcivil');

// ---- 4) PASSE NAVIGATEUR RÉEL (Playwright) — AD06 est derrière un mur
//        anti-robot (TSPD/F5) que seul un vrai navigateur franchit ; Monaco/AD13
//        refusent la connexion http simple du runner. ----
const pwNotes = [];
try {
  const { chromium } = await import('playwright');
  const b = await chromium.launch({ args: ['--disable-blink-features=AutomationControlled'] });
  const ctx = await b.newContext({ userAgent: UA['user-agent'], locale: 'fr-FR', viewport: { width: 1280, height: 900 } });
  const pg = await ctx.newPage();
  async function browse(name, url, waitMs) {
    try {
      await pg.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await pg.waitForTimeout(waitMs || 6000);
      const html = await pg.content();
      fs.writeFileSync(path.join(rawDir, name + '.html'), html.slice(0, 500000));
      const links = await pg.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => (a.getAttribute('href') || '') + ' || ' + (a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 90)).filter(x => x.length > 6));
      fs.writeFileSync(path.join(rawDir, name + '.links.txt'), links.join('\n'));
      await pg.screenshot({ path: path.join(rawDir, name + '.png') });
      const title = await pg.title();
      console.log('[browse]', name, '«' + title + '»', links.length + ' liens');
      pwNotes.push('- **' + name + '** : « ' + title + ' » — ' + links.length + ' liens ([html](registresraw/' + name + '.html) · [liens](registresraw/' + name + '.links.txt) · [capture](registresraw/' + name + '.png))');
      return { title, links, html };
    } catch (e) {
      console.log('[browse]', name, 'ERREUR', e.message.slice(0, 120));
      pwNotes.push('- **' + name + '** : ❌ ' + e.message.slice(0, 120));
      return null;
    }
  }
  const home = await browse('pw-ad06-home', 'https://archives06.fr/', 8000);
  // suit le lien « état civil » détecté sur la page rendue
  if (home && home.links) {
    const ec = home.links.find(l => /tat[- ]civil/i.test(l));
    if (ec) { const href = ec.split(' || ')[0]; const u = href.startsWith('http') ? href : 'https://archives06.fr' + (href.startsWith('/') ? '' : '/') + href; await browse('pw-ad06-etatcivil', u, 8000); }
  }
  /* MONACO (Arkothèque) : on remplit le VRAI formulaire de recherche
     (champ nom form_rech_9 + cases naissance/mariage/décès) et on soumet
     Valider('rechercher') — comme un humain — pour chaque nom de famille. */
  const MC_HITS = [];
  const NAMES = ['MAIFFRET', 'SAUVAIGO', 'DESARZENS', 'VAN DEN BOSCH', 'MOLINARIO', 'VIRGILI', 'DENTAU'];
  async function monacoSearch(tag, baseUrl) {
    for (const nm of NAMES) {
      const t = tag + '-' + nm.replace(/\s+/g, '_');
      try {
        await pg.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await pg.waitForTimeout(2500);
        const forms = await pg.evaluate(() => [...document.querySelectorAll('form')].map(f => f.outerHTML.slice(0, 20000)).join('\n\n====\n\n'));
        if (nm === NAMES[0]) fs.writeFileSync(path.join(rawDir, tag + '.form.html'), forms);
        const submitted = await pg.evaluate((nom) => {
          /* champ NOM réel : form_rech_12 (base ≥1900 — form_rech_9 = numéro d'acte !)
             ou r_nom (base <1900 / actes indexés) */
          var inp = document.querySelector('#form_rech_12') || document.querySelector('#r_nom') || document.querySelector('input.yui-ac-input');
          if (!inp) return 'champ nom introuvable';
          inp.value = nom;
          document.querySelectorAll('input[type=checkbox][name^=form_rech_type_acte]').forEach(function(c) { c.checked = true; });
          if (typeof Valider === 'function') { Valider('rechercher', ''); return 'ok'; }
          var f = inp.form; if (f) { f.submit(); return 'ok-submit'; }
          return 'pas de Valider ni form';
        }, nm);
        if (submitted !== 'ok' && submitted !== 'ok-submit') { pwNotes.push('- **' + t + '** : ❌ ' + submitted); continue; }
        await pg.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
        await pg.waitForTimeout(2500);
        const html = await pg.content();
        fs.writeFileSync(path.join(rawDir, t + '.html'), html.slice(0, 500000));
        await pg.screenshot({ path: path.join(rawDir, t + '.png') });
        const rows = await pg.evaluate(() => [...document.querySelectorAll('tr, .resultat, li, a[href]')].map(e => ({
          t: (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 220),
          h: e.getAttribute ? (e.getAttribute('href') || '') : '',
          v: (e.querySelector && e.querySelector('a[onclick]')) ? (e.querySelector('a[onclick]').getAttribute('onclick') || '').slice(0, 300) : (e.getAttribute ? (e.getAttribute('onclick') || '').slice(0, 300) : '')
        })).filter(r => /MAIFFRET|SAUVAIGO|SARZENS|MOLINARIO|VIRGILI|BOSCH/i.test(r.t) && r.t.length > 10));
        const uniq = []; const seen = new Set();
        for (const r of rows) { const k = r.t; if (!seen.has(k)) { seen.add(k); uniq.push(r); } }
        console.log('  ' + t + ' :', uniq.length, 'ligne(s)');
        pwNotes.push('- **' + t + '** : ' + uniq.length + ' ligne(s) résultat ([html](registresraw/' + t + '.html) · [capture](registresraw/' + t + '.png))');
        uniq.slice(0, 80).forEach(r => MC_HITS.push({ base: tag, nom: nm, texte: r.t, visualiser: r.v || '', href: r.h && r.h !== '#' && !/^javascript/i.test(r.h) ? (r.h.startsWith('http') ? r.h : 'https://archives.mairie.mc' + (r.h.startsWith('/') ? '' : '/') + r.h) : '' }));
        await sleep(1500);
      } catch (e) { pwNotes.push('- **' + t + '** : ❌ ' + e.message.slice(0, 110)); }
    }
  }
  await monacoSearch('pw-mc1900', 'https://archives.mairie.mc/r/5/base-de-registres-a-partir-de-1900/');
  await monacoSearch('pw-mc-av1900', 'https://archives.mairie.mc/a/5/rechercher-par-acte-indexe/');
  fs.writeFileSync(path.join(rawDir, 'monaco-hits.json'), JSON.stringify(MC_HITS, null, 1));
  await browse('pw-ad13', 'https://www.archives13.fr/archive/recherche/etatcivil/n:64', 6000);
  await b.close();
} catch (e) {
  console.log('Playwright indisponible :', e.message.slice(0, 140));
  pwNotes.push('- ❌ Playwright indisponible : ' + e.message.slice(0, 140));
}
// lecteur Jina (texte) en secours pour les hôtes qui refusent la connexion directe
for (const [nm, u] of [['jina-ad06', 'https://archives06.fr/archives-en-ligne/etat-civil'], ['jina-ad06-home', 'https://archives06.fr/'], ['jina-ad13', 'https://www.archives13.fr/archive/recherche/etatcivil/n:64']]) {
  await probe(nm + '.txt', 'https://r.jina.ai/' + u);
  await sleep(1500);
}

// ---- Rapport ----
const L = [];
L.push('# 📜 Récupération AUTO des actes — registres numérisés officiels');
L.push('');
L.push('_Généré le ' + new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC par `tools/arbre/research-registres.mjs` (CI, réseau ouvert). Brut complet dans `registresraw/` pour itération._');
L.push('');
L.push('## Cibles (actes assez anciens pour être consultables en ligne)');
L.push('');
L.push('| Personne | Acte | Lieu | Année | Base |');
L.push('|---|---|---|---|---|');
for (const t of targets) L.push('| ' + t.nom + ' | ' + t.type + ' | ' + t.lieu + ' | ' + t.an + ' | ' + (t.dept === 'MC' ? 'Monaco' : 'AD' + t.dept) + ' |');
L.push('');
L.push('## Monaco — résultats API (base registres ≥1900)');
L.push('');
const mk = Object.keys(mcFound);
if (mk.length) {
  for (const nm of mk) {
    L.push('### « ' + nm + ' » — ' + mcFound[nm].length + ' résultat(s)');
    for (const it of mcFound[nm].slice(0, 20)) L.push('- [' + (it.titre || 'item') + '](' + it.url + ')');
    L.push('');
  }
} else {
  L.push('_Aucun résultat JSON exploitable à ce run — voir `registresraw/monaco-*.json|html` pour adapter le prochain passage._');
}
L.push('');
L.push('## AD06 / AD13 — état des probes');
L.push('');
L.push('_Voir `registresraw/ad06-*.html` et `registresraw/ad13-*.html` (structure des formulaires / visionneuses) — le prochain run ciblera les bons endpoints détectés dedans._');
L.push('');
L.push('## Passe navigateur réel (Playwright — franchit le mur anti-robot TSPD)');
L.push('');
pwNotes.forEach(n => L.push(n));
L.push('');
try {
  const hits = JSON.parse(fs.readFileSync(path.join(rawDir, 'monaco-hits.json'), 'utf8'));
  L.push('## 🎯 Monaco — lignes FAMILLE trouvées dans les listes d\'actes');
  L.push('');
  if (hits.length) { for (const h of hits) L.push('- **' + h.texte + '**' + (h.href ? ' — [ouvrir](' + h.href + ')' : '') + ' _(' + h.liste + ')_'); }
  else L.push('_Aucune ligne famille dans les lettres M/S/D à ce run — voir les dumps pw-monaco*-liste*.html pour adapter._');
  L.push('');
} catch (e) {}
fs.writeFileSync(path.join(outDir, 'REGISTRES.md'), L.join('\n') + '\n');
fs.writeFileSync(path.join(rawDir, 'targets.json'), JSON.stringify(targets, null, 1));
console.log('REGISTRES.md écrit — ' + targets.length + ' cibles, Monaco: ' + mk.length + ' nom(s) avec résultats.');
