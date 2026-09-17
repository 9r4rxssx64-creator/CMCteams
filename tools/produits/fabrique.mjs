#!/usr/bin/env node
/* fabrique.mjs — la fabrique de produits numériques (Kevin 2026-09-17 « d'autres
   niches, encore du contenu qui rapporte »).

   Une fiche PUBLIQUE (catalogue.json : titres, briefs, prix) → pour chaque module,
   l'API Anthropic rédige un fragment HTML → contrôle automatique (3 essais, sinon
   RIEN n'est écrit) → écriture en base D1 kdmc-contenu (table `contenu`, produit
   = id de la fiche). Le contenu payant ne touche JAMAIS le dépôt public.

   Même moteur que le Club (tools/club/semaine.mjs : d1, redige, nettoieSortie),
   jamais recopié (leçon #142).

   Usage (CI, jamais depuis l'agent : le runner a le réseau, l'agent non) :
     PRODUIT=bureau-ia DRY_RUN=true  node tools/produits/fabrique.mjs   # lit la base, n'écrit rien, n'appelle pas l'IA
     PRODUIT=bureau-ia DRY_RUN=false node tools/produits/fabrique.mjs   # rédige les modules MANQUANTS et les écrit
     REFAIRE=m3 … réécrit un module précis (par défaut : jamais d'écrasement).
   Dernière ligne du journal (la seule preuve lue par la routine / le workflow) :
     PRODUIT PUBLIÉ <id> : n/n modules   ·   PRODUIT SIMULÉ <id> : …   ·   PRODUIT COMPLET <id> (rien à faire) */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { d1, redige, nettoieSortie } from '../club/semaine.mjs';

export const CATALOGUE = new URL('./catalogue.json', import.meta.url);
export const ESSAIS = 3;
const AUTORISEES = new Set(['h2', 'h3', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'pre', 'div', 'table', 'tr', 'td', 'th', 'br', 'thead', 'tbody']);

export function lireCatalogue(url = CATALOGUE) {
  const c = JSON.parse(readFileSync(url, 'utf8'));
  if (!Array.isArray(c.produits)) throw new Error('catalogue : « produits » manquant');
  return c;
}
export function fiche(id, catalogue = lireCatalogue()) {
  const p = catalogue.produits.find((x) => x.id === id);
  if (!p) throw new Error('produit inconnu dans le catalogue : ' + id + ' (connus : ' + catalogue.produits.map((x) => x.id).join(', ') + ')');
  return p;
}
export function idModule(index) { return 'm' + (index + 1); }

/* ── Contrôle de vérité (porte AVANT toute écriture) ─────────────────────── */
export function valideModule(html, { produit, index, module }) {
  const h = String(html || '');
  const erreurs = [];
  const [cMin, cMax] = produit.consignes || [2, 5];
  const exMin = produit.exemplesMin || cMin;
  const tags = [...h.matchAll(/<\/?([a-zA-Z0-9]+)/g)].map((m) => m[1].toLowerCase());
  const interdites = [...new Set(tags.filter((t) => !AUTORISEES.has(t)))];
  if (interdites.length) erreurs.push('balises interdites : ' + interdites.join(', '));
  if (/<script|javascript:|\son[a-z]+\s*=|<a\s|<img|<iframe/i.test(h)) erreurs.push('script, lien, image ou gestionnaire d\'événement interdit');
  const attendu = '<h2>Module ' + (index + 1) + ' — ';
  if (!h.trimStart().startsWith(attendu)) erreurs.push('doit commencer par « ' + attendu + 'Titre</h2> »');
  if (!/<p class="promesse">/.test(h)) erreurs.push('<p class="promesse"> manquante');
  const consignes = (h.match(/<pre class="consigne">/g) || []).length;
  if (consignes < cMin) erreurs.push('il faut au moins ' + cMin + ' consigne(s) prête(s) à copier (trouvé ' + consignes + ')');
  if (consignes > cMax) erreurs.push('au plus ' + cMax + ' consignes (trouvé ' + consignes + ')');
  const exemples = (h.match(/<div class="exemple">/g) || []).length;
  if (exemples < Math.max(exMin, consignes)) erreurs.push('il faut au moins ' + Math.max(exMin, consignes) + ' <div class="exemple"> (trouvé ' + exemples + ')');
  if ((h.match(/<div class="attention">/g) || []).length !== 1) erreurs.push('exactement un <div class="attention">');
  if ((h.match(/<div class="check">/g) || []).length !== 1) erreurs.push('exactement un <div class="check">');
  if (!/☐/.test(h)) erreurs.push('la checklist doit avoir des cases ☐');
  if (/\bprompts?\b/i.test(h)) erreurs.push('le mot « prompt » est interdit (dire « consigne »)');
  if (/\[(A|À) (COMPLETER|COMPLÉTER|REMPLIR)\]/i.test(h)) erreurs.push('trou [À COMPLÉTER] laissé dans le texte');
  const emoji = (h.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || []).filter((e) => e !== '☐');
  if (emoji.length) erreurs.push('émoji interdit (' + emoji.length + ')');
  const texte = h.replace(/<pre class="consigne">[\s\S]*?<\/pre>/g, ' ').replace(/<[^>]+>/g, ' ');
  const mots = texte.split(/\s+/).filter(Boolean).length;
  if (mots < 450) erreurs.push('trop court : ' + mots + ' mots hors consignes (450 minimum)');
  if (mots > 1800) erreurs.push('trop long : ' + mots + ' mots hors consignes (1800 maximum)');
  const accents = (texte.match(/[àâäéèêëîïôöùûüçœ]/gi) || []).length;
  if (accents < 25) erreurs.push('accents absents ou trop rares (' + accents + ')');
  if (/\b(\d{1,3}\s?%|TVA|URSSAF|article L\.?\s?\d|loi [A-Z][a-z]+)/.test(texte) && !/service-public\.fr/.test(h)) {
    erreurs.push('un chiffre, un taux ou un point légal est cité sans renvoi à service-public.fr');
  }
  if (/(rendement|plus-value) (garanti|assuré)/i.test(texte)) erreurs.push('promesse de rendement ou de plus-value interdite');
  const m = h.match(/<h2>\s*Module \d+ — ([^<]+?)\s*<\/h2>/);
  const titre = m ? m[1].trim() : '';
  if (!titre) erreurs.push('titre introuvable');
  return { ok: erreurs.length === 0, erreurs, mots, consignes, exemples, titre };
}

