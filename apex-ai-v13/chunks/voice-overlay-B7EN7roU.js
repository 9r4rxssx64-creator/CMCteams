import{q as l}from"./monitoring-DGsdmyG7.js";import"./multi-source-analyze-BxcrFYSE.js";import"./apex-kb-BRFYnqla.js";import"./credential-patterns-CLzI061R.js";let e=null,a=null,s=null,p=null,n="";function d(){if(document.getElementById("apex-voice-overlay-styles"))return;const t=document.createElement("style");t.id="apex-voice-overlay-styles",t.textContent=`
    @keyframes ax-mic-pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(232,184,48,0.5); }
      50% { transform: scale(1.06); box-shadow: 0 0 32px 16px rgba(232,184,48,0); }
    }
    @keyframes ax-overlay-fade-in {
      from { opacity: 0; backdrop-filter: blur(0px); }
      to { opacity: 1; backdrop-filter: blur(12px); }
    }
    @keyframes ax-transcript-pop {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,document.head.appendChild(t)}function u(t={}){if(e)return;d(),s=t.onSubmit??null,p=t.onStop??null,n=t.initialMessage??"",e=document.createElement("div"),e.id="apex-voice-overlay",e.setAttribute("role","dialog"),e.setAttribute("aria-modal","true"),e.setAttribute("aria-label","Dictée vocale en cours"),e.style.cssText=["position:fixed","inset:0","z-index:2147483645","background:rgba(0,0,0,0.65)","backdrop-filter:blur(12px) saturate(140%)","-webkit-backdrop-filter:blur(12px) saturate(140%)","display:flex","flex-direction:column","align-items:center","justify-content:center","padding:env(safe-area-inset-top,20px) 20px env(safe-area-inset-bottom,20px) 20px","animation:ax-overlay-fade-in 320ms cubic-bezier(0.16,1,0.3,1) forwards","cursor:pointer"].join(";"),e.innerHTML=`
    <div style="
      width:100%;max-width:520px;
      display:flex;flex-direction:column;align-items:center;gap:24px;
      cursor:default
    " id="apex-voice-overlay-inner">
      <div style="
        width:96px;height:96px;border-radius:50%;
        background:linear-gradient(135deg,#c9a227,#e8b830);
        display:flex;align-items:center;justify-content:center;
        font-size:48px;
        animation:ax-mic-pulse 1.8s ease-in-out infinite;
      " aria-hidden="true">🎙</div>
      <div id="apex-voice-overlay-status" style="
        color:rgba(255,255,255,0.7);font-size:13px;letter-spacing:0.5px;
        text-transform:uppercase;font-weight:600
      ">Parle maintenant…</div>
      <div id="apex-voice-overlay-transcript" style="
        color:#fff;font-size:26px;line-height:1.45;text-align:center;
        font-weight:500;min-height:80px;max-height:50vh;overflow-y:auto;
        padding:0 8px;word-break:break-word;overflow-wrap:anywhere;
        animation:ax-transcript-pop 240ms ease-out forwards;
      ">${n||'<span style="opacity:0.4">…</span>'}</div>
      <div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;width:100%;margin-top:8px">
        <button id="apex-voice-overlay-stop" type="button" aria-label="Arrêter dictée" style="
          padding:14px 24px;min-height:48px;min-width:120px;
          background:rgba(255,91,91,0.15);color:#ff5b5b;
          border:1.5px solid rgba(255,91,91,0.5);border-radius:24px;
          font-size:15px;font-weight:700;cursor:pointer;
          -webkit-tap-highlight-color:transparent;
        ">✕ Stop</button>
        <button id="apex-voice-overlay-submit" type="button" aria-label="Envoyer" style="
          padding:14px 28px;min-height:48px;min-width:140px;
          background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;
          border:none;border-radius:24px;
          font-size:15px;font-weight:800;cursor:pointer;
          box-shadow:0 4px 16px rgba(201,162,39,0.4);
          -webkit-tap-highlight-color:transparent;
        ">↑ Envoyer</button>
      </div>
    </div>
  `,document.body.appendChild(e),a=e.querySelector("#apex-voice-overlay-transcript"),e.querySelector("#apex-voice-overlay-stop")?.addEventListener("click",r=>{r.stopPropagation(),o()}),e.querySelector("#apex-voice-overlay-submit")?.addEventListener("click",r=>{r.stopPropagation(),b()}),e.addEventListener("click",r=>{r.target===e&&o()});const i=r=>{r.key==="Escape"&&(o(),document.removeEventListener("keydown",i))};document.addEventListener("keydown",i),l.info("voice-overlay","shown")}function x(t,i=!1){n=t,a&&(t?a.textContent=t+(i?"":"…"):a.innerHTML='<span style="opacity:0.4">…</span>')}function f(t){if(!e)return;const i=e.querySelector("#apex-voice-overlay-status");i&&(i.textContent=t)}function c(){e&&(e.remove(),e=null,a=null),s=null,p=null,n=""}function y(){return e!==null}function o(){const t=p;if(c(),t)try{t()}catch(i){l.warn("voice-overlay","onStop callback failed",{err:i})}}function b(){const t=n.trim(),i=s;if(c(),i&&t)try{i(t)}catch(r){l.warn("voice-overlay","onSubmit callback failed",{err:r})}}const w={show:u,hide:c,isVisible:y,updateTranscript:x,updateStatus:f};export{c as hide,y as isVisible,u as show,f as updateStatus,x as updateTranscript,w as voiceOverlay};
