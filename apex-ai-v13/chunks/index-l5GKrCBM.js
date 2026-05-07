import{l as p}from"./monitoring-B17vNBOa.js";import{s as _}from"../core/main-CjIm8OHH.js";import{autoDiscoverLinks as T}from"./auto-discover-links-CT3eKI1l.js";import{detectCredential as y,CREDENTIAL_PATTERNS as $}from"./credential-patterns-BybElwOv.js";import{linksRegistry as w}from"./links-registry-CY8i1Bfx.js";import{multiKeyVault as g}from"./multi-key-vault-CYwvv8CV.js";import{v}from"./apex-kb-Cocxpy6E.js";import{h as l}from"./haptic-BUEqXK0N.js";import{toast as s}from"./toast-Dgg9rcIP.js";import"./apex-tools-dispatch-DkU4U7sA.js";import"./apex-tools-registry-Duck4KzY.js";function n(t){return t.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]??a)}const b=[{id:"ai",label:"🤖 IA & LLM",serviceMatchers:["anthropic","openai","groq","google","gemini","openrouter","cohere","mistral","perplexity","deepseek","xai","elevenlabs","replicate","huggingface","fireworks","togetherai","deepl"],patternCategories:["ai"]},{id:"finance",label:"💳 Paiements & Finance",serviceMatchers:["stripe","paypal","revolut","wise","lydia","n26","boursorama","fortuneo","ing","socgen","bnp","credit_agricole","credit_mutuel","banque_postale","lbp","bpce","shopify"],patternCategories:["finance"]},{id:"devops",label:"🛠 DevOps & Code",serviceMatchers:["github","gitlab","cloudflare","vercel","netlify","railway","aws","heroku","sentry","npm"],patternCategories:["devops"]},{id:"comms",label:"📨 Communications",serviceMatchers:["telegram","discord","slack","brevo","resend","twilio","sendgrid","mailchimp","whatsapp"],patternCategories:["comms"]},{id:"social",label:"🌐 Réseaux sociaux",serviceMatchers:["facebook","instagram","tiktok","youtube","twitter","linkedin"],patternCategories:[]},{id:"storage",label:"☁️ Stockage & Cloud",serviceMatchers:["firebase","supabase","airtable","notion","dropbox","pinecone","weaviate"],patternCategories:["storage"]},{id:"ecommerce",label:"🛒 E-commerce",serviceMatchers:["shopify","stripe_connect","paypal_business"],patternCategories:[]},{id:"crypto",label:"₿ Crypto",serviceMatchers:["coinbase","binance","crypto_com","kraken"],patternCategories:[]},{id:"identity",label:"🆔 Identité Kevin",serviceMatchers:["kevin","iban","siret","vat","bic","apple","microsoft"],patternCategories:["identity"]},{id:"other",label:"📦 Autres",serviceMatchers:[],patternCategories:["saas"]}];function A(t,a){const e=t.toLowerCase();let r=null;for(const i of b)if(i.id!=="other")for(const o of i.serviceMatchers)e.includes(o)&&(!r||o.length>r.matchLen)&&(r={catId:i.id,matchLen:o.length});if(r)return r.catId;if(a){for(const i of b)if(i.patternCategories.includes(a))return i.id}return"other"}function j(){return $.filter(t=>t.category!=="forbidden").map(t=>{const a=v.getKeyStatus(t.storageKey),e=(()=>{try{return localStorage.getItem(t.storageKey)??""}catch{return""}})(),r=e&&e.length>8&&!e.startsWith("AXENC1:")?v.maskKey(e):e.startsWith("AXENC1:")?"🔒 chiffré":"";return{pattern:t,status:a,masked:r}})}function oe(t,a){return t.filter(e=>{if(a.category&&e.pattern.category!==a.category||a.configuredOnly&&e.status==="empty")return!1;if(a.query){const r=a.query.toLowerCase();if(!(e.pattern.name.toLowerCase().includes(r)||e.pattern.storageKey.toLowerCase().includes(r)))return!1}return!0})}function z(){const t=[];let a=[];try{a=g.listAll(!0)}catch(e){p.warn("feature-vault","multiKeyVault.listAll failed",{err:e})}for(const e of a){const r=w.get(e.service),i=$.find(u=>u.storageKey.includes(e.service)),o={id:e.id,service:e.service,serviceName:r?.name??E(e.service),category:A(e.service,i?.category),status:e.status,source:"multi-key"};e.alias!==void 0&&(o.alias=e.alias),e.addedAt!==void 0&&(o.addedAt=e.addedAt),e.lastTestedAt!==void 0&&(o.lastTestedAt=e.lastTestedAt);const d=w.getRechargeLink(e.service);d&&(o.rechargeUrl=d),t.push(o)}return t}function I(){const t=z(),a={total:t.length,active:0,failing:0,invalid:0};for(const e of t)e.status==="active"?a.active+=1:e.status==="failing"||e.status==="rate-limited"?a.failing+=1:e.status==="invalid"&&(a.invalid+=1);return a}function K(t,a=""){const e=z(),r=a.trim().toLowerCase();return e.filter(i=>i.category!==t.id?!1:r?i.service.toLowerCase().includes(r)||i.serviceName.toLowerCase().includes(r)||(i.alias?.toLowerCase().includes(r)??!1):!0)}function E(t){return t.charAt(0).toUpperCase()+t.slice(1)}async function R(t){const a=t.trim();if(!a)return{ok:!1,reason:"Entrée vide"};const e=y(a);if(!e)return{ok:!1,reason:"Aucun pattern reconnu"};if(e.category==="forbidden")return{ok:!1,reason:"🚨 Type interdit (cartes/seed phrases jamais stockées)"};try{const r=await v.encryptAuto(a);return localStorage.setItem(e.storageKey,r),{ok:!0,pattern_name:e.name,storage_key:e.storageKey}}catch(r){return p.warn("vault-feature","autoDetectAndStore failed",{err:r}),{ok:!1,reason:"Erreur chiffrement"}}}function ne(t){try{return localStorage.removeItem(t),!0}catch(a){return p.warn("vault-feature","remove failed",{err:a}),!1}}function D(t){const a={exported_at:new Date().toISOString(),version:1,entries:t.filter(e=>e.status!=="empty").map(e=>{const r=(()=>{try{return localStorage.getItem(e.pattern.storageKey)??""}catch{return""}})();return{storage_key:e.pattern.storageKey,name:e.pattern.name,value_encrypted:r}})};return JSON.stringify(a,null,2)}function O(t){const a=U[t.status]??"#888",e=F[t.status]??"⚪",r=(t.preview??"").slice(0,4)+"••••••"+(t.preview??"").slice(-4),i=t.preview?r:"••••••",o=t.rechargeUrl??"",d=t.alias?`<span style="color:#888;font-size:11px">— ${n(t.alias)}</span>`:"",u=t.logoUrl?`<img src="${n(t.logoUrl)}" alt="" style="width:24px;height:24px;border-radius:6px" onerror="this.style.display='none'">`:"",c=[];t.addedAt&&c.push(`Ajouté ${S(t.addedAt)}`),t.lastTestedAt&&c.push(`Testé ${S(t.lastTestedAt)}`);const m=c.length>0?`<div style="display:flex;gap:8px;font-size:11px;color:#888;margin-bottom:10px">${c.map(M=>`<span>${n(M)}</span>`).join("")}</div>`:"";return`
    <div class="ax-cred-card" data-cred-id="${n(t.id)}" data-service="${n(t.service)}"
      style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;transition:all 200ms ease-out;position:relative;display:flex;flex-direction:column;gap:8px">
      <div style="position:absolute;top:14px;right:14px;width:10px;height:10px;border-radius:50%;background:${n(a)};box-shadow:0 0 8px ${n(a)}" title="${n(e)} ${n(t.status)}"></div>
      <div style="display:flex;align-items:center;gap:10px">
        ${u}
        <strong style="font-size:15px;color:#fff">${n(t.serviceName)}</strong>
        ${d}
      </div>
      <code style="display:block;padding:6px 10px;background:rgba(0,0,0,0.3);border-radius:6px;font-size:11px;color:#888;font-family:'SF Mono',Menlo,monospace;letter-spacing:1px">${n(i)}</code>
      ${m}
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button data-action="test" data-cred-id="${n(t.id)}"
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(34,204,119,0.1);color:#22cc77;border:1px solid rgba(34,204,119,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px">🔄 Test</button>
        <button data-action="recharge" data-service="${n(t.service)}" data-recharge-url="${n(o)}" ${o?"":"disabled"}
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(201,162,39,0.1);color:#c9a227;border:1px solid rgba(201,162,39,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px;${o?"":"opacity:0.4;cursor:not-allowed"}">💰 Recharger</button>
        <button data-action="discover-links" data-service="${n(t.service)}"
          title="Cherche login/dashboard/billing/api_keys/usage en autonomie"
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(74,158,255,0.1);color:#4a9eff;border:1px solid rgba(74,158,255,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px">🔍 Chercher liens</button>
        <button data-action="edit" data-cred-id="${n(t.id)}"
          style="padding:6px 10px;background:rgba(255,255,255,0.05);color:#aaa;border:1px solid rgba(255,255,255,0.1);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px">✏️</button>
        <button data-action="delete" data-cred-id="${n(t.id)}"
          style="padding:6px 10px;background:rgba(255,91,91,0.1);color:#ff5b5b;border:1px solid rgba(255,91,91,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px">🗑</button>
      </div>
    </div>
  `}const U={active:"#22cc77",failing:"#ffaa00","rate-limited":"#ffaa00",invalid:"#ff5b5b",unknown:"#888"},F={active:"🟢",failing:"🟡","rate-limited":"🟡",invalid:"🔴",unknown:"⚪"};function S(t){const a=Date.now()-t;if(a<0||!Number.isFinite(a))return"à l'instant";const e=Math.floor(a/6e4);if(e<1)return"à l'instant";if(e<60)return`il y a ${e}min`;const r=Math.floor(e/60);if(r<24)return`il y a ${r}h`;const i=Math.floor(r/24);return i<30?`il y a ${i}j`:`il y a ${Math.floor(i/30)} mois`}let h="";function x(t){if(!_.get("isAdmin")){t.innerHTML=`<div style="padding:40px;text-align:center"><h2 style="color:#c9a227">🔒 Coffre admin</h2><p style="color:#a0a4c0">Cette section est réservée à l'admin Kevin.</p></div>`;return}const e=I();t.innerHTML=`
    <style>
      .ax-vault-page button:active { transform: scale(0.96); }
      .ax-vault-page details[open] > summary .ax-chevron { transform: rotate(180deg); }
      .ax-cred-card:hover { transform: translateY(-2px); border-color: rgba(232,184,48,0.3) !important; }
      @media (prefers-reduced-motion: reduce) {
        .ax-cred-card { transition: none !important; }
        .ax-vault-page button:active { transform: none !important; }
      }
    </style>
    <div class="ax-vault-page" style="padding:env(safe-area-inset-top,16px) 16px env(safe-area-inset-bottom,80px);max-width:1140px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif">

      <header style="position:sticky;top:0;z-index:10;background:rgba(8,8,15,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);padding:12px 0;margin:-16px -16px 16px;border-bottom:1px solid rgba(201,162,39,0.15)">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:0 16px;flex-wrap:wrap">
          <h1 style="margin:0;font-size:24px;background:linear-gradient(135deg,#c9a227,#e8b830);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:700">🔐 Coffre Codes</h1>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button id="ax-vault-add-manual" style="padding:8px 14px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px;min-height:40px">+ Ajouter</button>
            <button id="ax-vault-test-all" style="padding:8px 14px;background:rgba(201,162,39,0.1);color:#c9a227;border:1px solid rgba(201,162,39,0.3);border-radius:10px;cursor:pointer;font-size:13px;min-height:40px">🔄 Tester tout</button>
          </div>
        </div>
        <div style="display:flex;gap:14px;padding:8px 16px 0;font-size:12px;color:#aaa;flex-wrap:wrap">
          <span>📊 ${e.total} codes</span>
          <span style="color:#22cc77">🟢 ${e.active} actifs</span>
          <span style="color:#ffaa00">🟡 ${e.failing} dégradés</span>
          <span style="color:#ff5b5b">🔴 ${e.invalid} invalides</span>
        </div>
      </header>

      <input type="text" id="ax-vault-search" value="${n(h)}" placeholder="🔍 Chercher un service..."
        style="width:100%;padding:12px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;color:#fff;font-size:15px;margin-bottom:14px;box-sizing:border-box;-webkit-appearance:none;min-height:44px">

      <section style="background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));border:1px solid rgba(232,184,48,0.18);border-radius:14px;padding:14px;margin-bottom:14px">
        <h3 style="margin:0 0 8px;font-size:13px;color:#e8b830;text-transform:uppercase;letter-spacing:0.08em;font-weight:700">🔍 Auto-détection rapide</h3>
        <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0 0 10px">Colle ici n'importe quelle clé API, Apex la reconnaît + la range automatiquement.</p>
        <textarea id="ax-vault-paste" placeholder="Colle ta clé ici (sk-ant-..., AIzaSy..., re_...)"
          style="width:100%;background:rgba(0,0,0,0.35);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;font-family:'SF Mono',Menlo,monospace;font-size:12px;min-height:60px;resize:vertical;box-sizing:border-box;-webkit-appearance:none"></textarea>
        <button id="ax-vault-paste-btn"
          style="margin-top:10px;padding:10px 20px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;min-height:40px">🔍 Détecter & stocker</button>
        <div id="ax-vault-paste-result" style="margin-top:8px;font-size:12px"></div>
      </section>

      <div id="ax-vault-categories" style="display:flex;flex-direction:column;gap:12px"></div>

      <section style="margin-top:18px;padding:14px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:14px">
        <h3 style="margin:0 0 10px;color:#e8b830;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700">💾 Backup & Restore</h3>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button id="ax-vault-export"
            style="padding:8px 14px;background:rgba(106,138,255,0.15);color:#6a8aff;border:1px solid rgba(106,138,255,0.3);border-radius:9px;font-size:12px;font-weight:600;cursor:pointer;min-height:36px">📥 Exporter (JSON)</button>
        </div>
      </section>

      <p style="text-align:center;color:rgba(255,255,255,0.4);font-size:11px;margin-top:16px;padding:14px;background:rgba(255,255,255,0.02);border-radius:12px;line-height:1.6">
        🛡 <strong style="color:rgba(255,255,255,0.6)">Sécurité</strong> : AES-GCM 256 + PBKDF2 200k iterations · Audit log immutable<br>
        <span style="opacity:0.7">FB_LOCAL strict pour ax_pin/ax_user · jamais de plaintext en backup</span>
      </p>

      <div id="ax-vault-modal-root"></div>
    </div>
  `,L(t),H(t),p.info("feature-vault",`rendered (${e.total} entries)`)}function L(t){const a=t.querySelector("#ax-vault-categories");a&&(a.innerHTML=b.map(e=>{const r=K(e,h);if(r.length===0&&e.id!=="identity")return"";const i=r.length>0;return`
      <details class="ax-cat" data-cat-id="${n(e.id)}" ${i?"open":""}
        style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;overflow:hidden">
        <summary style="padding:14px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-weight:600;list-style:none;-webkit-tap-highlight-color:transparent;min-height:44px">
          <span>${n(e.label)} <span style="color:#888;font-weight:400;font-size:13px">(${r.length})</span></span>
          <span class="ax-chevron" style="color:#888;transition:transform 200ms ease-out">▼</span>
        </summary>
        <div style="padding:0 14px 14px;display:grid;grid-template-columns:repeat(auto-fill, minmax(280px,1fr));gap:10px">
          ${r.map(o=>O(o)).join("")}
          ${r.length===0?`
            <div style="padding:20px;color:#666;text-align:center;grid-column:1/-1;font-size:13px">
              Aucun code dans cette catégorie<br>
              <button data-action="add-to-cat" data-cat-id="${n(e.id)}"
                style="margin-top:10px;padding:8px 14px;background:rgba(201,162,39,0.1);color:#c9a227;border:1px solid rgba(201,162,39,0.3);border-radius:8px;cursor:pointer;font-size:12px;min-height:36px">
                + Ajouter ${n(e.label)}
              </button>
            </div>
          `:""}
        </div>
      </details>
    `}).join(""))}function H(t){const a=t.querySelector("#ax-vault-search");if(a){let e=null;a.addEventListener("input",()=>{e&&clearTimeout(e),e=setTimeout(()=>{h=a.value.trim(),L(t),C(t)},240)})}t.querySelector("#ax-vault-add-manual")?.addEventListener("click",()=>{l.tap(),q(t)}),t.querySelector("#ax-vault-test-all")?.addEventListener("click",()=>{(async()=>{l.tap(),s.info("Test de toutes les clés en cours…");try{const e=await g.healthCheckAll();s.success(`✅ ${e.tested} testées · ${e.recovered} récupérées · ${e.stillDown} HS`),x(t)}catch(e){p.warn("feature-vault","testAll failed",{err:e}),s.error("Erreur pendant le test global")}})()}),t.querySelector("#ax-vault-paste-btn")?.addEventListener("click",()=>{(async()=>{l.tap();const e=t.querySelector("#ax-vault-paste"),r=t.querySelector("#ax-vault-paste-result");if(!e||!r)return;const i=await R(e.value);if(i.ok){l.success(),s.success(`✅ ${i.pattern_name} stocké`),r.innerHTML=`<div style="padding:8px;background:rgba(34,204,119,.1);color:#22cc77;border-radius:8px">✅ ${n(i.pattern_name)} → ${n(i.storage_key)}</div>`,e.value="";const o=y(e.value.trim());if(o){const d=o.storageKey.replace(/^(ax_|apex_v13_)/,"").replace(/_(?:key|token|pat|sk|pk|id|secret)$/,"");try{await g.addKey(d,e.value.trim())}catch{}}x(t)}else l.error(),s.error(i.reason),r.innerHTML=`<div style="padding:8px;background:rgba(255,88,88,.1);color:#ff5858;border-radius:8px">⚠ ${n(i.reason)}</div>`})()}),t.querySelector("#ax-vault-export")?.addEventListener("click",()=>{l.tap();const e=D(j()),r=new Blob([e],{type:"application/json"}),i=URL.createObjectURL(r),o=document.createElement("a");o.href=i,o.download=`apex-vault-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(i),s.success("Coffre exporté (chiffré)")}),C(t)}function C(t){t.querySelectorAll('[data-action="test"]').forEach(a=>{a.addEventListener("click",e=>{e.stopPropagation();const r=a.dataset.credId??"";N(t,r,a)})}),t.querySelectorAll('[data-action="recharge"]').forEach(a=>{a.addEventListener("click",e=>{e.stopPropagation();const r=a.dataset.rechargeUrl??"",i=a.dataset.service??"";P(r,i)})}),t.querySelectorAll('[data-action="discover-links"]').forEach(a=>{a.addEventListener("click",e=>{e.stopPropagation();const r=a.dataset.service??"";V(t,r,a)})}),t.querySelectorAll('[data-action="edit"]').forEach(a=>{a.addEventListener("click",e=>{e.stopPropagation();const r=a.dataset.credId??"";J(t,r)})}),t.querySelectorAll('[data-action="delete"]').forEach(a=>{a.addEventListener("click",e=>{e.stopPropagation();const r=a.dataset.credId??"";B(t,r)})}),t.querySelectorAll('[data-action="add-to-cat"]').forEach(a=>{a.addEventListener("click",e=>{e.stopPropagation();const r=a.dataset.catId??"";q(t,r)})})}async function N(t,a,e){if(!a)return;l.tap();const r=e.textContent;e.textContent="⏳ Test…",e.setAttribute("disabled","true");try{const i=await g.testKey(a);i.ok?(l.success(),s.success(`✅ Active (${i.latencyMs}ms)`)):(l.error(),s.error(`❌ ${i.reason??"Test échoué"}`)),x(t)}catch(i){p.warn("feature-vault","testKey failed",{err:i}),l.error(),s.error("Erreur pendant le test"),e.textContent=r,e.removeAttribute("disabled")}}function P(t,a){if(l.tap(),!t){s.warn(`Aucune page recharge connue pour ${a}`);return}try{window.open(t,"_blank","noopener,noreferrer")}catch(e){p.warn("feature-vault","recharge open failed",{err:e}),s.error("Impossible d'ouvrir le lien")}}async function V(t,a,e){if(!a)return;l.tap();const r=e.textContent;e.textContent="⏳ Recherche…",e.setAttribute("disabled","true");try{const i=await T.discover(a,{force:!0}),o=[];i.login&&o.push("login"),i.dashboard&&o.push("dashboard"),i.billing&&o.push("billing"),i.api_keys&&o.push("api_keys"),i.usage&&o.push("usage"),i.docs&&o.push("docs"),i.password_reset&&o.push("reset_pw"),i.account_settings&&o.push("settings"),i.support&&o.push("support"),i.status_page&&o.push("status"),i.alive&&o.length>0?(l.success(),s.success(`🔗 ${o.length} liens trouvés (${i.source}) : ${o.join(", ")}`)):(l.error(),s.warn(`Aucun lien validé pour ${a} — réessaie plus tard`)),x(t)}catch(i){p.warn("feature-vault","discoverLinks failed",{err:i}),l.error(),s.error("Erreur pendant la recherche de liens")}finally{e.textContent=r,e.removeAttribute("disabled")}}function B(t,a){if(a&&(l.tap(),!!window.confirm("Supprimer cette clé ? Action irréversible (la clé sera marquée invalide dans l'historique).")))try{g.markInvalid(a,"admin manual delete"),l.success(),s.success("Clé supprimée (archivée invalide)"),x(t)}catch(e){p.warn("feature-vault","delete failed",{err:e}),l.error(),s.error("Suppression échouée")}}function k(t){let a=t.querySelector("#ax-vault-modal-root");return a||(a=document.createElement("div"),a.id="ax-vault-modal-root",t.appendChild(a)),a}function f(t){const a=k(t);a.innerHTML=""}function q(t,a){const e=k(t),r=b.filter(o=>o.id!=="other").map(o=>`<option value="${n(o.id)}" ${a===o.id?"selected":""}>${n(o.label)}</option>`).join("");e.innerHTML=`
    <div role="dialog" aria-modal="true" aria-label="Ajouter une clé"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">
      <div style="background:#0e0e1c;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;max-width:440px;width:100%;max-height:90vh;overflow-y:auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <h2 style="margin:0;font-size:18px;color:#e8b830">+ Ajouter une clé</h2>
          <button id="ax-vault-modal-close" aria-label="Fermer"
            style="background:transparent;border:0;color:#aaa;font-size:24px;cursor:pointer;min-height:32px;min-width:32px">×</button>
        </div>
        <label style="display:block;margin-bottom:10px;font-size:13px;color:rgba(255,255,255,0.7)">
          Catégorie
          <select id="ax-vault-add-cat" style="width:100%;margin-top:4px;padding:10px;background:rgba(255,255,255,0.04);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:8px;font-size:14px;min-height:44px">
            ${r}
          </select>
        </label>
        <label style="display:block;margin-bottom:10px;font-size:13px;color:rgba(255,255,255,0.7)">
          Service (ex: anthropic, openai, stripe)
          <input type="text" id="ax-vault-add-service" placeholder="anthropic"
            style="width:100%;margin-top:4px;padding:10px;background:rgba(255,255,255,0.04);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:8px;font-size:14px;min-height:44px;box-sizing:border-box;-webkit-appearance:none">
        </label>
        <label style="display:block;margin-bottom:10px;font-size:13px;color:rgba(255,255,255,0.7)">
          Alias (optionnel)
          <input type="text" id="ax-vault-add-alias" placeholder="perso, client X..."
            style="width:100%;margin-top:4px;padding:10px;background:rgba(255,255,255,0.04);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:8px;font-size:14px;min-height:44px;box-sizing:border-box;-webkit-appearance:none">
        </label>
        <label style="display:block;margin-bottom:10px;font-size:13px;color:rgba(255,255,255,0.7)">
          Valeur (clé / token)
          <textarea id="ax-vault-add-value" placeholder="Colle la clé ici"
            style="width:100%;margin-top:4px;padding:10px;background:rgba(0,0,0,0.4);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:8px;font-size:13px;min-height:80px;font-family:'SF Mono',Menlo,monospace;box-sizing:border-box;-webkit-appearance:none;resize:vertical"></textarea>
        </label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
          <button id="ax-vault-add-detect"
            style="flex:1;min-width:140px;padding:10px;background:rgba(106,138,255,0.15);color:#6a8aff;border:1px solid rgba(106,138,255,0.3);border-radius:8px;cursor:pointer;font-size:13px;min-height:44px">🔍 Détecter automatiquement</button>
          <button id="ax-vault-add-save"
            style="flex:1;min-width:140px;padding:10px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700;min-height:44px">🔒 Chiffrer & Sauvegarder</button>
        </div>
      </div>
    </div>
  `,e.querySelector("#ax-vault-modal-close")?.addEventListener("click",()=>f(t));const i=e.querySelector('[role="dialog"]');i?.addEventListener("click",o=>{o.target===i&&f(t)}),e.querySelector("#ax-vault-add-detect")?.addEventListener("click",()=>{(async()=>{l.tap();const o=e.querySelector("#ax-vault-add-value");if(!o)return;const d=y(o.value.trim());if(!d){s.warn("Aucun pattern reconnu");return}if(d.category==="forbidden"){s.error("🚨 Type interdit");return}const u=e.querySelector("#ax-vault-add-service"),c=e.querySelector("#ax-vault-add-cat");if(u){const m=d.storageKey.replace(/^(ax_|apex_v13_)/,"").replace(/_(?:key|token|pat|sk|pk|id|secret)$/,"");u.value=m}c&&(c.value=A(u?.value??"",d.category)),s.success(`Détecté: ${d.name}`)})()}),e.querySelector("#ax-vault-add-save")?.addEventListener("click",()=>{(async()=>{l.tap();const o=e.querySelector("#ax-vault-add-service")?.value.trim()??"",d=e.querySelector("#ax-vault-add-alias")?.value.trim()??"",u=e.querySelector("#ax-vault-add-value")?.value.trim()??"";if(!o||!u){s.warn("Service et valeur requis");return}try{const c={};d&&(c.alias=d),await g.addKey(o,u,c),s.success(`✅ Clé ${o} chiffrée + sauvegardée`),f(t),x(t)}catch(c){p.warn("feature-vault","add manual failed",{err:c}),s.error("Erreur pendant la sauvegarde")}})()})}function J(t,a){const e=k(t),r=g.listAll(!0).find(i=>i.id===a);if(!r){s.error("Clé introuvable");return}e.innerHTML=`
    <div role="dialog" aria-modal="true" aria-label="Modifier une clé"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">
      <div style="background:#0e0e1c;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;max-width:440px;width:100%">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <h2 style="margin:0;font-size:18px;color:#e8b830">✏️ Modifier ${n(r.service)}</h2>
          <button id="ax-vault-modal-close" aria-label="Fermer"
            style="background:transparent;border:0;color:#aaa;font-size:24px;cursor:pointer;min-height:32px;min-width:32px">×</button>
        </div>
        <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0 0 12px">Une nouvelle valeur remplacera l'ancienne (chiffrement AES-GCM 256).</p>
        <label style="display:block;margin-bottom:10px;font-size:13px;color:rgba(255,255,255,0.7)">
          Nouvelle valeur
          <textarea id="ax-vault-edit-value" placeholder="Colle la nouvelle clé"
            style="width:100%;margin-top:4px;padding:10px;background:rgba(0,0,0,0.4);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:8px;font-size:13px;min-height:80px;font-family:'SF Mono',Menlo,monospace;box-sizing:border-box;-webkit-appearance:none;resize:vertical"></textarea>
        </label>
        <label style="display:block;margin-bottom:10px;font-size:13px;color:rgba(255,255,255,0.7)">
          Alias (optionnel)
          <input type="text" id="ax-vault-edit-alias" value="${n(r.alias??"")}"
            style="width:100%;margin-top:4px;padding:10px;background:rgba(255,255,255,0.04);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:8px;font-size:14px;min-height:44px;box-sizing:border-box;-webkit-appearance:none">
        </label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
          <button id="ax-vault-edit-cancel"
            style="flex:1;min-width:120px;padding:10px;background:rgba(255,255,255,0.04);color:#aaa;border:1px solid rgba(255,255,255,0.1);border-radius:8px;cursor:pointer;font-size:13px;min-height:44px">Annuler</button>
          <button id="ax-vault-edit-save"
            style="flex:1;min-width:120px;padding:10px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700;min-height:44px">💾 Enregistrer</button>
        </div>
      </div>
    </div>
  `,e.querySelector("#ax-vault-modal-close")?.addEventListener("click",()=>f(t)),e.querySelector("#ax-vault-edit-cancel")?.addEventListener("click",()=>f(t)),e.querySelector("#ax-vault-edit-save")?.addEventListener("click",()=>{(async()=>{l.tap();const i=e.querySelector("#ax-vault-edit-value")?.value.trim()??"",o=e.querySelector("#ax-vault-edit-alias")?.value.trim()??"";if(!i){s.warn("Valeur requise");return}try{g.markInvalid(a,"replaced via edit");const d={};o&&(d.alias=o),await g.addKey(r.service,i,d),s.success("✅ Clé mise à jour"),f(t),x(t)}catch(d){p.warn("feature-vault","edit save failed",{err:d}),s.error("Erreur pendant la modification")}})()})}export{b as CATEGORIES,R as autoDetectAndStore,z as buildCredentialDisplays,A as classifyService,I as computeStats,n as escapeHtml,D as exportVaultJson,oe as filterVaultEntries,S as formatRelativeTime,K as getCredentialsForCategory,j as listVaultEntries,ne as removeCredential,x as render,O as renderCredentialCard};
//# sourceMappingURL=index-l5GKrCBM.js.map
