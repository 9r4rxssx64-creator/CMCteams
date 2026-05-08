import{l as n}from"./monitoring-3uBGKGRH.js";const i="apex-global-back-btn",a="apex-global-back-style";class o{installed=!1;install(){this.installed||typeof document>"u"||(this.installed=!0,this.injectStyle(),this.mountButton(),this.attachRouterHook(),n.info("global-back-button","installed"))}injectStyle(){if(document.getElementById(a))return;const t=`
      #${i} {
        position: fixed;
        top: max(env(safe-area-inset-top, 8px), 8px);
        left: max(env(safe-area-inset-left, 8px), 8px);
        z-index: 999999;
        min-width: 44px;
        min-height: 44px;
        padding: 8px 14px;
        background: rgba(20, 20, 30, 0.92);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        color: #c9a227;
        border: 1px solid rgba(201, 162, 39, 0.4);
        border-radius: 22px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        gap: 6px;
        transition: opacity 200ms ease, transform 150ms ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        -webkit-tap-highlight-color: transparent;
      }
      #${i}:active {
        transform: scale(0.94);
      }
      #${i}.is-hidden {
        opacity: 0;
        pointer-events: none;
      }
      @media (prefers-reduced-motion: reduce) {
        #${i} { transition: none; }
        #${i}:active { transform: none; }
      }
    `,e=document.createElement("style");e.id=a,e.textContent=t,document.head.appendChild(e)}mountButton(){if(document.getElementById(i))return;const t=document.createElement("button");t.id=i,t.type="button",t.setAttribute("aria-label","Retour au chat"),t.title="Retour au chat",t.textContent="← Chat",t.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),location.hash="#chat"},{passive:!1}),document.body.appendChild(t),this.updateVisibility()}attachRouterHook(){window.addEventListener("hashchange",()=>this.updateVisibility(),{passive:!0}),window.addEventListener("orientationchange",()=>this.updateVisibility(),{passive:!0})}updateVisibility(){const t=document.getElementById(i);if(!t)return;const e=(location.hash||"#chat").replace(/^#/,"").split("?")[0]??"chat";e==="chat"||e===""||e==="chatlite"?t.classList.add("is-hidden"):t.classList.remove("is-hidden")}}const d=new o;export{d as globalBackButton};
