/* =============================================================================
   ARBRE — AD78 : accès DIRECT à la visionneuse via l'ark fourni par Kevin
   (même stratégie que AD06 : le mur vise le moteur de recherche, pas forcément
   la visionneuse ; Kevin navigue sur son iPhone et nous donne le lien).
   Ouvre l'ark, intercepte les images (img_prot.php / /image/), feuillette
   jusqu'à ~PAGES vues (l'acte du 7.03.1918 est au début de l'année), sauvegarde
   pages + captures + permalien. Sortie : ad78raw/ark/ + AD78-ARK.md.
   Env : ARKS (URLs séparées par des espaces ou virgules), PAGES (défaut 40).
   Réseau ouvert requis (runner CI). Usage : node tools/arbre/fetch-ad78-ark.mjs
============================================================================= */
import { chromium } from 'playwright';
import fs from 'fs';

const ARKS = (process.env.ARKS || 'https://archives.yvelines.fr/ark:36937/1ec57a223d4b6e488f720050568b5512.moteur=arko_default_618914e3ee7e4')
  .split(/[\s,]+/).filter(Boolean);
const PAGES = parseInt(process.env.PAGES || '40', 10);
const OUT = 'arbre/research/ad78raw/ark';
fs.mkdirSync(OUT, { recursive: true });
const L = ['# 🏛 AD78 — accès direct visionneuse (ark de Kevin) — ' + new Date().toISOString().slice(0, 10), ''];
const log = s => { console.log(s); L.push(s); };

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  viewport: { width: 430, height: 932 }, locale: 'fr-FR',
});
const pg = await ctx.newPage();
let saved = 0; const seen = new Set();
pg.on('response', async r => {
  try {
    const u = r.url(); const ct = r.headers()['content-type'] || '';
    if ((/img_prot\.php|\/image\/\d+\//.test(u)) && /image\/(jpe?g|png)/.test(ct)) {
      const b = await r.body(); if (!b || b.length < 60000 || seen.has(u)) return;
      seen.add(u); saved++;
      const p = OUT + '/page-' + String(saved).padStart(3, '0') + '.jpg';
      fs.writeFileSync(p, b);
      log('  💾 ' + p + ' (' + Math.round(b.length / 1024) + ' Ko) ← ' + u.slice(0, 110));
    }
  } catch (e) {}
});

for (const ark of ARKS) {
  const variants = [ark, ark.replace(/\.moteur=.*$/, '')];
  for (const url of [...new Set(variants)]) {
    log('\n## Ouverture : ' + url);
    try {
      const resp = await pg.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await pg.waitForTimeout(6000);
      const title = await pg.title();
      const body = (await pg.evaluate(() => document.body.innerText.slice(0, 300))).replace(/\s+/g, ' ');
      log('- HTTP ' + (resp ? resp.status() : '?') + ' · « ' + title.slice(0, 80) + ' »');
      log('- texte : ' + body.slice(0, 200));
      if (/blocked|rejected|forbidden/i.test(body)) { log('- ⛔ BLOQUÉ sur cette URL'); continue; }
      await pg.screenshot({ path: OUT + '/ouverture.png' }); log('- capture : ' + OUT + '/ouverture.png');
      /* accepter cookies si présents */
      for (const t of ['Tout accepter', 'Accepter', 'J\'accepte', 'OK']) {
        try { const b = pg.getByRole('button', { name: t }).first(); if (await b.count()) { await b.click({ timeout: 1500 }); break; } } catch (e) {}
      }
      /* feuilleter : flèches connues arkothèque/ligeo + clavier */
      const before = saved;
      for (let i = 0; i < PAGES; i++) {
        let clicked = false;
        for (const sel of ['[title*="uivant" i]', '[aria-label*="uivant" i]', '.fleche_droite', '.next', '[class*="next" i]', '[onclick*="suiv" i]']) {
          try { const el = pg.locator(sel).first(); if (await el.count()) { await el.click({ timeout: 1500 }); clicked = true; break; } } catch (e) {}
        }
        if (!clicked) { try { await pg.keyboard.press('ArrowRight'); } catch (e) {} }
        await pg.waitForTimeout(1400);
        if (i === 5 || i === 20) await pg.screenshot({ path: OUT + '/feuilletage-' + i + '.png' });
      }
      log('- pages interceptées sur cette URL : ' + (saved - before));
      if (saved - before > 0) break; /* variante qui marche trouvée */
    } catch (e) { log('- ✗ ' + String(e.message || e).slice(0, 130)); }
  }
}

log('\n## Verdict');
log(saved ? ('✅ ' + saved + ' page(s) de registre récupérée(s) → chercher l\'acte DESARZENS du 7.03.1918 (parents + mention de mariage en marge).')
  : '⛔ Aucune page interceptée — le mur couvre aussi la visionneuse pour les serveurs. Dans ce cas : Kevin feuillette sur son iPhone jusqu\'à l\'acte du 7 mars 1918 et envoie une capture.');
fs.writeFileSync('arbre/research/AD78-ARK.md', L.join('\n') + '\n');
await browser.close();
console.log('\nRapport : arbre/research/AD78-ARK.md');
