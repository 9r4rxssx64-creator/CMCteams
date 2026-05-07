const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./toast-Dgg9rcIP.js","./haptic-BUEqXK0N.js"])))=>i.map(i=>d[i]);
import{_ as s}from"./apex-kb-DqAXgWdy.js";import{l as _}from"./monitoring-WiO5ZBU9.js";import{e as p}from"./html-safe-CCp1QaJu.js";import"./apex-tools-registry-DPQHcZUW.js";import"./credential-patterns-DqicUg9o.js";const v=[{id:"tv",name:"Télévision",emoji:"📺",category:"tv",capability:"ir",actions:[{id:"power",label:"⏻ Marche/Arrêt"},{id:"vol_up",label:"🔊 Volume +"},{id:"vol_down",label:"🔉 Volume -"},{id:"channel_up",label:"⬆️ Chaîne +"},{id:"channel_down",label:"⬇️ Chaîne -"},{id:"mute",label:"🔇 Muet"},{id:"source",label:"🔌 Source"}]},{id:"lights",name:"Lumières",emoji:"💡",category:"light",capability:"bluetooth",actions:[{id:"on",label:"⏻ Allumer"},{id:"off",label:"⏼ Éteindre"},{id:"dim_up",label:"☀ Plus fort"},{id:"dim_down",label:"🌙 Plus faible"},{id:"color",label:"🎨 Couleur"}]},{id:"speaker",name:"Enceintes",emoji:"🔊",category:"audio",capability:"bluetooth",actions:[{id:"play_pause",label:"⏯ Play/Pause"},{id:"next",label:"⏭ Suivant"},{id:"prev",label:"⏮ Précédent"},{id:"vol_up",label:"🔊 Volume +"},{id:"vol_down",label:"🔉 Volume -"},{id:"airplay",label:"📡 AirPlay"}]},{id:"thermo",name:"Thermostat",emoji:"🌡",category:"climate",capability:"wifi",actions:[{id:"heat_up",label:"🔥 Chauffer +"},{id:"heat_down",label:"❄️ Chauffer -"},{id:"mode",label:"🔄 Mode"},{id:"eco",label:"🌱 Éco"}]},{id:"camera",name:"Caméras",emoji:"📹",category:"camera",capability:"wifi",actions:[{id:"view",label:"👁 Voir live"},{id:"snapshot",label:"📸 Snapshot"},{id:"record",label:"⏺ Enregistrer"}]},{id:"shade",name:"Volets",emoji:"🪟",category:"shade",capability:"bluetooth",actions:[{id:"up",label:"⬆️ Monter"},{id:"down",label:"⬇️ Descendre"},{id:"stop",label:"⏹ Stop"}]},{id:"wifi",name:"Wi-Fi",emoji:"📶",category:"network",capability:"nfc",actions:[{id:"share_nfc",label:"📲 Partager via NFC"},{id:"qr",label:"🔲 Générer QR Wi-Fi"}]},{id:"ev",name:"Borne EV",emoji:"🔌",category:"ev",capability:"nfc",actions:[{id:"badge",label:"💳 Badge RFID"},{id:"start",label:"⚡ Démarrer charge"},{id:"stop",label:"⏹ Arrêter"}]}];async function A(n){const{deviceControl:c}=await s(async()=>{const{deviceControl:e}=await import("./device-control-pYfiaKik.js");return{deviceControl:e}},[],import.meta.url),u=c.detectDevice(),l=c.listAllSupported(),b=l.includes("nfc"),o=l.includes("bluetooth"),m=l.includes("share");n.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:800px;margin:0 auto">
      <h1 style="margin:0 0 8px;color:#c9a227">📡 Télécommande Universelle</h1>
      <p style="color:var(--ax-text-dim);margin:0 0 16px;font-size:14px">
        Pilote tous tes objets connectés depuis Apex.
        ${u.isiOS?"📱 iOS":u.isAndroid?"🤖 Android":"🖥 Desktop"} ·
        ${l.length} capabilities ·
        ${o?"✅ Bluetooth":"❌ BT"} ·
        ${b?"✅ NFC":"❌ NFC"} ·
        ${m?"✅ Share":"❌ Share"}
      </p>

      ${!o&&!b?`
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
          <button class="ax-btn ax-btn-sm" id="ax-remote-scan-bt" ${o?"":"disabled"}>🔵 Scanner Bluetooth</button>
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
  `,n.querySelectorAll("[data-remote-device]").forEach(e=>{e.addEventListener("click",()=>{const a=e.dataset.remoteDevice,t=e.dataset.remoteAction;f(a??"",t??"")})}),n.querySelector("#ax-remote-scan-bt")?.addEventListener("click",()=>{(async()=>{const e=await c.requestBluetoothDevice([{services:["battery_service"]}]),{toast:a}=await s(async()=>{const{toast:t}=await import("./toast-Dgg9rcIP.js");return{toast:t}},__vite__mapDeps([0,1]),import.meta.url);e.ok&&e.data?a.success(`🔵 Trouvé : ${e.data.name??e.data.id}`):a.warn(e.reason??"Bluetooth non disponible")})()}),n.querySelector("#ax-remote-scan-nfc")?.addEventListener("click",()=>{(async()=>{const{toast:e}=await s(async()=>{const{toast:t}=await import("./toast-Dgg9rcIP.js");return{toast:t}},__vite__mapDeps([0,1]),import.meta.url),a=await c.requestNFCRead(t=>{const r=t.map(i=>{const d=i.data;return typeof d=="string"?d:JSON.stringify(d)}).join(" · ").slice(0,100);e.success(`📲 Tag lu : ${r}`)});a.ok?e.success("📲 Approche un tag NFC pour lire"):e.warn(a.reason??"NFC non disponible")})()}),n.querySelector("#ax-remote-write-nfc")?.addEventListener("click",()=>{(async()=>{const e=await c.requestNFCWrite([{recordType:"text",data:"Apex Remote — "+new Date().toISOString()}]),{toast:a}=await s(async()=>{const{toast:t}=await import("./toast-Dgg9rcIP.js");return{toast:t}},__vite__mapDeps([0,1]),import.meta.url);e.ok?a.success("✍️ Approche le tag pour écrire"):a.warn(e.reason??"NFC write non disponible")})()}),n.querySelector("#ax-remote-vibrate")?.addEventListener("click",()=>{(async()=>{const e=await c.vibrate([100,30,100,30,200]),{toast:a}=await s(async()=>{const{toast:t}=await import("./toast-Dgg9rcIP.js");return{toast:t}},__vite__mapDeps([0,1]),import.meta.url);e.ok?a.success("📳 Vibration envoyée"):a.warn(e.reason??"Vibration non disponible (iOS Safari)")})()}),n.querySelector("#ax-remote-photos")?.addEventListener("click",()=>{(async()=>{const e=await c.getPhotosFromGallery(),{toast:a}=await s(async()=>{const{toast:t}=await import("./toast-Dgg9rcIP.js");return{toast:t}},__vite__mapDeps([0,1]),import.meta.url);e.ok&&e.data?a.success(`📸 ${e.data.length} photos sélectionnées (analyse EXIF en cours)`):a.warn(e.reason??"Sélection annulée")})()}),n.querySelector("#ax-remote-share")?.addEventListener("click",()=>{(async()=>{const e=await c.shareContent({title:"Apex AI v13",text:"Mon assistant intelligent personnel",url:location.origin+location.pathname}),{toast:a}=await s(async()=>{const{toast:t}=await import("./toast-Dgg9rcIP.js");return{toast:t}},__vite__mapDeps([0,1]),import.meta.url);e.ok?a.success("📤 Partagé"):a.warn(e.reason??"Partage annulé")})()}),n.querySelector("#ax-remote-scan-lan")?.addEventListener("click",()=>{(async()=>{const{toast:e}=await s(async()=>{const{toast:i}=await import("./toast-Dgg9rcIP.js");return{toast:i}},__vite__mapDeps([0,1]),import.meta.url),{networkScan:a}=await s(async()=>{const{networkScan:i}=await import("./network-scan-BFhHM-X0.js");return{networkScan:i}},[],import.meta.url);e.info("🔍 Scan LAN en cours (peut prendre 30-60s)...");const t=await a.scan(),r=n.querySelector("#ax-remote-lan-results");if(r){if(!t.ok){r.innerHTML=`<p style="color:#ffaa00;font-size:13px">⚠️ ${p(t.reason??"Scan échoué")}</p>`;return}r.innerHTML=`
        <p style="font-size:12px;color:#22cc77;margin:0 0 8px">📍 IP locale : ${p(t.local_ip)} · Subnet : ${p(t.subnet)} · ${t.devices.length} devices</p>
        ${t.devices.map(i=>`
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(201,162,39,0.2);border-radius:6px;padding:8px;margin-top:6px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <strong style="color:#c9a227">${p(i.service)}</strong>
              <div style="font-size:11px;color:var(--ax-text-dim)">${p(i.ip)}:${p(i.port)} ${i.vendor?"· "+p(i.vendor):""}</div>
            </div>
            <button class="ax-btn ax-btn-sm" data-lan-ip="${p(i.ip)}" data-lan-port="${p(i.port)}" style="padding:4px 8px;font-size:11px">Ouvrir →</button>
          </div>
        `).join("")}
      `,r.querySelectorAll("[data-lan-ip]").forEach(i=>{i.addEventListener("click",()=>{const d=i.dataset.lanIp,y=parseInt(i.dataset.lanPort??"80",10);d&&window.open(`http://${d}:${y}/`,"_blank","noopener,noreferrer")})}),e.success(`✅ ${t.devices.length} devices trouvés`)}})()}),n.querySelector("#ax-remote-scan-badge")?.addEventListener("click",()=>{(async()=>{const{toast:e}=await s(async()=>{const{toast:r}=await import("./toast-Dgg9rcIP.js");return{toast:r}},__vite__mapDeps([0,1]),import.meta.url),{badgeCloner:a}=await s(async()=>{const{badgeCloner:r}=await import("./badge-cloner-DRva9NQN.js");return{badgeCloner:r}},[],import.meta.url);e.info("📲 Approche un tag NFC...");const t=await a.scanBadge();t.ok&&t.badge?(await a.storeBadge(t.badge,prompt("Nom du badge ?","Badge "+new Date().toLocaleDateString())??""),e.success(`✅ Badge ${t.badge.format} stocké`)):e.warn(t.reason??"Scan échoué")})()}),n.querySelector("#ax-remote-list-badges")?.addEventListener("click",()=>{(async()=>{const{badgeCloner:e}=await s(async()=>{const{badgeCloner:r}=await import("./badge-cloner-DRva9NQN.js");return{badgeCloner:r}},[],import.meta.url),a=await e.listBadgesAsync(),t=n.querySelector("#ax-remote-badges-list");if(t){if(a.length===0){t.innerHTML='<p style="font-size:13px;color:var(--ax-text-dim)">Aucun badge stocké</p>';return}t.innerHTML=a.map(r=>`
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(201,162,39,0.2);border-radius:6px;padding:8px;margin-top:6px">
          <strong style="color:#c9a227">${r.label??r.format}</strong>
          <div style="font-size:11px;color:var(--ax-text-dim)">UID: ${r.uid??"n/a"} · ${new Date(r.scanned_at).toLocaleString()}</div>
        </div>
      `).join("")}})()});const g=async()=>{const{cardEmulator:e}=await s(async()=>{const{cardEmulator:r}=await import("./card-emulator-DPSNbDn2.js");return{cardEmulator:r}},[],import.meta.url),a=e.getStatus(),t=n.querySelector("#ax-remote-emulator-status");if(t)if(a.connected){t.replaceChildren(),t.append("🟢 Connecté : ");const r=document.createElement("strong");r.textContent=String(a.device??""),t.appendChild(r),t.append(` (${String(a.connection??"")}) · ${Number(a.uptime_sec)||0}s`)}else t.textContent="⚪ Aucun émulateur connecté"};g();const x=(e,a)=>{n.querySelector(e)?.addEventListener("click",()=>{(async()=>{const{toast:t}=await s(async()=>{const{toast:d}=await import("./toast-Dgg9rcIP.js");return{toast:d}},__vite__mapDeps([0,1]),import.meta.url),{cardEmulator:r}=await s(async()=>{const{cardEmulator:d}=await import("./card-emulator-DPSNbDn2.js");return{cardEmulator:d}},[],import.meta.url),i=await r[a]();i.ok?(t.success("✅ Connecté"),await g()):t.warn(i.reason??"Connexion échouée")})()})};x("#ax-remote-flipper-usb","connectFlipperUSB"),x("#ax-remote-flipper-ble","connectFlipperBLE"),x("#ax-remote-proxmark","connectProxmarkSerial"),x("#ax-remote-chameleon","connectChameleonSerial"),_.info("feature-remote",`rendered ${v.length} device cards`)}async function f(n,c){const{deviceControl:u}=await s(async()=>{const{deviceControl:o}=await import("./device-control-pYfiaKik.js");return{deviceControl:o}},[],import.meta.url),{toast:l}=await s(async()=>{const{toast:o}=await import("./toast-Dgg9rcIP.js");return{toast:o}},__vite__mapDeps([0,1]),import.meta.url),{auditLog:b}=await s(async()=>{const{auditLog:o}=await import("./apex-tools-registry-DPQHcZUW.js").then(m=>m.c);return{auditLog:o}},[],import.meta.url);switch(b.record("remote.action",{details:{device:n,action:c}}),u.vibrate([30]),n){case"wifi":if(c==="qr"){l.info("🔲 Génération QR Wi-Fi → vue dédiée Sprint 4");return}if(c==="share_nfc"){const o=await u.requestNFCWrite([{recordType:"text",data:"WIFI:S:MyNetwork;T:WPA;P:password;;"}]);l[o.ok?"success":"warn"](o.ok?"✍️ Approche le tag NFC":o.reason??"NFC KO");return}break;case"speaker":if(c==="airplay"){const o=await u.openMusic("");l[o.ok?"success":"warn"](o.ok?"🎵 Apple Music ouvert":"iOS only");return}break;case"camera":if(c==="snapshot"){const o=await u.requestCamera({video:!0});if(o.ok&&o.data){const m=await u.takePhoto(o.data);l[m.ok?"success":"warn"](m.ok?"📸 Photo prise":m.reason??"KO")}return}break}l.info(`📡 ${n} · ${c} envoyé (bridge IR/BT à configurer Sprint 4)`)}export{A as render};
