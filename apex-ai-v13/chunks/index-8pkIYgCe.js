import{l,s as v}from"../core/main-D4zwvifF.js";const m=50,h=[0,5.5,10,20],y="ax_invoices_";function s(i){return i.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}function p(i){return`${y}${i}`}function F(i){return h.includes(i)}function u(i){return!Number.isFinite(i.quantity)||!Number.isFinite(i.unitPriceHT)?0:Math.max(0,i.quantity*i.unitPriceHT)}function x(i){return u(i)*(i.tvaRate/100)}function I(i){return u(i)+x(i)}function b(i){let e=0,n=0;const t={};for(const a of i){const r=u(a),o=x(a);e+=r,n+=o;const c=String(a.tvaRate);t[c]=(t[c]??0)+o}return{ht:Math.round(e*100)/100,tva:Math.round(n*100)/100,ttc:Math.round((e+n)*100)/100,tvaByRate:t}}function S(i,e){const n=new Date,t=n.getFullYear(),a=String(n.getMonth()+1).padStart(2,"0"),r=String(e+1).padStart(3,"0");return`${i==="devis"?"DEV":i==="relance"?"REL":"FACT"}-${t}-${a}-${r}`}function D(i){const e=i.replace(/\s/g,"");if(!/^\d{14}$/.test(e))return!1;let n=0;for(let t=0;t<14;t++){let a=parseInt(e[t]??"0",10);t%2===0&&(a*=2,a>9&&(a-=9)),n+=a}return n%10===0}function g(){return{id:`line_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,description:"",quantity:1,unitPriceHT:0,tvaRate:20}}function T(i,e=0){const n=new Date().toISOString().slice(0,10),t=new Date(Date.now()+30*864e5).toISOString().slice(0,10);return{id:`inv_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,type:i,number:S(i,e),date:n,dueDate:t,client:{nom:"",adresse:"",siret:"",email:""},emetteur:{nom:"",adresse:"",siret:"",iban:""},lines:[g()],notes:""}}class ${load(e){if(!e)return[];try{const n=localStorage.getItem(p(e));if(!n)return[];const t=JSON.parse(n);return Array.isArray(t)?t.filter(a=>!!a&&typeof a=="object"):[]}catch(n){return l.warn("studio-invoice","load failed",{err:n}),[]}}save(e,n){if(!e)return!1;try{return localStorage.setItem(p(e),JSON.stringify(n)),!0}catch(t){return l.warn("studio-invoice","save failed (quota?)",{err:t}),!1}}create(e,n){if(!e)return null;const t=this.load(e),a=T(n,t.length);return t.push(a),this.save(e,t)?a:null}remove(e,n){if(!e)return!1;const t=this.load(e).filter(a=>a.id!==n);return this.save(e,t)}update(e,n,t){if(!e)return!1;const a=this.load(e),r=a.findIndex(c=>c.id===n);if(r===-1)return!1;const o=a[r];return o?(a[r]={...o,...t},this.save(e,a)):!1}addLine(e,n){const t=this.load(e),a=t.find(r=>r.id===n);return!a||a.lines.length>=m?!1:(a.lines.push(g()),this.save(e,t))}count(e){return this.load(e).length}}const d=new $;function f(i){const n=v.get("user")?.id??"anon",t=d.load(n),a=t.length>0?t.map(r=>{const o=b(r.lines);return`
        <div class="ax-invoice-card" data-invoice-id="${s(r.id)}" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:10px">
          <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <strong style="color:#c9a227">${s(r.number)} (${s(r.type)})</strong>
            <span style="font-size:12px;color:var(--ax-text-dim)">${s(r.date)}</span>
          </header>
          <div style="font-size:13px;color:var(--ax-text-dim);margin-bottom:6px">Client : ${s(r.client.nom||"—")}</div>
          <div style="font-size:13px">Total HT : <strong>${o.ht.toFixed(2)} €</strong> · TVA : ${o.tva.toFixed(2)} € · TTC : <strong style="color:#c9a227">${o.ttc.toFixed(2)} €</strong></div>
          <div style="display:flex;gap:6px;margin-top:8px">
            <button class="ax-btn ax-btn-sm" data-action="export" data-invoice-id="${s(r.id)}" style="font-size:11px;padding:6px 10px;min-height:36px">💾 PDF</button>
            <button class="ax-btn ax-btn-sm" data-action="remove" data-invoice-id="${s(r.id)}" style="font-size:11px;padding:6px 10px;color:#ff6666;min-height:36px">Supprimer</button>
          </div>
        </div>
      `}).join(""):'<p style="color:var(--ax-text-dim);text-align:center;padding:24px">Aucune facture. Crée la première !</p>';i.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:760px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;color:#c9a227">🧾 Studio Facture</h1>
        <span style="color:var(--ax-text-dim);font-size:13px">${t.length} document${t.length>1?"s":""}</span>
      </header>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <p style="margin:0 0 8px 0;font-size:13px;color:var(--ax-text-dim)">Devis, factures, relances. TVA FR (5.5%, 10%, 20%). Export PDF.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="ax-btn ax-btn-primary" data-create="devis" style="min-height:44px">📋 Nouveau devis</button>
          <button class="ax-btn ax-btn-primary" data-create="facture" style="min-height:44px">🧾 Nouvelle facture</button>
          <button class="ax-btn" data-create="relance" style="min-height:44px">📨 Relance</button>
        </div>
      </div>

      <div id="ax-invoices-list">${a}</div>

      <p style="margin-top:24px;text-align:center"><a href="#studios" style="color:#c9a227">← Retour studios</a></p>
    </div>
  `,w(i,n)}function w(i,e){i.querySelectorAll("[data-create]").forEach(n=>{n.addEventListener("click",()=>{const t=n.dataset.create,a=d.create(e,t);a&&(l.info("studio-invoice","created",{type:t,id:a.id}),f(i))})}),i.querySelectorAll('[data-action="remove"]').forEach(n=>{n.addEventListener("click",()=>{const t=n.dataset.invoiceId;t&&d.remove(e,t)&&f(i)})}),i.querySelectorAll('[data-action="export"]').forEach(n=>{n.addEventListener("click",()=>{const t=n.dataset.invoiceId;t&&l.info("studio-invoice","export PDF requested",{id:t})})})}export{m as MAX_LINES,y as STORAGE_PREFIX,h as TVA_RATES,x as calcLineTVA,u as calcLineTotalHT,I as calcLineTotalTTC,b as calcTotals,T as createInvoice,g as createLine,s as escapeHtml,S as generateInvoiceNumber,p as getStorageKey,d as invoiceStudioStore,D as isValidSiret,F as isValidTVARate,f as render};
//# sourceMappingURL=index-8pkIYgCe.js.map
