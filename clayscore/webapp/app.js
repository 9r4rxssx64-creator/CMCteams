/* ClayScore PWA — logique client (vanilla JS, hors ligne, sans CDN). */
"use strict";

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
let DISC = [];            // disciplines chargées
let DISC_MAP = {};        // key -> discipline
let CART = 1;             // cartouche sélectionnée (DTL)
let LAST_STATE = null;

/* ---------- utilitaires ---------- */
/* Échappement OBLIGATOIRE de toute donnée saisie (nom de tireur, de lanceur…)
   avant insertion dans du HTML. Sans ça, un nom du type <img onerror=...>
   s'exécuterait sur toutes les tablettes ET sur l'écran TV du club-house. */
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

async function api(path, opts) {
  const o = Object.assign({ headers: {} }, opts);
  o.headers = Object.assign({ "Content-Type": "application/json" }, o.headers);
  const pin = localStorage.getItem("clayscore_pin");
  if (pin) o.headers["X-ClayScore-Pin"] = pin;
  const r = await fetch(path, o);
  if (r.status === 401 || r.status === 403) {
    const p = prompt("Code d'accès ClayScore (demandé sur réseau partagé) :");
    if (p) { localStorage.setItem("clayscore_pin", p); return api(path, opts); }
    throw new Error("Code d'accès requis");
  }
  if (!r.ok) {
    let msg = "Erreur réseau";
    try { msg = (await r.json()).detail || msg; } catch (_) {}
    throw new Error(msg);
  }
  const ct = r.headers.get("content-type") || "";
  return ct.includes("application/json") ? r.json() : r.text();
}
function toast(m) {
  const t = $("#toast"); t.textContent = m; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2200);
}
function show(view) {
  ["config", "game", "history", "tv", "net"].forEach((v) =>
    $("#view-" + v).classList.toggle("hidden", v !== view));
  $$(".foot button").forEach((b) => b.classList.toggle("on", b.dataset.nav === view));
  if (view === "history") loadHistory();
  if (view === "tv") renderTV(LAST_STATE);
  if (view === "net") { loadCompetition(); loadNetwork(); }
}
const verdictTag = (v) => `<span class="tag tag-${v}">${(
  { casse: "CASSÉ", manque: "MANQUÉ", nobird: "NO BIRD", ambigu: "À VÉRIFIER" }[v] || v)}</span>`;

/* ---------- config ---------- */
function shooterRow(name) {
  const div = document.createElement("div");
  div.className = "row"; div.style.marginBottom = "8px";
  div.innerHTML = `<input class="s-name" value="${esc(name || "")}" placeholder="Nom Prénom">
    <button class="red s-del" style="flex:0 0 56px">✕</button>`;
  div.querySelector(".s-del").onclick = () => {
    if ($$(".s-name").length > 1) div.remove();
  };
  return div;
}
async function initConfig() {
  DISC = await api("/api/disciplines"); DISC_MAP = {};
  const sel = $("#f-disc"); sel.innerHTML = "";
  DISC.forEach((d) => { DISC_MAP[d.key] = d;
    const o = document.createElement("option"); o.value = d.key; o.textContent = d.label; sel.appendChild(o); });
  const sh = $("#shooters"); sh.innerHTML = ""; sh.appendChild(shooterRow("Tireur 1"));
  loadHistory(true);
}
$("#addShooter").onclick = () => {
  if ($$(".s-name").length >= 6) return toast("6 tireurs maximum");
  $("#shooters").appendChild(shooterRow(""));
};
$("#start").onclick = async () => {
  const shooters = $$(".s-name").map((i) => i.value.trim()).filter(Boolean);
  if (!shooters.length) return toast("Ajoute au moins un tireur");
  const cart = $("#f-cart").value;
  try {
    const machines = $("#f-machines").value.split(",").map(s => s.trim()).filter(Boolean);
    await api("/api/game/new", { method: "POST", body: JSON.stringify({
      discipline: $("#f-disc").value, shooters,
      serie: parseInt($("#f-serie").value, 10) || 25,
      cartouches: cart ? parseInt(cart, 10) : null,
      auto_mode: $("#f-auto").checked,
      machines: machines.length ? machines : null,
      mode: $("#f-mode").value,
    })});
    show("game");
  } catch (e) { toast(e.message); }
};

