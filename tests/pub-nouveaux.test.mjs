/* Garde de la chaîne pub AUTONOME (tools/pub/nouveaux.mjs + programmation.mjs) — hors ligne,
   faux modèle, dans test:ci. Ce qui coûte si c'est faux : un script publié avec du jargon ou
   une promesse (la porte de vérité doit refuser ET renvoyer la raison au modèle), un script
   répété, deux vidéos au même créneau Metricool, un post enregistré deux fois. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import * as N from '../tools/pub/nouveaux.mjs';
import * as P from '../tools/pub/programmation.mjs';
import { lireScripts, valideScript, produitsConnus } from '../tools/pub/video.mjs';

const S = lireScripts();
const BON = { lignes: ['Un mandat qui traîne depuis trois semaines.', 'Tu décris le bien en deux phrases.', "L'assistant écrit l'annonce, le titre et le message au vendeur.", 'Tu relis, tu corriges un mot, tu envoies.', 'Le module 1 est gratuit.'], legende: 'Un mandat qui traîne depuis trois semaines : tu décris le bien, l\'assistant écrit l\'annonce et le message au vendeur, tu relis et tu envoies. Kit IA de l\'agent immobilier sur kit.kd-mc.com', hashtags: ['#immobilier', '#mandat', '#agentimmobilier', '#ia'] };
const MAUVAIS = { ...BON, lignes: BON.lignes.map((l, i) => (i === 1 ? 'Copie ce prompt et gagne 30 % de temps.' : l)) };
const faux = (reponses) => { const appels = []; return { appels, fn: async (env, prompt, retour) => { appels.push({ prompt, retour }); return reponses.shift(); } }; };

test('demande, id suivant, lecture de la réponse (avec ou sans clôture ```json)', () => {
  assert.deepEqual(N.litDemande('immo:1, club:2,avis'), [{ niche: 'immo', n: 1 }, { niche: 'club', n: 2 }, { niche: 'avis', n: 1 }]);
  assert.equal(N.litDemande('x:9')[0].n, 3, 'plafond 3 par niche');
  assert.equal(N.prochainId(S.videos, 'immo'), 'immo-04');
  assert.equal(N.prochainId(S.videos, 'neuf'), 'neuf-01');
  assert.deepEqual(N.litReponse('```json\n' + JSON.stringify(BON) + '\n```'), BON);
  assert.deepEqual(N.litReponse('Voici : ' + JSON.stringify(BON) + ' — fin'), BON);
  assert.throws(() => N.litReponse('rien'), /JSON/);
});

test('les fiches de niche viennent du catalogue + kit + club, chaque page est celle du produit', () => {
  const f = N.fichesNiches();
  for (const id of produitsConnus()) assert.ok(Object.values(f).some((x) => x.produit === id), 'niche absente pour ' + id);
  assert.equal(f.immo.page, 'https://kit.kd-mc.com/immo.html');
  assert.match(f.club.gratuit, /cinquante-neuf/);
  const c = N.consigneScript({ niche: 'immo', fiche: f.immo, id: 'immo-04', existants: S.videos.filter((v) => v.produit === 'immo-ia') });
  assert.ok(c.includes('immo-01') && c.includes('immo-03'), 'les angles déjà utilisés sont donnés au modèle');
});

test('un bon script est accepté au 1er essai, avec l\'id et le thème alternés', async () => {
  const f = N.fichesNiches();
  const { appels, fn } = faux([JSON.stringify(BON)]);
  const v = await N.ecritScript({ niche: 'immo', fiche: f.immo, videos: S.videos, env: {}, redigeFn: fn });
  assert.equal(v.id, 'immo-04'); assert.equal(v.produit, 'immo-ia'); assert.equal(v.theme, 'clair', '3 immo existent → le 4ᵉ est clair');
  assert.ok(valideScript(v, { produits: produitsConnus() }).ok);
  assert.equal(appels.length, 1); assert.equal(appels[0].retour, null);
});

test('un script avec jargon + promesse est REFUSÉ et la raison est renvoyée au modèle ; le 2ᵉ essai passe', async () => {
  const f = N.fichesNiches(); const log = [];
  const { appels, fn } = faux([JSON.stringify(MAUVAIS), JSON.stringify(BON)]);
  const v = await N.ecritScript({ niche: 'immo', fiche: f.immo, videos: S.videos, env: {}, log: (l) => log.push(l), redigeFn: fn });
  assert.ok(v && v.id === 'immo-04');
  assert.equal(appels.length, 2);
  assert.match(appels[1].retour.erreurs.join(' '), /interdit/);
  assert.ok(log.some((l) => /essai 1 : REFUSÉ/.test(l)) && log.some((l) => /essai 2 : ACCEPTÉ/.test(l)));
});

test('3 refus → niche sautée (rien n\'est écrit) ; une 1ʳᵉ ligne déjà utilisée est refusée ; réponse illisible = essai perdu', async () => {
  const f = N.fichesNiches();
  const v = await N.ecritScript({ niche: 'immo', fiche: f.immo, videos: S.videos, env: {}, redigeFn: faux([JSON.stringify(MAUVAIS), JSON.stringify(MAUVAIS), JSON.stringify(MAUVAIS)]).fn });
  assert.equal(v, null);
  const deja = { ...BON, lignes: [S.videos.find((x) => x.id === 'immo-01').lignes[0], ...BON.lignes.slice(1)] };
  const log = [];
  const w = await N.ecritScript({ niche: 'immo', fiche: f.immo, videos: S.videos, env: {}, log: (l) => log.push(l), redigeFn: faux([JSON.stringify(deja), 'pas du json', JSON.stringify(BON)]).fn });
  assert.ok(w && w.id === 'immo-04');
  assert.ok(log.some((l) => /déjà utilisée/.test(l)) && log.some((l) => /illisible/.test(l)));
});

test('principal : écrit les scripts acceptés dans le fichier, saute la niche inconnue, ligne de preuve', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'pub-'));
  const fichier = join(dir, 'scripts.json');
  writeFileSync(fichier, readFileSync(new URL('../tools/pub/scripts.json', import.meta.url)));
  const log = [];
  const club = { lignes: ['Lundi, un client râle. Mardi, un devis dort.', 'Chaque semaine, une consigne prête pour une situation vécue.', 'Tu copies, tu adaptes deux mots.', 'Tu envoies depuis ton téléphone.', "Club IA au boulot. Cinquante-neuf euros l'année."], legende: 'Lundi un client râle, mardi un devis dort : chaque semaine une consigne prête pour une situation vécue, tu copies, tu adaptes, tu envoies. Club IA au Boulot sur kit.kd-mc.com', hashtags: ['#independant', '#commercant', '#ia', '#club'] };
  const r = await N.principal({ ANTHROPIC_API_KEY: 'x', NOUVEAUX: 'immo:1,inconnue:1,club:1' }, (l) => log.push(l), { redigeFn: faux([JSON.stringify(BON), JSON.stringify(club)]).fn, fichier });
  assert.deepEqual(r.ids, ['immo-04', 'club-03']); assert.equal(r.total, 3);
  const s = JSON.parse(readFileSync(fichier, 'utf8'));
  assert.equal(s.videos.length, S.videos.length + 2);
  assert.ok(s.videos.every((v) => valideScript(v, { produits: produitsConnus() }).ok), 'le fichier écrit repasse la porte de vérité');
  assert.ok(log.some((l) => /niche inconnue : inconnue/.test(l)));
  assert.ok(log.some((l) => /^NOUVEAUX SCRIPTS 2\/3 : immo-04,club-03$/.test(l)), log.join('\n'));
  await assert.rejects(N.principal({ NOUVEAUX: 'immo:1' }, () => {}, { fichier }), /ANTHROPIC_API_KEY/);
});

/* ── Programmation Metricool (mémoire) ───────────────────────────────────── */
test('créneaux : après le dernier post, 10 h puis 12 h, jamais le week-end, jamais avant demain', () => {
  const ven = [{ video: 'a-01', post: 1, date: '2026-09-25T12:00:00+02:00' }];
  assert.deepEqual(P.planCreneaux(ven, 3, new Date('2026-09-17T10:00:00Z')), ['2026-09-28T10:00:00+02:00', '2026-09-28T12:00:00+02:00', '2026-09-29T10:00:00+02:00']);
  const lun10 = [{ video: 'a-01', post: 1, date: '2026-09-28T10:00:00+02:00' }];
  assert.deepEqual(P.planCreneaux(lun10, 2, new Date('2026-09-17T10:00:00Z')), ['2026-09-28T12:00:00+02:00', '2026-09-29T10:00:00+02:00']);
  assert.deepEqual(P.planCreneaux([], 1, new Date('2026-09-18T10:00:00Z')), ['2026-09-21T10:00:00+02:00'], 'vide un vendredi → lundi');
  assert.deepEqual(P.planCreneaux([{ video: 'a', post: 1, date: '2026-09-01T12:00:00+02:00' }], 1, new Date('2026-09-16T10:00:00Z')), ['2026-09-17T10:00:00+02:00'], 'dernier post passé → demain');
  const reel = P.planCreneaux(P.lire().posts, 2);
  for (const c of reel) { assert.match(c, /T(10|12):00:00\+02:00$/); assert.ok(![0, 6].includes(new Date(c).getUTCDay())); }
});

