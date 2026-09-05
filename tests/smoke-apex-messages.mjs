// Smoke test for tools/messages/index.html — mocks Firebase REST + Identity Toolkit,
// verifies: PIN gate, conversation grouping, thread render, reply write, clear-all write.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FB = 'https://cmcteams-c16ab-default-rtdb.europe-west1.firebasedatabase.app/cmcteams';

// in-memory Firebase state
const db = {
  cmc_kevin_inbox: [
    { id: 'kd_1', from: 'DELLA_PINA_M', dkey: 'DELLA_PINA_M', name: 'DELLA PINA M', team: 'Roul. Éq.4', text: 'Bonjour Kevin, question horaires', ts: Date.now() - 3600000, app: 'cmcteams-light', status: 'new' },
    { id: 'kd_2', from: 'DELLA_PINA_M', dkey: 'DELLA_PINA_M', name: 'DELLA PINA M', team: 'Roul. Éq.4', text: 'Photo jointe', ts: Date.now() - 1800000, hasImg: true, imgId: 'kd_2', status: 'new' },
    { id: 'kd_3', from: 'GARRO_S', dkey: 'GARRO_S', name: 'GARRO S', team: 'BJ Éq.1', text: 'Merci', ts: Date.now() - 600000, status: 'new' },
  ],
  cmc_dep_reply: { DELLA_PINA_M: [{ id: 'r_1', text: 'Bonjour, je regarde', ts: Date.now() - 3000000 }] },
  cmc_dep_read: {},
  'cmc_dep_img/kd_2': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
};
const writes = [];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });

await ctx.route('https://identitytoolkit.googleapis.com/**', r =>
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ idToken: 'TESTTOK', expiresIn: '3600' }) }));

await ctx.route(FB + '/**', async r => {
  const u = new URL(r.request().url());
  // Clé lue comme le VRAI Firebase : on garde le chemin BRUT (non décodé). Un "%2F" est un
  // caractère du NOM de clé, pas un séparateur de chemin — donc "cmc_dep_img%2Fkd_2" ≠
  // "cmc_dep_img/kd_2". Décoder ici masquerait le bug « je ne vois pas la photo » (faux vert).
  const key = u.pathname.replace('/cmcteams/', '').replace(/\.json$/, '');
  const m = r.request().method();
  if (m === 'PUT') {
    let body = null; try { body = JSON.parse(r.request().postData() || 'null'); } catch {}
    db[key] = body; writes.push({ key, body });
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  }
  // GET (also EventSource opening — return the value; SSE stream won't push but boot pull covers it)
  const val = key in db ? db[key] : null;
  return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(val) });
});

const page = await ctx.newPage();
const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.goto('file://' + resolve(root, 'tools/messages/index.html'), { waitUntil: 'domcontentloaded' });

function assert(c, m) { if (!c) { console.error('FAIL: ' + m); process.exitCode = 1; } else console.log('ok: ' + m); }

// 1) gate visible, wrong pin rejected
await page.waitForSelector('#gate', { state: 'visible' });
await page.fill('#pin', '000000'); await page.click('#gbtn');
await page.waitForTimeout(200);
assert((await page.textContent('#gerr')).includes('incorrect'), 'wrong PIN rejected');

// 2) correct pin → boot
await page.fill('#pin', '200807'); await page.click('#gbtn');
await page.waitForFunction(() => document.getElementById('gate').style.display === 'none', { timeout: 5000 });
await page.waitForTimeout(600);

// 3) conversation list: 2 employees grouped
const convs = await page.$$eval('.conv', els => els.map(e => e.querySelector('.nm').textContent));
assert(convs.length === 2, '2 conversations grouped (got ' + convs.length + ')');
assert(convs.some(c => c.includes('DELLA PINA M')), 'DELLA PINA M present');