/* ---------- partie ---------- */
$("#throw").onclick = async () => {
  $("#throw").disabled = true; $("#throw").textContent = "Analyse…";
  try { await api("/api/game/throw", { method: "POST" }); }
  catch (e) { toast(e.message); }
  finally { $("#throw").disabled = false; $("#throw").textContent = "🚀 LANCER LE PLATEAU"; }
};
$$('#throw-card [data-v]').forEach((b) => b.onclick = () => submitVerdict(b.dataset.v));
$("#validate-auto").onclick = () => submitVerdict(null);
$("#export-overlay").onclick = async () => {
  const b = $("#export-overlay"); b.disabled = true; b.textContent = "Habillage…";
  try {
    const r = await api("/api/game/overlay", { method: "POST" });
    const rv = $("#replay");
    rv.dataset.src = r.clip_url; rv.src = r.clip_url; rv.playbackRate = 1;
    rv.play().catch(() => {});
    toast("🎬 Ralenti habillé prêt (" + r.verdict + ")");
    // Lien de téléchargement pour la vidéo de démo.
    const a = document.createElement("a"); a.href = r.clip_url;
    a.download = r.clip_url.split("/").pop(); a.click();
  } catch (e) { toast(e.message); }
  finally { b.disabled = false; b.textContent = "🎬 Ralenti habillé (démo)"; }
};
$$('#cart-row [data-cart]').forEach((b) => b.onclick = () => {
  CART = parseInt(b.dataset.cart, 10);
  $$('#cart-row [data-cart]').forEach((x) => x.classList.toggle("gold", x === b));
});
async function submitVerdict(v) {
  try { await api("/api/game/verdict", { method: "POST",
    body: JSON.stringify({ verdict: v, cartridge: CART }) });
    CART = 1; $$('#cart-row [data-cart]').forEach((x) => x.classList.remove("gold"));
  } catch (e) { toast(e.message); }
}
$("#save").onclick = async () => {
  try { const r = await api("/api/game/finish", { method: "POST" });
    toast("Partie enregistrée (n°" + r.saved_id + ")"); loadHistory(true);
  } catch (e) { toast(e.message); }
};
$("#csv").onclick = async () => {
  try { const txt = await api("/api/game/csv");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([txt], { type: "text/csv" }));
    a.download = "clayscore.csv"; a.click();
  } catch (e) { toast(e.message); }
};
$("#again").onclick = () => { show("config"); };

