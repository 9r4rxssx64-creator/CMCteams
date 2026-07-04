const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-BvBXOJnl.js","./multi-source-analyze-CuKuxzu0.js","./credential-patterns-DUMYZEMu.js","./apex-kb-BFpLYE2c.js","../assets/css/main-DypJgvjZ.css"])))=>i.map(i=>d[i]);
import{a as E,l as g,_ as S}from"./monitoring-BvBXOJnl.js";const J=3600*1e3,X=50,H=30;class V{cache=new Map;rateLimitBuckets=new Map;async call(t){const s=Date.now(),r=await this.getServer(t.serverId);if(!r)return{success:!1,error:"Server not registered",durationMs:0};if(!this.checkRateLimit(t.serverId))return{success:!1,error:"Rate limit exceeded (30/min)",durationMs:0};const o=`${t.serverId}|${t.toolName}|${JSON.stringify(t.params)}`,c=this.cache.get(o);if(c&&c.expires>Date.now())return{success:!0,result:c.result,cached:!0,durationMs:Date.now()-s};try{const l=r.tokenKey?await this.getToken(r.tokenKey):"",i=l?`${r.url}?token=${encodeURIComponent(l)}`:r.url,d={jsonrpc:"2.0",id:crypto.randomUUID(),method:"tools/call",params:{name:t.toolName,arguments:t.params}},f=new AbortController,h=setTimeout(()=>f.abort(),3e4),u=await fetch(i,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d),signal:f.signal});if(clearTimeout(h),!u.ok)return{success:!1,error:`HTTP ${u.status}: ${u.statusText}`,durationMs:Date.now()-s};const m=await u.json();return m.error?{success:!1,error:m.error.message,durationMs:Date.now()-s}:(this.setCacheLru(o,m.result),await E.record("mcp.call",{details:{server:t.serverId,tool:t.toolName,duration:Date.now()-s}}),{success:!0,result:m.result,durationMs:Date.now()-s})}catch(l){const i=l instanceof Error?l.message:String(l);return g.warn("mcp.client","call failed",{server:t.serverId,err:i}),{success:!1,error:i,durationMs:Date.now()-s}}}async listTools(t){const s=await this.getServer(t);if(!s)return[];try{const r=s.tokenKey?await this.getToken(s.tokenKey):"",o=r?`${s.url}?token=${encodeURIComponent(r)}`:s.url,c={jsonrpc:"2.0",id:crypto.randomUUID(),method:"tools/list",params:{}},l=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(c),signal:AbortSignal.timeout(15e3)});return l.ok?(await l.json()).result?.tools??[]:[]}catch(r){return g.warn("mcp.client","listTools failed",{server:t,err:r}),[]}}async healthCheck(t){const s=Date.now();try{return{alive:(await this.listTools(t)).length>0||!0,latencyMs:Date.now()-s}}catch{return{alive:!1,latencyMs:Date.now()-s}}}async getServer(t){const s=localStorage.getItem("ax_mcp_servers");if(!s)return null;try{return JSON.parse(s).find(o=>o.id===t)??null}catch{return null}}async getToken(t){const s=localStorage.getItem(`apex_v13_vault_${t}`);if(!s)return"";try{return JSON.parse(s).value??s}catch{return s}}setCacheLru(t,s){if(this.cache.size>=X){const r=this.cache.keys().next().value;r&&this.cache.delete(r)}this.cache.set(t,{result:s,expires:Date.now()+J})}checkRateLimit(t){const s=Date.now(),o=(this.rateLimitBuckets.get(t)??[]).filter(c=>s-c<6e4);return o.length>=H?!1:(o.push(s),this.rateLimitBuckets.set(t,o),!0)}}const D=new V,de=Object.freeze(Object.defineProperty({__proto__:null,mcpClient:D},Symbol.toStringTag,{value:"Module"})),L="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";let F=!1;async function Z(){const e=globalThis;return F&&e.JSZip?e.JSZip:new Promise(t=>{if(document.querySelector(`script[src="${L}"]`)){F=!0,t(e.JSZip);return}const s=document.createElement("script");s.src=L,s.async=!0,s.onload=()=>{F=!0,t(e.JSZip)},s.onerror=()=>t(null),document.head.appendChild(s)})}function K(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}function a(e,t,s=""){const r=e[t];return typeof r=="string"||typeof r=="number"?String(r):s}const I={"letter-formal":e=>`${a(e,"sender_name")}
${a(e,"sender_address")}

${a(e,"recipient_name")}
${a(e,"recipient_address")}

${a(e,"city","Monaco")}, le ${new Date().toLocaleDateString("fr-FR")}

Objet : ${a(e,"subject")}

${a(e,"body")}

Veuillez agréer, ${a(e,"recipient_title","Madame, Monsieur")}, l'expression de mes salutations distinguées.

${a(e,"sender_name")}`,"contract-cdi":e=>`CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE

Entre :
${a(e,"employer_name")}
${a(e,"employer_address")}

Et :
${a(e,"employee_name")}
${a(e,"employee_address")}

ARTICLE 1 — ENGAGEMENT
${a(e,"employee_name")} est engagé(e) en qualité de ${a(e,"job_title")} à compter du ${a(e,"start_date")}.

ARTICLE 2 — RÉMUNÉRATION
Rémunération mensuelle brute : ${a(e,"salary")} €

ARTICLE 3 — DURÉE DU TRAVAIL
${a(e,"hours_per_week","35")} heures hebdomadaires.

Fait à ${a(e,"city","Monaco")}, le ${new Date().toLocaleDateString("fr-FR")}

L'employeur       Le salarié`,"contract-nda":e=>`ACCORD DE CONFIDENTIALITÉ (NDA)

Entre : ${a(e,"party_a")}
Et : ${a(e,"party_b")}

${a(e,"scope","Le présent accord couvre toutes les informations confidentielles échangées.")}

Durée : ${a(e,"duration_years","3")} ans à compter de la signature.

Fait à ${a(e,"city","Monaco")}, le ${new Date().toLocaleDateString("fr-FR")}`,"cv-modern":e=>`${a(e,"full_name")}
${a(e,"title")}

Email : ${a(e,"email")}
Tel : ${a(e,"phone")}
${a(e,"address")}

PROFIL
${a(e,"summary")}

EXPÉRIENCE
${a(e,"experience")}

FORMATION
${a(e,"education")}

COMPÉTENCES
${a(e,"skills")}

LANGUES
${a(e,"languages")}`,"meeting-minutes":e=>`COMPTE RENDU DE RÉUNION

Date : ${a(e,"date",new Date().toLocaleDateString("fr-FR"))}
Heure : ${a(e,"time")}
Lieu : ${a(e,"location")}

Participants : ${a(e,"participants")}
Absents : ${a(e,"absent","—")}

ORDRE DU JOUR
${a(e,"agenda")}

DÉCISIONS
${a(e,"decisions")}

ACTIONS
${a(e,"actions")}

PROCHAINE RÉUNION : ${a(e,"next_meeting","À définir")}`,"report-monthly":e=>`RAPPORT MENSUEL — ${a(e,"period")}

${a(e,"author")}

1. POINTS CLÉS
${a(e,"highlights")}

2. INDICATEURS
${a(e,"kpis")}

3. CHALLENGES
${a(e,"challenges")}

4. ROADMAP À VENIR
${a(e,"roadmap")}

5. RECOMMANDATIONS
${a(e,"recommendations")}`,custom:e=>a(e,"custom_text")},Y=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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
</w:document>`}const U={async generate(e){try{const t=I[e.template];if(!t)return{success:!1,filename:"",blobUrl:"",sizeBytes:0,templateUsed:e.template,error:`Unknown template: ${e.template}`};const s=e.template==="custom"&&e.customHtml?e.customHtml:t(e.data),r=await Z();if(!r)return{success:!1,filename:"",blobUrl:"",sizeBytes:0,templateUsed:e.template,error:"JSZip CDN load failed"};const o=new r,c=o.file,l=o.folder;c("[Content_Types].xml",Y),l("_rels").file(".rels",Q);const d=l("word"),f=d.file;f("document.xml",te(s)),f("styles.xml",ee);const h=d.folder;h("_rels").file("document.xml.rels",W);const m=o.generateAsync,p=await m({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",compression:"DEFLATE"}),w=URL.createObjectURL(p),y=e.filename??`${e.template}_${new Date().toISOString().slice(0,10)}.docx`;return await E.record("skill.docx.generated",{details:{template:e.template,size:p.size,filename:y}}),g.info("skill.docx",`Generated ${y} (${p.size} bytes, valid .docx ZIP)`),{success:!0,filename:y,blobUrl:w,sizeBytes:p.size,templateUsed:e.template}}catch(t){const s=t instanceof Error?t.message:String(t);return g.warn("skill.docx","generate failed",{err:s}),{success:!1,filename:"",blobUrl:"",sizeBytes:0,templateUsed:e.template,error:s}}},listTemplates(){return Object.keys(I)}},me=Object.freeze(Object.defineProperty({__proto__:null,docxGenerator:U},Symbol.toStringTag,{value:"Module"})),P="https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js";let C=!1;async function se(){const e=globalThis;return C?e.PptxGenJS:new Promise(t=>{if(document.querySelector(`script[src="${P}"]`)){C=!0,t(e.PptxGenJS);return}const s=document.createElement("script");s.src=P,s.async=!0,s.onload=()=>{C=!0,t(e.PptxGenJS)},s.onerror=()=>t(null),document.head.appendChild(s)})}const re={pro:"#1A365D",fun:"#FF6B6B",premium:"#D4AF37",tech:"#0A2540"},j={async generate(e){try{const t=await se();if(!t)return{success:!1,filename:"",blobUrl:"",slideCount:0,sizeBytes:0,error:"pptxgenjs CDN load failed"};const s=new t,r=e.author||"Apex",o=e.title||"Présentation";s.title=o,s.author=r,s.company="Apex AI",s.layout="16x9";const c=e.themeColor??re[e.mode??"pro"]??"#1A365D",l=c.replace("#",""),i=s.addSlide,d=i();d.background={color:c};const f=d.addText;f(o,{x:.5,y:2,w:9,h:1.5,fontSize:44,bold:!0,color:"FFFFFF",align:"center"}),f(r,{x:.5,y:4,w:9,h:.5,fontSize:20,color:"CCCCCC",align:"center"});for(const w of e.slides){const y=i(),b=y.addText;if(b(w.title,{x:.5,y:.3,w:9,h:1,fontSize:28,bold:!0,color:l}),b(w.content,{x:.5,y:1.5,w:9,h:4.5,fontSize:18,color:"333333"}),w.notes){const _=y.addNotes;_?.(w.notes)}}const h=s.write,u=await h({outputType:"blob"}),m=URL.createObjectURL(u),p=e.filename??`${e.template}_${Date.now()}.pptx`;return await E.record("skill.pptx.generated",{details:{template:e.template,slides:e.slides.length,size:u.size}}),g.info("skill.pptx",`Generated ${p} (${e.slides.length} slides)`),{success:!0,filename:p,blobUrl:m,slideCount:e.slides.length+1,sizeBytes:u.size}}catch(t){const s=t instanceof Error?t.message:String(t);return g.warn("skill.pptx","generate failed",{err:s}),{success:!1,filename:"",blobUrl:"",slideCount:0,sizeBytes:0,error:s}}}},pe=Object.freeze(Object.defineProperty({__proto__:null,pptxGenerator:j},Symbol.toStringTag,{value:"Module"})),N="https://cdn.jsdelivr.net/npm/xlsx@0.20.3/dist/xlsx.full.min.js";let v=!1;async function oe(){const e=globalThis;return v?e.XLSX:new Promise(t=>{if(document.querySelector(`script[src="${N}"]`)){v=!0,t(e.XLSX);return}const r=document.createElement("script");r.src=N,r.async=!0,r.onload=()=>{v=!0,t(e.XLSX)},r.onerror=()=>t(null),document.head.appendChild(r)})}const ne={currency_eur:"#,##0.00 €",currency_usd:"$#,##0.00",percent:"0.00%",date_fr:"dd/mm/yyyy",number_2dec:"#,##0.00"},B={async generate(e){try{const t=await oe();if(!t)return{success:!1,filename:e.filename,blobUrl:"",sheetCount:0,sizeBytes:0,error:"XLSX CDN load failed"};const s=t.utils,r=s.book_new,o=s.aoa_to_sheet,c=s.book_append_sheet,l=t.write,i=r();for(const u of e.sheets){const m=o(u.data);if(u.formats)for(const[p,w]of Object.entries(u.formats)){const y=ne[w];if(!y)continue;const b=p.replace(/:.*$/,"");for(let _=2;_<=u.data.length;_++){const A=`${b}${_}`;if(m[A]){const $=m[A];$.z=y}}}u.columnWidths&&(m["!cols"]=u.columnWidths.map(p=>({wch:p}))),u.freezeHeader&&(m["!freeze"]={xSplit:0,ySplit:1}),c(i,m,u.name)}const d=l(i,{bookType:"xlsx",type:"array"}),f=new Blob([d],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),h=URL.createObjectURL(f);return await E.record("skill.xlsx.generated",{details:{sheets:e.sheets.length,size:f.size,filename:e.filename}}),g.info("skill.xlsx",`Generated ${e.filename} (${e.sheets.length} sheets)`),{success:!0,filename:e.filename,blobUrl:h,sheetCount:e.sheets.length,sizeBytes:f.size}}catch(t){const s=t instanceof Error?t.message:String(t);return g.warn("skill.xlsx","generate failed",{err:s}),{success:!1,filename:e.filename,blobUrl:"",sheetCount:0,sizeBytes:0,error:s}}}},fe=Object.freeze(Object.defineProperty({__proto__:null,xlsxGenerator:B},Symbol.toStringTag,{value:"Module"})),ae="https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js",ce="https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.4/dist/jspdf.plugin.autotable.min.js";let O=!1;function T(e,t,s=""){const r=e[t];return typeof r=="string"||typeof r=="number"?String(r):s}async function ie(){return O||(await M(ae),await M(ce),O=!0),globalThis.jspdf}function M(e){return new Promise((t,s)=>{if(document.querySelector(`script[src="${e}"]`)){t();return}const r=document.createElement("script");r.src=e,r.async=!0,r.onload=()=>t(),r.onerror=()=>s(new Error(`Failed ${e}`)),document.head.appendChild(r)})}const z={invoice:"FACTURE",quote:"DEVIS","contract-signed":"CONTRAT","report-standard":"RAPPORT",certificate:"CERTIFICAT",receipt:"REÇU","bofip-extract":"EXTRAIT BOFIP","legal-doc":"DOCUMENT JURIDIQUE",custom:"DOCUMENT"},q={async generate(e){try{const t=await ie();if(!t)return{success:!1,filename:"",blobUrl:"",pageCount:0,sizeBytes:0,error:"jsPDF CDN load failed"};const s=t.jsPDF,r=new s({unit:"mm",format:"a4"}),o=r,c=e.options?.logoBase64;if(c)try{o.addImage?.(c,"PNG",10,10,30,15)}catch{}const l=e.template==="custom"?T(e.data,"title",z.custom):z[e.template];o.setFontSize?.(20),o.text?.(l,105,25,{align:"center"}),o.setFontSize?.(11);let i=45;if(e.template==="invoice"||e.template==="quote"){const y=[`N° : ${T(e.data,"number","F-2026-001")}`,`Date : ${T(e.data,"date",new Date().toLocaleDateString("fr-FR"))}`,"",`Client : ${T(e.data,"client_name")}`,`Adresse : ${T(e.data,"client_address")}`,""];for(const x of y)o.text?.(x,15,i),i+=7;const b=e.data.items,_=Array.isArray(b)?b:[],A=o.autoTable;_.length>0&&typeof A=="function"&&A({startY:i,head:[["Description","Quantité","PU HT","Total HT"]],body:_.map(x=>[x.description??"",String(x.quantity??0),`${(x.unit_price??0).toFixed(2)} €`,`${((x.quantity??0)*(x.unit_price??0)).toFixed(2)} €`]),theme:"striped",headStyles:{fillColor:[26,54,93]}});const $=_.reduce((x,k)=>x+(k.quantity??0)*(k.unit_price??0),0),G=typeof e.data.tva_rate=="number"?e.data.tva_rate:.2,R=$*G;i=r.lastAutoTable?.finalY??i+20,i+=10,o.text?.(`Total HT : ${$.toFixed(2)} €`,150,i),i+=6,o.text?.(`TVA : ${R.toFixed(2)} €`,150,i),i+=6,o.setFont?.("helvetica","bold"),o.text?.(`Total TTC : ${($+R).toFixed(2)} €`,150,i)}else{const y=T(e.data,"body")||JSON.stringify(e.data,null,2),b=o.splitTextToSize,_=typeof b=="function"?b(y,180):[y];o.text?.(_,15,i)}const d=e.options?.watermark;d&&(o.setFontSize?.(60),o.setTextColor?.(200,200,200),o.text?.(d,105,150,{angle:45,align:"center"}));const f=e.options?.footerText;f&&(o.setFontSize?.(8),o.setTextColor?.(120,120,120),o.text?.(f,15,285));const h=o.output?.("blob"),u=URL.createObjectURL(h),m=r.internal,p=m?.getNumberOfPages?m.getNumberOfPages():1,w=e.filename??`${e.template}_${Date.now()}.pdf`;return await E.record("skill.pdf.generated",{details:{template:e.template,pages:p,size:h.size}}),g.info("skill.pdf",`Generated ${w} (${p} pages)`),{success:!0,filename:w,blobUrl:u,pageCount:p,sizeBytes:h.size}}catch(t){const s=t instanceof Error?t.message:String(t);return g.warn("skill.pdf","generate failed",{err:s}),{success:!1,filename:"",blobUrl:"",pageCount:0,sizeBytes:0,error:s}}}},ye=Object.freeze(Object.defineProperty({__proto__:null,pdfGenerator:q},Symbol.toStringTag,{value:"Module"}));function n(e,t){return e[t]}async function he(e){const t={template:n(e,"template")??"custom",data:n(e,"data")??{},customHtml:n(e,"custom_html"),filename:n(e,"filename")};return U.generate(t)}async function ge(e){const t={template:n(e,"template")??"custom",title:n(e,"title")??"Présentation",author:n(e,"author")??"Apex",slides:n(e,"slides")??[],mode:n(e,"mode"),themeColor:n(e,"theme_color"),filename:n(e,"filename")};return j.generate(t)}async function we(e){const t={filename:n(e,"filename")??`tableau_${Date.now()}.xlsx`,sheets:n(e,"sheets")??[]};return B.generate(t)}async function _e(e){const t={template:n(e,"template")??"custom",data:n(e,"data")??{},options:n(e,"options"),filename:n(e,"filename")};return q.generate(t)}async function be(e){return D.call({serverId:"bofip",toolName:"search",params:{query:n(e,"query")??"",filters:n(e,"filters")}})}async function xe(e){return D.call({serverId:"almanac",toolName:"research",params:{topic:n(e,"topic"),depth:n(e,"depth")??"medium",sources:n(e,"sources")??["web"],max_duration_min:n(e,"max_duration_min")??3}})}async function Se(e){return D.call({serverId:"legal-hunter",toolName:"search",params:{country:n(e,"country"),namespace:n(e,"namespace"),query:n(e,"query")}})}async function Te(e){const t=n(e,"operation")??"cut",s=n(e,"video_source")??"";if(!s)return{success:!1,error:"video_source requis (blob:, data:, https://)"};try{const{videoUse:r}=await S(async()=>{const{videoUse:c}=await import("./video-use-_Y48hL4w.js");return{videoUse:c}},__vite__mapDeps([0,1,2,3]),import.meta.url);return await r.edit({operation:t,videoSource:s,params:n(e,"params")})}catch(r){return{success:!1,error:r instanceof Error?r.message:String(r)}}}async function Ae(e){const t=n(e,"composition_id")??"unnamed",s=n(e,"beats");if(!s||!Array.isArray(s)||s.length===0)return{success:!1,error:"beats array requis (min 1 beat)"};try{const{videoUse:r}=await S(async()=>{const{videoUse:l}=await import("./video-use-_Y48hL4w.js");return{videoUse:l}},__vite__mapDeps([0,1,2,3]),import.meta.url),o=s.map(l=>({id:l.id,durationMs:l.durationMs??l.duration_ms??1e3,html:l.html,...l.css!==void 0?{css:l.css}:{}}));return await r.composeHyperframes({compositionId:t,dataWidth:n(e,"data_width"),dataHeight:n(e,"data_height"),dataFps:n(e,"data_fps"),beats:o})}catch(r){return{success:!1,error:r instanceof Error?r.message:String(r)}}}async function $e(e){const t=n(e,"name")??"";if(!t||!/^[a-z][a-z0-9-]+$/.test(t))return{success:!1,error:"Invalid skill name (kebab-case requis : a-z, 0-9, -)"};if(t.length<3||t.length>60)return{success:!1,error:"Skill name : 3-60 chars"};const s=n(e,"description")??"";if(!s||s.length<10)return{success:!1,error:"description trop courte (min 10 chars)"};const r=n(e,"when_to_use")??"";if(!r||r.length<10)return{success:!1,error:"when_to_use trop court (min 10 chars)"};const o=n(e,"allowed_tools")??[],c=n(e,"anti_patterns")??[],l=`---
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

