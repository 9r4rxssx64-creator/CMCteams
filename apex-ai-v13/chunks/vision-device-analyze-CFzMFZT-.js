import{l}from"./monitoring-3uBGKGRH.js";import{a}from"./apex-kb-DNf_z_6Q.js";import{vision as p}from"./vision-3LieGMb6.js";import"./credential-patterns-CLzI061R.js";const y=`Tu es un expert configuration domotique.
Cette image est un screenshot d'un compte Broadlink (app mobile, web dashboard, ou export config).
Extrais TOUTES les infos visibles utiles pour piloter les devices Broadlink :
- email (compte)
- token (API token, access_token, ou clé d'API)
- devices : liste {id, name, mac, type} pour chaque device visible

Réponds UNIQUEMENT en JSON strict, sans markdown, sans backticks :
{
  "email": "...",
  "token": "...",
  "devices": [{"id":"...","name":"...","mac":"...","type":"..."}],
  "raw_text": "tout le texte visible (utile pour debug)",
  "confidence": 0.0-1.0
}

Si une info manque, omet-la (ne mets pas null/empty). Si l'image n'est PAS un compte Broadlink, mets confidence: 0 et explique dans raw_text.`,_=`Tu es un expert configuration TV connectée.
Cette image est un screenshot d'un écran "Information réseau" / "Network Info" / "À propos" d'une Smart TV.
Extrais TOUTES les infos visibles :
- mac (adresse MAC, format XX:XX:XX:XX:XX:XX)
- ip (IPv4)
- ssid (nom du Wi-Fi)
- brand (marque : Samsung, LG, Sony, TCL, Hisense, Clayton, ...)
- model (référence modèle)
- ir_codes (codes IR/CEC visibles si dispo)

Réponds UNIQUEMENT en JSON strict, sans markdown, sans backticks :
{
  "mac": "...",
  "ip": "...",
  "ssid": "...",
  "brand": "...",
  "model": "...",
  "ir_codes": [],
  "raw_text": "tout le texte visible",
  "confidence": 0.0-1.0
}

Si une info manque, omet-la. Si pas une TV, mets confidence: 0.`,v=`Tu es un expert configuration objets connectés.
Cette image est un screenshot d'un device IoT / domotique. Détermine d'abord son type :
- broadlink_account : compte / dashboard Broadlink
- smart_tv : info réseau / à propos d'une Smart TV
- hue_bridge : Philips Hue (bridge ou app)
- sonos : enceinte Sonos
- router_admin : interface admin routeur (OUI/MAC table)
- unknown : autre

Puis extrais TOUS les champs utiles (mac, ip, ssid, token, brand, model, serial, port, etc.).

Réponds UNIQUEMENT en JSON strict :
{
  "type": "broadlink_account|smart_tv|hue_bridge|sonos|router_admin|unknown",
  "extracted_fields": { "field_name": "value", ... },
  "raw_text": "tout le texte visible",
  "confidence": 0.0-1.0
}`;function g(r){const i=r.indexOf("base64,");return i>=0?r.slice(i+7):r}function f(r){const i=r.trim();if(i.startsWith("{"))try{return JSON.parse(i)}catch{}const t=i.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);if(t&&t[1])try{return JSON.parse(t[1].trim())}catch{}const e=i.match(/\{[\s\S]*\}/);if(e)try{return JSON.parse(e[0])}catch{}return null}class b{async analyzeBroadlinkAccount(i){const t=await this.runVisionPrompt(i,y);if(!t)return{raw_text:"",confidence:0};const e=f(t.description);if(!e)return a.record("vision_device.broadlink.no_json",{details:{description:t.description.slice(0,200)}}),{raw_text:t.description,confidence:0};const n={raw_text:typeof e.raw_text=="string"?e.raw_text:t.description,confidence:typeof e.confidence=="number"?e.confidence:.5};return typeof e.email=="string"&&e.email&&(n.email=e.email),typeof e.token=="string"&&e.token&&(n.token=e.token),Array.isArray(e.devices)&&(n.devices=e.devices.map(c=>{const o=c,s={};return typeof o.id=="string"&&(s.id=o.id),typeof o.name=="string"&&(s.name=o.name),typeof o.mac=="string"&&(s.mac=o.mac),typeof o.type=="string"&&(s.type=o.type),s})),a.record("vision_device.broadlink.success",{details:{has_token:!!n.token,devices_count:n.devices?.length??0,confidence:n.confidence}}),l.info("vision-device-analyze","Broadlink account analyzed",{hasToken:!!n.token,devicesCount:n.devices?.length??0}),n}async analyzeSmartTV(i){const t=await this.runVisionPrompt(i,_);if(!t)return{raw_text:"",confidence:0};const e=f(t.description);if(!e)return a.record("vision_device.smart_tv.no_json",{details:{description:t.description.slice(0,200)}}),{raw_text:t.description,confidence:0};const n={raw_text:typeof e.raw_text=="string"?e.raw_text:t.description,confidence:typeof e.confidence=="number"?e.confidence:.5};return typeof e.mac=="string"&&e.mac&&(n.mac=e.mac),typeof e.ip=="string"&&e.ip&&(n.ip=e.ip),typeof e.ssid=="string"&&e.ssid&&(n.ssid=e.ssid),typeof e.brand=="string"&&e.brand&&(n.brand=e.brand),typeof e.model=="string"&&e.model&&(n.model=e.model),Array.isArray(e.ir_codes)&&(n.ir_codes=e.ir_codes.filter(c=>typeof c=="string")),a.record("vision_device.smart_tv.success",{details:{brand:n.brand,model:n.model,has_mac:!!n.mac,confidence:n.confidence}}),l.info("vision-device-analyze","Smart TV analyzed",{brand:n.brand,model:n.model}),n}async analyzeDeviceInfo(i){const t=await this.runVisionPrompt(i,v);if(!t)return{type:"unknown",extracted_fields:{},raw_text:"",confidence:0};const e=f(t.description);if(!e)return{type:"unknown",extracted_fields:{},raw_text:t.description,confidence:0};const n=["broadlink_account","smart_tv","hue_bridge","sonos","router_admin","unknown"],c=typeof e.type=="string"&&n.includes(e.type)?e.type:"unknown",o={};if(e.extracted_fields&&typeof e.extracted_fields=="object"){const u=e.extracted_fields;for(const[m,d]of Object.entries(u))typeof d=="string"&&d?o[m]=d:typeof d=="number"&&(o[m]=String(d))}const s={type:c,extracted_fields:o,raw_text:typeof e.raw_text=="string"?e.raw_text:t.description,confidence:typeof e.confidence=="number"?e.confidence:.5};return a.record("vision_device.generic.success",{details:{type:s.type,fields_count:Object.keys(o).length,confidence:s.confidence}}),s}async autoDetectAndAnalyze(i){const t=await this.analyzeDeviceInfo(i),e={type:t.type,generic:t};return t.type==="broadlink_account"&&t.confidence>=.5?e.broadlink=await this.analyzeBroadlinkAccount(i):t.type==="smart_tv"&&t.confidence>=.5&&(e.smartTv=await this.analyzeSmartTV(i)),e}async runVisionPrompt(i,t){try{const e={prompt:t};if(i.imageBlob)e.imageBlob=i.imageBlob;else if(i.imageDataUrl)e.imageBase64=g(i.imageDataUrl);else if(i.imageBase64)e.imageBase64=i.imageBase64;else return null;return{description:(await p.analyze(e)).description}}catch(e){const n=e instanceof Error?e.message:String(e);return l.warn("vision-device-analyze","runVisionPrompt failed",{err:n}),a.record("vision_device.fail",{details:{error:n.slice(0,200)}}),null}}}const T=new b;export{T as visionDeviceAnalyze};
