import{e as a}from"./escape-html-BlQj2yEF.js";import{c as u}from"./listener-cleanup-Y2rGGxxX.js";import{s as x,l as p,a as m}from"./monitoring-D2lWYrYo.js";import{rgpd as g}from"./rgpd-PXkgZvfb.js";import{haptic as c}from"./haptic-CQFg2PXZ.js";import{toast as l}from"./toast-CRdbcLoc.js";import"./multi-source-analyze-Bg1HHfSC.js";import"./apex-kb-D1VtWFD9.js";import"./credential-patterns-CLzI061R.js";let r=null;function S(){r?.cleanup(),r=null}function f(i){if(!i)return"—";try{return new Date(i).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return"—"}}function v(i){const e=i.scopes.includes("*")?'<span style="color:#ff6b6b;font-weight:600">Globale (tous scopes)</span>':i.scopes.map(n=>`<code style="background:rgba(255,255,255,0.05);padding:2px 6px;border-radius:4px;font-size:11px;margin-right:4px">${a(n)}</code>`).join("");return`
    <article style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,107,107,0.25);border-radius:10px;padding:14px;margin-bottom:8px">
      <div class="ax-gs-112">
        <div class="ax-gs-11">
          <strong style="color:#ff6b6b;font-size:14px">${a(i.uid)}</strong>
          <div style="margin-top:6px;font-size:12px;color:var(--ax-text-dim)">
            Scopes : ${e}
          </div>
          <div style="margin-top:4px;font-size:11px;color:#888">
            Depuis : ${a(f(i.ts))}
          </div>
        </div>
        <button
          class="ax-btn ax-rgpd-lift-btn"
          data-uid="${a(i.uid)}"
          aria-label="Lever la restriction RGPD pour ${a(i.uid)}"
          style="padding:8px 14px;font-size:13px;background:rgba(34,204,119,0.15);color:#22cc77;border:1px solid rgba(34,204,119,0.4);border-radius:8px;cursor:pointer;font-weight:600;min-height:40px"
        >
          🔓 Lever
        </button>
      </div>
    </article>
  `}async function o(i){i.innerHTML=`
    <div class="ax-gs-57">
      <p>🔍 Chargement restrictions RGPD…</p>
    </div>
  `;try{const e=g.listRestrictedUsers(),n=e.length>0?e.map(v).join(""):'<p style="color:var(--ax-text-dim);text-align:center;padding:40px">✅ Aucune restriction RGPD active.<br><span class="ax-gs-24">Tous les users peuvent traiter leurs données librement.</span></p>';i.innerHTML=`
      <div class="ax-gs-95">
        <header style="margin-bottom:24px">
          <h1 style="margin:0 0 6px;color:#c9a227">🛡 RGPD — Restrictions actives</h1>
          <p style="color:var(--ax-text-dim);font-size:13px;margin:0">
            Art. 18 RGPD — droit de limitation du traitement.
            Les users en restriction ne peuvent plus que lire leurs données (pas de modif/AI/sync).
          </p>
        </header>

        <div class="ax-gs-96">
          <div class="ax-gs-99">
            <div class="ax-gs-58">${e.length}</div>
            <div class="ax-gs-5">Restrictions actives</div>
          </div>
          <div style="background:rgba(255,107,107,0.05);border:1px solid rgba(255,107,107,0.15);border-radius:10px;padding:14px">
            <div class="ax-gs-58">${e.filter(t=>t.scopes.includes("*")).length}</div>
            <div class="ax-gs-5">Globales (tous scopes)</div>
          </div>
          <div class="ax-gs-97">
            <div class="ax-gs-98">${e.filter(t=>!t.scopes.includes("*")).length}</div>
            <div class="ax-gs-5">Granulaires</div>
          </div>
        </div>

        <div class="ax-gs-100">
          <button id="ax-rgpd-refresh" class="ax-btn" aria-label="Rafraîchir la liste des restrictions" style="padding:8px 14px;font-size:13px">🔄 Rafraîchir</button>
        </div>

        <section>
          <h2 style="font-size:16px;color:#ff6b6b;margin:0 0 10px">⛔ Users restreints (${e.length})</h2>
          <div id="ax-rgpd-list">${n}</div>
        </section>

        <p style="text-align:center;color:#666;font-size:11px;margin-top:24px">
          🔒 Lift restriction = audit log immutable (rgpd.restrict.lifted) + reprise normale du traitement
        </p>
      </div>
    `,b(i)}catch(e){p.error("rgpd-admin","refresh failed",{err:e}),i.innerHTML=`
      <div class="ax-gs-101">
        <p>❌ Chargement échoué : ${a(String(e).slice(0,200))}</p>
      </div>
    `}}function b(i){if(!r)return;const e=i.querySelector("#ax-rgpd-refresh");e&&r.bind(e,"click",()=>{c.tap(),o(i)}),i.querySelectorAll(".ax-rgpd-lift-btn").forEach(t=>{r&&r.bind(t,"click",async()=>{const s=t.dataset.uid;if(!(!s||!window.confirm(`Lever la restriction RGPD pour ${s} ?

L'utilisateur retrouvera l'accès complet (modif, AI, sync).`)))try{c.medium(),g.liftRestriction(s),await m.record("rgpd.admin.lift",{actor:"admin",details:{target_uid:s,via:"vRGPDAdmin"}}),l.success(`✅ Restriction levée pour ${s}`),await o(i)}catch(d){p.error("rgpd-admin","liftRestriction failed",{err:d,uid:s}),l.error(`❌ Échec : ${String(d).slice(0,100)}`)}})})}async function H(i){if(!(x.get("isAdmin")===!0)){i.innerHTML=`
      <div class="ax-gs-21">
        <h2 style="color:#c9a227">Accès admin uniquement</h2>
        <p>Cette section est réservée à Kevin.</p>
      </div>
    `;return}r?.cleanup(),r=u("rgpd-admin"),await o(i)}export{S as dispose,H as render};
