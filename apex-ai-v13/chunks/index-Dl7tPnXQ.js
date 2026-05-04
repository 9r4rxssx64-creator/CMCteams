import{s as x,l as d}from"../core/main-DP3eEiok.js";const u=5,v=100,f=300,g=["video/mp4","video/webm","video/quicktime","video/x-matroska"];function s(a){return a.replace(/[&<>"']/g,i=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[i]??i)}function h(a,i=0){return{id:`clip_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,name:a.trim().slice(0,100),url:null,duration:Math.max(0,i),start:0,end:i,caption:"",transition:"cut"}}function c(a){if(!Number.isFinite(a)||a<0)return"0:00";const i=Math.floor(a/60),t=Math.floor(a%60);return`${i}:${t.toString().padStart(2,"0")}`}function m(a){return a.reduce((i,t)=>i+Math.max(0,t.end-t.start),0)}function b(a){return g.includes(a)}class y{clips=[];list(){return this.clips}add(i,t=0){if(this.clips.length>=u)return d.warn("studio-video","max clips reached",{count:this.clips.length}),null;const e=h(i,t);return this.clips.push(e),e}remove(i){const t=this.clips.length,e=this.clips.find(n=>n.id===i);if(e?.url)try{URL.revokeObjectURL(e.url)}catch(n){d.warn("studio-video","revokeObjectURL failed",{err:n})}return this.clips=this.clips.filter(n=>n.id!==i),this.clips.length<t}update(i,t){const e=this.clips.find(n=>n.id===i);return e?(t.caption!==void 0&&(e.caption=t.caption.slice(0,200)),t.name!==void 0&&(e.name=t.name.slice(0,100)),t.start!==void 0&&(e.start=Math.max(0,Math.min(e.duration,t.start))),t.end!==void 0&&(e.end=Math.max(e.start,Math.min(e.duration,t.end))),t.transition!==void 0&&(e.transition=t.transition),!0):!1}setUrl(i,t){const e=this.clips.find(n=>n.id===i);return e?(e.url=t,!0):!1}reorder(i){const t=new Map(this.clips.map(n=>[n.id,n])),e=[];for(const n of i){const o=t.get(n);o&&e.push(o)}return e.length!==this.clips.length?!1:(this.clips=e,!0)}clear(){for(const i of this.clips)if(i.url)try{URL.revokeObjectURL(i.url)}catch{}this.clips=[]}count(){return this.clips.length}validateFileSize(i){return i>0&&i<=v*1024*1024}validateTotalDuration(){const i=m(this.clips);return{ok:i<=f,total:i}}}const r=new y;function p(a){x.get("user")?.id;const t=r.list(),e=m(t),n=t.length>0?t.map((o,l)=>`
        <div class="ax-video-clip" data-clip-id="${s(o.id)}" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <strong style="color:#c9a227">#${l+1} · ${s(o.name)}</strong>
            <span style="font-size:12px;color:var(--ax-text-dim)">${c(o.end-o.start)}</span>
          </div>
          <input type="text" placeholder="Caption (sous-titre)…" maxlength="200" value="${s(o.caption)}" data-action="caption" data-clip-id="${s(o.id)}" style="width:100%;padding:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;margin-bottom:6px;min-height:36px">
          <select data-action="transition" data-clip-id="${s(o.id)}" style="width:100%;padding:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:36px">
            <option value="cut" ${o.transition==="cut"?"selected":""}>Coupe nette</option>
            <option value="fade" ${o.transition==="fade"?"selected":""}>Fondu</option>
            <option value="slide" ${o.transition==="slide"?"selected":""}>Glissé</option>
            <option value="none" ${o.transition==="none"?"selected":""}>Aucune</option>
          </select>
          <button class="ax-btn ax-btn-sm" data-action="remove-clip" data-clip-id="${s(o.id)}" style="margin-top:8px;font-size:11px;padding:6px 10px;color:#ff6666;min-height:36px">Supprimer</button>
        </div>
      `).join(""):'<p style="color:var(--ax-text-dim);text-align:center;padding:24px">Aucun clip. Importe ta première vidéo !</p>';a.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:760px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;color:#c9a227">🎬 Studio Vidéo</h1>
        <span style="color:var(--ax-text-dim);font-size:13px">${t.length}/${u} clips · ${c(e)}</span>
      </header>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <p style="margin:0 0 8px 0;font-size:13px;color:var(--ax-text-dim)">Timeline ${u} clips max, ${c(f)} total. Cuts + transitions + captions auto. Export MP4/WebM.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <input type="file" id="ax-video-upload" accept="video/*" multiple style="display:none">
          <button class="ax-btn ax-btn-primary" id="ax-video-upload-btn" style="min-height:44px">📂 Importer vidéos</button>
          <button class="ax-btn" id="ax-video-export" style="min-height:44px">💾 Export MP4</button>
          <button class="ax-btn" id="ax-video-clear" style="min-height:44px;color:#ff6666">🗑 Tout effacer</button>
        </div>
      </div>

      <div id="ax-video-clips">${n}</div>

      <p style="margin-top:24px;text-align:center"><a href="#studios" style="color:#c9a227">← Retour studios</a></p>
    </div>
  `,S(a)}function S(a,i){a.querySelector("#ax-video-upload-btn")?.addEventListener("click",()=>{a.querySelector("#ax-video-upload")?.click()}),a.querySelector("#ax-video-upload")?.addEventListener("change",t=>{const e=t.target.files;if(e){for(const n of Array.from(e)){if(!b(n.type)){d.warn("studio-video","invalid format",{type:n.type,name:n.name});continue}if(!r.validateFileSize(n.size)){d.warn("studio-video","file too big",{size:n.size,name:n.name});continue}const o=r.add(n.name);if(o){try{const l=URL.createObjectURL(n);r.setUrl(o.id,l)}catch(l){d.warn("studio-video","createObjectURL failed",{err:l})}d.info("studio-video","clip imported",{name:n.name})}}p(a)}}),a.querySelector("#ax-video-clear")?.addEventListener("click",()=>{r.clear(),p(a)}),a.querySelectorAll('[data-action="remove-clip"]').forEach(t=>{t.addEventListener("click",()=>{const e=t.dataset.clipId;e&&r.remove(e)&&p(a)})}),a.querySelectorAll('[data-action="caption"]').forEach(t=>{t.addEventListener("input",()=>{const e=t.dataset.clipId;e&&r.update(e,{caption:t.value})})}),a.querySelectorAll('[data-action="transition"]').forEach(t=>{t.addEventListener("change",()=>{const e=t.dataset.clipId;e&&r.update(e,{transition:t.value})})})}export{g as ACCEPTED_FORMATS,u as MAX_CLIPS,v as MAX_FILE_SIZE_MB,f as MAX_TOTAL_DURATION_S,m as calcTotalDuration,h as createClip,s as escapeHtml,c as formatDuration,b as isValidVideoFormat,p as render,r as videoStudioStore};
//# sourceMappingURL=index-Dl7tPnXQ.js.map
