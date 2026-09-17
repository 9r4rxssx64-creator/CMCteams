/* Garde des APERÇUS DE LIENS (og:image) du Kit — dans test:ci.
   Ce qui coûte si c'est faux : chaque lien partagé sur Facebook, WhatsApp, iMessage ou
   LinkedIn s'affiche en rectangle gris. MESURÉ le 17.09 : 0 des 6 pages du Kit n'avait
   d'image d'aperçu (les boutiques POD en ont une depuis le début) — c'est ce trou que
   cette garde empêche de revenir, y compris pour une niche créée plus tard. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as A from '../tools/produits/apercus.mjs';
import { lireCatalogue } from '../tools/produits/fabrique.mjs';

const pages = A.pagesOg();
const lit = (f) => readFileSync(join(A.PAGES_DIR, f), 'utf8');
/* Les 3 premiers octets utiles d'un PNG donnent ses dimensions (aucune dépendance). */
function taillePng(chemin) {
  const d = readFileSync(chemin).subarray(0, 24);
  assert.equal(d.subarray(1, 4).toString(), 'PNG', chemin + " n'est pas un PNG");
  return { l: d.readUInt32BE(16), h: d.readUInt32BE(20), poids: statSync(chemin).size };
}

test('chaque page du Kit — y compris une niche future — a sa page ET son image d\'aperçu', () => {
  const slugs = pages.map((p) => p.slug);
  for (const x of lireCatalogue().produits) assert.ok(slugs.includes(x.slug), 'niche sans aperçu : ' + x.slug);
  assert.ok(slugs.includes('kit') && slugs.includes('lire'));
  for (const p of pages) {
    assert.ok(existsSync(join(A.PAGES_DIR, p.fichier)), 'page absente : ' + p.fichier);
    assert.ok(existsSync(join(A.OG_DIR, p.slug + '.png')), 'image absente : ' + p.slug + '.png (lance node tools/produits/apercus.mjs)');
  }
});

test('les images font exactement 1200×630 et restent légères (sinon l\'aperçu ne s\'affiche pas)', () => {
  for (const p of pages) {
    const { l, h, poids } = taillePng(join(A.OG_DIR, p.slug + '.png'));
    assert.equal(l, A.LARGEUR, p.slug + ' : largeur ' + l);
    assert.equal(h, A.HAUTEUR, p.slug + ' : hauteur ' + h);
    assert.ok(poids <= A.POIDS_MAX, p.slug + ' : ' + Math.round(poids / 1024) + ' Ko');
    assert.ok(poids > 8 * 1024, p.slug + ' : image quasi vide (' + poids + ' octets)');
  }
});

test('les balises posées sont EXACTEMENT ce que les sources produisent (garde --verifier)', async () => {
  const lignes = [];
  const code = await A.principal(['--verifier'], (l) => lignes.push(l));
  assert.equal(code, 0, lignes.join('\n'));
  assert.ok(lignes.some((l) => l === 'APERÇUS ' + pages.length + '/' + pages.length), lignes.join('\n'));
});

test('chaque page déclare son image, en absolu, avec le grand format — et jamais deux fois le même titre', () => {
  for (const p of pages) {
    const h = lit(p.fichier);
    const img = 'https://kit.kd-mc.com/og/' + p.slug + '.png';
    assert.ok(h.includes(`<meta property="og:image" content="${img}">`), p.fichier + ' : og:image absente ou relative');
    assert.match(h, /twitter:card" content="summary_large_image"/, p.fichier + ' : sans summary_large_image, X affiche une vignette minuscule');
    assert.match(h, /og:image:width" content="1200"/, p.fichier);
    assert.equal((h.match(/property="og:title"/g) || []).length, 1, p.fichier + ' : og:title en double');
    assert.equal((h.match(/property="og:image"/g) || []).length, 1, p.fichier + ' : og:image en double');
    assert.ok(A.cspAccepteLaPropreImage(h), p.fichier + " : la CSP refuse l'image de sa propre page");
  }
});

test('le texte des vignettes reste lisible : titre court, accroche sous 92 signes, aucun émoji', () => {
  for (const p of pages) {
    assert.ok(p.titre.length <= 34, p.slug + ' : titre de ' + p.titre.length + ' signes');
    assert.ok(p.promesse.length <= A.PROMESSE_MAX, p.slug + ' : accroche de ' + p.promesse.length + ' signes');
    assert.ok(p.sur.length <= 46, p.slug + ' : sur-titre de ' + p.sur.length + ' signes');
    assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(p.titre + p.promesse + p.sur), p.slug + ' : émoji');
    assert.ok(!/garanti|rapporte|\d+ ?%/i.test(p.promesse), p.slug + ' : promesse de résultat');
  }
  /* Le repli automatique (niche future sans accroche écrite) coupe proprement, jamais « …. » */
  const c = A.promesseCourte('Faire écrire tes annonces, tes messages de prospection, tes comptes rendus de visite et tes relances par un assistant IA gratuit, en une minute chacun.');
  assert.ok(c.length <= A.PROMESSE_MAX && c.endsWith('.') && !c.includes('..'), c);
});

test('le gabarit échappe le HTML et met le prix barré quand il y en a un', () => {
  const h = A.gabarit({ sur: 'X', titre: '<img src=x onerror=alert(1)>', promesse: 'a & b', pied: 'p', prix: 67, avant: 149, slug: 'x' });
  assert.ok(!h.includes('<img src=x'), 'titre non échappé dans la vignette');
  assert.ok(h.includes('149 €') && h.includes('67 €'));
  assert.ok(!A.gabarit({ sur: 'X', titre: 'T', promesse: 'p', pied: 'p', prix: null, avant: null, slug: 'x' }).includes('class="prix"'), 'pas de bloc prix quand il n\'y a pas de prix');
});
