import{c as x}from"./listener-cleanup-Y2rGGxxX.js";import{s as o}from"./signup-DGivrVGT.js";import{haptic as d}from"./haptic-CQFg2PXZ.js";import{toast as s}from"./toast-ClsF1KRZ.js";import"./monitoring-3uBGKGRH.js";import"./apex-kb-BLbkSdzh.js";import"./credential-patterns-guxfirLX.js";import"./auth-gate-MHh8nThA.js";import"../core/main-DaO33y5n.js";import"./multi-source-analyze-DhDQ13qJ.js";import"./commerce-2D7c9zVo.js";import"./kevin-alerts-BziV4j9D.js";import"./whatsapp-BqBRF8R7.js";let r=null;function P(){r?.cleanup(),r=null}function n(e){return e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]??t)}function f(e){return e.length<=4?e:e.slice(0,4)+"***"+e.slice(-2)}function C(e){r?.cleanup(),r=x("signup-approval"),l(e)}function l(e){const t=o.listPending(),i=o.listProcessed().slice(0,20);e.innerHTML=`
    <div style="padding:16px;max-width:960px;margin:0 auto">
      <h1 style="color:#c9a227;margin:0 0 4px;font-size:24px">📥 Demandes d'inscription</h1>
      <p style="color:var(--ax-text-dim,#aaa);margin:0 0 20px;font-size:13px">${t.length} en attente · ${i.length} traitées récemment</p>

      <h2 style="color:#fff;font-size:16px;margin:0 0 12px">⏳ En attente (${t.length})</h2>
      ${t.length===0?`
        <div style="background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:24px;text-align:center;color:var(--ax-text-dim,#888);margin-bottom:24px">
          Aucune demande en attente
        </div>
      `:`
        <div style="display:grid;gap:10px;margin-bottom:24px">
          ${t.map(a=>c(a,!0)).join("")}
        </div>
      `}

      <h2 style="color:#fff;font-size:16px;margin:0 0 12px">📋 Historique récent</h2>
      ${i.length===0?`
        <div style="background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px;text-align:center;color:var(--ax-text-dim,#888)">
          Aucun historique
        </div>
      `:`
        <div style="display:grid;gap:10px">
          ${i.map(a=>c(a,!1)).join("")}
        </div>
      `}
    </div>
  `,m(e)}function c(e,t){const i=`${e.prenom} ${e.nom}`,a=new Date(e.createdAt).toLocaleString("fr-FR"),p=e.status==="approved"?{color:"#10b981",label:"✅ Approuvé"}:e.status==="rejected"?{color:"#ef4444",label:"❌ Refusé"}:e.status==="expired"?{color:"#888",label:"⏰ Expiré"}:{color:"#c9a227",label:"⏳ En attente"};return`
    <div style="background:rgba(20,20,35,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px" data-signup-id="${n(e.id)}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">
        <div style="flex:1;min-width:200px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <strong style="color:#fff;font-size:15px">${n(i)}</strong>
            <span style="background:${p.color}20;color:${p.color};padding:2px 8px;border-radius:4px;font-size:11px">${p.label}</span>
          </div>
          <div style="font-size:12px;color:var(--ax-text-dim,#aaa);display:grid;gap:2px">
            <div>📧 ${n(e.email)}</div>
            <div>📱 ${n(f(e.whatsapp))}</div>
            <div>💎 Plan: <strong style="color:#c9a227">${n(e.plan)}</strong></div>
            <div>📅 ${n(a)}</div>
            ${t?`<div style="font-family:'Courier New',monospace;color:#c9a227;font-size:11px">🔑 OTP: ${n(e.otp)}</div>`:""}
            ${e.rejectReason?`<div style="color:#ef4444">Raison: ${n(e.rejectReason)}</div>`:""}
          </div>
        </div>
        ${t?`
          <div style="display:grid;gap:6px;min-width:160px">
            <button class="ax-btn ax-btn-primary signup-approve-client" data-id="${n(e.id)}" style="font-size:12px;padding:8px 12px">✅ Approuver client</button>
            <button class="ax-btn ax-btn-secondary signup-approve-family" data-id="${n(e.id)}" style="font-size:12px;padding:8px 12px">👨‍👩‍👧 Famille</button>
            <button class="ax-btn ax-btn-ghost signup-reject" data-id="${n(e.id)}" style="font-size:11px;padding:6px 10px;color:#ef4444">❌ Refuser</button>
          </div>
        `:""}
      </div>
    </div>
  `}function m(e){r&&(e.querySelectorAll(".signup-approve-client").forEach(t=>{r.bind(t,"click",()=>{const i=t.dataset.id;i&&(d.tap(),u(e,i,"client"))})}),e.querySelectorAll(".signup-approve-family").forEach(t=>{r.bind(t,"click",()=>{const i=t.dataset.id;i&&(d.tap(),u(e,i,"family"))})}),e.querySelectorAll(".signup-reject").forEach(t=>{r.bind(t,"click",()=>{const i=t.dataset.id;i&&(d.medium(),g(e,i))})}))}async function u(e,t,i){const a=await o.approveSignup({requestId:t,type:i,adminUid:"kdmc_admin"});a.ok?(s.success(`✅ Approuvé ${i==="family"?"(famille)":"(client)"} → uid ${a.uid?.slice(0,16)??"?"}`),l(e)):s.error(a.reason??"Erreur approval")}async function g(e,t){const i=prompt("Raison du refus (sera visible client) :");if(!i)return;const a=await o.rejectSignup({requestId:t,adminUid:"kdmc_admin",reason:i});a.ok?(s.success("Demande rejetée"),l(e)):s.error(a.reason??"Erreur reject")}export{P as dispose,C as render};
