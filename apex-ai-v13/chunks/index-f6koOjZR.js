import{e as p}from"./escape-html-BlQj2yEF.js";import{c as S}from"./listener-cleanup-Y2rGGxxX.js";import{l as f,s as k}from"./monitoring-IylaM7fC.js";import{g as $}from"./apex-tools-dispatch-core-CrIin2T7.js";import{haptic as g}from"./haptic-CQFg2PXZ.js";import{toast as x}from"./toast-CRdbcLoc.js";import"./multi-source-analyze-EZnZFDrm.js";import"./apex-kb-CSQ6lrzQ.js";import"./credential-patterns-CLzI061R.js";import"./apex-tools-dispatch-skills-BIR2EZr6.js";import"./apex-tools-dispatch-data-_yBit20W.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-BaXkVqrC.js";import"./apex-tools-misc-rxIglcY4.js";import"./apex-tools-registry-core-BMhHY4vU.js";import"./apex-tools-registry-skills-DRX4PPQ_.js";let o=null;function P(){o?.cleanup(),o=null}const b="ax_scan_history",m=20,d={email:/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,phone:/^(\+?\d{1,3}[\s.-]?)?(\(?\d{1,4}\)?[\s.-]?){2,5}\d{2,4}$/,url:/^https?:\/\/[^\s]+$/i,iban:/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/,api_key_anthropic:/^sk-ant-api\d{2}-[A-Za-z0-9_-]{40,}$/,api_key_openai:/^sk-[A-Za-z0-9]{40,}$/,api_key_github_pat:/^ghp_[A-Za-z0-9]{36}$/,btc_addr:/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,eth_addr:/^0x[a-fA-F0-9]{40}$/};function v(t){return d.email.test(t)?"email":d.api_key_anthropic.test(t)||d.api_key_openai.test(t)||d.api_key_github_pat.test(t)?"api_key":d.iban.test(t.replace(/\s/g,""))?"iban":d.url.test(t)?"url":d.btc_addr.test(t)?"btc_addr":d.eth_addr.test(t)?"eth_addr":d.phone.test(t)&&t.replace(/\D/g,"").length>=10?"phone":"plain"}function C(t){if(!t)return[];const e=[],n=t.split(/\r?\n/).map(r=>r.trim()).filter(Boolean),a=new Set;for(const r of n){const c=v(r);if(c!=="plain"&&!a.has(r)){e.push({kind:c,value:r}),a.add(r);continue}const u=r.split(/[\s,;]+/).filter(s=>s.length>=5);for(const s of u){const i=v(s);i!=="plain"&&!a.has(s)&&(e.push({kind:i,value:s}),a.add(s))}}return e}async function q(t){const e=window;if(!e.BarcodeDetector)return f.warn("studios-scan","BarcodeDetector API not supported"),null;try{const n=new e.BarcodeDetector({formats:["qr_code","code_128","code_39","ean_13","ean_8","upc_a","upc_e","data_matrix"]}),a=t instanceof Blob?await createImageBitmap(t):t;return(await n.detect(a)).map(c=>({value:c.rawValue,format:c.format}))}catch(n){return f.warn("studios-scan","BarcodeDetector failed",{err:n}),null}}function h(){try{const t=localStorage.getItem(b);if(!t)return[];const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch{return[]}}function A(t){try{const e=[...h(),t],n=e.length>m?e.slice(e.length-m):e;localStorage.setItem(b,JSON.stringify(n))}catch(e){f.warn("studios-scan","history save failed",{err:e})}}function B(){localStorage.removeItem(b)}function Q(t){o?.cleanup(),o=S("studios-scan");const e=k.get("user")?.id??"anon";if(!$("studio.scan",t,e))return;const a=typeof window.BarcodeDetector<"u";t.innerHTML=`
    <div class="ax-page ax-gs-451">
      <header class="ax-gs-210">
        <h1 class="ax-gs-333">📷 Studio Scan</h1>
        <span class="ax-gs-3">OCR · QR · Barcode</span>
      </header>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">Scanner une image</h2>
        <input type="file" id="ax-scan-file" aria-label="Sélectionner ou prendre une photo à scanner" accept="image/*" capture="environment" class="ax-gs-359">
        <button class="ax-btn ax-btn-primary ax-gs-352" id="ax-scan-pick">📷 Choisir / prendre photo</button>
        <div id="ax-scan-preview" class="ax-gs-248"></div>
        <div id="ax-scan-status" style="margin-top:8px;color:var(--ax-text-dim);font-size:13px"></div>
      </div>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">Coller du texte</h2>
        <textarea id="ax-scan-text" placeholder="Colle un texte (email, code, IBAN, URL…)" rows="4" style="width:100%;padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px"></textarea>
        <button class="ax-btn ax-btn-primary ax-gs-454" id="ax-scan-text-btn">🔍 Analyser</button>
      </div>

      <div id="ax-scan-results" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px;display:none">
        <h2 class="ax-gs-452">Détections</h2>
        <div id="ax-scan-detections"></div>
      </div>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">Historique (${h().length}/${m})</h2>
        <div id="ax-scan-history"></div>
        <button class="ax-btn ax-gs-454" id="ax-scan-clear-history">🗑 Vider</button>
      </div>

      <p class="ax-gs-469">${a?"BarcodeDetector natif disponible.":"BarcodeDetector non supporté ce navigateur — texte uniquement."}</p>
      <p class="ax-gs-212"><a href="#studios" class="ax-gs-198">← Retour studios</a></p>
    </div>
  `,y(t),H(t)}function y(t){const e=t.querySelector("#ax-scan-history");if(!e)return;const n=h();if(n.length===0){e.innerHTML=`<div class="ax-gs-3">Aucun scan pour l'instant.</div>`;return}e.innerHTML=n.slice().reverse().map(a=>{const r=new Date(a.ts).toLocaleString("fr-FR",{dateStyle:"short",timeStyle:"short"});return`
      <div style="background:rgba(255,255,255,0.03);border:1px solid #333;border-radius:6px;padding:8px;margin-bottom:6px">
        <div class="ax-gs-2">${p(r)} · ${p(a.type)}</div>
        <div style="font-size:13px;color:#c9a227;margin-top:4px;word-break:break-all">${p(a.raw.slice(0,200))}${a.raw.length>200?"…":""}</div>
      </div>
    `}).join("")}function _(t,e,n){const a=C(e),r=t.querySelector("#ax-scan-results"),c=t.querySelector("#ax-scan-detections");if(!r||!c)return;r.style.display="block",a.length===0?c.innerHTML=`
      <div style="color:var(--ax-text-dim);font-size:13px;margin-bottom:8px">Texte brut :</div>
      <pre style="background:#0a0a14;padding:10px;border-radius:6px;color:#ddd;white-space:pre-wrap;word-break:break-all;font-size:13px">${p(e)}</pre>
      <button class="ax-btn ax-scan-copy ax-gs-454" data-copy="${p(e)}">📋 Copier</button>
    `:c.innerHTML=a.map(s=>`
      <div style="background:rgba(255,255,255,0.03);border:1px solid #333;border-radius:6px;padding:10px;margin-bottom:6px">
        <span style="background:rgba(201,162,39,0.2);color:#c9a227;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700">${p(s.kind.toUpperCase())}</span>
        <div style="margin-top:6px;color:#ddd;word-break:break-all;font-family:monospace;font-size:13px">${p(s.value)}</div>
        <button class="ax-btn ax-scan-copy" data-copy="${p(s.value)}" style="margin-top:6px;min-height:44px">📋 Copier</button>
      </div>
    `).join("");const u={ts:Date.now(),type:n,raw:e,detected:a};A(u),y(t),t.querySelectorAll(".ax-scan-copy").forEach(s=>{o?.bind(s,"click",()=>{const i=s.dataset.copy??"";navigator.clipboard?.writeText(i).then(()=>{g.success(),x.success("Copié")}).catch(()=>x.warn("Copie KO"))})})}function H(t){const e=t.querySelector("#ax-scan-file"),n=t.querySelector("#ax-scan-pick"),a=t.querySelector("#ax-scan-status"),r=t.querySelector("#ax-scan-preview");n&&e&&o&&(o.bind(n,"click",()=>{g.tap(),e.click()}),o.bind(e,"change",()=>{const s=e.files?.[0];if(s){if(!s.type.startsWith("image/")){x.warn("Choisis une image");return}if(r){const i=URL.createObjectURL(s);r.textContent="";const l=document.createElement("img");l.src=i,l.alt="aperçu",l.style.cssText="max-width:100%;border-radius:8px;border:1px solid #333",r.append(l)}a&&(a.textContent="⏳ Analyse en cours…"),q(s).then(i=>{if(i&&i.length>0){const l=i[0];if(!l)return;a&&(a.textContent=`✅ ${i.length} code(s) détecté(s) (${l.format})`),g.success(),_(t,i.map(w=>w.value).join(`
`),"qr")}else a&&(a.textContent="Aucun QR/barcode détecté. OCR offline non encore embarqué — colle texte ci-dessous.")}).catch(i=>{f.warn("studios-scan","scan failed",{err:i}),a&&(a.textContent="Échec scan. Réessaie.")})}}));const c=t.querySelector("#ax-scan-text-btn");c&&o&&o.bind(c,"click",()=>{g.tap();const s=(t.querySelector("#ax-scan-text")?.value??"").trim();if(!s){x.warn("Colle du texte");return}_(t,s,"ocr")});const u=t.querySelector("#ax-scan-clear-history");u&&o&&o.bind(u,"click",()=>{B(),y(t),x.success("Historique vidé")}),f.info("studios-scan","rendered")}export{A as appendHistory,B as clearHistory,v as detectKind,P as dispose,p as escapeHtml,C as extractDetections,h as loadHistory,Q as render,q as scanBarcode};
