const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-D2lWYrYo.js","./multi-source-analyze-Bg1HHfSC.js","./apex-kb-D1VtWFD9.js","./credential-patterns-CLzI061R.js"])))=>i.map(i=>d[i]);
import{_ as s}from"./apex-kb-D1VtWFD9.js";import{e as p}from"./escape-html-BlQj2yEF.js";import{s as f,l as w}from"./monitoring-D2lWYrYo.js";import{g as h}from"./apex-tools-dispatch-core-C_k5h2yM.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-Bg1HHfSC.js";import"./apex-tools-dispatch-skills-DOw4cI4G.js";import"./apex-tools-dispatch-data-DHUpGBCD.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-fNevKu6E.js";import"./apex-tools-misc-DBbScgMK.js";import"./apex-tools-registry-core-BMhHY4vU.js";import"./apex-tools-registry-skills-DRX4PPQ_.js";const y=[{id:"tv",name:"Télévision",emoji:"📺",category:"tv",capability:"ir",actions:[{id:"power",label:"⏻ Marche/Arrêt"},{id:"vol_up",label:"🔊 Volume +"},{id:"vol_down",label:"🔉 Volume -"},{id:"channel_up",label:"⬆️ Chaîne +"},{id:"channel_down",label:"⬇️ Chaîne -"},{id:"mute",label:"🔇 Muet"},{id:"source",label:"🔌 Source"}]},{id:"lights",name:"Lumières",emoji:"💡",category:"light",capability:"bluetooth",actions:[{id:"on",label:"⏻ Allumer"},{id:"off",label:"⏼ Éteindre"},{id:"dim_up",label:"☀ Plus fort"},{id:"dim_down",label:"🌙 Plus faible"},{id:"color",label:"🎨 Couleur"}]},{id:"speaker",name:"Enceintes",emoji:"🔊",category:"audio",capability:"bluetooth",actions:[{id:"play_pause",label:"⏯ Play/Pause"},{id:"next",label:"⏭ Suivant"},{id:"prev",label:"⏮ Précédent"},{id:"vol_up",label:"🔊 Volume +"},{id:"vol_down",label:"🔉 Volume -"},{id:"airplay",label:"📡 AirPlay"}]},{id:"thermo",name:"Thermostat",emoji:"🌡",category:"climate",capability:"wifi",actions:[{id:"heat_up",label:"🔥 Chauffer +"},{id:"heat_down",label:"❄️ Chauffer -"},{id:"mode",label:"🔄 Mode"},{id:"eco",label:"🌱 Éco"}]},{id:"camera",name:"Caméras",emoji:"📹",category:"camera",capability:"wifi",actions:[{id:"view",label:"👁 Voir live"},{id:"snapshot",label:"📸 Snapshot"},{id:"record",label:"⏺ Enregistrer"}]},{id:"shade",name:"Volets",emoji:"🪟",category:"shade",capability:"bluetooth",actions:[{id:"up",label:"⬆️ Monter"},{id:"down",label:"⬇️ Descendre"},{id:"stop",label:"⏹ Stop"}]},{id:"wifi",name:"Wi-Fi",emoji:"📶",category:"network",capability:"nfc",actions:[{id:"share_nfc",label:"📲 Partager via NFC"},{id:"qr",label:"🔲 Générer QR Wi-Fi"}]},{id:"ev",name:"Borne EV",emoji:"🔌",category:"ev",capability:"nfc",actions:[{id:"badge",label:"💳 Badge RFID"},{id:"start",label:"⚡ Démarrer charge"},{id:"stop",label:"⏹ Arrêter"}]}];async function I(i){const u=f.get("user")?.id??"anon";if(!h("module.remote",i,u))return;const{deviceControl:c}=await s(async()=>{const{deviceControl:e}=await import("./device-control-Djichjgx.js");return{deviceControl:e}},__vite__mapDeps([0,1,2,3]),import.meta.url),m=c.detectDevice(),b=c.listAllSupported(),r=b.includes("nfc"),d=b.includes("bluetooth"),v=b.includes("share");i.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:800px;margin:0 auto">
      <h1 style="margin:0 0 8px;color:#c9a227">📡 Télécommande Universelle</h1>
      <p style="color:var(--ax-text-dim);margin:0 0 16px;font-size:14px">
        Pilote tous tes objets connectés depuis Apex.
        ${m.isiOS?"📱 iOS":m.isAndroid?"🤖 Android":"🖥 Desktop"} ·
        ${b.length} capabilities ·
        ${d?"✅ Bluetooth":"❌ BT"} ·
        ${r?"✅ NFC":"❌ NFC"} ·
        ${v?"✅ Share":"❌ Share"}
      </p>

      ${!d&&!r?`
        <div style="background:rgba(255,170,0,0.1);border:1px solid rgba(255,170,0,0.3);border-radius:8px;padding:12px;margin-bottom:16px;font-size:13px;color:#ffaa00">
          ⚠️ Ton appareil n'expose ni Bluetooth ni NFC au navigateur (limite Safari iOS).
          Sur Android Chrome ou desktop, plus de fonctionnalités sont disponibles.
        </div>
      `:""}

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px">
        ${y.map(e=>`
          <div class="ax-remote-card" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
              <span style="font-size:28px">${e.emoji}</span>
              <div>
                <strong style="color:#c9a227">${e.name}</strong>
                <div class="ax-gs-2">via ${e.capability}</div>
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
        <div class="ax-gs-161">
          <button class="ax-btn ax-btn-sm" id="ax-remote-scan-bt" ${d?"":"disabled"}>🔵 Scanner Bluetooth</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-scan-nfc" ${r?"":"disabled"}>📲 Lire tag NFC</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-write-nfc" ${r?"":"disabled"}>✍️ Écrire tag NFC</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-vibrate">📳 Vibrer iPhone</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-photos">📸 Trier mes photos</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-share" ${v?"":"disabled"}>📤 Partager URL</button>
        </div>
      </div>

      <div class="ax-gs-73">
        <h2 style="margin:0 0 8px;font-size:16px">🌐 Scan réseau LAN (80+ devices)</h2>
        <p style="margin:0 0 12px;color:var(--ax-text-dim);font-size:13px">Discover Hue Bridge, Sonos, Plex, NAS, caméras IP, imprimantes, IoT...</p>
        <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-scan-lan" style="width:100%">🔍 Scanner mon réseau WiFi</button>
        <div id="ax-remote-lan-results" style="margin-top:12px"></div>
      </div>

      <div class="ax-gs-73">
        <h2 style="margin:0 0 8px;font-size:16px">🪪 Badge NFC/RFID (60+ formats)</h2>
        <p style="margin:0 0 12px;color:var(--ax-text-dim);font-size:13px">Carte travail, transport, café, accès. NDEF/MIFARE/HID/Vigik...</p>
        <div class="ax-gs-162">
          <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-scan-badge" ${r?"":"disabled"}>📲 Scanner badge</button>
          <button class="ax-btn ax-btn-secondary ax-btn-sm" id="ax-remote-list-badges">📋 Mes badges</button>
        </div>
        <div id="ax-remote-badges-list" style="margin-top:12px"></div>
      </div>

      <div class="ax-gs-73">
        <h2 style="margin:0 0 8px;font-size:16px">📡 Émulateurs hardware (18 supportés)</h2>
        <p style="margin:0 0 12px;color:var(--ax-text-dim);font-size:13px">Flipper Zero (USB+BLE), Proxmark3, Chameleon, ACR122U, OMNIKEY...</p>
        <div class="ax-gs-162">
          <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-flipper-usb">🐬 Flipper USB</button>
          <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-flipper-ble">📶 Flipper BLE</button>
          <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-proxmark">🔬 Proxmark3</button>
          <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-chameleon">🦎 Chameleon</button>
        </div>
        <div id="ax-remote-emulator-status" style="margin-top:12px;font-size:12px;color:var(--ax-text-dim)"></div>
      </div>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `,i.querySelectorAll("[data-remote-device]").forEach(e=>{e.addEventListener("click",()=>{const a=e.dataset.remoteDevice,t=e.dataset.remoteAction;S(a??"",t??"")})}),i.querySelector("#ax-remote-scan-bt")?.addEventListener("click",()=>{(async()=>{const e=await c.requestBluetoothDevice([{services:["battery_service"]}]),{toast:a}=await s(async()=>{const{toast:t}=await import("./toast-CRdbcLoc.js");return{toast:t}},[],import.meta.url);e.ok&&e.data?a.success(`🔵 Trouvé : ${e.data.name??e.data.id}`):a.warn(e.reason??"Bluetooth non disponible")})()}),i.querySelector("#ax-remote-scan-nfc")?.addEventListener("click",()=>{(async()=>{const{toast:e}=await s(async()=>{const{toast:t}=await import("./toast-CRdbcLoc.js");return{toast:t}},[],import.meta.url),a=await c.requestNFCRead(t=>{const o=t.map(n=>{const l=n.data;return typeof l=="string"?l:JSON.stringify(l)}).join(" · ").slice(0,100);e.success(`📲 Tag lu : ${o}`)});a.ok?e.success("📲 Approche un tag NFC pour lire"):e.warn(a.reason??"NFC non disponible")})()}),i.querySelector("#ax-remote-write-nfc")?.addEventListener("click",()=>{(async()=>{const e=await c.requestNFCWrite([{recordType:"text",data:"Apex Remote — "+new Date().toISOString()}]),{toast:a}=await s(async()=>{const{toast:t}=await import("./toast-CRdbcLoc.js");return{toast:t}},[],import.meta.url);e.ok?a.success("✍️ Approche le tag pour écrire"):a.warn(e.reason??"NFC write non disponible")})()}),i.querySelector("#ax-remote-vibrate")?.addEventListener("click",()=>{(async()=>{const e=await c.vibrate([100,30,100,30,200]),{toast:a}=await s(async()=>{const{toast:t}=await import("./toast-CRdbcLoc.js");return{toast:t}},[],import.meta.url);e.ok?a.success("📳 Vibration envoyée"):a.warn(e.reason??"Vibration non disponible (iOS Safari)")})()}),i.querySelector("#ax-remote-photos")?.addEventListener("click",()=>{(async()=>{const e=await c.getPhotosFromGallery(),{toast:a}=await s(async()=>{const{toast:t}=await import("./toast-CRdbcLoc.js");return{toast:t}},[],import.meta.url);e.ok&&e.data?a.success(`📸 ${e.data.length} photos sélectionnées (analyse EXIF en cours)`):a.warn(e.reason??"Sélection annulée")})()}),i.querySelector("#ax-remote-share")?.addEventListener("click",()=>{(async()=>{const e=await c.shareContent({title:"Apex AI v13",text:"Mon assistant intelligent personnel",url:location.origin+location.pathname}),{toast:a}=await s(async()=>{const{toast:t}=await import("./toast-CRdbcLoc.js");return{toast:t}},[],import.meta.url);e.ok?a.success("📤 Partagé"):a.warn(e.reason??"Partage annulé")})()}),i.querySelector("#ax-remote-scan-lan")?.addEventListener("click",()=>{(async()=>{const{toast:e}=await s(async()=>{const{toast:n}=await import("./toast-CRdbcLoc.js");return{toast:n}},[],import.meta.url),{networkScan:a}=await s(async()=>{const{networkScan:n}=await import("./network-scan-BQ8R_7zL.js");return{networkScan:n}},__vite__mapDeps([0,1,2,3]),import.meta.url);e.info("🔍 Scan LAN en cours (peut prendre 30-60s)...");const t=await a.scan(),o=i.querySelector("#ax-remote-lan-results");if(o){if(!t.ok){o.innerHTML=`<p style="color:#ffaa00;font-size:13px">⚠️ ${p(t.reason??"Scan échoué")}</p>`;return}o.innerHTML=`
        <p style="font-size:12px;color:#22cc77;margin:0 0 8px">📍 IP locale : ${p(t.local_ip)} · Subnet : ${p(t.subnet)} · ${t.devices.length} devices</p>
        ${t.devices.map(n=>`
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(201,162,39,0.2);border-radius:6px;padding:8px;margin-top:6px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <strong style="color:#c9a227">${p(n.service)}</strong>
              <div class="ax-gs-2">${p(n.ip)}:${p(n.port)} ${n.vendor?"· "+p(n.vendor):""}</div>
            </div>
            <button class="ax-btn ax-btn-sm" data-lan-ip="${p(n.ip)}" data-lan-port="${p(n.port)}" style="padding:4px 8px;font-size:11px">Ouvrir →</button>
          </div>
        `).join("")}
      `,o.querySelectorAll("[data-lan-ip]").forEach(n=>{n.addEventListener("click",()=>{const l=n.dataset.lanIp,_=parseInt(n.dataset.lanPort??"80",10);l&&window.open(`http://${l}:${_}/`,"_blank","noopener,noreferrer")})}),e.success(`✅ ${t.devices.length} devices trouvés`)}})()}),i.querySelector("#ax-remote-scan-badge")?.addEventListener("click",()=>{(async()=>{const{toast:e}=await s(async()=>{const{toast:o}=await import("./toast-CRdbcLoc.js");return{toast:o}},[],import.meta.url),{badgeCloner:a}=await s(async()=>{const{badgeCloner:o}=await import("./badge-cloner-B_mswZDn.js");return{badgeCloner:o}},__vite__mapDeps([0,1,2,3]),import.meta.url);e.info("📲 Approche un tag NFC...");const t=await a.scanBadge();t.ok&&t.badge?(await a.storeBadge(t.badge,prompt("Nom du badge ?","Badge "+new Date().toLocaleDateString())??""),e.success(`✅ Badge ${t.badge.format} stocké`)):e.warn(t.reason??"Scan échoué")})()}),i.querySelector("#ax-remote-list-badges")?.addEventListener("click",()=>{(async()=>{const{badgeCloner:e}=await s(async()=>{const{badgeCloner:o}=await import("./badge-cloner-B_mswZDn.js");return{badgeCloner:o}},__vite__mapDeps([0,1,2,3]),import.meta.url),a=await e.listBadgesAsync(),t=i.querySelector("#ax-remote-badges-list");if(t){if(a.length===0){t.innerHTML='<p style="font-size:13px;color:var(--ax-text-dim)">Aucun badge stocké</p>';return}t.innerHTML=a.map(o=>`
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(201,162,39,0.2);border-radius:6px;padding:8px;margin-top:6px">
          <strong style="color:#c9a227">${o.label??o.format}</strong>
          <div class="ax-gs-2">UID: ${o.uid??"n/a"} · ${new Date(o.scanned_at).toLocaleString()}</div>
        </div>
      `).join("")}})()});const g=async()=>{const{cardEmulator:e}=await s(async()=>{const{cardEmulator:o}=await import("./card-emulator-BCKheZMD.js");return{cardEmulator:o}},__vite__mapDeps([2,0,1,3]),import.meta.url),a=e.getStatus(),t=i.querySelector("#ax-remote-emulator-status");if(t)if(a.connected){t.replaceChildren(),t.append("🟢 Connecté : ");const o=document.createElement("strong");o.textContent=String(a.device??""),t.appendChild(o),t.append(` (${String(a.connection??"")}) · ${Number(a.uptime_sec)||0}s`)}else t.textContent="⚪ Aucun émulateur connecté"};g();const x=(e,a)=>{i.querySelector(e)?.addEventListener("click",()=>{(async()=>{const{toast:t}=await s(async()=>{const{toast:l}=await import("./toast-CRdbcLoc.js");return{toast:l}},[],import.meta.url),{cardEmulator:o}=await s(async()=>{const{cardEmulator:l}=await import("./card-emulator-BCKheZMD.js");return{cardEmulator:l}},__vite__mapDeps([2,0,1,3]),import.meta.url),n=await o[a]();n.ok?(t.success("✅ Connecté"),await g()):t.warn(n.reason??"Connexion échouée")})()})};x("#ax-remote-flipper-usb","connectFlipperUSB"),x("#ax-remote-flipper-ble","connectFlipperBLE"),x("#ax-remote-proxmark","connectProxmarkSerial"),x("#ax-remote-chameleon","connectChameleonSerial"),w.info("feature-remote",`rendered ${y.length} device cards`)}async function S(i,u){const{deviceControl:c}=await s(async()=>{const{deviceControl:r}=await import("./device-control-Djichjgx.js");return{deviceControl:r}},__vite__mapDeps([0,1,2,3]),import.meta.url),{toast:m}=await s(async()=>{const{toast:r}=await import("./toast-CRdbcLoc.js");return{toast:r}},[],import.meta.url),{auditLog:b}=await s(async()=>{const{auditLog:r}=await import("./monitoring-D2lWYrYo.js").then(d=>d.q);return{auditLog:r}},__vite__mapDeps([0,1,2,3]),import.meta.url);switch(b.record("remote.action",{details:{device:i,action:u}}),c.vibrate([30]),i){case"wifi":if(u==="qr"){m.info("🔲 Génération QR Wi-Fi → vue dédiée Sprint 4");return}if(u==="share_nfc"){const r=await c.requestNFCWrite([{recordType:"text",data:"WIFI:S:MyNetwork;T:WPA;P:password;;"}]);m[r.ok?"success":"warn"](r.ok?"✍️ Approche le tag NFC":r.reason??"NFC KO");return}break;case"speaker":if(u==="airplay"){const r=await c.openMusic("");m[r.ok?"success":"warn"](r.ok?"🎵 Apple Music ouvert":"iOS only");return}break;case"camera":if(u==="snapshot"){const r=await c.requestCamera({video:!0});if(r.ok&&r.data){const d=await c.takePhoto(r.data);m[d.ok?"success":"warn"](d.ok?"📸 Photo prise":d.reason??"KO")}return}break}m.info(`📡 ${i} · ${u} envoyé (bridge IR/BT à configurer Sprint 4)`)}export{I as render};
