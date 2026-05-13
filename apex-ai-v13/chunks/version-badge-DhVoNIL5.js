import{_ as s}from"./apex-kb-DSM71ALp.js";import{s as l}from"./style-injector-C0qr4r8-.js";import{A as e}from"../core/main-DHaZ58Fn.js";import{l as a}from"./monitoring-3uBGKGRH.js";import"./credential-patterns-D-srKehy.js";import"./multi-source-analyze-Cggvb-cB.js";const i="apex-version-badge",u="apex-version-badge-static",g="apex-version-badge",b=`
  #${i} {
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
  #${i}:hover, #${i}:active {
    opacity: 1;
  }
  @media (max-width: 480px) {
    #${i} {
      font-size: 9px;
      padding: 3px 6px;
    }
  }
`;function A(){if(typeof document>"u"||document.getElementById(i))return;const t=document.getElementById(u);if(t){t.dataset.axHandlerAttached||(t.dataset.axHandlerAttached="1",t.addEventListener("click",()=>void n()),t.setAttribute("role","button"),t.setAttribute("tabindex","0"),t.setAttribute("aria-label",`Version Apex ${e} · clic pour détails`),t.title=`Apex AI ${e} · clic pour détails`),a.info("version-badge",`static badge enriched: ${e}`);return}l.inject(g,b);const o=document.createElement("button");o.id=i,o.type="button",o.textContent=e,o.title=`Apex AI ${e} · clic pour détails`,o.setAttribute("aria-label",`Version Apex ${e}`),o.addEventListener("click",()=>{n()}),document.body.appendChild(o),a.info("version-badge",`installé visible : ${e}`)}async function n(){try{const{toast:t}=await s(async()=>{const{toast:p}=await import("./toast-ClsF1KRZ.js");return{toast:p}},[],import.meta.url),c=("serviceWorker"in navigator?await navigator.serviceWorker.getRegistration():null)?.active?.state??"aucun",r=parseInt(localStorage.getItem("apex_v13_last_visibility_update_check")??"0",10),d=r>0?new Date(r).toLocaleTimeString("fr-FR"):"jamais";t.info(`Apex ${e} · SW: ${c} · Dernier check MAJ: ${d}`,{duration:6e3})}catch(t){a.warn("version-badge","showVersionDetails failed",{err:t})}}function w(){if(!(typeof document>"u")){try{if(sessionStorage.getItem("apex_v13_boot_toast_shown"))return;sessionStorage.setItem("apex_v13_boot_toast_shown","1")}catch{}s(async()=>{const{toast:t}=await import("./toast-ClsF1KRZ.js");return{toast:t}},[],import.meta.url).then(({toast:t})=>{t.success(`✅ Apex ${e} chargé`,{duration:3e3})}).catch(()=>{})}}export{A as installVersionBadge,w as showBootToast};
