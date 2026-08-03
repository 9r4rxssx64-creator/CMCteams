/**
 * Recherche généalogique AUTONOME — famille de Kevin (arbre.kd-mc.com).
 *
 * Interroge l'API publique matchID (fichier officiel des décès INSEE, 1970→auj.)
 * pour CHAQUE nom de la famille : DESARZENS, MAIFFRET, SAUVAIGO, VAN DEN BOSCH,
 * MOLINARIO, DENTAU. Un acte de décès INSEE donne : nom, prénoms, sexe,
 * date+lieu de NAISSANCE, date+lieu de décès, âge → il sert autant à confirmer
 * les ascendants qu'à découvrir des parents proches (mêmes nom+lieu de naissance).
 *
 * Tourne en CI (réseau ouvert — l'egress de l'agent Claude est bloqué, leçon #135).
 * Sorties : arbre/research/raw/<id>.json (brut) + arbre/research/RAPPORT.md (lisible).
 * Les vivants ne figurent JAMAIS dans ce fichier (c'est un fichier de décès) —
 * les descendants vivants restent saisis par la famille dans l'app.
 */
import { mkdirSync, writeFileSync } from 'fs';

const API = 'https://deces.matchid.io/deces/api/v1/search';
const OUT = 'arbre/research';
mkdirSync(OUT + '/raw', { recursive: true });

