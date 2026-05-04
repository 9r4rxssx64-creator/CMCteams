import{h as n}from"./toast-DbVEuO4x.js";class u{idCounter=0;active=null;open(e){this.active&&this.active.close();const c=`ax-sheet-${++this.idCounter}-${Date.now()}`,t=document.createElement("div");t.className="ax-sheet-overlay",t.id=c,t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true"),e.title&&t.setAttribute("aria-label",e.title);const i=document.createElement("div");i.className="ax-sheet";const r=e.title?`<div class="ax-sheet-header">
          <h2 class="ax-sheet-title">${this.escapeHtml(e.title)}</h2>
          ${e.dismissable!==!1?'<button class="ax-sheet-close" aria-label="Fermer">×</button>':""}
        </div>`:"",h=e.actions&&e.actions.length>0?`<div class="ax-sheet-actions">${e.actions.map((a,s)=>`
              <button class="ax-btn ax-btn-${a.variant??"ghost"}" data-action-idx="${s}">
                ${this.escapeHtml(a.label)}
              </button>`).join("")}</div>`:"";i.innerHTML=`
      <div class="ax-sheet-handle"></div>
      ${r}
      <div class="ax-sheet-body">${e.content}</div>
      ${h}
    `,t.appendChild(i),document.body.appendChild(t),requestAnimationFrame(()=>{t.classList.add("ax-sheet-visible"),i.classList.add("ax-sheet-up");const a=i.querySelector('input:not([type="hidden"]), textarea, select');a&&(a.focus(),setTimeout(()=>{a.scrollIntoView({behavior:"smooth",block:"center"})},350))}),n.medium();const l=()=>{t.classList.remove("ax-sheet-visible"),i.classList.remove("ax-sheet-up"),i.classList.add("ax-sheet-down"),setTimeout(()=>{t.remove(),this.active&&this.active.el===t&&(this.active=null)},300)};if(e.dismissable!==!1){t.addEventListener("click",s=>{s.target===t&&(n.tap(),l())}),i.querySelector(".ax-sheet-close")?.addEventListener("click",()=>{n.tap(),l()});const a=s=>{s.key==="Escape"&&(l(),document.removeEventListener("keydown",a))};document.addEventListener("keydown",a)}e.actions&&i.querySelectorAll("[data-action-idx]").forEach(a=>{const s=Number(a.dataset.actionIdx),d=e.actions?.[s];d&&a.addEventListener("click",()=>{n.tap(),d.onClick()})});const o={el:t,close:l};return this.active=o,o}closeAll(){this.active&&(this.active.close(),this.active=null),document.querySelectorAll(".ax-sheet-overlay").forEach(e=>e.remove())}escapeHtml(e){return e.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]??c)}}const x=new u;export{x as m};
//# sourceMappingURL=modal-sheet-D0MrunZ9.js.map
