import{e as n}from"./escape-html-BlQj2yEF.js";import{c as k}from"./listener-cleanup-Y2rGGxxX.js";import{s as w,l as f}from"./monitoring-BoEKyGkX.js";import{apexAutonomousMode as d}from"./apex-autonomous-mode-Ck-idwD4.js";import{autonomousWatch as h}from"./autonomous-watch-DwtoNbp6.js";import{haptic as A}from"./haptic-CQFg2PXZ.js";import{toast as i}from"./toast-CRdbcLoc.js";import"./multi-source-analyze-QSHSuVVp.js";import"./apex-kb-BedjWJA9.js";import"./credential-patterns-CLzI061R.js";import"./ai-router-FH4K2QHN.js";import"../core/main-BsHEgYqB.js";import"./economy-mode-HubePHJd.js";import"./chat-fallback-N3Q0Mxf5.js";import"./apex-tools-dispatch-core-Cioavwg1.js";import"./apex-tools-dispatch-skills-DTw6KUz2.js";import"./apex-tools-dispatch-data-UYqfgIYx.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-DgTjKz_P.js";import"./apex-tools-misc-C0o0foCb.js";import"./apex-tools-registry-core-BMhHY4vU.js";import"./apex-tools-registry-skills-DRX4PPQ_.js";import"./firebase-queue-CREmeojw.js";let c=null,r=null;function Y(){r&&(clearInterval(r),r=null),c?.cleanup(),c=null}function v(t){const e={running:{color:"#0a0",bg:"rgba(60,200,80,0.18)",emoji:"🟢"},paused:{color:"#cc9000",bg:"rgba(255,200,60,0.15)",emoji:"⏸"},stopped:{color:"#aaa",bg:"rgba(255,255,255,0.08)",emoji:"🛑"},quota_exhausted:{color:"#c50",bg:"rgba(220,90,30,0.15)",emoji:"🪫"},completed:{color:"#08c",bg:"rgba(70,140,210,0.15)",emoji:"🏁"},failed:{color:"#c33",bg:"rgba(220,60,60,0.15)",emoji:"❌"}}[t];return`<span class="ax-badge" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:14px;background:${e.bg};color:${e.color};font-weight:600;font-size:12px">${e.emoji} ${t}</span>`}function z(t){if(!t)return`
      <div class="ax-card" style="padding:18px;border-radius:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);text-align:center">
        <p style="font-size:48px;margin:0 0 8px">💤</p>
        <h3 style="margin:0 0 6px;color:rgba(255,255,255,0.85)">Aucune session active</h3>
        <p class="ax-muted" style="font-size:13px;color:rgba(255,255,255,0.55)">Lance le mode autonome dans le chat avec <code style="background:rgba(255,255,255,0.06);padding:2px 6px;border-radius:6px">/autonomous &lt;objectif&gt;</code></p>
      </div>
    `;const s=t.tasksCompleted.filter(a=>a.status==="done").length,e=t.tasksCompleted.filter(a=>a.status==="failed").length,o=Math.round((Date.now()-t.startedAt)/6e4),l=t.maxIterations??50,u=t.quotaLimit??5e4,g=Math.min(100,Math.round(t.tokensConsumed/u*100)),y=Math.min(100,Math.round(t.iterations/l*100));return`
    <div class="ax-card" data-session-id="${n(t.id)}" style="padding:18px;border-radius:16px;background:linear-gradient(135deg,rgba(232,184,48,0.08),rgba(60,200,80,0.04));border:1px solid rgba(232,184,48,0.18)">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px">
        <h3 style="margin:0;font-size:15px;color:rgba(255,255,255,0.9)">🤖 Session active</h3>
        ${v(t.status)}
      </div>
      <p style="margin:0 0 12px;color:rgba(255,255,255,0.85);font-size:14px;line-height:1.5">${n(t.initialObjective.slice(0,400))}</p>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:14px">
        <div class="ax-gs-38">
          <p class="ax-gs-273">Durée</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#e8b830">${o} min</p>
        </div>
        <div class="ax-gs-38">
          <p class="ax-gs-273">Itérations</p>
          <p class="ax-gs-274">${t.iterations}/${l}</p>
          <div class="ax-gs-90"><div style="width:${y}%;background:#e8b830;height:100%"></div></div>
        </div>
        <div class="ax-gs-38">
          <p class="ax-gs-273">Tokens</p>
          <p class="ax-gs-274">${t.tokensConsumed}</p>
          <div class="ax-gs-90"><div style="width:${g}%;background:${g>80?"#c50":"#3cc"};height:100%"></div></div>
        </div>
        <div class="ax-gs-38">
          <p class="ax-gs-273">Tâches</p>
          <p class="ax-gs-274">✅ ${s} <span style="font-size:13px;color:#c33">❌ ${e}</span></p>
          <p style="margin:2px 0 0;font-size:11px;color:rgba(255,255,255,0.55)">📋 ${t.taskQueue.length} en queue</p>
        </div>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
        ${t.status==="running"?'<button class="ax-btn" data-action="pause" style="min-height:44px;padding:10px 18px;border-radius:22px;background:rgba(255,200,60,0.18);color:#e8b830;border:1px solid rgba(232,184,48,0.3);font-weight:600;cursor:pointer">⏸ Pauser</button>':t.status==="paused"?'<button class="ax-btn" data-action="resume" style="min-height:44px;padding:10px 18px;border-radius:22px;background:rgba(60,200,80,0.18);color:#3c8;border:1px solid rgba(60,200,80,0.3);font-weight:600;cursor:pointer">▶️ Reprendre</button>':""}
        <button class="ax-btn" data-action="stop" style="min-height:44px;padding:10px 18px;border-radius:22px;background:rgba(220,60,60,0.18);color:#c33;border:1px solid rgba(220,60,60,0.3);font-weight:600;cursor:pointer">🛑 Stop</button>
        <button class="ax-btn" data-action="force-tick" style="min-height:44px;padding:10px 18px;border-radius:22px;background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.85);border:1px solid rgba(255,255,255,0.1);font-weight:600;cursor:pointer">⚡ Forcer tick</button>
      </div>

      <details class="ax-gs-186">
        <summary class="ax-gs-275">📜 Logs récents (${t.logs.length})</summary>
        <div style="max-height:260px;overflow-y:auto;background:rgba(0,0,0,0.35);border-radius:10px;padding:10px;margin-top:6px;font-family:ui-monospace,monospace;font-size:11.5px;line-height:1.5">
          ${t.logs.slice(-15).reverse().map(a=>{const x=new Date(a.ts).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});return`<div style="color:${a.level==="error"?"#f66":a.level==="warn"?"#fc6":"rgba(200,220,200,0.85)"};margin-bottom:2px"><span class="ax-gs-91">${x}</span> ${n(a.msg)}</div>`}).join("")||'<em style="color:rgba(255,255,255,0.5)">aucun log</em>'}
        </div>
      </details>

      <details class="ax-gs-186">
        <summary class="ax-gs-275">📋 Queue (${t.taskQueue.length}) + Faites (${t.tasksCompleted.length})</summary>
        <div style="background:rgba(0,0,0,0.35);border-radius:10px;padding:10px;margin-top:6px">
          <h4 style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.7)">À faire</h4>
          ${t.taskQueue.length===0?'<em class="ax-gs-183">queue vide</em>':t.taskQueue.map(a=>`<div style="padding:6px 8px;background:rgba(255,255,255,0.04);border-radius:6px;margin-bottom:4px;font-size:12px;color:rgba(255,255,255,0.85)">⏳ ${n(a.description.slice(0,180))}</div>`).join("")}
          <h4 style="margin:10px 0 6px;font-size:12px;color:rgba(255,255,255,0.7)">Faites (${t.tasksCompleted.length})</h4>
          ${t.tasksCompleted.slice(-8).reverse().map(a=>{const x=a.status==="done"?"✅":"❌";return`<div style="padding:6px 8px;background:rgba(0,0,0,0.2);border-radius:6px;margin-bottom:4px;font-size:12px;color:${a.status==="done"?"rgba(200,255,200,0.85)":"#f66"}">${x} ${n(a.description.slice(0,180))}</div>`}).join("")||'<em class="ax-gs-183">aucune</em>'}
        </div>
      </details>
    </div>
  `}function j(){const t=d.getHistory(10);if(t.length===0)return"";const s=t.map(e=>{const o=Math.round((Date.now()-e.startedAt)/36e5),l=e.endedAt?Math.round((e.endedAt-e.startedAt)/6e4):null,u=e.tasksCompleted.filter(g=>g.status==="done").length;return`<tr>
        <td class="ax-gs-276">${v(e.status)}</td>
        <td style="padding:8px 6px;font-size:12px;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${n(e.initialObjective.slice(0,120))}</td>
        <td style="padding:8px 6px;font-size:11px;color:rgba(255,255,255,0.6)">il y a ${o}h</td>
        <td class="ax-gs-277">${u}/${e.iterations}</td>
        <td class="ax-gs-277">${e.tokensConsumed}</td>
        <td class="ax-gs-277">${l??"–"} min</td>
      </tr>`}).join("");return`
    <details class="ax-gs-187" open>
      <summary style="cursor:pointer;font-weight:600;color:rgba(255,255,255,0.85);padding:10px 0;font-size:14px">📚 Historique (${t.length})</summary>
      <div style="overflow-x:auto;background:rgba(0,0,0,0.25);border-radius:12px;margin-top:6px">
        <table style="width:100%;border-collapse:collapse;font-size:12px;color:rgba(255,255,255,0.85)">
          <thead>
            <tr style="text-align:left;background:rgba(255,255,255,0.04)">
              <th class="ax-gs-276">Statut</th>
              <th class="ax-gs-276">Objectif</th>
              <th class="ax-gs-276">Quand</th>
              <th class="ax-gs-278">Fait</th>
              <th class="ax-gs-278">Tokens</th>
              <th class="ax-gs-278">Durée</th>
            </tr>
          </thead>
          <tbody>${s}</tbody>
        </table>
      </div>
    </details>
  `}function S(){const t=h.getStats(),s=t.lastTickAt?Math.round((Date.now()-t.lastTickAt)/1e3)+"s":"–";return`
    <div class="ax-card" style="padding:12px 14px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);margin-top:12px;display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:rgba(255,255,255,0.7)">
      <span><strong style="color:${t.active?"#3c8":"#c33"}">Sentinelle</strong> : ${t.active?"🟢 active":"🔴 stop"}</span>
      <span><strong>Ticks</strong> : ${t.tickCount}</span>
      <span><strong>Dernier tick</strong> : ${s}</span>
    </div>
  `}function m(){const t=d.getActiveSession();return`
    <div style="padding:14px;max-width:920px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <button class="ax-btn" data-action="back" style="min-height:44px;min-width:44px;padding:8px 14px;border-radius:22px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.85);border:1px solid rgba(255,255,255,0.1);font-weight:600;cursor:pointer">← Admin</button>
        <h2 style="margin:0;font-size:20px;color:rgba(255,255,255,0.95);flex:1">🤖 Mode Autonome Apex</h2>
        <button class="ax-btn" data-action="refresh" style="min-height:44px;min-width:44px;padding:8px 12px;border-radius:22px;background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.08);font-weight:600;cursor:pointer" title="Rafraîchir">🔄</button>
      </div>
      <p class="ax-muted" style="color:rgba(255,255,255,0.55);font-size:13px;margin:0 0 14px">Apex bosse seul jusqu'à fin objectif ou épuisement forfait Anthropic.</p>

      ${z(t)}
      ${S()}
      ${j()}
    </div>
  `}function b(t){t.querySelectorAll("[data-action]").forEach(s=>{c.bind(s,"click",async()=>{A.tap();const e=s.dataset.action??"";try{if(e==="back")window.location.hash="#admin";else if(e==="refresh")p(t),i.info("Rafraîchi");else if(e==="stop"){if(!confirm("Arrêter le mode autonome ?"))return;d.stop(void 0,"admin-ui-stop"),i.success("🛑 Session arrêtée"),p(t)}else e==="pause"?(d.pause(),i.info("⏸ Session pausée"),p(t)):e==="resume"?(d.resume(),i.success("▶️ Session reprise"),p(t)):e==="force-tick"&&(i.info("⚡ Tick forcé…"),await h.forceTick(),p(t))}catch(o){f.warn("admin-autonomous",`action ${e} failed`,{err:o}),i.error(`Erreur : ${o instanceof Error?o.message:String(o)}`)}})})}function p(t){if(c?.cleanup(),c=k("admin-autonomous"),!w.get("isAdmin")){t.innerHTML=`
      <div class="ax-empty ax-gs-188">
        <h2>Accès réservé</h2>
        <p>Cette section est réservée à l'admin Kevin.</p>
      </div>
    `;return}t.innerHTML=m(),b(t),r&&(clearInterval(r),r=null);const e=d.getActiveSession();e&&(e.status==="running"||e.status==="paused")&&(r=setInterval(()=>{try{t.innerHTML=m(),b(t)}catch(o){f.warn("admin-autonomous","auto-refresh failed",{err:o})}},5e3))}export{Y as dispose,p as render};
