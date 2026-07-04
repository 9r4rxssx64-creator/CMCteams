const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-D5tsr3af.js","./multi-source-analyze-CveK6Yjo.js","./credential-patterns-DUMYZEMu.js","./apex-kb-ChMac__O.js"])))=>i.map(i=>d[i]);
import{b as h,_ as n,e as u,l as w}from"./monitoring-D5tsr3af.js";import{g as f}from"./apex-tools-dispatch-core-BleITFnq.js";import"./multi-source-analyze-CveK6Yjo.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-ChMac__O.js";import"./apex-tools-dispatch-skills-CcaKGDki.js";import"./apex-tools-dispatch-data-CYcOlFZM.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-BdFPnSr6.js";import"./apex-tools-misc-CwZtrk_x.js";import"./apex-tools-registry-core-B4u4pCoL.js";import"./apex-tools-registry-skills-x-mAWYry.js";const _=[{id:"tv",name:"Télévision",emoji:"📺",category:"tv",capability:"ir",actions:[{id:"power",label:"⏻ Marche/Arrêt"},{id:"vol_up",label:"🔊 Volume +"},{id:"vol_down",label:"🔉 Volume -"},{id:"channel_up",label:"⬆️ Chaîne +"},{id:"channel_down",label:"⬇️ Chaîne -"},{id:"mute",label:"🔇 Muet"},{id:"source",label:"🔌 Source"}]},{id:"lights",name:"Lumières",emoji:"💡",category:"light",capability:"bluetooth",actions:[{id:"on",label:"⏻ Allumer"},{id:"off",label:"⏼ Éteindre"},{id:"dim_up",label:"☀ Plus fort"},{id:"dim_down",label:"🌙 Plus faible"},{id:"color",label:"🎨 Couleur"}]},{id:"speaker",name:"Enceintes",emoji:"🔊",category:"audio",capability:"bluetooth",actions:[{id:"play_pause",label:"⏯ Play/Pause"},{id:"next",label:"⏭ Suivant"},{id:"prev",label:"⏮ Précédent"},{id:"vol_up",label:"🔊 Volume +"},{id:"vol_down",label:"🔉 Volume -"},{id:"airplay",label:"📡 AirPlay"}]},{id:"thermo",name:"Thermostat",emoji:"🌡",category:"climate",capability:"wifi",actions:[{id:"heat_up",label:"🔥 Chauffer +"},{id:"heat_down",label:"❄️ Chauffer -"},{id:"mode",label:"🔄 Mode"},{id:"eco",label:"🌱 Éco"}]},{id:"camera",name:"Caméras",emoji:"📹",category:"camera",capability:"wifi",actions:[{id:"view",label:"👁 Voir live"},{id:"snapshot",label:"📸 Snapshot"},{id:"record",label:"⏺ Enregistrer"}]},{id:"shade",name:"Volets",emoji:"🪟",category:"shade",capability:"bluetooth",actions:[{id:"up",label:"⬆️ Monter"},{id:"down",label:"⬇️ Descendre"},{id:"stop",label:"⏹ Stop"}]},{id:"wifi",name:"Wi-Fi",emoji:"📶",category:"network",capability:"nfc",actions:[{id:"share_nfc",label:"📲 Partager via NFC"},{id:"qr",label:"🔲 Générer QR Wi-Fi"}]},{id:"ev",name:"Borne EV",emoji:"🔌",category:"ev",capability:"nfc",actions:[{id:"badge",label:"💳 Badge RFID"},{id:"start",label:"⚡ Démarrer charge"},{id:"stop",label:"⏹ Arrêter"}]}];async function V(i){const p=h.get("user")?.id??"anon";if(!f("module.remote",i,p))return;const{deviceControl:c}=await n(async()=>{const{deviceControl:e}=await import("./device-control-CGOPk7yq.js");return{deviceControl:e}},__vite__mapDeps([0,1,2,3]),import.meta.url),m=c.detectDevice(),b=c.listAllSupported(),o=b.includes("nfc"),d=b.includes("bluetooth"),g=b.includes("share");i.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:800px;margin:0 auto">
      <h1 class="ax-gs-365">📡 Télécommande Universelle</h1>
      <p class="ax-gs-377">
        Pilote tous tes objets connectés depuis Apex.
        ${m.isiOS?"📱 iOS":m.isAndroid?"🤖 Android":"🖥 Desktop"} ·
        ${b.length} capabilities ·
        ${d?"✅ Bluetooth":"❌ BT"} ·
        ${o?"✅ NFC":"❌ NFC"} ·
        ${g?"✅ Share":"❌ Share"}
      </p>

      ${!d&&!o?`
        <div style="background:rgba(255,170,0,0.1);border:1px solid rgba(255,170,0,0.3);border-radius:8px;padding:12px;margin-bottom:16px;font-size:13px;color:#ffaa00">
          ⚠️ Ton appareil n'expose ni Bluetooth ni NFC au navigateur (limite Safari iOS).
          Sur Android Chrome ou desktop, plus de fonctionnalités sont disponibles.
        </div>
      `:""}

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px">
        ${_.map(e=>`
          <div class="ax-remote-card" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
              <span class="ax-gs-201">${e.emoji}</span>
              <div>
                <strong class="ax-gs-266">${e.name}</strong>
                <div class="ax-gs-2">via ${e.capability}</div>
              </div>
            </div>
            <div class="ax-gs-247">
              ${e.actions.map(t=>`
                <button class="ax-btn ax-btn-sm ax-gs-339" data-remote-device="${e.id}" data-remote-action="${t.id}"
                 >${t.label}</button>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>

      <div style="margin-top:24px;background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px">
        <h2 class="ax-gs-432">⚙️ Outils avancés</h2>
        <div class="ax-gs-161">
          <button class="ax-btn ax-btn-sm" id="ax-remote-scan-bt" ${d?"":"disabled"}>🔵 Scanner Bluetooth</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-scan-nfc" ${o?"":"disabled"}>📲 Lire tag NFC</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-write-nfc" ${o?"":"disabled"}>✍️ Écrire tag NFC</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-vibrate">📳 Vibrer iPhone</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-photos">📸 Trier mes photos</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-share" ${g?"":"disabled"}>📤 Partager URL</button>
        </div>
      </div>

      <div class="ax-gs-73">
        <h2 class="ax-gs-432">🌐 Scan réseau LAN (80+ devices)</h2>
        <p class="ax-gs-433">Discover Hue Bridge, Sonos, Plex, NAS, caméras IP, imprimantes, IoT...</p>
        <button class="ax-btn ax-btn-primary ax-btn-sm ax-gs-361" id="ax-remote-scan-lan">🔍 Scanner mon réseau WiFi</button>
        <div id="ax-remote-lan-results" class="ax-gs-248"></div>
      </div>

      <div class="ax-gs-73">
        <h2 class="ax-gs-432">🪪 Badge NFC/RFID (60+ formats)</h2>
        <p class="ax-gs-433">Carte travail, transport, café, accès. NDEF/MIFARE/HID/Vigik...</p>
        <div class="ax-gs-162">
          <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-scan-badge" ${o?"":"disabled"}>📲 Scanner badge</button>
          <button class="ax-btn ax-btn-secondary ax-btn-sm" id="ax-remote-list-badges">📋 Mes badges</button>
        </div>
        <div id="ax-remote-badges-list" class="ax-gs-248"></div>
      </div>

      <div class="ax-gs-73">
        <h2 class="ax-gs-432">📡 Émulateurs hardware (18 supportés)</h2>
        <p class="ax-gs-433">Flipper Zero (USB+BLE), Proxmark3, Chameleon, ACR122U, OMNIKEY...</p>
        <div class="ax-gs-162">
          <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-flipper-usb">🐬 Flipper USB</button>
          <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-flipper-ble">📶 Flipper BLE</button>
          <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-proxmark">🔬 Proxmark3</button>
          <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-chameleon">🦎 Chameleon</button>
        </div>
        <div id="ax-remote-emulator-status" style="margin-top:12px;font-size:12px;color:var(--ax-text-dim)"></div>
      </div>

      <p class="ax-gs-212"><a href="#chat" class="ax-gs-198">← Retour chat</a></p>
    </div>
  `,i.querySelectorAll("[data-remote-device]").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.remoteDevice,a=e.dataset.remoteAction;S(t??"",a??"")})}),i.querySelector("#ax-remote-scan-bt")?.addEventListener("click",()=>{(async()=>{const e=await c.requestBluetoothDevice([{services:["battery_service"]}]),{toast:t}=await n(async()=>{const{toast:a}=await import("./toast-BCPNzfMv.js");return{toast:a}},[],import.meta.url);e.ok&&e.data?t.success(`🔵 Trouvé : ${e.data.name??e.data.id}`):t.warn(e.reason??"Bluetooth non disponible")})()}),i.querySelector("#ax-remote-scan-nfc")?.addEventListener("click",()=>{(async()=>{const{toast:e}=await n(async()=>{const{toast:a}=await import("./toast-BCPNzfMv.js");return{toast:a}},[],import.meta.url),t=await c.requestNFCRead(a=>{const r=a.map(s=>{const l=s.data;return typeof l=="string"?l:JSON.stringify(l)}).join(" · ").slice(0,100);e.success(`📲 Tag lu : ${r}`)});t.ok?e.success("📲 Approche un tag NFC pour lire"):e.warn(t.reason??"NFC non disponible")})()}),i.querySelector("#ax-remote-write-nfc")?.addEventListener("click",()=>{(async()=>{const e=await c.requestNFCWrite([{recordType:"text",data:"Apex Remote — "+new Date().toISOString()}]),{toast:t}=await n(async()=>{const{toast:a}=await import("./toast-BCPNzfMv.js");return{toast:a}},[],import.meta.url);e.ok?t.success("✍️ Approche le tag pour écrire"):t.warn(e.reason??"NFC write non disponible")})()}),i.querySelector("#ax-remote-vibrate")?.addEventListener("click",()=>{(async()=>{const e=await c.vibrate([100,30,100,30,200]),{toast:t}=await n(async()=>{const{toast:a}=await import("./toast-BCPNzfMv.js");return{toast:a}},[],import.meta.url);e.ok?t.success("📳 Vibration envoyée"):t.warn(e.reason??"Vibration non disponible (iOS Safari)")})()}),i.querySelector("#ax-remote-photos")?.addEventListener("click",()=>{(async()=>{const e=await c.getPhotosFromGallery(),{toast:t}=await n(async()=>{const{toast:a}=await import("./toast-BCPNzfMv.js");return{toast:a}},[],import.meta.url);e.ok&&e.data?t.success(`📸 ${e.data.length} photos sélectionnées (analyse EXIF en cours)`):t.warn(e.reason??"Sélection annulée")})()}),i.querySelector("#ax-remote-share")?.addEventListener("click",()=>{(async()=>{const e=await c.shareContent({title:"Apex AI v13",text:"Mon assistant intelligent personnel",url:location.origin+location.pathname}),{toast:t}=await n(async()=>{const{toast:a}=await import("./toast-BCPNzfMv.js");return{toast:a}},[],import.meta.url);e.ok?t.success("📤 Partagé"):t.warn(e.reason??"Partage annulé")})()}),i.querySelector("#ax-remote-scan-lan")?.addEventListener("click",()=>{(async()=>{const{toast:e}=await n(async()=>{const{toast:s}=await import("./toast-BCPNzfMv.js");return{toast:s}},[],import.meta.url),{networkScan:t}=await n(async()=>{const{networkScan:s}=await import("./network-scan-DUsoroAf.js");return{networkScan:s}},__vite__mapDeps([0,1,2,3]),import.meta.url);e.info("🔍 Scan LAN en cours (peut prendre 30-60s)...");const a=await t.scan(),r=i.querySelector("#ax-remote-lan-results");if(r){if(!a.ok){r.innerHTML=`<p style="color:#ffaa00;font-size:13px">⚠️ ${u(a.reason??"Scan échoué")}</p>`;return}r.innerHTML=`
        <p style="font-size:12px;color:#22cc77;margin:0 0 8px">📍 IP locale : ${u(a.local_ip)} · Subnet : ${u(a.subnet)} · ${a.devices.length} devices</p>
        ${a.devices.map(s=>`
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(201,162,39,0.2);border-radius:6px;padding:8px;margin-top:6px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <strong class="ax-gs-266">${u(s.service)}</strong>
              <div class="ax-gs-2">${u(s.ip)}:${u(s.port)} ${s.vendor?"· "+u(s.vendor):""}</div>
            </div>
            <button class="ax-btn ax-btn-sm ax-gs-389" data-lan-ip="${u(s.ip)}" data-lan-port="${u(s.port)}">Ouvrir →</button>
          </div>
        `).join("")}
      `,r.querySelectorAll("[data-lan-ip]").forEach(s=>{s.addEventListener("click",()=>{const l=s.dataset.lanIp,y=parseInt(s.dataset.lanPort??"80",10);l&&window.open(`http://${l}:${y}/`,"_blank","noopener,noreferrer")})}),e.success(`✅ ${a.devices.length} devices trouvés`)}})()}),i.querySelector("#ax-remote-scan-badge")?.addEventListener("click",()=>{(async()=>{const{toast:e}=await n(async()=>{const{toast:r}=await import("./toast-BCPNzfMv.js");return{toast:r}},[],import.meta.url),{badgeCloner:t}=await n(async()=>{const{badgeCloner:r}=await import("./badge-cloner-BdYpuEDA.js");return{badgeCloner:r}},__vite__mapDeps([0,1,2,3]),import.meta.url);e.info("📲 Approche un tag NFC...");const a=await t.scanBadge();a.ok&&a.badge?(await t.storeBadge(a.badge,prompt("Nom du badge ?","Badge "+new Date().toLocaleDateString())??""),e.success(`✅ Badge ${a.badge.format} stocké`)):e.warn(a.reason??"Scan échoué")})()}),i.querySelector("#ax-remote-list-badges")?.addEventListener("click",()=>{(async()=>{const{badgeCloner:e}=await n(async()=>{const{badgeCloner:r}=await import("./badge-cloner-BdYpuEDA.js");return{badgeCloner:r}},__vite__mapDeps([0,1,2,3]),import.meta.url),t=await e.listBadgesAsync(),a=i.querySelector("#ax-remote-badges-list");if(a){if(t.length===0){a.innerHTML='<p style="font-size:13px;color:var(--ax-text-dim)">Aucun badge stocké</p>';return}a.innerHTML=t.map(r=>`
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(201,162,39,0.2);border-radius:6px;padding:8px;margin-top:6px">
          <strong class="ax-gs-266">${r.label??r.format}</strong>
          <div class="ax-gs-2">UID: ${r.uid??"n/a"} · ${new Date(r.scanned_at).toLocaleString()}</div>
        </div>
      `).join("")}})()});const v=async()=>{const{cardEmulator:e}=await n(async()=>{const{cardEmulator:r}=await import("./card-emulator-GTOdEPIy.js");return{cardEmulator:r}},__vite__mapDeps([0,1,2,3]),import.meta.url),t=e.getStatus(),a=i.querySelector("#ax-remote-emulator-status");if(a)if(t.connected){a.replaceChildren(),a.append("🟢 Connecté : ");const r=document.createElement("strong");r.textContent=String(t.device??""),a.appendChild(r),a.append(` (${String(t.connection??"")}) · ${Number(t.uptime_sec)||0}s`)}else a.textContent="⚪ Aucun émulateur connecté"};v();const x=(e,t)=>{i.querySelector(e)?.addEventListener("click",()=>{(async()=>{const{toast:a}=await n(async()=>{const{toast:l}=await import("./toast-BCPNzfMv.js");return{toast:l}},[],import.meta.url),{cardEmulator:r}=await n(async()=>{const{cardEmulator:l}=await import("./card-emulator-GTOdEPIy.js");return{cardEmulator:l}},__vite__mapDeps([0,1,2,3]),import.meta.url),s=await r[t]();s.ok?(a.success("✅ Connecté"),await v()):a.warn(s.reason??"Connexion échouée")})()})};x("#ax-remote-flipper-usb","connectFlipperUSB"),x("#ax-remote-flipper-ble","connectFlipperBLE"),x("#ax-remote-proxmark","connectProxmarkSerial"),x("#ax-remote-chameleon","connectChameleonSerial"),w.info("feature-remote",`rendered ${_.length} device cards`)}async function S(i,p){const{deviceControl:c}=await n(async()=>{const{deviceControl:o}=await import("./device-control-CGOPk7yq.js");return{deviceControl:o}},__vite__mapDeps([0,1,2,3]),import.meta.url),{toast:m}=await n(async()=>{const{toast:o}=await import("./toast-BCPNzfMv.js");return{toast:o}},[],import.meta.url),{auditLog:b}=await n(async()=>{const{auditLog:o}=await import("./monitoring-D5tsr3af.js").then(d=>d.x);return{auditLog:o}},__vite__mapDeps([0,1,2,3]),import.meta.url);switch(b.record("remote.action",{details:{device:i,action:p}}),c.vibrate([30]),i){case"wifi":if(p==="qr"){m.info("🔲 Génération QR Wi-Fi → vue dédiée Sprint 4");return}if(p==="share_nfc"){const o=await c.requestNFCWrite([{recordType:"text",data:"WIFI:S:MyNetwork;T:WPA;P:password;;"}]);m[o.ok?"success":"warn"](o.ok?"✍️ Approche le tag NFC":o.reason??"NFC KO");return}break;case"speaker":if(p==="airplay"){const o=await c.openMusic("");m[o.ok?"success":"warn"](o.ok?"🎵 Apple Music ouvert":"iOS only");return}break;case"camera":if(p==="snapshot"){const o=await c.requestCamera({video:!0});if(o.ok&&o.data){const d=await c.takePhoto(o.data);m[d.ok?"success":"warn"](d.ok?"📸 Photo prise":d.reason??"KO")}return}break}m.info(`📡 ${i} · ${p} envoyé (bridge IR/BT à configurer Sprint 4)`)}export{V as render};
