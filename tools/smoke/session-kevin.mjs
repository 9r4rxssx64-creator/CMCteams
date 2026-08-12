/* SESSION KEVIN — « simuler ma connexion pour vérifier en réel » (Kevin 2026-08-06).
 *
 * Le problème : depuis l'agent, kd-mc.com est injoignable (egress bloqué) ; et même depuis un
 * runner CI, les pages utiles sont DERRIÈRE une connexion → on ne voyait que les écrans de login.
 * Ce module apprend au navigateur à « être Kevin » AVANT la navigation, surface par surface.
 *
 * PRINCIPE : on ne contourne aucune sécurité serveur. On repose la marque de session que l'app
 * elle-même écrit quand Kevin se connecte pour de vrai (relue dans le code de chaque app, pas
 * devinée), et pour le portail on demande un vrai pass au routeur via son API publique.
 *
 * SÉCURITÉ (non négociable)
 *  - Aucun secret dans le dépôt : le code admin arrive par variable d'environnement (secret CI).
 *  - Le hash du code n'est JAMAIS journalisé (redaction systématique).
 *  - Périmètre verrouillé sur kd-mc.com — le module refuse tout autre domaine.
 *  - Lecture seule : on regarde, on ne modifie rien dans les apps.
 *  - Honnêteté : `/__sso/issue` rend une session NOMMÉE, pas une session « admin prouvé »
 *    (l'admin prouvé exige une clé d'accès Face ID). Les zones réservées à l'admin prouvé
 *    restent donc masquées — c'est normal, et c'est dit dans le rapport.
 */

/** Domaine autorisé — toute autre cible est refusée (on ne teste QUE le domaine de Kevin). */
const DOMAINE = 'kd-mc.com';

export const ADMIN = { uid: 'U11804', apexUid: 'kdmc_admin', nom: 'Kevin DESARZENS' };

/** Ne jamais laisser fuiter un hash/jeton dans un log. */
export const masque = (s) =>
  !s ? '(absent)' : String(s).slice(0, 4) + '…' + String(s).slice(-2) + ` (${String(s).length} car.)`;

/**
 * Marques de session par app — RELUES DANS LE CODE, pas devinées :
 *  - CMCteams   : `cmc_uid` + `cmc_lastact` (index.html ~9475 : la session expire sans lastact)
 *  - Apex v13   : `apex_v13_user` + `apex_v13_last_known_uid` (services/auth/auth.ts ~283)
 *  - Admin      : `kdmc_access_pinhash` (services/kdmc-access/page.js ~63 : KEY)
 *  - Arbre      : `arbre_trust` (règle « reconnu auto après 1re connexion »)
 */
export function marquesPour(host, { pinHash } = {}) {
  const h = String(host || '').toLowerCase();
  const now = Date.now();
  if (/^cmcteams(-light)?\./.test(h)) {
    return { local: { cmc_uid: ADMIN.uid, cmc_lastact: String(now) }, note: 'session CMCteams (admin U11804)' };
  }
  if (/^apex-ai\./.test(h)) {
    return {
      local: {
        apex_v13_user: JSON.stringify({ id: ADMIN.apexUid, name: ADMIN.nom }),
        apex_v13_last_known_uid: ADMIN.apexUid,
      },
      note: 'session Apex v13 (admin)',
    };
  }
  if (/^admin\./.test(h)) {
    return pinHash
      ? { local: { kdmc_access_pinhash: pinHash }, note: 'code admin déjà déverrouillé' }
      : { local: {}, note: 'PAS de code admin fourni → la page restera sur son écran de code' };
  }
  if (/^arbre\./.test(h)) {
    return { local: { arbre_trust: '1' }, session: { arbre_unlocked: '1' }, note: 'arbre déverrouillé' };
  }
  return { local: {}, note: 'aucune connexion nécessaire' };
}

/** Applique les marques AVANT le chargement (addInitScript) → l'app démarre déjà connectée. */
export async function connecte(page, url, opts = {}) {
  const host = new URL(url).hostname;
  if (host !== DOMAINE && !host.endsWith('.' + DOMAINE)) {
    throw new Error('Périmètre : seul ' + DOMAINE + ' est autorisé (reçu ' + host + ')');
  }
  const m = marquesPour(host, opts);
  const paires = Object.entries(m.local || {});
  const sess = Object.entries(m.session || {});
  if (paires.length || sess.length) {
    await page.addInitScript(
      ([l, s]) => {
        try { l.forEach(([k, v]) => localStorage.setItem(k, v)); } catch (e) { void e; }
        try { s.forEach(([k, v]) => sessionStorage.setItem(k, v)); } catch (e) { void e; }
      },
      [paires, sess],
    );
  }
  return m;
}

/**
 * Pass SSO du portail : demande un vrai jeton au routeur (API publique, aucun secret).
 * Rend l'URL à ouvrir, avec le pass en FRAGMENT (#kdmc_sso=) — le fragment ne part jamais
 * vers un serveur et n'est pas journalisé, c'est le canal prévu pour les apps installées.
 */
export async function passPortail(base = 'https://' + DOMAINE) {
  const r = await fetch(base.replace(/\/$/, '') + '/__sso/issue', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ uid: ADMIN.uid, name: ADMIN.nom, cgu: true }),
  });
  if (!r.ok) return { ok: false, statut: r.status, note: 'le routeur a refusé /__sso/issue' };
  const d = await r.json().catch(() => ({}));
  if (!d || !d.token) return { ok: false, note: 'réponse sans jeton' };
  return {
    ok: true,
    jeton: d.token,
    masque: masque(d.token),
    url: base.replace(/\/$/, '') + '/#kdmc_sso=' + encodeURIComponent(d.token),
    /* Honnêteté : session NOMMÉE, pas « admin prouvé » (Face ID requis pour ça). */
    adminProuve: d.admin === true,
  };
}
