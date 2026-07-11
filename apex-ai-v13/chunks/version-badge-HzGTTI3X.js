import{l as r,_ as c}from"./monitoring-DfV1jLgN.js";import{A as e}from"../core/main-BExa6wkI.js";import{s as l}from"./style-injector-C0qr4r8-.js";import"./multi-source-analyze-DUElMJpr.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-CQguQfqL.js";import"./memory-C9SSzExh.js";const i="apex-version-badge",u="apex-version-badge-static",g="apex-version-badge",b=`
  #${i} {
    position: fixed;
    bottom: max(8px, env(safe-area-inset-bottom, 8px));
    left: 8px;
    z-index: 2147483646;
    padding: 5px 10px;
    background: linear-gradient(135deg, rgba(232, 184, 48, 0.22), rgba(232, 184, 48, 0.12));
    border: 1px solid rgba(232, 184, 48, 0.55);
    color: #c9a227;
    font-size: 11px;
    font-family: 'SF Mono', Menlo, monospace;
    font-weight: 700;
    border-radius: 12px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
    opacity: 0.85;
    transition: opacity 200ms ease;
    pointer-events: auto;
    line-height: 1;
    letter-spacing: 0.02em;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  #${i}:hover, #${i}:active {
    opacity: 1;
  }
  @media (max-width: 480px) {
    #${i} {
      font-size: 10px;
      padding: 4px 8px;
    }
  }
`;function w(){if(typeof document>"u"||document.getElementById(i))return;const t=document.getElementById(u);if(t){t.dataset.axHandlerAttached||(t.dataset.axHandlerAttached="1",t.addEventListener("click",()=>void n()),t.addEventListener("keydown",a=>{(a.key==="Enter"||a.key===" ")&&(a.preventDefault(),n())}),t.setAttribute("role","button"),t.setAttribute("tabindex","0"),t.setAttribute("aria-label",`Version Apex ${e} · clic pour détails`),t.title=`Apex AI ${e} · clic pour détails`),r.info("version-badge",`static badge enriched: ${e}`);return}l.inject(g,b);const o=document.createElement("button");o.id=i,o.type="button",o.textContent=e,o.title=`Apex AI ${e} · clic pour détails`,o.setAttribute("aria-label",`Version Apex ${e}`),o.addEventListener("click",()=>{n()}),document.body.appendChild(o),r.info("version-badge",`installé visible : ${e}`)}async function n(){try{const{toast:t}=await c(async()=>{const{toast:p}=await import("./toast-BCPNzfMv.js");return{toast:p}},[],import.meta.url),a=("serviceWorker"in navigator?await navigator.serviceWorker.getRegistration():null)?.active?.state??"aucun",s=parseInt(localStorage.getItem("apex_v13_last_visibility_update_check")??"0",10),d=s>0?new Date(s).toLocaleTimeString("fr-FR"):"jamais";t.info(`Apex ${e} · SW: ${a} · Dernier check MAJ: ${d}`,{duration:6e3})}catch(t){r.warn("version-badge","showVersionDetails failed",{err:t})}}function y(){if(!(typeof document>"u")){try{if(sessionStorage.getItem("apex_v13_boot_toast_shown"))return;sessionStorage.setItem("apex_v13_boot_toast_shown","1")}catch{}c(async()=>{const{toast:t}=await import("./toast-BCPNzfMv.js");return{toast:t}},[],import.meta.url).then(({toast:t})=>{t.success(`✅ Apex ${e} chargé`,{duration:3e3})}).catch(()=>{})}}export{w as installVersionBadge,y as showBootToast};
