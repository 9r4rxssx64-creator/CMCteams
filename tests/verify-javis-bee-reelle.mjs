/* GARDE EN VRAI NAVIGATEUR — Bee bouge VRAIMENT, et elle ne laisse jamais un trou noir.
 *
 * Lire le code ne prouve rien d'un <video> : il faut un vrai moteur qui décode le fichier.
 * Ici on lance Chromium, on sert l'app Bee en local, on détourne lingua.kd-mc.com vers les
 * vrais .mp4 du dépôt, et on MESURE :
 *
 *   1. la vraie vidéo se lit  → la classe .vid est posée et currentTime AVANCE ;
 *   2. un mouvement change bien de clip (fly / dance / walk) ;
 *   3. VIDÉO CASSÉE (404 sur le repos) → pas de .vid, la marionnette reste visible,
 *      et le dessin de Bee est toujours là : jamais d'écran vide (leçon « une page doit
 *      survivre à l'absence d'un fichier externe ») ;
 *   4. CLIP D'HUMEUR MANQUANT (404 sur un seul mouvement) → la scène reste en vidéo,
 *      seul ce mouvement-là repasse en marionnette ;
 *   5. pas admin → Bee ne s'affiche PAS (fail-closed).
 *
 * node tests/verify-javis-bee-reelle.mjs
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const R = { ok: [], ko: [], na: [] };
const chk = (c, m) => (c ? R.ok : R.ko).push(m);
const dors = (ms) => new Promise((r) => setTimeout(r, ms));

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.mp4': 'video/mp4' };

/* --- petit serveur : l'app Bee, telle qu'elle est dans le dépôt --------------- */
const srv = http.createServer((req, res) => {
  const p = (req.url || '/').split('?')[0];
  if (p === '/__sso/whoami') {                       /* le domaine dit qui tu es */
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify(SSO));
  }
  const f = join(ROOT, 'javis', p === '/' ? 'index.html' : p.replace(/^\//, ''));
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('nope'); }
  res.writeHead(200, { 'content-type': TYPES[f.slice(f.lastIndexOf('.'))] || 'text/plain' });
  res.end(fs.readFileSync(f));
});
let SSO = { ok: true, uid: 'kdmc_admin', name: 'Kevin DESARZENS', verified: true, admin: true };
await new Promise((r) => srv.listen(0, r));
const BASE = `http://127.0.0.1:${srv.address().port}`;

const nav = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });

/* Les vidéos de Bee sont en H.264 : parfait sur l'iPhone de Kevin, mais un Chromium sans
   codecs propriétaires (celui des machines de CI) ne sait pas les décoder. Plutôt que de
   sauter le contrôle en silence — un test qui ne vérifie rien n'est pas un test qui passe —
   on rejoue SES VRAIES IMAGES dans un format que ce navigateur-là lit (VP9), avec ffmpeg.
   Si même ça est impossible, on le DIT en clair au lieu d'afficher un vert trompeur. */
const sonde = await (async () => {
  const c = await nav.newContext(); const p = await c.newPage(); await p.goto('about:blank');
  const r = await p.evaluate(() => { const v = document.createElement('video');
    return { h264: !!v.canPlayType('video/mp4; codecs="avc1.42E01E"'), vp9: !!v.canPlayType('video/webm; codecs="vp9"') }; });
  await c.close(); return r;
})();
const CACHE = fs.mkdtempSync(join(os.tmpdir(), 'bee-vp9-'));
const SOURCE = join(ROOT, 'lingua/bee/live/idle.mp4');
/* un ffmpeg n'est utilisable que s'il sait VRAIMENT ouvrir un mp4 : celui fourni avec
   Playwright est allégé et ne le sait pas. On le prouve en essayant, pas en supposant. */
