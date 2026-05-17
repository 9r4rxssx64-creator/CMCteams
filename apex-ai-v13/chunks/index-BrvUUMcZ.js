import{a as o}from"./escape-html-DGIYNPKb.js";import{c as g}from"./listener-cleanup-Y2rGGxxX.js";import{l}from"./monitoring-DMtdadhB.js";import{i as f}from"../core/main-EjEt3jVy.js";import{c as u}from"./apex-kb-CUbBeDnn.js";import{rgpd as x}from"./rgpd-B5442lDR.js";import{haptic as p}from"./haptic-CQFg2PXZ.js";import{toast as c}from"./toast-CRdbcLoc.js";import"./multi-source-analyze-B0ccPYTp.js";import"./credential-patterns-CLzI061R.js";let t=null;function S(){t?.cleanup(),t=null}function m(e){if(!e)return"—";try{return new Date(e).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return"—"}}function b(e){const i=e.scopes.includes("*")?'<span style="color:#ff6b6b;font-weight:600">Globale (tous scopes)</span>':e.scopes.map(s=>`<code style="background:rgba(255,255,255,0.05);padding:2px 6px;border-radius:4px;font-size:11px;margin-right:4px">${o(s)}</code>`).join("");return`
    <article style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,107,107,0.25);border-radius:10px;padding:14px;margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
        <div style="flex:1;min-width:200px">
          <strong style="color:#ff6b6b;font-size:14px">${o(e.uid)}</strong>
          <div style="margin-top:6px;font-size:12px;color:var(--ax-text-dim)">
            Scopes : ${i}
          </div>
          <div style="margin-top:4px;font-size:11px;color:#888">
            Depuis : ${o(m(e.ts))}
          </div>
        </div>
        <button
          class="ax-btn ax-rgpd-lift-btn"
          data-uid="${o(e.uid)}"
          aria-label="Lever la restriction RGPD pour ${o(e.uid)}"
          style="padding:8px 14px;font-size:13px;background:rgba(34,204,119,0.15);color:#22cc77;border:1px solid rgba(34,204,119,0.4);border-radius:8px;cursor:pointer;font-weight:600;min-height:40px"
        >
          🔓 Lever
        </button>
      </div>
    </article>
  `}async function a(e){e.innerHTML=`
    <div style="padding:40px;text-align:center;color:var(--ax-text-dim)">
      <p>🔍 Chargement restrictions RGPD…</p>
    </div>
  `;try{const i=x.listRestrictedUsers(),s=i.length>0?i.map(b).join(""):'<p style="color:var(--ax-text-dim);text-align:center;padding:40px">✅ Aucune restriction RGPD active.<br><span style="font-size:12px">Tous les users peuvent traiter leurs données librement.</span></p>';e.innerHTML=`
      <div style="padding:20px;max-width:900px;margin:0 auto">
        <header style="margin-bottom:24px">
          <h1 style="margin:0 0 6px;color:#c9a227">🛡 RGPD — Restrictions actives</h1>
          <p style="color:var(--ax-text-dim);font-size:13px;margin:0">
            Art. 18 RGPD — droit de limitation du traitement.
            Les users en restriction ne peuvent plus que lire leurs données (pas de modif/AI/sync).
          </p>
        </header>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:20px">
          <div style="background:rgba(255,107,107,0.1);border:1px solid rgba(255,107,107,0.3);border-radius:10px;padding:14px">
            <div style="font-size:24px;color:#ff6b6b;font-weight:600">${i.length}</div>
            <div style="font-size:12px;color:var(--ax-text-dim)">Restrictions actives</div>
          </div>
          <div style="background:rgba(255,107,107,0.05);border:1px solid rgba(255,107,107,0.15);border-radius:10px;padding:14px">
            <div style="font-size:24px;color:#ff6b6b;font-weight:600">${i.filter(r=>r.scopes.includes("*")).length}</div>
            <div style="font-size:12px;color:var(--ax-text-dim)">Globales (tous scopes)</div>
          </div>
          <div style="background:rgba(201,162,39,0.1);border:1px solid rgba(201,162,39,0.3);border-radius:10px;padding:14px">
            <div style="font-size:24px;color:#c9a227;font-weight:600">${i.filter(r=>!r.scopes.includes("*")).length}</div>
            <div style="font-size:12px;color:var(--ax-text-dim)">Granulaires</div>
          </div>
        </div>

        <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap">
          <button id="ax-rgpd-refresh" class="ax-btn" aria-label="Rafraîchir la liste des restrictions" style="padding:8px 14px;font-size:13px">🔄 Rafraîchir</button>
        </div>

        <section>
          <h2 style="font-size:16px;color:#ff6b6b;margin:0 0 10px">⛔ Users restreints (${i.length})</h2>
          <div id="ax-rgpd-list">${s}</div>
        </section>

        <p style="text-align:center;color:#666;font-size:11px;margin-top:24px">
          🔒 Lift restriction = audit log immutable (rgpd.restrict.lifted) + reprise normale du traitement
        </p>
      </div>
    `,v(e)}catch(i){l.error("rgpd-admin","refresh failed",{err:i}),e.innerHTML=`
      <div style="padding:40px;text-align:center;color:#ff6b6b">
        <p>❌ Chargement échoué : ${o(String(i).slice(0,200))}</p>
      </div>
    `}}function v(e){if(!t)return;const i=e.querySelector("#ax-rgpd-refresh");i&&t.bind(i,"click",()=>{p.tap(),a(e)}),e.querySelectorAll(".ax-rgpd-lift-btn").forEach(r=>{t&&t.bind(r,"click",async()=>{const n=r.dataset.uid;if(!(!n||!window.confirm(`Lever la restriction RGPD pour ${n} ?

L'utilisateur retrouvera l'accès complet (modif, AI, sync).`)))try{p.medium(),x.liftRestriction(n),await u.record("rgpd.admin.lift",{actor:"admin",details:{target_uid:n,via:"vRGPDAdmin"}}),c.success(`✅ Restriction levée pour ${n}`),await a(e)}catch(d){l.error("rgpd-admin","liftRestriction failed",{err:d,uid:n}),c.error(`❌ Échec : ${String(d).slice(0,100)}`)}})})}async function H(e){if(!(f.get("isAdmin")===!0)){e.innerHTML=`
      <div style="padding:40px;text-align:center;color:#999">
        <h2 style="color:#c9a227">Accès admin uniquement</h2>
        <p>Cette section est réservée à Kevin.</p>
      </div>
    `;return}t?.cleanup(),t=g("rgpd-admin"),await a(e)}export{S as dispose,H as render};
