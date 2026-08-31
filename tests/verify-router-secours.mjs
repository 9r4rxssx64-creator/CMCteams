/* PREUVE — la bouée de secours de kd-mc.com.
 * Le 14/08/2026 le compte GitHub de Kevin a été suspendu : GitHub Pages s'est
 * éteint et les 20 sous-domaines ont renvoyé 404 (constaté sur son iPhone).
 * Le routeur Cloudflare, lui, tourne toujours — il peut donc servir une copie
 * des pages embarquée dans le Worker.
 *
 * On appelle le VRAI routeur, sans réseau (fetch mocké) :
 *   A) GitHub éteint (404)   → la page sort quand même, depuis la copie
 *   B) GitHub éteint (5xx)   → pareil (panne serveur, pas seulement 404)
 *   C) DISCRIMINANT : GitHub debout (200) → la copie n'est PAS utilisée
 *   D) SÉCURITÉ : les pages admin restent verrouillées — le secours ne doit
 *      pas devenir une porte dérobée
 *   E) le secours est ANNONCÉ (en-tête), jamais fait en douce
 *   F) sans copie embarquée, le comportement d'avant est intact
 *   G) chaque sous-domaine de ROUTES a bien sa copie prévue (rien d'oublié)
 * Lancer : node tests/verify-router-secours.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import worker from '../services/kdmc-router/worker.js';

const R = { ok: [], ko: [] };
const chk = (c, m) => (c ? R.ok : R.ko).push(m);

let amontVu = [];
function amont({ code = 404 } = {}) {
  amontVu = [];
  global.fetch = async (req) => {
    const u = String(req && req.url ? req.url : req);
    amontVu.push(u);
    if (code === 200) return new Response('<html>PAGE VENUE DE GITHUB</html>', { status: 200, headers: { 'content-type': 'text/html' } });
    return new Response('Not Found', { status: code, headers: { 'content-type': 'text/plain' } });
  };
}
/* Fausse copie embarquée : elle ne connaît que les vrais chemins /CMCteams/… */
let copieVue = [];
const COPIE = {
  '/CMCteams/kdmc-home/index.html': '<html>ACCUEIL DEPUIS LA COPIE</html>',
  '/CMCteams/tools/departs/index.html': '<html>DEPARTS DEPUIS LA COPIE</html>',
  '/CMCteams/tools/approvals/index.html': '<html>AUTORISATIONS DEPUIS LA COPIE</html>',
};
const ASSETS = {
  fetch: async (req) => {
    const p = new URL(req.url).pathname;
    copieVue.push(p);
    if (COPIE[p]) return new Response(COPIE[p], { status: 200, headers: { 'content-type': 'text/html' } });
    return new Response('nope', { status: 404 });
  },
};
const appel = (host, chemin, env) => worker.fetch(new Request('https://' + host + chemin), env || {});

/* A) GitHub éteint → la page sort depuis la copie */
amont({ code: 404 }); copieVue = [];
let r = await appel('kd-mc.com', '/', { ASSETS });
let t = await r.text();
chk(r.status === 200, 'A. GitHub éteint (404) → la page sort quand même (' + r.status + ')');
chk(/COPIE/.test(t), 'A. et elle vient bien de la copie embarquée');
chk(copieVue.includes('/CMCteams/kdmc-home/index.html'),
  'A. le bon fichier est cherché (index.html du dossier, comme le faisait GitHub Pages)');

/* B) panne serveur, pas seulement 404 */
amont({ code: 503 }); copieVue = [];
r = await appel('departs.kd-mc.com', '/', { ASSETS });
chk(r.status === 200 && /DEPARTS/.test(await r.text()),
  'B. GitHub en panne (503) → la copie prend le relais aussi');

/* C) DISCRIMINANT — GitHub debout : la copie ne doit PAS servir */
amont({ code: 200 }); copieVue = [];
r = await appel('kd-mc.com', '/', { ASSETS });
t = await r.text();
chk(/GITHUB/.test(t), 'C. GitHub debout → c\'est LUI qui sert (' + t.slice(0, 28) + '…)');
chk(copieVue.length === 0, 'C. la copie n\'est même pas consultée — aucun changement de comportement');
chk(!r.headers.get('x-kdmc-secours'), 'C. et rien n\'est marqué « secours »');

/* D) SÉCURITÉ — le secours ne doit pas ouvrir les pages admin */
amont({ code: 404 }); copieVue = [];
r = await appel('autorisations.kd-mc.com', '/CMCteams/tools/approvals/index.html',
  { ASSETS, KDMC_ADMIN_PIN_SHA256: 'unhash' });
