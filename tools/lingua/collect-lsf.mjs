#!/usr/bin/env node
/* 🤟 RÉCOLTE DE LA VRAIE LANGUE DES SIGNES FRANÇAISE (LSF) — Kevin 2026-08-13
   « Intègre la vrai langue des signes. Enrichit +++. Va plus loin »

   LE POINT DUR : un signe INVENTÉ est pire que pas de signe. Une personne sourde le verrait
   tout de suite, et l'élève apprendrait un geste qui ne veut rien dire. Or je ne connais pas
   la LSF : je ne peux donc RIEN écrire de moi-même. Tout doit venir d'une source réelle.

   D'OÙ VIENT LE CONTENU : Wikimedia Commons — la médiathèque libre. Des vidéos et photos de
   signes LSF y sont publiées sous licence libre (CC BY-SA, CC BY, CC0, domaine public), avec
   leur auteur. On garde UNIQUEMENT ce qui porte une licence libre, on cite l'auteur et la
   licence, et on renvoie vers la page d'origine. Les dictionnaires édités (Elix, Sématos,
   Spread the Sign) sont sous droits : on y RENVOIE, on ne recopie rien.

   POURQUOI EN CI : depuis l'agent, internet est fermé (403). Ce script tourne donc dans
   l'ouvrage GitHub (réseau ouvert), qui écrit le résultat dans le dépôt.

     node tools/lingua/collect-lsf.mjs --rapport   → dit seulement ce qui EXISTE (n'écrit rien)
     node tools/lingua/collect-lsf.mjs             → écrit lingua/lsf-sources.json
*/
import fs from 'fs';
import path from 'path';

const RACINE = path.resolve(new URL('../../', import.meta.url).pathname);
const SORTIE = path.join(RACINE, 'lingua', 'lsf-sources.json');
const RAPPORT_SEUL = process.argv.includes('--rapport');
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'KDMC-Lingua/1.0 (https://lingua.kd-mc.com ; apprentissage des langues)';

/* Licences acceptées : uniquement celles qui autorisent la réutilisation avec attribution.
   Tout le reste est écarté — mieux vaut moins de signes que du contenu qu'on n'a pas le droit
   de montrer. */
const LIBRES = /^(cc0|cc[- ]by([- ]sa)?([- ]\d(\.\d)?)?|public domain|pd-|gfdl)/i;

async function api(params) {
  const url = API + '?' + new URLSearchParams({ format: 'json', origin: '*', ...params });
  for (let essai = 0; essai < 3; essai++) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': UA } });
      if (r.ok) return await r.json();
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 800 * (essai + 1)));
  }
  return null;
}

/* Les catégories candidates. On ne suppose pas qu'elles existent : on demande, et on dit
   lesquelles répondent. Une catégorie vide n'est pas un échec, c'est une information. */
const CATEGORIES = [
  'Category:French Sign Language',
  'Category:Videos of French Sign Language',
  'Category:French Sign Language alphabet',
  'Category:Fingerspelling in French Sign Language',
  'Category:French Sign Language signs',
  'Category:Langue des signes française',
  'Category:LSF',
];

async function membres(cat, type) {
  const out = []; let cont = null;
  do {
    const j = await api({ action: 'query', list: 'categorymembers', cmtitle: cat, cmtype: type,
      cmlimit: '500', ...(cont ? { cmcontinue: cont } : {}) });
    if (!j || !j.query) return out;
    (j.query.categorymembers || []).forEach((m) => out.push(m.title));
    cont = j.continue && j.continue.cmcontinue;
  } while (cont);
  return out;
}

/* On descend d'un niveau dans les sous-catégories : les signes sont souvent rangés par lettre
   ou par thème. On ne descend pas plus loin (risque de partir dans tout Commons). */
async function fichiersDe(cat, profondeur = 1) {
  let fichiers = await membres(cat, 'file');
  if (profondeur > 0) {
    const sous = await membres(cat, 'subcat');
    for (const sc of sous.slice(0, 60)) fichiers = fichiers.concat(await fichiersDe(sc, profondeur - 1));
  }
  return fichiers;
}

/* Le mot français que le fichier illustre. On n'extrait QUE si c'est net : un titre ambigu
   est écarté (on ne devine pas un signe). */
