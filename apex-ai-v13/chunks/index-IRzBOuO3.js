const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./vault-firebase-backup-DfSh_cbj.js","./apex-kb-0sanZVD_.js","./monitoring-R6_kBcE7.js","./multi-source-analyze-XlVpTFLz.js","./credential-patterns-CLzI061R.js","./auth-C6cTwR-e.js"])))=>i.map(i=>d[i]);
import{v as P,_ as L}from"./apex-kb-0sanZVD_.js";import{a as x}from"./escape-html-DGIYNPKb.js";import{c as ie}from"./listener-cleanup-Y2rGGxxX.js";import{q as m,C as Q}from"./monitoring-R6_kBcE7.js";import{g as oe}from"./apex-tools-dispatch-core-ZfdoIE-H.js";import{c as se}from"./csp-style-helper-BisGRi53.js";import{autoDiscoverLinks as ne}from"./auto-discover-links-CM8wYziR.js";import{l as J}from"./multi-source-analyze-XlVpTFLz.js";import{detectCredential as j,CREDENTIAL_PATTERNS as Z}from"./credential-patterns-CLzI061R.js";import{g as le}from"./generic-secrets-DCI59VT4.js";import{multiKeyVault as A}from"./multi-key-vault-CRJmOfNg.js";import{haptic as p}from"./haptic-CQFg2PXZ.js";import{s as ce}from"../core/main-C1wW8zHL.js";import{toast as d}from"./toast-CRdbcLoc.js";import"./apex-tools-dispatch-skills-Dh_ZxzbQ.js";import"./apex-tools-dispatch-data-rCsAnzSr.js";import"./apex-tools-dispatch-finance-DoRAfEZC.js";import"./apex-tools-dispatch-misc-BE1GVz_r.js";import"./apex-tools-misc-W6algOoR.js";import"./apex-tools-registry-core-CQvgkOQw.js";import"./apex-tools-registry-skills-DRX4PPQ_.js";let l=null;function Ne(){l?.cleanup(),l=null}const D=[{id:"ai",label:"🤖 IA & LLM",serviceMatchers:["anthropic","openai","groq","google","gemini","openrouter","cohere","mistral","perplexity","deepseek","xai","elevenlabs","replicate","huggingface","fireworks","togetherai","deepl"],patternCategories:["ai"]},{id:"finance",label:"💳 Paiements & Finance",serviceMatchers:["stripe","paypal","revolut","wise","lydia","n26","boursorama","fortuneo","ing","socgen","bnp","credit_agricole","credit_mutuel","banque_postale","lbp","bpce","shopify"],patternCategories:["finance"]},{id:"devops",label:"🛠 DevOps & Code",serviceMatchers:["github","gitlab","cloudflare","vercel","netlify","railway","aws","heroku","sentry","npm"],patternCategories:["devops"]},{id:"comms",label:"📨 Communications",serviceMatchers:["telegram","discord","slack","brevo","resend","twilio","sendgrid","mailchimp","whatsapp"],patternCategories:["comms"]},{id:"social",label:"🌐 Réseaux sociaux",serviceMatchers:["facebook","instagram","tiktok","youtube","twitter","linkedin"],patternCategories:[]},{id:"storage",label:"☁️ Stockage & Cloud",serviceMatchers:["firebase","supabase","airtable","notion","dropbox","pinecone","weaviate"],patternCategories:["storage"]},{id:"ecommerce",label:"🛒 E-commerce",serviceMatchers:["shopify","stripe_connect","paypal_business"],patternCategories:[]},{id:"crypto",label:"₿ Crypto",serviceMatchers:["coinbase","binance","crypto_com","kraken"],patternCategories:[]},{id:"identity",label:"🆔 Identité Kevin",serviceMatchers:["kevin","iban","siret","vat","bic","apple","microsoft"],patternCategories:["identity"]},{id:"other",label:"📦 Autres",serviceMatchers:[],patternCategories:["saas"]}];function ee(e,a){const t=e.toLowerCase();let r=null;for(const o of D)if(o.id!=="other")for(const s of o.serviceMatchers)t.includes(s)&&(!r||s.length>r.matchLen)&&(r={catId:o.id,matchLen:s.length});if(r)return r.catId;if(a){for(const o of D)if(o.patternCategories.includes(a))return o.id}return"other"}function O(){return Z.filter(e=>e.category!=="forbidden").map(e=>{const a=P.getKeyStatus(e.storageKey),t=(()=>{try{return localStorage.getItem(e.storageKey)??""}catch{return""}})(),r=t&&t.length>8&&!t.startsWith("AXENC1:")?P.maskKey(t):t.startsWith("AXENC1:")?"🔒 chiffré":"";return{pattern:e,status:a,masked:r}})}function Ve(e,a){return e.filter(t=>{if(a.category&&t.pattern.category!==a.category||a.configuredOnly&&t.status==="empty")return!1;if(a.query){const r=a.query.toLowerCase();if(!(t.pattern.name.toLowerCase().includes(r)||t.pattern.storageKey.toLowerCase().includes(r)))return!1}return!0})}function U(){const e=[];let a=[];try{a=A.listAll(!0)}catch(t){m.warn("feature-vault","multiKeyVault.listAll failed",{err:t})}for(const t of a){const r=J.get(t.service),o=Z.find(g=>g.storageKey.includes(t.service)),s={id:t.id,service:t.service,serviceName:r?.name??ue(t.service),category:ee(t.service,o?.category),status:t.status,source:"multi-key"};t.alias!==void 0&&(s.alias=t.alias),t.addedAt!==void 0&&(s.addedAt=t.addedAt),t.lastTestedAt!==void 0&&(s.lastTestedAt=t.lastTestedAt);const b=J.getRechargeLink(t.service);b&&(s.rechargeUrl=b),e.push(s)}return e}function te(){const e=U(),a={total:e.length,active:0,failing:0,invalid:0};for(const t of e)t.status==="active"?a.active+=1:t.status==="failing"||t.status==="rate-limited"?a.failing+=1:t.status==="invalid"&&(a.invalid+=1);return a}function de(e,a=""){const t=U(),r=a.trim().toLowerCase();return t.filter(o=>o.category!==e.id?!1:r?o.service.toLowerCase().includes(r)||o.serviceName.toLowerCase().includes(r)||(o.alias?.toLowerCase().includes(r)??!1):!0)}function ue(e){return e.charAt(0).toUpperCase()+e.slice(1)}async function pe(e){const a=e.trim();if(!a)return{ok:!1,reason:"Entrée vide"};const t=j(a);if(t&&t.category==="forbidden")return{ok:!1,reason:"🚨 Type interdit (cartes/seed phrases jamais stockées)"};if(t)try{const r=await P.encryptAuto(a);return localStorage.setItem(t.storageKey,r),{ok:!0,pattern_name:t.name,storage_key:t.storageKey}}catch(r){return m.warn("vault-feature","autoDetectAndStore failed",{err:r}),{ok:!1,reason:"Erreur chiffrement"}}if(a.length>=20){const r=await le.add(a,void 0,"Auto-détecté (pattern inconnu)");return r.ok?{ok:!0,generic:!0,pattern_name:"Secret générique",storage_key:"apex_v13_generic_secrets",generic_id:r.id}:{ok:!1,reason:r.reason}}return{ok:!1,reason:"Aucun pattern reconnu (trop court pour secret générique)"}}function He(e){try{return localStorage.removeItem(e),!0}catch(a){return m.warn("vault-feature","remove failed",{err:a}),!1}}function W(e){const a={exported_at:new Date().toISOString(),version:1,entries:e.filter(t=>t.status!=="empty").map(t=>{const r=(()=>{try{return localStorage.getItem(t.pattern.storageKey)??""}catch{return""}})();return{storage_key:t.pattern.storageKey,name:t.pattern.name,value_encrypted:r}})};return JSON.stringify(a,null,2)}function xe(e){const a=ge[e.status]??"var(--ax-text-muted)",t=fe[e.status]??"⚪",r=(e.preview??"").slice(0,4)+"••••••"+(e.preview??"").slice(-4),o=e.preview?r:"••••••",s=e.rechargeUrl??"",b=e.alias?`<span style="color:var(--ax-text-muted);font-size:11px">— ${x(e.alias)}</span>`:"",g=e.logoUrl?`<img src="${x(e.logoUrl)}" alt="" loading="lazy" decoding="async" style="width:24px;height:24px;border-radius:6px" onerror="this.style.display='none'">`:"",v=[];e.addedAt&&v.push(`Ajouté ${X(e.addedAt)}`),e.lastTestedAt&&v.push(`Testé ${X(e.lastTestedAt)}`);const w=v.length>0?`<div style="display:flex;gap:8px;font-size:11px;color:var(--ax-text-muted);margin-bottom:10px">${v.map(y=>`<span>${x(y)}</span>`).join("")}</div>`:"";return`
    <div class="ax-cred-card" data-cred-id="${x(e.id)}" data-service="${x(e.service)}"
      style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;transition:all 200ms ease-out;position:relative;display:flex;flex-direction:column;gap:8px">
      <div style="position:absolute;top:14px;right:14px;width:10px;height:10px;border-radius:50%;background:${x(a)};box-shadow:0 0 8px ${x(a)}" title="${x(t)} ${x(e.status)}"></div>
      <div class="ax-gs-120">
        ${g}
        <strong style="font-size:15px;color:#fff">${x(e.serviceName)}</strong>
        ${b}
      </div>
      <code style="display:block;padding:6px 10px;background:rgba(0,0,0,0.3);border-radius:6px;font-size:11px;color:var(--ax-text-muted);font-family:'SF Mono',Menlo,monospace;letter-spacing:1px">${x(o)}</code>
      ${w}
      <div class="ax-gs-20">
        <button data-action="test" data-cred-id="${x(e.id)}" aria-label="Tester la clé ${x(e.service)}"
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(34,204,119,0.1);color:var(--ax-green);border:1px solid rgba(34,204,119,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:44px">🔄 Test</button>
        <button data-action="recharge" data-service="${x(e.service)}" data-recharge-url="${x(s)}" ${s?"":"disabled"} aria-label="Recharger ${x(e.service)}"
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(201,162,39,0.1);color:var(--ax-gold-deep);border:1px solid rgba(201,162,39,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:44px;${s?"":"opacity:0.4;cursor:not-allowed"}">💰 Recharger</button>
        <button data-action="discover-links" data-service="${x(e.service)}" aria-label="Chercher les liens de ${x(e.service)}"
          title="Cherche login/dashboard/billing/api_keys/usage en autonomie"
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(74,158,255,0.1);color:var(--ax-blue-bright);border:1px solid rgba(74,158,255,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:44px">🔍 Chercher liens</button>
        <button data-action="edit" data-cred-id="${x(e.id)}" aria-label="Modifier la clé ${x(e.service)}" title="Modifier"
          style="min-width:44px;padding:6px 10px;background:rgba(255,255,255,0.05);color:var(--ax-text-dim);border:1px solid rgba(255,255,255,0.1);border-radius:6px;cursor:pointer;font-size:11px;min-height:44px">✏️</button>
        <button data-action="delete" data-cred-id="${x(e.id)}" aria-label="Supprimer la clé ${x(e.service)}" title="Supprimer"
          style="min-width:44px;padding:6px 10px;background:rgba(255,91,91,0.1);color:var(--ax-error);border:1px solid rgba(255,91,91,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:44px">🗑</button>
      </div>
    </div>
  `}const ge={active:"var(--ax-green)",failing:"var(--ax-warning)","rate-limited":"var(--ax-warning)",invalid:"var(--ax-error)",unknown:"var(--ax-text-muted)"},fe={active:"🟢",failing:"🟡","rate-limited":"🟡",invalid:"🔴",unknown:"⚪"};function X(e){const a=Date.now()-e;if(a<0||!Number.isFinite(a))return"à l'instant";const t=Math.floor(a/6e4);if(t<1)return"à l'instant";if(t<60)return`il y a ${t}min`;const r=Math.floor(t/60);if(r<24)return`il y a ${r}h`;const o=Math.floor(r/24);return o<30?`il y a ${o}j`:`il y a ${Math.floor(o/30)} mois`}let N="";function _(e){if(l?.cleanup(),l=ie("vault"),!Q.get("isAdmin")){e.innerHTML=`<div style="padding:40px;text-align:center"><h2 class="ax-gs-372">🔒 Coffre admin</h2><p class="ax-gs-226">Cette section est réservée à l'admin Kevin.</p></div>`;return}const t=Q.get("user")?.id??"anon";if(!oe("admin.vault",e,t))return;const r=te();e.innerHTML=se.withNonce(`
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
            <span class="ax-gs-222">🟢 ${r.active} actifs</span>
            <span class="ax-gs-168">🟡 ${r.failing} dégradés</span>
            <span class="ax-gs-76">🔴 ${r.invalid} invalides</span>
          </div>
        </header>

        <div class="ax-vault-search-row" style="padding-bottom:12px;transition:padding 200ms ease">
          <input type="text" id="ax-vault-search" aria-label="Chercher un service dans le coffre" value="${x(N)}" placeholder="🔍 Chercher un service..."
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
        <button id="ax-vault-diag-btn" type="button"
          style="padding:10px 16px;background:rgba(106,138,255,0.18);color:var(--ax-blue);border:1px solid rgba(106,138,255,0.35);border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;min-height:44px">📊 Diagnostic complet</button>
        <div id="ax-vault-diag-result" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.85)"></div>
      </section>

      <p style="text-align:center;color:rgba(255,255,255,0.4);font-size:11px;margin-top:16px;padding:14px;background:rgba(255,255,255,0.02);border-radius:12px;line-height:1.6">
        🛡 <strong style="color:rgba(255,255,255,0.6)">Sécurité</strong> : AES-GCM 256 + PBKDF2 200k iterations · Audit log immutable<br>
        <span style="opacity:0.7">FB_LOCAL strict pour ax_pin/ax_user · jamais de plaintext en backup</span>
      </p>

      <button id="ax-vault-fab" class="ax-vault-fab" type="button" aria-label="Tester toutes les clés" title="Tester toutes les clés">🔄</button>
      <div id="ax-vault-modal-root"></div>
    </div>
  `),V(e),ve(e),be(e),m.info("feature-vault",`rendered (${r.total} entries)`)}function be(e){const a=e.querySelector(".ax-vault-page"),t=e.querySelector("#ax-vault-fab");if(!a)return;let r=0,o=0;const s=()=>{o||(o=requestAnimationFrame(()=>{o=0;const b=window.scrollY||document.documentElement.scrollTop||0;b!==r&&(r=b,b>80?a.classList.add("ax-vault-scrolled"):a.classList.remove("ax-vault-scrolled"))}))};l?l.bind(window,"scroll",s,{passive:!0}):window.addEventListener("scroll",s,{passive:!0}),s(),t&&l&&l.bind(t,"click",()=>{p.tap(),e.querySelector("#ax-vault-test-all")?.click()})}function V(e){const a=e.querySelector("#ax-vault-categories");if(!a)return;if(te().total===0&&!a.dataset.axInitialized){a.dataset.axInitialized="1";const s=document.createElement("div");s.className="ax-skel-vault-wrapper",a.appendChild(s);const b=ce(s,"vault-cards");setTimeout(()=>{b(),s.remove(),V(e)},250)}const r=D.map(s=>{const b=de(s,N);if(b.length===0&&s.id!=="identity")return"";const g=b.length>0;return`
      <details class="ax-cat" data-cat-id="${x(s.id)}" ${g?"open":""}
        style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;overflow:hidden">
        <summary style="padding:14px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-weight:600;list-style:none;-webkit-tap-highlight-color:transparent;min-height:44px">
          <span>${x(s.label)} <span style="color:var(--ax-text-muted);font-weight:400;font-size:13px">(${b.length})</span></span>
          <span class="ax-chevron" style="color:var(--ax-text-muted);transition:transform 200ms ease-out">▼</span>
        </summary>
        <div style="padding:0 14px 14px;display:grid;grid-template-columns:repeat(auto-fill, minmax(280px,1fr));gap:10px">
          ${b.map(v=>xe(v)).join("")}
          ${b.length===0?`
            <div style="padding:20px;color:var(--ax-text-muted);text-align:center;grid-column:1/-1;font-size:13px">
              Aucun code dans cette catégorie<br>
              <button data-action="add-to-cat" data-cat-id="${x(s.id)}"
                style="margin-top:10px;padding:8px 14px;background:rgba(201,162,39,0.1);color:var(--ax-gold-deep);border:1px solid rgba(201,162,39,0.3);border-radius:8px;cursor:pointer;font-size:12px;min-height:36px">
                + Ajouter ${x(s.label)}
              </button>
            </div>
          `:""}
        </div>
      </details>
    `}).join("");let o=a.querySelector(".ax-vault-cats-wrapper");o||(o=document.createElement("div"),o.className="ax-vault-cats-wrapper",a.appendChild(o)),o.innerHTML=r}function ve(e){const a=e.querySelector("#ax-vault-search");if(a){let i=null;l.bind(a,"input",()=>{i&&clearTimeout(i),i=setTimeout(()=>{N=a.value.trim(),V(e),Y(e)},240)})}const t=e.querySelector("#ax-vault-add-manual");t&&l&&l.bind(t,"click",()=>{p.tap(),ae(e)});const r=e.querySelector("#ax-vault-test-all");r&&l&&l.bind(r,"click",()=>{(async()=>{p.tap(),d.info("Test de toutes les clés en cours…");try{const i=await A.healthCheckAll();d.success(`✅ ${i.tested} testées · ${i.recovered} récupérées · ${i.stillDown} HS`),_(e)}catch(i){m.warn("feature-vault","testAll failed",{err:i}),d.error("Erreur pendant le test global")}})()});const o=e.querySelector("#ax-vault-rescue-fb");o&&l&&l.bind(o,"click",()=>{(async()=>{p.tap();const i=e.querySelector("#ax-vault-rescue-result");i&&(i.innerHTML="⏳ Lecture Firebase backup chiffré…");try{const{vaultFirebaseBackup:c}=await L(async()=>{const{vaultFirebaseBackup:u}=await import("./vault-firebase-backup-DfSh_cbj.js");return{vaultFirebaseBackup:u}},__vite__mapDeps([0,1,2,3,4]),import.meta.url),n=await c.restoreAllFromFirebaseBackup();if(i){i.textContent="";const u=document.createElement("div");u.style.cssText="padding:8px;background:rgba(34,204,119,.1);color:var(--ax-green);border-radius:8px",u.textContent=`🔓 ${n.restored} clés restaurées · ${n.failed} échouées · ${n.skipped} ignorées`,i.append(u)}n.restored>0?(d.success(`🔓 ${n.restored} clés restaurées depuis Firebase backup`),p.success(),setTimeout(()=>_(e),600)):d.info("Aucune clé trouvée dans Firebase backup")}catch(c){m.warn("feature-vault","rescueFb failed",{err:c}),i&&(i.innerHTML=`<div class="ax-gs-48">⚠ ${x(String(c).slice(0,120))}</div>`),d.error("Erreur lecture Firebase backup"),p.error()}})()});const s=e.querySelector("#ax-vault-rescue-all");s&&l&&l.bind(s,"click",()=>{(async()=>{p.tap();const i=e.querySelector("#ax-vault-rescue-result");i&&(i.innerHTML="⏳ Scan 4 sources : alias, IDB, Firebase, pattern…");try{const{autoRestoreCredentials:c}=await L(async()=>{const{autoRestoreCredentials:u}=await import("./auto-restore-credentials-DbNLKglD.js");return{autoRestoreCredentials:u}},__vite__mapDeps([1,2,3,4]),import.meta.url),n=await c.restoreAutomatically();if(i){i.textContent="";const u=document.createElement("div");u.style.cssText="padding:8px;background:rgba(34,204,119,.1);color:var(--ax-green);border-radius:8px",u.textContent=`🔓 ${n.restored} restaurées · ${n.failed} échouées`,i.append(u)}n.restored>0?(d.success(`🔓 ${n.restored} clés restaurées (4 sources)`),p.success(),setTimeout(()=>_(e),600)):d.info("Aucune clé trouvable dans les 4 sources. Colle une clé manuellement ci-dessous.")}catch(c){m.warn("feature-vault","rescueAll failed",{err:c}),i&&(i.innerHTML=`<div class="ax-gs-48">⚠ ${x(String(c).slice(0,120))}</div>`),d.error("Erreur scan multi-sources"),p.error()}})()});const b=e.querySelector("#ax-vault-diag-btn");b&&l&&l.bind(b,"click",()=>{(async()=>{p.tap();const i=e.querySelector("#ax-vault-diag-result");i&&(i.textContent="⏳ Diagnostic en cours (local + Firebase + Cloudflare)…");try{const{vaultDiagnostic:c}=await L(async()=>{const{vaultDiagnostic:h}=await import("./vault-diagnostic-D3vJjOMt.js");return{vaultDiagnostic:h}},__vite__mapDeps([1,2,3,4]),import.meta.url),n=await c.run();if(!i)return;i.textContent="";const u=document.createElement("div");u.style.cssText="display:flex;flex-direction:column;gap:8px";const f=document.createElement("div");f.style.cssText="padding:10px;background:rgba(106,138,255,0.08);border:1px solid rgba(106,138,255,0.25);border-radius:8px;font-weight:600",f.textContent=n.summary,u.append(f);const S=document.createElement("div");S.style.cssText="padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;line-height:1.5";const T=document.createElement("div");if(T.textContent=`💾 Local : ${n.local.total} clé(s) — ${n.local.encrypted} chiffrées, ${n.local.plaintext} en clair`,S.append(T),n.local.sample.length){const h=document.createElement("div");h.style.cssText="opacity:0.6;font-family:monospace;font-size:11px;margin-top:4px",h.textContent="ex. "+n.local.sample.join(", "),S.append(h)}u.append(S);const C=document.createElement("div");C.style.cssText="padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;line-height:1.5";const $=document.createElement("div"),k=n.firebase.connected?"🟢":"🔴";if($.textContent=`☁ Firebase ${k} ${n.firebase.state} — ${n.firebase.backup_count} backup(s)`,C.append($),n.firebase.drift_detected){const h=document.createElement("div");h.style.cssText="opacity:0.85;color:var(--ax-gold);margin-top:4px",h.textContent=`⚠ Drift : ${n.firebase.in_local_not_fb.length} local-only, ${n.firebase.in_fb_not_local.length} Firebase-only`,C.append(h)}u.append(C);const q=document.createElement("div");q.style.cssText="padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;line-height:1.5";const I=document.createElement("div"),R=n.cloudflare_proxy.reachable?"🟢":"🔴";I.textContent=`🌐 Cloudflare proxy ${R} ${n.cloudflare_proxy.reachable?`OK (${n.cloudflare_proxy.latency_ms}ms, ${n.cloudflare_proxy.providers.length} providers)`:"KO ("+(n.cloudflare_proxy.error??"unreachable")+")"}`,q.append(I);const K=document.createElement("div");if(K.style.cssText="opacity:0.55;font-family:monospace;font-size:10px;margin-top:4px;word-break:break-all",K.textContent=n.cloudflare_proxy.url,q.append(K),u.append(q),n.recommendations.length){const h=document.createElement("div");h.style.cssText="padding:10px;background:rgba(232,184,48,0.08);border:1px solid rgba(232,184,48,0.25);border-radius:8px;font-size:12px;line-height:1.6";const E=document.createElement("div");E.style.cssText="font-weight:700;color:var(--ax-gold);margin-bottom:6px",E.textContent="💡 À faire :",h.append(E);for(const re of n.recommendations){const M=document.createElement("div");M.style.cssText="padding:3px 0 3px 12px;position:relative";const F=document.createElement("span");F.style.cssText="position:absolute;left:0;top:3px",F.textContent="→",M.append(F),M.append(document.createTextNode(" "+re)),h.append(M)}u.append(h)}i.append(u),p.success()}catch(c){if(m.warn("feature-vault","diag failed",{err:c}),i){i.textContent="";const n=document.createElement("div");n.style.cssText="padding:8px;background:rgba(255,91,91,0.1);color:#ff8b8b;border-radius:8px",n.textContent="⚠ Diagnostic échoué : "+String(c).slice(0,160),i.append(n)}d.error("Diagnostic impossible"),p.error()}})()});const g=e.querySelector("#ax-vault-cleanup-invalid");g&&l&&l.bind(g,"click",()=>{(async()=>{p.tap();const i=e.querySelector("#ax-vault-rescue-result");if(confirm(`Supprimer définitivement toutes les clés illisibles (decrypt fail) ?

Ces clés sont chiffrées avec une passphrase perdue. Tu devras les recoller pour les retrouver.`)){i&&(i.innerHTML="⏳ Suppression des entrées illisibles…");try{const n=U().filter(f=>f.status==="invalid");let u=0;for(const f of n)try{if(f.id.startsWith("mkv_")||f.id.includes("_")){A.removeKey(f.id),u++;continue}const S=f.id.startsWith("ax_")||f.id.startsWith("apex_v13_")?f.id:`ax_${f.service}_key`;localStorage.removeItem(S);const T=indexedDB.open("apex_v13_vault_shadow",1);T.onsuccess=()=>{try{T.result.transaction("keys","readwrite").objectStore("keys").delete(S),T.result.close()}catch{}},u++}catch{}if(i){i.textContent="";const f=document.createElement("div");f.style.cssText="padding:8px;background:rgba(34,204,119,.1);color:var(--ax-green);border-radius:8px",f.textContent=`🗑 ${u} clé(s) illisibles supprimées. Recolle tes clés via "Détecter & stocker" ci-dessous.`,i.append(f)}d.success(`🗑 ${u} clés illisibles supprimées`),p.success(),setTimeout(()=>_(e),800)}catch(c){m.warn("feature-vault","cleanupInvalid failed",{err:c}),d.error("Erreur suppression"),p.error()}}})()});const v=e.querySelector("#ax-vault-paste-clipboard-btn");v&&l&&l.bind(v,"click",()=>{(async()=>{p.tap();const i=e.querySelector("#ax-vault-paste"),c=e.querySelector("#ax-vault-paste-result");if(i)try{if(!navigator.clipboard?.readText)throw new Error("Clipboard API non supportée");const n=await navigator.clipboard.readText();if(!n){c&&(c.innerHTML='<div class="ax-gs-174">⚠ Presse-papier vide</div>');return}i.value=n,i.dispatchEvent(new Event("input",{bubbles:!0})),p.success(),d.success(`📋 ${n.length} caractères collés — clique "Détecter & stocker"`),c&&(c.innerHTML='<div style="padding:8px;background:rgba(106,138,255,.1);color:var(--ax-blue);border-radius:8px">📋 Collé — clique "Détecter & stocker" pour analyser</div>'),i.focus()}catch(n){const u=n instanceof Error?n.message:"unknown";d.error(`Clipboard refusé : ${u}. Utilise long-press → Coller manuellement.`),c&&(c.innerHTML='<div class="ax-gs-48">⚠ Permission refusée. Long-press dans le champ → Coller.</div>')}})()});const w=e.querySelector("#ax-vault-paste-btn");w&&l&&l.bind(w,"click",()=>{(async()=>{p.tap();const i=e.querySelector("#ax-vault-paste"),c=e.querySelector("#ax-vault-paste-result");if(!i||!c)return;const n=i.value.trim();if(!n){c.innerHTML=`<div class="ax-gs-174">⚠ Colle quelque chose d'abord</div>`;return}const u=await pe(n);if(u.ok){p.success(),d.success(`✅ ${u.pattern_name} stocké`),c.innerHTML=`<div style="padding:8px;background:rgba(34,204,119,.1);color:var(--ax-green);border-radius:8px">✅ ${x(u.pattern_name)} → ${x(u.storage_key)}</div>`;const f=j(n);if(f){const S=f.storageKey.replace(/^(ax_|apex_v13_)/,"").replace(/_(?:key|token|pat|sk|pk|id|secret)$/,"");try{await A.addKey(S,n)}catch{}}i.value="",_(e)}else p.error(),d.error(u.reason),c.innerHTML=`<div class="ax-gs-48">⚠ ${x(u.reason)}</div>`})()});const y=e.querySelector("#ax-vault-import");y&&l&&l.bind(y,"click",()=>{(async()=>{p.tap();try{const{apexVaultImport:i}=await L(async()=>{const{apexVaultImport:n}=await import("./apex-vault-import-BQud4WZp.js");return{apexVaultImport:n}},__vite__mapDeps([2,3,1,4]),import.meta.url),c=await i.promptAndImport();if(c.cancelled){d.info("Import annulé",{duration:2e3});return}c.ok&&c.restored>0?(d.success(`🔓 ${c.restored} clés restaurées depuis JSON Drive${c.failed>0?` · ${c.failed} échouées`:""}`,{duration:8e3}),setTimeout(()=>location.reload(),1500)):c.decrypt_failed>0?d.error(`🔒 ${c.decrypt_failed} clés non déchiffrables. PIN admin différent ? Vérifie ton PIN actuel.`,{duration:1e4}):c.error?d.error(`Import échoué : ${c.error.slice(0,80)}`,{duration:8e3}):d.warn("Aucune clé restaurée depuis ce JSON",{duration:5e3})}catch(i){const c=i instanceof Error?i.message:String(i);d.error(`Import erreur : ${c.slice(0,80)}`,{duration:8e3})}})()});const B=e.querySelector("#ax-vault-export");B&&l&&l.bind(B,"click",()=>{p.tap();const i=W(O()),c=new Blob([i],{type:"application/json"}),n=URL.createObjectURL(c),u=document.createElement("a");u.href=n,u.download=`apex-vault-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(u),u.click(),document.body.removeChild(u),URL.revokeObjectURL(n),d.success("Coffre exporté (chiffré)")});const G=e.querySelector("#ax-vault-qr-backup");G&&l&&l.bind(G,"click",()=>{(async()=>{p.tap();try{const i=W(O()),c=(i.length/1024).toFixed(1),n=O().length,u=2500;let f="";try{f=(await L(()=>import("https://cdn.jsdelivr.net/npm/lz-string@1.5.0/+esm"),[],import.meta.url)).compressToEncodedURIComponent(i);const k=(f.length/1024).toFixed(1);m.info("vault-qr-backup",`LZ compress ${c}KB → ${k}KB (${Math.round((1-f.length/i.length)*100)}% gain)`)}catch($){m.warn("vault-qr-backup","LZ-string load failed",{err:$})}if(f&&f.length<u){const{apexQrBackup:$}=await L(async()=>{const{apexQrBackup:k}=await import("./apex-qr-backup-C3M_--qI.js");return{apexQrBackup:k}},__vite__mapDeps([1,2,3,4]),import.meta.url);await $.showQrBackupModal({text:`APEXVAULT_LZ:${f}`,title:"📦 Backup Vault Compressé — Photos iCloud",description:`${n} clés compressées LZ (${(f.length/1024).toFixed(1)}KB vs ${c}KB orig). JSON chiffré AES-GCM-256. Sauvegarde dans Photos iCloud — au reinstall, scan = restore complet.`,filename:`apex-vault-backup-${new Date().toISOString().slice(0,10)}.png`});return}d.info(`Vault compressé ${f.length}B encore > QR max. Upload Gist privé chiffré...`,{duration:4e3});try{const{apexGithubGistBackup:$}=await L(async()=>{const{apexGithubGistBackup:q}=await import("./apex-github-gist-backup-B1QTQoD8.js");return{apexGithubGistBackup:q}},__vite__mapDeps([1,2,3,4,5]),import.meta.url),k=await $.pushBackup({force:!0});if(k.ok&&k.gist_id){const q=`https://gist.github.com/${k.gist_id}`,{apexQrBackup:I}=await L(async()=>{const{apexQrBackup:R}=await import("./apex-qr-backup-C3M_--qI.js");return{apexQrBackup:R}},__vite__mapDeps([1,2,3,4]),import.meta.url);await I.showQrBackupModal({text:`APEXVAULT_GIST:${k.gist_id}`,title:"📦 Backup Vault → Gist URL — Photos iCloud",description:`${n} clés uploadées Gist privé chiffré (${(k.bytes??0)/1024}KB). QR contient juste l'ID Gist. Au reinstall, scan + PAT GitHub = pull Gist + restore complet. URL : ${q}`,filename:`apex-vault-gist-${new Date().toISOString().slice(0,10)}.png`});return}d.warn(`Gist upload échoué : ${k.error??"?"}. Fallback download JSON.`,{duration:6e3})}catch($){m.warn("vault-qr-backup","gist push failed",{err:$})}const S=new Blob([i],{type:"application/json"}),T=URL.createObjectURL(S),C=document.createElement("a");C.href=T,C.download=`apex-vault-backup-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(C),C.click(),document.body.removeChild(C),URL.revokeObjectURL(T),d.success(`📥 Backup JSON téléchargé (${c}KB chiffré). Sauvegarde dans iCloud Drive / Notes.`,{duration:8e3})}catch(i){const c=i instanceof Error?i.message:String(i);d.error(`Backup QR échoué : ${c.slice(0,60)}`,{duration:6e3})}})()}),Y(e)}function Y(e){e.querySelectorAll('[data-action="test"]').forEach(a=>{l.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.credId??"";me(e,r,a)})}),e.querySelectorAll('[data-action="recharge"]').forEach(a=>{l.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.rechargeUrl??"",o=a.dataset.service??"";he(r,o)})}),e.querySelectorAll('[data-action="discover-links"]').forEach(a=>{l.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.service??"";ye(e,r,a)})}),e.querySelectorAll('[data-action="edit"]').forEach(a=>{l.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.credId??"";we(e,r)})}),e.querySelectorAll('[data-action="delete"]').forEach(a=>{l.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.credId??"";ke(e,r)})}),e.querySelectorAll('[data-action="add-to-cat"]').forEach(a=>{l.bind(a,"click",t=>{t.stopPropagation();const r=a.dataset.catId??"";ae(e,r)})})}async function me(e,a,t){if(!a)return;p.tap();const r=t.textContent;t.textContent="⏳ Test…",t.setAttribute("disabled","true");try{const o=await A.testKey(a);o.ok?(p.success(),d.success(`✅ Active (${o.latencyMs}ms)`)):(p.error(),d.error(`❌ ${o.reason??"Test échoué"}`)),_(e)}catch(o){m.warn("feature-vault","testKey failed",{err:o}),p.error(),d.error("Erreur pendant le test"),t.textContent=r,t.removeAttribute("disabled")}}function he(e,a){if(p.tap(),!e){d.warn(`Aucune page recharge connue pour ${a}`);return}try{window.open(e,"_blank","noopener,noreferrer")}catch(t){m.warn("feature-vault","recharge open failed",{err:t}),d.error("Impossible d'ouvrir le lien")}}async function ye(e,a,t){if(!a)return;p.tap();const r=t.textContent;t.textContent="⏳ Recherche…",t.setAttribute("disabled","true");try{const o=await ne.discover(a,{force:!0}),s=[];o.login&&s.push("login"),o.dashboard&&s.push("dashboard"),o.billing&&s.push("billing"),o.api_keys&&s.push("api_keys"),o.usage&&s.push("usage"),o.docs&&s.push("docs"),o.password_reset&&s.push("reset_pw"),o.account_settings&&s.push("settings"),o.support&&s.push("support"),o.status_page&&s.push("status"),o.alive&&s.length>0?(p.success(),d.success(`🔗 ${s.length} liens trouvés (${o.source}) : ${s.join(", ")}`)):(p.error(),d.warn(`Aucun lien validé pour ${a} — réessaie plus tard`)),_(e)}catch(o){m.warn("feature-vault","discoverLinks failed",{err:o}),p.error(),d.error("Erreur pendant la recherche de liens")}finally{t.textContent=r,t.removeAttribute("disabled")}}function ke(e,a){if(a&&(p.tap(),!!window.confirm("Supprimer cette clé définitivement ? Elle sera retirée du Coffre + ne sera plus restaurée auto.")))try{A.removeKey(a),p.success(),d.success("Clé supprimée définitivement ✓"),_(e)}catch(t){m.warn("feature-vault","delete failed",{err:t}),p.error(),d.error("Suppression échouée")}}function H(e){let a=e.querySelector("#ax-vault-modal-root");return a||(a=document.createElement("div"),a.id="ax-vault-modal-root",e.appendChild(a)),a}function z(e){const a=H(e);a.innerHTML=""}function ae(e,a){const t=H(e),r=D.filter(g=>g.id!=="other").map(g=>`<option value="${x(g.id)}" ${a===g.id?"selected":""}>${x(g.label)}</option>`).join("");t.innerHTML=`
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
            ${r}
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
  `,(()=>{const g=t.querySelector("#ax-vault-modal-close");g&&l&&l.bind(g,"click",()=>z(e))})();const o=t.querySelector('[role="dialog"]');o&&l&&l.bind(o,"click",g=>{g.target===o&&z(e)});const s=t.querySelector("#ax-vault-add-detect");s&&l&&l.bind(s,"click",()=>{(async()=>{p.tap();const g=t.querySelector("#ax-vault-add-value");if(!g)return;const v=j(g.value.trim());if(!v){d.warn("Aucun pattern reconnu");return}if(v.category==="forbidden"){d.error("🚨 Type interdit");return}const w=t.querySelector("#ax-vault-add-service"),y=t.querySelector("#ax-vault-add-cat");if(w){const B=v.storageKey.replace(/^(ax_|apex_v13_)/,"").replace(/_(?:key|token|pat|sk|pk|id|secret)$/,"");w.value=B}y&&(y.value=ee(w?.value??"",v.category)),d.success(`Détecté: ${v.name}`)})()});const b=t.querySelector("#ax-vault-add-save");b&&l&&l.bind(b,"click",()=>{(async()=>{p.tap();const g=t.querySelector("#ax-vault-add-service")?.value.trim()??"",v=t.querySelector("#ax-vault-add-alias")?.value.trim()??"",w=t.querySelector("#ax-vault-add-value")?.value.trim()??"";if(!g||!w){d.warn("Service et valeur requis");return}try{const y={};v&&(y.alias=v),await A.addKey(g,w,y),d.success(`✅ Clé ${g} chiffrée + sauvegardée`),z(e),_(e)}catch(y){m.warn("feature-vault","add manual failed",{err:y}),d.error("Erreur pendant la sauvegarde")}})()})}function we(e,a){const t=H(e),r=A.listAll(!0).find(s=>s.id===a);if(!r){d.error("Clé introuvable");return}t.innerHTML=`
    <div role="dialog" aria-modal="true" aria-label="Modifier une clé"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">
      <div style="background:var(--ax-bg-flat);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;max-width:440px;width:100%">
        <div class="ax-gs-175">
          <h2 class="ax-gs-475">✏️ Modifier ${x(r.service)}</h2>
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
          <input type="text" id="ax-vault-edit-alias" aria-label="Alias optionnel" value="${x(r.alias??"")}"
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
  `,(()=>{const s=t.querySelector("#ax-vault-modal-close");s&&l&&l.bind(s,"click",()=>z(e))})(),(()=>{const s=t.querySelector("#ax-vault-edit-cancel");s&&l&&l.bind(s,"click",()=>z(e))})();const o=t.querySelector("#ax-vault-edit-save");o&&l&&l.bind(o,"click",()=>{(async()=>{p.tap();const s=t.querySelector("#ax-vault-edit-value")?.value.trim()??"",b=t.querySelector("#ax-vault-edit-alias")?.value.trim()??"";if(!s){d.warn("Valeur requise");return}try{A.markInvalid(a,"replaced via edit");const g={};b&&(g.alias=b),await A.addKey(r.service,s,g),d.success("✅ Clé mise à jour"),z(e),_(e)}catch(g){m.warn("feature-vault","edit save failed",{err:g}),d.error("Erreur pendant la modification")}})()})}export{D as CATEGORIES,pe as autoDetectAndStore,U as buildCredentialDisplays,ee as classifyService,te as computeStats,Ne as dispose,x as escapeHtml,W as exportVaultJson,Ve as filterVaultEntries,X as formatRelativeTime,de as getCredentialsForCategory,O as listVaultEntries,He as removeCredential,_ as render,xe as renderCredentialCard};
