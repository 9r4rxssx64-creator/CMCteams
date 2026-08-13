/**
 * AUDIT LIVE — balaye TOUTES les surfaces kd-mc.com dans un vrai navigateur.
 *
 * Pourquoi : les audits « à la lecture » ne voient PAS les bugs de RUNTIME
 * (leçons #28/#54/#95/#103/#131). Le cas d'école : le worker de commande Printify
 * bloqué par CORS depuis le domaine réel — invisible au code, visible seulement
 * quand le NAVIGATEUR exécute la page et refuse la requête. Ce moteur attrape
 * exactement cette classe : requête réseau ÉCHOUÉE / bloquée / 4xx-5xx, + erreur
 * JS non catchée, + élément clé absent, + capture d'écran par surface.
 *
 * Où : GitHub Actions (le runner a le réseau OUVERT). Depuis le sandbox Claude Code
 * l'egress vers kd-mc.com est refusé par le proxy (403 CONNECT) → ce fichier NE
 * tourne PAS en local, il tourne en CI (workflow audit-live.yml). C'est LA voie
 * qui permet de « voir » réellement les sites de Kevin. (leçon #93/#126)
 *
 * Usage : node tools/smoke/audit-live.mjs [baseDomain]
 * Exit 1 si un échec BLOQUANT (page KO, exception JS, ou requête vers un host
 * du projet — worker/firebase/domaine — échouée/bloquée = la classe « CORS commande »).
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { connecte, masque } from './session-kevin.mjs';

const BASE = (process.argv[2] || 'https://kd-mc.com').replace(/\/$/, '');
const ROOT = BASE.replace(/^https?:\/\//, '').replace(/^www\./, ''); // ex: kd-mc.com

/* Hôtes « du projet » : une requête ÉCHOUÉE/bloquée vers l'un d'eux = bug bloquant
   (revenu/fonction cassé), pas du bruit tiers fail-open. C'est le filet qui aurait
   attrapé le blocage CORS de ld-printify-order. */
const PROJECT_HOSTS = [/\.workers\.dev$/, /firebasedatabase\.app$/, /(^|\.)kd-mc\.com$/, /9r4rxssx64-creator\.github\.io$/];
const isProjectHost = (u) => { try { const h = new URL(u).hostname; return PROJECT_HOSTS.some((re) => re.test(h)); } catch { return false; } };

/* Surfaces = miroir EXACT des ROUTES du routeur (services/kdmc-router/worker.js).
   ⚠ Les APPS sont des SOUS-DOMAINES (chez-lolo.kd-mc.com), PAS des chemins
   (kd-mc.com/chez-lolo/ → 404). SEULS worldmonitor/osint sont des chemins sur
   l'accueil (kdmc-home). (bug attrapé par le 1er run live — le routeur mappe par host.)
   selKey = un élément qui PROUVE que la page a rendu (pas juste 200 vide). */
