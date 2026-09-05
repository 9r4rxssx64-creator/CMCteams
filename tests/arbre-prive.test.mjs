#!/usr/bin/env node
/* Garde permanente — « le dépôt est PUBLIC : le code se lit, les DONNÉES non » appliqué à l'arbre (fait n°12).
   Hors ligne, 0 dépendance, < 1 s. Échoue si une personne ou une empreinte de code revient dans
   arbre/index.html, si le contrôle du code n'est plus fait sur le domaine, si la publication admin
   n'est plus câblée, ou si les règles Firebase rouvrent la lecture de /arbre en entier.
   La vérification en vrai navigateur est dans tools/arbre/verify-domaine.mjs (Playwright).
   Usage : node tests/arbre-prive.test.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const html = rd('arbre/index.html'), sw = rd('arbre/sw.js'), worker = rd('services/kdmc-router/worker.js');
const wf = rd('.github/workflows/deploy-kdmc-router.yml');
const rules = JSON.parse(rd('firebase-rules-apex.json'));

const fails = [];
function ok(cond, label, detail) { console.log((cond ? '  ✅ ' : '  ❌ ') + label + (detail ? ' — ' + detail : '')); if (!cond) fails.push(label); }

/* 1. versions */
const appVer = (html.match(/var APP_VER="([^"]+)"/) || [])[1];
const cacheVer = (sw.match(/var CACHE = "arbre-([^"]+)"/) || [])[1];
ok(appVer && appVer === cacheVer, 'APP_VER == CACHE du service worker', `${appVer} / ${cacheVer}`);

