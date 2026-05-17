import{l as a}from"./monitoring-DMtdadhB.js";import{i as t}from"../core/main-CUO2jjmv.js";import{g as o}from"./apex-tools-dispatch-core-CGAW8Vai.js";import"./apex-kb-BdO9xyva.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-oYazAI5o.js";import"./apex-tools-dispatch-skills-CpR1_932.js";import"./apex-tools-dispatch-data-cdldHliK.js";import"./apex-tools-dispatch-finance-DoRAfEZC.js";import"./apex-tools-dispatch-misc-B5rqXLOE.js";import"./apex-tools-misc-Dm0ymyjw.js";import"./apex-tools-registry-core-3xEquv0D.js";import"./apex-tools-registry-skills-DRX4PPQ_.js";import"./voice-BWK_t1lD.js";function h(r){const e=t.get("user")?.id??"anon";o("module.crypto",r,e)&&(r.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:600px;margin:0 auto">
      <h1 style="margin:0 0 16px;color:#c9a227">₿ Crypto</h1>
      <p style="color:var(--ax-text-dim)">Suivi adresses publiques BTC/ETH (lecture seule, jamais de seed phrase).</p>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;margin-top:16px">
        <h2 style="margin:0 0 12px;font-size:16px">Bitcoin</h2>
        <label for="ax-crypto-btc" class="sr-only">Adresse Bitcoin (commence par bc1)</label>
        <input type="text" id="ax-crypto-btc" placeholder="bc1q..." aria-label="Adresse publique Bitcoin (commence par bc1 ou 1 ou 3)" style="width:100%;padding:10px;border-radius:6px;background:rgba(255,255,255,0.05);border:1px solid rgba(201,162,39,0.3);color:#fff;font-family:monospace;font-size:13px">
        <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-crypto-btc-add" style="margin-top:8px">Ajouter adresse</button>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;margin-top:12px">
        <h2 style="margin:0 0 12px;font-size:16px">Ethereum</h2>
        <label for="ax-crypto-eth" class="sr-only">Adresse Ethereum (commence par 0x)</label>
        <input type="text" id="ax-crypto-eth" placeholder="0x..." aria-label="Adresse publique Ethereum (commence par 0x)" style="width:100%;padding:10px;border-radius:6px;background:rgba(255,255,255,0.05);border:1px solid rgba(201,162,39,0.3);color:#fff;font-family:monospace;font-size:13px">
        <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-crypto-eth-add" style="margin-top:8px">Ajouter adresse</button>
      </div>

      <div style="background:rgba(255,170,0,0.1);border:1px solid rgba(255,170,0,0.3);border-radius:8px;padding:12px;margin-top:12px;font-size:13px;color:#ffaa00">
        ⚠️ Apex ne stocke JAMAIS de seed phrase ni private key. Hardware wallet obligatoire.
      </div>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `,a.info("feature-crypto","rendered"))}export{h as render};
