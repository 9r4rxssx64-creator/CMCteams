import{l as p,b as y,e as l}from"./monitoring-CFQVdAR4.js";import{c as b}from"./listener-cleanup-Y2rGGxxX.js";import{g as S}from"./apex-tools-dispatch-core-BnxtNrUx.js";import"./multi-source-analyze-2o-Ko5KY.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-K0odi1bp.js";import"./apex-tools-dispatch-skills-DOPtOfGT.js";import"./apex-tools-dispatch-data-DY9E90_C.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-CEc642fA.js";import"./apex-tools-misc-Dx2zJq8a.js";import"./apex-tools-registry-core-B4u4pCoL.js";import"./apex-tools-registry-skills-x-mAWYry.js";let c=null;function H(){c?.cleanup(),c=null}const w="ax_notes_";function x(o){return`${w}${o}`}class ${load(e){if(!e)return[];try{const t=localStorage.getItem(x(e));if(!t)return[];const a=JSON.parse(t);return Array.isArray(a)?a.filter(this.isValidNote):[]}catch(t){return p.warn("notes","load failed",{err:t}),[]}}isValidNote(e){if(!e||typeof e!="object")return!1;const t=e;return typeof t.id=="string"&&typeof t.title=="string"&&typeof t.content=="string"&&Array.isArray(t.tags)&&typeof t.favorite=="boolean"&&typeof t.ts_created=="number"&&typeof t.ts_updated=="number"}save(e,t){if(!e)return!1;try{return localStorage.setItem(x(e),JSON.stringify(t)),!0}catch(a){return p.warn("notes","save failed (quota?)",{err:a}),!1}}add(e,t){if(!e||!t.title.trim())return null;const a=this.load(e),r={id:`note_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,title:t.title.trim().slice(0,200),content:t.content.slice(0,5e4),tags:(t.tags??[]).slice(0,10).map(s=>s.toLowerCase().trim()).filter(Boolean),favorite:!1,ts_created:Date.now(),ts_updated:Date.now()};return a.unshift(r),a.length>500&&(a.length=500),this.save(e,a)?r:null}update(e,t,a){if(!e)return!1;const r=this.load(e),s=r.findIndex(f=>f.id===t);if(s===-1)return!1;const n=r[s];if(!n)return!1;const i={...n,...a.title!==void 0&&{title:a.title.trim().slice(0,200)},...a.content!==void 0&&{content:a.content.slice(0,5e4)},...a.tags!==void 0&&{tags:a.tags.slice(0,10)},...a.favorite!==void 0&&{favorite:a.favorite},ts_updated:Date.now()};return r[s]=i,this.save(e,r)}remove(e,t){if(!e)return!1;const a=this.load(e).filter(r=>r.id!==t);return this.save(e,a)}search(e,t){if(!e||!t.trim())return this.load(e);const a=t.toLowerCase().trim();return this.load(e).filter(r=>r.title.toLowerCase().includes(a)||r.content.toLowerCase().includes(a)||r.tags.some(s=>s.includes(a)))}toggleFavorite(e,t){const r=this.load(e).find(s=>s.id===t);return r?this.update(e,t,{favorite:!r.favorite}):!1}exportJson(e){return JSON.stringify(this.load(e),null,2)}count(e){return this.load(e).length}}const d=new $;function u(o){c?.cleanup(),c=b("notes");const t=y.get("user")?.id??"anon";if(!S("module.notes",o,t))return;const a=d.load(t),r=a.length>0?a.map(s=>`
        <article class="ax-note-card ax-gs-400" data-note-id="${l(s.id)}">
          <header class="ax-gs-219">
            <h3 class="ax-gs-319">${l(s.title)}</h3>
            <span style="font-size:18px;cursor:pointer" data-action="favorite" data-note-id="${l(s.id)}" title="Favoris">${s.favorite?"⭐":"☆"}</span>
          </header>
          <p style="margin:8px 0;color:var(--ax-text-dim);font-size:13px;white-space:pre-wrap">${l(s.content.slice(0,240))}${s.content.length>240?"…":""}</p>
          <footer style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#888">
            <span>${new Date(s.ts_updated).toLocaleString("fr-FR")}</span>
            <button class="ax-btn ax-btn-sm ax-gs-349" data-action="delete" data-note-id="${l(s.id)}">Supprimer</button>
          </footer>
        </article>
      `).join(""):'<p class="ax-gs-213">Aucune note. Crée ta première !</p>';o.innerHTML=`
    <div class="ax-page ax-gs-332">
      <header class="ax-gs-210">
        <h1 class="ax-gs-333">📝 Bloc-notes</h1>
        <span class="ax-gs-3">${a.length} note${a.length>1?"s":""}</span>
      </header>

      <form id="ax-notes-form" class="ax-form ax-gs-350">
        <label for="ax-notes-title" class="sr-only">Titre de la note</label>
        <input type="text" id="ax-notes-title" placeholder="Titre…" aria-label="Titre de la note" maxlength="200" autocomplete="off" required class="ax-gs-351">
        <label for="ax-notes-content" class="sr-only">Contenu de la note</label>
        <textarea id="ax-notes-content" placeholder="Contenu…" aria-label="Contenu de la note" rows="3" maxlength="50000" style="width:100%;padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;resize:vertical"></textarea>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
          <label for="ax-notes-tags" class="sr-only">Tags (séparés par des virgules)</label>
          <input type="text" id="ax-notes-tags" placeholder="tags séparés par des virgules" aria-label="Tags de la note séparés par des virgules" autocomplete="off" maxlength="100" style="flex:1;padding:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;margin-right:8px">
          <button type="submit" class="ax-btn ax-btn-primary ax-gs-401">Ajouter</button>
        </div>
      </form>

      <label for="ax-notes-search" class="sr-only">Rechercher une note</label>
      <input type="text" id="ax-notes-search" placeholder="🔍 Rechercher…" aria-label="Rechercher dans les notes" autocomplete="off" maxlength="100" class="ax-gs-335">

      <div id="ax-notes-list">${r}</div>

      <p class="ax-gs-212"><a href="#chat" class="ax-gs-198">← Retour chat</a></p>
    </div>
  `,q(o,t)}function q(o,e){const t=o.querySelector("#ax-notes-form");t&&c.bind(t,"submit",r=>{r.preventDefault();const s=o.querySelector("#ax-notes-title"),n=o.querySelector("#ax-notes-content"),i=o.querySelector("#ax-notes-tags"),f=s?.value.trim()??"",m=n?.value??"",h=(i?.value??"").split(",").map(v=>v.trim()).filter(Boolean);if(!f)return;const g=d.add(e,{title:f,content:m,tags:h});g&&(p.info("notes","created",{id:g.id}),s&&(s.value=""),n&&(n.value=""),i&&(i.value=""),u(o))});const a=o.querySelector("#ax-notes-search");a&&c.bind(a,"input",()=>{const r=a.value.trim(),s=r?d.search(e,r):d.load(e),n=o.querySelector("#ax-notes-list");n&&(n.innerHTML=s.length>0?s.map(i=>`
            <article class="ax-note-card ax-gs-400" data-note-id="${l(i.id)}">
              <h3 class="ax-gs-319">${l(i.title)}</h3>
              <p style="margin:8px 0;color:var(--ax-text-dim);font-size:13px">${l(i.content.slice(0,240))}</p>
            </article>
          `).join(""):'<p class="ax-gs-213">Aucun résultat</p>')}),o.querySelectorAll('[data-action="delete"]').forEach(r=>{c.bind(r,"click",()=>{const s=r.dataset.noteId;s&&d.remove(e,s)&&u(o)})}),o.querySelectorAll('[data-action="favorite"]').forEach(r=>{c.bind(r,"click",()=>{const s=r.dataset.noteId;s&&d.toggleFavorite(e,s)&&u(o)})})}export{H as dispose,l as escapeHtml,d as notesStore,u as render};
