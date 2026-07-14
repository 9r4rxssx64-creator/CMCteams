import{b as g,l as d,e as r}from"./monitoring-s9DMRVdy.js";import{c as p}from"./listener-cleanup-Y2rGGxxX.js";import{autoRestoreCredentials as n}from"./auto-restore-credentials-CTcWlXJv.js";import{haptic as x}from"./haptic-CQFg2PXZ.js";import{toast as l}from"./toast-BCPNzfMv.js";import"./multi-source-analyze-D22Lzh_R.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-P7udjtAF.js";let c=null,o=null;function H(){c?.cleanup(),c=null,o=null}const v={localStorage:{icon:"💾",label:"Local",color:"#22cc77"},idb_shadow:{icon:"🗄️",label:"IDB shadow",color:"#22cc77"},firebase_backup:{icon:"☁️",label:"Firebase backup",color:"#4d9eff"},alias:{icon:"🔗",label:"Alias localStorage",color:"#c9a227"},pattern_match:{icon:"🔍",label:"Pattern match",color:"#ff9d3f"}};function f(e){const s=e.recoverable_from?v[e.recoverable_from]:{icon:"❓",label:"—",color:"#aaa"};return`
    <article style="background:rgba(255,255,255,0.02);border:1px solid rgba(34,204,119,0.2);border-radius:10px;padding:12px;margin-bottom:6px">
      <div class="ax-gs-93">
        <div class="ax-gs-11">
          <strong class="ax-gs-279">${r(e.service_name)}</strong>
          <span class="ax-gs-94">${r(e.category)}</span>
          <br>
          <code class="ax-gs-190">${r(e.storage_key)}</code>
        </div>
        <div style="font-size:12px;color:${s.color}">
          ${s.icon} ${r(s.label)}${e.alias_source?` <code style="font-size:10px;background:rgba(0,0,0,0.3);padding:1px 4px;border-radius:3px">${r(e.alias_source)}</code>`:""}
        </div>
      </div>
    </article>
  `}function h(e){return`
    <article style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,107,107,0.2);border-radius:10px;padding:12px;margin-bottom:6px">
      <div class="ax-gs-93">
        <div class="ax-gs-11">
          <strong style="color:#ff6b6b">${r(e.service_name)}</strong>
          <span class="ax-gs-94">${r(e.category)}</span>
          <br>
          <code class="ax-gs-190">${r(e.storage_key)}</code>
        </div>
        <div class="ax-gs-20">
          ${e.dashboard_url?`<a href="${r(e.dashboard_url)}" target="_blank" rel="noopener" class="ax-btn ax-btn-sm ax-gs-280">🔗 Dashboard</a>`:""}
          ${e.billing_url?`<a href="${r(e.billing_url)}" target="_blank" rel="noopener" class="ax-btn ax-btn-sm ax-gs-280">💰 Recharger</a>`:""}
        </div>
      </div>
    </article>
  `}async function i(e){e.innerHTML=`
    <div class="ax-gs-57">
      <p>🔍 Audit credentials en cours…</p>
    </div>
  `;try{const s=await n.auditMissing();o=s;const a=await n.getStats(),t=s.recoverable.length>0?s.recoverable.map(f).join(""):'<p class="ax-gs-191">✅ Aucune clé restorable (toutes les clés présentes ou réellement absentes)</p>',u=s.truly_absent.length>0?s.truly_absent.map(h).join(""):'<p class="ax-gs-191">🎉 Aucune clé absente — tu as tout configuré</p>',b=a.total_patterns>0?Math.round(a.present_count/a.total_patterns*100):0;e.innerHTML=`
      <div class="ax-gs-95">
        <header class="ax-gs-180">
          <h1 class="ax-gs-281">🔐 Credentials Status</h1>
          <p class="ax-gs-282">
            Apex restaure automatiquement les clés depuis IDB / Firebase / alias avant de te demander.
          </p>
        </header>

        <div class="ax-gs-96">
          <div style="background:rgba(34,204,119,0.1);border:1px solid rgba(34,204,119,0.3);border-radius:10px;padding:14px">
            <div style="font-size:24px;color:#22cc77;font-weight:600">${a.present_count}/${a.total_patterns}</div>
            <div class="ax-gs-5">Présentes localement (${b}%)</div>
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
          <button id="ax-cs-refresh" class="ax-btn ax-gs-283">🔄 Re-scanner</button>
          <button id="ax-cs-restore-all" class="ax-btn" style="padding:8px 14px;font-size:13px;background:rgba(34,204,119,0.15);color:#22cc77;border:1px solid rgba(34,204,119,0.4);font-weight:600"${s.recoverable.length===0?" disabled":""}>
            🔓 Restaurer toutes (${s.recoverable.length})
          </button>
        </div>

        <section class="ax-gs-180">
          <h2 style="font-size:16px;color:#22cc77;margin:0 0 10px">🔓 Restorables (${s.recoverable.length})</h2>
          <p class="ax-gs-284">
            Clés trouvables ailleurs (alias localStorage, IDB shadow, Firebase backup, pattern detection). Apex peut les restaurer SANS te demander.
          </p>
          <div id="ax-cs-recoverable">${t}</div>
        </section>

        <section>
          <h2 class="ax-gs-285">⚠️ Truly absent (${s.truly_absent.length})</h2>
          <p class="ax-gs-284">
            Aucune trace dans aucune source. Tu dois recoller la clé une fois — ouvre le dashboard et copie ta clé.
          </p>
          <div id="ax-cs-absent">${u}</div>
        </section>

        <p class="ax-gs-265">
          🔒 Audit ${new Date(s.ts).toLocaleString("fr-FR")} · Sentinelle auto-restore-watch tourne toutes les 30 min
        </p>
      </div>
    `,m(e)}catch(s){d.error("credentials-status","refresh failed",{err:s}),e.innerHTML=`
      <div class="ax-gs-101">
        <p>❌ Audit échoué : ${r(String(s).slice(0,200))}</p>
      </div>
    `}}function m(e){if(!c)return;const s=e.querySelector("#ax-cs-refresh"),a=e.querySelector("#ax-cs-restore-all");s&&c.bind(s,"click",()=>{i(e)}),a&&c.bind(a,"click",()=>{(async()=>{if(!o||o.recoverable.length===0){l.show("Aucune clé restorable","warn");return}a.disabled=!0,a.textContent="⏳ Restauration en cours…";try{const t=await n.restoreAutomatically();x.success(),t.restored>0?l.show(`✅ ${t.restored} clé(s) restaurée(s) (échec: ${t.failed})`,"success"):l.show(`Aucune clé n'a pu être restaurée (échec: ${t.failed})`,"warn"),await i(e)}catch(t){d.error("credentials-status","restoreAll failed",{err:t}),l.show(`Erreur restore : ${String(t).slice(0,100)}`,"error"),a.disabled=!1}})()})}async function L(e){if(!(g.get("isAdmin")===!0)){e.innerHTML=`
      <div class="ax-gs-21">
        <h2 class="ax-gs-266">Accès admin uniquement</h2>
        <p>Cette section est réservée à Kevin.</p>
      </div>
    `;return}c?.cleanup(),c=p("credentials-status"),await i(e)}export{H as dispose,L as render};
