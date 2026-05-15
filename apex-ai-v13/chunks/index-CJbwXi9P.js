const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./vault-firebase-backup-CPKXNDUi.js","./apex-kb-Bnm9PKww.js","./monitoring-3uBGKGRH.js","./credential-patterns-CLzI061R.js","./multi-source-analyze-D15Z0Ibq.js","./auth-DfNbImAn.js","../assets/css/main-DBQtIeVv.css"])))=>i.map(i=>d[i]);
import{v as B,_}from"./apex-kb-Bnm9PKww.js";import{c as X}from"./listener-cleanup-Y2rGGxxX.js";import{l as m}from"./monitoring-3uBGKGRH.js";import{s as P,a as Y}from"../core/main-DJG6Q3RZ.js";import{autoDiscoverLinks as Z}from"./auto-discover-links-B2p95ndf.js";import{detectCredential as R,CREDENTIAL_PATTERNS as V}from"./credential-patterns-CLzI061R.js";import{c as ee}from"./csp-style-helper-BisGRi53.js";import{g as te}from"./apex-tools-dispatch-Vr2zafOB.js";import{g as re}from"./generic-secrets-BrkHfQmq.js";import{l as O}from"./multi-source-analyze-D15Z0Ibq.js";import{multiKeyVault as S}from"./multi-key-vault-CNllwLYI.js";import{haptic as d}from"./haptic-CQFg2PXZ.js";import{toast as l}from"./toast-ClsF1KRZ.js";import"./apex-tools-registry-QrqBtw0n.js";import"./voice-Digjkztq.js";let n=null;function Le(){n?.cleanup(),n=null}function g(e){return e.replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r]??r)}const L=[{id:"ai",label:"🤖 IA & LLM",serviceMatchers:["anthropic","openai","groq","google","gemini","openrouter","cohere","mistral","perplexity","deepseek","xai","elevenlabs","replicate","huggingface","fireworks","togetherai","deepl"],patternCategories:["ai"]},{id:"finance",label:"💳 Paiements & Finance",serviceMatchers:["stripe","paypal","revolut","wise","lydia","n26","boursorama","fortuneo","ing","socgen","bnp","credit_agricole","credit_mutuel","banque_postale","lbp","bpce","shopify"],patternCategories:["finance"]},{id:"devops",label:"🛠 DevOps & Code",serviceMatchers:["github","gitlab","cloudflare","vercel","netlify","railway","aws","heroku","sentry","npm"],patternCategories:["devops"]},{id:"comms",label:"📨 Communications",serviceMatchers:["telegram","discord","slack","brevo","resend","twilio","sendgrid","mailchimp","whatsapp"],patternCategories:["comms"]},{id:"social",label:"🌐 Réseaux sociaux",serviceMatchers:["facebook","instagram","tiktok","youtube","twitter","linkedin"],patternCategories:[]},{id:"storage",label:"☁️ Stockage & Cloud",serviceMatchers:["firebase","supabase","airtable","notion","dropbox","pinecone","weaviate"],patternCategories:["storage"]},{id:"ecommerce",label:"🛒 E-commerce",serviceMatchers:["shopify","stripe_connect","paypal_business"],patternCategories:[]},{id:"crypto",label:"₿ Crypto",serviceMatchers:["coinbase","binance","crypto_com","kraken"],patternCategories:[]},{id:"identity",label:"🆔 Identité Kevin",serviceMatchers:["kevin","iban","siret","vat","bic","apple","microsoft"],patternCategories:["identity"]},{id:"other",label:"📦 Autres",serviceMatchers:[],patternCategories:["saas"]}];function E(e,r){const t=e.toLowerCase();let a=null;for(const i of L)if(i.id!=="other")for(const o of i.serviceMatchers)t.includes(o)&&(!a||o.length>a.matchLen)&&(a={catId:i.id,matchLen:o.length});if(a)return a.catId;if(r){for(const i of L)if(i.patternCategories.includes(r))return i.id}return"other"}function I(){return V.filter(e=>e.category!=="forbidden").map(e=>{const r=B.getKeyStatus(e.storageKey),t=(()=>{try{return localStorage.getItem(e.storageKey)??""}catch{return""}})(),a=t&&t.length>8&&!t.startsWith("AXENC1:")?B.maskKey(t):t.startsWith("AXENC1:")?"🔒 chiffré":"";return{pattern:e,status:r,masked:a}})}function Me(e,r){return e.filter(t=>{if(r.category&&t.pattern.category!==r.category||r.configuredOnly&&t.status==="empty")return!1;if(r.query){const a=r.query.toLowerCase();if(!(t.pattern.name.toLowerCase().includes(a)||t.pattern.storageKey.toLowerCase().includes(a)))return!1}return!0})}function K(){const e=[];let r=[];try{r=S.listAll(!0)}catch(t){m.warn("feature-vault","multiKeyVault.listAll failed",{err:t})}for(const t of r){const a=O.get(t.service),i=V.find(u=>u.storageKey.includes(t.service)),o={id:t.id,service:t.service,serviceName:a?.name??ie(t.service),category:E(t.service,i?.category),status:t.status,source:"multi-key"};t.alias!==void 0&&(o.alias=t.alias),t.addedAt!==void 0&&(o.addedAt=t.addedAt),t.lastTestedAt!==void 0&&(o.lastTestedAt=t.lastTestedAt);const x=O.getRechargeLink(t.service);x&&(o.rechargeUrl=x),e.push(o)}return e}function G(){const e=K(),r={total:e.length,active:0,failing:0,invalid:0};for(const t of e)t.status==="active"?r.active+=1:t.status==="failing"||t.status==="rate-limited"?r.failing+=1:t.status==="invalid"&&(r.invalid+=1);return r}function ae(e,r=""){const t=K(),a=r.trim().toLowerCase();return t.filter(i=>i.category!==e.id?!1:a?i.service.toLowerCase().includes(a)||i.serviceName.toLowerCase().includes(a)||(i.alias?.toLowerCase().includes(a)??!1):!0)}function ie(e){return e.charAt(0).toUpperCase()+e.slice(1)}async function oe(e){const r=e.trim();if(!r)return{ok:!1,reason:"Entrée vide"};const t=R(r);if(t&&t.category==="forbidden")return{ok:!1,reason:"🚨 Type interdit (cartes/seed phrases jamais stockées)"};if(t)try{const a=await B.encryptAuto(r);return localStorage.setItem(t.storageKey,a),{ok:!0,pattern_name:t.name,storage_key:t.storageKey}}catch(a){return m.warn("vault-feature","autoDetectAndStore failed",{err:a}),{ok:!1,reason:"Erreur chiffrement"}}if(r.length>=20){const a=await re.add(r,void 0,"Auto-détecté (pattern inconnu)");return a.ok?{ok:!0,generic:!0,pattern_name:"Secret générique",storage_key:"apex_v13_generic_secrets",generic_id:a.id}:{ok:!1,reason:a.reason}}return{ok:!1,reason:"Aucun pattern reconnu (trop court pour secret générique)"}}function Ie(e){try{return localStorage.removeItem(e),!0}catch(r){return m.warn("vault-feature","remove failed",{err:r}),!1}}function H(e){const r={exported_at:new Date().toISOString(),version:1,entries:e.filter(t=>t.status!=="empty").map(t=>{const a=(()=>{try{return localStorage.getItem(t.pattern.storageKey)??""}catch{return""}})();return{storage_key:t.pattern.storageKey,name:t.pattern.name,value_encrypted:a}})};return JSON.stringify(r,null,2)}function se(e){const r=ne[e.status]??"#888",t=le[e.status]??"⚪",a=(e.preview??"").slice(0,4)+"••••••"+(e.preview??"").slice(-4),i=e.preview?a:"••••••",o=e.rechargeUrl??"",x=e.alias?`<span style="color:#888;font-size:11px">— ${g(e.alias)}</span>`:"",u=e.logoUrl?`<img src="${g(e.logoUrl)}" alt="" loading="lazy" decoding="async" style="width:24px;height:24px;border-radius:6px" onerror="this.style.display='none'">`:"",v=[];e.addedAt&&v.push(`Ajouté ${U(e.addedAt)}`),e.lastTestedAt&&v.push(`Testé ${U(e.lastTestedAt)}`);const y=v.length>0?`<div style="display:flex;gap:8px;font-size:11px;color:#888;margin-bottom:10px">${v.map(h=>`<span>${g(h)}</span>`).join("")}</div>`:"";return`
    <div class="ax-cred-card" data-cred-id="${g(e.id)}" data-service="${g(e.service)}"
      style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;transition:all 200ms ease-out;position:relative;display:flex;flex-direction:column;gap:8px">
      <div style="position:absolute;top:14px;right:14px;width:10px;height:10px;border-radius:50%;background:${g(r)};box-shadow:0 0 8px ${g(r)}" title="${g(t)} ${g(e.status)}"></div>
      <div style="display:flex;align-items:center;gap:10px">
        ${u}
        <strong style="font-size:15px;color:#fff">${g(e.serviceName)}</strong>
        ${x}
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
  `}const ne={active:"#22cc77",failing:"#ffaa00","rate-limited":"#ffaa00",invalid:"#ff5b5b",unknown:"#888"},le={active:"🟢",failing:"🟡","rate-limited":"🟡",invalid:"🔴",unknown:"⚪"};function U(e){const r=Date.now()-e;if(r<0||!Number.isFinite(r))return"à l'instant";const t=Math.floor(r/6e4);if(t<1)return"à l'instant";if(t<60)return`il y a ${t}min`;const a=Math.floor(t/60);if(a<24)return`il y a ${a}h`;const i=Math.floor(a/24);return i<30?`il y a ${i}j`:`il y a ${Math.floor(i/30)} mois`}let D="";function w(e){if(n?.cleanup(),n=X("vault"),!P.get("isAdmin")){e.innerHTML=`<div style="padding:40px;text-align:center"><h2 style="color:#c9a227">🔒 Coffre admin</h2><p style="color:#a0a4c0">Cette section est réservée à l'admin Kevin.</p></div>`;return}const t=P.get("user")?.id??"anon";if(!te("admin.vault",e,t))return;const a=G();e.innerHTML=ee.withNonce(`
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
            <span>📊 ${a.total} codes</span>
            <span style="color:#22cc77">🟢 ${a.active} actifs</span>
            <span style="color:#ffaa00">🟡 ${a.failing} dégradés</span>
            <span style="color:#ff5b5b">🔴 ${a.invalid} invalides</span>
          </div>
        </header>

        <div class="ax-vault-search-row" style="padding-bottom:12px;transition:padding 200ms ease">
          <input type="text" id="ax-vault-search" aria-label="Chercher un service dans le coffre" value="${g(D)}" placeholder="🔍 Chercher un service..."
            style="width:100%;padding:12px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;color:#fff;font-size:15px;box-sizing:border-box;-webkit-appearance:none;min-height:44px">
        </div>
      </div>

      <div style="height:14px"></div>

      ${a.total===0||a.invalid>0?`
      <section id="ax-vault-empty-rescue" style="background:linear-gradient(135deg,rgba(255,91,91,0.12),rgba(232,184,48,0.08));border:1px solid rgba(255,91,91,0.4);border-radius:14px;padding:14px;margin-bottom:14px">
        <h3 style="margin:0 0 6px;font-size:14px;color:#ff5b5b;font-weight:700">${a.total===0?"🆘 Coffre vide — Restauration possible":`🚨 ${a.invalid} clé(s) illisible(s) — récupération ou cleanup`}</h3>
        <p style="margin:0 0 10px;color:rgba(255,255,255,0.78);font-size:12.5px;line-height:1.45">${a.total===0?"Apex peut tenter de récupérer tes clés depuis 4 sources : Firebase backup chiffré, IndexedDB shadow, alias localStorage, pattern detection.":"Ces clés ont été chiffrées avec une passphrase historisée perdue (régression v13.3.86 fixée v13.3.88). Soit re-coller les clés une par une, soit supprimer les illisibles."}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button id="ax-vault-rescue-fb" data-action="rescue-firebase" style="padding:10px 16px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px;min-height:40px">🔓 Restaurer depuis Firebase</button>
          <button id="ax-vault-rescue-all" data-action="rescue-scan-all" style="padding:10px 16px;background:rgba(106,138,255,0.15);color:#6a8aff;border:1px solid rgba(106,138,255,0.3);border-radius:10px;cursor:pointer;font-size:13px;min-height:40px">🔄 Scanner toutes sources</button>
          ${a.invalid>0?`<button id="ax-vault-cleanup-invalid" data-action="cleanup-invalid" style="padding:10px 16px;background:rgba(255,91,91,0.15);color:#ff5b5b;border:1px solid rgba(255,91,91,0.4);border-radius:10px;cursor:pointer;font-size:13px;min-height:40px">🗑 Supprimer ${a.invalid} illisibles</button>`:""}
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
  `),F(e),de(e),ce(e),m.info("feature-vault",`rendered (${a.total} entries)`)}function ce(e){const r=e.querySelector(".ax-vault-page"),t=e.querySelector("#ax-vault-fab");if(!r)return;let a=0,i=0;const o=()=>{i||(i=requestAnimationFrame(()=>{i=0;const x=window.scrollY||document.documentElement.scrollTop||0;x!==a&&(a=x,x>80?r.classList.add("ax-vault-scrolled"):r.classList.remove("ax-vault-scrolled"))}))};n?n.bind(window,"scroll",o,{passive:!0}):window.addEventListener("scroll",o,{passive:!0}),o(),t&&n&&n.bind(t,"click",()=>{d.tap(),e.querySelector("#ax-vault-test-all")?.click()})}function F(e){const r=e.querySelector("#ax-vault-categories");if(!r)return;if(G().total===0&&!r.dataset.axInitialized){r.dataset.axInitialized="1";const o=document.createElement("div");o.className="ax-skel-vault-wrapper",r.appendChild(o);const x=Y(o,"vault-cards");setTimeout(()=>{x(),o.remove(),F(e)},250)}const a=L.map(o=>{const x=ae(o,D);if(x.length===0&&o.id!=="identity")return"";const u=x.length>0;return`
      <details class="ax-cat" data-cat-id="${g(o.id)}" ${u?"open":""}
        style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;overflow:hidden">
        <summary style="padding:14px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-weight:600;list-style:none;-webkit-tap-highlight-color:transparent;min-height:44px">
          <span>${g(o.label)} <span style="color:#888;font-weight:400;font-size:13px">(${x.length})</span></span>
          <span class="ax-chevron" style="color:#888;transition:transform 200ms ease-out">▼</span>
        </summary>
        <div style="padding:0 14px 14px;display:grid;grid-template-columns:repeat(auto-fill, minmax(280px,1fr));gap:10px">
          ${x.map(v=>se(v)).join("")}
          ${x.length===0?`
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
    `}).join("");let i=r.querySelector(".ax-vault-cats-wrapper");i||(i=document.createElement("div"),i.className="ax-vault-cats-wrapper",r.appendChild(i)),i.innerHTML=a}function de(e){const r=e.querySelector("#ax-vault-search");if(r){let s=null;n.bind(r,"input",()=>{s&&clearTimeout(s),s=setTimeout(()=>{D=r.value.trim(),F(e),N(e)},240)})}const t=e.querySelector("#ax-vault-add-manual");t&&n&&n.bind(t,"click",()=>{d.tap(),Q(e)});const a=e.querySelector("#ax-vault-test-all");a&&n&&n.bind(a,"click",()=>{(async()=>{d.tap(),l.info("Test de toutes les clés en cours…");try{const s=await S.healthCheckAll();l.success(`✅ ${s.tested} testées · ${s.recovered} récupérées · ${s.stillDown} HS`),w(e)}catch(s){m.warn("feature-vault","testAll failed",{err:s}),l.error("Erreur pendant le test global")}})()});const i=e.querySelector("#ax-vault-rescue-fb");i&&n&&n.bind(i,"click",()=>{(async()=>{d.tap();const s=e.querySelector("#ax-vault-rescue-result");s&&(s.innerHTML="⏳ Lecture Firebase backup chiffré…");try{const{vaultFirebaseBackup:c}=await _(async()=>{const{vaultFirebaseBackup:f}=await import("./vault-firebase-backup-CPKXNDUi.js");return{vaultFirebaseBackup:f}},__vite__mapDeps([0,1,2,3,4]),import.meta.url),p=await c.restoreAllFromFirebaseBackup();s&&(s.innerHTML=`<div style="padding:8px;background:rgba(34,204,119,.1);color:#22cc77;border-radius:8px">🔓 ${p.restored} clés restaurées · ${p.failed} échouées · ${p.skipped} ignorées</div>`),p.restored>0?(l.success(`🔓 ${p.restored} clés restaurées depuis Firebase backup`),d.success(),setTimeout(()=>w(e),600)):l.info("Aucune clé trouvée dans Firebase backup")}catch(c){m.warn("feature-vault","rescueFb failed",{err:c}),s&&(s.innerHTML=`<div style="padding:8px;background:rgba(255,88,88,.1);color:#ff5858;border-radius:8px">⚠ ${g(String(c).slice(0,120))}</div>`),l.error("Erreur lecture Firebase backup"),d.error()}})()});const o=e.querySelector("#ax-vault-rescue-all");o&&n&&n.bind(o,"click",()=>{(async()=>{d.tap();const s=e.querySelector("#ax-vault-rescue-result");s&&(s.innerHTML="⏳ Scan 4 sources : alias, IDB, Firebase, pattern…");try{const{autoRestoreCredentials:c}=await _(async()=>{const{autoRestoreCredentials:f}=await import("./auto-restore-credentials-DqMHc9Mc.js");return{autoRestoreCredentials:f}},__vite__mapDeps([1,2,3,4]),import.meta.url),p=await c.restoreAutomatically();s&&(s.innerHTML=`<div style="padding:8px;background:rgba(34,204,119,.1);color:#22cc77;border-radius:8px">🔓 ${p.restored} restaurées · ${p.failed} échouées</div>`),p.restored>0?(l.success(`🔓 ${p.restored} clés restaurées (4 sources)`),d.success(),setTimeout(()=>w(e),600)):l.info("Aucune clé trouvable dans les 4 sources. Colle une clé manuellement ci-dessous.")}catch(c){m.warn("feature-vault","rescueAll failed",{err:c}),s&&(s.innerHTML=`<div style="padding:8px;background:rgba(255,88,88,.1);color:#ff5858;border-radius:8px">⚠ ${g(String(c).slice(0,120))}</div>`),l.error("Erreur scan multi-sources"),d.error()}})()});const x=e.querySelector("#ax-vault-cleanup-invalid");x&&n&&n.bind(x,"click",()=>{(async()=>{d.tap();const s=e.querySelector("#ax-vault-rescue-result");if(confirm(`Supprimer définitivement toutes les clés illisibles (decrypt fail) ?

Ces clés sont chiffrées avec une passphrase perdue. Tu devras les recoller pour les retrouver.`)){s&&(s.innerHTML="⏳ Suppression des entrées illisibles…");try{const p=K().filter(b=>b.status==="invalid");let f=0;for(const b of p)try{if(b.id.startsWith("mkv_")||b.id.includes("_")){S.removeKey(b.id),f++;continue}const A=b.id.startsWith("ax_")||b.id.startsWith("apex_v13_")?b.id:`ax_${b.service}_key`;localStorage.removeItem(A);const C=indexedDB.open("apex_v13_vault_shadow",1);C.onsuccess=()=>{try{C.result.transaction("keys","readwrite").objectStore("keys").delete(A),C.result.close()}catch{}},f++}catch{}s&&(s.innerHTML=`<div style="padding:8px;background:rgba(34,204,119,.1);color:#22cc77;border-radius:8px">🗑 ${f} clé(s) illisibles supprimées. Recolle tes clés via "Détecter & stocker" ci-dessous.</div>`),l.success(`🗑 ${f} clés illisibles supprimées`),d.success(),setTimeout(()=>w(e),800)}catch(c){m.warn("feature-vault","cleanupInvalid failed",{err:c}),l.error("Erreur suppression"),d.error()}}})()});const u=e.querySelector("#ax-vault-paste-clipboard-btn");u&&n&&n.bind(u,"click",()=>{(async()=>{d.tap();const s=e.querySelector("#ax-vault-paste"),c=e.querySelector("#ax-vault-paste-result");if(s)try{if(!navigator.clipboard?.readText)throw new Error("Clipboard API non supportée");const p=await navigator.clipboard.readText();if(!p){c&&(c.innerHTML='<div style="padding:8px;background:rgba(240,192,32,.1);color:#f0c020;border-radius:8px">⚠ Presse-papier vide</div>');return}s.value=p,s.dispatchEvent(new Event("input",{bubbles:!0})),d.success(),l.success(`📋 ${p.length} caractères collés — clique "Détecter & stocker"`),c&&(c.innerHTML='<div style="padding:8px;background:rgba(106,138,255,.1);color:#6a8aff;border-radius:8px">📋 Collé — clique "Détecter & stocker" pour analyser</div>'),s.focus()}catch(p){const f=p instanceof Error?p.message:"unknown";l.error(`Clipboard refusé : ${f}. Utilise long-press → Coller manuellement.`),c&&(c.innerHTML='<div style="padding:8px;background:rgba(255,88,88,.1);color:#ff5858;border-radius:8px">⚠ Permission refusée. Long-press dans le champ → Coller.</div>')}})()});const v=e.querySelector("#ax-vault-paste-btn");v&&n&&n.bind(v,"click",()=>{(async()=>{d.tap();const s=e.querySelector("#ax-vault-paste"),c=e.querySelector("#ax-vault-paste-result");if(!s||!c)return;const p=s.value.trim();if(!p){c.innerHTML=`<div style="padding:8px;background:rgba(240,192,32,.1);color:#f0c020;border-radius:8px">⚠ Colle quelque chose d'abord</div>`;return}const f=await oe(p);if(f.ok){d.success(),l.success(`✅ ${f.pattern_name} stocké`),c.innerHTML=`<div style="padding:8px;background:rgba(34,204,119,.1);color:#22cc77;border-radius:8px">✅ ${g(f.pattern_name)} → ${g(f.storage_key)}</div>`;const b=R(p);if(b){const A=b.storageKey.replace(/^(ax_|apex_v13_)/,"").replace(/_(?:key|token|pat|sk|pk|id|secret)$/,"");try{await S.addKey(A,p)}catch{}}s.value="",w(e)}else d.error(),l.error(f.reason),c.innerHTML=`<div style="padding:8px;background:rgba(255,88,88,.1);color:#ff5858;border-radius:8px">⚠ ${g(f.reason)}</div>`})()});const y=e.querySelector("#ax-vault-import");y&&n&&n.bind(y,"click",()=>{(async()=>{d.tap();try{const{apexVaultImport:s}=await _(async()=>{const{apexVaultImport:p}=await import("./apex-vault-import-BEI0Fh6l.js");return{apexVaultImport:p}},__vite__mapDeps([2,1,3]),import.meta.url),c=await s.promptAndImport();if(c.cancelled){l.info("Import annulé",{duration:2e3});return}c.ok&&c.restored>0?(l.success(`🔓 ${c.restored} clés restaurées depuis JSON Drive${c.failed>0?` · ${c.failed} échouées`:""}`,{duration:8e3}),setTimeout(()=>location.reload(),1500)):c.decrypt_failed>0?l.error(`🔒 ${c.decrypt_failed} clés non déchiffrables. PIN admin différent ? Vérifie ton PIN actuel.`,{duration:1e4}):c.error?l.error(`Import échoué : ${c.error.slice(0,80)}`,{duration:8e3}):l.warn("Aucune clé restaurée depuis ce JSON",{duration:5e3})}catch(s){const c=s instanceof Error?s.message:String(s);l.error(`Import erreur : ${c.slice(0,80)}`,{duration:8e3})}})()});const h=e.querySelector("#ax-vault-export");h&&n&&n.bind(h,"click",()=>{d.tap();const s=H(I()),c=new Blob([s],{type:"application/json"}),p=URL.createObjectURL(c),f=document.createElement("a");f.href=p,f.download=`apex-vault-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(f),f.click(),document.body.removeChild(f),URL.revokeObjectURL(p),l.success("Coffre exporté (chiffré)")});const q=e.querySelector("#ax-vault-qr-backup");q&&n&&n.bind(q,"click",()=>{(async()=>{d.tap();try{const s=H(I()),c=(s.length/1024).toFixed(1),p=I().length,f=2500;let b="";try{b=(await _(()=>import("https://cdn.jsdelivr.net/npm/lz-string@1.5.0/+esm"),[],import.meta.url)).compressToEncodedURIComponent(s);const k=(b.length/1024).toFixed(1);m.info("vault-qr-backup",`LZ compress ${c}KB → ${k}KB (${Math.round((1-b.length/s.length)*100)}% gain)`)}catch($){m.warn("vault-qr-backup","LZ-string load failed",{err:$})}if(b&&b.length<f){const{apexQrBackup:$}=await _(async()=>{const{apexQrBackup:k}=await import("./apex-qr-backup-SXU3AxAx.js");return{apexQrBackup:k}},__vite__mapDeps([2]),import.meta.url);await $.showQrBackupModal({text:`APEXVAULT_LZ:${b}`,title:"📦 Backup Vault Compressé — Photos iCloud",description:`${p} clés compressées LZ (${(b.length/1024).toFixed(1)}KB vs ${c}KB orig). JSON chiffré AES-GCM-256. Sauvegarde dans Photos iCloud — au reinstall, scan = restore complet.`,filename:`apex-vault-backup-${new Date().toISOString().slice(0,10)}.png`});return}l.info(`Vault compressé ${b.length}B encore > QR max. Upload Gist privé chiffré...`,{duration:4e3});try{const{apexGithubGistBackup:$}=await _(async()=>{const{apexGithubGistBackup:M}=await import("./apex-github-gist-backup-BEZ3rOcl.js");return{apexGithubGistBackup:M}},__vite__mapDeps([5,1,2,3,4,6]),import.meta.url),k=await $.pushBackup({force:!0});if(k.ok&&k.gist_id){const M=`https://gist.github.com/${k.gist_id}`,{apexQrBackup:J}=await _(async()=>{const{apexQrBackup:W}=await import("./apex-qr-backup-SXU3AxAx.js");return{apexQrBackup:W}},__vite__mapDeps([2]),import.meta.url);await J.showQrBackupModal({text:`APEXVAULT_GIST:${k.gist_id}`,title:"📦 Backup Vault → Gist URL — Photos iCloud",description:`${p} clés uploadées Gist privé chiffré (${(k.bytes??0)/1024}KB). QR contient juste l'ID Gist. Au reinstall, scan + PAT GitHub = pull Gist + restore complet. URL : ${M}`,filename:`apex-vault-gist-${new Date().toISOString().slice(0,10)}.png`});return}l.warn(`Gist upload échoué : ${k.error??"?"}. Fallback download JSON.`,{duration:6e3})}catch($){m.warn("vault-qr-backup","gist push failed",{err:$})}const A=new Blob([s],{type:"application/json"}),C=URL.createObjectURL(A),T=document.createElement("a");T.href=C,T.download=`apex-vault-backup-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(T),T.click(),document.body.removeChild(T),URL.revokeObjectURL(C),l.success(`📥 Backup JSON téléchargé (${c}KB chiffré). Sauvegarde dans iCloud Drive / Notes.`,{duration:8e3})}catch(s){const c=s instanceof Error?s.message:String(s);l.error(`Backup QR échoué : ${c.slice(0,60)}`,{duration:6e3})}})()}),N(e)}function N(e){e.querySelectorAll('[data-action="test"]').forEach(r=>{n.bind(r,"click",t=>{t.stopPropagation();const a=r.dataset.credId??"";pe(e,a,r)})}),e.querySelectorAll('[data-action="recharge"]').forEach(r=>{n.bind(r,"click",t=>{t.stopPropagation();const a=r.dataset.rechargeUrl??"",i=r.dataset.service??"";ue(a,i)})}),e.querySelectorAll('[data-action="discover-links"]').forEach(r=>{n.bind(r,"click",t=>{t.stopPropagation();const a=r.dataset.service??"";ge(e,a,r)})}),e.querySelectorAll('[data-action="edit"]').forEach(r=>{n.bind(r,"click",t=>{t.stopPropagation();const a=r.dataset.credId??"";fe(e,a)})}),e.querySelectorAll('[data-action="delete"]').forEach(r=>{n.bind(r,"click",t=>{t.stopPropagation();const a=r.dataset.credId??"";xe(e,a)})}),e.querySelectorAll('[data-action="add-to-cat"]').forEach(r=>{n.bind(r,"click",t=>{t.stopPropagation();const a=r.dataset.catId??"";Q(e,a)})})}async function pe(e,r,t){if(!r)return;d.tap();const a=t.textContent;t.textContent="⏳ Test…",t.setAttribute("disabled","true");try{const i=await S.testKey(r);i.ok?(d.success(),l.success(`✅ Active (${i.latencyMs}ms)`)):(d.error(),l.error(`❌ ${i.reason??"Test échoué"}`)),w(e)}catch(i){m.warn("feature-vault","testKey failed",{err:i}),d.error(),l.error("Erreur pendant le test"),t.textContent=a,t.removeAttribute("disabled")}}function ue(e,r){if(d.tap(),!e){l.warn(`Aucune page recharge connue pour ${r}`);return}try{window.open(e,"_blank","noopener,noreferrer")}catch(t){m.warn("feature-vault","recharge open failed",{err:t}),l.error("Impossible d'ouvrir le lien")}}async function ge(e,r,t){if(!r)return;d.tap();const a=t.textContent;t.textContent="⏳ Recherche…",t.setAttribute("disabled","true");try{const i=await Z.discover(r,{force:!0}),o=[];i.login&&o.push("login"),i.dashboard&&o.push("dashboard"),i.billing&&o.push("billing"),i.api_keys&&o.push("api_keys"),i.usage&&o.push("usage"),i.docs&&o.push("docs"),i.password_reset&&o.push("reset_pw"),i.account_settings&&o.push("settings"),i.support&&o.push("support"),i.status_page&&o.push("status"),i.alive&&o.length>0?(d.success(),l.success(`🔗 ${o.length} liens trouvés (${i.source}) : ${o.join(", ")}`)):(d.error(),l.warn(`Aucun lien validé pour ${r} — réessaie plus tard`)),w(e)}catch(i){m.warn("feature-vault","discoverLinks failed",{err:i}),d.error(),l.error("Erreur pendant la recherche de liens")}finally{t.textContent=a,t.removeAttribute("disabled")}}function xe(e,r){if(r&&(d.tap(),!!window.confirm("Supprimer cette clé définitivement ? Elle sera retirée du Coffre + ne sera plus restaurée auto.")))try{S.removeKey(r),d.success(),l.success("Clé supprimée définitivement ✓"),w(e)}catch(t){m.warn("feature-vault","delete failed",{err:t}),d.error(),l.error("Suppression échouée")}}function j(e){let r=e.querySelector("#ax-vault-modal-root");return r||(r=document.createElement("div"),r.id="ax-vault-modal-root",e.appendChild(r)),r}function z(e){const r=j(e);r.innerHTML=""}function Q(e,r){const t=j(e),a=L.filter(u=>u.id!=="other").map(u=>`<option value="${g(u.id)}" ${r===u.id?"selected":""}>${g(u.label)}</option>`).join("");t.innerHTML=`
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
            ${a}
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
  `,(()=>{const u=t.querySelector("#ax-vault-modal-close");u&&n&&n.bind(u,"click",()=>z(e))})();const i=t.querySelector('[role="dialog"]');i&&n&&n.bind(i,"click",u=>{u.target===i&&z(e)});const o=t.querySelector("#ax-vault-add-detect");o&&n&&n.bind(o,"click",()=>{(async()=>{d.tap();const u=t.querySelector("#ax-vault-add-value");if(!u)return;const v=R(u.value.trim());if(!v){l.warn("Aucun pattern reconnu");return}if(v.category==="forbidden"){l.error("🚨 Type interdit");return}const y=t.querySelector("#ax-vault-add-service"),h=t.querySelector("#ax-vault-add-cat");if(y){const q=v.storageKey.replace(/^(ax_|apex_v13_)/,"").replace(/_(?:key|token|pat|sk|pk|id|secret)$/,"");y.value=q}h&&(h.value=E(y?.value??"",v.category)),l.success(`Détecté: ${v.name}`)})()});const x=t.querySelector("#ax-vault-add-save");x&&n&&n.bind(x,"click",()=>{(async()=>{d.tap();const u=t.querySelector("#ax-vault-add-service")?.value.trim()??"",v=t.querySelector("#ax-vault-add-alias")?.value.trim()??"",y=t.querySelector("#ax-vault-add-value")?.value.trim()??"";if(!u||!y){l.warn("Service et valeur requis");return}try{const h={};v&&(h.alias=v),await S.addKey(u,y,h),l.success(`✅ Clé ${u} chiffrée + sauvegardée`),z(e),w(e)}catch(h){m.warn("feature-vault","add manual failed",{err:h}),l.error("Erreur pendant la sauvegarde")}})()})}function fe(e,r){const t=j(e),a=S.listAll(!0).find(o=>o.id===r);if(!a){l.error("Clé introuvable");return}t.innerHTML=`
    <div role="dialog" aria-modal="true" aria-label="Modifier une clé"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">
      <div style="background:#0e0e1c;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;max-width:440px;width:100%">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <h2 style="margin:0;font-size:18px;color:#e8b830">✏️ Modifier ${g(a.service)}</h2>
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
          <input type="text" id="ax-vault-edit-alias" aria-label="Alias optionnel" value="${g(a.alias??"")}"
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
  `,(()=>{const o=t.querySelector("#ax-vault-modal-close");o&&n&&n.bind(o,"click",()=>z(e))})(),(()=>{const o=t.querySelector("#ax-vault-edit-cancel");o&&n&&n.bind(o,"click",()=>z(e))})();const i=t.querySelector("#ax-vault-edit-save");i&&n&&n.bind(i,"click",()=>{(async()=>{d.tap();const o=t.querySelector("#ax-vault-edit-value")?.value.trim()??"",x=t.querySelector("#ax-vault-edit-alias")?.value.trim()??"";if(!o){l.warn("Valeur requise");return}try{S.markInvalid(r,"replaced via edit");const u={};x&&(u.alias=x),await S.addKey(a.service,o,u),l.success("✅ Clé mise à jour"),z(e),w(e)}catch(u){m.warn("feature-vault","edit save failed",{err:u}),l.error("Erreur pendant la modification")}})()})}export{L as CATEGORIES,oe as autoDetectAndStore,K as buildCredentialDisplays,E as classifyService,G as computeStats,Le as dispose,g as escapeHtml,H as exportVaultJson,Me as filterVaultEntries,U as formatRelativeTime,ae as getCredentialsForCategory,I as listVaultEntries,Ie as removeCredential,w as render,se as renderCredentialCard};
