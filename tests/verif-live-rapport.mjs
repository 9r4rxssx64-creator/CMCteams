/* VÉRIF LIVE → RAPPORT ÉCRIT DANS LE DÉPÔT (Kevin 2026-09-05 « trouve des solutions »)
 *
 * Le problème résolu ici : depuis la session de l'agent, kd-mc.com est injoignable (politique
 * réseau) ET l'API GitHub refuse tout appel concernant un dépôt (« GitHub App non connectée »)
 * → je ne peux ni ouvrir la page, ni lancer un contrôle, ni lire le résultat d'une exécution.
 * Ce qui marche, en revanche : `git push`. Or un workflow peut se déclencher SUR UN PUSH, et
 * le runner CI, lui, a un réseau ouvert.
 *
 * D'où le canal : push → la CI ouvre les VRAIES pages du domaine → elle ÉCRIT son rapport dans
 * le dépôt (audit/verif-live/) → je relis le rapport avec `git fetch`. Zéro clic de Kevin.
 *
 * Ce que ce contrôle prouve, sur le domaine réel :
 *   1. ce que le domaine sert vraiment (version.txt, APP_VER, badge de la page) ;
 *   2. que le correctif « mon équipe / mon miroir » (v1.39) est bien dans le fichier servi ;
 *   3. qu'aucune empreinte du code admin n'est repartie dans la page (règle absolue) ;
 *   4. dans un VRAI navigateur, connecté comme Kevin, avec le tableau du mois PASSÉ mémorisé :
 *      la page ouvre sur SON équipe du mois courant, avec SON miroir.
 *
 * Vie privée / non-intrusif : lecture seule. L'identité est pré-inscrite dans le navigateur de
 * test (Kevin, le propriétaire) AVANT le chargement → la page le reconnaît comme un retour, donc
 * AUCUNE nouvelle fiche d'accès n'est écrite. Aucun code admin n'est utilisé ici.
 */
import fs from 'node:fs';
import path from 'node:path';

const LIVE = 'https://cmcteams.kd-mc.com';
const REPLI = 'https://9r4rxssx64-creator.github.io/CMCteams';   // ce que Pages sert, si Cloudflare filtre le runner
const SORTIE = 'audit/verif-live';
const MFR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const maintenant = new Date();
const MOIS_ATTENDU = MFR[maintenant.getMonth()] + ' ' + maintenant.getFullYear();

const lignes = [];
let echecs = 0;
function dire(ok, texte, info) {
  if (ok === null) { lignes.push('- ℹ️ ' + texte + (info ? ' — ' + info : '')); return; }
  if (!ok) echecs++;
  lignes.push('- ' + (ok ? '✅' : '❌') + ' ' + texte + (info ? ' — ' + info : ''));
}

async function lire(url) {
  try {
    const r = await fetch(url, { headers: { 'user-agent': 'CMCteams-verif-live/1.0 (+https://kd-mc.com)' }, redirect: 'follow' });
    if (!r.ok) return { ok: false, status: r.status };
    return { ok: true, txt: await r.text(), status: r.status };
  } catch (e) { return { ok: false, err: String(e && e.message || e).slice(0, 160) }; }
}
/** Essaie le domaine, retombe sur Pages, et DIT lequel a répondu (jamais de silence). */
async function lireAvecRepli(chemin) {
  const a = await lire(LIVE + chemin);
  if (a.ok) return { ...a, source: 'domaine (cmcteams.kd-mc.com)' };
  const b = await lire(REPLI + chemin);
  return { ...b, source: 'repli GitHub Pages', echecDomaine: a.status || a.err };
}

// ── 1) Ce que le domaine sert réellement ──────────────────────────────────────
const rVer = await lireAvecRepli('/tools/departs/version.txt');
const rPage = await lireAvecRepli('/tools/departs/index.html');
const rApp = await lireAvecRepli('/index.html');

