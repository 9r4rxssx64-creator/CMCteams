import{C as r,q as s}from"./monitoring-R6_kBcE7.js";import{g as t}from"./apex-tools-dispatch-core-ZfdoIE-H.js";import"./multi-source-analyze-XlVpTFLz.js";import"./apex-kb-0sanZVD_.js";import"./credential-patterns-CLzI061R.js";import"./apex-tools-dispatch-skills-Dh_ZxzbQ.js";import"./apex-tools-dispatch-data-rCsAnzSr.js";import"./apex-tools-dispatch-finance-DoRAfEZC.js";import"./apex-tools-dispatch-misc-BE1GVz_r.js";import"./apex-tools-misc-W6algOoR.js";import"./apex-tools-registry-core-CQvgkOQw.js";import"./apex-tools-registry-skills-DRX4PPQ_.js";function h(e){const a=r.get("user")?.id??"anon";t("module.crypto",e,a)&&(e.innerHTML=`
    <div class="ax-page ax-gs-368">
      <h1 class="ax-gs-369">₿ Crypto</h1>
      <p class="ax-gs-226">Suivi adresses publiques BTC/ETH (lecture seule, jamais de seed phrase).</p>

      <div class="ax-gs-130">
        <h2 class="ax-gs-370">Bitcoin</h2>
        <label for="ax-crypto-btc" class="sr-only">Adresse Bitcoin (commence par bc1)</label>
        <input type="text" id="ax-crypto-btc" placeholder="bc1q..." aria-label="Adresse publique Bitcoin (commence par bc1 ou 1 ou 3)" class="ax-gs-371">
        <button class="ax-btn ax-btn-primary ax-btn-sm ax-gs-186" id="ax-crypto-btc-add">Ajouter adresse</button>
      </div>

      <div class="ax-gs-131">
        <h2 class="ax-gs-370">Ethereum</h2>
        <label for="ax-crypto-eth" class="sr-only">Adresse Ethereum (commence par 0x)</label>
        <input type="text" id="ax-crypto-eth" placeholder="0x..." aria-label="Adresse publique Ethereum (commence par 0x)" class="ax-gs-371">
        <button class="ax-btn ax-btn-primary ax-btn-sm ax-gs-186" id="ax-crypto-eth-add">Ajouter adresse</button>
      </div>

      <div style="background:rgba(255,170,0,0.1);border:1px solid rgba(255,170,0,0.3);border-radius:8px;padding:12px;margin-top:12px;font-size:13px;color:#ffaa00">
        ⚠️ Apex ne stocke JAMAIS de seed phrase ni private key. Hardware wallet obligatoire.
      </div>

      <p class="ax-gs-212"><a href="#chat" class="ax-gs-198">← Retour chat</a></p>
    </div>
  `,s.info("feature-crypto","rendered"))}export{h as render};
