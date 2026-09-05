/* PREUVE — « Se connecter » de KDMC Lingua dit la VÉRITÉ.
 * ===========================================================================
 * Kevin, 3.09.2026, capture à l'appui : il tape son prénom + son code sur
 * kdmc-site.pages.dev et l'app répond « Aucune sauvegarde pour ce prénom +
 * code 🤔 ». Sa phrase : « j'ai pourtant un compte ».
 *
 * CAUSE MESURÉE : la progression en ligne est servie par `/__lingua/load`, route
 * du Worker **kdmc-router** (services/kdmc-router/worker.js), sur
 * `lingua.kd-mc.com`. Quand cet appel échoue, le `.catch` renvoyait le MÊME
 * résultat que « le cloud a répondu : rien trouvé ». L'app annonçait donc une
 * perte de compte là où il n'y avait qu'un serveur injoignable. Mensonge
 * d'interface — exactement ce que la règle « toujours détailler les erreurs »
 * interdit.
 *
 * ⚠️ PRÉCISION 5.09 (mesurée, l'ancienne version de ce commentaire était fausse) :
 * `lingua.kd-mc.com` RÉSOUT bien en DNS (même IP que kd-mc.com) et le CORS de
 * `/__lingua/*` est ouvert à toutes les origines. « Domaine indisponible » n'a
 * jamais été vérifié — c'était une supposition. La cause du message reste le
 * repli fautif ci-dessus, quelle que soit la raison de l'échec de l'appel.
 *
 * Ce test charge la VRAIE page dans un vrai navigateur (aucun réseau : le
 * serveur de sauvegarde est simulé) et prouve les quatre cas :
 *   1. serveur injoignable   → « ne répond pas … n'est pas perdue »
 *   2. serveur OK mais vide  → « aucune sauvegarde », et les prénoms présents
 *      sur l'appareil sont proposés (cas « je me suis trompé de prénom »)
 *   3. stockage serveur absent (`{ok:false,reason:'kv_absent'}`, fail-open 200)
 *      → surtout PAS « aucune sauvegarde » : le compte n'est pas en cause
 *   4. sauvegarde trouvée    → on entre, sans message d'erreur
 *
 * Lancer : node tests/verify-lingua-connexion-honnete.mjs
 */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const R = { ok: [], ko: [] };
const chk = (c, m) => (c ? R.ok : R.ko).push(m);
const PAGE = 'file://' + process.cwd() + '/lingua/index.html';

/* --- garde de source : le catch ne doit PLUS se confondre avec « rien trouvé » */
const src = readFileSync('lingua/app.js', 'utf8');
chk(/injoignable:true/.test(src), 'source : le cas « serveur injoignable » existe et est distinct');
chk(/return \{ok:false,none:true\}/.test(src), 'source : le cas « le cloud a répondu, rien trouvé » reste distinct');
chk(/function localNames/.test(src), 'source : on sait lister les prénoms présents sur l\'appareil');

const nav = await chromium.launch();
const ctx = await nav.newContext();

