import{commerce as x}from"./commerce-C9zmD3_c.js";import{consumptionMonitor as v}from"./consumption-monitor-B6xGqavI.js";import{tokensDashboard as _}from"./tokens-dashboard-C5ZzZyK6.js";import"../core/main-BSLFHN2z.js";import"./audit-log-BmtV8LrZ.js";import"./links-registry-BHGHWwme.js";import"./firebase-DEwb8sja.js";import"./push-notifications-CnEDBM4p.js";const b=[{tool:"ChatGPT Plus",their_price_eur:20,apex_advantage:"Multi-IA + studios + 100% own data"},{tool:"Cursor Pro",their_price_eur:20,apex_advantage:"Multi-domain + français + voice"},{tool:"Claude Pro",their_price_eur:20,apex_advantage:"Failover 5 providers + offline"},{tool:"Notion AI",their_price_eur:10,apex_advantage:"Mémoire augmentée parité Claude Code"},{tool:"Perplexity Pro",their_price_eur:20,apex_advantage:"Search + chat + studios + admin"},{tool:"GitHub Copilot",their_price_eur:19,apex_advantage:"Code + tout le reste"}],$={anthropic:"ai",openai:"ai",groq:"ai",gemini:"ai",openrouter:"ai",cohere:"ai",mistral:"ai",deepseek:"ai",perplexity:"ai",elevenlabs:"ai",replicate:"ai",stripe:"finance",finnhub:"finance",brevo:"comms",resend:"comms",sendgrid:"comms",twilio:"comms",telegram:"comms",github:"infra",cloudflare:"infra",vercel:"infra",netlify:"infra",railway:"infra",deepl:"ai"},y={anthropic:"🟧",openai:"🟦",groq:"🟪",gemini:"🟨",openrouter:"🟫",cohere:"🟩",mistral:"🟥",deepseek:"🟦",perplexity:"🔍",stripe:"💳",brevo:"✉️",resend:"📧",cloudflare:"☁️",github:"🐙",twilio:"📱",telegram:"✈️",elevenlabs:"🎙️",replicate:"🎨",deepl:"🌐",finnhub:"📈"};class k{computeBurnRate(){const n=Date.now()-1440*60*1e3;let s=0;try{const c=["anthropic","openai","groq","gemini","openrouter","cohere","mistral","deepseek","perplexity"];for(const p of c){const d=_.getStats(p);for(const f of d)f.last_request_ts>=n&&(s+=f.cost_usd*.92)}}catch{}const r=s,a=r/24,o=a/60,i=r*7,u=r*30;return{per_minute_eur:o,per_hour_eur:a,per_day_eur:r,per_week_eur:i,per_month_extrapolated_eur:u}}getServiceLines(){const e=v.getAllStatuses(),s=Date.now()-864e5,r=[];for(const a of e){const o=_.getStats(a.service),i=o.reduce((d,f)=>d+f.cost_usd*.92,0),u=o.filter(d=>d.last_request_ts>=s).reduce((d,f)=>d+f.cost_usd*.92,0),c=v.getHistory(a.service,7);let p="stable";if(c.length>=4){const d=Math.floor(c.length/2),f=c.slice(0,d).reduce((m,h)=>m+h.used_eur,0),g=c.slice(d).reduce((m,h)=>m+h.used_eur,0);g>f*1.2?p="up":g<f*.8&&(p="down")}r.push({service:a.service,category:$[a.service]??"other",used_eur_today:u,used_eur_month:a.used_eur_current_period,used_eur_total:i,budget_eur_month:a.budget_eur_month,pct_budget:a.pct_used,is_free_tier:a.budget_eur_month===0&&a.used_eur_current_period===0,status:a.severity,trend_7d:p,emoji:y[a.service]??"⚙️"})}return r}computeFreeSavings(){const e=this.getServiceLines();let n=0;for(const s of e)if(["groq","gemini","openrouter","deepseek"].includes(s.service)){const a=_.getStats(s.service).reduce((o,i)=>o+i.input_tokens+i.output_tokens,0);n+=a/1e6*8}return n}computeProjectionEndMonth(){const e=new Date,n=new Date(e.getFullYear(),e.getMonth()+1,0),s=Math.max(0,(n.getTime()-e.getTime())/864e5),r=this.computeBurnRate();return this.getServiceLines().reduce((i,u)=>i+u.used_eur_month,0)+r.per_day_eur*s}computeROI(){let e=0;try{const c=localStorage.getItem("apex_v13_users"),p=JSON.parse(c??"[]");for(const d of p)d.id&&d.tier&&d.tier!=="free"&&x.getEffectivePlan(d.id)!=="free"&&e++}catch{}const n=19,s=e*n,a=this.getServiceLines().reduce((c,p)=>c+p.used_eur_month,0),o=s-a,i=s>0?Math.round(o/s*100):0,u=Math.ceil(a/n);return{paying_users:e,monthly_revenue_eur:s,monthly_cost_eur:a,monthly_profit_eur:o,margin_pct:i,breakeven_users:u}}getSummary(){const e=this.getServiceLines(),n=this.computeBurnRate(),s=e.reduce((c,p)=>c+p.used_eur_today,0),r=e.reduce((c,p)=>c+p.used_eur_month,0),a=e.reduce((c,p)=>c+p.budget_eur_month,0),o=a>0?Math.round(r/a*100):0,i=e.filter(c=>c.status!=="ok"&&c.budget_eur_month>0).length,u=i===0?"✅":i<=2?"⚠️":"🚨";return{total_today_eur:s,total_month_eur:r,total_budget_month_eur:a,total_pct_budget:o,burn_rate:n,services:e,free_savings_month_eur:this.computeFreeSavings(),projection_end_month_eur:this.computeProjectionEndMonth(),comparison_vs_competition:b,roi:this.computeROI(),alerts_count:i,health_emoji:u}}getHourlyHeatmap(){const e=Array.from({length:24},()=>0);try{const n=Date.now()-6048e5,s=["anthropic","openai","groq","gemini"];for(const r of s){const a=_.getStats(r);for(const o of a)if(o.last_request_ts>=n){const i=new Date(o.last_request_ts).getHours(),u=e[i];typeof u=="number"&&(e[i]=u+o.cost_usd*.92)}}}catch{}return e}getSparklineMonth(){const e=v.getHistory(void 0,30);if(e.length===0)return[];const n=Math.max(1,Math.floor(e.length/8)),s=[];for(let r=0;r<e.length;r+=n){const a=e[r];a&&s.push({ts:a.ts,eur:a.used_eur})}return s.slice(0,8)}formatEur(e){return e<.01?"< 0.01€":e<1?`${(e*100).toFixed(1)}c`:e<10?`${e.toFixed(2)}€`:`${e.toFixed(0)}€`}executiveSummary(){const e=this.getSummary();return[`💰 BILAN APEX ${new Date().toLocaleDateString("fr-FR")}`,"",`Aujourd'hui : ${this.formatEur(e.total_today_eur)}`,`Ce mois : ${this.formatEur(e.total_month_eur)} / ${this.formatEur(e.total_budget_month_eur)} budget (${e.total_pct_budget}%)`,`Projection fin mois : ${this.formatEur(e.projection_end_month_eur)}`,"",`🔥 Burn rate : ${this.formatEur(e.burn_rate.per_hour_eur)}/h, ${this.formatEur(e.burn_rate.per_day_eur)}/jour`,`💸 Économisé via free-first : ${this.formatEur(e.free_savings_month_eur)}`,"",`📊 ROI : ${e.roi.paying_users} users payants, ${this.formatEur(e.roi.monthly_revenue_eur)} revenu, ${this.formatEur(e.roi.monthly_profit_eur)} profit (${e.roi.margin_pct}%)`,`🎯 Break-even : ${e.roi.breakeven_users} users payants pour couvrir`,"",`${e.health_emoji} ${e.alerts_count} services en alerte`].join(`
`)}}const l=new k,E={ai:"🧠 Intelligence Artificielle",saas:"💼 SaaS",comms:"✉️ Communications",infra:"☁️ Infrastructure",finance:"💳 Finance & Paiements",other:"🔧 Autres"};function w(t){if(t.length<2)return'<span class="ax-spark-empty">—</span>';const e=Math.max(...t.map(o=>o.eur),1),n=120,s=32,r=n/(t.length-1),a=t.map((o,i)=>`${i===0?"M":"L"}${(i*r).toFixed(1)} ${(s-o.eur/e*s).toFixed(1)}`).join(" ");return`
    <svg class="ax-sparkline" viewBox="0 0 ${n} ${s}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="${a}" fill="none" stroke="#c9a227" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${a} L${n} ${s} L0 ${s} Z" fill="rgba(201,162,39,0.15)"/>
    </svg>
  `}function S(t){const e=Math.max(...t,.01);return`<div class="ax-heatmap-24h" aria-label="Heatmap 24h">${t.map((s,r)=>`<div class="ax-heat-cell" style="background:rgba(201,162,39,${(.1+s/e*.9).toFixed(2)})" title="${r}h : ${s.toFixed(2)}€" aria-label="${r}h"></div>`).join("")}</div>`}function M(t){const e=t.trend_7d==="up"?"↗":t.trend_7d==="down"?"↘":"→",n=t.trend_7d==="up"?"trend-up":t.trend_7d==="down"?"trend-down":"trend-stable",s=t.status==="critical"?"🔴":t.status==="warn"?"🟡":"🟢",r=Math.min(100,t.pct_budget),a=t.status==="critical"?"#ff4444":t.status==="warn"?"#ffaa00":"#22cc77",o=t.is_free_tier?'<span class="ax-badge-free">FREE</span>':"";return`
    <article class="ax-fin-service-card" data-service="${t.service}" data-status="${t.status}">
      <header class="ax-fin-card-head">
        <span class="ax-fin-emoji">${t.emoji}</span>
        <span class="ax-fin-name">${t.service.toUpperCase()}</span>
        ${o}
        <span class="ax-fin-trend ${n}">${e}</span>
        <span class="ax-fin-status">${s}</span>
      </header>
      <div class="ax-fin-amounts">
        <div class="ax-fin-today">
          <span class="ax-fin-label">Aujourd'hui</span>
          <span class="ax-fin-value">${l.formatEur(t.used_eur_today)}</span>
        </div>
        <div class="ax-fin-month">
          <span class="ax-fin-label">Ce mois</span>
          <span class="ax-fin-value">${l.formatEur(t.used_eur_month)}</span>
        </div>
      </div>
      <div class="ax-fin-bar-container">
        <div class="ax-fin-bar-bg">
          <div class="ax-fin-bar-fill" style="width:${r}%;background:${a}"></div>
        </div>
        <span class="ax-fin-bar-pct">${t.pct_budget}%</span>
      </div>
      <div class="ax-fin-budget-label">Budget : ${l.formatEur(t.budget_eur_month)}/mois</div>
    </article>
  `}function j(t,e){if(e.length===0)return"";const n=e.reduce((s,r)=>s+r.used_eur_month,0);return`
    <section class="ax-fin-category">
      <header class="ax-fin-category-head">
        <h3>${E[t]}</h3>
        <span class="ax-fin-category-subtotal">${l.formatEur(n)}/mois</span>
      </header>
      <div class="ax-fin-cards-grid">${e.map(M).join("")}</div>
    </section>
  `}function C(t){const e=t.monthly_profit_eur>0?"profit-positive":"profit-negative";return`
    <section class="ax-fin-roi">
      <h3>💰 ROI commercialisation Apex</h3>
      <div class="ax-fin-roi-grid">
        <div class="ax-fin-roi-cell">
          <span class="ax-fin-roi-label">Users payants</span>
          <span class="ax-fin-roi-value">${t.paying_users}</span>
        </div>
        <div class="ax-fin-roi-cell">
          <span class="ax-fin-roi-label">Revenu mensuel</span>
          <span class="ax-fin-roi-value">${l.formatEur(t.monthly_revenue_eur)}</span>
        </div>
        <div class="ax-fin-roi-cell">
          <span class="ax-fin-roi-label">Coût mensuel</span>
          <span class="ax-fin-roi-value">${l.formatEur(t.monthly_cost_eur)}</span>
        </div>
        <div class="ax-fin-roi-cell ${e}">
          <span class="ax-fin-roi-label">Profit / Perte</span>
          <span class="ax-fin-roi-value">${l.formatEur(t.monthly_profit_eur)}</span>
        </div>
        <div class="ax-fin-roi-cell">
          <span class="ax-fin-roi-label">Marge</span>
          <span class="ax-fin-roi-value">${t.margin_pct}%</span>
        </div>
        <div class="ax-fin-roi-cell">
          <span class="ax-fin-roi-label">🎯 Break-even</span>
          <span class="ax-fin-roi-value">${t.breakeven_users} users</span>
        </div>
      </div>
    </section>
  `}function A(t){return`
    <section class="ax-fin-competition">
      <h3>💎 Apex vs Concurrence</h3>
      <table class="ax-comp-table">
        <thead>
          <tr><th>Concurrent</th><th>Prix</th><th>Avantage Apex</th></tr>
        </thead>
        <tbody>${t.map(n=>`
    <tr>
      <td><strong>${n.tool}</strong></td>
      <td class="ax-comp-price">${n.their_price_eur}€/mois</td>
      <td class="ax-comp-advantage">${n.apex_advantage}</td>
    </tr>
  `).join("")}</tbody>
      </table>
    </section>
  `}function O(t){const e=l.getSummary(),n=l.getSparklineMonth(),s=l.getHourlyHeatmap(),r=new Map;for(const u of e.services){const c=r.get(u.category)??[];c.push(u),r.set(u.category,c)}const o=["ai","comms","infra","finance","saas","other"].map(u=>j(u,r.get(u)??[])).join(""),i=e.projection_end_month_eur-e.total_month_eur;t.innerHTML=`
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
              <span class="ax-fin-burn-val"><strong>${l.formatEur(e.burn_rate.per_hour_eur)}</strong>/h</span>
              <span class="ax-fin-burn-val"><strong>${l.formatEur(e.burn_rate.per_day_eur)}</strong>/jour</span>
              <span class="ax-fin-burn-val"><strong>${l.formatEur(e.burn_rate.per_month_extrapolated_eur)}</strong>/mois (extrapolé)</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 💸 KPIs principaux -->
      <section class="ax-fin-kpis">
        <div class="ax-fin-kpi">
          <span class="ax-fin-kpi-label">Aujourd'hui</span>
          <span class="ax-fin-kpi-value">${l.formatEur(e.total_today_eur)}</span>
        </div>
        <div class="ax-fin-kpi">
          <span class="ax-fin-kpi-label">Ce mois</span>
          <span class="ax-fin-kpi-value">${l.formatEur(e.total_month_eur)}</span>
          <span class="ax-fin-kpi-sub">/ ${l.formatEur(e.total_budget_month_eur)} budget</span>
        </div>
        <div class="ax-fin-kpi">
          <span class="ax-fin-kpi-label">Projection fin mois</span>
          <span class="ax-fin-kpi-value">${l.formatEur(e.projection_end_month_eur)}</span>
          <span class="ax-fin-kpi-sub">+${l.formatEur(i)}</span>
        </div>
        <div class="ax-fin-kpi ax-fin-kpi-savings">
          <span class="ax-fin-kpi-label">💚 Économisé free-first</span>
          <span class="ax-fin-kpi-value">${l.formatEur(e.free_savings_month_eur)}</span>
          <span class="ax-fin-kpi-sub">vs tout payant Anthropic</span>
        </div>
      </section>

      <!-- 📈 Sparkline 30 derniers jours -->
      <section class="ax-fin-graphs">
        <div class="ax-fin-graph-card">
          <h3>📈 Tendance 30 jours</h3>
          ${w(n)}
        </div>
        <div class="ax-fin-graph-card">
          <h3>🌡️ Heatmap 24h (sur 7 derniers jours)</h3>
          ${S(s)}
          <div class="ax-fin-heatmap-axis">
            <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
          </div>
        </div>
      </section>

      <!-- 📊 Services par catégorie -->
      ${o}

      <!-- 💰 ROI commercialisation -->
      ${C(e.roi)}

      <!-- 💎 Vs concurrence -->
      ${A(e.comparison_vs_competition)}

      <!-- État global -->
      <footer class="ax-fin-footer">
        <span class="ax-fin-health">${e.health_emoji} ${e.alerts_count} services en alerte</span>
        <span class="ax-fin-updated">Mis à jour : ${new Date().toLocaleTimeString("fr-FR")}</span>
      </footer>
    </div>
  `}export{O as render};
//# sourceMappingURL=financial-bilan-Df_vLg45.js.map
