const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-gEqAF3FY.js","./monitoring-3uBGKGRH.js","./credential-patterns-CLzI061R.js"])))=>i.map(i=>d[i]);
import{_ as d}from"./apex-kb-gEqAF3FY.js";import{A as c}from"../core/main-C-tcu2QB.js";import{l as a}from"./monitoring-3uBGKGRH.js";import{s as u}from"./style-injector-C0qr4r8-.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-BVUQGHG0.js";const s="apex-force-update-banner",f="apex-force-update-banner",x="./index.html",v=60*1e3,h="apex_v13_last_version_check_ts",l="apex_v13_force_update_in_progress",m=3e4;class g{installed=!1;intervalHandle=null;visibilityListener=null;install(){this.installed||typeof document>"u"||(this.installed=!0,setTimeout(()=>void this.checkAndMaybeShow(),1e3),this.intervalHandle=setInterval(()=>void this.checkAndMaybeShow(),v),typeof document<"u"&&typeof window<"u"&&(this.visibilityListener=()=>{if(document.visibilityState!=="visible")return;const e=parseInt(localStorage.getItem("apex_v13_last_visibility_update_check")??"0",10);if(!(Date.now()-e<60*1e3)){try{localStorage.setItem("apex_v13_last_visibility_update_check",String(Date.now()))}catch{}this.checkAndMaybeShow()}},document.addEventListener("visibilitychange",this.visibilityListener),window.addEventListener("focus",this.visibilityListener)),a.info("force-update","banner installed (sole owner force-update flow v13.4.39)"))}isUpdateInProgress(){try{const e=parseInt(sessionStorage.getItem(l)??"0",10);return e?Date.now()-e>m?(sessionStorage.removeItem(l),!1):!0:!1}catch{return!1}}markUpdateInProgress(){try{sessionStorage.setItem(l,String(Date.now()))}catch{}}uninstall(){this.intervalHandle&&clearInterval(this.intervalHandle),this.intervalHandle=null,this.visibilityListener&&(typeof document<"u"&&document.removeEventListener("visibilitychange",this.visibilityListener),typeof window<"u"&&window.removeEventListener("focus",this.visibilityListener)),this.visibilityListener=null,this.removeBanner(),this.installed=!1}async checkVersion(){try{const e=await fetch(`${x}?_v=${Date.now()}`,{cache:"no-store",headers:{"Cache-Control":"no-cache"}});if(!e.ok)return a.warn("force-update",`version check fetch failed: ${e.status}`),{remote_ver:null,local_ver:c,is_stale:!1};const r=(await e.text()).match(/data-app-ver="([^"]+)"/)?.[1]??null,i=r!==null&&r!==c;try{localStorage.setItem(h,String(Date.now()))}catch{}return{remote_ver:r,local_ver:c,is_stale:i}}catch(e){return a.warn("force-update","version check failed",{err:e}),{remote_ver:null,local_ver:c,is_stale:!1}}}async checkAndMaybeShow(){if(this.isUpdateInProgress()){a.debug("force-update","check skipped — update already in progress");return}const e=await this.checkVersion();if(e.is_stale&&e.remote_ver){const t=parseInt(localStorage.getItem("apex_v13_auto_maj_last")??"0",10),n=Date.now()-t>30*1e3,r=document.visibilityState==="hidden"||this.isUserIdle(),i=!this.hasActiveFetch()&&!this.hasUserTyping();if(n&&r&&i){a.info("force-update",`AUTO-MAJ silencieuse (${e.local_ver} → ${e.remote_ver})`),localStorage.setItem("apex_v13_auto_maj_last",String(Date.now()));try{const{toast:o}=await d(async()=>{const{toast:_}=await import("./toast-ClsF1KRZ.js");return{toast:_}},[],import.meta.url);o.info(`🔄 Mise à jour ${e.remote_ver} en cours…`)}catch{}await this.forceUpdate()}else this.showBanner(e.remote_ver)}else this.removeBanner()}hasUserTyping(){const e=document.activeElement;if(!e)return!1;const t=e.tagName?.toLowerCase();return t==="textarea"||t==="input"||e.getAttribute("contenteditable")==="true"}hasActiveFetch(){try{return window.__apexActiveStream===!0}catch{return!1}}isUserIdle(){try{const e=parseInt(localStorage.getItem("apex_v13_last_interaction")??"0",10);return e?Date.now()-e>3e4:!0}catch{return!0}}showBanner(e){if(document.getElementById(s))return;this.injectStyle();const t=document.createElement("div");t.id=s,t.setAttribute("role","alert"),t.setAttribute("aria-live","assertive"),t.innerHTML=`
      <div class="apex-fu-content">
        <div class="apex-fu-icon">🔄</div>
        <div class="apex-fu-text">
          <strong>Nouvelle version Apex disponible</strong>
          <span class="apex-fu-versions">Local: ${c} → Remote: ${e}</span>
        </div>
        <button class="apex-fu-btn" id="${s}-btn" type="button">
          🔄 Forcer mise à jour
        </button>
      </div>
    `,document.body.appendChild(t),document.getElementById(`${s}-btn`)?.addEventListener("click",()=>{this.forceUpdate()}),a.info("force-update",`banner shown (local=${c}, remote=${e})`)}removeBanner(){const e=document.getElementById(s);e&&e.remove()}injectStyle(){if(u.has(f))return;const e=`
      #${s} {
        position: fixed;
        top: max(env(safe-area-inset-top, 8px), 8px);
        left: max(env(safe-area-inset-left, 8px), 8px);
        right: max(env(safe-area-inset-right, 8px), 8px);
        z-index: 999998;
        background: linear-gradient(135deg, #d32f2f, #b71c1c);
        color: #fff;
        border-radius: 12px;
        padding: 10px 12px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        animation: apex-fu-slide 280ms cubic-bezier(0.16, 1, 0.3, 1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      }
      @keyframes apex-fu-slide {
        from { opacity: 0; transform: translateY(-12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .apex-fu-content {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .apex-fu-icon {
        font-size: 20px;
        animation: apex-fu-spin 1.6s linear infinite;
      }
      @keyframes apex-fu-spin {
        from { transform: rotate(0); }
        to   { transform: rotate(360deg); }
      }
      .apex-fu-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .apex-fu-text strong {
        font-size: 13px;
        font-weight: 700;
      }
      .apex-fu-versions {
        font-size: 11px;
        opacity: 0.85;
        font-family: ui-monospace, 'SF Mono', monospace;
      }
      .apex-fu-btn {
        background: #fff;
        color: #b71c1c;
        border: none;
        border-radius: 8px;
        padding: 10px 14px;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        min-height: 44px;
        -webkit-tap-highlight-color: transparent;
        transition: transform 120ms;
      }
      .apex-fu-btn:active { transform: scale(0.96); }
      @media (prefers-reduced-motion: reduce) {
        #${s}, .apex-fu-icon { animation: none !important; }
        .apex-fu-btn:active { transform: none !important; }
      }
    `;u.inject(f,e)}async forceUpdate(){if(this.isUpdateInProgress()){a.warn("force-update","force-update already in progress, skipped");return}this.markUpdateInProgress(),a.info("force-update","NUCLEAR force-update triggered by Kevin");try{const{autoBackup:t}=await d(async()=>{const{autoBackup:r}=await import("./auto-backup-Cf6XL2lK.js");return{autoBackup:r}},__vite__mapDeps([0,1,2]),import.meta.url),n=await t.snapshot("pre-rollback");a.info("force-update",`pre-update snapshot OK : ${n.id} (${n.size_bytes}b)`)}catch(t){a.warn("force-update","pre-update snapshot failed (non bloquant)",{err:t})}if(typeof navigator<"u"&&"serviceWorker"in navigator)try{const t=await navigator.serviceWorker.getRegistrations();await Promise.all(t.map(n=>n.unregister().catch(()=>{}))),a.info("force-update",`${t.length} SW unregistered`)}catch(t){a.warn("force-update","SW unregister failed",{err:t})}if(typeof caches<"u")try{const t=await caches.keys();await Promise.all(t.map(n=>caches.delete(n).catch(()=>!1))),a.info("force-update",`${t.length} caches cleared`)}catch(t){a.warn("force-update","caches clear failed",{err:t})}try{const t=["apex_v13_vault","apex_v13_user","apex_v13_users","apex_v13_uid","apex_v13_pin","apex_v13_multi_keys","apex_v13_multikey_vault","apex_v13_passphrase_history","apex_v13_persistent_memory","apex_v13_credentials","apex_v13_device_obf","apex_v13_device_passphrase","apex_v13_device_trusted","apex_v13_backup_index","apex_v13_backup_","apex_v13_last_known_name","apex_v13_last_known_uid","apex_v13_lastact","apex_v13_lessons","apex_v13_kb","apex_v13_audit","apex_v13_xp","apex_v13_streak","apex_v13_attachments","ax_v13_attachments","apex_v13_paste_recovery_","ax_pin","ax_user","ax_uid","ax_persistent_memory","ax_anthropic","ax_openai","ax_groq","ax_gemini","ax_google","ax_openrouter","ax_mistral","ax_cohere","ax_deepseek","ax_perplexity","ax_xai","ax_huggingface","ax_hf_","ax_replicate","ax_stripe","ax_brevo","ax_resend","ax_telegram","ax_discord","ax_github","ax_gitlab","ax_cloudflare","ax_notion","ax_airtable","ax_dropbox","ax_spotify","ax_pinata","ax_pinecone","ax_qdrant","ax_weaviate","ax_brave","ax_tavily","ax_deepl","ax_finnhub","ax_coingecko","ax_coinmarketcap","ax_etherscan","ax_openweathermap","ax_owm","ax_opencage","ax_mapbox","ax_unsplash","ax_pixabay","ax_pexels","ax_elevenlabs","ax_newsapi","ax_credentials_deleted","ax_shared_api_key","ax_api_key"],n=[],r=[/^apex_v13_sw_cache_/,/^apex_v13_static_cache_/,/^apex_v13_runtime_cache_/,/^apex_v13_app_ver$/,/^apex_v13_cache_index$/,/^apex_v13_route_cache_/];for(let i=0;i<localStorage.length;i++){const o=localStorage.key(i);!o||t.some(p=>o.startsWith(p))||r.some(p=>p.test(o))&&n.push(o)}n.forEach(i=>localStorage.removeItem(i)),a.info("force-update",`${n.length} cache localStorage keys cleared (vault/user preserved)`)}catch(t){a.warn("force-update","localStorage clear failed",{err:t})}const e=`${location.pathname}?_force_upd=${Date.now()}${location.hash}`;location.replace(e)}}const A=new g;export{A as forceUpdateBanner};
