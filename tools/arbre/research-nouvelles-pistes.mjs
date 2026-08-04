/* =============================================================================
   ARBRE — RECHERCHE « TOUTES VILLES, TOUS PAYS » SUR LES NOUVELLES DÉCOUVERTES
   -----------------------------------------------------------------------------
   Kevin 2026-08-04 : « Recherche dans toutes les villes, pays, etc. Recherches
   aussi des infos sur tes nouvelles infos. Va plus loin. »
   Les actes lus ont révélé de NOUVEAUX noms (CIAIS, CARLIN, ORSELLI, FRACCHIA,
   TOESCA, BOUFFA, RAVELLO, MATHIEU, DANIEL, GINET, RASTEU, ANFOSSO) et de
   nouveaux lieux (La Turbie, Lantosque, Saorge, Sospel, Marseille/Salon, Vaud).
   Ce script (CI, réseau ouvert) enquête sur chacun :
   1. INSEE matchid — dater les décès des nouvelles personnes (>1970, France)
   2. Presse suisse numérisée (e-newspaperarchives.ch) — DESARZENS/DE SARZENS
   3. Gallica (presse ancienne) — nouveaux noms + Monte-Carlo
   4. Journal de Monaco — état civil publié (naissances/mariages/décès)
   5. Suisse : HLS + archives vaudoises (davel) — Desarzens/Sarzens
   6. AD13 (Marseille/Salon) — DESARZENS
   Sorties : arbre/research/nouvellesraw/ + NOUVELLES-PISTES.md
============================================================================= */
import { chromium } from 'playwright';
import fs from 'fs';

const OUT = 'arbre/research/nouvellesraw';
fs.mkdirSync(OUT, { recursive: true });
const L = ['# 🌍 Recherche toutes villes & pays — nouvelles découvertes (' + new Date().toISOString().slice(0, 10) + ')', ''];
function log(s) { console.log(s); L.push(s); }

/* ============ 1) INSEE matchid — nouvelles personnes ============ */
log('## 📜 INSEE (fichier des décès France ≥1970) — nouvelles personnes des actes');
const MATCHID = [
  { q: 'Emmanuel MAIFFRET', hint: 'peintre, né ~1884 Monaco — mort après 1970 en France ?' },
  { q: 'Joséphine Angèle CIAIS', hint: 'couturière, née ~1886 La Turbie' },
  { q: 'Josephine CIAIS', hint: 'variante sans accents/2e prénom' },
  { q: 'Pauline Caroline CARLIN', hint: 'concierge, épouse de Philippe' },
  { q: 'Rose Angeline FRACCHIA', hint: 'veuve de François-Louis (1912)' },
  { q: 'Julie MAIFFRET', hint: 'née 16.06.1880 Monaco, épouse DANIEL' },
  { q: 'Madeleine MATHIEU 1957', hint: 'épouse de François (mariage Monaco 1957)' },
  { q: 'Madeleine Marie Clemence MATHIEU', hint: 'nom complet' },
  { q: 'Paula Francoise MAIFFRET', hint: 'née 1910 — décès Monaco 1994 (hors INSEE France ?)' },
  { q: 'Reparate SAUVAIGO', hint: 'née Nice 1896, mariée GINET' },
  { q: 'Reparate GINET', hint: 'sous son nom d’épouse' },
];
for (const m of MATCHID) {
  try {
    const r = await fetch('https://deces.matchid.io/deces/api/v1/search?q=' + encodeURIComponent(m.q) + '&size=8');
    const j = await r.json();
    const hits = ((j || {}).response || {}).persons || [];
    fs.writeFileSync(OUT + '/matchid-' + m.q.replace(/[^A-Za-z0-9]+/g, '_') + '.json', JSON.stringify(j, null, 1));
    if (!hits.length) { log('- **' + m.q + '** : 0 résultat (' + m.hint + ')'); continue; }
    log('- **' + m.q + '** (' + m.hint + ') → ' + hits.length + ' résultat(s) :');
    hits.slice(0, 5).forEach(h => {
      const n = (h.name || {});
      const b = (h.birth || {}), d = (h.death || {});
      log('  · ' + (n.first || []).join(' ') + ' ' + (n.last || '') + ' — né(e) ' + (b.date || '?') + ' à ' + ((b.location || {}).city || '?') + ' — † ' + (d.date || '?') + ' à ' + ((d.location || {}).city || '?') + ' (id ' + (h.id || '') + ')');
    });
  } catch (e) { log('- **' + m.q + '** : ÉCHEC — ' + e.message.slice(0, 100)); }
}

/* ============ helpers Playwright ============ */
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  viewport: { width: 1440, height: 1100 }, locale: 'fr-FR',
});
async function grab(tag, url, needle, wait) {
  const pg = await ctx.newPage();
  try {
    await pg.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await pg.waitForTimeout(wait || 3500);
    const html = await pg.content();
    fs.writeFileSync(OUT + '/' + tag + '.html', html);
    await pg.screenshot({ path: OUT + '/' + tag + '.png', fullPage: false }).catch(() => {});
    const text = await pg.evaluate(() => document.body ? document.body.innerText : '');
    fs.writeFileSync(OUT + '/' + tag + '.txt', text.slice(0, 150000));
    const hits = needle ? (text.match(needle) || []).length : 0;
    log('- **' + tag + '** : ok, ' + Math.round(html.length / 1024) + ' Ko' + (needle ? ' — ' + hits + ' mention(s) de ' + needle.source : '') + ' ([txt](nouvellesraw/' + tag + '.txt))');
    return text;
  } catch (e) { log('- **' + tag + '** : ÉCHEC — ' + e.message.slice(0, 110)); return ''; }
  finally { await pg.close(); }
}