test('ajouts : format strict, refus des doublons (post, vidéo, créneau), tri par date', () => {
  const prog = { posts: [{ video: 'a-01', post: 1, date: '2026-09-25T12:00:00+02:00' }] };
  const a = P.litAjouts('b-02:377600001:2026-09-28T10:00:00+02:00, c-01:377600002:2026-09-28T12:00:00+02:00');
  assert.equal(a.length, 2); assert.equal(a[0].post, 377600001);
  assert.throws(() => P.litAjouts('b-02:x:2026-09-28T10:00:00+02:00'), /illisible/);
  assert.throws(() => P.litAjouts('b-02:377600001:2026-09-28T10:30:00+02:00'), /illisible/, 'créneau non entier');
  const p = P.ajoute(prog, a.reverse());
  assert.deepEqual(p.posts.map((x) => x.video), ['a-01', 'b-02', 'c-01']);
  assert.throws(() => P.ajoute(p, [{ video: 'z-01', post: 377600001, date: '2026-09-30T10:00:00+02:00' }]), /post déjà/);
  assert.throws(() => P.ajoute(p, [{ video: 'a-01', post: 9, date: '2026-09-30T10:00:00+02:00' }]), /vidéo déjà/);
  assert.throws(() => P.ajoute(p, [{ video: 'z-01', post: 9, date: '2026-09-28T10:00:00+02:00' }]), /créneau déjà/);
  const reel = P.lire();
  assert.equal(new Set(reel.posts.map((x) => x.post)).size, reel.posts.length);
  assert.equal(new Set(reel.posts.map((x) => x.date)).size, reel.posts.length, 'deux vidéos au même créneau');
});

