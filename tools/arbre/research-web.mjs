/**
 * Recherche web ÉLARGIE — au plus LOIN (ancêtres) et au plus RÉCENT.
 *
 * Complète research.mjs (INSEE, épuisé) avec les sources publiques suivantes :
 *  1. Arbres généalogiques PUBLICS Geneanet (abel88 = « Généalogies Monaco »,
 *     marieclaire1 = branche Maiffret) — peuvent remonter aux années 1600-1700.
 *  2. Pages « nom de famille » Geneanet (origine, répartition).
 *  3. Wikipédia (API JSON fiable) : personnages notables du nom, berceau Sarzens.
 *  4. Avis de décès récents (dansnoscoeurs/libramemoria) — le plus RÉCENT :
 *     un avis liste souvent la famille proche (« sa fille…, son fils… »).
 *
 * Tourne en CI (réseau ouvert). Chaque source peut être bloquée (anti-bot) →
 * échec par source TOLÉRÉ et signalé honnêtement. Sortie : arbre/research/WEB.md.
 */
import { mkdirSync, writeFileSync } from 'fs';

const OUT = 'arbre/research';
mkdirSync(OUT + '/webraw', { recursive: true });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function stripHtml(h) {
  return String(h)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|tr|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&eacute;/g, 'é').replace(/&egrave;/g, 'è').replace(/&ccedil;/g, 'ç').replace(/&#39;|&apos;/g, "'")
    .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
}
/* garde les lignes « généalogiques » : contiennent une année 1600-2026 ou un mot-clé */
function keepGenealogy(text, max) {
  const kw = /\b(1[6-9]\d\d|20[0-2]\d)\b|né|née|décéd|marié|épous|fils|fille|baptis|Sauvaigo|Maiffret|Desarzens|Sarzens|Dentau|Molinario|Van den Bosch/i;
  const out = [];
  for (const line of text.split('\n')) { const l = line.trim(); if (l.length > 3 && kw.test(l)) out.push(l.slice(0, 240)); if (out.length >= 260) break; }
  return out.join('\n').slice(0, max || 14000);
}

async function grab(id, url, note, opts) {
  const o = opts || {};
  let status = 0, body = '';
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 25000);
    const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'fr-FR,fr;q=0.9' }, signal: ctl.signal, redirect: 'follow' });
    clearTimeout(t); status = r.status; body = await r.text();
  } catch (e) { body = ''; status = status || 0; }
  writeFileSync(OUT + '/webraw/' + id + (o.json ? '.json' : '.html'), (body || '').slice(0, 400000));
  let extract = '';
  if (body && status < 400) extract = o.json ? body.slice(0, 8000) : keepGenealogy(stripHtml(body), o.max);
  return { id, url, note, status, ok: status > 0 && status < 400 && extract.length > 40, extract };
}

const SOURCES = [
  /* — LOIN : arbres publics Geneanet (peuvent remonter 1600-1700) — */
  { id: 'abel88_sauvaigo', url: 'https://gw.geneanet.org/abel88?lang=fr&m=N&v=SAUVAIGO', note: 'Arbre public « Généalogies Monaco » — index SAUVAIGO' },
  { id: 'abel88_maiffret', url: 'https://gw.geneanet.org/abel88?lang=fr&m=N&v=MAIFFRET', note: 'Arbre public « Généalogies Monaco » — index MAIFFRET' },
  { id: 'marieclaire1_maiffret', url: 'https://gw.geneanet.org/marieclaire1?lang=fr&m=N&v=MAIFFRET', note: 'Arbre public marieclaire1 — index MAIFFRET' },
  { id: 'marieclaire1_sauvaigo', url: 'https://gw.geneanet.org/marieclaire1?lang=fr&m=N&v=SAUVAIGO', note: 'Arbre public marieclaire1 — index SAUVAIGO' },
  /* — Origine des noms — */
  { id: 'nom_sauvaigo', url: 'https://www.geneanet.org/nom-de-famille/SAUVAIGO', note: 'Origine/répartition du nom SAUVAIGO', max: 5000 },
  { id: 'nom_maiffret', url: 'https://www.geneanet.org/nom-de-famille/MAIFFRET', note: 'Origine/répartition du nom MAIFFRET', max: 5000 },
  { id: 'nom_desarzens', url: 'https://www.geneanet.org/nom-de-famille/DESARZENS', note: 'Origine/répartition du nom DESARZENS', max: 5000 },
  /* — Wikipédia (API stable) : notables + berceau — */
  { id: 'wp_sauvaigo', url: 'https://fr.wikipedia.org/w/api.php?action=query&list=search&srsearch=Sauvaigo&format=json&srlimit=8', note: 'Wikipédia : personnalités SAUVAIGO (Nice)', json: true },
  { id: 'wp_maiffret', url: 'https://fr.wikipedia.org/w/api.php?action=query&list=search&srsearch=Maiffret&format=json&srlimit=8', note: 'Wikipédia : MAIFFRET', json: true },
  { id: 'wp_sarzens', url: 'https://fr.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exintro=1&titles=Sarzens&format=json', note: 'Wikipédia : Sarzens (Vaud) — berceau du nom Desarzens', json: true },
  { id: 'wp_desarzens', url: 'https://fr.wikipedia.org/w/api.php?action=query&list=search&srsearch=Desarzens&format=json&srlimit=8', note: 'Wikipédia : personnalités DESARZENS (Suisse)', json: true },
  /* — RÉCENT : avis de décès (listent souvent la famille proche) — */
  { id: 'avis_maiffret', url: 'https://www.dansnoscoeurs.fr/recherche?nom=maiffret', note: 'Avis de décès récents MAIFFRET', max: 6000 },
  { id: 'avis_sauvaigo', url: 'https://www.dansnoscoeurs.fr/recherche?nom=sauvaigo', note: 'Avis de décès récents SAUVAIGO', max: 6000 },
  { id: 'avis_desarzens', url: 'https://www.libramemoria.com/avis?ville=&nom=desarzens', note: 'Avis de décès récents DESARZENS', max: 6000 },
];

let md = '# 🌐 Recherche web élargie — au plus loin (ancêtres) et au plus récent\n\nGénérée le ' + new Date().toISOString().slice(0, 10) + ' par la CI. Chaque source peut bloquer les robots → statut indiqué honnêtement.\n\n';
let okN = 0;
for (const s of SOURCES) {
  const r = await grab(s.id, s.url, s.note, s);
  md += '## ' + s.id + ' — ' + s.note + '\n(HTTP ' + r.status + (r.ok ? ' ✅' : ' ❌ bloqué/vide') + ') · ' + s.url + '\n\n';
  if (r.ok) { okN++; md += '```\n' + r.extract + '\n```\n\n'; }
  else md += '_Source inaccessible en automatique — à consulter à la main via le lien._\n\n';
  await sleep(2500);
}
md += '---\n' + okN + '/' + SOURCES.length + ' sources lisibles automatiquement.\n';
writeFileSync(OUT + '/WEB.md', md);
console.log('OK — ' + okN + '/' + SOURCES.length + ' sources. Rapport: ' + OUT + '/WEB.md');