/* ============ 2) Presse SUISSE numérisée — DESARZENS ============ */
log('');
log('## 🇨🇭 Presse suisse numérisée (e-newspaperarchives.ch) — DESARZENS / DE SARZENS');
await grab('ch-presse-desarzens', 'https://www.e-newspaperarchives.ch/?a=q&hs=1&r=1&results=1&txq=Desarzens&txf=txIN&ssnip=txt', /Desarzens/i, 6000);
await grab('ch-presse-desarzens-vaud', 'https://www.e-newspaperarchives.ch/?a=q&hs=1&r=1&results=1&txq=%22de+Sarzens%22&txf=txIN&ssnip=txt', /Sarzens/i, 6000);

/* ============ 3) Gallica — nouveaux noms + Monte-Carlo ============ */
log('');
log('## 📰 Gallica (presse ancienne française) — nouveaux noms');
const GALLICA = [
  ['CIAIS "La Turbie"', 'ciais-laturbie'],
  ['"Emmanuel Maiffret"', 'emmanuel-maiffret'],
  ['"Maiffret" "Monte-Carlo"', 'maiffret-montecarlo'],
  ['"Carlin" "Monaco" concierge', 'carlin-monaco'],
  ['"Fracchia" "Monaco"', 'fracchia-monaco'],
  ['"Sauvaigo" "receveur des postes"', 'sauvaigo-postes'],
];
for (const [q, tag] of GALLICA) {
  const terms = [...q.matchAll(/"([^"]+)"|(\S+)/g)].map(m => m[1] || m[2]);
  const cql = terms.map(t => '(gallica any "' + t + '")').join(' and ');
  await grab('gallica-' + tag, 'https://gallica.bnf.fr/SRU?operation=searchRetrieve&version=1.2&query=' + encodeURIComponent(cql) + '&maximumRecords=8', /numberOfRecords/, 2500);
}

/* ============ 4) Journal de Monaco — état civil publié ============ */
log('');
log('## 📰 Journal de Monaco (état civil publié chaque semaine depuis 1858)');
await grab('jdm-maiffret', 'https://journaldemonaco.gouv.mc/Recherche?motclef=Maiffret', /Maiffret/i, 6000);
await grab('jdm-ciais', 'https://journaldemonaco.gouv.mc/Recherche?motclef=Ciais', /Ciais/i, 6000);
await grab('jdm-sauvaigo', 'https://journaldemonaco.gouv.mc/Recherche?motclef=Sauvaigo', /Sauvaigo/i, 6000);

/* ============ 5) Suisse — HLS + archives vaudoises ============ */
log('');
log('## 🇨🇭 Suisse — dictionnaire historique + archives vaudoises (berceau « de Sarzens »)');
await grab('hls-sarzens', 'https://hls-dhs-dss.ch/fr/search/?f_hls.lexicofacet_string=2%2F006800.006900.&q=Sarzens', /Sarzens/i, 5000);
await grab('davel-desarzens', 'https://davel.vd.ch/detail.aspx?ID=recherche&q=Desarzens', /Desarzens/i, 5000);
await grab('vd-recherche-desarzens', 'https://www.davel.vd.ch/archivplansuche.aspx?ID=Suche&anzeigeklassifikation=&suchbegriff=Desarzens', /Desarzens/i, 5000);

/* ============ 6) AD13 — Marseille / Salon-de-Provence (DESARZENS) ============ */
log('');
log('## 🏛 AD13 (Bouches-du-Rhône : Marseille, Salon-de-Provence) — DESARZENS');
await grab('ad13-recherche-desarzens', 'https://www.archives13.fr/n/etat-civil/n:88', /état civil|etat civil/i, 5000);
await grab('ad13-moteur', 'https://www.archives13.fr/recherche?query=Desarzens', /Desarzens|résultat/i, 5000);

/* ============ 7) Rappel des villes VERROUILLÉES (liens directs téléphone Kevin) ============ */
log('');
log('## 📱 Villes dont les registres sont aux AD06 (mur anti-robot — à ouvrir depuis un téléphone)');
log('| Ville | Qui | Lien direct |');
log('|---|---|---|');
log('| La Turbie | naissance Joséphine CIAIS ~1886 | https://archives06.fr/ark:/79346/s005cd6f9de54124/5cd6f9de5a1b7 |');
log('| Lantosque | famille de Joseph MAIFFRET (père de J-B-Justin) | https://archives06.fr (état civil > Lantosque) |');
log('| Saorge | famille PACHIAUDI / ANFOSSO | https://archives06.fr (état civil > Saorge) |');
log('| Sospel | naissance Pierre DANIEL 12.05.1881 | https://archives06.fr (état civil > Sospel) |');
log('| Nice | Philippe MAIFFRET ~1850 ; J-B-Justin 14.11.1871 ; Réparate SAUVAIGO 8.08.1896 ; Jean-Marius SAUVAIGO 12.07.1912 | https://archives06.fr (état civil > Nice) |');
log('| Beaulieu-sur-Mer | lignée directe (Léonie 1895, Alexandre 1906, Léon 1910, Victor-Jules 1914, Josette 1922, Jean 1925, Jacqueline 1926) | https://archives06.fr (état civil > Beaulieu) |');

await browser.close();
fs.writeFileSync('arbre/research/NOUVELLES-PISTES.md', L.join('\n') + '\n');
console.log('\nRapport : arbre/research/NOUVELLES-PISTES.md');
