import{_ as r}from"./apex-kb-BWLun4Fv.js";import{A as o}from"../core/main-CpU-QBn-.js";import{l as s}from"./monitoring-3uBGKGRH.js";import"./credential-patterns-D-srKehy.js";import"./multi-source-analyze-rieT-nwb.js";const e="apex-version-badge",i="apex-version-badge-style";function _(){if(typeof document>"u"||document.getElementById(e))return;if(!document.getElementById(i)){const a=document.createElement("style");a.id=i,a.textContent=`
      #${e} {
        position: fixed;
        bottom: max(8px, env(safe-area-inset-bottom, 8px));
        right: 8px;
        z-index: 9998;
        padding: 4px 8px;
        background: linear-gradient(135deg, rgba(232, 184, 48, 0.15), rgba(232, 184, 48, 0.08));
        border: 1px solid rgba(232, 184, 48, 0.35);
        color: rgba(232, 184, 48, 0.85);
        font-size: 10px;
        font-family: 'SF Mono', Menlo, monospace;
        font-weight: 600;
        border-radius: 10px;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
        opacity: 0.6;
        transition: opacity 200ms ease;
        pointer-events: auto;
        line-height: 1;
        letter-spacing: 0.02em;
      }
      #${e}:hover, #${e}:active {
        opacity: 1;
      }
      @media (max-width: 480px) {
        #${e} {
          font-size: 9px;
          padding: 3px 6px;
        }
      }
    `,document.head.appendChild(a)}const t=document.createElement("button");t.id=e,t.type="button",t.textContent=o,t.title=`Apex AI ${o} · clic pour détails`,t.setAttribute("aria-label",`Version Apex ${o}`),t.addEventListener("click",()=>{d()}),document.body.appendChild(t),s.info("version-badge",`installé visible : ${o}`)}async function d(){try{const{toast:t}=await r(async()=>{const{toast:p}=await import("./toast-ClsF1KRZ.js");return{toast:p}},[],import.meta.url),c=("serviceWorker"in navigator?await navigator.serviceWorker.getRegistration():null)?.active?.state??"aucun",n=parseInt(localStorage.getItem("apex_v13_last_visibility_update_check")??"0",10),l=n>0?new Date(n).toLocaleTimeString("fr-FR"):"jamais";t.info(`Apex ${o} · SW: ${c} · Dernier check MAJ: ${l}`,{duration:6e3})}catch(t){s.warn("version-badge","showVersionDetails failed",{err:t})}}function f(){if(!(typeof document>"u")){try{const t=parseInt(localStorage.getItem("apex_v13_boot_toast_last")??"0",10);if(Date.now()-t<3600*1e3)return;localStorage.setItem("apex_v13_boot_toast_last",String(Date.now()))}catch{}r(async()=>{const{toast:t}=await import("./toast-ClsF1KRZ.js");return{toast:t}},[],import.meta.url).then(({toast:t})=>{t.success(`✅ Apex ${o} chargé`,{duration:3e3})}).catch(()=>{})}}export{_ as installVersionBadge,f as showBootToast};
