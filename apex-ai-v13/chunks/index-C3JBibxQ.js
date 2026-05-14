import{c as h}from"./listener-cleanup-Y2rGGxxX.js";import{l as u}from"./monitoring-3uBGKGRH.js";import{s as v}from"../core/main-p1itfJVP.js";import{g as w}from"./apex-tools-dispatch-DMwhu1L6.js";import"./apex-kb-Cox-KHDz.js";import"./credential-patterns-qcw7Brjr.js";import"./multi-source-analyze-BqJT8Pdb.js";import"./apex-tools-registry-n9yyuvE6.js";import"./voice-BQS1bn7V.js";let c=null;function R(){c?.cleanup(),c=null}const S="ax_notes_";function g(n){return`${S}${n}`}function l(n){return n.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}class ${load(e){if(!e)return[];try{const t=localStorage.getItem(g(e));if(!t)return[];const a=JSON.parse(t);return Array.isArray(a)?a.filter(this.isValidNote):[]}catch(t){return u.warn("notes","load failed",{err:t}),[]}}isValidNote(e){if(!e||typeof e!="object")return!1;const t=e;return typeof t.id=="string"&&typeof t.title=="string"&&typeof t.content=="string"&&Array.isArray(t.tags)&&typeof t.favorite=="boolean"&&typeof t.ts_created=="number"&&typeof t.ts_updated=="number"}save(e,t){if(!e)return!1;try{return localStorage.setItem(g(e),JSON.stringify(t)),!0}catch(a){return u.warn("notes","save failed (quota?)",{err:a}),!1}}add(e,t){if(!e||!t.title.trim())return null;const a=this.load(e),o={id:`note_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,title:t.title.trim().slice(0,200),content:t.content.slice(0,5e4),tags:(t.tags??[]).slice(0,10).map(r=>r.toLowerCase().trim()).filter(Boolean),favorite:!1,ts_created:Date.now(),ts_updated:Date.now()};return a.unshift(o),a.length>500&&(a.length=500),this.save(e,a)?o:null}update(e,t,a){if(!e)return!1;const o=this.load(e),r=o.findIndex(p=>p.id===t);if(r===-1)return!1;const s=o[r];if(!s)return!1;const i={...s,...a.title!==void 0&&{title:a.title.trim().slice(0,200)},...a.content!==void 0&&{content:a.content.slice(0,5e4)},...a.tags!==void 0&&{tags:a.tags.slice(0,10)},...a.favorite!==void 0&&{favorite:a.favorite},ts_updated:Date.now()};return o[r]=i,this.save(e,o)}remove(e,t){if(!e)return!1;const a=this.load(e).filter(o=>o.id!==t);return this.save(e,a)}search(e,t){if(!e||!t.trim())return this.load(e);const a=t.toLowerCase().trim();return this.load(e).filter(o=>o.title.toLowerCase().includes(a)||o.content.toLowerCase().includes(a)||o.tags.some(r=>r.includes(a)))}toggleFavorite(e,t){const o=this.load(e).find(r=>r.id===t);return o?this.update(e,t,{favorite:!o.favorite}):!1}exportJson(e){return JSON.stringify(this.load(e),null,2)}count(e){return this.load(e).length}}const d=new $;function f(n){c?.cleanup(),c=h("notes");const t=v.get("user")?.id??"anon";if(!w("module.notes",n,t))return;const a=d.load(t),o=a.length>0?a.map(r=>`
        <article class="ax-note-card" data-note-id="${l(r.id)}" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:10px">
          <header style="display:flex;justify-content:space-between;align-items:center">
            <h3 style="margin:0;color:#c9a227;font-size:15px">${l(r.title)}</h3>
            <span style="font-size:18px;cursor:pointer" data-action="favorite" data-note-id="${l(r.id)}" title="Favoris">${r.favorite?"⭐":"☆"}</span>
          </header>
          <p style="margin:8px 0;color:var(--ax-text-dim);font-size:13px;white-space:pre-wrap">${l(r.content.slice(0,240))}${r.content.length>240?"…":""}</p>
          <footer style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#888">
            <span>${new Date(r.ts_updated).toLocaleString("fr-FR")}</span>
            <button class="ax-btn ax-btn-sm" data-action="delete" data-note-id="${l(r.id)}" style="font-size:11px;padding:4px 8px;color:#ff6666">Supprimer</button>
          </footer>
        </article>
      `).join(""):'<p style="color:var(--ax-text-dim);text-align:center;padding:24px">Aucune note. Crée ta première !</p>';n.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:760px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;color:#c9a227">📝 Bloc-notes</h1>
        <span style="color:var(--ax-text-dim);font-size:13px">${a.length} note${a.length>1?"s":""}</span>
      </header>

      <form id="ax-notes-form" class="ax-form" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <label for="ax-notes-title" class="sr-only">Titre de la note</label>
        <input type="text" id="ax-notes-title" placeholder="Titre…" aria-label="Titre de la note" maxlength="200" autocomplete="off" required style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px">
        <label for="ax-notes-content" class="sr-only">Contenu de la note</label>
        <textarea id="ax-notes-content" placeholder="Contenu…" aria-label="Contenu de la note" rows="3" maxlength="50000" style="width:100%;padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;resize:vertical"></textarea>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
          <label for="ax-notes-tags" class="sr-only">Tags (séparés par des virgules)</label>
          <input type="text" id="ax-notes-tags" placeholder="tags séparés par des virgules" aria-label="Tags de la note séparés par des virgules" autocomplete="off" maxlength="100" style="flex:1;padding:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;margin-right:8px">
          <button type="submit" class="ax-btn ax-btn-primary" style="min-height:44px">Ajouter</button>
        </div>
      </form>

      <label for="ax-notes-search" class="sr-only">Rechercher une note</label>
      <input type="text" id="ax-notes-search" placeholder="🔍 Rechercher…" aria-label="Rechercher dans les notes" autocomplete="off" maxlength="100" style="width:100%;padding:10px;margin-bottom:16px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px">

      <div id="ax-notes-list">${o}</div>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `,q(n,t)}function q(n,e){const t=n.querySelector("#ax-notes-form");t&&c.bind(t,"submit",o=>{o.preventDefault();const r=n.querySelector("#ax-notes-title"),s=n.querySelector("#ax-notes-content"),i=n.querySelector("#ax-notes-tags"),p=r?.value.trim()??"",m=s?.value??"",b=(i?.value??"").split(",").map(y=>y.trim()).filter(Boolean);if(!p)return;const x=d.add(e,{title:p,content:m,tags:b});x&&(u.info("notes","created",{id:x.id}),r&&(r.value=""),s&&(s.value=""),i&&(i.value=""),f(n))});const a=n.querySelector("#ax-notes-search");a&&c.bind(a,"input",()=>{const o=a.value.trim(),r=o?d.search(e,o):d.load(e),s=n.querySelector("#ax-notes-list");s&&(s.innerHTML=r.length>0?r.map(i=>`
            <article class="ax-note-card" data-note-id="${l(i.id)}" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:10px">
              <h3 style="margin:0;color:#c9a227;font-size:15px">${l(i.title)}</h3>
              <p style="margin:8px 0;color:var(--ax-text-dim);font-size:13px">${l(i.content.slice(0,240))}</p>
            </article>
          `).join(""):'<p style="color:var(--ax-text-dim);text-align:center;padding:24px">Aucun résultat</p>')}),n.querySelectorAll('[data-action="delete"]').forEach(o=>{c.bind(o,"click",()=>{const r=o.dataset.noteId;r&&d.remove(e,r)&&f(n)})}),n.querySelectorAll('[data-action="favorite"]').forEach(o=>{c.bind(o,"click",()=>{const r=o.dataset.noteId;r&&d.toggleFavorite(e,r)&&f(n)})})}export{R as dispose,l as escapeHtml,d as notesStore,f as render};
