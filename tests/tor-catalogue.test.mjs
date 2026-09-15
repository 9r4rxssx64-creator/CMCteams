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
    .filter(u => !/^https:\/\/(apps\.apple\.com|www\.torproject\.org|www\.internet-signalement\.gouv\.fr|app\.tuta\.com|coffre\.kd-mc\.com|ahmia\.fi)/.test(u));
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


/* ── Générateur d'identité : il fabrique des SECRETS. S'il les envoyait quelque part,
   ou s'il utilisait un hasard faible (Math.random), l'outil deviendrait dangereux. ── */
t('l\'identité est fabriquée sur le téléphone, jamais envoyée', () => {
  assert(html.includes('crypto.getRandomValues'), 'le générateur n\'utilise pas le hasard cryptographique');
  const script = html.slice(html.indexOf('<script>'));
  assert(!/\bfetch\s*\(/.test(script), 'un fetch() traîne dans la page');
  assert(!/XMLHttpRequest|navigator\.sendBeacon|new WebSocket|EventSource/.test(script),
    'un moyen d\'envoyer des données traîne dans la page');
});

t('le hasard du générateur est sans biais et sans Math.random', () => {
  const script = html.slice(html.indexOf('<script>'));
  assert(!/Math\.random/.test(script), 'Math.random utilisé pour fabriquer un secret');
  assert(/Math\.floor\(4294967296 \/ n\) \* n/.test(script), 'le rejet anti-biais du tirage a disparu');
});

t('le vocabulaire du générateur reste assez large pour un vrai secret', () => {
  const m = html.match(/var MOTS = \("([^"]+)"\)/);
  assert(m, 'liste de mots introuvable');
  const mots = m[1].split(',');
  assert(mots.length >= 150, 'seulement ' + mots.length + ' mots — phrase de passe trop faible');
  assert(new Set(mots).size === mots.length, 'doublons dans la liste de mots (réduit le hasard réel)');
  assert(/for \(var i = 0; i < 7; i\+\+\)/.test(html), 'la phrase de passe ne fait plus 7 mots');
});

t('les règles d\'étanchéité de l\'identité sont là', () => {
  for (const r of ['Cette identité ne sert QU\'À ÇA', 'Jamais ton vrai mail en secours', 'Seulement dans Tor.']) {
    assert(html.includes(r), 'règle d\'étanchéité manquante : « ' + r + ' »');
  }
});

t('la promesse « rien n\'est envoyé, rien n\'est enregistré » est sur le générateur lui-même', () => {
  const b = blocDe('promesse');
  assert(b.length > 100, 'bloc #promesse introuvable — la promesse a été déplacée ou retirée');
  assert(/rien n'est envoyé/i.test(b) && /rien n'est enregistré/i.test(b),
    'la promesse n\'est plus affichée à côté du bouton qui fabrique les secrets');
});

/* ── Exploration : Kevin veut pouvoir tout voir. Le moteur qui le permet doit rester
   en tête du catalogue, et les 3 limites doivent rester écrites. ── */
t('le bloc Explorer met un moteur de recherche en avant', () => {
  const b = blocDe('explorer');
  assert(b.length > 200, 'bloc #explorer introuvable');
  assert(b.includes('<b>Ahmia</b>'), 'le moteur n\'est plus nommé dans le texte du bloc Explorer');
  assert(/copie-ahmia/.test(html), 'le bouton de copie du moteur a disparu');
  assert(fiches.some(f => f.n === 'Ahmia'), 'le moteur n\'est plus dans le catalogue : le bouton copierait du vide');
});

t('les 3 limites non négociables sont toujours écrites', () => {
  for (const r of ['pédocriminels', 'Commander une violence', 'Acheter quoi que ce soit']) {
    assert(html.includes(r), 'limite manquante : « ' + r + ' »');
  }
});


/* ── Intégration au domaine : le registre ET la tuile du portail. Sans tuile, Kevin
   devrait taper l'adresse à la main = fonction inexistante (leçon du 2026-08-05). ── */
t('l\'outil est inscrit partout dans le domaine (registre, routeur, replis)', () => {
  const attendus = ['kdmc-home/apps.json', 'services/kdmc-router/worker.js',
                    'services/kdmc-router/wrangler.toml', 'kdmc-home/kdmc-portal.js',
                    'kdmc-home/admin/admin.js'];
  for (const f of attendus) {
    const c = readFileSync(new URL('../' + f, import.meta.url), 'utf8');
    assert(/['"\/]tor\.kd-mc\.com/.test(c), 'tor.kd-mc.com absent de ' + f);
  }
});

t('la tuile du portail existe, pointe sur l\'outil, et reste dans une zone privée', () => {
  const portail = readFileSync(new URL('../kdmc-home/index.html', import.meta.url), 'utf8');
  const i = portail.indexOf('id="tor-zone"');
  assert(i > 0, 'la zone #tor-zone a disparu du portail');
  const zone = portail.slice(i, portail.indexOf('</div>', i));
  assert(/hidden/.test(portail.slice(i - 40, i + 40)), 'la zone n\'est plus masquée par défaut : tout le monde la verrait');
  assert(zone.includes('https://tor.kd-mc.com/'), 'la tuile ne pointe plus sur l\'outil');
  const js = readFileSync(new URL('../kdmc-home/kdmc-portal.js', import.meta.url), 'utf8');
  assert(js.includes("getElementById('tor-zone')"), 'la règle d\'affichage de la tuile a disparu');
  assert(/estKevin[\s\S]{0,120}kevin\|desarzens/.test(js), 'la tuile n\'est plus réservée à Kevin');
});

console.log('\n✅ ' + ok + ' contrôles, 0 échec — ' + fiches.length + ' services au catalogue.');
