import{m as n,s as d}from"./monitoring-eS3mQsuP.js";import"./multi-source-analyze-DRC5_BGP.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-DXirSuC2.js";const u={ai:"🧠 Intelligence Artificielle",saas:"💼 SaaS",comms:"✉️ Communications",infra:"☁️ Infrastructure",finance:"💳 Finance & Paiements",other:"🔧 Autres"};function f(a){if(a.length<2)return'<span class="ax-spark-empty">—</span>';const s=Math.max(...a.map(i=>i.eur),1),e=120,t=32,r=e/(a.length-1),o=a.map((i,l)=>`${l===0?"M":"L"}${(l*r).toFixed(1)} ${(t-i.eur/s*t).toFixed(1)}`).join(" ");return`
    <svg class="ax-sparkline" viewBox="0 0 ${e} ${t}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="${o}" fill="none" stroke="#c9a227" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${o} L${e} ${t} L0 ${t} Z" fill="rgba(201,162,39,0.15)"/>
    </svg>
  `}function x(a){const s=Math.max(...a,.01);return`<div class="ax-heatmap-24h" aria-label="Heatmap 24h">${a.map((t,r)=>`<div class="ax-heat-cell" style="background:rgba(201,162,39,${(.1+t/s*.9).toFixed(2)})" title="${r}h : ${t.toFixed(2)}€" aria-label="${r}h"></div>`).join("")}</div>`}function v(a){const s=a.trend_7d==="up"?"↗":a.trend_7d==="down"?"↘":"→",e=a.trend_7d==="up"?"trend-up":a.trend_7d==="down"?"trend-down":"trend-stable",t=a.status==="critical"?"🔴":a.status==="warn"?"🟡":"🟢",r=Math.min(100,a.pct_budget),o=a.status==="critical"?"#ff4444":a.status==="warn"?"#ffaa00":"#22cc77",i=a.is_free_tier?'<span class="ax-badge-free">FREE</span>':"";return`
    <article class="ax-fin-service-card" data-service="${a.service}" data-status="${a.status}">
      <header class="ax-fin-card-head">
        <span class="ax-fin-emoji">${a.emoji}</span>
        <span class="ax-fin-name">${a.service.toUpperCase()}</span>
        ${i}
        <span class="ax-fin-trend ${e}">${s}</span>
        <span class="ax-fin-status">${t}</span>
      </header>
      <div class="ax-fin-amounts">
        <div class="ax-fin-today">
          <span class="ax-fin-label">Aujourd'hui</span>
          <span class="ax-fin-value">${n.formatEur(a.used_eur_today)}</span>
        </div>
        <div class="ax-fin-month">
          <span class="ax-fin-label">Ce mois</span>
          <span class="ax-fin-value">${n.formatEur(a.used_eur_month)}</span>
        </div>
      </div>
      <div class="ax-fin-bar-container">
        <div class="ax-fin-bar-bg">
          <div class="ax-fin-bar-fill" style="width:${r}%;background:${o}"></div>
        </div>
        <span class="ax-fin-bar-pct">${a.pct_budget}%</span>
      </div>
      <div class="ax-fin-budget-label">Budget : ${n.formatEur(a.budget_eur_month)}/mois</div>
    </article>
  `}function m(a,s){if(s.length===0)return"";const e=s.reduce((t,r)=>t+r.used_eur_month,0);return`
    <section class="ax-fin-category">
      <header class="ax-fin-category-head">
        <h3>${u[a]}</h3>
        <span class="ax-fin-category-subtotal">${n.formatEur(e)}/mois</span>
      </header>
      <div class="ax-fin-cards-grid">${s.map(v).join("")}</div>
    </section>
  `}function h(a){const s=a.monthly_profit_eur>0?"profit-positive":"profit-negative";return`
    <section class="ax-fin-roi">
      <h3>💰 ROI commercialisation Apex</h3>
      <div class="ax-fin-roi-grid">
        <div class="ax-fin-roi-cell">
          <span class="ax-fin-roi-label">Users payants</span>
          <span class="ax-fin-roi-value">${a.paying_users}</span>
        </div>
        <div class="ax-fin-roi-cell">
          <span class="ax-fin-roi-label">Revenu mensuel</span>
          <span class="ax-fin-roi-value">${n.formatEur(a.monthly_revenue_eur)}</span>
        </div>
        <div class="ax-fin-roi-cell">
          <span class="ax-fin-roi-label">Coût mensuel</span>
          <span class="ax-fin-roi-value">${n.formatEur(a.monthly_cost_eur)}</span>
        </div>
        <div class="ax-fin-roi-cell ${s}">
          <span class="ax-fin-roi-label">Profit / Perte</span>
          <span class="ax-fin-roi-value">${n.formatEur(a.monthly_profit_eur)}</span>
        </div>
        <div class="ax-fin-roi-cell">
          <span class="ax-fin-roi-label">Marge</span>
          <span class="ax-fin-roi-value">${a.margin_pct}%</span>
        </div>
        <div class="ax-fin-roi-cell">
          <span class="ax-fin-roi-label">🎯 Break-even</span>
          <span class="ax-fin-roi-value">${a.breakeven_users} users</span>
        </div>
      </div>
    </section>
  `}function g(a){return`
    <section class="ax-fin-competition">
      <h3>💎 Apex vs Concurrence</h3>
      <table class="ax-comp-table">
        <thead>
          <tr><th>Concurrent</th><th>Prix</th><th>Avantage Apex</th></tr>
        </thead>
        <tbody>${a.map(e=>`
    <tr>
      <td><strong>${e.tool}</strong></td>
      <td class="ax-comp-price">${e.their_price_eur}€/mois</td>
      <td class="ax-comp-advantage">${e.apex_advantage}</td>
    </tr>
  `).join("")}</tbody>
      </table>
    </section>
  `}function y(a){const s=n.getSummary(),e=n.getSparklineMonth(),t=n.getHourlyHeatmap(),r=new Map;for(const c of s.services){const p=r.get(c.category)??[];p.push(c),r.set(c.category,p)}const i=["ai","comms","infra","finance","saas","other"].map(c=>m(c,r.get(c)??[])).join(""),l=s.projection_end_month_eur-s.total_month_eur;d(a,`
    <div class="ax-fin-dashboard">
      <header class="ax-fin-hero">
        <h1>💰 Bilan Apex Live</h1>
        <p class="ax-fin-subtitle">${new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
      </header>

      <!-- 🔥 Burn rate live -->
      <section class="ax-fin-burn">
        <div class="ax-fin-burn-card pulse">
          <span class="ax-fin-burn-icon">🔥</span>
          <div>
            <div class="ax-fin-burn-label">Burn rate live</div>
            <div class="ax-fin-burn-values">
              <span class="ax-fin-burn-val"><strong>${n.formatEur(s.burn_rate.per_hour_eur)}</strong>/h</span>
              <span class="ax-fin-burn-val"><strong>${n.formatEur(s.burn_rate.per_day_eur)}</strong>/jour</span>
              <span class="ax-fin-burn-val"><strong>${n.formatEur(s.burn_rate.per_month_extrapolated_eur)}</strong>/mois (extrapolé)</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 💸 KPIs principaux -->
      <section class="ax-fin-kpis">
        <div class="ax-fin-kpi">
          <span class="ax-fin-kpi-label">Aujourd'hui</span>
          <span class="ax-fin-kpi-value">${n.formatEur(s.total_today_eur)}</span>
        </div>
        <div class="ax-fin-kpi">
          <span class="ax-fin-kpi-label">Ce mois</span>
          <span class="ax-fin-kpi-value">${n.formatEur(s.total_month_eur)}</span>
          <span class="ax-fin-kpi-sub">/ ${n.formatEur(s.total_budget_month_eur)} budget</span>
        </div>
        <div class="ax-fin-kpi">
          <span class="ax-fin-kpi-label">Projection fin mois</span>
          <span class="ax-fin-kpi-value">${n.formatEur(s.projection_end_month_eur)}</span>
          <span class="ax-fin-kpi-sub">+${n.formatEur(l)}</span>
        </div>
        <div class="ax-fin-kpi ax-fin-kpi-savings">
          <span class="ax-fin-kpi-label">💚 Économisé free-first</span>
          <span class="ax-fin-kpi-value">${n.formatEur(s.free_savings_month_eur)}</span>
          <span class="ax-fin-kpi-sub">vs tout payant Anthropic</span>
        </div>
      </section>

      <!-- 📈 Sparkline 30 derniers jours -->
      <section class="ax-fin-graphs">
        <div class="ax-fin-graph-card">
          <h3>📈 Tendance 30 jours</h3>
          ${f(e)}
        </div>
        <div class="ax-fin-graph-card">
          <h3>🌡️ Heatmap 24h (sur 7 derniers jours)</h3>
          ${x(t)}
          <div class="ax-fin-heatmap-axis">
            <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
          </div>
        </div>
      </section>

      <!-- 📊 Services par catégorie -->
      ${i}

      <!-- 💰 ROI commercialisation -->
      ${h(s.roi)}

      <!-- 💎 Vs concurrence -->
      ${g(s.comparison_vs_competition)}

      <!-- État global -->
      <footer class="ax-fin-footer">
        <span class="ax-fin-health">${s.health_emoji} ${s.alerts_count} services en alerte</span>
        <span class="ax-fin-updated">Mis à jour : ${new Date().toLocaleTimeString("fr-FR")}</span>
      </footer>
    </div>
  `)}export{y as render};
