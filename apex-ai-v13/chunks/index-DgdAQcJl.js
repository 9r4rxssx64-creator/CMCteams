import{b as k,e as u}from"./monitoring-DfV1jLgN.js";import{c as w}from"./listener-cleanup-Y2rGGxxX.js";import{scheduledTasks as x}from"./scheduled-tasks-C9zHSWYT.js";import{g as $}from"./apex-tools-dispatch-core-CCSAPhDg.js";import{toast as m}from"./toast-BCPNzfMv.js";import"./multi-source-analyze-DUElMJpr.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-CQguQfqL.js";import"./apex-tools-dispatch-skills-DNDzhGnK.js";import"./apex-tools-dispatch-data-CIpgaTIM.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-CLNAjYXc.js";import"./apex-tools-misc-DyRhyXds.js";import"./apex-tools-registry-core-48oOK-KS.js";import"./apex-tools-registry-skills-x-mAWYry.js";import"./haptic-CQFg2PXZ.js";let s=null;function K(){s?.cleanup(),s=null}const b=["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];function S(e){const o=t=>`${String(Math.floor(t/60)).padStart(2,"0")}h${String(t%60).padStart(2,"0")}`;switch(e.kind){case"once":return`Une fois — ${new Date(e.at??e.nextRun).toLocaleString("fr-FR")}`;case"daily":return`Chaque jour à ${o(e.timeMin??540)}`;case"weekly":return`Chaque ${b[e.weekday??1]} à ${o(e.timeMin??540)}`;case"interval":return`Toutes les ${e.everyMin??15} min`;default:return""}}function h(e){s?.cleanup(),s=w("scheduled");const t=k.get("user")?.id??"anon";if(!$("module.scheduled",e,t))return;const i=x.list(t),c=i.length?i.map(a=>`
        <article class="ax-note-card ax-gs-400" style="${a.enabled?"":"opacity:.55"}">
          <p style="margin:0 0 6px;white-space:pre-wrap">${u(a.prompt.slice(0,200))}${a.prompt.length>200?"…":""}</p>
          <div style="font-size:12px;color:var(--ax-text-dim);margin-bottom:8px">
            🗓 ${u(S(a))} · prochaine : ${new Date(a.nextRun).toLocaleString("fr-FR")}${a.lastRun?` · dernière : ${new Date(a.lastRun).toLocaleString("fr-FR")}`:""}
          </div>
          <footer style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="ax-btn ax-btn-sm" data-action="toggle" data-task-id="${u(a.id)}">${a.enabled?"⏸ Désactiver":"▶️ Activer"}</button>
            <button class="ax-btn ax-btn-sm" data-action="delete" data-task-id="${u(a.id)}">Supprimer</button>
          </footer>
        </article>`).join(""):'<p class="ax-gs-213">Aucune tâche programmée.</p>';e.innerHTML=`
    <div class="ax-page ax-gs-332">
      <header class="ax-gs-210">
        <h1 class="ax-gs-333">⏰ Tâches programmées</h1>
        <span class="ax-gs-3">${i.length} tâche${i.length>1?"s":""}</span>
      </header>
      <p style="color:var(--ax-text-dim);font-size:13px;margin:0 0 12px">
        Programme des prompts récurrents ou ponctuels. Ils s'exécutent quand l'app est ouverte
        (une PWA ne tourne pas en arrière-plan — le résultat apparaît dans le chat à l'ouverture).
      </p>

      <form id="ax-sched-form" class="ax-form ax-gs-350">
        <textarea id="ax-sched-prompt" placeholder="Prompt à exécuter (ex : « Résume l'actu tech du jour »)…" aria-label="Prompt de la tâche" rows="2" maxlength="2000" required style="width:100%;padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;resize:vertical"></textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;align-items:center">
          <select id="ax-sched-kind" aria-label="Fréquence" style="padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
            <option value="daily">Chaque jour</option>
            <option value="weekly">Chaque semaine</option>
            <option value="interval">Toutes les N minutes</option>
            <option value="once">Une seule fois (demain)</option>
          </select>
          <input type="time" id="ax-sched-time" value="09:00" aria-label="Heure" style="padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
          <select id="ax-sched-weekday" aria-label="Jour" style="padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px;display:none">
            ${b.map((a,d)=>`<option value="${d}"${d===1?" selected":""}>${a}</option>`).join("")}
          </select>
          <input type="number" id="ax-sched-every" value="60" min="15" max="1440" aria-label="Minutes" style="width:80px;padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px;display:none">
        </div>
        <button type="submit" class="ax-btn ax-btn-primary ax-gs-401" style="margin-top:8px">➕ Programmer</button>
      </form>

      <div id="ax-sched-list" style="margin-top:14px">${c}</div>
      <p class="ax-gs-212"><a href="#chat" class="ax-gs-198">← Retour chat</a></p>
    </div>
  `,q(e,t)}function q(e,o){const t=e.querySelector("#ax-sched-kind"),i=e.querySelector("#ax-sched-time"),c=e.querySelector("#ax-sched-weekday"),a=e.querySelector("#ax-sched-every"),d=()=>{const n=t?.value;i&&(i.style.display=n==="daily"||n==="weekly"?"":"none"),c&&(c.style.display=n==="weekly"?"":"none"),a&&(a.style.display=n==="interval"?"":"none")};t&&(s.bind(t,"change",d),d());const g=e.querySelector("#ax-sched-form");g&&s.bind(g,"submit",n=>{n.preventDefault();const l=e.querySelector("#ax-sched-prompt")?.value??"",r=t?.value??"daily",[f,v]=(i?.value??"09:00").split(":").map(Number),y=(f??9)*60+(v??0),p={prompt:l,kind:r};if(r==="daily"?p.timeMin=y:r==="weekly"?(p.timeMin=y,p.weekday=Number(c?.value??1)):r==="interval"?p.everyMin=Math.max(15,Number(a?.value??60)):r==="once"&&(p.at=Date.now()+1440*60*1e3),!x.create(p)){m.warn("Prompt requis (ou limite atteinte)");return}m.success("⏰ Tâche programmée"),h(e)}),s.bind(e,"click",n=>{const l=n.target?.closest("[data-action]");if(!l)return;const r=l.dataset.taskId;if(r)if(l.dataset.action==="toggle"){const f=x.toggle(r,o);m.info(f?"▶️ Tâche activée":"⏸ Tâche désactivée"),h(e)}else l.dataset.action==="delete"&&x.remove(r,o)&&(m.info("Tâche supprimée"),h(e))})}export{K as dispose,u as escapeHtml,h as render};
