/* kdmc-vente — encaisser, VÉRIFIER, livrer. Worker ISOLÉ (règle d'isolation Kevin).
 *
 * LE PROBLÈME QU'IL RÉSOUT (mesuré le 16.09.2026 sur les 6 boutiques) :
 * `processOrder()` se déclenche au CLIC sur PayPal, pas au PAIEMENT. Le stock est
 * décrémenté, la commande « confirmée », l'e-mail parti — même si le client ferme
 * l'onglet sans payer un centime. RIEN ne vérifie jamais qu'un euro est arrivé.
 *
 * TROIS CHEMINS, du plus automatique au plus manuel. Chacun marche SEUL :
 *   1. WEBHOOK PayPal  → instantané, 0 action. Le chemin normal.
 *   2. RECHERCHE PayPal → le client réclame, on interroge l'API. Rattrape un webhook
 *      perdu. ⚠️ L'API de recherche PayPal a un délai officiel de ~3 h : ce chemin
 *      ne délivre donc PAS dans la minute (c'est écrit au client, on ne ment pas).
 *   3. FILE MANUELLE   → Revolut, virement, ou PayPal non configuré. Kevin valide
 *      en 1 clic depuis admin.kd-mc.com.
 * Sans AUCUN secret PayPal, le worker fonctionne encore : tout tombe en file
 * manuelle. Une vente n'est JAMAIS bloquée par une config absente (fail-open vers
 * le manuel, jamais vers la livraison gratuite).
 *
 * ANTI-REJEU (le piège qui coûte cher) : une transaction PayPal ne délivre QU'UNE
 * fois. Sans ça, un client donne son e-mail à dix amis et ils se servent tous.
 *
 * Diagnostic exact partout (règle Kevin) : chaque échec renvoie {ok:false, detail, step}.
 */

const ALLOW_ORIGINS = [
  'https://kd-mc.com', 'https://www.kd-mc.com',
  'http://127.0.0.1:8731', 'http://localhost:8731',
];

/* ── Catalogue ───────────────────────────────────────────────────────────────
   Ajouter un produit = UNE entrée ici. `livre` est l'adresse que reçoit l'acheteur,
   le code est ajouté par le worker. Le prix sert à la VÉRIFICATION (on refuse un
   paiement de 1 € pour un produit à 39 €), avec une tolérance de 1 centime pour
   les arrondis de change. */
