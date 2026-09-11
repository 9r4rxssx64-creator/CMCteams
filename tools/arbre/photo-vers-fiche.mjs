#!/usr/bin/env node
/* Préparer une PHOTO pour la fiche de quelqu'un — sans jamais la mettre dans le dépôt.
   ---------------------------------------------------------------------------------
   Kevin envoie une photo de famille par message. Elle ne peut pas entrer dans le dépôt
   (public) ni transiter par le domaine depuis ici : elle doit arriver sur SON appareil,
   par un petit fichier à importer (Réglages → Importer).
   Deux exigences, et c'est tout l'intérêt de cet outil :
     · la photo doit être traitée EXACTEMENT comme si Kevin l'avait ajoutée depuis l'app
       (même réduction, même qualité, même fond) → on appelle la fonction importPhoto()
       de la vraie page, dans un vrai navigateur, au lieu de ré-inventer le traitement ;
     · le fichier produit ne doit PAS écraser la fiche existante → il est marqué
       « fusion », donc l'import complète la fiche au lieu de la remplacer (v3.20).
   Le fichier de sortie est écrit HORS du dépôt (dossier temporaire) : aucune photo de
   famille ne doit jamais être committée.

   Usage :
     node tools/arbre/photo-vers-fiche.mjs --photo <image> --id <identifiant> \
          [--sortie <fichier.json>] [--legende "texte"]
   Exemple :
     node tools/arbre/photo-vers-fiche.mjs --photo /tmp/papa.png --id seed_gerard */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ARBRE = path.join(ROOT, 'arbre');
function arg(nom, def) { const i = process.argv.indexOf('--' + nom); return i > 0 ? process.argv[i + 1] : def; }

const photo = arg('photo');
const id = arg('id');
const legende = arg('legende', '');
if (!photo || !id) {
  console.log('Usage : node tools/arbre/photo-vers-fiche.mjs --photo <image> --id <identifiant> [--sortie <f.json>] [--legende "texte"]');
  process.exit(2);
}
if (!fs.existsSync(photo)) { console.error('❌ Photo introuvable : ' + photo); process.exit(2); }
const sortie = arg('sortie', path.join(os.tmpdir(), 'arbre-photo-' + id + '.json'));
if (path.resolve(sortie).startsWith(ROOT + path.sep)) {
  console.error('❌ Refusé : la sortie tomberait DANS le dépôt (public). Choisis un dossier hors dépôt.');
  process.exit(2);
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml' };
const srv = await new Promise((res) => {
  const s = http.createServer((req, rsp) => {
    let f = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (f === '/' || f === '') f = '/index.html';
    const fp = path.join(ARBRE, f);
    if (!fp.startsWith(ARBRE) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { rsp.writeHead(404); rsp.end(); return; }
    rsp.writeHead(200, { 'content-type': MIME[path.extname(fp)] || 'application/octet-stream' });
    fs.createReadStream(fp).pipe(rsp);
  });
  s.listen(0, '127.0.0.1', () => res(s));
});
const base = `http://127.0.0.1:${srv.address().port}`;
async function loadPlaywright() {
  for (const n of ['playwright', 'playwright-core']) { try { return await import(n); } catch (e) { /* suivant */ } }
  if (process.env.PW_MODULE_DIR) return import(pathToFileURL(path.join(process.env.PW_MODULE_DIR, 'node_modules', 'playwright-core', 'index.mjs')).href);
  throw new Error('playwright introuvable');
}
function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const b = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  try { for (const d of fs.readdirSync(b).filter((x) => /^chromium-\d+$/.test(x)).sort().reverse()) { const c = path.join(b, d, 'chrome-linux', 'chrome'); if (fs.existsSync(c)) return c; } } catch (e) { /* rien */ }
  return undefined;
}

const pw = await loadPlaywright();
const browser = await pw.chromium.launch({ headless: true, executablePath: chromePath() });
try {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'fr-FR' });
  /* la page ne doit joindre QUE le serveur local : aucune donnée ne sort */
  await ctx.route('**/*', (r) => (r.request().url().startsWith(base) && !/\/sw\.js(\?|$)/.test(r.request().url()) ? r.continue() : r.abort()));
  await ctx.addInitScript((h) => {
    localStorage.setItem('arbre_trust', '1');
    localStorage.setItem('arbre_codehash', h);
    localStorage.setItem('arbre_v2_text', JSON.stringify({ persons: {}, meta: { updatedAt: Date.now() } }));
  }, 'f'.repeat(64));
  const page = await ctx.newPage();
  await page.goto(base + '/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.importPhoto === 'function', null, { timeout: 30000 });

  /* On reconstruit le fichier DANS la page (l'app redessine son écran et effacerait un
     champ posé dans le document), puis on appelle la VRAIE fonction de l'app : mêmes
     2200 px maxi, même qualité 0,9, même fond — donc exactement ce que l'iPhone aurait
     produit si Kevin avait ajouté la photo lui-même. */
  const brut = fs.readFileSync(photo);
  const r = await page.evaluate(async (a) => {
    const bin = atob(a.b64), u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const f = new File([u8], a.nom, { type: a.type });
    const data = await importPhoto(f);
    return { avant: f.size, nom: f.name, data, octets: Math.round(data.length * 0.75) };
  }, { b64: brut.toString('base64'), nom: path.basename(photo), type: /\.png$/i.test(photo) ? 'image/png' : 'image/jpeg' });

  const fiche = { id, photos: [r.data], fusion: true, updatedAt: Date.now() };
  if (legende) fiche.notes = legende;
  const paquet = { persons: { [id]: fiche }, meta: { fusion: true, updatedAt: Date.now(), source: 'photo pour ' + id } };
  fs.writeFileSync(sortie, JSON.stringify(paquet, null, 1));

  console.log('\n📷 Photo préparée par la fonction MÊME de l\'app (importPhoto)\n');
  console.log('  fichier d\'origine : ' + r.nom + ' — ' + (r.avant / 1024 | 0) + ' Ko');
  console.log('  après traitement  : ' + (r.octets / 1024 | 0) + ' Ko (JPEG, 2200 px maxi, qualité 0,9)');
  console.log('  destinataire      : ' + id + (legende ? ' · légende : ' + legende : ''));
  console.log('  marquage          : fusion → complète la fiche, ne la remplace PAS');
  console.log('  → ' + sortie + ' (' + (fs.statSync(sortie).size / 1024 | 0) + ' Ko, HORS dépôt)\n');
} finally {
  await browser.close(); srv.close();
}
