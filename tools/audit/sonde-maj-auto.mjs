#!/usr/bin/env node
/* ============================================================================
 * SONDE — « la mise à jour automatique peut-elle marcher, à CHAQUE adresse ? »
 * ----------------------------------------------------------------------------
 * Kevin 2026-09-19 : « Vérifie les MAJ auto pour tout le monde. Certains sont
 * encore en 1.39. Pourquoi ? »
 *
 * La page light se met à jour toute seule en comparant sa version à celle
 * annoncée par `version.txt`. Ce mécanisme est SILENCIEUX quand il échoue :
 *   fetch("version.txt") → si la réponse n'est pas « v1.48 » exactement,
 *   le code fait `return` sans rien dire. Aucune erreur, aucun message.
 * Et Cloudflare Pages, sans 404.html, répond à une adresse inconnue par la
 * PAGE D'ACCUEIL avec un code 200 → `version.txt` peut « répondre 200 » tout
 * en rendant du HTML. L'appareil reste alors sur sa vieille version POUR
 * TOUJOURS, sans que personne ne le voie.
 *
 * Cette sonde ouvre CHAQUE adresse qui sert l'app ou la page, lit la version
 * réellement servie, lit `version.txt`, et refuse de dire que tout va bien si
 * l'un des deux ne correspond pas.
 *
 * Usage : node tools/audit/sonde-maj-auto.mjs [--attendu v1.48]
 * ========================================================================== */

const iAtt = process.argv.indexOf('--attendu');
const ATTENDU = iAtt >= 0 ? process.argv[iAtt + 1] : null;

/* Chaque adresse et ce qu'elle sert. Les adresses viennent de la table ROUTES
   du routeur (voir sonde-site-publie.mjs) ; ici on ne garde que celles qui
   servent l'app CMCteams ou la page Départs — les seules qui ont une version. */
const CIBLES = [
  { hote: 'departs.kd-mc.com', quoi: 'page Départs', type: 'light' },
  { hote: 'cmcteams-light.kd-mc.com', quoi: 'page Départs (autre nom)', type: 'light' },
  { hote: 'cmcteams.kd-mc.com', quoi: 'app CMCteams', type: 'app' },
  { hote: 'rotaplan.kd-mc.com', quoi: 'app CMCteams (autre nom)', type: 'app' },
  { hote: 'kit.kd-mc.com', quoi: 'app CMCteams (autre nom)', type: 'app' },
  { hote: 'croupier.kd-mc.com', quoi: 'app CMCteams (autre nom)', type: 'app' },
  { hote: 'dossiers.kd-mc.com', quoi: 'app CMCteams (autre nom)', type: 'app' },
];
/* La page Départs vit aussi DANS l'app : c'est le chemin qu'ouvre le bouton
   « Départs » de CMCteams. Il a sa propre version.txt, à vérifier aussi. */
const SOUS = [
  { hote: 'cmcteams.kd-mc.com', chemin: '/tools/departs/', quoi: 'page Départs (depuis l\'app)', type: 'light' },
];

const TEMPS = 25000;
const lire = async (url) => {
  try {
    const r = await fetch(url, {
      redirect: 'follow',
      headers: { 'cache-control': 'no-cache', 'user-agent': 'kdmc-sonde-maj/1' },
      signal: AbortSignal.timeout(TEMPS),
    });
    return { ok: true, http: r.status, txt: await r.text() };
  } catch (e) { return { ok: false, http: 0, err: String(e.message).slice(0, 48), txt: '' }; }
};
const versionDe = (t) => (t.match(/var\s+APP_VER\s*=\s*"(v[0-9.]+)"/) || [])[1] || null;

async function sonder(c) {
  const base = 'https://' + c.hote + (c.chemin || '/');
  const page = await lire(base);
  const ver = versionDe(page.txt);
  /* version.txt : on exige le CONTENU d'un numéro de version, pas un code 200.
     Une page HTML servie en repli répond 200 et casserait la mise à jour. */
  let txt = null, brut = '';
  if (c.type === 'light') {
    const v = await lire(base + 'version.txt?_v=' + Date.now());
    brut = (v.txt || '').trim().slice(0, 40);
    txt = /^v[\d.]+$/.test(brut) ? brut : null;
  }
  return { ...c, base, http: page.http, ver, txt, brut, err: page.err };
}

const res = [];
for (let i = 0; i < CIBLES.concat(SOUS).length; i += 4) {
  res.push(...await Promise.all(CIBLES.concat(SOUS).slice(i, i + 4).map(sonder)));
}

console.log('\nadresse                          sert        version.txt   verdict');
console.log('──────────────────────────────────────────────────────────────────────');
const pb = [];
for (const r of res) {
  let verdict = '✅ à jour, MAJ auto possible';
  if (!r.ver) { verdict = `❌ version illisible (HTTP ${r.http}${r.err ? ' ' + r.err : ''})`; pb.push(r); }
  else if (r.type === 'light' && !r.txt) { verdict = `❌ version.txt ne rend PAS un numéro → MAJ auto MORTE (reçu : « ${r.brut.replace(/\s+/g, ' ').slice(0, 24)}… »)`; pb.push(r); }
  else if (r.type === 'light' && r.txt !== r.ver) { verdict = `❌ la page dit ${r.ver}, version.txt dit ${r.txt} → boucle ou blocage`; pb.push(r); }
  else if (ATTENDU && r.ver !== ATTENDU) { verdict = `❌ sert ${r.ver} au lieu de ${ATTENDU} (déploiement en retard)`; pb.push(r); }
  console.log(`${(r.hote + (r.chemin || '')).padEnd(32)} ${String(r.ver || '—').padEnd(11)} ${String(r.txt || (r.type === 'app' ? '(sans objet)' : '—')).padEnd(13)} ${verdict}`);
}

if (res.every((r) => r.http === 0)) {
  console.error('\n❌ MESURE IMPOSSIBLE : aucune adresse n\'a répondu. Je ne conclus rien.');
  process.exit(2);
}
console.log(`\n=== ${pb.length} adresse(s) en défaut sur ${res.length} ===`);
if (pb.length) {
  console.log('\nUne adresse en défaut = les gens qui passent PAR ELLE ne recevront jamais');
  console.log('les mises à jour, sans aucun message d\'erreur.');
  process.exit(1);
}
console.log('Toutes les adresses servent la même version et peuvent se mettre à jour seules. ✅');
