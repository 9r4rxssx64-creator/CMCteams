import{A as s}from"../core/main-FGs0Cy95.js";import{l as a}from"./monitoring-3uBGKGRH.js";import"./apex-kb-vEgxDV-A.js";import"./credential-patterns-Dy6Wjk7e.js";import"./multi-source-analyze-DUow5a1T.js";const i="apex-force-update-banner",c="apex-force-update-style",p="./index.html",d=600*1e3,f="apex_v13_last_version_check_ts";class u{installed=!1;intervalHandle=null;install(){this.installed||typeof document>"u"||(this.installed=!0,setTimeout(()=>void this.checkAndMaybeShow(),3e3),this.intervalHandle=setInterval(()=>void this.checkAndMaybeShow(),d),a.info("force-update","banner installed"))}uninstall(){this.intervalHandle&&clearInterval(this.intervalHandle),this.intervalHandle=null,this.removeBanner(),this.installed=!1}async checkVersion(){try{const t=await fetch(`${p}?_v=${Date.now()}`,{cache:"no-store",headers:{"Cache-Control":"no-cache"}});if(!t.ok)return a.warn("force-update",`version check fetch failed: ${t.status}`),{remote_ver:null,local_ver:s,is_stale:!1};const r=(await t.text()).match(/data-app-ver="([^"]+)"/)?.[1]??null,o=r!==null&&r!==s;try{localStorage.setItem(f,String(Date.now()))}catch{}return{remote_ver:r,local_ver:s,is_stale:o}}catch(t){return a.warn("force-update","version check failed",{err:t}),{remote_ver:null,local_ver:s,is_stale:!1}}}async checkAndMaybeShow(){const t=await this.checkVersion();t.is_stale&&t.remote_ver?this.showBanner(t.remote_ver):this.removeBanner()}showBanner(t){if(document.getElementById(i))return;this.injectStyle();const e=document.createElement("div");e.id=i,e.setAttribute("role","alert"),e.setAttribute("aria-live","assertive"),e.innerHTML=`
      <div class="apex-fu-content">
        <div class="apex-fu-icon">🔄</div>
        <div class="apex-fu-text">
          <strong>Nouvelle version Apex disponible</strong>
          <span class="apex-fu-versions">Local: ${s} → Remote: ${t}</span>
        </div>
        <button class="apex-fu-btn" id="${i}-btn" type="button">
          🔄 Forcer mise à jour
        </button>
      </div>
    `,document.body.appendChild(e),document.getElementById(`${i}-btn`)?.addEventListener("click",()=>{this.forceUpdate()}),a.info("force-update",`banner shown (local=${s}, remote=${t})`)}removeBanner(){const t=document.getElementById(i);t&&t.remove()}injectStyle(){if(document.getElementById(c))return;const t=`
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
    `,e=document.createElement("style");e.id=c,e.textContent=t,document.head.appendChild(e)}async forceUpdate(){if(a.info("force-update","NUCLEAR force-update triggered by Kevin"),typeof navigator<"u"&&"serviceWorker"in navigator)try{const e=await navigator.serviceWorker.getRegistrations();await Promise.all(e.map(n=>n.unregister().catch(()=>{}))),a.info("force-update",`${e.length} SW unregistered`)}catch(e){a.warn("force-update","SW unregister failed",{err:e})}if(typeof caches<"u")try{const e=await caches.keys();await Promise.all(e.map(n=>caches.delete(n).catch(()=>!1))),a.info("force-update",`${e.length} caches cleared`)}catch(e){a.warn("force-update","caches clear failed",{err:e})}try{const e=["apex_v13_vault_","apex_v13_user","apex_v13_pin_","ax_pin","ax_user","ax_uid","ax_persistent_memory","apex_v13_persistent_memory"],n=[];for(let r=0;r<localStorage.length;r++){const o=localStorage.key(r);if(!o)continue;!e.some(l=>o.startsWith(l))&&(o.includes("cache")||o.includes("sw_")||o.includes("app_ver"))&&n.push(o)}n.forEach(r=>localStorage.removeItem(r)),a.info("force-update",`${n.length} cache localStorage keys cleared (vault/user preserved)`)}catch(e){a.warn("force-update","localStorage clear failed",{err:e})}const t=`${location.pathname}?_force_upd=${Date.now()}${location.hash}`;location.replace(t)}}const b=new u;export{b as forceUpdateBanner};
