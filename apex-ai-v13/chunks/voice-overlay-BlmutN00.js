import{s as d,l}from"./monitoring-gwUaDUms.js";import"./multi-source-analyze-1eA_tl5V.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-uwxpjP18.js";let e=null,r=null,s=null,p=null,o="";function u(){if(document.getElementById("apex-voice-overlay-styles"))return;const t=document.createElement("style");t.id="apex-voice-overlay-styles",t.textContent=`
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
  `,document.head.appendChild(t)}function x(t={}){if(e)return;u(),s=t.onSubmit??null,p=t.onStop??null,o=t.initialMessage??"",e=document.createElement("div"),e.id="apex-voice-overlay",e.setAttribute("role","dialog"),e.setAttribute("aria-modal","true"),e.setAttribute("aria-label","Dictée vocale en cours"),e.style.cssText=["position:fixed","inset:0","z-index:2147483645","background:rgba(0,0,0,0.65)","backdrop-filter:blur(12px) saturate(140%)","-webkit-backdrop-filter:blur(12px) saturate(140%)","display:flex","flex-direction:column","align-items:center","justify-content:center","padding:env(safe-area-inset-top,20px) 20px env(safe-area-inset-bottom,20px) 20px","animation:ax-overlay-fade-in 320ms cubic-bezier(0.16,1,0.3,1) forwards","cursor:pointer"].join(";"),d(e,`
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
      ">${o||'<span style="opacity:0.4">…</span>'}</div>
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
  `),document.body.appendChild(e),r=e.querySelector("#apex-voice-overlay-transcript"),e.querySelector("#apex-voice-overlay-stop")?.addEventListener("click",a=>{a.stopPropagation(),n()}),e.querySelector("#apex-voice-overlay-submit")?.addEventListener("click",a=>{a.stopPropagation(),v()}),e.addEventListener("click",a=>{a.target===e&&n()});const i=a=>{a.key==="Escape"&&(n(),document.removeEventListener("keydown",i))};document.addEventListener("keydown",i),l.info("voice-overlay","shown")}function f(t,i=!1){o=t,r&&(t?r.textContent=t+(i?"":"…"):d(r,'<span style="opacity:0.4">…</span>'))}function y(t){if(!e)return;const i=e.querySelector("#apex-voice-overlay-status");i&&(i.textContent=t)}function c(){e&&(e.remove(),e=null,r=null),s=null,p=null,o=""}function b(){return e!==null}function n(){const t=p;if(c(),t)try{t()}catch(i){l.warn("voice-overlay","onStop callback failed",{err:i})}}function v(){const t=o.trim(),i=s;if(c(),i&&t)try{i(t)}catch(a){l.warn("voice-overlay","onSubmit callback failed",{err:a})}}const k={show:x,hide:c,isVisible:b,updateTranscript:f,updateStatus:y};export{c as hide,b as isVisible,x as show,y as updateStatus,f as updateTranscript,k as voiceOverlay};