const PRODUITS = {
  'croupier-pro': {
    nom: 'Croupier Pro — entraînement complet aux paiements',
    prix: 39, devise: 'EUR',
    livre: 'https://croupier.kd-mc.com/entrainement.html',
    /* Ce que le code déverrouille. Servi par /contenu, JAMAIS écrit dans la page :
       un verrou en JavaScript dans un fichier public ne protège rien du tout. */
    contenu: ['roulette-combinee', 'blackjack', 'punto'],
  },
  'croupier-entretien': {
    nom: "Croupier — réussir l'entretien et les tests d'embauche",
    prix: 19, devise: 'EUR',
    livre: 'https://croupier.kd-mc.com/entretien.html',
    contenu: ['entretien'],
  },
  /* Kit IA de l'indépendant (Kevin 2026-09-16 : produit numérique NEUF, niche
     « compétences IA pour non-techniciens »). Le contenu payant vit dans la base
     D1 `kdmc-contenu` (binding CONTENU), JAMAIS dans le dépôt public : /lire le
     sert module par module contre un code valide, /apercu ne sert que le module
     marqué gratuit. */
  'kit-ia': {
    nom: "Kit IA de l'indépendant — 7 modules + 57 consignes prêtes à copier",
    prix: 47, devise: 'EUR',
    livre: 'https://kit.kd-mc.com/lire.html',
    contenu: ['kit-ia'],
  },
  /* Club IA au Boulot (Kevin 2026-09-16 « un business automatisé qui rapporte
     régulièrement ») : abonnement ANNUEL. Le kit complet + chaque semaine une
     nouvelle consigne-outil, ajoutée en base (produit 'club-ia') par la routine
     hebdomadaire. Le code dure 1 an (ttlJours), pas 2. */
  'club-ia': {
    nom: 'Club IA au Boulot — 1 an : le kit complet + une nouvelle consigne chaque semaine',
    prix: 59, devise: 'EUR',
    livre: 'https://kit.kd-mc.com/lire.html',
    contenu: ['kit-ia', 'club-ia'],
    ttlJours: 365,
  },
  /* Fabrique de produits (Kevin 2026-09-17 « d'autres niches ») : chaque fiche
     vit dans tools/produits/catalogue.json, son contenu est écrit en D1 par
     tools/produits/fabrique.mjs (CI). Prix tous DIFFÉRENTS : la caisse reconnaît
     un paiement PayPal par son montant. Même lecteur (lire.html?produit=…). */
  'bureau-ia': {
    nom: 'Kit IA au bureau — 7 modules pour les salariés qui veulent finir plus tôt',
    prix: 37, devise: 'EUR',
    livre: 'https://kit.kd-mc.com/lire.html?produit=bureau-ia',
    contenu: ['bureau-ia'],
  },
  'etudiant-ia': {
    nom: "Kit IA de l'étudiant — réviser, comprendre et rendre mieux, sans tricher",
    prix: 27, devise: 'EUR',
    livre: 'https://kit.kd-mc.com/lire.html?produit=etudiant-ia',
    contenu: ['etudiant-ia'],
  },
  'avis-ia': {
    nom: '40 réponses aux avis clients, prêtes à adapter — Google, Facebook, TripAdvisor',
    prix: 17, devise: 'EUR',
    livre: 'https://kit.kd-mc.com/lire.html?produit=avis-ia',
    contenu: ['avis-ia'],
  },
  'immo-ia': {
    nom: "Kit IA de l'agent immobilier — annonces, prospection, visites, suivi",
    prix: 67, devise: 'EUR',
    livre: 'https://kit.kd-mc.com/lire.html?produit=immo-ia',
    contenu: ['immo-ia'],
  },
};

const JOURS_RECHERCHE = 14;      // fenêtre de réclamation
const TTL_CODE = 60 * 60 * 24 * 365 * 2;  // un accès acheté dure 2 ans
const TTL_DEMANDE = 60 * 60 * 24 * 60;    // une demande en attente : 60 jours
const MAX_RECLAM_PAR_HEURE = 10;          // anti-balayage d'e-mails

/* ── Utilitaires ─────────────────────────────────────────────────────────── */
/* Une origine du domaine = n'importe quel sous-domaine HTTPS de kd-mc.com (les pages
   de vente vivent sur kit.kd-mc.com, croupier.kd-mc.com…). Mesuré le 16.09 : sans
   ça, la liste fixe renvoyait « https://kd-mc.com » à une page servie depuis un
   sous-domaine → le navigateur bloquait l'appel (CORS), la page disait « pas de réseau ». */
function origineDuDomaine(origin) {
  return /^https:\/\/([a-z0-9-]+\.)*kd-mc\.com$/.test(String(origin || ''));
}
function cors(origin) {
  const ok = ALLOW_ORIGINS.includes(origin) || origineDuDomaine(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin : ALLOW_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}
function json(obj, status, origin) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...cors(origin) },
  });
}
function nettoieEmail(v) {
  return String(v || '').trim().toLowerCase().slice(0, 160);
}
function emailPlausible(v) {
  return /^[^@\s]+@[^@\s.]+\.[^@\s]{2,}$/.test(v);
}
/* Code lisible au téléphone : pas de 0/O ni 1/I/L, qu'on confond en dictant. */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function nouveauCode() {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  let s = '';
  for (let i = 0; i < 16; i++) {
    if (i === 4 || i === 8 || i === 12) s += '-';
    s += ALPHABET[b[i] % ALPHABET.length];
  }
  return s;
}
function memeMontant(paye, attendu) {
  return Math.abs(Number(paye) - Number(attendu)) <= 0.01;
}

/* ── PayPal REST (côté serveur — le secret ne quitte jamais le worker) ─────── */
const PP_BASE = 'https://api-m.paypal.com';

