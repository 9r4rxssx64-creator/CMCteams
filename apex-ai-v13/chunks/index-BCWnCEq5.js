import{l as o}from"./monitoring-3uBGKGRH.js";import{s as a}from"../core/main-1zxfPgC1.js";import{g as i}from"./apex-tools-dispatch-core-DAn36Ign.js";import"./apex-kb-BL-mRJI7.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-CDRNXpkc.js";import"./apex-tools-dispatch-skills-BogAQ4Vd.js";import"./apex-tools-dispatch-data-D1T5OmzL.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-DFVUUqOd.js";import"./apex-tools-misc-QTFmYJ9X.js";import"./apex-tools-registry-core-BMhHY4vU.js";import"./apex-tools-registry-skills-DRX4PPQ_.js";import"./voice-BQ1FH04d.js";function h(t){const r=a.get("user")?.id??"anon";i("module.workflow",t,r)&&(t.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:600px;margin:0 auto">
      <h1 style="margin:0 0 16px;color:#c9a227">⚡ Workflows</h1>
      <p style="color:var(--ax-text-dim)">Automatise tes tâches récurrentes (IF this THEN that).</p>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;margin-top:16px">
        <h2 style="margin:0 0 12px;font-size:16px">Workflows actifs</h2>
        <p style="color:var(--ax-text-dim);font-size:14px;margin:0">Aucun workflow configuré pour le moment.</p>
        <button class="ax-btn ax-btn-primary" style="width:100%;margin-top:12px">+ Nouveau workflow</button>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;margin-top:12px">
        <h2 style="margin:0 0 12px;font-size:16px">Templates pré-configurés</h2>
        <div style="display:grid;gap:8px">
          <button class="ax-btn ax-btn-sm" style="text-align:left;padding:12px">📧 Email reçu → notification</button>
          <button class="ax-btn ax-btn-sm" style="text-align:left;padding:12px">📅 Réunion calendrier → préparer doc</button>
          <button class="ax-btn ax-btn-sm" style="text-align:left;padding:12px">🌅 Lever soleil → routine matin</button>
          <button class="ax-btn ax-btn-sm" style="text-align:left;padding:12px">📍 GPS arrivé maison → lumières on</button>
        </div>
      </div>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `,o.info("feature-workflow","rendered"))}export{h as render};