t = await r.text();
chk(!/AUTORISATIONS DEPUIS LA COPIE/.test(t),
  'D. page admin : la copie ne sert PAS de porte dérobée (verrou toujours actif)');
chk(r.status === 401 || r.status === 403 || /verrou|code|Face|acc[eè]s/i.test(t),
  'D. on reçoit bien l\'écran de verrouillage (statut ' + r.status + ')');

/* E) honnêteté : le secours est annoncé */
amont({ code: 404 });
r = await appel('kd-mc.com', '/', { ASSETS });
chk(r.headers.get('x-kdmc-secours') === 'assets',
  'E. le mode secours est ANNONCÉ dans la réponse, jamais caché');

/* F) sans copie embarquée → exactement le comportement d'avant */
amont({ code: 404 });
r = await appel('kd-mc.com', '/', {});
chk(r.status === 404, 'F. sans copie, rien ne change : on renvoie le 404 comme avant');

/* G) aucun sous-domaine oublié dans la copie */
const src = readFileSync(new URL('../services/kdmc-router/worker.js', import.meta.url), 'utf8');
const bloc = src.slice(src.indexOf('const ROUTES'), src.indexOf('// Proxy MÊME ORIGINE'));
const dossiers = [...bloc.matchAll(/'\/CMCteams\/?([^']*)'/g)].map((m) => m[1]).filter((x, i, a) => a.indexOf(x) === i);
const prep = readFileSync(new URL('../services/kdmc-router/prepare-secours.mjs', import.meta.url), 'utf8');
dossiers.forEach((d) => {
  if (!d) { chk(/RACINE_FICHIERS/.test(prep), 'G. la racine (cmcteams) est prévue dans la copie'); return; }
  chk(prep.includes(`'${d}'`), `G. « ${d} » est prévu dans la copie (aucun sous-domaine oublié)`);
});

/* G-bis) et le garde-fou de sécurité est bien dans la config */
const toml = readFileSync(new URL('../services/kdmc-router/wrangler.toml', import.meta.url), 'utf8');
chk(/run_worker_first\s*=\s*true/.test(toml),
  'G-bis. run_worker_first=true : le code passe AVANT les fichiers, sinon les verrous admin sautaient');
chk(/binding\s*=\s*"ASSETS"/.test(toml), 'G-bis. le binding ASSETS est déclaré');


/* H) BASCULE D'HÉBERGEUR — le compte GitHub peut disparaître pour de bon.
      On doit pouvoir changer la source des pages depuis le tableau de bord
      Cloudflare (une variable), sans toucher au code ni redéployer. */
amont({ code: 200 });
r = await appel('kd-mc.com', '/', { UPSTREAM_BASE: 'https://kdmc.pages.dev', UPSTREAM_PREFIX: '' });
chk(amontVu.some((u) => u.startsWith('https://kdmc.pages.dev/')),
  'H. la source des pages est bien changée par la variable (' + (amontVu[0] || '—').slice(0, 46) + ')');
chk(!amontVu.some((u) => /github\.io/.test(u)),
  'H. et on ne va PLUS chercher chez GitHub du tout');
chk(amontVu.some((u) => u.includes('/kdmc-home/')),
  'H. le bon dossier est toujours servi pour kd-mc.com');
chk(!amontVu.some((u) => u.includes('/CMCteams/')),
  'H. le préfixe /CMCteams est retiré quand l\'hébergeur sert à la racine');

/* H-ter) le PIÈGE : les pages contiennent des liens en /CMCteams/… ; ils
      doivent continuer à marcher après la bascule, sans tout casser. */
amont({ code: 200 });
r = await appel('cmcteams.kd-mc.com', '/CMCteams/tools/departs/index.html',
  { UPSTREAM_BASE: 'https://kdmc.pages.dev', UPSTREAM_PREFIX: '' });
chk(amontVu.some((u) => u === 'https://kdmc.pages.dev/tools/departs/index.html'),
  'H-ter. un lien interne /CMCteams/… est bien traduit (' + (amontVu[0] || '—').slice(0, 50) + ')');

/* H-bis) DISCRIMINANT : sans variable, RIEN ne change (aucune régression). */
amont({ code: 200 });
r = await appel('kd-mc.com', '/', {});
chk(amontVu.some((u) => u.startsWith('https://9r4rxssx64-creator.github.io/CMCteams/kdmc-home/')),
  'H-bis. sans réglage, on garde exactement le comportement d\'avant');

R.ok.forEach((m) => console.log('  OK ' + m));
R.ko.forEach((m) => console.log('  FAIL ' + m));
console.log(`=== ${R.ok.length} OK / ${R.ko.length} FAIL ===`);
process.exit(R.ko.length ? 1 : 0);
