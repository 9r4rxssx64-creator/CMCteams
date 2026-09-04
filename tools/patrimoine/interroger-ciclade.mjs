#!/usr/bin/env node
/* ============================================================================
 * ⛔ CE SCRIPT NE DOIT PLUS TOURNER — ET VOICI POURQUOI, PAR ÉCRIT
 * ----------------------------------------------------------------------------
 * Kevin, 4.09.2026 : « tu as tout pour tout faire à ma place ». J'ai donc fait
 * chercher Ciclade par un vrai navigateur, sur le runner. La reconnaissance a
 * atteint le vrai formulaire (/monespace/#/je-lance-ma-recherche) et la capture
 * d'écran a montré, sous un CAPTCHA en image, cette phrase du site :
 *
 *   « Cette question sert à vérifier si vous êtes bien un visiteur humain. Pour
 *     rappel, conformément aux Conditions Générales d'Utilisation du site
 *     (art 1er), TOUTE UTILISATION NON HUMAINE DE CE SITE (y compris
 *     l'utilisation du CAPTCHA) EST INTERDITE, notamment pour des raisons de
 *     sécurité informatique. »
 *
 * Ce n'est pas une limite technique : c'est une règle du service. Le script
 * s'était arrêté de lui-même en voyant la protection (c'était le comportement
 * voulu) ; on va plus loin : il REFUSE désormais de s'exécuter, et il est
 * retiré du job d'intégration continue.
 *
 * CE QU'IL RESTE, ET QUI EST UTILE : la description exacte du formulaire,
 * relevée sur la vraie page. Elle sert à préparer la saisie de Kevin, champ par
 * champ, pour qu'il n'ait plus qu'à recopier — c'est tools/patrimoine/chercher.mjs
 * qui l'utilise. Faire À SA PLACE tout ce qui est permis, et pas un pas de plus.
 *
 * Les autres portes restent automatisées, elles : l'API publique des décès de
 * l'INSEE (open data, prévue pour ça) et la mesure de ce qui est public.
 * ========================================================================== */

console.log('\n⛔ Recherche Ciclade automatisée : ARRÊTÉE VOLONTAIREMENT.');
console.log('   Les CGU du site (art. 1er), affichées sous le CAPTCHA, interdisent');
console.log('   toute utilisation non humaine. La recherche se fait donc à la main :');
console.log('   patrimoine/00-A-FAIRE.md donne, pour chaque personne, les champs exacts.');
process.exit(0);

/* — Ce qui suit est conservé comme RELEVÉ du formulaire, plus comme programme.
     Champs mesurés le 4.09.2026 sur /monespace/#/je-lance-ma-recherche :
       recherche.estDecede-oui / -non ....... « Le titulaire est-il décédé ? » *
       recherche.civiliteListe-mme / -m ..... Civilité *
       nom .................................. Nom de naissance *
       nomJeuneFille ........................ Nom marital ou d'usage
       prenom ............................... Prénom *
       autrePrenom1 / 2 / 3 ................. Autres prénoms
       dateNaissance ........................ Date de naissance (JJ/MM/AAAA) *
       + Nationalité *, Commune de naissance, Pays de naissance,
         Dernière adresse connue, Code postal, Ville, Pays
       puis « 2 - Informations du compte » → « Vous ne disposez pas de numéro »
       puis le code de sécurité, puis « Valider ma recherche ».
   ————————————————————————————————————————————————————————————————————————— */

