import{b as y,s as h,l,e as n}from"./monitoring-BfiYDXRZ.js";import{c as v}from"./listener-cleanup-Y2rGGxxX.js";import{g as A}from"./apex-tools-dispatch-core-DcNSXnVh.js";import{toast as o}from"./toast-BCPNzfMv.js";import"./multi-source-analyze-D8-rxT6b.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-DOqbRK5-.js";import"./apex-tools-dispatch-skills-CHIdvIat.js";import"./apex-tools-dispatch-data-BFaYy0nq.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-BM1rHYsM.js";import"./apex-tools-misc-fJuxoKq6.js";import"./apex-tools-registry-core-BMhHY4vU.js";import"./apex-tools-registry-skills-x-mAWYry.js";import"./haptic-CQFg2PXZ.js";const x=/^(bc1[a-z0-9]{20,80}|[13][a-km-zA-HJ-NP-Z1-9]{25,39})$/,m=/^0x[a-fA-F0-9]{40}$/;function U(e,t){return(e==="btc"?x:m).test(t.trim())}let d=null;function b(e){return`ax_crypto_addr_${e}`}function p(e){try{const t=localStorage.getItem(b(e));if(!t)return[];const s=JSON.parse(t);return Array.isArray(s)?s:[]}catch{return[]}}function f(e,t){try{localStorage.setItem(b(e),JSON.stringify(t))}catch(s){l.warn("feature-crypto","save failed",{e:String(s)})}}function u(e,t,s){const i=s.trim();if(!(t==="btc"?x:m).test(i))return o.error(t==="btc"?"Adresse Bitcoin invalide (bc1.../1.../3...)":"Adresse Ethereum invalide (0x + 40 hex)"),!1;const a=p(e);return a.some(g=>g.address.toLowerCase()===i.toLowerCase())?(o.warn("Adresse déjà suivie"),!1):(a.push({chain:t,address:i,ts:Date.now()}),f(e,a),o.success(`✅ Adresse ${t.toUpperCase()} ajoutée au suivi`),l.info("feature-crypto","address added",{chain:t}),!0)}function S(e,t){const s=p(e).filter(i=>i.address!==t);f(e,s),o.info("Adresse retirée du suivi")}function $(e){const t=p(e);return t.length===0?'<p style="color:var(--ax-text-dim);font-size:14px;margin:8px 0 0">Aucune adresse suivie. Ajoute une adresse publique ci-dessus.</p>':`<ul style="list-style:none;padding:0;margin:8px 0 0;display:flex;flex-direction:column;gap:8px">${t.map(s=>{const i=s.address.length>18?`${s.address.slice(0,10)}…${s.address.slice(-6)}`:s.address,r=s.chain==="btc"?`https://mempool.space/address/${encodeURIComponent(s.address)}`:`https://etherscan.io/address/${encodeURIComponent(s.address)}`;return`<li style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.04);border-radius:8px;padding:8px 12px">
        <span style="font-size:16px">${s.chain==="btc"?"₿":"Ξ"}</span>
        <a href="${n(r)}" target="_blank" rel="noopener" style="flex:1;font-family:monospace;font-size:13px;color:var(--ax-gold)" title="${n(s.address)}">${n(i)}</a>
        <button class="ax-btn ax-btn-sm" data-action="remove-addr" data-addr="${n(s.address)}" aria-label="Retirer ${n(i)}" style="min-height:44px;min-width:44px">🗑</button>
      </li>`}).join("")}</ul>`}function c(e){const t=y.get("user")?.id??"anon";if(!A("module.crypto",e,t))return;d?.cleanup(),d=v("crypto"),h(e,`
    <div class="ax-page ax-gs-368">
      <h1 class="ax-gs-369">₿ Crypto</h1>
      <p class="ax-gs-226">Suivi adresses publiques BTC/ETH (lecture seule, jamais de seed phrase).</p>

      <div class="ax-gs-130">
        <h2 class="ax-gs-370">Bitcoin</h2>
        <label for="ax-crypto-btc" class="sr-only">Adresse Bitcoin (commence par bc1)</label>
        <input type="text" id="ax-crypto-btc" placeholder="bc1q..." aria-label="Adresse publique Bitcoin (commence par bc1 ou 1 ou 3)" class="ax-gs-371">
        <button class="ax-btn ax-btn-primary ax-btn-sm ax-gs-186" id="ax-crypto-btc-add" style="min-height:44px">Ajouter adresse</button>
      </div>

      <div class="ax-gs-131">
        <h2 class="ax-gs-370">Ethereum</h2>
        <label for="ax-crypto-eth" class="sr-only">Adresse Ethereum (commence par 0x)</label>
        <input type="text" id="ax-crypto-eth" placeholder="0x..." aria-label="Adresse publique Ethereum (commence par 0x)" class="ax-gs-371">
        <button class="ax-btn ax-btn-primary ax-btn-sm ax-gs-186" id="ax-crypto-eth-add" style="min-height:44px">Ajouter adresse</button>
      </div>

      <div class="ax-gs-130">
        <h2 class="ax-gs-370">Adresses suivies</h2>
        <div id="ax-crypto-list">${$(t)}</div>
      </div>

      <div style="background:rgba(255,170,0,0.1);border:1px solid rgba(255,170,0,0.3);border-radius:8px;padding:12px;margin-top:12px;font-size:13px;color:#ffaa00">
        ⚠️ Apex ne stocke JAMAIS de seed phrase ni private key. Hardware wallet obligatoire.
      </div>

      <p class="ax-gs-212"><a href="#chat" class="ax-gs-198">← Retour chat</a></p>
    </div>
  `);const s=e.querySelector("#ax-crypto-btc-add");s&&d.bind(s,"click",()=>{const r=e.querySelector("#ax-crypto-btc"),a=r?.value??"";if(!a.trim()){o.warn("Saisis une adresse Bitcoin");return}u(t,"btc",a)&&(r&&(r.value=""),c(e))});const i=e.querySelector("#ax-crypto-eth-add");i&&d.bind(i,"click",()=>{const r=e.querySelector("#ax-crypto-eth"),a=r?.value??"";if(!a.trim()){o.warn("Saisis une adresse Ethereum");return}u(t,"eth",a)&&(r&&(r.value=""),c(e))}),e.querySelectorAll('[data-action="remove-addr"]').forEach(r=>{d.bind(r,"click",()=>{const a=r.getAttribute("data-addr")??"";a&&(S(t,a),c(e))})}),l.info("feature-crypto","rendered")}export{U as isValidCryptoAddress,c as render};
