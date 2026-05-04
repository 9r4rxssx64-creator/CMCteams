const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./device-control-DM83hMxU.js","../core/main-DQnbGBTl.js","../assets/css/main-Bng3LWQS.css","./audit-log-Dq8H3F9a.js","./toast-BkOpdP-z.js","./haptic-BUEqXK0N.js"])))=>i.map(i=>d[i]);
import{_ as s,l as v}from"../core/main-DQnbGBTl.js";const u=[{id:"tv",name:"Télévision",emoji:"📺",category:"tv",capability:"ir",actions:[{id:"power",label:"⏻ Marche/Arrêt"},{id:"vol_up",label:"🔊 Volume +"},{id:"vol_down",label:"🔉 Volume -"},{id:"channel_up",label:"⬆️ Chaîne +"},{id:"channel_down",label:"⬇️ Chaîne -"},{id:"mute",label:"🔇 Muet"},{id:"source",label:"🔌 Source"}]},{id:"lights",name:"Lumières",emoji:"💡",category:"light",capability:"bluetooth",actions:[{id:"on",label:"⏻ Allumer"},{id:"off",label:"⏼ Éteindre"},{id:"dim_up",label:"☀ Plus fort"},{id:"dim_down",label:"🌙 Plus faible"},{id:"color",label:"🎨 Couleur"}]},{id:"speaker",name:"Enceintes",emoji:"🔊",category:"audio",capability:"bluetooth",actions:[{id:"play_pause",label:"⏯ Play/Pause"},{id:"next",label:"⏭ Suivant"},{id:"prev",label:"⏮ Précédent"},{id:"vol_up",label:"🔊 Volume +"},{id:"vol_down",label:"🔉 Volume -"},{id:"airplay",label:"📡 AirPlay"}]},{id:"thermo",name:"Thermostat",emoji:"🌡",category:"climate",capability:"wifi",actions:[{id:"heat_up",label:"🔥 Chauffer +"},{id:"heat_down",label:"❄️ Chauffer -"},{id:"mode",label:"🔄 Mode"},{id:"eco",label:"🌱 Éco"}]},{id:"camera",name:"Caméras",emoji:"📹",category:"camera",capability:"wifi",actions:[{id:"view",label:"👁 Voir live"},{id:"snapshot",label:"📸 Snapshot"},{id:"record",label:"⏺ Enregistrer"}]},{id:"shade",name:"Volets",emoji:"🪟",category:"shade",capability:"bluetooth",actions:[{id:"up",label:"⬆️ Monter"},{id:"down",label:"⬇️ Descendre"},{id:"stop",label:"⏹ Stop"}]},{id:"wifi",name:"Wi-Fi",emoji:"📶",category:"network",capability:"nfc",actions:[{id:"share_nfc",label:"📲 Partager via NFC"},{id:"qr",label:"🔲 Générer QR Wi-Fi"}]},{id:"ev",name:"Borne EV",emoji:"🔌",category:"ev",capability:"nfc",actions:[{id:"badge",label:"💳 Badge RFID"},{id:"start",label:"⚡ Démarrer charge"},{id:"stop",label:"⏹ Arrêter"}]}];async function g(r){const{deviceControl:i}=await s(async()=>{const{deviceControl:e}=await import("./device-control-DM83hMxU.js");return{deviceControl:e}},__vite__mapDeps([0,1,2,3]),import.meta.url),l=i.detectDevice(),n=i.listAllSupported(),c=n.includes("nfc"),a=n.includes("bluetooth"),d=n.includes("share");r.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:800px;margin:0 auto">
      <h1 style="margin:0 0 8px;color:#c9a227">📡 Télécommande Universelle</h1>
      <p style="color:var(--ax-text-dim);margin:0 0 16px;font-size:14px">
        Pilote tous tes objets connectés depuis Apex.
        ${l.isiOS?"📱 iOS":l.isAndroid?"🤖 Android":"🖥 Desktop"} ·
        ${n.length} capabilities ·
        ${a?"✅ Bluetooth":"❌ BT"} ·
        ${c?"✅ NFC":"❌ NFC"} ·
        ${d?"✅ Share":"❌ Share"}
      </p>

      ${!a&&!c?`
        <div style="background:rgba(255,170,0,0.1);border:1px solid rgba(255,170,0,0.3);border-radius:8px;padding:12px;margin-bottom:16px;font-size:13px;color:#ffaa00">
          ⚠️ Ton appareil n'expose ni Bluetooth ni NFC au navigateur (limite Safari iOS).
          Sur Android Chrome ou desktop, plus de fonctionnalités sont disponibles.
        </div>
      `:""}

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px">
        ${u.map(e=>`
          <div class="ax-remote-card" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
              <span style="font-size:28px">${e.emoji}</span>
              <div>
                <strong style="color:#c9a227">${e.name}</strong>
                <div style="font-size:11px;color:var(--ax-text-dim)">via ${e.capability}</div>
              </div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              ${e.actions.map(t=>`
                <button class="ax-btn ax-btn-sm" data-remote-device="${e.id}" data-remote-action="${t.id}"
                  style="font-size:12px;padding:6px 10px">${t.label}</button>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>

      <div style="margin-top:24px;background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px">
        <h2 style="margin:0 0 8px;font-size:16px">⚙️ Outils avancés</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px">
          <button class="ax-btn ax-btn-sm" id="ax-remote-scan-bt" ${a?"":"disabled"}>🔵 Scanner Bluetooth</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-scan-nfc" ${c?"":"disabled"}>📲 Lire tag NFC</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-write-nfc" ${c?"":"disabled"}>✍️ Écrire tag NFC</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-vibrate">📳 Vibrer iPhone</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-photos">📸 Trier mes photos</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-share" ${d?"":"disabled"}>📤 Partager URL</button>
        </div>
      </div>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `,r.querySelectorAll("[data-remote-device]").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.remoteDevice,o=e.dataset.remoteAction;x(t??"",o??"")})}),r.querySelector("#ax-remote-scan-bt")?.addEventListener("click",()=>{(async()=>{const e=await i.requestBluetoothDevice([{services:["battery_service"]}]),{toast:t}=await s(async()=>{const{toast:o}=await import("./toast-BkOpdP-z.js");return{toast:o}},__vite__mapDeps([4,5]),import.meta.url);e.ok&&e.data?t.success(`🔵 Trouvé : ${e.data.name??e.data.id}`):t.warn(e.reason??"Bluetooth non disponible")})()}),r.querySelector("#ax-remote-scan-nfc")?.addEventListener("click",()=>{(async()=>{const{toast:e}=await s(async()=>{const{toast:o}=await import("./toast-BkOpdP-z.js");return{toast:o}},__vite__mapDeps([4,5]),import.meta.url),t=await i.requestNFCRead(o=>{const m=o.map(b=>{const p=b.data;return typeof p=="string"?p:JSON.stringify(p)}).join(" · ").slice(0,100);e.success(`📲 Tag lu : ${m}`)});t.ok?e.success("📲 Approche un tag NFC pour lire"):e.warn(t.reason??"NFC non disponible")})()}),r.querySelector("#ax-remote-write-nfc")?.addEventListener("click",()=>{(async()=>{const e=await i.requestNFCWrite([{recordType:"text",data:"Apex Remote — "+new Date().toISOString()}]),{toast:t}=await s(async()=>{const{toast:o}=await import("./toast-BkOpdP-z.js");return{toast:o}},__vite__mapDeps([4,5]),import.meta.url);e.ok?t.success("✍️ Approche le tag pour écrire"):t.warn(e.reason??"NFC write non disponible")})()}),r.querySelector("#ax-remote-vibrate")?.addEventListener("click",()=>{(async()=>{const e=await i.vibrate([100,30,100,30,200]),{toast:t}=await s(async()=>{const{toast:o}=await import("./toast-BkOpdP-z.js");return{toast:o}},__vite__mapDeps([4,5]),import.meta.url);e.ok?t.success("📳 Vibration envoyée"):t.warn(e.reason??"Vibration non disponible (iOS Safari)")})()}),r.querySelector("#ax-remote-photos")?.addEventListener("click",()=>{(async()=>{const e=await i.getPhotosFromGallery(),{toast:t}=await s(async()=>{const{toast:o}=await import("./toast-BkOpdP-z.js");return{toast:o}},__vite__mapDeps([4,5]),import.meta.url);e.ok&&e.data?t.success(`📸 ${e.data.length} photos sélectionnées (analyse EXIF en cours)`):t.warn(e.reason??"Sélection annulée")})()}),r.querySelector("#ax-remote-share")?.addEventListener("click",()=>{(async()=>{const e=await i.shareContent({title:"Apex AI v13",text:"Mon assistant intelligent personnel",url:location.origin+location.pathname}),{toast:t}=await s(async()=>{const{toast:o}=await import("./toast-BkOpdP-z.js");return{toast:o}},__vite__mapDeps([4,5]),import.meta.url);e.ok?t.success("📤 Partagé"):t.warn(e.reason??"Partage annulé")})()}),v.info("feature-remote",`rendered ${u.length} device cards`)}async function x(r,i){const{deviceControl:l}=await s(async()=>{const{deviceControl:a}=await import("./device-control-DM83hMxU.js");return{deviceControl:a}},__vite__mapDeps([0,1,2,3]),import.meta.url),{toast:n}=await s(async()=>{const{toast:a}=await import("./toast-BkOpdP-z.js");return{toast:a}},__vite__mapDeps([4,5]),import.meta.url),{auditLog:c}=await s(async()=>{const{auditLog:a}=await import("./audit-log-Dq8H3F9a.js");return{auditLog:a}},__vite__mapDeps([3,1,2]),import.meta.url);switch(c.record("remote.action",{details:{device:r,action:i}}),l.vibrate([30]),r){case"wifi":if(i==="qr"){n.info("🔲 Génération QR Wi-Fi → vue dédiée Sprint 4");return}if(i==="share_nfc"){const a=await l.requestNFCWrite([{recordType:"text",data:"WIFI:S:MyNetwork;T:WPA;P:password;;"}]);n[a.ok?"success":"warn"](a.ok?"✍️ Approche le tag NFC":a.reason??"NFC KO");return}break;case"speaker":if(i==="airplay"){const a=await l.openMusic("");n[a.ok?"success":"warn"](a.ok?"🎵 Apple Music ouvert":"iOS only");return}break;case"camera":if(i==="snapshot"){const a=await l.requestCamera({video:!0});if(a.ok&&a.data){const d=await l.takePhoto(a.data);n[d.ok?"success":"warn"](d.ok?"📸 Photo prise":d.reason??"KO")}return}break}n.info(`📡 ${r} · ${i} envoyé (bridge IR/BT à configurer Sprint 4)`)}export{g as render};
//# sourceMappingURL=index-eooDPkNZ.js.map
