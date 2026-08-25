/*
 * Le relais de lecture du dépôt fait-il vraiment ce qu'il promet ?
 *
 * POURQUOI CE TEST EXISTE
 * -----------------------
 * Ce relais portera le jeton GitHub passe-partout de Kevin — celui qui donne
 * accès à TOUS ses dépôts, pas seulement CMCteams. Le déployer sans l'avoir
 * exercé serait exactement l'erreur « c'est écrit donc ça marche ».
 *
 * Deux trous ont été trouvés à la relecture, avant tout déploiement :
 *   1. une requête sans en-tête d'origine passait (porte ouverte) ;
 *   2. un chemin contenant « .. » sortait du dépôt autorisé et permettait de
 *      lire un AUTRE dépôt privé, avec le jeton.
 * Ces tests les figent : si quelqu'un rouvre l'un des deux, ça devient rouge.
 *
 * Lancement : node tools/tests/test-github-proxy-worker.mjs
 */

import worker from '../github-proxy-worker.js';

const ORIGINE_OK = 'https://kd-mc.com';
let echecs = 0;

/* On remplace l'appel réseau : on ne veut PAS appeler GitHub, on veut savoir
   quelle adresse le relais aurait appelée. */
let derniereUrl = '';
globalThis.fetch = async (url) => {
  derniereUrl = String(url);
  return new Response('contenu factice', { status: 200, headers: { 'Content-Type': 'text/plain' } });
};

const env = { GITHUB_PAT: 'jeton-factice' };

async function appeler(params, origine) {
  derniereUrl = '';
  const url = 'https://relais.exemple.workers.dev?' + new URLSearchParams(params);
  const entetes = origine ? { Origin: origine } : {};
  return worker.fetch(new Request(url, { headers: entetes }), env);
}

function verifier(nom, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${nom}`);
  } else {
    console.log(`  ❌ ${nom}${detail ? ' — ' + detail : ''}`);
    echecs++;
  }
}

console.log('\n1. Qui a le droit de lire ?');
{
  const r = await appeler({ action: 'read', path: 'CLAUDE.md' }, ORIGINE_OK);
  verifier('une page de kd-mc.com est servie', r.status === 200, `reçu ${r.status}`);
}
{
  const r = await appeler({ action: 'read', path: 'CLAUDE.md' }, 'https://site-pirate.example');
  verifier('une page inconnue est refusée', r.status === 403, `reçu ${r.status}`);
}
{
  /* Le cas qui était grand ouvert : pas d'en-tête d'origine du tout. */
  const r = await appeler({ action: 'read', path: 'CLAUDE.md' }, null);
  verifier('une requête SANS origine est refusée', r.status === 403, `reçu ${r.status}`);
}

console.log('\n2. Peut-on sortir du dépôt autorisé ?');
{
  const r = await appeler(
    { action: 'read', path: '../../autre-depot/main/secret.txt' },
    ORIGINE_OK,
  );
  verifier('un chemin avec « .. » est refusé', r.status === 400, `reçu ${r.status}`);
  verifier('…et aucun appel n’est parti vers GitHub', derniereUrl === '');
}
{
  const r = await appeler({ action: 'read', path: 'x', branch: '../../autre' }, ORIGINE_OK);
  verifier('une branche avec « .. » est refusée', r.status === 400, `reçu ${r.status}`);
}

console.log('\n3. Les lectures légitimes marchent-elles encore ?');
for (const chemin of ['CLAUDE.md', '.claude/skills/x.md', 'tools/memory/apex-memory.json']) {
  const r = await appeler({ action: 'read', path: chemin }, ORIGINE_OK);
  verifier(
    `« ${chemin} » est lu dans le bon dépôt`,
    r.status === 200 &&
      derniereUrl === `https://raw.githubusercontent.com/9r4rxssx64-creator/CMCteams/main/${chemin}`,
    derniereUrl,
  );
}
{
  const r = await appeler({ action: 'list', path: '.claude/skills' }, ORIGINE_OK);
  verifier(
    'lister un dossier interroge le bon dépôt',
    r.status === 200 && derniereUrl.includes('/repos/9r4rxssx64-creator/CMCteams/contents/'),
    derniereUrl,
  );
}

console.log('\n4. Le jeton reste-t-il côté serveur ?');
{
  const r = await appeler({ action: 'read', path: 'CLAUDE.md' }, ORIGINE_OK);
  const corps = await r.text();
  const entetes = JSON.stringify([...r.headers]);
  verifier(
    'le jeton n’apparaît ni dans la réponse ni dans les en-têtes',
    !corps.includes('jeton-factice') && !entetes.includes('jeton-factice'),
  );
}

console.log(
  echecs === 0
    ? '\n✅ Tout est conforme : le relais est refermé et ne sort pas de CMCteams.\n'
    : `\n❌ ${echecs} vérification(s) en échec — NE PAS DÉPLOYER.\n`,
);
process.exit(echecs === 0 ? 0 : 1);