function motDuTitre(titre) {
  let t = titre.replace(/^File:/, '').replace(/\.(webm|ogv|mp4|gif|jpe?g|png|svg)$/i, '');
  t = t.replace(/[_]+/g, ' ').trim();
  const essais = [
    /^LSF\s*[-–—:]\s*(.+)$/i,                        // « LSF - bonjour »
    /^(.+?)\s+en\s+LSF$/i,                            // « bonjour en LSF »
    /^(.+?)\s*[-–—]\s*langue des signes fran[cç]aise$/i,
    /^Langue des signes fran[cç]aise\s*[-–—:]\s*(.+)$/i,
    /^French Sign Language\s*[-–—:]\s*(.+)$/i,
    /^(.+?)\s*\(LSF\)$/i,
  ];
  for (const re of essais) { const m = t.match(re); if (m) t = m[1].trim(); }
  t = t.replace(/^\d+\s*[-–—.]\s*/, '').replace(/\s*\(.*\)$/, '').trim();
  /* un mot ou une expression courte, en lettres — sinon on ne sait pas ce que c'est */
  if (!/^[A-Za-zÀ-ÿ' -]{2,40}$/.test(t)) return null;
  if (/^(video|file|image|photo|sign|signe|test)$/i.test(t)) return null;
  return t.toLowerCase();
}

/* La lettre de l'alphabet dactylologique, quand le fichier en illustre une. */
function lettreDuTitre(titre) {
  const t = titre.replace(/^File:/, '').replace(/_/g, ' ');
  const m = t.match(/(?:lettre|letter|alphabet|dactylolog\w*)[^A-Za-z]{0,6}([A-Za-z])\b/i)
        || t.match(/\bLSF\s+([A-Za-z])\b/i);
  return m ? m[1].toUpperCase() : null;
}

async function infos(titres) {
  const out = new Map();
  for (let i = 0; i < titres.length; i += 40) {
    const lot = titres.slice(i, i + 40);
    const j = await api({ action: 'query', titles: lot.join('|'), prop: 'imageinfo',
      iiprop: 'url|extmetadata|mime', iiurlwidth: '480' });
    if (!j || !j.query) continue;
    Object.values(j.query.pages || {}).forEach((p) => {
      const ii = p.imageinfo && p.imageinfo[0]; if (!ii) return;
      const em = ii.extmetadata || {};
      out.set(p.title, {
        url: ii.url,
        vignette: ii.thumburl || null,
        page: ii.descriptionurl,
        mime: ii.mime || '',
        licence: (em.LicenseShortName && em.LicenseShortName.value) || '',
        auteur: ((em.Artist && em.Artist.value) || '').replace(/<[^>]*>/g, '').trim().slice(0, 120),
      });
    });
  }
  return out;
}

(async () => {
  console.log('🤟 Récolte de la LSF sur Wikimedia Commons (sources libres uniquement)\n');
  /* On vérifie d'abord qu'on peut vraiment atteindre Commons. Sans ça, le script mouline
     sept fois dans le vide puis annonce « 0 signe » — ce qui se lit comme « il n'existe rien »
     alors que la vérité est « je n'ai rien pu regarder ». Ne rien vérifier n'est pas vérifier. */
  const ping = await api({ action: 'query', meta: 'siteinfo' });
  if (!ping) {
    console.log('❌ Wikimedia Commons est injoignable depuis ici (internet fermé côté agent).');
    console.log('   Rien n\'a été regardé — ce n\'est PAS « aucun signe n\'existe ».');
    console.log('   Lance l\'ouvrage « Lingua 🤟 — Récolter la vraie langue des signes (LSF) », qui a le réseau.');
    process.exit(1);
  }
  const vus = new Set(); const parCat = [];
  for (const cat of CATEGORIES) {
    const f = await fichiersDe(cat);
    parCat.push({ cat, n: f.length });
    console.log((f.length ? '✅ ' : '·  ') + cat + ' → ' + f.length + ' fichier(s)');
    f.forEach((t) => vus.add(t));
  }
  /* Une recherche en plus : certains fichiers ne sont dans aucune de ces catégories. */
  const rech = await api({ action: 'query', list: 'search', srnamespace: '6',
    srsearch: 'langue des signes française OR "French Sign Language" OR LSF', srlimit: '200' });
  const nRech = rech && rech.query ? (rech.query.search || []).length : 0;
  console.log('🔎 recherche libre → ' + nRech + ' fichier(s)');
  if (rech && rech.query) (rech.query.search || []).forEach((s) => vus.add(s.title));

  console.log('\n' + vus.size + ' fichier(s) distincts à examiner…');
  const meta = await infos([...vus]);

  const signes = {}; const alphabet = {}; let ecartesLicence = 0, ecartesTitre = 0;
  for (const [titre, m] of meta) {
    if (!m.licence || !LIBRES.test(m.licence.trim())) { ecartesLicence++; continue; }
    const lettre = lettreDuTitre(titre);
    const type = /^video\//.test(m.mime) ? 'video' : /^image\//.test(m.mime) ? 'image' : null;
    if (!type) continue;
    if (lettre && /alphabet|dactylolog|fingerspell|lettre|letter/i.test(titre)) {
      if (!alphabet[lettre] || (type === 'image' && alphabet[lettre].type === 'video'))
        alphabet[lettre] = { lettre, type, url: m.url, vignette: m.vignette, page: m.page, licence: m.licence, auteur: m.auteur, titre };
      continue;
    }
    const mot = motDuTitre(titre);
    if (!mot) { ecartesTitre++; continue; }
    /* une seule entrée par mot : on préfère la vidéo (un signe est un mouvement) */
    if (!signes[mot] || (type === 'video' && signes[mot].type === 'image'))
      signes[mot] = { mot, type, url: m.url, vignette: m.vignette, page: m.page, licence: m.licence, auteur: m.auteur, titre };
  }

  const res = {
    langue: 'LSF — langue des signes française',
    recolte_le: new Date().toISOString().slice(0, 10),
    d_ou: 'Wikimedia Commons, licences libres uniquement (CC0 / CC BY / CC BY-SA / domaine public)',
    regle: 'Aucun signe inventé : chaque entrée porte son fichier d\'origine, son auteur et sa licence.',
    categories: parCat,
    alphabet, signes,
  };
  console.log('\n📊 Résultat : ' + Object.keys(alphabet).length + ' lettre(s) d\'alphabet · '
    + Object.keys(signes).length + ' signe(s) attesté(s)');
  console.log('   écartés : ' + ecartesLicence + ' (licence non libre) · ' + ecartesTitre + ' (titre trop ambigu pour savoir quel mot c\'est)');
  const exemples = Object.keys(signes).slice(0, 12);
  if (exemples.length) console.log('   exemples : ' + exemples.join(', '));
  if (Object.keys(alphabet).length) console.log('   lettres  : ' + Object.keys(alphabet).sort().join(' '));

  if (RAPPORT_SEUL) { console.log('\n(mode rapport : rien n\'a été écrit)'); return; }
  fs.writeFileSync(SORTIE, JSON.stringify(res, null, 1), 'utf8');
  console.log('\n💾 écrit : lingua/lsf-sources.json');
})();
