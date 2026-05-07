const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./kevin-alerts-baYPU6pZ.js"])))=>i.map(i=>d[i]);
import{_ as h}from"./apex-kb-DomhgFBa.js";import{l as $}from"./monitoring-WiO5ZBU9.js";import{c as z}from"./listener-cleanup-Y2rGGxxX.js";import{e as o}from"./html-safe-CCp1QaJu.js";import{s as C}from"../core/main-DOKG8ulS.js";import{credentialsAudit as _}from"./credentials-audit-CMryNS9A.js";import{h as p}from"./haptic-BUEqXK0N.js";import{toast as l}from"./toast-Dgg9rcIP.js";import"./apex-tools-registry-_6Box58P.js";import"./credential-patterns-DqicUg9o.js";import"./apex-tools-dispatch-_ua2kPkb.js";let d=null,y=null,m="all";function K(){d?.cleanup(),d=null}const S={ok:{color:"#22cc77",icon:"🟢",label:"OK"},missing:{color:"#888",icon:"⚪",label:"Non config"},corrupted:{color:"#ff6b6b",icon:"🔴",label:"Corrompu"},expired:{color:"#ffaa00",icon:"🟠",label:"Expiré"},unknown:{color:"#aaa",icon:"❓",label:"Inconnu"},decrypt_failed:{color:"#ff6b6b",icon:"🔒",label:"Illisible"}},v={all:"Tous",ai:"🤖 IA",banking:"🏦 Banque",payment:"💳 Paiement",social:"📱 Social",email:"📧 Email",crypto:"₿ Crypto",hosting:"☁️ Hosting",productivity:"📋 Productivité",forbidden:"⚠️ Forbidden"};async function w(e){if(!(C.get("isAdmin")===!0)){e.innerHTML=`
      <div style="padding:40px;text-align:center;color:#999">
        <h2 style="color:#c9a227">Accès admin uniquement</h2>
        <p>Cette section est réservée à Kevin.</p>
      </div>
    `;return}d?.cleanup(),d=z("credentials-registry"),e.innerHTML=`
    <div style="padding:40px;text-align:center;color:var(--ax-text-dim)">
      <p>🔍 Audit credentials en cours...</p>
    </div>
  `;try{y=await _.runFullAudit()}catch(n){$.error("credentials-registry","audit failed",{err:n}),e.innerHTML=`<div style="padding:40px;color:#ff6b6b">Erreur audit : ${o(String(n))}</div>`;return}k(e,y)}function k(e,a){const n=a.security_score,t=n>=80?"#22cc77":n>=60?"#ffaa00":"#ff6b6b",c=[...m==="all"?a.entries:a.entries.filter(r=>r.category===m)].sort((r,u)=>r.configured!==u.configured?r.configured?-1:1:r.service_name.localeCompare(u.service_name)),i=new Map;i.set("all",a.entries.length);for(const r of a.entries)i.set(r.category,(i.get(r.category)??0)+1);const g=[...i.entries()].filter(([r])=>r==="all"||v[r]&&(i.get(r)??0)>0).map(([r,u])=>{const f=m===r,A=v[r]??r;return`<button data-cat="${o(r)}" class="ax-cat-chip" style="
        padding:8px 14px;border-radius:20px;border:1px solid ${f?"#c9a227":"rgba(255,255,255,0.15)"};
        background:${f?"rgba(201,162,39,0.15)":"rgba(255,255,255,0.03)"};
        color:${f?"#c9a227":"var(--ax-text-dim)"};
        cursor:pointer;font-size:13px;margin:4px;font-weight:${f?"600":"400"}
      ">${o(A)} (${u})</button>`}).join(""),x=a.recommendations.length===0?'<p style="color:#22cc77;margin:0">✅ Aucune recommandation — config saine</p>':a.recommendations.map(r=>`<li style="margin:8px 0;color:#ffaa00">${o(r)}</li>`).join(""),b=c.length===0?'<p style="color:var(--ax-text-dim);text-align:center;padding:24px">Aucun credential dans cette catégorie</p>':c.map(r=>T(r)).join("");e.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:960px;margin:0 auto">
      <header style="margin-bottom:24px">
        <h1 style="margin:0 0 8px;color:#c9a227">🔐 Coffre — Audit credentials</h1>
        <p style="color:var(--ax-text-dim);margin:0;font-size:13px">
          ${a.total_patterns} patterns reconnus · ${a.configured_count} configurés ·
          ${a.encrypted_count} chiffrés AES-GCM-256 · ${a.firebase_backup_count} backup Firebase
        </p>
      </header>

      <!-- Security Score Card -->
      <div style="background:linear-gradient(135deg,rgba(201,162,39,0.1),rgba(201,162,39,0.02));
                  border:1px solid rgba(201,162,39,0.3);border-radius:14px;padding:20px;margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div>
            <div style="font-size:13px;color:var(--ax-text-dim)">Score sécurité credentials</div>
            <div style="font-size:42px;font-weight:700;color:${t};line-height:1">
              ${n.toFixed(0)}<span style="font-size:20px;color:var(--ax-text-dim)">/100</span>
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
        <ul style="margin:0;padding-left:18px;font-size:13px">${x}</ul>
      </div>

      <!-- Filtres catégorie -->
      <div style="margin-bottom:20px">
        <h3 style="margin:0 0 8px;color:var(--ax-text-dim);font-size:13px;text-transform:uppercase;letter-spacing:0.5px">
          Filtrer par catégorie
        </h3>
        <div style="display:flex;flex-wrap:wrap">${g}</div>
      </div>

      <!-- Liste credentials -->
      <div id="ax-cred-list">${b}</div>

      <p style="text-align:center;color:#666;font-size:11px;margin-top:24px">
        🔒 Coffre Apex v13 · AES-GCM-256 + PBKDF2 200k · Triple persistence (local+IDB+Firebase)
      </p>
    </div>
  `,L(e),$.info("credentials-registry",`rendered : ${a.configured_count}/${a.total_patterns} configured, score=${n}`)}function T(e){const a=S[e.status],n=[e.persisted.local?'<span title="localStorage" style="color:#22cc77">💾</span>':'<span title="pas en local" style="color:#666">·</span>',e.persisted.idb?'<span title="IndexedDB shadow" style="color:#22cc77">🗄️</span>':'<span title="pas en IDB" style="color:#666">·</span>',e.persisted.firebase?'<span title="Firebase backup" style="color:#22cc77">☁️</span>':'<span title="pas en Firebase" style="color:#666">·</span>'].join(" ");return`
    <article style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);
                    border-radius:10px;padding:14px;margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
        <div style="flex:1;min-width:200px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <strong style="color:#c9a227">${o(e.service_name)}</strong>
            <span style="font-size:11px;padding:2px 6px;border-radius:8px;background:rgba(255,255,255,0.05);color:var(--ax-text-dim)">
              ${o(e.category)}
            </span>
          </div>
          <code style="font-size:11px;color:var(--ax-text-dim);font-family:monospace">${o(e.storage_key)}</code>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span style="color:${a.color};font-size:13px">${a.icon} ${a.label}</span>
          ${e.encrypted?'<span style="color:#22cc77;font-size:11px" title="AES-GCM-256">🔒</span>':""}
          <span style="font-size:11px">${n}</span>
          <code style="font-family:monospace;font-size:11px;color:var(--ax-text-dim);background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:4px">${o(e.preview)}</code>
        </div>
      </div>
      ${e.status_detail?`<p style="margin:6px 0 0;color:#ff6b6b;font-size:11px">⚠️ ${o(e.status_detail)}</p>`:""}
      <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">
        ${e.status==="decrypt_failed"?`<button class="ax-btn ax-btn-sm" data-recover="${o(e.storage_key)}" data-service="${o(e.service_name)}" style="font-size:11px;padding:4px 10px;background:rgba(255,170,0,0.2);color:#ffaa00;border:1px solid rgba(255,170,0,0.4);font-weight:600">🔓 Récupérer cette clé</button>`:""}
        ${e.configured?`<button class="ax-btn ax-btn-sm" data-test="${o(e.storage_key)}" style="font-size:11px;padding:4px 10px">🧪 Tester</button>`:""}
        ${e.dashboard_url?`<a href="${o(e.dashboard_url)}" target="_blank" rel="noopener" class="ax-btn ax-btn-sm" style="font-size:11px;padding:4px 10px;text-decoration:none">🔗 Dashboard</a>`:""}
        ${e.billing_url?`<a href="${o(e.billing_url)}" target="_blank" rel="noopener" class="ax-btn ax-btn-sm" style="font-size:11px;padding:4px 10px;text-decoration:none">💰 Recharger</a>`:""}
      </div>
    </article>
  `}function R(e,a,n){const t=document.createElement("div");t.setAttribute("role","dialog"),t.setAttribute("aria-label",`Récupérer ${n}`),t.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px",t.innerHTML=`
    <div style="background:#1a1a2e;border:1px solid rgba(201,162,39,0.4);border-radius:14px;padding:24px;max-width:480px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.6)">
      <h3 style="margin:0 0 8px;color:#c9a227">🔓 Récupérer ${o(n)}</h3>
      <p style="color:var(--ax-text-dim);font-size:13px;margin:0 0 16px">
        Clé chiffrée présente mais illisible (passphrase a changé). Recolle ta clé pour qu'Apex la re-chiffre avec la passphrase courante.
      </p>
      <input type="password" id="ax-recover-input" autocomplete="off" placeholder="Recolle ta clé ${o(n)}…"
        style="width:100%;padding:12px;background:rgba(0,0,0,0.4);color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:8px;font-family:monospace;font-size:13px;box-sizing:border-box">
      <div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end">
        <button id="ax-recover-cancel" style="padding:8px 16px;background:rgba(255,255,255,0.05);color:var(--ax-text-dim);border:1px solid rgba(255,255,255,0.15);border-radius:8px;cursor:pointer;font-size:13px">Annuler</button>
        <button id="ax-recover-confirm" style="padding:8px 16px;background:rgba(34,204,119,0.2);color:#22cc77;border:1px solid rgba(34,204,119,0.4);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600">✅ Récupérer</button>
      </div>
    </div>
  `,document.body.appendChild(t);const s=t.querySelector("#ax-recover-input"),c=t.querySelector("#ax-recover-cancel"),i=t.querySelector("#ax-recover-confirm");setTimeout(()=>s?.focus(),50);const g=()=>{t.remove()};c?.addEventListener("click",g),t.addEventListener("click",x=>{x.target===t&&g()}),i?.addEventListener("click",()=>{(async()=>{const x=s?.value.trim()??"";if(!x){l.warn("Recolle ta clé pour récupérer");return}try{const{vault:b}=await h(async()=>{const{vault:u}=await import("./apex-kb-DomhgFBa.js").then(f=>f.b);return{vault:u}},[],import.meta.url),r=await b.recover(a,x);r.ok?(p.success(),l.success(`✅ ${n} récupérée + re-chiffrée`),g(),w(e)):(p.error(),l.error(`❌ ${r.reason??"recover failed"}`))}catch(b){l.error(`Erreur : ${String(b).slice(0,100)}`)}})()})}function L(e){if(!d)return;const a=e.querySelector("#ax-cred-refresh");a&&d.bind(a,"click",()=>{p.tap(),w(e)});const n=e.querySelector("#ax-cred-test-channels");n&&d.bind(n,"click",()=>{p.tap(),(async()=>{l.info("📡 Test alertes en cours...");const{kevinAlerts:t}=await h(async()=>{const{kevinAlerts:i}=await import("./kevin-alerts-baYPU6pZ.js");return{kevinAlerts:i}},__vite__mapDeps([0]),import.meta.url),s=await t.testAllChannels(),c=Object.entries(s).filter(([,i])=>i).map(([i])=>i);c.length===0?l.warn("Aucun channel d'alerte configuré"):l.success(`✅ Channels OK : ${c.join(", ")}`)})()}),e.querySelectorAll("[data-cat]").forEach(t=>{d.bind(t,"click",()=>{m=t.dataset.cat??"all",p.selection(),y&&k(e,y)})}),e.querySelectorAll("[data-recover]").forEach(t=>{d.bind(t,"click",()=>{const s=t.dataset.recover??"",c=t.dataset.service??s;s&&(p.tap(),R(e,s,c))})}),e.querySelectorAll("[data-test]").forEach(t=>{d.bind(t,"click",()=>{const s=t.dataset.test;s&&(p.tap(),(async()=>{const c=t.textContent;t.textContent="⏳ Test...",t.disabled=!0;try{const i=await _.testCredential(s);i.valid===!0?l.success(`✅ ${s} : valide (${i.latency_ms}ms)`):i.valid===!1?l.warn(`❌ ${s} : invalide`):l.info(`❓ ${s} : ${i.error??"test impossible"}`)}catch(i){l.error(`Test failed : ${String(i).slice(0,100)}`)}finally{t.textContent=c??"🧪 Tester",t.disabled=!1}})())})})}export{K as dispose,w as render};
