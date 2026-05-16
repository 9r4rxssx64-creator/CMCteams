import{a as n}from"./escape-html-DGIYNPKb.js";import{l as b}from"./monitoring-DMtdadhB.js";import{i as y}from"../core/main-myvRjsi6.js";import{c as h}from"./csp-style-helper-BisGRi53.js";import{iotRegistry as d}from"./iot-providers-registry-D33h-5o0.js";import{toast as r}from"./toast-CRdbcLoc.js";import"./apex-kb-DEL_sHoX.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-CB5VpFNy.js";import"./broadlink-bridge-CSAoEt-X.js";import"./haptic-CQFg2PXZ.js";const v="kdmc_admin";function $(){return y.get("user")?.id===v}async function x(e){if(e){if(!$()){e.innerHTML=`
      <div style="padding:40px;text-align:center;color:#888;font-family:system-ui,-apple-system,sans-serif">
        <h2 style="color:#c9a227">🔌 IoT Providers</h2>
        <p>🔒 Cette section est réservée à l'admin Kevin.</p>
      </div>
    `;return}e.innerHTML=`
    <div style="padding:40px;text-align:center;color:#888;font-family:system-ui,-apple-system,sans-serif">
      <h2 style="color:#c9a227">🔌 IoT Providers</h2>
      <p>Chargement des providers et devices…</p>
    </div>
  `;try{const t=await d.statusAll(),o=await d.listAllDevices().catch(()=>[]);e.innerHTML=h.withNonce(k(t,o)),q(e)}catch(t){b.warn("iot-providers-view","render fail",{err:String(t)}),e.innerHTML=`
      <div style="padding:40px;text-align:center;color:#c00">
        <h2>Erreur</h2>
        <p>Impossible de charger les providers IoT.</p>
        <button onclick="location.reload()">Recharger</button>
      </div>
    `}}}function k(e,t){const o=e.filter(i=>i.status.ok).length,a=e.length;return`
    <div style="padding:16px;font-family:system-ui,-apple-system,sans-serif;max-width:980px;margin:0 auto">
      <h1 style="color:#c9a227;margin:0 0 4px">🔌 IoT Providers (Smart Home)</h1>
      <p style="color:#999;margin:0 0 20px;font-size:14px">
        ${o}/${a} providers connectés · ${t.length} devices détectés cross-provider
      </p>

      <section style="background:#1a1a1a;border-radius:12px;padding:16px;margin-bottom:16px">
        <h2 style="color:#c9a227;font-size:16px;margin:0 0 12px">⚙️ Providers disponibles</h2>
        <div id="iot-providers-grid">
          ${e.map(i=>w(i)).join("")}
        </div>
      </section>

      <section style="background:#1a1a1a;border-radius:12px;padding:16px;margin-bottom:16px">
        <h2 style="color:#c9a227;font-size:16px;margin:0 0 12px">📡 Devices détectés (cross-provider)</h2>
        ${t.length===0?'<p style="color:#888;text-align:center;padding:24px">Aucun device détecté. Installe un provider pour commencer.</p>':`<table style="width:100%;border-collapse:collapse;font-size:13px">
              <thead>
                <tr style="text-align:left;border-bottom:1px solid #333">
                  <th style="padding:8px">Status</th>
                  <th style="padding:8px">Provider</th>
                  <th style="padding:8px">Nom</th>
                  <th style="padding:8px">Type</th>
                  <th style="padding:8px">Capacités</th>
                  <th style="padding:8px">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${t.map(i=>_(i)).join("")}
              </tbody>
            </table>`}
      </section>

      <section style="background:#1a1a1a;border-radius:12px;padding:16px;margin-bottom:16px">
        <h2 style="color:#c9a227;font-size:16px;margin:0 0 12px">🛠 Outils admin</h2>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          <button class="iot-btn" data-action="refresh-all">🔄 Refresh status</button>
          <button class="iot-btn" data-action="show-proxy">🌐 Configurer CORS proxy</button>
          <button class="iot-btn" data-action="open-broadlink">🔧 Broadlink Setup avancé</button>
        </div>
      </section>

      <section style="background:#1a1a1a;border-radius:12px;padding:16px">
        <h2 style="color:#c9a227;font-size:16px;margin:0 0 12px">🤖 Apex auto-install</h2>
        <p style="color:#aaa;font-size:13px;margin:0 0 8px">
          Apex IA peut installer un provider en autonomie quand tu lui donnes tes credentials dans le chat.<br>
          Exemples :
        </p>
        <ul style="color:#aaa;font-size:13px;margin:0;padding-left:24px">
          <li><code>"Apex installe eWeLink avec ${n("email@example.com")} et mot de passe XXXXX"</code></li>
          <li><code>"Apex configure SmartLife avec mon client_id et client_secret Tuya Cloud"</code></li>
          <li><code>"Apex connecte mon Home Assistant http://192.168.1.X:8123 token YYYYY"</code></li>
        </ul>
      </section>

      <div id="iot-modal-host"></div>

      <style>
        .iot-card{background:#222;border-radius:8px;padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:12px}
        .iot-card .iot-icon{font-size:24px;width:32px;text-align:center}
        .iot-card .iot-info{flex:1;min-width:0}
        .iot-card .iot-name{color:#fff;font-weight:600;font-size:14px;margin:0}
        .iot-card .iot-desc{color:#888;font-size:12px;margin:2px 0 0}
        .iot-card .iot-status-badge{font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600}
        .iot-card .iot-status-ok{background:#0a4d2a;color:#7fdba0}
        .iot-card .iot-status-ko{background:#4d1a1a;color:#ff8888}
        .iot-card .iot-status-no{background:#333;color:#aaa}
        .iot-btn{background:#c9a227;color:#000;border:none;padding:8px 12px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;min-height:36px}
        .iot-btn:hover{background:#dab73f}
        .iot-btn.secondary{background:#333;color:#fff}
        .iot-btn.secondary:hover{background:#444}
        .iot-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px}
        .iot-modal{background:#1a1a1a;border-radius:12px;padding:24px;max-width:480px;width:100%;max-height:90vh;overflow-y:auto}
        .iot-modal h3{color:#c9a227;margin:0 0 12px}
        .iot-modal label{display:block;color:#aaa;font-size:13px;margin:8px 0 4px}
        .iot-modal input{width:100%;background:#0a0a0a;border:1px solid #333;color:#fff;padding:10px;border-radius:6px;font-size:14px;box-sizing:border-box}
        .iot-modal-actions{display:flex;gap:8px;margin-top:16px;justify-content:flex-end}
      </style>
    </div>
  `}function w(e){const{provider:t,status:o}=e;let a="iot-status-no",i="⚪ Non configuré";o.ok?(a="iot-status-ok",i=`🟢 OK · ${o.devices_count??0} devices`):o.reason&&o.reason!=="no_credentials"&&(a="iot-status-ko",i=`🔴 ${n(o.reason)}`);const s=o.ok;return`
    <div class="iot-card" data-provider-id="${n(t.id)}">
      <div class="iot-icon">${t.icon??"🔌"}</div>
      <div class="iot-info">
        <p class="iot-name">${n(t.name)}</p>
        <p class="iot-desc">${n(t.description??"")}</p>
        <span class="iot-status-badge ${a}">${i}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button class="iot-btn" data-action="install" data-provider-id="${n(t.id)}">
          ${s?"↻ Reconfig":"＋ Installer"}
        </button>
        ${s?`<button class="iot-btn secondary" data-action="test" data-provider-id="${n(t.id)}">Tester</button>`:`<a href="${n(t.console_url)}" target="_blank" rel="noopener" class="iot-btn secondary" style="text-align:center;text-decoration:none">Console</a>`}
      </div>
    </div>
  `}function _(e){return`
    <tr style="border-bottom:1px solid #2a2a2a">
      <td style="padding:8px">${e.online?"🟢":"⚪"}</td>
      <td style="padding:8px;color:#c9a227">${n(e.provider)}</td>
      <td style="padding:8px;color:#fff">${n(e.name)}</td>
      <td style="padding:8px;color:#aaa">${n(e.type)}</td>
      <td style="padding:8px;color:#888;font-size:11px">${n((e.capabilities??[]).join(", "))}</td>
      <td style="padding:8px">
        <button class="iot-btn secondary" data-action="device-on" data-provider-id="${n(e.provider)}" data-device-id="${n(e.device_id)}" title="Toggle ON">▶</button>
      </td>
    </tr>
  `}function q(e){e.addEventListener("click",t=>{const o=t.target;if(!o)return;const a=o.closest("[data-action]");if(!a)return;const i=a.dataset.action??"",s=a.dataset.providerId??"",c=a.dataset.deviceId??"";i==="install"?T(s,e):i==="test"?C(s):i==="refresh-all"?L(e):i==="show-proxy"?I():i==="open-broadlink"?location.hash="#broadlink-setup":i==="device-on"&&s&&c&&S(s,c)})}async function T(e,t){const o=d.get(e);if(!o){r.error(`Provider ${e} inconnu`);return}const a=t.querySelector("#iot-modal-host");if(!a)return;const i=A(o);a.innerHTML=`
    <div class="iot-modal-bg" data-modal-bg="1">
      <div class="iot-modal">
        <h3>${n(o.icon??"🔌")} Installer ${n(o.name)}</h3>
        <p style="color:#aaa;font-size:13px;margin:0 0 12px">${n(o.description??"")}</p>
        <p style="color:#888;font-size:12px">Console : <a href="${n(o.console_url)}" target="_blank" rel="noopener" style="color:#c9a227">${n(o.console_url)}</a></p>
        <form id="iot-install-form" autocomplete="off">
          ${i.map(l=>`
            <label>${n(l.label)}${l.required?" *":""}</label>
            <input name="${n(l.name)}" aria-label="${n(l.label)}" type="${n(l.type)}" placeholder="${n(l.placeholder??"")}" ${l.required?"required":""} autocomplete="off" />
          `).join("")}
          <div class="iot-modal-actions">
            <button type="button" class="iot-btn secondary" data-modal-close="1">Annuler</button>
            <button type="submit" class="iot-btn">Installer</button>
          </div>
        </form>
      </div>
    </div>
  `,a.querySelector('[data-modal-bg="1"]')?.addEventListener("click",l=>{const p=l.target;(p.dataset.modalBg==="1"||p.dataset.modalClose==="1")&&(a.innerHTML="")});const c=a.querySelector("#iot-install-form");c?.addEventListener("submit",l=>{l.preventDefault();const p=new FormData(c),f={};for(const u of i){const m=p.get(u.name);typeof m=="string"&&m&&(f[u.credentialKey??u.name]=m)}const g=p.get("region")||void 0;z(o.id,f,g,a,t)})}function A(e){switch(e.id){case"ewelink":return[{name:"email",label:"Email eWeLink",type:"email",required:!0},{name:"password",label:"Mot de passe",type:"password",required:!0},{name:"region",label:"Région (eu, us, as, cn)",type:"text",required:!1,placeholder:"eu"}];case"tuya":return[{name:"client_id",label:"Client ID Tuya Cloud",type:"text",required:!0},{name:"client_secret",label:"Client Secret",type:"password",required:!0},{name:"uid",label:"User UID Tuya",type:"text",required:!1,placeholder:"optionnel"},{name:"access_token",label:"Access Token (si déjà obtenu)",type:"password",required:!1},{name:"region",label:"Région (eu, us, cn, in)",type:"text",required:!1,placeholder:"eu"}];case"broadlink":return[{name:"email",label:"Email Broadlink",type:"email",required:!1},{name:"password",label:"Mot de passe",type:"password",required:!1},{name:"token",label:"Token (alternative — extrait via vision)",type:"password",required:!1}];case"hue":return[{name:"bridge_ip",label:"IP Hue Bridge (LAN)",type:"text",required:!1,placeholder:"192.168.1.X"},{name:"username",label:"Username (LAN, généré bouton bridge)",type:"text",required:!1},{name:"oauth_token",label:"OAuth token (cloud)",type:"password",required:!1}];case"sonos":return[{name:"token",label:"Access Token OAuth2 Sonos",type:"password",required:!0},{name:"household",label:"Household ID",type:"text",required:!1,placeholder:"optionnel — détecté auto"}];case"home-assistant":return[{name:"url",label:"URL Home Assistant",type:"url",required:!0,placeholder:"http://192.168.1.X:8123"},{name:"token",label:"Long-Lived Access Token",type:"password",required:!0}];default:return e.credential_keys.map(t=>({name:t.replace(/^ax_[a-z]+_/,""),credentialKey:t.replace(/^ax_[a-z]+_/,""),label:t,type:/password|secret|token/i.test(t)?"password":"text",required:!1}))}}async function z(e,t,o,a,i){r.info(`Installation ${e}…`);const s=await d.configureProvider(o?{provider_id:e,credentials:t,region:o}:{provider_id:e,credentials:t});s.ok?(r.success(`✅ ${e} installé · ${s.devices_found??0} devices`),a.innerHTML="",x(i)):r.error(`❌ Échec ${e} : ${s.error??"inconnu"}`)}async function C(e){r.info(`Test ${e}…`);const t=await d.testConnection(e);t.ok?r.success(`🟢 ${e} OK · ${t.devices_count??0} devices · ${t.latency_ms??"?"}ms`):r.warn(`⚠️ ${e} : ${t.error??t.reason??"inconnu"}`)}async function L(e){r.info("Refresh status providers…"),await x(e)}function I(){const e=localStorage.getItem("ax_iot_proxy_url")??"",t=window.prompt("URL Cloudflare Worker proxy CORS (vide = direct) :",e);if(t!==null)if(t.trim()){try{localStorage.setItem("ax_iot_proxy_url",t.trim())}catch{}r.success("Proxy configuré")}else{try{localStorage.removeItem("ax_iot_proxy_url")}catch{}r.info("Proxy retiré (mode direct)")}}async function S(e,t){const o=D(e,t);r.info(`▶ Envoi ${e}/${t.slice(0,12)}…`);const a=await d.sendCommand(e,t,o);a.ok?r.success("✅ Commande envoyée"):r.error(`❌ ${a.error??a.reason??"fail"}`)}function D(e,t){switch(e){case"ewelink":return{switch:"on"};case"tuya":return{commands:[{code:"switch_led",value:!0}]};case"hue":return{on:!0};case"sonos":return{action:"play"};case"home-assistant":{const o=t.split(".")[0]??"homeassistant";return{service:o==="light"||o==="switch"?"turn_on":"toggle"}}case"broadlink":return{ir_hex:""};default:return{on:!0}}}export{x as render};