/*
/* Playwright est DÉJÀ dans l'image du runner : rien à installer. On le résout
   en CommonJS (createRequire) et non par un import ESM, parce que seul le
   premier honore NODE_PATH — c'est ce qui permet d'attraper le paquet installé
   globalement dans l'image. Un « npm ci » ici échouait (le dépôt n'a pas de
   package-lock.json) et le repli « npm i » cassait sur l'arbre de dépendances. *|
import { createRequire } from 'node:module';
const exiger = createRequire(import.meta.url);
const { chromium } = exiger('playwright');
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { personnesACherchers, RACINE } from './lire-arbre.mjs';

const SORTIE = join(RACINE, 'patrimoine-resultats');
const RECO = process.argv.includes('--reco');
const MAX = (() => { const i = process.argv.indexOf('--max'); return i > 0 ? +process.argv[i + 1] : 0; })();
const URL_CICLADE = 'https://ciclade.caissedesdepots.fr/';
/* Adresse RÉELLE du formulaire, relevée par la passe de reconnaissance du
   4.09 : c'est une application à étapes, pas la page d'accueil. *|
const URL_FORMULAIRE = 'https://ciclade.caissedesdepots.fr/monespace/#/je-lance-ma-recherche';
const PAUSE_MS = 6000;

mkdirSync(SORTIE, { recursive: true });
const journal = [];
const dire = (m) => { console.log(m); journal.push(m); };

/* --- repérage : à quoi ressemble la page ? --------------------------------- *|

async function decrirePage(page, nom) {
  await page.screenshot({ path: join(SORTIE, `${nom}.png`), fullPage: true }).catch(() => {});
  const desc = await page.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const champs = [...document.querySelectorAll('input,select,textarea')].filter(vis).map((e) => ({
      type: e.type || e.tagName.toLowerCase(),
      name: e.name || '', id: e.id || '',
      placeholder: e.placeholder || '',
      label: (e.labels && e.labels[0] ? e.labels[0].innerText.trim().slice(0, 60) : ''),
      aria: e.getAttribute('aria-label') || '',
    }));
    const boutons = [...document.querySelectorAll('button,a[role=button],input[type=submit]')]
      .filter(vis).map((e) => (e.innerText || e.value || '').trim()).filter(Boolean).slice(0, 25);
    const captcha = !!document.querySelector('iframe[src*="recaptcha"],iframe[src*="hcaptcha"],.g-recaptcha,#captcha')
      || /je ne suis pas un robot|captcha/i.test(document.body.innerText);
    return { titre: document.title, champs, boutons, captcha, texte: document.body.innerText.slice(0, 1500) };
  });
  return desc;
}

/* --- une recherche ---------------------------------------------------------*|

/* La page d'accueil ne contient QUE le moteur de recherche du site (mesuré :
   2 champs, « Rechercher dans le site »). Le vrai formulaire est derrière le
   menu « Lancer ma recherche ». On y va d'abord, sinon on remplit le mauvais
   formulaire — c'est ce qui s'est passé au premier essai. *|
async function ouvrirFormulaire(page) {
  await page.goto(URL_FORMULAIRE, { waitUntil: 'domcontentloaded', timeout: 45000 });
  const cookies = page.getByRole('button', { name: /tout accepter|j'accepte|accepter/i }).first();
  if (await cookies.count().catch(() => 0)) await cookies.click().catch(() => {});
  await page.waitForSelector('#nom', { timeout: 30000 }).catch(() => {});
  return page.url();
}

async function chercherUne(page, p, i) {
  const etiquette = `${p.prenom} ${p.nom}`;
  const res = { personne: etiquette, naissance: p.naissance.fr, deces: p.deces?.fr || null, statut: 'inconnu', texte: '' };
  try {
    await ouvrirFormulaire(page);
    /* Identifiants relevés sur la vraie page (passe de reconnaissance) :
       nom · prenom · autrePrenom1-3 · dateNaissance · recherche.estDecede-oui/non
       · recherche.civiliteListe-m/mme. On vise ces identifiants plutôt que des
       libellés, parce qu'ils sont sans ambiguïté ; le repli par libellé reste
       en dessous si la page est refondue. *|
    const par = (sel) => page.locator(sel).first();
    const poser = async (sel, valeur) => {
      const c = par(sel);
      if (!(await c.count().catch(() => 0))) return false;
      await c.fill(valeur).catch(() => {});
      return true;
    };
    /* la personne est-elle décédée ? le formulaire le demande en premier *|
    const oui = par('[id="recherche.estDecede-oui"]');
    const non = par('[id="recherche.estDecede-non"]');
    const bouton_dec = p.decede ? oui : non;
    if (await bouton_dec.count().catch(() => 0)) await bouton_dec.check({ force: true }).catch(() => {});
    /* civilité, quand l'arbre la connaît *|
    if (p.sexe === 'F' || p.sexe === 'M') {
      const civ = par(p.sexe === 'F' ? '[id="recherche.civiliteListe-mme"]' : '[id="recherche.civiliteListe-m"]');
      if (await civ.count().catch(() => 0)) await civ.check({ force: true }).catch(() => {});
    }
    const prenoms = p.prenom.split(/\s+/);
    const okNom = await poser('#nom', p.nom);
    const okPrenom = await poser('#prenom', prenoms[0]);
    if (prenoms[1]) await poser('#autrePrenom1', prenoms[1]);
    if (prenoms[2]) await poser('#autrePrenom2', prenoms[2]);
    const okDate = await poser('#dateNaissance', p.naissance.fr);
    if (!okNom || !okPrenom || !okDate) {
      res.statut = 'formulaire-non-reconnu';
      await decrirePage(page, `echec-${i}`);
      return res;
    }
    const bouton = page.getByRole('button', { name: /rechercher|lancer ma recherche|valider|suivant|étape suivante/i }).first();
    if (await bouton.count().catch(() => 0)) await bouton.click();
    else await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    const t = await page.evaluate(() => document.body.innerText).catch(() => '');
    res.texte = t.slice(0, 800);
    if (/captcha|je ne suis pas un robot/i.test(t)) res.statut = 'captcha';
    else if (/aucun r[ée]sultat|aucune somme|n'avons trouv[ée]|pas de r[ée]sultat/i.test(t)) res.statut = 'rien';
    else if (/r[ée]sultat|somme|correspond/i.test(t)) res.statut = '⚠️ PEUT-ÊTRE QUELQUE CHOSE';
    else res.statut = 'réponse-non-comprise';
    await page.screenshot({ path: join(SORTIE, `${String(i).padStart(2, '0')}-${p.nom}-${p.prenom}.png`.replace(/[^\w.\-]/g, '_')), fullPage: true }).catch(() => {});
  } catch (e) {
    res.statut = 'erreur';
    res.texte = String(e.message).slice(0, 200);
  }
  return res;
}

/* --- déroulé --------------------------------------------------------------- *|

const gens = personnesACherchers();
dire(`Personnes retenues dans l'arbre : ${gens.length}`);

const nav = await chromium.launch();
const page = await nav.newPage({ locale: 'fr-FR' });
let resultats = [];

try {
  await page.goto(URL_CICLADE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const accueil = await decrirePage(page, '00-accueil');
  writeFileSync(join(SORTIE, '00-accueil.json'), JSON.stringify(accueil, null, 2));
  dire(`Accueil : « ${accueil.titre} » — ${accueil.champs.length} champ(s)`);

  /* on ouvre le VRAI formulaire et on le décrit AVANT d'essayer quoi que ce
     soit : au premier essai j'ai rempli le moteur de recherche du site. *|
  const urlForm = await ouvrirFormulaire(page);
  const form = await decrirePage(page, '01-formulaire');
  writeFileSync(join(SORTIE, '01-formulaire.json'), JSON.stringify({ url: urlForm, ...form }, null, 2));
  dire(`Formulaire : ${urlForm}`);
  dire(`  titre : « ${form.titre} » · ${form.champs.length} champ(s)`);
  form.champs.slice(0, 12).forEach((c) => dire(`    · ${c.type} name=${c.name} id=${c.id} label=${c.label} aria=${c.aria} ph=${c.placeholder}`));
  dire(`  boutons : ${form.boutons.slice(0, 12).join(' | ')}`);
  dire(`  extrait : ${form.texte.replace(/\s+/g, ' ').slice(0, 400)}`);

  if (accueil.captcha || form.captcha) {
    dire('⛔ Une protection anti-robot est présente sur la page.');
    dire('   On S\'ARRÊTE : on ne contourne pas une protection. Les recherches restent à faire à la main.');
  } else if (RECO) {
    dire('Mode reconnaissance : rien n\'a été interrogé, seulement observé.');
  } else {
    const liste = MAX ? gens.slice(0, MAX) : gens;
    for (let i = 0; i < liste.length; i++) {
      const r = await chercherUne(page, liste[i], i + 1);
      resultats.push(r);
      dire(`  ${String(i + 1).padStart(2)}/${liste.length}  ${r.personne.padEnd(34)} ${r.statut}`);
      if (r.statut === 'captcha') { dire('⛔ captcha rencontré → arrêt immédiat, sans le contourner.'); break; }
      if (i < liste.length - 1) await page.waitForTimeout(PAUSE_MS);
    }
  }
} finally {
  await nav.close();
}

writeFileSync(join(SORTIE, 'resultats.json'), JSON.stringify({ quand: new Date().toISOString(), resultats }, null, 2));

let md = `# Ciclade — recherches faites automatiquement\n\n`;
md += `Le ${new Date().toLocaleString('fr-FR')} · ${resultats.length} recherche(s)\n\n`;
md += journal.map((l) => `    ${l}`).join('\n') + '\n\n';
if (resultats.length) {
  md += `| Personne | Né(e) le | Décès | Résultat |\n|---|---|---|---|\n`;
  for (const r of resultats) md += `| ${r.personne} | ${r.naissance} | ${r.deces || '—'} | ${r.statut} |\n`;
  const touches = resultats.filter((r) => r.statut.includes('PEUT-ÊTRE'));
  md += `\n**${touches.length} piste(s) à regarder de près.**\n`;
}
md += `\n*La recherche est publique et gratuite ; toucher l'argent exige un compte et\n`;
md += `une preuve de droits — ça, personne ne peut le faire à la place de Kevin.*\n`;
writeFileSync(join(SORTIE, 'rapport.md'), md);
dire(`\nÉcrit : patrimoine-resultats/rapport.md`);

*/
