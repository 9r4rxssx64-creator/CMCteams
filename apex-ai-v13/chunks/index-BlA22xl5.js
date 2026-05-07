import{l as d}from"./monitoring-B17vNBOa.js";import{s as f}from"../core/main-DyCXfNFi.js";import"./apex-kb-B9dYWkSj.js";import"./apex-tools-registry-DloDnFZi.js";import"./credential-patterns-BybElwOv.js";import"./apex-tools-dispatch-Cy6tIY28.js";const g="ax_calendar_";function x(r){return`${g}${r}`}function l(r){return r.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}function y(r){if(!/^\d{4}-\d{2}-\d{2}$/.test(r))return!1;const e=new Date(r);return!Number.isNaN(e.getTime())&&r===e.toISOString().slice(0,10)}function b(r){return/^([01]\d|2[0-3]):([0-5]\d)$/.test(r)}class v{load(e){if(!e)return[];try{const t=localStorage.getItem(x(e));if(!t)return[];const a=JSON.parse(t);return Array.isArray(a)?a.filter(this.isValidEvent):[]}catch(t){return d.warn("calendar","load failed",{err:t}),[]}}isValidEvent(e){if(!e||typeof e!="object")return!1;const t=e;return typeof t.id=="string"&&typeof t.title=="string"&&typeof t.date=="string"&&typeof t.ts_created=="number"}save(e,t){if(!e)return!1;try{return localStorage.setItem(x(e),JSON.stringify(t)),!0}catch(a){return d.warn("calendar","save failed",{err:a}),!1}}add(e,t){if(!e||!t.title.trim()||!y(t.date)||t.time&&!b(t.time))return null;const a=this.load(e),n={id:`evt_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,title:t.title.trim().slice(0,200),date:t.date,time:t.time,location:t.location?t.location.slice(0,200):void 0,notes:t.notes?t.notes.slice(0,5e3):void 0,ts_created:Date.now()};return a.push(n),a.sort((i,o)=>(i.date+(i.time??"")).localeCompare(o.date+(o.time??""))),a.length>1e3&&(a.length=1e3),this.save(e,a)?n:null}remove(e,t){return e?this.save(e,this.load(e).filter(a=>a.id!==t)):!1}upcoming(e,t=7){const a=new Date,n=a.toISOString().slice(0,10),i=new Date(a.getTime()+t*864e5).toISOString().slice(0,10);return this.load(e).filter(o=>o.date>=n&&o.date<=i)}byMonth(e,t,a){if(a<1||a>12)return[];const n=`${t}-${a.toString().padStart(2,"0")}`;return this.load(e).filter(i=>i.date.startsWith(n))}count(e){return this.load(e).length}}const s=new v;function m(r){const t=f.get("user")?.id??"anon",a=s.upcoming(t,30),n=a.length>0?a.map(i=>`
        <article class="ax-cal-event" data-event-id="${l(i.id)}" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:8px">
          <header style="display:flex;justify-content:space-between;align-items:center">
            <strong style="color:#c9a227">${l(i.title)}</strong>
            <button class="ax-btn ax-btn-sm" data-action="delete-event" data-event-id="${l(i.id)}" style="font-size:11px;padding:4px 8px;color:#ff6666">Supprimer</button>
          </header>
          <p style="margin:6px 0;color:var(--ax-text-dim);font-size:13px">
            📅 ${l(i.date)}${i.time?" à "+l(i.time):""}
            ${i.location?"<br>📍 "+l(i.location):""}
          </p>
          ${i.notes?`<p style="margin:6px 0;color:var(--ax-text-dim);font-size:12px;white-space:pre-wrap">${l(i.notes)}</p>`:""}
        </article>
      `).join(""):'<p style="color:var(--ax-text-dim);text-align:center;padding:24px">Aucun événement à venir</p>';r.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:760px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;color:#c9a227">📅 Calendrier</h1>
        <span style="color:var(--ax-text-dim);font-size:13px">${s.count(t)} évt total</span>
      </header>

      <form id="ax-cal-form" class="ax-form" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <input type="text" id="ax-cal-title" placeholder="Titre événement…" maxlength="200" autocomplete="off" required style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px">
        <div style="display:flex;gap:8px;margin-bottom:8px">
          <input type="date" id="ax-cal-date" required style="flex:1;padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px">
          <input type="time" id="ax-cal-time" style="width:120px;padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px">
        </div>
        <input type="text" id="ax-cal-location" placeholder="Lieu (optionnel)…" maxlength="200" autocomplete="off" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px">
        <textarea id="ax-cal-notes" placeholder="Notes (optionnel)…" rows="2" maxlength="5000" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;resize:vertical"></textarea>
        <button type="submit" class="ax-btn ax-btn-primary" style="width:100%;min-height:40px">Ajouter événement</button>
      </form>

      <h2 style="color:#c9a227;font-size:16px;margin:16px 0 8px">⏰ 30 prochains jours</h2>
      <div id="ax-cal-list">${n}</div>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `,h(r,t)}function h(r,e){const t=r.querySelector("#ax-cal-form");t&&t.addEventListener("submit",a=>{a.preventDefault();const n=r.querySelector("#ax-cal-title")?.value??"",i=r.querySelector("#ax-cal-date")?.value??"",o=r.querySelector("#ax-cal-time")?.value??"",c=r.querySelector("#ax-cal-location")?.value??"",p=r.querySelector("#ax-cal-notes")?.value??"",u=s.add(e,{title:n,date:i,...o&&{time:o},...c&&{location:c},...p&&{notes:p}});u&&(d.info("calendar","event added",{id:u.id}),m(r))}),r.querySelectorAll('[data-action="delete-event"]').forEach(a=>{a.addEventListener("click",()=>{const n=a.dataset.eventId;n&&s.remove(e,n)&&m(r)})})}export{s as calendarStore,l as escapeHtml,y as isValidDate,b as isValidTime,m as render};
//# sourceMappingURL=index-BlA22xl5.js.map
