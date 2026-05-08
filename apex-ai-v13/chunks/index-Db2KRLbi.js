import{c as k}from"./listener-cleanup-Y2rGGxxX.js";import{l as x}from"./monitoring-3uBGKGRH.js";import{s as S}from"../core/main-C-u-gKhP.js";import{g as $}from"./apex-tools-dispatch-C6hYMSIF.js";import{haptic as f}from"./haptic-CQFg2PXZ.js";import{toast as u}from"./toast-ClsF1KRZ.js";import"./apex-kb-DykwJ6XR.js";import"./credential-patterns-Dy6Wjk7e.js";import"./multi-source-analyze-gfH6Z1Zx.js";import"./apex-tools-registry-Bx_ZmBZt.js";import"./voice-BByVJqDT.js";let c=null;function N(){c?.cleanup(),c=null}function p(t){return t.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}const m="ax_scan_history",g=20,d={email:/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,phone:/^(\+?\d{1,3}[\s.-]?)?(\(?\d{1,4}\)?[\s.-]?){2,5}\d{2,4}$/,url:/^https?:\/\/[^\s]+$/i,iban:/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/,api_key_anthropic:/^sk-ant-api\d{2}-[A-Za-z0-9_-]{40,}$/,api_key_openai:/^sk-[A-Za-z0-9]{40,}$/,api_key_github_pat:/^ghp_[A-Za-z0-9]{36}$/,btc_addr:/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,eth_addr:/^0x[a-fA-F0-9]{40}$/};function v(t){return d.email.test(t)?"email":d.api_key_anthropic.test(t)||d.api_key_openai.test(t)||d.api_key_github_pat.test(t)?"api_key":d.iban.test(t.replace(/\s/g,""))?"iban":d.url.test(t)?"url":d.btc_addr.test(t)?"btc_addr":d.eth_addr.test(t)?"eth_addr":d.phone.test(t)&&t.replace(/\D/g,"").length>=10?"phone":"plain"}function z(t){if(!t)return[];const e=[],n=t.split(/\r?\n/).map(i=>i.trim()).filter(Boolean),a=new Set;for(const i of n){const s=v(i);if(s!=="plain"&&!a.has(i)){e.push({kind:s,value:i}),a.add(i);continue}const l=i.split(/[\s,;]+/).filter(r=>r.length>=5);for(const r of l){const o=v(r);o!=="plain"&&!a.has(r)&&(e.push({kind:o,value:r}),a.add(r))}}return e}async function q(t){const e=window;if(!e.BarcodeDetector)return x.warn("studios-scan","BarcodeDetector API not supported"),null;try{const n=new e.BarcodeDetector({formats:["qr_code","code_128","code_39","ean_13","ean_8","upc_a","upc_e","data_matrix"]}),a=t instanceof Blob?await createImageBitmap(t):t;return(await n.detect(a)).map(s=>({value:s.rawValue,format:s.format}))}catch(n){return x.warn("studios-scan","BarcodeDetector failed",{err:n}),null}}function b(){try{const t=localStorage.getItem(m);if(!t)return[];const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch{return[]}}function A(t){try{const e=[...b(),t],n=e.length>g?e.slice(e.length-g):e;localStorage.setItem(m,JSON.stringify(n))}catch(e){x.warn("studios-scan","history save failed",{err:e})}}function B(){localStorage.removeItem(m)}function U(t){c?.cleanup(),c=k("studios-scan");const e=S.get("user")?.id??"anon";if(!$("studio.scan",t,e))return;const a=typeof window.BarcodeDetector<"u";t.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:780px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;color:#c9a227">📷 Studio Scan</h1>
        <span style="color:var(--ax-text-dim);font-size:13px">OCR · QR · Barcode</span>
      </header>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Scanner une image</h2>
        <input type="file" id="ax-scan-file" aria-label="Sélectionner ou prendre une photo à scanner" accept="image/*" capture="environment" style="display:none">
        <button class="ax-btn ax-btn-primary" id="ax-scan-pick" style="width:100%;min-height:44px">📷 Choisir / prendre photo</button>
        <div id="ax-scan-preview" style="margin-top:12px"></div>
        <div id="ax-scan-status" style="margin-top:8px;color:var(--ax-text-dim);font-size:13px"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Coller du texte</h2>
        <textarea id="ax-scan-text" placeholder="Colle un texte (email, code, IBAN, URL…)" rows="4" style="width:100%;padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px"></textarea>
        <button class="ax-btn ax-btn-primary" id="ax-scan-text-btn" style="margin-top:8px;min-height:44px">🔍 Analyser</button>
      </div>

      <div id="ax-scan-results" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px;display:none">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Détections</h2>
        <div id="ax-scan-detections"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Historique (${b().length}/${g})</h2>
        <div id="ax-scan-history"></div>
        <button class="ax-btn" id="ax-scan-clear-history" style="margin-top:8px;min-height:44px">🗑 Vider</button>
      </div>

      <p style="font-size:11px;color:#666;text-align:center">${a?"BarcodeDetector natif disponible.":"BarcodeDetector non supporté ce navigateur — texte uniquement."}</p>
      <p style="margin-top:24px;text-align:center"><a href="#studios" style="color:#c9a227">← Retour studios</a></p>
    </div>
  `,y(t),C(t)}function y(t){const e=t.querySelector("#ax-scan-history");if(!e)return;const n=b();if(n.length===0){e.innerHTML=`<div style="color:var(--ax-text-dim);font-size:13px">Aucun scan pour l'instant.</div>`;return}e.innerHTML=n.slice().reverse().map(a=>{const i=new Date(a.ts).toLocaleString("fr-FR",{dateStyle:"short",timeStyle:"short"});return`
      <div style="background:rgba(255,255,255,0.03);border:1px solid #333;border-radius:6px;padding:8px;margin-bottom:6px">
        <div style="font-size:11px;color:var(--ax-text-dim)">${p(i)} · ${p(a.type)}</div>
        <div style="font-size:13px;color:#c9a227;margin-top:4px;word-break:break-all">${p(a.raw.slice(0,200))}${a.raw.length>200?"…":""}</div>
      </div>
    `}).join("")}function w(t,e,n){const a=z(e),i=t.querySelector("#ax-scan-results"),s=t.querySelector("#ax-scan-detections");if(!i||!s)return;i.style.display="block",a.length===0?s.innerHTML=`
      <div style="color:var(--ax-text-dim);font-size:13px;margin-bottom:8px">Texte brut :</div>
      <pre style="background:#0a0a14;padding:10px;border-radius:6px;color:#ddd;white-space:pre-wrap;word-break:break-all;font-size:13px">${p(e)}</pre>
      <button class="ax-btn ax-scan-copy" data-copy="${p(e)}" style="margin-top:8px;min-height:44px">📋 Copier</button>
    `:s.innerHTML=a.map(r=>`
      <div style="background:rgba(255,255,255,0.03);border:1px solid #333;border-radius:6px;padding:10px;margin-bottom:6px">
        <span style="background:rgba(201,162,39,0.2);color:#c9a227;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700">${p(r.kind.toUpperCase())}</span>
        <div style="margin-top:6px;color:#ddd;word-break:break-all;font-family:monospace;font-size:13px">${p(r.value)}</div>
        <button class="ax-btn ax-scan-copy" data-copy="${p(r.value)}" style="margin-top:6px;min-height:44px">📋 Copier</button>
      </div>
    `).join("");const l={ts:Date.now(),type:n,raw:e,detected:a};A(l),y(t),t.querySelectorAll(".ax-scan-copy").forEach(r=>{c?.bind(r,"click",()=>{const o=r.dataset.copy??"";navigator.clipboard?.writeText(o).then(()=>{f.success(),u.success("Copié")}).catch(()=>u.warn("Copie KO"))})})}function C(t){const e=t.querySelector("#ax-scan-file"),n=t.querySelector("#ax-scan-pick"),a=t.querySelector("#ax-scan-status"),i=t.querySelector("#ax-scan-preview");n&&e&&c&&(c.bind(n,"click",()=>{f.tap(),e.click()}),c.bind(e,"change",()=>{const r=e.files?.[0];if(r){if(!r.type.startsWith("image/")){u.warn("Choisis une image");return}if(i){const o=URL.createObjectURL(r);i.innerHTML=`<img src="${o}" alt="aperçu" style="max-width:100%;border-radius:8px;border:1px solid #333">`}a&&(a.textContent="⏳ Analyse en cours…"),q(r).then(o=>{if(o&&o.length>0){const h=o[0];if(!h)return;a&&(a.textContent=`✅ ${o.length} code(s) détecté(s) (${h.format})`),f.success(),w(t,o.map(_=>_.value).join(`
`),"qr")}else a&&(a.textContent="Aucun QR/barcode détecté. OCR offline non encore embarqué — colle texte ci-dessous.")}).catch(o=>{x.warn("studios-scan","scan failed",{err:o}),a&&(a.textContent="Échec scan. Réessaie.")})}}));const s=t.querySelector("#ax-scan-text-btn");s&&c&&c.bind(s,"click",()=>{f.tap();const r=(t.querySelector("#ax-scan-text")?.value??"").trim();if(!r){u.warn("Colle du texte");return}w(t,r,"ocr")});const l=t.querySelector("#ax-scan-clear-history");l&&c&&c.bind(l,"click",()=>{B(),y(t),u.success("Historique vidé")}),x.info("studios-scan","rendered")}export{A as appendHistory,B as clearHistory,v as detectKind,N as dispose,p as escapeHtml,z as extractDetections,b as loadHistory,U as render,q as scanBarcode};