function ffmpegUtilisable(bin) {
  if (!bin) return false;
  try { execFileSync(bin, ['-y', '-v', 'error', '-i', SOURCE, '-t', '1', '-vf', 'scale=120:-2',
    '-c:v', 'libvpx-vp9', '-b:v', '120k', '-deadline', 'realtime', '-cpu-used', '8', '-an',
    join(CACHE, '_sonde.webm')], { stdio: 'ignore' }); return true; } catch (_) { return false; }
}
let candidats = [process.env.FFMPEG_PATH, 'ffmpeg'];
try { candidats.unshift((await import('ffmpeg-static')).default); } catch (_) {}
const FFMPEG = candidats.filter(Boolean).find(ffmpegUtilisable) || null;
const TRANSCODE = !sonde.h264 && sonde.vp9 && !!FFMPEG;
const VIDEO_TESTABLE = sonde.h264 || TRANSCODE;
if (sonde.h264) chk(true, 'ce navigateur lit le H.264 : les vrais fichiers sont joués tels quels');
else if (TRANSCODE) chk(true, 'ce navigateur ne lit pas le H.264 → les VRAIES images de Bee sont rejouées en VP9 (ffmpeg)');
else R.na.push('la lecture vidéo n\'a PAS pu être éprouvée ici (ni H.264 ni ffmpeg complet) — '
  + 'les replis et le fail-closed le sont ; pour la vidéo : machine avec ffmpeg, ou Safari iPhone');

function pourLeTest(f) {
  if (!TRANSCODE) return { body: fs.readFileSync(f), type: 'video/mp4' };
  const out = join(CACHE, f.split('/').pop().replace('.mp4', '.webm'));
  if (!fs.existsSync(out)) {
    execFileSync(FFMPEG, ['-y', '-v', 'error', '-i', f, '-t', '3', '-vf', 'scale=200:-2', '-c:v', 'libvpx-vp9',
      '-b:v', '200k', '-deadline', 'realtime', '-cpu-used', '8', '-an', out], { stdio: 'ignore' });
  }
  return { body: fs.readFileSync(out), type: 'video/webm' };
}

/* Bee est servie par Lingua en production : on détourne vers les vrais fichiers du dépôt.
   `casse` permet de simuler un fichier absent pour éprouver le repli. */
async function ouvre({ casse = null } = {}) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push(String(e && e.message)));
  await page.route('https://lingua.kd-mc.com/**', (route) => {
    const u = new URL(route.request().url());
    if (casse && u.pathname.includes(casse)) return route.fulfill({ status: 404, body: 'absent' });
    const f = join(ROOT, 'lingua', u.pathname.replace(/^\//, ''));
    if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: 'absent' });
    if (f.endsWith('.mp4')) { const v = pourLeTest(f); return route.fulfill({ status: 200, contentType: v.type, body: v.body }); }
    return route.fulfill({ status: 200, contentType: TYPES[f.slice(f.lastIndexOf('.'))] || 'application/octet-stream',
      body: fs.readFileSync(f) });
  });
  await page.route('https://apis.kd-mc.com/**', (r) => r.fulfill({ status: 200,
    contentType: 'application/json', body: JSON.stringify({ text: 'Coucou !' }) }));
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  return { ctx, page, erreurs };
}

/* === 1 + 2. la vraie vidéo se lit, et les mouvements changent de clip ======== */
{
  const { ctx, page, erreurs } = await ouvre();
  await page.waitForSelector('#javis-launcher .bee-rig', { timeout: 8000 }).catch(() => {});
  chk(await page.locator('#javis-launcher .bee-rig').count() > 0, 'Bee est affichée (admin prouvé)');

  const vid = page.locator('#javis-launcher .javis-vid');
  if (VIDEO_TESTABLE) chk(await vid.count() > 0, 'la couche vidéo existe dans l\'app');
  await page.waitForFunction(
    () => document.querySelector('#javis-launcher .bee-rig.vid') !== null, null, { timeout: 12000 }
  ).catch(() => {});
  const posee = await page.locator('#javis-launcher .bee-rig.vid').count() > 0;
  if (VIDEO_TESTABLE) chk(posee, posee ? 'la vraie vidéo est LUE (classe .vid posée après canplay)'
                   : 'la vidéo ne s\'est pas lancée (canplay jamais reçu)');

  if (VIDEO_TESTABLE) {
    const t1 = await vid.evaluate((v) => v.currentTime).catch(() => 0);
    await dors(1200);
    const t2 = await vid.evaluate((v) => v.currentTime).catch(() => 0);
    chk(t2 > t1, `la vidéo AVANCE vraiment (${t1.toFixed(2)}s → ${t2.toFixed(2)}s)`);

    const srcAvant = await vid.evaluate((v) => v.currentSrc);
    chk(/idle\.mp4/.test(srcAvant), `au repos elle joue le clip « idle » (${srcAvant.split('/').pop()})`);
    await page.evaluate(() => {
      const r = document.querySelector('#javis-launcher .bee-rig');
      r.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 100 }));
    });
    await dors(700);
    const srcApres = await vid.evaluate((v) => v.currentSrc);
    chk(srcApres !== srcAvant && /(fly|dance|jump|walk)\.mp4/.test(srcApres),
      srcApres !== srcAvant ? `un toucher sur l'aile lance un VRAI mouvement (${srcApres.split('/').pop()})`
                            : 'le toucher n\'a pas changé de clip');
  }
  chk(erreurs.length === 0, erreurs.length ? `ERREURS JS : ${erreurs[0]}` : 'aucune erreur JS');
  await ctx.close();
}