/* ---------- rendu de l'état ---------- */
function renderState(st) {
  LAST_STATE = st;
  if (!st || !st.active) { return; }
  const d = DISC_MAP[st.discipline] || { label: st.discipline, scoring: "standard" };
  $("#g-disc").textContent = d.label + (st.official ? " · 🏆 CONCOURS" : "")
    + (st.current_machine ? " · " + st.current_machine : "");
  const totalClays = st.serie * st.scorecard.length;
  const done = st.scorecard.reduce((a, c) => a + c.clays, 0);
  $("#g-progress").textContent = `${done}/${totalClays} plateaux`;
  $("#g-shooter").textContent = st.current_shooter || "—";
  $("#g-post").textContent = st.current_post || "—";
  $("#g-clay").textContent = st.finished ? "—"
    : (st.is_double ? `${st.current_clay_in_turn}/${st.current_turn_size} (doublé)` : "simple");

  // scoreboard
  $("#board").innerHTML = st.scorecard.map((c) =>
    `<span class="chip ${c.shooter === st.current_shooter ? "cur" : ""}">
      ${esc(c.shooter)} <b>${c.casse}/${c.clays}</b> ${c.pct}%
      ${c.nobird ? `· ${c.nobird}🔁` : ""}</span>`).join("");

  // pending analysis
  const p = st.pending;
  const parea = $("#pending-area");
  if (p && !st.finished) {
    parea.classList.remove("hidden"); $("#throw").classList.add("hidden");
    const rv = $("#replay");
    if (rv.dataset.src !== p.clip_url) {
      rv.dataset.src = p.clip_url; rv.src = p.clip_url;
      rv.playbackRate = 0.35; rv.play().catch(() => {});
    }
    $("#p-verdict").outerHTML = verdictTag(p.auto_verdict).replace("<span", '<span id="p-verdict"');
    $("#p-conf").textContent = `(${Math.round(p.confidence * 100)}%${p.ambiguous ? " — arbitre !" : ""})`;
    $("#cart-row").classList.toggle("hidden", d.scoring !== "dtl");
  } else {
    parea.classList.add("hidden");
    if (!st.finished) $("#throw").classList.remove("hidden");
  }

  // final
  $("#final-card").classList.toggle("hidden", !st.finished);
  $("#throw-card").classList.toggle("hidden", st.finished);
  if (st.finished) {
    $("#final-board").innerHTML = "<table><tr><th>Tireur</th><th>Cassés</th>"
      + "<th>Points</th><th>%</th></tr>"
      + st.scorecard.map((c) => `<tr><td>${esc(c.shooter)}</td>
        <td>${c.casse}/${c.clays}</td><td>${c.points}</td><td>${c.pct}%</td></tr>`).join("")
      + "</table>";
  }
}

/* ---------- historique ---------- */
async function loadHistory(miniOnly) {
  let list = [];
  try { list = await api("/api/history?limit=50"); } catch (_) {}
  const fmt = (ts) => new Date(ts * 1000).toLocaleString("fr-FR");
  const rows = list.map((p) => {
    const best = p.scorecard.slice().sort((a, b) => b.points - a.points)[0];
    return `<div class="chip" style="width:100%;justify-content:space-between">
      <span>#${p.id} · ${esc((DISC_MAP[p.discipline] || {}).label || p.discipline)}
      · ${p.shooters.length} tireur(s)</span>
      <b>${best ? esc(best.shooter) + " " + best.points + " pts" : ""}</b></div>`;
  }).join("");
  $("#hist-mini").innerHTML = list.length ? rows : '<span class="muted">Aucune partie enregistrée.</span>';
  if (!miniOnly) $("#hist-list").innerHTML = list.length ? rows : '<span class="muted">Vide.</span>';
}

/* ---------- TV ---------- */
function renderTV(st) {
  if (!st || !st.active) { $("#tv-board").innerHTML = '<div class="muted">Aucune partie.</div>'; return; }
  $("#tv-disc").textContent = (DISC_MAP[st.discipline] || {}).label || st.discipline;
  $("#tv-board").innerHTML = st.scorecard.map((c) =>
    `<div class="tvscore ${c.shooter === st.current_shooter ? "" : "muted"}">
      ${esc(c.shooter)} : ${c.casse}/${c.clays}</div>`).join("");
}

/* ---------- WebSocket temps réel ---------- */
function connectWS() {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  let ws;
  try { ws = new WebSocket(`${proto}://${location.host}/ws`); }
  catch (_) { setTimeout(connectWS, 2000); return; }
  ws.onopen = () => { $("#wsdot").classList.add("ok"); $("#wslbl").textContent = "en direct"; };
  ws.onclose = () => { $("#wsdot").classList.remove("ok"); $("#wslbl").textContent = "hors ligne";
    setTimeout(connectWS, 2000); };
  ws.onmessage = (ev) => {
    try { const m = JSON.parse(ev.data);
      if (m.type === "state") { renderState(m.state);
        const tv = !$("#view-tv").classList.contains("hidden"); if (tv) renderTV(m.state); }
    } catch (_) {}
  };
}

