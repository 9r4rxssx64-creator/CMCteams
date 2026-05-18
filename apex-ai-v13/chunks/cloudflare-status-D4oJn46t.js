import{l as r}from"./monitoring-3uBGKGRH.js";const i="https://www.cloudflarestatus.com/",l="apex-cloudflare-infra-banner",n="apex_v13_last_cloudflare_503_ts",s=300*1e3;let t=null;function d(){try{localStorage.setItem(n,String(Date.now()))}catch{}o()}function c(){try{localStorage.removeItem(n)}catch{}a()}function p(){try{const e=parseInt(localStorage.getItem(n)??"0",10);return e>0&&Date.now()-e<s}catch{return!1}}function o(){t||typeof document>"u"||(t=document.createElement("div"),t.id=l,t.setAttribute("role","status"),t.setAttribute("aria-live","polite"),t.style.cssText=["position:fixed","top:max(8px,env(safe-area-inset-top,8px))","left:50%","transform:translateX(-50%)","z-index:2147483640","max-width:min(92vw,500px)","padding:10px 14px","background:linear-gradient(135deg,rgba(247,131,34,0.95),rgba(232,184,48,0.95))","color:#000","border-radius:12px","font-size:13px","font-weight:600","box-shadow:0 4px 16px rgba(0,0,0,0.3)","cursor:pointer","animation:ax-banner-slide-in 240ms ease-out"].join(";"),t.innerHTML=`
    <div style="display:flex;align-items:center;gap:10px;line-height:1.4">
      <div style="font-size:20px">☁️</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:800;font-size:13px">Cloudflare infra dégradée</div>
        <div style="font-size:11px;opacity:0.85;margin-top:2px">
          HTTP 503 côté Cloudflare (Bot Management + Email Routing). PAS ton token. Tap pour status →
        </div>
      </div>
      <button type="button" aria-label="Fermer" style="background:rgba(0,0,0,0.15);border:none;color:#000;width:24px;height:24px;border-radius:50%;cursor:pointer;font-size:14px;flex-shrink:0">×</button>
    </div>
  `,document.body.appendChild(t),t.addEventListener("click",e=>{e.target.tagName==="BUTTON"?a():window.open(i,"_blank","noopener")}),r.info("cloudflare-status","Banner shown — HTTP 503 detected"))}function a(){t&&(t.remove(),t=null)}function u(){p()&&o()}const g={recordHttp503:d,recordHttpOk:c,init:u};export{g as cloudflareStatus,u as init,d as recordHttp503,c as recordHttpOk};
