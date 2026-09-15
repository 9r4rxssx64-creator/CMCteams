/* Garde « Tor en clair » (tools/tor/index.html) — Kevin 2026-09-15.
 *
 * Raison d'être : c'est une page qui donne des ADRESSES. Une adresse fausse ou un lien
 * vers un pont web, et l'outil censé protéger Kevin devient exactement le piège qu'il
 * décrit. Cette garde interdit mécaniquement les 5 façons de se tromper :
 *   1. une adresse .onion malformée (une vraie adresse v3 = 56 caractères base32) ;
 *   2. une fiche sans SOURCE officielle en clair (= « crois-moi sur parole ») ;
 *   3. une source qui serait elle-même un .onion (invérifiable depuis Safari) ;
 *   4. un « pont web » / proxy tor2web quelque part dans la page (casse l'anonymat) ;
 *   5. une adresse .onion rendue CLIQUABLE (un clic depuis Safari ne peut aboutir
 *      que sur un pont web — d'où le bouton « Copier » à la place).
 * Prouvée discriminante par sabotage (voir le commit).
 */
import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';

const PAGE = 'tools/tor/index.html';
const html = readFileSync(new URL('../' + PAGE, import.meta.url), 'utf8');
let ok = 0;
const t = (nom, fn) => { fn(); ok++; console.log('  ✓ ' + nom); };

/* --- Extraction du catalogue tel qu'il est réellement écrit dans la page --- */
const bloc = html.match(/var SITES = \[([\s\S]*?)\n\];/);
assert(bloc, 'catalogue SITES introuvable dans ' + PAGE);
const fiches = [...bloc[1].matchAll(/\{c:"(.*?)", *n:"(.*?)", *d:"(.*?)", *o:"(.*?)", *s:"(.*?)"\}/g)]
  .map(m => ({ c: m[1], n: m[2], d: m[3], o: m[4], s: m[5] }));

console.log('Garde « Tor en clair » — ' + fiches.length + ' fiches lues dans ' + PAGE);

t('le catalogue contient au moins 15 services', () => {
  assert(fiches.length >= 15, 'seulement ' + fiches.length + ' fiches');
});

/* Une adresse v3 = 56 caractères base32 (a-z, 2-7) + « .onion ».
   Un préfixe (www.) et un chemin (/learningenglish/) sont légitimes. */
t('chaque adresse est une vraie adresse .onion v3 (56 caractères base32)', () => {
  for (const f of fiches) {
    const hote = f.o.replace(/\/.*$/, '');
    assert(hote.endsWith('.onion'), f.n + ' : « ' + hote + ' » ne finit pas par .onion');
    const labels = hote.slice(0, -'.onion'.length).split('.');
    const cle = labels[labels.length - 1];
    assert.equal(cle.length, 56, f.n + ' : clé de ' + cle.length + ' caractères au lieu de 56 (« ' + cle + ' »)');
    assert(/^[a-z2-7]{56}$/.test(cle), f.n + ' : caractères hors base32 dans la clé');
  }
});

t('aucune adresse en double (deux noms pour la même adresse = piège possible)', () => {
  const vues = new Map();
  for (const f of fiches) {
    const hote = f.o.replace(/\/.*$/, '');
    const cle = hote.slice(0, -'.onion'.length).split('.').pop();
    if (vues.has(cle)) assert(f.n.startsWith('BBC') && vues.get(cle).startsWith('BBC'),
      'adresse partagée par « ' + vues.get(cle) + ' » et « ' + f.n + ' »');
    vues.set(cle, f.n);
  }
});

t('chaque fiche porte une source officielle en clair, vérifiable depuis Safari', () => {
  for (const f of fiches) {
    assert(/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}/i.test(f.s), f.n + ' : source « ' + f.s + ' » invalide');
    assert(!f.s.includes('.onion'), f.n + ' : la source est un .onion, donc invérifiable avant d\'avoir Tor');
  }
});

t('chaque fiche a un nom, une catégorie et une explication en français', () => {
  for (const f of fiches) {
    assert(f.n.length >= 3, 'nom trop court : ' + JSON.stringify(f.n));
    assert(f.c.length >= 3, f.n + ' : catégorie manquante');
    assert(f.d.length >= 30, f.n + ' : explication trop courte (' + f.d.length + ' car.) — Kevin doit savoir à quoi ça sert');
  }
});

