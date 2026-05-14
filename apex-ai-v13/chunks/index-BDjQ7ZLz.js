import{c as u}from"./listener-cleanup-Y2rGGxxX.js";import{l as d}from"./monitoring-3uBGKGRH.js";import{s as b}from"../core/main-BJbWmkMF.js";import{autoRestoreCredentials as l}from"./auto-restore-credentials-CjiyGcHY.js";import{haptic as g}from"./haptic-CQFg2PXZ.js";import{toast as n}from"./toast-ClsF1KRZ.js";import"./apex-kb-CJmI_ifh.js";import"./credential-patterns-qcw7Brjr.js";import"./multi-source-analyze-zFxWsnYg.js";let i=null,s=null;function H(){i?.cleanup(),i=null,s=null}function a(e){return e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]??t)}const f={localStorage:{icon:"💾",label:"Local",color:"#22cc77"},idb_shadow:{icon:"🗄️",label:"IDB shadow",color:"#22cc77"},firebase_backup:{icon:"☁️",label:"Firebase backup",color:"#4d9eff"},alias:{icon:"🔗",label:"Alias localStorage",color:"#c9a227"},pattern_match:{icon:"🔍",label:"Pattern match",color:"#ff9d3f"}};function m(e){const t=e.recoverable_from?f[e.recoverable_from]:{icon:"❓",label:"—",color:"#aaa"};return`
    <article style="background:rgba(255,255,255,0.02);border:1px solid rgba(34,204,119,0.2);border-radius:10px;padding:12px;margin-bottom:6px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <div style="flex:1;min-width:200px">
          <strong style="color:#22cc77">${a(e.service_name)}</strong>
          <span style="font-size:11px;padding:2px 6px;border-radius:8px;background:rgba(255,255,255,0.05);color:var(--ax-text-dim);margin-left:8px">${a(e.category)}</span>
          <br>
          <code style="font-size:11px;color:var(--ax-text-dim);font-family:monospace">${a(e.storage_key)}</code>
        </div>
        <div style="font-size:12px;color:${t.color}">
          ${t.icon} ${a(t.label)}${e.alias_source?` <code style="font-size:10px;background:rgba(0,0,0,0.3);padding:1px 4px;border-radius:3px">${a(e.alias_source)}</code>`:""}
        </div>
      </div>
    </article>
  `}function v(e){return`
    <article style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,107,107,0.2);border-radius:10px;padding:12px;margin-bottom:6px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <div style="flex:1;min-width:200px">
          <strong style="color:#ff6b6b">${a(e.service_name)}</strong>
          <span style="font-size:11px;padding:2px 6px;border-radius:8px;background:rgba(255,255,255,0.05);color:var(--ax-text-dim);margin-left:8px">${a(e.category)}</span>
          <br>
          <code style="font-size:11px;color:var(--ax-text-dim);font-family:monospace">${a(e.storage_key)}</code>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${e.dashboard_url?`<a href="${a(e.dashboard_url)}" target="_blank" rel="noopener" class="ax-btn ax-btn-sm" style="font-size:11px;padding:4px 10px;text-decoration:none">🔗 Dashboard</a>`:""}
          ${e.billing_url?`<a href="${a(e.billing_url)}" target="_blank" rel="noopener" class="ax-btn ax-btn-sm" style="font-size:11px;padding:4px 10px;text-decoration:none">💰 Recharger</a>`:""}
        </div>
      </div>
    </article>
  `}async function c(e){e.innerHTML=`
    <div style="padding:40px;text-align:center;color:var(--ax-text-dim)">
      <p>🔍 Audit credentials en cours…</p>
    </div>
  `;try{const t=await l.auditMissing();s=t;const r=await l.getStats(),o=t.recoverable.length>0?t.recoverable.map(m).join(""):'<p style="color:var(--ax-text-dim);text-align:center;padding:20px">✅ Aucune clé restorable (toutes les clés présentes ou réellement absentes)</p>',p=t.truly_absent.length>0?t.truly_absent.map(v).join(""):'<p style="color:var(--ax-text-dim);text-align:center;padding:20px">🎉 Aucune clé absente — tu as tout configuré</p>',x=r.total_patterns>0?Math.round(r.present_count/r.total_patterns*100):0;e.innerHTML=`
      <div style="padding:20px;max-width:900px;margin:0 auto">
        <header style="margin-bottom:24px">
          <h1 style="margin:0 0 6px;color:#c9a227">🔐 Credentials Status</h1>
          <p style="color:var(--ax-text-dim);font-size:13px;margin:0">
            Apex restaure automatiquement les clés depuis IDB / Firebase / alias avant de te demander.
          </p>
        </header>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:20px">
          <div style="background:rgba(34,204,119,0.1);border:1px solid rgba(34,204,119,0.3);border-radius:10px;padding:14px">
            <div style="font-size:24px;color:#22cc77;font-weight:600">${r.present_count}/${r.total_patterns}</div>
            <div style="font-size:12px;color:var(--ax-text-dim)">Présentes localement (${x}%)</div>
          </div>
          <div style="background:rgba(201,162,39,0.1);border:1px solid rgba(201,162,39,0.3);border-radius:10px;padding:14px">
            <div style="font-size:24px;color:#c9a227;font-weight:600">${r.recoverable_count}</div>
            <div style="font-size:12px;color:var(--ax-text-dim)">Restorables auto</div>
          </div>
          <div style="background:rgba(255,107,107,0.1);border:1px solid rgba(255,107,107,0.3);border-radius:10px;padding:14px">
            <div style="font-size:24px;color:#ff6b6b;font-weight:600">${r.truly_absent_count}</div>
            <div style="font-size:12px;color:var(--ax-text-dim)">À coller manuellement</div>
          </div>
        </div>

        <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap">
          <button id="ax-cs-refresh" class="ax-btn" style="padding:8px 14px;font-size:13px">🔄 Re-scanner</button>
          <button id="ax-cs-restore-all" class="ax-btn" style="padding:8px 14px;font-size:13px;background:rgba(34,204,119,0.15);color:#22cc77;border:1px solid rgba(34,204,119,0.4);font-weight:600"${t.recoverable.length===0?" disabled":""}>
            🔓 Restaurer toutes (${t.recoverable.length})
          </button>
        </div>

        <section style="margin-bottom:24px">
          <h2 style="font-size:16px;color:#22cc77;margin:0 0 10px">🔓 Restorables (${t.recoverable.length})</h2>
          <p style="color:var(--ax-text-dim);font-size:12px;margin:0 0 10px">
            Clés trouvables ailleurs (alias localStorage, IDB shadow, Firebase backup, pattern detection). Apex peut les restaurer SANS te demander.
          </p>
          <div id="ax-cs-recoverable">${o}</div>
        </section>

        <section>
          <h2 style="font-size:16px;color:#ff6b6b;margin:0 0 10px">⚠️ Truly absent (${t.truly_absent.length})</h2>
          <p style="color:var(--ax-text-dim);font-size:12px;margin:0 0 10px">
            Aucune trace dans aucune source. Tu dois recoller la clé une fois — ouvre le dashboard et copie ta clé.
          </p>
          <div id="ax-cs-absent">${p}</div>
        </section>

        <p style="text-align:center;color:#666;font-size:11px;margin-top:24px">
          🔒 Audit ${new Date(t.ts).toLocaleString("fr-FR")} · Sentinelle auto-restore-watch tourne toutes les 30 min
        </p>
      </div>
    `,y(e)}catch(t){d.error("credentials-status","refresh failed",{err:t}),e.innerHTML=`
      <div style="padding:40px;text-align:center;color:#ff6b6b">
        <p>❌ Audit échoué : ${a(String(t).slice(0,200))}</p>
      </div>
    `}}function y(e){if(!i)return;const t=e.querySelector("#ax-cs-refresh"),r=e.querySelector("#ax-cs-restore-all");t&&i.bind(t,"click",()=>{c(e)}),r&&i.bind(r,"click",()=>{(async()=>{if(!s||s.recoverable.length===0){n.show("Aucune clé restorable","warn");return}r.disabled=!0,r.textContent="⏳ Restauration en cours…";try{const o=await l.restoreAutomatically();g.success(),o.restored>0?n.show(`✅ ${o.restored} clé(s) restaurée(s) (échec: ${o.failed})`,"success"):n.show(`Aucune clé n'a pu être restaurée (échec: ${o.failed})`,"warn"),await c(e)}catch(o){d.error("credentials-status","restoreAll failed",{err:o}),n.show(`Erreur restore : ${String(o).slice(0,100)}`,"error"),r.disabled=!1}})()})}async function L(e){if(!(b.get("isAdmin")===!0)){e.innerHTML=`
      <div style="padding:40px;text-align:center;color:#999">
        <h2 style="color:#c9a227">Accès admin uniquement</h2>
        <p>Cette section est réservée à Kevin.</p>
      </div>
    `;return}i?.cleanup(),i=u("credentials-status"),await c(e)}export{H as dispose,L as render};
