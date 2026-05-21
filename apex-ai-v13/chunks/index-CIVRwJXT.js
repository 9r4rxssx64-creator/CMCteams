import{s as a,l as o}from"./monitoring-B15B7Ex7.js";import{g as r}from"./apex-tools-dispatch-core-Dv5grOJa.js";import"./multi-source-analyze-9nvgkMCT.js";import"./apex-kb-ghUk2PNK.js";import"./credential-patterns-CLzI061R.js";import"./apex-tools-dispatch-skills-reMHBMzr.js";import"./apex-tools-dispatch-data-DbZTITXG.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-B1r9w82v.js";import"./apex-tools-misc-BS7DJVJn.js";import"./apex-tools-registry-core-BMhHY4vU.js";import"./apex-tools-registry-skills-DRX4PPQ_.js";function f(t){const s=a.get("user")?.id??"anon";r("module.workflow",t,s)&&(t.innerHTML=`
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
