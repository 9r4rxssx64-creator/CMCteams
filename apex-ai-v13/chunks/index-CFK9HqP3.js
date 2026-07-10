import{l as b,b as h,e as n}from"./monitoring-DbICRMwL.js";import{c as y}from"./csp-style-helper-BEHhIhzj.js";import{iotRegistry as d}from"./iot-providers-registry-BSWsojUg.js";import{toast as s}from"./toast-BCPNzfMv.js";import"./multi-source-analyze-BD3w6c3T.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-DuVUJwm8.js";import"./broadlink-bridge-BpvnLnU-.js";import"./haptic-CQFg2PXZ.js";const v="kdmc_admin";function $(){return h.get("user")?.id===v}async function g(e){if(e){if(!$()){e.innerHTML=`
      <div class="ax-gs-62">
        <h2 class="ax-gs-266">🔌 IoT Providers</h2>
        <p>🔒 Cette section est réservée à l'admin Kevin.</p>
      </div>
    `;return}e.innerHTML=`
    <div class="ax-gs-62">
      <h2 class="ax-gs-266">🔌 IoT Providers</h2>
      <p>Chargement des providers et devices…</p>
    </div>
  `;try{const t=await d.statusAll(),a=await d.listAllDevices().catch(()=>[]);e.innerHTML=y.withNonce(k(t,a)),q(e)}catch(t){b.warn("iot-providers-view","render fail",{err:String(t)}),e.innerHTML=`
      <div style="padding:40px;text-align:center;color:#c00">
        <h2>Erreur</h2>
        <p>Impossible de charger les providers IoT.</p>
        <button onclick="location.reload()">Recharger</button>
      </div>
    `}}}function k(e,t){const a=e.filter(i=>i.status.ok).length,o=e.length;return`
    <div style="padding:16px;font-family:system-ui,-apple-system,sans-serif;max-width:980px;margin:0 auto">
      <h1 style="color:#c9a227;margin:0 0 4px">🔌 IoT Providers (Smart Home)</h1>
      <p style="color:#999;margin:0 0 20px;font-size:14px">
        ${a}/${o} providers connectés · ${t.length} devices détectés cross-provider
      </p>

      <section class="ax-gs-390">
        <h2 class="ax-gs-391">⚙️ Providers disponibles</h2>
        <div id="iot-providers-grid">
          ${e.map(i=>w(i)).join("")}
        </div>
      </section>

      <section class="ax-gs-390">
        <h2 class="ax-gs-391">📡 Devices détectés (cross-provider)</h2>
        ${t.length===0?'<p style="color:#888;text-align:center;padding:24px">Aucun device détecté. Installe un provider pour commencer.</p>':`<table class="ax-gs-392">
              <thead>
                <tr style="text-align:left;border-bottom:1px solid #333">
                  <th class="ax-gs-393">Status</th>
                  <th class="ax-gs-393">Provider</th>
                  <th class="ax-gs-393">Nom</th>
                  <th class="ax-gs-393">Type</th>
                  <th class="ax-gs-393">Capacités</th>
                  <th class="ax-gs-393">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${t.map(i=>_(i)).join("")}
              </tbody>
            </table>`}
      </section>

      <section class="ax-gs-390">
        <h2 class="ax-gs-391">🛠 Outils admin</h2>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          <button class="iot-btn" data-action="refresh-all">🔄 Refresh status</button>
          <button class="iot-btn" data-action="show-proxy">🌐 Configurer CORS proxy</button>
          <button class="iot-btn" data-action="open-broadlink">🔧 Broadlink Setup avancé</button>
        </div>
      </section>

      <section style="background:#1a1a1a;border-radius:12px;padding:16px">
        <h2 class="ax-gs-391">🤖 Apex auto-install</h2>
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
  `}function w(e){const{provider:t,status:a}=e;let o="iot-status-no",i="⚪ Non configuré";a.ok?(o="iot-status-ok",i=`🟢 OK · ${a.devices_count??0} devices`):a.reason&&a.reason!=="no_credentials"&&(o="iot-status-ko",i=`🔴 ${n(a.reason)}`);const r=a.ok;return`
    <div class="iot-card" data-provider-id="${n(t.id)}">
      <div class="iot-icon">${t.icon??"🔌"}</div>
      <div class="iot-info">
        <p class="iot-name">${n(t.name)}</p>
        <p class="iot-desc">${n(t.description??"")}</p>
        <span class="iot-status-badge ${o}">${i}</span>
      </div>
      <div class="ax-gs-29">
        <button class="iot-btn" data-action="install" data-provider-id="${n(t.id)}">
          ${r?"↻ Reconfig":"＋ Installer"}
        </button>
        ${r?`<button class="iot-btn secondary" data-action="test" data-provider-id="${n(t.id)}">Tester</button>`:`<a href="${n(t.console_url)}" target="_blank" rel="noopener" class="iot-btn secondary" style="text-align:center;text-decoration:none">Console</a>`}
      </div>
    </div>
  `}function _(e){return`
    <tr class="ax-gs-232">
      <td class="ax-gs-393">${e.online?"🟢":"⚪"}</td>
      <td style="padding:8px;color:#c9a227">${n(e.provider)}</td>
      <td style="padding:8px;color:#fff">${n(e.name)}</td>
      <td style="padding:8px;color:#aaa">${n(e.type)}</td>
      <td style="padding:8px;color:#888;font-size:11px">${n((e.capabilities??[]).join(", "))}</td>
      <td class="ax-gs-393">
        <button class="iot-btn secondary" data-action="device-on" data-provider-id="${n(e.provider)}" data-device-id="${n(e.device_id)}" title="Toggle ON">▶</button>
      </td>
    </tr>
  `}function q(e){e.addEventListener("click",t=>{const a=t.target;if(!a)return;const o=a.closest("[data-action]");if(!o)return;const i=o.dataset.action??"",r=o.dataset.providerId??"",c=o.dataset.deviceId??"";i==="install"?T(r,e):i==="test"?L(r):i==="refresh-all"?z(e):i==="show-proxy"?I():i==="open-broadlink"?location.hash="#broadlink-setup":i==="device-on"&&r&&c&&S(r,c)})}async function T(e,t){const a=d.get(e);if(!a){s.error(`Provider ${e} inconnu`);return}const o=t.querySelector("#iot-modal-host");if(!o)return;const i=A(a);o.innerHTML=`
    <div class="iot-modal-bg" data-modal-bg="1">
      <div class="iot-modal">
        <h3>${n(a.icon??"🔌")} Installer ${n(a.name)}</h3>
        <p style="color:#aaa;font-size:13px;margin:0 0 12px">${n(a.description??"")}</p>
        <p style="color:#888;font-size:12px">Console : <a href="${n(a.console_url)}" target="_blank" rel="noopener" class="ax-gs-198">${n(a.console_url)}</a></p>
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
  `,o.querySelector('[data-modal-bg="1"]')?.addEventListener("click",l=>{const p=l.target;(p.dataset.modalBg==="1"||p.dataset.modalClose==="1")&&(o.innerHTML="")});const c=o.querySelector("#iot-install-form");c?.addEventListener("submit",l=>{l.preventDefault();const p=new FormData(c),f={};for(const u of i){const m=p.get(u.name);typeof m=="string"&&m&&(f[u.credentialKey??u.name]=m)}const x=p.get("region")||void 0;C(a.id,f,x,o,t)})}function A(e){switch(e.id){case"ewelink":return[{name:"email",label:"Email eWeLink",type:"email",required:!0},{name:"password",label:"Mot de passe",type:"password",required:!0},{name:"region",label:"Région (eu, us, as, cn)",type:"text",required:!1,placeholder:"eu"}];case"tuya":return[{name:"client_id",label:"Client ID Tuya Cloud",type:"text",required:!0},{name:"client_secret",label:"Client Secret",type:"password",required:!0},{name:"uid",label:"User UID Tuya",type:"text",required:!1,placeholder:"optionnel"},{name:"access_token",label:"Access Token (si déjà obtenu)",type:"password",required:!1},{name:"region",label:"Région (eu, us, cn, in)",type:"text",required:!1,placeholder:"eu"}];case"broadlink":return[{name:"email",label:"Email Broadlink",type:"email",required:!1},{name:"password",label:"Mot de passe",type:"password",required:!1},{name:"token",label:"Token (alternative — extrait via vision)",type:"password",required:!1}];case"hue":return[{name:"bridge_ip",label:"IP Hue Bridge (LAN)",type:"text",required:!1,placeholder:"192.168.1.X"},{name:"username",label:"Username (LAN, généré bouton bridge)",type:"text",required:!1},{name:"oauth_token",label:"OAuth token (cloud)",type:"password",required:!1}];case"sonos":return[{name:"token",label:"Access Token OAuth2 Sonos",type:"password",required:!0},{name:"household",label:"Household ID",type:"text",required:!1,placeholder:"optionnel — détecté auto"}];case"home-assistant":return[{name:"url",label:"URL Home Assistant",type:"url",required:!0,placeholder:"http://192.168.1.X:8123"},{name:"token",label:"Long-Lived Access Token",type:"password",required:!0}];default:return e.credential_keys.map(t=>({name:t.replace(/^ax_[a-z]+_/,""),credentialKey:t.replace(/^ax_[a-z]+_/,""),label:t,type:/password|secret|token/i.test(t)?"password":"text",required:!1}))}}async function C(e,t,a,o,i){s.info(`Installation ${e}…`);const r=await d.configureProvider(a?{provider_id:e,credentials:t,region:a}:{provider_id:e,credentials:t});r.ok?(s.success(`✅ ${e} installé · ${r.devices_found??0} devices`),o.innerHTML="",g(i)):s.error(`❌ Échec ${e} : ${r.error??"inconnu"}`)}async function L(e){s.info(`Test ${e}…`);const t=await d.testConnection(e);t.ok?s.success(`🟢 ${e} OK · ${t.devices_count??0} devices · ${t.latency_ms??"?"}ms`):s.warn(`⚠️ ${e} : ${t.error??t.reason??"inconnu"}`)}async function z(e){s.info("Refresh status providers…"),await g(e)}function I(){const e=localStorage.getItem("ax_iot_proxy_url")??"",t=window.prompt("URL Cloudflare Worker proxy CORS (vide = direct) :",e);if(t!==null)if(t.trim()){try{localStorage.setItem("ax_iot_proxy_url",t.trim())}catch{}s.success("Proxy configuré")}else{try{localStorage.removeItem("ax_iot_proxy_url")}catch{}s.info("Proxy retiré (mode direct)")}}async function S(e,t){const a=D(e,t);s.info(`▶ Envoi ${e}/${t.slice(0,12)}…`);const o=await d.sendCommand(e,t,a);o.ok?s.success("✅ Commande envoyée"):s.error(`❌ ${o.error??o.reason??"fail"}`)}function D(e,t){switch(e){case"ewelink":return{switch:"on"};case"tuya":return{commands:[{code:"switch_led",value:!0}]};case"hue":return{on:!0};case"sonos":return{action:"play"};case"home-assistant":{const a=t.split(".")[0]??"homeassistant";return{service:a==="light"||a==="switch"?"turn_on":"toggle"}}case"broadlink":return{ir_hex:""};default:return{on:!0}}}export{g as render};
