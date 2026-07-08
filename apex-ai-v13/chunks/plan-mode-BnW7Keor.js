import{l as c,a as d}from"./monitoring-D_1f5IX4.js";import{aiRouter as g}from"./ai-router-Bfs6ateH.js";import"./multi-source-analyze-DnTbSy20.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-CQaqrW5w.js";import"../core/main-XBafQZqk.js";import"./memory-DwKnR7sp.js";import"./economy-mode-B_FXus9E.js";import"./chat-fallback-CU-eEdf9.js";import"./apex-tools-dispatch-core-CkH4NpnS.js";import"./apex-tools-dispatch-skills-D9s111k6.js";import"./apex-tools-dispatch-data-BbCzZksa.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-CFiZvTLH.js";import"./apex-tools-misc-Drf4_h-w.js";import"./apex-tools-registry-core-B4u4pCoL.js";import"./apex-tools-registry-skills-x-mAWYry.js";const u="apex_v13_plan_active",f="apex_v13_plan_history",y=20;class w{async generate(t){const e=(t||"").trim();if(!e)throw new Error("Objectif vide");const r=Date.now(),i=`plan_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,o=`Tu es Apex en MODE PLAN. L'utilisateur te donne un objectif. Tu DOIS retourner STRICTEMENT un JSON :
{
  "summary": "résumé 1-2 phrases du plan global",
  "steps": [
    { "title": "étape concise", "files": ["liste fichiers concernés"], "risk": "low|medium|high" },
    ...
  ]
}
Règles :
- 3 à 8 steps maximum, ordonnés
- Pas de texte hors JSON
- "files" est array de strings (peut être vide [])
- "risk" : low (lecture seule), medium (modif locale), high (suppression / breaking change)
- Pas d'exécution, juste le plan`;let a="",m;try{await g.stream([{role:"user",content:`Objectif : ${e}

Retourne STRICTEMENT le JSON du plan.`}],o,s=>{s.text&&(a+=s.text)},s=>{m=s})}catch(s){m=s instanceof Error?s:new Error(String(s))}if(m||!a)return c.warn("plan-mode","IA failed, fallback",{err:m?.message}),this.fallbackPlan(i,e,r,a);let p;try{const s=a.match(/\{[\s\S]*"steps"[\s\S]*\}/);if(!s)throw new Error("JSON manquant");const l=JSON.parse(s[0]);if(!l||!Array.isArray(l.steps))throw new Error("format invalide");p={summary:typeof l.summary=="string"?l.summary.slice(0,500):"",steps:l.steps.slice(0,8).map(h=>this.sanitizeStep(h))}}catch(s){return c.warn("plan-mode","parse failed, fallback",{err:s}),this.fallbackPlan(i,e,r,a)}const n={id:i,objective:e,summary:p.summary,steps:p.steps,createdAt:Date.now(),durationMs:Date.now()-r,rawText:a.slice(0,5e3)};return this.persist(n),d.record("plan-mode.generate",{details:{id:i,objective:e.slice(0,100),steps:n.steps.length}}),c.info("plan-mode",`Plan ${i} (${n.steps.length} steps, ${n.durationMs}ms)`),n}getActive(){try{const t=localStorage.getItem(u);return t?JSON.parse(t):null}catch{return null}}revoke(){localStorage.removeItem(u),d.record("plan-mode.revoke"),c.info("plan-mode","Active plan revoked")}history(){try{const t=localStorage.getItem(f);if(!t)return[];const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch{return[]}}buildExecutionContext(t){const e=t.steps.map((r,i)=>`${i+1}. [${r.risk}] ${r.title}${r.files.length?` (${r.files.join(", ")})`:""}`).join(`
`);return`[PLAN VALIDÉ — exécute en suivant ces étapes]
Objectif : ${t.objective}
Résumé : ${t.summary}
Étapes :
${e}

Applique chaque étape dans l'ordre. Demande confirmation avant chaque step "high".`}sanitizeStep(t){const e=t??{},r=typeof e.title=="string"?e.title.slice(0,200):"(sans titre)",i=Array.isArray(e.files)?e.files.filter(a=>typeof a=="string").slice(0,10):[],o=e.risk==="high"?"high":e.risk==="medium"?"medium":"low";return{title:r,files:i,risk:o}}fallbackPlan(t,e,r,i){const o={id:t,objective:e,summary:"Plan généré en fallback (IA indisponible ou parse échoué).",steps:[{title:"Analyser le contexte",files:[],risk:"low"},{title:"Identifier les fichiers concernés",files:[],risk:"low"},{title:"Implémenter les changements",files:[],risk:"medium"},{title:"Tester et valider",files:[],risk:"low"}],createdAt:Date.now(),durationMs:Date.now()-r,rawText:i.slice(0,5e3)};return this.persist(o),o}persist(t){try{localStorage.setItem(u,JSON.stringify(t));const e=this.history();e.unshift(t);const r=e.slice(0,y);localStorage.setItem(f,JSON.stringify(r))}catch(e){c.warn("plan-mode","persist failed",{err:e})}}}const R=new w;export{R as planMode};
