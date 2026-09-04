#!/usr/bin/env node
/* PIPELINE ENTRE SESSIONS — le pont commun, sur GitLab.
 * ---------------------------------------------------------------------------
 * Kevin 2026-09-02 : « Sois sûr de ne rien oublier, lier ou perdre de chaque
 * session. Et le pipeline entre elles toutes et les futures. »
 *
 * POURQUOI. L'ancien pont (claude-todo-watcher, Firebase interrogé en boucle
 * depuis GitHub Actions) est mort avec la suspension GitHub — c'est même lui qui
 * l'a provoquée. Trois règles absolues de Kevin (auto-test/auto-fix, pipeline
 * self-healing, pipeline autonomie cross-projet) se sont retrouvées sans garde.
 *
 * CE QUI LE REMPLACE. Un registre + une boîte aux lettres dans le DÉPÔT, sur
 * `main` GitLab — la seule surface que TOUTES les sessions voient, présentes et
 * futures. Pas de service à héberger, pas de secret, rien à maintenir : le
 * pipeline est un fichier versionné, et git fait le reste.
 *
 * COMMENT UNE SESSION S'EN SERT (3 gestes, c'est tout) :
 *   au démarrage   node tools/pipeline/pipeline.mjs etat --id <moi>
 *   pour écrire    node tools/pipeline/pipeline.mjs message --de <moi> --a <lui> --sujet "…" --corps "…"
 *   avant de finir node tools/pipeline/pipeline.mjs maj --id <moi> --note "…" [--attend-kevin "…"]
 *
 * UNE SESSION FUTURE s'inscrit elle-même — rien à préparer pour elle :
 *   node tools/pipeline/pipeline.mjs enregistrer --id <slug> --titre "…" --branche "claude/…" --sujet "…"
 *
 * Puis elle commite `pipeline/sessions.json` et pousse sur SA branche. La
 * session « Domain Kdmc » (ou n'importe laquelle) reporte sur `main`.
 * Rien ne se perd : tout est dans l'historique git.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const FIC = resolve(RACINE, 'pipeline/sessions.json');
const AUJ = new Date().toISOString().slice(0, 10);

function lire() {
  if (!existsSync(FIC)) return { version: 1, maj: AUJ, sessions: {}, messages: [] };
  return JSON.parse(readFileSync(FIC, 'utf8'));
}
function ecrire(d) {
  d.maj = AUJ;
  writeFileSync(FIC, JSON.stringify(d, null, 2) + '\n');
}
/* --arg valeur → {arg: valeur} ; --drapeau → {drapeau: true} */
function args(av) {
  const o = {};
  for (let i = 0; i < av.length; i++) {
    if (!av[i].startsWith('--')) continue;
    const k = av[i].slice(2);
    o[k] = (av[i + 1] && !av[i + 1].startsWith('--')) ? av[++i] : true;
  }
  return o;
}
const j = (n, s) => String(n).padEnd(s);

const [, , cmd, ...reste] = process.argv;
const a = args(reste);
const d = lire();