test('--prepare : ce que la routine lit = vidéos rendues NON encore programmées, MP4 public, titre = 1ʳᵉ ligne, un créneau libre chacune', () => {
  const prog = P.lire();
  const index = { rendu: '2026-09-17T18:00:00.000Z', videos: [
    { id: 'immo-04', produit: 'immo-ia', page: 'https://kit.kd-mc.com/immo.html', titre: 'Un mandat qui traîne.', legende: 'x'.repeat(80), hashtags: ['#immobilier', '#ia', '#mandat'], duree: 24.5, voix: 'domaine' },
    { id: 'club-03', produit: 'club-ia', page: 'https://kit.kd-mc.com/#club', titre: 'Lundi, un client râle.', legende: 'y'.repeat(80), hashtags: ['#club', '#ia', '#artisan'], duree: 22, voix: 'domaine' },
    { id: prog.posts[0].video, produit: 'avis-ia', page: 'https://kit.kd-mc.com/avis.html', titre: 'déjà programmée', legende: 'z'.repeat(80), hashtags: ['#a', '#b', '#c'], duree: 20, voix: 'domaine' },
  ] };
  const a = P.prepare(index, prog, { maintenant: new Date('2026-09-17T18:00:00Z') });
  assert.deepEqual(a.videos.map((v) => v.id), ['immo-04', 'club-03'], 'une vidéo déjà programmée n\'est pas reproposée');
  assert.equal(a.videos[0].mp4, 'https://github.com/9r4rxssx64-creator/CMCteams/releases/download/pub-videos/immo-04.mp4');
  assert.equal(a.videos[0].titre, 'Un mandat qui traîne.');
  assert.deepEqual(a.videos.map((v) => v.creneau), P.planCreneaux(prog.posts, 2, new Date('2026-09-17T18:00:00Z')));
  assert.equal(a.marque, 7000185); assert.deepEqual(a.reseaux, ['facebook', 'instagram', 'tiktok', 'youtube']);
  assert.ok(!/ghp_|Bearer |sk-ant/.test(JSON.stringify(a)), 'aucun jeton');
});