async function essai({ cloud, comptesLocaux }) {
  const page = await ctx.newPage();
  await page.addInitScript(([cl, comptes]) => {
    /* comptes déjà présents sur cet appareil (avant tout chargement) */
    if (comptes) localStorage.setItem('lingua_g_accounts', JSON.stringify(comptes));  /* préfixe réel du stockage global : lingua_g_ */
    /* on remplace le serveur de sauvegarde : injoignable / vide / trouvé */
    const vrai = window.fetch;
    window.fetch = async (u, o) => {
      const url = String(u);
      if (url.includes('__lingua')) {
        if (cl === 'injoignable') throw new TypeError('Failed to fetch');
        if (cl === 'vide') return new Response(JSON.stringify({ ok: false }), { status: 200, headers: { 'content-type': 'application/json' } });
        /* Le serveur RÉPOND, mais son stockage (KV) est absent — worker.js:340 renvoie
           {ok:false,reason:'kv_absent'} en 200 (fail-open). Ce n'est PAS une absence de compte. */
        if (cl === 'kv') return new Response(JSON.stringify({ ok: false, reason: 'kv_absent' }), { status: 200, headers: { 'content-type': 'application/json' } });
        return new Response(JSON.stringify({ ok: true, data: { v: 2, name: 'Kevin', avatar: '🐝', syncTs: 1, data: {} } }),
          { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return vrai(u, o);
    };
  }, [cloud, comptesLocaux || null]);

  await page.goto(PAGE);
  /* on ATTEND que l'écran soit là plutôt que de deviner un délai : une machine
     lente (CI) rendait le test intermittent — 1 essai sur 6 au départ. */
  await page.waitForFunction(() => [...document.querySelectorAll('button')]
    .some((b) => /déjà un compte/i.test(b.textContent)), null, { timeout: 15000 });
  /* on clique VRAIMENT « J'ai déjà un compte », comme Kevin (le code est dans
     une IIFE : rien n'est global, donc on passe par l'interface réelle) */
  await page.evaluate(() => [...document.querySelectorAll('button')]
    .find((b) => /déjà un compte/i.test(b.textContent)).click());
  await page.waitForSelector('#lgName', { timeout: 5000 });
  await page.fill('#lgName', 'kevin desarzens');
  await page.fill('#lgCode', '200807');
  await page.evaluate(() => [...document.querySelectorAll('button')]
    .find((b) => /Retrouver mon compte/.test(b.textContent)).click());
  /* on attend le message (ou l'entrée dans l'app), sans délai fixe */
  await page.waitForFunction(() => document.querySelector('.toast') || !document.querySelector('#lgName'),
    null, { timeout: 15000 }).catch(() => {});
  /* petit temps de repos : en cas de SUCCÈS le message de bienvenue apparaît
     AVANT que la fenêtre ne se referme — lire trop tôt ferait croire qu'on
     n'est pas entré. */
  await page.waitForTimeout(500);
  /* le message est un .toast dans le DOM — on lit ce que Kevin lit */
  const messages = (await page.evaluate(() =>
    [...document.querySelectorAll('.toast')].map((t) => t.textContent))).join(' | ');
  const entre = await page.evaluate(() => !document.querySelector('#lgName'));
  await page.close();
  return { messages, entre };
}

/* --- 1. serveur injoignable (le cas réel de Kevin) ------------------------- */
let r = await essai({ cloud: 'injoignable' });
chk(/ne répond pas/i.test(r.messages) && /pas perdue/i.test(r.messages),
  `1. serveur injoignable → on dit la vérité (« ${r.messages.slice(0, 90) }… »)`);
chk(!/Aucune sauvegarde/i.test(r.messages),
  '1. et on n\'annonce PLUS « aucune sauvegarde » — c\'est ce qui a fait croire à Kevin qu\'il avait tout perdu');

/* --- 2. serveur OK mais rien, avec un compte local sous un autre prénom ---- */
/* DEUX comptes : avec un seul, le boot entre AUTOMATIQUEMENT dedans (règle
   « reconnu auto ») et l'écran de connexion n'apparaît jamais — ce qui, au
   passage, confirme le diagnostic : si Kevin voit cet écran, c'est qu'il n'a
   AUCUN compte local sur cette adresse. */
r = await essai({ cloud: 'vide', comptesLocaux: [
  { id: 'a1', name: 'Kevin', avatar: '🐝', code: '200807', created: 1 },
  { id: 'a2', name: 'Laurence', avatar: '🦊', code: '1234', created: 2 }] });
chk(/Aucune sauvegarde/i.test(r.messages), '2. serveur OK et vide → là, « aucune sauvegarde » est exact');
chk(/Kevin/.test(r.messages),
  `2. et on propose les prénoms présents sur l'appareil (« ${r.messages.slice(-70)} »)`);

/* --- 3. serveur OK mais SON stockage est absent → surtout pas « aucune sauvegarde » ---
   (placé AVANT le cas « trouvée » : celui-ci crée un compte local, et la règle « reconnu
   auto » ferait alors entrer directement sans jamais afficher l'écran de connexion.) */
r = await essai({ cloud: 'kv' });
chk(!/Aucune sauvegarde/i.test(r.messages),
  '3. stockage serveur absent → on n\'annonce PAS une perte de compte');
chk(/pas perdue/i.test(r.messages),
  `3. et on rassure sur la progression (« ${r.messages.slice(0, 90)}… »)`);

/* --- 4. sauvegarde trouvée → on entre ------------------------------------- */
r = await essai({ cloud: 'trouve' });
chk(r.entre && !/Aucune sauvegarde|ne répond pas/i.test(r.messages),
  '4. sauvegarde trouvée → on entre, sans message d\'erreur');

await nav.close();
R.ko.forEach((m) => console.log('  FAIL ' + m));
R.ok.forEach((m) => console.log('  OK   ' + m));
console.log(`\n=== ${R.ok.length} OK / ${R.ko.length} FAIL ===`);
process.exit(R.ko.length ? 1 : 0);
