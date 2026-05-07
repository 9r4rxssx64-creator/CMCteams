const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./device-control-Dp64C2vp.js","./monitoring-B17vNBOa.js","./apex-tools-registry-Duck4KzY.js","./toast-Dgg9rcIP.js","./haptic-BUEqXK0N.js","./network-scan-3aPJBHUw.js","./badge-cloner-BG-_OEMg.js","./apex-kb-BZEQo2pJ.js","./credential-patterns-BybElwOv.js","./card-emulator-CykcVM2o.js"])))=>i.map(i=>d[i]);
import{_ as s}from"./apex-kb-BZEQo2pJ.js";import{l as _}from"./monitoring-B17vNBOa.js";import"./apex-tools-registry-Duck4KzY.js";import"./credential-patterns-BybElwOv.js";function u(o){return o==null?"":String(o).replace(/[&<>"']/g,l=>{switch(l){case"&":return"&amp;";case"<":return"&lt;";case">":return"&gt;";case'"':return"&quot;";case"'":return"&#39;";default:return l}})}const v=[{id:"tv",name:"Télévision",emoji:"📺",category:"tv",capability:"ir",actions:[{id:"power",label:"⏻ Marche/Arrêt"},{id:"vol_up",label:"🔊 Volume +"},{id:"vol_down",label:"🔉 Volume -"},{id:"channel_up",label:"⬆️ Chaîne +"},{id:"channel_down",label:"⬇️ Chaîne -"},{id:"mute",label:"🔇 Muet"},{id:"source",label:"🔌 Source"}]},{id:"lights",name:"Lumières",emoji:"💡",category:"light",capability:"bluetooth",actions:[{id:"on",label:"⏻ Allumer"},{id:"off",label:"⏼ Éteindre"},{id:"dim_up",label:"☀ Plus fort"},{id:"dim_down",label:"🌙 Plus faible"},{id:"color",label:"🎨 Couleur"}]},{id:"speaker",name:"Enceintes",emoji:"🔊",category:"audio",capability:"bluetooth",actions:[{id:"play_pause",label:"⏯ Play/Pause"},{id:"next",label:"⏭ Suivant"},{id:"prev",label:"⏮ Précédent"},{id:"vol_up",label:"🔊 Volume +"},{id:"vol_down",label:"🔉 Volume -"},{id:"airplay",label:"📡 AirPlay"}]},{id:"thermo",name:"Thermostat",emoji:"🌡",category:"climate",capability:"wifi",actions:[{id:"heat_up",label:"🔥 Chauffer +"},{id:"heat_down",label:"❄️ Chauffer -"},{id:"mode",label:"🔄 Mode"},{id:"eco",label:"🌱 Éco"}]},{id:"camera",name:"Caméras",emoji:"📹",category:"camera",capability:"wifi",actions:[{id:"view",label:"👁 Voir live"},{id:"snapshot",label:"📸 Snapshot"},{id:"record",label:"⏺ Enregistrer"}]},{id:"shade",name:"Volets",emoji:"🪟",category:"shade",capability:"bluetooth",actions:[{id:"up",label:"⬆️ Monter"},{id:"down",label:"⬇️ Descendre"},{id:"stop",label:"⏹ Stop"}]},{id:"wifi",name:"Wi-Fi",emoji:"📶",category:"network",capability:"nfc",actions:[{id:"share_nfc",label:"📲 Partager via NFC"},{id:"qr",label:"🔲 Générer QR Wi-Fi"}]},{id:"ev",name:"Borne EV",emoji:"🔌",category:"ev",capability:"nfc",actions:[{id:"badge",label:"💳 Badge RFID"},{id:"start",label:"⚡ Démarrer charge"},{id:"stop",label:"⏹ Arrêter"}]}];async function E(o){const{deviceControl:c}=await s(async()=>{const{deviceControl:e}=await import("./device-control-Dp64C2vp.js");return{deviceControl:e}},__vite__mapDeps([0,1,2]),import.meta.url),l=c.detectDevice(),d=c.listAllSupported(),b=d.includes("nfc"),i=d.includes("bluetooth"),m=d.includes("share");o.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:800px;margin:0 auto">
      <h1 style="margin:0 0 8px;color:#c9a227">📡 Télécommande Universelle</h1>
      <p style="color:var(--ax-text-dim);margin:0 0 16px;font-size:14px">
        Pilote tous tes objets connectés depuis Apex.
        ${l.isiOS?"📱 iOS":l.isAndroid?"🤖 Android":"🖥 Desktop"} ·
        ${d.length} capabilities ·
        ${i?"✅ Bluetooth":"❌ BT"} ·
        ${b?"✅ NFC":"❌ NFC"} ·
        ${m?"✅ Share":"❌ Share"}
      </p>

      ${!i&&!b?`
        <div style="background:rgba(255,170,0,0.1);border:1px solid rgba(255,170,0,0.3);border-radius:8px;padding:12px;margin-bottom:16px;font-size:13px;color:#ffaa00">
          ⚠️ Ton appareil n'expose ni Bluetooth ni NFC au navigateur (limite Safari iOS).
          Sur Android Chrome ou desktop, plus de fonctionnalités sont disponibles.
        </div>
      `:""}

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px">
        ${v.map(e=>`
          <div class="ax-remote-card" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
              <span style="font-size:28px">${e.emoji}</span>
              <div>
                <strong style="color:#c9a227">${e.name}</strong>
                <div style="font-size:11px;color:var(--ax-text-dim)">via ${e.capability}</div>
              </div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              ${e.actions.map(a=>`
                <button class="ax-btn ax-btn-sm" data-remote-device="${e.id}" data-remote-action="${a.id}"
                  style="font-size:12px;padding:6px 10px">${a.label}</button>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>

      <div style="margin-top:24px;background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px">
        <h2 style="margin:0 0 8px;font-size:16px">⚙️ Outils avancés</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px">
          <button class="ax-btn ax-btn-sm" id="ax-remote-scan-bt" ${i?"":"disabled"}>🔵 Scanner Bluetooth</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-scan-nfc" ${b?"":"disabled"}>📲 Lire tag NFC</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-write-nfc" ${b?"":"disabled"}>✍️ Écrire tag NFC</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-vibrate">📳 Vibrer iPhone</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-photos">📸 Trier mes photos</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-share" ${m?"":"disabled"}>📤 Partager URL</button>
        </div>
      </div>

      <div style="margin-top:16px;background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px">
        <h2 style="margin:0 0 8px;font-size:16px">🌐 Scan réseau LAN (80+ devices)</h2>
        <p style="margin:0 0 12px;color:var(--ax-text-dim);font-size:13px">Discover Hue Bridge, Sonos, Plex, NAS, caméras IP, imprimantes, IoT...</p>
        <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-scan-lan" style="width:100%">🔍 Scanner mon réseau WiFi</button>
        <div id="ax-remote-lan-results" style="margin-top:12px"></div>
      </div>

      <div style="margin-top:16px;background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px">
        <h2 style="margin:0 0 8px;font-size:16px">🪪 Badge NFC/RFID (60+ formats)</h2>
        <p style="margin:0 0 12px;color:var(--ax-text-dim);font-size:13px">Carte travail, transport, café, accès. NDEF/MIFARE/HID/Vigik...</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-scan-badge" ${b?"":"disabled"}>📲 Scanner badge</button>
          <button class="ax-btn ax-btn-secondary ax-btn-sm" id="ax-remote-list-badges">📋 Mes badges</button>
        </div>
        <div id="ax-remote-badges-list" style="margin-top:12px"></div>
      </div>

      <div style="margin-top:16px;background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px">
        <h2 style="margin:0 0 8px;font-size:16px">📡 Émulateurs hardware (18 supportés)</h2>
        <p style="margin:0 0 12px;color:var(--ax-text-dim);font-size:13px">Flipper Zero (USB+BLE), Proxmark3, Chameleon, ACR122U, OMNIKEY...</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-flipper-usb">🐬 Flipper USB</button>
          <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-flipper-ble">📶 Flipper BLE</button>
          <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-proxmark">🔬 Proxmark3</button>
          <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-chameleon">🦎 Chameleon</button>
        </div>
        <div id="ax-remote-emulator-status" style="margin-top:12px;font-size:12px;color:var(--ax-text-dim)"></div>
      </div>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `,o.querySelectorAll("[data-remote-device]").forEach(e=>{e.addEventListener("click",()=>{const a=e.dataset.remoteDevice,t=e.dataset.remoteAction;f(a??"",t??"")})}),o.querySelector("#ax-remote-scan-bt")?.addEventListener("click",()=>{(async()=>{const e=await c.requestBluetoothDevice([{services:["battery_service"]}]),{toast:a}=await s(async()=>{const{toast:t}=await import("./toast-Dgg9rcIP.js");return{toast:t}},__vite__mapDeps([3,4]),import.meta.url);e.ok&&e.data?a.success(`🔵 Trouvé : ${e.data.name??e.data.id}`):a.warn(e.reason??"Bluetooth non disponible")})()}),o.querySelector("#ax-remote-scan-nfc")?.addEventListener("click",()=>{(async()=>{const{toast:e}=await s(async()=>{const{toast:t}=await import("./toast-Dgg9rcIP.js");return{toast:t}},__vite__mapDeps([3,4]),import.meta.url),a=await c.requestNFCRead(t=>{const r=t.map(n=>{const p=n.data;return typeof p=="string"?p:JSON.stringify(p)}).join(" · ").slice(0,100);e.success(`📲 Tag lu : ${r}`)});a.ok?e.success("📲 Approche un tag NFC pour lire"):e.warn(a.reason??"NFC non disponible")})()}),o.querySelector("#ax-remote-write-nfc")?.addEventListener("click",()=>{(async()=>{const e=await c.requestNFCWrite([{recordType:"text",data:"Apex Remote — "+new Date().toISOString()}]),{toast:a}=await s(async()=>{const{toast:t}=await import("./toast-Dgg9rcIP.js");return{toast:t}},__vite__mapDeps([3,4]),import.meta.url);e.ok?a.success("✍️ Approche le tag pour écrire"):a.warn(e.reason??"NFC write non disponible")})()}),o.querySelector("#ax-remote-vibrate")?.addEventListener("click",()=>{(async()=>{const e=await c.vibrate([100,30,100,30,200]),{toast:a}=await s(async()=>{const{toast:t}=await import("./toast-Dgg9rcIP.js");return{toast:t}},__vite__mapDeps([3,4]),import.meta.url);e.ok?a.success("📳 Vibration envoyée"):a.warn(e.reason??"Vibration non disponible (iOS Safari)")})()}),o.querySelector("#ax-remote-photos")?.addEventListener("click",()=>{(async()=>{const e=await c.getPhotosFromGallery(),{toast:a}=await s(async()=>{const{toast:t}=await import("./toast-Dgg9rcIP.js");return{toast:t}},__vite__mapDeps([3,4]),import.meta.url);e.ok&&e.data?a.success(`📸 ${e.data.length} photos sélectionnées (analyse EXIF en cours)`):a.warn(e.reason??"Sélection annulée")})()}),o.querySelector("#ax-remote-share")?.addEventListener("click",()=>{(async()=>{const e=await c.shareContent({title:"Apex AI v13",text:"Mon assistant intelligent personnel",url:location.origin+location.pathname}),{toast:a}=await s(async()=>{const{toast:t}=await import("./toast-Dgg9rcIP.js");return{toast:t}},__vite__mapDeps([3,4]),import.meta.url);e.ok?a.success("📤 Partagé"):a.warn(e.reason??"Partage annulé")})()}),o.querySelector("#ax-remote-scan-lan")?.addEventListener("click",()=>{(async()=>{const{toast:e}=await s(async()=>{const{toast:n}=await import("./toast-Dgg9rcIP.js");return{toast:n}},__vite__mapDeps([3,4]),import.meta.url),{networkScan:a}=await s(async()=>{const{networkScan:n}=await import("./network-scan-3aPJBHUw.js");return{networkScan:n}},__vite__mapDeps([5,1,2]),import.meta.url);e.info("🔍 Scan LAN en cours (peut prendre 30-60s)...");const t=await a.scan(),r=o.querySelector("#ax-remote-lan-results");if(r){if(!t.ok){r.innerHTML=`<p style="color:#ffaa00;font-size:13px">⚠️ ${u(t.reason??"Scan échoué")}</p>`;return}r.innerHTML=`
        <p style="font-size:12px;color:#22cc77;margin:0 0 8px">📍 IP locale : ${u(t.local_ip)} · Subnet : ${u(t.subnet)} · ${t.devices.length} devices</p>
        ${t.devices.map(n=>`
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(201,162,39,0.2);border-radius:6px;padding:8px;margin-top:6px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <strong style="color:#c9a227">${u(n.service)}</strong>
              <div style="font-size:11px;color:var(--ax-text-dim)">${u(n.ip)}:${u(n.port)} ${n.vendor?"· "+u(n.vendor):""}</div>
            </div>
            <button class="ax-btn ax-btn-sm" data-lan-ip="${u(n.ip)}" data-lan-port="${u(n.port)}" style="padding:4px 8px;font-size:11px">Ouvrir →</button>
          </div>
        `).join("")}
      `,r.querySelectorAll("[data-lan-ip]").forEach(n=>{n.addEventListener("click",()=>{const p=n.dataset.lanIp,y=parseInt(n.dataset.lanPort??"80",10);p&&window.open(`http://${p}:${y}/`,"_blank","noopener,noreferrer")})}),e.success(`✅ ${t.devices.length} devices trouvés`)}})()}),o.querySelector("#ax-remote-scan-badge")?.addEventListener("click",()=>{(async()=>{const{toast:e}=await s(async()=>{const{toast:r}=await import("./toast-Dgg9rcIP.js");return{toast:r}},__vite__mapDeps([3,4]),import.meta.url),{badgeCloner:a}=await s(async()=>{const{badgeCloner:r}=await import("./badge-cloner-BG-_OEMg.js");return{badgeCloner:r}},__vite__mapDeps([6,1,2,7,8]),import.meta.url);e.info("📲 Approche un tag NFC...");const t=await a.scanBadge();t.ok&&t.badge?(await a.storeBadge(t.badge,prompt("Nom du badge ?","Badge "+new Date().toLocaleDateString())??""),e.success(`✅ Badge ${t.badge.format} stocké`)):e.warn(t.reason??"Scan échoué")})()}),o.querySelector("#ax-remote-list-badges")?.addEventListener("click",()=>{(async()=>{const{badgeCloner:e}=await s(async()=>{const{badgeCloner:r}=await import("./badge-cloner-BG-_OEMg.js");return{badgeCloner:r}},__vite__mapDeps([6,1,2,7,8]),import.meta.url),a=await e.listBadgesAsync(),t=o.querySelector("#ax-remote-badges-list");if(t){if(a.length===0){t.innerHTML='<p style="font-size:13px;color:var(--ax-text-dim)">Aucun badge stocké</p>';return}t.innerHTML=a.map(r=>`
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(201,162,39,0.2);border-radius:6px;padding:8px;margin-top:6px">
          <strong style="color:#c9a227">${r.label??r.format}</strong>
          <div style="font-size:11px;color:var(--ax-text-dim)">UID: ${r.uid??"n/a"} · ${new Date(r.scanned_at).toLocaleString()}</div>
        </div>
      `).join("")}})()});const g=async()=>{const{cardEmulator:e}=await s(async()=>{const{cardEmulator:r}=await import("./card-emulator-CykcVM2o.js");return{cardEmulator:r}},__vite__mapDeps([9,7,1,2,8]),import.meta.url),a=e.getStatus(),t=o.querySelector("#ax-remote-emulator-status");if(t)if(a.connected){t.replaceChildren(),t.append("🟢 Connecté : ");const r=document.createElement("strong");r.textContent=String(a.device??""),t.appendChild(r),t.append(` (${String(a.connection??"")}) · ${Number(a.uptime_sec)||0}s`)}else t.textContent="⚪ Aucun émulateur connecté"};g();const x=(e,a)=>{o.querySelector(e)?.addEventListener("click",()=>{(async()=>{const{toast:t}=await s(async()=>{const{toast:p}=await import("./toast-Dgg9rcIP.js");return{toast:p}},__vite__mapDeps([3,4]),import.meta.url),{cardEmulator:r}=await s(async()=>{const{cardEmulator:p}=await import("./card-emulator-CykcVM2o.js");return{cardEmulator:p}},__vite__mapDeps([9,7,1,2,8]),import.meta.url),n=await r[a]();n.ok?(t.success("✅ Connecté"),await g()):t.warn(n.reason??"Connexion échouée")})()})};x("#ax-remote-flipper-usb","connectFlipperUSB"),x("#ax-remote-flipper-ble","connectFlipperBLE"),x("#ax-remote-proxmark","connectProxmarkSerial"),x("#ax-remote-chameleon","connectChameleonSerial"),_.info("feature-remote",`rendered ${v.length} device cards`)}async function f(o,c){const{deviceControl:l}=await s(async()=>{const{deviceControl:i}=await import("./device-control-Dp64C2vp.js");return{deviceControl:i}},__vite__mapDeps([0,1,2]),import.meta.url),{toast:d}=await s(async()=>{const{toast:i}=await import("./toast-Dgg9rcIP.js");return{toast:i}},__vite__mapDeps([3,4]),import.meta.url),{auditLog:b}=await s(async()=>{const{auditLog:i}=await import("./apex-tools-registry-Duck4KzY.js").then(m=>m.c);return{auditLog:i}},__vite__mapDeps([2,1]),import.meta.url);switch(b.record("remote.action",{details:{device:o,action:c}}),l.vibrate([30]),o){case"wifi":if(c==="qr"){d.info("🔲 Génération QR Wi-Fi → vue dédiée Sprint 4");return}if(c==="share_nfc"){const i=await l.requestNFCWrite([{recordType:"text",data:"WIFI:S:MyNetwork;T:WPA;P:password;;"}]);d[i.ok?"success":"warn"](i.ok?"✍️ Approche le tag NFC":i.reason??"NFC KO");return}break;case"speaker":if(c==="airplay"){const i=await l.openMusic("");d[i.ok?"success":"warn"](i.ok?"🎵 Apple Music ouvert":"iOS only");return}break;case"camera":if(c==="snapshot"){const i=await l.requestCamera({video:!0});if(i.ok&&i.data){const m=await l.takePhoto(i.data);d[m.ok?"success":"warn"](m.ok?"📸 Photo prise":m.reason??"KO")}return}break}d.info(`📡 ${o} · ${c} envoyé (bridge IR/BT à configurer Sprint 4)`)}export{E as render};
//# sourceMappingURL=index-bA2iwVx1.js.map
