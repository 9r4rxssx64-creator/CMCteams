/* LECTURE À VOIX HAUTE DU LIVRE DE CUISINE — Kevin 2026-09-10 « Lire les étapes ne fonctionne pas ».
 * Jusqu'au 10.09.2026, `readAloud` envoyait TOUTE la recette (jusqu'à 1 442 caractères) en UNE phrase
 * vocale, précédée d'un cancel() et gardée dans une variable locale : sur iPhone la phrase saute ou se
 * coupe, sur Chrome l'objet ramassé fait taire la voix au bout de ~15 s. Aucun test ne le voyait.
 * Ici : la VRAIE page dans un vrai Chromium, avec un moteur vocal FACTICE (le vrai n'a pas de voix sur
 * un serveur) qui note chaque phrase reçue et rejoue les événements (start/end/error) comme un navigateur.
 *   (1) STATIQUE : plus de texte JSON dans l'attribut onclick (le bouton passe l'identifiant) ;
 *   (2) POUR CHAQUE recette : le bouton lance N phrases courtes (≤ 240 car.), toutes GARDÉES en mémoire,
 *       enchaînées à la fin de la précédente, qui couvrent CHAQUE étape affichée ; le bouton dit
 *       « Arrêter » pendant, « Lire » après ; l'étape lue est surlignée ;
 *   (3) l'appui pendant la lecture ARRÊTE (cancel) sans relancer ; quitter la recette arrête aussi ;
 *   (4) une erreur du moteur est DITE avec sa cause exacte (règle « détailler les erreurs ») ;
 *   (5) sans moteur vocal : message clair, 0 erreur JS ;
 *   (6) cancel() n'est JAMAIS collé à speak() quand rien ne parle (la cause n°1 du silence iPhone).
 * Serveur HTTP embarqué (leçon #65), hors ligne sauf lui (leçon #220).
 */
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, extname } from 'node:path';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'tools', 'cuisine');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const fails = [];
const ko = (m) => { fails.push(m); console.log('  ✗ ' + m); };
const ok = (m) => console.log('  ✓ ' + m);

