/* GARDE-FOU — un SECRET D'ACCÈS ne doit jamais être écrit en clair dans un document.
 *
 * TROUVÉ LE 2026-09-06, en relisant les .md que personne n'avait jamais ouverts. Deux fuites,
 * dans un dépôt PUBLIC, qu'aucun garde existant n'attrapait :
 *
 *  1. `AGENT_SECRET` en clair dans deux tableaux (`_PROJECTS_KDMC/e-KDMC/`). Ce n'est pas une
 *     note : c'est l'UNIQUE garde de `/api/cron` et `/api/sentry-test` de l'agent déployé
 *     (`tools/agent/api/cron.js:12`). Le lire = déclencher les cycles de l'agent, qui appellent
 *     l'API Anthropic → dépense réelle sur le compte de Kevin.
 *
 *  2. Le code famille de l'arbre en clair (`arbre/PASSATION-ARBRE.md`). Il n'est pas décoratif :
 *     `sha256("arbre::"+code)` EST le chemin Firebase (`arbre/index.html:302 cloudBase()`), et
 *     l'app s'authentifie en anonyme. Le connaître = LIRE ET ÉCRIRE tout l'arbre — c'est-à-dire
 *     les données de personnes vivantes.
 *
 * Pourquoi les gardes existants ne voyaient rien : `no-admin-pin-leak` ne cherche que le code
 * ADMIN, par empreinte ; `gitleaks` ne connaît que des préfixes publiés (`sk-`, `ghp_`…) et ces
 * deux secrets sont des chaînes libres. Ici on ne cherche pas UNE valeur, on cherche une FORME :
 * « une étiquette de secret, suivie d'une valeur ». Ça attrape aussi les futurs secrets qu'on ne
 * connaît pas encore.
 *
 * Ce test ne contient AUCUNE valeur secrète — sinon le garde serait lui-même la fuite (erreur
 * déjà commise le 2026-08-09 : le commentaire du correctif re-citait le PIN).
 *
 * node tests/no-secret-in-docs.test.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* Dossiers hors périmètre : contenu tiers, dépendances, archives de build. */
const IGNORE = new Set(['node_modules', '.git', 'vendor', 'dist', '_archive_v12', 'coverage']);

