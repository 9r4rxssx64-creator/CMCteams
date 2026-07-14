import{b as y,e as i,l as g}from"./monitoring-DE8tOht_.js";import{c as $}from"./listener-cleanup-Y2rGGxxX.js";import{c,A as v}from"./custom-assistants-DvhoOfF0.js";import{g as h}from"./apex-tools-dispatch-core-D6rxfL3c.js";import{toast as x}from"./toast-BCPNzfMv.js";import"./multi-source-analyze-y_3vQuz1.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-BHH7h7Vp.js";import"./apex-tools-dispatch-skills-DZginb9y.js";import"./apex-tools-dispatch-data-mQRnG16N.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-7oRLqSu5.js";import"./apex-tools-misc-C0BUnpd1.js";import"./apex-tools-registry-core-48oOK-KS.js";import"./apex-tools-registry-skills-x-mAWYry.js";import"./haptic-CQFg2PXZ.js";let f=null,l=null;function F(){f?.cleanup(),f=null,l=null}function u(s){f?.cleanup(),f=$("assistants");const d=y.get("user")?.id??"anon";if(!h("module.assistants",s,d))return;const m=c.list(d),r=c.getActiveId(d),n=l?c.get(l,d):null,o=r?(()=>{const t=c.get(r,d);return t?`<div class="ax-gs-400" style="border:1px solid rgba(232,184,48,.5);border-radius:10px;padding:12px;margin-bottom:12px;background:rgba(232,184,48,.06)">
               <strong>Assistant actif : ${i(t.emoji)} ${i(t.name)}</strong>
               <button class="ax-btn ax-btn-sm" data-action="deactivate" style="margin-left:10px">Désactiver</button>
             </div>`:""})():'<p style="color:var(--ax-text-dim);font-size:13px;margin-bottom:12px">Aucun assistant actif — Apex répond avec son ton par défaut.</p>',e=v.map((t,b)=>`<button class="ax-btn ax-btn-sm" data-action="preset" data-preset-idx="${b}" title="${i(t.instructions.slice(0,80))}…">${i(t.emoji)} ${i(t.name)} +</button>`).join(" "),a=m.length?m.map(t=>`
        <article class="ax-note-card ax-gs-400" data-asst-id="${i(t.id)}" style="${t.id===r?"border:1px solid rgba(232,184,48,.6)":""}">
          <header style="display:flex;justify-content:space-between;align-items:center;gap:8px">
            <h3 class="ax-gs-319" style="margin:0">${i(t.emoji)} ${i(t.name)}${t.id===r?' <span style="color:var(--ax-gold);font-size:12px">● actif</span>':""}</h3>
          </header>
          <p style="margin:8px 0;color:var(--ax-text-dim);font-size:13px;white-space:pre-wrap">${i(t.instructions.slice(0,200))}${t.instructions.length>200?"…":""}</p>
          ${t.modelHint?`<p style="font-size:11px;color:#888;margin:0 0 8px">⚙️ ${i(t.modelHint)}</p>`:""}
          <footer style="display:flex;gap:8px;flex-wrap:wrap">
            ${t.id===r?"":`<button class="ax-btn ax-btn-sm ax-btn-primary" data-action="activate" data-asst-id="${i(t.id)}">Activer</button>`}
            <button class="ax-btn ax-btn-sm" data-action="edit" data-asst-id="${i(t.id)}">Modifier</button>
            <button class="ax-btn ax-btn-sm" data-action="delete" data-asst-id="${i(t.id)}">Supprimer</button>
          </footer>
        </article>`).join(""):'<p class="ax-gs-213">Aucun assistant. Crée-en un ou clique un preset ci-dessous.</p>';s.innerHTML=`
    <div class="ax-page ax-gs-332">
      <header class="ax-gs-210">
        <h1 class="ax-gs-333">🎭 Mes assistants</h1>
        <span class="ax-gs-3">${m.length} assistant${m.length>1?"s":""}</span>
      </header>
      <p style="color:var(--ax-text-dim);font-size:13px;margin:0 0 12px">
        Crée des assistants avec leurs propres instructions (persona, ton, expertise).
        L'assistant actif spécialise toutes tes réponses dans le chat.
      </p>

      ${o}

      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">${e}</div>

      <form id="ax-asst-form" class="ax-form ax-gs-350">
        <div style="display:flex;gap:8px">
          <label for="ax-asst-emoji" class="sr-only">Emoji</label>
          <input type="text" id="ax-asst-emoji" placeholder="🤖" aria-label="Emoji de l'assistant" maxlength="4" value="${n?i(n.emoji):""}" style="width:56px;text-align:center;padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px">
          <label for="ax-asst-name" class="sr-only">Nom</label>
          <input type="text" id="ax-asst-name" placeholder="Nom de l'assistant…" aria-label="Nom de l'assistant" maxlength="60" autocomplete="off" required value="${n?i(n.name):""}" class="ax-gs-351" style="flex:1">
        </div>
        <label for="ax-asst-instr" class="sr-only">Instructions</label>
        <textarea id="ax-asst-instr" placeholder="Instructions : qui est cet assistant, son ton, son expertise, ce qu'il doit toujours/jamais faire…" aria-label="Instructions de l'assistant" rows="5" maxlength="8000" style="width:100%;padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;resize:vertical;margin-top:8px">${n?i(n.instructions):""}</textarea>
        <label for="ax-asst-hint" class="sr-only">Modèle préféré (indicatif)</label>
        <input type="text" id="ax-asst-hint" placeholder="Modèle préféré (indicatif, optionnel)" aria-label="Modèle préféré indicatif" maxlength="60" autocomplete="off" value="${n?.modelHint?i(n.modelHint):""}" style="width:100%;padding:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;margin-top:8px">
        <div style="display:flex;gap:8px;margin-top:8px">
          <button type="submit" class="ax-btn ax-btn-primary ax-gs-401">${n?"💾 Enregistrer":"➕ Créer"}</button>
          ${n?'<button type="button" class="ax-btn" data-action="cancel-edit">Annuler</button>':""}
        </div>
      </form>

      <div id="ax-asst-list" style="margin-top:14px">${a}</div>

      <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
        <button class="ax-btn ax-btn-sm" data-action="export">⬇️ Exporter (JSON)</button>
        <button class="ax-btn ax-btn-sm" data-action="import">⬆️ Importer</button>
      </div>

      <p class="ax-gs-212"><a href="#chat" class="ax-gs-198">← Retour chat</a></p>
    </div>
  `,j(s,d)}function j(s,p){const d=s.querySelector("#ax-asst-form");d&&f.bind(d,"submit",m=>{m.preventDefault();const r=s.querySelector("#ax-asst-emoji")?.value??"",n=s.querySelector("#ax-asst-name")?.value??"",o=s.querySelector("#ax-asst-instr")?.value??"",e=(s.querySelector("#ax-asst-hint")?.value??"").trim(),a=c.save({...l?{id:l}:{},name:n,emoji:r,instructions:o,...e?{modelHint:e}:{}},p);if(!a){x.warn("Nom et instructions requis");return}g.info("assistants",l?"updated":"created",{id:a.id}),x.success(l?"Assistant mis à jour":`Assistant « ${a.name} » créé`),l=null,u(s)}),f.bind(s,"click",m=>{const r=m.target?.closest("[data-action]");if(!r)return;const n=r.dataset.action,o=r.dataset.asstId;switch(n){case"activate":if(o){c.setActive(o,p);const e=c.get(o,p);x.success(`${e?.emoji??"🎭"} ${e?.name??"Assistant"} activé`),u(s)}break;case"deactivate":c.setActive(null,p),x.info("Assistant désactivé — ton par défaut"),u(s);break;case"edit":o&&(l=o,u(s),s.querySelector("#ax-asst-name")?.focus());break;case"cancel-edit":l=null,u(s);break;case"delete":o&&c.remove(o,p)&&(x.info("Assistant supprimé"),l===o&&(l=null),u(s));break;case"preset":{const e=Number(r.dataset.presetIdx),a=v[e];a&&c.save({name:a.name,emoji:a.emoji,instructions:a.instructions,...a.modelHint?{modelHint:a.modelHint}:{}},p)&&(x.success(`${a.emoji} ${a.name} créé`),u(s));break}case"export":{try{const e=new Blob([c.exportJson(p)],{type:"application/json"}),a=URL.createObjectURL(e),t=document.createElement("a");t.href=a,t.download=`apex-assistants-${Date.now()}.json`,t.click(),setTimeout(()=>URL.revokeObjectURL(a),1e3)}catch(e){g.warn("assistants","export failed",{err:e}),x.error("Export impossible — réessaie")}break}case"import":{const e=document.createElement("input");e.type="file",e.accept="application/json,.json",e.onchange=()=>{const a=e.files?.[0];if(!a)return;const t=new FileReader;t.onload=()=>{const b=c.importJson(String(t.result??""),p);b>0?(x.success(`${b} assistant${b>1?"s":""} importé${b>1?"s":""}`),u(s)):x.warn("Fichier invalide ou vide")},t.readAsText(a)},e.click();break}}})}export{F as dispose,i as escapeHtml,u as render};
