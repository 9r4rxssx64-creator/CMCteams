/* 🇲🇨 Collecteur du dossier monégasque de munegascu.free.fr — Kevin 2026-08-13
   « Par exemple récupère tout son dossier sur le monégasque ».

   CE QUE FAIT CE SCRIPT
   Il parcourt le site (même hôte uniquement), enregistre les pages, et en EXTRAIT les couples
   français ↔ monégasque qu'il y trouve, avec l'adresse exacte de la page d'origine pour chacun.

   CE QU'IL NE FAIT PAS
   Il ne recopie PAS le site dans l'app. Ce qui entre dans le dépôt, ce sont les COUPLES DE MOTS
   (des faits : « ce mot veut dire ceci ») + leur source citée. Les pages complètes restent en
   pièce jointe de l'exécution (artifact), le temps que je les relise — elles ne sont pas
   republiées. L'auteur du site est cité dans l'app.

   Politesse : un seul passage, 400 ms entre deux pages, robots.txt respecté, user-agent
   identifiable. On ne martèle pas le serveur de quelqu'un.

   Lance : node tools/lingua/collect-munegascu-site.mjs [--racine http://munegascu.free.fr/index_uk.htm]
                                                        [--out audit/munegascu] [--max 400]
*/
import { mkdirSync, writeFileSync } from 'node:fs';

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const RACINE = arg('racine', 'http://munegascu.free.fr/index_uk.htm');
const OUT = arg('out', 'audit/munegascu');
const MAX = parseInt(arg('max', '400'), 10);
const UA = 'KDMC-Lingua/1.0 (application d\'apprentissage du monegasque ; contact via lingua.kd-mc.com)';

const dodo = (ms) => new Promise((r) => setTimeout(r, ms));
const hote = new URL(RACINE).host;

async function page(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow' });
      if (r.ok) {
        const buf = Buffer.from(await r.arrayBuffer());
        /* ces vieux sites sont souvent en latin-1 : on décode correctement, sinon les accents
           deviennent des losanges et tout le lexique est faux */
        const brut = buf.toString('latin1');
        const utf = buf.toString('utf8');
        const casse = (s) => (s.match(/�/g) || []).length;
        return casse(utf) > 0 && casse(utf) > casse(brut) ? brut : utf;
      }
      if (r.status === 404 || r.status === 403) return null;
    } catch (_) { /* réseau : on retente */ }
    await dodo(800 * (i + 1));
  }
  return null;
}

/* --- petites aides HTML (aucune dépendance) --- */
const sansBalises = (s) => s.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&eacute;/g, 'é').replace(/&egrave;/g, 'è')
  .replace(/&agrave;/g, 'à').replace(/&ccedil;/g, 'ç').replace(/&ugrave;/g, 'ù').replace(/&ocirc;/g, 'ô')
  .replace(/&ecirc;/g, 'ê').replace(/&icirc;/g, 'î').replace(/&acirc;/g, 'â').replace(/&uuml;/g, 'ü')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&[a-z]+;/gi, ' ')
  .replace(/[ \t ]+/g, ' ').trim();
const propre = (s) => sansBalises(s).replace(/^[\s.·•\-–—]+|[\s.·•\-–—]+$/g, '').trim();

