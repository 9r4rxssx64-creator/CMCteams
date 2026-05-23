const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./vault-firebase-backup-CsVqwhmb.js","./apex-kb-BHBYXtTa.js","./monitoring-Bj7krNVC.js","./multi-source-analyze-DKS_jL8s.js","./credential-patterns-CLzI061R.js","./auth-Dklme3ID.js"])))=>i.map(i=>d[i]);
import{v as P,_ as q}from"./apex-kb-BHBYXtTa.js";import{a as g}from"./escape-html-DGIYNPKb.js";import{c as ne}from"./listener-cleanup-Y2rGGxxX.js";import{q as m,C as W}from"./monitoring-Bj7krNVC.js";import{g as le}from"./apex-tools-dispatch-core-DrqE-Vie.js";import{c as ce}from"./csp-style-helper-BisGRi53.js";import{autoDiscoverLinks as de}from"./auto-discover-links-D1s805UH.js";import{l as X}from"./multi-source-analyze-DKS_jL8s.js";import{detectCredential as O,CREDENTIAL_PATTERNS as te}from"./credential-patterns-CLzI061R.js";import{g as pe}from"./generic-secrets-DxYkkIK9.js";import{multiKeyVault as T}from"./multi-key-vault-B7_KUiTs.js";import{haptic as u}from"./haptic-CQFg2PXZ.js";import{s as ue}from"../core/main-aZLfBgNO.js";import{toast as c}from"./toast-CRdbcLoc.js";import"./apex-tools-dispatch-skills-BF3LOLbG.js";import"./apex-tools-dispatch-data-oVkAb8p8.js";import"./apex-tools-dispatch-finance-DoRAfEZC.js";import"./apex-tools-dispatch-misc-C1mX80Im.js";import"./apex-tools-misc-H1MdLdN0.js";import"./apex-tools-registry-core-CQvgkOQw.js";import"./apex-tools-registry-skills-DRX4PPQ_.js";let d=null;function Ge(){d?.cleanup(),d=null}const E=[{id:"ai",label:"🤖 IA & LLM",serviceMatchers:["anthropic","openai","groq","google","gemini","openrouter","cohere","mistral","perplexity","deepseek","xai","elevenlabs","replicate","huggingface","fireworks","togetherai","deepl"],patternCategories:["ai"]},{id:"finance",label:"💳 Paiements & Finance",serviceMatchers:["stripe","paypal","revolut","wise","lydia","n26","boursorama","fortuneo","ing","socgen","bnp","credit_agricole","credit_mutuel","banque_postale","lbp","bpce","shopify"],patternCategories:["finance"]},{id:"devops",label:"🛠 DevOps & Code",serviceMatchers:["github","gitlab","cloudflare","vercel","netlify","railway","aws","heroku","sentry","npm"],patternCategories:["devops"]},{id:"comms",label:"📨 Communications",serviceMatchers:["telegram","discord","slack","brevo","resend","twilio","sendgrid","mailchimp","whatsapp"],patternCategories:["comms"]},{id:"social",label:"🌐 Réseaux sociaux",serviceMatchers:["facebook","instagram","tiktok","youtube","twitter","linkedin"],patternCategories:[]},{id:"storage",label:"☁️ Stockage & Cloud",serviceMatchers:["firebase","supabase","airtable","notion","dropbox","pinecone","weaviate"],patternCategories:["storage"]},{id:"ecommerce",label:"🛒 E-commerce",serviceMatchers:["shopify","stripe_connect","paypal_business"],patternCategories:[]},{id:"crypto",label:"₿ Crypto",serviceMatchers:["coinbase","binance","crypto_com","kraken"],patternCategories:[]},{id:"identity",label:"🆔 Identité Kevin",serviceMatchers:["kevin","iban","siret","vat","bic","apple","microsoft"],patternCategories:["identity"]},{id:"other",label:"📦 Autres",serviceMatchers:[],patternCategories:["saas"]}];function ae(e,a){const t=e.toLowerCase();let s=null;for(const n of E)if(n.id!=="other")for(const l of n.serviceMatchers)t.includes(l)&&(!s||l.length>s.matchLen)&&(s={catId:n.id,matchLen:l.length});if(s)return s.catId;if(a){for(const n of E)if(n.patternCategories.includes(a))return n.id}return"other"}function j(){return te.filter(e=>e.category!=="forbidden").map(e=>{const a=P.getKeyStatus(e.storageKey),t=(()=>{try{return localStorage.getItem(e.storageKey)??""}catch{return""}})(),s=t&&t.length>8&&!t.startsWith("AXENC1:")?P.maskKey(t):t.startsWith("AXENC1:")?"🔒 chiffré":"";return{pattern:e,status:a,masked:s}})}function Qe(e,a){return e.filter(t=>{if(a.category&&t.pattern.category!==a.category||a.configuredOnly&&t.status==="empty")return!1;if(a.query){const s=a.query.toLowerCase();if(!(t.pattern.name.toLowerCase().includes(s)||t.pattern.storageKey.toLowerCase().includes(s)))return!1}return!0})}function N(){const e=[];let a=[];try{a=T.listAll(!0)}catch(t){m.warn("feature-vault","multiKeyVault.listAll failed",{err:t})}for(const t of a){const s=X.get(t.service),n=te.find(f=>f.storageKey.includes(t.service)),l={id:t.id,service:t.service,serviceName:s?.name??ge(t.service),category:ae(t.service,n?.category),status:t.status,source:"multi-key"};t.alias!==void 0&&(l.alias=t.alias),t.addedAt!==void 0&&(l.addedAt=t.addedAt),t.lastTestedAt!==void 0&&(l.lastTestedAt=t.lastTestedAt);const v=X.getRechargeLink(t.service);v&&(l.rechargeUrl=v),e.push(l)}return e}function re(){const e=N(),a={total:e.length,active:0,failing:0,invalid:0};for(const t of e)t.status==="active"?a.active+=1:t.status==="failing"||t.status==="rate-limited"?a.failing+=1:t.status==="invalid"&&(a.invalid+=1);return a}function xe(e,a=""){const t=N(),s=a.trim().toLowerCase();return t.filter(n=>n.category!==e.id?!1:s?n.service.toLowerCase().includes(s)||n.serviceName.toLowerCase().includes(s)||(n.alias?.toLowerCase().includes(s)??!1):!0)}function ge(e){return e.charAt(0).toUpperCase()+e.slice(1)}async function fe(e){const a=e.trim();if(!a)return{ok:!1,reason:"Entrée vide"};const t=O(a);if(t&&t.category==="forbidden")return{ok:!1,reason:"🚨 Type interdit (cartes/seed phrases jamais stockées)"};if(t)try{const s=await P.encryptAuto(a);return localStorage.setItem(t.storageKey,s),{ok:!0,pattern_name:t.name,storage_key:t.storageKey}}catch(s){return m.warn("vault-feature","autoDetectAndStore failed",{err:s}),{ok:!1,reason:"Erreur chiffrement"}}if(a.length>=20){const s=await pe.add(a,void 0,"Auto-détecté (pattern inconnu)");return s.ok?{ok:!0,generic:!0,pattern_name:"Secret générique",storage_key:"apex_v13_generic_secrets",generic_id:s.id}:{ok:!1,reason:s.reason}}return{ok:!1,reason:"Aucun pattern reconnu (trop court pour secret générique)"}}function Je(e){try{return localStorage.removeItem(e),!0}catch(a){return m.warn("vault-feature","remove failed",{err:a}),!1}}function Y(e){const a={exported_at:new Date().toISOString(),version:1,entries:e.filter(t=>t.status!=="empty").map(t=>{const s=(()=>{try{return localStorage.getItem(t.pattern.storageKey)??""}catch{return""}})();return{storage_key:t.pattern.storageKey,name:t.pattern.name,value_encrypted:s}})};return JSON.stringify(a,null,2)}function be(e){const a=ve[e.status]??"var(--ax-text-muted)",t=me[e.status]??"⚪",s=(e.preview??"").slice(0,4)+"••••••"+(e.preview??"").slice(-4),n=e.preview?s:"••••••",l=e.rechargeUrl??"",v=e.alias?`<span style="color:var(--ax-text-muted);font-size:11px">— ${g(e.alias)}</span>`:"",f=e.logoUrl?`<img src="${g(e.logoUrl)}" alt="" loading="lazy" decoding="async" style="width:24px;height:24px;border-radius:6px" onerror="this.style.display='none'">`:"",h=[];e.addedAt&&h.push(`Ajouté ${Z(e.addedAt)}`),e.lastTestedAt&&h.push(`Testé ${Z(e.lastTestedAt)}`);const S=h.length>0?`<div style="display:flex;gap:8px;font-size:11px;color:var(--ax-text-muted);margin-bottom:10px">${h.map(C=>`<span>${g(C)}</span>`).join("")}</div>`:"";return`
    <div class="ax-cred-card" data-cred-id="${g(e.id)}" data-service="${g(e.service)}"
      style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;transition:all 200ms ease-out;position:relative;display:flex;flex-direction:column;gap:8px">
      <div style="position:absolute;top:14px;right:14px;width:10px;height:10px;border-radius:50%;background:${g(a)};box-shadow:0 0 8px ${g(a)}" title="${g(t)} ${g(e.status)}"></div>
      <div class="ax-gs-120">
        ${f}
        <strong style="font-size:15px;color:#fff">${g(e.serviceName)}</strong>
        ${v}
      </div>
      <code style="display:block;padding:6px 10px;background:rgba(0,0,0,0.3);border-radius:6px;font-size:11px;color:var(--ax-text-muted);font-family:'SF Mono',Menlo,monospace;letter-spacing:1px">${g(n)}</code>
      ${S}
      <div class="ax-gs-20">
        <button data-action="test" data-cred-id="${g(e.id)}" aria-label="Tester la clé ${g(e.service)}"
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(34,204,119,0.1);color:var(--ax-green);border:1px solid rgba(34,204,119,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:44px">🔄 Test</button>
        <button data-action="recharge" data-service="${g(e.service)}" data-recharge-url="${g(l)}" ${l?"":"disabled"} aria-label="Recharger ${g(e.service)}"
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(201,162,39,0.1);color:var(--ax-gold-deep);border:1px solid rgba(201,162,39,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:44px;${l?"":"opacity:0.4;cursor:not-allowed"}">💰 Recharger</button>
        <button data-action="discover-links" data-service="${g(e.service)}" aria-label="Chercher les liens de ${g(e.service)}"
          title="Cherche login/dashboard/billing/api_keys/usage en autonomie"
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(74,158,255,0.1);color:var(--ax-blue-bright);border:1px solid rgba(74,158,255,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:44px">🔍 Chercher liens</button>
        <button data-action="edit" data-cred-id="${g(e.id)}" aria-label="Modifier la clé ${g(e.service)}" title="Modifier"
          style="min-width:44px;padding:6px 10px;background:rgba(255,255,255,0.05);color:var(--ax-text-dim);border:1px solid rgba(255,255,255,0.1);border-radius:6px;cursor:pointer;font-size:11px;min-height:44px">✏️</button>
        <button data-action="delete" data-cred-id="${g(e.id)}" aria-label="Supprimer la clé ${g(e.service)}" title="Supprimer"
          style="min-width:44px;padding:6px 10px;background:rgba(255,91,91,0.1);color:var(--ax-error);border:1px solid rgba(255,91,91,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:44px">🗑</button>
      </div>
    </div>
  `}const ve={active:"var(--ax-green)",failing:"var(--ax-warning)","rate-limited":"var(--ax-warning)",invalid:"var(--ax-error)",unknown:"var(--ax-text-muted)"},me={active:"🟢",failing:"🟡","rate-limited":"🟡",invalid:"🔴",unknown:"⚪"};function Z(e){const a=Date.now()-e;if(a<0||!Number.isFinite(a))return"à l'instant";const t=Math.floor(a/6e4);if(t<1)return"à l'instant";if(t<60)return`il y a ${t}min`;const s=Math.floor(t/60);if(s<24)return`il y a ${s}h`;const n=Math.floor(s/24);return n<30?`il y a ${n}j`:`il y a ${Math.floor(n/30)} mois`}let U="";function A(e){if(d?.cleanup(),d=ne("vault"),!W.get("isAdmin")){e.innerHTML=`<div style="padding:40px;text-align:center"><h2 class="ax-gs-372">🔒 Coffre admin</h2><p class="ax-gs-226">Cette section est réservée à l'admin Kevin.</p></div>`;return}const t=W.get("user")?.id??"anon";if(!le("admin.vault",e,t))return;const s=re();e.innerHTML=ce.withNonce(`
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
            <span>📊 ${s.total} codes</span>
            <span class="ax-gs-222">🟢 ${s.active} actifs</span>
            <span class="ax-gs-168">🟡 ${s.failing} dégradés</span>
            <span class="ax-gs-76">🔴 ${s.invalid} invalides</span>
          </div>
        </header>

        <div class="ax-vault-search-row" style="padding-bottom:12px;transition:padding 200ms ease">
          <input type="text" id="ax-vault-search" aria-label="Chercher un service dans le coffre" value="${g(U)}" placeholder="🔍 Chercher un service..."
            style="width:100%;padding:12px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;color:#fff;font-size:15px;box-sizing:border-box;-webkit-appearance:none;min-height:44px">
        </div>
      </div>

      <div style="height:14px"></div>

      ${s.total===0||s.invalid>0?`
      <section id="ax-vault-empty-rescue" class="ax-empty-banner" style="background:linear-gradient(135deg,rgba(255,91,91,0.10),rgba(232,184,48,0.06));border-color:rgba(255,91,91,0.35)">
        <h3 class="ax-empty-banner-title">${s.total===0?"🆘 Coffre vide — Restauration possible":`🚨 ${s.invalid} clé(s) illisible(s) — récupération ou cleanup`}</h3>
        <p class="ax-empty-banner-body">${s.total===0?"Apex peut tenter de récupérer tes clés depuis 4 sources : Firebase backup chiffré, IndexedDB shadow, alias localStorage, pattern detection.":"Ces clés ont été chiffrées avec une passphrase historisée perdue (régression v13.3.86 fixée v13.3.88). Soit re-coller les clés une par une, soit supprimer les illisibles."}</p>
        <div class="ax-gs-7">
          <button id="ax-vault-rescue-fb" data-action="rescue-firebase" class="ax-btn-health ax-btn-health-primary">🔓 Restaurer depuis Firebase</button>
          <button id="ax-vault-rescue-all" data-action="rescue-scan-all" class="ax-btn-health ax-btn-health-blue">🔄 Scanner toutes sources</button>
          ${s.invalid>0?`<button id="ax-vault-cleanup-invalid" data-action="cleanup-invalid" class="ax-btn-health ax-btn-health-danger">🗑 Supprimer ${s.invalid} illisibles</button>`:""}
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
        <div id="ax-vault-paste-result" class="ax-gs-249"></div>
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

      <section style="margin-top:14px;padding:14px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:14px">
        <h3 style="margin:0 0 8px;color:var(--ax-gold);font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700">📊 Diagnostic</h3>
        <p style="margin:0 0 10px;color:rgba(255,255,255,0.7);font-size:12px;line-height:1.5">Si « pas de mémoire coffre » ou « problème Cloudflare » → lance ce diag pour voir l'état exact de chaque couche (local, Firebase backup, Cloudflare proxy).</p>
        <div class="ax-gs-7">
          <button id="ax-vault-diag-btn" type="button"
            style="padding:10px 16px;background:rgba(106,138,255,0.18);color:var(--ax-blue);border:1px solid rgba(106,138,255,0.35);border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;min-height:44px">📊 Diagnostic complet</button>
          <button id="ax-vault-migrate-legacy-btn" type="button"
            style="padding:10px 16px;background:rgba(232,184,48,0.20);color:var(--ax-gold);border:1px solid rgba(232,184,48,0.45);border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;min-height:44px">🔁 Migrer mes clés legacy vers le coffre</button>
          <button id="ax-vault-push-all-btn" type="button"
            style="padding:10px 16px;background:linear-gradient(135deg,var(--ax-gold-deep),var(--ax-gold));color:#000;border:none;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;min-height:44px">📤 Push toutes mes clés vers Firebase backup</button>
        </div>
        <div id="ax-vault-diag-result" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.85)"></div>
      </section>

      <p style="text-align:center;color:rgba(255,255,255,0.4);font-size:11px;margin-top:16px;padding:14px;background:rgba(255,255,255,0.02);border-radius:12px;line-height:1.6">
        🛡 <strong style="color:rgba(255,255,255,0.6)">Sécurité</strong> : AES-GCM 256 + PBKDF2 200k iterations · Audit log immutable<br>
        <span style="opacity:0.7">FB_LOCAL strict pour ax_pin/ax_user · jamais de plaintext en backup</span>
      </p>

      <button id="ax-vault-fab" class="ax-vault-fab" type="button" aria-label="Tester toutes les clés" title="Tester toutes les clés">🔄</button>
      <div id="ax-vault-modal-root"></div>
    </div>
  `),V(e),ye(e),he(e),m.info("feature-vault",`rendered (${s.total} entries)`)}function he(e){const a=e.querySelector(".ax-vault-page"),t=e.querySelector("#ax-vault-fab");if(!a)return;let s=0,n=0;const l=()=>{n||(n=requestAnimationFrame(()=>{n=0;const v=window.scrollY||document.documentElement.scrollTop||0;v!==s&&(s=v,v>80?a.classList.add("ax-vault-scrolled"):a.classList.remove("ax-vault-scrolled"))}))};d?d.bind(window,"scroll",l,{passive:!0}):window.addEventListener("scroll",l,{passive:!0}),l(),t&&d&&d.bind(t,"click",()=>{u.tap(),e.querySelector("#ax-vault-test-all")?.click()})}function V(e){const a=e.querySelector("#ax-vault-categories");if(!a)return;if(re().total===0&&!a.dataset.axInitialized){a.dataset.axInitialized="1";const l=document.createElement("div");l.className="ax-skel-vault-wrapper",a.appendChild(l);const v=ue(l,"vault-cards");setTimeout(()=>{v(),l.remove(),V(e)},250)}const s=E.map(l=>{const v=xe(l,U);if(v.length===0&&l.id!=="identity")return"";const f=v.length>0;return`
      <details class="ax-cat" data-cat-id="${g(l.id)}" ${f?"open":""}
        style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;overflow:hidden">
        <summary style="padding:14px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-weight:600;list-style:none;-webkit-tap-highlight-color:transparent;min-height:44px">
          <span>${g(l.label)} <span style="color:var(--ax-text-muted);font-weight:400;font-size:13px">(${v.length})</span></span>
          <span class="ax-chevron" style="color:var(--ax-text-muted);transition:transform 200ms ease-out">▼</span>
        </summary>
        <div style="padding:0 14px 14px;display:grid;grid-template-columns:repeat(auto-fill, minmax(280px,1fr));gap:10px">
          ${v.map(h=>be(h)).join("")}
          ${v.length===0?`
            <div style="padding:20px;color:var(--ax-text-muted);text-align:center;grid-column:1/-1;font-size:13px">
              Aucun code dans cette catégorie<br>
              <button data-action="add-to-cat" data-cat-id="${g(l.id)}"
                style="margin-top:10px;padding:8px 14px;background:rgba(201,162,39,0.1);color:var(--ax-gold-deep);border:1px solid rgba(201,162,39,0.3);border-radius:8px;cursor:pointer;font-size:12px;min-height:36px">
                + Ajouter ${g(l.label)}
              </button>
            </div>
          `:""}
        </div>
      </details>
    `}).join("");let n=a.querySelector(".ax-vault-cats-wrapper");n||(n=document.createElement("div"),n.className="ax-vault-cats-wrapper",a.appendChild(n)),n.innerHTML=s}function ye(e){const a=e.querySelector("#ax-vault-search");if(a){let i=null;d.bind(a,"input",()=>{i&&clearTimeout(i),i=setTimeout(()=>{U=a.value.trim(),V(e),ee(e)},240)})}const t=e.querySelector("#ax-vault-add-manual");t&&d&&d.bind(t,"click",()=>{u.tap(),ie(e)});const s=e.querySelector("#ax-vault-test-all");s&&d&&d.bind(s,"click",()=>{(async()=>{u.tap(),c.info("Test de toutes les clés en cours…");try{const i=await T.healthCheckAll();c.success(`✅ ${i.tested} testées · ${i.recovered} récupérées · ${i.stillDown} HS`),A(e)}catch(i){m.warn("feature-vault","testAll failed",{err:i}),c.error("Erreur pendant le test global")}})()});const n=e.querySelector("#ax-vault-rescue-fb");n&&d&&d.bind(n,"click",()=>{(async()=>{u.tap();const i=e.querySelector("#ax-vault-rescue-result");i&&(i.innerHTML="⏳ Lecture Firebase backup chiffré…");try{const{vaultFirebaseBackup:o}=await q(async()=>{const{vaultFirebaseBackup:p}=await import("./vault-firebase-backup-CsVqwhmb.js");return{vaultFirebaseBackup:p}},__vite__mapDeps([0,1,2,3,4]),import.meta.url),r=await o.restoreAllFromFirebaseBackup();if(i){i.textContent="";const p=document.createElement("div");p.style.cssText="padding:8px;background:rgba(34,204,119,.1);color:var(--ax-green);border-radius:8px",p.textContent=`🔓 ${r.restored} clés restaurées · ${r.failed} échouées · ${r.skipped} ignorées`,i.append(p)}r.restored>0?(c.success(`🔓 ${r.restored} clés restaurées depuis Firebase backup`),u.success(),setTimeout(()=>A(e),600)):c.info("Aucune clé trouvée dans Firebase backup")}catch(o){m.warn("feature-vault","rescueFb failed",{err:o}),i&&(i.innerHTML=`<div class="ax-gs-48">⚠ ${g(String(o).slice(0,120))}</div>`),c.error("Erreur lecture Firebase backup"),u.error()}})()});const l=e.querySelector("#ax-vault-rescue-all");l&&d&&d.bind(l,"click",()=>{(async()=>{u.tap();const i=e.querySelector("#ax-vault-rescue-result");i&&(i.innerHTML="⏳ Scan 4 sources : alias, IDB, Firebase, pattern…");try{const{autoRestoreCredentials:o}=await q(async()=>{const{autoRestoreCredentials:p}=await import("./auto-restore-credentials-BMJBUoS_.js");return{autoRestoreCredentials:p}},__vite__mapDeps([1,2,3,4]),import.meta.url),r=await o.restoreAutomatically();if(i){i.textContent="";const p=document.createElement("div");p.style.cssText="padding:8px;background:rgba(34,204,119,.1);color:var(--ax-green);border-radius:8px",p.textContent=`🔓 ${r.restored} restaurées · ${r.failed} échouées`,i.append(p)}r.restored>0?(c.success(`🔓 ${r.restored} clés restaurées (4 sources)`),u.success(),setTimeout(()=>A(e),600)):c.info("Aucune clé trouvable dans les 4 sources. Colle une clé manuellement ci-dessous.")}catch(o){m.warn("feature-vault","rescueAll failed",{err:o}),i&&(i.innerHTML=`<div class="ax-gs-48">⚠ ${g(String(o).slice(0,120))}</div>`),c.error("Erreur scan multi-sources"),u.error()}})()});const v=e.querySelector("#ax-vault-diag-btn");v&&d&&d.bind(v,"click",()=>{(async()=>{u.tap();const i=e.querySelector("#ax-vault-diag-result");i&&(i.textContent="⏳ Diagnostic en cours (local + Firebase + Cloudflare)…");try{const{vaultDiagnostic:o}=await q(async()=>{const{vaultDiagnostic:k}=await import("./vault-diagnostic-DZG1p0ei.js");return{vaultDiagnostic:k}},__vite__mapDeps([1,2,3,4]),import.meta.url),r=await o.run();if(!i)return;i.textContent="";const p=document.createElement("div");p.style.cssText="display:flex;flex-direction:column;gap:8px";const x=document.createElement("div");x.style.cssText="padding:10px;background:rgba(106,138,255,0.08);border:1px solid rgba(106,138,255,0.25);border-radius:8px;font-weight:600",x.textContent=r.summary,p.append(x);const b=document.createElement("div");b.style.cssText="padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;line-height:1.5";const w=document.createElement("div"),y=r.local.legacy_flat_orphans>0?` · ⚠ ${r.local.legacy_flat_orphans} hors coffre central`:"";if(w.textContent=`💾 Local : ${r.local.total} clé(s) — ${r.local.encrypted} chiffrées · ${r.local.multi_keys_count} dans coffre${y}`,b.append(w),r.local.sample.length){const k=document.createElement("div");k.style.cssText="opacity:0.6;font-family:monospace;font-size:11px;margin-top:4px",k.textContent="ex. "+r.local.sample.join(", "),b.append(k)}p.append(b);const $=document.createElement("div");$.style.cssText="padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;line-height:1.5";const _=document.createElement("div"),B=r.firebase.connected?"🟢":"🔴";if(_.textContent=`☁ Firebase ${B} ${r.firebase.state} — ${r.firebase.backup_count} backup(s)`,$.append(_),r.firebase.drift_detected){const k=document.createElement("div");k.style.cssText="opacity:0.85;color:var(--ax-gold);margin-top:4px",k.textContent=`⚠ Drift : ${r.firebase.in_local_not_fb.length} local-only, ${r.firebase.in_fb_not_local.length} Firebase-only`,$.append(k)}p.append($);const L=document.createElement("div");L.style.cssText="padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;line-height:1.5";const M=document.createElement("div"),se=r.cloudflare_proxy.reachable?"🟢":"🔴";M.textContent=`🌐 Cloudflare proxy ${se} ${r.cloudflare_proxy.reachable?`OK (${r.cloudflare_proxy.latency_ms}ms, ${r.cloudflare_proxy.providers.length} providers)`:"KO ("+(r.cloudflare_proxy.error??"unreachable")+")"}`,L.append(M);const R=document.createElement("div");if(R.style.cssText="opacity:0.55;font-family:monospace;font-size:10px;margin-top:4px;word-break:break-all",R.textContent=r.cloudflare_proxy.url,L.append(R),p.append(L),r.recommendations.length){const k=document.createElement("div");k.style.cssText="padding:10px;background:rgba(232,184,48,0.08);border:1px solid rgba(232,184,48,0.25);border-radius:8px;font-size:12px;line-height:1.6";const F=document.createElement("div");F.style.cssText="font-weight:700;color:var(--ax-gold);margin-bottom:6px",F.textContent="💡 À faire :",k.append(F);for(const oe of r.recommendations){const D=document.createElement("div");D.style.cssText="padding:3px 0 3px 12px;position:relative";const K=document.createElement("span");K.style.cssText="position:absolute;left:0;top:3px",K.textContent="→",D.append(K),D.append(document.createTextNode(" "+oe)),k.append(D)}p.append(k)}i.append(p),u.success()}catch(o){if(m.warn("feature-vault","diag failed",{err:o}),i){i.textContent="";const r=document.createElement("div");r.style.cssText="padding:8px;background:rgba(255,91,91,0.1);color:#ff8b8b;border-radius:8px",r.textContent="⚠ Diagnostic échoué : "+String(o).slice(0,160),i.append(r)}c.error("Diagnostic impossible"),u.error()}})()});const f=e.querySelector("#ax-vault-migrate-legacy-btn");f&&d&&d.bind(f,"click",()=>{(async()=>{u.tap();const i=e.querySelector("#ax-vault-diag-result");i&&(i.textContent="⏳ Migration des clés legacy en cours…");try{const o=await T.migrateLegacyFlatKeys();if(!i)return;i.textContent="";const r=document.createElement("div"),p=o.failed===0&&o.migrated>0;r.style.cssText=`padding:10px;background:${p?"rgba(34,204,119,.1)":"rgba(232,184,48,.08)"};color:${p?"var(--ax-green)":"var(--ax-gold)"};border:1px solid ${p?"rgba(34,204,119,0.25)":"rgba(232,184,48,0.25)"};border-radius:8px;font-size:12px;line-height:1.5`;const x=document.createElement("div");if(x.style.cssText="font-weight:700;margin-bottom:4px",x.textContent=`🔁 ${o.scanned} clé(s) legacy scannées : ${o.migrated} migrées · ${o.failed} échec(s) · ${o.skipped} ignorées`,r.append(x),o.failed>0){const b=document.createElement("div");b.style.cssText="opacity:0.85;color:#ff8b8b;margin-top:4px";const w=o.details.filter(y=>y.status==="failed").slice(0,5).map(y=>y.key.replace(/^(ax_|apex_v13_)/,"").replace(/_(key|token|secret)$/,""));b.textContent=`Échecs (decrypt fail = passphrase perdue cf. erreur #55) : ${w.join(", ")}${o.failed>5?"…":""}. Re-colle ces clés via "Auto-détection rapide".`,r.append(b)}if(o.skipped>0){const b=document.createElement("div");b.style.cssText="opacity:0.7;margin-top:4px";const w=o.details.filter(y=>y.status==="skipped").slice(0,5).map(y=>y.key.replace(/^(ax_|apex_v13_)/,"").replace(/_(key|token|secret)$/,""));b.textContent=`Ignorées (déjà dans coffre ou service inconnu) : ${w.join(", ")}${o.skipped>5?"…":""}.`,r.append(b)}i.append(r),o.migrated>0?(c.success(`🔁 ${o.migrated} clés legacy migrées vers le coffre central`),u.success(),setTimeout(()=>A(e),600)):o.failed>0?(c.error(`${o.failed} échec(s) decrypt — passphrase perdue`),u.error()):c.info("Rien à migrer (tout déjà à jour ou clés legacy absentes)")}catch(o){if(m.warn("feature-vault","migrateLegacyFlatKeys failed",{err:o}),i){i.textContent="";const r=document.createElement("div");r.style.cssText="padding:8px;background:rgba(255,91,91,0.1);color:#ff8b8b;border-radius:8px",r.textContent="⚠ Migration échouée : "+String(o).slice(0,160),i.append(r)}c.error("Migration impossible"),u.error()}})()});const h=e.querySelector("#ax-vault-push-all-btn");h&&d&&d.bind(h,"click",()=>{(async()=>{u.tap();const i=e.querySelector("#ax-vault-diag-result");i&&(i.textContent="⏳ Push de toutes les clés chiffrées vers Firebase backup…");try{const{vaultFirebaseBackup:o}=await q(async()=>{const{vaultFirebaseBackup:b}=await import("./vault-firebase-backup-CsVqwhmb.js");return{vaultFirebaseBackup:b}},__vite__mapDeps([0,1,2,3,4]),import.meta.url),r=await o.pushAllLocal();if(!i)return;i.textContent="";const p=document.createElement("div");p.style.cssText="padding:10px;background:rgba(34,204,119,.1);color:var(--ax-green);border:1px solid rgba(34,204,119,0.25);border-radius:8px;font-size:12px;line-height:1.5";const x=document.createElement("div");if(x.style.cssText="font-weight:700;margin-bottom:4px",x.textContent=`📤 ${r.pushed} clé(s) backupées · ${r.failed} échec(s) · ${r.skipped} ignorées`,p.append(x),r.failed>0){const b=document.createElement("div");b.style.cssText="opacity:0.85;color:var(--ax-gold)",b.textContent="Échecs probables : Firebase hors-ligne (RECONNECTING). Relance ce push quand le diag affiche Firebase 🟢 CONNECTED.",p.append(b)}else if(r.pushed===0&&r.skipped>0){const b=document.createElement("div");b.style.cssText="opacity:0.85",b.textContent=`${r.skipped} clé(s) déjà backupées récemment (throttle 5 min) — rien à faire.`,p.append(b)}i.append(p),r.pushed>0?(c.success(`📤 ${r.pushed} clés backupées vers Firebase`),u.success()):r.failed>0?(c.error(`${r.failed} échec(s) — Firebase hors-ligne ?`),u.error()):c.info("Rien à push (tout est déjà à jour ou throttle)")}catch(o){if(m.warn("feature-vault","pushAll failed",{err:o}),i){i.textContent="";const r=document.createElement("div");r.style.cssText="padding:8px;background:rgba(255,91,91,0.1);color:#ff8b8b;border-radius:8px",r.textContent="⚠ Push échoué : "+String(o).slice(0,160),i.append(r)}c.error("Push impossible"),u.error()}})()});const S=e.querySelector("#ax-vault-cleanup-invalid");S&&d&&d.bind(S,"click",()=>{(async()=>{u.tap();const i=e.querySelector("#ax-vault-rescue-result");if(confirm(`Supprimer définitivement toutes les clés illisibles (decrypt fail) ?

Ces clés sont chiffrées avec une passphrase perdue. Tu devras les recoller pour les retrouver.`)){i&&(i.innerHTML="⏳ Suppression des entrées illisibles…");try{const r=N().filter(x=>x.status==="invalid");let p=0;for(const x of r)try{if(x.id.startsWith("mkv_")||x.id.includes("_")){T.removeKey(x.id),p++;continue}const b=x.id.startsWith("ax_")||x.id.startsWith("apex_v13_")?x.id:`ax_${x.service}_key`;localStorage.removeItem(b);const w=indexedDB.open("apex_v13_vault_shadow",1);w.onsuccess=()=>{try{w.result.transaction("keys","readwrite").objectStore("keys").delete(b),w.result.close()}catch{}},p++}catch{}if(i){i.textContent="";const x=document.createElement("div");x.style.cssText="padding:8px;background:rgba(34,204,119,.1);color:var(--ax-green);border-radius:8px",x.textContent=`🗑 ${p} clé(s) illisibles supprimées. Recolle tes clés via "Détecter & stocker" ci-dessous.`,i.append(x)}c.success(`🗑 ${p} clés illisibles supprimées`),u.success(),setTimeout(()=>A(e),800)}catch(o){m.warn("feature-vault","cleanupInvalid failed",{err:o}),c.error("Erreur suppression"),u.error()}}})()});const C=e.querySelector("#ax-vault-paste-clipboard-btn");C&&d&&d.bind(C,"click",()=>{(async()=>{u.tap();const i=e.querySelector("#ax-vault-paste"),o=e.querySelector("#ax-vault-paste-result");if(i)try{if(!navigator.clipboard?.readText)throw new Error("Clipboard API non supportée");const r=await navigator.clipboard.readText();if(!r){o&&(o.innerHTML='<div class="ax-gs-174">⚠ Presse-papier vide</div>');return}i.value=r,i.dispatchEvent(new Event("input",{bubbles:!0})),u.success(),c.success(`📋 ${r.length} caractères collés — clique "Détecter & stocker"`),o&&(o.innerHTML='<div style="padding:8px;background:rgba(106,138,255,.1);color:var(--ax-blue);border-radius:8px">📋 Collé — clique "Détecter & stocker" pour analyser</div>'),i.focus()}catch(r){const p=r instanceof Error?r.message:"unknown";c.error(`Clipboard refusé : ${p}. Utilise long-press → Coller manuellement.`),o&&(o.innerHTML='<div class="ax-gs-48">⚠ Permission refusée. Long-press dans le champ → Coller.</div>')}})()});const I=e.querySelector("#ax-vault-paste-btn");I&&d&&d.bind(I,"click",()=>{(async()=>{u.tap();const i=e.querySelector("#ax-vault-paste"),o=e.querySelector("#ax-vault-paste-result");if(!i||!o)return;const r=i.value.trim();if(!r){o.innerHTML=`<div class="ax-gs-174">⚠ Colle quelque chose d'abord</div>`;return}const p=await fe(r);if(p.ok){u.success(),c.success(`✅ ${p.pattern_name} stocké`),o.innerHTML=`<div style="padding:8px;background:rgba(34,204,119,.1);color:var(--ax-green);border-radius:8px">✅ ${g(p.pattern_name)} → ${g(p.storage_key)}</div>`;const x=O(r);if(x){const b=x.storageKey.replace(/^(ax_|apex_v13_)/,"").replace(/_(?:key|token|pat|sk|pk|id|secret)$/,"");try{await T.addKey(b,r)}catch{}}i.value="",A(e)}else u.error(),c.error(p.reason),o.innerHTML=`<div class="ax-gs-48">⚠ ${g(p.reason)}</div>`})()});const G=e.querySelector("#ax-vault-import");G&&d&&d.bind(G,"click",()=>{(async()=>{u.tap();try{const{apexVaultImport:i}=await q(async()=>{const{apexVaultImport:r}=await import("./apex-vault-import-Ckecb6-d.js");return{apexVaultImport:r}},__vite__mapDeps([2,3,1,4]),import.meta.url),o=await i.promptAndImport();if(o.cancelled){c.info("Import annulé",{duration:2e3});return}o.ok&&o.restored>0?(c.success(`🔓 ${o.restored} clés restaurées depuis JSON Drive${o.failed>0?` · ${o.failed} échouées`:""}`,{duration:8e3}),setTimeout(()=>location.reload(),1500)):o.decrypt_failed>0?c.error(`🔒 ${o.decrypt_failed} clés non déchiffrables. PIN admin différent ? Vérifie ton PIN actuel.`,{duration:1e4}):o.error?c.error(`Import échoué : ${o.error.slice(0,80)}`,{duration:8e3}):c.warn("Aucune clé restaurée depuis ce JSON",{duration:5e3})}catch(i){const o=i instanceof Error?i.message:String(i);c.error(`Import erreur : ${o.slice(0,80)}`,{duration:8e3})}})()});const Q=e.querySelector("#ax-vault-export");Q&&d&&d.bind(Q,"click",()=>{u.tap();const i=Y(j()),o=new Blob([i],{type:"application/json"}),r=URL.createObjectURL(o),p=document.createElement("a");p.href=r,p.download=`apex-vault-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(p),p.click(),document.body.removeChild(p),URL.revokeObjectURL(r),c.success("Coffre exporté (chiffré)")});const J=e.querySelector("#ax-vault-qr-backup");J&&d&&d.bind(J,"click",()=>{(async()=>{u.tap();try{const i=Y(j()),o=(i.length/1024).toFixed(1),r=j().length,p=2500;let x="";try{x=(await q(()=>import("https://cdn.jsdelivr.net/npm/lz-string@1.5.0/+esm"),[],import.meta.url)).compressToEncodedURIComponent(i);const _=(x.length/1024).toFixed(1);m.info("vault-qr-backup",`LZ compress ${o}KB → ${_}KB (${Math.round((1-x.length/i.length)*100)}% gain)`)}catch($){m.warn("vault-qr-backup","LZ-string load failed",{err:$})}if(x&&x.length<p){const{apexQrBackup:$}=await q(async()=>{const{apexQrBackup:_}=await import("./apex-qr-backup-BibznXzt.js");return{apexQrBackup:_}},__vite__mapDeps([1,2,3,4]),import.meta.url);await $.showQrBackupModal({text:`APEXVAULT_LZ:${x}`,title:"📦 Backup Vault Compressé — Photos iCloud",description:`${r} clés compressées LZ (${(x.length/1024).toFixed(1)}KB vs ${o}KB orig). JSON chiffré AES-GCM-256. Sauvegarde dans Photos iCloud — au reinstall, scan = restore complet.`,filename:`apex-vault-backup-${new Date().toISOString().slice(0,10)}.png`});return}c.info(`Vault compressé ${x.length}B encore > QR max. Upload Gist privé chiffré...`,{duration:4e3});try{const{apexGithubGistBackup:$}=await q(async()=>{const{apexGithubGistBackup:B}=await import("./apex-github-gist-backup-2g0cPMLr.js");return{apexGithubGistBackup:B}},__vite__mapDeps([1,2,3,4,5]),import.meta.url),_=await $.pushBackup({force:!0});if(_.ok&&_.gist_id){const B=`https://gist.github.com/${_.gist_id}`,{apexQrBackup:L}=await q(async()=>{const{apexQrBackup:M}=await import("./apex-qr-backup-BibznXzt.js");return{apexQrBackup:M}},__vite__mapDeps([1,2,3,4]),import.meta.url);await L.showQrBackupModal({text:`APEXVAULT_GIST:${_.gist_id}`,title:"📦 Backup Vault → Gist URL — Photos iCloud",description:`${r} clés uploadées Gist privé chiffré (${(_.bytes??0)/1024}KB). QR contient juste l'ID Gist. Au reinstall, scan + PAT GitHub = pull Gist + restore complet. URL : ${B}`,filename:`apex-vault-gist-${new Date().toISOString().slice(0,10)}.png`});return}c.warn(`Gist upload échoué : ${_.error??"?"}. Fallback download JSON.`,{duration:6e3})}catch($){m.warn("vault-qr-backup","gist push failed",{err:$})}const b=new Blob([i],{type:"application/json"}),w=URL.createObjectURL(b),y=document.createElement("a");y.href=w,y.download=`apex-vault-backup-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(y),y.click(),document.body.removeChild(y),URL.revokeObjectURL(w),c.success(`📥 Backup JSON téléchargé (${o}KB chiffré). Sauvegarde dans iCloud Drive / Notes.`,{duration:8e3})}catch(i){const o=i instanceof Error?i.message:String(i);c.error(`Backup QR échoué : ${o.slice(0,60)}`,{duration:6e3})}})()}),ee(e)}function ee(e){e.querySelectorAll('[data-action="test"]').forEach(a=>{d.bind(a,"click",t=>{t.stopPropagation();const s=a.dataset.credId??"";ke(e,s,a)})}),e.querySelectorAll('[data-action="recharge"]').forEach(a=>{d.bind(a,"click",t=>{t.stopPropagation();const s=a.dataset.rechargeUrl??"",n=a.dataset.service??"";we(s,n)})}),e.querySelectorAll('[data-action="discover-links"]').forEach(a=>{d.bind(a,"click",t=>{t.stopPropagation();const s=a.dataset.service??"";$e(e,s,a)})}),e.querySelectorAll('[data-action="edit"]').forEach(a=>{d.bind(a,"click",t=>{t.stopPropagation();const s=a.dataset.credId??"";Ce(e,s)})}),e.querySelectorAll('[data-action="delete"]').forEach(a=>{d.bind(a,"click",t=>{t.stopPropagation();const s=a.dataset.credId??"";_e(e,s)})}),e.querySelectorAll('[data-action="add-to-cat"]').forEach(a=>{d.bind(a,"click",t=>{t.stopPropagation();const s=a.dataset.catId??"";ie(e,s)})})}async function ke(e,a,t){if(!a)return;u.tap();const s=t.textContent;t.textContent="⏳ Test…",t.setAttribute("disabled","true");try{const n=await T.testKey(a);n.ok?(u.success(),c.success(`✅ Active (${n.latencyMs}ms)`)):(u.error(),c.error(`❌ ${n.reason??"Test échoué"}`)),A(e)}catch(n){m.warn("feature-vault","testKey failed",{err:n}),u.error(),c.error("Erreur pendant le test"),t.textContent=s,t.removeAttribute("disabled")}}function we(e,a){if(u.tap(),!e){c.warn(`Aucune page recharge connue pour ${a}`);return}try{window.open(e,"_blank","noopener,noreferrer")}catch(t){m.warn("feature-vault","recharge open failed",{err:t}),c.error("Impossible d'ouvrir le lien")}}async function $e(e,a,t){if(!a)return;u.tap();const s=t.textContent;t.textContent="⏳ Recherche…",t.setAttribute("disabled","true");try{const n=await de.discover(a,{force:!0}),l=[];n.login&&l.push("login"),n.dashboard&&l.push("dashboard"),n.billing&&l.push("billing"),n.api_keys&&l.push("api_keys"),n.usage&&l.push("usage"),n.docs&&l.push("docs"),n.password_reset&&l.push("reset_pw"),n.account_settings&&l.push("settings"),n.support&&l.push("support"),n.status_page&&l.push("status"),n.alive&&l.length>0?(u.success(),c.success(`🔗 ${l.length} liens trouvés (${n.source}) : ${l.join(", ")}`)):(u.error(),c.warn(`Aucun lien validé pour ${a} — réessaie plus tard`)),A(e)}catch(n){m.warn("feature-vault","discoverLinks failed",{err:n}),u.error(),c.error("Erreur pendant la recherche de liens")}finally{t.textContent=s,t.removeAttribute("disabled")}}function _e(e,a){if(a&&(u.tap(),!!window.confirm("Supprimer cette clé définitivement ? Elle sera retirée du Coffre + ne sera plus restaurée auto.")))try{T.removeKey(a),u.success(),c.success("Clé supprimée définitivement ✓"),A(e)}catch(t){m.warn("feature-vault","delete failed",{err:t}),u.error(),c.error("Suppression échouée")}}function H(e){let a=e.querySelector("#ax-vault-modal-root");return a||(a=document.createElement("div"),a.id="ax-vault-modal-root",e.appendChild(a)),a}function z(e){const a=H(e);a.innerHTML=""}function ie(e,a){const t=H(e),s=E.filter(f=>f.id!=="other").map(f=>`<option value="${g(f.id)}" ${a===f.id?"selected":""}>${g(f.label)}</option>`).join("");t.innerHTML=`
    <div role="dialog" aria-modal="true" aria-label="Ajouter une clé"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">
      <div style="background:var(--ax-bg-flat);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;max-width:440px;width:100%;max-height:90vh;overflow-y:auto">
        <div class="ax-gs-175">
          <h2 class="ax-gs-475">+ Ajouter une clé</h2>
          <button id="ax-vault-modal-close" aria-label="Fermer"
            class="ax-gs-476">×</button>
        </div>
        <label class="ax-gs-477">
          Catégorie
          <select id="ax-vault-add-cat" style="width:100%;margin-top:4px;padding:10px;background:rgba(255,255,255,0.04);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:8px;font-size:14px;min-height:44px">
            ${s}
          </select>
        </label>
        <label class="ax-gs-477">
          Service (ex: anthropic, openai, stripe)
          <input type="text" id="ax-vault-add-service" aria-label="Nom du service" placeholder="anthropic"
            class="ax-gs-478">
        </label>
        <label class="ax-gs-477">
          Alias (optionnel)
          <input type="text" id="ax-vault-add-alias" aria-label="Alias optionnel pour ce service" placeholder="perso, client X..."
            class="ax-gs-478">
        </label>
        <label class="ax-gs-477">
          Valeur (clé / token)
          <textarea id="ax-vault-add-value" placeholder="Colle la clé ici"
            class="ax-gs-479"></textarea>
        </label>
        <div class="ax-gs-176">
          <button id="ax-vault-add-detect"
            style="flex:1;min-width:140px;padding:10px;background:rgba(106,138,255,0.15);color:var(--ax-blue);border:1px solid rgba(106,138,255,0.3);border-radius:8px;cursor:pointer;font-size:13px;min-height:44px">🔍 Détecter automatiquement</button>
          <button id="ax-vault-add-save"
            style="flex:1;min-width:140px;padding:10px;background:linear-gradient(135deg,var(--ax-gold-deep),var(--ax-gold));color:#000;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700;min-height:44px">🔒 Chiffrer & Sauvegarder</button>
        </div>
      </div>
    </div>
  `,(()=>{const f=t.querySelector("#ax-vault-modal-close");f&&d&&d.bind(f,"click",()=>z(e))})();const n=t.querySelector('[role="dialog"]');n&&d&&d.bind(n,"click",f=>{f.target===n&&z(e)});const l=t.querySelector("#ax-vault-add-detect");l&&d&&d.bind(l,"click",()=>{(async()=>{u.tap();const f=t.querySelector("#ax-vault-add-value");if(!f)return;const h=O(f.value.trim());if(!h){c.warn("Aucun pattern reconnu");return}if(h.category==="forbidden"){c.error("🚨 Type interdit");return}const S=t.querySelector("#ax-vault-add-service"),C=t.querySelector("#ax-vault-add-cat");if(S){const I=h.storageKey.replace(/^(ax_|apex_v13_)/,"").replace(/_(?:key|token|pat|sk|pk|id|secret)$/,"");S.value=I}C&&(C.value=ae(S?.value??"",h.category)),c.success(`Détecté: ${h.name}`)})()});const v=t.querySelector("#ax-vault-add-save");v&&d&&d.bind(v,"click",()=>{(async()=>{u.tap();const f=t.querySelector("#ax-vault-add-service")?.value.trim()??"",h=t.querySelector("#ax-vault-add-alias")?.value.trim()??"",S=t.querySelector("#ax-vault-add-value")?.value.trim()??"";if(!f||!S){c.warn("Service et valeur requis");return}try{const C={};h&&(C.alias=h),await T.addKey(f,S,C),c.success(`✅ Clé ${f} chiffrée + sauvegardée`),z(e),A(e)}catch(C){m.warn("feature-vault","add manual failed",{err:C}),c.error("Erreur pendant la sauvegarde")}})()})}function Ce(e,a){const t=H(e),s=T.listAll(!0).find(l=>l.id===a);if(!s){c.error("Clé introuvable");return}t.innerHTML=`
    <div role="dialog" aria-modal="true" aria-label="Modifier une clé"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">
      <div style="background:var(--ax-bg-flat);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;max-width:440px;width:100%">
        <div class="ax-gs-175">
          <h2 class="ax-gs-475">✏️ Modifier ${g(s.service)}</h2>
          <button id="ax-vault-modal-close" aria-label="Fermer"
            class="ax-gs-476">×</button>
        </div>
        <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0 0 12px">Une nouvelle valeur remplacera l'ancienne (chiffrement AES-GCM 256).</p>
        <label class="ax-gs-477">
          Nouvelle valeur
          <textarea id="ax-vault-edit-value" placeholder="Colle la nouvelle clé"
            class="ax-gs-479"></textarea>
        </label>
        <label class="ax-gs-477">
          Alias (optionnel)
          <input type="text" id="ax-vault-edit-alias" aria-label="Alias optionnel" value="${g(s.alias??"")}"
            class="ax-gs-478">
        </label>
        <div class="ax-gs-176">
          <button id="ax-vault-edit-cancel"
            style="flex:1;min-width:120px;padding:10px;background:rgba(255,255,255,0.04);color:var(--ax-text-dim);border:1px solid rgba(255,255,255,0.1);border-radius:8px;cursor:pointer;font-size:13px;min-height:44px">Annuler</button>
          <button id="ax-vault-edit-save"
            style="flex:1;min-width:120px;padding:10px;background:linear-gradient(135deg,var(--ax-gold-deep),var(--ax-gold));color:#000;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700;min-height:44px">💾 Enregistrer</button>
        </div>
      </div>
    </div>
  `,(()=>{const l=t.querySelector("#ax-vault-modal-close");l&&d&&d.bind(l,"click",()=>z(e))})(),(()=>{const l=t.querySelector("#ax-vault-edit-cancel");l&&d&&d.bind(l,"click",()=>z(e))})();const n=t.querySelector("#ax-vault-edit-save");n&&d&&d.bind(n,"click",()=>{(async()=>{u.tap();const l=t.querySelector("#ax-vault-edit-value")?.value.trim()??"",v=t.querySelector("#ax-vault-edit-alias")?.value.trim()??"";if(!l){c.warn("Valeur requise");return}try{T.markInvalid(a,"replaced via edit");const f={};v&&(f.alias=v),await T.addKey(s.service,l,f),c.success("✅ Clé mise à jour"),z(e),A(e)}catch(f){m.warn("feature-vault","edit save failed",{err:f}),c.error("Erreur pendant la modification")}})()})}export{E as CATEGORIES,fe as autoDetectAndStore,N as buildCredentialDisplays,ae as classifyService,re as computeStats,Ge as dispose,g as escapeHtml,Y as exportVaultJson,Qe as filterVaultEntries,Z as formatRelativeTime,xe as getCredentialsForCategory,j as listVaultEntries,Je as removeCredential,A as render,be as renderCredentialCard};
