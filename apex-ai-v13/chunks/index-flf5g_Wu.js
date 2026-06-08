import{b as n,s as l,l as c}from"./monitoring-BbFVg0DV.js";import{c as m}from"./listener-cleanup-Y2rGGxxX.js";import{g as u}from"./apex-tools-dispatch-core-D_C9cKwq.js";import{toast as p}from"./toast-CRdbcLoc.js";import"./multi-source-analyze-BEXlXrQF.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-CBwQgbdH.js";import"./apex-tools-dispatch-skills-isS2N-xT.js";import"./apex-tools-dispatch-data-C_ok0Eu1.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-DmtfBzee.js";import"./apex-tools-misc-DOCq9FPV.js";import"./apex-tools-registry-core-BMhHY4vU.js";import"./apex-tools-registry-skills-x-mAWYry.js";import"./haptic-CQFg2PXZ.js";let a=null;function e(t){try{sessionStorage.setItem("ax_workflow_intent",t)}catch{}p.info("⚡ Décris ton automatisation à Apex — il va t'aider à la configurer"),window.location.hash="#chat"}function q(t){const s=n.get("user")?.id??"anon";if(!u("module.workflow",t,s))return;a?.cleanup(),a=m("workflow"),l(t,`
    <div class="ax-page ax-gs-368">
      <h1 class="ax-gs-369">⚡ Workflows</h1>
      <p class="ax-gs-226">Automatise tes tâches récurrentes (IF this THEN that).</p>

      <div class="ax-gs-130">
        <h2 class="ax-gs-370">Workflows actifs</h2>
        <p style="color:var(--ax-text-dim);font-size:14px;margin:0">Aucun workflow configuré pour le moment.</p>
        <button class="ax-btn ax-btn-primary" id="ax-wf-new" style="width:100%;margin-top:12px;min-height:44px">+ Nouveau workflow</button>
      </div>

      <div class="ax-gs-131">
        <h2 class="ax-gs-370">Templates pré-configurés</h2>
        <div class="ax-gs-251">
          <button class="ax-btn ax-btn-sm ax-gs-487" data-wf="Email reçu → notification" style="min-height:44px">📧 Email reçu → notification</button>
          <button class="ax-btn ax-btn-sm ax-gs-487" data-wf="Réunion calendrier → préparer doc" style="min-height:44px">📅 Réunion calendrier → préparer doc</button>
          <button class="ax-btn ax-btn-sm ax-gs-487" data-wf="Lever soleil → routine matin" style="min-height:44px">🌅 Lever soleil → routine matin</button>
          <button class="ax-btn ax-btn-sm ax-gs-487" data-wf="GPS arrivé maison → lumières on" style="min-height:44px">📍 GPS arrivé maison → lumières on</button>
        </div>
      </div>

      <p class="ax-gs-212"><a href="#chat" class="ax-gs-198">← Retour chat</a></p>
    </div>
  `);const o=t.querySelector("#ax-wf-new");o&&a.bind(o,"click",()=>{e("Aide-moi à créer un workflow d'automatisation personnalisé.")}),t.querySelectorAll("[data-wf]").forEach(i=>{a.bind(i,"click",()=>{const r=i.getAttribute("data-wf")??"automatisation";e(`Configure ce workflow : ${r}`)})}),c.info("feature-workflow","rendered")}export{q as render};
