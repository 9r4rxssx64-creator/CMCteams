// v9.820 — vérifie le DISPLAY vPlan : GARRO(CP) → Congés, MIRANDA(M) → Maladie,
// exclus de "Ma section" de Kevin ; les workers gardent leur grille ; règle #1 OK.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const text = readFileSync(resolve(__dirname, 'fixtures/juillet-2026-v1.txt'), 'utf8');
  const geo = JSON.parse(readFileSync(resolve(__dirname, 'fixtures/juillet-2026-v1.geo.json'), 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  // Hors ligne : la page en file:// ne parle à personne (sinon, sur un runner AVEC réseau,
  // la synchro Firebase peut remplacer A.overrides en pleine mesure — leçon #220).
  await ctx.route(/^https?:\/\//, (r) => r.abort());
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.addInitScript(() => { window.__CMC_NO_SEED = true; });
  await page.goto('file://' + resolve(__dirname, '../index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.doImport === 'function' && window.A && Array.isArray(A.employees), { timeout: 20000 });
  await page.evaluate(() => { A.user = A.employees.find(e => e.id === 'U11804'); A.year = 2026; A.month = 6; A.overrides = A.overrides || {}; delete A.overrides['2026-6']; });
  const out = await page.evaluate(async ({ text, geo }) => {
    window._cmcPdfGeometry = geo; window._lastImportText = text;
    window.doImport(); await new Promise((done) => { // attente STABLE (runner lent ≠ 2 s fixes)
      const count = () => { const o = window.A.overrides || {}; let n = 0; for (const k in o) for (const id in (o[k] || {})) n += Object.keys(o[k][id] || {}).length; return n; };
      let last = -1, since = Date.now(); const t0 = Date.now();
      const tick = () => { const n = count(); if (n !== last) { last = n; since = Date.now(); }
        if ((n > 0 && Date.now() - since >= 2000) || Date.now() - t0 > 60000) return done(); setTimeout(tick, 250); };
      setTimeout(tick, 800); });
    const key = '2026-6';
    // ouvrir tous les groupes d'absence pour que la vue rende leurs tableaux
    window._planAbsOpen = { conges: true, maladie: true, formation: true, deplacement: true, amenage: true };
    const html = (typeof vPlan === 'function') ? vPlan() : '';
    const me = A.employees.find(x => x.id === 'U11804'); const myTeam = me && (me.teamHistory || {})[key];
    const teamOf = nm => { const e = A.employees.find(x => x.name && x.name.toUpperCase().indexOf(nm) >= 0); return e ? (e.teamHistory || {})[key] : 'ABSENT'; };
    // "Ma section" = bloc entre "▶ Ma section" et "Autres équipes"
    const ai = html.indexOf('Ma section'); const bi = html.indexOf('Autres équipes', ai);
    const maSection = ai >= 0 ? html.slice(ai, bi > ai ? bi : ai + 4000) : '';
    const inMa = nm => maSection.indexOf(nm) >= 0;
    return {
      myTeam, garroTeam: teamOf('GARRO'), mirandaTeam: teamOf('MIRANDA'), desarTeam: teamOf('DESARZENS K'),
      htmlHasConges: /Congés/.test(html), htmlHasMaladie: /Maladie/.test(html),
      garroInConges: new RegExp('GARRO').test(html) && html.indexOf('Congés') >= 0,
      maHasGarro: inMa('GARRO'), maHasMiranda: inMa('MIRANDA'),
      maHasKevinMates: ['PUGNETTI', 'MALENFANT', 'DESSI', 'MARIOTTINI'].filter(n => inMa(n)).length,
      maHasDesarzens: inMa('DESARZENS')
    };
  }, { text, geo });
  const tests = []; const t = (l, ok) => tests.push({ l, ok: ok === true });
  t('aucune pageerror', errs.length === 0);
  t('GARRO assigné au groupe Congés (teamHistory=conges)', out.garroTeam === 'conges');
  t('MIRANDA assigné au groupe Maladie (teamHistory=maladie)', out.mirandaTeam === 'maladie');
  t('vPlan rend le groupe Congés', out.htmlHasConges === true);
  t('vPlan rend le groupe Maladie', out.htmlHasMaladie === true);
  t('GARRO PAS dans Ma section de Kevin', out.maHasGarro === false);
  t('MIRANDA PAS dans Ma section de Kevin', out.maHasMiranda === false);
  t('Kevin (DESARZENS) est dans Ma section', out.maHasDesarzens === true);
  t('≥3 coéquipiers de Kevin dans Ma section', out.maHasKevinMates >= 3);
  let pass = 0, fail = 0;
  tests.forEach(tt => { console.log((tt.ok ? '  ✅ ' : '  ❌ ') + tt.l); tt.ok ? pass++ : fail++; });
  console.log('\nDEBUG', JSON.stringify(out));
  console.log('\n' + (fail === 0 ? '✅ vPLAN DISPLAY OK' : '❌ KO') + '  PASS:' + pass + ' FAIL:' + fail);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