const SURFACES = [
  { url: 'https://' + ROOT + '/', name: 'accueil', selKey: 'body' },
  { url: 'https://cmcteams.' + ROOT + '/', name: 'CMCteams', selKey: 'body' },
  { url: 'https://apex-ai.' + ROOT + '/', name: 'Apex AI', selKey: 'body' },
  { url: 'https://apex-chat.' + ROOT + '/', name: 'Apex Chat', selKey: 'body' },
  { url: 'https://la-detente.' + ROOT + '/', name: 'La Détente boutique', selKey: 'body' },
  { url: 'https://chez-lolo.' + ROOT + '/', name: 'Chez Lolo boutique', selKey: 'body' },
  { url: 'https://dashboard.' + ROOT + '/', name: 'Dashboard', selKey: 'body' },
  { url: 'https://sourcing.' + ROOT + '/', name: 'Sourcing', selKey: 'body' },
  { url: 'https://coffre.' + ROOT + '/', name: 'Coffre-fort', selKey: 'body' },
  { url: 'https://departs.' + ROOT + '/', name: 'Départs', selKey: 'body' },
  { url: 'https://cmcteams-light.' + ROOT + '/', name: 'CMCteams light', selKey: 'body' },
  { url: 'https://arbre.' + ROOT + '/', name: 'Arbre généalogique', selKey: '#gate', deep: async (page) => {
      // Déverrouille (code famille MAIFFRET déjà par défaut) et VÉRIFIE que l'arbre rend
      // vraiment des cartes — un arbre vide (bug d'agencement) échoue ici. (bug « tjs pas d'arbre » v2.4)
      //
      // FAUX POSITIF corrigé le 2026-08-07 : on comptait `.tnode`, la classe du SEUL style
      // « clair ». L'app rend par défaut le style parchemin, dont les cartes portent `.tmed`
      // → le contrôle criait « arbre vide » alors que 81 cartes s'affichaient (reproduit en
      // local : `_RENDERSTYLE==='med'`, 81 `.tmed`, 0 erreur JS). Un contrôle lié à un nom de
      // classe cosmétique casse au moindre changement de style. On compte donc ce qui prouve
      // vraiment le rendu, indépendamment du style : les cartes cliquables de la scène
      // (`#stage [data-open]`), présentes dans TOUS les styles.
      try { await page.evaluate(() => { sessionStorage.setItem('arbre_unlocked','1'); localStorage.setItem('arbre_trust','1'); }); } catch {}
      await page.reload({ waitUntil: 'load' }).catch(()=>{});
      await page.waitForTimeout(4500);
      const r = await page.evaluate(() => ({
        ver: (document.querySelector('#ver')||{}).textContent||'',
        cartes: document.querySelectorAll('#stage [data-open]').length,
        style: (typeof window._RENDERSTYLE !== 'undefined') ? String(window._RENDERSTYLE) : '?',
        gate: !!(document.querySelector('#gate') && !document.querySelector('#gate').classList.contains('hidden')),
      }));
      if (r.gate) return { ok:false, note:'reste bloqué sur le code (gate)' };
      if (r.cartes < 1) return { ok:false, note:'AUCUNE carte rendue — arbre vide ('+r.ver+', style '+r.style+')' };
      return { ok:true, note: r.cartes+' cartes · style '+r.style+' · '+r.ver };
    } },
  { url: 'https://lingua.' + ROOT + '/', name: 'KDMC Lingua', selKey: '.brand', deep: async (page) => {
      // App d'apprentissage : écran comptes (anonyme) → créer un compte → vérifier
      // 6 langues + arbre de leçons rendus + onglets. Un écran vide ou <6 langues échoue.
      // ⚠️ clics DOM (el.click() via evaluate) et JAMAIS page.click : la mascotte Bee
      // (compagnon + bulle) recouvre les éléments → l'« actionnabilité » Playwright
      // attend 30 s et échoue alors que l'app marche (vécu run 31225690078).
      const tap = (sel) => page.$eval(sel, (el) => el.click()).then(() => true).catch(() => false);
      try {
        await page.waitForTimeout(1200);
        if (!(await page.$('.acc-card.add'))) return { ok:false, note:'écran comptes absent' };
        await tap('.acc-card.add'); await page.waitForTimeout(600);
        await page.fill('#acName', 'Audit'); await tap('.modal .btn-main'); await page.waitForTimeout(700);
        const langs = await page.$$eval('.course-card', els => els.length).catch(() => 0);
        if (langs < 6) return { ok:false, note:'langues attendues ≥6, vues ' + langs };
        // 🇲🇨 v2.119 : le monégasque doit être RÉELLEMENT proposé sur le vrai domaine
        // (pas seulement dans le dépôt) — sinon le déploiement n'est pas passé.
        const mcDispo = await page.$$eval('.course-card', els => els.some(e => /Monégasque/i.test(e.textContent))).catch(() => false);
        if (!mcDispo) return { ok:false, note:'🇲🇨 monégasque absent de la liste des langues (déploiement non propagé ?)' };
        await tap('.course-card'); await page.waitForTimeout(700);
        const units = await page.$$eval('.unit', els => els.length).catch(() => 0);
        const tabs = await page.$$eval('.tab', els => els.length).catch(() => 0);
        const hearts = (await page.textContent('.tb-stat.hearts').catch(() => '')).replace(/\s/g, '');
        if (units < 1) return { ok:false, note:'aucune unité rendue' };
        // 📖 Histoires de la ruche (v2.32.0) : carte accueil présente + liste des 6 histoires
        let stories = 0;
        if (await tap('.stories-card')) { await page.waitForTimeout(600);
          stories = await page.$$eval('.story-item', els => els.length).catch(() => 0); }
        if (stories < 6) return { ok:false, note:'histoires attendues 6, vues ' + stories };
        // ⚡🃏📊 v2.33.0 : salle de jeux (2 cartes) + page stats (calendrier 84 cases)
        await tap('.btn-ghost'); await page.waitForTimeout(500); // retour accueil
        const games = await page.$$eval('.game-card', els => els.length).catch(() => 0);
        if (games < 2) return { ok:false, note:'cartes jeux attendues 2, vues ' + games };
        let heat = 0;
        if (await tap('.stories-card.stats-link')) { await page.waitForTimeout(500);
          heat = await page.$$eval('.heat-grid .heat', els => els.length).catch(() => 0); }
        if (heat !== 84) return { ok:false, note:'calendrier stats attendu 84 cases, vu ' + heat };
        // 🎤 v2.36.0 : atelier prononciation (carte accueil → mot + 2 boutons audio 🔊/🐢)
        await tap('.btn-ghost'); await page.waitForTimeout(400); // retour accueil
        let pron = false;
        if (await tap('.pron-link')) { await page.waitForTimeout(600);
          const w = await page.$('.pron-word');
          const au = await page.$$eval('.pron-play', els => els.length).catch(() => 0);
          const bee = await page.$('.pron-bee .rig-base');   // 🐝 v2.37 : Bee gros plan qui parle
          const mth = await page.$('.pron-bee .disc-mouth');  // bouche animée (lip-sync)
          pron = !!w && au >= 2 && !!bee && !!mth; }
        if (!pron) return { ok:false, note:'atelier prononciation 🎤 absent (mot/audio/Bee/bouche)' };
        // Revenir À COUP SÛR sur l'accueil. L'atelier prononciation s'affiche en PLEIN ÉCRAN :
        // il n'a ni « ← Retour » ni barre d'onglets, seulement sa croix ✕ (.bz-quit). En tapant
        // au hasard sur .btn-ghost, la sonde restait DANS l'atelier et concluait « 0 anecdote »
        // — un défaut de la sonde présenté comme un défaut de l'app (mesuré le 2026-08-13).
        const rentrer = async () => { for (let i = 0; i < 4; i++) {
          if (await page.$('.tabbar')) return true;
          if (!(await tap('.bz-quit'))) await tap('.btn-ghost');
          await page.waitForTimeout(400); }
          return !!(await page.$('.tabbar')); };
        if (!(await rentrer())) return { ok:false, note:'impossible de revenir à l\'accueil après l\'atelier prononciation' };
        // 📜 v2.118 : histoire & anecdotes — la rubrique doit s'ouvrir ET chaque fait doit
        // porter une source cliquable. Un fait sans source = une affirmation invérifiable.
        let faits = 0, srcs = 0;
        if (await tap('.stories-card.hist-link')) { await page.waitForTimeout(500);
          faits = await page.$$eval('.hist-fait', els => els.length).catch(() => 0);
          srcs = await page.$$eval('.hf-src', els => els.filter(a => /^https?:/.test(a.href)).length).catch(() => 0); }
        if (faits < 3 || srcs < faits) return { ok:false, note:'📜 histoire & anecdotes : ' + faits + ' faits, ' + srcs + ' sources cliquables (il en faut une par fait)' };
        await rentrer();
        // 🔊 v2.40 : les 6 voix HD doivent être CLAIRES (audio réel non vide) et DIFFÉRENTES (octets distincts).
        // Sondage du VRAI worker (même origine). Repli fail-open (pas de clé) = toléré, pas un bug de page.
        let voix = '';
        try {
          const vp = await page.evaluate(async () => {
            const vs = ['alloy','echo','fable','onyx','nova','shimmer'], out = [];
            for (const v of vs) { try {
              const r = await fetch('/__lingua/tts?v=' + v + '&t=bonjour', { cache:'no-store' });
              const ct = r.headers.get('content-type') || ''; const b = new Uint8Array(await r.arrayBuffer());
              let sum = 0; for (let i=0;i<b.length;i+=97) sum = (sum + b[i]) >>> 0;
              out.push({ v, audio:/audio/.test(ct), len:b.length, sig:b.length + ':' + sum });
            } catch (e) { out.push({ v, err:1 }); } }
            return out;
          });
          const real = vp.filter(x => x.audio && x.len > 800);
          const distinct = new Set(real.map(x => x.sig)).size;
          if (real.length === 0) voix = ' · voix backend en repli (toléré)';
          else if (real.length >= 5 && distinct >= 5) voix = ' · 6 voix HD réelles distinctes ✅ (' + distinct + ' signatures)';
          else return { ok:false, note:'voix HD non distinctes/claires : ' + real.length + ' audio, ' + distinct + ' distinctes' };
        } catch (_) { voix = ' · sonde voix indispo (toléré)'; }
        // 🇲🇨 v2.119 : entrer VRAIMENT dans le cours de monégasque et vérifier qu'il a des
        // leçons + l'encadré d'honnêteté (« aucune voix ne parle monégasque »).
        let mc = '';
        try {
          await page.$eval('#tbFlag', (el) => el.click()); await page.waitForTimeout(500);
          const ok = await page.$$eval('.course-card', (els) => {
            const c = els.find((e) => /Monégasque/i.test(e.textContent)); if (!c) return false; c.click(); return true; });
          if (ok) { await page.waitForTimeout(800);
            const u = await page.$$eval('.unit', els => els.length).catch(() => 0);
            const note = !!(await page.$('.mc-note'));
            mc = ' · 🇲🇨 monégasque ' + u + ' unités' + (note ? ' + note honnête' : ' SANS note');
            if (u < 5 || !note) return { ok:false, note:'🇲🇨 cours monégasque incomplet : ' + u + ' unités, note honnête ' + note };
          }
        } catch (e) { mc = ' · 🇲🇨 sonde monégasque indispo'; }
        // la version RÉELLEMENT servie (preuve que le déploiement est passé, pas le dépôt)
        const ver = await page.evaluate(() => { const b = document.querySelector('.ver, .version, [data-ver]'); return b ? b.textContent.trim() : (window.APP_VER || ''); }).catch(() => '');
        return { ok:true, note: langs + ' langues · ' + units + ' unités · ' + tabs + ' onglets · ' + stories + ' histoires 📖 · ' + games + ' jeux ⚡🃏 · stats 📊 · prononciation 🎤 · ' + faits + ' anecdotes sourcées 📜' + mc + voix + ' · vies ' + hearts + (ver ? ' · version servie ' + ver : '') };
      } catch (e) { return { ok:false, note:'exception deep: ' + String(e).slice(0,80) }; }
    } },
  { url: 'https://studio.' + ROOT + '/', name: 'Créa Studio', selKey: '#bnav', deep: async (page) => {
      // Studio créa : l'app rend sa nav complète (Bee est la mascotte de LINGUA, pas du studio —
      // Kevin 2026-08-07 ; aucune mascotte attendue ici).
      try {
        await page.waitForTimeout(1500);
        const nav = await page.$$eval('#bnav button', els => els.length).catch(() => 0);
        if (nav < 6) return { ok:false, note:'nav attendue ≥6 boutons, vus ' + nav };
        return { ok:true, note: nav + ' studios rendus' };
      } catch (e) { return { ok:false, note:'exception deep: ' + String(e).slice(0,80) }; }
    } },
  { url: BASE + '/worldmonitor/', name: 'World Monitor', selKey: '.leaflet-container' },
  { url: BASE + '/osint/', name: 'OSINT', selKey: '.leaflet-container' },
  // Livre de cuisine « A Cüjina de Mùnegu » — 3 adresses (Kevin 2026-08-13). Le contenu
  // porte le nom monégasque : on vérifie qu'il se charge vraiment sur chaque sous-domaine.
  { url: 'https://cujina.' + ROOT + '/', name: 'A Cüjina de Mùnegu (cujina)', selKey: '#cover' },
  { url: 'https://cocina.' + ROOT + '/', name: 'A Cüjina de Mùnegu (cocina)', selKey: '#cover' },
  { url: 'https://cuisine.' + ROOT + '/', name: 'A Cüjina de Mùnegu (cuisine)', selKey: '#cover' },
];

