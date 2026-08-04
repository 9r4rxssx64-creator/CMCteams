// tools/arbre/research-infos.mjs — INFOS MAX pour chaque personne / chaque famille.
// Tourne en CI (réseau ouvert). Sources OUVERTES interrogées automatiquement :
//   • Gallica (BnF, API SRU officielle) : presse ancienne numérisée — L'Éclaireur de Nice,
//     Journal de Monaco, etc. Les mariages/naissances/faits divers de l'époque y sont.
//   • archive.org (advancedsearch, API ouverte) : livres, annuaires, presse mondiale.
//   • journaldemonaco.gouv.mc : gazette officielle (mariages, naturalisations) — probe.
// Requêtes par NOM DE FAMILLE + localité (toutes les familles : Maiffret, Sauvaigo,
// Desarzens, Van den Bosch, Molinario, Virgili, Dentau) + personnes clés nommées.
// Rapport : arbre/research/INFOS.md (+ brut infosraw/) — les meilleures trouvailles
// sont ensuite intégrées aux fiches.
import fs from 'fs';
import path from 'path';

const outDir = 'arbre/research';
const rawDir = path.join(outDir, 'infosraw');
fs.mkdirSync(rawDir, { recursive: true });
const UA = { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36', 'accept-language': 'fr' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const QUERIES = [
  // nom + localité (familles complètes)
  { q: '"MAIFFRET" "Beaulieu"', tag: 'maiffret-beaulieu' },
  { q: '"MAIFFRET" "Nice"', tag: 'maiffret-nice' },
  { q: '"MAIFFRET" "Monaco"', tag: 'maiffret-monaco' },
  { q: '"SAUVAIGO" "Monaco"', tag: 'sauvaigo-monaco' },
  { q: '"SAUVAIGO" "Nice"', tag: 'sauvaigo-nice' },
  { q: '"DESARZENS" "Monaco"', tag: 'desarzens-monaco' },
  { q: '"DESARZENS"', tag: 'desarzens' },
  { q: '"VAN DEN BOSCH" "Beaulieu"', tag: 'vdb-beaulieu' },
  { q: '"MOLINARIO" "Nice"', tag: 'molinario-nice' },
  { q: '"VIRGILI" "Beaulieu"', tag: 'virgili' },
  { q: '"DENTAU"', tag: 'dentau' },
  // personnes clés (mariages / mentions presse d'époque)
  { q: '"Marius MAIFFRET"', tag: 'p-marius' },
  { q: '"Victor SAUVAIGO" "Monaco"', tag: 'p-victor' },
  { q: '"Jean-Baptiste MAIFFRET"', tag: 'p-jb' },
  { q: '"Charles MAIFFRET" "Nice"', tag: 'p-charles' }
];

const R = { gallica: {}, ia: {}, jdm: [] };

// ---- 1) Gallica SRU (API officielle ouverte de la BnF) ----
for (const { q, tag } of QUERIES) {
  const url = 'https://gallica.bnf.fr/SRU?operation=searchRetrieve&version=1.2&maximumRecords=15&query=' + encodeURIComponent('gallica all ' + q);
  try {
    const r = await fetch(url, { headers: UA });
    const xml = await r.text();
    fs.writeFileSync(path.join(rawDir, 'gallica-' + tag + '.xml'), xml.slice(0, 300000));
    const total = (xml.match(/<srw:numberOfRecords>(\d+)</) || [])[1] || '0';
    const recs = [];
    const re = /<srw:record>([\s\S]*?)<\/srw:record>/g;
    let m;
    while ((m = re.exec(xml)) && recs.length < 15) {
      const g = (t) => { const mm = m[1].match(new RegExp('<dc:' + t + '[^>]*>([^<]{2,200})')); return mm ? mm[1].trim() : ''; };
      const ark = (m[1].match(/<dc:identifier[^>]*>(https?:\/\/gallica\.bnf\.fr\/ark:[^<]+)/) || [])[1] || '';
      if (ark) recs.push({ titre: g('title'), date: g('date'), type: g('type'), url: ark });
    }
    R.gallica[tag] = { q, total: +total, recs };
    console.log('[gallica]', tag, total + ' résultat(s)');
  } catch (e) { console.log('[gallica]', tag, 'ERREUR', e.message); R.gallica[tag] = { q, error: e.message }; }
  await sleep(1200);
}

// ---- 2) archive.org advancedsearch (API ouverte) ----
for (const { q, tag } of QUERIES.slice(0, 11)) {
  const url = 'https://archive.org/advancedsearch.php?q=' + encodeURIComponent(q) + '&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=year&rows=10&output=json';
  try {
    const r = await fetch(url, { headers: UA });
    const j = await r.json();
    const docs = (j.response && j.response.docs) || [];
    R.ia[tag] = { q, total: (j.response && j.response.numFound) || 0, recs: docs.map(d => ({ titre: (d.title || '').toString().slice(0, 140), year: d.year || '', url: 'https://archive.org/details/' + d.identifier })) };
    console.log('[archive.org]', tag, R.ia[tag].total + ' résultat(s)');
  } catch (e) { console.log('[archive.org]', tag, 'ERREUR', e.message); R.ia[tag] = { q, error: e.message }; }
  await sleep(1000);
}

