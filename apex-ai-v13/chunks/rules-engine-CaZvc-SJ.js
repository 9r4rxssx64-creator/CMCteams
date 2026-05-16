import{l as d}from"./monitoring-3uBGKGRH.js";import{m as E}from"../core/main-rZUmP-SC.js";import"./apex-kb-DjXD38OJ.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-BNmyN8wO.js";const L=50,g=55,A="apex_v13_errors_applied",f=/^##\s+(?:[\p{Extended_Pictographic}\p{Emoji_Component}‍️]+\s+)?RÈGLE\s+(PERMANENTE|ABSOLUE|SUPRÊME|CRITIQUE|MAÎTRESSE)\s*[—\-]\s*(.+?)(?:\s+\(Kevin\s+(\d{4}-\d{2}-\d{2}[^)]*)\))?\s*$/iu,S=/^(\d{1,3})\.\s+(?:\*\*)?(.+?)(?:\*\*)?\s*(?:[—\-:](.+))?$/;class y{list(){try{const t=E.getDocsContext()["CLAUDE.md"]?.content;return t?this.parseRules(t):(d.warn("rules-engine","CLAUDE.md cache vide — appelle memory.syncDocsAtBoot()"),[])}catch(e){return d.warn("rules-engine","list failed",{err:e}),[]}}top(e=10){return this.list().slice(0,e)}filter(e){const t=(e||"").toLowerCase().trim();return t?this.list().filter(r=>r.title.toLowerCase().includes(t)||r.quote.toLowerCase().includes(t)||r.bodyExcerpt.toLowerCase().includes(t)):this.list()}getInjectedCount(){const e=this.list().length,t=this.listErrors(),r=t.filter(s=>s.applied).length;return{rules:e,errorsApplied:r,errorsTotal:t.length}}getTopRules(e=50){return this.list().slice(0,e)}renderMarkdown(e){if(e.length===0)return"_Aucune règle trouvée. Lance `memory.syncDocsAtBoot()` ou vérifie ton cache._";const t=e.map((r,s)=>{const o=r.date?` _(${r.date})_`:"",i=r.quote?`
  > ${r.quote.slice(0,200)}`:"";return`**${s+1}. ${r.title}**${o}${i}`});return`### Règles permanentes Apex (${e.length})

${t.join(`

`)}`}listErrors(){try{const t=E.getDocsContext()["CLAUDE.md"]?.content??"";return t?this.parseErrors(t):[]}catch(e){return d.warn("rules-engine","listErrors failed",{err:e}),[]}}getTopErrors(e=g){return this.listErrors().slice(0,e)}markErrorApplied(e){if(!Number.isFinite(e)||e<1)return;const t=this.loadApplied();t.add(e),this.saveApplied(t)}unmarkErrorApplied(e){const t=this.loadApplied();t.delete(e),this.saveApplied(t)}isErrorApplied(e){return this.loadApplied().has(e)}loadApplied(){try{const e=localStorage.getItem(A);if(!e)return new Set;const t=JSON.parse(e);return new Set(Array.isArray(t)?t.filter(r=>typeof r=="number"):[])}catch{return new Set}}saveApplied(e){try{localStorage.setItem(A,JSON.stringify(Array.from(e).sort((t,r)=>t-r)))}catch{}}buildSystemPromptInjection(e=8e3){const t=this.getTopRules(50),r=this.getTopErrors(55),s=[];if(t.length>0){const i=t.slice(0,7).map((n,l)=>{const a=n.quote?`
   > « ${n.quote.slice(0,180)} »`:"";return`${l+1}. **${n.title.slice(0,120)}**${a}`});s.push(`## 📜 Top règles permanentes Kevin (${t.length} total)

${i.join(`
`)}`)}if(r.length>0){const i=r.slice(0,10).map(n=>{const l=n.applied?"✅":"⚠️",a=n.lesson?` — ${n.lesson.slice(0,200)}`:"";return`${l} #${n.num} ${n.title.slice(0,100)}${a}`});s.push(`## 🛡️ Top 10 erreurs documentées (sur ${r.length}) — JAMAIS REPRODUIRE

${i.join(`
`)}`)}s.push(`## 🎓 Méthode de travail (expert pro 200€/h)
1. Audit avant d'agir (matrice d'impact, lire fichiers en entier)
2. Multi-angles (réponse + alternatives + aller plus loin)
3. Tests + node --check + audit cross-feature AVANT push
4. Validation 100/100 réel par axe (sécu/perf/tests/archi/UX)
5. Anti-régression : run tests existants avant tout commit (Erreur #50)
6. SOURCE = BUILD : sync apex-ai/v13/dist/ → apex-ai-v13/ après chaque commit (Erreur #54)
7. CACHE_VERSION sw.js = APP_VER index.html toujours
8. JAMAIS demander à Kevin si Apex peut le faire seul (autonomie totale)`);let o=s.join(`

`);return o.length>e&&(o=o.slice(0,e-80)+`
[…tronqué pour limite]`),o}parseRules(e){const t=[],r=e.split(`
`);let s=null;const o=()=>{if(!s)return;const i=s.bodyLines.join(`
`).trim(),n=this.extractFirstQuote(i);t.push({id:`rule_${s.idx}_${this.slug(s.title)}`,title:s.title.slice(0,200),date:s.date,quote:n.slice(0,400),bodyExcerpt:i.slice(0,500),fullSection:i,index:s.idx,severity:s.severity})};for(let i=0;i<r.length;i++){const n=r[i]??"",l=n.match(f);if(l){if(o(),t.length>=L){s=null;break}const a=(l[1]??"").toUpperCase(),c=a==="CRITIQUE"||a==="SUPRÊME"||a==="MAÎTRESSE"?"critical":a==="ABSOLUE"?"high":"normal";s={idx:t.length,title:(l[2]??"").trim(),date:l[3]?l[3].trim():null,bodyLines:[],severity:c};continue}if(s&&/^##\s+/.test(n)&&!f.test(n)){o(),s=null;continue}s&&s.bodyLines.push(n)}return o(),t}parseErrors(e){const t=/##\s+Erreurs\s+connues\s+à\s+NE\s+PAS\s+reproduire/i,r=e.search(t);if(r<0)return[];const s=e.slice(r),o=s.search(/\n##\s+/),i=o>0?s.slice(0,o):s,n=this.loadApplied(),l=[],a=i.split(`
`);let c=null;const h=()=>{if(!c)return;const u=c.lessonLines.join(" ").replace(/\s+/g," ").trim();l.push({num:c.num,title:c.title.slice(0,200),lesson:u.slice(0,600),applied:n.has(c.num)})};for(const u of a){const p=u.match(S);if(p&&p[1]&&/^[1-9]\d{0,2}$/.test(p[1])){if(h(),l.length>=g){c=null;break}const R=parseInt(p[1],10),$=(p[2]??"").trim(),m=(p[3]??"").trim();c={num:R,title:$,lessonLines:m?[m]:[]}}else c&&u.trim()&&!u.startsWith("#")&&c.lessonLines.push(u.trim())}return h(),l}extractFirstQuote(e){const t=e.match(/^>\s+\*\*(.+?)\*\*/m)??e.match(/^>\s+(.+)$/m);return t?(t[1]??"").replace(/^["']+|["']+$/g,"").trim():""}slug(e){return e.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,30)}}const U=new y;export{U as rulesEngine};
