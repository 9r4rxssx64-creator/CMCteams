import{e as w}from"./escape-html-BlQj2yEF.js";import{c as z}from"./listener-cleanup-Y2rGGxxX.js";import{l as k,s as A}from"./monitoring-D2lWYrYo.js";import{g as S}from"./apex-tools-dispatch-core-C_k5h2yM.js";import{voicePrint as c}from"./voice-print-BYLFR8c7.js";import{haptic as C}from"./haptic-CQFg2PXZ.js";import{toast as u}from"./toast-CRdbcLoc.js";import"./multi-source-analyze-Bg1HHfSC.js";import"./apex-kb-D1VtWFD9.js";import"./credential-patterns-CLzI061R.js";import"./apex-tools-dispatch-skills-DOw4cI4G.js";import"./apex-tools-dispatch-data-DHUpGBCD.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-fNevKu6E.js";import"./apex-tools-misc-DBbScgMK.js";import"./apex-tools-registry-core-BMhHY4vU.js";import"./apex-tools-registry-skills-DRX4PPQ_.js";const M="kdmc_admin";let m=null;function X(){m?.cleanup(),m=null}function y(e){if(!e||e===0)return"—";const t=new Date(e),a=i=>i.toString().padStart(2,"0");return`${a(t.getDate())}/${a(t.getMonth()+1)}/${t.getFullYear()} ${a(t.getHours())}:${a(t.getMinutes())}`}function v(e){return Math.round(e*100)+"%"}function _(){const e=A.get("user");return!e||!e.id?null:{id:e.id,name:e.name??"",isAdmin:e.id===M}}function x(e,t,a,i){t&&e.bind(t,a,i)}function D(e){const t=Math.max(0,Math.min(1,e))*100,a=t>=85?"#22c55e":t>=50?"#ffa500":"#ff6666";return`
    <div style="background:rgba(40,40,55,0.5);border-radius:8px;height:18px;overflow:hidden;border:1px solid rgba(201,162,39,0.2)">
      <div style="height:100%;width:${t}%;background:linear-gradient(90deg,${a},${a}cc);transition:width .3s"></div>
    </div>
    <div style="font-size:11px;color:#aaa;margin-top:4px">${v(e)} fiabilité (${Math.round(t)}/100)</div>
  `}function q(e){const t=c.getPrintFor(e.id),a=c.needsCalibration(e.id),i=c.isExclusiveMode(),n=c.getPhaseDetails(e.id),l=c.isExclusiveAnticipated();if(!t)return`
      <div class="ax-gs-81">
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
    `;const s=t.confidence_score??0,r=t.samples_count,o=a.needs?`<div style="background:rgba(255,165,0,0.1);border:1px solid rgba(255,165,0,0.3);border-radius:8px;padding:10px 14px;margin:10px 0;color:#ffa500;font-size:13px">
         ⚠ <b>Calibration recommandée</b> — ${a.reason==="low_confidence"?"fiabilité < 85%":"dernière calibration > 30 jours"}.
         <button id="ax-vbio-recalibrate-banner" style="margin-left:8px;padding:6px 12px;background:#ffa500;color:#000;border:0;border-radius:6px;font-weight:600;cursor:pointer">Re-calibrer</button>
       </div>`:"",d=Math.round(n.progress*100),p=n.phase==="open"?"#9ca3af":n.phase==="learning"?"#facc15":n.phase==="refining"?"#fb923c":"#22c55e",b=n.samples_to_next>0?`<span style="color:#888;font-size:12px;margin-left:6px">(${n.samples_to_next} samples avant phase suivante)</span>`:'<span style="color:#22c55e;font-size:12px;margin-left:6px">(phase finale atteinte ✓)</span>',g=`
    <div style="background:rgba(15,15,28,0.5);border:1px solid ${p}33;border-radius:10px;padding:14px;margin:14px 0">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px">
        <div class="ax-gs-155">Apprentissage voix : ${r}/20 samples (${d}%)</div>
        <div style="background:${p}22;border:1px solid ${p}55;color:${p};font-size:12px;font-weight:700;padding:4px 10px;border-radius:14px">${w(n.label)}</div>
      </div>
      <div style="background:rgba(40,40,55,0.5);border-radius:8px;height:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.05)">
        <div style="height:100%;width:${Math.min(100,d)}%;background:linear-gradient(90deg,${p},${p}cc);transition:width .3s"></div>
      </div>
      <div style="font-size:12px;color:#aaa;margin-top:8px">
        Seuil actuel : <b>${Math.round(n.threshold*100)}%</b> de similarité requise${b}
      </div>
      ${l&&n.phase==="exclusive"&&r<20?'<div style="font-size:12px;color:#22c55e;margin-top:6px">⚡ Mode exclusif anticipé activé — phase exclusive forcée dès 10 samples</div>':""}
    </div>
  `;return`
    <div class="ax-gs-81">
      <h3 style="color:#c9a227;margin-top:0;margin-bottom:14px">🎙 Mon empreinte vocale</h3>

      <div class="ax-gs-177">
        <div>
          <div class="ax-gs-49">Échantillons</div>
          <div class="ax-gs-50">${r} <span style="font-size:13px;color:#888">/ 20</span></div>
        </div>
        <div>
          <div class="ax-gs-49">Score moyen</div>
          <div class="ax-gs-50">${v(t.match_score_avg)}</div>
        </div>
        <div>
          <div class="ax-gs-49">Dernière reconnaissance</div>
          <div class="ax-gs-178">${y(t.last_match)}</div>
        </div>
        <div>
          <div class="ax-gs-49">Enrôlée le</div>
          <div class="ax-gs-178">${y(t.enrolled_at)}</div>
        </div>
      </div>

      <div style="margin-bottom:14px">
        <div style="color:#888;font-size:12px;margin-bottom:6px">Fiabilité ("confidence"):</div>
        ${D(s)}
      </div>

      ${g}

      ${o}

      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px">
        <button id="ax-vbio-recalibrate" style="padding:10px 16px;background:rgba(201,162,39,0.15);color:#c9a227;border:1px solid rgba(201,162,39,0.3);border-radius:8px;font-weight:600;cursor:pointer;min-height:44px">
          🔄 Ré-enrôler ma voix
        </button>
        <button id="ax-vbio-delete" style="padding:10px 16px;background:rgba(255,102,102,0.15);color:#ff6666;border:1px solid rgba(255,102,102,0.3);border-radius:8px;font-weight:600;cursor:pointer;min-height:44px">
          🗑 Supprimer empreinte (RGPD)
        </button>
      </div>
    </div>

    <div class="ax-gs-81">
      <h3 style="color:#c9a227;margin-top:0;margin-bottom:10px">🔒 Mode exclusif</h3>
      <p style="color:#ccc;font-size:13px;line-height:1.5">
        Quand activé, Apex n'écoute QUE ta voix pour "Dis Apex". Ignore silencieusement
        les autres voix (entourage, bruit ambient) — anti-confusion.
      </p>
      <label style="display:flex;align-items:center;gap:10px;margin-top:10px;cursor:pointer">
        <input type="checkbox" id="ax-vbio-exclusive" aria-label="Activer mode reconnaissance vocale exclusive" ${i?"checked":""} style="width:20px;height:20px;cursor:pointer" />
        <span class="ax-gs-179">Mode exclusif activé (recommandé)</span>
      </label>
      <label style="display:flex;align-items:center;gap:10px;margin-top:14px;cursor:pointer;padding:10px 12px;background:rgba(34,197,94,0.06);border:1px dashed rgba(34,197,94,0.25);border-radius:8px">
        <input type="checkbox" id="ax-vbio-exclusive-anticipated" aria-label="Mode exclusif anticipé après 10 samples" ${l?"checked":""} style="width:20px;height:20px;cursor:pointer" />
        <span class="ax-gs-179">⚡ Mode exclusif anticipé</span>
      </label>
      <p style="color:#888;font-size:12px;line-height:1.4;margin:6px 0 0 32px">
        Si ON, Apex passe en phase exclusive (seuil 85%) dès 10 samples au lieu d'attendre 20.
        Plus rapide à devenir exclusif, mais moins de marge pour adapter.
      </p>
    </div>
  `}function P(e){if(!e.isAdmin)return"";const t=c.listPrints(),a=c.getStats(),i=c.getUnknownAttempts(),n=i.slice(-10).reverse(),l=t.map(r=>{const o=r.confidence_score??0;return`
        <tr style="border-top:1px solid rgba(255,255,255,0.05)">
          <td style="padding:8px 6px;color:#fff;font-weight:600">${w(r.uid)}${r.uid===M?" 👑":""}</td>
          <td style="padding:8px 6px;color:#aaa">${r.samples_count}</td>
          <td style="padding:8px 6px;color:${o>=.85?"#22c55e":o>=.5?"#ffa500":"#ff6666"}">${v(o)}</td>
          <td style="padding:8px 6px;color:#aaa;font-size:11px">${y(r.last_match)}</td>
          <td style="padding:8px 6px"><button data-uid="${w(r.uid)}" class="ax-vbio-admin-del" style="padding:4px 10px;background:rgba(255,102,102,0.15);color:#ff6666;border:1px solid rgba(255,102,102,0.3);border-radius:5px;font-size:11px;cursor:pointer">🗑</button></td>
        </tr>
      `}).join(""),s=n.map(r=>`
      <tr style="border-top:1px solid rgba(255,255,255,0.05)">
        <td style="padding:6px;color:#aaa;font-size:11px">${y(r.ts)}</td>
        <td style="padding:6px;color:#ff6666">${v(r.score)}</td>
        <td style="padding:6px;color:#aaa">${r.pitch} Hz</td>
        <td style="padding:6px;color:#aaa">${r.energy.toFixed(2)}</td>
      </tr>
    `).join("")||'<tr><td colspan="4" style="padding:14px;color:#666;text-align:center">Aucune tentative non reconnue récente</td></tr>';return`
    <div style="background:rgba(20,20,35,0.5);border:1px solid rgba(255,165,0,0.2);border-radius:12px;padding:18px;margin-bottom:14px">
      <h3 style="color:#ffa500;margin-top:0;margin-bottom:10px">👑 Vue admin Kevin</h3>

      <div class="ax-gs-177">
        <div>
          <div class="ax-gs-51">Voix enrôlées</div>
          <div style="color:#ffa500;font-size:22px;font-weight:700">${a.enrolled_count}</div>
        </div>
        <div>
          <div class="ax-gs-51">Total samples</div>
          <div class="ax-gs-50">${a.total_samples}</div>
        </div>
        <div>
          <div class="ax-gs-51">Score moyen global</div>
          <div class="ax-gs-50">${v(a.avg_match_score)}</div>
        </div>
        <div>
          <div class="ax-gs-51">Tentatives ignorées</div>
          <div style="color:#ff6666;font-size:22px;font-weight:700">${i.length}</div>
        </div>
      </div>

      <h4 style="color:#c9a227;margin:14px 0 8px">Voix enrôlées</h4>
      <div class="ax-gs-78">
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
          <tbody>${l||'<tr><td colspan="5" style="padding:14px;color:#666;text-align:center">Aucune voix enrôlée</td></tr>'}</tbody>
        </table>
      </div>

      <h4 style="color:#c9a227;margin:18px 0 8px">Tentatives non reconnues (10 dernières)</h4>
      <div class="ax-gs-78">
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
  `}async function T(e){if(typeof navigator>"u"||!navigator.mediaDevices?.getUserMedia)return u.warn("Micro non disponible sur ce navigateur"),null;try{const t=await navigator.mediaDevices.getUserMedia({audio:!0}),a=new MediaRecorder(t),i=[];return a.addEventListener("dataavailable",n=>{n.data.size>0&&i.push(n.data)}),await new Promise(n=>{a.addEventListener("stop",()=>{t.getTracks().forEach(s=>s.stop()),new Blob(i,{type:"audio/webm"}).arrayBuffer().then(async s=>{try{const r=window.AudioContext??window.webkitAudioContext;if(!r){n(null);return}const d=await new r().decodeAudioData(s);n(d)}catch{n(null)}})}),a.start(),setTimeout(()=>a.stop(),e)})}catch(t){const a=t instanceof Error?t.message:"erreur";return u.warn(`Micro refusé : ${a}`),null}}async function $(e,t,a){const i=document.createElement("div");i.innerHTML=B(),document.body.appendChild(i);const n=()=>{i.remove()},l=[],s=i.querySelector("#ax-vbio-record"),r=i.querySelector("#ax-vbio-cancel"),o=i.querySelector("#ax-vbio-enroll-status");x(a,r,"click",()=>{n(),u.warn("Enrôlement annulé")});let d=0;const p=async()=>{if(!s)return;s.disabled=!0,s.textContent="🎤 Enregistrement…",o&&(o.textContent=`Sample ${d+1}/3 en cours… parle maintenant !`);const b=await T(3e3);if(!b){s.disabled=!1,s.textContent=`🔴 Réessayer (${d+1}/3)`,o&&(o.textContent="⚠ Échec enregistrement");return}if(l.push(b),d++,d>=3){o&&(o.textContent="✓ 3 samples capturés. Calcul empreinte…");const g=await c.enroll(e,l);g.ok?(c.markCalibrated(e),u.success(`✅ Voix enrôlée — ${g.samples_count} samples, ${v(g.confidence_score??0)} fiabilité`),C.tap(),n(),await f(t)):(o&&(o.textContent=`❌ Échec : ${g.reason??"inconnu"}`),s.disabled=!1,s.textContent="🔴 Réessayer")}else s.disabled=!1,s.textContent=`🔴 Enregistrer (${d+1}/3)`,o&&(o.textContent=`✓ Sample ${d}/3 OK — clique pour le suivant`)};x(a,s,"click",()=>{p()})}async function f(e){if(!e){k.warn("voice-bio","render called without rootEl");return}m?.cleanup(),m=z("voice-bio");const t=m,a=A.get("user")?.id??"anon";if(!S("voice.biometric",e,a))return;const i=_();if(!i){e.innerHTML=`
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

      ${q(i)}
      ${P(i)}
    </div>
  `;e.innerHTML=n;const l=e.querySelector("#ax-vbio-enroll-start");x(t,l,"click",()=>{$(i.id,e,t)});const s=e.querySelector("#ax-vbio-recalibrate");x(t,s,"click",()=>{$(i.id,e,t)});const r=e.querySelector("#ax-vbio-delete");x(t,r,"click",()=>{if(!confirm("Supprimer ton empreinte vocale ? Cette action est irréversible (RGPD Art. 17)."))return;c.deletePrint(i.id)?(u.success("🗑 Empreinte supprimée"),f(e)):u.warn("Échec suppression")});const o=e.querySelector("#ax-vbio-exclusive");x(t,o,"change",()=>{o&&(c.setExclusiveMode(o.checked),u.success(`Mode exclusif : ${o.checked?"ON":"OFF"}`))});const d=e.querySelector("#ax-vbio-exclusive-anticipated");x(t,d,"change",()=>{d&&(c.setExclusiveAnticipated(d.checked),u.success(`Mode exclusif anticipé : ${d.checked?"ON":"OFF"}`),f(e))});const p=e.querySelector("#ax-vbio-recalibrate-banner");if(x(t,p,"click",()=>{$(i.id,e,t)}),i.isAdmin){const b=e.querySelector("#ax-vbio-clear-unknown");x(t,b,"click",()=>{c.clearUnknownAttempts(),u.success("Tentatives ignorées effacées"),f(e)}),e.querySelectorAll(".ax-vbio-admin-del").forEach(g=>{x(t,g,"click",()=>{const h=g.dataset.uid;h&&confirm(`Supprimer empreinte de ${h} ?`)&&(c.deletePrint(h),u.success(`Empreinte ${h} supprimée`),f(e))})})}k.info("voice-bio",`rendered for ${i.id}${i.isAdmin?" (admin)":""}`)}export{X as dispose,f as render};
