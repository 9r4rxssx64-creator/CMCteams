import{c as U}from"./listener-cleanup-Y2rGGxxX.js";import{l as u}from"./monitoring-3uBGKGRH.js";import{m as Y,s as K,r as V}from"../core/main-BD3e2KjQ.js";import{a as w}from"./apex-kb-D58JHve5.js";import{aiRouter as R}from"./ai-router-BRxwYYgB.js";import{cspMonitor as X}from"./csp-monitor-DTvrtLKH.js";import{multiKeyVault as B}from"./multi-key-vault-DBJ1lWw5.js";import{haptic as L}from"./haptic-CQFg2PXZ.js";import{modalSheet as S}from"./modal-sheet-oR7SW-wv.js";import{toast as v}from"./toast-ClsF1KRZ.js";import"./multi-source-analyze-qLL1n6a4.js";import"./credential-patterns-D-srKehy.js";import"./chat-fallback-B-rlgyHT.js";import"./voice-D_FBBKn0.js";import"./tokens-dashboard-C5ZzZyK6.js";import"./claude-bridge-Z1U6CeJx.js";const Q=3e4,C="ax_crew_runs_history",Z=50,z={anthropic:"reasoning",openai:"code-quality",gemini:"vision",groq:"speed",openrouter:"general",mistral:"multilingual"};class W{async run(e){const t=Date.now(),r=e.mode??"consensus",s=e.timeoutMs??Q;if(e.members.length<2)throw new Error("Crew Experts requires at least 2 members");const n=e.members.map(d=>this.runMember(d,e.task,e.systemPrompt,r,s,e.signal)),a=(await Promise.allSettled(n)).map((d,h)=>{const b=e.members[h];if(!b)throw new Error("member undefined");if(d.status==="fulfilled")return d.value;const k=d.reason instanceof Error?d.reason.message:String(d.reason);return{provider:b.provider,expertise:b.expertise??z[b.provider],text:"",latencyMs:0,ok:!1,error:k.slice(0,200)}}),c=this.synthesize(a,r),p=this.detectConflicts(a),m=a.filter(d=>d.ok),l=m.length>=Math.ceil(a.length/2),y={task:e.task.slice(0,500),mode:r,responses:a,synthesis:c,conflicts:p,consensus:l,totalLatencyMs:Date.now()-t,ts:Date.now()};return this.persistHistory(y),w.record("crew.run",{details:{mode:r,members:e.members.length,successful:m.length,latencyMs:y.totalLatencyMs,consensus:l}}),u.info("crew-experts",`${m.length}/${e.members.length} providers OK · ${y.totalLatencyMs}ms · consensus=${l}`),y}async runMember(e,t,r,s,n,o){const a=Date.now(),c=e.expertise??z[e.provider],p=new AbortController,m=setTimeout(()=>p.abort(),n);o&&o.addEventListener("abort",()=>p.abort(),{once:!0});const l=this.buildMemberPrompt(r,c,s,e.systemPromptOverride);let y="",d;try{if(await R.stream([{role:"user",content:t}],l,h=>{h.text&&(y+=h.text)},h=>{d=h}),clearTimeout(m),d)throw d;return{provider:e.provider,expertise:c,text:y,latencyMs:Date.now()-a,ok:!0}}catch(h){clearTimeout(m);const b=h instanceof Error?h.message:String(h);return{provider:e.provider,expertise:c,text:y,latencyMs:Date.now()-a,ok:!1,error:b.slice(0,200)}}}buildMemberPrompt(e,t,r,s){if(s)return s;let n="";return r==="specialized"?n=`

Ton expertise spécifique : ${t}. Concentre-toi sur cet angle.`:r==="debate"?n=`

Mode débat : défends ton point de vue (expertise=${t}). Sois précis sur les divergences.`:n=`

Mode consensus : donne ta meilleure réponse en intégrant ton expertise (${t}).`,e+n}synthesize(e,t){const r=e.filter(n=>n.ok&&n.text);if(r.length===0)return"⚠️ Aucun expert n'a répondu. Réessaie.";if(r.length===1){const n=r[0];return n?n.text:""}const s=[];if(t==="specialized"||t==="debate"){s.push(`## Synthèse ${r.length} experts
`);for(const n of r)s.push(`### ${this.providerName(n.provider)} (${n.expertise})
${n.text}
`)}else{const n=[...r].sort((c,p)=>p.text.length-c.text.length),o=n[0];if(!o)return"";s.push(o.text);const a=n.slice(1);a.length>0&&s.push(`
---
*Aussi consulté : ${a.map(c=>this.providerName(c.provider)).join(", ")}*`)}return s.join(`
`)}detectConflicts(e){const t=e.filter(p=>p.ok&&p.text);if(t.length<2)return[];const r=[],s=t.map(p=>p.text.length),n=Math.max(...s),o=Math.min(...s);o>0&&n/o>3&&r.push(`Divergence longueur : ${o}c → ${n}c (3×+)`);const a=["oui","safe","sécurisé","recommandé","préférable"],c=["non","dangereux","éviter","déconseillé","risqué"];for(let p=0;p<t.length-1;p++)for(let m=p+1;m<t.length;m++){const l=t[p],y=t[m];if(!l||!y)continue;const d=l.text.toLowerCase(),h=y.text.toLowerCase(),b=a.some(g=>d.includes(g)),k=c.some(g=>d.includes(g)),M=a.some(g=>h.includes(g)),T=c.some(g=>h.includes(g));(b&&T||k&&M)&&r.push(`${this.providerName(l.provider)} vs ${this.providerName(y.provider)} : avis opposés`)}return r}providerName(e){return{anthropic:"Claude",openai:"GPT",gemini:"Gemini",groq:"Groq",openrouter:"OpenRouter",mistral:"Mistral"}[e]}persistHistory(e){try{const t=localStorage.getItem(C)??"[]",r=JSON.parse(t),s=Array.isArray(r)?r:[];s.push(e);const n=s.slice(-Z);localStorage.setItem(C,JSON.stringify(n))}catch(t){u.warn("crew-experts","history persist failed",{err:t})}}history(){try{const e=localStorage.getItem(C)??"[]",t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}shouldUseCrew(e){const t=e.toLowerCase();return!!(/\b(audit|expert|complet|consulte|exhaustif|approfondi|concert|tous?\s+les?\s+angles)\b/i.test(t)||e.length>600||/\b(suppress|delete|effac|paiement|payer|valid|critique)\b/i.test(t)&&e.length>100)}defaultMembers(e="specialized"){return e==="specialized"?[{provider:"anthropic",expertise:"security"},{provider:"openai",expertise:"code-quality"},{provider:"gemini",expertise:"perf"},{provider:"groq",expertise:"ux"}]:[{provider:"anthropic"},{provider:"openai"},{provider:"gemini"}]}}const ee=new W,P="apex_v13_code_review_history",te=30,j={"claude-md-compliance":{provider:"anthropic",expertise:"reasoning"},"bug-detection":{provider:"openai",expertise:"code-quality"},"redundancy-check":{provider:"gemini",expertise:"analysis"},"git-history-context":{provider:"groq",expertise:"speed"},"code-patterns":{provider:"openrouter",expertise:"general"}},F=["claude-md-compliance","bug-detection","redundancy-check","git-history-context","code-patterns"];class re{async review(e){const t=Date.now(),r=e.confidenceThreshold??80,s=await this.normalizeDiff(e.diff),n=s.slice(0,500),c=(Y.getDocsContext()["CLAUDE.md"]?.content??"").slice(0,4e3),p=F.map(g=>({...j[g],systemPromptOverride:this.buildRolePrompt(g,c)})),m=this.buildTaskPrompt(s);let l;try{l=await ee.run({task:m,systemPrompt:"Code reviewer expert.",members:p,mode:e.specialized===!1?"consensus":"specialized"})}catch(g){const $=g instanceof Error?g.message:String(g);u.warn("code-review-multi-agent","crew run failed",{err:$}),l={task:m.slice(0,500),mode:"specialized",responses:[],synthesis:"Erreur lors du lancement des agents.",conflicts:[],consensus:!1,totalLatencyMs:Date.now()-t,ts:Date.now()}}const y=F.map((g,$)=>{const x=l.responses[$];if(!x)return{role:g,provider:j[g].provider,findings:[],confidence:0,rawText:"",ok:!1,error:"no response"};const N=this.parseAgentFindings(x.text),H=this.estimateConfidence(x.text,N);return{role:g,provider:x.provider,findings:N,confidence:H,rawText:x.text,ok:x.ok,...x.error&&{error:x.error}}}),d=y.filter(g=>g.ok&&g.confidence>=r),h=d.reduce((g,$)=>g+$.findings.length,0),b=d.reduce((g,$)=>g+$.findings.filter(x=>x.severity==="critical").length,0),k=this.computeScore(d),M=this.buildConsensus(d,l.synthesis),T={diffPreview:n,agents:y,consensus:M,finalScore:k,totalFindings:h,criticalFindings:b,reviewedAt:Date.now(),durationMs:Date.now()-t};return this.persistReport(T),w.record("code-review.run",{details:{agents:d.length,findings:h,critical:b,score:k,latencyMs:T.durationMs}}),u.info("code-review-multi-agent",`Review complete: ${d.length}/${y.length} agents · ${h} findings · score=${k}`),T}history(){try{const e=localStorage.getItem(P)??"[]",t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}async normalizeDiff(e){if(typeof e=="string")return e;try{const t=e.sha?`${e.url}/${e.sha}.diff`:e.url,r=await fetch(t,{method:"GET"});if(!r.ok)throw new Error(`fetch diff failed: HTTP ${r.status}`);return await r.text()}catch(t){return u.warn("code-review-multi-agent","fetch diff failed",{err:t}),`[Erreur fetch diff: ${e.url}]`}}buildRolePrompt(e,t){const r=`Tu es un reviewer expert. Réponds STRICTEMENT en JSON suivant le format :
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

${r}`;case"bug-detection":return`Cherche bugs : null/undefined refs, off-by-one, race conditions, promises non catch,
async leaks, edge cases non gérés, conditions impossibles, type mismatches.

${r}`;case"redundancy-check":return`Cherche : duplication code, fonctions mortes, imports inutilisés, conditions toujours
true/false, branches mortes, anti-patterns DRY.

${r}`;case"git-history-context":return`Imagine que ce diff fait partie d'une longue série de commits. Cherche signes de :
régression sur fix précédent, modif d'un fichier critique sans test, changement de signature
public sans migration. Sois pragmatique.

${r}`;case"code-patterns":return`Audit best practices : sécurité (XSS, injection, secrets en clair), perf (boucles
nested O(n²), DOM querySelector dans loop), accessibilité (aria-labels manquants), TypeScript
(any, ts-ignore, type assertions).

${r}`}}buildTaskPrompt(e){return`Review ce diff selon ton rôle. Réponds en JSON UNIQUEMENT.

\`\`\`diff
${e.length>8e3?e.slice(0,8e3)+`
[... diff tronqué]`:e}
\`\`\``}parseAgentFindings(e){if(!e)return[];try{const t=e.match(/\{[\s\S]*"findings"[\s\S]*\}/);if(!t)return[];const r=JSON.parse(t[0]);return Array.isArray(r.findings)?r.findings.filter(s=>typeof s=="object"&&s!==null).map(s=>{const n=String(s.severity??"info"),c={severity:["info","low","medium","high","critical"].includes(n)?n:"info",msg:String(s.msg??"").slice(0,300)};return typeof s.line=="number"&&(c.line=s.line),typeof s.fix=="string"&&(c.fix=String(s.fix).slice(0,300)),c}).filter(s=>s.msg.length>0):[]}catch{return[]}}estimateConfidence(e,t){if(!e)return 0;try{const r=e.match(/"confidence"\s*:\s*(\d+)/);if(r&&r[1]){const s=Number.parseInt(r[1],10);if(Number.isFinite(s)&&s>=0&&s<=100)return s}}catch{}return e.length<50?30:e.length<200?50:t.length>0?75:65}computeScore(e){if(e.length===0)return 100;let t=0;for(const r of e)for(const s of r.findings)switch(s.severity){case"critical":t+=20;break;case"high":t+=12;break;case"medium":t+=6;break;case"low":t+=2;break;case"info":t+=1;break}return Math.max(0,100-t)}buildConsensus(e,t){if(e.length===0)return"Aucun agent valide n'a répondu (confidence < threshold).";const r=[];r.push(`✅ ${e.length} agents valides ont participé`);const s=e.reduce((n,o)=>n+o.findings.length,0);if(s===0)r.push("🟢 Aucune anomalie détectée.");else{r.push(`⚠️ ${s} findings au total :`);for(const n of e)n.findings.length!==0&&r.push(`  • [${n.role}] ${n.findings.length} finding(s)`)}return t&&t.length<500&&r.push(`
${t}`),r.join(`
`)}persistReport(e){try{const t=localStorage.getItem(P)??"[]",r=JSON.parse(t),s=Array.isArray(r)?r:[];s.push(e);const n=s.slice(-te);localStorage.setItem(P,JSON.stringify(n))}catch(t){u.warn("code-review-multi-agent","persist failed",{err:t})}}}const se=new re,I="apex_v13_frontend_designs_history",ne=15,ie=[{rx:/font-family:\s*['"]?Inter['"]?/gi,replacement:"font-family: Georgia, 'Times New Roman', serif",reason:"Inter banni (slop)"},{rx:/font-family:\s*['"]?Roboto['"]?/gi,replacement:"font-family: Georgia, serif",reason:"Roboto banni (slop)"},{rx:/color:\s*#007bff/gi,replacement:"color: #c9a227",reason:"Bootstrap blue banni (slop)"},{rx:/background:\s*#28a745/gi,replacement:"background: #c9a227",reason:"Bootstrap green banni (slop)"}];class oe{async generate(e){const t=Date.now(),r=e.framework??"vanilla",s=this.buildSystemPrompt(r,e),n=`Crée un composant pour : ${e.prompt}

Retourne STRICTEMENT en JSON : {"html": "...", "css": "...", "js": "..."}`;let o="",a;try{await R.stream([{role:"user",content:n}],s,l=>{l.text&&(o+=l.text)},l=>{a=l})}catch(l){a=l instanceof Error?l:new Error(String(l))}if(a||!o)return u.warn("frontend-design","IA generation failed, fallback skeleton",{err:a?.message}),this.fallbackSkeleton(e,r,t,o);let c;try{const l=o.match(/\{[\s\S]*"html"[\s\S]*\}/);if(!l)throw new Error("JSON manquant");c=JSON.parse(l[0])}catch(l){return u.warn("frontend-design","parse failed, fallback",{err:l}),this.fallbackSkeleton(e,r,t,o)}const p={html:this.sanitizeHtml(c.html??""),css:this.applyAntiSlop(c.css??""),js:this.sanitizeJs(c.js??"")},m={html:p.html,css:p.css,js:p.js,framework:r,generatedAt:Date.now(),durationMs:Date.now()-t,rawText:o.slice(0,5e3)};return this.persistOutput(e,m),w.record("frontend-design.generate",{details:{framework:r,prompt:e.prompt.slice(0,100),durationMs:m.durationMs}}),u.info("frontend-design",`Generated ${r} component (${m.durationMs}ms)`),m}history(){try{const e=localStorage.getItem(I)??"[]",t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}buildPreviewSrcdoc(e){const t=e.framework==="react"?`<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
         <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
         <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>`:"",r=e.framework==="react"?"text/babel":"text/javascript";return`<!DOCTYPE html>
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
<script type="${r}">${e.js}<\/script>
</body>
</html>`}buildSystemPrompt(e,t){const r=t.brandColors,s=r?.primary??"#c9a227",n=r?.secondary??"#e8b830",o=r?.bg??"#0f0f1a",a=t.targetWidth??"mobile";return`Tu es un designer frontend SENIOR niveau Apple/Linear (production-grade).

ANTI-SLOP STRICT (interdiction absolue) :
 - PAS de fonts génériques : ban Inter, Roboto, Open Sans, Helvetica
 - PAS de couleurs Bootstrap par défaut (#007bff, #28a745, etc.)
 - PAS de box-shadow flat sans intention
 - PAS de border-radius 4px (= flat = mort)
 - PAS de transitions linear (toujours cubic-bezier intentionnel)

OBLIGATOIRE :
 - Typographie distinctive : Georgia/serif premium OU system-ui CURATED
 - Palette brand Apex : primary=${s}, secondary=${n}, bg=${o}
 - Animations cubic-bezier(0.16, 1, 0.3, 1) ou (0.34, 1.56, 0.64, 1)
 - border-radius >= 12px (ou 0 = brutalist intentionnel)
 - Mobile-first ${a} → touch targets >= 44px
 - Accessibilité : aria-label sur tous les boutons
 - prefers-reduced-motion respecté

Framework cible : ${e}
${e==="react"?"Utilise JSX, hooks, pas de class components.":"HTML5 + CSS3 + JS vanilla, pas de jQuery."}

Output : JSON STRICT { "html": "...", "css": "...", "js": "..." }
PAS de markdown, PAS d'explications hors JSON.`}applyAntiSlop(e){let t=e;for(const r of ie)t=t.replace(r.rx,r.replacement);return t}sanitizeHtml(e){return e.replace(/<script[\s\S]*?<\/script>/gi,"")}sanitizeJs(e){return e.replace(/\beval\s*\(/g,"/* eval blocked */(").replace(/document\.write\s*\(/g,"/* doc.write blocked */(")}fallbackSkeleton(e,t,r,s){return{html:`<div class="ax-fallback"><h2>${e.prompt.replace(/[<>"']/g,o=>({"<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[o]??o)}</h2><p>Génération IA indisponible. Skeleton de secours.</p></div>`,css:".ax-fallback{font-family:Georgia,serif;background:#0f0f1a;color:#e8b830;padding:24px;border-radius:14px;border:1px solid rgba(232,184,48,0.3)}",js:"/* fallback no-op */",framework:t,generatedAt:Date.now(),durationMs:Date.now()-r,rawText:s.slice(0,500)}}persistOutput(e,t){try{const r=localStorage.getItem(I)??"[]",s=JSON.parse(r),n=Array.isArray(s)?s:[];n.push({spec:e,output:t});const o=n.slice(-ne);localStorage.setItem(I,JSON.stringify(o))}catch(r){u.warn("frontend-design","persist failed",{err:r})}}}const q=new oe,O="apex_v13_gstack_roles_history",ae=25,ce={CEO:`Tu es CEO. Décide vite, priorise, justifie en 3 bullets max :
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
Format Markdown bullets.`};class le{async spawnRole(e,t){const r=Date.now(),s=ce[e];let n="",o;try{await R.stream([{role:"user",content:t}],s,c=>{c.text&&(n+=c.text)},c=>{o=c})}catch(c){o=c instanceof Error?c:new Error(String(c))}const a={role:e,task:t.slice(0,500),output:n,durationMs:Date.now()-r,ts:Date.now(),ok:!o&&n.length>0,...o&&{error:o.message.slice(0,200)}};return w.record("gstack.role",{details:{role:e,durationMs:a.durationMs,ok:a.ok}}),u.info("gstack-roles",`Role ${e} done (${a.durationMs}ms · ok=${a.ok})`),a}async runFullPipeline(e){const t=Date.now(),r=["CEO","Designer","Engineer","QA","ReleaseManager","Reviewer","Reflector"],s=[];for(const a of r){const c=this.enrichTaskWithContext(e,s),p=await this.spawnRole(a,c);s.push(p)}const n=this.buildSynthesis(s),o={task:e.slice(0,500),roles:s,finalSynthesis:n,totalDurationMs:Date.now()-t,ts:Date.now()};return this.persistResult(o),w.record("gstack.pipeline",{details:{task:e.slice(0,100),rolesCount:r.length,successful:s.filter(a=>a.ok).length,durationMs:o.totalDurationMs}}),u.info("gstack-roles",`Pipeline done: ${s.filter(a=>a.ok).length}/${r.length} OK · ${o.totalDurationMs}ms`),o}history(){try{const e=localStorage.getItem(O)??"[]",t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}listRoles(){return[{role:"CEO",description:"Décision business, priorités, ROI"},{role:"Designer",description:"UX/UI, anti-slop, brand"},{role:"Engineer",description:"Implémentation TypeScript strict"},{role:"QA",description:"Tests vitest exhaustifs"},{role:"ReleaseManager",description:"Versioning, changelog, deploy"},{role:"Reviewer",description:"Code review honnête"},{role:"Reflector",description:"Lessons learned"}]}enrichTaskWithContext(e,t){if(t.length===0)return e;const r=t.slice(-3).map(s=>`### ${s.role}
${s.output.slice(0,1200)}`).join(`

`);return`Tâche : ${e}

Contexte (rôles précédents) :
${r}`}buildSynthesis(e){const t=e.filter(s=>s.ok);if(t.length===0)return"Pipeline a échoué : aucun rôle n'a produit de résultat.";const r=[];r.push(`## Synthèse pipeline (${t.length}/${e.length} rôles OK)
`);for(const s of t){const n=s.output.slice(0,200).replace(/\n/g," ");r.push(`**${s.role}** (${s.durationMs}ms) : ${n}...`)}return r.join(`
`)}persistResult(e){try{const t=localStorage.getItem(O)??"[]",r=JSON.parse(t),s=Array.isArray(r)?r:[];s.push(e);const n=s.slice(-ae);localStorage.setItem(O,JSON.stringify(n))}catch(t){u.warn("gstack-roles","persist failed",{err:t})}}}const pe=new le,J="apex_v13_security_review_last",D="apex_v13_security_review_history",ue=20,de=[{name:"Anthropic API key",rx:/sk-ant-api\d{2}-[A-Za-z0-9_-]{40,}/},{name:"OpenAI API key",rx:/sk-(?:proj-)?[A-Za-z0-9_-]{40,}/},{name:"Google API key",rx:/AIza[A-Za-z0-9_-]{33,}/},{name:"GitHub PAT",rx:/gh[opsu]_[A-Za-z0-9]{36,}/},{name:"Stripe secret",rx:/sk_(?:live|test)_[A-Za-z0-9]{24,}/},{name:"Slack token",rx:/xox[bpao]-[A-Za-z0-9-]{20,}/},{name:"AWS access key",rx:/AKIA[0-9A-Z]{16}/},{name:"Telegram bot token",rx:/\d{8,}:[A-Za-z0-9_-]{35,}/}];class ge{async runFullScan(){const e=Date.now(),t=[];let r=0,s=0;r++;const n=this.scanPlaintextSecrets();n.length===0&&s++,t.push(...n),r++;const o=this.scanCspViolations();o?t.push(o):s++,r++;const a=this.scanVaultDrift();a.length===0&&s++,t.push(...a),r++;const c=this.scanDomInjection();c?t.push(c):s++,r++;const p=this.scanRedactionDisabled();p?t.push(p):s++,r++;const m=await this.scanAuditIntegrity();m?t.push(m):s++,r++;const l=this.scanSessionLeak();l?t.push(l):s++;const y=this.computeScore(t,r),d={scannedAt:Date.now(),durationMs:Date.now()-e,score:y,findings:t,totalChecks:r,passedChecks:s};return this.persistReport(d),w.record("security-review.scan",{details:{score:y,findings:t.length,critical:t.filter(h=>h.severity==="critical").length,high:t.filter(h=>h.severity==="high").length}}),u.info("security-review",`Scan complete: score=${y}/100 · ${t.length} findings`),d}getLastReport(){try{const e=localStorage.getItem(J);return e?JSON.parse(e):null}catch{return null}}history(){try{const e=localStorage.getItem(D)??"[]",t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}scanPlaintextSecrets(){const e=[],t=["apex_v13_vault_","apex_v13_encrypted_","apex_v13_obf_"];try{for(let r=0;r<localStorage.length;r++){const s=localStorage.key(r);if(!s||t.some(o=>s.startsWith(o)))continue;const n=localStorage.getItem(s);if(!(!n||n.length<20)){for(const o of de)if(o.rx.test(n)){e.push({category:"secret-exposure",severity:"critical",msg:`Secret "${o.name}" en clair dans localStorage`,detail:`Clé : ${s}`,fix:"Migrer vers multi-key-vault chiffré AES-GCM-256"});break}}}}catch(r){u.warn("security-review","plaintext scan failed",{err:r})}return e}scanCspViolations(){try{const e=X.getStats(),t=Object.values(e).reduce((n,o)=>n+o.count,0);if(t===0)return null;const r=Object.values(e).filter(n=>Date.now()-n.lastSeen<3600*1e3);return r.length===0?null:{category:"csp-violation",severity:t>50?"high":t>10?"medium":"low",msg:`${t} violations CSP enregistrées (${r.length} dans la dernière heure)`,fix:"Ouvrir csp-monitor dashboard, valider whitelist suggestions"}}catch(e){return u.warn("security-review","csp scan failed",{err:e}),null}}scanVaultDrift(){const e=[];try{const t=["anthropic","openai","github","stripe","cloudflare"];for(const r of t){const s=B.getStats(r);if(s.total===0)continue;const n=s.active===0?"red":s.invalid+s.failing>0?"yellow":"green";n==="red"?e.push({category:"vault-drift",severity:"high",msg:`Vault "${r}" en état RED (toutes clés en panne)`,detail:`${s.invalid} invalides · ${s.failing} failing sur ${s.total} clés`,fix:`Régénérer une nouvelle clé sur dashboard ${r} et l'ajouter au vault`}):n==="yellow"&&s.invalid>0&&e.push({category:"vault-drift",severity:"medium",msg:`Vault "${r}" : ${s.invalid} clé(s) invalide(s)`,fix:"Faire rotation manuelle ou healthCheckAll"})}}catch(t){u.warn("security-review","vault scan failed",{err:t})}return e}scanDomInjection(){if(typeof document>"u")return null;try{const e=Array.from(document.querySelectorAll("script")),t=["cdn.jsdelivr.net","unpkg.com","cdn.skypack.dev","esm.sh"],r=e.filter(s=>{const n=s.getAttribute("src")??"";if(!n)return!1;try{const o=new URL(n,window.location.origin);return o.origin===window.location.origin?!1:!t.some(a=>o.hostname.endsWith(a))}catch{return!0}});return r.length===0?null:{category:"dom-injection",severity:"high",msg:`${r.length} script tag(s) externe(s) non-trustés détectés`,detail:r.slice(0,3).map(s=>s.getAttribute("src")??"").join(" · "),fix:"Vérifier CSP script-src + retirer scripts inutiles"}}catch(e){return u.warn("security-review","dom scan failed",{err:e}),null}}scanRedactionDisabled(){try{const e=localStorage.getItem("apex_v13_redact_disabled");return e==="true"||e==="1"?{category:"pii-redaction",severity:"high",msg:"PII redaction outbound DÉSACTIVÉE (flag apex_v13_redact_disabled)",fix:"Réactiver pii-redaction (clé localStorage à supprimer)"}:null}catch{return null}}async scanAuditIntegrity(){try{const e=await w.verifyChainIntegrity();return e.valid?null:{category:"audit-integrity",severity:"critical",msg:`Audit log chain INVALIDE (broken at index ${e.brokenAt}/${e.totalEntries})`,fix:"Audit log tampered → escalade Claude Code via ax_claude_todo"}}catch(e){return u.warn("security-review","audit integrity check failed",{err:e}),null}}scanSessionLeak(){try{const e=localStorage.getItem("apex_v13_lastact");if(!e)return null;const t=Number.parseInt(e,10);if(!Number.isFinite(t))return null;const r=Date.now()-t,s=1440*60*1e3;return r>s?{category:"session-leak",severity:"medium",msg:`Session active depuis plus de 24h (${Math.round(r/36e5)}h)`,fix:"Forcer logout et re-login pour purger session stale"}:null}catch{return null}}computeScore(e,t){if(t===0)return 100;let r=0;for(const s of e)switch(s.severity){case"critical":r+=25;break;case"high":r+=15;break;case"medium":r+=8;break;case"low":r+=3;break;case"info":r+=1;break}return Math.max(0,100-r)}persistReport(e){try{localStorage.setItem(J,JSON.stringify(e));const t=localStorage.getItem(D)??"[]",r=JSON.parse(t),s=Array.isArray(r)?r:[];s.push(e);const n=s.slice(-ue);localStorage.setItem(D,JSON.stringify(n))}catch(t){u.warn("security-review","persist failed",{err:t})}}}const me=new ge,G="apex_v13_superpowers_sessions",fe=20,E=["brainstorm","plan","dev","test","review","ship","reflect"],he={brainstorm:{system:`Tu es un dev senior. Explore 3-5 approches DIFFÉRENTES pour résoudre la tâche.
Pour chacune : 1 phrase pitch, pros/cons, complexité (S/M/L), risques.
Format Markdown structuré.`,userTpl:i=>`Tâche : ${i}

Génère 3-5 options possibles.`},plan:{system:`Tu es architecte logiciel. Produis un design doc + ADR (Architecture Decision Record).
Sections : Contexte · Décision · Conséquences · Alternatives rejetées.
Format Markdown.`,userTpl:(i,e)=>`Tâche : ${i}

Brainstorm précédent :
${e}

Choisis la meilleure option et écris le design doc.`},dev:{system:`Tu es dev senior. Implémente la solution.
Donne le code complet (TypeScript strict, pas any), prêt à coller.
Inclus les imports.`,userTpl:(i,e)=>`Tâche : ${i}

Plan :
${e}

Écris le code de la solution.`},test:{system:`Tu es QA expert. Écris les tests vitest qui couvrent : happy path, edge cases, erreurs.
Min 5 cas. Format TypeScript prêt à coller.`,userTpl:(i,e)=>`Tâche : ${i}

Code :
${e}

Écris les tests vitest associés.`},review:{system:`Tu es reviewer expert. Audit le code + tests : sécurité, perf, lisibilité, conformité.
Format : ✅ OK / ⚠️ Suggestion / ❌ Problème + ligne.`,userTpl:(i,e)=>`Tâche : ${i}

Code + tests :
${e}

Fais une review honnête.`},ship:{system:`Tu es release manager. Génère :
- Numéro de version (semver)
- Message commit (titre court + bullets)
- Checklist deploy (build, tests, sync apex-ai-v13/)`,userTpl:(i,e)=>`Tâche : ${i}

Code finalisé :
${e}

Prépare la release.`},reflect:{system:`Tu es coach senior. Tire les leçons :
- Qu'a-t-on appris ?
- Patterns réutilisables ?
- Pièges à éviter ?
- Améliorations futures ?
Format Markdown bullets.`,userTpl:(i,e)=>`Tâche : ${i}

Déroulé :
${e}

Quelles leçons retient-on ?`}};class ye{start(e){const t=`sp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,r={sessionId:t,taskName:e,createdAt:Date.now(),updatedAt:Date.now(),currentStep:"brainstorm",completedSteps:[],outputs:{brainstorm:null,plan:null,dev:null,test:null,review:null,ship:null,reflect:null},status:"active"};return this.persistSession(r),w.record("superpowers.start",{details:{sessionId:t,taskName:e.slice(0,100)}}),u.info("superpowers",`New session ${t} : ${e}`),t}async advance(e){const t=this.getState(e);if(!t)return u.warn("superpowers",`Session ${e} introuvable`),null;if(t.status!=="active")return u.warn("superpowers",`Session ${e} status=${t.status} → skip`),null;const r=Date.now(),s=t.currentStep,n=he[s],o=this.buildPrevOutputsContext(t);let a="",c;try{await R.stream([{role:"user",content:n.userTpl(t.taskName,o)}],n.system,l=>{l.text&&(a+=l.text)},l=>{c=l})}catch(l){c=l instanceof Error?l:new Error(String(l))}(c||!a)&&(u.warn("superpowers",`Step ${s} failed`,{err:c?.message}),a=`[Step ${s} failed: ${c?.message??"no response"}]`);const p={step:s,output:a,ts:Date.now(),durationMs:Date.now()-r};t.outputs[s]=p,t.completedSteps.push(s),t.updatedAt=Date.now();const m=E.indexOf(s)+1;if(m>=E.length)t.status="completed";else{const l=E[m];l&&(t.currentStep=l)}return this.persistSession(t),w.record("superpowers.advance",{details:{sessionId:e,step:s,durationMs:p.durationMs}}),u.info("superpowers",`Session ${e} : step ${s} done (${p.durationMs}ms)`),p}getState(e){return this.listSessions().find(r=>r.sessionId===e)??null}listSessions(){try{const e=localStorage.getItem(G)??"[]",t=JSON.parse(e);return Array.isArray(t)?t.slice().sort((r,s)=>s.updatedAt-r.updatedAt):[]}catch{return[]}}cancel(e){const t=this.getState(e);return!t||t.status!=="active"?!1:(t.status="cancelled",t.updatedAt=Date.now(),this.persistSession(t),w.record("superpowers.cancel",{details:{sessionId:e}}),!0)}buildPrevOutputsContext(e){const t=[];for(const r of e.completedSteps.slice(-3)){const s=e.outputs[r];s&&t.push(`### ${r}
${s.output.slice(0,1500)}`)}return t.join(`

`)}persistSession(e){try{const t=this.listSessions(),r=t.findIndex(n=>n.sessionId===e.sessionId);r>=0?t[r]=e:t.push(e);const s=t.slice(0,fe);localStorage.setItem(G,JSON.stringify(s))}catch(t){u.warn("superpowers","persist failed",{err:t})}}}const _=new ye;let A=null;function Ge(){A?.cleanup(),A=null}function f(i){return i.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}const be=[{id:"security-review",emoji:"🔒",name:"Security Review",description:"Scan runtime exhaustif : secrets en clair, CSP violations, vault drift, audit integrity.",status:"installed",buttonLabel:"Lancer scan"},{id:"code-review-5-agents",emoji:"👥",name:"Code Review 5 Agents",description:"5 IA en parallèle (CLAUDE.md compliance / bugs / redondance / git history / patterns).",status:"configurable",buttonLabel:"Reviewer un diff"},{id:"frontend-design",emoji:"🎨",name:"Frontend Design",description:"Génère un composant UI production-grade depuis prompt avec anti-slop strict.",status:"configurable",buttonLabel:"Générer composant"},{id:"superpowers",emoji:"⚡",name:"Superpowers",description:"7-step methodology : brainstorm → plan → dev → test → review → ship → reflect.",status:"configurable",buttonLabel:"Démarrer session"},{id:"gstack-roles",emoji:"🏛",name:"GStack Roles",description:"7 rôles spécialisés (CEO/Designer/Engineer/QA/Release/Reviewer/Reflector).",status:"configurable",buttonLabel:"Lancer pipeline"}];function ve(i){const e=i.status==="installed"?'<span style="background:rgba(34,204,119,0.15);color:#22cc77;padding:3px 10px;border-radius:10px;font-size:11px;font-weight:600;letter-spacing:0.02em">✅ Actif</span>':'<span style="background:rgba(232,184,48,0.15);color:#e8b830;padding:3px 10px;border-radius:10px;font-size:11px;font-weight:600;letter-spacing:0.02em">⚙️ Config</span>';return`
    <article class="ax-yury-card" data-plugin-id="${f(i.id)}" style="background:linear-gradient(135deg,rgba(20,20,35,0.85),rgba(14,14,28,0.65));border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:10px;transition:transform 200ms cubic-bezier(0.16,1,0.3,1)">
      <header style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:28px" aria-hidden="true">${f(i.emoji)}</span>
          <h3 style="margin:0;font-size:16px;color:#fff;font-weight:700;letter-spacing:-0.015em">${f(i.name)}</h3>
        </div>
        ${e}
      </header>
      <p style="margin:0;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">${f(i.description)}</p>
      <button class="ax-btn ax-bounce-tap" data-launch="${f(i.id)}" aria-label="Lancer ${f(i.name)}" style="margin-top:6px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;padding:11px 18px;border-radius:22px;font-weight:700;cursor:pointer;font-size:13px;min-height:44px;-webkit-tap-highlight-color:transparent;transition:all 180ms cubic-bezier(0.16,1,0.3,1)">
        ${f(i.buttonLabel)}
      </button>
    </article>
  `}function xe(){return`
    <div class="ax-yury-plugins" style="padding:max(20px, env(safe-area-inset-top)) 16px max(20px, env(safe-area-inset-bottom)) 16px;max-width:1100px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif">
      <header style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.06)">
        <div>
          <h1 style="margin:0;font-size:clamp(22px,5.5vw,30px);font-weight:700;background:linear-gradient(135deg,#c9a227,#e8b830);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:Georgia,serif;letter-spacing:-0.025em;line-height:1.15">🚀 Yury Plugins (équivalents Apex)</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.55);font-size:12px">5 services applicatifs natifs PWA, pas Claude Code</p>
        </div>
        <button class="ax-btn ax-bounce-tap" data-back-admin style="flex-shrink:0;padding:9px 16px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:24px;font-size:13px;font-weight:600;cursor:pointer;min-height:40px;white-space:nowrap" aria-label="Retour Admin">← Admin</button>
      </header>
      <div class="ax-yury-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">
        ${be.map(ve).join("")}
      </div>
    </div>
  `}async function we(){v.info("🔒 Scan en cours...");try{const i=await me.runFullScan(),e=i.findings.length>0?i.findings.map(t=>`
        <li style="background:rgba(255,255,255,0.03);padding:10px 12px;border-radius:10px;margin-bottom:6px">
          <strong style="color:${t.severity==="critical"?"#ff5566":t.severity==="high"?"#ffaa44":"#e8b830"}">[${f(t.severity)}]</strong>
          <span>${f(t.msg)}</span>
          ${t.fix?`<p style="color:rgba(255,255,255,0.55);font-size:12px;margin:4px 0 0">Fix : ${f(t.fix)}</p>`:""}
        </li>`).join(""):'<li style="color:#22cc77">🟢 Aucune vulnérabilité détectée.</li>';S.open({title:`🔒 Security Review — Score ${i.score}/100`,content:`
        <div style="font-family:system-ui;padding:14px 4px">
          <p style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:14px">
            ${i.passedChecks}/${i.totalChecks} checks passés · ${i.findings.length} findings · ${Math.round(i.durationMs)}ms
          </p>
          <ul style="list-style:none;padding:0;margin:0;max-height:50vh;overflow-y:auto">${e}</ul>
        </div>
      `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>S.closeAll()}]})}catch(i){u.warn("yury-plugins","security review failed",{err:i}),v.error("Scan échoué — vérifie les logs")}}async function Se(){const i=window.prompt("Colle le diff à reviewer (ou laisse vide pour démo) :","");if(i!==null){v.info("👥 Lancement des 5 agents...");try{const e=await se.review({diff:i||`+const test = "demo";
-const old = "removed";`}),t=e.agents.map(r=>`
      <li style="background:rgba(255,255,255,0.03);padding:10px 12px;border-radius:10px;margin-bottom:6px">
        <strong>[${f(r.role)}]</strong> · ${f(r.provider)} · confidence ${r.confidence}/100
        <p style="color:rgba(255,255,255,0.55);font-size:12px;margin:4px 0 0">${r.findings.length} finding(s)</p>
      </li>`).join("");S.open({title:`👥 Code Review — Score ${e.finalScore}/100`,content:`
        <div style="font-family:system-ui;padding:14px 4px">
          <p style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:14px">
            ${e.totalFindings} findings · ${e.criticalFindings} critical · ${Math.round(e.durationMs)}ms
          </p>
          <h3 style="font-size:13px;color:#e8b830;text-transform:uppercase;margin:0 0 8px">Agents</h3>
          <ul style="list-style:none;padding:0;margin:0 0 14px">${t}</ul>
          <h3 style="font-size:13px;color:#e8b830;text-transform:uppercase;margin:0 0 8px">Consensus</h3>
          <pre style="background:rgba(0,0,0,0.4);color:rgba(255,255,255,0.85);padding:12px;border-radius:10px;font-size:12px;white-space:pre-wrap;max-height:30vh;overflow-y:auto">${f(e.consensus)}</pre>
        </div>
      `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>S.closeAll()}]})}catch(e){u.warn("yury-plugins","code review failed",{err:e}),v.error("Review échouée — vérifie clés IA")}}}async function $e(){const i=window.prompt("Décris le composant UI à générer :","Bouton CTA premium avec hover doux");if(i){v.info("🎨 Génération en cours...");try{const e=await q.generate({prompt:i,framework:"vanilla"}),r=q.buildPreviewSrcdoc(e).replace(/"/g,"&quot;").replace(/</g,"&lt;");S.open({title:`🎨 Frontend Design — ${e.framework}`,content:`
        <div style="font-family:system-ui;padding:14px 4px">
          <p style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:10px">
            Généré en ${Math.round(e.durationMs)}ms · framework ${f(e.framework)}
          </p>
          <iframe sandbox="allow-scripts" srcdoc="${r}" style="width:100%;height:300px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;background:#fff" aria-label="Aperçu du composant généré"></iframe>
          <details style="margin-top:14px">
            <summary style="cursor:pointer;color:#e8b830;font-weight:600">Voir le code</summary>
            <pre style="background:rgba(0,0,0,0.4);color:rgba(255,255,255,0.85);padding:12px;border-radius:10px;font-size:11px;white-space:pre-wrap;max-height:30vh;overflow:auto;margin-top:8px"><strong>HTML:</strong>
${f(e.html)}

<strong>CSS:</strong>
${f(e.css)}

<strong>JS:</strong>
${f(e.js)}</pre>
          </details>
        </div>
      `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>S.closeAll()}]})}catch(e){u.warn("yury-plugins","frontend design failed",{err:e}),v.error("Génération échouée")}}}async function ke(){const i=window.prompt("Nom de la tâche pour la session Superpowers :","Refactor auth flow");if(!i)return;const e=_.start(i);v.info(`⚡ Session ${e} démarrée — avancement step 1/7...`);try{const t=await _.advance(e),r=_.getState(e);S.open({title:`⚡ Superpowers — ${f(i)}`,content:`
        <div style="font-family:system-ui;padding:14px 4px">
          <p style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:10px">
            Session ${f(e)} · step actuel : <strong>${f(r?.currentStep??"-")}</strong>
          </p>
          <h3 style="font-size:13px;color:#e8b830;text-transform:uppercase;margin:0 0 8px">Output ${f(t?.step??"?")}</h3>
          <pre style="background:rgba(0,0,0,0.4);color:rgba(255,255,255,0.85);padding:12px;border-radius:10px;font-size:12px;white-space:pre-wrap;max-height:40vh;overflow-y:auto">${f(t?.output??"(pas de sortie)")}</pre>
          <p style="color:rgba(255,255,255,0.55);font-size:12px;margin-top:10px">
            Re-lance la vue pour avancer au step suivant.
          </p>
        </div>
      `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>S.closeAll()}]})}catch(t){u.warn("yury-plugins","superpowers advance failed",{err:t}),v.error("Step échoué")}}async function Ae(){const i=window.prompt("Tâche pour le pipeline GStack 7 rôles :","Implémenter dark mode toggle");if(i){v.info("🏛 Pipeline 7 rôles en cours (peut prendre 30-60s)...");try{const e=await pe.runFullPipeline(i),t=e.roles.map(r=>`
      <li style="background:rgba(255,255,255,0.03);padding:10px 12px;border-radius:10px;margin-bottom:6px">
        <strong style="color:${r.ok?"#22cc77":"#ff5566"}">[${f(r.role)}]</strong>
        ${r.ok?"✅":"❌"} · ${Math.round(r.durationMs)}ms
        <p style="color:rgba(255,255,255,0.55);font-size:12px;margin:4px 0 0">${f(r.output.slice(0,200))}...</p>
      </li>`).join("");S.open({title:`🏛 GStack Pipeline — ${e.roles.filter(r=>r.ok).length}/7 OK`,content:`
        <div style="font-family:system-ui;padding:14px 4px">
          <p style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:14px">
            ${Math.round(e.totalDurationMs/1e3)}s total
          </p>
          <ul style="list-style:none;padding:0;margin:0 0 14px;max-height:50vh;overflow-y:auto">${t}</ul>
        </div>
      `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>S.closeAll()}]})}catch(e){u.warn("yury-plugins","gstack pipeline failed",{err:e}),v.error("Pipeline échoué")}}}function Te(i){if(!A)return;i.querySelectorAll("[data-launch]").forEach(t=>{A.bind(t,"click",()=>{L.tap();const r=t.dataset.launch??"";switch(r){case"security-review":we();break;case"code-review-5-agents":Se();break;case"frontend-design":$e();break;case"superpowers":ke();break;case"gstack-roles":Ae();break;default:v.warn(`Plugin ${r} non implémenté`)}})});const e=i.querySelector("[data-back-admin]");e&&A.bind(e,"click",()=>{L.tap(),V.navigate("admin")})}function He(i){if(A?.cleanup(),A=U("admin-yury-plugins"),!K.get("isAdmin")){i.innerHTML=`
      <div class="ax-empty" style="padding:40px 20px;text-align:center;color:rgba(255,255,255,0.6)">
        <h2>Accès réservé</h2>
        <p>Cette section est réservée à l'admin Kevin.</p>
      </div>
    `;return}i.innerHTML=xe(),Te(i)}export{Ge as dispose,He as render};
