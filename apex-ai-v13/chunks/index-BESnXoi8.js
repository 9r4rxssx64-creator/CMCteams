import{l as i}from"./monitoring-3uBGKGRH.js";import{s as o}from"../core/main-6yqAd6rq.js";import{g as e}from"./apex-tools-dispatch-9L0B42RZ.js";import"./apex-kb-Dm_IVyZM.js";import"./credential-patterns-Dy6Wjk7e.js";import"./multi-source-analyze-DuJcGHKH.js";import"./apex-tools-registry-BO9tE-vp.js";import"./voice-Cwgrqjea.js";function b(t){const r=o.get("user")?.id??"anon";e("module.domotique",t,r)&&(t.innerHTML=`
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
  `,i.info("feature-domotique","rendered"))}export{b as render};
