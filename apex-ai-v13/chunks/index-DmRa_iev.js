const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-DCq6S1Q0.js","./monitoring-3uBGKGRH.js","./credential-patterns-CLzI061R.js"])))=>i.map(i=>d[i]);
import{_ as b}from"./apex-kb-DCq6S1Q0.js";import{s as g}from"../core/main-6dzJywfD.js";import{reportsHistory as p}from"./apex-reports-history-Cv_X_jWe.js";import"./monitoring-3uBGKGRH.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-Bx2cgCLR.js";function a(t){return t.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}function d(t){return new Date(t).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}function m(t){const e=!t.hasHorizontalOverflow&&t.hiddenButtonsCount===0?"✅":"⚠️",o=t.topHiddenButtons.length?`<ul style="margin:4px 0 0 18px;padding:0;font-size:11px;color:#ffaa66">${t.topHiddenButtons.map(n=>`<li>"${a(n.label)}" → ${a(n.reason)}</li>`).join("")}</ul>`:"",i=t.topOverflows.length?`<ul style="margin:4px 0 0 18px;padding:0;font-size:11px;color:#ff5b5b">${t.topOverflows.map(n=>`<li>${a(n.selector)} (+${n.overflowBy}px)</li>`).join("")}</ul>`:"";return`
    <div style="background:rgba(180,90,200,0.06);border:1px solid rgba(180,90,200,0.25);border-radius:8px;padding:10px;margin-bottom:8px;font-size:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
        <span><b>${e} Layout scan</b> · ${a(t.view)}</span>
        <span style="color:rgba(255,255,255,0.5);font-size:11px;font-family:monospace">${d(t.ts)} · ${a(t.appVer)}</span>
      </div>
      <div style="margin-top:4px;color:rgba(255,255,255,0.85)">
        Overflow horizontal : <b style="color:${t.hasHorizontalOverflow?"#ff5b5b":"#22cc77"}">${t.hasHorizontalOverflow?"OUI":"NON"}</b>
        · Cachés : <b style="color:${t.hiddenButtonsCount?"#ffaa66":"#22cc77"}">${t.hiddenButtonsCount}</b>
        · Touch&lt;44px : ${t.smallTouchTargetsCount}
        · Éléments overflow : ${t.overflowingCount}
      </div>
      ${o}
      ${i}
    </div>
  `}function y(t){const e=Math.round(t.okRate*100),o=e>=80?"✅":e>=50?"⚠️":"❌",i=t.bugSamples.length?`<ul style="margin:4px 0 0 18px;padding:0;font-size:11px;color:#ffaa66">${t.bugSamples.map(s=>`<li>"${a(s.label)}" → ${a(s.status)}</li>`).join("")}</ul>`:"",n=t.fixesApplied.length?`<div style="margin-top:4px;color:#c9a227">🔧 Auto-fix : ${t.fixesApplied.map(s=>a(s)).join(", ")}${t.improvement!==0?` (+${Math.round(t.improvement*100)}%)`:""}</div>`:"",c=t.escalated?'<div style="margin-top:4px;color:#ff5b5b">⚠ Escaladé Claude Code (ax_claude_todo)</div>':"";return`
    <div style="background:rgba(106,138,255,0.06);border:1px solid rgba(106,138,255,0.25);border-radius:8px;padding:10px;margin-bottom:8px;font-size:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
        <span><b>${o} Test fonctionnel</b> · ${a(t.view)}</span>
        <span style="color:rgba(255,255,255,0.5);font-size:11px;font-family:monospace">${d(t.ts)} · ${a(t.appVer)}</span>
      </div>
      <div style="margin-top:4px;color:rgba(255,255,255,0.85)">
        Testés : <b>${t.tested}</b>/${t.totalButtons}
        · OK : <b style="color:#22cc77">${t.ok} (${e}%)</b>
        · No-response : <b style="color:#ffaa66">${t.noResponse}</b>
        · Erreurs : <b style="color:#ff5b5b">${t.errors}</b>
        · Skippés : ${t.skipped}
      </div>
      ${n}
      ${c}
      ${i}
    </div>
  `}function x(t){if(!(g.get("isAdmin")===!0)){t.innerHTML='<div style="padding:24px;text-align:center;color:#94a3b8">🔒 Réservé admin Kevin</div>';return}const o=p.getStats(),i=p.getLayoutHistory().slice().reverse(),n=p.getFunctionalHistory().slice().reverse(),c=o.lastLayoutTs?d(o.lastLayoutTs):"jamais",s=o.lastFunctionalTs?d(o.lastFunctionalTs):"jamais";t.innerHTML=`
    <div class="ax-admin ax-page" style="padding:14px;max-width:920px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">
        <h1 style="margin:0;color:#c9a227;font-size:20px">📊 Apex Audits Live</h1>
        <button class="ax-btn" data-nav-route="admin" style="padding:6px 12px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.85);border:1px solid rgba(255,255,255,0.15);border-radius:20px;cursor:pointer;font-size:12px;min-height:36px">← Admin</button>
      </header>

      <section style="background:rgba(15,23,42,0.7);border:1px solid rgba(106,138,255,0.25);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px;font-size:14px;color:#8bb4ff">Vue d'ensemble</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;font-size:12px">
          <div>📐 Layout scans : <b>${o.layoutCount}</b><br><span style="color:rgba(255,255,255,0.5);font-size:11px">dernier : ${c}</span></div>
          <div>🧪 Tests fonctionnels : <b>${o.functionalCount}</b><br><span style="color:rgba(255,255,255,0.5);font-size:11px">dernier : ${s}</span></div>
          <div>🐛 Bugs 24h : <b style="color:${o.recentBugs?"#ff5b5b":"#22cc77"}">${o.recentBugs}</b></div>
          <div>📤 Escaladés Claude Code 24h : <b style="color:${o.recentEscalations?"#ffaa66":"#22cc77"}">${o.recentEscalations}</b></div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
          <button id="ax-audits-run-functional" class="ax-btn" style="padding:8px 14px;background:rgba(106,138,255,0.15);color:#8bb4ff;border:1px solid rgba(106,138,255,0.35);border-radius:8px;cursor:pointer;font-size:12px;min-height:40px">🧪 Lancer test fonctionnel maintenant</button>
          <button id="ax-audits-run-layout" class="ax-btn" style="padding:8px 14px;background:rgba(180,90,200,0.15);color:#c97aff;border:1px solid rgba(180,90,200,0.35);border-radius:8px;cursor:pointer;font-size:12px;min-height:40px">📐 Scan layout maintenant</button>
          <button id="ax-audits-clear" class="ax-btn" style="padding:8px 14px;background:rgba(255,91,91,0.12);color:#ff5b5b;border:1px solid rgba(255,91,91,0.3);border-radius:8px;cursor:pointer;font-size:12px;min-height:40px">🗑 Vider historique</button>
        </div>
      </section>

      <section style="margin-bottom:16px">
        <h2 style="margin:0 0 10px;font-size:14px;color:#8bb4ff">🧪 Tests fonctionnels (${n.length})</h2>
        ${n.length===0?'<div style="color:rgba(255,255,255,0.5);font-size:12px;padding:14px;text-align:center">Aucun test fonctionnel encore. Lance via Settings ou bouton ci-dessus.</div>':n.map(y).join("")}
      </section>

      <section>
        <h2 style="margin:0 0 10px;font-size:14px;color:#c97aff">📐 Layout scans (${i.length})</h2>
        ${i.length===0?'<div style="color:rgba(255,255,255,0.5);font-size:12px;padding:14px;text-align:center">Aucun bug layout détecté. Auto-monitor tourne chaque 30s.</div>':i.map(m).join("")}
      </section>
    </div>
  `,t.querySelector("#ax-audits-run-functional")?.addEventListener("click",()=>{(async()=>{const r=t.querySelector("#ax-audits-run-functional");r&&(r.disabled=!0);try{const{apexFunctionalTester:u}=await b(async()=>{const{apexFunctionalTester:f}=await import("./apex-functional-tester-Bv8_pKiz.js");return{apexFunctionalTester:f}},__vite__mapDeps([0,1,2]),import.meta.url),l=await u.testAndAutoFix({maxButtons:30});p.recordFunctional(l.before,l.fixes,l.after,l.improvement),x(t)}catch{}r&&(r.disabled=!1)})()}),t.querySelector("#ax-audits-run-layout")?.addEventListener("click",()=>{(async()=>{try{const{apexLayoutInspector:r}=await b(async()=>{const{apexLayoutInspector:l}=await import("./apex-layout-inspector-Dj2CYzrv.js");return{apexLayoutInspector:l}},__vite__mapDeps([0,1,2]),import.meta.url),u=r.scanDom();p.recordLayout(u),x(t)}catch{}})()}),t.querySelector("#ax-audits-clear")?.addEventListener("click",()=>{confirm("Vider tout l'historique des audits ?")&&(p.clearHistory(),x(t))})}export{x as render};
