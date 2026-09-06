/* GARDE — un déploiement doit pouvoir PARTIR, et partir quand il faut.
 * ====================================================================
 * Kevin 2026-09-06 : « Pourquoi tu es bloqué par GitHub ? Trouve des solutions. »
 *
 * Mesuré ce jour-là : depuis l'agent, l'API GitHub refuse TOUS les chemins du dépôt
 * (« GitHub access is not enabled for this session ») → impossible de lancer un
 * déploiement à la main. Seul `git push` fonctionne. Donc la seule voie fiable est
 * le déclencheur `push` sur `claude/**` — c'est pour ça qu'Apex Chat s'était bien
 * déployé et que le relais Apex + World Monitor étaient restés en arrière.
 *
 * Deux pièges attrapés ici, définitivement :
 *   1. un worker de la chaîne IA dont le déploiement n'écoute PAS `claude/**`
 *      → je ne peux plus le mettre en ligne sans un clic de Kevin ;
 *   2. un worker qui IMPORTE le routage IA commun sans que son déploiement
 *      surveille ce fichier → modifier le routage ne redéploie rien, et le worker
 *      sert éternellement l'ancienne version (déploiement fantôme, leçon #213).
 *   3. un workflow qui ne surveille pas son PROPRE fichier → le modifier ne
 *      déclenche rien (c'était le cas de World Monitor).
 *
 * Lancer : node tests/verify-deploiement-declenche.mjs
 */
import { readFileSync, existsSync } from 'node:fs';

const R = { ok: [], ko: [] };
const chk = (c, m) => (c ? R.ok : R.ko).push(m);
const lire = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');

/* worker → son workflow de déploiement (chaîne IA du domaine) */
const IA = [
  { nom: 'relais Apex (Qwen)', src: '.github/workflows/sync-apex-secrets-to-cf-worker.yml', wf: 'sync-apex-secrets-to-cf-worker' },
  { nom: 'hub apis.kd-mc.com', src: 'services/kdmc-apis/worker.js', wf: 'deploy-kdmc-apis' },
  { nom: 'Créa AI', src: 'services/kdmc-crea-ai/worker.js', wf: 'deploy-kdmc-crea-ai' },
  { nom: 'routeur (Lingua)', src: 'services/kdmc-router/worker.js', wf: 'deploy-kdmc-router' },
  { nom: 'World Monitor', src: 'tools/cloudflare/wm-brief/worker.js', wf: 'deploy-wm-brief' },
  { nom: 'Apex Chat', src: 'messaging-app/workers/api-worker.js', wf: 'deploy-apex-chat' },
];

console.log('— 1. Chaque déploiement IA part-il sur un push claude/** ? (sinon : bloqué) —');
for (const { nom, wf } of IA) {
  const y = lire(`.github/workflows/${wf}.yml`);
  chk(y.length > 0, `${nom} : le workflow ${wf}.yml existe`);
  chk(/branches:[\s\S]{0,120}?'claude\/\*\*'/.test(y), `${nom} : déclenché par un push sur claude/** (déploiement sans API GitHub ni clic)`);
}

console.log('— 2. Un workflow surveille-t-il son PROPRE fichier ? —');
for (const { nom, wf } of IA) {
  const y = lire(`.github/workflows/${wf}.yml`);
  chk(y.includes(`workflows/${wf}.yml`), `${nom} : modifier ${wf}.yml redéclenche bien son déploiement`);
}

console.log('— 3. Qui importe le routage IA commun le surveille-t-il ? (anti-déploiement fantôme) —');
const PARTAGE = 'services/_shared/ia-route.js';
chk(existsSync(PARTAGE), `le module commun ${PARTAGE} existe`);
/* un vrai `import … from '…/_shared/ia-route.js'` — pas une simple mention en commentaire
   (Créa AI cite le fichier dans un commentaire mais garde sa propre chaîne : rien à surveiller) */
const IMPORTE = /^\s*import\s[\s\S]{0,200}?from\s+['"][^'"]*_shared\/ia-route\.js['"]/m;
for (const { nom, src, wf } of IA) {
  const code = lire(src);
  if (!IMPORTE.test(code)) continue;
  const y = lire(`.github/workflows/${wf}.yml`);
  chk(y.includes('_shared/ia-route.js'),
    `${nom} : importe le routage commun ET son déploiement surveille ce fichier`);
}

console.log('— 4. La preuve live existe-t-elle ? (un déploiement vert ne prouve rien, leçon #95) —');
const apis = lire('.github/workflows/deploy-kdmc-apis.yml');
chk(/Preuve live/.test(apis), 'le hub pose de VRAIES questions aux IA après chaque déploiement');
chk(/\/ai\/analyse/.test(apis), 'il vérifie aussi la concertation (le type de question est voté)');
chk(/Origin: https:\/\/kd-mc\.com/.test(apis), 'il envoie une Origin de confiance (sinon 403, test faussement rouge)');
chk(/set \+e/.test(apis.split('Preuve live')[1] || ''), 'la preuve live n\'est JAMAIS bloquante (un moteur lent n\'annule pas un déploiement)');
const proxy = lire('.github/workflows/sync-apex-secrets-to-cf-worker.yml');
chk(/qwen HTTP/.test(proxy), 'le relais Apex teste réellement Qwen après déploiement');

R.ko.forEach((m) => console.log('  FAIL ' + m));
R.ok.forEach((m) => console.log('  OK   ' + m));
console.log(`\n=== ${R.ok.length} OK / ${R.ko.length} FAIL ===`);
process.exit(R.ko.length ? 1 : 0);
