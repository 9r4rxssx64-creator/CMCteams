import{l as d}from"../core/main-DP3eEiok.js";const e={codes:{civil:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070721/",penal:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070719/",travail:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006072050/",commerce:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000005634379/",consommation:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006069565/",secu_sociale:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006073189/",sante:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006072665/",impots:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006069577/",urbanisme:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006074075/",environnement:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006074220/",education:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006071191/",transports:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000023086525/",procedure_civile:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070716/",procedure_penale:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006071154/",justice_admin:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070933/",propriete_intellectuelle:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006069414/",monetaire_financier:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006072026/",general_collectivites:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070633/"},jurisprudence:{cassation:"https://www.courdecassation.fr/recherche-judilibre",conseil_etat:"https://www.conseil-etat.fr/decisions",conseil_constitutionnel:"https://www.conseil-constitutionnel.fr/decisions",cjue:"https://curia.europa.eu/juris/recherche.jsf",cedh:"https://hudoc.echr.coe.int/fre"},monaco:{constitution:"https://journaldemonaco.gouv.mc/Journaux/2002/Journal-7569/Constitution-de-la-Principaute-de-Monaco",legimonaco:"https://www.legimonaco.mc/"},organismes:{avocat_cnb:"https://www.avocat.fr",notaire:"https://www.notaires.fr",huissier:"https://www.huissier-justice.fr",cnil:"https://www.cnil.fr",defenseur:"https://www.defenseurdesdroits.fr",service_public:"https://www.service-public.fr"}};function n(t){return t.replace(/[&<>"']/g,i=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[i]??i)}function p(t){const i=String(t||"").toLowerCase().trim(),a=e.codes[i];return a||`https://www.legifrance.gouv.fr/search/all?searchField=ALL&query=${encodeURIComponent(t)}`}function u(t,i){const a=String(t||"cassation").toLowerCase();return`${e.jurisprudence[a]??e.jurisprudence.cassation??""}?search=${encodeURIComponent(i)}`}function x(){return Object.keys(e.codes).map(t=>({key:t,label:t.replace(/_/g," "),url:e.codes[t]??""}))}function b(t){const i=Object.keys(e.codes).map(r=>{const o=e.codes[r]??"";return`<a href="${n(o)}" target="_blank" rel="noopener" style="display:block;padding:9px 12px;color:#5aa8ff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.06);transition:background 0.15s" onmouseover="this.style.background='rgba(90,168,255,0.1)'" onmouseout="this.style.background=''">📜 Code ${n(r.replace(/_/g," "))}</a>`}).join(""),a=Object.keys(e.jurisprudence).map(r=>{const o=e.jurisprudence[r]??"";return`<a href="${n(o)}" target="_blank" rel="noopener" style="display:block;padding:9px 12px;color:#5aa8ff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.06)">🔍 ${n(r.replace(/_/g," "))}</a>`}).join(""),c=Object.keys(e.monaco).map(r=>{const o=e.monaco[r]??"";return`<a href="${n(o)}" target="_blank" rel="noopener" style="display:block;padding:9px 12px;color:#5aa8ff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.06)">${n(r.replace(/_/g," "))}</a>`}).join(""),l=Object.keys(e.organismes).map(r=>{const o=e.organismes[r]??"";return`<a href="${n(o)}" target="_blank" rel="noopener" style="display:block;padding:9px 12px;color:#5aa8ff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.06)">${n(r.replace(/_/g," "))}</a>`}).join("");t.innerHTML=`
    <div style="padding:16px;max-width:900px;margin:0 auto;color:var(--ax-text,#eee)">
      <h2 style="background:linear-gradient(135deg,#c9a227,#e8b830);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-size:28px;margin-bottom:8px">⚖ Bibliothèque juridique FR + Monaco</h2>
      <p style="color:var(--ax-text-dim,#999);font-size:13px;margin-bottom:16px">Liens directs Légifrance, jurisprudence (Cassation, CE, CJUE, CEDH), Monaco et organismes officiels</p>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">🔎 Recherche article / code</h3>
        <input id="legalQ" type="text" placeholder="Ex: code civil, article 1240, RGPD..." style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;min-height:44px" aria-label="Recherche juridique">
        <button id="legalSearchBtn" type="button" style="width:100%;margin-top:8px;padding:12px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:0;border-radius:8px;font-weight:700;cursor:pointer;min-height:44px">Rechercher sur Légifrance</button>
        <div id="legalResult" style="margin-top:10px;font-size:13px"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">📚 Codes français (${Object.keys(e.codes).length})</h3>
        <div style="max-height:340px;overflow-y:auto">${i}</div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">⚖ Jurisprudence (${Object.keys(e.jurisprudence).length})</h3>
        ${a}
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">🇲🇨 Monaco</h3>
        ${c}
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">🏛 Organismes officiels (${Object.keys(e.organismes).length})</h3>
        ${l}
      </div>

      <div style="margin-top:18px;padding:14px;background:rgba(255,165,0,0.08);border:1px solid rgba(255,165,0,0.3);border-radius:10px;font-size:12px;color:#ffd699;text-align:center">
        ⚠️ <strong>Information indicative uniquement</strong>. Pour décision juridique importante, consulter un avocat ou notaire qualifié.
      </div>
      <p style="margin-top:14px;text-align:center;font-size:11px;color:#666">Sources : Légifrance &middot; Légimonaco &middot; Cour de cassation &middot; Conseil d'État &middot; CJUE &middot; CEDH</p>
    </div>
  `,t.querySelector("#legalSearchBtn")?.addEventListener("click",()=>{const r=t.querySelector("#legalQ")?.value??"",o=t.querySelector("#legalResult");if(!o||!r)return;const s=p(r);o.innerHTML=`🔗 <a href="${n(s)}" target="_blank" rel="noopener" style="color:#5aa8ff">${n(s)}</a>`}),d.info("legal-pro","rendered")}export{e as AX_LEGAL_FR,u as jurisprudenceSearch,p as legalLookup,x as listCodes,b as render};
//# sourceMappingURL=index-UVNG94is.js.map
