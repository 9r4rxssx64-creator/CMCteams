import{a as S,l as u,i as q,b as H,e as p}from"./monitoring-Exjm7PJV.js";import{c as U}from"./listener-cleanup-Y2rGGxxX.js";import{r as Y}from"../core/main-BjOwl20v.js";import{multiKeyVault as V}from"./multi-key-vault-Bu7tP_bR.js";import{m as K}from"./memory-K81oslLQ.js";import{crewExperts as Q}from"./crew-experts-v7HfOapu.js";import{a as O}from"./ai-router-D4A_t5NU.js";import{haptic as _}from"./haptic-CQFg2PXZ.js";import{modalSheet as y}from"./modal-sheet-oR7SW-wv.js";import{toast as f}from"./toast-BCPNzfMv.js";import"./multi-source-analyze-D4SDoxtW.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-C3HCxxSm.js";import"./economy-mode-BpSj47YG.js";import"./chat-fallback-Dh2MQ6LG.js";import"./apex-tools-dispatch-core-6hv3SBeE.js";import"./apex-tools-dispatch-skills-tJdEi0Ib.js";import"./apex-tools-dispatch-data-BWbEJ4ix.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-DRPDN6LD.js";import"./apex-tools-misc-_6XGKGbd.js";import"./apex-tools-registry-core-48oOK-KS.js";import"./apex-tools-registry-skills-x-mAWYry.js";const N="apex_v13_security_review_last",T="apex_v13_security_review_history",X=20,B=[{name:"Anthropic API key",rx:/sk-ant-api\d{2}-[A-Za-z0-9_-]{40,}/},{name:"OpenAI API key",rx:/sk-(?:proj-)?[A-Za-z0-9_-]{40,}/},{name:"Google API key",rx:/AIza[A-Za-z0-9_-]{33,}/},{name:"GitHub PAT",rx:/gh[opsu]_[A-Za-z0-9]{36,}/},{name:"Stripe secret",rx:/sk_(?:live|test)_[A-Za-z0-9]{24,}/},{name:"Slack token",rx:/xox[bpao]-[A-Za-z0-9-]{20,}/},{name:"AWS access key",rx:/AKIA[0-9A-Z]{16}/},{name:"Telegram bot token",rx:/\d{8,}:[A-Za-z0-9_-]{35,}/}];class Z{async runFullScan(){const e=Date.now(),t=[];let s=0,r=0;s++;const i=this.scanPlaintextSecrets();i.length===0&&r++,t.push(...i),s++;const o=this.scanCspViolations();o?t.push(o):r++,s++;const c=this.scanVaultDrift();c.length===0&&r++,t.push(...c),s++;const l=this.scanDomInjection();l?t.push(l):r++,s++;const g=this.scanRedactionDisabled();g?t.push(g):r++,s++;const m=await this.scanAuditIntegrity();m?t.push(m):r++,s++;const a=this.scanSessionLeak();a?t.push(a):r++;const b=this.computeScore(t,s),v={scannedAt:Date.now(),durationMs:Date.now()-e,score:b,findings:t,totalChecks:s,passedChecks:r};return this.persistReport(v),S.record("security-review.scan",{details:{score:b,findings:t.length,critical:t.filter(x=>x.severity==="critical").length,high:t.filter(x=>x.severity==="high").length}}),u.info("security-review",`Scan complete: score=${b}/100 · ${t.length} findings`),v}getLastReport(){try{const e=localStorage.getItem(N);return e?JSON.parse(e):null}catch{return null}}history(){try{const e=localStorage.getItem(T)??"[]",t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}scanPlaintextSecrets(){const e=[],t=["apex_v13_vault_","apex_v13_encrypted_","apex_v13_obf_"];try{for(let s=0;s<localStorage.length;s++){const r=localStorage.key(s);if(!r||t.some(o=>r.startsWith(o)))continue;const i=localStorage.getItem(r);if(!(!i||i.length<20)){for(const o of B)if(o.rx.test(i)){e.push({category:"secret-exposure",severity:"critical",msg:`Secret "${o.name}" en clair dans localStorage`,detail:`Clé : ${r}`,fix:"Migrer vers multi-key-vault chiffré AES-GCM-256"});break}}}}catch(s){u.warn("security-review","plaintext scan failed",{err:s})}return e}scanCspViolations(){try{const e=q.getStats(),t=Object.values(e).reduce((i,o)=>i+o.count,0);if(t===0)return null;const s=Object.values(e).filter(i=>Date.now()-i.lastSeen<3600*1e3);return s.length===0?null:{category:"csp-violation",severity:t>50?"high":t>10?"medium":"low",msg:`${t} violations CSP enregistrées (${s.length} dans la dernière heure)`,fix:"Ouvrir csp-monitor dashboard, valider whitelist suggestions"}}catch(e){return u.warn("security-review","csp scan failed",{err:e}),null}}scanVaultDrift(){const e=[];try{const t=["anthropic","openai","github","stripe","cloudflare"];for(const s of t){const r=V.getStats(s);if(r.total===0)continue;const i=r.active===0?"red":r.invalid+r.failing>0?"yellow":"green";i==="red"?e.push({category:"vault-drift",severity:"high",msg:`Vault "${s}" en état RED (toutes clés en panne)`,detail:`${r.invalid} invalides · ${r.failing} failing sur ${r.total} clés`,fix:`Régénérer une nouvelle clé sur dashboard ${s} et l'ajouter au vault`}):i==="yellow"&&r.invalid>0&&e.push({category:"vault-drift",severity:"medium",msg:`Vault "${s}" : ${r.invalid} clé(s) invalide(s)`,fix:"Faire rotation manuelle ou healthCheckAll"})}}catch(t){u.warn("security-review","vault scan failed",{err:t})}return e}scanDomInjection(){if(typeof document>"u")return null;try{const e=Array.from(document.querySelectorAll("script")),t=["cdn.jsdelivr.net","unpkg.com","cdn.skypack.dev","esm.sh"],s=e.filter(r=>{const i=r.getAttribute("src")??"";if(!i)return!1;try{const o=new URL(i,window.location.origin);return o.origin===window.location.origin?!1:!t.some(c=>o.hostname.endsWith(c))}catch{return!0}});return s.length===0?null:{category:"dom-injection",severity:"high",msg:`${s.length} script tag(s) externe(s) non-trustés détectés`,detail:s.slice(0,3).map(r=>r.getAttribute("src")??"").join(" · "),fix:"Vérifier CSP script-src + retirer scripts inutiles"}}catch(e){return u.warn("security-review","dom scan failed",{err:e}),null}}scanRedactionDisabled(){try{const e=localStorage.getItem("apex_v13_redact_disabled");return e==="true"||e==="1"?{category:"pii-redaction",severity:"high",msg:"PII redaction outbound DÉSACTIVÉE (flag apex_v13_redact_disabled)",fix:"Réactiver pii-redaction (clé localStorage à supprimer)"}:null}catch{return null}}async scanAuditIntegrity(){try{const e=await S.verifyChainIntegrity();return e.valid?null:{category:"audit-integrity",severity:"critical",msg:`Audit log chain INVALIDE (broken at index ${e.brokenAt}/${e.totalEntries})`,fix:"Audit log tampered → escalade Claude Code via ax_claude_todo"}}catch(e){return u.warn("security-review","audit integrity check failed",{err:e}),null}}scanSessionLeak(){try{const e=localStorage.getItem("apex_v13_lastact");if(!e)return null;const t=Number.parseInt(e,10);if(!Number.isFinite(t))return null;const s=Date.now()-t,r=1440*60*1e3;return s>r?{category:"session-leak",severity:"medium",msg:`Session active depuis plus de 24h (${Math.round(s/36e5)}h)`,fix:"Forcer logout et re-login pour purger session stale"}:null}catch{return null}}computeScore(e,t){if(t===0)return 100;let s=0;for(const r of e)switch(r.severity){case"critical":s+=25;break;case"high":s+=15;break;case"medium":s+=8;break;case"low":s+=3;break;case"info":s+=1;break}return Math.max(0,100-s)}persistReport(e){try{localStorage.setItem(N,JSON.stringify(e));const t=localStorage.getItem(T)??"[]",s=JSON.parse(t),r=Array.isArray(s)?s:[];r.push(e);const i=r.slice(-X);localStorage.setItem(T,JSON.stringify(i))}catch(t){u.warn("security-review","persist failed",{err:t})}}}const W=new Z,R="apex_v13_code_review_history",ee=30,F={"claude-md-compliance":{provider:"anthropic",expertise:"reasoning"},"bug-detection":{provider:"openai",expertise:"code-quality"},"redundancy-check":{provider:"gemini",expertise:"analysis"},"git-history-context":{provider:"groq",expertise:"speed"},"code-patterns":{provider:"openrouter",expertise:"general"}},j=["claude-md-compliance","bug-detection","redundancy-check","git-history-context","code-patterns"];class te{async review(e){const t=Date.now(),s=e.confidenceThreshold??80,r=await this.normalizeDiff(e.diff),i=r.slice(0,500),l=(K.getDocsContext()["CLAUDE.md"]?.content??"").slice(0,4e3),g=j.map(d=>({...F[d],systemPromptOverride:this.buildRolePrompt(d,l)})),m=this.buildTaskPrompt(r);let a;try{a=await Q.run({task:m,systemPrompt:"Code reviewer expert.",members:g,mode:e.specialized===!1?"consensus":"specialized"})}catch(d){const w=d instanceof Error?d.message:String(d);u.warn("code-review-multi-agent","crew run failed",{err:w}),a={task:m.slice(0,500),mode:"specialized",responses:[],synthesis:"Erreur lors du lancement des agents.",conflicts:[],consensus:!1,totalLatencyMs:Date.now()-t,ts:Date.now()}}const b=j.map((d,w)=>{const h=a.responses[w];if(!h)return{role:d,provider:F[d].provider,findings:[],confidence:0,rawText:"",ok:!1,error:"no response"};const E=this.parseAgentFindings(h.text),z=this.estimateConfidence(h.text,E);return{role:d,provider:h.provider,findings:E,confidence:z,rawText:h.text,ok:h.ok,...h.error&&{error:h.error}}}),v=b.filter(d=>d.ok&&d.confidence>=s),x=v.reduce((d,w)=>d+w.findings.length,0),D=v.reduce((d,w)=>d+w.findings.filter(h=>h.severity==="critical").length,0),k=this.computeScore(v),G=this.buildConsensus(v,a.synthesis),A={diffPreview:i,agents:b,consensus:G,finalScore:k,totalFindings:x,criticalFindings:D,reviewedAt:Date.now(),durationMs:Date.now()-t};return this.persistReport(A),S.record("code-review.run",{details:{agents:v.length,findings:x,critical:D,score:k,latencyMs:A.durationMs}}),u.info("code-review-multi-agent",`Review complete: ${v.length}/${b.length} agents · ${x} findings · score=${k}`),A}history(){try{const e=localStorage.getItem(R)??"[]",t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}async normalizeDiff(e){if(typeof e=="string")return e;try{const t=e.sha?`${e.url}/${e.sha}.diff`:e.url,s=await fetch(t,{method:"GET"});if(!s.ok)throw new Error(`fetch diff failed: HTTP ${s.status}`);return await s.text()}catch(t){return u.warn("code-review-multi-agent","fetch diff failed",{err:t}),`[Erreur fetch diff: ${e.url}]`}}buildRolePrompt(e,t){const s=`Tu es un reviewer expert. Réponds STRICTEMENT en JSON suivant le format :
{
  "findings": [
    {"severity": "critical|high|medium|low|info", "msg": "...", "line": 42, "fix": "..."}
  ],
  "confidence": 85,
  "summary": "..."
}
Sois précis, factuel, sans surplus.`;switch(e){case"claude-md-compliance":return`Audit le diff vs RÈGLES PERMANENTES CLAUDE.md. Repère les violations.

EXTRAIT CLAUDE.md (top règles) :
${t||"[CLAUDE.md non disponible]"}

${s}`;case"bug-detection":return`Cherche bugs : null/undefined refs, off-by-one, race conditions, promises non catch,
async leaks, edge cases non gérés, conditions impossibles, type mismatches.

${s}`;case"redundancy-check":return`Cherche : duplication code, fonctions mortes, imports inutilisés, conditions toujours
true/false, branches mortes, anti-patterns DRY.

${s}`;case"git-history-context":return`Imagine que ce diff fait partie d'une longue série de commits. Cherche signes de :
régression sur fix précédent, modif d'un fichier critique sans test, changement de signature
public sans migration. Sois pragmatique.

${s}`;case"code-patterns":return`Audit best practices : sécurité (XSS, injection, secrets en clair), perf (boucles
nested O(n²), DOM querySelector dans loop), accessibilité (aria-labels manquants), TypeScript
(any, ts-ignore, type assertions).

${s}`}}buildTaskPrompt(e){return`Review ce diff selon ton rôle. Réponds en JSON UNIQUEMENT.

\`\`\`diff
${e.length>8e3?e.slice(0,8e3)+`
[... diff tronqué]`:e}
\`\`\``}parseAgentFindings(e){if(!e)return[];try{const t=e.match(/\{[\s\S]*"findings"[\s\S]*\}/);if(!t)return[];const s=JSON.parse(t[0]);return Array.isArray(s.findings)?s.findings.filter(r=>typeof r=="object"&&r!==null).map(r=>{const i=String(r.severity??"info"),l={severity:["info","low","medium","high","critical"].includes(i)?i:"info",msg:String(r.msg??"").slice(0,300)};return typeof r.line=="number"&&(l.line=r.line),typeof r.fix=="string"&&(l.fix=String(r.fix).slice(0,300)),l}).filter(r=>r.msg.length>0):[]}catch{return[]}}estimateConfidence(e,t){if(!e)return 0;try{const s=e.match(/"confidence"\s*:\s*(\d+)/);if(s&&s[1]){const r=Number.parseInt(s[1],10);if(Number.isFinite(r)&&r>=0&&r<=100)return r}}catch{}return e.length<50?30:e.length<200?50:t.length>0?75:65}computeScore(e){if(e.length===0)return 100;let t=0;for(const s of e)for(const r of s.findings)switch(r.severity){case"critical":t+=20;break;case"high":t+=12;break;case"medium":t+=6;break;case"low":t+=2;break;case"info":t+=1;break}return Math.max(0,100-t)}buildConsensus(e,t){if(e.length===0)return"Aucun agent valide n'a répondu (confidence < threshold).";const s=[];s.push(`✅ ${e.length} agents valides ont participé`);const r=e.reduce((i,o)=>i+o.findings.length,0);if(r===0)s.push("🟢 Aucune anomalie détectée.");else{s.push(`⚠️ ${r} findings au total :`);for(const i of e)i.findings.length!==0&&s.push(`  • [${i.role}] ${i.findings.length} finding(s)`)}return t&&t.length<500&&s.push(`
${t}`),s.join(`
`)}persistReport(e){try{const t=localStorage.getItem(R)??"[]",s=JSON.parse(t),r=Array.isArray(s)?s:[];r.push(e);const i=r.slice(-ee);localStorage.setItem(R,JSON.stringify(i))}catch(t){u.warn("code-review-multi-agent","persist failed",{err:t})}}}const se=new te,L="apex_v13_superpowers_sessions",re=20,C=["brainstorm","plan","dev","test","review","ship","reflect"],ne={brainstorm:{system:`Tu es un dev senior. Explore 3-5 approches DIFFÉRENTES pour résoudre la tâche.
Pour chacune : 1 phrase pitch, pros/cons, complexité (S/M/L), risques.
Format Markdown structuré.`,userTpl:n=>`Tâche : ${n}

Génère 3-5 options possibles.`},plan:{system:`Tu es architecte logiciel. Produis un design doc + ADR (Architecture Decision Record).
Sections : Contexte · Décision · Conséquences · Alternatives rejetées.
Format Markdown.`,userTpl:(n,e)=>`Tâche : ${n}

Brainstorm précédent :
${e}

Choisis la meilleure option et écris le design doc.`},dev:{system:`Tu es dev senior. Implémente la solution.
Donne le code complet (TypeScript strict, pas any), prêt à coller.
Inclus les imports.`,userTpl:(n,e)=>`Tâche : ${n}

Plan :
${e}

Écris le code de la solution.`},test:{system:`Tu es QA expert. Écris les tests vitest qui couvrent : happy path, edge cases, erreurs.
Min 5 cas. Format TypeScript prêt à coller.`,userTpl:(n,e)=>`Tâche : ${n}

Code :
${e}

Écris les tests vitest associés.`},review:{system:`Tu es reviewer expert. Audit le code + tests : sécurité, perf, lisibilité, conformité.
Format : ✅ OK / ⚠️ Suggestion / ❌ Problème + ligne.`,userTpl:(n,e)=>`Tâche : ${n}

Code + tests :
${e}

Fais une review honnête.`},ship:{system:`Tu es release manager. Génère :
- Numéro de version (semver)
- Message commit (titre court + bullets)
- Checklist deploy (build, tests, sync apex-ai-v13/)`,userTpl:(n,e)=>`Tâche : ${n}

Code finalisé :
${e}

Prépare la release.`},reflect:{system:`Tu es coach senior. Tire les leçons :
- Qu'a-t-on appris ?
- Patterns réutilisables ?
- Pièges à éviter ?
- Améliorations futures ?
Format Markdown bullets.`,userTpl:(n,e)=>`Tâche : ${n}

Déroulé :
${e}

Quelles leçons retient-on ?`}};class ie{start(e){const t=`sp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,s={sessionId:t,taskName:e,createdAt:Date.now(),updatedAt:Date.now(),currentStep:"brainstorm",completedSteps:[],outputs:{brainstorm:null,plan:null,dev:null,test:null,review:null,ship:null,reflect:null},status:"active"};return this.persistSession(s),S.record("superpowers.start",{details:{sessionId:t,taskName:e.slice(0,100)}}),u.info("superpowers",`New session ${t} : ${e}`),t}async advance(e){const t=this.getState(e);if(!t)return u.warn("superpowers",`Session ${e} introuvable`),null;if(t.status!=="active")return u.warn("superpowers",`Session ${e} status=${t.status} → skip`),null;const s=Date.now(),r=t.currentStep,i=ne[r],o=this.buildPrevOutputsContext(t);let c="",l;try{await O.stream([{role:"user",content:i.userTpl(t.taskName,o)}],i.system,a=>{a.text&&(c+=a.text)},a=>{l=a})}catch(a){l=a instanceof Error?a:new Error(String(a))}(l||!c)&&(u.warn("superpowers",`Step ${r} failed`,{err:l?.message}),c=`[Step ${r} failed: ${l?.message??"no response"}]`);const g={step:r,output:c,ts:Date.now(),durationMs:Date.now()-s};t.outputs[r]=g,t.completedSteps.push(r),t.updatedAt=Date.now();const m=C.indexOf(r)+1;if(m>=C.length)t.status="completed";else{const a=C[m];a&&(t.currentStep=a)}return this.persistSession(t),S.record("superpowers.advance",{details:{sessionId:e,step:r,durationMs:g.durationMs}}),u.info("superpowers",`Session ${e} : step ${r} done (${g.durationMs}ms)`),g}getState(e){return this.listSessions().find(s=>s.sessionId===e)??null}listSessions(){try{const e=localStorage.getItem(L)??"[]",t=JSON.parse(e);return Array.isArray(t)?t.slice().sort((s,r)=>r.updatedAt-s.updatedAt):[]}catch{return[]}}cancel(e){const t=this.getState(e);return!t||t.status!=="active"?!1:(t.status="cancelled",t.updatedAt=Date.now(),this.persistSession(t),S.record("superpowers.cancel",{details:{sessionId:e}}),!0)}buildPrevOutputsContext(e){const t=[];for(const s of e.completedSteps.slice(-3)){const r=e.outputs[s];r&&t.push(`### ${s}
${r.output.slice(0,1500)}`)}return t.join(`

`)}persistSession(e){try{const t=this.listSessions(),s=t.findIndex(i=>i.sessionId===e.sessionId);s>=0?t[s]=e:t.push(e);const r=t.slice(0,re);localStorage.setItem(L,JSON.stringify(r))}catch(t){u.warn("superpowers","persist failed",{err:t})}}}const I=new ie,P="apex_v13_frontend_designs_history",oe=15,ae=[{rx:/font-family:\s*['"]?Inter['"]?/gi,replacement:"font-family: Georgia, 'Times New Roman', serif",reason:"Inter banni (slop)"},{rx:/font-family:\s*['"]?Roboto['"]?/gi,replacement:"font-family: Georgia, serif",reason:"Roboto banni (slop)"},{rx:/color:\s*#007bff/gi,replacement:"color: #c9a227",reason:"Bootstrap blue banni (slop)"},{rx:/background:\s*#28a745/gi,replacement:"background: #c9a227",reason:"Bootstrap green banni (slop)"}];class ce{async generate(e){const t=Date.now(),s=e.framework??"vanilla",r=this.buildSystemPrompt(s,e),i=`Crée un composant pour : ${e.prompt}

Retourne STRICTEMENT en JSON : {"html": "...", "css": "...", "js": "..."}`;let o="",c;try{await O.stream([{role:"user",content:i}],r,a=>{a.text&&(o+=a.text)},a=>{c=a})}catch(a){c=a instanceof Error?a:new Error(String(a))}if(c||!o)return u.warn("frontend-design","IA generation failed, fallback skeleton",{err:c?.message}),this.fallbackSkeleton(e,s,t,o);let l;try{const a=o.match(/\{[\s\S]*"html"[\s\S]*\}/);if(!a)throw new Error("JSON manquant");l=JSON.parse(a[0])}catch(a){return u.warn("frontend-design","parse failed, fallback",{err:a}),this.fallbackSkeleton(e,s,t,o)}const g={html:this.sanitizeHtml(l.html??""),css:this.applyAntiSlop(l.css??""),js:this.sanitizeJs(l.js??"")},m={html:g.html,css:g.css,js:g.js,framework:s,generatedAt:Date.now(),durationMs:Date.now()-t,rawText:o.slice(0,5e3)};return this.persistOutput(e,m),S.record("frontend-design.generate",{details:{framework:s,prompt:e.prompt.slice(0,100),durationMs:m.durationMs}}),u.info("frontend-design",`Generated ${s} component (${m.durationMs}ms)`),m}history(){try{const e=localStorage.getItem(P)??"[]",t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}buildPreviewSrcdoc(e){const t=e.framework==="react"?`<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
         <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
         <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>`:"",s=e.framework==="react"?"text/babel":"text/javascript";return`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Apex Frontend Preview</title>
${t}
<style>${e.css}</style>
</head>
<body>
${e.html}
<script type="${s}">${e.js}<\/script>
</body>
</html>`}buildSystemPrompt(e,t){const s=t.brandColors,r=s?.primary??"#c9a227",i=s?.secondary??"#e8b830",o=s?.bg??"#0f0f1a",c=t.targetWidth??"mobile";return`Tu es un designer frontend SENIOR niveau Apple/Linear (production-grade).

ANTI-SLOP STRICT (interdiction absolue) :
 - PAS de fonts génériques : ban Inter, Roboto, Open Sans, Helvetica
 - PAS de couleurs Bootstrap par défaut (#007bff, #28a745, etc.)
 - PAS de box-shadow flat sans intention
 - PAS de border-radius 4px (= flat = mort)
 - PAS de transitions linear (toujours cubic-bezier intentionnel)

OBLIGATOIRE :
 - Typographie distinctive : Georgia/serif premium OU system-ui CURATED
 - Palette brand Apex : primary=${r}, secondary=${i}, bg=${o}
 - Animations cubic-bezier(0.16, 1, 0.3, 1) ou (0.34, 1.56, 0.64, 1)
 - border-radius >= 12px (ou 0 = brutalist intentionnel)
 - Mobile-first ${c} → touch targets >= 44px
 - Accessibilité : aria-label sur tous les boutons
 - prefers-reduced-motion respecté

Framework cible : ${e}
${e==="react"?"Utilise JSX, hooks, pas de class components.":"HTML5 + CSS3 + JS vanilla, pas de jQuery."}

Output : JSON STRICT { "html": "...", "css": "...", "js": "..." }
PAS de markdown, PAS d'explications hors JSON.`}applyAntiSlop(e){let t=e;for(const s of ae)t=t.replace(s.rx,s.replacement);return t}sanitizeHtml(e){return e.replace(/<script[\s\S]*?<\/script>/gi,"")}sanitizeJs(e){return e.replace(/\beval\s*\(/g,"/* eval blocked */(").replace(/document\.write\s*\(/g,"/* doc.write blocked */(")}fallbackSkeleton(e,t,s,r){return{html:`<div class="ax-fallback"><h2>${e.prompt.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}</h2><p>Génération IA indisponible. Skeleton de secours.</p></div>`,css:".ax-fallback{font-family:Georgia,serif;background:#0f0f1a;color:#e8b830;padding:24px;border-radius:14px;border:1px solid rgba(232,184,48,0.3)}",js:"/* fallback no-op */",framework:t,generatedAt:Date.now(),durationMs:Date.now()-s,rawText:r.slice(0,500)}}persistOutput(e,t){try{const s=localStorage.getItem(P)??"[]",r=JSON.parse(s),i=Array.isArray(r)?r:[];i.push({spec:e,output:t});const o=i.slice(-oe);localStorage.setItem(P,JSON.stringify(o))}catch(s){u.warn("frontend-design","persist failed",{err:s})}}}const J=new ce,M="apex_v13_gstack_roles_history",le=25,ue={CEO:`Tu es CEO. Décide vite, priorise, justifie en 3 bullets max :
- Impact business
- Priorité (P0/P1/P2)
- ROI estimé
Pas de blabla, factuel.`,Designer:`Tu es designer senior (niveau Apple/Linear).
Anti-slop strict : pas Inter/Roboto, pas couleurs Bootstrap.
Format : sketch ASCII + palette couleurs + interactions clés.
Mobile-first 375px obligatoire.`,Engineer:`Tu es senior engineer TypeScript strict.
Pas de any, pas de @ts-ignore, pas de eval.
Code prêt à coller, imports explicites, typage exhaustif.
Si plusieurs fichiers : nomme chacun en commentaire.`,QA:`Tu es QA expert vitest.
Min 5 tests : happy path, edge cases, errors, async, mocks.
Format prêt à coller. describe/it/expect cohérent.`,ReleaseManager:`Tu es release manager.
Output strict :
- Version semver
- Commit message (titre + bullets)
- Checklist deploy : build, tests, sync apex-ai-v13/, push, vérif data-app-ver
- Risques/rollback`,Reviewer:`Tu es reviewer honnête sans complaisance.
Format : ✅ OK / ⚠️ Suggestion / ❌ Problème + ligne précise.
Sécu / perf / lisibilité / TypeScript / accessibilité.
Score honnête /100.`,Reflector:`Tu es coach senior. Tire les leçons :
- 3 patterns réutilisables ?
- 2 pièges évités ?
- 1 amélioration future ?
- Score qualité du process /10.
Format Markdown bullets.`};class pe{async spawnRole(e,t){const s=Date.now(),r=ue[e];let i="",o;try{await O.stream([{role:"user",content:t}],r,l=>{l.text&&(i+=l.text)},l=>{o=l})}catch(l){o=l instanceof Error?l:new Error(String(l))}const c={role:e,task:t.slice(0,500),output:i,durationMs:Date.now()-s,ts:Date.now(),ok:!o&&i.length>0,...o&&{error:o.message.slice(0,200)}};return S.record("gstack.role",{details:{role:e,durationMs:c.durationMs,ok:c.ok}}),u.info("gstack-roles",`Role ${e} done (${c.durationMs}ms · ok=${c.ok})`),c}async runFullPipeline(e){const t=Date.now(),s=["CEO","Designer","Engineer","QA","ReleaseManager","Reviewer","Reflector"],r=[];for(const c of s){const l=this.enrichTaskWithContext(e,r),g=await this.spawnRole(c,l);r.push(g)}const i=this.buildSynthesis(r),o={task:e.slice(0,500),roles:r,finalSynthesis:i,totalDurationMs:Date.now()-t,ts:Date.now()};return this.persistResult(o),S.record("gstack.pipeline",{details:{task:e.slice(0,100),rolesCount:s.length,successful:r.filter(c=>c.ok).length,durationMs:o.totalDurationMs}}),u.info("gstack-roles",`Pipeline done: ${r.filter(c=>c.ok).length}/${s.length} OK · ${o.totalDurationMs}ms`),o}history(){try{const e=localStorage.getItem(M)??"[]",t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}listRoles(){return[{role:"CEO",description:"Décision business, priorités, ROI"},{role:"Designer",description:"UX/UI, anti-slop, brand"},{role:"Engineer",description:"Implémentation TypeScript strict"},{role:"QA",description:"Tests vitest exhaustifs"},{role:"ReleaseManager",description:"Versioning, changelog, deploy"},{role:"Reviewer",description:"Code review honnête"},{role:"Reflector",description:"Lessons learned"}]}enrichTaskWithContext(e,t){if(t.length===0)return e;const s=t.slice(-3).map(r=>`### ${r.role}
${r.output.slice(0,1200)}`).join(`

`);return`Tâche : ${e}

Contexte (rôles précédents) :
${s}`}buildSynthesis(e){const t=e.filter(r=>r.ok);if(t.length===0)return"Pipeline a échoué : aucun rôle n'a produit de résultat.";const s=[];s.push(`## Synthèse pipeline (${t.length}/${e.length} rôles OK)
`);for(const r of t){const i=r.output.slice(0,200).replace(/\n/g," ");s.push(`**${r.role}** (${r.durationMs}ms) : ${i}...`)}return s.join(`
`)}persistResult(e){try{const t=localStorage.getItem(M)??"[]",s=JSON.parse(t),r=Array.isArray(s)?s:[];r.push(e);const i=r.slice(-le);localStorage.setItem(M,JSON.stringify(i))}catch(t){u.warn("gstack-roles","persist failed",{err:t})}}}const de=new pe;let $=null;function Ue(){$?.cleanup(),$=null}const ge=[{id:"security-review",emoji:"🔒",name:"Security Review",description:"Scan runtime exhaustif : secrets en clair, CSP violations, vault drift, audit integrity.",status:"installed",buttonLabel:"Lancer scan"},{id:"code-review-5-agents",emoji:"👥",name:"Code Review 5 Agents",description:"5 IA en parallèle (CLAUDE.md compliance / bugs / redondance / git history / patterns).",status:"configurable",buttonLabel:"Reviewer un diff"},{id:"frontend-design",emoji:"🎨",name:"Frontend Design",description:"Génère un composant UI production-grade depuis prompt avec anti-slop strict.",status:"configurable",buttonLabel:"Générer composant"},{id:"superpowers",emoji:"⚡",name:"Superpowers",description:"7-step methodology : brainstorm → plan → dev → test → review → ship → reflect.",status:"configurable",buttonLabel:"Démarrer session"},{id:"gstack-roles",emoji:"🏛",name:"GStack Roles",description:"7 rôles spécialisés (CEO/Designer/Engineer/QA/Release/Reviewer/Reflector).",status:"configurable",buttonLabel:"Lancer pipeline"}];function me(n){const e=n.status==="installed"?'<span style="background:rgba(34,204,119,0.15);color:#22cc77;padding:3px 10px;border-radius:10px;font-size:11px;font-weight:600;letter-spacing:0.02em">✅ Actif</span>':'<span style="background:rgba(232,184,48,0.15);color:#e8b830;padding:3px 10px;border-radius:10px;font-size:11px;font-weight:600;letter-spacing:0.02em">⚙️ Config</span>';return`
    <article class="ax-yury-card ax-gs-295" data-plugin-id="${p(n.id)}">
      <header class="ax-gs-204">
        <div class="ax-gs-120">
          <span class="ax-gs-201" aria-hidden="true">${p(n.emoji)}</span>
          <h3 class="ax-gs-296">${p(n.name)}</h3>
        </div>
        ${e}
      </header>
      <p class="ax-gs-297">${p(n.description)}</p>
      <button class="ax-btn ax-bounce-tap ax-gs-298" data-launch="${p(n.id)}" aria-label="Lancer ${p(n.name)}">
        ${p(n.buttonLabel)}
      </button>
    </article>
  `}function fe(){return`
    <div class="ax-yury-plugins ax-gs-299">
      <header class="ax-gs-202">
        <div>
          <h1 class="ax-gs-300">🚀 Yury Plugins (équivalents Apex)</h1>
          <p class="ax-gs-301">5 services applicatifs natifs PWA, pas Claude Code</p>
        </div>
        <button class="ax-btn ax-bounce-tap ax-gs-302" data-back-admin aria-label="Retour Admin">← Admin</button>
      </header>
      <div class="ax-yury-grid ax-gs-203">
        ${ge.map(me).join("")}
      </div>
    </div>
  `}async function he(){f.info("🔒 Scan en cours...");try{const n=await W.runFullScan(),e=n.findings.length>0?n.findings.map(t=>`
        <li class="ax-gs-304">
          <strong style="color:${t.severity==="critical"?"#ff5566":t.severity==="high"?"#ffaa44":"#e8b830"}">[${p(t.severity)}]</strong>
          <span>${p(t.msg)}</span>
          ${t.fix?`<p class="ax-gs-306">Fix : ${p(t.fix)}</p>`:""}
        </li>`).join(""):'<li class="ax-gs-205">🟢 Aucune vulnérabilité détectée.</li>';y.open({title:`🔒 Security Review — Score ${n.score}/100`,content:`
        <div class="ax-gs-12">
          <p class="ax-gs-311">
            ${n.passedChecks}/${n.totalChecks} checks passés · ${n.findings.length} findings · ${Math.round(n.durationMs)}ms
          </p>
          <ul class="ax-gs-307">${e}</ul>
        </div>
      `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>y.closeAll()}]})}catch(n){u.warn("yury-plugins","security review failed",{err:n}),f.error("Scan échoué — vérifie les logs")}}async function ye(){const n=window.prompt("Colle le diff à reviewer (ou laisse vide pour démo) :","");if(n!==null){f.info("👥 Lancement des 5 agents...");try{const e=await se.review({diff:n||`+const test = "demo";
-const old = "removed";`}),t=e.agents.map(s=>`
      <li class="ax-gs-304">
        <strong>[${p(s.role)}]</strong> · ${p(s.provider)} · confidence ${s.confidence}/100
        <p class="ax-gs-306">${s.findings.length} finding(s)</p>
      </li>`).join("");y.open({title:`👥 Code Review — Score ${e.finalScore}/100`,content:`
        <div class="ax-gs-12">
          <p class="ax-gs-311">
            ${e.totalFindings} findings · ${e.criticalFindings} critical · ${Math.round(e.durationMs)}ms
          </p>
          <h3 class="ax-gs-308">Agents</h3>
          <ul style="list-style:none;padding:0;margin:0 0 14px">${t}</ul>
          <h3 class="ax-gs-308">Consensus</h3>
          <pre class="ax-gs-309">${p(e.consensus)}</pre>
        </div>
      `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>y.closeAll()}]})}catch(e){u.warn("yury-plugins","code review failed",{err:e}),f.error("Review échouée — vérifie clés IA")}}}async function ve(){const n=window.prompt("Décris le composant UI à générer :","Bouton CTA premium avec hover doux");if(n){f.info("🎨 Génération en cours...");try{const e=await J.generate({prompt:n,framework:"vanilla"}),s=J.buildPreviewSrcdoc(e).replace(/"/g,"&quot;").replace(/</g,"&lt;");y.open({title:`🎨 Frontend Design — ${e.framework}`,content:`
        <div class="ax-gs-12">
          <p class="ax-gs-303">
            Généré en ${Math.round(e.durationMs)}ms · framework ${p(e.framework)}
          </p>
          <iframe sandbox="allow-scripts" srcdoc="${s}" style="width:100%;height:300px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;background:#fff" aria-label="Aperçu du composant généré"></iframe>
          <details class="ax-gs-187">
            <summary style="cursor:pointer;color:#e8b830;font-weight:600">Voir le code</summary>
            <pre style="background:rgba(0,0,0,0.4);color:rgba(255,255,255,0.85);padding:12px;border-radius:10px;font-size:11px;white-space:pre-wrap;max-height:30vh;overflow:auto;margin-top:8px"><strong>HTML:</strong>
${p(e.html)}

<strong>CSS:</strong>
${p(e.css)}

<strong>JS:</strong>
${p(e.js)}</pre>
          </details>
        </div>
      `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>y.closeAll()}]})}catch(e){u.warn("yury-plugins","frontend design failed",{err:e}),f.error("Génération échouée")}}}async function Se(){const n=window.prompt("Nom de la tâche pour la session Superpowers :","Refactor auth flow");if(!n)return;const e=I.start(n);f.info(`⚡ Session ${e} démarrée — avancement step 1/7...`);try{const t=await I.advance(e),s=I.getState(e);y.open({title:`⚡ Superpowers — ${p(n)}`,content:`
        <div class="ax-gs-12">
          <p class="ax-gs-303">
            Session ${p(e)} · step actuel : <strong>${p(s?.currentStep??"-")}</strong>
          </p>
          <h3 class="ax-gs-308">Output ${p(t?.step??"?")}</h3>
          <pre class="ax-gs-312">${p(t?.output??"(pas de sortie)")}</pre>
          <p style="color:rgba(255,255,255,0.55);font-size:12px;margin-top:10px">
            Re-lance la vue pour avancer au step suivant.
          </p>
        </div>
      `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>y.closeAll()}]})}catch(t){u.warn("yury-plugins","superpowers advance failed",{err:t}),f.error("Step échoué")}}async function we(){const n=window.prompt("Tâche pour le pipeline GStack 7 rôles :","Implémenter dark mode toggle");if(n){f.info("🏛 Pipeline 7 rôles en cours (peut prendre 30-60s)...");try{const e=await de.runFullPipeline(n),t=e.roles.map(s=>`
      <li class="ax-gs-304">
        <strong style="color:${s.ok?"#22cc77":"#ff5566"}">[${p(s.role)}]</strong>
        ${s.ok?"✅":"❌"} · ${Math.round(s.durationMs)}ms
        <p class="ax-gs-306">${p(s.output.slice(0,200))}...</p>
      </li>`).join("");y.open({title:`🏛 GStack Pipeline — ${e.roles.filter(s=>s.ok).length}/7 OK`,content:`
        <div class="ax-gs-12">
          <p class="ax-gs-311">
            ${Math.round(e.totalDurationMs/1e3)}s total
          </p>
          <ul style="list-style:none;padding:0;margin:0 0 14px;max-height:50vh;overflow-y:auto">${t}</ul>
        </div>
      `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>y.closeAll()}]})}catch(e){u.warn("yury-plugins","gstack pipeline failed",{err:e}),f.error("Pipeline échoué")}}}function be(n){if(!$)return;n.querySelectorAll("[data-launch]").forEach(t=>{$.bind(t,"click",()=>{_.tap();const s=t.dataset.launch??"";switch(s){case"security-review":he();break;case"code-review-5-agents":ye();break;case"frontend-design":ve();break;case"superpowers":Se();break;case"gstack-roles":we();break;default:f.warn(`Plugin ${s} non implémenté`)}})});const e=n.querySelector("[data-back-admin]");e&&$.bind(e,"click",()=>{_.tap(),Y.navigate("admin")})}function Ye(n){if($?.cleanup(),$=U("admin-yury-plugins"),!H.get("isAdmin")){n.innerHTML=`
      <div class="ax-empty ax-gs-188">
        <h2>Accès réservé</h2>
        <p>Cette section est réservée à l'admin Kevin.</p>
      </div>
    `;return}n.innerHTML=fe(),be(n)}export{Ue as dispose,Ye as render};
