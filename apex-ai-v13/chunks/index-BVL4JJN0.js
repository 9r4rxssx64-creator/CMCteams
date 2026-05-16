import{l as i}from"./monitoring-3uBGKGRH.js";import{s as o}from"../core/main-B1WxIB7L.js";import{g as e}from"./apex-tools-dispatch-core-DctfUU1m.js";import"./apex-kb-DeiFwD-R.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-6mKG7DeK.js";import"./apex-tools-dispatch-skills-L47n_BED.js";import"./apex-tools-dispatch-data-DvTVMqeD.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-XVwmy5ZQ.js";import"./apex-tools-registry-CdBWhMtq.js";import"./voice-BmvW5UQL.js";function y(t){const r=o.get("user")?.id??"anon";e("module.domotique",t,r)&&(t.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:600px;margin:0 auto">
      <h1 style="margin:0 0 16px;color:#c9a227">🏠 Domotique</h1>
      <p style="color:var(--ax-text-dim)">Pilote tes objets connectés depuis Apex.</p>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px">
        <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:32px">💡</div>
          <strong style="display:block;margin-top:8px">Lumières</strong>
          <button class="ax-btn ax-btn-sm" style="margin-top:8px;width:100%">Configurer</button>
        </div>
        <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:32px">🌡️</div>
          <strong style="display:block;margin-top:8px">Thermostat</strong>
          <button class="ax-btn ax-btn-sm" style="margin-top:8px;width:100%">Configurer</button>
        </div>
        <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:32px">📺</div>
          <strong style="display:block;margin-top:8px">TV</strong>
          <button class="ax-btn ax-btn-sm" style="margin-top:8px;width:100%">Télécommande</button>
        </div>
        <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:32px">🔒</div>
          <strong style="display:block;margin-top:8px">Sécurité</strong>
          <button class="ax-btn ax-btn-sm" style="margin-top:8px;width:100%">Caméras</button>
        </div>
      </div>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `,i.info("feature-domotique","rendered"))}export{y as render};
