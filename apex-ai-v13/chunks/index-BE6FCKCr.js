const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-BXdN88WA.js","./monitoring-B17vNBOa.js","./apex-tools-registry-DloDnFZi.js","./credential-patterns-BybElwOv.js","./kevin-alerts-DQPH-Oza.js"])))=>i.map(i=>d[i]);
import{_ as b}from"./apex-kb-BXdN88WA.js";import{l as k}from"./monitoring-B17vNBOa.js";import{c as T}from"./listener-cleanup-Y2rGGxxX.js";import{e as f}from"./html-safe-CCp1QaJu.js";import{s as E}from"../core/main-CXG1yTr8.js";import{h as v}from"./haptic-BUEqXK0N.js";import{toast as y}from"./toast-Dgg9rcIP.js";import"./apex-tools-registry-DloDnFZi.js";import"./credential-patterns-BybElwOv.js";import"./apex-tools-dispatch-b81e0eyw.js";class R{async runFullAudit(){const{CREDENTIAL_PATTERNS:e}=await b(async()=>{const{CREDENTIAL_PATTERNS:a}=await import("./credential-patterns-BybElwOv.js");return{CREDENTIAL_PATTERNS:a}},[],import.meta.url),{vault:c}=await b(async()=>{const{vault:a}=await import("./apex-kb-BXdN88WA.js").then(_=>_.b);return{vault:a}},__vite__mapDeps([0,1,2,3]),import.meta.url),r=[],o=new Set;for(const a of e){o.add(a.category);const _=await this.auditOne(a,c);r.push(_)}const i=r.filter(a=>a.configured),s=r.filter(a=>a.encrypted),p=r.filter(a=>a.persisted.firebase);let d=0;if(i.length>0){const a=s.length/i.length,_=p.length/i.length;d=Math.round((a*70+_*30)*100)/100}else d=100;const l=[],n=i.filter(a=>a.category==="ai");n.length===0?l.push("⚠️ Aucune clé IA configurée — Apex ne pourra pas répondre. Configure au moins ax_anthropic_key."):n.length<2&&l.push("💡 Une seule clé IA — pas de failover. Ajoute Groq/OpenAI/Gemini en backup.");const u=i.filter(a=>!a.encrypted);u.length>0&&l.push(`🔒 ${u.length} clé(s) NON chiffrée(s) en localStorage : ${u.slice(0,5).map(a=>a.storage_key).join(", ")}. Re-stocker via vault.setKey pour activer AES-GCM-256.`);const g=i.filter(a=>!a.persisted.firebase&&(a.category==="ai"||a.category==="payment"));g.length>0&&l.push(`☁️ ${g.length} clé(s) IA/payment SANS backup Firebase — risque perte si réinstallation PWA. Re-save via vault.setKey pour push backup.`);const m=i.some(a=>a.storage_key==="ax_telegram_token"),h=i.some(a=>a.storage_key==="ax_discord_webhook_url");return!m&&!h&&l.push("📡 Aucun channel d'alerte (Telegram ou Discord). Configure ax_telegram_token + ax_telegram_chat_id pour recevoir les alertes sentinelles."),{ts:Date.now(),total_patterns:e.length,configured_count:i.length,encrypted_count:s.length,firebase_backup_count:p.length,security_score:d,entries:r,categories_covered:[...o].sort(),recommendations:l}}async auditOne(e,c){const r=(()=>{try{return localStorage.getItem(e.storageKey)}catch{return null}})();let o="";try{o=await c.readKey(e.storageKey)}catch{}const i=o.length>0,s=!!r&&r.startsWith("AXENC1:");let p=!1;try{const{FB_FIX:m}=await b(async()=>{const{FB_FIX:h}=await import("./apex-tools-dispatch-b81e0eyw.js").then(a=>a.a);return{FB_FIX:h}},__vite__mapDeps([0,1,2,3]),import.meta.url);m.includes(e.storageKey)&&i&&(p=!0)}catch{}let d=!1;try{const{FB_FIX:m}=await b(async()=>{const{FB_FIX:h}=await import("./apex-tools-dispatch-b81e0eyw.js").then(a=>a.a);return{FB_FIX:h}},__vite__mapDeps([0,1,2,3]),import.meta.url);d=m.includes(e.storageKey)&&i}catch{}const l=i?this.maskValue(o):"—";let n="unknown",u;i?r&&!s&&r.length>4?(n="corrupted",u="Stocké en clair dans localStorage (re-save pour chiffrer)"):s&&i&&(n="ok"):n="missing";const g={service_name:e.name,storage_key:e.storageKey,category:e.category,configured:i,encrypted:s,persisted:{local:!!r,idb:p,firebase:d},preview:l,status:n};return e.dashboard&&(g.dashboard_url=e.dashboard),e.billing&&(g.billing_url=e.billing),u&&(g.status_detail=u),g}maskValue(e){return e?e.length<=8?"***":`${e.slice(0,4)}***${e.slice(-4)}`:"—"}async testCredential(e){const c=Date.now();try{const{CREDENTIAL_PATTERNS:r}=await b(async()=>{const{CREDENTIAL_PATTERNS:l}=await import("./credential-patterns-BybElwOv.js");return{CREDENTIAL_PATTERNS:l}},[],import.meta.url),o=r.find(l=>l.storageKey===e);if(!o)return{storage_key:e,valid:null,error:"Pattern inconnu"};const i=o.testEndpoint;if(!i)return{storage_key:e,valid:null,error:"Pas d'endpoint test (manuel requis)"};const{vault:s}=await b(async()=>{const{vault:l}=await import("./apex-kb-BXdN88WA.js").then(n=>n.b);return{vault:l}},__vite__mapDeps([0,1,2,3]),import.meta.url),p=await s.readKey(e);if(!p)return{storage_key:e,valid:!1,error:"Non configuré"};const d={};o.name.toLowerCase().includes("anthropic")?(d["x-api-key"]=p,d["anthropic-version"]="2023-06-01"):o.name.toLowerCase().includes("google")?d["x-goog-api-key"]=p:d.authorization=`Bearer ${p}`;try{const l=await fetch(i,{method:"GET",headers:d,signal:AbortSignal.timeout(8e3)});return{storage_key:e,valid:l.ok,latency_ms:Date.now()-c}}catch(l){return{storage_key:e,valid:!1,latency_ms:Date.now()-c,error:String(l).slice(0,200)}}}catch(r){return k.warn("credentials-audit",`testCredential ${e} threw`,{err:r}),{storage_key:e,valid:null,error:String(r).slice(0,200)}}}}const C=new R;let x=null,A=null,w="all";function H(){x?.cleanup(),x=null}const I={ok:{color:"#22cc77",icon:"🟢",label:"OK"},missing:{color:"#888",icon:"⚪",label:"Non config"},corrupted:{color:"#ff6b6b",icon:"🔴",label:"Corrompu"},expired:{color:"#ffaa00",icon:"🟠",label:"Expiré"},unknown:{color:"#aaa",icon:"❓",label:"Inconnu"}},$={all:"Tous",ai:"🤖 IA",banking:"🏦 Banque",payment:"💳 Paiement",social:"📱 Social",email:"📧 Email",crypto:"₿ Crypto",hosting:"☁️ Hosting",productivity:"📋 Productivité",forbidden:"⚠️ Forbidden"};async function D(t){if(!(E.get("isAdmin")===!0)){t.innerHTML=`
      <div style="padding:40px;text-align:center;color:#999">
        <h2 style="color:#c9a227">Accès admin uniquement</h2>
        <p>Cette section est réservée à Kevin.</p>
      </div>
    `;return}x?.cleanup(),x=T("credentials-registry"),t.innerHTML=`
    <div style="padding:40px;text-align:center;color:var(--ax-text-dim)">
      <p>🔍 Audit credentials en cours...</p>
    </div>
  `;try{A=await C.runFullAudit()}catch(c){k.error("credentials-registry","audit failed",{err:c}),t.innerHTML=`<div style="padding:40px;color:#ff6b6b">Erreur audit : ${f(String(c))}</div>`;return}S(t,A)}function S(t,e){const c=e.security_score,r=c>=80?"#22cc77":c>=60?"#ffaa00":"#ff6b6b",i=[...w==="all"?e.entries:e.entries.filter(n=>n.category===w)].sort((n,u)=>n.configured!==u.configured?n.configured?-1:1:n.service_name.localeCompare(u.service_name)),s=new Map;s.set("all",e.entries.length);for(const n of e.entries)s.set(n.category,(s.get(n.category)??0)+1);const p=[...s.entries()].filter(([n])=>n==="all"||$[n]&&(s.get(n)??0)>0).map(([n,u])=>{const g=w===n,m=$[n]??n;return`<button data-cat="${f(n)}" class="ax-cat-chip" style="
        padding:8px 14px;border-radius:20px;border:1px solid ${g?"#c9a227":"rgba(255,255,255,0.15)"};
        background:${g?"rgba(201,162,39,0.15)":"rgba(255,255,255,0.03)"};
        color:${g?"#c9a227":"var(--ax-text-dim)"};
        cursor:pointer;font-size:13px;margin:4px;font-weight:${g?"600":"400"}
      ">${f(m)} (${u})</button>`}).join(""),d=e.recommendations.length===0?'<p style="color:#22cc77;margin:0">✅ Aucune recommandation — config saine</p>':e.recommendations.map(n=>`<li style="margin:8px 0;color:#ffaa00">${f(n)}</li>`).join(""),l=i.length===0?'<p style="color:var(--ax-text-dim);text-align:center;padding:24px">Aucun credential dans cette catégorie</p>':i.map(n=>F(n)).join("");t.innerHTML=`
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
            <div style="font-size:42px;font-weight:700;color:${r};line-height:1">
              ${c.toFixed(0)}<span style="font-size:20px;color:var(--ax-text-dim)">/100</span>
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
      <div id="ax-cred-list">${l}</div>

      <p style="text-align:center;color:#666;font-size:11px;margin-top:24px">
        🔒 Coffre Apex v13 · AES-GCM-256 + PBKDF2 200k · Triple persistence (local+IDB+Firebase)
      </p>
    </div>
  `,L(t),k.info("credentials-registry",`rendered : ${e.configured_count}/${e.total_patterns} configured, score=${c}`)}function F(t){const e=I[t.status],c=[t.persisted.local?'<span title="localStorage" style="color:#22cc77">💾</span>':'<span title="pas en local" style="color:#666">·</span>',t.persisted.idb?'<span title="IndexedDB shadow" style="color:#22cc77">🗄️</span>':'<span title="pas en IDB" style="color:#666">·</span>',t.persisted.firebase?'<span title="Firebase backup" style="color:#22cc77">☁️</span>':'<span title="pas en Firebase" style="color:#666">·</span>'].join(" ");return`
    <article style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);
                    border-radius:10px;padding:14px;margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
        <div style="flex:1;min-width:200px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <strong style="color:#c9a227">${f(t.service_name)}</strong>
            <span style="font-size:11px;padding:2px 6px;border-radius:8px;background:rgba(255,255,255,0.05);color:var(--ax-text-dim)">
              ${f(t.category)}
            </span>
          </div>
          <code style="font-size:11px;color:var(--ax-text-dim);font-family:monospace">${f(t.storage_key)}</code>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span style="color:${e.color};font-size:13px">${e.icon} ${e.label}</span>
          ${t.encrypted?'<span style="color:#22cc77;font-size:11px" title="AES-GCM-256">🔒</span>':""}
          <span style="font-size:11px">${c}</span>
          <code style="font-family:monospace;font-size:11px;color:var(--ax-text-dim);background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:4px">${f(t.preview)}</code>
        </div>
      </div>
      ${t.status_detail?`<p style="margin:6px 0 0;color:#ff6b6b;font-size:11px">⚠️ ${f(t.status_detail)}</p>`:""}
      <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">
        ${t.configured?`<button class="ax-btn ax-btn-sm" data-test="${f(t.storage_key)}" style="font-size:11px;padding:4px 10px">🧪 Tester</button>`:""}
        ${t.dashboard_url?`<a href="${f(t.dashboard_url)}" target="_blank" rel="noopener" class="ax-btn ax-btn-sm" style="font-size:11px;padding:4px 10px;text-decoration:none">🔗 Dashboard</a>`:""}
        ${t.billing_url?`<a href="${f(t.billing_url)}" target="_blank" rel="noopener" class="ax-btn ax-btn-sm" style="font-size:11px;padding:4px 10px;text-decoration:none">💰 Recharger</a>`:""}
      </div>
    </article>
  `}function L(t){if(!x)return;const e=t.querySelector("#ax-cred-refresh");e&&x.bind(e,"click",()=>{v.tap(),D(t)});const c=t.querySelector("#ax-cred-test-channels");c&&x.bind(c,"click",()=>{v.tap(),(async()=>{y.info("📡 Test alertes en cours...");const{kevinAlerts:r}=await b(async()=>{const{kevinAlerts:s}=await import("./kevin-alerts-DQPH-Oza.js");return{kevinAlerts:s}},__vite__mapDeps([4,0,1,2,3]),import.meta.url),o=await r.testAllChannels(),i=Object.entries(o).filter(([,s])=>s).map(([s])=>s);i.length===0?y.warn("Aucun channel d'alerte configuré"):y.success(`✅ Channels OK : ${i.join(", ")}`)})()}),t.querySelectorAll("[data-cat]").forEach(r=>{x.bind(r,"click",()=>{w=r.dataset.cat??"all",v.selection(),A&&S(t,A)})}),t.querySelectorAll("[data-test]").forEach(r=>{x.bind(r,"click",()=>{const o=r.dataset.test;o&&(v.tap(),(async()=>{const i=r.textContent;r.textContent="⏳ Test...",r.disabled=!0;try{const s=await C.testCredential(o);s.valid===!0?y.success(`✅ ${o} : valide (${s.latency_ms}ms)`):s.valid===!1?y.warn(`❌ ${o} : invalide`):y.info(`❓ ${o} : ${s.error??"test impossible"}`)}catch(s){y.error(`Test failed : ${String(s).slice(0,100)}`)}finally{r.textContent=i??"🧪 Tester",r.disabled=!1}})())})})}export{H as dispose,D as render};
//# sourceMappingURL=index-BE6FCKCr.js.map
