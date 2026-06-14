import{l as k,b as A,e as w}from"./monitoring-C7sftpn4.js";import{c as S}from"./listener-cleanup-Y2rGGxxX.js";import{voicePrint as c}from"./voice-print-B9pQjmH-.js";import{g as C}from"./apex-tools-dispatch-core-BPq73LTf.js";import{haptic as z}from"./haptic-CQFg2PXZ.js";import{toast as u}from"./toast-BCPNzfMv.js";import"./multi-source-analyze-Dv_gthsp.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-CAVT8pmi.js";import"./apex-tools-dispatch-skills-DVjI3JdQ.js";import"./apex-tools-dispatch-data-BGjavj7D.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-JpFFMu67.js";import"./apex-tools-misc-BOvWC8nX.js";import"./apex-tools-registry-core-BMhHY4vU.js";import"./apex-tools-registry-skills-x-mAWYry.js";const M="kdmc_admin";let m=null;function W(){m?.cleanup(),m=null}function y(e){if(!e||e===0)return"—";const i=new Date(e),a=t=>t.toString().padStart(2,"0");return`${a(i.getDate())}/${a(i.getMonth()+1)}/${i.getFullYear()} ${a(i.getHours())}:${a(i.getMinutes())}`}function b(e){return Math.round(e*100)+"%"}function _(){const e=A.get("user");return!e||!e.id?null:{id:e.id,name:e.name??"",isAdmin:e.id===M}}function x(e,i,a,t){i&&e.bind(i,a,t)}function D(e){const i=Math.max(0,Math.min(1,e))*100,a=i>=85?"#22c55e":i>=50?"#ffa500":"#ff6666";return`
    <div style="background:rgba(40,40,55,0.5);border-radius:8px;height:18px;overflow:hidden;border:1px solid rgba(201,162,39,0.2)">
      <div style="height:100%;width:${i}%;background:linear-gradient(90deg,${a},${a}cc);transition:width .3s"></div>
    </div>
    <div style="font-size:11px;color:#aaa;margin-top:4px">${b(e)} fiabilité (${Math.round(i)}/100)</div>
  `}function q(e){const i=c.getPrintFor(e.id),a=c.needsCalibration(e.id),t=c.isExclusiveMode(),s=c.getPhaseDetails(e.id),l=c.isExclusiveAnticipated();if(!i)return`
      <div class="ax-gs-81">
        <h3 class="ax-gs-480">🎙 Mon empreinte vocale</h3>
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
    `;const o=i.confidence_score??0,n=i.samples_count,r=a.needs?`<div style="background:rgba(255,165,0,0.1);border:1px solid rgba(255,165,0,0.3);border-radius:8px;padding:10px 14px;margin:10px 0;color:#ffa500;font-size:13px">
         ⚠ <b>Calibration recommandée</b> — ${a.reason==="low_confidence"?"fiabilité < 85%":"dernière calibration > 30 jours"}.
         <button id="ax-vbio-recalibrate-banner" style="margin-left:8px;padding:6px 12px;background:#ffa500;color:#000;border:0;border-radius:6px;font-weight:600;cursor:pointer">Re-calibrer</button>
       </div>`:"",d=Math.round(s.progress*100),p=s.phase==="open"?"#9ca3af":s.phase==="learning"?"#facc15":s.phase==="refining"?"#fb923c":"#22c55e",v=s.samples_to_next>0?`<span style="color:#888;font-size:12px;margin-left:6px">(${s.samples_to_next} samples avant phase suivante)</span>`:'<span style="color:#22c55e;font-size:12px;margin-left:6px">(phase finale atteinte ✓)</span>',g=`
    <div style="background:rgba(15,15,28,0.5);border:1px solid ${p}33;border-radius:10px;padding:14px;margin:14px 0">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px">
        <div class="ax-gs-155">Apprentissage voix : ${n}/20 samples (${d}%)</div>
        <div style="background:${p}22;border:1px solid ${p}55;color:${p};font-size:12px;font-weight:700;padding:4px 10px;border-radius:14px">${w(s.label)}</div>
      </div>
      <div style="background:rgba(40,40,55,0.5);border-radius:8px;height:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.05)">
        <div style="height:100%;width:${Math.min(100,d)}%;background:linear-gradient(90deg,${p},${p}cc);transition:width .3s"></div>
      </div>
      <div style="font-size:12px;color:#aaa;margin-top:8px">
        Seuil actuel : <b>${Math.round(s.threshold*100)}%</b> de similarité requise${v}
      </div>
      ${l&&s.phase==="exclusive"&&n<20?'<div style="font-size:12px;color:#22c55e;margin-top:6px">⚡ Mode exclusif anticipé activé — phase exclusive forcée dès 10 samples</div>':""}
    </div>
  `;return`
    <div class="ax-gs-81">
      <h3 style="color:#c9a227;margin-top:0;margin-bottom:14px">🎙 Mon empreinte vocale</h3>

      <div class="ax-gs-177">
        <div>
          <div class="ax-gs-49">Échantillons</div>
          <div class="ax-gs-50">${n} <span style="font-size:13px;color:#888">/ 20</span></div>
        </div>
        <div>
          <div class="ax-gs-49">Score moyen</div>
          <div class="ax-gs-50">${b(i.match_score_avg)}</div>
        </div>
        <div>
          <div class="ax-gs-49">Dernière reconnaissance</div>
          <div class="ax-gs-178">${y(i.last_match)}</div>
        </div>
        <div>
          <div class="ax-gs-49">Enrôlée le</div>
          <div class="ax-gs-178">${y(i.enrolled_at)}</div>
        </div>
      </div>

      <div style="margin-bottom:14px">
        <div style="color:#888;font-size:12px;margin-bottom:6px">Fiabilité ("confidence"):</div>
        ${D(o)}
      </div>

      ${g}

      ${r}

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
      <h3 class="ax-gs-480">🔒 Mode exclusif</h3>
      <p class="ax-gs-481">
        Quand activé, Apex n'écoute QUE ta voix pour "Dis Apex". Ignore silencieusement
        les autres voix (entourage, bruit ambient) — anti-confusion.
      </p>
      <label style="display:flex;align-items:center;gap:10px;margin-top:10px;cursor:pointer">
        <input type="checkbox" id="ax-vbio-exclusive" aria-label="Activer mode reconnaissance vocale exclusive" ${t?"checked":""} class="ax-gs-439" />
        <span class="ax-gs-179">Mode exclusif activé (recommandé)</span>
      </label>
      <label style="display:flex;align-items:center;gap:10px;margin-top:14px;cursor:pointer;padding:10px 12px;background:rgba(34,197,94,0.06);border:1px dashed rgba(34,197,94,0.25);border-radius:8px">
        <input type="checkbox" id="ax-vbio-exclusive-anticipated" aria-label="Mode exclusif anticipé après 10 samples" ${l?"checked":""} class="ax-gs-439" />
        <span class="ax-gs-179">⚡ Mode exclusif anticipé</span>
      </label>
      <p style="color:#888;font-size:12px;line-height:1.4;margin:6px 0 0 32px">
        Si ON, Apex passe en phase exclusive (seuil 85%) dès 10 samples au lieu d'attendre 20.
        Plus rapide à devenir exclusif, mais moins de marge pour adapter.
      </p>
    </div>
  `}function P(e){if(!e.isAdmin)return"";const i=c.listPrints(),a=c.getStats(),t=c.getUnknownAttempts(),s=t.slice(-10).reverse(),l=i.map(n=>{const r=n.confidence_score??0;return`
        <tr class="ax-gs-261">
          <td style="padding:8px 6px;color:#fff;font-weight:600">${w(n.uid)}${n.uid===M?" 👑":""}</td>
          <td style="padding:8px 6px;color:#aaa">${n.samples_count}</td>
          <td style="padding:8px 6px;color:${r>=.85?"#22c55e":r>=.5?"#ffa500":"#ff6666"}">${b(r)}</td>
          <td style="padding:8px 6px;color:#aaa;font-size:11px">${y(n.last_match)}</td>
          <td class="ax-gs-276"><button data-uid="${w(n.uid)}" class="ax-vbio-admin-del" style="padding:4px 10px;background:rgba(255,102,102,0.15);color:#ff6666;border:1px solid rgba(255,102,102,0.3);border-radius:5px;font-size:11px;cursor:pointer">🗑</button></td>
        </tr>
      `}).join(""),o=s.map(n=>`
      <tr class="ax-gs-261">
        <td style="padding:6px;color:#aaa;font-size:11px">${y(n.ts)}</td>
        <td style="padding:6px;color:#ff6666">${b(n.score)}</td>
        <td class="ax-gs-482">${n.pitch} Hz</td>
        <td class="ax-gs-482">${n.energy.toFixed(2)}</td>
      </tr>
    `).join("")||'<tr><td colspan="4" class="ax-gs-483">Aucune tentative non reconnue récente</td></tr>';return`
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
          <div class="ax-gs-50">${b(a.avg_match_score)}</div>
        </div>
        <div>
          <div class="ax-gs-51">Tentatives ignorées</div>
          <div style="color:#ff6666;font-size:22px;font-weight:700">${t.length}</div>
        </div>
      </div>

      <h4 style="color:#c9a227;margin:14px 0 8px">Voix enrôlées</h4>
      <div class="ax-gs-78">
        <table class="ax-gs-271">
          <thead>
            <tr class="ax-gs-262">
              <th class="ax-gs-484">User ID</th>
              <th class="ax-gs-484">Samples</th>
              <th class="ax-gs-484">Confidence</th>
              <th class="ax-gs-484">Dernière reco</th>
              <th class="ax-gs-484">Actions</th>
            </tr>
          </thead>
          <tbody>${l||'<tr><td colspan="5" class="ax-gs-483">Aucune voix enrôlée</td></tr>'}</tbody>
        </table>
      </div>

      <h4 style="color:#c9a227;margin:18px 0 8px">Tentatives non reconnues (10 dernières)</h4>
      <div class="ax-gs-78">
        <table class="ax-gs-271">
          <thead>
            <tr class="ax-gs-262">
              <th class="ax-gs-485">Date</th>
              <th class="ax-gs-485">Score similarity</th>
              <th class="ax-gs-485">Pitch</th>
              <th class="ax-gs-485">Energie</th>
            </tr>
          </thead>
          <tbody>${o}</tbody>
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
        <h3 class="ax-gs-486">🎙 Enrôlement vocal</h3>
        <p class="ax-gs-481">
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
  `}async function T(e){if(typeof navigator>"u"||!navigator.mediaDevices?.getUserMedia)return u.warn("Micro non disponible sur ce navigateur"),null;try{const i=await navigator.mediaDevices.getUserMedia({audio:!0}),a=new MediaRecorder(i),t=[];return a.addEventListener("dataavailable",s=>{s.data.size>0&&t.push(s.data)}),await new Promise(s=>{a.addEventListener("stop",()=>{i.getTracks().forEach(o=>o.stop()),new Blob(t,{type:"audio/webm"}).arrayBuffer().then(async o=>{try{const n=window.AudioContext??window.webkitAudioContext;if(!n){s(null);return}const d=await new n().decodeAudioData(o);s(d)}catch{s(null)}})}),a.start(),setTimeout(()=>a.stop(),e)})}catch(i){const a=i instanceof Error?i.message:"erreur";return u.warn(`Micro refusé : ${a}`),null}}async function $(e,i,a){const t=document.createElement("div");t.innerHTML=B(),document.body.appendChild(t);const s=()=>{t.remove()},l=[],o=t.querySelector("#ax-vbio-record"),n=t.querySelector("#ax-vbio-cancel"),r=t.querySelector("#ax-vbio-enroll-status");x(a,n,"click",()=>{s(),u.warn("Enrôlement annulé")});let d=0;const p=async()=>{if(!o)return;o.disabled=!0,o.textContent="🎤 Enregistrement…",r&&(r.textContent=`Sample ${d+1}/3 en cours… parle maintenant !`);const v=await T(3e3);if(!v){o.disabled=!1,o.textContent=`🔴 Réessayer (${d+1}/3)`,r&&(r.textContent="⚠ Échec enregistrement");return}if(l.push(v),d++,d>=3){r&&(r.textContent="✓ 3 samples capturés. Calcul empreinte…");const g=await c.enroll(e,l);g.ok?(c.markCalibrated(e),u.success(`✅ Voix enrôlée — ${g.samples_count} samples, ${b(g.confidence_score??0)} fiabilité`),z.tap(),s(),await f(i)):(r&&(r.textContent=`❌ Échec : ${g.reason??"inconnu"}`),o.disabled=!1,o.textContent="🔴 Réessayer")}else o.disabled=!1,o.textContent=`🔴 Enregistrer (${d+1}/3)`,r&&(r.textContent=`✓ Sample ${d}/3 OK — clique pour le suivant`)};x(a,o,"click",()=>{p()})}async function f(e){if(!e){k.warn("voice-bio","render called without rootEl");return}m?.cleanup(),m=S("voice-bio");const i=m,a=A.get("user")?.id??"anon";if(!C("voice.biometric",e,a))return;const t=_();if(!t){e.innerHTML=`
      <div style="padding:40px;text-align:center;color:#888">
        <h2>🎙 Voice Bio</h2>
        <p>Connecte-toi pour gérer ton empreinte vocale.</p>
      </div>
    `;return}const s=`
    <div style="max-width:780px;margin:0 auto;padding:18px;font-family:system-ui,-apple-system,sans-serif">
      <h2 class="ax-gs-486">🎙 Voice Bio — Reconnaissance vocale exclusive</h2>
      <p class="ax-gs-340">
        Apex apprend à reconnaître ta voix au fur et à mesure des messages vocaux que tu lui envoies.
        Plus tu parles, plus la fiabilité augmente (jusqu'à 20 samples pour 100%).
        Quand le mode exclusif est ON, Apex ignore silencieusement les voix qui ne sont pas la tienne.
      </p>

      ${q(t)}
      ${P(t)}
    </div>
  `;e.innerHTML=s;const l=e.querySelector("#ax-vbio-enroll-start");x(i,l,"click",()=>{$(t.id,e,i)});const o=e.querySelector("#ax-vbio-recalibrate");x(i,o,"click",()=>{$(t.id,e,i)});const n=e.querySelector("#ax-vbio-delete");x(i,n,"click",()=>{if(!confirm("Supprimer ton empreinte vocale ? Cette action est irréversible (RGPD Art. 17)."))return;c.deletePrint(t.id)?(u.success("🗑 Empreinte supprimée"),f(e)):u.warn("Échec suppression")});const r=e.querySelector("#ax-vbio-exclusive");x(i,r,"change",()=>{r&&(c.setExclusiveMode(r.checked),u.success(`Mode exclusif : ${r.checked?"ON":"OFF"}`))});const d=e.querySelector("#ax-vbio-exclusive-anticipated");x(i,d,"change",()=>{d&&(c.setExclusiveAnticipated(d.checked),u.success(`Mode exclusif anticipé : ${d.checked?"ON":"OFF"}`),f(e))});const p=e.querySelector("#ax-vbio-recalibrate-banner");if(x(i,p,"click",()=>{$(t.id,e,i)}),t.isAdmin){const v=e.querySelector("#ax-vbio-clear-unknown");x(i,v,"click",()=>{c.clearUnknownAttempts(),u.success("Tentatives ignorées effacées"),f(e)}),e.querySelectorAll(".ax-vbio-admin-del").forEach(g=>{x(i,g,"click",()=>{const h=g.dataset.uid;h&&confirm(`Supprimer empreinte de ${h} ?`)&&(c.deletePrint(h),u.success(`Empreinte ${h} supprimée`),f(e))})})}k.info("voice-bio",`rendered for ${t.id}${t.isAdmin?" (admin)":""}`)}export{W as dispose,f as render};
