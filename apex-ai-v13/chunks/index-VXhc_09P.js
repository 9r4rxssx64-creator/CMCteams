import{c as $}from"./listener-cleanup-Y2rGGxxX.js";import{l as f}from"./monitoring-3uBGKGRH.js";import{s as w}from"../core/main-CYB7Rsj0.js";import{apexAutonomousMode as p}from"./apex-autonomous-mode-CnZ7RSs-.js";import{autonomousWatch as h}from"./autonomous-watch-BAP1IrVF.js";import{haptic as z}from"./haptic-CQFg2PXZ.js";import{toast as n}from"./toast-ClsF1KRZ.js";import"./apex-kb-DTORcG7W.js";import"./credential-patterns-D-srKehy.js";import"./multi-source-analyze-nznJbtVo.js";import"./ai-router-DcT5BpYF.js";import"./chat-fallback-C8xLrhB_.js";import"./voice-Cz1stUlm.js";import"./tokens-dashboard-C5ZzZyK6.js";import"./firebase-queue-3bVGZkXE.js";let l=null,i=null;function K(){i&&(clearInterval(i),i=null),l?.cleanup(),l=null}function s(t){return t.replace(/[&<>"']/g,o=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[o]??o)}function y(t){const e={running:{color:"#0a0",bg:"rgba(60,200,80,0.18)",emoji:"🟢"},paused:{color:"#cc9000",bg:"rgba(255,200,60,0.15)",emoji:"⏸"},stopped:{color:"#aaa",bg:"rgba(255,255,255,0.08)",emoji:"🛑"},quota_exhausted:{color:"#c50",bg:"rgba(220,90,30,0.15)",emoji:"🪫"},completed:{color:"#08c",bg:"rgba(70,140,210,0.15)",emoji:"🏁"},failed:{color:"#c33",bg:"rgba(220,60,60,0.15)",emoji:"❌"}}[t];return`<span class="ax-badge" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:14px;background:${e.bg};color:${e.color};font-weight:600;font-size:12px">${e.emoji} ${t}</span>`}function A(t){if(!t)return`
      <div class="ax-card" style="padding:18px;border-radius:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);text-align:center">
        <p style="font-size:48px;margin:0 0 8px">💤</p>
        <h3 style="margin:0 0 6px;color:rgba(255,255,255,0.85)">Aucune session active</h3>
        <p class="ax-muted" style="font-size:13px;color:rgba(255,255,255,0.55)">Lance le mode autonome dans le chat avec <code style="background:rgba(255,255,255,0.06);padding:2px 6px;border-radius:6px">/autonomous &lt;objectif&gt;</code></p>
      </div>
    `;const o=t.tasksCompleted.filter(r=>r.status==="done").length,e=t.tasksCompleted.filter(r=>r.status==="failed").length,a=Math.round((Date.now()-t.startedAt)/6e4),g=t.maxIterations??50,x=t.quotaLimit??5e4,c=Math.min(100,Math.round(t.tokensConsumed/x*100)),v=Math.min(100,Math.round(t.iterations/g*100));return`
    <div class="ax-card" data-session-id="${s(t.id)}" style="padding:18px;border-radius:16px;background:linear-gradient(135deg,rgba(232,184,48,0.08),rgba(60,200,80,0.04));border:1px solid rgba(232,184,48,0.18)">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px">
        <h3 style="margin:0;font-size:15px;color:rgba(255,255,255,0.9)">🤖 Session active</h3>
        ${y(t.status)}
      </div>
      <p style="margin:0 0 12px;color:rgba(255,255,255,0.85);font-size:14px;line-height:1.5">${s(t.initialObjective.slice(0,400))}</p>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:14px">
        <div style="padding:10px;background:rgba(0,0,0,0.25);border-radius:10px">
          <p style="margin:0;font-size:11px;text-transform:uppercase;color:rgba(255,255,255,0.5);letter-spacing:0.5px">Durée</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#e8b830">${a} min</p>
        </div>
        <div style="padding:10px;background:rgba(0,0,0,0.25);border-radius:10px">
          <p style="margin:0;font-size:11px;text-transform:uppercase;color:rgba(255,255,255,0.5);letter-spacing:0.5px">Itérations</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:700">${t.iterations}/${g}</p>
          <div style="height:4px;background:rgba(255,255,255,0.08);border-radius:2px;margin-top:6px;overflow:hidden"><div style="width:${v}%;background:#e8b830;height:100%"></div></div>
        </div>
        <div style="padding:10px;background:rgba(0,0,0,0.25);border-radius:10px">
          <p style="margin:0;font-size:11px;text-transform:uppercase;color:rgba(255,255,255,0.5);letter-spacing:0.5px">Tokens</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:700">${t.tokensConsumed}</p>
          <div style="height:4px;background:rgba(255,255,255,0.08);border-radius:2px;margin-top:6px;overflow:hidden"><div style="width:${c}%;background:${c>80?"#c50":"#3cc"};height:100%"></div></div>
        </div>
        <div style="padding:10px;background:rgba(0,0,0,0.25);border-radius:10px">
          <p style="margin:0;font-size:11px;text-transform:uppercase;color:rgba(255,255,255,0.5);letter-spacing:0.5px">Tâches</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:700">✅ ${o} <span style="font-size:13px;color:#c33">❌ ${e}</span></p>
          <p style="margin:2px 0 0;font-size:11px;color:rgba(255,255,255,0.55)">📋 ${t.taskQueue.length} en queue</p>
        </div>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
        ${t.status==="running"?'<button class="ax-btn" data-action="pause" style="min-height:44px;padding:10px 18px;border-radius:22px;background:rgba(255,200,60,0.18);color:#e8b830;border:1px solid rgba(232,184,48,0.3);font-weight:600;cursor:pointer">⏸ Pauser</button>':t.status==="paused"?'<button class="ax-btn" data-action="resume" style="min-height:44px;padding:10px 18px;border-radius:22px;background:rgba(60,200,80,0.18);color:#3c8;border:1px solid rgba(60,200,80,0.3);font-weight:600;cursor:pointer">▶️ Reprendre</button>':""}
        <button class="ax-btn" data-action="stop" style="min-height:44px;padding:10px 18px;border-radius:22px;background:rgba(220,60,60,0.18);color:#c33;border:1px solid rgba(220,60,60,0.3);font-weight:600;cursor:pointer">🛑 Stop</button>
        <button class="ax-btn" data-action="force-tick" style="min-height:44px;padding:10px 18px;border-radius:22px;background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.85);border:1px solid rgba(255,255,255,0.1);font-weight:600;cursor:pointer">⚡ Forcer tick</button>
      </div>

      <details style="margin-top:8px">
        <summary style="cursor:pointer;font-weight:600;color:rgba(255,255,255,0.75);padding:8px 0;font-size:13px">📜 Logs récents (${t.logs.length})</summary>
        <div style="max-height:260px;overflow-y:auto;background:rgba(0,0,0,0.35);border-radius:10px;padding:10px;margin-top:6px;font-family:ui-monospace,monospace;font-size:11.5px;line-height:1.5">
          ${t.logs.slice(-15).reverse().map(r=>{const u=new Date(r.ts).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});return`<div style="color:${r.level==="error"?"#f66":r.level==="warn"?"#fc6":"rgba(200,220,200,0.85)"};margin-bottom:2px"><span style="color:rgba(255,255,255,0.4)">${u}</span> ${s(r.msg)}</div>`}).join("")||'<em style="color:rgba(255,255,255,0.5)">aucun log</em>'}
        </div>
      </details>

      <details style="margin-top:8px">
        <summary style="cursor:pointer;font-weight:600;color:rgba(255,255,255,0.75);padding:8px 0;font-size:13px">📋 Queue (${t.taskQueue.length}) + Faites (${t.tasksCompleted.length})</summary>
        <div style="background:rgba(0,0,0,0.35);border-radius:10px;padding:10px;margin-top:6px">
          <h4 style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.7)">À faire</h4>
          ${t.taskQueue.length===0?'<em style="color:rgba(255,255,255,0.5);font-size:12px">queue vide</em>':t.taskQueue.map(r=>`<div style="padding:6px 8px;background:rgba(255,255,255,0.04);border-radius:6px;margin-bottom:4px;font-size:12px;color:rgba(255,255,255,0.85)">⏳ ${s(r.description.slice(0,180))}</div>`).join("")}
          <h4 style="margin:10px 0 6px;font-size:12px;color:rgba(255,255,255,0.7)">Faites (${t.tasksCompleted.length})</h4>
          ${t.tasksCompleted.slice(-8).reverse().map(r=>{const u=r.status==="done"?"✅":"❌";return`<div style="padding:6px 8px;background:rgba(0,0,0,0.2);border-radius:6px;margin-bottom:4px;font-size:12px;color:${r.status==="done"?"rgba(200,255,200,0.85)":"#f66"}">${u} ${s(r.description.slice(0,180))}</div>`}).join("")||'<em style="color:rgba(255,255,255,0.5);font-size:12px">aucune</em>'}
        </div>
      </details>
    </div>
  `}function j(){const t=p.getHistory(10);if(t.length===0)return"";const o=t.map(e=>{const a=Math.round((Date.now()-e.startedAt)/36e5),g=e.endedAt?Math.round((e.endedAt-e.startedAt)/6e4):null,x=e.tasksCompleted.filter(c=>c.status==="done").length;return`<tr>
        <td style="padding:8px 6px">${y(e.status)}</td>
        <td style="padding:8px 6px;font-size:12px;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s(e.initialObjective.slice(0,120))}</td>
        <td style="padding:8px 6px;font-size:11px;color:rgba(255,255,255,0.6)">il y a ${a}h</td>
        <td style="padding:8px 6px;font-size:11px;text-align:right">${x}/${e.iterations}</td>
        <td style="padding:8px 6px;font-size:11px;text-align:right">${e.tokensConsumed}</td>
        <td style="padding:8px 6px;font-size:11px;text-align:right">${g??"–"} min</td>
      </tr>`}).join("");return`
    <details style="margin-top:14px" open>
      <summary style="cursor:pointer;font-weight:600;color:rgba(255,255,255,0.85);padding:10px 0;font-size:14px">📚 Historique (${t.length})</summary>
      <div style="overflow-x:auto;background:rgba(0,0,0,0.25);border-radius:12px;margin-top:6px">
        <table style="width:100%;border-collapse:collapse;font-size:12px;color:rgba(255,255,255,0.85)">
          <thead>
            <tr style="text-align:left;background:rgba(255,255,255,0.04)">
              <th style="padding:8px 6px">Statut</th>
              <th style="padding:8px 6px">Objectif</th>
              <th style="padding:8px 6px">Quand</th>
              <th style="padding:8px 6px;text-align:right">Fait</th>
              <th style="padding:8px 6px;text-align:right">Tokens</th>
              <th style="padding:8px 6px;text-align:right">Durée</th>
            </tr>
          </thead>
          <tbody>${o}</tbody>
        </table>
      </div>
    </details>
  `}function S(){const t=h.getStats(),o=t.lastTickAt?Math.round((Date.now()-t.lastTickAt)/1e3)+"s":"–";return`
    <div class="ax-card" style="padding:12px 14px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);margin-top:12px;display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:rgba(255,255,255,0.7)">
      <span><strong style="color:${t.active?"#3c8":"#c33"}">Sentinelle</strong> : ${t.active?"🟢 active":"🔴 stop"}</span>
      <span><strong>Ticks</strong> : ${t.tickCount}</span>
      <span><strong>Dernier tick</strong> : ${o}</span>
    </div>
  `}function b(){const t=p.getActiveSession();return`
    <div style="padding:14px;max-width:920px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <button class="ax-btn" data-action="back" style="min-height:44px;min-width:44px;padding:8px 14px;border-radius:22px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.85);border:1px solid rgba(255,255,255,0.1);font-weight:600;cursor:pointer">← Admin</button>
        <h2 style="margin:0;font-size:20px;color:rgba(255,255,255,0.95);flex:1">🤖 Mode Autonome Apex</h2>
        <button class="ax-btn" data-action="refresh" style="min-height:44px;min-width:44px;padding:8px 12px;border-radius:22px;background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.08);font-weight:600;cursor:pointer" title="Rafraîchir">🔄</button>
      </div>
      <p class="ax-muted" style="color:rgba(255,255,255,0.55);font-size:13px;margin:0 0 14px">Apex bosse seul jusqu'à fin objectif ou épuisement forfait Anthropic.</p>

      ${A(t)}
      ${S()}
      ${j()}
    </div>
  `}function m(t){t.querySelectorAll("[data-action]").forEach(o=>{l.bind(o,"click",async()=>{z.tap();const e=o.dataset.action??"";try{if(e==="back")window.location.hash="#admin";else if(e==="refresh")d(t),n.info("Rafraîchi");else if(e==="stop"){if(!confirm("Arrêter le mode autonome ?"))return;p.stop(void 0,"admin-ui-stop"),n.success("🛑 Session arrêtée"),d(t)}else e==="pause"?(p.pause(),n.info("⏸ Session pausée"),d(t)):e==="resume"?(p.resume(),n.success("▶️ Session reprise"),d(t)):e==="force-tick"&&(n.info("⚡ Tick forcé…"),await h.forceTick(),d(t))}catch(a){f.warn("admin-autonomous",`action ${e} failed`,{err:a}),n.error(`Erreur : ${a instanceof Error?a.message:String(a)}`)}})})}function d(t){if(l?.cleanup(),l=$("admin-autonomous"),!w.get("isAdmin")){t.innerHTML=`
      <div class="ax-empty" style="padding:40px 20px;text-align:center;color:rgba(255,255,255,0.6)">
        <h2>Accès réservé</h2>
        <p>Cette section est réservée à l'admin Kevin.</p>
      </div>
    `;return}t.innerHTML=b(),m(t),i&&(clearInterval(i),i=null);const e=p.getActiveSession();e&&(e.status==="running"||e.status==="paused")&&(i=setInterval(()=>{try{t.innerHTML=b(),m(t)}catch(a){f.warn("admin-autonomous","auto-refresh failed",{err:a})}},5e3))}export{K as dispose,d as render};