async function ppToken(env) {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_SECRET) throw new Error('paypal_non_configure');
  const basic = btoa(env.PAYPAL_CLIENT_ID + ':' + env.PAYPAL_SECRET);
  const r = await fetch(PP_BASE + '/v1/oauth2/token', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + basic, 'content-type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  if (!r.ok) throw new Error('token HTTP ' + r.status);
  const j = await r.json();
  if (!j.access_token) throw new Error('token sans access_token');
  return j.access_token;
}

/* Cherche une transaction RÉUSSIE de cet e-mail, du bon montant, dans la fenêtre.
   Renvoie {trouve:true, tx} ou {trouve:false, raison}. Ne lève jamais pour un
   simple « pas trouvé » — seulement pour une vraie panne. */
async function ppChercheTransaction(env, email, produit) {
  const token = await ppToken(env);
  const fin = new Date();
  const debut = new Date(fin.getTime() - JOURS_RECHERCHE * 864e5);
  const q = new URLSearchParams({
    start_date: debut.toISOString().replace(/\.\d+Z$/, 'Z'),
    end_date: fin.toISOString().replace(/\.\d+Z$/, 'Z'),
    fields: 'transaction_info,payer_info',
    transaction_status: 'S',
    page_size: '100',
  });
  const r = await fetch(PP_BASE + '/v1/reporting/transactions?' + q, {
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' },
  });
  if (!r.ok) throw new Error('recherche HTTP ' + r.status);
  const j = await r.json();
  const lignes = (j && j.transaction_details) || [];
  let vuEmail = false;
  for (const l of lignes) {
    const info = l.transaction_info || {};
    const payeur = (l.payer_info && l.payer_info.email_address) || '';
    if (nettoieEmail(payeur) !== email) continue;
    vuEmail = true;
    const montant = Math.abs(Number((info.transaction_amount && info.transaction_amount.value) || 0));
    const devise = (info.transaction_amount && info.transaction_amount.currency_code) || '';
    if (devise !== produit.devise) continue;
    if (!memeMontant(montant, produit.prix)) continue;
    return { trouve: true, tx: { id: info.transaction_id, montant, devise, date: info.transaction_initiation_date } };
  }
  return { trouve: false, raison: vuEmail ? 'montant_ne_correspond_pas' : 'aucun_paiement_a_ce_nom' };
}

/* Vérifie la signature d'un webhook auprès de PayPal (jamais de confiance aveugle :
   sans ça, n'importe qui poste un faux « payé » et se sert). */
async function ppVerifieWebhook(env, req, corps) {
  if (!env.PAYPAL_WEBHOOK_ID) return { ok: false, detail: 'PAYPAL_WEBHOOK_ID absent', step: 'webhook_config' };
  let token;
  try { token = await ppToken(env); }
  catch (e) { return { ok: false, detail: String(e.message || e), step: 'webhook_token' }; }
  const h = (n) => req.headers.get(n) || '';
  const r = await fetch(PP_BASE + '/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'content-type': 'application/json' },
    body: JSON.stringify({
      auth_algo: h('paypal-auth-algo'),
      cert_url: h('paypal-cert-url'),
      transmission_id: h('paypal-transmission-id'),
      transmission_sig: h('paypal-transmission-sig'),
      transmission_time: h('paypal-transmission-time'),
      webhook_id: env.PAYPAL_WEBHOOK_ID,
      webhook_event: corps,
    }),
  });
  if (!r.ok) return { ok: false, detail: 'verify HTTP ' + r.status, step: 'webhook_verify' };
  const j = await r.json();
  if (j.verification_status !== 'SUCCESS') return { ok: false, detail: 'signature ' + j.verification_status, step: 'webhook_signature' };
  return { ok: true };
}

/* ── Délivrance ──────────────────────────────────────────────────────────── */
/* Anti-rejeu : si cette transaction a déjà délivré, on renvoie LE MÊME code
   (le client qui recharge sa page ne doit pas être puni) mais on n'en crée pas
   un second. */
