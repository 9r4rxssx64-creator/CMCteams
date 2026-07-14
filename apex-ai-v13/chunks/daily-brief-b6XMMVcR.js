const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-DE8tOht_.js","./multi-source-analyze-y_3vQuz1.js","./credential-patterns-DUMYZEMu.js","./apex-kb-BHH7h7Vp.js","../assets/css/main-CL36MkOW.css"])))=>i.map(i=>d[i]);
import{_ as c}from"./monitoring-DE8tOht_.js";import"./multi-source-analyze-y_3vQuz1.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-BHH7h7Vp.js";const u="apex_v13_last_brief_day";function l(t){return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}function _(t=new Date){try{return localStorage.getItem(u)!==l(t)}catch{return!0}}function S(t=new Date){try{localStorage.setItem(u,l(t))}catch{}}const m="Tu génères un briefing du jour personnel, court et utile. Ton chaleureux et direct. Pas d'invention : n'utilise QUE les faits fournis. Si peu de contexte, propose 2-3 pistes générales utiles. Jamais de secret/clé.";function g(t,n=new Date){const r=n.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"}),a=t.slice(0,30),e=a.length?a.map(o=>`- [${o.category}] ${o.text}`).join(`
`):"(aucun fait mémorisé pour l'instant)";return`Nous sommes ${r}.

Contexte connu sur l'utilisateur :
${e}

Rédige un briefing du jour en français (Markdown), 5-8 lignes max :
1) une accroche personnalisée ;
2) 2-4 suggestions/rappels concrets et actionnables tirés du contexte ;
3) une question ouverte pour lancer la journée.
Sois concis, zéro remplissage.`}async function h(t,n=new Date){let r=[];try{r=t.getFacts()??[]}catch{r=[]}return(await t.ask(g(r,n),m)||"").trim()}async function x(){const[{memory:t},{aiRouter:n}]=await Promise.all([c(()=>import("./memory-CXGFh76z.js").then(e=>e.c),__vite__mapDeps([0,1,2,3]),import.meta.url),c(()=>import("./ai-router-J6N7fCoD.js").then(e=>e.d),__vite__mapDeps([0,1,2,3,4]),import.meta.url)]);return{getFacts:()=>{try{return t.getFacts().slice(-30).reverse().map(e=>({category:e.category,text:e.text}))}catch{return[]}},ask:async(e,o)=>{let i="";return await n.stream([{role:"user",content:e}],o,s=>{s.text&&(i+=s.text)}),i.trim()}}}export{g as buildBriefPrompt,l as dayKey,x as defaultDailyBriefDeps,h as generateDailyBrief,S as markShownToday,_ as shouldShowToday};