/* ---------- réseau ---------- */
/* Répond à la seule question qui compte sur le terrain :
   "quelle adresse je tape sur la tablette, et est-ce que tout est branché ?" */
const NIVEAU_ICONE = { bloquant: "🔴", important: "🟠", conseil: "🟡" };

/* Contrôle GO/NO-GO avant une épreuve : un seul point rouge et on ne part pas. */
async function loadCompetition() {
  let g = null, pw = null, po = null, j = null;
  try { g  = await api("/api/officiel/controle"); } catch (e) { }
  try { pw = await api("/api/alimentation"); } catch (e) { }
  try { po = await api("/api/postes"); } catch (e) { }
  try { j  = await api("/api/officiel/journal"); } catch (e) { }
  try {
    const q = await api("/api/image/qualite");
    if (q.ok === null) { $("#imgq").textContent = q.detail; }
    else {
      $("#imgq").innerHTML =
        (q.ok ? "✅ Image exploitable<br>" : "⚠️ Réglage caméra à revoir<br>") +
        `<span class="muted">luminosité ${q.luminosite}/255 · grain ${q.bruit} ·
         netteté ${q.nettete} (indicateur)</span>` +
        (q.problemes || []).map((x) => `<div class="chip" style="width:100%;text-align:left">
          ${esc(x.quoi)}<br><span class="muted">→ ${esc(x.solution)}</span></div>`).join("");
    }
  } catch (e) { }

  if (g) {
    $("#go-verdict").textContent = g.go ? "✅ PRÊT" : "⛔ PAS PRÊT";
    $("#go-verdict").style.color = g.go ? "var(--casse,#28c281)" : "var(--manque,#ff5a4d)";
    $("#go-items").innerHTML = (g.items || []).map((i) =>
      `<div class="chip" style="width:100%;text-align:left">
        ${i.ok ? "✅" : (i.bloquant ? "⛔" : "🟠")} ${esc(i.quoi)}
        ${i.ok ? "" : `<br><span class="muted">→ ${esc(i.solution)}</span>`}</div>`).join("");
  }
  if (pw) {
    const auto = pw.autonomie_h === null ? "illimitée (source branchée)"
                                         : pw.autonomie_h + " h restantes";
    $("#pwr").innerHTML =
      `Source : <b>${esc(pw.source)}</b>${pw.sur_batterie ? " (sur batterie)" : ""}<br>` +
      `Consommation : <b>${pw.conso_w} W</b> · Autonomie : <b>${esc(String(auto))}</b><br>` +
      `<span class="muted">Valeur ${esc(pw.mesure)}</span>` +
      (pw.alertes || []).map((a) =>
        `<div class="chip" style="width:100%;text-align:left">${esc(a.quoi)}<br>
         <span class="muted">→ ${esc(a.solution)}</span></div>`).join("");
  }
  if (po) {
    $("#pods").innerHTML = po.pods.length
      ? po.pods.map((p) => `<div class="chip" style="width:100%;text-align:left">
          ${p.en_ligne ? "🟢" : "🔴"} <b>${esc(p.id)}</b> · ${esc(p.role)} ·
          ${esc(p.liaison_label)} · ${p.distance_m} m ·
          ${p.edge ? "intelligent" : esc(p.flux)} (${p.debit_requis_mbps} Mbit/s)</div>`).join("")
        + (po.problemes || []).map((x) => `<div class="chip" style="width:100%;text-align:left">
            ⚠️ ${esc(x.quoi)}<br><span class="muted">→ ${esc(x.solution)}</span></div>`).join("")
      : '<span class="muted">Aucun poste déclaré (mode simulation).</span>';
  }
  if (j) {
    const v = j.verification;
    $("#journal").innerHTML = v.ok
      ? `✅ Journal intègre — <b>${j.entrees}</b> événements enregistrés<br>
         <span class="muted">Sceau : ${esc((v.sceau || "").slice(0, 16))}…</span>`
      : `⛔ <b>Journal altéré</b> (${esc(v.raison || "")})<br>
         <span class="muted">Prévenir le jury avant de continuer.</span>`;
  }
}
$("#go-refresh").onclick = () => { loadCompetition(); loadNetwork(); };
$("#seal-btn").onclick = async () => {
  try {
    const f = await api("/api/officiel/fiche");
    $("#seal-out").innerHTML = `Sceau : <b>${esc(f.sceau_court)}</b><br>
      <span class="muted">À reporter sur la fiche papier. Toute modification
      d'un score change ce sceau.</span>`;
  } catch (e) { toast(e.message); }
};