async function delivre(env, { produitId, email, source, txId }) {
  const produit = PRODUITS[produitId];
  if (!produit) return { ok: false, status: 404, detail: 'produit inconnu: ' + produitId, step: 'catalogue' };

  if (txId) {
    const deja = await env.VENTES.get('tx:' + txId);
    if (deja) return { ok: true, code: deja, deja_delivre: true, livre: produit.livre };
  }
  const code = nouveauCode();
  const ttl = produit.ttlJours ? produit.ttlJours * 86400 : TTL_CODE;
  const fiche = {
    produit: produitId, email: email || null, source,
    tx: txId || null, ts: Date.now(), ts_iso: new Date().toISOString(),
    expire_iso: new Date(Date.now() + ttl * 1000).toISOString(),
  };
  await env.VENTES.put('code:' + code, JSON.stringify(fiche), { expirationTtl: ttl });
  if (txId) await env.VENTES.put('tx:' + txId, code, { expirationTtl: ttl });
  /* Le code arrive aussi par e-mail (sinon un client qui ferme l'onglet le perd),
     et la fiche abonné va en base D1 : c'est elle que la routine hebdomadaire lit
     pour prévenir les abonnés du Club. Les deux sont best-effort : une panne
     d'e-mail ou de base ne bloque JAMAIS une livraison payée. */
  const email_envoye = email ? await envoieCode(env, { email, produit, code }) : false;
  await noteAbonne(env, { code, email, produitId, source, fiche, email_envoye });
  return { ok: true, code, deja_delivre: false, livre: produit.livre, email_envoye };
}

/* EmailJS (clé privée EMAILJS_PRIVATE_KEY poussée par le workflow ; le service et le
   gabarit sont ceux déjà utilisés par les boutiques). Renvoie true/false, ne lève jamais. */
const EMAILJS = { service: 'service_4s16z8l', template: 'template_fzva9uf', user: 'nUso3vcsGadvrWTtC' };
async function envoieCode(env, { email, produit, code }) {
  if (!env.EMAILJS_PRIVATE_KEY) return false;
  try {
    const r = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS.service, template_id: EMAILJS.template, user_id: EMAILJS.user,
        accessToken: env.EMAILJS_PRIVATE_KEY,
        template_params: {
          to_email: email, store: 'kd-mc.com', name: 'kd-mc.com', from_name: 'kd-mc.com',
          title: 'Ton accès : ' + produit.nom,
          message: 'Merci pour ton achat : ' + produit.nom + '.\nTon code d\'accès : ' + code +
            '\nOuvre ton accès ici : ' + produit.livre + (produit.livre.indexOf('?') >= 0 ? '&' : '?') + 'c=' + code +
            '\nGarde ce message : le code ouvre ton accès sur tous tes appareils.',
        },
      }),
    });
    return r.ok;
  } catch (_) { return false; }
}
async function noteAbonne(env, { code, email, produitId, source, fiche, email_envoye }) {
  if (!env.CONTENU || typeof env.CONTENU.prepare !== 'function') return false;
  try {
    await env.CONTENU.prepare('INSERT OR REPLACE INTO abonnes (code, email, produit, source, ts, expire, email_envoye) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)')
      .bind(code, email || null, produitId, source || null, fiche.ts_iso, fiche.expire_iso, email_envoye ? 1 : 0).run();
    return true;
  } catch (_) { return false; }
}

/* ── Garde-fou de débit (anti-balayage d'e-mails sur /reclamer) ───────────── */
async function tropDeTentatives(env, ip) {
  const cle = 'debit:' + ip + ':' + Math.floor(Date.now() / 36e5);
  const n = Number((await env.VENTES.get(cle)) || 0);
  if (n >= MAX_RECLAM_PAR_HEURE) return true;
  await env.VENTES.put(cle, String(n + 1), { expirationTtl: 7200 });
  return false;
}

/* ── SSO admin vérifié (même modèle que kdmc-balances, leçon #99) ─────────── */
async function requireAdmin(req) {
  const auth = req.headers.get('Authorization') || '';
  if (!/^Bearer\s+\S/.test(auth)) return { ok: false, status: 401, detail: 'pass SSO manquant', step: 'auth_header' };
  try {
    const r = await fetch('https://kd-mc.com/__sso/whoami', { headers: { Authorization: auth }, cache: 'no-store' });
    if (!r.ok) return { ok: false, status: 502, detail: 'whoami HTTP ' + r.status, step: 'whoami_fetch' };
    const j = await r.json();
    if (!j || !j.ok) return { ok: false, status: 401, detail: 'session invalide', step: 'whoami_session' };
    if (!j.admin || !j.verified) return { ok: false, status: 403, detail: 'réservé admin vérifié', step: 'whoami_admin' };
    return { ok: true, name: j.name };
  } catch (e) {
    return { ok: false, status: 502, detail: String((e && e.message) || e).slice(0, 120), step: 'whoami_exc' };
  }
}

