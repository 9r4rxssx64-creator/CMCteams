#!/usr/bin/env node
/* Lingua — VÉRITÉ, RIEN DE FAUX, PARTOUT TOUJOURS (Kevin 2026-08-09).

   Vérifie TOUT le contenu de Lingua, pas seulement les histoires auto-générées :
     - CURRICULUM : chaque mot / phrase traduit dans les 6 langues (parité, aucun vide).
     - STORIES    : chaque ligne dans les 6 langues + quiz cohérent (bonne réponse dans les bornes).
     - PHRASEBOOK : chaque entrée dans les 6 langues.

   Deux modes :
     --struct    (défaut, 0 clé) : contrôle STRUCTUREL déterministe. Exit 1 si le MOINDRE faux
                 structurel (langue manquante/vide, quiz hors bornes, id en double). = garde CI « toujours ».
     --semantic  : SECOND AVIS INDÉPENDANT (modèle IA) sur les traductions + réponses de quiz.
                 N'ÉDITE JAMAIS : écrit un rapport des points DOUTEUX (audit/lingua-verite.md) pour revue.
                 (Un juge IA peut se tromper → on signale, on ne supprime pas à l'aveugle : règle « vérifier avant d'agir ».)
*/
import fs from 'fs';
import vm from 'vm';
import path from 'path';

const ROOT = path.resolve(process.argv.find((a, i) => i >= 2 && !a.startsWith('--')) || 'lingua');
const DATA = path.join(ROOT, 'data.js');
const LANGS = ['en', 'it', 'es', 'de', 'pt', 'nl'];
const LNAMES = { en: 'anglais', it: 'italien', es: 'espagnol', de: 'allemand', pt: 'portugais', nl: 'néerlandais' };
const mode = process.argv.includes('--semantic') ? 'semantic' : 'struct';

function load() { const ctx = {}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(DATA, 'utf8'), ctx); return ctx; }

/* ---------------- Contrôle STRUCTUREL (déterministe, sans IA) ---------------- */
function structCheck(ctx) {
  const errs = [];
  const { CURRICULUM = [], LEX = {}, STORIES = [], PHRASEBOOK = {} } = ctx;
  // 1) CURRICULUM → LEX : chaque mot/phrase traduit dans les 6 langues, non vide
  const terms = new Set();
  CURRICULUM.forEach((u) => (u.L || []).forEach((l) => { (l.w || []).forEach((w) => terms.add(w)); (l.p || []).forEach((p) => terms.add(p)); }));
  terms.forEach((t) => LANGS.forEach((lg) => { const v = LEX[lg] && LEX[lg][t]; if (typeof v !== 'string' || !v.trim()) errs.push('CURRICULUM « ' + t +' » : ' + lg + ' manquant/vide'); }));
  // 2) LEX parité : mêmes clés dans les 6 langues
  const base = Object.keys(LEX.en || {});
  LANGS.forEach((lg) => { const k = new Set(Object.keys(LEX[lg] || {})); base.forEach((key) => { if (!k.has(key)) errs.push('LEX « ' + key + ' » absent en ' + lg); }); });
  // 3) STORIES
  const ids = new Set();
  STORIES.forEach((st, si) => {
    if (!st.id) errs.push('STORY#' + si + ' sans id'); else if (ids.has(st.id)) errs.push('STORY id en double : ' + st.id); ids.add(st.id);
    (st.lignes || []).forEach((l, i) => {
      if (typeof l.fr !== 'string' || !l.fr.trim()) errs.push(st.id + ' ligne ' + i + ' : fr vide');
      LANGS.forEach((lg) => { const v = l.t && l.t[lg]; if (typeof v !== 'string' || !v.trim()) errs.push(st.id + ' ligne ' + i + ' : ' + lg + ' manquant/vide'); });
    });
    (st.quiz || []).forEach((q, i) => {
      if (typeof q.q !== 'string' || !q.q.trim()) errs.push(st.id + ' q' + i + ' : question vide');
      if (!Array.isArray(q.opts) || q.opts.length < 2) errs.push(st.id + ' q' + i + ' : <2 options');
      if (typeof q.ok !== 'number' || q.ok < 0 || q.ok >= (q.opts || []).length) errs.push(st.id + ' q' + i + ' : bonne réponse hors bornes');
    });
  });
  // 4) PHRASEBOOK : 6 langues non vides
  Object.keys(PHRASEBOOK).forEach((fr) => LANGS.forEach((lg) => { const v = PHRASEBOOK[fr] && PHRASEBOOK[fr][lg]; if (typeof v !== 'string' || !v.trim()) errs.push('PHRASEBOOK « ' + fr + ' » : ' + lg + ' manquant/vide'); }));
  return { errs, counts: { terms: terms.size, lex: base.length, stories: STORIES.length, phrases: Object.keys(PHRASEBOOK).length } };
}

