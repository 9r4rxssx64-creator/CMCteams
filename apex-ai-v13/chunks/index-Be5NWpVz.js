const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-DffZdqkV.js","./monitoring-wizczV_1.js","./multi-source-analyze-CeV_AU5U.js","./credential-patterns-ClK5OHi0.js"])))=>i.map(i=>d[i]);
import{_ as y}from"./apex-kb-DffZdqkV.js";import{e as s}from"./escape-html-BlQj2yEF.js";import{c as S}from"./listener-cleanup-Y2rGGxxX.js";import{s as T,l as _}from"./monitoring-wizczV_1.js";import{credentialsAudit as k}from"./credentials-audit-C6Yk9WRN.js";import{haptic as f}from"./haptic-CQFg2PXZ.js";import{toast as p}from"./toast-CRdbcLoc.js";import"./credential-patterns-ClK5OHi0.js";import"./multi-source-analyze-CeV_AU5U.js";let u=null,m=null,v="all";function H(){u?.cleanup(),u=null}const $={ok:{color:"#22cc77",icon:"🟢",label:"OK"},missing:{color:"#888",icon:"⚪",label:"Non config"},corrupted:{color:"#ff6b6b",icon:"🔴",label:"Corrompu"},expired:{color:"#ffaa00",icon:"🟠",label:"Expiré"},unknown:{color:"#aaa",icon:"❓",label:"Inconnu"},decrypt_failed:{color:"#ff6b6b",icon:"🔒",label:"Illisible"}},h={all:"Tous",ai:"🤖 IA",banking:"🏦 Banque",payment:"💳 Paiement",social:"📱 Social",email:"📧 Email",crypto:"₿ Crypto",hosting:"☁️ Hosting",productivity:"📋 Productivité",forbidden:"⚠️ Forbidden"};async function w(e){if(!(T.get("isAdmin")===!0)){e.innerHTML=`
      <div class="ax-gs-21">
        <h2 class="ax-gs-266">Accès admin uniquement</h2>
        <p>Cette section est réservée à Kevin.</p>
      </div>
    `;return}u?.cleanup(),u=S("credentials-registry"),e.innerHTML=`
    <div class="ax-gs-57">
      <p>🔍 Audit credentials en cours...</p>
    </div>
  `;try{m=await k.runFullAudit()}catch(o){_.error("credentials-registry","audit failed",{err:o}),e.innerHTML=`<div style="padding:40px;color:#ff6b6b">Erreur audit : ${s(String(o))}</div>`;return}A(e,m)}function A(e,i){const o=i.security_score,t=o>=80?"#22cc77":o>=60?"#ffaa00":"#ff6b6b",c=[...v==="all"?i.entries:i.entries.filter(r=>r.category===v)].sort((r,l)=>r.configured!==l.configured?r.configured?-1:1:r.service_name.localeCompare(l.service_name)),n=new Map;n.set("all",i.entries.length);for(const r of i.entries)n.set(r.category,(n.get(r.category)??0)+1);const a=[...n.entries()].filter(([r])=>r==="all"||h[r]&&(n.get(r)??0)>0).map(([r,l])=>{const b=v===r,C=h[r]??r;return`<button data-cat="${s(r)}" class="ax-cat-chip" style="
        padding:8px 14px;border-radius:20px;border:1px solid ${b?"#c9a227":"rgba(255,255,255,0.15)"};
        background:${b?"rgba(201,162,39,0.15)":"rgba(255,255,255,0.03)"};
        color:${b?"#c9a227":"var(--ax-text-dim)"};
        cursor:pointer;font-size:13px;margin:4px;font-weight:${b?"600":"400"}
      ">${s(C)} (${l})</button>`}).join(""),g=i.recommendations.length===0?'<p style="color:#22cc77;margin:0">✅ Aucune recommandation — config saine</p>':i.recommendations.map(r=>`<li style="margin:8px 0;color:#ffaa00">${s(r)}</li>`).join(""),x=c.length===0?'<p class="ax-gs-213">Aucun credential dans cette catégorie</p>':c.map(r=>z(r)).join("");e.innerHTML=`
    <div class="ax-page ax-gs-364">
      <header class="ax-gs-180">
        <h1 class="ax-gs-365">🔐 Coffre — Audit credentials</h1>
        <p style="color:var(--ax-text-dim);margin:0;font-size:13px">
          ${i.total_patterns} patterns reconnus · ${i.configured_count} configurés ·
          ${i.encrypted_count} chiffrés AES-GCM-256 · ${i.firebase_backup_count} backup Firebase
        </p>
      </header>

      <!-- Security Score Card -->
      <div style="background:linear-gradient(135deg,rgba(201,162,39,0.1),rgba(201,162,39,0.02));
                  border:1px solid rgba(201,162,39,0.3);border-radius:14px;padding:20px;margin-bottom:20px">
        <div class="ax-gs-112">
          <div>
            <div class="ax-gs-128">Score sécurité credentials</div>
            <div style="font-size:42px;font-weight:700;color:${t};line-height:1">
              ${o.toFixed(0)}<span style="font-size:20px;color:var(--ax-text-dim)">/100</span>
            </div>
          </div>
          <div class="ax-gs-7">
            <button id="ax-cred-refresh" class="ax-btn ax-btn-outline ax-gs-366">🔄 Refresh audit</button>
            <button id="ax-cred-test-channels" class="ax-btn ax-btn-outline ax-gs-366">📡 Test alertes</button>
          </div>
        </div>
      </div>

      <!-- Recommandations -->
      <div style="background:rgba(255,170,0,0.05);border:1px solid rgba(255,170,0,0.2);
                  border-radius:12px;padding:16px;margin-bottom:20px">
        <h3 style="margin:0 0 12px;color:#ffaa00;font-size:15px">💡 Recommandations</h3>
        <ul class="ax-gs-362">${g}</ul>
      </div>

      <!-- Filtres catégorie -->
      <div class="ax-gs-181">
        <h3 style="margin:0 0 8px;color:var(--ax-text-dim);font-size:13px;text-transform:uppercase;letter-spacing:0.5px">
          Filtrer par catégorie
        </h3>
        <div style="display:flex;flex-wrap:wrap">${a}</div>
      </div>

      <!-- Liste credentials -->
      <div id="ax-cred-list">${x}</div>

      <p class="ax-gs-265">
        🔒 Coffre Apex v13 · AES-GCM-256 + PBKDF2 200k · Triple persistence (local+IDB+Firebase)
      </p>
    </div>
  `,L(e),_.info("credentials-registry",`rendered : ${i.configured_count}/${i.total_patterns} configured, score=${o}`)}function z(e){const i=$[e.status],o=[e.persisted.local?'<span title="localStorage" class="ax-gs-205">💾</span>':'<span title="pas en local" class="ax-gs-224">·</span>',e.persisted.idb?'<span title="IndexedDB shadow" class="ax-gs-205">🗄️</span>':'<span title="pas en IDB" class="ax-gs-224">·</span>',e.persisted.firebase?'<span title="Firebase backup" class="ax-gs-205">☁️</span>':'<span title="pas en Firebase" class="ax-gs-224">·</span>'].join(" ");return`
    <article data-cred-detail="${s(e.storage_key)}" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);
                    border-radius:10px;padding:14px;margin-bottom:8px;cursor:pointer">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
        <div class="ax-gs-11">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <strong class="ax-gs-266">${s(e.service_name)}</strong>
            <span style="font-size:11px;padding:2px 6px;border-radius:8px;background:rgba(255,255,255,0.05);color:var(--ax-text-dim)">
              ${s(e.category)}
            </span>
          </div>
          <code class="ax-gs-190">${s(e.storage_key)}</code>
        </div>
        <div class="ax-gs-83">
          <span style="color:${i.color};font-size:13px">${i.icon} ${i.label}</span>
          ${e.encrypted?'<span style="color:#22cc77;font-size:11px" title="AES-GCM-256">🔒</span>':""}
          <span class="ax-gs-225">${o}</span>
          <code style="font-family:monospace;font-size:11px;color:var(--ax-text-dim);background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:4px">${s(e.preview)}</code>
        </div>
      </div>
      ${e.status_detail?`<p style="margin:6px 0 0;color:#ff6b6b;font-size:11px">⚠️ ${s(e.status_detail)}</p>`:""}
      <div class="ax-gs-129">
        ${e.status==="decrypt_failed"?`<button class="ax-btn ax-btn-sm" data-recover="${s(e.storage_key)}" data-service="${s(e.service_name)}" style="font-size:11px;padding:4px 10px;background:rgba(255,170,0,0.2);color:#ffaa00;border:1px solid rgba(255,170,0,0.4);font-weight:600">🔓 Récupérer cette clé</button>`:""}
        ${e.configured?`<button class="ax-btn ax-btn-sm" data-test="${s(e.storage_key)}" style="font-size:11px;padding:4px 10px">🧪 Tester</button>`:""}
        ${e.dashboard_url?`<a href="${s(e.dashboard_url)}" target="_blank" rel="noopener" class="ax-btn ax-btn-sm ax-gs-280">🔗 Dashboard</a>`:""}
        ${e.billing_url?`<a href="${s(e.billing_url)}" target="_blank" rel="noopener" class="ax-btn ax-btn-sm ax-gs-280">💰 Recharger</a>`:""}
      </div>
    </article>
  `}function R(e,i,o){const t=document.createElement("div");t.setAttribute("role","dialog"),t.setAttribute("aria-label",`Récupérer ${o}`),t.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px",t.innerHTML=`
    <div style="background:#1a1a2e;border:1px solid rgba(201,162,39,0.4);border-radius:14px;padding:24px;max-width:480px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.6)">
      <h3 class="ax-gs-365">🔓 Récupérer ${s(o)}</h3>
      <p style="color:var(--ax-text-dim);font-size:13px;margin:0 0 16px">
        Clé chiffrée présente mais illisible (passphrase a changé). Recolle ta clé pour qu'Apex la re-chiffre avec la passphrase courante.
      </p>
      <input type="password" id="ax-recover-input" aria-label="Coller la clé ${s(o)} à récupérer" autocomplete="off" placeholder="Recolle ta clé ${s(o)}…"
        style="width:100%;padding:12px;background:rgba(0,0,0,0.4);color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:8px;font-family:monospace;font-size:13px;box-sizing:border-box">
      <div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end">
        <button id="ax-recover-cancel" style="padding:8px 16px;background:rgba(255,255,255,0.05);color:var(--ax-text-dim);border:1px solid rgba(255,255,255,0.15);border-radius:8px;cursor:pointer;font-size:13px">Annuler</button>
        <button id="ax-recover-confirm" style="padding:8px 16px;background:rgba(34,204,119,0.2);color:#22cc77;border:1px solid rgba(34,204,119,0.4);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600">✅ Récupérer</button>
      </div>
    </div>
  `,document.body.appendChild(t);const d=t.querySelector("#ax-recover-input"),c=t.querySelector("#ax-recover-cancel"),n=t.querySelector("#ax-recover-confirm");setTimeout(()=>d?.focus(),50);const a=()=>{t.remove()};c?.addEventListener("click",a),t.addEventListener("click",g=>{g.target===t&&a()}),n?.addEventListener("click",()=>{(async()=>{const g=d?.value.trim()??"";if(!g){p.warn("Recolle ta clé pour récupérer");return}try{const{vault:x}=await y(async()=>{const{vault:l}=await import("./apex-kb-DffZdqkV.js").then(b=>b.b);return{vault:l}},__vite__mapDeps([0,1,2,3]),import.meta.url),r=await x.recover(i,g);r.ok?(f.success(),p.success(`✅ ${o} récupérée + re-chiffrée`),a(),w(e)):(f.error(),p.error(`❌ ${r.reason??"recover failed"}`))}catch(x){p.error(`Erreur : ${String(x).slice(0,100)}`)}})()})}function L(e){if(!u)return;const i=e.querySelector("#ax-cred-refresh");i&&u.bind(i,"click",()=>{f.tap(),w(e)});const o=e.querySelector("#ax-cred-test-channels");o&&u.bind(o,"click",()=>{f.tap(),(async()=>{p.info("📡 Test alertes en cours...");const{kevinAlerts:t}=await y(async()=>{const{kevinAlerts:n}=await import("./kevin-alerts-BTZOaQvX.js");return{kevinAlerts:n}},__vite__mapDeps([0,1,2,3]),import.meta.url),d=await t.testAllChannels(),c=Object.entries(d).filter(([,n])=>n).map(([n])=>n);c.length===0?p.warn("Aucun channel d'alerte configuré"):p.success(`✅ Channels OK : ${c.join(", ")}`)})()}),e.querySelectorAll("[data-cat]").forEach(t=>{u.bind(t,"click",()=>{v=t.dataset.cat??"all",f.selection(),m&&A(e,m)})}),e.querySelectorAll("[data-recover]").forEach(t=>{u.bind(t,"click",()=>{const d=t.dataset.recover??"",c=t.dataset.service??d;d&&(f.tap(),R(e,d,c))})}),e.querySelectorAll("[data-test]").forEach(t=>{u.bind(t,"click",d=>{d.stopPropagation();const c=t.dataset.test;c&&(f.tap(),(async()=>{const n=t.textContent;t.textContent="⏳ Test...",t.disabled=!0;try{const a=await k.testCredential(c);a.valid===!0?p.success(`✅ ${c} : valide (${a.latency_ms}ms)`):a.valid===!1?p.warn(`❌ ${c} : invalide`):p.info(`❓ ${c} : ${a.error??"test impossible"}`)}catch(a){p.error(`Test failed : ${String(a).slice(0,100)}`)}finally{t.textContent=n??"🧪 Tester",t.disabled=!1}})())})}),e.querySelectorAll("[data-cred-detail]").forEach(t=>{u.bind(t,"click",d=>{d.target.closest("button, a")||(async()=>{const n=t.dataset.credDetail;if(!n||!m)return;const a=m.entries.find(l=>l.storage_key===n);if(!a)return;const{drillDown:g}=await y(async()=>{const{drillDown:l}=await import("./drilldown-1SlvGToi.js");return{drillDown:l}},[],import.meta.url),x="ax-drilldown-mount-credentials";let r=document.getElementById(x);r||(r=document.createElement("div"),r.id=x,document.body.appendChild(r)),g.open({id:`cred-${n}`,title:`🔑 ${a.service_name}`,content:()=>{const l=$[a.status]??$.unknown;return`
              <div class="ax-gs-27">
                <table class="ax-gs-291">
                  <tr><td class="ax-gs-367">Service</td><td>${s(a.service_name)}</td></tr>
                  <tr><td class="ax-gs-367">Storage key</td><td><code>${s(a.storage_key)}</code></td></tr>
                  <tr><td class="ax-gs-367">Catégorie</td><td>${s(a.category)}</td></tr>
                  <tr><td class="ax-gs-367">Statut</td><td style="color:${l.color}">${l.icon} ${l.label}</td></tr>
                  <tr><td class="ax-gs-367">Chiffré</td><td>${a.encrypted?"🔒 AES-GCM-256":"⚠️ Non chiffré"}</td></tr>
                  <tr><td class="ax-gs-367">Configuré</td><td>${a.configured?"✅ Oui":"⚪ Non"}</td></tr>
                  <tr><td class="ax-gs-367">Aperçu</td><td><code>${s(a.preview)}</code></td></tr>
                  ${a.dashboard_url?`<tr><td class="ax-gs-367">Dashboard</td><td><a href="${s(a.dashboard_url)}" target="_blank" rel="noopener" class="ax-gs-198">${s(a.dashboard_url)}</a></td></tr>`:""}
                  ${a.billing_url?`<tr><td class="ax-gs-367">Billing</td><td><a href="${s(a.billing_url)}" target="_blank" rel="noopener" class="ax-gs-198">${s(a.billing_url)}</a></td></tr>`:""}
                </table>
                ${a.status_detail?`<p style="margin:12px 0 0;color:#ff6b6b;font-size:12px">⚠️ ${s(a.status_detail)}</p>`:""}
              </div>
            `},data:{storageKey:n}},r)})()})})}export{H as dispose,w as render};
