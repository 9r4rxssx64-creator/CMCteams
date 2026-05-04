import{l as n}from"../core/main-DfrxuvLS.js";function d(r){const a=localStorage.getItem("apex_v13_browser_last_url")??"https://www.google.com";r.innerHTML=`
    <div class="ax-page" style="padding:0;display:flex;flex-direction:column;height:100vh">
      <div style="padding:8px;background:rgba(20,20,35,0.95);border-bottom:1px solid rgba(201,162,39,0.3);display:flex;gap:6px;align-items:center">
        <a href="#chat" style="color:#c9a227;text-decoration:none;padding:6px 10px;border-radius:6px;background:rgba(201,162,39,0.1)">← Chat</a>
        <input type="url" id="ax-browser-url" value="${a.replace(/"/g,"&quot;")}" style="flex:1;padding:8px;border-radius:6px;background:rgba(255,255,255,0.05);border:1px solid rgba(201,162,39,0.3);color:#fff;font-size:14px">
        <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-browser-go">Go</button>
      </div>
      <iframe id="ax-browser-iframe" src="${a.replace(/"/g,"&quot;")}"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        style="flex:1;border:none;background:#fff"></iframe>
    </div>
  `;const o=r.querySelector("#ax-browser-iframe"),t=r.querySelector("#ax-browser-url"),l=r.querySelector("#ax-browser-go"),s=()=>{let e=t?.value.trim()??"";e&&(e.startsWith("http")||(e="https://"+e),localStorage.setItem("apex_v13_browser_last_url",e),o&&(o.src=e))};l?.addEventListener("click",s),t?.addEventListener("keydown",e=>{e.key==="Enter"&&s()}),n.info("feature-browser","rendered")}export{d as render};
//# sourceMappingURL=index-Cnf8nD1M.js.map
