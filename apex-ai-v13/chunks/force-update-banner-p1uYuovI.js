const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-DTORcG7W.js","./monitoring-3uBGKGRH.js","./credential-patterns-D-srKehy.js"])))=>i.map(i=>d[i]);
import{_ as p}from"./apex-kb-DTORcG7W.js";import{A as s}from"../core/main-CYB7Rsj0.js";import{l as n}from"./monitoring-3uBGKGRH.js";import"./credential-patterns-D-srKehy.js";import"./multi-source-analyze-nznJbtVo.js";const i="apex-force-update-banner",_="apex-force-update-style",d="./index.html",x=600*1e3,u="apex_v13_last_version_check_ts";class f{installed=!1;intervalHandle=null;install(){this.installed||typeof document>"u"||(this.installed=!0,setTimeout(()=>void this.checkAndMaybeShow(),3e3),this.intervalHandle=setInterval(()=>void this.checkAndMaybeShow(),x),n.info("force-update","banner installed"))}uninstall(){this.intervalHandle&&clearInterval(this.intervalHandle),this.intervalHandle=null,this.removeBanner(),this.installed=!1}async checkVersion(){try{const a=await fetch(`${d}?_v=${Date.now()}`,{cache:"no-store",headers:{"Cache-Control":"no-cache"}});if(!a.ok)return n.warn("force-update",`version check fetch failed: ${a.status}`),{remote_ver:null,local_ver:s,is_stale:!1};const r=(await a.text()).match(/data-app-ver="([^"]+)"/)?.[1]??null,o=r!==null&&r!==s;try{localStorage.setItem(u,String(Date.now()))}catch{}return{remote_ver:r,local_ver:s,is_stale:o}}catch(a){return n.warn("force-update","version check failed",{err:a}),{remote_ver:null,local_ver:s,is_stale:!1}}}async checkAndMaybeShow(){const a=await this.checkVersion();if(a.is_stale&&a.remote_ver){const e=parseInt(localStorage.getItem("apex_v13_auto_maj_last")??"0",10),t=Date.now()-e>3600*1e3,r=document.visibilityState==="hidden"||this.isUserIdle(),o=!this.hasActiveFetch()&&!this.hasUserTyping();if(t&&r&&o){n.info("force-update",`AUTO-MAJ silencieuse (${a.local_ver} → ${a.remote_ver})`),localStorage.setItem("apex_v13_auto_maj_last",String(Date.now()));try{const{toast:l}=await p(async()=>{const{toast:c}=await import("./toast-ClsF1KRZ.js");return{toast:c}},[],import.meta.url);l.info(`🔄 Mise à jour ${a.remote_ver} en cours…`)}catch{}await this.forceUpdate()}else this.showBanner(a.remote_ver)}else this.removeBanner()}hasUserTyping(){const a=document.activeElement;if(!a)return!1;const e=a.tagName?.toLowerCase();return e==="textarea"||e==="input"||a.getAttribute("contenteditable")==="true"}hasActiveFetch(){try{return window.__apexActiveStream===!0}catch{return!1}}isUserIdle(){try{const a=parseInt(localStorage.getItem("apex_v13_last_interaction")??"0",10);return a?Date.now()-a>3e4:!0}catch{return!0}}showBanner(a){if(document.getElementById(i))return;this.injectStyle();const e=document.createElement("div");e.id=i,e.setAttribute("role","alert"),e.setAttribute("aria-live","assertive"),e.innerHTML=`
      <div class="apex-fu-content">
        <div class="apex-fu-icon">🔄</div>
        <div class="apex-fu-text">
          <strong>Nouvelle version Apex disponible</strong>
          <span class="apex-fu-versions">Local: ${s} → Remote: ${a}</span>
        </div>
        <button class="apex-fu-btn" id="${i}-btn" type="button">
          🔄 Forcer mise à jour
        </button>
      </div>
    `,document.body.appendChild(e),document.getElementById(`${i}-btn`)?.addEventListener("click",()=>{this.forceUpdate()}),n.info("force-update",`banner shown (local=${s}, remote=${a})`)}removeBanner(){const a=document.getElementById(i);a&&a.remove()}injectStyle(){if(document.getElementById(_))return;const a=`
      #${i} {
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
        #${i}, .apex-fu-icon { animation: none !important; }
        .apex-fu-btn:active { transform: none !important; }
      }
    `,e=document.createElement("style");e.id=_,e.textContent=a,document.head.appendChild(e)}async forceUpdate(){n.info("force-update","NUCLEAR force-update triggered by Kevin");try{const{autoBackup:e}=await p(async()=>{const{autoBackup:r}=await import("./auto-backup-XF58CNYf.js");return{autoBackup:r}},__vite__mapDeps([0,1,2]),import.meta.url),t=await e.snapshot("pre-rollback");n.info("force-update",`pre-update snapshot OK : ${t.id} (${t.size_bytes}b)`)}catch(e){n.warn("force-update","pre-update snapshot failed (non bloquant)",{err:e})}if(typeof navigator<"u"&&"serviceWorker"in navigator)try{const e=await navigator.serviceWorker.getRegistrations();await Promise.all(e.map(t=>t.unregister().catch(()=>{}))),n.info("force-update",`${e.length} SW unregistered`)}catch(e){n.warn("force-update","SW unregister failed",{err:e})}if(typeof caches<"u")try{const e=await caches.keys();await Promise.all(e.map(t=>caches.delete(t).catch(()=>!1))),n.info("force-update",`${e.length} caches cleared`)}catch(e){n.warn("force-update","caches clear failed",{err:e})}try{const e=["apex_v13_vault","apex_v13_user","apex_v13_users","apex_v13_uid","apex_v13_pin","apex_v13_multi_keys","apex_v13_multikey_vault","apex_v13_passphrase_history","apex_v13_persistent_memory","apex_v13_credentials","apex_v13_device_obf","apex_v13_device_passphrase","apex_v13_device_trusted","apex_v13_backup_index","apex_v13_backup_","apex_v13_last_known_name","apex_v13_last_known_uid","apex_v13_lastact","apex_v13_lessons","apex_v13_kb","apex_v13_audit","apex_v13_xp","apex_v13_streak","apex_v13_attachments","ax_v13_attachments","apex_v13_paste_recovery_","ax_pin","ax_user","ax_uid","ax_persistent_memory","ax_anthropic","ax_openai","ax_groq","ax_gemini","ax_google","ax_openrouter","ax_mistral","ax_cohere","ax_deepseek","ax_perplexity","ax_xai","ax_huggingface","ax_hf_","ax_replicate","ax_stripe","ax_brevo","ax_resend","ax_telegram","ax_discord","ax_github","ax_gitlab","ax_cloudflare","ax_notion","ax_airtable","ax_dropbox","ax_spotify","ax_pinata","ax_pinecone","ax_qdrant","ax_weaviate","ax_brave","ax_tavily","ax_deepl","ax_finnhub","ax_coingecko","ax_coinmarketcap","ax_etherscan","ax_openweathermap","ax_owm","ax_opencage","ax_mapbox","ax_unsplash","ax_pixabay","ax_pexels","ax_elevenlabs","ax_newsapi","ax_credentials_deleted","ax_shared_api_key","ax_api_key"],t=[];for(let r=0;r<localStorage.length;r++){const o=localStorage.key(r);if(!o)continue;!e.some(c=>o.startsWith(c))&&(o.includes("cache")||o.includes("sw_")||o.includes("app_ver"))&&t.push(o)}t.forEach(r=>localStorage.removeItem(r)),n.info("force-update",`${t.length} cache localStorage keys cleared (vault/user preserved)`)}catch(e){n.warn("force-update","localStorage clear failed",{err:e})}const a=`${location.pathname}?_force_upd=${Date.now()}${location.hash}`;location.replace(a)}}const w=new f;export{w as forceUpdateBanner};
