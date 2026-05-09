const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-DMwkFL-5.js","./monitoring-3uBGKGRH.js","./credential-patterns-z3lBBSNT.js"])))=>i.map(i=>d[i]);
import{_ as v}from"./apex-kb-DMwkFL-5.js";import{e as i}from"./html-safe-CCp1QaJu.js";import{c as S}from"./listener-cleanup-Y2rGGxxX.js";import{l as _}from"./monitoring-3uBGKGRH.js";import{s as z}from"../core/main-BpYjB9Ue.js";import{credentialsAudit as w}from"./credentials-audit-CrfF3qCF.js";import{haptic as f}from"./haptic-CQFg2PXZ.js";import{toast as p}from"./toast-ClsF1KRZ.js";import"./credential-patterns-z3lBBSNT.js";import"./multi-source-analyze-DVTf8ghx.js";let x=null,y=null,m="all";function P(){x?.cleanup(),x=null}const h={ok:{color:"#22cc77",icon:"🟢",label:"OK"},missing:{color:"#888",icon:"⚪",label:"Non config"},corrupted:{color:"#ff6b6b",icon:"🔴",label:"Corrompu"},expired:{color:"#ffaa00",icon:"🟠",label:"Expiré"},unknown:{color:"#aaa",icon:"❓",label:"Inconnu"},decrypt_failed:{color:"#ff6b6b",icon:"🔒",label:"Illisible"}},$={all:"Tous",ai:"🤖 IA",banking:"🏦 Banque",payment:"💳 Paiement",social:"📱 Social",email:"📧 Email",crypto:"₿ Crypto",hosting:"☁️ Hosting",productivity:"📋 Productivité",forbidden:"⚠️ Forbidden"};async function k(e){if(!(z.get("isAdmin")===!0)){e.innerHTML=`
      <div style="padding:40px;text-align:center;color:#999">
        <h2 style="color:#c9a227">Accès admin uniquement</h2>
        <p>Cette section est réservée à Kevin.</p>
      </div>
    `;return}x?.cleanup(),x=S("credentials-registry"),e.innerHTML=`
    <div style="padding:40px;text-align:center;color:var(--ax-text-dim)">
      <p>🔍 Audit credentials en cours...</p>
    </div>
  `;try{y=await w.runFullAudit()}catch(s){_.error("credentials-registry","audit failed",{err:s}),e.innerHTML=`<div style="padding:40px;color:#ff6b6b">Erreur audit : ${i(String(s))}</div>`;return}A(e,y)}function A(e,n){const s=n.security_score,t=s>=80?"#22cc77":s>=60?"#ffaa00":"#ff6b6b",l=[...m==="all"?n.entries:n.entries.filter(a=>a.category===m)].sort((a,d)=>a.configured!==d.configured?a.configured?-1:1:a.service_name.localeCompare(d.service_name)),o=new Map;o.set("all",n.entries.length);for(const a of n.entries)o.set(a.category,(o.get(a.category)??0)+1);const r=[...o.entries()].filter(([a])=>a==="all"||$[a]&&(o.get(a)??0)>0).map(([a,d])=>{const b=m===a,C=$[a]??a;return`<button data-cat="${i(a)}" class="ax-cat-chip" style="
        padding:8px 14px;border-radius:20px;border:1px solid ${b?"#c9a227":"rgba(255,255,255,0.15)"};
        background:${b?"rgba(201,162,39,0.15)":"rgba(255,255,255,0.03)"};
        color:${b?"#c9a227":"var(--ax-text-dim)"};
        cursor:pointer;font-size:13px;margin:4px;font-weight:${b?"600":"400"}
      ">${i(C)} (${d})</button>`}).join(""),u=n.recommendations.length===0?'<p style="color:#22cc77;margin:0">✅ Aucune recommandation — config saine</p>':n.recommendations.map(a=>`<li style="margin:8px 0;color:#ffaa00">${i(a)}</li>`).join(""),g=l.length===0?'<p style="color:var(--ax-text-dim);text-align:center;padding:24px">Aucun credential dans cette catégorie</p>':l.map(a=>T(a)).join("");e.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:960px;margin:0 auto">
      <header style="margin-bottom:24px">
        <h1 style="margin:0 0 8px;color:#c9a227">🔐 Coffre — Audit credentials</h1>
        <p style="color:var(--ax-text-dim);margin:0;font-size:13px">
          ${n.total_patterns} patterns reconnus · ${n.configured_count} configurés ·
          ${n.encrypted_count} chiffrés AES-GCM-256 · ${n.firebase_backup_count} backup Firebase
        </p>
      </header>

      <!-- Security Score Card -->
      <div style="background:linear-gradient(135deg,rgba(201,162,39,0.1),rgba(201,162,39,0.02));
                  border:1px solid rgba(201,162,39,0.3);border-radius:14px;padding:20px;margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div>
            <div style="font-size:13px;color:var(--ax-text-dim)">Score sécurité credentials</div>
            <div style="font-size:42px;font-weight:700;color:${t};line-height:1">
              ${s.toFixed(0)}<span style="font-size:20px;color:var(--ax-text-dim)">/100</span>
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button id="ax-cred-refresh" class="ax-btn ax-btn-outline" style="padding:8px 14px">🔄 Refresh audit</button>
            <button id="ax-cred-test-channels" class="ax-btn ax-btn-outline" style="padding:8px 14px">📡 Test alertes</button>
          </div>
        </div>
      </div>

      <!-- Recommandations -->
      <div style="background:rgba(255,170,0,0.05);border:1px solid rgba(255,170,0,0.2);
                  border-radius:12px;padding:16px;margin-bottom:20px">
        <h3 style="margin:0 0 12px;color:#ffaa00;font-size:15px">💡 Recommandations</h3>
        <ul style="margin:0;padding-left:18px;font-size:13px">${u}</ul>
      </div>

      <!-- Filtres catégorie -->
      <div style="margin-bottom:20px">
        <h3 style="margin:0 0 8px;color:var(--ax-text-dim);font-size:13px;text-transform:uppercase;letter-spacing:0.5px">
          Filtrer par catégorie
        </h3>
        <div style="display:flex;flex-wrap:wrap">${r}</div>
      </div>

      <!-- Liste credentials -->
      <div id="ax-cred-list">${g}</div>

      <p style="text-align:center;color:#666;font-size:11px;margin-top:24px">
        🔒 Coffre Apex v13 · AES-GCM-256 + PBKDF2 200k · Triple persistence (local+IDB+Firebase)
      </p>
    </div>
  `,L(e),_.info("credentials-registry",`rendered : ${n.configured_count}/${n.total_patterns} configured, score=${s}`)}function T(e){const n=h[e.status],s=[e.persisted.local?'<span title="localStorage" style="color:#22cc77">💾</span>':'<span title="pas en local" style="color:#666">·</span>',e.persisted.idb?'<span title="IndexedDB shadow" style="color:#22cc77">🗄️</span>':'<span title="pas en IDB" style="color:#666">·</span>',e.persisted.firebase?'<span title="Firebase backup" style="color:#22cc77">☁️</span>':'<span title="pas en Firebase" style="color:#666">·</span>'].join(" ");return`
    <article data-cred-detail="${i(e.storage_key)}" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);
                    border-radius:10px;padding:14px;margin-bottom:8px;cursor:pointer">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
        <div style="flex:1;min-width:200px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <strong style="color:#c9a227">${i(e.service_name)}</strong>
            <span style="font-size:11px;padding:2px 6px;border-radius:8px;background:rgba(255,255,255,0.05);color:var(--ax-text-dim)">
              ${i(e.category)}
            </span>
          </div>
          <code style="font-size:11px;color:var(--ax-text-dim);font-family:monospace">${i(e.storage_key)}</code>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span style="color:${n.color};font-size:13px">${n.icon} ${n.label}</span>
          ${e.encrypted?'<span style="color:#22cc77;font-size:11px" title="AES-GCM-256">🔒</span>':""}
          <span style="font-size:11px">${s}</span>
          <code style="font-family:monospace;font-size:11px;color:var(--ax-text-dim);background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:4px">${i(e.preview)}</code>
        </div>
      </div>
      ${e.status_detail?`<p style="margin:6px 0 0;color:#ff6b6b;font-size:11px">⚠️ ${i(e.status_detail)}</p>`:""}
      <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">
        ${e.status==="decrypt_failed"?`<button class="ax-btn ax-btn-sm" data-recover="${i(e.storage_key)}" data-service="${i(e.service_name)}" style="font-size:11px;padding:4px 10px;background:rgba(255,170,0,0.2);color:#ffaa00;border:1px solid rgba(255,170,0,0.4);font-weight:600">🔓 Récupérer cette clé</button>`:""}
        ${e.configured?`<button class="ax-btn ax-btn-sm" data-test="${i(e.storage_key)}" style="font-size:11px;padding:4px 10px">🧪 Tester</button>`:""}
        ${e.dashboard_url?`<a href="${i(e.dashboard_url)}" target="_blank" rel="noopener" class="ax-btn ax-btn-sm" style="font-size:11px;padding:4px 10px;text-decoration:none">🔗 Dashboard</a>`:""}
        ${e.billing_url?`<a href="${i(e.billing_url)}" target="_blank" rel="noopener" class="ax-btn ax-btn-sm" style="font-size:11px;padding:4px 10px;text-decoration:none">💰 Recharger</a>`:""}
      </div>
    </article>
  `}function R(e,n,s){const t=document.createElement("div");t.setAttribute("role","dialog"),t.setAttribute("aria-label",`Récupérer ${s}`),t.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px",t.innerHTML=`
    <div style="background:#1a1a2e;border:1px solid rgba(201,162,39,0.4);border-radius:14px;padding:24px;max-width:480px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.6)">
      <h3 style="margin:0 0 8px;color:#c9a227">🔓 Récupérer ${i(s)}</h3>
      <p style="color:var(--ax-text-dim);font-size:13px;margin:0 0 16px">
        Clé chiffrée présente mais illisible (passphrase a changé). Recolle ta clé pour qu'Apex la re-chiffre avec la passphrase courante.
      </p>
      <input type="password" id="ax-recover-input" aria-label="Coller la clé ${i(s)} à récupérer" autocomplete="off" placeholder="Recolle ta clé ${i(s)}…"
        style="width:100%;padding:12px;background:rgba(0,0,0,0.4);color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:8px;font-family:monospace;font-size:13px;box-sizing:border-box">
      <div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end">
        <button id="ax-recover-cancel" style="padding:8px 16px;background:rgba(255,255,255,0.05);color:var(--ax-text-dim);border:1px solid rgba(255,255,255,0.15);border-radius:8px;cursor:pointer;font-size:13px">Annuler</button>
        <button id="ax-recover-confirm" style="padding:8px 16px;background:rgba(34,204,119,0.2);color:#22cc77;border:1px solid rgba(34,204,119,0.4);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600">✅ Récupérer</button>
      </div>
    </div>
  `,document.body.appendChild(t);const c=t.querySelector("#ax-recover-input"),l=t.querySelector("#ax-recover-cancel"),o=t.querySelector("#ax-recover-confirm");setTimeout(()=>c?.focus(),50);const r=()=>{t.remove()};l?.addEventListener("click",r),t.addEventListener("click",u=>{u.target===t&&r()}),o?.addEventListener("click",()=>{(async()=>{const u=c?.value.trim()??"";if(!u){p.warn("Recolle ta clé pour récupérer");return}try{const{vault:g}=await v(async()=>{const{vault:d}=await import("./apex-kb-DMwkFL-5.js").then(b=>b.c);return{vault:d}},__vite__mapDeps([0,1,2]),import.meta.url),a=await g.recover(n,u);a.ok?(f.success(),p.success(`✅ ${s} récupérée + re-chiffrée`),r(),k(e)):(f.error(),p.error(`❌ ${a.reason??"recover failed"}`))}catch(g){p.error(`Erreur : ${String(g).slice(0,100)}`)}})()})}function L(e){if(!x)return;const n=e.querySelector("#ax-cred-refresh");n&&x.bind(n,"click",()=>{f.tap(),k(e)});const s=e.querySelector("#ax-cred-test-channels");s&&x.bind(s,"click",()=>{f.tap(),(async()=>{p.info("📡 Test alertes en cours...");const{kevinAlerts:t}=await v(async()=>{const{kevinAlerts:o}=await import("./kevin-alerts-DIxOp3fB.js");return{kevinAlerts:o}},__vite__mapDeps([0,1,2]),import.meta.url),c=await t.testAllChannels(),l=Object.entries(c).filter(([,o])=>o).map(([o])=>o);l.length===0?p.warn("Aucun channel d'alerte configuré"):p.success(`✅ Channels OK : ${l.join(", ")}`)})()}),e.querySelectorAll("[data-cat]").forEach(t=>{x.bind(t,"click",()=>{m=t.dataset.cat??"all",f.selection(),y&&A(e,y)})}),e.querySelectorAll("[data-recover]").forEach(t=>{x.bind(t,"click",()=>{const c=t.dataset.recover??"",l=t.dataset.service??c;c&&(f.tap(),R(e,c,l))})}),e.querySelectorAll("[data-test]").forEach(t=>{x.bind(t,"click",c=>{c.stopPropagation();const l=t.dataset.test;l&&(f.tap(),(async()=>{const o=t.textContent;t.textContent="⏳ Test...",t.disabled=!0;try{const r=await w.testCredential(l);r.valid===!0?p.success(`✅ ${l} : valide (${r.latency_ms}ms)`):r.valid===!1?p.warn(`❌ ${l} : invalide`):p.info(`❓ ${l} : ${r.error??"test impossible"}`)}catch(r){p.error(`Test failed : ${String(r).slice(0,100)}`)}finally{t.textContent=o??"🧪 Tester",t.disabled=!1}})())})}),e.querySelectorAll("[data-cred-detail]").forEach(t=>{x.bind(t,"click",c=>{c.target.closest("button, a")||(async()=>{const o=t.dataset.credDetail;if(!o||!y)return;const r=y.entries.find(d=>d.storage_key===o);if(!r)return;const{drillDown:u}=await v(async()=>{const{drillDown:d}=await import("./drilldown-1SlvGToi.js");return{drillDown:d}},[],import.meta.url),g="ax-drilldown-mount-credentials";let a=document.getElementById(g);a||(a=document.createElement("div"),a.id=g,document.body.appendChild(a)),u.open({id:`cred-${o}`,title:`🔑 ${r.service_name}`,content:()=>{const d=h[r.status]??h.unknown;return`
              <div style="padding:8px">
                <table style="width:100%;font-size:13px">
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Service</td><td>${i(r.service_name)}</td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Storage key</td><td><code>${i(r.storage_key)}</code></td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Catégorie</td><td>${i(r.category)}</td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Statut</td><td style="color:${d.color}">${d.icon} ${d.label}</td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Chiffré</td><td>${r.encrypted?"🔒 AES-GCM-256":"⚠️ Non chiffré"}</td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Configuré</td><td>${r.configured?"✅ Oui":"⚪ Non"}</td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Aperçu</td><td><code>${i(r.preview)}</code></td></tr>
                  ${r.dashboard_url?`<tr><td style="padding:4px;color:var(--ax-text-dim)">Dashboard</td><td><a href="${i(r.dashboard_url)}" target="_blank" rel="noopener" style="color:#c9a227">${i(r.dashboard_url)}</a></td></tr>`:""}
                  ${r.billing_url?`<tr><td style="padding:4px;color:var(--ax-text-dim)">Billing</td><td><a href="${i(r.billing_url)}" target="_blank" rel="noopener" style="color:#c9a227">${i(r.billing_url)}</a></td></tr>`:""}
                </table>
                ${r.status_detail?`<p style="margin:12px 0 0;color:#ff6b6b;font-size:12px">⚠️ ${i(r.status_detail)}</p>`:""}
              </div>
            `},data:{storageKey:o}},a)})()})})}export{P as dispose,k as render};
