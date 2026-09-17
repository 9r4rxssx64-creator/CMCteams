#!/usr/bin/env node
/* video.mjs — la machine à vidéos courtes SANS VISAGE (Kevin 2026-09-17 « crée
   d'autres vidéos, encore du contenu qui rapporte »).

   Un script PUBLIC (scripts.json : 5 lignes, une légende, des hashtags) →
   une carte par ligne (texte plein écran, 1080×1920, thème clair ou sombre) +
   la ligne lue par LA VOIX DU DOMAINE (lingua.kd-mc.com/__lingua/tts, déjà en
   prod, cache à vie — aucun nouveau moteur) → ffmpeg colle le tout → un MP4
   de 20 à 40 s + un fichier .json à côté (légende, hashtags, durée).
   Voix injoignable → carte muette de 3,2 s (jamais une vidéo vide, on le DIT
   dans le journal : voix=muet).

   Tourne en CI (le runner a ffmpeg et le réseau). Ici, seule la logique pure
   est testée (tests/pub-videos.test.mjs) ; le rendu est prouvé par le workflow.
     VIDEOS=all|avis|avis-01,kit-02  node tools/pub/video.mjs
   Dernière ligne du journal : « PUB RENDUE n/n » (ou « PUB INCOMPLÈTE n/m »). */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { lireCatalogue } from '../produits/fabrique.mjs';

export const SCRIPTS = new URL('./scripts.json', import.meta.url);
export const SORTIE = fileURLToPath(new URL('./out/', import.meta.url));
export const TTS = 'https://lingua.kd-mc.com/__lingua/tts';
export const VOIX = 'nova';
export const POLICE = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
export const THEMES = {
  sombre: { fond: '#0D0F14', texte: '#FFFFFF', accent: '#E8B830' },
  clair: { fond: '#FFFFFF', texte: '#0D0F14', accent: '#B8860B' },
};
export const PAUSE = 0.35;      // silence entre deux cartes
export const CARTE_MIN = 2.2;   // une carte ne dure jamais moins (lisible)
export const CARTE_MUETTE = 3.2;

export function lireScripts(url = SCRIPTS) { return JSON.parse(readFileSync(url, 'utf8')); }

