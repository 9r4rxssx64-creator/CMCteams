const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./vault-firebase-backup-CQFMMrbF.js","./apex-kb-CvTWOkmJ.js","./monitoring-3uBGKGRH.js","./credential-patterns-qcw7Brjr.js","./multi-source-analyze-BQrgAPat.js"])))=>i.map(i=>d[i]);
import{v as A,_ as L}from"./apex-kb-CvTWOkmJ.js";import{c as P}from"./listener-cleanup-Y2rGGxxX.js";import{l as v}from"./monitoring-3uBGKGRH.js";import{s as I,a as O}from"../core/main-BG5A3meL.js";import{autoDiscoverLinks as U}from"./auto-discover-links-yDcQbItV.js";import{detectCredential as z,CREDENTIAL_PATTERNS as H}from"./credential-patterns-qcw7Brjr.js";import{c as N}from"./csp-style-helper-BisGRi53.js";import{g as V}from"./apex-tools-dispatch-BAvAqlxB.js";import{g as W}from"./generic-secrets-O8ZEnTiu.js";import{l as K}from"./multi-source-analyze-BQrgAPat.js";import{multiKeyVault as k}from"./multi-key-vault-D-Bmd2kM.js";import{haptic as c}from"./haptic-CQFg2PXZ.js";import{toast as l}from"./toast-ClsF1KRZ.js";import"./apex-tools-registry-60WN0GJG.js";import"./voice-DCrB8Pzx.js";let n=null;function Se(){n?.cleanup(),n=null}function p(e){return e.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]??a)}const C=[{id:"ai",label:"🤖 IA & LLM",serviceMatchers:["anthropic","openai","groq","google","gemini","openrouter","cohere","mistral","perplexity","deepseek","xai","elevenlabs","replicate","huggingface","fireworks","togetherai","deepl"],patternCategories:["ai"]},{id:"finance",label:"💳 Paiements & Finance",serviceMatchers:["stripe","paypal","revolut","wise","lydia","n26","boursorama","fortuneo","ing","socgen","bnp","credit_agricole","credit_mutuel","banque_postale","lbp","bpce","shopify"],patternCategories:["finance"]},{id:"devops",label:"🛠 DevOps & Code",serviceMatchers:["github","gitlab","cloudflare","vercel","netlify","railway","aws","heroku","sentry","npm"],patternCategories:["devops"]},{id:"comms",label:"📨 Communications",serviceMatchers:["telegram","discord","slack","brevo","resend","twilio","sendgrid","mailchimp","whatsapp"],patternCategories:["comms"]},{id:"social",label:"🌐 Réseaux sociaux",serviceMatchers:["facebook","instagram","tiktok","youtube","twitter","linkedin"],patternCategories:[]},{id:"storage",label:"☁️ Stockage & Cloud",serviceMatchers:["firebase","supabase","airtable","notion","dropbox","pinecone","weaviate"],patternCategories:["storage"]},{id:"ecommerce",label:"🛒 E-commerce",serviceMatchers:["shopify","stripe_connect","paypal_business"],patternCategories:[]},{id:"crypto",label:"₿ Crypto",serviceMatchers:["coinbase","binance","crypto_com","kraken"],patternCategories:[]},{id:"identity",label:"🆔 Identité Kevin",serviceMatchers:["kevin","iban","siret","vat","bic","apple","microsoft"],patternCategories:["identity"]},{id:"other",label:"📦 Autres",serviceMatchers:[],patternCategories:["saas"]}];function D(e,a){const t=e.toLowerCase();let r=null;for(const i of C)if(i.id!=="other")for(const o of i.serviceMatchers)t.includes(o)&&(!r||o.length>r.matchLen)&&(r={catId:i.id,matchLen:o.length});if(r)return r.catId;if(a){for(const i of C)if(i.patternCategories.includes(a))return i.id}return"other"}function Y(){return H.filter(e=>e.category!=="forbidden").map(e=>{const a=A.getKeyStatus(e.storageKey),t=(()=>{try{return localStorage.getItem(e.storageKey)??""}catch{return""}})(),r=t&&t.length>8&&!t.startsWith("AXENC1:")?A.maskKey(t):t.startsWith("AXENC1:")?"🔒 chiffré":"";return{pattern:e,status:a,masked:r}})}function Ce(e,a){return e.filter(t=>{if(a.category&&t.pattern.category!==a.category||a.configuredOnly&&t.status==="empty")return!1;if(a.query){const r=a.query.toLowerCase();if(!(t.pattern.name.toLowerCase().includes(r)||t.pattern.storageKey.toLowerCase().includes(r)))return!1}return!0})}function _(){const e=[];let a=[];try{a=k.listAll(!0)}catch(t){v.warn("feature-vault","multiKeyVault.listAll failed",{err:t})}for(const t of a){const r=K.get(t.service),i=H.find(d=>d.storageKey.includes(t.service)),o={id:t.id,service:t.service,serviceName:r?.name??X(t.service),category:D(t.service,i?.category),status:t.status,source:"multi-key"};t.alias!==void 0&&(o.alias=t.alias),t.addedAt!==void 0&&(o.addedAt=t.addedAt),t.lastTestedAt!==void 0&&(o.lastTestedAt=t.lastTestedAt);const g=K.getRechargeLink(t.service);g&&(o.rechargeUrl=g),e.push(o)}return e}function B(){const e=_(),a={total:e.length,active:0,failing:0,invalid:0};for(const t of e)t.status==="active"?a.active+=1:t.status==="failing"||t.status==="rate-limited"?a.failing+=1:t.status==="invalid"&&(a.invalid+=1);return a}function J(e,a=""){const t=_(),r=a.trim().toLowerCase();return t.filter(i=>i.category!==e.id?!1:r?i.service.toLowerCase().includes(r)||i.serviceName.toLowerCase().includes(r)||(i.alias?.toLowerCase().includes(r)??!1):!0)}function X(e){return e.charAt(0).toUpperCase()+e.slice(1)}async function G(e){const a=e.trim();if(!a)return{ok:!1,reason:"Entrée vide"};const t=z(a);if(t&&t.category==="forbidden")return{ok:!1,reason:"🚨 Type interdit (cartes/seed phrases jamais stockées)"};if(t)try{const r=await A.encryptAuto(a);return localStorage.setItem(t.storageKey,r),{ok:!0,pattern_name:t.name,storage_key:t.storageKey}}catch(r){return v.warn("vault-feature","autoDetectAndStore failed",{err:r}),{ok:!1,reason:"Erreur chiffrement"}}if(a.length>=20){const r=await W.add(a,void 0,"Auto-détecté (pattern inconnu)");return r.ok?{ok:!0,generic:!0,pattern_name:"Secret générique",storage_key:"apex_v13_generic_secrets",generic_id:r.id}:{ok:!1,reason:r.reason}}return{ok:!1,reason:"Aucun pattern reconnu (trop court pour secret générique)"}}function $e(e){try{return localStorage.removeItem(e),!0}catch(a){return v.warn("vault-feature","remove failed",{err:a}),!1}}function E(e){const a={exported_at:new Date().toISOString(),version:1,entries:e.filter(t=>t.status!=="empty").map(t=>{const r=(()=>{try{return localStorage.getItem(t.pattern.storageKey)??""}catch{return""}})();return{storage_key:t.pattern.storageKey,name:t.pattern.name,value_encrypted:r}})};return JSON.stringify(a,null,2)}function Q(e){const a=Z[e.status]??"#888",t=ee[e.status]??"⚪",r=(e.preview??"").slice(0,4)+"••••••"+(e.preview??"").slice(-4),i=e.preview?r:"••••••",o=e.rechargeUrl??"",g=e.alias?`<span style="color:#888;font-size:11px">— ${p(e.alias)}</span>`:"",d=e.logoUrl?`<img src="${p(e.logoUrl)}" alt="" loading="lazy" decoding="async" style="width:24px;height:24px;border-radius:6px" onerror="this.style.display='none'">`:"",b=[];e.addedAt&&b.push(`Ajouté ${j(e.addedAt)}`),e.lastTestedAt&&b.push(`Testé ${j(e.lastTestedAt)}`);const y=b.length>0?`<div style="display:flex;gap:8px;font-size:11px;color:#888;margin-bottom:10px">${b.map(s=>`<span>${p(s)}</span>`).join("")}</div>`:"";return`
    <div class="ax-cred-card" data-cred-id="${p(e.id)}" data-service="${p(e.service)}"
      style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;transition:all 200ms ease-out;position:relative;display:flex;flex-direction:column;gap:8px">
      <div style="position:absolute;top:14px;right:14px;width:10px;height:10px;border-radius:50%;background:${p(a)};box-shadow:0 0 8px ${p(a)}" title="${p(t)} ${p(e.status)}"></div>
      <div style="display:flex;align-items:center;gap:10px">
        ${d}
        <strong style="font-size:15px;color:#fff">${p(e.serviceName)}</strong>
        ${g}
      </div>
      <code style="display:block;padding:6px 10px;background:rgba(0,0,0,0.3);border-radius:6px;font-size:11px;color:#888;font-family:'SF Mono',Menlo,monospace;letter-spacing:1px">${p(i)}</code>
      ${y}
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button data-action="test" data-cred-id="${p(e.id)}"
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(34,204,119,0.1);color:#22cc77;border:1px solid rgba(34,204,119,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px">🔄 Test</button>
        <button data-action="recharge" data-service="${p(e.service)}" data-recharge-url="${p(o)}" ${o?"":"disabled"}
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(201,162,39,0.1);color:#c9a227;border:1px solid rgba(201,162,39,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px;${o?"":"opacity:0.4;cursor:not-allowed"}">💰 Recharger</button>
        <button data-action="discover-links" data-service="${p(e.service)}"
          title="Cherche login/dashboard/billing/api_keys/usage en autonomie"
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(74,158,255,0.1);color:#4a9eff;border:1px solid rgba(74,158,255,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px">🔍 Chercher liens</button>
        <button data-action="edit" data-cred-id="${p(e.id)}"
          style="padding:6px 10px;background:rgba(255,255,255,0.05);color:#aaa;border:1px solid rgba(255,255,255,0.1);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px">✏️</button>
        <button data-action="delete" data-cred-id="${p(e.id)}"
          style="padding:6px 10px;background:rgba(255,91,91,0.1);color:#ff5b5b;border:1px solid rgba(255,91,91,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px">🗑</button>
      </div>
    </div>
  `}const Z={active:"#22cc77",failing:"#ffaa00","rate-limited":"#ffaa00",invalid:"#ff5b5b",unknown:"#888"},ee={active:"🟢",failing:"🟡","rate-limited":"🟡",invalid:"🔴",unknown:"⚪"};function j(e){const a=Date.now()-e;if(a<0||!Number.isFinite(a))return"à l'instant";const t=Math.floor(a/6e4);if(t<1)return"à l'instant";if(t<60)return`il y a ${t}min`;const r=Math.floor(t/60);if(r<24)return`il y a ${r}h`;const i=Math.floor(r/24);return i<30?`il y a ${i}j`:`il y a ${Math.floor(i/30)} mois`}let q="";function h(e){if(n?.cleanup(),n=P("vault"),!I.get("isAdmin")){e.innerHTML=`<div style="padding:40px;text-align:center"><h2 style="color:#c9a227">🔒 Coffre admin</h2><p style="color:#a0a4c0">Cette section est réservée à l'admin Kevin.</p></div>`;return}const t=I.get("user")?.id??"anon";if(!V("admin.vault",e,t))return;const r=B();e.innerHTML=N.withNonce(`
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
          <input type="text" id="ax-vault-search" aria-label="Chercher un service dans le coffre" value="${p(q)}" placeholder="🔍 Chercher un service..."
            style="width:100%;padding:12px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;color:#fff;font-size:15px;box-sizing:border-box;-webkit-appearance:none;min-height:44px">
        </div>
      </div>

      <div style="height:14px"></div>

      ${r.total===0||r.invalid>0?`
      <section id="ax-vault-empty-rescue" style="background:linear-gradient(135deg,rgba(255,91,91,0.12),rgba(232,184,48,0.08));border:1px solid rgba(255,91,91,0.4);border-radius:14px;padding:14px;margin-bottom:14px">
        <h3 style="margin:0 0 6px;font-size:14px;color:#ff5b5b;font-weight:700">${r.total===0?"🆘 Coffre vide — Restauration possible":`🚨 ${r.invalid} clé(s) illisible(s) — récupération ou cleanup`}</h3>
        <p style="margin:0 0 10px;color:rgba(255,255,255,0.78);font-size:12.5px;line-height:1.45">${r.total===0?"Apex peut tenter de récupérer tes clés depuis 4 sources : Firebase backup chiffré, IndexedDB shadow, alias localStorage, pattern detection.":"Ces clés ont été chiffrées avec une passphrase historisée perdue (régression v13.3.86 fixée v13.3.88). Soit re-coller les clés une par une, soit supprimer les illisibles."}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button id="ax-vault-rescue-fb" data-action="rescue-firebase" style="padding:10px 16px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px;min-height:40px">🔓 Restaurer depuis Firebase</button>
          <button id="ax-vault-rescue-all" data-action="rescue-scan-all" style="padding:10px 16px;background:rgba(106,138,255,0.15);color:#6a8aff;border:1px solid rgba(106,138,255,0.3);border-radius:10px;cursor:pointer;font-size:13px;min-height:40px">🔄 Scanner toutes sources</button>
          ${r.invalid>0?`<button id="ax-vault-cleanup-invalid" data-action="cleanup-invalid" style="padding:10px 16px;background:rgba(255,91,91,0.15);color:#ff5b5b;border:1px solid rgba(255,91,91,0.4);border-radius:10px;cursor:pointer;font-size:13px;min-height:40px">🗑 Supprimer ${r.invalid} illisibles</button>`:""}
        </div>
        <div id="ax-vault-rescue-result" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.7)"></div>
      </section>
      `:""}

      <section style="background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));border:1px solid rgba(232,184,48,0.18);border-radius:14px;padding:14px;margin-bottom:14px">
        <h3 style="margin:0 0 8px;font-size:13px;color:#e8b830;text-transform:uppercase;letter-spacing:0.08em;font-weight:700">🔍 Auto-détection rapide</h3>
        <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0 0 10px">Colle ici n'importe quelle clé API, Apex la reconnaît + la range automatiquement.</p>
        <textarea id="ax-vault-paste" placeholder="Colle ta clé ici (sk-ant-..., AIzaSy..., re_...)" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
          style="width:100%;background:rgba(0,0,0,0.35);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;font-family:'SF Mono',Menlo,monospace;font-size:16px;min-height:60px;resize:vertical;box-sizing:border-box;-webkit-appearance:none;-webkit-touch-callout:default;-webkit-user-select:text;user-select:text"></textarea>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <button id="ax-vault-paste-clipboard-btn" type="button"
            style="padding:10px 16px;background:rgba(106,138,255,0.18);color:#6a8aff;border:1px solid rgba(106,138,255,0.35);border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;min-height:44px">📋 Coller du presse-papier</button>
          <button id="ax-vault-paste-btn" type="button"
            style="padding:10px 20px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;min-height:44px">🔍 Détecter & stocker</button>
        </div>
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
  `),T(e),ae(e),te(e),v.info("feature-vault",`rendered (${r.total} entries)`)}function te(e){const a=e.querySelector(".ax-vault-page"),t=e.querySelector("#ax-vault-fab");if(!a)return;let r=0,i=0;const o=()=>{i||(i=requestAnimationFrame(()=>{i=0;const g=window.scrollY||document.documentElement.scrollTop||0;g!==r&&(r=g,g>80?a.classList.add("ax-vault-scrolled"):a.classList.remove("ax-vault-scrolled"))}))};n?n.bind(window,"scroll",o,{passive:!0}):window.addEventListener("scroll",o,{passive:!0}),o(),t&&n&&n.bind(t,"click",()=>{c.tap(),e.querySelector("#ax-vault-test-all")?.click()})}function T(e){const a=e.querySelector("#ax-vault-categories");if(!a)return;if(B().total===0&&!a.dataset.axInitialized){a.dataset.axInitialized="1";const o=document.createElement("div");o.className="ax-skel-vault-wrapper",a.appendChild(o);const g=O(o,"vault-cards");setTimeout(()=>{g(),o.remove(),T(e)},250)}const r=C.map(o=>{const g=J(o,q);if(g.length===0&&o.id!=="identity")return"";const d=g.length>0;return`
      <details class="ax-cat" data-cat-id="${p(o.id)}" ${d?"open":""}
        style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;overflow:hidden">
        <summary style="padding:14px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-weight:600;list-style:none;-webkit-tap-highlight-color:transparent;min-height:44px">
          <span>${p(o.label)} <span style="color:#888;font-weight:400;font-size:13px">(${g.length})</span></span>
          <span class="ax-chevron" style="color:#888;transition:transform 200ms ease-out">▼</span>
        </summary>
        <div style="padding:0 14px 14px;display:grid;grid-template-columns:repeat(auto-fill, minmax(280px,1fr));gap:10px">
          ${g.map(b=>Q(b)).join("")}
          ${g.length===0?`
            <div style="padding:20px;color:#666;text-align:center;grid-column:1/-1;font-size:13px">
              Aucun code dans cette catégorie<br>
              <button data-action="add-to-cat" data-cat-id="${p(o.id)}"
                style="margin-top:10px;padding:8px 14px;background:rgba(201,162,39,0.1);color:#c9a227;border:1px solid rgba(201,162,39,0.3);border-radius:8px;cursor:pointer;font-size:12px;min-height:36px">
                + Ajouter ${p(o.label)}
              </button>
            </div>
          `:""}
        </div>
      </details>
    `}).join("");let i=a.querySelector(".ax-vault-cats-wrapper");i||(i=document.createElement("div"),i.className="ax-vault-cats-wrapper",a.appendChild(i)),i.innerHTML=r}function ae(e){const a=e.querySelector("#ax-vault-search");if(a){let s=null;n.bind(a,"input",()=>{s&&clearTimeout(s),s=setTimeout(()=>{q=a.value.trim(),T(e),F(e)},240)})}const t=e.querySelector("#ax-vault-add-manual");t&&n&&n.bind(t,"click",()=>{c.tap(),R(e)});const r=e.querySelector("#ax-vault-test-all");r&&n&&n.bind(r,"click",()=>{(async()=>{c.tap(),l.info("Test de toutes les clés en cours…");try{const s=await k.healthCheckAll();l.success(`✅ ${s.tested} testées · ${s.recovered} récupérées · ${s.stillDown} HS`),h(e)}catch(s){v.warn("feature-vault","testAll failed",{err:s}),l.error("Erreur pendant le test global")}})()});const i=e.querySelector("#ax-vault-rescue-fb");i&&n&&n.bind(i,"click",()=>{(async()=>{c.tap();const s=e.querySelector("#ax-vault-rescue-result");s&&(s.innerHTML="⏳ Lecture Firebase backup chiffré…");try{const{vaultFirebaseBackup:u}=await L(async()=>{const{vaultFirebaseBackup:f}=await import("./vault-firebase-backup-CQFMMrbF.js");return{vaultFirebaseBackup:f}},__vite__mapDeps([0,1,2,3,4]),import.meta.url),x=await u.restoreAllFromFirebaseBackup();s&&(s.innerHTML=`<div style="padding:8px;background:rgba(34,204,119,.1);color:#22cc77;border-radius:8px">🔓 ${x.restored} clés restaurées · ${x.failed} échouées · ${x.skipped} ignorées</div>`),x.restored>0?(l.success(`🔓 ${x.restored} clés restaurées depuis Firebase backup`),c.success(),setTimeout(()=>h(e),600)):l.info("Aucune clé trouvée dans Firebase backup")}catch(u){v.warn("feature-vault","rescueFb failed",{err:u}),s&&(s.innerHTML=`<div style="padding:8px;background:rgba(255,88,88,.1);color:#ff5858;border-radius:8px">⚠ ${p(String(u).slice(0,120))}</div>`),l.error("Erreur lecture Firebase backup"),c.error()}})()});const o=e.querySelector("#ax-vault-rescue-all");o&&n&&n.bind(o,"click",()=>{(async()=>{c.tap();const s=e.querySelector("#ax-vault-rescue-result");s&&(s.innerHTML="⏳ Scan 4 sources : alias, IDB, Firebase, pattern…");try{const{autoRestoreCredentials:u}=await L(async()=>{const{autoRestoreCredentials:f}=await import("./auto-restore-credentials-BbbU8UQG.js");return{autoRestoreCredentials:f}},__vite__mapDeps([1,2,3,4]),import.meta.url),x=await u.restoreAutomatically();s&&(s.innerHTML=`<div style="padding:8px;background:rgba(34,204,119,.1);color:#22cc77;border-radius:8px">🔓 ${x.restored} restaurées · ${x.failed} échouées</div>`),x.restored>0?(l.success(`🔓 ${x.restored} clés restaurées (4 sources)`),c.success(),setTimeout(()=>h(e),600)):l.info("Aucune clé trouvable dans les 4 sources. Colle une clé manuellement ci-dessous.")}catch(u){v.warn("feature-vault","rescueAll failed",{err:u}),s&&(s.innerHTML=`<div style="padding:8px;background:rgba(255,88,88,.1);color:#ff5858;border-radius:8px">⚠ ${p(String(u).slice(0,120))}</div>`),l.error("Erreur scan multi-sources"),c.error()}})()});const g=e.querySelector("#ax-vault-cleanup-invalid");g&&n&&n.bind(g,"click",()=>{(async()=>{c.tap();const s=e.querySelector("#ax-vault-rescue-result");if(confirm(`Supprimer définitivement toutes les clés illisibles (decrypt fail) ?

Ces clés sont chiffrées avec une passphrase perdue. Tu devras les recoller pour les retrouver.`)){s&&(s.innerHTML="⏳ Suppression des entrées illisibles…");try{const x=_().filter(m=>m.status==="invalid");let f=0;for(const m of x)try{if(m.id.startsWith("mkv_")||m.id.includes("_")){k.removeKey(m.id),f++;continue}const S=m.id.startsWith("ax_")||m.id.startsWith("apex_v13_")?m.id:`ax_${m.service}_key`;localStorage.removeItem(S);const $=indexedDB.open("apex_v13_vault_shadow",1);$.onsuccess=()=>{try{$.result.transaction("keys","readwrite").objectStore("keys").delete(S),$.result.close()}catch{}},f++}catch{}s&&(s.innerHTML=`<div style="padding:8px;background:rgba(34,204,119,.1);color:#22cc77;border-radius:8px">🗑 ${f} clé(s) illisibles supprimées. Recolle tes clés via "Détecter & stocker" ci-dessous.</div>`),l.success(`🗑 ${f} clés illisibles supprimées`),c.success(),setTimeout(()=>h(e),800)}catch(u){v.warn("feature-vault","cleanupInvalid failed",{err:u}),l.error("Erreur suppression"),c.error()}}})()});const d=e.querySelector("#ax-vault-paste-clipboard-btn");d&&n&&n.bind(d,"click",()=>{(async()=>{c.tap();const s=e.querySelector("#ax-vault-paste"),u=e.querySelector("#ax-vault-paste-result");if(s)try{if(!navigator.clipboard?.readText)throw new Error("Clipboard API non supportée");const x=await navigator.clipboard.readText();if(!x){u&&(u.innerHTML='<div style="padding:8px;background:rgba(240,192,32,.1);color:#f0c020;border-radius:8px">⚠ Presse-papier vide</div>');return}s.value=x,s.dispatchEvent(new Event("input",{bubbles:!0})),c.success(),l.success(`📋 ${x.length} caractères collés — clique "Détecter & stocker"`),u&&(u.innerHTML='<div style="padding:8px;background:rgba(106,138,255,.1);color:#6a8aff;border-radius:8px">📋 Collé — clique "Détecter & stocker" pour analyser</div>'),s.focus()}catch(x){const f=x instanceof Error?x.message:"unknown";l.error(`Clipboard refusé : ${f}. Utilise long-press → Coller manuellement.`),u&&(u.innerHTML='<div style="padding:8px;background:rgba(255,88,88,.1);color:#ff5858;border-radius:8px">⚠ Permission refusée. Long-press dans le champ → Coller.</div>')}})()});const b=e.querySelector("#ax-vault-paste-btn");b&&n&&n.bind(b,"click",()=>{(async()=>{c.tap();const s=e.querySelector("#ax-vault-paste"),u=e.querySelector("#ax-vault-paste-result");if(!s||!u)return;const x=s.value.trim();if(!x){u.innerHTML=`<div style="padding:8px;background:rgba(240,192,32,.1);color:#f0c020;border-radius:8px">⚠ Colle quelque chose d'abord</div>`;return}const f=await G(x);if(f.ok){c.success(),l.success(`✅ ${f.pattern_name} stocké`),u.innerHTML=`<div style="padding:8px;background:rgba(34,204,119,.1);color:#22cc77;border-radius:8px">✅ ${p(f.pattern_name)} → ${p(f.storage_key)}</div>`;const m=z(x);if(m){const S=m.storageKey.replace(/^(ax_|apex_v13_)/,"").replace(/_(?:key|token|pat|sk|pk|id|secret)$/,"");try{await k.addKey(S,x)}catch{}}s.value="",h(e)}else c.error(),l.error(f.reason),u.innerHTML=`<div style="padding:8px;background:rgba(255,88,88,.1);color:#ff5858;border-radius:8px">⚠ ${p(f.reason)}</div>`})()});const y=e.querySelector("#ax-vault-export");y&&n&&n.bind(y,"click",()=>{c.tap();const s=E(Y()),u=new Blob([s],{type:"application/json"}),x=URL.createObjectURL(u),f=document.createElement("a");f.href=x,f.download=`apex-vault-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(f),f.click(),document.body.removeChild(f),URL.revokeObjectURL(x),l.success("Coffre exporté (chiffré)")}),F(e)}function F(e){e.querySelectorAll('[data-action="test"]').forEach(a=>{n.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.credId??"";re(e,r,a)})}),e.querySelectorAll('[data-action="recharge"]').forEach(a=>{n.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.rechargeUrl??"",i=a.dataset.service??"";ie(r,i)})}),e.querySelectorAll('[data-action="discover-links"]').forEach(a=>{n.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.service??"";oe(e,r,a)})}),e.querySelectorAll('[data-action="edit"]').forEach(a=>{n.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.credId??"";ne(e,r)})}),e.querySelectorAll('[data-action="delete"]').forEach(a=>{n.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.credId??"";se(e,r)})}),e.querySelectorAll('[data-action="add-to-cat"]').forEach(a=>{n.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.catId??"";R(e,r)})})}async function re(e,a,t){if(!a)return;c.tap();const r=t.textContent;t.textContent="⏳ Test…",t.setAttribute("disabled","true");try{const i=await k.testKey(a);i.ok?(c.success(),l.success(`✅ Active (${i.latencyMs}ms)`)):(c.error(),l.error(`❌ ${i.reason??"Test échoué"}`)),h(e)}catch(i){v.warn("feature-vault","testKey failed",{err:i}),c.error(),l.error("Erreur pendant le test"),t.textContent=r,t.removeAttribute("disabled")}}function ie(e,a){if(c.tap(),!e){l.warn(`Aucune page recharge connue pour ${a}`);return}try{window.open(e,"_blank","noopener,noreferrer")}catch(t){v.warn("feature-vault","recharge open failed",{err:t}),l.error("Impossible d'ouvrir le lien")}}async function oe(e,a,t){if(!a)return;c.tap();const r=t.textContent;t.textContent="⏳ Recherche…",t.setAttribute("disabled","true");try{const i=await U.discover(a,{force:!0}),o=[];i.login&&o.push("login"),i.dashboard&&o.push("dashboard"),i.billing&&o.push("billing"),i.api_keys&&o.push("api_keys"),i.usage&&o.push("usage"),i.docs&&o.push("docs"),i.password_reset&&o.push("reset_pw"),i.account_settings&&o.push("settings"),i.support&&o.push("support"),i.status_page&&o.push("status"),i.alive&&o.length>0?(c.success(),l.success(`🔗 ${o.length} liens trouvés (${i.source}) : ${o.join(", ")}`)):(c.error(),l.warn(`Aucun lien validé pour ${a} — réessaie plus tard`)),h(e)}catch(i){v.warn("feature-vault","discoverLinks failed",{err:i}),c.error(),l.error("Erreur pendant la recherche de liens")}finally{t.textContent=r,t.removeAttribute("disabled")}}function se(e,a){if(a&&(c.tap(),!!window.confirm("Supprimer cette clé définitivement ? Elle sera retirée du Coffre + ne sera plus restaurée auto.")))try{k.removeKey(a),c.success(),l.success("Clé supprimée définitivement ✓"),h(e)}catch(t){v.warn("feature-vault","delete failed",{err:t}),c.error(),l.error("Suppression échouée")}}function M(e){let a=e.querySelector("#ax-vault-modal-root");return a||(a=document.createElement("div"),a.id="ax-vault-modal-root",e.appendChild(a)),a}function w(e){const a=M(e);a.innerHTML=""}function R(e,a){const t=M(e),r=C.filter(d=>d.id!=="other").map(d=>`<option value="${p(d.id)}" ${a===d.id?"selected":""}>${p(d.label)}</option>`).join("");t.innerHTML=`
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
  `,(()=>{const d=t.querySelector("#ax-vault-modal-close");d&&n&&n.bind(d,"click",()=>w(e))})();const i=t.querySelector('[role="dialog"]');i&&n&&n.bind(i,"click",d=>{d.target===i&&w(e)});const o=t.querySelector("#ax-vault-add-detect");o&&n&&n.bind(o,"click",()=>{(async()=>{c.tap();const d=t.querySelector("#ax-vault-add-value");if(!d)return;const b=z(d.value.trim());if(!b){l.warn("Aucun pattern reconnu");return}if(b.category==="forbidden"){l.error("🚨 Type interdit");return}const y=t.querySelector("#ax-vault-add-service"),s=t.querySelector("#ax-vault-add-cat");if(y){const u=b.storageKey.replace(/^(ax_|apex_v13_)/,"").replace(/_(?:key|token|pat|sk|pk|id|secret)$/,"");y.value=u}s&&(s.value=D(y?.value??"",b.category)),l.success(`Détecté: ${b.name}`)})()});const g=t.querySelector("#ax-vault-add-save");g&&n&&n.bind(g,"click",()=>{(async()=>{c.tap();const d=t.querySelector("#ax-vault-add-service")?.value.trim()??"",b=t.querySelector("#ax-vault-add-alias")?.value.trim()??"",y=t.querySelector("#ax-vault-add-value")?.value.trim()??"";if(!d||!y){l.warn("Service et valeur requis");return}try{const s={};b&&(s.alias=b),await k.addKey(d,y,s),l.success(`✅ Clé ${d} chiffrée + sauvegardée`),w(e),h(e)}catch(s){v.warn("feature-vault","add manual failed",{err:s}),l.error("Erreur pendant la sauvegarde")}})()})}function ne(e,a){const t=M(e),r=k.listAll(!0).find(o=>o.id===a);if(!r){l.error("Clé introuvable");return}t.innerHTML=`
    <div role="dialog" aria-modal="true" aria-label="Modifier une clé"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">
      <div style="background:#0e0e1c;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;max-width:440px;width:100%">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <h2 style="margin:0;font-size:18px;color:#e8b830">✏️ Modifier ${p(r.service)}</h2>
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
          <input type="text" id="ax-vault-edit-alias" aria-label="Alias optionnel" value="${p(r.alias??"")}"
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
  `,(()=>{const o=t.querySelector("#ax-vault-modal-close");o&&n&&n.bind(o,"click",()=>w(e))})(),(()=>{const o=t.querySelector("#ax-vault-edit-cancel");o&&n&&n.bind(o,"click",()=>w(e))})();const i=t.querySelector("#ax-vault-edit-save");i&&n&&n.bind(i,"click",()=>{(async()=>{c.tap();const o=t.querySelector("#ax-vault-edit-value")?.value.trim()??"",g=t.querySelector("#ax-vault-edit-alias")?.value.trim()??"";if(!o){l.warn("Valeur requise");return}try{k.markInvalid(a,"replaced via edit");const d={};g&&(d.alias=g),await k.addKey(r.service,o,d),l.success("✅ Clé mise à jour"),w(e),h(e)}catch(d){v.warn("feature-vault","edit save failed",{err:d}),l.error("Erreur pendant la modification")}})()})}export{C as CATEGORIES,G as autoDetectAndStore,_ as buildCredentialDisplays,D as classifyService,B as computeStats,Se as dispose,p as escapeHtml,E as exportVaultJson,Ce as filterVaultEntries,j as formatRelativeTime,J as getCredentialsForCategory,Y as listVaultEntries,$e as removeCredential,h as render,Q as renderCredentialCard};
