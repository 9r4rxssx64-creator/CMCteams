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
fs.writeFileSync(path.join(outDir, 'INFOS.md'), L.join('\n') + '\n');
fs.writeFileSync(path.join(rawDir, 'infos.json'), JSON.stringify(R, null, 1));
console.log('INFOS.md écrit.');
