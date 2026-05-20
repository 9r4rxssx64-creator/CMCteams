import{e as r}from"./escape-html-BlQj2yEF.js";import{c as x}from"./listener-cleanup-Y2rGGxxX.js";import{s as b,l as d}from"./monitoring-D2lWYrYo.js";import{autoRestoreCredentials as i}from"./auto-restore-credentials-CvKw7rYb.js";import{haptic as g}from"./haptic-CQFg2PXZ.js";import{toast as n}from"./toast-CRdbcLoc.js";import"./multi-source-analyze-Bg1HHfSC.js";import"./apex-kb-D1VtWFD9.js";import"./credential-patterns-CLzI061R.js";let o=null,l=null;function H(){o?.cleanup(),o=null,l=null}const v={localStorage:{icon:"💾",label:"Local",color:"#22cc77"},idb_shadow:{icon:"🗄️",label:"IDB shadow",color:"#22cc77"},firebase_backup:{icon:"☁️",label:"Firebase backup",color:"#4d9eff"},alias:{icon:"🔗",label:"Alias localStorage",color:"#c9a227"},pattern_match:{icon:"🔍",label:"Pattern match",color:"#ff9d3f"}};function m(e){const t=e.recoverable_from?v[e.recoverable_from]:{icon:"❓",label:"—",color:"#aaa"};return`
    <article style="background:rgba(255,255,255,0.02);border:1px solid rgba(34,204,119,0.2);border-radius:10px;padding:12px;margin-bottom:6px">
      <div class="ax-gs-93">
        <div class="ax-gs-11">
          <strong style="color:#22cc77">${r(e.service_name)}</strong>
          <span class="ax-gs-94">${r(e.category)}</span>
          <br>
          <code style="font-size:11px;color:var(--ax-text-dim);font-family:monospace">${r(e.storage_key)}</code>
        </div>
        <div style="font-size:12px;color:${t.color}">
          ${t.icon} ${r(t.label)}${e.alias_source?` <code style="font-size:10px;background:rgba(0,0,0,0.3);padding:1px 4px;border-radius:3px">${r(e.alias_source)}</code>`:""}
        </div>
      </div>
    </article>
  `}function f(e){return`
    <article style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,107,107,0.2);border-radius:10px;padding:12px;margin-bottom:6px">
      <div class="ax-gs-93">
        <div class="ax-gs-11">
          <strong style="color:#ff6b6b">${r(e.service_name)}</strong>
          <span class="ax-gs-94">${r(e.category)}</span>
          <br>
          <code style="font-size:11px;color:var(--ax-text-dim);font-family:monospace">${r(e.storage_key)}</code>
        </div>
        <div class="ax-gs-20">
          ${e.dashboard_url?`<a href="${r(e.dashboard_url)}" target="_blank" rel="noopener" class="ax-btn ax-btn-sm" style="font-size:11px;padding:4px 10px;text-decoration:none">🔗 Dashboard</a>`:""}
          ${e.billing_url?`<a href="${r(e.billing_url)}" target="_blank" rel="noopener" class="ax-btn ax-btn-sm" style="font-size:11px;padding:4px 10px;text-decoration:none">💰 Recharger</a>`:""}
        </div>
      </div>
    </article>
  `}async function c(e){e.innerHTML=`
    <div class="ax-gs-57">
      <p>🔍 Audit credentials en cours…</p>
    </div>
  `;try{const t=await i.auditMissing();l=t;const a=await i.getStats(),s=t.recoverable.length>0?t.recoverable.map(m).join(""):'<p style="color:var(--ax-text-dim);text-align:center;padding:20px">✅ Aucune clé restorable (toutes les clés présentes ou réellement absentes)</p>',p=t.truly_absent.length>0?t.truly_absent.map(f).join(""):'<p style="color:var(--ax-text-dim);text-align:center;padding:20px">🎉 Aucune clé absente — tu as tout configuré</p>',u=a.total_patterns>0?Math.round(a.present_count/a.total_patterns*100):0;e.innerHTML=`
      <div class="ax-gs-95">
        <header style="margin-bottom:24px">
          <h1 style="margin:0 0 6px;color:#c9a227">🔐 Credentials Status</h1>
          <p style="color:var(--ax-text-dim);font-size:13px;margin:0">
            Apex restaure automatiquement les clés depuis IDB / Firebase / alias avant de te demander.
          </p>
        </header>

        <div class="ax-gs-96">
          <div style="background:rgba(34,204,119,0.1);border:1px solid rgba(34,204,119,0.3);border-radius:10px;padding:14px">
            <div style="font-size:24px;color:#22cc77;font-weight:600">${a.present_count}/${a.total_patterns}</div>
            <div class="ax-gs-5">Présentes localement (${u}%)</div>
          </div>
          <div class="ax-gs-97">
            <div class="ax-gs-98">${a.recoverable_count}</div>
            <div class="ax-gs-5">Restorables auto</div>
          </div>
          <div class="ax-gs-99">
            <div class="ax-gs-58">${a.truly_absent_count}</div>
            <div class="ax-gs-5">À coller manuellement</div>
          </div>
        </div>

        <div class="ax-gs-100">
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
          <div id="ax-cs-recoverable">${s}</div>
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
    `,h(e)}catch(t){d.error("credentials-status","refresh failed",{err:t}),e.innerHTML=`
      <div class="ax-gs-101">
        <p>❌ Audit échoué : ${r(String(t).slice(0,200))}</p>
      </div>
    `}}function h(e){if(!o)return;const t=e.querySelector("#ax-cs-refresh"),a=e.querySelector("#ax-cs-restore-all");t&&o.bind(t,"click",()=>{c(e)}),a&&o.bind(a,"click",()=>{(async()=>{if(!l||l.recoverable.length===0){n.show("Aucune clé restorable","warn");return}a.disabled=!0,a.textContent="⏳ Restauration en cours…";try{const s=await i.restoreAutomatically();g.success(),s.restored>0?n.show(`✅ ${s.restored} clé(s) restaurée(s) (échec: ${s.failed})`,"success"):n.show(`Aucune clé n'a pu être restaurée (échec: ${s.failed})`,"warn"),await c(e)}catch(s){d.error("credentials-status","restoreAll failed",{err:s}),n.show(`Erreur restore : ${String(s).slice(0,100)}`,"error"),a.disabled=!1}})()})}async function L(e){if(!(b.get("isAdmin")===!0)){e.innerHTML=`
      <div class="ax-gs-21">
        <h2 style="color:#c9a227">Accès admin uniquement</h2>
        <p>Cette section est réservée à Kevin.</p>
      </div>
    `;return}o?.cleanup(),o=x("credentials-status"),await c(e)}export{H as dispose,L as render};