// ---- 3) Journal de Monaco (gazette officielle) — probes ----
for (const [nm, u] of [
  ['jdm-home', 'https://journaldemonaco.gouv.mc/'],
  ['jdm-search-maiffret', 'https://journaldemonaco.gouv.mc/Recherche?q=MAIFFRET'],
  ['jdm-search-sauvaigo', 'https://journaldemonaco.gouv.mc/Recherche?q=SAUVAIGO'],
  ['jdm-jina-maiffret', 'https://r.jina.ai/https://journaldemonaco.gouv.mc/Recherche?q=MAIFFRET']
]) {
  try {
    const r = await fetch(u, { headers: UA });
    const t = await r.text();
    fs.writeFileSync(path.join(rawDir, nm + '.html'), t.slice(0, 300000));
    console.log('[jdm]', nm, r.status, t.length + 'o');
    R.jdm.push(nm + ' : HTTP ' + r.status + ' (' + t.length + ' o)');
  } catch (e) { console.log('[jdm]', nm, 'ERREUR', e.message); R.jdm.push(nm + ' : ❌ ' + e.message); }
  await sleep(1200);
}

// ---- 4) VA PLUS LOIN — registres officiels supplémentaires + photos ----
// Personnes du seed (extraites du vrai index.html) pour les requêtes par personne
const HTML2 = fs.readFileSync('arbre/index.html', 'utf8');
const _st = HTML2.indexOf('var SRC={'); const _en = HTML2.indexOf('function seed(){');
let SEED = {};
try { let _u = 0; SEED = new Function('uid', 'now', HTML2.slice(_st, _en) + '\nreturn buildSeed();')(() => 't' + (++_u), () => 0); } catch (e) { console.log('seed extract:', e.message); }
const yr2 = d => { const m = String(d || '').match(/(\d{4})/); return m ? +m[1] : 0; };

R.mil = []; R.graves = []; R.avis = []; R.suisse = [];

// 4a) Registres MILITAIRES (matricules : profession, signalement, domiciles)
//     Grand Mémorial (culture.gouv) + Mémoire des hommes (morts 14-18 / 39-45)
for (const [nm, u] of [
  ['gm-home', 'https://www.culture.gouv.fr/Espace-documentation/Moteurs-Collections/Grand-Memorial'],
  ['gm-maiffret', 'https://www.culture.gouv.fr/public/mistral/memorial_fr?ACTION=CHERCHER&FIELD_1=NOM&VALUE_1=MAIFFRET'],
  ['mdh-maiffret', 'https://www.memoiredeshommes.sga.defense.gouv.fr/fr/arkotheque/client/mdh/recherche_globale/resu_rech.php?titre=MAIFFRET'],
  ['mdh-sauvaigo', 'https://www.memoiredeshommes.sga.defense.gouv.fr/fr/arkotheque/client/mdh/recherche_globale/resu_rech.php?titre=SAUVAIGO'],
  ['jina-gm-maiffret', 'https://r.jina.ai/https://www.culture.gouv.fr/public/mistral/memorial_fr?ACTION=CHERCHER&FIELD_1=NOM&VALUE_1=MAIFFRET']
]) {
  try { const r = await fetch(u, { headers: UA }); const t = await r.text(); fs.writeFileSync(path.join(rawDir, nm + '.html'), t.slice(0, 300000)); console.log('[mil]', nm, r.status, t.length + 'o'); R.mil.push(nm + ' : HTTP ' + r.status + ' (' + t.length + ' o)'); } catch (e) { R.mil.push(nm + ' : ❌ ' + e.message); }
  await sleep(1200);
}

// 4b) TOMBES + PHOTOS (Findagrave — photos de sépultures, souvent portraits)
for (const nom of ['MAIFFRET', 'SAUVAIGO', 'DESARZENS', 'VAN+DEN+BOSCH']) {
  const nm = 'fg-' + nom.replace(/\+/g, '');
  try {
    const r = await fetch('https://www.findagrave.com/memorial/search?lastname=' + nom + '&countryId=France', { headers: UA });
    const t = await r.text();
    fs.writeFileSync(path.join(rawDir, nm + '.html'), t.slice(0, 300000));
    const hits = [...t.matchAll(/href="(\/memorial\/\d+\/[^"]+)"[^>]*>[\s\S]{0,200}?<h2[^>]*>([^<]{3,80})/g)].slice(0, 12);
    hits.forEach(h => R.graves.push({ nom: h[2].trim(), url: 'https://www.findagrave.com' + h[1] }));
    console.log('[findagrave]', nm, r.status, hits.length + ' tombe(s)');
  } catch (e) { console.log('[findagrave]', nm, 'ERREUR', e.message); }
  await sleep(1500);
}