/* ── Vérité du script (avant tout rendu) ─────────────────────────────────── */
const INTERDIT = /\bprompts?\b|garanti|\b\d+ ?%|gagne[sz]? \d|rapporte|revenu|tvA|urssaf|article L/i;
export function valideScript(v, { produits = [] } = {}) {
  const e = [];
  if (!/^[a-z]+-\d{2}$/.test(String(v.id || ''))) e.push('id attendu « niche-01 »');
  if (produits.length && !produits.includes(v.produit)) e.push('produit inconnu : ' + v.produit);
  if (!/^https:\/\/kit\.kd-mc\.com\//.test(String(v.page || ''))) e.push('page hors kit.kd-mc.com');
  if (!THEMES[v.theme]) e.push('thème inconnu : ' + v.theme);
  const lignes = Array.isArray(v.lignes) ? v.lignes : [];
  if (lignes.length < 4 || lignes.length > 7) e.push('4 à 7 lignes attendues (' + lignes.length + ')');
  for (const l of lignes) {
    if (typeof l !== 'string' || l.trim().length < 8) e.push('ligne trop courte : « ' + l + ' »');
    if (String(l).length > 95) e.push('ligne trop longue pour l\'écran (' + String(l).length + ') : « ' + String(l).slice(0, 30) + '… »');
    if (INTERDIT.test(String(l))) e.push('mot interdit (jargon, promesse ou chiffre invérifiable) : « ' + l + ' »');
  }
  if (!lignes.some((l) => /gratuit|l'année/i.test(l))) e.push('la dernière carte doit rappeler le module 1 gratuit (ou l\'année du Club)');
  if (typeof v.legende !== 'string' || v.legende.length < 60 || v.legende.length > 600) e.push('légende : 60 à 600 caractères');
  if (INTERDIT.test(String(v.legende))) e.push('légende : mot interdit');
  const h = Array.isArray(v.hashtags) ? v.hashtags : [];
  if (h.length < 3 || h.length > 6 || !h.every((t) => /^#[a-z0-9]{2,30}$/.test(t))) e.push('3 à 6 hashtags en minuscules sans accent');
  const emoji = (JSON.stringify(v).match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || []).length;
  if (emoji) e.push('émoji interdit');
  return { ok: e.length === 0, erreurs: e };
}
export function produitsConnus() {
  return ['kit-ia', 'club-ia'].concat(lireCatalogue().produits.map((p) => p.id));
}

/* ── Texte à l'écran : découpage en lignes courtes (drawtext ne replie pas) ── */
export function enveloppe(texte, max = 20) {
  const mots = String(texte).trim().split(/\s+/);
  const lignes = []; let cur = '';
  for (const m of mots) {
    if (!cur) { cur = m; continue; }
    if ((cur + ' ' + m).length <= max) cur += ' ' + m; else { lignes.push(cur); cur = m; }
  }
  if (cur) lignes.push(cur);
  return lignes;
}
/* Taille de police : moins il y a de lignes, plus c'est gros (lisible sur téléphone) */
export function taillePolice(nbLignes) { return nbLignes <= 2 ? 88 : nbLignes <= 4 ? 76 : 64; }

/* ── Le plan : durée de chaque carte à partir des durées audio ───────────── */
export function planCartes(lignes, durees) {
  return lignes.map((texte, i) => {
    const audio = durees[i];
    const duree = audio == null ? CARTE_MUETTE : Math.max(CARTE_MIN, Math.round((audio + PAUSE) * 100) / 100);
    return { i, texte, duree, muet: audio == null };
  });
}

/* ── Commandes ffmpeg (pures : des tableaux d'arguments, testables) ──────── */
const couleurFF = (hex) => '0x' + String(hex).replace('#', '');
export function argsCarte({ carte, n, theme, marque, fichierTexte, audio, sortie, police = POLICE }) {
  const t = THEMES[theme] || THEMES.sombre;
  const lignes = enveloppe(carte.texte);
  const taille = taillePolice(lignes.length);
  const filtres = [
    `drawtext=fontfile=${police}:textfile=${fichierTexte}:fontcolor=${couleurFF(t.texte)}:fontsize=${taille}:line_spacing=22:x=(w-text_w)/2:y=(h-text_h)/2-60`,
    `drawtext=fontfile=${police}:text='${marque}':fontcolor=${couleurFF(t.accent)}:fontsize=44:x=(w-text_w)/2:y=h-220`,
    `drawtext=fontfile=${police}:text='${carte.i + 1} / ${n}':fontcolor=${couleurFF(t.accent)}@0.7:fontsize=36:x=w-text_w-64:y=96`,
    `drawbox=x=96:y=h-140:w=(w-192)*${(carte.i + 1) / n}:h=8:color=${couleurFF(t.accent)}:t=fill`,
    `fade=t=in:st=0:d=0.25,fade=t=out:st=${Math.max(0, carte.duree - 0.25).toFixed(2)}:d=0.25`,
    'format=yuv420p',
  ].join(',');
  const args = ['-y', '-f', 'lavfi', '-i', `color=c=${couleurFF(t.fond)}:s=1080x1920:r=30:d=${carte.duree}`];
  if (audio) args.push('-i', audio); else args.push('-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono');
  args.push('-vf', filtres, '-t', String(carte.duree), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-r', '30',
    '-c:a', 'aac', '-b:a', '96k', '-ar', '48000', '-ac', '1', '-shortest', sortie);
  return args;
}
export function argsConcat(liste, sortie) {
  return ['-y', '-f', 'concat', '-safe', '0', '-i', liste, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', sortie];
}
export function fichierConcat(chemins) { return chemins.map((c) => 'file \'' + String(c).replace(/'/g, "'\\''") + '\'').join('\n') + '\n'; }

/* ── Réseau + processus (CI seulement) ───────────────────────────────────── */
export async function voix(texte, { voixId = VOIX, log = () => {} } = {}) {
  for (let essai = 1; essai <= 2; essai++) {
    try {
      const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 20000);
      const r = await fetch(TTS + '?v=' + voixId + '&t=' + encodeURIComponent(texte), { signal: ctrl.signal });
      clearTimeout(t);
      const type = r.headers.get('content-type') || '';
      if (r.ok && /audio/.test(type)) return Buffer.from(await r.arrayBuffer());
      log('  voix : HTTP ' + r.status + ' ' + type.slice(0, 40) + (essai < 2 ? ' → nouvel essai' : ''));
    } catch (e) { log('  voix : ' + (e && e.message ? e.message : e) + (essai < 2 ? ' → nouvel essai' : '')); }
  }
  return null;
}
export function ffmpeg(args, log) {
  const r = spawnSync('ffmpeg', args, { encoding: 'utf8' });
  if (r.status !== 0) { log('  ffmpeg : ' + String(r.stderr || '').split('\n').filter(Boolean).slice(-3).join(' | ')); return false; }
  return true;
}
export function dureeAudio(fichier) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', fichier], { encoding: 'utf8' });
  const d = parseFloat(String(r.stdout || '').trim());
  return Number.isFinite(d) && d > 0 ? d : null;
}

export function selection(videos, choix) {
  const c = String(choix || 'all').trim();
  if (c === 'all' || !c) return videos;
  const cles = c.split(',').map((s) => s.trim()).filter(Boolean);
  return videos.filter((v) => cles.some((k) => v.id === k || v.id.startsWith(k + '-') || v.produit === k));
}

export async function rendVideo(v, { marque, dossier, log }) {
  const dir = join(dossier, v.id); mkdirSync(dir, { recursive: true });
  const durees = []; const audios = [];
  for (let i = 0; i < v.lignes.length; i++) {
    const buf = await voix(v.lignes[i], { log });
    if (buf) { const f = join(dir, 'voix-' + i + '.mp3'); writeFileSync(f, buf); const d = dureeAudio(f); audios.push(d ? f : null); durees.push(d); }
    else { audios.push(null); durees.push(null); }
  }
  const cartes = planCartes(v.lignes, durees);
  const morceaux = [];
  for (const c of cartes) {
    const ft = join(dir, 'texte-' + c.i + '.txt'); writeFileSync(ft, enveloppe(c.texte).join('\n'));
    const out = join(dir, 'carte-' + c.i + '.mp4');
    if (!ffmpeg(argsCarte({ carte: c, n: cartes.length, theme: v.theme, marque, fichierTexte: ft, audio: audios[c.i], sortie: out }), log)) return null;
    morceaux.push(out);
  }
  const liste = join(dir, 'concat.txt'); writeFileSync(liste, fichierConcat(morceaux));
  const final = join(dossier, v.id + '.mp4');
  if (!ffmpeg(argsConcat(liste, final), log)) return null;
  const duree = cartes.reduce((s, c) => s + c.duree, 0);
  const muettes = cartes.filter((c) => c.muet).length;
  const fiche = { id: v.id, produit: v.produit, page: v.page, legende: v.legende, hashtags: v.hashtags, duree: Math.round(duree * 10) / 10, voix: muettes ? (muettes === cartes.length ? 'muet' : 'partielle') : 'domaine', cartes: cartes.length, fichier: v.id + '.mp4', rendu: new Date().toISOString() };
  writeFileSync(join(dossier, v.id + '.json'), JSON.stringify(fiche, null, 2) + '\n');
  return fiche;
}

export async function principal(env = process.env, log = console.log) {
  const s = lireScripts();
  const connus = produitsConnus();
  const mauvais = s.videos.map((v) => ({ v, r: valideScript(v, { produits: connus }) })).filter((x) => !x.r.ok);
  if (mauvais.length) throw new Error('scripts refusés : ' + mauvais.map((x) => x.v.id + ' (' + x.r.erreurs.join(' ; ') + ')').join(' · '));
  const choisies = selection(s.videos, env.VIDEOS);
  if (!choisies.length) throw new Error('aucune vidéo pour VIDEOS=' + env.VIDEOS);
  const dossier = env.PUB_OUT || SORTIE; mkdirSync(dossier, { recursive: true });
  if (!existsSync(POLICE)) throw new Error('police absente : ' + POLICE + ' (installer fonts-dejavu-core)');
  log(choisies.length + ' vidéo(s) à rendre : ' + choisies.map((v) => v.id).join(', ') + ' · voix ' + VOIX + ' du domaine · sortie ' + dossier);
  let ok = 0; const fiches = [];
  for (const v of choisies) {
    log('▶ ' + v.id + ' (' + v.produit + ', ' + v.lignes.length + ' cartes, thème ' + v.theme + ')');
    const f = await rendVideo(v, { marque: s.marque, dossier, log });
    if (!f) { log('  ÉCHEC du rendu ' + v.id); continue; }
    ok++; fiches.push(f);
    log('  VIDÉO OK ' + f.id + ' ' + f.duree + ' s · voix=' + f.voix);
  }
  writeFileSync(join(dossier, 'index.json'), JSON.stringify({ rendu: new Date().toISOString(), videos: fiches }, null, 2) + '\n');
  log((ok === choisies.length ? 'PUB RENDUE ' : 'PUB INCOMPLÈTE ') + ok + '/' + choisies.length);
  if (ok !== choisies.length) process.exitCode = 1;
  return { ok, total: choisies.length, fiches };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  principal().catch((e) => { console.error('ÉCHEC : ' + (e && e.message ? e.message : e)); process.exit(1); });
}
