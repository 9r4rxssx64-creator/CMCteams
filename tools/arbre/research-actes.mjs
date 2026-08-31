/**
 * ACTES OFFICIELS pour chaque personne décédée de l'arbre.
 *
 * Pour chaque défunt identifié à l'INSEE, retrouve son enregistrement EXACT
 * (matchID) et son identifiant → lien DIRECT vers l'acte de décès officiel
 * (https://deces.matchid.io/id/<id>). Vérifie la date de naissance pour ne
 * jamais lier le mauvais homonyme. Sortie : arbre/research/actes.json
 * (personId → url d'acte + champs vérifiés) — intégrée ensuite aux fiches.
 *
 * Tourne en CI (egress agent bloqué). Respecte l'API : 4s entre requêtes.
 */
import { mkdirSync, writeFileSync } from 'fs';

const API = 'https://deces.matchid.io/deces/api/v1/search';
mkdirSync('arbre/research', { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Défunts de l'arbre identifiés à l'INSEE : id de fiche → identité exacte.
   birthDate = JJ/MM/AAAA (clé de vérification anti-homonyme). */
const PERSONS = [
  { pid: 'seed_mt_maiffret',      lastName: 'MAIFFRET',      firstName: 'Marie',     birthDate: '23/10/1914' },
  { pid: 'seed_leonie',           lastName: 'MAIFFRET',      firstName: 'Leonie',    birthDate: '19/09/1895' },
  { pid: 'seed_marg_rose',        lastName: 'MAIFFRET',      firstName: 'Marguerite',birthDate: '06/03/1907' },
  { pid: 'seed_lucette_vdb',      lastName: 'VAN DEN BOSCH', firstName: 'Lucette',   birthDate: '12/02/1920' },
  { pid: 'seed_alex_vdb',         lastName: 'VAN DEN BOSCH', firstName: 'Alexandre', birthDate: '25/07/1921' },
  { pid: 'seed_francois_mc',      lastName: 'MAIFFRET',      firstName: 'Francois',  birthDate: '09/12/1912' },
  { pid: 'seed_myriam_mc',        lastName: 'MAIFFRET',      firstName: 'Myriam',    birthDate: '05/03/1935' },
  { pid: 'seed_jap_maiffret',     lastName: 'MAIFFRET',      firstName: 'Jean',      birthDate: '18/05/1925' },
  { pid: 'seed_victorj_maiffret', lastName: 'MAIFFRET',      firstName: 'Victor',    birthDate: '02/03/1914' },
  { pid: 'seed_alex1906_maiffret',lastName: 'MAIFFRET',      firstName: 'Alexandre', birthDate: '10/07/1906' },
  { pid: 'seed_claude_desarzens', lastName: 'DE SARZENS',    firstName: 'Claude',    birthDate: '19/03/1941' },
  { pid: 'seed_jmv_sauvaigo',     lastName: 'SAUVAIGO',      firstName: 'Jean',      birthDate: '12/07/1912' },
  { pid: 'seed_marie_joe',        lastName: 'SAUVAIGO',      firstName: 'Marie',     birthDate: '11/11/1943' },
  { pid: 'seed_michel_maiffret',  lastName: 'MAIFFRET',      firstName: 'Michel',    birthDate: '19/08/1937' },
  { pid: 'seed_leon_maiffret',    lastName: 'MAIFFRET',      firstName: 'Leon',      birthDate: '25/04/1910' },
  { pid: 'seed_josette_maiffret', lastName: 'MAIFFRET',      firstName: 'Josette',   birthDate: '31/01/1922' },
];

const toApi = (d) => d; // l'API accepte JJ/MM/AAAA
const toIso = (d) => { const m = d.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); return m ? (m[3] + m[2] + m[1]) : ''; };

const out = {}, report = [];
for (const q of PERSONS) {
  let js = null, err = '';
  for (let a = 0; a < 3 && !js; a++) {
    try {
      const params = new URLSearchParams({ lastName: q.lastName, firstName: q.firstName, birthDate: toApi(q.birthDate), fuzzy: 'false', size: '5' });
      const r = await fetch(API + '?' + params, { headers: { 'User-Agent': 'arbre-familial-kdmc/1.0 (actes famille)' } });
      if (!r.ok) { err = 'HTTP ' + r.status; await sleep(10000); continue; }
      js = await r.json();
    } catch (e) { err = String(e && e.message || e); await sleep(10000); }
  }
  const persons = (js && js.response && js.response.persons) || [];
  /* VÉRIFICATION anti-homonyme : la date de naissance de l'acte DOIT être exactement la nôtre */
  const hit = persons.find((p) => p.birth && p.birth.date === toIso(q.birthDate));
  if (hit && hit.id) {
    out[q.pid] = {
      acteUrl: 'https://deces.matchid.io/id/' + encodeURIComponent(hit.id),
      nom: (hit.name && hit.name.last) || '', prenoms: ((hit.name && hit.name.first) || []).join(' '),
      naissance: hit.birth.date, lieuNaissance: (hit.birth.location && hit.birth.location.city) || '',
      deces: (hit.death && hit.death.date) || '', lieuDeces: (hit.death && hit.death.location && hit.death.location.city) || '',
      certificateId: (hit.death && hit.death.certificateId) || ''
    };
    report.push('✅ ' + q.pid + ' → ' + out[q.pid].acteUrl + ' (' + out[q.pid].prenoms + ' ' + out[q.pid].nom + ')');
  } else {
    report.push('❌ ' + q.pid + ' : introuvable/date non vérifiée' + (err ? ' (' + err + ')' : '') + ' — ' + persons.length + ' candidat(s)');
  }
  await sleep(4000);
}
writeFileSync('arbre/research/actes.json', JSON.stringify(out, null, 1));
writeFileSync('arbre/research/ACTES.md', '# 📜 Actes de décès officiels — liens directs par personne\n\n' + report.join('\n') + '\n');
console.log(report.join('\n'));
console.log('OK — ' + Object.keys(out).length + '/' + PERSONS.length + ' actes liés.');
