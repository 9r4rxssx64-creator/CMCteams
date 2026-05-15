import{l as c}from"./monitoring-3uBGKGRH.js";import{s as l}from"../core/main-DusrDQH6.js";import{broadlinkBridge as t}from"./broadlink-bridge-DMoNWn6_.js";import{toast as a}from"./toast-ClsF1KRZ.js";import"./apex-kb-C8fOZaRx.js";import"./credential-patterns-guxfirLX.js";import"./multi-source-analyze-B_ftbu7J.js";import"./haptic-CQFg2PXZ.js";const x="kdmc_admin";function i(e){return e.replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r]??r)}function u(){return l.get("user")?.id===x}async function p(e){if(!e)return;if(!u()){e.innerHTML=`
      <div style="padding:40px;text-align:center;color:#888;font-family:system-ui,-apple-system,sans-serif">
        <h2 style="color:#c9a227">🔌 Broadlink Setup</h2>
        <p>🔒 Cette section est réservée à l'admin Kevin.</p>
      </div>
    `;return}const r=await t.status(),o=r.configured?await t.listDevices():[];e.innerHTML=g(r,o),f(e)}function g(e,r){return`
    <div style="max-width:840px;margin:0 auto;padding:18px;font-family:system-ui,-apple-system,sans-serif;color:var(--ax-text,#e5e5e5)">
      <h2 style="color:#c9a227;margin-top:0;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        🔌 Broadlink Setup ${e.configured?'<span style="background:#0a4d2c;color:#4ade80;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600">🟢 CONFIGURÉ</span>':'<span style="background:#4a1a1a;color:#f87171;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600">🔴 NON CONFIGURÉ</span>'}
      </h2>
      <p style="color:#aaa;line-height:1.5;font-size:14px">
        Pilote tes devices Broadlink (Smart TV via RM Pro/Mini, prises SP, hub MP1) directement depuis Apex.
        Token chiffré AES-GCM-256 dans le Coffre. Cross-device via Firebase backup.
      </p>

      <!-- Section 1 : Status compte -->
      <section style="margin:20px 0;background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.2);border-radius:12px;padding:18px">
        <h3 style="margin-top:0;color:#c9a227;font-size:16px">📋 Statut du compte</h3>
        ${e.configured?`<p style="margin:6px 0">📧 Email : <strong>${i(e.email??"(non visible)")}</strong></p>
             <p style="margin:6px 0">📱 Devices détectés : <strong>${e.deviceCount}</strong></p>
             ${e.proxyUrl?`<p style="margin:6px 0;font-size:12px;color:#888">🌐 Proxy : <code>${i(e.proxyUrl)}</code></p>`:""}
             <button class="ax-btn" id="ax-bl-reset" style="margin-top:12px;padding:10px 16px;background:#4a1a1a;color:#f87171;border:1px solid #f87171;border-radius:8px;cursor:pointer">🗑 Déconnecter / Reset</button>`:'<p style="margin:6px 0;color:#aaa">Pas encore configuré. Login ci-dessous OU colle photo compte Broadlink dans le chat (Apex extrait automatiquement le token).</p>'}
      </section>

      <!-- Section 2 : Login -->
      <section style="margin:20px 0;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:18px">
        <h3 style="margin-top:0;color:#c9a227;font-size:16px">🔑 Connexion compte Broadlink</h3>
        <p style="font-size:13px;color:#aaa;margin-bottom:12px">
          Saisis ton email + password Broadlink (compte mobile app). Apex récupère automatiquement le token.
          <br/>📷 <strong>Astuce</strong> : tu peux aussi coller un screenshot du compte dans le chat — Apex extrait token + devices via Vision.
        </p>
        <div style="display:flex;flex-direction:column;gap:8px">
          <input type="email" id="ax-bl-email" aria-label="Email du compte Broadlink" placeholder="email@example.com"
            value="${i(e.email??"")}"
            style="padding:12px;border-radius:8px;border:1px solid rgba(201,162,39,0.3);background:rgba(0,0,0,0.4);color:#fff;font-size:14px;min-height:44px"
            autocomplete="email" autocapitalize="off" autocorrect="off"
          />
          <input type="password" id="ax-bl-password" aria-label="Mot de passe du compte Broadlink" placeholder="Mot de passe Broadlink"
            style="padding:12px;border-radius:8px;border:1px solid rgba(201,162,39,0.3);background:rgba(0,0,0,0.4);color:#fff;font-size:14px;min-height:44px"
            autocomplete="current-password"
          />
          <button class="ax-btn ax-btn-primary" id="ax-bl-login-btn"
            style="padding:14px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:15px;min-height:48px">
            ⚡ Connexion (1-clic)
          </button>
        </div>
      </section>

      <!-- Section 3 : Devices -->
      ${e.configured?b(r):""}

      <!-- Section 4 : Settings avancés -->
      <section style="margin:20px 0;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px">
        <h3 style="margin-top:0;color:#c9a227;font-size:16px">⚙️ Avancé</h3>
        <p style="font-size:13px;color:#aaa">Si CORS bloque l'API Broadlink directe (Safari iOS PWA), configure un proxy Cloudflare Worker :</p>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <input type="url" id="ax-bl-proxy-url" aria-label="URL du proxy Cloudflare Worker Broadlink" placeholder="https://apex-broadlink-proxy.workers.dev"
            value="${i(e.proxyUrl??"")}"
            style="flex:1;min-width:220px;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:rgba(0,0,0,0.4);color:#fff;font-size:13px"
          />
          <button class="ax-btn" id="ax-bl-proxy-save" style="padding:10px 16px;background:rgba(201,162,39,0.2);color:#c9a227;border:1px solid #c9a227;border-radius:8px;cursor:pointer">💾 Sauvegarder</button>
        </div>
      </section>

      <p style="font-size:12px;color:#666;margin-top:24px;line-height:1.5">
        💡 <strong>Note Kevin</strong> : la 1ère version utilise l'API Broadlink Cloud directement.
        Si ça bloque côté CORS, déployer le worker proxy (à venir : Apex peut générer le code worker tout seul).
      </p>
    </div>
  `}function b(e){if(e.length===0)return`
      <section style="margin:20px 0;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:18px">
        <h3 style="margin-top:0;color:#c9a227;font-size:16px">📱 Devices liés au compte</h3>
        <p style="color:#aaa">Aucun device chargé. Clique <button class="ax-btn ax-btn-sm" id="ax-bl-refresh-empty" style="margin-left:6px;padding:4px 10px;border-radius:6px;background:rgba(201,162,39,0.2);color:#c9a227;border:1px solid #c9a227;cursor:pointer">🔄 Refresh</button>.</p>
      </section>
    `;const r=e.map(o=>`
        <div style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(0,0,0,0.25);border-radius:8px;margin-bottom:6px;flex-wrap:wrap">
          <span style="font-size:18px">${m(o.type)}</span>
          <div style="flex:1;min-width:140px">
            <div style="font-weight:600">${i(o.name)}</div>
            <div style="font-size:11px;color:#888">${i(o.type)} · <code>${i(o.mac)}</code></div>
          </div>
          <span style="font-size:11px;padding:2px 8px;border-radius:8px;${o.online?"background:#0a4d2c;color:#4ade80":"background:#4a1a1a;color:#f87171"}">${o.online?"🟢 online":"🔴 offline"}</span>
          ${o.type==="rm"?`<button class="ax-btn ax-btn-sm ax-bl-test" data-device-id="${i(o.id)}"
                 style="padding:6px 10px;border-radius:6px;background:rgba(201,162,39,0.2);color:#c9a227;border:1px solid #c9a227;cursor:pointer;font-size:12px">🧪 Tester IR</button>`:""}
        </div>`).join("");return`
    <section style="margin:20px 0;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:18px">
      <h3 style="margin-top:0;color:#c9a227;font-size:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        📱 Devices liés (${e.length})
        <button class="ax-btn ax-btn-sm" id="ax-bl-refresh" style="padding:6px 12px;border-radius:6px;background:rgba(201,162,39,0.2);color:#c9a227;border:1px solid #c9a227;cursor:pointer">🔄 Refresh</button>
      </h3>
      ${r}
    </section>
  `}function m(e){switch(e){case"rm":return"📺";case"sp":return"🔌";case"mp1":return"🔋";case"a1":return"🌡";default:return"📦"}}function f(e){e.querySelector("#ax-bl-login-btn")?.addEventListener("click",()=>{const r=e.querySelector("#ax-bl-email")?.value.trim()??"",o=e.querySelector("#ax-bl-password")?.value??"";if(!r||!o){a.warn("Email et mot de passe requis");return}(async()=>{a.info("🔄 Connexion à Broadlink...");const n=await t.login(r,o);n.ok?(a.success("✅ Connecté à Broadlink"),await p(e)):a.error(`❌ ${n.error??"login échoué"}`)})()}),e.querySelector("#ax-bl-reset")?.addEventListener("click",()=>{confirm("Déconnecter le compte Broadlink ? Devices et token seront supprimés.")&&(async()=>(await t.reset(),a.success("Compte Broadlink déconnecté"),await p(e)))()});for(const r of["#ax-bl-refresh","#ax-bl-refresh-empty"])e.querySelector(r)?.addEventListener("click",()=>{(async()=>{a.info("🔄 Refresh devices...");const o=await t.listDevices(!0);a.success(`${o.length} device(s) trouvé(s)`),await p(e)})()});e.querySelectorAll(".ax-bl-test").forEach(r=>{r.addEventListener("click",()=>{const o=r.dataset.deviceId??"";o&&(async()=>{const n=await t.getLearnedCodes(o);if(n.length===0){a.warn("Aucun code IR appris pour ce device. Apprends-en via app Broadlink → ils s'importent ici.");return}const s=n[0];if(!s)return;a.info(`Test envoi : ${s.name}`);const d=await t.sendIR(o,s.ir_hex);d.ok?a.success(`✅ ${s.name} envoyé`):a.error(`❌ ${d.error??"envoi échoué"}`)})()})}),e.querySelector("#ax-bl-proxy-save")?.addEventListener("click",()=>{const r=e.querySelector("#ax-bl-proxy-url")?.value.trim()??"";if(!r){try{localStorage.removeItem("ax_broadlink_proxy_url")}catch{}a.success("Proxy retiré");return}if(!/^https?:\/\//i.test(r)){a.warn("URL doit commencer par https://");return}try{localStorage.setItem("ax_broadlink_proxy_url",r)}catch{}a.success("Proxy sauvegardé")}),c.info("broadlink-setup","view rendered")}function B(){}export{B as dispose,p as render};
