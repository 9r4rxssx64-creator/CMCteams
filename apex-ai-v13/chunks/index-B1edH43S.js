import{a as r}from"./escape-html-DGIYNPKb.js";import{c as g}from"./listener-cleanup-Y2rGGxxX.js";import{s}from"./signup-Boji1n-l.js";import{haptic as p}from"./haptic-CQFg2PXZ.js";import{toast as o}from"./toast-CRdbcLoc.js";import"./multi-source-analyze-BF2gxnOB.js";import"./apex-kb-BFpEt2rP.js";import"./monitoring-C21_YuBN.js";import"./credential-patterns-CLzI061R.js";import"./kevin-alerts-DlcO8AHz.js";import"./whatsapp-Dsfv_blk.js";import"./auth-gate-CwR0JOLP.js";import"./auth-DU-9rI8i.js";let n=null;function P(){n?.cleanup(),n=null}function x(e){return e.length<=4?e:e.slice(0,4)+"***"+e.slice(-2)}function C(e){n?.cleanup(),n=g("signup-approval"),l(e)}function l(e){const i=s.listPending(),t=s.listProcessed().slice(0,20);e.innerHTML=`
    <div class="ax-gs-364">
      <h1 style="color:#c9a227;margin:0 0 4px;font-size:24px">📥 Demandes d'inscription</h1>
      <p style="color:var(--ax-text-dim,#aaa);margin:0 0 20px;font-size:13px">${i.length} en attente · ${t.length} traitées récemment</p>

      <h2 class="ax-gs-446">⏳ En attente (${i.length})</h2>
      ${i.length===0?`
        <div style="background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:24px;text-align:center;color:var(--ax-text-dim,#888);margin-bottom:24px">
          Aucune demande en attente
        </div>
      `:`
        <div style="display:grid;gap:10px;margin-bottom:24px">
          ${i.map(a=>c(a,!0)).join("")}
        </div>
      `}

      <h2 class="ax-gs-446">📋 Historique récent</h2>
      ${t.length===0?`
        <div style="background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px;text-align:center;color:var(--ax-text-dim,#888)">
          Aucun historique
        </div>
      `:`
        <div style="display:grid;gap:10px">
          ${t.map(a=>c(a,!1)).join("")}
        </div>
      `}
    </div>
  `,m(e)}function c(e,i){const t=`${e.prenom} ${e.nom}`,a=new Date(e.createdAt).toLocaleString("fr-FR"),d=e.status==="approved"?{color:"#10b981",label:"✅ Approuvé"}:e.status==="rejected"?{color:"#ef4444",label:"❌ Refusé"}:e.status==="expired"?{color:"#888",label:"⏰ Expiré"}:{color:"#c9a227",label:"⏳ En attente"};return`
    <div style="background:rgba(20,20,35,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px" data-signup-id="${r(e.id)}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">
        <div class="ax-gs-11">
          <div class="ax-gs-77">
            <strong class="ax-gs-409">${r(t)}</strong>
            <span style="background:${d.color}20;color:${d.color};padding:2px 8px;border-radius:4px;font-size:11px">${d.label}</span>
          </div>
          <div style="font-size:12px;color:var(--ax-text-dim,#aaa);display:grid;gap:2px">
            <div>📧 ${r(e.email)}</div>
            <div>📱 ${r(x(e.whatsapp))}</div>
            <div>💎 Plan: <strong class="ax-gs-266">${r(e.plan)}</strong></div>
            <div>📅 ${r(a)}</div>
            ${i?`<div style="font-family:'Courier New',monospace;color:#c9a227;font-size:11px">🔑 OTP: ${r(e.otp)}</div>`:""}
            ${e.rejectReason?`<div class="ax-gs-110">Raison: ${r(e.rejectReason)}</div>`:""}
          </div>
        </div>
        ${i?`
          <div style="display:grid;gap:6px;min-width:160px">
            <button class="ax-btn ax-btn-primary signup-approve-client ax-gs-336" data-id="${r(e.id)}">✅ Approuver client</button>
            <button class="ax-btn ax-btn-secondary signup-approve-family ax-gs-336" data-id="${r(e.id)}">👨‍👩‍👧 Famille</button>
            <button class="ax-btn ax-btn-ghost signup-reject" data-id="${r(e.id)}" style="font-size:11px;padding:6px 10px;color:#ef4444">❌ Refuser</button>
          </div>
        `:""}
      </div>
    </div>
  `}function m(e){n&&(e.querySelectorAll(".signup-approve-client").forEach(i=>{n.bind(i,"click",()=>{const t=i.dataset.id;t&&(p.tap(),u(e,t,"client"))})}),e.querySelectorAll(".signup-approve-family").forEach(i=>{n.bind(i,"click",()=>{const t=i.dataset.id;t&&(p.tap(),u(e,t,"family"))})}),e.querySelectorAll(".signup-reject").forEach(i=>{n.bind(i,"click",()=>{const t=i.dataset.id;t&&(p.medium(),v(e,t))})}))}async function u(e,i,t){const a=await s.approveSignup({requestId:i,type:t,adminUid:"kdmc_admin"});a.ok?(o.success(`✅ Approuvé ${t==="family"?"(famille)":"(client)"} → uid ${a.uid?.slice(0,16)??"?"}`),l(e)):o.error(a.reason??"Erreur approval")}async function v(e,i){const t=prompt("Raison du refus (sera visible client) :");if(!t)return;const a=await s.rejectSignup({requestId:i,adminUid:"kdmc_admin",reason:t});a.ok?(o.success("Demande rejetée"),l(e)):o.error(a.reason??"Erreur reject")}export{P as dispose,C as render};