/* ── La consigne de rédaction d'un module ────────────────────────────────── */
export function consigneModule({ produit, index, module, titresFaits = [] }) {
  const [cMin, cMax] = produit.consignes || [2, 5];
  const exMin = produit.exemplesMin || cMin;
  const n = index + 1;
  return [
    'Tu écris le module ' + n + ' sur ' + produit.modules.length + ' du produit numérique « ' + produit.nom + ' ».',
    'LECTEUR : ' + produit.cible + '. Tutoiement. Français simple avec TOUS les accents. Il lit sur son iPhone.',
    'Zéro jargon : jamais « prompt », « LLM », « token » — dire « consigne », « assistant IA ». Outils : ChatGPT, Claude, Gemini en version gratuite.',
    'PROMESSE DU PRODUIT : ' + produit.promesse,
    '',
    'CE MODULE : « ' + module.titre + ' ». Il doit couvrir : ' + module.brief + '.',
    (titresFaits.length ? 'Modules déjà écrits (ne pas répéter leur contenu) : ' + titresFaits.map((t) => '« ' + t + ' »').join(', ') + '.' : ''),
    '',
    'FORMAT = UN SEUL FRAGMENT HTML (pas de <html>/<head>/<body>, pas de ``` autour), balises autorisées :',
    'h2, h3, p, ul, ol, li, strong, em, pre (class="consigne"), div (class="exemple" | "attention" | "check"), table. Aucun lien, aucune image.',
    '1. Commencer EXACTEMENT par : <h2>Module ' + n + ' — ' + module.titre + '</h2> puis <p class="promesse"> d\'une phrase : ce que le lecteur SAIT FAIRE à la fin.',
    '2. Pourquoi ça change sa journée : 3 à 5 lignes concrètes, une situation vécue.',
    '3. La méthode pas à pas : <ol> de 4 à 6 étapes, chaque étape = ce qu\'il tape ou touche sur son téléphone.',
    '4. LES CONSIGNES PRÊTES À COPIER : entre ' + cMin + ' et ' + cMax + ', chacune précédée d\'un <h3> qui dit le résultat obtenu, dans',
    '   <pre class="consigne"> … </pre> avec des crochets [à remplacer] pour les variables. Chaque consigne est COMPLÈTE et',
    '   autonome (on la colle telle quelle) : rôle, contexte, ce qu\'on veut, le ton, la longueur, le format de sortie.',
    '5. LES EXEMPLES : au moins ' + Math.max(exMin, cMin) + ' <div class="exemple"> avec un exemple RÉEL de résultat (4 à 10 lignes chacun),',
    '   un exemple sous chaque consigne' + (exMin > cMax ? ' ET des variantes supplémentaires quand le module en promet (« dix variantes » = dix exemples courts, chacun dans son <div class="exemple">)' : '') + '.',
    '6. <div class="attention"> : 3 pièges (jamais coller de nom, d\'adresse, de numéro de carte, de mot de passe, de données de santé',
    '   d\'une personne réelle ; relire avant d\'envoyer ; l\'IA peut inventer un chiffre ou une référence).',
    '7. <div class="check"> : checklist de 4 à 6 cases commençant par ☐.',
    'Longueur : 600 à 1400 mots hors consignes. Zéro émoji (sauf ☐). Pas de titre « Conclusion ».',
    'VÉRITÉ ABSOLUE : rien d\'inventé, aucun conseil juridique, fiscal, médical ou financier affirmatif ; si un point touche la loi,',
    'écrire « vérifie sur service-public.fr » et ne citer AUCUN chiffre, taux ni article de mémoire. Pas de nom de personne réelle,',
    'pas de marque de client, pas de promesse de rendement. Aucun trou du type [À COMPLÉTER] : le texte est fini.',
    'Réponds UNIQUEMENT par le fragment HTML.',
  ].filter((l) => l !== '').join('\n');
}

