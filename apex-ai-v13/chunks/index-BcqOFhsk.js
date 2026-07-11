import{b,e as u,l as x}from"./monitoring-DfV1jLgN.js";import{c as h}from"./listener-cleanup-Y2rGGxxX.js";import{r as w,b as y}from"./artifacts-CJHZWb6g.js";import{g as k}from"./apex-tools-dispatch-core-CCSAPhDg.js";import{toast as m}from"./toast-BCPNzfMv.js";import"./multi-source-analyze-DUElMJpr.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-CQguQfqL.js";import"./apex-tools-dispatch-skills-DNDzhGnK.js";import"./apex-tools-dispatch-data-CIpgaTIM.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-CLNAjYXc.js";import"./apex-tools-misc-DyRhyXds.js";import"./apex-tools-registry-core-48oOK-KS.js";import"./apex-tools-registry-skills-x-mAWYry.js";import"./haptic-CQFg2PXZ.js";let i=null;function P(){i?.cleanup(),i=null}function G(t){i?.cleanup(),i=h("canvas");const v=b.get("user")?.id??"anon";if(!k("module.canvas",t,v))return;const e=w();if(!e){t.innerHTML=`
      <div class="ax-page ax-gs-332">
        <header class="ax-gs-210"><h1 class="ax-gs-333">🎨 Canvas</h1></header>
        <p class="ax-gs-213">Aucun artifact ouvert.</p>
        <p style="color:var(--ax-text-dim);font-size:13px">Dans le chat, quand Apex génère du code, du HTML ou un SVG, tape <code>/canvas</code> pour l'ouvrir ici (édition + aperçu live).</p>
        <p class="ax-gs-212"><a href="#chat" class="ax-gs-198">← Retour chat</a></p>
      </div>`;return}const f=e.previewable?'<button class="ax-btn ax-btn-sm" data-action="toggle-preview" id="ax-canvas-toggle">👁 Aperçu</button>':"";t.innerHTML=`
    <div class="ax-page ax-gs-332" style="max-width:960px">
      <header class="ax-gs-210" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <h1 class="ax-gs-333" style="margin:0">🎨 Canvas</h1>
        <span class="ax-gs-3">${u(e.lang)} · ${e.previewable?"aperçu live":"code"}</span>
        <span style="flex:1"></span>
        ${f}
        <button class="ax-btn ax-btn-sm" data-action="copy">📋 Copier</button>
        <button class="ax-btn ax-btn-sm" data-action="download">⬇️ Fichier</button>
      </header>

      <div id="ax-canvas-split" style="display:flex;flex-direction:column;gap:10px">
        <textarea id="ax-canvas-code" spellcheck="false" aria-label="Code de l'artifact"
          style="width:100%;min-height:220px;padding:12px;background:#0a0a14;border:1px solid #333;color:#e8e8f0;border-radius:8px;font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;resize:vertical;white-space:pre;overflow:auto">${u(e.code)}</textarea>
        ${e.previewable?`<iframe id="ax-canvas-preview" title="Aperçu de l'artifact" sandbox="allow-scripts"
          style="width:100%;min-height:300px;background:#fff;border:1px solid #333;border-radius:8px"></iframe>`:""}
      </div>

      <p class="ax-gs-212"><a href="#chat" class="ax-gs-198">← Retour chat</a></p>
    </div>
  `;const o=t.querySelector("#ax-canvas-code"),s=t.querySelector("#ax-canvas-preview"),c=()=>{if(!(!s||!o))try{s.srcdoc=y({...e,code:o.value})}catch(a){x.warn("canvas","preview refresh failed",{err:a})}};if(s&&c(),o){let a=null;i.bind(o,"input",()=>{a&&clearTimeout(a),a=setTimeout(c,400)})}i.bind(t,"click",a=>{const l=a.target?.closest("[data-action]");if(!l)return;const p=o?.value??e.code;switch(l.dataset.action){case"copy":navigator.clipboard?.writeText(p),m.success("📋 Code copié");break;case"download":{try{const r=e.kind==="svg"?"svg":e.kind==="html"?"html":e.lang||"txt",g=new Blob([p],{type:"text/plain"}),d=URL.createObjectURL(g),n=document.createElement("a");n.href=d,n.download=`apex-artifact-${Date.now()}.${r}`,n.click(),setTimeout(()=>URL.revokeObjectURL(d),1e3)}catch(r){x.warn("canvas","download failed",{err:r}),m.error("Téléchargement impossible — réessaie")}break}case"toggle-preview":if(s){const r=s.style.display==="none";s.style.display=r?"":"none",r&&c()}break}})}export{P as dispose,u as escapeHtml,G as render};
