function s(){if(typeof document>"u"||document.getElementById("ax-skeleton-styles"))return;const a=document.createElement("style");a.id="ax-skeleton-styles",a.textContent=`
    .ax-skel-shimmer {
      background: linear-gradient(90deg,
        rgba(255, 255, 255, 0.04) 0%,
        rgba(255, 255, 255, 0.10) 50%,
        rgba(255, 255, 255, 0.04) 100%);
      background-size: 200% 100%;
      animation: axSkelShimmer 1.4s ease-in-out infinite;
      border-radius: 6px;
    }
    @keyframes axSkelShimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .ax-skel-host {
      width: 100%;
      display: block;
    }
    .ax-skel-chat-msg {
      display: flex;
      gap: 12px;
      padding: 12px;
      align-items: flex-start;
    }
    .ax-skel-chat-msg__avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      flex: 0 0 auto;
    }
    .ax-skel-chat-msg__body { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .ax-skel-chat-msg__line { height: 12px; }
    .ax-skel-feat-list {
      display: flex; flex-direction: column; gap: 8px; padding: 8px;
    }
    .ax-skel-feat-list__item { height: 48px; }
    .ax-skel-vault-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px; padding: 12px;
    }
    .ax-skel-vault-cards__card { height: 96px; }
    .ax-skel-studio-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px; padding: 12px;
    }
    .ax-skel-studio-grid__tile { height: 120px; }
    .ax-skel-admin-table {
      display: flex; flex-direction: column; gap: 4px; padding: 8px;
    }
    .ax-skel-admin-table__row { height: 36px; }
    @media (prefers-reduced-motion: reduce) {
      .ax-skel-shimmer { animation: none; opacity: 0.45; }
    }
  `,document.head.appendChild(a)}function t(e,a){return e?(s(),e.innerHTML=i(a),e.classList.add("ax-skel-host"),e.setAttribute("aria-busy","true"),e.setAttribute("data-ax-skeleton",a),()=>{e.getAttribute("data-ax-skeleton")===a&&(e.classList.remove("ax-skel-host"),e.removeAttribute("aria-busy"),e.removeAttribute("data-ax-skeleton"),e.querySelector("[data-ax-skel-marker]")&&(e.innerHTML=""))}):()=>{}}function i(e){switch(e){case"chat-message":return Array.from({length:3},()=>`
        <div class="ax-skel-chat-msg" data-ax-skel-marker>
          <div class="ax-skel-chat-msg__avatar ax-skel-shimmer"></div>
          <div class="ax-skel-chat-msg__body">
            <div class="ax-skel-chat-msg__line ax-skel-shimmer" style="width:35%"></div>
            <div class="ax-skel-chat-msg__line ax-skel-shimmer" style="width:88%"></div>
            <div class="ax-skel-chat-msg__line ax-skel-shimmer" style="width:62%"></div>
          </div>
        </div>
      `).join("");case"feature-list":return`<div class="ax-skel-feat-list" data-ax-skel-marker>${Array.from({length:6},()=>'<div class="ax-skel-feat-list__item ax-skel-shimmer"></div>').join("")}</div>`;case"vault-cards":return`<div class="ax-skel-vault-cards" data-ax-skel-marker>${Array.from({length:6},()=>'<div class="ax-skel-vault-cards__card ax-skel-shimmer"></div>').join("")}</div>`;case"studio-grid":return`<div class="ax-skel-studio-grid" data-ax-skel-marker>${Array.from({length:8},()=>'<div class="ax-skel-studio-grid__tile ax-skel-shimmer"></div>').join("")}</div>`;case"admin-table":return`<div class="ax-skel-admin-table" data-ax-skel-marker>${Array.from({length:8},()=>'<div class="ax-skel-admin-table__row ax-skel-shimmer"></div>').join("")}</div>`;default:return""}}export{t as s};