// 4) open DELLA PINA thread → sees employee msg + Kevin reply + photo button
await page.click('.conv:has-text("DELLA PINA")');
await page.waitForSelector('.msgs');
const bubbles = await page.$$eval('.b', els => els.map(e => ({ cls: e.className, t: e.textContent })));
assert(bubbles.some(b => b.cls.includes('emp') && b.t.includes('question horaires')), 'employee message shown');
assert(bubbles.some(b => b.cls.includes('kev') && b.t.includes('je regarde')), 'Kevin reply merged');
assert((await page.$('.photo')) !== null, 'photo button present');

// 4bis) « Voir la photo » AFFICHE vraiment la photo (le node est imbriqué : cmc_dep_img/<id>).
// Sans ce contrôle, une clé mal encodée passait inaperçue : le bouton existait, l'image jamais.
// pas de gestionnaire de pop-up ici : Playwright ferme seul un éventuel « Photo introuvable »
// (en poser un le laisserait armé et il volerait le pop-up de l'étape « tout effacer »).
await page.click('.photo');
await page.waitForTimeout(400);
const shown = await page.evaluate(() => {
  const ov = document.getElementById('imgov'), el = document.getElementById('imgel');
  return { open: getComputedStyle(ov).display !== 'none', src: el.getAttribute('src') || '' };
});
assert(shown.open, 'photo overlay opened');
assert(shown.src.startsWith('data:image/'), 'photo actually loaded (src=' + shown.src.slice(0, 24) + ')');
if (shown.open) await page.click('#imgx'); // referme seulement si elle s'est ouverte

// 5) markRead wrote cmc_dep_read on thread open
await page.waitForTimeout(300);
assert(writes.some(w => w.key === 'cmc_dep_read' && w.body && w.body.DELLA_PINA_M), 'read receipt written on open');

// 6) reply → writes cmc_dep_reply merged (keeps old reply + adds new)
await page.fill('#rin', 'Voici les horaires corrigés');
await page.click('#rsend');
await page.waitForTimeout(400);
const repW = writes.filter(w => w.key === 'cmc_dep_reply').pop();
assert(repW && Array.isArray(repW.body.DELLA_PINA_M) && repW.body.DELLA_PINA_M.length === 2, 'reply appended (2 replies, old kept)');
assert(repW.body.DELLA_PINA_M.some(r => r.text.includes('corrigés')), 'new reply text present');

// 7) clear all → writes empty inbox + reply + read
await page.click('#backBtn');
await page.waitForSelector('#clearAllBtn');
page.once('dialog', d => d.accept());
await page.click('#clearAllBtn');
await page.waitForTimeout(400);
assert(writes.some(w => w.key === 'cmc_kevin_inbox' && Array.isArray(w.body) && w.body.length === 0), 'inbox cleared');
assert(writes.some(w => w.key === 'ax_cmc_kevin_inbox' && Array.isArray(w.body) && w.body.length === 0), 'apex mirror cleared');
assert(writes.some(w => w.key === 'cmc_dep_reply' && w.body && Object.keys(w.body).length === 0), 'replies cleared');

assert(errs.length === 0, 'no page errors (' + errs.slice(0, 2).join(' | ') + ')');

// 8) le numéro de version est écrit DEUX fois (badge HTML + APP_VER du script). La sonde de
// mise à jour relit ce fichier et compare le badge distant à APP_VER : s'ils divergent, la page
// se croit périmée à CHAQUE chargement → rechargement en boucle. Ils doivent rester identiques.
{
  const src = (await import('fs')).readFileSync(resolve(root, 'tools/messages/index.html'), 'utf8');
  const badge = (src.match(/Apex Messages (v[0-9.]+)</) || [])[1];
  const appver = (src.match(/APP_VER\s*=\s*"(v[0-9.]+)"/) || [])[1];
  assert(badge && appver && badge === appver, 'version badge HTML == APP_VER (badge=' + badge + ', APP_VER=' + appver + ')');
}
console.log(process.exitCode ? '\n❌ SMOKE FAILED' : '\n✅ SMOKE PASSED');
await browser.close();
