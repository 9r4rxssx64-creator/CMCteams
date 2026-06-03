import{b as l,k as i,s as p}from"./monitoring-DrYio7_k.js";import{g as m}from"./apex-tools-dispatch-core-DHOjEKOD.js";import"./multi-source-analyze-ZZ2u9mng.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-CxlqDgaN.js";import"./apex-tools-dispatch-skills-BqDHx6u5.js";import"./apex-tools-dispatch-data-B3BoF_YD.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-BxEAr-1m.js";import"./apex-tools-misc-BhB15hWh.js";import"./apex-tools-registry-core-BMhHY4vU.js";import"./apex-tools-registry-skills-x-mAWYry.js";function u(a){const s=a.severity==="critical"?"#ff4444":a.severity==="warn"?"#ffaa00":"#22cc77",t=Math.min(100,a.pct_used);return`
    <div class="ax-consumption-card" data-service="${a.service}" data-severity="${a.severity}">
      <header class="ax-consumption-card-head">
        <span class="ax-consumption-emoji">${a.emoji}</span>
        <span class="ax-consumption-name">${a.service.toUpperCase()}</span>
        <span class="ax-consumption-pct">${a.pct_used}%</span>
      </header>
      <div class="ax-consumption-bar-bg">
        <div class="ax-consumption-bar-fill" style="width:${t}%;background:${s}"></div>
      </div>
      <div class="ax-consumption-detail">${a.used} / ${a.budget}</div>
      <div class="ax-consumption-actions">
        <a href="${a.billing_url}" target="_blank" rel="noopener" class="ax-btn-primary ax-btn-recharge" data-action="recharge">
          🔋 Recharger
        </a>
        <button type="button" class="ax-btn-ghost" data-action="upgrade-plans" data-target="${a.service}">
          📦 Plans
        </button>
      </div>
    </div>
  `}function g(a){const s=i.getUpgradePlans(a),t=i.recommendUpgrade(a),e=t.needed?`
    <div class="ax-reco-banner">
      <strong>💡 Recommandation auto</strong>
      <p>${t.reason}</p>
      ${t.suggested?`<p>Plan suggéré : <strong>${t.suggested}</strong></p>`:""}
    </div>
  `:"",r=s.map(n=>`
    <div class="ax-plan-card">
      <header><strong>${n.name}</strong> ${n.price_eur_month>0?`<span class="ax-plan-price">${n.price_eur_month}€/mois</span>`:'<span class="ax-plan-free">Gratuit</span>'}</header>
      <p>${n.description}</p>
      <a href="${n.upgrade_url}" target="_blank" rel="noopener" class="ax-btn-primary">Choisir ce plan</a>
    </div>
  `).join("");return`
    <div class="ax-modal-sheet" role="dialog" aria-label="Plans ${a}">
      <header class="ax-modal-head">
        <h2>Plans ${a.toUpperCase()}</h2>
        <button type="button" class="ax-btn-close" data-action="close-modal">✕</button>
      </header>
      ${e}
      <div class="ax-plans-list">${r}</div>
    </div>
  `}function U(a){const s=l.get("user")?.id??"anon";if(!m("admin.consumption",a,s))return;const t=i.formatForUI(),e=t.services.map(u).join(""),r=t.total_alerts>0?`<div class="ax-banner-alert">⚠️ ${t.total_alerts} service${t.total_alerts>1?"s":""} en alerte — recharger vite</div>`:'<div class="ax-banner-ok">✅ Tous services dans les budgets</div>';p(a,`
    <div class="ax-consumption-dashboard">
      <h1>💰 Consommation live</h1>
      <p class="ax-subtitle">Suivi conso temps réel + recharge 1-clic + plans upgrade</p>
      ${r}
      <div class="ax-consumption-grid">${e}</div>
      <div id="ax-consumption-modal-mount"></div>
    </div>
  `),a.addEventListener("click",n=>{const c=n.target,d=c.closest('[data-action="upgrade-plans"]')?.dataset.target;if(d){const o=a.querySelector("#ax-consumption-modal-mount");o&&(o.innerHTML=g(d))}if(c.closest('[data-action="close-modal"]')){const o=a.querySelector("#ax-consumption-modal-mount");o&&(o.innerHTML="")}})}export{U as render};
