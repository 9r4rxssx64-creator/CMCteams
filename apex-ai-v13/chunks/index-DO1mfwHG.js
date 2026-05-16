import{l as a}from"./monitoring-3uBGKGRH.js";import{s as o}from"../core/main-Chf9Kx4D.js";import{g as i}from"./apex-tools-dispatch-core-CscT1PrL.js";import"./apex-kb-Ss-LQHUo.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-Cb_4xPK7.js";import"./apex-tools-dispatch-skills-0fh-89Jk.js";import"./apex-tools-dispatch-data-C9w8sOql.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-BT0loxBS.js";import"./apex-tools-registry-CTvFo_GP.js";import"./voice-DMlxiGcD.js";function f(t){const r=o.get("user")?.id??"anon";i("module.workflow",t,r)&&(t.innerHTML=`
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
  `,a.info("feature-workflow","rendered"))}export{f as render};
