import{l as u}from"./monitoring-B17vNBOa.js";import{c as b}from"./listener-cleanup-Y2rGGxxX.js";import{s as v}from"../core/main-L_zGa0Dv.js";import"./apex-kb-DQZu_EOX.js";import"./apex-tools-registry-DloDnFZi.js";import"./credential-patterns-DqicUg9o.js";import"./apex-tools-dispatch-DEwjWW42.js";let c=null;function L(){c?.cleanup(),c=null}const w="ax_notes_";function g(n){return`${w}${n}`}function l(n){return n.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]??t)}class S{load(t){if(!t)return[];try{const e=localStorage.getItem(g(t));if(!e)return[];const r=JSON.parse(e);return Array.isArray(r)?r.filter(this.isValidNote):[]}catch(e){return u.warn("notes","load failed",{err:e}),[]}}isValidNote(t){if(!t||typeof t!="object")return!1;const e=t;return typeof e.id=="string"&&typeof e.title=="string"&&typeof e.content=="string"&&Array.isArray(e.tags)&&typeof e.favorite=="boolean"&&typeof e.ts_created=="number"&&typeof e.ts_updated=="number"}save(t,e){if(!t)return!1;try{return localStorage.setItem(g(t),JSON.stringify(e)),!0}catch(r){return u.warn("notes","save failed (quota?)",{err:r}),!1}}add(t,e){if(!t||!e.title.trim())return null;const r=this.load(t),a={id:`note_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,title:e.title.trim().slice(0,200),content:e.content.slice(0,5e4),tags:(e.tags??[]).slice(0,10).map(o=>o.toLowerCase().trim()).filter(Boolean),favorite:!1,ts_created:Date.now(),ts_updated:Date.now()};return r.unshift(a),r.length>500&&(r.length=500),this.save(t,r)?a:null}update(t,e,r){if(!t)return!1;const a=this.load(t),o=a.findIndex(p=>p.id===e);if(o===-1)return!1;const i=a[o];if(!i)return!1;const s={...i,...r.title!==void 0&&{title:r.title.trim().slice(0,200)},...r.content!==void 0&&{content:r.content.slice(0,5e4)},...r.tags!==void 0&&{tags:r.tags.slice(0,10)},...r.favorite!==void 0&&{favorite:r.favorite},ts_updated:Date.now()};return a[o]=s,this.save(t,a)}remove(t,e){if(!t)return!1;const r=this.load(t).filter(a=>a.id!==e);return this.save(t,r)}search(t,e){if(!t||!e.trim())return this.load(t);const r=e.toLowerCase().trim();return this.load(t).filter(a=>a.title.toLowerCase().includes(r)||a.content.toLowerCase().includes(r)||a.tags.some(o=>o.includes(r)))}toggleFavorite(t,e){const a=this.load(t).find(o=>o.id===e);return a?this.update(t,e,{favorite:!a.favorite}):!1}exportJson(t){return JSON.stringify(this.load(t),null,2)}count(t){return this.load(t).length}}const d=new S;function f(n){c?.cleanup(),c=b("notes");const e=v.get("user")?.id??"anon",r=d.load(e),a=r.length>0?r.map(o=>`
        <article class="ax-note-card" data-note-id="${l(o.id)}" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:10px">
          <header style="display:flex;justify-content:space-between;align-items:center">
            <h3 style="margin:0;color:#c9a227;font-size:15px">${l(o.title)}</h3>
            <span style="font-size:18px;cursor:pointer" data-action="favorite" data-note-id="${l(o.id)}" title="Favoris">${o.favorite?"⭐":"☆"}</span>
          </header>
          <p style="margin:8px 0;color:var(--ax-text-dim);font-size:13px;white-space:pre-wrap">${l(o.content.slice(0,240))}${o.content.length>240?"…":""}</p>
          <footer style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#888">
            <span>${new Date(o.ts_updated).toLocaleString("fr-FR")}</span>
            <button class="ax-btn ax-btn-sm" data-action="delete" data-note-id="${l(o.id)}" style="font-size:11px;padding:4px 8px;color:#ff6666">Supprimer</button>
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

      <div id="ax-notes-list">${a}</div>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `,$(n,e)}function $(n,t){const e=n.querySelector("#ax-notes-form");e&&c.bind(e,"submit",a=>{a.preventDefault();const o=n.querySelector("#ax-notes-title"),i=n.querySelector("#ax-notes-content"),s=n.querySelector("#ax-notes-tags"),p=o?.value.trim()??"",m=i?.value??"",y=(s?.value??"").split(",").map(h=>h.trim()).filter(Boolean);if(!p)return;const x=d.add(t,{title:p,content:m,tags:y});x&&(u.info("notes","created",{id:x.id}),o&&(o.value=""),i&&(i.value=""),s&&(s.value=""),f(n))});const r=n.querySelector("#ax-notes-search");r&&c.bind(r,"input",()=>{const a=r.value.trim(),o=a?d.search(t,a):d.load(t),i=n.querySelector("#ax-notes-list");i&&(i.innerHTML=o.length>0?o.map(s=>`
            <article class="ax-note-card" data-note-id="${l(s.id)}" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:10px">
              <h3 style="margin:0;color:#c9a227;font-size:15px">${l(s.title)}</h3>
              <p style="margin:8px 0;color:var(--ax-text-dim);font-size:13px">${l(s.content.slice(0,240))}</p>
            </article>
          `).join(""):'<p style="color:var(--ax-text-dim);text-align:center;padding:24px">Aucun résultat</p>')}),n.querySelectorAll('[data-action="delete"]').forEach(a=>{c.bind(a,"click",()=>{const o=a.dataset.noteId;o&&d.remove(t,o)&&f(n)})}),n.querySelectorAll('[data-action="favorite"]').forEach(a=>{c.bind(a,"click",()=>{const o=a.dataset.noteId;o&&d.toggleFavorite(t,o)&&f(n)})})}export{L as dispose,l as escapeHtml,d as notesStore,f as render};
//# sourceMappingURL=index-DRXLnNST.js.map
