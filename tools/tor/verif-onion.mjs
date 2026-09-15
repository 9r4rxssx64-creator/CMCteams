#!/usr/bin/env node
/* Vérifie EN VRAI que les adresses du catalogue répondent — à travers le réseau Tor.
 * Kevin 2026-09-15 : « va plus loin ». C'était le point faible déclaré de l'outil :
 * les adresses étaient relevées à leur source officielle, jamais ouvertes.
 *
 * OÙ ÇA TOURNE — et pourquoi pas ailleurs (règle « chaque automatisation a une destination
 * écrite ») : ça n'est ni produire, ni tester, ni déployer CE dépôt — ça appelle l'extérieur.
 *   · Agent Claude : IMPOSSIBLE (réseau fermé : anthropic + registres de paquets seulement).
 *   · GitHub Actions : INTERDIT — « utiliser Actions uniquement pour interagir avec des sites
 *     tiers » est la formulation même qui a fait suspendre le compte le 15/08/2026.
 *   · GitLab CI, à la demande : LA destination. Job `tor-adresses` (stage veille), déclenché
 *     par un push du fichier-signal `veille-demande.txt` ou à la main. Aucune tâche programmée.
 *
 * USAGE
 *   node tools/tor/verif-onion.mjs            # exige un Tor local (9050 = service tor, 9150 = Tor Browser)
 *   node tools/tor/verif-onion.mjs --simule   # sans Tor : prouve la logique (tests)
 *   node tools/tor/verif-onion.mjs --json rapport.json
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import net from 'node:net';

const execFileP = promisify(execFile);
const args = process.argv.slice(2);
const SIMULE = args.includes('--simule');
const SORTIE = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;
/* Quel Tor écoute ? 9050 = le service `tor` ; 9150 = le Tor Browser ouvert sur le bureau.
   TOR_SOCKS force la valeur si besoin. */
function ecoute(hote, port) {
  return new Promise(ok => {
    const s = net.connect({ host: hote, port, timeout: 1500 });
    s.on('connect', () => { s.destroy(); ok(true); });
    s.on('error', () => ok(false));
    s.on('timeout', () => { s.destroy(); ok(false); });
  });
}
async function trouveProxy() {
  /* TOR_SOCKS est vérifié comme le reste : un port forcé mais mort donnerait « tout est
     mort » — le faux verdict qu'on veut justement éviter. */
  const candidats = process.env.TOR_SOCKS ? [process.env.TOR_SOCKS] : ['127.0.0.1:9050', '127.0.0.1:9150'];
  for (const adr of candidats) {
    const [h, p] = adr.split(':');
    if (await ecoute(h || '127.0.0.1', Number(p))) return adr;
  }
  return null;
}
const PROXY = SIMULE ? '(simulé)' : await trouveProxy();

/* SANS Tor, curl échoue sur les 20 adresses et le rapport dirait « tout est mort » : un
   verdict FAUX, pire que pas de verdict. On refuse de produire un rapport dans ce cas. */
if (!SIMULE && !PROXY) {
  console.error([
    process.env.TOR_SOCKS
      ? 'Rien n\'écoute sur ' + process.env.TOR_SOCKS + ' (TOR_SOCKS).'
      : 'Aucun Tor ne répond en local (ni 127.0.0.1:9050, ni 127.0.0.1:9150).',
    '',
    'Sans Tor, les 20 adresses paraîtraient toutes mortes : ce serait un faux verdict.',
    'Donc je ne produis aucun rapport.',
    '',
    'Pour lancer la vérification pour de vrai, au choix :',
    '  · ouvrir le Tor Browser et le laisser ouvert (il écoute sur 9150), puis relancer ;',
    '  · ou installer le service : sudo apt install tor  (ou  brew install tor) puis  tor ;',
    '  · ou pointer un autre Tor :  TOR_SOCKS=127.0.0.1:9150 node tools/tor/verif-onion.mjs',
    '',
    'Pour juste vérifier que l\'outil fonctionne, sans réseau :  --simule'
  ].join('\n'));
  process.exit(2);
}

