const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-CnYepvtb.js","./monitoring-WiO5ZBU9.js","./apex-tools-registry-DPQHcZUW.js","./credential-patterns-DqicUg9o.js","./kevin-alerts-vIpg0F32.js"])))=>i.map(i=>d[i]);
import{_ as b}from"./apex-kb-CnYepvtb.js";import{l as $}from"./monitoring-WiO5ZBU9.js";import{c as R}from"./listener-cleanup-Y2rGGxxX.js";import{e as u}from"./html-safe-CCp1QaJu.js";import{s as I}from"../core/main-E_1osu25.js";import{h as v}from"./haptic-BUEqXK0N.js";import{toast as x}from"./toast-Dgg9rcIP.js";import"./apex-tools-registry-DPQHcZUW.js";import"./credential-patterns-DqicUg9o.js";import"./apex-tools-dispatch-B8X3j3uK.js";class L{async runFullAudit(){const{CREDENTIAL_PATTERNS:e}=await b(async()=>{const{CREDENTIAL_PATTERNS:a}=await import("./credential-patterns-DqicUg9o.js");return{CREDENTIAL_PATTERNS:a}},[],import.meta.url),{vault:l}=await b(async()=>{const{vault:a}=await import("./apex-kb-CnYepvtb.js").then(h=>h.b);return{vault:a}},__vite__mapDeps([0,1,2,3]),import.meta.url),t=[],o=new Set;for(const a of e){o.add(a.category);const h=await this.auditOne(a,l);t.push(h)}const s=t.filter(a=>a.configured),i=t.filter(a=>a.encrypted),p=t.filter(a=>a.persisted.firebase);let d=0;if(s.length>0){const a=i.length/s.length,h=p.length/s.length;d=Math.round((a*70+h*30)*100)/100}else d=100;const c=[],n=t.filter(a=>a.status==="decrypt_failed");if(n.length>0){const a=n.map(h=>h.service_name).slice(0,5).join(", ");c.push(`🚨 ${n.length} clé(s) ILLISIBLE(S) (decrypt failed) : ${a}. Clique "🔓 Récupérer" sur la fiche pour recoller.`)}const f=s.filter(a=>a.category==="ai");f.length===0?c.push("⚠️ Aucune clé IA configurée — Apex ne pourra pas répondre. Configure au moins ax_anthropic_key."):f.length<2&&c.push("💡 Une seule clé IA — pas de failover. Ajoute Groq/OpenAI/Gemini en backup.");const g=s.filter(a=>!a.encrypted);g.length>0&&c.push(`🔒 ${g.length} clé(s) NON chiffrée(s) en localStorage : ${g.slice(0,5).map(a=>a.storage_key).join(", ")}. Re-stocker via vault.setKey pour activer AES-GCM-256.`);const m=s.filter(a=>!a.persisted.firebase&&(a.category==="ai"||a.category==="payment"));m.length>0&&c.push(`☁️ ${m.length} clé(s) IA/payment SANS backup Firebase — risque perte si réinstallation PWA. Re-save via vault.setKey pour push backup.`);const _=s.some(a=>a.storage_key==="ax_telegram_token"),w=s.some(a=>a.storage_key==="ax_discord_webhook_url");return!_&&!w&&c.push("📡 Aucun channel d'alerte (Telegram ou Discord). Configure ax_telegram_token + ax_telegram_chat_id pour recevoir les alertes sentinelles."),{ts:Date.now(),total_patterns:e.length,configured_count:s.length,encrypted_count:i.length,firebase_backup_count:p.length,security_score:d,entries:t,categories_covered:[...o].sort(),recommendations:c}}async auditOne(e,l){const t=(()=>{try{return localStorage.getItem(e.storageKey)}catch{return null}})();let o="",s=!1;try{o=await l.readKey(e.storageKey),!o&&t&&t.startsWith("AXENC1:")&&(s=!0)}catch{t&&t.startsWith("AXENC1:")&&(s=!0)}const i=o.length>0,p=!!t&&t.startsWith("AXENC1:");let d=!1;try{const{FB_FIX:_}=await b(async()=>{const{FB_FIX:w}=await import("./apex-tools-dispatch-B8X3j3uK.js").then(a=>a.a);return{FB_FIX:w}},__vite__mapDeps([0,1,2,3]),import.meta.url);_.includes(e.storageKey)&&i&&(d=!0)}catch{}let c=!1;try{const{FB_FIX:_}=await b(async()=>{const{FB_FIX:w}=await import("./apex-tools-dispatch-B8X3j3uK.js").then(a=>a.a);return{FB_FIX:w}},__vite__mapDeps([0,1,2,3]),import.meta.url);c=_.includes(e.storageKey)&&i}catch{}const n=i?this.maskValue(o):"—";let f="unknown",g;s?(f="decrypt_failed",g="Clé chiffrée présente mais illisible (passphrase rotation ?). Recolle pour récupérer."):i?t&&!p&&t.length>4?(f="corrupted",g="Stocké en clair dans localStorage (re-save pour chiffrer)"):p&&i&&(f="ok"):f="missing";const m={service_name:e.name,storage_key:e.storageKey,category:e.category,configured:i,encrypted:p,persisted:{local:!!t,idb:d,firebase:c},preview:n,status:f};return e.dashboard&&(m.dashboard_url=e.dashboard),e.billing&&(m.billing_url=e.billing),g&&(m.status_detail=g),m}maskValue(e){return e?e.length<=8?"***":`${e.slice(0,4)}***${e.slice(-4)}`:"—"}async testCredential(e){const l=Date.now();try{const{CREDENTIAL_PATTERNS:t}=await b(async()=>{const{CREDENTIAL_PATTERNS:c}=await import("./credential-patterns-DqicUg9o.js");return{CREDENTIAL_PATTERNS:c}},[],import.meta.url),o=t.find(c=>c.storageKey===e);if(!o)return{storage_key:e,valid:null,error:"Pattern inconnu"};const s=o.testEndpoint;if(!s)return{storage_key:e,valid:null,error:"Pas d'endpoint test (manuel requis)"};const{vault:i}=await b(async()=>{const{vault:c}=await import("./apex-kb-CnYepvtb.js").then(n=>n.b);return{vault:c}},__vite__mapDeps([0,1,2,3]),import.meta.url),p=await i.readKey(e);if(!p)return{storage_key:e,valid:!1,error:"Non configuré"};const d={};o.name.toLowerCase().includes("anthropic")?(d["x-api-key"]=p,d["anthropic-version"]="2023-06-01"):o.name.toLowerCase().includes("google")?d["x-goog-api-key"]=p:d.authorization=`Bearer ${p}`;try{const c=await fetch(s,{method:"GET",headers:d,signal:AbortSignal.timeout(8e3)});return{storage_key:e,valid:c.ok,latency_ms:Date.now()-l}}catch(c){return{storage_key:e,valid:!1,latency_ms:Date.now()-l,error:String(c).slice(0,200)}}}catch(t){return $.warn("credentials-audit",`testCredential ${e} threw`,{err:t}),{storage_key:e,valid:null,error:String(t).slice(0,200)}}}}const S=new L;let y=null,A=null,k="all";function X(){y?.cleanup(),y=null}const z={ok:{color:"#22cc77",icon:"🟢",label:"OK"},missing:{color:"#888",icon:"⚪",label:"Non config"},corrupted:{color:"#ff6b6b",icon:"🔴",label:"Corrompu"},expired:{color:"#ffaa00",icon:"🟠",label:"Expiré"},unknown:{color:"#aaa",icon:"❓",label:"Inconnu"},decrypt_failed:{color:"#ff6b6b",icon:"🔒",label:"Illisible"}},C={all:"Tous",ai:"🤖 IA",banking:"🏦 Banque",payment:"💳 Paiement",social:"📱 Social",email:"📧 Email",crypto:"₿ Crypto",hosting:"☁️ Hosting",productivity:"📋 Productivité",forbidden:"⚠️ Forbidden"};async function E(r){if(!(I.get("isAdmin")===!0)){r.innerHTML=`
      <div style="padding:40px;text-align:center;color:#999">
        <h2 style="color:#c9a227">Accès admin uniquement</h2>
        <p>Cette section est réservée à Kevin.</p>
      </div>
    `;return}y?.cleanup(),y=R("credentials-registry"),r.innerHTML=`
    <div style="padding:40px;text-align:center;color:var(--ax-text-dim)">
      <p>🔍 Audit credentials en cours...</p>
    </div>
  `;try{A=await S.runFullAudit()}catch(l){$.error("credentials-registry","audit failed",{err:l}),r.innerHTML=`<div style="padding:40px;color:#ff6b6b">Erreur audit : ${u(String(l))}</div>`;return}T(r,A)}function T(r,e){const l=e.security_score,t=l>=80?"#22cc77":l>=60?"#ffaa00":"#ff6b6b",s=[...k==="all"?e.entries:e.entries.filter(n=>n.category===k)].sort((n,f)=>n.configured!==f.configured?n.configured?-1:1:n.service_name.localeCompare(f.service_name)),i=new Map;i.set("all",e.entries.length);for(const n of e.entries)i.set(n.category,(i.get(n.category)??0)+1);const p=[...i.entries()].filter(([n])=>n==="all"||C[n]&&(i.get(n)??0)>0).map(([n,f])=>{const g=k===n,m=C[n]??n;return`<button data-cat="${u(n)}" class="ax-cat-chip" style="
        padding:8px 14px;border-radius:20px;border:1px solid ${g?"#c9a227":"rgba(255,255,255,0.15)"};
        background:${g?"rgba(201,162,39,0.15)":"rgba(255,255,255,0.03)"};
        color:${g?"#c9a227":"var(--ax-text-dim)"};
        cursor:pointer;font-size:13px;margin:4px;font-weight:${g?"600":"400"}
      ">${u(m)} (${f})</button>`}).join(""),d=e.recommendations.length===0?'<p style="color:#22cc77;margin:0">✅ Aucune recommandation — config saine</p>':e.recommendations.map(n=>`<li style="margin:8px 0;color:#ffaa00">${u(n)}</li>`).join(""),c=s.length===0?'<p style="color:var(--ax-text-dim);text-align:center;padding:24px">Aucun credential dans cette catégorie</p>':s.map(n=>F(n)).join("");r.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:960px;margin:0 auto">
      <header style="margin-bottom:24px">
        <h1 style="margin:0 0 8px;color:#c9a227">🔐 Coffre — Audit credentials</h1>
        <p style="color:var(--ax-text-dim);margin:0;font-size:13px">
          ${e.total_patterns} patterns reconnus · ${e.configured_count} configurés ·
          ${e.encrypted_count} chiffrés AES-GCM-256 · ${e.firebase_backup_count} backup Firebase
        </p>
      </header>

      <!-- Security Score Card -->
      <div style="background:linear-gradient(135deg,rgba(201,162,39,0.1),rgba(201,162,39,0.02));
                  border:1px solid rgba(201,162,39,0.3);border-radius:14px;padding:20px;margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div>
            <div style="font-size:13px;color:var(--ax-text-dim)">Score sécurité credentials</div>
            <div style="font-size:42px;font-weight:700;color:${t};line-height:1">
              ${l.toFixed(0)}<span style="font-size:20px;color:var(--ax-text-dim)">/100</span>
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
        <ul style="margin:0;padding-left:18px;font-size:13px">${d}</ul>
      </div>

      <!-- Filtres catégorie -->
      <div style="margin-bottom:20px">
        <h3 style="margin:0 0 8px;color:var(--ax-text-dim);font-size:13px;text-transform:uppercase;letter-spacing:0.5px">
          Filtrer par catégorie
        </h3>
        <div style="display:flex;flex-wrap:wrap">${p}</div>
      </div>

      <!-- Liste credentials -->
      <div id="ax-cred-list">${c}</div>

      <p style="text-align:center;color:#666;font-size:11px;margin-top:24px">
        🔒 Coffre Apex v13 · AES-GCM-256 + PBKDF2 200k · Triple persistence (local+IDB+Firebase)
      </p>
    </div>
  `,P(r),$.info("credentials-registry",`rendered : ${e.configured_count}/${e.total_patterns} configured, score=${l}`)}function F(r){const e=z[r.status],l=[r.persisted.local?'<span title="localStorage" style="color:#22cc77">💾</span>':'<span title="pas en local" style="color:#666">·</span>',r.persisted.idb?'<span title="IndexedDB shadow" style="color:#22cc77">🗄️</span>':'<span title="pas en IDB" style="color:#666">·</span>',r.persisted.firebase?'<span title="Firebase backup" style="color:#22cc77">☁️</span>':'<span title="pas en Firebase" style="color:#666">·</span>'].join(" ");return`
    <article style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);
                    border-radius:10px;padding:14px;margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
        <div style="flex:1;min-width:200px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <strong style="color:#c9a227">${u(r.service_name)}</strong>
            <span style="font-size:11px;padding:2px 6px;border-radius:8px;background:rgba(255,255,255,0.05);color:var(--ax-text-dim)">
              ${u(r.category)}
            </span>
          </div>
          <code style="font-size:11px;color:var(--ax-text-dim);font-family:monospace">${u(r.storage_key)}</code>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span style="color:${e.color};font-size:13px">${e.icon} ${e.label}</span>
          ${r.encrypted?'<span style="color:#22cc77;font-size:11px" title="AES-GCM-256">🔒</span>':""}
          <span style="font-size:11px">${l}</span>
          <code style="font-family:monospace;font-size:11px;color:var(--ax-text-dim);background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:4px">${u(r.preview)}</code>
        </div>
      </div>
      ${r.status_detail?`<p style="margin:6px 0 0;color:#ff6b6b;font-size:11px">⚠️ ${u(r.status_detail)}</p>`:""}
      <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">
        ${r.status==="decrypt_failed"?`<button class="ax-btn ax-btn-sm" data-recover="${u(r.storage_key)}" data-service="${u(r.service_name)}" style="font-size:11px;padding:4px 10px;background:rgba(255,170,0,0.2);color:#ffaa00;border:1px solid rgba(255,170,0,0.4);font-weight:600">🔓 Récupérer cette clé</button>`:""}
        ${r.configured?`<button class="ax-btn ax-btn-sm" data-test="${u(r.storage_key)}" style="font-size:11px;padding:4px 10px">🧪 Tester</button>`:""}
        ${r.dashboard_url?`<a href="${u(r.dashboard_url)}" target="_blank" rel="noopener" class="ax-btn ax-btn-sm" style="font-size:11px;padding:4px 10px;text-decoration:none">🔗 Dashboard</a>`:""}
        ${r.billing_url?`<a href="${u(r.billing_url)}" target="_blank" rel="noopener" class="ax-btn ax-btn-sm" style="font-size:11px;padding:4px 10px;text-decoration:none">💰 Recharger</a>`:""}
      </div>
    </article>
  `}function D(r,e,l){const t=document.createElement("div");t.setAttribute("role","dialog"),t.setAttribute("aria-label",`Récupérer ${l}`),t.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px",t.innerHTML=`
    <div style="background:#1a1a2e;border:1px solid rgba(201,162,39,0.4);border-radius:14px;padding:24px;max-width:480px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.6)">
      <h3 style="margin:0 0 8px;color:#c9a227">🔓 Récupérer ${u(l)}</h3>
      <p style="color:var(--ax-text-dim);font-size:13px;margin:0 0 16px">
        Clé chiffrée présente mais illisible (passphrase a changé). Recolle ta clé pour qu'Apex la re-chiffre avec la passphrase courante.
      </p>
      <input type="password" id="ax-recover-input" autocomplete="off" placeholder="Recolle ta clé ${u(l)}…"
        style="width:100%;padding:12px;background:rgba(0,0,0,0.4);color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:8px;font-family:monospace;font-size:13px;box-sizing:border-box">
      <div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end">
        <button id="ax-recover-cancel" style="padding:8px 16px;background:rgba(255,255,255,0.05);color:var(--ax-text-dim);border:1px solid rgba(255,255,255,0.15);border-radius:8px;cursor:pointer;font-size:13px">Annuler</button>
        <button id="ax-recover-confirm" style="padding:8px 16px;background:rgba(34,204,119,0.2);color:#22cc77;border:1px solid rgba(34,204,119,0.4);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600">✅ Récupérer</button>
      </div>
    </div>
  `,document.body.appendChild(t);const o=t.querySelector("#ax-recover-input"),s=t.querySelector("#ax-recover-cancel"),i=t.querySelector("#ax-recover-confirm");setTimeout(()=>o?.focus(),50);const p=()=>{t.remove()};s?.addEventListener("click",p),t.addEventListener("click",d=>{d.target===t&&p()}),i?.addEventListener("click",()=>{(async()=>{const d=o?.value.trim()??"";if(!d){x.warn("Recolle ta clé pour récupérer");return}try{const{vault:c}=await b(async()=>{const{vault:f}=await import("./apex-kb-CnYepvtb.js").then(g=>g.b);return{vault:f}},__vite__mapDeps([0,1,2,3]),import.meta.url),n=await c.recover(e,d);n.ok?(v.success(),x.success(`✅ ${l} récupérée + re-chiffrée`),p(),E(r)):(v.error(),x.error(`❌ ${n.reason??"recover failed"}`))}catch(c){x.error(`Erreur : ${String(c).slice(0,100)}`)}})()})}function P(r){if(!y)return;const e=r.querySelector("#ax-cred-refresh");e&&y.bind(e,"click",()=>{v.tap(),E(r)});const l=r.querySelector("#ax-cred-test-channels");l&&y.bind(l,"click",()=>{v.tap(),(async()=>{x.info("📡 Test alertes en cours...");const{kevinAlerts:t}=await b(async()=>{const{kevinAlerts:i}=await import("./kevin-alerts-vIpg0F32.js");return{kevinAlerts:i}},__vite__mapDeps([4,0,1,2,3]),import.meta.url),o=await t.testAllChannels(),s=Object.entries(o).filter(([,i])=>i).map(([i])=>i);s.length===0?x.warn("Aucun channel d'alerte configuré"):x.success(`✅ Channels OK : ${s.join(", ")}`)})()}),r.querySelectorAll("[data-cat]").forEach(t=>{y.bind(t,"click",()=>{k=t.dataset.cat??"all",v.selection(),A&&T(r,A)})}),r.querySelectorAll("[data-recover]").forEach(t=>{y.bind(t,"click",()=>{const o=t.dataset.recover??"",s=t.dataset.service??o;o&&(v.tap(),D(r,o,s))})}),r.querySelectorAll("[data-test]").forEach(t=>{y.bind(t,"click",()=>{const o=t.dataset.test;o&&(v.tap(),(async()=>{const s=t.textContent;t.textContent="⏳ Test...",t.disabled=!0;try{const i=await S.testCredential(o);i.valid===!0?x.success(`✅ ${o} : valide (${i.latency_ms}ms)`):i.valid===!1?x.warn(`❌ ${o} : invalide`):x.info(`❓ ${o} : ${i.error??"test impossible"}`)}catch(i){x.error(`Test failed : ${String(i).slice(0,100)}`)}finally{t.textContent=s??"🧪 Tester",t.disabled=!1}})())})})}export{X as dispose,E as render};
//# sourceMappingURL=index-BfHC-S-z.js.map
