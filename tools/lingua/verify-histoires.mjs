#!/usr/bin/env node
/* 📜 GARDE — « l'histoire et les anecdotes de chaque langue » (Kevin 2026-08-13).

   POURQUOI : une anecdote fausse est pire que pas d'anecdote. On l'affiche comme un fait,
   l'élève la retient, et il la répète. La règle de Kevin est « vérité, rien de faux, partout
   toujours » — donc ce contenu passe la même porte que le reste de Lingua :

     --struct   (défaut, 0 clé, tourne à CHAQUE changement) : contrôle mécanique.
                Chaque langue enseignée a son histoire ; chaque fait porte une SOURCE non vide ;
                rien de vide, rien en double ; et surtout : le fichier est VRAIMENT branché
                dans l'app (chargé, affiché, mis en cache) — sinon c'est du contenu mort.
     --semantic : SECOND AVIS INDÉPENDANT (Gemini/Mistral, un modèle qui n'a pas écrit ce
                texte). Il ne corrige RIEN : il écrit un rapport des faits douteux
                (audit/lingua-histoires-verite.md), que je relis avant de toucher quoi que ce
                soit — un juge IA se trompe aussi (règle « vérifier avant d'agir »).

   Lance : node tools/lingua/verify-histoires.mjs [--semantic]
*/
import fs from 'fs';
import vm from 'vm';
import path from 'path';

const ROOT = path.resolve(process.argv.find((a, i) => i >= 2 && !a.startsWith('--')) || 'lingua');
const SEMANTIC = process.argv.includes('--semantic');
const lire = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

/* ---------- chargement ---------- */
function charge(fichier) { const ctx = {}; vm.createContext(ctx); vm.runInContext(lire(fichier), ctx); return ctx; }
const data = charge('data.js');
const hist = charge('histoires-langues.js');
const LANG_HISTOIRE = hist.LANG_HISTOIRE || {};
const COURS = Object.keys(data.COURSES || {});

const errs = [];
const ko = (m) => errs.push(m);

/* ---------- 1. Contrôle mécanique du contenu ---------- */
const MINI_HISTOIRE = 120;   // en dessous, ce n'est pas une histoire, c'est une étiquette
const MINI_FAIT = 25;
const MINI_FAITS = 3;        // moins de 3 anecdotes = un écran vide, pas une rubrique

COURS.forEach((lg) => { if (!LANG_HISTOIRE[lg]) ko('langue enseignée SANS histoire : ' + lg); });

Object.keys(LANG_HISTOIRE).forEach((lg) => {
  const h = LANG_HISTOIRE[lg];
  const ou = 'langue « ' + lg + ' »';
  if (!h.nom || !String(h.nom).trim()) ko(ou + ' : nom manquant');
  if (!h.src || !String(h.src).trim()) ko(ou + ' : source de l\'histoire manquante');
  if (typeof h.histoire !== 'string' || h.histoire.trim().length < MINI_HISTOIRE) ko(ou + ' : histoire absente ou trop courte (< ' + MINI_HISTOIRE + ' caractères)');
  const faits = Array.isArray(h.faits) ? h.faits : [];
  if (faits.length < MINI_FAITS) ko(ou + ' : ' + faits.length + ' anecdote(s), il en faut au moins ' + MINI_FAITS);
  const vus = new Set();
  faits.forEach((f, i) => {
    const q = ou + ', anecdote ' + (i + 1);
    if (typeof f.t !== 'string' || f.t.trim().length < MINI_FAIT) ko(q + ' : texte absent ou trop court');
    if (!f.src || !String(f.src).trim()) ko(q + ' : SANS SOURCE — un fait sans source ne se publie pas');
    const cle = String(f.t || '').trim().toLowerCase();
    if (vus.has(cle)) ko(q + ' : répétée à l\'identique dans la même langue'); vus.add(cle);
    if (/[<>]/.test(String(f.t || '') + String(f.src || ''))) ko(q + ' : contient du HTML — interdit (le texte est affiché tel quel)');
  });
});

/* ---------- 2. Le contenu est-il VRAIMENT branché ? (Déclaration ≠ Déploiement) ---------- */
const app = lire('app.js'), html = lire('index.html'), sw = lire('sw.js');
const brancher = [
  ['index.html charge histoires-langues.js', /<script src="histoires-langues\.js"><\/script>/.test(html)],
  ['le fichier est mis en cache hors-ligne (sw.js)', /histoires-langues\.js/.test(sw)],
  ['la vue vHistoire existe', /function vHistoire\(\)/.test(app)],
  ['la vue est réellement affichée (render)', /VIEW==="histoire"\)\s*app\.appendChild\(vHistoire\(\)\)/.test(app)],
  ['une carte y mène depuis l\'accueil', /go\("histoire"\)/.test(app)],
  ['l\'anecdote du jour tourne (pas toujours la même)', /function anecdoteDuJour\(\)/.test(app) && /anecdoteDuJour\(\)/.test(app.replace(/function anecdoteDuJour\(\)/, ''))],
  ['chaque source est cliquable vers son article', /function wikiLien\(/.test(app) && /wikiLien\(f\.src\)/.test(app)],
  ['le texte est inséré sans HTML (anti-injection)', /tx\.textContent=f\.t/.test(app)],
];
brancher.forEach(([quoi, ok]) => { if (!ok) ko('PAS BRANCHÉ : ' + quoi); });