/* === 3. la vidéo de repos casse → marionnette, jamais d'écran vide =========== */
{
  const { ctx, page, erreurs } = await ouvre({ casse: '/live/' });
  await page.waitForSelector('#javis-launcher .bee-rig', { timeout: 8000 }).catch(() => {});
  await dors(2500);
  const aVid = await page.locator('#javis-launcher .bee-rig.vid').count() > 0;
  chk(!aVid, !aVid ? 'vidéo injouable → la classe .vid n\'est JAMAIS posée' : 'la vidéo s\'est posée alors qu\'elle est cassée');
  const dessin = await page.locator('#javis-launcher .rig-base').isVisible().catch(() => false);
  chk(dessin, dessin ? 'le dessin de Bee reste visible (marionnette) — aucun trou noir'
                     : 'ÉCRAN VIDE : ni vidéo ni dessin');
  const bouge = await page.evaluate(() => {
    const r = document.querySelector('#javis-launcher .bee-rig');
    r.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 100 }));
    return new Promise((res) => setTimeout(() => res(/mv-/.test(r.className)), 300));
  });
  chk(bouge, bouge ? 'sans vidéo, les mouvements repassent en marionnette CSS' : 'plus aucun mouvement sans vidéo');
  chk(erreurs.length === 0, erreurs.length ? `ERREURS JS : ${erreurs[0]}` : 'aucune erreur JS malgré la panne');
  await ctx.close();
}

/* === 4. un SEUL clip d'humeur manque → la scène reste en vidéo =============== */
if (VIDEO_TESTABLE) {
  const { ctx, page } = await ouvre({ casse: '/live/fly.mp4' });
  await page.waitForFunction(() => document.querySelector('#javis-launcher .bee-rig.vid') !== null,
    null, { timeout: 12000 }).catch(() => {});
  chk(await page.locator('#javis-launcher .bee-rig.vid').count() > 0,
    'un clip d\'humeur manquant ne casse PAS la scène (le repos tourne toujours)');
  await page.evaluate(() => {
    const r = document.querySelector('#javis-launcher .bee-rig');
    r.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 100 }));
  });
  await dors(1500);
  const src = await page.locator('#javis-launcher .javis-vid').evaluate((v) => v.currentSrc);
  chk(/idle\.mp4/.test(src), `après un clip absent, elle revient au repos (${src.split('/').pop()})`);
  await ctx.close();
}

/* === 5. pas admin → Bee ne s'affiche pas (fail-closed) ====================== */
{
  SSO = { ok: true, uid: 'laurence_sp', name: 'Laurence Saint-Polit', verified: true, admin: false };
  const { ctx, page } = await ouvre();
  await dors(1500);
  const vue = await page.locator('#javis-launcher').count();
  chk(vue === 0, vue === 0 ? 'pas Kevin → Bee ne s\'affiche pas (fail-closed)' : 'FUITE : Bee visible pour un non-admin');
  const dit = await page.locator('text=personnelle à Kevin').count();
  chk(dit > 0, dit > 0 ? 'et l\'app le DIT clairement (pas d\'écran noir inexpliqué)' : 'écran noir sans explication');
  await ctx.close();
  SSO = { ok: true, uid: 'kdmc_admin', name: 'Kevin DESARZENS', verified: true, admin: true };
}

await nav.close();
srv.close();
R.ok.forEach((m) => console.log('  ✅', m));
R.na.forEach((m) => console.log('  ⚠️  NON VÉRIFIÉ ICI :', m));
R.ko.forEach((m) => console.log('  ❌', m));
console.log(`\n${R.ok.length} contrôles OK, ${R.ko.length} échec(s)`
  + (R.na.length ? `, ${R.na.length} non vérifiable(s) sur cette machine` : ''));
process.exit(R.ko.length ? 1 : 0);
