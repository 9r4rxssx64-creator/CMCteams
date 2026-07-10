import{b as v,e as o,l as y}from"./monitoring-BAwFG35Q.js";import{c as h}from"./listener-cleanup-Y2rGGxxX.js";import{p as c}from"./projects-CNU3hBzW.js";import{g as $}from"./apex-tools-dispatch-core-BMKsu6u4.js";import{toast as u}from"./toast-BCPNzfMv.js";import"./multi-source-analyze-DRqrcvIZ.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-CGmn9N6T.js";import"./apex-tools-dispatch-skills-CCrH3P4L.js";import"./apex-tools-dispatch-data-BVHgPXTg.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-C7bGgZFN.js";import"./apex-tools-misc-B-httart.js";import"./apex-tools-registry-core-48oOK-KS.js";import"./apex-tools-registry-skills-x-mAWYry.js";import"./haptic-CQFg2PXZ.js";let m=null,l=null,b=null;function R(){m?.cleanup(),m=null,l=null,b=null}function d(t){m?.cleanup(),m=h("projects");const p=v.get("user")?.id??"anon";if(!$("module.projects",t,p))return;const r=c.list(p),n=c.getActiveId(p),s=l?c.get(l,p):null,a=n?(()=>{const e=c.get(n,p);return e?`<div class="ax-gs-400" style="border:1px solid rgba(232,184,48,.5);border-radius:10px;padding:12px;margin-bottom:12px;background:rgba(232,184,48,.06)">
               <strong>Projet actif : ${o(e.emoji)} ${o(e.name)}</strong>
               <span style="color:var(--ax-text-dim);font-size:12px"> · ${e.knowledge.length} note${e.knowledge.length>1?"s":""}</span>
               <button class="ax-btn ax-btn-sm" data-action="deactivate" style="margin-left:10px">Désactiver</button>
             </div>`:""})():'<p style="color:var(--ax-text-dim);font-size:13px;margin-bottom:12px">Aucun projet actif — le chat répond sans cadre projet.</p>',i=r.length?r.map(e=>{const f=b===e.id?`<div style="margin-top:10px;border-top:1px solid #2a2a3a;padding-top:10px">
                 ${e.knowledge.map((g,j)=>`<div style="display:flex;gap:8px;align-items:start;margin-bottom:6px">
                       <div style="flex:1"><strong style="font-size:12px">${o(g.title)}</strong>
                         <div style="color:var(--ax-text-dim);font-size:12px;white-space:pre-wrap">${o(g.content.slice(0,160))}${g.content.length>160?"…":""}</div></div>
                       <button class="ax-btn ax-btn-sm" data-action="delnote" data-proj-id="${o(e.id)}" data-note-idx="${j}">🗑</button>
                     </div>`).join("")||'<p style="color:#888;font-size:12px">Aucune note.</p>'}
                 <form class="ax-proj-note-form" data-proj-id="${o(e.id)}" style="margin-top:8px">
                   <input type="text" class="ax-proj-note-title" placeholder="Titre de la note" maxlength="80" autocomplete="off" style="width:100%;padding:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;margin-bottom:6px">
                   <textarea class="ax-proj-note-content" placeholder="Contenu (colle un texte, des specs, un doc…)" rows="3" maxlength="20000" style="width:100%;padding:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;resize:vertical"></textarea>
                   <button type="submit" class="ax-btn ax-btn-sm ax-btn-primary" style="margin-top:6px">+ Ajouter la note</button>
                 </form>
               </div>`:"";return`
        <article class="ax-note-card ax-gs-400" style="${e.id===n?"border:1px solid rgba(232,184,48,.6)":""}">
          <header style="display:flex;justify-content:space-between;align-items:center;gap:8px">
            <h3 class="ax-gs-319" style="margin:0">${o(e.emoji)} ${o(e.name)}${e.id===n?' <span style="color:var(--ax-gold);font-size:12px">● actif</span>':""}</h3>
          </header>
          ${e.instructions?`<p style="margin:8px 0;color:var(--ax-text-dim);font-size:13px;white-space:pre-wrap">${o(e.instructions.slice(0,160))}${e.instructions.length>160?"…":""}</p>`:""}
          <footer style="display:flex;gap:8px;flex-wrap:wrap">
            ${e.id===n?"":`<button class="ax-btn ax-btn-sm ax-btn-primary" data-action="activate" data-proj-id="${o(e.id)}">Activer</button>`}
            <button class="ax-btn ax-btn-sm" data-action="notes" data-proj-id="${o(e.id)}">📚 Connaissances (${e.knowledge.length})</button>
            <button class="ax-btn ax-btn-sm" data-action="edit" data-proj-id="${o(e.id)}">Modifier</button>
            <button class="ax-btn ax-btn-sm" data-action="delete" data-proj-id="${o(e.id)}">Supprimer</button>
          </footer>
          ${f}
        </article>`}).join(""):'<p class="ax-gs-213">Aucun projet. Crée un espace de travail ci-dessous.</p>';t.innerHTML=`
    <div class="ax-page ax-gs-332">
      <header class="ax-gs-210">
        <h1 class="ax-gs-333">📁 Mes projets</h1>
        <span class="ax-gs-3">${r.length} projet${r.length>1?"s":""}</span>
      </header>
      <p style="color:var(--ax-text-dim);font-size:13px;margin:0 0 12px">
        Un projet regroupe des instructions + une base de connaissances (notes/fichiers).
        Le projet actif cadre toutes tes réponses dans le chat.
      </p>

      ${a}

      <form id="ax-proj-form" class="ax-form ax-gs-350">
        <div style="display:flex;gap:8px">
          <input type="text" id="ax-proj-emoji" placeholder="📁" aria-label="Emoji" maxlength="4" value="${s?o(s.emoji):""}" style="width:56px;text-align:center;padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px">
          <input type="text" id="ax-proj-name" placeholder="Nom du projet…" aria-label="Nom du projet" maxlength="60" autocomplete="off" required value="${s?o(s.name):""}" class="ax-gs-351" style="flex:1">
        </div>
        <textarea id="ax-proj-instr" placeholder="Instructions du projet (ton, objectif, contraintes)…" aria-label="Instructions du projet" rows="3" maxlength="8000" style="width:100%;padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;resize:vertical;margin-top:8px">${s?o(s.instructions):""}</textarea>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button type="submit" class="ax-btn ax-btn-primary ax-gs-401">${s?"💾 Enregistrer":"➕ Créer le projet"}</button>
          ${s?'<button type="button" class="ax-btn" data-action="cancel-edit">Annuler</button>':""}
        </div>
      </form>

      <div id="ax-proj-list" style="margin-top:14px">${i}</div>
      <p class="ax-gs-212"><a href="#chat" class="ax-gs-198">← Retour chat</a></p>
    </div>
  `,w(t,p)}function w(t,x){const p=t.querySelector("#ax-proj-form");p&&m.bind(p,"submit",r=>{r.preventDefault();const n=t.querySelector("#ax-proj-emoji")?.value??"",s=t.querySelector("#ax-proj-name")?.value??"",a=t.querySelector("#ax-proj-instr")?.value??"",i=c.save({...l?{id:l}:{},name:s,emoji:n,instructions:a},x);if(!i){u.warn("Nom requis");return}u.success(l?"Projet mis à jour":`Projet « ${i.name} » créé`),l=null,d(t)}),t.querySelectorAll(".ax-proj-note-form").forEach(r=>{m.bind(r,"submit",n=>{n.preventDefault();const s=r.dataset.projId,a=r.querySelector(".ax-proj-note-title")?.value??"",i=r.querySelector(".ax-proj-note-content")?.value??"";s&&c.addNote(s,{title:a,content:i},x)?(u.success("Note ajoutée à la base de connaissances"),d(t)):u.warn("Contenu de la note requis")})}),m.bind(t,"click",r=>{const n=r.target?.closest("[data-action]");if(!n)return;const s=n.dataset.action,a=n.dataset.projId;switch(s){case"activate":if(a){c.setActive(a,x);const i=c.get(a,x);u.success(`${i?.emoji??"📁"} ${i?.name??"Projet"} activé`),d(t)}break;case"deactivate":c.setActive(null,x),u.info("Projet désactivé"),d(t);break;case"notes":b=b===a?null:a??null,d(t);break;case"delnote":{const i=Number(n.dataset.noteIdx);a&&c.removeNote(a,i,x)&&(u.info("Note supprimée"),d(t));break}case"edit":a&&(l=a,d(t),t.querySelector("#ax-proj-name")?.focus());break;case"cancel-edit":l=null,d(t);break;case"delete":a&&c.remove(a,x)&&(u.info("Projet supprimé"),l===a&&(l=null),b===a&&(b=null),d(t));break}}),y.debug("projects","handlers attached")}export{R as dispose,o as escapeHtml,d as render};