/* ---------- 3. Verdict structurel ---------- */
const nb = Object.keys(LANG_HISTOIRE).length;
const nbFaits = Object.values(LANG_HISTOIRE).reduce((s, h) => s + ((h.faits || []).length), 0);
console.log('📜 Histoire & anecdotes — ' + nb + ' langue(s), ' + nbFaits + ' anecdote(s), toutes sourcées.');
brancher.forEach(([quoi, ok]) => console.log((ok ? '✅ ' : '❌ ') + quoi));
if (errs.length) { console.log('\n❌ ' + errs.length + ' problème(s) :'); errs.forEach((e) => console.log('   · ' + e)); }
else console.log('✅ Contrôle mécanique : rien à signaler.');

/* ---------- 4. Second avis INDÉPENDANT (ne corrige jamais, signale) ---------- */
async function callMistral(messages) {
  if (!process.env.MISTRAL_API_KEY) return null;
  const r = await fetch('https://api.mistral.ai/v1/chat/completions', { method: 'POST', headers: { authorization: 'Bearer ' + process.env.MISTRAL_API_KEY, 'content-type': 'application/json' }, body: JSON.stringify({ model: 'mistral-small-latest', messages, max_tokens: 1200, temperature: 0.1, response_format: { type: 'json_object' } }) });
  if (!r.ok) return null; const j = await r.json(); return j?.choices?.[0]?.message?.content;
}
async function callGemini(messages) {
  if (!process.env.GEMINI_API_KEY) return null;
  const sys = messages.find((m) => m.role === 'system'); const rest = messages.filter((m) => m.role !== 'system');
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ system_instruction: sys ? { parts: [{ text: sys.content }] } : undefined, contents: rest.map((m) => ({ role: 'user', parts: [{ text: m.content }] })), generationConfig: { maxOutputTokens: 1200, temperature: 0.1 } }) });
  if (!r.ok) return null; const j = await r.json(); return j?.candidates?.[0]?.content?.parts?.[0]?.text;
}
const parse = (t) => { if (!t) return null; try { const m = t.match(/\{[\s\S]*\}/); return JSON.parse(m ? m[0] : t); } catch { return null; } };

if (SEMANTIC) {
  const douteux = [];
  for (const lg of Object.keys(LANG_HISTOIRE)) {
    const h = LANG_HISTOIRE[lg];
    const liste = [{ t: h.histoire, src: h.src, quoi: 'présentation' }]
      .concat((h.faits || []).map((f, i) => ({ t: f.t, src: f.src, quoi: 'anecdote ' + (i + 1) })));
    const sys = "Tu es vérificateur de faits, rigoureux et PRUDENT. Tu ne signales QUE ce qui est FACTUELLEMENT FAUX ou invérifiable, jamais le style, jamais une formulation que tu aurais tournée autrement.";
    const user = 'Voici des affirmations destinées à une application d\'apprentissage des langues, sur le ' + (h.nom || lg) + '.\n'
      + liste.map((x, i) => (i + 1) + '. [' + x.quoi + '] ' + x.t + '   (source annoncée : « ' + x.src + ' »)').join('\n')
      + '\n\nPour CHACUNE, dis si elle est vraie. RÈGLES ANTI-FAUSSE-ALERTE, à respecter absolument :'
      + '\n- une formulation prudente (« environ », « souvent présenté comme ») N\'EST PAS une erreur ;'
      + '\n- une simplification pédagogique correcte n\'est pas une erreur ;'
      + '\n- ne signale pas une reformulation que tu préfères : uniquement du FAUX (date, chiffre, nom, attribution, événement).'
      + '\n- si tu n\'es pas sûr, NE SIGNALE PAS.'
      + '\nRéponds UNIQUEMENT en JSON : {"faux": [{"num": 1, "probleme": "ce qui est faux, en 12 mots max", "correction": "la version exacte"}]}. Liste VIDE si tout est correct.';
    const raw = (await callGemini([{ role: 'system', content: sys }, { role: 'user', content: user }]))
      || (await callMistral([{ role: 'system', content: sys }, { role: 'user', content: user }]));
    const j = parse(raw);
    if (!j) { douteux.push({ langue: lg, note: 'juge indisponible (ni Gemini ni Mistral) — rien n\'a été vérifié pour cette langue' }); continue; }
    (Array.isArray(j.faux) ? j.faux : []).forEach((f) => {
      const src = liste[(f.num | 0) - 1];
      if (!src) return;
      douteux.push({ langue: lg, quoi: src.quoi, texte: src.t, probleme: f.probleme, correction: f.correction, source: src.src });
    });
    console.log('· juge ' + lg + ' : ' + (Array.isArray(j.faux) ? j.faux.length : 0) + ' point(s) signalé(s)');
  }
  fs.mkdirSync(path.join(ROOT, '..', 'audit'), { recursive: true });
  const md = ['# Second avis indépendant — histoire & anecdotes des langues', '',
    'Rapport du ' + new Date().toISOString().slice(0, 10) + '. Un modèle qui n\'a PAS écrit ces textes les relit.',
    'Ce rapport ne modifie rien : chaque point est à vérifier à la main contre la source avant correction.', '',
    douteux.length ? '## ' + douteux.length + ' point(s) à vérifier' : '## Aucun point signalé', ''];
  douteux.forEach((d) => md.push('- **' + d.langue + '** ' + (d.quoi ? '(' + d.quoi + ')' : '') + ' — ' + (d.note || (d.probleme + '\n  - texte : « ' + d.texte + ' »\n  - correction proposée : ' + d.correction + '\n  - source annoncée : ' + d.source))));
  fs.writeFileSync(path.join(ROOT, '..', 'audit', 'lingua-histoires-verite.md'), md.join('\n') + '\n', 'utf8');
  console.log('\nRapport : audit/lingua-histoires-verite.md — ' + douteux.length + ' point(s) à relire (rien n\'a été modifié).');
}

process.exit(errs.length ? 1 : 0);