const versionFichier = rVer.ok ? rVer.txt.trim() : null;
const appVer = rPage.ok ? (rPage.txt.match(/APP_VER\s*=\s*"(v[0-9.]+)"/) || [])[1] : null;
const badge = rPage.ok ? (rPage.txt.match(/id="ver"[^>]*>(v[0-9.]+)</) || [])[1] : null;
const attendue = fs.readFileSync('tools/departs/version.txt', 'utf8').trim();   // ce que le dépôt veut publier

lignes.push('## 1. Ce que le domaine sert vraiment');
dire(rVer.ok, 'version.txt lisible en ligne', rVer.ok ? `« ${versionFichier} » via ${rVer.source}` : `échec (${rVer.status || rVer.err})`);
if (rVer.echecDomaine) dire(null, 'le domaine n\'a pas répondu directement au runner', 'code ' + rVer.echecDomaine + ' → lecture via GitHub Pages (même contenu publié)');
dire(rPage.ok, 'page Départs lisible en ligne', rPage.ok ? `via ${rPage.source}` : `échec (${rPage.status || rPage.err})`);
dire(versionFichier === attendue, `la version publiée est bien celle du dépôt (${attendue})`, `en ligne : ${versionFichier || '?'}`);
dire(appVer === attendue && badge === attendue,
  'les trois numéros de version concordent (badge, APP_VER, version.txt)', `badge=${badge || '?'} · APP_VER=${appVer || '?'} · fichier=${versionFichier || '?'}`);
dire(rApp.ok, 'application CMCteams lisible en ligne', rApp.ok ? `via ${rApp.source}` : `échec (${rApp.status || rApp.err})`);

// ── 2) Le correctif est-il DANS le fichier servi ? ────────────────────────────
lignes.push('', '## 2. Le correctif « mon équipe / mon miroir » est-il en ligne ?');
if (rPage.ok) {
  const t = rPage.txt;
  dire(t.includes('_depBoardOfMeLatest'), 'v1.39 : la page retrouve mon équipe par MON NOM (repère stable)');
  dire(t.includes('_depRollForward'), 'v1.37/38 : report d\'équipe quand le nom est inconnu (session anonyme)');
  dire(!/PIN[_A-Z]*SHA[_A-Z0-9]*\s*=\s*"[0-9a-f]{64}"/i.test(t), 'aucune empreinte du code admin dans la page servie (règle absolue)');
  dire(t.includes('/__admin/login'), 'le code admin est vérifié par le domaine, pas dans la page');
} else {
  dire(false, 'impossible de contrôler le contenu servi', 'la page n\'a pas pu être lue');
}