async function loadNetwork() {
  let n = null, h = null;
  try { n = await api("/api/network"); } catch (e) { }
  if (!n) { $("#net-mode").textContent = "Hub injoignable"; return; }

  $("#net-mode").textContent = n.mode === "autonome"
    ? `📶 WiFi autonome « ${n.hotspot_ssid} »`
    : "🔌 Branché sur le réseau existant";
  $("#net-detail").textContent = n.detail;

  $("#net-urls").innerHTML = (n.urls || []).map((u) =>
    `<div class="chip" style="width:100%"><b>${esc(u)}</b></div>`).join("")
    || '<span class="muted">Aucune adresse — le hub n\'est pas joignable.</span>';

  const pb = n.problemes || [];
  $("#net-checks").innerHTML = pb.length
    ? pb.map((p) => `<div class="chip" style="width:100%;text-align:left">
        ${NIVEAU_ICONE[p.niveau] || "•"} ${esc(p.quoi)}<br>
        <span class="muted">→ ${esc(p.solution)}</span></div>`).join("")
    : '<div class="chip" style="width:100%">✅ Installation réseau correcte</div>';

  try { h = await api("/api/health"); } catch (e) { }
  if (h) {
    const cams = h.reseau.cameras_isolated ? "isolées ✅" : "non isolées ⚠️";
    $("#net-health").innerHTML =
      `Version <b>${esc(h.version)}</b> · caméras ${cams}<br>` +
      `Ralentis stockés : <b>${h.disque.clips}</b> (${h.disque.mb} Mo)<br>` +
      `Code d'accès : <b>${n.pin_required ? "exigé" : "non configuré"}</b>`;
  }
}
$("#net-refresh").onclick = loadNetwork;

/* ---------- mise à jour automatique des tablettes ---------- */
/* Une tablette de club ne doit JAMAIS rester sur une vieille version : elle
   se met à jour toute seule, sans que personne ait à vider un cache. */
let APP_VERSION = null;
async function checkUpdate() {
  try {
    const r = await fetch("/api/version", { cache: "no-store" });
    const v = (await r.json()).version;
    if (APP_VERSION === null) { APP_VERSION = v; return; }
    if (v !== APP_VERSION) {
      APP_VERSION = v;
      if (window.caches) { const ks = await caches.keys(); await Promise.all(ks.map((k) => caches.delete(k))); }
      if (navigator.serviceWorker) {
        const rs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(rs.map((x) => x.unregister()));
      }
      location.reload();
    }
  } catch (_) { /* hors ligne : on réessaiera */ }
}

/* ---------- navigation ---------- */
$$(".foot button").forEach((b) => b.onclick = () => show(b.dataset.nav));

/* ---------- démarrage ---------- */
(async function boot() {
  await initConfig();
  let st = null;
  try { st = await api("/api/game/state"); } catch (_) {}
  renderState(st);
  show(st && st.active && !st.finished ? "game" : "config");
  connectWS();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  checkUpdate();
  setInterval(checkUpdate, 60000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkUpdate();
  });
})();