/* 2. plus aucune donnée ni empreinte dans le fichier public */
ok(!/DEFAULT_CODEHASH/.test(html), 'Aucune empreinte du code famille dans index.html (DEFAULT_CODEHASH)');
const hex64 = html.match(/=\s*"[a-f0-9]{64}"/g) || [];
ok(hex64.length === 0, 'Aucune constante 64-hex (= empreinte) dans index.html', hex64.join(' '));
ok(!/function buildSeed|SEED_VERSION|function mergeSeed\(\)\{var s=buildSeed/.test(html), 'Aucun seed (buildSeed / SEED_VERSION) dans index.html');
const pers = html.match(/id:"seed_[a-z0-9_]+",\s*prenom:/g) || [];
const naiss = html.match(/naissance:\{date:"/g) || [];
ok(pers.length === 0 && naiss.length === 0, 'Aucune personne écrite en dur (id seed_… / naissance:{date:"…"})', `${pers.length} fiche(s), ${naiss.length} date(s)`);

/* 3. le code se vérifie sur le domaine, avec repli local (fail-open) */
ok(/function domainUnlock\(h\)\{return domainFetch\("\/__arbre\/unlock"/.test(html), 'domainUnlock → POST /__arbre/unlock');
ok(/async function tryGate\(\)[^]*?var v=await domainUnlock\(h\)[^]*?if\(v&&v\.ok\)\{enter\(h,v\.seed\);return;\}/.test(html), 'tryGate interroge le domaine d\'abord et entre avec l\'arbre reçu');
ok(/if\(stored&&h===stored\)\{enter\(h,null\);return;\}/.test(html), 'Repli local si le domaine est muet (appareil qui connaît déjà l\'empreinte)');
ok(/code_non_publie[^]*?pas encore publié/.test(html), 'Message clair si rien n\'est publié');
ok(/function applyDomainSeed\(sd,force\)[^]*?photos:\(lp&&lp\.photos\)\|\|\[\]/.test(html), 'applyDomainSeed garde les photos locales');
ok(/async function refreshFromDomain\(\)[^]*?applyDomainSeed\(r\.seed,true\)[^]*?purgeObsoleteSeeds\(\)/.test(html) && /refreshFromDomain\(\)\.then\(function\(\)\{cloudPull\(false\);\}\)/.test(html), 'Un appareil existant récupère une version plus récente des fiches officielles depuis le domaine (seedVersion) et purge les fantômes');
ok(/function purgeObsoleteSeeds\(\)/.test(html) && !/\|\|\(p\.vivant\?"vivant":""\)/.test(html), 'Code v3.14 porté : purge des fiches fantômes, plus jamais « vivant » affiché');
ok(/if\(_domainSeed\)\{var nd=applyDomainSeed\(_domainSeed\)/.test(html), 'startApp applique l\'arbre reçu du domaine');
ok(!/seed\(\);/.test(html), 'Plus d\'appel seed() (rien à inventer localement)');

/* 4. publication admin câblée, code jamais mémorisé */
ok(/async function publishDomain\(\)[^]*?"\/__admin\/login"[^]*?code=null;[^]*?"\/__arbre\/seed",\{method:"PUT",headers:\{"x-kdmc-admin":lg\.grant\}/.test(html), 'publishDomain : preuve admin (/__admin/login) → PUT /__arbre/seed avec le grant, code effacé');
ok(/id="btnPublish"/.test(html) && /\$\("#btnPublish"\)\.onclick=publishDomain;fillDomainStatus\(\);/.test(html), 'Bouton « Publier » câblé + état du domaine affiché dans Outils');
ok(/persons:t\.persons/.test(html) && /var t=textOnly\(DB\)/.test(html), 'Publication = texte seulement (textOnly, sans photos)');
ok(!/localStorage\.setItem\("[^"]*admin[^"]*"/i.test(html), 'Le code admin n\'est écrit dans aucune clé locale');

/* 5. rotation du code : domaine + effacement de l'ancien chemin cloud */
ok(/async function changeCode\(\)[^]*?"\/__arbre\/code",\{method:"POST",body:JSON\.stringify\(\{old:old,new:nh\}\)/.test(html), 'changeCode prouve l\'ancien code au domaine');
ok(/FB\+"\/arbre\/"\+old\+"\.json\?auth="\+t,\{method:"DELETE"\}/.test(html), 'changeCode efface l\'ancien chemin cloud');

/* 6. routeur : endpoints + test + workflow */
ok(/async function handleArbre\(request, url, env\)/.test(worker) && /url\.pathname\.startsWith\('\/__arbre\/'\)\) return handleArbre/.test(worker), 'Routeur : handleArbre défini ET câblé dans le dispatch');
for (const ep of ["'/__arbre/unlock'", "'/__arbre/seed'", "'/__arbre/code'", "'/__arbre/status'"]) ok(worker.includes(ep), `Routeur : endpoint ${ep}`);
ok(/'\/__arbre\/seed' && request\.method === 'PUT'\)[^]*?await adminSession\(request, env\)/.test(worker), 'Routeur : PUT seed réservé admin (adminSession)');
ok(/rlFail\(env, ipHash\); await audLog\(env, \{ ev: 'arbre_unlock_fail'/.test(worker), 'Routeur : unlock rate-limité + journalisé');
ok(/'arbre:codehash'/.test(worker) && /'arbre:seed'/.test(worker), 'Routeur : KV isolé (préfixe arbre:)');
ok(fs.existsSync(path.join(ROOT, 'services/kdmc-router/arbre.test.mjs')) && /node arbre\.test\.mjs/.test(wf), 'Test du routeur présent ET bloquant dans deploy-kdmc-router.yml');

/* 7. règles Firebase : plus de lecture de /arbre en entier (listing de toutes les empreintes) */
const ar = rules.rules && rules.rules.arbre;
ok(ar && !('.read' in ar) && !('.write' in ar), 'Firebase : aucune règle .read/.write directement sur /arbre (pas de listing)');
ok(ar && ar.$code && /auth != null/.test(ar.$code['.read'] || '') && /\[a-f0-9\]\{64\}/.test(ar.$code['.read'] || ''), 'Firebase : lecture uniquement par empreinte 64-hex connue + auth');

/* 8. outils de vérification réelle */
ok(fs.existsSync(path.join(ROOT, 'tools/arbre/verify-domaine.mjs')) && fs.existsSync(path.join(ROOT, 'tools/arbre/fixture-famille.mjs')), 'tools/arbre/verify-domaine.mjs + fixture synthétique présents');
const fx = rd('tools/arbre/fixture-famille.mjs');
ok(!/naissance:\s*\{\s*date:\s*"\d+\.\d+\.19[0-9]{2}\s*\("/.test(fx) && !/desarzens k|kevin|laurence|gérard|marie-?noël/i.test(fx), 'La fixture ne contient aucun prénom réel de la famille');

console.log(fails.length ? `\n❌ arbre-prive : ${fails.length} échec(s)` : `\n✅ arbre-prive : ${appVer} — 0 donnée dans le fichier public, code vérifié sur le domaine, publication admin, règles Firebase par empreinte`);
process.exit(fails.length ? 1 : 0);