/* ── Contenu payant (D1) ─────────────────────────────────────────────────
   Table `contenu` (produit, id, ordre, titre, html, gratuit, maj). Le HTML est
   rédigé par nous, jamais par un client : il est servi tel quel. Sans binding
   CONTENU (worker déployé sans la base), on le DIT au lieu de servir du vide. */
async function lireContenu(env, produitId, { gratuitSeulement }) {
  if (!env.CONTENU || typeof env.CONTENU.prepare !== 'function') {
    return { ok: false, status: 503, error: 'contenu_indisponible', detail: 'base de contenu non branchée (binding CONTENU absent)', step: 'contenu_binding' };
  }
  try {
    /* Un produit peut débloquer plusieurs contenus (le Club = le kit + les
       consignes hebdomadaires). Chaque id de contenu est un produit en base. */
    const prod = PRODUITS[produitId];
    const cles = (prod && prod.contenu && prod.contenu.length) ? prod.contenu : [produitId];
    const marques = cles.map((_, i) => '?' + (i + 1)).join(', ');
    const sql = 'SELECT produit, id, ordre, titre, html, gratuit FROM contenu WHERE produit IN (' + marques + ')' + (gratuitSeulement ? ' AND gratuit = 1' : '') + ' ORDER BY ordre';
    const res = await env.CONTENU.prepare(sql).bind(...cles).all();
    const lignes = (res && res.results) || [];
    const somm = await env.CONTENU.prepare('SELECT produit, id, ordre, titre, gratuit FROM contenu WHERE produit IN (' + marques + ') ORDER BY ordre').bind(...cles).all();
    return {
      ok: true,
      modules: lignes.map((l) => ({ id: l.id, ordre: l.ordre, titre: l.titre, html: l.html, gratuit: !!l.gratuit, source: l.produit })),
      sommaire: ((somm && somm.results) || []).map((l) => ({ id: l.id, ordre: l.ordre, titre: l.titre, gratuit: !!l.gratuit, source: l.produit })),
    };
  } catch (e) {
    return { ok: false, status: 500, error: 'contenu_lecture', detail: String((e && e.message) || e).slice(0, 160), step: 'contenu_sql' };
  }
}

