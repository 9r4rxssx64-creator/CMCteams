import{c as g}from"./listener-cleanup-Y2rGGxxX.js";import{l as c}from"./monitoring-3uBGKGRH.js";import{s as b}from"../core/main-BG5A3meL.js";import{g as y}from"./apex-tools-dispatch-BAvAqlxB.js";import"./apex-kb-CvTWOkmJ.js";import"./credential-patterns-qcw7Brjr.js";import"./multi-source-analyze-BQrgAPat.js";import"./apex-tools-registry-60WN0GJG.js";import"./voice-DCrB8Pzx.js";let s=null;function A(){s?.cleanup(),s=null}const v="ax_calendar_";function x(r){return`${v}${r}`}function o(r){return r.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]??t)}function h(r){if(!/^\d{4}-\d{2}-\d{2}$/.test(r))return!1;const t=new Date(r);return!Number.isNaN(t.getTime())&&r===t.toISOString().slice(0,10)}function S(r){return/^([01]\d|2[0-3]):([0-5]\d)$/.test(r)}class w{load(t){if(!t)return[];try{const e=localStorage.getItem(x(t));if(!e)return[];const a=JSON.parse(e);return Array.isArray(a)?a.filter(this.isValidEvent):[]}catch(e){return c.warn("calendar","load failed",{err:e}),[]}}isValidEvent(t){if(!t||typeof t!="object")return!1;const e=t;return typeof e.id=="string"&&typeof e.title=="string"&&typeof e.date=="string"&&typeof e.ts_created=="number"}save(t,e){if(!t)return!1;try{return localStorage.setItem(x(t),JSON.stringify(e)),!0}catch(a){return c.warn("calendar","save failed",{err:a}),!1}}add(t,e){if(!t||!e.title.trim()||!h(e.date)||e.time&&!S(e.time))return null;const a=this.load(t),i={id:`evt_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,title:e.title.trim().slice(0,200),date:e.date,time:e.time,location:e.location?e.location.slice(0,200):void 0,notes:e.notes?e.notes.slice(0,5e3):void 0,ts_created:Date.now()};return a.push(i),a.sort((n,l)=>(n.date+(n.time??"")).localeCompare(l.date+(l.time??""))),a.length>1e3&&(a.length=1e3),this.save(t,a)?i:null}remove(t,e){return t?this.save(t,this.load(t).filter(a=>a.id!==e)):!1}upcoming(t,e=7){const a=new Date,i=a.toISOString().slice(0,10),n=new Date(a.getTime()+e*864e5).toISOString().slice(0,10);return this.load(t).filter(l=>l.date>=i&&l.date<=n)}byMonth(t,e,a){if(a<1||a>12)return[];const i=`${e}-${a.toString().padStart(2,"0")}`;return this.load(t).filter(n=>n.date.startsWith(i))}count(t){return this.load(t).length}}const d=new w;function f(r){s?.cleanup(),s=g("calendar");const e=b.get("user")?.id??"anon";if(!y("module.calendar",r,e))return;const a=d.upcoming(e,30),i=a.length>0?a.map(n=>`
        <article class="ax-cal-event" data-event-id="${o(n.id)}" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:8px">
          <header style="display:flex;justify-content:space-between;align-items:center">
            <strong style="color:#c9a227">${o(n.title)}</strong>
            <button class="ax-btn ax-btn-sm" data-action="delete-event" data-event-id="${o(n.id)}" style="font-size:11px;padding:4px 8px;color:#ff6666">Supprimer</button>
          </header>
          <p style="margin:6px 0;color:var(--ax-text-dim);font-size:13px">
            📅 ${o(n.date)}${n.time?" à "+o(n.time):""}
            ${n.location?"<br>📍 "+o(n.location):""}
          </p>
          ${n.notes?`<p style="margin:6px 0;color:var(--ax-text-dim);font-size:12px;white-space:pre-wrap">${o(n.notes)}</p>`:""}
        </article>
      `).join(""):'<p style="color:var(--ax-text-dim);text-align:center;padding:24px">Aucun événement à venir</p>';r.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:760px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;color:#c9a227">📅 Calendrier</h1>
        <span style="color:var(--ax-text-dim);font-size:13px">${d.count(e)} évt total</span>
      </header>

      <form id="ax-cal-form" class="ax-form" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <label for="ax-cal-title" class="sr-only">Titre de l'événement</label>
        <input type="text" id="ax-cal-title" placeholder="Titre événement…" aria-label="Titre de l'événement" maxlength="200" autocomplete="off" required style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px">
        <div style="display:flex;gap:8px;margin-bottom:8px">
          <label for="ax-cal-date" class="sr-only">Date de l'événement</label>
          <input type="date" id="ax-cal-date" aria-label="Date de l'événement" required style="flex:1;padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px">
          <label for="ax-cal-time" class="sr-only">Heure de l'événement</label>
          <input type="time" id="ax-cal-time" aria-label="Heure de l'événement" style="width:120px;padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px">
        </div>
        <label for="ax-cal-location" class="sr-only">Lieu de l'événement</label>
        <input type="text" id="ax-cal-location" placeholder="Lieu (optionnel)…" aria-label="Lieu de l'événement (optionnel)" maxlength="200" autocomplete="off" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px">
        <label for="ax-cal-notes" class="sr-only">Notes additionnelles</label>
        <textarea id="ax-cal-notes" placeholder="Notes (optionnel)…" aria-label="Notes additionnelles (optionnel)" rows="2" maxlength="5000" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;resize:vertical"></textarea>
        <button type="submit" class="ax-btn ax-btn-primary" style="width:100%;min-height:44px">Ajouter événement</button>
      </form>

      <h2 style="color:#c9a227;font-size:16px;margin:16px 0 8px">⏰ 30 prochains jours</h2>
      <div id="ax-cal-list">${i}</div>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `,$(r,e)}function $(r,t){const e=r.querySelector("#ax-cal-form");e&&s.bind(e,"submit",a=>{a.preventDefault();const i=r.querySelector("#ax-cal-title")?.value??"",n=r.querySelector("#ax-cal-date")?.value??"",l=r.querySelector("#ax-cal-time")?.value??"",p=r.querySelector("#ax-cal-location")?.value??"",u=r.querySelector("#ax-cal-notes")?.value??"",m=d.add(t,{title:i,date:n,...l&&{time:l},...p&&{location:p},...u&&{notes:u}});m&&(c.info("calendar","event added",{id:m.id}),f(r))}),r.querySelectorAll('[data-action="delete-event"]').forEach(a=>{s.bind(a,"click",()=>{const i=a.dataset.eventId;i&&d.remove(t,i)&&f(r)})})}export{d as calendarStore,A as dispose,o as escapeHtml,h as isValidDate,S as isValidTime,f as render};