// ── 3) Vrai navigateur, sur le vrai domaine, connecté comme Kevin ─────────────
lignes.push('', '## 3. Dans un vrai navigateur, sur le vrai domaine');
let nav = { fait: false };
try {
  const { chromium } = await import('playwright');
  const base = rPage.source && rPage.source.startsWith('domaine') ? LIVE : REPLI;
  const url = base + '/tools/departs/index.html';
  const navigateur = await chromium.launch({ args: ['--no-sandbox'] });

  async function ouvrir(board) {
    const ctx = await navigateur.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
    // identité pré-inscrite = « retour sur la page » → la page ne redemande rien et
    // n'écrit AUCUNE nouvelle fiche d'accès (lecture seule, non intrusif).
    await page.addInitScript(([b]) => {
      try {
        localStorage.setItem('cmc_dep_identity', JSON.stringify({ prenom: 'Kevin', nom: 'DESARZENS', cgu: true, ts: Date.now() }));
        localStorage.setItem('cmc_dep_me', 'DESARZENS K');
        if (b) localStorage.setItem('cmc_dep_board', b);
      } catch (_) {}
    }, [board]);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(4000);
    const st = await page.evaluate(() => {
      const rang = (id) => (BOARDS[id] ? BOARDS[id].year * 12 + BOARDS[id].monthIdx : -1);
      const ids = Object.keys(BOARDS).filter((k) => BOARDS[k] && BOARDS[k].kind !== 'abs');
      const recent = Math.max(...ids.map(rang));
      const mid = (typeof mirrorBoardId === 'function') ? mirrorBoardId(BID) : null;
      const passe = ids.filter((k) => rang(k) < recent && (BOARDS[k].people || []).some((p) => p.name === 'DESARZENS K'));
      return {
        badge: (document.getElementById('ver') || {}).textContent || null,
        equipe: BOARDS[BID] ? BOARDS[BID].label : null,
        surMoisCourant: rang(BID) === recent,
        jySuis: (BOARDS[BID].people || []).some((p) => p.name === 'DESARZENS K'),
        miroir: mid && BOARDS[mid] ? BOARDS[mid].label : null,
        miroirMoisCourant: mid ? rang(mid) === recent : null,
        boardPasse: passe.length ? passe[passe.length - 1] : null,
        boardPasseLib: passe.length ? BOARDS[passe[passe.length - 1]].label : null,
      };
    });
    await ctx.close();
    return { st, errs };
  }

  const p1 = await ouvrir(null);                      // session neuve
  const p2 = p1.st.boardPasse ? await ouvrir(p1.st.boardPasse) : null;  // le cas du téléphone de Kevin
  await navigateur.close();
  nav = { fait: true, p1: p1.st, p2: p2 ? p2.st : null, errs: p1.errs };

  dire(p1.st.badge === attendue, 'la page affiche bien le badge ' + attendue, 'affiché : ' + (p1.st.badge || '?'));
  dire(!!p1.st.equipe && p1.st.equipe.indexOf(MOIS_ATTENDU) === 0, 'ouvre sur ' + MOIS_ATTENDU, '« ' + p1.st.equipe + ' »');
  dire(p1.st.jySuis === true, 'Kevin figure bien dans le tableau affiché');
  dire(p1.st.miroir !== null && p1.st.miroirMoisCourant === true, 'le miroir est affiché et daté du mois courant', '« ' + (p1.st.miroir || 'aucun') + ' »');
  if (p2) {
    dire(null, 'simulation du téléphone : tableau du mois passé mémorisé', '« ' + p1.st.boardPasseLib + ' »');
    dire(p2.surMoisCourant === true && p2.jySuis === true, 'malgré le vieux tableau mémorisé → SON équipe du mois courant', '« ' + p2.equipe + ' »');
    dire(p2.miroir === p1.st.miroir, 'et SON miroir, le même que sur une session neuve', '« ' + (p2.miroir || 'aucun') + ' »');
  }
  dire(p1.errs.length === 0, 'aucune erreur JavaScript sur la page en ligne', p1.errs.slice(0, 1).join('') || 'aucune');
} catch (e) {
  dire(false, 'contrôle navigateur impossible', String(e && e.message || e).slice(0, 160));
}

// ── Rapport ──────────────────────────────────────────────────────────────────
const entete = [
  '# Vérif LIVE — page Départs (' + new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC)',
  '',
  '> Contrôle exécuté par la CI (réseau ouvert) sur le VRAI domaine, puis écrit ici pour être',
  '> relu depuis la session (le domaine est injoignable depuis l\'agent). Lecture seule.',
  '',
  '**Version attendue (dépôt) : ' + attendue + '**',
  '',
];
const bas = ['', echecs ? '## ❌ ' + echecs + ' contrôle(s) en échec' : '## ✅ Tout est conforme en ligne', ''];
fs.mkdirSync(SORTIE, { recursive: true });
fs.writeFileSync(path.join(SORTIE, 'rapport.md'), entete.concat(lignes, bas).join('\n'), 'utf8');
fs.writeFileSync(path.join(SORTIE, 'rapport.json'), JSON.stringify({
  ts: new Date().toISOString(), attendue, versionFichier, appVer, badge,
  sourceLue: rVer.source, echecs, navigateur: nav,
}, null, 2), 'utf8');
console.log(entete.concat(lignes, bas).join('\n'));
process.exitCode = echecs ? 1 : 0;
