import{l,a as $,_ as q,b as H,e as g}from"./monitoring-BfiYDXRZ.js";import{c as j}from"./listener-cleanup-Y2rGGxxX.js";import{r as z}from"../core/main-CYLeoN9g.js";import{aiRouter as k}from"./ai-router-v4vvAUZA.js";import{haptic as C}from"./haptic-CQFg2PXZ.js";import{modalSheet as v}from"./modal-sheet-oR7SW-wv.js";import{toast as y}from"./toast-BCPNzfMv.js";import"./multi-source-analyze-D8-rxT6b.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-DOqbRK5-.js";import"./economy-mode-n94CH290.js";import"./chat-fallback-DTHrrTrx.js";import"./apex-tools-dispatch-core-DcNSXnVh.js";import"./apex-tools-dispatch-skills-CHIdvIat.js";import"./apex-tools-dispatch-data-BFaYy0nq.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-BM1rHYsM.js";import"./apex-tools-misc-fJuxoKq6.js";import"./apex-tools-registry-core-BMhHY4vU.js";import"./apex-tools-registry-skills-x-mAWYry.js";const T="apex_v13_hyperframes_history",N=10,x=30;class J{async compose(t){const e=(t||"").trim();if(!e)throw new Error("Prompt vide");const r=Date.now(),a=`apex-comp-${Date.now()}_${Math.random().toString(36).slice(2,6)}`,c=`Tu es un compositeur d'animations HTML/CSS/JS multi-frames.
Pour chaque demande user, tu génères :
1. Un container <div data-composition-id="${a}"> avec frames data-frame-0, data-frame-1, ..., data-frame-N
2. Du CSS pour styliser chaque frame (background, color, font, layout)
3. Du JS qui populate window.__timelines avec :
   window.__timelines = window.__timelines || {};
   window.__timelines["${a}"] = { fps: 30, frames: N, duration: D };
   Et un setInterval qui affiche chaque frame séquentiellement.

Format de retour STRICT JSON :
{
  "frames": <int>,        // nombre de frames (3-30)
  "duration": <int>,      // durée totale en ms
  "html": "<div data-composition-id=...><style>...</style><script>...<\/script></div>"
}

Règles :
- Frames 3 à 30 max
- duration = frames * (1000/fps) approximativement
- HTML autonome (CSS et JS embedded inline)
- Anti-slop : pas Inter/Roboto, utilise Georgia/serif ou system-ui
- Couleurs cohérentes (palette douce, pas Bootstrap)
- Pas de \\n littéraux dans JSON (échappe correctement)`;let o="",n;try{await k.stream([{role:"user",content:`Compose une animation pour : ${e}`}],c,d=>{d.text&&(o+=d.text)},d=>{n=d})}catch(d){n=d instanceof Error?d:new Error(String(d))}if(n||!o)return l.warn("hyperframes","IA failed, fallback",{err:n?.message}),this.fallbackComposition(a,e,r);let m;try{const d=o.match(/\{[\s\S]*"frames"[\s\S]*"html"[\s\S]*\}/);if(!d)throw new Error("JSON manquant");const u=JSON.parse(d[0]),p=typeof u.frames=="number"?Math.max(3,Math.min(30,u.frames)):5,h=typeof u.duration=="number"?u.duration:p*(1e3/x),s=typeof u.html=="string"?u.html:"";if(!s)throw new Error("html vide");m={frames:p,duration:h,html:s}}catch(d){return l.warn("hyperframes","parse failed, fallback",{err:d}),this.fallbackComposition(a,e,r)}const f={id:a,prompt:e,html:this.sanitizeHtml(m.html),frames:m.frames,duration:m.duration,fps:x,generatedAt:Date.now(),durationMs:Date.now()-r};return this.persist(f),$.record("hyperframes.compose",{details:{id:a,frames:f.frames,durationMs:f.durationMs}}),l.info("hyperframes",`Composed ${f.frames} frames (${f.durationMs}ms)`),f}buildPreviewSrcdoc(t){return`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<style>body{margin:0;font-family:Georgia,serif;background:#0e0e1c;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh}</style>
</head>
<body>
${t.html}
</body>
</html>`}history(){try{const t=localStorage.getItem(T);if(!t)return[];const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch{return[]}}sanitizeHtml(t){return t.replace(/<iframe[\s\S]*?<\/iframe>/gi,"").slice(0,5e4)}fallbackComposition(t,e,r){const c=`<div data-composition-id="${t}" style="position:relative;width:300px;height:200px;background:linear-gradient(135deg,#1a1a2e,#0e0e1c);border-radius:12px;overflow:hidden">
${Array.from({length:6},(o,n)=>`<div data-frame-${n} style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;font-family:Georgia,serif;color:#e8b830;font-size:18px">Frame ${n+1}</div>`).join(`
`)}
<script>
(function(){
  var id="${t}";var frames=6;var fps=${x};
  window.__timelines = window.__timelines || {};
  /* v13.4.246 — anti timer zombie : clear le timer d'un rendu précédent du même id. */
  var prev = window.__timelines[id];
  if(prev && prev.timer){ try{ clearInterval(prev.timer); }catch(e){} }
  var meta = { fps: fps, frames: frames, duration: frames*(1000/fps) };
  window.__timelines[id] = meta;
  var c=document.querySelector('[data-composition-id="'+id+'"]');
  if(!c)return;
  var i=0;
  var arr=[];for(var k=0;k<frames;k++){var f=c.querySelector('[data-frame-'+k+']');if(f)arr.push(f);}
  if(arr.length===0)return;arr[0].style.display='flex';
  meta.timer=setInterval(function(){arr[i].style.display='none';i=(i+1)%arr.length;arr[i].style.display='flex';},1000/fps);
})();
<\/script>
</div>`;return{id:t,prompt:e,html:c,frames:6,duration:6*(1e3/x),fps:x,generatedAt:Date.now(),durationMs:Date.now()-r}}persist(t){try{const e=this.history();e.unshift(t);const r=e.slice(0,N);localStorage.setItem(T,JSON.stringify(r))}catch(e){l.warn("hyperframes","persist failed",{err:e})}}}const O=new J,_="apex_v13_impeccable_history",F=30,A=["make-it-pop","add-personality","tighten-spacing","improve-typography","add-microcopy","simplify-layout","add-empty-state","improve-loading","add-feedback","improve-accessibility","polish-animations","add-easter-egg","improve-onboarding","simplify-cta","add-social-proof","improve-hierarchy","add-dark-mode","polish-icons","improve-mobile","add-keyboard-shortcuts","improve-error-states","add-empty-state-illustration","polish-form-validation"],M={"make-it-pop":"Augmente le contraste, ajoute accent doré subtil, hover micro-anim.","add-personality":"Touche unique (curseur custom, transition signature, easter egg discret).","tighten-spacing":"Resserre les espacements (réduit padding gratuit, aligne sur 8px grid).","improve-typography":"Hiérarchie typo claire (heading vs body vs caption), kerning, line-height optimaux.","add-microcopy":"Ajoute textes contextuels rassurants (helper text, tooltips, exemples).","simplify-layout":"Retire éléments redondants, regroupe logiquement, hiérarchise.","add-empty-state":"État vide explicite avec icône + texte + CTA action.","improve-loading":"Skeleton screens, progress indicators, optimistic UI.","add-feedback":"Toast confirmation, haptic, sound subtil, micro-animations success/error.","improve-accessibility":"aria-labels, focus visible, contrast WCAG AA, keyboard nav.","polish-animations":"cubic-bezier intentional, GPU-accelerated transform/opacity, prefer-reduced-motion.","add-easter-egg":"Konami code, long-press logo, secret hover discret.","improve-onboarding":"Tour guidé 3-5 cards, tooltips premier launch, valeur en 60s.","simplify-cta":"CTA unique principal, hiérarchie boutons (primary/secondary/ghost).","add-social-proof":"Logos clients, témoignages courts, compteurs vivants.","improve-hierarchy":"F-pattern, focus visuel clair, zones aérées, headings tailles cohérentes.","add-dark-mode":"Token CSS dual --ax-bg-light/--ax-bg-dark, toggle persistant.","polish-icons":"Iconset cohérent (1 famille), 24px standard, alignment optique.","improve-mobile":"Touch targets 44px+, safe-area-insets, no horizontal scroll.","add-keyboard-shortcuts":"Cmd+K palette, ?, Esc, Enter, navigation arrow keys.","improve-error-states":"Erreur claire + cause + action + lien aide. Pas de stack trace user.","add-empty-state-illustration":"SVG illustration légère 200×200 + texte motivant.","polish-form-validation":"Validation live, error inline rouge, success vert, helper text."};class U{async applyCommand(t,e){const r=(t||"").trim();if(!A.includes(r))throw new Error(`Commande inconnue. Valides : ${A.join(", ")}`);const a=(e||"").trim();if(!a)throw new Error("Design vide");const c=Date.now(),o=`imp_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,n=M[r],m=`Tu es un expert designer UI avec 10 ans d'expérience.
Tu reçois un design existant (HTML/CSS/JSX) et tu dois appliquer la commande "${r}".

Description de la commande : ${n}

Format de retour STRICT JSON :
{
  "revisedDesign": "le design révisé complet",
  "changes": [
    { "type": "spacing|color|typography|...", "before": "valeur avant", "after": "valeur après" },
    ...
  ]
}

Règles :
- Anti-slop : pas Inter/Roboto/Bootstrap colors. Privilégie Georgia/serif, palette douce, animations cubic-bezier(0.16,1,0.3,1).
- Conserve la structure HTML existante (modifie juste ce qui est demandé).
- 3 à 8 changes décrits.
- Pas de réécriture from scratch — RÉVISION targeted.`;let f="";try{await k.stream([{role:"user",content:`Commande : ${r}

Design actuel :
${a}`}],m,p=>{p.text&&(f+=p.text)},p=>{l.warn("impeccable-design","stream err",{err:p})})}catch(p){l.warn("impeccable-design","stream throw",{err:p})}let d;try{const p=f.match(/\{[\s\S]*"revisedDesign"[\s\S]*\}/);if(!p)throw new Error("JSON manquant");const h=JSON.parse(p[0]);if(d={revisedDesign:typeof h.revisedDesign=="string"?h.revisedDesign:a,changes:Array.isArray(h.changes)?h.changes.slice(0,8).map(s=>this.sanitizeChange(s)):[]},!d.revisedDesign)throw new Error("revisedDesign vide")}catch(p){l.warn("impeccable-design","parse failed, fallback",{err:p}),d=this.fallbackResult(r,a)}const u={id:o,command:r,revisedDesign:d.revisedDesign,changes:d.changes,inputSize:a.length,outputSize:d.revisedDesign.length,generatedAt:Date.now(),durationMs:Date.now()-c};return this.persist(u),$.record("impeccable-design.apply",{details:{id:o,command:r,durationMs:u.durationMs}}),l.info("impeccable-design",`Applied ${r} (${u.changes.length} changes, ${u.durationMs}ms)`),u}listCommands(){return A.map(t=>({id:t,description:M[t]}))}history(){try{const t=localStorage.getItem(_);if(!t)return[];const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch{return[]}}sanitizeChange(t){const e=t??{};return{type:typeof e.type=="string"?e.type.slice(0,100):"change",before:typeof e.before=="string"?e.before.slice(0,500):"",after:typeof e.after=="string"?e.after.slice(0,500):""}}fallbackResult(t,e){return{revisedDesign:e,changes:[{type:"fallback",before:"(non analysé)",after:`Commande "${t}" non appliquée — IA indisponible.`}]}}persist(t){try{const e=this.history();e.unshift(t);const r=e.slice(0,F);localStorage.setItem(_,JSON.stringify(r))}catch(e){l.warn("impeccable-design","persist failed",{err:e})}}}const D=new U,I="apex_v13_agent_browser_history",G=20;class Y{async analyze(t,e){const r=(t||"").trim(),a=(e||"").trim();if(!r)throw new Error("URL vide");if(!a)throw new Error("Objectif vide");if(!/^https?:\/\//i.test(r))throw new Error("URL doit commencer par http(s)://");const c=Date.now(),o=`agent_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;let n="",m=!1;try{const s=await fetch(r,{method:"GET",mode:"cors",credentials:"omit"});s.ok&&(n=await s.text(),m=!0)}catch(s){l.info("agent-browser","fetch CORS blocked, fallback skeleton",{err:s})}const f=this.extractRelevantDom(n).slice(0,3e4),d=`Tu es un agent pilote browser. L'utilisateur te donne une URL et un objectif.
Tu analyses le DOM extrait et tu retournes une liste d'actions structurées au format JSON STRICT :
{
  "summary": "résumé 1-2 phrases de la stratégie",
  "actions": [
    { "type": "click|fill|extract|navigate|wait|scroll", "selector": "CSS selector", "value": "valeur si fill", "description": "ce que ça fait" },
    ...
  ]
}

Règles :
- 3 à 10 actions max
- selectors CSS standard (préfère [aria-label], [data-testid], #id, .class)
- type "fill" doit avoir "value"
- type "extract" doit avoir "selector" (ce qu'on extrait)
- description courte humaine`;let u="";try{await k.stream([{role:"user",content:`URL : ${r}
Objectif : ${a}

DOM extrait :
${f||"(non récupéré, CORS)"}`}],d,s=>{s.text&&(u+=s.text)},s=>{l.warn("agent-browser","stream err",{err:s})})}catch(s){l.warn("agent-browser","stream throw",{err:s})}let p;try{const s=u.match(/\{[\s\S]*"actions"[\s\S]*\}/);if(!s)throw new Error("JSON manquant");const b=JSON.parse(s[0]);p={summary:typeof b.summary=="string"?b.summary.slice(0,500):"",actions:Array.isArray(b.actions)?b.actions.slice(0,10).map(E=>this.sanitizeAction(E)):[]}}catch(s){l.warn("agent-browser","parse failed, fallback",{err:s}),p=this.fallbackPlan(a)}const h={id:o,url:r,goal:a,summary:p.summary||`Plan pour atteindre : ${a}`,actions:p.actions,fetchedAt:Date.now(),durationMs:Date.now()-c,domSize:f.length,fetchOk:m};return this.persist(h),$.record("agent-browser.analyze",{details:{id:o,url:r,goal:a,actions:h.actions.length}}),l.info("agent-browser",`Analyzed ${r} (${h.actions.length} actions, ${h.durationMs}ms)`),h}history(){try{const t=localStorage.getItem(I);if(!t)return[];const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch{return[]}}extractRelevantDom(t){return t?(t.replace(/<script[\s\S]*?<\/script>/gi,"").replace(/<style[\s\S]*?<\/style>/gi,"").replace(/<!--[\s\S]*?-->/g,"").match(/<(?:h[1-6]|button|a|form|input|label|select|textarea|nav|main|header)[^>]*>[^<]{0,200}/gi)??[]).join(`
`):""}sanitizeAction(t){const e=t??{},c={type:["click","fill","extract","navigate","wait","scroll"].includes(e.type)?e.type:"extract",selector:typeof e.selector=="string"?e.selector.slice(0,200):"",description:typeof e.description=="string"?e.description.slice(0,200):""};return typeof e.value=="string"&&(c.value=e.value.slice(0,500)),c}fallbackPlan(t){return{summary:`Plan fallback pour : ${t}`,actions:[{type:"wait",description:"Attendre chargement page"},{type:"scroll",description:"Scroller pour découvrir contenu"},{type:"extract",selector:"main",description:"Extraire contenu principal"}]}}persist(t){try{const e=this.history();e.unshift(t);const r=e.slice(0,G);localStorage.setItem(I,JSON.stringify(r))}catch(e){l.warn("agent-browser","persist failed",{err:e})}}}const B=new Y,P="apex_v13_ios_simulator_history",X=10,K={"iphone-15-pro":{w:393,h:852},"iphone-se":{w:375,h:667},"iphone-14":{w:390,h:844}};class V{previewURL(t,e={}){if(!t||!/^https?:\/\//i.test(t))throw new Error("URL invalide (doit être http(s))");return this.buildFrameHtml({url:t},e)}previewHTML(t,e={}){if(!t)throw new Error("HTML vide");return this.buildFrameHtml({srcdoc:t},e)}async openPreview(t,e={}){const r=this.previewHTML(t,e);try{const{modalSheet:a}=await q(async()=>{const{modalSheet:c}=await import("./modal-sheet-oR7SW-wv.js");return{modalSheet:c}},[],import.meta.url);a.open({title:"📱 iOS Simulator Preview",content:r,actions:[{label:"Fermer",variant:"ghost",onClick:()=>a.closeAll()}]}),this.persist({html:t.slice(0,500),at:Date.now()})}catch(a){throw l.warn("ios-simulator","modal not available",{err:a}),new Error("Modal-sheet indispo — preview en context console seulement")}}history(){try{const t=localStorage.getItem(P);if(!t)return[];const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch{return[]}}buildFrameHtml(t,e){const r=e.model??"iphone-15-pro",a=K[r],c=e.scheme??"dark",o=m=>m.replace(/"/g,"&quot;").replace(/</g,"&lt;"),n=t.url?`src="${o(t.url)}"`:`srcdoc="${o(t.srcdoc??"")}"`;return`
<div class="ax-ios-sim" style="display:flex;justify-content:center;align-items:center;padding:20px;background:linear-gradient(135deg,#1a1a2e,#0e0e1c)">
  <div style="position:relative;width:${a.w+16}px;height:${a.h+60}px;background:#0a0a0a;border-radius:48px;padding:8px;box-shadow:0 30px 60px rgba(0,0,0,0.6),inset 0 1px 2px rgba(255,255,255,0.1);border:2px solid #2a2a2a">
    <div style="position:absolute;top:14px;left:50%;transform:translateX(-50%);width:120px;height:30px;background:#000;border-radius:20px;z-index:10" aria-hidden="true"></div>
    <div style="position:relative;width:${a.w}px;height:${a.h}px;background:${c==="dark"?"#000":"#fff"};border-radius:42px;overflow:hidden;margin:30px 0">
      <div style="position:absolute;top:0;left:0;right:0;height:env(safe-area-inset-top,44px);min-height:44px;background:${c==="dark"?"rgba(0,0,0,0.95)":"rgba(255,255,255,0.95)"};display:flex;align-items:center;justify-content:space-between;padding:0 24px;z-index:5;font-family:-apple-system,BlinkMacSystemFont,system-ui;font-size:14px;font-weight:600;color:${c==="dark"?"#fff":"#000"}">
        <span>9:41</span>
        <span aria-hidden="true">📶 📡 🔋</span>
      </div>
      <iframe ${n} sandbox="allow-scripts allow-forms allow-same-origin"
        style="width:100%;height:100%;border:0;display:block;background:${c==="dark"?"#000":"#fff"}"
        title="iOS Simulator preview"></iframe>
      <div style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:134px;height:5px;background:${c==="dark"?"rgba(255,255,255,0.6)":"rgba(0,0,0,0.6)"};border-radius:3px;z-index:5" aria-hidden="true"></div>
    </div>
  </div>
</div>
<p style="text-align:center;color:rgba(255,255,255,0.55);font-size:12px;margin-top:14px;font-family:system-ui">
  Simulateur visuel iPhone ${r.replace("iphone-","").toUpperCase()} (${a.w}×${a.h}). Pas un vrai runtime iOS.
</p>`}persist(t){try{const e=this.history();e.unshift(t);const r=e.slice(0,X);localStorage.setItem(P,JSON.stringify(r))}catch(e){l.warn("ios-simulator","persist failed",{err:e})}}}const W=new V,R="apex_v13_marketing_psy_history",Q=30,S={reciprocity:"Offre quelque chose en premier (gratuit, samples, trial) pour créer une dette psychologique.",scarcity:"Met en avant la rareté (édition limitée, deadline, stock limité) pour activer FOMO.",authority:"Cite expert / certification / chiffre vérifiable pour transférer la légitimité.",consistency:"Rappelle un engagement antérieur du user (sa valeur, son objectif) pour cohérence interne.",liking:"Crée connexion personnelle (humour, story authentique, similarité avec audience).","social-proof":"Témoignages clients / nombre d'utilisateurs / avis pour rassurer via le groupe.",unity:'Active identité partagée ("nous, les créateurs", "entre nous").'};class Z{async generate(t){const e=(t.product||"").trim(),r=(t.audience||"").trim();if(!e)throw new Error("Produit requis");if(!r)throw new Error("Audience requise");const a=t.trigger??"social-proof",c=t.format??"CTA landing",o=t.tone??"professionnel",n=Date.now(),m=`mkt_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,f=S[a],d=`Tu es un expert copywriter marketing avec 15 ans d'expérience.
Tu utilises les 7 principes d'influence de Cialdini de façon ÉTHIQUE (pas manipulation).

Pour chaque demande, tu génères :
1. Une copie concise et percutante (max 280 caractères pour tweet, max 80 pour CTA, etc.)
2. Le trigger psychologique exploité : ${a} (${f})
3. Une rationale courte (2 phrases) expliquant pourquoi ça marche

Format de retour STRICT JSON :
{
  "copy": "le texte marketing",
  "trigger": "${a}",
  "rationale": "explication courte"
}

Règles :
- Pas de superlatifs gratuits ("révolutionnaire", "incroyable")
- Pas de promesses non-tenables
- Privilégie un call-to-action clair
- Adapté au tone "${o}" et format "${c}"`;let u="";try{await k.stream([{role:"user",content:`Produit : ${e}
Audience : ${r}
Format : ${c}
Tone : ${o}
Trigger Cialdini : ${a}`}],d,s=>{s.text&&(u+=s.text)},s=>{l.warn("marketing-psy","stream err",{err:s})})}catch(s){l.warn("marketing-psy","stream throw",{err:s})}let p;try{const s=u.match(/\{[\s\S]*"copy"[\s\S]*\}/);if(!s)throw new Error("JSON manquant");const b=JSON.parse(s[0]);if(p={copy:typeof b.copy=="string"?b.copy.slice(0,1e3):"",rationale:typeof b.rationale=="string"?b.rationale.slice(0,500):""},!p.copy)throw new Error("copy vide")}catch(s){l.warn("marketing-psy","parse failed, fallback",{err:s}),p=this.fallbackCopy(e,a)}const h={id:m,copy:p.copy,trigger:a,rationale:p.rationale||f,product:e,audience:r,format:c,tone:o,generatedAt:Date.now(),durationMs:Date.now()-n};return this.persist(h),$.record("marketing-psy.generate",{details:{id:m,trigger:a,product:e.slice(0,50),durationMs:h.durationMs}}),l.info("marketing-psy",`Generated copy (${a}, ${h.durationMs}ms)`),h}history(){try{const t=localStorage.getItem(R);if(!t)return[];const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch{return[]}}listTriggers(){return Object.keys(S).map(t=>({id:t,description:S[t]}))}fallbackCopy(t,e){return{copy:{reciprocity:`Essaie ${t} gratuitement — sans engagement.`,scarcity:`${t} : seulement 100 places cette semaine.`,authority:`${t}, recommandé par les experts du domaine.`,consistency:`Tu cherches X depuis longtemps ? ${t} est l'étape logique.`,liking:`On a créé ${t} pour les gens comme toi.`,"social-proof":`Rejoins 10 000+ utilisateurs satisfaits de ${t}.`,unity:`Entre nous, ${t} change vraiment la donne.`}[e],rationale:S[e]}}persist(t){try{const e=this.history();e.unshift(t);const r=e.slice(0,Q);localStorage.setItem(R,JSON.stringify(r))}catch(e){l.warn("marketing-psy","persist failed",{err:e})}}}const L=new Z;let w=null;function _e(){w?.cleanup(),w=null}const ee=[{id:"hyperframes",emoji:"🎞",name:"HyperFrames",description:"Compose une animation HTML/CSS/JS multi-frames depuis un prompt. Preview dans iframe sandbox.",buttonLabel:"Composer"},{id:"agent-browser",emoji:"🌐",name:"Agent Browser",description:"Analyse une URL + objectif, retourne actions structurées (click/fill/extract).",buttonLabel:"Analyser URL"},{id:"marketing-psy",emoji:"🧠",name:"Marketing Psy",description:"Génère copies marketing avec triggers Cialdini (scarcity/social-proof/authority/...).",buttonLabel:"Générer copy"},{id:"impeccable-design",emoji:"✨",name:"Impeccable Design",description:"23 commandes design fluency (make-it-pop / tighten-spacing / improve-typography / ...).",buttonLabel:"Polir un design"},{id:"ios-simulator",emoji:"📱",name:"iOS Simulator",description:"Preview HTML/URL dans frame iPhone 15 Pro simulé (visuel only, pas runtime iOS).",buttonLabel:"Lancer preview"}];function te(i){return`
    <article class="ax-shubham-card ax-gs-295" data-skill-id="${g(i.id)}">
      <header style="display:flex;align-items:center;gap:10px">
        <span class="ax-gs-201" aria-hidden="true">${g(i.emoji)}</span>
        <h3 class="ax-gs-296">${g(i.name)}</h3>
      </header>
      <p class="ax-gs-297">${g(i.description)}</p>
      <button class="ax-btn ax-bounce-tap ax-gs-298" data-launch="${g(i.id)}" aria-label="Lancer ${g(i.name)}">
        ${g(i.buttonLabel)}
      </button>
    </article>
  `}function re(){return`
    <div class="ax-shubham-skills ax-gs-299">
      <header class="ax-gs-202">
        <div>
          <h1 class="ax-gs-300">🎬 Shubham Skills (équivalents Apex)</h1>
          <p class="ax-gs-301">5 services TikTok IRL — natifs PWA, pas Claude Code</p>
        </div>
        <button class="ax-btn ax-bounce-tap ax-gs-302" data-back-admin aria-label="Retour Admin">← Admin</button>
      </header>
      <div class="ax-shubham-grid ax-gs-203">
        ${ee.map(te).join("")}
      </div>
    </div>
  `}async function ae(){const i=window.prompt("Décris l'animation à composer :","Logo APEX qui pulse en doré sur fond noir");if(i){y.info("🎞 Composition en cours...");try{const t=await O.compose(i),r=O.buildPreviewSrcdoc(t).replace(/"/g,"&quot;").replace(/</g,"&lt;");v.open({title:`🎞 HyperFrames — ${t.frames} frames`,content:`
        <div class="ax-gs-12">
          <p class="ax-gs-303">
            ${t.frames} frames · ${Math.round(t.duration)}ms · généré en ${t.durationMs}ms
          </p>
          <iframe sandbox="allow-scripts" srcdoc="${r}" style="width:100%;height:300px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;background:#0e0e1c" aria-label="Aperçu animation"></iframe>
        </div>
      `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>v.closeAll()}]})}catch(t){l.warn("shubham-skills","hyperframes failed",{err:t}),y.error("Composition échouée")}}}async function ie(){const i=window.prompt("URL à analyser :","https://example.com");if(!i)return;const t=window.prompt("Objectif :","Trouver le formulaire de contact");if(t){y.info("🌐 Analyse en cours...");try{const e=await B.analyze(i,t),r=e.actions.map(a=>`
      <li class="ax-gs-304">
        <strong class="ax-gs-305">[${g(a.type)}]</strong>
        ${a.selector?`<code style="background:rgba(0,0,0,0.4);padding:2px 6px;border-radius:4px;font-size:11px;margin-left:6px">${g(a.selector)}</code>`:""}
        ${a.value?`<span style="color:rgba(255,255,255,0.65);font-size:12px;margin-left:6px">→ ${g(a.value)}</span>`:""}
        <p class="ax-gs-306">${g(a.description??"")}</p>
      </li>`).join("");v.open({title:`🌐 Agent Browser — ${e.actions.length} actions`,content:`
        <div class="ax-gs-12">
          <p class="ax-gs-303">
            ${e.fetchOk?"✅ DOM récupéré":"⚠️ CORS bloqué — fallback"} · ${e.domSize} chars · ${e.durationMs}ms
          </p>
          <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:8px 0 14px;font-style:italic">${g(e.summary)}</p>
          <ul class="ax-gs-307">${r}</ul>
        </div>
      `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>v.closeAll()}]})}catch(e){l.warn("shubham-skills","agent-browser failed",{err:e}),y.error("Analyse échouée")}}}async function se(){const i=window.prompt("Produit :","Apex AI");if(!i)return;const t=window.prompt("Audience :","Développeurs freelance");if(!t)return;const e=L.listTriggers(),r=e.map((n,m)=>`${m+1}. ${n.id}`).join(`
`),a=window.prompt(`Trigger Cialdini ? (1-${e.length})

${r}`,"6"),c=parseInt(a??"6",10)-1,o=e[c]?.id??"social-proof";y.info("🧠 Génération copy...");try{const n=await L.generate({product:i,audience:t,trigger:o});v.open({title:`🧠 Marketing Psy — ${n.trigger}`,content:`
        <div class="ax-gs-12">
          <p style="color:rgba(255,255,255,0.55);font-size:11px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.05em">Copy générée</p>
          <pre style="background:rgba(232,184,48,0.08);color:#fff;padding:14px;border-radius:10px;font-size:14px;white-space:pre-wrap;border-left:3px solid #e8b830">${g(n.copy)}</pre>
          <p style="color:rgba(255,255,255,0.55);font-size:11px;margin:14px 0 6px;text-transform:uppercase;letter-spacing:0.05em">Pourquoi ça marche</p>
          <p style="color:rgba(255,255,255,0.85);font-size:13px;line-height:1.5">${g(n.rationale)}</p>
        </div>
      `,actions:[{label:"Copier",variant:"primary",onClick:()=>{navigator.clipboard?.writeText(n.copy),y.success("Copy copiée")}},{label:"Fermer",variant:"ghost",onClick:()=>v.closeAll()}]})}catch(n){l.warn("shubham-skills","marketing-psy failed",{err:n}),y.error("Génération échouée")}}async function oe(){const i=D.listCommands(),t=i.slice(0,23).map((o,n)=>`${n+1}. ${o.id}`).join(`
`),e=window.prompt(`Commande ? (1-23)

${t}`,"1"),r=parseInt(e??"1",10)-1,a=i[r]?.id??"make-it-pop",c=window.prompt("Design actuel (HTML/CSS) :","<button>CTA</button>");if(c){y.info("✨ Polissage en cours...");try{const o=await D.applyCommand(a,c),n=o.changes.map(m=>`
      <li style="background:rgba(255,255,255,0.03);padding:10px 12px;border-radius:10px;margin-bottom:6px;font-size:12px">
        <strong class="ax-gs-305">[${g(m.type)}]</strong>
        <p style="margin:4px 0 0;color:rgba(255,99,99,0.85)">avant : ${g(m.before)}</p>
        <p style="margin:2px 0 0;color:rgba(34,204,119,0.85)">après : ${g(m.after)}</p>
      </li>`).join("");v.open({title:`✨ Impeccable Design — ${o.command}`,content:`
        <div class="ax-gs-12">
          <p class="ax-gs-303">
            ${o.changes.length} changement(s) · ${o.durationMs}ms
          </p>
          <h3 class="ax-gs-308">Design révisé</h3>
          <pre class="ax-gs-309">${g(o.revisedDesign)}</pre>
          <h3 style="font-size:13px;color:#e8b830;text-transform:uppercase;margin:14px 0 8px">Changements</h3>
          <ul style="list-style:none;padding:0;margin:0;max-height:30vh;overflow-y:auto">${n}</ul>
        </div>
      `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>v.closeAll()}]})}catch(o){l.warn("shubham-skills","impeccable-design failed",{err:o}),y.error("Polissage échoué")}}}async function ne(){const i=window.prompt("HTML à preview iPhone :",'<h1 style="color:#c9a227;font-family:Georgia">Hello Apex</h1>');if(i)try{await W.openPreview(i)}catch(t){l.warn("shubham-skills","ios-simulator failed",{err:t}),y.error("Preview échouée")}}function ce(i){if(!w)return;i.querySelectorAll("[data-launch]").forEach(e=>{w.bind(e,"click",()=>{C.tap();const r=e.dataset.launch??"";switch(r){case"hyperframes":ae();break;case"agent-browser":ie();break;case"marketing-psy":se();break;case"impeccable-design":oe();break;case"ios-simulator":ne();break;default:y.warn(`Skill ${r} non implémenté`)}})});const t=i.querySelector("[data-back-admin]");t&&w.bind(t,"click",()=>{C.tap(),z.navigate("admin")})}function Me(i){if(w?.cleanup(),w=j("admin-shubham-skills"),!H.get("isAdmin")){i.innerHTML=`
      <div class="ax-empty ax-gs-188">
        <h2>Accès réservé</h2>
        <p>Cette section est réservée à l'admin Kevin.</p>
      </div>
    `;return}i.innerHTML=re(),ce(i)}export{_e as dispose,Me as render};
