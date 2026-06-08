import{l as d,b as g,e as o}from"./monitoring-Cuem9BYP.js";import{c as v}from"./listener-cleanup-Y2rGGxxX.js";import{g as b}from"./apex-tools-dispatch-core-U62yJ7jD.js";import"./multi-source-analyze-iPmWybTv.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-d05guMDK.js";import"./apex-tools-dispatch-skills-D-3chqCR.js";import"./apex-tools-dispatch-data-fcArwuOs.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-DKs9sfnj.js";import"./apex-tools-misc-BAhXt85G.js";import"./apex-tools-registry-core-BMhHY4vU.js";import"./apex-tools-registry-skills-x-mAWYry.js";let s=null;function L(){s?.cleanup(),s=null}const h="ax_calendar_";function f(r){return`${h}${r}`}function y(r){if(!/^\d{4}-\d{2}-\d{2}$/.test(r))return!1;const t=new Date(r);return!Number.isNaN(t.getTime())&&r===t.toISOString().slice(0,10)}function S(r){return/^([01]\d|2[0-3]):([0-5]\d)$/.test(r)}class ${load(t){if(!t)return[];try{const e=localStorage.getItem(f(t));if(!e)return[];const a=JSON.parse(e);return Array.isArray(a)?a.filter(this.isValidEvent):[]}catch(e){return d.warn("calendar","load failed",{err:e}),[]}}isValidEvent(t){if(!t||typeof t!="object")return!1;const e=t;return typeof e.id=="string"&&typeof e.title=="string"&&typeof e.date=="string"&&typeof e.ts_created=="number"}save(t,e){if(!t)return!1;try{return localStorage.setItem(f(t),JSON.stringify(e)),!0}catch(a){return d.warn("calendar","save failed",{err:a}),!1}}add(t,e){if(!t||!e.title.trim()||!y(e.date)||e.time&&!S(e.time))return null;const a=this.load(t),l={id:`evt_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,title:e.title.trim().slice(0,200),date:e.date,time:e.time,location:e.location?e.location.slice(0,200):void 0,notes:e.notes?e.notes.slice(0,5e3):void 0,ts_created:Date.now()};return a.push(l),a.sort((n,i)=>(n.date+(n.time??"")).localeCompare(i.date+(i.time??""))),a.length>1e3&&(a.length=1e3),this.save(t,a)?l:null}remove(t,e){return t?this.save(t,this.load(t).filter(a=>a.id!==e)):!1}upcoming(t,e=7){const a=new Date,l=a.toISOString().slice(0,10),n=new Date(a.getTime()+e*864e5).toISOString().slice(0,10);return this.load(t).filter(i=>i.date>=l&&i.date<=n)}byMonth(t,e,a){if(a<1||a>12)return[];const l=`${e}-${a.toString().padStart(2,"0")}`;return this.load(t).filter(n=>n.date.startsWith(l))}count(t){return this.load(t).length}}const c=new $;function x(r){s?.cleanup(),s=v("calendar");const e=g.get("user")?.id??"anon";if(!b("module.calendar",r,e))return;const a=c.upcoming(e,30),l=a.length>0?a.map(n=>`
        <article class="ax-cal-event ax-gs-338" data-event-id="${o(n.id)}">
          <header class="ax-gs-219">
            <strong class="ax-gs-266">${o(n.title)}</strong>
            <button class="ax-btn ax-btn-sm ax-gs-349" data-action="delete-event" data-event-id="${o(n.id)}">Supprimer</button>
          </header>
          <p style="margin:6px 0;color:var(--ax-text-dim);font-size:13px">
            📅 ${o(n.date)}${n.time?" à "+o(n.time):""}
            ${n.location?"<br>📍 "+o(n.location):""}
          </p>
          ${n.notes?`<p style="margin:6px 0;color:var(--ax-text-dim);font-size:12px;white-space:pre-wrap">${o(n.notes)}</p>`:""}
        </article>
      `).join(""):'<p class="ax-gs-213">Aucun événement à venir</p>';r.innerHTML=`
    <div class="ax-page ax-gs-332">
      <header class="ax-gs-210">
        <h1 class="ax-gs-333">📅 Calendrier</h1>
        <span class="ax-gs-3">${c.count(e)} évt total</span>
      </header>

      <form id="ax-cal-form" class="ax-form ax-gs-350">
        <label for="ax-cal-title" class="sr-only">Titre de l'événement</label>
        <input type="text" id="ax-cal-title" placeholder="Titre événement…" aria-label="Titre de l'événement" maxlength="200" autocomplete="off" required class="ax-gs-351">
        <div style="display:flex;gap:8px;margin-bottom:8px">
          <label for="ax-cal-date" class="sr-only">Date de l'événement</label>
          <input type="date" id="ax-cal-date" aria-label="Date de l'événement" required style="flex:1;padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px">
          <label for="ax-cal-time" class="sr-only">Heure de l'événement</label>
          <input type="time" id="ax-cal-time" aria-label="Heure de l'événement" style="width:120px;padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px">
        </div>
        <label for="ax-cal-location" class="sr-only">Lieu de l'événement</label>
        <input type="text" id="ax-cal-location" placeholder="Lieu (optionnel)…" aria-label="Lieu de l'événement (optionnel)" maxlength="200" autocomplete="off" class="ax-gs-351">
        <label for="ax-cal-notes" class="sr-only">Notes additionnelles</label>
        <textarea id="ax-cal-notes" placeholder="Notes (optionnel)…" aria-label="Notes additionnelles (optionnel)" rows="2" maxlength="5000" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;resize:vertical"></textarea>
        <button type="submit" class="ax-btn ax-btn-primary ax-gs-352">Ajouter événement</button>
      </form>

      <h2 style="color:#c9a227;font-size:16px;margin:16px 0 8px">⏰ 30 prochains jours</h2>
      <div id="ax-cal-list">${l}</div>

      <p class="ax-gs-212"><a href="#chat" class="ax-gs-198">← Retour chat</a></p>
    </div>
  `,w(r,e)}function w(r,t){const e=r.querySelector("#ax-cal-form");e&&s.bind(e,"submit",a=>{a.preventDefault();const l=r.querySelector("#ax-cal-title")?.value??"",n=r.querySelector("#ax-cal-date")?.value??"",i=r.querySelector("#ax-cal-time")?.value??"",u=r.querySelector("#ax-cal-location")?.value??"",p=r.querySelector("#ax-cal-notes")?.value??"",m=c.add(t,{title:l,date:n,...i&&{time:i},...u&&{location:u},...p&&{notes:p}});m&&(d.info("calendar","event added",{id:m.id}),x(r))}),r.querySelectorAll('[data-action="delete-event"]').forEach(a=>{s.bind(a,"click",()=>{const l=a.dataset.eventId;l&&c.remove(t,l)&&x(r)})})}export{c as calendarStore,L as dispose,o as escapeHtml,y as isValidDate,S as isValidTime,x as render};