// 4c) AVIS DE DÉCÈS AVEC PHOTOS (défunts récents ≥1990, toutes familles)
const recent = Object.values(SEED).filter(p => yr2(p.deces && p.deces.date) >= 1990).slice(0, 14);
for (const p of recent) {
  const full = ((p.prenom || '') + ' ' + (p.nom || '')).trim();
  const q = '"' + full + '" avis de décès ' + yr2(p.deces.date);
  const nm = 'avis-' + full.toLowerCase().replace(/[^a-z]+/g, '-').slice(0, 30);
  try {
    const r = await fetch('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(q), { headers: UA });
    const t = await r.text();
    fs.writeFileSync(path.join(rawDir, nm + '.html'), t.slice(0, 200000));
    const links = [...t.matchAll(/<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]{3,140}?)<\/a>/g)]
      .map(m => ({ u: m[1], t: m[2].replace(/<[^>]+>/g, '').trim() }))
      .filter(l => /dansnoscoeurs|libramemoria|avis-deces|deces|obseque|pompes|simplifia|inmemoriam/i.test(l.u + l.t)).slice(0, 4);
    if (links.length) { R.avis.push({ personne: full, annee: yr2(p.deces.date), links }); console.log('[avis]', full, links.length + ' piste(s)'); }
    else console.log('[avis]', full, '0');
  } catch (e) { console.log('[avis]', full, 'ERREUR', e.message); }
  await sleep(2000);
}

// 4d) SUISSE (Desarzens — canton de Vaud, berceau Sarzens)
for (const [nm, u] of [
  ['vd-davel-desarzens', 'https://davel-vd.ch/results?query=DESARZENS'],
  ['hls-sarzens', 'https://hls-dhs-dss.ch/fr/search/?f_hls.lexicofacet_string=2%2F006800.006900.&q=Sarzens'],
  ['jina-davel', 'https://r.jina.ai/https://davel-vd.ch/results?query=DESARZENS']
]) {
  try { const r = await fetch(u, { headers: UA }); const t = await r.text(); fs.writeFileSync(path.join(rawDir, nm + '.html'), t.slice(0, 300000)); console.log('[suisse]', nm, r.status, t.length + 'o'); R.suisse.push(nm + ' : HTTP ' + r.status + ' (' + t.length + ' o)'); } catch (e) { R.suisse.push(nm + ' : ❌ ' + e.message); }
  await sleep(1200);
}

// ---- Rapport ----
const L = [];
L.push('# 📚 INFOS MAX — presse ancienne & sources ouvertes (toutes les familles)');
L.push('');
L.push('_Généré le ' + new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC par `tools/arbre/research-infos.mjs` (CI). Brut : `infosraw/`._');
L.push('');
L.push('## 🗞 Gallica (BnF) — presse & documents numérisés');
L.push('');
for (const tag in R.gallica) {
  const g = R.gallica[tag];
  if (g.error) { L.push('### ' + g.q + ' — ❌ ' + g.error); L.push(''); continue; }
  L.push('### ' + g.q + ' — ' + g.total + ' document(s)');
  for (const r of (g.recs || [])) L.push('- [' + (r.titre || 'document') + (r.date ? ' (' + r.date + ')' : '') + '](' + r.url + ')' + (r.type ? ' _' + r.type + '_' : ''));
  L.push('');
}
L.push('## 📖 archive.org — livres, annuaires, presse');
L.push('');
for (const tag in R.ia) {
  const g = R.ia[tag];
  if (g.error) { L.push('### ' + g.q + ' — ❌ ' + g.error); L.push(''); continue; }
  L.push('### ' + g.q + ' — ' + g.total + ' résultat(s)');
  for (const r of (g.recs || []).slice(0, 8)) L.push('- [' + r.titre + (r.year ? ' (' + r.year + ')' : '') + '](' + r.url + ')');
  L.push('');
}
L.push('## 🏛 Journal de Monaco (gazette officielle) — état des probes');
L.push('');
R.jdm.forEach(x => L.push('- ' + x));
L.push('');
L.push('## 🎖 Registres militaires (matricules / morts pour la France)');
L.push('');
(R.mil || []).forEach(x => L.push('- ' + x));
L.push('');
L.push('## 🪦 Tombes & photos (Findagrave)');
L.push('');
if ((R.graves || []).length) R.graves.forEach(g => L.push('- [' + g.nom + '](' + g.url + ')'));
else L.push('_Aucune tombe trouvée à ce run (voir infosraw/fg-*.html)._');
L.push('');
L.push('## 🕯 Avis de décès (photos possibles) — défunts récents, toutes familles');
L.push('');
if ((R.avis || []).length) { for (const a of R.avis) { L.push('### ' + a.personne + ' († ' + a.annee + ')'); a.links.forEach(l => L.push('- [' + (l.t || l.u).slice(0, 100) + '](' + l.u + ')')); L.push(''); } }
else L.push('_Aucune piste à ce run (voir infosraw/avis-*.html)._');
L.push('');
L.push('## 🇨🇭 Suisse (Desarzens — Vaud / Sarzens)');
L.push('');
(R.suisse || []).forEach(x => L.push('- ' + x));
L.push('');
fs.writeFileSync(path.join(outDir, 'INFOS.md'), L.join('\n') + '\n');
fs.writeFileSync(path.join(rawDir, 'infos.json'), JSON.stringify(R, null, 1));
console.log('INFOS.md écrit.');