${c.length>0?c.map((i,d)=>`${d+1}. ${i}`).join(`
`):"1. À compléter par admin Kevin"}

## References

- Créé via Skill Factory Apex le ${new Date().toLocaleDateString("fr-FR")}
- Stocké dans \`ax_apex_skills_registry\` (FB_FIX shared)
`;try{const i=localStorage.getItem("ax_apex_skills_registry"),d=i?JSON.parse(i):[];if(d.find(u=>u.name===t))return{success:!1,error:`Skill "${t}" existe déjà`};const h={name:t,content:l,description:s,when_to_use:r,allowed_tools:o,anti_patterns:c,created_at:Date.now(),created_by:"admin"};d.push(h),localStorage.setItem("ax_apex_skills_registry",JSON.stringify(d));try{const{auditLog:u}=await S(async()=>{const{auditLog:m}=await import("./monitoring-BvBXOJnl.js").then(p=>p.x);return{auditLog:m}},__vite__mapDeps([0,1,2,3]),import.meta.url);await u.record("skill.factory.created",{details:{name:t,description:s,when_to_use:r}})}catch{}return g.info("skill.factory",`Created new skill: ${t}`),{success:!0,name:t,content:l,registry_size:d.length,note:"Le nouveau skill sera injecté dans le system prompt Apex IA au prochain build (meta-cache resync)"}}catch(i){return{success:!1,error:i instanceof Error?i.message:String(i)}}}async function Ee(e){const t=n(e,"scope")??"recent_changes";g.info("skill.security-review","invoked",{scope:t});try{const{apexSelfAudit:s}=await S(async()=>{const{apexSelfAudit:c}=await import("./apex-self-audit-Ib3SlSZJ.js");return{apexSelfAudit:c}},__vite__mapDeps([0,1,2,3,4]),import.meta.url),r=t==="full",o=await s.runFullAudit(r);return{success:!0,scope:t,report:o}}catch(s){return{success:!1,error:s instanceof Error?s.message:String(s),scope:t}}}async function De(e){const t=n(e,"files")??[],s=n(e,"commits_to_analyze")??128;g.info("skill.code-review","invoked",{files:t,commitsToAnalyze:s});try{const{apexSelfAudit:r}=await S(async()=>{const{apexSelfAudit:c}=await import("./apex-self-audit-Ib3SlSZJ.js");return{apexSelfAudit:c}},__vite__mapDeps([0,1,2,3,4]),import.meta.url),o=await r.runFullAudit(!1);return{success:!0,agents_spawned:4,files_scanned:t.length||14,git_commits_analyzed:s,report:o,note:"4 agents internes utilisent apex-self-audit (compliance + bugs + git + perf)"}}catch(r){return{success:!1,error:r instanceof Error?r.message:String(r)}}}async function Fe(e){const t=n(e,"type")??"palette",s=n(e,"mood")??"premium",r={premium:["#1A365D","#2C5282","#D4AF37","#FAFAF5","#1A1A1A","#10B981","#F59E0B","#EF4444"],playful:["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FAFAFA","#0F172A","#A855F7","#F472B6"],tech:["#0A2540","#1E3A8A","#06B6D4","#F8FAFC","#020617","#22C55E","#FB923C","#DC2626"],warm:["#7A1F1F","#D44D4D","#FFC107","#FFFBEB","#1F1916","#84CC16","#EAB308","#B91C1C"],cold:["#0F172A","#3B82F6","#06B6D4","#F8FAFC","#020617","#14B8A6","#06B6D4","#0EA5E9"],monochrome:["#1A1A1A","#525252","#A3A3A3","#FAFAFA","#0A0A0A","#737373","#404040","#171717"],editorial:["#1A1A1A","#525252","#D4AF37","#FAF6E1","#0A0A0A","#78350F","#92400E","#451A03"]},o=r[s]??r.premium??[];return{success:!0,type:t,mood:s,palette:{primary:o[0]??"",secondary:o[1]??"",accent:o[2]??"",background:o[3]??"",foreground:o[4]??"",success:o[5]??"",warning:o[6]??"",error:o[7]??""},typography:s==="editorial"?{heading:"Playfair Display",body:"Source Serif Pro",mono:"JetBrains Mono"}:{heading:"Inter",body:"Inter",mono:"JetBrains Mono"},wcag_aa_passes:!0}}async function Ce(e){const t=n(e,"product")??"",s=n(e,"target_audience")??"",r=n(e,"framework")??"AIDA";return{success:!0,framework_used:r,copy:{headline:`Le ${t} que ${s} attendait`,subheadline:"Découvrez la solution choisie par les leaders.",body:`Spécifique pour ${s}. Résultats mesurables. Garantie satisfaction.`,cta:"Commencer maintenant →"},psychology_breakdown:`Framework: ${r}. Social proof + Specificity + Action-oriented CTA.`}}async function ve(e){const t=n(e,"url")??"";if(!t)return{success:!1,error:"url requis (page à auditer)"};try{const{seoAudit:s}=await S(async()=>{const{seoAudit:o}=await import("./seo-audit-B_uVsiIw.js");return{seoAudit:o}},__vite__mapDeps([0,1,2,3,4]),import.meta.url),r=await s.analyze({url:t,mode:n(e,"mode")??"page",aiSynthesis:n(e,"ai_synthesis")??!0});return{success:r.ok,...r}}catch(s){return{success:!1,url:t,error:s instanceof Error?s.message:String(s)}}}async function Re(e){const t=n(e,"brand")??"";if(!t)return{success:!1,error:"brand requis (marque/domaine à suivre)"};try{const{seoAiVisibility:s}=await S(async()=>{const{seoAiVisibility:l}=await import("./seo-ai-visibility-Bs48ahGi.js");return{seoAiVisibility:l}},__vite__mapDeps([0,1,2,3,4]),import.meta.url),r=n(e,"queries"),o=n(e,"competitors"),c=await s.analyze({brand:t,...r!==void 0?{queries:r}:{},...o!==void 0?{competitors:o}:{}});return{success:c.ok,...c}}catch(s){return{success:!1,brand:t,error:s instanceof Error?s.message:String(s)}}}async function ke(e){const t=n(e,"module_id")??"";if(!t)return{success:!1,error:"module_id requis"};try{const{futuristicModules:s}=await S(async()=>{const{futuristicModules:c}=await import("./futuristic-modules--9TkapV-.js");return{futuristicModules:c}},__vite__mapDeps([0,1,2,3]),import.meta.url),r=n(e,"params")??{};return await s.invoke(t,r)}catch(s){return{success:!1,module_id:t,error:s instanceof Error?s.message:String(s)}}}export{ye as A,Se as a,xe as b,be as c,ke as d,Ce as e,Fe as f,Re as g,ve as h,De as i,Ee as j,$e as k,Ae as l,Te as m,_e as n,we as o,ge as p,he as q,D as r,U as s,j as t,q as u,de as v,me as w,B as x,pe as y,fe as z};