/* (1) statique */
const html = readFileSync(join(DIR, 'index.html'), 'utf8');
if (/readAloud\(&quot;/.test(html) || /readAloud\('\+JSON\.stringify/.test(html) || !/onclick="readAloud\('\+r\.id\+',this\)"/.test(html)) ko('le bouton embarque encore le texte entier dans onclick');
else ok('le bouton passe l\'identifiant de la recette, pas le texte');
for (const must of ['data-tts', 'function splitSteps', 'function ttsChunks', 'TTS.utts=chunks.map(ttsMakeUtt)', 'function ttsFail', 'if(TTS.active)ttsStop(false)']) {
  if (!html.includes(must)) ko('manque « ' + must + ' » dans tools/cuisine/index.html');
}
if (!/\.steps li\.reading/.test(html)) ko('pas de style pour l\'étape en cours de lecture');

/* moteur vocal factice — injecté AVANT le script de la page */
const FAKE = `(() => {
  /* cancelWhileIdle = un cancel() à vide IMMÉDIATEMENT suivi (< 50 ms) d'un speak() : le geste qui fait sauter la voix sur iPhone */
  const L = { spoken: [], cancels: 0, cancelWhileIdle: 0, idleCancelAt: 0, mode: 'ok', ended: 0 };
  let current = null, speaking = false, pending = 0;
  class U { constructor(t) { this.text = t; this.lang = ''; this.rate = 1; this.voice = null; this.onstart = null; this.onend = null; this.onerror = null; } }
  const fire = (u, type, err) => { const h = u['on' + type]; if (typeof h === 'function') h({ type, error: err, utterance: u }); };
  const S = {
    get speaking() { return speaking; }, get pending() { return pending > 0; }, paused: false,
    getVoices() { return [{ name: 'Thomas', lang: 'fr-FR', localService: true, default: false }, { name: 'Samantha', lang: 'en-US', localService: true, default: true }]; },
    onvoiceschanged: null,
    resume() {}, pause() {},
    cancel() { L.cancels++; L.idleCancelAt = (!speaking && !pending) ? Date.now() : 0; const c = current; current = null; speaking = false; pending = 0; if (c) fire(c, 'error', 'interrupted'); },
    speak(u) {
      L.spoken.push({ text: u.text, lang: u.lang, voice: u.voice && u.voice.lang, len: u.text.length });
      if (L.idleCancelAt && Date.now() - L.idleCancelAt < 50) L.cancelWhileIdle++;
      L.idleCancelAt = 0;
      pending++;
      setTimeout(() => {
        if (current !== u && !pending) return;
        pending = Math.max(0, pending - 1); current = u; speaking = true;
        if (L.mode === 'fail') { speaking = false; current = null; fire(u, 'error', 'synthesis-unavailable'); return; }
        if (L.mode === 'silent') return; /* ne dit jamais start */
        fire(u, 'start');
        setTimeout(() => { if (current !== u) return; speaking = false; current = null; L.ended++; fire(u, 'end'); }, 3);
      }, 2);
    }
  };
  Object.defineProperty(window, 'speechSynthesis', { value: S, configurable: true });
  window.SpeechSynthesisUtterance = U; window.__tts = L;
})();`;

const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p === '/' || p === '') p = '/index.html';
  try { const body = readFileSync(join(DIR, p)); res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end('404'); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const PORT = server.address().port;
const browser = await chromium.launch();

async function openPage(init) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/^https?:\/\//, (r) => (/^https?:\/\/(127\.0\.0\.1|localhost)[:\/]/.test(r.request().url()) ? r.continue() : r.abort()));
  const page = await ctx.newPage();
  const jsErrors = [];
  page.on('pageerror', e => jsErrors.push(String(e)));
  if (init) await page.addInitScript(init);
  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof window.readAloud === 'function' && Array.isArray(window.R) && window.R.length > 0);
  return { page, ctx, jsErrors };
}

/* (2) toutes les recettes, moteur qui marche */
{
  const { page, ctx, jsErrors } = await openPage(FAKE);
  const ids = await page.evaluate(() => window.R.filter(r => r.method && r.method.length > 40).map(r => r.id));
  let recipes = 0, phrases = 0, maxLen = 0, badRecipes = 0;
  for (const id of ids) {
    const res = await page.evaluate(async (id) => {
      const L = window.__tts; L.spoken = []; L.cancels = 0; L.cancelWhileIdle = 0; L.ended = 0;
      go('recipe', { id, _from: "go('home')", _portions: null });
      const btn = document.querySelector('[data-tts]');
      if (!btn) return { err: 'pas de bouton' };
      const before = btn.textContent;
      btn.click();
      const during = btn.textContent, pressed = btn.getAttribute('aria-pressed');
      const kept = window.TTS.utts.length;
      /* on laisse le moteur factice dérouler toutes les phrases */
      const t0 = Date.now();
      while (window.TTS.active && Date.now() - t0 < 4000) await new Promise(r => setTimeout(r, 5));
      const steps = [...document.querySelectorAll('.steps li')].map(li => li.textContent.replace(/\s+/g, ' ').trim());
      return { before, during, pressed, kept, after: btn.textContent, active: window.TTS.active,
        spoken: L.spoken, cancelWhileIdle: L.cancelWhileIdle, steps, ended: L.ended, stillLit: document.querySelectorAll('.steps li.reading').length };
    }, id);
    recipes++;
    if (res.err) { ko(`recette ${id} : ${res.err}`); badRecipes++; continue; }
    const problems = [];
    if (res.before !== '🔊 Lire les étapes') problems.push('libellé initial « ' + res.before + ' »');
    if (res.during !== '⏹ Arrêter la lecture' || res.pressed !== 'true') problems.push('le bouton ne dit pas « Arrêter » pendant la lecture');
    if (res.after !== '🔊 Lire les étapes' || res.active) problems.push('le bouton ne revient pas à « Lire » à la fin');
    if (res.stillLit) problems.push('une étape reste surlignée après la fin');
    if (res.cancelWhileIdle) problems.push('cancel() appelé alors que rien ne parlait (cause n°1 du silence iPhone)');
    const texts = res.spoken.map(s => s.text);
    phrases += texts.length;
    if (res.kept !== texts.length) problems.push(`${res.kept} phrases gardées en mémoire pour ${texts.length} parlées`);
    if (texts.length < 2) problems.push('moins de 2 phrases parlées');
    if (res.spoken.some(s => s.lang !== 'fr-FR')) problems.push('une phrase n\'est pas en fr-FR');
    if (res.spoken.some(s => s.voice && s.voice !== 'fr-FR')) problems.push('voix non française choisie');
    for (const s of res.spoken) { maxLen = Math.max(maxLen, s.len); if (s.len > 240) problems.push('phrase de ' + s.len + ' caractères (> 240, coupée sur iPhone)'); }
    /* chaque étape affichée doit se retrouver dans ce qui est parlé (le texte des minuteurs « ⏱ » est dans l'étape) */
    const said = texts.join(' ').replace(/\s+/g, ' ');
    res.steps.forEach((st, i) => {
      const core = st.replace(/⏱\s*/g, '').replace(/^\d+\s*[.)]\s*/, '').replace(/\s+/g, ' ').trim();
      const probe = core.slice(0, 40);
      if (probe && !said.includes(probe)) problems.push(`étape ${i + 1} jamais lue (« ${probe}… »)`);
      if (!said.includes('Étape ' + (i + 1) + '.')) problems.push(`numéro d'étape ${i + 1} non annoncé`);
    });
    if (problems.length) { badRecipes++; ko(`recette ${id} : ${problems.join(' ; ')}`); }
  }
  if (!badRecipes) ok(`${recipes} recettes lues : ${phrases} phrases, la plus longue ${maxLen} caractères, chaque étape couverte, bouton et surlignage corrects`);

  /* surlignage pendant la lecture + (3) arrêt par le bouton + arrêt en quittant + (6) */
  const r3 = await page.evaluate(async () => {
    const L = window.__tts;
    go('recipe', { id: 15, _from: "go('home')", _portions: null });
    const btn = document.querySelector('[data-tts]'); if (!btn) return { err: 'pas de bouton' };
    L.spoken = []; L.cancels = 0; L.cancelWhileIdle = 0;
    btn.click();
    await new Promise(r => setTimeout(r, 9)); /* titre puis étape 1 en cours */
    const lit = [...document.querySelectorAll('.steps li')].findIndex(li => li.classList.contains('reading'));
    const spokenBefore = L.spoken.length;
    btn.click(); /* ARRÊT */
    const afterStopLabel = btn.textContent, cancels = L.cancels, activeAfterStop = window.TTS.active;
    await new Promise(r => setTimeout(r, 40));
    const spokenAfterStop = L.spoken.length - spokenBefore;
    const litAfterStop = document.querySelectorAll('.steps li.reading').length;
    /* relance puis on quitte la recette */
    L.spoken = []; btn.click(); await new Promise(r => setTimeout(r, 6));
    const wasActive = window.TTS.active;
    go('home');
    const activeAfterLeave = window.TTS.active, cancelsAfterLeave = L.cancels;
    await new Promise(r => setTimeout(r, 40));
    const spokenAfterLeave = L.spoken.length;
    return { lit, afterStopLabel, cancels, activeAfterStop, spokenAfterStop, litAfterStop, wasActive, activeAfterLeave, cancelsAfterLeave, spokenAfterLeave, cancelWhileIdle: L.cancelWhileIdle };
  });
  if (r3.err) ko('scénario arrêt : ' + r3.err); else {
  if (r3.lit !== 0) ko('l\'étape 1 n\'est pas surlignée pendant sa lecture (index surligné : ' + r3.lit + ')'); else ok('l\'étape en cours est surlignée pendant la lecture');
  if (r3.afterStopLabel !== '🔊 Lire les étapes' || r3.activeAfterStop || r3.cancels < 1) ko('l\'appui pendant la lecture n\'arrête pas (cancel=' + r3.cancels + ', actif=' + r3.activeAfterStop + ')');
  else if (r3.spokenAfterStop > 0) ko('des phrases sont encore envoyées après l\'arrêt (' + r3.spokenAfterStop + ')');
  else if (r3.litAfterStop) ko('une étape reste surlignée après l\'arrêt');
  else ok('appui pendant la lecture → arrêt net (cancel, bouton « Lire », plus rien d\'envoyé, rien de surligné)');
  if (!r3.wasActive || r3.activeAfterLeave || r3.cancelsAfterLeave < 2) ko('quitter la recette n\'arrête pas la lecture');
  else if (r3.spokenAfterLeave > 2) ko('la lecture continue après avoir quitté la recette (' + r3.spokenAfterLeave + ' phrases)');
  else ok('quitter la recette arrête la lecture');
  if (r3.cancelWhileIdle) ko('cancel() appelé alors que rien ne parlait'); else ok('jamais de cancel() à vide avant speak() (piège iPhone évité)');
  }

  /* re-rendu pendant la lecture (changement de portions) garde l'état */
  const r4 = await page.evaluate(async () => {
    go('recipe', { id: 3, _from: "go('home')", _portions: null });
    if (!document.querySelector('[data-tts]')) return { err: 'pas de bouton' };
    document.querySelector('[data-tts]').click();
    await new Promise(r => setTimeout(r, 9));
    chPort(1); /* re-rend toute la fiche */
    const btn = document.querySelector('[data-tts]');
    const out = { label: btn.textContent, pressed: btn.getAttribute('aria-pressed'), lit: document.querySelectorAll('.steps li.reading').length, active: window.TTS.active };
    ttsStop(false); return out;
  });
  if (r4.err) ko('scénario re-rendu : ' + r4.err);
  else if (r4.label !== '⏹ Arrêter la lecture' || r4.pressed !== 'true' || !r4.lit || !r4.active) ko('après un re-rendu (portions) le bouton/surlignage perdent la lecture en cours : ' + JSON.stringify(r4));
  else ok('changer les portions pendant la lecture garde « Arrêter » et le surlignage');

  /* (4) erreur du moteur → cause exacte */
  const r5 = await page.evaluate(async () => {
    window.__tts.mode = 'fail';
    go('recipe', { id: 0, _from: "go('home')", _portions: null });
    if (!document.querySelector('[data-tts]')) return { err: 'pas de bouton' };
    document.querySelector('[data-tts]').click();
    await new Promise(r => setTimeout(r, 30));
    const t = document.getElementById('toast');
    const out = { toast: t ? t.textContent : '', active: window.TTS.active, label: document.querySelector('[data-tts]').textContent };
    window.__tts.mode = 'ok'; return out;
  });
  if (r5.err) ko('scénario erreur moteur : ' + r5.err);
  else if (!/synthesis-unavailable/.test(r5.toast) || !/aucune voix/.test(r5.toast)) ko('l\'erreur du moteur n\'est pas dite avec sa cause : « ' + r5.toast + ' »');
  else if (r5.active || r5.label !== '🔊 Lire les étapes') ko('après une erreur le bouton reste sur « Arrêter »');
  else ok('erreur du moteur → message avec la cause exacte + bouton remis à « Lire »');

  /* moteur muet (jamais de start) → conseil volume/silencieux après 3 s */
  const r6 = await page.evaluate(async () => {
    window.__tts.mode = 'silent';
    go('recipe', { id: 1, _from: "go('home')", _portions: null });
    if (!document.querySelector('[data-tts]')) return 'pas de bouton';
    document.querySelector('[data-tts]').click();
    await new Promise(r => setTimeout(r, 3300));
    const t = document.getElementById('toast');
    const out = t ? t.textContent : ''; ttsStop(false); window.__tts.mode = 'ok'; return out;
  });
  if (!/Aucun son/.test(r6)) ko('moteur muet : pas de conseil « Aucun son ? » après 3 s (« ' + r6 + ' »)'); else ok('moteur muet 3 s → conseil volume / bouton silencieux');

  if (jsErrors.length) ko('erreurs JS : ' + jsErrors.join(' | ')); else ok('0 erreur JS pendant toute la passe');
  await ctx.close();
}

