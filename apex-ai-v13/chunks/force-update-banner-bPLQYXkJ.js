import{A as s}from"../core/main-DVBHnUQw.js";import{l as t}from"./monitoring-3uBGKGRH.js";import"./apex-kb-Bj9T0uXS.js";import"./credential-patterns-qcw7Brjr.js";import"./multi-source-analyze-BD7Yg5Sh.js";const i="apex-force-update-banner",c="apex-force-update-style",p="./index.html",d=600*1e3,x="apex_v13_last_version_check_ts";class f{installed=!1;intervalHandle=null;install(){this.installed||typeof document>"u"||(this.installed=!0,setTimeout(()=>void this.checkAndMaybeShow(),3e3),this.intervalHandle=setInterval(()=>void this.checkAndMaybeShow(),d),t.info("force-update","banner installed"))}uninstall(){this.intervalHandle&&clearInterval(this.intervalHandle),this.intervalHandle=null,this.removeBanner(),this.installed=!1}async checkVersion(){try{const a=await fetch(`${p}?_v=${Date.now()}`,{cache:"no-store",headers:{"Cache-Control":"no-cache"}});if(!a.ok)return t.warn("force-update",`version check fetch failed: ${a.status}`),{remote_ver:null,local_ver:s,is_stale:!1};const r=(await a.text()).match(/data-app-ver="([^"]+)"/)?.[1]??null,o=r!==null&&r!==s;try{localStorage.setItem(x,String(Date.now()))}catch{}return{remote_ver:r,local_ver:s,is_stale:o}}catch(a){return t.warn("force-update","version check failed",{err:a}),{remote_ver:null,local_ver:s,is_stale:!1}}}async checkAndMaybeShow(){const a=await this.checkVersion();a.is_stale&&a.remote_ver?this.showBanner(a.remote_ver):this.removeBanner()}showBanner(a){if(document.getElementById(i))return;this.injectStyle();const e=document.createElement("div");e.id=i,e.setAttribute("role","alert"),e.setAttribute("aria-live","assertive"),e.innerHTML=`
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
    `,document.body.appendChild(e),document.getElementById(`${i}-btn`)?.addEventListener("click",()=>{this.forceUpdate()}),t.info("force-update",`banner shown (local=${s}, remote=${a})`)}removeBanner(){const a=document.getElementById(i);a&&a.remove()}injectStyle(){if(document.getElementById(c))return;const a=`
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
    `,e=document.createElement("style");e.id=c,e.textContent=a,document.head.appendChild(e)}async forceUpdate(){if(t.info("force-update","NUCLEAR force-update triggered by Kevin"),typeof navigator<"u"&&"serviceWorker"in navigator)try{const e=await navigator.serviceWorker.getRegistrations();await Promise.all(e.map(n=>n.unregister().catch(()=>{}))),t.info("force-update",`${e.length} SW unregistered`)}catch(e){t.warn("force-update","SW unregister failed",{err:e})}if(typeof caches<"u")try{const e=await caches.keys();await Promise.all(e.map(n=>caches.delete(n).catch(()=>!1))),t.info("force-update",`${e.length} caches cleared`)}catch(e){t.warn("force-update","caches clear failed",{err:e})}try{const e=["apex_v13_vault","apex_v13_user","apex_v13_pin","apex_v13_multikey_vault","apex_v13_passphrase_history","apex_v13_persistent_memory","apex_v13_credentials","apex_v13_device_obf","apex_v13_device_passphrase","apex_v13_lessons","apex_v13_kb","apex_v13_audit","apex_v13_users","apex_v13_xp","apex_v13_streak","ax_pin","ax_user","ax_uid","ax_persistent_memory","ax_anthropic","ax_openai","ax_groq","ax_gemini","ax_google","ax_openrouter","ax_mistral","ax_cohere","ax_deepseek","ax_perplexity","ax_xai","ax_huggingface","ax_hf_","ax_replicate","ax_stripe","ax_brevo","ax_resend","ax_telegram","ax_discord","ax_github","ax_gitlab","ax_cloudflare","ax_notion","ax_airtable","ax_dropbox","ax_spotify","ax_pinata","ax_pinecone","ax_qdrant","ax_weaviate","ax_brave","ax_tavily","ax_deepl","ax_finnhub","ax_coingecko","ax_coinmarketcap","ax_etherscan","ax_openweathermap","ax_owm","ax_opencage","ax_mapbox","ax_unsplash","ax_pixabay","ax_pexels","ax_elevenlabs","ax_newsapi","ax_credentials_deleted","ax_shared_api_key","ax_api_key"],n=[];for(let r=0;r<localStorage.length;r++){const o=localStorage.key(r);if(!o)continue;!e.some(l=>o.startsWith(l))&&(o.includes("cache")||o.includes("sw_")||o.includes("app_ver"))&&n.push(o)}n.forEach(r=>localStorage.removeItem(r)),t.info("force-update",`${n.length} cache localStorage keys cleared (vault/user preserved)`)}catch(e){t.warn("force-update","localStorage clear failed",{err:e})}const a=`${location.pathname}?_force_upd=${Date.now()}${location.hash}`;location.replace(a)}}const b=new f;export{b as forceUpdateBanner};