/* Étiquettes qui annoncent un secret d'accès. La valeur qui suit ne doit jamais être écrite. */
const ETIQUETTES = [
  { nom: 'AGENT_SECRET',        re: /agent[ _-]?secret/i },
  { nom: 'code famille (arbre)', re: /code\s+(?:d['’]acc[eè]s\s+)?(?:famille|arbre)|code\s+famille/i },
  { nom: 'code admin',          re: /code\s+admin|admin[ _-]?pin/i },
  { nom: 'mot de passe',        re: /mot\s+de\s+passe|password/i },
];

/* Une VALEUR = une chaîne assez longue et assez « aléatoire » pour être un secret,
 * entre backticks ou en gras. On exclut ce qui est manifestement une redaction ou un exemple. */
const VALEUR = /`([^`\n]{8,})`|\*\*([A-Za-z0-9_\-]{8,})\*\*/g;
const INOFFENSIF =
  /^(‹.*›|\.\.\.|x{3,}|X{3,}|<[^>]+>|\$\{?[A-Z_]+\}?|process\.env|secrets?\.[A-Z_]+|null|undefined|true|false)$/;

/* Une valeur « secrète » est une chaîne IMPRÉVISIBLE. Tout ce qui suit une convention de
 * nommage est un NOM (de secret, de variable, de clé de config), pas une valeur — c'est ce
 * qui faisait crier le garde à tort sur `CLOUDFLARE_API_TOKEN`, `network.hotspot_password`,
 * `APEX_ADMIN_PIN_SHA256`, `refresh_token`, `{uid, password}`… (trié un par un le 6.09.2026). */
function ressembleAUnSecret(v) {
  if (INOFFENSIF.test(v)) return false;
  if (/\s/.test(v)) return false;                      // une phrase
  if (/[À-ÿ]/.test(v)) return false;                    // du texte accentué
  if (/[{}<>(),:;/\\|=?&]/.test(v)) return false;        // code, chemin, tableau, paramètre d'URL
  if (/^(https?:|\/|\.\/|#)/.test(v)) return false;     // URL / chemin / ancre
  if (/\.(js|ts|mjs|cjs|md|json|ya?ml|html|py|sh|toml)$/.test(v)) return false; // fichier
  // NOM_DE_SECRET : des majuscules AVEC underscore. Sans underscore (`MAIFFRET77`), c'est
  // une valeur, pas un nom — c'est exactement la forme du code famille de l'arbre.
  if (/^[A-Z][A-Z0-9]*_[A-Z0-9_]*$/.test(v)) return false;
  if (/^[a-z][a-z0-9_.]*$/.test(v)) return false;       // nom.en.minuscules / snake_case
  if (/^[a-z0-9]+([-_.][a-z0-9]+)+$/i.test(v)) return false; // identifiant à séparateurs
  if (/^[.@#$][A-Za-z]/.test(v)) return false;          // .read, @scope…
  if (/[…]|\.\.\.$/.test(v)) return false;             // valeur DÉJÀ tronquée (`glpat-wD6Q…`)
  if (/^_?[a-z][A-Za-z0-9]*$/.test(v)) return false;    // identifiant camelCase (`vLoginStep1`)
  if (/^[A-Z][a-z]+([A-Z][a-z0-9]*)+$/.test(v)) return false; // PascalCase (`FaceIdEnroll`)

  /* Ce qui reste doit être imprévisible : casse mélangée ET chiffres, ou une longue
   * chaîne alphanumérique dense (≥ 12) qui n'est pas un mot. */
  // ≥ 10 : en dessous, on ramasse des noms de produits (« 1Password ») plutôt que des secrets.
  const mixte = v.length >= 10 && /[a-z]/.test(v) && /[A-Z]/.test(v) && /[0-9]/.test(v);
  const dense = v.length >= 12 && /^[A-Za-z0-9]+$/.test(v) && /[0-9]/.test(v);
  const majAlnum = v.length >= 6 && /^[A-Z0-9]+$/.test(v) && /[0-9]/.test(v) && /[A-Z]/.test(v);
  return mixte || dense || majAlnum;
}

function fichiersMd(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    if (IGNORE.has(e)) continue;
    if (e.startsWith('.') && e !== '.github' && e !== '.claude') continue; // on scanne AUSSI les skills
    const p = join(dir, e);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) fichiersMd(p, acc);
    else if (e.endsWith('.md')) acc.push(p);
  }
  return acc;
}

const fuites = [];
const fichiers = fichiersMd(ROOT);

for (const f of fichiers) {
  let txt;
  try { txt = readFileSync(f, 'utf8'); } catch { continue; }
  const lignes = txt.split('\n');
  for (let i = 0; i < lignes.length; i++) {
    const l = lignes[i];
    const etq = ETIQUETTES.find((e) => e.re.test(l));
    if (!etq) continue;
    for (const m of l.matchAll(VALEUR)) {
      const v = m[1] ?? m[2];
      if (!v || !ressembleAUnSecret(v)) continue;
      /* On rapporte l'EMPLACEMENT et la LONGUEUR, jamais la valeur. */
      fuites.push(`${relative(ROOT, f)}:${i + 1} — étiquette « ${etq.nom} » suivie d'une valeur de ${v.length} caractères`);
    }
  }
}

console.log(`Garde « aucun secret d'accès en clair dans un document » : ${fichiers.length} fichiers .md scannés`);
if (fuites.length) {
  console.error(`\n❌ ${fuites.length} fuite(s) — un secret écrit dans un document PUBLIC :\n`);
  for (const f of fuites) console.error('   · ' + f);
  console.error(
    `\nÀ faire : (1) remplacer la valeur par « ‹secret …› », (2) RÉGÉNÉRER le secret — masquer\n` +
    `ne l'efface PAS de l'historique git, il est à considérer comme connu.\n`
  );
  process.exit(1);
}
console.log('✅ 0 fuite');