/* « Vérifier en réel EN TANT QUE Kevin » (Kevin 2026-08-06). OPT-IN : sans KDMC_AS_KEVIN=1
   l'audit reste strictement ANONYME — comportement historique inchangé. Le code admin ne
   vient QUE d'un secret CI et n'est jamais journalisé (masque()). */
const AS_KEVIN = process.env.KDMC_AS_KEVIN === '1';
const PIN_HASH = (process.env.KDMC_ADMIN_PIN_SHA256 || '').trim();
if (AS_KEVIN) console.log('Mode CONNECTÉ (Kevin) — code admin : ' + masque(PIN_HASH));

const SHOT_DIR = 'audit-live-shots';
mkdirSync(SHOT_DIR, { recursive: true });

const browser = await chromium.launch();
let hardFail = 0;
const report = [];

for (const s of SURFACES) {
  const page = await browser.newPage();
  const jsErrors = [];      // exceptions JS non catchées → BLOQUANT
  const failedProject = []; // requête projet BLOQUÉE (ERR_FAILED/CORS) → BLOQUANT (classe commande)
  const failedTol = [];     // requête échouée tolérée (tierce OU ERR_ABORTED app) → non bloquant
  const badStatus = [];     // 404/5xx sur un host projet → BLOQUANT (route/asset cassé)
  const authGated = [];     // 401/403 sur données projet → TOLÉRÉ : l'audit est ANONYME, donc
                            // toute donnée protégée par auth renvoie 401/403 par SÉCURITÉ (c'est
                            // le comportement voulu, pas un bug). Ne pas crier au loup (leçon #83/#106).
  const consoleErr = [];    // bruit console → rapporté, non bloquant

  page.on('pageerror', (e) => jsErrors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') consoleErr.push(m.text().slice(0, 160)); });
  page.on('requestfailed', (req) => {
    const u = req.url();
    const errText = req.failure()?.errorText || 'failed';
    const line = req.method() + ' ' + u.slice(0, 120) + ' [' + errText + ']';
    // ERR_ABORTED = requête annulée par l'app elle-même (navigation, retry auth, write non-authentifié)
    // = bruit. ERR_FAILED/BLOCKED = la CLASSE bug (blocage CORS commande, ressource refusée) → bloquant.
    if (isProjectHost(u) && !/ERR_ABORTED/i.test(errText)) failedProject.push(line);
    else failedTol.push(line);
  });
  page.on('response', (resp) => {
    const st = resp.status();
    if (!isProjectHost(resp.url())) return;
    if (st === 401 || st === 403) authGated.push('HTTP ' + st + ' ' + resp.url().slice(0, 100)); // toléré (auth)
    else if (st === 404 || st >= 500) badStatus.push('HTTP ' + st + ' ' + resp.url().slice(0, 120)); // bloquant
  });

  const url = s.url;
  const res = { url, name: s.name, ok: true, notes: [] };
  try {
    /* mouchard pollution (CMCteams) : enregistre CHAQUE élément dont le src/style contient
       la valeur polluée AU MOMENT où il est posé — même s'il disparaît ensuite (diaporama).
       + CDP : la PILE D'APPEL exacte de la requête %22 (fonction + ligne) — le mouchard DOM
       n'a rien vu (run 31227106483) → la requête part de JS pur (fetch / new Image / beacon). */
    const cdpStacks = [];
    const culpritSnaps = []; /* photos du DOM prises À L'INSTANT de la requête %22 (l'élément peut être éphémère) */
    /* Départs/light ajoutés (run 31235630065) : GET /%22+m.img+%22 = le SOURCE JS parsé comme
       HTML (flux servi corrompu) — le piège doit couvrir ces surfaces aussi. */
    if (s.name === 'CMCteams' || s.name === 'Départs' || s.name === 'CMCteams light') {
      try {
        const cdp = await page.context().newCDPSession(page);
        await cdp.send('Network.enable');
        cdp.on('Network.requestWillBeSent', (ev) => {
          if (ev.request && ev.request.url && ev.request.url.includes('%22')) {
            const ini = ev.initiator || {};
            const frames = (ini.stack && ini.stack.callFrames || []).slice(0, 6)
              .map((f) => (f.functionName || '?') + '@' + (f.url || '').split('/').pop() + ':' + f.lineNumber);
            cdpStacks.push('type=' + ini.type + (frames.length ? (' pile: ' + frames.join(' ← ')) : '') + (ini.url ? (' url=' + ini.url.split('/').pop() + ':' + (ini.lineNumber || '?')) : ''));
            /* balayage INSTANTANÉ de tout le DOM : quel élément porte l'attribut cassé ?
               (run 31230312178 : v9.882 servie, localStorage propre, scan différé aveugle
               → il faut photographier au moment T + lire performance.initiatorType qui
               distingue fond CSS / <img> / <image> SVG / fetch) */
            culpritSnaps.push(page.evaluate(() => {
              const out = [];
              document.querySelectorAll('*').forEach((el) => {
                for (const a of (el.attributes || [])) {
                  const v = a.value || '';
                  const broken = (a.name === 'style')
                    ? (v.includes('%22/') || v.includes('"/"'))
                    : (v.includes('"') || v.includes('%22/'));
                  if (broken && /^(src|href|poster|data|style|xlink:href)$/.test(a.name)) {
                    out.push('<' + el.tagName.toLowerCase() + ' ' + a.name + '=' + JSON.stringify(v).slice(0, 60) + '> html=' + (el.outerHTML || '').replace(/\s+/g, ' ').slice(0, 160));
                  }
                }
              });
              const perf = performance.getEntriesByType('resource')
                .filter((r) => r.name.includes('%22'))
                .map((r) => 'perf:' + r.initiatorType + ' →' + r.name.slice(-34));
              /* DÉTECTEUR DE CORRUPTION DE FLUX (théorie prouvée sur Départs v1.32,
                 run 31235630065) : si le HTML servi arrive corrompu, le parseur fait
                 déborder du SOURCE JS en texte visible et le compte de <script> change.
                 Une page saine : fuiteJS≈0. */
              const fuite = ((document.body && document.body.textContent || '').match(/function\s+\w+\(|innerHTML|_cmcSafeCatch|\.forEach\(function/g) || []).length;
              out.push('scripts=' + document.scripts.length + ' fuiteJS=' + fuite);
              return out.slice(0, 5).concat(perf.slice(0, 3));
            }).catch(() => []));
          }
        });
      } catch (e) { /* CDP best-effort */ }
      await page.addInitScript(() => {
        window.__pollu = [];
        /* le tampon Resource Timing par défaut (250) déborde sur CMCteams (500+ requêtes)
           → l'entrée %22 était évincée, on croyait « pas dans la frame principale » */
        try { performance.setResourceTimingBufferSize(8000); } catch (e) { /* best-effort */ }
        /* PIÈGE AUX SOURCES : on intercepte les PUITS d'écriture DOM eux-mêmes — le code
           de l'app n'est pas minifié, donc la pile d'appel donne la fonction + ligne
           EXACTES de index.html qui fabriquent le HTML pollué (mouchard DOM aveugle
           sur les runs 31227106483/31231175160). */
        const marque = (tag, texte, idx) => { try {
          const pile = (new Error().stack || '').split('\n').slice(2, 6)
            .map((l) => l.replace(/\s*at\s*/, '').replace(/https?:\/\/[^:)\s]+/g, '§')).join(' ← ');
          window.__pollu.push(tag + ' ctx=…' + String(texte).slice(Math.max(0, idx - 130), idx + 40).replace(/\s+/g, ' ') + '… pile: ' + pile);
        } catch (e) { /* best-effort */ } };
        const cherche = (s) => {
          let i = s.indexOf('%22/'); if (i < 0) i = s.indexOf('&quot;/&quot;');
          if (i < 0) { const m = s.match(/(?:src|href|poster|data|background)="&quot;/); if (m) i = m.index; }
          if (i < 0) { const m = s.match(/url\((?:&quot;|%22)\/(?:&quot;|%22)\)/); if (m) i = m.index; }
          return i;
        };
        try {
          const d = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
          Object.defineProperty(Element.prototype, 'innerHTML', {
            configurable: true,
            get() { return d.get.call(this); },
            set(v) { try { const s = String(v); const i = cherche(s); if (i >= 0) marque('PUITS innerHTML<' + this.tagName + '#' + (this.id || '') + '>', s, i); } catch (e) { /* */ } return d.set.call(this, v); }
          });
          const ia = Element.prototype.insertAdjacentHTML;
          Element.prototype.insertAdjacentHTML = function (pos, v) { try { const s = String(v); const i = cherche(s); if (i >= 0) marque('PUITS insertAdjacentHTML', s, i); } catch (e) { /* */ } return ia.call(this, pos, v); };
          const sa = Element.prototype.setAttribute;
          Element.prototype.setAttribute = function (n, v) { try { const s = String(v); if (/^(src|href|poster|style|data|xlink:href|srcset|background)$/.test(n) && (s.includes('"') || s.includes('%22/'))) marque('PUITS setAttribute ' + n + '<' + this.tagName + '>', s, Math.max(0, s.indexOf('"'))); } catch (e) { /* */ } return sa.call(this, n, v); };
          const sp = CSSStyleDeclaration.prototype.setProperty;
          CSSStyleDeclaration.prototype.setProperty = function (n, v, p) { try { const s = String(v); if (s.includes('%22/') || s.includes('"/"')) marque('PUITS setProperty ' + n, s, Math.max(0, s.indexOf('/'))); } catch (e) { /* */ } return sp.call(this, n, v, p); };
        } catch (e) { /* piège best-effort */ }
        const chk = (el) => { try {
          if (!el.getAttribute) return;
          const src = el.getAttribute('src') || el.getAttribute('href') || el.getAttribute('poster') || '';
          const st = el.getAttribute('style') || '';
          if (src.includes('"') || src.includes('%22')) window.__pollu.push('SRC <' + el.tagName + '> ' + src.slice(0, 50) + ' · parent=' + (el.parentElement ? (el.parentElement.className || el.parentElement.id || el.parentElement.tagName) : '?'));
          if (st.includes('"/"') || st.includes('%22') || st.includes('&quot;')) window.__pollu.push('STYLE <' + el.tagName + ' class=' + (el.className || '') + '> ' + st.slice(0, 90));
        } catch (e) { /* mouchard best-effort */ } };
        new MutationObserver((ms) => { ms.forEach((m) => {
          if (m.type === 'attributes') chk(m.target);
          if (m.addedNodes) m.addedNodes.forEach((n) => { if (n.nodeType === 1) { chk(n); if (n.querySelectorAll) n.querySelectorAll('[src],[style],[href],[poster]').forEach(chk); } });
        }); }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['src', 'style', 'href', 'poster'] });
      });
    }
    if (AS_KEVIN) {
      const m = await connecte(page, url, { pinHash: PIN_HASH });
      if (m && m.note) res.notes.push('connexion : ' + m.note);
    }
    const resp = await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    const status = resp ? resp.status() : 0;
    if (!resp || status >= 400) { res.ok = false; res.notes.push('page HTTP ' + status); }
    await page.waitForTimeout(5000); // laisse le JS/live faire ses appels réseau

    if (!(await page.$(s.selKey))) { res.ok = false; res.notes.push('élément clé absent: ' + s.selKey); }

    if (s.deep) { try { const d = await s.deep(page); res.notes.push('deep: ' + d.note); if (!d.ok) res.ok = false; } catch (e) { res.ok = false; res.notes.push('deep KO: ' + (e && e.message ? e.message : e)); } }

    /* ENQUÊTE 404 /%22/%22 (intermittent malgré les gardes v9.876-880) : quand la requête
       polluée est vue, on DÉSIGNE le consommateur exact dans le DOM — élément, attribut,
       et extrait — pour enfin trouver la clé de données source au lieu de deviner. */
    if (badStatus.some((b) => b.includes('%22'))) {
      try {
        /* quelle VERSION de page a réellement servi ce run ? (tranche « fix pas encore
           déployé/CDN » vs « fix insuffisant » — on relançait à l'aveugle sans ça) */
        const ver = await page.evaluate(() => (typeof APP_VER !== 'undefined' ? APP_VER : '?')).catch(() => '?');
        res.notes.push('version page servie : ' + ver);
        /* énumère les CLÉS de données réellement polluées (valeur contenant `"/"`) —
           fini de deviner la source une clé à la fois */
        const polluted = await page.evaluate(() => {
          const out = [];
          for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); const v = localStorage.getItem(k) || '';
            let idx = v.indexOf('\\"/\\"'); if (idx < 0) idx = v.indexOf('"\\/"'); if (idx < 0) idx = v.indexOf('%22/%22');
            if (idx >= 0) out.push(k + ' → …' + v.slice(Math.max(0, idx - 40), idx + 12).replace(/\s+/g, ' ') + '…'); }
          return out.slice(0, 6);
        }).catch(() => []);
        if (polluted.length) res.notes.push('CLÉS POLLUÉES: ' + polluted.join(' | '));
        const who = await page.evaluate(() => {
          const out = [];
          document.querySelectorAll('img,video,source,image,link[rel*="icon"]').forEach((el) => {
            const src = el.getAttribute('src') || el.getAttribute('href') || el.getAttribute('xlink:href') || '';
            if (src.includes('"') || src.includes('%22')) out.push('<' + el.tagName.toLowerCase() + ' src=' + JSON.stringify(src).slice(0, 60) + '> parent=' + (el.parentElement ? el.parentElement.className || el.parentElement.id || el.parentElement.tagName : '?'));
          });
          document.querySelectorAll('[style*="%22"],[style*="url"]').forEach((el) => {
            const st = el.getAttribute('style') || '';
            if (st.includes('%22') || st.includes('\\"')) out.push('style=' + JSON.stringify(st).slice(0, 90) + ' sur .' + (el.className || el.id || el.tagName));
          });
          for (const sh of document.styleSheets) { try { for (const r of sh.cssRules || []) { const t = r.cssText || ''; if (t.includes('%22')) out.push('CSS: ' + t.slice(0, 110)); } } catch (e) { /* cross-origin */ } }
          const vars = [];
          const cs = getComputedStyle(document.body);
          ['--cmc-login-bg', '--cmc-accueil-bg', '--cmc-planning-bg'].forEach((v) => { const val = cs.getPropertyValue(v); if (val && (val.includes('%22') || val.includes('"/"'))) vars.push(v + '=' + val.slice(0, 60)); });
          if (vars.length) out.push('vars: ' + vars.join(' · '));
          /* Resource Timing : le CANAL de chargement (css = fond CSS, img = <img>,
             other = <image> SVG, fetch/xhr = JS) — discriminant même si l'élément a disparu */
          performance.getEntriesByType('resource').filter((r) => r.name.includes('%22'))
            .forEach((r) => out.push('perf:' + r.initiatorType + ' →' + r.name.slice(-34)));
          /* corruption de flux ? (cf. Départs v1.32) : source JS qui fuit en texte + compte <script>.
             PROUVÉ run 31238385202 : scripts=10 fuiteJS=3001 (T0 sain) = document livré
             DUPLIQUÉ/déchiré en route. On mesure maintenant la taille reçue (Navigation
             Timing) : decodedBodySize ≈ 2× la taille du fichier = duplication confirmée,
             et la position de la 1re fuite dit OÙ le flux casse. */
          const bodyTxt = (document.body && document.body.textContent) || '';
          const fuite = (bodyTxt.match(/function\s+\w+\(|innerHTML|_cmcSafeCatch|\.forEach\(function/g) || []).length;
          let taille = '';
          try { const nav = performance.getEntriesByType('navigation')[0];
            if (nav) taille = ' reçu=' + nav.decodedBodySize + 'o transfert=' + nav.transferSize + 'o';
          } catch (e) { /* Navigation Timing best-effort */ }
          out.push('scripts=' + document.scripts.length + ' fuiteJS=' + fuite + taille);
          return out.slice(0, 8);
        });
        const mouchard = await page.evaluate(() => (window.__pollu || []).slice(0, 5)).catch(() => []);
        if (mouchard.length) who.push('MOUCHARD: ' + mouchard.join(' | '));
        if (cdpStacks.length) who.push('PILE RÉSEAU: ' + cdpStacks.slice(0, 2).join(' || '));
        /* photos DOM prises à l'instant T de la requête %22 (élément éphémère ⇒ seul ce
           cliché le voit) + initiatorType (css/img/other) qui dit PAR QUEL CANAL il charge */
        try {
          const snaps = (await Promise.all(culpritSnaps)).flat().filter(Boolean);
          if (snaps.length) who.push('CLICHÉ T0: ' + [...new Set(snaps)].slice(0, 5).join(' | '));
        } catch (e) { /* best-effort */ }
        res.notes.push(who.length ? ('COUPABLE %22 → ' + who.join(' | ')) : 'COUPABLE %22 → introuvable dans le DOM au moment du scan (élément déjà retiré ?)');
      } catch (e) { /* enquête best-effort */ }
    }

    await page.screenshot({ path: SHOT_DIR + '/' + s.name.replace(/[^\w]+/g, '_') + '.png' }).catch(() => {});

    if (jsErrors.length) { res.ok = false; res.notes.push('EXCEPTION JS: ' + jsErrors.slice(0, 2).join(' | ')); }
    if (failedProject.length) { res.ok = false; res.notes.push('REQUÊTE PROJET BLOQUÉE (classe CORS/commande): ' + failedProject.slice(0, 3).join(' ; ')); }
    if (badStatus.length) { res.ok = false; res.notes.push('STATUT PROJET 404/5xx (route/asset cassé): ' + badStatus.slice(0, 3).join(' ; ')); }
    if (authGated.length) res.notes.push('401/403 données (toléré — audit anonyme, sécurité normale): ' + authGated.length);
    if (failedTol.length) res.notes.push('req. échouées tolérées (tierce/aborted): ' + failedTol.length);
    if (consoleErr.length) res.notes.push('bruit console: ' + consoleErr.length + ' (ex ' + consoleErr[0] + ')');
  } catch (e) {
    res.ok = false;
    res.notes.push('EXCEPTION: ' + (e && e.message ? e.message : String(e)));
  }
  await page.close();
  if (!res.ok) hardFail++;
  report.push(res);
}

await browser.close();

writeFileSync(SHOT_DIR + '/report.json', JSON.stringify({ base: BASE, at: new Date().toISOString(), hardFail, report }, null, 2));

console.log('\n=== AUDIT LIVE ' + BASE + ' ===');
for (const r of report) {
  console.log((r.ok ? '✅' : '❌') + ' ' + r.name + '  ' + r.url);
  for (const n of r.notes) console.log('   · ' + n);
}
console.log(hardFail === 0 ? '\nAUDIT LIVE OK — toutes les surfaces rendent, 0 requête projet bloquée.' : '\nAUDIT LIVE ÉCHEC (' + hardFail + ' surface(s))');
process.exit(hardFail === 0 ? 0 : 1);
