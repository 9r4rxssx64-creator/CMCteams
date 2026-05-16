import{l as c}from"./monitoring-3uBGKGRH.js";import{aiRouter as g}from"./ai-router-C8StAaQS.js";import{a as d}from"./apex-kb-CneNoeEa.js";import"../core/main-BqJ2RX_L.js";import"./multi-source-analyze-D3rO9HdA.js";import"./credential-patterns-CLzI061R.js";import"./chat-fallback-D2D0wk00.js";import"./voice-Cu7TDF-3.js";import"./economy-mode-BkvrYZaX.js";import"./tokens-dashboard-C5ZzZyK6.js";const u="apex_v13_plan_active",f="apex_v13_plan_history",y=20;class w{async generate(t){const e=(t||"").trim();if(!e)throw new Error("Objectif vide");const r=Date.now(),i=`plan_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,n=`Tu es Apex en MODE PLAN. L'utilisateur te donne un objectif. Tu DOIS retourner STRICTEMENT un JSON :
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

Retourne STRICTEMENT le JSON du plan.`}],n,s=>{s.text&&(a+=s.text)},s=>{m=s})}catch(s){m=s instanceof Error?s:new Error(String(s))}if(m||!a)return c.warn("plan-mode","IA failed, fallback",{err:m?.message}),this.fallbackPlan(i,e,r,a);let p;try{const s=a.match(/\{[\s\S]*"steps"[\s\S]*\}/);if(!s)throw new Error("JSON manquant");const l=JSON.parse(s[0]);if(!l||!Array.isArray(l.steps))throw new Error("format invalide");p={summary:typeof l.summary=="string"?l.summary.slice(0,500):"",steps:l.steps.slice(0,8).map(h=>this.sanitizeStep(h))}}catch(s){return c.warn("plan-mode","parse failed, fallback",{err:s}),this.fallbackPlan(i,e,r,a)}const o={id:i,objective:e,summary:p.summary,steps:p.steps,createdAt:Date.now(),durationMs:Date.now()-r,rawText:a.slice(0,5e3)};return this.persist(o),d.record("plan-mode.generate",{details:{id:i,objective:e.slice(0,100),steps:o.steps.length}}),c.info("plan-mode",`Plan ${i} (${o.steps.length} steps, ${o.durationMs}ms)`),o}getActive(){try{const t=localStorage.getItem(u);return t?JSON.parse(t):null}catch{return null}}revoke(){localStorage.removeItem(u),d.record("plan-mode.revoke"),c.info("plan-mode","Active plan revoked")}history(){try{const t=localStorage.getItem(f);if(!t)return[];const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch{return[]}}buildExecutionContext(t){const e=t.steps.map((r,i)=>`${i+1}. [${r.risk}] ${r.title}${r.files.length?` (${r.files.join(", ")})`:""}`).join(`
`);return`[PLAN VALIDÉ — exécute en suivant ces étapes]
Objectif : ${t.objective}
Résumé : ${t.summary}
Étapes :
${e}

Applique chaque étape dans l'ordre. Demande confirmation avant chaque step "high".`}sanitizeStep(t){const e=t??{},r=typeof e.title=="string"?e.title.slice(0,200):"(sans titre)",i=Array.isArray(e.files)?e.files.filter(a=>typeof a=="string").slice(0,10):[],n=e.risk==="high"?"high":e.risk==="medium"?"medium":"low";return{title:r,files:i,risk:n}}fallbackPlan(t,e,r,i){const n={id:t,objective:e,summary:"Plan généré en fallback (IA indisponible ou parse échoué).",steps:[{title:"Analyser le contexte",files:[],risk:"low"},{title:"Identifier les fichiers concernés",files:[],risk:"low"},{title:"Implémenter les changements",files:[],risk:"medium"},{title:"Tester et valider",files:[],risk:"low"}],createdAt:Date.now(),durationMs:Date.now()-r,rawText:i.slice(0,5e3)};return this.persist(n),n}persist(t){try{localStorage.setItem(u,JSON.stringify(t));const e=this.history();e.unshift(t);const r=e.slice(0,y);localStorage.setItem(f,JSON.stringify(r))}catch(e){c.warn("plan-mode","persist failed",{err:e})}}}const N=new w;export{N as planMode};
