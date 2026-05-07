import{consumptionMonitor as i}from"./consumption-monitor-Dx0_X8mZ.js";import"./monitoring-B17vNBOa.js";import"./apex-tools-registry-Duck4KzY.js";import"./links-registry-Dq5lfkhy.js";import"./apex-tools-dispatch-C5mqKMBJ.js";import"./apex-kb-wc6eCWvf.js";import"./credential-patterns-BybElwOv.js";import"./push-notifications-Clz0Y3eV.js";import"./tokens-dashboard-C5ZzZyK6.js";function d(a){const t=a.severity==="critical"?"#ff4444":a.severity==="warn"?"#ffaa00":"#22cc77",n=Math.min(100,a.pct_used);return`
    <div class="ax-consumption-card" data-service="${a.service}" data-severity="${a.severity}">
      <header class="ax-consumption-card-head">
        <span class="ax-consumption-emoji">${a.emoji}</span>
        <span class="ax-consumption-name">${a.service.toUpperCase()}</span>
        <span class="ax-consumption-pct">${a.pct_used}%</span>
      </header>
      <div class="ax-consumption-bar-bg">
        <div class="ax-consumption-bar-fill" style="width:${n}%;background:${t}"></div>
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
  `}function l(a){const t=i.getUpgradePlans(a),n=i.recommendUpgrade(a),e=n.needed?`
    <div class="ax-reco-banner">
      <strong>💡 Recommandation auto</strong>
      <p>${n.reason}</p>
      ${n.suggested?`<p>Plan suggéré : <strong>${n.suggested}</strong></p>`:""}
    </div>
  `:"",r=t.map(s=>`
    <div class="ax-plan-card">
      <header><strong>${s.name}</strong> ${s.price_eur_month>0?`<span class="ax-plan-price">${s.price_eur_month}€/mois</span>`:'<span class="ax-plan-free">Gratuit</span>'}</header>
      <p>${s.description}</p>
      <a href="${s.upgrade_url}" target="_blank" rel="noopener" class="ax-btn-primary">Choisir ce plan</a>
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
  `}function f(a){const t=i.formatForUI(),n=t.services.map(d).join(""),e=t.total_alerts>0?`<div class="ax-banner-alert">⚠️ ${t.total_alerts} service${t.total_alerts>1?"s":""} en alerte — recharger vite</div>`:'<div class="ax-banner-ok">✅ Tous services dans les budgets</div>';a.innerHTML=`
    <div class="ax-consumption-dashboard">
      <h1>💰 Consommation live</h1>
      <p class="ax-subtitle">Suivi conso temps réel + recharge 1-clic + plans upgrade</p>
      ${e}
      <div class="ax-consumption-grid">${n}</div>
      <div id="ax-consumption-modal-mount"></div>
    </div>
  `,a.addEventListener("click",r=>{const s=r.target,c=s.closest('[data-action="upgrade-plans"]')?.dataset.target;if(c){const o=a.querySelector("#ax-consumption-modal-mount");o&&(o.innerHTML=l(c))}if(s.closest('[data-action="close-modal"]')){const o=a.querySelector("#ax-consumption-modal-mount");o&&(o.innerHTML="")}})}export{f as render};
//# sourceMappingURL=consumption-dashboard-3Ej_Tuvu.js.map
