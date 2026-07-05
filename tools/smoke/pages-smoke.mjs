/**
 * Smoke test PROD des pages kd-mc.com (World Monitor + OSINT).
 * Tourne dans GitHub Actions (le runner a un réseau ouvert, contrairement au
 * sandbox Claude Code) → vérifie le rendu RÉEL : carte Leaflet montée, tuiles
 * chargées, compteurs live peuplés, aucune erreur JS console.
 *
 * Usage : node tools/smoke/pages-smoke.mjs [baseURL]
 * Exit 1 si un échec bloquant (page KO, carte absente, erreur JS).
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'https://kd-mc.com';
const TARGETS = [
  {
    path: '/osint/',
    title: /OSINT/i,
    mustHave: ['#map', '.leaflet-container', '#kFlights', '#kQuakes'],
    kpis: ['#kFlights', '#kQuakes', '#kFires', '#kCve'],
  },
  {
    path: '/worldmonitor/',
    title: /WORLD MONITOR/i,
    mustHave: ['#map', '.leaflet-container'],
    kpis: [],
  },
];

const browser = await chromium.launch();
let hardFail = 0;
const report = [];

for (const t of TARGETS) {
  const page = await browser.newPage();
  const errs = [];   // erreurs JS bloquantes (exceptions non catchées)
  const warns = [];  // bruit console toléré (CORS de sources de repli optionnelles, etc.)
  page.on('pageerror', (e) => errs.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') warns.push(m.text()); });
  const url = BASE + t.path;
  const res = { url, ok: true, notes: [] };
  try {
    const resp = await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    if (!resp || resp.status() >= 400) { res.ok = false; res.notes.push('HTTP ' + (resp ? resp.status() : 'no-response')); }
    await page.waitForTimeout(6000); // laisse le live + la carte se peupler

    const title = await page.title().catch(() => '');
    if (!t.title.test(title)) res.notes.push('titre inattendu: "' + title + '"');

    for (const sel of t.mustHave) {
      const found = await page.$(sel);
      if (!found) { res.ok = false; res.notes.push('MANQUE ' + sel); }
    }

    // tuiles de carte réellement chargées (network réel sur le runner)
    const tiles = await page.$$eval('.leaflet-tile-loaded, img.leaflet-tile', (els) => els.length).catch(() => 0);
    res.notes.push('tuiles carte: ' + tiles);
    if (tiles === 0) res.notes.push('⚠ aucune tuile chargée');

    // marqueurs (circleMarkers = paths svg)
    const markers = await page.$$eval('.leaflet-overlay-pane svg path', (els) => els.length).catch(() => 0);
    res.notes.push('marqueurs: ' + markers);

    // compteurs live peuplés (pas tous "—")
    const kvals = [];
    for (const sel of t.kpis) {
      const v = await page.$eval(sel, (el) => el.textContent).catch(() => '—');
      kvals.push(sel + '=' + v);
    }
    if (t.kpis.length) {
      res.notes.push('KPIs: ' + kvals.join(' '));
      const anyLive = kvals.some((s) => !s.endsWith('—'));
      if (!anyLive) res.notes.push('⚠ aucun compteur live peuplé (flake réseau possible)');
    }

    // Seules les EXCEPTIONS JS non catchées font échouer (pas le bruit console CORS
    // des sources de repli optionnelles, ex Shodan CVEDB → l'app bascule sur CIRCL).
    if (errs.length) { res.ok = false; res.notes.push('EXCEPTIONS JS: ' + errs.slice(0, 3).join(' | ')); }
    if (warns.length) res.notes.push('bruit console toléré: ' + warns.length + ' (ex ' + warns[0].slice(0, 80) + ')');
  } catch (e) {
    res.ok = false;
    res.notes.push('EXCEPTION: ' + (e && e.message ? e.message : String(e)));
  }
  await page.close();
  if (!res.ok) hardFail++;
  report.push(res);
}

await browser.close();

/* Sondes DIRECTES des sources live v2.17 (réseau ouvert du runner — ce que le sandbox
   Claude Code ne peut pas atteindre, leçon #126). SOFT : la page est fail-open par
   design, donc une source down = ⚠ rapportée, pas un échec du smoke. Mais le log
   PROUVE que chaque identifiant de couche GIBS / endpoint est correct. */
const PROBES = [
  ['GIBS GOES-East GeoColor (géo LIVE)', 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GOES-East_ABI_GeoColor/default/default/GoogleMapsCompatible_Level7/1/0/0.png'],
  ['GIBS GOES-West GeoColor', 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GOES-West_ABI_GeoColor/default/default/GoogleMapsCompatible_Level7/1/0/0.png'],
  ['GIBS Himawari GeoColor', 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/Himawari_AHI_GeoColor/default/default/GoogleMapsCompatible_Level7/1/0/1.png'],
  ['GIBS VIIRS Thermal Anomalies (feux sat.)', (() => { const d = new Date(Date.now() - 24 * 3600 * 1000); const iso = d.toISOString().slice(0, 10); return 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_Thermal_Anomalies_375m_All/default/' + iso + '/GoogleMapsCompatible_Level9/1/0/0.png'; })()],
  ['RainViewer (radar pluie)', 'https://api.rainviewer.com/public/weather-maps.json'],
  ['Celestrak TLE (satellites live)', 'https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle'],
  ['satellite.js UMD (unpkg)', 'https://unpkg.com/satellite.js@5.0.0/dist/satellite.min.js'],
];
console.log('\n--- Sondes sources live (soft) ---');
for (const [label, url] of PROBES) {
  try {
    const r = await fetch(url, { redirect: 'follow' });
    const ct = r.headers.get('content-type') || '';
    console.log((r.ok ? '✅' : '⚠️ HTTP ' + r.status) + ' ' + label + ' (' + ct.split(';')[0] + ')');
  } catch (e) {
    console.log('⚠️ ' + label + ' : ' + (e && e.message ? e.message : e));
  }
}

for (const r of report) {
  console.log((r.ok ? '✅' : '❌') + ' ' + r.url);
  for (const n of r.notes) console.log('   · ' + n);
}
console.log(hardFail === 0 ? '\nSMOKE OK' : '\nSMOKE ÉCHEC (' + hardFail + ')');
process.exit(hardFail === 0 ? 0 : 1);