switch (cmd) {

  /* ------------------------------------------------------------------ ÉTAT */
  case 'etat': {
    const ids = Object.keys(d.sessions).sort();
    console.log(`\n📋 ${ids.length} sessions — registre commun (maj ${d.maj})\n`);
    console.log('  ' + j('session', 22) + j('branche', 46) + j('état', 10) + 'attend');
    console.log('  ' + '─'.repeat(104));
    ids.forEach((id) => {
      const s = d.sessions[id];
      const att = s.attend_kevin ? '👤 ' + s.attend_kevin
        : s.attend_session ? '🔗 ' + s.attend_session : '—';
      console.log('  ' + j(id, 22) + j(s.branche || '—', 46) + j(s.etat || '?', 10) + att.slice(0, 46));
    });
    const moi = a.id;
    const pourMoi = (d.messages || []).filter((m) => m.etat === 'ouvert' && (!moi || m.a === moi || m.a === 'toutes'));
    console.log(`\n✉️  ${pourMoi.length} message(s) ouvert(s)${moi ? ' pour « ' + moi + ' »' : ''}`);
    pourMoi.forEach((m) => {
      console.log(`   [${m.id}] ${m.de} → ${m.a} · ${m.ts}`);
      console.log(`        ${m.sujet}`);
      if (m.corps) console.log(`        ${String(m.corps).replace(/\n/g, '\n        ')}`);
    });
    if (moi && !d.sessions[moi]) {
      console.log(`\n⚠️  « ${moi} » n'est pas inscrite au registre. Inscris-toi :`);
      console.log(`   node tools/pipeline/pipeline.mjs enregistrer --id ${moi} --titre "…" --branche "claude/…" --sujet "…"`);
    }
    console.log();
    break;
  }

  /* ---------------------------------------------------- INSCRIPTION (futures) */
  case 'enregistrer': {
    if (!a.id || !a.branche) { console.error('  --id et --branche sont obligatoires'); process.exit(1); }
    const dejaBranche = Object.entries(d.sessions).find(([k, s]) => s.branche === a.branche && k !== a.id);
    if (dejaBranche) { console.error(`  ❌ la branche ${a.branche} est déjà celle de « ${dejaBranche[0]} » — deux sessions sur la même branche se marchent dessus`); process.exit(1); }
    d.sessions[a.id] = {
      titre: a.titre || a.id,
      branche: a.branche,
      sujet: a.sujet || '',
      surfaces: a.surfaces ? String(a.surfaces).split(',').map((x) => x.trim()) : [],
      etat: 'actif',
      maj: AUJ,
      attend_kevin: null,
      attend_session: null,
      ...(d.sessions[a.id] || {}),
      ...(a.titre ? { titre: a.titre } : {}),
    };
    ecrire(d);
    console.log(`  ✅ « ${a.id} » inscrite (${a.branche}). Commite pipeline/sessions.json et pousse.`);
    break;
  }

  /* ------------------------------------------------------------ MISE À JOUR */
  case 'maj': {
    const s = d.sessions[a.id];
    if (!s) { console.error(`  ❌ session « ${a.id} » inconnue — utilise "enregistrer" d'abord`); process.exit(1); }
    if (a.etat) s.etat = a.etat;
    if (a.note) s.note = a.note;
    if (a['attend-kevin'] !== undefined) s.attend_kevin = a['attend-kevin'] === true ? null : a['attend-kevin'];
    if (a['attend-session'] !== undefined) s.attend_session = a['attend-session'] === true ? null : a['attend-session'];
    s.maj = AUJ;
    ecrire(d);
    console.log(`  ✅ « ${a.id} » mise à jour.`);
    break;
  }

  /* ---------------------------------------------------------------- MESSAGE */
  case 'message': {
    if (!a.de || !a.a || !a.sujet) { console.error('  --de, --a et --sujet sont obligatoires'); process.exit(1); }
    if (a.a !== 'toutes' && !d.sessions[a.a]) { console.error(`  ❌ destinataire « ${a.a} » inconnu (ou "toutes")`); process.exit(1); }
    const id = 'm' + String((d.messages || []).length + 1).padStart(3, '0');
    (d.messages = d.messages || []).push({
      id, de: a.de, a: a.a, sujet: a.sujet, corps: a.corps || '',
      ts: new Date().toISOString().slice(0, 16).replace('T', ' '), etat: 'ouvert',
    });
    if (a.a !== 'toutes' && d.sessions[a.a]) d.sessions[a.a].attend_session = `${a.de} : ${a.sujet}`;
    ecrire(d);
    console.log(`  ✅ message ${id} déposé pour « ${a.a} ».`);
    break;
  }

  /* ------------------------------------------------------------------ CLORE */
  case 'clore': {
    const m = (d.messages || []).find((x) => x.id === a.id);
    if (!m) { console.error(`  ❌ message « ${a.id} » introuvable`); process.exit(1); }
    m.etat = 'clos';
    m.reponse = a.reponse || '';
    if (d.sessions[m.a] && String(d.sessions[m.a].attend_session || '').startsWith(m.de + ' :')) d.sessions[m.a].attend_session = null;
    ecrire(d);
    console.log(`  ✅ message ${a.id} clos.`);
    break;
  }

  /* ------------------------------------------------------------- VÉRIFIER */
  case 'verifier': {
    const pb = [];
    const branches = {};
    Object.entries(d.sessions).forEach(([id, s]) => {
      if (!s.branche) pb.push(`${id} : aucune branche`);
      if (s.branche && branches[s.branche]) pb.push(`branche ${s.branche} partagée par « ${branches[s.branche]} » et « ${id} »`);
      if (s.branche) branches[s.branche] = id;
      if (!s.titre) pb.push(`${id} : aucun titre`);
    });
    (d.messages || []).forEach((m) => {
      if (m.a !== 'toutes' && !d.sessions[m.a]) pb.push(`message ${m.id} adressé à « ${m.a} » qui n'existe pas`);
      if (!d.sessions[m.de]) pb.push(`message ${m.id} envoyé par « ${m.de} » qui n'existe pas`);
    });
    pb.forEach((p) => console.log('  ❌ ' + p));
    console.log(pb.length ? `\n${pb.length} problème(s)` : `  ✅ registre cohérent : ${Object.keys(d.sessions).length} sessions, ${(d.messages || []).length} message(s), 0 branche en double`);
    process.exit(pb.length ? 1 : 0);
    break;
  }

  default:
    console.log(`\nPipeline entre sessions — registre commun sur GitLab main.

  etat        --id <moi>                     l'état de toutes + mes messages
  enregistrer --id <slug> --titre "…" --branche "claude/…" --sujet "…"
  maj         --id <moi> [--etat actif|pause|termine] [--note "…"]
                         [--attend-kevin "…"] [--attend-session "…"]
  message     --de <moi> --a <lui|toutes> --sujet "…" [--corps "…"]
  clore       --id <mNNN> [--reponse "…"]
  verifier                                   cohérence du registre (utilisé par le gate)
`);
}