/* ── Routes ──────────────────────────────────────────────────────────────── */
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin') || '';
    const p = url.pathname;
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });

    /* --- Santé : dit la VÉRITÉ sur ce qui est configuré ------------------- */
    if (p === '/health') {
      return json({
        contenu_prive: !!(env.CONTENU && typeof env.CONTENU.prepare === 'function'),
        email_code: Boolean(env.EMAILJS_PRIVATE_KEY),
        ok: true, service: 'kdmc-vente',
        paypal_recherche: Boolean(env.PAYPAL_CLIENT_ID && env.PAYPAL_SECRET),
        paypal_webhook: Boolean(env.PAYPAL_WEBHOOK_ID),
        produits: Object.keys(PRODUITS),
      }, 200, origin);
    }

    /* --- Catalogue public ------------------------------------------------- */
    if (p === '/produits') {
      return json({
        ok: true,
        produits: Object.entries(PRODUITS).map(([id, v]) => ({ id, nom: v.nom, prix: v.prix, devise: v.devise })),
      }, 200, origin);
    }

    /* --- Webhook PayPal : le chemin INSTANTANÉ ---------------------------- */
    if (p === '/webhook/paypal' && req.method === 'POST') {
      let corps;
      try { corps = await req.json(); }
      catch (e) { return json({ ok: false, error: 'json', detail: String(e.message || e), step: 'webhook_body' }, 400, origin); }

      const v = await ppVerifieWebhook(env, req, corps);
      /* Un webhook non vérifiable est IGNORÉ (200 pour que PayPal ne réessaie pas
         en boucle) mais jamais honoré : on ne délivre pas sur parole. */
      if (!v.ok) return json({ ok: false, ignore: true, detail: v.detail, step: v.step }, 200, origin);

      const t = corps.event_type || '';
      if (t !== 'PAYMENT.CAPTURE.COMPLETED' && t !== 'CHECKOUT.ORDER.APPROVED') {
        return json({ ok: true, ignore: true, detail: 'événement non traité: ' + t, step: 'webhook_type' }, 200, origin);
      }
      const res = corps.resource || {};
      const txId = res.id || null;
      const montant = Number((res.amount && res.amount.value) || 0);
      const devise = (res.amount && res.amount.currency_code) || '';
      const email = nettoieEmail((res.payer && res.payer.email_address) || (corps.summary || ''));

      /* Quel produit ? Le montant + la devise suffisent tant que deux produits
         n'ont pas le même prix (vérifié par un test). */
      const trouve = Object.entries(PRODUITS).find(([, v]) => v.devise === devise && memeMontant(montant, v.prix));
      if (!trouve) {
        await env.VENTES.put('demande:' + (txId || crypto.randomUUID()), JSON.stringify({
          produit: null, email: email || null, methode: 'paypal-webhook', montant, devise,
          etat: 'a_trier', detail: 'montant sans produit correspondant',
          ts: Date.now(), ts_iso: new Date().toISOString(),
        }), { expirationTtl: TTL_DEMANDE });
        return json({ ok: true, en_attente: true, detail: 'montant ' + montant + ' ' + devise + ' sans produit — mis en file', step: 'webhook_produit' }, 200, origin);
      }
      const d = await delivre(env, { produitId: trouve[0], email: email || null, source: 'paypal-webhook', txId });
      if (!d.ok) return json(d, d.status || 500, origin);
      return json({ ok: true, produit: trouve[0], deja_delivre: d.deja_delivre }, 200, origin);
    }

    /* --- Réclamation client : « j'ai payé » ------------------------------- */
    if (p === '/reclamer' && req.method === 'POST') {
      let b;
      try { b = await req.json(); }
      catch (e) { return json({ ok: false, error: 'json', detail: String(e.message || e), step: 'reclam_body' }, 400, origin); }

      const produitId = String(b.produit || '');
      const produit = PRODUITS[produitId];
      if (!produit) return json({ ok: false, error: 'produit', detail: 'produit inconnu: ' + produitId, step: 'reclam_produit' }, 404, origin);

      const methode = String(b.methode || 'paypal').toLowerCase();
      const email = nettoieEmail(b.email);
      if (!emailPlausible(email)) {
        return json({ ok: false, error: 'email', detail: 'adresse e-mail incomplète', step: 'reclam_email' }, 400, origin);
      }

      const ip = req.headers.get('CF-Connecting-IP') || 'inconnue';
      if (await tropDeTentatives(env, ip)) {
        return json({ ok: false, error: 'trop_de_tentatives', detail: 'trop d\'essais dans l\'heure, réessaie plus tard', step: 'reclam_debit' }, 429, origin);
      }

      /* Chemin automatique : seulement PayPal, seulement si configuré. */
      if (methode === 'paypal' && env.PAYPAL_CLIENT_ID && env.PAYPAL_SECRET) {
        try {
          const rech = await ppChercheTransaction(env, email, produit);
          if (rech.trouve) {
            const d = await delivre(env, { produitId, email, source: 'paypal-recherche', txId: rech.tx.id });
            if (!d.ok) return json(d, d.status || 500, origin);
            return json({ ok: true, verifie: true, code: d.code, livre: d.livre, deja_delivre: d.deja_delivre, email_envoye: !!d.email_envoye }, 200, origin);
          }
          /* Pas trouvé ≠ pas payé : l'API PayPal a ~3 h de retard. On le DIT. */
          const id = crypto.randomUUID();
          await env.VENTES.put('demande:' + id, JSON.stringify({
            id, produit: produitId, email, methode, etat: 'en_attente',
            detail: rech.raison, ts: Date.now(), ts_iso: new Date().toISOString(),
          }), { expirationTtl: TTL_DEMANDE });
          return json({
            ok: true, verifie: false, en_attente: true, demande: id,
            detail: rech.raison === 'montant_ne_correspond_pas'
              ? 'un paiement à ce nom existe mais pas du bon montant — Kevin vérifie'
              : 'paiement pas encore visible (PayPal met jusqu\'à 3 h à publier ses transactions) — tu recevras ton accès dès qu\'il apparaît',
            step: 'reclam_non_trouve',
          }, 200, origin);
        } catch (e) {
          /* Panne PayPal → file manuelle. Une vente n'est jamais perdue. */
          const id = crypto.randomUUID();
          await env.VENTES.put('demande:' + id, JSON.stringify({
            id, produit: produitId, email, methode, etat: 'en_attente',
            detail: 'panne vérification: ' + String(e.message || e).slice(0, 120),
            ts: Date.now(), ts_iso: new Date().toISOString(),
          }), { expirationTtl: TTL_DEMANDE });
          return json({ ok: true, verifie: false, en_attente: true, demande: id, detail: 'vérification indisponible — Kevin valide à la main sous peu', step: 'reclam_panne' }, 200, origin);
        }
      }

      /* Revolut, virement, ou PayPal non configuré → file manuelle. */
      const id = crypto.randomUUID();
      await env.VENTES.put('demande:' + id, JSON.stringify({
        id, produit: produitId, email, methode, etat: 'en_attente',
        reference: String(b.reference || '').slice(0, 80),
        detail: methode === 'paypal' ? 'vérification PayPal non configurée' : 'méthode sans vérification automatique',
        ts: Date.now(), ts_iso: new Date().toISOString(),
      }), { expirationTtl: TTL_DEMANDE });
      return json({ ok: true, verifie: false, en_attente: true, demande: id, detail: 'demande enregistrée — Kevin valide et tu reçois ton accès', step: 'reclam_manuel' }, 200, origin);
    }

    /* --- Accès : le client présente son code ------------------------------ */
    if (p === '/acces') {
      const code = String(url.searchParams.get('c') || '').trim().toUpperCase();
      if (!code) return json({ ok: false, error: 'code', detail: 'code absent', step: 'acces_code' }, 400, origin);
      const brut = await env.VENTES.get('code:' + code);
      if (!brut) return json({ ok: false, error: 'invalide', detail: 'code inconnu ou expiré', step: 'acces_inconnu' }, 404, origin);
      let f; try { f = JSON.parse(brut); } catch (_) { f = null; }
      if (!f || !PRODUITS[f.produit]) return json({ ok: false, error: 'invalide', detail: 'fiche illisible', step: 'acces_fiche' }, 500, origin);
      const prod = PRODUITS[f.produit];
      return json({ ok: true, produit: f.produit, nom: prod.nom, livre: prod.livre, depuis: f.ts_iso }, 200, origin);
    }

    /* --- Contenu payant : servi UNIQUEMENT contre un code valide ---------- */
    if (p === '/contenu') {
      const code = String(url.searchParams.get('c') || '').trim().toUpperCase();
      if (!code) return json({ ok: false, error: 'code', detail: 'code absent', step: 'contenu_code' }, 400, origin);
      const brut = await env.VENTES.get('code:' + code);
      if (!brut) return json({ ok: false, error: 'invalide', detail: 'code inconnu ou expiré', step: 'contenu_inconnu' }, 404, origin);
      let f; try { f = JSON.parse(brut); } catch (_) { f = null; }
      const prod = f && PRODUITS[f.produit];
      if (!prod) return json({ ok: false, error: 'invalide', detail: 'fiche illisible', step: 'contenu_fiche' }, 500, origin);
      return json({ ok: true, produit: f.produit, debloque: prod.contenu || [] }, 200, origin);
    }

    /* --- Aperçu gratuit : les modules marqués gratuits, sans code --------- */
    if (p === '/apercu') {
      const produitId = String(url.searchParams.get('produit') || '');
      if (!PRODUITS[produitId]) return json({ ok: false, error: 'produit', detail: 'produit inconnu: ' + produitId, step: 'apercu_produit' }, 404, origin);
      const r = await lireContenu(env, produitId, { gratuitSeulement: true });
      if (!r.ok) return json(r, r.status || 500, origin);
      return json({ ok: true, produit: produitId, nom: PRODUITS[produitId].nom, prix: PRODUITS[produitId].prix, modules: r.modules, sommaire: r.sommaire }, 200, origin);
    }

    /* --- Lecture payante : TOUT le produit, contre un code valide --------- */
    if (p === '/lire') {
      const code = String(url.searchParams.get('c') || '').trim().toUpperCase();
      if (!code) return json({ ok: false, error: 'code', detail: 'code absent', step: 'lire_code' }, 400, origin);
      const brut = await env.VENTES.get('code:' + code);
      if (!brut) return json({ ok: false, error: 'invalide', detail: 'code inconnu ou expiré', step: 'lire_inconnu' }, 404, origin);
      let f; try { f = JSON.parse(brut); } catch (_) { f = null; }
      const prod = f && PRODUITS[f.produit];
      if (!prod) return json({ ok: false, error: 'invalide', detail: 'fiche illisible', step: 'lire_fiche' }, 500, origin);
      const r = await lireContenu(env, f.produit, { gratuitSeulement: false });
      if (!r.ok) return json(r, r.status || 500, origin);
      return json({ ok: true, produit: f.produit, nom: prod.nom, modules: r.modules, sommaire: r.sommaire }, 200, origin);
    }

    /* --- Admin : la file d'attente --------------------------------------- */
    if (p === '/admin/file') {
      const g = await requireAdmin(req);
      if (!g.ok) return json({ ok: false, error: 'forbidden', detail: g.detail, step: g.step }, g.status, origin);
      const liste = await env.VENTES.list({ prefix: 'demande:', limit: 200 });
      const demandes = [];
      for (const k of liste.keys) {
        const v = await env.VENTES.get(k.name);
        if (!v) continue;
        try { demandes.push(JSON.parse(v)); } catch (_) { /* ligne illisible : on l'ignore, on ne casse pas la file */ }
      }
      demandes.sort((a, b) => (b.ts || 0) - (a.ts || 0));
      return json({ ok: true, demandes }, 200, origin);
    }

    /* --- Admin : valider en 1 clic ---------------------------------------- */
    if (p === '/admin/valider' && req.method === 'POST') {
      const g = await requireAdmin(req);
      if (!g.ok) return json({ ok: false, error: 'forbidden', detail: g.detail, step: g.step }, g.status, origin);
      let b; try { b = await req.json(); }
      catch (e) { return json({ ok: false, error: 'json', detail: String(e.message || e), step: 'valider_body' }, 400, origin); }
      const id = String(b.demande || '');
      const brut = await env.VENTES.get('demande:' + id);
      if (!brut) return json({ ok: false, error: 'introuvable', detail: 'demande inconnue: ' + id, step: 'valider_demande' }, 404, origin);
      let d; try { d = JSON.parse(brut); } catch (_) { d = null; }
      if (!d) return json({ ok: false, error: 'illisible', detail: 'fiche demande illisible', step: 'valider_parse' }, 500, origin);

      if (b.refuser) {
        await env.VENTES.delete('demande:' + id);
        return json({ ok: true, refuse: true }, 200, origin);
      }
      const produitId = String(b.produit || d.produit || '');
      const dd = await delivre(env, { produitId, email: d.email, source: 'admin:' + g.name, txId: null });
      if (!dd.ok) return json(dd, dd.status || 500, origin);
      await env.VENTES.delete('demande:' + id);
      return json({ ok: true, code: dd.code, livre: dd.livre, produit: produitId, email_envoye: !!dd.email_envoye }, 200, origin);
    }

    return json({ ok: false, error: 'not_found', detail: 'route inconnue: ' + p, step: 'routage' }, 404, origin);
  },
};

/* Export pour les tests hors-ligne (le worker n'en dépend pas). */
export const __test = { PRODUITS, nouveauCode, memeMontant, nettoieEmail, emailPlausible, ALPHABET, origineDuDomaine, lireContenu, envoieCode, EMAILJS };
