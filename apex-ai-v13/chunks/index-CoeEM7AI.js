const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./vault-firebase-backup-DaMHru4m.js","./apex-kb-D1VtWFD9.js","./monitoring-D2lWYrYo.js","./multi-source-analyze-Bg1HHfSC.js","./credential-patterns-CLzI061R.js","./auth-B3RTUO4E.js"])))=>i.map(i=>d[i]);
import{v as B,_ as C}from"./apex-kb-D1VtWFD9.js";import{e as d}from"./escape-html-BlQj2yEF.js";import{c as X}from"./listener-cleanup-Y2rGGxxX.js";import{l as m,s as j}from"./monitoring-D2lWYrYo.js";import{autoDiscoverLinks as Y}from"./auto-discover-links-ChMe_PvY.js";import{detectCredential as R,CREDENTIAL_PATTERNS as V}from"./credential-patterns-CLzI061R.js";import{c as Z}from"./csp-style-helper-BisGRi53.js";import{g as ee}from"./apex-tools-dispatch-core-C_k5h2yM.js";import{g as te}from"./generic-secrets-kO0ksxSP.js";import{l as O}from"./multi-source-analyze-Bg1HHfSC.js";import{multiKeyVault as S}from"./multi-key-vault-BCAk9grQ.js";import{haptic as p}from"./haptic-CQFg2PXZ.js";import{s as ae}from"../core/main-B4DExc5S.js";import{toast as l}from"./toast-CRdbcLoc.js";import"./apex-tools-dispatch-skills-DOw4cI4G.js";import"./apex-tools-dispatch-data-DHUpGBCD.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-fNevKu6E.js";import"./apex-tools-misc-DBbScgMK.js";import"./apex-tools-registry-core-BMhHY4vU.js";import"./apex-tools-registry-skills-DRX4PPQ_.js";let n=null;function Ke(){n?.cleanup(),n=null}const L=[{id:"ai",label:"🤖 IA & LLM",serviceMatchers:["anthropic","openai","groq","google","gemini","openrouter","cohere","mistral","perplexity","deepseek","xai","elevenlabs","replicate","huggingface","fireworks","togetherai","deepl"],patternCategories:["ai"]},{id:"finance",label:"💳 Paiements & Finance",serviceMatchers:["stripe","paypal","revolut","wise","lydia","n26","boursorama","fortuneo","ing","socgen","bnp","credit_agricole","credit_mutuel","banque_postale","lbp","bpce","shopify"],patternCategories:["finance"]},{id:"devops",label:"🛠 DevOps & Code",serviceMatchers:["github","gitlab","cloudflare","vercel","netlify","railway","aws","heroku","sentry","npm"],patternCategories:["devops"]},{id:"comms",label:"📨 Communications",serviceMatchers:["telegram","discord","slack","brevo","resend","twilio","sendgrid","mailchimp","whatsapp"],patternCategories:["comms"]},{id:"social",label:"🌐 Réseaux sociaux",serviceMatchers:["facebook","instagram","tiktok","youtube","twitter","linkedin"],patternCategories:[]},{id:"storage",label:"☁️ Stockage & Cloud",serviceMatchers:["firebase","supabase","airtable","notion","dropbox","pinecone","weaviate"],patternCategories:["storage"]},{id:"ecommerce",label:"🛒 E-commerce",serviceMatchers:["shopify","stripe_connect","paypal_business"],patternCategories:[]},{id:"crypto",label:"₿ Crypto",serviceMatchers:["coinbase","binance","crypto_com","kraken"],patternCategories:[]},{id:"identity",label:"🆔 Identité Kevin",serviceMatchers:["kevin","iban","siret","vat","bic","apple","microsoft"],patternCategories:["identity"]},{id:"other",label:"📦 Autres",serviceMatchers:[],patternCategories:["saas"]}];function E(e,a){const t=e.toLowerCase();let r=null;for(const i of L)if(i.id!=="other")for(const o of i.serviceMatchers)t.includes(o)&&(!r||o.length>r.matchLen)&&(r={catId:i.id,matchLen:o.length});if(r)return r.catId;if(a){for(const i of L)if(i.patternCategories.includes(a))return i.id}return"other"}function I(){return V.filter(e=>e.category!=="forbidden").map(e=>{const a=B.getKeyStatus(e.storageKey),t=(()=>{try{return localStorage.getItem(e.storageKey)??""}catch{return""}})(),r=t&&t.length>8&&!t.startsWith("AXENC1:")?B.maskKey(t):t.startsWith("AXENC1:")?"🔒 chiffré":"";return{pattern:e,status:a,masked:r}})}function Fe(e,a){return e.filter(t=>{if(a.category&&t.pattern.category!==a.category||a.configuredOnly&&t.status==="empty")return!1;if(a.query){const r=a.query.toLowerCase();if(!(t.pattern.name.toLowerCase().includes(r)||t.pattern.storageKey.toLowerCase().includes(r)))return!1}return!0})}function D(){const e=[];let a=[];try{a=S.listAll(!0)}catch(t){m.warn("feature-vault","multiKeyVault.listAll failed",{err:t})}for(const t of a){const r=O.get(t.service),i=V.find(g=>g.storageKey.includes(t.service)),o={id:t.id,service:t.service,serviceName:r?.name??ie(t.service),category:E(t.service,i?.category),status:t.status,source:"multi-key"};t.alias!==void 0&&(o.alias=t.alias),t.addedAt!==void 0&&(o.addedAt=t.addedAt),t.lastTestedAt!==void 0&&(o.lastTestedAt=t.lastTestedAt);const b=O.getRechargeLink(t.service);b&&(o.rechargeUrl=b),e.push(o)}return e}function G(){const e=D(),a={total:e.length,active:0,failing:0,invalid:0};for(const t of e)t.status==="active"?a.active+=1:t.status==="failing"||t.status==="rate-limited"?a.failing+=1:t.status==="invalid"&&(a.invalid+=1);return a}function re(e,a=""){const t=D(),r=a.trim().toLowerCase();return t.filter(i=>i.category!==e.id?!1:r?i.service.toLowerCase().includes(r)||i.serviceName.toLowerCase().includes(r)||(i.alias?.toLowerCase().includes(r)??!1):!0)}function ie(e){return e.charAt(0).toUpperCase()+e.slice(1)}async function oe(e){const a=e.trim();if(!a)return{ok:!1,reason:"Entrée vide"};const t=R(a);if(t&&t.category==="forbidden")return{ok:!1,reason:"🚨 Type interdit (cartes/seed phrases jamais stockées)"};if(t)try{const r=await B.encryptAuto(a);return localStorage.setItem(t.storageKey,r),{ok:!0,pattern_name:t.name,storage_key:t.storageKey}}catch(r){return m.warn("vault-feature","autoDetectAndStore failed",{err:r}),{ok:!1,reason:"Erreur chiffrement"}}if(a.length>=20){const r=await te.add(a,void 0,"Auto-détecté (pattern inconnu)");return r.ok?{ok:!0,generic:!0,pattern_name:"Secret générique",storage_key:"apex_v13_generic_secrets",generic_id:r.id}:{ok:!1,reason:r.reason}}return{ok:!1,reason:"Aucun pattern reconnu (trop court pour secret générique)"}}function Pe(e){try{return localStorage.removeItem(e),!0}catch(a){return m.warn("vault-feature","remove failed",{err:a}),!1}}function U(e){const a={exported_at:new Date().toISOString(),version:1,entries:e.filter(t=>t.status!=="empty").map(t=>{const r=(()=>{try{return localStorage.getItem(t.pattern.storageKey)??""}catch{return""}})();return{storage_key:t.pattern.storageKey,name:t.pattern.name,value_encrypted:r}})};return JSON.stringify(a,null,2)}function se(e){const a=ne[e.status]??"var(--ax-text-muted)",t=le[e.status]??"⚪",r=(e.preview??"").slice(0,4)+"••••••"+(e.preview??"").slice(-4),i=e.preview?r:"••••••",o=e.rechargeUrl??"",b=e.alias?`<span style="color:var(--ax-text-muted);font-size:11px">— ${d(e.alias)}</span>`:"",g=e.logoUrl?`<img src="${d(e.logoUrl)}" alt="" loading="lazy" decoding="async" style="width:24px;height:24px;border-radius:6px" onerror="this.style.display='none'">`:"",v=[];e.addedAt&&v.push(`Ajouté ${H(e.addedAt)}`),e.lastTestedAt&&v.push(`Testé ${H(e.lastTestedAt)}`);const y=v.length>0?`<div style="display:flex;gap:8px;font-size:11px;color:var(--ax-text-muted);margin-bottom:10px">${v.map(h=>`<span>${d(h)}</span>`).join("")}</div>`:"";return`
    <div class="ax-cred-card" data-cred-id="${d(e.id)}" data-service="${d(e.service)}"
      style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;transition:all 200ms ease-out;position:relative;display:flex;flex-direction:column;gap:8px">
      <div style="position:absolute;top:14px;right:14px;width:10px;height:10px;border-radius:50%;background:${d(a)};box-shadow:0 0 8px ${d(a)}" title="${d(t)} ${d(e.status)}"></div>
      <div class="ax-gs-120">
        ${g}
        <strong style="font-size:15px;color:#fff">${d(e.serviceName)}</strong>
        ${b}
      </div>
      <code style="display:block;padding:6px 10px;background:rgba(0,0,0,0.3);border-radius:6px;font-size:11px;color:var(--ax-text-muted);font-family:'SF Mono',Menlo,monospace;letter-spacing:1px">${d(i)}</code>
      ${y}
      <div class="ax-gs-20">
        <button data-action="test" data-cred-id="${d(e.id)}" aria-label="Tester la clé ${d(e.service)}"
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(34,204,119,0.1);color:var(--ax-green);border:1px solid rgba(34,204,119,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:44px">🔄 Test</button>
        <button data-action="recharge" data-service="${d(e.service)}" data-recharge-url="${d(o)}" ${o?"":"disabled"} aria-label="Recharger ${d(e.service)}"
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(201,162,39,0.1);color:var(--ax-gold-deep);border:1px solid rgba(201,162,39,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:44px;${o?"":"opacity:0.4;cursor:not-allowed"}">💰 Recharger</button>
        <button data-action="discover-links" data-service="${d(e.service)}" aria-label="Chercher les liens de ${d(e.service)}"
          title="Cherche login/dashboard/billing/api_keys/usage en autonomie"
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(74,158,255,0.1);color:var(--ax-blue-bright);border:1px solid rgba(74,158,255,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:44px">🔍 Chercher liens</button>
        <button data-action="edit" data-cred-id="${d(e.id)}" aria-label="Modifier la clé ${d(e.service)}" title="Modifier"
          style="min-width:44px;padding:6px 10px;background:rgba(255,255,255,0.05);color:var(--ax-text-dim);border:1px solid rgba(255,255,255,0.1);border-radius:6px;cursor:pointer;font-size:11px;min-height:44px">✏️</button>
        <button data-action="delete" data-cred-id="${d(e.id)}" aria-label="Supprimer la clé ${d(e.service)}" title="Supprimer"
          style="min-width:44px;padding:6px 10px;background:rgba(255,91,91,0.1);color:var(--ax-error);border:1px solid rgba(255,91,91,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:44px">🗑</button>
      </div>
    </div>
  `}const ne={active:"var(--ax-green)",failing:"var(--ax-warning)","rate-limited":"var(--ax-warning)",invalid:"var(--ax-error)",unknown:"var(--ax-text-muted)"},le={active:"🟢",failing:"🟡","rate-limited":"🟡",invalid:"🔴",unknown:"⚪"};function H(e){const a=Date.now()-e;if(a<0||!Number.isFinite(a))return"à l'instant";const t=Math.floor(a/6e4);if(t<1)return"à l'instant";if(t<60)return`il y a ${t}min`;const r=Math.floor(t/60);if(r<24)return`il y a ${r}h`;const i=Math.floor(r/24);return i<30?`il y a ${i}j`:`il y a ${Math.floor(i/30)} mois`}let K="";function w(e){if(n?.cleanup(),n=X("vault"),!j.get("isAdmin")){e.innerHTML=`<div style="padding:40px;text-align:center"><h2 style="color:var(--ax-gold-deep)">🔒 Coffre admin</h2><p style="color:var(--ax-text-dim)">Cette section est réservée à l'admin Kevin.</p></div>`;return}const t=j.get("user")?.id??"anon";if(!ee("admin.vault",e,t))return;const r=G();e.innerHTML=Z.withNonce(`
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
        background: linear-gradient(135deg,var(--ax-gold-deep),var(--ax-gold));
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
            <h1 class="ax-vault-h1" style="margin:0;font-size:24px;background:linear-gradient(135deg,var(--ax-gold-deep),var(--ax-gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:700;transition:font-size 200ms ease">🔐 Coffre Codes</h1>
            <div class="ax-gs-7">
              <button id="ax-vault-add-manual" style="padding:8px 14px;background:linear-gradient(135deg,var(--ax-gold-deep),var(--ax-gold));color:#000;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px;min-height:40px">+ Ajouter</button>
              <button id="ax-vault-test-all" style="padding:8px 14px;background:rgba(201,162,39,0.1);color:var(--ax-gold-deep);border:1px solid rgba(201,162,39,0.3);border-radius:10px;cursor:pointer;font-size:13px;min-height:40px">🔄 Tester tout</button>
            </div>
          </div>
          <div class="ax-vault-stats" style="display:flex;gap:14px;padding:8px 0 0;font-size:12px;color:var(--ax-text-dim);flex-wrap:wrap">
            <span>📊 ${r.total} codes</span>
            <span style="color:var(--ax-green)">🟢 ${r.active} actifs</span>
            <span class="ax-gs-168">🟡 ${r.failing} dégradés</span>
            <span class="ax-gs-76">🔴 ${r.invalid} invalides</span>
          </div>
        </header>

        <div class="ax-vault-search-row" style="padding-bottom:12px;transition:padding 200ms ease">
          <input type="text" id="ax-vault-search" aria-label="Chercher un service dans le coffre" value="${d(K)}" placeholder="🔍 Chercher un service..."
            style="width:100%;padding:12px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;color:#fff;font-size:15px;box-sizing:border-box;-webkit-appearance:none;min-height:44px">
        </div>
      </div>

      <div style="height:14px"></div>

      ${r.total===0||r.invalid>0?`
      <section id="ax-vault-empty-rescue" class="ax-empty-banner" style="background:linear-gradient(135deg,rgba(255,91,91,0.10),rgba(232,184,48,0.06));border-color:rgba(255,91,91,0.35)">
        <h3 class="ax-empty-banner-title">${r.total===0?"🆘 Coffre vide — Restauration possible":`🚨 ${r.invalid} clé(s) illisible(s) — récupération ou cleanup`}</h3>
        <p class="ax-empty-banner-body">${r.total===0?"Apex peut tenter de récupérer tes clés depuis 4 sources : Firebase backup chiffré, IndexedDB shadow, alias localStorage, pattern detection.":"Ces clés ont été chiffrées avec une passphrase historisée perdue (régression v13.3.86 fixée v13.3.88). Soit re-coller les clés une par une, soit supprimer les illisibles."}</p>
        <div class="ax-gs-7">
          <button id="ax-vault-rescue-fb" data-action="rescue-firebase" class="ax-btn-health ax-btn-health-primary">🔓 Restaurer depuis Firebase</button>
          <button id="ax-vault-rescue-all" data-action="rescue-scan-all" class="ax-btn-health ax-btn-health-blue">🔄 Scanner toutes sources</button>
          ${r.invalid>0?`<button id="ax-vault-cleanup-invalid" data-action="cleanup-invalid" class="ax-btn-health ax-btn-health-danger">🗑 Supprimer ${r.invalid} illisibles</button>`:""}
        </div>
        <div id="ax-vault-rescue-result" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.7)"></div>
      </section>
      `:""}

      <section style="background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));border:1px solid rgba(232,184,48,0.18);border-radius:14px;padding:14px;margin-bottom:14px">
        <h3 style="margin:0 0 8px;font-size:13px;color:var(--ax-gold);text-transform:uppercase;letter-spacing:0.08em;font-weight:700">🔍 Auto-détection rapide</h3>
        <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0 0 10px">Colle ici n'importe quelle clé API, Apex la reconnaît + la range automatiquement.</p>
        <textarea id="ax-vault-paste" placeholder="Colle ta clé ici (sk-ant-..., AIzaSy..., re_...)" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
          style="width:100%;background:rgba(0,0,0,0.35);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;font-family:'SF Mono',Menlo,monospace;font-size:16px;min-height:60px;resize:vertical;box-sizing:border-box;-webkit-appearance:none;-webkit-touch-callout:default;-webkit-user-select:text;user-select:text"></textarea>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <button id="ax-vault-paste-clipboard-btn" type="button"
            style="padding:10px 16px;background:rgba(106,138,255,0.18);color:var(--ax-blue);border:1px solid rgba(106,138,255,0.35);border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;min-height:44px">📋 Coller du presse-papier</button>
          <button id="ax-vault-paste-btn" type="button"
            style="padding:10px 20px;background:linear-gradient(135deg,var(--ax-gold-deep),var(--ax-gold));color:#000;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;min-height:44px">🔍 Détecter & stocker</button>
        </div>
        <div id="ax-vault-paste-result" style="margin-top:8px;font-size:12px"></div>
      </section>

      <div id="ax-vault-categories" style="display:flex;flex-direction:column;gap:12px"></div>

      <section style="margin-top:18px;padding:14px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:14px">
        <h3 style="margin:0 0 10px;color:var(--ax-gold);font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700">💾 Backup & Restore</h3>
        <p style="margin:0 0 10px;color:rgba(255,255,255,0.7);font-size:12px;line-height:1.5">⚠️ Sauvegarde TES clés AVANT tout reinstall PWA. Firebase rules require auth = ton backup auto Firebase ne marche pas.</p>
        <div class="ax-gs-7">
          <button id="ax-vault-export"
            style="padding:10px 16px;background:rgba(106,138,255,0.15);color:var(--ax-blue);border:1px solid rgba(106,138,255,0.3);border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;min-height:44px">📥 Exporter (JSON)</button>
          <button id="ax-vault-import"
            style="padding:10px 16px;background:rgba(34,204,119,0.15);color:var(--ax-green);border:1px solid rgba(34,204,119,0.3);border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;min-height:44px">📂 Importer JSON (depuis Drive)</button>
          <button id="ax-vault-qr-backup"
            style="padding:10px 16px;background:linear-gradient(135deg,var(--ax-gold-deep),var(--ax-gold));color:#000;border:none;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;min-height:44px">📦 Backup vault QR (Photos iCloud)</button>
        </div>
      </section>

      <p style="text-align:center;color:rgba(255,255,255,0.4);font-size:11px;margin-top:16px;padding:14px;background:rgba(255,255,255,0.02);border-radius:12px;line-height:1.6">
        🛡 <strong style="color:rgba(255,255,255,0.6)">Sécurité</strong> : AES-GCM 256 + PBKDF2 200k iterations · Audit log immutable<br>
        <span style="opacity:0.7">FB_LOCAL strict pour ax_pin/ax_user · jamais de plaintext en backup</span>
      </p>

      <button id="ax-vault-fab" class="ax-vault-fab" type="button" aria-label="Tester toutes les clés" title="Tester toutes les clés">🔄</button>
      <div id="ax-vault-modal-root"></div>
    </div>
  `),F(e),de(e),ce(e),m.info("feature-vault",`rendered (${r.total} entries)`)}function ce(e){const a=e.querySelector(".ax-vault-page"),t=e.querySelector("#ax-vault-fab");if(!a)return;let r=0,i=0;const o=()=>{i||(i=requestAnimationFrame(()=>{i=0;const b=window.scrollY||document.documentElement.scrollTop||0;b!==r&&(r=b,b>80?a.classList.add("ax-vault-scrolled"):a.classList.remove("ax-vault-scrolled"))}))};n?n.bind(window,"scroll",o,{passive:!0}):window.addEventListener("scroll",o,{passive:!0}),o(),t&&n&&n.bind(t,"click",()=>{p.tap(),e.querySelector("#ax-vault-test-all")?.click()})}function F(e){const a=e.querySelector("#ax-vault-categories");if(!a)return;if(G().total===0&&!a.dataset.axInitialized){a.dataset.axInitialized="1";const o=document.createElement("div");o.className="ax-skel-vault-wrapper",a.appendChild(o);const b=ae(o,"vault-cards");setTimeout(()=>{b(),o.remove(),F(e)},250)}const r=L.map(o=>{const b=re(o,K);if(b.length===0&&o.id!=="identity")return"";const g=b.length>0;return`
      <details class="ax-cat" data-cat-id="${d(o.id)}" ${g?"open":""}
        style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;overflow:hidden">
        <summary style="padding:14px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-weight:600;list-style:none;-webkit-tap-highlight-color:transparent;min-height:44px">
          <span>${d(o.label)} <span style="color:var(--ax-text-muted);font-weight:400;font-size:13px">(${b.length})</span></span>
          <span class="ax-chevron" style="color:var(--ax-text-muted);transition:transform 200ms ease-out">▼</span>
        </summary>
        <div style="padding:0 14px 14px;display:grid;grid-template-columns:repeat(auto-fill, minmax(280px,1fr));gap:10px">
          ${b.map(v=>se(v)).join("")}
          ${b.length===0?`
            <div style="padding:20px;color:var(--ax-text-muted);text-align:center;grid-column:1/-1;font-size:13px">
              Aucun code dans cette catégorie<br>
              <button data-action="add-to-cat" data-cat-id="${d(o.id)}"
                style="margin-top:10px;padding:8px 14px;background:rgba(201,162,39,0.1);color:var(--ax-gold-deep);border:1px solid rgba(201,162,39,0.3);border-radius:8px;cursor:pointer;font-size:12px;min-height:36px">
                + Ajouter ${d(o.label)}
              </button>
            </div>
          `:""}
        </div>
      </details>
    `}).join("");let i=a.querySelector(".ax-vault-cats-wrapper");i||(i=document.createElement("div"),i.className="ax-vault-cats-wrapper",a.appendChild(i)),i.innerHTML=r}function de(e){const a=e.querySelector("#ax-vault-search");if(a){let s=null;n.bind(a,"input",()=>{s&&clearTimeout(s),s=setTimeout(()=>{K=a.value.trim(),F(e),N(e)},240)})}const t=e.querySelector("#ax-vault-add-manual");t&&n&&n.bind(t,"click",()=>{p.tap(),Q(e)});const r=e.querySelector("#ax-vault-test-all");r&&n&&n.bind(r,"click",()=>{(async()=>{p.tap(),l.info("Test de toutes les clés en cours…");try{const s=await S.healthCheckAll();l.success(`✅ ${s.tested} testées · ${s.recovered} récupérées · ${s.stillDown} HS`),w(e)}catch(s){m.warn("feature-vault","testAll failed",{err:s}),l.error("Erreur pendant le test global")}})()});const i=e.querySelector("#ax-vault-rescue-fb");i&&n&&n.bind(i,"click",()=>{(async()=>{p.tap();const s=e.querySelector("#ax-vault-rescue-result");s&&(s.innerHTML="⏳ Lecture Firebase backup chiffré…");try{const{vaultFirebaseBackup:c}=await C(async()=>{const{vaultFirebaseBackup:u}=await import("./vault-firebase-backup-DaMHru4m.js");return{vaultFirebaseBackup:u}},__vite__mapDeps([0,1,2,3,4]),import.meta.url),x=await c.restoreAllFromFirebaseBackup();if(s){s.textContent="";const u=document.createElement("div");u.style.cssText="padding:8px;background:rgba(34,204,119,.1);color:var(--ax-green);border-radius:8px",u.textContent=`🔓 ${x.restored} clés restaurées · ${x.failed} échouées · ${x.skipped} ignorées`,s.append(u)}x.restored>0?(l.success(`🔓 ${x.restored} clés restaurées depuis Firebase backup`),p.success(),setTimeout(()=>w(e),600)):l.info("Aucune clé trouvée dans Firebase backup")}catch(c){m.warn("feature-vault","rescueFb failed",{err:c}),s&&(s.innerHTML=`<div class="ax-gs-48">⚠ ${d(String(c).slice(0,120))}</div>`),l.error("Erreur lecture Firebase backup"),p.error()}})()});const o=e.querySelector("#ax-vault-rescue-all");o&&n&&n.bind(o,"click",()=>{(async()=>{p.tap();const s=e.querySelector("#ax-vault-rescue-result");s&&(s.innerHTML="⏳ Scan 4 sources : alias, IDB, Firebase, pattern…");try{const{autoRestoreCredentials:c}=await C(async()=>{const{autoRestoreCredentials:u}=await import("./auto-restore-credentials-CvKw7rYb.js");return{autoRestoreCredentials:u}},__vite__mapDeps([1,2,3,4]),import.meta.url),x=await c.restoreAutomatically();if(s){s.textContent="";const u=document.createElement("div");u.style.cssText="padding:8px;background:rgba(34,204,119,.1);color:var(--ax-green);border-radius:8px",u.textContent=`🔓 ${x.restored} restaurées · ${x.failed} échouées`,s.append(u)}x.restored>0?(l.success(`🔓 ${x.restored} clés restaurées (4 sources)`),p.success(),setTimeout(()=>w(e),600)):l.info("Aucune clé trouvable dans les 4 sources. Colle une clé manuellement ci-dessous.")}catch(c){m.warn("feature-vault","rescueAll failed",{err:c}),s&&(s.innerHTML=`<div class="ax-gs-48">⚠ ${d(String(c).slice(0,120))}</div>`),l.error("Erreur scan multi-sources"),p.error()}})()});const b=e.querySelector("#ax-vault-cleanup-invalid");b&&n&&n.bind(b,"click",()=>{(async()=>{p.tap();const s=e.querySelector("#ax-vault-rescue-result");if(confirm(`Supprimer définitivement toutes les clés illisibles (decrypt fail) ?

Ces clés sont chiffrées avec une passphrase perdue. Tu devras les recoller pour les retrouver.`)){s&&(s.innerHTML="⏳ Suppression des entrées illisibles…");try{const x=D().filter(f=>f.status==="invalid");let u=0;for(const f of x)try{if(f.id.startsWith("mkv_")||f.id.includes("_")){S.removeKey(f.id),u++;continue}const _=f.id.startsWith("ax_")||f.id.startsWith("apex_v13_")?f.id:`ax_${f.service}_key`;localStorage.removeItem(_);const A=indexedDB.open("apex_v13_vault_shadow",1);A.onsuccess=()=>{try{A.result.transaction("keys","readwrite").objectStore("keys").delete(_),A.result.close()}catch{}},u++}catch{}if(s){s.textContent="";const f=document.createElement("div");f.style.cssText="padding:8px;background:rgba(34,204,119,.1);color:var(--ax-green);border-radius:8px",f.textContent=`🗑 ${u} clé(s) illisibles supprimées. Recolle tes clés via "Détecter & stocker" ci-dessous.`,s.append(f)}l.success(`🗑 ${u} clés illisibles supprimées`),p.success(),setTimeout(()=>w(e),800)}catch(c){m.warn("feature-vault","cleanupInvalid failed",{err:c}),l.error("Erreur suppression"),p.error()}}})()});const g=e.querySelector("#ax-vault-paste-clipboard-btn");g&&n&&n.bind(g,"click",()=>{(async()=>{p.tap();const s=e.querySelector("#ax-vault-paste"),c=e.querySelector("#ax-vault-paste-result");if(s)try{if(!navigator.clipboard?.readText)throw new Error("Clipboard API non supportée");const x=await navigator.clipboard.readText();if(!x){c&&(c.innerHTML='<div class="ax-gs-174">⚠ Presse-papier vide</div>');return}s.value=x,s.dispatchEvent(new Event("input",{bubbles:!0})),p.success(),l.success(`📋 ${x.length} caractères collés — clique "Détecter & stocker"`),c&&(c.innerHTML='<div style="padding:8px;background:rgba(106,138,255,.1);color:var(--ax-blue);border-radius:8px">📋 Collé — clique "Détecter & stocker" pour analyser</div>'),s.focus()}catch(x){const u=x instanceof Error?x.message:"unknown";l.error(`Clipboard refusé : ${u}. Utilise long-press → Coller manuellement.`),c&&(c.innerHTML='<div class="ax-gs-48">⚠ Permission refusée. Long-press dans le champ → Coller.</div>')}})()});const v=e.querySelector("#ax-vault-paste-btn");v&&n&&n.bind(v,"click",()=>{(async()=>{p.tap();const s=e.querySelector("#ax-vault-paste"),c=e.querySelector("#ax-vault-paste-result");if(!s||!c)return;const x=s.value.trim();if(!x){c.innerHTML=`<div class="ax-gs-174">⚠ Colle quelque chose d'abord</div>`;return}const u=await oe(x);if(u.ok){p.success(),l.success(`✅ ${u.pattern_name} stocké`),c.innerHTML=`<div style="padding:8px;background:rgba(34,204,119,.1);color:var(--ax-green);border-radius:8px">✅ ${d(u.pattern_name)} → ${d(u.storage_key)}</div>`;const f=R(x);if(f){const _=f.storageKey.replace(/^(ax_|apex_v13_)/,"").replace(/_(?:key|token|pat|sk|pk|id|secret)$/,"");try{await S.addKey(_,x)}catch{}}s.value="",w(e)}else p.error(),l.error(u.reason),c.innerHTML=`<div class="ax-gs-48">⚠ ${d(u.reason)}</div>`})()});const y=e.querySelector("#ax-vault-import");y&&n&&n.bind(y,"click",()=>{(async()=>{p.tap();try{const{apexVaultImport:s}=await C(async()=>{const{apexVaultImport:x}=await import("./apex-vault-import-DdNwsI92.js");return{apexVaultImport:x}},__vite__mapDeps([2,3,1,4]),import.meta.url),c=await s.promptAndImport();if(c.cancelled){l.info("Import annulé",{duration:2e3});return}c.ok&&c.restored>0?(l.success(`🔓 ${c.restored} clés restaurées depuis JSON Drive${c.failed>0?` · ${c.failed} échouées`:""}`,{duration:8e3}),setTimeout(()=>location.reload(),1500)):c.decrypt_failed>0?l.error(`🔒 ${c.decrypt_failed} clés non déchiffrables. PIN admin différent ? Vérifie ton PIN actuel.`,{duration:1e4}):c.error?l.error(`Import échoué : ${c.error.slice(0,80)}`,{duration:8e3}):l.warn("Aucune clé restaurée depuis ce JSON",{duration:5e3})}catch(s){const c=s instanceof Error?s.message:String(s);l.error(`Import erreur : ${c.slice(0,80)}`,{duration:8e3})}})()});const h=e.querySelector("#ax-vault-export");h&&n&&n.bind(h,"click",()=>{p.tap();const s=U(I()),c=new Blob([s],{type:"application/json"}),x=URL.createObjectURL(c),u=document.createElement("a");u.href=x,u.download=`apex-vault-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(u),u.click(),document.body.removeChild(u),URL.revokeObjectURL(x),l.success("Coffre exporté (chiffré)")});const q=e.querySelector("#ax-vault-qr-backup");q&&n&&n.bind(q,"click",()=>{(async()=>{p.tap();try{const s=U(I()),c=(s.length/1024).toFixed(1),x=I().length,u=2500;let f="";try{f=(await C(()=>import("https://cdn.jsdelivr.net/npm/lz-string@1.5.0/+esm"),[],import.meta.url)).compressToEncodedURIComponent(s);const k=(f.length/1024).toFixed(1);m.info("vault-qr-backup",`LZ compress ${c}KB → ${k}KB (${Math.round((1-f.length/s.length)*100)}% gain)`)}catch($){m.warn("vault-qr-backup","LZ-string load failed",{err:$})}if(f&&f.length<u){const{apexQrBackup:$}=await C(async()=>{const{apexQrBackup:k}=await import("./apex-qr-backup-C-hSulhB.js");return{apexQrBackup:k}},__vite__mapDeps([1,2,3,4]),import.meta.url);await $.showQrBackupModal({text:`APEXVAULT_LZ:${f}`,title:"📦 Backup Vault Compressé — Photos iCloud",description:`${x} clés compressées LZ (${(f.length/1024).toFixed(1)}KB vs ${c}KB orig). JSON chiffré AES-GCM-256. Sauvegarde dans Photos iCloud — au reinstall, scan = restore complet.`,filename:`apex-vault-backup-${new Date().toISOString().slice(0,10)}.png`});return}l.info(`Vault compressé ${f.length}B encore > QR max. Upload Gist privé chiffré...`,{duration:4e3});try{const{apexGithubGistBackup:$}=await C(async()=>{const{apexGithubGistBackup:M}=await import("./apex-github-gist-backup-Dk-1lqEE.js");return{apexGithubGistBackup:M}},__vite__mapDeps([2,3,1,4,5]),import.meta.url),k=await $.pushBackup({force:!0});if(k.ok&&k.gist_id){const M=`https://gist.github.com/${k.gist_id}`,{apexQrBackup:J}=await C(async()=>{const{apexQrBackup:W}=await import("./apex-qr-backup-C-hSulhB.js");return{apexQrBackup:W}},__vite__mapDeps([1,2,3,4]),import.meta.url);await J.showQrBackupModal({text:`APEXVAULT_GIST:${k.gist_id}`,title:"📦 Backup Vault → Gist URL — Photos iCloud",description:`${x} clés uploadées Gist privé chiffré (${(k.bytes??0)/1024}KB). QR contient juste l'ID Gist. Au reinstall, scan + PAT GitHub = pull Gist + restore complet. URL : ${M}`,filename:`apex-vault-gist-${new Date().toISOString().slice(0,10)}.png`});return}l.warn(`Gist upload échoué : ${k.error??"?"}. Fallback download JSON.`,{duration:6e3})}catch($){m.warn("vault-qr-backup","gist push failed",{err:$})}const _=new Blob([s],{type:"application/json"}),A=URL.createObjectURL(_),T=document.createElement("a");T.href=A,T.download=`apex-vault-backup-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(T),T.click(),document.body.removeChild(T),URL.revokeObjectURL(A),l.success(`📥 Backup JSON téléchargé (${c}KB chiffré). Sauvegarde dans iCloud Drive / Notes.`,{duration:8e3})}catch(s){const c=s instanceof Error?s.message:String(s);l.error(`Backup QR échoué : ${c.slice(0,60)}`,{duration:6e3})}})()}),N(e)}function N(e){e.querySelectorAll('[data-action="test"]').forEach(a=>{n.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.credId??"";pe(e,r,a)})}),e.querySelectorAll('[data-action="recharge"]').forEach(a=>{n.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.rechargeUrl??"",i=a.dataset.service??"";ue(r,i)})}),e.querySelectorAll('[data-action="discover-links"]').forEach(a=>{n.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.service??"";xe(e,r,a)})}),e.querySelectorAll('[data-action="edit"]').forEach(a=>{n.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.credId??"";be(e,r)})}),e.querySelectorAll('[data-action="delete"]').forEach(a=>{n.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.credId??"";ge(e,r)})}),e.querySelectorAll('[data-action="add-to-cat"]').forEach(a=>{n.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.catId??"";Q(e,r)})})}async function pe(e,a,t){if(!a)return;p.tap();const r=t.textContent;t.textContent="⏳ Test…",t.setAttribute("disabled","true");try{const i=await S.testKey(a);i.ok?(p.success(),l.success(`✅ Active (${i.latencyMs}ms)`)):(p.error(),l.error(`❌ ${i.reason??"Test échoué"}`)),w(e)}catch(i){m.warn("feature-vault","testKey failed",{err:i}),p.error(),l.error("Erreur pendant le test"),t.textContent=r,t.removeAttribute("disabled")}}function ue(e,a){if(p.tap(),!e){l.warn(`Aucune page recharge connue pour ${a}`);return}try{window.open(e,"_blank","noopener,noreferrer")}catch(t){m.warn("feature-vault","recharge open failed",{err:t}),l.error("Impossible d'ouvrir le lien")}}async function xe(e,a,t){if(!a)return;p.tap();const r=t.textContent;t.textContent="⏳ Recherche…",t.setAttribute("disabled","true");try{const i=await Y.discover(a,{force:!0}),o=[];i.login&&o.push("login"),i.dashboard&&o.push("dashboard"),i.billing&&o.push("billing"),i.api_keys&&o.push("api_keys"),i.usage&&o.push("usage"),i.docs&&o.push("docs"),i.password_reset&&o.push("reset_pw"),i.account_settings&&o.push("settings"),i.support&&o.push("support"),i.status_page&&o.push("status"),i.alive&&o.length>0?(p.success(),l.success(`🔗 ${o.length} liens trouvés (${i.source}) : ${o.join(", ")}`)):(p.error(),l.warn(`Aucun lien validé pour ${a} — réessaie plus tard`)),w(e)}catch(i){m.warn("feature-vault","discoverLinks failed",{err:i}),p.error(),l.error("Erreur pendant la recherche de liens")}finally{t.textContent=r,t.removeAttribute("disabled")}}function ge(e,a){if(a&&(p.tap(),!!window.confirm("Supprimer cette clé définitivement ? Elle sera retirée du Coffre + ne sera plus restaurée auto.")))try{S.removeKey(a),p.success(),l.success("Clé supprimée définitivement ✓"),w(e)}catch(t){m.warn("feature-vault","delete failed",{err:t}),p.error(),l.error("Suppression échouée")}}function P(e){let a=e.querySelector("#ax-vault-modal-root");return a||(a=document.createElement("div"),a.id="ax-vault-modal-root",e.appendChild(a)),a}function z(e){const a=P(e);a.innerHTML=""}function Q(e,a){const t=P(e),r=L.filter(g=>g.id!=="other").map(g=>`<option value="${d(g.id)}" ${a===g.id?"selected":""}>${d(g.label)}</option>`).join("");t.innerHTML=`
    <div role="dialog" aria-modal="true" aria-label="Ajouter une clé"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">
      <div style="background:var(--ax-bg-flat);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;max-width:440px;width:100%;max-height:90vh;overflow-y:auto">
        <div class="ax-gs-175">
          <h2 style="margin:0;font-size:18px;color:var(--ax-gold)">+ Ajouter une clé</h2>
          <button id="ax-vault-modal-close" aria-label="Fermer"
            style="background:transparent;border:0;color:var(--ax-text-dim);font-size:24px;cursor:pointer;min-height:32px;min-width:32px">×</button>
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
        <div class="ax-gs-176">
          <button id="ax-vault-add-detect"
            style="flex:1;min-width:140px;padding:10px;background:rgba(106,138,255,0.15);color:var(--ax-blue);border:1px solid rgba(106,138,255,0.3);border-radius:8px;cursor:pointer;font-size:13px;min-height:44px">🔍 Détecter automatiquement</button>
          <button id="ax-vault-add-save"
            style="flex:1;min-width:140px;padding:10px;background:linear-gradient(135deg,var(--ax-gold-deep),var(--ax-gold));color:#000;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700;min-height:44px">🔒 Chiffrer & Sauvegarder</button>
        </div>
      </div>
    </div>
  `,(()=>{const g=t.querySelector("#ax-vault-modal-close");g&&n&&n.bind(g,"click",()=>z(e))})();const i=t.querySelector('[role="dialog"]');i&&n&&n.bind(i,"click",g=>{g.target===i&&z(e)});const o=t.querySelector("#ax-vault-add-detect");o&&n&&n.bind(o,"click",()=>{(async()=>{p.tap();const g=t.querySelector("#ax-vault-add-value");if(!g)return;const v=R(g.value.trim());if(!v){l.warn("Aucun pattern reconnu");return}if(v.category==="forbidden"){l.error("🚨 Type interdit");return}const y=t.querySelector("#ax-vault-add-service"),h=t.querySelector("#ax-vault-add-cat");if(y){const q=v.storageKey.replace(/^(ax_|apex_v13_)/,"").replace(/_(?:key|token|pat|sk|pk|id|secret)$/,"");y.value=q}h&&(h.value=E(y?.value??"",v.category)),l.success(`Détecté: ${v.name}`)})()});const b=t.querySelector("#ax-vault-add-save");b&&n&&n.bind(b,"click",()=>{(async()=>{p.tap();const g=t.querySelector("#ax-vault-add-service")?.value.trim()??"",v=t.querySelector("#ax-vault-add-alias")?.value.trim()??"",y=t.querySelector("#ax-vault-add-value")?.value.trim()??"";if(!g||!y){l.warn("Service et valeur requis");return}try{const h={};v&&(h.alias=v),await S.addKey(g,y,h),l.success(`✅ Clé ${g} chiffrée + sauvegardée`),z(e),w(e)}catch(h){m.warn("feature-vault","add manual failed",{err:h}),l.error("Erreur pendant la sauvegarde")}})()})}function be(e,a){const t=P(e),r=S.listAll(!0).find(o=>o.id===a);if(!r){l.error("Clé introuvable");return}t.innerHTML=`
    <div role="dialog" aria-modal="true" aria-label="Modifier une clé"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">
      <div style="background:var(--ax-bg-flat);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;max-width:440px;width:100%">
        <div class="ax-gs-175">
          <h2 style="margin:0;font-size:18px;color:var(--ax-gold)">✏️ Modifier ${d(r.service)}</h2>
          <button id="ax-vault-modal-close" aria-label="Fermer"
            style="background:transparent;border:0;color:var(--ax-text-dim);font-size:24px;cursor:pointer;min-height:32px;min-width:32px">×</button>
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
        <div class="ax-gs-176">
          <button id="ax-vault-edit-cancel"
            style="flex:1;min-width:120px;padding:10px;background:rgba(255,255,255,0.04);color:var(--ax-text-dim);border:1px solid rgba(255,255,255,0.1);border-radius:8px;cursor:pointer;font-size:13px;min-height:44px">Annuler</button>
          <button id="ax-vault-edit-save"
            style="flex:1;min-width:120px;padding:10px;background:linear-gradient(135deg,var(--ax-gold-deep),var(--ax-gold));color:#000;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700;min-height:44px">💾 Enregistrer</button>
        </div>
      </div>
    </div>
  `,(()=>{const o=t.querySelector("#ax-vault-modal-close");o&&n&&n.bind(o,"click",()=>z(e))})(),(()=>{const o=t.querySelector("#ax-vault-edit-cancel");o&&n&&n.bind(o,"click",()=>z(e))})();const i=t.querySelector("#ax-vault-edit-save");i&&n&&n.bind(i,"click",()=>{(async()=>{p.tap();const o=t.querySelector("#ax-vault-edit-value")?.value.trim()??"",b=t.querySelector("#ax-vault-edit-alias")?.value.trim()??"";if(!o){l.warn("Valeur requise");return}try{S.markInvalid(a,"replaced via edit");const g={};b&&(g.alias=b),await S.addKey(r.service,o,g),l.success("✅ Clé mise à jour"),z(e),w(e)}catch(g){m.warn("feature-vault","edit save failed",{err:g}),l.error("Erreur pendant la modification")}})()})}export{L as CATEGORIES,oe as autoDetectAndStore,D as buildCredentialDisplays,E as classifyService,G as computeStats,Ke as dispose,d as escapeHtml,U as exportVaultJson,Fe as filterVaultEntries,H as formatRelativeTime,re as getCredentialsForCategory,I as listVaultEntries,Pe as removeCredential,w as render,se as renderCredentialCard};
