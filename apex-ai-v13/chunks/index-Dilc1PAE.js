const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./vault-firebase-backup-BLRgeskK.js","./apex-kb-DeinzW8_.js","./monitoring-3uBGKGRH.js","./credential-patterns-CLzI061R.js","./multi-source-analyze-DeXEbJo4.js","./auth-TLkWiKyf.js","../assets/css/main-BUIq5pfg.css"])))=>i.map(i=>d[i]);
import{v as B,_ as C}from"./apex-kb-DeinzW8_.js";import{c as X}from"./listener-cleanup-Y2rGGxxX.js";import{l as m}from"./monitoring-3uBGKGRH.js";import{s as P,a as Y}from"../core/main-BCcxTiyw.js";import{autoDiscoverLinks as Z}from"./auto-discover-links-Cm195RTb.js";import{detectCredential as R,CREDENTIAL_PATTERNS as V}from"./credential-patterns-CLzI061R.js";import{c as ee}from"./csp-style-helper-BisGRi53.js";import{g as te}from"./apex-tools-dispatch-core-J8yXRjR7.js";import{g as ae}from"./generic-secrets-DFym88Um.js";import{l as O}from"./multi-source-analyze-DeXEbJo4.js";import{multiKeyVault as S}from"./multi-key-vault-CbOUBUAH.js";import{haptic as d}from"./haptic-CQFg2PXZ.js";import{toast as l}from"./toast-ClsF1KRZ.js";import"./apex-tools-dispatch-skills-6Cc8R-us.js";import"./apex-tools-dispatch-data-W07o4hZl.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-DHORjut1.js";import"./apex-tools-registry-BtzdvWhK.js";import"./voice-DVaqLiwg.js";let n=null;function Re(){n?.cleanup(),n=null}function g(e){return e.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]??a)}const L=[{id:"ai",label:"🤖 IA & LLM",serviceMatchers:["anthropic","openai","groq","google","gemini","openrouter","cohere","mistral","perplexity","deepseek","xai","elevenlabs","replicate","huggingface","fireworks","togetherai","deepl"],patternCategories:["ai"]},{id:"finance",label:"💳 Paiements & Finance",serviceMatchers:["stripe","paypal","revolut","wise","lydia","n26","boursorama","fortuneo","ing","socgen","bnp","credit_agricole","credit_mutuel","banque_postale","lbp","bpce","shopify"],patternCategories:["finance"]},{id:"devops",label:"🛠 DevOps & Code",serviceMatchers:["github","gitlab","cloudflare","vercel","netlify","railway","aws","heroku","sentry","npm"],patternCategories:["devops"]},{id:"comms",label:"📨 Communications",serviceMatchers:["telegram","discord","slack","brevo","resend","twilio","sendgrid","mailchimp","whatsapp"],patternCategories:["comms"]},{id:"social",label:"🌐 Réseaux sociaux",serviceMatchers:["facebook","instagram","tiktok","youtube","twitter","linkedin"],patternCategories:[]},{id:"storage",label:"☁️ Stockage & Cloud",serviceMatchers:["firebase","supabase","airtable","notion","dropbox","pinecone","weaviate"],patternCategories:["storage"]},{id:"ecommerce",label:"🛒 E-commerce",serviceMatchers:["shopify","stripe_connect","paypal_business"],patternCategories:[]},{id:"crypto",label:"₿ Crypto",serviceMatchers:["coinbase","binance","crypto_com","kraken"],patternCategories:[]},{id:"identity",label:"🆔 Identité Kevin",serviceMatchers:["kevin","iban","siret","vat","bic","apple","microsoft"],patternCategories:["identity"]},{id:"other",label:"📦 Autres",serviceMatchers:[],patternCategories:["saas"]}];function E(e,a){const t=e.toLowerCase();let r=null;for(const i of L)if(i.id!=="other")for(const o of i.serviceMatchers)t.includes(o)&&(!r||o.length>r.matchLen)&&(r={catId:i.id,matchLen:o.length});if(r)return r.catId;if(a){for(const i of L)if(i.patternCategories.includes(a))return i.id}return"other"}function I(){return V.filter(e=>e.category!=="forbidden").map(e=>{const a=B.getKeyStatus(e.storageKey),t=(()=>{try{return localStorage.getItem(e.storageKey)??""}catch{return""}})(),r=t&&t.length>8&&!t.startsWith("AXENC1:")?B.maskKey(t):t.startsWith("AXENC1:")?"🔒 chiffré":"";return{pattern:e,status:a,masked:r}})}function De(e,a){return e.filter(t=>{if(a.category&&t.pattern.category!==a.category||a.configuredOnly&&t.status==="empty")return!1;if(a.query){const r=a.query.toLowerCase();if(!(t.pattern.name.toLowerCase().includes(r)||t.pattern.storageKey.toLowerCase().includes(r)))return!1}return!0})}function D(){const e=[];let a=[];try{a=S.listAll(!0)}catch(t){m.warn("feature-vault","multiKeyVault.listAll failed",{err:t})}for(const t of a){const r=O.get(t.service),i=V.find(x=>x.storageKey.includes(t.service)),o={id:t.id,service:t.service,serviceName:r?.name??ie(t.service),category:E(t.service,i?.category),status:t.status,source:"multi-key"};t.alias!==void 0&&(o.alias=t.alias),t.addedAt!==void 0&&(o.addedAt=t.addedAt),t.lastTestedAt!==void 0&&(o.lastTestedAt=t.lastTestedAt);const f=O.getRechargeLink(t.service);f&&(o.rechargeUrl=f),e.push(o)}return e}function G(){const e=D(),a={total:e.length,active:0,failing:0,invalid:0};for(const t of e)t.status==="active"?a.active+=1:t.status==="failing"||t.status==="rate-limited"?a.failing+=1:t.status==="invalid"&&(a.invalid+=1);return a}function re(e,a=""){const t=D(),r=a.trim().toLowerCase();return t.filter(i=>i.category!==e.id?!1:r?i.service.toLowerCase().includes(r)||i.serviceName.toLowerCase().includes(r)||(i.alias?.toLowerCase().includes(r)??!1):!0)}function ie(e){return e.charAt(0).toUpperCase()+e.slice(1)}async function oe(e){const a=e.trim();if(!a)return{ok:!1,reason:"Entrée vide"};const t=R(a);if(t&&t.category==="forbidden")return{ok:!1,reason:"🚨 Type interdit (cartes/seed phrases jamais stockées)"};if(t)try{const r=await B.encryptAuto(a);return localStorage.setItem(t.storageKey,r),{ok:!0,pattern_name:t.name,storage_key:t.storageKey}}catch(r){return m.warn("vault-feature","autoDetectAndStore failed",{err:r}),{ok:!1,reason:"Erreur chiffrement"}}if(a.length>=20){const r=await ae.add(a,void 0,"Auto-détecté (pattern inconnu)");return r.ok?{ok:!0,generic:!0,pattern_name:"Secret générique",storage_key:"apex_v13_generic_secrets",generic_id:r.id}:{ok:!1,reason:r.reason}}return{ok:!1,reason:"Aucun pattern reconnu (trop court pour secret générique)"}}function Ke(e){try{return localStorage.removeItem(e),!0}catch(a){return m.warn("vault-feature","remove failed",{err:a}),!1}}function U(e){const a={exported_at:new Date().toISOString(),version:1,entries:e.filter(t=>t.status!=="empty").map(t=>{const r=(()=>{try{return localStorage.getItem(t.pattern.storageKey)??""}catch{return""}})();return{storage_key:t.pattern.storageKey,name:t.pattern.name,value_encrypted:r}})};return JSON.stringify(a,null,2)}function se(e){const a=ne[e.status]??"#888",t=le[e.status]??"⚪",r=(e.preview??"").slice(0,4)+"••••••"+(e.preview??"").slice(-4),i=e.preview?r:"••••••",o=e.rechargeUrl??"",f=e.alias?`<span style="color:#888;font-size:11px">— ${g(e.alias)}</span>`:"",x=e.logoUrl?`<img src="${g(e.logoUrl)}" alt="" loading="lazy" decoding="async" style="width:24px;height:24px;border-radius:6px" onerror="this.style.display='none'">`:"",v=[];e.addedAt&&v.push(`Ajouté ${H(e.addedAt)}`),e.lastTestedAt&&v.push(`Testé ${H(e.lastTestedAt)}`);const y=v.length>0?`<div style="display:flex;gap:8px;font-size:11px;color:#888;margin-bottom:10px">${v.map(h=>`<span>${g(h)}</span>`).join("")}</div>`:"";return`
    <div class="ax-cred-card" data-cred-id="${g(e.id)}" data-service="${g(e.service)}"
      style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;transition:all 200ms ease-out;position:relative;display:flex;flex-direction:column;gap:8px">
      <div style="position:absolute;top:14px;right:14px;width:10px;height:10px;border-radius:50%;background:${g(a)};box-shadow:0 0 8px ${g(a)}" title="${g(t)} ${g(e.status)}"></div>
      <div style="display:flex;align-items:center;gap:10px">
        ${x}
        <strong style="font-size:15px;color:#fff">${g(e.serviceName)}</strong>
        ${f}
      </div>
      <code style="display:block;padding:6px 10px;background:rgba(0,0,0,0.3);border-radius:6px;font-size:11px;color:#888;font-family:'SF Mono',Menlo,monospace;letter-spacing:1px">${g(i)}</code>
      ${y}
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button data-action="test" data-cred-id="${g(e.id)}"
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(34,204,119,0.1);color:#22cc77;border:1px solid rgba(34,204,119,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px">🔄 Test</button>
        <button data-action="recharge" data-service="${g(e.service)}" data-recharge-url="${g(o)}" ${o?"":"disabled"}
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(201,162,39,0.1);color:#c9a227;border:1px solid rgba(201,162,39,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px;${o?"":"opacity:0.4;cursor:not-allowed"}">💰 Recharger</button>
        <button data-action="discover-links" data-service="${g(e.service)}"
          title="Cherche login/dashboard/billing/api_keys/usage en autonomie"
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(74,158,255,0.1);color:#4a9eff;border:1px solid rgba(74,158,255,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px">🔍 Chercher liens</button>
        <button data-action="edit" data-cred-id="${g(e.id)}"
          style="padding:6px 10px;background:rgba(255,255,255,0.05);color:#aaa;border:1px solid rgba(255,255,255,0.1);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px">✏️</button>
        <button data-action="delete" data-cred-id="${g(e.id)}"
          style="padding:6px 10px;background:rgba(255,91,91,0.1);color:#ff5b5b;border:1px solid rgba(255,91,91,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px">🗑</button>
      </div>
    </div>
  `}const ne={active:"#22cc77",failing:"#ffaa00","rate-limited":"#ffaa00",invalid:"#ff5b5b",unknown:"#888"},le={active:"🟢",failing:"🟡","rate-limited":"🟡",invalid:"🔴",unknown:"⚪"};function H(e){const a=Date.now()-e;if(a<0||!Number.isFinite(a))return"à l'instant";const t=Math.floor(a/6e4);if(t<1)return"à l'instant";if(t<60)return`il y a ${t}min`;const r=Math.floor(t/60);if(r<24)return`il y a ${r}h`;const i=Math.floor(r/24);return i<30?`il y a ${i}j`:`il y a ${Math.floor(i/30)} mois`}let K="";function w(e){if(n?.cleanup(),n=X("vault"),!P.get("isAdmin")){e.innerHTML=`<div style="padding:40px;text-align:center"><h2 style="color:#c9a227">🔒 Coffre admin</h2><p style="color:#a0a4c0">Cette section est réservée à l'admin Kevin.</p></div>`;return}const t=P.get("user")?.id??"anon";if(!te("admin.vault",e,t))return;const r=G();e.innerHTML=ee.withNonce(`
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
          <input type="text" id="ax-vault-search" aria-label="Chercher un service dans le coffre" value="${g(K)}" placeholder="🔍 Chercher un service..."
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
        <p style="margin:0 0 10px;color:rgba(255,255,255,0.7);font-size:12px;line-height:1.5">⚠️ Sauvegarde TES clés AVANT tout reinstall PWA. Firebase rules require auth = ton backup auto Firebase ne marche pas.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button id="ax-vault-export"
            style="padding:10px 16px;background:rgba(106,138,255,0.15);color:#6a8aff;border:1px solid rgba(106,138,255,0.3);border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;min-height:44px">📥 Exporter (JSON)</button>
          <button id="ax-vault-import"
            style="padding:10px 16px;background:rgba(34,204,119,0.15);color:#22cc77;border:1px solid rgba(34,204,119,0.3);border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;min-height:44px">📂 Importer JSON (depuis Drive)</button>
          <button id="ax-vault-qr-backup"
            style="padding:10px 16px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;min-height:44px">📦 Backup vault QR (Photos iCloud)</button>
        </div>
      </section>

      <p style="text-align:center;color:rgba(255,255,255,0.4);font-size:11px;margin-top:16px;padding:14px;background:rgba(255,255,255,0.02);border-radius:12px;line-height:1.6">
        🛡 <strong style="color:rgba(255,255,255,0.6)">Sécurité</strong> : AES-GCM 256 + PBKDF2 200k iterations · Audit log immutable<br>
        <span style="opacity:0.7">FB_LOCAL strict pour ax_pin/ax_user · jamais de plaintext en backup</span>
      </p>

      <button id="ax-vault-fab" class="ax-vault-fab" type="button" aria-label="Tester toutes les clés" title="Tester toutes les clés">🔄</button>
      <div id="ax-vault-modal-root"></div>
    </div>
  `),F(e),de(e),ce(e),m.info("feature-vault",`rendered (${r.total} entries)`)}function ce(e){const a=e.querySelector(".ax-vault-page"),t=e.querySelector("#ax-vault-fab");if(!a)return;let r=0,i=0;const o=()=>{i||(i=requestAnimationFrame(()=>{i=0;const f=window.scrollY||document.documentElement.scrollTop||0;f!==r&&(r=f,f>80?a.classList.add("ax-vault-scrolled"):a.classList.remove("ax-vault-scrolled"))}))};n?n.bind(window,"scroll",o,{passive:!0}):window.addEventListener("scroll",o,{passive:!0}),o(),t&&n&&n.bind(t,"click",()=>{d.tap(),e.querySelector("#ax-vault-test-all")?.click()})}function F(e){const a=e.querySelector("#ax-vault-categories");if(!a)return;if(G().total===0&&!a.dataset.axInitialized){a.dataset.axInitialized="1";const o=document.createElement("div");o.className="ax-skel-vault-wrapper",a.appendChild(o);const f=Y(o,"vault-cards");setTimeout(()=>{f(),o.remove(),F(e)},250)}const r=L.map(o=>{const f=re(o,K);if(f.length===0&&o.id!=="identity")return"";const x=f.length>0;return`
      <details class="ax-cat" data-cat-id="${g(o.id)}" ${x?"open":""}
        style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;overflow:hidden">
        <summary style="padding:14px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-weight:600;list-style:none;-webkit-tap-highlight-color:transparent;min-height:44px">
          <span>${g(o.label)} <span style="color:#888;font-weight:400;font-size:13px">(${f.length})</span></span>
          <span class="ax-chevron" style="color:#888;transition:transform 200ms ease-out">▼</span>
        </summary>
        <div style="padding:0 14px 14px;display:grid;grid-template-columns:repeat(auto-fill, minmax(280px,1fr));gap:10px">
          ${f.map(v=>se(v)).join("")}
          ${f.length===0?`
            <div style="padding:20px;color:#666;text-align:center;grid-column:1/-1;font-size:13px">
              Aucun code dans cette catégorie<br>
              <button data-action="add-to-cat" data-cat-id="${g(o.id)}"
                style="margin-top:10px;padding:8px 14px;background:rgba(201,162,39,0.1);color:#c9a227;border:1px solid rgba(201,162,39,0.3);border-radius:8px;cursor:pointer;font-size:12px;min-height:36px">
                + Ajouter ${g(o.label)}
              </button>
            </div>
          `:""}
        </div>
      </details>
    `}).join("");let i=a.querySelector(".ax-vault-cats-wrapper");i||(i=document.createElement("div"),i.className="ax-vault-cats-wrapper",a.appendChild(i)),i.innerHTML=r}function de(e){const a=e.querySelector("#ax-vault-search");if(a){let s=null;n.bind(a,"input",()=>{s&&clearTimeout(s),s=setTimeout(()=>{K=a.value.trim(),F(e),N(e)},240)})}const t=e.querySelector("#ax-vault-add-manual");t&&n&&n.bind(t,"click",()=>{d.tap(),Q(e)});const r=e.querySelector("#ax-vault-test-all");r&&n&&n.bind(r,"click",()=>{(async()=>{d.tap(),l.info("Test de toutes les clés en cours…");try{const s=await S.healthCheckAll();l.success(`✅ ${s.tested} testées · ${s.recovered} récupérées · ${s.stillDown} HS`),w(e)}catch(s){m.warn("feature-vault","testAll failed",{err:s}),l.error("Erreur pendant le test global")}})()});const i=e.querySelector("#ax-vault-rescue-fb");i&&n&&n.bind(i,"click",()=>{(async()=>{d.tap();const s=e.querySelector("#ax-vault-rescue-result");s&&(s.innerHTML="⏳ Lecture Firebase backup chiffré…");try{const{vaultFirebaseBackup:c}=await C(async()=>{const{vaultFirebaseBackup:p}=await import("./vault-firebase-backup-BLRgeskK.js");return{vaultFirebaseBackup:p}},__vite__mapDeps([0,1,2,3,4]),import.meta.url),u=await c.restoreAllFromFirebaseBackup();if(s){s.textContent="";const p=document.createElement("div");p.style.cssText="padding:8px;background:rgba(34,204,119,.1);color:#22cc77;border-radius:8px",p.textContent=`🔓 ${u.restored} clés restaurées · ${u.failed} échouées · ${u.skipped} ignorées`,s.append(p)}u.restored>0?(l.success(`🔓 ${u.restored} clés restaurées depuis Firebase backup`),d.success(),setTimeout(()=>w(e),600)):l.info("Aucune clé trouvée dans Firebase backup")}catch(c){m.warn("feature-vault","rescueFb failed",{err:c}),s&&(s.innerHTML=`<div style="padding:8px;background:rgba(255,88,88,.1);color:#ff5858;border-radius:8px">⚠ ${g(String(c).slice(0,120))}</div>`),l.error("Erreur lecture Firebase backup"),d.error()}})()});const o=e.querySelector("#ax-vault-rescue-all");o&&n&&n.bind(o,"click",()=>{(async()=>{d.tap();const s=e.querySelector("#ax-vault-rescue-result");s&&(s.innerHTML="⏳ Scan 4 sources : alias, IDB, Firebase, pattern…");try{const{autoRestoreCredentials:c}=await C(async()=>{const{autoRestoreCredentials:p}=await import("./auto-restore-credentials-BOwMoauT.js");return{autoRestoreCredentials:p}},__vite__mapDeps([1,2,3,4]),import.meta.url),u=await c.restoreAutomatically();if(s){s.textContent="";const p=document.createElement("div");p.style.cssText="padding:8px;background:rgba(34,204,119,.1);color:#22cc77;border-radius:8px",p.textContent=`🔓 ${u.restored} restaurées · ${u.failed} échouées`,s.append(p)}u.restored>0?(l.success(`🔓 ${u.restored} clés restaurées (4 sources)`),d.success(),setTimeout(()=>w(e),600)):l.info("Aucune clé trouvable dans les 4 sources. Colle une clé manuellement ci-dessous.")}catch(c){m.warn("feature-vault","rescueAll failed",{err:c}),s&&(s.innerHTML=`<div style="padding:8px;background:rgba(255,88,88,.1);color:#ff5858;border-radius:8px">⚠ ${g(String(c).slice(0,120))}</div>`),l.error("Erreur scan multi-sources"),d.error()}})()});const f=e.querySelector("#ax-vault-cleanup-invalid");f&&n&&n.bind(f,"click",()=>{(async()=>{d.tap();const s=e.querySelector("#ax-vault-rescue-result");if(confirm(`Supprimer définitivement toutes les clés illisibles (decrypt fail) ?

Ces clés sont chiffrées avec une passphrase perdue. Tu devras les recoller pour les retrouver.`)){s&&(s.innerHTML="⏳ Suppression des entrées illisibles…");try{const u=D().filter(b=>b.status==="invalid");let p=0;for(const b of u)try{if(b.id.startsWith("mkv_")||b.id.includes("_")){S.removeKey(b.id),p++;continue}const _=b.id.startsWith("ax_")||b.id.startsWith("apex_v13_")?b.id:`ax_${b.service}_key`;localStorage.removeItem(_);const A=indexedDB.open("apex_v13_vault_shadow",1);A.onsuccess=()=>{try{A.result.transaction("keys","readwrite").objectStore("keys").delete(_),A.result.close()}catch{}},p++}catch{}if(s){s.textContent="";const b=document.createElement("div");b.style.cssText="padding:8px;background:rgba(34,204,119,.1);color:#22cc77;border-radius:8px",b.textContent=`🗑 ${p} clé(s) illisibles supprimées. Recolle tes clés via "Détecter & stocker" ci-dessous.`,s.append(b)}l.success(`🗑 ${p} clés illisibles supprimées`),d.success(),setTimeout(()=>w(e),800)}catch(c){m.warn("feature-vault","cleanupInvalid failed",{err:c}),l.error("Erreur suppression"),d.error()}}})()});const x=e.querySelector("#ax-vault-paste-clipboard-btn");x&&n&&n.bind(x,"click",()=>{(async()=>{d.tap();const s=e.querySelector("#ax-vault-paste"),c=e.querySelector("#ax-vault-paste-result");if(s)try{if(!navigator.clipboard?.readText)throw new Error("Clipboard API non supportée");const u=await navigator.clipboard.readText();if(!u){c&&(c.innerHTML='<div style="padding:8px;background:rgba(240,192,32,.1);color:#f0c020;border-radius:8px">⚠ Presse-papier vide</div>');return}s.value=u,s.dispatchEvent(new Event("input",{bubbles:!0})),d.success(),l.success(`📋 ${u.length} caractères collés — clique "Détecter & stocker"`),c&&(c.innerHTML='<div style="padding:8px;background:rgba(106,138,255,.1);color:#6a8aff;border-radius:8px">📋 Collé — clique "Détecter & stocker" pour analyser</div>'),s.focus()}catch(u){const p=u instanceof Error?u.message:"unknown";l.error(`Clipboard refusé : ${p}. Utilise long-press → Coller manuellement.`),c&&(c.innerHTML='<div style="padding:8px;background:rgba(255,88,88,.1);color:#ff5858;border-radius:8px">⚠ Permission refusée. Long-press dans le champ → Coller.</div>')}})()});const v=e.querySelector("#ax-vault-paste-btn");v&&n&&n.bind(v,"click",()=>{(async()=>{d.tap();const s=e.querySelector("#ax-vault-paste"),c=e.querySelector("#ax-vault-paste-result");if(!s||!c)return;const u=s.value.trim();if(!u){c.innerHTML=`<div style="padding:8px;background:rgba(240,192,32,.1);color:#f0c020;border-radius:8px">⚠ Colle quelque chose d'abord</div>`;return}const p=await oe(u);if(p.ok){d.success(),l.success(`✅ ${p.pattern_name} stocké`),c.innerHTML=`<div style="padding:8px;background:rgba(34,204,119,.1);color:#22cc77;border-radius:8px">✅ ${g(p.pattern_name)} → ${g(p.storage_key)}</div>`;const b=R(u);if(b){const _=b.storageKey.replace(/^(ax_|apex_v13_)/,"").replace(/_(?:key|token|pat|sk|pk|id|secret)$/,"");try{await S.addKey(_,u)}catch{}}s.value="",w(e)}else d.error(),l.error(p.reason),c.innerHTML=`<div style="padding:8px;background:rgba(255,88,88,.1);color:#ff5858;border-radius:8px">⚠ ${g(p.reason)}</div>`})()});const y=e.querySelector("#ax-vault-import");y&&n&&n.bind(y,"click",()=>{(async()=>{d.tap();try{const{apexVaultImport:s}=await C(async()=>{const{apexVaultImport:u}=await import("./apex-vault-import-B5QSdOkS.js");return{apexVaultImport:u}},__vite__mapDeps([2,1,3]),import.meta.url),c=await s.promptAndImport();if(c.cancelled){l.info("Import annulé",{duration:2e3});return}c.ok&&c.restored>0?(l.success(`🔓 ${c.restored} clés restaurées depuis JSON Drive${c.failed>0?` · ${c.failed} échouées`:""}`,{duration:8e3}),setTimeout(()=>location.reload(),1500)):c.decrypt_failed>0?l.error(`🔒 ${c.decrypt_failed} clés non déchiffrables. PIN admin différent ? Vérifie ton PIN actuel.`,{duration:1e4}):c.error?l.error(`Import échoué : ${c.error.slice(0,80)}`,{duration:8e3}):l.warn("Aucune clé restaurée depuis ce JSON",{duration:5e3})}catch(s){const c=s instanceof Error?s.message:String(s);l.error(`Import erreur : ${c.slice(0,80)}`,{duration:8e3})}})()});const h=e.querySelector("#ax-vault-export");h&&n&&n.bind(h,"click",()=>{d.tap();const s=U(I()),c=new Blob([s],{type:"application/json"}),u=URL.createObjectURL(c),p=document.createElement("a");p.href=u,p.download=`apex-vault-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(p),p.click(),document.body.removeChild(p),URL.revokeObjectURL(u),l.success("Coffre exporté (chiffré)")});const q=e.querySelector("#ax-vault-qr-backup");q&&n&&n.bind(q,"click",()=>{(async()=>{d.tap();try{const s=U(I()),c=(s.length/1024).toFixed(1),u=I().length,p=2500;let b="";try{b=(await C(()=>import("https://cdn.jsdelivr.net/npm/lz-string@1.5.0/+esm"),[],import.meta.url)).compressToEncodedURIComponent(s);const k=(b.length/1024).toFixed(1);m.info("vault-qr-backup",`LZ compress ${c}KB → ${k}KB (${Math.round((1-b.length/s.length)*100)}% gain)`)}catch($){m.warn("vault-qr-backup","LZ-string load failed",{err:$})}if(b&&b.length<p){const{apexQrBackup:$}=await C(async()=>{const{apexQrBackup:k}=await import("./apex-qr-backup-DErR5RMw.js");return{apexQrBackup:k}},__vite__mapDeps([1,2,3]),import.meta.url);await $.showQrBackupModal({text:`APEXVAULT_LZ:${b}`,title:"📦 Backup Vault Compressé — Photos iCloud",description:`${u} clés compressées LZ (${(b.length/1024).toFixed(1)}KB vs ${c}KB orig). JSON chiffré AES-GCM-256. Sauvegarde dans Photos iCloud — au reinstall, scan = restore complet.`,filename:`apex-vault-backup-${new Date().toISOString().slice(0,10)}.png`});return}l.info(`Vault compressé ${b.length}B encore > QR max. Upload Gist privé chiffré...`,{duration:4e3});try{const{apexGithubGistBackup:$}=await C(async()=>{const{apexGithubGistBackup:M}=await import("./apex-github-gist-backup-D7-599sy.js");return{apexGithubGistBackup:M}},__vite__mapDeps([2,5,1,3,4,6]),import.meta.url),k=await $.pushBackup({force:!0});if(k.ok&&k.gist_id){const M=`https://gist.github.com/${k.gist_id}`,{apexQrBackup:J}=await C(async()=>{const{apexQrBackup:W}=await import("./apex-qr-backup-DErR5RMw.js");return{apexQrBackup:W}},__vite__mapDeps([1,2,3]),import.meta.url);await J.showQrBackupModal({text:`APEXVAULT_GIST:${k.gist_id}`,title:"📦 Backup Vault → Gist URL — Photos iCloud",description:`${u} clés uploadées Gist privé chiffré (${(k.bytes??0)/1024}KB). QR contient juste l'ID Gist. Au reinstall, scan + PAT GitHub = pull Gist + restore complet. URL : ${M}`,filename:`apex-vault-gist-${new Date().toISOString().slice(0,10)}.png`});return}l.warn(`Gist upload échoué : ${k.error??"?"}. Fallback download JSON.`,{duration:6e3})}catch($){m.warn("vault-qr-backup","gist push failed",{err:$})}const _=new Blob([s],{type:"application/json"}),A=URL.createObjectURL(_),T=document.createElement("a");T.href=A,T.download=`apex-vault-backup-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(T),T.click(),document.body.removeChild(T),URL.revokeObjectURL(A),l.success(`📥 Backup JSON téléchargé (${c}KB chiffré). Sauvegarde dans iCloud Drive / Notes.`,{duration:8e3})}catch(s){const c=s instanceof Error?s.message:String(s);l.error(`Backup QR échoué : ${c.slice(0,60)}`,{duration:6e3})}})()}),N(e)}function N(e){e.querySelectorAll('[data-action="test"]').forEach(a=>{n.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.credId??"";pe(e,r,a)})}),e.querySelectorAll('[data-action="recharge"]').forEach(a=>{n.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.rechargeUrl??"",i=a.dataset.service??"";ue(r,i)})}),e.querySelectorAll('[data-action="discover-links"]').forEach(a=>{n.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.service??"";xe(e,r,a)})}),e.querySelectorAll('[data-action="edit"]').forEach(a=>{n.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.credId??"";fe(e,r)})}),e.querySelectorAll('[data-action="delete"]').forEach(a=>{n.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.credId??"";ge(e,r)})}),e.querySelectorAll('[data-action="add-to-cat"]').forEach(a=>{n.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.catId??"";Q(e,r)})})}async function pe(e,a,t){if(!a)return;d.tap();const r=t.textContent;t.textContent="⏳ Test…",t.setAttribute("disabled","true");try{const i=await S.testKey(a);i.ok?(d.success(),l.success(`✅ Active (${i.latencyMs}ms)`)):(d.error(),l.error(`❌ ${i.reason??"Test échoué"}`)),w(e)}catch(i){m.warn("feature-vault","testKey failed",{err:i}),d.error(),l.error("Erreur pendant le test"),t.textContent=r,t.removeAttribute("disabled")}}function ue(e,a){if(d.tap(),!e){l.warn(`Aucune page recharge connue pour ${a}`);return}try{window.open(e,"_blank","noopener,noreferrer")}catch(t){m.warn("feature-vault","recharge open failed",{err:t}),l.error("Impossible d'ouvrir le lien")}}async function xe(e,a,t){if(!a)return;d.tap();const r=t.textContent;t.textContent="⏳ Recherche…",t.setAttribute("disabled","true");try{const i=await Z.discover(a,{force:!0}),o=[];i.login&&o.push("login"),i.dashboard&&o.push("dashboard"),i.billing&&o.push("billing"),i.api_keys&&o.push("api_keys"),i.usage&&o.push("usage"),i.docs&&o.push("docs"),i.password_reset&&o.push("reset_pw"),i.account_settings&&o.push("settings"),i.support&&o.push("support"),i.status_page&&o.push("status"),i.alive&&o.length>0?(d.success(),l.success(`🔗 ${o.length} liens trouvés (${i.source}) : ${o.join(", ")}`)):(d.error(),l.warn(`Aucun lien validé pour ${a} — réessaie plus tard`)),w(e)}catch(i){m.warn("feature-vault","discoverLinks failed",{err:i}),d.error(),l.error("Erreur pendant la recherche de liens")}finally{t.textContent=r,t.removeAttribute("disabled")}}function ge(e,a){if(a&&(d.tap(),!!window.confirm("Supprimer cette clé définitivement ? Elle sera retirée du Coffre + ne sera plus restaurée auto.")))try{S.removeKey(a),d.success(),l.success("Clé supprimée définitivement ✓"),w(e)}catch(t){m.warn("feature-vault","delete failed",{err:t}),d.error(),l.error("Suppression échouée")}}function j(e){let a=e.querySelector("#ax-vault-modal-root");return a||(a=document.createElement("div"),a.id="ax-vault-modal-root",e.appendChild(a)),a}function z(e){const a=j(e);a.innerHTML=""}function Q(e,a){const t=j(e),r=L.filter(x=>x.id!=="other").map(x=>`<option value="${g(x.id)}" ${a===x.id?"selected":""}>${g(x.label)}</option>`).join("");t.innerHTML=`
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
  `,(()=>{const x=t.querySelector("#ax-vault-modal-close");x&&n&&n.bind(x,"click",()=>z(e))})();const i=t.querySelector('[role="dialog"]');i&&n&&n.bind(i,"click",x=>{x.target===i&&z(e)});const o=t.querySelector("#ax-vault-add-detect");o&&n&&n.bind(o,"click",()=>{(async()=>{d.tap();const x=t.querySelector("#ax-vault-add-value");if(!x)return;const v=R(x.value.trim());if(!v){l.warn("Aucun pattern reconnu");return}if(v.category==="forbidden"){l.error("🚨 Type interdit");return}const y=t.querySelector("#ax-vault-add-service"),h=t.querySelector("#ax-vault-add-cat");if(y){const q=v.storageKey.replace(/^(ax_|apex_v13_)/,"").replace(/_(?:key|token|pat|sk|pk|id|secret)$/,"");y.value=q}h&&(h.value=E(y?.value??"",v.category)),l.success(`Détecté: ${v.name}`)})()});const f=t.querySelector("#ax-vault-add-save");f&&n&&n.bind(f,"click",()=>{(async()=>{d.tap();const x=t.querySelector("#ax-vault-add-service")?.value.trim()??"",v=t.querySelector("#ax-vault-add-alias")?.value.trim()??"",y=t.querySelector("#ax-vault-add-value")?.value.trim()??"";if(!x||!y){l.warn("Service et valeur requis");return}try{const h={};v&&(h.alias=v),await S.addKey(x,y,h),l.success(`✅ Clé ${x} chiffrée + sauvegardée`),z(e),w(e)}catch(h){m.warn("feature-vault","add manual failed",{err:h}),l.error("Erreur pendant la sauvegarde")}})()})}function fe(e,a){const t=j(e),r=S.listAll(!0).find(o=>o.id===a);if(!r){l.error("Clé introuvable");return}t.innerHTML=`
    <div role="dialog" aria-modal="true" aria-label="Modifier une clé"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">
      <div style="background:#0e0e1c;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;max-width:440px;width:100%">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <h2 style="margin:0;font-size:18px;color:#e8b830">✏️ Modifier ${g(r.service)}</h2>
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
          <input type="text" id="ax-vault-edit-alias" aria-label="Alias optionnel" value="${g(r.alias??"")}"
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
  `,(()=>{const o=t.querySelector("#ax-vault-modal-close");o&&n&&n.bind(o,"click",()=>z(e))})(),(()=>{const o=t.querySelector("#ax-vault-edit-cancel");o&&n&&n.bind(o,"click",()=>z(e))})();const i=t.querySelector("#ax-vault-edit-save");i&&n&&n.bind(i,"click",()=>{(async()=>{d.tap();const o=t.querySelector("#ax-vault-edit-value")?.value.trim()??"",f=t.querySelector("#ax-vault-edit-alias")?.value.trim()??"";if(!o){l.warn("Valeur requise");return}try{S.markInvalid(a,"replaced via edit");const x={};f&&(x.alias=f),await S.addKey(r.service,o,x),l.success("✅ Clé mise à jour"),z(e),w(e)}catch(x){m.warn("feature-vault","edit save failed",{err:x}),l.error("Erreur pendant la modification")}})()})}export{L as CATEGORIES,oe as autoDetectAndStore,D as buildCredentialDisplays,E as classifyService,G as computeStats,Re as dispose,g as escapeHtml,U as exportVaultJson,De as filterVaultEntries,H as formatRelativeTime,re as getCredentialsForCategory,I as listVaultEntries,Ke as removeCredential,w as render,se as renderCredentialCard};
