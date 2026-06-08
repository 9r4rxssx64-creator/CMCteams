import{b as p,e as i,l as d}from"./monitoring-DRVTXjnb.js";import{broadlinkBridge as t}from"./broadlink-bridge-Bo-lHqSx.js";import{toast as o}from"./toast-CRdbcLoc.js";import"./multi-source-analyze-oyVqpynn.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-HfCuLlw7.js";import"./haptic-CQFg2PXZ.js";const x="kdmc_admin";function u(){return p.get("user")?.id===x}async function c(e){if(!e)return;if(!u()){e.innerHTML=`
      <div class="ax-gs-62">
        <h2 class="ax-gs-266">🔌 Broadlink Setup</h2>
        <p>🔒 Cette section est réservée à l'admin Kevin.</p>
      </div>
    `;return}const a=await t.status(),r=a.configured?await t.listDevices():[];e.innerHTML=g(a,r),f(e)}function g(e,a){return`
    <div style="max-width:840px;margin:0 auto;padding:18px;font-family:system-ui,-apple-system,sans-serif;color:var(--ax-text,#e5e5e5)">
      <h2 style="color:#c9a227;margin-top:0;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        🔌 Broadlink Setup ${e.configured?'<span style="background:#0a4d2c;color:#4ade80;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600">🟢 CONFIGURÉ</span>':'<span style="background:#4a1a1a;color:#f87171;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600">🔴 NON CONFIGURÉ</span>'}
      </h2>
      <p class="ax-gs-340">
        Pilote tes devices Broadlink (Smart TV via RM Pro/Mini, prises SP, hub MP1) directement depuis Apex.
        Token chiffré AES-GCM-256 dans le Coffre. Cross-device via Firebase backup.
      </p>

      <!-- Section 1 : Status compte -->
      <section style="margin:20px 0;background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.2);border-radius:12px;padding:18px">
        <h3 class="ax-gs-341">📋 Statut du compte</h3>
        ${e.configured?`<p class="ax-gs-342">📧 Email : <strong>${i(e.email??"(non visible)")}</strong></p>
             <p class="ax-gs-342">📱 Devices détectés : <strong>${e.deviceCount}</strong></p>
             ${e.proxyUrl?`<p style="margin:6px 0;font-size:12px;color:#888">🌐 Proxy : <code>${i(e.proxyUrl)}</code></p>`:""}
             <button class="ax-btn" id="ax-bl-reset" style="margin-top:12px;padding:10px 16px;background:#4a1a1a;color:#f87171;border:1px solid #f87171;border-radius:8px;cursor:pointer">🗑 Déconnecter / Reset</button>`:'<p style="margin:6px 0;color:#aaa">Pas encore configuré. Login ci-dessous OU colle photo compte Broadlink dans le chat (Apex extrait automatiquement le token).</p>'}
      </section>

      <!-- Section 2 : Login -->
      <section class="ax-gs-343">
        <h3 class="ax-gs-341">🔑 Connexion compte Broadlink</h3>
        <p style="font-size:13px;color:#aaa;margin-bottom:12px">
          Saisis ton email + password Broadlink (compte mobile app). Apex récupère automatiquement le token.
          <br/>📷 <strong>Astuce</strong> : tu peux aussi coller un screenshot du compte dans le chat — Apex extrait token + devices via Vision.
        </p>
        <div class="ax-gs-123">
          <input type="email" id="ax-bl-email" aria-label="Email du compte Broadlink" placeholder="email@example.com"
            value="${i(e.email??"")}"
            class="ax-gs-344"
            autocomplete="email" autocapitalize="off" autocorrect="off"
          />
          <input type="password" id="ax-bl-password" aria-label="Mot de passe du compte Broadlink" placeholder="Mot de passe Broadlink"
            class="ax-gs-344"
            autocomplete="current-password"
          />
          <button class="ax-btn ax-btn-primary" id="ax-bl-login-btn"
            style="padding:14px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:15px;min-height:48px">
            ⚡ Connexion (1-clic)
          </button>
        </div>
      </section>

      <!-- Section 3 : Devices -->
      ${e.configured?b(a):""}

      <!-- Section 4 : Settings avancés -->
      <section style="margin:20px 0;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px">
        <h3 class="ax-gs-341">⚙️ Avancé</h3>
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
      <section class="ax-gs-343">
        <h3 class="ax-gs-341">📱 Devices liés au compte</h3>
        <p class="ax-gs-216">Aucun device chargé. Clique <button class="ax-btn ax-btn-sm" id="ax-bl-refresh-empty" style="margin-left:6px;padding:4px 10px;border-radius:6px;background:rgba(201,162,39,0.2);color:#c9a227;border:1px solid #c9a227;cursor:pointer">🔄 Refresh</button>.</p>
      </section>
    `;const a=e.map(r=>`
        <div style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(0,0,0,0.25);border-radius:8px;margin-bottom:6px;flex-wrap:wrap">
          <span class="ax-gs-17">${m(r.type)}</span>
          <div style="flex:1;min-width:140px">
            <div style="font-weight:600">${i(r.name)}</div>
            <div class="ax-gs-124">${i(r.type)} · <code>${i(r.mac)}</code></div>
          </div>
          <span style="font-size:11px;padding:2px 8px;border-radius:8px;${r.online?"background:#0a4d2c;color:#4ade80":"background:#4a1a1a;color:#f87171"}">${r.online?"🟢 online":"🔴 offline"}</span>
          ${r.type==="rm"?`<button class="ax-btn ax-btn-sm ax-bl-test" data-device-id="${i(r.id)}"
                 style="padding:6px 10px;border-radius:6px;background:rgba(201,162,39,0.2);color:#c9a227;border:1px solid #c9a227;cursor:pointer;font-size:12px">🧪 Tester IR</button>`:""}
        </div>`).join("");return`
    <section class="ax-gs-343">
      <h3 style="margin-top:0;color:#c9a227;font-size:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        📱 Devices liés (${e.length})
        <button class="ax-btn ax-btn-sm" id="ax-bl-refresh" style="padding:6px 12px;border-radius:6px;background:rgba(201,162,39,0.2);color:#c9a227;border:1px solid #c9a227;cursor:pointer">🔄 Refresh</button>
      </h3>
      ${a}
    </section>
  `}function m(e){switch(e){case"rm":return"📺";case"sp":return"🔌";case"mp1":return"🔋";case"a1":return"🌡";default:return"📦"}}function f(e){e.querySelector("#ax-bl-login-btn")?.addEventListener("click",()=>{const a=e.querySelector("#ax-bl-email")?.value.trim()??"",r=e.querySelector("#ax-bl-password")?.value??"";if(!a||!r){o.warn("Email et mot de passe requis");return}(async()=>{o.info("🔄 Connexion à Broadlink...");const s=await t.login(a,r);s.ok?(o.success("✅ Connecté à Broadlink"),await c(e)):o.error(`❌ ${s.error??"login échoué"}`)})()}),e.querySelector("#ax-bl-reset")?.addEventListener("click",()=>{confirm("Déconnecter le compte Broadlink ? Devices et token seront supprimés.")&&(async()=>(await t.reset(),o.success("Compte Broadlink déconnecté"),await c(e)))()});for(const a of["#ax-bl-refresh","#ax-bl-refresh-empty"])e.querySelector(a)?.addEventListener("click",()=>{(async()=>{o.info("🔄 Refresh devices...");const r=await t.listDevices(!0);o.success(`${r.length} device(s) trouvé(s)`),await c(e)})()});e.querySelectorAll(".ax-bl-test").forEach(a=>{a.addEventListener("click",()=>{const r=a.dataset.deviceId??"";r&&(async()=>{const s=await t.getLearnedCodes(r);if(s.length===0){o.warn("Aucun code IR appris pour ce device. Apprends-en via app Broadlink → ils s'importent ici.");return}const n=s[0];if(!n)return;o.info(`Test envoi : ${n.name}`);const l=await t.sendIR(r,n.ir_hex);l.ok?o.success(`✅ ${n.name} envoyé`):o.error(`❌ ${l.error??"envoi échoué"}`)})()})}),e.querySelector("#ax-bl-proxy-save")?.addEventListener("click",()=>{const a=e.querySelector("#ax-bl-proxy-url")?.value.trim()??"";if(!a){try{localStorage.removeItem("ax_broadlink_proxy_url")}catch{}o.success("Proxy retiré");return}if(!/^https?:\/\//i.test(a)){o.warn("URL doit commencer par https://");return}try{localStorage.setItem("ax_broadlink_proxy_url",a)}catch{}o.success("Proxy sauvegardé")}),d.info("broadlink-setup","view rendered")}function B(){}export{B as dispose,c as render};
