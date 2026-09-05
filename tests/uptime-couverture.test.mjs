#!/usr/bin/env node
/**
 * Garde : la surveillance couvre TOUS les sous-domaines du routeur.
 *
 * POURQUOI ELLE EXISTE
 * --------------------
 * Audit du 05/09/2026 : le routeur déclarait 26 sous-domaines, la sonde n'en
 * contrôlait que 13. Les 13 oubliés étaient les plus récents — dont l'arbre
 * généalogique (111 pages) et le portail boutiques (22 pages). Personne ne
 * l'avait vu, parce que rien ne le disait : on ajoutait une app au routeur et
 * la liste de surveillance restait derrière, en silence.
 *
 * C'est le même piège que la leçon #142 : deux listes qui décrivent la même
 * réalité et qu'aucune garde ne compare finissent TOUJOURS par diverger.
 * Un test d'égalité sur le contenu, pas seulement sur la forme.
 *
 * Câblé dans `npm run test:ci` et dans deploy-kdmc-uptime.yml (avant déploiement).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ROUTER = join(ROOT, 'services/kdmc-router/worker.js');
const UPTIME = join(ROOT, 'services/kdmc-uptime/worker.js');

let ok = 0;
let fail = 0;
const OK = (m) => { ok++; console.log('  OK   ' + m); };
const FAIL = (m) => { fail++; console.log('  FAIL ' + m); };

/** Hôtes déclarés dans la table ROUTES du routeur. */
function hostsDuRouteur() {
  const src = readFileSync(ROUTER, 'utf8');
  const bloc = src.match(/const ROUTES = \{([\s\S]*?)\n\};/);
  if (!bloc) throw new Error("table ROUTES introuvable dans " + ROUTER);
  // (?:sous-domaine\.)* → capture aussi le domaine NU « kd-mc.com ».
  // Une première version exigeait un préfixe et comptait 25 au lieu de 26 :
  // un parseur qui rate une entrée fait passer la garde au vert pour rien.
  return [...bloc[1].matchAll(/'((?:[a-z0-9-]+\.)*kd-mc\.com)'\s*:/g)].map((m) => m[1]);
}

/** Hôtes surveillés par kdmc-uptime. */
function hostsDeLaSonde() {
  const src = readFileSync(UPTIME, 'utf8');
  const bloc = src.match(/const SITES = \[([\s\S]*?)\n\];/);
  if (!bloc) throw new Error("liste SITES introuvable dans " + UPTIME);
  return [...bloc[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

console.log('Couverture de la surveillance — routeur ⇄ sonde\n');

const routeur = hostsDuRouteur();
const sonde = hostsDeLaSonde();

if (routeur.length >= 20) OK(`le routeur déclare ${routeur.length} sous-domaines`);
else FAIL(`seulement ${routeur.length} sous-domaines lus dans ROUTES — le parseur a probablement cassé, ne pas ignorer`);

if (sonde.length >= 20) OK(`la sonde en surveille ${sonde.length}`);
else FAIL(`seulement ${sonde.length} entrées lues dans SITES — parseur cassé ?`);

const setSonde = new Set(sonde);
const oublies = routeur.filter((h) => !setSonde.has(h));
if (!oublies.length) {
  OK('aucun sous-domaine du routeur n’est absent de la surveillance');
} else {
  FAIL(
    `${oublies.length} sous-domaine(s) routé(s) mais PAS surveillé(s) :\n         ` +
      oublies.join('\n         ') +
      "\n         → ajoute-les à SITES dans services/kdmc-uptime/worker.js",
  );
}

const setRouteur = new Set(routeur);
const fantomes = sonde.filter((h) => !setRouteur.has(h));
if (!fantomes.length) {
  OK('aucune adresse surveillée qui n’existe plus dans le routeur');
} else {
  FAIL(
    `${fantomes.length} adresse(s) surveillée(s) sans route correspondante :\n         ` +
      fantomes.join('\n         ') +
      "\n         → une sonde qui interroge une adresse supprimée crée une fausse panne permanente",
  );
}

const doublons = sonde.filter((h, i) => sonde.indexOf(h) !== i);
if (!doublons.length) OK('aucun doublon dans la liste surveillée');
else FAIL('doublons : ' + [...new Set(doublons)].join(', '));

console.log(`\n=== ${ok} OK / ${fail} FAIL ===`);
process.exit(fail ? 1 : 0);
