/* GARDE — CMCteams : les questions courantes vont à l'IA GRATUITE (Qwen via apis.kd-mc.com),
 * le planning/les outils/les actions restent à Anthropic (Kevin 2026-09-05 « pareil dans mes
 * autres projets »). Hors ligne, 0 clé : on EXTRAIT la fonction de décision du vrai index.html
 * et on l'exécute — un test « c'est déclaré » ne suffit pas (Declaration ≠ Deployment).
 * Lancer : node tests/verify-cmc-ia-gratuite.mjs */
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const R = { ok: [], ko: [] };
const chk = (c, m) => (c ? R.ok : R.ko).push(m);

/* --- 1. la fonction de décision existe, on l'extrait et on l'exécute -------- */
const m = html.match(/function cmcIaFreeDomain\(q\)\{[\s\S]*?\n\}\n/);
chk(!!m, '1. cmcIaFreeDomain est déclarée dans index.html');
let cmcIaFreeDomain = () => { throw new Error('absente'); };
if (m) cmcIaFreeDomain = new Function(m[0] + '\nreturn cmcIaFreeDomain;')();

const free = (q) => cmcIaFreeDomain(q);
chk(free('Quelle est la capitale du Portugal ?') === 'general', '2. question de culture générale → gratuit (general)');
chk(free('résume ce texte : la convention prévoit…') === null, '2. « résume » qui parle de la convention → Anthropic (données CMC)');
chk(free('résume-moi ce texte de presse') === 'summary', '2. résumé sans donnée CMC → gratuit (summary)');
chk(free('résume-moi cet article de presse') === null, '2. « article » reste à Anthropic (article de la convention = donnée CMC, prudence)');
chk(free('traduis en anglais : bonne journée') === 'translation', '2. traduction → gratuit (translation)');
chk(free('réponds vite : combien font 12 × 12 ?') === 'speed', '2. « vite » → gratuit (speed)');

/* --- 3. tout ce qui a besoin des OUTILS reste à Anthropic ------------------ */
chk(free('mon planning de demain ?') === null, '3. planning → jamais le gratuit');
chk(free("qui travaille aujourd'hui en équipe 3 ?") === null, '3. équipe / aujourd\'hui → jamais le gratuit');
chk(free('combien de jours de congé il me reste ?') === null, '3. congé → jamais le gratuit');
chk(free('article 17.4 de la convention') === null, '3. convention → jamais le gratuit');
chk(free('modifie le code de DUPONT le 12') === null, '3. ACTION (modifie) → jamais le gratuit (outils)');
chk(free('lance la vérification des conflits') === null, '3. ACTION (lance) → jamais le gratuit');
chk(free('regarde cette photo du planning') === null, '3. image/photo → jamais le gratuit (pas de vision)');
chk(free('corrige ce code javascript') === null, '3. code → jamais le gratuit');
chk(free('cherche sur google le règlement') === null, '3. recherche → jamais le gratuit');

/* --- 4. câblage réel : iaSend appelle bien le relais, avec secours ---------- */
const send = html.match(/function iaSend\(preset\)\{[\s\S]*?\n\}\n/);
chk(!!send && /cmcIaFreeDomain\(text\)/.test(send[0]), '4. iaSend DÉCIDE via cmcIaFreeDomain (pas seulement déclaré)');
chk(!!send && /cmcIaFreeAsk\(text,_freeDom,function\(reason\)\{/.test(send[0]), '4. iaSend appelle le relais gratuit avec un secours (onFail)');
chk(!!send && /if\(iaApiKey\)\{callClaudeIA\(text\);return;\}/.test(send[0]), '4. relais KO + clé Anthropic → Anthropic prend le relais');
chk(!!send && /var lr=iaRespond\(text\);/.test(send[0]), '4. relais KO + pas de clé → mode local (jamais bloqué)');
chk(!!send && /iaEnabled&&\(iaApiKey\|\|_freeDom\)/.test(send[0]), '4. sans clé Anthropic, une question courante part quand même au gratuit (employés)');
chk(/var CMC_IA_FREE_URL="https:\/\/apis\.kd-mc\.com\/ai";/.test(html), '4. le relais est apis.kd-mc.com/ai (Qwen Workers AI, 0 clé)');
chk(/connect-src[^"]*https:\/\/apis\.kd-mc\.com/.test(html), '4. la CSP autorise apis.kd-mc.com (sinon « Load failed »)');
chk(/d\.provider==="qwen"\?CMC_IA_FREE_LABEL/.test(html), '4. la réponse affiche qui a répondu (badge « Qwen · gratuit »)');
chk(/d\.provider==="council"\?\("Concertation gratuite · "\+nVoix\+" avis"\)/.test(html), '4. un CONSEIL de voix gratuites est annoncé avec le nombre d\'avis (Kevin 2026-09-06)');
chk(/iaEnabled&&navigator\.onLine\)\?cmcIaFreeDomain/.test(html), '4. le bouton ON/OFF de l\'IA (iaEnabled) coupe aussi le gratuit');
chk(!/x-apex-pin/.test(send[0] || '') && !/cmc_ia_key/.test((html.match(/function cmcIaFreeAsk[\s\S]*?\n\}\n/) || [''])[0]), '4. aucun code admin ni clé n\'est envoyé au relais gratuit');

R.ko.forEach((x) => console.log('  FAIL ' + x));
R.ok.forEach((x) => console.log('  OK   ' + x));
console.log(`\n=== ${R.ok.length} OK / ${R.ko.length} FAIL ===`);
process.exit(R.ko.length ? 1 : 0);