/* Chaque requête = un angle de recherche (nom seul, nom+lieu, personne précise). */
const QUERIES = [
  { id: 'desarzens_tous',        note: 'DESARZENS — nom rare (vaudois) : TOUS les décès en France', p: { lastName: 'DESARZENS', size: 100 } },
  { id: 'desarzens_guy',         note: 'Guy DESARZENS — grand-père paternel présumé de Kevin', p: { lastName: 'DESARZENS', firstName: 'Guy', size: 30 } },
  { id: 'desarzens_emile',       note: 'Émile DESARZENS — oncle paternel', p: { lastName: 'DESARZENS', firstName: 'Emile', size: 30 } },
  { id: 'desarzens_salon',       note: 'DESARZENS nés à Salon-de-Provence (lieu de naissance de Gérard 1944)', p: { lastName: 'DESARZENS', birthCity: 'Salon-de-Provence', size: 50 } },
  { id: 'desarzens_dep13',       note: 'DESARZENS nés dans les Bouches-du-Rhône', p: { lastName: 'DESARZENS', birthDepartment: '13', size: 100 } },
  { id: 'sauvaigo_victor',       note: 'Victor SAUVAIGO — grand-père maternel', p: { lastName: 'SAUVAIGO', firstName: 'Victor', size: 30 } },
  { id: 'sauvaigo_monaco',       note: 'SAUVAIGO nés à Monaco', p: { lastName: 'SAUVAIGO', birthCity: 'Monaco', size: 100 } },
  { id: 'sauvaigo_nice',         note: 'SAUVAIGO nés à Nice (berceau niçois du nom)', p: { lastName: 'SAUVAIGO', birthCity: 'Nice', size: 100 } },
  { id: 'sauvaigo_beaulieu',     note: 'SAUVAIGO nés à Beaulieu-sur-Mer', p: { lastName: 'SAUVAIGO', birthCity: 'Beaulieu-sur-Mer', size: 50 } },
  { id: 'maiffret_mt_1911',      note: 'Marie-Thérèse MAIFFRET née 23.10.1911 — grand-mère maternelle', p: { lastName: 'MAIFFRET', birthDate: '23/10/1911', size: 20 } },
  { id: 'maiffret_beaulieu',     note: 'MAIFFRET nés à Beaulieu-sur-Mer (berceau du rameau)', p: { lastName: 'MAIFFRET', birthCity: 'Beaulieu-sur-Mer', size: 100 } },
  { id: 'maiffret_villefranche', note: 'MAIFFRET nés à Villefranche-sur-Mer (avant création de Beaulieu ~1891)', p: { lastName: 'MAIFFRET', birthCity: 'Villefranche-sur-Mer', size: 100 } },
  { id: 'maiffret_nice',         note: 'MAIFFRET nés à Nice', p: { lastName: 'MAIFFRET', birthCity: 'Nice', size: 100 } },
  { id: 'maiffret_monaco',       note: 'MAIFFRET nés à Monaco', p: { lastName: 'MAIFFRET', birthCity: 'Monaco', size: 50 } },
  { id: 'vandenbosch_beaulieu',  note: 'VAN DEN BOSCH nés à Beaulieu-sur-Mer (rameau de Léonie Maiffret)', p: { lastName: 'VAN DEN BOSCH', birthCity: 'Beaulieu-sur-Mer', size: 50 } },
  { id: 'molinario_nice',        note: 'MOLINARIO nés à Nice (piste mariage 1865)', p: { lastName: 'MOLINARIO', birthCity: 'Nice', size: 50 } },
  { id: 'dentau_tous',           note: 'DENTAU — nom rare (piste Marie-Marguerite, mariage 1865)', p: { lastName: 'DENTAU', size: 50 } },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fdate = (s) => { const m = String(s || '').match(/^(\d{4})(\d{2})(\d{2})$/); return m ? (m[3] + '/' + m[2] + '/' + m[1]) : (s || '?'); };
const floc = (l) => { if (!l) return '?'; const c = l.city || '?'; const d = l.departmentCode ? ' (' + l.departmentCode + ')' : (l.country && l.country !== 'France' ? ' (' + l.country + ')' : ''); return c + d; };

let md = '# 🔎 Recherche généalogique automatique — fichier des décès INSEE (matchID)\n\n' +
  'Générée le ' + new Date().toISOString().slice(0, 10) + ' par la CI (réseau ouvert). ' +
  'Chaque ligne = un ACTE DE DÉCÈS officiel : il confirme la date+lieu de NAISSANCE (utile pour les ascendants). ' +
  'Le fichier couvre les décès en France depuis 1970 — les personnes décédées avant 1970, à Monaco ou à l\'étranger n\'y figurent pas, et les VIVANTS n\'y figurent jamais.\n\n';

let totalHits = 0, okQ = 0;
for (const q of QUERIES) {
  const params = new URLSearchParams({ ...q.p, size: String(q.p.size || 50) });
  let js = null, err = '';
  for (let attempt = 0; attempt < 3 && !js; attempt++) {
    try {
      const r = await fetch(API + '?' + params, { headers: { 'User-Agent': 'arbre-familial-kdmc/1.0 (recherche familiale privee)' } });
      if (!r.ok) { err = 'HTTP ' + r.status; await sleep(2500); continue; }
      js = await r.json();
    } catch (e) { err = String(e && e.message || e); await sleep(2500); }
  }
  writeFileSync(OUT + '/raw/' + q.id + '.json', JSON.stringify(js || { error: err }, null, 1));
  const persons = (js && js.response && js.response.persons) || [];
  const total = (js && js.response && js.response.total) || 0;
  md += '## ' + q.id + ' — ' + q.note + '\n';
  if (!js) { md += '❌ échec requête : ' + err + '\n\n'; continue; }
  okQ++;
  md += (total ? '**' + total + ' résultat(s)**' : 'Aucun résultat') + (total > persons.length ? ' (affichés : ' + persons.length + ')' : '') + '\n\n';
  for (const per of persons.slice(0, 100)) {
    const nm = ((per.name && per.name.last) || '?') + ' ' + (((per.name && per.name.first) || []).join(' ') || '?');
    const sx = per.sex === 'M' ? '♂' : per.sex === 'F' ? '♀' : '';
    const b = per.birth || {}, d = per.death || {};
    md += '- **' + nm + '** ' + sx + ' · né(e) ' + fdate(b.date) + ' à ' + floc(b.location) + ' · † ' + fdate(d.date) + ' à ' + floc(d.location) + (d.age ? ' · ' + d.age + ' ans' : '') + '\n';
    totalHits++;
  }
  md += '\n';
  await sleep(1300); // politesse API
}
md += '---\n' + okQ + '/' + QUERIES.length + ' requêtes OK · ' + totalHits + ' actes listés.\n';
writeFileSync(OUT + '/RAPPORT.md', md);
console.log('OK — ' + okQ + '/' + QUERIES.length + ' requêtes, ' + totalHits + ' actes. Rapport: ' + OUT + '/RAPPORT.md');
if (okQ === 0) process.exit(1);
