import{c as M}from"./listener-cleanup-Y2rGGxxX.js";import{l as k}from"./monitoring-3uBGKGRH.js";import{s as z}from"../core/main-lZHhydY7.js";import{g as S}from"./apex-tools-dispatch-D4vev7lv.js";import{v as l}from"./voice-C6SQXIVv.js";import{haptic as C}from"./haptic-CQFg2PXZ.js";import{toast as u}from"./toast-ClsF1KRZ.js";import"./apex-kb-BfnoPN_c.js";import"./credential-patterns-qcw7Brjr.js";import"./multi-source-analyze-CRN19ywJ.js";import"./apex-tools-registry-C1hoQRKo.js";const A="kdmc_admin";let m=null;function Q(){m?.cleanup(),m=null}function $(e){return e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]??t)}function y(e){if(!e||e===0)return"—";const t=new Date(e),r=i=>i.toString().padStart(2,"0");return`${r(t.getDate())}/${r(t.getMonth()+1)}/${t.getFullYear()} ${r(t.getHours())}:${r(t.getMinutes())}`}function b(e){return Math.round(e*100)+"%"}function _(){const e=z.get("user");return!e||!e.id?null:{id:e.id,name:e.name??"",isAdmin:e.id===A}}function x(e,t,r,i){t&&e.bind(t,r,i)}function q(e){const t=Math.max(0,Math.min(1,e))*100,r=t>=85?"#22c55e":t>=50?"#ffa500":"#ff6666";return`
    <div style="background:rgba(40,40,55,0.5);border-radius:8px;height:18px;overflow:hidden;border:1px solid rgba(201,162,39,0.2)">
      <div style="height:100%;width:${t}%;background:linear-gradient(90deg,${r},${r}cc);transition:width .3s"></div>
    </div>
    <div style="font-size:11px;color:#aaa;margin-top:4px">${b(e)} fiabilité (${Math.round(t)}/100)</div>
  `}function D(e){const t=l.getPrintFor(e.id),r=l.needsCalibration(e.id),i=l.isExclusiveMode(),n=l.getPhaseDetails(e.id),p=l.isExclusiveAnticipated();if(!t)return`
      <div style="background:rgba(20,20,35,0.5);border:1px solid rgba(201,162,39,0.2);border-radius:12px;padding:18px;margin-bottom:14px">
        <h3 style="color:#c9a227;margin-top:0;margin-bottom:10px">🎙 Mon empreinte vocale</h3>
        <p style="color:#aaa;line-height:1.5">
          Apex apprend ta voix automatiquement au fur et à mesure des conversations.
          Au début il écoute tout le monde puis affine pour finir exclusif à toi.
        </p>
        <div style="background:rgba(201,162,39,0.08);border-left:3px solid #c9a227;padding:10px 14px;margin:14px 0;border-radius:6px;color:#ccc;font-size:13px;line-height:1.5">
          📚 <b>Phases d'apprentissage :</b><br/>
          🔓 <b>0–3 samples</b> — Ouvert : accepte toutes voix<br/>
          🟡 <b>4–9 samples</b> — Apprentissage : seuil 50%<br/>
          🟠 <b>10–19 samples</b> — Affinage : seuil 65%<br/>
          🟢 <b>≥ 20 samples</b> — Exclusif : seuil 85% (ignore les autres voix)
        </div>
        <p style="color:#aaa;font-size:13px">
          Tu peux aussi enrôler 3 échantillons rapides pour démarrer.
        </p>
        <button id="ax-vbio-enroll-start" style="margin-top:12px;padding:10px 18px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:0;border-radius:8px;font-weight:600;cursor:pointer;min-height:44px">
          🎙 Enrôler ma voix maintenant
        </button>
      </div>
    `;const s=t.confidence_score??0,o=t.samples_count,a=r.needs?`<div style="background:rgba(255,165,0,0.1);border:1px solid rgba(255,165,0,0.3);border-radius:8px;padding:10px 14px;margin:10px 0;color:#ffa500;font-size:13px">
         ⚠ <b>Calibration recommandée</b> — ${r.reason==="low_confidence"?"fiabilité < 85%":"dernière calibration > 30 jours"}.
         <button id="ax-vbio-recalibrate-banner" style="margin-left:8px;padding:6px 12px;background:#ffa500;color:#000;border:0;border-radius:6px;font-weight:600;cursor:pointer">Re-calibrer</button>
       </div>`:"",d=Math.round(n.progress*100),c=n.phase==="open"?"#9ca3af":n.phase==="learning"?"#facc15":n.phase==="refining"?"#fb923c":"#22c55e",g=n.samples_to_next>0?`<span style="color:#888;font-size:12px;margin-left:6px">(${n.samples_to_next} samples avant phase suivante)</span>`:'<span style="color:#22c55e;font-size:12px;margin-left:6px">(phase finale atteinte ✓)</span>',f=`
    <div style="background:rgba(15,15,28,0.5);border:1px solid ${c}33;border-radius:10px;padding:14px;margin:14px 0">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px">
        <div style="font-size:14px;color:#fff;font-weight:600">Apprentissage voix : ${o}/20 samples (${d}%)</div>
        <div style="background:${c}22;border:1px solid ${c}55;color:${c};font-size:12px;font-weight:700;padding:4px 10px;border-radius:14px">${$(n.label)}</div>
      </div>
      <div style="background:rgba(40,40,55,0.5);border-radius:8px;height:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.05)">
        <div style="height:100%;width:${Math.min(100,d)}%;background:linear-gradient(90deg,${c},${c}cc);transition:width .3s"></div>
      </div>
      <div style="font-size:12px;color:#aaa;margin-top:8px">
        Seuil actuel : <b>${Math.round(n.threshold*100)}%</b> de similarité requise${g}
      </div>
      ${p&&n.phase==="exclusive"&&o<20?'<div style="font-size:12px;color:#22c55e;margin-top:6px">⚡ Mode exclusif anticipé activé — phase exclusive forcée dès 10 samples</div>':""}
    </div>
  `;return`
    <div style="background:rgba(20,20,35,0.5);border:1px solid rgba(201,162,39,0.2);border-radius:12px;padding:18px;margin-bottom:14px">
      <h3 style="color:#c9a227;margin-top:0;margin-bottom:14px">🎙 Mon empreinte vocale</h3>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin-bottom:16px">
        <div>
          <div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:.5px">Échantillons</div>
          <div style="color:#fff;font-size:22px;font-weight:700">${o} <span style="font-size:13px;color:#888">/ 20</span></div>
        </div>
        <div>
          <div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:.5px">Score moyen</div>
          <div style="color:#fff;font-size:22px;font-weight:700">${b(t.match_score_avg)}</div>
        </div>
        <div>
          <div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:.5px">Dernière reconnaissance</div>
          <div style="color:#fff;font-size:14px;font-weight:600">${y(t.last_match)}</div>
        </div>
        <div>
          <div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:.5px">Enrôlée le</div>
          <div style="color:#fff;font-size:14px;font-weight:600">${y(t.enrolled_at)}</div>
        </div>
      </div>

      <div style="margin-bottom:14px">
        <div style="color:#888;font-size:12px;margin-bottom:6px">Fiabilité ("confidence"):</div>
        ${q(s)}
      </div>

      ${f}

      ${a}

      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px">
        <button id="ax-vbio-recalibrate" style="padding:10px 16px;background:rgba(201,162,39,0.15);color:#c9a227;border:1px solid rgba(201,162,39,0.3);border-radius:8px;font-weight:600;cursor:pointer;min-height:44px">
          🔄 Ré-enrôler ma voix
        </button>
        <button id="ax-vbio-delete" style="padding:10px 16px;background:rgba(255,102,102,0.15);color:#ff6666;border:1px solid rgba(255,102,102,0.3);border-radius:8px;font-weight:600;cursor:pointer;min-height:44px">
          🗑 Supprimer empreinte (RGPD)
        </button>
      </div>
    </div>

    <div style="background:rgba(20,20,35,0.5);border:1px solid rgba(201,162,39,0.2);border-radius:12px;padding:18px;margin-bottom:14px">
      <h3 style="color:#c9a227;margin-top:0;margin-bottom:10px">🔒 Mode exclusif</h3>
      <p style="color:#ccc;font-size:13px;line-height:1.5">
        Quand activé, Apex n'écoute QUE ta voix pour "Dis Apex". Ignore silencieusement
        les autres voix (entourage, bruit ambient) — anti-confusion.
      </p>
      <label style="display:flex;align-items:center;gap:10px;margin-top:10px;cursor:pointer">
        <input type="checkbox" id="ax-vbio-exclusive" aria-label="Activer mode reconnaissance vocale exclusive" ${i?"checked":""} style="width:20px;height:20px;cursor:pointer" />
        <span style="color:#fff;font-weight:600">Mode exclusif activé (recommandé)</span>
      </label>
      <label style="display:flex;align-items:center;gap:10px;margin-top:14px;cursor:pointer;padding:10px 12px;background:rgba(34,197,94,0.06);border:1px dashed rgba(34,197,94,0.25);border-radius:8px">
        <input type="checkbox" id="ax-vbio-exclusive-anticipated" aria-label="Mode exclusif anticipé après 10 samples" ${p?"checked":""} style="width:20px;height:20px;cursor:pointer" />
        <span style="color:#fff;font-weight:600">⚡ Mode exclusif anticipé</span>
      </label>
      <p style="color:#888;font-size:12px;line-height:1.4;margin:6px 0 0 32px">
        Si ON, Apex passe en phase exclusive (seuil 85%) dès 10 samples au lieu d'attendre 20.
        Plus rapide à devenir exclusif, mais moins de marge pour adapter.
      </p>
    </div>
  `}function P(e){if(!e.isAdmin)return"";const t=l.listPrints(),r=l.getStats(),i=l.getUnknownAttempts(),n=i.slice(-10).reverse(),p=t.map(o=>{const a=o.confidence_score??0;return`
        <tr style="border-top:1px solid rgba(255,255,255,0.05)">
          <td style="padding:8px 6px;color:#fff;font-weight:600">${$(o.uid)}${o.uid===A?" 👑":""}</td>
          <td style="padding:8px 6px;color:#aaa">${o.samples_count}</td>
          <td style="padding:8px 6px;color:${a>=.85?"#22c55e":a>=.5?"#ffa500":"#ff6666"}">${b(a)}</td>
          <td style="padding:8px 6px;color:#aaa;font-size:11px">${y(o.last_match)}</td>
          <td style="padding:8px 6px"><button data-uid="${$(o.uid)}" class="ax-vbio-admin-del" style="padding:4px 10px;background:rgba(255,102,102,0.15);color:#ff6666;border:1px solid rgba(255,102,102,0.3);border-radius:5px;font-size:11px;cursor:pointer">🗑</button></td>
        </tr>
      `}).join(""),s=n.map(o=>`
      <tr style="border-top:1px solid rgba(255,255,255,0.05)">
        <td style="padding:6px;color:#aaa;font-size:11px">${y(o.ts)}</td>
        <td style="padding:6px;color:#ff6666">${b(o.score)}</td>
        <td style="padding:6px;color:#aaa">${o.pitch} Hz</td>
        <td style="padding:6px;color:#aaa">${o.energy.toFixed(2)}</td>
      </tr>
    `).join("")||'<tr><td colspan="4" style="padding:14px;color:#666;text-align:center">Aucune tentative non reconnue récente</td></tr>';return`
    <div style="background:rgba(20,20,35,0.5);border:1px solid rgba(255,165,0,0.2);border-radius:12px;padding:18px;margin-bottom:14px">
      <h3 style="color:#ffa500;margin-top:0;margin-bottom:10px">👑 Vue admin Kevin</h3>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin-bottom:16px">
        <div>
          <div style="color:#888;font-size:11px;text-transform:uppercase">Voix enrôlées</div>
          <div style="color:#ffa500;font-size:22px;font-weight:700">${r.enrolled_count}</div>
        </div>
        <div>
          <div style="color:#888;font-size:11px;text-transform:uppercase">Total samples</div>
          <div style="color:#fff;font-size:22px;font-weight:700">${r.total_samples}</div>
        </div>
        <div>
          <div style="color:#888;font-size:11px;text-transform:uppercase">Score moyen global</div>
          <div style="color:#fff;font-size:22px;font-weight:700">${b(r.avg_match_score)}</div>
        </div>
        <div>
          <div style="color:#888;font-size:11px;text-transform:uppercase">Tentatives ignorées</div>
          <div style="color:#ff6666;font-size:22px;font-weight:700">${i.length}</div>
        </div>
      </div>

      <h4 style="color:#c9a227;margin:14px 0 8px">Voix enrôlées</h4>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="color:#888;font-size:11px;text-transform:uppercase">
              <th style="padding:8px 6px;text-align:left">User ID</th>
              <th style="padding:8px 6px;text-align:left">Samples</th>
              <th style="padding:8px 6px;text-align:left">Confidence</th>
              <th style="padding:8px 6px;text-align:left">Dernière reco</th>
              <th style="padding:8px 6px;text-align:left">Actions</th>
            </tr>
          </thead>
          <tbody>${p||'<tr><td colspan="5" style="padding:14px;color:#666;text-align:center">Aucune voix enrôlée</td></tr>'}</tbody>
        </table>
      </div>

      <h4 style="color:#c9a227;margin:18px 0 8px">Tentatives non reconnues (10 dernières)</h4>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="color:#888;font-size:11px;text-transform:uppercase">
              <th style="padding:6px;text-align:left">Date</th>
              <th style="padding:6px;text-align:left">Score similarity</th>
              <th style="padding:6px;text-align:left">Pitch</th>
              <th style="padding:6px;text-align:left">Energie</th>
            </tr>
          </thead>
          <tbody>${s}</tbody>
        </table>
      </div>

      <div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:8px">
        <button id="ax-vbio-clear-unknown" style="padding:8px 14px;background:rgba(201,162,39,0.15);color:#c9a227;border:1px solid rgba(201,162,39,0.3);border-radius:6px;font-size:12px;cursor:pointer">
          🧹 Vider tentatives ignorées
        </button>
      </div>
    </div>
  `}function B(){return`
    <div id="ax-vbio-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:18px">
      <div style="background:#161620;border:1px solid rgba(201,162,39,0.3);border-radius:14px;max-width:480px;width:100%;padding:22px">
        <h3 style="color:#c9a227;margin-top:0">🎙 Enrôlement vocal</h3>
        <p style="color:#ccc;font-size:13px;line-height:1.5">
          Je vais enregistrer 3 échantillons de ta voix (3 secondes chacun).
          Lis cette phrase chaque fois :
        </p>
        <div style="background:rgba(201,162,39,0.1);border-left:3px solid #c9a227;padding:12px 14px;margin:12px 0;border-radius:6px;color:#fff;font-style:italic;font-size:14px">
          "Apex, tu reconnais ma voix maintenant"
        </div>
        <div id="ax-vbio-enroll-status" style="color:#888;font-size:13px;margin:12px 0">État : prêt à enregistrer</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px">
          <button id="ax-vbio-record" style="flex:1;padding:12px;background:linear-gradient(135deg,#22cc77,#1a9a5a);color:#fff;border:0;border-radius:8px;font-weight:600;cursor:pointer;min-height:48px">
            🔴 Enregistrer (1/3)
          </button>
          <button id="ax-vbio-cancel" style="padding:12px 16px;background:rgba(255,102,102,0.15);color:#ff6666;border:1px solid rgba(255,102,102,0.3);border-radius:8px;font-weight:600;cursor:pointer;min-height:48px">
            Annuler
          </button>
        </div>
      </div>
    </div>
  `}async function T(e){if(typeof navigator>"u"||!navigator.mediaDevices?.getUserMedia)return u.warn("Micro non disponible sur ce navigateur"),null;try{const t=await navigator.mediaDevices.getUserMedia({audio:!0}),r=new MediaRecorder(t),i=[];return r.addEventListener("dataavailable",n=>{n.data.size>0&&i.push(n.data)}),await new Promise(n=>{r.addEventListener("stop",()=>{t.getTracks().forEach(s=>s.stop()),new Blob(i,{type:"audio/webm"}).arrayBuffer().then(async s=>{try{const o=window.AudioContext??window.webkitAudioContext;if(!o){n(null);return}const d=await new o().decodeAudioData(s);n(d)}catch{n(null)}})}),r.start(),setTimeout(()=>r.stop(),e)})}catch(t){const r=t instanceof Error?t.message:"erreur";return u.warn(`Micro refusé : ${r}`),null}}async function w(e,t,r){const i=document.createElement("div");i.innerHTML=B(),document.body.appendChild(i);const n=()=>{i.remove()},p=[],s=i.querySelector("#ax-vbio-record"),o=i.querySelector("#ax-vbio-cancel"),a=i.querySelector("#ax-vbio-enroll-status");x(r,o,"click",()=>{n(),u.warn("Enrôlement annulé")});let d=0;const c=async()=>{if(!s)return;s.disabled=!0,s.textContent="🎤 Enregistrement…",a&&(a.textContent=`Sample ${d+1}/3 en cours… parle maintenant !`);const g=await T(3e3);if(!g){s.disabled=!1,s.textContent=`🔴 Réessayer (${d+1}/3)`,a&&(a.textContent="⚠ Échec enregistrement");return}if(p.push(g),d++,d>=3){a&&(a.textContent="✓ 3 samples capturés. Calcul empreinte…");const f=await l.enroll(e,p);f.ok?(l.markCalibrated(e),u.success(`✅ Voix enrôlée — ${f.samples_count} samples, ${b(f.confidence_score??0)} fiabilité`),C.tap(),n(),await v(t)):(a&&(a.textContent=`❌ Échec : ${f.reason??"inconnu"}`),s.disabled=!1,s.textContent="🔴 Réessayer")}else s.disabled=!1,s.textContent=`🔴 Enregistrer (${d+1}/3)`,a&&(a.textContent=`✓ Sample ${d}/3 OK — clique pour le suivant`)};x(r,s,"click",()=>{c()})}async function v(e){if(!e){k.warn("voice-bio","render called without rootEl");return}m?.cleanup(),m=M("voice-bio");const t=m,r=z.get("user")?.id??"anon";if(!S("voice.biometric",e,r))return;const i=_();if(!i){e.innerHTML=`
      <div style="padding:40px;text-align:center;color:#888">
        <h2>🎙 Voice Bio</h2>
        <p>Connecte-toi pour gérer ton empreinte vocale.</p>
      </div>
    `;return}const n=`
    <div style="max-width:780px;margin:0 auto;padding:18px;font-family:system-ui,-apple-system,sans-serif">
      <h2 style="color:#c9a227;margin-top:0">🎙 Voice Bio — Reconnaissance vocale exclusive</h2>
      <p style="color:#aaa;line-height:1.5;font-size:14px">
        Apex apprend à reconnaître ta voix au fur et à mesure des messages vocaux que tu lui envoies.
        Plus tu parles, plus la fiabilité augmente (jusqu'à 20 samples pour 100%).
        Quand le mode exclusif est ON, Apex ignore silencieusement les voix qui ne sont pas la tienne.
      </p>

      ${D(i)}
      ${P(i)}
    </div>
  `;e.innerHTML=n;const p=e.querySelector("#ax-vbio-enroll-start");x(t,p,"click",()=>{w(i.id,e,t)});const s=e.querySelector("#ax-vbio-recalibrate");x(t,s,"click",()=>{w(i.id,e,t)});const o=e.querySelector("#ax-vbio-delete");x(t,o,"click",()=>{if(!confirm("Supprimer ton empreinte vocale ? Cette action est irréversible (RGPD Art. 17)."))return;l.deletePrint(i.id)?(u.success("🗑 Empreinte supprimée"),v(e)):u.warn("Échec suppression")});const a=e.querySelector("#ax-vbio-exclusive");x(t,a,"change",()=>{a&&(l.setExclusiveMode(a.checked),u.success(`Mode exclusif : ${a.checked?"ON":"OFF"}`))});const d=e.querySelector("#ax-vbio-exclusive-anticipated");x(t,d,"change",()=>{d&&(l.setExclusiveAnticipated(d.checked),u.success(`Mode exclusif anticipé : ${d.checked?"ON":"OFF"}`),v(e))});const c=e.querySelector("#ax-vbio-recalibrate-banner");if(x(t,c,"click",()=>{w(i.id,e,t)}),i.isAdmin){const g=e.querySelector("#ax-vbio-clear-unknown");x(t,g,"click",()=>{l.clearUnknownAttempts(),u.success("Tentatives ignorées effacées"),v(e)}),e.querySelectorAll(".ax-vbio-admin-del").forEach(f=>{x(t,f,"click",()=>{const h=f.dataset.uid;h&&confirm(`Supprimer empreinte de ${h} ?`)&&(l.deletePrint(h),u.success(`Empreinte ${h} supprimée`),v(e))})})}k.info("voice-bio",`rendered for ${i.id}${i.isAdmin?" (admin)":""}`)}export{Q as dispose,v as render};
