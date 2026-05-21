// runtime-audit-reproduction-fidelity.mjs
// ─────────────────────────────────────────────────────────────────────────
// AUDIT REPRODUCTION À L'IDENTIQUE — règle Kevin "IMPORT LOSSLESS +
// REPRODUCTION IDENTIQUE, aucune erreur tolérée".
//
// Importe un texte PDF source réel (fixture) puis vérifie que CHAQUE cellule
// de A.overrides correspond EXACTEMENT au code du texte source — pas de
// suffixe perdu, pas de décalage de jour, pas d'invention.
//
// Diagnostic : ne corrige rien, MESURE. Sert de garde-fou anti-régression
// pour toute évolution du parser d'import.
//
// Lancement :  PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npm run test:fidelity
// ─────────────────────────────────────────────────────────────────────────
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Parse indépendant d'une ligne de grille : <post...> <NOM...> [*] <from> <to> <codes...>
function parseGridLine(line) {
  const t = line.trim().split(/\s+/);
  if (t.length < 5) return null;
  let fi = -1;
  for (let i = 1; i < t.length - 1; i++) {
    if (/^\d{1,2}$/.test(t[i]) && /^\d{1,2}$/.test(t[i + 1])) {
      const a = +t[i], b = +t[i + 1];
      if (a >= 1 && a <= 31 && b >= a && b <= 31) { fi = i; break; }
    }
  }
  if (fi < 0) return null;
  const name = t.slice(1, fi).filter(x => x !== '*' && !/^[★☆⭐]$/.test(x)).join(' ').trim();
  return { name, from: +t[fi], to: +t[fi + 1], codes: t.slice(fi + 2) };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await ctx.newPage();
  await page.goto('file://' + resolve(ROOT, 'index.html'),
    { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(
    () => typeof window.A === 'object' && Array.isArray(window.A.employees) && typeof window.doImport === 'function',
    { timeout: 20000 });

  const fixturePath = resolve(ROOT, 'tests/fixtures/mai-2026-v1-roulettes.txt');
  const txt = fs.readFileSync(fixturePath, 'utf8');

  const result = await page.evaluate((txt) => {
    window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' };
    const norm = s => (s || '').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[-'’‘]/g, ' ').replace(/\s+/g, ' ').trim();

    function parse(line) {
      const t = line.trim().split(/\s+/);
      if (t.length < 5) return null;
      let fi = -1;
      for (let i = 1; i < t.length - 1; i++) {
        if (/^\d{1,2}$/.test(t[i]) && /^\d{1,2}$/.test(t[i + 1])) {
          const a = +t[i], b = +t[i + 1];
          if (a >= 1 && a <= 31 && b >= a && b <= 31) { fi = i; break; }
        }
      }
      if (fi < 0) return null;
      return {
        name: t.slice(1, fi).filter(x => x !== '*' && !/^[★☆⭐]$/.test(x)).join(' ').trim(),
        from: +t[fi], codes: t.slice(fi + 2)
      };
    }

    const lines = txt.split(/\n/).map(l => l.trim())
      .filter(l => /^\.?[A-Z]/.test(l) && /\s\d{1,2}\s\d{1,2}\s/.test(l));

    // Pré-enregistrer tout employé du fixture absent du roster (sinon il serait
    // "INTROUVABLE (skipped)" → mesure de fidélité faussée).
    let nid = 90000;
    lines.forEach(l => {
      const p = parse(l);
      if (!p || !p.name) return;
      if (!window.A.employees.find(e => norm(e.name) === norm(p.name)))
        window.A.employees.push({ id: 'XF' + (nid++), name: p.name, family: 'roulettes', team: 'r1', active: true });
    });

    // Import via le flux réel doImport()
    let ta = document.getElementById('impTxt');
    if (!ta) { ta = document.createElement('textarea'); ta.id = 'impTxt'; document.body.appendChild(ta); }
    ta.value = txt;
    [['impY', '2026'], ['impM', '4']].forEach(([id, v]) => {
      let e = document.getElementById(id);
      if (!e) { e = document.createElement('input'); e.id = id; document.body.appendChild(e); }
      e.value = v;
    });
    window._lastImportText = txt;
    try { window.doImport(); } catch (e) { return { fatal: e.message }; }

    const ov = (window.A.overrides && window.A.overrides['2026-4']) || {};
    const out = { emps: 0, perfect: 0, suffixOnly: 0, shifted: 0, other: 0, samples: [] };

    lines.forEach(line => {
      const p = parse(line);
      if (!p || !p.name) return;
      const emp = window.A.employees.find(e => norm(e.name) === norm(p.name));
      if (!emp) return;
      const row = ov[emp.id];
      if (!row) { out.other++; if (out.samples.length < 25) out.samples.push(p.name + ': aucune cellule importée'); return; }
      out.emps++;
      let suffixMis = 0, otherMis = 0;
      p.codes.forEach((src, i) => {
        const day = p.from + i;
        if (day < 1 || day > 31) return;
        const got = row[day];
        if (got === src) return;
        // suffixe ' ou " retiré : got == src privé de ses ' / " finaux
        const srcStripped = src.replace(/["'’]+$/g, '');
        if (got === srcStripped && src !== srcStripped) suffixMis++;
        else { otherMis++; if (out.samples.length < 25) out.samples.push(`${p.name} j${day}: source="${src}" stocké="${got}"`); }
      });
      if (suffixMis === 0 && otherMis === 0) out.perfect++;
      else if (otherMis === 0) out.suffixOnly++;
      else out.shifted++;
    });
    return out;
  }, txt);

  console.log('\n=== AUDIT REPRODUCTION FIDÉLITÉ — mai 2026 V1 roulettes ===');
  if (result.fatal) { console.error('FATAL doImport:', result.fatal); await browser.close(); process.exit(2); }
  console.log(`Employés vérifiés          : ${result.emps}`);
  console.log(`  ✅ reproduits à l'identique : ${result.perfect}`);
  console.log(`  ⚠  écart suffixe ' / " seul : ${result.suffixOnly}`);
  console.log(`  ❌ décalage / code erroné   : ${result.shifted}`);
  console.log(`  ❌ non importé              : ${result.other}`);
  if (result.samples.length) {
    console.log('\n--- échantillon d\'écarts (hors suffixe) ---');
    result.samples.forEach(s => console.log('  ✗ ' + s));
  }
  const fail = result.suffixOnly + result.shifted + result.other;
  console.log('\n========================================');
  console.log(fail === 0
    ? '✅ REPRODUCTION À L\'IDENTIQUE — 0 écart'
    : `❌ ${fail} employé(s) non reproduits fidèlement`);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