/* Le catalogue est lu DANS la page : une seule source de vérité, jamais recopiée. */
const page = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const bloc = page.match(/var SITES = \[([\s\S]*?)\n\];/);
if (!bloc) { console.error('Catalogue introuvable dans tools/tor/index.html'); process.exit(2); }
const sites = [...bloc[1].matchAll(/\{c:"(.*?)", *n:"(.*?)", *d:".*?", *o:"(.*?)", *s:"(.*?)"\}/g)]
  .map(m => ({ categorie: m[1], nom: m[2], onion: m[3], source: m[4] }));

/* Un site .onion qui répond 401/403 n'est pas mort : il est protégé. Un 000 (curl n'a rien
   obtenu) veut dire injoignable — c'est le seul cas qui compte comme adresse morte. */
function classe(code) {
  const n = parseInt(code, 10);
  if (n >= 200 && n < 400) return { etat: 'vivant', ok: true };
  if (n === 401 || n === 403) return { etat: 'protégé', ok: true };
  if (n >= 400) return { etat: 'erreur ' + n, ok: true };   /* le serveur répond : l'adresse vit */
  return { etat: 'injoignable', ok: false };
}

async function teste(hote, index) {
  if (SIMULE) {
    /* Déterministe ET couvrant les 4 classements (vivant / protégé / erreur / injoignable),
       pour que la garde prouve les DEUX branches sans réseau. Le vrai verdict ne vient QUE
       d'un run GitLab. */
    return ['200', '200', '403', '404', '000'][index % 5];
  }
  try {
    const { stdout } = await execFileP('curl', [
      '--socks5-hostname', PROXY, '-sS', '-o', '/dev/null',
      '-w', '%{http_code}', '--max-time', '60', '-L', 'http://' + hote + '/'
    ], { timeout: 70000 });
    return stdout.trim();
  } catch { return '000'; }
}

const t0 = Date.now();
console.log('Vérification RÉELLE de ' + sites.length + ' adresses' +
            (SIMULE ? ' — MODE SIMULÉ (aucun réseau, aucun verdict réel)' : ' à travers Tor (' + PROXY + ')'));
console.log('');

const resultats = [];
for (let i = 0; i < sites.length; i++) {
  const s = sites[i];
  const hote = s.onion.replace(/\/.*$/, '');
  const code = await teste(hote, i);
  const c = classe(code);
  resultats.push({ nom: s.nom, categorie: s.categorie, onion: hote, code, ...c, source: s.source });
  console.log((c.ok ? '  ✓ ' : '  ✗ ') + s.nom.padEnd(22) + c.etat.padEnd(14) + '(' + code + ')');
}

const morts = resultats.filter(r => !r.ok);
const rapport = {
  date: new Date().toISOString(),
  simule: SIMULE,
  total: resultats.length,
  vivants: resultats.length - morts.length,
  morts: morts.map(r => r.nom),
  duree_s: Math.round((Date.now() - t0) / 1000),
  resultats
};
if (SORTIE) { writeFileSync(SORTIE, JSON.stringify(rapport, null, 2)); console.log('\nRapport écrit : ' + SORTIE); }

console.log('\n' + rapport.vivants + '/' + rapport.total + ' adresses répondent' +
            (morts.length ? ' — injoignables : ' + morts.map(r => r.nom).join(', ') : ''));
if (SIMULE) { console.log('(mode simulé : ces chiffres ne prouvent RIEN sur le vrai réseau)'); process.exit(0); }

/* Une ou deux adresses injoignables, c'est la vie normale du réseau (un service s'arrête,
   un noeud est lent). On n'échoue que si le catalogue est manifestement périmé. */
if (morts.length > Math.max(2, Math.floor(resultats.length / 3))) {
  console.error('\nÉCHEC : trop d\'adresses injoignables, le catalogue doit être revu.');
  process.exit(1);
}