/* (5) navigateur sans moteur vocal */
{
  const { page, ctx, jsErrors } = await openPage(`(() => { try { Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true }); } catch (e) {} try { delete window.SpeechSynthesisUtterance; window.SpeechSynthesisUtterance = undefined; } catch (e) {} })();`);
  const r = await page.evaluate(async () => {
    go('recipe', { id: 0, _from: "go('home')", _portions: null });
    const btn = document.querySelector('[data-tts]'); if (!btn) return { toast: 'pas de bouton', label: '', active: false };
    btn.click();
    await new Promise(r => setTimeout(r, 10));
    return { toast: document.getElementById('toast').textContent, label: btn.textContent, active: window.TTS.active };
  });
  if (!/non disponible/.test(r.toast) || r.active || r.label !== '🔊 Lire les étapes') ko('sans moteur vocal : message ou état incorrect ' + JSON.stringify(r));
  else ok('sans moteur vocal → message clair, bouton inchangé');
  if (jsErrors.length) ko('erreurs JS sans moteur : ' + jsErrors.join(' | '));
  await ctx.close();
}

await browser.close();
server.close();
if (fails.length) { console.log(`\n❌ verify-cuisine-lecture : ${fails.length} problème(s)`); process.exit(1); }
console.log('\n✅ verify-cuisine-lecture : la lecture à voix haute du livre de cuisine est prouvée (vraie page, moteur vocal simulé)');