/* ── Rédaction avec contrôle (3 essais, sinon on n'écrit RIEN) ───────────── */
export async function redigeModule(env, { produit, index, module, titresFaits }, log = () => {}) {
  const prompt = consigneModule({ produit, index, module, titresFaits });
  let retour = null;
  for (let essai = 1; essai <= ESSAIS; essai++) {
    const html = nettoieSortie(await redige(env, prompt, retour));
    const v = valideModule(html, { produit, index, module });
    log('  essai ' + essai + '/' + ESSAIS + ' : ' + (v.ok ? 'ACCEPTÉ' : 'refusé — ' + v.erreurs.join(' ; ')) + ' (' + v.mots + ' mots, ' + v.consignes + ' consignes, ' + v.exemples + ' exemples)');
    if (v.ok) return { html, ...v };
    retour = { html, erreurs: v.erreurs };
  }
  return null;
}

/* ── Le déroulé ──────────────────────────────────────────────────────────── */
export async function principal(env = process.env, log = console.log) {
  const dry = String(env.DRY_RUN ?? 'true').toLowerCase() !== 'false';
  const id = String(env.PRODUIT || '').trim();
  if (!id) throw new Error('PRODUIT manquant (ex : PRODUIT=bureau-ia)');
  const produit = fiche(id);
  for (const k of ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'].concat(dry ? [] : ['ANTHROPIC_API_KEY'])) {
    if (!env[k]) throw new Error('secret manquant : ' + k + ' (à poser dans les secrets GitHub, jamais dans le dépôt)');
  }
  const refaire = new Set(String(env.REFAIRE || '').split(',').map((s) => s.trim()).filter(Boolean));
  log('Produit « ' + produit.nom + ' » (' + id + ', ' + produit.prix + ' €) · ' + produit.modules.length + ' modules · ' + (dry ? 'ESSAI À BLANC (lecture seule, aucun appel IA)' : 'FABRICATION RÉELLE'));

  /* 1. état de la base (lecture réelle même à blanc : prouve le droit D1) */
  const enBase = await d1(env, 'SELECT id, ordre, titre, gratuit, length(html) AS taille FROM contenu WHERE produit = ?1 ORDER BY ordre', [id]);
  const parId = new Map(enBase.map((l) => [l.id, l]));
  log('En base : ' + enBase.length + '/' + produit.modules.length + ' module(s)' + (enBase.length ? ' — ' + enBase.map((l) => l.id + ' « ' + l.titre + ' » (' + l.taille + ' car.)').join(', ') : ''));

  const aFaire = produit.modules.map((m, i) => ({ m, i, mid: idModule(i) })).filter(({ mid }) => !parId.has(mid) || refaire.has(mid));
  if (!aFaire.length) { log('PRODUIT COMPLET ' + id + ' (rien à faire)'); return { id, ecrits: 0, total: produit.modules.length }; }
  log('À écrire : ' + aFaire.map((x) => x.mid).join(', '));
  if (dry) { log('PRODUIT SIMULÉ ' + id + ' : ' + aFaire.length + ' module(s) seraient écrits'); return { id, ecrits: 0, total: produit.modules.length, simule: aFaire.length }; }

  /* 2. rédaction + contrôle + écriture, module par module (un échec n'arrête pas les autres) */
  let ecrits = 0; const rates = [];
  const titresFaits = enBase.map((l) => l.titre);
  for (const { m, i, mid } of aFaire) {
    log('Module ' + (i + 1) + ' « ' + m.titre + ' »');
    const r = await redigeModule(env, { produit, index: i, module: m, titresFaits }, log);
    if (!r) { rates.push(mid); log('  ABANDON après ' + ESSAIS + ' essais : rien n\'est écrit pour ' + mid); continue; }
    await d1(env, 'INSERT OR REPLACE INTO contenu (produit, id, ordre, titre, html, gratuit, maj) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)',
      [id, mid, i + 1, m.titre, r.html, m.gratuit ? 1 : 0, new Date().toISOString()]);
    titresFaits.push(m.titre); ecrits++;
    log('  écrit en base : ' + mid + ' (' + r.mots + ' mots, ' + r.consignes + ' consignes' + (m.gratuit ? ', GRATUIT' : '') + ')');
  }
  const total = enBase.filter((l) => !refaire.has(l.id)).length + ecrits;
  if (rates.length) log('Modules ratés : ' + rates.join(', ') + ' — relancer le workflow, ils seront repris (les autres sont déjà en base)');
  log((rates.length ? 'PRODUIT INCOMPLET ' : 'PRODUIT PUBLIÉ ') + id + ' : ' + total + '/' + produit.modules.length + ' modules');
  if (rates.length) process.exitCode = 1;
  return { id, ecrits, total: produit.modules.length, rates };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  principal().catch((e) => { console.error('ÉCHEC : ' + (e && e.message ? e.message : e)); process.exit(1); });
}
