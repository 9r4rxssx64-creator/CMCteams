const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-DMtdadhB.js","./apex-kb-BdO9xyva.js","./credential-patterns-CLzI061R.js"])))=>i.map(i=>d[i]);
import{c as F,_ as T}from"./apex-kb-BdO9xyva.js";import{l as g}from"./monitoring-DMtdadhB.js";const q=3600*1e3,X=50,H=30;class V{cache=new Map;rateLimitBuckets=new Map;async call(t){const s=Date.now(),r=await this.getServer(t.serverId);if(!r)return{success:!1,error:"Server not registered",durationMs:0};if(!this.checkRateLimit(t.serverId))return{success:!1,error:"Rate limit exceeded (30/min)",durationMs:0};const o=`${t.serverId}|${t.toolName}|${JSON.stringify(t.params)}`,i=this.cache.get(o);if(i&&i.expires>Date.now())return{success:!0,result:i.result,cached:!0,durationMs:Date.now()-s};try{const l=r.tokenKey?await this.getToken(r.tokenKey):"",c=l?`${r.url}?token=${encodeURIComponent(l)}`:r.url,u={jsonrpc:"2.0",id:crypto.randomUUID(),method:"tools/call",params:{name:t.toolName,arguments:t.params}},f=new AbortController,h=setTimeout(()=>f.abort(),3e4),d=await fetch(c,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(u),signal:f.signal});if(clearTimeout(h),!d.ok)return{success:!1,error:`HTTP ${d.status}: ${d.statusText}`,durationMs:Date.now()-s};const m=await d.json();return m.error?{success:!1,error:m.error.message,durationMs:Date.now()-s}:(this.setCacheLru(o,m.result),await F.record("mcp.call",{details:{server:t.serverId,tool:t.toolName,duration:Date.now()-s}}),{success:!0,result:m.result,durationMs:Date.now()-s})}catch(l){const c=l instanceof Error?l.message:String(l);return g.warn("mcp.client","call failed",{server:t.serverId,err:c}),{success:!1,error:c,durationMs:Date.now()-s}}}async listTools(t){const s=await this.getServer(t);if(!s)return[];try{const r=s.tokenKey?await this.getToken(s.tokenKey):"",o=r?`${s.url}?token=${encodeURIComponent(r)}`:s.url,i={jsonrpc:"2.0",id:crypto.randomUUID(),method:"tools/list",params:{}},l=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i),signal:AbortSignal.timeout(15e3)});return l.ok?(await l.json()).result?.tools??[]:[]}catch(r){return g.warn("mcp.client","listTools failed",{server:t,err:r}),[]}}async healthCheck(t){const s=Date.now();try{return{alive:(await this.listTools(t)).length>0||!0,latencyMs:Date.now()-s}}catch{return{alive:!1,latencyMs:Date.now()-s}}}async getServer(t){const s=localStorage.getItem("ax_mcp_servers");if(!s)return null;try{return JSON.parse(s).find(o=>o.id===t)??null}catch{return null}}async getToken(t){const s=localStorage.getItem(`apex_v13_vault_${t}`);if(!s)return"";try{return JSON.parse(s).value??s}catch{return s}}setCacheLru(t,s){if(this.cache.size>=X){const r=this.cache.keys().next().value;r&&this.cache.delete(r)}this.cache.set(t,{result:s,expires:Date.now()+q})}checkRateLimit(t){const s=Date.now(),o=(this.rateLimitBuckets.get(t)??[]).filter(i=>s-i<6e4);return o.length>=H?!1:(o.push(s),this.rateLimitBuckets.set(t,o),!0)}}const C=new V,me=Object.freeze(Object.defineProperty({__proto__:null,mcpClient:C},Symbol.toStringTag,{value:"Module"})),L="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";let D=!1;async function Z(){const e=globalThis;return D&&e.JSZip?e.JSZip:new Promise(t=>{if(document.querySelector(`script[src="${L}"]`)){D=!0,t(e.JSZip);return}const s=document.createElement("script");s.src=L,s.async=!0,s.onload=()=>{D=!0,t(e.JSZip)},s.onerror=()=>t(null),document.head.appendChild(s)})}function K(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}function n(e,t,s=""){const r=e[t];return typeof r=="string"||typeof r=="number"?String(r):s}const I={"letter-formal":e=>`${n(e,"sender_name")}
${n(e,"sender_address")}

${n(e,"recipient_name")}
${n(e,"recipient_address")}

${n(e,"city","Monaco")}, le ${new Date().toLocaleDateString("fr-FR")}

Objet : ${n(e,"subject")}

${n(e,"body")}

Veuillez agréer, ${n(e,"recipient_title","Madame, Monsieur")}, l'expression de mes salutations distinguées.

${n(e,"sender_name")}`,"contract-cdi":e=>`CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE

Entre :
${n(e,"employer_name")}
${n(e,"employer_address")}

Et :
${n(e,"employee_name")}
${n(e,"employee_address")}

ARTICLE 1 — ENGAGEMENT
${n(e,"employee_name")} est engagé(e) en qualité de ${n(e,"job_title")} à compter du ${n(e,"start_date")}.

ARTICLE 2 — RÉMUNÉRATION
Rémunération mensuelle brute : ${n(e,"salary")} €

ARTICLE 3 — DURÉE DU TRAVAIL
${n(e,"hours_per_week","35")} heures hebdomadaires.

Fait à ${n(e,"city","Monaco")}, le ${new Date().toLocaleDateString("fr-FR")}

L'employeur       Le salarié`,"contract-nda":e=>`ACCORD DE CONFIDENTIALITÉ (NDA)

Entre : ${n(e,"party_a")}
Et : ${n(e,"party_b")}

${n(e,"scope","Le présent accord couvre toutes les informations confidentielles échangées.")}

Durée : ${n(e,"duration_years","3")} ans à compter de la signature.

Fait à ${n(e,"city","Monaco")}, le ${new Date().toLocaleDateString("fr-FR")}`,"cv-modern":e=>`${n(e,"full_name")}
${n(e,"title")}

Email : ${n(e,"email")}
Tel : ${n(e,"phone")}
${n(e,"address")}

PROFIL
${n(e,"summary")}

EXPÉRIENCE
${n(e,"experience")}

FORMATION
${n(e,"education")}

COMPÉTENCES
${n(e,"skills")}

LANGUES
${n(e,"languages")}`,"meeting-minutes":e=>`COMPTE RENDU DE RÉUNION

Date : ${n(e,"date",new Date().toLocaleDateString("fr-FR"))}
Heure : ${n(e,"time")}
Lieu : ${n(e,"location")}

Participants : ${n(e,"participants")}
Absents : ${n(e,"absent","—")}

ORDRE DU JOUR
${n(e,"agenda")}

DÉCISIONS
${n(e,"decisions")}

ACTIONS
${n(e,"actions")}

PROCHAINE RÉUNION : ${n(e,"next_meeting","À définir")}`,"report-monthly":e=>`RAPPORT MENSUEL — ${n(e,"period")}

${n(e,"author")}

1. POINTS CLÉS
${n(e,"highlights")}

2. INDICATEURS
${n(e,"kpis")}

3. CHALLENGES
${n(e,"challenges")}

4. ROADMAP À VENIR
${n(e,"roadmap")}

5. RECOMMANDATIONS
${n(e,"recommendations")}`,custom:e=>n(e,"custom_text")},Y=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`,Q=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,W=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,ee=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
        <w:lang w:val="fr-FR"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
</w:styles>`;function te(e){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${e.split(`
`).map(r=>r.trim().length===0?"<w:p/>":`<w:p><w:r>${/^[A-ZÉÈÀÂÊÎÔÛ\d][A-ZÉÈÀÂÊÎÔÛ\s\d.()—-]{4,}$/.test(r.trim())&&r.length<80?"<w:rPr><w:b/></w:rPr>":""}<w:t xml:space="preserve">${K(r)}</w:t></w:r></w:p>`).join("")}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1417" w:right="1417" w:bottom="1417" w:left="1417"/>
    </w:sectPr>
  </w:body>
</w:document>`}const z={async generate(e){try{const t=I[e.template];if(!t&&e.template!=="custom")return{success:!1,filename:"",blobUrl:"",sizeBytes:0,templateUsed:e.template,error:`Unknown template: ${e.template}`};const s=e.template==="custom"&&e.customHtml?e.customHtml:t?.(e.data)??"",r=await Z();if(!r)return{success:!1,filename:"",blobUrl:"",sizeBytes:0,templateUsed:e.template,error:"JSZip CDN load failed"};const o=new r,i=o.file,l=o.folder;i("[Content_Types].xml",Y),l("_rels").file(".rels",Q);const u=l("word"),f=u.file;f("document.xml",te(s)),f("styles.xml",ee);const h=u.folder;h("_rels").file("document.xml.rels",W);const m=o.generateAsync,p=await m({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",compression:"DEFLATE"}),w=URL.createObjectURL(p),y=e.filename??`${e.template}_${new Date().toISOString().slice(0,10)}.docx`;return await F.record("skill.docx.generated",{details:{template:e.template,size:p.size,filename:y}}),g.info("skill.docx",`Generated ${y} (${p.size} bytes, valid .docx ZIP)`),{success:!0,filename:y,blobUrl:w,sizeBytes:p.size,templateUsed:e.template}}catch(t){const s=t instanceof Error?t.message:String(t);return g.warn("skill.docx","generate failed",{err:s}),{success:!1,filename:"",blobUrl:"",sizeBytes:0,templateUsed:e.template,error:s}}},listTemplates(){return Object.keys(I)}},pe=Object.freeze(Object.defineProperty({__proto__:null,docxGenerator:z},Symbol.toStringTag,{value:"Module"})),N="https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js";let E=!1;async function se(){const e=globalThis;return E?e.PptxGenJS:new Promise(t=>{if(document.querySelector(`script[src="${N}"]`)){E=!0,t(e.PptxGenJS);return}const s=document.createElement("script");s.src=N,s.async=!0,s.onload=()=>{E=!0,t(e.PptxGenJS)},s.onerror=()=>t(null),document.head.appendChild(s)})}const re={pro:"#1A365D",fun:"#FF6B6B",premium:"#D4AF37",tech:"#0A2540"},j={async generate(e){try{const t=await se();if(!t)return{success:!1,filename:"",blobUrl:"",slideCount:0,sizeBytes:0,error:"pptxgenjs CDN load failed"};const s=new t,r=e.author||"Apex",o=e.title||"Présentation";s.title=o,s.author=r,s.company="Apex AI",s.layout="16x9";const i=e.themeColor??re[e.mode??"pro"]??"#1A365D",l=i.replace("#",""),c=s.addSlide,u=c();u.background={color:i};const f=u.addText;f(o,{x:.5,y:2,w:9,h:1.5,fontSize:44,bold:!0,color:"FFFFFF",align:"center"}),f(r,{x:.5,y:4,w:9,h:.5,fontSize:20,color:"CCCCCC",align:"center"});for(const w of e.slides){const y=c(),b=y.addText;if(b(w.title,{x:.5,y:.3,w:9,h:1,fontSize:28,bold:!0,color:l}),b(w.content,{x:.5,y:1.5,w:9,h:4.5,fontSize:18,color:"333333"}),w.notes){const _=y.addNotes;_?.(w.notes)}}const h=s.write,d=await h({outputType:"blob"}),m=URL.createObjectURL(d),p=e.filename??`${e.template}_${Date.now()}.pptx`;return await F.record("skill.pptx.generated",{details:{template:e.template,slides:e.slides.length,size:d.size}}),g.info("skill.pptx",`Generated ${p} (${e.slides.length} slides)`),{success:!0,filename:p,blobUrl:m,slideCount:e.slides.length+1,sizeBytes:d.size}}catch(t){const s=t instanceof Error?t.message:String(t);return g.warn("skill.pptx","generate failed",{err:s}),{success:!1,filename:"",blobUrl:"",slideCount:0,sizeBytes:0,error:s}}}},fe=Object.freeze(Object.defineProperty({__proto__:null,pptxGenerator:j},Symbol.toStringTag,{value:"Module"})),P="https://cdn.jsdelivr.net/npm/xlsx@0.20.3/dist/xlsx.full.min.js";let v=!1;async function oe(){const e=globalThis;return v?e.XLSX:new Promise(t=>{if(document.querySelector(`script[src="${P}"]`)){v=!0,t(e.XLSX);return}const r=document.createElement("script");r.src=P,r.async=!0,r.onload=()=>{v=!0,t(e.XLSX)},r.onerror=()=>t(null),document.head.appendChild(r)})}const ne={currency_eur:"#,##0.00 €",currency_usd:"$#,##0.00",percent:"0.00%",date_fr:"dd/mm/yyyy",number_2dec:"#,##0.00"},B={async generate(e){try{const t=await oe();if(!t)return{success:!1,filename:e.filename,blobUrl:"",sheetCount:0,sizeBytes:0,error:"XLSX CDN load failed"};const s=t.utils,r=s.book_new,o=s.aoa_to_sheet,i=s.book_append_sheet,l=t.write,c=r();for(const d of e.sheets){const m=o(d.data);if(d.formats)for(const[p,w]of Object.entries(d.formats)){const y=ne[w];if(!y)continue;const b=p.replace(/:.*$/,"");for(let _=2;_<=d.data.length;_++){const A=`${b}${_}`;if(m[A]){const $=m[A];$.z=y}}}d.columnWidths&&(m["!cols"]=d.columnWidths.map(p=>({wch:p}))),d.freezeHeader&&(m["!freeze"]={xSplit:0,ySplit:1}),i(c,m,d.name)}const u=l(c,{bookType:"xlsx",type:"array"}),f=new Blob([u],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),h=URL.createObjectURL(f);return await F.record("skill.xlsx.generated",{details:{sheets:e.sheets.length,size:f.size,filename:e.filename}}),g.info("skill.xlsx",`Generated ${e.filename} (${e.sheets.length} sheets)`),{success:!0,filename:e.filename,blobUrl:h,sheetCount:e.sheets.length,sizeBytes:f.size}}catch(t){const s=t instanceof Error?t.message:String(t);return g.warn("skill.xlsx","generate failed",{err:s}),{success:!1,filename:e.filename,blobUrl:"",sheetCount:0,sizeBytes:0,error:s}}}},ye=Object.freeze(Object.defineProperty({__proto__:null,xlsxGenerator:B},Symbol.toStringTag,{value:"Module"})),ae="https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js",ce="https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.4/dist/jspdf.plugin.autotable.min.js";let O=!1;function S(e,t,s=""){const r=e[t];return typeof r=="string"||typeof r=="number"?String(r):s}async function ie(){return O||(await M(ae),await M(ce),O=!0),globalThis.jspdf}function M(e){return new Promise((t,s)=>{if(document.querySelector(`script[src="${e}"]`)){t();return}const r=document.createElement("script");r.src=e,r.async=!0,r.onload=()=>t(),r.onerror=()=>s(new Error(`Failed ${e}`)),document.head.appendChild(r)})}const U={invoice:"FACTURE",quote:"DEVIS","contract-signed":"CONTRAT","report-standard":"RAPPORT",certificate:"CERTIFICAT",receipt:"REÇU","bofip-extract":"EXTRAIT BOFIP","legal-doc":"DOCUMENT JURIDIQUE",custom:"DOCUMENT"},G={async generate(e){try{const t=await ie();if(!t)return{success:!1,filename:"",blobUrl:"",pageCount:0,sizeBytes:0,error:"jsPDF CDN load failed"};const s=t.jsPDF,r=new s({unit:"mm",format:"a4"}),o=r,i=e.options?.logoBase64;if(i)try{o.addImage?.(i,"PNG",10,10,30,15)}catch{}const l=e.template==="custom"?S(e.data,"title",U.custom):U[e.template];o.setFontSize?.(20),o.text?.(l,105,25,{align:"center"}),o.setFontSize?.(11);let c=45;if(e.template==="invoice"||e.template==="quote"){const y=[`N° : ${S(e.data,"number","F-2026-001")}`,`Date : ${S(e.data,"date",new Date().toLocaleDateString("fr-FR"))}`,"",`Client : ${S(e.data,"client_name")}`,`Adresse : ${S(e.data,"client_address")}`,""];for(const x of y)o.text?.(x,15,c),c+=7;const b=e.data.items,_=Array.isArray(b)?b:[],A=o.autoTable;_.length>0&&typeof A=="function"&&A({startY:c,head:[["Description","Quantité","PU HT","Total HT"]],body:_.map(x=>[x.description??"",String(x.quantity??0),`${(x.unit_price??0).toFixed(2)} €`,`${((x.quantity??0)*(x.unit_price??0)).toFixed(2)} €`]),theme:"striped",headStyles:{fillColor:[26,54,93]}});const $=_.reduce((x,k)=>x+(k.quantity??0)*(k.unit_price??0),0),J=typeof e.data.tva_rate=="number"?e.data.tva_rate:.2,R=$*J;c=r.lastAutoTable?.finalY??c+20,c+=10,o.text?.(`Total HT : ${$.toFixed(2)} €`,150,c),c+=6,o.text?.(`TVA : ${R.toFixed(2)} €`,150,c),c+=6,o.setFont?.("helvetica","bold"),o.text?.(`Total TTC : ${($+R).toFixed(2)} €`,150,c)}else{const y=S(e.data,"body")||JSON.stringify(e.data,null,2),b=o.splitTextToSize,_=typeof b=="function"?b(y,180):[y];o.text?.(_,15,c)}const u=e.options?.watermark;u&&(o.setFontSize?.(60),o.setTextColor?.(200,200,200),o.text?.(u,105,150,{angle:45,align:"center"}));const f=e.options?.footerText;f&&(o.setFontSize?.(8),o.setTextColor?.(120,120,120),o.text?.(f,15,285));const h=o.output?.("blob"),d=URL.createObjectURL(h),m=r.internal,p=m?.getNumberOfPages?m.getNumberOfPages():1,w=e.filename??`${e.template}_${Date.now()}.pdf`;return await F.record("skill.pdf.generated",{details:{template:e.template,pages:p,size:h.size}}),g.info("skill.pdf",`Generated ${w} (${p} pages)`),{success:!0,filename:w,blobUrl:d,pageCount:p,sizeBytes:h.size}}catch(t){const s=t instanceof Error?t.message:String(t);return g.warn("skill.pdf","generate failed",{err:s}),{success:!1,filename:"",blobUrl:"",pageCount:0,sizeBytes:0,error:s}}}},he=Object.freeze(Object.defineProperty({__proto__:null,pdfGenerator:G},Symbol.toStringTag,{value:"Module"}));function a(e,t){return e[t]}async function ge(e){const t={template:a(e,"template")??"custom",data:a(e,"data")??{},customHtml:a(e,"custom_html"),filename:a(e,"filename")};return z.generate(t)}async function we(e){const t={template:a(e,"template")??"custom",title:a(e,"title")??"Présentation",author:a(e,"author")??"Apex",slides:a(e,"slides")??[],mode:a(e,"mode"),themeColor:a(e,"theme_color"),filename:a(e,"filename")};return j.generate(t)}async function _e(e){const t={filename:a(e,"filename")??`tableau_${Date.now()}.xlsx`,sheets:a(e,"sheets")??[]};return B.generate(t)}async function be(e){const t={template:a(e,"template")??"custom",data:a(e,"data")??{},options:a(e,"options"),filename:a(e,"filename")};return G.generate(t)}async function xe(e){return C.call({serverId:"bofip",toolName:"search",params:{query:a(e,"query")??"",filters:a(e,"filters")}})}async function Se(e){return C.call({serverId:"almanac",toolName:"research",params:{topic:a(e,"topic"),depth:a(e,"depth")??"medium",sources:a(e,"sources")??["web"],max_duration_min:a(e,"max_duration_min")??3}})}async function Te(e){return C.call({serverId:"legal-hunter",toolName:"search",params:{country:a(e,"country"),namespace:a(e,"namespace"),query:a(e,"query")}})}async function Ae(e){const t=a(e,"operation")??"cut",s=a(e,"video_source")??"";if(!s)return{success:!1,error:"video_source requis (blob:, data:, https://)"};try{const{videoUse:r}=await T(async()=>{const{videoUse:i}=await import("./video-use-CNPk1WjD.js");return{videoUse:i}},__vite__mapDeps([0,1,2]),import.meta.url);return await r.edit({operation:t,videoSource:s,params:a(e,"params")})}catch(r){return{success:!1,error:r instanceof Error?r.message:String(r)}}}async function $e(e){const t=a(e,"composition_id")??"unnamed",s=a(e,"beats");if(!s||!Array.isArray(s)||s.length===0)return{success:!1,error:"beats array requis (min 1 beat)"};try{const{videoUse:r}=await T(async()=>{const{videoUse:l}=await import("./video-use-CNPk1WjD.js");return{videoUse:l}},__vite__mapDeps([0,1,2]),import.meta.url),o=s.map(l=>({id:l.id,durationMs:l.durationMs??l.duration_ms??1e3,html:l.html,...l.css!==void 0?{css:l.css}:{}}));return await r.composeHyperframes({compositionId:t,dataWidth:a(e,"data_width"),dataHeight:a(e,"data_height"),dataFps:a(e,"data_fps"),beats:o})}catch(r){return{success:!1,error:r instanceof Error?r.message:String(r)}}}async function Fe(e){const t=a(e,"name")??"";if(!t||!/^[a-z][a-z0-9-]+$/.test(t))return{success:!1,error:"Invalid skill name (kebab-case requis : a-z, 0-9, -)"};if(t.length<3||t.length>60)return{success:!1,error:"Skill name : 3-60 chars"};const s=a(e,"description")??"";if(!s||s.length<10)return{success:!1,error:"description trop courte (min 10 chars)"};const r=a(e,"when_to_use")??"";if(!r||r.length<10)return{success:!1,error:"when_to_use trop court (min 10 chars)"};const o=a(e,"allowed_tools")??[],i=a(e,"anti_patterns")??[],l=`---
name: ${t}
description: ${s.replace(/[\r\n]+/g," ")}
when_to_use: ${r.replace(/[\r\n]+/g," ")}
model: sonnet
allowed_tools: ${JSON.stringify(o)}
---

# Skill : ${t}

## Mission

${s}

## Quand l'invoquer (auto)

${r}

## Anti-patterns

${i.length>0?i.map((c,u)=>`${u+1}. ${c}`).join(`
`):"1. À compléter par admin Kevin"}

## References

- Créé via Skill Factory Apex le ${new Date().toLocaleDateString("fr-FR")}
- Stocké dans \`ax_apex_skills_registry\` (FB_FIX shared)
`;try{const c=localStorage.getItem("ax_apex_skills_registry"),u=c?JSON.parse(c):[];if(u.find(d=>d.name===t))return{success:!1,error:`Skill "${t}" existe déjà`};const h={name:t,content:l,description:s,when_to_use:r,allowed_tools:o,anti_patterns:i,created_at:Date.now(),created_by:"admin"};u.push(h),localStorage.setItem("ax_apex_skills_registry",JSON.stringify(u));try{const{auditLog:d}=await T(async()=>{const{auditLog:m}=await import("./apex-kb-BdO9xyva.js").then(p=>p.d);return{auditLog:m}},__vite__mapDeps([1,0,2]),import.meta.url);await d.record("skill.factory.created",{details:{name:t,description:s,when_to_use:r}})}catch{}return g.info("skill.factory",`Created new skill: ${t}`),{success:!0,name:t,content:l,registry_size:u.length,note:"Le nouveau skill sera injecté dans le system prompt Apex IA au prochain build (meta-cache resync)"}}catch(c){return{success:!1,error:c instanceof Error?c.message:String(c)}}}async function Ce(e){const t=a(e,"scope")??"recent_changes";g.info("skill.security-review","invoked",{scope:t});try{const{apexSelfAudit:s}=await T(async()=>{const{apexSelfAudit:i}=await import("./apex-self-audit-72jx3EoJ.js");return{apexSelfAudit:i}},__vite__mapDeps([1,0,2]),import.meta.url),r=t==="full",o=await s.runFullAudit(r);return{success:!0,scope:t,report:o}}catch(s){return{success:!1,error:s instanceof Error?s.message:String(s),scope:t}}}async function De(e){const t=a(e,"files")??[],s=a(e,"commits_to_analyze")??128;g.info("skill.code-review","invoked",{files:t,commitsToAnalyze:s});try{const{apexSelfAudit:r}=await T(async()=>{const{apexSelfAudit:i}=await import("./apex-self-audit-72jx3EoJ.js");return{apexSelfAudit:i}},__vite__mapDeps([1,0,2]),import.meta.url),o=await r.runFullAudit(!1);return{success:!0,agents_spawned:4,files_scanned:t.length||14,git_commits_analyzed:s,report:o,note:"4 agents internes utilisent apex-self-audit (compliance + bugs + git + perf)"}}catch(r){return{success:!1,error:r instanceof Error?r.message:String(r)}}}async function Ee(e){const t=a(e,"type")??"palette",s=a(e,"mood")??"premium",r={premium:["#1A365D","#2C5282","#D4AF37","#FAFAF5","#1A1A1A","#10B981","#F59E0B","#EF4444"],playful:["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FAFAFA","#0F172A","#A855F7","#F472B6"],tech:["#0A2540","#1E3A8A","#06B6D4","#F8FAFC","#020617","#22C55E","#FB923C","#DC2626"],warm:["#7A1F1F","#D44D4D","#FFC107","#FFFBEB","#1F1916","#84CC16","#EAB308","#B91C1C"],cold:["#0F172A","#3B82F6","#06B6D4","#F8FAFC","#020617","#14B8A6","#06B6D4","#0EA5E9"],monochrome:["#1A1A1A","#525252","#A3A3A3","#FAFAFA","#0A0A0A","#737373","#404040","#171717"],editorial:["#1A1A1A","#525252","#D4AF37","#FAF6E1","#0A0A0A","#78350F","#92400E","#451A03"]},o=r[s]??r.premium??[];return{success:!0,type:t,mood:s,palette:{primary:o[0]??"",secondary:o[1]??"",accent:o[2]??"",background:o[3]??"",foreground:o[4]??"",success:o[5]??"",warning:o[6]??"",error:o[7]??""},typography:s==="editorial"?{heading:"Playfair Display",body:"Source Serif Pro",mono:"JetBrains Mono"}:{heading:"Inter",body:"Inter",mono:"JetBrains Mono"},wcag_aa_passes:!0}}async function ve(e){const t=a(e,"product")??"",s=a(e,"target_audience")??"",r=a(e,"framework")??"AIDA";return{success:!0,framework_used:r,copy:{headline:`Le ${t} que ${s} attendait`,subheadline:"Découvrez la solution choisie par les leaders.",body:`Spécifique pour ${s}. Résultats mesurables. Garantie satisfaction.`,cta:"Commencer maintenant →"},psychology_breakdown:`Framework: ${r}. Social proof + Specificity + Action-oriented CTA.`}}async function Re(e){const t=a(e,"module_id")??"";if(!t)return{success:!1,error:"module_id requis"};try{const{futuristicModules:s}=await T(async()=>{const{futuristicModules:i}=await import("./futuristic-modules-Pjl9oJds.js");return{futuristicModules:i}},__vite__mapDeps([0]),import.meta.url),r=a(e,"params")??{};return await s.invoke(t,r)}catch(s){return{success:!1,module_id:t,error:s instanceof Error?s.message:String(s)}}}export{Re as a,Ee as b,ge as c,De as d,ve as e,be as f,we as g,_e as h,Se as i,xe as j,Te as k,Ce as l,Fe as m,$e as n,Ae as o,z as p,pe as q,C as r,me as s,G as t,he as u,j as v,fe as w,B as x,ye as y};
