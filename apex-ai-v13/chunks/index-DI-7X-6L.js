import{c as E}from"./listener-cleanup-Y2rGGxxX.js";import{l}from"./monitoring-3uBGKGRH.js";import{s as q,r as H}from"../core/main-CkKqQ0fR.js";import{aiRouter as k}from"./ai-router-DtQ8M9mt.js";import{a as $,_ as j}from"./apex-kb-DENh8rzx.js";import{haptic as C}from"./haptic-CQFg2PXZ.js";import{modalSheet as x}from"./modal-sheet-oR7SW-wv.js";import{toast as y}from"./toast-ClsF1KRZ.js";import"./multi-source-analyze-LsVLr_Tt.js";import"./credential-patterns-qcw7Brjr.js";import"./chat-fallback-C6jX5dpq.js";import"./voice-7K-JzHKt.js";import"./tokens-dashboard-C5ZzZyK6.js";const T="apex_v13_agent_browser_history",N=20;class J{async analyze(e,t){const r=(e||"").trim(),a=(t||"").trim();if(!r)throw new Error("URL vide");if(!a)throw new Error("Objectif vide");if(!/^https?:\/\//i.test(r))throw new Error("URL doit commencer par http(s)://");const c=Date.now(),s=`agent_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;let n="",m=!1;try{const o=await fetch(r,{method:"GET",mode:"cors",credentials:"omit"});o.ok&&(n=await o.text(),m=!0)}catch(o){l.info("agent-browser","fetch CORS blocked, fallback skeleton",{err:o})}const h=this.extractRelevantDom(n).slice(0,3e4),d=`Tu es un agent pilote browser. L'utilisateur te donne une URL et un objectif.
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
${h||"(non récupéré, CORS)"}`}],d,o=>{o.text&&(u+=o.text)},o=>{l.warn("agent-browser","stream err",{err:o})})}catch(o){l.warn("agent-browser","stream throw",{err:o})}let p;try{const o=u.match(/\{[\s\S]*"actions"[\s\S]*\}/);if(!o)throw new Error("JSON manquant");const b=JSON.parse(o[0]);p={summary:typeof b.summary=="string"?b.summary.slice(0,500):"",actions:Array.isArray(b.actions)?b.actions.slice(0,10).map(L=>this.sanitizeAction(L)):[]}}catch(o){l.warn("agent-browser","parse failed, fallback",{err:o}),p=this.fallbackPlan(a)}const f={id:s,url:r,goal:a,summary:p.summary||`Plan pour atteindre : ${a}`,actions:p.actions,fetchedAt:Date.now(),durationMs:Date.now()-c,domSize:h.length,fetchOk:m};return this.persist(f),$.record("agent-browser.analyze",{details:{id:s,url:r,goal:a,actions:f.actions.length}}),l.info("agent-browser",`Analyzed ${r} (${f.actions.length} actions, ${f.durationMs}ms)`),f}history(){try{const e=localStorage.getItem(T);if(!e)return[];const t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}extractRelevantDom(e){return e?(e.replace(/<script[\s\S]*?<\/script>/gi,"").replace(/<style[\s\S]*?<\/style>/gi,"").replace(/<!--[\s\S]*?-->/g,"").match(/<(?:h[1-6]|button|a|form|input|label|select|textarea|nav|main|header)[^>]*>[^<]{0,200}/gi)??[]).join(`
`):""}sanitizeAction(e){const t=e??{},c={type:["click","fill","extract","navigate","wait","scroll"].includes(t.type)?t.type:"extract",selector:typeof t.selector=="string"?t.selector.slice(0,200):"",description:typeof t.description=="string"?t.description.slice(0,200):""};return typeof t.value=="string"&&(c.value=t.value.slice(0,500)),c}fallbackPlan(e){return{summary:`Plan fallback pour : ${e}`,actions:[{type:"wait",description:"Attendre chargement page"},{type:"scroll",description:"Scroller pour découvrir contenu"},{type:"extract",selector:"main",description:"Extraire contenu principal"}]}}persist(e){try{const t=this.history();t.unshift(e);const r=t.slice(0,N);localStorage.setItem(T,JSON.stringify(r))}catch(t){l.warn("agent-browser","persist failed",{err:t})}}}const F=new J,O="apex_v13_hyperframes_history",U=10,v=30;class G{async compose(e){const t=(e||"").trim();if(!t)throw new Error("Prompt vide");const r=Date.now(),a=`apex-comp-${Date.now()}_${Math.random().toString(36).slice(2,6)}`,c=`Tu es un compositeur d'animations HTML/CSS/JS multi-frames.
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
- Pas de \\n littéraux dans JSON (échappe correctement)`;let s="",n;try{await k.stream([{role:"user",content:`Compose une animation pour : ${t}`}],c,d=>{d.text&&(s+=d.text)},d=>{n=d})}catch(d){n=d instanceof Error?d:new Error(String(d))}if(n||!s)return l.warn("hyperframes","IA failed, fallback",{err:n?.message}),this.fallbackComposition(a,t,r);let m;try{const d=s.match(/\{[\s\S]*"frames"[\s\S]*"html"[\s\S]*\}/);if(!d)throw new Error("JSON manquant");const u=JSON.parse(d[0]),p=typeof u.frames=="number"?Math.max(3,Math.min(30,u.frames)):5,f=typeof u.duration=="number"?u.duration:p*(1e3/v),o=typeof u.html=="string"?u.html:"";if(!o)throw new Error("html vide");m={frames:p,duration:f,html:o}}catch(d){return l.warn("hyperframes","parse failed, fallback",{err:d}),this.fallbackComposition(a,t,r)}const h={id:a,prompt:t,html:this.sanitizeHtml(m.html),frames:m.frames,duration:m.duration,fps:v,generatedAt:Date.now(),durationMs:Date.now()-r};return this.persist(h),$.record("hyperframes.compose",{details:{id:a,frames:h.frames,durationMs:h.durationMs}}),l.info("hyperframes",`Composed ${h.frames} frames (${h.durationMs}ms)`),h}buildPreviewSrcdoc(e){return`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<style>body{margin:0;font-family:Georgia,serif;background:#0e0e1c;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh}</style>
</head>
<body>
${e.html}
</body>
</html>`}history(){try{const e=localStorage.getItem(O);if(!e)return[];const t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}sanitizeHtml(e){return e.replace(/<iframe[\s\S]*?<\/iframe>/gi,"").slice(0,5e4)}fallbackComposition(e,t,r){const c=`<div data-composition-id="${e}" style="position:relative;width:300px;height:200px;background:linear-gradient(135deg,#1a1a2e,#0e0e1c);border-radius:12px;overflow:hidden">
${Array.from({length:6},(s,n)=>`<div data-frame-${n} style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;font-family:Georgia,serif;color:#e8b830;font-size:18px">Frame ${n+1}</div>`).join(`
`)}
<script>
(function(){
  var id="${e}";var frames=6;var fps=${v};
  window.__timelines = window.__timelines || {};
  window.__timelines[id] = { fps: fps, frames: frames, duration: frames*(1000/fps) };
  var c=document.querySelector('[data-composition-id="'+id+'"]');
  if(!c)return;
  var i=0;
  var allFrames = c.querySelectorAll('[data-frame-' + 0 + '], [data-frame-' + 1 + '], [data-frame-' + 2 + '], [data-frame-' + 3 + '], [data-frame-' + 4 + '], [data-frame-' + 5 + ']');
  var arr=[];for(var k=0;k<frames;k++){var f=c.querySelector('[data-frame-'+k+']');if(f)arr.push(f);}
  if(arr.length===0)return;arr[0].style.display='flex';
  setInterval(function(){arr[i].style.display='none';i=(i+1)%arr.length;arr[i].style.display='flex';},1000/fps);
})();
<\/script>
</div>`;return{id:e,prompt:t,html:c,frames:6,duration:6*(1e3/v),fps:v,generatedAt:Date.now(),durationMs:Date.now()-r}}persist(e){try{const t=this.history();t.unshift(e);const r=t.slice(0,U);localStorage.setItem(O,JSON.stringify(r))}catch(t){l.warn("hyperframes","persist failed",{err:t})}}}const M=new G,_="apex_v13_impeccable_history",Y=30,A=["make-it-pop","add-personality","tighten-spacing","improve-typography","add-microcopy","simplify-layout","add-empty-state","improve-loading","add-feedback","improve-accessibility","polish-animations","add-easter-egg","improve-onboarding","simplify-cta","add-social-proof","improve-hierarchy","add-dark-mode","polish-icons","improve-mobile","add-keyboard-shortcuts","improve-error-states","add-empty-state-illustration","polish-form-validation"],D={"make-it-pop":"Augmente le contraste, ajoute accent doré subtil, hover micro-anim.","add-personality":"Touche unique (curseur custom, transition signature, easter egg discret).","tighten-spacing":"Resserre les espacements (réduit padding gratuit, aligne sur 8px grid).","improve-typography":"Hiérarchie typo claire (heading vs body vs caption), kerning, line-height optimaux.","add-microcopy":"Ajoute textes contextuels rassurants (helper text, tooltips, exemples).","simplify-layout":"Retire éléments redondants, regroupe logiquement, hiérarchise.","add-empty-state":"État vide explicite avec icône + texte + CTA action.","improve-loading":"Skeleton screens, progress indicators, optimistic UI.","add-feedback":"Toast confirmation, haptic, sound subtil, micro-animations success/error.","improve-accessibility":"aria-labels, focus visible, contrast WCAG AA, keyboard nav.","polish-animations":"cubic-bezier intentional, GPU-accelerated transform/opacity, prefer-reduced-motion.","add-easter-egg":"Konami code, long-press logo, secret hover discret.","improve-onboarding":"Tour guidé 3-5 cards, tooltips premier launch, valeur en 60s.","simplify-cta":"CTA unique principal, hiérarchie boutons (primary/secondary/ghost).","add-social-proof":"Logos clients, témoignages courts, compteurs vivants.","improve-hierarchy":"F-pattern, focus visuel clair, zones aérées, headings tailles cohérentes.","add-dark-mode":"Token CSS dual --ax-bg-light/--ax-bg-dark, toggle persistant.","polish-icons":"Iconset cohérent (1 famille), 24px standard, alignment optique.","improve-mobile":"Touch targets 44px+, safe-area-insets, no horizontal scroll.","add-keyboard-shortcuts":"Cmd+K palette, ?, Esc, Enter, navigation arrow keys.","improve-error-states":"Erreur claire + cause + action + lien aide. Pas de stack trace user.","add-empty-state-illustration":"SVG illustration légère 200×200 + texte motivant.","polish-form-validation":"Validation live, error inline rouge, success vert, helper text."};class B{async applyCommand(e,t){const r=(e||"").trim();if(!A.includes(r))throw new Error(`Commande inconnue. Valides : ${A.join(", ")}`);const a=(t||"").trim();if(!a)throw new Error("Design vide");const c=Date.now(),s=`imp_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,n=D[r],m=`Tu es un expert designer UI avec 10 ans d'expérience.
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
- Pas de réécriture from scratch — RÉVISION targeted.`;let h="";try{await k.stream([{role:"user",content:`Commande : ${r}

Design actuel :
${a}`}],m,p=>{p.text&&(h+=p.text)},p=>{l.warn("impeccable-design","stream err",{err:p})})}catch(p){l.warn("impeccable-design","stream throw",{err:p})}let d;try{const p=h.match(/\{[\s\S]*"revisedDesign"[\s\S]*\}/);if(!p)throw new Error("JSON manquant");const f=JSON.parse(p[0]);if(d={revisedDesign:typeof f.revisedDesign=="string"?f.revisedDesign:a,changes:Array.isArray(f.changes)?f.changes.slice(0,8).map(o=>this.sanitizeChange(o)):[]},!d.revisedDesign)throw new Error("revisedDesign vide")}catch(p){l.warn("impeccable-design","parse failed, fallback",{err:p}),d=this.fallbackResult(r,a)}const u={id:s,command:r,revisedDesign:d.revisedDesign,changes:d.changes,inputSize:a.length,outputSize:d.revisedDesign.length,generatedAt:Date.now(),durationMs:Date.now()-c};return this.persist(u),$.record("impeccable-design.apply",{details:{id:s,command:r,durationMs:u.durationMs}}),l.info("impeccable-design",`Applied ${r} (${u.changes.length} changes, ${u.durationMs}ms)`),u}listCommands(){return A.map(e=>({id:e,description:D[e]}))}history(){try{const e=localStorage.getItem(_);if(!e)return[];const t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}sanitizeChange(e){const t=e??{};return{type:typeof t.type=="string"?t.type.slice(0,100):"change",before:typeof t.before=="string"?t.before.slice(0,500):"",after:typeof t.after=="string"?t.after.slice(0,500):""}}fallbackResult(e,t){return{revisedDesign:t,changes:[{type:"fallback",before:"(non analysé)",after:`Commande "${e}" non appliquée — IA indisponible.`}]}}persist(e){try{const t=this.history();t.unshift(e);const r=t.slice(0,Y);localStorage.setItem(_,JSON.stringify(r))}catch(t){l.warn("impeccable-design","persist failed",{err:t})}}}const I=new B,P="apex_v13_ios_simulator_history",X=10,K={"iphone-15-pro":{w:393,h:852},"iphone-se":{w:375,h:667},"iphone-14":{w:390,h:844}};class V{previewURL(e,t={}){if(!e||!/^https?:\/\//i.test(e))throw new Error("URL invalide (doit être http(s))");return this.buildFrameHtml({url:e},t)}previewHTML(e,t={}){if(!e)throw new Error("HTML vide");return this.buildFrameHtml({srcdoc:e},t)}async openPreview(e,t={}){const r=this.previewHTML(e,t);try{const{modalSheet:a}=await j(async()=>{const{modalSheet:c}=await import("./modal-sheet-oR7SW-wv.js");return{modalSheet:c}},[],import.meta.url);a.open({title:"📱 iOS Simulator Preview",content:r,actions:[{label:"Fermer",variant:"ghost",onClick:()=>a.closeAll()}]}),this.persist({html:e.slice(0,500),at:Date.now()})}catch(a){throw l.warn("ios-simulator","modal not available",{err:a}),new Error("Modal-sheet indispo — preview en context console seulement")}}history(){try{const e=localStorage.getItem(P);if(!e)return[];const t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}buildFrameHtml(e,t){const r=t.model??"iphone-15-pro",a=K[r],c=t.scheme??"dark",s=m=>m.replace(/"/g,"&quot;").replace(/</g,"&lt;"),n=e.url?`src="${s(e.url)}"`:`srcdoc="${s(e.srcdoc??"")}"`;return`
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
</p>`}persist(e){try{const t=this.history();t.unshift(e);const r=t.slice(0,X);localStorage.setItem(P,JSON.stringify(r))}catch(t){l.warn("ios-simulator","persist failed",{err:t})}}}const W=new V,R="apex_v13_marketing_psy_history",Q=30,S={reciprocity:"Offre quelque chose en premier (gratuit, samples, trial) pour créer une dette psychologique.",scarcity:"Met en avant la rareté (édition limitée, deadline, stock limité) pour activer FOMO.",authority:"Cite expert / certification / chiffre vérifiable pour transférer la légitimité.",consistency:"Rappelle un engagement antérieur du user (sa valeur, son objectif) pour cohérence interne.",liking:"Crée connexion personnelle (humour, story authentique, similarité avec audience).","social-proof":"Témoignages clients / nombre d'utilisateurs / avis pour rassurer via le groupe.",unity:'Active identité partagée ("nous, les créateurs", "entre nous").'};class Z{async generate(e){const t=(e.product||"").trim(),r=(e.audience||"").trim();if(!t)throw new Error("Produit requis");if(!r)throw new Error("Audience requise");const a=e.trigger??"social-proof",c=e.format??"CTA landing",s=e.tone??"professionnel",n=Date.now(),m=`mkt_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,h=S[a],d=`Tu es un expert copywriter marketing avec 15 ans d'expérience.
Tu utilises les 7 principes d'influence de Cialdini de façon ÉTHIQUE (pas manipulation).

Pour chaque demande, tu génères :
1. Une copie concise et percutante (max 280 caractères pour tweet, max 80 pour CTA, etc.)
2. Le trigger psychologique exploité : ${a} (${h})
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
- Adapté au tone "${s}" et format "${c}"`;let u="";try{await k.stream([{role:"user",content:`Produit : ${t}
Audience : ${r}
Format : ${c}
Tone : ${s}
Trigger Cialdini : ${a}`}],d,o=>{o.text&&(u+=o.text)},o=>{l.warn("marketing-psy","stream err",{err:o})})}catch(o){l.warn("marketing-psy","stream throw",{err:o})}let p;try{const o=u.match(/\{[\s\S]*"copy"[\s\S]*\}/);if(!o)throw new Error("JSON manquant");const b=JSON.parse(o[0]);if(p={copy:typeof b.copy=="string"?b.copy.slice(0,1e3):"",rationale:typeof b.rationale=="string"?b.rationale.slice(0,500):""},!p.copy)throw new Error("copy vide")}catch(o){l.warn("marketing-psy","parse failed, fallback",{err:o}),p=this.fallbackCopy(t,a)}const f={id:m,copy:p.copy,trigger:a,rationale:p.rationale||h,product:t,audience:r,format:c,tone:s,generatedAt:Date.now(),durationMs:Date.now()-n};return this.persist(f),$.record("marketing-psy.generate",{details:{id:m,trigger:a,product:t.slice(0,50),durationMs:f.durationMs}}),l.info("marketing-psy",`Generated copy (${a}, ${f.durationMs}ms)`),f}history(){try{const e=localStorage.getItem(R);if(!e)return[];const t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}listTriggers(){return Object.keys(S).map(e=>({id:e,description:S[e]}))}fallbackCopy(e,t){return{copy:{reciprocity:`Essaie ${e} gratuitement — sans engagement.`,scarcity:`${e} : seulement 100 places cette semaine.`,authority:`${e}, recommandé par les experts du domaine.`,consistency:`Tu cherches X depuis longtemps ? ${e} est l'étape logique.`,liking:`On a créé ${e} pour les gens comme toi.`,"social-proof":`Rejoins 10 000+ utilisateurs satisfaits de ${e}.`,unity:`Entre nous, ${e} change vraiment la donne.`}[t],rationale:S[t]}}persist(e){try{const t=this.history();t.unshift(e);const r=t.slice(0,Q);localStorage.setItem(R,JSON.stringify(r))}catch(t){l.warn("marketing-psy","persist failed",{err:t})}}}const z=new Z;let w=null;function Se(){w?.cleanup(),w=null}function g(i){return i.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}const ee=[{id:"hyperframes",emoji:"🎞",name:"HyperFrames",description:"Compose une animation HTML/CSS/JS multi-frames depuis un prompt. Preview dans iframe sandbox.",buttonLabel:"Composer"},{id:"agent-browser",emoji:"🌐",name:"Agent Browser",description:"Analyse une URL + objectif, retourne actions structurées (click/fill/extract).",buttonLabel:"Analyser URL"},{id:"marketing-psy",emoji:"🧠",name:"Marketing Psy",description:"Génère copies marketing avec triggers Cialdini (scarcity/social-proof/authority/...).",buttonLabel:"Générer copy"},{id:"impeccable-design",emoji:"✨",name:"Impeccable Design",description:"23 commandes design fluency (make-it-pop / tighten-spacing / improve-typography / ...).",buttonLabel:"Polir un design"},{id:"ios-simulator",emoji:"📱",name:"iOS Simulator",description:"Preview HTML/URL dans frame iPhone 15 Pro simulé (visuel only, pas runtime iOS).",buttonLabel:"Lancer preview"}];function te(i){return`
    <article class="ax-shubham-card" data-skill-id="${g(i.id)}" style="background:linear-gradient(135deg,rgba(20,20,35,0.85),rgba(14,14,28,0.65));border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:10px;transition:transform 200ms cubic-bezier(0.16,1,0.3,1)">
      <header style="display:flex;align-items:center;gap:10px">
        <span style="font-size:28px" aria-hidden="true">${g(i.emoji)}</span>
        <h3 style="margin:0;font-size:16px;color:#fff;font-weight:700;letter-spacing:-0.015em">${g(i.name)}</h3>
      </header>
      <p style="margin:0;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">${g(i.description)}</p>
      <button class="ax-btn ax-bounce-tap" data-launch="${g(i.id)}" aria-label="Lancer ${g(i.name)}" style="margin-top:6px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;padding:11px 18px;border-radius:22px;font-weight:700;cursor:pointer;font-size:13px;min-height:44px;-webkit-tap-highlight-color:transparent;transition:all 180ms cubic-bezier(0.16,1,0.3,1)">
        ${g(i.buttonLabel)}
      </button>
    </article>
  `}function re(){return`
    <div class="ax-shubham-skills" style="padding:max(20px, env(safe-area-inset-top)) 16px max(20px, env(safe-area-inset-bottom)) 16px;max-width:1100px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif">
      <header style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.06)">
        <div>
          <h1 style="margin:0;font-size:clamp(22px,5.5vw,30px);font-weight:700;background:linear-gradient(135deg,#c9a227,#e8b830);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:Georgia,serif;letter-spacing:-0.025em;line-height:1.15">🎬 Shubham Skills (équivalents Apex)</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.55);font-size:12px">5 services TikTok IRL — natifs PWA, pas Claude Code</p>
        </div>
        <button class="ax-btn ax-bounce-tap" data-back-admin style="flex-shrink:0;padding:9px 16px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:24px;font-size:13px;font-weight:600;cursor:pointer;min-height:40px;white-space:nowrap" aria-label="Retour Admin">← Admin</button>
      </header>
      <div class="ax-shubham-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">
        ${ee.map(te).join("")}
      </div>
    </div>
  `}async function ae(){const i=window.prompt("Décris l'animation à composer :","Logo APEX qui pulse en doré sur fond noir");if(i){y.info("🎞 Composition en cours...");try{const e=await M.compose(i),r=M.buildPreviewSrcdoc(e).replace(/"/g,"&quot;").replace(/</g,"&lt;");x.open({title:`🎞 HyperFrames — ${e.frames} frames`,content:`
        <div style="font-family:system-ui;padding:14px 4px">
          <p style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:10px">
            ${e.frames} frames · ${Math.round(e.duration)}ms · généré en ${e.durationMs}ms
          </p>
          <iframe sandbox="allow-scripts" srcdoc="${r}" style="width:100%;height:300px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;background:#0e0e1c" aria-label="Aperçu animation"></iframe>
        </div>
      `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>x.closeAll()}]})}catch(e){l.warn("shubham-skills","hyperframes failed",{err:e}),y.error("Composition échouée")}}}async function ie(){const i=window.prompt("URL à analyser :","https://example.com");if(!i)return;const e=window.prompt("Objectif :","Trouver le formulaire de contact");if(e){y.info("🌐 Analyse en cours...");try{const t=await F.analyze(i,e),r=t.actions.map(a=>`
      <li style="background:rgba(255,255,255,0.03);padding:10px 12px;border-radius:10px;margin-bottom:6px">
        <strong style="color:#e8b830">[${g(a.type)}]</strong>
        ${a.selector?`<code style="background:rgba(0,0,0,0.4);padding:2px 6px;border-radius:4px;font-size:11px;margin-left:6px">${g(a.selector)}</code>`:""}
        ${a.value?`<span style="color:rgba(255,255,255,0.65);font-size:12px;margin-left:6px">→ ${g(a.value)}</span>`:""}
        <p style="color:rgba(255,255,255,0.55);font-size:12px;margin:4px 0 0">${g(a.description??"")}</p>
      </li>`).join("");x.open({title:`🌐 Agent Browser — ${t.actions.length} actions`,content:`
        <div style="font-family:system-ui;padding:14px 4px">
          <p style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:10px">
            ${t.fetchOk?"✅ DOM récupéré":"⚠️ CORS bloqué — fallback"} · ${t.domSize} chars · ${t.durationMs}ms
          </p>
          <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:8px 0 14px;font-style:italic">${g(t.summary)}</p>
          <ul style="list-style:none;padding:0;margin:0;max-height:50vh;overflow-y:auto">${r}</ul>
        </div>
      `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>x.closeAll()}]})}catch(t){l.warn("shubham-skills","agent-browser failed",{err:t}),y.error("Analyse échouée")}}}async function oe(){const i=window.prompt("Produit :","Apex AI");if(!i)return;const e=window.prompt("Audience :","Développeurs freelance");if(!e)return;const t=z.listTriggers(),r=t.map((n,m)=>`${m+1}. ${n.id}`).join(`
`),a=window.prompt(`Trigger Cialdini ? (1-${t.length})

${r}`,"6"),c=parseInt(a??"6",10)-1,s=t[c]?.id??"social-proof";y.info("🧠 Génération copy...");try{const n=await z.generate({product:i,audience:e,trigger:s});x.open({title:`🧠 Marketing Psy — ${n.trigger}`,content:`
        <div style="font-family:system-ui;padding:14px 4px">
          <p style="color:rgba(255,255,255,0.55);font-size:11px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.05em">Copy générée</p>
          <pre style="background:rgba(232,184,48,0.08);color:#fff;padding:14px;border-radius:10px;font-size:14px;white-space:pre-wrap;border-left:3px solid #e8b830">${g(n.copy)}</pre>
          <p style="color:rgba(255,255,255,0.55);font-size:11px;margin:14px 0 6px;text-transform:uppercase;letter-spacing:0.05em">Pourquoi ça marche</p>
          <p style="color:rgba(255,255,255,0.85);font-size:13px;line-height:1.5">${g(n.rationale)}</p>
        </div>
      `,actions:[{label:"Copier",variant:"primary",onClick:()=>{navigator.clipboard?.writeText(n.copy),y.success("Copy copiée")}},{label:"Fermer",variant:"ghost",onClick:()=>x.closeAll()}]})}catch(n){l.warn("shubham-skills","marketing-psy failed",{err:n}),y.error("Génération échouée")}}async function se(){const i=I.listCommands(),e=i.slice(0,23).map((s,n)=>`${n+1}. ${s.id}`).join(`
`),t=window.prompt(`Commande ? (1-23)

${e}`,"1"),r=parseInt(t??"1",10)-1,a=i[r]?.id??"make-it-pop",c=window.prompt("Design actuel (HTML/CSS) :","<button>CTA</button>");if(c){y.info("✨ Polissage en cours...");try{const s=await I.applyCommand(a,c),n=s.changes.map(m=>`
      <li style="background:rgba(255,255,255,0.03);padding:10px 12px;border-radius:10px;margin-bottom:6px;font-size:12px">
        <strong style="color:#e8b830">[${g(m.type)}]</strong>
        <p style="margin:4px 0 0;color:rgba(255,99,99,0.85)">avant : ${g(m.before)}</p>
        <p style="margin:2px 0 0;color:rgba(34,204,119,0.85)">après : ${g(m.after)}</p>
      </li>`).join("");x.open({title:`✨ Impeccable Design — ${s.command}`,content:`
        <div style="font-family:system-ui;padding:14px 4px">
          <p style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:10px">
            ${s.changes.length} changement(s) · ${s.durationMs}ms
          </p>
          <h3 style="font-size:13px;color:#e8b830;text-transform:uppercase;margin:0 0 8px">Design révisé</h3>
          <pre style="background:rgba(0,0,0,0.4);color:rgba(255,255,255,0.85);padding:12px;border-radius:10px;font-size:12px;white-space:pre-wrap;max-height:30vh;overflow-y:auto">${g(s.revisedDesign)}</pre>
          <h3 style="font-size:13px;color:#e8b830;text-transform:uppercase;margin:14px 0 8px">Changements</h3>
          <ul style="list-style:none;padding:0;margin:0;max-height:30vh;overflow-y:auto">${n}</ul>
        </div>
      `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>x.closeAll()}]})}catch(s){l.warn("shubham-skills","impeccable-design failed",{err:s}),y.error("Polissage échoué")}}}async function ne(){const i=window.prompt("HTML à preview iPhone :",'<h1 style="color:#c9a227;font-family:Georgia">Hello Apex</h1>');if(i)try{await W.openPreview(i)}catch(e){l.warn("shubham-skills","ios-simulator failed",{err:e}),y.error("Preview échouée")}}function ce(i){if(!w)return;i.querySelectorAll("[data-launch]").forEach(t=>{w.bind(t,"click",()=>{C.tap();const r=t.dataset.launch??"";switch(r){case"hyperframes":ae();break;case"agent-browser":ie();break;case"marketing-psy":oe();break;case"impeccable-design":se();break;case"ios-simulator":ne();break;default:y.warn(`Skill ${r} non implémenté`)}})});const e=i.querySelector("[data-back-admin]");e&&w.bind(e,"click",()=>{C.tap(),H.navigate("admin")})}function ke(i){if(w?.cleanup(),w=E("admin-shubham-skills"),!q.get("isAdmin")){i.innerHTML=`
      <div class="ax-empty" style="padding:40px 20px;text-align:center;color:rgba(255,255,255,0.6)">
        <h2>Accès réservé</h2>
        <p>Cette section est réservée à l'admin Kevin.</p>
      </div>
    `;return}i.innerHTML=re(),ce(i)}export{Se as dispose,ke as render};
