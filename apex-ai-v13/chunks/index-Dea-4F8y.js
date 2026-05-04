import{l as f,s as h}from"../core/main-BSLFHN2z.js";const b="ax_notes_";function x(n){return`${b}${n}`}function l(n){return n.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]??t)}class v{load(t){if(!t)return[];try{const e=localStorage.getItem(x(t));if(!e)return[];const r=JSON.parse(e);return Array.isArray(r)?r.filter(this.isValidNote):[]}catch(e){return f.warn("notes","load failed",{err:e}),[]}}isValidNote(t){if(!t||typeof t!="object")return!1;const e=t;return typeof e.id=="string"&&typeof e.title=="string"&&typeof e.content=="string"&&Array.isArray(e.tags)&&typeof e.favorite=="boolean"&&typeof e.ts_created=="number"&&typeof e.ts_updated=="number"}save(t,e){if(!t)return!1;try{return localStorage.setItem(x(t),JSON.stringify(e)),!0}catch(r){return f.warn("notes","save failed (quota?)",{err:r}),!1}}add(t,e){if(!t||!e.title.trim())return null;const r=this.load(t),o={id:`note_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,title:e.title.trim().slice(0,200),content:e.content.slice(0,5e4),tags:(e.tags??[]).slice(0,10).map(a=>a.toLowerCase().trim()).filter(Boolean),favorite:!1,ts_created:Date.now(),ts_updated:Date.now()};return r.unshift(o),r.length>500&&(r.length=500),this.save(t,r)?o:null}update(t,e,r){if(!t)return!1;const o=this.load(t),a=o.findIndex(c=>c.id===e);if(a===-1)return!1;const s=o[a];if(!s)return!1;const i={...s,...r.title!==void 0&&{title:r.title.trim().slice(0,200)},...r.content!==void 0&&{content:r.content.slice(0,5e4)},...r.tags!==void 0&&{tags:r.tags.slice(0,10)},...r.favorite!==void 0&&{favorite:r.favorite},ts_updated:Date.now()};return o[a]=i,this.save(t,o)}remove(t,e){if(!t)return!1;const r=this.load(t).filter(o=>o.id!==e);return this.save(t,r)}search(t,e){if(!t||!e.trim())return this.load(t);const r=e.toLowerCase().trim();return this.load(t).filter(o=>o.title.toLowerCase().includes(r)||o.content.toLowerCase().includes(r)||o.tags.some(a=>a.includes(r)))}toggleFavorite(t,e){const o=this.load(t).find(a=>a.id===e);return o?this.update(t,e,{favorite:!o.favorite}):!1}exportJson(t){return JSON.stringify(this.load(t),null,2)}count(t){return this.load(t).length}}const d=new v;function p(n){const e=h.get("user")?.id??"anon",r=d.load(e),o=r.length>0?r.map(a=>`
        <article class="ax-note-card" data-note-id="${l(a.id)}" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:10px">
          <header style="display:flex;justify-content:space-between;align-items:center">
            <h3 style="margin:0;color:#c9a227;font-size:15px">${l(a.title)}</h3>
            <span style="font-size:18px;cursor:pointer" data-action="favorite" data-note-id="${l(a.id)}" title="Favoris">${a.favorite?"⭐":"☆"}</span>
          </header>
          <p style="margin:8px 0;color:var(--ax-text-dim);font-size:13px;white-space:pre-wrap">${l(a.content.slice(0,240))}${a.content.length>240?"…":""}</p>
          <footer style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#888">
            <span>${new Date(a.ts_updated).toLocaleString("fr-FR")}</span>
            <button class="ax-btn ax-btn-sm" data-action="delete" data-note-id="${l(a.id)}" style="font-size:11px;padding:4px 8px;color:#ff6666">Supprimer</button>
          </footer>
        </article>
      `).join(""):'<p style="color:var(--ax-text-dim);text-align:center;padding:24px">Aucune note. Crée ta première !</p>';n.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:760px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;color:#c9a227">📝 Bloc-notes</h1>
        <span style="color:var(--ax-text-dim);font-size:13px">${r.length} note${r.length>1?"s":""}</span>
      </header>

      <form id="ax-notes-form" class="ax-form" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <input type="text" id="ax-notes-title" placeholder="Titre…" maxlength="200" autocomplete="off" required style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px">
        <textarea id="ax-notes-content" placeholder="Contenu…" rows="3" maxlength="50000" style="width:100%;padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;resize:vertical"></textarea>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
          <input type="text" id="ax-notes-tags" placeholder="tags séparés par des virgules" autocomplete="off" maxlength="100" style="flex:1;padding:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;margin-right:8px">
          <button type="submit" class="ax-btn ax-btn-primary" style="min-height:40px">Ajouter</button>
        </div>
      </form>

      <input type="text" id="ax-notes-search" placeholder="🔍 Rechercher…" autocomplete="off" maxlength="100" style="width:100%;padding:10px;margin-bottom:16px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px">

      <div id="ax-notes-list">${o}</div>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `,w(n,e)}function w(n,t){const e=n.querySelector("#ax-notes-form");e&&e.addEventListener("submit",o=>{o.preventDefault();const a=n.querySelector("#ax-notes-title"),s=n.querySelector("#ax-notes-content"),i=n.querySelector("#ax-notes-tags"),c=a?.value.trim()??"",g=s?.value??"",m=(i?.value??"").split(",").map(y=>y.trim()).filter(Boolean);if(!c)return;const u=d.add(t,{title:c,content:g,tags:m});u&&(f.info("notes","created",{id:u.id}),a&&(a.value=""),s&&(s.value=""),i&&(i.value=""),p(n))});const r=n.querySelector("#ax-notes-search");r&&r.addEventListener("input",()=>{const o=r.value.trim(),a=o?d.search(t,o):d.load(t),s=n.querySelector("#ax-notes-list");s&&(s.innerHTML=a.length>0?a.map(i=>`
            <article class="ax-note-card" data-note-id="${l(i.id)}" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:10px">
              <h3 style="margin:0;color:#c9a227;font-size:15px">${l(i.title)}</h3>
              <p style="margin:8px 0;color:var(--ax-text-dim);font-size:13px">${l(i.content.slice(0,240))}</p>
            </article>
          `).join(""):'<p style="color:var(--ax-text-dim);text-align:center;padding:24px">Aucun résultat</p>')}),n.querySelectorAll('[data-action="delete"]').forEach(o=>{o.addEventListener("click",()=>{const a=o.dataset.noteId;a&&d.remove(t,a)&&p(n)})}),n.querySelectorAll('[data-action="favorite"]').forEach(o=>{o.addEventListener("click",()=>{const a=o.dataset.noteId;a&&d.toggleFavorite(t,a)&&p(n)})})}export{l as escapeHtml,d as notesStore,p as render};
//# sourceMappingURL=index-Dea-4F8y.js.map
