import{c as v}from"./listener-cleanup-Y2rGGxxX.js";import{l as b}from"./monitoring-3uBGKGRH.js";import{s as m}from"../core/main-CIt4vIMw.js";import{autoBackup as s}from"./auto-backup-Dbz5cfb2.js";import{g as k}from"./apex-tools-dispatch-368agi0_.js";import{haptic as c}from"./haptic-CQFg2PXZ.js";import{toast as n}from"./toast-ClsF1KRZ.js";import"./apex-kb-5SWR5BEE.js";import"./credential-patterns-guxfirLX.js";import"./multi-source-analyze-CQ2NlCmq.js";import"./apex-tools-registry-P84xCoHV.js";import"./voice-D7ldjTDe.js";let i=null;function Q(){i?.cleanup(),i=null}function d(t){return t.replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r]??r)}function f(t){return t<1024?t+" B":t<1024*1024?(t/1024).toFixed(1)+" KB":(t/(1024*1024)).toFixed(2)+" MB"}function y(t){const r=new Date(t),e=a=>a.toString().padStart(2,"0");return`${e(r.getDate())}/${e(r.getMonth()+1)}/${r.getFullYear()} ${e(r.getHours())}:${e(r.getMinutes())}`}const w={manual:"💾 Manuel",daily:"📅 Quotidien",weekly:"🌐 Hebdo","pre-rollback":"↩ Pre-rollback"};function _(t){const r=w[t]??t;return`<span style="padding:2px 6px;border-radius:4px;background:rgba(201,162,39,0.15);color:#c9a227;font-size:11px;font-weight:600">${d(r)}</span>`}function V(){}function z(t){const r=t.last_backup_age_h<0?"Jamais":t.last_backup_age_h===0?"< 1h":`${t.last_backup_age_h}h`,e=t.last_backup_age_h<0||t.last_backup_age_h>48?"#ff6666":t.last_backup_age_h>26?"#ffa500":"#22c55e",a=t.integrity_ok?"#22c55e":"#ff6666",o=t.integrity_ok?"✓ OK":"⚠ Cassée",p=s.isQuotaCritical()?'<span style="margin-left:10px;padding:3px 8px;background:rgba(255,165,0,0.15);color:#ffa500;border-radius:4px;font-size:11px">⚠ Quota localStorage > 4 MB</span>':"";return`
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;padding:14px;background:rgba(20,20,35,0.5);border:1px solid rgba(201,162,39,0.2);border-radius:12px;margin-bottom:14px">
      <div>
        <div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px">Backups</div>
        <div style="color:#c9a227;font-size:24px;font-weight:700">${t.total_backups}</div>
      </div>
      <div>
        <div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px">Taille totale</div>
        <div style="color:#fff;font-size:18px;font-weight:600">${f(t.total_size_bytes)}</div>
      </div>
      <div>
        <div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px">Dernière backup</div>
        <div style="color:${e};font-size:18px;font-weight:600">${r}</div>
      </div>
      <div>
        <div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px">Intégrité</div>
        <div style="color:${a};font-size:18px;font-weight:600">${o}</div>
      </div>
    </div>
    ${p?'<div style="padding:8px 14px;background:rgba(255,165,0,0.1);border:1px solid rgba(255,165,0,0.3);border-radius:8px;margin-bottom:10px">'+p+"</div>":""}
  `}function $(){return`
    <header style="display:flex;align-items:center;flex-wrap:wrap;gap:10px;padding:14px;background:rgba(20,20,35,0.95);border-bottom:1px solid rgba(201,162,39,0.3);position:sticky;top:0;z-index:10">
      <h1 style="margin:0;color:#c9a227;font-size:18px;flex:1;min-width:160px">💾 Backups Auto 24/7</h1>
      <button class="ax-btn" data-action="snapshot-now"
        style="padding:8px 14px;background:#c9a227;color:#000;border:none;border-radius:6px;cursor:pointer;font-weight:600;font-size:13px;min-height:40px">
        💾 Snapshot maintenant
      </button>
      <button class="ax-btn" data-action="export-config"
        style="padding:8px 14px;background:transparent;border:1px solid rgba(201,162,39,0.4);color:#c9a227;border-radius:6px;cursor:pointer;font-size:12px;min-height:40px">
        📤 Exporter Coffre
      </button>
      <button class="ax-btn" data-action="import-config"
        style="padding:8px 14px;background:transparent;border:1px solid rgba(201,162,39,0.4);color:#c9a227;border-radius:6px;cursor:pointer;font-size:12px;min-height:40px">
        📥 Importer Coffre
      </button>
      <button class="ax-btn" data-action="cleanup-now"
        style="padding:8px 14px;background:transparent;border:1px solid rgba(255,100,100,0.3);color:#ff6666;border-radius:6px;cursor:pointer;font-size:12px;min-height:40px">
        🧹 Cleanup
      </button>
    </header>
  `}function B(t){const r=d(t.id),e=d(t.type),a=y(t.ts),o=f(t.size_bytes),p=t.hash.slice(0,12);return`
    <tr data-backup-id="${r}" style="border-bottom:1px solid rgba(201,162,39,0.1)">
      <td style="padding:10px;color:#fff;font-size:13px">${d(a)}</td>
      <td style="padding:10px">${_(e)}</td>
      <td style="padding:10px;color:#999;font-size:12px">${d(o)}</td>
      <td style="padding:10px;color:#666;font-size:11px;font-family:monospace">${d(p)}…</td>
      <td style="padding:10px;text-align:right">
        <button data-view="${r}"
          style="padding:6px 10px;background:transparent;border:1px solid rgba(201,162,39,0.3);color:#c9a227;border-radius:4px;cursor:pointer;font-size:11px;margin-right:4px"
          title="Voir contenu">🔍</button>
        <button data-restore="${r}"
          style="padding:6px 10px;background:rgba(201,162,39,0.15);border:1px solid #c9a227;color:#c9a227;border-radius:4px;cursor:pointer;font-size:11px;margin-right:4px"
          title="Restaurer">↩</button>
        <button data-delete="${r}"
          style="padding:6px 10px;background:transparent;border:1px solid rgba(255,100,100,0.3);color:#ff6666;border-radius:4px;cursor:pointer;font-size:11px"
          title="Supprimer">🗑</button>
      </td>
    </tr>
  `}function C(t){return t.length===0?`
      <div style="padding:40px;text-align:center;color:#888;background:rgba(20,20,35,0.5);border:1px solid rgba(201,162,39,0.2);border-radius:12px">
        <p style="margin:0 0 14px;font-size:14px">Aucun backup pour l'instant.</p>
        <p style="margin:0;font-size:12px;color:#666">Clique sur "💾 Snapshot maintenant" pour créer ton premier backup,<br>ou attends 3h UTC pour le snapshot quotidien automatique.</p>
      </div>
    `:`
    <div style="background:rgba(20,20,35,0.5);border:1px solid rgba(201,162,39,0.2);border-radius:12px;overflow:hidden">
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:rgba(201,162,39,0.08);border-bottom:1px solid rgba(201,162,39,0.3)">
            <th style="padding:10px;text-align:left;color:#c9a227;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Date</th>
            <th style="padding:10px;text-align:left;color:#c9a227;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Type</th>
            <th style="padding:10px;text-align:left;color:#c9a227;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Taille</th>
            <th style="padding:10px;text-align:left;color:#c9a227;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Hash</th>
            <th style="padding:10px;text-align:right;color:#c9a227;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Actions</th>
          </tr>
        </thead>
        <tbody>${t.map(B).join("")}</tbody>
      </table>
    </div>
  `}function S(t){const r=Object.keys(t.data.vault).length+Object.keys(t.data.settings).length+t.data.audit_log.length+t.data.persistent_memory.length,e={id:t.id,type:t.type,ts:y(t.ts),size:f(t.size_bytes),hash:t.hash,encrypted:t.encrypted,vault_keys:Object.keys(t.data.vault).length,settings_keys:Object.keys(t.data.settings).length,audit_log_count:t.data.audit_log.length,persistent_memory_count:t.data.persistent_memory.length,feature_toggles_count:Object.keys(t.data.feature_toggles).length,user_profile_count:Object.keys(t.data.user_profile).length,voice_prints_count:Object.keys(t.data.voice_prints).length,total_keys_in_data:r},a=JSON.stringify(e,null,2);return`
    <div id="ax-backup-modal" role="dialog" aria-modal="true"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px">
      <div style="max-width:600px;width:100%;background:#0a0a14;border:1px solid rgba(201,162,39,0.4);border-radius:14px;overflow:hidden">
        <header style="padding:14px;border-bottom:1px solid rgba(201,162,39,0.3);display:flex;justify-content:space-between;align-items:center">
          <h3 style="margin:0;color:#c9a227;font-size:15px">🔍 ${d(t.id)}</h3>
          <button data-action="modal-close"
            style="padding:6px 10px;background:transparent;border:1px solid rgba(255,255,255,0.2);color:#999;border-radius:6px;cursor:pointer">✕</button>
        </header>
        <div style="max-height:60vh;overflow-y:auto;padding:14px">
          <pre style="margin:0;color:#a0a4c0;font-size:12px;white-space:pre-wrap;font-family:monospace">${d(a)}</pre>
          <p style="margin-top:14px;color:#666;font-size:11px">Le contenu chiffré n'est jamais affiché en clair pour ta sécurité.</p>
        </div>
        <footer style="padding:10px 14px;background:rgba(201,162,39,0.05);font-size:11px;color:#888;text-align:center">
          Hash SHA-256 : ${d(t.hash)}
        </footer>
      </div>
    </div>
  `}function A(){return`
    <div id="ax-backup-modal" role="dialog" aria-modal="true"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px">
      <div style="max-width:520px;width:100%;background:#0a0a14;border:1px solid rgba(201,162,39,0.4);border-radius:14px;overflow:hidden">
        <header style="padding:14px;border-bottom:1px solid rgba(201,162,39,0.3);display:flex;justify-content:space-between;align-items:center">
          <h3 style="margin:0;color:#c9a227;font-size:15px">📥 Importer un Coffre</h3>
          <button data-action="modal-close"
            style="padding:6px 10px;background:transparent;border:1px solid rgba(255,255,255,0.2);color:#999;border-radius:6px;cursor:pointer">✕</button>
        </header>
        <div style="padding:14px">
          <p style="color:#a0a4c0;font-size:13px;margin-top:0">Colle le contenu du fichier coffre exporté précédemment :</p>
          <textarea id="ax-backup-import-data" rows="8" placeholder="Coffre encodé base64..."
            style="width:100%;padding:10px;background:rgba(20,20,35,0.8);border:1px solid rgba(201,162,39,0.3);color:#fff;border-radius:6px;font-family:monospace;font-size:11px;resize:vertical"></textarea>
          <p style="color:#888;font-size:11px;margin-top:10px">⚠ L'import écrase l'état actuel. Un backup pre-rollback automatique est créé avant.</p>
        </div>
        <footer style="padding:10px 14px;background:rgba(201,162,39,0.05);display:flex;justify-content:flex-end;gap:8px">
          <button data-action="modal-close"
            style="padding:8px 14px;background:transparent;border:1px solid rgba(255,255,255,0.2);color:#999;border-radius:6px;cursor:pointer;font-size:12px">Annuler</button>
          <button data-action="import-confirm"
            style="padding:8px 14px;background:#c9a227;border:none;color:#000;border-radius:6px;cursor:pointer;font-weight:600;font-size:12px">Importer</button>
        </footer>
      </div>
    </div>
  `}function g(t){if(i?.cleanup(),i=v("admin-backup"),!m.get("isAdmin")){t.innerHTML=`
      <div class="ax-empty" style="padding:40px;text-align:center;color:#999">
        <h2 style="color:#c9a227">Accès réservé</h2>
        <p>Cette section est réservée à l'admin Kevin.</p>
      </div>
    `;return}const e=m.get("user")?.id??"anon";if(!k("sentinel.backup-watch",t,e))return;s.init();const a=s.getStats(),o=s.list();t.innerHTML=`
    <div class="ax-admin-backup" style="background:#0a0a14;color:#fff;min-height:100vh;font-family:system-ui,-apple-system,sans-serif">
      ${$()}
      <main style="padding:14px;max-width:1000px;margin:0 auto">
        ${z(a)}
        ${C(o)}
        <p style="margin-top:14px;color:#666;font-size:11px;text-align:center">
          Backups stockés en triple : localStorage + IndexedDB + Firebase chiffré (weekly).<br>
          Cycle : quotidien 3h UTC + hebdo dimanche 4h UTC + manuel admin · Rolling FIFO 30 jours.
        </p>
      </main>
    </div>
  `,q(t)}function q(t){t.querySelectorAll('[data-action="snapshot-now"]').forEach(r=>{i.bind(r,"click",()=>{(async()=>{c.tap();try{const e=await s.snapshot("manual");n.success(`Backup ${e.id} créé (${(e.size_bytes/1024).toFixed(1)} KB)`),g(t)}catch(e){b.warn("admin-backup","snapshot failed",{err:e}),n.error("Erreur backup : "+(e instanceof Error?e.message:"fail"))}})()})}),t.querySelectorAll('[data-action="export-config"]').forEach(r=>{i.bind(r,"click",()=>{(async()=>{c.tap();try{const e=await s.export();navigator.clipboard?(await navigator.clipboard.writeText(e),n.success("Coffre copié dans le presse-papier")):(b.info("admin-backup","export config (no clipboard)",{length:e.length}),n.info("Coffre exporté (voir console)"))}catch(e){n.error("Erreur export : "+(e instanceof Error?e.message:"fail"))}})()})}),t.querySelectorAll('[data-action="import-config"]').forEach(r=>{i.bind(r,"click",()=>{c.tap(),M(t)})}),t.querySelectorAll('[data-action="cleanup-now"]').forEach(r=>{i.bind(r,"click",()=>{(async()=>{c.tap();try{const e=await s.cleanup();e.deleted>0?n.info(`${e.deleted} anciens backups supprimés`):n.info("Rien à nettoyer"),g(t)}catch(e){n.error("Erreur cleanup : "+(e instanceof Error?e.message:"fail"))}})()})}),t.querySelectorAll("[data-view]").forEach(r=>{i.bind(r,"click",()=>{const e=r.dataset.view;if(!e)return;c.tap();const a=s.get(e);if(!a){n.error("Backup introuvable");return}j(t,a)})}),t.querySelectorAll("[data-restore]").forEach(r=>{i.bind(r,"click",()=>{const e=r.dataset.restore;!e||!confirm(`Restaurer le backup ${e} ? Cette action écrase l'état actuel.

Un backup pre-rollback automatique sera créé avant.`)||(async()=>{c.warning();try{const o=await s.restore(e);o.ok?n.success(`Restauration OK — ${o.restored.length} clés restaurées`):n.warn(`Restauration partielle — ${o.restored.length} OK, ${o.errors?.length??0} erreurs`),g(t)}catch(o){n.error("Erreur restore : "+(o instanceof Error?o.message:"fail"))}})()})}),t.querySelectorAll("[data-delete]").forEach(r=>{i.bind(r,"click",()=>{const e=r.dataset.delete;if(!e||!confirm(`Supprimer définitivement le backup ${e} ?`))return;c.warning(),s.delete(e)?(n.info("Backup supprimé"),g(t)):n.error("Erreur suppression")})})}function j(t,r){l();const e=document.createElement("div");e.innerHTML=S(r);const a=e.firstElementChild;a&&(document.body.appendChild(a),i.bind(a,"click",o=>{const p=o.target;if(p===a){l();return}p.closest('[data-action="modal-close"]')&&l()}))}function M(t){l();const r=document.createElement("div");r.innerHTML=A();const e=r.firstElementChild;e&&(document.body.appendChild(e),i.bind(e,"click",a=>{const o=a.target;if(o===e){l();return}if(o.closest('[data-action="modal-close"]')){l();return}if(o.closest('[data-action="import-confirm"]')){const x=e.querySelector("#ax-backup-import-data")?.value.trim()??"";if(!x){n.warn("Coffre vide");return}(async()=>{c.warning();try{const u=await s.import(x);u.ok?n.success(`Import OK — ${u.restored.length} clés restaurées`):n.warn(`Import partiel — ${u.errors?.[0]??"fail"}`),l(),g(t)}catch(u){n.error("Erreur import : "+(u instanceof Error?u.message:"fail"))}})()}}))}function l(){const t=document.getElementById("ax-backup-modal");t&&t.parentNode&&t.parentNode.removeChild(t)}export{V as _resetState,Q as dispose,g as render};