function liens(html, base) {
  const out = [];
  (html.match(/href\s*=\s*["']([^"'#]+)/gi) || []).forEach((h) => {
    const u = h.replace(/^href\s*=\s*["']/i, '');
    if (/^(mailto:|javascript:|tel:)/i.test(u)) return;
    try { const abs = new URL(u, base); if (abs.host === hote && /\.(html?|php)?$/i.test(abs.pathname)) out.push(abs.href.split('#')[0]); } catch (_) {}
  });
  return out;
}

/* --- extraction des couples : tableaux (2-3 colonnes) + lignes « x = y » / « x : y » --- */
function couples(html, url) {
  const trouves = [];
  const push = (a, b, forme) => {
    a = propre(a); b = propre(b);
    if (!a || !b || a.length > 60 || b.length > 60) return;
    if (a.toLowerCase() === b.toLowerCase()) return;
    if (!/[\p{L}]/u.test(a) || !/[\p{L}]/u.test(b)) return;
    trouves.push({ a, b, forme, url });
  };
  (html.match(/<tr[\s\S]*?<\/tr>/gi) || []).forEach((tr) => {
    const tds = (tr.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) || []).map((x) => x.replace(/<\/?t[dh][^>]*>/gi, ''));
    if (tds.length >= 2 && tds.length <= 4) push(tds[0], tds[1], 'tableau');
  });
  sansBalises(html).split('\n').forEach((l) => {
    const m = l.match(/^\s*([^=:•]{2,50})\s*[=:]\s*([^=:]{2,50})\s*$/);
    if (m) push(m[1], m[2], 'ligne');
  });
  return trouves;
}

/* ------------------------------------------------------------------ */
mkdirSync(OUT, { recursive: true });
const vues = new Set(), file = [RACINE, RACINE.replace(/index_uk\.htm.*$/, 'index.htm')];
const pages = [];
let tous = [];

console.log('🇲🇨 Parcours de ' + hote + ' (poli : 1 page toutes les 400 ms, ' + MAX + ' max)\n');
const rob = await page('http://' + hote + '/robots.txt');
const interdits = rob ? (rob.match(/^Disallow:\s*(\S+)/gim) || []).map((x) => x.split(/:\s*/)[1]) : [];
if (interdits.length) console.log('robots.txt : ' + interdits.length + ' chemin(s) interdits — respectés');

while (file.length && vues.size < MAX) {
  const url = file.shift();
  if (!url || vues.has(url)) continue;
  if (interdits.some((p) => p !== '/' && new URL(url).pathname.startsWith(p))) continue;
  vues.add(url);
  const html = await page(url);
  await dodo(400);
  if (!html) { console.log('—  ' + url + ' : injoignable'); continue; }
  const nom = (new URL(url).pathname.replace(/^\/|\/$/g, '') || 'index').replace(/[^\w.-]+/g, '-');
  writeFileSync(`${OUT}/${nom}.html`, `<!-- source : ${url} -->\n` + html, 'utf8');
  const c = couples(html, url);
  tous = tous.concat(c);
  pages.push({ url, octets: html.length, couples: c.length });
  console.log((c.length ? '✅' : '· ') + ' ' + url + ' — ' + html.length + ' o, ' + c.length + ' couple(s)');
  liens(html, url).forEach((l) => { if (!vues.has(l) && file.length + vues.size < MAX * 2) file.push(l); });
}

/* dédoublonnage : même paire vue sur plusieurs pages = 1 entrée, avec toutes ses sources */
const parCle = new Map();
tous.forEach((c) => {
  const k = (c.a + '||' + c.b).toLowerCase();
  if (!parCle.has(k)) parCle.set(k, { a: c.a, b: c.b, forme: c.forme, sources: [] });
  const e = parCle.get(k); if (!e.sources.includes(c.url)) e.sources.push(c.url);
});
const couplesUniques = [...parCle.values()];

const rapport = {
  site: hote, racine: RACINE, parcouru_le: new Date().toISOString(),
  pages_visitees: pages.length, pages: pages.sort((x, y) => y.couples - x.couples).slice(0, 60),
  couples_bruts: tous.length, couples_uniques: couplesUniques.length,
  note: 'Couples de mots extraits (faits) + adresse de la page d\'origine. Les pages complètes ne sont PAS republiées : elles restent en pièce jointe de l\'exécution. Le site et son auteur sont cités dans l\'application.',
  couples: couplesUniques,
};
writeFileSync(`${OUT}/COUPLES.json`, JSON.stringify(rapport, null, 2), 'utf8');

console.log('\n===== CE QUI A ÉTÉ TROUVÉ =====');
console.log('pages visitées   : ' + pages.length);
console.log('couples bruts    : ' + tous.length);
console.log('couples uniques  : ' + couplesUniques.length);
console.log('\nExtrait (30 premiers) :');
couplesUniques.slice(0, 30).forEach((c) => console.log('   ' + c.a + '  →  ' + c.b));
console.log('\nPages les plus riches :');
rapport.pages.slice(0, 10).forEach((p) => console.log('   ' + p.couples + '\t' + p.url));
if (!couplesUniques.length) { console.log('\n⚠️ Aucun couple extrait : il faudra lire les pages (artifact) et adapter le lecteur.'); process.exit(2); }
console.log('\nRapport : ' + OUT + '/COUPLES.json');
