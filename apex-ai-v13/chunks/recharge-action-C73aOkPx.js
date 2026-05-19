import{e as t}from"./escape-html-BlQj2yEF.js";function x(n){const{rechargeUrl:e,rotateUrl:a,variant:o="inline",label:r="Recharge"}=n;if(!e&&!a)return"";if(o==="button"){const c=e?t(e):"",s=a?t(a):"";return`<div class="ax-recharge-action ax-recharge-action-button" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">
      ${e?`<a class="ax-btn-health ax-btn-health-primary" href="${c}" target="_blank" rel="noopener" style="text-decoration:none;font-size:12px">💳 ${t(r)}</a>`:""}
      ${a?`<a class="ax-btn-health ax-btn-health-blue" href="${s}" target="_blank" rel="noopener" style="text-decoration:none;font-size:12px">🔄 Rotate</a>`:""}
    </div>`}const l=e?t(e):"",i=a?t(a):"";return`<div class="ax-recharge-action ax-recharge-action-inline" style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap;font-size:11px">
    ${e?`<a href="${l}" target="_blank" rel="noopener" style="color:var(--ax-gold-deep);text-decoration:none;font-weight:600">💳 ${t(r)} →</a>`:""}
    ${a?`<a href="${i}" target="_blank" rel="noopener" style="color:var(--ax-gold-deep);text-decoration:none;font-weight:600">🔄 Rotate →</a>`:""}
  </div>`}export{x as r};