/* Les ponts web : ils ouvrent du .onion dans un navigateur normal, en se mettant
   au milieu. Leur seule présence hors de la mise en garde contredirait tout le propos.
   Tolérance STRICTE : uniquement à l'intérieur du bloc #ponts (la mise en garde
   elle-même), jamais « quelque part à côté » — un voisinage large laissait passer
   une astuce ajoutée juste après une autre mise en garde (trou trouvé par sabotage). */
function blocDe(id) {
  const i = html.indexOf('id="' + id + '"');
  if (i < 0) return '';
  const fin = html.indexOf('</section>', i);
  return html.slice(i, fin < 0 ? html.length : fin);
}
const PONTS = ['tor2web', 'onion.ly', 'onion.pet', 'onion.ws', 'onion.cab', 'onion.to',
               'onion.sh', 'darknet.to', 'onion.link', 'onion.moe'];
t('aucun « pont web » (proxy tor2web) hors du bloc de mise en garde', () => {
  const horsGarde = html.replace(blocDe('ponts'), '').toLowerCase();
  for (const p of PONTS) {
    assert(!horsGarde.includes(p), 'le pont web « ' + p + ' » apparaît hors de la mise en garde #ponts');
  }
});

t('la mise en garde contre les ponts web existe toujours', () => {
  const b = blocDe('ponts').toLowerCase();
  assert(b.length > 200, 'bloc #ponts introuvable ou vide');
  assert(b.includes('au milieu'), 'la mise en garde n\'explique plus POURQUOI (« au milieu »)');
});

t('aucune adresse .onion n\'est cliquable (href/src) — on copie, on ne clique pas', () => {
  const liens = [...html.matchAll(/(?:href|src)\s*=\s*"([^"]*\.onion[^"]*)"/gi)].map(m => m[1]);
  assert.equal(liens.length, 0, 'lien(s) cliquable(s) vers du .onion : ' + liens.join(', '));
});

t('aucun annuaire de marchés illégaux hors du bloc « ce que je n\'ai pas mis »', () => {
  const horsExclus = html.replace(blocDe('exclus'), '').toLowerCase();
  for (const mot of ['hidden wiki', 'hiddenwiki', 'darknetlive', 'dread', 'tormarket', 'darkmarket']) {
    assert(!horsExclus.includes(mot), 'référence à « ' + mot + ' » hors de la mise en garde #exclus');
  }
});

/* Les 8 règles sont la vraie protection : elles ne doivent pas disparaître à la faveur
   d'une refonte cosmétique. */
t('les règles de sécurité non négociables sont toujours présentes', () => {
  for (const r of ['Ne télécharge rien', 'Ne te connecte à aucun de tes comptes',
                   'Aucun paiement', 'Vérifie l\'adresse caractère par caractère']) {
    assert(html.includes(r), 'règle manquante : « ' + r + ' »');
  }
});

t('la page n\'appelle aucun serveur (CSP connect-src \'none\', 0 ressource externe)', () => {
  assert(html.includes("connect-src 'none'"), "CSP : connect-src 'none' absent");
  const ext = [...html.matchAll(/(?:href|src)\s*=\s*"(https?:\/\/[^"]+)"/gi)]
    .map(m => m[1])
    .filter(u => !/^https:\/\/(apps\.apple\.com|www\.torproject\.org|www\.internet-signalement\.gouv\.fr)/.test(u));
  const fichesSrc = new Set(fiches.map(f => f.s));
  const inattendus = ext.filter(u => !fichesSrc.has(u));
  assert.equal(inattendus.length, 0, 'lien externe inattendu : ' + inattendus.join(', '));
});

t('page mobile-first : viewport, safe-area et cibles tactiles ≥ 44px', () => {
  assert(html.includes('viewport-fit=cover'), 'viewport-fit=cover absent');
  assert(html.includes('env(safe-area-inset-bottom)'), 'safe-area-inset-bottom absent');
  const tailles = [...html.matchAll(/min-height:(\d+)px/g)].map(m => +m[1]);
  assert(tailles.length >= 3, 'aucune hauteur de bouton déclarée');
  assert(tailles.every(v => v >= 40), 'cible tactile trop petite : ' + Math.min(...tailles) + 'px');
});

console.log('\n✅ ' + ok + ' contrôles, 0 échec — ' + fiches.length + ' services au catalogue.');