/* ---------------- SECOND AVIS INDÉPENDANT (IA) — audit, n'édite pas ---------------- */
async function callMistral(messages) {
  if (!process.env.MISTRAL_API_KEY) return null;
  const r = await fetch('https://api.mistral.ai/v1/chat/completions', { method: 'POST', headers: { authorization: 'Bearer ' + process.env.MISTRAL_API_KEY, 'content-type': 'application/json' }, body: JSON.stringify({ model: 'mistral-small-latest', messages, max_tokens: 1200, temperature: 0.2, response_format: { type: 'json_object' } }) });
  if (!r.ok) return null; const j = await r.json(); return j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
}
async function callGemini(messages) {
  if (!process.env.GEMINI_API_KEY) return null;
  const sys = messages.find((m) => m.role === 'system'); const rest = messages.filter((m) => m.role !== 'system');
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ system_instruction: sys ? { parts: [{ text: sys.content }] } : undefined, contents: rest.map((m) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })), generationConfig: { maxOutputTokens: 1200, temperature: 0.2 } }) });
  if (!r.ok) return null; const j = await r.json(); return j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts && j.candidates[0].content.parts[0] && j.candidates[0].content.parts[0].text;
}
function parse(t) { if (!t) return null; try { const m = t.match(/\{[\s\S]*\}/); return JSON.parse(m ? m[0] : t); } catch { return null; } }

async function semanticAudit(ctx) {
  const { STORIES = [] } = ctx;
  const suspects = [];
  for (const st of STORIES) {
    const pairs = [];
    st.lignes.forEach((l) => LANGS.forEach((lg) => pairs.push('[' + LNAMES[lg] + '] "' + l.fr + '" => "' + l.t[lg] + '"')));
    const histoireFr = st.lignes.map((l) => l.qui + ' ' + l.fr).join('\n');
    const quizTxt = st.quiz.map((q, i) => 'Q' + (i + 1) + ' : ' + q.q + ' | options: [' + q.opts.join(' , ') + '] | réponse annoncée: "' + q.opts[q.ok] + '"').join('\n');
    const sys = "Tu es correcteur plurilingue rigoureux et PRUDENT. Tu ne signales QUE les erreurs CERTAINES et flagrantes, jamais le style ni un doute.";
    const user = 'Traductions FR→langue :\n' + pairs.join('\n')
      + "\n\nHistoire (🐝=Bee, 3e personne elle/lui ; 🧑=l'ami, moi/toi) :\n" + histoireFr + '\n' + quizTxt
      + '\nSignale UNIQUEMENT les traductions VRAIMENT fausses (contresens, mauvais mot, faute de genre/accord/orthographe) ou une réponse de quiz réellement incorrecte. Ignore le style. En cas de doute, NE signale PAS.'
      + '\nRéponds UNIQUEMENT en JSON : {"faux": [{"langue":"la langue","fr":"la phrase française","traduction":"la traduction fautive","correction":"la bonne traduction","raison":"en 6 mots max"}]}. Liste VIDE si tout est correct.';
    const raw = (await callGemini([{ role: 'system', content: sys }, { role: 'user', content: user }])) || (await callMistral([{ role: 'system', content: sys }, { role: 'user', content: user }]));
    const j = parse(raw);
    if (!j) { suspects.push({ story: st.id, notes: ['juge indisponible (ni Gemini ni Mistral)'] }); break; }
    const arr = Array.isArray(j.faux) ? j.faux : [];
    // Normalise en chaînes lisibles + jette le bruit (items sans paire fr/traduction, ou run-on absurde)
    const notes = arr.map((f) => {
      if (typeof f === 'string') return f.length <= 200 ? f : null;
      if (f && typeof f === 'object') {
        const fr = String(f.fr || '').slice(0, 80), tr = String(f.traduction || '').slice(0, 80), co = String(f.correction || '').slice(0, 80), lg = String(f.langue || '').slice(0, 20), ra = String(f.raison || '').slice(0, 60);
        if (!fr || !tr) return null; // sans paire concrète = bruit → ignoré
        return '[' + lg + '] "' + fr + '" => "' + tr + '"  (proposé: "' + co + '" · ' + ra + ')';
      }
      return null;
    }).filter(Boolean);
    if (notes.length) suspects.push({ story: st.id, notes });
  }
  return suspects;
}

/* ---------------- Orchestration ---------------- */
(async () => {
  const ctx = load();
  if (mode === 'struct') {
    const { errs, counts } = structCheck(ctx);
    console.log('VÉRITÉ (structure) — ' + counts.terms + ' mots, ' + counts.lex + ' entrées LEX ×6, ' + counts.stories + ' histoires, ' + counts.phrases + ' phrases.');
    if (errs.length) { console.log('FAUX STRUCTUREL (' + errs.length + ') :\n - ' + errs.slice(0, 40).join('\n - ')); process.exit(1); }
    console.log('OK : aucun faux structurel — 6 langues partout, quiz dans les bornes, 0 doublon.');
    process.exit(0);
  }
  // semantic
  const suspects = await semanticAudit(ctx);
  const outDir = path.resolve('audit'); try { fs.mkdirSync(outDir, { recursive: true }); } catch (_) {}
  const lines = ['# Lingua — audit VÉRITÉ (second avis indépendant)', '', 'Points DOUTEUX à revoir (l\'IA peut se tromper : vérifier avant de corriger).', ''];
  if (!suspects.length) lines.push('✅ Aucun point douteux signalé par le second modèle sur les histoires.');
  else suspects.forEach((s) => { lines.push('## ' + s.story); (s.notes || []).forEach((f) => lines.push('- ' + String(f))); lines.push(''); });
  fs.writeFileSync(path.join(outDir, 'lingua-verite.md'), lines.join('\n'));
  console.log((suspects.length ? ('SUSPECTS: ' + suspects.length + ' histoire(s) → audit/lingua-verite.md') : 'OK sémantique : rien de douteux signalé.'));
  process.exit(0);
})().catch((e) => { console.log('ERREUR: ' + (e && e.message || e)); process.exit(2); });
