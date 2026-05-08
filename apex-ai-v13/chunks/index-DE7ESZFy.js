const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./vault-firebase-backup-Bnhk7pYp.js","./apex-kb-Ci7aGCCu.js","./monitoring-3uBGKGRH.js","./credential-patterns-Dy6Wjk7e.js","./multi-source-analyze-D83EZEyJ.js"])))=>i.map(i=>d[i]);
import{v as k,_ as $}from"./apex-kb-Ci7aGCCu.js";import{c as R}from"./listener-cleanup-Y2rGGxxX.js";import{l as b}from"./monitoring-3uBGKGRH.js";import{s as z,a as B}from"../core/main-Cc3hpeIQ.js";import{autoDiscoverLinks as D}from"./auto-discover-links-CaWZbDQ0.js";import{c as H}from"./csp-style-helper-BisGRi53.js";import{detectCredential as w,CREDENTIAL_PATTERNS as M}from"./credential-patterns-Dy6Wjk7e.js";import{g as O}from"./apex-tools-dispatch-Lpa-YFf6.js";import{l as _}from"./multi-source-analyze-D83EZEyJ.js";import{multiKeyVault as m}from"./multi-key-vault-D-mCcZZo.js";import{haptic as u}from"./haptic-CQFg2PXZ.js";import{toast as l}from"./toast-ClsF1KRZ.js";import"./apex-tools-registry-BuVfsU7J.js";import"./voice-BdN7rKPO.js";let s=null;function ve(){s?.cleanup(),s=null}function d(e){return e.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]??a)}const h=[{id:"ai",label:"🤖 IA & LLM",serviceMatchers:["anthropic","openai","groq","google","gemini","openrouter","cohere","mistral","perplexity","deepseek","xai","elevenlabs","replicate","huggingface","fireworks","togetherai","deepl"],patternCategories:["ai"]},{id:"finance",label:"💳 Paiements & Finance",serviceMatchers:["stripe","paypal","revolut","wise","lydia","n26","boursorama","fortuneo","ing","socgen","bnp","credit_agricole","credit_mutuel","banque_postale","lbp","bpce","shopify"],patternCategories:["finance"]},{id:"devops",label:"🛠 DevOps & Code",serviceMatchers:["github","gitlab","cloudflare","vercel","netlify","railway","aws","heroku","sentry","npm"],patternCategories:["devops"]},{id:"comms",label:"📨 Communications",serviceMatchers:["telegram","discord","slack","brevo","resend","twilio","sendgrid","mailchimp","whatsapp"],patternCategories:["comms"]},{id:"social",label:"🌐 Réseaux sociaux",serviceMatchers:["facebook","instagram","tiktok","youtube","twitter","linkedin"],patternCategories:[]},{id:"storage",label:"☁️ Stockage & Cloud",serviceMatchers:["firebase","supabase","airtable","notion","dropbox","pinecone","weaviate"],patternCategories:["storage"]},{id:"ecommerce",label:"🛒 E-commerce",serviceMatchers:["shopify","stripe_connect","paypal_business"],patternCategories:[]},{id:"crypto",label:"₿ Crypto",serviceMatchers:["coinbase","binance","crypto_com","kraken"],patternCategories:[]},{id:"identity",label:"🆔 Identité Kevin",serviceMatchers:["kevin","iban","siret","vat","bic","apple","microsoft"],patternCategories:["identity"]},{id:"other",label:"📦 Autres",serviceMatchers:[],patternCategories:["saas"]}];function L(e,a){const t=e.toLowerCase();let r=null;for(const i of h)if(i.id!=="other")for(const o of i.serviceMatchers)t.includes(o)&&(!r||o.length>r.matchLen)&&(r={catId:i.id,matchLen:o.length});if(r)return r.catId;if(a){for(const i of h)if(i.patternCategories.includes(a))return i.id}return"other"}function U(){return M.filter(e=>e.category!=="forbidden").map(e=>{const a=k.getKeyStatus(e.storageKey),t=(()=>{try{return localStorage.getItem(e.storageKey)??""}catch{return""}})(),r=t&&t.length>8&&!t.startsWith("AXENC1:")?k.maskKey(t):t.startsWith("AXENC1:")?"🔒 chiffré":"";return{pattern:e,status:a,masked:r}})}function me(e,a){return e.filter(t=>{if(a.category&&t.pattern.category!==a.category||a.configuredOnly&&t.status==="empty")return!1;if(a.query){const r=a.query.toLowerCase();if(!(t.pattern.name.toLowerCase().includes(r)||t.pattern.storageKey.toLowerCase().includes(r)))return!1}return!0})}function I(){const e=[];let a=[];try{a=m.listAll(!0)}catch(t){b.warn("feature-vault","multiKeyVault.listAll failed",{err:t})}for(const t of a){const r=_.get(t.service),i=M.find(p=>p.storageKey.includes(t.service)),o={id:t.id,service:t.service,serviceName:r?.name??N(t.service),category:L(t.service,i?.category),status:t.status,source:"multi-key"};t.alias!==void 0&&(o.alias=t.alias),t.addedAt!==void 0&&(o.addedAt=t.addedAt),t.lastTestedAt!==void 0&&(o.lastTestedAt=t.lastTestedAt);const g=_.getRechargeLink(t.service);g&&(o.rechargeUrl=g),e.push(o)}return e}function F(){const e=I(),a={total:e.length,active:0,failing:0,invalid:0};for(const t of e)t.status==="active"?a.active+=1:t.status==="failing"||t.status==="rate-limited"?a.failing+=1:t.status==="invalid"&&(a.invalid+=1);return a}function P(e,a=""){const t=I(),r=a.trim().toLowerCase();return t.filter(i=>i.category!==e.id?!1:r?i.service.toLowerCase().includes(r)||i.serviceName.toLowerCase().includes(r)||(i.alias?.toLowerCase().includes(r)??!1):!0)}function N(e){return e.charAt(0).toUpperCase()+e.slice(1)}async function V(e){const a=e.trim();if(!a)return{ok:!1,reason:"Entrée vide"};const t=w(a);if(!t)return{ok:!1,reason:"Aucun pattern reconnu"};if(t.category==="forbidden")return{ok:!1,reason:"🚨 Type interdit (cartes/seed phrases jamais stockées)"};try{const r=await k.encryptAuto(a);return localStorage.setItem(t.storageKey,r),{ok:!0,pattern_name:t.name,storage_key:t.storageKey}}catch(r){return b.warn("vault-feature","autoDetectAndStore failed",{err:r}),{ok:!1,reason:"Erreur chiffrement"}}}function ye(e){try{return localStorage.removeItem(e),!0}catch(a){return b.warn("vault-feature","remove failed",{err:a}),!1}}function Y(e){const a={exported_at:new Date().toISOString(),version:1,entries:e.filter(t=>t.status!=="empty").map(t=>{const r=(()=>{try{return localStorage.getItem(t.pattern.storageKey)??""}catch{return""}})();return{storage_key:t.pattern.storageKey,name:t.pattern.name,value_encrypted:r}})};return JSON.stringify(a,null,2)}function J(e){const a=X[e.status]??"#888",t=G[e.status]??"⚪",r=(e.preview??"").slice(0,4)+"••••••"+(e.preview??"").slice(-4),i=e.preview?r:"••••••",o=e.rechargeUrl??"",g=e.alias?`<span style="color:#888;font-size:11px">— ${d(e.alias)}</span>`:"",p=e.logoUrl?`<img src="${d(e.logoUrl)}" alt="" loading="lazy" decoding="async" style="width:24px;height:24px;border-radius:6px" onerror="this.style.display='none'">`:"",n=[];e.addedAt&&n.push(`Ajouté ${q(e.addedAt)}`),e.lastTestedAt&&n.push(`Testé ${q(e.lastTestedAt)}`);const x=n.length>0?`<div style="display:flex;gap:8px;font-size:11px;color:#888;margin-bottom:10px">${n.map(c=>`<span>${d(c)}</span>`).join("")}</div>`:"";return`
    <div class="ax-cred-card" data-cred-id="${d(e.id)}" data-service="${d(e.service)}"
      style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;transition:all 200ms ease-out;position:relative;display:flex;flex-direction:column;gap:8px">
      <div style="position:absolute;top:14px;right:14px;width:10px;height:10px;border-radius:50%;background:${d(a)};box-shadow:0 0 8px ${d(a)}" title="${d(t)} ${d(e.status)}"></div>
      <div style="display:flex;align-items:center;gap:10px">
        ${p}
        <strong style="font-size:15px;color:#fff">${d(e.serviceName)}</strong>
        ${g}
      </div>
      <code style="display:block;padding:6px 10px;background:rgba(0,0,0,0.3);border-radius:6px;font-size:11px;color:#888;font-family:'SF Mono',Menlo,monospace;letter-spacing:1px">${d(i)}</code>
      ${x}
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button data-action="test" data-cred-id="${d(e.id)}"
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(34,204,119,0.1);color:#22cc77;border:1px solid rgba(34,204,119,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px">🔄 Test</button>
        <button data-action="recharge" data-service="${d(e.service)}" data-recharge-url="${d(o)}" ${o?"":"disabled"}
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(201,162,39,0.1);color:#c9a227;border:1px solid rgba(201,162,39,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px;${o?"":"opacity:0.4;cursor:not-allowed"}">💰 Recharger</button>
        <button data-action="discover-links" data-service="${d(e.service)}"
          title="Cherche login/dashboard/billing/api_keys/usage en autonomie"
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(74,158,255,0.1);color:#4a9eff;border:1px solid rgba(74,158,255,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px">🔍 Chercher liens</button>
        <button data-action="edit" data-cred-id="${d(e.id)}"
          style="padding:6px 10px;background:rgba(255,255,255,0.05);color:#aaa;border:1px solid rgba(255,255,255,0.1);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px">✏️</button>
        <button data-action="delete" data-cred-id="${d(e.id)}"
          style="padding:6px 10px;background:rgba(255,91,91,0.1);color:#ff5b5b;border:1px solid rgba(255,91,91,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px">🗑</button>
      </div>
    </div>
  `}const X={active:"#22cc77",failing:"#ffaa00","rate-limited":"#ffaa00",invalid:"#ff5b5b",unknown:"#888"},G={active:"🟢",failing:"🟡","rate-limited":"🟡",invalid:"🔴",unknown:"⚪"};function q(e){const a=Date.now()-e;if(a<0||!Number.isFinite(a))return"à l'instant";const t=Math.floor(a/6e4);if(t<1)return"à l'instant";if(t<60)return`il y a ${t}min`;const r=Math.floor(t/60);if(r<24)return`il y a ${r}h`;const i=Math.floor(r/24);return i<30?`il y a ${i}j`:`il y a ${Math.floor(i/30)} mois`}let S="";function v(e){if(s?.cleanup(),s=R("vault"),!z.get("isAdmin")){e.innerHTML=`<div style="padding:40px;text-align:center"><h2 style="color:#c9a227">🔒 Coffre admin</h2><p style="color:#a0a4c0">Cette section est réservée à l'admin Kevin.</p></div>`;return}const t=z.get("user")?.id??"anon";if(!O("admin.vault",e,t))return;const r=F();e.innerHTML=H.withNonce(`
    <style>
      /* v13.3.22 UX iPhone PWA fix Kevin "j'ai dû descendre la page on voit plus le haut" :
       * Header + search bar STICKY robustes (top:0 sans interférence padding parent).
       * Compact-mode auto via class .ax-vault-scrolled (ajoutée en JS au scroll > 80px).
       * Bottom safe-area + FAB floating "Tester tout" si scrollé loin. */
      .ax-vault-page button:active { transform: scale(0.96); }
      .ax-vault-page details[open] > summary .ax-chevron { transform: rotate(180deg); }
      .ax-cred-card:hover { transform: translateY(-2px); border-color: rgba(232,184,48,0.3) !important; }
      .ax-vault-sticky-wrap {
        position: sticky;
        top: 0;
        z-index: 50;
        margin: 0 -16px;
        padding: 0 16px;
        background: rgba(8,8,15,0.96);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border-bottom: 1px solid rgba(201,162,39,0.15);
        transition: padding 200ms ease, box-shadow 200ms ease;
      }
      .ax-vault-page.ax-vault-scrolled .ax-vault-sticky-wrap {
        padding-top: 4px;
        padding-bottom: 4px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.45);
      }
      .ax-vault-page.ax-vault-scrolled .ax-vault-stats { display: none; }
      .ax-vault-page.ax-vault-scrolled .ax-vault-h1 { font-size: 18px; }
      .ax-vault-page.ax-vault-scrolled .ax-vault-search-row {
        margin-top: 6px;
        padding-bottom: 6px;
      }
      .ax-vault-fab {
        position: fixed;
        right: 16px;
        bottom: calc(env(safe-area-inset-bottom, 0px) + 80px);
        z-index: 18;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg,#c9a227,#e8b830);
        color: #000;
        font-size: 22px;
        font-weight: 700;
        border: none;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(201,162,39,0.45);
        opacity: 0;
        transform: translateY(16px) scale(0.9);
        pointer-events: none;
        transition: opacity 220ms ease, transform 220ms cubic-bezier(0.16,1,0.3,1);
      }
      .ax-vault-page.ax-vault-scrolled .ax-vault-fab {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      @media (prefers-reduced-motion: reduce) {
        .ax-cred-card, .ax-vault-sticky-wrap, .ax-vault-fab { transition: none !important; }
        .ax-vault-page button:active { transform: none !important; }
      }
    </style>
    <div class="ax-vault-page" style="padding:env(safe-area-inset-top,16px) 16px calc(env(safe-area-inset-bottom,16px) + 96px);max-width:1140px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif">

      <div class="ax-vault-sticky-wrap">
        <header style="padding:12px 0">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
            <h1 class="ax-vault-h1" style="margin:0;font-size:24px;background:linear-gradient(135deg,#c9a227,#e8b830);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:700;transition:font-size 200ms ease">🔐 Coffre Codes</h1>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button id="ax-vault-add-manual" style="padding:8px 14px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px;min-height:40px">+ Ajouter</button>
              <button id="ax-vault-test-all" style="padding:8px 14px;background:rgba(201,162,39,0.1);color:#c9a227;border:1px solid rgba(201,162,39,0.3);border-radius:10px;cursor:pointer;font-size:13px;min-height:40px">🔄 Tester tout</button>
            </div>
          </div>
          <div class="ax-vault-stats" style="display:flex;gap:14px;padding:8px 0 0;font-size:12px;color:#aaa;flex-wrap:wrap">
            <span>📊 ${r.total} codes</span>
            <span style="color:#22cc77">🟢 ${r.active} actifs</span>
            <span style="color:#ffaa00">🟡 ${r.failing} dégradés</span>
            <span style="color:#ff5b5b">🔴 ${r.invalid} invalides</span>
          </div>
        </header>

        <div class="ax-vault-search-row" style="padding-bottom:12px;transition:padding 200ms ease">
          <input type="text" id="ax-vault-search" aria-label="Chercher un service dans le coffre" value="${d(S)}" placeholder="🔍 Chercher un service..."
            style="width:100%;padding:12px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;color:#fff;font-size:15px;box-sizing:border-box;-webkit-appearance:none;min-height:44px">
        </div>
      </div>

      <div style="height:14px"></div>

      ${r.total===0?`
      <section id="ax-vault-empty-rescue" style="background:linear-gradient(135deg,rgba(255,91,91,0.12),rgba(232,184,48,0.08));border:1px solid rgba(255,91,91,0.4);border-radius:14px;padding:14px;margin-bottom:14px">
        <h3 style="margin:0 0 6px;font-size:14px;color:#ff5b5b;font-weight:700">🆘 Coffre vide — Restauration possible</h3>
        <p style="margin:0 0 10px;color:rgba(255,255,255,0.78);font-size:12.5px;line-height:1.45">Apex peut tenter de récupérer tes clés depuis 4 sources : Firebase backup chiffré, IndexedDB shadow, alias localStorage, pattern detection.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button id="ax-vault-rescue-fb" style="padding:10px 16px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px;min-height:40px">🔓 Restaurer depuis Firebase</button>
          <button id="ax-vault-rescue-all" style="padding:10px 16px;background:rgba(106,138,255,0.15);color:#6a8aff;border:1px solid rgba(106,138,255,0.3);border-radius:10px;cursor:pointer;font-size:13px;min-height:40px">🔄 Scanner toutes sources</button>
        </div>
        <div id="ax-vault-rescue-result" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.7)"></div>
      </section>
      `:""}

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

      <button id="ax-vault-fab" class="ax-vault-fab" type="button" aria-label="Tester toutes les clés" title="Tester toutes les clés">🔄</button>
      <div id="ax-vault-modal-root"></div>
    </div>
  `),A(e),E(e),W(e),b.info("feature-vault",`rendered (${r.total} entries)`)}function W(e){const a=e.querySelector(".ax-vault-page"),t=e.querySelector("#ax-vault-fab");if(!a)return;let r=0,i=0;const o=()=>{i||(i=requestAnimationFrame(()=>{i=0;const g=window.scrollY||document.documentElement.scrollTop||0;g!==r&&(r=g,g>80?a.classList.add("ax-vault-scrolled"):a.classList.remove("ax-vault-scrolled"))}))};s?s.bind(window,"scroll",o,{passive:!0}):window.addEventListener("scroll",o,{passive:!0}),o(),t&&s&&s.bind(t,"click",()=>{u.tap(),e.querySelector("#ax-vault-test-all")?.click()})}function A(e){const a=e.querySelector("#ax-vault-categories");if(!a)return;if(F().total===0&&!a.dataset.axInitialized){a.dataset.axInitialized="1";const r=B(a,"vault-cards");setTimeout(()=>{r(),A(e)},250);return}a.innerHTML=h.map(r=>{const i=P(r,S);if(i.length===0&&r.id!=="identity")return"";const o=i.length>0;return`
      <details class="ax-cat" data-cat-id="${d(r.id)}" ${o?"open":""}
        style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;overflow:hidden">
        <summary style="padding:14px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-weight:600;list-style:none;-webkit-tap-highlight-color:transparent;min-height:44px">
          <span>${d(r.label)} <span style="color:#888;font-weight:400;font-size:13px">(${i.length})</span></span>
          <span class="ax-chevron" style="color:#888;transition:transform 200ms ease-out">▼</span>
        </summary>
        <div style="padding:0 14px 14px;display:grid;grid-template-columns:repeat(auto-fill, minmax(280px,1fr));gap:10px">
          ${i.map(g=>J(g)).join("")}
          ${i.length===0?`
            <div style="padding:20px;color:#666;text-align:center;grid-column:1/-1;font-size:13px">
              Aucun code dans cette catégorie<br>
              <button data-action="add-to-cat" data-cat-id="${d(r.id)}"
                style="margin-top:10px;padding:8px 14px;background:rgba(201,162,39,0.1);color:#c9a227;border:1px solid rgba(201,162,39,0.3);border-radius:8px;cursor:pointer;font-size:12px;min-height:36px">
                + Ajouter ${d(r.label)}
              </button>
            </div>
          `:""}
        </div>
      </details>
    `}).join("")}function E(e){const a=e.querySelector("#ax-vault-search");if(a){let n=null;s.bind(a,"input",()=>{n&&clearTimeout(n),n=setTimeout(()=>{S=a.value.trim(),A(e),T(e)},240)})}const t=e.querySelector("#ax-vault-add-manual");t&&s&&s.bind(t,"click",()=>{u.tap(),j(e)});const r=e.querySelector("#ax-vault-test-all");r&&s&&s.bind(r,"click",()=>{(async()=>{u.tap(),l.info("Test de toutes les clés en cours…");try{const n=await m.healthCheckAll();l.success(`✅ ${n.tested} testées · ${n.recovered} récupérées · ${n.stillDown} HS`),v(e)}catch(n){b.warn("feature-vault","testAll failed",{err:n}),l.error("Erreur pendant le test global")}})()});const i=e.querySelector("#ax-vault-rescue-fb");i&&s&&s.bind(i,"click",()=>{(async()=>{u.tap();const n=e.querySelector("#ax-vault-rescue-result");n&&(n.innerHTML="⏳ Lecture Firebase backup chiffré…");try{const{vaultFirebaseBackup:x}=await $(async()=>{const{vaultFirebaseBackup:f}=await import("./vault-firebase-backup-Bnhk7pYp.js");return{vaultFirebaseBackup:f}},__vite__mapDeps([0,1,2,3,4]),import.meta.url),c=await x.restoreAllFromFirebaseBackup();n&&(n.innerHTML=`<div style="padding:8px;background:rgba(34,204,119,.1);color:#22cc77;border-radius:8px">🔓 ${c.restored} clés restaurées · ${c.failed} échouées · ${c.skipped} ignorées</div>`),c.restored>0?(l.success(`🔓 ${c.restored} clés restaurées depuis Firebase backup`),u.success(),setTimeout(()=>v(e),600)):l.info("Aucune clé trouvée dans Firebase backup")}catch(x){b.warn("feature-vault","rescueFb failed",{err:x}),n&&(n.innerHTML=`<div style="padding:8px;background:rgba(255,88,88,.1);color:#ff5858;border-radius:8px">⚠ ${d(String(x).slice(0,120))}</div>`),l.error("Erreur lecture Firebase backup"),u.error()}})()});const o=e.querySelector("#ax-vault-rescue-all");o&&s&&s.bind(o,"click",()=>{(async()=>{u.tap();const n=e.querySelector("#ax-vault-rescue-result");n&&(n.innerHTML="⏳ Scan 4 sources : alias, IDB, Firebase, pattern…");try{const{autoRestoreCredentials:x}=await $(async()=>{const{autoRestoreCredentials:f}=await import("./auto-restore-credentials-Cc-ijiFv.js");return{autoRestoreCredentials:f}},__vite__mapDeps([1,2,3,4]),import.meta.url),c=await x.restoreAutomatically();n&&(n.innerHTML=`<div style="padding:8px;background:rgba(34,204,119,.1);color:#22cc77;border-radius:8px">🔓 ${c.restored} restaurées · ${c.failed} échouées</div>`),c.restored>0?(l.success(`🔓 ${c.restored} clés restaurées (4 sources)`),u.success(),setTimeout(()=>v(e),600)):l.info("Aucune clé trouvable dans les 4 sources. Colle une clé manuellement ci-dessous.")}catch(x){b.warn("feature-vault","rescueAll failed",{err:x}),n&&(n.innerHTML=`<div style="padding:8px;background:rgba(255,88,88,.1);color:#ff5858;border-radius:8px">⚠ ${d(String(x).slice(0,120))}</div>`),l.error("Erreur scan multi-sources"),u.error()}})()});const g=e.querySelector("#ax-vault-paste-btn");g&&s&&s.bind(g,"click",()=>{(async()=>{u.tap();const n=e.querySelector("#ax-vault-paste"),x=e.querySelector("#ax-vault-paste-result");if(!n||!x)return;const c=await V(n.value);if(c.ok){u.success(),l.success(`✅ ${c.pattern_name} stocké`),x.innerHTML=`<div style="padding:8px;background:rgba(34,204,119,.1);color:#22cc77;border-radius:8px">✅ ${d(c.pattern_name)} → ${d(c.storage_key)}</div>`,n.value="";const f=w(n.value.trim());if(f){const K=f.storageKey.replace(/^(ax_|apex_v13_)/,"").replace(/_(?:key|token|pat|sk|pk|id|secret)$/,"");try{await m.addKey(K,n.value.trim())}catch{}}v(e)}else u.error(),l.error(c.reason),x.innerHTML=`<div style="padding:8px;background:rgba(255,88,88,.1);color:#ff5858;border-radius:8px">⚠ ${d(c.reason)}</div>`})()});const p=e.querySelector("#ax-vault-export");p&&s&&s.bind(p,"click",()=>{u.tap();const n=Y(U()),x=new Blob([n],{type:"application/json"}),c=URL.createObjectURL(x),f=document.createElement("a");f.href=c,f.download=`apex-vault-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(f),f.click(),document.body.removeChild(f),URL.revokeObjectURL(c),l.success("Coffre exporté (chiffré)")}),T(e)}function T(e){e.querySelectorAll('[data-action="test"]').forEach(a=>{s.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.credId??"";Q(e,r,a)})}),e.querySelectorAll('[data-action="recharge"]').forEach(a=>{s.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.rechargeUrl??"",i=a.dataset.service??"";Z(r,i)})}),e.querySelectorAll('[data-action="discover-links"]').forEach(a=>{s.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.service??"";ee(e,r,a)})}),e.querySelectorAll('[data-action="edit"]').forEach(a=>{s.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.credId??"";ae(e,r)})}),e.querySelectorAll('[data-action="delete"]').forEach(a=>{s.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.credId??"";te(e,r)})}),e.querySelectorAll('[data-action="add-to-cat"]').forEach(a=>{s.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.catId??"";j(e,r)})})}async function Q(e,a,t){if(!a)return;u.tap();const r=t.textContent;t.textContent="⏳ Test…",t.setAttribute("disabled","true");try{const i=await m.testKey(a);i.ok?(u.success(),l.success(`✅ Active (${i.latencyMs}ms)`)):(u.error(),l.error(`❌ ${i.reason??"Test échoué"}`)),v(e)}catch(i){b.warn("feature-vault","testKey failed",{err:i}),u.error(),l.error("Erreur pendant le test"),t.textContent=r,t.removeAttribute("disabled")}}function Z(e,a){if(u.tap(),!e){l.warn(`Aucune page recharge connue pour ${a}`);return}try{window.open(e,"_blank","noopener,noreferrer")}catch(t){b.warn("feature-vault","recharge open failed",{err:t}),l.error("Impossible d'ouvrir le lien")}}async function ee(e,a,t){if(!a)return;u.tap();const r=t.textContent;t.textContent="⏳ Recherche…",t.setAttribute("disabled","true");try{const i=await D.discover(a,{force:!0}),o=[];i.login&&o.push("login"),i.dashboard&&o.push("dashboard"),i.billing&&o.push("billing"),i.api_keys&&o.push("api_keys"),i.usage&&o.push("usage"),i.docs&&o.push("docs"),i.password_reset&&o.push("reset_pw"),i.account_settings&&o.push("settings"),i.support&&o.push("support"),i.status_page&&o.push("status"),i.alive&&o.length>0?(u.success(),l.success(`🔗 ${o.length} liens trouvés (${i.source}) : ${o.join(", ")}`)):(u.error(),l.warn(`Aucun lien validé pour ${a} — réessaie plus tard`)),v(e)}catch(i){b.warn("feature-vault","discoverLinks failed",{err:i}),u.error(),l.error("Erreur pendant la recherche de liens")}finally{t.textContent=r,t.removeAttribute("disabled")}}function te(e,a){if(a&&(u.tap(),!!window.confirm("Supprimer cette clé définitivement ? Elle sera retirée du Coffre + ne sera plus restaurée auto.")))try{m.removeKey(a),u.success(),l.success("Clé supprimée définitivement ✓"),v(e)}catch(t){b.warn("feature-vault","delete failed",{err:t}),u.error(),l.error("Suppression échouée")}}function C(e){let a=e.querySelector("#ax-vault-modal-root");return a||(a=document.createElement("div"),a.id="ax-vault-modal-root",e.appendChild(a)),a}function y(e){const a=C(e);a.innerHTML=""}function j(e,a){const t=C(e),r=h.filter(p=>p.id!=="other").map(p=>`<option value="${d(p.id)}" ${a===p.id?"selected":""}>${d(p.label)}</option>`).join("");t.innerHTML=`
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
          <input type="text" id="ax-vault-add-service" aria-label="Nom du service" placeholder="anthropic"
            style="width:100%;margin-top:4px;padding:10px;background:rgba(255,255,255,0.04);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:8px;font-size:14px;min-height:44px;box-sizing:border-box;-webkit-appearance:none">
        </label>
        <label style="display:block;margin-bottom:10px;font-size:13px;color:rgba(255,255,255,0.7)">
          Alias (optionnel)
          <input type="text" id="ax-vault-add-alias" aria-label="Alias optionnel pour ce service" placeholder="perso, client X..."
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
  `,(()=>{const p=t.querySelector("#ax-vault-modal-close");p&&s&&s.bind(p,"click",()=>y(e))})();const i=t.querySelector('[role="dialog"]');i&&s&&s.bind(i,"click",p=>{p.target===i&&y(e)});const o=t.querySelector("#ax-vault-add-detect");o&&s&&s.bind(o,"click",()=>{(async()=>{u.tap();const p=t.querySelector("#ax-vault-add-value");if(!p)return;const n=w(p.value.trim());if(!n){l.warn("Aucun pattern reconnu");return}if(n.category==="forbidden"){l.error("🚨 Type interdit");return}const x=t.querySelector("#ax-vault-add-service"),c=t.querySelector("#ax-vault-add-cat");if(x){const f=n.storageKey.replace(/^(ax_|apex_v13_)/,"").replace(/_(?:key|token|pat|sk|pk|id|secret)$/,"");x.value=f}c&&(c.value=L(x?.value??"",n.category)),l.success(`Détecté: ${n.name}`)})()});const g=t.querySelector("#ax-vault-add-save");g&&s&&s.bind(g,"click",()=>{(async()=>{u.tap();const p=t.querySelector("#ax-vault-add-service")?.value.trim()??"",n=t.querySelector("#ax-vault-add-alias")?.value.trim()??"",x=t.querySelector("#ax-vault-add-value")?.value.trim()??"";if(!p||!x){l.warn("Service et valeur requis");return}try{const c={};n&&(c.alias=n),await m.addKey(p,x,c),l.success(`✅ Clé ${p} chiffrée + sauvegardée`),y(e),v(e)}catch(c){b.warn("feature-vault","add manual failed",{err:c}),l.error("Erreur pendant la sauvegarde")}})()})}function ae(e,a){const t=C(e),r=m.listAll(!0).find(o=>o.id===a);if(!r){l.error("Clé introuvable");return}t.innerHTML=`
    <div role="dialog" aria-modal="true" aria-label="Modifier une clé"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">
      <div style="background:#0e0e1c;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;max-width:440px;width:100%">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <h2 style="margin:0;font-size:18px;color:#e8b830">✏️ Modifier ${d(r.service)}</h2>
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
          <input type="text" id="ax-vault-edit-alias" aria-label="Alias optionnel" value="${d(r.alias??"")}"
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
  `,(()=>{const o=t.querySelector("#ax-vault-modal-close");o&&s&&s.bind(o,"click",()=>y(e))})(),(()=>{const o=t.querySelector("#ax-vault-edit-cancel");o&&s&&s.bind(o,"click",()=>y(e))})();const i=t.querySelector("#ax-vault-edit-save");i&&s&&s.bind(i,"click",()=>{(async()=>{u.tap();const o=t.querySelector("#ax-vault-edit-value")?.value.trim()??"",g=t.querySelector("#ax-vault-edit-alias")?.value.trim()??"";if(!o){l.warn("Valeur requise");return}try{m.markInvalid(a,"replaced via edit");const p={};g&&(p.alias=g),await m.addKey(r.service,o,p),l.success("✅ Clé mise à jour"),y(e),v(e)}catch(p){b.warn("feature-vault","edit save failed",{err:p}),l.error("Erreur pendant la modification")}})()})}export{h as CATEGORIES,V as autoDetectAndStore,I as buildCredentialDisplays,L as classifyService,F as computeStats,ve as dispose,d as escapeHtml,Y as exportVaultJson,me as filterVaultEntries,q as formatRelativeTime,P as getCredentialsForCategory,U as listVaultEntries,ye as removeCredential,v as render,J as renderCredentialCard};
