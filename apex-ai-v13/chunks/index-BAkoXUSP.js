const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-CjFIi9oP.js","./multi-source-analyze-DrPaQ0LG.js","./credential-patterns-DUMYZEMu.js","./apex-kb-D2nugpTJ.js","./vault-firebase-backup-dbz7h9oB.js","./auth-B89bwu7m.js"])))=>i.map(i=>d[i]);
import{l as m,b as te,e as g,_ as q}from"./monitoring-CjFIi9oP.js";import{c as ue}from"./listener-cleanup-Y2rGGxxX.js";import{g as xe}from"./apex-tools-dispatch-core-DtI8A9qn.js";import{c as ge}from"./csp-style-helper-BEHhIhzj.js";import{autoDiscoverLinks as fe}from"./auto-discover-links-B_1f1GTU.js";import{l as ae}from"./multi-source-analyze-DrPaQ0LG.js";import{detectCredential as Y,CREDENTIAL_PATTERNS as le}from"./credential-patterns-DUMYZEMu.js";import{g as be}from"./generic-secrets-os0OSLy2.js";import{multiKeyVault as C}from"./multi-key-vault-DLVytw6I.js";import{v as J}from"./apex-kb-D2nugpTJ.js";import{haptic as u}from"./haptic-CQFg2PXZ.js";import{s as ve}from"../core/main-d-cowZmI.js";import{toast as p}from"./toast-BCPNzfMv.js";import"./apex-tools-dispatch-skills-GUVkB7Yq.js";import"./apex-tools-dispatch-data-DWqMwJcL.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-DKYDkad7.js";import"./apex-tools-misc-egOYxmOa.js";import"./apex-tools-registry-core-48oOK-KS.js";import"./apex-tools-registry-skills-x-mAWYry.js";import"./memory-Bs2GnqEf.js";async function D(e,r){const t=typeof window<"u"?window:null,o=t?.scrollY??0,n=e?.scrollTop??0,l=e?.scrollLeft??0,b=document.activeElement&&document.activeElement!==document.body?document.activeElement.id:null,h=b?`#${b}`:null;let $=null;if(h){const y=document.activeElement;y&&typeof y.selectionStart=="number"&&typeof y.selectionEnd=="number"&&($={start:y.selectionStart,end:y.selectionEnd})}try{return await r()}finally{queueMicrotask(()=>{try{if(t&&o>0&&t.scrollTo({top:o,left:0,behavior:"instant"}),e&&(n>0&&(e.scrollTop=n),l>0&&(e.scrollLeft=l)),h){const y=document.querySelector(h);if(y&&typeof y.focus=="function"&&(y.focus({preventScroll:!0}),$&&"setSelectionRange"in y)){const _=y;try{_.setSelectionRange($.start,$.end)}catch{}}}}catch(y){m.debug("view-utils","preserveScroll restore failed",{err:y})}})}}let d=null;function tt(){d?.cleanup(),d=null}const O=[{id:"ai",label:"🤖 IA & LLM",serviceMatchers:["anthropic","openai","groq","google","gemini","openrouter","cohere","mistral","perplexity","deepseek","xai","elevenlabs","replicate","huggingface","fireworks","togetherai","deepl"],patternCategories:["ai"]},{id:"finance",label:"💳 Paiements & Finance",serviceMatchers:["stripe","paypal","revolut","wise","lydia","n26","boursorama","fortuneo","ing","socgen","bnp","credit_agricole","credit_mutuel","banque_postale","lbp","bpce","shopify"],patternCategories:["finance"]},{id:"devops",label:"🛠 DevOps & Code",serviceMatchers:["github","gitlab","cloudflare","vercel","netlify","railway","aws","heroku","sentry","npm"],patternCategories:["devops"]},{id:"comms",label:"📨 Communications",serviceMatchers:["telegram","discord","slack","brevo","resend","twilio","sendgrid","mailchimp","whatsapp"],patternCategories:["comms"]},{id:"social",label:"🌐 Réseaux sociaux",serviceMatchers:["facebook","instagram","tiktok","youtube","twitter","linkedin"],patternCategories:[]},{id:"storage",label:"☁️ Stockage & Cloud",serviceMatchers:["firebase","supabase","airtable","notion","dropbox","pinecone","weaviate"],patternCategories:["storage"]},{id:"ecommerce",label:"🛒 E-commerce",serviceMatchers:["shopify","stripe_connect","paypal_business"],patternCategories:[]},{id:"crypto",label:"₿ Crypto",serviceMatchers:["coinbase","binance","crypto_com","kraken"],patternCategories:[]},{id:"identity",label:"🆔 Identité Kevin",serviceMatchers:["kevin","iban","siret","vat","bic","apple","microsoft"],patternCategories:["identity"]},{id:"addresses",label:"🏠 Adresses & appartements",serviceMatchers:[],patternCategories:[]},{id:"other",label:"📦 Autres",serviceMatchers:[],patternCategories:["saas"]}],me=new Set(["identity","addresses","other"]),Q=new Set(["identity","addresses"]);function X(e,r){const t=e.toLowerCase();let o=null;for(const n of O)if(n.id!=="other")for(const l of n.serviceMatchers)t.includes(l)&&(!o||l.length>o.matchLen)&&(o={catId:n.id,matchLen:l.length});if(o)return o.catId;if(r){for(const n of O)if(n.patternCategories.includes(r))return n.id}return"other"}function W(){return le.filter(e=>e.category!=="forbidden").map(e=>{const r=J.getKeyStatus(e.storageKey),t=(()=>{try{return localStorage.getItem(e.storageKey)??""}catch{return""}})(),o=t&&t.length>8&&!t.startsWith("AXENC1:")?J.maskKey(t):t.startsWith("AXENC1:")?"🔒 chiffré":"";return{pattern:e,status:r,masked:o}})}function at(e,r){return e.filter(t=>{if(r.category&&t.pattern.category!==r.category||r.configuredOnly&&t.status==="empty")return!1;if(r.query){const o=r.query.toLowerCase();if(!(t.pattern.name.toLowerCase().includes(o)||t.pattern.storageKey.toLowerCase().includes(o)))return!1}return!0})}function V(){const e=[];let r=[];try{r=C.listAll(!0)}catch(t){m.warn("feature-vault","multiKeyVault.listAll failed",{err:t})}for(const t of r){const o=ae.get(t.service),n=le.find(h=>h.storageKey.includes(t.service)),l={id:t.id,service:t.service,serviceName:o?.name??ye(t.service),category:t.category??X(t.service,n?.category),status:t.status,source:"multi-key"};t.label!==void 0&&(l.label=t.label),t.kind!==void 0&&(l.kind=t.kind),t.alias!==void 0&&(l.alias=t.alias),t.addedAt!==void 0&&(l.addedAt=t.addedAt),t.lastTestedAt!==void 0&&(l.lastTestedAt=t.lastTestedAt);const b=ae.getRechargeLink(t.service);b&&(l.rechargeUrl=b),e.push(l)}return e}function ce(){const e=V(),r={total:e.length,active:0,failing:0,invalid:0};for(const t of e)t.status==="active"?r.active+=1:t.status==="failing"||t.status==="rate-limited"?r.failing+=1:t.status==="invalid"&&(r.invalid+=1);return r}function he(e,r=""){const t=V(),o=r.trim().toLowerCase();return t.filter(n=>n.category!==e.id?!1:o?n.service.toLowerCase().includes(o)||n.serviceName.toLowerCase().includes(o)||(n.alias?.toLowerCase().includes(o)??!1):!0)}function ye(e){return e.charAt(0).toUpperCase()+e.slice(1)}async function ke(e){const r=e.trim();if(!r)return{ok:!1,reason:"Entrée vide"};const t=Y(r);if(t&&t.category==="forbidden")return{ok:!1,reason:"🚨 Type interdit (cartes/seed phrases jamais stockées)"};if(t)try{const o=await J.encryptAuto(r);return localStorage.setItem(t.storageKey,o),{ok:!0,pattern_name:t.name,storage_key:t.storageKey}}catch(o){return m.warn("vault-feature","autoDetectAndStore failed",{err:o}),{ok:!1,reason:"Erreur chiffrement"}}if(r.length>=20){const o=await be.add(r,void 0,"Auto-détecté (pattern inconnu)");return o.ok?{ok:!0,generic:!0,pattern_name:"Secret générique",storage_key:"apex_v13_generic_secrets",generic_id:o.id}:{ok:!1,reason:o.reason}}return{ok:!1,reason:"Aucun pattern reconnu (trop court pour secret générique)"}}function rt(e){try{return localStorage.removeItem(e),!0}catch(r){return m.warn("vault-feature","remove failed",{err:r}),!1}}function re(e){const r={exported_at:new Date().toISOString(),version:1,entries:e.filter(t=>t.status!=="empty").map(t=>{const o=(()=>{try{return localStorage.getItem(t.pattern.storageKey)??""}catch{return""}})();return{storage_key:t.pattern.storageKey,name:t.pattern.name,value_encrypted:o}})};return JSON.stringify(r,null,2)}function we(e){const r=e.kind==="info",t=r?"var(--ax-green)":Se[e.status]??"var(--ax-text-muted)",o=r?"🟢":$e[e.status]??"⚪",n=r?"Enregistré":e.status,l=(e.preview??"").slice(0,4)+"••••••"+(e.preview??"").slice(-4),b=e.preview?l:"••••••",h=e.rechargeUrl??"",$=e.alias?`<span style="color:var(--ax-text-muted);font-size:11px">— ${g(e.alias)}</span>`:"",y=e.label?`<div style="font-size:12px;color:var(--ax-gold-deep);margin-top:-2px">📝 ${g(e.label)}</div>`:"",_=e.logoUrl?`<img src="${g(e.logoUrl)}" alt="" loading="lazy" decoding="async" style="width:24px;height:24px;border-radius:6px" onerror="this.style.display='none'">`:"",I=[];e.addedAt&&I.push(`Ajouté ${ie(e.addedAt)}`),e.lastTestedAt&&I.push(`Testé ${ie(e.lastTestedAt)}`);const B=I.length>0?`<div style="display:flex;gap:8px;font-size:11px;color:var(--ax-text-muted);margin-bottom:10px">${I.map(M=>`<span>${g(M)}</span>`).join("")}</div>`:"";return`
    <div class="ax-cred-card" data-cred-id="${g(e.id)}" data-service="${g(e.service)}"
      style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;transition:all 200ms ease-out;position:relative;display:flex;flex-direction:column;gap:8px">
      <div style="position:absolute;top:14px;right:14px;width:10px;height:10px;border-radius:50%;background:${g(t)};box-shadow:0 0 8px ${g(t)}" title="${g(o)} ${g(n)}"></div>
      <div class="ax-gs-120">
        ${_}
        <strong style="font-size:15px;color:#fff">${g(e.serviceName)}</strong>
        ${$}
      </div>
      ${y}
      <code style="display:block;padding:6px 10px;background:rgba(0,0,0,0.3);border-radius:6px;font-size:11px;color:var(--ax-text-muted);font-family:'SF Mono',Menlo,monospace;letter-spacing:1px">${g(b)}</code>
      ${B}
      ${r?`
      <div class="ax-gs-20">
        <span style="flex:1;min-width:120px;padding:6px 10px;background:rgba(34,204,119,0.1);color:var(--ax-green);border:1px solid rgba(34,204,119,0.25);border-radius:6px;font-size:11px;display:flex;align-items:center;justify-content:center;min-height:44px">🟢 Enregistré (chiffré)</span>
        <button data-action="edit" data-cred-id="${g(e.id)}" aria-label="Modifier ${g(e.serviceName)}" title="Modifier"
          style="min-width:44px;padding:6px 10px;background:rgba(255,255,255,0.05);color:var(--ax-text-dim);border:1px solid rgba(255,255,255,0.1);border-radius:6px;cursor:pointer;font-size:11px;min-height:44px">✏️</button>
        <button data-action="delete" data-cred-id="${g(e.id)}" aria-label="Supprimer ${g(e.serviceName)}" title="Supprimer"
          style="min-width:44px;padding:6px 10px;background:rgba(255,91,91,0.1);color:var(--ax-error);border:1px solid rgba(255,91,91,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:44px">🗑</button>
      </div>`:`
      <div class="ax-gs-20">
        <button data-action="test" data-cred-id="${g(e.id)}" aria-label="Tester la clé ${g(e.service)}"
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(34,204,119,0.1);color:var(--ax-green);border:1px solid rgba(34,204,119,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:44px">🔄 Test</button>
        <button data-action="recharge" data-service="${g(e.service)}" data-recharge-url="${g(h)}" ${h?"":"disabled"} aria-label="Recharger ${g(e.service)}"
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(201,162,39,0.1);color:var(--ax-gold-deep);border:1px solid rgba(201,162,39,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:44px;${h?"":"opacity:0.4;cursor:not-allowed"}">💰 Recharger</button>
        <button data-action="discover-links" data-service="${g(e.service)}" aria-label="Chercher les liens de ${g(e.service)}"
          title="Cherche login/dashboard/billing/api_keys/usage en autonomie"
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(74,158,255,0.1);color:var(--ax-blue-bright);border:1px solid rgba(74,158,255,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:44px">🔍 Chercher liens</button>
        <button data-action="edit" data-cred-id="${g(e.id)}" aria-label="Modifier la clé ${g(e.service)}" title="Modifier"
          style="min-width:44px;padding:6px 10px;background:rgba(255,255,255,0.05);color:var(--ax-text-dim);border:1px solid rgba(255,255,255,0.1);border-radius:6px;cursor:pointer;font-size:11px;min-height:44px">✏️</button>
        <button data-action="delete" data-cred-id="${g(e.id)}" aria-label="Supprimer la clé ${g(e.service)}" title="Supprimer"
          style="min-width:44px;padding:6px 10px;background:rgba(255,91,91,0.1);color:var(--ax-error);border:1px solid rgba(255,91,91,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:44px">🗑</button>
      </div>`}
    </div>
  `}const Se={active:"var(--ax-green)",failing:"var(--ax-warning)","rate-limited":"var(--ax-warning)",invalid:"var(--ax-error)",unknown:"var(--ax-text-muted)"},$e={active:"🟢",failing:"🟡","rate-limited":"🟡",invalid:"🔴",unknown:"⚪"};function ie(e){const r=Date.now()-e;if(r<0||!Number.isFinite(r))return"à l'instant";const t=Math.floor(r/6e4);if(t<1)return"à l'instant";if(t<60)return`il y a ${t}min`;const o=Math.floor(t/60);if(o<24)return`il y a ${o}h`;const n=Math.floor(o/24);return n<30?`il y a ${n}j`:`il y a ${Math.floor(n/30)} mois`}let H="";function _e(){try{let e=[];try{const r=JSON.parse(localStorage.getItem("ax_credentials_deleted")??"[]");Array.isArray(r)&&(e=r.filter(t=>typeof t=="string"))}catch{}for(let r=0;r<localStorage.length;r++){const t=localStorage.key(r);if(!t||!t.startsWith("ax_")||!(t.endsWith("_key")||t.endsWith("_token")||t.endsWith("_secret")||t.endsWith("_sk"))||e.includes(t))continue;const o=localStorage.getItem(t);if(o&&o.length>2)return!0}}catch{}return!1}let se=!1;function A(e){if(d?.cleanup(),d=ue("vault"),!te.get("isAdmin")){e.innerHTML=`<div style="padding:40px;text-align:center"><h2 class="ax-gs-372">🔒 Coffre admin</h2><p class="ax-gs-226">Cette section est réservée à l'admin Kevin.</p></div>`;return}const t=te.get("user")?.id??"anon";if(!xe("admin.vault",e,t))return;if(!se&&V().length===0&&_e()){se=!0,e.innerHTML='<div style="padding:40px;text-align:center"><h2 class="ax-gs-372">🔓 Restauration du Coffre…</h2><p class="ax-gs-226">Récupération de tes clés depuis la sauvegarde locale, un instant.</p></div>',(async()=>{try{const n=await C.migrateLegacyFlatKeys();m.info("feature-vault",`auto-rebuild index : ${n.migrated} clés réinjectées dans le coffre`)}catch(n){m.warn("feature-vault","auto-rebuild migrate failed",{err:n})}A(e)})();return}const o=ce();e.innerHTML=ge.withNonce(`
    <style>
      /* v13.3.22 UX iPhone PWA fix Kevin "j'ai dû descendre la page on voit plus le haut" :
       * Header + search bar STICKY robustes (top:0 sans interférence padding parent).
       * Compact-mode auto via class .ax-vault-scrolled (ajoutée en JS au scroll > 80px).
       * Bottom safe-area + FAB floating "Tester tout" si scrollé loin. */
      .ax-vault-page button:active { transform: scale(0.96); }
      .ax-vault-page details[open] > summary .ax-chevron { transform: rotate(180deg); }
      .ax-cred-card:hover { transform: translateY(-2px); border-color: rgba(232,184,48,0.3) !important; }
      .ax-vault-sticky-wrap {
        /* Kevin 2026-06-08 : en-tête NON-collant — il restait figé en haut et le
         * reste défilait dessous. Il défile maintenant normalement avec le contenu. */
        position: relative;
        z-index: 1;
        margin: 0 -16px;
        padding: 0 16px;
        background: rgba(8,8,15,0.96);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border-bottom: 1px solid rgba(201,162,39,0.15);
        transition: padding 200ms ease, box-shadow 200ms ease;
      }
      /* Cache opaque derrière la barre d'état iPhone (viewport-fit=cover) : le
       * contenu scrollé disparaît proprement derrière l'heure au lieu de "passer
       * dessous". Hauteur = safe-area (0 sur appareils sans notch → invisible). */
      .ax-vault-statusbar-scrim {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: env(safe-area-inset-top, 0px);
        background: rgba(8,8,15,0.92);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        z-index: 45;
        pointer-events: none;
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
      <div class="ax-vault-statusbar-scrim" aria-hidden="true"></div>

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
            <span>📊 ${o.total} codes</span>
            <span class="ax-gs-222">🟢 ${o.active} actifs</span>
            <span class="ax-gs-168">🟡 ${o.failing} dégradés</span>
            <span class="ax-gs-76">🔴 ${o.invalid} invalides</span>
          </div>
        </header>

        <div class="ax-vault-search-row" style="padding-bottom:12px;transition:padding 200ms ease">
          <input type="text" id="ax-vault-search" aria-label="Chercher un service dans le coffre" value="${g(H)}" placeholder="🔍 Chercher un service..."
            style="width:100%;padding:12px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;color:#fff;font-size:15px;box-sizing:border-box;-webkit-appearance:none;min-height:44px">
        </div>
      </div>

      <div style="height:14px"></div>

      ${o.total===0||o.invalid>0?`
      <section id="ax-vault-empty-rescue" class="ax-empty-banner" style="background:linear-gradient(135deg,rgba(255,91,91,0.10),rgba(232,184,48,0.06));border-color:rgba(255,91,91,0.35)">
        <h3 class="ax-empty-banner-title">${o.total===0?"🆘 Coffre vide — Restauration possible":`🚨 ${o.invalid} clé(s) illisible(s) — récupération ou cleanup`}</h3>
        <p class="ax-empty-banner-body">${o.total===0?"Utilise les boutons « 🔓 Restaurer depuis Firebase » ou « 🔄 Scanner toutes sources » dans la section Diagnostic ci-dessous, ou recolle tes clés via « Auto-détection rapide ».":"Ces clés ont été chiffrées avec une passphrase historisée perdue (régression v13.3.86 fixée v13.3.88). Soit recoller les clés via « Auto-détection rapide », soit supprimer les illisibles."}</p>
        ${o.invalid>0?`<div class="ax-gs-7"><button id="ax-vault-cleanup-invalid" data-action="cleanup-invalid" class="ax-btn-health ax-btn-health-danger">🗑 Supprimer ${o.invalid} illisibles</button></div>`:""}
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

      <details id="ax-vault-proxy-providers" style="background:rgba(34,204,119,0.05);border:1px solid rgba(34,204,119,0.18);border-radius:14px;overflow:hidden;margin-bottom:12px">
        <summary style="padding:14px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-weight:600;list-style:none;-webkit-tap-highlight-color:transparent;min-height:44px">
          <span>🌐 Providers via proxy (serveur) <span id="ax-vault-proxy-count" style="color:var(--ax-text-muted);font-weight:400;font-size:13px"></span></span>
          <span class="ax-chevron" style="color:var(--ax-text-muted)">▼</span>
        </summary>
        <div style="padding:0 14px 14px">
          <p style="margin:0 0 10px;color:var(--ax-text-muted);font-size:12px">Clés stockées côté serveur (secrets GitHub → worker Cloudflare). Apex ne les détient jamais, il passe par le proxy.</p>
          <div id="ax-vault-proxy-list" style="display:flex;flex-wrap:wrap;gap:8px"></div>
        </div>
      </details>

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
        <h3 style="margin:0 0 8px;color:var(--ax-gold);font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700">📊 Diagnostic & restauration</h3>
        <p style="margin:0 0 10px;color:rgba(255,255,255,0.7);font-size:12px;line-height:1.5">Maintenance <strong>automatique au boot</strong> (v13.4.268+) : migration des clés, scan multi-sources et restauration Firebase se font tout seuls. Le diagnostic ci-dessous est juste pour vérifier l'état.</p>
        <div class="ax-gs-7">
          <button id="ax-vault-diag-btn" type="button"
            style="padding:10px 16px;background:rgba(106,138,255,0.18);color:var(--ax-blue);border:1px solid rgba(106,138,255,0.35);border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;min-height:44px">📊 Diagnostic complet</button>
        </div>
        <details style="margin-top:10px">
          <summary style="cursor:pointer;color:rgba(255,255,255,0.55);font-size:12px;padding:8px 0;min-height:36px;list-style:none">🔧 Dépannage avancé <span style="opacity:.7">(rarement utile — tout est auto)</span></summary>
          <div class="ax-gs-7" style="margin-top:8px">
            <button id="ax-vault-rescue-fb" data-action="rescue-firebase" type="button"
              style="padding:10px 16px;background:rgba(232,184,48,0.18);color:var(--ax-gold);border:1px solid rgba(232,184,48,0.40);border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;min-height:44px">🔓 Restaurer depuis Firebase</button>
            <button id="ax-vault-migrate-legacy-btn" type="button"
              style="padding:10px 16px;background:rgba(232,184,48,0.20);color:var(--ax-gold);border:1px solid rgba(232,184,48,0.45);border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;min-height:44px">🔁 Migrer mes clés legacy</button>
            <button id="ax-vault-repair-services-btn" type="button"
              style="padding:10px 16px;background:rgba(247,131,34,0.20);color:var(--ax-orange);border:1px solid rgba(247,131,34,0.45);border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;min-height:44px">♻️ Réparer services</button>
            <button id="ax-vault-push-all-btn" type="button"
              style="padding:10px 16px;background:linear-gradient(135deg,var(--ax-gold-deep),var(--ax-gold));color:#000;border:none;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;min-height:44px">📤 Push backup Firebase</button>
            <button id="ax-vault-rescue-all" data-action="rescue-scan-all" type="button"
              style="padding:10px 16px;background:rgba(106,138,255,0.15);color:var(--ax-blue);border:1px solid rgba(106,138,255,0.30);border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;min-height:44px">🔄 Scanner toutes sources</button>
          </div>
        </details>
        <div id="ax-vault-diag-result" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.85)"></div>
        <div id="ax-vault-rescue-result" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.85)"></div>
      </section>

      <p style="text-align:center;color:rgba(255,255,255,0.4);font-size:11px;margin-top:16px;padding:14px;background:rgba(255,255,255,0.02);border-radius:12px;line-height:1.6">
        🛡 <strong style="color:rgba(255,255,255,0.6)">Sécurité</strong> : AES-GCM 256 + PBKDF2 200k iterations · Audit log immutable<br>
        <span style="opacity:0.7">FB_LOCAL strict pour ax_pin/ax_user · jamais de plaintext en backup</span>
      </p>

      <button id="ax-vault-fab" class="ax-vault-fab" type="button" aria-label="Tester toutes les clés" title="Tester toutes les clés">🔄</button>
      <div id="ax-vault-modal-root"></div>
    </div>
  `),Z(e),Ae(e),Ce(e),Te(e),m.info("feature-vault",`rendered (${o.total} entries)`)}function Ce(e){const r=e.querySelector(".ax-vault-page"),t=e.querySelector("#ax-vault-fab");if(!r)return;let o=0,n=0;const l=()=>{n||(n=requestAnimationFrame(()=>{n=0;const b=window.scrollY||document.documentElement.scrollTop||0;b!==o&&(o=b,b>80?r.classList.add("ax-vault-scrolled"):r.classList.remove("ax-vault-scrolled"))}))};d?d.bind(window,"scroll",l,{passive:!0}):window.addEventListener("scroll",l,{passive:!0}),l(),t&&d&&d.bind(t,"click",()=>{u.tap(),e.querySelector("#ax-vault-test-all")?.click()})}async function Te(e){const r=e.querySelector("#ax-vault-proxy-list"),t=e.querySelector("#ax-vault-proxy-count");if(r)try{const{apexSecretsProxy:o}=await q(async()=>{const{apexSecretsProxy:b}=await import("./apex-secrets-proxy-client-p4gDnAew.js");return{apexSecretsProxy:b}},__vite__mapDeps([0,1,2,3]),import.meta.url),n=await o.checkHealth();if(!n.ok||!n.data){r.innerHTML='<span style="color:var(--ax-text-muted);font-size:13px">Proxy injoignable</span>';return}const l=n.data.available_providers;t&&(t.textContent=`(${l.length}/${n.data.total} actifs)`),r.innerHTML=l.map(b=>`<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 10px;background:rgba(34,204,119,0.12);color:var(--ax-green);border:1px solid rgba(34,204,119,0.25);border-radius:999px;font-size:12px">● ${g(b)}</span>`).join("")}catch(o){m.debug("feature-vault","renderProxyProviders failed",{err:o}),r.innerHTML='<span style="color:var(--ax-text-muted);font-size:13px">Proxy non configuré</span>'}}function Z(e){const r=e.querySelector("#ax-vault-categories");if(!r)return;if(ce().total===0&&!r.dataset.axInitialized){r.dataset.axInitialized="1";const l=document.createElement("div");l.className="ax-skel-vault-wrapper",r.appendChild(l);const b=ve(l,"vault-cards");setTimeout(()=>{b(),l.remove(),Z(e)},250)}const o=O.map(l=>{const b=he(l,H);if(b.length===0&&!me.has(l.id))return"";const h=H.trim().length>0;return`
      <details class="ax-cat" data-cat-id="${g(l.id)}" ${h?"open":""}
        style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;overflow:hidden">
        <summary style="padding:14px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-weight:600;list-style:none;-webkit-tap-highlight-color:transparent;min-height:44px">
          <span>${g(l.label)} <span style="color:var(--ax-text-muted);font-weight:400;font-size:13px">(${b.length})</span></span>
          <span class="ax-chevron" style="color:var(--ax-text-muted);transition:transform 200ms ease-out">▼</span>
        </summary>
        <div style="padding:0 14px 14px;display:grid;grid-template-columns:repeat(auto-fill, minmax(280px,1fr));gap:10px">
          ${b.map($=>we($)).join("")}
          ${b.length===0?`
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
    `}).join("");let n=r.querySelector(".ax-vault-cats-wrapper");n||(n=document.createElement("div"),n.className="ax-vault-cats-wrapper",r.appendChild(n)),n.innerHTML=o}let oe=0;function Ae(e){Date.now()-oe>12e4&&(oe=Date.now(),(async()=>{try{(await C.healthCheckAll()).tested>0&&A(e)}catch(a){m.debug("feature-vault","auto-test coffre skipped",{err:a})}})());const r=e.querySelector("#ax-vault-search");if(r){let a=null;d.bind(r,"input",()=>{a&&clearTimeout(a),a=setTimeout(()=>{H=r.value.trim(),Z(e),ne(e)},240)})}const t=e.querySelector("#ax-vault-add-manual");t&&d&&d.bind(t,"click",()=>{u.tap(),de(e)});const o=e.querySelector("#ax-vault-test-all");o&&d&&d.bind(o,"click",()=>{(async()=>{u.tap(),p.info("Test de toutes les clés en cours…");try{const a=await C.healthCheckAll();p.success(`✅ ${a.tested} testées · ${a.recovered} récupérées · ${a.stillDown} HS`),A(e)}catch(a){m.warn("feature-vault","testAll failed",{err:a}),p.error("Erreur pendant le test global")}})()});const n=e.querySelector("#ax-vault-rescue-fb");n&&d&&d.bind(n,"click",()=>{(async()=>{u.tap();const a=e.querySelector("#ax-vault-rescue-result");a&&(a.innerHTML="⏳ Lecture Firebase backup chiffré…");try{const{vaultFirebaseBackup:s}=await q(async()=>{const{vaultFirebaseBackup:c}=await import("./vault-firebase-backup-dbz7h9oB.js");return{vaultFirebaseBackup:c}},__vite__mapDeps([4,0,1,2,3]),import.meta.url),i=await s.restoreAllFromFirebaseBackup();if(a){a.textContent="";const c=document.createElement("div");c.style.cssText="padding:8px;background:rgba(34,204,119,.1);color:var(--ax-green);border-radius:8px",c.textContent=`🔓 ${i.restored} clés restaurées · ${i.failed} échouées · ${i.skipped} ignorées`,a.append(c)}i.restored>0?(p.success(`🔓 ${i.restored} clés restaurées depuis Firebase backup`),u.success(),setTimeout(()=>void D(e,()=>A(e)),600)):p.info("Aucune clé trouvée dans Firebase backup")}catch(s){m.warn("feature-vault","rescueFb failed",{err:s}),a&&(a.innerHTML=`<div class="ax-gs-48">⚠ ${g(String(s).slice(0,120))}</div>`),p.error("Erreur lecture Firebase backup"),u.error()}})()});const l=e.querySelector("#ax-vault-rescue-all");l&&d&&d.bind(l,"click",()=>{(async()=>{u.tap();const a=e.querySelector("#ax-vault-rescue-result");a&&(a.innerHTML="⏳ Scan 4 sources : alias, IDB, Firebase, pattern…");try{const{autoRestoreCredentials:s}=await q(async()=>{const{autoRestoreCredentials:c}=await import("./auto-restore-credentials-7R39T2Sj.js");return{autoRestoreCredentials:c}},__vite__mapDeps([0,1,2,3]),import.meta.url),i=await s.restoreAutomatically();if(a){a.textContent="";const c=document.createElement("div");c.style.cssText="padding:8px;background:rgba(34,204,119,.1);color:var(--ax-green);border-radius:8px",c.textContent=`🔓 ${i.restored} restaurées · ${i.failed} échouées`,a.append(c)}i.restored>0?(p.success(`🔓 ${i.restored} clés restaurées (4 sources)`),u.success(),setTimeout(()=>void D(e,()=>A(e)),600)):p.info("Aucune clé trouvable dans les 4 sources. Colle une clé manuellement ci-dessous.")}catch(s){m.warn("feature-vault","rescueAll failed",{err:s}),a&&(a.innerHTML=`<div class="ax-gs-48">⚠ ${g(String(s).slice(0,120))}</div>`),p.error("Erreur scan multi-sources"),u.error()}})()});const b=e.querySelector("#ax-vault-diag-btn");b&&d&&d.bind(b,"click",()=>{(async()=>{u.tap();const a=e.querySelector("#ax-vault-diag-result");a&&(a.textContent="⏳ Diagnostic en cours (local + Firebase + Cloudflare)…");try{const{vaultDiagnostic:s}=await q(async()=>{const{vaultDiagnostic:T}=await import("./vault-diagnostic-URZiS9md.js");return{vaultDiagnostic:T}},__vite__mapDeps([0,1,2,3]),import.meta.url),i=await s.run();if(!a)return;a.textContent="";const c=document.createElement("div");c.style.cssText="display:flex;flex-direction:column;gap:8px";const x=document.createElement("div");x.style.cssText="padding:10px;background:rgba(106,138,255,0.08);border:1px solid rgba(106,138,255,0.25);border-radius:8px;font-weight:600",x.textContent=i.summary,c.append(x);const f=document.createElement("div");f.style.cssText="padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;line-height:1.5";const v=document.createElement("div"),w=i.local.legacy_flat_orphans>0?` · ⚠ ${i.local.legacy_flat_orphans} hors coffre central`:"";if(v.textContent=`💾 Local : ${i.local.total} clé(s) — ${i.local.encrypted} chiffrées · ${i.local.multi_keys_count} dans coffre${w}`,f.append(v),i.local.sample.length){const T=document.createElement("div");T.style.cssText="opacity:0.6;font-family:monospace;font-size:11px;margin-top:4px",T.textContent="ex. "+i.local.sample.join(", "),f.append(T)}c.append(f);const k=document.createElement("div");k.style.cssText="padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;line-height:1.5";const S=document.createElement("div"),E=i.firebase.connected?"🟢":"🔴";if(S.textContent=`☁ Firebase ${E} ${i.firebase.state} — ${i.firebase.backup_count} backup(s)`,k.append(S),i.firebase.drift_detected){const T=document.createElement("div");T.style.cssText="opacity:0.85;color:var(--ax-gold);margin-top:4px",T.textContent=`⚠ Drift : ${i.firebase.in_local_not_fb.length} local-only, ${i.firebase.in_fb_not_local.length} Firebase-only`,k.append(T)}c.append(k);const L=document.createElement("div");L.style.cssText="padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;line-height:1.5";const z=document.createElement("div"),K=i.cloudflare_proxy.reachable?"🟢":"🔴";z.textContent=`🌐 Cloudflare proxy ${K} ${i.cloudflare_proxy.reachable?`OK (${i.cloudflare_proxy.latency_ms}ms, ${i.cloudflare_proxy.providers.length} providers)`:"KO ("+(i.cloudflare_proxy.error??"unreachable")+")"}`,L.append(z);const R=document.createElement("div");if(R.style.cssText="opacity:0.55;font-family:monospace;font-size:10px;margin-top:4px;word-break:break-all",R.textContent=i.cloudflare_proxy.url,L.append(R),c.append(L),i.recommendations.length){const T=document.createElement("div");T.style.cssText="padding:10px;background:rgba(232,184,48,0.08);border:1px solid rgba(232,184,48,0.25);border-radius:8px;font-size:12px;line-height:1.6";const U=document.createElement("div");U.style.cssText="font-weight:700;color:var(--ax-gold);margin-bottom:6px",U.textContent="💡 À faire :",T.append(U);for(const pe of i.recommendations){const N=document.createElement("div");N.style.cssText="padding:3px 0 3px 12px;position:relative";const G=document.createElement("span");G.style.cssText="position:absolute;left:0;top:3px",G.textContent="→",N.append(G),N.append(document.createTextNode(" "+pe)),T.append(N)}c.append(T)}a.append(c),u.success()}catch(s){if(m.warn("feature-vault","diag failed",{err:s}),a){a.textContent="";const i=document.createElement("div");i.style.cssText="padding:8px;background:rgba(255,91,91,0.1);color:#ff8b8b;border-radius:8px",i.textContent="⚠ Diagnostic échoué : "+String(s).slice(0,160),a.append(i)}p.error("Diagnostic impossible"),u.error()}})()});const h=e.querySelector("#ax-vault-migrate-legacy-btn");h&&d&&d.bind(h,"click",()=>{(async()=>{u.tap();const a=e.querySelector("#ax-vault-diag-result");a&&(a.textContent="⏳ Migration des clés legacy en cours…");try{const s=await C.migrateLegacyFlatKeys();if(!a)return;a.textContent="";const i=document.createElement("div"),c=s.failed===0&&s.migrated>0;i.style.cssText=`padding:10px;background:${c?"rgba(34,204,119,.1)":"rgba(232,184,48,.08)"};color:${c?"var(--ax-green)":"var(--ax-gold)"};border:1px solid ${c?"rgba(34,204,119,0.25)":"rgba(232,184,48,0.25)"};border-radius:8px;font-size:12px;line-height:1.5`;const x=document.createElement("div");if(x.style.cssText="font-weight:700;margin-bottom:4px",x.textContent=`🔁 ${s.scanned} clé(s) legacy scannées : ${s.migrated} migrées · ${s.failed} échec(s) · ${s.skipped} ignorées`,i.append(x),s.failed>0){const f=document.createElement("div");f.style.cssText="opacity:0.85;color:#ff8b8b;margin-top:4px";const v=s.details.filter(k=>k.status==="failed").map(k=>k.key.replace(/^(ax_|apex_v13_)/,"").replace(/_(key|token|secret)$/,"")),w=v.slice(0,5).join(", ");f.textContent=`${s.failed} clé(s) illisibles (passphrase historique perdue, erreur #55) : ${w}${s.failed>5?`… +${s.failed-5}`:""}.`,i.append(f),(async()=>{try{const S=await(await q(()=>import("./apex-secrets-proxy-client-p4gDnAew.js"),__vite__mapDeps([0,1,2,3]),import.meta.url)).apexSecretsProxy.checkHealth();if(S.ok&&S.data?.available_providers?.length){const E=new Set(S.data.available_providers),L=v.filter(z=>E.has(z.toLowerCase()));if(L.length>0){const z=document.createElement("div");z.style.cssText="margin-top:8px;padding:8px;background:rgba(34,204,119,.08);color:var(--ax-green);border:1px solid rgba(34,204,119,0.20);border-radius:6px;line-height:1.5";const K=document.createElement("div");K.style.cssText="font-weight:700;margin-bottom:2px",K.textContent=`✅ ${L.length} dispo via worker proxy (GitHub Secrets)`,z.append(K);const R=document.createElement("div");R.style.cssText="font-size:11px;opacity:0.9",R.textContent=`${L.slice(0,8).join(", ")}${L.length>8?"…":""} — l'IA Apex les utilise via le worker proxy sans avoir besoin de la clé en local. Pour les voir dans l'UI Coffre, recolle-les via « Auto-détection rapide ».`,z.append(R),i.append(z)}}}catch(k){m.debug("feature-vault","proxy availability check failed",{err:k})}})()}if(s.skipped>0){const f=document.createElement("div");f.style.cssText="opacity:0.7;margin-top:4px";const v=s.details.filter(w=>w.status==="skipped").slice(0,5).map(w=>w.key.replace(/^(ax_|apex_v13_)/,"").replace(/_(key|token|secret)$/,""));f.textContent=`Ignorées (déjà dans coffre ou service inconnu) : ${v.join(", ")}${s.skipped>5?"…":""}.`,i.append(f)}a.append(i),s.migrated>0?(p.success(`🔁 ${s.migrated} clés legacy migrées vers le coffre central`),u.success(),setTimeout(()=>void D(e,()=>A(e)),600)):s.failed>0?(p.error(`${s.failed} échec(s) decrypt — passphrase perdue`),u.error()):p.info("Rien à migrer (tout déjà à jour ou clés legacy absentes)")}catch(s){if(m.warn("feature-vault","migrateLegacyFlatKeys failed",{err:s}),a){a.textContent="";const i=document.createElement("div");i.style.cssText="padding:8px;background:rgba(255,91,91,0.1);color:#ff8b8b;border-radius:8px",i.textContent="⚠ Migration échouée : "+String(s).slice(0,160),a.append(i)}p.error("Migration impossible"),u.error()}})()});const $=e.querySelector("#ax-vault-repair-services-btn");$&&d&&d.bind($,"click",()=>{(async()=>{u.tap();const a=e.querySelector("#ax-vault-diag-result");a&&(a.textContent="⏳ Réparation des services mal nommés…");try{const s=await C.repairMisnamedServices();if(!a)return;a.textContent="";const i=document.createElement("div"),c=s.renamed>0||s.deleted_duplicate>0;i.style.cssText=`padding:10px;background:${c?"rgba(34,204,119,.1)":"rgba(255,255,255,0.03)"};color:${c?"var(--ax-green)":"rgba(255,255,255,0.85)"};border:1px solid ${c?"rgba(34,204,119,0.25)":"rgba(255,255,255,0.1)"};border-radius:8px;font-size:12px;line-height:1.5`;const x=document.createElement("div");if(x.style.cssText="font-weight:700;margin-bottom:4px",x.textContent=`♻️ ${s.scanned} entrée(s) scannées : ${s.renamed} renommée(s) · ${s.deleted_duplicate} duplicate(s) marqué(s) invalides · ${s.skipped} déjà canoniques`,i.append(x),s.renamed>0){const f=document.createElement("div");f.style.cssText="opacity:0.85;margin-top:4px";const v=s.details.filter(w=>w.status==="renamed").slice(0,6).map(w=>`${w.from} → ${w.to}`).join(", ");f.textContent=`Renommés : ${v}${s.renamed>6?"…":""}. Liens dashboard + endpoints test devraient maintenant matcher.`,i.append(f)}a.append(i),s.renamed>0?(p.success(`♻️ ${s.renamed} services renommés en canonique`),u.success(),setTimeout(()=>void D(e,()=>A(e)),600)):p.info("Rien à réparer (services déjà canoniques)")}catch(s){if(m.warn("feature-vault","repairMisnamedServices failed",{err:s}),a){a.textContent="";const i=document.createElement("div");i.style.cssText="padding:8px;background:rgba(255,91,91,0.1);color:#ff8b8b;border-radius:8px",i.textContent="⚠ Réparation échouée : "+String(s).slice(0,160),a.append(i)}p.error("Réparation impossible"),u.error()}})()});const y=e.querySelector("#ax-vault-push-all-btn");y&&d&&d.bind(y,"click",()=>{(async()=>{u.tap();const a=e.querySelector("#ax-vault-diag-result");a&&(a.textContent="⏳ Push de toutes les clés chiffrées vers Firebase backup…");try{const{vaultFirebaseBackup:s}=await q(async()=>{const{vaultFirebaseBackup:f}=await import("./vault-firebase-backup-dbz7h9oB.js");return{vaultFirebaseBackup:f}},__vite__mapDeps([4,0,1,2,3]),import.meta.url),i=await s.pushAllLocal();if(!a)return;a.textContent="";const c=document.createElement("div");c.style.cssText="padding:10px;background:rgba(34,204,119,.1);color:var(--ax-green);border:1px solid rgba(34,204,119,0.25);border-radius:8px;font-size:12px;line-height:1.5";const x=document.createElement("div");if(x.style.cssText="font-weight:700;margin-bottom:4px",x.textContent=`📤 ${i.pushed} clé(s) backupées · ${i.failed} échec(s) · ${i.skipped} ignorées`,c.append(x),i.failed>0){const f=document.createElement("div");f.style.cssText="opacity:0.85;color:var(--ax-gold)",f.textContent="Échecs probables : Firebase hors-ligne (RECONNECTING). Relance ce push quand le diag affiche Firebase 🟢 CONNECTED.",c.append(f)}else if(i.pushed===0&&i.skipped>0){const f=document.createElement("div");f.style.cssText="opacity:0.85",f.textContent=`${i.skipped} clé(s) déjà backupées récemment (throttle 5 min) — rien à faire.`,c.append(f)}a.append(c),i.pushed>0?(p.success(`📤 ${i.pushed} clés backupées vers Firebase`),u.success()):i.failed>0?(p.error(`${i.failed} échec(s) — Firebase hors-ligne ?`),u.error()):p.info("Rien à push (tout est déjà à jour ou throttle)")}catch(s){if(m.warn("feature-vault","pushAll failed",{err:s}),a){a.textContent="";const i=document.createElement("div");i.style.cssText="padding:8px;background:rgba(255,91,91,0.1);color:#ff8b8b;border-radius:8px",i.textContent="⚠ Push échoué : "+String(s).slice(0,160),a.append(i)}p.error("Push impossible"),u.error()}})()});const _=e.querySelector("#ax-vault-cleanup-invalid");_&&d&&d.bind(_,"click",()=>{(async()=>{u.tap();const a=e.querySelector("#ax-vault-rescue-result");if(confirm(`Supprimer définitivement toutes les clés illisibles (decrypt fail) ?

Ces clés sont chiffrées avec une passphrase perdue. Tu devras les recoller pour les retrouver.`)){a&&(a.innerHTML="⏳ Suppression des entrées illisibles…");try{const i=V().filter(x=>x.status==="invalid");let c=0;for(const x of i)try{if(x.id.startsWith("mkv_")||x.id.includes("_")){C.removeKey(x.id),c++;continue}const f=x.id.startsWith("ax_")||x.id.startsWith("apex_v13_")?x.id:`ax_${x.service}_key`;localStorage.removeItem(f);const v=indexedDB.open("apex_v13_vault_shadow",1);v.onsuccess=()=>{try{v.result.transaction("keys","readwrite").objectStore("keys").delete(f),v.result.close()}catch{}},c++}catch{}if(a){a.textContent="";const x=document.createElement("div");x.style.cssText="padding:8px;background:rgba(34,204,119,.1);color:var(--ax-green);border-radius:8px",x.textContent=`🗑 ${c} clé(s) illisibles supprimées. Recolle tes clés via "Détecter & stocker" ci-dessous.`,a.append(x)}p.success(`🗑 ${c} clés illisibles supprimées`),u.success(),setTimeout(()=>void D(e,()=>A(e)),800)}catch(s){m.warn("feature-vault","cleanupInvalid failed",{err:s}),p.error("Erreur suppression"),u.error()}}})()});const I=e.querySelector("#ax-vault-paste-clipboard-btn");I&&d&&d.bind(I,"click",()=>{(async()=>{u.tap();const a=e.querySelector("#ax-vault-paste"),s=e.querySelector("#ax-vault-paste-result");if(a)try{if(!navigator.clipboard?.readText)throw new Error("Clipboard API non supportée");const i=await navigator.clipboard.readText();if(!i){s&&(s.innerHTML='<div class="ax-gs-174">⚠ Presse-papier vide</div>');return}a.value=i,a.dispatchEvent(new Event("input",{bubbles:!0})),u.success(),p.success(`📋 ${i.length} caractères collés — clique "Détecter & stocker"`),s&&(s.innerHTML='<div style="padding:8px;background:rgba(106,138,255,.1);color:var(--ax-blue);border-radius:8px">📋 Collé — clique "Détecter & stocker" pour analyser</div>'),a.focus()}catch(i){const c=i instanceof Error?i.message:"unknown";p.error(`Clipboard refusé : ${c}. Utilise long-press → Coller manuellement.`),s&&(s.innerHTML='<div class="ax-gs-48">⚠ Permission refusée. Long-press dans le champ → Coller.</div>')}})()});const B=e.querySelector("#ax-vault-paste-btn");B&&d&&d.bind(B,"click",()=>{(async()=>{u.tap();const a=e.querySelector("#ax-vault-paste"),s=e.querySelector("#ax-vault-paste-result");if(!a||!s)return;const i=a.value.trim();if(!i){s.innerHTML=`<div class="ax-gs-174">⚠ Colle quelque chose d'abord</div>`;return}const c=await ke(i);if(c.ok){u.success();const x=Y(i);if(x){const k=x.storageKey.replace(/^(ax_|apex_v13_)/,"").replace(/_(?:key|token|pat|sk|pk|id|secret)$/,"");try{await C.addKey(k,i)}catch{}}const{firebase:f}=await q(async()=>{const{firebase:k}=await import("./multi-source-analyze-DrPaQ0LG.js").then(S=>S.d);return{firebase:k}},__vite__mapDeps([1,0,3,2]),import.meta.url),v=f.getConnectionState(),w=v==="CONNECTED"?"🟢 poussé":v==="RECONNECTING"?"🟡 en queue (push auto à la reconnexion)":"⚪ "+v;p.success(`✅ ${c.pattern_name} stocké · 🔐 AES-GCM-256 · 💾 local OK · ☁ ${w}`,{duration:6e3}),s.innerHTML=`<div style="padding:10px;background:rgba(34,204,119,.1);color:var(--ax-green);border-radius:8px;line-height:1.55">
          <div style="font-weight:700">✅ ${g(c.pattern_name)} → ${g(c.storage_key)}</div>
          <div style="font-size:11px;opacity:0.85;margin-top:4px">🔐 Chiffré AES-GCM-256 + PBKDF2 200k · 💾 localStorage + IDB shadow · ☁ Firebase backup ${w}</div>
        </div>`,a.value="",A(e)}else u.error(),p.error(c.reason),s.innerHTML=`<div class="ax-gs-48">⚠ ${g(c.reason)}</div>`})()});const M=e.querySelector("#ax-vault-import");M&&d&&d.bind(M,"click",()=>{(async()=>{u.tap();try{const{apexVaultImport:a}=await q(async()=>{const{apexVaultImport:i}=await import("./apex-vault-import-C5cHjKJE.js");return{apexVaultImport:i}},__vite__mapDeps([0,1,2,3]),import.meta.url),s=await a.promptAndImport();if(s.cancelled){p.info("Import annulé",{duration:2e3});return}s.ok&&s.restored>0?(p.success(`🔓 ${s.restored} clés restaurées depuis JSON Drive${s.failed>0?` · ${s.failed} échouées`:""}`,{duration:8e3}),setTimeout(()=>location.reload(),1500)):s.decrypt_failed>0?p.error(`🔒 ${s.decrypt_failed} clés non déchiffrables. PIN admin différent ? Vérifie ton PIN actuel.`,{duration:1e4}):s.error?p.error(`Import échoué : ${s.error.slice(0,80)}`,{duration:8e3}):p.warn("Aucune clé restaurée depuis ce JSON",{duration:5e3})}catch(a){const s=a instanceof Error?a.message:String(a);p.error(`Import erreur : ${s.slice(0,80)}`,{duration:8e3})}})()});const j=e.querySelector("#ax-vault-export");j&&d&&d.bind(j,"click",()=>{u.tap();const a=re(W()),s=new Blob([a],{type:"application/json"}),i=URL.createObjectURL(s),c=document.createElement("a");c.href=i,c.download=`apex-vault-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(c),c.click(),document.body.removeChild(c),URL.revokeObjectURL(i),p.success("Coffre exporté (chiffré)")});const F=e.querySelector("#ax-vault-qr-backup");F&&d&&d.bind(F,"click",()=>{(async()=>{u.tap();try{const a=re(W()),s=(a.length/1024).toFixed(1),i=W().length,c=2500;let x="";try{x=(await q(()=>import("https://cdn.jsdelivr.net/npm/lz-string@1.5.0/+esm"),[],import.meta.url)).compressToEncodedURIComponent(a);const S=(x.length/1024).toFixed(1);m.info("vault-qr-backup",`LZ compress ${s}KB → ${S}KB (${Math.round((1-x.length/a.length)*100)}% gain)`)}catch(k){m.warn("vault-qr-backup","LZ-string load failed",{err:k})}if(x&&x.length<c){const{apexQrBackup:k}=await q(async()=>{const{apexQrBackup:S}=await import("./apex-qr-backup-DNondd_p.js");return{apexQrBackup:S}},__vite__mapDeps([0,1,2,3]),import.meta.url);await k.showQrBackupModal({text:`APEXVAULT_LZ:${x}`,title:"📦 Backup Vault Compressé — Photos iCloud",description:`${i} clés compressées LZ (${(x.length/1024).toFixed(1)}KB vs ${s}KB orig). JSON chiffré AES-GCM-256. Sauvegarde dans Photos iCloud — au reinstall, scan = restore complet.`,filename:`apex-vault-backup-${new Date().toISOString().slice(0,10)}.png`});return}p.info(`Vault compressé ${x.length}B encore > QR max. Upload Gist privé chiffré...`,{duration:4e3});try{const{apexGithubGistBackup:k}=await q(async()=>{const{apexGithubGistBackup:E}=await import("./apex-github-gist-backup-C02Y3M0A.js");return{apexGithubGistBackup:E}},__vite__mapDeps([0,1,2,3,5]),import.meta.url),S=await k.pushBackup({force:!0});if(S.ok&&S.gist_id){const E=`https://gist.github.com/${S.gist_id}`,{apexQrBackup:L}=await q(async()=>{const{apexQrBackup:z}=await import("./apex-qr-backup-DNondd_p.js");return{apexQrBackup:z}},__vite__mapDeps([0,1,2,3]),import.meta.url);await L.showQrBackupModal({text:`APEXVAULT_GIST:${S.gist_id}`,title:"📦 Backup Vault → Gist URL — Photos iCloud",description:`${i} clés uploadées Gist privé chiffré (${(S.bytes??0)/1024}KB). QR contient juste l'ID Gist. Au reinstall, scan + PAT GitHub = pull Gist + restore complet. URL : ${E}`,filename:`apex-vault-gist-${new Date().toISOString().slice(0,10)}.png`});return}p.warn(`Gist upload échoué : ${S.error??"?"}. Fallback download JSON.`,{duration:6e3})}catch(k){m.warn("vault-qr-backup","gist push failed",{err:k})}const f=new Blob([a],{type:"application/json"}),v=URL.createObjectURL(f),w=document.createElement("a");w.href=v,w.download=`apex-vault-backup-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(w),w.click(),document.body.removeChild(w),URL.revokeObjectURL(v),p.success(`📥 Backup JSON téléchargé (${s}KB chiffré). Sauvegarde dans iCloud Drive / Notes.`,{duration:8e3})}catch(a){const s=a instanceof Error?a.message:String(a);p.error(`Backup QR échoué : ${s.slice(0,60)}`,{duration:6e3})}})()}),ne(e)}function ne(e){e.querySelectorAll('[data-action="test"]').forEach(r=>{d.bind(r,"click",t=>{t.stopPropagation();const o=r.dataset.credId??"";qe(e,o,r)})}),e.querySelectorAll('[data-action="recharge"]').forEach(r=>{d.bind(r,"click",t=>{t.stopPropagation();const o=r.dataset.rechargeUrl??"",n=r.dataset.service??"";Le(o,n)})}),e.querySelectorAll('[data-action="discover-links"]').forEach(r=>{d.bind(r,"click",t=>{t.stopPropagation();const o=r.dataset.service??"";ze(e,o,r)})}),e.querySelectorAll('[data-action="edit"]').forEach(r=>{d.bind(r,"click",t=>{t.stopPropagation();const o=r.dataset.credId??"";Me(e,o)})}),e.querySelectorAll('[data-action="delete"]').forEach(r=>{d.bind(r,"click",t=>{t.stopPropagation();const o=r.dataset.credId??"";Ie(e,o)})}),e.querySelectorAll('[data-action="add-to-cat"]').forEach(r=>{d.bind(r,"click",t=>{t.stopPropagation();const o=r.dataset.catId??"";de(e,o)})})}async function qe(e,r,t){if(!r)return;u.tap();const o=t.textContent;t.textContent="⏳ Test…",t.setAttribute("disabled","true");try{const n=await C.testKey(r);n.ok?(u.success(),p.success(`✅ Active (${n.latencyMs}ms)`)):(u.error(),p.error(`❌ ${n.reason??"Test échoué"}`)),await D(e,()=>A(e))}catch(n){m.warn("feature-vault","testKey failed",{err:n}),u.error(),p.error("Erreur pendant le test"),t.textContent=o,t.removeAttribute("disabled")}}function Le(e,r){if(u.tap(),!e){p.warn(`Aucune page recharge connue pour ${r}`);return}try{window.open(e,"_blank","noopener,noreferrer")}catch(t){m.warn("feature-vault","recharge open failed",{err:t}),p.error("Impossible d'ouvrir le lien")}}async function ze(e,r,t){if(!r)return;u.tap();const o=t.textContent;t.textContent="⏳ Recherche…",t.setAttribute("disabled","true");try{const n=await fe.discover(r,{force:!0}),l=[];n.login&&l.push("login"),n.dashboard&&l.push("dashboard"),n.billing&&l.push("billing"),n.api_keys&&l.push("api_keys"),n.usage&&l.push("usage"),n.docs&&l.push("docs"),n.password_reset&&l.push("reset_pw"),n.account_settings&&l.push("settings"),n.support&&l.push("support"),n.status_page&&l.push("status"),n.alive&&l.length>0?(u.success(),p.success(`🔗 ${l.length} liens trouvés (${n.source}) : ${l.join(", ")}`)):(u.error(),p.warn(`Aucun lien validé pour ${r} — réessaie plus tard`)),A(e)}catch(n){m.warn("feature-vault","discoverLinks failed",{err:n}),u.error(),p.error("Erreur pendant la recherche de liens")}finally{t.textContent=o,t.removeAttribute("disabled")}}function Ie(e,r){if(r&&(u.tap(),!!window.confirm("Supprimer cette clé définitivement ? Elle sera retirée du Coffre + ne sera plus restaurée auto.")))try{C.removeKey(r),u.success(),p.success("Clé supprimée définitivement ✓"),A(e)}catch(t){m.warn("feature-vault","delete failed",{err:t}),u.error(),p.error("Suppression échouée")}}function ee(e){let r=e.querySelector("#ax-vault-modal-root");return r||(r=document.createElement("div"),r.id="ax-vault-modal-root",e.appendChild(r)),r}function P(e){const r=ee(e);r.innerHTML=""}function de(e,r){const t=ee(e),o=O.map(a=>`<option value="${g(a.id)}" ${r===a.id?"selected":""}>${g(a.label)}</option>`).join(""),n=r?Q.has(r):!1;t.innerHTML=`
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
            ${o}
          </select>
        </label>
        <label class="ax-gs-477">
          Type
          <select id="ax-vault-add-kind" style="width:100%;margin-top:4px;padding:10px;background:rgba(255,255,255,0.04);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:8px;font-size:14px;min-height:44px">
            <option value="secret" ${n?"":"selected"}>🔑 Clé / token (testable)</option>
            <option value="info" ${n?"selected":""}>📝 Info / note (nom, email, adresse…)</option>
          </select>
        </label>
        <label class="ax-gs-477">
          <span id="ax-vault-add-service-lbl">Service (ex: anthropic, openai, stripe)</span>
          <input type="text" id="ax-vault-add-service" aria-label="Nom du service" placeholder="anthropic"
            class="ax-gs-478">
        </label>
        <label class="ax-gs-477">
          Description — à quoi ça correspond (optionnel)
          <input type="text" id="ax-vault-add-label" aria-label="Description, à quoi correspond cette information" placeholder="ex : Appartement Nice, Email perso, Token prod…"
            class="ax-gs-478">
        </label>
        <label class="ax-gs-477">
          Alias (optionnel)
          <input type="text" id="ax-vault-add-alias" aria-label="Alias optionnel pour ce service" placeholder="perso, client X..."
            class="ax-gs-478">
        </label>
        <label class="ax-gs-477">
          <span id="ax-vault-add-value-lbl">Valeur (clé / token)</span>
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
  `,(()=>{const a=t.querySelector("#ax-vault-modal-close");a&&d&&d.bind(a,"click",()=>P(e))})();const l=t.querySelector('[role="dialog"]');l&&d&&d.bind(l,"click",a=>{a.target===l&&P(e)});const b=t.querySelector("#ax-vault-add-cat"),h=t.querySelector("#ax-vault-add-kind"),$=t.querySelector("#ax-vault-add-service-lbl"),y=t.querySelector("#ax-vault-add-value-lbl"),_=t.querySelector("#ax-vault-add-service"),I=t.querySelector("#ax-vault-add-value"),B=t.querySelector("#ax-vault-add-detect"),M=()=>{const a=h?.value==="info";$&&($.textContent=a?"Nom de l'info (ex : Adresse Nice, Email perso)":"Service (ex: anthropic, openai, stripe)"),y&&(y.textContent=a?"Valeur / information":"Valeur (clé / token)"),_&&(_.placeholder=a?"Adresse Nice":"anthropic"),I&&(I.placeholder=a?"Colle l'information ici (chiffrée)":"Colle la clé ici"),B&&(B.style.display=a?"none":"")};M(),h&&d&&d.bind(h,"change",M),b&&d&&d.bind(b,"change",()=>{h&&Q.has(b.value)&&(h.value="info",M())});const j=t.querySelector("#ax-vault-add-detect");j&&d&&d.bind(j,"click",()=>{(async()=>{u.tap();const a=t.querySelector("#ax-vault-add-value");if(!a)return;const s=Y(a.value.trim());if(!s){p.warn("Aucun pattern reconnu");return}if(s.category==="forbidden"){p.error("🚨 Type interdit");return}const i=t.querySelector("#ax-vault-add-service"),c=t.querySelector("#ax-vault-add-cat");if(i){const x=s.storageKey.replace(/^(ax_|apex_v13_)/,"").replace(/_(?:key|token|pat|sk|pk|id|secret)$/,"");i.value=x}c&&(c.value=X(i?.value??"",s.category)),p.success(`Détecté: ${s.name}`)})()});const F=t.querySelector("#ax-vault-add-save");F&&d&&d.bind(F,"click",()=>{(async()=>{u.tap();const a=t.querySelector("#ax-vault-add-service")?.value.trim()??"",s=t.querySelector("#ax-vault-add-alias")?.value.trim()??"",i=t.querySelector("#ax-vault-add-value")?.value.trim()??"",c=t.querySelector("#ax-vault-add-cat")?.value.trim()??"",x=t.querySelector("#ax-vault-add-label")?.value.trim()??"",f=t.querySelector("#ax-vault-add-kind")?.value==="info"?"info":"secret";if(!a||!i){p.warn(f==="info"?"Nom et information requis":"Service et valeur requis");return}try{const v={kind:f};s&&(v.alias=s),c&&(v.category=c),x&&(v.label=x),await C.addKey(a,i,v),p.success(f==="info"?`✅ ${a} enregistré (chiffré)`:`✅ Clé ${a} chiffrée + sauvegardée`),P(e),A(e)}catch(v){m.warn("feature-vault","add manual failed",{err:v}),p.error("Erreur pendant la sauvegarde")}})()})}function Me(e,r){const t=ee(e),o=C.listAll(!0).find(l=>l.id===r);if(!o){p.error("Clé introuvable");return}t.innerHTML=`
    <div role="dialog" aria-modal="true" aria-label="Modifier une clé"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">
      <div style="background:var(--ax-bg-flat);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;max-width:440px;width:100%">
        <div class="ax-gs-175">
          <h2 class="ax-gs-475">✏️ Modifier ${g(o.service)}</h2>
          <button id="ax-vault-modal-close" aria-label="Fermer"
            class="ax-gs-476">×</button>
        </div>
        <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0 0 12px">Laisse la valeur vide pour ne changer que la catégorie / la description. Une nouvelle valeur remplacera l'ancienne (chiffrement AES-GCM 256).</p>
        <label class="ax-gs-477">
          Catégorie
          <select id="ax-vault-edit-cat" style="width:100%;margin-top:4px;padding:10px;background:rgba(255,255,255,0.04);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:8px;font-size:14px;min-height:44px">
            ${O.map(l=>`<option value="${g(l.id)}" ${(o.category??X(o.service))===l.id?"selected":""}>${g(l.label)}</option>`).join("")}
          </select>
        </label>
        <label class="ax-gs-477">
          Description — à quoi ça correspond (optionnel)
          <input type="text" id="ax-vault-edit-label" aria-label="Description" value="${g(o.label??"")}" placeholder="ex : Appartement Nice, Email perso…"
            class="ax-gs-478">
        </label>
        <label class="ax-gs-477">
          Nouvelle valeur (optionnel)
          <textarea id="ax-vault-edit-value" placeholder="Vide = on garde la valeur actuelle"
            class="ax-gs-479"></textarea>
        </label>
        <label class="ax-gs-477">
          Alias (optionnel)
          <input type="text" id="ax-vault-edit-alias" aria-label="Alias optionnel" value="${g(o.alias??"")}"
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
  `,(()=>{const l=t.querySelector("#ax-vault-modal-close");l&&d&&d.bind(l,"click",()=>P(e))})(),(()=>{const l=t.querySelector("#ax-vault-edit-cancel");l&&d&&d.bind(l,"click",()=>P(e))})();const n=t.querySelector("#ax-vault-edit-save");n&&d&&d.bind(n,"click",()=>{(async()=>{u.tap();const l=t.querySelector("#ax-vault-edit-value")?.value.trim()??"",b=t.querySelector("#ax-vault-edit-alias")?.value.trim()??"",h=t.querySelector("#ax-vault-edit-cat")?.value.trim()??"",$=t.querySelector("#ax-vault-edit-label")?.value.trim()??"",y=Q.has(h)?"info":o.kind??"secret";try{if(l){C.markInvalid(r,"replaced via edit");const _={kind:y};b&&(_.alias=b),h&&(_.category=h),$&&(_.label=$),await C.addKey(o.service,l,_),p.success("✅ Mis à jour")}else C.setMeta(r,{category:h,label:$,alias:b,kind:y}),p.success("✅ Catégorie / description mises à jour");P(e),A(e)}catch(_){m.warn("feature-vault","edit save failed",{err:_}),p.error("Erreur pendant la modification")}})()})}export{O as CATEGORIES,ke as autoDetectAndStore,V as buildCredentialDisplays,X as classifyService,ce as computeStats,tt as dispose,g as escapeHtml,re as exportVaultJson,at as filterVaultEntries,ie as formatRelativeTime,he as getCredentialsForCategory,W as listVaultEntries,rt as removeCredential,A as render,we as renderCredentialCard};
