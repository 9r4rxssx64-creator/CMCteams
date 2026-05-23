import{C as s,q as o}from"./monitoring-CjXQKsP-.js";import{g as r}from"./apex-tools-dispatch-core-CsAQnFXt.js";import"./multi-source-analyze-BlYjOulu.js";import"./apex-kb-DkXWMstU.js";import"./credential-patterns-CLzI061R.js";import"./apex-tools-dispatch-skills-BmaPPmFT.js";import"./apex-tools-dispatch-data-CwPHEssD.js";import"./apex-tools-dispatch-finance-DoRAfEZC.js";import"./apex-tools-dispatch-misc-JukyXsGG.js";import"./apex-tools-misc-DsyCIMlO.js";import"./apex-tools-registry-core-CQvgkOQw.js";import"./apex-tools-registry-skills-DRX4PPQ_.js";function f(t){const a=s.get("user")?.id??"anon";r("module.workflow",t,a)&&(t.innerHTML=`
    <div class="ax-page ax-gs-368">
      <h1 class="ax-gs-369">⚡ Workflows</h1>
      <p class="ax-gs-226">Automatise tes tâches récurrentes (IF this THEN that).</p>

      <div class="ax-gs-130">
        <h2 class="ax-gs-370">Workflows actifs</h2>
        <p style="color:var(--ax-text-dim);font-size:14px;margin:0">Aucun workflow configuré pour le moment.</p>
        <button class="ax-btn ax-btn-primary" style="width:100%;margin-top:12px">+ Nouveau workflow</button>
      </div>

      <div class="ax-gs-131">
        <h2 class="ax-gs-370">Templates pré-configurés</h2>
        <div class="ax-gs-251">
          <button class="ax-btn ax-btn-sm ax-gs-487">📧 Email reçu → notification</button>
          <button class="ax-btn ax-btn-sm ax-gs-487">📅 Réunion calendrier → préparer doc</button>
          <button class="ax-btn ax-btn-sm ax-gs-487">🌅 Lever soleil → routine matin</button>
          <button class="ax-btn ax-btn-sm ax-gs-487">📍 GPS arrivé maison → lumières on</button>
        </div>
      </div>

      <p class="ax-gs-212"><a href="#chat" class="ax-gs-198">← Retour chat</a></p>
    </div>
  `,o.info("feature-workflow","rendered"))}export{f as render};
